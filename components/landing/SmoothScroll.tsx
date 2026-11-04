"use client";

import "lenis/dist/lenis.css";
import { useEffect } from "react";

/**
 * Lenis smooth scroll on desktop only (fine pointer, no reduced-motion). Touch stays native.
 * Loaded after hydration (dynamic import), lerp 0.1, anchors smooth-scroll too (with the sticky bar + nav offset).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Loaded on the first wheel, so it never competes with the first paint.
    let lenis: { destroy: () => void } | null = null;
    let cancelled = false;
    const start = () => {
      import("lenis").then(({ default: Lenis }) => {
        if (cancelled) return;
        lenis = new Lenis({ lerp: 0.1, smoothWheel: true, autoRaf: true, anchors: { offset: -124 } });
      });
    };
    window.addEventListener("wheel", start, { once: true, passive: true });
    return () => {
      cancelled = true;
      window.removeEventListener("wheel", start);
      lenis?.destroy();
    };
  }, []);
  return null;
}
