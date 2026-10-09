-- ============================================================================
-- Phase 153 (#5): bilingual templates for the Phase-114
-- booking-received senders.
--
-- Audit gap: `sendCounsellingConfirmation` (student) and
-- `sendCounsellingAdminNotification` (admin) hand-built locale-
-- conditional bodies in code. They never went through the
-- `email_templates` system, so:
--   1. No version control of the copy (can't edit body via SQL)
--   2. The Phase 124b "bilingual single-block" guarantee doesn't
--      cover these two — a zh-locale lead booking gets only Chinese
--      in the confirmation, an en-locale lead gets only English in
--      the admin notification
--   3. email_log.template_slug for these sends was 'counselling.confirmed'
--      (the existing slug), which masked the audit identity
--
-- Fix: add 2 new template rows with bilingual en+zh bodies in BOTH
-- `body_text` and `body_text_zh` columns (matching the Phase 124b
-- pattern). Port the two Phase-114 senders to call
-- `sendCounsellingTemplatedEmail({ slug: 'counselling.booking_received_student', ... })`
-- and `sendCounsellingTemplatedEmail({ slug: 'counselling.booking_received_admin', ... })`.
--
-- Apply via Supabase dashboard SQL editor (manual apply per the
-- `manual-supabase-migrations.md` memory).
-- ============================================================================

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
  'counselling.booking_received_student',
  'counselling',
  'Your counselling session is booked — {{reference}}',
  '咨询预约确认 — {{reference}}',
  $body$English:

Hi {{name}},

Your free 10-minute online counselling session with SICA is booked.

Reference: {{reference}}
Session time: {{slotLabel}}

A SICA advisor will confirm shortly and send you the meeting link by email or WhatsApp.
Need a different time? Just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}

中文：

您好 {{name}}，

您已成功预约 SICA 的免费 10 分钟在线咨询。

预约编号：{{reference}}
咨询时间：{{slotLabel}}

招生顾问会通过邮件或 WhatsApp 与您确认，并把会议链接发给您。
如需改期，直接回复本邮件即可。

— SICA 团队
Study in China Academy · 广州，中国

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  $body$English:

Hi {{name}},

Your free 10-minute online counselling session with SICA is booked.

Reference: {{reference}}
Session time: {{slotLabel}}

A SICA advisor will confirm shortly and send you the meeting link by email or WhatsApp.
Need a different time? Just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}

中文：

您好 {{name}}，

您已成功预约 SICA 的免费 10 分钟在线咨询。

预约编号：{{reference}}
咨询时间：{{slotLabel}}

招生顾问会通过邮件或 WhatsApp 与您确认，并把会议链接发给您。
如需改期，直接回复本邮件即可。

— SICA 团队
Study in China Academy · 广州，中国

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["name","reference","slotLabel","siteUrl","unsubToken"]'::jsonb,
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
  'counselling.booking_received_admin',
  'counselling',
  'New counselling booking {{reference}} — {{slotLabel}}',
  '新咨询预约 {{reference}} — {{slotLabel}}',
  $body$English:

A new free 10-minute counselling session has been booked.

Reference: {{reference}}
Slot: {{slotLabel}}
Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Country: {{country}}
Education level: {{educationLevel}}
Topic: {{topic}}
Page locale: {{locale}}

Manage it in the admin portal: {{adminUrl}}

— The SICA notification bot
Study in China Academy · Guangzhou, China

中文：

一条新的免费 10 分钟咨询预约已提交。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
姓名：{{name}}
邮箱：{{email}}
电话：{{phone}}
国家：{{country}}
学历：{{educationLevel}}
咨询主题：{{topic}}
页面语言：{{locale}}

请在管理后台处理：{{adminUrl}}

— SICA 通知机器人
Study in China Academy · 广州，中国$body$,
  $body$English:

A new free 10-minute counselling session has been booked.

Reference: {{reference}}
Slot: {{slotLabel}}
Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Country: {{country}}
Education level: {{educationLevel}}
Topic: {{topic}}
Page locale: {{locale}}

Manage it in the admin portal: {{adminUrl}}

— The SICA notification bot
Study in China Academy · Guangzhou, China

中文：

一条新的免费 10 分钟咨询预约已提交。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
姓名：{{name}}
邮箱：{{email}}
电话：{{phone}}
国家：{{country}}
学历：{{educationLevel}}
咨询主题：{{topic}}
页面语言：{{locale}}

请在管理后台处理：{{adminUrl}}

— SICA 通知机器人
Study in China Academy · 广州，中国$body$,
  '["reference","slotLabel","name","email","phone","country","educationLevel","topic","locale","adminUrl"]'::jsonb,
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
--   FROM email_templates
--   WHERE slug IN ('counselling.booking_received_student', 'counselling.booking_received_admin')
--   ORDER BY slug;
