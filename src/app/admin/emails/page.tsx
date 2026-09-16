'use client';

/**
 * Admin: Email template editor — Phase 2.5
 *
 * Three-column layout:
 *   - Left: list of templates, filtered by category
 *   - Middle: editor for the selected template (subject, body_text,
 *             bilingual subject_zh / body_text_zh, language discriminator,
 *             variables, schedule fields)
 *   - Right: live preview rendered with sample variables
 *
 * Phase 84: text-only — body_html was dropped. The editor now has a
 * "Chinese variant" block (subject_zh + body_text_zh) under the
 * English body, plus a small language discriminator Select.
 * The preview pane renders plain text via <pre> (no more
 * dangerouslySetInnerHTML).
 *
 * The "Send test" button renders + sends the template to the
 * admin's email (ADMIN_EMAIL) so they can sanity-check in their
 * inbox. Production sends happen via the lead-detail "Send email"
 * button (Phase 2.6).
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Plus,
  Save,
  Trash2,
  Send,
  AlertCircle,
  Mail,
  CheckCircle,
  Eye,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/i18n';

type EmailLanguage = 'en' | 'zh';

interface Template {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: 'drip' | 'status' | 'oneoff';
  subject: string;
  subject_zh: string | null;
  body_text: string;
  body_text_zh: string | null;
  language: EmailLanguage;
  variables: string[];
  is_active: boolean;
  step_index: number | null;
  delay_ms: number | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

const CATEGORIES: { value: Template['category']; label: string; description: string }[] = [
  { value: 'drip', label: 'Drip (4-step)', description: 'Sent automatically after a new lead' },
  { value: 'status', label: 'Status', description: 'Sent when an application status changes' },
  { value: 'oneoff', label: 'One-off', description: 'Ad-hoc sends by an admin' },
];

const CATEGORY_COLOR: Record<Template['category'], string> = {
  drip: 'bg-[#1B2A4A] text-white',
  status: 'bg-[#9B1B30] text-white',
  oneoff: 'bg-[#D4A853] text-[#1B2A4A]',
};

function delayLabel(ms: number | null, t: (k: string, p?: Record<string, string | number>) => string): string {
  if (ms == null) return '';
  if (ms === 0) return t('adminEmails.delayImmediately');
  if (ms < 86400000) return t('adminEmails.delayHours', { hours: ms / 3600000 });
  return t('adminEmails.delayDays', { days: ms / 86400000 });
}

export default function EmailTemplatesPage() {
  const { t } = useI18n();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<'all' | Template['category']>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Editable form fields (the editor is bound to local state, not the
  // template row directly, so the user can type without re-renders
  // blowing away their cursor position).
  const [form, setForm] = useState<Partial<Template>>({});
  const [previewSubject, setPreviewSubject] = useState<string>('');
  const [previewText, setPreviewText] = useState<string>('');
  const [isRendering, setIsRendering] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.set('category', categoryFilter);
      const res = await apiFetchJson<{ templates: Template[] }>(
        `/api/admin/emails/templates${params.toString() ? `?${params}` : ''}`,
      );
      setTemplates(res.templates || []);
    } catch (err) {
      setLoadError(err instanceof ApiError ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) || null,
    [templates, selectedId],
  );

  // When the user picks a template, hydrate the form
  useEffect(() => {
    if (selected) {
      setForm({ ...selected });
    } else {
      setForm({});
    }
  }, [selected]);

  const save = async () => {
    if (!selected) return;
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      const updates: Record<string, unknown> = {
        name: form.name,
        description: form.description,
        subject: form.subject,
        subject_zh: form.subject_zh,
        body_text: form.body_text,
        body_text_zh: form.body_text_zh,
        language: form.language,
        variables: form.variables,
        is_active: form.is_active,
      };
      if (selected.category === 'drip') {
        updates.step_index = form.step_index;
        updates.delay_ms = form.delay_ms;
      }
      const res = await apiFetchJson<{ template: Template }>(
        `/api/admin/emails/templates/${selected.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        },
      );
      setTemplates((prev) => prev.map((t) => (t.id === res.template.id ? res.template : t)));
      setSaveSuccess('Saved');
      setTimeout(() => setSaveSuccess(null), 2000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('adminEmails.errorSave'));
    } finally {
      setIsSaving(false);
    }
  };

  const renderPreview = async () => {
    setIsRendering(true);
    setSaveError(null);
    try {
      const res = await apiFetchJson<{ rendered: { subject: string; text: string } }>(
        '/api/admin/emails/templates/preview',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template_id: selected?.id,
            subject: form.subject,
            body_text: form.body_text,
            useSample: true,
          }),
        },
      );
      setPreviewSubject(res.rendered.subject);
      setPreviewText(res.rendered.text);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('adminEmails.errorRender'));
    } finally {
      setIsRendering(false);
    }
  };

  // Auto-render when the selected template changes
  useEffect(() => {
    if (selected) renderPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  const sendTest = async () => {
    if (!selected) return;
    setIsSendingTest(true);
    setSaveError(null);
    try {
      await apiFetchJson(`/api/admin/leads/00000000-0000-0000-0000-000000000000/send-email?type=contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: selected.id,
          send_test: true,
          variables: {
            firstName: 'Test',
            country: 'Ghana',
            intendedMajor: 'Data Science',
            universityName: 'Tsinghua University',
            programName: 'MSc Data Science',
            degree: 'Master',
            intake: 'Fall 2026',
            applicationNumber: 'SICA-2026-0042',
            newStatus: 'Accepted',
            extraNote: 'Sample note',
          },
        }),
      });
      setSaveSuccess(t('adminEmails.testSent'));
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('adminEmails.errorTestSend'));
    } finally {
      setIsSendingTest(false);
    }
  };

  const createTemplate = async (category: Template['category'], slug: string) => {
    setSaveError(null);
    try {
      const res = await apiFetchJson<{ template: Template }>('/api/admin/emails/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: `New ${category} template`,
          description: '',
          category,
          subject: 'Subject line here',
          subject_zh: '中文标题',
          body_text: 'Hi {{firstName}},\n\nBody here.',
          body_text_zh: '你好 {{firstName}}，\n\n正文。',
          language: 'en',
          variables: category === 'drip' ? ['firstName', 'siteUrl', 'unsubToken'] : [],
          is_active: false,
        }),
      });
      setTemplates((prev) => [...prev, res.template]);
      setSelectedId(res.template.id);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('adminEmails.errorCreate'));
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm(t('adminEmails.confirmDelete'))) return;
    setSaveError(null);
    try {
      await apiFetchJson(`/api/admin/emails/templates/${id}`, { method: 'DELETE' });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      if (selectedId === id) setSelectedId(null);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('adminEmails.errorDelete'));
    }
  };

  const filtered = templates.filter((t) => categoryFilter === 'all' || t.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1B2A4A]">{t('adminEmails.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('adminEmails.subtitle')}
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          {CATEGORIES.map((c) => (
            <span key={c.value} className={`px-3 py-1 ${CATEGORY_COLOR[c.value]}`}>
              {c.label} {templates.filter((t) => t.category === c.value).length}
            </span>
          ))}
        </div>
      </div>

      {loadError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{loadError}</span>
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{saveError}</span>
        </div>
      )}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{saveSuccess}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: list */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex gap-2">
            <Select
              value={categoryFilter}
              onValueChange={(v) => setCategoryFilter(v as 'all' | Template['category'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('adminEmails.allCategories')}</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" className="text-[#1B2A4A]" />
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedId(tmpl.id)}
                  className={`w-full text-left p-3 border ${
                    selectedId === tmpl.id
                      ? 'border-[#1B2A4A] bg-[#1B2A4A]/5'
                      : 'border-gray-200 bg-white hover:border-[#9B1B30]/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 font-semibold ${CATEGORY_COLOR[tmpl.category]}`}>
                      {tmpl.category}
                    </span>
                    {!tmpl.is_active && (
                      <span className="text-xs text-gray-500">{t('adminEmails.inactiveBadge')}</span>
                    )}
                  </div>
                  <p className="font-medium text-sm text-[#1B2A4A] truncate">{tmpl.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{tmpl.slug}</p>
                  {tmpl.category === 'drip' && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Clock size={10} />
                      {t('adminEmails.stepInline', { step: tmpl.step_index ?? 0, delay: delayLabel(tmpl.delay_ms, t) })}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="border-t pt-3 space-y-1">
            {CATEGORIES.map((c) => (
              <Button
                key={c.value}
                variant="outline"
                size="sm"
                onClick={() => createTemplate(c.value, `${c.value}.${Date.now().toString(36)}`)}
                className="w-full justify-start"
              >
                <Plus size={14} className="mr-1" />
                {t('adminEmails.newTemplateInline', { category: c.value })}
              </Button>
            ))}
          </div>
        </div>

        {/* Middle: editor */}
        <div className="lg:col-span-5">
          {!selected ? (
            <div className="bg-white border border-gray-200 px-6 py-16 text-center text-gray-500">
              <Mail className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>{t('adminEmails.editorEmpty')}</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Input
                    value={form.name || ''}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="text-lg font-semibold border-0 px-0 focus:ring-0"
                    placeholder={t('adminEmails.placeholderTemplateName')}
                  />
                  <p className="text-xs text-gray-500 font-mono mt-1">{selected.slug}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="flex items-center gap-1.5 text-sm">
                    <input
                      type="checkbox"
                      checked={!!form.is_active}
                      onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    />
                    {t('adminEmails.fieldActive')}
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">{t('adminEmails.fieldSubjectEn')}</label>
                <Input
                  value={form.subject || ''}
                  onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  {t('adminEmails.fieldLanguage')}
                </label>
                <Select
                  value={form.language || 'en'}
                  onValueChange={(v) => setForm((f) => ({ ...f, language: v as EmailLanguage }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('adminEmails.languageEn')}</SelectItem>
                    <SelectItem value="zh">{t('adminEmails.languageZh')}</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('adminEmails.languageHint')}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">{t('adminEmails.fieldDescription')}</label>
                <Input
                  value={form.description || ''}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder={t('adminEmails.placeholderDescription')}
                />
              </div>

              {selected.category === 'drip' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      {t('adminEmails.fieldStepIndex')}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={form.step_index ?? 0}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, step_index: parseInt(e.target.value, 10) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      {t('adminEmails.fieldDelayMs')}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      value={form.delay_ms ?? 0}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, delay_ms: parseInt(e.target.value, 10) || 0 }))
                      }
                    />
                    <p className="text-xs text-gray-500 mt-0.5">{delayLabel(form.delay_ms ?? 0, t)}</p>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  {t('adminEmails.fieldBodyText')}
                  <span className="text-gray-400"> {t('adminEmails.fieldBodyHint')}</span>
                </label>
                <Textarea
                  value={form.body_text || ''}
                  onChange={(e) => setForm((f) => ({ ...f, body_text: e.target.value }))}
                  rows={10}
                  className="font-mono text-xs"
                />
              </div>

              <div className="border-t pt-4 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-[#1B2A4A]">{t('adminEmails.chineseVariant')}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('adminEmails.chineseVariantHint')}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{t('adminEmails.fieldSubjectZh')}</label>
                  <Input
                    value={form.subject_zh || ''}
                    onChange={(e) => setForm((f) => ({ ...f, subject_zh: e.target.value }))}
                    placeholder={t('adminEmails.placeholderSubjectZh')}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{t('adminEmails.fieldBodyZh')}</label>
                  <Textarea
                    value={form.body_text_zh || ''}
                    onChange={(e) => setForm((f) => ({ ...f, body_text_zh: e.target.value }))}
                    rows={8}
                    className="font-mono text-xs"
                    placeholder={t('adminEmails.placeholderBodyZh')}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  {t('adminEmails.fieldVariables')}
                </label>
                <Input
                  value={(form.variables || []).join(', ')}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      variables: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                  placeholder={t('adminEmails.placeholderVariables')}
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button
                  onClick={save}
                  disabled={isSaving}
                  className="bg-[#1B2A4A] hover:bg-[#152033]"
                >
                  {isSaving ? <Spinner size="xs" /> : <Save size={14} className="mr-1" />}
                  Save
                </Button>
                <Button onClick={renderPreview} variant="outline" disabled={isRendering}>
                  {isRendering ? <Spinner size="xs" /> : <Eye size={14} className="mr-1" />}
                  {t('adminEmails.rerender')}
                </Button>
                <Button onClick={sendTest} variant="outline" disabled={isSendingTest}>
                  {isSendingTest ? <Spinner size="xs" /> : <Send size={14} className="mr-1" />}
                  {t('adminEmails.sendTest')}
                </Button>
                <Button
                  onClick={() => deleteTemplate(selected.id)}
                  variant="ghost"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 size={14} className="mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Right: preview */}
        <div className="lg:col-span-4">
          {selected ? (
            <div className="bg-white border border-gray-200 sticky top-6">
              <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-[#1B2A4A] flex items-center gap-2">
                  <Eye size={14} /> Preview
                </h3>
                <Badge className="bg-gray-100 text-gray-700 text-xs">{t('adminEmails.previewSample')}</Badge>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <p className="text-xs text-gray-500 mb-1">Subject</p>
                <p className="text-sm font-medium text-[#1F2937] mb-4 border-b pb-3">
                  {previewSubject || '—'}
                </p>
                <p className="text-xs text-gray-500 mb-1">Body (plain text)</p>
                <pre className="text-xs text-[#1F2937] whitespace-pre-wrap bg-gray-50 p-3 border border-gray-200 font-mono">
                  {previewText || t('adminEmails.previewEmpty')}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-400 text-center py-12">
              <ChevronRight className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              {t('adminEmails.previewPick')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
