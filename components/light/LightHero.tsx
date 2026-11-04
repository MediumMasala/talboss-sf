import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { ResumeDrop } from "../resume-drop";

/** Colour, tilt and (on computers) where each sticker sits around the headline, in the order of site.light.stickers. */
const STICKERS: { color: string; tilt: number; at: Record<string, string> }[] = [
  { color: "blue", tilt: 5, at: { "--r": "4%", "--t": "-16px" } },
  { color: "pink", tilt: -6, at: { "--l": "2%", "--t": "-30px" } },
  { color: "green", tilt: -5, at: { "--r": "6%", "--t": "300px" } },
];

export function LightHero() {
  const { headline } = site.hero;
  const { before, amount, after } = site.funding;
  return (
    <section aria-labelledby="hero-heading" className="px-4 pt-10 text-center sm:pt-16">
      <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[13px] text-body shadow-[0_1px_2px_#0000000a]">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-[#e5482a]" />
        <span>
          {before} <b className="font-semibold text-ink">{amount}</b> {after}
        </span>
      </p>

      <div id="upload" data-drop-target className="relative mx-auto mt-8 max-w-[920px] sm:mt-12">
        {/* Phones: a row above the headline. Computers: scattered around it. */}
        <ul aria-hidden="true" className="mb-6 flex flex-wrap justify-center gap-2 lg:mb-0">
          {site.light.stickers.map((text, i) => {
            const s = STICKERS[i % STICKERS.length];
            const style = { "--tilt": `${s.tilt}deg`, "--delay": `${0.5 + i * 0.12}s`, ...s.at } as CSSProperties;
            return (
              <li key={text} className={`sticker sticker-${s.color} sticker-float mono`} style={style}>
                {text}
              </li>
            );
          })}
        </ul>

        <h1
          id="hero-heading"
          className="font-display text-[length:min(44px,calc((100vw_-_32px)/9.2))] leading-[1.04] font-semibold tracking-[-0.035em] text-balance text-ink sm:text-[60px] lg:text-[72px]"
        >
          {headline.lead}
          <br />
          {headline.main}
          {/* Tablets and up: the underlined number starts its own line. */}
          <br className="hidden sm:inline" />{" "}
          <span className="scribble">
            {headline.scribble}
            <svg viewBox="0 0 400 44" aria-hidden="true">
              <path pathLength="1" d="M6 24C120 13 262 11 394 17" />
            </svg>
          </span>{" "}
          {headline.tail}
        </h1>

        <p className="mx-auto mt-4 max-w-[440px] text-[17px] leading-snug text-muted text-balance sm:mt-5 sm:text-[19px]">
          {site.light.sub}
        </p>

        <div className="mx-auto mt-8 max-w-[400px] sm:mt-10">
          <ResumeDrop id="hero" hint={site.light.hint} consent={false} />
        </div>
      </div>
    </section>
  );
}
