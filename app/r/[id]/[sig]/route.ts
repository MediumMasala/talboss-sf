import { cloudflareEnv, resumeKey } from "@/lib/storage";
import { verifyResumeSig } from "@/lib/signing";

/** Open one resume from its signed link in the Google Sheet: /r/<id>/<sig>. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; sig: string }> }) {
  const env = await cloudflareEnv();
  const { id, sig } = await params;
  if (!env?.LINK_SECRET || !(await verifyResumeSig(env.LINK_SECRET, id, sig))) {
    return new Response("Not found", { status: 404 });
  }

  const { value, metadata } = await env.RESUMES.getWithMetadata<{ name?: string; type?: string }>(resumeKey(id), "arrayBuffer");
  if (!value) return new Response("Not found", { status: 404 });

  const name = (metadata?.name ?? `resume-${id}`).replace(/[^\w.\- ]+/g, "_");
  return new Response(value, {
    headers: {
      "content-type": metadata?.type || "application/octet-stream",
      // PDFs open right in the browser tab; DOCX files download.
      "content-disposition": `inline; filename="${name}"`,
      "cache-control": "private, no-store",
      "x-robots-tag": "noindex",
    },
  });
}
