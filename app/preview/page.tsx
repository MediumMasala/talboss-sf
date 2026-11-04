import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = { title: "Preview · Tal", robots: { index: false } };

/** Every screen, in Figma order. `state` is read by the flow's ?state= preview (development only). */
const SCREENS: [string, string][] = [
  ["/", "Landing"],
  ["/start?state=A1", "A1 Name"],
  ["/start?state=A2", "A2 Company"],
  ["/start?state=A3", "A3 Title"],
  ["/start?state=A4", "A4 Finding you"],
  ["/start?state=A5", "A5 Is this you?"],
  ["/start?state=notfound", "A5b Not found"],
  ["/start?state=ratelimited", "A5b Rate limited"],
  ["/start?state=dailycap", "A5b Daily cap"],
  ["/start?state=link", "Paste link"],
  ["/start?state=searchdown", "Search down"],
  ["/start?state=offline", "Offline"],
  ["/start?state=A6", "A6 Resume"],
  ["/start?state=sending", "A6 Saving"],
  ["/start?state=A6b", "A6b Email"],
  ["/start?state=A7", "A7 Done"],
  ["/start?state=noemail", "A6b No email on the resume"],
];

/**
 * Dev-only contact sheet: every screen at 1440 × 900 and 390 × 844 in iframes.
 * /preview?w=390&s=3 shows one screen (index into SCREENS) at full size; add &bare=1 for a frameless capture
 * (headless Chrome can't make a window narrower than 500 px, so scripts/shots.sh captures 390 through this iframe).
 */
export default async function Preview({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  if (process.env.NODE_ENV !== "development") notFound();
  const q = await searchParams;
  if (q.s !== undefined) {
    const [src, name] = SCREENS[Number(q.s)] ?? SCREENS[0];
    const w = Number(q.w) || 1440;
    const h = Number(q.h) || (w < 600 ? 844 : 900);
    return (
      <div style={q.bare ? { margin: 0 } : { background: "#e5e5e5", minHeight: "100vh", padding: 24 }}>
        <iframe title={name} src={src} width={w} height={h} scrolling={q.bare ? "no" : undefined} style={{ border: 0, display: "block", background: "#fff" }} />
      </div>
    );
  }
  return (
    <main style={{ background: "#e5e5e5", minHeight: "100vh", padding: 32, fontFamily: "system-ui", color: "#222" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Tal US · every screen (1440 · 390)</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(700px, 1fr))", gap: 32 }}>
        {SCREENS.map(([src, name], i) => (
          <section key={src}>
            <p style={{ fontSize: 13, marginBottom: 8 }}>
              <a href={`/preview?s=${i}`}>{name}</a> · <a href={`/preview?s=${i}&w=390`}>390</a> · <code>{src}</code>
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ width: 480, height: 300, overflow: "hidden", borderRadius: 8, background: "#fff" }}>
                <iframe title={`${name} 1440`} src={src} width={1440} height={900} loading="lazy" style={{ border: 0, transform: "scale(0.3333)", transformOrigin: "0 0" }} />
              </div>
              <div style={{ width: 195, height: 422, overflow: "hidden", borderRadius: 8, background: "#fff" }}>
                <iframe title={`${name} 390`} src={src} width={390} height={844} loading="lazy" style={{ border: 0, transform: "scale(0.5)", transformOrigin: "0 0" }} />
              </div>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
