-- ============================================================================
-- Phase A: Link partner students to real student profiles
--
-- Business need: partner-created students live in `partner_students`, which
-- the admin cannot see or manage. This migration adds a bridge column
-- `linked_student_profile_id` so a partner student can be linked to (or
-- converted into) a real `student_profiles` row, unifying admin oversight.
-- ============================================================================

BEGIN;

-- 1. Bridge column on partner_students.
ALTER TABLE public.partner_students
  ADD COLUMN IF NOT EXISTS linked_student_profile_id UUID
    REFERENCES public.student_profiles(id)
    ON DELETE SET NULL;

-- 2. Mirror column on partner_applications for fast admin lookups from the
--    student profile detail page (Applications tab).
ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS linked_student_profile_id UUID
    REFERENCES public.student_profiles(id)
    ON DELETE SET NULL;

-- 3. Mirror column on student_documents for fast admin lookups from the
--    student profile detail page (Documents tab).
ALTER TABLE public.student_documents
  ADD COLUMN IF NOT EXISTS linked_student_profile_id UUID
    REFERENCES public.student_profiles(id)
    ON DELETE SET NULL;

-- 4. Partial indexes — only index rows that are actually linked.
CREATE INDEX IF NOT EXISTS idx_partner_students_linked_profile_id
  ON public.partner_students (linked_student_profile_id)
  WHERE linked_student_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_partner_applications_linked_profile_id
  ON public.partner_applications (linked_student_profile_id)
  WHERE linked_student_profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_student_documents_linked_profile_id
  ON public.student_documents (linked_student_profile_id)
  WHERE linked_student_profile_id IS NOT NULL;

-- 5. Ensure partner_students has an updated_at trigger.
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_partner_students_updated_at ON public.partner_students;
CREATE TRIGGER trg_partner_students_updated_at
  BEFORE UPDATE ON public.partner_students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Backfill linked_student_profile_id on partner_applications and
--    student_documents from their parent partner_students row. This makes
--    existing linked partner records immediately visible on the real
--    student profile detail tabs.
UPDATE public.partner_applications pa
SET linked_student_profile_id = ps.linked_student_profile_id
FROM public.partner_students ps
WHERE pa.student_id = ps.id
  AND ps.linked_student_profile_id IS NOT NULL
  AND pa.linked_student_profile_id IS NULL;

UPDATE public.student_documents sd
SET linked_student_profile_id = ps.linked_student_profile_id
FROM public.partner_students ps
WHERE sd.partner_student_id = ps.id
  AND ps.linked_student_profile_id IS NOT NULL
  AND sd.linked_student_profile_id IS NULL;

COMMIT;

-- Verification queries (run after applying):
--   SELECT COUNT(*) AS total,
--          COUNT(linked_student_profile_id) AS linked
--   FROM public.partner_students;
--
--   SELECT COUNT(*) AS total,
--          COUNT(linked_student_profile_id) AS linked
--   FROM public.partner_applications;
--
--   SELECT COUNT(*) AS total,
--          COUNT(linked_student_profile_id) AS linked
--   FROM public.student_documents;
