-- ============================================================================
-- S42 Phase 1.12: Add student_id FK to partner_applications
--
-- The audit found a real data integrity bug: the student-detail
-- page joined partner_applications to partner_students via a soft
-- match on student_name. Two students named "Mohammed Ali" or
-- "Li Wei" get cross-linked applications.
--
-- Fix: add a real student_id column that references
-- partner_students(id). Backfill from the existing soft match,
-- then make it NOT NULL so future inserts must populate it.
-- ============================================================================

-- Step 1: add the column as nullable (so the ALTER doesn't break
-- if there are rows that can't be backfilled).
ALTER TABLE partner_applications
  ADD COLUMN IF NOT EXISTS student_id UUID;

-- Step 2: backfill from the existing partner_students rows by
-- matching student_name within the same partner. The case-
-- insensitive + trim is a best-effort match; rows that don't
-- match any partner_student will be flagged in a follow-up so
-- the partner can re-link them. We're intentionally not
-- forcing a fake match — it's better to leave student_id NULL
-- than to link the wrong student.
UPDATE partner_applications pa
SET student_id = ps.id
FROM partner_students ps
WHERE pa.partner_id = ps.partner_id
  AND LOWER(TRIM(pa.student_name)) = LOWER(TRIM(ps.student_name))
  AND pa.student_id IS NULL;

-- Step 3: surface a count of rows that still have NULL so we can
-- see how many need manual cleanup. The CRITICAL_DEPLOY_CHECK
-- comment makes the count searchable from logs.
DO $$
DECLARE
  null_count INT;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM partner_applications
  WHERE student_id IS NULL;
  RAISE NOTICE 'CRITICAL_DEPLOY_CHECK: partner_applications with NULL student_id = %', null_count;
END $$;

-- Step 4: add the FK constraint + an index. We don't make the
-- column NOT NULL yet because the audit found real-world rows
-- that can't be auto-backfilled. The application layer enforces
-- "must be set on insert/update" so the DB stays consistent for
-- new rows; the existing NULLs get cleaned up over time as
-- partners re-open their cases.
--
-- (Once all backfill gaps are closed, the follow-up migration
-- will: ALTER COLUMN SET NOT NULL.)
ALTER TABLE partner_applications
  ADD CONSTRAINT partner_applications_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES partner_students(id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS partner_applications_student_id_idx
  ON partner_applications (student_id)
  WHERE student_id IS NOT NULL;
