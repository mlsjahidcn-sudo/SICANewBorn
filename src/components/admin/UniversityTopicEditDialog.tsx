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

export type UniversityTopicKind = 'program' | 'scholarship' | 'timing' | 'requirement';

export interface UniversityOption {
  id: string;
  name: string;
  nameZh: string;
  slug: string;
}

export interface UniversityTopicEditValue {
  id: string;
  sessionId: string;
  universityId: string;
  universityName?: string;       // display-only — never sent to server
  kind: UniversityTopicKind;
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
  initial: UniversityTopicEditValue | null;
  /** Loaded from /api/admin/webinar-sessions/[id]/universities — passed in by the parent. */
  universities: UniversityOption[];
  onSaved: (next: UniversityTopicEditValue) => void;
}

/**
 * Phase 162: inline edit dialog for a single university-kind
 * webinar topic. Used by the Topics tab in /admin/webinar-signups
 * for the "University topics" sub-section.
 *
 * Distinct from `TopicEditDialog` (Phase 140):
 *   - no intake / degree (those are the agenda-grid taxonomy,
 *     not the university-card taxonomy)
 *   - binds to a specific university (FK)
 *   - kind is one of program | scholarship | timing | requirement
 *     (the 4 sections inside each university card)
 *
 * The closed `kind` enum is validated at both the API and DB
 * CHECK layers (defense in depth — the API also probes for an
 * existing (session_id, university_id, kind) tuple on create
 * and returns 409 if one exists, so staff PATCH the row
 * instead of silently creating a duplicate).
 */
export function UniversityTopicEditDialog({
  open,
  onOpenChange,
  sessionId,
  initial,
  universities,
  onSaved,
}: Props) {
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
    if (
      !form.universityId ||
      !form.titleEn.trim() ||
      !form.titleZh.trim() ||
      !form.bodyEn.trim() ||
      !form.bodyZh.trim()
    ) {
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
      universityId: form.universityId,
      kind: form.kind,
      titleEn: form.titleEn.trim(),
      titleZh: form.titleZh.trim(),
      bodyEn: form.bodyEn.trim(),
      bodyZh: form.bodyZh.trim(),
      displayOrder: Number(form.displayOrder) || 0,
    };

    try {
      const result = initial
        ? await apiFetchJson<{ id: string }>(
            `/api/admin/webinar-university-topics/${initial.id}`,
            {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            },
          )
        : await apiFetchJson<{ id: string }>(
            `/api/admin/webinar-sessions/${sessionId}/university-topics`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            },
          );
      const matched = universities.find((u) => u.id === form.universityId);
      onSaved({
        ...(initial ?? { sessionId: sessionId ?? '', universityId: form.universityId }),
        ...payload,
        id: result.id,
        universityName: matched ? `${matched.name} / ${matched.nameZh}` : initial?.universityName,
      } as UniversityTopicEditValue);
      onOpenChange(false);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : t('adminWebinars.errorSaveTopic'),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const KIND_OPTIONS: Array<{ value: UniversityTopicKind; key: string }> = [
    { value: 'program', key: 'adminWebinars.kind.program' },
    { value: 'scholarship', key: 'adminWebinars.kind.scholarship' },
    { value: 'timing', key: 'adminWebinars.kind.timing' },
    { value: 'requirement', key: 'adminWebinars.kind.requirement' },
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
            <FormField label={t('adminWebinars.topicFieldUniversity')} error={null}>
              <select
                value={form.universityId}
                onChange={(e) => update('universityId', e.target.value)}
                disabled={!!initial}
                className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30] disabled:bg-gray-50 disabled:text-gray-500"
              >
                <option value="">—</option>
                {universities.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.nameZh})
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('adminWebinars.topicFieldKind')} error={null}>
              <select
                value={form.kind}
                onChange={(e) =>
                  update('kind', e.target.value as UniversityTopicKind)
                }
                disabled={!!initial}
                className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30] disabled:bg-gray-50 disabled:text-gray-500"
              >
                {KIND_OPTIONS.map((o) => (
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

function blankForm(initial: UniversityTopicEditValue | null) {
  return {
    universityId: initial?.universityId ?? '',
    kind: initial?.kind ?? 'program',
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