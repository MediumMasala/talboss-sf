// Secrets that `wrangler types` can't see. Set with `wrangler secret put <NAME>`; locally in .dev.vars.
interface CloudflareEnv {
  APIFY_TOKEN?: string;
  /** Unused since v4 (the pitch was removed). Kept so an existing Worker secret doesn't break types. */
  GEMINI_API_KEY?: string;
  /** Opens the leads desk: /leads?key=<LEADS_KEY> (sets an HttpOnly cookie). Unset → /leads is a 404. */
  LEADS_KEY?: string;
  /** The Google Apps Script web app ("…/exec") that writes each lead into the team's sheet (scripts/leads-sheet.gs). */
  LEADS_WEBHOOK_URL?: string;
  /** Shared with the Apps Script (Script property LEADS_WEBHOOK_SECRET); sent in the POST body. */
  LEADS_WEBHOOK_SECRET?: string;
}
