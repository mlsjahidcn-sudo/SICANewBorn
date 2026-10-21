import { NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/health
 *
 * Liveness + readiness probe. Designed for uptime monitors
 * (Better Uptime, UptimeRobot, cron-job.org, Pingdom) and for
 * Railway's HTTP health check.
 *
 * Returns:
 *   - `status: 'ok' | 'degraded'`
 *   - `checks.db` — `'ok'` if a minimal `SELECT 1`-style query
 *     against `partner_applications` succeeds, `'down'` if the
 *     query errors, `'skipped'` if the service client is not
 *     configured, `'timeout'` if the query takes >2s
 *   - `checks.env` — `['SUPABASE_URL', 'SUPABASE_ANON_KEY',
 *     'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'SENTRY_DSN']`
 *     → whether each is set (no values echoed — just true/false)
 *   - `version` — short git SHA if `RAILWAY_GIT_COMMIT_SHA` is
 *     set (Railway auto-injects it), else `'dev'`
 *   - `uptimeSeconds` — `process.uptime()` rounded down
 *
 * HTTP status:
 *   - 200 when status=ok
 *   - 503 when the DB is unavailable or required DB configuration is missing
 *   - Optional integrations are reported separately and do not determine readiness.
 *
 * No auth — uptime monitors need to hit it unauthenticated.
 * The endpoint refuses to expose secrets: only boolean env presence.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DB_PROBE_TIMEOUT_MS = 2000;

// A bounded read verifies access without counting the whole table.
async function probeDb(): Promise<'ok' | 'down' | 'skipped' | 'timeout'> {
  const { url, anonKey, serviceKey } = getServerEnv();
  if (!url || !anonKey || !serviceKey) return 'skipped';
  let timer: ReturnType<typeof setTimeout> | undefined;
  const controller = new AbortController();
  try {
    const probe = buildServiceClient()
      .from('partner_applications')
      .select('id', { head: true })
      .limit(1)
      .abortSignal(controller.signal);
    const result = await Promise.race([
      probe,
      new Promise<{ timeout: true }>((resolve) => {
        timer = setTimeout(() => {
          resolve({ timeout: true });
          controller.abort();
        }, DB_PROBE_TIMEOUT_MS);
      }),
    ]);
    if ('timeout' in result) return 'timeout';
    return result.error ? 'down' : 'ok';
  } catch {
    return 'down';
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function envPresence(name: string): boolean {
  const v = process.env[name];
  return typeof v === 'string' && v.length > 0;
}

export async function GET(): Promise<NextResponse> {
  const { url, anonKey, serviceKey } = getServerEnv();
  const dbStatus = await probeDb();

  const checks = {
    db: dbStatus,
    env: {
      SUPABASE_URL: Boolean(url),
      SUPABASE_ANON_KEY: Boolean(anonKey),
      SUPABASE_SERVICE_ROLE_KEY: Boolean(serviceKey),
      RESEND_API_KEY: envPresence('RESEND_API_KEY'),
      SENTRY_DSN: envPresence('SENTRY_DSN'),
      // Newsletter cron secrets — these being set means the
      // corresponding cron endpoint is auth-gated. Useful to
      // confirm in the readout: "is my scheduled job actually
      // secured?"
      NEWS_CRON_SECRET: envPresence('NEWS_CRON_SECRET'),
      DRIP_CRON_SECRET: envPresence('DRIP_CRON_SECRET'),
      FAQ_CRON_SECRET: envPresence('FAQ_CRON_SECRET'),
    },
  };

  const healthy = dbStatus === 'ok';

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      version: (process.env.RAILWAY_GIT_COMMIT_SHA ?? 'dev').slice(0, 7),
      checks,
    },
    { status: healthy ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  );
}
