# Leads: where every application lands

Every application (name, company, LinkedIn, email, resume) lands in three places:

| Where | What it's for | How to open it |
|---|---|---|
| **Leads desk** `/leads` | The team's working view: photo, LinkedIn card, top 3 roles, email, resume download, notes | `https://<site>/leads?key=<LEADS_KEY>` once; a cookie keeps you in for 30 days |
| **Google Sheet** (tab "Leads") | The sheet the team already lives in. A new row arrives seconds after each application, with the resume as a link | The sheet you set up below |
| **CSV** `/sheet.csv` | Exports, and the old `=IMPORTDATA` sheet (still works) | "Download CSV" on `/leads`, or `/sheet.csv?key=<SHEET_KEY>` |

The source of truth is D1 (`submissions` + `applications`) and KV (`resume:<id>`, the file under its original name).
The sheet is a copy: deleting a row there deletes nothing. Team notes typed in the sheet go in **column L onward**; the
script only ever writes columns A–K, so they survive every update.

## How the sheet stays current
1. `/api/upload` saves the lead, answers the browser, then (in `ctx.waitUntil`) POSTs it to the Apps Script web app.
2. It retries once after 1.5 s. If both fail, the row keeps `sheet_pending = 1`.
3. **Resync sheet** on `/leads` (or `POST /api/leads/resync?key=<LEADS_KEY>`) pushes every pending row, oldest first,
   50 per request, up to 500 per click. The script upserts by ID, so pushing a row twice writes it once.
4. Rows from before this change start as pending, so the **first resync backfills the whole history**.
5. **Only complete leads go to the sheet.** When a resume has no email on it, the site asks for one and the browser
   sends the same resume again with the typed address. That is **one lead, not two**: the second upload fills in the
   first row (same ID, same resume link) when the resume file is byte-for-byte the same, it came within 30 minutes,
   the first row had no email, and name, company and title match (ignoring case and spacing). The email-less first
   upload is never pushed; the completed row is pushed once. Someone who leaves without typing an email shows on
   `/leads` and in the CSV, never in the sheet.

Sheet columns: Submitted (IST) · Name · Company · Title · Email · LinkedIn (link) · LinkedIn status · Headline ·
Resume ("Open resume (file.pdf)" link, or "no resume") · Source (UTM) · ID.

Resume links are `/r/<id>/<sig>` with `sig = HMAC(LINK_SECRET, id)`. **They don't expire**; they stop working only if
`LINK_SECRET` changes. Each link opens one resume and nothing else. PDFs open in the tab, DOCX downloads, and `?dl=1`
always downloads.

## Setup (once, about 10 minutes)

**1. Create the sheet.** In Google Drive: New → Google Sheets, name it "Tal US leads". Share it with the team.

**2. Paste the script.** In the sheet: Extensions → Apps Script. Delete what's there, paste all of
`scripts/leads-sheet.gs`, press Save. Then Project Settings (gear icon) → Script properties → Add property:
`LEADS_WEBHOOK_SECRET` = a long random value (make one with `openssl rand -hex 24`; keep it for step 4).
Back in the editor, pick `setup` in the function menu → Run → allow access. A "Leads" tab with the header row appears.

**3. Deploy it as a web app.** Deploy → New deployment → type **Web app** → Execute as **Me** → Who has access
**Anyone** → Deploy → copy the **Web app URL** (ends in `/exec`). "Anyone" is needed because the Worker has no Google
login; the secret in the body is what keeps strangers out. Each later edit to the script needs Deploy → Manage
deployments → edit → Version: New version, or the old code keeps running.

**4. Give the Worker the three secrets** (from the repo folder):
```bash
npx wrangler secret put LEADS_WEBHOOK_URL      # paste the /exec URL
npx wrangler secret put LEADS_WEBHOOK_SECRET   # the same value as the Script property
npx wrangler secret put LEADS_KEY              # a new long random value; this opens /leads
npm run db:migrate                             # applies 0004_leads.sql and 0005_resume_hash.sql to the live D1 (BEFORE the deploy)
npm run deploy
```

**5. Test it.**
```bash
# a) The script alone: should print {"ok":true,"written":1} and add a "Test lead" row (delete it after)
curl -sL "$LEADS_WEBHOOK_URL" -H 'content-type: application/json' \
  -d '{"secret":"'"$LEADS_WEBHOOK_SECRET"'","rows":[{"id":"test-1","submittedIst":"2026-11-04 12:00","name":"Test lead","company":"Acme","title":"Engineer","email":"test@example.com","linkedinUrl":"","linkedinStatus":"skipped","headline":"","resumeUrl":"","resumeName":"","source":"curl"}]}'
# b) Backfill every lead so far into the sheet (prints {"pushed":N,"pending":0,"ok":true})
curl -s -X POST "https://talboss-sf.yash-a8e.workers.dev/api/leads/resync?key=$LEADS_KEY"
# c) Open the desk
open "https://talboss-sf.yash-a8e.workers.dev/leads?key=$LEADS_KEY"
```
`{"ok":false,"error":"forbidden"}` means the two secrets differ. An HTML page instead of JSON means the deployment
isn't "Anyone" or the URL isn't the `/exec` one.

## Local test
`scripts/leads-smoke.sh` runs the whole loop on your machine against a python stand-in for the Apps Script
(instructions at the top of the file: three lines in `.dev.vars`, restart `npx next dev -p 3217`). It submits a fake
lead with a PDF, shows the webhook payload, finds the lead on `/leads`, downloads the resume, saves a note, then stops the
listener, submits a second lead, sees it pending, and resyncs it. Last, it uploads a resume with no email and then the
same resume with a typed email, and checks there is one row, with the email, and one sheet push.

## Good to know
- `/leads`, `/api/leads/*` and `/sheet.csv` answer **404** without the key or cookie (or when `LEADS_KEY` is unset).
- The LinkedIn photo on `/leads` is the confirmed card's photo, kept as its LinkedIn URL (`applications.linkedin_photo`)
  and shown through the signed `/api/linkedin/photo` proxy. LinkedIn's photo URLs expire after some months; then the
  card shows initials. Leads from before this change have no photo.
- Rotating `LEADS_KEY` signs everyone out of `/leads`. Rotating `LINK_SECRET` breaks every resume link already in the sheet.
