# Tal Boss: resume drop for SF startups

Single-page resume drop for engineers, PMs and designers who want SF startup roles.
Deliberately simple: funding bar, one card (headline + upload), three steps, footer.
Tal Boss brand, copied from the live Tal Boss site: black canvas, `#1c1c1e` cards, SF Pro headlines (Inter elsewhere),
white pill buttons, underline inputs, the Tal Select scribble, and the FOUNDER / YOU hands (desktop only) that
reach closer as someone moves through the upload.
Next.js 16 (App Router) + TypeScript + Tailwind v4 + Framer Motion.

Live: **https://talboss-sf.yash-a8e.workers.dev** (Cloudflare Worker `talboss-sf`, Grapevine account).

## Run it

```bash
npm install
npm run db:migrate:local   # once, creates the local D1 table
npm run dev                # http://localhost:3000, with local KV/D1 via OpenNext
```

## Deploy (Cloudflare)

```bash
npm run deploy             # OpenNext build + wrangler deploy
```

Config is `wrangler.jsonc` (account pinned to the Grapevine account). Set `NEXT_PUBLIC_SITE_URL` once you have a
custom domain (used for canonical + OG tags).

## Edit copy

Everything you read on the page is in **`content/site.ts`**:

- `BRAND_NAME`: the product name (title, alt text, OG image).
- The funding line, headline, hand tags, the three steps, logo strip, upload copy, every error message.
- Colours live as tokens at the top of `app/globals.css`. Brand assets are in `public/` (wordmark, hands).

Search the file for `PLACEHOLDER` to find what needs replacing.

## The upload box

`<ResumeDrop id="..." />` in `components/resume-drop/` is one reusable component. If you add a second box to the
page (say, at the bottom), the two share one flow (`flow.tsx`): if someone starts in one, the other shows
"finish it ↑" and jumps back. Outside `<ResumeFlowProvider>` it works standalone.

No form: picking a file uploads it. States: `idle → dragging → matching → done`, plus `error` for a bad file or a
failed upload. The current state is on the wrapper as `data-state`.

The server reads the email and LinkedIn URL off the resume (`lib/extract.ts`: PDF text incl. font ToUnicode maps
and mailto links, DOCX via its XML). If no email is found, the success screen asks them to add one and re-upload.

File checks live in `lib/validation.ts` (browser, instant errors) and again in `app/api/upload/route.ts`, which also
checks the file's real bytes (PDF / DOCX signature). UTM params from the page URL are saved with each submission.

## Where the resumes go

`lib/storage.ts`:

- **Resume files:** Workers KV namespace `talboss-sf-resumes` (binding `RESUMES`), key `resume:<id>`.
  KV because R2 isn't enabled on the Grapevine account; KV holds files up to 25MB.
- **Details:** D1 database `talboss-sf-submissions` (binding `DB`), table `submissions` (`migrations/`).
- **See them:** Google Sheet "Tal Boss SF Resumes". Cell A1 holds
  `=IMPORTDATA("https://talboss-sf.yash-a8e.workers.dev/sheet.csv?key=SHEET_KEY&r="&$Z$1)`. A bound Apps Script
  (`google-sheet/refresh.gs`, time trigger every 15 min) writes a timestamp to hidden cell Z1, which changes the URL
  and makes Google re-fetch instead of using its hourly cache. `scripts/sheet-formula.sh` copies the base formula.
  One row per resume, oldest first: time (IST), email, LinkedIn, resume link, ad source, file name, ID.
  Each resume link is `/r/<id>/<signature>` (HMAC with `LINK_SECRET`), so it opens that one file and nothing else.
  `SHEET_KEY` and `LINK_SECRET` are Worker secrets; your copies are in `.dev.vars` (gitignored).
- Outside Cloudflare (plain `next start`) it falls back to `./.uploads/` (gitignored: personal data).

## Privacy + terms

The site runs under Grapevine's policies (`site.legal` in `content/site.ts`): the footer links to
https://www.grapevine.in/privacy and /terms, and `/privacy` and `/terms` redirect there. "By uploading, you agree to our
Privacy Policy and Terms" sits under the upload button on `/` and in the footer on `/v2`, and every saved submission
records which policy URLs the person agreed to.

## Plug in analytics

`lib/analytics.ts` exports `track(event, props)`. It's a no-op that logs to the console in dev. Add Mixpanel inside
that one function. Events fired today: `resume_selected`, `resume_rejected`, `resume_uploaded` (with `email_found`),
`upload_failed`, `match_shown`, `jump_to_active_upload`.

## Where things are

```
content/site.ts              all copy and names
app/page.tsx                 section order
app/v2/page.tsx              light, idle.space-style version (noindex preview; components/light/)
app/api/upload/route.ts      upload endpoint
app/sheet.csv/route.ts       CSV feed for the Google Sheet (needs ?key=SHEET_KEY)
app/r/[id]/[sig]/route.ts    signed per-resume link
migrations/                  D1 schema
wrangler.jsonc               Cloudflare config
app/opengraph-image.tsx      generated OG image (placeholder)
components/resume-drop/      the upload flow
components/                  FundingBar, Nav, Hands, Hero, HowItWorks, Footer
lib/storage.ts               storage adapter
lib/extract.ts               email + LinkedIn from the resume
lib/analytics.ts             track()
```

## Notes

- Reduced motion: the scribble shows already drawn, the funding-bar shine and hand movement stop, and the matching
  checklist ticks faster.
- Lighthouse (mobile, production build): 100 performance / 100 accessibility / 100 best practices / 100 SEO.
