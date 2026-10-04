-- ============================================================================
-- Phase 125b (2026-09-22): template-body fix-ups.
--
-- Audit of the 11 counselling.email_templates rows found 4 problems
-- (commit by Phase 124 + Phase 125). This file overwrites the affected
-- rows with corrected copy + variable lists. Apply via Supabase dashboard
-- SQL editor AFTER database/2026-09-22_counselling_proposals.sql.
--
-- Idempotent: each statement is an UPDATE … WHERE slug = '…' so a
-- re-run is a no-op.
-- ============================================================================

-- ============================================================================
-- 1. counselling.confirmed — subject was missing {{reference}}
-- ============================================================================

UPDATE public.email_templates
SET
  subject = 'Confirmed: your counselling session — {{reference}}',
  subject_zh = '咨询已确认 — {{reference}}',
  body_text = $body$English:

Hi {{name}},

Your free 10-minute counselling session with SICA is confirmed.

Reference: {{reference}}
Session time: {{slotLabel}}
{{meetingLine}}

A calendar invite (.ics) is attached — open it to add the session to your calendar. The .ics carries the meeting link as a clickable button.
Need to reschedule or cancel? Just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

您的 SICA 免费 10 分钟在线咨询已确认。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
{{meetingLine}}

日历邀请(.ics)已附在本邮件中,点击即可加入日历。日历事件中会议链接为可点击按钮。
如需改期或取消,请直接回复本邮件。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'counselling.confirmed';

-- ============================================================================
-- 2. counselling.rescheduled — fine, but verify alignment with siblings.
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

Hi {{name}},

Your SICA counselling session has been moved.

Reference: {{reference}}
Previous time: {{previousSlotLabel}}
New time: {{slotLabel}}
{{meetingLine}}

A fresh calendar invite (.ics) is attached — open it to update your calendar.
If the new time doesn't work, reply to this email and we'll find another slot.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

您的 SICA 咨询已被改期。

预约编号：{{reference}}
原咨询时间：{{previousSlotLabel}}
新咨询时间：{{slotLabel}}
{{meetingLine}}

新的日历邀请(.ics)已附在本邮件中,请更新您的日历。
如新时间不合适,请直接回复本邮件,我们会再次调整。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'counselling.rescheduled';

-- ============================================================================
-- 3. counselling.cancelled
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

Hi {{name}},

Your SICA free counselling session has been cancelled.

Reference: {{reference}}
Original time: {{slotLabel}}

You can book a new time any moment: {{siteUrl}}/counselling
Any questions — just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

很抱歉,您预约的 SICA 免费咨询已被取消。

预约编号：{{reference}}
原咨询时间：{{slotLabel}}

您可以随时重新预约:{{siteUrl}}/counselling
如有任何疑问,直接回复本邮件即可。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'counselling.cancelled';

-- ============================================================================
-- 4. counselling.completed
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

Hi {{name}},

Thanks for your free 10-minute chat with SICA on {{slotLabel}}.

Reference: {{reference}}

If you'd like to keep going, you can book another session any time: {{siteUrl}}/counselling
Or start a formal application: {{siteUrl}}/assessment

Any questions, just reply to this email.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

感谢您于 {{slotLabel}} 与 SICA 完成的免费 10 分钟咨询。

预约编号：{{reference}}

如您希望继续沟通,可随时再预约一次:{{siteUrl}}/counselling
或直接开始正式申请:{{siteUrl}}/assessment

如有疑问,请直接回复本邮件。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'counselling.completed';

-- ============================================================================
-- 5. counselling.no_show — slightly tighter copy.
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

Hi {{name}},

We didn't connect on your SICA counselling session scheduled for {{slotLabel}} — totally fine, things come up.

Reference: {{reference}}

Whenever you're ready, pick a new time here: {{siteUrl}}/counselling
Or message us on WhatsApp +86 173 2576 4171 and we'll find one for you.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

您原定 {{slotLabel}} 的 SICA 咨询我们没能连上——没关系,临时有事很正常。

预约编号：{{reference}}

您方便时,可以重新预约:{{siteUrl}}/counselling
或通过 WhatsApp +86 173 2576 4171 联系我们,我们帮您安排。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'counselling.no_show';

-- ============================================================================
-- 6. counselling.meeting_link_updated — fine, tighten slightly.
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

Hi {{name}},

We've updated the meeting link for your counselling session.

Reference: {{reference}}
Session time: {{slotLabel}}
New meeting link: {{meetingLine}}

A fresh calendar invite (.ics) is attached with the new link — open it to update your calendar.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

您的咨询会议链接已更新。

预约编号：{{reference}}
咨询时间：{{slotLabel}}
新会议链接：{{meetingLine}}

新的日历邀请(.ics)已附在邮件中,点击即可更新您的日历。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'counselling.meeting_link_updated';

-- ============================================================================
-- 7. counselling.reminder_24h — copy was promising a meeting link that
-- already arrived in the original booking confirmation. Reword to
-- point at the .ics.
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

Hi {{name}},

A friendly reminder: your free SICA counselling session is in 24 hours.

Reference: {{reference}}
Session time: {{slotLabel}}

Your meeting link was attached to your booking confirmation email as a calendar invite (.ics). Open that .ics in your calendar app to join — the meeting link is one click away. Need help? WhatsApp us any time: https://wa.me/8617325764171

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

温馨提示：您的 SICA 免费咨询 24 小时后开始。

预约编号：{{reference}}
咨询时间：{{slotLabel}}

会议链接已在预约确认邮件中以日历邀请(.ics)形式发送。在日历应用中打开 .ics 即可一键加入会议。
如需帮助,随时 WhatsApp 联系我们:https://wa.me/8617325764171

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  variables = '["name","reference","slotLabel","siteUrl","unsubToken"]'::jsonb
WHERE slug = 'counselling.reminder_24h';

-- ============================================================================
-- 8. counselling.reminder_2h — same fix: point at the .ics, not a
-- forthcoming email.
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

Hi {{name}},

Your free SICA counselling session starts in less than 2 hours.

Reference: {{reference}}
Session time: {{slotLabel}}

Your meeting link was attached to your booking confirmation email as a calendar invite (.ics). Open that .ics to join — the meeting link is one click away. Need help? WhatsApp us any time: https://wa.me/8617325764171

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

您的 SICA 免费咨询将在 2 小时内开始。

预约编号：{{reference}}
咨询时间：{{slotLabel}}

会议链接已在预约确认邮件中以日历邀请(.ics)形式发送。在日历应用中打开 .ics 即可一键加入会议。
如需帮助,随时 WhatsApp 联系我们:https://wa.me/8617325764171

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  variables = '["name","reference","slotLabel","siteUrl","unsubToken"]'::jsonb
WHERE slug = 'counselling.reminder_2h';

-- ============================================================================
-- 9. counselling.proposed — variable list + subject already correct.
-- Tighten body slightly so student knows the deadline is hard.
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

Hi {{name}},

A SICA advisor has suggested a time for your free 10-minute counselling session:

Reference: {{reference}}
Proposed time: {{proposedSlotLabel}}

If this works, click here to confirm:
{{acceptUrl}}

If this time doesn't work, you can pick another slot here:
{{counterUrl}}

This proposal expires on {{proposalExpiresAt}}. After that, please book a new time at {{siteUrl}}/counselling.

— The SICA Team
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  body_text_zh = $body$中文:

您好 {{name}},

SICA 招生顾问为您推荐了以下咨询时间：

预约编号：{{reference}}
建议时间：{{proposedSlotLabel}}

如果该时间方便,请点击此处确认：
{{acceptUrl}}

如果该时间不合适,您可以在这里选择其他时段：
{{counterUrl}}

本次推荐将于 {{proposalExpiresAt}} 过期。过期后请到 {{siteUrl}}/counselling 重新预约。

— SICA 团队
Study in China Academy · Guangzhou, China

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'counselling.proposed';

-- ============================================================================
-- 10. counselling.proposal_accepted — by design delegates to
-- counselling.confirmed (same body via sendCounsellingProposalAccepted).
-- No fix needed; the slug is only used in email_log for audit.
-- ============================================================================

-- ============================================================================
-- 11. counselling.proposal_declined — admin notification. Tightens.
-- ============================================================================
UPDATE public.email_templates
SET
  body_text = $body$English:

{{name}} couldn't make the proposed slot and picked another time.

Reference: {{reference}}
Original proposal: {{previousSlotLabel}}
Counter-proposal: {{slotLabel}}

Manage it in the admin portal: {{adminUrl}}
A fresh proposal email has been sent to the student.

— The SICA notification bot
Study in China Academy · Guangzhou, China$body$,
  body_text_zh = $body$中文:

{{name}} 无法在建议时段接受咨询,已选择其他时间。

预约编号：{{reference}}
原建议时段：{{previousSlotLabel}}
学生改期：{{slotLabel}}

请在管理后台处理：{{adminUrl}}
新的咨询时间确认邮件已发送给学生。

— SICA 通知机器人
Study in China Academy · Guangzhou, China$body$
WHERE slug = 'counselling.proposal_declined';

-- Audit (uncomment after applying):
-- SELECT slug, subject, subject_zh,
--        CASE WHEN body_text LIKE '%English:%' AND body_text LIKE '%中文:%' THEN 'bilingual OK'
--             ELSE 'check' END AS body_check
--   FROM email_templates WHERE slug LIKE 'counselling.%' ORDER BY slug;