-- Phase 164: add `{{webinarLabel}}` to the two webinar email
-- templates so the confirmation + 24h reminder carry the
-- per-session label ("Week 5 · Oct 20, 2026") alongside the
-- raw date. Both bodies stay bilingual in a single block per
-- the Phase 124b convention.
--
-- Idempotent UPSERT — safe to re-run. The body is rewritten
-- as a whole (we have no delta-vs-current body parser) so
-- admins who edited the template body in the dashboard will
-- see their edits overwritten. The description + subject
-- fields are not touched.

-- ───────────────────────────────────────────────────────────────────────
-- webinar.confirmed
-- ───────────────────────────────────────────────────────────────────────

UPDATE public.email_templates
SET
  body_text = 'Hi {{name}},

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
  body_text_zh = '您好 {{name}}，

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
  variables = jsonb_build_array(
    'name', 'joinLink', 'webinarDate', 'webinarTime',
    'webinarLabel', 'webinarTimeLocal', 'reference'
  )
WHERE slug = 'webinar.confirmed';

-- ───────────────────────────────────────────────────────────────────────
-- webinar.reminder_24h
-- ───────────────────────────────────────────────────────────────────────

UPDATE public.email_templates
SET
  body_text = 'Hi {{name}},

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
  body_text_zh = '您好 {{name}}，

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
  variables = jsonb_build_array(
    'name', 'joinLink', 'webinarDate', 'webinarTime',
    'webinarLabel', 'webinarTimeLocal', 'reference'
  )
WHERE slug = 'webinar.reminder_24h';

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
