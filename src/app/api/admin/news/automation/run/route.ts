import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { runGenerateNews } from '@/lib/ai/news-automation-runner';
import { captureAIError } from '@/lib/ai/with-capture';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * /api/admin/news/automation/run
 *
 * POST — trigger a run manually from the admin UI. Admin-only.
 * Returns the same shape as /api/cron/generate-news.
 *
 * Body:
 *   { count?: number (1-10, default 5),
 *     length?: 'short' | 'medium' | 'long' (default 'short'),
 *     topicIds?: string[] (optional explicit list) }
 *
 * This calls the same runGenerateNews() the cron uses, just with
 * triggeredBy='admin' so the run record is tagged accordingly.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  // Phase 36: per-admin rate limit (5/15min). Each run can spawn
  // up to 10 AI generations (~3-5 min total), so this is the
  // tightest practical limit before it starts feeling broken.
  const rl = checkAdminAIRateLimit(auth.user.id, 'run-automation');
  if (rl.blocked) return rl.response;

  let body: { count?: number; length?: 'short' | 'medium' | 'long'; topicIds?: string[] } = {};
  try {
    if (request.headers.get('content-type')?.includes('application/json')) {
      body = (await request.json()) as typeof body;
    }
  } catch {
    // body is optional
  }

  const result = await runGenerateNews({ ...body, triggeredBy: 'admin' });
  if (!result.ok) {
    // Capture whole-run failures (claim loop dead, DB unreachable,
    // etc.) — per-topic failures are captured inside the runner.
    captureAIError('admin-news-automation-run', new Error(result.error ?? 'unknown'), {
      stage: 'run',
      triggeredBy: 'admin',
      count: body.count,
    });
    return NextResponse.json({ error: result.error }, { status: result.httpStatus });
  }
  return NextResponse.json(result);
}
