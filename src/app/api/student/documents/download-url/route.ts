import { NextRequest, NextResponse } from 'next/server';
import { getRequestAuth, getServerEnv } from '@/lib/supabase-auth';
import { createStudentDocDownloadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/student/documents/download-url?path=...
 *
 * Returns a 1-hour signed download URL for a stored document.
 * The client just opens the URL in a new tab — no auth headers needed
 * because the signature IS the auth.
 *
 * Path-scoped: we extract the first path segment and verify it matches
 * auth.uid() so a student can never get a signed URL for another
 * student's file.
 */
export async function GET(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 },
    );
  }

  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const path = request.nextUrl.searchParams.get('path');
  if (!path) {
    return NextResponse.json({ error: 'path is required' }, { status: 400 });
  }

  // First segment of the path is the student_id. Reject if it isn't
  // the caller — even admins should go through the service-role flow.
  const firstSegment = path.split('/')[0];
  if (firstSegment !== auth.user.id) {
    return NextResponse.json(
      { error: 'path must start with the calling user id' },
      { status: 403 },
    );
  }

  const downloadUrl = await createStudentDocDownloadUrl(path);
  if (!downloadUrl) {
    return NextResponse.json(
      { error: 'Failed to issue download URL' },
      { status: 500 },
    );
  }

  return NextResponse.json({ downloadUrl });
}
