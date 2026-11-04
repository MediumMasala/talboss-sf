/* eslint-disable @next/next/no-img-element -- small Tal-owned portraits and monochrome marks */
import { site } from "@/content/site";
import { AskButton } from "./Controls";
import { Photo } from "./Photo";
import { CREDIT_ORDER, PHOTOS, type PhotoKey } from "./photos";
import { Reveal, SampleGate, TermsDate } from "./Reveal";

const S = site.select;

/* ------------------------------------------------------------ top bar */
export function TopBar() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-6 px-4 pt-4 sm:px-8 sm:pt-6 lg:px-14">
      <a href="/" aria-label={S.topBar.wordmarkLabel} className="t-display pointer-events-auto text-[38px] leading-none text-linen sm:text-[44px]">
        {S.topBar.wordmark}
      </a>
      <p className="max-w-[230px] pt-1.5 text-right text-[12px] leading-[1.45] text-linen/85 sm:max-w-none sm:pt-3 sm:text-[13px]">{site.funding.line}</p>
    </header>
  );
}

/* ------------------------------------------------------ 7. what an agent does */
const PAIRS: { k: PhotoKey; photo: string; text: string; ratio: string }[] = [
  { k: "notebook", photo: "lg:col-span-7", text: "lg:col-start-9 lg:col-span-4 lg:self-end lg:pb-6", ratio: "aspect-[1.15/1]" },
  { k: "fogWalk", photo: "lg:col-start-6 lg:col-span-6 lg:row-start-1", text: "lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:self-center", ratio: "aspect-[3/2]" },
  { k: "lamp", photo: "lg:col-start-1 lg:col-span-8", text: "lg:col-start-9 lg:col-span-4 lg:self-start lg:pt-10", ratio: "aspect-[1.55/1]" },
];

export function AgentPairs() {
  return (
    <section aria-labelledby="agent-label" className="px-4 pt-24 pb-10 sm:px-8 sm:pt-32 lg:px-14">
      <p id="agent-label" className="t-mono mb-12 text-linen/60 sm:mb-16">
        {S.agent.label}
      </p>
      <div className="space-y-20 sm:space-y-28">
        {PAIRS.map((p, i) => (
          <Reveal key={p.k} className="grid gap-6 lg:grid-cols-12 lg:gap-x-8">
            <div className={p.photo}>
              <Photo k={p.k} warm sizes="(min-width: 1024px) 60vw, 100vw" className={`${p.ratio} rounded-[2px]`} />
            </div>
            <div className={p.text}>
              <p className="t-mono mb-4 text-linen/45">0{i + 1}</p>
              <p className="t-display text-[23px] leading-[1.42] tracking-[-0.01em] text-linen sm:text-[26px]">{S.agent.paragraphs[i]}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------- 8. sample letter */
export function SampleLetter() {
  const x = S.sample;
  const row = "grid grid-cols-[76px_1fr] items-baseline gap-3 py-1.5";
  return (
    <SampleGate>
      <section aria-label={x.label} className="px-4 py-24 sm:px-8 sm:py-32">
        <Reveal className="mx-auto max-w-[640px]">
          <p className="t-mono mb-5 text-center text-linen/60">{x.label}</p>
          <article className="paper rounded-[2px] px-6 pt-7 pb-8 sm:px-12 sm:pt-10 sm:pb-12">
            <dl className="border-b border-ink/15 pb-5 text-[15px]">
              <div className={row}>
                <dt className="t-mono text-ink-2">{S.apply.email.toLabel}</dt>
                <dd className="text-ink">{x.to}</dd>
              </div>
              <div className={row}>
                <dt className="t-mono text-ink-2">{S.apply.email.fromLabel}</dt>
                <dd className="text-ink">{x.from}</dd>
              </div>
              <div className={row}>
                <dt className="t-mono text-ink-2">{S.apply.email.subjectLabel}</dt>
                <dd className="font-medium text-ink">{x.subject}</dd>
              </div>
            </dl>
            <p className="t-display mt-7 text-[22px] leading-[1.5] text-ink sm:text-[25px]">{x.body.join(" ")}</p>
            <p className="t-name mt-8 text-[24px] text-ink">{x.signature}</p>
          </article>
        </Reveal>
      </section>
    </SampleGate>
  );
}

/* ------------------------------------------------------- 9. where we come from */
const PEOPLE = ["aman", "ananya", "aryan", "isha", "rohan", "sanchit", "souvik", "sunny-shah"];

/** Verified by the founder (4 Nov 2026): bosses from these companies have accounts on Tal. Rendered as monochrome masks. */
const MARKS: [name: string, file: string, ratio: number][] = [
  ["Google", "/brands/google.svg", 0.97],
  ["Microsoft", "/india/companies/microsoft.svg", 1],
  ["Amazon", "/india/companies/amazon.svg", 2.99],
  ["Uber", "/brands/uber.svg", 2.98],
  ["Salesforce", "/brands/salesforce.svg", 1.43],
  ["Adobe", "/brands/adobe.svg", 1.13],
  ["LinkedIn", "/brands/linkedin.svg", 1],
  ["PayPal", "/brands/paypal.svg", 0.81],
  ["Intuit", "/brands/intuit.svg", 4.97],
  ["Spotify", "/india/companies/spotify.svg", 3.33],
  ["Razorpay", "/india/companies/razorpay.svg", 4.73],
  ["Sarvam", "/india/misc/sarvam.svg", 6.31],
];

export function Origin() {
  const o = S.origin;
  const credit = (k: PhotoKey) => S.credits.photo(PHOTOS[k].author, PHOTOS[k].source);
  return (
    <section aria-labelledby="origin-h" className="bg-forest-2 px-4 pt-24 pb-24 sm:px-8 sm:pt-32 lg:px-14">
      <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
        <Reveal className="lg:col-span-6">
          <h2 id="origin-h" className="t-display text-[52px] leading-[0.95] text-linen sm:text-[88px]">
            {o.heading}
          </h2>
        </Reveal>
        <Reveal className="mt-8 lg:col-span-5 lg:col-start-8 lg:mt-3">
          <p className="measure text-[18px] leading-[1.65] text-linen/90 sm:text-[19px]">{o.body}</p>
          <p className="measure mt-5 text-[18px] leading-[1.65] text-linen/90 sm:text-[19px]">{o.network}</p>
        </Reveal>
      </div>

      {/* The green rhyme: Cubbon Park, where we come from; Golden Gate Park, where we're going. */}
      <div className="mt-16 grid gap-6 sm:mt-24 lg:grid-cols-12 lg:gap-x-8">
        <Reveal className="lg:col-span-6">
          <Photo k="cubbon" warm sizes="(min-width: 1024px) 50vw, 100vw" className="aspect-[3/2] rounded-[2px]" />
          <p className="t-mono mt-3 text-linen/50">{credit("cubbon")}</p>
        </Reveal>
        <Reveal className="lg:col-span-5 lg:col-start-8 lg:mt-24">
          <Photo k="ggpark" warm sizes="(min-width: 1024px) 42vw, 100vw" className="aspect-[4/5] rounded-[2px]" />
          <p className="t-mono mt-3 text-linen/50">{credit("ggpark")}</p>
        </Reveal>
      </div>

      {/* The contact sheet: real Bengaluru faces from our India site, here and nowhere else, with no quotes. */}
      <Reveal className="mt-20 sm:mt-28">
        <figure>
          <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            <ol className="flex w-max gap-[3px] rounded-[2px] bg-[#0d1913] p-[10px] sm:w-full sm:justify-between">
              {PEOPLE.map((p, i) => (
                <li key={p} className="w-[112px] shrink-0 sm:w-auto sm:flex-1">
                  <div className="photo aspect-[4/5]">
                    <img src={`/photos/people/${p}.webp`} alt="" width={240} height={300} loading="lazy" decoding="async" />
                  </div>
                  <p className="mt-1.5 font-mono text-[10px] tracking-[0.12em] text-linen/45">{String(i + 1).padStart(2, "0")}</p>
                </li>
              ))}
            </ol>
          </div>
          <figcaption className="t-mono mt-3 text-linen/65">{o.caption}</figcaption>
        </figure>
      </Reveal>

      {/* One quiet row of marks, set in linen so they sit inside the grade. */}
      <Reveal className="mt-20 border-t border-linen/12 pt-8 sm:mt-24">
        <p className="t-mono text-linen/60">{S.proofLine}</p>
        <ul className="mt-6 flex flex-wrap items-center gap-x-9 gap-y-6 sm:gap-x-12">
          {MARKS.map(([name, file, ratio]) => {
            const h = ratio < 1.6 ? 22 : ratio > 4.5 ? 15 : 18;
            return (
              <li key={name}>
                <span
                  role="img"
                  aria-label={name}
                  className="block bg-linen/70"
                  style={{ height: h, width: Math.round(h * ratio), mask: `url(${file}) center / contain no-repeat`, WebkitMask: `url(${file}) center / contain no-repeat` }}
                />
              </li>
            );
          })}
        </ul>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------ 10. the terms */
export function TermsLetter() {
  const t = S.terms;
  return (
    <section aria-labelledby="terms-h" className="px-4 py-24 sm:px-8 sm:py-32">
      <Reveal className="mx-auto max-w-[640px]">
        <article className="paper rounded-[2px] px-6 pt-8 pb-10 sm:px-12 sm:pt-12 sm:pb-14">
          <p className="t-mono text-ink-2">{t.label}</p>
          <h2 id="terms-h" className="t-display mt-4 text-[36px] leading-[1.02] text-ink sm:text-[46px]">
            {t.heading}
          </h2>
          <TermsDate />
          <p className="t-name mt-10 text-[24px] text-ink">{t.signature}</p>
        </article>
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------------- 11. FAQ */
export function Faq() {
  const f = S.faq;
  return (
    <section aria-labelledby="faq-h" className="px-4 pb-24 sm:px-8 sm:pb-32">
      <Reveal className="mx-auto max-w-[720px]">
        <h2 id="faq-h" className="t-display text-[44px] leading-none text-linen sm:text-[60px]">
          {f.heading}
        </h2>
        <div className="mt-10 border-t border-linen/15">
          {f.items.map(([q, a]) => (
            <details key={q} className="group border-b border-linen/15">
              <summary className="flex list-none items-baseline justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                <span className="t-display text-[22px] leading-[1.25] text-linen transition-colors duration-[250ms] group-hover:text-lamp sm:text-[25px]">{q}</span>
                <span aria-hidden="true" className="font-mono text-[18px] text-linen/60 transition-transform duration-[400ms] ease-[var(--ease-film)] group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="measure pb-6 text-[17px] leading-[1.65] text-linen/80">{a}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}

/* ---------------------------------------------------------- 12. end credits */
export function EndCredits() {
  const c = S.credits;
  const { privacyUrl, termsUrl, supportEmail } = site.legal;
  return (
    <footer className="pb-28">
      <div className="relative">
        <Photo k="hill" sizes="100vw" className="aspect-[4/3] sm:aspect-[2.39/1]" />
        <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-10 sm:pb-16">
          <AskButton className="inline-flex h-12 items-center rounded-[3px] bg-lamp px-7 text-[16px] font-medium text-ink transition-colors duration-[250ms] ease-[var(--ease-hover)] hover:bg-[#ecb04f]" />
        </div>
      </div>
      <Reveal className="mx-auto mt-16 max-w-[560px] px-4 text-center">
        <p className="t-display text-[26px] leading-[1.3] text-linen">{c.made}</p>
        <p className="t-mono mt-12 text-linen/50">{c.photosLabel}</p>
        <ul className="mt-4 space-y-1.5">
          {CREDIT_ORDER.map((k) => (
            <li key={k}>
              <a href={PHOTOS[k].url} target="_blank" rel="noopener noreferrer" className="t-mono hairline text-linen/75 hover:text-linen">
                {c.photo(PHOTOS[k].author, PHOTOS[k].source)}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[14px] text-linen/75">
          <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="hairline hover:text-linen">
            {c.privacy}
          </a>
          <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="hairline hover:text-linen">
            {c.terms}
          </a>
          <a href={`mailto:${supportEmail}`} className="hairline hover:text-linen">
            {supportEmail}
          </a>
        </p>
        <p className="mt-6 text-[13px] text-linen/55">{site.funding.line}</p>
      </Reveal>
    </footer>
  );
}
