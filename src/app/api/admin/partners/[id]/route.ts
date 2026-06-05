/**
 * Admin: partner detail + actions.
 *
 * GET   /api/admin/partners/[id]  — partner + team + recent activity
 * PATCH /api/admin/partners/[id]  — body: { action, ...payload }
 *   action:
 *     - 'approve' : flip status='pending' -> 'active', team_members 'pending_approval' -> 'active', joined_at=NOW()
 *     - 'reject'  : status -> 'rejected', notes=<reason>
 *     - 'suspend' : status -> 'suspended', all active team_members -> 'suspended'
 *     - 'reactivate' : status -> 'active', all team_members -> 'active' (joined_at unchanged)
 *     - 'update'   : edit company_name / contact_person / phone / country / commission_rate / notes
 *     - 'suspend_member' : { member_id, reason } — suspend a single team member
 *     - 'reactivate_member' : { member_id } — reactivate
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const SUSPENDABLE_STATUSES = new Set(['active', 'suspended', 'rejected']);
const REACTIVABLE_STATUSES = new Set(['suspended', 'rejected']);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  const service = buildServiceClient();

  const { data: partner, error: pErr } = await service
    .from('partners')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }
  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  const { data: team } = await service
    .from('partner_team_members')
    .select('id, user_id, role, status, invited_by, invited_at, joined_at, suspended_at, suspension_reason, created_at')
    .eq('partner_id', id)
    .order('role', { ascending: true }) // owners first
    .order('created_at', { ascending: true });

  // Hydrate team member emails via auth.admin.listUsers (filtered to our user_ids)
  const userIds = (team || []).map((t) => (t as { user_id: string }).user_id);
  const userMap = new Map<string, { email: string | null }>();
  if (userIds.length) {
    // listUsers doesn't support filtering; pull a page large enough.
    const { data: usersPage } = await service.auth.admin.listUsers({ perPage: 200 });
    for (const u of usersPage?.users || []) {
      if (userIds.includes(u.id)) {
        userMap.set(u.id, { email: u.email || null });
      }
    }
  }
  const teamWithEmails = (team || []).map((t) => {
    const r = t as { user_id: string };
    return { ...t, email: userMap.get(r.user_id)?.email || null };
  });

  return NextResponse.json({ partner, team: teamWithEmails });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = body.action as string | undefined;
  if (!action) {
    return NextResponse.json({ error: 'action is required' }, { status: 400 });
  }

  const service = buildServiceClient();

  // Look up the partner first
  const { data: partner, error: pErr } = await service
    .from('partners')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 500 });
  }
  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
  }

  if (action === 'approve') {
    return await approvePartner(service, id);
  }
  if (action === 'reject') {
    return await rejectPartner(service, id, body.reason as string | undefined);
  }
  if (action === 'suspend') {
    return await setPartnerStatus(service, id, 'suspended', body.reason as string | undefined);
  }
  if (action === 'reactivate') {
    return await reactivatePartner(service, id);
  }
  if (action === 'update') {
    return await updatePartner(service, id, body);
  }
  if (action === 'suspend_member') {
    const memberId = body.member_id as string | undefined;
    if (!memberId) {
      return NextResponse.json({ error: 'member_id required' }, { status: 400 });
    }
    return await suspendMember(service, id, memberId, body.reason as string | undefined);
  }
  if (action === 'reactivate_member') {
    const memberId = body.member_id as string | undefined;
    if (!memberId) {
      return NextResponse.json({ error: 'member_id required' }, { status: 400 });
    }
    return await reactivateMember(service, id, memberId);
  }
  if (action === 'remove_member') {
    const memberId = body.member_id as string | undefined;
    if (!memberId) {
      return NextResponse.json({ error: 'member_id required' }, { status: 400 });
    }
    return await removeMember(service, id, memberId);
  }

  return NextResponse.json(
    { error: `unknown action: ${action}` },
    { status: 400 },
  );
}

// ----- Actions ----------------------------------------------------------------

async function approvePartner(
  service: ReturnType<typeof buildServiceClient>,
  partnerId: string,
) {
  // Flip partners.status to 'active'
  const { data: partner, error } = await service
    .from('partners')
    .update({ status: 'active' })
    .eq('id', partnerId)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flip all team_members with status='pending_approval' to 'active'
  // and set joined_at to NOW() if it was null.
  const { error: mErr } = await service
    .from('partner_team_members')
    .update({
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    .eq('partner_id', partnerId)
    .eq('status', 'pending_approval');
  if (mErr) {
    return NextResponse.json(
      { error: `Partner approved but team flip failed: ${mErr.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ partner, approved: true });
}

async function rejectPartner(
  service: ReturnType<typeof buildServiceClient>,
  partnerId: string,
  reason: string | undefined,
) {
  const updates: Record<string, unknown> = { status: 'rejected' };
  if (reason) updates.notes = reason;
  const { data: partner, error } = await service
    .from('partners')
    .update(updates)
    .eq('id', partnerId)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ partner, rejected: true });
}

async function setPartnerStatus(
  service: ReturnType<typeof buildServiceClient>,
  partnerId: string,
  status: 'suspended' | 'active',
  reason: string | undefined,
) {
  const updates: Record<string, unknown> = { status };
  const { data: partner, error } = await service
    .from('partners')
    .update(updates)
    .eq('id', partnerId)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (status === 'suspended') {
    // Suspend every active team member
    const { error: mErr } = await service
      .from('partner_team_members')
      .update({
        status: 'suspended',
        suspended_at: new Date().toISOString(),
        suspension_reason: reason || null,
      })
      .eq('partner_id', partnerId)
      .eq('status', 'active');
    if (mErr) {
      return NextResponse.json(
        { error: `Partner suspended but team flip failed: ${mErr.message}` },
        { status: 500 },
      );
    }
  }
  return NextResponse.json({ partner });
}

async function reactivatePartner(
  service: ReturnType<typeof buildServiceClient>,
  partnerId: string,
) {
  const { data: partner, error } = await service
    .from('partners')
    .update({ status: 'active' })
    .eq('id', partnerId)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Reactivate suspended team members (don't touch joined_at)
  const { error: mErr } = await service
    .from('partner_team_members')
    .update({ status: 'active', suspended_at: null, suspension_reason: null })
    .eq('partner_id', partnerId)
    .eq('status', 'suspended');
  if (mErr) {
    return NextResponse.json({ error: mErr.message }, { status: 500 });
  }
  return NextResponse.json({ partner });
}

async function updatePartner(
  service: ReturnType<typeof buildServiceClient>,
  partnerId: string,
  body: Record<string, unknown>,
) {
  const updates: Record<string, unknown> = {};
  const allowed: string[] = [
    'company_name',
    'contact_person',
    'phone',
    'country',
    'commission_rate',
    'notes',
  ];
  for (const k of allowed) {
    if (k in body) updates[k] = body[k];
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
  }
  const { data: partner, error } = await service
    .from('partners')
    .update(updates)
    .eq('id', partnerId)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ partner });
}

async function suspendMember(
  service: ReturnType<typeof buildServiceClient>,
  partnerId: string,
  memberId: string,
  reason: string | undefined,
) {
  const { data, error } = await service
    .from('partner_team_members')
    .update({
      status: 'suspended',
      suspended_at: new Date().toISOString(),
      suspension_reason: reason || null,
    })
    .eq('id', memberId)
    .eq('partner_id', partnerId)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ member: data });
}

async function reactivateMember(
  service: ReturnType<typeof buildServiceClient>,
  partnerId: string,
  memberId: string,
) {
  const { data, error } = await service
    .from('partner_team_members')
    .update({ status: 'active', suspended_at: null, suspension_reason: null })
    .eq('id', memberId)
    .eq('partner_id', partnerId)
    .select('*')
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ member: data });
}

async function removeMember(
  service: ReturnType<typeof buildServiceClient>,
  partnerId: string,
  memberId: string,
) {
  // Refuse to remove the last owner
  const { data: owners, error: oErr } = await service
    .from('partner_team_members')
    .select('id, role, status')
    .eq('partner_id', partnerId)
    .eq('role', 'owner')
    .eq('status', 'active');
  if (oErr) {
    return NextResponse.json({ error: oErr.message }, { status: 500 });
  }
  const { data: target } = await service
    .from('partner_team_members')
    .select('id, role, status, user_id')
    .eq('id', memberId)
    .eq('partner_id', partnerId)
    .maybeSingle();
  if (!target) {
    return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
  }
  const r = target as { role: string; user_id: string };
  if (r.role === 'owner' && (owners || []).length <= 1) {
    return NextResponse.json(
      { error: 'Cannot remove the last active owner. Add another owner first.' },
      { status: 400 },
    );
  }
  // Hard delete: this disconnects the user from the partner org.
  // We also need to detach their created rows. For now, leave
  // created_by_user_id as-is so we don't break history.
  const { error: delErr } = await service
    .from('partner_team_members')
    .delete()
    .eq('id', memberId)
    .eq('partner_id', partnerId);
  if (delErr) {
    return NextResponse.json({ error: delErr.message }, { status: 500 });
  }
  // Also clear partners.user_id if the removed member was the
  // historical 1:1 owner.
  if (r.role === 'owner') {
    const { data: p } = await service
      .from('partners')
      .select('user_id')
      .eq('id', partnerId)
      .maybeSingle();
    const pr = p as { user_id: string | null } | null;
    if (pr?.user_id === r.user_id) {
      await service.from('partners').update({ user_id: null }).eq('id', partnerId);
    }
  }
  return NextResponse.json({ removed: true });
}
