import { NextRequest, NextResponse } from 'next/server';
import { requirePartner, getServerEnv } from '@/lib/supabase-auth';

/**
 * GET /api/partner/notifications/unread-count
 *
 * Just the unread count, for the sidebar bell badge. Cheaper than
 * the full list — head: true means no row payload, just the
 * Postgres count(*). Called by the partner layout every 30s
 * (and on route change / window focus) to keep the badge fresh.
 *
 * Response: { count: number }
 */
export async function GET(_request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }
  const auth = await requirePartner(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  try {
    const { count, error } = await auth.supabase
      .from('partner_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id)
      .eq('is_read', false);
    if (error) {
      console.error('[partner/notifications/unread-count GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/notifications/unread-count GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
