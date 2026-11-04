"use client";

import { useEffect, useState, type RefObject } from "react";

/** true once `amount` of the element has been in view (IntersectionObserver, fires once). */
export function useSeen(ref: RefObject<Element | null>, amount = 0.5) {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: amount },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, amount, seen]);
  return seen;
}
