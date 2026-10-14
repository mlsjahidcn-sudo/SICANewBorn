import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { trackServer } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Scheduled', 'Live', 'Completed', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

interface UpdateBody {
  slug?: string;
  titleEn?: string;
  titleZh?: string;
  descriptionEn?: string | null;
  descriptionZh?: string | null;
  sessionDate?: string | null;
  sessionTime?: string | null;
  durationMinutes?: number;
  joinUrl?: string | null;
  status?: WebinarStatus;
  /** Phase 164: editable label (overrides the auto-generated default). */
  label?: string | null;
  /** Phase 164: editable week number (NULL means "not numbered"). */
  weekNumber?: number | null;
}

/**
 * Phase 164: per-session update + delete.
 *
 * PATCH — staff edits the title / date / time / join URL /
 * status / label / week_number. Phase 164 dropped the
 * `isActive` toggle (no more single-active partial unique
 * index, no more flip-previous-off sequence). The "active"
 * concept is now derived by `getUpcomingSession()`.
 *
 * DELETE — admin explicitly removes a session. ON DELETE
 * CASCADE on `webinar_topics.session_id` handles the topics;
 * `webinar_signups.webinar_session_id` is ON DELETE SET NULL
 * so historical signups survive.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  let body: UpdateBody;
  try {
    body = (await request.json()) as UpdateBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.status && !(VALID_STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of ${VALID_STATUSES.join('|')}` },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};
  if (body.slug !== undefined) update.slug = body.slug;
  if (body.titleEn !== undefined) update.title_en = body.titleEn;
  if (body.titleZh !== undefined) update.title_zh = body.titleZh;
  if (body.descriptionEn !== undefined) update.description_en = body.descriptionEn;
  if (body.descriptionZh !== undefined) update.description_zh = body.descriptionZh;
  if (body.sessionDate !== undefined) update.session_date = body.sessionDate;
  if (body.sessionTime !== undefined) update.session_time = body.sessionTime;
  if (body.durationMinutes !== undefined) update.duration_minutes = body.durationMinutes;
  if (body.joinUrl !== undefined) update.join_url = body.joinUrl;
  if (body.status !== undefined) update.status = body.status;
  if (body.label !== undefined) update.label = body.label;
  if (body.weekNumber !== undefined) update.week_number = body.weekNumber;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from('webinar_sessions')
    .update(update)
    .eq('id', paramsId)
    .select('id, slug, label, week_number')
    .single();

  if (error) {
    console.error('[PATCH /api/admin/webinar-sessions/[id]] update failed:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }

  // Phase 143: best-effort admin event. Phase 164 dropped the
  // separate `webinar_session_toggled` event — auto-rollover
  // means there's no "is_active flipped" transition to track.
  trackServer('webinar_session_updated', { locale: 'en', session_id: paramsId });

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    label: (data.label as string | null) ?? null,
    weekNumber: (data.week_number as number | null) ?? null,
  });
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  const { error } = await auth.supabase
    .from('webinar_sessions')
    .delete()
    .eq('id', paramsId);

  if (error) {
    console.error('[DELETE /api/admin/webinar-sessions/[id]] delete failed:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }

  trackServer('webinar_session_deleted', { locale: 'en', session_id: paramsId });

  return NextResponse.json({ success: true });
}
