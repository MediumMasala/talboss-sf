import type { Metadata, Viewport } from "next";
import { fontVars } from "@/components/select/fonts";
import { SelectAbout, SelectDeal, SelectFaq, SelectFinal, SelectFooter, SelectHow } from "@/components/select/Sections";
import { SelectHero } from "@/components/select/SelectHero";
import { site } from "@/content/site";

const { title, description } = site.select.seo;

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Tal Select", title, description },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#f4f2ec", colorScheme: "light" };

export default function Home() {
  return (
    <div className={`ts-root ${fontVars} font-sans`}>
      <SelectHero />
      <SelectHow />
      <SelectDeal />
      <SelectAbout />
      <SelectFaq />
      <SelectFinal />
      <SelectFooter />
    </div>
  );
}
