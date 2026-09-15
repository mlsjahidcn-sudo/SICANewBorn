import { NextRequest, NextResponse } from 'next/server';
import { processPendingDrips } from '@/lib/email/drip/scheduler';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/email/drip-cron
 *
 * Manually trigger the email drip scheduler. The default cadence
 * (every 5 minutes via setInterval) handles most cases, but you
 * can hit this endpoint from an external scheduler (cron-job.org,
 * Railway Cron, GitHub Actions cron) for stricter SLAs or to
 * backfill after a server restart.
 *
 * Secured with a shared secret in the `x-cron-secret` header
 * (timing-safe compare via src/lib/cron-auth.ts). If
 * DRIP_CRON_SECRET is not set, the endpoint fails CLOSED in
 * production (503) and stays open only outside production.
 *
 * Returns a JSON summary of what was processed.
 */
export async function GET(request: NextRequest) {
  const cron = verifyCronSecret(request, 'DRIP_CRON_SECRET');
  if (!cron.ok) {
    return NextResponse.json({ error: cron.error }, { status: cron.status });
  }

  const start = Date.now();
  const result = await processPendingDrips();
  const durationMs = Date.now() - start;

  console.log('[drip-cron]', JSON.stringify({ ...result, durationMs }));

  return NextResponse.json({
    ok: true,
    ...result,
    durationMs,
    timestamp: new Date().toISOString(),
  });
}
