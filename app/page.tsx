import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import { BehindTal } from "@/components/landing/BehindTal";
import { Chat } from "@/components/landing/Chat";
import { Deal } from "@/components/landing/Deal";
import { Faq } from "@/components/landing/Faq";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import { How } from "@/components/landing/How";
import { LandingView } from "@/components/landing/LandingView";
import { Marquee } from "@/components/landing/Marquee";
import { Nav } from "@/components/landing/Nav";
import { RaisedBar } from "@/components/landing/RaisedBar";
import { SmoothScroll } from "@/components/landing/SmoothScroll";
import { site } from "@/content/site";

const { title, description, siteName } = site.select.seo;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName, title, description },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

/** The landing (Figma 01 Landing · 1440 4:42 / 02 Landing · 390 5:64). Section order = Figma order. */
export default function Home() {
  // The hero still is the LCP: preload the right crop, AVIF first.
  preload("/art/hero-4x5-768.avif", { as: "image", type: "image/avif", fetchPriority: "high", imageSrcSet: "/art/hero-4x5-480.avif 480w, /art/hero-4x5-768.avif 768w, /art/hero-4x5-928.avif 928w", imageSizes: "100vw", media: "(max-width: 767px)" });
  preload("/art/hero-16x9-1376.avif", { as: "image", type: "image/avif", fetchPriority: "high", imageSrcSet: "/art/hero-16x9-1024.avif 1024w, /art/hero-16x9-1376.avif 1376w", imageSizes: "100vw", media: "(min-width: 768px)" });
  return (
    <div className="on-dark min-h-dvh bg-black text-white">
      <RaisedBar />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Chat />
        <BehindTal />
        <How />
        <Deal />
        <Faq />
      </main>
      <Footer />
      <SmoothScroll />
      <LandingView />
    </div>
  );
}
