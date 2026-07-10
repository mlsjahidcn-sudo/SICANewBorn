/**
 * /api/partner/applications/[id]/request-withdrawal
 *
 * Phase 49.4: a partner who wants to back out of a submitted
 * application doesn't have a UI for it (S27 made status
 * admin-only). Instead of letting them silently edit the
 * application to a broken state, this endpoint inserts a
 * timeline event with status='Withdrawal Requested' that the
 * admin sees in the partner-application detail timeline. The
 * admin then sets the row's actual status='Withdrawn' via
 * the existing PATCH /api/admin/partner-applications/[id].
 *
 * Auth: requireTeamMember. RLS already scopes the partner to
 * their own org. The timeline write is best-effort — if it
 * fails we still return 200 because the side effect is the
 * in-app signal, not a hard state change.
 *
 * Response: { ok: true, requestedAt: ISO8601 string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { insertTimelineEvent } from '@/lib/timeline';

export async function POST(
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

  try {
    // Parse the optional reason from the body. We don't enforce
    // a schema — partner can send `{ reason: '...' }` or {}.
    // The reason is stored in the timeline event's notes column.
    let reason: string | null = null;
    try {
      const body = await request.json().catch(() => ({}));
      const raw = typeof body?.reason === 'string' ? body.reason.trim() : '';
      if (raw) {
        // Cap the reason at 1000 chars to keep the timeline row
        // a sensible size. Server-side guard so a partner can't
        // paste an essay.
        reason = raw.slice(0, 1000);
      }
    } catch {
      // empty body is fine
    }

    // Confirm the application belongs to this partner before
    // inserting a timeline event. RLS would also catch this, but
    // a fast-fail here is cleaner.
    const { data: app, error: appErr } = await auth.supabase
      .from('partner_applications')
      .select('id, student_name, university, status, decision')
      .eq('id', id)
      .maybeSingle();
    if (appErr) {
      console.error('[partner/applications/:id/request-withdrawal] select failed:', appErr);
      return NextResponse.json({ error: appErr.message }, { status: 500 });
    }
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Don't let a partner request withdrawal on an already-Withdrawn
    // row — saves the admin from chasing duplicate requests.
    if (app.status === 'Withdrawn') {
      return NextResponse.json(
        { error: 'This application is already withdrawn.' },
        { status: 400 },
      );
    }

    const requestedAt = new Date().toISOString();
    // The timeline's status column is a freeform VARCHAR (per
    // src/lib/timeline.ts); we use 'Withdrawal Requested' as
    // a marker the admin UI can pattern-match. The reason
    // (if any) goes into notes. created_by is the partner's
    // own user id, so the audit trail shows who asked.
    const noteLines = [
      `Partner ${auth.user.email || auth.user.id} requested withdrawal on ${requestedAt}.`,
    ];
    if (reason) noteLines.push(`Reason: ${reason}`);
    noteLines.push(`Application: ${app.student_name} · ${app.university} (current status: ${app.status}, decision: ${app.decision})`);

    await insertTimelineEvent(auth.supabase, {
      partner_application_id: id,
      status: 'Withdrawal Requested',
      notes: noteLines.join('\n'),
      created_by: auth.user.id,
    });

    return NextResponse.json({ ok: true, requestedAt }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/applications/:id/request-withdrawal] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
