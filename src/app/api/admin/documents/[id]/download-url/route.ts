import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, buildServiceClient, getServerEnv } from '@/lib/supabase-auth';
import { createStudentDocDownloadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/documents/[id]/download-url
 *
 * Mint a 1h signed URL the admin review queue can use to open the
 * underlying file in a new tab. Mirrors the partner-side
 * `/api/partner/documents/[id]/download-url` route — same bucket,
 * same signed-URL plumbing, different auth gate.
 *
 * Bug fixed in Phase 31: the admin `/admin/documents/[id]` page
 * was rendering `doc.file_url` directly as the `<a href>`, `<img
 * src>`, and `<iframe src>`. `file_url` is a **storage path**
 * (e.g. `partner/abc/xyz/doc-123.pdf`), not a public URL —
 * clicking it opened a broken link in a new tab. The fix is to
 * always mint a signed URL at click time, just like the partner
 * list page already does.
 *
 * Auth: requireAdmin — admin can mint a URL for any doc (no
 * per-team scoping, admin is global by design).
 *
 * Response: { url, expiresAt }
 *   - url        : signed GET URL (1h lifetime)
 *   - expiresAt  : ISO timestamp for the expiry
 *
 * Errors:
 *   - 401 / 403 : auth
 *   - 404       : doc not found
 *   - 500       : storage layer failure
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!getServerEnv().serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
  }
  const auth = await requireAdmin(_request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    // Admin-side: use the service client to fetch the row so the
    // auth gate is the only ownership check (admins see every doc,
    // including partner-uploaded ones).
    const service = buildServiceClient();
    const { data, error } = await service
      .from('student_documents')
      .select('id, file_url')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const fileUrl = (data as { file_url: string }).file_url;
    if (!fileUrl) {
      return NextResponse.json({ error: 'Document has no file_url' }, { status: 400 });
    }

    // Reuse the same storage helper as the student + partner flows
    // — the bucket is `student-documents` for both surfaces, only
    // the path layout differs. `createStudentDocDownloadUrl` issues
    // a 1h signed URL from any path inside the bucket.
    const url = await createStudentDocDownloadUrl(fileUrl);
    if (!url) {
      return NextResponse.json(
        { error: 'Failed to issue download URL' },
        { status: 500 },
      );
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    return NextResponse.json({ url, expiresAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[admin/documents/:id/download-url] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
