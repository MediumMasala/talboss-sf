/**
 * A tiny external store that lets the application card (React) tell the network field (canvas)
 * where the person is, without re-rendering anything. The canvas reads it once per frame.
 */

export type FieldStep = "you" | "search" | "confirm" | "resume" | "sending" | "done";

export type FieldState = {
  step: FieldStep;
  /** What the "you" point is labelled with: the typed name, then the confirmed LinkedIn name. */
  label: string;
  /** How many people / startups one mark stands for at the current screen size (set by the field). */
  scale: { people: number; startups: number } | null;
  /** The form's own step, for page chrome that changes as you go (hero note, nav and final CTAs). */
  phase: string;
};

let state: FieldState = { step: "you", label: "", scale: null, phase: "you" };
const subs = new Set<() => void>();

export const field = {
  get: () => state,
  set(patch: Partial<FieldState>) {
    const next = { ...state, ...patch };
    if (next.step === state.step && next.label === state.label && next.scale === state.scale && next.phase === state.phase) return;
    state = next;
    subs.forEach((f) => f());
  },
  subscribe(f: () => void) {
    subs.add(f);
    return () => {
      subs.delete(f);
    };
  },
};

/** "300,000+" → 300000. */
export const claimNumber = (claim: string) => Number(claim.replace(/[^0-9]/g, "")) || 0;
