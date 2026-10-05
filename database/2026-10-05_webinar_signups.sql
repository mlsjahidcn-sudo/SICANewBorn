-- Phase 139: Public webinar landing page (March/Sept 2027 Intake + CSC).
-- Captures signup rows from /webinar-2027-intake-csc, then fires an
-- instant email via the new `webinar.confirmed` template (seeded by
-- the companion migration `2026-10-05_webinar_email_template.sql`).
--
-- Shape mirrors `contact_submissions` + `student_assessments`: an
-- INSERT-only public policy + admin SELECT/UPDATE via `is_admin()`.
-- Phase 26 attribution columns (utm_* + gclid + fbclid) plus 4
-- partial indexes — same pattern those tables use.
--
-- The `ip_hash` column is sha256(ip) (never the raw IP) so we can
-- soft-dedup registrations from the same client without burning
-- PII storage. Honeypot + per-IP rate limit at the API layer do
-- the real abuse control; this column is just an analytics hint.

CREATE TABLE IF NOT EXISTS public.webinar_signups (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          varchar(120) NOT NULL,
  last_name           varchar(120) NOT NULL,
  email               varchar(255) NOT NULL,
  whatsapp            varchar(40)  NOT NULL,
  country             varchar(80),
  program_interests   text[]       NOT NULL DEFAULT '{}',
  notes               text,
  source_page         text,
  referrer            text,
  user_agent          text,
  utm_source          varchar(255),
  utm_medium          varchar(255),
  utm_campaign        varchar(255),
  gclid               varchar(255),
  fbclid              varchar(255),
  status              varchar(20)  NOT NULL DEFAULT 'Registered'
                      CHECK (status IN ('Registered','Attended','No-Show','Cancelled')),
  ip_hash             varchar(64),
  created_at          timestamptz  NOT NULL DEFAULT now(),
  updated_at          timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_webinar_signups_email
  ON public.webinar_signups (email);
CREATE INDEX IF NOT EXISTS idx_webinar_signups_created_at
  ON public.webinar_signups (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webinar_signups_status
  ON public.webinar_signups (status);
CREATE INDEX IF NOT EXISTS idx_webinar_signups_utm_source
  ON public.webinar_signups (utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_webinar_signups_utm_campaign
  ON public.webinar_signups (utm_campaign) WHERE utm_campaign IS NOT NULL;

ALTER TABLE public.webinar_signups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert webinar signup" ON public.webinar_signups;
CREATE POLICY "Public insert webinar signup"
  ON public.webinar_signups FOR INSERT TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins read webinar signups" ON public.webinar_signups;
CREATE POLICY "Admins read webinar signups"
  ON public.webinar_signups FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins update webinar signups" ON public.webinar_signups;
CREATE POLICY "Admins update webinar signups"
  ON public.webinar_signups FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP TRIGGER IF EXISTS trg_webinar_signups_updated_at ON public.webinar_signups;
CREATE TRIGGER trg_webinar_signups_updated_at
  BEFORE UPDATE ON public.webinar_signups
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
