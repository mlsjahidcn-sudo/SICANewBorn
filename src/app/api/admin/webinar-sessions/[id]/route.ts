import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { trackServer } from '@/lib/analytics';
import { parseSeatCapInput, type WebinarRegistrationStatus } from '@/lib/webinar-capacity';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Scheduled', 'Live', 'Completed', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

const VALID_REGISTRATION_STATUSES = ['draft', 'open', 'full', 'closed'] as const;

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
  isActive?: boolean;
  displayOrder?: number;
  /** Phase 161: seat cap — null/'' = uncapped. */
  seatCap?: number | string | null;
  /** Phase 161: draft | open | full | closed. */
  registrationStatus?: WebinarRegistrationStatus;
  /** Phase 161: canonical IANA timezone label. */
  timezoneLabel?: string;
}

/**
 * Phase 140: per-session update + delete.
 *
 * PATCH — staff edits the title / date / time / join URL /
 * status / display order / is_active toggle. The is_active
 * transition is special: if `isActive=true` is being turned on
 * for THIS row, we first flip every other active row off so
 * the partial unique index doesn't 23505 us. The admin-side
 * dialog toggles them in sequence (no transaction needed for
 * the typical single-row update; if a real race ever appears
 * the partial index will refuse the second active row and
 * the API surfaces the 500 cleanly).
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
  if (
    body.registrationStatus &&
    !(VALID_REGISTRATION_STATUSES as readonly string[]).includes(body.registrationStatus)
  ) {
    return NextResponse.json(
      { error: `registrationStatus must be one of ${VALID_REGISTRATION_STATUSES.join('|')}` },
      { status: 400 },
    );
  }

  // If toggling is_active to true, clear the previous active row
  // first (excluding self) so the partial unique index accepts
  // the new state.
  if (body.isActive === true) {
    await auth.supabase
      .from('webinar_sessions')
      .update({ is_active: false })
      .eq('is_active', true)
      .neq('id', paramsId);
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
  if (body.isActive !== undefined) update.is_active = body.isActive;
  if (body.displayOrder !== undefined) update.display_order = body.displayOrder;
  // Phase 161 fields. When the migration hasn't been applied these
  // writes fail with a column-not-found error which surfaces as a
  // 500 — the admin UI only sends them after the column probe in
  // the sessions GET reports them, so pre-migration deploys never
  // reach this branch with values set.
  if (body.seatCap !== undefined) update.seat_cap = parseSeatCapInput(body.seatCap);
  if (body.registrationStatus !== undefined) update.registration_status = body.registrationStatus;
  if (body.timezoneLabel !== undefined) update.timezone_label = body.timezoneLabel;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  // Phase 157: capacity check removed — registration is uncapped.
  // Capture old is_active before the update so the admin-toggle
  // event has the before/after pair.
  const { data: existing, error: readErr } = await auth.supabase
    .from('webinar_sessions')
    .select('is_active')
    .eq('id', paramsId)
    .maybeSingle();
  if (readErr || !existing) {
    console.error('[PATCH /api/admin/webinar-sessions/[id]] lookup failed:', readErr);
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }
  const oldIsActive = Boolean(existing.is_active);

  const { data, error } = await auth.supabase
    .from('webinar_sessions')
    .update(update)
    .eq('id', paramsId)
    .select('id, slug, is_active')
    .single();

  if (error) {
    console.error('[PATCH /api/admin/webinar-sessions/[id]] update failed:', error);
    return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
  }

  // Phase 143 + 161: best-effort admin events. The status flip +
  // toggle events give GA a single source of truth for admin
  // activity. Wrapped in their own try/catch so an analytics
  // failure can never 500 a PATCH that already succeeded.
  try {
    trackServer('webinar_session_updated', { locale: 'en', session_id: paramsId });
    const newIsActive = Boolean(data.is_active);
    if (newIsActive !== oldIsActive) {
      trackServer('webinar_session_toggled', {
        locale: 'en',
        session_id: paramsId,
        new_is_active: newIsActive,
      });
    }
  } catch (analyticsErr) {
    console.warn('[PATCH /api/admin/webinar-sessions/[id]] analytics failed:', analyticsErr);
  }

  return NextResponse.json({
    id: data.id,
    slug: data.slug,
    isActive: Boolean(data.is_active),
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

  try {
    trackServer('webinar_session_deleted', { locale: 'en', session_id: paramsId });
  } catch {
    // best-effort
  }

  return NextResponse.json({ success: true });
}
