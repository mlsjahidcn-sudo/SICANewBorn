-- ============================================================================
-- SICA newsroom — `news_posts` table for the AI-assisted blog at /news.
--
-- AI-generated content lives here, but the AI is only the writer — every
-- post is reviewed and explicitly published by an admin before it goes
-- live (status='published'). Drafts and archives never appear on the
-- public site.
--
-- Bilingual (en + zh) on every field that the user sees. The AI can
-- generate either or both per post.
--
-- Author defaults to "SICA Editorial Team" — same entity that's wired
-- into the global JSON-LD in the root layout, so all post citations
-- attribute to the same author, building the editorial brand over
-- time (E-E-A-T signal for both Google and LLMs).
-- ============================================================================

CREATE TABLE IF NOT EXISTS news_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                VARCHAR(255) UNIQUE NOT NULL,
  title_en            TEXT NOT NULL,
  title_zh            TEXT,
  excerpt_en          TEXT,
  excerpt_zh          TEXT,
  -- Markdown body. Rendered with react-markdown + rehype-sanitize
  -- on the public site. AI-generated content is sanitized before save
  -- to strip dangerous tags (script, on*=, javascript:).
  content_en          TEXT NOT NULL,
  content_zh          TEXT,
  -- Optional hero image (1200x630 recommended for OG cards).
  cover_image         TEXT,
  -- Category taxonomy. Drives the /news index filter and the
  -- "SICA Editorial Team" topic-authority build-out.
  category            VARCHAR(50) DEFAULT 'announcement',
  -- Free-form tags. Surfaced in the post meta and in JSON-LD.
  tags                TEXT[] DEFAULT '{}',
  -- 'draft' (admin-only) | 'published' (public) | 'archived' (hidden).
  status              VARCHAR(20) DEFAULT 'draft',
  published_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Always the SICA Editorial Team — this is the cited author for
  -- every post. Articles + LLMs use this to build the brand entity.
  author              VARCHAR(100) DEFAULT 'SICA Editorial Team',
  -- Approx read time in minutes (computed at save time from word count).
  read_time_minutes   INT,
  -- The prompt that generated this post. Stored for transparency,
  -- reproducibility, and to make "regenerate" a 1-click operation.
  ai_prompt           TEXT,
  -- SEO meta overrides. When null, the public page falls back to
  -- the title_en + first paragraph (truncated to 155 chars).
  seo_title           TEXT,
  seo_description     TEXT
);

-- Hot path: index for the public /news index (newest published first)
-- and the per-category filter. Partial index keeps it small.
CREATE INDEX IF NOT EXISTS news_posts_published_idx
  ON news_posts(published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS news_posts_category_idx
  ON news_posts(category, published_at DESC)
  WHERE status = 'published';

-- Admin list path: all posts (any status), newest first.
CREATE INDEX IF NOT EXISTS news_posts_all_idx
  ON news_posts(updated_at DESC);

-- RLS: posts are publicly readable when published; only admins can
-- write. This mirrors the pattern on other public tables.
ALTER TABLE news_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published news posts are publicly readable"
  ON news_posts FOR SELECT USING (status = 'published');
-- Service-role key bypasses RLS, so admin writes just work without an
-- explicit INSERT/UPDATE policy (only the service role is used by the
-- admin server actions).

-- updated_at auto-bump trigger. The set_updated_at() function was
-- created in database/s9-admin-students.sql; this is idempotent.
DROP TRIGGER IF EXISTS trg_news_posts_updated_at ON news_posts;
CREATE TRIGGER trg_news_posts_updated_at
  BEFORE UPDATE ON news_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
