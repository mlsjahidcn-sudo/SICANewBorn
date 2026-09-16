import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapStudentFeeFromDb } from '@/lib/student-fee-mapper';

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
        `*,
         student:student_profiles!student_id (id, first_name, last_name, email),
         application:student_applications!application_id (id, application_number, university_slug, program_slug)`,
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
        university_slug: string | null;
        program_slug: string | null;
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
              universitySlug: row.application.university_slug,
              programSlug: row.application.program_slug,
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
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (['id', 'student_id', 'created_at'].includes(k)) continue;
      updates[k] = v;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
    }

    // If amount_paid is being set, auto-derive status:
    //   paid >= amount → 'Paid' + paid_date = now
    //   paid > 0 and < amount → 'Partial'
    // We need the existing `amount` to do the compare, so we may need
    // to read the row first.
    if (typeof updates.amount_paid === 'number') {
      const service = buildServiceClient();
      const { data: existing } = await service
        .from('student_fees')
        .select('amount, status')
        .eq('id', id)
        .maybeSingle();
      if (existing) {
        const total = Number(existing.amount);
        if (updates.amount_paid >= total) {
          updates.status = 'Paid';
          updates.paid_date = new Date().toISOString().slice(0, 10);
        } else if (updates.amount_paid > 0) {
          // Only auto-set to Partial if the current status isn't already
          // something stricter (don't downgrade a Paid fee to Partial
          // because of a typo in a follow-up PATCH)
          if (existing.status === 'Pending' || existing.status === 'Overdue') {
            updates.status = 'Partial';
          }
        }
      }
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_fees')
      .update(updates)
      .eq('id', id)
      .select('*, student:student_profiles!student_id (id, first_name, last_name, email), application:student_applications!application_id (id, application_number, university_slug, program_slug)')
      .single();

    if (error) {
      console.error('[admin/fees/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
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
    // Prefer cancel over delete to preserve audit
    const { data, error } = await service
      .from('student_fees')
      .update({ status: 'Cancelled' })
      .eq('id', id)
      .select('id, status')
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    // DELETE returns the soft-cancelled row, not the original — clients
    // re-fetch if they need the full mapped shape.
    return NextResponse.json({ success: true, fee: { id: data.id, status: data.status } });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
