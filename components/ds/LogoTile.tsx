/* eslint-disable @next/next/no-img-element -- a 27 px SVG mark, no optimisation to gain */
import Link from "next/link";
import { site } from "@/content/site";

/** DS/Logo Tile (Figma 2:63): white tile, radius 12, soft shadow, the tal logo v2 inside. 44.64 px desktop, 40 px phone. */
export function LogoTile({ href = "/", size = "auto" }: { href?: string; size?: "auto" | "sm" }) {
  const box = size === "sm" ? "size-10 rounded-[10.75px]" : "size-10 rounded-[10.75px] md:size-[44.64px] md:rounded-[12px]";
  return (
    <Link
      href={href}
      prefetch={false}
      aria-label={site.select.topBar.wordmarkLabel}
      className={`${box} flex shrink-0 items-center justify-center bg-white shadow-[0_4px_6px_rgba(0,0,0,0.14)] transition-transform duration-200 ease-[var(--ease-out)] hover:-translate-y-px`}
    >
      <img src="/ds/tal-logo.svg" alt="" width={27} height={17} className="h-[14.9px] w-[24.2px] md:h-[16.6px] md:w-[27px]" />
    </Link>
  );
}

/** The same mark as a small round avatar (chat card). */
export function TalAvatar({ className = "" }: { className?: string }) {
  return (
    <span className={`flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] ${className}`} aria-hidden>
      <img src="/ds/tal-logo.svg" alt="" width={18} height={11} className="h-[11px] w-[18px]" />
    </span>
  );
}
