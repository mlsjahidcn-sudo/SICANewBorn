-- Phase 93: newsletter subscribers — backs the footer signup form
-- (POST /api/newsletter). Minimal table: the marketing use case is
-- "export the address list once a month", not lifecycle management.
--
-- RLS is enabled with NO policies on purpose: writes happen only via
-- the service-role client inside the API route (public POST), and
-- reads are manual (SQL editor export by the admin). The anon/authed
-- roles get nothing.
--
-- Idempotent: safe to re-run.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  locale varchar(5) not null default 'en',
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

-- Lowercased unique address (the route lowercases before insert).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'newsletter_subscribers_email_key'
  ) then
    alter table public.newsletter_subscribers
      add constraint newsletter_subscribers_email_key unique (email);
  end if;
end $$;

create index if not exists newsletter_subscribers_created_at_idx
  on public.newsletter_subscribers (created_at desc);

alter table public.newsletter_subscribers enable row level security;

-- Verification:
--   select count(*) from pg_policies
--    where schemaname = 'public' and tablename = 'newsletter_subscribers';
--   expect: 0 policies (deny-all for non-service roles)
