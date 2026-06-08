-- Migration: partner RLS policies allow team members (v2)
--
-- v1 had infinite recursion: my subquery on partner_team_members
-- from a policy on partner_students triggers partner_team_members'
-- own RLS, which uses a self-aliased subquery that DOES re-apply
-- RLS to itself, causing Postgres to abort with "infinite
-- recursion detected in policy for relation partner_team_members".
--
-- Fix: introduce a SECURITY DEFINER function that does the
-- team-membership check with the table owner's permissions,
-- bypassing RLS for the lookup. The function is stable, so
-- the query planner can cache its result per-row.
--
-- We also revert v1's policies back to their v0 form (owner-only)
-- before adding the v2 policies that use the function, so we
-- don't have a half-broken state in between.

-- ===== Revert v1's policies back to owner-only =====
DROP POLICY IF EXISTS "Partner team can manage their own students" ON public.partner_students;
DROP POLICY IF EXISTS "Partner team can manage their own applications" ON public.partner_applications;
DROP POLICY IF EXISTS "Partner team can manage their own leads" ON public.partner_leads;
DROP POLICY IF EXISTS "Partner team can manage their own fees" ON public.partner_fees;

-- Recreate the original owner-only policies
CREATE POLICY "Partners can manage their own students"
  ON public.partner_students
  FOR ALL
  TO authenticated
  USING (partner_id IN (SELECT partners.id FROM partners WHERE partners.user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT partners.id FROM partners WHERE partners.user_id = auth.uid()));

CREATE POLICY "Partners can manage their own applications"
  ON public.partner_applications
  FOR ALL
  TO authenticated
  USING (partner_id IN (SELECT partners.id FROM partners WHERE partners.user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT partners.id FROM partners WHERE partners.user_id = auth.uid()));

CREATE POLICY "Partners can manage their own leads"
  ON public.partner_leads
  FOR ALL
  TO authenticated
  USING (partner_id IN (SELECT partners.id FROM partners WHERE partners.user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT partners.id FROM partners WHERE partners.user_id = auth.uid()));

CREATE POLICY "Partners can manage their own fees"
  ON public.partner_fees
  FOR ALL
  TO authenticated
  USING (partner_id IN (SELECT partners.id FROM partners WHERE partners.user_id = auth.uid()))
  WITH CHECK (partner_id IN (SELECT partners.id FROM partners WHERE partners.user_id = auth.uid()));

-- ===== Helper function: bypasses RLS to check team membership =====
CREATE OR REPLACE FUNCTION public.is_partner_team_member(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_team_members
    WHERE partner_id = p_partner_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- We also need a similar helper for the "owner of this partner org"
-- check, so partner_students RLS can match either path. Existing
-- policies use a subquery `partner_id IN (SELECT partners.id ...)`
-- which works for owners but is verbose; we centralize here.
CREATE OR REPLACE FUNCTION public.is_partner_owner(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partners
    WHERE id = p_partner_id
      AND user_id = auth.uid()
  );
$$;

-- Helper: combined "owner or active team member" check
CREATE OR REPLACE FUNCTION public.is_partner_member(p_partner_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_partner_owner(p_partner_id)
      OR public.is_partner_team_member(p_partner_id);
$$;

-- ===== Recreate the 4 partner_* policies using the helper =====
DROP POLICY IF EXISTS "Partners can manage their own students" ON public.partner_students;
CREATE POLICY "Partners can manage their own students"
  ON public.partner_students
  FOR ALL
  TO authenticated
  USING (public.is_partner_member(partner_id))
  WITH CHECK (public.is_partner_member(partner_id));

DROP POLICY IF EXISTS "Partners can manage their own applications" ON public.partner_applications;
CREATE POLICY "Partners can manage their own applications"
  ON public.partner_applications
  FOR ALL
  TO authenticated
  USING (public.is_partner_member(partner_id))
  WITH CHECK (public.is_partner_member(partner_id));

DROP POLICY IF EXISTS "Partners can manage their own leads" ON public.partner_leads;
CREATE POLICY "Partners can manage their own leads"
  ON public.partner_leads
  FOR ALL
  TO authenticated
  USING (public.is_partner_member(partner_id))
  WITH CHECK (public.is_partner_member(partner_id));

DROP POLICY IF EXISTS "Partners can manage their own fees" ON public.partner_fees;
CREATE POLICY "Partners can manage their own fees"
  ON public.partner_fees
  FOR ALL
  TO authenticated
  USING (public.is_partner_member(partner_id))
  WITH CHECK (public.is_partner_member(partner_id));
