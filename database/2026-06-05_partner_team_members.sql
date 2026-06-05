-- ============================================================================
-- Partner team members — Phase 3 (Partner Portal v2)
--
-- Today: 1 partner org = 1 auth.users.id. RLS scopes all partner_* tables
-- by partner_id derived from auth.uid()→partners.user_id.
--
-- New model: 1 partner org = N auth.users.id (one owner, many members).
-- - partners table becomes the *company* record (no longer 1:1 with a user).
-- - New partner_team_members table holds the user↔partner binding with
--   a role ('owner' or 'member') and a status (active/suspended/pending_invite).
-- - 3 partner_* tables (partner_students, partner_applications, partner_leads)
--   get a created_by_user_id column so we can scope member-side queries.
-- - partner_fees stays admin-only (no scope change; access is denied for
--   any partner role).
--
-- Admin approval flow:
-- - /partner/register creates auth.users via Supabase signUp, then a follow-up
--   POST /api/partner/signup creates partners (status='pending') +
--   partner_team_members (status='pending', role='owner').
-- - Admin clicks Approve at /admin/partners/[id] → both rows flip to
--   'active' and joined_at = NOW().
-- - Reject: status='rejected' on partners. Suspend: status='suspended' on
--   both partners and team_member rows.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. partner_team_members — the new binding table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_team_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id      UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  status          TEXT NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'suspended', 'pending_invite', 'pending_approval')),
  invited_by      UUID REFERENCES auth.users(id),
  invited_at      TIMESTAMPTZ,
  joined_at       TIMESTAMPTZ,
  suspended_at    TIMESTAMPTZ,
  suspension_reason TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(partner_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_team_members_user
  ON partner_team_members(user_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_partner_team_members_partner
  ON partner_team_members(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_partner_team_members_pending
  ON partner_team_members(partner_id) WHERE status IN ('pending_invite', 'pending_approval');

ALTER TABLE partner_team_members ENABLE ROW LEVEL SECURITY;

-- Team members see their own row + other rows in the same partner org
-- (needed for the team page list)
DROP POLICY IF EXISTS "Team members see same-partner rows" ON partner_team_members;
CREATE POLICY "Team members see same-partner rows"
  ON partner_team_members FOR SELECT
  USING (
    partner_id IN (
      SELECT partner_id FROM partner_team_members
      WHERE user_id = auth.uid()
    )
  );

-- Only owners can insert/update/delete (admins go through service role)
DROP POLICY IF EXISTS "Owners can manage team" ON partner_team_members;
CREATE POLICY "Owners can manage team"
  ON partner_team_members FOR ALL
  USING (
    partner_id IN (
      SELECT partner_id FROM partner_team_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  )
  WITH CHECK (
    partner_id IN (
      SELECT partner_id FROM partner_team_members
      WHERE user_id = auth.uid() AND role = 'owner' AND status = 'active'
    )
  );

-- Service role bypasses RLS, so the API endpoints can do anything (admins
-- approve/reject from /admin side; the /api/partner/team endpoint runs as
-- the calling owner, gated by the JWT).

-- updated_at trigger
DROP TRIGGER IF EXISTS trg_partner_team_members_updated_at ON partner_team_members;
CREATE TRIGGER trg_partner_team_members_updated_at
  BEFORE UPDATE ON partner_team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. created_by_user_id on the 3 user-writable partner_* tables
-- ----------------------------------------------------------------------------
ALTER TABLE partner_students
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);
ALTER TABLE partner_applications
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);
ALTER TABLE partner_leads
  ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_partner_students_created_by
  ON partner_students(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_partner_applications_created_by
  ON partner_applications(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_partner_leads_created_by
  ON partner_leads(created_by_user_id);

-- Backfill: every existing row gets created_by_user_id = the partner's
-- (old 1:1) user_id. The owner therefore still sees everything.
UPDATE partner_students s
   SET created_by_user_id = p.user_id
  FROM partners p
 WHERE p.id = s.partner_id
   AND s.created_by_user_id IS NULL
   AND p.user_id IS NOT NULL;

UPDATE partner_applications a
   SET created_by_user_id = p.user_id
  FROM partners p
 WHERE p.id = a.partner_id
   AND a.created_by_user_id IS NULL
   AND p.user_id IS NOT NULL;

UPDATE partner_leads l
   SET created_by_user_id = p.user_id
  FROM partners p
 WHERE p.id = l.partner_id
   AND l.created_by_user_id IS NULL
   AND p.user_id IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 3. Seed partner_team_members for the existing partner (owner)
-- ----------------------------------------------------------------------------
INSERT INTO partner_team_members (partner_id, user_id, role, status, invited_by, invited_at, joined_at)
SELECT id, user_id, 'owner', 'active', user_id, NOW(), NOW()
  FROM partners
 WHERE user_id IS NOT NULL
   AND status = 'Active'
 ON CONFLICT (partner_id, user_id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 4. status column on partners — keep as free text (no enum), but
--    document the valid values via comment. The handle_new_student_user
--    trigger does NOT touch partners; signup rows are created via the
--    /api/partner/signup endpoint which sets status='pending'.
--    Valid values: 'pending' | 'active' | 'suspended' | 'rejected' | 'inactive'
-- ----------------------------------------------------------------------------
COMMENT ON COLUMN partners.status IS
  'Partner org lifecycle: pending (awaiting admin approval) | active | suspended (admin-temporarily) | rejected (admin-denied) | inactive (partner-self deactivated)';
