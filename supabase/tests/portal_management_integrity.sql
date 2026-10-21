-- Live/local integration regression test. Every fixture and mutation is rolled back.
-- Run as postgres through SQL Editor or psql after the matching migration.
BEGIN;
DO $$
DECLARE
  owner_id uuid := gen_random_uuid();
  member_id uuid := gen_random_uuid();
  sibling_id uuid := gen_random_uuid();
  outsider_id uuid := gen_random_uuid();
  org_id uuid := gen_random_uuid();
  other_org_id uuid := gen_random_uuid();
  student_id uuid := gen_random_uuid();
  sibling_student_id uuid := gen_random_uuid();
  other_student_id uuid := gen_random_uuid();
  app_id uuid := gen_random_uuid();
  sibling_app_id uuid := gen_random_uuid();
  other_app_id uuid := gen_random_uuid();
  inserted_id uuid;
  n integer;
  field record;
BEGIN
  INSERT INTO auth.users(id, email, raw_user_meta_data)
  SELECT uid, uid::text || '@portal-regression.invalid', '{"role":"partner"}'::jsonb
  FROM unnest(ARRAY[owner_id, member_id, sibling_id, outsider_id]) uid;
  INSERT INTO public.partners(id, user_id, company_name)
    VALUES (org_id, owner_id, 'Rollback test'), (other_org_id, outsider_id, 'Rollback other org');
  INSERT INTO public.partner_team_members(partner_id, user_id, role, status)
    VALUES (org_id, owner_id, 'owner', 'active'), (org_id, member_id, 'member', 'active'),
      (org_id, sibling_id, 'member', 'active'), (other_org_id, outsider_id, 'owner', 'active');
  INSERT INTO public.partner_students(id, partner_id, created_by_user_id, student_name)
    VALUES (student_id, org_id, member_id, 'Own'), (sibling_student_id, org_id, sibling_id, 'Sibling'),
      (other_student_id, other_org_id, outsider_id, 'Other organization');
  INSERT INTO public.partner_applications(id, partner_id, created_by_user_id, student_id, student_name)
    VALUES (app_id, org_id, member_id, student_id, 'Own'),
      (sibling_app_id, org_id, sibling_id, sibling_student_id, 'Sibling'),
      (other_app_id, other_org_id, outsider_id, other_student_id, 'Other organization');

  PERFORM set_config('request.jwt.claim.sub', member_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub',member_id,'role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM public.partner_students WHERE partner_id IN (org_id, other_org_id);
  IF n <> 1 THEN RAISE EXCEPTION 'Member can read another creator or organization'; END IF;
  SELECT count(*) INTO n FROM public.partner_applications WHERE partner_id IN (org_id, other_org_id);
  IF n <> 1 THEN RAISE EXCEPTION 'Member application read scope failed'; END IF;
  UPDATE public.partner_applications SET notes='forbidden' WHERE id=sibling_app_id;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 0 THEN RAISE EXCEPTION 'Member changed a sibling application'; END IF;

  -- Normal partner edits, catalog saves, archive and restore must still work.
  UPDATE public.partner_applications SET program='New program', program_slug='regression-program', notes='edited' WHERE id=app_id;
  UPDATE public.partner_applications SET archived_at=now(), archived_by_user_id=outsider_id WHERE id=app_id;
  SELECT count(*) INTO n FROM public.partner_applications WHERE id=app_id AND archived_by_user_id=member_id;
  IF n <> 1 THEN RAISE EXCEPTION 'Archive actor was not server derived'; END IF;
  UPDATE public.partner_applications SET archived_at=NULL WHERE id=app_id;
  UPDATE public.partner_students SET student_name='Edited', archived_at=now() WHERE id=student_id;
  UPDATE public.partner_students SET archived_at=NULL WHERE id=student_id;

  FOR field IN SELECT * FROM (VALUES
    ('status', quote_literal('Accepted')), ('decision', quote_literal('Accepted')),
    ('submitted_at', 'now()'), ('application_number', quote_literal('spoofed')),
    ('source', quote_literal('public_form')), ('documents_requested', quote_literal('[{"name":"Passport"}]') || '::jsonb'),
    ('created_by_user_id', quote_literal(sibling_id)), ('partner_id', quote_literal(other_org_id)),
    ('student_id', quote_literal(sibling_student_id)), ('linked_student_profile_id', quote_literal(gen_random_uuid()))
  ) AS fields(name, value)
  LOOP
    BEGIN
      EXECUTE format('UPDATE public.partner_applications SET %I=%s WHERE id=%L', field.name, field.value, app_id);
      RAISE EXCEPTION 'Partner was allowed to change application field %', field.name;
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
  END LOOP;
  FOR field IN SELECT * FROM (VALUES
    ('created_by_user_id', quote_literal(sibling_id)), ('partner_id', quote_literal(other_org_id)),
    ('linked_student_profile_id', quote_literal(gen_random_uuid()))
  ) AS fields(name, value)
  LOOP
    BEGIN
      EXECUTE format('UPDATE public.partner_students SET %I=%s WHERE id=%L', field.name, field.value, student_id);
      RAISE EXCEPTION 'Partner was allowed to change student field %', field.name;
    EXCEPTION WHEN insufficient_privilege THEN NULL;
    END;
  END LOOP;
  BEGIN
    DELETE FROM public.partner_applications WHERE id=app_id;
    RAISE EXCEPTION 'Partner could hard delete an application';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    DELETE FROM public.partner_students WHERE id=student_id;
    RAISE EXCEPTION 'Partner could hard delete a student';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.partner_applications(partner_id, student_id) VALUES (org_id, sibling_student_id);
    RAISE EXCEPTION 'Member could create an application for a sibling student';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.partner_applications(partner_id, status) VALUES (org_id, 'Accepted');
    RAISE EXCEPTION 'Partner could create an accepted application';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;
  BEGIN
    INSERT INTO public.partner_applications(partner_id) VALUES (other_org_id);
    RAISE EXCEPTION 'Partner could insert into a foreign organization';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  -- A forged creator is overwritten, not accepted. Defaults keep both deployed POSTs valid.
  INSERT INTO public.partner_students(partner_id, created_by_user_id, student_name)
    VALUES(org_id, sibling_id, 'New own student') RETURNING id INTO inserted_id;
  SELECT count(*) INTO n FROM public.partner_students WHERE id=inserted_id AND created_by_user_id=member_id;
  IF n <> 1 THEN RAISE EXCEPTION 'Student creator spoofing succeeded'; END IF;
  INSERT INTO public.partner_applications(partner_id, created_by_user_id, student_id, decision)
    VALUES(org_id, sibling_id, inserted_id, 'Pending') RETURNING id INTO inserted_id;
  SELECT count(*) INTO n FROM public.partner_applications WHERE id=inserted_id AND created_by_user_id=member_id
    AND source='partner_portal' AND documents_requested='[]'::jsonb;
  IF n <> 1 THEN RAISE EXCEPTION 'Application create or protected defaults failed'; END IF;

  RESET ROLE;
  PERFORM set_config('request.jwt.claim.sub', owner_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub',owner_id,'role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM public.partner_applications WHERE partner_id IN (org_id, other_org_id);
  IF n <> 3 THEN RAISE EXCEPTION 'Owner cannot see all own organization applications, or can see foreign ones'; END IF;
  UPDATE public.partner_applications SET notes='owner edit' WHERE id=sibling_app_id;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Owner cannot edit team application'; END IF;
  BEGIN
    UPDATE public.partner_applications SET status='Accepted' WHERE id=sibling_app_id;
    RAISE EXCEPTION 'Partner owner could change admin workflow';
  EXCEPTION WHEN insufficient_privilege THEN NULL; END;

  RESET ROLE;
  UPDATE public.partner_team_members SET status='suspended' WHERE user_id=member_id;
  PERFORM set_config('request.jwt.claim.sub', member_id::text, true);
  PERFORM set_config('request.jwt.claims', json_build_object('sub',member_id,'role','authenticated')::text, true);
  SET LOCAL ROLE authenticated;
  SELECT count(*) INTO n FROM public.partner_applications WHERE partner_id=org_id;
  IF n <> 0 THEN RAISE EXCEPTION 'Suspended member retained access'; END IF;

  RESET ROLE;
  PERFORM set_config('request.jwt.claim.sub', '', true);
  PERFORM set_config('request.jwt.claims', '{"role":"service_role"}', true);
  SET LOCAL ROLE service_role;
  UPDATE public.partner_applications SET status='Accepted', source='admin_manual',
    documents_requested='[{"name":"Passport"}]'::jsonb WHERE id=app_id;
  GET DIAGNOSTICS n = ROW_COUNT;
  IF n <> 1 THEN RAISE EXCEPTION 'Admin server can no longer update workflow/documents'; END IF;
  RESET ROLE;
END;
$$;
ROLLBACK;
SELECT 'All portal database regression assertions passed; fixtures rolled back' AS result;
