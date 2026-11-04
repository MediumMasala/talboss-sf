/**
 * Round-2 copy adapter: maps the copywriter's keys in content/site.ts to what the components need.
 * The only strings still defined here are the field's key (no copy key yet) and the step-counter labels.
 */
import { site } from "@/content/site";

const A = site.select.apply;
const E = A.email;

const article = (w: string) => (/^[aeiou]/i.test(w) ? "an" : "a");

export const r2 = {
  // TEMP (no copy key yet): Steve's wording from STEVE_ROUND_1 fix 3.
  fieldLine: (n: string) => `Each dot is ${n} people in the Tal network. You're the blue one.`,
  fieldDone: "Dashed lines are your first intros, when you say yes.",

  pitch: {
    title: E.label,
    to: (role: string) => (role ? E.to(`${article(role)} ${role} role`) : E.toFallback),
    toLabel: E.toLabel,
    from: E.from,
    fromLabel: E.fromLabel,
    subjectLabel: E.subjectLabel,
    subject: E.subject,
    drafting: E.drafting,
    tag: E.draftTag,
    note: E.note,
    fallbackNote: A.done.pitch.fallbackNote,
    question: E.questions[0],
    needsMoreThin: E.needsMoreThin,
    needsMoreLinkedIn: E.needsMoreLinkedIn,
    placeholder: E.placeholder,
    sharpen: E.submit,
    sharpening: E.rewriting,
    rewritten: E.rewritten,
    next: E.keep,
    error: E.error,
  },

  resume: { title: A.resume.title, hint: A.resume.hint },

  /** Lookups refused for load, not because we couldn't find the person. `manual` (paste link) is the primary action. */
  busy: { rate_limited: A.rateLimited, daily_cap: A.dailyCap },

  progress: ["You", "LinkedIn", "Intro", "Resume", "Done"],
};
