import path from "node:path";
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { site } from "./content/site";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The dev badge sits on the flow's Back pill; screenshots and the /preview sheet read cleaner without it.
  devIndicators: false,
  // Pin the root to this folder; otherwise lockfiles in parent folders get picked up.
  turbopack: { root: path.join(__dirname) },
  // Privacy + terms live on grapevine.in; keep short local URLs that point there.
  async redirects() {
    return [
      { source: "/privacy", destination: site.legal.privacyUrl, permanent: false },
      { source: "/terms", destination: site.legal.termsUrl, permanent: false },
    ];
  },
};

export default nextConfig;

// Gives `next dev` local versions of the Cloudflare bindings (KV, D1, ADMIN_KEY from .dev.vars).
initOpenNextCloudflareForDev();
