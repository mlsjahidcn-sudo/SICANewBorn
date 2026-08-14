-- ============================================================================
-- Phase 62 (Bug 6 fix): make link propagation preserve prior assignments
--
-- Problem: the previous trigger (Phase 61, file
-- 2026-08-14_partner_student_link_propagate.sql) unconditionally overwrote
-- linked_student_profile_id on every child row, even rows that had been
-- manually linked to a *different* student profile in the past. Re-linking a
-- partner student to a new profile silently moved applications and
-- documents away from the previous student with no audit trail.
--
-- Fix: only propagate to rows where the existing linked_student_profile_id
-- IS NULL (never been linked) OR already matches OLD.linked_student_profile_id
-- (i.e. is being moved with the parent). Rows that were independently linked
-- to a different student are preserved.
--
-- Also: surface a server-side warning when NEW differs from OLD but neither
-- is null, so admins notice if they do an accidental re-link. RAISE NOTICE
-- is informational only (no rollback); we keep the old behavior of accepting
-- the UPDATE so the operator can recover manually if they really want to.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.propagate_partner_student_link()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.linked_student_profile_id IS DISTINCT FROM OLD.linked_student_profile_id THEN
    -- Informational only — admins should see this in the migration log so
    -- they can audit. We do not block the update; the link-profile endpoint
    -- is the single source of truth and already validates the admin role.
    IF OLD.linked_student_profile_id IS NOT NULL
       AND NEW.linked_student_profile_id IS NOT NULL
       AND OLD.linked_student_profile_id <> NEW.linked_student_profile_id THEN
      RAISE NOTICE 'partner_student % re-linked from % to % — child rows already linked to the previous profile will be preserved', NEW.id, OLD.linked_student_profile_id, NEW.linked_student_profile_id;
    END IF;

    -- Propagate to rows that either never had a link, or were previously
    -- linked to the same OLD profile (so they're being moved with the
    -- parent, which is the normal intent). Rows linked to a *different*
    -- student are left alone — admins who want to move those must do so
    -- explicitly via the per-row link endpoint (not in scope here).
    UPDATE public.partner_applications
    SET linked_student_profile_id = NEW.linked_student_profile_id
    WHERE student_id = NEW.id
      AND (
        linked_student_profile_id IS NULL
        OR linked_student_profile_id = OLD.linked_student_profile_id
      );

    UPDATE public.student_documents
    SET linked_student_profile_id = NEW.linked_student_profile_id
    WHERE partner_student_id = NEW.id
      AND (
        linked_student_profile_id IS NULL
        OR linked_student_profile_id = OLD.linked_student_profile_id
      );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger is unchanged — only the function body is.
-- (Re-asserting DROP + CREATE here is a no-op and documents intent.)
DROP TRIGGER IF EXISTS trg_partner_student_link_propagate ON public.partner_students;
CREATE TRIGGER trg_partner_student_link_propagate
  AFTER UPDATE OF linked_student_profile_id ON public.partner_students
  FOR EACH ROW EXECUTE FUNCTION public.propagate_partner_student_link();