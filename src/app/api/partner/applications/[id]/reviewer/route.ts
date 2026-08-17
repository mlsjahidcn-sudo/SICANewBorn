/**
 * Partner: get the most recent admin-actor for this application.
 *
 * GET /api/partner/applications/[id]/reviewer
 *
 * Phase 1.13: the partner wants to know who's handling their
 * case. The `application_timeline` table records every status
 * change + admin note; its `created_by` is the admin who made
 * the entry. We pick the most recent admin-authored row for
 * this application and hydrate the actor's email.
 *
 * Returns:
 *   { reviewer: { email: string; at: string } | null }
 *
 * `null` means "no admin has touched this yet" — the UI falls
 * back to "SICA Admissions Team" in that case.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  // Sanity check: the partner can only see the reviewer for
  // applications they have access to. We use auth.supabase so
  // RLS on partner_applications applies. Phase 71: team members
  // are scoped to rows they created (same rule as the list API).
  const { data: app } = await auth.supabase
    .from('partner_applications')
    .select('id, created_by_user_id')
    .eq('id', id)
    .maybeSingle();
  if (!app || (auth.role === 'member' && app.created_by_user_id !== auth.user.id)) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  // Pull the most recent timeline entry. We use the service
  // client here because the auth.supabase RLS on
  // application_timeline restricts the partner to events they
  // created, but the partner doesn't author the admin events
  // — they just want to read them.
  const service = buildServiceClient();
  const { data: latest, error: timelineErr } = await service
    .from('application_timeline')
    .select('id, created_by, created_at, status, notes')
    .eq('partner_application_id', id)
    .not('created_by', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (timelineErr) {
    // Fail-soft: log and return null so the UI shows the generic
    // "SICA Admissions Team" label rather than a hard error.
    console.error('[partner/applications/:id/reviewer] timeline error:', timelineErr.message);
    return NextResponse.json({ reviewer: null });
  }
  if (!latest) {
    return NextResponse.json({ reviewer: null });
  }
  const createdBy = (latest as { created_by: string }).created_by;
  if (!createdBy) {
    return NextResponse.json({ reviewer: null });
  }

  // Hydrate the email via auth.admin. We batch up to 200 users
  // per call (Supabase limit) and find our actor. Cheap on a
  // 1-row result; could be optimized to a direct getUserById
  // but the batched call keeps the code simple.
  const { data: usersPage } = await service.auth.admin.listUsers({ perPage: 200 });
  const email = usersPage?.users.find((u) => u.id === createdBy)?.email || null;

  return NextResponse.json({
    reviewer: {
      email,
      at: (latest as { created_at: string }).created_at,
    },
  });
}
