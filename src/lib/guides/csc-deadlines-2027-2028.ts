import type { Locale } from '@/lib/i18n-translations';
import type { GuideSection, LocalizedGuide } from './types';

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

export function cscDeadlineTrackerSection(locale: Locale): GuideSection {
  const zh = locale === 'zh';
  return {
    id: 'deadlines-by-country',
    h2: zh ? 'CSC 2027/2028 各国申请截止日' : 'When is the CSC 2027/2028 deadline in my country?',
    intro: zh ? '截至 2026 年 10 月 28 日的人工核查快照。已确认表示已查阅本年度官方通知；[待查] 表示未确认 2027/28 日期，不代表已截止或无需申请。此表是国家受理渠道，不是所有大学 Type B 项目的统一截止日。' : 'Editorial snapshot checked on 28 October 2026. Confirmed means the current-cycle official notice was reviewed. [Check] means no 2027/28 date is confirmed here; it does not mean applications are closed. These are country-channel deadlines, not a universal Type B university deadline.',
    blocks: [
      { type: 'table', caption: zh ? '2027/28 国家渠道截止日与官方来源' : 'CSC 2027/28 country-channel deadlines and official sources', columns: zh ? ['国家', '截止日期', '状态', '提交要求', '官方来源'] : ['Country', 'Deadline', 'Status', 'Submission requirement', 'Official source'], rows: cscCountryDeadlines.map((row) => [row.country[locale], row.deadline ? `${row.before ? (zh ? '早于 ' : 'Before ') : ''}${row.deadline}` : (zh ? '[待查] 未公布确认日期' : '[Check] Date not confirmed'), row.status === 'confirmed' ? (zh ? `已确认 · 通知 ${row.noticeDate}` : `Confirmed · notice ${row.noticeDate}`) : (zh ? '[待查]' : '[Check]'), row.submission[locale], row.sourceLabel[locale]]), cellLinks: Object.fromEntries(cscCountryDeadlines.map((row) => [row.sourceLabel[locale], row.source])) },
      { type: 'callout', tone: 'warning', text: zh ? '东帝汶通知明确要求在 2026 年 12 月 20 日之前完成，不要把它理解为当天 23:59。除新加坡注明 23:59 外，其余三份通知未写明具体时刻。请向受理单位确认时区、纸质材料送达与更早的校内截止要求。' : 'Timor-Leste says before 20 December 2026; do not assume 23:59 on that day. Only Singapore states a clock time (23:59); the other three notices do not. Ask the receiving authority about time zones, document delivery and any earlier university cutoff.' },
    ],
  };
}

export const cscDeadlineGuide: LocalizedGuide = {
  en: {
    slug: 'csc-scholarship-deadlines-2027-2028', updatedAt: CSC_DEADLINES_REVIEWED_AT,
    eyebrow: 'GUIDE · CSC 2027/2028',
    title: 'CSC 2027/2028 deadlines by country: dates and documents',
    seoTitle: 'CSC 2027/2028 Deadlines by Country | SICA',
    description: 'Track CSC 2027/2028 deadlines by country, official notices, admission letters and bachelor’s CSCA requirements. Bangladesh, Pakistan and Nigeria: check.',
    subtitle: 'There is no single global CSC deadline. Use your country’s official notice, prepare your university admission document, and leave time for your CSCA score report.',
    stats: [{ value: '2027/28', label: 'Scholarship academic year' }, { value: '4', label: 'Confirmed country notices' }, { value: '3', label: 'Countries marked [Check]' }],
    quickAnswer: 'The earliest deadline in this tracker is Timor-Leste: submit before 20 December 2026. South Sudan closes on 20 January 2027, Maldives on 29 January, and Singapore on 31 January at 23:59. Bangladesh, Pakistan and Nigeria remain [Check]. The reviewed notices require university admission or pre-admission evidence; bachelor’s applicants also need a valid CSCA score report before submission.',
    keyTakeaways: ['Check the academic year: 2027/2028 refers to this scholarship cycle, not a deadline in 2028.', 'A CampusChina submission may not complete the local process: South Sudan and Timor-Leste also require delivery to a receiving authority.', 'Get admission or pre-admission evidence from a university on your CSC preference list.', 'Bachelor’s applicants need the score report, not just a CSCA booking confirmation.', 'Do not assume a December or January exam will produce results before your country deadline.'],
    sections: [
      cscDeadlineTrackerSection('en'),
      { id: 'documents', h2: 'What documents do I need for CSC 2027/2028?', intro: 'Start with the checklist attached to your country notice, then add your university’s requirements. The Timor-Leste attachment provides the baseline below; local instructions can differ.', blocks: [
        { type: 'ul', items: ['**Core file:** CSC application form, passport information page, highest qualification or current-student/graduation evidence, academic transcripts and language evidence required by the program.', '**Admission evidence:** a university-issued admission/pre-admission document or accepted school/supervisor invitation. It must relate to an institution on your application.', '**Bachelor’s applicants:** a valid CSCA score report for the subjects required by the target major.', '**Academic plan:** a study or research plan in Chinese or English. Follow the notice and university requirements.', '**Conditional documents:** recommendation letters for graduate/senior-scholar applications; portfolio for relevant art/design programs; legal guardianship documents for applicants under 18.', '**Health and background:** the prescribed physical examination form for stays over six months and a valid non-criminal-record certificate. Check validity and translation requirements before ordering documents.'] },
        { type: 'links', items: [{ label: 'Official application checklist attached to the Timor-Leste notice (PDF)', href: cscNoticeSources.checklist }] },
        { type: 'p', text: 'Use clear scans and the required notarized translations. Check document names, passport details and the selected university/program across every form. Keep your own copies and submission receipts.' },
      ] },
      { id: 'admission-letter', h2: 'Is a pre-admission letter compulsory?', intro: 'For the four country notices reviewed here, admission or pre-admission evidence is required. It is no longer appropriate to describe it as merely expected or optional for these routes.', blocks: [
        { type: 'p', text: 'The Maldives and Singapore notices require at least one document from a preferred university. South Sudan and the checklist attached by Timor-Leste also require university pre-admission material. Accepted forms can include an admissions-office notice or a school/supervisor invitation; ask the receiving authority whether your particular document qualifies. A generic application receipt is not automatically equivalent.' },
        { type: 'links', items: [{ label: 'Maldives: admission-document requirement', href: cscNoticeSources.maldives }, { label: 'Singapore: admission and CSCA requirements', href: cscNoticeSources.singapore }, { label: 'South Sudan: pre-admission requirement', href: cscNoticeSources.southSudan }] },
        { type: 'callout', tone: 'info', text: 'Run university admission and scholarship preparation in parallel. Request the admission document now; finish the country-channel submission only when all required evidence is ready. A pre-admission document does not guarantee CSC funding.' },
      ] },
      { id: 'csca-score', h2: 'Do bachelor’s applicants need a CSCA score report?', intro: 'Yes. The reviewed notices and checklist require bachelor’s applicants to provide a valid CSCA result with the application. Confirm the subjects for your intended major directly with the university.', blocks: [
        { type: 'p', text: 'Work backward from the scholarship deadline and the official score-release schedule. Some notices mention November/December 2026 or January 2027 sittings, but that is not a promise that every sitting works for every country. Registration closes before the test, and results take additional time. Timor-Leste’s December deadline is particularly early; South Sudan’s 20 January deadline also makes a later January result unsuitable.' },
        { type: 'links', items: [{ label: 'Official CSCA registration and examination information', href: 'https://www.csca.cn/' }, { label: 'SICA: CSCA and the CSC scholarship application', href: '/csca-csc-scholarship' }] },
        { type: 'callout', tone: 'warning', text: 'If no remaining sitting can provide a result before your deadline, contact the receiving authority immediately. Do not assume a score can be added late, or upload a test booking in place of the required report.' },
      ] },
      { id: 'country-checks', h2: 'What should Bangladesh, Pakistan and Nigeria applicants do now?', intro: 'These rows remain [Check] as of the review date. Do not turn an old deadline or a general January–April estimate into a confirmed 2027/28 cutoff.', blocks: [
        { type: 'ol', items: ['Monitor your receiving authority’s new-cycle notice. For Pakistan, check HEC as well as the Chinese Embassy; local and CSC portal submissions may have different steps.', 'Prepare university admission evidence, transcripts, translations and test results while waiting.', 'When a notice appears, record the deadline, time zone, agency number, application category, local portal requirements and any paper-copy delivery.', 'Check the university’s own deadline separately. A later Type B opportunity does not extend a country-channel deadline.'] },
        { type: 'links', items: [{ label: 'Bangladesh: Chinese Embassy', href: cscNoticeSources.bangladesh }, { label: 'Pakistan: HEC Chinese Government Scholarship page', href: cscNoticeSources.pakistan }, { label: 'Nigeria: Chinese Embassy', href: cscNoticeSources.nigeria }] },
      ] },
      { id: 'submission-plan', h2: 'How do I submit a complete application on time?', intro: 'Use the earliest deadline that applies to your chosen route. Keep proof of both online submission and any local delivery.', blocks: [{ type: 'ol', items: ['Read your country notice and its attachments; confirm that you meet the route’s eligibility criteria.', 'Choose an eligible program and ask its admissions office for the admission document, language requirements and CSCA subjects.', 'Gather the required reports and documents before opening the final submission step.', 'Submit through the official system and complete local agency requirements. Do not use another country’s agency number.', 'Save the application PDF, confirmation and delivery evidence; check the portal and email for corrections or interview requests.'] }] },
    ],
    faqs: [
      { q: 'When is the CSC 2027/2028 deadline?', a: 'There is no single global deadline. In the notices reviewed on 28 October 2026: Timor-Leste requires submission before 20 December 2026; South Sudan by 20 January 2027; Maldives by 29 January; Singapore by 31 January at 23:59. Check the country table and official notice for your route.' },
      { q: 'Have Bangladesh, Pakistan and Nigeria announced their 2027/28 dates?', a: 'No date is confirmed for those three countries in this tracker as of 28 October 2026. Their rows remain [Check]. Follow the current embassy or dispatching-authority notice rather than a previous year’s deadline.' },
      { q: 'Can I submit without a pre-admission letter?', a: 'The reviewed country notices require an admission or pre-admission document. Accepted forms can include a university admissions notice or an approved school/supervisor invitation. Confirm that your document meets your route’s rules before submitting.' },
      { q: 'Can I provide my CSCA report after the deadline?', a: 'Do not assume so. Bachelor’s applicants must have the required valid score report for submission under the reviewed notices. A test booking alone does not satisfy that requirement. Ask the receiving authority about your case if timing is a problem.' },
      { q: 'Are these the deadlines for every Type B university scholarship?', a: 'No. These are the specified country-channel deadlines. Universities publish their own Type B timelines and may require a separate admission application. Check both processes; one deadline does not extend the other.' },
    ],
    howToSteps: [{ name: 'Find your country notice', text: 'Confirm the current academic year, receiving authority and all submission deadlines.' }, { name: 'Obtain admission evidence', text: 'Contact a university on your preference list and obtain the required admission/pre-admission document.' }, { name: 'Prepare test reports and documents', text: 'Bachelor’s applicants need a valid CSCA score report. Follow the official checklist for other documents.' }, { name: 'Complete both submission processes', text: 'Submit the CSC application and any separate local portal, ministry or paper-copy requirements before the applicable cutoff.' }],
    ctaTitle: 'Build your CSC application checklist', ctaSubtitle: 'SICA can help you compare programs and organise your university admission and scholarship timelines. The receiving authority makes the scholarship decision.', ctaApplyLabel: 'Review my study options', ctaContactLabel: 'Talk through my timeline',
    related: [{ href: '/chinese-government-scholarship-csc', label: 'Chinese Government Scholarship guide', description: 'Coverage, eligibility, application routes and the country deadline tracker.' }, { href: '/guides/application', label: 'How to apply to Chinese universities', description: 'Prepare your university application alongside your scholarship file.' }, { href: '/csca-csc-scholarship', label: 'CSCA for CSC applicants', description: 'Plan bachelor’s assessment requirements around your scholarship deadline.' }],
  },
  zh: {
    slug: 'csc-scholarship-deadlines-2027-2028', updatedAt: CSC_DEADLINES_REVIEWED_AT,
    eyebrow: '指南 · CSC 2027/2028', title: 'CSC 2027/2028 各国截止日期与申请材料指南', seoTitle: 'CSC 2027/2028 各国截止日与材料清单 | SICA',
    description: '查看 CSC 2027/2028 各国截止日、官方通知、录取材料与本科 CSCA 成绩要求。孟加拉国、巴基斯坦、尼日利亚日期保留待查。',
    subtitle: 'CSC 没有全球统一截止日。以本国官方通知为准，提前取得大学录取材料，并为 CSCA 成绩出具预留时间。',
    stats: [{ value: '2027/28', label: '奖学金学年' }, { value: '4', label: '已确认国家通知' }, { value: '3', label: '国家标记待查' }],
    quickAnswer: '本表最早的截止要求为东帝汶：须在 2026 年 12 月 20 日之前提交。南苏丹为 2027 年 1 月 20 日，马尔代夫为 1 月 29 日，新加坡为 1 月 31 日 23:59。孟加拉国、巴基斯坦、尼日利亚保留 [待查]。本次查阅的通知要求大学录取或预录取材料；本科申请者还须在提交时持有有效 CSCA 成绩单。',
    keyTakeaways: ['先核对学年：2027/2028 是本轮资助学年，不代表申请可以等到 2028 年。', '仅提交留学中国系统不一定完成本国手续：南苏丹、东帝汶还要求向当地受理单位递交材料。', '录取或预录取文件应来自申请志愿中的大学。', '本科申请需要正式 CSCA 成绩单，报考凭证不能替代。', '12 月或 1 月场次未必赶得上本国截止日，必须确认成绩发布时间。'],
    sections: [
      cscDeadlineTrackerSection('zh'),
      { id: 'documents', h2: 'CSC 2027/2028 需要哪些申请材料？', intro: '先按本国通知附件整理，再补充目标大学的要求。以下基础清单参考东帝汶通知所附官方申请材料说明，各渠道细节可能不同。', blocks: [
        { type: 'ul', items: ['**基础文件：**CSC 申请表、护照个人信息页、最高学历证明或在读/预计毕业证明、成绩单，以及专业要求的语言证明。', '**录取材料：**志愿大学出具的录取或预录取文件，或被受理方认可的学院、导师邀请函。', '**本科申请者：**目标专业要求科目的有效 CSCA 成绩单。', '**学术计划：**用中文或英文撰写学习或研究计划，符合通知及大学要求。', '**按情况提交：**研究生及高级进修申请的推荐信；艺术设计专业作品；未满 18 周岁申请人的在华法定监护文件。', '**健康与背景：**学习超过六个月所需的指定体检表，以及有效无犯罪记录证明。办理前核对有效期、公证和翻译规定。'] },
        { type: 'links', items: [{ label: '东帝汶通知所附官方申请材料清单（PDF）', href: cscNoticeSources.checklist }] },
        { type: 'p', text: '扫描件须清晰，并按要求附公证翻译件。核对各表中的姓名、护照信息、大学和专业名称，保存材料副本与提交回执。' },
      ] },
      { id: 'admission-letter', h2: '预录取材料是否必须提供？', intro: '本次核查的四个国家渠道均要求录取或预录取材料。对这些渠道，不应再将其表述为“预计需要”或可选。', blocks: [
        { type: 'p', text: '马尔代夫、新加坡要求至少提供一所志愿大学的相关文件；南苏丹及东帝汶所附清单也要求大学预录取材料。招生部门预录取通知、学院或导师邀请函等可能被接受，但应向受理单位确认你的具体文件是否合格。普通申请回执不自动等于预录取文件。' },
        { type: 'links', items: [{ label: '马尔代夫：录取文件要求', href: cscNoticeSources.maldives }, { label: '新加坡：预录取与 CSCA 要求', href: cscNoticeSources.singapore }, { label: '南苏丹：预录取要求', href: cscNoticeSources.southSudan }] },
        { type: 'callout', tone: 'info', text: '大学申请与奖学金材料准备应同步进行。现在就申请相关录取文件，在所需证明齐备后完成奖学金提交。预录取文件不保证获得 CSC 资助。' },
      ] },
      { id: 'csca-score', h2: '本科申请者必须提供 CSCA 成绩吗？', intro: '需要。本次查阅的通知及清单要求本科申请者提交有效成绩，具体科目须向目标大学确认。', blocks: [
        { type: 'p', text: '从本国截止日及官方出分时间倒推考试安排。部分通知提及 2026 年 11 月、12 月或 2027 年 1 月，但不代表每个场次都适合所有国家。报名在考试前截止，考试后还需要等待出分。东帝汶 12 月截止较早；南苏丹 1 月 20 日截止，也不能依赖此后才出具的 1 月成绩。' },
        { type: 'links', items: [{ label: 'CSCA 官方报名与考试信息', href: 'https://www.csca.cn/' }, { label: 'SICA：CSC 奖学金与 CSCA 要求', href: '/csca-csc-scholarship' }] },
        { type: 'callout', tone: 'warning', text: '如果剩余场次无法在截止前出分，请立即联系受理单位。不要自行假定可以补交成绩，也不要用报名凭证替代正式成绩单。' },
      ] },
      { id: 'country-checks', h2: '孟加拉国、巴基斯坦和尼日利亚申请者现在该做什么？', intro: '截至核查日期，这三行继续标记 [待查]。不要把往年截止日或“约 1—4 月”的概括当作 2027/28 已确认日期。', blocks: [
        { type: 'ol', items: ['关注本国受理单位新年度通知；巴基斯坦同时查看 HEC 与中国使馆，本地门户和 CSC 系统可能有不同手续。', '等待通知期间先准备大学录取材料、成绩单、翻译与考试成绩。', '通知发布后记录截止日期、时区、机构号、项目类别、本地系统手续与纸质材料送达要求。', '另查目标大学截止日；更晚的 Type B 机会不会延长本国渠道截止日。'] },
        { type: 'links', items: [{ label: '孟加拉国：中国使馆', href: cscNoticeSources.bangladesh }, { label: '巴基斯坦：HEC 中国政府奖学金页面', href: cscNoticeSources.pakistan }, { label: '尼日利亚：中国使馆', href: cscNoticeSources.nigeria }] },
      ] },
      { id: 'submission-plan', h2: '怎样按时提交完整申请？', intro: '以所选渠道中最早适用的截止日为准，并保留在线提交及本地递交凭据。', blocks: [{ type: 'ol', items: ['阅读本国通知与附件，确认符合所选渠道资格。', '选定合格专业，向招生部门索取录取文件并确认语言、CSCA 科目要求。', '在最终提交前收齐成绩和各项申请材料。', '完成官方系统提交及本地受理手续；不要套用其他国家的机构号。', '保存申请表、提交回执和递交证明，及时查看补件或面试通知。'] }] },
    ],
    faqs: [
      { q: 'CSC 2027/2028 什么时候截止？', a: '没有全球统一日期。2026 年 10 月 28 日核查的通知中，东帝汶要求在 2026 年 12 月 20 日之前提交；南苏丹为 2027 年 1 月 20 日，马尔代夫为 1 月 29 日，新加坡为 1 月 31 日 23:59。具体流程以本国官方通知为准。' },
      { q: '孟加拉国、巴基斯坦和尼日利亚的日期已确认吗？', a: '截至 2026 年 10 月 28 日，本表尚未确认这三个国家的 2027/28 截止日期，因此保留 [待查]。请查看使馆或派遣单位本年度通知，不沿用往年日期。' },
      { q: '没有预录取材料可以提交吗？', a: '本次查阅的国家通知要求录取或预录取文件。可接受形式可能包括招生部门通知或合格的学院、导师邀请函，请先确认你的文件符合所选渠道要求。' },
      { q: 'CSCA 成绩可以截止后补交吗？', a: '不能自行假定可以。本次查阅的通知要求本科申请者在提交时持有有效成绩单，报考凭证不能替代。如时间紧张，请直接向受理单位说明情况。' },
      { q: '表里的日期适用于所有大学 Type B 吗？', a: '不适用。这里是指定国家受理渠道的日期，大学 Type B 项目另有时间安排，且可能要求独立入学申请。一个渠道的截止不会延长另一渠道的截止。' },
    ],
    howToSteps: [{ name: '查找本国通知', text: '确认学年、受理单位及全部提交截止要求。' }, { name: '取得录取证明', text: '向志愿大学申请所需录取或预录取文件。' }, { name: '备齐成绩与材料', text: '本科申请者须持有效 CSCA 成绩单，其余材料按官方清单准备。' }, { name: '完成两端手续', text: '按时完成 CSC 系统申请及本地门户、部委或纸质材料要求。' }],
    ctaTitle: '整理你的 CSC 申请清单', ctaSubtitle: 'SICA 可协助比较专业，安排大学录取与奖学金申请时间线。奖学金录取由受理单位及相关机构决定。', ctaApplyLabel: '评估我的留学选项', ctaContactLabel: '咨询申请时间线',
    related: [{ href: '/chinese-government-scholarship-csc', label: '中国政府奖学金指南', description: '资助、资格、申请渠道与各国截止日。' }, { href: '/guides/application', label: '中国大学申请流程', description: '与奖学金材料同步准备大学入学申请。' }, { href: '/csca-csc-scholarship', label: 'CSC 申请者的 CSCA 要求', description: '围绕奖学金截止日安排本科考试材料。' }],
  },
};
