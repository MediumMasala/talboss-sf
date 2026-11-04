"use client";

import { useEffect, useRef, type RefObject } from "react";
import { site } from "@/content/site";

const copy = site.upload.idle;
const accept = [...site.upload.extensions, ...site.upload.mimeTypes].join(",");

type Props = {
  inputId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  dragging: boolean;
  onDragChange: (dragging: boolean) => void;
  onFiles: (files: FileList) => void;
  error: string | null;
  /** Overrides the default "PDF or DOCX" line. */
  hint?: string;
};

const hasFiles = (e: DragEvent) => Boolean(e.dataTransfer?.types.includes("Files"));

/**
 * One full-width white pill, like "Start hiring" on the live Tal Boss site. It's a <label> for a visually
 * hidden file input, so Tab + Enter/Space open the picker. Files can be dropped anywhere on the closest
 * `[data-drop-target]` (the hero card), or on the button itself when there isn't one.
 */
export function DropZone({ inputId, inputRef, dragging, onDragChange, onFiles, error, hint = copy.hint }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const handlers = useRef({ onDragChange, onFiles });
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  useEffect(() => {
    handlers.current = { onDragChange, onFiles };
  });

  useEffect(() => {
    const target = rootRef.current?.closest<HTMLElement>("[data-drop-target]") ?? rootRef.current;
    if (!target) return;
    // dragenter/dragleave fire for every child element; count depth so the state doesn't flicker.
    let depth = 0;
    const set = (on: boolean) => {
      target.dataset.dragging = String(on);
      handlers.current.onDragChange(on);
    };
    const enter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      set(true);
    };
    const over = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    };
    const leave = () => {
      depth = Math.max(0, depth - 1);
      if (depth === 0) set(false);
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      depth = 0;
      set(false);
      if (e.dataTransfer?.files.length) handlers.current.onFiles(e.dataTransfer.files);
    };
    target.addEventListener("dragenter", enter);
    target.addEventListener("dragover", over);
    target.addEventListener("dragleave", leave);
    target.addEventListener("drop", drop);
    return () => {
      target.removeEventListener("dragenter", enter);
      target.removeEventListener("dragover", over);
      target.removeEventListener("dragleave", leave);
      target.removeEventListener("drop", drop);
      delete target.dataset.dragging;
    };
  }, []);

  return (
    <div ref={rootRef}>
      <label
        htmlFor={inputId}
        data-dragging={dragging}
        className={[
          "flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-cta px-5 py-3.5 text-base font-medium text-cta-ink",
          "transition-[background-color,transform,box-shadow] duration-200 hover:bg-cta-hover active:scale-[0.99]",
          "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-ink",
          "data-[dragging=true]:scale-[1.02] data-[dragging=true]:shadow-[0_0_0_6px_var(--cta-ring)]",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          className="sr-only"
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={Boolean(error)}
          onChange={(e) => {
            if (e.target.files?.length) onFiles(e.target.files);
            // Reset so picking the same file again still fires onChange.
            e.target.value = "";
          }}
        />
        {dragging ? copy.dragging : copy.button}
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={["size-4", dragging ? "animate-nudge" : ""].join(" ")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5" />
          <path d="m6 11 6-6 6 6" />
        </svg>
      </label>

      <p id={hintId} className="mt-3 text-center text-[13px] text-muted">
        {hint}
      </p>

      <p id={errorId} role="alert" className="text-center text-sm text-danger empty:hidden data-[shown=true]:mt-2" data-shown={Boolean(error)}>
        {error}
      </p>
    </div>
  );
}
