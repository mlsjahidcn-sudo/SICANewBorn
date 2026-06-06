import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * Phase 2: GET /api/admin/documents/[id]
 *          PATCH /api/admin/documents/[id]  — set status, rejection_reason
 *
 * Admin document review. PATCH accepts:
 *   - status : 'Pending' | 'Verified' | 'Rejected'
 *   - rejection_reason : string | null  (required when status='Rejected',
 *                                          cleared when status='Verified')
 *
 * Side effects on PATCH:
 *   - Stamps `verified_at` + `verified_by` whenever status moves to
 *     Verified or Rejected (the canonical "this admin signed off on
 *     this at this time" audit row). Going back to Pending clears
 *     both fields.
 *   - Inserts a `student_notifications` row so the student sees a
 *     bell-badge in their portal the next time they log in. Uses
 *     `link_url=/student/documents?applicationId=<id>` so the click
 *     takes them straight to the doc list filtered to that
 *     application.
 *   - Failure to insert the notification is logged but does not
 *     fail the PATCH — the document state change is the user-visible
 *     outcome; the notification is best-effort.
 *
 * Auth: requireAdmin. The admin can review ANY document (no per-team
 * scoping — admin is global by design).
 */
const ALLOWED_STATUSES = ['Pending', 'Verified', 'Rejected'] as const;
type AdminDocStatus = (typeof ALLOWED_STATUSES)[number];

function notifyTitleFor(status: AdminDocStatus, docName: string): string {
  if (status === 'Verified') return `Document verified: ${docName}`;
  if (status === 'Rejected') return `Document rejected: ${docName}`;
  return `Document moved back to pending: ${docName}`;
}

function notifyMessageFor(
  status: AdminDocStatus,
  docName: string,
  rejectionReason: string | null,
): string {
  if (status === 'Verified') {
    return `Your "${docName}" document has been verified by the SICA team. You're all set.`;
  }
  if (status === 'Rejected') {
    const reason = rejectionReason ? ` Reason: ${rejectionReason}` : '';
    return `Your "${docName}" document was rejected.${reason} Please re-upload a corrected version.`;
  }
  return `Your "${docName}" document has been moved back to pending review.`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_documents')
      .select(
        `
          *,
          student:student_profiles!student_id (id, first_name, last_name, email)
        `,
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json({ document: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/documents/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await request.json();
    const { status, rejectionReason } = body as {
      status?: string;
      rejectionReason?: string | null;
    };

    if (!status || !(ALLOWED_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: "status must be 'Pending' | 'Verified' | 'Rejected'" },
        { status: 400 },
      );
    }
    const newStatus = status as AdminDocStatus;

    if (newStatus === 'Rejected') {
      const reason = typeof rejectionReason === 'string' ? rejectionReason.trim() : '';
      if (!reason) {
        return NextResponse.json(
          { error: 'rejectionReason is required when status is Rejected' },
          { status: 400 },
        );
      }
    }

    const service = buildServiceClient();

    // Fetch the doc first so we can hydrate the student notification
    // with the document name and skip the write if the doc is gone
    // (concurrent delete) or has no student owner.
    const { data: existing, error: fetchErr } = await service
      .from('student_documents')
      .select('id, name, student_id, application_id, status')
      .eq('id', id)
      .maybeSingle();
    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Build the update payload. verified_at + verified_by are
    // canonical audit fields — set when an admin signs off
    // (Verified or Rejected), cleared when the doc is moved
    // back to Pending.
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'Verified' || newStatus === 'Rejected') {
      updates.verified_at = new Date().toISOString();
      updates.verified_by = auth.user.id;
    } else {
      updates.verified_at = null;
      updates.verified_by = null;
    }
    if (newStatus === 'Rejected') {
      updates.rejection_reason = (rejectionReason as string).trim();
    } else {
      // Clear any prior rejection reason when re-approving or
      // moving back to pending — otherwise the student would
      // see a stale "rejected because X" warning on a doc
      // that's now pending.
      updates.rejection_reason = null;
    }

    const { data, error } = await service
      .from('student_documents')
      .update(updates)
      .eq('id', id)
      .select(
        `
          *,
          student:student_profiles!student_id (id, first_name, last_name, email)
        `,
      )
      .single();

    if (error) {
      console.error('[admin/documents/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Best-effort student notification. Skip for unowned docs
    // (no student_id) and for moves that don't change anything
    // user-visible.
    if (existing.student_id && existing.status !== newStatus) {
      const { error: notifErr } = await service
        .from('student_notifications')
        .insert({
          student_id: existing.student_id,
          title: notifyTitleFor(newStatus, existing.name),
          message: notifyMessageFor(
            newStatus,
            existing.name,
            newStatus === 'Rejected' ? (rejectionReason as string).trim() : null,
          ),
          type: 'document_review',
          // Phase 1.2 / Phase 2: deep-link to the document list
          // filtered to the application this doc belongs to.
          // If the doc is orphaned (no application_id), the
          // link_url is null and the inbox row falls back to
          // the general notifications page.
          link_url: existing.application_id
            ? `/student/documents?applicationId=${existing.application_id}`
            : null,
        });
      if (notifErr) {
        console.error(
          '[admin/documents/:id PATCH] student_notification insert failed (non-fatal):',
          notifErr,
        );
      }
    }

    return NextResponse.json({ document: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/documents/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
