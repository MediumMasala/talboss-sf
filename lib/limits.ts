/**
 * Lookup limits, counted in KV (approximate: KV counters aren't atomic, which is fine at this scale).
 * Only PAID lookups count: a cached name + company never touches these counters.
 *
 *   per network (IP)       30 discovery lookups / hour   (one office behind one egress IP still works)
 *   per network + name      3 / hour                     (the same person retrying, or a script on one name)
 *   pasted LinkedIn link   30 / hour per network          (separate, so the paste-link fallback works when the above trip)
 *   global, all traffic   300 discovery lookups / day     (the real cost guard: ≈ $0.07 each, so ≈ $21/day worst case)
 */
import { sha, type LookupInput } from "./linkedin";

export const LIMITS = { ipPerHour: 30, ipNamePerHour: 3, urlIpPerHour: 30, paidLookupsPerDay: 300 } as const;

export type Block = { code: "rate_limited" | "daily_cap"; message: string; retryAfter: number };
type Counter = { key: string; limit: number; ttl: number; block: Block };

const hour = () => Math.floor(Date.now() / 3_600_000);
const toNextHour = () => 3600 - Math.floor((Date.now() % 3_600_000) / 1000);
const day = () => new Date().toISOString().slice(0, 10);
const toNextDay = () => 86_400 - Math.floor((Date.now() % 86_400_000) / 1000);

export const MESSAGES = {
  network: "Tal is getting a lot of requests right now. Paste your LinkedIn link instead, or try again in a few minutes.",
  name: "You've searched for this name a few times this hour. Paste your LinkedIn link instead.",
  url: "Tal is getting a lot of profile links right now. Skip this step; Tal will find you from your resume or email.",
  daily: "Tal has reached today's limit for automatic LinkedIn searches. Paste your LinkedIn link instead, or skip this step.",
};

/** Check every counter first; count only if all pass. Returns the first block that applies, most specific first. */
async function take(kv: KVNamespace | undefined, counters: Counter[]): Promise<Block | null> {
  if (!kv) return null;
  const counts = await Promise.all(counters.map((c) => kv.get(c.key).then((v) => Number(v ?? 0)).catch(() => 0)));
  const hit = counters.findIndex((c, i) => counts[i] >= c.limit);
  if (hit >= 0) return counters[hit].block;
  await Promise.all(counters.map((c, i) => kv.put(c.key, String(counts[i] + 1), { expirationTtl: c.ttl }).catch(() => {})));
  return null;
}

/** Before a paid name search. */
export async function gateSearch(kv: KVNamespace | undefined, ip: string, input: LookupInput, limits = LIMITS): Promise<Block | null> {
  const who = await sha(`${input.name}|${input.company}`.toLowerCase());
  const h = hour();
  return take(kv, [
    { key: `rl:lookup-name:${ip}:${who}:${h}`, limit: limits.ipNamePerHour, ttl: 3700, block: { code: "rate_limited", message: MESSAGES.name, retryAfter: toNextHour() } },
    { key: `rl:lookup-ip:${ip}:${h}`, limit: limits.ipPerHour, ttl: 3700, block: { code: "rate_limited", message: MESSAGES.network, retryAfter: toNextHour() } },
    { key: `cap:lookups:${day()}`, limit: limits.paidLookupsPerDay, ttl: 2 * 86_400, block: { code: "daily_cap", message: MESSAGES.daily, retryAfter: toNextDay() } },
  ]);
}

/** Before pulling one pasted profile (≈ $0.005, so it has its own bucket and skips the daily cap). */
export async function gateUrl(kv: KVNamespace | undefined, ip: string, limits = LIMITS): Promise<Block | null> {
  return take(kv, [{ key: `rl:lookup-url:${ip}:${hour()}`, limit: limits.urlIpPerHour, ttl: 3700, block: { code: "rate_limited", message: MESSAGES.url, retryAfter: toNextHour() } }]);
}
