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
 * Counts a figure like "300,000+" up from 0 once it's 80 % in view: 1.6 s, easeOutExpo, tabular figures, after
 * `delay` ms (the numbers wall ripples across its grid). The final string is laid out invisibly underneath, so the
 * width never changes (CLS 0). A value that isn't a number (a dash) is shown as is. Reduced motion: the number.
 */
export function CountUp({ value, className = "", delay = 0 }: { value: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useSeen(ref, 0.8);
  const p = parse(value);
  const countable = !!p;
  const [n, setN] = useState<number | null>(null);
  // Server HTML (and no-JS) shows the figure; once hydrated, off-screen numbers wait at 0 for their count.
  useEffect(() => {
    if (countable && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) setN((v) => (v === null ? 0 : v));
  }, [countable]);

  const target = p?.n ?? 0;
  useEffect(() => {
    if (!seen || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(target);
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now + delay;
      const t = Math.max(0, Math.min(1, (now - t0) / 1600));
      setN(t === 1 ? target : target * (1 - Math.pow(2, -10 * t)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target, delay]);

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
