/**
 * The lookup state machine behind /api/linkedin/*.
 *
 * start → Google SERP, the LinkedIn people search AND a pull of the guessed slug ("first-last") run IN PARALLEL.
 * The people search returns full profiles; the guessed pull takes ~3 s. The first profile that clears the match
 * guard at "sure" (name + company, ≥ 0.9) is shown on the next poll, whichever lane found it. A Google hit with the
 * company in its snippet gets its profile pulled while the people search is still running.
 *
 * Prefetch (lib/linkedin-job.ts): the flow calls start at A2 with name + company only, so all of this runs while
 * the person types their title. The A3 start (same name + company + title) attaches to that job: same runs, same
 * profile store, nothing paid or counted twice. The job is found from the A2 token or, failing that, from KV.
 *
 * Polls hold (up to HOLD_MS) on Apify's waitForFinish, so a finished run is heard at once instead of on the
 * browser's next tick. With `partial` opted in, a Google result whose own search data clears the guard at ≥ 0.9 is
 * shown at once as a partial card (no experience rows), and a later poll fills it in from the full profile, or
 * takes it back (`retracted`) in the rare case the full profile fails the guard.
 *
 * Only profiles that pass the guard (lib/linkedin-match.ts: first + last name AND company or title) are ever shown;
 * name + title only (0.7) waits up to WAIT_FOR_DISCOVERY_MS for a name + company match. When none pass, the reply is
 * not_found and the browser offers the paste-link path. No guessing.
 *
 * Profiles live server-side in KV ("li:d:<lookup id>"); the browser holds a signed token with run ids and slugs
 * only. A repeat of the same name + company + role within 6 h reuses the candidates ("li:q:v5:<hash>") and costs
 * nothing. "No, not me" hands back a token; the next poll shows the next candidate that passes the guard.
 */
import {
  bonus, candsFromSerp, photoLink, getRun, items, peopleInput, profileInput, queryKey, readToken, scoreProfile, searchInput,
  serpRaw, sha, shapeProfile, signToken, slugOf, startRun, trimRaw, type Cand, type LookupInput, type Profile, type Raw,
  type Run, type RunToken, type Stage,
} from "./linkedin";
import { attach, guessSlug, jobBasis, type Job, type Timings } from "./linkedin-job";
import { MATCH } from "./linkedin-match";
import type { Block } from "./limits";

/** Runs right before paid Apify runs start (never on a cache hit or an attach). null = go ahead. */
export type Gate = () => Promise<Block | null>;
const blocked = (b: Block): LookupReply => ({ state: "error", message: b.message, code: b.code, retryAfter: b.retryAfter });

export type LookupReply =
  | { state: "pending"; stage: Stage; token: string; retracted?: true; timings?: Timings }
  | {
      state: "found"; profile: Profile; next: string | null;
      /** Only when the start opted in to partial cards. true: search data only; keep polling with `token`. */
      partial?: boolean; token?: string; retracted?: true; timings?: Timings;
    }
  | { state: "not_found"; next: null; retracted?: true; timings?: Timings }
  | { state: "error"; message: string; code?: Block["code"]; retryAfter?: number };

type Keys = { apify: string; secret: string; kv?: KVNamespace };

const TTL = 15 * 60_000; // token life
const MIN_SCORE = MATCH.pass; // the match guard: below this (name AND company-or-title) we never show a profile
const SURE = MATCH.sure; // name and company both match: show it now
const MAX_SHOWN = 3;
const MAX_PULLS = 3; // Google hits; the guessed slug is one more
const MAX_CANDS = 10;
const WAIT_FOR_DISCOVERY_MS = 25_000; // past this, show a name + title match rather than keep waiting on Google for name + company
const WAIT_AFTER_REJECT_MS = 5_000; // after "not me", wait at most this long for Google before showing the next guarded match
const HOLD_MS = 5_000; // a poll waits up to this long for a run to finish before answering "pending"
const CLAIM_WAIT_MS = 3_000; // a start that finds another start launching the same job waits this long to attach to it
const CLAIM_SETTLE_MS = 60; // after writing a claim, before reading it back (only the A2 prefetch pays this; nobody waits on it)
const CACHE_S = 6 * 3600;
const GUESS_SLUG = true; // kill switch for the guessed-slug lane (lib/linkedin-job.ts guessSlug)

type Store = Record<string, Raw>;
const dataKey = (id: string) => `li:d:${id}`;
const jobKey = async (i: LookupInput) => `li:job:v1:${await sha(jobBasis(i))}`;
const claimKey = async (i: LookupInput) => `li:jobclaim:v1:${await sha(jobBasis(i))}`;
const roleBasis = (i: LookupInput) => i.role.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "");

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
      dirty = false;
    },
  };
}
type StoreView = ReturnType<typeof storeFor>;

const sign = (keys: Keys, t: RunToken) => signToken(keys.secret, { ...t, exp: Date.now() + TTL });
const discovering = (t: RunToken) => Boolean(t.runs.search || t.runs.people);
const live = (t: RunToken) => Boolean(t.runs.search || t.runs.people || t.runs.profile);
// The guessed pull runs from the start, so it doesn't move the stage to "profile" (that's for Google hits).
const stageOf = (t: RunToken): Stage => (t.runs.profile && !t.gs ? "profile" : t.runs.search ? "search" : t.runs.people ? "people" : "profile");
const pending = async (keys: Keys, t: RunToken): Promise<LookupReply> => ({ state: "pending", stage: stageOf(t), token: await sign(keys, t) });
const finished = (r: Run) => r.status !== "READY" && r.status !== "RUNNING";

function merge(t: RunToken, add: Cand[]) {
  for (const c of add) {
    const have = t.cands.find((x) => x.s === c.s);
    if (!have) t.cands.push(c);
    else Object.assign(have, { ...c, h: have.h || c.h, r: Math.min(have.r ?? 99, c.r ?? 99), ps: c.ps ?? have.ps, o: have.o ?? c.o });
  }
  t.cands = t.cands.slice(0, MAX_CANDS);
}

/** Candidates still worth showing, best first: sure matches, Google company hits, name matches, other Google results. */
function ranked(t: RunToken): Cand[] {
  const canPull = t.pulls < MAX_PULLS;
  const tier = (c: Cand) => (c.sc !== undefined ? (c.sc >= SURE ? 0 : 2) : c.h ? 1 : 3);
  return t.cands
    .filter((c) => !t.shown.includes(c.s) && !t.dead.includes(c.s))
    .filter((c) => (c.sc === undefined ? canPull || c.s === t.pull || Boolean(t.pa && c.ps) : c.sc >= MIN_SCORE || t.manual))
    .sort((a, b) => tier(a) - tier(b) || (b.sc ?? 0) + (b.b ?? 0) - (a.sc ?? 0) - (a.b ?? 0) || (a.r ?? 99) - (b.r ?? 99));
}

/**
 * Every live run's status. waitMs > 0: hold on Apify's waitForFinish and return as soon as ANY run finishes (or
 * waitMs passes); runs we didn't hear back from count as still running. Throws only when every status call failed.
 */
async function statuses(keys: Keys, runs: [Stage, string][], waitMs: number): Promise<[Stage, Run][]> {
  const ctl = new AbortController();
  const timer = waitMs > 0 ? setTimeout(() => ctl.abort(), waitMs) : undefined;
  const out = new Map<Stage, Run>();
  let failures = 0;
  let firstError: unknown;
  await new Promise<void>((resolve) => {
    let left = runs.length;
    const settle = () => --left === 0 && resolve();
    for (const [stage, id] of runs)
      getRun(keys.apify, id, waitMs / 1000, ctl.signal).then(
        (r) => {
          out.set(stage, r);
          if (waitMs > 0 && finished(r)) resolve();
          settle();
        },
        (e: unknown) => {
          // A run Apify no longer knows (404, e.g. an old cached one) counts as finished empty.
          if (String(e).includes(" 404")) {
            out.set(stage, { id, status: "FAILED", defaultDatasetId: "" });
            if (waitMs > 0) resolve();
          } else if (!ctl.signal.aborted) {
            failures += 1;
            firstError ??= e;
          }
          settle();
        },
      );
  });
  clearTimeout(timer);
  ctl.abort();
  if (failures === runs.length) throw firstError;
  return runs.map(([stage, id]) => [stage, out.get(stage) ?? { id, status: "RUNNING", defaultDatasetId: "" }]);
}

/** Read every finished run into the token and the profile store (waiting up to waitMs for one to finish). */
async function ingest(keys: Keys, t: RunToken, store: StoreView, waitMs = 0): Promise<boolean> {
  const runs = (Object.entries(t.runs) as [Stage, string | undefined][]).filter((e): e is [Stage, string] => Boolean(e[1]));
  if (!runs.length) return false;
  const done = (await statuses(keys, runs, waitMs)).filter(([, r]) => finished(r));
  const results = await Promise.all(done.map(async ([stage, r]) => [stage, r, r.status === "SUCCEEDED" ? await items(keys.apify, r.defaultDatasetId) : []] as const));

  const tm = (t.tm ??= {});
  const at = Date.now() - t.t0;
  for (const [stage, run, rows] of results) {
    const { [stage]: _finished, ...rest } = t.runs;
    t.runs = rest;
    const lane = stage === "profile" ? (t.gs ? "guess" : "pull") : stage;
    tm[lane] ??= at;
    if (run.startedAt && run.finishedAt) (tm.apify ??= {})[lane] ??= Date.parse(run.finishedAt) - Date.parse(run.startedAt);

    if (stage === "search") {
      const cands = candsFromSerp(rows, t.input).map((c): Cand => ({ ...c, o: "search" }));
      if (t.pa)
        for (const c of cands) {
          if (!c.h) continue;
          const held = (await store.get())[c.s];
          if (held && !held.serp) continue; // we already hold the full profile
          const card = serpRaw(rows, c.s);
          const ps = card ? scoreProfile(card, t.input) : 0;
          if (card && ps >= SURE) {
            c.ps = ps;
            await store.put(c.s, card);
          }
        }
      merge(t, cands);
      continue;
    }
    const profiles = (rows as Raw[]).filter((r) => r.basic_info?.fullname && slugOf(r));
    if (stage === "profile") {
      const slug = t.pull!;
      const guessed = Boolean(t.gs);
      t.pull = undefined;
      t.gs = undefined;
      const held = (await store.get())[slug];
      if (!profiles[0]) {
        t.dead.push(slug);
        if (!held?.serp) await store.put(slug, { gone: "empty" }); // a partial card keeps its search data
        continue;
      }
      const sc = scoreProfile(profiles[0], t.input);
      if (sc < MIN_SCORE && !t.manual) {
        // Someone else (often the owner of a guessed slug): keep nothing about them, only that this title failed.
        t.dead.push(slug);
        await store.put(slug, { gone: "guard", for: roleBasis(t.input) });
        continue;
      }
      await store.put(slug, trimRaw(profiles[0]));
      merge(t, [{ s: slug, sc, b: bonus(profiles[0], t.input), o: guessed ? "guess" : "search" }]);
      continue;
    }
    // people: full profiles; keep the ones that pass the guard, best first.
    const scored = profiles
      .map((raw) => ({ raw, c: { s: slugOf(raw), sc: scoreProfile(raw, t.input), b: bonus(raw, t.input), o: "people" } as Cand }))
      .filter((x) => x.c.sc! >= MIN_SCORE)
      .sort((a, b) => b.c.sc! + b.c.b! - a.c.sc! - a.c.b!)
      .slice(0, 6);
    for (const x of scored) await store.put(x.c.s, trimRaw(x.raw));
    merge(t, scored.map((x) => x.c));
  }
  return done.length > 0;
}

type Cached = { id: string; cands: Cand[]; runs?: { search?: string; people?: string } };

/** Cache this name + company + role. Discovery runs still going are cached too, so a repeat picks up their results. */
async function remember(keys: Keys, t: RunToken) {
  if (!keys.kv) return;
  const cands = t.cands.filter((c) => !t.dead.includes(c.s) && (c.sc === undefined || c.sc >= MIN_SCORE));
  const value: Cached = { id: t.id, cands, runs: { search: t.runs.search, people: t.runs.people } };
  if (cands.length) await keys.kv.put(await queryKey(t.input), JSON.stringify(value), { expirationTtl: CACHE_S }).catch(() => {});
}

/** A found reply. The first card stamps the timings. */
async function show(keys: Keys, t: RunToken, raw: Raw, sc: number, src: Cand["o"], partial = false): Promise<LookupReply> {
  const tm = (t.tm ??= {});
  if (tm.first === undefined) {
    tm.first = Date.now() - t.t0;
    tm.src = tm.cache ? "cache" : src;
  }
  const busy = live(t);
  const more = t.shown.length < MAX_SHOWN && (ranked(t).length > 0 || busy);
  const profile = shapeProfile(raw, sc);
  // Never hot-link LinkedIn's expiring CDN URL: hand the browser our signed, cached proxy instead.
  profile.photo = await photoLink(keys.secret, profile.photo);
  const token = await sign(keys, t);
  if (partial) return { state: "found", profile, next: more ? token : null, partial: true, token };
  return { state: "found", profile, next: more ? token : null, ...(t.pa ? { partial: false } : {}) };
}

/** A pull for `slug` (one at a time). */
async function pull(keys: Keys, t: RunToken, slug: string) {
  const run = await startRun(keys.apify, "profile", profileInput(slug));
  t.runs = { ...t.runs, profile: run.id };
  t.pull = slug;
  t.pulls += 1;
}

/**
 * A partial card is on screen (t.pp). Fill it in when its full profile lands, keep it while the pull runs, keep it
 * as final when there's no full profile to be had, or take it back when the full profile fails the guard.
 * null = nothing on screen any more; carry on with the normal step.
 */
async function partialStep(keys: Keys, t: RunToken, store: StoreView): Promise<LookupReply | null> {
  const slug = t.pp!;
  const raw = (await store.get())[slug];
  const c = t.cands.find((x) => x.s === slug);
  if (raw && !raw.serp && !raw.gone) {
    const sc = scoreProfile(raw, t.input);
    t.pp = undefined;
    if (sc >= MIN_SCORE) {
      (t.tm ??= {}).full ??= Date.now() - t.t0;
      return show(keys, t, raw, sc, c?.o);
    }
  } else if (raw?.serp && scoreProfile(raw, t.input) >= SURE) {
    // The guard again, on the stored search data, every time the card goes out.
    const ps = scoreProfile(raw, t.input);
    const pulling = t.pull === slug && Boolean(t.runs.profile);
    if (!pulling && !t.dead.includes(slug) && !t.runs.profile && t.pulls < MAX_PULLS) await pull(keys, t, slug);
    if (t.pull === slug && t.runs.profile) return show(keys, t, raw, ps, "search", true);
    if (t.runs.profile && !t.dead.includes(slug) && t.pulls < MAX_PULLS) return show(keys, t, raw, ps, "search", true); // slot busy: pull it next
    // No full profile to be had (the pull found nobody, or no pulls left): the search-data card is the card.
    t.pp = undefined;
    (t.tm ??= {}).full ??= Date.now() - t.t0;
    return show(keys, t, raw, ps, "search");
  }
  // The full profile failed the guard (or the store expired): take the card back and move on.
  t.pp = undefined;
  t.shown = t.shown.filter((s) => s !== slug);
  if (!t.dead.includes(slug)) t.dead.push(slug);
  return { ...(await step(keys, t, store)), retracted: true } as LookupReply;
}

/** Decide what the browser sees next: a profile, more waiting, or nothing. */
async function step(keys: Keys, t: RunToken, store: StoreView): Promise<LookupReply> {
  if (t.pp) {
    const r = await partialStep(keys, t, store);
    if (r) return r;
  }
  if (t.shown.length >= MAX_SHOWN) return { state: "not_found", next: null };
  const next = ranked(t)[0];
  const busy = live(t);
  if (!next) return busy ? pending(keys, t) : { state: "not_found", next: null };

  if (next.sc !== undefined) {
    const sure = next.sc >= SURE || Boolean(t.manual);
    const waited = Date.now() > (t.until ?? t.t0 + WAIT_FOR_DISCOVERY_MS);
    if (!sure && discovering(t) && !waited) return pending(keys, t);
    const raw = (await store.get())[next.s];
    if (raw && !raw.serp && !raw.gone) {
      // Re-check the guard on the stored profile right before showing it, so a token or cache scored by older
      // rules can never surface a guess. A pasted link is the person's own choice and is always shown.
      const sc = t.manual ? next.sc : scoreProfile(raw, t.input);
      if (sc < MIN_SCORE && !t.manual) {
        t.dead.push(next.s);
        return step(keys, t, store);
      }
      t.shown.push(next.s);
      return show(keys, t, raw, sc, next.o);
    }
    next.sc = undefined; // the stored profile is gone (expired): pull it again below
  }

  // Already held by this job (another lookup of the same name + company pulled it): reuse it, never pay twice.
  const held = (await store.get())[next.s];
  if (held && !held.serp) {
    if (held.gone === "empty" || (held.gone === "guard" && held.for === roleBasis(t.input))) {
      t.dead.push(next.s);
      return step(keys, t, store);
    }
    if (!held.gone) {
      next.sc = scoreProfile(held, t.input);
      next.b = bonus(held, t.input);
      if (next.sc < MIN_SCORE) t.dead.push(next.s);
      return step(keys, t, store);
    }
  }

  // Google's own search data already clears the guard at "sure": show it now, fill in the rest when the pull lands.
  if (t.pa && next.ps !== undefined && held?.serp) {
    t.shown.push(next.s);
    t.pp = next.s;
    const r = await partialStep(keys, t, store);
    if (r) return r;
  }

  if (t.runs.profile) return pending(keys, t); // one pull at a time
  if (discovering(t) && !next.h) return pending(keys, t); // pull early only for Google's company matches
  if (t.pulls >= MAX_PULLS) return busy ? pending(keys, t) : { state: "not_found", next: null };
  await pull(keys, t, next.s);
  return pending(keys, t);
}

function fresh(input: LookupInput, id = crypto.randomUUID()): RunToken {
  return { v: 2, id, input, runs: {}, pulls: 0, cands: [], shown: [], dead: [], t0: Date.now(), exp: 0 };
}

async function readJob(kv: KVNamespace, input: LookupInput): Promise<Job | null> {
  return kv.get<Job>(await jobKey(input), "json").catch(() => null);
}

/** Another start is launching this job: wait (≤ CLAIM_WAIT_MS) for its record, then attach. */
async function awaitJob(kv: KVNamespace, input: LookupInput, opts: StartOptions) {
  for (const until = Date.now() + CLAIM_WAIT_MS; Date.now() < until; ) {
    await new Promise((r) => setTimeout(r, 200));
    const joined = attach(await readJob(kv, input), input, Date.now(), opts);
    if (joined) return joined;
  }
  return null;
}

export type StartOptions = {
  /** The token from an earlier start for the same name + company (the A2 prefetch): attach to its job. */
  token?: string | null;
  /** The browser handles partial cards (`partial`, `token`, `retracted` on poll). */
  partial?: boolean;
};

/**
 * Start (or join) the lookup. In order: the 6 h cache for this exact name + company + role; the running job for
 * this name + company (from `opts.token`, else KV); only then a paid start, which is when the limits count.
 */
export async function startLookup(keys: Keys, input: LookupInput, gate?: Gate, opts: StartOptions = {}): Promise<LookupReply> {
  const pa = opts.partial ? ({ pa: 1 } as const) : {};
  if (keys.kv) {
    const hit = await keys.kv.get<Cached>(await queryKey(input), "json").catch(() => null);
    if (hit?.cands?.length) return pending(keys, { ...fresh(input, hit.id), cands: hit.cands, runs: hit.runs ?? {}, ...pa, tm: { cache: 1 } });
  }

  const prior = opts.token ? await readToken(keys.secret, opts.token) : null;
  let joined = prior?.j && !prior.manual ? attach({ id: prior.id, input: prior.input, j: prior.j, t0: prior.t0, tm: prior.tm }, input, Date.now(), opts) : null;
  const kv = keys.kv;
  const t: RunToken = { ...fresh(input), ...pa };
  if (!joined && kv) {
    joined = attach(await readJob(kv, input), input, Date.now(), opts);
    if (!joined) {
      // Claim the job before paying: write our id, give a start fired at the same moment time to write theirs, read
      // back. Whoever's id stands launches; the other joins its job. (KV isn't atomic; this closes the usual race.)
      const ck = await claimKey(input);
      const other = await kv.get(ck).catch(() => null);
      if (!other) {
        await kv.put(ck, t.id, { expirationTtl: 60 }).catch(() => {});
        await new Promise((r) => setTimeout(r, CLAIM_SETTLE_MS));
      }
      const owner = await kv.get(ck).catch(() => null);
      if (owner && owner !== t.id) joined = await awaitJob(kv, input, opts);
    }
  }
  if (joined) return pending(keys, joined);

  const block = gate ? await gate() : null;
  if (block) {
    if (kv) await kv.delete(await claimKey(input)).catch(() => {});
    return blocked(block);
  }

  const guess = GUESS_SLUG ? guessSlug(input.name) : null;
  const [search, people, guessed] = await Promise.allSettled([
    startRun(keys.apify, "search", searchInput(input)),
    startRun(keys.apify, "people", peopleInput(input)),
    guess ? startRun(keys.apify, "profile", profileInput(guess)) : Promise.resolve(null),
  ]);
  if (search.status === "rejected" && people.status === "rejected") {
    if (kv) await kv.delete(await claimKey(input)).catch(() => {});
    throw search.reason;
  }
  const g = guessed.status === "fulfilled" && guessed.value ? guessed.value.id : undefined;
  t.runs = {
    search: search.status === "fulfilled" ? search.value.id : undefined,
    people: people.status === "fulfilled" ? people.value.id : undefined,
    ...(g ? { profile: g } : {}),
  };
  if (g) Object.assign(t, { pull: guess!, gs: 1 });
  t.j = { search: t.runs.search, people: t.runs.people, ...(g ? { guess: g, gslug: guess! } : {}) };
  t.tm = { start: Date.now() - t.t0 };
  if (keys.kv) {
    const job: Job = { id: t.id, input: { name: input.name, company: input.company, role: "" }, j: t.j, t0: t.t0, tm: t.tm };
    await keys.kv.put(await jobKey(input), JSON.stringify(job), { expirationTtl: CACHE_S }).catch(() => {});
  }
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
  const tm = (t.tm ??= {});
  tm.n = (tm.n ?? 0) + 1;
  const hadFirst = tm.first !== undefined;
  const wasDiscovering = discovering(t);
  const holding = Boolean(t.pp); // a partial card is on screen: hold for its full profile
  let changed = await ingest(keys, t, store);
  let reply = await step(keys, t, store);

  // Hold: wait on Apify for the next run to finish rather than answer "pending" and make the browser ask again.
  // Answer early when the stage changes, so the progress line keeps moving.
  const stage0 = reply.state === "pending" ? reply.stage : null;
  const end = Date.now() + HOLD_MS;
  const waiting = (r: LookupReply) =>
    r.state === "pending" ? r.stage === stage0 && !r.retracted : r.state === "found" && r.partial === true && holding;
  while (live(t) && waiting(reply)) {
    // Wake at the end of the hold, or when the name + title wait runs out, whichever is first.
    const deadline = t.until ?? t.t0 + WAIT_FOR_DISCOVERY_MS;
    const wake = deadline > Date.now() ? Math.min(end, deadline) : end;
    const ms = wake - Date.now();
    if (ms < 200) break;
    try {
      changed = (await ingest(keys, t, store, ms)) || changed;
    } catch {
      break; // Apify unreachable mid-hold: answer with what we have; the next poll retries
    }
    reply = await step(keys, t, store);
  }

  await store.flush();
  if (changed && (reply.state === "found" || (wasDiscovering && !discovering(t)))) await remember(keys, t);
  if (!hadFirst && t.tm?.first !== undefined) {
    console.log("[linkedin] first card", JSON.stringify(t.tm)); // timings only: no names, no slugs
    if (keys.kv && t.j) {
      const job: Job = { id: t.id, input: { name: t.input.name, company: t.input.company, role: "" }, j: t.j, t0: t.t0, tm: t.tm };
      await keys.kv.put(await jobKey(t.input), JSON.stringify(job), { expirationTtl: CACHE_S }).catch(() => {});
    }
  }
  return reply.state === "error" ? reply : { ...reply, timings: t.tm };
}

/** "No, that's not me": hand back a token; the next poll shows the next candidate. */
export async function rejectProfile(keys: Keys, token: string | null): Promise<LookupReply> {
  const t = await readToken(keys.secret, token);
  if (!t || t.shown.length >= MAX_SHOWN) return { state: "not_found", next: null };
  t.pp = undefined; // a partial card they turned down stays turned down, whatever its pull says
  if (!ranked(t).length && !live(t)) return { state: "not_found", next: null };
  t.until = Math.min(t.until ?? Infinity, Date.now() + WAIT_AFTER_REJECT_MS);
  return pending(keys, t);
}
