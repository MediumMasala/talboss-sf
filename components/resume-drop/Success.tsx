"use client";

import { useEffect, useRef } from "react";
import { site } from "@/content/site";

const copy = site.upload.done;

/** "You're in." If the resume had no email on it, asks for a re-upload so we can reach them. */
export function Success({ email, onRestart }: { email: string | null; onRestart: () => void }) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-line bg-surface-sunk px-5 py-9 text-center">
      <span aria-hidden="true" className="flex size-14 items-center justify-center rounded-full bg-cta text-cta-ink">
        <svg viewBox="0 0 24 24" className="size-7" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h2 ref={headingRef} tabIndex={-1} className="mt-5 font-display text-[32px] font-bold tracking-[-0.02em] text-ink outline-none">
        {copy.title}
      </h2>
      <p className="mt-2 text-base text-body text-balance">{copy.body}</p>

      {email ? (
        <>
          <button
            type="button"
            onClick={onRestart}
            className="mt-6 text-[13px] text-muted underline decoration-muted/40 underline-offset-4 hover:text-ink"
          >
            {copy.restart}
          </button>
        </>
      ) : (
        <>
          <p className="mt-4 max-w-sm text-[14px] text-muted text-balance">{copy.noEmail}</p>
          <button
            type="button"
            onClick={onRestart}
            className="mt-5 rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-cta-ink transition-colors hover:bg-cta-hover"
          >
            {copy.reupload}
          </button>
        </>
      )}
    </div>
  );
}
