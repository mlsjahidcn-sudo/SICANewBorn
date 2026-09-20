import { NextRequest, NextResponse } from 'next/server';
import { runChatbotFaqGeneration, purgeExpiredChatHistory, FaqRunArgs } from '@/lib/ai/faq-automation-runner';
import { verifyCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes — 5 FAQ drafts × ~15s AI call each, plus the purge

// ──────────────────────────────────────────────────────────────────────────
// /api/cron/chatbot-faqs  (Phase 121)
//
// Daily chatbot maintenance job. Two steps:
//   1. Generate FAQ drafts: picks the top-N pending questions from
//      chatbot_faq_queue (the questions the bot couldn't answer),
//      calls the AI, inserts chatbot_faqs rows as status='draft'.
//      Admin approves them at /admin/chatbot → FAQs before they go
//      live in the bot's RAG context.
//   2. Purge expired chat_history rows (the 7-day TTL the 2026-09-10
//      migration filters on at read time but never deletes).
//
// Schedule: once per day via cron-job.org (same setup as
// /api/cron/generate-news). Auth: shared secret in the x-cron-secret
// header; if FAQ_CRON_SECRET is unset the endpoint fails CLOSED in
// production (503) and stays dev-friendly (open) outside production.
//
//   GET  /api/cron/chatbot-faqs?count=5
//   POST /api/cron/chatbot-faqs   { count?, queueItemIds? }
//
// The actual work lives in src/lib/ai/faq-automation-runner.ts so
// the admin "Generate now" button can call the same code with
// admin auth instead of cron auth.
// ──────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  return runWithCronAuth(request);
}

export async function POST(request: NextRequest) {
  return runWithCronAuth(request);
}

async function runWithCronAuth(request: NextRequest) {
  const cron = verifyCronSecret(request, 'FAQ_CRON_SECRET');
  if (!cron.ok) {
    return NextResponse.json({ error: cron.error }, { status: cron.status });
  }

  const base: FaqRunArgs = { triggeredBy: 'cron' };
  let body: FaqRunArgs = { ...base };
  try {
    if (request.method === 'POST' && (request.headers.get('content-type') ?? '').includes('application/json')) {
      const parsed = (await request.json()) as FaqRunArgs;
      body = { ...base, ...parsed, triggeredBy: 'cron' };
    } else {
      const url = new URL(request.url);
      const countParam = url.searchParams.get('count');
      body = { ...base, count: countParam ? Number(countParam) : undefined };
    }
  } catch {
    // body is optional
  }

  const result = await runChatbotFaqGeneration(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.httpStatus });
  }

  // Purge runs even when the queue was empty — the TTL sweep must
  // not depend on there being generation work today.
  const purgedChatHistory = await purgeExpiredChatHistory();

  return NextResponse.json({ ...result, purgedChatHistory });
}
