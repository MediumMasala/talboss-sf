// Converts the chosen stills into AVIF + WebP in public/art/.
//   hero: round 6b "The fog is thinking", coder on a bench (docs/team/art/round6/PICK.md, 6b), 16:9 at 1440 / 2880 / 3840, 4:5 at 800 / 1600.
//   Done + orb: round 3. Numbers wall: round 5. Those three are unchanged.
// Run: node scripts/art.mjs   (sharp is already in node_modules via next)
// Never upscales: a width larger than the source is skipped (and logged).
import sharp from "sharp";
import { mkdirSync, statSync } from "node:fs";

const R3 = "docs/team/art/round3";
const R5 = "docs/team/art/round5";
const R6 = "docs/team/art/round6";
const OUT = "public/art";
mkdirSync(OUT, { recursive: true });

/** Default encoder settings (the Done still, the orb and the wall keep these, as before). */
const STD = { avif: 52, webp: 74 };
/**
 * Hero: the round-6 plates are mostly near-black, so a higher quality costs little. q 72 keeps the plate's film
 * grain and the fog filaments clean at 200 % on a 1440 retina; the 2880 AVIF is ~121 KB (budget ≤ 450 KB).
 */
const HERO = { avif: 72, webp: 82 };

/** name in public/art → source file, the widths we serve, encoder quality. */
const JOBS = [
  { name: "hero-16x9", src: `${R6}/fog-f1-16x9.png`, widths: [1440, 2880, 3840], q: HERO },
  { name: "hero-4x5", src: `${R6}/fog-f1-4x5.png`, widths: [800, 1600], q: HERO },
  { name: "done-4x5", src: `${R3}/horizon-dawn-b-4x5.png`, widths: [480, 720, 928], q: STD },
  { name: "orb-4x5", src: `${R3}/chrome-orb-b-4x5.png`, widths: [480, 720, 928], q: STD },
  // Faint full-bleed background for the numbers wall (round 5 PICK.md); not wired into a component yet.
  { name: "wall-16x9", src: `${R5}/valley-nodes-a-16x9.png`, widths: [1024, 1376], q: STD },
  { name: "wall-4x5", src: `${R5}/valley-nodes-a-4x5.png`, widths: [480, 928], q: STD },
];

const kb = (p) => `${Math.round(statSync(p).size / 1024)} KB`;

for (const job of JOBS) {
  const { width: srcW } = await sharp(job.src).metadata();
  for (const w of job.widths) {
    if (w > srcW) {
      console.log("skip", job.name, w, `(source is ${srcW} wide; never upscale)`);
      continue;
    }
    const img = sharp(job.src).resize({ width: w }).greyscale();
    const avif = `${OUT}/${job.name}-${w}.avif`;
    const webp = `${OUT}/${job.name}-${w}.webp`;
    await img.clone().avif({ quality: job.q.avif, effort: 6 }).toFile(avif);
    await img.clone().webp({ quality: job.q.webp }).toFile(webp);
    console.log("ok", job.name, w, "avif", kb(avif), "webp", kb(webp));
  }
}
// The social card is scripts/og.mjs (it composites the wordmark).
