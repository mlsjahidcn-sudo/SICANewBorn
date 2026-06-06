-- S29: Notifications + timeline for partner_applications.
--
-- The admin's PATCH on /api/admin/partner-applications/[id] (built in S27)
-- was silent — it updated the row but never wrote a timeline event and
-- never emailed the student or the partner. This migration gives it a
-- place to land.
--
-- 1. application_timeline gains a nullable partner_application_id FK.
--    The existing application_id (student_applications) stays. A CHECK
--    constraint guarantees exactly one is set per row — same row can't
--    be a student event AND a partner event, same as the
--    student_applications_must_have_party rule on the application
--    tables themselves.
--
-- 2. partner_notifications mirrors student_notifications. The
--    partner has a separate auth.users row (auth.uid() returns their
--    user id, not the student_applications.student_id), so a parallel
--    table is the right shape — the partner's notification inbox
--    (S30 will surface it in the UI) lives in its own rows.
--
-- 3. RLS on application_timeline is broadened to let partners read
--    timeline events for their own applications. The student SELECT
--    policy is unchanged (still scoped to their own student_applications).
--
-- 4. New email_templates rows: status.withdrawn (covers both surfaces)
--    and 6 status.*.partner slugs (parallel to the existing 6
--    status.*.student slugs, audience = the partner). The partner
--    templates render the same facts table but address the partner
--    directly ("Your student's application has been accepted…").

-- ---------------------------------------------------------------------------
-- 1. application_timeline gains a partner_application_id column
-- ---------------------------------------------------------------------------

ALTER TABLE application_timeline
  ADD COLUMN IF NOT EXISTS partner_application_id UUID
    REFERENCES partner_applications(id) ON DELETE CASCADE;

-- Exactly one of (application_id, partner_application_id) must be set.
-- Mirrors the student_applications_must_have_party rule.
ALTER TABLE application_timeline
  DROP CONSTRAINT IF EXISTS application_timeline_exactly_one_app;
ALTER TABLE application_timeline
  ADD CONSTRAINT application_timeline_exactly_one_app
  CHECK (
    (application_id IS NOT NULL)::int
    + (partner_application_id IS NOT NULL)::int = 1
  );

CREATE INDEX IF NOT EXISTS idx_application_timeline_partner_application_id
  ON application_timeline(partner_application_id);

-- RLS: partners can read timeline events for their own applications.
-- The existing "Students can view timeline for their applications"
-- policy stays; we add a parallel one for partners.
DROP POLICY IF EXISTS "Partners can view timeline for their applications"
  ON application_timeline;
CREATE POLICY "Partners can view timeline for their applications"
  ON application_timeline FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM partner_applications pa
      JOIN partners p ON p.id = pa.partner_id
      WHERE pa.id = application_timeline.partner_application_id
        AND p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 2. partner_notifications
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS partner_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- The partner's user_id (auth.users.id), NOT partners.id. The
  -- /partner/* pages auth as a regular user and auth.uid() returns
  -- their auth.users row.
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Optional FK to the source application. Nullable so a notification
  -- can be sent for a non-application event (e.g. team invite accepted,
  -- student joined their team, etc.) in the future.
  partner_application_id UUID REFERENCES partner_applications(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  -- 'status_change' | 'admin_note' | 'team' | 'info' | future
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  -- Optional link target (e.g. /partner/applications/<uuid>). The UI
  -- uses this when the user clicks the notification.
  link_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partner_notifications_user_id
  ON partner_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_is_read
  ON partner_notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_partner_notifications_created_at
  ON partner_notifications(created_at DESC);

ALTER TABLE partner_notifications ENABLE ROW LEVEL SECURITY;

-- Partners see their own notifications.
DROP POLICY IF EXISTS "Partners can view their own notifications"
  ON partner_notifications;
CREATE POLICY "Partners can view their own notifications"
  ON partner_notifications FOR SELECT
  USING (user_id = auth.uid());

-- Partners can update is_read / read_at on their own notifications.
DROP POLICY IF EXISTS "Partners can update their own notifications"
  ON partner_notifications;
CREATE POLICY "Partners can update their own notifications"
  ON partner_notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Service-role can insert (admin email + cron paths). No explicit
-- INSERT policy needed because the service role bypasses RLS.

-- ---------------------------------------------------------------------------
-- 3. Email templates
-- ---------------------------------------------------------------------------

-- status.withdrawn — used by BOTH the student path (admin cancels a
-- student application) and the partner path (admin withdraws a partner
-- application). The template uses {{audience}} to switch between
-- student-facing and partner-facing copy.
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms)
VALUES
('status.withdrawn', 'Application Withdrawn', 'Sent when admin withdraws an application (either student-direct or partner-submitted).', 'status',
 'Your SICA application has been withdrawn',
 '<p>Hi $ESC$firstName$,</p>
<p>Your SICA application $IF_APPLICATION_NUMBER$($ESC$applicationNumber)$ENDIF$ to <strong>$ESC$universityName</strong>$IF_PROGRAM_LINE$ — <em>$ESC$programLine</em>$ENDIF$ has been withdrawn.</p>

$FACTS$

<p>If you have any questions or would like to re-apply in a future intake, just reply to this email.</p>

<p>— The SICA team</p>',
 'Hi {{firstName}},

Your SICA application {{applicationNumber}} to {{universityName}}{{#if programLine}} — {{programLine}}{{/if}} has been withdrawn.

If you have any questions or would like to re-apply in a future intake, just reply to this email.

— The SICA team',
 jsonb_build_array('firstName', 'applicationNumber', 'universityName', 'programLine', 'facts'), true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = NOW();

-- status.submitted.partner
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms)
VALUES
('status.submitted.partner', 'Partner: Application submitted', 'Sent to the partner when admin moves their application to Submitted.', 'status',
 'SICA received your student''s application',
 '<p>Hi $ESC$firstName$,</p>
<p>The SICA team has confirmed that the application you submitted on behalf of your student has been received and queued for review.</p>

$FACTS$

<p>We''ll email you and your student the moment there''s an update.</p>

<p>— The SICA team</p>',
 'Hi {{firstName}},

The SICA team has confirmed that the application you submitted on behalf of your student has been received and queued for review.

We''ll email you and your student the moment there''s an update.

— The SICA team',
 jsonb_build_array('firstName', 'applicationNumber', 'universityName', 'programLine', 'facts'), true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = NOW();

-- status.under_review.partner
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms)
VALUES
('status.under_review.partner', 'Partner: Application in review', 'Sent to the partner when admin moves their application to In Review (maps to student status Under Review).', 'status',
 'SICA is reviewing your student''s application',
 '<p>Hi $ESC$firstName$,</p>
<p>The SICA team has started reviewing the application you submitted. We''ll email you and your student the moment there''s a decision.</p>

$FACTS$

<p>— The SICA team</p>',
 'Hi {{firstName}},

The SICA team has started reviewing the application you submitted. We''ll email you and your student the moment there''s a decision.

— The SICA team',
 jsonb_build_array('firstName', 'applicationNumber', 'universityName', 'programLine', 'facts'), true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = NOW();

-- status.documents_requested.partner
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms)
VALUES
('status.documents_requested.partner', 'Partner: SICA needs more documents', 'Sent to the partner when admin marks Documents Requested.', 'status',
 'SICA needs more documents from your student',
 '<p>Hi $ESC$firstName$,</p>
<p>SICA has requested additional documents for the application you submitted. Please follow up with your student to upload them as soon as possible.</p>

$FACTS$

<p>— The SICA team</p>',
 'Hi {{firstName}},

SICA has requested additional documents for the application you submitted. Please follow up with your student to upload them as soon as possible.

— The SICA team',
 jsonb_build_array('firstName', 'applicationNumber', 'universityName', 'programLine', 'facts'), true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = NOW();

-- status.decision_made.partner
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms)
VALUES
('status.decision_made.partner', 'Partner: A decision has been made', 'Sent to the partner when admin marks Decision Made (intermediate state before Accept/Reject).', 'status',
 'A decision has been made on your student''s application',
 '<p>Hi $ESC$firstName$,</p>
<p>SICA has reached a decision on the application you submitted. Check the partner portal for details, and we''ll send a follow-up email with the final outcome shortly.</p>

$FACTS$

<p>— The SICA team</p>',
 'Hi {{firstName}},

SICA has reached a decision on the application you submitted. Check the partner portal for details, and we''ll send a follow-up email with the final outcome shortly.

— The SICA team',
 jsonb_build_array('firstName', 'applicationNumber', 'universityName', 'programLine', 'facts'), true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = NOW();

-- status.accepted.partner
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms)
VALUES
('status.accepted.partner', 'Partner: Student application accepted', 'Sent to the partner when admin accepts their application.', 'status',
 '🎉 Your student''s SICA application was accepted!',
 '<p>Hi $ESC$firstName$,</p>
<p>Great news — the application you submitted on behalf of your student has been <strong>accepted</strong> by SICA. Congratulations!</p>

$FACTS$

<p>We''ll be in touch shortly with the next steps (visa documents, accommodation, etc.).</p>

<p>— The SICA team</p>',
 'Hi {{firstName}},

Great news — the application you submitted on behalf of your student has been ACCEPTED by SICA. Congratulations!

We''ll be in touch shortly with the next steps (visa documents, accommodation, etc.).

— The SICA team',
 jsonb_build_array('firstName', 'applicationNumber', 'universityName', 'programLine', 'facts'), true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = NOW();

-- status.rejected.partner
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms)
VALUES
('status.rejected.partner', 'Partner: Student application rejected', 'Sent to the partner when admin rejects their application.', 'status',
 'Update on your student''s SICA application',
 '<p>Hi $ESC$firstName$,</p>
<p>Unfortunately, the application you submitted has not been successful this time. The reasons are summarized below — please share them with your student.</p>

$FACTS$

<p>If you''d like to discuss alternative options (a different program or a future intake), just reply to this email.</p>

<p>— The SICA team</p>',
 'Hi {{firstName}},

Unfortunately, the application you submitted has not been successful this time. The reasons are summarized below — please share them with your student.

If you''d like to discuss alternative options (a different program or a future intake), just reply to this email.

— The SICA team',
 jsonb_build_array('firstName', 'applicationNumber', 'universityName', 'programLine', 'facts'), true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = NOW();

-- status.withdrawn.partner
INSERT INTO email_templates (slug, name, description, category, subject, body_html, body_text, variables, is_active, step_index, delay_ms)
VALUES
('status.withdrawn.partner', 'Partner: Application withdrawn', 'Sent to the partner when admin withdraws their application.', 'status',
 'Your student''s SICA application has been withdrawn',
 '<p>Hi $ESC$firstName$,</p>
<p>The application you submitted has been withdrawn. The student record has been preserved and can be re-activated in a future intake.</p>

$FACTS$

<p>Reply to this email if you have any questions.</p>

<p>— The SICA team</p>',
 'Hi {{firstName}},

The application you submitted has been withdrawn. The student record has been preserved and can be re-activated in a future intake.

Reply to this email if you have any questions.

— The SICA team',
 jsonb_build_array('firstName', 'applicationNumber', 'universityName', 'programLine', 'facts'), true, 0, 0)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_html = EXCLUDED.body_html,
  body_text = EXCLUDED.body_text,
  variables = EXCLUDED.variables,
  updated_at = NOW();
