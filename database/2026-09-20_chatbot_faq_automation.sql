-- ============================================================================
-- Phase 121: Chatbot self-learning FAQ loop.
--
-- Three new tables back the workflow:
--   - chatbot_faqs: the approved knowledge base that feeds the live
--     chatbot's RAG context (replaces the 10 hardcoded FAQs in
--     src/lib/ai/knowledge.ts). status='draft' rows are AI-generated
--     and awaiting admin review; only status='active' rows are
--     injected into the bot's prompt. 'retired' rows are kept for
--     history but never served.
--   - chatbot_faq_queue: questions the bot couldn't answer well,
--     captured at reply time by /api/ai/chat (rule-based fallback
--     hits and zero-RAG-match questions). question_norm is the
--     dedup key — repeat questions upsert and bump hit_count.
--   - chatbot_faq_runs: audit log, one row per generation run
--     (cron tick or admin "Generate now" click). Mirrors
--     news_automation_runs.
--
-- The FAQ generator (src/lib/ai/faq-automation-runner.ts) claims
-- pending queue items FIFO by priority desc, drafts an answer via
-- the AI provider, and inserts it as status='draft' + source='auto'
-- so an admin must approve it before it goes live.
--
-- Seed: the 10 hardcoded FAQs from src/lib/ai/knowledge.ts are
-- seeded as source='seed' / status='active' so the DB-backed FAQ
-- source is a drop-in replacement from the first run. The unique
-- index on lower(btrim(question)) makes re-running idempotent.
--
-- RLS is enabled with NO policies — all access goes through the
-- service-role client (same convention as the 2026-09-15 RLS
-- migration for email_drips / news_automation_*).
-- ============================================================================

CREATE TABLE IF NOT EXISTS chatbot_faqs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question       TEXT NOT NULL,
  answer         TEXT NOT NULL,
  category       VARCHAR(20) NOT NULL DEFAULT 'general'
                 CHECK (category IN ('general','application','visa','scholarship','life')),
  language       VARCHAR(10) NOT NULL DEFAULT 'en',
  -- 'draft' (AI-generated, awaiting review) | 'active' (served to the bot)
  -- | 'retired' (hidden, kept for history)
  status         VARCHAR(20) NOT NULL DEFAULT 'draft',
  -- 'seed' (migrated from knowledge.ts) | 'manual' (admin-written)
  -- | 'auto' (AI-generated from a queue item)
  source         VARCHAR(20) NOT NULL DEFAULT 'manual',
  -- Provenance link back to the originating queue item (source='auto' only)
  queue_item_id  UUID,
  priority       INT NOT NULL DEFAULT 0,
  last_error     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotent seeding + guards against two admins saving the same question.
CREATE UNIQUE INDEX IF NOT EXISTS chatbot_faqs_question_norm_idx
  ON chatbot_faqs (lower(btrim(question)));

-- RAG injection picks active FAQs, highest priority first.
CREATE INDEX IF NOT EXISTS chatbot_faqs_active_idx
  ON chatbot_faqs (priority DESC, created_at ASC)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS chatbot_faqs_draft_idx
  ON chatbot_faqs (created_at DESC)
  WHERE status = 'draft';

CREATE TABLE IF NOT EXISTS chatbot_faq_queue (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Dedup key: lowercased, trimmed, whitespace-collapsed (app-computed).
  -- Repeat questions upsert and bump hit_count instead of adding rows.
  question_norm  TEXT NOT NULL UNIQUE,
  question       TEXT NOT NULL,
  -- Preceding conversation excerpt so the generator has context
  -- (a few messages before the question, each capped ~300 chars).
  context        TEXT,
  session_token  TEXT,
  -- 'fallback' (rule-based reply served) | 'zero_match' (LLM replied
  -- but no FAQ/catalog/detail matched) | 'manual' (admin-added).
  source         VARCHAR(20) NOT NULL DEFAULT 'fallback',
  language       VARCHAR(10) NOT NULL DEFAULT 'en',
  priority       INT NOT NULL DEFAULT 0,
  hit_count      INT NOT NULL DEFAULT 1,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | generating | done | skipped | failed
  faq_id         UUID,  -- link to the generated chatbot_faqs row once done
  last_error     TEXT,
  generated_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Cron endpoint picks (status='pending') ORDER BY priority desc, created_at asc
CREATE INDEX IF NOT EXISTS chatbot_faq_queue_pending_idx
  ON chatbot_faq_queue (priority DESC, created_at ASC)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS chatbot_faq_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'cron' (external scheduler) | 'admin' (manual from the UI)
  triggered_by     VARCHAR(20) NOT NULL DEFAULT 'cron',
  -- 'running' | 'success' | 'partial' (some items failed) | 'failed' (all failed)
  status           VARCHAR(20) NOT NULL DEFAULT 'running',
  count_planned    INT NOT NULL DEFAULT 5,
  count_done       INT NOT NULL DEFAULT 0,
  count_failed     INT NOT NULL DEFAULT 0,
  queue_item_ids   UUID[] DEFAULT '{}',
  failed_item_ids  UUID[] DEFAULT '{}',
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  -- Free-form error log (capped at ~32KB by the app layer)
  error_log        TEXT
);

CREATE INDEX IF NOT EXISTS chatbot_faq_runs_recent_idx
  ON chatbot_faq_runs (started_at DESC);

-- updated_at auto-bump triggers (idempotent — reuses public.set_updated_at)
DROP TRIGGER IF EXISTS trg_chatbot_faqs_updated_at ON chatbot_faqs;
CREATE TRIGGER trg_chatbot_faqs_updated_at
  BEFORE UPDATE ON chatbot_faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_chatbot_faq_queue_updated_at ON chatbot_faq_queue;
CREATE TRIGGER trg_chatbot_faq_queue_updated_at
  BEFORE UPDATE ON chatbot_faq_queue
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- RLS: enable with no policies — service-role only (admin APIs and the
-- runner all use getSupabaseServer()). Anon/authenticated get nothing.
-- ============================================================================
ALTER TABLE chatbot_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_faq_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_faq_runs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Seed: the 10 hardcoded FAQs from src/lib/ai/knowledge.ts, migrated
-- verbatim so the DB-backed FAQ source is a drop-in replacement.
-- Re-running is a no-op via the unique index + ON CONFLICT DO NOTHING.
-- ============================================================================
INSERT INTO chatbot_faqs (question, answer, category, status, source) VALUES
  ('What is SICA?',
   'SICA (Study in China Academy) is a professional education institution that provides end-to-end support for international students wishing to study in China. We help with university selection, application preparation, visa processing, and post-arrival support.',
   'general', 'active', 'seed'),
  ('How much does it cost to study in China?',
   'Tuition fees in China are very affordable compared to Western countries. Undergraduate programs typically cost ¥20,000-40,000 per year, and graduate programs ¥25,000-50,000 per year. Living expenses are approximately ¥1,500-3,000 per month depending on the city.',
   'general', 'active', 'seed'),
  ('What scholarships are available?',
   'There are several scholarship options: Chinese Government Scholarship (full coverage), university-specific scholarships, Confucius Institute Scholarship, and provincial scholarships. SICA can help you find and apply for suitable scholarships!',
   'scholarship', 'active', 'seed'),
  ('What documents do I need to apply?',
   'Typical required documents: passport copy, academic transcripts, graduation diploma/degree certificate, language proficiency test scores (HSK/TOEFL/IELTS), personal statement, letters of recommendation, and portfolio (for art/design programs).',
   'application', 'active', 'seed'),
  ('How long does the application process take?',
   'The application process typically takes 2-3 months from start to finish. University decisions usually come within 2-8 weeks after application submission. SICA recommends starting 6-9 months before your intended start date.',
   'application', 'active', 'seed'),
  ('What visa do I need?',
   'You need either an X1 visa (for long-term study over 180 days) or X2 visa (for short-term study under 180 days). SICA provides complete guidance through the visa application process.',
   'visa', 'active', 'seed'),
  ('Can I work while studying in China?',
   'International students can work part-time on campus with university approval. Off-campus work generally requires permission from the university and immigration authorities. SICA can provide more details about work regulations.',
   'life', 'active', 'seed'),
  ('What is student life like in China?',
   'Student life in China is vibrant and exciting! Universities have modern facilities, international student communities, and many clubs and activities. You''ll experience rich Chinese culture, make friends from around the world, and have access to amazing food and travel opportunities!',
   'life', 'active', 'seed'),
  ('Do I need to know Chinese to study in China?',
   'Not necessarily! Many universities offer programs taught in English. For Chinese-taught programs, you will need HSK proficiency. SICA can help you find English-taught programs or arrange Chinese language courses before your degree program.',
   'application', 'active', 'seed'),
  ('When should I start my application?',
   'We recommend starting your application 6-9 months before your intended start date. Fall semester (September) applications usually open in January-March, and Spring semester (March) applications usually open in September-November of the previous year.',
   'application', 'active', 'seed')
ON CONFLICT DO NOTHING;
