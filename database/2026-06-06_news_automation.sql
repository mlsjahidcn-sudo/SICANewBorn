-- ============================================================================
-- S41: News automation — daily batch of AI-generated drafts.
--
-- Two new tables back the workflow:
--   - news_automation_topics: the queue of what to write. Seeded with
--     a handful of evergreen topics; admin can add more from
--     /admin/news → Automation. Each row carries the full input
--     shape (topic, category, language, tone, target_keyword) the
--     AI blog generator needs.
--   - news_automation_runs: the audit log. One row per cron trigger
--     (or admin "Run now" click). status='running' for in-flight,
--     'success' / 'partial' / 'failed' for completed.
--
-- Topics are picked FIFO by priority desc, then created_at asc.
-- Once a topic is generated, its status flips to 'done' and
-- used_at is stamped. New topics get inserted via the admin UI
-- or by an admin-curated seed list. The cron endpoint only ever
-- generates, never deletes topics; lifecycle is admin-controlled.
-- ============================================================================

CREATE TABLE IF NOT EXISTS news_automation_topics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic            TEXT NOT NULL,
  category         VARCHAR(50) DEFAULT 'announcement',
  language         VARCHAR(10) DEFAULT 'en',  -- en | zh | both
  tone             VARCHAR(50) DEFAULT 'informational',
  target_keyword   TEXT DEFAULT '',
  priority         INT NOT NULL DEFAULT 0,   -- higher = picked first
  status           VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | done | skipped | failed
  last_error       TEXT,
  post_id          UUID,  -- FK to news_posts once the AI succeeds
  generated_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index: cron endpoint picks (status='pending') ORDER BY priority desc, created_at asc
CREATE INDEX IF NOT EXISTS news_automation_topics_pending_idx
  ON news_automation_topics (priority DESC, created_at ASC)
  WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS news_automation_runs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'cron' (external scheduler) | 'admin' (manual from the UI)
  -- | 'seed' (initial population run)
  triggered_by     VARCHAR(20) NOT NULL DEFAULT 'cron',
  -- 'running' | 'success' | 'partial' (some topics failed) | 'failed' (all failed)
  status           VARCHAR(20) NOT NULL DEFAULT 'running',
  count_planned    INT NOT NULL DEFAULT 5,
  count_done       INT NOT NULL DEFAULT 0,
  count_failed     INT NOT NULL DEFAULT 0,
  -- Selected topic IDs (so re-rendering the run detail is trivial)
  topic_ids        UUID[] DEFAULT '{}',
  -- Failed topic IDs (subset of topic_ids) for quick debugging
  failed_topic_ids UUID[] DEFAULT '{}',
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at      TIMESTAMPTZ,
  -- Free-form error log (capped at ~32KB by the app layer)
  error_log        TEXT
);

CREATE INDEX IF NOT EXISTS news_automation_runs_recent_idx
  ON news_automation_runs (started_at DESC);

-- updated_at auto-bump trigger (idempotent — reuses the function
-- created in s9-admin-students.sql).
DROP TRIGGER IF EXISTS trg_news_automation_topics_updated_at ON news_automation_topics;
CREATE TRIGGER trg_news_automation_topics_updated_at
  BEFORE UPDATE ON news_automation_topics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- Seed: a starter set of evergreen topics so the first cron tick has
-- real work to do. These are the topics the S36 prompt is good at
-- (scholarships, universidad profiles, application guides, partnerships,
-- student-life topics). Admin can remove or reorder from the UI.
-- ============================================================================
INSERT INTO news_automation_topics (topic, category, language, tone, target_keyword, priority) VALUES
  -- Scholarships (priority 10 — pick first)
  ('CSC Scholarship 2026 monthly stipend amounts and what they cover', 'scholarship', 'en', 'informational', 'CSC scholarship stipend 2026', 10),
  ('Confucius Institute Scholarship 2026 application deadlines by country', 'scholarship', 'en', 'instructional', 'Confucius Institute Scholarship 2026', 10),
  ('Provincial government scholarships in China for international students 2026', 'scholarship', 'en', 'analytical', 'provincial scholarships China', 9),
  ('CSC scholarship vs university scholarship: which is better for international students', 'scholarship', 'en', 'analytical', 'CSC vs university scholarship', 9),
  -- Universidad news
  ('Top 10 Chinese universidades for engineering in 2026', 'university', 'en', 'analytical', 'best engineering universities China', 8),
  ('Tsinghua University acceptance rate and how to strengthen your application', 'university', 'en', 'instructional', 'Tsinghua University acceptance rate', 8),
  ('Peking University international programs for 2026 intake', 'university', 'en', 'informational', 'Peking University international programs', 7),
  ('Shanghai Jiao Tong University scholarships for international students 2026', 'university', 'en', 'informational', 'SJTU scholarships 2026', 7),
  -- Study guides
  ('Step-by-step guide to applying to a Chinese university from Africa in 2026', 'guide', 'en', 'instructional', 'apply to Chinese university from Africa', 6),
  ('Cost of living in Beijing for international students in 2026', 'guide', 'en', 'informational', 'cost of living Beijing 2026', 6),
  ('How to write a winning study plan for your Chinese university application', 'guide', 'en', 'instructional', 'study plan Chinese university', 6),
  ('Chinese student visa (X1) application guide for international students', 'guide', 'en', 'instructional', 'X1 visa application China', 5),
  -- Events / announcements
  ('China higher education expo 2026: what international students should know', 'event', 'en', 'informational', 'China higher education expo 2026', 4),
  ('SICA partner spotlight: a new university partnership announcement', 'announcement', 'en', 'celebratory', 'SICA new partnership', 4)
ON CONFLICT DO NOTHING;
