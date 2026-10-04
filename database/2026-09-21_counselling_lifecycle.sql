-- ============================================================================
-- Phase 124 (2026-09-21): counselling lifecycle (reschedule / completed /
-- no-show / meeting-link updates) + 8 admin-editable email_templates rows.
--
-- 1. New columns on counselling_bookings for the reschedule + meeting-link
--    change audit trail.
-- 2. email_templates.category CHECK extended to accept 'counselling' so the
--    admin editor's category filter can show these.
-- 3. 8 new rows (slug + category='counselling') so admins can edit the copy
--    without a code deploy — same pattern as notification.* / status.* /
--    drip.* slugs. Idempotent via WHERE NOT EXISTS.
--
-- Apply via Supabase dashboard SQL editor.
-- ============================================================================

-- 1. Lifecycle columns -------------------------------------------------------

ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS rescheduled_at TIMESTAMPTZ;
ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS original_slot_start TIMESTAMPTZ;
ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS previous_meeting_link TEXT;
ALTER TABLE public.counselling_bookings
  ADD COLUMN IF NOT EXISTS meeting_link_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.counselling_bookings.rescheduled_at IS
  'Set when the slot is moved to a different instant (Phase 124). NULL = never rescheduled.';
COMMENT ON COLUMN public.counselling_bookings.original_slot_start IS
  'Snapshot of the previous slot_start at the moment of reschedule (Phase 124). NULL unless rescheduled_at is set.';
COMMENT ON COLUMN public.counselling_bookings.previous_meeting_link IS
  'Snapshot of the previous meeting_link at the moment of edit (Phase 124). NULL unless meeting_link_updated_at is set.';
COMMENT ON COLUMN public.counselling_bookings.meeting_link_updated_at IS
  'Set when meeting_link changed (no status change) — triggers the meeting-link-updated email + .ics resend (Phase 124).';

-- 2. email_templates.category accepts 'counselling' ----------------------------
-- Existing constraint: CHECK (category IN ('drip','status','oneoff'))

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'email_templates_category_check'
      AND pg_get_constraintdef(oid) NOT LIKE '%counselling%'
  ) THEN
    ALTER TABLE public.email_templates DROP CONSTRAINT email_templates_category_check;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'email_templates_category_check'
  ) THEN
    ALTER TABLE public.email_templates
      ADD CONSTRAINT email_templates_category_check
      CHECK (category IN ('drip', 'status', 'oneoff', 'counselling'));
  END IF;
END $$;

-- 3. 8 counselling templates ------------------------------------------------
-- All bodies reference only the variables documented in their `variables`
-- JSONB array. senders in src/lib/email/index.ts pass them by name.

-- ----- counselling.confirmed -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.confirmed',
  'Counselling — Confirmed (with .ics)',
  'Sent when an admin moves a booking to Confirmed or re-confirms with the same slot. Includes a calendar invite attachment.',
  'counselling',
  'Confirmed: your counselling session — {{reference}}',
  '咨询已确认 {{reference}}',
  $body$Hi {{name}},

Your free 10-minute counselling session with SICA is confirmed.

Reference: {{reference}}
Session time: {{slotLabel}}
{{meetingLine}}

A calendar invite (.ics) is attached — open it to add the session to your calendar.
Need to reschedule or cancel? Just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$您好 {{name}}，

您的 SICA 免费 10 分钟在线咨询已确认。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
{{meetingLine}}

日历邀请（.ics）已附在本邮件中，点击即可添加到您的日历。
如需改期或取消，请直接回复本邮件。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","meetingLine","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.confirmed');

-- ----- counselling.rescheduled -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.rescheduled',
  'Counselling — Rescheduled (with .ics)',
  'Sent when an admin moves the booking to a different slot. Includes an updated calendar invite.',
  'counselling',
  'Rescheduled: your counselling session is now at {{slotLabel}} — {{reference}}',
  '咨询已改期：{{slotLabel}}（{{reference}}）',
  $body$Hi {{name}},

Your SICA counselling session has been moved.

Reference: {{reference}}
Previous time: {{previousSlotLabel}}
New time: {{slotLabel}}
{{meetingLine}}

A fresh calendar invite (.ics) is attached — please update your calendar.
If the new time doesn't work, reply to this email and we'll find another slot.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$您好 {{name}}，

您的 SICA 咨询已被改期。

预约编号：{{reference}}
原咨询时间：{{previousSlotLabel}}
新咨询时间：{{slotLabel}}
{{meetingLine}}

新的日历邀请（.ics）已附在本邮件中，请更新您的日历。
如新时间不合适，请直接回复本邮件，我们会再次调整。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","previousSlotLabel","slotLabel","meetingLine","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.rescheduled');

-- ----- counselling.cancelled -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.cancelled',
  'Counselling — Cancelled',
  'Sent when an admin cancels a booking. Points at /counselling to rebook.',
  'counselling',
  'Your counselling session was cancelled — {{reference}}',
  '咨询预约已取消 {{reference}}',
  $body$Hi {{name}},

Your SICA free counselling session has been cancelled.

Reference: {{reference}}
Original time: {{slotLabel}}

You can book a new time any moment: {{siteUrl}}/counselling
Any questions — just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$您好 {{name}}，

很抱歉，您预约的 SICA 免费咨询已被取消。

预约编号：{{reference}}
原咨询时间：{{slotLabel}}

您可以随时重新预约：{{siteUrl}}/counselling
如有任何疑问，直接回复本邮件即可。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.cancelled');

-- ----- counselling.completed -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.completed',
  'Counselling — Completed (thank-you)',
  'Sent when an admin closes a session as Completed. Positive close + rebook link.',
  'counselling',
  'Thanks for your chat — next steps',
  '感谢您的咨询：下一步',
  $body$Hi {{name}},

Thanks for your free 10-minute chat with SICA on {{slotLabel}}.

Reference: {{reference}}

If you'd like to keep going, you can book another session any time: {{siteUrl}}/counselling
Or start a formal application: {{siteUrl}}/assessment

Any questions, just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$您好 {{name}}，

感谢您于 {{slotLabel}} 与 SICA 完成的免费 10 分钟咨询。

预约编号：{{reference}}

如您希望继续沟通，可随时再预约一次：{{siteUrl}}/counselling
或直接开始正式申请：{{siteUrl}}/assessment

如有疑问，请直接回复本邮件。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.completed');

-- ----- counselling.no_show -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.no_show',
  'Counselling — No-show outreach',
  'Sent when an admin marks a booking as No-show. Gentle, offers a rebook.',
  'counselling',
  'We missed you today — let''s find another time',
  '今天没能见到您：换个时间吧',
  $body$Hi {{name}},

We didn't connect on your SICA counselling session scheduled for {{slotLabel}} — totally fine, things come up.

Reference: {{reference}}

Whenever you're ready, pick a new time here: {{siteUrl}}/counselling
Or message us on WhatsApp +86 173 2576 4171 and we'll find one for you.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$您好 {{name}}，

您原定 {{slotLabel}} 的 SICA 咨询我们没能连上——没关系，临时有事很正常。

预约编号：{{reference}}

您方便时，可以重新预约：{{siteUrl}}/counselling
或通过 WhatsApp +86 173 2576 4171 联系我们，我们帮您安排。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.no_show');

-- ----- counselling.meeting_link_updated -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.meeting_link_updated',
  'Counselling — Meeting link updated',
  'Sent when an admin edits the meeting link on an existing Confirmed booking (no status change). Includes an updated calendar invite.',
  'counselling',
  'Updated meeting link — {{reference}}',
  '会议链接已更新 {{reference}}',
  $body$Hi {{name}},

We've updated the meeting link for your counselling session.

Reference: {{reference}}
Session time: {{slotLabel}}
New meeting link: {{meetingLine}}

A fresh calendar invite (.ics) is attached with the new link.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$您好 {{name}}，

您的咨询会议链接已更新。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
新会议链接：{{meetingLine}}

新的日历邀请（.ics）已附在邮件中。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","meetingLine","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.meeting_link_updated');

-- ----- counselling.reminder_24h -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.reminder_24h',
  'Counselling — 24h reminder',
  'Sent 24 hours before a Confirmed session.',
  'counselling',
  'Reminder: your counselling session in 24 hours — {{reference}}',
  '咨询提醒 {{reference}}',
  $body$Hi {{name}},

A friendly reminder: your free SICA counselling session is in 24 hours.

Reference: {{reference}}
Session time: {{slotLabel}}
{{meetingLine}}

Need help? WhatsApp us any time: https://wa.me/8617325764171

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$您好 {{name}}，

温馨提示：您的 SICA 免费咨询 24 小时后开始。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
{{meetingLine}}

如需帮助，随时 WhatsApp 联系我们：https://wa.me/8617325764171

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","meetingLine","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.reminder_24h');

-- ----- counselling.reminder_2h -----
INSERT INTO email_templates (slug, name, description, category, subject, subject_zh, body_text, body_text_zh, variables, is_active)
SELECT
  'counselling.reminder_2h',
  'Counselling — 2h reminder',
  'Sent 2 hours before a Confirmed session.',
  'counselling',
  'Reminder: your counselling session starting soon — {{reference}}',
  '咨询即将开始 {{reference}}',
  $body$Hi {{name}},

A friendly reminder: your free SICA counselling session is starting soon.

Reference: {{reference}}
Session time: {{slotLabel}}
{{meetingLine}}

Need help? WhatsApp us any time: https://wa.me/8617325764171

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$您好 {{name}}，

温馨提示：您的 SICA 免费咨询即将开始。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
{{meetingLine}}

如需帮助，随时 WhatsApp 联系我们：https://wa.me/8617325764171

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","meetingLine","siteUrl","unsubToken"]'::jsonb,
  true
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'counselling.reminder_2h');

-- Audit (uncomment after applying):
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'counselling_bookings'
--     AND column_name IN ('rescheduled_at', 'original_slot_start',
--                         'previous_meeting_link', 'meeting_link_updated_at');
-- SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'email_templates_category_check';
-- SELECT slug, category, is_active FROM email_templates WHERE slug LIKE 'counselling.%' ORDER BY slug;
