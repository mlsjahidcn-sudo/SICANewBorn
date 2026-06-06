import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * /api/admin/news/[id]
 *
 * GET    — read one post (admin only).
 * PATCH  — update one or more fields. Admin only.
 * DELETE — delete a post. Admin only.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await params;
  const { data, error } = await supabaseServer
    .from('news_posts')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ post: data });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Whitelist the columns we'll accept. Everything else is ignored.
  const updatePayload: Record<string, unknown> = {};
  const allowed = [
    'title_en', 'title_zh', 'slug', 'excerpt_en', 'excerpt_zh',
    'content_en', 'content_zh', 'cover_image', 'category', 'tags',
    'status', 'author', 'ai_prompt', 'seo_title', 'seo_description',
    // S36: SEO + AEO + GEO structured fields. Accept whatever
    // JSON shape the form sends; the public renderer is
    // defensive about malformed entries.
    'key_takeaways', 'at_a_glance', 'faq', 'sources',
  ] as const;
  for (const key of allowed) {
    if (key in body) updatePayload[key] = body[key];
  }

  // When transitioning to 'published' for the first time, stamp
  // published_at. We can detect this by checking the current row.
  if (updatePayload.status === 'published') {
    const { data: existing } = await supabaseServer
      .from('news_posts')
      .select('status, published_at')
      .eq('id', id)
      .maybeSingle();
    if (existing && existing.status !== 'published' && !existing.published_at) {
      updatePayload.published_at = new Date().toISOString();
    }
  }
  // When unpublishing, clear published_at so re-publish restamps
  if (updatePayload.status === 'draft') {
    updatePayload.published_at = null;
  }

  // Recompute read time if content changed
  if (typeof updatePayload.content_en === 'string') {
    updatePayload.read_time_minutes = Math.max(
      1,
      Math.round(updatePayload.content_en.split(/\s+/).length / 220),
    );
  }

  const { data, error } = await supabaseServer
    .from('news_posts')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await params;
  const { error } = await supabaseServer.from('news_posts').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
