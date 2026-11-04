import { site } from "@/content/site";
import { Container } from "../ui";

export function SelectHow() {
  const { heading, steps } = site.select.how;
  return (
    <section id="how" aria-labelledby="how-heading" className="py-12 sm:py-16">
      <Container className="max-w-5xl">
        <h2 id="how-heading" className="font-display text-[30px] font-bold tracking-[-0.025em] text-ink sm:text-[36px]">{heading}</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="rounded-[22px] border border-line bg-surface p-6">
              <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-full bg-white text-sm font-semibold text-black">{i + 1}</span>
              <p className="mt-5 font-semibold text-ink">{step.title}</p>
              <p className="mt-1.5 text-[14px] leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
