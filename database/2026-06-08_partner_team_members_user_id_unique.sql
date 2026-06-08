-- 2026-06-08: partner_team_members unique on user_id
--
-- Phase 10 fix. The existing unique constraint is (partner_id, user_id),
-- which allows one user to be in MULTIPLE partner orgs. The /api/partner/team
-- POST (email-invite) explicitly rejects "already a member of another
-- partner organization" in its 409 message, and the design is "one user
-- belongs to one partner org" — but the DB didn't enforce it.
--
-- A real incident in Phase 6 left a user with TWO team_members rows
-- (one as a member of Ednex via the email-invite path, one as owner
-- of their own org via a direct-DB recovery insert). The /api/partner/me
-- .single() lookup returned both rows, so .single() hit "multiple rows"
-- (PGRST116) and the user got 403s on every partner API.
--
-- Cleanup before this migration:
--   - Deleted the Ednex row for the affected user
--   - Verified COUNT(*) = COUNT(DISTINCT user_id) on partner_team_members
--     (5 rows, 5 unique users, no other dupes lurking)
--
-- This migration adds a hard UNIQUE on user_id. Future INSERTs that try
-- to put the same user in two orgs will fail at the DB level with
-- 23505 (unique_violation), no matter which API or direct-DB call
-- made the attempt.

ALTER TABLE partner_team_members
  ADD CONSTRAINT partner_team_members_user_id_unique UNIQUE (user_id);

-- Quick verification: each user has at most one membership.
-- (Won't fail the migration; just documents the invariant.)
DO $$
DECLARE
  dupe_count int;
BEGIN
  SELECT COUNT(*) INTO dupe_count
  FROM (
    SELECT user_id
    FROM partner_team_members
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) t;
  IF dupe_count > 0 THEN
    RAISE EXCEPTION 'partner_team_members has % duplicate user_id(s); cleanup before adding UNIQUE', dupe_count;
  END IF;
END $$;
