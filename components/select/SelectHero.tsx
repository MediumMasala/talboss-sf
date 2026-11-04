import { site } from "@/content/site";
import { Apply } from "./Apply";
import { HideFrom, YouLine } from "./Phase";
import { claimNumber } from "./network-store";
import { NetworkField } from "./NetworkField";
import { FundingLine, SelectNav } from "./SelectNav";

/**
 * The first screen: the network field behind everything, the promise on the left, the form on the right.
 * The empty-looking stretch under the headline is deliberate: it's where the visitor's own point lives.
 */
export function SelectHero() {
  const { eyebrow, title, sub, note } = site.select.hero;
  return (
    <div className="hero relative isolate overflow-hidden lg:min-h-[max(760px,100svh)]">
      {/* Fixed to the first screen's height, so a taller card never resizes (and reshuffles) the field. */}
      <div className="field-host pointer-events-none absolute inset-x-0 top-0 -z-10 h-[max(760px,100svh)]">
        <NetworkField people={claimNumber(site.claims.network)} startups={claimNumber(site.claims.startups)} />
      </div>
      <SelectNav />
      <main>
        <section
          aria-labelledby="hero-heading"
          className="mx-auto grid w-full max-w-[1280px] grid-cols-1 gap-8 px-4 pt-6 pb-12 sm:px-8 sm:pt-14 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-16 lg:pt-[6vh] lg:pb-20 xl:grid-cols-[minmax(0,1fr)_460px]"
        >
          <div className="flex flex-col lg:h-[clamp(600px,calc(100svh-150px),720px)] lg:self-start">
            <div data-field-avoid className="max-w-[640px]">
              <p className="font-mono text-[11.5px] tracking-[0.1em] text-muted uppercase">{eyebrow}</p>
              <h1
                id="hero-heading"
                className="mt-3 font-serif text-[clamp(42px,7.4vw,96px)] sm:mt-5 leading-[0.96] tracking-[-0.03em] text-balance text-ink"
              >
                <span className="block text-muted italic">{title[0]}</span>
                <span className="block">{title[1]}</span>
              </h1>
              <p className="mt-4 max-w-[46ch] text-[16px] leading-[1.5] text-body sm:mt-6 sm:text-[18px] sm:leading-[1.55]">{sub}</p>
              <FundingLine className="mt-3 sm:hidden" />
            </div>

            {/* The visitor's place in the network. The canvas draws "you" at this anchor, with the key right under it. */}
            <div className="relative h-[146px] lg:mt-auto lg:h-[200px]">
              <span data-field-you className="absolute top-[18px] left-[14px] size-px lg:top-[34%] lg:left-[16%]" aria-hidden="true" />
              <YouLine className="absolute bottom-0 left-0 w-full max-w-[420px] lg:bottom-auto lg:left-[calc(16%-14px)] lg:top-[calc(34%+24px)]" />
            </div>
          </div>

          <div className="lg:pt-2">
            <Apply />
            <HideFrom phases={["pitch", "resume", "noResume", "sending", "done"]}>
              <p data-field-avoid className="mt-4 px-1 text-center text-[13px] leading-relaxed text-muted lg:text-left">
                {note}
              </p>
            </HideFrom>
          </div>
        </section>
      </main>
    </div>
  );
}
