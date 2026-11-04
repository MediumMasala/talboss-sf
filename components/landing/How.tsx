"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

const H = site.select.how;

/**
 * L4 How it works (4:154). The steps light up as you scroll: a step turns on when its top passes 62 % of the
 * viewport and stays on; its hairline fills left to right in white (scaleX, 700 ms in-out), the number and
 * title go from 46–50 % (still AA) to full white (400 ms). Reduced motion or no JS: all on (the `lit` class is the default
 * until the observer runs).
 */
export function How() {
  const list = useRef<HTMLOListElement>(null);
  const [lit, setLit] = useState<number>(H.steps.length);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const items = Array.from(list.current?.children ?? []) as HTMLElement[];
    const under = items.filter((el) => el.getBoundingClientRect().top > window.innerHeight * 0.62).length;
    setLit(H.steps.length - under);
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = items.indexOf(e.target as HTMLElement);
          setLit((n) => Math.max(n, i + 1));
        }
      },
      { rootMargin: "0px 0px -38% 0px" },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section aria-labelledby="how" className="flex flex-col gap-8 px-4 pb-24 md:flex-row md:gap-16 md:px-12 md:pb-40">
      <div className="flex flex-1 flex-col gap-4">
        <h2 id="how" className="text-[28px] font-semibold leading-[34px] tracking-[-0.6px] text-white md:text-[40px] md:leading-[48px] md:tracking-[-1px]">
          {H.heading}
        </h2>
        <p className="t-sub max-w-[480px] text-white/64">{H.sub}</p>
      </div>
      <ol ref={list} className="flex w-full flex-col md:w-[720px] md:shrink-0">
        {H.steps.map((s, i) => {
          const on = i < lit;
          return (
            <li key={s.title} className="relative flex gap-6 py-6">
              <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/12" />
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left bg-white/70 transition-transform duration-700 ease-[var(--ease-io)]"
                style={{ transform: `scaleX(${on ? 1 : 0})` }}
              />
              <span className={`w-8 shrink-0 text-[13px] font-medium uppercase leading-5 tracking-[1.2px] transition-colors duration-400 ${on ? "text-white" : "text-white/46"}`}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1">
                <p className={`text-[18px] font-medium leading-7 tracking-[-0.1px] transition-colors duration-400 ${on ? "text-white" : "text-white/50"}`}>{s.title}</p>
                <p className={`text-[14px] leading-5 transition-colors duration-400 ${on ? "text-white/64" : "text-white/46"}`}>{s.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
