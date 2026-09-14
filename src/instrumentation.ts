/**
 * Next.js instrumentation hook — runs once per server startup.
 *
 * Phase 68: Sentry init DISABLED. The project uses Cloudflare Pages
 * for deploy (via @opennextjs/cloudflare) and Cloudflare Workers
 * runtimes don't support @sentry/nextjs (the Node server SDK uses
 * `node:diagnostics_channel` which doesn't exist in V8 isolates).
 * The dependency was removed entirely; this file is kept as a
 * no-op so Next.js's instrumentation hook contract is still satisfied.
 *
 * To re-enable: see the matching comment in src/instrumentation-client.ts.
 */
export {};