'use client';

/**
 * Admin: lead detail page — Phase 2.1 lead workflow.
 *
 * Shows full lead info, allows status / notes / assignee edits,
 * records a "contacted" action, and shows the full timeline
 * (lead_history rows, newest first).
 *
 * URL: /admin/leads/[id]?type=contact|chat|assessment
 *
 * Phase 44b: i18n — `adminLeadDetail.*` namespace in
 * src/lib/i18n-translations.ts. Status/tier enum values stay
 * untranslated (DB round-trip), only human-readable chrome moves.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageCircle,
  Save,
  CheckCircle,
  AlertCircle,
  Globe,
  GraduationCap,
  FileText,
  ExternalLink,
  History,
  PhoneCall,
  Send,
  X,
} from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';

type LeadType = 'contact' | 'chat' | 'assessment';

interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: string;
}

interface HistoryRow {
  id: string;
  lead_type: string;
  lead_id: string;
  admin_id: string | null;
  action: string;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  created_at: string;
}

interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  category: 'drip' | 'status' | 'oneoff';
  subject: string;
  description: string | null;
}

interface LeadDetail {
  lead: Record<string, unknown>;
  history: HistoryRow[];
}

// Status colors are untranslated because the status values are DB enums.
const STATUS_COLOR: Record<string, string> = {
  New: 'bg-blue-100 text-blue-800',
  Pending: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Reviewed: 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
  Accepted: 'bg-green-100 text-green-800',
  Qualified: 'bg-green-100 text-green-800',
  Spam: 'bg-gray-100 text-gray-700',
  Unqualified: 'bg-gray-100 text-gray-700',
  Rejected: 'bg-red-100 text-red-800',
  Contacted: 'bg-purple-100 text-purple-800',
};

const STATUS_WHITELIST: Record<LeadType, string[]> = {
  contact: ['New', 'In Progress', 'Resolved', 'Spam'],
  chat: ['New', 'Contacted', 'Qualified', 'Unqualified'],
  assessment: ['Pending', 'Reviewed', 'Contacted', 'Accepted', 'Rejected'],
};

// ACTION_LABEL and ACTION_ICON stay English — `action` is a DB enum that
// round-trips through lead_history rows; translating it would break the
// `ACTION_ICON[action]` lookup below and the action-tracking semantics.
const ACTION_LABEL: Record<string, string> = {
  created: 'Lead created',
  status_changed: 'Status changed',
  notes_updated: 'Notes updated',
  assigned: 'Assigned',
  unassigned: 'Unassigned',
  contacted: 'Contact attempt',
};

const ACTION_ICON: Record<string, string> = {
  created: '＋',
  status_changed: '⇄',
  notes_updated: '✎',
  assigned: '→',
  unassigned: '←',
  contacted: '☎',
};

// WABPO WhatsApp template — phase 45a
interface WabpoTemplate {
  id: string;
  templateName: string;
  category: string;
  templateType: string;
  status: string;
  variableDefinitions: Array<{
    key: string;
    placeholder: string;
    sequence: number;
    source: string;
  }>;
}

export default function LeadDetailPage() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = (searchParams.get('type') || 'contact') as LeadType;
  const id = params.id;

  const [lead, setLead] = useState<Record<string, unknown> | null>(null);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // WABPO WhatsApp state — phase 45a
  const [wabpoConfigured, setWabpoConfigured] = useState<boolean | null>(null);
  const [wabpoTemplates, setWabpoTemplates] = useState<WabpoTemplate[]>([]);
  const [wabpoModalOpen, setWabpoModalOpen] = useState(false);
  const [wabpoSelectedTemplateId, setWabpoSelectedTemplateId] = useState('');
  const [wabpoVariables, setWabpoVariables] = useState<Record<string, string>>({});
  const [wabpoOverrideNumber, setWabpoOverrideNumber] = useState('');
  const [wabpoSending, setWabpoSending] = useState(false);
  const [wabpoSendError, setWabpoSendError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Editable form fields
  const [statusVal, setStatusVal] = useState<string>('');
  const [notesVal, setNotesVal] = useState<string>('');
  const [assigneeVal, setAssigneeVal] = useState<string>(''); // 'unassigned' | user_id
  const [contactChannel, setContactChannel] = useState<string>('whatsapp');

  // Email modal (Phase 2.6)
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTemplateId, setEmailTemplateId] = useState<string>('');
  const [emailOverrideSubject, setEmailOverrideSubject] = useState<string>('');
  const [emailOverrideHtml, setEmailOverrideHtml] = useState<string>('');
  const [emailOverrideText, setEmailOverrideText] = useState<string>('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSendTest, setEmailSendTest] = useState(false);

  // Lead type labels depend on locale — re-derive on every render so a
  // locale switch repaints them. The values themselves remain DB
  // constants; only the user-visible badge label moves.
  const TYPE_LABEL: Record<LeadType, string> = useMemo(
    () => ({
      contact: t('adminLeads.typeContact'),
      chat: t('adminLeads.typeChat'),
      assessment: t('adminLeads.typeAssessment'),
    }),
    [t],
  );

  const CHANNEL_LABEL: Record<string, string> = useMemo(
    () => ({
      whatsapp: t('adminLeadDetail.channelWhatsapp'),
      email: t('adminLeadDetail.channelEmail'),
      phone: t('adminLeadDetail.channelPhoneCall'),
      sms: t('adminLeadDetail.channelSms'),
      other: t('adminLeadDetail.channelOther'),
    }),
    [t],
  );

  // Load lead + history + team in parallel
  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const [leadRes, teamRes, tplRes] = await Promise.all([
        apiFetchJson<LeadDetail>(`/api/admin/leads/${id}?type=${type}`),
        apiFetchJson<{ team: TeamMember[] }>(`/api/admin/team`),
        apiFetchJson<{ templates: EmailTemplate[] }>(`/api/admin/emails/templates?category=oneoff`),
      ]);
      setLead(leadRes.lead);
      setHistory(leadRes.history || []);
      setStatusVal(String(leadRes.lead.status || ''));
      setNotesVal(String(leadRes.lead.notes || ''));
      setAssigneeVal(
        leadRes.lead.assigned_to ? String(leadRes.lead.assigned_to) : 'unassigned',
      );
      setTeam(teamRes.team || []);
      setTemplates((tplRes.templates || []).filter((t) => t.category === 'oneoff'));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminLeadDetail.errorFailedLoad'));
    } finally {
      setIsLoading(false);
    }
  }, [id, type, t]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (overrides: Record<string, unknown> = {}) => {
    setIsSaving(true);
    setSaveSuccess(null);
    setLoadError(null);
    try {
      const body: Record<string, unknown> = { ...overrides };
      if (overrides.status === undefined && statusVal) body.status = statusVal;
      if (overrides.notes === undefined && notesVal !== undefined) body.notes = notesVal;
      if (overrides.assigned_to === undefined) {
        body.assigned_to = assigneeVal === 'unassigned' ? null : assigneeVal;
      }
      const res = await apiFetchJson<LeadDetail>(
        `/api/admin/leads/${id}?type=${type}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      setLead(res.lead);
      setHistory(res.history || []);
      setSaveSuccess(t('adminLeadDetail.toastSaved'));
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : t('adminLeadDetail.toastSaveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const recordContact = async () => {
    setIsSaving(true);
    setSaveSuccess(null);
    setLoadError(null);
    try {
      const res = await apiFetchJson<LeadDetail>(
        `/api/admin/leads/${id}?type=${type}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'contacted',
            action_note: contactChannel,
          }),
        },
      );
      setLead(res.lead);
      setHistory(res.history || []);
      setSaveSuccess(
        t('adminLeadDetail.toastContactRecorded', { channel: CHANNEL_LABEL[contactChannel] }),
      );
      setTimeout(() => setSaveSuccess(null), 2500);
    } catch (err) {
      setLoadError(
        err instanceof ApiError ? err.message : t('adminLeadDetail.errorFailedRecordContact'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openEmailModal = () => {
    setEmailError(null);
    setEmailTemplateId(templates[0]?.id || '');
    setEmailOverrideSubject('');
    setEmailOverrideHtml('');
    setEmailOverrideText('');
    setEmailSendTest(false);
    setEmailModalOpen(true);
  };

  // WABPO WhatsApp — phase 45a
  // Fetch the approved-template list once on mount; the form just
  // opens against the cached list. Re-fetch on reload.
  useEffect(() => {
    fetch('/api/admin/wabpo/templates')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) {
          setWabpoConfigured(false);
          return;
        }
        setWabpoConfigured(Boolean(data.configured));
        setWabpoTemplates(Array.isArray(data.templates) ? data.templates : []);
      })
      .catch(() => setWabpoConfigured(false));
  }, []);

  const openWhatsappModal = () => {
    setWabpoSendError(null);
    setWabpoSelectedTemplateId(wabpoTemplates[0]?.id || '');
    setWabpoVariables({});
    setWabpoOverrideNumber('');
    setWabpoModalOpen(true);
  };

  const sendWhatsapp = async () => {
    if (!wabpoSelectedTemplateId) {
      setWabpoSendError(t('adminLeadDetail.wabpoNoTemplates'));
      return;
    }
    if (!lead) return;
    setWabpoSending(true);
    setWabpoSendError(null);
    try {
      const res = await fetch(`/api/admin/leads/${id}/send-whatsapp?type=${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: wabpoSelectedTemplateId,
          variables: wabpoVariables,
          ...(wabpoOverrideNumber ? { recipientNumber: wabpoOverrideNumber } : {}),
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setWabpoSendError(
          (json && (json.error as string)) ||
            `${res.status} ${res.statusText || 'send failed'}`,
        );
        return;
      }
      setSaveSuccess(
        t('adminLeadDetail.wabpoSentToast', {
          messageId: (json && (json.messageId as string)) || '—',
        }),
      );
      setTimeout(() => setSaveSuccess(null), 3500);
      setWabpoModalOpen(false);
      // Refresh history so the new lead_history row appears
      void load();
    } catch (err) {
      setWabpoSendError(err instanceof Error ? err.message : t('adminLeadDetail.wabpoSendingErr'));
    } finally {
      setWabpoSending(false);
    }
  };
  const sendEmail = async () => {
    if (!emailTemplateId && !emailOverrideSubject) {
      setEmailError(t('adminLeadDetail.emailSendValidationError'));
      return;
    }
    if (!lead) return;
    setEmailSending(true);
    setEmailError(null);
    try {
      const body: Record<string, unknown> = {
        send_test: emailSendTest,
        variables: {
          firstName:
            pickString(lead, ['name'])?.split(' ')[0] ||
            pickString(lead, ['first_name']) ||
            'there',
          country: pickString(lead, ['country']) || '',
          intendedMajor:
            pickString(lead, ['intended_major']) ||
            pickString(lead, ['interested_program']) ||
            '',
        },
      };
      if (emailTemplateId) {
        body.template_id = emailTemplateId;
      } else {
        body.subject = emailOverrideSubject;
        body.body_html = emailOverrideHtml;
        body.body_text = emailOverrideText;
      }
      const res = await apiFetchJson<{ rendered: { subject: string } }>(
        `/api/admin/leads/${id}/send-email?type=${type}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      setSaveSuccess(
        emailSendTest
          ? t('adminLeadDetail.toastTestSent', { subject: res.rendered.subject })
          : t('adminLeadDetail.toastEmailSent', { subject: res.rendered.subject }),
      );
      setTimeout(() => setSaveSuccess(null), 3000);
      setEmailModalOpen(false);
      load();
    } catch (err) {
      setEmailError(err instanceof ApiError ? err.message : t('adminLeadDetail.emailSendFailed'));
    } finally {
      setEmailSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="md" className="text-[#1B2A4A]" />
      </div>
    );
  }

  if (loadError && !lead) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/admin/leads')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t('adminLeadDetail.backToLeads')}
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  const status = String(lead.status || '');
  const statusColor = STATUS_COLOR[status] || 'bg-gray-100 text-gray-800';
  const allowedStatuses = STATUS_WHITELIST[type];
  const displayName = pickString(lead, ['name']) ||
    (type === 'assessment'
      ? `${pickString(lead, ['first_name']) || ''} ${pickString(lead, ['last_name']) || ''}`.trim()
      : (() => {
          const email = pickString(lead, ['email']);
          return email ? email.split('@')[0] : '(no name)';
        })());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('adminLeads.title')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{displayName}</h1>
            <p className="text-sm text-gray-500">
              {type === 'contact' && t('adminLeadDetail.typeContact')}
              {type === 'chat' && t('adminLeadDetail.typeChat')}
              {type === 'assessment' && t('adminLeadDetail.typeAssessment')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColor}>{status}</Badge>
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{saveSuccess}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: contact + form fields */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('adminLeadDetail.contactInfoTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {pickString(lead, ['email']) && (
                <a
                  href={`mailto:${pickString(lead, ['email'])}`}
                  className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                >
                  <Mail className="h-4 w-4" />
                  {pickString(lead, ['email'])}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {pickString(lead, ['phone']) && (
                <a
                  href={`tel:${pickString(lead, ['phone'])}`}
                  className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                >
                  <Phone className="h-4 w-4" />
                  {pickString(lead, ['phone'])}
                </a>
              )}
              {pickString(lead, ['whatsapp']) && (
                <a
                  href={`https://wa.me/${String(pickString(lead, ['whatsapp'])).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#1B2A4A] hover:underline"
                >
                  <MessageCircle className="h-4 w-4" />
                  {pickString(lead, ['whatsapp'])} (WhatsApp)
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {pickString(lead, ['country']) && (
                <div className="flex items-center gap-2 text-gray-700">
                  <Globe className="h-4 w-4" />
                  {pickString(lead, ['country'])}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lead body content (program / subject / message) */}
          {(pickString(lead, ['interested_program']) ||
            pickString(lead, ['interested_degree']) ||
            pickString(lead, ['intended_major']) ||
            pickString(lead, ['current_education']) ||
            pickString(lead, ['subject']) ||
            pickString(lead, ['message'])) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{t('adminLeadDetail.cardLeadDetails')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {pickString(lead, ['interested_program']) && (
                  <div>
                    <span className="font-medium text-gray-600">{t('adminLeadDetail.fieldInterestedProgram')}</span>{' '}
                    {pickString(lead, ['interested_program'])}
                  </div>
                )}
                {pickString(lead, ['interested_degree']) && (
                  <div>
                    <span className="font-medium text-gray-600">{t('adminLeadDetail.fieldDegree')}</span>{' '}
                    {pickString(lead, ['interested_degree'])}
                  </div>
                )}
                {pickString(lead, ['intended_major']) && (
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-600">{t('adminLeadDetail.fieldIntendedMajor')}</span>{' '}
                      {pickString(lead, ['intended_major'])}
                    </div>
                  </div>
                )}
                {pickString(lead, ['current_education']) && (
                  <div>
                    <span className="font-medium text-gray-600">{t('adminLeadDetail.fieldCurrentEducation')}</span>{' '}
                    {pickString(lead, ['current_education'])}
                  </div>
                )}
                {pickString(lead, ['subject']) && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-600">{t('adminLeadDetail.fieldSubject')}</span>{' '}
                      {pickString(lead, ['subject'])}
                    </div>
                  </div>
                )}
                {pickString(lead, ['message']) && (
                  <div className="border-t pt-3">
                    <p className="font-medium text-gray-600 mb-1">{t('adminLeadDetail.fieldMessage')}</p>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {pickString(lead, ['message'])}
                    </p>
                  </div>
                )}
                {pickString(lead, ['conversation_context']) && (
                  <details className="border-t pt-3">
                    <summary className="text-sm text-gray-600 cursor-pointer">
                      {t('adminLeadDetail.chatContextLabel')}
                    </summary>
                    <pre className="mt-2 text-xs text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {JSON.stringify(
                        safeJsonParse(pickString(lead, ['conversation_context']) || '[]'),
                        null,
                        2,
                      )}
                    </pre>
                  </details>
                )}
              </CardContent>
            </Card>
          )}

          {/* Edit form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('adminLeadDetail.workflowTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t('adminLeadDetail.labelStatus')}
                </label>
                <Select value={statusVal} onValueChange={setStatusVal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allowedStatuses.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t('adminLeadDetail.labelAssignee')}
                </label>
                <Select value={assigneeVal} onValueChange={setAssigneeVal}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">{t('adminLeads.filterUnassigned')}</SelectItem>
                    {team.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.display_name} ({m.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t('adminLeadDetail.labelNotes')}
                </label>
                <Textarea
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  rows={5}
                  placeholder={t('adminLeadDetail.notesPlaceholder')}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => save()}
                  disabled={isSaving}
                  className="bg-[#1B2A4A] hover:bg-[#152033]"
                >
                  {isSaving ? <Spinner size="xs" /> : <Save className="h-4 w-4 mr-2" />}
                  {t('adminLeadDetail.saveChanges')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: meta + contact action + history */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('adminLeadDetail.recordContactTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-700 block mb-1">{t('adminLeadDetail.labelChannel')}</label>
                <Select value={contactChannel} onValueChange={setContactChannel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">{CHANNEL_LABEL.whatsapp}</SelectItem>
                    <SelectItem value="email">{CHANNEL_LABEL.email}</SelectItem>
                    <SelectItem value="phone">{CHANNEL_LABEL.phone}</SelectItem>
                    <SelectItem value="sms">{CHANNEL_LABEL.sms}</SelectItem>
                    <SelectItem value="other">{CHANNEL_LABEL.other}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={recordContact}
                disabled={isSaving}
                variant="outline"
                className="w-full"
              >
                <PhoneCall className="h-4 w-4 mr-2" />
                {t('adminLeadDetail.logContactAttempt')}
              </Button>
              {Number(lead.contact_attempts || 0) > 0 && (
                <p className="text-xs text-gray-500">
                  {t('adminLeadDetail.contactAttempts', { count: Number(lead.contact_attempts) })}
                  {lead.last_contacted_at
                    ? ` · ${t('adminLeadDetail.contactLastOn', {
                        date: new Date(String(lead.last_contacted_at)).toLocaleDateString(),
                      })}`
                    : null}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('adminLeadDetail.sendEmailTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">{t('adminLeadDetail.sendEmailBlurb')}</p>
              <Button
                onClick={openEmailModal}
                variant="outline"
                className="w-full"
                disabled={!pickString(lead, ['email'])}
              >
                <Send className="h-4 w-4 mr-2" />
                {pickString(lead, ['email']) ? t('adminLeadDetail.composeEmail') : t('adminLeadDetail.noEmailOnFile')}
              </Button>
            </CardContent>
          </Card>

          {/* WABPO WhatsApp send — phase 45a */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('adminLeadDetail.sendWhatsappCardTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">{t('adminLeadDetail.sendWhatsappCardBlurb')}</p>
              {wabpoConfigured === false ? (
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                  title={t('adminLeadDetail.wabpoNotConfiguredHint')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('adminLeadDetail.wabpoNotConfigured')}
                </Button>
              ) : wabpoConfigured === null ? (
                <Button variant="outline" className="w-full" disabled>
                  <Spinner size="xs" />
                </Button>
              ) : (
                <Button
                  onClick={openWhatsappModal}
                  variant="outline"
                  className="w-full"
                  disabled={!pickString(lead, ['phone']) && !pickString(lead, ['whatsapp'])}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {pickString(lead, ['phone']) || pickString(lead, ['whatsapp'])
                    ? t('adminLeadDetail.composeWhatsapp')
                    : t('adminLeadDetail.noWhatsappOnFile')}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> {t('adminLeadDetail.timelineTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">{t('adminLeadDetail.historyEmpty')}</p>
              ) : (
                <ul className="space-y-3">
                  {history.map((h) => (
                    <li key={h.id} className="flex gap-3 text-sm">
                      <span className="flex-shrink-0 w-7 h-7 bg-[#1B2A4A] text-white rounded-full flex items-center justify-center text-xs">
                        {ACTION_ICON[h.action] || '·'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#1B2A4A]">
                          {ACTION_LABEL[h.action] || h.action}
                        </p>
                        {(h.from_value || h.to_value) && (
                          <p className="text-xs text-gray-600">
                            {h.from_value && <span className="line-through">{h.from_value}</span>}
                            {h.from_value && h.to_value && ' → '}
                            {h.to_value && <span>{h.to_value}</span>}
                          </p>
                        )}
                        {h.note && (
                          <p className="text-xs text-gray-500">via {h.note}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(h.created_at).toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Meta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t('adminLeadDetail.metaTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-gray-600">
              <div>
                <span className="font-medium">{t('adminLeadDetail.metaCreated')}</span>{' '}
                {lead.created_at
                  ? new Date(String(lead.created_at)).toLocaleString()
                  : '—'}
              </div>
              {lead.updated_at ? (
                <div>
                  <span className="font-medium">{t('adminLeadDetail.metaUpdated')}</span>{' '}
                  {new Date(String(lead.updated_at)).toLocaleString()}
                </div>
              ) : null}
              {lead.source_page ? (
                <div>
                  <span className="font-medium">{t('adminLeadDetail.metaSourcePage')}</span> {String(lead.source_page)}
                </div>
              ) : null}
              {lead.referrer ? (
                <div>
                  <span className="font-medium">{t('adminLeadDetail.metaReferrer')}</span> {String(lead.referrer)}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email modal (Phase 2.6) */}
      {emailModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{t('adminLeadDetail.emailModalTitle', { name: displayName })}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {t('adminLeadDetail.emailToLabel', { email: pickString(lead, ['email']) ?? '—' })}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEmailModalOpen(false)}
                disabled={emailSending}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{emailError}</span>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t('adminLeadDetail.emailTemplateLabel')}
                </label>
                <Select
                  value={emailTemplateId}
                  onValueChange={setEmailTemplateId}
                  disabled={emailSending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('adminLeadDetail.emailTemplatePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 && (
                      <SelectItem value="__none__" disabled>
                        {t('adminLeadDetail.emailNoTemplates')}
                      </SelectItem>
                    )}
                    {templates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.name} <span className="text-gray-400 ml-1">— {tpl.slug}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  {t('adminLeadDetail.emailVariablesIntro')}
                  <code className="bg-gray-100 px-1">{t('adminLeadDetail.emailVarFirstName')}</code>,{' '}
                  <code className="bg-gray-100 px-1">{t('adminLeadDetail.emailVarCountry')}</code>,{' '}
                  <code className="bg-gray-100 px-1">{t('adminLeadDetail.emailVarIntendedMajor')}</code>{' '}
                  {t('adminLeadDetail.emailVarsBlurb')}
                </p>
              </div>

              <details className="border border-gray-200 p-3">
                <summary className="text-sm text-gray-700 cursor-pointer">
                  {t('adminLeadDetail.emailCustomOverride')}
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">{t('adminLeadDetail.labelSubjectOverride')}</label>
                    <Input
                      value={emailOverrideSubject}
                      onChange={(e) => setEmailOverrideSubject(e.target.value)}
                      placeholder={t('adminLeadDetail.subjectOverridePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">{t('adminLeadDetail.labelBodyHtml')}</label>
                    <textarea
                      value={emailOverrideHtml}
                      onChange={(e) => setEmailOverrideHtml(e.target.value)}
                      rows={6}
                      className="w-full border border-gray-300 px-2 py-1 text-xs font-mono"
                      placeholder={t('adminLeadDetail.bodyHtmlPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">{t('adminLeadDetail.labelBodyText')}</label>
                    <textarea
                      value={emailOverrideText}
                      onChange={(e) => setEmailOverrideText(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 px-2 py-1 text-xs font-mono"
                      placeholder={t('adminLeadDetail.bodyTextPlaceholder')}
                    />
                  </div>
                </div>
              </details>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={emailSendTest}
                  onChange={(e) => setEmailSendTest(e.target.checked)}
                />
                <span>
                  <span className="font-medium">{t('adminLeadDetail.labelSendTest')}</span>
                  <span className="block text-xs text-gray-500">
                    {t('adminLeadDetail.sendTestHint')}
                  </span>
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setEmailModalOpen(false)}
                  disabled={emailSending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={sendEmail}
                  disabled={emailSending || (!emailTemplateId && !emailOverrideSubject)}
                  className="bg-[#1B2A4A] hover:bg-[#152033]"
                >
                  {emailSending ? <Spinner size="xs" /> : <Send className="h-4 w-4 mr-2" />}
                  {emailSendTest ? t('adminLeadDetail.sendTest') : t('adminLeadDetail.sendEmail')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* WABPO WhatsApp send modal — phase 45a */}
      {wabpoModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div>
                <CardTitle>{t('adminLeadDetail.sendWhatsappCardTitle')}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  {t('adminLeadDetail.emailToLabel', {
                    email:
                      pickString(lead, ['phone']) || pickString(lead, ['whatsapp']) || '—',
                  }).replace('To:', 'To phone:')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWabpoModalOpen(false)}
                disabled={wabpoSending}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {wabpoSendError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 text-sm flex items-start gap-2">
                  <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>{wabpoSendError}</span>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t('adminLeadDetail.wabpoTemplatePicker')}
                </label>
                <Select
                  value={wabpoSelectedTemplateId}
                  onValueChange={setWabpoSelectedTemplateId}
                  disabled={wabpoSending || wabpoTemplates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('adminLeadDetail.emailTemplatePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {wabpoTemplates.length === 0 && (
                      <SelectItem value="__none__" disabled>
                        {t('adminLeadDetail.wabpoNoTemplates')}
                      </SelectItem>
                    )}
                    {wabpoTemplates.map((tpl) => (
                      <SelectItem key={tpl.id} value={tpl.id}>
                        {tpl.templateName}{' '}
                        <span className="text-gray-400 ml-1">
                          — {tpl.templateType} / {tpl.category}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {wabpoSelectedTemplateId && (() => {
                  const tpl = wabpoTemplates.find((t) => t.id === wabpoSelectedTemplateId);
                  if (!tpl || !tpl.variableDefinitions?.length) return null;
                  return (
                    <p className="text-xs text-gray-500 mt-1">
                      {t('adminLeadDetail.wabpoTemplateVars')}:{' '}
                      {tpl.variableDefinitions
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((v) => v.placeholder)
                        .join(', ')}
                    </p>
                  );
                })()}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  {t('adminLeadDetail.wabpoOverrideNumber')}
                </label>
                <Input
                  value={wabpoOverrideNumber}
                  onChange={(e) => setWabpoOverrideNumber(e.target.value)}
                  placeholder={pickString(lead, ['phone']) || '+86 138 0000 0000'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('adminLeadDetail.wabpoOverrideNumberHint')}
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setWabpoModalOpen(false)}
                  disabled={wabpoSending}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={sendWhatsapp}
                  disabled={wabpoSending || !wabpoSelectedTemplateId}
                  className="bg-[#9B1B30] hover:bg-[#7A1526]"
                >
                  {wabpoSending ? <Spinner size="xs" /> : <MessageCircle className="h-4 w-4 mr-2" />}
                  {wabpoSending
                    ? t('adminLeadDetail.wabpoSending')
                    : t('adminLeadDetail.composeWhatsapp')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function pickString(row: Record<string, unknown>, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return null;
}

function safeJsonParse(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}
