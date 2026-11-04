"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/** How far along the application someone is (0 → 1). The hands reach closer as it grows. */
type Ctx = { reach: number; setReach: (n: number) => void };
const ProgressContext = createContext<Ctx | null>(null);

export function SelectProgressProvider({ children }: { children: ReactNode }) {
  const [reach, setReach] = useState(0);
  const value = useMemo(() => ({ reach, setReach }), [reach]);
  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useSelectProgress(): Ctx {
  return useContext(ProgressContext) ?? { reach: 0, setReach: () => {} };
}
