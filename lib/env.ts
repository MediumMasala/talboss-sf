import { nodeEnv, useNodeBindings } from "./node-bindings";

/**
 * The Worker's bindings and secrets, or null outside Cloudflare (and outside `next dev` with OpenNext).
 * On a Node server with DATA_DIR set (Railway), the same shape built from SQLite + process.env (lib/node-bindings.ts).
 */
export async function workerEnv(): Promise<CloudflareEnv | null> {
  if (useNodeBindings()) return nodeEnv();
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env ?? null;
  } catch {
    return null;
  }
}

/**
 * Keep `task` running after the response is sent (ctx.waitUntil on Workers). Outside Workers it just runs: a Node
 * server stays up after the reply, so the promise finishes on its own (fire-and-forget, failures logged).
 */
export async function waitUntil(task: Promise<unknown>): Promise<void> {
  const safe = task.catch((error) => console.error("[waitUntil] background task failed", error instanceof Error ? error.message : "unknown"));
  if (useNodeBindings()) return;
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { ctx } = await getCloudflareContext({ async: true });
    if (ctx?.waitUntil) return ctx.waitUntil(safe);
  } catch {}
}

/**
 * The visitor's IP, the key for the lookup rate limits. Cloudflare sets cf-connecting-ip; Railway's edge sets
 * x-real-ip (the address it saw) and appends to x-forwarded-for, whose first entry a client can forge.
 */
export const clientIp = (request: Request) =>
  request.headers.get("cf-connecting-ip") ||
  request.headers.get("x-real-ip")?.trim() ||
  request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  "local";

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
