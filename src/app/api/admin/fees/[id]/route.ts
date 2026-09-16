import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapStudentFeeFromDb } from '@/lib/student-fee-mapper';
import { pickStudentFeeUpdates } from '@/lib/student-fee-validation';

/**
 * GET    /api/admin/fees/[id]  — single fee with student + application joins
 * PATCH  /api/admin/fees/[id]  — update a fee (mark as paid, change amount, etc.)
 * DELETE /api/admin/fees/[id]  — soft cancel (sets status='Cancelled')
 */
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
  if (!id) return NextResponse.json({ error: 'Missing fee id' }, { status: 400 });

  try {
    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_fees')
      .select(
        // Note: student_applications stores the slug-like identifiers as
        // `university_id` / `program_id` (varchar), not `university_slug`
        // / `program_slug`. The wizard's mapper (Phase 97) confirmed
        // university_id IS the slug. The error
        // "column student_applications_1.university_slug does not exist"
        // surfaced when this select was deployed — fixed.
        `*,
         student:student_profiles!student_id (id, first_name, last_name, email),
         application:student_applications!application_id (id, application_number, university_id, program_id)`,
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    type Joined = {
      student?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
      } | null;
      application?: {
        id: string;
        application_number: string | null;
        university_id: string | null;
        program_id: string | null;
      } | null;
    };
    const row = data as typeof data & Joined;
    const mapped = mapStudentFeeFromDb(row);
    return NextResponse.json({
      fee: {
        ...mapped,
        student: row.student
          ? {
              id: row.student.id,
              firstName: row.student.first_name,
              lastName: row.student.last_name,
              email: row.student.email,
            }
          : null,
        application: row.application
          ? {
              id: row.application.id,
              applicationNumber: row.application.application_number,
              universitySlug: row.application.university_id,
              programSlug: row.application.program_id,
            }
          : null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
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
  if (!id) return NextResponse.json({ error: 'Missing fee id' }, { status: 400 });

  try {
    const body = await request.json();
    const updates = pickStudentFeeUpdates(body);
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
    }

    const service = buildServiceClient();

    // Read the existing row so we can derive status from amount_paid
    // AND build the audit-trail event with from_status / to_status.
    const { data: existing, error: existingErr } = await service
      .from('student_fees')
      .select('amount, status, amount_paid, payment_proof_url')
      .eq('id', id)
      .maybeSingle();
    if (existingErr) {
      return NextResponse.json({ error: existingErr.message }, { status: 500 });
    }
    if (!existing) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    const fromStatus = existing.status;
    const fromAmountPaid = Number(existing.amount_paid) || 0;

    // Phase 108 Batch 7: auto-derive status from amount_paid writes.
    //   paid >= amount → 'Paid' + paid_date = today
    //   paid > 0 and < amount → 'Partial' (only if currently not Paid/Cancelled)
    if (typeof updates.amount_paid === 'number') {
      const total = Number(existing.amount);
      if (updates.amount_paid >= total) {
        updates.status = 'Paid';
        updates.paid_date = new Date().toISOString().slice(0, 10);
      } else if (updates.amount_paid > 0) {
        if (fromStatus === 'Pending' || fromStatus === 'Overdue') {
          updates.status = 'Partial';
        }
      }
    }

    // Stamp the actor so the audit trail knows who did it.
    updates.updated_by = auth.user.id;

    const { data, error } = await service
      .from('student_fees')
      .update(updates)
      .eq('id', id)
      .select('*, student:student_profiles!student_id (id, first_name, last_name, email), application:student_applications!application_id (id, application_number, university_id, program_id)')
      .single();

    if (error) {
      console.error('[admin/fees/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Phase 108 Batch 7: write the audit-trail event. One event per
    // request — status_changed if status moved, amount_paid_changed
    // if amount_paid moved (and status didn't, otherwise the status
    // event captures both), payment_proof_uploaded if payment_proof_url
    // was set/cleared. Best-effort: a failed event insert doesn't fail
    // the PATCH (the row update already committed).
    try {
      const toStatus = updates.status || fromStatus;
      const statusMoved = toStatus !== fromStatus;
      const amountPaidMoved =
        typeof updates.amount_paid === 'number' &&
        updates.amount_paid !== fromAmountPaid;
      const proofMoved =
        typeof updates.payment_proof_url !== 'undefined' &&
        updates.payment_proof_url !== existing.payment_proof_url;

      let eventType: string | null = null;
      if (statusMoved) eventType = 'status_changed';
      else if (amountPaidMoved) eventType = 'amount_paid_changed';
      else if (proofMoved) eventType = 'payment_proof_uploaded';

      if (eventType) {
        await service.from('student_fee_events').insert({
          fee_id: id,
          event_type: eventType,
          actor_id: auth.user.id,
          actor_email: auth.user.email || null,
          from_status: statusMoved ? fromStatus : null,
          to_status: statusMoved ? toStatus : null,
          amount_paid_at_event:
            eventType === 'amount_paid_changed' ? updates.amount_paid : null,
        });
      }
    } catch (eventInsertErr) {
      console.warn('[admin/fees/:id PATCH] event insert failed:', eventInsertErr);
    }

    return NextResponse.json({ fee: mapStudentFeeFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: 'Missing fee id' }, { status: 400 });

  try {
    const service = buildServiceClient();
    // Read the current status so we can record from_status on the audit
    // event (we don't want all cancels to look like Pending → Cancelled).
    const { data: existing } = await service
      .from('student_fees')
      .select('status')
      .eq('id', id)
      .maybeSingle();
    const fromStatus = existing?.status || null;

    // Prefer cancel over delete to preserve audit
    const { data, error } = await service
      .from('student_fees')
      .update({ status: 'Cancelled', updated_by: auth.user.id })
      .eq('id', id)
      .select('id, status')
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Phase 108 Batch 7: best-effort audit event for the soft cancel.
    try {
      await service.from('student_fee_events').insert({
        fee_id: id,
        event_type: 'status_changed',
        actor_id: auth.user.id,
        actor_email: auth.user.email || null,
        from_status: fromStatus,
        to_status: 'Cancelled',
      });
    } catch (eventInsertErr) {
      console.warn('[admin/fees/:id DELETE] event insert failed:', eventInsertErr);
    }

    // DELETE returns the soft-cancelled row, not the original — clients
    // re-fetch if they need the full mapped shape.
    return NextResponse.json({ success: true, fee: { id: data.id, status: data.status } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
