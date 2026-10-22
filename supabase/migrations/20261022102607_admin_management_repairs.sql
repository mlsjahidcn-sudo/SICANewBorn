-- Keep applicant messages on admin_notes; private collaboration has its own
-- service-only table, unreachable by student/partner Data API sessions.
create table if not exists public.application_internal_notes (
  application_id uuid primary key references public.student_applications(id) on delete cascade,
  content text not null default '' check (length(content) <= 8000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.application_internal_notes enable row level security;
revoke all on public.application_internal_notes from public, anon, authenticated;
grant select, insert, update, delete on public.application_internal_notes to service_role;

alter table public.student_applications add column if not exists archived_at timestamptz;
create index if not exists student_applications_active_idx on public.student_applications(created_at, id) where archived_at is null;

create table if not exists public.admin_application_actions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null,
  surface text not null check (surface in ('student','partner')),
  action text not null check (action in ('archive','restore')),
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.admin_application_actions enable row level security;
revoke all on public.admin_application_actions from public, anon, authenticated;
grant select, insert on public.admin_application_actions to service_role;

create or replace function public.admin_archive_application(p_id uuid, p_surface text, p_archive boolean, p_actor uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare affected integer;
begin
  if p_surface = 'student' then
    update public.student_applications set archived_at = case when p_archive then now() else null end
      where id = p_id and (archived_at is not null) <> p_archive;
  elsif p_surface = 'partner' then
    update public.partner_applications set archived_at = case when p_archive then now() else null end
      where id = p_id and (archived_at is not null) <> p_archive;
  else raise exception 'Invalid surface'; end if;
  get diagnostics affected = row_count;
  if affected = 0 then
    if (p_surface = 'student' and not exists (select 1 from public.student_applications where id=p_id))
      or (p_surface = 'partner' and not exists (select 1 from public.partner_applications where id=p_id)) then
      raise exception 'Application not found' using errcode='P0002';
    end if;
    return;
  end if;
  insert into public.admin_application_actions(application_id,surface,action,actor_id)
    values (p_id,p_surface,case when p_archive then 'archive' else 'restore' end,p_actor);
end $$;
revoke all on function public.admin_archive_application(uuid,text,boolean,uuid) from public,anon,authenticated;
grant execute on function public.admin_archive_application(uuid,text,boolean,uuid) to service_role;

-- Lock before merging JSONB. Concurrent edits to distinct extra fields survive;
-- editors that send a version get a conflict instead of overwriting newer work.
create or replace function public.admin_patch_student(p_id uuid, p_updates jsonb, p_extra jsonb, p_expected_updated_at timestamptz default null)
returns public.student_profiles language plpgsql security invoker set search_path = '' as $$
declare current_row public.student_profiles; result_row public.student_profiles;
  patch jsonb; assignments text; field text;
begin
  select * into current_row from public.student_profiles where id=p_id for update;
  if not found then raise exception 'Student not found' using errcode='P0002'; end if;
  if p_expected_updated_at is not null and current_row.updated_at is distinct from p_expected_updated_at then
    raise exception 'This student was updated by someone else. Reload before saving.' using errcode='40001';
  end if;
  if jsonb_typeof(p_updates) <> 'object' or jsonb_typeof(p_extra) <> 'object' then raise exception 'Invalid patch'; end if;
  patch := p_updates - 'id' - 'user_id' - 'created_at' - 'updated_at' - 'extra';
  patch := patch || jsonb_build_object('extra',coalesce(current_row.extra,'{}'::jsonb) || p_extra);
  for field in select jsonb_object_keys(patch) loop
    if not exists (select 1 from pg_catalog.pg_attribute where attrelid='public.student_profiles'::regclass and attname=field and attnum>0 and not attisdropped) then
      raise exception 'Unknown student field';
    end if;
  end loop;
  select string_agg(format('%I = (jsonb_populate_record(null::public.student_profiles,$1)).%I',key,key),', ')
    into assignments from jsonb_object_keys(patch) key;
  execute format('update public.student_profiles set %s where id=$2 returning *',assignments) into result_row using patch,p_id;
  return result_row;
end $$;
revoke all on function public.admin_patch_student(uuid,jsonb,jsonb,timestamptz) from public,anon,authenticated;
grant execute on function public.admin_patch_student(uuid,jsonb,jsonb,timestamptz) to service_role;

create table if not exists public.partner_application_internal_notes (
  application_id uuid primary key references public.partner_applications(id) on delete cascade,
  content text not null default '' check (length(content) <= 8000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
alter table public.partner_application_internal_notes enable row level security;
revoke all on public.partner_application_internal_notes from public,anon,authenticated;
grant select,insert,update,delete on public.partner_application_internal_notes to service_role;

create or replace function public.admin_append_application_note(p_id uuid,p_surface text,p_content text,p_actor uuid)
returns void language plpgsql security invoker set search_path='' as $$
begin
  if p_surface='student' then
    insert into public.application_internal_notes(application_id,content,updated_by) values(p_id,p_content,p_actor)
      on conflict(application_id) do update set content=concat_ws(E'\n\n',nullif(public.application_internal_notes.content,''),excluded.content),updated_by=p_actor,updated_at=now();
  elsif p_surface='partner' then
    insert into public.partner_application_internal_notes(application_id,content,updated_by) values(p_id,p_content,p_actor)
      on conflict(application_id) do update set content=concat_ws(E'\n\n',nullif(public.partner_application_internal_notes.content,''),excluded.content),updated_by=p_actor,updated_at=now();
  else raise exception 'Invalid surface'; end if;
end $$;
revoke all on function public.admin_append_application_note(uuid,text,text,uuid) from public,anon,authenticated;
grant execute on function public.admin_append_application_note(uuid,text,text,uuid) to service_role;
