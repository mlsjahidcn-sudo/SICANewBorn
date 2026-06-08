/**
 * Partner: reactivate a suspended team member (owner only).
 *
 * POST /api/partner/team/[id]/reactivate
 *
 * Sets status='active' and clears suspended_at + suspension_reason.
 * The member is unlocked immediately — they can sign in again and
 * their RLS writes start succeeding.
 *
 * Refuses to reactivate:
 *   - Yourself (you're the owner and you can't be in 'suspended'
 *     state to begin with — defensive check)
 *   - A non-suspended member (no-op or 400)
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, requireTeamMember, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const { id } = await context.params;
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.role !== 'owner') {
    return NextResponse.json({ error: 'Only owners can reactivate members' }, { status: 403 });
  }

  const service = buildServiceClient();

  // 1. Look up the target row
  const { data: target } = await service
    .from('partner_team_members')
    .select('id, role, status, user_id')
    .eq('id', id)
    .eq('partner_id', auth.partnerId)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
  }
  const t = target as { id: string; role: string; status: string; user_id: string };

  // 2. Defensive: don't reactivate yourself (you can't be suspended
  //    in the first place — the suspend route refuses self-suspend —
  //    but be explicit)
  if (t.user_id === auth.user.id) {
    return NextResponse.json(
      { error: 'You cannot reactivate yourself. Your account is not suspended.' },
      { status: 400 },
    );
  }

  // 3. Refuse if not currently suspended
  if (t.status !== 'suspended') {
    return NextResponse.json(
      { error: `Member is not suspended (current status: "${t.status}").` },
      { status: 400 },
    );
  }

  // 4. Apply the reactivation. Clear suspension metadata.
  const { data: updated, error } = await service
    .from('partner_team_members')
    .update({
      status: 'active',
      suspended_at: null,
      suspension_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('partner_id', auth.partnerId)
    .select('id, status, suspended_at, suspension_reason')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ member: updated });
}
