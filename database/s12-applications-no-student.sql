-- s12-applications-no-student.sql
-- SICA Sprint 12: allow admin to create applications without a student account.
--
-- Business rule change: an admin (or a partner) can now add an application
-- for a "lead" — someone who hasn't signed up yet. The application stores
-- the contact details (applicant_name/email/phone/nationality) directly,
-- and can later be linked to a real student_profiles row when the person
-- signs up (via a future "claim" flow, out of scope here).
--
-- Changes:
--   1. student_id becomes NULLABLE
--   2. Add applicant_name / applicant_email / applicant_phone / applicant_nationality
--   3. Add status CHECK constraint with the 8 valid values
--   4. Add a constraint: either student_id OR applicant_email must be set
--      (can't have a totally empty application)
--   5. Index on applicant_email for the future "find applications by email" lookup

BEGIN;

-- 1. Make student_id nullable
ALTER TABLE student_applications
  ALTER COLUMN student_id DROP NOT NULL;

-- 2. Applicant fields (all nullable individually, but the constraint in #4
--    ensures at least the email is set)
ALTER TABLE student_applications
  ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS applicant_phone VARCHAR(50),
  ADD COLUMN IF NOT EXISTS applicant_nationality VARCHAR(100);

-- 3. Status CHECK constraint
-- Drop the old implicit "any string" permission and enforce the 8 valid values.
-- If you have existing rows with non-conforming statuses, fix them first or
-- the ALTER will fail.
DO $$
BEGIN
  -- Normalize any non-conforming statuses to a safe default before adding the CHECK
  UPDATE student_applications
  SET status = 'Draft'
  WHERE status NOT IN ('Draft', 'Submitted', 'Under Review', 'Documents Requested',
                       'Decision Made', 'Accepted', 'Rejected', 'Withdrawn');
EXCEPTION WHEN OTHERS THEN
  -- If the column doesn't exist or other issue, surface it
  RAISE;
END $$;

ALTER TABLE student_applications
  DROP CONSTRAINT IF EXISTS student_applications_status_check;
ALTER TABLE student_applications
  ADD CONSTRAINT student_applications_status_check
  CHECK (status IN ('Draft', 'Submitted', 'Under Review', 'Documents Requested',
                    'Decision Made', 'Accepted', 'Rejected', 'Withdrawn'));

-- 4. At least one of (student_id, applicant_email) must be present.
--    We can't have a totally orphan application.
ALTER TABLE student_applications
  DROP CONSTRAINT IF EXISTS student_applications_must_have_party;
ALTER TABLE student_applications
  ADD CONSTRAINT student_applications_must_have_party
  CHECK (student_id IS NOT NULL OR (applicant_email IS NOT NULL AND applicant_email <> ''));

-- 5. Index for "find by email" lookups (the future claim flow)
CREATE INDEX IF NOT EXISTS idx_student_applications_applicant_email
  ON student_applications (applicant_email)
  WHERE applicant_email IS NOT NULL;

-- 6. Index for "find unlinked applications" (student_id IS NULL)
--    Useful for the admin dashboard: "how many leads haven't been claimed yet?"
CREATE INDEX IF NOT EXISTS idx_student_applications_unlinked
  ON student_applications (created_at DESC)
  WHERE student_id IS NULL;

COMMIT;

-- Verification queries:
--   SELECT
--     COUNT(*) FILTER (WHERE student_id IS NULL) AS unlinked_count,
--     COUNT(*) FILTER (WHERE student_id IS NOT NULL) AS linked_count,
--     COUNT(*) FILTER (WHERE applicant_email IS NOT NULL) AS has_email
--   FROM student_applications;
