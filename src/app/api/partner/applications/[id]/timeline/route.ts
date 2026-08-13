/**
 * GET /api/partner/applications/[id]/timeline
 *
 * Phase F: exposes the audit timeline for a partner application so
 * partners can see when status changes happened, who made them, and
 * any notes (e.g., a withdrawal request reason).
 *
 * Auth: requireTeamMember. We verify the application belongs to the
 * caller's partner org via RLS, then read the timeline through the
 * service client because partner-authored RLS on application_timeline
 * would otherwise hide admin-authored events.
 *
 * Response:
 *   {
 *     timeline: Array<{
 *       id: string;
 *       status: string;
 *       notes: string | null;
 *       createdAt: string;
 *       createdBy: string | null;   // user id
 *       actorEmail: string | null;  // hydrated auth email
 *     }>
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { hydrateUserEmails } from '@/lib/partner-user-lookup';

export const dynamic = 'force-dynamic';

interface TimelineRow {
  id: string;
  status: string;
  notes: string | null;
  created_at: string;
  created_by: string | null;
}

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

  // Ownership check: RLS on partner_applications scopes this to the
  // caller's org automatically.
  const { data: app, error: appErr } = await auth.supabase
    .from('partner_applications')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (appErr) {
    console.error('[partner/applications/:id/timeline] ownership check failed:', appErr);
    return NextResponse.json({ error: appErr.message }, { status: 500 });
  }
  if (!app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const service = buildServiceClient();
  const { data: rows, error: timelineErr } = await service
    .from('application_timeline')
    .select('id, status, notes, created_at, created_by')
    .eq('partner_application_id', id)
    .order('created_at', { ascending: false });

  if (timelineErr) {
    console.error('[partner/applications/:id/timeline] timeline query failed:', timelineErr);
    return NextResponse.json({ error: timelineErr.message }, { status: 500 });
  }

  const events = (rows as TimelineRow[] | null) || [];
  const userIds = Array.from(new Set(events.map((e) => e.created_by).filter(Boolean)));
  const emailMap = await hydrateUserEmails(service, userIds as string[]);

  const timeline = events.map((event) => ({
    id: event.id,
    status: event.status,
    notes: event.notes,
    createdAt: event.created_at,
    createdBy: event.created_by,
    actorEmail: event.created_by ? (emailMap.get(event.created_by)?.email ?? null) : null,
  }));

  return NextResponse.json({ timeline });
}
