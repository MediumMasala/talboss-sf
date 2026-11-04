"use client";

import { useSyncExternalStore } from "react";
import { r2 } from "./copy";
import { field } from "./network-store";

const usePhase = () => useSyncExternalStore(field.subscribe, () => field.get().phase, () => "you");
const fmt = (n: number) => n.toLocaleString("en-US");

/** Hides page chrome that stops being true once the person is past a step (e.g. "Join" after they've joined). */
export function HideFrom({ phases, children }: { phases: string[]; children: React.ReactNode }) {
  const phase = usePhase();
  return phases.includes(phase) ? null : <>{children}</>;
}

/** The one sentence that tells a cold visitor what the field is, sitting right under their own point. */
export function YouLine({ className = "" }: { className?: string }) {
  const scale = useSyncExternalStore(field.subscribe, () => field.get().scale, () => null);
  const phase = usePhase();
  return (
    <div data-field-avoid className={className}>
      <p className="text-[13.5px] leading-snug text-balance text-body">
        {phase === "done" ? r2.fieldDone : r2.fieldLine(scale ? fmt(scale.people) : "…")}
      </p>
      <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-muted">
        <span aria-hidden="true" className="inline-block size-[7px] border border-ink/60" />
        {scale ? `1 square = ${fmt(scale.startups)} startups` : " "}
      </p>
    </div>
  );
}
