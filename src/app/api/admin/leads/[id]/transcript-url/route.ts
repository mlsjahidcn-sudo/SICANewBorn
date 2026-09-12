/**
 * Phase 83: GET /api/admin/leads/[id]/transcript-url
 *
 * Mints a 1-hour signed URL for the assessment's transcript file in
 * Supabase Storage. The lead row's `transcript_storage_path` is
 * `transcripts/{sessionId}/{docId}-{filename}` — we pass it through
 * Supabase's storage API so the admin can preview the file without
 * needing a permanent public URL.
 *
 * Auth: admin-only (requireAdmin). Admin session is verified before
 * any storage call.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

const TRANSCRIPT_BUCKET = 'transcripts';
const SIGNED_URL_TTL_SEC = 3600; // 1 hour

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const storagePath = (url.searchParams.get('path') || '').trim();
  // Defense-in-depth: refuse any path that isn't in the transcripts
  // bucket's expected prefix (transcripts/{session}/...). A
  // malicious caller can't smuggle a path to a different bucket.
  if (!storagePath || !storagePath.startsWith('transcripts/')) {
    return NextResponse.json(
      { error: 'Invalid path. Expected `transcripts/{session}/{file}`.' },
      { status: 400 },
    );
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  // Verify the lead row exists and matches the requested path
  // (defense-in-depth — admin must have access to this lead before
  // we mint a URL for its file).
  const { data: lead, error: leadErr } = await supabase
    .from('student_assessments')
    .select('id, transcript_storage_path')
    .eq('id', id)
    .maybeSingle();
  if (leadErr || !lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
  if (lead.transcript_storage_path !== storagePath) {
    return NextResponse.json(
      { error: 'Path does not match this lead' },
      { status: 400 },
    );
  }

  const { data, error } = await supabase.storage
    .from(TRANSCRIPT_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_TTL_SEC);
  if (error || !data) {
    return NextResponse.json(
      { error: error?.message || 'Failed to sign URL' },
      { status: 500 },
    );
  }

  return NextResponse.json({ url: data.signedUrl, ttl_sec: SIGNED_URL_TTL_SEC });
}