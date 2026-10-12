-- ============================================================================
-- Phase 157: remove webinar capacity cap + waitlist
--
-- Background: the Phase 142 max_attendees cap + webinar_waitlist
-- table were a misguided "sell out the seats" gate. SICA wants
-- webinars to accept every registration, no cap, no waitlist.
--
-- Drops:
--   1. webinar_sessions.max_attendees (default 50, CHECK > 0)
--   2. public.webinar_waitlist (with its 3 RLS policies + 1
--      partial index)
--
-- Safe + idempotent: IF EXISTS guards, DROP POLICY IF EXISTS
-- before the table itself. data loss is bounded to waitlist rows
-- (already captured in lead_history via the Phase 143 webhook
-- audit trail) — no FK from webinar_signups touches the table.
--
-- Rollback:
--   ALTER TABLE public.webinar_sessions
--     ADD COLUMN IF NOT EXISTS max_attendees integer
--       NOT NULL DEFAULT 50 CHECK (max_attendees > 0);
--   -- + re-run the Phase 142 migration verbatim (schema, RLS, index).
-- ============================================================================

ALTER TABLE public.webinar_sessions
  DROP COLUMN IF EXISTS max_attendees;

DROP POLICY IF EXISTS "Public insert webinar waitlist" ON public.webinar_waitlist;
DROP POLICY IF EXISTS "Admins read webinar waitlist" ON public.webinar_waitlist;
DROP POLICY IF EXISTS "Admins delete webinar waitlist" ON public.webinar_waitlist;

DROP INDEX IF EXISTS idx_webinar_waitlist_session_created;

DROP TABLE IF EXISTS public.webinar_waitlist;
