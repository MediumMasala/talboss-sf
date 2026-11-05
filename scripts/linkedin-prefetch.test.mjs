// Prefetch / attach-to-running-job (lib/linkedin-job.ts) and the search-data card the guard reads for partial cards
// (lib/linkedin-match.ts serpCard). No network, no Apify.
// Run: node --test scripts/linkedin-prefetch.test.mjs   (Node ≥ 22.18 strips the .ts types itself)
import { test } from "node:test";
import assert from "node:assert/strict";
import { attach, guessSlug, jobBasis, JOB_TTL_MS, sameJob } from "../lib/linkedin-job.ts";
import { matchProfile, MATCH, serpCard } from "../lib/linkedin-match.ts";

const T0 = 1_800_000_000_000;
const job = {
  id: "lookup-1",
  input: { name: "Sanchit Tripathi", company: "Grapevine", role: "" },
  j: { search: "run-s", people: "run-p", guess: "run-g", gslug: "sanchit-tripathi" },
  t0: T0,
  tm: { start: 900, first: 4000, src: "guess", n: 3 },
};
const a3 = { name: "Sanchit Tripathi", company: "Grapevine", role: "Strategy Lead" };

test("1. the A3 start attaches to the A2 job: same runs, store and clock, new title, nothing carried over", () => {
  const t = attach(job, a3, T0 + 5000);
  assert.equal(t.id, "lookup-1"); // same profile store, so nothing is pulled twice
  assert.deepEqual(t.input, a3); // the title is the new one: every run is re-read and re-scored with it
  assert.deepEqual(t.runs, { search: "run-s", people: "run-p", profile: "run-g" });
  assert.equal(t.pull, "sanchit-tripathi");
  assert.equal(t.gs, 1);
  assert.equal(t.pulls, 0);
  assert.deepEqual([t.cands, t.shown, t.dead], [[], [], []]);
  assert.equal(t.t0, T0); // the 0.7 wait and the timings count from the real start
  assert.deepEqual(t.j, job.j); // so a third start can attach too
  assert.deepEqual(t.tm, { start: 900, attach: 5000 }); // first/full belong to the lookup that showed them
  assert.equal(t.manual, undefined);
  assert.equal(t.pa, undefined);
  assert.equal(attach(job, a3, T0 + 5000, { partial: true }).pa, 1);
});

test("2. same person however it's typed; anyone else never attaches", () => {
  assert.ok(sameJob(job.input, { name: "  sanchit   TRIPATHI ", company: "grapevine" }));
  assert.ok(sameJob({ name: "José Núñez", company: "Telefónica" }, { name: "Jose Nunez", company: "telefonica" }));
  assert.equal(jobBasis({ name: "Sanchit Tripathi", company: "Grapevine" }), "sanchittripathi|grapevine");
  assert.equal(attach(job, { ...a3, company: "Grapevine Labs" }, T0 + 1000), null); // another company is another search
  assert.equal(attach(job, { ...a3, name: "Saumil Tripathi" }, T0 + 1000), null);
  assert.equal(attach(job, { name: "Sanchit", company: "Tripathi Grapevine", role: "" }, T0 + 1000), null); // the | keeps fields apart
});

test("3. old, empty or malformed jobs don't attach", () => {
  assert.equal(attach(job, a3, T0 + JOB_TTL_MS + 1), null);
  assert.equal(attach(null, a3, T0), null);
  assert.equal(attach({ ...job, j: undefined }, a3, T0), null);
  const noGuess = attach({ ...job, j: { search: "run-s", people: "run-p" } }, a3, T0 + 10);
  assert.deepEqual(noGuess.runs, { search: "run-s", people: "run-p", profile: undefined });
  assert.equal(noGuess.pull, undefined);
  assert.equal(noGuess.gs, undefined);
});

test("4. the guessed slug", () => {
  assert.equal(guessSlug("Sanchit Tripathi"), "sanchit-tripathi");
  assert.equal(guessSlug("Dr. Ana María López"), "ana-maria-lopez");
  assert.equal(guessSlug("Aryan K. Mehta"), "aryan-mehta");
  assert.equal(guessSlug("Zoë O'Brien"), "zoe-obrien");
  assert.equal(guessSlug("Madonna"), null); // one word: no guess
  assert.equal(guessSlug("A B"), null);
});

// Real Google results (Nov 4 run for "Sanchit Tripathi" Grapevine), trimmed.
const sanchit = {
  title: "Sanchit Tripathi - Join tal.club | Building Tal Boss",
  websiteTitle: "LinkedIn · Sanchit Tripathi",
  description: "Reach out at - sanchit@grapevine.in · Experience: tal by grapevine ... Sanchit Tripathi's profile on LinkedIn, a professional community of 1 billion members.",
};
const jainam = {
  title: "Jainam Talsania - Cofounder tal BOSS, Grapevine",
  websiteTitle: "LinkedIn · Jainam Talsania",
  description: "Cofounder tal BOSS, Grapevine · Love building and scaling products. Reach out jainam(at)grapevine.in · Experience: Tal: the app where bosses hire directly ...",
  personalInfo: { location: "Bengaluru, Karnataka, India", jobTitle: "Co-Founder - tal BOSS, Grapevine", companyName: "Tal: the app where bosses hire directly" },
};
const card = (r) => ({ ...serpCard(r), experience: [] });

test("5. search-data card: LinkedIn's structured bits only", () => {
  assert.deepEqual(serpCard(sanchit), { fullname: "Sanchit Tripathi", headline: "Join tal.club | Building Tal Boss", currentCompany: "tal by grapevine", location: "" });
  assert.deepEqual(serpCard(jainam), { fullname: "Jainam Talsania", headline: "Co-Founder - tal BOSS, Grapevine", currentCompany: "Tal: the app where bosses hire directly", location: "Bengaluru, Karnataka, India" });
  // "Name - Role - Company" when the title is whole
  assert.equal(serpCard({ title: "Ana Ruiz - Staff Engineer - Stripe | LinkedIn" }).currentCompany, "Stripe");
  // ... but never from a cut-off title
  assert.equal(serpCard({ title: "Karan Mahajan - Zomato | E-commerce - Customer ..." }).currentCompany, "");
});

test("6. the guard on search data: partial cards only at 'sure', strangers never", () => {
  // Sanchit's snippet names "tal by grapevine", which isn't the company "Grapevine": no partial card (the full profile decides).
  assert.ok(matchProfile(card(sanchit), { name: "Sanchit Tripathi", company: "Grapevine", role: "Strategy Lead" }).score < MATCH.sure);
  // Jainam's headline carries the company: sure on search data alone.
  assert.ok(matchProfile(card(jainam), { name: "Jainam Talsania", company: "Grapevine", role: "" }).score >= MATCH.sure);
  // An email domain or an "ex-" mention in the snippet is not the company.
  const ex = { title: "Mohammad Fayez - Founding Engineer", description: "Ex tech-lead at Grapevine. Reach out fayez@grapevine.in" };
  assert.equal(matchProfile(card(ex), { name: "Mohammad Fayez", company: "Grapevine", role: "" }).pass, false);
  // Same name at another company: 0.
  assert.equal(matchProfile(card({ title: "Aryan Mehta - Software Engineer - Shell" }), { name: "Aryan Mehta", company: "Halcyon Labs", role: "Member of Technical Staff" }).score, 0);
  // Name + title only on search data is 0.7: never a partial card (that path waits, as before).
  assert.equal(matchProfile(card({ title: "Aryan Mehta - Member of Technical Staff - Anthropic" }), { name: "Aryan Mehta", company: "Halcyon Labs", role: "MTS" }).score, MATCH.pass);
});
