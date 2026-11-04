import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { FundingBar } from "@/components/FundingBar";
import { GoldenGate } from "@/components/GoldenGate";
import { Compare } from "@/components/select/Compare";
import { Faq } from "@/components/select/Faq";
import { FinalCta } from "@/components/select/FinalCta";
import { SelectHands } from "@/components/select/SelectHands";
import { SelectHero } from "@/components/select/SelectHero";
import { SelectHow } from "@/components/select/SelectHow";
import { SelectNav } from "@/components/select/SelectNav";
import { SelectProgressProvider } from "@/components/select/SelectProgress";
import { SelectProof } from "@/components/select/SelectProof";
import { Stats } from "@/components/select/Stats";
import { site } from "@/content/site";

const { title, description } = site.select.seo;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Tal Select", title, description },
  twitter: { card: "summary_large_image", title, description },
};

export default function Home() {
  return (
    <SelectProgressProvider>
      <FundingBar />
      {/* One stage for nav and hero, so the hands can reach behind both. */}
      <div className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,#2d2d2d55_0%,transparent_60%)]">
        <SelectHands />
        <GoldenGate variant="top" />
        <SelectNav />
        <main>
          <SelectHero />
          <GoldenGate variant="horizon" />
        </main>
      </div>
      <Stats />
      <SelectProof />
      <Compare />
      <SelectHow />
      <Faq />
      <FinalCta />
      <Footer />
    </SelectProgressProvider>
  );
}
