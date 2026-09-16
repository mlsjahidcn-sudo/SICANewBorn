-- =============================================================================
-- Phase 108 Batch 7: student_fees audit trail
-- =============================================================================
-- Additive only — three nullable columns on student_fees + one new
-- student_fee_events table mirroring the Phase 107 application_stage_history
-- pattern. All DO blocks are idempotent so the migration is safe to re-run.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add updated_by + payment_proof columns to student_fees
-- -----------------------------------------------------------------------------
ALTER TABLE public.student_fees
  ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.student_fees
  ADD COLUMN IF NOT EXISTS payment_proof_url TEXT;

ALTER TABLE public.student_fees
  ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- -----------------------------------------------------------------------------
-- 2. student_fee_events — audit log per fee
-- -----------------------------------------------------------------------------
-- Models Phase 107 application_stage_history (database/2026-09-17_phase107_
-- applications_foundation.sql lines 95-138). event_type is a closed set:
--   created                — row inserted
--   status_changed         — status field moved (incl. bulk ops)
--   amount_paid_changed    — amount_paid field moved
--   payment_proof_uploaded — payment_proof_url populated/cleared
--   bulk_action            — multi-row bulk operation (Phase 108 Batch 5)
-- from_status / to_status are nullable because 'created' has no prior state.
-- actor_email is denormalized so the audit log survives deleted-user cases.
CREATE TABLE IF NOT EXISTS public.student_fee_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id UUID NOT NULL REFERENCES public.student_fees(id) ON DELETE CASCADE,
  event_type VARCHAR(40) NOT NULL
    CHECK (event_type IN ('created','status_changed','amount_paid_changed','payment_proof_uploaded','bulk_action')),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  from_status VARCHAR(20),
  to_status VARCHAR(20),
  amount_paid_at_event NUMERIC(12,2),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fee_events_fee_created
  ON public.student_fee_events (fee_id, created_at DESC);

ALTER TABLE public.student_fee_events
  ENABLE ROW LEVEL SECURITY;

-- Admin: full read/write
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fee_events_admin_all') THEN
    CREATE POLICY fee_events_admin_all ON public.student_fee_events
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin','super_admin')))
      WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin','super_admin')));
  END IF;
END $$;

-- Student: SELECT only for their own fees. RLS joins through the parent row
-- to verify ownership — the existing student_fees_self_select policy proves
-- the join pattern works (database/s11-admin-extras.sql line 97).
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'fee_events_student_select') THEN
    CREATE POLICY fee_events_student_select ON public.student_fee_events
      FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM student_fees sf WHERE sf.id = student_fee_events.fee_id AND sf.student_id = auth.uid()));
  END IF;
END $$;