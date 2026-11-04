# API (backend, round 1)

Everything the onboarding flow calls. All routes answer JSON with `cache-control: no-store`. Error text is plain
English and safe to show as is (`message` on lookup routes, `error` elsewhere). No route returns or logs a secret.

## LinkedIn lookup

### How it works now
- `start` launches the **Google SERP** and the **LinkedIn people search** at the same time.
- The people search returns full profiles (headline, experience, education), so when one has both the name and the
  company, it is shown as soon as that run finishes. No third run is needed.
- A Google result that has the company in its snippet gets its profile pulled while the people search is still running.
  Whichever confident match lands first wins.
- Without a confident match we wait for Google for up to 25 s. After that, the best name match is shown.
- Profiles stay server-side in KV (`li:d:<lookup id>`, about 7 h). The browser holds a signed token with run ids and
  public slugs only. It can't name another lookup's runs or data.
- **Cache:** the same name and company within 6 h (`li:q:v4:<sha>`) reuses the candidates and costs nothing.
- **Cost caps:** people ≤ 10 items (≤ $0.05), ≤ 3 profile pulls (each `maxItems=1`, ≤ $0.06), and one SERP page.
  The worst case is about $0.07 per person.
- **Limits** (`lib/limits.ts`; round 3). They are counted only when a paid run is about to start, so cache hits never count:
  - **30 name searches per network (IP) per hour**, so one office behind one egress IP still works;
  - **3 per network + name** per hour;
  - **30 pasted-link pulls per network per hour**, in a separate bucket, so the paste-link fallback still works when the network limit trips;
  - **300 paid name searches per day, globally** (`LIMITS.paidLookupsPerDay`; about $21/day worst case). That is the real cost guard.

  When a limit trips, `start` returns **429** with a `Retry-After` header and
  `{state:"error", code:"rate_limited"|"daily_cap", message, retryAfter}`. The message is honest and never says "couldn't find you". Show it with "paste your LinkedIn link" as the primary action.
  KV counters are approximate (not atomic), which is fine at this scale.
  **Tested:** a mocked-Apify unit test (`/tmp/tsf/limits-test.mts`; no network) showed that 10 different names from one IP all start; the same name is blocked on the 4th try; the network limit and the daily cap return their codes; a cache hit goes through while the IP is limited; and paste-link stays allowed. Seeding the local KV counters forced both 429s from the real endpoint.
- **Fails fast**, before any paid run, on: a missing name or company, a name with digits, `@`, `/` or a URL, a name
  with fewer than two letters, a company with no letters or digits, and a `url` that isn't a `linkedin.com/in/` link.
- A first name that differs (a colleague with the same surname) scores below the show threshold, so it is never offered.

### Measured (founder's own profile, local dev, Nov 4)
| | Before | After |
|---|---|---|
| First lookup | 16.5 s, and the **wrong** person (a student with the same name; the SERP-only path) | **11.6 s and 13.2 s**, right person (score 1.0) |
| Same name + company again | 16.5 s | **0.4–0.6 s** (first poll) |
| "No, not me" (next profile already held) | ~5–15 s (a new profile run) | **0.3 s**; at most +5 s when it waits for a Google company hit |

What sets the floor now is the people-search run (~11 s). With `POLL_MS = 2200`, the browser adds up to 2 s on top.

### Endpoints (contract unchanged)
- `POST /api/linkedin/start` `{name, company, role, url?}` returns
  `{state:"pending", stage, token}` or `{state:"error", message, code?}`. Statuses: 400 bad input, 429 with `code:"rate_limited"` or `"daily_cap"`, 502 Apify down, 503 offline. **Branch on `code`, never on the message.**
- `GET /api/linkedin/poll?t=<token>` returns `{state:"pending", stage:"search"|"people"|"profile", token}`,
  `{state:"found", profile, next}`, `{state:"not_found", next:null}` or `{state:"error", message}`.
  **Always use the token from the latest reply.** It carries the state.
- `POST /api/linkedin/profile` `{next}` ("not me") returns `pending` (the next poll shows the next candidate) or `not_found`.
  We show at most 3 profiles per lookup.

`stage` can now go straight from `search` to `profile`, or end at `found` without ever reaching `profile`.
`people` means Google has finished and the people search is still running. Keep using `Math.max` on the stage index.

`Profile` (in `lib/linkedin.ts`) is unchanged, plus optional fields: `education?` (≤ 2), `about?` (≤ 800 chars, contact details stripped), `skills?` (≤ 10), `projects?` (≤ 2), and `experience[].description?` (≤ 400). The pitch uses them; the card can ignore them. `photo` is now a same-origin signed link (see `GET /api/linkedin/photo`), never LinkedIn's CDN URL.

## `POST /api/upload` (multipart)
Fields: `resume` (file, **optional**), `utm` (JSON), `application` (JSON):
```json
{ "name": "", "company": "", "designation": "", "linkedinUrl": "", "linkedinStatus": "confirmed|typed|skipped",
  "linkedinProfile": {},
  "email": "optional, required without a resume", "pitch": "the draft shown on the done screen", "pitchSource": "ai|fallback" }
```
- **With a resume:** same checks as before (type, size, real PDF/DOCX bytes). The email read off the resume wins over a typed one.
- **Without a resume:** leave `resume` out (an empty file input also counts as no resume). `application` must have a
  name and company, and `email` must be a valid address. Otherwise you get 400 with
  "Add an email so we can reach you, or upload your resume." or "We lost your name and company. Go back a step and try again."
- Returns `{ok:true, id, email}`, where `email` is the address we'll use (from the resume or typed), or `null`.
  Failures return `{ok:false, error}`.
- **Pitch storage:** the frontend sends the draft it showed as `application.pitch` and `application.pitchSource`.
  They're stored in `applications.pitch` and `applications.pitch_source`, capped at 800 characters. It's the person's
  own record, so the client's copy is fine.

Storage (migration `0003_optional_resume_and_pitch.sql`, additive only): `submissions.has_resume` (1 for every old
row), and `applications.email`, `pitch` and `pitch_source`. Rows without a resume have no KV file, and their file
columns are `''`/`0`. In `/sheet.csv`, their **Resume** column reads `no resume`, and Email falls back to the typed
address. The column layout is unchanged.

- **`workAuth` is deprecated (v3)** and no longer collected. Old clients may still send it: it is ignored, the request still returns `{ok:true}`, and new rows store `null`. Old rows keep their values, and the `work_auth` column and the sheet's "Work authorization" column stay (blank for new rows). Migrations remain additive only.
- `linkedinProfile.photo` is stripped before storing: the photo is never kept with the application.

## `GET /api/linkedin/photo?u=…&s=…` (v3, additive)
In a `found` reply, `profile.photo` is now a **same-origin signed link** to this route, or `""` when there is no photo. Use it as the `<img src>` on "Is this you?".
- On first use it fetches the photo from LinkedIn's CDN (≈ 0.4 s) and keeps it in KV for 6 h, the lookup's lifetime. After that it serves from KV in about 20 ms, with `cache-control: private, max-age=3600`.
- Only links minted by poll (HMAC with `LINK_SECRET`) and only `media.licdn.com` URLs work; everything else is a 404, so it isn't an open proxy. The limit is 1 MB per image, and it never costs an Apify run.
- Shown only to the person; never stored with the application.

## `POST /api/pitch` (v3 voice)
**Request:** `{name, company, role, profile?, answer?}`
- `profile` is the confirmed `Profile` from poll. Send it as is. It now carries `about`, `skills`, `projects` and `experience[].description`.
- `answer` is optional: one sentence the person typed about their work, 3 to 280 characters, with contact details stripped.

**Response:** `{pitch, source:"ai"|"fallback", needsMore}`, or 400 `{error}` when the name or company is missing.

**`needsMore`:** `true` means one typed sentence would make the pitch noticeably better, so show the question.
- It is `false` once an `answer` is given, or when the profile already has enough texture: at least 3 of about text, role descriptions, 3+ skills, projects, and 2+ roles.
- Title only (no LinkedIn): there is no Gemini call. You get `{pitch:"Ana is a staff engineer at Stripe.", source:"fallback", needsMore:true}`. It is short because it is honest.
- The bold move: when they type the answer, POST the same body plus `answer`, then swap in the new `pitch`. It takes about 1.3 s.

**Model and latency:** `gemini-3-flash-preview`, minimal thinking. v3 measured p50 1.26 s and p95 3.3 s uncached, with a max of 3.54 s. p95 rose from 2.3 s because a third attempt is now allowed; it stays inside the 3.7 s budget. Requests are hedged: a second call starts at 1.8 s, or when a draft fails the vet. There are up to 3 calls in all, and the first vetted draft wins inside the 3.7 s budget. A cache hit takes about 10 ms. There is no streaming: every draft is vetted whole before anyone sees it.

**What the model sees:** name, typed role and company, headline, location, about (≤ 800), skills (≤ 10), projects (≤ 2), and up to 4 roles with descriptions (no durations). The typed answer comes in its own labelled block. Emails, links and phone numbers are stripped.

**Voice (v3):** the intro comes from **Tal, a talent agent**. It is written as "an agent who has read everything about this person, writing two sentences to a founder friend": plain words, said out loud, with contractions allowed.
- An About that is only a mission statement or slogan is not sent to the model.
- Time order is kept: what they do now, then what came before.

**What it writes:**
- **Exactly 2 factual sentences:** the angle (what they actually work on), then the most telling supporting fact. No closing line: every closing line we tried turned into a formula. A third sentence from the model is dropped before the vet.
- **Title + typed answer only:** 1 sentence.
- **Names:** first name at most twice, "they" at most once.

**What `vet()` rejects** (then a hedged retry, then the template). New in v3:
- the openers "This work", "This role", "This included" and "This involves". "This work/role…" in sentence 2 is repaired to "<Name>'s work…" rather than rejected;
- "focusing/focuses/focused on" (unless their facts say it), "reflecting", "designed to", "ensure(s)", "sizeable", "impactful", "leverag*", "passionate" and "dedicated to";
- any 6+ word run copied verbatim from an About that has no concrete noun.

- **Employer integrity:** roles are sent as one block per employer, and the typed answer is marked "employer unknown" and gets its own sentence naming no company. A sentence that names an employer may only use distinctive details from that employer's own entry (plus the headline and About for the current employer, and skills and typed role anywhere). A detail found only in another employer's entry, a side project, a past employer's About, or the typed answer is rejected as **misattributed**. The retry carries a fix instruction; if it still fails, the template is used.
- **Invented detail:** a sentence with more than 4 content words found nowhere in the facts is rejected, as is a "to <verb>" purpose clause after a proper name that the facts don't support. A typed answer that says "our" or "we" may sit at the current employer, never a past one. Recorded run: 2 of 10 fixtures fall back (one of them the title-only case, by design).
- **Input trimming:** side projects are dropped when 2+ roles have descriptions, and a slogan About is never sent.
- **Retries:** one extra try when the only failure is a soft word, inside the same 3.7 s budget.

- **Style (v18):** a word or its stem twice in one sentence, or an "after…" back-reference in the present-job sentence, is rejected. Source capitals are repaired ("through Ads" → "through ads"; "ec2" → "EC2"), and invented appositives ("Tal Boss, a product for…") are rejected.

From earlier rounds:
- any number, spelled-out quantity or capitalized name not in the input;
- tails ("worth meeting", "consider meeting", "if you're building…");
- closing formulas ("gets a X who", "needs <name>", "already solved", "solves", "the problem of", team-fit conclusions);
- hype and filler (actually, over hype, snappy, real world, production-ready, rigor, critical, passionate, …), unless the person's own facts use the word;
- "This follows / This background" openers;
- a sentence that only restates the title, or no concrete profile detail at all;
- gendered pronouns, and text copied from the prompt's examples.

**Fallback:** the template. It reads "{First} is a {title} at {company}, and before that worked at {X}.", or just "{First} is a {title} at {company}." when there's only a title. When there is an answer, it adds `In Ana's words: "…"`.

**Limits and cache:**
- 30 Gemini calls per IP per hour; cache hits don't count. Past that you get the template, still a 200.
- Cached 7 days under `pitch:v18:<slug>:<sha of facts>` (v16: new voice; v17: employer blocks; v18: style rules). The answer is part of the facts.

**Fixtures:**
- Inputs are in `docs/team/pitch-fixtures.json`; verbatim outputs with their inputs are in `docs/team/PITCH_SAMPLES.md`.
- Frontend: the Jordan Avery output in PITCH_SAMPLES.md is exactly what the API returns for `mockProfile` (cached locally), so paste it into `preview.ts`.

**Saving it:** send the final `pitch` and `source` with the application as `application.pitch` and `application.pitchSource` (as before).

## Test locally
```bash
npx next dev -p 3217        # reads .dev.vars at startup: APIFY_TOKEN, LINK_SECRET, SHEET_KEY, GEMINI_API_KEY
npx --cache /Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/npm-cache wrangler d1 migrations apply DB --local
# pitch (free-ish, cached)
curl -s localhost:3217/api/pitch -H 'content-type: application/json' -d '{"name":"Ana Ruiz","company":"Stripe","role":"Staff Engineer"}'
# upload without a resume
curl -s localhost:3217/api/upload -F 'application={"name":"Test A","company":"Acme","designation":"Engineer","linkedinStatus":"skipped","email":"a@example.org"}'
# an old client still sending workAuth: also {ok:true}, stored as null
curl -s localhost:3217/api/upload -F 'application={"name":"Test B","company":"Acme","designation":"Engineer","linkedinStatus":"skipped","email":"b@example.org","workAuth":"citizen"}'
# bad input fails before any paid run
curl -s localhost:3217/api/linkedin/start -H 'content-type: application/json' -d '{"name":"12345","company":"Acme"}'
```
Real lookups cost money. Test only with "Sanchit Tripathi" at "Grapevine". A repeat within 6 h is a free cache hit.

## Ship
`wrangler secret put GEMINI_API_KEY`, then `npm run db:migrate` (applies 0003 to remote D1), then `npm run deploy`.
**Run the migration before the deploy:** `/sheet.csv` selects the new columns.
