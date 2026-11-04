"use client";

/* eslint-disable @next/next/no-img-element -- pre-sized art */
import { useGlow } from "@/components/ds/useGlow";
import { site } from "@/content/site";

const D = site.select.deal;

/** L5 The deal (22:1165 / 22:1393): glass card, cursor highlight, the chrome orb (desktop only), four hairline rows. */
export function Deal() {
  const glow = useGlow();
  return (
    <section aria-labelledby="deal" className="px-4 pb-24 md:px-12 md:pb-40">
      <div {...glow} className="glass glow mx-auto flex max-w-[1344px] flex-col gap-6 p-6 md:flex-row md:gap-16 md:p-12">
        <div className="relative flex flex-col gap-8 md:w-[464px] md:shrink-0">
          <h2 id="deal" className="text-[28px] font-medium leading-[34px] tracking-[-0.42px] text-white md:text-[32px] md:leading-10">
            {D.heading}
          </h2>
          <picture className="deal-orb hidden h-[270px] w-[216px] overflow-hidden rounded-[20px] md:block">
            <source type="image/avif" srcSet="/art/orb-4x5-480.avif" />
            <img src="/art/orb-4x5-480.webp" alt="" loading="lazy" width={216} height={270} className="size-full object-cover" />
          </picture>
        </div>
        <ul className="relative flex flex-1 flex-col border-b border-hair md:self-start">
          {D.rows.map(([lead, rest]) => (
            <li key={lead} className="border-t border-hair py-5 text-[18px] leading-7 tracking-[-0.1px] text-white/64 md:py-[22px]">
              <span className="text-white">{lead}</span>
              {rest}
            </li>
          ))}
        </ul>
      </div>
      <style>{`
        .deal-orb img { animation: orb 9s ease-in-out infinite; }
        @keyframes orb { 50% { transform: translateY(-6px) scale(1.02); } }
        @media (prefers-reduced-motion: reduce) { .deal-orb img { animation: none; } }
      `}</style>
    </section>
  );
}
