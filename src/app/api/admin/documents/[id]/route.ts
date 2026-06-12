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

// Partner-side mirror of notifyTitleFor / notifyMessageFor. The
// data-layer partner-documents migration (2026-06-12) added
// partner_student_id + partner_application_id so admin PATCH on a
// partner-uploaded row fires a parallel partner_notifications
// insert. The partner sees the same Verified/Rejected badge in
// their /partner/notifications inbox.
function notifyPartnerTitleFor(status: AdminDocStatus, docName: string): string {
  if (status === 'Verified') return `Document verified: ${docName}`;
  if (status === 'Rejected') return `Document rejected: ${docName}`;
  return `Document moved back to pending: ${docName}`;
}

function notifyPartnerMessageFor(
  status: AdminDocStatus,
  docName: string,
  rejectionReason: string | null,
): string {
  if (status === 'Verified') {
    return `An admin verified ${docName}. No action needed.`;
  }
  if (status === 'Rejected') {
    const reason = rejectionReason ? ` for: ${rejectionReason}` : '';
    return `An admin rejected ${docName}${reason}. Please upload a corrected version.`;
  }
  return `An admin moved ${docName} back to pending review.`;
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
    const { status, rejectionReason, applicationId } = body as {
      // Phase 18: status is now optional. Previously required,
      // but the "create application" wizard needs to PATCH a
      // doc just to link it to the new application (no status
      // change). If status is omitted we only touch
      // application_id; the existing status / verified_at /
      // rejection_reason are preserved as-is.
      status?: string;
      rejectionReason?: string | null;
      // Phase 18: admin can now PATCH a document's
      // application_id to link it to a new application. Set to
      // null to unlink. Used by the "create application" wizard
      // when the admin picks verified documents to auto-sync.
      // Whitelisted separately from status/rejectionReason so
      // a status-only PATCH still works exactly as before.
      applicationId?: string | null;
    };

    // At least one of status / applicationId must be present —
    // a PATCH that touches nothing is a 400, not a silent no-op.
    if (status === undefined && applicationId === undefined) {
      return NextResponse.json(
        { error: 'No editable fields provided (status, applicationId)' },
        { status: 400 },
      );
    }

    if (status !== undefined && !(ALLOWED_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: "status must be 'Pending' | 'Verified' | 'Rejected'" },
        { status: 400 },
      );
    }
    const newStatus = (status ?? null) as AdminDocStatus | null;

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
    // Also pulls `partner_student_id` so we can mirror the same
    // status-change signal to the partner portal's notification
    // inbox (the data-layer partner-documents migration added
    // partner_student_id + partner_application_id columns; the
    // partner sees the same Verified/Rejected flow in their
    // /partner/notifications bell badge).
    const { data: existing, error: fetchErr } = await service
      .from('student_documents')
      .select(
        'id, name, student_id, application_id, partner_student_id, partner_application_id, status',
      )
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
    //
    // Phase 18: status is optional. If the caller didn't include
    // it, we don't touch status / verified_at / rejection_reason —
    // only application_id (when applicationId is in the body).
    // This lets the "create application" wizard link docs to a
    // new application without implicitly auto-verifying them.
    const updates: Record<string, unknown> = {};
    if (newStatus !== null) {
      updates.status = newStatus;
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
    }
    // Phase 18: optional application_id update. Only write the
    // field when the caller explicitly included `applicationId`
    // in the body — otherwise the existing link is preserved.
    // Accepts null to unlink (used by the docs-page UI).
    if (applicationId !== undefined) {
      updates.application_id =
        applicationId === null ? null : String(applicationId);
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
    // user-visible. Phase 18: also skip for link-only PATCHes
    // (newStatus === null) — a "linked to a new application"
    // change isn't status-bearing, the student will see the link
    // when they open the application detail page directly.
    if (existing.student_id && newStatus !== null && existing.status !== newStatus) {
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

    // Best-effort partner notification (mirrors the student
    // block above). Only fires for partner-uploaded docs
    // (partner_student_id IS NOT NULL) on a status-bearing
    // move (not Pending, not a same→same no-op, not a link-only
    // PATCH). Resolves partner_student_id → partners.user_id
    // (the column partner_notifications expects — auth.users.id
    // of the partner org owner, not partners.id). Fire-and-forget
    // pattern matches the student side: a partner_notification
    // failure is logged but does NOT fail the admin PATCH.
    //
    // Why no Pending notification on back-to-pending moves: same
    // reason as the student-side skip — a back-to-pending is
    // admin-internal workflow (typically reopening after a
    // re-upload) and isn't a signal the partner needs to act on.
    if (
      existing.partner_student_id &&
      newStatus !== null &&
      existing.status !== newStatus &&
      newStatus !== 'Pending'
    ) {
      // Resolve the partner org's owner user_id (the
      // partner_notifications.user_id FK). One row per
      // partner_student_id → one partner.user_id.
      const { data: psOwner, error: psOwnerErr } = await service
        .from('partner_students')
        .select('partner_id, partner:partners!partner_id (user_id)')
        .eq('id', existing.partner_student_id)
        .maybeSingle();
      if (psOwnerErr) {
        console.error(
          '[admin/documents/:id PATCH] partner_students lookup failed (non-fatal):',
          psOwnerErr,
        );
      } else if (psOwner) {
        // partner may be an object (1:1) or an array — normalize.
        const partnerRel = (psOwner as { partner: unknown }).partner;
        const partnerObj = Array.isArray(partnerRel) ? partnerRel[0] : partnerRel;
        const partnerUserId =
          (partnerObj as { user_id?: string | null } | null)?.user_id || null;
        if (partnerUserId) {
          const { error: pNotifErr } = await service
            .from('partner_notifications')
            .insert({
              user_id: partnerUserId,
              // Phase 1.2: link_url pattern is
              // /partner/applications/<id> for app-scoped
              // notifications. For docs we deep-link to
              // /partner/documents — the new partner docs
              // index page (Track 3). The path is hard-coded
              // here because the index page isn't built yet;
              // the verifier will confirm the eventual path
              // matches this string.
              link_url: existing.partner_application_id
                ? `/partner/documents?applicationId=${existing.partner_application_id}`
                : '/partner/documents',
              title: notifyPartnerTitleFor(newStatus, existing.name),
              message: notifyPartnerMessageFor(
                newStatus,
                existing.name,
                newStatus === 'Rejected'
                  ? (rejectionReason as string).trim()
                  : null,
              ),
              type: 'document_review',
            });
          if (pNotifErr) {
            console.error(
              '[admin/documents/:id PATCH] partner_notification insert failed (non-fatal):',
              pNotifErr,
            );
          }
        }
      }
    }

    return NextResponse.json({ document: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/documents/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
