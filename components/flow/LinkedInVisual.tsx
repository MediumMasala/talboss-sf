/* eslint-disable @next/next/no-img-element -- local DS asset */

/**
 * The "Finding you on LinkedIn" visual (Figma 2:494): a 104 px #222 tile with a white "in", radius 24,
 * shadow 0 10 24 @14 %, and the silver magnifier. While `searching`, the magnifier sweeps a slow loop
 * (2.8 s, ease-in-out, transform only) and a light band crosses the tile every 2.2 s.
 */
export function LinkedInVisual({ searching = false }: { searching?: boolean }) {
  return (
    <div className="relative h-[152px] w-[200px] shrink-0" aria-hidden>
      <div className="absolute left-12 top-4 flex size-[104px] items-center justify-center overflow-hidden rounded-[24px] bg-s1000 pt-1.5 shadow-[0_10px_24px_rgba(0,0,0,0.14)]">
        <span className="text-[64px] font-bold leading-[64px] tracking-[-2.5px] text-white">in</span>
        {searching ? <span className="li-scan absolute inset-y-0 -left-full w-full" /> : null}
      </div>
      <div className={`absolute left-[122px] top-[82px] size-16 ${searching ? "li-sweep" : ""}`}>
        <img src="/ds/magnifier.svg" alt="" className="absolute -left-[6.25%] top-0 h-[110.16%] w-[110.16%] max-w-none" />
      </div>
      <style>{`
        .li-scan { background: linear-gradient(100deg, transparent 30%, rgba(255,255,255,.18) 50%, transparent 70%); animation: li-scan 2.2s var(--ease-io) infinite; }
        @keyframes li-scan { to { transform: translateX(200%); } }
        .li-sweep { animation: li-sweep 2.8s ease-in-out infinite; }
        @keyframes li-sweep { 0%,100% { transform: translate(0,0) rotate(0deg); } 25% { transform: translate(-10px,-9px) rotate(-6deg); } 50% { transform: translate(-16px,-2px) rotate(-2deg); } 75% { transform: translate(-6px,4px) rotate(4deg); } }
        @media (prefers-reduced-motion: reduce) { .li-scan, .li-sweep { animation: none; } }
      `}</style>
    </div>
  );
}
