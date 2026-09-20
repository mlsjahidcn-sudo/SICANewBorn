import { sendTextEmail } from '@/lib/email';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServer, isSupabaseServerConfigured } from '@/lib/supabase-server';
import { getAIProvider } from '@/lib/ai/provider';
import { extractAndNormalizeFaq, isQueueWorthyQuestion, normalizeQueueQuestion } from '@/lib/ai/faq-sanitize';
import { captureAIError } from '@/lib/ai/with-capture';

// ──────────────────────────────────────────────────────────────────────────
// Chatbot FAQ automation runner (Phase 121)
//
// Shared by the cron endpoint (/api/cron/chatbot-faqs) and the admin
// "Generate now" button (/api/admin/chatbot/automation/run). Mirrors
// the S41 news-automation-runner mechanics:
//
//   1. Atomically claims up to N pending chatbot_faq_queue items
//      (priority desc + FIFO). Stale 'generating' claims (1h+) are
//      reset to 'pending'.
//   2. Creates a chatbot_faq_runs audit row up front (status='running').
//   3. For each item: calls the AI provider with the queued question
//      + conversation context, normalizes the JSON answer, inserts a
//      chatbot_faqs row with status='draft' (admin approval gates it
//      live), links the queue item to it. Up to 3 attempts with
//      1s/2s/4s backoff.
//   4. Finalizes the run with count_done / count_failed / status.
//   5. If EVERY item failed, emails the admin via Resend.
//
// Also exports ingestUnansweredQuestion() — the fire-and-forget hook
// /api/ai/chat calls when a visitor question hit the rule-based
// fallback or matched nothing in the RAG stack — and
// purgeExpiredChatHistory() for the cron's chat_history TTL sweep.
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_COUNT = 5;
const MAX_COUNT = 10;
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000] as const; // 3 attempts total
const STALE_CLAIM_MS = 60 * 60 * 1_000; // 1h — a queue item stuck in 'generating' for over an hour is abandoned

export interface FaqRunArgs {
  count?: number;
  queueItemIds?: string[]; // explicit items (admin run with a specific selection)
  triggeredBy?: 'cron' | 'admin';
}

export interface GeneratedFaqSummary {
  queueItemId: string;
  faqId: string | null;
  question: string;
  status: 'done' | 'failed';
  error?: string;
  attempts: number;
  durationMs: number;
}

export type FaqRunOutcome =
  | { ok: true; run: { id: string; status: 'success' | 'partial' | 'failed'; started_at: string } | null; count_done: number; count_failed: number; items: GeneratedFaqSummary[]; message?: string }
  | { ok: false; error: string; httpStatus: number };

interface QueueItemRow {
  id: string;
  question: string;
  context: string | null;
  language: string;
}

export async function runChatbotFaqGeneration(args: FaqRunArgs): Promise<FaqRunOutcome> {
  const provider = getAIProvider();
  if (!provider.isConfigured) {
    return {
      ok: false,
      error: 'AI provider not configured. Set DEEPSEEK_API_KEY or DOUBAO_API_KEY on the server.',
      httpStatus: 503,
    };
  }

  const supabase = getSupabaseServer();
  if (!supabase) {
    return { ok: false, error: 'Database not configured', httpStatus: 503 };
  }
  const sb: SupabaseClient = supabase;

  const count = clampInt(args.count ?? DEFAULT_COUNT, 1, MAX_COUNT);
  const triggeredBy = args.triggeredBy ?? 'cron';

  // 1. Claim queue items. A missing table (migration not applied yet)
  //    surfaces as a claim error → clean 503, not a crash.
  const items = await claimQueueItems(sb, args.queueItemIds, count);
  if (items === null) {
    return { ok: false, error: 'chatbot_faq_queue table is not available (migration applied?)', httpStatus: 500 };
  }
  if (items.length === 0) {
    return {
      ok: true,
      run: null,
      count_done: 0,
      count_failed: 0,
      items: [],
      message: 'No pending questions in the queue. Add some at /admin/chatbot → Automation.',
    };
  }

  // 2. Create the run audit row up front
  const { data: run, error: runInsertError } = await sb
    .from('chatbot_faq_runs')
    .insert({
      triggered_by: triggeredBy,
      status: 'running',
      count_planned: items.length,
      count_done: 0,
      count_failed: 0,
      queue_item_ids: items.map((t) => t.id),
      failed_item_ids: [],
    })
    .select()
    .single();
  if (runInsertError || !run) {
    await releaseQueueItems(sb, items.map((t) => t.id));
    return {
      ok: false,
      error: `Could not create run record: ${runInsertError?.message ?? 'unknown'}`,
      httpStatus: 500,
    };
  }

  // 3. Generate FAQ drafts sequentially
  const results: GeneratedFaqSummary[] = [];
  const failedItemIds: string[] = [];
  const errorLog: string[] = [];
  for (const item of items) {
    const result = await generateOne(sb, provider, item);
    results.push(result);
    if (result.status === 'failed') {
      failedItemIds.push(item.id);
      errorLog.push(`[${item.id}] ${item.question.slice(0, 80)}: ${result.error ?? 'unknown'}`);
    }
  }

  // 4. Finalize
  const countDone = results.filter((r) => r.status === 'done').length;
  const countFailed = results.filter((r) => r.status === 'failed').length;
  const runStatus: 'success' | 'partial' | 'failed' =
    countFailed === 0 ? 'success' : countDone === 0 ? 'failed' : 'partial';

  await sb
    .from('chatbot_faq_runs')
    .update({
      status: runStatus,
      count_done: countDone,
      count_failed: countFailed,
      failed_item_ids: failedItemIds,
      finished_at: new Date().toISOString(),
      error_log: errorLog.join('\n').slice(0, 32_000) || null,
    })
    .eq('id', run.id);

  // 5. Email admin on persistent failure
  if (runStatus === 'failed') {
    await notifyAdminOfFailure({
      itemCount: items.length,
      runId: run.id,
      errorLog: errorLog.join('\n').slice(0, 4_000),
    });
  }

  return {
    ok: true,
    run: { id: run.id, status: runStatus, started_at: run.started_at },
    count_done: countDone,
    count_failed: countFailed,
    items: results,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Unanswered-question ingestion (called from /api/ai/chat, fire-and-forget)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Capture a question the bot couldn't answer well into
 * chatbot_faq_queue. Best-effort by contract: never throws, never
 * blocks the chat response, and logs (doesn't surface) failures.
 *
 * Dedup: repeat questions bump hit_count on the existing row instead
 * of adding a duplicate, so trending questions float up by hit_count
 * × priority when the generator picks work.
 */
export async function ingestUnansweredQuestion(args: {
  question: string;
  source: 'fallback' | 'zero_match';
  /** True when the RAG pass already matched an active FAQ — those questions are answered, skip them. */
  hadFaqMatch?: boolean;
  /** Preceding conversation excerpt (a few messages, app-capped). */
  context?: string;
  sessionToken?: string;
}): Promise<void> {
  try {
    if (args.hadFaqMatch) return;
    if (!isQueueWorthyQuestion(args.question)) return;
    if (!isSupabaseServerConfigured()) return;

    const supabase = getSupabaseServer();
    if (!supabase) return;

    const questionNorm = normalizeQueueQuestion(args.question);
    const context = args.context ? args.context.slice(0, 2_000) : null;
    const sessionToken = args.sessionToken ? args.sessionToken.slice(0, 64) : null;

    // Two-step dedup (SELECT then UPDATE or INSERT) rather than a
    // PostgREST upsert: hit_count must INCREMENT on repeat, which
    // upsert-on-conflict can't express. A concurrent double-insert
    // loses the race only when the same visitor sends the identical
    // question twice in the same instant — acceptable, and the
    // unique constraint turns the loser into a no-op catch below.
    const { data: existing } = await supabase
      .from('chatbot_faq_queue')
      .select('id, hit_count')
      .eq('question_norm', questionNorm)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('chatbot_faq_queue')
        .update({ hit_count: (existing.hit_count ?? 1) + 1 })
        .eq('id', existing.id);
      return;
    }

    const { error: insertError } = await supabase.from('chatbot_faq_queue').insert({
      question_norm: questionNorm,
      question: args.question.trim().slice(0, 500),
      context,
      session_token: sessionToken,
      source: args.source,
    });

    if (insertError) {
      // 23505 = lost the race against a parallel insert for the same
      // normalized question. Bump the winner's hit_count and move on.
      if (insertError.code === '23505') {
        const { data: winner } = await supabase
          .from('chatbot_faq_queue')
          .select('id, hit_count')
          .eq('question_norm', questionNorm)
          .maybeSingle();
        if (winner) {
          await supabase
            .from('chatbot_faq_queue')
            .update({ hit_count: (winner.hit_count ?? 1) + 1 })
            .eq('id', winner.id);
        }
        return;
      }
      // Missing table (pre-migration deploy) is expected noise —
      // don't spam the logs at error level for it.
      console.warn('[faq-automation] ingest insert failed:', insertError.message);
    }
  } catch (err) {
    console.warn('[faq-automation] ingestUnansweredQuestion failed:', err);
  }
}

// ──────────────────────────────────────────────────────────────────────────
// chat_history TTL sweep (Phase 121 ops hygiene)
// ──────────────────────────────────────────────────────────────────────────

/**
 * Delete expired chat_history rows. The 2026-09-10 migration filters
 * on expires_at at read time but never deletes — without this sweep
 * the table grows forever. Called from the daily chatbot-faqs cron.
 * Returns the number of rows removed (0 when Supabase is down —
 * the cron run shouldn't fail wholesale on a purge).
 */
export async function purgeExpiredChatHistory(): Promise<number> {
  if (!isSupabaseServerConfigured()) return 0;
  const supabase = getSupabaseServer();
  if (!supabase) return 0;
  try {
    const { data, error } = await supabase
      .from('chat_history')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');
    if (error) {
      console.warn('[faq-automation] chat_history purge failed:', error.message);
      return 0;
    }
    return data?.length ?? 0;
  } catch (err) {
    console.warn('[faq-automation] chat_history purge threw:', err);
    return 0;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Internals
// ──────────────────────────────────────────────────────────────────────────

/**
 * Atomically claim N pending queue items. Two-step SELECT/UPDATE
 * (per the news runner's schema-cache note) with a 1h stale-claim
 * reset. Returns null only when the table itself is unreadable
 * (pre-migration deploy) so the caller can 503 cleanly.
 */
async function claimQueueItems(
  sb: SupabaseClient,
  explicitIds: string[] | undefined,
  count: number,
): Promise<QueueItemRow[] | null> {
  const staleIso = new Date(Date.now() - STALE_CLAIM_MS).toISOString();
  const { error: staleError } = await sb
    .from('chatbot_faq_queue')
    .update({ status: 'pending' })
    .eq('status', 'generating')
    .lt('updated_at', staleIso);
  if (staleError) {
    console.error('[faq-automation] stale-claim reset failed:', staleError.message);
    return null;
  }

  if (explicitIds && explicitIds.length > 0) {
    const { data, error } = await sb
      .from('chatbot_faq_queue')
      .update({ status: 'generating' })
      .in('id', explicitIds.slice(0, count))
      .eq('status', 'pending')
      .select('id, question, context, language');
    if (error) {
      console.error('[faq-automation] claimQueueItems (explicit) error:', error.message);
      return null;
    }
    return (data ?? []) as QueueItemRow[];
  }

  // Step 1: pick the highest-signal items — trending (hit_count)
  // first, then priority, then FIFO.
  const { data: candidates, error: pickError } = await sb
    .from('chatbot_faq_queue')
    .select('id, question, context, language, hit_count, priority, created_at')
    .eq('status', 'pending')
    .order('hit_count', { ascending: false })
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(count);
  if (pickError) {
    console.error('[faq-automation] claimQueueItems pick error:', pickError.message);
    return null;
  }
  if (!candidates || candidates.length === 0) return [];

  const ids = candidates.map((c) => c.id);

  // Step 2: claim. A parallel runner wins the race silently —
  // the 1h stale-claim reset self-heals any double-claim.
  const { data: claimed, error: claimError } = await sb
    .from('chatbot_faq_queue')
    .update({ status: 'generating' })
    .in('id', ids)
    .eq('status', 'pending')
    .select('id, question, context, language');
  if (claimError) {
    console.error('[faq-automation] claimQueueItems claim error:', claimError.message);
    return null;
  }
  return (claimed ?? []) as QueueItemRow[];
}

async function releaseQueueItems(sb: SupabaseClient, itemIds: string[]): Promise<void> {
  if (itemIds.length === 0) return;
  await sb.from('chatbot_faq_queue').update({ status: 'pending' }).in('id', itemIds);
}

function buildFaqSystemPrompt(language: string): string {
  return `You are the FAQ editor for SICA (Study in China Academy), a service that helps international students apply to Chinese universities.

A student asked the SICA chatbot a question the bot could not answer well. Draft ONE FAQ entry answering it, which a human editor will review before publishing.

Return ONLY a JSON object with exactly these keys:
{"question": "...", "answer": "...", "category": "..."}

Rules:
- "question": a clean, self-contained version of the student's question (fix grammar, expand pronouns using the context).
- "answer": ${language === 'zh' ? 'in Simplified Chinese' : 'in English'}. Markdown allowed (bold, bullet lists). 80-250 words. Direct and helpful.
- "category": exactly one of "general", "application", "visa", "scholarship", "life".
- Be factual about studying in China generally. If the question is about a specific university or program and the context doesn't include its details, answer at the general level and suggest asking a SICA counselor for the specifics.
- Never state fees, deadlines, or policies you are not certain of; recommend confirming with SICA instead.
- Never mention or recommend third-party agencies or platforms (CUCAS, ApplyBoard, China Admissions, or similar). SICA is the only service you may reference.
- Never promise admission, visas, or scholarship outcomes.
- Output the JSON object and nothing else — no code fences, no preamble.`;
}

function buildFaqUserPrompt(item: QueueItemRow): string {
  const context = item.context?.trim()
    ? `Conversation context (messages before the question):\n${item.context}`
    : 'No prior conversation context.';
  return `Student question: ${item.question}\n\n${context}`;
}

async function generateOne(
  sb: SupabaseClient,
  provider: ReturnType<typeof getAIProvider>,
  item: QueueItemRow,
): Promise<GeneratedFaqSummary> {
  const start = Date.now();
  const language = item.language === 'zh' ? 'zh' : 'en';

  let lastError: string | null = null;
  for (let attempt = 1; attempt <= RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      const result = await provider.chat(
        [
          { role: 'system', content: buildFaqSystemPrompt(language) },
          { role: 'user', content: buildFaqUserPrompt(item) },
        ],
        { temperature: 0.5, maxTokens: 1_200 },
      );

      const payload = extractAndNormalizeFaq(result.content);
      if (!payload) {
        throw new Error('Model did not return a usable FAQ JSON object');
      }

      const faqId = await insertFaqDraft(sb, payload, item);
      if (faqId === null) {
        throw new Error('FAQ insert failed (duplicate lookup also failed)');
      }

      await sb
        .from('chatbot_faq_queue')
        .update({
          status: 'done',
          faq_id: faqId,
          generated_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', item.id);

      return {
        queueItemId: item.id,
        faqId,
        question: payload.question,
        status: 'done',
        attempts: attempt,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(`[faq-automation] queue item ${item.id} attempt ${attempt} failed:`, lastError);
      captureAIError('faq-automation-runner', err, {
        stage: 'item-attempt',
        queueItemId: item.id,
        question: item.question,
        attempt,
      });
      if (attempt <= RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 0);
      }
    }
  }

  await sb
    .from('chatbot_faq_queue')
    .update({ status: 'failed', last_error: lastError?.slice(0, 2_000) ?? 'unknown' })
    .eq('id', item.id);

  return {
    queueItemId: item.id,
    faqId: null,
    question: item.question,
    status: 'failed',
    error: lastError ?? 'unknown',
    attempts: RETRY_DELAYS_MS.length + 1,
    durationMs: Date.now() - start,
  };
}

/**
 * Insert the draft chatbot_faqs row. The unique index on
 * lower(btrim(question)) can collide with a seed/manual FAQ when the
 * generator cleans up the phrasing into an existing question — in
 * that case link the queue item to the EXISTING row instead of
 * failing, so the admin sees "already covered" rather than an error.
 * Returns null only when both the insert and the collision lookup fail.
 */
async function insertFaqDraft(
  sb: SupabaseClient,
  payload: { question: string; answer: string; category: string },
  item: QueueItemRow,
): Promise<string | null> {
  const { data: faq, error: faqError } = await sb
    .from('chatbot_faqs')
    .insert({
      question: payload.question,
      answer: payload.answer,
      category: payload.category,
      language: item.language === 'zh' ? 'zh' : 'en',
      status: 'draft',
      source: 'auto',
      queue_item_id: item.id,
    })
    .select('id')
    .single();

  if (!faqError && faq) return faq.id as string;

  if (faqError && faqError.code === '23505') {
    const { data: existing } = await sb
      .from('chatbot_faqs')
      .select('id')
      .ilike('question', payload.question.trim())
      .limit(1)
      .maybeSingle();
    if (existing) return existing.id as string;
  }

  console.error('[faq-automation] FAQ insert failed:', faqError?.message ?? 'unknown');
  return null;
}

async function notifyAdminOfFailure(args: {
  itemCount: number;
  runId: string;
  errorLog: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[faq-automation] RESEND_API_KEY not set, skipping failure email');
    return;
  }
  const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? 'admin@sica.cn';
  const subject = `[SICA] Chatbot FAQ automation failed — ${args.itemCount}/${args.itemCount} queue items errored`;
  const text = `Run ${args.runId} failed to produce any FAQ drafts.

${args.errorLog}

Check /admin/chatbot → Automation to investigate or retry.`;
  try {
    await sendTextEmail({ to, subject, text });
  } catch (err) {
    console.error('[faq-automation] failure notification email failed:', err);
  }
}

function clampInt(n: number, min: number, max: number): number {
  const x = Math.floor(Number.isFinite(n) ? n : min);
  return Math.max(min, Math.min(max, x));
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
