import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

const ALLOWED_CATEGORIES = new Set([
  'scholarship',
  'university',
  'guide',
  'event',
  'announcement',
  'partnership',
]);
const ALLOWED_LANGUAGES = new Set(['en', 'zh', 'both']);
const ALLOWED_TONES = new Set([
  'informational',
  'instructional',
  'analytical',
  'celebratory',
  'urgent',
]);

/**
 * /api/admin/news/automation/topics
 *
 * POST — add a new topic to the queue. Admin-only.
 *
 * Body: { topic, category?, language?, tone?, target_keyword?, priority? }
 *   - topic: 3-200 chars
 *   - category: one of ALLOWED_CATEGORIES (default 'announcement')
 *   - language: 'en' | 'zh' | 'both' (default 'en')
 *   - tone: one of ALLOWED_TONES (default 'informational')
 *   - target_keyword: optional SEO keyword (0-200 chars)
 *   - priority: integer -10..10 (default 0; higher = picked first)
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const topic = typeof body.topic === 'string' ? body.topic.trim() : '';
  if (topic.length < 3 || topic.length > 200) {
    return NextResponse.json({ error: 'topic must be 3-200 characters' }, { status: 400 });
  }

  const category = typeof body.category === 'string' && body.category.trim()
    ? body.category.trim()
    : 'announcement';
  if (!ALLOWED_CATEGORIES.has(category)) {
    return NextResponse.json(
      { error: `category must be one of: ${[...ALLOWED_CATEGORIES].join(', ')}` },
      { status: 400 },
    );
  }

  const language = typeof body.language === 'string' && body.language.trim()
    ? body.language.trim()
    : 'en';
  if (!ALLOWED_LANGUAGES.has(language)) {
    return NextResponse.json(
      { error: `language must be one of: ${[...ALLOWED_LANGUAGES].join(', ')}` },
      { status: 400 },
    );
  }

  const tone = typeof body.tone === 'string' && body.tone.trim()
    ? body.tone.trim()
    : 'informational';
  if (!ALLOWED_TONES.has(tone)) {
    return NextResponse.json(
      { error: `tone must be one of: ${[...ALLOWED_TONES].join(', ')}` },
      { status: 400 },
    );
  }

  const target_keyword = typeof body.target_keyword === 'string'
    ? body.target_keyword.trim().slice(0, 200)
    : '';

  const priorityRaw = Number(body.priority ?? 0);
  const priority = Number.isFinite(priorityRaw) ? Math.max(-10, Math.min(10, Math.floor(priorityRaw))) : 0;

  const { data, error } = await supabaseServer
    .from('news_automation_topics')
    .insert({ topic, category, language, tone, target_keyword, priority })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ topic: data }, { status: 201 });
}
