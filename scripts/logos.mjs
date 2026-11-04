// Fetches the six full-wordmark SVGs for the logo marquee from Wikimedia Commons (public-domain text logos),
// strips their colours to white, cuts knockouts (LinkedIn's "in") out as real transparency, crops each to its
// ink and normalises it to a 24-px-high viewBox. Writes public/logos/<name>.svg. Sources + licences: docs/team/ASSETS.md.
// Run: node scripts/logos.mjs   (sharp is already in node_modules via next; needs network)
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const UA = "TalSiteAssets/1.0 (logo marquee build; contact tr.sanchit@gmail.com)";
const C = "https://upload.wikimedia.org/wikipedia/commons";

/** name → Commons original. `lettering`: keep only the originally-white paths (Salesforce's word, without the cloud). */
const LOGOS = [
  { name: "google", url: `${C}/2/2f/Google_2015_logo.svg` },
  { name: "microsoft", url: `${C}/9/96/Microsoft_logo_%282012%29.svg` },
  { name: "salesforce", url: `${C}/f/f9/Salesforce.com_logo.svg`, lettering: true },
  { name: "adobe", url: `${C}/6/6e/Adobe_Corporate_logo.svg` },
  { name: "linkedin", url: `${C}/0/01/LinkedIn_Logo.svg`, knockout: true },
  { name: "paypal", url: `${C}/3/39/PayPal_logo.svg` },
];

const WHITE = /^#(fff|ffffff|fffffe)$/i;
const fillOf = (el) => (el.match(/\bfill="([^"]+)"/) || el.match(/fill:\s*(#[0-9a-f]{3,6})/i) || [])[1];
const setFill = (el, c) =>
  el.replace(/\bfill="[^"]*"/g, `fill="${c}"`).replace(/fill:\s*#[0-9a-f]{3,6}/gi, `fill:${c}`);
const SHAPE = /<(path|polygon|rect)\b[^>]*?\/>/g;

function clean(svg, { lettering, knockout }) {
  svg = svg
    .replace(/<\?xml[^>]*\?>/g, "")
    .replace(/<!DOCTYPE[^>]*>/g, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<metadata[\s\S]*?<\/metadata>/g, "")
    .replace(/<sodipodi:namedview[\s\S]*?\/>/g, "")
    .replace(/<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g, "")
    .trim();
  if (lettering) {
    // drop every coloured shape (the cloud); the white lettering stays
    svg = svg.replace(SHAPE, (el) => (WHITE.test(fillOf(el) || "") ? el : ""));
    svg = svg.replace(/\smask="url\(#b\)"/g, "");
  }
  if (knockout) {
    // white shapes become holes in the coloured shape they sit on (same parent group, same user space)
    const holes = [];
    svg = svg.replace(SHAPE, (el) => {
      if (WHITE.test(fillOf(el) || "")) { holes.push(setFill(el, "#000").replace(/^<(\w+)/, "<$1 data-hole=\"\"")); return ""; }
      return el;
    });
    let first = true;
    svg = svg.replace(SHAPE, (el) => {
      if (!first) return el;
      first = false; // the box is the first shape in the group
      const mask = `<mask id="knock" maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000"><rect x="-10000" y="-10000" width="20000" height="20000" fill="#fff"/>${holes.join("")}</mask>`;
      return mask + el.replace(/\/>$/, ' mask="url(#knock)"/>');
    });
  }
  // every remaining colour → white (root fill attribute included); gradients are not used by these files
  svg = svg.replace(/<(path|polygon|rect|g|svg)\b[^>]*>/g, (el) =>
    el.startsWith("<rect x=\"-10000\"") || el.includes("data-hole") ? el : setFill(el, "#fff"));
  return svg;
}

function rootBox(svg) {
  const root = svg.match(/<svg\b[^>]*>/)[0];
  const vb = root.match(/viewBox="([^"]+)"/);
  if (vb) return vb[1].trim().split(/[\s,]+/).map(Number);
  const w = parseFloat(root.match(/\bwidth="([\d.]+)/)[1]);
  const h = parseFloat(root.match(/\bheight="([\d.]+)/)[1]);
  return [0, 0, w, h];
}

function setRoot(svg, vb, w, h) {
  return svg.replace(/<svg\b[^>]*>/, (root) => {
    root = root
      .replace(/\s(viewBox|width|height|x|y|enable-background|preserveAspectRatio|xml:space|id|version|sodipodi:docname|inkscape:version)="[^"]*"/g, "")
      .replace(/\sfill="[^"]*"/, "");
    return root.replace(/^<svg/, `<svg viewBox="${vb.join(" ")}" width="${w}" height="${h}" fill="#fff"`);
  });
}

const r = (n) => Math.round(n * 1000) / 1000;

for (const logo of LOGOS) {
  const res = await fetch(logo.url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`${logo.name}: HTTP ${res.status}`);
  let svg = clean(await res.text(), logo);

  // crop to the ink: render at a known scale, read the alpha bounds, map back to user units
  const [vx, vy, vw, vh] = rootBox(svg);
  const k = 2400 / vh;
  const probe = setRoot(svg, [vx, vy, vw, vh], r(vw * k), r(vh * k));
  const { data, info } = await sharp(Buffer.from(probe)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3] > 8) {
        if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
  const bx = vx + x0 / k, by = vy + y0 / k, bw = (x1 + 1 - x0) / k, bh = (y1 + 1 - y0) / k;
  const H = 24, W = r((H * bw) / bh);
  const out = setRoot(svg, [r(bx), r(by), r(bw), r(bh)], W, H).replace(/\n\s*\n/g, "\n");
  writeFileSync(`public/logos/${logo.name}.svg`, out + "\n");
  console.log("ok", logo.name, W, H);
}
