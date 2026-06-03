-- ============================================================================
-- D1: Fix handle_new_student_user trigger — make it role-aware
-- ============================================================================
--
-- BEFORE: this trigger fired on EVERY new auth.users insert and created a
-- student_profiles row, regardless of whether the user was actually a student.
-- Result: every admin and partner user had a phantom student_profiles row,
-- which broke role-based routing (login pages would sometimes land the
-- user in the wrong portal because the student login page's useEffect was
-- still listening and any user with a student_profiles row got sent to /student).
--
-- AFTER: only create student_profiles if the new user is signing up as
-- a student. Admins and partners get NO student_profiles row at all,
-- and they're created by their respective sign-up scripts (or admin
-- provisioning flows) in their own tables.

CREATE OR REPLACE FUNCTION public.handle_new_student_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Read role from raw_user_meta_data (set by signUp options.data.role).
  -- Default to 'student' if missing so the existing self-signup flow
  -- (which doesn't set role explicitly) keeps working.
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'student');

  -- Only create a student_profiles row for actual students. Admins
  -- get an admin_profiles row via the auth-context signUp flow; partners
  -- get a partners row via create-partner.sh.
  IF user_role = 'student' THEN
    INSERT INTO public.student_profiles (id, email, status, source)
    VALUES (NEW.id, NEW.email, 'Active', 'Online')
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger is already wired (DROP TRIGGER IF EXISTS + CREATE TRIGGER).
-- Just re-assert it so re-running this migration is safe.
DROP TRIGGER IF EXISTS on_auth_user_created_for_student ON auth.users;
CREATE TRIGGER on_auth_user_created_for_student
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student_user();

-- ============================================================================
-- D2: Cleanup — delete phantom student_profiles rows for non-student users
-- ============================================================================
--
-- For all auth.users whose user_metadata.role is NOT 'student', drop their
-- student_profiles row. We do this in SQL (not in the API) because:
--   - We have service-role access here
--   - It's a one-shot cleanup, not a user-triggered action
--   - RLS would otherwise block the DELETE

DELETE FROM public.student_profiles
WHERE id IN (
  SELECT id FROM auth.users
  WHERE COALESCE(raw_user_meta_data ->> 'role', 'student') <> 'student'
);
