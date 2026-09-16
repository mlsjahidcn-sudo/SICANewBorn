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
        if (bulkAction === 'markPaid') {
          // Read the row first to get the amount (PostgREST can't
          // .update(col=row.col) without an RPC). One extra round
          // trip per row is fine at this scale.
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
          // Refuse to mark already-Paid or already-Cancelled as Paid
          // — those are terminal or already-done transitions.
          if (existing.status === 'Paid') {
            failed.push({ id, error: 'Already Paid' });
            continue;
          }
          if (existing.status === 'Cancelled') {
            failed.push({ id, error: 'Already Cancelled' });
            continue;
          }
          const { error: updateErr } = await service
            .from('student_fees')
            .update({
              status: 'Paid',
              amount_paid: existing.amount,
              paid_date: today,
            })
            .eq('id', id);
          if (updateErr) {
            failed.push({ id, error: updateErr.message });
          } else {
            updated.push(id);
          }
        } else if (bulkAction === 'markPartial') {
          // Refuse to move Paid/Cancelled into Partial (terminal
          // / already-valid states).
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
          const { error: updateErr } = await service
            .from('student_fees')
            .update({ status: 'Partial' })
            .eq('id', id);
          if (updateErr) {
            failed.push({ id, error: updateErr.message });
          } else {
            updated.push(id);
          }
        } else if (bulkAction === 'cancel') {
          const { error: updateErr } = await service
            .from('student_fees')
            .update({ status: 'Cancelled' })
            .eq('id', id);
          if (updateErr) {
            failed.push({ id, error: updateErr.message });
          } else {
            updated.push(id);
          }
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