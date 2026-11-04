"use client";

/* eslint-disable @next/next/no-img-element -- art is pre-sized AVIF/WebP in <picture> */
import { m, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Magnetic } from "@/components/ds/Magnetic";
import { site } from "@/content/site";
import { EASE_IO, EASE_OUT } from "./motion";

const D = site.select.apply.done;

/** How far below its resting place a chip starts. Steve r2: 120 made the chips rise through the email line and the
 *  Done pill (both are already on screen); 36 is a short lift that never crosses them. */
const RISE = 36;
/** Seconds between the chips' rises, and how long a chip shows its place before the role line takes over. */
const RISE_GAP = 0.45;
const BEAT = 1.5;

/**
 * A7 Done (Figma 3:661 / 5:917). White and bright, and it stays alive:
 * - the dawn still rises under the copy (y 48 → 0, 1.8 s);
 * - your name arrives letter by letter (34 ms stagger, 640 ms each, y .35em → 0, blur 8 → 0), then the credit caps and the line;
 * - the sun blooms (CSS `.done-sun`: scale .35 → 1 + fade over 6 s, then an 8 s pulse) and its light spreads along
 *   the horizon (`.done-spread`, scaleX .3 → 1 over 7 s);
 * - the three place chips rise from the horizon one by one (y 120 → 0, 1.3 s, 450 ms apart); after a beat (1.5 s) each
 *   gives way to a sample role line in the same spot, then the set idles.
 * Transform and opacity only. Reduced motion renders the final state (the role lines, the sun at rest).
 */
export function Done({ name, email, until }: { name: string; email: string | null; until: string }) {
  const still = useReducedMotion() ?? false;
  const letters = Array.from(name || " ");
  const t0 = 0.2;
  const after = t0 + letters.length * 0.034 + 0.3;
  const chips0 = after + 0.35;
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
        {/* The sun sits at 50 % / 49 % of the still. Phones crop the 4:5 still from the top, so there its centre is
            49 % of the image's height (width × 1.25), never less than 49 % of the box. */}
        <div className="done-light absolute left-1/2 top-[max(49%,calc(100vw*0.6125))] md:top-[49%]">
          {/* Light along the horizon: soft-light, so the clouds brighten but the horizon line stays. */}
          <div className="done-spread absolute -left-[520px] -top-[110px] h-[260px] w-[1040px] rounded-[50%] bg-[radial-gradient(closest-side,rgba(255,255,255,0.55),rgba(255,255,255,0.3)_45%,rgba(255,255,255,0))] mix-blend-soft-light" />
          <div className="done-sun absolute -left-[170px] -top-[170px] size-[340px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.6),rgba(255,255,255,0.38)_9%,rgba(255,255,255,0.2)_24%,rgba(255,255,255,0.06)_52%,rgba(255,255,255,0))]" />
        </div>
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
        {/* F10: the frame's 560 column (3:680), not balanced narrower. */}
        <m.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: after + 0.05 }}
          className="mt-5 w-full max-w-[560px] text-pretty text-[18px] leading-7 tracking-[-0.1px] text-s700"
        >
          {D.sub}
        </m.p>
        <ul className="mt-6 flex flex-col items-center gap-1.5">
          {D.places.map((place, i) => {
            const [role, rest] = D.roles[i] ?? [place, ""];
            const rise = chips0 + i * RISE_GAP;
            const swap = rise + BEAT;
            return (
              <m.li
                key={place}
                className="grid place-items-center"
                initial={still ? false : { opacity: 0, y: RISE }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ y: { duration: 1.3, ease: EASE_OUT, delay: rise }, opacity: { duration: 0.8, ease: "easeOut", delay: rise } }}
              >
                <m.span
                  aria-hidden
                  className="[grid-area:1/1] rounded-full border border-s400 bg-white/65 px-3.5 py-1.5 text-[13px] font-medium leading-5 tracking-[0.01px] text-s1000 backdrop-blur-[8px]"
                  initial={still ? false : { opacity: 1, scale: 1 }}
                  animate={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.45, ease: EASE_IO, delay: swap }}
                >
                  {place}
                </m.span>
                <m.span
                  className="[grid-area:1/1] whitespace-nowrap rounded-full border border-s300 bg-white/70 px-4 py-1.5 text-[14px] leading-5 tracking-[-0.05px] shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur-[10px]"
                  initial={still ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease: EASE_OUT, delay: swap + 0.3 }}
                >
                  <span className="font-medium text-s1000">{role}</span>
                  {rest ? <span className="text-s600"> · {rest}</span> : null}
                </m.span>
              </m.li>
            );
          })}
        </ul>
        {/* Steve r2: the role lines are samples, and say so, so nobody reads them as roles already found. Laid out
            from the start (no shift); fades up with the first role line. */}
        <m.p
          initial={still ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: chips0 + BEAT + 0.3 }}
          className="t-helper mt-2.5 text-s600"
        >
          {D.rolesNote}
        </m.p>
        {email ? (
          <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: after + 0.7 }} className="t-helper mt-4 text-s600">
            {D.email(email)}
          </m.p>
        ) : null}
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
