import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 1000;

/**
 * Admin: list student_assessments.
 * Read-only listing; status updates go through PATCH on /api/admin/assessments/[id].
 *
 * Returns `{ assessments, total, limit, offset }`. `total` is the
 * PostgREST exact count of rows that match the (optional) status
 * filter — used by the UI's "Showing 1–20 of 437" header so admins
 * always know whether more rows exist beyond the current page.
 *
 * Pagination is server-side: `limit` defaults to 20 and is capped at
 * 1000 (Phase 126 — previous hardcoded client limit of 100 silently
 * truncated large queues). `offset` defaults to 0.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 1), MAX_LIMIT),
    MAX_LIMIT,
  );
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let query = supabase
    .from('student_assessments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({
    assessments: data || [],
    total: count ?? 0,
    limit,
    offset,
  });
}
