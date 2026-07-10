-- ============================================================================
-- 2026-07-11: Partner soft delete (Phase 49.1.8)
--
-- The current DELETE handlers on /api/partner/students and
-- /api/partner/applications do a hard delete — the JSDoc
-- on both routes explicitly admits the action is "reversible
-- only by re-creating". A partner who deletes a student with
-- 3 applications orphans them silently, and there's no
-- recovery path. Worse, real partner orgs have already lost
-- data this way.
--
-- This migration adds a soft-delete column to both tables.
-- The future PRs that wire it will:
--   1. Change DELETE → PATCH archived_at=NOW()
--   2. Add a "Show archived" toggle to the list filters
--   3. Update the partner_*_mapper.ts to read/write archived_at
--   4. Add a partial index for the hot "active" filter
--
-- Schema:
--   archived_at            TIMESTAMPTZ NULL
--   archived_by_user_id    UUID NULL REFERENCES auth.users(id)
--
-- archived_at IS NULL == active row (the default).
-- The RLS policies don't filter on this column — partners
-- still see their own rows regardless of archive state; the
-- list filter is the only place that hides archived rows by
-- default. (Admins keep full visibility.)
--
-- Idempotent: re-running the migration after success is a no-op
-- (all statements use ADD COLUMN IF NOT EXISTS / CREATE INDEX IF NOT
-- EXISTS). The CHECK on archived_at being either NULL or future is
-- an optional guard — kept lenient (just IS NULL or IS NOT NULL,
-- not "must be in the past") because backfills may set archived_at
-- to now() in the same transaction.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. partner_students
-- ----------------------------------------------------------------------------
ALTER TABLE partner_students
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
ALTER TABLE partner_students
  ADD COLUMN IF NOT EXISTS archived_by_user_id UUID NULL
  REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN partner_students.archived_at IS
  'Soft-delete marker. NULL = active. Non-null = archived at this time. '
  'Use a partial-index-friendly NULL check for the "active" filter.';
COMMENT ON COLUMN partner_students.archived_by_user_id IS
  'The auth user who archived the row. NULL for rows that were created '
  'before the soft-delete column existed (backfill-safe).';

-- Partial index for the "list active" hot path. Most queries will
-- filter WHERE archived_at IS NULL, so the partial index is much
-- smaller + faster than a full index.
CREATE INDEX IF NOT EXISTS idx_partner_students_active
  ON partner_students(partner_id, created_at DESC)
  WHERE archived_at IS NULL;

-- Composite index on the rare "list archived" filter.
CREATE INDEX IF NOT EXISTS idx_partner_students_archived
  ON partner_students(partner_id, archived_at DESC)
  WHERE archived_at IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. partner_applications
-- ----------------------------------------------------------------------------
ALTER TABLE partner_applications
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;
ALTER TABLE partner_applications
  ADD COLUMN IF NOT EXISTS archived_by_user_id UUID NULL
  REFERENCES auth.users(id) ON DELETE SET NULL;

COMMENT ON COLUMN partner_applications.archived_at IS
  'Soft-delete marker. NULL = active. Non-null = archived at this time.';
COMMENT ON COLUMN partner_applications.archived_by_user_id IS
  'The auth user who archived the row. NULL for legacy rows.';

CREATE INDEX IF NOT EXISTS idx_partner_applications_active
  ON partner_applications(partner_id, created_at DESC)
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_partner_applications_archived
  ON partner_applications(partner_id, archived_at DESC)
  WHERE archived_at IS NOT NULL;
