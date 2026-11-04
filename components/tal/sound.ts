"use client";

import { useSyncExternalStore } from "react";

/**
 * Sound: off by default, one toggle, remembered per viewer. Nothing is fetched or played until it's on.
 * Room tone loops quietly; the felt-piano note and the two-note phrase play only on their two moments.
 * Files are original, normalised to -24 LUFS (docs/team/ASSETS.md). Opus first, AAC for Safari builds without it.
 */
const KEY = "tal:sound";
let on = false;
let hydrated = false;
let room: HTMLAudioElement | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

const src = (name: "room" | "note" | "phrase") => {
  const probe = document.createElement("audio");
  return probe.canPlayType('audio/ogg; codecs="opus"') ? `/sound/${name}.opus` : `/sound/${name}.m4a`;
};

function fade(a: HTMLAudioElement, to: number, ms: number, done?: () => void) {
  const from = a.volume;
  const t0 = performance.now();
  const step = (t: number) => {
    const k = Math.min(1, (t - t0) / ms);
    a.volume = from + (to - from) * k;
    if (k < 1) requestAnimationFrame(step);
    else done?.();
  };
  requestAnimationFrame(step);
}

function startRoom() {
  if (!room) {
    room = new Audio(src("room"));
    room.loop = true;
    room.preload = "auto";
  }
  room.volume = 0;
  room.play().then(() => room && fade(room, 0.75, 1800)).catch(() => {
    // Autoplay refused (a remembered "on" with no gesture yet): start on the first tap or key.
    const go = () => {
      window.removeEventListener("pointerdown", go);
      window.removeEventListener("keydown", go);
      if (on) startRoom();
    };
    window.addEventListener("pointerdown", go, { once: true });
    window.addEventListener("keydown", go, { once: true });
  });
}

export function setSound(next: boolean) {
  on = next;
  try {
    localStorage.setItem(KEY, next ? "on" : "off");
  } catch {}
  if (next) startRoom();
  else if (room) {
    const r = room;
    fade(r, 0, 500, () => r.pause());
  }
  emit();
}

/** Play one of the two moments. Silent unless sound is on. */
export function cue(name: "note" | "phrase") {
  if (!on) return;
  const a = new Audio(src(name));
  a.volume = 0.9;
  a.play().catch(() => {});
}

function subscribe(f: () => void) {
  subs.add(f);
  if (!hydrated) {
    hydrated = true;
    let saved = false;
    try {
      saved = localStorage.getItem(KEY) === "on";
    } catch {}
    if (saved) queueMicrotask(() => setSound(true));
  }
  return () => subs.delete(f);
}

export const useSound = () => useSyncExternalStore(subscribe, () => on, () => false);
