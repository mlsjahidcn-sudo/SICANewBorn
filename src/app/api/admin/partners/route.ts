/**
 * Admin: list all partner orgs.
 *
 * GET /api/admin/partners?status=pending|active|rejected|suspended|all
 *                       &search=&page=&limit=
 *
 * Each row includes a team_count (number of partner_team_members) and
 * the owner's email. Pending partners are sorted to the top so the
 * admin sees what needs approval first.
 *
 * Phase 85: added pagination (page/limit) + server-side OR search across
 * company_name / contact_person / email. Returns a `{partners, total,
 * page, limit, totalPages}` envelope. Sort (pending-first, then
 * created_at desc) is applied in JS after fetch because pending-first
 * is a conditional sort that can't be expressed in a single postgREST
 * `.order()` call. SICA's partner scale is hundreds, so the cost is
 * bounded.
 */
import { NextRequest, NextResponse } from 'next/server';
import { buildServiceClient, getServerEnv, requireAdmin } from '@/lib/supabase-auth';
import { findUserIdByEmail, primeEmailToUserIdCache } from '@/lib/partner-user-lookup';
import { checkRateLimit } from '@/lib/rate-limit';
import { sendTemplatedEmail } from '@/lib/email/index';
import { SITE_URL } from '@/lib/site-url';
import { validatePartnerCreate } from '@/lib/admin-partner-validation';

export const dynamic = 'force-dynamic';

const STATUSES = ['pending', 'active', 'rejected', 'suspended', 'all'] as const;

// Phase 85: admin-create partner rate limit (matches the partner-invite
// cap pattern from /api/partner/team).
const CREATE_RATE_MAX = 10;
const CREATE_RATE_WINDOW_MS = 15 * 60 * 1000;

// Phase 85: pagination bounds for the partner list.
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { searchParams } = new URL(request.url);
  const status = (searchParams.get('status') || 'all').toLowerCase();
  if (!(STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json(
      { error: `status must be one of: ${STATUSES.join(', ')}` },
      { status: 400 },
    );
  }
  const search = (searchParams.get('search') || '').trim();
  const pageRaw = parseInt(searchParams.get('page') || '1', 10);
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1;
  const limitRaw = parseInt(searchParams.get('limit') || String(DEFAULT_LIMIT), 10);
  const limit =
    Number.isFinite(limitRaw) && limitRaw >= 1
      ? Math.min(MAX_LIMIT, limitRaw)
      : DEFAULT_LIMIT;

  const service = buildServiceClient();
  let q = service
    .from('partners')
    .select(
      'id, user_id, email, company_name, contact_person, country, status, commission_rate, notes, created_at, updated_at',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false });
  if (status !== 'all') {
    q = q.eq('status', status);
  }
  if (search) {
    // OR filter across the three search targets. PostgREST syntax:
    // column.operator.value,column.operator.value
    const escaped = search.replace(/[\\,]/g, '\\$&');
    q = q.or(
      `company_name.ilike.%${escaped}%,contact_person.ilike.%${escaped}%,email.ilike.%${escaped}%`,
    );
  }

  const { data: allMatching, error, count } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Annotate each matching partner with team_count BEFORE the page
  // slice so the sort stays correct (team_count isn't part of the sort,
  // but doing this in one batch keeps the query bounded to a single
  // pass over the filtered set, not the full table).
  const allMatchingIds = (allMatching || []).map((p) => (p as { id: string }).id);
  const { data: teamRows, error: teamErr } = allMatchingIds.length
    ? await service
        .from('partner_team_members')
        .select('partner_id, status, role')
        .in('partner_id', allMatchingIds)
    : { data: [], error: null };
  if (teamErr) {
    return NextResponse.json({ error: teamErr.message }, { status: 500 });
  }

  const teamByPartner = new Map<string, { total: number; active: number; pending: number }>();
  for (const t of teamRows || []) {
    const r = t as { partner_id: string; status: string };
    const cur = teamByPartner.get(r.partner_id) || { total: 0, active: 0, pending: 0 };
    cur.total++;
    if (r.status === 'active') cur.active++;
    if (r.status === 'pending_approval' || r.status === 'pending_invite') cur.pending++;
    teamByPartner.set(r.partner_id, cur);
  }

  const enriched = (allMatching || []).map((p) => {
    const r = p as { id: string };
    const team = teamByPartner.get(r.id) || { total: 0, active: 0, pending: 0 };
    return {
      ...p,
      team_count: team.total,
      team_active: team.active,
      team_pending: team.pending,
    };
  });

  // Sort: pending first, then by created_at desc.
  enriched.sort((a, b) => {
    const aStatus = (a as { status: string }).status;
    const bStatus = (b as { status: string }).status;
    if (aStatus === 'pending' && bStatus !== 'pending') return -1;
    if (bStatus === 'pending' && aStatus !== 'pending') return 1;
    return (b as { created_at: string }).created_at.localeCompare(
      (a as { created_at: string }).created_at,
    );
  });

  // Slice to the requested page AFTER the sort, so a pending partner
  // doesn't slip off page 1 because they signed up recently.
  const total = count ?? enriched.length;
  const offset = (page - 1) * limit;
  const pageSlice = enriched.slice(offset, offset + limit);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({
    partners: pageSlice,
    total,
    page,
    limit,
    totalPages,
  });
}

// ---------------------------------------------------------------------------
// POST — admin-create a partner org + owner auth user
// ---------------------------------------------------------------------------
//
// Phase 85. Mirrors /admin/students/new: admin types the partner's name +
// email + contact info, we mint an auth.users row + a partners row + a
// partner_team_members (owner/active) row + fire the welcome email with
// the auto-generated temp password.
//
// Two rollback paths:
//   - partners INSERT fails after auth.admin.createUser → deleteUser
//   - partner_team_members INSERT fails → delete partners row + deleteUser
//
// The Phase-10 `UNIQUE(user_id)` constraint on partner_team_members means
// if the user already has a team_members row from a half-signup we 409
// with a hint pointing at the /api/partner/complete-setup recovery flow.
//

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Rate-limit per admin (10 creates / 15min — caps abuse-from-inside).
  const rl = checkRateLimit({
    action: 'admin-partner-create',
    key: auth.user.id,
    max: CREATE_RATE_MAX,
    windowMs: CREATE_RATE_WINDOW_MS,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many partner creations. Please wait before trying again.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const v = validatePartnerCreate(raw as Parameters<typeof validatePartnerCreate>[0]);
  if (!v.ok) {
    return NextResponse.json({ error: v.error }, { status: 400 });
  }
  const {
    email: emailRaw,
    company_name: companyRaw,
    contact_person: contactRaw,
    phone,
    country,
    notes,
    commission_rate: commissionRate,
    send_welcome_email: sendWelcome,
  } = v.value;

  const service = buildServiceClient();

  // 1. Pre-check: does the email already have an auth.users row?
  const existingUserId = await findUserIdByEmail(service, emailRaw);
  if (existingUserId) {
    return NextResponse.json(
      {
        error:
          'A user with this email already exists. Use the partner edit page to update their record instead.',
      },
      { status: 409 },
    );
  }

  // 2. Pre-check: does a partner row with this email already exist?
  const { data: existingPartner, error: epErr } = await service
    .from('partners')
    .select('id, company_name')
    .eq('email', emailRaw)
    .maybeSingle();
  if (epErr) {
    return NextResponse.json({ error: epErr.message }, { status: 500 });
  }
  if (existingPartner) {
    return NextResponse.json(
      {
        error: `A partner org already exists for ${emailRaw} (${(existingPartner as { company_name?: string }).company_name || 'unknown'}). Use the partner edit page to update it.`,
      },
      { status: 409 },
    );
  }

  // 3. Mint auth.users row + temp password
  const tempPassword = generateTempPassword();
  const { data: authData, error: authError } = await service.auth.admin.createUser({
    email: emailRaw,
    password: tempPassword,
    email_confirm: true, // admin-created; no email confirmation needed
    user_metadata: {
      role: 'partner',
      full_name: contactRaw,
      company_name: companyRaw,
    },
  });
  if (authError || !authData.user) {
    const msg = authError?.message || 'Failed to create auth user';
    if (msg.toLowerCase().includes('already')) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 },
      );
    }
    console.error('[admin/partners POST] auth.admin.createUser error:', authError);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
  const userId = authData.user.id;

  // Prime the email→userId cache so any follow-up call within 60s sees
  // the new row (otherwise the next listUsers scan would briefly miss
  // it and a follow-up create would 500 with "already registered").
  primeEmailToUserIdCache(emailRaw, userId);

  // 4. INSERT partners row
  const partnerPayload: Record<string, unknown> = {
    user_id: userId,
    email: emailRaw,
    company_name: companyRaw,
    contact_person: contactRaw,
    status: 'active',
  };
  if (phone) partnerPayload.phone = phone;
  if (country) partnerPayload.country = country;
  if (notes) partnerPayload.notes = notes;
  if (commissionRate !== null) partnerPayload.commission_rate = commissionRate;

  const { data: partner, error: partnerError } = await service
    .from('partners')
    .insert(partnerPayload)
    .select('*')
    .single();

  if (partnerError || !partner) {
    console.error('[admin/partners POST] partners INSERT error:', partnerError);
    // Roll back the auth.users row so we don't orphan it.
    await service.auth.admin.deleteUser(userId).catch((delErr) => {
      console.error('[admin/partners POST] rollback deleteUser failed:', delErr);
    });
    return NextResponse.json(
      { error: partnerError?.message || 'Failed to create partner row' },
      { status: 500 },
    );
  }
  const partnerId = (partner as { id: string }).id;

  // 5. INSERT partner_team_members row (owner/active)
  const teamPayload = {
    partner_id: partnerId,
    user_id: userId,
    role: 'owner' as const,
    status: 'active' as const,
    invited_by: auth.user.id,
    invited_at: new Date().toISOString(),
    joined_at: new Date().toISOString(),
  };
  const { error: teamError } = await service.from('partner_team_members').insert(teamPayload);
  if (teamError) {
    console.error('[admin/partners POST] partner_team_members INSERT error:', teamError);
    // Phase 10: UNIQUE(user_id) constraint means a half-signup left a
    // team_members row behind — surface a clean 409 with the recovery
    // hint instead of a 500.
    if (teamError.code === '23505') {
      // Roll back the partners row (keep auth.users — the user is real,
      // just needs to complete the partner-team-member setup via the
      // /api/partner/complete-setup flow).
      try {
        await service.from('partners').delete().eq('id', partnerId);
      } catch (rollbackErr) {
        console.error('[admin/partners POST] rollback partners.delete failed:', rollbackErr);
      }
      return NextResponse.json(
        {
          error:
            'This email already has a partial partner signup. Ask the user to sign in and complete the partner registration form at /partner/register (the "complete setup" path).',
        },
        { status: 409 },
      );
    }
    // Other failures: roll back everything we created.
    try {
      await service.from('partners').delete().eq('id', partnerId);
    } catch (rollbackErr) {
      console.error('[admin/partners POST] rollback partners.delete failed:', rollbackErr);
    }
    try {
      await service.auth.admin.deleteUser(userId);
    } catch (rollbackErr) {
      console.error('[admin/partners POST] rollback deleteUser failed:', rollbackErr);
    }
    return NextResponse.json({ error: teamError.message }, { status: 500 });
  }

  // 6. Fire-and-forget welcome email (default true). Never block the
  //    response on it — the admin already has the temp password in the
  //    response body and can share it manually if Resend fails.
  if (sendWelcome) {
    void sendTemplatedEmail({
      to: emailRaw,
      slug: 'notification.partner_welcome',
      locale: 'en',
      variables: {
        contactName: contactRaw,
        email: emailRaw,
        temporaryPassword: tempPassword,
        createdByAdmin:
          (auth.user.user_metadata?.full_name as string | undefined) ||
          auth.user.email ||
          'SICA admin',
        companyName: companyRaw,
        partnerLoginUrl: `${SITE_URL}/partner/login`,
      },
    }).catch((err) => {
      console.error('[admin/partners POST] welcome email failed:', err);
    });
  }

  return NextResponse.json(
    {
      partner,
      temporaryPassword: tempPassword,
    },
    { status: 201 },
  );
}

/**
 * URL-safe 20-char random password. The partner owner will reset it
 * via the Supabase recovery flow on first login.
 */
function generateTempPassword(): string {
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  const bytes = new Uint8Array(20);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 20; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  let out = '';
  for (let i = 0; i < 20; i += 1) {
    out += charset[bytes[i] % charset.length];
  }
  return out;
}
