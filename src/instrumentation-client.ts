/**
 * Sentry init — browser side.
 *
 * Runs once per page load via the Next.js instrumentation-client
 * convention (Next 15+ App Router). Env-gated on SENTRY_DSN — if
 * unset, the SDK never initializes and pays zero JS cost.
 *
 * `tracesSampleRate: 0` by default — we only ship errors from
 * the browser. Flip to 0.1 for performance monitoring once the
 * free tier budget allows (SICA isn't bandwidth-tight on error
 * counts but transactions add up fast on the marketing pages).
 *
 * `replaysSessionSampleRate: 0` — session replay is paid.
 * `replaysOnErrorSampleRate: 0` — error-attached replay is also
 * paid. Keep at 0 until SICA is on a paid plan that includes it.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (typeof window !== 'undefined' && dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0, // flip to 0.1 when ready to ship perf data
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
    sendDefaultPii: false,
  });
}
