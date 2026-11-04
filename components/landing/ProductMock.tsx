"use client";

/* eslint-disable @next/next/no-img-element -- local DS assets */
import { useRef } from "react";
import { site } from "@/content/site";
import { useSeen } from "./useSeen";

const M = site.select.mock;

function Tile() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-[8.6px] bg-white shadow-[0_2.9px_4.3px_rgba(0,0,0,0.14)]">
      <img src="/ds/tal-logo.svg" alt="" width={19} height={12} className="h-[11.9px] w-[19.4px]" />
    </span>
  );
}

/**
 * DS/Product Mock · Roles (19:923): silver panel, a phone running Tal, and the "Intro sent" notification.
 * Parallax (CSS scroll-driven, `animation-timeline: view()`): the phone floats y +36 → −36 px and the highlight
 * drifts x −30 % → 30 % across the card's pass through the viewport; browsers without scroll timelines get it still.
 * When half in view: the three "Yes" pills pop (scale 1 → 1.12 → 1, 500 ms, 140 ms apart, from 500 ms) and the
 * notification drops in at 1.1 s (y −24 → 0 on an overshoot curve, 620 ms). 480 × 600; scaled to 310 wide on phones.
 */
export function ProductMock() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useSeen(ref, 0.5);

  return (
    <div ref={ref} className={`mock relative mx-auto aspect-[4/5] w-[310px] shrink-0 md:w-[480px] ${seen ? "is-on" : ""}`}>
      <div className="absolute inset-0 origin-top-left scale-[0.6458] md:scale-100" style={{ width: 480, height: 600 }}>
        <div className="relative h-[600px] w-[480px] overflow-hidden rounded-[24px] bg-[linear-gradient(180deg,#f5f5f5,#d4d4d4)]">
          <img src="/ds/mock-highlight.svg" alt="" aria-hidden className="mock-glare absolute -left-5 -top-[220px] size-[520px] max-w-none" />
          <div className="mock-phone absolute left-[90px] top-0">
            <span className="absolute left-0 top-[168px] h-7 w-[3px] rounded-[1.5px] bg-s600" />
            <span className="absolute left-0 top-[216px] h-[52px] w-[3px] rounded-[1.5px] bg-s600" />
            <span className="absolute left-0 top-[276px] h-[52px] w-[3px] rounded-[1.5px] bg-s600" />
            <span className="absolute left-[297px] top-[228px] h-20 w-[3px] rounded-[1.5px] bg-s600" />
            <div className="absolute left-0.5 top-12 h-[612px] w-[296px] overflow-hidden rounded-[52px] border-2 border-[#d9d9d9] bg-[#111] shadow-[0_24px_48px_rgba(0,0,0,0.22)]">
              <div className="absolute left-1.5 top-1.5 flex h-[596px] w-[280px] flex-col gap-5 overflow-hidden rounded-[44px] bg-[#0b0b0b] p-4">
                <div className="flex items-center justify-between px-3">
                  <p className="text-[14px] font-semibold leading-5 text-white">9:41</p>
                  <span className="h-6 w-[84px] rounded-[12px] bg-black" />
                  <span className="flex items-end gap-0.5" aria-hidden>
                    {[4, 6, 8, 10].map((h) => (
                      <span key={h} className="w-[3px] rounded-[1px] bg-white" style={{ height: h }} />
                    ))}
                    <span className="h-2.5 w-[22px] rounded-[3px] bg-white" />
                  </span>
                </div>
                <div className="flex items-center gap-2.5 pt-1">
                  <Tile />
                  <div className="leading-4">
                    <p className="text-[15px] font-semibold leading-5 tracking-[-0.1px] text-white">{M.who}</p>
                    <p className="text-[12px] text-white/56">{M.role}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-medium uppercase leading-4 tracking-[0.8px] text-white/48">{M.eyebrow}</p>
                  <p className="text-[22px] font-semibold leading-7 tracking-[-0.5px] text-white">{M.title}</p>
                </div>
                <ul className="flex flex-col overflow-hidden rounded-[20px] border border-white/12 bg-white/6">
                  {M.roles.map((r, i) => (
                    <li key={r.title} className={`flex items-center gap-2.5 py-3.5 pl-3.5 pr-3 ${i ? "border-t border-white/12" : ""}`}>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium leading-5 tracking-[-0.1px] text-white">{r.title}</p>
                        <p className="text-[12px] leading-4 text-white/64">{r.company}</p>
                        <p className="pt-1.5">
                          <span className="inline-block rounded-full border border-white/12 bg-white/8 px-2 py-0.5 text-[11px] font-medium leading-4 text-white/72">{r.where}</span>
                        </p>
                      </div>
                      <span className="mock-yes rounded-full bg-white px-3.5 py-1.5 text-[12px] font-medium leading-4 text-[#111]" style={{ animationDelay: `${500 + i * 140}ms` }}>
                        {M.yes}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="mock-notice absolute left-[196px] top-[22px] flex w-[264px] items-start gap-3 rounded-[20px] border border-s400 bg-white/94 py-3.5 pl-3.5 pr-4 shadow-[0_10px_24px_rgba(0,0,0,0.14)] backdrop-blur-md">
            <Tile />
            <div className="min-w-0 flex-1">
              <div className="flex justify-between leading-[18px]">
                <p className="text-[13px] font-semibold text-s1000">{M.notice.who}</p>
                <p className="text-[12px] text-s600">{M.notice.when}</p>
              </div>
              <p className="text-[13px] font-medium leading-[18px] text-s1000">{M.notice.title}</p>
              <p className="text-[12px] leading-4 text-s700">{M.notice.body}</p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @supports (animation-timeline: view()) {
          .mock-phone { animation: mock-float linear both; animation-timeline: view(); animation-range: cover; }
          .mock-glare { animation: mock-glare linear both; animation-timeline: view(); animation-range: cover; }
        }
        @keyframes mock-float { from { transform: translateY(36px); } to { transform: translateY(-36px); } }
        @keyframes mock-glare { from { transform: translateX(-30%); } to { transform: translateX(30%); } }
        .mock-notice { opacity: 0; transform: translateY(-24px); transition: opacity 400ms var(--ease-out) 1.1s, transform 620ms cubic-bezier(.34,1.56,.64,1) 1.1s; }
        .mock.is-on .mock-notice { opacity: 1; transform: none; }
        .mock-yes { opacity: .55; }
        .mock.is-on .mock-yes { animation: mock-yes 500ms var(--ease-out) both; }
        @keyframes mock-yes { 0% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.12); } 100% { opacity: 1; transform: scale(1); } }
        @media (prefers-reduced-motion: reduce) {
          .mock-phone, .mock-glare { animation: none !important; }
          .mock-notice { opacity: 1; transform: none; transition: none; }
          .mock-yes { opacity: 1; animation: none !important; }
        }
      `}</style>
    </div>
  );
}
