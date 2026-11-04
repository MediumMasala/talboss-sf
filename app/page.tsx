import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { Controls } from "@/components/tal/Controls";
import { PHOTOS, srcset } from "@/components/tal/photos";
import { AgentPairs, EndCredits, Faq, Origin, SampleLetter, TermsLetter, TopBar } from "@/components/tal/Sections";
import { Stage } from "@/components/tal/Stage";
import { site } from "@/content/site";

const { title, description, siteName } = site.select.seo;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName, title, description },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#14261d", colorScheme: "dark" };

export default function Home() {
  // The opening frame is the LCP: preload the right crop for the screen, AVIF first.
  const hero = PHOTOS.reader;
  preload(`/photos/${hero.tall!.base}-900.avif`, { as: "image", type: "image/avif", fetchPriority: "high", imageSrcSet: srcset(hero.tall!, "avif"), imageSizes: "100vw", media: "(max-width: 767px)" });
  preload(`/photos/${hero.variants[0].base}-1920.avif`, { as: "image", type: "image/avif", fetchPriority: "high", imageSrcSet: srcset(hero.variants[0], "avif"), imageSizes: "100vw", media: "(min-width: 768px)" });
  return (
    <div className="relative">
      <TopBar />
      <main>
        <Stage />
        <AgentPairs />
        <SampleLetter />
        <Origin />
        <TermsLetter />
        <Faq />
      </main>
      <EndCredits />
      <Controls />
    </div>
  );
}
