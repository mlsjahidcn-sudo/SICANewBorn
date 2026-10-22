'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RemoteSearchSelect } from '@/components/admin/remote-search-select';
import { apiFetchJson } from '@/lib/api-client';
import { useI18n } from '@/lib/i18n';
import { PARTNER_APPLICATION_DEGREES } from '@/lib/partner-application-mapper';

export interface PartnerApplicationTarget {
  universityName: string;
  universitySlug: string;
  programName: string;
  programSlug: string;
  degree: string;
  intake: string | null;
}

interface UniversityRecord {
  slug: string;
  name: string;
}

interface ProgramRecord {
  program: { name?: string; degree?: string };
  university: { name?: string } | null;
}

function isPopoverTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(
    target.closest('[data-slot="popover-content"], [data-slot="select-content"]'),
  );
}

function keepPopoverOpen(event: { target: EventTarget | null; preventDefault: () => void }): void {
  if (isPopoverTarget(event.target)) event.preventDefault();
}

/**
 * Pick a catalog university and program. `assign` updates the open
 * application and leaves its intake alone. `create` also asks for an
 * intake and the caller inserts a new row.
 */
export function PartnerApplicationTargetDialog({
  open,
  onOpenChange,
  mode,
  submitting = false,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'assign' | 'create';
  submitting?: boolean;
  onSubmit: (target: PartnerApplicationTarget) => Promise<void>;
}): React.ReactElement {
  const { t } = useI18n();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [universitySlug, setUniversitySlug] = useState('');
  const [universityName, setUniversityName] = useState('');
  const [programSlug, setProgramSlug] = useState('');
  const [programName, setProgramName] = useState('');
  const [degree, setDegree] = useState('');
  const [intake, setIntake] = useState('');
  const [intakes, setIntakes] = useState<string[]>([]);
  const [intakesLoading, setIntakesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUniversitySlug('');
    setUniversityName('');
    setProgramSlug('');
    setProgramName('');
    setDegree('');
    setIntake('');
    setError(null);
  }, [open]);

  useEffect(() => {
    if (!open || mode !== 'create') return;
    const controller = new AbortController();
    setIntakesLoading(true);
    apiFetchJson<{ intakes: { label: string }[] }>('/api/intakes?active=true', { signal: controller.signal })
      .then((res) => {
        if (!controller.signal.aborted) setIntakes((res.intakes || []).map((row) => row.label).filter(Boolean));
      })
      .catch(() => {
        if (!controller.signal.aborted) setIntakes([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIntakesLoading(false);
      });
    return () => controller.abort();
  }, [open, mode]);

  const degreeAllowed = (PARTNER_APPLICATION_DEGREES as readonly string[]).includes(degree);
  const working = busy || submitting;
  const canSave = Boolean(universityName && programName && programSlug && degreeAllowed && (mode === 'assign' || intake));

  const confirm = async (): Promise<void> => {
    if (!canSave) return;
    setBusy(true);
    setError(null);
    try {
      await onSubmit({
        universityName,
        universitySlug,
        programName,
        programSlug,
        degree,
        intake: mode === 'create' ? intake : null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!working) onOpenChange(next); }}>
      <DialogContent
        className="rounded-none max-w-lg"
        onInteractOutside={keepPopoverOpen}
        onPointerDownOutside={keepPopoverOpen}
        onFocusOutside={keepPopoverOpen}
      >
        <div ref={setContainer} />
        <DialogHeader>
          <DialogTitle>
            {mode === 'assign' ? t('adminPartnerAppTarget.assignTitle') : t('adminPartnerAppTarget.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {mode === 'assign' ? t('adminPartnerAppTarget.assignDescription') : t('adminPartnerAppTarget.createDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>{t('adminPartnerAppTarget.university')}</Label>
            <RemoteSearchSelect<UniversityRecord>
              url="/api/admin/application-options?kind=university"
              value={universitySlug}
              container={container}
              placeholder={t('adminPartnerAppTarget.selectUniversity')}
              disabled={working}
              onChange={(value, record) => {
                setUniversitySlug(value);
                setUniversityName(record?.name ?? '');
                setProgramSlug('');
                setProgramName('');
                setDegree('');
              }}
            />
          </div>
          <div>
            <Label>{t('adminPartnerAppTarget.program')}</Label>
            {universitySlug ? (
              <RemoteSearchSelect<ProgramRecord>
                key={universitySlug}
                url={`/api/admin/application-options?kind=program&university=${encodeURIComponent(universitySlug)}`}
                value={programSlug}
                container={container}
                placeholder={t('adminPartnerAppTarget.selectProgram')}
                disabled={working}
                onChange={(value, record) => {
                  const nextDegree = String(record?.program.degree ?? '');
                  setProgramSlug(value);
                  setProgramName(String(record?.program.name ?? ''));
                  setDegree(nextDegree);
                }}
              />
            ) : (
              <Button type="button" variant="outline" disabled className="w-full justify-start rounded-none font-normal text-gray-400">
                {t('adminPartnerAppTarget.selectUniversityFirst')}
              </Button>
            )}
          </div>
          <div>
            <Label>{t('adminPartnerAppTarget.degree')}</Label>
            <p className="mt-1 text-sm text-[#1F2937]">
              {degree
                ? degreeAllowed
                  ? degree
                  : t('adminPartnerAppTarget.degreeUnsupported')
                : t('adminPartnerAppTarget.degreeFromProgram')}
            </p>
          </div>
          {mode === 'create' && (
            <div>
              <Label>{t('adminPartnerAppTarget.intake')}</Label>
              <Select value={intake || undefined} onValueChange={setIntake} disabled={working || intakesLoading}>
                <SelectTrigger className="rounded-none mt-1 w-full">
                  <SelectValue placeholder={intakesLoading ? t('common.loading') : t('adminPartnerAppTarget.selectIntake')} />
                </SelectTrigger>
                <SelectContent container={container} className="rounded-none">
                  {intakes.map((label) => (
                    <SelectItem key={label} value={label}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!intakesLoading && intakes.length === 0 && (
                <p className="text-xs text-gray-500 mt-1">{t('adminPartnerAppTarget.noIntakes')}</p>
              )}
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-none" disabled={working} onClick={() => onOpenChange(false)}>
            {t('adminPartnerAppTarget.cancel')}
          </Button>
          <Button
            className="rounded-none bg-[#1B2A4A] hover:bg-[#26345A] text-white"
            disabled={working || !canSave}
            onClick={() => { void confirm(); }}
          >
            {working ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'assign' ? t('adminPartnerAppTarget.saving') : t('adminPartnerAppTarget.creating')}
              </>
            ) : (
              mode === 'assign' ? t('adminPartnerAppTarget.saveAssignment') : t('adminPartnerAppTarget.createConfirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
