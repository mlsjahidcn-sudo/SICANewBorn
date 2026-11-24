import { cscCountryDeadlines, CSC_DEADLINES_PATH, CSC_DEADLINES_REVIEWED_AT } from '@/lib/csc-deadlines';
import type { Locale } from '@/lib/i18n-translations';
import type { GuideSection } from './types';

export function cscCountryStatus(country: string, locale: Locale): GuideSection {
  const row = cscCountryDeadlines.find((item) => item.country.en === country);
  const zh = locale === 'zh';
  return {
    id: 'current-cycle-status',
    intro: '',
    h2: zh ? '2027/28 当期通知状态' : '2027/28 notice status',
    blocks: [
      { type: 'callout', tone: 'warning', text: row?.status === 'confirmed' && row.deadline
        ? `${row.country[locale]}: ${row.before ? (zh ? '早于 ' : 'Before ') : ''}${row.deadline}. ${row.submission[locale]}`
        : zh ? `截至 ${CSC_DEADLINES_REVIEWED_AT}，本追踪表尚未确认${row?.country.zh ?? country}的 2027/28 官方截止日。下文提到的季节范围仅供规划，不代表本年度已公布日期。请勿沿用往年截止日。`
          : `As of ${CSC_DEADLINES_REVIEWED_AT}, this tracker has not confirmed a 2027/28 official deadline for ${country}. Seasonal windows mentioned below are planning guidance, not an announced current-cycle date. Do not reuse last year's cutoff.` },
      { type: 'links', items: [
        { label: zh ? '查看各国截止日及材料要求' : 'Country deadlines and document requirements', href: CSC_DEADLINES_PATH },
        ...(row ? [{ label: row.sourceLabel[locale], href: row.source }] : []),
      ] },
    ],
  };
}
