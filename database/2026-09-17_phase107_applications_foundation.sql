-- ============================================================================
-- Phase 107 / Batch 1: Applications workflow foundation
--
-- Three new pieces of plumbing, all forward-only / additive:
--
--   1. lead_id + lead_type on student_applications — lets admin back-link
--      an application to the originating lead (chat / assessment / contact).
--      Pairs are polymorphic (consistent with lead_history.lead_type).
--
--   2. enrolled_at on student_applications + application_enrollments table —
--      new status stage beyond decision='Accepted'. Captures deposit +
--      arrival + visa tracking.
--
--   3. application_stage_history table — clean separation of stage transitions
--      (who changed status, when, why) from notes edits. Also lets admin mark
--      internal-only events via the `[internal]` note marker so they don't leak
--      to the student's /student/applications/[id] timeline tab.
--
--   4. applicant_* columns on student_applications — already written by the
--      admin POST route but missing from local migrations. Nullable so
--      the migration is safe on existing data.
--
--   5. timeline_visible_to_student flag on student_applications — global opt-out
--      for internal timeline events per application (admin's per-row marker
--      on stage_history still applies as a finer-grained override).
--
-- All changes use ADD COLUMN IF NOT EXISTS / CREATE TABLE IF NOT EXISTS so the
-- script is idempotent. No destructive ALTERs.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. Lead attribution columns on student_applications
-- ----------------------------------------------------------------------------
ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS lead_id UUID;

ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS lead_type VARCHAR(20);

-- Polymorphic FK constraint added after the column exists (separate ALTER so
-- the IF NOT EXISTS above stays safe on re-runs).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'student_applications_lead_type_check'
  ) THEN
    ALTER TABLE public.student_applications
      ADD CONSTRAINT student_applications_lead_type_check
      CHECK (lead_type IS NULL OR lead_type IN ('chat_lead','student_assessment','contact_submission'));
  END IF;
END $$;

-- Lead_id pairs with lead_type. No FK constraint (polymorphic by design — the
-- lead lives in one of three tables). Application-level invariants are
-- enforced in the API layer (Phase 107 Batch 5).
CREATE INDEX IF NOT EXISTS idx_student_applications_lead
  ON public.student_applications (lead_type, lead_id)
  WHERE lead_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. Enrollment columns
-- ----------------------------------------------------------------------------
ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ;

ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS timeline_visible_to_student BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_student_applications_enrolled_at
  ON public.student_applications (enrolled_at)
  WHERE enrolled_at IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. applicant_* columns — already written by /api/admin/applications POST,
--    but missing from the canonical migrations. Add as nullable so existing
--    rows survive without backfill.
-- ----------------------------------------------------------------------------
ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS applicant_name VARCHAR(255);

ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS applicant_email TEXT;

ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS applicant_phone VARCHAR(50);

ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS applicant_nationality VARCHAR(100);

-- ----------------------------------------------------------------------------
-- 4. application_stage_history — clean stage-transition audit log
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.student_applications(id) ON DELETE CASCADE,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email VARCHAR(255),
  actor_role VARCHAR(20),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stage_history_application_created
  ON public.application_stage_history (application_id, created_at DESC);

-- The actor_role column is intentionally a free-form VARCHAR — admin,
-- student, system, and (later) partner may all write here. A CHECK would
-- be too brittle for what is essentially an audit-log discriminator.
ALTER TABLE public.application_stage_history
  ENABLE ROW LEVEL SECURITY;

-- Admin: full read/write
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stage_history_admin_all') THEN
    CREATE POLICY stage_history_admin_all ON public.application_stage_history
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin','super_admin')))
      WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin','super_admin')));
  END IF;
END $$;

-- Student: SELECT only for their own applications. The route layer (Batch 6)
-- will additionally filter by timeline_visible_to_student when surfacing
-- stage-history rows to a student.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'stage_history_student_select') THEN
    CREATE POLICY stage_history_student_select ON public.application_stage_history
      FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM student_applications sa WHERE sa.id = application_stage_history.application_id AND sa.student_id = auth.uid()));
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 5. application_enrollments — 1:1 with student_applications once enrolled
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.application_enrollments (
  application_id UUID PRIMARY KEY REFERENCES public.student_applications(id) ON DELETE CASCADE,
  enrolled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deposit_amount NUMERIC(12,2),
  deposit_currency VARCHAR(3) DEFAULT 'CNY',
  deposit_paid_at TIMESTAMPTZ,
  visa_status VARCHAR(50) NOT NULL DEFAULT 'Not Started',
  arrival_date DATE,
  notes TEXT
);

-- The 5-value visa_status enum (the only new CHECK constraint in this batch)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'application_enrollments_visa_status_check'
  ) THEN
    ALTER TABLE public.application_enrollments
      ADD CONSTRAINT application_enrollments_visa_status_check
      CHECK (visa_status IN ('Not Started','Documents Pending','Submitted','Approved','Rejected'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_application_enrollments_visa_status
  ON public.application_enrollments (visa_status);

CREATE INDEX IF NOT EXISTS idx_application_enrollments_enrolled_at
  ON public.application_enrollments (enrolled_at DESC);

ALTER TABLE public.application_enrollments
  ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'enrollments_admin_all') THEN
    CREATE POLICY enrollments_admin_all ON public.application_enrollments
      FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin','super_admin')))
      WITH CHECK (EXISTS (SELECT 1 FROM admin_profiles WHERE admin_profiles.user_id = auth.uid() AND admin_profiles.role IN ('admin','super_admin')));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'enrollments_student_select') THEN
    CREATE POLICY enrollments_student_select ON public.application_enrollments
      FOR SELECT TO authenticated
      USING (EXISTS (SELECT 1 FROM student_applications sa WHERE sa.id = application_enrollments.application_id AND sa.student_id = auth.uid()));
  END IF;
END $$;

COMMIT;