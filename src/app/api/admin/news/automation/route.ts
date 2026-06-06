import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * /api/admin/news/automation
 *
 * GET — return the full automation dashboard payload:
 *   {
 *     summary: { pendingCount, doneThisWeek, lastRun, nextSuggestion },
 *     topics: [...pending + recent],     // last 50 topics
 *     runs:   [...last 30 runs]
 *   }
 *   Admin-only.
 *
 * The admin UI uses this as the single read endpoint for the
 * "Automation" tab in /admin/news.
 */
export async function GET(_request: NextRequest) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Last 50 topics (any status) so the admin can see what's
  // pending, what's done, and what failed.
  const { data: topics, error: topicsError } = await supabaseServer
    .from('news_automation_topics')
    .select('id, topic, category, language, tone, target_keyword, priority, status, post_id, last_error, generated_at, created_at, updated_at')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(50);

  if (topicsError) {
    return NextResponse.json({ error: topicsError.message }, { status: 500 });
  }

  // Last 30 runs (any status)
  const { data: runs, error: runsError } = await supabaseServer
    .from('news_automation_runs')
    .select('id, triggered_by, status, count_planned, count_done, count_failed, topic_ids, failed_topic_ids, started_at, finished_at, error_log')
    .order('started_at', { ascending: false })
    .limit(30);

  if (runsError) {
    return NextResponse.json({ error: runsError.message }, { status: 500 });
  }

  // Summary stats
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const pendingCount = (topics ?? []).filter((t) => t.status === 'pending').length;
  const doneThisWeek = (topics ?? []).filter(
    (t) => t.status === 'done' && t.generated_at && t.generated_at >= weekAgo,
  ).length;
  const lastRun = (runs ?? [])[0] ?? null;

  return NextResponse.json({
    summary: {
      pendingCount,
      doneThisWeek,
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
    topics: topics ?? [],
    runs: runs ?? [],
  });
}
