/**
 * The lookup state machine behind /api/linkedin/*.
 *
 * start → Google SERP and LinkedIn people search run IN PARALLEL. The people search returns full profiles,
 * so a person whose name and company both match is shown the moment it finishes (no third run). Google only
 * matters when the people search misses: a Google hit with the company in its snippet gets its profile pulled,
 * speculatively, while the people search is still running. Whichever gives a confident match first wins.
 *
 * Profiles live server-side in KV ("li:d:<lookup id>"); the browser holds a signed token with run ids and slugs
 * only. A repeat of the same name + company within 6 h reuses the candidates ("li:q:v4:<hash>") and costs nothing.
 * "No, not me" hands back a token; the next poll shows the next candidate (instantly when its profile is held).
 */
import {
  bonus, candsFromSerp, photoLink, getRun, items, peopleInput, profileInput, queryKey, readToken, scoreProfile, searchInput,
  shapeProfile, signToken, slugOf, startRun, trimRaw, type Cand, type LookupInput, type Profile, type Raw, type RunToken,
  type Stage,
} from "./linkedin";
import type { Block } from "./limits";

/** Runs right before paid Apify runs start (never on a cache hit). null = go ahead. */
export type Gate = () => Promise<Block | null>;
const blocked = (b: Block): LookupReply => ({ state: "error", message: b.message, code: b.code, retryAfter: b.retryAfter });

export type LookupReply =
  | { state: "pending"; stage: Stage; token: string }
  | { state: "found"; profile: Profile; next: string | null }
  | { state: "not_found"; next: null }
  | { state: "error"; message: string; code?: Block["code"]; retryAfter?: number };

type Keys = { apify: string; secret: string; kv?: KVNamespace };

const TTL = 15 * 60_000; // token life
const MIN_SCORE = 0.35; // below this we never show a profile (the name doesn't match)
const SURE = 0.99; // name and company both match: show it now
const MAX_SHOWN = 3;
const MAX_PULLS = 3;
const MAX_CANDS = 10;
const WAIT_FOR_DISCOVERY_MS = 25_000; // past this, show a name-only match rather than keep waiting on Google
const WAIT_AFTER_REJECT_MS = 5_000; // after "not me", wait at most this long for Google before showing the next name match
const CACHE_S = 6 * 3600;

type Store = Record<string, Raw>;
const dataKey = (id: string) => `li:d:${id}`;

/** Lazy, per-request view of this lookup's profile store. */
function storeFor(kv: KVNamespace | undefined, id: string) {
  let data: Store | null = null;
  let dirty = false;
  return {
    async get(): Promise<Store> {
      if (!data) data = (kv ? await kv.get<Store>(dataKey(id), "json").catch(() => null) : null) ?? {};
      return data;
    },
    async put(slug: string, raw: Raw) {
      (await this.get())[slug] = raw;
      dirty = true;
    },
    async flush() {
      if (kv && dirty && data) await kv.put(dataKey(id), JSON.stringify(data), { expirationTtl: CACHE_S + 3600 });
    },
  };
}

const sign = (keys: Keys, t: RunToken) => signToken(keys.secret, { ...t, exp: Date.now() + TTL });
const discovering = (t: RunToken) => Boolean(t.runs.search || t.runs.people);
const stageOf = (t: RunToken): Stage => (t.runs.profile ? "profile" : t.runs.search ? "search" : t.runs.people ? "people" : "profile");
const pending = async (keys: Keys, t: RunToken): Promise<LookupReply> => ({ state: "pending", stage: stageOf(t), token: await sign(keys, t) });

function merge(t: RunToken, add: Cand[]) {
  for (const c of add) {
    const have = t.cands.find((x) => x.s === c.s);
    if (!have) t.cands.push(c);
    else Object.assign(have, { ...c, h: have.h || c.h, r: Math.min(have.r ?? 99, c.r ?? 99) });
  }
  t.cands = t.cands.slice(0, MAX_CANDS);
}

/** Candidates still worth showing, best first: sure matches, Google company hits, name matches, other Google results. */
function ranked(t: RunToken): Cand[] {
  const canPull = t.pulls < MAX_PULLS;
  const tier = (c: Cand) => (c.sc !== undefined ? (c.sc >= SURE ? 0 : 2) : c.h ? 1 : 3);
  return t.cands
    .filter((c) => !t.shown.includes(c.s) && !t.dead.includes(c.s))
    .filter((c) => (c.sc === undefined ? canPull || c.s === t.pull : c.sc >= MIN_SCORE || t.manual))
    .sort((a, b) => tier(a) - tier(b) || (b.sc ?? 0) + (b.b ?? 0) - (a.sc ?? 0) - (a.b ?? 0) || (a.r ?? 99) - (b.r ?? 99));
}

/** Read every finished run into the token and the profile store. */
async function ingest(keys: Keys, t: RunToken, store: ReturnType<typeof storeFor>) {
  const live = (Object.entries(t.runs) as [Stage, string | undefined][]).filter((e): e is [Stage, string] => Boolean(e[1]));
  // A run Apify no longer knows (404, e.g. an old cached one) counts as finished empty; other errors retry next poll.
  const runs = await Promise.all(
    live.map(async ([stage, id]) => {
      const run = await getRun(keys.apify, id).catch((e: unknown) => {
        if (String(e).includes(" 404")) return { id, status: "FAILED", defaultDatasetId: "" };
        throw e;
      });
      return [stage, run] as const;
    }),
  );
  const done = runs.filter(([, r]) => r.status !== "READY" && r.status !== "RUNNING");
  const results = await Promise.all(done.map(async ([stage, r]) => [stage, r.status === "SUCCEEDED" ? await items(keys.apify, r.defaultDatasetId) : []] as const));

  for (const [stage, rows] of results) {
    const { [stage]: _finished, ...rest } = t.runs;
    t.runs = rest;
    if (stage === "search") {
      merge(t, candsFromSerp(rows, t.input));
      continue;
    }
    const profiles = (rows as Raw[]).filter((r) => r.basic_info?.fullname && slugOf(r));
    if (stage === "profile") {
      const slug = t.pull!;
      t.pull = undefined;
      if (!profiles[0]) {
        t.dead.push(slug);
        continue;
      }
      await store.put(slug, trimRaw(profiles[0]));
      merge(t, [{ s: slug, sc: scoreProfile(profiles[0], t.input), b: bonus(profiles[0], t.input) }]);
      continue;
    }
    // people: full profiles; keep the ones whose name matches, best first.
    const scored = profiles
      .map((raw) => ({ raw, c: { s: slugOf(raw), sc: scoreProfile(raw, t.input), b: bonus(raw, t.input) } as Cand }))
      .filter((x) => x.c.sc! >= MIN_SCORE)
      .sort((a, b) => b.c.sc! + b.c.b! - a.c.sc! - a.c.b!)
      .slice(0, 6);
    for (const x of scored) await store.put(x.c.s, trimRaw(x.raw));
    merge(t, scored.map((x) => x.c));
  }
  return done.length > 0;
}

type Cached = { id: string; cands: Cand[]; runs?: { search?: string; people?: string } };

/** Cache this name + company. Discovery runs still going are cached too, so a repeat picks up their results. */
async function remember(keys: Keys, t: RunToken) {
  if (!keys.kv) return;
  const cands = t.cands.filter((c) => !t.dead.includes(c.s) && (c.sc === undefined || c.sc >= MIN_SCORE));
  const value: Cached = { id: t.id, cands, runs: { search: t.runs.search, people: t.runs.people } };
  if (cands.length) await keys.kv.put(await queryKey(t.input), JSON.stringify(value), { expirationTtl: CACHE_S }).catch(() => {});
}

/** Decide what the browser sees next: a profile, more waiting, or nothing. */
async function step(keys: Keys, t: RunToken, store: ReturnType<typeof storeFor>): Promise<LookupReply> {
  if (t.shown.length >= MAX_SHOWN) return { state: "not_found", next: null };
  const next = ranked(t)[0];
  const busy = discovering(t) || Boolean(t.runs.profile);
  if (!next) return busy ? pending(keys, t) : { state: "not_found", next: null };

  if (next.sc !== undefined) {
    const sure = next.sc >= SURE || Boolean(t.manual);
    const waited = Date.now() > (t.until ?? t.t0 + WAIT_FOR_DISCOVERY_MS);
    if (!sure && discovering(t) && !waited) return pending(keys, t);
    const raw = (await store.get())[next.s];
    if (raw) {
      t.shown.push(next.s);
      const more = t.shown.length < MAX_SHOWN && (ranked(t).length > 0 || busy);
      const profile = shapeProfile(raw, next.sc);
      // Never hot-link LinkedIn's expiring CDN URL: hand the browser our signed, cached proxy instead.
      profile.photo = await photoLink(keys.secret, profile.photo);
      return { state: "found", profile, next: more ? await sign(keys, t) : null };
    }
    next.sc = undefined; // the stored profile is gone (expired): pull it again below
  }

  if (t.runs.profile) return pending(keys, t); // one pull at a time
  if (discovering(t) && !next.h) return pending(keys, t); // pull early only for Google's company matches
  if (t.pulls >= MAX_PULLS) return busy ? pending(keys, t) : { state: "not_found", next: null };
  const run = await startRun(keys.apify, "profile", profileInput(next.s));
  t.runs = { ...t.runs, profile: run.id };
  t.pull = next.s;
  t.pulls += 1;
  return pending(keys, t);
}

function fresh(input: LookupInput, id = crypto.randomUUID()): RunToken {
  return { v: 2, id, input, runs: {}, pulls: 0, cands: [], shown: [], dead: [], t0: Date.now(), exp: 0 };
}

export async function startLookup(keys: Keys, input: LookupInput, gate?: Gate): Promise<LookupReply> {
  if (keys.kv) {
    const hit = await keys.kv.get<Cached>(await queryKey(input), "json").catch(() => null);
    if (hit?.cands?.length) return pending(keys, { ...fresh(input, hit.id), cands: hit.cands, runs: hit.runs ?? {} });
  }
  const block = gate ? await gate() : null;
  if (block) return blocked(block);
  const t = fresh(input);
  const [search, people] = await Promise.allSettled([
    startRun(keys.apify, "search", searchInput(input)),
    startRun(keys.apify, "people", peopleInput(input)),
  ]);
  if (search.status === "rejected" && people.status === "rejected") throw search.reason;
  t.runs = {
    search: search.status === "fulfilled" ? search.value.id : undefined,
    people: people.status === "fulfilled" ? people.value.id : undefined,
  };
  return pending(keys, t);
}

/** A LinkedIn URL the person typed in: skip discovery and pull that profile (shown whatever its score). */
export async function startFromSlug(keys: Keys, input: LookupInput, slug: string, gate?: Gate): Promise<LookupReply> {
  const block = gate ? await gate() : null;
  if (block) return blocked(block);
  const t: RunToken = { ...fresh(input), manual: 1, cands: [{ s: slug }] };
  return step(keys, t, storeFor(keys.kv, t.id));
}

export async function pollLookup(keys: Keys, token: string | null): Promise<LookupReply> {
  const t = await readToken(keys.secret, token);
  if (!t) return { state: "error", message: "This lookup expired. Start again." };
  const store = storeFor(keys.kv, t.id);
  const wasDiscovering = discovering(t);
  const changed = await ingest(keys, t, store);
  const reply = await step(keys, t, store);
  await store.flush();
  if (changed && (reply.state === "found" || (wasDiscovering && !discovering(t)))) await remember(keys, t);
  return reply;
}

/** "No, that's not me": hand back a token; the next poll shows the next candidate. */
export async function rejectProfile(keys: Keys, token: string | null): Promise<LookupReply> {
  const t = await readToken(keys.secret, token);
  if (!t || t.shown.length >= MAX_SHOWN) return { state: "not_found", next: null };
  if (!ranked(t).length && !discovering(t) && !t.runs.profile) return { state: "not_found", next: null };
  t.until = Math.min(t.until ?? Infinity, Date.now() + WAIT_AFTER_REJECT_MS);
  return pending(keys, t);
}
