-- Phase 162: Seed the `webinar.reminder_24h` email template.
--
-- Fired by the new `POST /api/cron/webinar-reminders` route
-- (~24h before `webinar_sessions.session_date`, gated on the
-- `WEBINAR_CRON_SECRET` env var). Renders with the same
-- `sendTemplatedEmail()` helper Phase 136 uses for lead/student
-- sends, so the lookup goes through the `email_templates` table
-- (not Resend's hosted template store).
--
-- Bilingual body in a single block (en + zh, both visible
-- regardless of recipient locale) — same convention as
-- `webinar.confirmed` from Phase 139 and the counselling
-- lifecycle templates from Phase 124b.
--
-- Variables match the `sendWebinarReminder()` signature:
--   name, joinLink, webinarDate, webinarTime,
--   webinarTimeLocal (per Phase 141 country-timezone.ts),
--   reference.
--
-- Idempotent via ON CONFLICT (slug) DO UPDATE — applying twice
-- refreshes the template rather than erroring.

INSERT INTO public.email_templates (
  slug, name, description, category,
  subject, body_text, subject_zh, body_text_zh,
  variables, is_active, step_index, delay_ms
) VALUES (
  'webinar.reminder_24h',
  'Webinar 24-hour reminder',
  'Phase 162: dispatched by /api/cron/webinar-reminders ~24h before the session. Bilingual single-block body (en+zh) per Phase 124b convention.',
  'oneoff',
  'Reminder: your SICA webinar is tomorrow at {{webinarTime}}',
  'Hi {{name}},

This is your 24-hour reminder for the SICA webinar.

JOIN LINK: {{joinLink}}
DATE: {{webinarDate}}
TIME: {{webinarTime}} (China)
TIME (your country): {{webinarTimeLocal}}

You can also join via WhatsApp on the day — message us at +86 173 2576 4171 with this reference and we will resend the link: {{reference}}

See you tomorrow.

---
SICA Study in China Academy
https://studyinchina.academy
info@studyinchina.academy',
  '提醒：您的 SICA 线上讲座将于明日 {{webinarTime}} 举行',
  '您好 {{name}}，

这是 SICA 线上讲座的 24 小时提醒邮件。

会议链接：{{joinLink}}
日期：{{webinarDate}}
时间：{{webinarTime}}（中国时间）
您所在国家时间：{{webinarTimeLocal}}

当天也可以通过 WhatsApp 加入 — 发送此编号至 +86 173 2576 4171，我们会重新发送链接：{{reference}}

明天见。

---
SICA 留学中国学院
https://studyinchina.academy
info@studyinchina.academy',
  jsonb_build_array(
    'name', 'joinLink', 'webinarDate', 'webinarTime', 'webinarTimeLocal', 'reference'
  ),
  true,
  0,
  0
)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  subject = EXCLUDED.subject,
  body_text = EXCLUDED.body_text,
  subject_zh = EXCLUDED.subject_zh,
  body_text_zh = EXCLUDED.body_text_zh,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active;