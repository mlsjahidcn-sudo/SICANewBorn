import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

/**
 * Phase 142: admin list + delete of the `webinar_waitlist`
 * table. The POST endpoint that captures the leads is public
 * (`/api/webinar-waitlist`); this admin surface lets staff
 * drain the leads manually.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const pageRaw = searchParams.get('page');
  const limitRaw = searchParams.get('limit');
  const sessionId = searchParams.get('sessionId');
  const page = Math.max(1, parseInt(pageRaw ?? '1', 10) || 1);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(limitRaw ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
  );
  const offset = (page - 1) * limit;

  let query = auth.supabase
    .from('webinar_waitlist')
    .select(
      'id, session_id, email, first_name, whatsapp, source_page, utm_source, utm_campaign, notes, created_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (sessionId) {
    query = query.eq('session_id', sessionId);
  }

  const { data, error, count } = await query;
  if (error) {
    console.error('[GET /api/admin/webinar-waitlist] query failed:', error);
    return NextResponse.json({ error: 'Failed to load waitlist' }, { status: 500 });
  }

  const entries = (data ?? []).map((row) => ({
    id: row.id as string,
    sessionId: row.session_id as string,
    email: (row.email as string) ?? '',
    firstName: (row.first_name as string) ?? '',
    whatsapp: (row.whatsapp as string | null) ?? null,
    sourcePage: (row.source_page as string | null) ?? null,
    utmSource: (row.utm_source as string | null) ?? null,
    utmCampaign: (row.utm_campaign as string | null) ?? null,
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
  }));

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({
    entries,
    total,
    page,
    limit,
    totalPages,
  });
}