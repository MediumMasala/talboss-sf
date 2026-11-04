// Secrets that `wrangler types` can't see. Set with `wrangler secret put <NAME>`; locally in .dev.vars.
interface CloudflareEnv {
  APIFY_TOKEN?: string;
  /** Unused since v4 (the pitch was removed). Kept so an existing Worker secret doesn't break types. */
  GEMINI_API_KEY?: string;
}
