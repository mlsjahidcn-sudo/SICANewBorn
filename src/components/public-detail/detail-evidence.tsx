'use client';

import type { ReactElement } from 'react';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { localizedDetail } from '@/lib/detail-content';
import { verifiedEvidence, type CatalogVerification } from '@/lib/catalog-verification';
import { DetailNotice } from './detail-ui';

export function DetailEvidence({ evidence, recordedIntake, recordedDeadline }: { evidence?: CatalogVerification; recordedIntake?: string; recordedDeadline?: string }): ReactElement {
  const { t, locale } = useI18n();
  const [today, setToday] = useState('');
  useEffect(() => { setToday(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())); }, []);
  const verified = verifiedEvidence(evidence);
  const intake = localizedDetail(evidence?.intake, evidence?.intakeCn, locale);
  const deadline = verified ? evidence?.deadline : undefined;
  const expired = Boolean(deadline && today && deadline < today);
  return <DetailNotice title={t('detail.intakeEvidence')}>
    <dl className="space-y-3">
      <div><dt className="font-semibold text-[#1B2A4A]">{t('detail.recordedIntake')}</dt><dd className="break-words">{intake || recordedIntake || t('detail.confirmFunding')}</dd></div>
      {verified && intake && evidence?.intakeStatus && evidence.intakeStatus !== 'unknown' && <div><dt className="font-semibold text-[#1B2A4A]">{t('detail.recordedStatus')}</dt><dd>{t(expired ? 'detail.deadlinePassed' : `detail.availability.${evidence.intakeStatus}`)}</dd></div>}
      {(deadline || recordedDeadline) && <div><dt className="font-semibold text-[#1B2A4A]">{t(deadline && intake ? 'detail.intakeDeadline' : 'detail.unassignedDeadline')}</dt><dd>{deadline || recordedDeadline}</dd></div>}
    </dl>
    <p className="mt-3">{t('detail.deadlineNote')}</p>
    <EvidenceSource evidence={evidence} />
  </DetailNotice>;
}

export function EvidenceSource({ evidence }: { evidence?: CatalogVerification }): ReactElement {
  const { t } = useI18n();
  return <p className="mt-4 border-t border-gray-100 pt-3 text-xs leading-6 text-gray-500">
    {verifiedEvidence(evidence) ? <><a href={evidence?.sourceUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#9B1B30] underline">{t('detail.viewSource')}</a><span> · {t('detail.lastChecked')}: {evidence?.verifiedAt}</span></> : t('detail.sourceUnverified')}
  </p>;
}
