-- ============================================================================
-- Phase 175 (2026-10-15): multi-university shortlists ("campaigns") for
-- admin-managed applications.
--
-- WHY THIS EXISTS
-- ---------------
-- SICA's own outbound copy already sells shortlists —
--   "Most students apply to multiple universities in parallel. We'll help
--    you build a balanced shortlist: 1 reach, 2 targets, 1 safety."
--   "Apply to 3-5 universities, not just one."
-- (database/2026-06-05_email_templates.sql:221,236)
--
-- — but `student_applications` is one university per row, so an advisor
-- making that promise had nowhere to record it.
--
-- WHY A COLUMN AND NOT A JOIN TABLE
-- ---------------------------------
-- Each shortlist entry needs its OWN status / decision / priority /
-- submitted_at — a student is Accepted at one school and Rejected at
-- another. A `application_universities` join table would therefore need
-- to carry all of that, making it "a row with a foreign key" instead
-- of "a row in student_applications". We already have the row.
--
-- So: keep one row per (student, university, program) — which the
-- table has always allowed, since `student_id` carries NO unique
-- constraint — and add `campaign_id` to link the rows that were
-- created together as one advisor-managed campaign.
--
-- Apply via Supabase dashboard SQL editor. Idempotent.
-- ============================================================================

-- 1. Columns -----------------------------------------------------------------

ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS campaign_id UUID;

-- The advisor's placement intent for this target within the shortlist.
-- Deliberately NOT reusing `priority` (High/Medium/Low), which already
-- carries meaning in the admin bulk UI and the CSV export. Overloading
-- it would make those two surfaces disagree.
ALTER TABLE public.student_applications
  ADD COLUMN IF NOT EXISTS campaign_role VARCHAR(20);

COMMENT ON COLUMN public.student_applications.campaign_id IS
  'Groups the rows of one shortlist (one student applying to N universities). NULL = a pre-Phase-175 single-target application, which is a correct reading, not missing data.';
COMMENT ON COLUMN public.student_applications.campaign_role IS
  'Advisor placement intent within the shortlist: Reach | Target | Safety. NULL = unclassified (the default for every legacy row and for admin-created applications outside the shortlist builder).';

-- 2. Indexes -----------------------------------------------------------------
-- Partial: only campaign rows are ever looked up by campaign, and
-- every legacy row has campaign_id IS NULL. A plain index would carry
-- a large constant NULL prefix for no benefit.

CREATE INDEX IF NOT EXISTS idx_student_applications_campaign
  ON public.student_applications (campaign_id)
  WHERE campaign_id IS NOT NULL;

-- Supports the "group by student" view, which is how pre-campaign
-- applications (campaign_id IS NULL) surface as a shortlist too.
CREATE INDEX IF NOT EXISTS idx_student_applications_student_campaign
  ON public.student_applications (student_id, campaign_id)
  WHERE student_id IS NOT NULL;

-- 3. CHECK on campaign_role --------------------------------------------------
-- Named so a re-run can find and replace it. `IF NOT EXISTS` is not
-- available for constraints, hence the guarded drop+add.

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.student_applications'::regclass
      AND conname = 'student_applications_campaign_role_check'
  LOOP
    EXECUTE format('ALTER TABLE public.student_applications DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE public.student_applications
  ADD CONSTRAINT student_applications_campaign_role_check
  CHECK (
    campaign_role IS NULL
    OR campaign_role IN ('Reach', 'Target', 'Safety')
  );

-- 4. NO BACKFILL — deliberately ------------------------------------------------
-- Existing rows keep campaign_id NULL on purpose. Reconstructing
-- historical "campaigns" by guessing which applications an advisor
-- created together would be fabrication, and a wrong grouping is worse
-- than no grouping: it would merge two unrelated students' rows into
-- one card. Legacy rows group by student_id instead, which is
-- accurate.
--
-- 5. Verification (run after applying) ----------------------------------------
--
-- SELECT campaign_role, count(*) FROM public.student_applications
--  WHERE campaign_id IS NOT NULL GROUP BY 1;
--
-- Expect 0 rows. The table should be empty of campaign data until an
-- admin creates a shortlist in /admin/applications/shortlist.
