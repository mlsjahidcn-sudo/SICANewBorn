-- PF-2 — programs: queryable numeric facets
--
-- Why this migration exists
--
-- The program finder's filters could only express what the columns were
-- already clean enough for:
--
--   * `tuition` is free text ("CNY 38,000/year (AY 2026-27 rate)",
--     "¥16,000-24,000/year", "CNY 55,000/year single; CNY 70,000/year
--     double") — 1,789 of 2,513 rows have no digits at all, and the
--     rest sort by a string→int parse that breaks on ranges.
--   * `intake` is free text with 13 variants ("September 2027",
--     "September", "September (2026 catalogue)", "Autumn (2026
--     catalogue)", "Spring, Autumn (2026 catalogue)", …).
--   * `duration` has 28 variants ("4 years", "2-3 years", "2.5 years",
--     "1 semester or 1 academic year", …).
--
-- Free text cannot be filtered or sorted reliably, so this migration
-- adds FIVE derived columns and backfills them from the existing text.
-- The original text columns are untouched — they remain the display
-- value (the detail page shows "CNY 38,000/year (AY 2026-27 rate)",
-- not a bare number).
--
-- The code that reads these columns probes for them first
-- (`hasProgramsNormalizedFacetColumns()` in src/lib/program-query.ts),
-- so the finder works BEFORE and AFTER this migration is applied.
--
-- Idempotent: safe to re-run. The backfill only fills rows where the
-- derived column is still NULL, so a manual correction is never
-- overwritten.
--
-- Apply with: Supabase dashboard → SQL editor → run once.

-- ============================================================
-- 1. Columns
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
-- 3. Backfill
-- ============================================================

-- 3a. Intake season.
--     "September"/"Autumn"/"Fall" → September (they are the same
--     intake; the Chinese autumn term starts in September).
--     "March"/"Spring" → March. Both → Both. Nothing recognisable → Unknown.
UPDATE programs
SET intake_season = CASE
      WHEN intake IS NULL OR btrim(intake) = '' THEN 'Unknown'
      WHEN (lower(intake) LIKE '%september%' OR lower(intake) LIKE '%autumn%' OR lower(intake) LIKE '%fall%')
       AND (lower(intake) LIKE '%march%' OR lower(intake) LIKE '%spring%') THEN 'Both'
      WHEN lower(intake) LIKE '%september%' OR lower(intake) LIKE '%autumn%' OR lower(intake) LIKE '%fall%' THEN 'September'
      WHEN lower(intake) LIKE '%march%' OR lower(intake) LIKE '%spring%' THEN 'March'
      ELSE 'Unknown'
    END
WHERE intake_season IS NULL;

-- 3b. Intake year — the LATEST year mentioned, so
--     "September 2026 or March 2027" becomes 2027 (the next one a
--     student can still apply to).
UPDATE programs p
SET intake_year = (
  SELECT max(m[1]::int)
  FROM regexp_matches(p.intake, '(20[0-9]{2})', 'g') AS m
)
WHERE p.intake_year IS NULL
  AND p.intake IS NOT NULL
  AND p.intake ~ '20[0-9]{2}';

-- 3c. Tuition amount — the FIRST number of the amount string, which is
--     the lower bound for a range ("¥16,000-24,000/year" → 16000).
--     Only rows that name a currency are parsed, so a year in a
--     parenthetical can never be mistaken for a fee.
UPDATE programs p
SET tuition_amount = (
  SELECT (regexp_match(replace(replace(p.tuition, ',', ''), '–', '-'), '[0-9]+(\.[0-9]+)?'))[1]::numeric
)
WHERE p.tuition_amount IS NULL
  AND p.tuition IS NOT NULL
  AND p.tuition ~ '(CNY|RMB|¥)'
  AND p.tuition ~ '[0-9]';

-- 3d. Tuition currency.
UPDATE programs p
SET tuition_currency = CASE
      WHEN p.tuition ~ '(\$|USD)' THEN 'USD'
      WHEN p.tuition ~ '(€|EUR)' THEN 'EUR'
      WHEN p.tuition ~ '(CNY|RMB|¥)' THEN 'CNY'
      ELSE NULL
    END
WHERE p.tuition_currency IS NULL
  AND p.tuition IS NOT NULL;

-- 3e. Duration in years — the first number ("2-3 years" → 2,
--     "2.5 years" → 2.5, "1 semester or 1 academic year" → 1).
UPDATE programs p
SET duration_years = (
  SELECT (regexp_match(replace(p.duration, ',', ''), '[0-9]+(\.[0-9]+)?'))[1]::numeric
)
WHERE p.duration_years IS NULL
  AND p.duration IS NOT NULL
  AND p.duration ~ '[0-9]';

-- ============================================================
-- 4. Indexes (the filters sort/filter on these)
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
  with_intake_season INT;
  with_intake_year INT;
  with_tuition INT;
  with_duration INT;
BEGIN
  SELECT count(*) INTO total FROM programs;
  SELECT count(*) INTO with_intake_season FROM programs WHERE intake_season IS NOT NULL AND intake_season <> 'Unknown';
  SELECT count(*) INTO with_intake_year FROM programs WHERE intake_year IS NOT NULL;
  SELECT count(*) INTO with_tuition FROM programs WHERE tuition_amount IS NOT NULL;
  SELECT count(*) INTO with_duration FROM programs WHERE duration_years IS NOT NULL;
  RAISE NOTICE 'programs facet backfill: % rows total | intake season % | intake year % | tuition % | duration %',
    total, with_intake_season, with_intake_year, with_tuition, with_duration;
END $$;
