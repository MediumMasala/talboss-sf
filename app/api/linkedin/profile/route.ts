import { rejectProfile } from "@/lib/linkedin-flow";
import { workerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** POST { next } → "No, that's not me": pulls the next most likely profile. */
export async function POST(request: Request) {
  const env = await workerEnv();
  if (!env?.APIFY_TOKEN || !env.LINK_SECRET) return Response.json({ state: "not_found", next: null });
  const body = (await request.json().catch(() => null)) as { next?: string } | null;
  try {
    return Response.json(await rejectProfile({ apify: env.APIFY_TOKEN, secret: env.LINK_SECRET }, body?.next ?? null));
  } catch (error) {
    console.error("[linkedin/profile]", error);
    return Response.json({ state: "not_found", next: null });
  }
}
