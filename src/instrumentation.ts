/**
 * Next.js instrumentation hook — runs once per server startup.
 *
 * Used here to wire Sentry error + performance monitoring on the
 * server side. The init is env-gated: Sentry is a no-op when
 * `SENTRY_DSN` is unset, so local dev and preview deploys without
 * a DSN pay zero overhead (no transport, no network calls, no
 * build-time wrapping).
 *
 * NEXT_RUNTIME is set by Next.js to one of:
 *   - "nodejs" — the long-lived server (default)
 *   - "edge"   — middleware / edge API routes
 *
 * We init Sentry separately for each runtime because the
 * `Sentry.init()` options need to match the runtime (e.g. edge
 * can't use Node modules). One process import per runtime is the
 * canonical Sentry Next.js pattern.
 *
 * Sentry v10 is bundled — if you want to silence the build-time
 * "tunnel route" warnings without a DSN, set SENTRY_DSN anyway
 * (Sentry still no-ops without a real DSN inside init()).
 *
 * See:
 *   - https://docs.sentry.io/platforms/javascript/guides/nextjs/
 *   - https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register(): Promise<void> {
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) return; // no-op — local dev / preview deploys without DSN

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
