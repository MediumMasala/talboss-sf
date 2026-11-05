// Builds app/opengraph-image.jpg: the round-5 OG still (the valley as a silver model city) with the metallic tal wordmark composited in the black sky.
// Run: node scripts/og.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const logo = readFileSync("public/ds/tal-logo.svg", "utf8");
const paths = [...logo.matchAll(/<path[^>]*d="([^"]+)"/g)].map((m) => m[1]);
const H = 150; // wordmark height on the 1200 × 630 card
const W = Math.round((H * 27) / 16.5963);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 27 16.5963">
  <defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#FFFFFF"/><stop offset="0.45" stop-color="#DBDBDB"/><stop offset="1" stop-color="#9A9A9A"/>
  </linearGradient></defs>
  ${paths.map((d) => `<path d="${d}" fill="url(#m)"/>`).join("")}
</svg>`;
const mark = await sharp(Buffer.from(svg)).png().toBuffer();
await sharp("docs/team/art/round5/og-a-1200x630.jpg")
  .composite([{ input: mark, left: Math.round((1200 - W) / 2), top: 58 }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile("app/opengraph-image.jpg");
writeFileSync(
  "app/opengraph-image.alt.txt",
  "The silver tal wordmark in a black sky above a silver model of the San Francisco Bay Area at night, the bridges and the valley's campuses glowing down the peninsula. The talent agent for engineers, researchers, PMs and designers. In early preview within the SF Bay Area.",
);
console.log("ok", W, H);
