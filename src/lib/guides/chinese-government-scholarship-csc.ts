import type { LocalizedGuide } from './types';

/**
 * "Chinese Government Scholarship (CSC)" — long-form process guide.
 * Target queries: "chinese government scholarship", "csc scholarship",
 * "csc scholarship application", "fully funded scholarship china",
 * "china scholarship for international students".
 *
 * Mostly static content (CSC rules are stable). Page wrapper fetches
 * the live scholarship list and surfaces the rows that look like
 * CSC-related programs (Government, Bilateral, etc.) into the
 * `cscholarships-table` block at render time.
 */
export const cscScholarshipGuide: LocalizedGuide = {
  en: {
    slug: 'chinese-government-scholarship-csc',
    eyebrow: 'GUIDE · CSC SCHOLARSHIP',
    title: 'Chinese Government Scholarship (CSC) — Full Funding for International Students (2026)',
    description:
      'The most prestigious fully-funded scholarship for international students in China — tuition, dorm, monthly stipend, and airfare. Eligibility, categories, application channels, deadline timeline.',
    subtitle:
      'A CSC scholarship fully funds your degree at any participating Chinese university — covering tuition, dorm, health insurance, a monthly stipend, and (for most categories) round-trip airfare. ~3,000 awards per year across all degree levels.',
    stats: [
      { value: '~3,000', label: 'CSC awards per year (all levels)' },
      { value: '¥2,500-3,500/mo', label: 'Monthly stipend' },
      { value: '4 channels', label: 'Application routes' },
      { value: 'June-start intake', label: 'For most universities' },
    ],
    quickAnswer:
      'The Chinese Government Scholarship (CSC), administered by the China Scholarship Council, is the most prestigious fully-funded scholarship for international students in China. It covers tuition, on-campus dorm, monthly stipend (¥2,500 undergrad / ¥3,000 master / ¥3,500 PhD), health insurance, and (for most categories) round-trip airfare. Apply 9-12 months before your target intake via one of four channels: (1) your home country\'s dispatching authority (embassy/consulate), (2) the host Chinese university\'s international student office, (3) a CSC overseas partner institution in your country, or (4) the China-Africa Friendship / ASEAN programs. Strong applicants have 70-90% acceptance at mid-tier universities; top-5 universities are more competitive.',
    keyTakeaways: [
      'CSC fully funds tuition + dorm + ¥2,500-3,500/month stipend + airfare',
      '~3,000 awards per year across all degree levels + disciplines',
      'Four application channels: embassy, university, partner institution, special programs',
      'Application deadline is typically January-April for September intake',
      'Strong applicants have 70-90% acceptance at mid-tier universities',
      'CSC can be combined with university-funded top-ups but not stacked with other full scholarships',
    ],
    sections: [
      {
        id: 'what-is-csc',
        h2: 'What is the Chinese Government Scholarship (CSC)?',
        intro:
          'The CSC scholarship program is administered by the China Scholarship Council (Ministry of Education) and has funded international students at Chinese universities since 1950. Today it is the largest single scholarship program for international students in China with ~3,000 awards per year.',
        blocks: [
          {
            type: 'p',
            text: 'CSC funding covers the full cost of studying in China for the duration of your degree program:',
          },
          {
            type: 'ul',
            items: [
              '**Tuition** — fully waived (¥30,000-80,000/year depending on program and university)',
              '**On-campus dorm** — provided (¥4,000-12,000/year value)',
              '**Monthly stipend** — ¥2,500 (bachelor), ¥3,000 (master), ¥3,500 (PhD), paid for the duration of your program',
              '**Health insurance** — comprehensive coverage provided (¥800/year value)',
              '**Settlement allowance** — one-time ¥1,500-3,000 upon arrival',
              '**Round-trip airfare** — provided for most categories (Bilateral Program, EU/US special programs)',
              '**Annual inter-city travel** — provided for select programs',
            ],
          },
          {
            type: 'h3',
            text: 'Why CSC is the most popular choice for international students',
            body:
              'Three reasons CSC dominates the China-scholarship conversation: (1) full funding across all degree levels — bachelor\'s, master\'s, PhD, and one-year training programs; (2) it can be used at any of the 290+ participating Chinese universities (from C9 League to regional universities); (3) it is portable — your scholarship travels with you if you change universities, though this requires CSC approval. Compare to university-specific scholarships (which lock you to one university) and provincial government scholarships (which lock you to one province).',
          },
        ],
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
            text: 'Most international students apply through the Chinese University Program (administered by their target university\'s international student office) or the Bilateral Program (administered through their home country\'s Chinese embassy). These two channels handle ~90% of CSC applications.',
          },
        ],
      },
      {
        id: 'csc-coverage',
        h2: 'What CSC covers — the full breakdown',
        intro:
          'CSC is fully-funded, but what does "fully-funded" mean in practice? Here is the dollar value of each component and the realistic total annual package.',
        blocks: [
          {
            type: 'table',
            caption: 'CSC scholarship coverage breakdown (annual, USD)',
            columns: ['Component', 'Bachelor', 'Master', 'PhD', 'Notes'],
            rows: [
              ['Tuition waiver', '$4,200-7,000', '$4,200-7,000', '$4,200-7,000', 'Varies by program + university'],
              ['On-campus dorm', '$560-1,700', '$560-1,700', '$560-1,700', 'Double room standard; single available'],
              ['Monthly stipend (¥/mo)', '¥2,500 ($350/mo)', '¥3,000 ($420/mo)', '¥3,500 ($490/mo)', 'Paid for 12 months/year'],
              ['Annual stipend total', '$4,200', '$5,000', '$5,900', '12 × monthly'],
              ['Health insurance', '$115', '$115', '$115', 'Comprehensive, China-wide coverage'],
              ['Settlement allowance (one-time)', '$210-420', '$210-420', '$210-420', 'Paid on arrival'],
              ['Round-trip airfare (Bilateral)', '$500-2,000', '$500-2,000', '$500-2,000', 'Reimbursed or booked by CSC'],
              ['TOTAL package (USD/yr)', '$9,800-12,000', '$10,600-13,000', '$11,500-13,500', 'Excludes airfare'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC + university top-up is a common stacking strategy. Many universities add their own scholarship on top of CSC (typically ¥1,000-3,000/month extra + research grants). Total monthly stipend after stacking: ¥5,000-7,000 — comparable to Western PhD stipends.',
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
        id: 'csc-timeline',
        h2: 'CSC application timeline (12 months before intake)',
        intro:
          'CSC follows a strict annual cycle. The application portal opens in January-April for September intake; spring intake (March) deadlines are typically August-October of the prior year.',
        blocks: [
          {
            type: 'table',
            caption: 'CSC application timeline — September intake',
            columns: ['Month', 'Action', 'Output'],
            rows: [
              ['Aug-Oct (year -1)', 'Shortlist target universities + programs', '3-5 target schools'],
              ['Sep-Nov', 'Take language test (IELTS/TOEFL/HSK)', 'Test scores ready'],
              ['Sep-Dec', 'Draft study plan + gather documents', 'Application package ready'],
              ['Nov-Jan', 'Submit university admission (parallel path)', 'University pre-admission'],
              ['Jan-Apr', 'CSC application portal opens', 'CSC application submitted'],
              ['Feb-May', 'Review by CSC + universities', 'Waiting period'],
              ['May-Jun', 'CSC results announced', 'Acceptance / rejection'],
              ['Jun-Jul', 'Receive admission notice + airfare booking', 'Pre-departure prep'],
              ['Aug-Sep', 'Arrive in China, begin program', 'Start of funded program'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: apply for admission to the target university FIRST (you need a pre-admission letter to attach to your CSC application in some channels), then submit CSC once admission is in hand. CSC deadlines are tight — submitting by mid-March is typical for the September intake.',
          },
        ],
      },
      {
        id: 'csc-channels',
        h2: 'The four CSC application channels',
        intro:
          'CSC has four primary application channels. The channel you use depends on your home country, your target university, and your academic profile. Pick the channel that maximizes your acceptance probability.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Home country\'s dispatching authority (Bilateral Program)** — Apply through your home country\'s Chinese embassy, consulate, or relevant ministry (Ministry of Education, scholarship agency). Best channel for: students from countries with active CSC bilateral agreements (most of Asia, Africa, Latin America). Application deadline: typically January-March for September intake. Apply early.',
              '**Host Chinese university (Chinese University Program)** — Apply through your target Chinese university\'s international student office. University nominates you to CSC for funding. Best channel for: students applying to specific universities with strong programs. Many universities have quotas; apply to 3-5 universities in parallel.',
              '**CSC overseas partner institution in your country** — Some Confucius Institutes, UNESCO national commissions, and partner universities nominate students to CSC. Best channel for: students with existing institutional connections.',
              '**Special programs (CAFP, ASEAN, MOFCOM, EU/US programs)** — Country-specific programs with separate application channels. Best channel for: students from targeted regions or professional programs. Each has its own deadline + eligibility.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Most international students apply through Channels 1 (Bilateral) or 2 (Chinese University). They are not mutually exclusive — many students apply through both to maximize chances. You can hold multiple CSC acceptances but must ultimately pick one.',
          },
        ],
      },
      {
        id: 'cscholarships-table',
        h2: 'CSC-tagged scholarships in the SICA catalog',
        intro:
          'The live scholarship list from the SICA database — filtered to entries that match the CSC program (Government Scholarship, Bilateral, China-Africa Friendship, etc.). Use this to see which scholarships your target school participates in.',
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
        a: 'Yes. CSC covers tuition (full waiver), on-campus dorm, monthly stipend (¥2,500-3,500 depending on degree level), health insurance, settlement allowance (one-time ¥1,500-3,000), and (for most channels) round-trip airfare. Total package value: ¥50,000-90,000/year (USD 7,000-13,000).',
      },
      {
        q: 'How much is the CSC monthly stipend?',
        a: 'CSC monthly stipends: ¥2,500 for bachelor\'s, ¥3,000 for master\'s, ¥3,500 for PhD. Most universities pay this in cash each month; a few pay quarterly. Top-up funding from universities can add ¥1,000-3,000/month extra to the base CSC stipend.',
      },
      {
        q: 'How competitive is CSC scholarship?',
        a: 'CSC acceptance rates vary by destination university. Mid-tier universities (ranked 100-300 in China): 70-90% acceptance for qualified applicants. Top-5 universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong, USTC): 10-25% acceptance. Top-20 universities: 25-50%. Strong academic record + clear study plan + supervisor pre-match (for PhD) typically yields 1-3 admits.',
      },
      {
        q: 'Can I apply for CSC after being admitted to a university?',
        a: 'Yes — apply for university admission first (rolling admissions start in November for September intake), then submit CSC application via the university (Chinese University Program channel) or via your embassy (Bilateral Program). Many students get admitted in March-April and submit CSC by mid-April deadline.',
      },
      {
        q: 'When does CSC open for fall intake?',
        a: 'CSC applications for September intake typically open in January and close by mid-April. The deadline varies slightly by channel: embassies often have January-March deadlines; universities often have February-April deadlines. Plan to submit by mid-March to be safe.',
      },
      {
        q: 'How many CSC scholarships are available per year?',
        a: 'Approximately 3,000 CSC awards per year across all degree levels, sub-programs, and countries. Per country allocations vary widely: large countries (India, Pakistan, Bangladesh, Russia, Thailand) get 100-300 awards; small countries get 5-20 awards. The Africa Friendship Program adds another 1,000+ awards per year across the 54 AU countries.',
      },
      {
        q: 'Do I need to apply through my home country\'s embassy?',
        a: 'Not necessarily. You can apply through your target Chinese university\'s international student office (Channel 2: Chinese University Program) instead of (or in addition to) your home embassy (Channel 1: Bilateral Program). Embassies have country quotas that may limit slots; universities have separate quotas. Applying through both maximizes your chances.',
      },
      {
        q: 'What if I fail to get CSC? Are there alternatives?',
        a: 'Three strong alternatives: (1) university-specific scholarships — most Chinese universities waive 50-100% of tuition for top applicants; (2) provincial government scholarships (Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong) — typically ¥20,000-50,000/year; (3) external scholarships from your home country (Fulbright, DAAD, Commonwealth) or international foundations (Gates, Rotary). Apply for all in parallel — they don\'t auto-apply.',
      },
    ],
    howToSteps: [
      {
        name: 'Shortlist 3-5 target universities + programs',
        text: 'Identify 3-5 Chinese universities with strong programs in your target field. For each, check: (a) does the program offer English-medium instruction? (b) what\'s the published tuition? (c) does the university accept CSC applicants? Most C9 League + ~30 strong research universities actively recruit CSC scholars.',
      },
      {
        name: 'Take the language test 6-9 months before applying',
        text: 'IELTS 5.5-6.5+ / TOEFL 60-90+ for English-medium programs. HSK 4+ for Chinese-medium. Most programs accept scores within 2 years. Book your test 6 months before the CSC deadline to allow retake if needed.',
      },
      {
        name: 'Draft study plan + gather documents',
        text: 'Study plan: 500-1,500 words: why China, why this program, why this university, career goals. Specific to your target university (mention faculty, labs, facilities). Documents: passport, transcripts (notarized English translation), 2-3 recommendation letters, language test scores, study plan, health certificate (post-acceptance).',
      },
      {
        name: 'Submit university admission FIRST (parallel path)',
        text: 'Apply to your target Chinese university via their international student portal. Most universities have rolling admissions from November for September intake. Submit 4-6 weeks before the CSC deadline — you need a pre-admission letter for some CSC channels.',
      },
      {
        name: 'Apply for CSC via one of four channels',
        text: 'Channel 1 (Bilateral): your home country\'s Chinese embassy or Ministry of Education — apply January-March. Channel 2 (Chinese University): target university\'s international student office — apply February-April. Channel 3 (partner institution): Confucius Institute, UNESCO. Channel 4 (special programs): CAFP, ASEAN, MOFCOM.',
      },
      {
        name: 'Wait for CSC results (May-June)',
        text: 'Results are typically announced 2-4 weeks after the application deadline. Successful applicants receive a CSC admission notice + the Admission Notice from the target university. Unsuccessful applicants can reapply the following cycle or accept the university offer without CSC funding.',
      },
      {
        name: 'Plan arrival + visa',
        text: 'Admitted CSC scholars receive an Admission Notice + Visa Application Form (JW201 for CSC, JW202 for non-CSC). Apply for an X1 visa at your local Chinese embassy. Book the CSC-funded airfare (or get reimbursed on arrival). Plan to arrive 1-2 weeks before orientation.',
      },
      {
        name: 'Activate CSC funding on arrival',
        text: 'On arrival, register at the university\'s international student office. CSC funds are typically disbursed monthly through the university finance office. First-month stipend may take 4-6 weeks to process. Keep your Admission Notice, JW201, and university enrollment confirmation for all CSC administrative tasks.',
      },
    ],
    ctaTitle: 'Ready to apply for the CSC scholarship?',
    ctaSubtitle:
      'SICA counselors help you identify the right CSC sub-program, draft a competitive application package, choose between embassy and university channels, and manage the parallel university admission + CSC timeline. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
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
    eyebrow: '指南 · CSC 奖学金',
    title: '2026 中国政府奖学金（CSC）—— 国际生全额资助',
    description:
      '面向国际生最负盛名的全额资助奖学金——学费、住宿、月津贴、机票。资格、类别、申请渠道、截止时间线。',
    subtitle:
      'CSC 奖学金全额资助你在任何参与中国大学的学位——学费、住宿、医疗保险、月津贴、（多数类别）含往返机票。每年约 3,000 个名额覆盖所有学位层级。',
    stats: [
      { value: '~3,000', label: '每年 CSC 名额（所有层级）' },
      { value: '¥2,500-3,500/月', label: '月津贴' },
      { value: '4 渠道', label: '申请路径' },
      { value: '9 月入学', label: '对应截止日 4 月' },
    ],
    quickAnswer:
      '中国政府奖学金（CSC）由国家留学基金管理委管理，是国际生最负盛名的全额资助奖学金。覆盖学费、校内住宿、月津贴（本科 ¥2,500 / 硕士 ¥3,000 / 博士 ¥3,500）、医疗保险、（多数类别）往返机票。在目标入学前 9-12 个月通过四个渠道之一申请：（1）本国派遣单位（使领馆），（2）接收中国大学国际学生办公室，（3）本国 CSC 海外合作机构，（4）中国-非洲友谊 / 东盟项目。强申请者在中档大学录取率 70-90%；前 5 大学更具竞争。',
    keyTakeaways: [
      'CSC 全额资助学费 + 住宿 + ¥2,500-3,500/月津贴 + 机票',
      '每年约 3,000 个名额覆盖所有学位层级 + 学科',
      '四个申请渠道：使馆、大学、合作机构、特殊项目',
      '申请截止日通常 1-4 月对应 9 月入学',
      '强申请者中档大学录取率 70-90%',
      'CSC 可与院校资助叠加，但不可与其他全额奖学金叠加',
    ],
    sections: [
      {
        id: 'what-is-csc',
        h2: '什么是中国政府奖学金（CSC）？',
        intro:
          'CSC 奖学金项目由国家留学基金管理委员会（教育部）管理，自 1950 年起资助国际生来华学习。如今是中国规模最大的国际生单一奖学金项目，每年约 3,000 个名额。',
        blocks: [
          {
            type: 'p',
            text: 'CSC 资助覆盖整个学位期间的完整留学成本：',
          },
          {
            type: 'ul',
            items: [
              '**学费**——全免（依项目与大学 ¥30,000-80,000/年）',
              '**校内住宿**——提供（¥4,000-12,000/年价值）',
              '**月津贴**——本科 ¥2,500、硕士 ¥3,000、博士 ¥3,500，覆盖整个项目期间',
              '**医疗保险**——综合保障（¥800/年价值）',
              '**安置费**——一次性 ¥1,500-3,000，抵华后发放',
              '**往返机票**——多数类别提供（双边项目、欧美特殊项目）',
              '**年度城际差旅**——部分项目提供',
            ],
          },
          {
            type: 'h3',
            text: '为什么 CSC 是国际生最热门选择',
            body:
            '三个理由：（1）所有学位层级全额资助——本科、硕士、博士、一年培训项目；（2）可用于 290+ 所参与中国大学的任何一所（C9 联盟至地方高校）；（3）可携带——奖学金随你转校（需 CSC 批准）。比较院校专属奖学金（锁在一所大学）与省市奖学金（锁在一个省）。',
          },
        ],
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
            text: '多数国际生通过中国大学项目（由目标大学国际学生办公室管理）或双边项目（由本国中国大使馆管理）申请。这两个渠道处理约 90% 的 CSC 申请。',
          },
        ],
      },
      {
        id: 'csc-coverage',
        h2: 'CSC 覆盖——完整明细',
        intro:
          'CSC 全额资助，但"全额"实际意味着什么？下面列出每项的美元价值与实际年度总价值。',
        blocks: [
          {
            type: 'table',
            caption: 'CSC 奖学金覆盖明细（年度，美元）',
            columns: ['项目', '本科', '硕士', '博士', '备注'],
            rows: [
              ['学费全免', '$4,200-7,000', '$4,200-7,000', '$4,200-7,000', '因项目 + 大学而异'],
              ['校内住宿', '$560-1,700', '$560-1,700', '$560-1,700', '标准双人间；可申请单人间'],
              ['月津贴（¥/月）', '¥2,500（$350/月）', '¥3,000（$420/月）', '¥3,500（$490/月）', '每年支付 12 个月'],
              ['年度津贴合计', '$4,200', '$5,000', '$5,900', '12 × 月津贴'],
              ['医疗保险', '$115', '$115', '$115', '综合、全国覆盖'],
              ['安置费（一次性）', '$210-420', '$210-420', '$210-420', '抵华后发放'],
              ['往返机票（双边）', '$500-2,000', '$500-2,000', '$500-2,000', '报销或 CSC 代订'],
              ['总包价值（美元/年）', '$9,800-12,000', '$10,600-13,000', '$11,500-13,500', '不含机票'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC + 院校追加是常见叠加策略。许多大学在 CSC 基础上再加自有奖学金（通常 ¥1,000-3,000/月额外 + 科研经费）。叠加后月津贴合计 ¥5,000-7,000——与西方博士津贴持平。',
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
        id: 'csc-timeline',
        h2: 'CSC 申请时间线（入学前 12 个月）',
        intro:
          'CSC 遵循严格年度周期。申请门户每年 1-4 月开放对应 9 月入学；春季入学（3 月）的截止日通常在前一年的 8-10 月。',
        blocks: [
          {
            type: 'table',
            caption: 'CSC 申请时间线——9 月入学',
            columns: ['月份', '动作', '产出'],
            rows: [
              ['8-10 月（前一年）', '筛选目标大学 + 项目', '3-5 所目标校'],
              ['9-11 月', '备考语言（雅思/托福/HSK）', '语言成绩就绪'],
              ['9-12 月', '起草学习计划 + 收集材料', '申请包就绪'],
              ['11-1 月', '提交大学入学（并行路径）', '大学预录取'],
              ['1-4 月', 'CSC 申请门户开放', 'CSC 申请提交'],
              ['2-5 月', 'CSC + 大学评审', '等待期'],
              ['5-6 月', 'CSC 结果公布', '录取 / 拒录'],
              ['6-7 月', '收到录取通知 + 机票', '出发前准备'],
              ['8-9 月', '抵华，开课', '资助项目开始'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：先申请目标大学入学（部分 CSC 渠道需附预录取函），获得录取后再提交 CSC。3 月中旬提交是 9 月入学的典型时间。',
          },
        ],
      },
      {
        id: 'csc-channels',
        h2: 'CSC 四大申请渠道',
        intro:
          'CSC 有四个主要申请渠道。选择哪个取决于你的祖国、目标大学、学术身份。选择能最大化录取概率的渠道。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**本国派遣单位（双边项目）**——通过本国中国大使馆、领事馆或相关部委（教育部、奖学金机构）申请。最适合：与中国签有活跃 CSC 双边协定的国家（多数亚洲、非洲、拉美）。截止日通常 1-3 月对应 9 月入学。尽早申请。',
              '**接收中国大学（中国大学项目）**——通过目标中国大学国际学生办公室申请。大学提名你给 CSC 资助。最适合：申请特定大学强项目的学生。许多大学有名额限制；并行申请 3-5 所。',
              '**本国 CSC 海外合作机构**——部分孔子学院、UNESCO 国家委员会、合作大学提名学生给 CSC。最适合：有现成机构联系的学生。',
              '**特殊项目（CAFP、ASEAN、MOFCOM、欧美项目）**——针对特定地区或专业项目的国别项目，各有截止日 + 资格。最适合：目标地区或专业项目学生。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '多数国际生申请渠道 1（双边）或渠道 2（中国大学）。两者不互斥——许多学生同时申请以最大化机会。可持有多个 CSC 录取，但最终只能选其一。',
          },
        ],
      },
      {
        id: 'cscholarships-table',
        h2: 'SICA 目录中的 CSC 相关奖学金',
        intro:
          '来自 SICA 数据库的实时奖学金清单——筛选匹配 CSC 项目的条目（政府奖学金、双边、中非友谊等）。用此查看目标学校参与哪些奖学金。',
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
        a: '是。CSC 覆盖学费（全免）、校内住宿、月津贴（¥2,500-3,500 视学位而定）、医疗保险、安置费（一次性 ¥1,500-3,000）、（多数渠道）往返机票。总包价值：¥50,000-90,000/年（7,000-13,000 美元）。',
      },
      {
        q: 'CSC 月津贴多少？',
        a: 'CSC 月津贴：本科 ¥2,500、硕士 ¥3,000、博士 ¥3,500。多数大学按月现金发放；少数按季发放。大学追加资助可再加 ¥1,000-3,000/月。',
      },
      {
        q: 'CSC 奖学金多大竞争？',
        a: 'CSC 录取率随目标大学变化。中档大学（中国排名 100-300）：合格申请者录取率 70-90%。前 5 大学（清华、北大、复旦、上海交大、中科大）：录取率 10-25%。前 20 大学：25-50%。强学术记录 + 清晰学习计划 + 导师预匹配（博士）通常带来 1-3 个录取。',
      },
      {
        q: '可以录取后申请 CSC 吗？',
        a: '可以——先申请大学入学（11 月起滚动录取对应 9 月入学），再通过大学（中国大学项目渠道）或本国大使馆（双边项目）提交 CSC。多数学生 3-4 月获录取，4 月中前提交 CSC。',
      },
      {
        q: 'CSC 秋季入学何时开放？',
        a: '9 月入学的 CSC 申请通常 1 月开放，4 月中前截止。截止日因渠道略有差异：使馆通常 1-3 月截止；大学通常 2-4 月截止。建议 3 月中旬前提交以确保安全。',
      },
      {
        q: '每年 CSC 奖学金多少名额？',
        a: '每年约 3,000 个 CSC 名额覆盖所有学位层级、子项目与国家。各国配额差异大：大国（印度、巴基斯坦、孟加拉、俄罗斯、泰国）获 100-300 名；小国 5-20 名。中非友谊项目在 54 个非成员国之间再加 1,000+ 名。',
      },
      {
        q: '需要通过本国大使馆申请吗？',
        a: '不一定。可通过目标中国大学国际学生办公室（渠道 2：中国大学项目）而非（或加上）本国大使馆（渠道 1：双边项目）申请。使馆有国家配额可能限制名额；大学有单独配额。两者并行申请可最大化机会。',
      },
      {
        q: '如果 CSC 失败，有替代方案吗？',
        a: '三个强替代：（1）院校奖学金——多数中国大学为顶尖申请者减免 50-100% 学费；（2）省市奖学金（北京、上海、江苏、浙江、广东）——通常 ¥20,000-50,000/年；（3）本国奖学金（Fulbright、DAAD、Commonwealth）或国际基金会（盖茨、扶轮）。并行申请——不会自动申请。',
      },
    ],
    howToSteps: [
      {
        name: '筛选 3-5 所目标大学 + 项目',
        text: '确定 3-5 所目标领域的强项目中国大学。对每所检查：（a）项目是否英文授课？（b）公布学费多少？（c）大学是否接收 CSC 申请？多数 C9 联盟 + ~30 所强研究型大学积极招收 CSC 学者。',
      },
      {
        name: '提前 6-9 个月备考语言',
        text: '雅思 5.5-6.5+ / 托福 60-90+（英文授课）。HSK 4+（中文授课）。多数项目接受 2 年内成绩。CSC 截止日前 6 个月报考以允许重考。',
      },
      {
        name: '起草学习计划 + 收集材料',
        text: '学习计划：500-1,500 字：为何中国、为何该项目、为何该校、职业目标。针对目标大学定制（提及教师、实验室、设施）。材料：护照、成绩单（公证英文翻译）、2-3 封推荐信、语言成绩、学习计划、体检证明（录取后）。',
      },
      {
        name: '先提交大学入学（并行路径）',
        text: '通过目标中国大学的国际学生门户申请。多数大学从 11 月起滚动录取对应 9 月入学。CSC 截止日前 4-6 周提交——部分 CSC 渠道需预录取函。',
      },
      {
        name: '通过四大渠道之一申请 CSC',
        text: '渠道 1（双边）：本国中国大使馆或教育部——1-3 月申请。渠道 2（中国大学）：目标大学国际学生办公室——2-4 月申请。渠道 3（合作机构）：孔子学院、UNESCO。渠道 4（特殊项目）：CAFP、ASEAN、MOFCOM。',
      },
      {
        name: '等待 CSC 结果（5-6 月）',
        text: '通常截止日后 2-4 周公布结果。录取者获 CSC 录取通知 + 目标大学录取通知。未录取者可下一周期重新申请或接受无 CSC 资助的大学录取。',
      },
      {
        name: '规划抵达 + 签证',
        text: 'CSC 学者获录取通知 + 签证申请表（CSC 为 JW201，非 CSC 为 JW202）。在本国中国大使馆申请 X1 签证。预订 CSC 资助机票（或抵华后报销）。建议开学前 1-2 周抵达。',
      },
      {
        name: '抵华后激活 CSC 资助',
        text: '抵华后在大学国际学生办公室注册。CSC 资助通常通过大学财务处按月发放。首月津贴可能需 4-6 周处理。保留录取通知、JW201、大学注册确认以便所有 CSC 行政事务使用。',
      },
    ],
    ctaTitle: '准备好申请 CSC 奖学金了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你识别合适的 CSC 子项目、起草有竞争力的申请包、在使馆与大学渠道间选择、并管理并行大学录取 + CSC 时间线。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
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
