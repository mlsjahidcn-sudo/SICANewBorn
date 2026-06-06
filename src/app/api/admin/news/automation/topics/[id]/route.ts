import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * /api/admin/news/automation/topics/[id]
 *
 * DELETE — remove a topic from the queue. Admin-only.
 *   - Pending topics: hard-deleted (admin doesn't want it generated).
 *   - Done / failed / generating topics: hard-deleted too; the
 *     audit trail lives in news_automation_runs + the linked
 *     news_posts row, so removing the topic row doesn't lose
 *     history.
 *   - 404 if the topic doesn't exist.
 *   - 409 if the topic is currently 'generating' (a cron is
 *     actively working on it; admin should wait or let it fail
 *     first).
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Peek first to enforce the 'generating' guard with a clean 409
  const { data: existing } = await supabaseServer
    .from('news_automation_topics')
    .select('id, status, topic')
    .eq('id', id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
  }
  if (existing.status === 'generating') {
    return NextResponse.json(
      { error: 'Topic is currently being generated. Wait for the run to finish (or fail) before removing.' },
      { status: 409 },
    );
  }

  const { error } = await supabaseServer
    .from('news_automation_topics')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, removed: existing });
}
