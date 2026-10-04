-- ============================================================================
-- Phase 125 (2026-09-22): admin-proposed counselling schedule requests.
--
-- 1. counselling_bookings: add the proposal-state columns + extend the
--    status CHECK to accept 'Proposed'.
-- 2. email_templates: add 3 new rows (counselling.proposed /
--    counselling.proposal_accepted / counselling.proposal_declined) so
--    admins can edit copy without a deploy. Bilingual bodies (en + 中文
--    inline), same pattern as Phase 124b.
--
-- Apply via Supabase dashboard SQL editor.
-- ============================================================================

-- 1. Columns -----------------------------------------------------------------

ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS proposed_slot_start TIMESTAMPTZ;
ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS proposal_token TEXT;
ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS proposal_expires_at TIMESTAMPTZ;

COMMENT ON COLUMN public.counselling_bookings.proposed_slot_start IS
  'Slot the admin is proposing (Phase 125). Distinct from slot_start until the student accepts.';
COMMENT ON COLUMN public.counselling_bookings.proposal_token IS
  'Single-use 32-byte base64url token emailed to the student (Phase 125). Cleared on accept / counter / decline / expiry.';
COMMENT ON COLUMN public.counselling_bookings.proposal_expires_at IS
  'Proposal deadline (Phase 125). Default 7 days from creation; admin can shorten/extend by re-proposing.';

-- 2. status CHECK extended to accept 'Proposed' ------------------------------
-- The Phase 114 migration created the constraint as an inline unnamed
-- CHECK, which Postgres auto-named `counselling_bookings_status_check`.
-- The original `DO` block probed for `pg_get_constraintdef LIKE
-- 'CHECK (status =%'` to find it; on a re-run the previous Phase 124
-- migration already named the constraint so the loop drops nothing
-- and the explicit ADD CONSTRAINT collides with the now-named one.
-- Solution: drop by name up-front (it's a no-op if absent).

ALTER TABLE public.counselling_bookings
  DROP CONSTRAINT IF EXISTS counselling_bookings_status_check;

ALTER TABLE public.counselling_bookings
  ADD CONSTRAINT counselling_bookings_status_check
  CHECK (status IN ('Pending', 'Proposed', 'Confirmed', 'Completed', 'Cancelled', 'No-show'));

-- Index helps the admin list filter (status='Proposed' is the
-- "awaiting student response" queue).
CREATE INDEX IF NOT EXISTS counselling_bookings_proposal_idx
  ON public.counselling_bookings (status, proposed_slot_start)
  WHERE status = 'Proposed';

-- 3. Three new email templates ----------------------------------------------
-- Bilingual body in a single block: English on top, divider, 中文 below.
-- Variable set matches what the new senders pass.

-- ----- counselling.proposed -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.proposed',
  'Counselling — Proposed (admin proposes a time)',
  'Sent when an admin picks a slot for the student and asks them to accept or counter-propose. Carries a magic-link accept URL and a counter-pick URL.',
  'counselling',
  'Pick a time that works for you — {{reference}}',
  '请确认您方便的时间 — {{reference}}',
  $body$English:

Hi {{name}},

A SICA advisor has suggested a time for your free 10-minute counselling session:

Reference: {{reference}}
Proposed time: {{proposedSlotLabel}}

If this works, click here to confirm:
{{acceptUrl}}

If this time doesn't work, you can pick another slot here:
{{counterUrl}}

This proposal is open until {{proposalExpiresAt}}.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$中文:

您好 {{name}},

SICA 招生顾问为您推荐了以下咨询时间：

预约编号：{{reference}}
建议时间：{{proposedSlotLabel}}

如果该时间方便，请点击此处确认：
{{acceptUrl}}

如果该时间不合适，您可以在这里选择其他时段：
{{counterUrl}}

本次推荐有效期至 {{proposalExpiresAt}}。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","proposedSlotLabel","acceptUrl","counterUrl","proposalExpiresAt","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.proposed');

-- ----- counselling.proposal_accepted -----
-- Sent when the student accepts via the magic link. Mirrors the
-- Confirmed email (same .ics attachment, same body); separate slug so
-- admins can edit copy differently from the admin-driven Confirmed
-- path if needed.
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.proposal_accepted',
  'Counselling — Proposal accepted (student confirmation)',
  'Sent when the student accepts the admin-proposed time. Includes a calendar invite.',
  'counselling',
  'Confirmed: your counselling session — {{reference}}',
  '咨询已确认 {{reference}}',
  $body$English:

Hi {{name}},

You accepted the proposed time for your free 10-minute counselling session with SICA. You're all set.

Reference: {{reference}}
Session time: {{slotLabel}}
{{meetingLine}}

A calendar invite (.ics) is attached — open it to add the session to your calendar.
Need to make another change? Just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$中文:

您好 {{name}},

您已确认 SICA 为您推荐的免费 10 分钟咨询时间。预约已成立。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
{{meetingLine}}

日历邀请(.ics)已附在本邮件中,点击即可添加到您的日历。
如需调整,请直接回复本邮件。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","meetingLine","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.proposal_accepted');

-- ----- counselling.proposal_declined -----
-- Sent to the admin when the student picks "this time doesn't work" and
-- chooses a different slot (counter-proposal). Body is admin-oriented.
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.proposal_declined',
  'Counselling — Counter-proposal from student (admin notification)',
  'Sent to the admin email when the student rejects the proposed time and picks a different slot. Admin can re-confirm or re-propose.',
  'counselling',
  'Counter-proposal received: {{reference}}',
  '学生改期建议：{{reference}}',
  $body$English:

{{name}} couldn't make the proposed slot and picked another time.

Reference: {{reference}}
Original proposal: {{previousSlotLabel}}
Counter-proposal: {{slotLabel}}

Manage it in the admin portal: {{adminUrl}}
A fresh proposal email has been sent to the student.

— The SICA notification bot
Study in China Academy · Guangzhou, China$body$,
  $body$中文:

{{name}} 无法在建议时段接受咨询,已选择其他时间。

预约编号：{{reference}}
原建议时段：{{previousSlotLabel}}
学生改期：{{slotLabel}}

请在管理后台处理：{{adminUrl}}
新的咨询时间确认邮件已发送给学生。

— SICA 通知机器人
Study in China Academy · Guangzhou, China$body$,
  '["name","reference","previousSlotLabel","slotLabel","adminUrl"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.proposal_declined');

-- Audit (uncomment after applying):
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'counselling_bookings'
--     AND column_name IN ('proposed_slot_start','proposal_token','proposal_expires_at');
-- SELECT pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'public.counselling_bookings'::regclass AND contype = 'c';
-- SELECT slug, category, is_active FROM email_templates WHERE slug LIKE 'counselling.%' ORDER BY slug;
