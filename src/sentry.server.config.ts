/**
 * Sentry init — Node.js runtime (server-side).
 *
 * Phase 68: Sentry init DISABLED. The project now deploys to
 * Cloudflare Pages (via @opennextjs/cloudflare) where the V8
 * isolate runtime can't load @sentry/nextjs (Node-only deps like
 * `node:diagnostics_channel`). The dependency was removed; this
 * file is kept as a no-op so the dynamic-import contract from
 * src/instrumentation.ts is still satisfied.
 *
 * See src/instrumentation-client.ts for the re-enable recipe.
 */
export {};