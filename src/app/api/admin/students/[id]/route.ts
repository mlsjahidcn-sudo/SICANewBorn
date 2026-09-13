import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  mapStudentFromDb,
  mapStudentToDb,
  parseStatus,
  parseSource,
} from '@/lib/student-mapper';
import { sendStudentSuspended } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';
import { deleteStudentDocFile } from '@/lib/storage';
import {
  decideStudentDelete,
  parseDeleteBody,
  type StudentRow,
} from '@/lib/admin-student-delete';

/**
 * GET /api/admin/students/[id]
 * Returns a single student with the AdminStudent shape.
 *
 * PATCH /api/admin/students/[id]
 * Updates a student. Body is a partial AdminStudent; the mapper
 * splits it into fixed-column updates + `extra` JSONB updates.
 * Status + source are validated against the closed enum allow-list.
 *
 * DELETE /api/admin/students/[id]
 * Two actions (selected via the optional request body):
 *   - { action: 'suspend' } (default, back-compat for callers that
 *     send no body) — soft-delete: sets status='Suspended' and
 *     sends the suspension email. The row is preserved for audit.
 *   - { action: 'delete', confirmEmail } — hard delete: cascade
 *     clear partner FKs + linked student_documents, best-effort
 *     storage cleanup, then `auth.admin.deleteUser(id)` which
 *     cascades through `student_profiles.id → auth.users.id` FK
 *     to all child tables (student_applications, student_documents,
 *     student_notes, student_notifications, student_assessments,
 *     chat_leads, …). Requires `confirmEmail` to match the
 *     student's email (case-insensitive, trimmed) — defense
 *     against fat-finger.
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
    const body = (await request.json()) as Record<string, unknown>;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // C3: closed-taxonomy validation. Without this, an admin (or
    // a misbehaving UI) can write { status: 'Banned' } and corrupt
    // the row — the DB has no CHECK on status/source.
    if (body.status !== undefined) {
      const parsed = parseStatus(body.status);
      if (!parsed) {
        return NextResponse.json(
          { error: 'status must be one of: Active, Inactive, Pending, Suspended' },
          { status: 400 },
        );
      }
      body.status = parsed;
    }
    if (body.source !== undefined) {
      const parsed = parseSource(body.source);
      if (!parsed) {
        return NextResponse.json(
          { error: 'source must be one of: Admin, Partner, Online' },
          { status: 400 },
        );
      }
      body.source = parsed;
    }

    const { dbRow, extraUpdates } = mapStudentToDb(body);

    // H1: track whether we have ANYTHING to write (fixed columns or
    // extra JSONB). The old code checked only dbRow and 400ed on
    // extra-only payloads — silent regression when a caller PATCHes
    // only JSONB fields like { gender: 'Male' }.
    const hasExtra = Object.keys(extraUpdates).length > 0;
    const hasFixed = Object.keys(dbRow).length > 0;
    if (!hasExtra && !hasFixed) {
      return NextResponse.json(
        { error: 'No updatable fields provided' },
        { status: 400 },
      );
    }

    // If we have extra updates, merge them into the dbRow's `extra`
    // column. We do this server-side because the mapper doesn't know
    // how to do JSONB || merge — it just gives us the deltas.
    let extraDelta: Record<string, unknown> | undefined;
    if (hasExtra) {
      extraDelta = extraUpdates;
    }

    // Strip the deprecated delete calls — the mapper never sets these
    // keys (N1). Defensive: refuse attempts to write them.
    delete dbRow.id;
    delete dbRow.user_id;
    delete dbRow.created_at;

    const service = buildServiceClient();

    // JSONB merge: read current extra, merge in JS, write back. (Race:
    // a concurrent PATCH to a different extra field is lost — see the
    // audit M9. Low priority at SICA's admin scale.)
    if (extraDelta !== undefined) {
      const { data: current, error: readErr } = await service
        .from('student_profiles')
        .select('extra')
        .eq('id', id)
        .maybeSingle();
      if (readErr) {
        return NextResponse.json({ error: readErr.message }, { status: 500 });
      }
      dbRow.extra = {
        ...((current?.extra as object) || {}),
        ...extraDelta,
      };
    }

    if (Object.keys(dbRow).length === 0) {
      // Edge case: only extra updates — dbRow.extra is set above but
      // the fixed-column keys are empty. Don't write an empty UPDATE.
      // (The mapStudentToDb split ensures dbRow has only fixed-col keys.)
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
//
// The decision logic lives in src/lib/admin-student-delete.ts
// (decideStudentDelete + parseDeleteBody). The 11-case vitest suite
// in src/lib/__tests__/admin-student-delete.test.ts exercises it —
// keeping the decision in one place means a future fix to the
// error messages or the confirmEmail check reaches both the route
// and the tests.

async function readDeleteBodyRaw(request: NextRequest): Promise<unknown> {
  // Empty body / no body → treat as the legacy suspend call. With
  // a non-empty body, propagate JSON parse errors as 400 (instead
  // of silently treating them as 'suspend' — see audit M14).
  const raw = request.headers.get('content-length');
  if (!raw || raw === '0') return null;
  return await request.json();
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

  // Read + parse the body. On JSON parse errors (corrupted payload
  // with non-zero content-length), return 400 instead of silently
  // treating as 'suspend' — audit M14.
  let rawBody: unknown;
  try {
    rawBody = await readDeleteBodyRaw(request);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const body = parseDeleteBody(rawBody);

  // Load the student row once. We need the email for the confirmEmail
  // check + the row's existence for 404. Doing it here lets the
  // decision helper operate on a clean StudentRow shape.
  const service = buildServiceClient();
  const { data: student, error: fetchErr } = await service
    .from('student_profiles')
    .select('id, email, first_name, last_name')
    .eq('id', id)
    .maybeSingle();
  if (fetchErr) {
    console.error('[admin/students/:id DELETE] fetch error:', fetchErr);
    return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  }

  // For hard-delete we need the email. If student_profiles.email is
  // empty (orphan auth.users — see audit H5), fall back to auth.users.
  // The decision helper then runs the confirmEmail check against
  // whichever email we found.
  let studentForDecision: StudentRow | null = student;
  if (!studentForDecision && body?.action === 'delete') {
    const { data: authUser } = await service.auth.admin.getUserById(id);
    studentForDecision = { email: authUser?.user?.email ?? '' };
  }
  if (!studentForDecision) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  // Delegate the action decision to the tested helper.
  const decision = decideStudentDelete(body, studentForDecision);
  if (decision.action === 'reject') {
    return NextResponse.json({ error: decision.error }, { status: decision.status });
  }
  if (decision.action === 'suspend') {
    return suspendStudent(id, studentForDecision, auth.user);
  }
  return hardDeleteStudent(service, id, studentForDecision);
}

async function suspendStudent(
  id: string,
  student: StudentRow,
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
  service: ReturnType<typeof buildServiceClient>,
  id: string,
  student: StudentRow,
) {
  try {
    // 1. Explicit clear of partner FKs. Phase A's propagation trigger
    //    (database/2026-08-14_partner_student_link_propagate.sql)
    //    would fan a NULL out, but doing it explicitly avoids the race
    //    where the trigger runs before the cascading delete.
    //
    //    H4: previously swallowed errors here masked real DB problems.
    //    Now we return 500 immediately if any clear fails — better to
    //    surface the cause than to leave dangling FKs that 23503 the
    //    deleteUser call.
    const { error: paErr } = await service
      .from('partner_applications')
      .update({ linked_student_profile_id: null })
      .eq('linked_student_profile_id', id);
    if (paErr) {
      console.error('[admin/students/:id DELETE:delete] partner_applications clear error:', paErr);
      return NextResponse.json({ error: paErr.message }, { status: 500 });
    }
    const { error: psErr } = await service
      .from('partner_students')
      .update({ linked_student_profile_id: null })
      .eq('linked_student_profile_id', id);
    if (psErr) {
      console.error('[admin/students/:id DELETE:delete] partner_students clear error:', psErr);
      return NextResponse.json({ error: psErr.message }, { status: 500 });
    }
    // C1: Phase A + Phase 30 + Phase 61 added a third FK column —
    // `student_documents.linked_student_profile_id` — with default
    // RESTRICT. Without this clear, the auth.admin.deleteUser call
    // 23503s on any partner-linked document row and the admin sees
    // a 500 with no actionable message.
    const { error: sdErr } = await service
      .from('student_documents')
      .update({ linked_student_profile_id: null })
      .eq('linked_student_profile_id', id);
    if (sdErr) {
      console.error('[admin/students/:id DELETE:delete] student_documents clear error:', sdErr);
      return NextResponse.json({ error: sdErr.message }, { status: 500 });
    }

    // 2. Best-effort storage cleanup. Read every file_url for this
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

    // 3. Cascade delete. `student_profiles.id REFERENCES auth.users(id)`
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