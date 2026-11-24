import type { Locale } from '@/lib/i18n-translations';

export const CSC_DEADLINES_REVIEWED_AT = '2026-10-28';
export const CSC_DEADLINES_PATH = '/csc-scholarship-deadlines-2027-2028';
export const cscNoticeSources = {
  maldives: 'https://mv.china-embassy.gov.cn/eng/sgsd/202610/t20261025_12046428.htm',
  singapore: 'https://www.cscse.edu.cn/singapore/tzgg/2026102611241792506/index.html',
  southSudan: 'https://ss.china-embassy.gov.cn/eng/zytx/202610/t20261023_12046188.htm',
  timorLeste: 'https://tl.china-embassy.gov.cn/eng/xwdt/202610/t20261023_12045707.htm',
  checklist: 'https://tl.china-embassy.gov.cn/eng/xwdt/202610/P020261023499724359279.pdf',
  bangladesh: 'https://bd.china-embassy.gov.cn/eng/',
  pakistan: 'https://www.hec.gov.pk/english/scholarshipsgrants/cgsp/Pages/default.aspx',
  nigeria: 'https://ng.china-embassy.gov.cn/eng/',
} as const;

interface CscCountryDeadline {
  country: Record<Locale, string>;
  deadline: string | null;
  before?: boolean;
  status: 'confirmed' | 'check';
  noticeDate?: string;
  source: string;
  sourceLabel: Record<Locale, string>;
  submission: Record<Locale, string>;
}

/** Editorial snapshot, not an automatic feed. Never infer a date for a check row. */
export const cscCountryDeadlines: CscCountryDeadline[] = [
  { country: { en: 'Timor-Leste', zh: '东帝汶' }, deadline: '2026-12-20', before: true, status: 'confirmed', noticeDate: '2026-10-23', source: cscNoticeSources.timorLeste, sourceLabel: { en: 'Timor-Leste notice', zh: '东帝汶通知' }, submission: { en: 'Online application + documents to the Ministry of Higher Education, Science and Culture before this date.', zh: '在此日期前完成网申，并向高等教育、科学和文化部提交材料。' } },
  { country: { en: 'South Sudan', zh: '南苏丹' }, deadline: '2027-01-20', status: 'confirmed', noticeDate: '2026-10-23', source: cscNoticeSources.southSudan, sourceLabel: { en: 'South Sudan notice', zh: '南苏丹通知' }, submission: { en: 'Online application + paper copies to the Chinese Embassy in Juba. Agency 7371; do not send originals.', zh: '网申并向驻朱巴中国使馆递交纸质复印件；机构号 7371，不寄原件。' } },
  { country: { en: 'Maldives', zh: '马尔代夫' }, deadline: '2027-01-29', status: 'confirmed', noticeDate: '2026-10-25', source: cscNoticeSources.maldives, sourceLabel: { en: 'Maldives notice', zh: '马尔代夫通知' }, submission: { en: 'Online submission through the Chinese Embassy channel. Agency 4622.', zh: '通过中国使馆受理渠道在线提交；机构号 4622。' } },
  { country: { en: 'Singapore', zh: '新加坡' }, deadline: '2027-01-31', status: 'confirmed', noticeDate: '2026-10-26', source: cscNoticeSources.singapore, sourceLabel: { en: 'Singapore notice', zh: '新加坡通知' }, submission: { en: 'Submit in the system by 23:59. Type A; agency 7021. Confirm the system time zone with the Education Office.', zh: '23:59 前在系统提交；A 类，机构号 7021。系统时区请向使馆教育处确认。' } },
  { country: { en: 'Bangladesh', zh: '孟加拉国' }, deadline: null, status: 'check', source: cscNoticeSources.bangladesh, sourceLabel: { en: 'Chinese Embassy in Bangladesh', zh: '中国驻孟加拉国使馆' }, submission: { en: 'Check the new 2027/28 notice; no date confirmed in this tracker.', zh: '查看 2027/28 新通知；本表尚未确认日期。' } },
  { country: { en: 'Pakistan', zh: '巴基斯坦' }, deadline: null, status: 'check', source: cscNoticeSources.pakistan, sourceLabel: { en: 'HEC scholarship page', zh: 'HEC 奖学金页面' }, submission: { en: 'Check HEC and the Chinese Embassy for the new cycle. Do not reuse last year’s cutoff.', zh: '查看 HEC 与中国使馆新年度通知，不沿用往年截止日。' } },
  { country: { en: 'Nigeria', zh: '尼日利亚' }, deadline: null, status: 'check', source: cscNoticeSources.nigeria, sourceLabel: { en: 'Chinese Embassy in Nigeria', zh: '中国驻尼日利亚使馆' }, submission: { en: 'Check the new 2027/28 notice; no date confirmed in this tracker.', zh: '查看 2027/28 新通知；本表尚未确认日期。' } },
];

