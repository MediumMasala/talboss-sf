"use client";

import { useCallback } from "react";

/** Cursor-following highlight for `.glass.glow` cards: writes --mx/--my/--glow on the element (no React state, no re-render). */
export function useGlow() {
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--glow", "1");
  }, []);
  const onPointerLeave = useCallback((e: React.PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--glow", "0");
  }, []);
  return { onPointerMove, onPointerLeave };
}
