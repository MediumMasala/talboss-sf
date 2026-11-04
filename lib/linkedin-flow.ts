/**
 * The lookup state machine behind /api/linkedin/*. One signed token travels with the browser:
 * search → (people) → profile → found | not_found. "No, not me" walks to the next slug.
 */
import {
  getRun, items, peopleInput, profileInput, readToken, scoreProfile, searchInput, shapeProfile, signToken,
  slugsFromPeople, slugsFromSerp, startRun, type LookupInput, type Profile, type RunToken, type Stage,
} from "./linkedin";

export type LookupReply =
  | { state: "pending"; stage: Stage; token: string }
  | { state: "found"; profile: Profile; next: string | null }
  | { state: "not_found"; next: null }
  | { state: "error"; message: string };

type Keys = { apify: string; secret: string };
const TTL = 15 * 60_000;
const MIN_SCORE = 0.35;

async function begin(keys: Keys, stage: Stage, input: LookupInput, slugs: string[], tried: string[]): Promise<LookupReply> {
  const payload = stage === "search" ? searchInput(input) : stage === "people" ? peopleInput(input) : profileInput(tried[tried.length - 1]);
  const run = await startRun(keys.apify, stage, payload);
  const token = await signToken(keys.secret, { stage, run: run.id, input, slugs, tried, exp: Date.now() + TTL });
  return { state: "pending", stage, token };
}

/** Start the profile pull for the next slug nobody has looked at yet, or give up. */
async function nextSlug(keys: Keys, t: Pick<RunToken, "input" | "slugs" | "tried">): Promise<LookupReply> {
  const slug = t.slugs.find((s) => !t.tried.includes(s));
  if (!slug || t.tried.length >= 3) return { state: "not_found", next: null };
  return begin(keys, "profile", t.input, t.slugs, [...t.tried, slug]);
}

export function startLookup(keys: Keys, input: LookupInput) {
  return begin(keys, "search", input, [], []);
}

/** A LinkedIn URL the person typed in: skip search and pull that profile. */
export function startFromSlug(keys: Keys, input: LookupInput, slug: string) {
  return begin(keys, "profile", input, [slug], [slug]);
}

export async function pollLookup(keys: Keys, token: string | null): Promise<LookupReply> {
  const t = await readToken(keys.secret, token);
  if (!t) return { state: "error", message: "This lookup expired. Start again." };

  const run = await getRun(keys.apify, t.run);
  if (run.status === "READY" || run.status === "RUNNING") return { state: "pending", stage: t.stage, token: token! };

  const ok = run.status === "SUCCEEDED";
  if (t.stage === "search") {
    const slugs = ok ? slugsFromSerp(await items(keys.apify, run.defaultDatasetId), t.input) : [];
    return slugs.length ? nextSlug(keys, { ...t, slugs }) : begin(keys, "people", t.input, [], []);
  }
  if (t.stage === "people") {
    const slugs = ok ? slugsFromPeople(await items(keys.apify, run.defaultDatasetId), t.input) : [];
    return slugs.length ? nextSlug(keys, { ...t, slugs }) : { state: "not_found", next: null };
  }

  // profile
  const raw = ok ? (await items(keys.apify, run.defaultDatasetId))[0] : undefined;
  const score = raw ? scoreProfile(raw, t.input) : 0;
  const manual = t.slugs.length === 1 && t.tried.length === 1; // typed-in URL: trust it if it exists
  if (raw && (raw as { basic_info?: { fullname?: string } }).basic_info?.fullname && (manual || score >= MIN_SCORE)) {
    const remaining = t.slugs.some((s) => !t.tried.includes(s)) && t.tried.length < 3;
    const next = remaining ? await signToken(keys.secret, { ...t, exp: Date.now() + TTL }) : null;
    return { state: "found", profile: shapeProfile(raw, score), next };
  }
  return nextSlug(keys, t);
}

/** "No, that's not me": move on to the next candidate slug. */
export async function rejectProfile(keys: Keys, token: string | null): Promise<LookupReply> {
  const t = await readToken(keys.secret, token);
  if (!t) return { state: "not_found", next: null };
  return nextSlug(keys, t);
}
