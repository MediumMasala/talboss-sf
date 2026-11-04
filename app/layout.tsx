import type { Metadata, Viewport } from "next";
import { Providers } from "@/components/Providers";
import { fontVars } from "@/components/tal/fonts";
import { site } from "@/content/site";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: site.seo.title,
  description: site.seo.description,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: site.select.seo.siteName, title: site.seo.title, description: site.seo.description },
  twitter: { card: "summary_large_image", title: site.seo.title, description: site.seo.description },
};

export const viewport: Viewport = { themeColor: "#14261d", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={fontVars}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
