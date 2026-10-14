-- Phase 164: webinar auto-rollover + per-session labels.
--
-- Why this migration exists:
--   Phase 139-162 modeled webinars as a few hand-curated events
--   per year — staff created a row, toggled `is_active=true`, ran
--   it, toggled the next one on. The partial unique index
--   `idx_webinar_sessions_single_active` enforced the "only one
--   active at a time" rule at the DB layer. Now we're switching
--   to weekly cadence where "active" is whatever session is next
--   on the calendar — no toggle needed. The "active" concept
--   becomes a derived query (earliest future session_date) and
--   the constraint goes away.
--
--   `label` and `week_number` give each session a human-readable
--   identifier so the public page can render "Week 5 · Oct 20"
--   and the admin can scan the list.
--
-- All statements are idempotent — safe to re-run. The
-- `DO $$` probe at the bottom RAISEs if any of the new
-- columns / indexes didn't land so the run fails loud
-- rather than silently no-op'ing.

-- ============================================
-- 1. Drop the single-active enforcement
-- ============================================

DROP INDEX IF EXISTS public.idx_webinar_sessions_single_active;

ALTER TABLE public.webinar_sessions
  DROP COLUMN IF EXISTS is_active;

-- ============================================
-- 2. Drop the manual display_order column
--    (date ordering replaces it for the new
--    upcoming-first list view)
-- ============================================

DROP INDEX IF EXISTS public.idx_webinar_sessions_display_order;

ALTER TABLE public.webinar_sessions
  DROP COLUMN IF EXISTS display_order;

-- ============================================
-- 3. Add label + week_number columns
-- ============================================

ALTER TABLE public.webinar_sessions
  ADD COLUMN IF NOT EXISTS label text;

ALTER TABLE public.webinar_sessions
  ADD COLUMN IF NOT EXISTS week_number integer;

-- Partial unique on week_number — sparse semantics so the
-- historic Phase 139/140 rows (NULL week_number) coexist
-- with the new auto-numbered ones without 23505'ing the
-- backfill. The API computes MAX + 1 on insert; this index
-- just defends against the rare race where two admins
-- schedule at the exact same minute.
CREATE UNIQUE INDEX IF NOT EXISTS idx_webinar_sessions_week_number_unique
  ON public.webinar_sessions (week_number)
  WHERE week_number IS NOT NULL;

-- Index for the "next upcoming" lookup
-- (`session_date > now() AND status != 'Cancelled' ORDER BY
--  session_date ASC LIMIT 1` — the new hot path of the public
-- page + signup POST + cron reminder).
CREATE INDEX IF NOT EXISTS idx_webinar_sessions_session_date
  ON public.webinar_sessions (session_date)
  WHERE status != 'Cancelled';

-- ============================================
-- 4. Update the public-SELECT RLS policy
--    The old policy gated on `is_active = true`; with
--    auto-rollover, anon can read any non-cancelled
--    session (the live query only fetches the next-up
--    anyway, so this just lets the calendar surface
--    render if/when we add one).
-- ============================================

DROP POLICY IF EXISTS "Public view active session" ON public.webinar_sessions;
DROP POLICY IF EXISTS "Public view non-cancelled sessions" ON public.webinar_sessions;
CREATE POLICY "Public view non-cancelled sessions"
  ON public.webinar_sessions FOR SELECT TO anon, authenticated
  USING (status <> 'Cancelled');

-- ============================================
-- 5. Backfill label + week_number on existing rows.
--
-- Strategy:
--   - For rows that already had is_active=true (Phase 139/140
--     legacy), mark week_number=1, label=NULL so the next
--     schedule picks week_number=2.
--   - All other rows get NULL label + NULL week_number so
--     they sort by date and don't compete for the unique
--     index slot.
-- ============================================

UPDATE public.webinar_sessions
  SET
    label = COALESCE(label, 'Week 1 · ' || to_char(session_date AT TIME ZONE 'Asia/Shanghai', 'Mon DD, YYYY')),
    week_number = COALESCE(week_number, 1)
  WHERE session_date IS NOT NULL
    AND session_date > now()
    AND label IS NULL
    AND week_number IS NULL
    AND status <> 'Cancelled';

-- ============================================
-- Sanity probes — fail loud if anything's missing.
-- ============================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webinar_sessions' AND column_name = 'is_active'
  ) THEN
    RAISE EXCEPTION 'webinar_sessions.is_active was not dropped';
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webinar_sessions' AND column_name = 'display_order'
  ) THEN
    RAISE EXCEPTION 'webinar_sessions.display_order was not dropped';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webinar_sessions' AND column_name = 'label'
  ) THEN
    RAISE EXCEPTION 'webinar_sessions.label was not created';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webinar_sessions' AND column_name = 'week_number'
  ) THEN
    RAISE EXCEPTION 'webinar_sessions.week_number was not created';
  END IF;
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public' AND tablename = 'webinar_sessions'
      AND indexname = 'idx_webinar_sessions_single_active'
  ) THEN
    RAISE EXCEPTION 'idx_webinar_sessions_single_active was not dropped';
  END IF;
END $$;
