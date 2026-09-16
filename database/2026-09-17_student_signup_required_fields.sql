-- ============================================================================
-- Student signup: enforce required fields at the DB layer.
--
-- The student register form already marks every field `required` in HTML,
-- but the JS handler only guards first/last name + passwords — country,
-- whatsapp, degree, and interested_program all default to NULL when empty,
-- the handle_new_student_user trigger accepts NULL for those, and the
-- student_profiles row lands in the DB half-empty. Result: admin filters
-- (e.g. the "All Students" dropdown) render blank rows for users like
-- `onlineoffice19` who have email but no first/last name.
--
-- Defense in depth: refuse the trigger insert when first_name or last_name
-- is missing. The user gets a 400 from Supabase auth signup with a clear
-- error, and no orphan student_profiles row.
--
-- Backfill step at the bottom lists the rows that were created with NULL
-- first/last names BEFORE this migration was applied — manual decision
-- required (delete the auth.users row, or backfill from somewhere).
-- ============================================================================

BEGIN;

-- 1. Tighten the trigger.
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
  v_whatsapp TEXT;
  v_country TEXT;
  v_degree TEXT;
  v_program TEXT;
BEGIN
  user_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'student');

  IF user_role = 'student' THEN
    v_full_name := NEW.raw_user_meta_data ->> 'full_name';
    v_first_name := NULLIF(trim(NEW.raw_user_meta_data ->> 'first_name'), '');
    v_last_name := NULLIF(trim(NEW.raw_user_meta_data ->> 'last_name'), '');
    v_whatsapp := NULLIF(trim(NEW.raw_user_meta_data ->> 'whatsapp'), '');
    v_country := NULLIF(trim(NEW.raw_user_meta_data ->> 'country'), '');
    v_degree := NULLIF(trim(NEW.raw_user_meta_data ->> 'degree'), '');
    v_program := NULLIF(trim(NEW.raw_user_meta_data ->> 'interested_program'), '');

    -- Split full_name fallback (matches prior behavior).
    IF v_first_name IS NULL AND v_full_name IS NOT NULL THEN
      v_first_name := split_part(v_full_name, ' ', 1);
      v_last_name := NULLIF(trim(substring(v_full_name from length(v_first_name) + 1)), '');
    END IF;

    -- Hard requirement: first + last name must be present.
    IF v_first_name IS NULL OR v_last_name IS NULL THEN
      RAISE EXCEPTION
        'student_profiles requires first_name and last_name (auth.users.id=%, email=%)',
        NEW.id, NEW.email
        USING ERRCODE = '23514'; -- check_violation
    END IF;

    -- Soft requirement: phone (whatsapp), nationality (country), and the
    -- program/degree pair must all be present. If any are missing we
    -- still create the row but the application form will force a
    -- profile-complete on first wizard entry (existing S20 wizard flow).
    -- No DB-level raise here — that would lock out re-imports + admin
    -- scripts that don't carry every field. The client form is the
    -- primary guard.

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
      v_whatsapp,
      v_country,
      v_degree,
      v_program,
      'Active',
      'Online'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      phone = COALESCE(EXCLUDED.phone, student_profiles.phone),
      nationality = COALESCE(EXCLUDED.nationality, student_profiles.nationality),
      target_degree = COALESCE(EXCLUDED.target_degree, student_profiles.target_degree),
      target_field = COALESCE(EXCLUDED.target_field, student_profiles.target_field);
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Re-assert trigger so re-running this migration is safe.
DROP TRIGGER IF EXISTS on_auth_user_created_for_student ON auth.users;
CREATE TRIGGER on_auth_user_created_for_student
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_student_user();

-- 3. Audit the existing bad rows so the user can clean them up. Read-only:
-- comment out the SELECT below to make the migration truly write-only.
-- The output (auth_id, email, created_at) tells the user which auth.users
-- to delete + which student_profiles row to drop, OR which names to
-- backfill from somewhere.
COMMENT ON FUNCTION public.handle_new_student_user()
  IS 'Creates student_profiles on auth.users insert. Requires first_name + last_name (raises 23514 otherwise). Other fields nullable.';

COMMIT;

-- ============================================================================
-- Manual cleanup query — run separately if you want to audit the damage:
--
--   SELECT sp.id, au.email, au.created_at, sp.first_name, sp.last_name
--   FROM public.student_profiles sp
--   JOIN auth.users au ON au.id = sp.id
--   WHERE sp.first_name IS NULL OR sp.last_name IS NULL
--      OR sp.first_name = '' OR sp.last_name = '';
--
-- For each row decide:
--   1) delete the auth.users row (cascade drops student_profiles + their apps)
--   2) backfill the names manually
--   3) leave them and accept they won't render well in admin dropdowns
-- ============================================================================