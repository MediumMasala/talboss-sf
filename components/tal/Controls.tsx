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
export function Controls() {
  const on = useSound();
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
        <button
          type="button"
          aria-pressed={on}
          aria-label={on ? S.sound.turnOff : S.sound.turnOn}
          onClick={() => setSound(!on)}
          className="t-mono pointer-events-auto flex h-9 items-center gap-2 rounded-[3px] bg-forest/70 px-2.5 text-linen/80 backdrop-blur-sm transition-colors duration-[250ms] hover:text-linen"
        >
          <Level on={on} />
          {on ? S.sound.on : S.sound.off}
        </button>
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
