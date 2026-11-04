import { site } from "@/content/site";
import { ApplyLink } from "./ApplyLink";
import { HideFrom } from "./Phase";
import { Lockup } from "./SelectNav";

const S = site.select;
const wrap = "mx-auto w-full max-w-[1280px] px-4 sm:px-8";
const label = "font-mono text-[11.5px] tracking-[0.1em] text-muted uppercase";

/** Every section below the fold: a mono index on the left, the content on a 12-column grid. */
function Section({ index, title, id, children }: { index: string; title: string; id: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className={`${wrap}`}>
      <div className="grid gap-6 border-t border-line pt-8 pb-16 sm:pb-24 lg:grid-cols-12 lg:gap-8 lg:pt-10">
        <div className="lg:col-span-3">
          <p className={label}>
            <span className="text-ink">{index}</span> · {title}
          </p>
          <h2 id={`${id}-h`} className="sr-only">
            {title}
          </h2>
        </div>
        <div className="lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}

export function SelectHow() {
  return (
    <Section index="01" title={S.how.heading} id="how">
      <ol className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
        {S.how.steps.map((step, i) => (
          <li key={step.title}>
            <span className="font-mono text-[12px] text-signal tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-3 font-serif text-[25px] leading-[1.12] tracking-[-0.015em] text-ink">{step.title}</h3>
            <p className="mt-2.5 text-[15px] leading-relaxed text-muted">{step.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

export function SelectDeal() {
  return (
    <Section index="02" title={S.deal.heading} id="deal">
      <dl className="grid border-t border-l border-line sm:grid-cols-2">
        {S.deal.items.map((item) => (
          <div key={item.title} className="border-r border-b border-line p-6 sm:p-8">
            <dt className="font-serif text-[26px] leading-tight tracking-[-0.015em] text-ink">{item.title}</dt>
            <dd className="mt-2.5 max-w-[42ch] text-[15px] leading-relaxed text-muted">{item.body}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

export function SelectAbout() {
  return (
    <Section index="03" title={S.about.heading} id="about">
      <p className="max-w-[30ch] font-serif text-[clamp(26px,3.2vw,40px)] leading-[1.22] tracking-[-0.018em] text-ink">{S.about.body}</p>
      <p className="mt-6 max-w-[58ch] text-[16px] leading-relaxed text-muted">{S.about.more}</p>
    </Section>
  );
}

export function SelectFaq() {
  return (
    <Section index="04" title={S.faq.heading} id="faq">
      <div className="border-t border-line">
        {S.faq.items.map(([q, a]) => (
          <details key={q} className="group border-b border-line">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-[17px] text-ink transition-colors hover:text-body [&::-webkit-details-marker]:hidden">
              {q}
              <span aria-hidden="true" className="relative size-3 shrink-0">
                <span className="absolute top-1/2 left-0 h-px w-3 bg-current" />
                <span className="absolute top-0 left-1/2 h-3 w-px bg-current transition-transform duration-300 group-open:scale-y-0" />
              </span>
            </summary>
            <p className="max-w-[62ch] pb-6 text-[15.5px] leading-relaxed text-muted">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

export function SelectFinal() {
  const { heading, sub, cta } = S.final;
  return (
    <section aria-labelledby="final-h" className={`${wrap}`}>
      <div className="border-t border-line pt-16 pb-20 text-center sm:pt-24 sm:pb-28">
        <h2 id="final-h" className="mx-auto max-w-[18ch] font-serif text-[clamp(38px,5.6vw,72px)] leading-[1] tracking-[-0.03em] text-balance text-ink">
          {heading}
        </h2>
        <p className="mt-5 text-[16px] text-balance text-muted">{sub}</p>
        <HideFrom phases={["done"]}>
        <ApplyLink className="mt-9 inline-flex h-12 items-center gap-2 rounded-[10px] bg-ink px-6 text-[15px] font-medium text-paper transition-colors hover:bg-ink-hover">
          {cta}
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M6 11l6-6 6 6" />
          </svg>
        </ApplyLink>
        </HideFrom>
      </div>
    </section>
  );
}

export function SelectFooter() {
  const { privacyUrl, termsUrl, supportEmail, company } = site.legal;
  const { before, amount, after } = site.funding;
  const link = "transition-colors hover:text-ink";
  return (
    <footer className={wrap}>
      <div className="flex flex-col gap-6 border-t border-line py-10 text-[13px] text-muted sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Lockup className="text-[20px]" />
          <p>
            {before} {amount} {after}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-5 gap-y-2">
            <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className={link}>
              Privacy
            </a>
            <a href={termsUrl} target="_blank" rel="noopener noreferrer" className={link}>
              Terms
            </a>
            <a href={`mailto:${supportEmail}`} className={link}>
              {supportEmail}
            </a>
          </nav>
          <p>
            © {new Date().getFullYear()} {company}
          </p>
        </div>
      </div>
    </footer>
  );
}
