import { NextResponse } from 'next/server';
import { getRequestAuth, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * Returns the partner record bound to the caller's auth.users.id.
 * Used by the partner portal to verify the logged-in user is actually a partner
 * (vs. a student/admin who somehow landed on the partner login page).
 */
export async function GET(request: Request) {
  const { serviceKey } = getServerEnv();
  if (!serviceKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('partners')
    .select('id, email, company_name, contact_person, status, commission_rate, created_at, updated_at')
    .eq('user_id', auth.user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: 'No partner account bound to your user' },
      { status: 403 },
    );
  }

  return NextResponse.json({ partner: data });
}

/**
 * PATCH /api/partner/me
 *
 * Update the calling partner's own profile. Allowed fields:
 *   - company_name : string
 *   - contact_person : string
 *
 * NOT allowed (server-enforced):
 *   - email (would need a separate verification flow)
 *   - user_id / id (sensitive)
 *   - commission_rate (admin-controlled, not partner-self-editable)
 *   - status (admin-controlled)
 *
 * Auth: any logged-in user. The partners.user_id must match auth.uid().
 */
export async function PATCH(request: Request) {
  const { serviceKey } = getServerEnv();
  if (!serviceKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Whitelist — strip everything else to prevent privilege escalation
  const updates: Record<string, unknown> = {};
  if (typeof body.company_name === 'string' && body.company_name.trim()) {
    updates.company_name = body.company_name.trim();
  }
  if (typeof body.contact_person === 'string' && body.contact_person.trim()) {
    updates.contact_person = body.contact_person.trim();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
  }

  const service = buildServiceClient();
  const { data, error } = await service
    .from('partners')
    .update(updates)
    .eq('user_id', auth.user.id)
    .select('id, email, company_name, contact_person, status, commission_rate, created_at, updated_at')
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: 'No partner account bound to your user' },
      { status: 404 },
    );
  }

  return NextResponse.json({ partner: data });
}
