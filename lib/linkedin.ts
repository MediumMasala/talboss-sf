/**
 * LinkedIn lookup via Apify, ported from boss-live (lookup.py), built for Workers:
 * runs start asynchronously and the browser polls, so no request waits on an actor.
 *
 *   search  apify~google-search-scraper   site:linkedin.com/in "Name" Company  → ranked /in/ slugs
 *   people  apimaestro~linkedin-profile-search-scraper  first + last name → up to 10 FULL profiles
 *   profile apimaestro~linkedin-profile-detail  one slug → one full profile (~3 s): the guessed slug
 *           ("first-last"), pulled next to the searches, and the slugs Google found that the people search didn't
 *
 * search, people and the guessed slug start together; the first match that clears the guard wins (see
 * linkedin-flow.ts). The browser only ever holds a signed token naming its own runs, so it can't read anyone else's
 * lookup. Every pay-per-event run is capped (maxItems + maxTotalChargeUsd). Worst case ≈ $0.072 per person
 * (people ≤ $0.05, the guess + ≤ 3 profile pulls at $0.005, one SERP page). A pull that finds nobody costs nothing.
 */

import { companyInText, matchProfile, nameMatches, serpCard, titleInText, type MatchProfile, type SerpResult } from "./linkedin-match";
import type { JobRuns, Timings } from "./linkedin-job";

const APIFY = "https://api.apify.com/v2";
export const ACTORS = {
  search: "apify~google-search-scraper",
  people: "apimaestro~linkedin-profile-search-scraper",
  profile: "apimaestro~linkedin-profile-detail",
} as const;
export type Stage = keyof typeof ACTORS;

export type LookupInput = { name: string; company: string; role: string };

export type Experience = {
  title: string; company: string; duration: string; location: string; current: boolean; logo: string;
  /** What they wrote about the role (≤ 400 chars), when they wrote anything. */
  description?: string;
};
export type Profile = {
  fullname: string;
  headline: string;
  photo: string;
  location: string;
  url: string;
  slug: string;
  currentCompany: string;
  companyLogo: string;
  experience: Experience[];
  /** Up to two schools, when LinkedIn lists them. Optional: older cards and previews may not have it. */
  education?: { school: string; degree: string }[];
  /** Their "About" text (≤ 800 chars, emails, links and phone numbers removed). */
  about?: string;
  /** Top skills, from the profile and its roles (≤ 10). */
  skills?: string[];
  /** Up to two projects they list. */
  projects?: { name: string; description: string }[];
  score: number;
};

/* ------------------------------------------------------------------ tokens */

const enc = new TextEncoder();
const b64url = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64url = (s: string) => decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))));

async function mac(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(`linkedin:${value}`)));
  return Array.from(sig.subarray(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** A slug we might show. h: Google listed it with the company in the snippet. r: its Google rank.
 *  sc: profile score (0–1) once we hold its full profile; b: tie-break bonus (role in headline, photo).
 *  ps: the guard's score on Google's search data alone (only kept when ≥ MATCH.sure; enables a partial card).
 *  o: the lane that found it (people search, Google, the guessed slug). */
export type Cand = { s: string; h?: 1; r?: number; sc?: number; b?: number; ps?: number; o?: "people" | "search" | "guess" };

/** Everything a lookup needs between polls. Signed (not encrypted): it names run ids and public slugs, never profile data. */
export type RunToken = {
  v: 2;
  /** Random id of this lookup's server-side profile store (KV "li:d:<id>"). */
  id: string;
  input: LookupInput;
  runs: { search?: string; people?: string; profile?: string };
  /** Slug the in-flight profile run is pulling. */
  pull?: string;
  pulls: number;
  cands: Cand[];
  shown: string[];
  dead: string[];
  manual?: 1;
  t0: number;
  /** Stop waiting on Google for a better match at this time (ms). Set short after "not me". */
  until?: number;
  /** The job's original runs (lib/linkedin-job.ts), so a later start can attach to them. Absent on cache hits and pasted links. */
  j?: JobRuns;
  /** The in-flight profile run is the guessed slug (not a Google hit). */
  gs?: 1;
  /** The browser accepts partial cards (search data first, experience rows on a later poll). */
  pa?: 1;
  /** Slug of the partial card on screen, waiting for its full profile. */
  pp?: string;
  /** Stage timings (ms since t0). */
  tm?: Timings;
  exp: number;
};

export async function signToken(secret: string, t: RunToken) {
  const body = b64url(JSON.stringify(t));
  return `${body}.${await mac(secret, body)}`;
}

export async function readToken(secret: string, token: string | null): Promise<RunToken | null> {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = await mac(secret, body);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff) return null;
  try {
    const t = JSON.parse(unb64url(body)) as RunToken;
    return t.v === 2 && t.exp > Date.now() ? t : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ photos */

/** LinkedIn's photo CDN only: the proxy refuses every other host, so it can't be used as an open proxy. */
export const PHOTO_HOST = /^https:\/\/media\.licdn\.com\//;

/** Same-origin, signed link to a profile photo: /api/linkedin/photo?u=<url>&s=<mac>. Empty when there's no photo. */
export async function photoLink(secret: string, url: string): Promise<string> {
  if (!url || !PHOTO_HOST.test(url)) return "";
  return `/api/linkedin/photo?u=${encodeURIComponent(b64url(url))}&s=${await mac(secret, `photo:${url}`)}`;
}

export async function readPhotoLink(secret: string, u: string | null, s: string | null): Promise<string | null> {
  if (!u || !s || u.length > 4000) return null;
  let url: string;
  try {
    url = unb64url(u);
  } catch {
    return null;
  }
  if (!PHOTO_HOST.test(url)) return null;
  const expected = await mac(secret, `photo:${url}`);
  if (s.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < s.length; i++) diff |= s.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff ? null : url;
}

/* ------------------------------------------------------------------ apify */

export type Run = { id: string; status: string; defaultDatasetId: string; startedAt?: string; finishedAt?: string };

/** Apify's own time limits per run (s). Observed (Nov 2026): SERP 4–52 s (Google retries), people 4–14 s, profile 2.5–6.6 s. */
export const RUN_TIMEOUT_S: Record<Stage, number> = { search: 40, people: 45, profile: 20 };

export async function startRun(token: string, stage: Stage, input: Record<string, unknown>): Promise<Run> {
  const params = new URLSearchParams({ token, timeout: String(RUN_TIMEOUT_S[stage]), memory: "512" });
  // Pay-per-event actors take hard caps; the Google SERP actor rejects them (its cost is bounded by the input).
  if (stage === "people") {
    params.set("maxItems", "10");
    params.set("maxTotalChargeUsd", "0.10");
  }
  if (stage === "profile") {
    params.set("maxItems", "1");
    params.set("maxTotalChargeUsd", "0.06");
  }
  const res = await fetch(`${APIFY}/acts/${ACTORS[stage]}/runs?${params}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`apify start ${stage} ${res.status}`);
  return ((await res.json()) as { data: Run }).data;
}

/** A run's status. waitS > 0: Apify holds the request until the run finishes or waitS seconds pass (max 60). */
export async function getRun(token: string, run: string, waitS = 0, signal?: AbortSignal): Promise<Run> {
  const wait = waitS > 0 ? `&waitForFinish=${Math.min(60, Math.ceil(waitS))}` : "";
  const timeout = AbortSignal.timeout(8_000 + Math.max(0, waitS) * 1000);
  const res = await fetch(`${APIFY}/actor-runs/${encodeURIComponent(run)}?token=${token}${wait}`, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
  if (!res.ok) throw new Error(`apify run ${res.status}`);
  return ((await res.json()) as { data: Run }).data;
}

export async function items<T = Record<string, unknown>>(token: string, dataset: string): Promise<T[]> {
  const res = await fetch(`${APIFY}/datasets/${encodeURIComponent(dataset)}/items?token=${token}&clean=true&format=json&limit=20`, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) throw new Error(`apify dataset ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? (data as T[]) : [];
}

/* ------------------------------------------------------------------ inputs */

export function searchInput({ name, company }: LookupInput) {
  return {
    // One query keeps the search fast; the people-search fallback covers misses.
    queries: `site:linkedin.com/in "${name}" ${company}`,
    resultsPerPage: 10,
    maxPagesPerQuery: 1,
    countryCode: "us",
    languageCode: "en",
    mobileResults: false,
    saveHtml: false,
    saveHtmlToKeyValueStore: false,
  };
}

export function peopleInput({ name }: LookupInput) {
  const parts = name.trim().split(/\s+/);
  return { firstname: parts[0], lastname: parts.length > 1 ? parts[parts.length - 1] : "", max_profiles: 10 };
}

export const profileInput = (slug: string) => ({ username: slug });

/* ------------------------------------------------------------------ matching */

const STOP = new Set(["pvt", "ltd", "private", "limited", "inc", "llc", "corp", "the", "of", "and", "at", "by", "in", "co", "technologies", "technology", "labs", "hq"]);
export const tokens = (s: string) =>
  new Set(
    (s || "").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "") // José → jose
      .match(/[\p{L}\p{N}]+/gu)?.filter((t) => t.length > 1 && !STOP.has(t)) ?? [],
  );
const overlap = (a: Set<string>, b: Set<string>) => [...a].filter((t) => b.has(t)).length;

const IN_URL = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\/([A-Za-z0-9\-%_À-ɏ]+)\/?/i;

export function slugFromUrl(url: string): string | null {
  const m = IN_URL.exec(url || "");
  return m ? decodeURIComponent(m[1]).toLowerCase() : null;
}

type Serp = { organicResults?: (SerpResult & { url?: string })[] };

/**
 * Google results → up to 4 candidates worth pulling. The result title must carry the first AND last name, and the
 * title or snippet must show the company or the role (the match guard's rules), so we never pay to pull a stranger.
 * h = the company showed up.
 */
export function candsFromSerp(pages: Serp[], { name, company, role }: LookupInput): Cand[] {
  const out: Cand[] = [];
  for (const page of pages)
    for (const r of page.organicResults ?? []) {
      const slug = slugFromUrl(r.url ?? "");
      if (!slug || out.some((c) => c.s === slug)) continue;
      if (!nameMatches(name, r.title ?? "")) continue;
      const text = `${r.title ?? ""} ${r.description ?? ""}`;
      const atCompany = companyInText(company, text);
      if (!atCompany && !titleInText(role, text)) continue;
      out.push(atCompany ? { s: slug, h: 1, r: out.length } : { s: slug, r: out.length });
    }
  return out.slice(0, 4);
}

/** The search-data card for one slug Google found (lib/linkedin-match.ts serpCard), as a Raw the store can hold. */
export function serpRaw(pages: Serp[], slug: string): Raw | null {
  for (const page of pages)
    for (const r of page.organicResults ?? []) {
      if (slugFromUrl(r.url ?? "") !== slug) continue;
      const c = serpCard(r);
      if (!c.fullname) return null;
      return {
        serp: 1,
        basic_info: {
          fullname: c.fullname.slice(0, 120), headline: c.headline.slice(0, 300), current_company: c.currentCompany.slice(0, 120),
          location: c.location.slice(0, 120), public_identifier: slug, profile_url: `https://www.linkedin.com/in/${slug}`,
        },
        experience: [],
      };
    }
  return null;
}

export type Raw = {
  basic_info?: {
    fullname?: string; headline?: string; profile_picture_url?: string; public_identifier?: string; profile_url?: string;
    current_company?: string; current_company_logo_url?: string; about?: string; location?: { full?: string } | string;
    top_skills?: string[];
  };
  experience?: {
    title?: string; company?: string; duration?: string; location?: string; is_current?: boolean; company_logo_url?: string;
    description?: string; skills?: string[];
  }[];
  education?: { school?: string; degree?: string; degree_name?: string; field_of_study?: string; duration?: string }[];
  projects?: { name?: string; description?: string }[];
  /** Built from Google's search data only (no experience rows yet). */
  serp?: 1;
  /** Tombstone: we pulled this slug and got nobody ("empty") or someone who fails the guard ("guard"). No data kept. */
  gone?: "empty" | "guard";
  /** With gone "guard": the (folded) title it failed for. Another title may still match, so it can be pulled again. */
  for?: string;
};

const str = (v: unknown, n: number) => (typeof v === "string" ? v.slice(0, n) : undefined);

/** Free text from a profile, minus contact details (emails, links, phone numbers), whitespace collapsed. */
export function scrub(v: unknown, n: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const t = v
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, " ")
    .replace(/\b(?:https?:\/\/|www\.)\S+/gi, " ")
    .replace(/\+?\d[\d\s().-]{8,}\d/g, " ")
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return t ? (t.length > n ? `${t.slice(0, n).replace(/\s+\S*$/, "")}…` : t) : undefined;
}
const strings = (v: unknown, n: number, each = 60) =>
  Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && x.trim() !== "").slice(0, n).map((x) => x.trim().slice(0, each)) : [];

/** Keep only what we score and show (≈2 KB a profile), so the KV store stays small. */
export function trimRaw(p: Raw): Raw {
  const bi = p.basic_info ?? {};
  const loc = typeof bi.location === "string" ? bi.location : bi.location?.full;
  return {
    basic_info: {
      fullname: str(bi.fullname, 120), headline: str(bi.headline, 300), profile_picture_url: str(bi.profile_picture_url, 600),
      public_identifier: str(bi.public_identifier, 120)?.toLowerCase(), profile_url: str(bi.profile_url, 300),
      current_company: str(bi.current_company, 120), current_company_logo_url: str(bi.current_company_logo_url, 600),
      about: scrub(bi.about, 800), location: str(loc, 120), top_skills: strings(bi.top_skills, 10),
    },
    experience: (p.experience ?? []).slice(0, 6).map((e) => ({
      title: str(e.title, 120), company: str(e.company, 120), duration: str(e.duration, 80), location: str(e.location, 120),
      is_current: Boolean(e.is_current), company_logo_url: str(e.company_logo_url, 600),
      description: scrub(e.description, 400), skills: strings(e.skills, 6),
    })),
    projects: (p.projects ?? []).slice(0, 2).map((x) => ({ name: str(x.name, 100), description: scrub(x.description, 300) })).filter((x) => x.name),
    education: (p.education ?? []).slice(0, 3).map((e) => ({
      school: str(e.school, 160), degree: str(e.degree_name || e.degree, 160), field_of_study: str(e.field_of_study, 160), duration: str(e.duration, 40),
    })),
  };
}

export const slugOf = (p: Raw) => (p.basic_info?.public_identifier ?? "").toLowerCase();

/** Small tie-break among equal scores (ten people share a name): role words in the headline, then a photo. */
export function bonus(p: Raw, { role }: LookupInput): number {
  const hl = tokens(`${p.basic_info?.headline ?? ""} ${(p.experience ?? [])[0]?.title ?? ""}`);
  return (overlap(tokens(role), hl) ? 0.05 : 0) + (p.basic_info?.profile_picture_url ? 0.01 : 0);
}

/** The fields the match guard reads. */
const forMatch = (p: Raw): MatchProfile => ({
  fullname: p.basic_info?.fullname ?? "",
  headline: p.basic_info?.headline,
  currentCompany: p.basic_info?.current_company,
  experience: (p.experience ?? []).map((e) => ({ title: e.title, company: e.company, current: e.is_current })),
});

/**
 * The match guard (lib/linkedin-match.ts): 0 unless first + last name match AND (company OR title) match.
 * name + company = 0.9 (1.0 with the title too); name + title only = 0.7. See MATCH for the thresholds.
 */
export function scoreProfile(p: Raw, input: LookupInput): number {
  return matchProfile(forMatch(p), input).score;
}

export function shapeProfile(p: Raw, score: number): Profile {
  const bi = p.basic_info ?? {};
  const slug = (bi.public_identifier ?? "").toLowerCase();
  return {
    fullname: bi.fullname ?? "",
    headline: bi.headline ?? "",
    photo: bi.profile_picture_url ?? "",
    location: typeof bi.location === "string" ? bi.location : bi.location?.full ?? "",
    url: bi.profile_url || (slug ? `https://www.linkedin.com/in/${slug}` : ""),
    slug,
    currentCompany: bi.current_company ?? "",
    companyLogo: bi.current_company_logo_url ?? "",
    experience: (p.experience ?? []).slice(0, 4).map((e) => ({
      title: e.title ?? "", company: e.company ?? "", duration: e.duration ?? "", location: e.location ?? "",
      current: Boolean(e.is_current), logo: e.company_logo_url ?? "",
      ...(e.description ? { description: scrub(e.description, 400) } : {}),
    })),
    about: scrub(bi.about, 800),
    skills: [...new Set([...strings(bi.top_skills, 10), ...(p.experience ?? []).flatMap((e) => strings(e.skills, 6))])].slice(0, 10),
    projects: (p.projects ?? []).slice(0, 2).filter((x) => x.name).map((x) => ({ name: x.name ?? "", description: scrub(x.description, 300) ?? "" })),
    education: (p.education ?? []).slice(0, 2).map((e) => ({ school: e.school ?? "", degree: [e.degree, e.field_of_study].filter(Boolean).join(", ") })),
    score: Math.round(score * 100) / 100,
  };
}

/* ------------------------------------------------------------------ validation + rate limit */

export type InputProblem = "missing" | "name" | "company";

/**
 * Trim and sanity-check the form. Fails fast on input no lookup could match (a URL or email as a name,
 * digits, one letter), so we never pay for a run that can't succeed.
 */
export function cleanInput(raw: unknown): { ok: true; input: LookupInput } | { ok: false; problem: InputProblem } {
  if (!raw || typeof raw !== "object") return { ok: false, problem: "missing" };
  const g = (k: string) => String((raw as Record<string, unknown>)[k] ?? "").replace(/["\n\r\t]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const input = { name: g("name"), company: g("company"), role: g("role") };
  if (input.name.length < 2 || input.company.length < 2) return { ok: false, problem: "missing" };
  const letters = (input.name.match(/\p{L}/gu) ?? []).length;
  if (letters < 2 || /[0-9@/:]|www\.|https?/i.test(input.name)) return { ok: false, problem: "name" };
  if (!/[\p{L}\p{N}]/u.test(input.company)) return { ok: false, problem: "company" };
  return { ok: true, input };
}

/** At most `limit` calls per IP per hour in `bucket`, counted in KV. Fails open if KV is missing. */
export async function allow(kv: KVNamespace | undefined, bucket: string, ip: string, limit: number): Promise<boolean> {
  if (!kv) return true;
  const key = `rl:${bucket}:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
  const n = Number((await kv.get(key)) ?? 0);
  if (n >= limit) return false;
  await kv.put(key, String(n + 1), { expirationTtl: 3700 });
  return true;
}


/** Hex SHA-256, for cache keys that shouldn't carry names in the clear. */
export async function sha(value: string): Promise<string> {
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(value)));
  return Array.from(d.subarray(0, 16), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * v5 (match guard): v4 entries could hold name-only guesses, so they are never read again. The role is part of
 * the key now, because the guard reads it (name + title can pass without the company).
 */
export const queryKey = async ({ name, company, role }: LookupInput) =>
  `li:q:v5:${await sha(`${name}|${company}|${role}`.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}|]+/gu, ""))}`;
