-- Per-session tag on webinar_signups so weekly webinars can be
-- filtered/exported separately without bringing back webinar_sessions.
-- Keys are stamped server-side as Asia/Shanghai YYYY-MM-DD from
-- WEBINAR_CONFIG.sessionDateIso (e.g. '2026-11-03'). Legacy rows
-- stay NULL and show as "Untagged / legacy" in admin.

ALTER TABLE public.webinar_signups
  ADD COLUMN IF NOT EXISTS webinar_key text;

CREATE INDEX IF NOT EXISTS webinar_signups_webinar_key_idx
  ON public.webinar_signups (webinar_key);

COMMENT ON COLUMN public.webinar_signups.webinar_key IS
  'Weekly session tag (YYYY-MM-DD Asia/Shanghai). NULL = pre-tag legacy signup.';
