-- ============================================================================
-- Add university-specific narrative + deadline fields to the universities
-- table. These power the detail-page hero (application deadline countdown)
-- and the Scholarships tab (scholarshipInfo narrative).
--
-- Safe to run on a table with existing data — the new columns are nullable
-- and have no default. Existing rows will simply have NULL until you populate
-- them (e.g. by re-running the AI Generate on each row, or hand-filling
-- via the admin panel).
--
-- IMPORTANT: This ALTER targets the `universities` table (the actual live
-- table in production). A previous version of this migration targeted
-- `universidades` (the Spanish plural) which was a typo — that migration
-- would have created a new empty table with the right columns, leaving
-- the real `universities` table without them. Always run THIS version.
-- ============================================================================

ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS scholarship_info       TEXT,
  ADD COLUMN IF NOT EXISTS scholarship_info_cn   TEXT,
  ADD COLUMN IF NOT EXISTS application_deadline  VARCHAR(100);

-- The university detail page falls back gracefully when application_deadline
-- is NULL (the countdown component renders nothing), so the deploy is
-- safe even before existing rows are backfilled. To backfill, either:
--   (a) re-run AI Generate on the affected rows in the admin panel, or
--   (b) hand-set per row in the admin UI.
--
-- Example manual backfill (run after the migration):
--   UPDATE universities
--     SET application_deadline = '2026-07-15',
--         scholarship_info = 'University-specific narrative here',
--         scholarship_info_cn = '大学特定奖学金说明'
--   WHERE slug = 'tsinghua-university';

-- Cleanup: if a previous version of this migration accidentally created
-- an empty `universidades` table (wrong table name typo), this drops it.
-- Safe even if the table doesn't exist or contains real data (the IF
-- EXISTS check + count guard prevents data loss).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'universidades'
  ) AND NOT EXISTS (
    SELECT 1 FROM universidades LIMIT 1
  ) THEN
    DROP TABLE universidades;
  END IF;
END $$;
