-- ============================================================================
-- Phase 136 (2026-10-04): admin "Send email" for students.
--
-- email_log.lead_type CHECK needs one more value: 'student'. Student
-- sends (POST /api/admin/students/[id]/send-email) log with
-- lead_type='student' + lead_id = student_profiles.id (= auth.users id).
--
-- Same drop-by-literal-name pattern as 2026-09-21_counselling_reminders.sql
-- (the constraint is named; the DO-block LIKE-probe pattern from the
-- earlier phases missed Postgres auto-named constraints — see the
-- Phase 125 note in AGENTS.md).
--
-- Apply via Supabase dashboard SQL editor. Idempotent: the guard
-- skips the swap when 'student' is already allowed.
-- ============================================================================

DO $$
BEGIN
  -- Skip when the CHECK already accepts 'student' (re-run safety).
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.email_log'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%''student''%'
  ) THEN
    RAISE NOTICE 'email_log.lead_type already accepts ''student'' — skipping';
    RETURN;
  END IF;

  ALTER TABLE public.email_log
    DROP CONSTRAINT IF EXISTS email_log_lead_type_check;

  ALTER TABLE public.email_log
    ADD CONSTRAINT email_log_lead_type_check
    CHECK (lead_type IN (
      'contact', 'chat', 'assessment', 'application', 'counselling', 'student'
    ));
END
$$;

-- Audit (uncomment after applying):
-- SELECT pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'public.email_log'::regclass
--     AND conname = 'email_log_lead_type_check';
