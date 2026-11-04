import { site } from "@/content/site";
import { ResumeDrop } from "./resume-drop";

export function Hero() {
  const { headline, trust } = site.hero;
  return (
    <section aria-labelledby="hero-heading" className="px-4 pt-[calc(min(100vw,520px)*0.431-74px)] pb-6 sm:pb-8 lg:pt-8">
      <div
        id="upload"
        data-drop-target
        className="mx-auto w-full max-w-[550px] rounded-3xl border border-line bg-surface transition-[border-color,box-shadow] duration-300 data-[dragging=true]:border-white/60 data-[dragging=true]:shadow-[0_0_0_4px_#ffffff14,0_28px_100px_#00000045] px-5 pt-7 pb-6 shadow-[0_28px_100px_#00000045,inset_0_1px_#ffffff05] sm:px-8 sm:pt-9 sm:pb-8"
      >
        <h1 id="hero-heading" className="font-display text-[34px] leading-[1.12] font-bold tracking-[-0.025em] text-ink sm:text-[44px]">
          <span className="text-muted">{headline.lead}</span>
          <br />
          {headline.main}{" "}
          <span className="scribble">
            {headline.scribble}
            <svg viewBox="0 0 400 44" aria-hidden="true">
              <path pathLength="1" d="M6 24C120 13 262 11 394 17" />
            </svg>
          </span>{" "}
          {headline.tail}
        </h1>

        <div className="mt-8">
          <ResumeDrop id="hero" />
        </div>
      </div>

      <p className="mt-5 text-center text-[13px] text-muted text-balance">{trust}</p>
    </section>
  );
}
