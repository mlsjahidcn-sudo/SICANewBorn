-- Application messages: a text conversation on every application.
--   student applications → SICA admin ↔ the student
--   partner applications → SICA admin ↔ the partner team that can see it
--
-- Access model: RLS on with NO policies, so anon/authenticated Data API
-- sessions can't read or write it at all. Every read/write goes through the
-- Next.js API routes, which run an explicit permission check and then use
-- the service-role client (same pattern as application_internal_notes,
-- newsletter_subscribers, chatbot tables).
--
-- Idempotent: safe to run more than once.

create table if not exists public.application_messages (
  id uuid primary key default gen_random_uuid(),
  student_application_id uuid references public.student_applications(id) on delete cascade,
  partner_application_id uuid references public.partner_applications(id) on delete cascade,
  sender_role text not null check (sender_role in ('admin', 'student', 'partner')),
  sender_user_id uuid references auth.users(id) on delete set null,
  -- Display snapshot so the name survives account deletion.
  sender_name text not null default '' check (length(sender_name) <= 200),
  body text not null check (length(btrim(body)) between 1 and 5000),
  -- When the OTHER side read it. Portal-sent: any admin. Admin-sent: the
  -- student, or any partner team member who can see the application.
  read_at timestamptz,
  -- Set when this message triggered an email (one-hour throttle per side).
  emailed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint application_messages_one_application check (
    (student_application_id is not null) <> (partner_application_id is not null)
  )
);

create index if not exists application_messages_student_app_idx
  on public.application_messages (student_application_id, created_at)
  where student_application_id is not null;
create index if not exists application_messages_partner_app_idx
  on public.application_messages (partner_application_id, created_at)
  where partner_application_id is not null;
create index if not exists application_messages_unread_portal_idx
  on public.application_messages (created_at)
  where sender_role <> 'admin' and read_at is null;

alter table public.application_messages enable row level security;
revoke all on public.application_messages from public, anon, authenticated;
grant select, insert, update, delete on public.application_messages to service_role;

-- Admin inbox: one row per conversation, waiting-for-reply first.
create or replace function public.admin_message_inbox(
  p_only_unread boolean default false,
  p_limit integer default 25,
  p_offset integer default 0
)
returns table (
  surface text,
  application_id uuid,
  application_number text,
  person_name text,
  partner_name text,
  university text,
  program text,
  last_body text,
  last_sender_role text,
  last_at timestamptz,
  unread_count bigint,
  oldest_unread_at timestamptz,
  total_count bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  with msgs as (
    select
      coalesce(m.student_application_id, m.partner_application_id) as app_id,
      case when m.student_application_id is not null then 'student' else 'partner' end as surf,
      m.body, m.sender_role, m.read_at, m.created_at
    from public.application_messages m
  ),
  threads as (
    select
      app_id, surf,
      count(*) filter (where sender_role <> 'admin' and read_at is null) as unread,
      min(created_at) filter (where sender_role <> 'admin' and read_at is null) as oldest_unread,
      max(created_at) as last_created
    from msgs
    group by app_id, surf
  ),
  latest as (
    select distinct on (app_id) app_id, body, sender_role
    from msgs
    order by app_id, created_at desc
  ),
  filtered as (
    select * from threads where not p_only_unread or unread > 0
  )
  select
    f.surf,
    f.app_id,
    coalesce(sa.application_number, pa.application_number)::text,
    coalesce(
      nullif(btrim(concat_ws(' ', sp.first_name, sp.last_name)), ''),
      nullif(btrim(sa.applicant_name), ''),
      nullif(btrim(pa.student_name), ''),
      ''
    )::text,
    p.company_name::text,
    coalesce(sa.university_name, pa.university)::text,
    coalesce(sa.program_name, pa.program)::text,
    left(l.body, 200),
    l.sender_role,
    f.last_created,
    f.unread,
    f.oldest_unread,
    count(*) over ()
  from filtered f
  join latest l on l.app_id = f.app_id
  left join public.student_applications sa on f.surf = 'student' and sa.id = f.app_id
  left join public.student_profiles sp on sp.id = sa.student_id
  left join public.partner_applications pa on f.surf = 'partner' and pa.id = f.app_id
  left join public.partners p on p.id = pa.partner_id
  order by (f.unread > 0) desc, f.oldest_unread asc nulls last, f.last_created desc
  limit greatest(1, least(p_limit, 100))
  offset greatest(0, p_offset);
$$;

revoke all on function public.admin_message_inbox(boolean, integer, integer) from public, anon, authenticated;
grant execute on function public.admin_message_inbox(boolean, integer, integer) to service_role;

-- Email templates (editable from /admin/emails). English in body_text,
-- Chinese in body_text_zh; the sender picks by recipient locale.
insert into public.email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
values
(
  'message.to_student',
  'Message to student',
  'Sent to a student when SICA writes in their application thread (at most once an hour).',
  'status',
  'New message from SICA about your application {{applicationRef}}',
  'SICA 就您的申请 {{applicationRef}} 发来新消息',
  $body$Hi {{firstName}},

The SICA team sent you a message about your application to {{university}}:

"{{messagePreview}}"

Read and reply here:
{{threadUrl}}

— The SICA team
Study in China Academy$body$,
  $body${{firstName}}，您好：

SICA 团队就您申请 {{university}} 的事宜给您发来一条消息：

"{{messagePreview}}"

请在这里查看并回复：
{{threadUrl}}

— SICA 团队
Study in China Academy$body$,
  '["firstName","applicationRef","university","messagePreview","threadUrl"]'::jsonb,
  true
),
(
  'message.to_partner',
  'Message to partner',
  'Sent to the partner team when SICA writes in a partner application thread (at most once an hour).',
  'status',
  'New message from SICA about {{studentName}} ({{applicationRef}})',
  'SICA 就 {{studentName}}（{{applicationRef}}）发来新消息',
  $body$Hello {{companyName}} team,

SICA sent a message about {{studentName}}'s application to {{university}}:

"{{messagePreview}}"

Read and reply in the partner portal:
{{threadUrl}}

— The SICA team
Study in China Academy$body$,
  $body${{companyName}} 团队，您好：

SICA 就 {{studentName}} 申请 {{university}} 的事宜发来一条消息：

"{{messagePreview}}"

请在合作伙伴门户中查看并回复：
{{threadUrl}}

— SICA 团队
Study in China Academy$body$,
  '["companyName","studentName","applicationRef","university","messagePreview","threadUrl"]'::jsonb,
  true
),
(
  'message.to_admin',
  'Message to SICA admin',
  'Sent to the SICA inbox when a student or partner writes in an application thread (at most once an hour).',
  'status',
  'New message from {{senderName}} — {{applicationRef}}',
  '{{senderName}} 发来新消息 — {{applicationRef}}',
  $body${{senderName}} ({{senderKind}}) sent a message about {{studentName}}'s application to {{university}}:

"{{messagePreview}}"

Reply in the admin portal:
{{threadUrl}}

— The SICA notification bot$body$,
  $body${{senderName}}（{{senderKind}}）就 {{studentName}} 申请 {{university}} 的事宜发来消息：

"{{messagePreview}}"

请在管理后台回复：
{{threadUrl}}

— SICA 通知机器人$body$,
  '["senderName","senderKind","studentName","applicationRef","university","messagePreview","threadUrl"]'::jsonb,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  category = excluded.category,
  subject = excluded.subject,
  subject_zh = excluded.subject_zh,
  body_text = excluded.body_text,
  body_text_zh = excluded.body_text_zh,
  variables = excluded.variables,
  is_active = excluded.is_active;
