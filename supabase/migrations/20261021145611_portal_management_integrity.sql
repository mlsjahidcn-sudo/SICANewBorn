-- Repair schema drift and enforce the portal's owner/member and admin-field rules
-- at the database boundary, including direct authenticated PostgREST requests.
ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS program_slug varchar(120),
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'partner_portal',
  ADD COLUMN IF NOT EXISTS documents_requested jsonb NOT NULL DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_partner_applications_program_slug
  ON public.partner_applications(program_slug) WHERE program_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partner_applications_source
  ON public.partner_applications(source) WHERE source <> 'partner_portal';

-- This fixed UUID is the existing public-form routing contract, not a generated id.
INSERT INTO public.partners(id, user_id, email, company_name, contact_person, status, notes)
VALUES ('00000000-0000-0000-0000-0000000000d1', NULL,
  'public-applications@studyinchina.academy', 'Direct / Unassigned',
  'Public Application Form', 'Active', 'System partner for unattributed public applications.')
ON CONFLICT (id) DO NOTHING;

-- Recover only unambiguous catalog matches; free-text and ambiguous entries stay null.
WITH matches AS (
  SELECT pa.id, min(p.slug) AS slug
  FROM public.partner_applications pa
  JOIN public.universities u ON pa.university IN (u.slug, u.name)
  JOIN public.programs p ON p.university_slug = u.slug AND p.name = pa.program
  WHERE pa.program_slug IS NULL
  GROUP BY pa.id HAVING count(*) = 1
)
UPDATE public.partner_applications pa SET program_slug = matches.slug
FROM matches WHERE pa.id = matches.id;

CREATE SCHEMA IF NOT EXISTS sica_private;
REVOKE ALL ON SCHEMA sica_private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA sica_private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION sica_private.can_access_partner_record(p_partner_id uuid, p_creator_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1 FROM public.partner_team_members tm
    WHERE tm.partner_id = p_partner_id AND tm.user_id = (SELECT auth.uid())
      AND tm.status = 'active'
      AND (tm.role = 'owner' OR p_creator_id = (SELECT auth.uid()))
  );
$$;
REVOKE ALL ON FUNCTION sica_private.can_access_partner_record(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION sica_private.can_access_partner_record(uuid, uuid) TO authenticated, service_role;

ALTER TABLE public.partner_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Partners can manage their own students" ON public.partner_students;
CREATE POLICY "Partners can manage their own students" ON public.partner_students
  FOR ALL TO authenticated
  USING (sica_private.can_access_partner_record(partner_id, created_by_user_id))
  WITH CHECK (sica_private.can_access_partner_record(partner_id, created_by_user_id));
DROP POLICY IF EXISTS "Partners can manage their own applications" ON public.partner_applications;
CREATE POLICY "Partners can manage their own applications" ON public.partner_applications
  FOR ALL TO authenticated
  USING (sica_private.can_access_partner_record(partner_id, created_by_user_id))
  WITH CHECK (sica_private.can_access_partner_record(partner_id, created_by_user_id));
REVOKE ALL ON public.partner_students, public.partner_applications FROM anon;
REVOKE DELETE ON public.partner_students, public.partner_applications FROM authenticated;

CREATE OR REPLACE FUNCTION sica_private.guard_partner_student()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE profile_id uuid;
BEGIN
  -- auth.role() reads verified JWT claims; current_user would be the definer.
  IF coalesce(auth.role(), '') NOT IN ('authenticated', 'anon') OR public.is_admin() THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Archive students instead of deleting them' USING ERRCODE = '42501';
  ELSIF TG_OP = 'INSERT' THEN
    NEW.created_by_user_id := auth.uid();
    NEW.archived_at := NULL;
    NEW.archived_by_user_id := NULL;
    -- Preserve the existing server's email-based linking, but never accept an
    -- arbitrary profile UUID supplied through a direct database request.
    SELECT sp.id INTO profile_id FROM public.student_profiles sp
      WHERE sp.email = lower(btrim(NEW.student_email)) LIMIT 1;
    IF NEW.linked_student_profile_id IS NOT NULL
       AND NEW.linked_student_profile_id IS DISTINCT FROM profile_id THEN
      RAISE EXCEPTION 'Student profile links are managed by SICA' USING ERRCODE = '42501';
    END IF;
    NEW.linked_student_profile_id := profile_id;
  ELSE
    IF ROW(NEW.id, NEW.partner_id, NEW.created_by_user_id, NEW.created_at, NEW.linked_student_profile_id)
       IS DISTINCT FROM
       ROW(OLD.id, OLD.partner_id, OLD.created_by_user_id, OLD.created_at, OLD.linked_student_profile_id) THEN
      RAISE EXCEPTION 'Student ownership and profile links are managed by SICA' USING ERRCODE = '42501';
    END IF;
    IF NEW.archived_at IS DISTINCT FROM OLD.archived_at THEN
      NEW.archived_by_user_id := CASE WHEN NEW.archived_at IS NULL THEN NULL ELSE auth.uid() END;
    ELSE
      NEW.archived_by_user_id := OLD.archived_by_user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION sica_private.guard_partner_application()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE profile_id uuid;
BEGIN
  IF coalesce(auth.role(), '') NOT IN ('authenticated', 'anon') OR public.is_admin() THEN
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'Archive applications instead of deleting them' USING ERRCODE = '42501';
  ELSIF TG_OP = 'INSERT' THEN
    NEW.created_by_user_id := auth.uid();
    NEW.archived_at := NULL;
    NEW.archived_by_user_id := NULL;
    IF NEW.status IS DISTINCT FROM 'Draft' OR coalesce(NEW.decision, 'Pending') <> 'Pending'
      OR NEW.submitted_at IS NOT NULL OR NEW.source IS DISTINCT FROM 'partner_portal'
      OR NEW.documents_requested IS DISTINCT FROM '[]'::jsonb THEN
      RAISE EXCEPTION 'Application workflow fields are managed by SICA' USING ERRCODE = '42501';
    END IF;
    IF NEW.student_id IS NOT NULL THEN
      SELECT ps.linked_student_profile_id INTO profile_id FROM public.partner_students ps
      WHERE ps.id = NEW.student_id AND ps.partner_id = NEW.partner_id AND ps.archived_at IS NULL
        AND sica_private.can_access_partner_record(ps.partner_id, ps.created_by_user_id);
      IF NOT FOUND THEN
        RAISE EXCEPTION 'Student is not accessible in your organization' USING ERRCODE = '42501';
      END IF;
    END IF;
    IF NEW.linked_student_profile_id IS NOT NULL
       AND NEW.linked_student_profile_id IS DISTINCT FROM profile_id THEN
      RAISE EXCEPTION 'Student profile links are managed by SICA' USING ERRCODE = '42501';
    END IF;
    NEW.linked_student_profile_id := profile_id;
  ELSE
    IF ROW(NEW.id, NEW.partner_id, NEW.created_by_user_id, NEW.created_at,
           NEW.student_id, NEW.linked_student_profile_id, NEW.status, NEW.decision,
           NEW.submitted_at, NEW.application_number, NEW.source, NEW.documents_requested)
      IS DISTINCT FROM
       ROW(OLD.id, OLD.partner_id, OLD.created_by_user_id, OLD.created_at,
           OLD.student_id, OLD.linked_student_profile_id, OLD.status, OLD.decision,
           OLD.submitted_at, OLD.application_number, OLD.source, OLD.documents_requested) THEN
      RAISE EXCEPTION 'Application workflow, ownership and profile links are managed by SICA' USING ERRCODE = '42501';
    END IF;
    IF NEW.archived_at IS DISTINCT FROM OLD.archived_at THEN
      NEW.archived_by_user_id := CASE WHEN NEW.archived_at IS NULL THEN NULL ELSE auth.uid() END;
    ELSE
      NEW.archived_by_user_id := OLD.archived_by_user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION sica_private.guard_partner_student() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION sica_private.guard_partner_application() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS guard_partner_student ON public.partner_students;
CREATE TRIGGER guard_partner_student BEFORE INSERT OR UPDATE OR DELETE ON public.partner_students
FOR EACH ROW EXECUTE FUNCTION sica_private.guard_partner_student();
DROP TRIGGER IF EXISTS guard_partner_application ON public.partner_applications;
CREATE TRIGGER guard_partner_application BEFORE INSERT OR UPDATE OR DELETE ON public.partner_applications
FOR EACH ROW EXECUTE FUNCTION sica_private.guard_partner_application();
NOTIFY pgrst, 'reload schema';
