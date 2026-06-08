/**
 * Partner: suspend a team member (owner only).
 *
 * POST /api/partner/team/[id]/suspend
 * Body: { reason?: string }
 *
 * Sets status='suspended' + suspended_at=now + suspension_reason=reason.
 * The member is immediately locked out of the partner portal:
 *   - requireTeamMember() refuses them (status !== 'active')
 *   - The RLS helper is_partner_team_member() filters on status='active',
 *     so their data writes (students/applications/leads) start failing
 *     at the DB layer too.
 *   - They keep their auth.users row (they can still sign in to /login,
 *     but every partner API will 403 them).
 *
 * Reactivate via POST /api/partner/team/[id]/reactivate.
 *
 * Refuses to suspend:
 *   - Yourself (the only owner can't lock themselves out — would create
 *     a 0-owner org). Transfer ownership first.
 *   - A pending_invite member (no login to suspend — use Cancel Invite).
 *   - An already-suspended member (no-op).
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, requireTeamMember, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

interface SuspendBody {
  reason?: string;
}

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
    return NextResponse.json({ error: 'Only owners can suspend members' }, { status: 403 });
  }

  let body: SuspendBody = {};
  try {
    body = (await request.json()) || {};
  } catch {
    // Body is optional; empty body is fine
  }
  const reason = (body.reason || '').trim().slice(0, 500) || null;

  const service = buildServiceClient();

  // 1. Look up the target row in this partner org
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

  // 2. Refuse to suspend yourself — the only owner can't lock themselves
  //    out of their own org. They should transfer ownership to someone
  //    else first, then ask an admin to remove them.
  if (t.user_id === auth.user.id) {
    return NextResponse.json(
      {
        error:
          'You cannot suspend yourself. Transfer ownership to another member first if you want to step down.',
      },
      { status: 400 },
    );
  }

  // 3. Refuse to suspend a pending_invite — no login to suspend. The
  //    Cancel Invite button on the team page is the right action.
  if (t.status === 'pending_invite' || t.status === 'pending_approval') {
    return NextResponse.json(
      {
        error: `Cannot suspend a member in "${t.status}" state. Cancel the invite instead.`,
      },
      { status: 400 },
    );
  }

  // 4. No-op if already suspended
  if (t.status === 'suspended') {
    return NextResponse.json({ member: target, alreadySuspended: true });
  }

  // 5. Refuse to suspend the last active owner. (You can't transfer
  //    ownership to a suspended member, and you can't be the only
  //    owner and have the org be unowned.)
  if (t.role === 'owner') {
    const { data: owners } = await service
      .from('partner_team_members')
      .select('id')
      .eq('partner_id', auth.partnerId)
      .eq('role', 'owner')
      .eq('status', 'active');
    if ((owners || []).length <= 1) {
      return NextResponse.json(
        {
          error:
            'Cannot suspend the last active owner. Transfer ownership to another member first.',
        },
        { status: 400 },
      );
    }
  }

  // 6. Apply the suspension. Single UPDATE — race-free.
  const { data: updated, error } = await service
    .from('partner_team_members')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      suspension_reason: reason,
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
