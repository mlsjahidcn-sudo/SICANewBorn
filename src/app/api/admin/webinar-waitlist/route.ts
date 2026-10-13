import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const MAX_LIMIT = 200;

/**
 * Phase 161: list waitlist rows for the admin Waitlist tab.
 * `?webinarId=` scopes to one webinar (required for a meaningful
 * list — the tab always knows the selected webinar; when omitted,
 * every webinar's waitlist is returned, newest first).
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const rawWebinarId = searchParams.get('webinarId')?.trim() || null;
  const webinarId =
    rawWebinarId && /^[0-9a-f-]{36}$/i.test(rawWebinarId) ? rawWebinarId : null;
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(searchParams.get('limit') ?? '100', 10) || 100),
  );

  let query = auth.supabase
    .from('webinar_waitlist')
    .select('id, session_id, email, first_name, last_name, whatsapp, country, notes, source_page, utm_source, utm_campaign, created_at', {
      count: 'exact',
    })
    .order('created_at', { ascending: true })
    .limit(limit);
  if (webinarId) query = query.eq('session_id', webinarId);

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /api/admin/webinar-waitlist] query failed:', error);
    return NextResponse.json({ error: 'Failed to load waitlist' }, { status: 500 });
  }

  const waitlist = (data ?? []).map((row) => ({
    id: row.id as string,
    sessionId: row.session_id as string,
    email: (row.email as string) ?? '',
    firstName: (row.first_name as string) ?? '',
    lastName: (row.last_name as string) ?? '',
    whatsapp: (row.whatsapp as string | null) ?? null,
    country: (row.country as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    sourcePage: (row.source_page as string | null) ?? null,
    utmSource: (row.utm_source as string | null) ?? null,
    utmCampaign: (row.utm_campaign as string | null) ?? null,
    createdAt: row.created_at as string,
  }));

  return NextResponse.json({ waitlist, total: count ?? waitlist.length, limit });
}
