import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';
import { runChatbotFaqGeneration } from '@/lib/ai/faq-automation-runner';
import { captureAIError } from '@/lib/ai/with-capture';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * POST /api/admin/chatbot/automation/run  (Phase 121)
 *
 * Admin "Generate now" — same runner the cron uses, with admin auth
 * and a per-admin rate limit (5 runs / 15 min, shared budget style
 * with the news automation). Body: { count?, queueItemIds? }.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const rl = checkAdminAIRateLimit(auth.user.id, 'run-faq-automation');
  if (rl.blocked) return rl.response;

  let body: { count?: number; queueItemIds?: string[] } = {};
  try {
    if ((request.headers.get('content-type') ?? '').includes('application/json')) {
      body = (await request.json()) as { count?: number; queueItemIds?: string[] };
    }
  } catch {
    // body is optional
  }

  try {
    const result = await runChatbotFaqGeneration({ ...body, triggeredBy: 'admin' });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.httpStatus });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error('[admin-faq-automation-run] unexpected failure:', error);
    captureAIError('admin-faq-automation-run', error, { stage: 'run' });
    return NextResponse.json({ error: 'FAQ generation run failed unexpectedly' }, { status: 500 });
  }
}
