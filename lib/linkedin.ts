/**
 * LinkedIn lookup via Apify, ported from boss-live (lookup.py), built for Workers:
 * runs start asynchronously and the browser polls, so no request waits on an actor.
 *
 *   1. search  apify~google-search-scraper   site:linkedin.com/in "Name" "Company"  → /in/ slugs
 *   2. people  apimaestro~linkedin-profile-search-scraper (fallback when Google finds nothing)
 *   3. profile apimaestro~linkedin-profile-detail on the best slug → the card the person confirms
 *
 * The browser only ever holds a signed token naming one run, so it can't read anyone else's lookup.
 * Every pay-per-event run is capped (maxItems + maxTotalChargeUsd). Worst case ≈ $0.15 per person.
 */

const APIFY = "https://api.apify.com/v2";
export const ACTORS = {
  search: "apify~google-search-scraper",
  people: "apimaestro~linkedin-profile-search-scraper",
  profile: "apimaestro~linkedin-profile-detail",
} as const;
export type Stage = keyof typeof ACTORS;

export type LookupInput = { name: string; company: string; role: string };

export type Experience = { title: string; company: string; duration: string; location: string; current: boolean; logo: string };
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

export type RunToken = { stage: Stage; run: string; input: LookupInput; slugs: string[]; tried: string[]; exp: number };

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
    return t.exp > Date.now() ? t : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ apify */

type Run = { id: string; status: string; defaultDatasetId: string };

export async function startRun(token: string, stage: Stage, input: Record<string, unknown>): Promise<Run> {
  const params = new URLSearchParams({ token, timeout: "90", memory: "512" });
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
  });
  if (!res.ok) throw new Error(`apify start ${stage} ${res.status}`);
  return ((await res.json()) as { data: Run }).data;
}

export async function getRun(token: string, run: string): Promise<Run> {
  const res = await fetch(`${APIFY}/actor-runs/${encodeURIComponent(run)}?token=${token}`);
  if (!res.ok) throw new Error(`apify run ${res.status}`);
  return ((await res.json()) as { data: Run }).data;
}

export async function items<T = Record<string, unknown>>(token: string, dataset: string): Promise<T[]> {
  const res = await fetch(`${APIFY}/datasets/${encodeURIComponent(dataset)}/items?token=${token}&clean=true&format=json`);
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
  return { firstname: parts[0], lastname: parts.length > 1 ? parts[parts.length - 1] : "" };
}

export const profileInput = (slug: string) => ({ username: slug });

/* ------------------------------------------------------------------ matching */

const STOP = new Set(["pvt", "ltd", "private", "limited", "inc", "llc", "corp", "the", "of", "and", "at", "by", "in", "co", "technologies", "technology", "labs", "hq"]);
export const tokens = (s: string) => new Set((s || "").toLowerCase().match(/[a-z0-9]+/g)?.filter((t) => t.length > 1 && !STOP.has(t)) ?? []);
const overlap = (a: Set<string>, b: Set<string>) => [...a].filter((t) => b.has(t)).length;

const IN_URL = /https?:\/\/(?:[a-z]{2,3}\.)?linkedin\.com\/in\/([A-Za-z0-9\-%_À-ɏ]+)\/?/i;

export function slugFromUrl(url: string): string | null {
  const m = IN_URL.exec(url || "");
  return m ? decodeURIComponent(m[1]).toLowerCase() : null;
}

type Serp = { organicResults?: { url?: string; title?: string; description?: string }[] };

/** Google results → up to 4 slugs, those whose title or snippet mention the company first. */
export function slugsFromSerp(pages: Serp[], { name, company }: LookupInput): string[] {
  const comp = tokens(company), who = tokens(name);
  const hits: string[] = [], rest: string[] = [];
  for (const page of pages)
    for (const r of page.organicResults ?? []) {
      const slug = slugFromUrl(r.url ?? "");
      if (!slug || hits.includes(slug) || rest.includes(slug)) continue;
      const text = tokens(`${r.title ?? ""} ${r.description ?? ""}`);
      if (who.size && !overlap(who, text)) continue; // the name must appear somewhere
      (overlap(comp, text) ? hits : rest).push(slug);
    }
  return [...hits, ...rest].slice(0, 4);
}

type Raw = {
  basic_info?: {
    fullname?: string; headline?: string; profile_picture_url?: string; public_identifier?: string; profile_url?: string;
    current_company?: string; current_company_logo_url?: string; about?: string; location?: { full?: string } | string;
  };
  experience?: { title?: string; company?: string; duration?: string; location?: string; is_current?: boolean; company_logo_url?: string }[];
};

export function slugsFromPeople(rows: Raw[], { company, role }: LookupInput): string[] {
  const comp = tokens(company), r = tokens(role);
  return rows
    .filter((x) => x.basic_info?.public_identifier)
    .map((x) => {
      const hl = tokens(x.basic_info?.headline ?? "");
      return { slug: x.basic_info!.public_identifier!.toLowerCase(), s: (overlap(comp, hl) ? 2 : 0) + (overlap(r, hl) ? 1 : 0) + (x.basic_info?.profile_picture_url ? 0.2 : 0) };
    })
    .sort((a, b) => b.s - a.s)
    .map((x) => x.slug)
    .slice(0, 3);
}

/** 0–1: 0.6 for the name, 0.4 if the company shows up anywhere on the profile. */
export function scoreProfile(p: Raw, { name, company }: LookupInput): number {
  const bi = p.basic_info ?? {};
  const want = tokens(name), got = tokens(bi.fullname ?? "");
  const nameSim = want.size ? overlap(want, got) / want.size : 0;
  const comp = tokens(company);
  const hay = [bi.headline, bi.current_company, bi.about, ...(p.experience ?? []).map((e) => e.company)].map((h) => tokens(h ?? ""));
  return 0.6 * nameSim + (comp.size && hay.some((h) => overlap(comp, h)) ? 0.4 : 0);
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
    })),
    score: Math.round(score * 100) / 100,
  };
}

/* ------------------------------------------------------------------ validation + rate limit */

export function cleanInput(raw: unknown): LookupInput | null {
  if (!raw || typeof raw !== "object") return null;
  const g = (k: string) => String((raw as Record<string, unknown>)[k] ?? "").replace(/["\n\r]/g, " ").trim().slice(0, 80);
  const input = { name: g("name"), company: g("company"), role: g("role") };
  return input.name.length >= 2 && input.company.length >= 2 ? input : null;
}

/** At most `limit` lookups per IP per hour, counted in KV. Fails open if KV is missing (local dev). */
export async function allowLookup(kv: KVNamespace | undefined, ip: string, limit = 6): Promise<boolean> {
  if (!kv) return true;
  const key = `rl:linkedin:${ip}:${Math.floor(Date.now() / 3_600_000)}`;
  const n = Number((await kv.get(key)) ?? 0);
  if (n >= limit) return false;
  await kv.put(key, String(n + 1), { expirationTtl: 3700 });
  return true;
}
