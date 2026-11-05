// The lookup state machine (lib/linkedin-flow.ts) against a mocked Apify and an in-memory KV. No network, no cost.
// Run: scripts/linkedin-flow-mock.sh   (copies lib/ to a temp dir so Node can load it, then runs this; ~2 min of real timers)
import { startLookup, pollLookup, rejectProfile } from "./lib/linkedin-flow.ts";
import { gateSearch } from "./lib/limits.ts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
class KV { m = new Map<string, string>(); async get(k: string, t?: string) { const v = this.m.get(k); return v == null ? null : t === "json" ? JSON.parse(v) : v; } async put(k: string, v: string) { this.m.set(k, v); } async delete(k: string) { this.m.delete(k); } }

type Plan = Record<string, { ms: number; items: unknown[] }>;
let plan: Plan = {}; let starts: Record<string, number> = {}; const runs = new Map<string, { at: number; ms: number; items: unknown[]; actor: string }>();
let n = 0;
const profile = (slug: string, fullname: string, company: string, title = "Strategy Lead") => ({ basic_info: { fullname, headline: `${title} at ${company}`, public_identifier: slug, current_company: company, profile_picture_url: "https://media.licdn.com/x.jpg" }, experience: [{ title, company, is_current: true }] });
const realFetch = globalThis.fetch;
globalThis.fetch = (async (url: string, init?: RequestInit) => {
  const u = new URL(url);
  const json = (d: unknown) => new Response(JSON.stringify(d), { headers: { "content-type": "application/json" } });
  let m;
  if ((m = /\/v2\/acts\/([^/]+)\/runs/.exec(u.pathname)) && init?.method === "POST") {
    const actor = decodeURIComponent(m[1]); starts[actor] = (starts[actor] ?? 0) + 1;
    const body = JSON.parse(String(init.body));
    const key = actor.includes("detail") ? `detail:${body.username}` : actor;
    const p = plan[key] ?? { ms: 2500, items: [] };
    const id = `run${++n}`; runs.set(id, { at: Date.now(), ms: p.ms, items: p.items, actor: key });
    return json({ data: { id, status: "RUNNING", defaultDatasetId: `ds-${id}` } });
  }
  if ((m = /\/v2\/actor-runs\/([^/]+)$/.exec(u.pathname))) {
    const r = runs.get(m[1])!; const wait = Number(u.searchParams.get("waitForFinish") ?? 0) * 1000;
    const left = r.at + r.ms - Date.now();
    if (left > 0 && wait > 0) await new Promise<void>((res, rej) => { const t = setTimeout(res, Math.min(left, wait)); init?.signal?.addEventListener("abort", () => { clearTimeout(t); rej(new DOMException("aborted", "AbortError")); }); });
    const done = Date.now() >= r.at + r.ms;
    return json({ data: { id: m[1], status: done ? "SUCCEEDED" : "RUNNING", defaultDatasetId: `ds-${m[1]}`, startedAt: new Date(r.at).toISOString(), finishedAt: done ? new Date(r.at + r.ms).toISOString() : undefined } });
  }
  if ((m = /\/v2\/datasets\/ds-([^/]+)\/items/.exec(u.pathname))) return json(runs.get(m[1])!.items);
  return realFetch(url, init);
}) as typeof fetch;

const me = { name: "Sanchit Tripathi", company: "Grapevine", role: "Strategy Lead" };
async function drive(label: string, kv: KV, opts: { prefetchMs?: number; partial?: boolean; pollMs?: number; reject?: boolean } = {}) {
  starts = {}; const keys = { apify: "x", secret: "s3cret", kv: kv as unknown as KVNamespace };
  let gates = 0; const gate = async () => { gates++; return gateSearch(kv as unknown as KVNamespace, "1.2.3.4", me); };
  const t0 = Date.now(); const at = () => Date.now() - t0;
  let pre: any = null;
  if (opts.prefetchMs !== undefined) { pre = await startLookup(keys, { ...me, role: "" }, gate, { partial: opts.partial }); await sleep(opts.prefetchMs); }
  const s: any = await startLookup(keys, me, gate, { token: pre?.token, partial: opts.partial });
  let token = s.token; const out: string[] = [`start ${at()}ms ${s.state}`];
  for (let i = 0; i < 40; i++) {
    await sleep(i === 0 ? 300 : opts.pollMs ?? 150);
    const r: any = await pollLookup(keys, token);
    out.push(`${at()}ms ${r.state}${r.stage ? `(${r.stage})` : ""}${r.partial ? " PARTIAL" : r.partial === false ? " full" : ""}${r.retracted ? " RETRACTED" : ""}${r.profile ? ` ${r.profile.slug} exp${r.profile.experience.length} sc${r.profile.score}` : ""}`);
    if (r.state === "found" && r.partial) { token = r.token; continue; }
    if (r.state === "found" && opts.reject) { opts.reject = false; const n2: any = await rejectProfile(keys, r.next); if (n2.state !== "pending") { out.push(`reject → ${n2.state}`); break; } token = n2.token; out.push("reject → pending"); continue; }
    if (r.state !== "pending") { out.push(`timings ${JSON.stringify(r.timings)}`); break; }
    token = r.token;
  }
  console.log(`\n== ${label}\n  starts ${JSON.stringify(starts)} gates ${gates}\n  ` + out.join("\n  "));
}

const people = (extra: unknown[] = []) => ({ ms: 9000, items: [profile("someone-else", "Sanchit Tripathi", "Infosys", "Analyst"), ...extra] });
const serpPage = (results: unknown[]) => [{ organicResults: results }];

// A: guess lane wins; prefetch 4 s before the A3 start; one paid job
plan = { "apify~google-search-scraper": { ms: 15000, items: [] }, "apimaestro~linkedin-profile-search-scraper": people([profile("sanchit-tripathi", "Sanchit Tripathi", "Grapevine")]), "detail:sanchit-tripathi": { ms: 3000, items: [profile("sanchit-tripathi", "Sanchit Tripathi", "Grapevine")] } };
await drive("A prefetch + guess hit (attach, 1 paid job)", new KV(), { prefetchMs: 4000 });

// B: guess is a stranger, people search wins at 9 s; no prefetch
plan = { ...plan, "detail:sanchit-tripathi": { ms: 3000, items: [profile("sanchit-tripathi", "Sanchit Tripathi", "Wipro", "Driver")] }, "apimaestro~linkedin-profile-search-scraper": people([profile("sanchit-t-9", "Sanchit Tripathi", "Grapevine")]) };
await drive("B guess is a stranger → people search at 9 s", new KV());

// C: partial: SERP lands first at 2 s with a sure search-data card; guess finds nobody; pull fills it in at +3 s
plan = { "apify~google-search-scraper": { ms: 2000, items: serpPage([{ url: "https://www.linkedin.com/in/st-gv", title: "Sanchit Tripathi - Strategy Lead - Grapevine | LinkedIn", websiteTitle: "LinkedIn · Sanchit Tripathi", description: "Experience: Grapevine · Location: SF" }]) }, "apimaestro~linkedin-profile-search-scraper": { ms: 12000, items: [] }, "detail:sanchit-tripathi": { ms: 1000, items: [] }, "detail:st-gv": { ms: 3000, items: [profile("st-gv", "Sanchit Tripathi", "Grapevine")] } };
await drive("C partial card then full", new KV(), { partial: true });

// D: partial retracted: the full profile is someone at another company
plan = { ...plan, "detail:st-gv": { ms: 3000, items: [profile("st-gv", "Sanchit Tripathi", "Wipro", "Driver")] } };
await drive("D partial retracted", new KV(), { partial: true });

// E: same thing without opting in: no partial (old clients unchanged)
plan = { ...plan, "detail:st-gv": { ms: 3000, items: [profile("st-gv", "Sanchit Tripathi", "Grapevine")] } };
await drive("E no opt-in: full card only", new KV());

// F: cache hit after a found lookup; and a different title attaches to the job for free
const kv = new KV();
plan = { "apify~google-search-scraper": { ms: 15000, items: [] }, "apimaestro~linkedin-profile-search-scraper": people([profile("sanchit-tripathi", "Sanchit Tripathi", "Grapevine")]), "detail:sanchit-tripathi": { ms: 3000, items: [profile("sanchit-tripathi", "Sanchit Tripathi", "Grapevine")] } };
await drive("F1 cold", kv);
await drive("F2 repeat = cache hit", kv);
const keys = { apify: "x", secret: "s3cret", kv: kv as unknown as KVNamespace };
const other: any = await startLookup(keys, { ...me, role: "Founder" }, async () => { throw new Error("gate must not run"); });
console.log("\n== F3 another title → attaches via KV:", other.state, "starts", JSON.stringify(starts));

// G: name + title only (0.7) still waits for discovery (25 s from t0, or until runs finish)
plan = { "apify~google-search-scraper": { ms: 8000, items: [] }, "apimaestro~linkedin-profile-search-scraper": { ms: 4000, items: [profile("st-x", "Sanchit Tripathi", "Acme", "Strategy Lead")] }, "detail:sanchit-tripathi": { ms: 1000, items: [] } };
await drive("G 0.7 waits until SERP done (8 s)", new KV());

// H: two starts at once (A2 and A3 fired together): one paid job
{
  const kvH = new KV(); starts = {}; let gates = 0;
  const keysH = { apify: "x", secret: "s3cret", kv: kvH as unknown as KVNamespace };
  const gate = async () => { gates++; return null; };
  const [a, b]: any[] = await Promise.all([startLookup(keysH, { ...me, role: "" }, gate), startLookup(keysH, me, gate)]);
  console.log("\n== H simultaneous starts:", a.state, b.state, "starts", JSON.stringify(starts), "gates", gates);
}
// I: "not me" on the first card moves on
plan = { "apify~google-search-scraper": { ms: 6000, items: [] }, "apimaestro~linkedin-profile-search-scraper": people([profile("sanchit-tripathi-2", "Sanchit Tripathi", "Grapevine")]), "detail:sanchit-tripathi": { ms: 3000, items: [profile("sanchit-tripathi", "Sanchit Tripathi", "Grapevine")] } };
await drive("I not me → next", new KV(), { reject: true });
