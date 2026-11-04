# API (backend, v4)

Everything the onboarding flow calls. All routes answer JSON with `cache-control: no-store`. Error text is plain
English and safe to show as is (`message` on lookup routes, `error` elsewhere). No route returns or logs a secret.

## LinkedIn lookup

### How it works now
- `start` launches the **Google SERP** and the **LinkedIn people search** at the same time.
- The people search returns full profiles (headline, experience, education), so when one has both the name and the
  company, it is shown as soon as that run finishes. No third run is needed.
- A Google result that has the company in its snippet gets its profile pulled while the people search is still running.
  Whichever confident match lands first wins.
- Every candidate passes the **match guard** (below) before it is shown. Name + company is shown at once; name +
  title only is shown after we've waited up to 25 s for Google to find a name + company match. Nothing else is
  ever shown: when no candidate passes, poll returns `not_found` and the flow offers the paste-link path.
- Profiles stay server-side in KV (`li:d:<lookup id>`, about 7 h). The browser holds a signed token with run ids and
  public slugs only. It can't name another lookup's runs or data.
- **Cache:** the same name, company and role within 6 h (`li:q:v5:<sha>`) reuses the candidates and costs nothing.
  v5 (Nov 5, match guard) replaced v4, whose entries could hold name-only guesses; v4 keys are never read again.
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

### Match guard (`lib/linkedin-match.ts`, Nov 5)
Steve's v4.1 review typed "Aryan Mehta / Halcyon Labs / Member of Technical Staff" and was offered a Houston
engineer, then a London banker: same name, nothing else. The old score gave 0.6 for the name alone, and after 25 s
the best name match was shown. Now a profile is offered only when **name AND (company OR title)** match:

| Check | Passes when |
|---|---|
| **Name** (required) | The typed first AND last name both appear in the profile's full name, as two different words, in any order. Each part matches exactly, as a known nickname (Sam ~ Samuel, Bob ~ Robert, Mohd ~ Mohammed), as a first-name short form of 3+ letters (Alex ~ Alexander; first names only), or as a close transliteration (Tripathi ~ Tripathy, Aaryan ~ Aryan, Mohammed ~ Muhammad). Diacritics fold (José = Jose, Søren = Soren). Titles, suffixes and initials (Dr, Jr, PhD, "K.") are ignored. A one-word typed name must match the first name. |
| **Company** | The typed company, with legal and descriptive suffixes stripped (Inc, LLC, Ltd, Pvt, Corp, Co, GmbH, Labs, Technologies, Tech, AI, HQ, Software, Group, India, …, and a leading "The"), equals the current company or the company of a current or one of the two most recent roles (or one starts the other: Google ~ Google DeepMind), or appears in order in the headline. "Open AI" ~ "OpenAI". |
| **Title** | The typed role shares at least two meaningful words (or the only one typed) with the headline or with a current or recent title. Seniority and filler words (senior, staff, lead, principal, head, member, of, …) don't count. Common forms are folded: MTS = Member of Technical Staff, SWE/SDE = Software Engineer, PM = Product Manager, ML = Machine Learning, Co-founder = Founder. |

- **Score:** name + company = 0.9 (1.0 with the title too), name + title only = 0.7, anything else 0 (`MATCH` in the
  file: pass 0.7, sure 0.9). A same-name stranger at another company with another job, or a colleague with the
  same company and surname, is 0 and never offered.
- **Google results** are only pulled (≈ $0.005 each) when the result title carries the first and last name AND the
  title or snippet shows the company or the role, so we no longer pay to pull strangers.
- **"No, not me"** moves on only over candidates that pass the guard; when none are left, it's `not_found`.
- **Before any profile is shown**, the guard runs again on the stored profile, so an in-flight token or a cache
  written under older rules can't surface a guess.
- **A pasted LinkedIn link** is the person's own choice and is still shown whatever its score.
- **Test (no network):** `node --test scripts/linkedin-match.test.mjs` (8 cases: exact; Inc/Labs/LLC/The variations;
  same name at another company, rejected; same company with another name, rejected; title-only with the same name,
  accepted; nicknames and transliterations; empty company, where the title must match; diacritics).

### Measured (founder's own profile, local dev, Nov 4)
| | Before | After |
|---|---|---|
| First lookup | 16.5 s, and the **wrong** person (a student with the same name; the SERP-only path) | **11.6 s and 13.2 s**, right person (score 1.0) |
| Same name + company again | 16.5 s | **0.4–0.6 s** (first poll) |
| "No, not me" (next profile already held) | ~5–15 s (a new profile run) | **0.3 s**; at most +5 s when it waits for a Google company hit |

What sets the floor now is the people-search run (~11 s). With `POLL_MS = 2200`, the browser adds up to 2 s on top.

**After the guard (Nov 5, local dev, "Sanchit Tripathi / Grapevine / Strategy Lead"):** found in 12 s, right person,
score 0.9 (name + company, from his recent role at Grapevine; "Strategy Lead" isn't on his profile). "No, not me"
then ended at `not_found` (32 s, waiting out the Google run and its guarded pulls) instead of offering a stranger.
The repeat was a v5 cache hit: found on the first poll, 0.16 s.

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

`Profile` (in `lib/linkedin.ts`) is unchanged, plus optional fields: `education?` (≤ 2), `about?` (≤ 800 chars, contact details stripped), `skills?` (≤ 10), `projects?` (≤ 2), and `experience[].description?` (≤ 400). The card can ignore them. `photo` is now a same-origin signed link (see `GET /api/linkedin/photo`), never LinkedIn's CDN URL.

## `POST /api/upload` (multipart)
Fields: `resume` (file, **optional**), `utm` (JSON), `application` (JSON; comments here are docs only):
```jsonc
{
  "name": "Ana Ruiz",                 // required, ≤ 120 chars
  "company": "Stripe",                // required, ≤ 120 chars
  "designation": "Staff Engineer",    // ≤ 120 chars, may be ""
  "linkedinUrl": "https://www.linkedin.com/in/ana-ruiz",  // must be a linkedin.com/in/ URL, else stored as null
  "linkedinStatus": "confirmed",      // "confirmed" | "typed" | "skipped" (anything else → "skipped")
  "linkedinProfile": { },             // the confirmed Profile from poll, or null; < 20 KB; `photo` is stripped before storing
  "email": "ana@example.com"          // optional with a resume; REQUIRED (valid address) without one
}
```
- **With a resume:** same checks as before (type, size, real PDF/DOCX bytes). The email read off the resume wins over a typed one.
- **Without a resume:** leave `resume` out (an empty file input also counts as no resume). `application` must have a
  name and company, and `email` must be a valid address. Otherwise you get 400 with
  "Add an email so we can reach you, or upload your resume." or "We lost your name and company. Go back a step and try again."
- Returns `{ok:true, id, email}`, where `email` is the address we'll use (from the resume or typed), or `null`.
  Failures return `{ok:false, error}`.
- **One lead per person (Nov 5, migration `0005_resume_hash.sql`).** A resume with no email on it is saved and
  answered with `email: null`; the flow then asks for an email (A6b) and sends the same resume again with it. The
  second upload **updates the first row instead of inserting a new one** when all of these hold:
  - the resume bytes are identical (`submissions.resume_sha256`, hex SHA-256, new column);
  - the earlier row is from the **last 30 minutes** (`MERGE_WINDOW_MS` in `lib/storage.ts`);
  - the earlier row has **no email** (none on the resume, none typed);
  - name, company and designation are the same after normalising (Unicode NFKC, lower case, spaces collapsed).

  The reply carries the **earlier row's id**. The resume stays under that row's KV key (it isn't written again), and
  `created_at` stays the first upload's. The update sets email, LinkedIn URL/status/card (the photo only if the new one
  has one), and meta (the new values on top, UTM tags from both visits kept, plus `mergedAt`). The frontend needs no
  change. Rows from before 0005 have no hash, so they are never merged into.
- **Only complete leads go to the Google Sheet.** An upload that ends with no email (the reply that makes the flow
  ask for one) is stored with `sheet_pending = 0` and is **not pushed**. When the same resume comes back with an email,
  the merged row is set pending and pushed under its id (the Apps Script upserts by id). 0005 also takes any older
  email-less row out of the resync queue. Email-less rows still show on `/leads` and in `/sheet.csv`.
- **v4 payload:** exactly the seven fields above. `pitch`, `pitchSource` and `workAuth` are no longer read; old clients may still send them, and they are ignored (new rows store `NULL` in `pitch`, `pitch_source` and `work_auth`; those columns stay for old rows, and migrations stay additive).

Storage (migration `0003_optional_resume_and_pitch.sql`, additive only): `submissions.has_resume` (1 for every old
row), and `applications.email`, `pitch` and `pitch_source` (the last two are no longer written since v4). Rows without a resume have no KV file, and their file
columns are `''`/`0`. In `/sheet.csv`, their **Resume link** column reads `no resume`, and Email falls back to the typed
address.

- **`workAuth` is deprecated (v3)** and no longer collected. Old clients may still send it: it is ignored, the request still returns `{ok:true}`, and new rows store `null`. Old rows keep their values in the `work_auth` column. Since the leads desk, `/sheet.csv` no longer has a "Work authorization" column. Migrations remain additive only.
- `linkedinProfile.photo` (the signed proxy link) is stripped from the stored JSON. Since the leads desk, the LinkedIn
  photo URL behind it is verified (only links minted by poll, only `media.licdn.com`) and kept in
  `applications.linkedin_photo`, so `/leads` can show it through the same proxy. Unsigned or foreign links store `NULL`.
- **After the save** a complete lead (one with an email) is pushed to the team's Google Sheet in `ctx.waitUntil`
  (see **Leads** below). The reply never waits on it, and a failed push never fails the upload.

## `GET /api/linkedin/photo?u=…&s=…` (v3, additive)
In a `found` reply, `profile.photo` is now a **same-origin signed link** to this route, or `""` when there is no photo. Use it as the `<img src>` on "Is this you?".
- On first use it fetches the photo from LinkedIn's CDN (≈ 0.4 s) and keeps it in KV for 6 h, the lookup's lifetime. After that it serves from KV in about 20 ms, with `cache-control: private, max-age=3600`.
- Only links minted by poll (HMAC with `LINK_SECRET`) and only `media.licdn.com` URLs work; everything else is a 404, so it isn't an open proxy. The limit is 1 MB per image, and it never costs an Apify run.
- Shown to the person on "Is this you?", and to the team on `/leads` (the URL behind the link is kept in `applications.linkedin_photo`; the image itself is never stored with the application).

## `POST /api/pitch`: removed in v4
The AI intro was removed from the product. `app/api/pitch/` and `lib/pitch.ts` are deleted, so the route returns 404. They're in git history, and `docs/team/PITCH_SAMPLES.md` and `pitch-fixtures.json` stay as a record. `GEMINI_API_KEY` is no longer used.

## Leads (v4 §9): `/leads`, `/api/leads/*`, the sheet push
Full setup and the team view: `docs/team/LEADS.md`. Migration `0004_leads.sql` (additive): `submissions.notes`,
`submissions.sheet_pending` (default 1), `submissions.sheet_synced_at`, `applications.linkedin_photo`.

Access: everything below answers **404** unless `LEADS_KEY` is set and the request has `?key=<LEADS_KEY>` or the
`tal_leads` cookie (HttpOnly, SameSite=Lax, 30 days; it holds a SHA-256 of the key, never the key). Writes require a
JSON body, which a cross-site form can't send.

- `GET /leads?key=…` → 307 to `/leads/login?key=…` → sets the cookie → 303 to `/leads` (the key leaves the address bar).
- `GET /leads?q=&page=` → the desk: newest first, 50 per page, `q` searches name, company and email. Each card: photo,
  name, title, company, LinkedIn link + status, headline and top 3 roles from the stored card, email, resume
  (Download = `/r/<id>/<sig>?dl=1`, Open = inline), time in IST and PT, source (UTM), sheet status, notes.
- `PATCH /api/leads/:id` `{notes: string}` (≤ 5000 chars) → `{ok:true, id, notes}`; 404 for an unknown id.
- `POST /api/leads/resync` (cookie + JSON, or `?key=`) → pushes every `sheet_pending = 1` row, oldest first, 50 per
  webhook call, ≤ 500 per request → `{ok, pushed, pending}`. 503 when the webhook isn't configured, 502 when the sheet
  refuses. `GET /api/leads/resync?key=…` does the same.
- **Webhook** (from `/api/upload` in `ctx.waitUntil`, and from resync): `POST LEADS_WEBHOOK_URL`
  `{secret: LEADS_WEBHOOK_SECRET, rows: [{id, submittedIst, name, company, title, email, linkedinUrl, linkedinStatus,
  headline, resumeUrl, resumeName, source}]}`. Success = HTTP 200 with JSON `{ok:true}` (after following Apps Script's
  302). One retry after 1.5 s; on failure the row stays pending. The script (`scripts/leads-sheet.gs`) upserts by `id`.
- `GET /sheet.csv` → `?key=<SHEET_KEY>` (the old IMPORTDATA sheet) **or** the leads cookie; `?download=1` adds
  `content-disposition: attachment`. Columns: Uploaded (IST), Name, Company, Designation, Email, LinkedIn,
  LinkedIn check, **Headline**, **Resume link** (signed), Source, Program, File, **Notes**, ID. "Work authorization" is gone.
- `GET /r/<id>/<sig>` → the resume from KV under its original filename (`filename` + RFC 5987 `filename*`). The type
  comes from the extension (PDF or DOCX). PDFs `inline`, DOCX and `?dl=1` `attachment`. The signature never expires
  (HMAC of the id), so the sheet's links are permanent; a wrong signature is a 404.
- **Upload limits (unchanged):** PDF or DOCX, real bytes checked, **≤ 5 MB** (`site.upload.maxBytes` in `content/site.ts`).

## Test locally
```bash
npx next dev -p 3217        # reads .dev.vars at startup: APIFY_TOKEN, LINK_SECRET, SHEET_KEY (+ LEADS_* for /leads)
npx --cache /Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/npm-cache wrangler d1 migrations apply DB --local
# the pitch route is gone: expect 404
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3217/api/pitch -H 'content-type: application/json' -d '{}'
# upload without a resume
curl -s localhost:3217/api/upload -F 'application={"name":"Test A","company":"Acme","designation":"Engineer","linkedinStatus":"skipped","email":"a@example.org"}'
# an old client still sending workAuth / pitch / pitchSource: also {ok:true}, all stored as null
curl -s localhost:3217/api/upload -F 'application={"name":"Test B","company":"Acme","designation":"Engineer","linkedinStatus":"skipped","email":"b@example.org","workAuth":"citizen","pitch":"x","pitchSource":"ai"}'
# bad input fails before any paid run
curl -s localhost:3217/api/linkedin/start -H 'content-type: application/json' -d '{"name":"12345","company":"Acme"}'
# the match guard, no network
node --test scripts/linkedin-match.test.mjs
# one real lookup (the allowed identity only): start, then poll with the latest token every ~2 s
T=$(curl -s localhost:3217/api/linkedin/start -H 'content-type: application/json' \
  -d '{"name":"Sanchit Tripathi","company":"Grapevine","role":"Strategy Lead"}' | python3 -c 'import json,sys;print(json.load(sys.stdin)["token"])')
curl -s "localhost:3217/api/linkedin/poll?t=$T"   # repeat with the token from each pending reply
```
The leads loop end to end (fake lead, local webhook listener, /leads, resume, notes, resync, and the no-email double
upload: one row, with the email, one sheet push): `scripts/leads-smoke.sh`.

Real lookups cost money. Test only with "Sanchit Tripathi" at "Grapevine". A repeat within 6 h is a free cache hit.

## Ship
`npm run db:migrate` (applies **0004 and 0005** to remote D1), then `npm run deploy`.
**Run the migration before the deploy:** `/api/upload` writes `applications.linkedin_photo` (0004) and
`submissions.resume_sha256` (0005), and `/leads` and `/sheet.csv` read the 0004 columns, so a deploy without both
fails every upload. Locally: `npm run db:migrate:local` (the smoke script runs it too).
Secrets: `LEADS_KEY`, `LEADS_WEBHOOK_URL`, `LEADS_WEBHOOK_SECRET` (`npx wrangler secret put …`; see LEADS.md).
Without the webhook pair, uploads still work and rows wait as pending until it's set and Resync runs.
