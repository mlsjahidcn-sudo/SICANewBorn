import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * /api/admin/news
 *
 * GET  — list all posts (any status). Admin-only.
 * POST — create a new post. Admin-only.
 *
 * Bodies (POST): { title_en, title_zh?, slug, excerpt_en?, excerpt_zh?,
 *                  content_en, content_zh?, cover_image?, category?,
 *                  tags?, status?: 'draft' | 'published',
 *                  author?, ai_prompt?, seo_title?, seo_description? }
 */
export async function GET(_request: NextRequest) {
  const auth = await requireAdmin(_request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { data, error } = await supabaseServer
    .from('news_posts')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data || [] });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Required fields
  const title_en = (body.title_en as string)?.trim();
  const slug = (body.slug as string)?.trim();
  const content_en = (body.content_en as string)?.trim();
  if (!title_en || !slug || !content_en) {
    return NextResponse.json(
      { error: 'title_en, slug, and content_en are required' },
      { status: 400 },
    );
  }

  // Slug must be unique. We check before insert to give a cleaner error.
  const { data: existing } = await supabaseServer
    .from('news_posts')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: `A post with slug "${slug}" already exists` }, { status: 409 });
  }

  // Compute read time from word count if not provided
  const readTime =
    typeof body.read_time_minutes === 'number'
      ? body.read_time_minutes
      : Math.max(1, Math.round(content_en.split(/\s+/).length / 220));

  const status = body.status === 'published' ? 'published' : 'draft';
  const published_at = status === 'published' ? new Date().toISOString() : null;

  const insertPayload: Record<string, unknown> = {
    slug,
    title_en,
    title_zh: (body.title_zh as string)?.trim() || null,
    excerpt_en: (body.excerpt_en as string)?.trim() || null,
    excerpt_zh: (body.excerpt_zh as string)?.trim() || null,
    content_en,
    content_zh: (body.content_zh as string)?.trim() || null,
    cover_image: (body.cover_image as string)?.trim() || null,
    category: (body.category as string) || 'announcement',
    tags: (body.tags as string[]) || [],
    status,
    published_at,
    author: (body.author as string) || 'SICA Editorial Team',
    read_time_minutes: readTime,
    ai_prompt: (body.ai_prompt as string) || null,
    seo_title: (body.seo_title as string) || null,
    seo_description: (body.seo_description as string) || null,
  };

  const { data, error } = await supabaseServer
    .from('news_posts')
    .insert(insertPayload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ post: data }, { status: 201 });
}
