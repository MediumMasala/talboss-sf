import { site } from "@/content/site";
import { Container } from "../ui";

export function FinalCta() {
  const { heading, cta } = site.select.final;
  return (
    <section aria-labelledby="final-heading" className="pt-8 pb-20 sm:pb-28">
      <Container className="max-w-3xl">
        <div className="rounded-[28px] border border-line bg-[radial-gradient(120%_120%_at_50%_0%,#2c2c2e_0%,#1c1c1e_45%,#111113_100%)] px-6 py-12 text-center sm:px-12">
          <h2 id="final-heading" className="mx-auto max-w-[22ch] font-display text-[30px] leading-[1.1] font-bold tracking-[-0.025em] text-balance text-ink sm:text-[40px]">
            {heading}
          </h2>
          <a href="#apply" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-medium text-black transition-colors hover:bg-hover">
            {cta}
          </a>
        </div>
      </Container>
    </section>
  );
}
