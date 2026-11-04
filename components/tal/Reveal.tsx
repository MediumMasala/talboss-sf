"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import { useMode } from "./flow-store";
import { untilDate } from "./Stage";

/** Sections fade up as they arrive: 700 ms on the film curve, once. Reduced motion: no movement (MotionConfig). */
export function Reveal({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}

/** The sample letter steps aside once the person's own letter is on screen. */
export function SampleGate({ children }: { children: ReactNode }) {
  return useMode() === "frame" ? <>{children}</> : null;
}

/** The terms carry the same computed date as the title card. */
export function TermsDate() {
  const paragraphs = site.select.terms.paragraphs(untilDate());
  return (
    <div className="mt-6 space-y-4 text-[17px] leading-[1.65] text-ink" suppressHydrationWarning>
      {paragraphs.map((p) => (
        <p key={p.slice(0, 24)} suppressHydrationWarning>
          {p}
        </p>
      ))}
    </div>
  );
}
