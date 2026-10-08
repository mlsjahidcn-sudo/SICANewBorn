import type { LocalizedGuide } from './types';

/**
 * "China University Application Deadlines & Timeline" — long-form
 * process guide. Target queries: "china university application
 * deadline", "when to apply china universities", "china university
 * fall intake", "china university spring intake", "application
 * timeline china".
 *
 * Mostly static content. Page wrapper enriches the
 * `intakes-table` block with the live list of active intake
 * periods from Supabase (managed via Phase 25 /admin/intakes).
 */
export const chinaApplicationDeadlinesGuide: LocalizedGuide = {
  en: {
    slug: 'china-university-application-deadlines',
    eyebrow: 'GUIDE · DEADLINES',
    title: 'China University Application Deadlines 2027 (Sept & March)',
    description:
      'Sept 2027 and March 2027 intake deadlines for Chinese universities: bachelor\'s, master\'s, PhD, MBBS and CSC scholarship windows, plus CSCA timing.',
    subtitle:
      'Chinese universities run two main intakes: September (the larger, with more programs and scholarships) and March. For September 2027, apply November 2026 through spring 2027 — CSC scholarship deadlines cluster January-April 2027, and bachelor\'s applicants need a CSCA score from a November 2026 - January 2027 sitting. Applications for the March 2027 intake close roughly September-December 2026.',
    stats: [
      { value: 'Sept 2027', label: 'Primary intake' },
      { value: 'Mar 2027', label: 'Secondary intake' },
      { value: '12 mo', label: 'Recommended planning horizon' },
      { value: 'Nov-Dec 2026', label: 'Start university applications' },
    ],
    quickAnswer:
      'Chinese universities run two main intakes per year: September (the primary intake, with the most programs and scholarships) and March (secondary, mostly master\'s, Chinese-language, and short-term programs). For September 2027, rolling applications open from November 2026, competitive programs close by March-April 2027, and CSC scholarship deadlines cluster in January-April 2027. Bachelor\'s applicants: a CSCA score is required for CSC scholarship applications and by many universities — sit the exam in November 2026, December 2026, or January 2027 (next confirmed dates on our CSCA exam dates guide). March 2027 intake deadlines fall roughly September-December 2026. Plan 9-12 months ahead.',
    keyTakeaways: [
      'Two annual intakes: September (primary) + March (secondary)',
      'For September 2027: rolling applications from Nov 2026; competitive programs close by Mar-Apr 2027',
      'CSC scholarship deadlines cluster in January-April 2027 (varies by channel and university)',
      'Bachelor\'s applicants: CSCA score needed for CSC and many universities — next sittings Nov/Dec 2026, Jan 2027 (see https://cscaprep.academy/exam-dates)',
      'March 2027 intake deadlines typically September-December 2026',
      'Plan 9-12 months ahead: research + language test + documents + supervisor match',
    ],
    sections: [
      {
        id: 'academic-calendar',
        h2: 'China academic calendar explained',
        intro:
          'Chinese universities follow a two-semester calendar with intake windows in September (Fall) and March (Spring). PhDs and most master\'s programs run on a Fall-only cycle. Bachelor\'s programs are predominantly Fall; some Chinese-medium bachelor\'s accept Spring intake.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**September (Fall) intake** — the primary intake at all Chinese universities: the widest program selection and most scholarship money (CSC, provincial). Applications run from November of the prior year (rolling) through summer (late apps at less-selective universities). Plan 9-12 months ahead for the smoothest path.',
              '**March (Spring) intake** — the secondary intake, offered by many but not all universities. Most Spring-start places are master\'s, Chinese language, and short-term programs. Application deadlines typically September-December. Fewer scholarships are available for Spring intake (some university-specific waivers still apply).',
              '**Bachelor\'s intake** — predominantly September. Some programs (especially Chinese-medium) accept March intake. Verify with each program. **Bachelor\'s applicants: a CSCA score is required for CSC scholarship applications and by many universities — see https://cscaprep.academy/exam-dates for the next sittings.**',
              '**Master\'s intake** — September at the large majority of universities; a subset also accepts March. Master\'s programs are more flexible on intake timing.',
              '**PhD intake** — September-only at most universities. Some offer Spring PhD intake if a supervisor has funding available. Email potential supervisors 6-9 months ahead to confirm.',
              '**Chinese language program intake** — March + summer + September (most flexible). Many universities offer rolling admissions for language programs with start dates every few months.',
              '**Summer school / short-term programs** — June-August. Separate application process; deadlines typically March-May. Open to currently-enrolled university students.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'When in doubt, plan for the September intake. It has the most programs, the most scholarships, and the broadest range of supervisor availability. Use the March intake as a backup plan if September applications don\'t land.',
          },
        ],
      },
      {
        id: 'fall-deadlines',
        h2: 'September 2027 intake deadlines — by program type',
        intro:
          'September is the primary intake at all Chinese universities. Application deadlines vary by program type and university tier. Use this table to plan your application timeline.',
        blocks: [
          {
            type: 'table',
            caption: 'September 2027 intake application deadlines by program type',
            columns: ['Program type', 'Earliest deadline', 'Latest deadline', 'Recommended timing'],
            rows: [
              ['Bachelor\'s (English-medium)', 'Nov 2026 (rolling)', 'Aug 2027 (mid-tier)', 'Apply by Mar 2027'],
              ['Bachelor\'s (Chinese-medium)', 'Nov 2026 (rolling)', 'Jul 2027', 'Apply by Feb 2027'],
              ['Master\'s (English-medium)', 'Nov 2026 (rolling)', 'Aug 2027 (mid-tier)', 'Apply by Feb 2027'],
              ['Master\'s (thesis track)', 'Dec 2026', 'Apr 2027 (most selective)', 'Apply by Jan 2027'],
              ['Master\'s (research grant positions)', 'Open year-round', 'Position filled', 'Email supervisor 6-9mo ahead'],
              ['PhD (English-medium)', 'Dec 2026', 'Apr 2027 (most selective)', 'Apply by Jan 2027'],
              ['PhD (with supervisor pre-match)', 'Open year-round', 'Until position filled', 'Email supervisor 9-12mo ahead'],
              ['MBBS / Clinical Medicine', 'Nov 2026', 'Jun 2027', 'Apply by Mar 2027'],
              ['Chinese Language (1-year)', 'Open year-round', '~2 weeks before start', 'Apply 6-8 weeks ahead'],
              ['CSC scholarship (parallel)', 'Jan 2027', 'Apr 2027 (varies by channel)', 'Apply by mid-Mar 2027'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: for the most selective universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong, USTC), submit your PhD/master\'s thesis-track application by January 2027 for September intake. After March, admission slots fill up and remaining spots go to later-round applicants.',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Bachelor\'s applicants targeting CSC or universities that require the CSCA: registration for the 14-15 November 2026 sitting runs 15-21 October (Beijing time). Sit November 2026 or December 2026 so the score exists before January-April 2027 scholarship deadlines. Full calendar: https://cscaprep.academy/exam-dates',
          },
        ],
      },
      {
        id: 'spring-deadlines',
        h2: 'March 2027 intake deadlines — by program type',
        intro:
          'March intake is offered at many Chinese universities, concentrated in master\'s and Chinese-language programs. PhD and bachelor\'s March intake is rare.',
        blocks: [
          {
            type: 'table',
            caption: 'March 2027 intake application deadlines by program type',
            columns: ['Program type', 'Typical deadline', 'Availability', 'Notes'],
            rows: [
              ['Chinese Language (1-year / 1-semester)', 'Nov-Dec 2026', 'Widely offered', 'Most flexible intake'],
              ['Master\'s (English-medium, coursework)', 'Sep-Dec 2026', 'Many universities', 'Check program-by-program'],
              ['Master\'s (thesis track)', 'Sep-Nov 2026', 'Subset of universities', 'Stronger at well-ranked universities'],
              ['Master\'s (research grant positions)', 'Open year-round', 'If supervisor has funding', 'Contact the supervisor directly'],
              ['Bachelor\'s (Chinese-medium)', 'Oct-Dec 2026', 'Limited', 'Varies by university'],
              ['Bachelor\'s (English-medium)', 'Rare', 'Very limited', 'Most English-medium bachelor\'s are Fall only'],
              ['PhD (with funded position)', 'Open year-round', 'Limited', 'Pre-match with supervisor required'],
              ['Short-term certificate programs', 'Rolling', 'Varies', 'Often 3-6 month programs'],
              ['Summer school', 'Mar-May 2027', 'Varies', 'June-August 2027 start'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For the March 2027 intake, plan 6-9 months ahead: applications open around March-April 2026, peak in September-October 2026, and close by November-December 2026. Late applications (December) go to less-selective slots.',
          },
        ],
      },
      {
        id: 'preparation-timeline',
        h2: 'Application preparation timeline (12/9/6/3 months out)',
        intro:
          'Use this month-by-month checklist to plan your application. The same timeline works for Fall or Spring intake — just shift the dates by 6 months.',
        blocks: [
          {
            type: 'table',
            caption: 'Month-by-month application preparation checklist',
            columns: ['Months out', 'Action', 'Outcome'],
            rows: [
              ['12 months', 'Shortlist 5-10 target universities + programs', 'Target list'],
              ['12 months', 'Take language test (IELTS/TOEFL/HSK)', 'Test scores by month 9'],
              ['9 months', 'Draft personal statement / study plan / research proposal', 'First draft ready'],
              ['9 months', 'Request recommendation letters', 'Letters ready by month 7'],
              ['6 months', 'Refine personal statement + study plan (per program)', 'Tailored 3-5 versions'],
              ['6 months', 'Begin CSC scholarship search if pursuing', 'CSC sub-program identified'],
              ['6 months', 'Contact potential PhD supervisors', 'Email exchanges begin'],
              ['3-4 months', 'Finalize supervisor pre-match (PhD)', 'Confirmed match'],
              ['3 months', 'Submit university applications (first wave)', 'First admits by month 1'],
              ['3 months', 'Submit CSC scholarship application', 'CSC under review'],
              ['2 months', 'Submit university applications (second wave)', 'Most admits decided'],
              ['2 months', 'Prepare for interview (PhD/master\'s thesis)', 'Research presentation'],
              ['1-2 months', 'Receive admission + funding offers', 'Decide + confirm'],
              ['1-2 months', 'Apply for X1 visa', 'Visa in hand'],
              ['2-4 weeks', 'Book travel + dorm', 'Move-in date set'],
              ['0', 'Arrive in China + orientation', 'Begin program'],
            ],
          },
        ],
      },
      {
        id: 'intakes-table',
        h2: 'Intake windows across SICA partner universities',
        intro:
          'Live view of the intake periods SICA partner universities currently advertise. Use it to see which September / March / rolling windows are open right now.',
        blocks: [
          {
            type: 'table',
            caption: 'Intake periods currently advertised by SICA partner universities',
            columns: ['Intake', 'Start', 'Type', 'Notes'],
            rows: [['(loading…)', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Intake windows change through the year as universities open and close application periods — if you don\'t see your target intake here, contact SICA for the latest opening dates + deadlines.',
          },
        ],
      },
      {
        id: 'rolling-admissions',
        h2: 'Rolling admissions + late-application strategy',
        intro:
          'If you\'ve missed the standard Fall/Spring intake deadlines, you still have options. Many Chinese universities accept rolling admissions through the summer for September intake, especially at less-selective schools.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Rolling admissions** — many universities (especially at the tier-2/3 level) accept applications on a rolling basis from November through August for September intake. Acceptance probability decreases over time as slots fill, but a strong application in June-July can still land at universities ranked 50-300 in China.',
              '**Spring intake backup** — if Fall intake is full at top-5 universities, pivot to less-selective programs + Spring intake. Spring intake is more flexible and accepts later applications than Fall.',
              '**Language program bridge** — enroll in a 1-year Chinese language program (Spring or Fall intake, rolling admissions). During the language year, prepare and apply for a degree program starting the following September.',
              '**Master\'s thesis-track research grants** — universities continuously fund research-grant positions as PIs secure new grants. Email supervisors in May-August for Fall intake — funded positions can open mid-summer.',
              '**PhD late applications** — not recommended for top-5 universities (slots filled by April), but possible at tier-2 universities year-round if supervisor has open funded position.',
              '**Apply to 8-12 programs in parallel** — strong backup strategy. Most successful international students apply to 3-5 top-choice + 3-5 mid-tier + 2-3 safety schools in the same intake.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Late applications (after May for Fall intake) accept only at universities ranked 50+ in China, and admission becomes increasingly conditional (higher language requirements, less scholarship funding). For competitive programs + scholarships, plan ahead.',
          },
        ],
      },
      {
        id: 'scholarship-deadlines',
        h2: 'When to apply for scholarships',
        intro:
          'Most scholarships track the Fall (September) intake deadline cycle. Spring scholarships exist but are less common. Plan scholarship applications 6-9 months ahead of your target intake.',
        blocks: [
          {
            type: 'table',
            caption: 'Scholarship application deadlines by intake',
            columns: ['Scholarship', 'Sept intake deadline', 'March intake deadline', 'Notes'],
            rows: [
              ['CSC scholarship', 'Jan-Apr (varies)', 'Aug-Oct (varies)', 'Most prestigious; bachelor\'s needs CSCA'],
              ['University-specific waivers', 'Rolling (apply early)', 'Rolling', 'Often automatic with admission'],
              ['Provincial government scholarships', 'Mar-May', 'Sep-Nov', 'Region-specific'],
              ['Confucius Institute Scholarship', 'Open year-round', 'Open year-round', '1-year Chinese language'],
              ['Home country government scholarships', 'Varies by country', 'Varies', 'Fulbright, DAAD, Commonwealth, etc.'],
              ['External international foundations', 'Jan-Apr', 'Jul-Oct', 'Varies by foundation'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: CSC and provincial government scholarships share the September intake cycle (apply January-April). If you miss the Fall scholarship cycle, the March intake has fewer scholarship opportunities but more relaxed admissions at some programs.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When do Chinese universities start accepting applications?',
        a: 'Most Chinese universities open applications in November-December for the following September intake. Some elite programs open earlier (August-October for visiting students, exchange programs). Rolling admissions continue through August at many universities, but competitive programs close by March-April.',
      },
      {
        q: 'When is the China university application deadline for September 2027?',
        a: 'For the September 2027 intake: the most selective universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong, USTC) close around March-April 2027. Well-ranked universities typically close by May-June 2027. Less-selective universities accept rolling applications through August 2027. CSC scholarship deadlines cluster in January-April 2027.',
      },
      {
        q: 'Is it too late to apply for September 2027?',
        a: 'It depends on the target university: (a) the most selective schools — too late for most programs once spring 2027 passes; (b) mid-ranked universities — possible into mid-2026-summer 2027 with strong applications, but slots fill by June; (c) less-selective universities — open through August 2027. If you\'ve missed the window, consider pivoting to the March 2028 intake.',
      },
      {
        q: 'Can I apply for the March intake in China?',
        a: 'Yes — March intake is offered at many Chinese universities, concentrated in master\'s and Chinese-language programs. Application deadlines are typically September-December for the following March start. PhD and bachelor\'s March intake is rare.',
      },
      {
        q: 'Do bachelor\'s applicants need the CSCA for September 2027?',
        a: 'Yes for CSC scholarship applications — and many universities require it for direct admission too. Math is required for everyone; Physics and/or Chemistry depend on the university. For September 2027, sit the CSCA in November 2026 (register 15-21 Oct), December 2026, or January 2027 so the score exists before deadlines. Full calendar: https://cscaprep.academy/exam-dates',
      },
      {
        q: 'How long does admission take after applying?',
        a: 'For most Chinese universities: 4-8 weeks from application submission to decision. Master\'s coursework programs: 3-6 weeks. PhD and thesis-track master\'s: 4-12 weeks (research proposal review + interview scheduling add delay). Top-5 universities can take 8-12 weeks due to committee reviews. Plan to receive decisions 2-3 months after submission.',
      },
      {
        q: 'Do all Chinese universities have the same deadline?',
        a: 'No — each Chinese university sets its own deadline. Top-5 universities close earliest (April for Fall intake). Less-selective universities close later or run rolling admissions. Always check the specific program\'s deadline on the university\'s international student office website, or verify with SICA.',
      },
      {
        q: 'What\'s the difference between rolling and deadline-based admissions?',
        a: 'Rolling admissions: applications reviewed as they arrive; decisions within 2-6 weeks. Apply any time during the open window. Deadline-based: applications pooled until the deadline, then all reviewed together; decisions 4-12 weeks after deadline. Top-5 Chinese universities typically use deadline-based. Tier-2/3 universities often use rolling.',
      },
      {
        q: 'When should I apply for scholarships?',
        a: 'For the strongest scholarships (CSC + provincial), apply by mid-March for Fall intake. CSC deadlines vary by channel: embassies close January-March, universities close February-April. University-specific tuition waivers are automatic with admission — submit admission application early. Provincial scholarships have March-May deadlines for Fall intake.',
      },
    ],
    howToSteps: [
      {
        name: 'Identify your target intake (Fall vs Spring)',
        text: 'Fall (September) intake has the most programs + most scholarships. Spring (March) intake is the backup if Fall applications don\'t land. PhD applicants: target Fall only (Spring PhD intake is rare). Master\'s: most programs accept both.',
      },
      {
        name: 'Set the application timeline 9-12 months out',
        text: 'Working backward from your target intake: September 2027 intake → start prep now (October 2026). March 2027 intake → prep should already be underway (started by June 2026). The 12-month horizon covers language test prep, document gathering, supervisor matching (PhD), and statement drafting.',
      },
      {
        name: 'Take the language test 6-9 months before applying',
        text: 'IELTS 5.5-6.5+ / TOEFL 60-90+ for English-medium programs. HSK 4+ for Chinese-medium. Book your test 9 months out to allow retake if needed. Most programs accept scores within 2 years.',
      },
      {
        name: 'Shortlist 5-10 target universities + programs',
        text: 'Use /universities and /programs to filter by discipline, degree, language, city. Verify each program\'s intake + deadline on the university\'s international student office website. Build a spreadsheet: university, program, deadline, language, scholarship availability, city tier, tuition.',
      },
      {
        name: 'Draft personal statement + study plan (6 months out)',
        text: '500-1,500 words: why China, why this program, why this university, career goals. Specific to each target university (mention faculty, labs, facilities). PhD applicants: also draft a 1,500-3,000 word research proposal.',
      },
      {
        name: 'Request recommendation letters (6-9 months out)',
        text: 'Academic referees (PhD: research supervisors; master\'s: professors) + work referees (master\'s thesis-track: supervisor; MBA: manager). Provide each referee with: your CV, the program\'s research areas, the specific letter requirements (1-2 pages). Allow 4-6 weeks for letter writing.',
      },
      {
        name: 'Contact potential PhD supervisors (9-12 months out)',
        text: 'PhD + thesis-track master\'s admission depends on supervisor pre-match. Email 5-10 potential supervisors with: CV, research interests, a research-proposal sketch. Iterate based on replies. Confirm supervisor pre-match 3-4 months before deadline.',
      },
      {
        name: 'Submit university applications + CSC scholarship in parallel',
        text: 'For Fall intake: submit university applications November-March (rolling + early-deadline universities); submit CSC by mid-March. For Spring intake: submit university applications July-September; submit CSC by mid-October. Apply to 3-5 top-choice + 3-5 mid-tier + 2-3 safety schools.',
      },
    ],
    ctaTitle: 'Ready to apply to Chinese universities?',
    ctaSubtitle:
      'SICA counselors help you identify the right intake, plan the 9-12 month application timeline, target universities based on your profile, and apply for CSC + university + provincial scholarships. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/application',
        label: 'How to apply to Chinese universities',
        description: 'Step-by-step timeline, document checklist, language requirements, application channels, and post-admission steps.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'The CSC fully funds tuition + stipend + dorm + airfare. Deadlines, categories, application channels.',
      },
      {
        href: '/china-university-admission-requirements',
        label: 'China university admission requirements',
        description: 'Bachelor / master / PhD admission requirements — GPA, language test, work experience, recommendation letters.',
      },
    ],
  },
  zh: {
    slug: 'china-university-application-deadlines',
    eyebrow: '指南 · 截止日',
    title: '2027 中国大学申请截止日（9 月与 3 月入学）',
    description:
      '2027 年 9 月与 3 月入学的中国大学申请截止日：本科、硕士、博士、MBBS 与 CSC 奖学金窗口，及 CSCA 考试时间。',
    subtitle:
      '中国大学每年两次主要入学：9 月（主入学，项目与奖学金最多）与 3 月。2027 年 9 月入学的申请期为 2026 年 11 月至 2027 年春——CSC 奖学金截止集中在 2027 年 1-4 月，本科申请者需在 2026 年 11 月-2027 年 1 月完成 CSCA 考试。2027 年 3 月入学的申请截止约为 2026 年 9-12 月。',
    stats: [
      { value: '2027 年 9 月', label: '主入学' },
      { value: '2027 年 3 月', label: '次入学' },
      { value: '12 个月', label: '推荐规划跨度' },
      { value: '2026 年 11-12 月', label: '启动大学申请' },
    ],
    quickAnswer:
      '中国大学每年两次主要入学：9 月（主入学，项目与奖学金最多）与 3 月（次入学，多为硕士、中文与短期项目）。2027 年 9 月入学的滚动申请自 2026 年 11 月开放，竞争激烈的项目在 2027 年 3-4 月截止，CSC 奖学金截止集中在 2027 年 1-4 月。本科申请者：CSC 奖学金及许多大学要求 CSCA 成绩——应在 2026 年 11 月、12 月或 2027 年 1 月场次完成考试（已确认日期见 CSCA 考试时间指南）。2027 年 3 月入学截止约为 2026 年 9-12 月。建议提前 9-12 个月规划。',
    keyTakeaways: [
      '每年两次入学：9 月（主）+ 3 月（次）',
      '2027 年 9 月入学：2026 年 11 月起滚动申请；竞争项目 2027 年 3-4 月截止',
      'CSC 奖学金截止集中在 2027 年 1-4 月（因渠道与大学而异）',
      '本科申请者：CSC 及许多大学需要 CSCA 成绩——下一批场次 2026 年 11/12 月、2027 年 1 月（见 https://cscaprep.academy/exam-dates）',
      '2027 年 3 月入学截止通常在 2026 年 9-12 月',
      '提前 9-12 个月规划：调研 + 语言考试 + 文件 + 导师匹配',
    ],
    sections: [
      {
        id: 'academic-calendar',
        h2: '中国学年日历解读',
        intro:
          '中国大学遵循两学期日历，入学窗口在 9 月（秋）与 3 月（春）。博士与多数硕士采用秋入学为主周期。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**9 月（秋季）入学**——所有中国大学的主入学：项目最全、奖学金最多（CSC、省市）。申请自前一年 11 月（滚动）持续到夏季（次选大学的晚申）。提前 9-12 个月规划最稳妥。',
              '**3 月（春季）入学**——次入学，许多（但非全部）大学提供。春季名额多为硕士、中文与短期项目。截止日通常 9-12 月。春季可申请的奖学金较少（部分院校自费减免仍可用）。',
              '**本科入学**——以 9 月为主。部分项目（尤其中文授课）接受 3 月入学，逐项目核实。**本科申请者：CSC 奖学金及许多大学要求 CSCA 成绩——下场场次见 https://cscaprep.academy/exam-dates。**',
              '**硕士入学**——绝大多数大学以 9 月为主；部分也接受 3 月。硕士项目对入学时间更灵活。',
              '**博士入学**——多数大学仅 9 月。部分在导师有经费时提供春季博士入学。提前 6-9 个月邮件确认。',
              '**中文项目入学**——3 月 + 夏季 + 9 月（最灵活）。多数大学提供滚动录取，每隔数月开课。',
              '**暑期学校 / 短期项目**——6-8 月。单独申请流程；截止日通常 3-5 月。仅对在校大学生开放。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '如有疑问，以 9 月入学为目标。它有最多项目、最多奖学金、最广导师资源。如 9 月未获录取，将 3 月作为后备。',
          },
        ],
      },
      {
        id: 'fall-deadlines',
        h2: '2027 年 9 月入学截止日——按项目类型',
        intro:
          '9 月是所有中国大学的主入学。申请截止因项目类型与大学层级而异。用此表规划你的申请时间线。',
        blocks: [
          {
            type: 'table',
            caption: '2027 年 9 月入学申请截止日（按项目类型）',
            columns: ['项目类型', '最早截止', '最晚截止', '推荐提交时点'],
            rows: [
              ['本科（英文授课）', '2026 年 11 月（滚动）', '2027 年 8 月（中档）', '2027 年 3 月前提交'],
              ['本科（中文授课）', '2026 年 11 月（滚动）', '2027 年 7 月', '2027 年 2 月前提交'],
              ['硕士（英文授课）', '2026 年 11 月（滚动）', '2027 年 8 月（中档）', '2027 年 2 月前提交'],
              ['硕士（论文轨道）', '2026 年 12 月', '2027 年 4 月（最选择性）', '2027 年 1 月前提交'],
              ['硕士（科研岗位）', '全年开放', '岗位招满', '提前 6-9 月联系导师'],
              ['博士（英文授课）', '2026 年 12 月', '2027 年 4 月（最选择性）', '2027 年 1 月前提交'],
              ['博士（导师预匹配）', '全年开放', '招满为止', '提前 9-12 月联系导师'],
              ['MBBS / 临床医学', '2026 年 11 月', '2027 年 6 月', '2027 年 3 月前提交'],
              ['中文语言（1 年）', '全年开放', '开学前约 2 周', '提前 6-8 周申请'],
              ['CSC 奖学金（并行）', '2027 年 1 月', '2027 年 4 月（因渠道而异）', '2027 年 3 月中前提交'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：最选择性大学（清华、北大、复旦、上海交大、中科大）的博士/硕士论文轨道申请，2027 年 9 月入学请在 2027 年 1 月前提交。3 月后名额渐满。',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '以 CSC 或要求 CSCA 的大学为目标的本科申请者：2026 年 11 月 14-15 日场次的报名窗口为 10 月 15-21 日（北京时间）。请在 2026 年 11 月或 12 月完成考试，确保成绩赶在 2027 年 1-4 月奖学金截止之前。完整日历：https://cscaprep.academy/exam-dates',
          },
        ],
      },
      {
        id: 'spring-deadlines',
        h2: '2027 年 3 月入学截止日——按项目类型',
        intro:
          '3 月入学见于许多中国大学，集中于硕士与中文项目。博士与本科的 3 月入学少见。',
        blocks: [
          {
            type: 'table',
            caption: '2027 年 3 月入学申请截止日（按项目类型）',
            columns: ['项目类型', '典型截止', '提供范围', '备注'],
            rows: [
              ['中文语言（1 年 / 1 学期）', '2026 年 11-12 月', '广泛提供', '最灵活的入学'],
              ['硕士（英文授课，授课型）', '2026 年 9-12 月', '许多大学', '逐项目确认'],
              ['硕士（论文轨道）', '2026 年 9-11 月', '部分大学', '排名靠前的大学更多'],
              ['硕士（科研岗位）', '全年开放', '视导师经费', '直接联系导师'],
              ['本科（中文授课）', '2026 年 10-12 月', '有限', '因大学而异'],
              ['本科（英文授课）', '罕见', '极少', '多数英文本科仅 9 月'],
              ['博士（带经费岗位）', '全年开放', '有限', '需导师预匹配'],
              ['短期证书项目', '滚动', '视项目而定', '通常 3-6 个月'],
              ['暑期学校', '2027 年 3-5 月', '视项目而定', '2027 年 6-8 月开学'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '2027 年 3 月入学请提前 6-9 个月规划：申请约 2026 年 3-4 月开放，9-10 月高峰，11-12 月截止。晚申（12 月）只能进竞争较弱的名额。',
          },
        ],
      },
      {
        id: 'preparation-timeline',
        h2: '申请准备时间线（提前 12/9/6/3 个月）',
        intro:
          '用此逐月检查清单规划你的申请。同时间线适用秋季或春季入学——只是日期顺延 6 个月。',
        blocks: [
          {
            type: 'table',
            caption: '逐月申请准备检查清单',
            columns: ['提前月数', '动作', '产出'],
            rows: [
              ['12 个月', '筛选 5-10 所目标大学 + 项目', '目标清单'],
              ['12 个月', '备考语言（雅思/托福/HSK）', '第 9 月有成绩'],
              ['9 个月', '起草个人陈述 / 学习计划 / 研究计划', '首稿'],
              ['9 个月', '申请推荐信', '第 7 月有信'],
              ['6 个月', '润色个人陈述 + 学习计划（按项目）', '定制 3-5 份'],
              ['6 个月', '开始 CSC 奖学金调研（如申请）', '识别 CSC 子项目'],
              ['6 个月', '联系潜在博士导师', '邮件沟通开始'],
              ['3-4 个月', '完成导师预匹配（博士）', '确认匹配'],
              ['3 个月', '提交大学申请（首批）', '第 1 月有录取'],
              ['3 个月', '提交 CSC 奖学金', 'CSC 审核中'],
              ['2 个月', '提交大学申请（次批）', '多数录取决定'],
              ['2 个月', '准备面试（博士/硕士论文）', '研究展示'],
              ['1-2 个月', '获录取 + 资助要约', '决策 + 确认'],
              ['1-2 个月', '申请 X1 签证', '签证到手'],
              ['2-4 周', '订票 + 住宿', '搬入日确定'],
              ['0', '抵华 + 入学教育', '开课'],
            ],
          },
        ],
      },
      {
        id: 'intakes-table',
        h2: 'SICA 合作大学的入学窗口',
        intro:
          'SICA 合作大学当前公布的入学期实时视图。用它查看哪些 9 月 / 3 月 / 滚动窗口正在开放。',
        blocks: [
          {
            type: 'table',
            caption: 'SICA 合作大学当前公布的入学期',
            columns: ['入学', '开学', '类型', '备注'],
            rows: [['（加载中…）', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '入学窗口随大学开放/关闭申请期而变化——若目标入学未列出，请联系 SICA 获取最新开放日 + 截止日。',
          },
        ],
      },
      {
        id: 'rolling-admissions',
        h2: '滚动录取 + 晚申请策略',
        intro:
          '若错过标准秋/春入学截止日，仍有方案。许多中国大学对 9 月入学接受 11 月至 8 月的滚动录取，尤其层级较低的学校。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**滚动录取**——许多大学（尤其二/三线）接受 11 月至 8 月的滚动申请。录取概率随时间下降（名额渐满），但 6-7 月的强申请仍能进入中国排名 50-300 的大学。',
              '**春季入学后备**——若秋季入学在顶尖大学已满，转向竞争较弱项目 + 春季入学。春季入学更灵活，接受比秋季更晚的申请。',
              '**语言项目过渡**——入读 1 年中文语言项目（春秋滚动录取）。语言年内准备并申请次年 9 月的学位项目。',
              '**硕士论文轨道科研岗位**——大学持续资助新获经费的科研岗位。5-8 月给导师发邮件申请秋季入学——经费岗位会在仲夏开放。',
              '**博士晚申请**——不推荐前 5 大学（4 月前名额满），但只要导师有开放经费岗位，二线大学全年可申。',
              '**同时申请 8-12 个项目**——强力后备策略。多数成功国际生申请 3-5 首选 + 3-5 中档 + 2-3 保底。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '晚申请（5 月后秋季入学）只能进中国排名 50+ 大学，且录取条件渐严（更高语言、较少奖学金）。竞标项目 + 奖学金请提前规划。',
          },
        ],
      },
      {
        id: 'scholarship-deadlines',
        h2: '何时申请奖学金',
        intro:
          '多数奖学金跟踪秋季（9 月）入学截止周期。春季奖学金存在但较少。规划奖学金申请比目标入学提前 6-9 个月。',
        blocks: [
          {
            type: 'table',
            caption: '奖学金申请截止日（按入学）',
            columns: ['奖学金', '秋季截止', '春季截止', '备注'],
            rows: [
              ['CSC 奖学金', '1-4 月（因渠道）', '8-10 月（因渠道）', '最负盛名，每年约 3,000 名'],
              ['院校专项减免', '滚动（尽早）', '滚动', '随入学自动'],
              ['省市奖学金', '3-5 月', '9-11 月', '区域专项'],
              ['孔子学院奖学金', '全年开放', '全年开放', '1 年中文语言'],
              ['本国政府奖学金', '因国而异', '因国而异', 'Fulbright、DAAD、Commonwealth 等'],
              ['外部国际基金会', '1-4 月', '7-10 月', '盖茨、扶轮、福特'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：CSC 与省市奖学金共用秋季入学周期（1-4 月申请）。若错过秋季奖学金周期，春季入学奖学金机会较少但部分项目录取更宽松。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国大学何时开始接受申请？',
        a: '多数中国大学在 11-12 月开放次年 9 月入学的申请。部分精英项目更早（8-10 月开放访问学者、交换项目）。滚动录取持续至 8 月多数大学，但竞争项目 3-4 月截止。',
      },
      {
        q: '2027 年 9 月入学中国大学截止日？',
        a: '2027 年 9 月入学：最选择性的大学（清华、北大、复旦、上海交大、中科大）约 2027 年 3-4 月截止。排名靠前的大学通常 5-6 月截止。次选大学接收滚动申请至 2027 年 8 月。CSC 奖学金截止集中在 2027 年 1-4 月。',
      },
      {
        q: '2027 年 9 月入学现在申请晚不晚？',
        a: '取决于目标大学：（a）最选择性学校——2027 年春一过多数项目就太晚；（b）中排名大学——2027 年年中前有机会但名额渐满；（c）次选大学——开放至 8 月。若已错过窗口，可考虑转向 2028 年 3 月入学。',
      },
      {
        q: '能申请中国 3 月入学吗？',
        a: '能——3 月入学见于许多中国大学，集中于硕士与中文项目。截止日通常在前一年 9-12 月。博士与本科的 3 月入学少见。',
      },
      {
        q: '2027 年 9 月入学的本科申请者需要 CSCA 吗？',
        a: 'CSC 奖学金申请需要——许多大学直接录取也要求。数学全员必考；物理和/或化学取决于大学。2027 年 9 月入学应在 2026 年 11 月（报名 10 月 15-21 日）、12 月或 2027 年 1 月场次完成考试，确保成绩赶在截止前。完整日历：https://cscaprep.academy/exam-dates',
      },
      {
        q: '申请后多久拿到录取？',
        a: '多数中国大学：申请提交后 4-8 周。硕士授课项目：3-6 周。博士与硕士论文轨道：4-12 周（研究计划评审 + 面试加时延）。前 5 大学因委员会评审可达 8-12 周。计划申请后 2-3 月获结果。',
      },
      {
        q: '所有中国大学截止日相同吗？',
        a: '不同——每所中国大学自定截止日。前 5 大学最早截止（4 月秋季）。次选大学截止更晚或滚动录取。始终核实项目官网或向 SICA 确认。',
      },
      {
        q: '滚动录取与截止日录取的区别？',
        a: '滚动录取：申请随时评审；结果 2-6 周。开放窗口内任意时点申请。截止日录取：所有申请截止后集中评审；结果截止后 4-12 周。前 5 中国大学用截止日。二/三线大学多用滚动。',
      },
      {
        q: '何时申请奖学金？',
        a: '最强奖学金（CSC + 省市）秋季入学请 3 月中前申请。CSC 截止日因渠道不同：使馆 1-3 月、大学 2-4 月。院校学费减免随入学自动——尽早提交入学申请。省市奖学金秋季入学 3-5 月截止。',
      },
    ],
    howToSteps: [
      {
        name: '确定目标入学（秋 vs 春）',
        text: '秋季（9 月）入学有最多项目 + 最多奖学金。春季（3 月）入学是秋申未果的后备。博士生：仅秋季（春博入学少见）。硕士：多数项目两者均接受。',
      },
      {
        name: '提前 9-12 个月设申请时间线',
        text: '从目标入学倒推：2026 年 9 月入学 → 2025 年 9 月开始准备。2026 年 3 月入学 → 2025 年 6 月开始。12 个月跨度涵盖语言备考、材料收集、导师匹配（博士）、文书起草。',
      },
      {
        name: '提前 6-9 个月考语言',
        text: '雅思 5.5-6.5+ / 托福 60-90+（英文授课）。HSK 4+（中文授课）。提前 9 个月报考以允许重考。多数项目接受 2 年内成绩。',
      },
      {
        name: '筛选 5-10 所目标大学 + 项目',
        text: '用 /universities 与 /programs 按学科、学位、语言、城市筛选。在各校国际学生办公室官网核实入学 + 截止日。建表格：大学、项目、截止日、语言、奖学金可得性、城市层级、学费。',
      },
      {
        name: '提前 6 个月起草个人陈述 + 学习计划',
        text: '500-1,500 字：为何中国、为何该项目、为何该校、职业目标。针对每所目标大学定制（提及教师、实验室、设施）。博士申请人：另起草 1,500-3,000 字研究计划。',
      },
      {
        name: '提前 6-9 个月申请推荐信',
        text: '学术推荐人（博士：研究导师；硕士：教授）+ 工作推荐人（硕士论文轨道：导师；MBA：经理）。向每位推荐人提供：你的简历、项目研究方向、具体信件要求（1-2 页）。预留 4-6 周写信时间。',
      },
      {
        name: '提前 9-12 个月联系博士导师',
        text: '博士与硕士论文轨道录取取决于导师预匹配。邮件联系 5-10 位潜在导师，附：简历、研究兴趣、研究计划提纲。根据回复迭代。截止日前 3-4 个月确认导师预匹配。',
      },
      {
        name: '并行提交大学申请 + CSC 奖学金',
        text: '秋季入学：11 月-3 月提交大学（滚动 + 早截止大学）；3 月中前提交 CSC。春季入学：7-9 月提交大学；10 月中前提交 CSC。申请 3-5 首选 + 3-5 中档 + 2-3 保底。',
      },
    ],
    ctaTitle: '准备好申请中国大学了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你识别合适入学、规划 9-12 个月申请时间线、根据你的背景筛选目标大学、并申请 CSC + 院校 + 省市奖学金。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/application',
        label: '中国大学申请全流程',
        description: '逐步时间线、材料清单、语言要求、申请渠道、录取后步骤。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: 'CSC 全额资助学费 + 津贴 + 住宿 + 机票。截止日、类别、申请渠道。',
      },
      {
        href: '/china-university-admission-requirements',
        label: '中国大学录取要求',
        description: '本科 / 硕士 / 博士录取要求——GPA、语言、工作经验、推荐信。',
      },
    ],
  },
};
