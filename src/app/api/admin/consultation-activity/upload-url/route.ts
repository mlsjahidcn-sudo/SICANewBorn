import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { CONSULTATION_BUCKET } from '@/lib/consultation-activity';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/consultation-activity/upload-url — issue a
 * short-lived signed upload URL for the `consultation-activity`
 * storage bucket. The admin UI uploads the file bytes directly
 * to the signed URL, then POSTs the returned `storagePath` to
 * /api/admin/consultation-activity (which validates it starts
 * with `consultation/`).
 *
 * Auth: requireAdmin. Same per-admin rate limit as the documents
 * upload-url endpoint (30 / 15 min).
 *
 * Body: { fileName, mimeType }.
 * Response: { uploadUrl, storagePath, expiresInSec }.
 *
 * Object path convention: `consultation/<uuid>/<safe-file-name>`.
 * The `consultation/` prefix matches the image_path CHECK on the
 * DB column and the API whitelist prefix-check.
 */
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB — consultation screenshots are usually <2MB.

function sanitizeFileName(raw: string): string {
  // Strip path separators + control chars. Keep the last 80 chars
  // so the path doesn't overflow Supabase's per-object name limit.
  return raw
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(-80) || 'shot';
}

export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const body = await request.json().catch(() => ({}));
    const fileName = typeof body.fileName === 'string' ? body.fileName : '';
    const mimeType = typeof body.mimeType === 'string' ? body.mimeType : '';
    if (!fileName || !mimeType) {
      return NextResponse.json(
        { error: 'fileName and mimeType required' },
        { status: 400 },
      );
    }
    if (!(ALLOWED_MIME as readonly string[]).includes(mimeType)) {
      return NextResponse.json(
        { error: `mimeType must be one of: ${ALLOWED_MIME.join(', ')}` },
        { status: 400 },
      );
    }
    if (typeof body.size === 'number' && body.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large — max ${MAX_BYTES} bytes (${(MAX_BYTES / 1024 / 1024).toFixed(0)}MB)` },
        { status: 400 },
      );
    }
    if (typeof body.size === 'number' && body.size <= 0) {
      return NextResponse.json(
        { error: 'Invalid size (must be > 0)' },
        { status: 400 },
      );
    }

    const safeName = sanitizeFileName(fileName);
    // <uuid> prefix lets admins upload multiple shots without
    // collisions; the per-shot <uuid> also matches the photo_id
    // pattern used in other admin uploads.
    const uuid = globalThis.crypto.randomUUID();
    const storagePath = `consultation/${uuid}/${safeName}`;

    const service = buildServiceClient();
    const { data, error } = await service.storage
      .from(CONSULTATION_BUCKET)
      .createSignedUploadUrl(storagePath);
    if (error || !data?.signedUrl) {
      console.error('[admin/consultation-activity/upload-url] sign failed:', error);
      return NextResponse.json(
        { error: error?.message ?? 'Failed to sign upload URL — is the bucket created in Supabase Storage?' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      storagePath,
      expiresInSec: 3600,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
