-- Phase 114: free 10-minute online counselling sessions — backs the
-- /counselling landing page booking wizard (public POST
-- /api/counselling/bookings) and the /admin/counselling management page.
-- One row per booked grid slot.
--
-- All slot instants are Beijing wall-clock (Asia/Shanghai, UTC+8, no DST)
-- converted to absolute timestamptz by the API before insert. The slot
-- grid + lead-time rules live in src/lib/counselling-slots.ts — the DB
-- only stores what the API validated.
--
-- RLS is enabled with NO policies on purpose (newsletter pattern, 2026-09-15):
-- writes happen only via the service-role client inside the API routes
-- (rate-limited + honeypot-guarded); admin reads go through requireAdmin
-- + buildServiceClient. The anon/authed roles get nothing — a lead's
-- name/email/phone must never be listable from the browser.
--
-- Double-booking guard is DB-level: a partial unique index allows only
-- one LIVE (Pending/Confirmed) booking per slot instant. Cancelling a
-- booking frees its slot for someone else.
--
-- Idempotent: safe to re-run.

create table if not exists public.counselling_bookings (
  id uuid primary key default gen_random_uuid(),
  -- Human-quotable booking code minted by the API, e.g. "CS-20260919-K7QM".
  reference text not null,
  name text not null,
  email text not null,
  -- Required: the session happens online (WhatsApp/Zoom), so there must
  -- always be a way to reach the lead at slot time.
  phone text not null,
  country text,
  education_level text,
  topic text,
  slot_start timestamptz not null,
  status text not null default 'Pending'
    check (status in ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'No-show')),
  meeting_link text,
  admin_notes text,
  locale varchar(5) not null default 'en',
  source_page text,
  -- Phase 26 UTM attribution columns (same whitelist as contact_submissions).
  utm_source text,
  utm_medium text,
  utm_campaign text,
  gclid text,
  fbclid text,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique human-quotable reference (the API mints with a random suffix;
-- the constraint is the backstop against the astronomically unlikely clash).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'counselling_bookings_reference_key'
  ) then
    alter table public.counselling_bookings
      add constraint counselling_bookings_reference_key unique (reference);
  end if;
end $$;

-- Only one live booking per slot instant. Partial: Cancelled/Completed/
-- No-show rows don't hold the slot (Cancelled frees it; Completed/No-show
-- are in the past by definition).
create unique index if not exists counselling_bookings_slot_live_unique
  on public.counselling_bookings (slot_start)
  where status in ('Pending', 'Confirmed');

create index if not exists counselling_bookings_status_slot_idx
  on public.counselling_bookings (status, slot_start);

create index if not exists counselling_bookings_email_idx
  on public.counselling_bookings (email);

create index if not exists counselling_bookings_created_at_idx
  on public.counselling_bookings (created_at desc);

alter table public.counselling_bookings enable row level security;

-- updated_at trigger — same shared function every other table uses.
drop trigger if exists trg_counselling_bookings_updated_at on public.counselling_bookings;
create trigger trg_counselling_bookings_updated_at
  before update on public.counselling_bookings
  for each row execute function update_updated_at_column();

-- Verification:
--   select count(*) from pg_policies
--    where schemaname = 'public' and tablename = 'counselling_bookings';
--   expect: 0 policies (deny-all for non-service roles).
--
--   select indexname from pg_indexes
--    where tablename = 'counselling_bookings';
--   expect: slot_live_unique + 3 btree + pkey.
