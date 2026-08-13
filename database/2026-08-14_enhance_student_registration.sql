-- ============================================================================
-- Enhance student self-registration so names + core profile fields survive
-- from the public signup form into student_profiles.
--
-- Problem: /student/register only collected fullName and the trigger only
-- copied id/email/status/source into student_profiles, so admin students
-- listing showed "—" for every self-registered student.
--
-- Fix:
--   1. Update handle_new_student_user to read first_name, last_name, country,
--      whatsapp, degree, and interested_program from raw_user_meta_data.
--   2. Backfill existing student_profiles rows that are missing names from
--      auth.users.user_metadata.full_name.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_student_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
  v_full_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Read role from raw_user_meta_data (set by signUp options.data.role).
  -- Default to 'student' if missing so the existing self-signup flow
  -- (which doesn't set role explicitly) keeps working.
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'student');

  -- Only create/update a student_profiles row for actual students. Admins
  -- get an admin_profiles row via the auth-context signUp flow; partners
  -- get a partners row via create-partner.sh.
  IF user_role = 'student' THEN
    v_full_name := NEW.raw_user_meta_data ->> 'full_name';
    v_first_name := NEW.raw_user_meta_data ->> 'first_name';
    v_last_name := NEW.raw_user_meta_data ->> 'last_name';

    -- Fallback: split full_name on the first space.
    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
      v_first_name := split_part(v_full_name, ' ', 1);
      v_last_name := NULLIF(trim(substring(v_full_name from length(v_first_name) + 1)), '');
    END IF;

    INSERT INTO public.student_profiles (
      id,
      email,
      first_name,
      last_name,
      phone,
      nationality,
      target_degree,
      target_field,
      status,
      source
    ) VALUES (
      NEW.id,
      NEW.email,
      v_first_name,
      v_last_name,
      NEW.raw_user_meta_data ->> 'whatsapp',
      NEW.raw_user_meta_data ->> 'country',
      NEW.raw_user_meta_data ->> 'degree',
      NEW.raw_user_meta_data ->> 'interested_program',
      'Active',
      'Online'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = COALESCE(EXCLUDED.first_name, student_profiles.first_name),
      last_name = COALESCE(EXCLUDED.last_name, student_profiles.last_name),
      phone = COALESCE(EXCLUDED.phone, student_profiles.phone),
      nationality = COALESCE(EXCLUDED.nationality, student_profiles.nationality),
      target_degree = COALESCE(EXCLUDED.target_degree, student_profiles.target_degree),
      target_field = COALESCE(EXCLUDED.target_field, student_profiles.target_field);
  END IF;

  RETURN NEW;
END;
$$;

-- Re-assert trigger so re-running this migration is safe.
DROP TRIGGER IF EXISTS on_auth_user_created_for_student ON auth.users;
CREATE TRIGGER on_auth_user_created_for_student
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student_user();

-- ============================================================================
-- Backfill names for existing self-registered students
-- ============================================================================
--
-- Any student_profiles row with empty first_name/last_name gets its name
-- from the corresponding auth.users.user_metadata.full_name value.
-- We only touch rows where the names are missing to avoid overwriting
-- data that admins may have already cleaned up.

UPDATE public.student_profiles sp
SET
  first_name = COALESCE(NULLIF(trim(sp.first_name), ''), split_part(u.raw_user_meta_data ->> 'full_name', ' ', 1)),
  last_name = COALESCE(NULLIF(trim(sp.last_name), ''), NULLIF(trim(substring(u.raw_user_meta_data ->> 'full_name' from length(split_part(u.raw_user_meta_data ->> 'full_name', ' ', 1)) + 1)), ''))
FROM auth.users u
WHERE sp.id = u.id
  AND (NULLIF(trim(sp.first_name), '') IS NULL OR NULLIF(trim(sp.last_name), '') IS NULL)
  AND NULLIF(trim(u.raw_user_meta_data ->> 'full_name'), '') IS NOT NULL;
