-- ============================================================================
-- 2026-07-11: admission_notices table (Phase 51)
--
-- "Success Stories" / "Success Proof" — public showcase of admission
-- notices from SICA students. Each row is one watermarked image of
-- a real admission letter (or pre-admission letter) from a Chinese
-- university, with optional metadata (student name, university,
-- program, degree, intake, scholarship, country).
--
-- Why a separate table (not "leads" or "applications"):
--
--   1. These are *post-admission* artifacts — the student already
--      has the notice. None of the existing tables (leads, student
--      applications, partner applications) fit semantically.
--
--   2. The display order is admin-controlled (display_order INT)
--      and the publishing is a boolean toggle (is_published) so
--      admin can curate the showcase without a "draft" workflow.
--
--   3. The image_path is the *public* (watermarked) version, and
--      the original_path is the *private* original. Both live in
--      the same `admission-notices` bucket — `public/` is bucket-
--      public, `originals/` is admin-only via RLS-friendly
--      policies. We keep originals so the watermark can be re-
--      rendered when the brand changes (Phase 51 design call).
--
--   4. Sensitive PII (full student name, passport numbers visible
--      in the image) is intentional — the user explicitly asked
--      to display real admission notices as "Success Proof".
--      The watermark obscures passport numbers and other identity
--      fields in the rendered image. The student_name column is
--      for the card label, not for re-use.
--
-- RLS:
--   - Public: SELECT WHERE is_published = TRUE (the public showcase
--     page only sees published entries)
--   - Admin: ALL (CRUD + toggle is_published + change display_order)
--
-- Idempotent: all CREATE statements use IF NOT EXISTS.
-- ============================================================================

CREATE TABLE IF NOT EXISTS admission_notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Display fields
  student_name TEXT NOT NULL,
  university_name TEXT NOT NULL,
  program TEXT,
  degree TEXT,  -- 'Bachelor' | 'Master' | 'PhD' | 'Language' | 'Pre-University'
  intake TEXT,  -- e.g. 'September 2026'
  scholarship TEXT,  -- e.g. 'Chinese Government Scholarship (CSC)'
  country TEXT,  -- student country, used for filter chips
  -- Storage paths (both relative to the `admission-notices` bucket)
  image_path TEXT NOT NULL,  -- public/... — watermarked, served to public
  original_path TEXT NOT NULL,  -- originals/... — admin-only
  -- Admin controls
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,  -- higher = shown first
  -- Audit
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hot-path indexes:
--   - public list: published, ordered by display_order then created_at
--   - filter by country (filter chip)
--   - filter by degree (filter chip)
CREATE INDEX IF NOT EXISTS idx_admission_notices_published
  ON admission_notices(is_published, display_order DESC, created_at DESC)
  WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_admission_notices_country
  ON admission_notices(country)
  WHERE country IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admission_notices_degree
  ON admission_notices(degree)
  WHERE degree IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_admission_notices_created
  ON admission_notices(created_at DESC);

COMMENT ON TABLE admission_notices IS
  'Public showcase of SICA student admission notices. Each row is a '
  'watermarked image of a real admission letter with optional metadata. '
  'The image_path is the public/watermarked file; original_path is the '
  'private original kept for re-watermarking.';
COMMENT ON COLUMN admission_notices.image_path IS
  'Path to the watermarked image in the `admission-notices` bucket '
  'under the `public/` folder. Served via the bucket''s public URL.';
COMMENT ON COLUMN admission_notices.original_path IS
  'Path to the original (pre-watermark) image in the `admission-notices` '
  'bucket under the `originals/` folder. Admin-only via RLS + storage '
  'policy. Retained so the watermark can be re-rendered when the brand '
  'changes.';
COMMENT ON COLUMN admission_notices.is_published IS
  'TRUE = visible on the public /success-stories page. FALSE = hidden '
  'but kept in the admin list for review.';
COMMENT ON COLUMN admission_notices.display_order IS
  'Manual sort key. Higher numbers appear first. Use multiples of 10 '
  '(10, 20, 30) so admins can insert entries between existing ones '
  'without renumbering.';

-- ----------------------------------------------------------------------------
-- updated_at trigger — reuses the update_updated_at_column() function.
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_admission_notices_updated_at
  ON admission_notices;
CREATE TRIGGER update_admission_notices_updated_at
  BEFORE UPDATE ON admission_notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
ALTER TABLE admission_notices ENABLE ROW LEVEL SECURITY;

-- Public read: only published entries.
DROP POLICY IF EXISTS "Public can view published admission notices"
  ON admission_notices;
CREATE POLICY "Public can view published admission notices"
  ON admission_notices FOR SELECT
  USING (is_published = TRUE);

-- Admin all: full CRUD via the is_admin() SECURITY DEFINER helper
-- from migration-supabase-cloud.sql.
DROP POLICY IF EXISTS "Admins can manage admission notices"
  ON admission_notices;
CREATE POLICY "Admins can manage admission notices"
  ON admission_notices FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
