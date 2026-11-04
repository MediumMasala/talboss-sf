"use client";

import { site } from "@/content/site";

/**
 * DS/Footer progress (Figma 2:183 / 2:224): five 2 px segments, #EBEBEB track, #222 fill, gap 8 (4 on phones).
 * Each fill is a scaleX transform (compositor only), 600 ms on the in-out curve, so a step "pours" into the next.
 */
export function Progress({ fills, step }: { fills: number[]; step: number }) {
  const names = site.select.steps.names;
  return (
    <div
      className="flex w-full gap-1 md:gap-2"
      role="progressbar"
      aria-label={site.select.steps.label(step, names.length)}
      aria-valuemin={1}
      aria-valuemax={names.length}
      aria-valuenow={step}
      aria-valuetext={`${site.select.steps.label(step, names.length)}: ${names[step - 1] ?? ""}`}
    >
      {fills.map((f, i) => (
        <div key={i} className="relative h-[2px] flex-1 overflow-hidden bg-s300">
          <div
            className="absolute inset-0 origin-left bg-s1000 transition-transform duration-[600ms] ease-[var(--ease-io)] motion-reduce:transition-none"
            style={{ transform: `scaleX(${Math.max(0, Math.min(1, f))})`, transitionDelay: `${i * 40}ms` }}
          />
        </div>
      ))}
    </div>
  );
}
