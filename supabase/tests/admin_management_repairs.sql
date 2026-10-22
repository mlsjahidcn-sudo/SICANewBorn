-- Run after the migration. All fixtures and edits roll back.
begin;
do $$
declare actor uuid := gen_random_uuid(); student uuid := gen_random_uuid(); app uuid := gen_random_uuid(); partner_app uuid := gen_random_uuid(); original_time timestamptz; changed public.student_profiles;
begin
  -- Generated identities are inserted directly inside this rolled-back
  -- transaction; no auth email or application notification is dispatched.
  insert into auth.users(id,email,raw_user_meta_data)
    select uid,uid::text || '@admin-repair-regression.invalid','{"role":"student","first_name":"Review","last_name":"Fixture"}'::jsonb
    from unnest(array[actor,student]) uid;
  insert into public.student_profiles(id,first_name,extra,updated_at) values(student,'Review fixture','{"original":"kept"}',now()-interval '1 day')
    on conflict(id) do update set extra='{"original":"kept"}',updated_at=now()-interval '1 day';
  insert into public.student_applications(id,student_id,university_id,university_name,program_name,degree,intake,status) values(app,student,'review-fixture','Review fixture','Review fixture','Bachelor','2027 Fall','Submitted');
  select updated_at into original_time from public.student_profiles where id=student;
  select * into changed from public.admin_patch_student(student,'{"phone":""}','{"first":"one"}',original_time);
  perform public.admin_patch_student(student,'{}','{"second":"two"}',null);
  if (select extra->>'original' from public.student_profiles where id=student) <> 'kept' or
     (select extra->>'first' from public.student_profiles where id=student) <> 'one' or
     (select extra->>'second' from public.student_profiles where id=student) <> 'two' then raise exception 'Atomic JSON merge lost fields'; end if;
  begin
    -- Production's timestamp trigger uses transaction-stable NOW(). Model a
    -- version from a prior HTTP request explicitly inside this single transaction.
    perform public.admin_patch_student(student,'{"phone":"stale"}','{}',original_time - interval '1 microsecond');
    raise exception 'Expected version conflict';
  exception when serialization_failure then null; end;
  perform public.admin_archive_application(app,'student',true,actor);
  perform public.admin_archive_application(app,'student',true,actor);
  if (select status from public.student_applications where id=app) <> 'Submitted' then raise exception 'Archive changed workflow status'; end if;
  if (select count(*) from public.admin_application_actions where application_id=app) <> 1 then raise exception 'Archive replay created another event'; end if;
  perform public.admin_archive_application(app,'student',false,actor);
  if (select archived_at from public.student_applications where id=app) is not null then raise exception 'Restore failed'; end if;
  if (select count(*) from public.admin_application_actions where application_id=app) <> 2 then raise exception 'Missing restore audit'; end if;
  insert into public.application_internal_notes(application_id,content,updated_by) values(app,'private fixture',actor);
  perform public.admin_append_application_note(app,'student','appended fixture',actor);
  if (select content from public.application_internal_notes where application_id=app) <> E'private fixture\n\nappended fixture' then raise exception 'Append lost note content'; end if;
  if has_table_privilege('authenticated','public.application_internal_notes','SELECT') or
     has_table_privilege('anon','public.application_internal_notes','SELECT') or
     has_table_privilege('authenticated','public.partner_application_internal_notes','SELECT') or
     has_function_privilege('authenticated','public.admin_append_application_note(uuid,text,text,uuid)','EXECUTE') or
     has_table_privilege('authenticated','public.admin_application_actions','SELECT') or
     has_function_privilege('authenticated','public.admin_archive_application(uuid,text,boolean,uuid)','EXECUTE') or
     has_function_privilege('authenticated','public.admin_patch_student(uuid,jsonb,jsonb,timestamp with time zone)','EXECUTE') then raise exception 'Private data or RPC exposed to applicant roles'; end if;
  begin
    perform public.admin_archive_application(gen_random_uuid(),'student',true,actor);
    raise exception 'Missing application accepted';
  exception when no_data_found then null; end;
end $$;
set local role authenticated;
do $$ begin
  begin perform content from public.application_internal_notes; raise exception 'Private note readable';
  exception when insufficient_privilege then null; end;
  begin perform public.admin_archive_application(gen_random_uuid(),'student',true,null); raise exception 'RPC callable by student';
  exception when insufficient_privilege then null; end;
end $$;
rollback;
