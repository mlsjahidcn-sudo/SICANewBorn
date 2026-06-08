-- Phase 26: UTM + click-id attribution on lead-capture tables.
-- The contact form (/contact) and assessment form (/assessment)
-- already capture sourcePage (the pathname) and the contact
-- table also has referrer + user_agent. Neither captures the
-- standard Google Analytics UTM params (utm_source /
-- utm_medium / utm_campaign) or the paid click IDs (gclid /
-- fbclid) that show up in real ad URLs. Without these, SICA
-- can't answer "which channel actually converts" or run
-- paid campaigns with proper attribution back to the lead.
--
-- The matching src/lib/utm.ts helper captures these on the
-- client (with sessionStorage persistence so cross-page nav
-- doesn't lose attribution) and posts them with the form
-- payload. /api/leads and /api/assessments whitelist them
-- and pass them through to these new columns.
--
-- We capture the 3 essential UTMs (source / medium / campaign)
-- + gclid + fbclid. The other two standard UTMs (term, content)
-- are rarely useful for SICA's small paid spend and would
-- just be noise in the admin view. Add later if needed —
-- the column list is short and the helper whitelist is one
-- line.

-- ============================================
-- 1. contact_submissions
-- ============================================
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS utm_source   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_medium   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
  ADD COLUMN IF NOT EXISTS gclid        VARCHAR(255),
  ADD COLUMN IF NOT EXISTS fbclid       VARCHAR(255);

-- Common admin query: "show me all leads from this campaign"
-- or "show me all leads from Google". Both indexed.
CREATE INDEX IF NOT EXISTS idx_contact_submissions_utm_source
  ON contact_submissions(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_contact_submissions_utm_campaign
  ON contact_submissions(utm_campaign) WHERE utm_campaign IS NOT NULL;

-- ============================================
-- 2. student_assessments
-- ============================================
ALTER TABLE student_assessments
  ADD COLUMN IF NOT EXISTS utm_source   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_medium   VARCHAR(255),
  ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(255),
  ADD COLUMN IF NOT EXISTS gclid        VARCHAR(255),
  ADD COLUMN IF NOT EXISTS fbclid       VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_student_assessments_utm_source
  ON student_assessments(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_student_assessments_utm_campaign
  ON student_assessments(utm_campaign) WHERE utm_campaign IS NOT NULL;
