#!/bin/bash
# Screenshots of every screen at 1440 × 900 and 390 × 844 (plus full-length landings) into docs/team/shots-v4/.
# Needs the dev server on :3217 (the ?state= previews and /preview are development-only). Headless Chrome with
# 6 s of virtual time so entrance animations finish. Headless windows can't be narrower than 500 px, so 390 is
# captured through /preview's bare iframe and cropped.
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT="docs/team/shots-v4"
BASE="${BASE:-http://localhost:3217}"
cap() { "$CHROME" --headless=new $5 --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=6000 --window-size="$3,$4" --screenshot="$OUT/$2.png" "$BASE$1" >/dev/null 2>&1; }
crop() { node -e "const s=require('sharp');s('$OUT/$1.png').extract({left:0,top:0,width:$2,height:$3}).toBuffer().then(b=>s(b).toFile('$OUT/$1.png'))"; }
STATES=(A1 A2 A3 A4 A5 notfound ratelimited dailycap link searchdown offline A6 sending A6b A7)
IDX=(1 2 3 4 5 6 7 8 9 10 11 12 13 14 15) # positions in app/preview SCREENS
for i in "${!STATES[@]}"; do
  s=${STATES[$i]}
  cap "/start?state=$s" "flow-$s-1440" 1440 900
  cap "/preview?s=${IDX[$i]}&w=390&h=844&bare=1" "flow-$s-390" 600 844 && crop "flow-$s-390" 390 844
  echo "$s"
done
cap "/" "landing-1440-fold" 1440 900
cap "/preview?s=0&w=390&h=844&bare=1" "landing-390-fold" 600 844 && crop landing-390-fold 390 844
# Full length with prefers-reduced-motion: the static, complete page (every bubble, number and card in its end state).
cap "/" "landing-1440-full-reduced" 1440 5200 --force-prefers-reduced-motion
cap "/preview?s=0&w=390&h=5700&bare=1" "landing-390-full-reduced" 600 5700 --force-prefers-reduced-motion && crop landing-390-full-reduced 390 5700
