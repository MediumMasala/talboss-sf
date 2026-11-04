"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { track } from "@/lib/analytics";
import { checkResumeFile, fileExtension } from "@/lib/validation";
import { DropZone } from "./DropZone";
import { useResumeFlow, type DropState } from "./flow";
import { MatchingSteps } from "./MatchingSteps";
import { Success } from "./Success";

const { errors } = site.upload;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

type Props = {
  /** Unique per instance on the page, e.g. "hero" or "final". */
  id: string;
  className?: string;
  /** Replaces the "PDF or DOCX" line under the button. */
  hint?: string;
  /** Show "By uploading, you agree to…" under the button. Off when the page shows it elsewhere (the footer). */
  consent?: boolean;
};

type UploadResult = { ok: true; email: string | null } | { ok: false; message: string; status: number };

async function uploadResume(file: File): Promise<UploadResult> {
  const params = new URLSearchParams(window.location.search);
  const utm = Object.fromEntries(UTM_KEYS.flatMap((k) => (params.get(k) ? [[k, params.get(k)!]] : [])));

  const body = new FormData();
  body.append("resume", file);
  body.append("utm", JSON.stringify(utm));

  try {
    const res = await fetch("/api/upload", { method: "POST", body });
    if (res.ok) {
      const data = (await res.json().catch(() => null)) as { email?: string | null } | null;
      return { ok: true, email: data?.email ?? null };
    }
    if (res.status === 413) return { ok: false, status: 413, message: errors.tooBigForServer };
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, status: res.status, message: data?.error ?? errors.server };
  } catch {
    return { ok: false, status: 0, message: errors.network };
  }
}

/**
 * The resume upload, start to finish: idle → dragging → matching → done (or error). No form:
 * picking a file uploads it, and the server reads the email off the resume.
 * Inside <ResumeFlowProvider> every instance on the page shares one flow.
 */
export function ResumeDrop({ id, className, hint, consent = true }: Props) {
  const { state, dispatch } = useResumeFlow();
  const reduced = useReducedMotion() ?? false;
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const foundEmail = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const domId = `resume-drop-${id}`;

  const isOwner = state.owner === id;
  const fileError = state.stage === "error" && state.error?.recover === "idle";
  const activeElsewhere = state.owner !== null && !isOwner && !fileError;
  // A rejected file only shows its error in the box it was dropped on; other boxes stay plain.
  const showZone = state.stage === "idle" || fileError;
  const [ownerBelow, setOwnerBelow] = useState(false);

  const dropState: DropState = dragging && showZone ? "dragging" : state.stage;

  useEffect(() => {
    if (!activeElsewhere) return;
    const me = document.getElementById(domId);
    const owner = document.getElementById(`resume-drop-${state.owner}`);
    setOwnerBelow(Boolean(me && owner && me.compareDocumentPosition(owner) & Node.DOCUMENT_POSITION_FOLLOWING));
  }, [activeElsewhere, domId, state.owner]);

  const upload = async (file: File) => {
    setUploaded(false);
    foundEmail.current = null;
    const result = await uploadResume(file);
    if (result.ok) {
      foundEmail.current = result.email;
      track("resume_uploaded", { source: id, email_found: Boolean(result.email) });
      setUploaded(true);
    } else {
      track("upload_failed", { source: id, status: result.status });
      dispatch({ type: "fail", message: result.message });
    }
  };

  const handleFiles = (files: FileList) => {
    if (files.length > 1) {
      track("resume_rejected", { source: id, reason: "multiple" });
      dispatch({ type: "reject", message: errors.multiple, owner: id });
      return;
    }
    const file = files[0];
    const check = checkResumeFile(file);
    if (!check.ok) {
      track("resume_rejected", { source: id, reason: check.reason, ext: fileExtension(file.name) });
      dispatch({ type: "reject", message: check.message, owner: id });
      return;
    }
    track("resume_selected", { source: id, ext: check.ext, size_kb: Math.round(file.size / 1024) });
    dispatch({ type: "select", file, owner: id });
    upload(file);
  };

  const startOver = () => {
    dispatch({ type: "reset" });
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const jumpToOwner = () => {
    track("jump_to_active_upload", { from: id, to: state.owner });
    const target = document.getElementById(`resume-drop-${state.owner}`);
    if (!target) return;
    target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    const focusable = target.querySelector<HTMLElement>("[tabindex='-1']") ?? target.querySelector<HTMLElement>("button, input");
    window.setTimeout(() => {
      focusable?.focus({ preventScroll: true });
    }, reduced ? 0 : 450);
  };

  let view: string;
  let content: React.ReactNode;

  if (activeElsewhere) {
    view = state.stage === "done" ? "elsewhere-done" : "elsewhere";
    content = <ElsewhereNotice done={state.stage === "done"} below={ownerBelow} onJump={jumpToOwner} />;
  } else if (showZone) {
    view = "zone";
    content = (
      <>
        <DropZone
          inputId={`${domId}-input`}
          inputRef={inputRef}
          dragging={dragging}
          onDragChange={setDragging}
          onFiles={handleFiles}
          error={fileError && isOwner ? state.error?.message ?? null : null}
          hint={hint}
        />
        {consent && <Consent />}
      </>
    );
  } else if (state.stage === "matching") {
    view = "matching";
    content = (
      <MatchingSteps
        reduced={reduced}
        uploaded={uploaded}
        onFinished={() => {
          track("match_shown", { source: id });
          dispatch({ type: "succeed", email: foundEmail.current });
        }}
      />
    );
  } else if (state.stage === "done") {
    view = "done";
    content = <Success email={state.email} onRestart={startOver} />;
  } else {
    view = "upload-error";
    content = (
      <UploadError
        message={state.error?.message ?? errors.server}
        onRetry={() => {
          if (!state.file) return startOver();
          dispatch({ type: "retry" });
          upload(state.file);
        }}
        onOther={startOver}
      />
    );
  }

  return (
    <div id={domId} data-state={dropState} className={["relative w-full", className].filter(Boolean).join(" ")}>
      <AnimatePresence mode="wait" initial={false}>
        <m.div
          key={view}
          initial={{ opacity: 0, y: 10, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.985 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {content}
        </m.div>
      </AnimatePresence>
    </div>
  );
}

function Consent() {
  const copy = site.upload.consent;
  const link = "underline decoration-muted/40 underline-offset-2 hover:text-ink";
  return (
    <p className="mt-3 text-center text-[12px] text-muted">
      {copy.before}{" "}
      <a href={site.legal.privacyUrl} target="_blank" rel="noopener noreferrer" className={link}>
        {copy.privacy}
      </a>{" "}
      {copy.and}{" "}
      <a href={site.legal.termsUrl} target="_blank" rel="noopener noreferrer" className={link}>
        {copy.terms}
      </a>
      .
    </p>
  );
}

function ElsewhereNotice({ done, below, onJump }: { done: boolean; below: boolean; onJump: () => void }) {
  const copy = site.upload.elsewhere;
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface-sunk px-5 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="text-body">{done ? copy.done : copy.inProgress}</p>
      {!done && (
        <button
          type="button"
          onClick={onJump}
          className="shrink-0 rounded-full bg-cta px-4 py-2 text-sm font-medium text-cta-ink transition-colors hover:bg-cta-hover"
        >
          {copy.jump} <span aria-hidden="true">{below ? "↓" : "↑"}</span>
        </button>
      )}
    </div>
  );
}

function UploadError({ message, onRetry, onOther }: { message: string; onRetry: () => void; onOther: () => void }) {
  const copy = site.upload.uploadError;
  return (
    <div role="alert" className="rounded-2xl border border-danger/40 bg-surface-sunk p-5 text-left">
      <p className="text-lg font-semibold text-ink">{copy.title}</p>
      <p className="mt-1 text-muted">{message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onRetry} className="rounded-full bg-cta px-5 py-2.5 text-sm font-medium text-cta-ink hover:bg-cta-hover active:scale-[0.98]">
          {copy.retry}
        </button>
        <button type="button" onClick={onOther} className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium text-ink hover:border-muted">
          {copy.other}
        </button>
      </div>
    </div>
  );
}
