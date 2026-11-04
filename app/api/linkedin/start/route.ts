import { allowLookup, cleanInput, slugFromUrl } from "@/lib/linkedin";
import { startFromSlug, startLookup } from "@/lib/linkedin-flow";
import { clientIp, workerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** POST { name, company, role, url? } → starts the LinkedIn lookup and returns a signed token to poll. */
export async function POST(request: Request) {
  const env = await workerEnv();
  if (!env?.APIFY_TOKEN || !env.LINK_SECRET) return Response.json({ state: "error", message: "Lookup is offline. Add your LinkedIn link instead." }, { status: 503 });

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const input = cleanInput(body);
  if (!input) return Response.json({ state: "error", message: "Add your full name and company." }, { status: 400 });

  if (!(await allowLookup(env.RESUMES, clientIp(request)))) {
    return Response.json({ state: "error", message: "Too many lookups from here. Paste your LinkedIn link instead." }, { status: 429 });
  }

  const keys = { apify: env.APIFY_TOKEN, secret: env.LINK_SECRET };
  try {
    const slug = typeof body?.url === "string" ? slugFromUrl(body.url) : null;
    return Response.json(slug ? await startFromSlug(keys, input, slug) : await startLookup(keys, input));
  } catch (error) {
    console.error("[linkedin/start]", error);
    return Response.json({ state: "error", message: "We couldn't reach LinkedIn just now." }, { status: 502 });
  }
}
