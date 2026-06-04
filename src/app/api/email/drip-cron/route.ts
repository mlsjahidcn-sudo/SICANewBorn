import { NextRequest, NextResponse } from 'next/server';
import { processPendingDrips } from '@/lib/email/drip/scheduler';

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
 * Secured with a shared secret in the `x-cron-secret` header.
 * If DRIP_CRON_SECRET is not set, the endpoint is unauthenticated
 * (dev-friendly but should be configured for production).
 *
 * Returns a JSON summary of what was processed.
 */
export async function GET(request: NextRequest) {
  const expected = process.env.DRIP_CRON_SECRET;
  if (expected) {
    const got = request.headers.get('x-cron-secret');
    if (got !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
