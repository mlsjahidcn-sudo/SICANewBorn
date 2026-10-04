'use client';

/**
 * SendEmailDialog — shared admin "Send email" composer (Phase 136).
 *
 * Flow: admin opens the dialog from a lead row (mail button) or a
 * student row (dropdown item) → types a theme → "Generate with AI"
 * calls /api/admin/ai/compose-email, which drafts a subject + body
 * weaving in real site links (WhatsApp group, WhatsApp 1:1, free
 * 10-min consultation, scholarships, …) → admin edits freely →
 * "Send" (or "Send test to me first").
 *
 * Sending routes by surface:
 *   - lead    → POST /api/admin/leads/[leadId]/send-email?type=<type>
 *   - student → POST /api/admin/students/[studentId]/send-email
 *
 * Everything is i18n'd under adminSendEmail.*.
 */
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { Mail, Sparkles, Send, FlaskConical, AlertCircle, CheckCircle } from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

export type SendEmailTarget =
  | { kind: 'lead'; leadId: string; leadType: 'contact' | 'chat' | 'assessment' }
  | { kind: 'student'; studentId: string };

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: SendEmailTarget | null;
  toEmail: string | null;
  toName: string | null;
  /** Extra recipient context for the AI (country, original message…). */
  country?: string | null;
  notes?: string | null;
}

interface ComposeResponse {
  subject: string;
  body: string;
  model?: string;
}

interface SendResponse {
  dryRun?: boolean;
  rendered?: { subject?: string };
}

export function SendEmailDialog({
  open,
  onOpenChange,
  target,
  toEmail,
  toName,
  country,
  notes,
}: SendEmailDialogProps) {
  const { t } = useI18n();
  const [theme, setTheme] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState<'real' | 'test' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setTheme('');
    setSubject('');
    setBody('');
    setError(null);
    setSuccess(null);
    setGenerating(false);
    setSending(null);
  };

  const handleClose = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const generate = async () => {
    if (!theme.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await apiFetchJson<ComposeResponse>('/api/admin/ai/compose-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme.trim(),
          recipientName: toName ?? undefined,
          country: country ?? undefined,
          sourceKind: target?.kind === 'student' ? 'student' : target?.leadType,
          notes: notes ?? undefined,
        }),
      });
      setSubject(res.subject || '');
      setBody(res.body || '');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('adminSendEmail.errorGenerate'));
    } finally {
      setGenerating(false);
    }
  };

  const send = async (mode: 'real' | 'test') => {
    if (!target || !subject.trim() || !body.trim() || sending) return;
    setSending(mode);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        subject: subject.trim(),
        body_text: body,
        ...(mode === 'test' ? { send_test: true } : {}),
      };
      const url =
        target.kind === 'lead'
          ? `/api/admin/leads/${target.leadId}/send-email?type=${target.leadType}`
          : `/api/admin/students/${target.studentId}/send-email`;
      const res = await apiFetchJson<SendResponse>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.dryRun) {
        setError(t('adminSendEmail.dryRunNotice'));
      } else if (mode === 'test') {
        setSuccess(t('adminSendEmail.testSent'));
      } else {
        setSuccess(t('adminSendEmail.sent'));
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('adminSendEmail.errorSend'));
    } finally {
      setSending(null);
    }
  };

  const canGenerate = theme.trim().length > 0 && !generating;
  const canSend = subject.trim().length > 0 && body.trim().length > 0 && sending === null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-none sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1B2A4A]">
            <Mail className="h-4 w-4" />
            {t('adminSendEmail.title')}
          </DialogTitle>
          <DialogDescription>
            {t('adminSendEmail.to')}: <span className="font-medium">{toEmail || '—'}</span>
            {toName ? ` (${toName})` : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 text-sm flex items-start gap-2">
              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Step 1 — theme */}
          <div>
            <label htmlFor="send-email-theme" className="text-sm font-medium text-[#1F2937]">
              {t('adminSendEmail.themeLabel')}
            </label>
            <p className="text-xs text-gray-500 mt-0.5 mb-1.5">{t('adminSendEmail.themeHint')}</p>
            <div className="flex gap-2">
              <Input
                id="send-email-theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder={t('adminSendEmail.themePlaceholder')}
                maxLength={500}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void generate();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!canGenerate}
                onClick={() => void generate()}
                className="border-[#1B2A4A] text-[#1B2A4A] hover:bg-[#1B2A4A] hover:text-white shrink-0"
              >
                {generating ? <Spinner size="xs" /> : <Sparkles className="h-4 w-4 mr-1" />}
                {generating ? t('adminSendEmail.generating') : t('adminSendEmail.generate')}
              </Button>
            </div>
          </div>

          {/* Step 2 — draft (editable) */}
          <div>
            <label htmlFor="send-email-subject" className="text-sm font-medium text-[#1F2937]">
              {t('adminSendEmail.subjectLabel')}
            </label>
            <Input
              id="send-email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t('adminSendEmail.subjectPlaceholder')}
              maxLength={300}
              className="mt-1.5"
            />
          </div>
          <div>
            <label htmlFor="send-email-body" className="text-sm font-medium text-[#1F2937]">
              {t('adminSendEmail.bodyLabel')}
            </label>
            <Textarea
              id="send-email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t('adminSendEmail.bodyPlaceholder')}
              rows={12}
              maxLength={20000}
              className="mt-1.5 font-mono text-[13px] leading-relaxed"
            />
            <p className="text-xs text-gray-500 mt-1">{t('adminSendEmail.editHint')}</p>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!canSend}
            onClick={() => void send('test')}
          >
            {sending === 'test' ? <Spinner size="xs" /> : <FlaskConical className="h-4 w-4 mr-1" />}
            {t('adminSendEmail.sendTest')}
          </Button>
          <Button
            type="button"
            disabled={!canSend}
            onClick={() => void send('real')}
            className="bg-[#1B2A4A] hover:bg-[#152033] text-white"
          >
            {sending === 'real' ? <Spinner size="xs" /> : <Send className="h-4 w-4 mr-1" />}
            {t('adminSendEmail.send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
