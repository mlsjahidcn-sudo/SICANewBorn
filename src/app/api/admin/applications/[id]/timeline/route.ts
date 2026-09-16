import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient } from '@/lib/supabase-auth';
import {
  mapStageHistoryFromDb,
  type StageHistoryDbRow,
  type StageHistoryRow,
} from '@/lib/application-history-mapper';

/**
 * Phase 107 / Batch 3 — admin timeline feed for an application.
 *
 * Returns merged application_stage_history + application_timeline rows
 * newest-first, with the [internal] marker preserved (admin view).
 *
 * The student timeline endpoint mirrors this shape but filters rows via
 * isInternalNote() + the parent's timeline_visible_to_student flag.
 */

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.COZE_SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const service = buildServiceClient();

  // Verify the application exists (a bad id shouldn't return [] — it should
  // 404 so the UI can redirect to /admin/applications).
  const { data: app, error: appErr } = await service
    .from('student_applications')
    .select('id')
    .eq('id', id)
    .maybeSingle();
  if (appErr) {
    return NextResponse.json({ error: appErr.message }, { status: 500 });
  }
  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // Stage history (structured transitions).
  const { data: stageRows, error: stageErr } = await service
    .from('application_stage_history')
    .select('*')
    .eq('application_id', id)
    .order('created_at', { ascending: false })
    .limit(200);
  if (stageErr) {
    return NextResponse.json({ error: stageErr.message }, { status: 500 });
  }

  // Legacy application_timeline (free-form notes). We keep both for
  // backward compatibility — student-side already reads this table.
  const { data: timelineRows, error: timelineErr } = await service
    .from('application_timeline')
    .select('id, status, notes, created_at, created_by')
    .eq('application_id', id)
    .order('created_at', { ascending: false })
    .limit(200);
  if (timelineErr) {
    return NextResponse.json({ error: timelineErr.message }, { status: 500 });
  }

  const stageHistory: StageHistoryRow[] = (stageRows ?? []).map((r) =>
    mapStageHistoryFromDb(r as StageHistoryDbRow),
  );

  return NextResponse.json({
    stageHistory,
    timelineNotes: timelineRows ?? [],
  });
}