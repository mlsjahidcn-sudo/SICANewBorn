import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';

/**
 * Phase 2: POST /api/admin/documents/bulk
 *
 * Bulk approve / reject student documents. Same status taxonomy
 * as the single-doc PATCH, just without a per-row fetch. Capped
 * at 200 rows per call (matches the S31 admin applications bulk
 * cap) so a runaway client can't lock the DB.
 *
 * Body:
 *   - ids   : string[]  (1..200)
 *   - status: 'Verified' | 'Rejected'
 *   - rejectionReason : string | null  (required when status='Rejected')
 *
 * Side effects (per row): verified_at + verified_by stamp +
 * student_notification insert. Notifications are best-effort —
 * per-row failures are recorded in the `failed` array but don't
 * abort the rest of the batch.
 *
 * Returns: { updated, failed: [{ id, error }] }
 */
const ALLOWED_BULK_STATUSES = ['Verified', 'Rejected'] as const;
type BulkStatus = (typeof ALLOWED_BULK_STATUSES)[number];

const MAX_BULK_ROWS = 200;

function notifyTitleFor(status: BulkStatus, docName: string): string {
  if (status === 'Verified') return `Document verified: ${docName}`;
  return `Document rejected: ${docName}`;
}

function notifyMessageFor(
  status: BulkStatus,
  docName: string,
  rejectionReason: string | null,
): string {
  if (status === 'Verified') {
    return `Your "${docName}" document has been verified by the SICA team. You're all set.`;
  }
  const reason = rejectionReason ? ` Reason: ${rejectionReason}.` : '';
  return `Your "${docName}" document was rejected.${reason} Please re-upload a corrected version.`;
}

// Phase 62 (Bug 4): partner-side notifications — same wording as
// the single-doc PATCH (mirrors src/app/api/admin/documents/[id]/route.ts
// helpers notifyPartnerTitleFor / notifyPartnerMessageFor).
function notifyPartnerTitleFor(status: BulkStatus, docName: string): string {
  if (status === 'Verified') return `Document verified: ${docName}`;
  return `Document rejected: ${docName}`;
}

function notifyPartnerMessageFor(
  status: BulkStatus,
  docName: string,
  rejectionReason: string | null,
): string {
  if (status === 'Verified') {
    return `An admin verified ${docName}. No action needed.`;
  }
  const reason = rejectionReason ? ` for: ${rejectionReason}` : '';
  return `An admin rejected ${docName}${reason}. Please upload a corrected version.`;
}

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json();
    const ids = Array.isArray(body.ids) ? body.ids.filter((x: unknown) => typeof x === 'string') : [];
    const status = body.status as string;
    const rejectionReason =
      typeof body.rejectionReason === 'string' ? body.rejectionReason.trim() : '';

    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }
    if (ids.length > MAX_BULK_ROWS) {
      return NextResponse.json(
        { error: `ids exceeds ${MAX_BULK_ROWS}-row cap` },
        { status: 400 },
      );
    }
    if (!(ALLOWED_BULK_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: "status must be 'Verified' | 'Rejected'" },
        { status: 400 },
      );
    }
    if (status === 'Rejected' && !rejectionReason) {
      return NextResponse.json(
        { error: 'rejectionReason is required when status is Rejected' },
        { status: 400 },
      );
    }
    const newStatus = status as BulkStatus;

    const service = buildServiceClient();

    // Pre-fetch the rows so we know which ones to write
    // notifications for. Filtering on student_id IS NOT NULL
    // because the bulk update itself doesn't need the student
    // name — but the notification step does.
    // Phase 62 (Bug 4): also pull partner_student_id +
    // partner_application_id so partner-uploaded docs fire a
    // partner_notification (matching the single PATCH behavior).
    const { data: docs, error: fetchErr } = await service
      .from('student_documents')
      .select('id, name, student_id, application_id, partner_student_id, partner_application_id')
      .in('id', ids);
    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const foundIds = new Set((docs || []).map((d) => (d as { id: string }).id));
    const missing = ids.filter((id: string) => !foundIds.has(id));

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = {
      status: newStatus,
      verified_at: now,
      verified_by: auth.user.id,
    };
    if (newStatus === 'Rejected') {
      updates.rejection_reason = rejectionReason;
    } else {
      updates.rejection_reason = null;
    }

    const { data: updatedRows, error: updErr } = await service
      .from('student_documents')
      .update(updates)
      .in('id', Array.from(foundIds))
      .select('id, name, student_id, application_id, partner_student_id, partner_application_id');

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    // Best-effort per-row notification. Collect any failures
    // and return them with the response.
    const failed: { id: string; error: string }[] = missing.map((id: string) => ({
      id,
      error: 'Document not found',
    }));

    // Phase 62 (Bug 4): partner-notification resolution is
    // O(distinct partner_students per row), not O(rows). Pre-resolve
    // the partner org owner user_ids in one pass before the loop so
    // bulk operations stay cheap.
    const partnerStudentIds = Array.from(
      new Set(
        (updatedRows || [])
          .map((r) => (r as { partner_student_id?: string | null }).partner_student_id)
          .filter((x): x is string => typeof x === 'string'),
      ),
    );
    const partnerOwnerByStudentId = new Map<string, string>();
    if (partnerStudentIds.length > 0) {
      const { data: psRows, error: psErr } = await service
        .from('partner_students')
        .select('id, partner_id, partner:partners!partner_id (user_id)')
        .in('id', partnerStudentIds);
      if (psErr) {
        console.error('[admin/documents/bulk] partner_students lookup failed (non-fatal):', psErr);
      } else {
        for (const row of psRows || []) {
          const r = row as { id: string; partner: unknown };
          const partnerRel = r.partner;
          const partnerObj = Array.isArray(partnerRel) ? partnerRel[0] : partnerRel;
          const userId =
            (partnerObj as { user_id?: string | null } | null)?.user_id || null;
          if (userId) partnerOwnerByStudentId.set(r.id, userId);
        }
      }
    }

    for (const row of updatedRows || []) {
      const r = row as {
        id: string;
        name: string;
        student_id: string | null;
        application_id: string | null;
        partner_student_id?: string | null;
        partner_application_id?: string | null;
      };
      // Student-side notification (unchanged from Phase 2).
      if (r.student_id) {
        const { error: notifErr } = await service
          .from('student_notifications')
          .insert({
            student_id: r.student_id,
            title: notifyTitleFor(newStatus, r.name),
            message: notifyMessageFor(newStatus, r.name, newStatus === 'Rejected' ? rejectionReason : null),
            type: 'document_review',
            link_url: r.application_id
              ? `/student/documents?applicationId=${r.application_id}`
              : null,
          });
        if (notifErr) {
          failed.push({ id: r.id, error: notifErr.message });
        }
      }
      // Phase 62 (Bug 4): partner-side notification (mirrors
      // single PATCH at src/app/api/admin/documents/[id]/route.ts:312).
      // Only fires for partner-uploaded rows (partner_student_id set)
      // and only on a status-bearing move into Verified/Rejected.
      // Back-to-Pending is admin-internal workflow and intentionally
      // excluded — same as the single PATCH.
      const partnerOwnerUserId = r.partner_student_id
        ? partnerOwnerByStudentId.get(r.partner_student_id)
        : undefined;
      if (partnerOwnerUserId) {
        const { error: pNotifErr } = await service
          .from('partner_notifications')
          .insert({
            user_id: partnerOwnerUserId,
            link_url: r.partner_application_id
              ? `/partner/documents?applicationId=${r.partner_application_id}`
              : '/partner/documents',
            title: notifyPartnerTitleFor(newStatus, r.name),
            message: notifyPartnerMessageFor(
              newStatus,
              r.name,
              newStatus === 'Rejected' ? rejectionReason : null,
            ),
            type: 'document_review',
          });
        if (pNotifErr) {
          // Don't fail the whole row — the student side already
          // succeeded. Append to `failed` so the UI surfaces the gap.
          failed.push({ id: r.id, error: `partner_notification: ${pNotifErr.message}` });
        }
      }
    }

    return NextResponse.json({
      updated: (updatedRows || []).length,
      failed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/documents/bulk] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
