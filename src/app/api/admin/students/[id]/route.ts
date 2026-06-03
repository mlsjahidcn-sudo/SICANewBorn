import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapStudentFromDb, mapStudentToDb } from '@/lib/student-mapper';
import { sendStudentSuspended } from '@/lib/email';

/**
 * GET /api/admin/students/[id]
 * Returns a single student with the AdminStudent shape.
 *
 * PATCH /api/admin/students/[id]
 * Updates a student. Body is a partial AdminStudent; the mapper
 * splits it into fixed-column updates + `extra` JSONB updates.
 *
 * DELETE /api/admin/students/[id]
 * Soft-delete: sets status='Suspended'. Preserves the row for audit.
 * Hard delete (cascade) is NOT exposed via API — go via the Supabase
 * dashboard if you really need to nuke a row.
 *
 * Auth: any admin (requireAdmin). Service-role client for all reads
 * and writes.
 */

type RouteContext = { params: Promise<{ id: string }> };

// ---------------------------------------------------------------------------
// GET single student
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  }

  try {
    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[admin/students/:id GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student: mapStudentFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH single student
// ---------------------------------------------------------------------------
export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const { dbRow, extraUpdates } = mapStudentToDb(body);

    // If the caller passed any `extra` fields, merge them into the
    // JSONB column. We do this server-side because the mapper doesn't
    // know how to do JSONB || merge — it just gives us the deltas.
    if (Object.keys(extraUpdates).length > 0) {
      dbRow.extra = extraUpdates;
    }

    // Block attempts to change immutable fields. id is in the URL
    // (the row's PK), so we never want it in the body. user_id is
    // only set at create time and equals id. created_at is set by
    // the DB.
    delete dbRow.id;
    delete dbRow.user_id;
    delete dbRow.created_at;

    if (Object.keys(dbRow).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const service = buildServiceClient();

    // If we have `extra` updates, we need a TWO-STEP update: first the
    // JSONB merge (so we don't overwrite existing extra fields), then
    // the fixed-column update. We do JSONB merge via RPC if the
    // helper exists, otherwise we read-then-merge.
    if (dbRow.extra !== undefined) {
      const extraDelta = dbRow.extra as Record<string, unknown>;
      delete dbRow.extra;
      // Read current extra
      const { data: current, error: readErr } = await service
        .from('student_profiles')
        .select('extra')
        .eq('id', id)
        .maybeSingle();
      if (readErr) {
        return NextResponse.json({ error: readErr.message }, { status: 500 });
      }
      const merged = { ...((current?.extra as object) || {}), ...extraDelta };
      dbRow.extra = merged;
    }

    const { data, error } = await service
      .from('student_profiles')
      .update(dbRow)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[admin/students/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ student: mapStudentFromDb(data) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE single student (soft-delete)
// ---------------------------------------------------------------------------
export async function DELETE(request: NextRequest, context: RouteContext) {
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

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  }

  try {
    const service = buildServiceClient();

    // Soft delete: flip status to 'Suspended'. Preserve the row for
    // audit. The unique index on auth.users is unaffected.
    const { data, error } = await service
      .from('student_profiles')
      .update({ status: 'Suspended' })
      .eq('id', id)
      .select('id, status, updated_at, first_name, last_name, email')
      .single();

    if (error) {
      console.error('[admin/students/:id DELETE] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fire-and-forget suspension email. We re-read the student above
    // to get the email; the welcome path doesn't need this because
    // the admin provides the email in the request body.
    if (data.email) {
      /* eslint-disable-next-line @typescript-eslint/no-floating-promises */
      void sendStudentSuspended({
        firstName: data.first_name || 'Student',
        email: data.email,
        suspendedByAdmin:
          (auth.user.user_metadata?.full_name as string | undefined) ||
          auth.user.email ||
          'SICA Admin',
        suspendedAt: new Date(data.updated_at).toLocaleString(),
      }).catch((err) => console.error('[sendStudentSuspended] failed:', err));
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      status: data.status,
      deletedAt: data.updated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
