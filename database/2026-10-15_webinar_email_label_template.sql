-- Phase 164: add `{{webinarLabel}}` to the two webinar email
-- templates so the confirmation + 24h reminder carry the
-- per-session label ("Week 5 · Oct 20, 2026") alongside the
-- raw date. Both bodies stay bilingual in a single block per
-- the Phase 124b convention.
--
-- Idempotent UPSERT — safe to re-run. Uses INSERT ... ON
-- CONFLICT (slug) DO UPDATE so missing rows (e.g. when the
-- Phase 162 reminder template never landed on a fresh
-- project) get inserted and existing ones get refreshed.
-- Body is rewritten as a whole (we have no delta-vs-current
-- body parser) so admins who edited the template body in the
-- dashboard will see their edits overwritten. The
-- description + subject fields are not touched.

-- ───────────────────────────────────────────────────────────────────────
-- webinar.confirmed
-- ───────────────────────────────────────────────────────────────────────

INSERT INTO public.email_templates (
  slug, name, description, category,
  subject, body_text, subject_zh, body_text_zh,
  variables, is_active, step_index, delay_ms
) VALUES (
  'webinar.confirmed',
  'Webinar signup confirmed',
  'Phase 139: instant confirmation after a /webinar-2027-intake-csc signup. Carries the join link + WhatsApp CTA. Phase 164: adds {{webinarLabel}} so the email carries the per-session label.',
  'oneoff',
  'Your 2027 Intake + CSC Scholarship webinar seat is reserved',
  'Hi {{name}},

Thank you for registering for the SICA 2027 Intake + CSC Scholarship webinar.

SESSION: {{webinarLabel}}
DATE: {{webinarDate}}
TIME: {{webinarTime}} (China)
TIME (your country): {{webinarTimeLocal}}

Your seat is reserved. Here is everything you need to join:

JOIN LINK: {{joinLink}}

You can also join via WhatsApp on the day — message us at +86 173 2576 4171 with this reference and we will resend the link: {{reference}}

What we will cover:
  • March 2027 intake — Chinese Language + Foundation programs
  • September 2027 intake — Bachelor''s + Master''s degrees
  • CSC Scholarship — eligibility, strategy, and how to apply
  • Live Q&A with a SICA admissions counsellor

We will send a 24-hour reminder before the session.

Questions before then? Just reply to this email or WhatsApp +86 173 2576 4171.

---
SICA Study in China Academy
https://studyinchina.academy
info@studyinchina.academy',
  '您的 2027 入学 + CSC 奖学金线上讲座席位已预留',
  '您好 {{name}}，

感谢您报名 SICA 2027 入学 + CSC 奖学金线上讲座。

场次：{{webinarLabel}}
日期：{{webinarDate}}
时间：{{webinarTime}}（北京时间）
您所在时区的时间：{{webinarTimeLocal}}

您的席位已预留成功。加入会议所需信息如下：

会议链接：{{joinLink}}

当天也可以通过 WhatsApp 加入 — 发送此编号至 +86 173 2576 4171，我们会重新发送链接：{{reference}}

本次讲座将涵盖：
  • 2027 年 3 月入学 — 中文语言 + 预科项目
  • 2027 年 9 月入学 — 本科 + 硕士研究生
  • CSC 奖学金 — 申请资格、策略与方法
  • SICA 招生顾问现场答疑

我们会在讲座开始前 24 小时发送提醒。

讲座前如有疑问，直接回复本邮件，或通过 WhatsApp 联系 +86 173 2576 4171。

---
SICA Study in China Academy
https://studyinchina.academy
info@studyinchina.academy',
  jsonb_build_array(
    'name', 'joinLink', 'webinarDate', 'webinarTime',
    'webinarLabel', 'webinarTimeLocal', 'reference'
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

-- ───────────────────────────────────────────────────────────────────────
-- webinar.reminder_24h
--
-- The original Phase 162 file used INSERT ... ON CONFLICT DO UPDATE
-- (it never landed on this project for whatever reason — the
-- apply_now migration included it but the row never made it to
-- the live DB). Phase 164 mirrors the same pattern so this row
-- gets created if missing + refreshed with the new webinarLabel
-- variable if existing.
-- ───────────────────────────────────────────────────────────────────────

INSERT INTO public.email_templates (
  slug, name, description, category,
  subject, body_text, subject_zh, body_text_zh,
  variables, is_active, step_index, delay_ms
) VALUES (
  'webinar.reminder_24h',
  'Webinar 24-hour reminder',
  'Phase 162: dispatched by /api/cron/webinar-reminders ~24h before the session. Bilingual single-block body (en+zh) per Phase 124b convention. Phase 164: adds {{webinarLabel}} so the email carries the per-session label.',
  'oneoff',
  'Reminder: your SICA webinar is tomorrow at {{webinarTime}}',
  'Hi {{name}},

This is your 24-hour reminder for the SICA webinar.

SESSION: {{webinarLabel}}
JOIN LINK: {{joinLink}}
DATE: {{webinarDate}}
TIME: {{webinarTime}} (China)
TIME (your country): {{webinarTimeLocal}}

Reference: {{reference}}

See you tomorrow — bring questions.

---
SICA Study in China Academy
https://studyinchina.academy
info@studyinchina.academy',
  '提醒：您的 SICA 线上讲座将于明日 {{webinarTime}} 举行',
  '您好 {{name}}，

这是您参加的 SICA 线上讲座的 24 小时提醒。

场次：{{webinarLabel}}
会议链接：{{joinLink}}
日期：{{webinarDate}}
时间：{{webinarTime}}（北京时间）
您所在时区的时间：{{webinarTimeLocal}}

编号：{{reference}}

讲座明天开始 — 欢迎带着问题参加。

---
SICA Study in China Academy
https://studyinchina.academy
info@studyinchina.academy',
  jsonb_build_array(
    'name', 'joinLink', 'webinarDate', 'webinarTime',
    'webinarLabel', 'webinarTimeLocal', 'reference'
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

-- Sanity probe — fail loud if either template missed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.email_templates
    WHERE slug = 'webinar.confirmed'
      AND variables @> '"webinarLabel"'::jsonb
  ) THEN
    RAISE EXCEPTION 'webinar.confirmed did not pick up webinarLabel variable';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.email_templates
    WHERE slug = 'webinar.reminder_24h'
      AND variables @> '"webinarLabel"'::jsonb
  ) THEN
    RAISE EXCEPTION 'webinar.reminder_24h did not pick up webinarLabel variable';
  END IF;
END $$;
