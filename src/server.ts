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
 * Detection order (first match wins):
 *   1. `COZE_PROJECT_ENV=DEV`  → dev mode (Coze dev)
 *   2. `NODE_ENV=development`  → dev mode (standard)
 *   3. anything else           → production mode (default)
 *
 * This way Railway (NODE_ENV=production by default in their
 * Nixpacks builder) gets the production build. Coze still works
 * because they set COZE_PROJECT_ENV=PROD in prod and =DEV in dev.
 */
const dev =
  process.env.COZE_PROJECT_ENV === 'DEV' ||
  process.env.NODE_ENV === 'development';

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
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });
  server.once('error', (err) => {
    console.error('[server] fatal', err);
    process.exit(1);
  });
  server.listen(port, () => {
    console.log(
      `[server] listening on http://${hostname}:${port} (mode=${dev ? 'development' : 'production'})`,
    );
    // Make this visible in `docker logs` / `railway logs` / `fly logs`
    // so deployment-success is obvious in the platform's log viewer.
  });
});
