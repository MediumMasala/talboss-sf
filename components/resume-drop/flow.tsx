"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from "react";

/**
 * One upload flow shared by every <ResumeDrop /> on the page. The instance where the person
 * started "owns" the flow and renders it; the others point back to it instead of starting over.
 * Without a provider, each <ResumeDrop /> falls back to its own local flow (works standalone).
 *
 * idle → matching → done, with error branching off idle (bad file) or matching (upload failed).
 * No form: contact details are read from the resume on the server. "dragging" is a visual state per instance.
 */
export type FlowStage = "idle" | "matching" | "done" | "error";
export type DropState = FlowStage | "dragging";

export type FlowState = {
  stage: FlowStage;
  owner: string | null;
  file: File | null;
  /** recover: where "try again" goes. idle = bad file, retry = upload failed (same file). */
  error: { message: string; recover: "idle" | "retry" } | null;
  /** Email found in the resume, if any. */
  email: string | null;
};

export type FlowAction =
  | { type: "select"; file: File; owner: string }
  | { type: "reject"; message: string; owner: string }
  | { type: "retry" }
  | { type: "succeed"; email: string | null }
  | { type: "fail"; message: string }
  | { type: "reset" };

export const initialFlow: FlowState = { stage: "idle", owner: null, file: null, error: null, email: null };

function reducer(state: FlowState, action: FlowAction): FlowState {
  switch (action.type) {
    case "select":
      return { ...initialFlow, stage: "matching", owner: action.owner, file: action.file };
    case "reject":
      return { ...initialFlow, stage: "error", owner: action.owner, error: { message: action.message, recover: "idle" } };
    case "retry":
      return state.file ? { ...state, stage: "matching", error: null } : initialFlow;
    case "succeed":
      return state.stage === "matching" ? { ...state, stage: "done", email: action.email } : state;
    case "fail":
      return { ...state, stage: "error", error: { message: action.message, recover: "retry" } };
    case "reset":
      return initialFlow;
  }
}

type FlowContextValue = { state: FlowState; dispatch: Dispatch<FlowAction> };

const FlowContext = createContext<FlowContextValue | null>(null);

export function ResumeFlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialFlow);
  const value = useMemo(() => ({ state, dispatch }), [state]);

  // A file dropped outside the drop zone would otherwise make the browser navigate to it.
  useEffect(() => {
    const block = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("Files")) e.preventDefault();
    };
    window.addEventListener("dragover", block);
    window.addEventListener("drop", block);
    return () => {
      window.removeEventListener("dragover", block);
      window.removeEventListener("drop", block);
    };
  }, []);

  return <FlowContext value={value}>{children}</FlowContext>;
}

export function useResumeFlow(): FlowContextValue {
  const shared = useContext(FlowContext);
  const [state, dispatch] = useReducer(reducer, initialFlow);
  return shared ?? { state, dispatch };
}
