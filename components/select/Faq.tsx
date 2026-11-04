import { site } from "@/content/site";
import { Container } from "../ui";

export function Faq() {
  const { heading, items } = site.select.faq;
  return (
    <section id="faq" aria-labelledby="faq-heading" className="py-12 sm:py-16">
      <Container className="max-w-3xl">
        <h2 id="faq-heading" className="font-display text-[30px] font-bold tracking-[-0.025em] text-ink sm:text-[36px]">{heading}</h2>
        <div className="mt-6 divide-y divide-line overflow-hidden rounded-[22px] border border-line bg-surface">
          {items.map(([q, a]) => (
            <details key={q} className="group px-6 py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                {q}
                <span aria-hidden="true" className="text-xl leading-none text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
