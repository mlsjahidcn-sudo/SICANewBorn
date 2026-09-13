-- ============================================================================
-- Phase 85: Admin Partner Welcome Email Template.
--
-- Seeds the `notification.partner_welcome` template used by the new
-- admin partner create flow (POST /api/admin/partners). Mirrors the
-- existing `notification.student_welcome` template (Phase 84) — fires
-- once when an admin creates a new partner org from /admin/partners/new
-- and sends the partner owner their auto-generated temporary password.
--
-- Schema is unchanged from Phase 84 (email_templates table already has
-- language/subject_zh/body_text_zh columns).
--
-- Pre-deploy: paste into the Supabase SQL editor. Idempotent via
-- ON CONFLICT (slug) DO UPDATE — safe to re-run.
-- ============================================================================

INSERT INTO email_templates (slug, name, description, category, subject, body_text, body_text_zh, variables, is_active, step_index, delay_ms)
VALUES (
  'notification.partner_welcome',
  'Partner: Welcome (admin-created account)',
  'Sent when an admin creates a new partner org from /admin/partners/new. Includes the auto-generated temp password.',
  'oneoff',
  'Welcome to the {{companyName}} SICA partner portal',
  $body$Hi {{contactName}},

An SICA administrator ({{createdByAdmin}}) has created your partner account on SICA.

You can now log in to manage your students, applications, and leads.

Your login credentials:
Email: {{email}}
Temporary password: {{temporaryPassword}}

Important: please log in and reset your password immediately. The temporary password expires in 7 days.

Login URL: {{partnerLoginUrl}}

If you did not expect this email, please contact admin@sica.cn.$body$,
  $body$你好 {{contactName}}，

SICA 管理员（{{createdByAdmin}}）已为你创建 SICA 合作伙伴账号。

你现在可以登录管理你的学员、申请和潜在客户。

登录凭据：
邮箱：{{email}}
临时密码：{{temporaryPassword}}

重要提示：请立即登录并重置密码。临时密码 7 天后失效。

登录链接：{{partnerLoginUrl}}

如果你没有预期收到此邮件，请联系 admin@sica.cn。$body$,
  jsonb_build_array('contactName','email','temporaryPassword','createdByAdmin','companyName','partnerLoginUrl'),
  true,
  NULL,
  NULL
)
ON CONFLICT (slug) DO UPDATE SET
  body_text = EXCLUDED.body_text,
  body_text_zh = EXCLUDED.body_text_zh,
  subject = EXCLUDED.subject,
  variables = EXCLUDED.variables,
  updated_at = NOW();