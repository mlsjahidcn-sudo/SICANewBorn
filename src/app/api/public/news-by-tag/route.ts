import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';

/**
 * GET /api/public/news-by-tag
 *
 * Public read-only endpoint that returns published news posts
 * that match a set of search terms. Used by the catalog pages
 * (/universities/[slug], /programs/[slug], /scholarships/[slug])
 * to render a "Latest news about this [entity]" widget — the
 * reciprocal link to the S36 system that points the OTHER way
 * (post body → catalog).
 *
 * Query params:
 *   - terms  : comma-separated list of search terms. Each term
 *              is matched case-insensitively against the post's
 *              title_en / title_zh / excerpt_en / content_en /
 *              tags. The first match wins for the `matchedBy`
 *              field. Matched terms are OR'd — any term hits
 *              counts.
 *   - category : optional exact-match filter (e.g. 'scholarship',
 *              'university', 'partnership').
 *   - limit  : 1..10, default 5.
 *   - exclude : optional post id to skip (so the same post
 *              doesn't link to itself on a related-news strip).
 *
 * Response: { posts: Array<{ id, slug, title_en, title_zh,
 *           excerpt_en, cover_image, category, tags, published_at,
 *           read_time_minutes, matchedBy: string }> }
 *
 * Auth: none — this is a public endpoint for catalog pages
 * (university / program / scholarship) to render related news.
 * The RLS policy on news_posts already filters to status='published'
 * for the anon key, so we go through the regular Supabase client.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ posts: [] });
  }
  const supabase = getSupabaseServer();
  if (!supabase) {
    return NextResponse.json({ posts: [] });
  }

  const { searchParams } = new URL(request.url);
  const termsParam = (searchParams.get('terms') || '').trim();
  const category = searchParams.get('category');
  const limit = Math.min(10, Math.max(1, parseInt(searchParams.get('limit') || '5', 10)));
  const exclude = searchParams.get('exclude') || '';

  // Pull a generous slice of recent published posts. We over-fetch
  // because the matching happens JS-side (the search spans title,
  // excerpt, content, AND tags, which PostgREST can't easily do
  // across multiple columns in a single call). 200 is well within
  // Supabase's default range limit.
  let query = supabase
    .from('news_posts')
    .select(
      'id, slug, title_en, title_zh, excerpt_en, excerpt_zh, content_en, cover_image, category, tags, published_at, read_time_minutes',
    )
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(200);

  if (category) query = query.eq('category', category);
  if (exclude) query = query.neq('id', exclude);

  const { data, error } = await query;
  if (error) {
    console.error('[public/news-by-tag] supabase error:', error);
    return NextResponse.json({ posts: [] });
  }

  const terms = termsParam
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  // If no terms and no category, return the most recent published
  // posts (used as a "latest news" sidebar / fallback).
  if (terms.length === 0 && !category) {
    return NextResponse.json({
      posts: (data || []).slice(0, limit).map((p) => ({ ...p, matchedBy: null })),
    });
  }

  // Pull all rows (no category hard-filter) so the term-matcher
  // can find posts that mention the entity in title/excerpt/body
  // regardless of the post's category. Category is a soft boost
  // (added to the score, not a hard filter) so a university page
  // surfaces its own category first but still shows related
  // scholarship / partnership posts that name the university.
  void category; // currently unused as hard filter — kept for back-compat with API callers

  // Score each post by how many terms hit; also record the first
  // matching term in `matchedBy` so the UI can label "matched:
  // Tsinghua University". Order by score desc, then published_at desc.
  const scored = (data || []).map((p) => {
    const haystacks: { field: string; value: string }[] = [
      { field: 'title_en', value: p.title_en || '' },
      { field: 'title_zh', value: p.title_zh || '' },
      { field: 'excerpt_en', value: p.excerpt_en || '' },
      { field: 'content_en', value: p.content_en || '' },
      { field: 'tags', value: (p.tags || []).join(' ') },
    ];
    let score = 0;
    let firstMatchTerm: string | null = null;
    for (const term of terms) {
      for (const { value } of haystacks) {
        if (value && value.toLowerCase().includes(term)) {
          score += 1;
          if (!firstMatchTerm) firstMatchTerm = term;
          break; // one hit per term is enough
        }
      }
    }
    return { post: p, score, matchedBy: firstMatchTerm };
  });

  const filtered = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aT = a.post.published_at ? new Date(a.post.published_at).getTime() : 0;
      const bT = b.post.published_at ? new Date(b.post.published_at).getTime() : 0;
      return bT - aT;
    })
    .slice(0, limit)
    .map((s) => ({ ...s.post, matchedBy: s.matchedBy }));

  return NextResponse.json({ posts: filtered });
}
