import { pollLookup } from "@/lib/linkedin-flow";
import { workerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** GET ?t=<token> → pending | found | not_found. The browser polls every ~2 s. */
export async function GET(request: Request) {
  const env = await workerEnv();
  if (!env?.APIFY_TOKEN || !env.LINK_SECRET) return Response.json({ state: "error", message: "Lookup is offline." }, { status: 503 });
  try {
    const reply = await pollLookup({ apify: env.APIFY_TOKEN, secret: env.LINK_SECRET }, new URL(request.url).searchParams.get("t"));
    return Response.json(reply, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    console.error("[linkedin/poll]", error);
    return Response.json({ state: "error", message: "We couldn't reach LinkedIn just now." }, { status: 502 });
  }
}
