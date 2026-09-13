-- ============================================================================
-- Phase 84: Email structure refactor — text-only + bilingual.
--
-- One source of truth for the entire SICA email pipeline: one FROM, one
-- signature, one unsubscribe footer, one locale resolution chain, one
-- renderer, one transport (Resend). Every email is plain text (no HTML).
-- Every email has en + zh variants. Every recipient gets the language
-- they registered with, falling back to cookie → Accept-Language → `en`.
--
-- Schema changes:
--   1. email_templates:
--        ADD language VARCHAR(5)        — discriminator (en|zh)
--        ADD subject_zh TEXT           — bilingual subject
--        ADD body_text_zh TEXT         — bilingual body
--        DROP body_html                — text-only forever
--        ADD helper index for the most common query
--   2. email_drips:
--        ADD recipient_locale VARCHAR(5) — persisted at schedule time
--                                          so the worker re-renders in the
--                                          recipient's language later
--        Backfill existing pending rows from auth.users via the email
--        column (recipient_email → auth.users.email)
--   3. email_log:
--        DROP body_html (audit now references body_text only)
--   4. Cleanup the 18 seeded templates:
--        - Remove macro syntax ($IF_X$/$ELSE$/$ENDIF$, $ESC$var$, $GREET$,
--          $FACTS$, $CTA$) from body_text — the new text-only renderer
--          does plain {{var}} substitution only.
--        - Add subject_zh + body_text_zh starter content for all 18.
--        - Set language='en' on all existing rows.
--
-- Pre-deploy: paste this into the Supabase dashboard SQL editor BEFORE
-- the code deploys. body_html drop is irreversible without manual
-- rollback (the existing body_text content was rebuilt as the canonical
-- source — old body_html content is preserved in git history).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. email_templates: add bilingual columns + language discriminator.
-- ----------------------------------------------------------------------------

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS language VARCHAR(5) NOT NULL DEFAULT 'en'
    CHECK (language IN ('en', 'zh'));

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS subject_zh TEXT;

ALTER TABLE email_templates
  ADD COLUMN IF NOT EXISTS body_text_zh TEXT;

-- Help index for the most common cron query:
-- "give me active en+drip templates ordered by step_index".
CREATE INDEX IF NOT EXISTS idx_email_templates_language_category_step
  ON email_templates (language, category, step_index)
  WHERE is_active = true;

-- ----------------------------------------------------------------------------
-- 2. email_templates: drop body_html (text-only forever).
--    Run AFTER the cleanup UPDATEs below in case a manual rollback is needed
--    — but in practice we commit both in one transaction.
-- ----------------------------------------------------------------------------

ALTER TABLE email_templates DROP COLUMN IF EXISTS body_html;

-- ----------------------------------------------------------------------------
-- 3. email_drips: add recipient_locale + backfill from auth.users.email.
--    Guarded: skipped entirely if the table doesn't exist in this DB
--    (some Supabase projects never created it — the 2026-06-04 migration
--    was a `CREATE TABLE IF NOT EXISTS`, so a missing table means the
--    earlier migration wasn't applied here).
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'email_drips'
  ) THEN
    ALTER TABLE email_drips ADD COLUMN IF NOT EXISTS recipient_locale VARCHAR(5);

    -- Backfill pending + failed rows. Look up the recipient via auth.users
    -- using their stored recipient_email; fall back to 'en' if the user
    -- isn't found (e.g. legacy signup row before auth.users was populated).
    -- Already-sent rows are left NULL (they don't re-render).
    UPDATE email_drips ed
    SET recipient_locale = COALESCE(
      (SELECT CASE
        WHEN au.raw_user_meta_data->>'locale' = 'zh' THEN 'zh'
        ELSE 'en'
      END
      FROM auth.users au
      WHERE au.email = ed.recipient_email
      LIMIT 1),
      'en'
    )
    WHERE recipient_locale IS NULL
      AND status IN ('pending', 'failed');
  ELSE
    RAISE NOTICE 'email_drips table not present — skipping recipient_locale migration';
  END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 4. email_log: drop body_html. The audit trail now references body_text.
--    Guarded like email_drips above in case the table is missing.
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'email_log'
  ) THEN
    ALTER TABLE email_log DROP COLUMN IF EXISTS body_html;
  ELSE
    RAISE NOTICE 'email_log table not present — skipping body_html drop';
  END IF;
END $$;

-- ============================================================================
-- 5. Cleanup the 18 seeded templates.
--    The existing body_text uses macro syntax ($IF_X$/$ELSE$/$ENDIF$,
--    $ESC$var$, $GREET$, $FACTS$, $CTA$) which the new text-only renderer
--    does NOT understand. We rewrite body_text to plain {{var}} substitution
--    and add the matching subject_zh + body_text_zh starter content.
--
--    Caller-side conditional logic that used to live in the macros now
--    lives in the caller (e.g. processPendingDrips sets sourceKind to
--    'academic assessment' or 'inquiry' based on the lead type, instead
--    of letting the template branch).
--
--    All existing rows get language='en' set explicitly (the column
--    already defaults to 'en' but be explicit for clarity).
-- ============================================================================

UPDATE email_templates SET language = 'en' WHERE language IS NULL;

-- ----- drip.welcome -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

Thanks for submitting your {{sourceKind}} on SICA. We've received your details and our education consulting team is reviewing your profile now.

What happens next:
1. A senior consultant will review your academic background{{#if intendedMajor}} and your interest in {{intendedMajor}}{{/if}}.
2. Within 48 hours, we'll send you a detailed assessment via WhatsApp or email.
3. You'll have a free 30-minute call with your advisor.

Resources to get you up to speed:
- How to study in China: {{siteUrl}}/guides/study-in-china
- Scholarships: {{siteUrl}}/scholarships
- Browse universities: {{siteUrl}}/universities

Reply to this email or message us on WhatsApp +86 173 2576 4171 if you have any questions.

Welcome aboard,
The SICA Team

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  subject = 'Welcome to SICA — your study-in-China journey starts here',
  subject_zh = '欢迎来到 SICA — 你的赴华留学之旅从这里开始',
  body_text_zh = $body$你好 {{firstName}}，

感谢你在 SICA 提交了{{sourceKind}}。我们已收到你的资料，留学顾问团队正在审核中。

接下来：
1. 资深顾问会审核你的学术背景{{#if intendedMajor}}，以及你对 {{intendedMajor}} 的兴趣{{/if}}。
2. 48 小时内，我们会通过 WhatsApp 或邮件给你详细的评估报告。
3. 你将与顾问进行一次免费的 30 分钟通话，了解后续步骤。

学习资料：
- 如何赴华留学：{{siteUrl}}/guides/study-in-china
- 奖学金：{{siteUrl}}/scholarships
- 浏览大学：{{siteUrl}}/universities

如有任何问题，请回复本邮件或在 WhatsApp +86 173 2576 4171 上联系我们。

欢迎加入，
SICA 团队

退订：{{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'drip.welcome';

-- ----- drip.day1 -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

While you wait for your advisor's assessment, here's how to pick the right Chinese university{{#if intendedMajor}} for {{intendedMajor}}{{/if}}.

1. Match the university's strength to your field — top schools are usually C9 League, 985, or 211.
2. Check the language of instruction — Chinese-taught programs are usually fully funded.
3. Look at location, not just ranking — Beijing (political), Shanghai (financial), Hangzhou (tech), Shenzhen (hardware).
4. Apply to 3-5 universities, not just one — we help you build a balanced shortlist.
5. Budget for the total cost, not just tuition — full cost of attendance in tier-1 cities is ¥80,000-120,000/yr.

Browse programs: {{siteUrl}}/programs

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  subject = 'How to choose the right Chinese university (5 things to consider)',
  subject_zh = '如何选择合适的留学院校（5 个要点）',
  body_text_zh = $body$你好 {{firstName}}，

在顾问准备评估报告的同时，以下是如何选择合适的中国大学{{#if intendedMajor}}（针对 {{intendedMajor}}）{{/if}}的方法。

1. 匹配大学的优势学科——顶尖院校通常在 C9、985 或 211 名单中。
2. 了解授课语言——中文授课项目通常有全额奖学金。
3. 关注地理位置——北京（政治文化）、上海（金融国际）、杭州（科技创业）、深圳（硬件科技）。
4. 同时申请 3-5 所大学——我们帮你构建合理的申请清单。
5. 预算总费用，不只是学费——一线城市每年总费用约 8-12 万元。

浏览项目：{{siteUrl}}/programs

退订：{{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'drip.day1';

-- ----- drip.day3 -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

One of the biggest questions international students have is "Can I actually afford to study in China?" The good news: there are dozens of scholarships that cover full tuition, accommodation, and a monthly stipend.

Most common scholarships your peers{{#if country}} from {{country}}{{/if}} apply for:

- Chinese Government Scholarship (CSC): fully funded, all nationalities.
- Confucius Institute Scholarship: for Chinese-taught programs.
- Belt and Road Scholarship: for B&R partner countries{{#if country}} (including {{country}}){{/if}}.
- University-specific scholarships: Tsinghua, Peking, Fudan each have their own.

Browse all scholarships: {{siteUrl}}/scholarships

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  subject = 'Scholarships you can apply for as a student{{#if country}} from {{country}}{{/if}}',
  subject_zh = '你可申请的奖学金{{#if country}}（来自 {{country}} 的学生）{{/if}}',
  body_text_zh = $body$你好 {{firstName}}，

国际学生最关心的问题之一是："我真的能负担得起去中国留学的费用吗？"好消息是：有几十种奖学金可覆盖全部学费、住宿和生活费。

{{#if country}}来自 {{country}} 的{{else}}你的{{/if}}同学最常申请的奖学金：

- 中国政府奖学金（CSC）：全额资助，所有国籍可申。
- 孔子学院奖学金：面向中文授课项目。
- 一带一路奖学金：面向一带一路合作伙伴国家{{#if country}}（包括 {{country}}）{{/if}}。
- 大学专项奖学金：清华、北大、复旦等都有自己的奖学金。

浏览所有奖学金：{{siteUrl}}/scholarships

退订：{{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'drip.day3';

-- ----- drip.day7 -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

It's been a week since you submitted your assessment. If you're ready to take the next step, here's exactly what to send to start a formal application with SICA:

1. Your latest academic transcript (PDF).
2. Your CV / resume (one page is fine).
3. A short statement of purpose (3-5 paragraphs).
4. Two recommendation letters (optional at this stage).

Once you have these ready, the next step is a free 30-minute call with your advisor.

The fastest way to start: reply to this email, message us on WhatsApp +86 173 2576 4171, or use the form at:
{{siteUrl}}/contact?subject=Application+next+steps

If now isn't the right time, we keep your file and will follow up at the 30-day mark.

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  subject = 'Ready to apply? Here''s what to send to start your SICA application',
  subject_zh = '准备好申请了吗？开始 SICA 申请需要提交的材料',
  body_text_zh = $body$你好 {{firstName}}，

你提交评估已经过去一周了。如果你准备好迈出下一步，以下是开始正式申请 SICA 时需要提供的材料：

1. 最新的成绩单（PDF）。
2. 个人简历（一页即可）。
3. 简短的个人陈述（3-5 段）。
4. 两封推荐信（现阶段可选）。

准备就绪后，下一步是与你的顾问进行免费的 30 分钟通话。

最快的开始方式：回复本邮件、在 WhatsApp +86 173 2576 4171 联系我们，或填写以下表单：
{{siteUrl}}/contact?subject=Application+next+steps

如果现在不是合适的时间，我们会保留你的资料，并在 30 天后再次跟进。

退订：{{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$
WHERE slug = 'drip.day7';

-- ----- status.submitted -----
UPDATE email_templates SET
  body_text = $body$Your application is in

Hi {{firstName}},

Thanks for submitting your application to {{universityName}}. Our admissions team has received it and will start the review shortly.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Submitted
{{extraNote}}

If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  subject = 'We received your SICA application',
  subject_zh = '我们已收到你的 SICA 申请',
  body_text_zh = $body$你的申请已收到

你好 {{firstName}}，

感谢你提交对 {{universityName}} 的申请。我们的招生团队已收到并将尽快开始审核。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：已提交
{{extraNote}}

如有疑问，请回复本邮件或在 WhatsApp（+86 173 2576 4171）上联系我们。

—— SICA 团队
SICA Study in China Academy · 中国广州$body$
WHERE slug = 'status.submitted';

-- ----- status.under_review -----
UPDATE email_templates SET
  body_text = $body$We are reviewing your application

Hi {{firstName}},

Our admissions team is now reviewing your application to {{universityName}}. We will be in touch as soon as a decision is made (usually within 5–10 business days).

Application: {{applicationNumber}}
University: {{universityName}}
New status: Under Review
{{extraNote}}

If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  subject = 'Your SICA application is being reviewed',
  subject_zh = '你的 SICA 申请正在审核中',
  body_text_zh = $body$我们正在审核你的申请

你好 {{firstName}}，

我们的招生团队正在审核你对 {{universityName}} 的申请。一旦有结果我们会立即通知你（通常在 5-10 个工作日内）。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：审核中
{{extraNote}}

如有疑问，请回复本邮件或在 WhatsApp（+86 173 2576 4171）上联系我们。

—— SICA 团队
SICA Study in China Academy · 中国广州$body$
WHERE slug = 'status.under_review';

-- ----- status.documents_requested -----
UPDATE email_templates SET
  body_text = $body$Additional documents needed

Hi {{firstName}},

Our admissions team has reviewed your application to {{universityName}} and needs a few more documents from you before we can proceed.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Documents Requested
{{extraNote}}

Please reply to this email with the requested documents, or upload them at {{siteUrl}}/student/documents.

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  subject = 'SICA needs more documents from you',
  subject_zh = 'SICA 需要你补充更多材料',
  body_text_zh = $body$需要补充材料

你好 {{firstName}}，

我们的招生团队已审核你对 {{universityName}} 的申请，在继续处理之前还需要你提供几份补充材料。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：需要补充材料
{{extraNote}}

请回复本邮件附上所需材料，或在 {{siteUrl}}/student/documents 上传。

—— SICA 团队
SICA Study in China Academy · 中国广州$body$
WHERE slug = 'status.documents_requested';

-- ----- status.decision_made -----
UPDATE email_templates SET
  body_text = $body$A decision has been made

Hi {{firstName}},

Our admissions team has reached a decision on your application to {{universityName}}. Please log in to your student portal for the full decision letter.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Decision Made
{{extraNote}}

If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  subject = 'A decision has been made on your SICA application',
  subject_zh = '你的 SICA 申请已有结果',
  body_text_zh = $body$你的申请已有结果

你好 {{firstName}}，

我们的招生团队已对你的 {{universityName}} 申请做出决定。请登录学生门户查看完整的录取通知书。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：已出结果
{{extraNote}}

如有疑问，请回复本邮件或在 WhatsApp（+86 173 2576 4171）上联系我们。

—— SICA 团队
SICA Study in China Academy · 中国广州$body$
WHERE slug = 'status.decision_made';

-- ----- status.accepted -----
UPDATE email_templates SET
  body_text = $body$Welcome to China!

Hi {{firstName}},

Congratulations! You have been accepted to {{universityName}}{{#if programName}} — {{programName}}{{/if}}. This is a huge milestone — well done.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Accepted
{{extraNote}}

Next steps will be sent in a follow-up email. If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  subject = 'Congratulations — your SICA application was accepted!',
  subject_zh = '恭喜 — 你的 SICA 申请已被录取！',
  body_text_zh = $body$欢迎来到中国！

你好 {{firstName}}，

恭喜！你已被 {{universityName}}{{#if programName}}（{{programName}}）{{/if}}录取。这是一个重要的里程碑，做得真好！

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：已录取
{{extraNote}}

后续步骤将在下一封邮件中发送。如有疑问，请回复本邮件或在 WhatsApp（+86 173 2576 4171）上联系我们。

—— SICA 团队
SICA Study in China Academy · 中国广州$body$
WHERE slug = 'status.accepted';

-- ----- status.rejected -----
UPDATE email_templates SET
  body_text = $body$Update on your application

Hi {{firstName}},

Thank you for your patience while we reviewed your application to {{universityName}}. Unfortunately we are unable to offer you a place this cycle. This is by no means the end of your study-in-China journey — we would be happy to discuss alternative universities or programs.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Rejected
{{extraNote}}

Reply to this email or message us on WhatsApp (+86 173 2576 4171) and we'll explore alternatives with you.

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  subject = 'Update on your SICA application',
  subject_zh = '你的 SICA 申请结果更新',
  body_text_zh = $body$你的申请结果更新

你好 {{firstName}}，

感谢你耐心等待我们对 {{universityName}} 申请的审核。遗憾的是，本周期我们无法为你提供录取名额。这绝不意味着你的赴华留学之旅结束——我们很乐意与你探讨其他大学或项目。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：未录取
{{extraNote}}

请回复本邮件或在 WhatsApp（+86 173 2576 4171）联系我们，我们将与你一起寻找其他选择。

—— SICA 团队
SICA Study in China Academy · 中国广州$body$
WHERE slug = 'status.rejected';

-- ----- status.withdrawn (applicant-facing) -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

Your SICA application{{#if applicationNumber}} ({{applicationNumber}}){{/if}} to {{universityName}}{{#if programLine}} — {{programLine}}{{/if}} has been withdrawn.

If you have any questions or would like to re-apply in a future intake, just reply to this email.

— The SICA team$body$,
  subject = 'Your SICA application has been withdrawn',
  subject_zh = '你的 SICA 申请已被撤回',
  body_text_zh = $body$你好 {{firstName}}，

你对 {{universityName}}{{#if programLine}}（{{programLine}}）{{/if}}的 SICA 申请{{#if applicationNumber}}（编号 {{applicationNumber}}）{{/if}}已被撤回。

如有任何问题或希望在未来招生季重新申请，请回复本邮件。

—— SICA 团队$body$
WHERE slug = 'status.withdrawn';

-- ----- status.submitted.partner -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

The SICA team has confirmed that the application you submitted on behalf of your student has been received and queued for review.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Submitted
{{extraNote}}

We'll email you and your student the moment there's an update.

— The SICA team$body$,
  subject = 'SICA received your student''s application',
  subject_zh = 'SICA 已收到你提交的学员申请',
  body_text_zh = $body$你好 {{firstName}}，

SICA 团队已确认收到你代表学员提交的申请，并已加入审核队列。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：已提交
{{extraNote}}

有更新我们会立即通知你和你的学员。

—— SICA 团队$body$
WHERE slug = 'status.submitted.partner';

-- ----- status.under_review.partner -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

The SICA admissions team is now reviewing the application you submitted.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Under Review
{{extraNote}}

Decisions typically arrive within 5–10 business days. We'll notify you and your student as soon as one is made.

— The SICA team$body$,
  subject = 'Your student''s application is under review',
  subject_zh = '你提交的学员申请正在审核',
  body_text_zh = $body$你好 {{firstName}}，

SICA 招生团队正在审核你提交的申请。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：审核中
{{extraNote}}

通常 5-10 个工作日内会有结果。一旦决定做出，我们会立即通知你和你的学员。

—— SICA 团队$body$
WHERE slug = 'status.under_review.partner';

-- ----- status.accepted.partner -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

Good news — your student has been accepted to {{universityName}}{{#if programName}} — {{programName}}{{/if}}.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Accepted
{{extraNote}}

Next steps for the student will be sent by email. Let us know if you need anything on your side to support them.

— The SICA team$body$,
  subject = 'Your student''s SICA application was accepted',
  subject_zh = '你提交的学员已被 SICA 录取',
  body_text_zh = $body$你好 {{firstName}}，

好消息——你的学员已被 {{universityName}}{{#if programName}}（{{programName}}）{{/if}}录取。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：已录取
{{extraNote}}

学员的后续步骤将通过邮件发送。如果你在协助学员方面有任何需求，请告诉我们。

—— SICA 团队$body$
WHERE slug = 'status.accepted.partner';

-- ----- status.rejected.partner -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

Thank you for your patience while we reviewed the application you submitted for your student. Unfortunately we are unable to offer a place this cycle.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Rejected
{{extraNote}}

Reply to this email and we'll explore alternative universities or programs together.

— The SICA team$body$,
  subject = 'Update on your student''s SICA application',
  subject_zh = '你提交的学员 SICA 申请结果更新',
  body_text_zh = $body$你好 {{firstName}}，

感谢你耐心等待我们对学员申请的审核。遗憾的是，本周期我们无法提供录取。

申请编号：{{applicationNumber}}
大学：{{universityName}}
最新状态：未录取
{{extraNote}}

请回复本邮件，我们将与你一起探讨其他大学或项目。

—— SICA 团队$body$
WHERE slug = 'status.rejected.partner';

-- ----- status.withdrawn.partner -----
UPDATE email_templates SET
  body_text = $body$Hi {{firstName}},

The application you submitted{{#if applicationNumber}} ({{applicationNumber}}){{/if}} on behalf of your student for {{universityName}}{{#if programLine}} — {{programLine}}{{/if}} has been withdrawn.

If you need to discuss re-applying in a future intake, just reply to this email.

— The SICA team$body$,
  subject = 'Your student''s SICA application has been withdrawn',
  subject_zh = '你提交的学员 SICA 申请已被撤回',
  body_text_zh = $body$你好 {{firstName}}，

你为学员提交的针对 {{universityName}}{{#if programLine}}（{{programLine}}）{{/if}}的申请{{#if applicationNumber}}（编号 {{applicationNumber}}）{{/if}}已被撤回。

如果你希望在未来招生季重新申请，请回复本邮件。

—— SICA 团队$body$
WHERE slug = 'status.withdrawn.partner';

-- ============================================================================
-- 6. Add 2 new partner-invite templates (notification.partner_invite,
--    notification.partner_reinvite) used by the partner team management
--    API routes. These replace the inline HTML+text invite bodies in
--    src/app/api/partner/team/route.ts + resend/route.ts.
-- ============================================================================

INSERT INTO email_templates (slug, name, description, category, subject, body_text, body_text_zh, variables, is_active, step_index, delay_ms)
VALUES
('notification.partner_invite', 'Partner: Team invitation', 'Sent when an owner invites a new team member to the partner portal.', 'oneoff',
 '{{contactName}} invited you to the {{companyName}} partner portal',
 'Hi,

{{contactName}} has invited you to join {{companyName}}''s SICA partner portal as a team member.

{{#if isNewUser}}Action needed: click the link below to set your password and accept the invitation.{{else}}Action needed: click the link below to sign in and accept the invitation.{{/if}}

Accept: {{acceptUrl}}

This link expires in {{ttlDays}} days. If you weren''t expecting this email, you can safely ignore it.',
 '你好，

{{contactName}} 邀请你加入 {{companyName}} 的 SICA 合作伙伴门户，担任团队成员。

{{#if isNewUser}}需要操作：点击下方链接设置密码并接受邀请。{{else}}需要操作：点击下方链接登录并接受邀请。{{/if}}

接受邀请：{{acceptUrl}}

此链接 {{ttlDays}} 天后过期。如果你没有预期收到这封邮件，可以安全忽略。',
 jsonb_build_array('contactName', 'companyName', 'acceptUrl', 'ttlDays', 'isNewUser'), true, NULL, NULL)
ON CONFLICT (slug) DO UPDATE SET
  body_text = EXCLUDED.body_text,
  body_text_zh = EXCLUDED.body_text_zh,
  subject = EXCLUDED.subject,
  variables = EXCLUDED.variables,
  updated_at = NOW();

-- ----- Admin-notification templates (5 hardcoded senders → DB rows) -----
-- These replace the inline HTML+text in src/lib/email.ts.
-- Variables used by each caller are documented in the variables array.

INSERT INTO email_templates (slug, name, description, category, subject, body_text, body_text_zh, variables, is_active, step_index, delay_ms)
VALUES
('notification.contact', 'Admin: New contact form submission', 'Sent to admin when someone submits the /contact form.', 'oneoff',
 'New Contact: {{subject}}',
 'New Contact Form Submission

Name: {{name}}
Email: {{email}}
Phone: {{phone}}
Subject: {{subject}}
Message: {{message}}
Source Page: {{sourcePage}}
Submitted At: {{submittedAt}}

Log in to the admin panel to update the status: {{adminLeadsUrl}}',
 '新的联系表单提交

姓名：{{name}}
邮箱：{{email}}
电话：{{phone}}
主题：{{subject}}
留言：{{message}}
来源页面：{{sourcePage}}
提交时间：{{submittedAt}}

请在管理员后台更新状态：{{adminLeadsUrl}}',
 jsonb_build_array('name','email','phone','subject','message','sourcePage','submittedAt','adminLeadsUrl'), true, NULL, NULL),

('notification.assessment', 'Admin: New assessment submission', 'Sent to admin when someone submits the /assessment form.', 'oneoff',
 'New Assessment: {{firstName}} {{lastName}}',
 'New Academic Assessment Submission

Name: {{firstName}} {{lastName}}
Email: {{email}}
WhatsApp: {{whatsapp}}
Country: {{country}}
Current Education: {{currentEducation}}
Intended Major: {{intendedMajor}}
Target Universities: {{targetUniversities}}
Has Transcript: {{hasTranscript}}
Source Page: {{sourcePage}}
Submitted At: {{submittedAt}}

Log in to the admin panel to review: {{adminAssessmentsUrl}}',
 '新的学术评估提交

姓名：{{firstName}} {{lastName}}
邮箱：{{email}}
WhatsApp：{{whatsapp}}
国家：{{country}}
当前学历：{{currentEducation}}
意向专业：{{intendedMajor}}
目标大学：{{targetUniversities}}
是否提供成绩单：{{hasTranscript}}
来源页面：{{sourcePage}}
提交时间：{{submittedAt}}

请在管理员后台审核：{{adminAssessmentsUrl}}',
 jsonb_build_array('firstName','lastName','email','whatsapp','country','currentEducation','intendedMajor','targetUniversities','hasTranscript','sourcePage','submittedAt','adminAssessmentsUrl'), true, NULL, NULL),

('notification.chat_lead', 'Admin: New chat lead', 'Sent to admin when someone fills the chat Save-my-progress form.', 'oneoff',
 '{{#if interestedProgram}}[SICA Chat] New lead interested in {{interestedProgram}}{{else}}[SICA Chat] New lead from AI assistant{{/if}}',
 'New Chat Lead captured from the SICA AI assistant.

Name: {{name}}
Email: {{email}}
WhatsApp: {{whatsapp}}
Country: {{country}}
Interested Degree: {{interestedDegree}}
Interested Program: {{interestedProgram}}
Interested University: {{interestedUniversity}}
Source Page: {{sourcePage}}
Submitted At: {{submittedAt}}

Log in to the admin panel to view the conversation context.',
 '{{#if interestedProgram}}SICA AI 助手新增对 {{interestedProgram}} 感兴趣的潜在学员{{else}}SICA AI 助手新增潜在学员{{/if}}

姓名：{{name}}
邮箱：{{email}}
WhatsApp：{{whatsapp}}
国家：{{country}}
意向学位：{{interestedDegree}}
意向项目：{{interestedProgram}}
意向大学：{{interestedUniversity}}
来源页面：{{sourcePage}}
提交时间：{{submittedAt}}

请在管理员后台查看对话上下文。',
 jsonb_build_array('name','email','whatsapp','country','interestedDegree','interestedProgram','interestedUniversity','sourcePage','submittedAt','adminLeadsUrl'), true, NULL, NULL),

('notification.student_welcome', 'Student: Welcome (auto-generated account)', 'Sent to a student when an admin creates their account via Add Offline Student.', 'oneoff',
 'Welcome to SICA — your account is ready',
 'Hi {{firstName}},

An SICA administrator ({{createdByAdmin}}) has created an account for you on the SICA platform.

You can now log in to track your application, upload documents, and message your advisor.

Your login credentials:
Email: {{email}}
Temporary password: {{temporaryPassword}}

Important: please log in and reset your password immediately. The temporary password expires in 7 days.

Login URL: {{studentLoginUrl}}

If you didn''t expect this email, please contact your SICA advisor.',
 '你好 {{firstName}}，

SICA 管理员（{{createdByAdmin}}）已为你在 SICA 平台创建了账号。

你现在可以登录以跟踪申请进度、上传材料、与顾问沟通。

登录凭据：
邮箱：{{email}}
临时密码：{{temporaryPassword}}

重要提示：请立即登录并重置密码。临时密码 7 天后失效。

登录链接：{{studentLoginUrl}}

如果你没有预期收到此邮件，请联系你的 SICA 顾问。',
 jsonb_build_array('firstName','lastName','email','temporaryPassword','createdByAdmin','studentLoginUrl'), true, NULL, NULL),

('notification.student_suspended', 'Student: Account suspended', 'Sent to a student when their account is suspended by an admin.', 'oneoff',
 'SICA — your account has been suspended',
 'Hi {{firstName}},

Your SICA account was suspended by {{suspendedByAdmin}} on {{suspendedAt}}.
{{#if reason}}Reason: {{reason}}{{/if}}

While suspended, you won''t be able to log in or make changes to your application. Your existing data is preserved.

If you believe this is a mistake, please reply to this email.',
 '你好 {{firstName}}，

你的 SICA 账号已于 {{suspendedAt}} 被 {{suspendedByAdmin}} 暂停。
{{#if reason}}原因：{{reason}}{{/if}}

暂停期间，你将无法登录或修改申请。现有数据已保留。

如果你认为这是误操作，请回复本邮件。',
 jsonb_build_array('firstName','suspendedByAdmin','reason','suspendedAt'), true, NULL, NULL)
ON CONFLICT (slug) DO UPDATE SET
  body_text = EXCLUDED.body_text,
  body_text_zh = EXCLUDED.body_text_zh,
  subject = EXCLUDED.subject,
  variables = EXCLUDED.variables,
  updated_at = NOW();