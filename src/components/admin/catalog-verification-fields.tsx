'use client';

import type { ReactElement } from 'react';
import { useState } from 'react';
import { apiFetch } from '@/lib/api-client';
import { catalogVerificationSchema } from '@/lib/validators/catalog-verification';

import { useI18n } from '@/lib/i18n';
import type { CatalogVerification } from '@/lib/catalog-verification';

export function CatalogVerificationFields({ value = {}, onChange, university = false, record }: { value?: CatalogVerification; onChange: (value: CatalogVerification) => void; university?: boolean; record?: { kind: 'universities' | 'programs'; slug: string } }): ReactElement {
  const { t } = useI18n();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);
  const saveEvidence = async (): Promise<void> => {
    if (!record || saving) return;
    const parsed = catalogVerificationSchema.safeParse(value);
    if (!parsed.success) { setFailed(true); setMessage(parsed.error.issues[0]?.message || t('detail.evidenceSaveError')); return; }
    setSaving(true);
    setMessage('');
    try {
      const response = await apiFetch(`/api/${record.kind}/${encodeURIComponent(record.slug)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ detailVerification: parsed.data }) });
      if (!response.ok) throw new Error(t('detail.evidenceSaveError'));
      setFailed(false);
      setMessage(t('detail.evidenceSaved'));
    } catch { setFailed(true); setMessage(t('detail.evidenceSaveError')); }
    finally { setSaving(false); }
  };
  const field = (key: keyof CatalogVerification, label: string, type: string = 'text') => <label key={key} className="block text-sm font-medium text-[#1B2A4A]">{t(label)}<input type={type} value={value[key] ?? ''} onChange={(event) => onChange({ ...value, [key]: event.target.value })} className="mt-2 h-11 w-full rounded-none border border-gray-300 bg-white px-3 text-sm focus:border-[#9B1B30] focus:outline-none focus:ring-1 focus:ring-[#9B1B30]" /></label>;
  return <section className="border border-gray-200 bg-white p-6">
    <h2 className="text-lg font-semibold text-[#1B2A4A]">{t('detail.evidenceEditor')}</h2>
    <p className="mt-2 text-sm leading-6 text-gray-600">{t('detail.evidenceEditorHelp')}</p>
    <div className="mt-5 grid gap-5 sm:grid-cols-2">
      {field('sourceUrl', 'detail.sourceUrl', 'url')}{field('verifiedAt', 'detail.lastChecked', 'date')}
      {field('intake', 'detail.namedIntake')}{field('intakeCn', 'detail.namedIntakeCn')}
      <label className="text-sm font-medium text-[#1B2A4A]">{t('detail.availability')}<select value={value.intakeStatus ?? 'unknown'} onChange={(event) => onChange({ ...value, intakeStatus: event.target.value as CatalogVerification['intakeStatus'] })} className="mt-2 h-11 w-full rounded-none border border-gray-300 bg-white px-3 text-sm">{['unknown', 'open', 'closed'].map((status) => <option key={status} value={status}>{t(`detail.availability.${status}`)}</option>)}</select></label>
      {field('deadline', 'detail.intakeDeadline', 'date')}
      {university && <>{field('rankingYear', 'detail.rankingYear')}{field('rankingSourceUrl', 'detail.rankingSource', 'url')}</>}
      {(['funding', 'fundingCn'] as const).map((key) => <label key={key} className="text-sm font-medium text-[#1B2A4A]">{t(key === 'funding' ? 'detail.fundingDetails' : 'detail.fundingDetailsCn')}<textarea rows={4} value={value[key] ?? ''} onChange={(event) => onChange({ ...value, [key]: event.target.value })} className="mt-2 w-full rounded-none border border-gray-300 bg-white p-3 text-sm" /></label>)}
    </div>
    {record && <div className="mt-5 border-t border-gray-100 pt-5"><p className="mb-3 text-xs leading-6 text-gray-500">{t('detail.evidenceSaveHelp')}</p><button type="button" disabled={saving} onClick={() => void saveEvidence()} className="inline-flex min-h-11 items-center rounded-none border border-[#1B2A4A] px-4 text-sm font-semibold text-[#1B2A4A] hover:bg-[#FAFAF8] disabled:opacity-50">{t(saving ? 'common.loading' : 'detail.evidenceSave')}</button>{message && <p role={failed ? 'alert' : 'status'} className="mt-3 text-sm text-[#1B2A4A]">{message}</p>}</div>}
  </section>;
}
