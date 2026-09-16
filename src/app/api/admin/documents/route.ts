import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  parseStudentDocCategory,
  STUDENT_DOC_CATEGORIES,
} from '@/lib/admin-document-categories';
import {
  validateFileType,
  validateFileSize,
  validateFileName,
} from '@/lib/storage-validation';

/**
 * Phase 2: GET /api/admin/documents
 *
 * Admin review queue for student-uploaded documents. The
 * `student_documents` table has `status`, `verified_at`,
 * `verified_by`, `rejection_reason` columns but no UI path
 * to actually flip them — the only writer is the student's
 * own PATCH. This endpoint is the admin's read view of the
 * queue.
 *
 * Filters (all optional, all AND-combined):
 *   - status  : 'Pending' | 'Verified' | 'Rejected'
 *               (default: 'Pending' — the active review queue)
 *   - search  : free-text on document name (case-insensitive)
 *   - studentId : exact UUID match
 *   - applicationId : exact UUID match
 *   - sort    : uploaded_at | name | status | category (default uploaded_at)
 *   - order   : asc | desc (default desc — newest first)
 *   - page, limit : 1-indexed pagination (default 1, 20; max 100)
 *
 * Each row is joined with the student profile (first_name, last_name,
 * email) AND the partner student row (student_name, student_email)
 * so the list can render the uploader's name without a second
 * roundtrip — student-uploaded docs get `student`, partner-uploaded
 * docs get `partnerStudent` (admin sees both, the UI picks the
 * non-null one). Auth: requireAdmin — student/partner get 403.
 *
 * Response: { documents, total, page, limit, totalPages }
 */
const ALLOWED_STATUSES = ['Pending', 'Verified', 'Rejected'] as const;
type AdminDocStatus = (typeof ALLOWED_STATUSES)[number];
const ALLOWED_SORTS = ['uploaded_at', 'name', 'status', 'category'] as const;

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { searchParams } = new URL(request.url);
    const statusRaw = searchParams.get('status');
    const status: AdminDocStatus | null =
      statusRaw && (ALLOWED_STATUSES as readonly string[]).includes(statusRaw)
        ? (statusRaw as AdminDocStatus)
        : null;
    const search = searchParams.get('search')?.trim() || '';
    const studentId = searchParams.get('studentId') || '';
    const applicationId = searchParams.get('applicationId') || '';
    const sortRaw = searchParams.get('sort') || 'uploaded_at';
    const sort = (ALLOWED_SORTS as readonly string[]).includes(sortRaw) ? sortRaw : 'uploaded_at';
    const ascending = (searchParams.get('order') || 'desc') === 'asc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const service = buildServiceClient();
    let query = service
      .from('student_documents')
      .select(
        `
          *,
          student:student_profiles!student_id (id, first_name, last_name, email),
          partnerStudent:partner_students!partner_student_id (id, student_name, student_email)
        `,
        { count: 'exact' },
      )
      .order(sort, { ascending });

    if (status) query = query.eq('status', status);
    if (studentId) query = query.eq('student_id', studentId);
    if (applicationId) query = query.eq('application_id', applicationId);
    if (search) {
      // Escape LIKE special chars so partner-typed % doesn't open a hole
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.ilike('name', `%${safe}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('[admin/documents GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      documents: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/documents GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Phase 109 Batch 1: POST /api/admin/documents
 *
 * Second step of the 2-step admin upload flow. Called after the
 * admin has PUT the file bytes to the signed URL returned by
 * /api/admin/documents/upload-url.
 *
 * Body (camelCase):
 *   - studentId     (required) — student this doc belongs to. Must
 *                                exist in student_profiles.
 *   - applicationId? (optional) — link the new doc to an application
 *                                  at create time (used by the wizard).
 *                                  Must belong to the same studentId.
 *   - name          (required) — human display name
 *   - nameCn?       (optional)
 *   - category      (required) — must be one of STUDENT_DOC_CATEGORIES
 *   - fileUrl       (required) — storage path from /upload-url. Must
 *                                start with `student/{studentId}/`
 *                                (defense in depth — the storage path
 *                                convention is enforced by
 *                                createStudentDocUploadUrl but we
 *                                re-check here in case the client
 *                                tampered).
 *   - fileName      (required)
 *   - fileType      (required) — MIME
 *   - fileSize      (required) — bytes
 *   - notes?        (optional)
 *
 * Server stamps: `status='Pending'`, `uploaded_at=NOW()`,
 * `partner_student_id=NULL`,` `partner_application_id=NULL` (admin
 * docs are scoped to student_profiles, not partner_students).
 *
 * Cross-tenant guard: studentId must be a real student_profiles row.
 * Application ownership: if applicationId is set, the application
 * must belong to the same studentId (else 400).
 *
 * Best-effort cleanup: if the DB insert fails AFTER the file was
 * uploaded to Storage, delete the storage object so the admin isn't
 * haunted by an orphan file (mirrors the partner POST pattern).
 *
 * Response: { document }
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
    const applicationIdRaw =
      typeof body.applicationId === 'string' ? body.applicationId.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const nameCn = typeof body.nameCn === 'string' ? body.nameCn.trim() || null : null;
    const categoryRaw = typeof body.category === 'string' ? body.category : '';
    const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl : '';
    const fileName = body.fileName;
    const fileType = body.fileType;
    const fileSize = body.fileSize;
    const notes = typeof body.notes === 'string' ? body.notes.trim() || null : null;

    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const category = parseStudentDocCategory(categoryRaw);
    if (!category) {
      return NextResponse.json(
        { error: `category must be one of: ${STUDENT_DOC_CATEGORIES.join(' | ')}` },
        { status: 400 },
      );
    }
    if (!fileUrl) {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 });
    }
    if (fileUrl.includes('..')) {
      return NextResponse.json(
        { error: 'fileUrl must not contain path traversal (..)' },
        { status: 400 },
      );
    }
    // Defense in depth: fileUrl must sit under this student's
    // namespace. The storage helper's namespace is
    // `student/{studentId}/...` (mirrors the partner-side
    // `partner/{partnerId}/...` convention).
    const expectedPrefix = `student/${studentId}/`;
    if (!fileUrl.startsWith(expectedPrefix)) {
      return NextResponse.json(
        {
          error: `fileUrl must start with '${expectedPrefix}' (got: ${fileUrl.slice(0, 80)})`,
        },
        { status: 400 },
      );
    }

    // Reuse the existing file validators — defense against a client
    // submitting a malicious /upload-url response with content-type
    // or size that doesn't match the bucket's allowed_mime_types /
    // max bytes. The wizard's flow will always satisfy these (the
    // client validated them too before calling /upload-url) but the
    // server is the only authority that matters.
    for (const [val, fn, label] of [
      [fileName, validateFileName, 'fileName'],
      [fileType, validateFileType, 'fileType'],
      [fileSize, validateFileSize, 'fileSize'],
    ] as const) {
      const r = fn(val);
      if (!r.ok) {
        return NextResponse.json({ error: `${label}: ${r.error}` }, { status: 400 });
      }
    }

    const service = buildServiceClient();

    // Cross-tenant guard (1/2): studentId must exist in student_profiles.
    // Phase 109: admins are global — they can upload against any
    // student. But we still verify the FK target exists so the
    // INSERT below doesn't fail with a generic "foreign key
    // violation" when the client typo'd a UUID.
    const { data: studentRow, error: studentErr } = await service
      .from('student_profiles')
      .select('id')
      .eq('id', studentId)
      .maybeSingle();
    if (studentErr) {
      return NextResponse.json({ error: studentErr.message }, { status: 500 });
    }
    if (!studentRow) {
      return NextResponse.json(
        { error: 'studentId not found in student_profiles' },
        { status: 400 },
      );
    }

    // Cross-tenant guard (2/2): if applicationId is set, it must
    // belong to the same student. Closes the "upload a doc against
    // student A's row but link it to student B's application"
    // attacker scenario.
    if (applicationIdRaw) {
      const { data: appRow, error: appErr } = await service
        .from('student_applications')
        .select('id, student_id')
        .eq('id', applicationIdRaw)
        .maybeSingle();
      if (appErr) {
        return NextResponse.json({ error: appErr.message }, { status: 500 });
      }
      if (!appRow) {
        return NextResponse.json(
          { error: 'applicationId not found' },
          { status: 400 },
        );
      }
      if ((appRow as { student_id?: string | null }).student_id !== studentId) {
        return NextResponse.json(
          { error: 'applicationId does not belong to the selected student' },
          { status: 400 },
        );
      }
    }

    const dbRow: Record<string, unknown> = {
      student_id: studentId,
      application_id: applicationIdRaw || null,
      name,
      name_cn: nameCn,
      category,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      notes,
      status: 'Pending',
      partner_student_id: null,
      partner_application_id: null,
      verified_at: null,
      verified_by: null,
      rejection_reason: null,
    };

    const { data, error } = await service
      .from('student_documents')
      .insert(dbRow)
      .select(
        `
          *,
          student:student_profiles!student_id (id, first_name, last_name, email)
        `,
      )
      .single();

    if (error) {
      console.error('[admin/documents POST] supabase error:', error);
      // Best-effort cleanup: the file was already PUT to Storage but
      // the row insert failed. Delete the orphan so the bucket
      // isn't billed for / haunted by a file with no DB reference.
      // The same defense the partner POST uses.
      try {
        const { deleteStudentDocFile } = await import('@/lib/storage');
        if (fileUrl.startsWith(expectedPrefix)) {
          await deleteStudentDocFile(fileUrl);
        }
      } catch (cleanupErr) {
        console.error('[admin/documents POST] cleanup failed:', cleanupErr);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ document: data }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/documents POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
