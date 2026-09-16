-- ============================================================================
-- Backfill: first_name + last_name for student_profiles rows where the
-- signup-trigger accepted NULL/empty values (BEFORE the 2026-09-17
-- required-fields migration was applied).
--
-- Strategy:
--   first_name  := split_part(email, '@', 1)   -- the email local-part
--   last_name   := '(unknown)'                  -- explicit marker so the
--                                                 admin filter renders an
--                                                 identifiable label, not
--                                                 a blank row, and so we
--                                                 can spot these rows later
--                                                 in any "incomplete profile"
--                                                 report.
--
--   For rows that DO have one of the two but not the other, fill the
--   missing side without clobbering the existing value.
--
-- Scope: only rows where the field is NULL or empty string. Skips
-- already-populated rows entirely (no-op).
--
-- Idempotent: safe to re-run. Logs the affected row count as a NOTICE
-- so the migration runner captures it.
--
-- NOT destructive: auth.users rows are untouched, applications + documents
-- remain linked. The student can later edit their profile via the existing
-- `/student/profile` page (Phase S20 wizard prefill) and the name will
-- appear real.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_updated INT;
BEGIN
  WITH fixed AS (
    UPDATE public.student_profiles sp
    SET
      first_name = CASE
        WHEN sp.first_name IS NULL OR trim(sp.first_name) = ''
          THEN split_part(sp.email, '@', 1)
        ELSE sp.first_name
      END,
      last_name = CASE
        WHEN sp.last_name IS NULL OR trim(sp.last_name) = ''
          THEN '(unknown)'
        ELSE sp.last_name
      END
    WHERE
      (sp.first_name IS NULL OR trim(sp.first_name) = '')
      OR (sp.last_name IS NULL OR trim(sp.last_name) = '')
    RETURNING sp.id
  )
  SELECT count(*) INTO v_updated FROM fixed;

  RAISE NOTICE 'student_signup_backfill_names: updated % row(s)', v_updated;
END
$$;

COMMIT;

-- ============================================================================
-- Verify (run separately):
--
--   SELECT id, email, first_name, last_name
--   FROM public.student_profiles
--   WHERE first_name IS NULL OR trim(first_name) = ''
--      OR last_name  IS NULL OR trim(last_name)  = '';
--
-- Expected: 0 rows.
-- ============================================================================