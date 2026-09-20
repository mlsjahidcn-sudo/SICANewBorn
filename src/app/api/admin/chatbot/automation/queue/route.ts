import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { isQueueWorthyQuestion, normalizeQueueQuestion } from '@/lib/ai/faq-sanitize';

export const dynamic = 'force-dynamic';

/**
 * /api/admin/chatbot/automation/queue  (Phase 121)
 *
 * POST   — hand-add a question to the mined-question queue
 *          (source='manual'). Deduped on question_norm like the
 *          auto-ingested rows: an existing question 409s so the
 *          admin knows it's already queued.
 * DELETE /queue/[id] — remove a queue item; 409 while 'generating'
 *          (same guard as the news topic delete).
 */

const ALLOWED_SOURCES = ['fallback', 'zero_match', 'manual'] as const;

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
  if (!question) {
    return NextResponse.json({ error: 'question is required' }, { status: 400 });
  }
  if (!isQueueWorthyQuestion(question)) {
    return NextResponse.json(
      { error: 'Question too short or looks like a greeting' },
      { status: 400 },
    );
  }

  const context = typeof body.context === 'string' ? body.context.trim().slice(0, 2_000) || null : null;
  const language = body.language === 'zh' ? 'zh' : 'en';
  const source =
    typeof body.source === 'string' && (ALLOWED_SOURCES as readonly string[]).includes(body.source)
      ? body.source
      : 'manual';
  const priorityRaw = Number(body.priority ?? 0);
  const priority = Number.isFinite(priorityRaw) ? Math.max(-100, Math.min(100, Math.floor(priorityRaw))) : 0;

  const questionNorm = normalizeQueueQuestion(question);

  const { data, error } = await supabaseServer
    .from('chatbot_faq_queue')
    .insert({ question, question_norm: questionNorm, context, language, source, priority })
    .select('id, question, source, status, hit_count, priority, created_at')
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'This question is already in the queue' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ item: data }, { status: 201 });
}
