import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, getServerEnv } from '@/lib/supabase-auth';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';
import { createOcrUploadUrl } from '@/lib/ocr-storage';
import {
  validateFileName,
  validateFileType,
  validateFileSize,
} from '@/lib/storage-validation';
import { OCR_ALLOWED_MIME_TYPES, OCR_MAX_BYTES } from '@/lib/admin-ocr-helpers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/students/ocr/upload-url
 *
 * Phase 89: first step of the 2-step OCR upload flow.
 *
 * Body: { fileName: string, fileType: string, fileSize: number }
 * Response: { uploadUrl, storagePath, documentId }
 *
 * Admin-only. Rate-limited (shared bucket with /api/admin/students/
/ocr/extract under `student-ocr` — Phase 89 limit 15/15min per admin).
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const rl = checkAdminAIRateLimit(auth.user.id, 'student-ocr');
  if (rl.blocked) return rl.response;

  let body: { fileName?: string; fileType?: string; fileSize?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { fileName, fileType, fileSize } = body;

  if (typeof fileName !== 'string' || !validateFileName(fileName)) {
    return NextResponse.json({ error: 'Invalid fileName' }, { status: 400 });
  }
  if (typeof fileType !== 'string' || !validateFileType(fileType)) {
    return NextResponse.json({ error: 'Invalid fileType' }, { status: 400 });
  }
  // OCR has a tighter MIME allow-list than the general student-docs
  // upload — we only support images + PDF (no Word docs).
  if (!OCR_ALLOWED_MIME_TYPES.includes(fileType as never)) {
    return NextResponse.json(
      {
        error: 'Unsupported file type. Allowed: JPEG, PNG, WEBP, single-page PDF.',
        code: 'UNSUPPORTED_FORMAT',
      },
      { status: 400 },
    );
  }
  if (typeof fileSize !== 'number' || !validateFileSize(fileSize)) {
    return NextResponse.json({ error: 'Invalid fileSize' }, { status: 400 });
  }
  if (fileSize > OCR_MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${OCR_MAX_BYTES / 1024 / 1024}MB)`, code: 'TOO_LARGE' },
      { status: 400 },
    );
  }

  const documentId = crypto.randomUUID();
  const result = await createOcrUploadUrl(documentId, fileName);
  if (!result) {
    return NextResponse.json(
      { error: 'Failed to create upload URL' },
      { status: 500 },
    );
  }

  return NextResponse.json(result);
}