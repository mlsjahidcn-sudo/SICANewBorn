import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import {
  mapPartnerDocumentFromDb,
  PARTNER_DOC_CATEGORIES,
  parsePartnerDocCategory,
  parsePartnerDocStatus,
  type PartnerDocCategory,
  type PartnerDocStatus,
  type RawPartnerDocument,
} from '@/lib/partner-doc-mapper';
import {
  validateFileType,
  validateFileSize,
  validateFileName,
} from '@/lib/storage-validation';

export const dynamic = 'force-dynamic';

/**
 * GET /api/partner/documents
 *
 * List the calling partner's documents. RLS scopes the SELECT to
 * `partner_student_id IS NOT NULL AND is_doc_partner_member(...)`
 * (the data-layer migration), so a partner only sees their own rows
 * — no extra WHERE clause needed for ownership.
 *
 * Filters (all optional, all AND-combined):
 *   - partnerStudentId      (UUID) — filter to one student
 *   - partnerApplicationId  (UUID) — filter to one application
 *   - status                ('Pending' | 'Verified' | 'Rejected')
 *   - category              (6 enum values, see PARTNER_DOC_CATEGORIES)
 *   - search                (case-insensitive on name)
 *   - sort                  (uploaded_at | name | status | category, default uploaded_at)
 *   - order                 (asc | desc, default desc)
 *   - page, limit           (default 1, 20; max 100)
 *
 * Joins: a single batched IN() lookup after the main query pulls
 * the partner_student + partner_application rows for the page (no
 * N+1). Uses the service client for the joins — the auth-bound
 * client could do it too but the service client avoids any chance
 * of RLS rejecting the join when the auth JWT is mid-refresh.
 *
 * Response: { documents, total, page, limit, totalPages }
 *
 * Auth: requireTeamMember — owner OR active member (the suspend /
 * active check from Phase 11 blocks suspended members).
 */
const ALLOWED_SORTS = ['uploaded_at', 'name', 'status', 'category'] as const;

export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const partnerStudentId = searchParams.get('partnerStudentId')?.trim() || '';
    const partnerApplicationId = searchParams.get('partnerApplicationId')?.trim() || '';
    const statusRaw = searchParams.get('status')?.trim() || '';
    const status: PartnerDocStatus | null = statusRaw
      ? parsePartnerDocStatus(statusRaw)
      : null;
    const categoryRaw = searchParams.get('category')?.trim() || '';
    const category: PartnerDocCategory | null = categoryRaw
      ? parsePartnerDocCategory(categoryRaw)
      : null;
    const search = searchParams.get('search')?.trim() || '';
    const sortRaw = searchParams.get('sort') || 'uploaded_at';
    const sort = (ALLOWED_SORTS as readonly string[]).includes(sortRaw)
      ? sortRaw
      : 'uploaded_at';
    const ascending = (searchParams.get('order') || 'desc') === 'asc';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    let query = auth.supabase
      .from('student_documents')
      .select(
        `
          *,
          partner_student:partner_students!partner_student_id (id, student_name, student_email),
          partner_application:partner_applications!partner_application_id (id, university, program)
        `,
        { count: 'exact' },
      )
      .not('partner_student_id', 'is', null) // belt-and-suspenders: RLS already enforces
      .order(sort, { ascending });

    if (partnerStudentId) query = query.eq('partner_student_id', partnerStudentId);
    if (partnerApplicationId) query = query.eq('partner_application_id', partnerApplicationId);
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);
    if (search) {
      const safe = search.replace(/[%_]/g, '\\$&');
      query = query.ilike('name', `%${safe}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error('[partner/documents GET] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const documents = (data || []).map((r) => mapPartnerDocumentFromDb(r as RawPartnerDocument));
    return NextResponse.json({
      documents,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/partner/documents
 *
 * Create a partner_documents row AFTER the file has been uploaded
 * to Storage via the partner-side /upload-url route. Body (camelCase):
 *
 *   - partnerStudentId      (required) — must belong to caller's partner_id
 *   - partnerApplicationId? (optional) — if set, must belong to same partner_id
 *   - documentTypeId        (required) — e.g. "passport-copy"
 *   - name                  (required) — human display name
 *   - nameCn?               (optional)
 *   - category              (required) — 6 enum values, see PARTNER_DOC_CATEGORIES
 *   - fileUrl               (required) — storage path from /upload-url
 *   - fileName              (required) — original filename
 *   - fileType              (required) — MIME
 *   - fileSize              (required) — bytes (>=1, <= STUDENT_DOC_MAX_BYTES)
 *   - notes?                (optional)
 *
 * Server derives:
 *   - partner_student_id  = body.partnerStudentId
 *   - partner_application_id = body.partnerApplicationId (or null)
 *   - student_id          = NULL (Q3a — partner docs never appear in student view)
 *   - status              = 'Pending' (Q1a default)
 *   - uploaded_at         = NOW (DB default)
 *
 * Cross-tenant guard: partnerStudentId + partnerApplicationId (if
 * set) MUST belong to caller's partner_id. Checked explicitly via
 * a service-client SELECT before insert — even though RLS would
 * block a foreign insert, an explicit check gives a clearer 400
 * error message than "new row violates row-level security policy".
 *
 * Storage path guard: fileUrl must start with
 * `partner/{caller's partner_id}/` so a partner can't store a row
 * pointing at someone else's prefix. Same defense-in-depth as the
 * partner_student_id check.
 *
 * Response: { document }
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const partnerStudentId = typeof body.partnerStudentId === 'string' ? body.partnerStudentId.trim() : '';
    const partnerApplicationIdRaw =
      typeof body.partnerApplicationId === 'string' ? body.partnerApplicationId.trim() : '';
    const documentTypeId = typeof body.documentTypeId === 'string' ? body.documentTypeId.trim() : '';
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const nameCn = typeof body.nameCn === 'string' ? body.nameCn.trim() || null : null;
    const categoryRaw = typeof body.category === 'string' ? body.category : '';
    const fileUrl = typeof body.fileUrl === 'string' ? body.fileUrl : '';
    const fileName = body.fileName;
    const fileType = body.fileType;
    const fileSize = body.fileSize;
    const notes = typeof body.notes === 'string' ? body.notes.trim() || null : null;

    if (!partnerStudentId) {
      return NextResponse.json({ error: 'partnerStudentId is required' }, { status: 400 });
    }
    if (!documentTypeId) {
      return NextResponse.json({ error: 'documentTypeId is required' }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }
    const category = parsePartnerDocCategory(categoryRaw);
    if (!category) {
      return NextResponse.json(
        { error: `category must be one of: ${PARTNER_DOC_CATEGORIES.join(' | ')}` },
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
    // Reject fileUrls that don't sit under this partner's namespace.
    // Mirrors the storage-path convention
    // `partner/{partnerId}/{partnerStudentId}/...` enforced by
    // createPartnerDocUploadUrl — a partner can't insert a row
    // pointing at another partner's prefix even if they somehow
    // obtained a valid signed URL.
    const expectedPrefix = `partner/${auth.partnerId}/`;
    if (!fileUrl.startsWith(expectedPrefix)) {
      return NextResponse.json(
        {
          error: `fileUrl must start with '${expectedPrefix}' (got: ${fileUrl.slice(0, 80)})`,
        },
        { status: 400 },
      );
    }

    // Reuse the existing file validators. Mirrors the student POST
    // route — defense against a client submitting a malicious
    // /upload-url response with content-type or size that doesn't
    // match the bucket's allowed_mime_types / max bytes.
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

    // Cross-tenant guard (1/2): partnerStudentId must be a real
    // partner_students row owned by the caller.
    const { data: psRow, error: psErr } = await service
      .from('partner_students')
      .select('id, partner_id')
      .eq('id', partnerStudentId)
      .maybeSingle();
    if (psErr) {
      return NextResponse.json({ error: psErr.message }, { status: 500 });
    }
    if (!psRow) {
      return NextResponse.json({ error: 'partnerStudentId not found' }, { status: 400 });
    }
    if ((psRow as { partner_id: string }).partner_id !== auth.partnerId) {
      return NextResponse.json(
        { error: 'partnerStudentId belongs to a different partner org' },
        { status: 403 },
      );
    }

    // Cross-tenant guard (2/2): if partnerApplicationId is set, it
    // must also be in the same partner_id AND belong to the selected
    // student. Prevents linking a document to an unrelated application.
    if (partnerApplicationIdRaw) {
      const { data: appRow, error: appErr } = await service
        .from('partner_applications')
        .select('id, partner_id, student_id')
        .eq('id', partnerApplicationIdRaw)
        .maybeSingle();
      if (appErr) {
        return NextResponse.json({ error: appErr.message }, { status: 500 });
      }
      if (!appRow) {
        return NextResponse.json(
          { error: 'partnerApplicationId not found' },
          { status: 400 },
        );
      }
      if ((appRow as { partner_id: string }).partner_id !== auth.partnerId) {
        return NextResponse.json(
          { error: 'partnerApplicationId belongs to a different partner org' },
          { status: 403 },
        );
      }
      if ((appRow as { student_id?: string | null }).student_id !== partnerStudentId) {
        return NextResponse.json(
          { error: 'partnerApplicationId does not belong to the selected student' },
          { status: 400 },
        );
      }
    }

    // Insert via the auth-bound client so the new partner-RLS
    // policies apply (they enforce the same partner_student_id
    // check at the DB layer — but our explicit guard gives a
    // clearer error message + closes the TOCTOU window between
    // the SELECT above and the INSERT below).
    const dbRow: Record<string, unknown> = {
      partner_student_id: partnerStudentId,
      partner_application_id: partnerApplicationIdRaw || null,
      document_type_id: documentTypeId,
      name,
      name_cn: nameCn,
      category,
      file_url: fileUrl,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      notes,
      status: 'Pending',
      student_id: null,
    };

    const { data, error } = await auth.supabase
      .from('student_documents')
      .insert(dbRow)
      .select(
        `
          *,
          partner_student:partner_students!partner_student_id (id, student_name, student_email),
          partner_application:partner_applications!partner_application_id (id, university, program)
        `,
      )
      .single();

    if (error) {
      console.error('[partner/documents POST] supabase error:', error);
      // Best-effort cleanup: the file was already PUT to Storage, but
      // the row insert failed. Delete the orphan so the partner isn't
      // billed for/haunted by a file with no DB reference.
      try {
        const { deletePartnerDocFile } = await import('@/lib/storage');
        if (fileUrl.startsWith(expectedPrefix)) {
          await deletePartnerDocFile(fileUrl);
        }
      } catch (cleanupErr) {
        console.error('[partner/documents POST] cleanup failed:', cleanupErr);
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { document: mapPartnerDocumentFromDb(data as RawPartnerDocument) },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents POST] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}