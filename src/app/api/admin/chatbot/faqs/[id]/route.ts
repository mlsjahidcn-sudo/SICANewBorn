import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';
import { FAQ_CATEGORIES } from '@/lib/ai/faq-sanitize';
import { invalidateFaqCache } from '@/lib/ai/faq-context';

export const dynamic = 'force-dynamic';

/**
 * /api/admin/chatbot/faqs/[id]  (Phase 121)
 *
 * PATCH  — edit question/answer/category/priority/language and/or
 *          move status: draft→active (approve), active→retired,
 *          retired→active (re-activate), active→draft (unpublish
 *          for rework). Only 'active' rows are served to the bot.
 * DELETE — hard delete. AI-generated rows keep their queue item's
 *          'done' status — the audit trail lives in chatbot_faq_runs.
 *
 * Every successful write invalidates the chatbot's 5-min FAQ cache.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const update: Record<string, unknown> = {};
  if (typeof body.question === 'string') {
    const question = body.question.trim().slice(0, 500);
    if (!question) return NextResponse.json({ error: 'question cannot be empty' }, { status: 400 });
    update.question = question;
  }
  if (typeof body.answer === 'string') {
    const answer = body.answer.trim().slice(0, 4_000);
    if (!answer) return NextResponse.json({ error: 'answer cannot be empty' }, { status: 400 });
    update.answer = answer;
  }
  if (typeof body.category === 'string') {
    if (!(FAQ_CATEGORIES as string[]).includes(body.category)) {
      return NextResponse.json(
        { error: `category must be one of: ${FAQ_CATEGORIES.join(', ')}` },
        { status: 400 },
      );
    }
    update.category = body.category;
  }
  if (body.status !== undefined) {
    if (typeof body.status !== 'string' || !['draft', 'active', 'retired'].includes(body.status)) {
      return NextResponse.json({ error: "status must be 'draft', 'active' or 'retired'" }, { status: 400 });
    }
    update.status = body.status;
  }
  if (body.language !== undefined) {
    update.language = body.language === 'zh' ? 'zh' : 'en';
  }
  if (body.priority !== undefined) {
    const priorityRaw = Number(body.priority);
    if (!Number.isFinite(priorityRaw)) {
      return NextResponse.json({ error: 'priority must be a number' }, { status: 400 });
    }
    update.priority = Math.max(-100, Math.min(100, Math.floor(priorityRaw)));
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No editable fields provided' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('chatbot_faqs')
    .update(update)
    .eq('id', id)
    .select('id, question, answer, category, language, status, source, queue_item_id, priority, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'FAQ not found' }, { status: 404 });
  }

  invalidateFaqCache();
  return NextResponse.json({ faq: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  if (!isSupabaseServerConfigured() || !supabaseServer) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
  }

  const { id } = await params;
  const { data, error } = await supabaseServer
    .from('chatbot_faqs')
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? 'FAQ not found' }, { status: 404 });
  }

  invalidateFaqCache();
  return NextResponse.json({ success: true });
}
