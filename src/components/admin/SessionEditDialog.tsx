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
import { AlertCircle, Save, Sparkles } from 'lucide-react';
import { apiFetchJson, ApiError } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';

export interface SessionEditValue {
  id: string;
  slug: string;
  titleEn: string;
  titleZh: string;
  descriptionEn: string | null;
  descriptionZh: string | null;
  sessionDate: string | null;
  sessionTime: string | null;
  durationMinutes: number;
  joinUrl: string | null;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled';
  /** Phase 164: editable label (overrides the auto-generated default). */
  label: string | null;
  /** Phase 164: editable week number (NULL means "not numbered"). */
  weekNumber: number | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initial: SessionEditValue | null;
  onSaved: (next: SessionEditValue) => void;
}

/**
 * Phase 164: inline edit dialog for a single webinar session.
 *
 * Phase 164 dropped the `isActive` checkbox + the
 * `displayOrder` input — auto-rollover removed the manual
 * toggle, and the date sort replaced the manual order. New
 * fields: `label` (overrides the auto-generated "Week N ·
 * Mon DD, YYYY" default) and `weekNumber` (sparse integer
 * used for sort + display). Both are nullable so the API
 * can re-derive them on the server side.
 *
 * Used by the Sessions tab in /admin/webinar-signups. Renders
 * one row per editable column from the webinar_sessions table.
 *
 * Why a modal not a separate route: a session is a 9-field
 * compact record edited in a tight tab loop. A `/new` +
 * `/[id]/edit` route pair would force a full-page navigation
 * per save. Modals match the natural admin workflow ("open,
 * tweak one field, save") and live alongside the list.
 */
export function SessionEditDialog({ open, onOpenChange, initial, onSaved }: Props) {
  const { t } = useI18n();
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Field-level validation errors rendered below each input
  // (Phase 1.6 pattern from PartnerApplicationForm).
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Form state — initialized from `initial` when the dialog
  // opens. Using a single state object means a Reset button
  // can re-seed the whole form from the original props.
  const [form, setForm] = useState<{
    slug: string;
    titleEn: string;
    titleZh: string;
    descriptionEn: string;
    descriptionZh: string;
    sessionDate: string;
    sessionTime: string;
    durationMinutes: number;
    joinUrl: string;
    status: SessionEditValue['status'];
    label: string;
    weekNumber: string;
  }>(() => blankForm(initial));

  // Re-seed when the dialog opens for a different row
  // (create-vs-edit on the same component instance).
  useEffect(() => {
    if (open) {
      setForm(blankForm(initial));
      setFieldErrors({});
      setSaveError(null);
    }
  }, [open, initial]);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.slug.trim()) errs.slug = t('adminWebinars.errorSaveSession');
    if (!form.titleEn.trim()) errs.titleEn = t('adminWebinars.errorSaveSession');
    if (!form.titleZh.trim()) errs.titleZh = t('adminWebinars.errorSaveSession');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    setSaveError(null);
    const payload: Record<string, unknown> = {
      slug: form.slug.trim(),
      titleEn: form.titleEn.trim(),
      titleZh: form.titleZh.trim(),
      descriptionEn: form.descriptionEn.trim() || null,
      descriptionZh: form.descriptionZh.trim() || null,
      // HTML datetime-local input emits "YYYY-MM-DDTHH:mm" in
      // local time. Convert to ISO UTC by letting the Date
      // parser normalize it — server side just stores timestamptz.
      sessionDate: form.sessionDate ? new Date(form.sessionDate).toISOString() : null,
      sessionTime: form.sessionTime.trim() || null,
      durationMinutes: Number(form.durationMinutes) || 60,
      joinUrl: form.joinUrl.trim() || null,
      status: form.status,
    };
    // Phase 164: label + weekNumber are nullable in the API.
    // Empty string → null so the server-side "auto-derive"
    // logic (MAX + 1 + formatWebinarDate) kicks in instead of
    // silently storing ''.
    const trimmedLabel = form.label.trim();
    payload.label = trimmedLabel ? trimmedLabel : null;
    const parsedWeek = parseInt(form.weekNumber, 10);
    payload.weekNumber = Number.isFinite(parsedWeek) ? parsedWeek : null;

    try {
      const endpoint = initial
        ? `/api/admin/webinar-sessions/${initial.id}`
        : `/api/admin/webinar-sessions`;
      const result = await apiFetchJson<{
        id: string;
        slug: string;
        label: string | null;
        weekNumber: number | null;
      }>(endpoint, {
        method: initial ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      onSaved({
        ...(initial ?? {
          descriptionEn: null,
          descriptionZh: null,
          sessionDate: null,
          sessionTime: null,
          joinUrl: null,
        }),
        ...(payload as Partial<SessionEditValue>),
        id: result.id,
        slug: result.slug,
        label: result.label,
        weekNumber: result.weekNumber,
      } as SessionEditValue);
      onOpenChange(false);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : t('adminWebinars.errorSaveSession'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-none">
        <DialogHeader>
          <DialogTitle>
            {initial ? t('adminWebinars.editSession') : t('adminWebinars.addSession')}
          </DialogTitle>
          <DialogDescription>
            {t('adminWebinars.sessionAutoRolloverHelp')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t('adminWebinars.sessionFieldSlug')}
              help={t('adminWebinars.sessionFieldSlugHelp')}
              error={fieldErrors.slug}
            >
              <Input
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                placeholder="webinar-2027-intake-csc"
              />
            </FormField>
            <FormField
              label={t('adminWebinars.sessionFieldDuration')}
              help={null}
              error={null}
            >
              <Input
                type="number"
                min={1}
                value={form.durationMinutes}
                onChange={(e) => update('durationMinutes', parseInt(e.target.value || '60', 10))}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t('adminWebinars.sessionFieldTitleEn')}
              help={null}
              error={fieldErrors.titleEn}
            >
              <Input
                value={form.titleEn}
                onChange={(e) => update('titleEn', e.target.value)}
              />
            </FormField>
            <FormField
              label={t('adminWebinars.sessionFieldTitleZh')}
              help={null}
              error={fieldErrors.titleZh}
            >
              <Input
                value={form.titleZh}
                onChange={(e) => update('titleZh', e.target.value)}
              />
            </FormField>
          </div>

          <FormField
            label={t('adminWebinars.sessionFieldDescriptionEn')}
            help={null}
            error={null}
          >
            <textarea
              rows={2}
              value={form.descriptionEn}
              onChange={(e) => update('descriptionEn', e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            />
          </FormField>
          <FormField
            label={t('adminWebinars.sessionFieldDescriptionZh')}
            help={null}
            error={null}
          >
            <textarea
              rows={2}
              value={form.descriptionZh}
              onChange={(e) => update('descriptionZh', e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label={t('adminWebinars.sessionFieldDate')}
              help={t('adminWebinars.sessionFieldDateHelp')}
              error={null}
            >
              <Input
                type="datetime-local"
                value={form.sessionDate}
                onChange={(e) => update('sessionDate', e.target.value)}
              />
            </FormField>
            <FormField
              label={t('adminWebinars.sessionFieldTime')}
              help={t('adminWebinars.sessionFieldTimeHelp')}
              error={null}
            >
              <Input
                value={form.sessionTime}
                onChange={(e) => update('sessionTime', e.target.value)}
                placeholder="10:00 AM Beijing Time"
              />
            </FormField>
          </div>

          <FormField
            label={t('adminWebinars.sessionFieldJoinUrl')}
            help={t('adminWebinars.sessionFieldJoinUrlHelp')}
            error={null}
          >
            <Input
              value={form.joinUrl}
              onChange={(e) => update('joinUrl', e.target.value)}
              placeholder="https://zoom.us/j/..."
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('adminWebinars.sessionFieldStatus')} help={null} error={null}>
              <select
                value={form.status}
                onChange={(e) => update('status', e.target.value as SessionEditValue['status'])}
                className="w-full border border-gray-300 px-4 py-2 text-sm text-[#1F2937] bg-white rounded-none focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]"
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Live">Live</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </FormField>
          </div>
          {/* Phase 164: label + weekNumber replace the
              removed isActive + displayOrder inputs. Label
              is auto-generated server-side from
              weekNumber + sessionDate when blank; weekNumber
              auto-increments from MAX+1 when blank. Staff can
              override either to retitle or re-number. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField
              label={t('adminWebinars.sessionFieldLabel')}
              help={t('adminWebinars.sessionFieldLabelHelp')}
              error={null}
            >
              <Input
                value={form.label}
                onChange={(e) => update('label', e.target.value)}
                placeholder={t('adminWebinars.sessionFieldLabelPlaceholder')}
              />
            </FormField>
            <FormField
              label={t('adminWebinars.sessionFieldWeekNumber')}
              help={t('adminWebinars.sessionFieldWeekNumberHelp')}
              error={null}
            >
              <Input
                type="number"
                min={1}
                value={form.weekNumber}
                onChange={(e) => update('weekNumber', e.target.value)}
                placeholder="auto"
              />
            </FormField>
          </div>

          <DialogFooter className="gap-2">
            {/* Phase 163: "Generate with AI" deep-links to the
              wizard page with this session pre-loaded. Renders in a
              new tab so the admin can keep the current session
              values in the dialog (in case they want to compare
              the AI's draft against their in-progress typing). */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (initial?.id) {
                  window.open(
                    `/admin/webinar-ai?sessionId=${encodeURIComponent(initial.id)}`,
                    '_blank',
                  );
                }
              }}
              className="rounded-none"
              disabled={!initial}
              title={t('adminWebinars.ai.openInNewTabTitle')}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {t('adminWebinars.ai.openInNewTabCta')}
            </Button>
            <div className="flex items-center gap-2 ml-auto">
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
                {t('adminWebinars.sessionSaved').replace('✓ ', '')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function blankForm(initial: SessionEditValue | null) {
  return {
    slug: initial?.slug ?? '',
    titleEn: initial?.titleEn ?? '',
    titleZh: initial?.titleZh ?? '',
    descriptionEn: initial?.descriptionEn ?? '',
    descriptionZh: initial?.descriptionZh ?? '',
    // datetime-local expects "YYYY-MM-DDTHH:mm"; we keep
    // session_date as ISO under the hood and just convert at
    // submit time.
    sessionDate: initial?.sessionDate ? toDateTimeLocal(initial.sessionDate) : '',
    sessionTime: initial?.sessionTime ?? '',
    durationMinutes: initial?.durationMinutes ?? 60,
    joinUrl: initial?.joinUrl ?? '',
    status: initial?.status ?? 'Scheduled',
    label: initial?.label ?? '',
    weekNumber: initial?.weekNumber != null ? String(initial.weekNumber) : '',
  };
}

/**
 * Convert an ISO string into the value an
 * `<input type="datetime-local">` understands (no timezone
 * suffix; the field is treated as local wall-clock time).
 */
function toDateTimeLocal(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    // YYYY-MM-DDTHH:mm in local time
    const tz = d.getTimezoneOffset() * 60 * 1000;
    return new Date(d.getTime() - tz).toISOString().slice(0, 16);
  } catch {
    return '';
  }
}

interface FormFieldProps {
  label: string;
  help: string | null | undefined;
  error: string | null | undefined;
  children: React.ReactNode;
}

function FormField({ label, help, error, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#1F2937] mb-1">{label}</label>
      {children}
      {help && !error && <p className="mt-1 text-xs text-[#4B5563]">{help}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
