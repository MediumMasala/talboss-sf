#!/bin/sh
# Run the mocked-Apify scenarios for the LinkedIn lookup (scripts/linkedin-flow-mock.mts). No network, no cost.
# Node can't resolve lib/'s extensionless imports, so copy lib/ to a temp dir with ".ts" added, then run there.
set -e
cd "$(dirname "$0")/.."
DIR="$(mktemp -d)"
mkdir -p "$DIR/lib"
for f in linkedin linkedin-flow linkedin-job linkedin-match limits; do
  sed -E 's#from "\./(linkedin|linkedin-flow|linkedin-job|linkedin-match|limits)"#from "./\1.ts"#g' "lib/$f.ts" > "$DIR/lib/$f.ts"
done
cp scripts/linkedin-flow-mock.mts "$DIR/run.mts"
cd "$DIR" && node --experimental-strip-types --no-warnings run.mts
rm -rf "$DIR"
