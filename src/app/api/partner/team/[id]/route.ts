/**
 * Partner: remove a team member (owner only).
 *
 * DELETE /api/partner/team/[id]
 *
 * Refuses to remove the last active owner.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, requireTeamMember, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
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
    return NextResponse.json({ error: 'Only owners can remove members' }, { status: 403 });
  }

  const service = buildServiceClient();
  const { data: target } = await service
    .from('partner_team_members')
    .select('id, role, status, user_id')
    .eq('id', id)
    .eq('partner_id', auth.partnerId)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
  }
  const t = target as { role: string; user_id: string };

  if (t.role === 'owner') {
    // Refuse if they're the last active owner
    const { data: owners } = await service
      .from('partner_team_members')
      .select('id')
      .eq('partner_id', auth.partnerId)
      .eq('role', 'owner')
      .eq('status', 'active');
    if ((owners || []).length <= 1) {
      return NextResponse.json(
        { error: 'Cannot remove the last active owner' },
        { status: 400 },
      );
    }
  }

  const { error } = await service
    .from('partner_team_members')
    .delete()
    .eq('id', id)
    .eq('partner_id', auth.partnerId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ removed: true });
}
