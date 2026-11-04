"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { useMode } from "./flow-store";
import { setSound, useSound } from "./sound";

const S = site.select;

/** Bring the stage back and put the cursor in the first field (when the form is showing). */
export function askTal() {
  const stage = document.getElementById("apply");
  if (!stage) return;
  const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  stage.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
  window.setTimeout(() => document.getElementById("apply-name")?.focus({ preventScroll: true }), smooth ? 700 : 0);
}

export function AskButton({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={askTal} className={className}>
      {S.credits.cta}
    </button>
  );
}

/**
 * The two fixed controls: the sound toggle (bottom-left, always) and the one action within reach
 * (a slim bottom dock on phones, a small button bottom-right on desktop). The action hides while the stage is on screen.
 */
export function SoundToggle({ className = "" }: { className?: string }) {
  const on = useSound();
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? S.sound.turnOff : S.sound.turnOn}
      onClick={() => setSound(!on)}
      className={`t-mono h-9 items-center gap-2 rounded-[3px] bg-forest/70 px-2.5 text-linen/85 backdrop-blur-sm transition-colors duration-[250ms] hover:text-linen ${className}`}
    >
      <Level on={on} />
      {on ? S.sound.on : S.sound.off}
    </button>
  );
}

/** The top bar: the wordmark and the funding line. On the title card the funding line steps aside (it can't be read on a sunrise). */
export function TopBar() {
  const mode = useMode();
  const done = mode === "done";
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-start justify-between gap-6 px-4 pt-4 sm:px-8 sm:pt-6 lg:px-14">
      <a href="/" aria-label={S.topBar.wordmarkLabel} className={`t-display pointer-events-auto text-[38px] leading-none transition-colors duration-700 sm:text-[44px] ${done ? "text-ink" : "text-linen"}`}>
        {S.topBar.wordmark}
      </a>
      <div className="flex flex-col items-end gap-2">
        {!done && <p className="max-w-[230px] pt-1.5 text-right text-[12px] leading-[1.45] text-linen/90 sm:max-w-none sm:pt-3 sm:text-[13px]">{site.funding.line}</p>}
        <SoundToggle className="pointer-events-auto flex lg:hidden" />
      </div>
    </header>
  );
}

export function Controls() {
  const mode = useMode();
  const [stageVisible, setStageVisible] = useState(true);

  useEffect(() => {
    const el = document.getElementById("apply");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStageVisible(e.isIntersecting), { threshold: 0, rootMargin: "0px 0px -35% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [mode]);

  const showDock = !stageVisible && mode !== "done";

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40">
      <div
        className={`flex items-center justify-between gap-3 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-[background-color,border-color] duration-[600ms] ease-[var(--ease-film)] sm:px-6 sm:pb-5 lg:bg-transparent ${showDock ? "border-t border-linen/10 bg-forest/92 backdrop-blur-md lg:border-transparent lg:backdrop-blur-none" : "border-t border-transparent"}`}
      >
        {/* On phones the toggle lives in the top bar, so nothing fixed ever sits over a field. */}
        <SoundToggle className="pointer-events-auto hidden lg:flex" />
        <span className="lg:hidden" />
        <button
          type="button"
          onClick={askTal}
          tabIndex={showDock ? 0 : -1}
          aria-hidden={!showDock}
          className={`pointer-events-auto inline-flex h-10 items-center rounded-[3px] bg-lamp px-4 text-[15px] font-medium text-ink transition-[opacity,transform,background-color] duration-[600ms] ease-[var(--ease-film)] hover:bg-[#ecb04f] ${showDock ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}
        >
          {S.dock}
        </button>
      </div>
    </div>
  );
}

/** Three tiny bars: still when off, slowly breathing when on. */
function Level({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className="flex h-3 items-end gap-[2px]">
      {[0.45, 1, 0.7].map((h, i) => (
        <span
          key={i}
          className={`w-[2px] rounded-[1px] bg-current ${on ? "breathe" : "opacity-50"}`}
          style={{ height: on ? `${h * 12}px` : "3px", animationDelay: `${i * 220}ms`, transition: "height 400ms var(--ease-film)" }}
        />
      ))}
    </span>
  );
}
