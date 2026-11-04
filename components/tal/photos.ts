/**
 * Every photograph on the page, graded at build time by scripts/grade-photos.mjs (one grade, baked in).
 * Credits come from docs/team/ASSETS.md; every photographer is named in the end credits.
 */
export type PhotoKey = "window" | "sfFog" | "notebook" | "fogWalk" | "lamp" | "cubbon" | "hill";

type Variant = { base: string; widths: number[]; w: number; h: number };
export type PhotoDef = { alt: string; author: string; source: "Unsplash"; url: string; variants: Variant[]; tall?: Variant };

const wide = (base: string, widths: number[]): Variant => ({ base: `${base}-wide`, widths, w: 2390, h: 1000 });

export const PHOTOS: Record<PhotoKey, PhotoDef> = {
  window: {
    alt: "Someone standing at a window in the last of the daylight, curtains drawn back, face turned away.",
    author: "Wesley Mc Lachlan",
    source: "Unsplash",
    url: "https://unsplash.com/photos/UkhecUKFfd0",
    variants: [wide("window", [1280, 1920, 2560])],
    tall: { base: "window-tall", widths: [640, 900], w: 4, h: 5 },
  },
  sfFog: {
    alt: "San Francisco at sunrise, the towers standing out of a bank of fog.",
    author: "Zetong Li",
    source: "Unsplash",
    url: "https://unsplash.com/photos/mn89fXEo310",
    variants: [wide("sf-fog", [1280, 1920, 2560])],
    tall: { base: "sf-fog-tall", widths: [640, 900], w: 4, h: 5 },
  },
  notebook: {
    alt: "An open notebook, a pen and a mug of black coffee in window light.",
    author: "Brandon Cormier",
    source: "Unsplash",
    url: "https://unsplash.com/photos/Hy4eZgKCcXI",
    variants: [{ base: "notebook", widths: [720, 1200], w: 2600, h: 2262 }],
  },
  fogWalk: {
    alt: "Two people walking side by side across a bridge in thick fog.",
    author: "Tatiana Reusche",
    source: "Unsplash",
    url: "https://unsplash.com/photos/3r0gAuih0tY",
    variants: [{ base: "fog-walk", widths: [720, 1200], w: 2600, h: 1727 }],
  },
  lamp: {
    alt: "A table by a window at night, one lamp on, the street lights through the leaves.",
    author: "Amin Zabardast",
    source: "Unsplash",
    url: "https://unsplash.com/photos/UAMLs1jkhHY",
    variants: [{ base: "lamp", widths: [720, 1200], w: 2600, h: 1683 }],
  },
  cubbon: {
    alt: "A wide old rain tree over a lawn in Cubbon Park, Bengaluru.",
    author: "Nithin Purple",
    source: "Unsplash",
    url: "https://unsplash.com/photos/nuIpe_EumH4",
    variants: [{ base: "cubbon", widths: [720, 1200], w: 2600, h: 1736 }],
  },
  hill: {
    alt: "Hills at golden hour, light falling through the haze.",
    author: "Casey Horner",
    source: "Unsplash",
    url: "https://unsplash.com/photos/OopzSWabsWE",
    variants: [wide("hill", [1280, 1920])],
  },
};

/** One line per photographer, in page order, for the end credits. */
export const CREDIT_ORDER: PhotoKey[] = ["window", "notebook", "fogWalk", "lamp", "cubbon", "sfFog", "hill"];

export const srcset = (v: Variant, fmt: "avif" | "webp") => v.widths.map((w) => `/photos/${v.base}-${w}.${fmt} ${w}w`).join(", ");
export const fallback = (v: Variant) => `/photos/${v.base}-${v.widths[v.widths.length - 1]}.webp`;
