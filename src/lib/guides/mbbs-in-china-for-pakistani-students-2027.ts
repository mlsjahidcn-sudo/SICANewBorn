import type { LocalizedGuide } from './types';

/**
 * MBBS in China 2027 — home recognition for PK / BD / NG.
 * Target query: "mbbs in china for pakistani students 2027".
 *
 * PM&DC public notice (31 July 2026, Letter 1220): Pakistani nationals
 * graduating from foreign medical/dental institutes are eligible for
 * the National Registration Examination (NRE) only if the primary
 * qualification is from an institution recognized by ECFMG; Afghanistan
 * institutes are called out as presently not in that framework.
 * https://www.pmdc.pk/Documents/Others/Letter%201220%20Public%20Notice%20regarding%20eligibility%20of%20Pakistani%20nationals%20graduating%20from%20foreign%20Institutes%20for%20NRE.pdf
 */
export const mbbsPakistaniStudents2027Guide: LocalizedGuide = {
  en: {
    slug: 'mbbs-in-china-for-pakistani-students-2027',
    eyebrow: 'GUIDE · MBBS · 2027',
    title: 'MBBS in China for Pakistani Students 2027: Will the Degree Be Recognised at Home?',
    description:
      'MBBS in China 2027 for Pakistani, Bangladeshi and Nigerian students: PMDC NRE + ECFMG rule, BMDC, MDCN, and how to pick an MOE-listed university that keeps the route open.',
    seoTitle: 'MBBS in China for Pakistani Students 2027 | SICA',
    seoDescription:
      'Will a China MBBS be recognised in Pakistan, Bangladesh or Nigeria? PMDC NRE/ECFMG, BMDC, MDCN, and MOE-listed university choice for 2027.',
    subtitle:
      'Recognition is a two-gate problem: China must award a legitimate English clinical degree (MOE-listed + WDOMS), then your home council must let you sit its licensing exam. For Pakistan, PM&DC’s July 2026 notice ties NRE eligibility to **ECFMG-recognised** foreign institutes.',
    stats: [
      { value: 'PM&DC', label: 'Pakistan — NRE + ECFMG rule' },
      { value: 'BM&DC', label: 'Bangladesh licensing path' },
      { value: 'MDCN', label: 'Nigeria licensing path' },
      { value: 'MOE list', label: 'China English MBBS gate' },
    ],
    quickAnswer:
      'A China **MBBS** can lead to practice at home **only if** you graduate from a university that sits on China’s **MOE English clinical-medicine list** (and appears in WDOMS), **and** you later pass your home regulator’s exam — **PM&DC NRE** (Pakistan), **BM&DC** processes (Bangladesh), or **MDCN** requirements (Nigeria). PM&DC’s public notice dated **31 July 2026** states that Pakistani nationals are eligible for the NRE only when the foreign primary qualification comes from an **ECFMG-recognised** institution; it also warns that Afghanistan institutes are presently outside that framework. Before you pay a deposit for 2027 intake, verify: current MOE list → WDOMS/ECFMG status → your council’s latest foreign-graduate rules.',
    keyTakeaways: [
      'China gate: only MOE-listed schools may teach English MBBS to internationals',
      'Pakistan gate: PM&DC NRE eligibility requires ECFMG-recognised foreign institutes (notice 31 Jul 2026)',
      'Bangladesh / Nigeria: confirm BM&DC / MDCN foreign-graduate rules for your graduation year',
      'CSCA is an admission test — it does not replace NRE / BMDC / MDCN exams',
      'Reject non-listed “English MBBS” offers; they break the recognition chain',
    ],
    sections: [
      {
        id: 'pakistan-pmdc',
        h2: 'Pakistan (PM&DC): NRE and the ECFMG rule',
        intro: 'This is the rule Pakistani applicants must design around for 2027.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Regulator** — Pakistan Medical & Dental Council (PM&DC)',
              '**Exam** — National Registration Examination (NRE) after a foreign primary medical/dental qualification',
              '**ECFMG filter** — PM&DC notice (31 July 2026, Letter 1220) reiterates Council policy (24 July 2025): only qualifications from **ECFMG-recognised** foreign institutes qualify for NRE eligibility (other requirements still apply)',
              '**Afghanistan warning** — the same notice states Afghan medical/dental institutes are presently not in the ECFMG-recognised set; graduates are not eligible for NRE via that path',
              '**China implication** — choose an MOE-listed English MBBS school that remains in WDOMS and meets ECFMG’s recognition framework for the years you study; re-check before each deposit and before graduation',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'PM&DC public notice — foreign graduates & NRE (PDF)',
                href: 'https://www.pmdc.pk/Documents/Others/Letter%201220%20Public%20Notice%20regarding%20eligibility%20of%20Pakistani%20nationals%20graduating%20from%20foreign%20Institutes%20for%20NRE.pdf',
              },
              { label: 'MOE-listed MBBS universities in China', href: '/moe-listed-mbbs-universities-china' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'PM&DC states it will not entertain exemption requests from the prescribed eligibility requirements. University marketing cannot override the notice.',
          },
        ],
      },
      {
        id: 'bangladesh-nigeria',
        h2: 'Bangladesh (BM&DC) and Nigeria (MDCN)',
        intro: 'Different councils, same planning habit: verify before you enroll.',
        blocks: [
          {
            type: 'table',
            caption: 'Home licensing routes after a China MBBS',
            columns: ['Country', 'Council', 'What to verify for 2027 intake'],
            rows: [
              [
                'Pakistan',
                'PM&DC',
                'NRE eligibility + ECFMG-recognised institute status for your Chinese school',
              ],
              [
                'Bangladesh',
                'BM&DC',
                'Foreign medical graduate registration / exam rules; MOE-listed + WDOMS baseline',
              ],
              [
                'Nigeria',
                'MDCN',
                'Foreign graduate assessment / exam pathway; school must remain acceptable for the years you study',
              ],
            ],
          },
          {
            type: 'p',
            text: 'BM&DC and MDCN publish their own circulars. Treat any agent claim of “automatic licence” as false — you still sit the home exam and meet documentation rules after graduation.',
          },
        ],
      },
      {
        id: 'choose-university',
        h2: 'How to choose a university that keeps the route open',
        intro: 'A five-check filter before application fees.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**On the current MOE English MBBS list?** If no, stop.',
              '**In WDOMS under the correct school name?** Match spelling to the offer letter.',
              '**ECFMG / FAIMER pathway status acceptable for your council?** Especially critical for PM&DC NRE planning.',
              '**CSCA subjects published?** Math plus Chemistry/Physics as required — sit Nov/Dec 2026 or Jan 2027 for Sept 2027 intake.',
              '**Internship & English clinical years clear in the brochure?** Regulators care about the full primary qualification, not marketing photos.',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'MBBS in China — full guide', href: '/mbbs-in-china' },
              { label: 'CSCA for MBBS applicants', href: '/csca-mbbs-applicants' },
              { label: 'China vs Russia MBBS', href: '/study-in-china-vs-russia-for-mbbs' },
            ],
          },
        ],
      },
      {
        id: 'two-gates',
        h2: 'Do not confuse CSCA with licensing',
        intro: 'Students mix up China’s admission exam with home registration.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSCA** — Chinese university admission gate for bachelor’s (including MBBS) from 2026',
              '**NRE / BM&DC / MDCN exams** — home practice gates after graduation',
              'Passing CSCA does not reduce licensing exams; failing to pick a recognised school can make home exams unreachable',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Will MBBS in China be recognised in Pakistan in 2027?',
        a: 'It can be, if you graduate from an appropriate foreign institute under PM&DC rules — including the ECFMG-recognition requirement for NRE eligibility in the 31 July 2026 public notice — and you pass the NRE plus other PM&DC requirements. Always re-check PM&DC before you enroll and before you graduate.',
      },
      {
        q: 'What did the PM&DC July 2026 notice say?',
        a: 'Only Pakistani nationals whose primary medical or dental qualification is from an ECFMG-recognised foreign institution are eligible to sit the NRE (subject to other requirements). It specifically warns that Afghanistan institutes are presently outside that framework.',
      },
      {
        q: 'Is every MOE-listed China MBBS automatically ECFMG-recognised?',
        a: 'Do not assume. Confirm the specific university’s status in the directories your council relies on (WDOMS / ECFMG framework) for the years you will study. Re-verify annually.',
      },
      {
        q: 'What about Bangladesh and Nigeria?',
        a: 'Plan for BM&DC (Bangladesh) and MDCN (Nigeria) foreign-graduate pathways after an MOE-listed China MBBS. Each council’s circulars control eligibility — verify for your graduation year.',
      },
    ],
    howToSteps: [
      {
        name: 'Read your council’s latest notice',
        text: 'PM&DC / BM&DC / MDCN — screenshot the date and ECFMG or equivalent rules.',
      },
      {
        name: 'Shortlist only MOE-listed English MBBS schools',
        text: 'Cross-check WDOMS naming and ECFMG-framework status for Pakistan-bound students.',
      },
      {
        name: 'Sit CSCA on time',
        text: 'Book the subject combo each medical faculty requires for 2027 intake.',
      },
      {
        name: 'Keep evidence for licensing later',
        text: 'Save syllabi, internship letters, and attested degrees for NRE / BMDC / MDCN files.',
      },
    ],
    ctaTitle: 'Choosing a 2027 China MBBS that stays licence-eligible?',
    ctaSubtitle:
      'SICA counselors map MOE-listed schools against PM&DC / BM&DC / MDCN constraints before you pay a deposit. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/moe-listed-mbbs-universities-china',
        label: 'MOE-listed MBBS universities',
        description: 'The China-side permission list for English clinical medicine.',
      },
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China guide',
        description: 'Duration, tuition, CSCA, and application timeline.',
      },
      {
        href: '/csca-mbbs-applicants',
        label: 'CSCA for MBBS applicants',
        description: 'Admission exam — not your home licence exam.',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
  zh: {
    slug: 'mbbs-in-china-for-pakistani-students-2027',
    eyebrow: '指南 · MBBS · 2027',
    title: '2027 巴基斯坦学生赴华读 MBBS：学位回国能否被认可？',
    description:
      '2027 年巴基斯坦、孟加拉、尼日利亚学生赴华 MBBS：PMDC NRE + ECFMG 规则、BMDC、MDCN，以及如何选择能保持路径畅通的教育部名单大学。',
    seoTitle: '巴基斯坦学生 2027 中国 MBBS 认可 | SICA',
    seoDescription:
      '中国 MBBS 在巴基斯坦、孟加拉、尼日利亚能否认可？PMDC NRE/ECFMG、BMDC、MDCN 与 2027 择校。',
    subtitle:
      '认可是双闸门问题：中国须授予合法英文临床医学学位（教育部名单 + WDOMS），本国委员会还须允许你参加执照考试。对巴基斯坦而言，PM&DC 2026 年 7 月通知将 NRE 资格与 **ECFMG 认可** 院校挂钩。',
    stats: [
      { value: 'PM&DC', label: '巴基斯坦 — NRE + ECFMG' },
      { value: 'BM&DC', label: '孟加拉执照路径' },
      { value: 'MDCN', label: '尼日利亚执照路径' },
      { value: '教育部名单', label: '中国英文 MBBS 门槛' },
    ],
    quickAnswer:
      '中国 **MBBS** 只有在你毕业于教育部**英文临床医学名单**高校（并进入 WDOMS），**并且**通过本国监管考试——巴基斯坦 **PM&DC NRE**、孟加拉 **BM&DC**、尼日利亚 **MDCN**——后，才可能回国执业。PM&DC **2026 年 7 月 31 日**公告写明：巴基斯坦国民只有从 **ECFMG 认可**的境外院校获得基本医学/牙科学历，才有资格参加 NRE（仍须满足其他要求）；并警告阿富汗院校目前不在该框架内。2027 入学缴费前请核验：现行教育部名单 → WDOMS/ECFMG 状态 → 本国委员会最新留学生规则。',
    keyTakeaways: [
      '中国闸门：仅名单内高校可向国际学生英文讲授临床医学',
      '巴基斯坦闸门：NRE 资格要求 ECFMG 认可境外院校（2026-07-31 通知）',
      '孟加拉 / 尼日利亚：按毕业年确认 BM&DC / MDCN 外国毕业生规则',
      'CSCA 是入学考试——不能替代 NRE / BMDC / MDCN',
      '拒绝名单外“英文 MBBS”报价；它会打断认可链',
    ],
    sections: [
      {
        id: 'pakistan-pmdc',
        h2: '巴基斯坦（PM&DC）：NRE 与 ECFMG 规则',
        intro: '2027 年巴基斯坦申请人必须围绕这条规则设计路径。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**监管机构**——巴基斯坦医学与牙科委员会（PM&DC）',
              '**考试**——获得境外基本医学/牙科学历后的国家注册考试（NRE）',
              '**ECFMG 过滤**——PM&DC 通知（2026 年 7 月 31 日，Letter 1220）重申理事会政策（2025 年 7 月 24 日）：仅来自 **ECFMG 认可**境外院校的学历具备 NRE 资格（仍须满足其他要求）',
              '**阿富汗警示**——同一通知写明阿富汗医学/牙科院校目前不在 ECFMG 认可集合内；该路径毕业生不具备 NRE 资格',
              '**对中国的含义**——选择仍在 WDOMS、并符合你就读年份 ECFMG 认可框架的教育部名单英文 MBBS 高校；每次缴费与毕业前重新核对',
            ],
          },
          {
            type: 'links',
            items: [
              {
                label: 'PM&DC 公告——境外毕业生与 NRE（PDF）',
                href: 'https://www.pmdc.pk/Documents/Others/Letter%201220%20Public%20Notice%20regarding%20eligibility%20of%20Pakistani%20nationals%20graduating%20from%20foreign%20Institutes%20for%20NRE.pdf',
              },
              { label: '中国教育部 MBBS 名单高校', href: '/moe-listed-mbbs-universities-china' },
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'PM&DC 写明不会接受对既定资格要求的豁免、放宽或特殊通融。大学宣传不能凌驾于公告之上。',
          },
        ],
      },
      {
        id: 'bangladesh-nigeria',
        h2: '孟加拉（BM&DC）与尼日利亚（MDCN）',
        intro: '委员会不同，规划习惯相同：入学前核实。',
        blocks: [
          {
            type: 'table',
            caption: '中国 MBBS 后的本国执照路径',
            columns: ['国家', '委员会', '2027 入学须核实什么'],
            rows: [
              ['巴基斯坦', 'PM&DC', 'NRE 资格 + 中国高校的 ECFMG 认可状态'],
              ['孟加拉', 'BM&DC', '外国医学毕业生注册/考试规则；教育部名单 + WDOMS 基线'],
              ['尼日利亚', 'MDCN', '外国毕业生评估/考试路径；就读年份学校须持续可接受'],
            ],
          },
        ],
      },
      {
        id: 'choose-university',
        h2: '如何选择能保持路径畅通的大学',
        intro: '申请费缴纳前的五步过滤。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**是否在现行教育部英文 MBBS 名单？** 否 → 停止',
              '**WDOMS 校名是否正确？** 与录取函拼写一致',
              '**对本国委员会而言 ECFMG/FAIMER 路径是否可接受？** 对 PM&DC NRE 规划尤其关键',
              '**是否公布 CSCA 科目？** 数学 + 化学/物理按校要求——2027 年 9 月入学应参加 2026 年 11/12 月或 2027 年 1 月场次',
              '**实习与英文临床年是否写清？** 监管看重完整基本学历，而非宣传照',
            ],
          },
        ],
      },
      {
        id: 'two-gates',
        h2: '不要把 CSCA 当成执照考试',
        intro: '学生常把中国入学考与本国注册考混为一谈。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSCA**——自 2026 级起本科（含 MBBS）的中国大学入学闸门',
              '**NRE / BM&DC / MDCN 考试**——毕业后的本国执业闸门',
              '通过 CSCA 不会减免执照考试；选错学校可能让本国考试变得不可达',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '2027 年中国 MBBS 在巴基斯坦会被认可吗？',
        a: '可以，前提是你毕业于符合 PM&DC 规则的境外院校——包括 2026 年 7 月 31 日公告中的 ECFMG 认可要求——并通过 NRE 及其他 PM&DC 要求。入学与毕业前都请重新核对 PM&DC。',
      },
      {
        q: 'PM&DC 2026 年 7 月公告说了什么？',
        a: '只有从 ECFMG 认可境外院校获得基本医学或牙科学历的巴基斯坦国民，才有资格参加 NRE（仍须满足其他要求）。并特别警告阿富汗院校目前不在该框架内。',
      },
      {
        q: '教育部名单内的中国 MBBS 一定被 ECFMG 认可吗？',
        a: '不要默认。请按本国委员会依赖的名录（WDOMS / ECFMG 框架）确认具体大学在你就读年份的状态，并每年复核。',
      },
      {
        q: '孟加拉和尼日利亚呢？',
        a: '在教育部名单中国 MBBS 之后，规划 BM&DC（孟加拉）与 MDCN（尼日利亚）外国毕业生路径。资格以各委员会通告为准——按毕业年核实。',
      },
    ],
    howToSteps: [
      {
        name: '阅读本国委员会最新通知',
        text: 'PM&DC / BM&DC / MDCN——截图日期与 ECFMG 或同等规则。',
      },
      {
        name: '只初选教育部名单英文 MBBS 高校',
        text: '核对 WDOMS 命名，以及对巴基斯坦申请人的 ECFMG 框架状态。',
      },
      {
        name: '按时参加 CSCA',
        text: '按各医学院要求的科目组合报考 2027 入学场次。',
      },
      {
        name: '为日后执照留存证据',
        text: '保存教学大纲、实习证明与认证学历，备 NRE / BMDC / MDCN 材料。',
      },
    ],
    ctaTitle: '正在选 2027 年仍具备执照资格的中国 MBBS？',
    ctaSubtitle:
      'SICA 顾问在缴费前把教育部名单高校对照 PM&DC / BM&DC / MDCN 约束。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/moe-listed-mbbs-universities-china',
        label: '教育部 MBBS 名单高校',
        description: '中国侧英文临床医学许可名单。',
      },
      {
        href: '/mbbs-in-china',
        label: '中国 MBBS 指南',
        description: '学制、学费、CSCA 与申请时间线。',
      },
      {
        href: '/csca-mbbs-applicants',
        label: 'MBBS 申请人的 CSCA',
        description: '入学考试——不是本国执照考试。',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
};
