"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";

const copy = site.upload.matching;
const STEP_MS = 900;
const REDUCED_STEP_MS = 400;

type Props = {
  reduced: boolean;
  /** True once the upload finished; the last step keeps spinning until then. */
  uploaded: boolean;
  onFinished: () => void;
};

/** Ticks through the matching steps one by one, then calls onFinished. */
export function MatchingSteps({ reduced, uploaded, onFinished }: Props) {
  const [done, setDone] = useState(0);
  const finished = useRef(onFinished);
  const rootRef = useRef<HTMLDivElement>(null);
  const lines = copy.lines;
  // The last step only ticks once the upload has actually landed.
  const ready = done >= lines.length - 1;

  useEffect(() => {
    finished.current = onFinished;
  });

  useEffect(() => {
    rootRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setDone((d) => d + 1), reduced ? REDUCED_STEP_MS : STEP_MS);
    return () => clearTimeout(timer);
  }, [done, ready, reduced]);

  useEffect(() => {
    if (!ready || !uploaded) return;
    setDone(lines.length);
    const timer = setTimeout(() => finished.current(), reduced ? 200 : 600);
    return () => clearTimeout(timer);
  }, [ready, uploaded, reduced, lines.length]);

  return (
    <div ref={rootRef} tabIndex={-1} className="rounded-2xl border border-line bg-surface-sunk p-5 outline-none">
      <p className="sr-only" role="status">
        {copy.srLabel}
      </p>
      <ul aria-hidden="true" className="space-y-4">
        {lines.map((text, i) => {
          const state = i < done ? "done" : i === done ? "active" : "todo";
          return (
            <li key={text} className="flex items-center gap-3">
              {state === "done" ? (
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cta text-cta-ink">
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 12.5 4.5 4.5L19 7.5" />
                  </svg>
                </span>
              ) : state === "active" ? (
                <span className="animate-spin-slow size-6 shrink-0 rounded-full border-2 border-line-strong border-t-ink" />
              ) : (
                <span className="size-6 shrink-0 rounded-full border-2 border-line-strong" />
              )}
              <span className={state === "todo" ? "text-[#6e6e73]" : state === "active" ? "text-ink" : "text-body"}>
                {text}
                {state === "active" && "…"}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
