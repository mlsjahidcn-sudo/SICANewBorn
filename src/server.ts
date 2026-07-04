import { createServer } from 'http';
import next from 'next';

/**
 * Custom server entry. Wraps Next.js so we can deploy as a single
 * `node dist/server.js` process on Railway / any container host.
 *
 * Why the dev-mode detection matters: the original Coze-era code
 * checked `COZE_PROJECT_ENV !== 'PROD'`, which is fine on the Coze
 * platform (where the env var is always set) but DEFAULTS TO DEV
 * MODE on Railway, Render, Fly, Docker, etc. — because those hosts
 * don't set `COZE_PROJECT_ENV`. Running Next.js in dev mode in
 * production tries to acquire `.next/dev/lock`, which is exactly the
 * failure mode we hit on Railway.
 *
 * Detection logic — read in order, first match wins:
 *   1. `COZE_PROJECT_ENV=DEV`         → dev (Coze dev)
 *   2. `COZE_PROJECT_ENV=PROD`        → production (Coze prod)
 *   3. `NODE_ENV=production`          → production (Railway, Docker, npm start)
 *   4. anything else                  → dev (default; covers `pnpm dev` locally)
 *
 * This way:
 *   - Local `pnpm dev`              → dev mode (no env vars set)
 *   - Local `NODE_ENV=production node dist/server.js` → production
 *   - Railway / Docker             → production (NODE_ENV=production by default)
 *   - Coze dev                      → dev (COZE_PROJECT_ENV=DEV)
 *   - Coze prod                     → production (COZE_PROJECT_ENV=PROD)
 */
function resolveDevMode(): boolean {
  if (process.env.COZE_PROJECT_ENV === 'DEV') return true;
  if (process.env.COZE_PROJECT_ENV === 'PROD') return false;
  if (process.env.NODE_ENV === 'production') return false;
  return true; // default to dev (matches local `pnpm dev` behavior)
}
const dev = resolveDevMode();

const hostname = process.env.HOSTNAME || '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Let Next parse the URL itself — it handles pathname, query
      // string, basePath, locales, and trailing slashes correctly.
      // Passing a partial parsed object (as the old `url.parse` code
      // did) was a TypeScript-unsafe workaround.
      await handle(req, res);
    } catch (err) {
      console.error('[server] error handling', req.url, err);
      // Capture to Sentry before responding. Lazy import keeps the
      // server.ts bundle thin when SENTRY_DSN is unset (no-op below).
      // Safe even if init() hasn't run yet — captureException queues
      // internally and ships once the SDK is ready.
      if (process.env.SENTRY_DSN) {
        try {
          const Sentry = (await import('@sentry/nextjs')).default;
          Sentry.captureException(err, { tags: { source: 'custom-server', url: req.url ?? '' } });
        } catch {
          // Best-effort — never block the error response on Sentry.
        }
      }
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  server.once('error', async (err) => {
    console.error('[server] fatal', err);
    if (process.env.SENTRY_DSN) {
      try {
        const Sentry = (await import('@sentry/nextjs')).default;
        Sentry.captureException(err, { tags: { source: 'custom-server-listener' } });
        // Give Sentry a chance to flush before we exit.
        await Sentry.flush(2000).catch(() => {});
      } catch {
        // Best-effort
      }
    }
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(
      `[server] listening on http://${hostname}:${port} (mode=${dev ? 'development' : 'production'})`,
    );
    // Make this visible in `docker logs` / `railway logs` / `fly logs`
    // so deployment-success is obvious in the platform's log viewer.
    // Start the background email-drip scheduler (5-minute tick).
    // Idempotent — only starts once per process. Auto-skips if
    // Supabase or Resend env vars are not set.
    if (!dev) {
      import('./lib/email/drip/scheduler').then((m) => m.startDripScheduler()).catch((err) =>
        console.error('[server] failed to start drip scheduler', err),
      );
    } else {
      console.log('[server] dev mode — drip scheduler disabled (set NODE_ENV=production to enable)');
    }
  });
});
