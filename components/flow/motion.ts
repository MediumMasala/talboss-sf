import type { Transition, Variants } from "framer-motion";

/** One vocabulary for the flow (FRONTEND_STUDY.md). */
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IO = [0.7, 0, 0.3, 1] as const;

/** Shared-layout travel of typed text between screens: ~500 ms, no visible overshoot on type. */
export const travel: Transition = { type: "spring", stiffness: 260, damping: 30, mass: 0.9 };
/** Cards and chips that should land with a little life: ~350 ms, one small overshoot. */
export const snap: Transition = { type: "spring", stiffness: 420, damping: 30, mass: 0.8 };

/** Screen enter/exit. `custom` is the direction: 1 forward, -1 back. Enter 520 ms with a 6 px blur; exit 220 ms. */
export const screen: Variants = {
  initial: (dir: number) => ({ opacity: 0, y: dir >= 0 ? 18 : -18, filter: "blur(6px)" }),
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.52, ease: EASE_OUT } },
  exit: (dir: number) => ({ opacity: 0, y: dir >= 0 ? -12 : 12, filter: "blur(4px)", transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } }),
};

/** Children of a screen arrive in a 60 ms cascade. */
export const cascade: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: (i: number = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay: 0.06 * i } }),
};
