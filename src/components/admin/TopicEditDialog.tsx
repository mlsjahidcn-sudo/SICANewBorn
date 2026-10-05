'use client';

import { useEffect, useState } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import { AlertCircle, Save } from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

export interface TopicEditValue {
  id: string;
  sessionId: string;
  intake: 'march_2027' | 'september_2027' | 'csc' | 'other';
  degree: 'chinese_language' | 'foundation' | 'bachelor' | 'master' | 'phd' | 'csc';
  titleEn: string;
  titleZh: string;
  bodyEn: string;
  bodyZh: string;
  displayOrder: number;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Required when `initial` is null (create mode). */
  sessionId: string | null;
  initial: TopicEditValue | null;
  onSaved: (next: TopicEditValue) => void;
}

/**
 * Phase 140: inline edit dialog for a single webinar topic.
 * Used by the Topics tab in /admin/webinar-signups. Creates
 * or edits one row in `webinar_topics`.
 *
 * The 4 enum fields (intake / degree on each locale) keep
 * DB-enum spellings so PostgREST can't trip on a stray
 * capital. i18n labels drive the visible text via the
 * `adminWebinars.intake.*` + `adminWebinars.degree.*` keys
 * added in this phase.
 */
export function TopicEditDialog({ open, onOpenChange, sessionId, initial, onSaved }: Props) {
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [form, setForm] = useState(() => blankForm(initial));

  useEffect(() => {
    if (open) {
      setForm(blankForm(initial));
      setSaveError(null);
    }
  }, [open, initial]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const validate = (): boolean => {
    if (!form.titleEn.trim() || !form.titleZh.trim() || !form.bodyEn.trim() || !form.bodyZh.trim()) {
      setSaveError(t('adminWebinars.errorSaveTopic'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!initial && !sessionId) {
      setSaveError(t('adminWebinars.errorSaveTopic'));
      return;
    }
    setIsSaving(true);
    setSaveError(null);

    const payload = {
      intake: form.intake,
      degree: form.degree,
      titleEn: form.titleEn.trim(),
      titleZh: form.titleZh.trim(),
      bodyEn: form.bodyEn.trim(),
      bodyZh: form.bodyZh.trim(),
      displayOrder: Number(form.displayOrder) || 0,
    };

    try {
      const result = initial
        ? await apiFetchJson<{ id: string }>(`/api/admin/webinar-topics/${initial.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await apiFetchJson<{ id: string }>(
            `/api/admin/webinar-sessions/${sessionId}/topics`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            },
          );
      onSaved({
        ...(initial ?? { sessionId: sessionId ?? '' }),
        ...payload,
        id: result.id,
      } as TopicEditValue);
      onOpenChange(false);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('adminWebinars.errorSaveTopic'));
    } finally {
      setIsSaving(false);
    }
  };

  const INTAKE_OPTIONS: Array<{ value: TopicEditValue['intake']; key: string }> = [
    { value: 'march_2027', key: 'adminWebinars.intake.march_2027' },
    { value: 'september_2027', key: 'adminWebinars.intake.september_2027' },
    { value: 'csc', key: 'adminWebinars.intake.csc' },
    { value: 'other', key: 'adminWebinars.intake.other' },
  ];
  const DEGREE_OPTIONS: Array<{ value: TopicEditValue['degree']; key: string }> = [
    { value: 'chinese_language', key: 'adminWebinars.degree.chinese_language' },
    { value: 'foundation', key: 'adminWebinars.degree.foundation' },
    { value: 'bachelor', key: 'adminWebinars.degree.bachelor' },
    { value: 'master', key: 'adminWebinars.degree.master' },
    { value: 'phd', key: 'adminWebinars.degree.phd' },
    { value: 'csc', key: 'adminWebinars.degree.csc' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle>
            {initial ? t('adminWebinars.editTopic') : t('adminWebinars.addTopic')}
          </DialogTitle>
          <DialogDescription>{t('adminWebinars.topicsSubtitle')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('adminWebinars.topicFieldIntake')} error={null}>
              <select
                value={form.intake}
                onChange={(e) => update('intake', e.target.value as TopicEditValue['intake'])}
                className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              >
                {INTAKE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.key)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('adminWebinars.topicFieldDegree')} error={null}>
              <select
                value={form.degree}
                onChange={(e) => update('degree', e.target.value as TopicEditValue['degree'])}
                className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              >
                {DEGREE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.key)}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('adminWebinars.topicFieldTitleEn')} error={null}>
              <Input
                value={form.titleEn}
                onChange={(e) => update('titleEn', e.target.value)}
              />
            </FormField>
            <FormField label={t('adminWebinars.topicFieldTitleZh')} error={null}>
              <Input
                value={form.titleZh}
                onChange={(e) => update('titleZh', e.target.value)}
              />
            </FormField>
          </div>

          <FormField label={t('adminWebinars.topicFieldBodyEn')} error={null}>
            <textarea
              rows={3}
              value={form.bodyEn}
              onChange={(e) => update('bodyEn', e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            />
          </FormField>
          <FormField label={t('adminWebinars.topicFieldBodyZh')} error={null}>
            <textarea
              rows={3}
              value={form.bodyZh}
              onChange={(e) => update('bodyZh', e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            />
          </FormField>

          <FormField label={t('adminWebinars.topicFieldDisplayOrder')} error={null}>
            <Input
              type="number"
              value={form.displayOrder}
              onChange={(e) => update('displayOrder', parseInt(e.target.value || '0', 10))}
            />
          </FormField>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-none"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-[#9B1B30] hover:bg-[#7A1526] rounded-none"
            >
              {isSaving ? <Spinner size="xs" /> : <Save className="h-4 w-4 mr-1" />}
              {t('adminWebinars.topicSaved').replace('✓ ', '')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function blankForm(initial: TopicEditValue | null) {
  return {
    intake: initial?.intake ?? 'march_2027',
    degree: initial?.degree ?? 'chinese_language',
    titleEn: initial?.titleEn ?? '',
    titleZh: initial?.titleZh ?? '',
    bodyEn: initial?.bodyEn ?? '',
    bodyZh: initial?.bodyZh ?? '',
    displayOrder: initial?.displayOrder ?? 0,
  };
}

interface FormFieldProps {
  label: string;
  error: string | null | undefined;
  children: React.ReactNode;
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
