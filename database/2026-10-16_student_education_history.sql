-- ============================================================================
-- Phase 183 (2026-10-16): repeatable education history.
--
-- ─────────────────────────────────────────────────────────────────
-- WHY A CHILD TABLE
-- ─────────────────────────────────────────────────────────────────
-- Education was captured as EIGHT fixed columns —
-- highSchoolName / highSchoolGPA / bachelorUniversityName /
-- bachelorMajor / masterUniversityName / … — which cannot express:
--
--   * a fourth qualification (a second bachelor's, a diploma, a PhD)
--   * a gap year
--   * a gap DEGREE (many applicants did a BA then an unrelated diploma)
--   * start dates (only graduation dates exist today)
--   * the grading scale (GPA on 4.0 vs percentage vs A-Level vs
--     national class) — without it "3.5" is meaningless
--
-- Those are not edge cases for study-abundance applicants; they are
-- the normal shape of the intake this business runs on. The SICA
-- intake checklist asks for "repeat for each qualification", and the
-- schema simply could not answer it.
--
-- ─────────────────────────────────────────────────────────────────
-- WHY THE BACKFILL MATTERS
-- ─────────────────────────────────────────────────────────────────
-- Existing students hold their education in `extra` JSONB (the
-- form's catch-all), not in columns. Without this INSERT every current
-- student would open the new editor and find their history EMPTY —
-- looking, to an advisor, exactly like data loss. So the backfill
-- lifts the three fixed blocks into real rows.
--
-- Safe to re-run: the WHERE guards skip students that already have
-- history, and the per-block NOT NULL check skips empty blocks. A
-- student with only a high school gets ONE row, not three blanks.
--
-- The original `extra` keys are deliberately LEFT IN PLACE. This is
-- additive; nothing is deleted until you have seen the backfilled
-- rows are correct in the UI. Cleaning up `extra` is a separate,
-- deliberate step — see the note at the bottom.
--
-- Apply via Supabase dashboard SQL editor. Idempotent.
-- ============================================================================

-- 1. The table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.student_education_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  institution   VARCHAR(255),
  country       VARCHAR(128),
  qualification VARCHAR(64),          -- High School | Diploma | Bachelor | Master | PhD | Other
  subject       VARCHAR(255),
  start_date    DATE,
  end_date      DATE,
  grade         VARCHAR(32),           -- GPA or percentage, AS THE STUDENT STATED IT
  grading_scale VARCHAR(64),           -- '4.0 GPA' | 'percentage' | 'A-Level' | 'national class' | …
  is_current    BOOLEAN NOT NULL DEFAULT false,
  -- Preserves the advisor's ordering. Chronological by default
  -- (high school = 0), but nothing forces it — a gap year or a
  -- simultaneous course should not be forced into an order.
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Hot path is "all of this student's qualifications, in order".
COMMENT ON TABLE public.student_education_history IS
  'Repeatable education history, one row per qualification (Phase 183). Replaces the eight fixed highSchool*/bachelor*/master* fields, which could not express a fourth qualification, a gap year, or a grading scale.';

COMMENT ON COLUMN public.student_education_history.grading_scale IS
  'How to read `grade`. "3.5" means nothing without it — 4.0 GPA, percentage, A-Level, or national class are not comparable. This is why the intake checklist asks for it.';
COMMENT ON COLUMN public.student_education_history.is_current IS
  'True for a qualification still in progress. Lets an advisor distinguish "studying" from "finished", which fixed graduation-date columns could not.';
COMMENT ON COLUMN public.student_education_history.end_date IS
  'NULL while is_current is true. Kept separate from a stored year so a date can be approximate.';

-- ─────────────────────────────────────────────────────────────────
-- Indexes
-- ─────────────────────────────────────────────────────────────────
-- Covering index: every read of a student's history is
-- "WHERE student_id = ? ORDER BY sort_order", so both the predicate and
-- the sort live in the index and Postgres never sorts.
CREATE INDEX IF NOT EXISTS idx_student_education_history_student
  ON public.student_education_history (student_id, sort_order);

-- Partial: "which students are studying right now" is a real question
-- (and an enrolment-deadline one). Rare enough that the partial index
-- is worth more than a larger full index.
CREATE INDEX IF NOT EXISTS idx_student_education_history_current
  ON public.student_education_history (student_id)
  WHERE is_current;

-- 2. Backfill from `extra` ──────────────────────────────────────────────
-- Three INSERTs, one per fixed block, each guarded so:
--   * the block is not entirely empty (no all-NULL rows), and
--   * the student has no history yet (so a re-run is a no-op).

INSERT INTO public.student_education_history
  (student_id, institution, country, qualification, subject,
   end_date, grade, grading_scale, is_current, sort_order)
SELECT
  s.id,
  s.extra->>'highSchoolName',
  NULLIF(s.extra->>'highSchoolCountry', ''),
  'High School',
  NULL,
  NULLIF(s.extra->>'highSchoolGraduationDate', '')::date,
  NULLIF(s.extra->>'highSchoolGPA', ''),
  -- The old schema had no scale field, so we record what we actually
  -- know rather than guessing. An advisor sees "unspecified" and
  -- asks; a fabricated "4.0" would be worse than nothing.
  'unspecified',
  false,
  0
FROM public.student_profiles s
WHERE s.extra IS NOT NULL
  AND s.extra ? 'highSchoolName'
  AND NULLIF(s.extra->>'highSchoolName', '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.student_education_history h WHERE h.student_id = s.id
  );

INSERT INTO public.student_education_history
  (student_id, institution, country, qualification, subject,
   end_date, grade, grading_scale, is_current, sort_order)
SELECT
  s.id,
  s.extra->>'bachelorUniversityName',
  NULL,
  'Bachelor',
  NULLIF(s.extra->>'bachelorMajor', ''),
  NULLIF(s.extra->>'bachelorGraduationDate', '')::date,
  NULLIF(s.extra->>'bachelorGPA', ''),
  'unspecified',
  false,
  1
FROM public.student_profiles s
WHERE s.extra IS NOT NULL
  AND s.extra ? 'bachelorUniversityName'
  AND NULLIF(s.extra->>'bachelorUniversityName', '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.student_education_history h WHERE h.student_id = s.id
  );

INSERT INTO public.student_education_history
  (student_id, institution, country, qualification, subject,
   end_date, grade, grading_scale, is_current, sort_order)
SELECT
  s.id,
  s.extra->>'masterUniversityName',
  NULL,
  'Master',
  NULLIF(s.extra->>'masterMajor', ''),
  NULLIF(s.extra->>'masterGraduationDate', '')::date,
  NULLIF(s.extra->>'masterGPA', ''),
  'unspecified',
  false,
  2
FROM public.student_profiles s
WHERE s.extra IS NOT NULL
  AND s.extra ? 'masterUniversityName'
  AND NULLIF(s.extra->>'masterUniversityName', '') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.student_education_history h WHERE h.student_id = s.id
  );

-- 3. Verification ──────────────────────────────────────────────────────
--
-- Did the backfill produce sensible rows, and did it skip the students
-- whose blocks were empty?
--
--   SELECT qualification, count(*), count(institution) AS with_institution
--     FROM student_education_history
--    GROUP BY qualification ORDER BY 2 DESC;
--
-- count(*) = count(institution) on every row: no blank rows were created.
--
--   SELECT count(*) AS students_with_history
--     FROM (SELECT DISTINCT student_id FROM student_education_history) x;
--
-- Sanity-check a real student's three rows:
--
--   SELECT qualification, institution, subject, grade, grading_scale
--     FROM student_education_history
--    WHERE student_id = '<a student id>'
--    ORDER BY sort_order;
--
-- ─────────────────────────────────────────────────────────────────
-- LATER: once you have confirmed the backfilled rows look right in the
-- admin UI, the old `extra` keys can be dropped. That is deliberately
-- NOT in this migration — losing the only copy of a student's education
-- on the same deploy that introduces the new table would be a very
-- bad trade for very little saved space.
-- ─────────────────────────────────────────────────────────────────
