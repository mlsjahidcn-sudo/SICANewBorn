-- Phase 140: webinar admin management.
--
-- Adds two new tables (webinar_sessions + webinar_topics) and
-- extends webinar_signups with a FK back to whichever session
-- the visitor signed up against (nullable, so Phase 139 rows
-- still resolve cleanly until staff backfills).
--
-- Single-active enforcement is at the DB layer via a partial
-- unique index on is_active = true — toggling two sessions to
-- active in the same write fails the second one. Admin API
-- (Phase 140) flips the previous row to false in the same
-- transaction so the partial index doesn't 500 the user.

CREATE TABLE IF NOT EXISTS public.webinar_sessions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                varchar(64) NOT NULL UNIQUE,
  title_en            varchar(255) NOT NULL,
  title_zh            varchar(255) NOT NULL,
  description_en      text,
  description_zh      text,
  session_date        timestamptz,                  -- null until staff confirms
  session_time        varchar(80),                   -- display string ("10:00 AM Beijing Time")
  duration_minutes    integer NOT NULL DEFAULT 60,
  join_url            text,                          -- null until staff pastes the link
  status              varchar(20) NOT NULL DEFAULT 'Scheduled'
                      CHECK (status IN ('Scheduled','Live','Completed','Cancelled')),
  is_active           boolean NOT NULL DEFAULT false,
  display_order       integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_webinar_sessions_single_active
  ON public.webinar_sessions (is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_webinar_sessions_display_order
  ON public.webinar_sessions (display_order);

CREATE TABLE IF NOT EXISTS public.webinar_topics (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      uuid NOT NULL REFERENCES public.webinar_sessions(id) ON DELETE CASCADE,
  intake          varchar(20) NOT NULL
                  CHECK (intake IN ('march_2027','september_2027','csc','other')),
  degree          varchar(20) NOT NULL
                  CHECK (degree IN ('chinese_language','foundation','bachelor','master','phd','csc')),
  title_en        varchar(255) NOT NULL,
  title_zh        varchar(255) NOT NULL,
  body_en         text NOT NULL,
  body_zh         text NOT NULL,
  display_order   integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webinar_topics_session_order
  ON public.webinar_topics (session_id, display_order);

ALTER TABLE public.webinar_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_topics    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view active session" ON public.webinar_sessions;
CREATE POLICY "Public view active session"
  ON public.webinar_sessions FOR SELECT TO anon, authenticated
  USING (is_active = true);

DROP POLICY IF EXISTS "Public view topics of active sessions" ON public.webinar_topics;
CREATE POLICY "Public view topics of active sessions"
  ON public.webinar_topics FOR SELECT TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM public.webinar_sessions s
    WHERE s.id = webinar_topics.session_id
      AND s.is_active = true
  ));

DROP POLICY IF EXISTS "Admins manage sessions" ON public.webinar_sessions;
CREATE POLICY "Admins manage sessions"
  ON public.webinar_sessions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins manage topics" ON public.webinar_topics;
CREATE POLICY "Admins manage topics"
  ON public.webinar_topics FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS trg_webinar_sessions_updated_at ON public.webinar_sessions;
CREATE TRIGGER trg_webinar_sessions_updated_at
  BEFORE UPDATE ON public.webinar_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_webinar_topics_updated_at ON public.webinar_topics;
CREATE TRIGGER trg_webinar_topics_updated_at
  BEFORE UPDATE ON public.webinar_topics
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Extend webinar_signups with the session FK. Nullable so
-- historical Phase 139 rows survive the migration without
-- requiring a backfill (staff can re-link manually via the
-- admin signups page when they want the FK populated).
ALTER TABLE public.webinar_signups
  ADD COLUMN IF NOT EXISTS webinar_session_id uuid
    REFERENCES public.webinar_sessions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_webinar_signups_session_id
  ON public.webinar_signups (webinar_session_id)
  WHERE webinar_session_id IS NOT NULL;
