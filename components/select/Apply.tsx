"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect, useReducer, useRef, useState, type FormEvent } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import type { Profile } from "@/lib/linkedin";
import { checkResumeFile } from "@/lib/validation";
import { DropZone } from "../resume-drop/DropZone";
import { ProfileCard } from "./ProfileCard";
import { useSelectProgress } from "./SelectProgress";

const copy = site.select.apply;
const errors = site.upload.errors;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const POLL_MS = 2200;
const GIVE_UP_MS = 120_000;

type Step = "you" | "manual" | "search" | "confirm" | "notFound" | "resume" | "sending" | "done";
type LinkedInStatus = "confirmed" | "typed" | "skipped";

type State = {
  step: Step;
  name: string;
  company: string;
  role: string;
  url: string;
  token: string | null;
  stage: number; // which search line is active
  next: string | null;
  profile: Profile | null;
  status: LinkedInStatus;
  workAuth: string | null;
  email: string | null;
  error: string | null;
  checkingNext: boolean;
};

type Action =
  | { type: "field"; key: "name" | "company" | "role" | "url"; value: string }
  | { type: "go"; step: Step; error?: string | null }
  | { type: "searching"; token: string; stage: number; checkingNext?: boolean }
  | { type: "found"; profile: Profile; next: string | null }
  | { type: "status"; status: LinkedInStatus }
  | { type: "auth"; value: string | null }
  | { type: "error"; message: string | null }
  | { type: "done"; email: string | null };

const initial: State = {
  step: "you", name: "", company: "", role: "", url: "", token: null, stage: 0, next: null, profile: null,
  status: "skipped", workAuth: null, email: null, error: null, checkingNext: false,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "field":
      return { ...s, [a.key]: a.value, error: null };
    case "go":
      return { ...s, step: a.step, error: a.error ?? null };
    case "searching":
      return { ...s, step: "search", token: a.token, stage: a.stage, error: null, checkingNext: a.checkingNext ?? s.checkingNext };
    case "found":
      return { ...s, step: "confirm", profile: a.profile, next: a.next, token: null, checkingNext: false };
    case "status":
      // Skipping after typing a link still keeps the link.
      return { ...s, status: a.status === "skipped" && s.url ? "typed" : a.status, step: "resume", error: null };
    case "auth":
      return { ...s, workAuth: a.value };
    case "error":
      return { ...s, error: a.message };
    case "done":
      return { ...s, step: "done", email: a.email };
  }
}

const REACH: Record<Step, number> = { you: 0, manual: 0.1, search: 0.3, confirm: 0.45, notFound: 0.3, resume: 0.6, sending: 0.8, done: 1 };
const stageIndex = (stage: string) => (stage === "profile" ? 1 : 0);

type Reply =
  | { state: "pending"; stage: string; token: string }
  | { state: "found"; profile: Profile; next: string | null }
  | { state: "not_found"; next: null }
  | { state: "error"; message: string };

async function post(url: string, body: unknown): Promise<Reply> {
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    return (await res.json()) as Reply;
  } catch {
    return { state: "error", message: errors.network };
  }
}

function sixMonthsFromNow() {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

const input =
  "w-full border-0 border-b border-line-strong bg-transparent px-0 py-2.5 text-[17px] text-ink placeholder:text-[#6e6e73] transition-colors focus:border-ink focus:outline-none";
const primary =
  "flex w-full items-center justify-center gap-2 rounded-full bg-cta px-5 py-3.5 text-base font-medium text-cta-ink transition-[background-color,transform] duration-200 hover:bg-cta-hover active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40";
const secondary =
  "flex w-full items-center justify-center rounded-full border border-line-strong px-5 py-3.5 text-base font-medium text-ink transition-colors hover:border-ink";
const textLink = "text-[14px] text-muted underline decoration-muted/40 underline-offset-4 transition-colors hover:text-ink";

const panel = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 0.68, 0.18, 1] as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

/** The whole Tal Select application, inside the hero card. */
export function Apply() {
  const [s, dispatch] = useReducer(reducer, initial);
  const { setReach } = useSelectProgress();
  const started = useRef(0);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => setReach(REACH[s.step]), [s.step, setReach]);
  useEffect(() => {
    if (s.step !== "you") headingRef.current?.focus({ preventScroll: true });
  }, [s.step]);

  // Poll the lookup while it runs.
  useEffect(() => {
    if (s.step !== "search" || !s.token) return;
    const timer = setTimeout(async () => {
      if (Date.now() - started.current > GIVE_UP_MS) {
        track("select_lookup_failed", { reason: "timeout" });
        dispatch({ type: "go", step: "notFound" });
        return;
      }
      let reply: Reply;
      try {
        reply = (await (await fetch(`/api/linkedin/poll?t=${encodeURIComponent(s.token!)}`)).json()) as Reply;
      } catch {
        reply = { state: "pending", stage: "", token: s.token! };
      }
      if (reply.state === "pending") dispatch({ type: "searching", token: reply.token, stage: Math.max(s.stage, stageIndex(reply.stage)) });
      else if (reply.state === "found") {
        track("select_lookup_found", { score: reply.profile.score, seconds: Math.round((Date.now() - started.current) / 1000) });
        dispatch({ type: "found", profile: reply.profile, next: reply.next });
      } else {
        track("select_lookup_failed", { reason: reply.state });
        dispatch({ type: "go", step: "notFound" });
      }
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [s.step, s.token, s.stage]);

  const begin = async (body: Record<string, string>) => {
    started.current = Date.now();
    dispatch({ type: "searching", token: "", stage: 0, checkingNext: false });
    const reply = await post("/api/linkedin/start", body);
    if (reply.state === "pending") dispatch({ type: "searching", token: reply.token, stage: stageIndex(reply.stage) });
    else dispatch({ type: "go", step: body.url ? "manual" : "notFound", error: reply.state === "error" ? reply.message : null });
  };

  const submitYou = (e: FormEvent) => {
    e.preventDefault();
    if (s.name.trim().length < 2 || s.company.trim().length < 2) {
      dispatch({ type: "error", message: copy.you.missing });
      return;
    }
    track("select_lookup_started", {});
    begin({ name: s.name, company: s.company, role: s.role });
  };

  const submitManual = (e: FormEvent) => {
    e.preventDefault();
    if (s.name.trim().length < 2 || s.company.trim().length < 2) {
      dispatch({ type: "error", message: copy.you.missing });
      return;
    }
    const url = s.url.trim().replace(/^(?!https?:\/\/)/, "https://");
    if (!/^https:\/\/([a-z]{2,3}\.)?linkedin\.com\/in\/[^/?#]+/i.test(url)) {
      dispatch({ type: "error", message: copy.you.badUrl });
      return;
    }
    dispatch({ type: "field", key: "url", value: url });
    track("select_lookup_started", { manual: true });
    begin({ name: s.name, company: s.company, role: s.role, url });
  };

  const notMe = async () => {
    track("select_profile_rejected", {});
    if (!s.next) return dispatch({ type: "go", step: "notFound" });
    started.current = Date.now();
    dispatch({ type: "searching", token: "", stage: 1, checkingNext: true });
    const reply = await post("/api/linkedin/profile", { next: s.next });
    if (reply.state === "pending") dispatch({ type: "searching", token: reply.token, stage: 1, checkingNext: true });
    else dispatch({ type: "go", step: "notFound" });
  };

  const upload = async (file: File) => {
    const check = checkResumeFile(file);
    if (!check.ok) return dispatch({ type: "error", message: check.message });
    dispatch({ type: "go", step: "sending" });
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(UTM_KEYS.flatMap((k) => (params.get(k) ? [[k, params.get(k)!]] : [])));
    const body = new FormData();
    body.append("resume", file);
    body.append("utm", JSON.stringify(utm));
    body.append(
      "application",
      JSON.stringify({
        name: s.profile?.fullname || s.name,
        company: s.company,
        designation: s.role,
        linkedinUrl: s.profile?.url || (s.status === "typed" ? s.url : ""),
        linkedinStatus: s.status,
        linkedinProfile: s.status === "confirmed" ? s.profile : null,
        workAuth: s.workAuth,
      }),
    );
    const minWait = new Promise((r) => setTimeout(r, 2400));
    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; email?: string | null; error?: string } | null;
      await minWait;
      if (!res.ok || !data?.ok) {
        track("upload_failed", { source: "select", status: res.status });
        return dispatch({ type: "go", step: "resume", error: res.status === 413 ? errors.tooBigForServer : data?.error ?? errors.server });
      }
      track("resume_uploaded", { source: "select", email_found: Boolean(data.email), linkedin: s.status, work_auth: s.workAuth });
      dispatch({ type: "done", email: data.email ?? null });
    } catch {
      await minWait;
      dispatch({ type: "go", step: "resume", error: errors.network });
    }
  };

  const onFiles = (files: FileList) => {
    if (files.length > 1) return dispatch({ type: "error", message: errors.multiple });
    upload(files[0]);
  };

  const first = (s.profile?.fullname || s.name).split(/\s+/)[0] ?? "";
  const heading = "font-display text-[22px] leading-tight font-bold tracking-[-0.02em] text-ink outline-none";

  return (
    <div aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        {s.step === "you" && (
          <m.form key="you" {...panel} onSubmit={submitYou} noValidate className="space-y-5">
            <div>
              <h2 className={heading}>{copy.you.title}</h2>
              <p className="mt-1.5 text-[14px] text-muted">{copy.you.hint}</p>
            </div>
            {(["name", "company", "role"] as const).map((k) => (
              <label key={k} className="block">
                <span className="text-[12px] font-medium tracking-[0.06em] text-muted uppercase">{copy.you.fields[k].label}</span>
                <input
                  className={input}
                  value={s[k]}
                  onChange={(e) => dispatch({ type: "field", key: k, value: e.target.value })}
                  placeholder={copy.you.fields[k].placeholder}
                  autoComplete={k === "name" ? "name" : k === "company" ? "organization" : "organization-title"}
                  name={k}
                  id={`apply-${k}`}
                  required={k !== "role"}
                  maxLength={80}
                />
              </label>
            ))}
            {s.error && <p role="alert" className="text-[14px] text-danger">{s.error}</p>}
            <button type="submit" className={primary}>
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
          <m.form key="manual" {...panel} onSubmit={submitManual} noValidate className="space-y-5">
            <h2 ref={headingRef} tabIndex={-1} className={heading}>{copy.you.manualLabel}</h2>
            {(["name", "company"] as const).map((k) => (
              <label key={k} className="block">
                <span className="text-[12px] font-medium tracking-[0.06em] text-muted uppercase">{copy.you.fields[k].label}</span>
                <input
                  className={input}
                  value={s[k]}
                  onChange={(e) => dispatch({ type: "field", key: k, value: e.target.value })}
                  placeholder={copy.you.fields[k].placeholder}
                  autoComplete={k === "name" ? "name" : "organization"}
                  id={`apply-m-${k}`}
                  maxLength={80}
                />
              </label>
            ))}
            <input
              className={input}
              id="apply-url"
              inputMode="url"
              autoComplete="url"
              value={s.url}
              onChange={(e) => dispatch({ type: "field", key: "url", value: e.target.value })}
              placeholder={copy.you.manualPlaceholder}
              aria-label={copy.you.manualLabel}
            />
            {s.error && <p role="alert" className="text-[14px] text-danger">{s.error}</p>}
            <button type="submit" className={primary}>{copy.you.manualCta}</button>
            <div className="flex justify-between">
              <button type="button" className={textLink} onClick={() => dispatch({ type: "go", step: "you" })}>Back</button>
              <button type="button" className={textLink} onClick={() => dispatch({ type: "status", status: "skipped" })}>{copy.notFound.skip}</button>
            </div>
          </m.form>
        )}

        {s.step === "search" && (
          <m.div key="search" {...panel} className="space-y-5">
            <h2 ref={headingRef} tabIndex={-1} className={heading}>
              {s.checkingNext ? copy.confirm.trying : `Looking for ${s.name.split(/\s+/)[0] || "you"} on LinkedIn`}
            </h2>
            <SearchSkeleton />
            <ul className="space-y-3">
              {copy.search.lines.map((line, i) => {
                const state = i < s.stage ? "done" : i === s.stage ? "active" : "todo";
                return (
                  <li key={line} className="flex items-center gap-3 text-[15px]">
                    <Tick state={state} />
                    <span className={state === "todo" ? "text-[#6e6e73]" : "text-ink"}>
                      {line}
                      {state === "active" && "…"}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between gap-3 text-[13px] text-muted">
              <span>{copy.search.wait}</span>
              <button type="button" className={textLink} onClick={() => dispatch({ type: "status", status: "skipped" })}>
                {copy.search.skip}
              </button>
            </div>
          </m.div>
        )}

        {s.step === "confirm" && s.profile && (
          <m.div key={`confirm-${s.profile.slug}`} {...panel} className="space-y-5">
            <h2 ref={headingRef} tabIndex={-1} className={heading}>{copy.confirm.title}</h2>
            <ProfileCard profile={s.profile} />
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className={secondary} onClick={notMe}>{copy.confirm.no}</button>
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
            <div>
              <h2 ref={headingRef} tabIndex={-1} className={heading}>{copy.notFound.title}</h2>
              <p className="mt-1.5 text-[14px] text-muted">{s.error || copy.notFound.body}</p>
            </div>
            <button type="button" className={primary} onClick={() => dispatch({ type: "go", step: "manual" })}>{copy.you.manual}</button>
            <button type="button" className={secondary} onClick={() => dispatch({ type: "status", status: "skipped" })}>{copy.notFound.skip}</button>
          </m.div>
        )}

        {s.step === "resume" && (
          <m.div key="resume" {...panel} data-drop-target className="space-y-5">
            <div>
              <h2 ref={headingRef} tabIndex={-1} className={heading}>{copy.resume.title}</h2>
              <p className="mt-1.5 text-[14px] text-muted">{copy.resume.hint}</p>
            </div>
            {s.status === "confirmed" && s.profile && <MiniProfile profile={s.profile} />}
            <fieldset>
              <legend className="text-[12px] font-medium tracking-[0.06em] text-muted uppercase">{copy.resume.authLabel}</legend>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {copy.resume.auth.map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    aria-pressed={s.workAuth === value}
                    onClick={() => dispatch({ type: "auth", value: s.workAuth === value ? null : value })}
                    className="rounded-full border border-line-strong px-3.5 py-2 text-[13px] text-body transition-colors hover:border-ink aria-pressed:border-white aria-pressed:bg-white aria-pressed:text-black"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </fieldset>
            <DropZone
              inputId="select-resume"
              inputRef={fileRef}
              dragging={dragging}
              onDragChange={setDragging}
              onFiles={onFiles}
              error={s.error}
              hint="PDF or DOCX"
            />
            <Consent />
          </m.div>
        )}

        {s.step === "sending" && (
          <m.div key="sending" {...panel} className="space-y-5">
            <h2 ref={headingRef} tabIndex={-1} className={heading}>Putting your application together</h2>
            <Sending />
          </m.div>
        )}

        {s.step === "done" && (
          <m.div key="done" {...panel} className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[12px] font-semibold tracking-[0.06em] text-black uppercase">
                <span className="size-1.5 rounded-full bg-[#30d158]" /> Tal Select
              </span>
              <h2 ref={headingRef} tabIndex={-1} className="mt-4 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.025em] text-ink outline-none">
                {copy.done.title}
              </h2>
              <p className="mt-2 text-[15px] text-body">{copy.done.lead(first)}</p>
            </div>
            <ol className="relative space-y-5 border-l border-line-strong pl-6">
              {copy.done.steps.map((step, i) => (
                <m.li
                  key={step.when}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.12 } }}
                  className="relative"
                >
                  <span className={`absolute top-1.5 -left-[29px] size-2.5 rounded-full ${i === 0 ? "bg-[#30d158] shadow-[0_0_0_4px_#30d15833]" : "bg-line-strong"}`} />
                  <p className="text-[12px] font-semibold tracking-[0.08em] text-muted uppercase">{step.when}</p>
                  <p className="mt-1 text-[15px] leading-snug text-ink">{step.what}</p>
                </m.li>
              ))}
            </ol>
            <div className="space-y-1.5 rounded-2xl border border-line bg-surface-sunk p-4 text-[14px]">
              <p className="text-ink">{copy.done.until(sixMonthsFromNow())}</p>
              <p className="text-muted">{s.email ? copy.done.email(s.email) : copy.done.noEmail}</p>
              <p className="text-muted">{copy.done.free}</p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Tick({ state }: { state: "done" | "active" | "todo" }) {
  if (state === "done")
    return (
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cta text-cta-ink">
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m5 12.5 4.5 4.5L19 7.5" />
        </svg>
      </span>
    );
  if (state === "active") return <span className="animate-spin-slow size-6 shrink-0 rounded-full border-2 border-line-strong border-t-ink" />;
  return <span className="size-6 shrink-0 rounded-full border-2 border-line-strong" />;
}

/** A shimmering stand-in for the profile card while LinkedIn is searched. */
function SearchSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-sunk p-5" aria-hidden="true">
      <div className="flex items-center gap-4">
        <span className="size-14 rounded-full bg-line" />
        <span className="flex-1 space-y-2.5">
          <span className="block h-3.5 w-2/3 rounded-full bg-line" />
          <span className="block h-3 w-1/2 rounded-full bg-line" />
        </span>
      </div>
      <div className="mt-5 space-y-2.5">
        <span className="block h-3 w-5/6 rounded-full bg-line" />
        <span className="block h-3 w-3/5 rounded-full bg-line" />
      </div>
      <span className="shimmer absolute inset-0" />
    </div>
  );
}

function MiniProfile({ profile }: { profile: Profile }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-sunk p-3">
      {profile.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.photo} alt="" referrerPolicy="no-referrer" className="size-10 rounded-full object-cover" />
      ) : (
        <span className="size-10 rounded-full bg-line" />
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-medium text-ink">{profile.fullname}</span>
        <span className="block truncate text-[13px] text-muted">{profile.headline}</span>
      </span>
      <span className="text-[12px] font-medium text-[#30d158]">LinkedIn ✓</span>
    </div>
  );
}

function Sending() {
  const [done, setDone] = useState(0);
  const lines = copy.resume.sending;
  useEffect(() => {
    if (done >= lines.length - 1) return;
    const t = setTimeout(() => setDone((d) => d + 1), 800);
    return () => clearTimeout(t);
  }, [done, lines.length]);
  return (
    <ul className="space-y-3 rounded-2xl border border-line bg-surface-sunk p-5">
      {lines.map((line, i) => (
        <li key={line} className="flex items-center gap-3 text-[15px]">
          <Tick state={i < done ? "done" : i === done ? "active" : "todo"} />
          <span className={i > done ? "text-[#6e6e73]" : "text-ink"}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Consent() {
  const { privacyUrl, termsUrl } = site.legal;
  const c = site.upload.consent;
  return (
    <p className="text-center text-[12px] leading-relaxed text-muted">
      {c.before}{" "}
      <a href={privacyUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-muted/40 underline-offset-2 hover:text-ink">
        {c.privacy}
      </a>{" "}
      {c.and}{" "}
      <a href={termsUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-muted/40 underline-offset-2 hover:text-ink">
        {c.terms}
      </a>
      , and to Tal Select representing you for six months.
    </p>
  );
}
