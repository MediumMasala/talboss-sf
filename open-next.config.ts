import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// The page is fully prerendered and never revalidates, so serve it straight from static assets.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
