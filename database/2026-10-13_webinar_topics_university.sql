-- Phase 162: extend `webinar_topics` so a single topic can be
-- one of two shapes:
--   (A) old "track" row (intake + degree + title + body) — unchanged
--     behavior, used for the agenda grid
--   (B) new "university card section" row (kind + university_id +
--     title + body) — feeds the 5-card featured-university grid on
--     /webinar-2027-intake-csc
--
-- We deliberately keep the original `intake` + `degree` columns
-- (they're still valid for the track row shape) but relax them to
-- nullable so a "university card section" row can omit both.
-- The CHECK constraints stay — existing track rows stay valid;
-- new kind-bearing rows just set intake + degree to NULL.
--
-- Partial index on (session_id, university_id, kind) lets the
-- public page's 5-card grid query (group by university) run in
-- one index scan instead of N full-table reads.
--
-- ON CONFLICT / idempotent pattern matches the rest of the
-- webinar migrations (DROP + ADD constraint + CREATE INDEX
-- wrapped in IF EXISTS / IF NOT EXISTS guards).

ALTER TABLE public.webinar_topics
  ADD COLUMN IF NOT EXISTS kind varchar(20)
    CHECK (kind IS NULL OR kind IN ('program','scholarship','timing','requirement'));

ALTER TABLE public.webinar_topics
  ADD COLUMN IF NOT EXISTS university_id uuid
    REFERENCES public.universities(id) ON DELETE SET NULL;

ALTER TABLE public.webinar_topics
  ALTER COLUMN intake DROP NOT NULL;

ALTER TABLE public.webinar_topics
  ALTER COLUMN degree DROP NOT NULL;

CREATE INDEX IF NOT EXISTS idx_webinar_topics_university_kind
  ON public.webinar_topics (session_id, university_id, kind)
  WHERE university_id IS NOT NULL;

-- The original `idx_webinar_topics_session_order` index already
-- covers the (session_id, display_order) lookup for track rows,
-- so the new partial index is additive — no DROP / re-index
-- required.

-- No new RLS policy needed. The existing
-- `Public view topics of active sessions` policy + the
-- `Admins manage topics` admin policy both already gate on the
-- row's session, regardless of kind / university_id. Adding
-- university_id to the row does not change what anon SELECTs.

-- Sanity probe so the migration fails loudly if applied against
-- a schema where the original columns don't exist (vs silently
-- no-op'ing).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webinar_topics' AND column_name = 'kind'
  ) THEN
    RAISE EXCEPTION 'webinar_topics.kind was not created';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'webinar_topics' AND column_name = 'university_id'
  ) THEN
    RAISE EXCEPTION 'webinar_topics.university_id was not created';
  END IF;
END $$;