#!/bin/bash
# Leads smoke test against a LOCAL dev server: submits a fake lead (with a tiny PDF), shows the payload the sheet's
# web app would get, finds the lead on /leads, downloads the resume, saves a note, and proves the resync path.
#
# Once, in .dev.vars (local values only; never the real sheet URL here):
#   LEADS_KEY=<any long random string>
#   LEADS_WEBHOOK_SECRET=<any long random string>
#   LEADS_WEBHOOK_URL=http://127.0.0.1:8977/hook      <- the python listener this script starts
# Then (re)start the dev server so it reads them:  npx next dev -p 3217
# Run:  scripts/leads-smoke.sh            (BASE=http://localhost:3217 by default)
# Nothing secret is printed; the fake lead is "Ana Ruiz (TEST)".
set -euo pipefail
cd "$(dirname "$0")/.."

BASE=${BASE:-http://localhost:3217}
NPM_CACHE=${NPM_CACHE:-/Users/sanchittripathi/.claude/jobs/17f7f79e/tmp/npm-cache}
TMP=$(mktemp -d)
HOOK_LOG="$TMP/hook.jsonl"
JAR="$TMP/cookies.txt"
var() { sed -n "s/^$1=//p" .dev.vars | tail -1; }

LEADS_KEY=$(var LEADS_KEY); SECRET=$(var LEADS_WEBHOOK_SECRET); HOOK=$(var LEADS_WEBHOOK_URL)
[ -n "$LEADS_KEY" ] && [ -n "$SECRET" ] && [ -n "$HOOK" ] || { echo "Add LEADS_KEY, LEADS_WEBHOOK_SECRET and LEADS_WEBHOOK_URL to .dev.vars (see the top of this file)."; exit 1; }
case "$HOOK" in http://127.0.0.1:*|http://localhost:*) ;; *) echo "LEADS_WEBHOOK_URL in .dev.vars must point at localhost for this test (it would write to the real sheet)."; exit 1;; esac
PORT=$(printf '%s' "$HOOK" | sed -E 's#^http://[^:/]+:([0-9]+).*#\1#')

step() { printf '\n\033[1m== %s\033[0m\n' "$*"; }

step "1. Local D1 migrations (same as npm run db:migrate:local)"
npx --cache "$NPM_CACHE" wrangler d1 migrations apply DB --local 2>&1 | grep -E "Migrations to be applied|No migrations|✅|0004" || true

step "2. A local stand-in for the Apps Script web app on :$PORT (checks the secret, logs rows, answers {ok:true})"
start_listener() {
  SECRET="$SECRET" HOOK_LOG="$HOOK_LOG" python3 - "$PORT" <<'PY' &
import json, os, sys
from http.server import BaseHTTPRequestHandler, HTTPServer
secret, log = os.environ["SECRET"], os.environ["HOOK_LOG"]
class H(BaseHTTPRequestHandler):
    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers.get("content-length", 0))) or b"{}")
        ok = body.get("secret") == secret
        if ok:
            with open(log, "a") as f:
                for r in body.get("rows", []): f.write(json.dumps(r) + "\n")
        out = json.dumps({"ok": ok, "written": len(body.get("rows", [])) if ok else 0}).encode()
        self.send_response(200); self.send_header("content-type", "application/json"); self.end_headers(); self.wfile.write(out)
    def log_message(self, *a): pass
HTTPServer(("127.0.0.1", int(sys.argv[1])), H).serve_forever()
PY
  LISTENER=$!
  disown "$LISTENER" 2>/dev/null || true   # no "Terminated" noise when it's stopped
  sleep 0.7
}
start_listener
trap 'kill $LISTENER 2>/dev/null || true; rm -rf "$TMP"' EXIT

step "3. Submit a fake lead with a resume"
printf '%%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%%%EOF\n' > "$TMP/Ana Ruiz Resume.pdf"
APP='{"name":"Ana Ruiz (TEST)","company":"Acme Test","designation":"Staff Engineer","linkedinUrl":"https://www.linkedin.com/in/ana-ruiz-test","linkedinStatus":"confirmed","linkedinProfile":{"fullname":"Ana Ruiz","headline":"Staff Engineer at Acme Test · payments infra","location":"San Francisco Bay Area","experience":[{"title":"Staff Engineer","company":"Acme Test","duration":"2023 - Present","current":true},{"title":"Senior Engineer","company":"Beta Corp","duration":"2019 - 2023","current":false},{"title":"Engineer","company":"Gamma Inc","duration":"2016 - 2019","current":false}]},"email":"ana.test@example.com"}'
RES=$(curl -s "$BASE/api/upload" -F "application=$APP" -F 'utm={"utm_source":"smoke","utm_medium":"test","utm_campaign":"leads"}' -F "resume=@$TMP/Ana Ruiz Resume.pdf;type=application/pdf")
echo "$RES"
ID=$(printf '%s' "$RES" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')

step "4. The webhook payload the sheet got (waitUntil, so give it a moment)"
for _ in 1 2 3 4 5 6 7 8 9 10; do grep -q "$ID" "$HOOK_LOG" 2>/dev/null && break; sleep 0.5; done
grep "$ID" "$HOOK_LOG" | python3 -m json.tool || { echo "FAIL: no webhook row for $ID"; exit 1; }

step "5. /leads: ?key= swaps for a cookie, then the lead is on the page"
curl -s -o /dev/null -w 'no cookie: %{http_code} (expect 404)\n' "$BASE/leads"
curl -s -o /dev/null -w 'wrong key: %{http_code} (expect 404)\n' -L "$BASE/leads?key=wrong"
curl -s -o /dev/null -w 'right key: %{http_code} after %{num_redirects} redirects, landed on %{url_effective}\n' -L -b "$JAR" -c "$JAR" "$BASE/leads?key=$LEADS_KEY"
PAGE=$(curl -s -b "$JAR" "$BASE/leads?q=Ana+Ruiz")
for want in "Ana Ruiz (TEST)" "Staff Engineer at Acme Test" "Beta Corp" "ana.test@example.com" "LinkedIn confirmed" "Download resume" "smoke / test / leads" " IST" " PT"; do
  printf '%s' "$PAGE" | grep -qF "$want" && echo "  ok  $want" || { echo "  MISSING  $want"; exit 1; }
done
RESUME=$(printf '%s' "$PAGE" | grep -oE "/r/$ID/[0-9a-f]{32}" | head -1)
echo "  resume link: /r/$ID/<sig>"

step "6. The resume streams with its filename"
curl -s -D - -o "$TMP/got.pdf" "$BASE$RESUME?dl=1" | grep -iE "^(HTTP|content-type|content-disposition)"
cmp -s "$TMP/got.pdf" "$TMP/Ana Ruiz Resume.pdf" && echo "  bytes match" || { echo "FAIL: bytes differ"; exit 1; }
curl -s -o /dev/null -w '  bad signature: %{http_code} (expect 404)\n' "$BASE/r/$ID/00000000000000000000000000000000"

step "7. Notes: PATCH /api/leads/:id, then they show in the CSV"
curl -s -X PATCH -b "$JAR" -H 'content-type: application/json' "$BASE/api/leads/$ID" -d '{"notes":"Smoke test: call Thursday"}'; echo
curl -s -o /dev/null -w '  PATCH without cookie: %{http_code} (expect 404)\n' -X PATCH -H 'content-type: application/json' "$BASE/api/leads/$ID" -d '{"notes":"x"}'
curl -s -b "$JAR" "$BASE/sheet.csv?download=1" | awk -v id="$ID" 'NR == 1 || index($0, id)' | sed -E 's#/r/([^/]+)/[0-9a-f]{32}#/r/\1/<sig>#'

step "8. Sheet down: the next lead stays pending, then Resync pushes it"
kill $LISTENER; sleep 0.5; echo "  (listener stopped)"
RES2=$(curl -s "$BASE/api/upload" -F 'application={"name":"Ben Ortiz (TEST)","company":"Acme Test","designation":"PM","linkedinStatus":"skipped","email":"ben.test@example.com"}')
ID2=$(printf '%s' "$RES2" | python3 -c 'import json,sys; print(json.load(sys.stdin)["id"])')
sleep 4   # one retry after 1.5 s, then it gives up
curl -s -b "$JAR" "$BASE/leads?q=Ben+Ortiz" | grep -qF "Not in the sheet yet" && echo "  ok  pending on /leads" || { echo "FAIL: not marked pending"; exit 1; }
start_listener
curl -s -X POST -b "$JAR" -H 'content-type: application/json' "$BASE/api/leads/resync" -d '{}'; echo
grep -q "$ID2" "$HOOK_LOG" && echo "  ok  resync delivered the pending lead" || { echo "FAIL: resync did not deliver"; exit 1; }

step "Done. Fake leads: $ID, $ID2 (local D1 only)"
