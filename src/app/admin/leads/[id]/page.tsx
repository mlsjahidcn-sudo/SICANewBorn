'use client';

/**
 * Admin: lead detail page — Phase 2.1 lead workflow.
 *
 * Shows full lead info, allows status / notes / assignee edits,
 * records a "contacted" action, and shows the full timeline
 * (lead_history rows, newest first).
 *
 * URL: /admin/leads/[id]?type=contact|chat|assessment
 */
import React, { useState, useEffect, useCallback } from 'react';
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
  User as UserIcon,
  History,
  PhoneCall,
  Send,
  X,
} from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const STATUS_WHITELIST: Record<LeadType, string[]> = {
  contact: ['New', 'In Progress', 'Resolved', 'Spam'],
  chat: ['New', 'Contacted', 'Qualified', 'Unqualified'],
  assessment: ['Pending', 'Reviewed', 'Contacted', 'Accepted', 'Rejected'],
};

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

export default function LeadDetailPage() {
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
      // Only show active oneoff templates in the picker
      setTemplates((tplRes.templates || []).filter((t) => t.category === 'oneoff'));
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load lead');
    } finally {
      setIsLoading(false);
    }
  }, [id, type]);

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
      setSaveSuccess('Saved');
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Save failed');
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
      setSaveSuccess(`Contact recorded via ${contactChannel}`);
      setTimeout(() => setSaveSuccess(null), 2500);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to record contact');
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

  const sendEmail = async () => {
    if (!emailTemplateId && !emailOverrideSubject) {
      setEmailError('Pick a template or write a custom subject + body');
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
          ? `Test sent: "${res.rendered.subject}"`
          : `Email sent: "${res.rendered.subject}"`,
      );
      setTimeout(() => setSaveSuccess(null), 3000);
      setEmailModalOpen(false);
      // Refresh history to show the new lead_history row
      load();
    } catch (err) {
      setEmailError(err instanceof ApiError ? err.message : 'Send failed');
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
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to leads
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
      : '(no name)');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Leads
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-[#1B2A4A]">{displayName}</h1>
            <p className="text-sm text-gray-500">
              {type === 'contact' && 'Contact form submission'}
              {type === 'chat' && 'Chat assistant lead'}
              {type === 'assessment' && 'Public assessment submission'}
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
              <CardTitle className="text-base">Contact info</CardTitle>
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
                <CardTitle className="text-base">Lead details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {pickString(lead, ['interested_program']) && (
                  <div>
                    <span className="font-medium text-gray-600">Interested program:</span>{' '}
                    {pickString(lead, ['interested_program'])}
                  </div>
                )}
                {pickString(lead, ['interested_degree']) && (
                  <div>
                    <span className="font-medium text-gray-600">Degree:</span>{' '}
                    {pickString(lead, ['interested_degree'])}
                  </div>
                )}
                {pickString(lead, ['intended_major']) && (
                  <div className="flex items-start gap-2">
                    <GraduationCap className="h-4 w-4 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-600">Intended major:</span>{' '}
                      {pickString(lead, ['intended_major'])}
                    </div>
                  </div>
                )}
                {pickString(lead, ['current_education']) && (
                  <div>
                    <span className="font-medium text-gray-600">Current education:</span>{' '}
                    {pickString(lead, ['current_education'])}
                  </div>
                )}
                {pickString(lead, ['subject']) && (
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 mt-0.5" />
                    <div>
                      <span className="font-medium text-gray-600">Subject:</span>{' '}
                      {pickString(lead, ['subject'])}
                    </div>
                  </div>
                )}
                {pickString(lead, ['message']) && (
                  <div className="border-t pt-3">
                    <p className="font-medium text-gray-600 mb-1">Message</p>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {pickString(lead, ['message'])}
                    </p>
                  </div>
                )}
                {pickString(lead, ['conversation_context']) && (
                  <details className="border-t pt-3">
                    <summary className="text-sm text-gray-600 cursor-pointer">
                      Chat conversation context
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
              <CardTitle className="text-base">Workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Status</label>
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
                  Assignee
                </label>
                <Select value={assigneeVal} onValueChange={setAssigneeVal}>
                  <SelectTrigger>
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {team.map((m) => (
                      <SelectItem key={m.user_id} value={m.user_id}>
                        {m.display_name} ({m.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                <Textarea
                  value={notesVal}
                  onChange={(e) => setNotesVal(e.target.value)}
                  rows={5}
                  placeholder="Internal notes about this lead..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => save()}
                  disabled={isSaving}
                  className="bg-[#1B2A4A] hover:bg-[#152033]"
                >
                  {isSaving ? <Spinner size="xs" /> : <Save className="h-4 w-4 mr-2" />}
                  Save changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: meta + contact action + history */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Record contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-gray-700 block mb-1">Channel</label>
                <Select value={contactChannel} onValueChange={setContactChannel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone call</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                Log contact attempt
              </Button>
              {Number(lead.contact_attempts || 0) > 0 && (
                <p className="text-xs text-gray-500">
                  {String(lead.contact_attempts)} previous attempt
                  {Number(lead.contact_attempts) === 1 ? '' : 's'}
                  {lead.last_contacted_at
                    ? ` · last ${new Date(String(lead.last_contacted_at)).toLocaleDateString()}`
                    : null}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Send email</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500 mb-3">
                Pick a one-off template or write a custom message. The lead's first name,
                country, and intended program are auto-injected as variables.
              </p>
              <Button
                onClick={openEmailModal}
                variant="outline"
                className="w-full"
                disabled={!pickString(lead, ['email'])}
              >
                <Send className="h-4 w-4 mr-2" />
                {pickString(lead, ['email']) ? 'Compose email' : 'No email on file'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" /> Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">No history yet.</p>
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
              <CardTitle className="text-base">Meta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs text-gray-600">
              <div>
                <span className="font-medium">Created:</span>{' '}
                {lead.created_at
                  ? new Date(String(lead.created_at)).toLocaleString()
                  : '—'}
              </div>
              {lead.updated_at
                ? (
                <div>
                  <span className="font-medium">Updated:</span>{' '}
                  {new Date(String(lead.updated_at)).toLocaleString()}
                </div>
                  )
                : null}
              {lead.source_page
                ? (
                <div>
                  <span className="font-medium">Source page:</span> {String(lead.source_page)}
                </div>
                  )
                : null}
              {lead.referrer
                ? (
                <div>
                  <span className="font-medium">Referrer:</span> {String(lead.referrer)}
                </div>
                  )
                : null}
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
                <CardTitle>Send email to {displayName}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  To: {pickString(lead, ['email']) || '—'}
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
                  Template
                </label>
                <Select
                  value={emailTemplateId}
                  onValueChange={setEmailTemplateId}
                  disabled={emailSending}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a one-off template…" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.length === 0 && (
                      <SelectItem value="__none__" disabled>
                        No one-off templates yet — create one in /admin/emails
                      </SelectItem>
                    )}
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} <span className="text-gray-400 ml-1">— {t.slug}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Variables: <code className="bg-gray-100 px-1">firstName</code>,{' '}
                  <code className="bg-gray-100 px-1">country</code>,{' '}
                  <code className="bg-gray-100 px-1">intendedMajor</code>{' '}
                  (auto-filled from the lead row)
                </p>
              </div>

              <details className="border border-gray-200 p-3">
                <summary className="text-sm text-gray-700 cursor-pointer">
                  Custom override (subject + body)
                </summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Subject</label>
                    <Input
                      value={emailOverrideSubject}
                      onChange={(e) => setEmailOverrideSubject(e.target.value)}
                      placeholder="Leave blank to use the template subject"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Body (HTML)</label>
                    <textarea
                      value={emailOverrideHtml}
                      onChange={(e) => setEmailOverrideHtml(e.target.value)}
                      rows={6}
                      className="w-full border border-gray-300 px-2 py-1 text-xs font-mono"
                      placeholder="<p>Hi {{firstName}}, ...</p>"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Body (text)</label>
                    <textarea
                      value={emailOverrideText}
                      onChange={(e) => setEmailOverrideText(e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 px-2 py-1 text-xs font-mono"
                      placeholder="Hi {{firstName}}, ..."
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
                  <span className="font-medium">Send to me (test)</span>
                  <span className="block text-xs text-gray-500">
                    Redirects to your admin email instead of the lead.
                  </span>
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  onClick={() => setEmailModalOpen(false)}
                  disabled={emailSending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={sendEmail}
                  disabled={emailSending || (!emailTemplateId && !emailOverrideSubject)}
                  className="bg-[#1B2A4A] hover:bg-[#152033]"
                >
                  {emailSending ? <Spinner size="xs" /> : <Send className="h-4 w-4 mr-2" />}
                  {emailSendTest ? 'Send test' : 'Send email'}
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
