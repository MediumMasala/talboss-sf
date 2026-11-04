// One grade for every photograph on the site, baked into the files (no CSS filters on the page).
// node scripts/grade-photos.mjs   reads scripts/photo-src/*.jpg, writes public/photos/*.{avif,webp}
// and scripts/tal-grade.cube (the same grade as a 33-point 3D LUT, for anyone who wants it in Resolve/ffmpeg).
//
// The grade: blacks lifted toward moss (no pure black), a gentle S on luminance, warm highlights,
// greens pulled toward moss/olive and quietened, skin hues protected from all hue/sat moves.
import sharp from "sharp";
import { writeFileSync, mkdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SRC = fileURLToPath(new URL("./photo-src/", import.meta.url));
const OUT = fileURLToPath(new URL("../public/photos/", import.meta.url));
mkdirSync(OUT, { recursive: true });

const clamp = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

function rgb2hsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return [h, max ? d / max : 0, max];
}
function hsv2rgb(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [r + m, g + m, b + m];
}

/** The grade, on sRGB values 0..1. */
export function grade(r, g, b) {
  let [h, s, v] = rgb2hsv(r, g, b);
  // Skin: hue ~8..45 deg with moderate saturation. Weight 1 = fully protected.
  const skin = smooth(2, 14, h) * (1 - smooth(40, 52, h)) * smooth(0.12, 0.25, s) * (1 - smooth(0.7, 0.85, s));
  // Greens (yellow-green to cyan-green) toward olive ~78 deg, a little quieter.
  const green = smooth(62, 85, h) * (1 - smooth(165, 190, h));
  const k = green * (1 - skin);
  h = h + (74 - h) * 0.62 * k;
  s = s * (1 - 0.4 * k);
  v = v * (1 - 0.07 * k);
  // Overall: slightly less saturated; skin kept but never pushed orange.
  s = s * (1 - 0.1 * (1 - skin)) * (1 - 0.06 * skin);
  [r, g, b] = hsv2rgb(h, s, v);
  // Luminance S-curve (gentle) with lifted blacks and a soft shoulder.
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const ys = y + 0.12 * Math.sin(2 * Math.PI * y) * -0.5 * (1 - y) * 1.0; // mild contrast in mids
  const yl = 0.06 + ys * 0.915; // lift blacks, pull whites off 1.0
  const ratio = y > 1e-4 ? yl / y : 0;
  r = y > 1e-4 ? r * ratio : yl; g = y > 1e-4 ? g * ratio : yl; b = y > 1e-4 ? b * ratio : yl;
  // Shadows tinted toward moss (#3F5B45), highlights warmed (late sun).
  const sh = (1 - smooth(0.0, 0.45, yl)) ** 1.5, hi = smooth(0.55, 1.0, yl);
  r += -0.016 * sh + 0.042 * hi;
  g += 0.016 * sh + 0.016 * hi;
  b += -0.002 * sh - 0.048 * hi;
  return [clamp(r), clamp(g), clamp(b)];
}

// The LUT, for the record.
{
  const N = 33; let cube = `TITLE "Tal grade v3"\nLUT_3D_SIZE ${N}\n`;
  for (let bi = 0; bi < N; bi++) for (let gi = 0; gi < N; gi++) for (let ri = 0; ri < N; ri++) {
    const o = grade(ri / (N - 1), gi / (N - 1), bi / (N - 1));
    cube += o.map((x) => x.toFixed(5)).join(" ") + "\n";
  }
  writeFileSync(new URL("./tal-grade.cube", import.meta.url), cube);
}

/** name: [desktop aspect or null, mobile 4:5 crop?, widths] */
const PHOTOS = {
  window: { wide: 2.39, tall: true, widths: [1280, 1920, 2560], pos: "centre", tallX: 0.85, burn: true },
  "sf-fog": { wide: 2.39, tall: true, widths: [1280, 1920, 2560], pos: "attention", tallPos: "attention", burn: true },
  notebook: { widths: [720, 1200], band: [0.42, 1] },
  "fog-walk": { widths: [720, 1200] },
  lamp: { widths: [720, 1200] },
  cubbon: { widths: [720, 1200] },
  hill: { wide: 2.39, widths: [1280, 1920], band: [0.26, 0.62], burn: true },
};

async function gradedBuffer(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const lut = new Map();
  for (let i = 0; i < data.length; i += 3) {
    // Cache by quantised colour (5 bits/channel is visible banding; use 6 bits + exact for speed/quality balance).
    const key = (data[i] << 16) | (data[i + 1] << 8) | data[i + 2];
    let o = lut.get(key);
    if (!o) { o = grade(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255).map((x) => Math.round(x * 255)); lut.set(key, o); }
    data[i] = o[0]; data[i + 1] = o[1]; data[i + 2] = o[2];
  }
  return sharp(data, { raw: info });
}

const manifest = {};
for (const [name, p] of Object.entries(PHOTOS)) {
  const graded = await (await gradedBuffer(`${SRC}${name}.jpg`)).png().toBuffer();
  const meta = await sharp(graded).metadata();
  const entry = { w: meta.width, h: meta.height, files: [] };
  // A darkroom burn along the bottom of title frames, so type set on the image reads (baked in, never CSS).
  const burn = async (pipeline) => {
    if (!p.burn) return pipeline;
    const { width, height } = await pipeline.clone().png().toBuffer().then((b) => sharp(b).metadata());
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0.28" stop-color="#fff"/><stop offset="0.72" stop-color="#9aa393"/><stop offset="1" stop-color="#4a5548"/></linearGradient><radialGradient id="v" cx="0.62" cy="0.4" r="0.8"><stop offset="0.5" stop-color="#fff"/><stop offset="1" stop-color="#a9a89b"/></radialGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#v)" style="mix-blend-mode:multiply"/></svg>`;
    const mask = await sharp(Buffer.from(svg)).png().toBuffer();
    return sharp(await pipeline.clone().composite([{ input: mask, blend: "multiply" }]).png().toBuffer());
  };
  const emit = async (pipe0, tag, w) => {
    const pipeline = await burn(pipe0);
    for (const [fmt, opts] of [["avif", { quality: 52, effort: 6 }], ["webp", { quality: 74 }]]) {
      const out = `${OUT}${name}${tag}-${w}.${fmt}`;
      await pipeline.clone()[fmt](opts).toFile(out);
      entry.files.push(`${name}${tag}-${w}.${fmt} ${Math.round(statSync(out).size / 1024)}KB`);
    }
  };
  let src = graded;
  if (p.band) { const top = Math.round(meta.height * p.band[0]); src = await sharp(graded).extract({ left: 0, top, width: meta.width, height: Math.round(meta.height * p.band[1]) - top }).png().toBuffer(); const m2 = await sharp(src).metadata(); entry.w = m2.width; entry.h = m2.height; }
  const base = sharp(src);
  if (p.wide) {
    for (const w of p.widths) await emit(base.clone().resize(w, Math.round(w / p.wide), { fit: "cover", position: p.pos ?? "centre" }), "-wide", w);
    entry.wide = p.wide;
  } else {
    for (const w of p.widths) await emit(base.clone().resize(w), "", w);
  }
  if (p.tall) {
    const m = await base.clone().metadata();
    const cw = Math.round((m.height * 4) / 5);
    const tallSrc = p.tallX !== undefined ? sharp(await base.clone().extract({ left: Math.round((m.width - cw) * p.tallX), top: 0, width: cw, height: m.height }).png().toBuffer()) : base;
    for (const w of [640, 900]) await emit(tallSrc.clone().resize(w, Math.round((w * 5) / 4), { fit: "cover", position: p.tallPos ?? "centre" }), "-tall", w);
  }
  manifest[name] = entry;
  console.log(name, meta.width + "x" + meta.height, entry.files.join(", "));
}
writeFileSync(`${OUT}manifest.json`, JSON.stringify(manifest, null, 1));

// The Bengaluru contact sheet: Tal-owned portraits from our India site, put through the same grade.
{
  const { readdirSync } = await import("node:fs");
  const PEOPLE = fileURLToPath(new URL("../public/india/people/", import.meta.url));
  mkdirSync(`${OUT}people`, { recursive: true });
  for (const f of readdirSync(PEOPLE).filter((x) => x.endsWith(".png"))) {
    const g = await (await gradedBuffer(`${PEOPLE}${f}`)).png().toBuffer();
    await sharp(g).resize(240, 300, { fit: "cover", position: "attention" }).webp({ quality: 76 }).toFile(`${OUT}people/${f.replace(".png", ".webp")}`);
  }
  console.log("people graded");
}
