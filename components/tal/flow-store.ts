"use client";

import { useSyncExternalStore } from "react";

/** Where the flow is, so the rest of the page can step aside (the sample letter hides once the real one is on screen). */
export type Mode = "frame" | "letter" | "done";
let mode: Mode = "frame";
const subs = new Set<() => void>();
export const setMode = (m: Mode) => {
  if (m === mode) return;
  mode = m;
  subs.forEach((f) => f());
};
export const useMode = () =>
  useSyncExternalStore(
    (f) => (subs.add(f), () => subs.delete(f)),
    () => mode,
    () => "frame" as Mode,
  );
