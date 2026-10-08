-- ============================================================================
-- Phase 152 (#14): proposal-expiry template + idempotency stamp.
--
-- Audit gap: when an admin proposal's `proposal_expires_at` passes
-- without the student responding, the row stays `Proposed` with a
-- dead `proposal_token` indefinitely. The slot is freed in the
-- Phase 137 occupancy math (`fetchOccupiedSlotInstants` filters
-- `gt('proposal_expires_at', now())`), but:
--   - the admin list + calendar still show the row as a live proposal
--   - the student re-clicking the magic link in their email hits the
--     generic invalid screen (Phase 152 #10 fixed this with a
--     friendly "expired" copy, but the row stays Proposed)
--   - the admin never knows the student dropped off
--
-- Fix:
--   1. Add `proposal_expired_at timestamptz` for idempotency — same
--      shape as `reminder_24h_at` / `reminder_2h_at`. The worker
--      stamps after flipping to Pending so a re-run doesn't double-
--      process the row.
--   2. Add the admin-notification template `counselling.proposal_
--      expired_admin` with a bilingual body that includes the
--      reference + the student name + the proposed slot + the
--      original proposal_expires_at so the admin can decide whether
--      to re-propose or close the lead.
--
-- Apply via Supabase dashboard SQL editor (manual apply per the
-- `manual-supabase-migrations.md` memory).
-- ============================================================================

ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS proposal_expired_at timestamptz;

COMMENT ON COLUMN public.counselling_bookings.proposal_expired_at IS
  'Phase 152 #14: idempotency stamp for the proposal-expiry worker. NULL = unprocessed. Set once when the worker flips an expired Proposal back to Pending and emails the admin.';

-- Partial index — only rows that could still be expired are in the
-- worker's hot path; stamps turn the rest invisible.
CREATE INDEX IF NOT EXISTS idx_counselling_proposal_expired_at_null
  ON public.counselling_bookings (proposal_expires_at)
  WHERE proposal_expired_at IS NULL;

INSERT INTO public.email_templates (
  slug,
  category,
  subject,
  subject_zh,
  body_text,
  body_text_zh,
  variables,
  is_active
)
VALUES (
  'counselling.proposal_expired_admin',
  'counselling',
  'Proposal expired without response — {{reference}}',
  '学生未响应，预约推荐已过期 — {{reference}}',
  $body$English:

A counselling proposal expired without a student response.

Reference: {{reference}}
Student: {{name}}
Proposed time: {{proposedSlotLabel}}
Original deadline: {{proposalExpiresAt}}

Manage it in the admin portal — re-propose another time, cancel, or let the lead close:
{{adminUrl}}

— The SICA notification bot
Study in China Academy · Guangzhou, China$body$,
  $body$中文:

一条咨询时间推荐因学生未响应而过期。

预约编号：{{reference}}
学生：{{name}}
推荐时间：{{proposedSlotLabel}}
原截止时间：{{proposalExpiresAt}}

请在管理后台处理 — 可重新推荐其他时间，或取消/关闭该线索：
{{adminUrl}}

— SICA 通知机器人
Study in China Academy · 广州，中国$body$,
  '["name","reference","proposedSlotLabel","proposalExpiresAt","adminUrl"]'::jsonb,
  true
)
ON CONFLICT (slug) DO UPDATE SET
  category = EXCLUDED.category,
  subject = EXCLUDED.subject,
  subject_zh = EXCLUDED.subject_zh,
  body_text = EXCLUDED.body_text,
  body_text_zh = EXCLUDED.body_text_zh,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Audit (uncomment to verify):
-- SELECT slug, subject, subject_zh,
--        CASE WHEN body_text LIKE '%English:%' AND body_text LIKE '%中文:%' THEN 'bilingual OK'
--             ELSE 'check' END AS body_check
--   FROM email_templates WHERE slug = 'counselling.proposal_expired_admin';
-- SELECT column_name, data_type FROM information_schema.columns
--   WHERE table_name = 'counselling_bookings' AND column_name = 'proposal_expired_at';
