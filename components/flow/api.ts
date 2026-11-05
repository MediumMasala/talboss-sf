/** Browser side of docs/team/API.md. Branch on `code`, never on the message. */
import type { Profile } from "@/lib/linkedin";

/** Poll timings (ms since the A2 start of the job). For analytics only. */
export type Timings = { first?: number; attach?: number; full?: number; src?: string; cache?: number };

export type Reply =
  | { state: "pending"; stage: string; token: string; retracted?: true; timings?: Timings }
  | {
      state: "found"; profile: Profile; next: string | null;
      /** Only with `partial: true` on start. true = search data only (no photo, no roles): keep polling with `token`. */
      partial?: boolean; token?: string; retracted?: true; timings?: Timings;
    }
  | { state: "not_found"; next: null; retracted?: true; timings?: Timings }
  | { state: "error"; message: string; code?: string; retryAfter?: number };

export type BusyCode = "rate_limited" | "daily_cap" | "search_down" | "offline";

export const busyCode = (r: Reply): BusyCode | null =>
  r.state === "error" && (r.code === "rate_limited" || r.code === "daily_cap" || r.code === "search_down" || r.code === "offline") ? r.code : null;

/** POST and read the reply. 502 → search down; 503 or no network → offline. */
export async function post(url: string, body: unknown): Promise<Reply> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => null)) as Reply | null;
    const fromStatus = res.status === 502 ? "search_down" : res.status === 503 ? "offline" : undefined;
    if (!data) return { state: "error", message: "", code: fromStatus ?? "offline" };
    if (data.state === "error" && !data.code && fromStatus) return { ...data, code: fromStatus };
    if (data.state === "error" && res.status === 429 && !data.retryAfter) {
      const ra = Number(res.headers.get("retry-after"));
      if (ra > 0) return { ...data, retryAfter: ra };
    }
    return data;
  } catch {
    return { state: "error", message: "", code: "offline" };
  }
}

export async function poll(token: string): Promise<Reply> {
  try {
    return (await (await fetch(`/api/linkedin/poll?t=${encodeURIComponent(token)}`)).json()) as Reply;
  } catch {
    return { state: "pending", stage: "", token };
  }
}

/** Search stages in the order the server reports them. Progress only ever goes up (Math.max). */
export const STAGES = ["search", "people", "profile", "found"] as const;
export const stageIndex = (stage: string) => Math.max(0, STAGES.indexOf(stage as (typeof STAGES)[number]));

/**
 * Honest progress for "Finding you on LinkedIn": each real stage the poll reports sets a floor
 * (search 8 %, people 45 %, profile 74 %, found 100 %), and within a stage the bar eases toward the next floor
 * (time constant 5 s, never more than 85 % of the gap), so it moves while it waits but never claims a stage it hasn't reached.
 */
const FLOORS = [0.08, 0.45, 0.74, 1];
export function searchProgress(stage: number, msInStage: number) {
  if (stage >= 3) return 1;
  const a = FLOORS[stage];
  const b = FLOORS[stage + 1];
  return a + (b - a) * 0.85 * (1 - Math.exp(-msInStage / 5000));
}

export const LINKEDIN_RE = /^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^/?#\s]+/i;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

/** "4 May 2027": six months from today. */
export function untilDate(from = new Date()) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 6);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
