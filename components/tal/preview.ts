/**
 * Dev-only mock states for /?preview=<step>. Only read behind a NODE_ENV === "development" check, so the
 * production build drops it as dead code. The person is fictional; no photo, so the card shows initials.
 */
import type { Profile } from "@/lib/linkedin";

export const PREVIEW_STEPS = ["you", "search", "confirm", "notFound", "rateLimited", "dailyCap", "searchDown", "offline", "pitch", "sharpened", "resume", "noResume", "sending", "done"] as const;
export type PreviewStep = (typeof PREVIEW_STEPS)[number];

export const mockPerson = { name: "Jordan Avery", company: "Parallax Labs", role: "Senior ML Engineer" };

export const mockProfile: Profile = {
  fullname: "Jordan Avery",
  headline: "Senior ML Engineer at Parallax Labs · inference, evals, and the boring parts that make models fast",
  photo: "",
  location: "San Francisco Bay Area",
  url: "https://www.linkedin.com/in/jordan-avery-example",
  slug: "jordan-avery-example",
  currentCompany: "Parallax Labs",
  companyLogo: "",
  experience: [
    { title: "Senior ML Engineer", company: "Parallax Labs", duration: "2 yrs 4 mos", location: "San Francisco", current: true, logo: "" },
    { title: "ML Engineer", company: "Orbitline", duration: "2 yrs 9 mos", location: "Seattle", current: false, logo: "" },
    { title: "Software Engineer", company: "Fieldnote", duration: "1 yr 11 mos", location: "New York", current: false, logo: "" },
  ],
  score: 0.92,
};

/** Verbatim POST /api/pitch output for mockProfile (source "ai", needsMore true), verbatim from docs/team/PITCH_SAMPLES.md (round 3). */
export const mockPitch =
  "Jordan, a Senior ML Engineer at Parallax Labs, builds the inference and evaluation systems that make models fast. Jordan focuses on the boring parts of ML like performance and reliability, after working on engineering teams at Orbitline and Fieldnote.";

/** The one line the person adds on the pitch step, and the rewrite that comes back (verbatim live /api/pitch with that answer, round 3). */
export const mockAnswer = "Cut p99 latency on our inference stack from 900 ms to 180 ms";

export const mockSharpened =
  "Jordan, a Senior ML Engineer at Parallax Labs, focuses on inference, evals, and the boring parts that make models fast. Jordan cut p99 latency on the inference stack from 900 ms to 180 ms.";
