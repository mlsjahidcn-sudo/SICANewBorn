import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/webhooks/[id]/deliveries
 * Recent deliveries for one subscription, newest first, capped at 50.
 * Read-only audit view; consumers handle the actual retry logic.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('webhook_deliveries')
    .select('id, event, status, http_status, attempt_count, created_at, last_attempt_at, next_retry_at')
    .eq('subscription_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[admin/webhooks/:id/deliveries] list error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ deliveries: data ?? [] });
}
