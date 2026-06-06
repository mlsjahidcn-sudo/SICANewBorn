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
    const { data: docs, error: fetchErr } = await service
      .from('student_documents')
      .select('id, name, student_id, application_id')
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
      .select('id, name, student_id, application_id');

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 });
    }

    // Best-effort per-row notification. Collect any failures
    // and return them with the response.
    const failed: { id: string; error: string }[] = missing.map((id: string) => ({
      id,
      error: 'Document not found',
    }));

    for (const row of updatedRows || []) {
      const r = row as {
        id: string;
        name: string;
        student_id: string | null;
        application_id: string | null;
      };
      if (!r.student_id) continue;
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
