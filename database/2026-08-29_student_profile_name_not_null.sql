-- Migration: Phase 77 — student_profiles.first_name NOT NULL + backfill
-- Root cause: student_profiles.first_name was nullable with no DB
-- constraint. Students who signed up without filling their name
-- (or via a signup flow that didn't propagate raw_user_meta_data)
-- rendered as "—" on every admin application surface.
--
-- Backfill tiers:
--   Tier 1: auth.users.raw_user_meta_data->>'name'
--   Tier 2: auth.users.raw_user_meta_data->>'full_name'
--   Tier 3: email local-part (e.g. "viola.natasha20@gmail.com" → "viola.natasha20")
--     Used when auth.users has no user_metadata (common for OAuth or
--     pre-metadata signups). Lower signal quality than a real name,
--     but better than NULL/empty.
--
-- Auth-users join: the correct FK is student_profiles.id (the PK,
-- REFERENCES auth.users(id)), NOT user_id (legacy column, NULL on old rows).
--
-- Run order: atomic. If the guard raises, no schema changes are committed
-- (the DO block runs before the ALTER, and the whole SQL is in a single
-- implicit transaction unless the editor auto-commits per statement —
-- Supabase SQL Editor auto-commits per statement, so the DO block runs
-- in its own implicit transaction).

-- 1. Backfill (idempotent: WHERE clause excludes already-filled rows)
UPDATE student_profiles sp
SET first_name = COALESCE(
  NULLIF(sp.first_name, ''),
  NULLIF((SELECT raw_user_meta_data->>'name' FROM auth.users WHERE id = sp.id), ''),
  NULLIF((SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = sp.id), ''),
  NULLIF(split_part(sp.email, '@', 1), '')
)
WHERE sp.first_name IS NULL OR sp.first_name = '';

-- 2. Guard: abort if any rows remain dirty. Uses EXISTS to avoid the
-- variable-declaration parser quirk some Supabase SQL editors hit.
DO $body$
BEGIN
  IF EXISTS (SELECT 1 FROM student_profiles WHERE first_name IS NULL OR first_name = '') THEN
    RAISE EXCEPTION 'Migration aborted: student_profiles still has rows with NULL/empty first_name after backfill. Resolve manually before retrying.';
  END IF;
END
$body$;

-- 3. Last name: NULL → '' (no NOT NULL constraint, just normalization)
UPDATE student_profiles SET last_name = '' WHERE last_name IS NULL;

-- 4. Enforce NOT NULL + DEFAULT ''
ALTER TABLE student_profiles
  ALTER COLUMN first_name SET DEFAULT '',
  ALTER COLUMN first_name SET NOT NULL;