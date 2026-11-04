import { site } from "@/content/site";
import { Container } from "./ui";

export function HowItWorks() {
  const { heading, steps } = site.howItWorks;
  return (
    <section aria-labelledby="how-heading" className="pt-10 pb-20 sm:pt-14 sm:pb-28">
      <Container className="max-w-[550px]">
        <h2 id="how-heading" className="font-display text-[28px] font-bold tracking-[-0.02em] text-ink">
          {heading}
        </h2>
        <ol className="mt-5 space-y-3">
          {steps.map((step, i) => (
            <li key={step.title} className="flex items-center gap-4 rounded-[20px] border border-line bg-surface p-5">
              <span aria-hidden="true" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">
                {i + 1}
              </span>
              <span className="font-semibold text-ink">{step.title}</span>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
