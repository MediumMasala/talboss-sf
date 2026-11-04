import type { CSSProperties } from "react";
import { BRIDGE, BRIDGE_TALL } from "./golden-gate-paths";

/**
 * The SF moment: the Golden Gate in its International Orange, drawing itself in, with fog rolling through
 * and a red sports car zipping across once it's built.
 * - "top": phones and tablets. A tall close-up behind the logo; the hero card sits on the deck.
 * - "horizon": computers. A wide bridge under the card.
 */
export function GoldenGate({ variant }: { variant: "top" | "horizon" }) {
  const art = variant === "top" ? BRIDGE_TALL : BRIDGE;
  // Same on-screen speed on both: the phone bridge is ~3x shorter, so the trip is too.
  const car = { "--road-y": art.road.y, "--road-len": art.road.length, "--car-time": variant === "top" ? "3.2s" : "7.5s", "--car-scale": variant === "top" ? 1 : 1.25 } as CSSProperties;
  return (
    <div aria-hidden="true" className={`gg gg-${variant}`}>
      <div className="gg-fog gg-fog-back" />
      <svg viewBox={art.viewBox} className="relative block h-auto w-full">
        <path className="gg-water" d={art.water} />
        <path className="gg-water gg-reflect" d={art.reflect} />
        <path className="gg-draw gg-deck" pathLength={1} d={art.deck} />
        <path className="gg-draw gg-sus" pathLength={1} d={art.suspenders} />
        <path className="gg-draw gg-cable" pathLength={1} d={art.cables} />
        <path className="gg-draw gg-tower" pathLength={1} d={art.towers} />
        <path className="gg-draw gg-tower" pathLength={1} d={art.piers} />
        {art.lights.map(([x, y]) => (
          <circle key={x} className="gg-light" cx={x} cy={y} r={variant === "top" ? 2.5 : 3.5} />
        ))}
        {/* On top of the bridge so no cable cuts across it. Red sports car, side-on, nose to the right: 56 long, wheels resting on y=0. */}
        <g className="gg-car" style={car}>
          <path className="gg-car-speed" d="M-6-10.5H-1M-13-7.5H-2M-9-4.5H-3" />
          <ellipse className="gg-car-shadow" cx={28} cy={-0.3} rx={27} ry={1.1} />
          <path
            className="gg-car-paint"
            d="M1-3.4C.4-5 .4-7 1-8.6L1.4-10.2 4-9.8C9-10 12-10.2 15-10.6 19-13 22-14.3 26-14.5L30-14.4C33.5-14.1 36-12.6 39.5-10.6 44-9.6 49-8.8 52.5-8 55-7.4 56.2-6 56-4.4L55-3.4H50.6A5.6 5.6 0 0 0 39.4-3.4H16.6A5.6 5.6 0 0 0 5.4-3.4Z"
          />
          <path className="gg-car-glass" d="M17.5-11.2C20.5-13 23-13.6 26-13.7L29.6-13.6C32.5-13.3 34.5-12.3 37-11Z" />
          <path className="gg-car-line" d="M19-6.4C26-6.9 32-7.3 38.8-7.8" />
          <circle className="gg-car-tyre" cx={11} cy={-4.4} r={4.4} />
          <circle className="gg-car-tyre" cx={45} cy={-4.4} r={4.4} />
          <circle className="gg-car-rim" cx={11} cy={-4.4} r={2.6} />
          <circle className="gg-car-rim" cx={45} cy={-4.4} r={2.6} />
          <circle className="gg-car-hub" cx={11} cy={-4.4} r={0.9} />
          <circle className="gg-car-hub" cx={45} cy={-4.4} r={0.9} />
          <ellipse className="gg-car-light" cx={54.6} cy={-6.6} rx={1} ry={0.7} />
          <rect className="gg-car-tail" x={0.6} y={-8.6} width={1.4} height={1.6} rx={0.4} />
        </g>
      </svg>
      <div className="gg-fog gg-fog-front" />
      <span className="hand-tag gg-tag">SAN FRANCISCO</span>
    </div>
  );
}
