import { allow } from "@/lib/linkedin";
import { draftPitch, readFacts } from "@/lib/pitch";
import { clientIp, readJson, workerEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

/** Gemini calls per IP per hour (each typed `answer` re-drafts). Past it, the template line is returned (still a 200). */
const PITCH_LIMIT = 30;

/** POST { name, company, role, profile?, answer? } → { pitch, source: "ai" | "fallback", needsMore }. Answers in under ~4 s. */
export async function POST(request: Request) {
  const headers = { "cache-control": "no-store" };
  const read = readFacts(await readJson(request));
  if (!read) return Response.json({ error: "Add a name and company to draft an intro." }, { status: 400, headers });
  const env = await workerEnv();
  const aiAllowed = () => allow(env?.RESUMES, "pitch", clientIp(request), PITCH_LIMIT).catch(() => true);
  const reply = await draftPitch({ key: env?.GEMINI_API_KEY, kv: env?.RESUMES, facts: read.facts, slug: read.slug, aiAllowed });
  return Response.json(reply, { headers });
}
