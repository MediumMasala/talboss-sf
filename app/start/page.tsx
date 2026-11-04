import type { Metadata } from "next";
import { Flow } from "@/components/flow/Flow";
import { site } from "@/content/site";

export const metadata: Metadata = {
  title: `${site.select.topBar.cta} · Tal`,
  alternates: { canonical: "/start" },
  robots: { index: false },
};

/** The onboarding flow: one question per screen (Figma pages 03 Flow·1440 and 04 Flow·390). */
export default function Start() {
  return <Flow />;
}
