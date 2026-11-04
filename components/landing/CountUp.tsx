"use client";

import { useEffect, useRef, useState } from "react";
import { useSeen } from "./useSeen";

/**
 * Counts a claim like "300,000+" up from 0 once it's 80 % in view: 1.6 s, easeOutExpo, tabular figures.
 * The final string is laid out invisibly underneath, so the width never changes (CLS 0). Reduced motion: the number.
 */
export function CountUp({ value, className = "" }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useSeen(ref, 0.8);
  const target = Number(value.replace(/[^0-9]/g, "")) || 0;
  const suffix = value.replace(/^[0-9,]+/, "");
  const [n, setN] = useState<number | null>(null);
  // Server HTML (and no-JS) shows the claim; once hydrated, off-screen numbers wait at 0 for their count.
  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setN((v) => (v === null ? 0 : v));
  }, []);

  useEffect(() => {
    if (!seen || !target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setN(target);
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 1600);
      setN(Math.round(target * (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [seen, target]);

  return (
    <span ref={ref} className={`relative inline-block tabular-nums ${className}`}>
      <span className="invisible" aria-hidden>
        {value}
      </span>
      <span className="absolute inset-0" aria-hidden>
        {n === null ? value : `${n.toLocaleString("en-US")}${suffix}`}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
