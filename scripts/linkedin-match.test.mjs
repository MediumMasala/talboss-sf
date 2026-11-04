// The "Is this you?" match guard (lib/linkedin-match.ts). No network, no Apify.
// Run: node --test scripts/linkedin-match.test.mjs   (Node ≥ 22.18 strips the .ts types itself)
import { test } from "node:test";
import assert from "node:assert/strict";
import { matchProfile } from "../lib/linkedin-match.ts";

const aryan = { name: "Aryan Mehta", company: "Halcyon Labs", role: "Member of Technical Staff" };
const prof = (fullname, company, title, headline = "", more = []) => ({
  fullname, headline, currentCompany: company,
  experience: [{ title, company, current: true }, ...more],
});
const shows = (p, input) => matchProfile(p, input).pass;

test("1. exact match: name, company and title", () => {
  const m = matchProfile(prof("Aryan Mehta", "Halcyon Labs", "Member of Technical Staff"), aryan);
  assert.deepEqual(m, { name: true, company: true, title: true, pass: true, score: 1 });
});

test("2. company suffix variations (Inc, Labs, LLC, The …) still match", () => {
  assert.ok(matchProfile(prof("Aryan Mehta", "Halcyon, Inc.", "Engineer"), aryan).company);
  assert.ok(matchProfile(prof("Aryan Mehta", "Halcyon", "Engineer"), aryan).company);
  assert.ok(matchProfile(prof("Aryan Mehta", "The Halcyon Labs LLC", "Engineer"), aryan).company);
  assert.ok(matchProfile(prof("Ana Ruiz", "Stripe", "Engineer"), { name: "Ana Ruiz", company: "Stripe Inc", role: "" }).pass);
  // the company named only in the headline
  assert.ok(shows(prof("Aryan Mehta", "", "", "Building agents @ Halcyon Labs"), aryan));
});

test("3. same name, different company and title: rejected (Steve's Houston engineer, London banker)", () => {
  assert.equal(shows(prof("Aryan Mehta", "Shell", "Software Engineer", "Software Engineer at Shell | Houston, TX"), aryan), false);
  assert.equal(shows(prof("Aryan Mehta", "Barclays", "Vice President, Investment Banking", "VP at Barclays, London"), aryan), false);
  // one shared seniority word is not a title match
  assert.equal(shows(prof("Aryan Mehta", "Chevron", "Staff Engineer"), aryan), false);
});

test("4. same company, different name: rejected", () => {
  assert.equal(shows(prof("Rohan Mehta", "Halcyon Labs", "Member of Technical Staff"), aryan), false); // a colleague sharing the surname
  assert.equal(shows(prof("Aryan Shah", "Halcyon Labs", "Member of Technical Staff"), aryan), false); // sharing the first name
  assert.equal(shows(prof("Aryan", "Halcyon Labs", "Member of Technical Staff"), aryan), false); // no last name at all
});

test("5. title-only match with the same name: accepted (moved jobs, or LinkedIn is out of date)", () => {
  const m = matchProfile(prof("Aryan Mehta", "Anthropic", "Member of Technical Staff"), aryan);
  assert.deepEqual([m.name, m.company, m.title, m.pass, m.score], [true, false, true, true, 0.7]);
  assert.ok(shows(prof("Aryan Mehta", "Anthropic", "MTS"), aryan)); // the abbreviation
});

test("6. nicknames and transliterations: accepted", () => {
  const sam = { name: "Sam Lee", company: "Ramp", role: "Product Manager" };
  assert.ok(shows(prof("Samuel Lee", "Ramp", "Senior Product Manager"), sam));
  assert.ok(shows(prof("Robert Chen", "Figma", "Designer"), { name: "Bob Chen", company: "Figma", role: "" }));
  assert.ok(shows(prof("Sanchit Tripathy", "Grapevine", "Strategy Lead"), { name: "Sanchit Tripathi", company: "Grapevine", role: "" }));
  assert.ok(shows(prof("Muhammad Khan", "Stripe", "SWE"), { name: "Mohammed Khan", company: "Stripe", role: "" }));
  assert.equal(shows(prof("Kiran Mehta", "Halcyon Labs", "MTS"), { ...aryan, name: "Karan Mehta" }), false); // a different name, not a spelling
});

test("7. empty company: the title must match", () => {
  const noCo = { name: "Aryan Mehta", company: "", role: "Staff Software Engineer" };
  assert.ok(shows(prof("Aryan Mehta", "Halcyon Labs", "Senior Software Engineer"), noCo));
  assert.equal(shows(prof("Aryan Mehta", "Halcyon Labs", "Product Manager"), noCo), false);
  assert.equal(shows(prof("Aryan Mehta", "Halcyon Labs", "Software Engineer"), { ...noCo, role: "" }), false); // nothing to match on
});

test("8. diacritics fold both ways", () => {
  assert.ok(shows(prof("José Núñez", "Telefónica S.A.", "Data Scientist"), { name: "Jose Nunez", company: "Telefonica", role: "" }));
  assert.ok(shows(prof("Soren Kierkegaard", "Novo Nordisk", "Engineer"), { name: "Søren Kierkegaard", company: "Novo Nordisk A/S", role: "" }));
  assert.ok(shows(prof("Zoë O'Brien", "Notion", "Designer"), { name: "Zoe OBrien", company: "Notion Labs", role: "" }));
});
