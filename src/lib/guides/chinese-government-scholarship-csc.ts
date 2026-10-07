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
    title: 'CSC Scholarship 2027: Chinese Government Scholarship Guide',
    description:
      'CSC (Chinese Government Scholarship) for 2027: what it covers, stipend, eligibility, the 4 application channels, deadlines by country, and the CSCA requirement for bachelor\'s applicants.',
    subtitle:
      'A CSC scholarship fully funds your degree at a participating Chinese university — covering tuition, dorm, health insurance, a monthly stipend, and (for most categories) round-trip airfare. Applications for the September 2027 intake run roughly January–April 2027, earlier via some country channels.',
    stats: [
      { value: 'Full ride', label: 'Tuition + dorm + stipend + insurance' },
      { value: 'Jan-Apr 2027', label: 'Main application window (varies)' },
      { value: '4 channels', label: 'Application routes' },
      { value: 'CSCA', label: 'Required for bachelor\'s applicants' },
    ],
    quickAnswer:
      'The Chinese Government Scholarship (CSC), administered by the China Scholarship Council, is the most prestigious fully-funded scholarship for international students in China. It covers tuition, on-campus dorm, a monthly stipend, health insurance, and (for most categories) round-trip airfare — check the current CSC notice for exact stipend figures [verify]. Apply 9-12 months before your target intake via one of four channels: your home country\'s dispatching authority, the host university (Type B), a CSC partner institution, or a special program. For the September 2027 intake, deadlines cluster in January–April 2027; the Pakistan HEC route closes earlier (December–January) [verify]. Bachelor\'s applicants: a CSCA score is now required for CSC scholarship undergraduate applications.',
    keyTakeaways: [
      'CSC covers tuition + dorm + monthly stipend + insurance; airfare for most categories (stipend amounts: verify against the current CSC notice)',
      'Four application channels: dispatching authority (embassy), university (Type B), partner institution, special programs',
      'For September 2027: Type B (university route) deadlines fall roughly January-April 2027 and vary by university [verify each target]; some country channels close earlier',
      'Pakistan: the HEC route (agency no. 5861) has a reported December-January deadline [verify] — sit the CSCA in November 2026 if you need a score',
      'Bachelor\'s applicants need a CSCA score for CSC scholarship applications (2026 and 2027 intakes); next sittings Nov/Dec 2026, Jan 2027',
      'A pre-admission letter from the host university is expected for 2026/27 onward [verify] — apply to universities in parallel, not after CSC',
      'CSC can be combined with university-funded top-ups but not stacked with other full scholarships',
    ],
    sections: [
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
        id: 'csca-requirement',
        h2: 'CSCA requirement for bachelor\'s applicants',
        intro:
          'Since the 2026 intake, CSC scholarship undergraduate applicants must submit a CSCA score — this is now a hard requirement, not a nice-to-have.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Who** — bachelor\'s (undergraduate) applicants to the Chinese Government Scholarship, for the 2026 and 2027 intakes',
              '**What** — the CSCA (China Scholastic Competency Assessment), organized by the China Scholarship Council: Math is required for everyone; Physics and/or Chemistry depend on the university and program',
              '**When** — the exam runs 6 sittings a year, mainly online at home with a live proctor. Next confirmed: 14–15 Nov 2026 (register 15–21 Oct, Beijing time), 19–20 Dec 2026, 23–24 Jan 2027',
              '**Planning rule** — because CSC deadlines cluster in January–April 2027, sit the November or December 2026 sitting at the latest; see our CSCA exam dates guide',
              '**Beyond CSC** — many universities, including many English-taught MBBS programs, require the CSCA even for self-funded applicants; universal adoption by 2028 is reported [verify]',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'A CSC scholarship file without a CSCA score is incomplete for bachelor\'s applicants — no score, no consideration. Free practice tests and study plans for every sitting: https://cscaprep.academy',
          },
        ],
      },
      {
        id: 'pre-admission-letter',
        h2: 'The pre-admission letter',
        intro:
          'For 2026/27 onward, CSC applications are expected to include a pre-admission letter from the host university [verify against the current CSC notice and your channel\'s requirements].',
        blocks: [
          {
            type: 'ul',
            items: [
              '**What it is** — a document from the host university\'s international student office stating you are pre-admitted (or under review) for the program you listed on the CSC application',
              '**Why it matters** — the Type B (university) route has always effectively required it; the expectation now extends to other channels [verify]',
              '**How to get one** — apply to the university\'s international admission portal in parallel with (not after) your CSC preparation; universities issue pre-admission letters on rolling review from late in the prior year',
              '**Timing** — start university applications by November–December 2026 for the September 2027 intake so the letter exists before CSC deadlines in January–April 2027',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Run the university application and the CSC application as parallel tracks. Waiting for one before starting the other is the most common way applicants miss the January-April window.',
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
        id: 'csc-timeline',
        h2: 'CSC application timeline (12 months before intake)',
        intro:
          'CSC follows a strict annual cycle. Applications for the September 2027 intake open in January 2027 and close January–April 2027 depending on the channel — the deadline, not the opening, is what you plan around.',
        blocks: [
          {
            type: 'table',
            caption: 'CSC application timeline — September 2027 intake',
            columns: ['When', 'Action', 'Output'],
            rows: [
              ['Aug-Oct 2026', 'Shortlist target universities + programs', '3-5 target schools'],
              ['Sep-Nov 2026', 'Take language test (IELTS/TOEFL/HSK); bachelor\'s applicants sit the CSCA (Nov 14-15 or Dec 19-20)', 'Test scores ready'],
              ['Sep-Dec 2026', 'Draft study plan + gather documents; start university applications', 'Application package + pre-admission in progress'],
              ['Nov 2026-Jan 2027', 'University applications under review (parallel path)', 'Pre-admission letter [expected for 2026/27 onward — verify]'],
              ['Jan 2027', 'CSC application window opens (portal + channels)', 'CSC application submitted'],
              ['Jan-Apr 2027', 'Channel deadlines close (varies by channel + country)', 'All submissions done'],
              ['Feb-May 2027', 'Review by CSC + universities', 'Waiting period'],
              ['May-Jun 2027', 'CSC results announced', 'Acceptance / rejection'],
              ['Jun-Jul 2027', 'Receive admission notice + JW201 + airfare booking', 'Pre-departure prep'],
              ['Aug-Sep 2027', 'Arrive in China, begin program', 'Start of funded program'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: apply for admission to the target university FIRST (a pre-admission letter is expected for 2026/27 CSC applications [verify]), then submit CSC once the letter is in hand. Deadlines are tight — submitting by mid-March 2027 is typical for the September intake.',
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
              '**Home country\'s dispatching authority (Bilateral Program)** — Apply through your home country\'s Chinese embassy, consulate, or relevant ministry. Best channel for: students from countries with active CSC bilateral agreements (most of Asia, Africa, Latin America). Deadlines: often the earliest, sometimes January-March for September intake. **Pakistan**: the HEC route (agency no. 5861) is reported to close as early as December-January [verify on HEC.gov.pk] — sit the CSCA in November 2026 if you need a score.',
              '**Host Chinese university (Type B / Chinese University Program)** — Apply through your target Chinese university\'s international student office. University nominates you to CSC for funding. Best channel for: students applying to specific universities with strong programs. Deadlines: roughly January-April 2027 and vary by university [verify each target]; apply to 3-5 universities in parallel.',
              '**CSC overseas partner institution in your country** — Some Confucius Institutes, UNESCO national commissions, and partner universities nominate students to CSC. Best channel for: students with existing institutional connections.',
              '**Special programs (CAFP, ASEAN, MOFCOM, EU/US programs)** — Country-specific programs with separate application channels. Best channel for: students from targeted regions or professional programs. Each has its own deadline + eligibility.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Channels 1 (Bilateral) and 2 (Chinese University) are not mutually exclusive — many students apply through both to maximize chances. You can hold multiple CSC acceptances but must ultimately pick one.',
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
        a: 'Yes — apply for university admission first (rolling admissions start in late 2026 for the September 2027 intake), then submit the CSC application via the university (Type B) or your dispatching authority (Bilateral). A pre-admission letter is expected for 2026/27 applications onward [verify].',
      },
      {
        q: 'When does CSC open for the September 2027 intake?',
        a: 'The application window opens in January 2027; deadlines run January-April 2027 and vary by channel. Dispatching-authority routes often close earliest (January-March); university (Type B) deadlines are roughly February-April and vary by university [verify each target]. The Pakistan HEC route may close as early as December-January [verify on HEC.gov.pk].',
      },
      {
        q: 'Do bachelor\'s applicants need the CSCA for CSC?',
        a: 'Yes — a CSCA score is required for Chinese Government Scholarship undergraduate applicants (2026 and 2027 intakes). Math is required for everyone; Physics and/or Chemistry depend on the university. Next sittings: 14-15 Nov 2026 (register 15-21 Oct, Beijing time), 19-20 Dec 2026, and 23-24 Jan 2027 — see our CSCA exam dates guide. Free practice: https://cscaprep.academy',
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
    title: 'CSC 奖学金 2027：中国政府奖学金指南',
    description:
      '2027 年中国政府奖学金（CSC）：覆盖内容、津贴、资格、四大申请渠道、各国截止时间，以及本科申请者的 CSCA 要求。',
    subtitle:
      'CSC 奖学金全额资助你在参与中国大学的学位——学费、住宿、医疗保险、月津贴、（多数类别）往返机票。2027 年 9 月入学的申请窗口约为 2027 年 1-4 月，部分国家渠道更早。',
    stats: [
      { value: '全额', label: '学费 + 住宿 + 津贴 + 保险' },
      { value: '2027 年 1-4 月', label: '主要申请窗口（因渠道而异）' },
      { value: '4 渠道', label: '申请路径' },
      { value: 'CSCA', label: '本科申请者必考' },
    ],
    quickAnswer:
      '中国政府奖学金（CSC）由国家留学基金管理委员会管理，是国际生最负盛名的全额资助奖学金，覆盖学费、校内住宿、月津贴、医疗保险与（多数类别）往返机票——具体津贴数额以当期 CSC 通知为准 [待核实]。在目标入学前 9-12 个月通过四大渠道之一申请：本国派遣单位、接收大学（Type B）、CSC 合作机构或专项项目。2027 年 9 月入学的截止集中在 2027 年 1-4 月；巴基斯坦 HEC 渠道据报 12-1 月即截止 [待核实]。本科申请者：CSC 奖学金本科申请须提交 CSCA 成绩。',
    keyTakeaways: [
      'CSC 覆盖学费 + 住宿 + 月津贴 + 保险；多数类别含机票（津贴数额以当期 CSC 通知核实）',
      '四大申请渠道：派遣单位（使馆）、大学（Type B）、合作机构、专项项目',
      '2027 年 9 月入学：Type B（大学渠道）截止约在 2027 年 1-4 月，因校而异 [逐校核实]；部分国家渠道更早',
      '巴基斯坦：HEC 渠道（机构号 5861）据报 12-1 月截止 [在 HEC.gov.pk 核实]——需要 CSCA 成绩者应参加 2026 年 11 月场次',
      '本科申请者申请 CSC 奖学金须提交 CSCA 成绩（2026、2027 入学）；下一批场次：2026 年 11/12 月、2027 年 1 月',
      '2026/27 起预计需要接收大学的预录取函 [待核实]——大学申请与 CSC 并行推进，不要先后等',
      'CSC 可与院校资助叠加，但不可与其他全额奖学金叠加',
    ],
    sections: [
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
        id: 'csca-requirement',
        h2: '本科申请者的 CSCA 要求',
        intro:
          '自 2026 级起，中国政府奖学金本科申请者必须提交 CSCA 成绩——这是硬性要求，不是加分项。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**适用对象**——中国政府奖学金本科（undergraduate）申请者，2026 与 2027 入学',
              '**考什么**——CSCA（中国学业水平评估），由国家留学基金委组织：数学全员必考；物理和/或化学取决于大学与项目',
              '**什么时候考**——每年 6 场，以居家线上、真人监考为主。已确认：2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日',
              '**规划法则**——CSC 截止集中在 2027 年 1-4 月，最迟应参加 2026 年 11 或 12 月场次；详见 CSCA 考试时间指南',
              '**超出 CSC 范围**——许多大学（含许多英文授课 MBBS）对自费申请者也要求 CSCA；据报 2028 年全面铺开 [待核实]',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '本科申请者缺 CSCA 成绩的 CSC 材料即不完整——没有成绩就没有资格。每场免费模拟题与学习计划：https://cscaprep.academy',
          },
        ],
      },
      {
        id: 'pre-admission-letter',
        h2: '预录取函',
        intro:
          '2026/27 起，CSC 申请预计需附接收大学的预录取函 [以当期 CSC 通知及你所在渠道要求为准]。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**是什么**——接收大学国际学生办公室出具的文件，说明你在 CSC 申请中填报的项目已获预录取（或审核中）',
              '**为何重要**——Type B（大学渠道）实际一直需要它；据报此要求现扩展到其他渠道 [待核实]',
              '**如何获得**——与 CSC 准备并行（而非之后）向大学国际生申请门户提交申请；大学自前一年年底滚动审核发放',
              '**时间点**——2027 年 9 月入学应在 2026 年 11-12 月前启动大学申请，确保预录取函赶在 2027 年 1-4 月 CSC 截止前到位',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '大学申请与 CSC 申请按双轨并行。等一个做完再启动另一个，是错过 1-4 月窗口最常见的方式。',
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
        id: 'csc-timeline',
        h2: 'CSC 申请时间线（入学前 12 个月）',
        intro:
          'CSC 遵循严格年度周期。2027 年 9 月入学的申请于 2027 年 1 月开放，截止因渠道分布在 1-4 月——需要围绕截止（而非开放）规划。',
        blocks: [
          {
            type: 'table',
            caption: 'CSC 申请时间线——2027 年 9 月入学',
            columns: ['时间', '动作', '产出'],
            rows: [
              ['2026 年 8-10 月', '筛选目标大学 + 项目', '3-5 所目标校'],
              ['2026 年 9-11 月', '备考语言（雅思/托福/HSK）；本科申请者参加 CSCA（11 月 14-15 或 12 月 19-20）', '语言/CSCA 成绩就绪'],
              ['2026 年 9-12 月', '起草学习计划 + 收集材料；启动大学申请', '申请包就绪 + 预录取推进中'],
              ['2026 年 11 月-2027 年 1 月', '大学申请并行审核', '预录取函 [2026/27 起预计需要——待核实]'],
              ['2027 年 1 月', 'CSC 申请窗口开启（门户 + 各渠道）', 'CSC 申请提交'],
              ['2027 年 1-4 月', '各渠道截止（因渠道 + 国家而异）', '全部提交完成'],
              ['2027 年 2-5 月', 'CSC + 大学评审', '等待期'],
              ['2027 年 5-6 月', 'CSC 结果公布', '录取 / 拒录'],
              ['2027 年 6-7 月', '收到录取通知 + JW201 + 机票', '出发前准备'],
              ['2027 年 8-9 月', '抵华，开课', '资助项目开始'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：先申请目标大学入学（2026/27 起 CSC 申请预计需附预录取函 [待核实]），函到手后再提交 CSC。截止很紧——2027 年 9 月入学通常应在 2027 年 3 月中旬前提交。',
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
              '**本国派遣单位（双边项目）**——通过本国中国大使馆、领事馆或相关部委申请。最适合：与中国签有活跃 CSC 双边协定的国家（多数亚洲、非洲、拉美）。截止往往最早，常在 1-3 月。**巴基斯坦**：HEC 渠道（机构号 5861）据报 12-1 月即截止 [在 HEC.gov.pk 核实]——需要 CSCA 成绩者应参加 2026 年 11 月场次。',
              '**接收中国大学（Type B / 中国大学项目）**——通过目标中国大学国际学生办公室申请。大学提名你给 CSC 资助。最适合：申请特定大学强项目的学生。截止约在 2027 年 1-4 月，因校而异 [逐校核实]；并行申请 3-5 所。',
              '**本国 CSC 海外合作机构**——部分孔子学院、UNESCO 国家委员会、合作大学提名学生给 CSC。最适合：有现成机构联系的学生。',
              '**特殊项目（CAFP、东盟、MOFCOM、欧美项目）**——针对特定地区或专业项目的国别项目，各有截止日 + 资格。最适合：目标地区或专业项目学生。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '渠道 1（双边）与渠道 2（中国大学）不互斥——许多学生同时申请以最大化机会。可持有多个 CSC 录取，但最终只能选其一。',
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
        a: '可以——先申请大学入学（2026 年底起滚动录取对应 2027 年 9 月入学），再通过大学（Type B）或本国派遣单位（双边）提交 CSC。2026/27 起预计需附预录取函 [待核实]。',
      },
      {
        q: '2027 年 9 月入学的 CSC 何时开放？',
        a: '申请窗口 2027 年 1 月开放；截止分布在 1-4 月，因渠道而异。派遣单位渠道往往最早（1-3 月）；大学（Type B）截止约 2-4 月且因校而异 [逐校核实]。巴基斯坦 HEC 渠道可能 12-1 月即截止 [在 HEC.gov.pk 核实]。',
      },
      {
        q: '本科申请者需要 CSCA 吗？',
        a: '需要——中国政府奖学金本科申请者（2026、2027 入学）必须提交 CSCA 成绩。数学全员必考；物理和/或化学取决于大学。下一批场次：2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日——详见 CSCA 考试时间指南。免费练习：https://cscaprep.academy',
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
