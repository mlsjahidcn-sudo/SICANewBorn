import { NextRequest, NextResponse } from 'next/server';
import {
  requireTeamMember,
  buildServiceClient,
  getServerEnv,
} from '@/lib/supabase-auth';
import {
  mapPartnerDocumentFromDb,
  PARTNER_DOC_CATEGORIES,
  parsePartnerDocCategory,
  type RawPartnerDocument,
} from '@/lib/partner-doc-mapper';
import { deletePartnerDocFile } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/partner/documents/[id]
 *
 * Single-document view for the partner portal. Returns the doc
 * with the joined partner_student + partner_application metadata
 * (same shape as the GET list, for UI consistency).
 *
 * RLS scopes the SELECT — no extra ownership check needed beyond
 * the auth gate. The doc row's partner_student_id gates on
 * `is_doc_partner_member(...)` which mirrors `auth.partnerId`.
 *
 * Auth: requireTeamMember.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const { data, error } = await auth.supabase
      .from('student_documents')
      .select(
        `
          *,
          partner_student:partner_students!partner_student_id (id, student_name, student_email),
          partner_application:partner_applications!partner_application_id (id, university, program)
        `,
      )
      .eq('id', id)
      .not('partner_student_id', 'is', null)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      document: mapPartnerDocumentFromDb(data as RawPartnerDocument),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents/:id GET] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * PATCH /api/partner/documents/[id]
 *
 * Update a partner document's editable fields. Whitelist:
 *
 *   - name                (display name)
 *   - nameCn              (Chinese display name, optional)
 *   - category            (6 enum values, see PARTNER_DOC_CATEGORIES)
 *   - notes               (free text)
 *   - partnerApplicationId (link/unlink to a partner_application; null = unlink)
 *
 * Explicitly NOT editable (returns 400 if included):
 *   - status, verifiedAt, verifiedBy, rejectionReason
 *     (admin-only — the admin PATCH route handles these)
 *   - partnerStudentId, studentId, fileUrl, fileName, fileType, fileSize
 *     (immutable after upload — re-upload instead)
 *
 * Cross-tenant guard (same as POST): if partnerApplicationId is
 * set, it must belong to caller's partner_id. partnerStudentId
 * changes are not allowed (re-upload instead).
 *
 * Response: { document } (full updated row + joins).
 */
const ALLOWED_FIELDS = [
  'name',
  'nameCn',
  'category',
  'notes',
  'partnerApplicationId',
] as const;

const FORBIDDEN_FIELDS = [
  'status',
  'verified_at',
  'verifiedAt',
  'verified_by',
  'verifiedBy',
  'rejection_reason',
  'rejectionReason',
  'partner_student_id',
  'partnerStudentId',
  'student_id',
  'studentId',
  'file_url',
  'fileUrl',
  'file_name',
  'fileName',
  'file_type',
  'fileType',
  'file_size',
  'fileSize',
] as const;

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // Reject any forbidden fields up front (admin-only + immutable).
    for (const key of FORBIDDEN_FIELDS) {
      if (body[key] !== undefined) {
        return NextResponse.json(
          { error: `Field '${key}' is not editable via this endpoint` },
          { status: 403 },
        );
      }
    }

    // Verify at least one editable field is present — a PATCH that
    // touches nothing is a 400, not a silent no-op.
    const presentFields = ALLOWED_FIELDS.filter((k) => body[k] !== undefined);
    if (presentFields.length === 0) {
      return NextResponse.json(
        {
          error: `No editable fields provided. Allowed: ${ALLOWED_FIELDS.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Validate category against the closed enum if provided.
    let category: ReturnType<typeof parsePartnerDocCategory> = null;
    if (body.category !== undefined) {
      category = parsePartnerDocCategory(body.category);
      if (!category) {
        return NextResponse.json(
          { error: `category must be one of: ${PARTNER_DOC_CATEGORIES.join(' | ')}` },
          { status: 400 },
        );
      }
    }

    // Cross-tenant guard for partnerApplicationId changes — same
    // pattern as the POST route.
    if (body.partnerApplicationId !== undefined && body.partnerApplicationId !== null) {
      if (typeof body.partnerApplicationId !== 'string' || !body.partnerApplicationId.trim()) {
        return NextResponse.json(
          { error: 'partnerApplicationId must be a non-empty string or null' },
          { status: 400 },
        );
      }
      const service = buildServiceClient();
      const { data: appRow, error: appErr } = await service
        .from('partner_applications')
        .select('id, partner_id')
        .eq('id', body.partnerApplicationId as string)
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
    }

    // Build the update payload. Each field is explicitly checked
    // (no `...body` spread — admin-only / immutable fields must not
    // sneak through a tampered body).
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) {
      const n = typeof body.name === 'string' ? body.name.trim() : '';
      if (!n) {
        return NextResponse.json({ error: 'name cannot be empty' }, { status: 400 });
      }
      updates.name = n;
    }
    if (body.nameCn !== undefined) {
      updates.name_cn =
        typeof body.nameCn === 'string' ? body.nameCn.trim() || null : null;
    }
    if (category !== null) updates.category = category;
    if (body.notes !== undefined) {
      updates.notes = typeof body.notes === 'string' ? body.notes.trim() || null : null;
    }
    if (body.partnerApplicationId !== undefined) {
      updates.partner_application_id =
        body.partnerApplicationId === null ? null : (body.partnerApplicationId as string);
    }

    const { data, error } = await auth.supabase
      .from('student_documents')
      .update(updates)
      .eq('id', id)
      .select(
        `
          *,
          partner_student:partner_students!partner_student_id (id, student_name, student_email),
          partner_application:partner_applications!partner_application_id (id, university, program)
        `,
      )
      .maybeSingle();

    if (error) {
      console.error('[partner/documents/:id PATCH] supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      document: mapPartnerDocumentFromDb(data as RawPartnerDocument),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents/:id PATCH] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * DELETE /api/partner/documents/[id]
 *
 * Remove a partner document AND its storage object. Per the
 * scoping memo §2f, partner deletes intentionally clean up the
 * Storage object (unlike the student side, which orphans the
 * file — students may want to recover an accidentally-deleted
 * doc, partners have admin-facing audit trail + the row was
 * intentional, so cleanup is the safer default).
 *
 * Two-step: delete the Storage object first (so a partner can't
 * crash on the DB write and leave the file behind), then delete
 * the row. If the storage delete fails (file already gone, RLS
 * on bucket), we still attempt the row delete so the partner
 * isn't stuck with a row they can't remove. Errors are logged
 * but don't fail the request — the partner's intent is to
 * remove the row.
 *
 * Response: 204 No Content.
 *
 * Auth: requireTeamMember.
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireTeamMember(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Fetch the row first so we know the storage path. RLS scopes
    // this to the caller's partner — a foreign id returns 0 rows.
    const { data: doc, error: fetchErr } = await auth.supabase
      .from('student_documents')
      .select('id, file_url, partner_student_id')
      .eq('id', id)
      .not('partner_student_id', 'is', null)
      .maybeSingle();

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    }
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const fileUrl = (doc as { file_url: string }).file_url;
    // Belt-and-suspenders: only delete storage if the path is under
    // this partner's namespace. A foreign path means something went
    // wrong (RLS should have hidden the row), so don't issue a
    // destructive Storage call based on it.
    const expectedPrefix = `partner/${auth.partnerId}/`;
    if (fileUrl.startsWith(expectedPrefix)) {
      const removed = await deletePartnerDocFile(fileUrl);
      if (!removed) {
        console.warn(
          `[partner/documents/:id DELETE] storage delete returned false for ${id} (file may already be gone)`,
        );
      }
    } else {
      console.warn(
        `[partner/documents/:id DELETE] file_url outside partner prefix; skipping storage delete for ${id}`,
      );
    }

    const { error: delErr } = await auth.supabase
      .from('student_documents')
      .delete()
      .eq('id', id);
    if (delErr) {
      console.error('[partner/documents/:id DELETE] supabase error:', delErr);
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents/:id DELETE] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}