/* eslint-disable @next/next/no-img-element -- the logo tile mark */
import { site } from "@/content/site";
import { CountUp } from "./CountUp";
import { ProductMock } from "./ProductMock";

const B = site.select.stats;

/** L3 Behind Tal (white card 4:124 / 5:120): heading, logo tile, the paragraph, two count-up stats, the product mock. */
export function BehindTal() {
  return (
    <section aria-labelledby="behind" className="px-4 pb-24 md:px-12 md:pb-40">
      <div className="mx-auto flex max-w-[1344px] flex-col gap-10 overflow-hidden rounded-[28px] bg-white px-5 py-8 md:flex-row md:items-center md:gap-16 md:py-10 md:pl-16 md:pr-10">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <h2 id="behind" className="text-[28px] font-semibold leading-[34px] tracking-[-0.6px] text-s1000 md:text-[40px] md:leading-[48px] md:tracking-[-1px]">
            {B.heading}
          </h2>
          <span className="flex size-[44.64px] items-center justify-center rounded-[12px] bg-white shadow-[0_4px_6px_rgba(0,0,0,0.14)]">
            <img src="/ds/tal-logo.svg" alt="" width={27} height={17} className="h-[16.6px] w-[27px]" />
          </span>
          <p className="t-sub max-w-[520px] text-s700">{B.body}</p>
          <dl className="flex w-full max-w-[600px] gap-8">
            {B.items.map((it) => (
              <div key={it.label} className="flex flex-1 flex-col gap-1 border-t border-s300 py-5">
                <dt className="sr-only">{it.label}</dt>
                <dd className="order-first text-[32px] font-medium leading-10 tracking-[-1px] text-s1000 md:text-[40px] md:leading-[48px]">
                  <CountUp value={it.value} />
                </dd>
                <dd aria-hidden className="t-helper text-s700">
                  {it.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <ProductMock />
      </div>
    </section>
  );
}
