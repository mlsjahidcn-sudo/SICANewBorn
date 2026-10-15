-- ============================================================================
-- Phase 181 (2026-10-15): visa-critical student profile fields.
--
-- ─────────────────────────────────────────────────────────────────
-- THIS IS A PORT, NOT AN INVENTIONS
-- ─────────────────────────────────────────────────────────────────
-- `partner_applications` already received a visa-readiness enrich in
-- database/2026-06-06_partner_applications_enrich_v2.sql:
--
--   place_of_birth, marital_status, emergency_contact_*,
--   english_test (TOEFL|IELTS|PTE|Duolingo|None),
--   has_studied_in_china ("Affects visa category"),
--   funding_source (Self|Parents|Scholarship|Sponsor|Government,
--                   "Used for the visa application")
--
-- `student_profiles` never got it. So an application created through the
-- partner CRM carries visa fields the main student record does not, and
-- an admin looking at /admin/students/[id] cannot answer questions the
-- partner side already can.
--
-- This migration ports that vocabulary onto student_profiles so both
-- surfaces speak one language, rather than inventing a second dialect.
--
-- ─────────────────────────────────────────────────────────────────
-- WHAT IS GENUINELY NEW (missing on BOTH sides)
-- ─────────────────────────────────────────────────────────────────
-- 1. `funding_source` records a CATEGORY but there are no `sponsor_*`
--    columns anywhere in the schema. So the system can say "this
--    student has a sponsor" without ever being able to say who. A
--    financial-guarantor declaration cannot be started from what we
--    hold. The six sponsor_* columns close that.
--
-- 2. Parents (father/mother) have no representation at all, on either
--    surface. The Chinese student visa (X1) family-background
--    declaration asks for both parents' details; we currently cannot
--    record them at all.
--
-- 3. chinese_name / permanent_address / postal_code — requested by
--    SICA for Chinese-university applications and postal
--    correspondence, absent everywhere.
--
-- ─────────────────────────────────────────────────────────────────
-- NULLABILITY
-- ─────────────────────────────────────────────────────────────────
-- Every column is nullable and additive. Nothing here is required, and
-- no existing row is touched: a pre-Phase-181 student simply has NULL
-- visa fields, which reads as "not yet collected" rather than "no".
-- That distinction matters — "this student has never studied in China"
-- and "we never asked" are different facts and must not share a value.
--
-- Apply via Supabase dashboard SQL editor. Idempotent.
-- ============================================================================

ALTER TABLE public.student_profiles
  -- ── Ported from partner_applications (same names, same vocabulary) ──
  ADD COLUMN IF NOT EXISTS place_of_birth       VARCHAR(128),
  ADD COLUMN IF NOT EXISTS marital_status        VARCHAR(32),
  ADD COLUMN IF NOT EXISTS english_test          VARCHAR(16),
  ADD COLUMN IF NOT EXISTS has_studied_in_china  BOOLEAN,
  ADD COLUMN IF NOT EXISTS funding_source        VARCHAR(32),

  -- ── Emergency contact (mirrors partner_applications exactly) ──
  ADD COLUMN IF NOT EXISTS emergency_contact_name          VARCHAR(128),
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship  VARCHAR(64),
  ADD COLUMN IF NOT EXISTS emergency_contact_phone         VARCHAR(64),
  ADD COLUMN IF NOT EXISTS emergency_contact_email         VARCHAR(255),

  -- ── NEW: financial sponsor DETAIL (funding_source says only "Sponsor") ──
  ADD COLUMN IF NOT EXISTS sponsor_name           VARCHAR(128),
  ADD COLUMN IF NOT EXISTS sponsor_relationship   VARCHAR(64),
  ADD COLUMN IF NOT EXISTS sponsor_occupation     VARCHAR(128),
  ADD COLUMN IF NOT EXISTS sponsor_phone          VARCHAR(64),
  ADD COLUMN IF NOT EXISTS sponsor_email          VARCHAR(255),
  ADD COLUMN IF NOT EXISTS sponsor_annual_income  VARCHAR(64),

  -- ── NEW: parents — required by the X1 family-background declaration ──
  ADD COLUMN IF NOT EXISTS father_name          VARCHAR(128),
  ADD COLUMN IF NOT EXISTS father_nationality   VARCHAR(64),
  ADD COLUMN IF NOT EXISTS father_occupation    VARCHAR(128),
  ADD COLUMN IF NOT EXISTS father_phone         VARCHAR(64),
  ADD COLUMN IF NOT EXISTS mother_name          VARCHAR(128),
  ADD COLUMN IF NOT EXISTS mother_nationality   VARCHAR(64),
  ADD COLUMN IF NOT EXISTS mother_occupation    VARCHAR(128),
  ADD COLUMN IF NOT EXISTS mother_phone         VARCHAR(64),

  -- ── NEW: correspondence + Chinese applications ──
  ADD COLUMN IF NOT EXISTS permanent_address TEXT,
  ADD COLUMN IF NOT EXISTS postal_code       VARCHAR(16),
  ADD COLUMN IF NOT EXISTS chinese_name      VARCHAR(128);

-- ── Closed vocabularies, identical to partner_applications ────────────
-- Named so a re-run can find and replace them. `ADD CONSTRAINT IF NOT
-- EXISTS` does not exist, hence the guarded drop.

DO $$
DECLARE
  c TEXT;
BEGIN
  FOREACH c IN ARRAY ARRAY[
    'student_profiles_english_test_check',
    'student_profiles_funding_source_check',
    'student_profiles_marital_status_check'
  ]
  LOOP
    IF EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.student_profiles'::regclass AND conname = c
    ) THEN
      EXECUTE format('ALTER TABLE public.student_profiles DROP CONSTRAINT %I', c);
    END IF;
  END LOOP;
END $$;

ALTER TABLE public.student_profiles
  ADD CONSTRAINT student_profiles_english_test_check
  CHECK (english_test IS NULL OR english_test IN ('TOEFL','IELTS','PTE','Duolingo','None'));

ALTER TABLE public.student_profiles
  ADD CONSTRAINT student_profiles_funding_source_check
  CHECK (funding_source IS NULL OR funding_source IN ('Self','Parents','Scholarship','Sponsor','Government'));

ALTER TABLE public.student_profiles
  ADD CONSTRAINT student_profiles_marital_status_check
  CHECK (marital_status IS NULL OR marital_status IN ('Single','Married','Divorced','Widowed'));

-- ── Comments: what each field is FOR, not just what it holds ─────────

COMMENT ON COLUMN public.student_profiles.has_studied_in_china IS
  'True if the student has previously studied in China — it changes the visa category. NULL means "not yet asked", which is deliberately NOT the same as false.';
COMMENT ON COLUMN public.student_profiles.funding_source IS
  'Self | Parents | Scholarship | Sponsor | Government. Used for the visa application.';
COMMENT ON COLUMN public.student_profiles.sponsor_name IS
  'The financial guarantor''s NAME. funding_source = ''Sponsor'' says a sponsor exists but not who — these six columns are what make a guarantor declaration startable.';
COMMENT ON COLUMN public.student_profiles.father_name IS
  'Father''s details for the X1 family-background declaration.';
COMMENT ON COLUMN public.student_profiles.english_test IS
  'Which English test was taken, for english_score. We previously stored only the score, so an advisor could not tell IELTS from TOEFL or judge the two-year validity window.';
COMMENT ON COLUMN public.student_profiles.chinese_name IS
  'Name in Chinese characters — required on Chinese university applications.';
COMMENT ON COLUMN public.student_profiles.permanent_address IS
  'Registered home address. current_address already exists separately; several Chinese visa forms ask for both.';

-- ── Verification ──────────────────────────────────────────────────────
-- Expect 0 rows: nothing backfills, and no row is required to change.
--
--   SELECT count(*) FROM student_profiles WHERE has_studied_in_china IS NOT NULL;
--
-- The closed vocabularies are worth exercising before anyone types into
-- a form — a typo must be caught by the CHECK, not silently stored:
--
--   INSERT INTO student_profiles (id, user_id, first_name, last_name, english_test)
--   VALUES (gen_random_uuid(), gen_random_uuid(), 'T', 'T', 'Ielts');  -- must FAIL
