-- PF-2 (fix) — programs: correct the tuition / duration backfill
--
-- WHY THIS FILE EXISTS
--
-- `database/2026-10-21_program_facets_normalization.sql` was applied on
-- 2026-10-21. Its intake backfills worked, but the tuition and
-- duration backfills silently produced nothing:
--
--   * `tuition_amount`  → 0 rows filled (of 787 rows with a tuition)
--   * `duration_years`  → 14 rows filled, all "2.5 years" rows, and
--                          all of them set to **0.5** instead of 2.5
--
-- The cause is a Postgres `regexp_match` subtlety:
--
--   (regexp_match('4 years', '[0-9]+(\.[0-9]+)?'))[1]  -->  NULL
--   (regexp_match('2.5 years', '[0-9]+(\.[0-9]+)?'))[1] -->  '.5'
--
-- Element [1] of the result array is the CAPTURE GROUP, not the whole
-- match. The pattern's only group is the optional `(\.[0-9]+)?`, so
-- the expression yielded the decimal tail (or NULL) and never the
-- number. NULL then cast to NULL, so the statement "succeeded" and
-- wrote nothing — a silent, wrong backfill.
--
-- The fix uses `substring(... from '[0-9]+[.]?[0-9]*')`, which has no
-- capture group and therefore returns the whole match:
--
--   substring('4 years'        from '[0-9]+[.]?[0-9]*') --> '4'
--   substring('2.5 years'      from '[0-9]+[.]?[0-9]*') --> '2.5'
--   substring('39000-45000'    from '[0-9]+[.]?[0-9]*') --> '39000'
--
-- (verified against PostgreSQL 16 before shipping this file)
--
-- The tuition / duration backfills RE-RUN UNCONDITIONALLY: the two
-- columns are derived from the source text, so recomputing them is
-- safe, idempotent, and repairs the 14 wrong 0.5 values. The intake
-- columns keep their NULL-guard (they were correct).
--
-- Idempotent: safe to run more than once.
--
-- Apply with: Supabase dashboard → SQL editor → run once.

-- ============================================================
-- 1. Columns (already present — kept for a clean-slate run)
-- ============================================================
ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS intake_year SMALLINT,
  ADD COLUMN IF NOT EXISTS intake_season TEXT,
  ADD COLUMN IF NOT EXISTS tuition_amount NUMERIC,
  ADD COLUMN IF NOT EXISTS tuition_currency TEXT,
  ADD COLUMN IF NOT EXISTS duration_years NUMERIC;

-- ============================================================
-- 2. Constraints
-- ============================================================
DO $$
BEGIN
  ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_intake_season_check;
  ALTER TABLE programs
    ADD CONSTRAINT programs_intake_season_check
    CHECK (intake_season IS NULL OR intake_season IN ('September','March','Spring','Autumn','Both','Unknown'));
END $$;

DO $$
BEGIN
  ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_tuition_currency_check;
  ALTER TABLE programs
    ADD CONSTRAINT programs_tuition_currency_check
    CHECK (tuition_currency IS NULL OR tuition_currency IN ('CNY','USD','EUR'));
END $$;

DO $$
BEGIN
  ALTER TABLE programs DROP CONSTRAINT IF EXISTS programs_intake_year_check;
  ALTER TABLE programs
    ADD CONSTRAINT programs_intake_year_check
    CHECK (intake_year IS NULL OR intake_year BETWEEN 2000 AND 2100);
END $$;

-- ============================================================
-- 3. Backfill — tuition + duration (the corrected part)
-- ============================================================

-- 3a. Tuition amount — the FIRST number of the amount string, which is
--     the lower bound for a range ("¥16,000-24,000/year" → 16000).
--     Commas are stripped first so "50,000" reads as 50000 and not 50.
--     NULLIF guards the empty-string → numeric cast.
UPDATE programs
SET tuition_amount = NULLIF(
      substring(replace(COALESCE(tuition, ''), ',', ''), '[0-9]+[.]?[0-9]*'),
      ''
    )::numeric
WHERE tuition ~ '(CNY|RMB|¥)'
  AND tuition ~ '[0-9]';

-- 3b. Tuition currency.
UPDATE programs
SET tuition_currency = CASE
      WHEN tuition ~ '(\$|USD)' THEN 'USD'
      WHEN tuition ~ '(€|EUR)' THEN 'EUR'
      WHEN tuition ~ '(CNY|RMB|¥)' THEN 'CNY'
      ELSE NULL
    END
WHERE tuition IS NOT NULL;

-- 3c. Duration in years — the first number ("2-3 years" → 2,
--     "2.5 years" → 2.5, "1 semester or 1 academic year" → 1).
UPDATE programs
SET duration_years = NULLIF(
      substring(replace(COALESCE(duration, ''), ',', ''), '[0-9]+[.]?[0-9]*'),
      ''
    )::numeric
WHERE duration ~ '[0-9]';

-- ============================================================
-- 4. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_programs_intake_year ON programs (intake_year);
CREATE INDEX IF NOT EXISTS idx_programs_intake_season ON programs (intake_season);
CREATE INDEX IF NOT EXISTS idx_programs_tuition_amount ON programs (tuition_amount);
CREATE INDEX IF NOT EXISTS idx_programs_duration_years ON programs (duration_years);

-- ============================================================
-- 5. Coverage report
-- ============================================================
DO $$
DECLARE
  total INT;
  with_tuition INT;
  with_currency INT;
  with_duration INT;
  with_intake_season INT;
  with_intake_year INT;
BEGIN
  SELECT count(*) INTO total FROM programs;
  SELECT count(*) INTO with_tuition FROM programs WHERE tuition_amount IS NOT NULL;
  SELECT count(*) INTO with_currency FROM programs WHERE tuition_currency IS NOT NULL;
  SELECT count(*) INTO with_duration FROM programs WHERE duration_years IS NOT NULL;
  SELECT count(*) INTO with_intake_season FROM programs WHERE intake_season IS NOT NULL AND intake_season <> 'Unknown';
  SELECT count(*) INTO with_intake_year FROM programs WHERE intake_year IS NOT NULL;
  RAISE NOTICE 'programs facets: % rows | tuition % | currency % | duration % | intake season % | intake year %',
    total, with_tuition, with_currency, with_duration, with_intake_season, with_intake_year;
END $$;
