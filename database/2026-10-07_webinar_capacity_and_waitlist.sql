-- Phase 142: webinar capacity cap + waitlist lead-capture.
--
-- Adds:
--   - webinar_sessions.max_attendees (default 50, CHECK > 0)
--   - webinar_waitlist table (anon INSERT, admin SELECT/DELETE)
--     captures emails when the active session fills up.
--
-- Seat-holders count `status IN ('Registered', 'Attended')` —
-- Cancelled and No-Show don't count, mirroring the counselling
-- `('Pending', 'Confirmed')` exclusion in
-- src/lib/counselling/occupancy.ts:87.
--
-- Idempotent: ALTER TABLE ... ADD COLUMN IF NOT EXISTS +
-- CREATE TABLE IF NOT EXISTS + DROP POLICY IF EXISTS.

ALTER TABLE public.webinar_sessions
  ADD COLUMN IF NOT EXISTS max_attendees integer NOT NULL DEFAULT 50
    CHECK (max_attendees > 0);

CREATE TABLE IF NOT EXISTS public.webinar_waitlist (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    uuid NOT NULL REFERENCES public.webinar_sessions(id) ON DELETE CASCADE,
  email         varchar(255) NOT NULL,
  first_name    varchar(120) NOT NULL,
  whatsapp      varchar(40),
  source_page   text,
  referrer      text,
  user_agent    text,
  utm_source    varchar(255),
  utm_medium    varchar(255),
  utm_campaign   varchar(255),
  gclid         varchar(255),
  fbclid        varchar(255),
  ip_hash       varchar(64),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webinar_waitlist_session_created
  ON public.webinar_waitlist (session_id, created_at);

ALTER TABLE public.webinar_waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert webinar waitlist" ON public.webinar_waitlist;
CREATE POLICY "Public insert webinar waitlist"
  ON public.webinar_waitlist FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read webinar waitlist" ON public.webinar_waitlist;
CREATE POLICY "Admins read webinar waitlist"
  ON public.webinar_waitlist FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins delete webinar waitlist" ON public.webinar_waitlist;
CREATE POLICY "Admins delete webinar waitlist"
  ON public.webinar_waitlist FOR DELETE TO authenticated
  USING (public.is_admin());