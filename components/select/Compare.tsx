import { site } from "@/content/site";
import { Container } from "../ui";

export function Compare() {
  const { heading, cols, rows } = site.select.compare;
  return (
    <section aria-labelledby="compare-heading" className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <h2 id="compare-heading" className="font-display text-[30px] font-bold tracking-[-0.025em] text-ink sm:text-[36px]">{heading}</h2>
        <div className="mt-6 overflow-hidden rounded-[22px] border border-line">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] bg-surface-sunk px-5 py-3 text-[12px] font-semibold tracking-[0.08em] text-muted uppercase sm:px-6">
            <span />
            <span>{cols[0]}</span>
            <span className="text-ink">{cols[1]}</span>
          </div>
          {rows.map(([q, alone, select]) => (
            <div key={q} className="grid grid-cols-[1.1fr_1fr_1fr] gap-3 border-t border-line bg-surface px-5 py-4 text-[14px] sm:px-6 sm:text-[15px]">
              <span className="text-muted">{q}</span>
              <span className="text-[#8e8e93] line-through decoration-[#8e8e93]/40">{alone}</span>
              <span className="font-medium text-ink">{select}</span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
