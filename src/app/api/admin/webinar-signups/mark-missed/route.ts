import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f-]{36}$/i;

/**
 * Phase 161: "mark the rest as missed" — after the webinar, every
 * signup still in 'Registered' for the selected webinar flips to
 * 'No-Show' in one action (attended/missed coverage without clicking
 * 100 rows). Rows already Attended / No-Show / Cancelled are left
 * alone. Returns the flipped count.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: { webinarId?: string };
  try {
    body = (await request.json()) as { webinarId?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const webinarId = body.webinarId?.trim() ?? '';
  if (!UUID_RE.test(webinarId)) {
    return NextResponse.json({ error: 'webinarId (uuid) is required' }, { status: 400 });
  }

  const { data: pending, error: lookupError } = await auth.supabase
    .from('webinar_signups')
    .select('id, status')
    .eq('webinar_session_id', webinarId)
    .eq('status', 'Registered')
    .limit(1000);
  if (lookupError) {
    console.error('[POST mark-missed] lookup failed:', lookupError);
    return NextResponse.json({ error: 'Failed to load signups' }, { status: 500 });
  }

  const ids = (pending ?? []).map((row) => row.id as string);
  if (ids.length === 0) {
    return NextResponse.json({ flipped: 0 });
  }

  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const { error: updateError } = await auth.supabase
      .from('webinar_signups')
      .update({ status: 'No-Show' })
      .in('id', chunk);
    if (updateError) {
      console.error('[POST mark-missed] update chunk failed:', updateError);
      return NextResponse.json({ error: 'Failed to mark missed' }, { status: 500 });
    }
  }

  // Best-effort audit rows (Phase 143 pattern).
  try {
    await auth.supabase.from('lead_history').insert(
      ids.map((id) => ({
        lead_type: 'webinar_signup' as const,
        lead_id: id,
        admin_id: auth.user.id,
        action: 'status_changed',
        from_value: 'Registered',
        to_value: 'No-Show',
      })),
    );
  } catch (histErr) {
    console.warn('[POST mark-missed] lead_history insert failed:', histErr);
  }

  return NextResponse.json({ flipped: ids.length });
}
