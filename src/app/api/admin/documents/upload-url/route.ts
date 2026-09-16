import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getServerEnv } from '@/lib/supabase-auth';
import { createStudentDocUploadUrl } from '@/lib/storage';
import {
  validateFileType,
  validateFileSize,
  validateFileName,
} from '@/lib/storage-validation';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

/**
 * Phase 109 Batch 1: POST /api/admin/documents/upload-url
 *
 * First step of the 2-step admin document upload flow. Mirrors
 * /api/student/documents/upload-url + /api/partner/documents/upload-url
 * exactly so the wizard's file-picker can use the same client code as
 * the student/partner surfaces.
 *
 * Body (camelCase):
 *   - fileName    (required) — original file name (for display)
 *   - fileType    (required) — MIME type
 *   - fileSize    (required) — bytes
 *   - studentId   (required) — student the new doc belongs to. Used
 *                                for both the storage-path namespace
 *                                (createStudentDocUploadUrl enforces
 *                                `student/{studentId}/...`) AND for the
 *                                eventual row insert's `student_id`
 *                                column.
 *   - documentId? (optional) — pre-allocated student_documents.id so the
 *                                row + the storage path share an id. If
 *                                omitted, the route generates one.
 *
 * Response: { uploadUrl, storagePath, token, documentId }
 *
 * Auth: requireAdmin. Rate-limited per admin (30/15 min — same as the
 * student route via checkRateLimit).
 */
const UPLOAD_URL_RATE_MAX = 30;
const UPLOAD_URL_RATE_WINDOW_MS = 15 * 60 * 1000;

export async function POST(request: NextRequest) {
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

  // Per-admin rate limit on signed-URL mints. Same parameters as the
  // student route — a single application needs ~5-10 docs but admins
  // could be uploading for several students back-to-back.
  const rl = checkRateLimit({
    action: 'admin-doc-upload-url',
    key: auth.user.id,
    max: UPLOAD_URL_RATE_MAX,
    windowMs: UPLOAD_URL_RATE_WINDOW_MS,
  });
  if (!rl.ok) {
    return NextResponse.json(
      {
        error: `Too many upload requests. Try again in ${rl.retryAfterSec} seconds.`,
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

  const fileName = body.fileName;
  const fileType = body.fileType;
  const fileSize = body.fileSize;
  const studentId = typeof body.studentId === 'string' ? body.studentId.trim() : '';
  const documentId =
    typeof body.documentId === 'string' && body.documentId.length > 0
      ? body.documentId
      : crypto.randomUUID();

  // studentId is mandatory for admin uploads (unlike the student route
  // where the route derives it from auth.user.id). Without it we can't
  // namespace the storage path correctly.
  if (!studentId) {
    return NextResponse.json(
      { error: 'studentId is required for admin uploads' },
      { status: 400 },
    );
  }

  // Validate file metadata — reuse the existing helpers so the admin
  // surface enforces the same allow-list as the student surface.
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

  const result = await createStudentDocUploadUrl(studentId, documentId, fileName as string);
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
      studentId,
    },
    { status: 201 },
  );
}