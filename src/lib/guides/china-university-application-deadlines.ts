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
    title: 'China University Application Deadlines & Intake Timeline (2026-2027)',
    description:
      'Fall (September) and Spring (March) intake deadlines at Chinese universities — by program, by degree level, plus the 9-12 month application timeline for international students.',
    subtitle:
      'Most Chinese universities have two annual intakes (September + March). September is the larger intake with more programs and more scholarships. Plan your application 9-12 months ahead for the smoothest path.',
    stats: [
      { value: 'Sep', label: 'Primary intake (~80% of programs)' },
      { value: 'Mar', label: 'Secondary intake (~20% of programs)' },
      { value: '12 mo', label: 'Recommended planning horizon' },
      { value: 'Apr', label: 'Top-5 universities Sep deadline' },
    ],
    quickAnswer:
      'Chinese universities run two main intakes per year: Fall (September start, ~80% of programs) and Spring (March start, ~20% of programs, mostly master\'s + short-term programs). Fall intake application deadlines span from November (rolling admissions) through August (late applications), but most top-5 universities close by April for September intake. Spring intake deadlines are typically September-December. For strongest scholarship chances, apply by mid-February (CSC and provincial government scholarships share the September intake cycle). Plan 9-12 months ahead: research + language test + supervisor match (PhD) + documents.',
    keyTakeaways: [
      'Two annual intakes: Fall (September, ~80%) + Spring (March, ~20%)',
      'Most top-5 universities close Fall intake applications by April',
      'Rolling admissions start November at many universities',
      'Spring intake deadlines typically September-December for March start',
      'CSC scholarship deadlines (January-April) track the September intake',
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
              '**Fall intake (September)** — primary intake at all Chinese universities. ~80% of programs accept Fall intake. Application deadlines span November (rolling) through August (late apps at less-selective universities). Most scholarships (CSC, provincial) target the Fall cycle. Plan 9-12 months ahead for the smoothest path.',
              '**Spring intake (March)** — secondary intake at ~60% of universities. ~20% of programs accept Spring intake (mostly master\'s, Chinese language, and short-term programs). Application deadlines typically September-December. Fewer scholarships available for Spring intake (some university-specific waivers still apply).',
              '**Bachelor\'s intake** — predominantly Fall. Some programs (especially Chinese-medium + some bachelor\'s at universities with international student quotas) accept Spring intake. Verify with each program.',
              '**Master\'s intake** — Fall at 95%+ of universities; Spring at ~50%. Master\'s programs are more flexible on intake timing.',
              '**PhD intake** — Fall only at 90%+ of universities. Some universities offer Spring PhD intake if a supervisor has funding available. Email potential supervisors 6-9 months ahead to confirm.',
              '**Chinese language program intake** — Spring + Summer + Fall (most flexible). Many universities offer rolling admissions for language programs with start dates every 2-3 months.',
              '**Summer school / short-term programs** — June-August. Separate application process; deadlines typically March-May. Open to currently-enrolled university students.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'When in doubt, plan for the Fall intake. It has the most programs, the most scholarships, and the broadest range of supervisor availability. Use Spring intake as a backup plan if Fall applications don\'t land.',
          },
        ],
      },
      {
        id: 'fall-deadlines',
        h2: 'Fall intake (September) deadlines — by program type',
        intro:
          'September is the primary intake at all Chinese universities. Application deadlines vary by program type and university tier. Use this table to plan your application timeline.',
        blocks: [
          {
            type: 'table',
            caption: 'Fall intake application deadlines by program type',
            columns: ['Program type', 'Earliest deadline', 'Latest deadline', 'Recommended timing'],
            rows: [
              ['Bachelor\'s (English-medium)', 'Nov (rolling)', 'Aug (mid-tier)', 'Apply by March'],
              ['Bachelor\'s (Chinese-medium)', 'Nov (rolling)', 'Jul', 'Apply by February'],
              ['Master\'s (English-medium)', 'Nov (rolling)', 'Aug (mid-tier)', 'Apply by February'],
              ['Master\'s (thesis track)', 'Dec', 'Apr (top-5)', 'Apply by January'],
              ['Master\'s (research grant positions)', 'Open year-round', 'Position filled', 'Email supervisor 6-9mo ahead'],
              ['PhD (English-medium)', 'Dec', 'Apr (top-5)', 'Apply by January'],
              ['PhD (with supervisor pre-match)', 'Open year-round', 'Until position filled', 'Email supervisor 9-12mo ahead'],
              ['MBBS / Clinical Medicine', 'Nov', 'Jun', 'Apply by March'],
              ['Chinese Language (1-year)', 'Open year-round', '~2 weeks before start', 'Apply 6-8 weeks ahead'],
              ['CSC scholarship (parallel)', 'Jan', 'Apr (varies by channel)', 'Apply by mid-March'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: For top-5 universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong, USTC), submit your PhD/master\'s thesis-track application by January for September intake. After March, admission slots fill up and remaining spots go to less-competitive applicants.',
          },
        ],
      },
      {
        id: 'spring-deadlines',
        h2: 'Spring intake (March) deadlines — by program type',
        intro:
          'Spring intake (March start) is available at ~60% of Chinese universities and ~20% of programs — mostly master\'s and Chinese language. PhD and bachelor\'s spring intake is rare.',
        blocks: [
          {
            type: 'table',
            caption: 'Spring intake application deadlines by program type',
            columns: ['Program type', 'Typical deadline', 'Universities offering', 'Notes'],
            rows: [
              ['Chinese Language (1-year / 1-semester)', 'Nov-Dec', '~80%', 'Most flexible intake'],
              ['Master\'s (English-medium, coursework)', 'Sep-Dec', '~50%', 'Check program-by-program'],
              ['Master\'s (thesis track)', 'Sep-Nov', '~20%', 'Stronger at top-50 universities'],
              ['Master\'s (research grant positions)', 'Open year-round', '~30%', 'If supervisor has funding available'],
              ['Bachelor\'s (Chinese-medium)', 'Oct-Dec', '~30%', 'Limited; varies by university'],
              ['Bachelor\'s (English-medium)', 'Rare', '~10%', 'Most English-medium bachelor\'s are Fall only'],
              ['PhD (with funded position)', 'Open year-round', '~20%', 'Pre-match with supervisor required'],
              ['Short-term certificate programs', 'Rolling', '~40%', 'Often 3-6 month programs'],
              ['Summer school', 'Mar-May', '~50%', 'June-August start'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For March intake, plan 6-9 months ahead: spring applications open in March-April, peak in September-October, close by November-December. Late spring applications (December) go to less-selective slots.',
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
        h2: 'Active intakes in the SICA catalog',
        intro:
          'Live list of intake periods currently managed in the SICA system (admin-managed via /admin/intakes). This shows which intake periods have active programs accepting applications.',
        blocks: [
          {
            type: 'table',
            caption: 'Intake periods currently active in the SICA system',
            columns: ['Intake', 'Start', 'Active', 'Notes'],
            rows: [['(loading from SICA database…)', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Intakes are managed live by SICA admins — if you don\'t see your target intake here, contact SICA for the latest opening dates + deadlines.',
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
            columns: ['Scholarship', 'Fall intake deadline', 'Spring intake deadline', 'Notes'],
            rows: [
              ['CSC scholarship', 'Jan-Apr (varies)', 'Aug-Oct (varies)', 'Most prestigious, ~3,000 awards/yr'],
              ['University-specific waivers', 'Rolling (apply early)', 'Rolling', 'Automatic with admission'],
              ['Provincial government scholarships', 'Mar-May', 'Sep-Nov', 'Region-specific'],
              ['Confucius Institute Scholarship', 'Open year-round', 'Open year-round', '1-year Chinese language'],
              ['Home country government scholarships', 'Varies by country', 'Varies', 'Fulbright, DAAD, Commonwealth, etc.'],
              ['External international foundations', 'Jan-Apr', 'Jul-Oct', 'Gates, Rotary, Ford'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: CSC and provincial government scholarships share the September intake cycle (apply January-April). If you miss the Fall scholarship cycle, Spring intake has fewer scholarship opportunities but more relaxed admissions at some programs.',
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
        q: 'When is the China university application deadline for fall 2026?',
        a: 'For Fall 2026 (September start) intake: top-5 universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong, USTC) close by April 2026. Top-20 universities close by May 2026. Top-100 universities typically close by June 2026. Less-selective universities accept rolling applications through August 2026.',
      },
      {
        q: 'Is it too late to apply for fall 2026?',
        a: 'It depends on the target university: (a) top-5 + top-20 — likely too late for most programs; (b) top-50 to top-100 — possible for some programs with strong applications, but slots fill by June; (c) top-100+ universities — open through August, but admission becomes increasingly competitive. Consider pivoting to Spring 2027 (March) intake for the strongest scholarships.',
      },
      {
        q: 'Can I apply for spring intake in China?',
        a: 'Yes — Spring intake (March start) is available at ~60% of Chinese universities and ~20% of programs, mostly master\'s and Chinese language. Application deadlines are typically September-December for the following March start. PhD and bachelor\'s spring intake is rare.',
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
        text: 'Working backward from your target intake: September 2026 intake → start prep by September 2025. March 2026 intake → start prep by June 2025. The 12-month horizon covers language test prep, document gathering, supervisor matching (PhD), and statement drafting.',
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
    title: '2026-2027 中国大学申请截止日与入学时间线',
    description:
      '中国大学秋季（9 月）与春季（3 月）入学截止日——按项目、按学位层级，及国际生 9-12 个月申请时间线。',
    subtitle:
      '多数中国大学一年两次入学（9 月 + 3 月）。9 月是规模更大的入学，项目与奖学金更多。建议提前 9-12 个月规划。',
    stats: [
      { value: '9 月', label: '主入学（约 80% 项目）' },
      { value: '3 月', label: '次入学（约 20% 项目）' },
      { value: '12 个月', label: '推荐规划跨度' },
      { value: '4 月', label: '前 5 大学 9 月入学截止' },
    ],
    quickAnswer:
      '中国大学每年两次主要入学：秋季（9 月入学，约 80% 项目）与春季（3 月入学，约 20% 项目，多数为硕士 + 短期项目）。秋季入学申请截止日从 11 月（滚动）至 8 月（晚申请），多数前 5 大学在 4 月截止 9 月入学。春季入学截止日通常在 9-12 月。为获得最强奖学金，建议在 2 月中前申请（CSC 与省市奖学金共用秋季入学周期）。提前 9-12 个月规划：调研 + 语言考试 + 导师匹配（博士）+ 文件准备。',
    keyTakeaways: [
      '每年两次入学：秋季（9 月，约 80%）+ 春季（3 月，约 20%）',
      '多数前 5 大学秋季入学 4 月截止',
      '滚动录取 11 月起在多数大学开始',
      '春季入学截止日通常 9-12 月对应 3 月入学',
      'CSC 奖学金截止日（1-4 月）跟踪秋季入学',
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
              '**秋季入学（9 月）**——所有中国大学主入学。约 80% 项目接受秋季。申请截止日从 11 月（滚动）至 8 月（次选大学的晚申）。多数奖学金（CSC、省市）针对秋季周期。提前 9-12 个月规划最稳妥。',
              '**春季入学（3 月）**——约 60% 大学的次入学。约 20% 项目接受春季（多数为硕士、中文、短期项目）。截止日通常 9-12 月。春季入学可申请的奖学金较少（部分院校自费减免仍可用）。',
              '**本科入学**——秋季为主。部分项目（尤其中文授课 + 部分有国际生配额的本科）接受春季。逐项目核实。',
              '**硕士入学**——95%+ 大学为秋季；约 50% 为春季。硕士项目对入学时间更灵活。',
              '**博士入学**——90%+ 大学仅秋季。部分大学在导师有经费时提供春季博士入学。提前 6-9 个月邮件确认。',
              '**中文项目入学**——春 + 夏 + 秋（最灵活）。多数大学提供滚动录取，每 2-3 个月开课。',
              '**暑期学校 / 短期项目**——6-8 月。单独申请流程；截止日通常 3-5 月。仅对在校大学生开放。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '如有疑问，以秋季入学为目标。它有最多项目、最多奖学金、最广导师资源。如秋季未获录取，将春季作为后备。',
          },
        ],
      },
      {
        id: 'fall-deadlines',
        h2: '秋季入学（9 月）截止日——按项目类型',
        intro:
          '9 月是所有中国大学的主入学。申请截止因项目类型与大学层级而异。用此表规划你的申请时间线。',
        blocks: [
          {
            type: 'table',
            caption: '秋季入学申请截止日（按项目类型）',
            columns: ['项目类型', '最早截止', '最晚截止', '推荐提交时点'],
            rows: [
              ['本科（英文授课）', '11 月（滚动）', '8 月（中档）', '3 月前提交'],
              ['本科（中文授课）', '11 月（滚动）', '7 月', '2 月前提交'],
              ['硕士（英文授课）', '11 月（滚动）', '8 月（中档）', '2 月前提交'],
              ['硕士（论文轨道）', '12 月', '4 月（前 5）', '1 月前提交'],
              ['硕士（科研岗位）', '全年开放', '岗位招满', '提前 6-9 月联系导师'],
              ['博士（英文授课）', '12 月', '4 月（前 5）', '1 月前提交'],
              ['博士（导师预匹配）', '全年开放', '招满为止', '提前 9-12 月联系导师'],
              ['MBBS / 临床医学', '11 月', '6 月', '3 月前提交'],
              ['中文语言（1 年）', '全年开放', '开学前约 2 周', '提前 6-8 周申请'],
              ['CSC 奖学金（并行）', '1 月', '4 月（因渠道而异）', '3 月中前提交'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：前 5 大学（清华、北大、复旦、上海交大、中科大）的博士/硕士论文轨道申请，9 月入学请在 1 月前提交。3 月后名额渐满。',
          },
        ],
      },
      {
        id: 'spring-deadlines',
        h2: '春季入学（3 月）截止日——按项目类型',
        intro:
          '春季入学（3 月）见于约 60% 中国大学、约 20% 项目——多数为硕士与中文。博士与本科春季入学少见。',
        blocks: [
          {
            type: 'table',
            caption: '春季入学申请截止日（按项目类型）',
            columns: ['项目类型', '典型截止', '提供大学', '备注'],
            rows: [
              ['中文语言（1 年 / 1 学期）', '11-12 月', '约 80%', '最灵活的入学'],
              ['硕士（英文授课，授课型）', '9-12 月', '约 50%', '逐项目确认'],
              ['硕士（论文轨道）', '9-11 月', '约 20%', '前 50 大学更强'],
              ['硕士（科研岗位）', '全年开放', '约 30%', '若导师有经费'],
              ['本科（中文授课）', '10-12 月', '约 30%', '有限，因大学而异'],
              ['本科（英文授课）', '罕见', '约 10%', '多数英文本科仅秋季'],
              ['博士（带经费岗位）', '全年开放', '约 20%', '需导师预匹配'],
              ['短期证书项目', '滚动', '约 40%', '通常 3-6 个月'],
              ['暑期学校', '3-5 月', '约 50%', '6-8 月开学'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '3 月入学请提前 6-9 个月规划：春季申请 3-4 月开放，9-10 月高峰，11-12 月截止。晚春申请（12 月）只能进竞争较弱的名额。',
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
        h2: 'SICA 目录中的活跃入学',
        intro:
          'SICA 系统当前管理的入学期列表（管理员通过 /admin/intakes 管理）。展示哪些入学期正在接受申请。',
        blocks: [
          {
            type: 'table',
            caption: 'SICA 系统当前活跃的入学期',
            columns: ['入学', '开学', '活跃', '备注'],
            rows: [['(从 SICA 数据库加载中…)', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '入学由 SICA 管理员实时管理——若目标入学未列出，请联系 SICA 获取最新开放日 + 截止日。',
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
        q: '2026 秋季入学中国大学截止日？',
        a: '2026 秋季（9 月入学）：前 5 大学（清华、北大、复旦、上海交大、中科大）2026 年 4 月截止。前 20 大学 5 月截止。前 100 大学通常 6 月截止。次选大学接收滚动申请至 2026 年 8 月。',
      },
      {
        q: '2026 秋季现在申请晚不晚？',
        a: '取决于目标大学：（a）前 5 + 前 20——多数项目大概率太晚；（b）前 50 至 100——部分项目可能但名额 6 月前渐满；（c）前 100+——开放至 8 月但竞争激烈。可考虑转向 2027 春季（3 月）入学以保最强奖学金。',
      },
      {
        q: '能申请中国春季入学吗？',
        a: '能——春季入学（3 月）见于约 60% 中国大学、约 20% 项目，多数为硕士与中文。截止日通常 9-12 月对应次年 3 月入学。博士与本科春季入学少见。',
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
