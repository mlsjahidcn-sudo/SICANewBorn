-- Migration: Partner team can manage documents they upload for their students
--
-- Phase 1 of the "Partner portal — student document management" feature.
-- Goal: let a partner (org owner OR active team member) upload/manage files
-- on behalf of their partner_students rows. Reuses the existing
-- `student_documents` table — admin reviewers see partner docs in the same
-- queue as student-uploaded docs.
--
-- This is the data-layer change. The API + UI tracks (Track 2 + 3) will
-- wire the partner portal's "Documents" page against these new columns
-- and the new RLS helper.
--
-- Design notes:
--  - partner_student_id:    nullable FK → partner_students(id) CASCADE.
--                           Set when the doc is partner-managed.
--  - partner_application_id: nullable FK → partner_applications(id) SET NULL.
--                           Optional context: "this doc goes with this app".
--                           Brief originally only listed partner_student_id;
--                           adding application_id here is a free win for the
--                           review context (mirrors student-side application_id).
--  - student_id:            stays NULL on partner-uploaded rows (Q3a).
--                           The existing student-side RLS policies all
--                           gate on `student_id = auth.uid()`, so a NULL
--                           student_id is invisible to students — they
--                           never see a partner-uploaded doc in their
--                           /student/documents view.
--  - The existing admin policies ("Admins can view/update all documents")
--    remain in place. They gate on `is_admin()` only and don't filter
--    on student_id, so partner-uploaded docs (student_id=NULL) are still
--    visible to admins in the review queue. Intentional.

BEGIN;

-- ===== Columns =====
ALTER TABLE public.student_documents
  ADD COLUMN IF NOT EXISTS partner_student_id UUID
    REFERENCES public.partner_students(id) ON DELETE CASCADE;

ALTER TABLE public.student_documents
  ADD COLUMN IF NOT EXISTS partner_application_id UUID
    REFERENCES public.partner_applications(id) ON DELETE SET NULL;

-- ===== Indexes (partial — only rows tied to a partner are indexed) =====
CREATE INDEX IF NOT EXISTS idx_student_documents_partner_student_id
  ON public.student_documents(partner_student_id)
  WHERE partner_student_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_student_documents_partner_application_id
  ON public.student_documents(partner_application_id)
  WHERE partner_application_id IS NOT NULL;

-- ===== Helper: bypasses RLS to check partner membership via partner_student_id =====
--
-- Why SECURITY DEFINER + STABLE + search_path = public:
--   The RLS policy on `student_documents` would otherwise recurse into
--   `partner_students` → `partner_team_members` → RLS on
--   `partner_team_members` → ... (this is the trap Phase 5b v1 hit
--   and rolled back). Running with the function owner's permissions
--   bypasses RLS for the lookup, and the planner can cache the result
--   per-row (STABLE). search_path is pinned to public so a hostile
--   search_path change can't redirect the query.
--
-- The body joins partner_students.partner_id into the existing
-- is_partner_member helper from Phase 5b, which already handles
-- "owner OR active team member" in a single check.
CREATE OR REPLACE FUNCTION public.is_doc_partner_member(p_partner_student_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_partner_member(ps.partner_id)
  FROM public.partner_students ps
  WHERE ps.id = p_partner_student_id;
$$;

-- ===== RLS policies: partner team can manage their own documents =====
--
-- Scoped to `authenticated` (matches the student-side policies). The
-- helper check is the ONLY thing that matters — there's no way for
-- a partner to forge access because is_doc_partner_member joins
-- through partner_students.partner_id → is_partner_member, which
-- matches either the org owner (partners.user_id) or an active
-- team member (partner_team_members.user_id).
--
-- We gate on `partner_student_id IS NOT NULL` so partner rows
-- cannot accidentally also satisfy the student-side RLS, and so the
-- policies can't be used to read another partner's docs by passing
-- a NULL partner_student_id (the NULL short-circuits the AND).

DROP POLICY IF EXISTS "Partner team can view their own documents" ON public.student_documents;
CREATE POLICY "Partner team can view their own documents"
  ON public.student_documents
  FOR SELECT
  TO authenticated
  USING (
    partner_student_id IS NOT NULL
    AND public.is_doc_partner_member(partner_student_id)
  );

DROP POLICY IF EXISTS "Partner team can insert their own documents" ON public.student_documents;
CREATE POLICY "Partner team can insert their own documents"
  ON public.student_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    partner_student_id IS NOT NULL
    AND public.is_doc_partner_member(partner_student_id)
  );

DROP POLICY IF EXISTS "Partner team can update their own documents" ON public.student_documents;
CREATE POLICY "Partner team can update their own documents"
  ON public.student_documents
  FOR UPDATE
  TO authenticated
  USING (
    partner_student_id IS NOT NULL
    AND public.is_doc_partner_member(partner_student_id)
  )
  WITH CHECK (
    partner_student_id IS NOT NULL
    AND public.is_doc_partner_member(partner_student_id)
  );

DROP POLICY IF EXISTS "Partner team can delete their own documents" ON public.student_documents;
CREATE POLICY "Partner team can delete their own documents"
  ON public.student_documents
  FOR DELETE
  TO authenticated
  USING (
    partner_student_id IS NOT NULL
    AND public.is_doc_partner_member(partner_student_id)
  );

-- ===== Intentional non-change: existing admin policies =====
--
-- "Admins can view all documents" (FOR SELECT) and "Admins can update
-- all documents" (FOR ALL) from Phase 2 remain in place untouched.
-- They gate purely on `is_admin()` (admin_profiles.role) and do NOT
-- filter on student_id, so a partner-uploaded row with student_id=NULL
-- is still visible + updatable in the admin review queue. The new
-- partner-team policies above are ADDITIVE — they don't drop or
-- replace the student-side or admin-side policies.

COMMIT;
