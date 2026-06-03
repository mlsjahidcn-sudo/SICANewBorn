import { NextRequest, NextResponse } from 'next/server';
import { createTranscriptUploadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * Generate a signed upload URL for a transcript file.
 *
 * Client → POST /api/upload/transcript { assessmentId, fileName, fileType }
 * Returns: { uploadUrl, storagePath }
 *
 * The client then uploads the file directly to uploadUrl (Supabase Storage).
 * After upload succeeds, the client includes storagePath in the form submission.
 */
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const assessmentId = body.assessmentId as string;
  const fileName = body.fileName as string;
  const fileType = body.fileType as string;

  if (!assessmentId || !fileName || !fileType) {
    return NextResponse.json(
      { error: 'assessmentId, fileName, and fileType are required' },
      { status: 400 },
    );
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!allowedTypes.includes(fileType)) {
    return NextResponse.json(
      { error: 'File type not allowed. Use PDF, PNG, JPG, or DOC/DOCX.' },
      { status: 400 },
    );
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024;
  const size = Number(body.size) || 0;
  if (size > maxSize) {
    return NextResponse.json(
      { error: 'File too large. Maximum size is 10MB.' },
      { status: 400 },
    );
  }

  const result = await createTranscriptUploadUrl(assessmentId, fileName);
  if (!result) {
    return NextResponse.json(
      { error: 'Failed to generate upload URL. Storage may not be configured.' },
      { status: 503 },
    );
  }

  return NextResponse.json(result);
}
