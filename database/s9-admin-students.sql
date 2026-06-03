-- s9-admin-students.sql
-- SICA Sprint 9: admin-side student CRUD
--
-- Adds two columns to student_profiles that the admin module needs but the
-- original schema didn't have:
--   - `source`     : how the student came to SICA (Admin | Partner | Online)
--                    Admin = added by an admin (the "offline student" flow)
--                    Partner = referred by a partner agency
--                    Online = signed up via the public form
--                    is_offline is derived in the API mapper, not stored.
--   - `extra`      : JSONB for form fields that don't have a fixed column
--                    (HSK, IELTS, TOEFL, bachelor/master, whatsapp, gender,
--                    maritalStatus, address, city, country, etc.)
--                    Indexed queries still use fixed columns. Everything
--                    else goes in `extra` to keep the schema shippable
--                    without dozens of mostly-NULL columns.
--
-- Both are non-breaking: nullable / default '{}' so existing rows survive.

BEGIN;

-- 1. `source` column with a check constraint
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'Online'
    CHECK (source IN ('Admin', 'Partner', 'Online'));

-- Backfill: rows that were created by an admin trigger (auto-create on
-- student signup) default to 'Online'. Rows that were created via the
-- admin/partner flows should already have the right value if we set it
-- at insert time. Nothing to backfill for now.

-- 2. `extra` JSONB column
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS extra JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 3. Index for status filtering (the list page filters by status constantly)
CREATE INDEX IF NOT EXISTS idx_student_profiles_status
  ON student_profiles (status)
  WHERE status IS NOT NULL;

-- 4. Index for source filtering
CREATE INDEX IF NOT EXISTS idx_student_profiles_source
  ON student_profiles (source)
  WHERE source IS NOT NULL;

-- 5. GIN index on extra for ad-hoc JSONB queries (e.g. "find all students
--    with hskLevel >= 4" — only if we ever need it, but cheap to add now)
CREATE INDEX IF NOT EXISTS idx_student_profiles_extra_gin
  ON student_profiles USING GIN (extra jsonb_path_ops);

-- 6. updated_at trigger (the migration may have added one for the table
--    already; this is a no-op if it exists)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER trg_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- 7. RLS: admins can read all rows; non-admins see only their own.
--    (The original RLS for student_profiles already exists from
--    student-tables.sql; we're not changing it. Admin access goes
--    through the service-role client in /api/admin/students/*, so
--    RLS doesn't block us.)

COMMIT;

-- Verification queries (run after applying):
--   SELECT column_name, data_type, column_default
--   FROM information_schema.columns
--   WHERE table_name = 'student_profiles'
--   ORDER BY ordinal_position;
--
--   SELECT COUNT(*), source FROM student_profiles GROUP BY source;
