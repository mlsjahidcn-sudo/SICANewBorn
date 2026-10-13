-- ============================================================================
-- Phase 160: consultation activity shots (admin-managed social proof)
--
-- Replaces the Phase 158 hardcoded ConsultationActivity array (which
-- shipped wrong metadata for two real screenshots). Moves the source
-- of truth into a DB table so admins can upload / caption / toggle
-- shots via /admin/consultation-activity without shipping code.
--
-- Schema:
--   - id uuid PK
--   - image_url text NOT NULL — storage OBJECT path (e.g.
--     `consultation/<shotId>/<uuid>.jpg`). Public fetch builds the
--     full URL via Supabase getPublicUrl() on the
--     `consultation-activity` bucket.
--   - caption_en text NOT NULL — English caption (shown on / when
--     sica-locale cookie != 'zh').
--   - caption_zh text NOT NULL — Chinese caption (shown on / when
--     sica-locale cookie == 'zh').
--   - person_name varchar(120) NOT NULL — the person in the
--     screenshot (e.g. "Carlos De Avila Bravo"). Rendered as the
--     figure caption + in the alt text.
--   - initials varchar(8) NOT NULL — the badge initials (e.g. "CD"
--     for Carlos De Avila). Bottom-right red circle on the card.
--   - shot_date date NULLABLE — YYYY-MM-DD when the consultation
--     happened. Rendered as the "Session on YYYY-MM-DD" sub-label.
--   - is_active boolean NOT NULL DEFAULT true — admin toggle to
--     hide a shot without deleting it. Public query filters
--     `is_active=true` only.
--   - display_order integer NOT NULL DEFAULT 0 — ASC sort key. 0
--     shows first; ties broken by created_at DESC.
--   - created_by uuid FK to auth.users ON DELETE SET NULL — audit
--     trail (the admin who created the row; survives user deletion).
--   - created_at + updated_at timestamptz
--
-- RLS:
--   - admin: full (SELECT/INSERT/UPDATE/DELETE via is_admin() helper)
--   - public (anon): SELECT WHERE is_active=true — no INSERT/UPDATE/
--     DELETE; the consultation page + homepage render this view.
--
-- Storage bucket:
--   The `consultation-activity` Supabase Storage bucket must exist
--   BEFORE this migration's API routes go live. Create it via
--   Supabase dashboard > Storage > Create bucket > name=
--   `consultation-activity` > Public bucket = ON. Object path
--   convention: `consultation/<shotId>/<filename>.jpg`. The bucket
--   is intentionally PUBLIC (no signed-URL dance for rendering —
--   next/image + the existing supabase.co hostname in
--   next.config.ts#remotePatterns handles the request). If you want
--   private URLs later, swap `getPublicUrl()` for a signed-read
--   helper in getActiveConsultationShots() + getAllConsultationShotsAdmin().
--
-- Pre-deploy:
--   1. Create the `consultation-activity` bucket in Supabase
--      Storage dashboard (Public = on).
--   2. Apply this migration.
--   3. Open /admin/consultation-activity, upload 1-2 shots, set
--      is_active=true, set display_order.
--   4. The /counselling + / sections render automatically from the
--      same source of truth.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.consultation_activity_shots (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url       text NOT NULL,
  caption_en      text NOT NULL,
  caption_zh      text NOT NULL,
  person_name     varchar(120) NOT NULL,
  initials        varchar(8) NOT NULL,
  shot_date       date,
  is_active       boolean NOT NULL DEFAULT true,
  display_order   integer NOT NULL DEFAULT 0,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Idempotency / integrity: defense-in-depth CHECKs on the columns
-- the API whitelist already enforces. Belt-and-suspenders so a
-- buggy client can't insert a negative display_order or initials
-- longer than the badge can render.
ALTER TABLE public.consultation_activity_shots
  DROP CONSTRAINT IF EXISTS consultation_activity_shots_display_order_check;
ALTER TABLE public.consultation_activity_shots
  ADD CONSTRAINT consultation_activity_shots_display_order_check
    CHECK (display_order >= 0 AND display_order <= 999);
ALTER TABLE public.consultation_activity_shots
  DROP CONSTRAINT IF EXISTS consultation_activity_shots_initials_check;
ALTER TABLE public.consultation_activity_shots
  ADD CONSTRAINT consultation_activity_shots_initials_check
    CHECK (char_length(initials) BETWEEN 1 AND 8);
ALTER TABLE public.consultation_activity_shots
  DROP CONSTRAINT IF EXISTS consultation_activity_shots_image_path_check;
ALTER TABLE public.consultation_activity_shots
  ADD CONSTRAINT consultation_activity_shots_image_path_check
    CHECK (image_url LIKE 'consultation/%');

CREATE INDEX IF NOT EXISTS idx_consultation_activity_shots_active_order
  ON public.consultation_activity_shots (is_active, display_order, created_at DESC);

ALTER TABLE public.consultation_activity_shots ENABLE ROW LEVEL SECURITY;

-- Admin: full CRUD via existing is_admin() helper.
DROP POLICY IF EXISTS "Admins manage consultation activity" ON public.consultation_activity_shots;
CREATE POLICY "Admins manage consultation activity"
  ON public.consultation_activity_shots FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Public: anon SELECT on active rows only. No INSERT/UPDATE/DELETE
-- (no INSERT/UPDATE/DELETE policies = those operations denied by
-- RLS default for anon).
DROP POLICY IF EXISTS "Public reads active consultation activity" ON public.consultation_activity_shots;
CREATE POLICY "Public reads active consultation activity"
  ON public.consultation_activity_shots FOR SELECT TO anon
  USING (is_active = true);
