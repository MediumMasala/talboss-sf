// Time one LinkedIn lookup end to end, polling the way the flow does. Real lookups cost money: use ONLY the allowed
// identity (Sanchit Tripathi / Grapevine / Strategy Lead). A repeat within 6 h is a free cache hit.
//
//   node scripts/lookup-timing.mjs                      # start with name + company + role, then poll
//   node scripts/lookup-timing.mjs --prefetch 4000      # start at A2 (name + company), wait 4 s "typing", start at A3, poll
//   node scripts/lookup-timing.mjs --partial            # opt in to partial cards
//   BASE=http://localhost:3217 POLL_MS=250 node scripts/lookup-timing.mjs
//
// Prints a timeline (ms since the first start call) and the server's `timings`. Never prints a token or secret.
const BASE = process.env.BASE ?? "http://localhost:3217";
const FIRST_POLL_MS = Number(process.env.FIRST_POLL_MS ?? 300);
const POLL_MS = Number(process.env.POLL_MS ?? 1700);
const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const prefetchIdx = args.indexOf("--prefetch");
const typingMs = prefetchIdx >= 0 ? Number(args[prefetchIdx + 1] ?? 4000) : null;
const person = { name: "Sanchit Tripathi", company: "Grapevine", role: "Strategy Lead" };

const t0 = Date.now();
const at = () => String(Date.now() - t0).padStart(6);
const log = (what, extra = "") => console.log(`${at()} ms  ${what}${extra ? `  ${extra}` : ""}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = async (path, body) => {
  const res = await fetch(`${BASE}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  return { status: res.status, body: await res.json() };
};
const brief = (r) => {
  if (r.state === "found") {
    const p = r.profile;
    return `found${r.partial ? " (partial)" : ""}: ${p.fullname} | ${p.currentCompany} | score ${p.score} | exp ${p.experience?.length ?? 0} | photo ${p.photo ? "yes" : "no"}${r.retracted ? " | retracted" : ""}`;
  }
  return r.state === "pending" ? `pending (${r.stage})${r.retracted ? " retracted" : ""}` : `${r.state}${r.message ? `: ${r.message}` : ""}`;
};

let prefetch = null;
if (typingMs !== null) {
  prefetch = post("/api/linkedin/start", { name: person.name, company: person.company, ...(flag("--partial") ? { partial: true } : {}) });
  const p = await prefetch;
  log(`A2 start (prefetch) → ${p.status}`, brief(p.body));
  await sleep(Math.max(0, typingMs - (Date.now() - t0)));
}
const a3 = Date.now();
const pre = prefetch ? (await prefetch).body : null;
const s = await post("/api/linkedin/start", { ...person, ...(pre?.token ? { token: pre.token } : {}), ...(flag("--partial") ? { partial: true } : {}) });
log(`A3 start → ${s.status}`, brief(s.body));
if (s.body.state !== "pending") process.exit(0);

let token = s.body.token;
let polls = 0;
let firstCard = null;
for (;;) {
  await sleep(polls++ === 0 ? FIRST_POLL_MS : POLL_MS);
  const before = Date.now();
  const r = await (await fetch(`${BASE}/api/linkedin/poll?t=${encodeURIComponent(token)}`)).json();
  log(`poll ${polls} (${Date.now() - before} ms)`, brief(r));
  if (r.state === "found" && firstCard === null) firstCard = Date.now();
  if (r.state === "found" && r.partial && r.token) {
    token = r.token;
    continue;
  }
  if (r.state === "pending") {
    token = r.token;
    if (Date.now() - t0 > 120_000) break;
    continue;
  }
  if (r.timings) console.log("timings", JSON.stringify(r.timings));
  break;
}
if (firstCard) console.log(`first card: ${firstCard - t0} ms after the first start${typingMs !== null ? `, ${firstCard - a3} ms after the A3 start` : ""}`);
