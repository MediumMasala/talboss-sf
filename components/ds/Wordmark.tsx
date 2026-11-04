"use client";

import { useEffect, useRef } from "react";

/**
 * The metallic tal wordmark (DS/Wordmark Metallic 4:2): the logo SVG is a CSS mask over the silver ramp
 * (#FFF → #DBDBDB → #9A9A9A), with a sheen band inside that moves on transform only.
 * Idle (CSS): the sheen sweeps left to right in 1.6 s on the in-out curve, every 5.2 s (`.wordmark-idle`).
 * Pointer (fine pointers, anywhere on the page): the idle sweep pauses, the sheen follows the cursor
 * (600 ms ease-out) and the mark tilts up to 7° / 5° (500 ms ease-out); 1.2 s after the pointer stops it settles
 * back and the idle sweep resumes. Reduced motion: still silver, no sheen movement.
 */
export function Wordmark({ className = "", label = "tal", interactive = true }: { className?: string; label?: string; interactive?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const sheen = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!interactive || !window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let resume: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = box.current?.getBoundingClientRect();
        const s = sheen.current;
        const m = mark.current;
        if (!r || !s || !m || r.bottom < 0) return;
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (window.innerHeight / 2)));
        s.classList.remove("wordmark-idle");
        s.style.transition = "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)";
        s.style.transform = `translate3d(${(Math.max(-1, Math.min(1, nx * 1.4)) * 33.333).toFixed(2)}%, 0, 0)`;
        m.style.transform = `rotateX(${(-ny * 5).toFixed(2)}deg) rotateY(${(nx * 7).toFixed(2)}deg)`;
        clearTimeout(resume);
        resume = setTimeout(() => {
          m.style.transform = "";
          s.style.transition = "";
          s.style.transform = "";
          s.classList.add("wordmark-idle");
        }, 1200);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resume);
      window.removeEventListener("pointermove", onMove);
    };
  }, [interactive]);

  return (
    <div ref={box} role="img" aria-label={label} className={`[perspective:800px] ${className}`}>
      <div ref={mark} className="wordmark size-full transition-transform duration-500 ease-[var(--ease-out)]">
        <span ref={sheen} className="wordmark-sheen wordmark-idle" />
      </div>
    </div>
  );
}
