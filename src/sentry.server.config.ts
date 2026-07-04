/**
 * Sentry init — Node.js runtime (server-side).
 *
 * Traces sample rate: 10% of transactions in production. We
 * ship low-traffic marketing + portal traffic on SICA's free
 * tier (5K errors, 10K transactions) so 10% is comfortably
 * within budget.
 *
 * `sendDefaultPii: false` — never attach user IPs / cookies to
 * events by default. SICA doesn't need PII for error triage and
 * disabling it is the privacy-safe default.
 *
 * `beforeSendTransaction` strips out the high-frequency
 * liveness/health-check transaction — otherwise the free tier
 * burns through quota on `/api/health` pings.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
    // Drop noisy health-check transactions from the quota
    beforeSendTransaction(event) {
      const url = event.transaction ?? '';
      if (url === '/api/health' || url.endsWith('/api/health')) return null;
      return event;
    },
  });
}
