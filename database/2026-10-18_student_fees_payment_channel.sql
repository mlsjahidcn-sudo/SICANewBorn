-- ============================================================================
-- Phase 182 (2026-10-18): student Paid triage flag + fee payment_channel
--
-- Two orthogonal layers (do NOT overload student_profiles.source):
--
-- 1. student_profiles.service_paid / service_paid_at
--    Quick admin triage: "has this student paid SICA (any channel)?"
--    UI label is still "Paid". Named service_paid so it does not clash
--    with fee-row status='Paid' language.
--
-- 2. student_fees.payment_channel
--    Detail layer for amount/date/method: how the fee was collected
--    (online / offline / bank_transfer / cash / wechat / alipay / other).
--    Existing rows stay 'unspecified'.
--
-- Offline student intake (source='Admin') is provenance, not payment —
-- leave it alone. Online students who pay offline: source stays Online,
-- toggle service_paid and/or set payment_channel='offline' on the fee.
--
-- One-way sync (app code, not a trigger): when a fee lands with
-- payment_channel='offline' (or mark-paid with channel offline), if the
-- linked student's service_paid is still false, set it true + stamp
-- service_paid_at. Clearing a fee / changing channel does NOT auto-clear
-- the student flag — admin clears Paid manually.
--
-- Apply via Supabase dashboard SQL editor. Idempotent.
-- Rollback:
--   ALTER TABLE public.student_profiles
--     DROP COLUMN IF EXISTS service_paid,
--     DROP COLUMN IF EXISTS service_paid_at;
--   DROP INDEX IF EXISTS idx_student_profiles_service_paid;
--   ALTER TABLE public.student_fees DROP COLUMN IF EXISTS payment_channel;
--   DROP INDEX IF EXISTS idx_student_fees_payment_channel_offline;
-- ============================================================================

-- ── 1a. Student Paid triage flag ─────────────────────────────────────────
ALTER TABLE public.student_profiles
  ADD COLUMN IF NOT EXISTS service_paid BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS service_paid_at TIMESTAMPTZ NULL;

CREATE INDEX IF NOT EXISTS idx_student_profiles_service_paid
  ON public.student_profiles (service_paid)
  WHERE service_paid = TRUE;

COMMENT ON COLUMN public.student_profiles.service_paid IS
  'Admin triage: student has paid SICA (any channel). Orthogonal to source=Admin (offline intake).';
COMMENT ON COLUMN public.student_profiles.service_paid_at IS
  'Stamped when service_paid flips to true; cleared when flipped to false.';

-- ── 1b. Fee payment channel ──────────────────────────────────────────────
ALTER TABLE public.student_fees
  ADD COLUMN IF NOT EXISTS payment_channel TEXT NOT NULL DEFAULT 'unspecified';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'student_fees_payment_channel_check'
  ) THEN
    ALTER TABLE public.student_fees
      ADD CONSTRAINT student_fees_payment_channel_check
      CHECK (payment_channel IN (
        'unspecified',
        'online',
        'offline',
        'bank_transfer',
        'cash',
        'wechat',
        'alipay',
        'other'
      ));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_student_fees_payment_channel_offline
  ON public.student_fees (payment_channel)
  WHERE payment_channel = 'offline';

COMMENT ON COLUMN public.student_fees.payment_channel IS
  'How the fee was collected. Free-text payment_method stays as notes.';
