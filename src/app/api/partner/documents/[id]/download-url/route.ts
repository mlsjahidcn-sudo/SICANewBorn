import { NextRequest, NextResponse } from 'next/server';
import { requireTeamMember, getServerEnv } from '@/lib/supabase-auth';
import { createPartnerDocDownloadUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';

/**
 * POST /api/partner/documents/[id]/download-url
 *
 * Mint a 1h signed URL the partner portal can hand to the
 * browser for direct download. Mirrors the student-side
 * /api/student/documents/[id]/download-url split (separate route
 * for the signed URL, so the route handler can issue the URL
 * without doing the actual download streaming).
 *
 * Auth: requireTeamMember. RLS scopes the doc lookup to the
 * caller's partner; a foreign id returns 404.
 *
 * Response: { url, expiresAt }
 *   - url        : signed GET URL (1h lifetime)
 *   - expiresAt  : ISO timestamp for the expiry — surfaces in the UI
 *                  so the partner knows when to re-request
 *
 * Errors:
 *   - 401 / 403 : auth
 *   - 404       : doc not in caller's partner scope (or doesn't exist)
 *   - 500       : storage layer failure
 */
export async function POST(
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
    // Fetch only what we need (the storage path) and let RLS scope
    // the SELECT to the caller's partner. The .not('partner_student_id',
    // 'is', null) is belt-and-suspenders — RLS already gates on
    // partner_student_id IS NOT NULL + is_doc_partner_member(...).
    const { data, error } = await auth.supabase
      .from('student_documents')
      .select('id, file_url, partner_student_id')
      .eq('id', id)
      .not('partner_student_id', 'is', null)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const fileUrl = (data as { file_url: string }).file_url;

    // Belt-and-suspenders: refuse to mint a download URL for a path
    // outside this partner's namespace, even if RLS somehow let a
    // foreign row through. The same defense the DELETE route uses.
    const expectedPrefix = `partner/${auth.partnerId}/`;
    if (!fileUrl.startsWith(expectedPrefix)) {
      return NextResponse.json(
        { error: 'Document storage path is outside this partner org' },
        { status: 403 },
      );
    }

    const url = await createPartnerDocDownloadUrl(fileUrl);
    if (!url) {
      return NextResponse.json(
        { error: 'Failed to issue download URL' },
        { status: 500 },
      );
    }

    // 1h matches createPartnerDocDownloadUrl's hardcoded expiry.
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    return NextResponse.json({ url, expiresAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[partner/documents/:id/download-url] unhandled:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}