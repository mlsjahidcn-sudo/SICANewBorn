import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapStudentFromDb, parseStatus } from '@/lib/student-mapper';
import { sendStudentSuspended } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Phase 122a: POST /api/admin/students/bulk
 *
 * Bulk status management for the admin students list — the parity gap
 * behind S31 (admin applications bulk) and Phase 1.4 (partner
 * applications bulk). Deliberately narrower than the applications
 * bulk routes: there is NO bulk hard-delete. Hard delete cascades the
 * auth.users row through every child table and is guarded by a
 * type-the-email confirmation on the single-row flow (Phase 85) —
 * auto-applying that to N rows at once would defeat the guard.
 *
 * Body:
 *   {
 *     ids: string[],   // student_profiles.id values (UUIDs)
 *     action: 'status',
 *     value: 'Active' | 'Inactive' | 'Pending' | 'Suspended'
 *   }
 *
 * Moving a row to 'Suspended' also fires the suspension email
 * (fire-and-forget, skipped when the row has no real email — the
 * Phase 90 placeholder addresses), mirroring the single-row suspend
 * semantics. Other status transitions are silent.
 *
 * Response: { updated: number, failed: Array<{ id, error }> }
 * Same-at-a-time-per-row loop mirrors /api/admin/applications/bulk so
 * one bad row (already deleted, RLS edge) doesn't fail the batch.
 */
const MAX_BULK_ROWS = 200;

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as {
      ids?: unknown;
      action?: unknown;
      value?: unknown;
    };

    const ids = Array.isArray(body.ids) ? body.ids : [];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'ids must be a non-empty array' }, { status: 400 });
    }
    if (ids.length > MAX_BULK_ROWS) {
      return NextResponse.json(
        { error: `Bulk actions are limited to ${MAX_BULK_ROWS} rows per call` },
        { status: 400 },
      );
    }
    if (body.action !== 'status') {
      return NextResponse.json(
        { error: "action must be 'status' — bulk hard-delete is intentionally not supported" },
        { status: 400 },
      );
    }
    const nextStatus = parseStatus(body.value);
    if (!nextStatus) {
      return NextResponse.json(
        { error: 'value must be one of: Active, Inactive, Pending, Suspended' },
        { status: 400 },
      );
    }

    const validIds = ids.filter((id): id is string => typeof id === 'string' && id.length > 0);
    const failed: Array<{ id: string; error: string }> = ids
      .filter((id) => typeof id !== 'string' || id.length === 0)
      .map((id) => ({ id: String(id), error: 'invalid id' }));

    const service = buildServiceClient();

    // Load the affected rows once: existence check (404-style failure
    // per row) + the contact fields the suspension email needs.
    const { data: rows, error: fetchErr } = await service
      .from('student_profiles')
      .select('id, first_name, last_name, email, status')
      .in('id', validIds);
    if (fetchErr) {
      console.error('[admin/students/bulk] fetch error:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }

    const byId = new Map<string, { first_name: string | null; email: string | null; status: string | null }>();
    for (const row of rows || []) {
      const r = row as { id: string; first_name: string | null; email: string | null; status: string | null };
      byId.set(r.id, { first_name: r.first_name, email: r.email, status: r.status });
    }

    let updated = 0;
    for (const id of validIds) {
      const row = byId.get(id);
      if (!row) {
        failed.push({ id, error: 'Student not found' });
        continue;
      }
      const { error: updateErr } = await service
        .from('student_profiles')
        .update({ status: nextStatus })
        .eq('id', id);
      if (updateErr) {
        console.error(`[admin/students/bulk] update failed for ${id}:`, updateErr);
        failed.push({ id, error: updateErr.message });
        continue;
      }
      updated += 1;

      if (nextStatus === 'Suspended' && row.status !== 'Suspended' && row.email) {
        void sendStudentSuspended({
          firstName: row.first_name || 'Student',
          email: row.email,
          suspendedByAdmin:
            (auth.user.user_metadata?.full_name as string | undefined) ||
            auth.user.email ||
            'SICA Admin',
          suspendedAt: new Date().toLocaleString(),
        }).catch((err) => console.error('[admin/students/bulk] suspension email failed:', err));
      }
    }

    // Surface the effective row count so the UI can reconcile its
    // selection against rows that no longer exist.
    const students = (rows || []).map((row) => mapStudentFromDb(row as Record<string, unknown>));

    return NextResponse.json({ updated, failed, matched: students.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/bulk] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
