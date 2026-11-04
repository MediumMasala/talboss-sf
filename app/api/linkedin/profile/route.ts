import { rejectProfile } from "@/lib/linkedin-flow";
import { readJson, workerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** POST { next } → "No, that's not me": returns a token whose next poll shows the next most likely profile. */
export async function POST(request: Request) {
  const env = await workerEnv();
  const headers = { "cache-control": "no-store" };
  if (!env?.APIFY_TOKEN || !env.LINK_SECRET) return Response.json({ state: "not_found", next: null }, { headers });
  const body = await readJson(request);
  const next = typeof body?.next === "string" && body.next.length < 8000 ? body.next : null;
  try {
    return Response.json(await rejectProfile({ apify: env.APIFY_TOKEN, secret: env.LINK_SECRET, kv: env.RESUMES }, next), { headers });
  } catch (error) {
    console.error("[linkedin/profile]", error instanceof Error ? error.message : "failed");
    return Response.json({ state: "not_found", next: null }, { headers });
  }
}
