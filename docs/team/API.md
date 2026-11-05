# API (backend, v4)

Everything the onboarding flow calls. All routes answer JSON with `cache-control: no-store`. Error text is plain
English and safe to show as is (`message` on lookup routes, `error` elsewhere). No route returns or logs a secret.

## LinkedIn lookup

### How it works now (v4.2, Nov 5: speed, FEEDBACK_V4_2 §10)
- **Three lanes, launched together** by the first `start`: the **Google SERP**, the **LinkedIn people search**
  (first + last name → up to 10 full profiles), and a **pull of the guessed slug** (`first-last`, e.g.
  `sanchit-tripathi`; `guessSlug` in `lib/linkedin-job.ts`). The first profile that clears the match guard at
  "sure" (name + company, ≥ 0.9) is shown on the next poll, whichever lane found it. A guessed slug owned by a
  stranger fails the guard like anyone else and nothing about them is kept (the store holds a tombstone only).
- **Prefetch.** `start` works with **name + company only** (`role` optional). The flow calls it at A2 submit, so
  the lanes run while the person types their title. The A3 `start` (same name + company, now with the title, plus
  the A2 reply's `token`) **attaches** to that job: same Apify runs, same profile store, nothing paid again, nothing
  counted against the limits again. Without the token it finds the job in KV (`li:job:v1:<sha(name|company)>`, 6 h).
  Two starts fired at the same moment are caught by a write-then-verify claim (`li:jobclaim:v1:…`, 60 s): one
  launches, the other joins it. The title only changes scoring, so an attached lookup re-reads every run with it.
  Frontend call sequence: `docs/team/LOOKUP_PREFETCH.md`.
- **Polls hold.** A poll that would answer `pending` waits (up to 5 s, `HOLD_MS`) on Apify's `waitForFinish` for
  the next run to finish, and answers the moment one does, or when the stage changes, or when the 0.7 wait runs out.
  The browser no longer adds its poll interval on top of the actor's time; it can poll again right away.
- **Partial cards (opt-in, `partial: true` on start).** A Google result whose own search data (name, LinkedIn's
  current company, headline; `serpCard` in `lib/linkedin-match.ts`) clears the guard at ≥ 0.9 is shown at once with
  `partial: true` and no experience rows; a later poll returns the full card (`partial: false`). If the full
  profile then fails the guard, the card is taken back (`retracted: true`). Measured: the detail pull is ~2.5–4 s and
  rarely the slow part; this only helps when Google beats the people search. Old clients never see a partial card.
- Name + title only (0.7) is still shown only after the existing wait (25 s from the first start) for a name +
  company match. Nothing else is ever shown: when no candidate passes, poll returns `not_found` and the flow offers
  the paste-link path.
- Profiles stay server-side in KV (`li:d:<lookup id>`, about 7 h). The browser holds a signed token with run ids and
  public slugs only. It can't name another lookup's runs or data.
- **Cache:** the same name, company and role within 6 h (`li:q:v5:<sha>`) reuses the candidates and costs nothing.
  v5 (Nov 5, match guard) replaced v4, whose entries could hold name-only guesses; v4 keys are never read again.
  A different title for the same name + company within 6 h attaches to the job (free, re-scored with the new title).
- **Apify time limits** (`RUN_TIMEOUT_S`): SERP 40 s (was 60; its Google retries ran to 52 s), people 45 s (was 75;
  observed ≤ 14 s), profile 20 s (was 75; observed ≤ 6.6 s), so a stuck run frees its slot sooner.
- **Cost caps:** people ≤ 10 items (≤ $0.05), the guessed slug + ≤ 3 Google-hit pulls (each `maxItems=1`, $0.005,
  charged only when a profile comes back), and one SERP page (≈ $0.002). Worst case about $0.072 per person.
- **Limits** (`lib/limits.ts`; round 3). They are counted only when a paid run is about to start, so cache hits and
  attaches never count (a prefetched job is counted once, at A2):
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
- **Search-data cards** (partial cards) go through the same `matchProfile`, on LinkedIn's structured bits only:
  the name, the current company (Google's `personalInfo.companyName`, the snippet's "Experience: X", or a whole
  "Name - Role - Company" title) and the headline. An email domain or an "ex-" mention in the snippet is not the
  company. Only ≥ 0.9 shows a partial card; 0.7 on search data never does.
- **Test (no network):** `node --test scripts/linkedin-prefetch.test.mjs` (6 cases: attach keeps the runs, store and
  clock and takes the new title; other names/companies, expired or empty jobs never attach; the guessed slug;
  search-data cards from real Google results; the guard on search data).

### Measured: speed (v4.2, Nov 5, local dev, "Sanchit Tripathi / Grapevine / Strategy Lead", 3 paid lookups)
Polled exactly like the flow (`scripts/lookup-timing.mjs`); Apify's own run times from its run log.

| | First card | Where the time went |
|---|---|---|
| **Before** (v4.1 code, cold, poll every 1.7 s) | **16.0 s** | start 1.1 s · people-search actor 13.8 s · ~1 s until the next poll · final poll 0.6 s. Google was still running (it hit its 60 s limit). |
| **After, no prefetch, people lane only** (guess off for the test, frontend unchanged) | **12.2 s** (≈ 10.6 s without a dev recompile in the start) | start 2.7 s (1.6 s of it Next recompiling) · people actor 9.7 s · card out **5 ms** after the run finished (the poll was holding) |
| **After, prefetch at A2, A3 start 4 s later** (poll every 150 ms) | **0.9 s after the A3 start** (4.9 s after A2) | start 1.15 s · guessed-slug pull 2.7 s · attach 0.03 s · first poll 0.58 s. One set of runs for both starts (SERP 6.1 s, people 7.9 s, guess 2.7 s). |
| Cache hit (same name + company + role) | **0.05 s** (first poll at once; 0.37 s at today's 300 ms first-poll delay) | |

What sets the floor: the people-search actor (one LinkedIn API call; 4–14 s across the last 10 runs, ~9 s median;
it pushes all its results at the end, so there's nothing to read early). Our own overhead after the actor finishes
is now ~0.05–0.6 s (was ~1–2 s). So on a cache miss:
- **guessed slug owned by the person:** card ~4 s after A2, so on screen at once at A3;
- **anyone else, with prefetch:** ~10–11 s after A2, so **≤ 6 s after A3** when the title takes ≥ 5 s to type;
- **without prefetch:** ~10–11 s (was ~15–16 s).
The next lever, not built: the people search needs only the name, so it could start at A1 (name submit) and win
the company step's typing time too (cost: a $0.05 search for everyone who leaves at A2).

The mocked-Apify run of the state machine (`scripts/linkedin-flow-mock.sh`, no network, ~2 min) covered: prefetch + attach (one paid
job, the limits counted once), two starts at the same instant (one job), the guessed slug as a stranger (rejected,
nothing stored; people search wins), partial → full, partial → retracted, no opt-in (no partial), cache hit, a
different title attaching via KV without the gate, the 0.7 wait, and "not me".

### Measured: before the speed work (Nov 4–5)
| | Before | After |
|---|---|---|
| First lookup | 16.5 s, and the **wrong** person (a student with the same name; the SERP-only path) | **11.6 s and 13.2 s**, right person (score 1.0) |
| Same name + company again | 16.5 s | **0.4–0.6 s** (first poll) |
| "No, not me" (next profile already held) | ~5–15 s (a new profile run) | **0.3 s**; at most +5 s when it waits for a Google company hit |

**After the guard (Nov 5):** found in 12 s, right person, score 0.9 (name + company, from his recent role at
Grapevine; "Strategy Lead" isn't on his profile). "No, not me" then ended at `not_found` (32 s, waiting out the Google
run and its guarded pulls) instead of offering a stranger. The repeat was a v5 cache hit: found on the first poll, 0.16 s.

### Endpoints (v4.2: additive; old clients work unchanged)
- `POST /api/linkedin/start` `{name, company, role?, url?, token?, partial?}` returns
  `{state:"pending", stage, token}` or `{state:"error", message, code?}`. Statuses: 400 bad input, 429 with `code:"rate_limited"` or `"daily_cap"`, 502 Apify down, 503 offline. **Branch on `code`, never on the message.**
  - `role` may be empty or missing: that's the **A2 prefetch**. It launches the paid lanes (or joins a job for the
    same name + company, or is a cache hit) and counts against the limits once.
  - `token`: the `token` from an earlier start for the **same name + company** (the A2 reply). The new start attaches
    to that job instead of paying again. A token for anyone else, an expired one, or none at all is fine: the server
    then looks the job up in KV, and only then starts a new paid search.
  - `partial: true`: this client handles partial cards (below). Leave it out and nothing changes.
  - Order the server tries: the v5 cache for this exact name + company + role; the job (token, then KV); a paid start.
- `GET /api/linkedin/poll?t=<token>` returns `{state:"pending", stage:"search"|"people"|"profile", token}`,
  `{state:"found", profile, next}`, `{state:"not_found", next:null}` or `{state:"error", message}`.
  **Always use the token from the latest reply.** It carries the state.
  - A poll may take **up to ~5 s**: it holds until a run finishes (or the stage changes) instead of answering
    `pending` straight away. Poll again as soon as a `pending` reply comes back (≤ 250 ms; no 1.7 s wait needed).
  - Every poll reply carries **`timings`** (ms since the first start of the job): `start` (paid runs launched),
    `attach` (the A3 start joined), `search` / `people` / `guess` / `pull` (when a poll saw that run finished),
    `apify` (each run's own time on Apify), `first` (first card out) and `src` (`people` | `search` | `guess` |
    `cache`), `full` (the full card after a partial), `n` (polls), `cache: 1` on a cache hit. For logs and analytics;
    the card doesn't need it. The server also logs it once per lookup (`[linkedin] first card {…}`, no names) and
    writes it to the job record.
  - With `partial: true` on start, `found` also carries `partial`:
    - `partial: true` + `token`: a search-data card (name, headline, company, location; **no photo, no experience
      rows**). Show it and let them answer, but **keep polling with `token`**.
    - `partial: false`: the full card. Replace the partial one in place (same person, same slug).
    - `retracted: true` (on `pending` or `not_found`, rarely on `found` with a different person): the full profile
      failed the guard, so the partial card was someone else. Take it down: back to A4 (pending), to the next card
      (found), or to not-found.
- `POST /api/linkedin/profile` `{next}` ("not me") returns `pending` (the next poll shows the next candidate) or `not_found`.
  We show at most 3 profiles per lookup. It works on a partial card too (that slug is never shown again).

`stage` can go straight from `search` to `profile`, or end at `found` without ever reaching `profile`.
`people` means Google has finished and the people search is still running. The guessed-slug pull never reports
`profile` (it runs from the start). Keep using `Math.max` on the stage index.

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

  The reply carries the **earlier row's id**. The resume stays under that row's KV key (on Railway, its file in
  `${DATA_DIR}/resumes/`; it isn't written again), and
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
- `GET /r/<id>/<sig>` → the resume from KV (Railway: `${DATA_DIR}/resumes/`) under its original filename (`filename` + RFC 5987 `filename*`). The type
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
# the attach logic and search-data cards, no network
node --test scripts/linkedin-prefetch.test.mjs
# timed lookups the way the flow polls (paid unless cached; allowed identity only)
node scripts/lookup-timing.mjs                                  # one start with the title
POLL_MS=150 node scripts/lookup-timing.mjs --prefetch 4000      # A2 start, 4 s typing, A3 start with the A2 token
# one real lookup (the allowed identity only): start, then poll with the latest token every ~2 s
T=$(curl -s localhost:3217/api/linkedin/start -H 'content-type: application/json' \
  -d '{"name":"Sanchit Tripathi","company":"Grapevine","role":"Strategy Lead"}' | python3 -c 'import json,sys;print(json.load(sys.stdin)["token"])')
curl -s "localhost:3217/api/linkedin/poll?t=$T"   # repeat with the token from each pending reply
```
The leads loop end to end (fake lead, local webhook listener, /leads, resume, notes, resync, and the no-email double
upload: one row, with the email, one sheet push): `scripts/leads-smoke.sh`.

Real lookups cost money. Test only with "Sanchit Tripathi" at "Grapevine". A repeat within 6 h is a free cache hit.

## Storage: Cloudflare or Railway
Every "D1" and "KV" above means the `DB` and `RESUMES` bindings. On Cloudflare they are D1 and KV. On Railway (a Node
server with `DATA_DIR` set) `lib/node-bindings.ts` provides the same two bindings over `${DATA_DIR}/talboss.sqlite`
(rows, plus a `_kv` table with expiry for the rate limits, lookup cache, jobs and photos) and `${DATA_DIR}/resumes/`,
so every route above behaves the same, including the one-lead merge. Client IP for the limits:
`cf-connecting-ip`, else `x-real-ip`, else the first `x-forwarded-for`. Setup, backups and the differences:
`docs/team/RAILWAY.md`.

## Ship
Cloudflare: `npm run db:migrate` (applies **0004 and 0005** to remote D1), then `npm run deploy`.
Railway: push; the server applies new migrations itself at boot (`docs/team/RAILWAY.md`).
**On Cloudflare, run the migration before the deploy:** `/api/upload` writes `applications.linkedin_photo` (0004) and
`submissions.resume_sha256` (0005), and `/leads` and `/sheet.csv` read the 0004 columns, so a deploy without both
fails every upload. Locally: `npm run db:migrate:local` (the smoke script runs it too).
Secrets: `LEADS_KEY`, `LEADS_WEBHOOK_URL`, `LEADS_WEBHOOK_SECRET` (`npx wrangler secret put …`; see LEADS.md).
Without the webhook pair, uploads still work and rows wait as pending until it's set and Resync runs.
