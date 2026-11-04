"use client";

/** Jumps back to the form and puts the cursor in the first empty field. */
export function ApplyLink({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href="#apply"
      className={className}
      onClick={(e) => {
        const card = document.getElementById("apply");
        if (!card) return;
        e.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        card.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        const target = card.querySelector<HTMLElement>("input:not([type=file]), button");
        setTimeout(() => target?.focus({ preventScroll: true }), reduce ? 0 : 500);
      }}
    >
      {children}
    </a>
  );
}
