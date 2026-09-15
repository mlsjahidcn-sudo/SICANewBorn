import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/supabase-auth';
import { deleteStudentDocFile } from '@/lib/storage';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  pickStudentEditableDocumentUpdates,
  isApplicationOwnedBy,
} from '@/lib/student-document-validation';

// Phase 78: per-user rate limit on DELETE. 30 deletes / 15 min.
const DELETE_RATE_MAX = 30;
const DELETE_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const { data: document, error } = await supabase
      .from('student_documents')
      .select('*')
      .eq('id', params.id)
      .eq('student_id', user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('[Student Document GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Phase 96: strict field allow-list. The old code spread ...rest
    // into the UPDATE (after stripping only id/created_at/uploaded_at/
    // verified_at), so a student could PATCH { "status": "Verified",
    // "verified_by": "<uuid>" } on their own row and self-verify.
    // Students may edit content fields only — never the review fields.
    const updates = pickStudentEditableDocumentUpdates(body);

    // Application (re)linkage goes through the camelCase wrapper and is
    // ownership-checked. Explicit null unlinks the doc. The snake_case
    // `application_id` key is NOT in the allow-list, so this wrapper is
    // the only path that can set it.
    if (body.applicationId !== undefined) {
      const applicationId = body.applicationId;
      if (applicationId === null) {
        updates.application_id = null;
      } else if (typeof applicationId === 'string') {
        // Phase 96: ownership — previously any UUID was accepted, so a
        // student could attach their documents to ANOTHER student's
        // application (whose detail view fetches documents by
        // application_id). 404, not 403 — don't leak other
        // applications' existence.
        if (!(await isApplicationOwnedBy(supabase, applicationId, user.id))) {
          return NextResponse.json({ error: 'Application not found' }, { status: 404 });
        }
        updates.application_id = applicationId;
      } else {
        return NextResponse.json(
          { error: 'applicationId must be a string or null' },
          { status: 400 },
        );
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
    }

    const { data: document, error } = await supabase
      .from('student_documents')
      .update(updates)
      .eq('id', params.id)
      .eq('student_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: document });
  } catch (error) {
    console.error('[Student Document PUT]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const params = await context.params;
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    // Per-user rate limit on DELETE.
    const rl = checkRateLimit({
      action: 'student-doc-delete',
      key: auth.user.id,
      max: DELETE_RATE_MAX,
      windowMs: DELETE_RATE_WINDOW_MS,
    });
    if (!rl.ok) {
      return NextResponse.json(
        {
          error: `Too many delete requests. Try again in ${rl.retryAfterSec} seconds.`,
          code: 'RATE_LIMITED',
          retryAfterSec: rl.retryAfterSec,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfterSec) },
        },
      );
    }

    // Phase 78: fetch the row first so we can clean up the storage
    // object after the DB delete. Without this, the file_url in
    // Supabase Storage orphaned over time (the storage object was
    // never reachable again — the row that pointed to it was gone).
    const { data: row, error: fetchErr } = await supabase
      .from('student_documents')
      .select('file_url')
      .eq('id', params.id)
      .eq('student_id', user.id)
      .single();

    if (fetchErr || !row) {
      // Either the row doesn't exist or it isn't the student's.
      // Return 404 in both cases — don't leak existence.
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const { error } = await supabase
      .from('student_documents')
      .delete()
      .eq('id', params.id)
      .eq('student_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Best-effort storage cleanup. If this fails the row is already
    // gone so the admin review queue won't surface a dangling
    // reference — the file just orphans in Storage. Logged for
    // ops to clean up via the dashboard if the bucket fills up.
    if (row.file_url) {
      const cleaned = await deleteStudentDocFile(row.file_url);
      if (!cleaned) {
        console.warn(
          `[Student Document DELETE] DB row ${params.id} deleted but storage object ${row.file_url} not removed`,
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Student Document DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
