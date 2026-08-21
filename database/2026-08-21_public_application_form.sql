-- ============================================================================
-- Phase 75: Public application submission form — no auth, no token
--
-- Problem: some partners + their students think the partner portal is
-- too heavy for a 2-minute application submission. We need a public
-- form at /apply that anyone can fill without an account.
--
-- Design (the simpler version — no tokens, no per-partner links):
--   1. A sentinel "Direct / Unassigned" partner row. Public form
--      submissions default to this partner_id unless the student
--      picks a real partner from the optional dropdown.
--   2. A new `source` column on partner_applications to distinguish
--      partner-portal vs public-form vs admin-manual submissions.
--      Admin views can filter/sort on this; partner views already
--      scope by partner_id so their view is unaffected.
--   3. No new RLS — partner_id is still NOT NULL, public-form
--      submissions get the sentinel partner_id, existing RLS policies
--      continue to scope partner portal users to their own rows.
--      The public POST endpoint uses the service-role client, so
--      it's not subject to RLS (consistent with /api/seed and the
--      other admin-only mutation routes).
--
-- Apply: psql $COZE_SUPABASE_DB_URL -f database/2026-08-21_public_application_form.sql
-- or paste into Supabase dashboard → SQL Editor.
-- ============================================================================

-- 1. Sentinel partner for "no real partner" public submissions.
--    Fixed UUID so the application code can refer to it without a
--    SELECT round-trip. user_id is NULL because no human owns this
--    row (it's a system entity). status='Active' so it shows up in
--    partner dropdowns if/when the public form exposes one.
--    company_name = 'Direct / Unassigned' makes it obvious in admin
--    views which rows came from the public form.
INSERT INTO public.partners (
  id,
  user_id,
  email,
  company_name,
  contact_person,
  status,
  notes
)
VALUES (
  '00000000-0000-0000-0000-0000000000d1',
  NULL,
  'public-applications@sica.com',
  'Direct / Unassigned',
  'Public Application Form',
  'Active',
  'Sentinel partner for public application form submissions. Auto-attributed when the student does not pick a partner from the optional dropdown. Admin can re-assign to a real partner if the student later mentions who referred them.'
)
ON CONFLICT (id) DO NOTHING;

-- 2. Source column on partner_applications. Default 'partner_portal'
--    so every existing row keeps its current value, and partner-
--    portal POSTs that don't set the field still get the same
--    source. The new public-form POST sets source='public_form'.
--    Admin can later add 'admin_manual' or 'imported' as needed.
ALTER TABLE public.partner_applications
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'partner_portal';

-- Partial index for the admin "filter by source" view. Cheap and
-- useful — most admin reporting will want to see public-form
-- submissions separately from partner-portal ones.
CREATE INDEX IF NOT EXISTS idx_partner_applications_source
  ON public.partner_applications(source)
  WHERE source <> 'partner_portal';

-- RLS note: no policy changes needed. The service-role client
-- (used by POST /api/public/submissions) bypasses RLS, and the
-- existing "Partners can manage their own applications" policy
-- continues to scope partner-portal users to their own partner_id
-- (the sentinel partner_id is partner_id=00000000-...-d1, which
-- no real partner user owns, so they can never read or modify
-- public-form submissions attributed to Direct / Unassigned).
