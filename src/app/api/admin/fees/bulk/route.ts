import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { parseStudentFeeStatus } from '@/lib/student-fee-mapper';

export const dynamic = 'force-dynamic';

/**
 * Phase 108 Batch 5: POST /api/admin/fees/bulk
 *
 * Apply a status action to many student_fees at once. Single table — no
 * surface probe needed (unlike /api/admin/applications/bulk which has to
 * resolve student vs partner surfaces).
 *
 * Body:
 *   {
 *     feeIds: string[],                          // row ids (UUIDs)
 *     action: 'markPaid' | 'markPartial' | 'cancel'
 *   }
 *
 * markPaid    — set status='Paid', amount_paid=amount, paid_date=today
 * markPartial — set status='Partial', leave amount_paid untouched
 * cancel      — set status='Cancelled' (soft cancel; row preserved)
 *
 * Response: { updated: number, failed: Array<{id, error}> }
 *
 * Concurrency: one row at a time (sequential). For v1 the 200-row cap
 * keeps this fast (<500ms p99 typical). The per-row try/catch isolates
 * failures — one bad row never blocks the rest.
 */
const ALLOWED_ACTIONS = ['markPaid', 'markPartial', 'cancel'] as const;
type BulkAction = (typeof ALLOWED_ACTIONS)[number];
const MAX_FEE_IDS = 200;

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const feeIds: unknown = body.feeIds;
    const action: unknown = body.action;

    if (!Array.isArray(feeIds) || feeIds.length === 0) {
      return NextResponse.json(
        { error: 'feeIds must be a non-empty array' },
        { status: 400 },
      );
    }
    if (feeIds.length > MAX_FEE_IDS) {
      return NextResponse.json(
        { error: `feeIds cannot exceed ${MAX_FEE_IDS} rows per request` },
        { status: 400 },
      );
    }
    for (const id of feeIds) {
      if (typeof id !== 'string' || id.length !== 36) {
        return NextResponse.json(
          { error: 'each feeId must be a 36-char UUID string' },
          { status: 400 },
        );
      }
    }
    if (
      typeof action !== 'string' ||
      !(ALLOWED_ACTIONS as readonly string[]).includes(action)
    ) {
      return NextResponse.json(
        { error: `action must be one of ${ALLOWED_ACTIONS.join(' | ')}` },
        { status: 400 },
      );
    }

    const service = buildServiceClient();
    const today = new Date().toISOString().slice(0, 10);
    const bulkAction = action as BulkAction;

    const updated: string[] = [];
    const failed: Array<{ id: string; error: string }> = [];

    for (const id of feeIds as string[]) {
      try {
        let targetStatus: string | null = null;
        let fromStatus: string | null = null;
        let updatePayload: Record<string, unknown> = {};

        if (bulkAction === 'markPaid') {
          const { data: existing, error: readErr } = await service
            .from('student_fees')
            .select('amount, status')
            .eq('id', id)
            .maybeSingle();
          if (readErr) {
            failed.push({ id, error: readErr.message });
            continue;
          }
          if (!existing) {
            failed.push({ id, error: 'Fee not found' });
            continue;
          }
          if (existing.status === 'Paid') {
            failed.push({ id, error: 'Already Paid' });
            continue;
          }
          if (existing.status === 'Cancelled') {
            failed.push({ id, error: 'Already Cancelled' });
            continue;
          }
          fromStatus = existing.status;
          targetStatus = 'Paid';
          updatePayload = {
            status: 'Paid',
            amount_paid: existing.amount,
            paid_date: today,
            updated_by: auth.user.id,
          };
        } else if (bulkAction === 'markPartial') {
          const { data: existing, error: readErr } = await service
            .from('student_fees')
            .select('status')
            .eq('id', id)
            .maybeSingle();
          if (readErr) {
            failed.push({ id, error: readErr.message });
            continue;
          }
          if (!existing) {
            failed.push({ id, error: 'Fee not found' });
            continue;
          }
          if (existing.status === 'Paid' || existing.status === 'Cancelled') {
            failed.push({ id, error: `Cannot move ${existing.status} to Partial` });
            continue;
          }
          fromStatus = existing.status;
          targetStatus = 'Partial';
          updatePayload = { status: 'Partial', updated_by: auth.user.id };
        } else if (bulkAction === 'cancel') {
          const { data: existing } = await service
            .from('student_fees')
            .select('status')
            .eq('id', id)
            .maybeSingle();
          fromStatus = existing?.status || null;
          targetStatus = 'Cancelled';
          updatePayload = { status: 'Cancelled', updated_by: auth.user.id };
        }

        const { error: updateErr } = await service
          .from('student_fees')
          .update(updatePayload)
          .eq('id', id);

        if (updateErr) {
          failed.push({ id, error: updateErr.message });
          continue;
        }
        updated.push(id);

        // Phase 108 Batch 7: best-effort audit event. event_type =
        // 'bulk_action' so the timeline tab can render an amber chip
        // distinguishing bulk ops from single-row edits.
        try {
          await service.from('student_fee_events').insert({
            fee_id: id,
            event_type: 'bulk_action',
            actor_id: auth.user.id,
            actor_email: auth.user.email || null,
            from_status: fromStatus,
            to_status: targetStatus,
            note: `Bulk ${bulkAction} (${feeIds.length} fees selected)`,
          });
        } catch (eventInsertErr) {
          console.warn('[admin/fees/bulk] event insert failed:', eventInsertErr);
        }
      } catch (err) {
        failed.push({
          id,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      updated: updated.length,
      failed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}