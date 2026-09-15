import { NextResponse } from 'next/server';
import { getRequestAuth } from '@/lib/supabase-auth';
import { isAllowedMimeType } from '@/lib/storage-validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { isApplicationOwnedBy } from '@/lib/student-document-validation';

// Phase 78: per-user rate limit on row finalization. Caps spam of
// student_documents inserts (each insert creates a storage object
// reference and a review-queue row). Same sliding-window primitive
// as the upload-url endpoint. 30 row creations / 15 min.
const FINALIZE_RATE_MAX = 30;
const FINALIZE_RATE_WINDOW_MS = 15 * 60 * 1000;

export const dynamic = 'force-dynamic';

/**
 * GET /api/student/documents
 *
 * List the calling student's uploaded documents. RLS already scopes by
 * student_id = auth.uid().
 */
export async function GET(request: Request) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    const { data: documents, error } = await supabase
      .from('student_documents')
      .select('*')
      .eq('student_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: documents });
  } catch (error) {
    console.error('[Student Documents GET]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/student/documents
 *
 * Create a new student_documents row AFTER the file has been uploaded
 * to Storage via a signed URL. Body (camelCase):
 *
 *   - documentTypeId  (required) — e.g. "passport-copy"
 *   - name            (required) — human display name
 *   - nameCn?         (optional)
 *   - category        (required) — Identity | Academic | Language |
 *                                  Financial | Recommendation | Other
 *   - fileUrl         (required) — storage path returned by upload-url
 *   - fileName        (required) — original filename
 *   - fileType        (required) — MIME
 *   - fileSize?       (optional) — bytes
 *   - applicationId?  (optional) — link to a specific application
 *   - notes?          (optional)
 *
 * Server derives: student_id = auth.uid(), status = 'Pending', uploaded_at = NOW.
 *
 * The pre-allocated documentId from /upload-url is accepted but not
 * strictly required (a fresh UUID is generated if missing).
 */
export async function POST(request: Request) {
  try {
    const auth = await getRequestAuth(request);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    const { supabase, user } = auth;

    // Per-user rate limit on row finalization.
    const rl = checkRateLimit({
      action: 'student-doc-finalize',
      key: auth.user.id,
      max: FINALIZE_RATE_MAX,
      windowMs: FINALIZE_RATE_WINDOW_MS,
    });
    if (!rl.ok) {
      return NextResponse.json(
        {
          error: `Too many document uploads. Try again in ${rl.retryAfterSec} seconds.`,
          code: 'RATE_LIMITED',
          retryAfterSec: rl.retryAfterSec,
        },
        {
          status: 429,
          headers: { 'Retry-After': String(rl.retryAfterSec) },
        },
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Required fields
    const documentTypeId = body.documentTypeId;
    const name = body.name;
    const category = body.category;
    const fileUrl = body.fileUrl;
    const fileName = body.fileName;
    const fileType = body.fileType;

    if (typeof documentTypeId !== 'string' || !documentTypeId.trim()) {
      return NextResponse.json({ error: 'documentTypeId is required' }, { status: 400 });
    }
    if (typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const allowedCategories = [
      'Identity',
      'Academic',
      'Language',
      'Financial',
      'Recommendation',
      'Other',
    ] as const;
    if (
      typeof category !== 'string' ||
      !(allowedCategories as readonly string[]).includes(category)
    ) {
      return NextResponse.json(
        {
          error: `category must be one of: ${allowedCategories.join(' | ')}`,
        },
        { status: 400 },
      );
    }
    if (typeof fileUrl !== 'string' || !fileUrl.trim()) {
      return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 });
    }
    if (fileUrl.includes('..')) {
      return NextResponse.json(
        { error: 'fileUrl must not contain path traversal (..)' },
        { status: 400 },
      );
    }
    if (typeof fileName !== 'string' || !fileName.trim()) {
      return NextResponse.json({ error: 'fileName is required' }, { status: 400 });
    }
    if (!isAllowedMimeType(fileType)) {
      return NextResponse.json(
        { error: `fileType must be one of the allowed MIME types (got: ${String(fileType)})` },
        { status: 400 },
      );
    }
    if (body.fileSize !== undefined) {
      if (typeof body.fileSize !== 'number' || isNaN(body.fileSize) || body.fileSize < 0) {
        return NextResponse.json(
          { error: 'fileSize must be a non-negative number' },
          { status: 400 },
        );
      }
    }

    // Build the row. Only snake_case fields that exist on the table.
    const row: Record<string, unknown> = {
      student_id: user.id,
      document_type_id: documentTypeId,
      name: name.trim(),
      category,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      status: 'Pending',
    };
    if (typeof body.nameCn === 'string' && body.nameCn.trim()) {
      row.name_cn = body.nameCn.trim();
    }
    if (typeof body.fileSize === 'number') {
      row.file_size = body.fileSize;
    }
    // Phase 96: applicationId linkage is ownership-checked — previously
    // any 36-hex string was accepted, so a student could attach their
    // documents to ANOTHER student's application (whose detail view
    // fetches documents by application_id). 404, not 403 — don't leak
    // other applications' existence.
    let applicationIdValue: string | null = null;
    if (body.applicationId !== undefined && body.applicationId !== null) {
      if (typeof body.applicationId !== 'string') {
        return NextResponse.json({ error: 'applicationId must be a string' }, { status: 400 });
      }
      if (!(await isApplicationOwnedBy(supabase, body.applicationId, user.id))) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      applicationIdValue = body.applicationId;
    }
    if (typeof body.notes === 'string' && body.notes.trim()) {
      row.notes = body.notes.trim();
    }
    if (applicationIdValue) {
      row.application_id = applicationIdValue;
    }
    if (typeof body.id === 'string' && body.id.match(/^[0-9a-f-]{36}$/i)) {
      // Allow client to reuse the pre-allocated documentId from upload-url
      row.id = body.id;
    }

    const { data: document, error } = await supabase
      .from('student_documents')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('[Student Documents POST] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    console.error('[Student Documents POST] unhandled:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
