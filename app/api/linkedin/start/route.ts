import { cleanInput, slugFromUrl, type InputProblem } from "@/lib/linkedin";
import { gateSearch, gateUrl } from "@/lib/limits";
import { startFromSlug, startLookup } from "@/lib/linkedin-flow";
import { clientIp, readJson, workerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

const PROBLEMS: Record<InputProblem, string> = {
  missing: "Add your full name and company.",
  name: "That doesn't look like a name. Use the name on your LinkedIn.",
  company: "Add the company you work at.",
};

const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "cache-control": "no-store" } });

/**
 * POST { name, company, role?, url?, token?, partial? } → starts (or joins) the LinkedIn lookup; returns a signed token to poll.
 * Prefetch: call it at A2 with name + company only, then again at A3 with the title and the A2 reply's `token`: the
 * second call attaches to the first's searches (nothing paid or counted twice). See docs/team/LOOKUP_PREFETCH.md.
 */
export async function POST(request: Request) {
  const env = await workerEnv();
  if (!env?.APIFY_TOKEN || !env.LINK_SECRET) return reply({ state: "error", message: "Lookup is offline. Paste your LinkedIn link instead." }, 503);

  const body = await readJson(request);
  const checked = cleanInput(body);
  if (!checked.ok) return reply({ state: "error", message: PROBLEMS[checked.problem] }, 400);

  const rawUrl = typeof body?.url === "string" ? body.url.trim().slice(0, 300) : "";
  const slug = rawUrl ? slugFromUrl(rawUrl) : null;
  if (rawUrl && !slug) return reply({ state: "error", message: "That isn't a LinkedIn profile link. It should look like linkedin.com/in/your-name." }, 400);

  const keys = { apify: env.APIFY_TOKEN, secret: env.LINK_SECRET, kv: env.RESUMES };
  const token = typeof body?.token === "string" && body.token.length < 8000 ? body.token : null;
  const partial = body?.partial === true;
  const ip = clientIp(request);
  try {
    // Limits are checked only when a paid run is about to start, so cached lookups never count.
    const result = slug
      ? await startFromSlug(keys, checked.input, slug, () => gateUrl(env.RESUMES, ip))
      : await startLookup(keys, checked.input, () => gateSearch(env.RESUMES, ip, checked.input), { token, partial });
    if (result.state === "error" && result.code) {
      return Response.json(result, { status: 429, headers: { "cache-control": "no-store", "retry-after": String(result.retryAfter ?? 3600) } });
    }
    return reply(result);
  } catch (error) {
    console.error("[linkedin/start]", error instanceof Error ? error.message : "failed");
    return reply({ state: "error", message: "We couldn't reach LinkedIn just now. Paste your link, or skip this step." }, 502);
  }
}
