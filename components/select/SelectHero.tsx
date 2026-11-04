import { site } from "@/content/site";
import { Apply } from "./Apply";

export function SelectHero() {
  const { eyebrow, headline, sub, chips } = site.select;
  return (
    <section aria-labelledby="hero-heading" className="relative px-4 pt-[calc(min(100vw,520px)*0.431-74px)] pb-8 sm:pb-12 lg:pt-6">
      <div className="mx-auto w-full max-w-[560px]">
        <p className="text-center text-[12px] font-semibold tracking-[0.18em] text-muted uppercase">{eyebrow}</p>
        <h1 id="hero-heading" className="mt-4 text-center font-display text-[38px] leading-[1.06] font-bold tracking-[-0.03em] text-balance text-ink sm:text-[54px]">
          <span className="text-muted">{headline.lead}</span>
          <br />
          {headline.main}{" "}
          <span className="scribble whitespace-nowrap">
            {headline.scribble}
            <svg viewBox="0 0 400 44" aria-hidden="true">
              <path pathLength="1" d="M6 24C120 13 262 11 394 17" />
            </svg>
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-[52ch] text-center text-[16px] leading-relaxed text-body sm:text-[17px]">{sub}</p>
        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {chips.map((c) => (
            <li key={c} className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-muted">{c}</li>
          ))}
        </ul>

        <div className="relative mt-9">
          <div className="select-halo" aria-hidden="true" />
          <div
            id="apply"
            className="rounded-[28px] border border-line bg-surface px-5 pt-7 pb-6 shadow-[0_28px_100px_#00000059,inset_0_1px_#ffffff08] transition-[border-color,box-shadow] duration-300 data-[dragging=true]:border-white/60 sm:px-8 sm:pt-8 sm:pb-8"
          >
            <Apply />
          </div>
        </div>
      </div>
    </section>
  );
}
