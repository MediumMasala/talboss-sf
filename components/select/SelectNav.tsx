import { site } from "@/content/site";
import { HideFrom } from "./Phase";

/** "tal" in the interface face, "Select" in the voice face: the agency inside the network. */
export function Lockup({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline gap-[0.18em] text-ink ${className}`}>
      <span className="font-sans text-[1em] font-semibold tracking-[-0.045em]">tal</span>
      <span className="font-serif text-[1.02em] italic tracking-[-0.01em]">Select</span>
    </span>
  );
}

/** Phones: the same funding line, verbatim, as one quiet line under the hero sub. */
export function FundingLine({ className = "" }: { className?: string }) {
  const { before, amount, after } = site.funding;
  return (
    <p className={`text-[clamp(10.5px,2.95vw,12px)] whitespace-nowrap text-muted ${className}`}>
      {before} <span className="font-medium text-ink">{amount}</span> {after}
    </p>
  );
}

export function SelectNav() {
  const { before, amount, after } = site.funding;
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-[1280px] items-center justify-between gap-4 px-4 pt-4 sm:px-8 sm:pt-6">
      <a href="/" data-field-avoid className="rounded-md text-[22px] leading-none sm:text-[24px]" aria-label="Tal Select home">
        <Lockup />
      </a>
      <div data-field-avoid className="flex items-center gap-5">
        <p className="hidden text-right text-[13px] leading-tight text-muted sm:block">
          {before} <span className="font-medium text-ink">{amount}</span> {after}
        </p>
        <HideFrom phases={["done"]}>
        <a
          href="#apply"
          className="hidden h-9 items-center rounded-[9px] border border-line-strong px-3.5 text-[13.5px] font-medium text-ink transition-colors hover:border-ink lg:inline-flex"
        >
          {site.select.final.cta}
        </a>
        </HideFrom>
      </div>
    </header>
  );
}
