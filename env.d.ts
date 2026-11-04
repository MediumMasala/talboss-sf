// Secrets that `wrangler types` can't see. Set with `wrangler secret put APIFY_TOKEN`; locally in .dev.vars.
interface CloudflareEnv {
  APIFY_TOKEN?: string;
}
