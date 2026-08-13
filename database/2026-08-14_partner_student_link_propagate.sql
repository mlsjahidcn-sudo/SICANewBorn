-- ============================================================================
-- Phase D: keep partner_students link in sync with child rows
--
-- Problem: when an admin links a partner student to a real
-- student_profiles row, the existing backfill only updates rows that
-- already exist at that moment. Applications or documents created by
-- the partner AFTER linking were missing linked_student_profile_id,
-- so they didn't appear on the admin student detail page.
--
-- Fix: a trigger that propagates linked_student_profile_id to
-- partner_applications and student_documents whenever the bridge
-- value changes on partner_students. This is idempotent and covers
-- both the initial link and any future re-links.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.propagate_partner_student_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.linked_student_profile_id IS DISTINCT FROM OLD.linked_student_profile_id THEN
    UPDATE public.partner_applications
    SET linked_student_profile_id = NEW.linked_student_profile_id
    WHERE student_id = NEW.id;

    UPDATE public.student_documents
    SET linked_student_profile_id = NEW.linked_student_profile_id
    WHERE partner_student_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_partner_student_link_propagate ON public.partner_students;
CREATE TRIGGER trg_partner_student_link_propagate
  AFTER UPDATE OF linked_student_profile_id ON public.partner_students
  FOR EACH ROW EXECUTE FUNCTION public.propagate_partner_student_link();
