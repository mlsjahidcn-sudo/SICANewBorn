-- Phase 93: enable RLS on the three tables that shipped without it.
--
-- Every accessor in the codebase is the service-role client
-- (src/lib/email/drip/scheduler.ts, src/lib/ai/news-automation-runner.ts,
-- src/app/api/admin/news/automation/*, src/app/api/admin/emails/templates/[id]),
-- which bypasses RLS — so enabling RLS with NO policies means:
--   anon / authenticated roles  → denied everything (previously full access!)
--   service_role                → unchanged
--
-- These tables hold lead PII (email addresses) and internal ops state
-- (automation run history, pending send queues) — they should never
-- have been readable by the anon key.
--
-- Idempotent: safe to re-run.

alter table public.email_drips enable row level security;
alter table public.news_automation_topics enable row level security;
alter table public.news_automation_runs enable row level security;

-- Verification (expect: relrowsecurity = true for all three):
--   select relname, relrowsecurity from pg_class
--    where relnamespace = 'public'::regnamespace
--      and relname in ('email_drips', 'news_automation_topics', 'news_automation_runs');
--
-- Smoke test after applying (expect: empty array, not an error):
--   curl "$SUPABASE_URL/rest/v1/email_drips?select=*&limit=1" -H "apikey: $ANON_KEY"
