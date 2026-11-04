"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import s from "./leads.module.css";

/** LinkedIn photo through the signed proxy; initials when there's none or it no longer loads. */
export function Avatar({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);
  // A photo that failed before hydration never fires onError for React; catch it here.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth === 0) setFailed(true);
  }, []);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";
  return src && !failed ? (
    // eslint-disable-next-line @next/next/no-img-element -- same-origin signed proxy; next/image adds nothing here
    <img ref={img} className={s.avatar} src={src} alt="" width={56} height={56} loading="lazy" onError={() => setFailed(true)} />
  ) : (
    <div className={s.avatar} aria-hidden>
      {initials}
    </div>
  );
}

type SaveState = "idle" | "saving" | "saved" | "error";

/** Notes on one lead: saves 1 s after typing stops, and on blur. */
export function NotesField({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<SaveState>("idle");
  const saved = useRef(initial);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function save(next: string) {
    if (timer.current) clearTimeout(timer.current);
    if (next.trim() === saved.current.trim()) return;
    setState("saving");
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ notes: next }) });
      if (!res.ok) throw new Error(String(res.status));
      saved.current = next;
      setState("saved");
    } catch {
      setState("error");
    }
  }

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  return (
    <label className={s.notes}>
      <span className={s.notesLabel}>
        Notes
        <span className={s.saveState} aria-live="polite">
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : state === "error" ? "Couldn't save. Try again." : ""}
        </span>
      </span>
      <textarea
        value={value}
        rows={2}
        maxLength={5000}
        placeholder="Call notes, next step, who owns it"
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          setState("idle");
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => save(next), 1000);
        }}
        onBlur={() => save(value)}
      />
    </label>
  );
}

/** Pushes every lead the sheet hasn't confirmed, then reloads the counts. */
export function ResyncButton({ connected }: { connected: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  return (
    <span className={s.resync}>
      <button
        type="button"
        className={s.button}
        disabled={busy}
        title={connected ? "Push every lead the sheet hasn't confirmed" : "Set LEADS_WEBHOOK_URL and LEADS_WEBHOOK_SECRET first"}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            const res = await fetch("/api/leads/resync", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
            const body = (await res.json()) as { ok?: boolean; pushed?: number; pending?: number; error?: string };
            setMessage(body.ok ? `Pushed ${body.pushed ?? 0}. ${body.pending ?? 0} still pending.` : body.error ?? "Resync failed.");
            router.refresh();
          } catch {
            setMessage("Resync failed. Check your connection.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Resyncing…" : "Resync sheet"}
      </button>
      {message ? <span className={s.muted} aria-live="polite">{message}</span> : null}
    </span>
  );
}
