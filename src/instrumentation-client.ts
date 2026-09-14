/**
 * Sentry init — browser side.
 *
 * Phase 68: Sentry init DISABLED. The project uses Cloudflare Pages
 * for deploy (via @opennextjs/cloudflare) and Cloudflare Workers
 * runtimes don't support the Node.js server SDK that @sentry/nextjs
 * ships (`node:diagnostics_channel` not available in the V8 isolate).
 * The dependency was removed entirely; this file is kept as a
 * no-op so Next.js's instrumentation hook contract is still satisfied.
 *
 * To re-enable error tracking:
 *   1. Add `@sentry/cloudflare` (or `@sentry/edge`) as a dep
 *   2. Replace the placeholder with that SDK's init call
 *   3. Make sure SENTRY_DSN is set in the Cloudflare project env
 */
export {};