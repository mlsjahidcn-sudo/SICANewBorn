-- ============================================================================
-- Email template editor (Phase 2.5)
--
-- Moves the 4 drip templates and 6 status templates from hard-coded
-- TypeScript into a database table. This lets the admin edit them from
-- the admin UI without redeploying, and it makes one-off "send email to
-- lead" (Phase 2.6) work the same way.
--
-- Tables:
--   1. email_templates  — the source of truth for every SICA-sent email
--   2. email_log        — audit trail for ad-hoc / one-off sends
--                          (drips already have their own email_drips table)
--
-- Slug convention: '<category>.<key>'
--   drip.welcome, drip.day1, drip.day3, drip.day7
--   status.submitted, status.under_review, status.documents_requested,
--   status.decision_made, status.accepted, status.rejected
--   oneoff.followup, oneoff.intro (admin-created)
--
-- Variable substitution: {{varName}} is HTML-escaped on render.
-- Body uses the SICA brand wrap (navy header, footer with unsub link)
-- automatically — only the inner content lives in the DB.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. email_templates
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL CHECK (category IN ('drip', 'status', 'oneoff')),
  subject       TEXT NOT NULL,
  body_html     TEXT NOT NULL,
  body_text     TEXT NOT NULL,
  -- JSON array of variable names this template uses. e.g. ['firstName', 'country'].
  -- Used by the admin UI to show "available variables" in the editor.
  variables     JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  -- Drip-only fields (null for status/oneoff). Lets the scheduler
  -- read the schedule from the DB without a JOIN to a separate table.
  step_index    INTEGER,
  delay_ms      BIGINT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    UUID REFERENCES auth.users(id)
);

CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "Admins can read email templates" ON email_templates;
CREATE POLICY "Admins can read email templates"
  ON email_templates FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert email templates" ON email_templates;
CREATE POLICY "Admins can insert email templates"
  ON email_templates FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update email templates" ON email_templates;
CREATE POLICY "Admins can update email templates"
  ON email_templates FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete email templates" ON email_templates;
CREATE POLICY "Admins can delete email templates"
  ON email_templates FOR DELETE
  USING (public.is_admin());

-- Service role bypasses RLS (server uses service-role client to render + send)
-- so the cron scheduler can read templates without an admin JWT.

-- Updated_at trigger
DROP TRIGGER IF EXISTS trg_email_templates_updated_at ON email_templates;
CREATE TRIGGER trg_email_templates_updated_at
  BEFORE UPDATE ON email_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ----------------------------------------------------------------------------
-- 2. email_log — one-off / ad-hoc sends
--
-- email_drips is the SCHEDULED drip queue (one row per (source, step)).
-- email_log is the AD-HOC send audit (one row per send). They serve
-- different purposes and we keep them separate so we don't bloat the
-- drip table with manual sends.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Polymorphic FK to a lead. Same pattern as lead_history.
  lead_type       TEXT NOT NULL CHECK (lead_type IN ('contact', 'chat', 'assessment', 'application')),
  lead_id         UUID NOT NULL,
  -- What we did
  template_id     UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  template_slug   TEXT,                -- denormalized for history
  -- Who we sent to
  to_email        TEXT NOT NULL,
  to_name         TEXT,
  -- The actual content (snapshot — if the template is later edited, the log
  -- still shows what was sent)
  subject         TEXT NOT NULL,
  body_html       TEXT NOT NULL,
  body_text       TEXT,
  -- Resend response
  resend_message_id TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  error           TEXT,
  -- Audit
  sent_by         UUID REFERENCES auth.users(id),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_log_lead
  ON email_log(lead_type, lead_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_sent_by
  ON email_log(sent_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_log_template
  ON email_log(template_id, created_at DESC);

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read email log" ON email_log;
CREATE POLICY "Admins can read email log"
  ON email_log FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can insert email log" ON email_log;
CREATE POLICY "Admins can insert email log"
  ON email_log FOR INSERT
  WITH CHECK (public.is_admin());

-- ----------------------------------------------------------------------------
-- 3. Seed the 10 templates that today live in src/lib/email/drip/templates.ts
--    and src/lib/email.ts (notifyApplicantOnStatusChange).
--
-- Body uses {{var}} placeholders. Render is HTML-escaped by default.
-- We seed only if the slug is missing (idempotent).
-- ----------------------------------------------------------------------------

-- ----- Drip: welcome -----
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, step_index, delay_ms)
SELECT
  'drip.welcome',
  'Welcome (Drip Step 0)',
  'Sent immediately after a lead submits the assessment or contact form. Introduces SICA, sets expectations, links to resources.',
  'drip',
  'Welcome to SICA — your study-in-China journey starts here',
  $body$greet(firstName)$
<p>Thanks for submitting your $IF_SOURCE_KIND_ASSESSMENT$academic assessment$ELSE$inquiry$ENDIF$ on SICA. We've received your details and our education consulting team is reviewing your profile now.</p>

<p><strong>What happens next:</strong></p>
<ol>
  <li>A senior consultant will review your academic background$IF_INTENDED_MAJOR$ and your interest in <strong>$ESC$intendedMajor</strong>$ENDIF$.</li>
  <li>Within <strong>48 hours</strong>, we'll send you a detailed assessment via WhatsApp or email — including which Chinese universities and scholarships you qualify for.</li>
  <li>You'll have a free 30-minute call with your advisor to discuss the next steps.</li>
</ol>

<p>In the meantime, here are some resources to get you up to speed on studying in China:</p>
<ul>
  <li><a href="{{siteUrl}}/guides/study-in-china">How to study in China: complete guide</a></li>
  <li><a href="{{siteUrl}}/scholarships">Scholarships available to international students</a></li>
  <li><a href="{{siteUrl}}/universities">Browse 50+ partner universities</a></li>
</ul>

<p>Reply to this email or message us on <a href="https://wa.me/8617325764171">WhatsApp +86 173 2576 4171</a> if you have any questions — we typically respond within 2 hours during business days.</p>

<p>Welcome aboard,<br/><strong style="color:#1B2A4A">The SICA Team</strong></p>$body$,
  $body$Hi {{firstName}},

Thanks for submitting your $IF_SOURCE_KIND_ASSESSMENT$academic assessment$ELSE$inquiry$ENDIF$ on SICA. We've received your details and our education consulting team is reviewing your profile now.

What happens next:
1. A senior consultant will review your academic background$IF_INTENDED_MAJOR$ and your interest in {{intendedMajor}}$ENDIF$.
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
  '["firstName","intendedMajor","sourceKind","siteUrl","unsubToken"]'::jsonb,
  0, 0
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'drip.welcome');

-- ----- Drip: day1 -----
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, step_index, delay_ms)
SELECT
  'drip.day1',
  'Day 1 — How to choose the right university',
  'Sent 1 day after capture. 5-point framework for picking a Chinese university. Bridges the gap while the advisor prepares the formal assessment.',
  'drip',
  'How to choose the right Chinese university (5 things to consider)',
  $body$greet(firstName)$
<p>While you wait for your advisor's assessment, here's a quick framework for picking the right Chinese university$IF_INTENDED_MAJOR$ for <strong>$ESC$intendedMajor</strong>$ENDIF$.</p>

<p style="font-weight:600;color:#1B2A4A">1. Match the university's strength to your field</p>
<p>China has 3,000+ universities, but only ~30 are widely known internationally. For $IF_INTENDED_MAJOR$$ESC$intendedMajor$ELSE$your field$ENDIF$, the top schools to consider are usually in the C9 League, Project 985, or Project 211 lists. We've curated the most popular choices for international students on our universities page.</p>

<p style="font-weight:600;color:#1B2A4A">2. Check the language of instruction</p>
<p>Most Chinese-taught programs are fully funded (CSC scholarship). English-taught programs are growing but have higher tuition. Bilingual tracks are a middle path. We can match you with programs based on your language proficiency.</p>

<p style="font-weight:600;color:#1B2A4A">3. Look at location, not just ranking</p>
<p>Beijing, Shanghai, Hangzhou, and Shenzhen are the four biggest student hubs. Each has its own character — Beijing is political/cultural, Shanghai is financial/international, Hangzhou is tech/startup, Shenzhen is hardware/tech. Your day-to-day life in China will be shaped by the city as much as the school.</p>

<p style="font-weight:600;color:#1B2A4A">4. Apply to 3–5 universities, not just one</p>
<p>Most students apply to multiple universities in parallel. We'll help you build a balanced shortlist: 1 reach, 2 targets, 1 safety. This maximizes your odds without doubling your workload.</p>

<p style="font-weight:600;color:#1B2A4A">5. Budget for the total cost, not just tuition</p>
<p>Tuition is the visible cost. Add accommodation (¥800–3,000/month), living expenses (¥2,000–3,500/month), insurance, visa fees, and one-time costs (flights, deposit). The full cost of attendance in a tier-1 city runs ¥80,000–120,000 per year. With scholarships, this can drop to near zero.</p>

<p>Our team will walk you through each of these in your assessment. In the meantime, here are the most popular programs at top Chinese universities:</p>

$CTA$Browse $IF_INTENDED_MAJOR$$ESC$intendedMajor programs$ELSE$all programs$ENDIF$|$/programs$|programs$body$,
  $body$Hi {{firstName}},

While you wait for your advisor's assessment, here's how to pick the right Chinese university$IF_INTENDED_MAJOR$ for {{intendedMajor}}$ENDIF$.

1. Match the university's strength to your field — top schools are usually C9 League, 985, or 211.
2. Check the language of instruction — Chinese-taught programs are usually fully funded.
3. Look at location, not just ranking — Beijing (political), Shanghai (financial), Hangzhou (tech), Shenzhen (hardware).
4. Apply to 3-5 universities, not just one — we help you build a balanced shortlist.
5. Budget for the total cost, not just tuition — full cost of attendance in tier-1 cities is ¥80,000-120,000/yr.

Browse programs: {{siteUrl}}/programs

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["firstName","intendedMajor","siteUrl","unsubToken"]'::jsonb,
  1, 86400000
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'drip.day1');

-- ----- Drip: day3 -----
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, step_index, delay_ms)
SELECT
  'drip.day3',
  'Day 3 — Scholarships you can apply for',
  'Sent 3 days after capture. Top 4 scholarships (CSC, Confucius, Belt and Road, university-specific) with country-specific context.',
  'drip',
  'Scholarships you can apply for as a student from $IF_COUNTRY$$ESC$country$ELSE$your country$ENDIF$',
  $body$greet(firstName)$
<p>One of the biggest questions international students have is <em>"Can I actually afford to study in China?"</em> The good news: there are dozens of scholarships that cover full tuition, accommodation, and a monthly stipend.</p>

<p>Here are the most common scholarships your peers from $IF_COUNTRY$$ESC$country$ELSE$your region$ENDIF$ apply for:</p>

<p style="font-weight:600;color:#1B2A4A">Chinese Government Scholarship (CSC)</p>
<p>Fully funded by the Chinese Ministry of Education. Covers tuition, accommodation, insurance, and a monthly stipend (¥2,500–3,500). Open to all nationalities. Apply through your home country's Chinese embassy or directly to a Chinese university.</p>

<p style="font-weight:600;color:#1B2A4A">Confucius Institute Scholarship</p>
<p>For students who have studied Chinese language or want to enroll in Chinese-taught programs. Full funding including a one-time settlement allowance. Application usually opens in March.</p>

<p style="font-weight:600;color:#1B2A4A">Belt and Road Scholarship</p>
<p>For students from Belt and Road partner countries$IF_COUNTRY$ (including <strong>$ESC$country</strong>)$ENDIF$. Covers tuition and provides a living stipend.</p>

<p style="font-weight:600;color:#1B2A4A">University-specific scholarships</p>
<p>Most SICA partner universities have their own scholarship programs — Tsinghua, Peking, Fudan, and others each award full or partial scholarships to top international applicants.</p>

<p>Our team will identify which scholarships you qualify for as part of your free assessment. We'll also help you prepare the application materials so you don't miss any deadlines.</p>

$CTA$Browse all scholarships|/$/scholarships$|scholarships$body$,
  $body$Hi {{firstName}},

One of the biggest questions international students have is "Can I actually afford to study in China?" The good news: there are dozens of scholarships that cover full tuition, accommodation, and a monthly stipend.

Most common scholarships your peers from $IF_COUNTRY$$ESC$country$ELSE$your region$ENDIF$ apply for:

- Chinese Government Scholarship (CSC): fully funded, all nationalities.
- Confucius Institute Scholarship: for Chinese-taught programs.
- Belt and Road Scholarship: for B&R partner countries$IF_COUNTRY$ (including $ESC$country)$ENDIF$.
- University-specific scholarships: Tsinghua, Peking, Fudan each have their own.

Browse all scholarships: {{siteUrl}}/scholarships

Unsubscribe: {{siteUrl}}/api/email/unsubscribe?token={{unsubToken}}$body$,
  '["firstName","country","siteUrl","unsubToken"]'::jsonb,
  2, 259200000
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'drip.day3');

-- ----- Drip: day7 -----
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, step_index, delay_ms)
SELECT
  'drip.day7',
  'Day 7 — Ready to apply?',
  'Sent 7 days after capture. Concrete list of what to send to start a formal application. CTA: reply, WhatsApp, or use the contact form.',
  'drip',
  'Ready to apply? Here''s what to send to start your SICA application',
  $body$greet(firstName)$
<p>It's been a week since you submitted your assessment. If you're ready to take the next step, here's exactly what to send to start a formal application with SICA:</p>

<p style="font-weight:600;color:#1B2A4A">1. Your latest academic transcript</p>
<p>Official or unofficial copy in PDF. If you submitted one with the assessment form, you're already set — no need to send again.</p>

<p style="font-weight:600;color:#1B2A4A">2. Your CV / resume</p>
<p>One page is fine. Include your education, any work experience, extracurriculars, awards, and language test scores if you have them.</p>

<p style="font-weight:600;color:#1B2A4A">3. A short statement of purpose (3-5 paragraphs)</p>
<p>Why China, why this program, and what you plan to do after you graduate. Don't overthink it — your SICA advisor will help you refine it.</p>

<p style="font-weight:600;color:#1B2A4A">4. Two recommendation letters (optional at this stage)</p>
<p>From professors or employers. You can send these later if you don't have them yet — most deadlines are 3+ months out.</p>

<p>Once you have these ready, the next step is a free 30-minute call with your advisor to confirm your shortlist, set your target universities, and finalize the application timeline.</p>

<p>The fastest way to start: reply to this email, message us on <a href="https://wa.me/8617325764171">WhatsApp +86 173 2576 4171</a>, or use the form below to confirm you'd like to proceed.</p>

$CTA$Start your application|/$/contact?subject=Application+next+steps$|contact_subject$body$,
  $body$Hi {{firstName}},

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
  '["firstName","siteUrl","unsubToken"]'::jsonb,
  3, 604800000
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'drip.day7');

-- ----- Status: 6 templates -----
-- Generic structure: greet + tone-specific intro + facts table + CTA + footer

INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables)
SELECT
  'status.submitted',
  'Status: Submitted (received)',
  'Fires when admin moves application to Submitted. Polite "we got it" email.',
  'status',
  'We received your SICA application',
  $body$greet(firstName)$
<p>Thanks for submitting your application to <strong>$ESC$universityName</strong>. Our admissions team has received it and will start the review shortly.</p>

$FACTS$

$IF_EXTRA_NOTE$<p style="background:#FAFAF8;padding:12px;border-left:3px solid #D4A853;margin:16px 0;font-size:14px;color:#444">$ESC$extraNote</p>$ENDIF$

<p>If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).</p>

<p>— The SICA Team<br/><span style="color:#888;font-size:12px">Study in China Academy · Guangzhou, China</span></p>$body$,
  $body$Your application is in

Hi {{firstName}},

Thanks for submitting your application to {{universityName}}. Our admissions team has received it and will start the review shortly.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Submitted

{{extraNote}}

If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  '["firstName","universityName","applicationNumber","extraNote","programName","degree","intake"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'status.submitted');

INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables)
SELECT
  'status.under_review',
  'Status: Under Review',
  'Fires when admin starts reviewing the application. Sets expectations on 5-10 day timeline.',
  'status',
  'Your SICA application is being reviewed',
  $body$greet(firstName)$
<p>Our admissions team is now reviewing your application to <strong>$ESC$universityName</strong>. We will be in touch as soon as a decision is made (usually within 5–10 business days).</p>

$FACTS$

$IF_EXTRA_NOTE$<p style="background:#FAFAF8;padding:12px;border-left:3px solid #D4A853;margin:16px 0;font-size:14px;color:#444">$ESC$extraNote</p>$ENDIF$

<p>If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).</p>

<p>— The SICA Team<br/><span style="color:#888;font-size:12px">Study in China Academy · Guangzhou, China</span></p>$body$,
  $body$We are reviewing your application

Hi {{firstName}},

Our admissions team is now reviewing your application to {{universityName}}. We will be in touch as soon as a decision is made (usually within 5–10 business days).

Application: {{applicationNumber}}
University: {{universityName}}
New status: Under Review

{{extraNote}}

If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  '["firstName","universityName","applicationNumber","extraNote"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'status.under_review');

INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables)
SELECT
  'status.documents_requested',
  'Status: Documents Requested',
  'Fires when admin needs more documents. Tells applicant what to do and gives the upload link.',
  'status',
  'SICA needs more documents from you',
  $body$greet(firstName)$
<p>Our admissions team has reviewed your application to <strong>$ESC$universityName</strong> and needs a few more documents from you before we can proceed.</p>

$FACTS$

$IF_EXTRA_NOTE$<p style="background:#FAFAF8;padding:12px;border-left:3px solid #D4A853;margin:16px 0;font-size:14px;color:#444">$ESC$extraNote</p>$ENDIF$

<p>Please reply to this email with the requested documents, or upload them at <a href="{{siteUrl}}/student/documents">your student portal</a>.</p>

<p>— The SICA Team<br/><span style="color:#888;font-size:12px">Study in China Academy · Guangzhou, China</span></p>$body$,
  $body$Additional documents needed

Hi {{firstName}},

Our admissions team has reviewed your application to {{universityName}} and needs a few more documents from you before we can proceed.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Documents Requested

{{extraNote}}

Please reply to this email with the requested documents, or upload them at {{siteUrl}}/student/documents.

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  '["firstName","universityName","applicationNumber","extraNote","siteUrl"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'status.documents_requested');

INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables)
SELECT
  'status.decision_made',
  'Status: Decision Made',
  'Fires when admin marks decision made. Tells applicant to check the portal for the decision letter.',
  'status',
  'A decision has been made on your SICA application',
  $body$greet(firstName)$
<p>Our admissions team has reached a decision on your application to <strong>$ESC$universityName</strong>. Please log in to your student portal for the full decision letter.</p>

$FACTS$

$IF_EXTRA_NOTE$<p style="background:#FAFAF8;padding:12px;border-left:3px solid #D4A853;margin:16px 0;font-size:14px;color:#444">$ESC$extraNote</p>$ENDIF$

<p>If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).</p>

<p>— The SICA Team<br/><span style="color:#888;font-size:12px">Study in China Academy · Guangzhou, China</span></p>$body$,
  $body$A decision has been made

Hi {{firstName}},

Our admissions team has reached a decision on your application to {{universityName}}. Please log in to your student portal for the full decision letter.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Decision Made

{{extraNote}}

If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  '["firstName","universityName","applicationNumber","extraNote"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'status.decision_made');

INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables)
SELECT
  'status.accepted',
  'Status: Accepted 🎉',
  'Fires when admin accepts. Celebratory tone. Tells applicant about next steps.',
  'status',
  '🎉 Congratulations — your SICA application was accepted!',
  $body$greet(firstName)$
<p>Congratulations! You have been accepted to <strong>$ESC$universityName</strong>.$IF_PROGRAM_NAME$ We look forward to welcoming you into the <strong>$ESC$programName</strong> program.$ENDIF$ This is a huge milestone — well done.</p>

$FACTS$

$IF_EXTRA_NOTE$<p style="background:#FAFAF8;padding:12px;border-left:3px solid #D4A853;margin:16px 0;font-size:14px;color:#444">$ESC$extraNote</p>$ENDIF$

<p>Next steps will be sent in a follow-up email. If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).</p>

<p>— The SICA Team<br/><span style="color:#888;font-size:12px">Study in China Academy · Guangzhou, China</span></p>$body$,
  $body$Welcome to China!

Hi {{firstName}},

Congratulations! You have been accepted to {{universityName}}{{programName}}. This is a huge milestone — well done.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Accepted

{{extraNote}}

Next steps will be sent in a follow-up email. If you have questions, reply to this email or message us on WhatsApp (+86 173 2576 4171).

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  '["firstName","universityName","programName","applicationNumber","extraNote"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'status.accepted');

INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables)
SELECT
  'status.rejected',
  'Status: Rejected',
  'Fires when admin rejects. Empathetic tone. Offers to discuss alternatives.',
  'status',
  'Update on your SICA application',
  $body$greet(firstName)$
<p>Thank you for your patience while we reviewed your application to <strong>$ESC$universityName</strong>. Unfortunately we are unable to offer you a place this cycle. This is by no means the end of your study-in-China journey — we would be happy to discuss alternative universities or programs.</p>

$FACTS$

$IF_EXTRA_NOTE$<p style="background:#FAFAF8;padding:12px;border-left:3px solid #D4A853;margin:16px 0;font-size:14px;color:#444">$ESC$extraNote</p>$ENDIF$

<p>Reply to this email or message us on WhatsApp (+86 173 2576 4171) and we'll explore alternatives with you.</p>

<p>— The SICA Team<br/><span style="color:#888;font-size:12px">Study in China Academy · Guangzhou, China</span></p>$body$,
  $body$Update on your application

Hi {{firstName}},

Thank you for your patience while we reviewed your application to {{universityName}}. Unfortunately we are unable to offer you a place this cycle. This is by no means the end of your study-in-China journey — we would be happy to discuss alternative universities or programs.

Application: {{applicationNumber}}
University: {{universityName}}
New status: Rejected

{{extraNote}}

Reply to this email or message us on WhatsApp (+86 173 2576 4171) and we'll explore alternatives with you.

— The SICA Team
Study in China Academy · Guangzhou, China$body$,
  '["firstName","universityName","applicationNumber","extraNote"]'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM email_templates WHERE slug = 'status.rejected');
