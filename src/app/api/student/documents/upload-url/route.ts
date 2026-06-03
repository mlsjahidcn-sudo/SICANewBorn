import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuth, getServerEnv } from '@/lib/supabase-auth';
import { createStudentDocUploadUrl } from '@/lib/storage';
import {
  validateFileType,
  validateFileSize,
  validateFileName,
} from '@/lib/storage-validation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/student/documents/upload-url
 *
 * Issue a signed upload URL for the student to PUT a file to.
 *
 * Body (camelCase):
 *   - fileName     (required) — original file name (for display)
 *   - fileType     (required) — MIME type
 *   - fileSize     (required) — bytes
 *   - documentId?  (optional) — pre-allocated student_documents.id to
 *                                bake into the storage path so the row
 *                                and the file share an ID. If omitted,
 *                                a UUID is generated server-side.
 *
 * Response: { uploadUrl, storagePath, token, documentId }
 *
 * Flow:
 *   1. Client calls this → gets a signed uploadUrl + the documentId
 *   2. Client PUTs file bytes to uploadUrl (no server hop)
 *   3. Client calls POST /api/student/documents with the documentId +
 *      fileName + fileType + fileSize + storagePath + name + category
 *      → server creates the student_documents row
 *
 * Why split: the file upload goes direct to Storage (no Next.js body
 * parsing), and the row creation goes through the regular API so RLS +
 * validation can run. The signed URL is short-lived (default 2h) so
 * even if leaked it's narrow.
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured. Set COZE_SUPABASE_SERVICE_ROLE_KEY.' },
      { status: 503 },
    );
  }

  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
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
  const documentId =
    typeof body.documentId === 'string' && body.documentId.length > 0
      ? body.documentId
      : crypto.randomUUID();

  // Validate
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

  const result = await createStudentDocUploadUrl(auth.user.id, documentId, fileName as string);
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
