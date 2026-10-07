-- Phase 144b: backfill webinar_session_id for signups that landed
-- before the Phase 144b fix wired the FK on insert. Without this,
-- the public counter (CapacityPill) stays stuck at 50/50 even after
-- signups land, because getActiveSessionCapacity() filters by
-- webinar_session_id = active_session_id and historical rows have
-- null there.
--
-- Idempotent: the UPDATE only touches rows where webinar_session_id IS
-- NULL, and the active-session lookup is itself a 1-row read.

UPDATE public.webinar_signups
SET webinar_session_id = (
  SELECT id FROM public.webinar_sessions
   WHERE is_active = true
   ORDER BY created_at ASC
   LIMIT 1
)
WHERE webinar_session_id IS NULL
  AND EXISTS (
    SELECT 1 FROM public.webinar_sessions WHERE is_active = true
  );