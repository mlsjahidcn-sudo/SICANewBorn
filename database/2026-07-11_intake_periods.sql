-- ============================================================================
-- 2026-07-11: intake_periods table (Phase 48.2.2)
--
-- The partner application form (and the student wizard) used to
-- build the Intended Intake dropdown from a static hardcoded
-- array in src/lib/data.ts (getIntendedIntakes()). Admin-added
-- intake periods (e.g. "2027 Fall") were invisible to partners
-- and students. Phase S25 (per AGENTS.md) was supposed to fix
-- this with a live API, but the migration + API were never
-- actually written. This migration creates the table; the
-- future PRs will add the API endpoint and refactor the form
-- to call it.
--
-- Design:
--
--   1. intake_periods is a public read table (no partner scope)
--      because the catalog is shared across all partners and
--      students. Only admins can INSERT / UPDATE / DELETE.
--
--   2. slug is the canonical identifier (e.g. '2026-fall',
--      '2027-spring'). Used in URLs, application_number
--      generation, and the eventual cohort grouping on the
--      admin dashboard.
--
--   3. label is the human-readable display ("2026 Fall"). May
--      be longer than the slug (e.g. localized for the public
--      site).
--
--   4. is_active controls whether the intake shows up in the
--      student wizard + partner application form. Admins
--      typically flip this to FALSE after the application
--      deadline passes — the cohort still exists for
--      historical reporting, but no new application can pick
--      it.
--
--   5. application_deadline (DATE) — the "last day to apply"
--      cutoff. Used by the future intake-reminder cron
--      (Phase 46's WABPO integration has the surface already;
--      a 30-day countdown is the natural extension).
--
--   6. starts_at + ends_at (DATE) — the actual period. Not
--      strictly required (some intakes are "rolling"), but
--      almost all real intakes have a fixed start. Nullable
--      for the rolling case.
--
-- Idempotent: all CREATE / INSERT statements use IF NOT EXISTS
-- or ON CONFLICT.
-- ============================================================================

CREATE TABLE IF NOT EXISTS intake_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(64) NOT NULL UNIQUE,
  label VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at DATE,
  ends_at DATE,
  application_deadline DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    starts_at IS NULL OR ends_at IS NULL OR starts_at <= ends_at
  ),
  CHECK (
    application_deadline IS NULL OR
    starts_at IS NULL OR
    application_deadline <= starts_at + INTERVAL '14 days'
  )
);

-- Hot-path indexes:
--   - active intakes sorted by application_deadline (the form
--     dropdown's natural order)
--   - by slug (the lookup path the API + cohort grouping use)
CREATE INDEX IF NOT EXISTS idx_intake_periods_active_deadline
  ON intake_periods(application_deadline ASC NULLS LAST, starts_at ASC)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_intake_periods_slug
  ON intake_periods(slug);

COMMENT ON TABLE intake_periods IS
  'Catalog of available intake periods. Admin-managed. Replaces the '
  'hardcoded getIntendedIntakes() in src/lib/data.ts.';
COMMENT ON COLUMN intake_periods.slug IS
  'Canonical identifier (e.g. "2026-fall"). Unique. Used in URLs, '
  'application_number generation, and the cohort grouping on the '
  'admin dashboard.';
COMMENT ON COLUMN intake_periods.label IS
  'Human-readable display name (e.g. "2026 Fall"). May be localized '
  'in a future migration if the public site needs Chinese labels.';
COMMENT ON COLUMN intake_periods.is_active IS
  'TRUE = shows up in the student wizard + partner application form '
  'Intended Intake dropdown. FALSE = historical only.';
COMMENT ON COLUMN intake_periods.application_deadline IS
  'Last day a new application can pick this intake. Used by the '
  'future intake-reminder cron (Phase 46 WABPO surface).';
COMMENT ON COLUMN intake_periods.starts_at IS
  'When classes begin. NULL for rolling intakes.';
COMMENT ON COLUMN intake_periods.ends_at IS
  'When classes end. NULL for rolling intakes.';

-- ----------------------------------------------------------------------------
-- updated_at trigger — reuses update_updated_at_column().
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_intake_periods_updated_at
  ON intake_periods;
CREATE TRIGGER update_intake_periods_updated_at
  BEFORE UPDATE ON intake_periods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- Seed: migrate the existing hardcoded getIntendedIntakes() values
-- from src/lib/data.ts into the new table. The form's static array
-- was a 4-year window (current_year, current_year+1, +2, +3) for
-- both Fall and Spring. The exact years depend on the clock at
-- migration time, so we use a DO block with a parameterized seed
-- instead of hardcoding 2026/2027/2028/2029.
--
-- After this migration the partner form will still use the
-- static array (the form refactor is a follow-up PR); the
-- seed just gets the data into the table so the future
-- /api/intakes endpoint has something to return.
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  current_year INT := EXTRACT(YEAR FROM NOW())::INT;
  intake_year INT;
BEGIN
  FOR i IN 0..3 LOOP
    intake_year := current_year + i;
    -- Fall
    INSERT INTO intake_periods (slug, label, is_active, starts_at, ends_at, application_deadline)
    VALUES (
      intake_year || '-fall',
      intake_year || ' Fall',
      TRUE,
      (intake_year || '-09-01')::DATE,
      (intake_year || '-12-20')::DATE,
      (intake_year || '-07-31')::DATE
    )
    ON CONFLICT (slug) DO NOTHING;
    -- Spring
    INSERT INTO intake_periods (slug, label, is_active, starts_at, ends_at, application_deadline)
    VALUES (
      (intake_year + 1) || '-spring',
      (intake_year + 1) || ' Spring',
      TRUE,
      ((intake_year + 1) || '-02-15')::DATE,
      ((intake_year + 1) || '-06-30')::DATE,
      ((intake_year + 1) || '-12-15')::DATE
    )
    ON CONFLICT (slug) DO NOTHING;
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
ALTER TABLE intake_periods ENABLE ROW LEVEL SECURITY;

-- Public read: anyone can see active intakes (the dropdown is on
-- the partner application form + student wizard, both of which
-- need to render before auth). Use the is_admin() helper for
-- the admin write path; for SELECT we don't gate on auth at all.
DROP POLICY IF EXISTS "Public can view active intakes"
  ON intake_periods;
CREATE POLICY "Public can view active intakes"
  ON intake_periods FOR SELECT
  USING (is_active = TRUE);

-- Admins can do everything (read all rows, even inactive ones,
-- so the admin intake manager page can show historical entries).
DROP POLICY IF EXISTS "Admins can manage intakes"
  ON intake_periods;
CREATE POLICY "Admins can manage intakes"
  ON intake_periods FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
