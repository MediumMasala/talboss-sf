// Server only (node:fs): imported by the BehindTal server component, never by a client component.
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * The per-function counts on the numbers wall (BehindTal). Read at render time on the server:
 * `content/network.json` (written by the data lane, with the SQL in docs/team/NETWORK_NUMBERS.md) when it exists,
 * else `content/network.placeholder.json` (same shape, every value a dash).
 *
 * Guard: only a clean, rounded figure ever renders ("48,000+", "12K+", "1.2K+"). Anything else (missing, a raw
 * count, a sentence, "—") renders as a dash. A row without a label is dropped. Nothing here is ever typed by hand.
 */
export type NetworkStat = { key: string; label: string; display: string; real: boolean };

const CLEAN = /^\d{1,3}(,\d{3})*(\.\d)?\s?[KkM]?\+$/;

type Raw = { functions?: { key?: unknown; label?: unknown; display?: unknown }[]; placeholder?: unknown };

function read(file: string): Raw | null {
  try {
    return JSON.parse(readFileSync(join(process.cwd(), "content", file), "utf8")) as Raw;
  } catch {
    return null;
  }
}

export function networkStats(): { stats: NetworkStat[]; source: "network.json" | "placeholder" } {
  const real = read("network.json");
  const raw = real?.functions?.length ? real : read("network.placeholder.json");
  const source = real?.functions?.length ? "network.json" : "placeholder";
  const stats = (raw?.functions ?? [])
    .filter((f) => typeof f.label === "string" && f.label.trim())
    .map((f, i) => {
      const display = typeof f.display === "string" ? f.display.trim() : "";
      const ok = source === "network.json" && raw?.placeholder !== true && CLEAN.test(display);
      return { key: typeof f.key === "string" ? f.key : `f${i}`, label: (f.label as string).trim(), display: ok ? display : "—", real: ok };
    });
  return { stats, source };
}
