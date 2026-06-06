import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase-auth';
import { runGenerateNews } from '@/lib/ai/news-automation-runner';

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
    return NextResponse.json({ error: result.error }, { status: result.httpStatus });
  }
  return NextResponse.json(result);
}
