import type { LocalizedGuide } from './types';
import { cscDeadlineTrackerSection, CSC_DEADLINES_REVIEWED_AT, CSC_DEADLINES_PATH } from './csc-deadlines-2027-2028';

/**
 * "Chinese Government Scholarship (CSC)" — long-form process guide.
 * Target queries: "chinese government scholarship", "csc scholarship",
 * "csc scholarship application", "fully funded scholarship china",
 * "china scholarship for international students".
 *
 * Deadline and document notices reviewed for the 2027/2028 cycle. The page wrapper fetches
 * the live scholarship list and surfaces the rows that look like
 * CSC-related programs (Government, Bilateral, etc.) into the
 * `cscholarships-table` block at render time.
 */
export const cscScholarshipGuide: LocalizedGuide = {
  en: {
    slug: 'chinese-government-scholarship-csc',
    updatedAt: CSC_DEADLINES_REVIEWED_AT,
    eyebrow: 'GUIDE · CSC SCHOLARSHIP',
    title: "CSC Scholarship 2027/2028: Chinese Government Scholarship Guide",
    description:
      "CSC 2027/2028 guide: confirmed country deadlines, required admission documents, bachelor’s CSCA reports, eligibility and application routes.",
    seoTitle: "CSC Scholarship 2027/2028: Deadlines & Requirements | SICA",
    seoDescription: "Check CSC 2027/2028 country deadlines, admission-document and CSCA requirements. Timor-Leste closes before 20 December 2026; other dates vary.",
    subtitle:
      "Some 2027/2028 country channels opened in October 2026 and close in December or January. Use the official country notice and prepare admission evidence and bachelor’s CSCA reports before submission.",
    stats: [
      {
        value: "2027/28",
        label: "Scholarship academic year"
      },
      {
        value: "By country",
        label: "Official notice controls the deadline"
      },
      {
        value: "Admission evidence",
        label: "Required in reviewed country notices"
      },
      {
        value: "CSCA",
        label: "Score report required for bachelor’s applicants"
      }
    ],
    quickAnswer:
      "There is no single CSC 2027/2028 deadline. Reviewed country notices close before 20 December 2026 (Timor-Leste), on 20 January 2027 (South Sudan), 29 January (Maldives), and 31 January at 23:59 (Singapore). Bangladesh, Pakistan and Nigeria remain [Check]. These routes require university admission/pre-admission evidence and a valid CSCA score report for bachelor’s applicants. Type B university deadlines are separate.",
    keyTakeaways: [
      "Some 2027/2028 country channels close in December 2026; a general January–April estimate is not a safe deadline.",
      "Four reviewed country dates are confirmed below. Bangladesh, Pakistan and Nigeria remain [Check]; do not reuse last year’s cutoff.",
      "University admission or pre-admission evidence is required in the reviewed notices, rather than merely expected.",
      "Bachelor’s applicants need a valid CSCA score report; confirm subjects and result timing for your route.",
      "Check university Type B deadlines separately and complete any local delivery as well as the CSC online submission.",
      "Confirm coverage and restrictions on holding other scholarships in your specific channel notice."
    ],
    sections: [
      cscDeadlineTrackerSection('en'),
      {
        id: 'what-is-csc',
        h2: 'What is the Chinese Government Scholarship (CSC)?',
        intro:
          'The CSC scholarship program is administered by the China Scholarship Council (Ministry of Education) and has funded international students at Chinese universities since 1950. It is the largest single scholarship program for international students in China.',
        blocks: [
          {
            type: 'p',
            text: 'CSC funding covers the full cost of studying in China for the duration of your degree program:',
          },
          {
            type: 'ul',
            items: [
              '**Tuition** — fully waived',
              '**On-campus dorm** — provided',
              '**Monthly stipend** — paid for the duration of your program; exact amounts vary by degree level [verify against the current CSC notice]',
              '**Health insurance** — comprehensive coverage provided',
              '**Settlement allowance** — one-time payment upon arrival [verify amount against the current notice]',
              '**Round-trip airfare** — provided for most categories (Bilateral Program, EU/US special programs)',
            ],
          },
          {
            type: 'h3',
            text: 'Why CSC is the most popular choice for international students',
            body:
              'Three reasons CSC dominates the China-scholarship conversation: (1) full funding across degree levels — bachelor\'s, master\'s, PhD, and one-year training programs; (2) it can be used at participating Chinese universities across tiers (the exact count of participating universities changes each cycle [verify against the current notice]); (3) it is portable — your scholarship travels with you if you change universities, though this requires CSC approval. Compare to university-specific scholarships (which lock you to one university) and provincial government scholarships (which lock you to one province).',
          },
        ],
      },
      {
        id: "csca-requirement",
        h2: "CSCA score-report requirement for bachelor’s applicants",
        intro: "The reviewed 2027/2028 notices require bachelor’s applicants to have a valid CSCA score report when submitting. Ask the target university which subjects your major requires.",
        blocks: [
          {
            type: "p",
            text: "A booking confirmation is not a score report. A notice listing possible test months does not guarantee every sitting works for every deadline. Check registration and score-release dates, especially for Timor-Leste’s December cutoff and South Sudan’s 20 January deadline."
          },
          {
            type: "links",
            items: [
              {
                label: "Official CSCA examination and registration information",
                href: "https://www.csca.cn/"
              },
              {
                label: "Country deadline and document guide",
                href: "/csc-scholarship-deadlines-2027-2028#csca-score"
              }
            ]
          }
        ]
      },
      {
        id: "pre-admission-letter",
        h2: "Is admission or pre-admission evidence required?",
        intro: "Yes, for the four country channels reviewed here. Maldives and Singapore explicitly require at least one document from a preferred university. South Sudan and Timor-Leste’s attached checklist also require pre-admission material.",
        blocks: [
          {
            type: "p",
            text: "Accepted forms may include an admissions-office pre-admission notice or a school/supervisor invitation. Confirm whether your document qualifies; a generic application receipt is not automatically sufficient. Prepare university admission and scholarship documents in parallel, then submit the complete file. Pre-admission does not guarantee funding."
          },
          {
            type: "links",
            items: [
              {
                label: "Maldives official requirement",
                href: "https://mv.china-embassy.gov.cn/eng/sgsd/202610/t20261025_12046428.htm"
              },
              {
                label: "Singapore official requirement",
                href: "https://www.cscse.edu.cn/singapore/tzgg/2026102611241792506/index.html"
              },
              {
                label: "Timor-Leste official document checklist (PDF)",
                href: "https://tl.china-embassy.gov.cn/eng/xwdt/202610/P020261023499724359279.pdf"
              }
            ]
          }
        ]
      },
      {
        id: 'csc-categories',
        h2: 'CSC scholarship categories',
        intro:
          'The CSC program runs several sub-programs targeting different applicant pools. Each has slightly different benefits, eligibility, and application channels. Pick the category that fits your profile.',
        blocks: [
          {
            type: 'table',
            caption: 'CSC scholarship sub-programs compared',
            columns: ['Sub-program', 'For', 'Coverage', 'Application channel'],
            rows: [
              ['Bilateral Program', 'Students nominated by home country\'s dispatching authority', 'Full coverage + airfare', 'Home country\'s Chinese embassy'],
              ['Chinese University Program', 'Students at specific universities', 'Full coverage, no airfare', 'Target university\'s international student office'],
              ['Great Wall Program', 'Students from developing countries (UNESCO partner)', 'Full coverage', 'UNESCO national commission'],
              ['EU/US Special Programs', 'European / North American students', 'Full coverage + airfare', 'Special country-specific channels'],
              ['China-Africa Friendship Program (CAFP)', 'African Union member states', 'Full coverage + airfare + orientation', 'AU commission + home country ministry'],
              ['ASEAN Scholarship', 'ASEAN member states', 'Full coverage + airfare', 'ASEAN secretariat + home country ministry'],
              ['MOFCOM Scholarship', 'Developing-country professionals', 'Full coverage + airfare', 'Home country\'s MOFCOM office'],
              ['Confucius Institute Scholarship', 'Chinese language students', 'Full coverage + airfare (1-year program)', 'Confucius Institute / Class'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Most international students apply through the Chinese University Program (administered by their target university\'s international student office) or the Bilateral Program (administered through their home country\'s Chinese embassy). These two channels handle the majority of CSC applications [verify exact share against current CSC data].',
          },
        ],
      },
      {
        id: 'csc-coverage',
        h2: 'What CSC covers — the full breakdown',
        intro:
          'CSC is fully-funded, but what does "fully-funded" mean in practice? Here is each component. Exact figures change by cycle — verify against the current CSC notice before budgeting.',
        blocks: [
          {
            type: 'table',
            caption: 'CSC scholarship coverage breakdown [verify amounts against the current CSC notice]',
            columns: ['Component', 'Bachelor', 'Master', 'PhD', 'Notes'],
            rows: [
              ['Tuition waiver', 'Full', 'Full', 'Full', 'Varies by program + university'],
              ['On-campus dorm', 'Provided', 'Provided', 'Provided', 'Double room standard; single available'],
              ['Monthly stipend (CNY/mo)', '2,500 [verify]', '3,000 [verify]', '3,500 [verify]', 'Paid 12 months/year'],
              ['Health insurance', 'Provided', 'Provided', 'Provided', 'Comprehensive, China-wide coverage'],
              ['Settlement allowance (one-time)', 'Provided [verify]', 'Provided [verify]', 'Provided [verify]', 'Paid on arrival'],
              ['Round-trip airfare (Bilateral)', 'Most categories', 'Most categories', 'Most categories', 'Reimbursed or booked by CSC'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC + university top-up is a common stacking strategy. Many universities add their own scholarship on top of CSC (extra monthly stipend + research grants — amounts vary by university). CSC cannot be held simultaneously with other Chinese government scholarships (Confucius Institute, MOFCOM).',
          },
        ],
      },
      {
        id: 'csc-eligibility',
        h2: 'Eligibility and selection criteria',
        intro:
          'CSC eligibility is broad (most international students qualify) but selection is competitive. Strong applicants combine academic record, language proficiency, a clear study plan, and (for PhD/master\'s) a supervisor pre-match.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Citizenship** — non-Chinese citizen, in good physical and mental health. Age limits: bachelor\'s ≤25, master\'s ≤35, PhD ≤40 (varies by program). For PhD applicants: research proposal + supervisor pre-match is typical.',
              '**Academic record** — GPA 3.0+/4.0 (75%+) for most programs; top universities want 3.3+ (80%+). Bachelor\'s applicants need high school diploma with strong grades. PhD applicants: master\'s degree + research output (publications preferred).',
              '**Language proficiency** — IELTS 5.5-6.5+ / TOEFL 60-90+ for English-medium programs. HSK 4+ for Chinese-medium. Some programs (especially at master\'s level) waive language requirements for 4-year English-taught undergrads.',
              '**Study plan / personal statement** — 500-1,500 words: why China, why this program, why this university, career goals. Generic statements are auto-rejected; specific statements referencing faculty, labs, facilities get admitted.',
              '**Recommendation letters** — 2 letters minimum: 1 academic + 1 work/research. PhD/master\'s thesis track: 3 academic letters required, all from research supervisors who know your work.',
              '**Health certificate** — required for final admission; can be submitted after selection notification.',
              '**No dual Chinese citizenship** — applicants with both Chinese and foreign citizenship are disqualified; applies to naturalized citizens of other countries.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC cannot be held simultaneously with other Chinese government scholarships (Confucius Institute, MOFCOM). If you win multiple, you must pick one. CSC can be combined with university-funded top-ups and external international scholarships.',
          },
        ],
      },
      {
        id: "csc-timeline",
        h2: "How should I plan the CSC 2027/2028 timeline?",
        intro: "Some country channels were already open in October 2026. Do not wait until January to start or treat mid-March as a universal safe submission date.",
        blocks: [
          {
            type: "table",
            caption: "Plan backward from your receiving authority’s cutoff",
            columns: [
              "Stage",
              "Action",
              "Output"
            ],
            rows: [
              [
                "Now",
                "Read the current country notice and university requirements",
                "Record every applicable cutoff"
              ],
              [
                "Before the cutoff",
                "Obtain admission evidence, test reports and required documents",
                "Complete application file"
              ],
              [
                "Before the country deadline",
                "Complete CSC submission and local agency requirements",
                "Portal and delivery receipts"
              ],
              [
                "After submission",
                "Monitor correction, interview and outcome notices",
                "Follow the authority’s published schedule"
              ]
            ]
          },
          {
            type: "links",
            items: [
              {
                label: "Open the country deadline and document tracker",
                href: "/csc-scholarship-deadlines-2027-2028"
              }
            ]
          }
        ]
      },
      {
        id: "csc-channels",
        h2: "CSC application channels and their separate deadlines",
        intro: "Follow the rules of your chosen program. Do not mix country-channel deadlines or agency numbers with a university route.",
        blocks: [
          {
            type: "ul",
            items: [
              "**Country/dispatching-authority route (commonly Type A):** follow the embassy, ministry or dispatching authority’s notice, including local delivery where required.",
              "**University route (Type B):** check the target university’s 2027/28 admission and scholarship notices; a separate admission application may be required. The country table does not cover every university.",
              "**Partner-institution or special-program route:** check the nominating organisation’s program-specific eligibility, document list and cutoff.",
              "**Pakistan:** the 2027/28 date remains [Check] here. Monitor the new HEC and embassy notice instead of treating a previous December–January window as confirmed."
            ]
          }
        ]
      },
      {
        id: 'cscholarships-table',
        h2: 'CSC-tagged scholarships in the SICA catalog',
        intro:
          'Catalog entries can help you explore funding options, but they do not replace the 2027/2028 country notice. Use the country tracker above for the reviewed local deadlines and confirm any university-specific date with the school.',
        blocks: [
          {
            type: 'table',
            caption: 'Government and CSC-related scholarships in the SICA catalog',
            columns: ['Scholarship', 'Type', 'Coverage', 'Eligible regions', 'Deadline'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC is the umbrella program — most "Chinese Government Scholarship" entries you see on university websites are CSC awards. Talk to SICA to identify which CSC sub-program matches your profile + home country.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the Chinese Government Scholarship fully funded?',
        a: 'Yes. CSC covers tuition (full waiver), on-campus dorm, a monthly stipend by degree level, health insurance, a settlement allowance, and (for most channels) round-trip airfare. Exact stipend and allowance figures change by cycle — verify against the current CSC notice.',
      },
      {
        q: 'How much is the CSC monthly stipend?',
        a: 'Stipends are tiered by degree level — commonly cited as RMB 2,500 (bachelor\'s), RMB 3,000 (master\'s), RMB 3,500 (PhD) [verify against the current CSC notice]. Most universities pay monthly; a few pay quarterly. University top-up funding can add extra on top of the base CSC stipend.',
      },
      {
        q: 'How competitive is the CSC scholarship?',
        a: 'Competitiveness varies sharply by destination university and channel — mid-tier universities are materially less competitive than C9 schools, but we do not quote acceptance-rate percentages because no official per-university figures are published. What reliably moves outcomes: a strong academic record, a specific study plan referencing faculty and labs, and (for PhD) a supervisor pre-match.',
      },
      {
        q: 'Can I apply for CSC after being admitted to a university?',
        a: "Yes. The reviewed 2027/2028 country routes require university admission/pre-admission evidence before the scholarship application is submitted. Prepare both processes in parallel and confirm which university-issued documents your route accepts.",
      },
      {
        q: 'When does CSC open for the September 2027 intake?',
        a: "Some country channels were already open in October 2026. Their deadlines differ: before 20 December 2026 for Timor-Leste, 20 January 2027 for South Sudan, 29 January for Maldives, and 31 January at 23:59 for Singapore. Bangladesh, Pakistan and Nigeria remain [Check] in the tracker. Type B universities set separate dates.",
      },
      {
        q: 'Do bachelor\'s applicants need the CSCA for CSC?',
        a: "Yes. The reviewed notices require a valid CSCA score report at submission. Ask the university which subjects apply, then choose a sitting that releases results before your country deadline. A booking alone is insufficient; do not assume late score submission is permitted.",
      },
      {
        q: 'Do I need to apply through my home country\'s embassy?',
        a: 'Not necessarily. You can apply through your target Chinese university\'s international student office (Type B) instead of (or in addition to) your dispatching authority (Bilateral). Embassies have country allocations; universities have separate quotas. Applying through both maximizes your chances.',
      },
      {
        q: 'What if I fail to get CSC? Are there alternatives?',
        a: 'Three strong alternatives: (1) university-specific scholarships — most Chinese universities waive a large share of tuition for strong applicants; (2) provincial government scholarships (Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong); (3) external scholarships from your home country or international foundations. Apply for all in parallel — they don\'t auto-apply.',
      },
    ],
    howToSteps: [
      {
        name: "Confirm country and university deadlines",
        text: "Use the current 2027/28 notices and record separate CSC, local-delivery and university deadlines."
      },
      {
        name: "Obtain admission or pre-admission evidence",
        text: "Prepare university admission and scholarship documents in parallel. Confirm that your university-issued document is accepted."
      },
      {
        name: "Prepare reports and supporting documents",
        text: "Bachelor’s applicants need a valid CSCA report. Follow the country checklist for qualifications, translations, language evidence and applicable health/background documents."
      },
      {
        name: "Complete every required submission",
        text: "Use the correct category and agency number, finish both online and local requirements, and retain receipts."
      },
      {
        name: "Follow review and admission updates",
        text: "Monitor requests for corrections, interviews, outcomes and visa documents according to the official schedule."
      }
    ],
    ctaTitle: 'Ready to apply for the CSC scholarship?',
    ctaSubtitle:
      'SICA counselors help you identify the right CSC sub-program, draft a competitive application package, choose between embassy and university channels, and manage the parallel university admission + CSC timeline. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      { href: CSC_DEADLINES_PATH, label: "CSC 2027/2028 deadlines by country", description: "Confirmed notices, countries marked Check, and the application checklist." },
      {
        href: '/phd-in-china-international-students',
        label: 'PhD in China for international students',
        description: 'Fully-funded PhD packages, supervisor matching, and the 9-12 month application timeline.',
      },
      {
        href: '/guides/scholarships',
        label: 'Scholarships to study in China',
        description: 'CSC, Confucius, university-specific, and provincial scholarships — what each covers and how to apply.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'Every Chinese university ranked by domestic ranking + QS World — the canonical 2026 ranking.',
      },
    ],
  },
  zh: {
    slug: 'chinese-government-scholarship-csc',
    updatedAt: CSC_DEADLINES_REVIEWED_AT,
    eyebrow: '指南 · CSC 奖学金',
    seoTitle: "CSC 奖学金 2027/2028：截止日与要求 | SICA",
    seoDescription: "查看已确认国家截止日与申请要求。东帝汶须在 2026 年 12 月 20 日之前提交；部分国家日期待查。",
    title: "CSC 奖学金 2027/2028：中国政府奖学金申请指南",
    description:
      "CSC 2027/2028 申请指南：各国截止日、预录取材料、本科 CSCA 成绩要求、资格与申请渠道。",
    subtitle:
      "2027/2028 年度部分国家渠道已于 2026 年 10 月开放，最早须在 12 月提交。请按本国通知确认截止日，并提前准备录取材料与本科 CSCA 成绩。",
    stats: [
      {
        value: "2027/28",
        label: "奖学金学年"
      },
      {
        value: "因国而异",
        label: "以官方通知截止日为准"
      },
      {
        value: "录取材料",
        label: "已查阅国家渠道要求"
      },
      {
        value: "CSCA",
        label: "本科申请者需要成绩单"
      }
    ],
    quickAnswer:
      "CSC 没有全球统一的 2027/2028 截止日。已查阅通知中，东帝汶要求在 2026 年 12 月 20 日之前提交；南苏丹为 2027 年 1 月 20 日，马尔代夫为 1 月 29 日，新加坡为 1 月 31 日 23:59。孟加拉国、巴基斯坦、尼日利亚保留 [待查]。这些渠道要求大学录取或预录取文件，本科申请者还须持有效 CSCA 成绩单；大学 Type B 另查校方通知。",
    keyTakeaways: [
      "2027/2028 国家渠道截止可能早在 2026 年 12 月，不要套用“1—4 月”。",
      "下表四个国家日期已确认；孟加拉国、巴基斯坦、尼日利亚保持 [待查]，不沿用往年日期。",
      "本次查阅的国家通知要求大学录取或预录取材料，不应再标记为“预计需要”。",
      "本科申请须持有效 CSCA 成绩；考试科目及出分时间须匹配目标专业与本国截止。",
      "大学 Type B 的入学与奖学金申请另有截止日；完成网申不一定等于完成本地递交。",
      "资助与其他奖学金能否同时享受，应按具体渠道通知确认。"
    ],
    sections: [
      cscDeadlineTrackerSection('zh'),
      {
        id: 'what-is-csc',
        h2: '什么是中国政府奖学金（CSC）？',
        intro:
          'CSC 奖学金项目由国家留学基金管理委员会（教育部）管理，自 1950 年起资助国际生来华学习，是中国规模最大的国际生单一奖学金项目。',
        blocks: [
          {
            type: 'p',
            text: 'CSC 资助覆盖整个学位期间的完整留学成本：',
          },
          {
            type: 'ul',
            items: [
              '**学费**——全免',
              '**校内住宿**——提供',
              '**月津贴**——覆盖整个项目期间，按学位层级分档 [数额以当期 CSC 通知核实]',
              '**医疗保险**——综合保障',
              '**安置费**——抵华后一次性发放 [金额以当期通知核实]',
              '**往返机票**——多数类别提供（双边项目、欧美特殊项目）',
            ],
          },
          {
            type: 'h3',
            text: '为什么 CSC 是国际生最热门选择',
            body:
            '三个理由：（1）各学位层级全额资助——本科、硕士、博士、一年培训项目；（2）可用于参与项目的各层次中国大学（参与校数量逐期变化 [以当期通知核实]）；（3）可携带——奖学金随你转校（需 CSC 批准）。比较院校专属奖学金（锁在一所大学）与省市奖学金（锁在一个省）。',
          },
        ],
      },
      {
        id: "csca-requirement",
        h2: "本科申请者的 CSCA 成绩要求",
        intro: "已查阅的 2027/2028 通知要求本科申请者在提交时持有效 CSCA 成绩单，具体科目向目标大学确认。",
        blocks: [
          {
            type: "p",
            text: "报考凭证不能代替成绩单。通知提到某些考试月份，并不保证每场考试都能赶上每个国家的截止日。先核对官方报名与出分时间，尤其注意东帝汶 12 月截止和南苏丹 1 月 20 日截止。"
          },
          {
            type: "links",
            items: [
              {
                label: "CSCA 官方考试与报名信息",
                href: "https://www.csca.cn/"
              },
              {
                label: "各国截止日与成绩安排指南",
                href: "/csc-scholarship-deadlines-2027-2028#csca-score"
              }
            ]
          }
        ]
      },
      {
        id: "pre-admission-letter",
        h2: "必须提供录取或预录取材料吗？",
        intro: "本次核查的四个国家渠道均要求录取或预录取材料，不再仅是“预计需要”。马尔代夫和新加坡明确要求至少一所志愿大学出具文件；南苏丹和东帝汶附件也要求相关材料。",
        blocks: [
          {
            type: "p",
            text: "可接受形式可能包括大学招生部门预录取通知，或学院、导师邀请函。先向受理单位确认具体文件是否符合要求；普通申请回执不能自动替代。大学申请与奖学金材料准备应同步进行，并在所需证明齐备后提交。预录取不保证获得资助。"
          },
          {
            type: "links",
            items: [
              {
                label: "马尔代夫官方要求",
                href: "https://mv.china-embassy.gov.cn/eng/sgsd/202610/t20261025_12046428.htm"
              },
              {
                label: "新加坡官方要求",
                href: "https://www.cscse.edu.cn/singapore/tzgg/2026102611241792506/index.html"
              },
              {
                label: "东帝汶官方材料清单（PDF）",
                href: "https://tl.china-embassy.gov.cn/eng/xwdt/202610/P020261023499724359279.pdf"
              }
            ]
          }
        ]
      },
      {
        id: 'csc-categories',
        h2: 'CSC 奖学金类别',
        intro:
          'CSC 项目下设多个子项目对应不同申请者池。每个有微妙不同的资助、资格、申请渠道。选择适合你身份的类别。',
        blocks: [
          {
            type: 'table',
            caption: 'CSC 奖学金子项目对比',
            columns: ['子项目', '面向', '资助', '申请渠道'],
            rows: [
              ['双边项目', '本国派遣单位提名的学生', '全额 + 机票', '本国中国大使馆'],
              ['中国大学项目', '特定大学的学生', '全额，无机票', '目标大学国际学生办公室'],
              ['长城项目', '发展中国家学生（UNESCO 合作伙伴）', '全额', 'UNESCO 国家委员会'],
              ['欧盟/美国专项', '欧洲 / 北美学生', '全额 + 机票', '国别专项渠道'],
              ['中非友谊项目（CAFP）', '非盟成员国', '全额 + 机票 + 入学指导', '非盟委员会 + 本国部委'],
              ['东盟奖学金', '东盟成员国', '全额 + 机票', '东盟秘书处 + 本国部委'],
              ['MOFCOM 奖学金', '发展中国家专业人士', '全额 + 机票', '本国 MOFCOM 办公室'],
              ['孔子学院奖学金', '汉语学生', '全额 + 机票（1 年项目）', '孔子学院 / 课堂'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '多数国际生通过中国大学项目（由目标大学国际学生办公室管理）或双边项目（由本国中国大使馆管理）申请。这两个渠道处理大多数 CSC 申请 [确切占比以当期 CSC 数据核实]。',
          },
        ],
      },
      {
        id: 'csc-coverage',
        h2: 'CSC 覆盖——完整明细',
        intro:
          'CSC 全额资助，但"全额"实际意味着什么？下面逐项列出。具体数额逐期变化——做预算前以当期 CSC 通知核实。',
        blocks: [
          {
            type: 'table',
            caption: 'CSC 奖学金覆盖明细 [数额以当期 CSC 通知核实]',
            columns: ['项目', '本科', '硕士', '博士', '备注'],
            rows: [
              ['学费全免', '全额', '全额', '全额', '因项目 + 大学而异'],
              ['校内住宿', '提供', '提供', '提供', '标准双人间；可申请单人间'],
              ['月津贴（元/月）', '2,500 [待核实]', '3,000 [待核实]', '3,500 [待核实]', '每年支付 12 个月'],
              ['医疗保险', '提供', '提供', '提供', '综合、全国覆盖'],
              ['安置费（一次性）', '提供 [待核实]', '提供 [待核实]', '提供 [待核实]', '抵华后发放'],
              ['往返机票（双边）', '多数类别', '多数类别', '多数类别', '报销或 CSC 代订'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC + 院校追加是常见叠加策略。许多大学在 CSC 基础上再加自有奖学金（额外月津贴 + 科研经费，因校而异）。CSC 不可与孔子学院、MOFCOM 等其他中国政府奖学金同时持有。',
          },
        ],
      },
      {
        id: 'csc-eligibility',
        h2: '资格与选拔标准',
        intro:
          'CSC 资格宽（多数国际生符合）但选拔具竞争性。强申请者结合学术记录、语言、清晰学习计划、（博士/硕士）导师预匹配。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**国籍**——非中国公民，身心健康。年龄限制：本科 ≤25、硕士 ≤35、博士 ≤40（视项目而定）。博士申请人：通常需研究计划 + 导师预匹配。',
              '**学术记录**——多数项目 GPA 3.0+/4.0（75%+）；顶尖大学要 3.3+（80%+）。本科申请人需高中毕业证 + 强成绩。博士申请人：硕士学位 + 研究产出（发表优先）。',
              '**语言水平**——雅思 5.5-6.5+ / 托福 60-90+（英文授课）。HSK 4+（中文授课）。部分项目（尤其硕士）对 4 年英文授课本科免语言。',
              '**学习计划 / 个人陈述**——500-1,500 字：为何中国、为何该项目、为何该校、职业目标。通用 PS 会被自动拒；具体提及教师、实验室、设施的 PS 能录取。',
              '**推荐信**——至少 2 封：1 学术 + 1 工作/研究。博士/硕士论文轨道：需 3 封学术推荐信，均来自了解你工作的研究导师。',
              '**体检证明**——选拔通知后需提交，签证必需。',
              '**无双重中国国籍**——具有中外双重国籍的申请人（含已入籍他国的原中国公民）无资格。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC 不能与其他中国政府奖学金（孔子学院、MOFCOM）同时持有。若多个均获奖，须选其一。CSC 可与院校资助追加和外部国际奖学金叠加。',
          },
        ],
      },
      {
        id: "csc-timeline",
        h2: "2027/2028 申请应怎样安排时间？",
        intro: "部分国家渠道已于 2026 年 10 月开放，不要等到 2027 年 1 月才开始，也不要把 3 月中旬当作通用安全截止日。",
        blocks: [
          {
            type: "table",
            caption: "按所选渠道倒排时间",
            columns: [
              "阶段",
              "动作",
              "产出"
            ],
            rows: [
              [
                "现在",
                "阅读本国新通知及大学要求",
                "确认所有截止日"
              ],
              [
                "截止前",
                "申请录取文件，备齐考试成绩与其他材料",
                "完整申请包"
              ],
              [
                "本国截止前",
                "提交 CSC 网申并完成本地受理流程",
                "系统回执与递交凭证"
              ],
              [
                "提交后",
                "留意补件、面试与录取通知",
                "按官方进度跟进"
              ]
            ]
          },
          {
            type: "links",
            items: [
              {
                label: "查看各国截止日与材料清单",
                href: "/csc-scholarship-deadlines-2027-2028"
              }
            ]
          }
        ]
      },
      {
        id: "csc-channels",
        h2: "CSC 申请渠道与截止日的区别",
        intro: "以你申请的具体项目规则为准，不要混用国家渠道与大学渠道的日期或机构号。",
        blocks: [
          {
            type: "ul",
            items: [
              "**国家受理渠道（常见 A 类）：**按使馆、派遣单位或部委通知申请；南苏丹和东帝汶还要求本地材料递交。",
              "**大学渠道（Type B）：**查目标大学 2027/28 招生及奖学金通知，可能需独立入学申请；本表不代表所有大学截止日。",
              "**合作机构或专项项目：**按提名单位与项目通知确认资格、材料和截止。",
              "**巴基斯坦：**本表的 2027/28 日期保留 [待查]，关注 HEC 与使馆新通知，不套用去年 12—1 月的时间。"
            ]
          }
        ]
      },
      {
        id: 'cscholarships-table',
        h2: 'SICA 目录中的 CSC 相关奖学金',
        intro:
          '目录条目可用于了解资助选项，但不能替代 2027/2028 国家渠道通知。请使用上方截止日表，并向学校另查大学渠道日期。',
        blocks: [
          {
            type: 'table',
            caption: 'SICA 目录中的政府与 CSC 相关奖学金',
            columns: ['奖学金', '类型', '覆盖', '适格地区', '截止日'],
            rows: [['(从 SICA 数据库加载中…)', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC 是伞形项目——你在大学网站上看到的多数"中国政府奖学金"均为 CSC 奖项。联系 SICA 识别哪个 CSC 子项目匹配你的身份 + 祖国。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国政府奖学金全额资助吗？',
        a: '是。CSC 覆盖学费（全免）、校内住宿、按学位分档的月津贴、医疗保险、安置费、（多数渠道）往返机票。具体津贴与安置费数额逐期变化——以当期 CSC 通知核实。',
      },
      {
        q: 'CSC 月津贴多少？',
        a: '按学位层级分档——常见口径为本科 2,500 元、硕士 3,000 元、博士 3,500 元人民币 [以当期 CSC 通知核实]。多数大学按月发放；少数按季。大学追加资助可在 CSC 基础上再叠加。',
      },
      {
        q: 'CSC 奖学金多大竞争？',
        a: '竞争程度因目标大学与渠道差异很大——中档大学的竞争明显低于 C9，但我们不引用录取率百分比，因为没有官方的分校录取率数据。真正起作用的因素：强学术记录、具体提及教师与实验室的学习计划、（博士）导师预匹配。',
      },
      {
        q: '可以录取后申请 CSC 吗？',
        a: "可以。本次核查的 2027/2028 国家渠道要求在奖学金提交前持有大学录取或预录取证明。同步准备两端材料，并确认受理单位接受的文件形式。",
      },
      {
        q: '2027 年 9 月入学的 CSC 何时开放？',
        a: "部分国家渠道已在 2026 年 10 月开放。东帝汶须在 2026 年 12 月 20 日之前提交；南苏丹为 2027 年 1 月 20 日，马尔代夫为 1 月 29 日，新加坡为 1 月 31 日 23:59。孟加拉国、巴基斯坦、尼日利亚日期保留 [待查]；大学 Type B 日期另查。",
      },
      {
        q: '本科申请者需要 CSCA 吗？',
        a: "需要。本次核查通知要求提交时持有效成绩单。向大学确认科目，再选择能在本国截止前出分的场次。报考凭证不能替代正式成绩，也不能自行假定允许逾期补交。",
      },
      {
        q: '需要通过本国大使馆申请吗？',
        a: '不一定。可通过目标中国大学国际学生办公室（Type B）而非（或加上）本国派遣单位（双边项目）申请。使馆有国家配额；大学有单独配额。两者并行申请可最大化机会。',
      },
      {
        q: '如果 CSC 失败，有替代方案吗？',
        a: '三个强替代：（1）院校奖学金——多数中国大学为强申请者减免大比例学费；（2）省市奖学金（北京、上海、江苏、浙江、广东）；（3）本国奖学金（Fulbright、DAAD、Commonwealth）或国际基金会。并行申请——不会自动申请。',
      },
    ],
    howToSteps: [
      {
        name: "确认本国与大学截止日",
        text: "使用 2027/28 本年度通知，分别记录网申、本地递交与大学申请的截止要求。"
      },
      {
        name: "取得录取或预录取材料",
        text: "同步准备大学申请与奖学金材料，向受理单位确认文件形式。"
      },
      {
        name: "备齐成绩及材料",
        text: "本科须持有效 CSCA 成绩；其余材料按本国清单准备，注意语言、公证、体检及背景证明要求。"
      },
      {
        name: "按时完成所有提交手续",
        text: "使用正确项目类别与机构号，按时完成网申及本地材料递交，保留回执。"
      },
      {
        name: "跟进审核与录取",
        text: "及时查看补件、面试、录取与签证通知，以官方进度为准。"
      }
    ],
    ctaTitle: '准备好申请 CSC 奖学金了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你识别合适的 CSC 子项目、起草有竞争力的申请包、在使馆与大学渠道间选择、并管理并行大学录取 + CSC 时间线。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: CSC_DEADLINES_PATH, label: "CSC 2027/2028 各国截止日", description: "已确认通知、待查国家与材料清单。" },
      {
        href: '/phd-in-china-international-students',
        label: '中国博士项目（国际生）',
        description: '全额资助博士包、导师匹配、9-12 个月申请时间线。',
      },
      {
        href: '/guides/scholarships',
        label: '中国留学奖学金',
        description: 'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。',
      },
      {
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '所有中国大学按国内排名 + QS 世界排名——2026 标准排名表。',
      },
    ],
  },
};
