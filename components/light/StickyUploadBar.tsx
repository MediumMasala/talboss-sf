"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { useResumeFlow } from "../resume-drop";

const HERO = "resume-drop-hero";

/**
 * Glass bar stuck to the bottom of the screen. It slides up once the hero's upload button is out of view
 * (so the first screen never shows two buttons) and hides again once an upload has started.
 * Its button opens the hero's file picker and scrolls the hero back into view, so the progress is visible.
 */
export function StickyUploadBar() {
  const { state } = useResumeFlow();
  const [heroInView, setHeroInView] = useState(true);
  const { headline, trust } = site.hero;

  useEffect(() => {
    const hero = document.getElementById(HERO);
    if (!hero) return;
    const observer = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting));
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const canPick = state.stage === "idle" || (state.stage === "error" && state.error?.recover === "idle");
  const shown = !heroInView && canPick;

  const open = () => {
    track("sticky_bar_click");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(HERO)?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    document.getElementById(`${HERO}-input`)?.click();
  };

  return (
    <div className="sticky-bar" data-shown={shown} inert={!shown}>
      <div className="glass-nav mx-auto flex max-w-[560px] items-center justify-between gap-3 rounded-[20px] py-2 pr-2 pl-4">
        <p className="min-w-0 text-[13px] leading-snug text-muted">
          {/* Phones: just the lead line. Computers: the whole headline, then the trust line. */}
          <span className="block text-[14px] font-semibold text-ink min-[360px]:whitespace-nowrap min-[390px]:text-[15px] sm:hidden">{headline.lead}</span>
          <span className="hidden font-semibold text-ink sm:block">
            {headline.lead} {headline.main} {headline.scribble} {headline.tail}
          </span>
          <span className="hidden sm:inline">{trust}</span>
        </p>
        <button
          type="button"
          onClick={open}
          className="flex shrink-0 items-center gap-2 rounded-[14px] bg-cta px-4 py-3 text-sm font-medium text-cta-ink transition-[background-color,transform] hover:bg-cta-hover active:scale-[0.98]"
        >
          <span className="sm:hidden">{site.light.stickyButtonShort}</span>
          <span className="hidden sm:inline">{site.upload.idle.button}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5" />
            <path d="m6 11 6-6 6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
