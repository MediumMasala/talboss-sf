// Converts the chosen stills (hero + numbers wall: docs/team/art/round5, Done + orb: round3) into AVIF + WebP at three widths in public/art/.
// Run: node scripts/art.mjs   (sharp is already in node_modules via next)
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const R3 = "docs/team/art/round3";
const R5 = "docs/team/art/round5";
const OUT = "public/art";
mkdirSync(OUT, { recursive: true });

/** name in public/art → source file and the three widths we serve. */
const JOBS = [
  { name: "hero-16x9", src: `${R5}/valley-isometric-b-16x9.png`, widths: [640, 1024, 1376] },
  { name: "hero-4x5", src: `${R5}/valley-isometric-b-4x5.png`, widths: [480, 768, 928] },
  { name: "done-4x5", src: `${R3}/horizon-dawn-b-4x5.png`, widths: [480, 720, 928] },
  { name: "orb-4x5", src: `${R3}/chrome-orb-b-4x5.png`, widths: [480, 720, 928] },
  // Faint full-bleed background for the numbers wall (round 5 PICK.md); not wired into a component yet.
  { name: "wall-16x9", src: `${R5}/valley-nodes-a-16x9.png`, widths: [1024, 1376] },
  { name: "wall-4x5", src: `${R5}/valley-nodes-a-4x5.png`, widths: [480, 928] },
];

for (const job of JOBS) {
  for (const w of job.widths) {
    const img = sharp(job.src).resize({ width: w }).greyscale();
    await img.clone().avif({ quality: 52, effort: 6 }).toFile(`${OUT}/${job.name}-${w}.avif`);
    await img.clone().webp({ quality: 74 }).toFile(`${OUT}/${job.name}-${w}.webp`);
  }
  console.log("ok", job.name);
}
// The social card is scripts/og.mjs (it composites the wordmark).
