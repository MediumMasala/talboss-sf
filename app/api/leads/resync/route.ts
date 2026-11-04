import { cloudflareEnv } from "@/lib/storage";
import { cookieFrom, leadsAllowed, pendingCount, resyncPending } from "@/lib/leads";

export const dynamic = "force-dynamic";

const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

/**
 * Push every lead the Google Sheet hasn't confirmed (sheet_pending = 1), oldest first, up to 500 per call.
 * POST from the "Resync sheet" button (leads cookie) or `curl -X POST '/api/leads/resync?key=LEADS_KEY'`.
 * GET with ?key= does the same, for a quick check from a browser.
 */
async function handle(request: Request) {
  const env = await cloudflareEnv();
  const key = new URL(request.url).searchParams.get("key");
  if (!env || !(await leadsAllowed(env, { key, cookie: cookieFrom(request) }))) return new Response("Not found", { status: 404 });
  if (!env.LEADS_WEBHOOK_URL || !env.LEADS_WEBHOOK_SECRET) {
    return reply({ ok: false, error: "The sheet isn't connected yet: set LEADS_WEBHOOK_URL and LEADS_WEBHOOK_SECRET.", pending: await pendingCount(env) }, 503);
  }
  const result = await resyncPending(env, new URL(request.url).origin);
  return reply(
    result.ok ? result : { ...result, error: "The sheet didn't accept the push. Check the Apps Script deployment and secret." },
    result.ok ? 200 : 502,
  );
}

export async function POST(request: Request) {
  // The button sends JSON, which a cross-site form can't.
  if (!new URL(request.url).searchParams.get("key") && !(request.headers.get("content-type") ?? "").startsWith("application/json")) {
    return reply({ ok: false, error: "Send JSON." }, 415);
  }
  return handle(request);
}

export async function GET(request: Request) {
  if (!new URL(request.url).searchParams.get("key")) return new Response("Not found", { status: 404 });
  return handle(request);
}
