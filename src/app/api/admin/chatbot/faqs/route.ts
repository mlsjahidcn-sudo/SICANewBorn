import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { FAQ_CATEGORIES } from '@/lib/ai/faq-sanitize';
import { invalidateFaqCache } from '@/lib/ai/faq-context';

export const dynamic = 'force-dynamic';

/**
 * /api/admin/chatbot/faqs  (Phase 121)
 *
 * GET   — list the chatbot FAQ knowledge base.
 *         ?status=draft|active|retired (optional, default: all)
 *         ?search=<substring on question/answer> (optional)
 *         ?limit= (optional, default 200, cap 500)
 * POST  — hand-write a new FAQ. Defaults to status='active' (admin
 *         additions are trusted; only AI-generated rows start as
 *         'draft'). Duplicate questions are rejected with 409.
 *
 * Every successful write invalidates the chatbot's 5-min FAQ cache
 * so the change is live on the next message.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search')?.trim();
  const limitRaw = Number(url.searchParams.get('limit') ?? 200);
  const limit = Math.max(1, Math.min(Number.isFinite(limitRaw) ? limitRaw : 200, 500));

  let query = supabaseServer
    .from('chatbot_faqs')
    .select('id, question, answer, category, language, status, source, queue_item_id, priority, created_at, updated_at')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status && ['draft', 'active', 'retired'].includes(status)) {
    query = query.eq('status', status);
  }
  if (search) {
    query = query.or(`question.ilike.%${search}%,answer.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ faqs: data ?? [] });
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

  const question = typeof body.question === 'string' ? body.question.trim().slice(0, 500) : '';
  const answer = typeof body.answer === 'string' ? body.answer.trim().slice(0, 4_000) : '';
  const category = typeof body.category === 'string' && (FAQ_CATEGORIES as string[]).includes(body.category)
    ? body.category
    : 'general';
  const status = body.status === 'draft' ? 'draft' : 'active';
  const language = body.language === 'zh' ? 'zh' : 'en';
  const priorityRaw = Number(body.priority ?? 0);
  const priority = Number.isFinite(priorityRaw) ? Math.max(-100, Math.min(100, Math.floor(priorityRaw))) : 0;

  if (!question || !answer) {
    return NextResponse.json({ error: 'question and answer are required' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('chatbot_faqs')
    .insert({ question, answer, category, status, language, priority, source: 'manual' })
    .select('id, question, answer, category, language, status, source, queue_item_id, priority, created_at, updated_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'An FAQ with this question already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateFaqCache();
  return NextResponse.json({ faq: data }, { status: 201 });
}
