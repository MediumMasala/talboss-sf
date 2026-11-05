/**
 * Runs once when the server starts. On Railway (a Node server with DATA_DIR) it opens ${DATA_DIR}/talboss.sqlite and
 * applies any new migrations/*.sql before the first request, so a bad migration fails the deploy instead of an upload.
 * On Cloudflare (no DATA_DIR) it does nothing. See docs/team/RAILWAY.md.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.DATA_DIR) return;
  const { nodeEnv, useNodeBindings } = await import("./lib/node-bindings");
  if (useNodeBindings()) nodeEnv();
}
