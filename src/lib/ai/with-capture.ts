import * as Sentry from '@sentry/nextjs';

/**
 * AI failure capture for Sentry — Phase 36.
 *
 * Wraps every catch block in every `/api/ai/*` route + the
 * news-automation-runner so that:
 *
 *   1. AI provider failures (network, auth, empty/malformed
 *      response, parse failure, schema violation) all surface
 *      to a single place. The admin sees them in Sentry, the
 *      solo dev sees them in email/Slack alerts.
 *
 *   2. The end-user still gets the existing error response —
 *      this helper is best-effort and never throws.
 *
 *   3. Per-route tags + per-call `extra` payload so the Sentry
 *      dashboard can group by `route` and filter by `aiProvider`.
 *
 * Why the env gate: matches the Phase 34 instrumentation.ts
 * pattern. When `SENTRY_DSN` is unset, the Sentry SDK has not
 * been initialized (the instrumentation hook is also DSN-gated),
 * so calling `captureException` here would be a no-op but still
 * touches the SDK surface. Early-return avoids it.
 *
 * Lazy import of `@sentry/nextjs`: keeps the helper usable from
 * unit tests and the dev console (where the SDK may not be
 * initialized) without crashing.
 */

/** Resolve the active AI provider name once per process — included as a tag on every event. */
const AI_PROVIDER_NAME = (process.env.AI_PROVIDER ?? 'doubao').toLowerCase();

interface CaptureExtra {
  /** Optional sub-source within the route — e.g. 'parse' | 'stream' | 'db-insert'. */
  stage?: string;
  /** Any route-specific context (model name, post slug, generated length, etc.). */
  [key: string]: unknown;
}

/**
 * Capture an error from an AI route's catch block to Sentry.
 * No-op when SENTRY_DSN is unset. Never throws.
 *
 * @param route  The route name (short slug, e.g. 'ai-chat'). Becomes the `route` Sentry tag.
 * @param err    The caught value. Errors stay typed as Error;
 *               strings/objects get wrapped via `new Error(String(err))`.
 * @param extra  Optional additional context as a flat object — surfaces in the Sentry event's
 *               `extra` field. Useful for: model name, response length, slug, retry attempt #.
 */
export function captureAIError(route: string, err: unknown, extra?: CaptureExtra): void {
  if (!process.env.SENTRY_DSN) return;

  // Wrap non-Error throws so Sentry gets a real Error + stack trace.
  const error = err instanceof Error ? err : new Error(typeof err === 'string' ? err : JSON.stringify(err));

  try {
    Sentry.captureException(error, {
      tags: {
        source: 'ai-route',
        route,
        aiProvider: AI_PROVIDER_NAME,
      },
      extra,
      level: 'error',
    });
  } catch {
    // Best-effort — a failing Sentry call must never block the
    // route's response or break the import chain.
  }
}
