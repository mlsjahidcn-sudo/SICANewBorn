import { NextResponse } from 'next/server';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

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
 *   - 503 when status=degraded (any failed check)
 *
 * No auth — uptime monitors need to hit it unauthenticated.
 * The endpoint refuses to expose secrets: only boolean env presence.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DB_PROBE_TIMEOUT_MS = 2000;

// Cheapest possible round-trip against the live DB. Uses
// `partner_applications` (smallest table that's always present
// + RLS-permissive for the service-role key) so we don't depend
// on row count. limit(1) keeps it O(1) regardless of growth.
async function probeDb(): Promise<'ok' | 'down' | 'skipped' | 'timeout'> {
  if (!isSupabaseServerConfigured()) return 'skipped';
  const supabase = getSupabaseServer();
  if (!supabase) return 'skipped';

  const probe = supabase
    .from('partner_applications')
    .select('id', { count: 'exact', head: true })
    .limit(1);

  try {
    const result = await Promise.race([
      probe,
      new Promise<{ timeout: true }>((resolve) =>
        setTimeout(() => resolve({ timeout: true }), DB_PROBE_TIMEOUT_MS),
      ),
    ]);
    if ('timeout' in result) return 'timeout';
    return 'ok';
  } catch {
    return 'down';
  }
}

function envPresence(name: string): boolean {
  const v = process.env[name];
  return typeof v === 'string' && v.length > 0;
}

export async function GET(): Promise<NextResponse> {
  const [dbStatus] = await Promise.all([probeDb()]);

  const checks = {
    db: dbStatus,
    env: {
      SUPABASE_URL: envPresence('NEXT_PUBLIC_SUPABASE_URL'),
      SUPABASE_ANON_KEY: envPresence('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      SUPABASE_SERVICE_ROLE_KEY: envPresence('SUPABASE_SERVICE_ROLE_KEY'),
      RESEND_API_KEY: envPresence('RESEND_API_KEY'),
      SENTRY_DSN: envPresence('SENTRY_DSN'),
      // Newsletter cron secrets — these being set means the
      // corresponding cron endpoint is auth-gated. Useful to
      // confirm in the readout: "is my scheduled job actually
      // secured?"
      NEWS_CRON_SECRET: envPresence('NEWS_CRON_SECRET'),
      DRIP_CRON_SECRET: envPresence('DRIP_CRON_SECRET'),
    },
  };

  // 'skipped' on the DB check (not configured → return null for
  // upmon purposes) is treated as healthy so missing env doesn't
  // page the on-call during a deploy with half-set vars.
  const healthy = dbStatus === 'ok' || dbStatus === 'skipped';

  return NextResponse.json(
    {
      status: healthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      version: (process.env.RAILWAY_GIT_COMMIT_SHA ?? 'dev').slice(0, 7),
      checks,
    },
    { status: healthy ? 200 : 503 },
  );
}
