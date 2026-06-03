import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { insertTimelineEvent } from '@/lib/timeline';
import { mapApplicationFromDb } from '@/lib/application-mapper';

const ALLOWED_STATUSES = [
  'Draft', 'Submitted', 'Under Review', 'Documents Requested',
  'Decision Made', 'Accepted', 'Rejected', 'Withdrawn',
] as const;

/**
 * GET    /api/admin/applications/[id]
 * PATCH  /api/admin/applications/[id]  — update status, notes, etc.
 * DELETE /api/admin/applications/[id]  — cancel (status='Withdrawn')
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
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_applications')
      .select('*, student:student_profiles!student_id (id, first_name, last_name, email, source, status)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    // Normalize to the same shape the list endpoint returns
    return NextResponse.json({ application: mapApplicationFromDb(data) });
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
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    const body = await request.json();
    // Block immutable fields
    const updates: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (['id', 'student_id', 'application_number', 'created_at'].includes(k)) continue;
      updates[k] = v;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields' }, { status: 400 });
    }
    // Validate status if provided (S12.2)
    let statusChanged = false;
    let newStatus: string | null = null;
    if (typeof updates.status === 'string') {
      if (!(ALLOWED_STATUSES as readonly string[]).includes(updates.status)) {
        return NextResponse.json(
          { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
          { status: 400 },
        );
      }
      statusChanged = true;
      newStatus = updates.status;
      updates.reviewed_at = new Date().toISOString();
    }

    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_applications')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Audit trail: write a timeline event for the status change
    if (statusChanged && newStatus) {
      await insertTimelineEvent(service, {
        application_id: id,
        status: newStatus,
        notes: body.notes || `Status changed to ${newStatus} by admin.`,
        created_by: auth.user.id,
      });
    }

    return NextResponse.json({ application: data });
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
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  try {
    // "Cancel" via status='Withdrawn' — preserves the row for audit.
    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_applications')
      .update({ status: 'Withdrawn', reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, status, reviewed_at')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, application: data });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
