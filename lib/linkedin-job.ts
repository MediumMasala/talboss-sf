/**
 * One paid search per person (name + company), shared by every start that names them.
 *
 * The flow fires /api/linkedin/start at A2 (name + company, no title yet) so the searches run while the person types
 * their title. The A3 start (same name + company, now with the title) ATTACHES to that job: same Apify runs, same
 * profile store, nothing new paid for, nothing counted against the limits again. The title only changes how the
 * results are scored, so the attached lookup starts with no candidates and re-reads every run with the new title.
 *
 * No imports on purpose: scripts/linkedin-prefetch.test.mjs loads this file directly with `node --test`.
 */

export type JobInput = { name: string; company: string; role: string };

/** The Apify runs a job launched. Never changes after the start; every token of the job carries a copy. */
export type JobRuns = { search?: string; people?: string; guess?: string; gslug?: string };

/** Stage timings in ms since the first start (t0). Exposed on poll as `timings`. */
export type Timings = {
  /** The paid runs were launched (the start request's own time). */
  start?: number;
  /** A later start (with the title) attached to this job. */
  attach?: number;
  /** When a poll first saw each run finished. */
  search?: number; people?: number; guess?: number; pull?: number;
  /** Apify's own run time per run (startedAt → finishedAt), to split actor time from our overhead. */
  apify?: { search?: number; people?: number; guess?: number; pull?: number };
  /** First card returned (partial or full), the full card after a partial, and which lane produced the first. */
  first?: number; full?: number; src?: "people" | "search" | "guess" | "cache";
  /** Polls so far. */
  n?: number;
  /** 1 when the candidates came from the 6 h cache. */
  cache?: 1;
};

/** What the KV job record and every token of the job hold. */
export type Job = { id: string; input: JobInput; j: JobRuns; t0: number; tm?: Timings };

/** The token fields an attached lookup starts from (RunToken in lib/linkedin.ts is a superset). */
export type Attached = {
  v: 2; id: string; input: JobInput; runs: { search?: string; people?: string; profile?: string };
  pull?: string; gs?: 1; pulls: number; cands: never[]; shown: string[]; dead: string[];
  t0: number; j: JobRuns; tm: Timings; pa?: 1; exp: number;
};

/** How long a job can be attached to: the same 6 h as the candidate cache (the runs' datasets outlive it). */
export const JOB_TTL_MS = 6 * 3600_000;

/** Name + company, case, accents, spacing and punctuation folded: "Sanchit  Tripathi" / "grapevine" is one job. */
export const jobBasis = ({ name, company }: { name: string; company: string }) =>
  `${name}|${company}`.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}|]+/gu, "");

export const sameJob = (a: { name: string; company: string }, b: { name: string; company: string }) => jobBasis(a) === jobBasis(b);

/**
 * The attached lookup for `input`, or null when the job is for someone else or too old. The title (and the partial
 * opt-in) come from the new start; the runs, the profile store and the clock come from the job.
 */
export function attach(job: Job | null | undefined, input: JobInput, now: number, opts: { partial?: boolean } = {}): Attached | null {
  if (!job?.id || !job.j || !sameJob(job.input, input) || now - job.t0 > JOB_TTL_MS) return null;
  const { search, people, guess, gslug } = job.j;
  return {
    v: 2,
    id: job.id,
    input,
    runs: { search, people, profile: guess },
    ...(guess ? { pull: gslug, gs: 1 as const } : {}),
    pulls: 0,
    cands: [],
    shown: [],
    dead: [],
    t0: job.t0,
    j: job.j,
    // Only the launch time carries over: first/full belong to the lookup that showed them.
    tm: { ...(job.tm?.start !== undefined ? { start: job.tm.start } : {}), attach: now - job.t0 },
    ...(opts.partial ? { pa: 1 as const } : {}),
    exp: 0,
  };
}

/**
 * The slug a person most often owns: "Sanchit Tripathi" → "sanchit-tripathi". Pulled at once, next to the searches,
 * because a profile pull takes ~3 s and the people search ~8–14 s. It's shown only if it passes the match guard
 * like any other profile, so a stranger who owns the slug is never offered (and never stored).
 */
export function guessSlug(name: string): string | null {
  const parts = (name || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['’`.]/g, "")
    .split(/[^a-z0-9]+/).filter((w) => w.length > 1) // initials ("K.") are dropped
    .filter((w, i, all) => !(i === 0 && all.length > 2 && ["mr", "mrs", "ms", "dr", "prof"].includes(w)))
    .filter((w, i, all) => !(i === all.length - 1 && all.length > 2 && ["jr", "sr", "ii", "iii", "phd", "mba"].includes(w)));
  if (parts.length < 2 || parts.length > 4) return null;
  const slug = parts.join("-");
  return slug.length >= 5 && slug.length <= 60 ? slug : null;
}
