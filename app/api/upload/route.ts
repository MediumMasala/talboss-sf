import { randomUUID } from "node:crypto";
import { site } from "@/content/site";
import { getStorage, type ResumeSubmission } from "@/lib/storage";
import { extractContact } from "@/lib/extract";
import { checkResumeFile } from "@/lib/validation";

const { errors, maxBytes } = site.upload;

/** Multipart overhead allowance on top of the file itself. */
const MAX_REQUEST_BYTES = maxBytes + 256 * 1024;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

function fail(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

function parseJson(value: FormDataEntryValue | null): unknown {
  if (typeof value !== "string") return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/** Check the first bytes so a renamed .png can't pass as a resume. PDF = "%PDF", DOCX = zip "PK\x03\x04". */
function hasResumeSignature(bytes: Uint8Array, ext: string): boolean {
  const ascii = (n: number) => String.fromCharCode(...bytes.subarray(0, n));
  if (ext === ".pdf") return ascii(1024).includes("%PDF");
  if (ext === ".docx") return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  return false;
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_REQUEST_BYTES) return fail(413, errors.tooBigForServer);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, errors.server);
  }

  // Honeypot: real people never see this field. Pretend it worked.
  if (form.get("company_website")) return Response.json({ ok: true, id: "ok" });

  const file = form.get("resume");
  if (!(file instanceof File)) return fail(400, errors.wrongType(""));

  const check = checkResumeFile(file);
  if (!check.ok) return fail(check.reason === "size" ? 413 : 400, check.message);

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!hasResumeSignature(bytes, check.ext)) return fail(400, errors.corrupt);

  // No form: read the email and LinkedIn off the resume itself.
  const contact = await extractContact(bytes, check.ext);

  const utmRaw = parseJson(form.get("utm"));
  const utm: Record<string, string> = {};
  if (utmRaw && typeof utmRaw === "object") {
    for (const key of UTM_KEYS) {
      const value = (utmRaw as Record<string, unknown>)[key];
      if (typeof value === "string" && value) utm[key] = value.slice(0, 200);
    }
  }

  const submission: ResumeSubmission = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    email: contact.email ?? "",
    linkedin: contact.linkedin,
    file: { name: file.name.slice(0, 200), type: file.type, size: file.size, ext: check.ext },
    meta: {
      userAgent: request.headers.get("user-agent"),
      referrer: request.headers.get("referer"),
      utm,
    },
    consent: { privacy: site.legal.privacyUrl, terms: site.legal.termsUrl },
  };

  try {
    await (await getStorage()).save(submission, bytes);
  } catch (error) {
    console.error("[upload] storage failed", error);
    return fail(500, errors.server);
  }

  return Response.json({ ok: true, id: submission.id, email: contact.email });
}
