import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties } from "react";
import { LOGOS } from "./Marquee";

/**
 * The hero's landmark layer (FEEDBACK_V4_2 §9, v4.2). Over the round-5 valley still, the verified companies sit as tiny
 * silver wordmarks at the lit landmark nearest their real town: a soft light on the landmark and the marks beside it.
 * They light up one by one over the first ~4 s (SF first, then down the peninsula), then idle with a faint pulse.
 * Reduced motion: no animation, all lit. CSS only (no JS), so it runs before hydration like the hero entrance.
 *
 * Positions: docs/team/art/round5/hubs.json (fractions of the source still, per crop). Each crop gets a box with the
 * still's aspect ratio that covers the hero exactly like the img's `object-cover` (centred), so a fraction of the
 * box is a fraction of the picture. The box also carries `.hero-img`, so it scales with the still's entrance.
 * Which company sits where is the founder's list (one place each), not hubs.json's.
 */

type Hub = { x: number; y: number };
type Crop = "16x9" | "4x5";

/** Founder's list. `side` = where the marks sit relative to their light (r / l: a column beside it; b: a row under it,
 *  dimmer; bl: that row ending under the light; rd: the column starting below-right of it). Phones drop San Jose: on the 4:5 crop it sits inside the wordmark's lower edge. */
const PLACES: { hub: string; companies: string[]; side: Record<Crop, "r" | "rd" | "l" | "b" | "bl" | null> }[] = [
  // Desktop: below-right of its light, which sits at the end of the sub line's first row (≤ 1590 px wide).
  { hub: "sf", companies: ["salesforce", "uber", "microsoft"], side: { "16x9": "rd", "4x5": "r" } },
  { hub: "mountain_view", companies: ["google", "intuit"], side: { "16x9": "r", "4x5": "r" } },
  // Phones: under its light and out over the water, since beside it the marks would touch the wordmark's baseline.
  { hub: "sunnyvale", companies: ["linkedin", "amazon"], side: { "16x9": "l", "4x5": "bl" } },
  { hub: "san_jose", companies: ["adobe", "paypal"], side: { "16x9": "b", "4x5": null } },
];

const START = 0.6; // s, once the still has mostly settled
const STEP = 0.32; // s between marks: the ninth starts at 3.2 s and is lit by ~4.2 s

function hubs(): Record<Crop, Record<string, Hub>> | null {
  try {
    const raw = JSON.parse(readFileSync(join(process.cwd(), "docs/team/art/round5/hubs.json"), "utf8"));
    return raw?.hubs?.["16x9"] && raw?.hubs?.["4x5"] ? raw.hubs : null;
  } catch {
    return null;
  }
}

const size = (file: string) => LOGOS.find(([f]) => f === file);

function Layer({ crop, at }: { crop: Crop; at: Record<string, Hub> }) {
  let n = 0;
  const h = crop === "16x9" ? 13 : 12;
  return (
    <div aria-hidden className={`lm-box ${crop === "16x9" ? "lm-wide" : "lm-tall"}`}>
      {PLACES.map(({ hub, companies, side }) => {
        const p = at[hub];
        const s = side[crop];
        if (!p || !s) return null;
        const first = n;
        const marks = companies.map((c) => {
          const sz = size(c);
          const d = START + STEP * n++;
          return sz ? (
            <span
              key={c}
              className="lm-mark"
              style={{ width: (sz[2] / sz[3]) * h, height: h, ["--d" as string]: `${d}s`, ["--src" as string]: `url(/logos/${c}.svg)` } as CSSProperties}
            />
          ) : null;
        });
        return (
          <div key={hub} className="absolute" style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>
            <span className="lm-light" style={{ ["--d" as string]: `${START + STEP * first}s` } as CSSProperties} />
            <div className={`lm-marks lm-${s}`} style={{ ["--d" as string]: `${START + STEP * first}s` } as CSSProperties}>
              {marks}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Landmarks() {
  const all = hubs();
  if (!all) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden md:h-full">
      <div className="hero-img absolute inset-0 [container-type:size]">
        <div className="md:hidden">
          <Layer crop="4x5" at={all["4x5"]} />
        </div>
        <div className="hidden md:block">
          <Layer crop="16x9" at={all["16x9"]} />
        </div>
      </div>
      <style>{`
        .lm-box { position: absolute; left: 50%; top: 50%; translate: -50% -50%; }
        .lm-wide { width: max(100cqw, calc(100cqh * 16 / 9)); aspect-ratio: 16 / 9; }
        .lm-tall { width: max(100cqw, calc(100cqh * 4 / 5)); aspect-ratio: 4 / 5; }
        .lm-light {
          position: absolute; left: -9px; top: -9px; width: 18px; height: 18px; border-radius: 50%;
          background: radial-gradient(closest-side, rgba(255,255,255,.75), rgba(255,255,255,.22) 45%, rgba(255,255,255,0));
          animation: lm-on 1.2s var(--ease-out) var(--d) both, lm-breathe 5.6s ease-in-out calc(var(--d) + 1.2s) infinite;
        }
        /* The marks sit a short hairline away from their light, like a label on a map, with a soft dark halo so they
           read over the lit city. */
        .lm-marks { position: absolute; display: flex; gap: 6px; filter: drop-shadow(0 0 3px rgba(0,0,0,.85)) drop-shadow(0 0 10px rgba(0,0,0,.6)); }
        .lm-marks::before { content: ""; position: absolute; background: rgba(255,255,255,.28); animation: lm-on 1s var(--ease-out) var(--d) both; }
        .lm-r { left: 24px; top: 0; translate: 0 -50%; flex-direction: column; align-items: flex-start; }
        .lm-r::before { right: calc(100% + 4px); top: 50%; width: 14px; height: 1px; }
        .lm-rd { left: 14px; top: 14px; flex-direction: column; align-items: flex-start; }
        .lm-rd::before { right: 100%; bottom: 100%; width: 1px; height: 1px; }
        .lm-l { right: 24px; top: 0; translate: 0 -50%; flex-direction: column; align-items: flex-end; }
        .lm-l::before { left: calc(100% + 4px); top: 50%; width: 14px; height: 1px; }
        .lm-b { left: 0; top: 40px; translate: -50% 0; flex-direction: row; align-items: center; gap: 10px; }
        .lm-b::before { left: 50%; bottom: calc(100% + 4px); width: 1px; height: 26px; }
        .lm-bl { right: -4px; top: 40px; flex-direction: row; align-items: center; gap: 10px; }
        .lm-bl::before { right: 4px; bottom: calc(100% + 4px); width: 1px; height: 26px; }
        .lm-mark {
          display: block; flex: none;
          background: linear-gradient(180deg, #fff, #dbdbdb 45%, #9a9a9a);
          -webkit-mask: var(--src) center / contain no-repeat; mask: var(--src) center / contain no-repeat;
          opacity: .62;
          animation: lm-on 1s var(--ease-out) var(--d) both, lm-pulse 6s ease-in-out calc(var(--d) + 1s) infinite;
        }
        .lm-b .lm-mark, .lm-bl .lm-mark { opacity: .5; }
        @keyframes lm-on { from { opacity: 0; transform: translateY(3px); filter: blur(3px); } }
        @keyframes lm-pulse { 50% { opacity: .42; } }
        .lm-b .lm-mark, .lm-bl .lm-mark { animation-name: lm-on, lm-pulse-soft; }
        @keyframes lm-pulse-soft { 50% { opacity: .3; } }
        @keyframes lm-breathe { 50% { opacity: .55; transform: scale(.8); } }
        @media (prefers-reduced-motion: reduce) { .lm-light, .lm-mark, .lm-marks::before { animation: none !important; } }
      `}</style>
    </div>
  );
}
