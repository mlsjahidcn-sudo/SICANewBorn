-- ============================================================================
-- Lead workflow upgrade — Phase 2.1
--
-- Adds the columns the SICA admin needs to actually WORK the leads
-- we now capture from 3 sources (contact form, chat, public
-- assessment). The current /admin/leads UI can only show the
-- contact_submissions list, can't filter, can't take notes, can't
-- assign, can't see who did what. This fixes that.
--
-- Three families of changes:
--
--   1. COLUMN ALTERS on the 3 lead tables
--      - assigned_to         — FK to auth.users; who owns the lead
--      - last_contacted_at   — when admin last reached out
--      - contact_attempts    — int; how many times we've reached out
--      Notes already exist on contact_submissions. Add notes to
--      chat_leads + student_assessments.
--
--   2. NEW TABLE: lead_history
--      - One row per change event (status flip, assignment,
--        notes edit, contact attempt). The detail page reads
--        this for the timeline.
--
--   3. INDEXES for the new filter patterns the admin UI uses
--      - (lead_type, lead_id) — fastest "give me history for
--        this lead"
--      - (assigned_to, status) — "my open leads"
--      - (created_at DESC) on each lead table for the list
--        page sort
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. contact_submissions — add assigned_to + last_contacted_at +
--    contact_attempts (notes already exists).
-- ----------------------------------------------------------------------------
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS contact_attempts INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_contact_submissions_assigned_to
  ON contact_submissions(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_last_contacted_at
  ON contact_submissions(last_contacted_at DESC NULLS LAST);

-- ----------------------------------------------------------------------------
-- 2. chat_leads — add notes + assigned_to + last_contacted_at +
--    contact_attempts.
-- ----------------------------------------------------------------------------
ALTER TABLE chat_leads
  ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE chat_leads
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE chat_leads
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE chat_leads
  ADD COLUMN IF NOT EXISTS contact_attempts INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_chat_leads_assigned_to
  ON chat_leads(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_chat_leads_last_contacted_at
  ON chat_leads(last_contacted_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_chat_leads_country
  ON chat_leads(country);
CREATE INDEX IF NOT EXISTS idx_chat_leads_interested_degree
  ON chat_leads(interested_degree);

-- ----------------------------------------------------------------------------
-- 3. student_assessments — add notes + assigned_to + last_contacted_at
--    + contact_attempts.
-- ----------------------------------------------------------------------------
ALTER TABLE student_assessments
  ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE student_assessments
  ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);
ALTER TABLE student_assessments
  ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE student_assessments
  ADD COLUMN IF NOT EXISTS contact_attempts INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_student_assessments_assigned_to
  ON student_assessments(assigned_to, status);
CREATE INDEX IF NOT EXISTS idx_student_assessments_last_contacted_at
  ON student_assessments(last_contacted_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_student_assessments_country
  ON student_assessments(country);

-- ----------------------------------------------------------------------------
-- 4. lead_history — the timeline table. One row per admin action.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lead_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Which lead (polymorphic FK; we don't enforce FK because
  -- chat_leads / student_assessments / contact_submissions
  -- are 3 different tables. Application layer keeps this honest).
  lead_type VARCHAR(20) NOT NULL CHECK (
    lead_type IN ('contact', 'chat', 'assessment')
  ),
  lead_id UUID NOT NULL,
  -- Who did it
  admin_id UUID REFERENCES auth.users(id),
  -- What action
  action VARCHAR(40) NOT NULL CHECK (
    action IN (
      'status_changed',
      'notes_updated',
      'assigned',
      'unassigned',
      'contacted',
      'created'
    )
  ),
  -- Before / after for the change
  from_value TEXT,
  to_value TEXT,
  -- Free-form context (e.g., the new notes text, or a channel
  -- like 'whatsapp' / 'email' for a contact action)
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lead_history_lead
  ON lead_history(lead_type, lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_history_admin
  ON lead_history(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lead_history_action
  ON lead_history(action, created_at DESC);

ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

-- Only admins can read or write lead_history
DROP POLICY IF EXISTS "Admins can view lead history" ON lead_history;
CREATE POLICY "Admins can view lead history"
  ON lead_history FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert lead history" ON lead_history;
CREATE POLICY "Admins can insert lead history"
  ON lead_history FOR INSERT
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 5. Trigger — keep contact_attempts auto-increment in sync with
--    history rows of action='contacted'. (Optional — admin can
--    also bump the column directly via PATCH.)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bump_contact_attempts()
RETURNS TRIGGER AS $$
DECLARE
  tbl text;
BEGIN
  IF NEW.action = 'contacted' THEN
    tbl := CASE NEW.lead_type
      WHEN 'contact' THEN 'contact_submissions'
      WHEN 'chat' THEN 'chat_leads'
      WHEN 'assessment' THEN 'student_assessments'
    END;
    IF tbl IS NOT NULL THEN
      EXECUTE format(
        'UPDATE %I SET contact_attempts = COALESCE(contact_attempts, 0) + 1, last_contacted_at = NOW() WHERE id = $1',
        tbl
      ) USING NEW.lead_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_lead_history_bump_attempts ON lead_history;
CREATE TRIGGER trg_lead_history_bump_attempts
  AFTER INSERT ON lead_history
  FOR EACH ROW
  EXECUTE FUNCTION public.bump_contact_attempts();
