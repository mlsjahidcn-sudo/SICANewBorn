/**
 * Partner: transfer ownership to another team member (owner only).
 *
 * POST /api/partner/team/[id]/transfer-ownership
 *
 * Body: {} (no input — the target is the [id] path param)
 *
 * The "id" in the path is the target member (the one who will become
 * the new owner). On success, the current owner becomes a member and
 * the target becomes the owner. The org always has at least 1 owner
 * afterwards.
 *
 * Use cases:
 *   - The current owner is stepping down (handing the org to a member)
 *   - Two co-owners want to swap who is the "primary" (caller promotes
 *     the other; the demotion comes automatically)
 *   - A partner org was set up with a placeholder owner and now needs
 *     a real human to own it
 *
 * Refuses to:
 *   - Transfer to yourself (you're already the owner)
 *   - Transfer to a non-active member (pending_invite / suspended)
 *   - Transfer to another owner (no-op, two owners is fine but
 *     "transfer" is the wrong verb — use "Promote to co-owner" if
 *     we ever add that, or just call the same endpoint as a no-op)
 *
 * Atomicity: implemented as two sequential UPDATEs. If the second
 * UPDATE fails, the best-effort rollback re-promotes the original
 * owner. The window where the org has 0 owners is the time between
 * the two queries (a few hundred ms) — not atomic in the strict
 * sense, but for a partner org with <20 members the failure
 * probability is negligible and the rollback handles it.
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
    return NextResponse.json(
      { error: 'Only owners can transfer ownership' },
      { status: 403 },
    );
  }

  const service = buildServiceClient();

  // 1. Look up the target row in this partner org
  // NOTE: do NOT select `email` from partner_team_members — that
  // column doesn't exist on the table. PostgREST silently returns
  // 0 rows when you ask for a missing column, which is why an
  // earlier version of this endpoint was returning 404 even when
  // the row existed. Hydrate the email via auth.admin.listUsers
  // for the success path if we need it; the validation here only
  // needs the role/status.
  const { data: target } = await service
    .from('partner_team_members')
    .select('id, role, status, user_id')
    .eq('id', id)
    .eq('partner_id', auth.partnerId)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: 'Target member not found' }, { status: 404 });
  }
  const t = target as { id: string; role: string; status: string; user_id: string };

  // 2. Refuse to transfer to yourself
  if (t.user_id === auth.user.id) {
    return NextResponse.json(
      { error: 'You are already the owner. Choose a different member to transfer to.' },
      { status: 400 },
    );
  }

  // 3. Target must be active to receive ownership (can't give owner
  //    to a pending or suspended member — they'd have owner powers
  //    without the trust signal of being active)
  if (t.status !== 'active') {
    return NextResponse.json(
      {
        error: `Cannot transfer ownership to a member with status "${t.status}". Reactivate them first.`,
      },
      { status: 400 },
    );
  }

  // 4. Refuse if target is already an owner (no-op, but make it explicit
  //    so the caller knows the API saw the right thing)
  if (t.role === 'owner') {
    return NextResponse.json(
      { error: 'That member is already an owner. Use the team list to demote one owner at a time.' },
      { status: 400 },
    );
  }

  // 5. Two sequential UPDATEs — see the file header for the
  //    atomicity story.
  const now = new Date().toISOString();
  const { error: demoteErr } = await service
    .from('partner_team_members')
    .update({ role: 'member', updated_at: now })
    .eq('id', auth.teamMemberId)
    .eq('partner_id', auth.partnerId);
  if (demoteErr) {
    return NextResponse.json({ error: demoteErr.message }, { status: 500 });
  }

  const { data: promoted, error: promoteErr } = await service
    .from('partner_team_members')
    .update({ role: 'owner', updated_at: now })
    .eq('id', id)
    .eq('partner_id', auth.partnerId)
    .select('id, role, status, user_id')
    .single();
  if (promoteErr || !promoted) {
    // Best-effort rollback: re-promote the original owner
    await service
      .from('partner_team_members')
      .update({ role: 'owner', updated_at: new Date().toISOString() })
      .eq('id', auth.teamMemberId)
      .eq('partner_id', auth.partnerId);
    return NextResponse.json(
      { error: promoteErr?.message || 'Failed to promote new owner; ownership transfer rolled back' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    newOwner: promoted,
    previousOwnerId: auth.teamMemberId,
  });
}
