-- Fix: infinite recursion in admin_profiles RLS policies
-- Run via Management API on the new project
-- Replaces the inline EXISTS check with a SECURITY DEFINER function that bypasses RLS

-- 1. Create the helper function (runs as definer, not subject to RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND is_active = true
  );
$$;

-- 2. Drop the recursive policies and recreate with is_admin()
DROP POLICY IF EXISTS "Admins can view all admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can update admin profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Admins can view all student profiles" ON student_profiles;
DROP POLICY IF EXISTS "Admins can update all student profiles" ON student_profiles;
DROP POLICY IF EXISTS "Admins can view all applications" ON student_applications;
DROP POLICY IF EXISTS "Admins can update all applications" ON student_applications;
DROP POLICY IF EXISTS "Admins can view all documents" ON student_documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON student_documents;
DROP POLICY IF EXISTS "Admins can view and manage all timeline entries" ON application_timeline;
DROP POLICY IF EXISTS "Admins can create notifications for students" ON student_notifications;
DROP POLICY IF EXISTS "Admins can view all partners" ON partners;
DROP POLICY IF EXISTS "Admins can manage partners" ON partners;
DROP POLICY IF EXISTS "Admins can view all partner students" ON partner_students;

-- 3. Recreate all admin-side policies using is_admin()
CREATE POLICY "Admins can view all admin profiles"
  ON admin_profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update admin profiles"
  ON admin_profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can view all student profiles"
  ON student_profiles FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all student profiles"
  ON student_profiles FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "Admins can view all applications"
  ON student_applications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all applications"
  ON student_applications FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can view all documents"
  ON student_documents FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update all documents"
  ON student_documents FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can view and manage all timeline entries"
  ON application_timeline FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can create notifications for students"
  ON student_notifications FOR INSERT
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view all partners"
  ON partners FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can manage partners"
  ON partners FOR ALL
  USING (public.is_admin());

CREATE POLICY "Admins can view all partner students"
  ON partner_students FOR SELECT
  USING (public.is_admin());
