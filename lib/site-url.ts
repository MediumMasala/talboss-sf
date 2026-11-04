/** Absolute site URL for canonical + OG tags. Set NEXT_PUBLIC_SITE_URL (at build time) once you have a domain. */
const LIVE_URL = "https://talboss-sf.yash-a8e.workers.dev";

export function siteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : LIVE_URL;
}
