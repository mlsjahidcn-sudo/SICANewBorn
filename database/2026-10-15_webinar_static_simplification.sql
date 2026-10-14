-- Phase 165: webinar static simplification.
--
-- Phase 164 shipped the auto-rollover model (label + week_number
-- columns, derived "active" query). Phase 165 collapses the whole
-- dynamic system: the public landing page is now a static RSC
-- that reads session metadata from `@/lib/webinar-config.ts`
-- (hardcoded constants). No `webinar_sessions` / `webinar_topics`
-- lookups on the public surface, no admin-side session/topic
-- management UI, no `webinar_session_id` FK on signups.
--
-- This migration drops the leftover dynamic tables:
--   - public.webinar_sessions (sessions table)
--   - public.webinar_topics    (per-session agenda rows)
--   - public.webinar_session_id column on webinar_signups
--     (signups no longer bind to a session row)
--
-- All statements are idempotent. The DO $$ probe at the bottom
-- raises if any of the tables/columns still exist after the
-- drops so the run fails loud rather than silently no-op'ing.

-- ============================================
-- 1. Drop the FK column on webinar_signups first
--    (the FK constraint blocks the column drop otherwise).
--    The `webinar_session_id` column was added in Phase 140 +
--    extended in Phase 144b; signups now stand alone.
-- ============================================

ALTER TABLE public.webinar_signups
  DROP COLUMN IF EXISTS webinar_session_id;

-- Drop the partial index that targeted non-null FKs.
DROP INDEX IF EXISTS public.idx_webinar_signups_session_id;

-- ============================================
-- 2. Drop the per-session topics table.
--    ON DELETE CASCADE handles the FK to webinar_sessions.
-- ============================================

DROP TABLE IF EXISTS public.webinar_topics CASCADE;

-- ============================================
-- 3. Drop the sessions table itself.
--    CASCADE handles the FK from webinar_session_id (already
--    dropped above) + the FK from webinar_topics.session_id
--    (already dropped with the table).
-- ============================================

DROP TABLE IF EXISTS public.webinar_sessions CASCADE;

-- ============================================
-- 4. Drop the lead_history CHECK constraint that accepted
--    'webinar_signup'. After Phase 165's webhook-event hook
--    fires on every admin status flip, the constraint is
--    still valid; we KEEP this row type — signups are still
--    tracked. No change here.
-- ============================================

-- (No-op — leaving lead_type='webinar_signup' intact.)

-- ============================================
-- Sanity probe — fail loud if anything's missing.
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'webinar_sessions'
  ) THEN
    RAISE EXCEPTION 'webinar_sessions table still exists';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'webinar_topics'
  ) THEN
    RAISE EXCEPTION 'webinar_topics table still exists';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'webinar_signups'
      AND column_name = 'webinar_session_id'
  ) THEN
    RAISE EXCEPTION 'webinar_signups.webinar_session_id column still exists';
  END IF;
END $$;
