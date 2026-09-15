import { NextRequest, NextResponse } from 'next/server';
import { runGenerateNews, RunArgs } from '@/lib/ai/news-automation-runner';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes — the longest run can take ~3 minutes (5 topics × ~30s AI call each)

// ──────────────────────────────────────────────────────────────────────────
// /api/cron/generate-news
//
// Daily AI-news job. Picks the top-N pending topics, calls the AI,
// inserts drafts, audit-logs the run. Admin reviews drafts in
// /admin/news and clicks Publish.
//
// Auth: shared secret in the x-cron-secret header (timing-safe compare
// via src/lib/cron-auth.ts). If NEWS_CRON_SECRET is not set, the
// endpoint fails CLOSED in production (503) and stays dev-friendly
// (open) outside production — see docs/news-automation.md.
//
//   GET  /api/cron/generate-news?count=5&length=short
//   POST /api/cron/generate-news   { count?, length?, topicIds? }
//
// The actual work lives in src/lib/ai/news-automation-runner.ts
// so the admin "Run now" button can call the same code with
// admin auth instead of cron auth.
// ──────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  return runWithCronAuth(request, { triggeredBy: 'cron' });
}

export async function POST(request: NextRequest) {
  return runWithCronAuth(request, { triggeredBy: 'cron' });
}

async function runWithCronAuth(request: NextRequest, base: RunArgs) {
  const cron = verifyCronSecret(request, 'NEWS_CRON_SECRET');
  if (!cron.ok) {
    return NextResponse.json({ error: cron.error }, { status: cron.status });
  }

  let body: RunArgs = { ...base };
  if (request.method === 'POST') {
    try {
      const contentType = request.headers.get('content-type') ?? '';
      if (contentType.includes('application/json')) {
        const parsed = (await request.json()) as RunArgs;
        body = { ...base, ...parsed, triggeredBy: base.triggeredBy };
      } else {
        // Support ?count=5&length=short on POST too
        const url = new URL(request.url);
        const countParam = url.searchParams.get('count');
        const lengthParam = url.searchParams.get('length');
        body = {
          ...base,
          count: countParam ? Number(countParam) : undefined,
          length: (lengthParam as 'short' | 'medium' | 'long' | null) ?? undefined,
        };
      }
    } catch {
      // body is optional
    }
  } else {
    // GET: parse query string
    const url = new URL(request.url);
    const countParam = url.searchParams.get('count');
    const lengthParam = url.searchParams.get('length');
    body = {
      ...base,
      count: countParam ? Number(countParam) : undefined,
      length: (lengthParam as 'short' | 'medium' | 'long' | null) ?? undefined,
    };
  }

  const result = await runGenerateNews(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.httpStatus });
  }
  return NextResponse.json(result);
}
