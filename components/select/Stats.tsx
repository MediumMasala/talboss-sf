import { site } from "@/content/site";
import { Container } from "../ui";

export function Stats() {
  return (
    <section aria-label="Tal Select in numbers" className="py-10 sm:py-14">
      <Container className="max-w-5xl">
        <dl className="grid gap-3 sm:grid-cols-3">
          {site.select.stats.map((s) => (
            <div key={s.label} className="rounded-[22px] border border-line bg-surface px-6 py-6">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-[40px] leading-none font-bold tracking-[-0.03em] text-ink tabular-nums">{s.value}</dd>
              <dd className="mt-2 text-[14px] leading-snug text-muted">{s.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
