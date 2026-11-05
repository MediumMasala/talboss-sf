/**
 * The "Is this you?" match guard. A LinkedIn profile is offered only when it is very likely the person who typed
 * the form, so a stranger who merely shares the name is never shown:
 *
 *   name     first AND last name both match (normalised tokens, in any order): exactly, as a known nickname
 *            (Sam ~ Samuel, Bob ~ Robert), as a first-name short form (Alex ~ Alexander), or as a close
 *            transliteration (Tripathi ~ Tripathy, Aaryan ~ Aryan, Mohammed ~ Muhammad).
 *   company  the typed company, legal and descriptive suffixes stripped (Inc, LLC, Labs, Technologies, AI, …),
 *            against the current company, the current or two most recent roles, and the headline.
 *   title    the typed role against the headline and the current or two most recent titles: at least two shared
 *            meaningful words (or the only one typed). Seniority words (senior, staff, lead, …) don't count.
 *
 * pass = name AND (company OR title). Everything else is "not found", and the flow offers the paste-link path.
 * No imports on purpose: scripts/linkedin-match.test.mjs loads this file directly with `node --test`.
 */

export type MatchInput = { name: string; company: string; role: string };
export type MatchProfile = {
  fullname: string;
  headline?: string;
  currentCompany?: string;
  experience?: { title?: string; company?: string; current?: boolean }[];
};
export type Match = { name: boolean; company: boolean; title: boolean; pass: boolean; score: number };

/** Scores: name + company = 0.9 (+0.1 with the title too), name + title = 0.7, anything else = 0. */
export const MATCH = { pass: 0.7, sure: 0.9 } as const;

/* ------------------------------------------------------------------ normalising */

const FOLD: Record<string, string> = { ø: "o", ł: "l", ß: "ss", æ: "ae", œ: "oe", đ: "d", ð: "d", þ: "th", ı: "i" };

/** Lowercase, diacritics off (José → jose, Søren → soren), apostrophes dropped (O'Neil → oneil). */
export const fold = (s: string) =>
  (s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[øłßæœđðþı]/g, (c) => FOLD[c] ?? c).replace(/['’`]/g, "");

export const words = (s: string): string[] => fold(s).replace(/&/g, " and ").match(/[\p{L}\p{M}\p{N}]+/gu) ?? [];

/** Every contiguous run of `needle` inside `hay`. */
const seq = (hay: string[], needle: string[]) => {
  if (!needle.length || needle.length > hay.length) return false;
  for (let i = 0; i + needle.length <= hay.length; i++) if (needle.every((w, j) => hay[i + j] === w)) return true;
  return false;
};
const startsWith = (hay: string[], needle: string[]) => needle.length > 0 && needle.length <= hay.length && needle.every((w, j) => hay[j] === w);

/** Current roles plus the two most recent (LinkedIn lists newest first). */
const recent = (p: MatchProfile) => (p.experience ?? []).filter((e, i) => e.current || i < 2);

/* ------------------------------------------------------------------ name */

const PREFIX = new Set(["mr", "mrs", "ms", "miss", "mx", "dr", "prof", "sir"]);
const SUFFIX = new Set(["jr", "sr", "ii", "iii", "iv", "phd", "mba", "cfa", "cpa", "pmp", "esq"]);

const NICKNAMES: string[][] = [
  ["samuel", "sam", "sammy"], ["samantha", "sam", "sammy"], ["robert", "bob", "bobby", "rob", "robbie", "bert"],
  ["william", "bill", "billy", "will", "liam"], ["michael", "mike", "mikey", "mick"], ["richard", "rick", "rich", "dick", "ricky"],
  ["edward", "ed", "eddie", "ted", "ned"], ["james", "jim", "jimmy", "jamie"], ["john", "jack", "johnny", "jon"],
  ["jonathan", "jon", "jonny"], ["joseph", "joe", "joey"], ["anthony", "tony"], ["andrew", "andy", "drew"],
  ["katherine", "catherine", "kathryn", "kate", "katie", "kathy", "cathy", "kat"], ["elizabeth", "liz", "lizzie", "beth", "betsy", "eliza"],
  ["margaret", "maggie", "meg", "peggy"], ["charles", "charlie", "chuck"], ["lawrence", "larry"], ["gerald", "jerry"],
  ["henry", "harry", "hank"], ["francis", "frank"], ["theodore", "theo", "ted"], ["christopher", "chris", "kit"],
  ["susan", "sue", "susie"], ["patricia", "pat", "trish", "patty"], ["victoria", "vicky", "tori"], ["abigail", "abby"],
  ["mohammed", "mohd", "md"], ["siddharth", "sid"], ["abhishek", "abhi"], ["abhinav", "abhi"], ["venkatesh", "venky"],
];
const NICK = new Map<string, Set<number>>();
NICKNAMES.forEach((group, i) => group.forEach((n) => NICK.set(n, (NICK.get(n) ?? new Set()).add(i))));

/** Phonetic skeleton for transliterations: Tripathy → tripati, Aaryan → aryan, Phillip → filip. */
const skel = (s: string) =>
  s.replace(/ph/g, "f").replace(/ck/g, "k").replace(/q/g, "k").replace(/w/g, "v").replace(/ee/g, "i").replace(/oo/g, "u")
    .replace(/([bcdgjkpst])h/g, "$1").replace(/(.)\1+/g, "$1").replace(/y$/, "i");
const consonants = (s: string) => s[0] + s.slice(1).replace(/[aeiouy]/g, "");

function lev(a: string, b: string) {
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}

/** One typed name part against one profile name part. Short forms (Alex ~ Alexander) only for first names. */
export function namePartMatches(a: string, b: string, kind: "first" | "last"): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const na = NICK.get(a), nb = NICK.get(b);
  if (na && nb && [...na].some((g) => nb.has(g))) return true;
  const short = Math.min(a.length, b.length);
  if (kind === "first" && short >= 3 && (a.startsWith(b) || b.startsWith(a))) return true;
  const sa = skel(a), sb = skel(b);
  if (sa === sb) return true;
  if (short >= 6 && sa[0] === sb[0] && consonants(sa) === consonants(sb)) return true; // mohammed ~ muhammad
  return short >= 7 && lev(sa, sb) <= 1; // krishnan ~ krishnen
}

/** The typed name as [first, last]: titles (Dr), suffixes (Jr, PhD) and initials dropped. last is "" for one word. */
export function nameParts(name: string): [string, string] {
  let t = words(name).filter((w) => w.length > 1);
  while (t.length > 1 && PREFIX.has(t[0])) t = t.slice(1);
  while (t.length > 1 && SUFFIX.has(t[t.length - 1])) t = t.slice(0, -1);
  return [t[0] ?? "", t.length > 1 ? t[t.length - 1] : ""];
}

/** First AND last name both appear in `text` (a profile's full name, or a Google result title), as two different words. */
export function nameMatches(typed: string, text: string): boolean {
  const [first, last] = nameParts(typed);
  if (!first) return false;
  const got = words(text);
  for (let i = 0; i < got.length; i++) {
    if (!namePartMatches(first, got[i], "first")) continue;
    if (!last) return true;
    if (got.some((w, j) => j !== i && namePartMatches(last, w, "last"))) return true;
  }
  return false;
}

/* ------------------------------------------------------------------ company */

const COMPANY_SUFFIX = new Set([
  // legal
  "inc", "incorporated", "llc", "llp", "lp", "ltd", "limited", "pvt", "private", "corp", "corporation", "co", "company",
  "gmbh", "plc", "sa", "ag", "bv", "pte", "pty", "srl", "oy", "and",
  // descriptive
  "labs", "lab", "technologies", "technology", "tech", "ai", "hq", "io", "com", "app", "software", "systems", "solutions",
  "group", "holdings", "studio", "studios", "global", "international", "india", "usa",
]);

/** "The Halcyon Labs, Inc." → ["halcyon"]. Never strips the last word, so "Labs" alone stays ["labs"]. */
export function companyCore(s: string): string[] {
  let t = words(s);
  if (t.length > 1 && t[0] === "the") t = t.slice(1);
  while (t.length > 1 && COMPANY_SUFFIX.has(t[t.length - 1])) t = t.slice(0, -1);
  return t;
}

/** The typed company inside free text (a headline or a Google snippet): its core words, in order, or squashed (Open AI ~ OpenAI). */
export function companyInText(company: string, text: string): boolean {
  const want = companyCore(company), squash = want.join("");
  if (squash.length < 2) return false;
  const hay = words(text);
  return seq(hay, want) || hay.includes(squash);
}

export function companyMatches(company: string, p: MatchProfile): boolean {
  const want = companyCore(company), squash = want.join("");
  if (squash.length < 2) return false;
  const fields = [p.currentCompany ?? "", ...recent(p).map((e) => e.company ?? "")];
  for (const f of fields) {
    const got = companyCore(f), g = got.join("");
    if (!g) continue;
    // Equal, or one is the start of the other (Google ~ Google DeepMind, Meta ~ Meta Platforms).
    if (g === squash || startsWith(got, want) || (g.length >= 3 && startsWith(want, got))) return true;
  }
  return companyInText(company, p.headline ?? "");
}

/* ------------------------------------------------------------------ title */

const PHRASES: [RegExp, string][] = [
  [/\bmember of (the )?technical staff\b/g, " mts "],
  [/\bmachine learning\b/g, " ml "], [/\bartificial intelligence\b/g, " ai "], [/\bvice president\b/g, " vp "],
  [/\buser experience\b/g, " ux "], [/\buser interface\b/g, " ui "], [/\bco ?founder\b/g, " founder "],
  [/\bsoftware (development|developer|dev)( engineer)?\b/g, " software engineer "],
  [/\bchief technology officer\b/g, " cto "], [/\bchief executive officer\b/g, " ceo "], [/\bchief product officer\b/g, " cpo "],
  [/\bchief operating officer\b/g, " coo "], [/\bchief financial officer\b/g, " cfo "],
  [/\bfull ?stack\b/g, " fullstack "], [/\bfront ?end\b/g, " frontend "], [/\bback ?end\b/g, " backend "],
];
const ABBR: Record<string, string> = {
  swe: "software engineer", sde: "software engineer", sre: "site reliability engineer", pm: "product manager",
  tpm: "technical program manager", em: "engineer manager", eng: "engineer", engr: "engineer", mgr: "manager",
  dev: "developer", ds: "data scientist", mle: "ml engineer", vp: "vp", dir: "director",
};
const STEM: Record<string, string> = {
  engineering: "engineer", engineers: "engineer", developers: "developer", development: "developer",
  management: "manager", managing: "manager", managers: "manager", design: "designer", designers: "designer",
  science: "scientist", scientists: "scientist", researcher: "research", analytics: "analyst", analysis: "analyst",
  operations: "ops", marketer: "marketing", products: "product", strategist: "strategy", investments: "investment",
};
/** Seniority, filler and joiners: shared, they say nothing about the job. */
const WEAK = new Set([
  "senior", "sr", "junior", "jr", "lead", "principal", "staff", "head", "associate", "assistant", "intern", "chief",
  "member", "team", "i", "ii", "iii", "iv", "of", "and", "the", "at", "for", "in", "to", "a", "an", "with", "on", "ex",
]);

export function titleWords(s: string): Set<string> {
  let t = ` ${words(s).join(" ")} `;
  for (const [re, to] of PHRASES) t = t.replace(re, to);
  const out = new Set<string>();
  for (const w of t.split(" ").filter(Boolean))
    for (const x of (ABBR[w] ?? w).split(" ")) {
      const stem = STEM[x] ?? x;
      if (!WEAK.has(stem)) out.add(stem);
    }
  return out;
}

/** The typed role in free text: two shared meaningful words, or the only one typed. */
export function titleInText(role: string, text: string): boolean {
  const want = titleWords(role);
  if (!want.size) return false;
  const got = titleWords(text);
  return [...want].filter((w) => got.has(w)).length >= Math.min(2, want.size);
}

export function titleMatches(role: string, p: MatchProfile): boolean {
  return [p.headline ?? "", ...recent(p).map((e) => e.title ?? "")].some((f) => titleInText(role, f));
}

/* ------------------------------------------------------------------ search data */

export type SerpResult = {
  title?: string; websiteTitle?: string; description?: string;
  personalInfo?: { companyName?: string; jobTitle?: string; location?: string };
};
export type SerpCard = { fullname: string; headline: string; currentCompany: string; location: string };

const clean = (s: string) => s.replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, " ").replace(/\s*(\.\.\.|…)\s*$/, "").replace(/\s+/g, " ").trim();

/**
 * A card from one Google result for a linkedin.com/in/ page, using only LinkedIn's structured bits: the name
 * ("LinkedIn · Name", or the title before " - "), the current company (Google's personalInfo, or the snippet's
 * "Experience: X", or a title shaped "Name - Role - Company"), the headline (the title after the name, or the job
 * title) and the location. Free mentions in the snippet ("ex-Grapevine", an email domain) never count as the company.
 * The match guard reads this card exactly like a full profile, with no experience rows.
 */
export function serpCard(r: SerpResult): SerpCard {
  const title = clean((r.title ?? "").replace(/\s*\|\s*LinkedIn\s*$/i, ""));
  const parts = title.split(/\s+[-–—]\s+/).map((p) => p.trim()).filter(Boolean);
  const fromSite = /·\s*(.+)$/.exec(r.websiteTitle ?? "")?.[1]?.trim();
  const fullname = fromSite || parts[0] || "";
  const rest = parts.slice(1);
  const snippet = r.description ?? "";
  const experience = /Experience:\s*([^·]+?)\s*(?:·|\.\.\.|…|$)/.exec(snippet)?.[1]?.trim();
  // "Name - Role - Company" only when the title is whole (not cut off with "…") and has no other separators.
  const whole = !/(\.\.\.|…)\s*(\|\s*LinkedIn)?\s*$/i.test(r.title ?? "") && !title.includes("|");
  const company = clean(r.personalInfo?.companyName || experience || (whole && rest.length === 2 ? rest[1] : "") || "");
  const headline = clean(r.personalInfo?.jobTitle || rest.join(" - ") || "");
  const location = clean(r.personalInfo?.location || /Location:\s*([^·]+?)\s*(?:·|\.|$)/.exec(snippet)?.[1] || "");
  return { fullname: clean(fullname), headline, currentCompany: company, location };
}

/* ------------------------------------------------------------------ verdict */

export function matchProfile(p: MatchProfile, input: MatchInput): Match {
  const name = nameMatches(input.name, p.fullname);
  const company = name && companyMatches(input.company, p);
  const title = name && titleMatches(input.role, p);
  const pass = name && (company || title);
  return { name, company, title, pass, score: pass ? (company ? 0.9 : 0.6) + (title ? 0.1 : 0) : 0 };
}
