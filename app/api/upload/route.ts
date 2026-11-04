import { randomUUID } from "node:crypto";
import { site } from "@/content/site";
import { getStorage, type Application, type ResumeSubmission } from "@/lib/storage";
import { extractContact } from "@/lib/extract";
import { checkResumeFile } from "@/lib/validation";

const { errors, maxBytes } = site.upload;

/** Multipart overhead allowance on top of the file itself. */
const MAX_REQUEST_BYTES = maxBytes + 256 * 1024;

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

function fail(status: number, error: string) {
  return Response.json({ ok: false, error }, { status });
}

const WORK_AUTH = new Set(["citizen", "green_card", "visa_no_sponsorship", "needs_sponsorship", "outside_us"]);

/** The Tal Select details sent with the resume. Everything is trimmed; nothing here is trusted for logic. */
function readApplication(raw: unknown): Application | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const str = (k: string, n = 120) => (typeof r[k] === "string" ? (r[k] as string).trim().slice(0, n) : "");
  const name = str("name"), company = str("company"), designation = str("designation");
  if (!name || !company) return null;
  const status = str("linkedinStatus");
  const url = str("linkedinUrl", 300);
  return {
    program: "tal-select-us",
    name,
    company,
    designation,
    linkedinUrl: /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\//i.test(url) ? url : null,
    linkedinStatus: status === "confirmed" || status === "typed" ? status : "skipped",
    // Keep the confirmed card only if it's a sane size; never drop the application over it.
    linkedinProfile: r.linkedinProfile && typeof r.linkedinProfile === "object" && JSON.stringify(r.linkedinProfile).length < 20_000 ? r.linkedinProfile : null,
    workAuth: WORK_AUTH.has(str("workAuth")) ? str("workAuth") : null,
  };
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

  let application: Application | null = null;
  try {
    application = readApplication(parseJson(form.get("application")));
  } catch {
    application = null;
  }

  try {
    await (await getStorage()).save(submission, bytes, application);
  } catch (error) {
    console.error("[upload] storage failed", error);
    return fail(500, errors.server);
  }

  return Response.json({ ok: true, id: submission.id, email: contact.email });
}
