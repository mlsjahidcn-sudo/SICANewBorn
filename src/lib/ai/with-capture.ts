/**
 * AI failure capture for Sentry — Phase 36.
 *
 * Phase 68: Sentry capture DISABLED. The project uses Cloudflare
 * Pages for deploy, and Cloudflare Workers' V8 isolate runtime
 * can't load @sentry/nextjs (Node-only deps). The dependency was
 * removed; this is a no-op stub that preserves the helper's
 * call-site signature so we can re-enable later without changing
 * every catch block in src/app/api/ai/*.
 *
 * Re-enable: import { captureException } from '@sentry/cloudflare'
 * (or @sentry/edge) and restore the real implementation.
 */
export interface CaptureExtra {
  stage?: string;
  [key: string]: unknown;
}

export function captureAIError(
  _route: string,
  _err: unknown,
  _extra?: CaptureExtra,
): void {
  // no-op — Sentry is not configured in the Cloudflare deploy target.
  // The helper signature is preserved so callers don't need to change.
}
