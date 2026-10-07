-- Phase 143: extend lead_history to accept 'webinar_signup' so
-- the polymorphic activity-log contract (Phase S29) covers
-- webinar status flips. No webinar_signups schema change
-- the log writes externally so the hot read path stays lean.
--
-- Idempotent: DROP + ADD the constraint, CREATE INDEX
-- IF NOT EXISTS.

ALTER TABLE public.lead_history
  DROP CONSTRAINT IF EXISTS lead_history_lead_type_check;

ALTER TABLE public.lead_history
  ADD CONSTRAINT lead_history_lead_type_check
  CHECK (lead_type IN ('contact', 'chat', 'assessment', 'webinar_signup'));

-- Webinar-scoped lookup index — mirrors the existing
-- idx_lead_history_lead shape but scoped via partial index
-- so other lead types don't bloat it. Phase 144+ admin UI
-- reads via this index.
CREATE INDEX IF NOT EXISTS idx_lead_history_webinar
  ON public.lead_history (lead_id, created_at DESC)
  WHERE lead_type = 'webinar_signup';