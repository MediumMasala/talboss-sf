import { cloudflareEnv, resumeKey } from "@/lib/storage";
import { verifyResumeSig } from "@/lib/signing";

const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/**
 * Open one resume from its signed link (the sheet, the CSV, /leads): /r/<id>/<sig>.
 * The signature is HMAC(LINK_SECRET, id) with no expiry, so links stay valid as long as LINK_SECRET does.
 * PDFs open in the browser tab; DOCX files download. `?dl=1` always downloads.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string; sig: string }> }) {
  const env = await cloudflareEnv();
  const { id, sig } = await params;
  if (!env?.LINK_SECRET || !(await verifyResumeSig(env.LINK_SECRET, id, sig))) {
    return new Response("Not found", { status: 404 });
  }

  const { value, metadata } = await env.RESUMES.getWithMetadata<{ name?: string; type?: string }>(resumeKey(id), "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });

  const original = metadata?.name || `resume-${id}.pdf`;
  const ext = original.toLowerCase().split(".").pop() ?? "";
  // Phones often label .docx vaguely; the upload checked the real bytes, so the extension decides the type.
  const type = TYPES[ext] ?? (metadata?.type || "application/octet-stream");
  const ascii = original.replace(/[^\w.\- ]+/g, "_");
  const download = new URL(request.url).searchParams.get("dl") === "1" || ext !== "pdf";
  return new Response(value, {
    headers: {
      "content-type": type,
      "content-disposition": `${download ? "attachment" : "inline"}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(original)}`,
      "content-length": String(value.byteLength),
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
      "x-robots-tag": "noindex",
    },
  });
}
