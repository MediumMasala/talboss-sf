"use client";

/* eslint-disable @next/next/no-img-element -- art is pre-sized AVIF/WebP in <picture> */
import { m } from "framer-motion";
import Link from "next/link";
import { Magnetic } from "@/components/ds/Magnetic";
import { site } from "@/content/site";
import { EASE_OUT } from "./motion";

const D = site.select.apply.done;

/**
 * A7 Done (Figma 3:661 / 5:917). White and bright: the dawn still rises under the copy (y 48 → 0, 1.8 s),
 * your name arrives letter by letter (34 ms stagger, 640 ms each, y .35em → 0, blur 8 → 0), then the credit caps,
 * the line, and the three chips float up on a spring (stiffness 260, damping 20, 90 ms apart).
 */
export function Done({ name, email, until }: { name: string; email: string | null; until: string }) {
  const letters = Array.from(name || " ");
  const t0 = 0.2;
  const after = t0 + letters.length * 0.034 + 0.3;
  const long = name.length > 16;
  return (
    <div className="relative flex flex-1 flex-col items-center overflow-hidden">
      {/* art/done: 720 wide, centred, 52 px under the header on desktop; bottom-anchored 488 tall on phones */}
      <m.div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[488px] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-[52px] md:h-[900px] md:w-[720px] md:-translate-x-1/2"
        initial={{ opacity: 0, y: 48 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.8, ease: EASE_OUT, delay: 0.1 }}
      >
        <picture>
          <source type="image/avif" srcSet="/art/done-4x5-480.avif 480w, /art/done-4x5-720.avif 720w, /art/done-4x5-928.avif 928w" sizes="(min-width: 768px) 720px, 100vw" />
          <source type="image/webp" srcSet="/art/done-4x5-480.webp 480w, /art/done-4x5-720.webp 720w, /art/done-4x5-928.webp 928w" sizes="(min-width: 768px) 720px, 100vw" />
          <img src="/art/done-4x5-720.webp" alt="" className="size-full object-cover object-top md:object-center" />
        </picture>
        {/* White blends (23:1368, 23:1369, 23:1389 / 23:1745) so the still melts into the canvas. */}
        <div className="absolute inset-y-0 left-0 hidden w-[240px] bg-[linear-gradient(90deg,#fff,rgba(255,255,255,0.85)_35%,rgba(255,255,255,0))] md:block" />
        <div className="absolute inset-y-0 right-0 hidden w-[240px] bg-[linear-gradient(270deg,#fff,rgba(255,255,255,0.85)_35%,rgba(255,255,255,0))] md:block" />
        <div className="absolute inset-x-0 top-0 h-[180px] bg-[linear-gradient(180deg,#fff,rgba(255,255,255,0))] md:h-[260px]" />
      </m.div>

      <div className="relative flex w-full flex-1 flex-col items-center px-6 pt-10 text-center md:px-0 md:pt-11">
        <h1 tabIndex={-1} aria-label={name} className={`max-w-full font-semibold text-s1000 outline-none ${long ? "text-[36px] leading-[42px] tracking-[-1px] md:text-[56px] md:leading-[64px] md:tracking-[-1.5px]" : "text-[56px] leading-[64px] tracking-[-1.5px]"}`}>
          {letters.map((ch, i) => (
            <m.span
              key={i}
              aria-hidden
              className="inline-block whitespace-pre"
              initial={{ opacity: 0, y: "0.35em", filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.64, ease: EASE_OUT, delay: t0 + i * 0.034 }}
            >
              {ch}
            </m.span>
          ))}
        </h1>
        <m.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: after - 0.1 }}
          className="mt-3 text-[13px] font-medium uppercase leading-5 tracking-[1.2px] text-s700"
        >
          {D.credit(until)}
        </m.p>
        <m.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: after + 0.05 }}
          className="mt-5 max-w-[600px] text-balance text-[18px] leading-7 tracking-[-0.1px] text-s700"
        >
          {D.sub}
        </m.p>
        <ul className="mt-7 flex flex-wrap justify-center gap-2">
          {D.places.map((p, i) => (
            <m.li
              key={p}
              initial={{ opacity: 0, y: 26, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20, delay: after + 0.3 + i * 0.09 }}
              className="rounded-full border border-s400 bg-white/65 px-3.5 py-1.5 text-[13px] font-medium leading-5 tracking-[0.01px] text-s1000 backdrop-blur-[8px]"
            >
              {p}
            </m.li>
          ))}
        </ul>
        <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: after + 0.7 }} className="t-helper mt-4 text-s600">
          {email ? D.email(email) : D.noEmail}
        </m.p>
        <m.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT, delay: after + 0.6 }}
          className="sticky bottom-0 mt-auto w-full pb-[max(34px,env(safe-area-inset-bottom))] pt-4 md:static md:mt-6 md:w-auto md:pb-0 md:pt-0"
        >
          <Magnetic className="flex w-full md:inline-flex md:w-auto">
            <Link href="/" prefetch={false} className="pill pill-l pill-dark w-full md:w-auto">
              {D.close}
            </Link>
          </Magnetic>
        </m.div>
      </div>
    </div>
  );
}
