import { Resend } from 'resend';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseServer } from '@/lib/supabase-server';
import { getAIProvider } from '@/lib/ai/provider';
import { buildBlogSystemPrompt, buildBlogUserPrompt } from '@/lib/ai/blog-prompts';
import { extractJsonObject, normalizeBlogPayload } from '@/lib/ai/blog-sanitize';
import { captureAIError } from '@/lib/ai/with-capture';

// ──────────────────────────────────────────────────────────────────────────
// News automation runner
//
// Shared by the cron endpoint (/api/cron/generate-news) and the admin
// "Run now" button. Both call runGenerateNews() with a RunArgs object
// and get back a typed RunResult; the caller wraps it in whatever
// response shape the consumer expects.
//
// Default: 5 short posts per run. The runner:
//
//   1. Atomically claims up to N pending topics (FIFO + priority desc).
//      Sets status='generating' so a second concurrent runner can't
//      pick the same row. Stale claims (1h+) are reset to 'pending'.
//   2. Creates a news_automation_runs audit row up front (status='running').
//   3. For each topic: calls the AI provider, normalizes the JSON,
//      inserts a draft news_posts row, links the topic to it.
//      Up to 3 attempts per topic with 1s/2s/4s backoff.
//   4. Finalizes the run with count_done / count_failed / status.
//   5. If EVERY topic failed, emails the admin via Resend.
// ──────────────────────────────────────────────────────────────────────────

const DEFAULT_COUNT = 5;
const MAX_COUNT = 10;
const RETRY_DELAYS_MS = [1_000, 2_000, 4_000] as const; // 3 attempts total
const STALE_CLAIM_MS = 60 * 60 * 1_000; // 1h — a topic stuck in 'generating' for over an hour is considered abandoned

export interface RunArgs {
  count?: number;
  length?: 'short' | 'medium' | 'long';
  topicIds?: string[]; // explicit topic IDs (admin "Run now" with a specific selection)
  triggeredBy?: 'cron' | 'admin' | 'seed';
}

export interface GeneratedPostSummary {
  topicId: string;
  postId: string | null;
  slug: string | null;
  status: 'done' | 'failed';
  error?: string;
  attempts: number;
  durationMs: number;
  topicText: string;
}

export type RunOutcome =
  | { ok: true; run: { id: string; status: 'success' | 'partial' | 'failed'; started_at: string } | null; count_done: number; count_failed: number; posts: GeneratedPostSummary[]; message?: string }
  | { ok: false; error: string; httpStatus: number };

interface TopicRow {
  id: string;
  topic: string;
  category: string;
  language: string;
  tone: string;
  target_keyword: string;
}

export async function runGenerateNews(args: RunArgs): Promise<RunOutcome> {
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
  const length = args.length ?? 'short';
  const triggeredBy = args.triggeredBy ?? 'cron';

  // 1. Pick topics
  const topics = await claimTopics(sb, args.topicIds, count);
  if (topics.length === 0) {
    return {
      ok: true,
      run: null,
      count_done: 0,
      count_failed: 0,
      posts: [],
      message: 'No pending topics in the queue. Add some at /admin/news → Automation.',
    };
  }

  // 2. Create the run audit row up front
  const { data: run, error: runInsertError } = await sb
    .from('news_automation_runs')
    .insert({
      triggered_by: triggeredBy,
      status: 'running',
      count_planned: topics.length,
      count_done: 0,
      count_failed: 0,
      topic_ids: topics.map((t) => t.id),
      failed_topic_ids: [],
    })
    .select()
    .single();
  if (runInsertError || !run) {
    await releaseTopics(sb, topics.map((t) => t.id));
    return {
      ok: false,
      error: `Could not create run record: ${runInsertError?.message ?? 'unknown'}`,
      httpStatus: 500,
    };
  }

  // 3. Generate posts sequentially
  const results: GeneratedPostSummary[] = [];
  const failedTopicIds: string[] = [];
  const errorLog: string[] = [];
  for (const topic of topics) {
    const result = await generateOne(sb, provider, topic, length);
    results.push({ ...result, topicText: topic.topic });
    if (result.status === 'failed') {
      failedTopicIds.push(topic.id);
      errorLog.push(`[${topic.id}] ${topic.topic.slice(0, 80)}: ${result.error ?? 'unknown'}`);
    }
  }

  // 4. Finalize
  const countDone = results.filter((r) => r.status === 'done').length;
  const countFailed = results.filter((r) => r.status === 'failed').length;
  const runStatus: 'success' | 'partial' | 'failed' =
    countFailed === 0 ? 'success' : countDone === 0 ? 'failed' : 'partial';

  await sb
    .from('news_automation_runs')
    .update({
      status: runStatus,
      count_done: countDone,
      count_failed: countFailed,
      failed_topic_ids: failedTopicIds,
      finished_at: new Date().toISOString(),
      error_log: errorLog.join('\n').slice(0, 32_000) || null,
    })
    .eq('id', run.id);

  // 5. Email admin on persistent failure
  if (runStatus === 'failed') {
    await notifyAdminOfFailure({
      topicCount: topics.length,
      runId: run.id,
      errorLog: errorLog.join('\n').slice(0, 4_000),
    });
  }

  return {
    ok: true,
    run: { id: run.id, status: runStatus, started_at: run.started_at },
    count_done: countDone,
    count_failed: countFailed,
    posts: results,
  };
}

// ──────────────────────────────────────────────────────────────────────────
// Internals
// ──────────────────────────────────────────────────────────────────────────

/**
 * Atomically claim N pending topics. Stale 'generating' claims
 * (1h+ old) are reset to 'pending' first so a previous crashed
 * runner can't lock topics forever.
 *
 * If `explicitIds` is given, claim exactly those (admin "Run now"
 * with a specific selection). Otherwise pick the top-N by priority
 * desc + FIFO created_at.
 *
 * Two-step claim (SELECT then UPDATE-WHERE-IN) rather than
 * UPDATE...ORDER BY...LIMIT: the single-step version goes through
 * PostgREST's UPDATE planner which sometimes lags behind the
 * SELECT planner when the schema cache is cold. The two-step
 * pattern is bulletproof and the SELECT-then-UPDATE is racy in
 * theory but we have a 1h stale-recovery on the UPDATE side, so
 * any double-claim is self-healing.
 */
async function claimTopics(
  sb: SupabaseClient,
  explicitIds: string[] | undefined,
  count: number,
): Promise<TopicRow[]> {
  const staleIso = new Date(Date.now() - STALE_CLAIM_MS).toISOString();
  await sb
    .from('news_automation_topics')
    .update({ status: 'pending' })
    .eq('status', 'generating')
    .lt('updated_at', staleIso);

  if (explicitIds && explicitIds.length > 0) {
    const { data, error } = await sb
      .from('news_automation_topics')
      .update({ status: 'generating' })
      .in('id', explicitIds.slice(0, count))
      .eq('status', 'pending')
      .select('id, topic, category, language, tone, target_keyword');
    if (error) {
      console.error('[generate-news] claimTopics error:', error.message);
      return [];
    }
    return (data ?? []) as TopicRow[];
  }

  // Step 1: pick the IDs we want to claim.
  const { data: candidates, error: pickError } = await sb
    .from('news_automation_topics')
    .select('id, topic, category, language, tone, target_keyword, priority, created_at')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(count);
  if (pickError) {
    console.error('[generate-news] claimTopics pick error:', pickError.message);
    return [];
  }
  if (!candidates || candidates.length === 0) return [];

  const ids = candidates.map((c) => c.id);

  // Step 2: claim them. If a parallel runner got there first, the
  // .eq('status', 'pending') filter will skip the row silently and
  // the SELECT below returns the survivors.
  const { data: claimed, error: claimError } = await sb
    .from('news_automation_topics')
    .update({ status: 'generating' })
    .in('id', ids)
    .eq('status', 'pending')
    .select('id, topic, category, language, tone, target_keyword');
  if (claimError) {
    console.error('[generate-news] claimTopics claim error:', claimError.message);
    return [];
  }
  return (claimed ?? []) as TopicRow[];
}

async function releaseTopics(sb: SupabaseClient, topicIds: string[]): Promise<void> {
  if (topicIds.length === 0) return;
  await sb
    .from('news_automation_topics')
    .update({ status: 'pending' })
    .in('id', topicIds);
}

async function generateOne(
  sb: SupabaseClient,
  provider: ReturnType<typeof getAIProvider>,
  topic: TopicRow,
  length: 'short' | 'medium' | 'long',
): Promise<Omit<GeneratedPostSummary, 'topicText'>> {
  const start = Date.now();
  const maxTokens = length === 'long' ? 7000 : length === 'medium' ? 5000 : 3000;
  const language = (['en', 'zh', 'both'] as const).includes(topic.language as 'en' | 'zh' | 'both')
    ? (topic.language as 'en' | 'zh' | 'both')
    : 'en';

  let lastError: string | null = null;
  for (let attempt = 1; attempt <= RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      const result = await provider.chat(
        [
          {
            role: 'system',
            content: buildBlogSystemPrompt({
              category: topic.category,
              length,
              language,
              tone: topic.tone,
              targetKeyword: topic.target_keyword,
            }),
          },
          {
            role: 'user',
            content: buildBlogUserPrompt({
              topic: topic.topic,
              category: topic.category,
              targetKeyword: topic.target_keyword,
            }),
          },
        ],
        { temperature: 0.7, maxTokens },
      );

      const jsonStr = extractJsonObject(result.content);
      if (!jsonStr) {
        throw new Error('Model did not return a JSON object');
      }
      const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
      const payload = normalizeBlogPayload(parsed);

      const finalSlug = await ensureUniqueSlug(sb, payload.slug);

      const { data: post, error: postError } = await sb
        .from('news_posts')
        .insert({
          slug: finalSlug,
          title_en: payload.title_en,
          title_zh: payload.title_zh,
          excerpt_en: payload.excerpt_en,
          excerpt_zh: payload.excerpt_zh,
          content_en: payload.content_en,
          content_zh: payload.content_zh,
          cover_image: null,
          category: payload.category,
          tags: payload.tags,
          status: 'draft',
          published_at: null,
          author: 'SICA Editorial Team',
          read_time_minutes: payload.read_time_minutes,
          ai_prompt: `[auto] category=${topic.category} target_keyword=${topic.target_keyword}`,
          seo_title: payload.seo_title,
          seo_description: payload.seo_description,
          key_takeaways: payload.key_takeaways,
          at_a_glance: payload.at_a_glance,
          faq: payload.faq,
          sources: payload.sources,
        })
        .select('id')
        .single();

      if (postError || !post) {
        throw new Error(`Insert failed: ${postError?.message ?? 'unknown'}`);
      }

      await sb
        .from('news_automation_topics')
        .update({
          status: 'done',
          post_id: post.id,
          generated_at: new Date().toISOString(),
          last_error: null,
        })
        .eq('id', topic.id);

      return {
        topicId: topic.id,
        postId: post.id,
        slug: finalSlug,
        status: 'done',
        attempts: attempt,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.error(
        `[generate-news] topic ${topic.id} attempt ${attempt} failed:`,
        lastError,
      );
      // Phase 36: capture per-topic AI failures. Both the admin
      // "Run now" button and the cron endpoint funnel through here,
      // so per-attempt captures land in Sentry regardless of caller.
      // The caller-context (cron vs admin) is captured at the route
      // layer for whole-run failures (e.g. claim loop dead).
      captureAIError('news-automation-runner', err, {
        stage: 'topic-attempt',
        topicId: topic.id,
        topicName: topic.topic,
        attempt,
      });
      if (attempt <= RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt - 1] ?? 0);
      }
    }
  }

  await sb
    .from('news_automation_topics')
    .update({ status: 'failed', last_error: lastError?.slice(0, 2_000) ?? 'unknown' })
    .eq('id', topic.id);

  return {
    topicId: topic.id,
    postId: null,
    slug: null,
    status: 'failed',
    error: lastError ?? 'unknown',
    attempts: RETRY_DELAYS_MS.length + 1,
    durationMs: Date.now() - start,
  };
}

async function ensureUniqueSlug(sb: SupabaseClient, baseSlug: string): Promise<string> {
  let candidate = baseSlug;
  for (let i = 0; i < 3; i++) {
    const { data } = await sb
      .from('news_posts')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (!data) return candidate;
    candidate = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return candidate;
}

async function notifyAdminOfFailure(args: {
  topicCount: number;
  runId: string;
  errorLog: string;
}): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[generate-news] RESEND_API_KEY not set, skipping failure email');
    return;
  }
  const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? 'admin@sica.cn';
  const subject = `[SICA] News automation failed — ${args.topicCount}/${args.topicCount} topics errored`;
  const text = `Run ${args.runId} failed to produce any drafts.

${args.errorLog}

Check /admin/news → Automation to investigate or retry.`;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'SICA <noreply@sica.com.cn>',
      to,
      subject,
      text,
    });
  } catch (err) {
    console.error('[generate-news] failure notification email failed:', err);
  }
}

function clampInt(n: number, min: number, max: number): number {
  const x = Math.floor(Number.isFinite(n) ? n : min);
  return Math.max(min, Math.min(max, x));
}

function sleep(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
