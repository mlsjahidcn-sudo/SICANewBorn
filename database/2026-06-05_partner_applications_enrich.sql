-- ============================================================================
-- Partner Applications enrichment — Phase 4
--
-- The current `partner_applications` table only tracks the bare minimum
-- (student_name, university, program, status, decision, notes). For a
-- real CRM the partner needs:
--
--   * student_email + student_phone — so the partner can actually
--     reach the student they're tracking
--   * intake + degree — the same data the student puts on their
--     own application, so a partner record and a student record
--     can be cross-referenced later
--   * nationality — needed for visa-eligibility context
--   * application_number — a stable public ID like PA-2026-0042
--     partners can quote when they email SICA
--   * priority — partner self-flag for urgent vs normal (mirrors the
--     student_applications.priority field, but partner-driven)
--
-- All columns are nullable so the migration is safe on rows that
-- already exist. Partners fill them in on new rows; old rows can
-- be updated at the partner's leisure.
-- ============================================================================

ALTER TABLE partner_applications
  ADD COLUMN IF NOT EXISTS student_email  VARCHAR(255),
  ADD COLUMN IF NOT EXISTS student_phone  VARCHAR(64),
  ADD COLUMN IF NOT EXISTS intake         VARCHAR(64),
  ADD COLUMN IF NOT EXISTS degree         VARCHAR(64),
  ADD COLUMN IF NOT EXISTS nationality    VARCHAR(128),
  ADD COLUMN IF NOT EXISTS priority       VARCHAR(16) DEFAULT 'Normal'
    CHECK (priority IS NULL OR priority IN ('Low', 'Normal', 'High', 'Urgent')),
  ADD COLUMN IF NOT EXISTS application_number VARCHAR(32);

-- Helpful indexes for the most common partner filters
CREATE INDEX IF NOT EXISTS idx_partner_applications_intake
  ON partner_applications(partner_id, intake);
CREATE INDEX IF NOT EXISTS idx_partner_applications_priority
  ON partner_applications(partner_id, priority);
CREATE UNIQUE INDEX IF NOT EXISTS idx_partner_applications_app_number
  ON partner_applications(partner_id, application_number)
  WHERE application_number IS NOT NULL;

COMMENT ON COLUMN partner_applications.student_email IS
  'Contact email of the student the partner is tracking. Optional — partners sometimes only have a phone number.';
COMMENT ON COLUMN partner_applications.student_phone IS
  'Contact phone (with country code) of the student. Optional.';
COMMENT ON COLUMN partner_applications.intake IS
  'Intake term the student is targeting, e.g. Fall 2026. Mirrors the student_applications.intake field so partner + student records can be cross-referenced.';
COMMENT ON COLUMN partner_applications.degree IS
  'Degree level: Bachelor | Master | PhD | Chinese Language. Mirrors the student_applications.degree field.';
COMMENT ON COLUMN partner_applications.nationality IS
  'Student nationality — needed for visa-eligibility context and scholarship matching.';
COMMENT ON COLUMN partner_applications.priority IS
  'Partner-driven urgency flag. Low | Normal | High | Urgent. Admin sees this in /admin/applications so they can triage.';
COMMENT ON COLUMN partner_applications.application_number IS
  'Stable public ID the partner can quote (PA-YYYY-NNNN). Unique per partner_id. Optional — auto-assigned by the API on POST if blank.';

-- ----------------------------------------------------------------------------
-- 2. Sequence + helper to mint application_numbers
-- ----------------------------------------------------------------------------
-- Per-partner counter: PA-2026-0001, PA-2026-0002, ...
-- Implemented as a function that reads/writes partner_applications_counters
-- (a small key/value table) so the sequence is per-partner.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_app_counters (
  partner_id UUID PRIMARY KEY REFERENCES partners(id) ON DELETE CASCADE,
  year       INT  NOT NULL,
  last_seq   INT  NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION next_partner_app_number(p_partner_id UUID)
RETURNS VARCHAR(32)
LANGUAGE plpgsql
AS $$
DECLARE
  v_year  INT := EXTRACT(YEAR FROM NOW())::INT;
  v_seq   INT;
BEGIN
  INSERT INTO partner_app_counters (partner_id, year, last_seq)
    VALUES (p_partner_id, v_year, 0)
    ON CONFLICT (partner_id) DO NOTHING;

  UPDATE partner_app_counters
     SET last_seq = last_seq + 1,
         year     = v_year
   WHERE partner_id = p_partner_id
  RETURNING last_seq INTO v_seq;

  RETURN 'PA-' || v_year::TEXT || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$;

-- updated_at trigger is already in place (existing on the table)
-- nothing to do here.
