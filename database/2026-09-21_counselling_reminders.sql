-- ============================================================================
-- Phase 123 (2026-09-21): counselling session reminders + email audit
--
-- 1. counselling_bookings: reminder stamp columns. The reminder worker
--    (src/lib/counselling/reminders.ts) sets each to the attempt time,
--    making every reminder fire exactly once per booking even across
--    restarts. NULL = not yet sent.
-- 2. email_log: extend the polymorphic lead_type CHECK to accept
--    'counselling' so admin confirm/cancel emails and reminders land
--    in the same audit trail as lead emails.
--
-- Idempotent — safe to re-run. Apply via Supabase dashboard SQL editor.
-- ============================================================================

-- 1. Reminder stamps ---------------------------------------------------------

ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS reminder_24h_at TIMESTAMPTZ;
ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS reminder_2h_at TIMESTAMPTZ;

COMMENT ON COLUMN public.counselling_bookings.reminder_24h_at IS
  'Set when the 24h-before reminder email was attempted (Phase 123). NULL = not yet sent.';
COMMENT ON COLUMN public.counselling_bookings.reminder_2h_at IS
  'Set when the 2h-before reminder email was attempted (Phase 123). NULL = not yet sent.';

-- 2. email_log.lead_type accepts 'counselling' -------------------------------
-- Pre-existing constraint: CHECK (lead_type IN ('contact','chat','assessment','application')).
-- Drop + re-add only when the old shape is still in place.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_log_lead_type_check'
      AND pg_get_constraintdef(oid) NOT LIKE '%counselling%'
  ) THEN
    ALTER TABLE public.email_log DROP CONSTRAINT email_log_lead_type_check;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_log_lead_type_check'
  ) THEN
    ALTER TABLE public.email_log
      ADD CONSTRAINT email_log_lead_type_check
      CHECK (lead_type IN ('contact', 'chat', 'assessment', 'application', 'counselling'));
  END IF;
END $$;

-- Audit (uncomment after applying):
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'counselling_bookings' AND column_name LIKE 'reminder_%';
-- SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'email_log_lead_type_check';
