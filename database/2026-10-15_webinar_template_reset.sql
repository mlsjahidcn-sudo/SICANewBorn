-- Phase 165: reset webinar email templates to the static-config
-- shape (no per-session label), and remove the reminder template
-- entirely (no cron endpoint to dispatch it after Phase 165).
--
-- `webinar.confirmed` body drops the `SESSION: {{webinarLabel}}`
-- line that Phase 164 added — public page is fully static now,
-- so the email no longer needs the per-week label.
-- `webinar.reminder_24h` is DELETED — the cron endpoint
-- (`/api/cron/webinar-reminders`) was also removed in Phase 165,
-- so a 24h reminder template would be orphaned and confusing
-- in the dashboard.
--
-- All statements are idempotent — safe to re-run.
-- Admin still has the canonical email body strings via the
-- INSERT ... ON CONFLICT DO UPDATE pattern (Phase 164 lesson:
-- UPDATE-only migrations fail with P0001 when the row is missing).
--
-- Note: this rewrites the whole body so admins who edited the
-- template body in the Supabase dashboard will see their edits
-- overwritten. The description + subject fields are not touched.

-- ───────────────────────────────────────────────────────────────────────
-- webinar.confirmed — drop the SESSION: line
-- ───────────────────────────────────────────────────────────────────────

INSERT INTO public.email_templates (
  slug, name, description, category,
  subject, body_text, subject_zh, body_text_zh,
  variables, is_active, step_index, delay_ms
) VALUES (
  'webinar.confirmed',
  'Webinar signup confirmed',
  'Phase 139: instant confirmation after a /webinar-2027-intake-csc signup. Carries the join link + WhatsApp CTA. Phase 165: simplified back to the Phase 139/141 body shape (no per-session label) since the public page is static.',
  'oneoff',
  'Your 2027 Intake + CSC Scholarship webinar seat is reserved',
  'Hi {{name}},

Thank you for registering for the SICA 2027 Intake + CSC Scholarship webinar.

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

Questions before then? Just reply to this email or WhatsApp +86 173 2576 4171.

---
SICA Study in China Academy
https://studyinchina.academy
info@studyinchina.academy',
  '您的 2027 入学 + CSC 奖学金线上讲座席位已预留',
  '您好 {{name}}，

感谢您报名 SICA 2027 入学 + CSC 奖学金线上讲座。

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

讲座前如有疑问，直接回复本邮件，或通过 WhatsApp 联系 +86 173 2576 4171。

---
SICA Study in China Academy
https://studyinchina.academy
info@studyinchina.academy',
  jsonb_build_array(
    'name', 'joinLink', 'webinarDate', 'webinarTime',
    'webinarTimeLocal', 'reference'
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
-- webinar.reminder_24h — DELETE (no cron endpoint to dispatch)
-- ───────────────────────────────────────────────────────────────────────

DELETE FROM public.email_templates
WHERE slug = 'webinar.reminder_24h';

-- Sanity probe — fail loud if either template missed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.email_templates
    WHERE slug = 'webinar.confirmed'
      AND NOT (variables @> '"webinarLabel"'::jsonb)
  ) THEN
    RAISE EXCEPTION 'webinar.confirmed still has webinarLabel variable';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.email_templates
    WHERE slug = 'webinar.reminder_24h'
  ) THEN
    RAISE EXCEPTION 'webinar.reminder_24h template still exists';
  END IF;
END $$;
