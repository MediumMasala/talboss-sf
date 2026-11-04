/** The Worker's bindings and secrets, or null outside Cloudflare (and outside `next dev` with OpenNext). */
export async function workerEnv(): Promise<CloudflareEnv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env ?? null;
  } catch {
    return null;
  }
}

export const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

/** A small JSON body as an object, or null (bad JSON, not an object, or over `max` bytes). */
export async function readJson(request: Request, max = 32_000): Promise<Record<string, unknown> | null> {
  if (Number(request.headers.get("content-length") ?? 0) > max) return null;
  try {
    const text = await request.text();
    if (text.length > max) return null;
    const v = JSON.parse(text);
    return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
