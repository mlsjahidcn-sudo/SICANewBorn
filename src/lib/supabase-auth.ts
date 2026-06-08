/**
 * Per-request authenticated Supabase client.
 *
 * Why: `getSupabaseServer()` returns the service-role client. Calling
 * `auth.getUser()` on a service-role client always returns null (no session),
 * so every student API route was returning 401 even with a valid session.
 *
 * What this does: builds a per-request Supabase client using the ANON key
 * (so RLS still applies) and attaches the caller's JWT from the
 * `Authorization: Bearer <access_token>` header. Routes then call
 * `getUser()` and the user is correctly resolved.
 *
 * Helpers:
 * - getRequestAuth(request)       → resolves caller, returns session-bound client
 * - requireAdmin(request)         → resolves caller AND verifies admin role
 * - requirePartner(request)       → resolves caller AND looks up their partner record
 */
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

export type AuthFailure = { ok: false; status: 401 | 403 | 404 | 500 | 503; error: string };
export type AuthSuccess = { ok: true; supabase: SupabaseClient; user: User };
export type AuthResult = AuthSuccess | AuthFailure;

export function getServerEnv() {
  const url = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey =
    process.env.COZE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, anonKey, serviceKey };
}

export function buildServiceClient(): SupabaseClient {
  const { url, serviceKey } = getServerEnv();
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Build a session-bound client from the caller's Authorization header.
 * Use this for routes where any authenticated user can call (e.g. student routes
 * that filter by their own user.id). RLS still applies because we use the anon key.
 */
export async function getRequestAuth(request: Request): Promise<AuthResult> {
  const { url, anonKey } = getServerEnv();
  if (!url || !anonKey) {
    return { ok: false, status: 503, error: 'Database not configured' };
  }
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Not authenticated' };
  }
  const token = authHeader.slice(7);
  const supabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { ok: false, status: 401, error: 'Invalid or expired session' };
  }
  return { ok: true, supabase, user: data.user };
}

/**
 * Verify the caller is an admin (role in admin_profiles is 'admin' or 'super_admin').
 * Uses the service-role client to read admin_profiles (RLS would otherwise hide
 * the row from a non-admin caller).
 */
export async function requireAdmin(request: Request): Promise<AuthResult> {
  const auth = await getRequestAuth(request);
  if (!auth.ok) return auth;
  const { serviceKey } = getServerEnv();
  if (!serviceKey) {
    return { ok: false, status: 503, error: 'Database not configured' };
  }
  const service = buildServiceClient();
  const { data } = await service
    .from('admin_profiles')
    .select('role')
    .eq('user_id', auth.user.id)
    .in('role', ['admin', 'super_admin'])
    .maybeSingle();
  if (!data) {
    return { ok: false, status: 403, error: 'Admin access required' };
  }
  return auth;
}

export type PartnerAuthSuccess = {
  ok: true;
  supabase: SupabaseClient;
  user: User;
  partnerId: string;
  partner: Record<string, unknown>;
};
export type PartnerAuthResult = PartnerAuthSuccess | AuthFailure;

export type TeamAuthSuccess = {
  ok: true;
  supabase: SupabaseClient;
  user: User;
  partnerId: string;
  role: 'owner' | 'member';
  teamMemberId: string;
  partner: Record<string, unknown>;
};
export type TeamAuthResult = TeamAuthSuccess | AuthFailure;

/**
 * Verify the caller is a partner and return their partner record.
 * The partnerId is server-derived (looked up from auth.users.id → partners.user_id
 * OR partner_team_members.user_id → partner_team_members.partner_id) so
 * callers cannot spoof it via ?partnerId=... in the query string.
 *
 * Two valid paths:
 *  1. Caller is the org owner — they have a `partners.user_id = auth.uid()` row
 *     (legacy direct-link case, still works for any owner who signed up
 *     before the team_members table was introduced)
 *  2. Caller is on a partner's team — `partner_team_members.user_id = auth.uid()`
 *     joins to a `partners` row via partner_team_members.partner_id
 *
 * Kept for back-compat. New code should use `requireTeamMember` which also
 * returns the team-member row (with role + status) and refuses if the
 * team-member row isn't `active`.
 */
export async function requirePartner(request: Request): Promise<PartnerAuthResult> {
  const auth = await getRequestAuth(request);
  if (!auth.ok) return auth;
  const { serviceKey } = getServerEnv();
  if (!serviceKey) {
    return { ok: false, status: 503, error: 'Database not configured' };
  }
  const service = buildServiceClient();

  // Path 1: caller is the org owner (partners.user_id = auth.uid())
  const { data: partnerAsOwner, error: pErr } = await service
    .from('partners')
    .select('*')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (pErr) {
    return { ok: false, status: 500, error: pErr.message };
  }
  if (partnerAsOwner) {
    return {
      ok: true,
      supabase: auth.supabase,
      user: auth.user,
      partnerId: partnerAsOwner.id as string,
      partner: partnerAsOwner,
    };
  }

  // Path 2: caller is a team member. Look up partner_team_members,
  // then JOIN to partners via partner_id. This is what made Phase 5
  // (direct-create team member) actually work — without this, a
  // team member with no partners row would 403 on every API call.
  const { data: member, error: mErr } = await service
    .from('partner_team_members')
    .select('id, role, status, partner:partners!partner_id (*)')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (mErr) {
    return { ok: false, status: 500, error: mErr.message };
  }
  if (!member) {
    return { ok: false, status: 403, error: 'Partner access required' };
  }
  // member.partner may be a single object (Supabase infers 1:1) or an
  // array — normalize to the object form.
  const partner = Array.isArray(member.partner) ? member.partner[0] : member.partner;
  if (!partner) {
    return { ok: false, status: 500, error: 'Team member has no associated partner org' };
  }
  return {
    ok: true,
    supabase: auth.supabase,
    user: auth.user,
    partnerId: (partner as { id: string }).id,
    partner,
  };
}

/**
 * Verify the caller is an ACTIVE member of a partner team.
 *
 * Two valid paths:
 *  1. Caller is the org owner — they have a `partners.user_id = auth.uid()`
 *     row + a matching `partner_team_members` row with role='owner'
 *  2. Caller is a team member — `partner_team_members.user_id = auth.uid()`
 *     row, joined to a `partners` row via partner_team_members.partner_id
 *
 * Refuses with 403 if:
 *  - No partner_team_members row exists for the caller at all
 *  - That row is not 'active' (i.e. 'pending_approval', 'pending_invite',
 *    'suspended')
 *
 * Returns the role + teamMemberId so the caller can scope queries:
 *  - role='owner' sees ALL rows for the partner (back-compat)
 *  - role='member' sees ONLY rows where created_by_user_id = caller
 */
export async function requireTeamMember(request: Request): Promise<TeamAuthResult> {
  const auth = await getRequestAuth(request);
  if (!auth.ok) return auth;
  const { serviceKey } = getServerEnv();
  if (!serviceKey) {
    return { ok: false, status: 503, error: 'Database not configured' };
  }
  const service = buildServiceClient();

  // Look up the team-member row directly by user_id (any role, any
  // status). The team-member row carries the partner_id; the
  // partners table just describes the org, not the membership.
  // This is the inverse of the previous lookup order, which used
  // partners.user_id first and only worked for org owners.
  const { data: member, error: mErr } = await service
    .from('partner_team_members')
    .select('id, role, status, partner_id, partner:partners!partner_id (*)')
    .eq('user_id', auth.user.id)
    .maybeSingle();
  if (mErr) {
    return { ok: false, status: 500, error: mErr.message };
  }
  if (!member) {
    return { ok: false, status: 403, error: 'No team membership found' };
  }
  if (member.status !== 'active') {
    return {
      ok: false,
      status: 403,
      error: `Your team membership is ${member.status}. Please contact your partner owner.`,
    };
  }

  // member.partner may be a single object (Supabase infers 1:1) or an
  // array — normalize to the object form.
  const partner = Array.isArray(member.partner) ? member.partner[0] : member.partner;
  if (!partner) {
    return { ok: false, status: 500, error: 'Team member has no associated partner org' };
  }

  return {
    ok: true,
    supabase: auth.supabase,
    user: auth.user,
    partnerId: (partner as { id: string }).id,
    role: member.role as 'owner' | 'member',
    teamMemberId: member.id as string,
    partner,
  };
}

/**
 * Convenience helper: convert an AuthResult into a NextResponse on failure,
 * or pass through on success. Use as `const auth = await unwrap(getRequestAuth(req))`.
 */
export function unwrap<T extends AuthResult>(result: T): { error: Response } | { value: Extract<T, { ok: true }> } {
  if (!result.ok) {
    return { error: Response.json({ error: result.error }, { status: result.status }) };
  }
  return { value: result as Extract<T, { ok: true }> };
}
