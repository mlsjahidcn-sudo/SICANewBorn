-- ============================================================================
-- Partner Applications enrichment v2 — Phase S26
--
-- The S18 enrichment (Phase 4) added basic contact + workflow fields. This
-- v2 rounds out the data model with the fields Chinese universities and
-- SICA's admissions team actually ask for on a real application:
--
--   Identity & contact
--   ──────────────────
--   date_of_birth          DOB (Chinese unis ask for it on every form)
--   gender                 Male | Female | Other
--   marital_status         Single | Married | Divorced | Widowed
--   place_of_birth         City + country, free text
--   current_address        Home-country address — needed for visa paperwork
--
--   Passport
--   ────────
--   passport_number        As printed on the bio page
--   passport_issue_date    Issue date
--   passport_expiry_date   Expiry (must be > 6 months past study end)
--
--   Emergency contact
--   ─────────────────
--   emergency_contact_name           Full name
--   emergency_contact_relationship   Father / Mother / Sibling / Friend / Other
--   emergency_contact_phone          With country code
--   emergency_contact_email          Optional
--
--   Academic background
--   ───────────────────
--   highest_education    High School | Diploma | Bachelor | Master | PhD
--   school_name          Most recent school
--   school_country       Free text (the partner usually knows the student's country)
--   major                Field of study
--   graduation_year      4-digit year
--   gpa                  Free text — unis accept 4.0/5.0/100% differently
--   class_rank           Optional (some unis publish a min class-rank)
--
--   Language proficiency
--   ────────────────────
--   native_language      Mother tongue
--   english_test         TOEFL | IELTS | PTE | Duolingo | None
--   english_score        E.g. "7.5" or "100"
--   hsk_level            1 | 2 | 3 | 4 | 5 | 6 | None
--   hsk_score            E.g. "220"
--
--   Application context
--   ───────────────────
--   has_studied_in_china      Bool — affects visa category
--   has_applied_china_uni    Bool — repeats often need a different doc set
--   funding_source            Self | Parents | Scholarship | Sponsor | Government
--   scholarship_name          Free text — if funding_source = Scholarship/Sponsor
--
--   Personal statement
--   ──────────────────
--   why_program    Why this program (one paragraph)
--   career_plan    Post-graduation plan (one paragraph)
--
-- All columns are nullable. Old rows keep working untouched; new rows can
-- be filled in. RLS is unchanged.
-- ============================================================================

ALTER TABLE partner_applications
  -- Identity & contact
  ADD COLUMN IF NOT EXISTS date_of_birth         DATE,
  ADD COLUMN IF NOT EXISTS gender                VARCHAR(16)
    CHECK (gender IS NULL OR gender IN ('Male', 'Female', 'Other')),
  ADD COLUMN IF NOT EXISTS marital_status        VARCHAR(16)
    CHECK (marital_status IS NULL OR marital_status IN ('Single', 'Married', 'Divorced', 'Widowed')),
  ADD COLUMN IF NOT EXISTS place_of_birth        VARCHAR(128),
  ADD COLUMN IF NOT EXISTS current_address       TEXT,

  -- Passport
  ADD COLUMN IF NOT EXISTS passport_number       VARCHAR(32),
  ADD COLUMN IF NOT EXISTS passport_issue_date   DATE,
  ADD COLUMN IF NOT EXISTS passport_expiry_date  DATE,

  -- Emergency contact
  ADD COLUMN IF NOT EXISTS emergency_contact_name          VARCHAR(128),
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship  VARCHAR(64),
  ADD COLUMN IF NOT EXISTS emergency_contact_phone         VARCHAR(64),
  ADD COLUMN IF NOT EXISTS emergency_contact_email         VARCHAR(255),

  -- Academic background
  ADD COLUMN IF NOT EXISTS highest_education      VARCHAR(64)
    CHECK (highest_education IS NULL OR highest_education IN
           ('High School', 'Diploma', 'Bachelor', 'Master', 'PhD')),
  ADD COLUMN IF NOT EXISTS school_name            VARCHAR(255),
  ADD COLUMN IF NOT EXISTS school_country         VARCHAR(128),
  ADD COLUMN IF NOT EXISTS major                  VARCHAR(128),
  ADD COLUMN IF NOT EXISTS graduation_year        INT
    CHECK (graduation_year IS NULL OR (graduation_year BETWEEN 1950 AND 2100)),
  ADD COLUMN IF NOT EXISTS gpa                    VARCHAR(16),
  ADD COLUMN IF NOT EXISTS class_rank             VARCHAR(32),

  -- Language proficiency
  ADD COLUMN IF NOT EXISTS native_language        VARCHAR(64),
  ADD COLUMN IF NOT EXISTS english_test           VARCHAR(16)
    CHECK (english_test IS NULL OR english_test IN
           ('TOEFL', 'IELTS', 'PTE', 'Duolingo', 'None')),
  ADD COLUMN IF NOT EXISTS english_score          VARCHAR(16),
  ADD COLUMN IF NOT EXISTS hsk_level              VARCHAR(8)
    CHECK (hsk_level IS NULL OR hsk_level IN ('1', '2', '3', '4', '5', '6', 'None')),
  ADD COLUMN IF NOT EXISTS hsk_score              VARCHAR(16),

  -- Application context
  ADD COLUMN IF NOT EXISTS has_studied_in_china   BOOLEAN,
  ADD COLUMN IF NOT EXISTS has_applied_china_uni BOOLEAN,
  ADD COLUMN IF NOT EXISTS funding_source         VARCHAR(32)
    CHECK (funding_source IS NULL OR funding_source IN
           ('Self', 'Parents', 'Scholarship', 'Sponsor', 'Government')),
  ADD COLUMN IF NOT EXISTS scholarship_name       VARCHAR(255),

  -- Personal statement
  ADD COLUMN IF NOT EXISTS why_program            TEXT,
  ADD COLUMN IF NOT EXISTS career_plan            TEXT;

-- Helpful indexes for the most common partner filters
CREATE INDEX IF NOT EXISTS idx_partner_applications_nationality
  ON partner_applications(partner_id, nationality);
CREATE INDEX IF NOT EXISTS idx_partner_applications_degree
  ON partner_applications(partner_id, degree);

-- Updated comments for the existing columns, so the new docstring makes
-- sense in the schema browser.
COMMENT ON COLUMN partner_applications.date_of_birth IS
  'Student date of birth. Required by every Chinese university application form.';
COMMENT ON COLUMN partner_applications.gender IS
  'Male | Female | Other. Required on the form.';
COMMENT ON COLUMN partner_applications.marital_status IS
  'Single | Married | Divorced | Widowed. Some unis (especially for PhD / older applicants) ask for this.';
COMMENT ON COLUMN partner_applications.place_of_birth IS
  'City + country of birth, free text. Used to verify passport-issued-at matches.';
COMMENT ON COLUMN partner_applications.current_address IS
  'Full home-country address. Needed for visa paperwork + university record.';
COMMENT ON COLUMN partner_applications.passport_number IS
  'As printed on the bio page. Keep the country code off — just the digits.';
COMMENT ON COLUMN partner_applications.passport_issue_date IS
  'Date the passport was issued.';
COMMENT ON COLUMN partner_applications.passport_expiry_date IS
  'Date the passport expires. Must be > 6 months past the study-end date or the visa is rejected.';
COMMENT ON COLUMN partner_applications.emergency_contact_name IS
  'Full name of the person to contact in an emergency.';
COMMENT ON COLUMN partner_applications.emergency_contact_relationship IS
  'Father / Mother / Sibling / Spouse / Friend / Other.';
COMMENT ON COLUMN partner_applications.emergency_contact_phone IS
  'Phone with country code, e.g. +234 803 000 0000.';
COMMENT ON COLUMN partner_applications.emergency_contact_email IS
  'Optional — phone is usually enough.';
COMMENT ON COLUMN partner_applications.highest_education IS
  'Most recent completed degree. High School | Diploma | Bachelor | Master | PhD.';
COMMENT ON COLUMN partner_applications.school_name IS
  'Name of the school the student most recently graduated from.';
COMMENT ON COLUMN partner_applications.school_country IS
  'Country of the school. Free text — the partner usually knows it without checking.';
COMMENT ON COLUMN partner_applications.major IS
  'Field of study at the most recent school.';
COMMENT ON COLUMN partner_applications.graduation_year IS
  '4-digit year of graduation, e.g. 2024.';
COMMENT ON COLUMN partner_applications.gpa IS
  'Free text — Chinese unis accept 4.0 / 5.0 / 10.0 / 100% scales, the partner should write whatever the student''s transcript says.';
COMMENT ON COLUMN partner_applications.class_rank IS
  'Optional — e.g. "Top 10%" or "5/120".';
COMMENT ON COLUMN partner_applications.native_language IS
  'Mother tongue.';
COMMENT ON COLUMN partner_applications.english_test IS
  'TOEFL | IELTS | PTE | Duolingo | None. The test the student took (or will take).';
COMMENT ON COLUMN partner_applications.english_score IS
  'Score on the english_test. E.g. "7.5" (IELTS) or "100" (TOEFL).';
COMMENT ON COLUMN partner_applications.hsk_level IS
  '1 | 2 | 3 | 4 | 5 | 6 | None. Required for Chinese-taught programs.';
COMMENT ON COLUMN partner_applications.hsk_score IS
  'Score on the HSK test, e.g. "220".';
COMMENT ON COLUMN partner_applications.has_studied_in_china IS
  'True if the student has previously studied in China. Affects visa category.';
COMMENT ON COLUMN partner_applications.has_applied_china_uni IS
  'True if the student has previously applied to a Chinese university. Repeat applicants may need a different doc set.';
COMMENT ON COLUMN partner_applications.funding_source IS
  'Self | Parents | Scholarship | Sponsor | Government. Used for the visa application.';
COMMENT ON COLUMN partner_applications.scholarship_name IS
  'If funding_source = Scholarship or Sponsor, the name of the award. Free text.';
COMMENT ON COLUMN partner_applications.why_program IS
  'One paragraph: why this specific program. The student (or partner) writes this.';
COMMENT ON COLUMN partner_applications.career_plan IS
  'One paragraph: post-graduation plan. Some unis (especially Master''s / PhD) require this.';
