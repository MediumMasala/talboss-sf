"use client";

import { AnimatePresence, MotionGlobalConfig, m } from "framer-motion";
import { createPortal } from "react-dom";
import { Fragment, useEffect, useReducer, useRef, useState, type DragEvent, type FormEvent, type ReactNode } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import type { Profile } from "@/lib/linkedin";
import { checkResumeFile, formatBytes } from "@/lib/validation";
import { r2 } from "./copy";
import { field, type FieldStep } from "./network-store";
import * as previewData from "./preview";
import { MiniProfile, ProfileCard } from "./ProfileCard";

const copy = site.select.apply;
const errors = site.upload.errors;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const FIRST_POLL_MS = 300; // cache hits and "not me" answer on the first poll
const POLL_MS = 1700;
const GIVE_UP_MS = 120_000;
const PITCH_WAIT_MS = 6000;
const accept = [...site.upload.extensions, ...site.upload.mimeTypes].join(",");

type Step = "you" | "manual" | "search" | "confirm" | "notFound" | "busy" | "pitch" | "resume" | "noResume" | "sending" | "done";
type LinkedInStatus = "confirmed" | "typed" | "skipped";
type Pitch = { text: string; source: "ai" | "fallback"; needsMore?: boolean; question?: string };
type Sharpen = "idle" | "loading" | "done";
type PitchState = "idle" | "loading" | "ready" | "failed";

type State = {
  step: Step;
  name: string;
  company: string;
  role: string;
  url: string;
  email: string;
  token: string | null;
  /** Search log: when each of the three lines (search, profile, found) first became active, in ms since start. */
  marks: number[];
  startedAt: number;
  sawPeople: boolean;
  next: string | null;
  profile: Profile | null;
  status: LinkedInStatus;
  workAuth: string | null;
  file: { name: string; size: number } | null;
  sentEmail: string | null;
  saved: boolean;
  pitch: Pitch | null;
  pitchState: PitchState;
  /** The one-line sharpening answer, and the draft it replaced (to highlight what changed). */
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
  | { type: "searching"; token: string; index: number; people?: boolean; checkingNext?: boolean; restart?: boolean }
  | { type: "found"; profile: Profile; next: string | null }
  | { type: "status"; status: LinkedInStatus }
  | { type: "auth"; value: string | null }
  | { type: "file"; file: { name: string; size: number } | null }
  | { type: "error"; message: string | null }
  | { type: "pitch"; state: PitchState; pitch?: Pitch | null }
  | { type: "saved" }
  | { type: "done"; email: string | null }
  | { type: "preview"; state: State };

const initial: State = {
  step: "you", name: "", company: "", role: "", url: "", email: "", token: null, marks: [], startedAt: 0, sawPeople: false,
  next: null, profile: null, status: "skipped", workAuth: null, file: null, sentEmail: null, saved: false,
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
      const base = a.restart ? [] : s.marks;
      const marks = [...base];
      for (let i = 0; i <= a.index; i++) if (marks[i] === undefined) marks[i] = Date.now() - startedAt;
      return {
        ...s, step: "search", token: a.token, marks, startedAt, error: null,
        sawPeople: a.restart ? Boolean(a.people) : s.sawPeople || Boolean(a.people),
        checkingNext: a.checkingNext ?? s.checkingNext,
      };
    }
    case "found":
      return { ...s, step: "confirm", profile: a.profile, next: a.next, token: null, checkingNext: false };
    case "status":
      // Skipping after typing a link still keeps the link.
      // A confirmed profile goes straight to its draft intro; everyone else goes to the resume step.
      return { ...s, status: a.status === "skipped" && s.url ? "typed" : a.status, step: a.status === "confirmed" ? "pitch" : "resume", error: null, token: null };
    case "auth":
      return { ...s, workAuth: a.value };
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

const FIELD_STEP: Record<Step, FieldStep> = {
  you: "you", manual: "you", search: "search", confirm: "confirm", notFound: "you", busy: "you", pitch: "resume",
  resume: "resume", noResume: "resume", sending: "sending", done: "done",
};
const PROGRESS: Record<Step, number> = { you: 0, manual: 0, search: 1, confirm: 1, notFound: 1, busy: 1, pitch: 2, resume: 3, noResume: 3, sending: 3, done: 4 };
const PROGRESS_LABELS = r2.progress;
const stageIndex = (stage: string) => (stage === "profile" ? 1 : 0);

type Reply =
  | { state: "pending"; stage: string; token: string }
  | { state: "found"; profile: Profile; next: string | null }
  | { state: "not_found"; next: null }
  | { state: "error"; message: string; code?: string };

type BusyCode = "rate_limited" | "daily_cap";
const busyCode = (r: Reply): BusyCode | null =>
  r.state === "error" && (r.code === "rate_limited" || r.code === "daily_cap") ? r.code : null;

async function post(url: string, body: unknown): Promise<Reply> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await res.json()) as Reply;
  } catch {
    return { state: "error", message: errors.network };
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

function sixMonthsFromNow() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const clock = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const input =
  "h-12 w-full rounded-[10px] border border-line bg-paper/60 px-3.5 text-[16px] text-ink placeholder:text-placeholder transition-[border-color,background-color,box-shadow] duration-200 hover:border-line-strong focus:border-ink focus:bg-surface focus:shadow-[0_0_0_4px_rgb(14_14_12/0.06)] focus:outline-none";
const primary =
  "inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-ink px-5 text-[15px] font-medium text-paper transition-[background-color,transform] duration-150 hover:bg-ink-hover active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40";
const secondary =
  "inline-flex h-12 w-full items-center justify-center rounded-[10px] border border-line-strong px-5 text-[15px] font-medium text-ink transition-colors hover:border-ink";
const textLink =
  "text-[13.5px] text-muted underline decoration-line-strong underline-offset-[5px] transition-colors hover:text-ink hover:decoration-ink";
const labelCls = "font-mono text-[11px] tracking-[0.08em] text-muted uppercase";
const heading = "font-serif text-[28px] leading-[1.08] tracking-[-0.015em] text-ink outline-none sm:text-[30px]";
const hint = "mt-2 text-[14.5px] leading-relaxed text-muted";

const still = {};
const motionPanel = {
  initial: { opacity: 0, y: 8, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: [0.2, 0.7, 0.1, 1] as const } },
  exit: { opacity: 0, y: -6, filter: "blur(2px)", transition: { duration: 0.16 } },
};

/** The whole Tal Select application: one card, one step at a time. */
export function Apply() {
  const [s, dispatch] = useReducer(reducer, initial);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const pickedFile = useRef<File | null>(null);
  const pitchReq = useRef<Promise<Pitch | null> | null>(null);
  const lastStep = useRef<Step>("you");
  const polls = useRef(0);
  const [dragging, setDragging] = useState(false);

  // Dev-only screenshots: /?preview=you|search|confirm|notFound|resume|noResume|sending|done
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    const want = new URLSearchParams(window.location.search).get("preview");
    if (!want) return;
    // Headless screenshots starve requestAnimationFrame; jump every transition to its end state.
    MotionGlobalConfig.skipAnimations = true;
    {
      const { PREVIEW_STEPS, mockPerson, mockProfile, mockPitch, mockAnswer, mockSharpened } = previewData;
      if (!(PREVIEW_STEPS as readonly string[]).includes(want)) return;
      const base: State = { ...initial, ...mockPerson, preview: true };
      const confirmed = { status: "confirmed" as const, profile: mockProfile, pitchState: "ready" as const, pitch: { text: mockPitch, source: "ai" as const, needsMore: true } };
      const states: Record<string, Partial<State>> = {
        you: {},
        search: { step: "search", startedAt: Date.now() - 9_000, marks: [0], sawPeople: true },
        confirm: { step: "confirm", profile: mockProfile, next: "mock" },
        pitch: { step: "pitch", ...confirmed },
        sharpened: { step: "pitch", ...confirmed, answer: mockAnswer, sharpen: "done", prevPitch: mockPitch, pitch: { text: mockSharpened, source: "ai" } },
        notFound: { step: "notFound" },
        rateLimited: { step: "busy", busy: "rate_limited" },
        dailyCap: { step: "busy", busy: "daily_cap" },
        resume: { step: "resume", ...confirmed, workAuth: "visa_no_sponsorship" },
        noResume: { step: "noResume", ...confirmed },
        sending: { step: "sending", ...confirmed, file: { name: "jordan-avery-resume.pdf", size: 214_000 }, workAuth: "citizen" },
        done: { step: "done", ...confirmed, sentEmail: "jordan@example.com", saved: true, answer: mockAnswer, pitch: { text: mockSharpened, source: "ai" } },
      };
      pitchReq.current = Promise.resolve(confirmed.pitch);
      dispatch({ type: "preview", state: { ...base, ...states[want] } });
    }
  }, []);

  // Keep the canvas in step.
  useEffect(() => {
    field.set({ step: FIELD_STEP[s.step], label: (s.status === "confirmed" && s.profile?.fullname) || s.name, phase: s.step });
  }, [s.step, s.name, s.status, s.profile]);

  // Focus each new step's heading, and bring the card back into view on phones.
  useEffect(() => {
    // Compare with the last step seen (StrictMode runs effects twice, so a "first run" flag isn't enough).
    if (lastStep.current === s.step) return;
    lastStep.current = s.step;
    headingRef.current?.focus({ preventScroll: true });
    // Phones: every step starts with the card's top in view. Desktop: only when it has scrolled away.
    const r = rootRef.current?.getBoundingClientRect();
    if (r && (window.innerWidth < 1024 ? Math.abs(r.top - 12) > 4 : r.top < 0 || r.top > window.innerHeight * 0.7)) {
      rootRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    }
  }, [s.step]);

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
        dispatch({ type: "searching", token: reply.token, index: stageIndex(reply.stage), people: reply.stage === "people" });
      } else if (reply.state === "found") {
        track("select_lookup_found", { score: reply.profile.score, seconds: Math.round((Date.now() - s.startedAt) / 1000) });
        // Show "Lining it up for you to check" for a beat: it's true, and it makes the card's arrival legible.
        dispatch({ type: "searching", token: "", index: 2 });
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

  // Ask for the draft intro as soon as we know who we're pitching: on "Yes, that's me", or at the resume step.
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
    if (!p) dispatch({ type: "error", message: r2.pitch.error });
  };

  const begin = async (body: Record<string, string>) => {
    polls.current = 0;
    dispatch({ type: "searching", token: "", index: 0, restart: true, checkingNext: false });
    const reply = await post("/api/linkedin/start", body);
    if (reply.state === "pending") dispatch({ type: "searching", token: reply.token, index: stageIndex(reply.stage), people: reply.stage === "people" });
    else if (busyCode(reply)) dispatch({ type: "busy", code: busyCode(reply)! });
    else dispatch({ type: "go", step: body.url ? "manual" : "notFound", error: reply.state === "error" ? reply.message : null });
  };

  const submitYou = (e: FormEvent) => {
    e.preventDefault();
    if (s.name.trim().length < 2 || s.company.trim().length < 2) return dispatch({ type: "error", message: copy.you.missing });
    track("select_lookup_started", {});
    if (s.preview) return dispatch({ type: "searching", token: "", index: 0, restart: true });
    begin({ name: s.name.trim(), company: s.company.trim(), role: s.role.trim() });
  };

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    if (s.name.trim().length < 2 || s.company.trim().length < 2) return dispatch({ type: "error", message: copy.you.missing });
    const url = s.url.trim().replace(/^(?!https?:\/\/)/, "https://");
    if (!/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^/?#]+/i.test(url)) return dispatch({ type: "error", message: copy.you.badUrl });
    dispatch({ type: "field", key: "url", value: url });
    track("select_lookup_started", { manual: true });
    if (s.preview) return dispatch({ type: "searching", token: "", index: 1, restart: true });
    begin({ name: s.name.trim(), company: s.company.trim(), role: s.role.trim(), url });
  };

  const notMe = async () => {
    track("select_profile_rejected", {});
    if (!s.next) return dispatch({ type: "go", step: "notFound" });
    dispatch({ type: "searching", token: "", index: 1, restart: true, checkingNext: true });
    polls.current = 0;
    if (s.preview) return;
    const reply = await post("/api/linkedin/profile", { next: s.next });
    if (reply.state === "pending") dispatch({ type: "searching", token: reply.token, index: 1, checkingNext: true });
    else if (busyCode(reply)) dispatch({ type: "busy", code: busyCode(reply)! });
    else dispatch({ type: "go", step: "notFound" });
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

  const send = async (mode: "resume" | "email") => {
    const file = mode === "resume" ? pickedFile.current : null;
    const email = mode === "email" ? s.email.trim() : null;
    if (mode === "resume" && !file) return fileRef.current?.click();
    if (mode === "email") {
      if (!email) return dispatch({ type: "error", message: copy.noResume.emailMissing });
      if (!EMAIL_RE.test(email)) return dispatch({ type: "error", message: copy.noResume.emailInvalid });
    }
    const back: Step = mode === "resume" ? "resume" : "noResume";
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
        workAuth: s.workAuth,
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
      track("resume_uploaded", { source: "select", resume: Boolean(file), email_found: Boolean(data.email), linkedin: s.status, work_auth: s.workAuth, pitch: Boolean(pitch) });
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

  const first = (s.profile?.fullname || s.name).trim().split(/\s+/)[0] ?? "";
  // Preview screenshots render each step at rest: no presence transitions to wait on.
  const Presence = s.preview ? Fragment : AnimatePresence;
  const presence = s.preview ? {} : { mode: "wait" as const, initial: false };
  const panel = s.preview ? still : motionPanel;
  const progress = PROGRESS[s.step];

  return (
    <div
      ref={rootRef}
      id="apply"
      data-field-avoid
      data-preview={s.preview || undefined}
      data-dragging={dragging}
      onDragOver={(e) => onDrag(e, true)}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) onDrag(e, false);
      }}
      onDrop={(e) => {
        onDrag(e, false);
        if (s.step === "resume" && e.dataTransfer.files.length) pick(e.dataTransfer.files);
      }}
      className="apply-card relative scroll-mt-4 rounded-[18px] border border-line bg-surface p-5 pt-4 transition-[border-color,box-shadow] duration-300 data-[dragging=true]:border-signal sm:p-7 sm:pt-5"
    >
      <Progress index={progress} />
      <div aria-live="polite">
        <Presence {...presence}>
          {s.step === "you" && (
            <m.form key="you" {...panel} onSubmit={submitYou} noValidate className="space-y-4">
              <Head title={copy.you.title} sub={copy.you.hint} />
              {(["name", "company", "role"] as const).map((k) => (
                <Field key={k} id={`apply-${k}`} label={copy.you.fields[k].label}>
                  <input
                    className={input}
                    id={`apply-${k}`}
                    name={k}
                    value={s[k]}
                    onChange={(e) => dispatch({ type: "field", key: k, value: e.target.value })}
                    placeholder={copy.you.fields[k].placeholder}
                    autoComplete={k === "name" ? "name" : k === "company" ? "organization" : "organization-title"}
                    required={k !== "role"}
                    maxLength={80}
                  />
                </Field>
              ))}
              <ErrorText message={s.error} />
              <button type="submit" className={`${primary} mt-1`}>
                {copy.you.cta}
                <Arrow />
              </button>
              <p className="text-center">
                <button type="button" className={textLink} onClick={() => dispatch({ type: "go", step: "manual" })}>
                  {copy.you.manual}
                </button>
              </p>
            </m.form>
          )}

          {s.step === "manual" && (
            <m.form key="manual" {...panel} onSubmit={submitManual} noValidate className="space-y-4">
              <Head title={copy.you.manualLabel} headingRef={headingRef} />
              {(["name", "company"] as const).map((k) => (
                <Field key={k} id={`apply-m-${k}`} label={copy.you.fields[k].label}>
                  <input
                    className={input}
                    id={`apply-m-${k}`}
                    value={s[k]}
                    onChange={(e) => dispatch({ type: "field", key: k, value: e.target.value })}
                    placeholder={copy.you.fields[k].placeholder}
                    autoComplete={k === "name" ? "name" : "organization"}
                    maxLength={80}
                  />
                </Field>
              ))}
              <Field id="apply-url" label={copy.you.manualLabel}>
                <input
                  className={`${input} font-mono text-[15px]`}
                  id="apply-url"
                  inputMode="url"
                  autoComplete="url"
                  value={s.url}
                  onChange={(e) => dispatch({ type: "field", key: "url", value: e.target.value })}
                  placeholder={copy.you.manualPlaceholder}
                />
              </Field>
              <ErrorText message={s.error} />
              <button type="submit" className={primary}>
                {copy.you.manualCta}
              </button>
              <div className="flex justify-between gap-4">
                <button type="button" className={textLink} onClick={() => dispatch({ type: "go", step: "you" })}>
                  Back
                </button>
                <button type="button" className={textLink} onClick={() => dispatch({ type: "status", status: "skipped" })}>
                  {copy.notFound.skip}
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
            <m.div key={`confirm-${s.profile.slug}`} {...panel} className="space-y-5">
              <Head title={copy.confirm.title} sub={copy.confirm.hint} headingRef={headingRef} />
              <ProfileCard profile={s.profile} />
              <div className="grid grid-cols-[1fr_1.4fr] gap-2.5">
                <button type="button" className={secondary} onClick={notMe}>
                  {copy.confirm.no}
                </button>
                <button
                  type="button"
                  className={primary}
                  onClick={() => {
                    track("select_profile_confirmed", { score: s.profile!.score });
                    dispatch({ type: "status", status: "confirmed" });
                  }}
                >
                  {copy.confirm.yes}
                </button>
              </div>
            </m.div>
          )}

          {s.step === "notFound" && (
            <m.div key="notFound" {...panel} className="space-y-5">
              <Head title={copy.notFound.title} sub={s.error || copy.notFound.body} headingRef={headingRef} />
              <button type="button" className={primary} onClick={() => dispatch({ type: "go", step: "manual" })}>
                {copy.notFound.manual}
              </button>
              <p className="text-center">
                <button type="button" className={textLink} onClick={() => dispatch({ type: "status", status: "skipped" })}>
                  {copy.notFound.skip}
                </button>
              </p>
            </m.div>
          )}

          {s.step === "busy" && (
            <m.div key="busy" {...panel} className="space-y-5">
              <Head title={r2.busy[s.busy].title} sub={r2.busy[s.busy].body} headingRef={headingRef} />
              <button type="button" className={primary} onClick={() => dispatch({ type: "go", step: "manual" })}>
                {r2.busy[s.busy].manual}
                <Arrow />
              </button>
              <p className="text-center">
                <button type="button" className={textLink} onClick={() => dispatch({ type: "status", status: "skipped" })}>
                  {r2.busy[s.busy].skip}
                </button>
              </p>
            </m.div>
          )}

          {s.step === "pitch" && (
            <m.div key="pitch" {...panel} className="space-y-3.5">
              <Head title={r2.pitch.title} headingRef={headingRef} />
              <EmailCard s={s} />
              <SharpenForm s={s} onChange={(v) => dispatch({ type: "field", key: "answer", value: v })} onSubmit={sharpen} />
              <ErrorText message={s.error} />
              <StickyOnPhone>
                <button type="button" className={primary} disabled={!s.pitch} onClick={() => dispatch({ type: "go", step: "resume" })}>
                  {r2.pitch.next}
                  <Arrow />
                </button>
              </StickyOnPhone>
            </m.div>
          )}

          {s.step === "resume" && (
            <m.div key="resume" {...panel} className="space-y-5">
              {s.pitch ? (
                <Head title={r2.resume.title} sub={r2.resume.hint} headingRef={headingRef} />
              ) : (
                <Head title={copy.resume.title} sub={copy.resume.hint} headingRef={headingRef} />
              )}
              <WorkAuth value={s.workAuth} onChange={(v) => dispatch({ type: "auth", value: v })} />
              <div>
                <input
                  ref={fileRef}
                  id="select-resume"
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
                  htmlFor="select-resume"
                  data-dragging={dragging}
                  className="group flex cursor-pointer items-center gap-3.5 rounded-[12px] border border-dashed border-line-strong bg-paper-2/60 px-4 py-4 transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink hover:border-ink data-[dragging=true]:border-signal data-[dragging=true]:bg-signal/5"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-[9px] border border-line bg-surface text-ink">
                    {s.file ? <Check /> : <DocIcon />}
                  </span>
                  <span className="min-w-0 flex-1">
                    {s.file ? (
                      <>
                        <span className="block truncate text-[14.5px] font-medium text-ink">{s.file.name}</span>
                        <span className="block font-mono text-[11.5px] text-muted">{formatBytes(s.file.size)} · tap to change</span>
                      </>
                    ) : (
                      <>
                        <span className="block text-[14.5px] font-medium text-ink">{dragging ? site.upload.idle.dragging : site.upload.idle.button}</span>
                        <span className="block font-mono text-[11.5px] text-muted">PDF or DOCX · 5MB</span>
                      </>
                    )}
                  </span>
                </label>
              </div>
              <ErrorText id="resume-error" message={s.error} />
              <button type="button" className={primary} disabled={!s.file} onClick={() => send("resume")}>
                {copy.resume.cta}
                <Arrow />
              </button>
              <p className="text-center">
                <button
                  type="button"
                  className={textLink}
                  onClick={() => {
                    pickedFile.current = null;
                    dispatch({ type: "file", file: null });
                    dispatch({ type: "go", step: "noResume" });
                  }}
                >
                  {s.status === "skipped" ? copy.noResume.linkNoLinkedIn : copy.noResume.link}
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
              className="space-y-5"
            >
              <Head title={copy.noResume.title} sub={copy.noResume.hint} headingRef={headingRef} />
              {s.status === "confirmed" && s.profile && <MiniProfile profile={s.profile} />}
              <Field id="apply-email" label={copy.noResume.emailLabel}>
                <input
                  className={input}
                  id="apply-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={s.email}
                  onChange={(e) => dispatch({ type: "field", key: "email", value: e.target.value })}
                  placeholder={copy.noResume.emailPlaceholder}
                  maxLength={120}
                />
              </Field>
              <WorkAuth value={s.workAuth} onChange={(v) => dispatch({ type: "auth", value: v })} />
              <ErrorText message={s.error} />
              <button type="submit" className={primary}>
                {copy.noResume.cta}
                <Arrow />
              </button>
              <p className="text-center">
                <button type="button" className={textLink} onClick={() => dispatch({ type: "go", step: "resume" })}>
                  {copy.noResume.back}
                </button>
              </p>
              <Consent />
            </m.form>
          )}

          {s.step === "sending" && (
            <m.div key="sending" {...panel}>
              <Sending s={s} headingRef={headingRef} />
            </m.div>
          )}

          {s.step === "done" && (
            <m.div key="done" {...panel} className="space-y-6">
              <div>
                <h2 ref={headingRef} tabIndex={-1} className="font-serif text-[34px] leading-[1.04] tracking-[-0.02em] text-ink outline-none sm:text-[38px]">
                  {copy.done.title}
                </h2>
                <p className="mt-2 text-[15px] text-body">{copy.done.lead(first)}</p>
                <p className="mt-1 text-[14px] text-muted">{copy.done.early}</p>
              </div>
              <EmailCard s={s} compact />
              <ol className="relative space-y-4">
                {copy.done.steps.map((step, i) => (
                  <m.li
                    key={step.when}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.5 + i * 0.08 } }}
                    className="grid grid-cols-[104px_1fr] gap-3 border-t border-line pt-3.5 sm:grid-cols-[120px_1fr]"
                  >
                    <p className={`${labelCls} pt-[3px] ${i === 0 ? "text-signal" : ""}`}>{step.when}</p>
                    <p className="text-[14.5px] leading-snug text-ink">{step.what}</p>
                  </m.li>
                ))}
              </ol>
              <div className="space-y-1 rounded-[12px] bg-paper-2 p-4 text-[14px] leading-relaxed">
                <p className="font-medium text-ink">{copy.done.until(sixMonthsFromNow())}</p>
                <p className="text-muted">{s.sentEmail ? copy.done.email(s.sentEmail) : copy.done.noEmail}</p>
                <p className="text-muted">{copy.done.free}</p>
              </div>
            </m.div>
          )}
        </Presence>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- pieces */

function Progress({ index }: { index: number }) {
  return (
    <div className="mb-5 flex items-center justify-between gap-3" aria-label={`Step ${index + 1} of ${PROGRESS_LABELS.length}: ${PROGRESS_LABELS[index]}`}>
      <span className={`${labelCls} tabular-nums`} aria-hidden="true">
        <span className="text-ink">0{index + 1}</span> / 0{PROGRESS_LABELS.length} · {PROGRESS_LABELS[index]}
      </span>
      <span className="flex gap-1" aria-hidden="true">
        {PROGRESS_LABELS.map((l, i) => (
          <span key={l} className={`h-[3px] w-5 rounded-full sm:w-6 ${i < index ? "bg-ink" : i === index ? "bg-signal" : "bg-line"}`} />
        ))}
      </span>
    </div>
  );
}

function Head({ title, sub, headingRef }: { title: string; sub?: string; headingRef?: React.Ref<HTMLHeadingElement> }) {
  return (
    <div className="pb-1">
      <h2 ref={headingRef} tabIndex={headingRef ? -1 : undefined} className={heading}>
        {title}
      </h2>
      {sub && <p className={hint}>{sub}</p>}
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className={`${labelCls} mb-1.5 block`}>
        {label}
      </label>
      {children}
    </div>
  );
}

function ErrorText({ message, id }: { message: string | null; id?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-[14px] leading-snug text-danger">
      {message}
    </p>
  );
}

function WorkAuth({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <fieldset className="min-w-0">
      <legend className={`${labelCls} mb-2 flex w-full items-center justify-between`}>
        <span>{copy.resume.authLabel}</span>
        <span className="normal-case tracking-normal text-placeholder">{copy.resume.authOptional}</span>
      </legend>
      <div className="grid grid-cols-2 gap-1.5">
        {copy.resume.auth.map(([v, label], i) => (
          <button
            type="button"
            key={v}
            aria-pressed={value === v}
            onClick={() => onChange(value === v ? null : v)}
            className={`flex min-h-10 items-center gap-2 rounded-[9px] border border-line px-3 py-2 text-left text-[13px] leading-tight text-body transition-colors hover:border-line-strong aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper ${i === copy.resume.auth.length - 1 ? "col-span-2" : ""}`}
          >
            <span aria-hidden="true" className="flex size-3 shrink-0 items-center justify-center rounded-full border border-current opacity-70">
              {value === v && <span className="size-1.5 rounded-full bg-current" />}
            </span>
            {label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** The LinkedIn wait, told straight: the real stages the server reports, a real clock, and the real query. */
function Search({ s, headingRef, onSkip }: { s: State; headingRef: React.Ref<HTMLHeadingElement>; onSkip: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const active = Math.min(2, s.marks.length - 1);
  const manual = s.url && !s.checkingNext && s.marks[0] === s.marks[1];
  // Literal detail for the log (not marketing copy): both searches start together; "people" means Google is done.
  const q = `"${s.name.trim()}" ${s.company.trim()}`;
  const detail: [string, boolean][][] = [
    manual
      ? [[s.url.replace(/^https?:\/\/(www\.)?/, ""), active > 0]]
      : [
          [`google  site:linkedin.com/in ${q}`, s.sawPeople || active > 0],
          [`people  ${q}`, active > 0],
        ],
    s.checkingNext ? [["next match", false]] : [],
    [],
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 ref={headingRef} tabIndex={-1} className={`${heading} truncate`}>
            {s.checkingNext ? copy.confirm.trying : s.name.trim()}
          </h2>
          <p className="mt-1.5 truncate font-mono text-[11.5px] text-muted">{[s.company.trim(), s.role.trim()].filter(Boolean).join(" · ")}</p>
        </div>
        <span className="pt-2 font-mono text-[13px] text-muted tabular-nums" aria-hidden="true">
          {clock(now - s.startedAt)}
        </span>
      </div>
      <ol className="overflow-hidden rounded-[12px] border border-line bg-paper-2/60 font-mono text-[12px] leading-[18px]">
        {copy.search.lines.map((line, i) => {
          const state = i < active ? "done" : i === active ? "active" : "todo";
          return (
            <li key={line} className={`flex gap-3 border-line px-3.5 py-3 not-last:border-b ${state === "todo" ? "text-placeholder" : "text-ink"}`}>
              <Tick state={state} />
              <span className="min-w-0 flex-1">
                <span className="block font-sans text-[14px] leading-[18px]">{line}</span>
                {state !== "todo" &&
                  detail[i].map(([d, ok]) => (
                    <span key={d} className={`mt-1 flex gap-1.5 break-words ${ok ? "text-muted" : "text-body"}`}>
                      <span aria-hidden="true" className={`w-2.5 shrink-0 ${ok ? "text-ink" : "text-signal"}`}>{ok ? "✓" : "›"}</span>
                      {d}
                    </span>
                  ))}
              </span>
              <span className="shrink-0 text-muted tabular-nums">{s.marks[i] !== undefined ? clock(s.marks[i]) : ""}</span>
            </li>
          );
        })}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <span className="text-[13.5px] text-muted">{copy.search.wait}</span>
        <button type="button" className={textLink} onClick={onSkip}>
          {copy.search.skip}
        </button>
      </div>
    </div>
  );
}

/** What's actually happening while the application posts. Ticks only ever fill top-down. */
function Sending({ s, headingRef }: { s: State; headingRef: React.Ref<HTMLHeadingElement> }) {
  const [a, b, c] = copy.resume.sending;
  const pitchDone = s.pitchState === "ready" || s.pitchState === "failed";
  const raw = [s.saved, s.saved, s.saved && pitchDone];
  const done = raw.map((_, i) => raw.slice(0, i + 1).every(Boolean));
  const firstOpen = done.indexOf(false);
  const subs = [s.file ? `${s.file.name} · ${formatBytes(s.file.size)}` : s.email, "", ""];
  return (
    <div className="space-y-5">
      <h2 ref={headingRef} tabIndex={-1} className="sr-only">
        {a}
      </h2>
      <ol className="space-y-4">
        {[a, b, c].map((line, i) => {
          const state = done[i] ? "done" : i === firstOpen ? "active" : "todo";
          return (
            <li key={line} className="flex gap-3.5">
              <Tick state={state} />
              <span className="min-w-0">
                <span className={`block font-serif text-[21px] leading-[1.2] ${state === "todo" ? "text-placeholder" : "text-ink"}`}>{line}</span>
                {subs[i] && <span className="mt-0.5 block truncate font-mono text-[11.5px] text-muted">{subs[i]}</span>}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="h-[2px] overflow-hidden rounded-full bg-line" aria-hidden="true">
        <span className="indeterminate block h-full w-1/3 bg-signal" />
      </div>
    </div>
  );
}

/**
 * The intro as the founder would get it: To, From, Subject, then the draft, written out as it arrives.
 * After a sharpening rewrite, the words that are new glow blue for a moment.
 */
function EmailCard({ s, compact = false }: { s: State; compact?: boolean }) {
  const pitch = s.pitch;
  const words = pitch?.text.split(/(\s+)/) ?? [];
  const fresh = s.prevPitch ? answerSpans(words, s.answer) : new Set<number>();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!pitch) return;
    if (compact || MotionGlobalConfig.skipAnimations || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(words.length);
    setShown(0);
    let i = 0;
    const t = setInterval(() => {
      i += 2;
      setShown(i);
      if (i >= words.length) clearInterval(t);
    }, 28);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pitch?.text]);

  if (s.pitchState === "failed" || s.pitchState === "idle") return null;
  const name = s.profile?.fullname || s.name.trim();
  const role = s.role.trim() || s.profile?.experience[0]?.title || "";
  const typing = pitch && shown < words.length;
  const rewriting = s.sharpen === "loading";
  const row = "grid grid-cols-[68px_1fr] items-baseline gap-2 border-b border-line px-4 py-[7px] sm:px-5";
  return (
    <figure className="overflow-hidden rounded-[14px] border border-line bg-surface shadow-[0_1px_0_rgb(14_14_12/0.03),0_14px_34px_-22px_rgb(14_14_12/0.3)]">
      <div className="text-[13px]">
        <div className={row}>
          <span className={labelCls}>{r2.pitch.toLabel}</span>
          <span className="truncate text-ink">{r2.pitch.to(role)}</span>
        </div>
        {!compact && (
          <div className={row}>
            <span className={labelCls}>{r2.pitch.fromLabel}</span>
            <span className="flex items-center gap-2 text-body">
              {/* Tal's mark, the same ink point as in the field. */}
              <span aria-hidden="true" className="relative flex size-[14px] shrink-0 items-center justify-center rounded-full ring-1 ring-ink/30">
                <span className="size-[7px] rounded-full bg-ink" />
              </span>
              {r2.pitch.from}
            </span>
          </div>
        )}
        <div className={row}>
          <span className={labelCls}>{r2.pitch.subjectLabel}</span>
          <span className="truncate font-medium text-ink">{r2.pitch.subject(name.split(/\s+/)[0] ?? name, role, s.company.trim() || s.profile?.currentCompany || "")}</span>
        </div>
      </div>
      <div className={`relative px-4 py-4 sm:px-5 ${rewriting ? "opacity-45" : ""} transition-opacity duration-300`}>
        {pitch ? (
          <blockquote className={`font-serif leading-[1.45] text-ink ${compact ? "text-[17px]" : "text-[18px] lg:text-[17.5px] lg:leading-[1.42]"}`} aria-label={pitch.text}>
            <span aria-hidden="true">
              {words.slice(0, shown).map((w, i) =>
                fresh.has(i) ? (
                  <span key={i} className="fresh">
                    {w}
                  </span>
                ) : (
                  <Fragment key={i}>{w}</Fragment>
                ),
              )}
              {typing && <span className="caret" />}
            </span>
          </blockquote>
        ) : (
          <div className="space-y-2.5" aria-label={r2.pitch.drafting}>
            <p className="font-mono text-[12px] text-muted">
              {r2.pitch.drafting}
              <span className="caret" />
            </p>
            <span className="shimmer block h-3 w-full rounded-full bg-line" />
            <span className="shimmer block h-3 w-11/12 rounded-full bg-line" />
            <span className="shimmer block h-3 w-3/5 rounded-full bg-line" />
          </div>
        )}
        {rewriting && (
          <p className="absolute inset-x-0 bottom-3 text-center font-mono text-[11.5px] text-signal">
            {r2.pitch.sharpening}
            <span className="caret" />
          </p>
        )}
      </div>
      {pitch && !compact && (
        <figcaption className="border-t border-line bg-paper-2/50 px-4 py-2.5 text-[12.5px] leading-relaxed text-muted sm:px-5">
          <span className="mr-2 inline-block rounded-full border border-signal/40 px-2 py-px align-[1px] font-mono text-[9.5px] tracking-[0.08em] text-signal uppercase">{r2.pitch.tag}</span>
          {s.prevPitch ? r2.pitch.rewritten : pitch.source === "ai" ? r2.pitch.note : r2.pitch.fallbackNote}
        </figcaption>
      )}
    </figure>
  );
}

/** One line from the person, worked into the intro. */
function SharpenForm({ s, onChange, onSubmit }: { s: State; onChange: (v: string) => void; onSubmit: (e: FormEvent) => void }) {
  if (!s.pitch) return null;
  const question = s.pitch.question || r2.pitch.question;
  const needsMore = Boolean(s.pitch.needsMore) && s.sharpen !== "done";
  const loading = s.sharpen === "loading";
  return (
    <form onSubmit={onSubmit} noValidate className={`rounded-[12px] border p-3.5 ${needsMore ? "border-signal/35 bg-signal/[0.035]" : "border-line bg-paper-2/50"}`}>
      <label htmlFor="apply-answer" className="block font-serif text-[18px] leading-snug text-ink lg:text-[17px]">
        {question}
      </label>
      {needsMore && (
        <p className="mt-0.5 text-[13px] leading-snug text-signal">{s.status === "confirmed" ? r2.pitch.needsMoreLinkedIn : r2.pitch.needsMoreThin}</p>
      )}
      <div className="mt-2.5 flex gap-2">
        <input
          id="apply-answer"
          className={`${input} h-11 min-w-0 flex-1 bg-surface text-[15px]`}
          value={s.answer}
          onChange={(e) => onChange(e.target.value)}
          placeholder={r2.pitch.placeholder}
          maxLength={200}
          autoComplete="off"
          enterKeyHint="send"
        />
        <button
          type="submit"
          disabled={!s.answer.trim() || loading}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-[10px] border border-ink px-3.5 text-[14px] font-medium text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-line-strong disabled:text-placeholder disabled:hover:bg-transparent"
        >
          {loading ? <span className="spin size-3.5 rounded-full border-[1.5px] border-line-strong border-t-signal" /> : <Spark />}
          <span className="hidden sm:inline">{r2.pitch.sharpen}</span>
          <span className="sr-only sm:hidden">{r2.pitch.sharpen}</span>
        </button>
      </div>
    </form>
  );
}

function Spark() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  );
}

function Consent() {
  const { privacyUrl, termsUrl } = site.legal;
  const c = site.upload.consent;
  const a = "underline decoration-line-strong underline-offset-2 hover:text-ink";
  return (
    <p className="text-center text-[12px] leading-relaxed text-muted">
      {c.before}{" "}
      <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className={a}>
        {c.privacy}
      </a>{" "}
      {c.and}{" "}
      <a href={termsUrl} target="_blank" rel="noopener noreferrer" className={a}>
        {c.terms}
      </a>
      , and to Tal Select representing you for six months.
    </p>
  );
}

function Tick({ state }: { state: "done" | "active" | "todo" }) {
  if (state === "done")
    return (
      <span className="mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full bg-ink text-paper">
        <svg viewBox="0 0 24 24" className="size-3" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  if (state === "active") return <span className="spin mt-px size-[18px] shrink-0 rounded-full border-[1.5px] border-line-strong border-t-signal" />;
  return <span className="mt-px size-[18px] shrink-0 rounded-full border-[1.5px] border-line" />;
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M12 18v-6M9.5 14.5 12 12l2.5 2.5" />
    </svg>
  );
}

const STOP = new Set(
  "a an and are as at be but by for from has have i in into is it its of on or our so that the their them they this to was we were with my me".split(" "),
);
const stem = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(ing|ed|es|s)$/, "");

/**
 * Which word tokens (indices into the split draft) to highlight after a rewrite: at most two runs of
 * consecutive words that all come from the typed answer, with at least two content words each, never a
 * lone stopword. So the glow marks the person's own idea, not a word-level diff.
 */
function answerSpans(tokens: string[], answer: string): Set<number> {
  const from = new Set(answer.split(/\s+/).map(stem).filter(Boolean));
  const runs: number[][] = [];
  let run: number[] = [];
  const weak = (i: number) => !/\S/.test(tokens[i]) || STOP.has(tokens[i].toLowerCase().replace(/[^a-z]/g, ""));
  const close = () => {
    while (run.length && weak(run[0])) run.shift();
    while (run.length && weak(run[run.length - 1])) run.pop();
    const content = run.filter((i) => !weak(i)).length;
    if (content >= 2) runs.push(run);
    run = [];
  };
  tokens.forEach((t, i) => {
    if (!/\S/.test(t)) return run.length ? run.push(i) : undefined; // whitespace joins a run
    const st = stem(t);
    const lower = t.toLowerCase().replace(/[^a-z]/g, "");
    if (st && (from.has(st) || (STOP.has(lower) && run.length))) run.push(i);
    else close();
  });
  close();
  const keep = runs.sort((a, b) => b.length - a.length).slice(0, 2);
  return new Set(keep.flat());
}

/** On phones, the step's main button rides in a bar at the bottom of the screen; on desktop it stays in place. */
function StickyOnPhone({ children }: { children: ReactNode }) {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const on = () => setPhone(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  if (!phone) return <>{children}</>;
  return (
    <>
      <div className="h-16" aria-hidden="true" />
      {createPortal(
        <div className="ts-sticky fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-md">
          {children}
        </div>,
        document.querySelector(".ts-root") ?? document.body,
      )}
    </>
  );
}
