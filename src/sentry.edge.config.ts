/**
 * Sentry init — Edge runtime (middleware, edge API routes).
 *
 * Edge config mirrors the Node config. Kept separate because the
 * two runtimes bundle differently — `@sentry/nextjs` handles the
 * bundling automatically when you split via dynamic import in
 * instrumentation.ts.
 */
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: parseFloat(process.env.SENTRY_TRACES_SAMPLE_RATE ?? '0.1'),
    sendDefaultPii: false,
    beforeSendTransaction(event) {
      const url = event.transaction ?? '';
      if (url === '/api/health' || url.endsWith('/api/health')) return null;
      return event;
    },
  });
}
