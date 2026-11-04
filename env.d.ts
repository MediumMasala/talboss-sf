// Secrets that `wrangler types` can't see. Set with `wrangler secret put <NAME>`; locally in .dev.vars.
interface CloudflareEnv {
  APIFY_TOKEN?: string;
  /** Google AI Studio key for /api/pitch (same key boss-live uses). */
  GEMINI_API_KEY?: string;
}
