"use client";

/* eslint-disable @next/next/no-img-element -- the person's own LinkedIn photo, shown only to them */
import { AnimatePresence, MotionGlobalConfig, m } from "framer-motion";
import { Fragment, useEffect, useMemo, useReducer, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import type { Profile } from "@/lib/linkedin";
import { checkResumeFile, formatBytes } from "@/lib/validation";
import { setMode, type Mode } from "./flow-store";
import { Photo } from "./Photo";
import * as previewData from "./preview";
import { cue } from "./sound";

const S = site.select;
const A = S.apply;
const E = A.email;
const errors = site.upload.errors;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const FIRST_POLL_MS = 300; // cache hits and "not me" answer on the first poll
const POLL_MS = 1700;
const GIVE_UP_MS = 120_000;
const PITCH_WAIT_MS = 6000;
const SLOW_MS = 6000; // when to say "This usually takes about 15 seconds"
const accept = [...site.upload.extensions, ...site.upload.mimeTypes].join(",");
const EASE = [0.22, 1, 0.36, 1] as const;

type Step = "you" | "manual" | "search" | "confirm" | "notFound" | "busy" | "pitch" | "resume" | "noResume" | "sending" | "done";
type LinkedInStatus = "confirmed" | "typed" | "skipped";
type Pitch = { text: string; source: "ai" | "fallback"; needsMore?: boolean; question?: string };
type Sharpen = "idle" | "loading" | "done";
type PitchState = "idle" | "loading" | "ready" | "failed";
type BusyCode = "rate_limited" | "daily_cap" | "search_down" | "offline";

/** Search stages as the API reports them. The index only ever goes up (Math.max). */
const STAGES = ["search", "people", "profile", "found"] as const;
const stageIndex = (stage: string) => Math.max(0, STAGES.indexOf(stage as (typeof STAGES)[number]));

type State = {
  step: Step;
  name: string;
  company: string;
  role: string;
  url: string;
  email: string;
  token: string | null;
  /** When each stage was first seen, in ms since the search began. Stages the server skipped stay empty. */
  marks: (number | undefined)[];
  stage: number;
  startedAt: number;
  next: string | null;
  profile: Profile | null;
  status: LinkedInStatus;
  file: { name: string; size: number } | null;
  sentEmail: string | null;
  saved: boolean;
  pitch: Pitch | null;
  pitchState: PitchState;
  answer: string;
  sharpen: Sharpen;
  prevPitch: string | null;
  error: string | null;
  busy: BusyCode;
  checkingNext: boolean;
  preview: boolean;
};

type Action =
  | { type: "field"; key: "name" | "company" | "role" | "url" | "email" | "answer"; value: string }
  | { type: "sharpen"; state: Sharpen; pitch?: Pitch | null }
  | { type: "go"; step: Step; error?: string | null }
  | { type: "busy"; code: BusyCode }
  | { type: "searching"; token: string; index: number; checkingNext?: boolean; restart?: boolean }
  | { type: "found"; profile: Profile; next: string | null }
  | { type: "status"; status: LinkedInStatus }
  | { type: "file"; file: { name: string; size: number } | null }
  | { type: "error"; message: string | null }
  | { type: "pitch"; state: PitchState; pitch?: Pitch | null }
  | { type: "saved" }
  | { type: "done"; email: string | null }
  | { type: "preview"; state: State };

const initial: State = {
  step: "you", name: "", company: "", role: "", url: "", email: "", token: null, marks: [], stage: 0, startedAt: 0,
  next: null, profile: null, status: "skipped", file: null, sentEmail: null, saved: false,
  pitch: null, pitchState: "idle", answer: "", sharpen: "idle", prevPitch: null, error: null, busy: "rate_limited", checkingNext: false, preview: false,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "field":
      return { ...s, [a.key]: a.value, error: null };
    case "go":
      return { ...s, step: a.step, error: a.error ?? null };
    case "searching": {
      const startedAt = a.restart ? Date.now() : s.startedAt;
      const marks = a.restart ? [] : [...s.marks];
      const index = a.restart ? a.index : Math.max(s.stage, a.index);
      if (marks[index] === undefined) marks[index] = Date.now() - startedAt;
      return { ...s, step: "search", token: a.token, marks, stage: index, startedAt, error: null, checkingNext: a.checkingNext ?? s.checkingNext };
    }
    case "found":
      return { ...s, step: "confirm", profile: a.profile, next: a.next, token: null, checkingNext: false };
    case "status":
      // Skipping after typing a link still keeps the link. A confirmed profile goes to its letter; everyone else to the resume step.
      return { ...s, status: a.status === "skipped" && s.url ? "typed" : a.status, step: a.status === "confirmed" ? "pitch" : "resume", error: null, token: null };
    case "file":
      return { ...s, file: a.file, error: null };
    case "error":
      return { ...s, error: a.message };
    case "pitch":
      return { ...s, pitchState: a.state, pitch: a.pitch === undefined ? s.pitch : a.pitch };
    case "busy":
      return { ...s, step: "busy", busy: a.code, token: null, error: null };
    case "sharpen":
      if (a.state === "done" && a.pitch) return { ...s, sharpen: "done", prevPitch: s.pitch?.text ?? null, pitch: a.pitch, error: null };
      return { ...s, sharpen: a.state === "done" ? "idle" : a.state };
    case "saved":
      return { ...s, saved: true };
    case "done":
      return { ...s, step: "done", sentEmail: a.email };
    case "preview":
      return a.state;
  }
}

const MODE: Record<Step, Mode> = {
  you: "frame", manual: "frame", search: "frame", confirm: "frame", notFound: "frame", busy: "frame",
  pitch: "letter", resume: "letter", noResume: "letter", sending: "letter", done: "done",
};
/** STEP n OF 4: you, LinkedIn, the letter, resume. */
const STEP_NO: Record<Step, number> = { you: 1, manual: 1, search: 2, confirm: 2, notFound: 2, busy: 2, pitch: 3, resume: 4, noResume: 4, sending: 4, done: 4 };

type Reply =
  | { state: "pending"; stage: string; token: string }
  | { state: "found"; profile: Profile; next: string | null }
  | { state: "not_found"; next: null }
  | { state: "error"; message: string; code?: string };

const busyCode = (r: Reply): BusyCode | null =>
  r.state === "error" && (r.code === "rate_limited" || r.code === "daily_cap" || r.code === "search_down" || r.code === "offline") ? r.code : null;

/** POST and read the reply. HTTP 502 means our search is down; 503 or no network means offline. Branch on code, never on text. */
async function post(url: string, body: unknown): Promise<Reply> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = (await res.json().catch(() => null)) as Reply | null;
    const fromStatus = res.status === 502 ? "search_down" : res.status === 503 ? "offline" : undefined;
    if (!data) return { state: "error", message: "", code: fromStatus ?? "offline" };
    if (data.state === "error" && !data.code && fromStatus) return { ...data, code: fromStatus };
    return data;
  } catch {
    return { state: "error", message: "", code: "offline" };
  }
}

async function fetchPitch(body: unknown): Promise<Pitch | null> {
  try {
    const r = await fetch("/api/pitch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) return null;
    const d = (await r.json()) as { pitch?: unknown; source?: unknown; needsMore?: unknown; question?: unknown };
    if (typeof d.pitch !== "string" || !d.pitch.trim()) return null;
    return {
      text: d.pitch.trim(),
      source: d.source === "ai" ? "ai" : "fallback",
      needsMore: d.needsMore === true,
      question: typeof d.question === "string" && d.question.trim() ? d.question.trim() : undefined,
    };
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** "4 May 2027": six months from today. */
export function untilDate(from = new Date()) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + 6);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------------------------------------------------- styles */
const input =
  "block h-12 w-full border-0 border-b border-ink/25 bg-transparent px-0 text-[17px] text-ink placeholder:text-ink/35 transition-[border-color,box-shadow] duration-[250ms] ease-[var(--ease-hover)] hover:border-ink/50 focus:border-ink focus:shadow-[0_1px_0_var(--ink)] focus:outline-none";
const inputDark =
  "block h-12 w-full border-0 border-b border-linen/30 bg-transparent px-0 text-[17px] text-linen placeholder:text-linen/40 transition-[border-color,box-shadow] duration-[250ms] ease-[var(--ease-hover)] hover:border-linen/60 focus:border-linen focus:shadow-[0_1px_0_var(--linen)] focus:outline-none";
const primary =
  "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-[3px] bg-lamp px-6 text-[15.5px] font-medium text-ink transition-[background-color,transform] duration-[250ms] ease-[var(--ease-hover)] hover:bg-[#ecb04f] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40";
const secondary =
  "inline-flex h-12 items-center justify-center rounded-[3px] border border-ink/25 px-5 text-[15px] text-ink transition-colors duration-[250ms] ease-[var(--ease-hover)] hover:border-ink";
const secondaryDark =
  "inline-flex h-12 shrink-0 items-center justify-center rounded-[3px] border border-linen/35 px-5 text-[15px] text-linen transition-colors duration-[250ms] ease-[var(--ease-hover)] hover:border-linen disabled:cursor-not-allowed disabled:opacity-40";
const textLink = "hairline text-[14.5px] text-ink-2 hover:text-ink";
const textLinkDark = "hairline text-[14.5px] text-linen/75 hover:text-linen";
const label = "t-mono mb-1 block text-ink-2";
const heading = "t-display text-[30px] leading-[1.05] text-ink outline-none sm:text-[34px]";
const hint = "mt-2 text-[15.5px] leading-[1.55] text-ink-2";

/* -------------------------------------------------------------- the stage */
export function Stage() {
  const [s, dispatch] = useReducer(reducer, initial);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickedFile = useRef<File | null>(null);
  const pitchReq = useRef<Promise<Pitch | null> | null>(null);
  const lastBody = useRef<Record<string, string> | null>(null);
  const lastStep = useRef<Step>("you");
  const polls = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [until, setUntil] = useState("");
  const mode = MODE[s.step];

  useEffect(() => setUntil(untilDate()), []);
  useEffect(() => setMode(mode), [mode]);

  // Dev-only review states: /?preview=you|search|confirm|notFound|rateLimited|dailyCap|searchDown|offline|pitch|sharpened|resume|noResume|sending|done
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const want = new URLSearchParams(window.location.search).get("preview");
    if (!want) return;
    const { PREVIEW_STEPS, mockPerson, mockProfile, mockPitch, mockAnswer, mockSharpened } = previewData;
    if (!(PREVIEW_STEPS as readonly string[]).includes(want)) return;
    // Headless screenshots starve requestAnimationFrame; jump every transition to its end state.
    MotionGlobalConfig.skipAnimations = true;
    const base: State = { ...initial, ...mockPerson, preview: true };
    const confirmed = { status: "confirmed" as const, profile: mockProfile, pitchState: "ready" as const, pitch: { text: mockPitch, source: "ai" as const, needsMore: true } };
    const states: Record<string, Partial<State>> = {
      you: {},
      search: { step: "search", startedAt: Date.now() - 9_000, marks: [0, 4200], stage: 1 },
      confirm: { step: "confirm", profile: mockProfile, next: "mock" },
      pitch: { step: "pitch", ...confirmed },
      sharpened: { step: "pitch", ...confirmed, answer: mockAnswer, sharpen: "done", prevPitch: mockPitch, pitch: { text: mockSharpened, source: "ai" } },
      notFound: { step: "notFound" },
      rateLimited: { step: "busy", busy: "rate_limited" },
      dailyCap: { step: "busy", busy: "daily_cap" },
      searchDown: { step: "busy", busy: "search_down" },
      offline: { step: "busy", busy: "offline" },
      resume: { step: "resume", ...confirmed },
      noResume: { step: "noResume", ...confirmed },
      sending: { step: "sending", ...confirmed, file: { name: "jordan-avery-resume.pdf", size: 214_000 } },
      done: { step: "done", ...confirmed, sentEmail: "jordan@example.com", saved: true, answer: mockAnswer, pitch: { text: mockSharpened, source: "ai" } },
    };
    pitchReq.current = Promise.resolve(confirmed.pitch);
    dispatch({ type: "preview", state: { ...base, ...states[want] } });
  }, []);

  // Each new step: focus its heading. A change of mode brings the stage's top into view; on phones a new card step brings the card back.
  useEffect(() => {
    if (lastStep.current === s.step) return;
    const prevMode = MODE[lastStep.current];
    lastStep.current = s.step;
    const behavior = reduced() ? "auto" : "smooth";
    if (prevMode !== mode) {
      const top = stageRef.current?.getBoundingClientRect().top ?? 0;
      if (Math.abs(top) > 4) window.scrollTo({ top: window.scrollY + top, behavior });
      // Focus after the dissolve so a screen reader lands on the new frame.
      const t = setTimeout(() => headingRef.current?.focus({ preventScroll: true }), mode === "done" ? 1200 : 700);
      return () => clearTimeout(t);
    }
    headingRef.current?.focus({ preventScroll: true });
    if (mode === "letter") {
      // The next step sits under the letter, below the fold: once it has mounted (after the 220 ms exit), bring its heading up and focus it.
      const t = setTimeout(() => {
        const h = headingRef.current;
        if (!h) return;
        const r = h.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight * 0.85) h.scrollIntoView({ behavior, block: "center" });
        h.focus({ preventScroll: true });
      }, reduced() ? 0 : 240);
      return () => clearTimeout(t);
    }
    const r = cardRef.current?.getBoundingClientRect();
    if (r && window.innerWidth < 1024 && (r.top < 0 || r.top > window.innerHeight * 0.5)) cardRef.current?.scrollIntoView({ behavior, block: "start" });
  }, [s.step, mode]);

  // The two-note phrase as the title card appears.
  useEffect(() => {
    if (s.step === "done" && !s.preview) cue("phrase");
  }, [s.step, s.preview]);

  // Poll the lookup while it runs.
  useEffect(() => {
    if (s.step !== "search" || !s.token || s.preview) return;
    const token = s.token;
    const delay = polls.current++ === 0 ? FIRST_POLL_MS : POLL_MS;
    const timer = setTimeout(async () => {
      if (Date.now() - s.startedAt > GIVE_UP_MS) {
        track("select_lookup_failed", { reason: "timeout" });
        dispatch({ type: "go", step: "notFound" });
        return;
      }
      let reply: Reply;
      try {
        reply = (await (await fetch(`/api/linkedin/poll?t=${encodeURIComponent(token)}`)).json()) as Reply;
      } catch {
        reply = { state: "pending", stage: "", token };
      }
      if (reply.state === "pending") {
        dispatch({ type: "searching", token: reply.token, index: reply.stage ? stageIndex(reply.stage) : 0 });
      } else if (reply.state === "found") {
        track("select_lookup_found", { score: reply.profile.score, seconds: Math.round((Date.now() - s.startedAt) / 1000) });
        // "Getting it ready for you to check" for a beat: it's true, and it makes the card's arrival legible.
        dispatch({ type: "searching", token: "", index: 3 });
        await sleep(450);
        dispatch({ type: "found", profile: reply.profile, next: reply.next });
      } else {
        const code = busyCode(reply);
        track("select_lookup_failed", { reason: code ?? reply.state });
        dispatch(code ? { type: "busy", code } : { type: "go", step: "notFound" });
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [s.step, s.token, s.startedAt, s.preview]);

  const pitchBody = (extra: Record<string, unknown> = {}) => {
    const profile = s.status === "confirmed" ? s.profile : null;
    return { name: profile?.fullname || s.name, company: s.company, role: s.role, ...(profile ? { profile } : {}), ...extra };
  };

  // Ask for the letter as soon as we know who it's about: on "Yes, that's me", or at the resume step.
  useEffect(() => {
    if ((s.step !== "pitch" && s.step !== "resume" && s.step !== "noResume") || pitchReq.current) return;
    dispatch({ type: "pitch", state: "loading" });
    pitchReq.current = (s.preview ? sleep(1200).then(() => null) : fetchPitch(pitchBody())).then((p) => {
      dispatch({ type: "pitch", state: p ? "ready" : "failed", pitch: p });
      return p;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s.step, s.preview]);

  const sharpen = async (e: FormEvent) => {
    e.preventDefault();
    const answer = s.answer.trim();
    if (!answer || s.sharpen === "loading") return;
    dispatch({ type: "sharpen", state: "loading" });
    const p = s.preview
      ? await sleep(900).then(() => ({ text: previewData.mockSharpened, source: "ai" as const }))
      : await Promise.race([fetchPitch(pitchBody({ answer })), sleep(PITCH_WAIT_MS).then(() => null)]);
    if (p) pitchReq.current = Promise.resolve(p);
    dispatch({ type: "sharpen", state: "done", pitch: p });
    if (!p) return dispatch({ type: "error", message: E.error });
    // Their words are in the letter (highlighted just above); carry on to the resume step underneath it.
    dispatch({ type: "go", step: "resume" });
  };

  const begin = async (body: Record<string, string>) => {
    polls.current = 0;
    lastBody.current = body;
    dispatch({ type: "searching", token: "", index: body.url ? 2 : 0, restart: true, checkingNext: false });
    const reply = await post("/api/linkedin/start", body);
    const code = busyCode(reply);
    if (reply.state === "pending") dispatch({ type: "searching", token: reply.token, index: stageIndex(reply.stage) });
    else if (code) dispatch({ type: "busy", code });
    else dispatch({ type: "go", step: body.url ? "manual" : "notFound", error: reply.state === "error" ? reply.message || null : null });
  };

  const submitYou = (e: FormEvent) => {
    e.preventDefault();
    if (s.name.trim().length < 2 || s.company.trim().length < 2) return dispatch({ type: "error", message: A.you.missing });
    track("select_lookup_started", {});
    if (s.preview) return dispatch({ type: "searching", token: "", index: 0, restart: true });
    begin({ name: s.name.trim(), company: s.company.trim(), role: s.role.trim() });
  };

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    if (s.name.trim().length < 2 || s.company.trim().length < 2) return dispatch({ type: "error", message: A.you.missing });
    const url = s.url.trim().replace(/^(?!https?:\/\/)/, "https://");
    if (!/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^/?#]+/i.test(url)) return dispatch({ type: "error", message: A.you.badUrl });
    dispatch({ type: "field", key: "url", value: url });
    track("select_lookup_started", { manual: true });
    if (s.preview) return dispatch({ type: "searching", token: "", index: 2, restart: true });
    begin({ name: s.name.trim(), company: s.company.trim(), role: s.role.trim(), url });
  };

  const notMe = async () => {
    track("select_profile_rejected", {});
    if (!s.next) return dispatch({ type: "go", step: "notFound", error: A.confirm.outOfProfiles });
    dispatch({ type: "searching", token: "", index: 2, restart: true, checkingNext: true });
    polls.current = 0;
    if (s.preview) return;
    const reply = await post("/api/linkedin/profile", { next: s.next });
    const code = busyCode(reply);
    if (reply.state === "pending") dispatch({ type: "searching", token: reply.token, index: 2, checkingNext: true });
    else if (code) dispatch({ type: "busy", code });
    else dispatch({ type: "go", step: "notFound", error: A.confirm.outOfProfiles });
  };

  const pick = (files: FileList | null) => {
    if (!files?.length) return;
    if (files.length > 1) return dispatch({ type: "error", message: errors.multiple });
    const file = files[0];
    const check = checkResumeFile(file);
    if (!check.ok) {
      track("resume_rejected", { source: "select", reason: check.reason });
      return dispatch({ type: "error", message: check.message });
    }
    pickedFile.current = file;
    track("resume_selected", { source: "select" });
    dispatch({ type: "file", file: { name: file.name, size: file.size } });
  };

  const send = async (via: "resume" | "email") => {
    const file = via === "resume" ? pickedFile.current : null;
    const email = via === "email" ? s.email.trim() : null;
    if (via === "resume" && !file) return fileRef.current?.click();
    if (via === "email") {
      if (!email) return dispatch({ type: "error", message: A.noResume.emailMissing });
      if (!EMAIL_RE.test(email)) return dispatch({ type: "error", message: A.noResume.emailInvalid });
    }
    const back: Step = via === "resume" ? "resume" : "noResume";
    dispatch({ type: "go", step: "sending" });

    if (s.preview) {
      await sleep(1600);
      dispatch({ type: "saved" });
      await sleep(500);
      return dispatch({ type: "done", email: email ?? "jordan@example.com" });
    }

    const pitch = await Promise.race([pitchReq.current ?? Promise.resolve(null), sleep(PITCH_WAIT_MS).then(() => null)]);
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(UTM_KEYS.flatMap((k) => (params.get(k) ? [[k, params.get(k)!]] : [])));
    const body = new FormData();
    if (file) body.append("resume", file);
    body.append("utm", JSON.stringify(utm));
    body.append(
      "application",
      JSON.stringify({
        name: s.profile?.fullname || s.name,
        company: s.company,
        designation: s.role,
        linkedinUrl: (s.status === "confirmed" && s.profile?.url) || (s.status === "typed" ? s.url : ""),
        linkedinStatus: s.status,
        linkedinProfile: s.status === "confirmed" ? s.profile : null,
        ...(email ? { email } : {}),
        pitch: pitch?.text ?? null,
        pitchSource: pitch?.source ?? null,
      }),
    );
    const minWait = sleep(1400);
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; email?: string | null; error?: string } | null;
      await minWait;
      if (!res.ok || !data?.ok) {
        track("upload_failed", { source: "select", status: res.status });
        return dispatch({ type: "go", step: back, error: res.status === 413 ? errors.tooBigForServer : data?.error ?? errors.server });
      }
      track("resume_uploaded", { source: "select", resume: Boolean(file), email_found: Boolean(data.email), linkedin: s.status, pitch: Boolean(pitch) });
      dispatch({ type: "saved" });
      await sleep(450);
      dispatch({ type: "done", email: data.email ?? email ?? null });
    } catch {
      await minWait;
      dispatch({ type: "go", step: back, error: errors.network });
    }
  };

  const onDrag = (e: DragEvent, over: boolean) => {
    if (s.step !== "resume" || !e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    setDragging(over);
  };

  const fullName = (s.profile?.fullname || s.name).trim();
  const first = fullName.split(/\s+/)[0] ?? "";
  const Presence = s.preview ? Fragment : AnimatePresence;
  const presence = s.preview ? {} : { mode: "wait" as const, initial: false };
  const reveal = (d: number) =>
    s.preview
      ? {}
      : { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: d, ease: EASE } }, exit: { opacity: 0, transition: { duration: 0.45, ease: EASE } } };
  const panel = s.preview
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
        exit: { opacity: 0, transition: { duration: 0.22 } },
      };

  return (
    <section
      ref={stageRef}
      id="apply"
      aria-label={S.hero.word}
      data-preview={s.preview || undefined}
      data-mode={mode}
      onDragOver={(e) => onDrag(e, true)}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onDrag(e, false);
      }}
      onDrop={(e) => {
        onDrag(e, false);
        if (s.step === "resume" && e.dataTransfer.files.length) pick(e.dataTransfer.files);
      }}
      className="relative"
    >
      <Presence {...presence}>
        {mode === "frame" && (
          <m.div key="frame" {...reveal(0.8)} className="relative lg:min-h-[max(100svh,800px)]">
            {/* The opening frame: a photograph and one word. */}
            <div className="relative aspect-[4/5] overflow-hidden md:aspect-[2.39/1] lg:absolute lg:inset-0 lg:aspect-auto">
              <Photo k="window" priority pushIn tallOnPhone className="absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-7 sm:px-8 lg:px-14 lg:pr-[540px] lg:pb-16">
                <TitleLines preview={s.preview} />
              </div>
            </div>
            <div ref={cardRef} data-form-card className="relative z-10 scroll-mt-4 px-4 pt-5 pb-12 sm:px-8 lg:absolute lg:right-14 lg:bottom-16 lg:w-[436px] lg:p-0">
              <div className="paper rounded-[3px] px-6 pt-5 pb-6 sm:px-8 sm:pt-6 sm:pb-8">
                <p className="t-mono mb-5 flex justify-between text-ink-2" aria-hidden="true">
                  <span>{S.steps.label(STEP_NO[s.step], 4)}</span>
                  <span>{S.steps.names[STEP_NO[s.step] - 1]}</span>
                </p>
                <div aria-live="polite">
                  <Presence {...presence}>
                    {s.step === "you" && (
                      <m.form key="you" {...panel} onSubmit={submitYou} noValidate className="group/you">
                        <LiveName name={s.name} headingRef={headingRef} />
                        <p className={`${hint} mt-4 mb-5`}>{A.you.hint}</p>
                        <div className="space-y-4">
                          {(["name", "company", "role"] as const).map((k) => (
                            <Field key={k} id={`apply-${k}`} label={A.you.fields[k].label}>
                              <input
                                className={input}
                                id={`apply-${k}`}
                                name={k}
                                value={s[k]}
                                onChange={(e) => dispatch({ type: "field", key: k, value: e.target.value })}
                                placeholder={A.you.fields[k].placeholder}
                                autoComplete={k === "name" ? "name" : k === "company" ? "organization" : "organization-title"}
                                required={k !== "role"}
                                maxLength={80}
                              />
                            </Field>
                          ))}
                        </div>
                        <ErrorText message={s.error} />
                        <button type="submit" className={`${primary} mt-6`}>
                          {A.you.cta}
                          <Arrow />
                        </button>
                        <p className="mt-4 text-center">
                          <button type="button" className={textLink} onClick={() => dispatch({ type: "go", step: "manual" })}>
                            {A.you.manual}
                          </button>
                        </p>
                      </m.form>
                    )}

                    {s.step === "manual" && (
                      <m.form key="manual" {...panel} onSubmit={submitManual} noValidate>
                        <Head title={A.you.manualLabel} headingRef={headingRef} />
                        <div className="mt-4 space-y-4">
                          {(["name", "company"] as const).map((k) => (
                            <Field key={k} id={`apply-m-${k}`} label={A.you.fields[k].label}>
                              <input
                                className={input}
                                id={`apply-m-${k}`}
                                value={s[k]}
                                onChange={(e) => dispatch({ type: "field", key: k, value: e.target.value })}
                                placeholder={A.you.fields[k].placeholder}
                                autoComplete={k === "name" ? "name" : "organization"}
                                maxLength={80}
                              />
                            </Field>
                          ))}
                          <Field id="apply-url" label={A.you.manualLabel}>
                            <input
                              className={`${input} font-mono text-[15px]`}
                              id="apply-url"
                              inputMode="url"
                              autoComplete="url"
                              value={s.url}
                              onChange={(e) => dispatch({ type: "field", key: "url", value: e.target.value })}
                              placeholder={A.you.manualPlaceholder}
                            />
                          </Field>
                        </div>
                        <ErrorText message={s.error} />
                        <button type="submit" className={`${primary} mt-6`}>
                          {A.you.manualCta}
                          <Arrow />
                        </button>
                        <div className="mt-4 flex flex-wrap justify-between gap-x-4 gap-y-2">
                          <button type="button" className={textLink} onClick={() => dispatch({ type: "go", step: "you" })}>
                            {A.you.cta}
                          </button>
                          <button type="button" className={textLink} onClick={() => dispatch({ type: "status", status: "skipped" })}>
                            {A.notFound.skip}
                          </button>
                        </div>
                      </m.form>
                    )}

                    {s.step === "search" && (
                      <m.div key="search" {...panel}>
                        <Search s={s} headingRef={headingRef} onSkip={() => dispatch({ type: "status", status: "skipped" })} />
                      </m.div>
                    )}

                    {s.step === "confirm" && s.profile && (
                      <m.div key={`confirm-${s.profile.slug}`} {...panel}>
                        <Head title={A.confirm.title} sub={A.confirm.hint} headingRef={headingRef} />
                        <CastingCard profile={s.profile} />
                        <button
                          type="button"
                          className={`${primary} mt-6`}
                          onClick={() => {
                            track("select_profile_confirmed", { score: s.profile!.score });
                            cue("note");
                            dispatch({ type: "status", status: "confirmed" });
                          }}
                        >
                          {A.confirm.yes}
                        </button>
                        <div className="mt-3 flex items-center justify-between gap-4">
                          <button type="button" className={secondary} onClick={notMe}>
                            {A.confirm.no}
                          </button>
                          <button type="button" className={textLink} onClick={() => dispatch({ type: "go", step: "manual" })}>
                            {A.confirm.manual}
                          </button>
                        </div>
                      </m.div>
                    )}

                    {s.step === "notFound" && (
                      <m.div key="notFound" {...panel}>
                        <Head title={A.notFound.title} sub={s.error || A.notFound.body} headingRef={headingRef} />
                        <button type="button" className={`${primary} mt-6`} onClick={() => dispatch({ type: "go", step: "manual" })}>
                          {A.notFound.manual}
                          <Arrow />
                        </button>
                        <p className="mt-4 text-center">
                          <button type="button" className={textLink} onClick={() => dispatch({ type: "status", status: "skipped" })}>
                            {A.notFound.skip}
                          </button>
                        </p>
                      </m.div>
                    )}

                    {s.step === "busy" && (
                      <m.div key={`busy-${s.busy}`} {...panel}>
                        <Busy
                          code={s.busy}
                          headingRef={headingRef}
                          onManual={() => dispatch({ type: "go", step: "manual" })}
                          onSkip={() => dispatch({ type: "status", status: "skipped" })}
                          onRetry={() => (lastBody.current ? begin(lastBody.current) : dispatch({ type: "go", step: "you" }))}
                        />
                      </m.div>
                    )}
                  </Presence>
                </div>
              </div>
            </div>
          </m.div>
        )}

        {mode === "letter" && (
          <m.div key="letter" {...reveal(0.8)} className="grain relative min-h-svh overflow-hidden bg-forest px-4 pt-24 pb-20 sm:px-8 sm:pt-28">
            <div className="relative z-10 mx-auto max-w-[660px]">
              <p className="t-mono mb-5 flex justify-between text-linen/60" aria-hidden="true">
                <span>{S.steps.label(STEP_NO[s.step], 4)}</span>
                <span>{S.steps.names[STEP_NO[s.step] - 1]}</span>
              </p>
              <h2 ref={s.step === "pitch" ? headingRef : undefined} tabIndex={-1} className="mb-6 text-[19px] leading-[1.5] text-linen outline-none sm:text-[21px]">
                {E.introReadOnly}
              </h2>
              <Letter s={s} name={fullName} preview={s.preview} />
              <div aria-live="polite">
                <Presence {...presence}>
                  {s.step === "pitch" && (
                    <m.div key="pitch" {...panel} className="mt-10">
                      <Sharpen s={s} onChange={(v) => dispatch({ type: "field", key: "answer", value: v })} onSubmit={sharpen} />
                      <ErrorText message={s.error} dark />
                      <button type="button" className={`${primary} mt-8 sm:w-auto sm:min-w-[260px]`} disabled={!s.pitch && s.pitchState !== "failed"} onClick={() => dispatch({ type: "go", step: "resume" })}>
                        {E.keep}
                        <Arrow />
                      </button>
                    </m.div>
                  )}

                  {s.step === "resume" && (
                    <m.div key="resume" {...panel} className="mt-12">
                      <h2 ref={headingRef} tabIndex={-1} className="t-display text-[34px] leading-[1.05] text-linen outline-none sm:text-[40px]">
                        {A.resume.title}
                      </h2>
                      <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.6] text-linen/75">{A.resume.hint}</p>
                      <input
                        ref={fileRef}
                        id="tal-resume"
                        type="file"
                        accept={accept}
                        className="peer sr-only"
                        aria-describedby={s.error ? "resume-error" : undefined}
                        onChange={(e) => {
                          pick(e.target.files);
                          e.target.value = "";
                        }}
                      />
                      <label
                        htmlFor="tal-resume"
                        data-dragging={dragging || undefined}
                        data-file={s.file ? true : undefined}
                        className="mt-6 flex min-h-[112px] flex-col items-center justify-center gap-1 rounded-[3px] border border-dashed border-linen/35 px-5 py-6 text-center transition-colors duration-[250ms] ease-[var(--ease-hover)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-lamp hover:border-linen/70 data-[dragging]:border-lamp data-[file]:border-solid data-[file]:border-linen/50"
                      >
                        {s.file ? (
                          <>
                            <span className="text-[16px] text-linen">{s.file.name}</span>
                            <span className="t-mono text-linen/55">{formatBytes(s.file.size)}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-[16px] text-linen">{dragging ? site.upload.idle.dragging : A.resume.drop}</span>
                            <span className="t-mono text-linen/55">{site.upload.idle.hint}</span>
                          </>
                        )}
                      </label>
                      <ErrorText id="resume-error" message={s.error} dark />
                      <button type="button" className={`${primary} mt-6`} disabled={!s.file} onClick={() => send("resume")}>
                        {A.resume.cta}
                        <Arrow />
                      </button>
                      <p className="mt-5 text-center">
                        <button
                          type="button"
                          className={textLinkDark}
                          onClick={() => {
                            pickedFile.current = null;
                            dispatch({ type: "file", file: null });
                            dispatch({ type: "go", step: "noResume" });
                          }}
                        >
                          {s.status === "skipped" ? A.noResume.linkNoLinkedIn : A.noResume.link}
                        </button>
                      </p>
                      <Consent />
                    </m.div>
                  )}

                  {s.step === "noResume" && (
                    <m.form
                      key="noResume"
                      {...panel}
                      noValidate
                      onSubmit={(e) => {
                        e.preventDefault();
                        send("email");
                      }}
                      className="mt-12"
                    >
                      <h2 ref={headingRef} tabIndex={-1} className="t-display text-[34px] leading-[1.05] text-linen outline-none sm:text-[40px]">
                        {A.noResume.title}
                      </h2>
                      <p className="mt-3 max-w-[52ch] text-[16px] leading-[1.6] text-linen/75">{A.noResume.hint}</p>
                      <div className="mt-6">
                        <label htmlFor="apply-email" className="t-mono mb-1 block text-linen/60">
                          {A.noResume.emailLabel}
                        </label>
                        <input
                          className={inputDark}
                          id="apply-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={s.email}
                          onChange={(e) => dispatch({ type: "field", key: "email", value: e.target.value })}
                          placeholder={A.noResume.emailPlaceholder}
                          maxLength={120}
                        />
                      </div>
                      <ErrorText message={s.error} dark />
                      <button type="submit" className={`${primary} mt-6`}>
                        {A.noResume.cta}
                        <Arrow />
                      </button>
                      <p className="mt-5 text-center">
                        <button type="button" className={textLinkDark} onClick={() => dispatch({ type: "go", step: "resume" })}>
                          {A.noResume.back}
                        </button>
                      </p>
                      <Consent />
                    </m.form>
                  )}

                  {s.step === "sending" && (
                    <m.div key="sending" {...panel} className="mt-12">
                      <Sending s={s} headingRef={headingRef} />
                    </m.div>
                  )}
                </Presence>
              </div>
            </div>
          </m.div>
        )}

        {mode === "done" && (
          <m.div key="done" {...reveal(1.2)} className="relative min-h-[max(100svh,720px)] overflow-hidden">
            <Photo k="sfFog" priority pushIn tallOnPhone className="absolute inset-0" />
            <div className="relative z-10 flex min-h-[max(100svh,720px)] flex-col justify-end px-4 pt-28 pb-10 sm:px-8 lg:px-14 lg:pb-16">
              <h2 ref={headingRef} tabIndex={-1} className="t-name max-w-[14ch] text-[clamp(56px,11vw,168px)] leading-[0.95] text-linen outline-none [text-wrap:balance]">
                {fullName}
              </h2>
              <p className="t-mono mt-5 text-linen/85">{A.done.credit(until || untilDate())}</p>
              <div className="mt-8 max-w-[46ch] space-y-2 text-[17px] leading-[1.6] text-linen sm:text-[18px]">
                <p>{A.done.next(first)}</p>
                <p>{s.sentEmail ? A.done.email(s.sentEmail) : A.done.noEmail}</p>
                <p>{A.done.private}</p>
              </div>
            </div>
          </m.div>
        )}
      </Presence>
    </section>
  );
}

/* ---------------------------------------------------------------- pieces */

/** "Talent", then the sentence, fading up line by line (700 ms, 120 ms stagger). CSS, so it runs before hydration. */
function TitleLines({ preview }: { preview: boolean }) {
  const rise = preview ? "" : "rise";
  return (
    <>
      <h1 className={`t-display ${rise} text-[clamp(84px,17vw,250px)] leading-[0.86] text-linen`} style={{ animationDelay: "150ms" }}>
        {S.hero.word}
      </h1>
      <p className={`${rise} mt-4 max-w-[44ch] text-[17px] leading-[1.55] text-linen/90 sm:text-[19px] lg:mt-6`} style={{ animationDelay: "270ms" }}>
        {S.hero.sub}
      </p>
    </>
  );
}

/** The name, set as a title card keystroke by keystroke. The placeholder dims on first focus; the letters never lag. */
function LiveName({ name, headingRef }: { name: string; headingRef: React.Ref<HTMLHeadingElement> }) {
  const n = name.trim().length;
  const typed = n > 0;
  const size = n <= 13 ? 44 : Math.max(28, 44 - (n - 13) * 1.4);
  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="relative min-h-[50px] outline-none" style={{ fontSize: size }}>
        <span className="sr-only">{A.you.fields.name.label}</span>
        <span
          aria-hidden="true"
          className={`t-name absolute inset-x-0 bottom-0 block truncate text-ink/30 transition-opacity duration-[600ms] ease-[var(--ease-film)] group-focus-within/you:text-ink/20 ${typed ? "opacity-0" : "opacity-100"}`}
        >
          {A.you.nameEmpty}
        </span>
        <span aria-hidden="true" className={`t-name relative block truncate pb-[2px] text-ink ${typed ? "opacity-100" : "opacity-0"}`}>
          {name.trim() || " "}
        </span>
      </h2>
      <p className="t-mono mt-2 text-ink-2">{A.you.credit}</p>
    </div>
  );
}

function Head({ title, sub, headingRef }: { title: string; sub?: string; headingRef?: React.Ref<HTMLHeadingElement> }) {
  return (
    <div>
      <h2 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className={heading}>
        {title}
      </h2>
      {sub && <p className={hint}>{sub}</p>}
    </div>
  );
}

function Field({ id, label: text, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      {children}
    </div>
  );
}

function ErrorText({ message, id, dark }: { message: string | null; id?: string; dark?: boolean }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={`mt-4 text-[14.5px] leading-snug ${dark ? "text-[#f0b9a6]" : "text-danger"}`}>
      {message}
    </p>
  );
}

const BUSY = { rate_limited: A.rateLimited, daily_cap: A.dailyCap, search_down: A.searchDown } as const;

function Busy({ code, headingRef, onManual, onSkip, onRetry }: { code: BusyCode; headingRef: React.Ref<HTMLHeadingElement>; onManual: () => void; onSkip: () => void; onRetry: () => void }) {
  if (code === "offline") {
    const c = A.offline;
    return (
      <>
        <Head title={c.title} sub={c.body} headingRef={headingRef} />
        <button type="button" className={`${primary} mt-6`} onClick={onRetry}>
          {c.retry}
        </button>
        <p className="mt-4 text-center">
          <button type="button" className={textLink} onClick={onManual}>
            {c.manual}
          </button>
        </p>
      </>
    );
  }
  const c = BUSY[code];
  return (
    <>
      <Head title={c.title} sub={c.body} headingRef={headingRef} />
      <button type="button" className={`${primary} mt-6`} onClick={onManual}>
        {c.manual}
        <Arrow />
      </button>
      <p className="mt-4 text-center">
        <button type="button" className={textLink} onClick={onSkip}>
          {c.skip}
        </button>
      </p>
    </>
  );
}

/** Finding you: only the stages the server really reported, each with the time it began. */
function Search({ s, headingRef, onSkip }: { s: State; headingRef: React.Ref<HTMLHeadingElement>; onSkip: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = now - s.startedAt;
  const shown = STAGES.map((key, i) => ({ key, i, at: s.marks[i] })).filter((x) => x.at !== undefined);
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 ref={headingRef} tabIndex={-1} className={`t-name truncate text-ink outline-none ${s.checkingNext ? "text-[26px] leading-[1.15] whitespace-normal" : "text-[34px]"}`}>
            {s.checkingNext ? A.confirm.trying : s.name.trim()}
          </h2>
          {!s.checkingNext && <p className="t-mono mt-2 truncate text-ink-2">{[s.company.trim(), s.role.trim()].filter(Boolean).join(" · ")}</p>}
        </div>
        <span className="t-mono pt-2 tabular-nums text-ink-2" aria-hidden="true">
          {clock(elapsed)}
        </span>
      </div>
      <p className="sr-only">{A.search.srLabel}</p>
      <ol className="mt-6 border-t border-ink/15">
        {shown.map(({ key, i, at }) => {
          const active = i === s.stage;
          return (
            <li key={key} className="flex items-baseline gap-3 border-b border-ink/15 py-3 font-mono text-[12.5px] leading-[1.4] text-ink">
              <span aria-hidden="true" className={`w-3 shrink-0 ${active ? "breathe text-lamp-deep" : "text-moss"}`}>
                {active ? "●" : "✓"}
              </span>
              <span className={`flex-1 ${active ? "text-ink" : "text-ink-2"}`}>{A.search.stages[key]}</span>
              <span className="tabular-nums text-ink-2">{clock(at!)}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className={`text-[14px] text-ink-2 transition-opacity duration-700 ${elapsed > SLOW_MS ? "opacity-100" : "opacity-0"}`}>{A.search.wait}</span>
        <button type="button" className={textLink} onClick={onSkip}>
          {A.search.skip}
        </button>
      </div>
    </div>
  );
}

/** "Is this you?", set like a casting card. It arrives like a print developing. */
function CastingCard({ profile }: { profile: Profile }) {
  const exp = profile.experience.slice(0, 3);
  return (
    <div className="develop mt-5 border-y border-ink/15 py-5">
      <div className="flex items-start gap-4">
        {profile.photo ? (
          <img src={profile.photo} alt="" referrerPolicy="no-referrer" width={72} height={90} className="h-[90px] w-[72px] shrink-0 rounded-[2px] object-cover" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="t-name text-[34px] leading-[1.02] text-ink">{profile.fullname}</p>
          {profile.location && <p className="t-mono mt-2 text-ink-2">{profile.location}</p>}
        </div>
      </div>
      {profile.headline && <p className="mt-4 text-[15px] leading-[1.5] text-ink [overflow-wrap:anywhere]">{profile.headline}</p>}
      {exp.length > 0 && (
        <ul className="mt-4 space-y-2.5">
          {exp.map((e, i) => (
            <li key={`${e.company}-${i}`} className="text-[14px] leading-snug">
              <span className="block text-ink [overflow-wrap:anywhere]">
                {e.title}
                <span className="text-ink-2">, {e.company}</span>
              </span>
              {e.duration && <span className="mt-0.5 block font-mono text-[11.5px] text-ink-2">{e.duration}</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 font-mono text-[11.5px] break-all text-ink-2">{profile.url.replace(/^https?:\/\/(www\.)?/, "")}</p>
    </div>
  );
}

/**
 * Types the finished draft at a human pace: word by word, about 35 ms a character, small pauses at commas and full stops,
 * done within 2.5 s whatever the length. Instant under reduced motion and in previews.
 */
function useTypewriter(text: string, instant: boolean) {
  const words = useMemo(() => text.split(/(\s+)/), [text]);
  const [shown, setShown] = useState(instant ? words.length : 0);
  useEffect(() => {
    if (instant || MotionGlobalConfig.skipAnimations || reduced()) return setShown(words.length);
    const raw: number[] = [];
    let t = 0;
    for (const w of words) {
      t += w.trim() ? w.length * 35 : 0;
      if (/[.!?]$/.test(w)) t += 260;
      else if (/[,;:]$/.test(w)) t += 120;
      raw.push(t);
    }
    const scale = t > 2500 ? 2500 / t : 1;
    const times = raw.map((x) => x * scale);
    setShown(0);
    let id = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const e = now - t0;
      let n = 0;
      while (n < times.length && times[n] <= e) n++;
      setShown(n);
      if (n < times.length) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [words, instant]);
  return { words, shown, typing: shown < words.length };
}

/** The letter, on paper: To, From, Subject, the two sentences, the signature, and the rule about sending. */
function Letter({ s, name, preview }: { s: State; name: string; preview: boolean }) {
  const pitch = s.pitch;
  const { words, shown, typing } = useTypewriter(pitch?.text ?? "", preview || s.step !== "pitch");
  const fresh = s.prevPitch ? answerSpans(words, s.answer) : new Set<number>();
  const role = s.role.trim() || (s.status === "confirmed" ? s.profile?.experience[0]?.title : "") || "";
  const company = s.company.trim() || s.profile?.currentCompany || "";
  const rewriting = s.sharpen === "loading";

  // Group consecutive highlighted tokens into one marked passage.
  const body: ReactNode[] = [];
  let run: string[] = [];
  const flush = (key: number) => {
    if (!run.length) return;
    body.push(
      <span key={`h${key}`} className="own-words">
        <span className="sr-only">{E.highlightLabel}: </span>
        {run.join("")}
      </span>,
    );
    run = [];
  };
  words.slice(0, shown).forEach((w, i) => {
    if (fresh.has(i)) run.push(w);
    else {
      flush(i);
      body.push(<Fragment key={i}>{w}</Fragment>);
    }
  });
  flush(words.length);

  const row = "grid grid-cols-[76px_1fr] items-baseline gap-3 py-1.5";
  return (
    <article className="paper relative rounded-[2px] px-6 pt-7 pb-8 sm:px-12 sm:pt-10 sm:pb-12">
      <span className="t-mono absolute top-5 right-6 text-ink-2 sm:top-7 sm:right-10">{E.draftTag}</span>
      <dl className="border-b border-ink/15 pb-5 text-[15px]">
        <div className={row}>
          <dt className="t-mono text-ink-2">{E.toLabel}</dt>
          <dd className="text-ink">{E.toLine}</dd>
        </div>
        <div className={row}>
          <dt className="t-mono text-ink-2">{E.fromLabel}</dt>
          <dd className="text-ink">{E.from}</dd>
        </div>
        <div className={row}>
          <dt className="t-mono text-ink-2">{E.subjectLabel}</dt>
          <dd className="font-medium text-ink">{E.subject(name, role, company)}</dd>
        </div>
      </dl>
      <div className={`mt-7 min-h-[130px] transition-opacity duration-300 ${rewriting ? "opacity-45" : ""}`}>
        {pitch ? (
          <p className="t-display text-[22px] leading-[1.5] tracking-[-0.005em] text-ink sm:text-[25px]">
            {body}
            {typing && <span className="caret" aria-hidden="true" />}
          </p>
        ) : s.pitchState === "failed" ? null : (
          <p className="t-mono text-ink-2">
            <span className="breathe">{E.drafting}</span>
          </p>
        )}
        {rewriting && <p className="t-mono breathe mt-4 text-lamp-deep">{E.rewriting}</p>}
      </div>
      <p className={`t-name mt-8 text-[24px] text-ink transition-opacity duration-700 ${pitch && !typing ? "opacity-100" : "opacity-0"}`}>{E.signature}</p>
      <p className="mt-8 border-t border-ink/15 pt-4 text-[13.5px] leading-[1.5] text-ink-2">
        {s.prevPitch ? `${E.rewritten} ` : pitch?.source === "fallback" ? `${E.fallbackNote} ` : ""}
        {E.sendNote}
      </p>
    </article>
  );
}

/** The one question, when one sentence would make the letter better. */
function Sharpen({ s, onChange, onSubmit }: { s: State; onChange: (v: string) => void; onSubmit: (e: FormEvent) => void }) {
  if (!s.pitch || !s.pitch.needsMore || s.sharpen === "done") return null;
  const loading = s.sharpen === "loading";
  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="t-mono text-linen/60">{s.status === "confirmed" ? E.needsMoreLinkedIn : E.needsMoreThin}</p>
      <label htmlFor="apply-answer" className="t-display mt-3 block text-[28px] leading-[1.15] text-linen sm:text-[32px]">
        {E.question}
      </label>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <input
          id="apply-answer"
          className={`${inputDark} min-w-0 flex-1`}
          value={s.answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder={E.placeholder}
          maxLength={200}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button type="submit" disabled={!s.answer.trim() || loading} className={secondaryDark}>
          {loading ? E.rewriting : E.submit}
        </button>
      </div>
    </form>
  );
}

/** What's actually happening while the application posts. Lines only ever fill top-down. */
function Sending({ s, headingRef }: { s: State; headingRef: React.Ref<HTMLHeadingElement> }) {
  const lines = A.resume.sending;
  const pitchDone = s.pitchState === "ready" || s.pitchState === "failed";
  const raw = [s.saved, s.saved, s.saved && pitchDone];
  const done = raw.map((_, i) => raw.slice(0, i + 1).every(Boolean));
  const firstOpen = done.indexOf(false);
  const sub = s.file ? `${s.file.name} · ${formatBytes(s.file.size)}` : s.email;
  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1} className="sr-only">
        {lines[0]}
      </h2>
      <ol className="border-t border-linen/15">
        {lines.map((line, i) => {
          const state = done[i] ? "done" : i === firstOpen ? "active" : "todo";
          return (
            <li key={line} className={`flex items-baseline gap-3 border-b border-linen/15 py-3.5 font-mono text-[13px] ${state === "todo" ? "text-linen/35" : "text-linen"}`}>
              <span aria-hidden="true" className={`w-3 shrink-0 ${state === "active" ? "breathe text-lamp" : "text-linen/70"}`}>
                {state === "done" ? "✓" : state === "active" ? "●" : "·"}
              </span>
              <span className="flex-1">{line}</span>
              {i === 0 && sub && <span className="hidden truncate text-linen/50 sm:block">{sub}</span>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Consent() {
  const { privacyUrl, termsUrl } = site.legal;
  const c = site.upload.consent;
  return (
    <p className="mt-6 text-center text-[13px] leading-relaxed text-linen/55">
      {c.before}{" "}
      <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="hairline hairline-on text-linen/80 hover:text-linen">
        {c.privacy}
      </a>{" "}
      {c.and}{" "}
      <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="hairline hairline-on text-linen/80 hover:text-linen">
        {c.terms}
      </a>
      .
    </p>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const STOP = new Set(
  "a an and are as at be but by for from has have i in into is it its of on or our so that the their them they this to was we were with my me".split(" "),
);
const stem = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(ing|ed|es|s)$/, "");

/**
 * Which word tokens (indices into the split draft) came from the typed answer: at most two runs of consecutive words,
 * at least two content words each, never a lone stopword. The highlight marks the person's own idea, not a diff.
 */
function answerSpans(tokens: string[], answer: string): Set<number> {
  const from = new Set(answer.split(/\s+/).map(stem).filter(Boolean));
  const runs: number[][] = [];
  let run: number[] = [];
  const weak = (i: number) => !/\S/.test(tokens[i]) || STOP.has(tokens[i].toLowerCase().replace(/[^a-z]/g, ""));
  const close = () => {
    while (run.length && weak(run[0])) run.shift();
    while (run.length && weak(run[run.length - 1])) run.pop();
    if (run.filter((i) => !weak(i)).length >= 2) runs.push(run);
    run = [];
  };
  tokens.forEach((t, i) => {
    if (!/\S/.test(t)) return run.length ? run.push(i) : undefined;
    const st = stem(t);
    const lower = t.toLowerCase().replace(/[^a-z]/g, "");
    if (st && (from.has(st) || (STOP.has(lower) && run.length))) run.push(i);
    else close();
  });
  close();
  return new Set(runs.sort((a, b) => b.length - a.length).slice(0, 2).flat());
}
