#!/bin/sh
# Copies the Google Sheet formula (with the private SHEET_KEY from .dev.vars) to the clipboard.
# Paste it into cell A1 of the "Tal Boss SF Resumes" sheet.
cd "$(dirname "$0")/.." || exit 1
key=$(sed -n 's/^SHEET_KEY=//p' .dev.vars)
[ -n "$key" ] || { echo "No SHEET_KEY in .dev.vars"; exit 1; }
printf '=IMPORTDATA("https://talboss-sf.yash-a8e.workers.dev/sheet.csv?key=%s")' "$key" | pbcopy
echo "Copied. In the sheet: click A1, press Cmd+V, then Enter."
