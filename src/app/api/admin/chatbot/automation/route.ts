import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * /api/admin/chatbot/automation  (Phase 121)
 *
 * GET — the chatbot automation dashboard payload:
 *   {
 *     summary: { pendingCount, draftsCount, activeFaqCount, doneThisWeek, lastRun },
 *     queue: [...last 50 queue items],
 *     runs:  [...last 30 runs]
 *   }
 *   Admin-only. Mirrors /api/admin/news/automation.
 */
export async function GET(_request: NextRequest) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Last 50 queue items (any status) — pending, generating, done,
  // failed — so the admin sees the whole mined-question pipeline.
  const { data: queue, error: queueError } = await supabaseServer
    .from('chatbot_faq_queue')
    .select('id, question, question_norm, context, session_token, source, language, priority, hit_count, status, faq_id, last_error, generated_at, created_at, updated_at')
    .order('hit_count', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(50);

  if (queueError) {
    return NextResponse.json({ error: queueError.message }, { status: 500 });
  }

  // Last 30 runs
  const { data: runs, error: runsError } = await supabaseServer
    .from('chatbot_faq_runs')
    .select('id, triggered_by, status, count_planned, count_done, count_failed, queue_item_ids, failed_item_ids, started_at, finished_at, error_log')
    .order('started_at', { ascending: false })
    .limit(30);

  if (runsError) {
    return NextResponse.json({ error: runsError.message }, { status: 500 });
  }

  // FAQ counts — separate lightweight aggregates (status split).
  const { count: draftCount, error: draftError } = await supabaseServer
    .from('chatbot_faqs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'draft');
  const { count: activeFaqCount, error: activeError } = await supabaseServer
    .from('chatbot_faqs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'active');

  if (draftError || activeError) {
    return NextResponse.json(
      { error: draftError?.message ?? activeError?.message ?? 'FAQ counts failed' },
      { status: 500 },
    );
  }

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const pendingCount = (queue ?? []).filter((q) => q.status === 'pending').length;
  const doneThisWeek = (queue ?? []).filter(
    (q) => q.status === 'done' && q.generated_at && q.generated_at >= weekAgo,
  ).length;
  const lastRun = (runs ?? [])[0] ?? null;

  return NextResponse.json({
    summary: {
      pendingCount,
      doneThisWeek,
      draftsCount: draftCount ?? 0,
      activeFaqCount: activeFaqCount ?? 0,
      lastRun: lastRun
        ? {
            id: lastRun.id,
            status: lastRun.status,
            started_at: lastRun.started_at,
            count_done: lastRun.count_done,
            count_failed: lastRun.count_failed,
            triggered_by: lastRun.triggered_by,
          }
        : null,
    },
    queue: queue ?? [],
    runs: runs ?? [],
  });
}
