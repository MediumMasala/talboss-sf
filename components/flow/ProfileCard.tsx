"use client";

/* eslint-disable @next/next/no-img-element -- the person's own LinkedIn photo (signed same-origin proxy) and company logos */
import { m } from "framer-motion";
import { useState } from "react";
import type { Profile } from "@/lib/linkedin";
import { EASE_OUT, snap, travel } from "./motion";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

function Photo({ src, name }: { src: string; name: string }) {
  const [state, setState] = useState<"loading" | "ok" | "failed">(src ? "loading" : "failed");
  return (
    <div className="relative flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#ededed_0%,#9e9e9e_71%)]">
      <span className="text-[20px] font-medium leading-7 tracking-[-0.2px] text-white">{initials(name)}</span>
      {src && state !== "failed" ? (
        <img
          src={src}
          alt=""
          width={72}
          height={72}
          className={`absolute inset-0 size-full object-cover transition-opacity duration-500 ease-[var(--ease-out)] ${state === "ok" ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setState("ok")}
          onError={() => setState("failed")}
        />
      ) : null}
    </div>
  );
}

function Logo({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(!src);
  return (
    <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-s300">
      {failed ? (
        <span className="t-helper font-medium text-s1000">{(name.trim()[0] ?? "·").toUpperCase()}</span>
      ) : (
        <img src={src} alt="" width={28} height={28} referrerPolicy="no-referrer" className="size-full object-cover" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

/** Pulls a year range out of LinkedIn's duration when it has one; otherwise shows the duration as given. */
const when = (d: string) => d.replace(/\s*·.*$/, "");

/**
 * DS/Profile Card (Figma 3:244): 480 wide, padding 24, radius 24, 1 px #EBEBEB, shadow 0 8 12 @10 %.
 * Springs in (scale .96 → 1, y 24 → 0); the name arrives by shared layout from the answer trail; rows cascade 60 ms.
 * `filling`: a partial card (search data: no photo, no roles) whose full profile is still coming. The initials tile
 * stands in for the photo and two quiet skeleton rows hold the roles' place; when the full card replaces the profile
 * in place, the photo fades in over the initials and the real rows cascade in.
 */
export function ProfileCard({ profile, nameId, filling = false }: { profile: Profile; nameId?: string; filling?: boolean }) {
  const rows = profile.experience.slice(0, 3);
  return (
    <m.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={snap}
      className="flex w-full max-w-[480px] flex-col gap-5 short-phone:gap-4 rounded-[24px] border border-s300 bg-white p-6 text-left shadow-[0_8px_12px_rgba(0,0,0,0.1)]"
    >
      <div className="flex items-center gap-4">
        <Photo key={profile.photo} src={profile.photo} name={profile.fullname} />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <m.p layoutId={nameId} transition={travel} className="text-[20px] font-medium leading-7 tracking-[-0.2px] text-s1000">
            {profile.fullname}
          </m.p>
          {profile.headline ? <p className="t-sub line-clamp-2 text-s700">{profile.headline}</p> : null}
          {profile.location ? <p className="t-helper text-s600">{profile.location}</p> : null}
        </div>
      </div>
      {rows.length ? (
        <>
          <div className="h-px w-full bg-s300" />
          <ul className="flex flex-col gap-4 short-phone:gap-3">
            {rows.map((e, i) => (
              <m.li
                key={`${e.company}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.18 + i * 0.06 }}
                className="flex items-center gap-3"
              >
                <Logo src={e.logo} name={e.company} />
                <div className="min-w-0 flex-1 leading-5">
                  <p className="text-[14px] font-medium text-s1000">{e.title}</p>
                  <p className="t-helper truncate text-s700">{e.company}</p>
                </div>
                {e.duration ? <p className="t-helper shrink-0 text-right text-s600">{when(e.duration)}</p> : null}
              </m.li>
            ))}
          </ul>
        </>
      ) : filling ? (
        <>
          <div className="h-px w-full bg-s300" />
          <ul className="flex flex-col gap-4 short-phone:gap-3" aria-label="Loading roles" aria-busy>
            {[0.62, 0.46].map((w, i) => (
              <li key={i} className="flex items-center gap-3 motion-safe:animate-pulse">
                <div className="size-7 shrink-0 rounded-[8px] bg-s300" />
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 py-0.5">
                  <div className="h-3 rounded-full bg-s300" style={{ width: `${w * 100}%` }} />
                  <div className="h-2.5 rounded-full bg-s300" style={{ width: `${w * 60}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </m.div>
  );
}
