import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import staticAssetsCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache';

// Deployment adapter only. Development and production builds use official Next.js.
export default defineCloudflareConfig({ incrementalCache: staticAssetsCache });
