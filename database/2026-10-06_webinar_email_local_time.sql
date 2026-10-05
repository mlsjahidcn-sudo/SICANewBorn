-- Phase 141: render the student's local time alongside China
-- time in the webinar.confirmed confirmation email.
--
-- Adds a new template variable `webinarTimeLocal` to the
-- variables JSONB array (so the admin email-template editor
-- in /admin/emails shows it as a documented slot) and
-- updates both en + zh bodies to render the new line.
--
-- Idempotent: ON CONFLICT (slug) DO UPDATE so re-runs
-- refresh the row in place.

INSERT INTO public.email_templates (
  slug, name, description, category,
  subject, body_text, subject_zh, body_text_zh,
  variables, is_active, step_index, delay_ms
) VALUES (
  'webinar.confirmed',
  'Webinar signup confirmed',
  'Phase 139 + 141: instant confirmation after a /webinar-2027-intake-csc signup. Carries the join link + WhatsApp CTA + per-recipient local time.',
  'oneoff',
  'Your 2027 Intake + CSC Scholarship webinar seat is reserved',
  'Hi {{name}},

Thank you for registering for the SICA 2027 Intake + CSC Scholarship webinar.

Your seat is reserved. Here is everything you need to join:

JOIN LINK: {{joinLink}}
DATE: {{webinarDate}}
TIME (China, GMT+8): {{webinarTime}}
TIME (Your country): {{webinarTimeLocal}}

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

您的席位已预留成功。加入会议所需信息如下：

会议链接：{{joinLink}}
日期：{{webinarDate}}
时间（中国，GMT+8）：{{webinarTime}}
时间（您所在国家）：{{webinarTimeLocal}}

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
