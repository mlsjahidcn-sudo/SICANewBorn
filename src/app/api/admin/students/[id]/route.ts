import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { mapStudentFromDb, mapStudentToDb } from '@/lib/student-mapper';
import { sendStudentSuspended } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { deleteStudentDocFile } from '@/lib/storage';

/**
 * GET /api/admin/students/[id]
 * Returns a single student with the AdminStudent shape.
 *
 * PATCH /api/admin/students/[id]
 * Updates a student. Body is a partial AdminStudent; the mapper
 * splits it into fixed-column updates + `extra` JSONB updates.
 *
 * DELETE /api/admin/students/[id]
 * Two actions (selected via the optional request body):
 *   - { action: 'suspend' } (default, back-compat for callers that
 *     send no body) — soft-delete: sets status='Suspended' and
 *     sends the suspension email. The row is preserved for audit.
 *   - { action: 'delete', confirmEmail } — hard delete: cascade
 *     clear partner FKs, best-effort storage cleanup, then
 *     `auth.admin.deleteUser(id)` which cascades through the
 *     `student_profiles.id → auth.users.id` FK to all child tables
 *     (student_applications, student_documents, student_notes,
 *     student_notifications, student_assessments, chat_leads, …).
 *     Requires `confirmEmail` to match the student's email
 *     (case-insensitive, trimmed) — defense against fat-finger.
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
// DELETE single student (suspend + hard delete variants)
// ---------------------------------------------------------------------------
interface DeleteBody {
  action?: 'suspend' | 'delete';
  confirmEmail?: string;
}

async function readDeleteBody(request: NextRequest): Promise<DeleteBody | null> {
  // Empty body / no body / non-JSON body → treat as legacy suspend call.
  const raw = request.headers.get('content-length');
  if (!raw || raw === '0') return {};
  try {
    const body = (await request.json()) as unknown;
    if (!body || typeof body !== 'object') return {};
    return body as DeleteBody;
  } catch {
    return {};
  }
}

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

  // Rate limit: 30 hits per 15 min per admin. Same ceiling the student
  // doc-delete routes use (Phase 78). The bucket key is shared between
  // suspend + hard delete — both are destructive enough that 30/min is
  // generous for legit use but blocks fat-finger loops.
  const rl = checkRateLimit({
    action: 'admin-student-delete',
    key: auth.user.id,
    max: 30,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': String(rl.retryAfterSec) },
      },
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing student id' }, { status: 400 });
  }

  const body = (await readDeleteBody(request)) ?? {};
  const action = body.action ?? 'suspend';

  if (action === 'delete') {
    return hardDeleteStudent(request, id, body);
  }

  return suspendStudent(id, auth.user);
}

async function suspendStudent(
  id: string,
  adminUser: { id: string; email?: string | null; user_metadata?: Record<string, unknown> | null },
) {
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
      console.error('[admin/students/:id DELETE:suspend] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fire-and-forget suspension email.
    if (data.email) {
      void sendStudentSuspended({
        firstName: data.first_name || 'Student',
        email: data.email,
        suspendedByAdmin:
          (adminUser.user_metadata?.full_name as string | undefined) ||
          adminUser.email ||
          'SICA Admin',
        suspendedAt: new Date(data.updated_at).toLocaleString(),
      }).catch((err) => console.error('[sendStudentSuspended] failed:', err));
    }

    return NextResponse.json({
      ok: true,
      action: 'suspended',
      id: data.id,
      status: data.status,
      deletedAt: data.updated_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/:id DELETE:suspend] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function hardDeleteStudent(
  _request: NextRequest,
  id: string,
  body: DeleteBody,
) {
  try {
    const service = buildServiceClient();

    // 1. Confirm the student exists + grab the email. Doing this first
    //    means a bogus id 404s cleanly without a half-applied cascade.
    const { data: student, error: fetchErr } = await service
      .from('student_profiles')
      .select('id, email, first_name, last_name')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr) {
      console.error('[admin/students/:id DELETE:delete] fetch error:', fetchErr);
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // 2. Refuse unless confirmEmail matches (case-insensitive, trimmed).
    if (!body.confirmEmail || typeof body.confirmEmail !== 'string') {
      return NextResponse.json(
        { error: 'confirmEmail is required for hard delete' },
        { status: 400 },
      );
    }
    const expected = (student.email ?? '').trim().toLowerCase();
    const provided = body.confirmEmail.trim().toLowerCase();
    if (!expected || expected !== provided) {
      return NextResponse.json(
        { error: 'confirmEmail does not match the student email' },
        { status: 400 },
      );
    }

    // 3. Explicit clear of partner FKs (Phase 61 trigger would
    //    propagate a new value, but being explicit avoids any race
    //    where the trigger runs before the cascading delete).
    const { error: paErr } = await service
      .from('partner_applications')
      .update({ linked_student_profile_id: null })
      .eq('linked_student_profile_id', id);
    if (paErr) {
      console.error('[admin/students/:id DELETE:delete] partner_applications clear error:', paErr);
      // Continue — not fatal, FKs will become dangling on the next step.
    }
    const { error: psErr } = await service
      .from('partner_students')
      .update({ linked_student_profile_id: null })
      .eq('linked_student_profile_id', id);
    if (psErr) {
      console.error('[admin/students/:id DELETE:delete] partner_students clear error:', psErr);
    }

    // 4. Best-effort storage cleanup. Read every file_url for this
    //    student, then remove each from the bucket. Failures are
      //    logged but don't block the cascade — orphan files can be
      //    cleaned up later by ops; we don't want to keep a DB row
      //    alive just because a storage object is stuck.
    const { data: docs, error: docsErr } = await service
      .from('student_documents')
      .select('id, file_url')
      .eq('student_id', id);
    if (docsErr) {
      console.error('[admin/students/:id DELETE:delete] docs read error:', docsErr);
    } else if (docs && docs.length > 0) {
      await Promise.all(
        docs.map(async (doc) => {
          if (!doc.file_url) return;
          try {
            const ok = await deleteStudentDocFile(doc.file_url);
            if (!ok) {
              console.warn(
                `[admin/students/:id DELETE:delete] deleteStudentDocFile returned false for doc ${doc.id} (${doc.file_url})`,
              );
            }
          } catch (err) {
            console.error(
              `[admin/students/:id DELETE:delete] storage remove failed for doc ${doc.id}:`,
              err,
            );
          }
        }),
      );
    }

    // 5. Cascade delete. `student_profiles.id REFERENCES auth.users(id)`
    //    ON DELETE CASCADE means deleting the auth.users row nukes the
    //    profile + every table that FKs into it (student_applications,
    //    student_documents, student_notes, student_notifications,
    //    student_assessments, chat_leads, etc.).
    const { error: delErr } = await service.auth.admin.deleteUser(id);
    if (delErr) {
      console.error('[admin/students/:id DELETE:delete] deleteUser error:', delErr);
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: 'deleted', id });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/students/:id DELETE:delete] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
