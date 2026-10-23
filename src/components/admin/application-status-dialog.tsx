'use client';

import { useId, useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/lib/i18n';

export interface ApplicationStatusOptions {
  notifyApplicant: boolean;
  applicantNote: string;
  internalNote: string;
}

interface Props {
  studentName: string;
  university: string;
  program: string;
  currentStatus: string;
  nextStatus: string;
  surface: 'student' | 'partner';
  pending: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (options: ApplicationStatusOptions) => void | Promise<void>;
}

/** Shared confirmation for list and detail; notification options match each API. */
export function ApplicationStatusDialog(props: Props): React.ReactNode {
  const { t } = useI18n();
  const fieldId = useId();
  const [notifyApplicant, setNotifyApplicant] = useState(true);
  const [applicantNote, setApplicantNote] = useState('');
  const [internalNote, setInternalNote] = useState('');
  return <Dialog open onOpenChange={(open) => { if (!open && !props.pending) props.onClose(); }}>
    <DialogContent className="rounded-none max-h-[90dvh] overflow-y-auto" showCloseButton={!props.pending}>
      <DialogHeader>
        <DialogTitle>{t('adminAppReview.confirmStatus')}</DialogTitle>
        <DialogDescription>{t('adminAppReview.confirmStatusHint')}</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col gap-2 border bg-muted/30 p-3 text-sm">
        <strong>{props.studentName}</strong>
        <p className="break-words text-muted-foreground">{props.university} · {props.program}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-none">{props.currentStatus}</Badge>
          <ArrowRight className="size-4 text-[#1B2A4A]" aria-hidden="true" />
          <Badge variant="secondary" className="rounded-none">{props.nextStatus}</Badge>
        </div>
      </div>
      {props.surface === 'student' ? <FieldGroup className="gap-4">
        <Field>
          <FieldLabel htmlFor={`${fieldId}-internal`}>{t('adminAppReview.teamNote')}</FieldLabel>
          <FieldDescription>{t('adminManagement.internalNotesHint')}</FieldDescription>
          <Textarea id={`${fieldId}-internal`} value={internalNote} onChange={e => setInternalNote(e.target.value)} rows={2} maxLength={2000} disabled={props.pending} className="rounded-none" />
        </Field>
        <Field orientation="horizontal">
          <input id={`${fieldId}-notify`} type="checkbox" checked={notifyApplicant} onChange={e => setNotifyApplicant(e.target.checked)} disabled={props.pending} />
          <FieldLabel htmlFor={`${fieldId}-notify`}>{t('adminAppReview.emailApplicant')}</FieldLabel>
        </Field>
        {notifyApplicant && <Field>
          <FieldLabel htmlFor={`${fieldId}-applicant`}>{t('adminAppReview.emailNote')}</FieldLabel>
          <FieldDescription>{t('adminAppReview.emailNoteHint')}</FieldDescription>
          <Textarea id={`${fieldId}-applicant`} value={applicantNote} onChange={e => setApplicantNote(e.target.value)} rows={2} maxLength={2000} disabled={props.pending} className="rounded-none" />
        </Field>}
      </FieldGroup> : <p className="text-sm text-muted-foreground">{t('adminAppReview.partnerNotificationHint')}</p>}
      {props.error && <Alert variant="destructive" className="rounded-none"><AlertDescription>{props.error}</AlertDescription></Alert>}
      <DialogFooter>
        <Button variant="outline" className="rounded-none" disabled={props.pending} onClick={props.onClose}>{t('common.cancel')}</Button>
        <Button className="rounded-none bg-[#9B1B30] text-white hover:bg-[#7A1526]" disabled={props.pending} onClick={() => void props.onConfirm({ notifyApplicant, applicantNote: notifyApplicant ? applicantNote.trim() : '', internalNote: internalNote.trim() })}>
          {props.pending && <Loader2 data-icon="inline-start" className="animate-spin" />}
          {props.pending ? t('common.saving') : t('adminAppReview.confirmStatus')}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
