"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/** Loads the small framer-motion feature bundle once and respects prefers-reduced-motion everywhere. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
