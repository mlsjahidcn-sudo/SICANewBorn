-- ============================================================================
-- S36: SEO + AEO + GEO optimization columns for `news_posts`.
--
-- AI-generated posts now carry structured fields beyond the markdown body:
--   - `faq`             — Q&A pairs for FAQPage JSON-LD (AEO)
--   - `key_takeaways`   — TL;DR bullets surfaced as a top-of-post box (AEO)
--   - `at_a_glance`     — 2-column key/value fact table for entity cards (GEO)
--   - `sources`         — public-source URLs surfaced as a "Sources" footer (GEO)
--
-- All four are stored as JSONB (not text[]) so we keep ordered/structured
-- payloads. NULLs are fine — the AI is allowed to omit a field and the
-- public page degrades gracefully (just hides the corresponding block).
--
-- These power:
--   - FAQPage JSON-LD on the public /news/[slug] page (Google rich result)
--   - The "at-a-glance" table that LLMs (ChatGPT/Perplexity/Claude) love
--     to pull from when composing an answer
--   - Visible TL;DR box and "Sources" footer (E-E-A-T signal)
-- ============================================================================

ALTER TABLE news_posts
  ADD COLUMN IF NOT EXISTS faq              JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS key_takeaways    JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS at_a_glance      JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS sources          JSONB DEFAULT NULL;

-- GIN index on `faq` to support future "show all FAQs across posts" queries.
-- (We don't query it today, but it's cheap to add while we're here.)
CREATE INDEX IF NOT EXISTS news_posts_faq_gin_idx
  ON news_posts USING GIN (faq)
  WHERE faq IS NOT NULL;

-- Comments for posterity (and the next dev to read this).
COMMENT ON COLUMN news_posts.faq IS
  'S36: array of {question, answer} pairs rendered as FAQPage JSON-LD + visible Q&A at the bottom of the post. AEO.';
COMMENT ON COLUMN news_posts.key_takeaways IS
  'S36: array of short strings (3-5 bullets) shown in a TL;DR box at the top of the post. AEO.';
COMMENT ON COLUMN news_posts.at_a_glance IS
  'S36: array of {label, value} pairs rendered as a 2-column fact table. GEO — LLMs pull from these.';
COMMENT ON COLUMN news_posts.sources IS
  'S36: array of {label, url} pairs shown in a "Sources" footer + added to Article JSON-LD as isBasedOn. GEO.';
