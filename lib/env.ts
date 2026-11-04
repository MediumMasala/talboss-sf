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
