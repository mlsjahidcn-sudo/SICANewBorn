import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { createPartnerDocUploadUrl } from '@/lib/storage';
import {
  validateFileType,
  validateFileSize,
  validateFileName,
} from '@/lib/storage-validation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/partner/documents/upload-url
 *
 * Issue a signed upload URL for the partner portal's
 * /partner/documents page. Mirrors the student-side
 * /api/student/documents/upload-url split (separate route for the
 * signed URL + a separate POST for the DB row, so the file bytes
 * never traverse Next.js).
 *
 * Body (camelCase):
 *   - partnerStudentId (required) — must belong to caller's partner_id
 *   - originalFileName (required) — original filename for display
 *   - contentType      (required) — MIME type
 *   - size             (required) — bytes
 *
 * Response (201): { uploadUrl, storagePath, token, documentId }
 *   - documentId is server-generated; client reuses it in the POST.
 *
 * Flow:
 *   1. Client calls this → gets a signed uploadUrl + the documentId
 *   2. Client PUTs the file bytes to uploadUrl (no Next.js hop)
 *   3. Client calls POST /api/partner/documents with the documentId +
 *      fileName + fileType + fileSize + fileUrl (storagePath) + name +
 *      category → server creates the student_documents row
 *
 * Cross-tenant guard: partnerStudentId MUST belong to caller's
 * partner_id (checked explicitly so the partner gets a clean 400
 * instead of a signed URL they can't actually use). Mirrors the
 * same guard in POST /api/partner/documents.
 *
 * Auth: requireTeamMember (owner OR active member).
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }
  const auth = await requireTeamMember(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const partnerStudentId =
    typeof body.partnerStudentId === 'string' ? body.partnerStudentId.trim() : '';
  const originalFileName = body.originalFileName;
  const contentType = body.contentType;
  const size = body.size;

  if (!partnerStudentId) {
    return NextResponse.json({ error: 'partnerStudentId is required' }, { status: 400 });
  }

  // Reuse the existing file validators — same MIME / size rules
  // as the student side (STUDENT_DOC_ALLOWED_TYPES + 10MB cap).
  for (const [val, fn, label] of [
    [originalFileName, validateFileName, 'originalFileName'],
    [contentType, validateFileType, 'contentType'],
    [size, validateFileSize, 'size'],
  ] as const) {
    const r = fn(val);
    if (!r.ok) {
      return NextResponse.json({ error: `${label}: ${r.error}` }, { status: 400 });
    }
  }

  // Cross-tenant guard: confirm the student belongs to this partner.
  // Defense-in-depth — RLS will eventually gate the insert anyway,
  // but a signed URL issued for the wrong student_id would let the
  // caller upload bytes under a prefix they can't later reference
  // (the POST would 400 with "belongs to a different partner org"
  // but the bytes would still be in Storage). Cheaper to fail fast.
  const service = buildServiceClient();
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

  // Mint the documentId server-side — the client reuses it in the
  // POST body so the storage path and the row FK share the same id.
  const documentId = crypto.randomUUID();

  const result = await createPartnerDocUploadUrl(
    auth.partnerId,
    partnerStudentId,
    documentId,
    originalFileName as string,
  );
  if (!result) {
    return NextResponse.json(
      { error: 'Failed to issue upload URL' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      uploadUrl: result.uploadUrl,
      storagePath: result.storagePath,
      token: result.token,
      documentId,
    },
    { status: 201 },
  );
}