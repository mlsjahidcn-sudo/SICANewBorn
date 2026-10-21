-- ============================================================================
-- Phase 177 (2026-10-21): admin "request missing documents".
--
-- Problem: an admin reviewing a student's uploads has no way to ASK for
-- the documents that are missing. Today the only document side-effect in
-- the admin portal is PATCH /api/admin/documents/[id] (Verified / Rejected
-- on a row that already exists). There is no row to PATCH when the student
-- never uploaded the passport in the first place, and no channel to tell
-- the student what to send.
--
-- Fix: a first-class `document_requests` table + two email templates.
--
--   1. document_requests — one row per "we asked for these documents"
--      request. Holds the selected item list (JSONB), the rendered
--      message that was actually sent, the channel, the recipient, and
--      the send outcome. The XOR check makes it structurally impossible
--      to have both a student and a partner student, or neither.
--
--      Why a separate table and not a 'Requested' status on
--      student_documents? Because student_documents.file_url is NOT NULL
--      and a request has no file yet. A placeholder row would need a
--      fake URL, and every "is this doc still missing?" query would then
--      have to filter on a magic status. A separate table keeps the
--      outstanding-request list trivial and the upload queue clean.
--
--   2. email_templates rows `documents.requested` (to the student) and
--      `documents.requested.partner` (to the partner agency, so the
--      agency can chase a partner-sourced student). Both are 'oneoff'
--      category, bilingual (subject_zh + body_text_zh), and editable by
--      admins from /admin/emails — no code change needed to reword them.
--
-- Apply via Supabase dashboard SQL editor. Idempotent throughout.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. document_requests
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.document_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Exactly one target. student_id → student_profiles.id (auth.users id);
  -- partner_student_id → partner_students.id. The XOR constraint at the
  -- bottom of the table enforces "one, never both, never neither".
  student_id UUID REFERENCES public.student_profiles(id) ON DELETE CASCADE,
  partner_student_id UUID REFERENCES public.partner_students(id) ON DELETE CASCADE,

  -- Optional application context — a request can be scoped to one
  -- application, or float free (the student may be applying to several).
  application_id UUID REFERENCES public.student_applications(id) ON DELETE SET NULL,
  partner_application_id UUID REFERENCES public.partner_applications(id) ON DELETE SET NULL,

  -- 'student' | 'partner' — mirrors which of the two ids above is set.
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('student', 'partner')),

  -- What the admin asked for: [{ name, category, note }]. JSONB because
  -- the list length and contents vary per request and there is no query
  -- that needs to reach inside it.
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- The rendered text that was actually sent (email body and/or the
  -- WhatsApp message). Stored so the admin can see exactly what went
  -- out even after the template is edited.
  message TEXT NOT NULL DEFAULT '',
  subject TEXT,

  -- Which channel(s) the admin chose.
  channel VARCHAR(20) NOT NULL DEFAULT 'email'
    CHECK (channel IN ('email', 'whatsapp', 'both')),

  -- 'en' | 'zh' — the language the message was rendered in.
  language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'zh')),

  -- Recipient snapshot at send time. Deliberately denormalized: the
  -- partner may later edit the student's email, but the audit trail
  -- must show where the message actually went.
  recipient_name VARCHAR(255),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(50),

  -- 'Sent' → the request went out (or the admin marked the WhatsApp
  -- message as sent). 'Fulfilled' → the student supplied everything.
  -- 'Cancelled' → no longer needed (wrong student, wrong application).
  status VARCHAR(20) NOT NULL DEFAULT 'Sent'
    CHECK (status IN ('Sent', 'Fulfilled', 'Cancelled')),

  -- Email outcome.
  email_sent_at TIMESTAMPTZ,
  email_message_id TEXT,
  email_error TEXT,

  -- WhatsApp outcome. There is NO WhatsApp Business API in this
  -- codebase (the WABPO integration was dropped in Phase 98), so the
  -- admin copies the message / opens wa.me and confirms the send
  -- manually. whatsapp_sent_at is therefore admin-asserted, never
  -- API-verified — do not treat it as delivery proof.
  whatsapp_sent_at TIMESTAMPTZ,

  -- Free-form note the admin attached (deadline, portal instructions…).
  note TEXT,

  -- Audit.
  requested_by UUID NOT NULL REFERENCES auth.users(id),
  requested_by_email VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT document_requests_target_xor CHECK (
    (student_id IS NOT NULL AND partner_student_id IS NULL AND target_type = 'student')
    OR
    (student_id IS NULL AND partner_student_id IS NOT NULL AND target_type = 'partner')
  )
);

CREATE INDEX IF NOT EXISTS idx_document_requests_student_id
  ON public.document_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_partner_student_id
  ON public.document_requests(partner_student_id);
CREATE INDEX IF NOT EXISTS idx_document_requests_status
  ON public.document_requests(status);
CREATE INDEX IF NOT EXISTS idx_document_requests_created_at
  ON public.document_requests(created_at DESC);

-- updated_at trigger (same shape as the rest of the schema).
CREATE OR REPLACE FUNCTION public.set_document_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_document_requests_updated_at ON public.document_requests;
CREATE TRIGGER trg_document_requests_updated_at
  BEFORE UPDATE ON public.document_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_document_requests_updated_at();

-- ---------------------------------------------------------------------------
-- 2. RLS — admin only.
--
-- The feature is admin-only by product decision ("need only for admin"),
-- so students and partners get no policy at all: with RLS enabled and no
-- matching policy, SELECT/UPDATE return zero rows and INSERT is denied.
-- The portal routes use the service-role client, which bypasses RLS.
-- ---------------------------------------------------------------------------

ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all document requests" ON public.document_requests;
CREATE POLICY "Admins can view all document requests"
  ON public.document_requests FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can create document requests" ON public.document_requests;
CREATE POLICY "Admins can create document requests"
  ON public.document_requests FOR INSERT
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update document requests" ON public.document_requests;
CREATE POLICY "Admins can update document requests"
  ON public.document_requests FOR UPDATE
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. email_log.lead_type — add 'partner_student'.
--
-- Partner-sourced students live in partner_students, not student_profiles,
-- so their sends can't be logged under lead_type='student'. The CHECK
-- constraint is a closed enum; swap it by literal name (the constraint
-- IS named email_log_lead_type_check — see 2026-10-04_email_log_student_type.sql).
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'public.email_log'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%''partner_student''%'
  ) THEN
    RAISE NOTICE 'email_log.lead_type already accepts ''partner_student'' — skipping';
    RETURN;
  END IF;

  ALTER TABLE public.email_log
    DROP CONSTRAINT IF EXISTS email_log_lead_type_check;

  ALTER TABLE public.email_log
    ADD CONSTRAINT email_log_lead_type_check
    CHECK (lead_type IN (
      'contact', 'chat', 'assessment', 'application', 'counselling', 'student',
      'partner_student'
    ));
END
$$;

-- ---------------------------------------------------------------------------
-- 4. Email templates.
--
-- `documents.requested` goes to the student. `documents.requested.partner`
-- goes to the partner agency (a copy so the agency can chase the
-- student). Both use the same {{variables}} so the admin can reword
-- either one from /admin/emails without a code change.
-- ---------------------------------------------------------------------------

INSERT INTO public.email_templates (
  slug, name, description, category, subject, body_text, subject_zh, body_text_zh,
  variables, is_active, step_index, delay_ms
)
VALUES (
  'documents.requested',
  'Documents: Request missing documents (student)',
  'Sent when an admin asks a student to upload documents that are missing from their application.',
  'oneoff',
  'Action needed: {{documentCount}} document(s) still needed for your SICA application',
  'Hi {{studentName}},

We are reviewing your SICA application and need a few more documents before we can continue.

Documents we still need:
{{documentList}}

{{#if context}}{{context}}

{{/if}}{{#if extraNote}}{{extraNote}}

{{/if}}Please upload them to your student portal: {{portalUrl}}

If any of these documents are not available to you, reply to this email and tell us — we will find an alternative.

Best regards,
SICA Admissions Team',
  '需要补交材料：你的 SICA 申请还缺 {{documentCount}} 份文件',
  '{{studentName}} 您好，

我们正在审核您的 SICA 申请，还需要补充以下材料才能继续。

需要补交的材料：
{{documentList}}

{{#if context}}{{context}}

{{/if}}{{#if extraNote}}{{extraNote}}

{{/if}}请登录学生门户上传：{{portalUrl}}

如果其中某项材料暂时无法提供，请直接回复本邮件告诉我们，我们会协助寻找替代方案。

祝好，
SICA 招生团队',
  jsonb_build_array(
    'studentName', 'documentCount', 'documentList', 'context', 'extraNote', 'portalUrl'
  ),
  true, NULL, NULL
)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_text = EXCLUDED.body_text,
  subject_zh = EXCLUDED.subject_zh,
  body_text_zh = EXCLUDED.body_text_zh,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

INSERT INTO public.email_templates (
  slug, name, description, category, subject, body_text, subject_zh, body_text_zh,
  variables, is_active, step_index, delay_ms
)
VALUES (
  'documents.requested.partner',
  'Documents: Request missing documents (partner agency)',
  'Sent to the partner agency when an admin asks a partner-sourced student to upload missing documents.',
  'oneoff',
  'Action needed: {{documentCount}} document(s) missing for {{studentName}}',
  'Hello {{partnerName}},

We reviewed the application of {{studentName}} ({{studentEmail}}) and need a few more documents before we can continue.

Documents we still need:
{{documentList}}

{{#if context}}{{context}}

{{/if}}{{#if extraNote}}{{extraNote}}

{{/if}}Please ask the student to upload them to their SICA portal, or send them to us directly.

Best regards,
SICA Admissions Team',
  '需要补交材料：{{studentName}} 还缺 {{documentCount}} 份文件',
  '{{partnerName}} 您好，

我们审核了 {{studentName}}（{{studentEmail}}）的申请，还需要补充以下材料才能继续。

需要补交的材料：
{{documentList}}

{{#if context}}{{context}}

{{/if}}{{#if extraNote}}{{extraNote}}

{{/if}}请提醒学生登录 SICA 学生门户上传，或直接发送给我们。

祝好，
SICA 招生团队',
  jsonb_build_array(
    'partnerName', 'studentName', 'studentEmail', 'documentCount', 'documentList',
    'context', 'extraNote'
  ),
  true, NULL, NULL
)
ON CONFLICT (slug) DO UPDATE SET
  subject = EXCLUDED.subject,
  body_text = EXCLUDED.body_text,
  subject_zh = EXCLUDED.subject_zh,
  body_text_zh = EXCLUDED.body_text_zh,
  variables = EXCLUDED.variables,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Audit (uncomment after applying):
-- SELECT slug, is_active FROM email_templates WHERE slug LIKE 'documents.requested%';
-- SELECT conname, pg_get_constraintdef(oid) FROM pg_constraint
--   WHERE conrelid = 'public.email_log'::regclass AND conname = 'email_log_lead_type_check';
