"use client";

import { useEffect, useRef, useState } from "react";
import { useSeen } from "./useSeen";

/** "300,000+" → 300000 · "12K+" → 12 + "K+" · "1.2K+" → 1.2 (one decimal) + "K+". Anything else: no count. */
function parse(value: string) {
  const m = /^(\d[\d,]*(?:\.(\d+))?)(.*)$/.exec(value);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, ""));
  if (!n) return null;
  return { n, decimals: m[2]?.length ?? 0, grouped: m[1].includes(","), suffix: m[3] };
}

/**
 * Counts a figure like "300,000+" up (from the smallest number with as many digits, 100,000+) once it's 80 % in view: `duration` ms (1.6 s default), easeOutExpo, or the
 * gentler easeOutCubic with `soft` (v4.3: the numbers wall's one count), tabular figures, after `delay` ms.
 * The final string is laid out invisibly underneath, so the width never changes (CLS 0). A value that isn't a number (a dash) is shown as is. Reduced motion: the number.
 */
export function CountUp({
  value,
  className = "",
  delay = 0,
  duration = 1600,
  soft = false,
}: {
  value: string;
  className?: string;
  delay?: number;
  duration?: number;
  soft?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useSeen(ref, 0.8);
  const p = parse(value);
  const countable = !!p;
  const [n, setN] = useState<number | null>(null);
  const target = p?.n ?? 0;
  // The count starts at the smallest number with the final's digit count (300,000+ counts up from 100,000+): with
  // tabular figures every step is then exactly the final's width, so the words after it never sit behind a gap.
  const from = target >= 1 ? Math.pow(10, Math.floor(Math.log10(target))) : 0;
  // Server HTML (and no-JS) shows the figure; once hydrated, off-screen numbers wait at `from` for their count.
  useEffect(() => {
    if (countable && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setN((v) => (v === null ? from : v));
  }, [countable, from]);

  useEffect(() => {
    if (!seen || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(target);
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now + delay;
      const t = Math.max(0, Math.min(1, (now - t0) / duration));
      setN(t === 1 ? target : from + (target - from) * (soft ? 1 - Math.pow(1 - t, 3) : 1 - Math.pow(2, -10 * t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target, from, delay, duration, soft]);

  const shown =
    n === null || !p
      ? value
      : `${n.toLocaleString("en-US", { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals, useGrouping: p.grouped })}${p.suffix}`;

  return (
    <span ref={ref} className={`relative inline-block tabular-nums ${className}`}>
      <span className="invisible" aria-hidden>
        {value}
      </span>
      <span className="absolute inset-0" aria-hidden>
        {shown}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
