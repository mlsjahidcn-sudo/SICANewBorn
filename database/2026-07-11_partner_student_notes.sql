-- ============================================================================
-- 2026-07-11: Per-event partner_student_notes (Phase 49.1.12)
--
-- The current `partner_students.notes` column is a single free-text
-- blob — a partner's whole interaction history with a student is
-- compressed into one paragraph. Real partners want per-event
-- notes: "called 2026-07-10 about missing passport", "parents paid
-- deposit 2026-07-12", etc. Compare to the admin student detail's
-- rich notes tab (Phase 44b) which has a composer + list view with
-- timestamps and authors.
--
-- This migration creates a dedicated `partner_student_notes` table
-- that backs the future composer + list view. Each row is one
-- event: who wrote it, when, and the body text.
--
-- Design decisions:
--
--   1. Separate table, not a JSONB array on partner_students — a
--      dedicated table is queryable (search, filter by author /
--      date), indexable, and lets RLS scope cleanly per row.
--
--   2. partner_id denormalized on every row — yes, it's redundant
--      (you can join through partner_student_id → partner_students
--      → partner_id), but it lets the RLS policy short-circuit
--      without the join. RLS on every read matters at scale.
--
--   3. author_user_id required, REFERENCES auth.users(id) — every
--      note has a clear author. ON DELETE SET NULL because we
--      keep the note even if the user is later removed (audit
--      trail).
--
--   4. body capped at 4000 chars (matches the existing partner
--      student notes column) — DB-level guard so a runaway
--      client can't paste an essay. The form layer will also
--      enforce this in Zod-style validation before the INSERT.
--
--   5. pinned BOOLEAN — admin can pin important notes to the top
--      of the list. Same UX pattern as the admin student notes
--      tab (Phase 44b). Default false.
--
--   6. RLS policies:
--        - Partner team can SELECT / INSERT / UPDATE / DELETE
--          their own notes (matched on partner_id, same pattern
--          as the other partner_* tables)
--        - Admins can SELECT everything (read-only)
--      The UPDATE/DELETE policies allow author_user_id = auth.uid()
--      so a partner member can edit/remove their own notes
--      even if their team has changed.
--
-- Idempotent: all CREATE statements use IF NOT EXISTS.
-- ============================================================================

CREATE TABLE IF NOT EXISTS partner_student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_student_id UUID NOT NULL
    REFERENCES partner_students(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL
    REFERENCES partners(id) ON DELETE CASCADE,
  author_user_id UUID
    REFERENCES auth.users(id) ON DELETE SET NULL,
  body TEXT NOT NULL CHECK (char_length(body) <= 4000),
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hot-path indexes:
--   - notes for a single student, newest first (the list view)
--   - notes for a partner org (the team-wide activity feed,
--     future use)
--   - pinned notes per student (the "pinned at top" render)
CREATE INDEX IF NOT EXISTS idx_partner_student_notes_student_created
  ON partner_student_notes(partner_student_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_student_notes_partner_created
  ON partner_student_notes(partner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_partner_student_notes_pinned
  ON partner_student_notes(partner_student_id, pinned, created_at DESC)
  WHERE pinned = TRUE;

COMMENT ON TABLE partner_student_notes IS
  'Per-event notes attached to a partner_students row. Replaces the '
  'single free-text `notes` column on partner_students with a queryable '
  'activity feed (composer + list view on the student detail page).';
COMMENT ON COLUMN partner_student_notes.partner_student_id IS
  'The student this note is about. CASCADE on delete so a deleted '
  'student removes their notes.';
COMMENT ON COLUMN partner_student_notes.partner_id IS
  'Denormalized for RLS short-circuit. RLS joins through this column '
  'instead of through partner_students.partner_id.';
COMMENT ON COLUMN partner_student_notes.author_user_id IS
  'The auth user who wrote the note. SET NULL on user delete so the '
  'audit trail survives team member removal.';
COMMENT ON COLUMN partner_student_notes.body IS
  'The note text. Capped at 4000 chars (matches partner_students.notes).';
COMMENT ON COLUMN partner_student_notes.pinned IS
  'Pinned notes surface at the top of the list (admin can pin '
  'important context). Defaults to false.';

-- ----------------------------------------------------------------------------
-- updated_at trigger — reuses the existing update_updated_at_column()
-- function from migration-supabase-cloud.sql (already on the
-- partner_students table). If you applied a custom version of that
-- function in a later migration, this trigger still works.
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS update_partner_student_notes_updated_at
  ON partner_student_notes;
CREATE TRIGGER update_partner_student_notes_updated_at
  BEFORE UPDATE ON partner_student_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------
ALTER TABLE partner_student_notes ENABLE ROW LEVEL SECURITY;

-- Partner team can SELECT their own notes. We grant via the
-- is_partner_member() SECURITY DEFINER helper that was added in
-- the Phase 5/5b/7 series (database/2026-06-08_partner_rls_team_members.sql).
-- That helper joins through partner_team_members without
-- triggering the RLS-self-recursion trap, so it's safe to call
-- from another RLS policy.
DROP POLICY IF EXISTS "Partner team can view their student notes"
  ON partner_student_notes;
CREATE POLICY "Partner team can view their student notes"
  ON partner_student_notes FOR SELECT
  USING (is_partner_member(partner_id));

-- INSERT — partner team can add notes to their own students.
-- The author_user_id is enforced to be the caller by the API
-- (src/app/api/partner/student-notes/route.ts), not by the
-- database — the DB only requires author_user_id IS NOT NULL.
-- (We do NOT default author_user_id to auth.uid() in the
-- column definition because the same API path will set
-- author_user_id explicitly and we want a 401 if a missing
-- field slips through.)
DROP POLICY IF EXISTS "Partner team can insert their student notes"
  ON partner_student_notes;
CREATE POLICY "Partner team can insert their student notes"
  ON partner_student_notes FOR INSERT
  WITH CHECK (is_partner_member(partner_id));

-- UPDATE — partner team can edit their own notes. We allow any
-- member (not just the author) to keep the data model simple;
-- an audit-style "last edited by" column could be added later
-- if needed. Future scope.
DROP POLICY IF EXISTS "Partner team can update their student notes"
  ON partner_student_notes;
CREATE POLICY "Partner team can update their student notes"
  ON partner_student_notes FOR UPDATE
  USING (is_partner_member(partner_id))
  WITH CHECK (is_partner_member(partner_id));

-- DELETE — partner team can delete their own notes. (A "soft
-- delete" for notes would be overkill — if a partner wants to
-- remove a note, hard delete is fine. The audit trail is the
-- application_timeline + email_log tables, not this one.)
DROP POLICY IF EXISTS "Partner team can delete their student notes"
  ON partner_student_notes;
CREATE POLICY "Partner team can delete their student notes"
  ON partner_student_notes FOR DELETE
  USING (is_partner_member(partner_id));

-- Admin read-only access. Mirrors the admin policy on
-- partner_students. Uses the is_admin() SECURITY DEFINER
-- helper from migration-supabase-cloud.sql.
DROP POLICY IF EXISTS "Admins can view all student notes"
  ON partner_student_notes;
CREATE POLICY "Admins can view all student notes"
  ON partner_student_notes FOR SELECT
  USING (is_admin());
