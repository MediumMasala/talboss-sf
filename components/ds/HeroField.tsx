"use client";

import { m } from "framer-motion";
import { useLayoutEffect, useRef, useState, type InputHTMLAttributes } from "react";
import { travel } from "@/components/flow/motion";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onValue: (v: string) => void;
  placeholder: string;
  /** Shared-layout id for the typed text, so it can travel into the next screen. */
  layoutId?: string;
  error?: string | null;
  errorId?: string;
};

/**
 * Input / Hero Field (Figma 1:764): borderless, centred, 32/40 (28/34 on phones), the DS 2 px × 36 px caret.
 * A native input sits on top with transparent text; what you see is a mirror span (so it can be a layoutId and
 * carry the DS caret). When the selection isn't at the end we hand the caret back to the browser.
 * Long values shrink to fit the 560 column (down to 18 px) instead of scrolling out of view.
 */
export function HeroField({ value, onValue, placeholder, layoutId, error, errorId, id, ...rest }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);
  const [atEnd, setAtEnd] = useState(true);
  const [size, setSize] = useState<number | null>(null);
  // Arriving (e.g. Back from the next screen) the text travels in on the spring; once you type, re-centring is instant
  // so the text never lags the caret. (layoutDependency would block the snapshot the next screen travels from.)
  const [typed, setTyped] = useState(false);

  useLayoutEffect(() => {
    const fit = () => {
      const w = box.current?.clientWidth ?? 0;
      const el = measure.current;
      if (!el || !w) return;
      const base = parseFloat(getComputedStyle(el).fontSize);
      const need = el.scrollWidth + 8;
      setSize(need > w ? Math.max(18, Math.floor((base * w) / need)) : null);
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [value, placeholder]);

  const sync = () => {
    const el = input.current;
    if (el) setAtEnd(el.selectionStart === el.value.length && el.selectionEnd === el.value.length);
  };
  const style = size ? { fontSize: `${size}px`, lineHeight: `${Math.round(size * 1.25)}px` } : undefined;
  const ownCaret = focused && atEnd;

  return (
    <div className="relative w-full">
      <div ref={box} className="relative flex h-10 w-full items-center justify-center" onClick={() => input.current?.focus()}>
        <span ref={measure} aria-hidden className="t-field invisible absolute whitespace-pre">
          {value || placeholder}
        </span>
        <div aria-hidden className="pointer-events-none flex max-w-full items-center gap-px">
          {value ? (
            <m.span layoutId={layoutId} transition={typed ? { duration: 0 } : travel} className="t-field whitespace-pre text-s1100" style={style}>
              {value}
            </m.span>
          ) : null}
          {ownCaret ? <span className="caret h-8 md:h-9" style={size ? { height: size * 1.1 } : undefined} /> : null}
          {!value ? (
            <span className="t-field whitespace-pre text-s500" style={style}>
              {placeholder}
            </span>
          ) : null}
        </div>
        <input
          ref={input}
          id={id}
          value={value}
          onChange={(e) => {
            onValue(e.target.value);
            if (!typed) setTyped(true);
            requestAnimationFrame(sync);
          }}
          onSelect={sync}
          onKeyUp={sync}
          onFocus={() => {
            setFocused(true);
            sync();
          }}
          onBlur={() => setFocused(false)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          spellCheck={false}
          className="t-field absolute inset-0 w-full bg-transparent text-center text-transparent outline-none placeholder:text-transparent focus-visible:outline-none"
          style={{ ...style, caretColor: ownCaret ? "transparent" : "#000" }}
          placeholder={placeholder}
          {...rest}
        />
      </div>
      <p id={errorId} role={error ? "alert" : undefined} className={`t-helper absolute inset-x-0 top-full mt-1.5 text-center text-danger transition-opacity duration-150 ${error ? "opacity-100" : "opacity-0"}`}>
        {error}
      </p>
    </div>
  );
}
