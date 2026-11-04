import type { CSSProperties } from "react";
import { site } from "@/content/site";

/** Equal-area sizing inside the tile: square marks ~39px, wide wordmarks up to 66px wide (as on the live site). */
function markSize(ratio: number) {
  let w = Math.sqrt(1500 * ratio);
  let h = Math.sqrt(1500 / ratio);
  if (w > 66) [w, h] = [66, 66 / ratio];
  if (h > 42) [w, h] = [42 * ratio, 42];
  return { w: Math.round(w), h: Math.round(h) };
}

/** Real logos of Bay Area companies whose bosses are hiring on Tal Boss. White by default, brand colour on hover. */
export function BrandMarquee() {
  const { line, brands } = site.proof;

  const row = (copy: boolean) => (
    <ul aria-hidden={copy || undefined} className="flex shrink-0 gap-3 pr-3">
      {brands.map(([name, file, hex, ratio]) => {
        const { w, h } = markSize(ratio);
        const style = { "--logo": `url(/brands/${file})`, "--brand": `#${hex}`, "--w": `${w}px`, "--h": `${h}px` } as CSSProperties;
        return (
          <li key={name} className="brand-tile" style={style}>
            <span className="sr-only">{name}</span>
            <i aria-hidden="true" />
          </li>
        );
      })}
    </ul>
  );

  return (
    <section aria-label={line} className="pt-2 pb-4">
      <p className="px-4 text-center text-[13px] text-muted">{line}</p>
      <div className="marquee-mask mt-4 overflow-hidden">
        <div className="animate-marquee flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </section>
  );
}
