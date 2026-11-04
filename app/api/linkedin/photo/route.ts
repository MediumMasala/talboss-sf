import { readPhotoLink, sha } from "@/lib/linkedin";
import { workerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const MAX_BYTES = 1_000_000;
const KV_TTL = 6 * 3600; // the lookup's lifetime

/**
 * GET ?u=<b64url photo URL>&s=<mac> → the person's LinkedIn photo, fetched once and kept in KV for 6 h.
 * Only links signed by /api/linkedin/poll work, and only for media.licdn.com, so this is not an open proxy.
 */
export async function GET(request: Request) {
  const env = await workerEnv();
  const q = new URL(request.url).searchParams;
  const url = env?.LINK_SECRET ? await readPhotoLink(env.LINK_SECRET, q.get("u"), q.get("s")) : null;
  if (!url) return new Response("Not found", { status: 404 });

  const headers = { "cache-control": "private, max-age=3600", "x-robots-tag": "noindex", "x-content-type-options": "nosniff" };
  const key = `li:img:${await sha(url)}`;
  const kv = env?.RESUMES;
  const hit = kv ? await kv.getWithMetadata<{ type?: string }>(key, "arrayBuffer").catch(() => null) : null;
  if (hit?.value) return new Response(hit.value, { headers: { ...headers, "content-type": hit.metadata?.type ?? "image/jpeg" } });

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5_000) });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return new Response("Not found", { status: 404 });
    const body = await res.arrayBuffer();
    if (body.byteLength > MAX_BYTES) return new Response("Not found", { status: 404 });
    if (kv) await kv.put(key, body, { expirationTtl: KV_TTL, metadata: { type } }).catch(() => {});
    return new Response(body, { headers: { ...headers, "content-type": type } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
