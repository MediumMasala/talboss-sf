import { pollLookup } from "@/lib/linkedin-flow";
import { workerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** GET ?t=<token> → pending | found | not_found | error. The browser polls every ~2 s. */
export async function GET(request: Request) {
  const env = await workerEnv();
  const headers = { "cache-control": "no-store" };
  if (!env?.APIFY_TOKEN || !env.LINK_SECRET) return Response.json({ state: "error", message: "Lookup is offline." }, { status: 503, headers });
  const token = new URL(request.url).searchParams.get("t");
  if (!token || token.length > 8000) return Response.json({ state: "error", message: "This lookup expired. Start again." }, { status: 400, headers });
  try {
    return Response.json(await pollLookup({ apify: env.APIFY_TOKEN, secret: env.LINK_SECRET, kv: env.RESUMES }, token), { headers });
  } catch (error) {
    // Transient (Apify slow or down). The browser keeps polling on its own schedule; this one poll failed.
    console.error("[linkedin/poll]", error instanceof Error ? error.message : "failed");
    return Response.json({ state: "error", message: "We couldn't reach LinkedIn just now." }, { status: 502, headers });
  }
}
