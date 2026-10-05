import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = ['Registered', 'Attended', 'No-Show', 'Cancelled'] as const;
type WebinarStatus = (typeof VALID_STATUSES)[number];

interface PatchBody {
  status?: WebinarStatus;
}

/**
 * Phase 140: admin status flip on a webinar signup. The
 * Phase 139 GET endpoint stays read-only; this PATCH adds
 * the flip Registered → Attended / No-Show / Cancelled path
 * the staff needs to operate the webinar.
 *
 * Status changes are recorded into `lead_history` (Phase 2.1
 * pattern, polymorphic FK across contact/assessment/chat
 * tables). `webinar_signups` was not wired into that
 * polymorphic FK contract so we insert the minimal row
 * referencing the signup id in `target_id` with
 * `target_type = 'webinar_signup'`. `lead_history` already
 * exists as a real table; if its CHECK constraint on
 * target_type rejects the new value the migration in this
 * phase would need to widen it — see the companion SQL
 * migration `2026-10-05_webinar_sessions_and_topics.sql`
 * for the FK extension policy that mirrors this approach.
 *
 * NOTE: lead_history.action CHECK is preserved as-is
 * ('status_changed' is a valid existing value); we only
 * reference the signup via target_id + target_type. No
 * FK was added to webinar_signups.id because that would
 * require a CHECK on target_type and a 3-way case in the
 * existing trigger. For now we keep the history row
 * informational — the primary record is the
 * `webinar_signups.status` column itself.
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

  return NextResponse.json({ id: data.id, status: data.status });
}
