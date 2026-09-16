import { NextRequest, NextResponse } from 'next/server';
import { verifyCronSecret } from '@/lib/cron-auth';
import { buildServiceClient } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Phase 108 Batch 8: POST /api/cron/student-fees-overdue
 *
 * Daily cron that flips student_fees rows with due_date < today from
 * Pending/Partial to Overdue. Calls the SECURITY DEFINER
 * `student_fee_overdue_cron()` Postgres function (migration
 * 2026-09-16_phase108_fees_overdue_cron.sql) which returns the list
 * of flipped ids.
 *
 * After the function returns, we insert one `status_changed` audit
 * event per flipped row so the timeline tab reflects the automated
 * flips with actor_email='system@auto'.
 *
 * Auth: shared `x-cron-secret` header matched against
 * STUDENT_FEES_CRON_SECRET env var (src/lib/cron-auth.ts). Fails
 * CLOSED in production if the env var is unset (503); dev-friendly
 * when unset outside production.
 *
 * Schedule via cron-job.org once daily (e.g., 02:00 UTC).
 */
export async function POST(request: NextRequest) {
  return runOverdueCron(request);
}

export async function GET(request: NextRequest) {
  return runOverdueCron(request);
}

async function runOverdueCron(request: NextRequest) {
  const cron = verifyCronSecret(request, 'STUDENT_FEES_CRON_SECRET');
  if (!cron.ok) {
    return NextResponse.json({ error: cron.error }, { status: cron.status });
  }

  try {
    const service = buildServiceClient();
    // service_role bypasses RLS by design — same as news cron.
    const { data, error } = await service.rpc('student_fee_overdue_cron');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // data is a single row with flipped_count + fee_ids.
    const row = Array.isArray(data) ? data[0] : data;
    const flippedCount: number = row?.flipped_count ?? 0;
    const feeIds: string[] = Array.isArray(row?.fee_ids)
      ? (row.fee_ids as string[])
      : [];

    // Phase 108 Batch 8: best-effort audit events for the auto-overdue.
    // from_status is unknown (Pending or Partial) — we don't re-query.
    if (feeIds.length > 0) {
      const events = feeIds.map((fid) => ({
        fee_id: fid,
        event_type: 'status_changed',
        actor_id: null,
        actor_email: 'system@auto-overdue-cron',
        from_status: null,
        to_status: 'Overdue',
        note: 'Auto-marked overdue by daily cron',
      }));
      const { error: eventErr } = await service
        .from('student_fee_events')
        .insert(events);
      if (eventErr) {
        console.warn(
          '[cron/student-fees-overdue] event insert failed (best-effort):',
          eventErr,
        );
      }
    }

    return NextResponse.json({
      ok: true,
      flipped_count: flippedCount,
      fee_ids: feeIds,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}