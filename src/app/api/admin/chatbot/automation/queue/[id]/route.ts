import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { requireAdmin } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';

/**
 * DELETE /api/admin/chatbot/automation/queue/[id]  (Phase 121)
 *
 * Remove a question from the chatbot FAQ queue. 404 if missing,
 * 409 while status='generating' (a runner is holding it — same
 * guard as the news topic delete). Audit history survives in
 * chatbot_faq_runs.
 */
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

  const { data: existing, error: fetchError } = await supabaseServer
    .from('chatbot_faq_queue')
    .select('id, status')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });
  }
  if (existing.status === 'generating') {
    return NextResponse.json(
      { error: 'This question is being generated right now — wait for the run to finish' },
      { status: 409 },
    );
  }

  const { error } = await supabaseServer.from('chatbot_faq_queue').delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
