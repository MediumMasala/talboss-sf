# Railway: running the site as a plain Node server

The same code runs in two places. Nothing in the routes, the flow or the leads desk knows which.

| | Cloudflare Worker (unchanged) | Railway (Node) |
|---|---|---|
| Start | `npm run deploy` (OpenNext) | `npm run build`, then `npm start` (`next start -p $PORT`) |
| Rows (`DB`) | D1 `talboss-sf-submissions` | `${DATA_DIR}/talboss.sqlite` (SQLite, WAL) |
| Resumes | KV `RESUMES`, key `resume:<id>` | `${DATA_DIR}/resumes/<id>.pdf` (or `.docx`) |
| Rate limits, lookup cache, jobs, photos | KV `RESUMES` (`rl:*`, `cap:*`, `li:*`) | table `_kv` in the same SQLite file, with expiry |
| Secrets | `wrangler secret put` | Railway service variables |
| Migrations | `npm run db:migrate` before the deploy | applied automatically when the server boots |

How it switches: when `DATA_DIR` is set and the code is not inside a Worker, `cloudflareEnv()` (lib/storage.ts) and
`workerEnv()` (lib/env.ts) return `nodeEnv()` from `lib/node-bindings.ts`, an object with the same shape as the
Worker's env: a D1-compatible `DB` over better-sqlite3, a KV-compatible `RESUMES`, and the secrets from
`process.env`. So the D1 code path (one lead per person merging, leads desk, resync, CSV, sheet push) is the only path.
Without `DATA_DIR` and without Cloudflare (a bare `next start`), uploads still fall back to `./.uploads/` as before.

## Set up the Railway service (once)

1. New service from the GitHub repo, branch `tal-select-us`. `railway.json` sets the build (`npm run build`), the start
   (`npm start`), a health check on `/` and restart on failure. Node 22+ comes from `engines` in package.json
   (better-sqlite3 needs it).
2. **Add a volume** to the service, mount path `/data`.
3. **Variables:**

| Variable | Value | Needed for |
|---|---|---|
| `DATA_DIR` | `/data` (the volume's mount path) | everything: without it the site stores nothing durable |
| `LINK_SECRET` | the same value as the Worker's, so existing resume links keep working | resume links, photo links, lookup tokens |
| `APIFY_TOKEN` | the Apify token | LinkedIn lookup |
| `LEADS_KEY` | long random value | `/leads` (unset = 404) |
| `LEADS_WEBHOOK_URL`, `LEADS_WEBHOOK_SECRET` | the Apps Script `/exec` URL and its secret (LEADS.md) | the Google Sheet push |
| `SHEET_KEY` | long random value | `/sheet.csv?key=` |
| `GEMINI_API_KEY` | optional, unused since v4 | nothing |

Railway sets `PORT` itself. Do not set `DATA_DIR` as a Worker variable on Cloudflare.

4. **Keep it at one replica.** The database is a file on the volume; two replicas would be two databases. A service
   with a volume also restarts with a few seconds of downtime on each deploy (Railway stops the old container before
   mounting the volume on the new one), which is what keeps one writer.

## What happens at boot
`instrumentation.ts` runs once when the server starts. With `DATA_DIR` set it opens `${DATA_DIR}/talboss.sqlite`
(WAL mode, 5 s busy timeout) and applies every file in `migrations/` that isn't recorded yet, in filename order, each in
its own transaction. Applied names go in `d1_migrations`, the same table wrangler uses on D1, so a D1 export loaded
here is not migrated twice, and vice versa. The log shows `[node-bindings] applied migrations: …` when anything ran
and nothing otherwise. A migration that fails is rolled back and every request answers 500 (`Failed to prepare
server SqliteError: … loading instrumentation hook`), so the health check on `/` fails and the deploy is marked
failed instead of half-working. Fix the file and redeploy.
New migrations go in `migrations/` as always; Railway applies them on the next deploy, and D1 still needs
`npm run db:migrate`.

Files in the volume:
```
/data/talboss.sqlite        rows: submissions, applications, d1_migrations, _kv (rate limits, caches, photos)
/data/talboss.sqlite-wal    write-ahead log (part of the database: copy it too, or use the backup below)
/data/resumes/<id>.pdf      one file per resume, named by the lead's id; the original filename is in _kv.metadata
```

## Back up and download
From a machine with the Railway CLI logged in to the project (`railway link` once):
```bash
# a consistent snapshot of the database next to the live one (safe while the site runs)
railway ssh -- node -e 'require("better-sqlite3")("/data/talboss.sqlite").backup("/data/backup.sqlite").then(() => console.log("ok"))'
# download the snapshot and every resume as one archive (base64 so the binary survives the terminal)
railway ssh -- sh -c 'tar czf - -C /data backup.sqlite resumes | base64' | base64 -d > tal-backup-$(date +%F).tgz
railway ssh -- rm /data/backup.sqlite
```
Open the copy with any SQLite tool (`sqlite3 backup.sqlite 'select count(*) from submissions'`). The leads alone are
also one click away as CSV: "Download CSV" on `/leads`. (These commands are written against the Railway CLI's
`ssh`; they were not run against a live Railway project from here.)

## Moving the existing leads from Cloudflare
Not automatic. Rows: `npx wrangler d1 export talboss-sf-submissions --remote --output d1.sql`, then before the first
boot load it into the volume's database (`sqlite3 /data/talboss.sqlite < d1.sql`); its `d1_migrations` rows stop the
boot from re-applying 0001–0005. Resumes live in Cloudflare KV under `resume:<id>` with `{name, type}` metadata; each
one has to be copied into `/data/resumes/` plus a `_kv` row (`key = 'resume:<id>'`, `file = '<id>.pdf'`,
`metadata = '{"name":…,"type":…}'`). Keep `LINK_SECRET` the same so the sheet's resume links keep working.

## Run it locally the Railway way
```bash
export DATA_DIR=/tmp/talboss-data LINK_SECRET=… LEADS_KEY=… LEADS_WEBHOOK_SECRET=… LEADS_WEBHOOK_URL=http://127.0.0.1:8977/hook
npm run build && PORT=3219 npm start
BASE=http://localhost:3219 scripts/leads-smoke.sh   # the whole leads loop; reads the values above from the environment
```
`next dev` with `DATA_DIR` set also uses SQLite (and skips the wrangler proxy that `initOpenNextCloudflareForDev`
starts). Without `DATA_DIR`, `next dev` uses the local D1/KV as before.

## What behaves differently on Railway
- **One server, one file.** No replicas; a few seconds of downtime per deploy (see above).
- **The sheet push after an upload** runs in the same process after the reply (on Workers it's `ctx.waitUntil`). If the
  container restarts in that second, the row stays pending and Resync pushes it, the same as a failed push today.
  Failures are logged as `[waitUntil] background task failed` (the push itself already logs `[leads] …`).
- **Rate limits and caches are exact.** D1 and KV were eventually consistent across Cloudflare locations; here a counter
  or a cached lookup is visible to the next request immediately, and expiry is checked on every read (expired rows are
  swept every 10 minutes). The limits themselves (30/h per network, 3/h per name, 300 paid/day) are unchanged.
- **Client IP** for the limits: `cf-connecting-ip` on Cloudflare; on Railway `x-real-ip` (set by Railway's edge), then
  the first `x-forwarded-for` entry.
- **Resumes are files** in `/data/resumes/`, so a backup is a folder. The upload limits are unchanged (5 MB, PDF/DOCX).
- **better-sqlite3 is a native module.** Railway's default builder downloads a prebuilt binary for Linux x64; a custom
  Alpine image would need build tools (`python3 make g++`).

The Cloudflare path is untouched: `npm run deploy` builds the Worker exactly as before (checked with
`opennextjs-cloudflare build` and a local `wrangler dev` upload into the local D1).
