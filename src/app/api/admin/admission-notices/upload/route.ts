/**
 * /api/admin/admission-notices/upload
 *
 * Phase 51: image upload endpoint. Accepts a multipart/form-data
 * POST with a single `file` field, watermarks it server-side
 * using sharp (applySicaWatermark), uploads both the original
 * + watermarked versions to the `admission-notices` storage
 * bucket, and returns the storage paths.
 *
 * The admin form uploads first, then POSTs the metadata to
 * /api/admin/admission-notices (the create endpoint) using the
 * returned paths.
 *
 * Auth: requireAdmin.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import {
  ADMISSION_NOTICE_ACCEPTED_MIME_TYPES,
  ADMISSION_NOTICE_MAX_INPUT_BYTES,
  applySicaWatermark,
} from '@/lib/admission-notices/watermark';
import { uploadAdmissionNoticeImages } from '@/lib/admission-notices/storage';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No file uploaded. Use multipart/form-data with a "file" field.' },
        { status: 400 },
      );
    }
    if (file.size === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }
    if (file.size > ADMISSION_NOTICE_MAX_INPUT_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max ${ADMISSION_NOTICE_MAX_INPUT_BYTES / 1024 / 1024}MB` },
        { status: 400 },
      );
    }
    const allowed = ADMISSION_NOTICE_ACCEPTED_MIME_TYPES as readonly string[];
    if (!allowed.includes(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type "${file.type}". Allowed: ${allowed.join(', ')}`,
        },
        { status: 400 },
      );
    }

    // Read the original buffer (server-side).
    const arrayBuf = await file.arrayBuffer();
    const originalBuffer = Buffer.from(arrayBuf);

    // Apply the watermark.
    let watermarkedBuffer: Buffer;
    try {
      watermarkedBuffer = await applySicaWatermark(originalBuffer);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Watermark failed';
      console.error('[admin/admission-notices upload] watermark:', e);
      return NextResponse.json(
        { error: `Could not process image: ${message}` },
        { status: 400 },
      );
    }

    // Upload both files.
    const uploaded = await uploadAdmissionNoticeImages({
      originalFilename: file.name || 'upload.jpg',
      originalBuffer,
      watermarkedBuffer,
    });
    if (!uploaded) {
      return NextResponse.json(
        { error: 'Could not upload images to storage' },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        originalPath: uploaded.originalPath,
        publicPath: uploaded.publicPath,
        originalSize: originalBuffer.byteLength,
        watermarkedSize: watermarkedBuffer.byteLength,
      },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/admission-notices upload] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
