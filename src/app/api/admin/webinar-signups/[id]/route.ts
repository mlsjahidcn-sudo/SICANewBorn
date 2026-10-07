import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { trackServer } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Registered', 'Attended', 'No-Show', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

interface PatchBody {
  status?: WebinarStatus;
}

/**
 * Phase 140 + 143: admin status flip on a webinar signup.
 *
 * Phase 140 added the flip Registered → Attended / No-Show /
 * Cancelled path the staff needs to operate the webinar.
 * Phase 143 layers on:
 *   - activity log row into `lead_history` (the polymorphic
 *     contract — Phase S29 — extended in
 *     database/2026-10-08_webinar_analytics_history.sql to
 *     accept `lead_type='webinar_signup'`),
 *   - GA4 event `webinar_signup_status_changed` fired via
 *     `trackServer()` so the audit shows up in the dashboard
 *     even when the staff uses curl/Postman.
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id: paramsId } = await context.params;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.status || !(VALID_STATUSES as readonly string[]).includes(body.status)) {
    return NextResponse.json(
      { error: `status must be one of ${VALID_STATUSES.join('|')}` },
      { status: 400 },
    );
  }

  // Phase 143: capture the old status so we can write a
  // from_value/to_value pair to lead_history. Phase 140's
  // SELECT id, status only returned the post-update row.
  const { data: existing, error: readErr } = await auth.supabase
    .from('webinar_signups')
    .select('id, status')
    .eq('id', paramsId)
    .maybeSingle();
  if (readErr || !existing) {
    console.error('[PATCH /api/admin/webinar-signups/[id]] lookup failed:', readErr);
    return NextResponse.json({ error: 'Signup not found' }, { status: 404 });
  }
  const oldStatus = (existing.status as WebinarStatus) ?? 'Registered';

  const { data, error } = await auth.supabase
    .from('webinar_signups')
    .update({ status: body.status })
    .eq('id', paramsId)
    .select('id, status')
    .single();

  if (error) {
    console.error('[PATCH /api/admin/webinar-signups/[id]] update failed:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }

  // Phase 143: best-effort activity log + GA4 event. Log failure
  // is a warning, never a 500 — the status flip already
  // succeeded. Event fire is also best-effort.
  if (oldStatus !== body.status) {
    try {
      await auth.supabase.from('lead_history').insert({
        lead_type: 'webinar_signup',
        lead_id: paramsId,
        admin_id: auth.user.id,
        action: 'status_changed',
        from_value: oldStatus,
        to_value: body.status,
      });
    } catch (histErr) {
      console.warn('[PATCH /api/admin/webinar-signups/[id]] lead_history insert failed:', histErr);
    }
    trackServer('webinar_signup_status_changed', {
      locale: 'en',
      signup_id: paramsId,
      old_status: oldStatus,
      new_status: body.status,
    });
  }

  return NextResponse.json({ id: data.id, status: data.status });
}
