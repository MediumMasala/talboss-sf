import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// The social card in the page's own language: paper, a field of the network, one blue "you" with three intro lines.
export const alt = site.select.og.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export default async function OpengraphImage() {
  const r = rng(11);
  const clusters = Array.from({ length: 7 }, () => ({ x: 640 + r() * 520, y: 40 + r() * 550, s: 30 + r() * 60 }));
  const dots = Array.from({ length: 900 }, () => {
    const c = clusters[Math.floor(r() * clusters.length)];
    const g = () => (r() + r() + r() - 1.5) * 1.6;
    return r() < 0.2 ? { x: 600 + r() * 600, y: r() * 630 } : { x: c.x + g() * c.s, y: c.y + g() * c.s };
  }).filter((d) => d.x > 600 && d.x < 1196 && d.y > 4 && d.y < 626);
  const you = { x: 850, y: 360 };
  const targets = [
    { x: 760, y: 220 },
    { x: 1040, y: 250 },
    { x: 980, y: 500 },
  ];
  const { line: headline, sub } = site.select.og;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#f4f2ec", color: "#0e0e0c" }}>
        {dots.map((d, i) => (
          <div key={i} style={{ position: "absolute", left: d.x, top: d.y, width: 3, height: 3, background: "#8a8577" }} />
        ))}
        <svg width="1200" height="630" viewBox="0 0 1200 630" style={{ position: "absolute", left: 0, top: 0 }}>
          {targets.map((t, i) => (
            <line key={i} x1={you.x} y1={you.y} x2={t.x} y2={t.y} stroke="#2b3cff" strokeWidth="2" />
          ))}
        </svg>
        {targets.map((t, i) => (
          <div key={`t${i}`} style={{ position: "absolute", left: t.x - 7, top: t.y - 7, width: 14, height: 14, background: "#2b3cff" }} />
        ))}
        <div style={{ position: "absolute", left: you.x - 22, top: you.y - 22, width: 44, height: 44, borderRadius: 22, border: "2px solid #2b3cff", display: "flex" }} />
        <div style={{ position: "absolute", left: you.x - 9, top: you.y - 9, width: 18, height: 18, borderRadius: 9, background: "#2b3cff" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600, padding: "64px 0 64px 72px" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: 40 }}>
            <span style={{ fontWeight: 700, letterSpacing: -2 }}>tal</span>
            <span style={{ marginLeft: 8, fontStyle: "italic" }}>Select</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 68, lineHeight: 1.02, letterSpacing: -2.5, fontWeight: 600 }}>{headline}</div>
            <div style={{ marginTop: 24, fontSize: 28, color: "#6f6b62" }}>{sub}</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
