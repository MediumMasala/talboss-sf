"use client";

import { useRef, type ReactNode } from "react";

/**
 * Pulls its child a few pixels toward the cursor while hovered, then springs back.
 * strength 0.22 of the offset from centre, clamped to `max` px; follows in 140 ms ease-out and returns in
 * 520 ms on an overshoot curve (cubic-bezier(.34, 1.56, .64, 1)), which reads as a spring. Mouse only,
 * nothing with reduced motion. No animation library: the landing ships without Motion.
 */
export function Magnetic({ children, strength = 0.22, max = 8, className = "inline-flex" }: { children: ReactNode; strength?: number; max?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const clamp = (v: number) => Math.max(-max, Math.min(max, v));
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || reduced()) return;
        const el = ref.current!;
        const r = el.getBoundingClientRect();
        const x = clamp((e.clientX - (r.left + r.width / 2)) * strength);
        const y = clamp((e.clientY - (r.top + r.height / 2)) * strength);
        el.style.transition = "transform 140ms cubic-bezier(0.16, 1, 0.3, 1)";
        el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      }}
      onPointerLeave={() => {
        const el = ref.current!;
        el.style.transition = "transform 520ms cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.transform = "translate3d(0, 0, 0)";
      }}
    >
      {children}
    </div>
  );
}
