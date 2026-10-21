'use client';

import { useId, useState } from 'react';
import { ClipboardList, Copy, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useI18n } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n-translations';
import {
  MISSING_DOCUMENT_OPTIONS,
  buildDocumentDraftLinks,
  buildMissingDocumentMessage,
  type MissingDocumentCategory,
  type MissingDocumentContext,
} from '@/lib/missing-document-message';

interface MissingDocumentsRequestProps extends MissingDocumentContext {
  studentEmail?: string | null;
  studentPhone?: string | null;
  allowPartner?: boolean;
  defaultRecipient?: 'student' | 'partner';
  /** Explicitly save to the existing partner-application request history. */
  onSave?: (request: { categories: MissingDocumentCategory[]; message: string }) => Promise<void>;
}

export function MissingDocumentsRequest(props: MissingDocumentsRequestProps): React.JSX.Element {
  const { t } = useI18n();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState('');
  const [note, setNote] = useState('');
  const [language, setLanguage] = useState<Locale>('en');
  const [recipient, setRecipient] = useState<'student' | 'partner'>(props.defaultRecipient ?? 'student');
  const [editedMessage, setEditedMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const options = MISSING_DOCUMENT_OPTIONS.filter((option) => selected.includes(option.key));
  const customDocuments = custom.split('\n').map((name) => name.trim()).filter(Boolean);
  const generated = buildMissingDocumentMessage({
    ...props, recipient, language,
    documents: [...options.map((option) => option[language]), ...customDocuments], note,
  });
  const message = editedMessage ?? generated;
  const canShare = Boolean(generated && message.trim());
  // Partner contacts are not student contacts. Let the admin choose the partner in their app.
  const links = buildDocumentDraftLinks(message, recipient === 'student' ? props.studentEmail : null, recipient === 'student' ? props.studentPhone : null);

  const regenerate = (): void => {
    setEditedMessage(null);
    setFeedback('');
    setError('');
    setSaved(false);
  };
  const copyMessage = async (): Promise<void> => {
    setFeedback('');
    setError('');
    try {
      await navigator.clipboard.writeText(message);
      setFeedback(t('missingDocs.copied'));
    } catch {
      setError(t('missingDocs.copyFailed'));
    }
  };
  const saveRequest = async (): Promise<void> => {
    if (!props.onSave || !canShare) return;
    setSaving(true);
    setFeedback('');
    setError('');
    const categories = [...new Set<MissingDocumentCategory>([
      ...options.map((option) => option.category), ...(customDocuments.length ? ['other' as const] : []),
    ])];
    try {
      await props.onSave({ categories, message });
      setSaved(true);
      setFeedback(t('missingDocs.saved'));
    } catch {
      setError(t('missingDocs.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); setFeedback(''); setError(''); }}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline" className="rounded-none">
          <ClipboardList className="mr-2 h-4 w-4 text-[#1B2A4A]" />
          {t('missingDocs.title')}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-none sm:max-w-4xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('missingDocs.title')}</DialogTitle>
          <DialogDescription>{t('missingDocs.description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <fieldset disabled={saving} className="space-y-2">
              <legend className="mb-2 text-sm font-medium">{t('missingDocs.select')}</legend>
              {MISSING_DOCUMENT_OPTIONS.map((option) => (
                <label key={option.key} className="flex items-start gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={selected.includes(option.key)} className="mt-1 accent-[#9B1B30]" onChange={(event) => {
                    setSelected((previous) => event.target.checked ? [...previous, option.key] : previous.filter((key) => key !== option.key));
                    regenerate();
                  }} />
                  <span>{option[language]}</span>
                </label>
              ))}
            </fieldset>
            <div className="space-y-2">
              <Label htmlFor={`${id}-custom`}>{t('missingDocs.custom')}</Label>
              <Textarea id={`${id}-custom`} value={custom} disabled={saving} rows={2} maxLength={1000} className="rounded-none" onChange={(event) => { setCustom(event.target.value); regenerate(); }} placeholder={t('missingDocs.customHint')} />
            </div>
          </div>
          <div className="space-y-4 min-w-0">
            {props.allowPartner && (
              <fieldset disabled={saving} className="flex flex-wrap gap-4 text-sm">
                <legend className="mb-2 font-medium">{t('missingDocs.recipient')}</legend>
                {(['student', 'partner'] as const).map((value) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name={`${id}-recipient`} value={value} checked={recipient === value} className="accent-[#9B1B30]" onChange={() => { setRecipient(value); regenerate(); }} />
                    {value === 'student' ? t('missingDocs.student') : t('missingDocs.partner')}
                  </label>
                ))}
              </fieldset>
            )}
            <div className="space-y-2">
              <Label htmlFor={`${id}-language`}>{t('missingDocs.language')}</Label>
              <select id={`${id}-language`} value={language} disabled={saving} className="flex h-9 w-full border border-input bg-transparent px-3 text-sm" onChange={(event) => { setLanguage(event.target.value as Locale); regenerate(); }}>
                <option value="en">English</option>
                <option value="zh">中文</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-note`}>{t('missingDocs.note')}</Label>
              <Input id={`${id}-note`} value={note} disabled={saving} maxLength={500} className="rounded-none" onChange={(event) => { setNote(event.target.value); regenerate(); }} placeholder={t('missingDocs.noteHint')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-message`}>{t('missingDocs.message')}</Label>
              <Textarea id={`${id}-message`} value={message} disabled={!generated || saving} rows={14} maxLength={6000} className="rounded-none text-sm" onChange={(event) => { setEditedMessage(event.target.value); setFeedback(''); setError(''); setSaved(false); }} placeholder={t('missingDocs.empty')} />
              <p className="text-xs text-gray-500">{t('missingDocs.editHint')}</p>
              {editedMessage !== null && <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={regenerate} disabled={saving}>{t('missingDocs.regenerate')}</Button>}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" disabled={!canShare || saving} onClick={() => void copyMessage()} className="rounded-none bg-[#9B1B30] hover:bg-[#7A1526] text-white">
                <Copy className="mr-2 h-4 w-4 text-[#1B2A4A]" />{t('missingDocs.copy')}
              </Button>
              {canShare && <>
                <Button asChild variant="outline" size="sm" className="rounded-none"><a href={links.email}><Mail className="mr-2 h-4 w-4 text-[#1B2A4A]" />{t('missingDocs.email')}</a></Button>
                <Button asChild variant="outline" size="sm" className="rounded-none"><a href={links.whatsapp} target="_blank" rel="noopener noreferrer"><MessageSquare className="mr-2 h-4 w-4 text-[#1B2A4A]" />{t('missingDocs.whatsapp')}</a></Button>
              </>}
            </div>
            <p className="text-xs text-gray-500">{recipient === 'partner' ? t('missingDocs.partnerDraftHint') : t('missingDocs.draftHint')}</p>
            {props.onSave && <Button type="button" variant="outline" disabled={!canShare || saving || saved} onClick={() => void saveRequest()} className="rounded-none">{saving ? t('missingDocs.saving') : t('missingDocs.save')}</Button>}
            {feedback && <p role="status" className="text-sm text-[#1B2A4A]">{feedback}</p>}
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
