import type { Metadata, Viewport } from "next";
import { BrandMarquee } from "@/components/BrandMarquee";
import { Footer } from "@/components/Footer";
import { GoldenGate } from "@/components/GoldenGate";
import { FundingBar } from "@/components/FundingBar";
import { Hands } from "@/components/Hands";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { Nav } from "@/components/Nav";
import { ResumeFlowProvider } from "@/components/resume-drop";

// The original dark page, kept for comparison. Not indexed.
export const metadata: Metadata = { robots: { index: false, follow: false }, alternates: { canonical: "/" } };

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default function DarkHome() {
  return (
    <ResumeFlowProvider>
      <FundingBar />
      {/* One stage for nav, hero and steps, so the hands can reach behind all of them. */}
      <div className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#2d2d2d55_0%,transparent_60%)]">
        <Hands />
        <GoldenGate variant="top" />
        <Nav />
        <main>
          <Hero />
          <GoldenGate variant="horizon" />
          <BrandMarquee />
          <HowItWorks />
        </main>
      </div>
      <Footer />
    </ResumeFlowProvider>
  );
}
