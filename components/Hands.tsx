"use client";

import type { CSSProperties } from "react";
import { site } from "@/content/site";
import { useResumeFlow, type FlowStage } from "./resume-drop";

/** How far the hands have reached toward each other at each step of the upload. */
const REACH: Record<FlowStage, number> = { idle: 0, error: 0, matching: 0.6, done: 1 };

/**
 * FOUNDER from the upper left, YOU from the right at the card's height (kept clear of the bridge below).
 * They drift closer as the person moves through the upload.
 */
export function Hands({ reach, tags: tagsOverride }: { reach?: number; tags?: { left: string; right: string } } = {}) {
  const { state } = useResumeFlow();
  const style = { "--reach": reach ?? REACH[state.stage] } as CSSProperties;
  const tags = tagsOverride ?? site.hero.tags;

  return (
    // Desktop only: on a phone the card fills the width and the hands would only show as slivers.
    <div
      aria-hidden="true"
      style={style}
      className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden [--gap:300px] [--hand-w:min(42vw,640px)] [--left-rot:18deg] [--left-y:92px] [--right-rot:-8deg] [--right-y:150px] [--travel:22px] lg:block xl:[--travel:50px]"
    >
      <div className="hand hand-left">
        <picture>
          <source type="image/avif" srcSet="/img/hand-left-640.avif 640w, /img/hand-left-960.avif 960w" sizes="56vw" />
          <img src="/img/hand-left-960.webp" srcSet="/img/hand-left-640.webp 640w, /img/hand-left-960.webp 960w" sizes="56vw" alt="" width={960} height={476} />
        </picture>
      </div>
      <div className="hand hand-right">
        <picture>
          <source type="image/avif" srcSet="/img/hand-right-640.avif 640w, /img/hand-right-960.avif 960w" sizes="56vw" />
          <img src="/img/hand-right-960.webp" srcSet="/img/hand-right-640.webp 640w, /img/hand-right-960.webp 960w" sizes="56vw" alt="" width={960} height={476} />
        </picture>
      </div>
      <span className="hand-tag" style={{ right: "calc(50% + 400px)", top: "228px" }}>
        {tags.left}
      </span>
      <span className="hand-tag" style={{ left: "calc(50% + 420px)", top: "150px" }}>
        {tags.right}
      </span>
    </div>
  );
}
