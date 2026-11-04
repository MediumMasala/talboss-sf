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
- **v4 payload:** exactly the seven fields above. `pitch`, `pitchSource` and `workAuth` are no longer read; old clients may still send them, and they are ignored (new rows store `NULL` in `pitch`, `pitch_source` and `work_auth`; those columns stay for old rows, and migrations stay additive).

Storage (migration `0003_optional_resume_and_pitch.sql`, additive only): `submissions.has_resume` (1 for every old
row), and `applications.email`, `pitch` and `pitch_source` (the last two are no longer written since v4). Rows without a resume have no KV file, and their file
columns are `''`/`0`. In `/sheet.csv`, their **Resume** column reads `no resume`, and Email falls back to the typed
address. The column layout is unchanged.

- **`workAuth` is deprecated (v3)** and no longer collected. Old clients may still send it: it is ignored, the request still returns `{ok:true}`, and new rows store `null`. Old rows keep their values, and the `work_auth` column and the sheet's "Work authorization" column stay (blank for new rows). Migrations remain additive only.
- `linkedinProfile.photo` is stripped before storing: the photo is never kept with the application.

## `GET /api/linkedin/photo?u=…&s=…` (v3, additive)
In a `found` reply, `profile.photo` is now a **same-origin signed link** to this route, or `""` when there is no photo. Use it as the `<img src>` on "Is this you?".
- On first use it fetches the photo from LinkedIn's CDN (≈ 0.4 s) and keeps it in KV for 6 h, the lookup's lifetime. After that it serves from KV in about 20 ms, with `cache-control: private, max-age=3600`.
- Only links minted by poll (HMAC with `LINK_SECRET`) and only `media.licdn.com` URLs work; everything else is a 404, so it isn't an open proxy. The limit is 1 MB per image, and it never costs an Apify run.
- Shown only to the person; never stored with the application.

## `POST /api/pitch`: removed in v4
The AI intro was removed from the product. `app/api/pitch/` and `lib/pitch.ts` are deleted, so the route returns 404. They're in git history, and `docs/team/PITCH_SAMPLES.md` and `pitch-fixtures.json` stay as a record. `GEMINI_API_KEY` is no longer used.

## Test locally
```bash
npx next dev -p 3217        # reads .dev.vars at startup: APIFY_TOKEN, LINK_SECRET, SHEET_KEY
npx --cache /Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/npm-cache wrangler d1 migrations apply DB --local
# the pitch route is gone: expect 404
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:3217/api/pitch -H 'content-type: application/json' -d '{}'
# upload without a resume
curl -s localhost:3217/api/upload -F 'application={"name":"Test A","company":"Acme","designation":"Engineer","linkedinStatus":"skipped","email":"a@example.org"}'
# an old client still sending workAuth / pitch / pitchSource: also {ok:true}, all stored as null
curl -s localhost:3217/api/upload -F 'application={"name":"Test B","company":"Acme","designation":"Engineer","linkedinStatus":"skipped","email":"b@example.org","workAuth":"citizen","pitch":"x","pitchSource":"ai"}'
# bad input fails before any paid run
curl -s localhost:3217/api/linkedin/start -H 'content-type: application/json' -d '{"name":"12345","company":"Acme"}'
```
Real lookups cost money. Test only with "Sanchit Tripathi" at "Grapevine". A repeat within 6 h is a free cache hit.

## Ship
`npm run db:migrate` (applies 0003 to remote D1), then `npm run deploy`.
**Run the migration before the deploy:** `/sheet.csv` selects the new columns.
