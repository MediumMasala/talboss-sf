"use client";

/* eslint-disable @next/next/no-img-element -- 112-px WebP squares, shown at 56 */
import { useEffect, useRef, useState } from "react";
import { useSeen } from "./useSeen";

/**
 * The numbers wall's face stack (v4.3, FEEDBACK_V4_3 "Humanize"). Eight real Tal people from our India site
 * (`public/faces/*.webp`, cropped from `public/india/people/`, Tal-owned, see docs/team/ASSETS.md), in colour, 56-px
 * circles overlapping like a group photo, each with a white ring so the overlaps read. No names, no quotes, no caption:
 * they are people in Tal's network, never presented as members in SF. Decorative (the lead line beside them says it).
 * Once half in view they settle in one after another (opacity + 6 px rise, 70 ms apart, CSS in globals.css `.faces`);
 * reduced motion: at rest.
 */
export const FACES = ["isha", "aman", "ananya", "souvik", "aryan", "sunny-shah", "rohan", "sanchit"] as const;

export function Faces({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const seen = useSeen(ref, 0.5);
  // Server HTML (and no-JS) shows the faces; once hydrated, off-screen faces wait for their entrance.
  const [armed, setArmed] = useState(false);
  useEffect(() => setArmed(true), []);
  return (
    <ul ref={ref} aria-hidden data-armed={armed || undefined} className={`faces flex items-center ${seen ? "faces-in" : ""} ${className}`}>
      {FACES.map((f, i) => (
        <li key={f} className="face -ml-5 first:ml-0 md:-ml-3.5" style={{ ["--i" as string]: i, zIndex: FACES.length - i }}>
          <img src={`/faces/${f}.webp`} alt="" width={56} height={56} loading="lazy" decoding="async" className="block size-14 rounded-full bg-s100 object-cover ring-2 ring-white" />
        </li>
      ))}
    </ul>
  );
}
