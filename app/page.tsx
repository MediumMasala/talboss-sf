import type { Viewport } from "next";
import { BrandMarquee } from "@/components/BrandMarquee";
import { Footer } from "@/components/Footer";
import { GoldenGate } from "@/components/GoldenGate";
import { LightHero } from "@/components/light/LightHero";
import { LightNav } from "@/components/light/LightNav";
import { LightSteps } from "@/components/light/LightSteps";
import { StickyUploadBar } from "@/components/light/StickyUploadBar";
import { ResumeFlowProvider } from "@/components/resume-drop";

export const viewport: Viewport = { themeColor: "#f6f7f9", colorScheme: "light" };

export default function Home() {
  return (
    <div className="theme-light pb-24">
      <ResumeFlowProvider>
        <LightNav />
        <main>
          <LightHero />
          <GoldenGate variant="top" />
          <GoldenGate variant="horizon" />
          <BrandMarquee />
          <LightSteps />
        </main>
        <Footer consent />
        <StickyUploadBar />
      </ResumeFlowProvider>
    </div>
  );
}
