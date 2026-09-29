import type { LocalizedGuide } from './types';

/**
 * "Peking University vs Fudan University" — regional/comparison
 * article #2 of 4 (docs/regional-comparisons-4-article-plan.md).
 * Target queries: "peking university vs fudan", "fudan vs peking
 * university", "beijing or shanghai for international students",
 * "fudan university worth it".
 *
 * Static comparison content. Facts (deadline bands, tuition bands,
 * CSCA combinations, scholarship stacks) mirror the shipped
 * university profiles and Phase 136 admissions guides. The
 * operational hook is the calendar asymmetry: Fudan's application
 * windows close materially earlier (Dec–Mar; CSC Dec–Jan) than
 * PKU's (Mar 31–May 31).
 */
export const pekingUniversityVsFudanGuide: LocalizedGuide = {
  en: {
    slug: 'peking-university-vs-fudan',
    eyebrow: 'COMPARISON · PKU VS FUDAN',
    title: 'Peking University vs Fudan University — Beijing Flagship or Shanghai Flagship?',
    description:
      'Peking vs Fudan compared for international applicants: subjects, deadlines (Fudan closes earlier), tuition, scholarships, and Beijing-vs-Shanghai city choice.',
    subtitle:
      'This comparison is as much about the two cities as the two universities. Peking University is the national flagship in the political and cultural capital; Fudan is Shanghai\'s comprehensive flagship in China\'s financial center. Academically the overlap is wide — both are elite across humanities, economics, medicine, and math — but the application calendars run on different clocks (Fudan closes December–March, with CSC nominations as early as December–January, while PKU runs to March 31–May 31), the scholarship stacks sit in different municipal systems, and the city you choose shapes your internship market and your daily life for years. This guide compares both layers so you can decide with the full picture.',
    stats: [
      { value: '1898 / 1905', label: 'PKU / Fudan founded' },
      { value: 'Dec–Mar', label: 'Fudan deadlines — earliest of the flagships' },
      { value: 'Mar 31–May 31', label: 'PKU deadline band for most programs' },
      { value: '2 cities', label: 'Beijing (capital) vs Shanghai (financial hub)' },
    ],
    quickAnswer:
      'Peking University is the national comprehensive flagship — strongest in humanities, social sciences, and basic sciences — located in Beijing, the political and cultural capital. Fudan University is Shanghai\'s comprehensive flagship — strongest in journalism, economics, and medicine, with an elite math department — located in China\'s financial center. Both require the CSCA from the 2026 intake and charge similar tuition (~¥30,000–¥60,000/year for international bachelor\'s), but Fudan\'s application calendar closes materially earlier (December–March, with CSC nominations closing December–January) while PKU\'s runs March 31–May 31. Choose by subject fit first, then by city — and if you apply to both, build your timeline around Fudan\'s earlier deadlines.',
    keyTakeaways: [
      'PKU = national flagship in the capital (humanities, social sciences, basic sciences); Fudan = Shanghai flagship (journalism, economics, medicine, math)',
      'The calendars do not match: Fudan closes most programs December–March and its CSC window closes December–January — the earliest of China\'s flagships; PKU runs March 31–May 31',
      'Both require the CSCA from 2026; combinations vary by school at Fudan (medicine/MBBS typically Math + Chemistry) and by program at PKU (humanities: Humanities Chinese + Math; sciences: Math + Physics/Chemistry)',
      'Tuition bands are similar (~¥30,000–¥60,000/year bachelor\'s) but all-in costs skew slightly higher in Shanghai (~¥55,000–¥95,000 vs ~¥50,000–¥80,000 per year at PKU)',
      'Different municipal scholarship layers: Beijing Government Scholarship at PKU vs Shanghai Government Scholarship (Class A full / Class B tuition) at Fudan — on top of the shared CSC and university scholarships',
      'The essay differs: PKU asks for a study plan (800–1,500 words); Fudan\'s personal statement doubles as a writing sample for journalism and humanities programs',
    ],
    sections: [
      {
        id: 'at-a-glance',
        h2: 'Peking vs Fudan at a glance',
        intro:
          'One table, both layers of the decision — the university and the city. The deadline rows are the ones that surprise applicants every cycle.',
        blocks: [
          {
            type: 'table',
            caption: 'Side by side',
            columns: ['Dimension', 'Peking University', 'Fudan University'],
            rows: [
              ['Founded', '1898 (Beijing)', '1905 (Shanghai)'],
              ['Identity', 'National comprehensive flagship', 'Shanghai\'s comprehensive flagship'],
              ['City', 'Beijing — political & cultural capital', 'Shanghai — financial & commercial hub'],
              ['Signature strengths', 'Humanities, social sciences, basic sciences, medicine, law', 'Journalism, economics & management, medicine, math, international relations'],
              ['Most fall-intake deadlines', 'March 31 – May 31', 'December – March (earlier)'],
              ['CSC scholarship window', 'Typical CSC timing (early in the calendar year)', 'Closes December – January — start documents by October'],
              ['Bachelor\'s tuition (intl.)', '~¥30,000–¥60,000/year', '~¥30,000–¥60,000/year'],
              ['All-in annual cost', '~¥50,000–¥80,000', '~¥55,000–¥95,000'],
              ['CSCA (from 2026 intake)', 'Humanities Chinese + Math; Math + Physics/Chemistry', 'Varies by school; medicine/MBBS typically Math + Chemistry'],
              ['Chinese-taught language bar', 'HSK 5+ typical', 'HSK 5–6 per program'],
              ['Core essay', 'Study plan, 800–1,500 words', 'Personal statement — doubles as a writing sample for journalism/humanities'],
              ['Interviews', 'Program-dependent (multi-round for Yenching)', 'Common across many programs'],
              ['Municipal scholarship', 'Beijing Government Scholarship', 'Shanghai Government Scholarship (Class A full / Class B tuition)'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The one-sentence version: choose PKU for the national-flagship humanities and sciences experience in the capital; choose Fudan for journalism, economics, and medicine inside China\'s commercial capital — and whichever you pick, Fudan\'s calendar means your documents need to be ready months earlier.',
          },
        ],
      },
      {
        id: 'identity',
        h2: 'Two flagships, two cities',
        intro:
          'Both are C9 League, Double First-Class comprehensive universities with wide coverage across the arts and sciences. The difference is which China they sit at the center of.',
        blocks: [
          {
            type: 'h3',
            text: 'Peking University — the capital\'s comprehensive flagship',
            body: 'Founded in 1898 as China\'s first national university, PKU anchors the country\'s academic and intellectual life. Its humanities and social-science departments set the national standard, its basic-science departments feed the country\'s top research institutes, and its Health Science Center anchors one of China\'s strongest medical systems. For international students, Beijing adds the national institutions — central government, state media headquarters, and the largest concentration of embassies and international organizations in mainland China.',
          },
          {
            type: 'h3',
            text: 'Fudan University — Shanghai\'s comprehensive flagship',
            body: 'Founded in 1905, Fudan is the leading comprehensive university of the Yangtze Delta and Shanghai\'s most internationally connected campus. Its School of Journalism is widely regarded as one of China\'s two best, its economics and management programs feed the country\'s financial industry, its Shanghai Medical College is one of the oldest and strongest in China, and its mathematics department carries a top-tier national reputation. For international students, Shanghai adds the regional headquarters of multinational firms, the stock exchange, and China\'s most internationally flavored daily life.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Both universities are members of the C9 League and sit in the top tier of the Double First-Class initiative; both appear near the top of mainland-China rankings, with the exact ordering varying by ranking and year.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Who is stronger in which subject?',
        intro:
          'The overlap between PKU and Fudan is much wider than the PKU–Tsinghua overlap — both are comprehensive universities. Relative strength still separates them by field.',
        blocks: [
          {
            type: 'table',
            caption: 'Relative strength by field',
            columns: ['Field', 'Lean', 'Why'],
            rows: [
              ['Humanities (lit, history, philosophy)', 'PKU', 'The national center for humanities scholarship'],
              ['Journalism & communication', 'Fudan', 'One of China\'s top two journalism schools; the industry\'s Shanghai base'],
              ['Economics & management', 'Both', 'PKU (Guanghua, CCER tradition) vs Fudan School of Economics — both feed elite finance; Shanghai location favors internships'],
              ['Mathematics', 'Both', 'Both top-tier nationally; compare specific research groups'],
              ['Physics / chemistry / basic sciences', 'PKU edge', 'Broader institute links in the capital'],
              ['Medicine', 'Both', 'PKU Health Science Center vs Fudan Shanghai Medical College — both top-tier with major hospital systems'],
              ['International relations / politics', 'Both', 'PKU\'s SIS vs Fudan\'s IR school — different networks (diplomatic vs commercial)'],
              ['Law', 'PKU edge', 'One of China\'s "big four" law schools'],
              ['Data science / AI', 'Both', 'Both investing heavily; compare English-taught program availability'],
              ['Chinese-language immersion environment', 'Fudan edge', 'Shanghai is more cosmopolitan; Mandarin remains the campus language at both'],
            ],
          },
          {
            type: 'p',
            text: 'The practical read: the humanities-and-institutions profile leans PKU; the media-and-markets profile leans Fudan. In overlapping fields (economics, math, medicine), compare the specific program\'s curriculum, English-taught availability, and hospital or industry attachments rather than the university label.',
          },
        ],
      },
      {
        id: 'admissions-calendars',
        h2: 'The calendar asymmetry: Fudan closes first',
        intro:
          'This is the most operationally important difference between the two. Applicants who plan around PKU\'s spring deadlines routinely miss Fudan entirely.',
        blocks: [
          {
            type: 'h3',
            text: 'Fudan: December–March, with CSC closing December–January',
            body: 'Fudan runs the earliest calendar of China\'s flagship universities. Most fall-intake programs close between December and March, and the CSC scholarship window at Fudan closes December–January — months before many applicants have even started their documents. If Fudan is on your list, start transcripts, recommendation letters, and language tests by October. Fudan also interviews applicants for many programs, and its personal statement (800–1,500 words) is read as a writing sample for journalism and humanities programs — it carries more weight than a generic study plan.',
          },
          {
            type: 'h3',
            text: 'PKU: March 31–May 31, with competitive programs pulling to January 31',
            body: 'PKU\'s main window runs March 31–May 31 through the studyatpku.com portal, though the most competitive programs (Yenching Academy, PHBS, applied math, AI) are safest submitted by January 31. The extra months matter for CSCA scheduling: a spring exam sitting can still feed a PKU application in the same cycle, while Fudan\'s earlier deadlines usually require an earlier sitting.',
          },
          {
            type: 'table',
            caption: 'Timeline comparison for the same fall intake',
            columns: ['Milestone', 'Fudan', 'PKU'],
            rows: [
              ['Start documents by', 'October', 'December–January (January if targeting Jan-31 programs)'],
              ['CSC nomination window', 'Closes December–January', 'Typical CSC window, earlier in the calendar year'],
              ['Most program deadlines', 'December–March', 'March 31–May 31'],
              ['Latest realistic CSCA sitting', 'Late in the previous year — plan for it', 'A spring sitting can still work for the main window'],
              ['Interviews', 'Common across many programs', 'Program-dependent; multi-round for Yenching'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Applying to both? The correct sequencing is: prepare the shared core (transcripts, recommendations, language tests) by October, submit Fudan first (December–January if you want CSC), then refine the same package for PKU\'s March–May window. Verify every date on the official portals for your cycle — windows shift year to year.',
          },
        ],
      },
      {
        id: 'cost-scholarships',
        h2: 'Cost and scholarships: Shanghai runs slightly higher',
        intro:
          'Tuition bands are nearly identical; the difference shows up in all-in annual cost and in which municipal scholarship system you are stacking.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost comparison (international bachelor\'s, per year)',
            columns: ['Cost item', 'Peking University (Beijing)', 'Fudan University (Shanghai)'],
            rows: [
              ['Tuition', '~¥30,000–¥60,000', '~¥30,000–¥60,000'],
              ['All-in annual cost (tuition + living)', '~¥50,000–¥80,000', '~¥55,000–¥95,000'],
              ['Dormitory', '~¥1,200–¥3,000/month', '~¥1,200–¥3,000/month'],
              ['City cost character', 'Expensive but slightly softer than Shanghai', 'China\'s priciest rental market for off-campus housing'],
              ['Application fee', '~¥400–¥800', '~¥400–¥800'],
            ],
          },
          {
            type: 'h3',
            text: 'The scholarship stack: same pyramid, different municipal layer',
            body: 'Both universities sit inside the Chinese Government Scholarship (CSC — tuition waiver, dorm, ~¥2,000–3,000 monthly stipend) and each runs its own international-student scholarships. The municipal layer differs: PKU applicants stack the Beijing Government Scholarship (tuition waiver plus ~¥3,000/month, one year renewable), while Fudan applicants stack the Shanghai Government Scholarship — Class A (full: tuition, accommodation, and stipend) or Class B (tuition). Because Fudan\'s CSC window closes December–January, scholarship-driven applicants must nominate earlier there than at PKU.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Net-cost rule of thumb: with an equivalent scholarship package, the two are close; without scholarships, budget roughly ¥5,000–¥15,000 more per year for Shanghai. Verify current figures with each university\'s international-student office before committing a budget.',
          },
        ],
      },
      {
        id: 'city-career',
        h2: 'Beijing vs Shanghai: the city decision',
        intro:
          'You are choosing four years of daily life and your default internship market. The two cities genuinely differ.',
        blocks: [
          {
            type: 'ul',
            items: [
              'Beijing: central government, state media headquarters, embassies and international organizations, national cultural institutions — the natural base for policy, journalism (state media), diplomacy-track, and academic careers',
              'Shanghai: the stock exchange, multinational regional HQs, finance, consulting, luxury and consumer brands, the country\'s busiest port economy — the natural base for finance and corporate careers',
              'Language environment: both campuses run on Mandarin; Shanghai street life mixes more English and dialect, Beijing\'s international life clusters around the embassy district',
              'Costs: both are tier-1 expensive; Shanghai\'s off-campus rental market runs hotter',
              'Climate: both have hot summers and chilly winters; Beijing is drier and dustier in spring, Shanghai is more humid',
              'Travel: Beijing anchors the north (high-speed rail to Tianjin, the mountains, the coast); Shanghai anchors the Yangtze Delta (Hangzhou, Suzhou, Nanjing within an hour)',
            ],
          },
          {
            type: 'p',
            text: 'For career outcomes, the honest summary: a Fudan economics student and a PKU economics student compete for the same elite jobs, but their default internship pipelines differ — state institutions in Beijing versus multinational finance in Shanghai. Pick the pipeline that matches the career you actually want.',
          },
        ],
      },
      {
        id: 'decision',
        h2: 'Decision framework: choose PKU or Fudan in four questions',
        intro: 'Work through these in order — the calendar question decides itself for most applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              'What is your subject? Humanities, law, and basic sciences lean PKU; journalism, and economics-with-finance-internships lean Fudan; economics, math, and medicine are genuinely close — compare the specific programs.',
              'Is your timeline realistic for Fudan? Documents by October, CSC by December–January, programs by December–March. If you are starting late in the cycle, PKU\'s March–May window may be the only flagship window still open.',
              'Which city fits your career? Policy, media, and academic tracks point to Beijing; finance, corporate, and internationally flavored life points to Shanghai.',
              'Do the program details break the tie? Compare English-taught availability, hospital attachments (medicine), internship pipelines, and the specific CSCA combination each school requires.',
            ],
          },
          {
            type: 'ul',
            items: [
              'Choose PKU if: your subject is humanities/law/basic sciences, you want the national-flagship environment and institutions access, or your timeline is spring-heavy',
              'Choose Fudan if: your subject is journalism or economics, you want the Shanghai market, or you can commit to the earlier December–January CSC calendar',
              'Choose both if: documents are ready by October — submit Fudan first, then reuse the core package for PKU\'s later window',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The sequencing rule that saves applicants every year: Fudan first, PKU second. The shared core (transcripts, recommendations, language tests) is prepared once; only the essay differs meaningfully — Fudan\'s writing-sample personal statement versus PKU\'s research-flavored study plan.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Which is better, Peking University or Fudan University?',
        a: 'Both are top-tier C9 comprehensive universities; the ordering changes by ranking and year. The practical difference is fit: PKU is stronger in humanities, law, and basic sciences in the capital, while Fudan is stronger in journalism and pairs elite economics and medicine with the Shanghai market. Choose by subject and city, not by a single league table.',
      },
      {
        q: 'Why do Fudan deadlines close earlier than PKU\'s?',
        a: 'Fudan runs the earliest application calendar of China\'s flagship universities: most programs close December–March and its CSC scholarship window closes December–January. PKU\'s main window runs March 31–May 31. The calendars are set independently each cycle — always verify current dates on the official portals.',
      },
      {
        q: 'Can I apply to both PKU and Fudan in the same cycle?',
        a: 'Yes, and the sequencing is straightforward: prepare the shared core (transcripts, two recommendations, language tests) by October, submit Fudan first (December–January for CSC), then refine the same materials for PKU\'s March–May window. The essays differ — Fudan\'s personal statement doubles as a writing sample, PKU asks for a study plan.',
      },
      {
        q: 'Do both universities require the CSCA?',
        a: 'Yes, from the 2026 intake. At PKU, humanities programs typically specify Humanities Chinese + Math and science programs Math + Physics/Chemistry. At Fudan, combinations vary by school, with medicine and the English MBBS route typically specifying Math + Chemistry. Verify the exact combination on each program\'s page before booking CSCA subjects.',
      },
      {
        q: 'Which is better for economics or finance careers?',
        a: 'Both are elite. PKU\'s economics ecosystem (Guanghua and the CCER tradition) is the stronger academic brand; Fudan\'s School of Economics places graduates into Shanghai\'s finance industry with unmatched internship proximity. If you want a finance career in Shanghai, Fudan\'s location is a real advantage; if you want the strongest national economics brand, PKU has the edge.',
      },
      {
        q: 'Which is better for journalism?',
        a: 'Fudan. Its School of Journalism is widely regarded as one of China\'s top two, and the personal statement in its application is explicitly read as a writing sample. PKU\'s journalism and communication school is also strong — but for this specific field, Fudan is the lean.',
      },
      {
        q: 'Is Shanghai more expensive than Beijing for students?',
        a: 'Tuition and university dorms are comparable; the difference is in living costs. Shanghai\'s off-campus rental market runs hotter, which is why Fudan\'s all-in annual estimate (~¥55,000–¥95,000) sits above PKU\'s (~¥50,000–¥80,000). On campus with a dorm place, the gap narrows considerably.',
      },
      {
        q: 'How do the scholarships differ between the two?',
        a: 'Both share the CSC (full funding: tuition, dorm, stipend) and their own university scholarships. The municipal layer differs: PKU stacks the Beijing Government Scholarship (tuition waiver plus ~¥3,000/month stipend), while Fudan stacks the Shanghai Government Scholarship in Class A (full: tuition, accommodation, stipend) or Class B (tuition only). Note that Fudan\'s CSC window closes December–January, earlier than PKU\'s.',
      },
    ],
    howToSteps: [
      {
        name: 'Map your subject to the right flagship',
        text: 'Humanities, law, and basic sciences lean PKU; journalism and finance-oriented economics lean Fudan; economics, math, and medicine are close calls — shortlist specific programs at both.',
      },
      {
        name: 'Build the shared core by October',
        text: 'Transcripts, two recommendation letters (associate professor or above), passport copy, and language tests (HSK 5–6 for Chinese-taught; IELTS/TOEFL for English-taught) serve both applications — but only if they are ready before Fudan\'s December window opens.',
      },
      {
        name: 'Verify CSCA combinations at both schools',
        text: 'Check each target program\'s specified CSCA subject combination (PKU: Humanities Chinese + Math or Math + Physics/Chemistry; Fudan: varies by school, medicine typically Math + Chemistry) and book a sitting that meets the earlier Fudan deadline.',
      },
      {
        name: 'Write two distinct essays',
        text: 'Fudan\'s personal statement should showcase writing quality (it is read as a writing sample for journalism and humanities); PKU\'s study plan should showcase academic direction and fit with faculty research. Same story, two registers.',
      },
      {
        name: 'Submit Fudan first, PKU second',
        text: 'File Fudan in December–January (especially if pursuing CSC through Fudan, which closes December–January), then refine and submit PKU before its March 31–May 31 window (by January 31 for the most competitive programs).',
      },
      {
        name: 'Stack the municipal scholarship',
        text: 'Wherever you land, nominate across all three layers — CSC, the university\'s own scholarship, and the municipal layer (Beijing Government at PKU; Shanghai Government Class A/B at Fudan) — rather than betting on a single channel.',
      },
    ],
    ctaTitle: 'Deciding between PKU and Fudan?',
    ctaSubtitle:
      'SICA counselors compare your target programs across both universities, sequence your applications around Fudan\'s earlier deadlines, and verify every CSCA combination and scholarship layer. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university',
        label: 'Peking University profile',
        description: 'Schools, signature programs, history, scholarships, cost of attendance.',
      },
      {
        href: '/fudan-university',
        label: 'Fudan University profile',
        description: 'Shanghai\'s flagship: journalism, economics, medicine, and campus life.',
      },
      {
        href: '/fudan-university-admissions-guide',
        label: 'Fudan University admissions guide',
        description: 'The earliest calendar in China — deadlines, documents, and CSC timing.',
      },
    ],
  },
  zh: {
    slug: 'peking-university-vs-fudan',
    eyebrow: '对比 · 北大 VS 复旦',
    title: '北京大学 vs 复旦大学 — 选北京旗舰还是上海旗舰？',
    description:
      '北大与复旦全方位对比：学科优势、截止日期（复旦更早）、学费、奖学金，以及北京与上海的城市选择。',
    subtitle:
      '这场对比一半是选大学，一半是选城市。北京大学是政治文化首都的全国旗舰；复旦大学是中国金融中心上海的综合旗舰。学术上两校高度重叠——人文、经济、医学、数学都是双方的长项——但两校的申请日历走的是不同的时钟（复旦12月至3月截止，CSC提名12月至1月就关闭；北大则到3月31日至5月31日），奖学金体系分属不同的市政府系统，而你选择的城市将塑造你未来几年的实习市场与日常生活。本指南把两层对比都讲清楚，帮你做全局决策。',
    stats: [
      { value: '1898 / 1905', label: '北大 / 复旦建校' },
      { value: '12–3月', label: '复旦截止——旗舰高校中最早' },
      { value: '3月31–5月31日', label: '北大多数项目截止区间' },
      { value: '两座城', label: '北京（首都）vs 上海（金融中心）' },
    ],
    quickAnswer:
      '北京大学是位于首都的全国综合性旗舰——人文、社科与基础理科最强；复旦大学是上海的综合性旗舰——新闻、经济与医学最强，数学同样是全国顶尖。自2026级起两校都要求CSCA，学费区间相近（国际本科生约¥30,000–¥60,000/年），但复旦的申请日历明显更早（多数项目12月至3月截止，CSC窗口12月至1月关闭），而北大持续到3月31日至5月31日。先按专业匹配选择，再按城市选择——如果两所都申，请以复旦更早的截止日期来倒排时间表。',
    keyTakeaways: [
      '北大 = 首都的全国旗舰（人文、社科、基础理科）；复旦 = 上海旗舰（新闻、经济、医学、数学）',
      '日历不同步：复旦多数项目12–3月截止，CSC窗口12–1月关闭——中国旗舰高校中最早；北大持续到3月31日–5月31日',
      '2026级起两校都要求CSCA：复旦按院系而异（医学/MBBS通常为数学+化学）；北大按项目而异（文科：人文中文+数学；理科：数学+物理/化学）',
      '学费区间相近（本科约¥30,000–¥60,000/年），但全年总成本上海略高（复旦约¥55,000–¥95,000 vs 北大约¥50,000–¥80,000）',
      '市级奖学金层级不同：北大为北京市政府奖学金；复旦为上海市政府奖学金（A类全额/B类学费）——叠加在共享的CSC与校级奖学金之上',
      '文书不同：北大要求学习计划（800–1,500字）；复旦的个人陈述在新闻与人文项目中兼作写作样本',
    ],
    sections: [
      {
        id: 'at-a-glance',
        h2: '北大 vs 复旦 一览',
        intro: '一张表覆盖决策的两层——大学与城市。截止日期那几行，是每届申请者都会感到意外的地方。',
        blocks: [
          {
            type: 'table',
            caption: '并排对比',
            columns: ['维度', '北京大学', '复旦大学'],
            rows: [
              ['建校时间', '1898年（北京）', '1905年（上海）'],
              ['定位', '全国综合性旗舰', '上海市综合性旗舰'],
              ['城市', '北京——政治文化首都', '上海——金融商业中心'],
              ['标志性学科', '人文、社科、基础理科、医学、法学', '新闻、经济管理、医学、数学、国际关系'],
              ['多数秋季入学截止', '3月31日–5月31日', '12月–3月（更早）'],
              ['CSC奖学金窗口', '常规CSC节奏（年初为主）', '12月–1月关闭——10月就要备齐材料'],
              ['本科国际生学费', '约¥30,000–¥60,000/年', '约¥30,000–¥60,000/年'],
              ['全年总成本', '约¥50,000–¥80,000', '约¥55,000–¥95,000'],
              ['CSCA（2026级起）', '人文中文+数学；数学+物理/化学', '因院系而异；医学/MBBS通常数学+化学'],
              ['中文授课语言门槛', '通常HSK 5级以上', '按项目HSK 5–6级'],
              ['核心文书', '学习计划，800–1,500字', '个人陈述——新闻/人文项目兼作写作样本'],
              ['面试', '因项目而异（燕京为多轮）', '多数项目常见'],
              ['市级奖学金', '北京市政府奖学金', '上海市政府奖学金（A类全额/B类学费）'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '一句话总结：想要首都的全国旗舰人文学科与理科体验，选北大；想要中国商业中心里的新闻、经济与医学，选复旦——而无论选哪所，复旦的日历都意味着你的材料要提前几个月备好。',
          },
        ],
      },
      {
        id: 'identity',
        h2: '两所旗舰，两座城市',
        intro: '两校都是C9联盟、双一流的综合性大学，文理学科覆盖面都很广。区别在于它们各自处在哪种中国的中心。',
        blocks: [
          {
            type: 'h3',
            text: '北京大学——首都的综合性旗舰',
            body: '北大1898年建校，是中国第一所国立大学，锚定着国家的学术与思想生活。它的人文社科院系代表着全国标准，基础理科院系向顶级科研院所输送人才，医学部支撑着中国最强的医学体系之一。对国际学生而言，北京还意味着国家级机构——中央政府、国家媒体总部，以及中国大陆最密集的使馆与国际组织。',
          },
          {
            type: 'h3',
            text: '复旦大学——上海的综合性旗舰',
            body: '复旦1905年建校，是长三角的领军综合大学，也是上海国际化程度最高的校园。新闻学院被广泛认为是中国最好的两所之一，经济与管理项目向金融业输送人才，上海医学院是中国历史最悠久、实力最强的医学院之一，数学系拥有全国顶尖的声誉。对国际学生而言，上海还意味着跨国公司区域总部、证券交易所，以及中国大陆最具国际色彩的日常生活。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '两校均为C9联盟成员、双一流建设顶尖层次；在中国大陆高校排名中均位居前列，具体排序随排名与年份变化。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '各学科谁更强？',
        intro: '北大与复旦的重叠度远高于北大与清华——两所都是综合性大学。但按学科看，相对优势仍然分明。',
        blocks: [
          {
            type: 'table',
            caption: '分学科相对优势',
            columns: ['学科领域', '倾向', '原因'],
            rows: [
              ['人文（文学、历史、哲学）', '北大', '中国人文学术的国家中心'],
              ['新闻传播', '复旦', '中国最好的两所新闻学院之一；行业根基在上海'],
              ['经济与管理', '两校', '北大（光华与CCER传统）vs 复旦经济学院——同属精英序列；上海区位利于实习'],
              ['数学', '两校', '均为全国顶尖；对比具体研究方向'],
              ['物理/化学/基础理科', '北大略强', '首都的科研院所网络更广'],
              ['医学', '两校', '北大医学部 vs 复旦上海医学院——均为顶尖并拥有大型医院体系'],
              ['国际关系/政治学', '两校', '北大国关 vs 复旦国关——网络不同（外交系统 vs 商业系统）'],
              ['法学', '北大略强', '中国"四大"法学院之一'],
              ['数据科学/AI', '两校', '双方都在重投；对比英语授课项目开设情况'],
              ['中文沉浸环境', '复旦略强', '上海更国际化；但两校校园语言都是普通话'],
            ],
          },
          {
            type: 'p',
            text: '实际判断："人文+体制"画像倾向北大；"媒体+市场"画像倾向复旦。在重叠领域（经济、数学、医学），请对比具体项目的课程、英语授课可选性以及医院或产业挂钩，而不是看学校的牌子。',
          },
        ],
      },
      {
        id: 'admissions-calendars',
        h2: '日历不对称：复旦先截止',
        intro: '这是两校之间最具操作意义的差异。每年都有按北大春季截止日期规划的考生，完全错过复旦。',
        blocks: [
          {
            type: 'h3',
            text: '复旦：12–3月，CSC 12–1月关闭',
            body: '复旦拥有中国旗舰高校中最早的申请日历。多数秋季入学项目在12月至3月之间截止，而复旦的CSC奖学金窗口在12月至1月关闭——比很多申请者开始准备材料还早几个月。如果复旦在你的名单上，请在10月前开始准备成绩单、推荐信和语言考试。复旦的多数项目还有面试环节，且个人陈述（800–1,500字）在新闻与人文项目中被当作写作样本来审读——它的分量重于一般的学习计划。',
          },
          {
            type: 'h3',
            text: '北大：3月31日–5月31日，竞争项目提前到1月31日',
            body: '北大的主窗口通过 studyatpku.com 门户运行至3月31日–5月31日，但最竞争的项目（燕京学堂、汇丰商学院、数学、AI方向）最保险在1月31日前提交。多出来的几个月对CSCA报考很关键：春季的考试场次仍可赶上北大同申请季，而复旦更早的截止通常要求更早的场次。',
          },
          {
            type: 'table',
            caption: '同一秋季入学的进度对比',
            columns: ['节点', '复旦', '北大'],
            rows: [
              ['开始备料', '10月', '12月–1月（目标1月31日项目则1月前）'],
              ['CSC提名窗口', '12月–1月关闭', '常规CSC窗口，年初为主'],
              ['多数项目截止', '12月–3月', '3月31日–5月31日'],
              ['最晚可行的CSCA场次', '上年年末——需提前规划', '春季场次仍可赶上主窗口'],
              ['面试', '多数项目常见', '因项目而异；燕京为多轮'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '两所都申？正确顺序是：10月前备好共享核心材料（成绩单、推荐信、语言成绩），先提交复旦（如走CSC则12–1月），再用同一套材料打磨后赶上北大3–5月的窗口。每个日期都要在你的申请季到官方门户核实——窗口逐年调整。',
          },
        ],
      },
      {
        id: 'cost-scholarships',
        h2: '费用与奖学金：上海略高',
        intro: '学费区间几乎一致；差异体现在全年总成本，以及你叠加的是哪个市级奖学金体系。',
        blocks: [
          {
            type: 'table',
            caption: '费用对比（国际本科生，每年）',
            columns: ['费用项目', '北京大学（北京）', '复旦大学（上海）'],
            rows: [
              ['学费', '约¥30,000–¥60,000', '约¥30,000–¥60,000'],
              ['全年总成本（学费+生活）', '约¥50,000–¥80,000', '约¥55,000–¥95,000'],
              ['宿舍', '约¥1,200–¥3,000/月', '约¥1,200–¥3,000/月'],
              ['城市成本特征', '昂贵但略低于上海', '校外租房为中国最贵市场'],
              ['申请费', '约¥400–¥800', '约¥400–¥800'],
            ],
          },
          {
            type: 'h3',
            text: '奖学金体系：同一金字塔，不同的市级层',
            body: '两校都在中国政府奖学金（CSC——学费减免、住宿、每月约¥2,000–3,000补助）之内，并各自设有国际学生奖学金。市级层级不同：北大申请者叠加北京市政府奖学金（学费减免加约¥3,000/月，一年期可续）；复旦申请者叠加上海市政府奖学金——A类（全额：学费、住宿、补助）或B类（学费）。由于复旦的CSC窗口在12月至1月关闭，冲奖学金的申请者在复旦必须更早提名。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '净成本经验法则：奖学金等同时两校接近；无奖学金时，上海每年预算大约多¥5,000–¥15,000。确定预算前请向两校国际学生办公室核实最新数字。',
          },
        ],
      },
      {
        id: 'city-career',
        h2: '北京 vs 上海：城市的选择',
        intro: '你选择的是未来几年的日常生活和默认的实习市场。两座城市确实不同。',
        blocks: [
          {
            type: 'ul',
            items: [
              '北京：中央政府、国家媒体总部、使馆与国际组织、国家级文化机构——政策、（国家）媒体、外交方向与学术生涯的天然基地',
              '上海：证券交易所、跨国公司区域总部、金融、咨询、奢侈品与消费品牌、全国最繁忙的港口经济——金融与企业职业的天然基地',
              '语言环境：两校校园都讲普通话；上海街头生活混入更多英语和方言，北京的国际生活集中在使馆区周边',
              '成本：同属一线昂贵；上海校外租房更热',
              '气候：两城都是夏热冬冷；北京春季更干燥多风，上海更潮湿',
              '出行：北京锚定北方（高铁到天津、山地与海岸）；上海锚定长三角（杭州、苏州、南京在一小时圈内）',
            ],
          },
          {
            type: 'p',
            text: '就职业结果的诚实总结：复旦经济学生和北大经济学生竞争同一批精英岗位，但默认的实习管道不同——北京的国家机构 vs 上海的跨国金融。选那条与你真正想要的职业一致的管道。',
          },
        ],
      },
      {
        id: 'decision',
        h2: '决策框架：四个问题选定北大或复旦',
        intro: '按顺序回答——对多数申请者而言，日历问题会自己给出答案。',
        blocks: [
          {
            type: 'ol',
            items: [
              '你的目标专业是什么？人文、法学与基础理科倾向北大；新闻与金融导向的经济倾向复旦；经济、数学、医学确实接近——对比具体项目。',
              '你的时间表赶得上复旦吗？10月备料、12–1月CSC、12–3月项目截止。如果这个申请季起步已晚，北大的3–5月窗口可能是唯一还开着的旗舰窗口。',
              '哪座城市适合你的职业？政策、媒体与学术指向北京；金融、企业与国际化生活指向上海。',
              '项目细节能打破平局吗？对比英语授课可选性、医院挂钩（医学）、实习管道，以及各院系要求的具体CSCA科目组合。',
            ],
          },
          {
            type: 'ul',
            items: [
              '选北大，如果：专业是人文/法学/基础理科，想要全国旗舰的环境与国家机构资源，或你的时间表偏春季',
              '选复旦，如果：专业是新闻或经济，想要上海市场，或你能 commit 到更早的12–1月CSC日历',
              '两所都申，如果：材料10月前就绪——先交复旦，再把核心材料复用于北大更晚的窗口',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '每年都在救申请者的顺序法则：先复旦，后北大。共享核心材料（成绩单、推荐信、语言成绩）只需准备一次；真正不同的只有文书——复旦的写作样本型个人陈述 vs 北大的研究导向学习计划。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '北京大学和复旦大学哪所更好？',
        a: '两所都是顶尖的C9综合性大学，排序随排名与年份变化。实际的差异在于匹配：北大在人文、法学与基础理科上更强且身处首都；复旦在新闻上更强，其精英级的经济与医学叠加了上海市场。按专业和城市选，不要依赖单一榜单。',
      },
      {
        q: '为什么复旦的截止日期比北大早？',
        a: '复旦拥有中国旗舰高校中最早的申请日历：多数项目12–3月截止，CSC奖学金窗口12–1月关闭。北大的主窗口运行到3月31日–5月31日。两校日历每个申请季独立设定——请务必在官方门户核实当季日期。',
      },
      {
        q: '同一申请季可以同时申请北大和复旦吗？',
        a: '可以，而且顺序很直接：10月前备好共享核心材料（成绩单、两封推荐信、语言成绩），先提交复旦（走CSC则12–1月），再把同一套材料打磨后赶上北大3–5月的窗口。文书不同——复旦的个人陈述兼作写作样本，北大要求学习计划。',
      },
      {
        q: '两校都要求CSCA吗？',
        a: '是的，2026级起。北大文科通常指定人文中文+数学，理科数学+物理/化学。复旦的组合因院系而异，医学与英语MBBS路线通常为数学+化学。报考CSCA科目之前务必核对每个项目官页的确切组合。',
      },
      {
        q: '经济学或金融职业哪所更好？',
        a: '两所都是精英级别。北大的经济学生态（光华与CCER传统）学术品牌更强；复旦经济学院的毕业生借助上海的实习便利进入金融业。想在上海做金融，复旦的区位是真实优势；想要最强的全国经济学品牌，北大略占上风。',
      },
      {
        q: '新闻学哪所更好？',
        a: '复旦。其新闻学院被广泛认为是中国最好的两所之一，且申请中的个人陈述会被明确当作写作样本来审读。北大的新闻传播学院同样很强——但在这个具体领域，倾向是复旦。',
      },
      {
        q: '对学生来说上海比北京贵吗？',
        a: '学费与校内宿舍相当；差异在生活成本。上海校外租房市场更热，这也是复旦全年总成本估计（约¥55,000–¥95,000）高于北大（约¥50,000–¥80,000）的原因。住在校内宿舍时，差距明显缩小。',
      },
      {
        q: '两校的奖学金有什么不同？',
        a: '两校共享CSC（全额资助：学费、住宿、补助）并各自设校级奖学金。市级层级不同：北大叠加北京市政府奖学金（学费减免加约¥3,000/月补助）；复旦叠加上海市政府奖学金，分A类（全额：学费、住宿、补助）或B类（仅学费）。注意复旦的CSC窗口12–1月关闭，早于北大。',
      },
    ],
    howToSteps: [
      {
        name: '把专业匹配到合适的旗舰',
        text: '人文、法学、基础理科倾向北大；新闻与金融导向的经济倾向复旦；经济、数学、医学胜负难分——把两边的具体项目都列进短名单。',
      },
      {
        name: '10月前备好共享核心材料',
        text: '成绩单、两封推荐信（副教授及以上）、护照复印件和语言成绩（中文授课HSK 5–6；英文授课IELTS/TOEFL）服务两份申请——但前提是复旦12月的窗口打开前就已就绪。',
      },
      {
        name: '核对两校的CSCA组合',
        text: '查询每个目标项目指定的CSCA科目组合（北大：人文中文+数学或数学+物理/化学；复旦：因院系而异，医学通常数学+化学），并报名一个能满足复旦更早截止的场次。',
      },
      {
        name: '写两篇不同的文书',
        text: '复旦的个人陈述要展示写作功底（新闻与人文项目会把它当写作样本审读）；北大的学习计划要展示学术方向与院系研究的契合。同一个故事，两种笔法。',
      },
      {
        name: '先交复旦，后交北大',
        text: '12–1月提交复旦（尤其是走复旦CSC的话，该窗口12–1月关闭），然后在3月31日–5月31日窗口关闭前（竞争项目1月31日前）打磨并提交北大。',
      },
      {
        name: '叠加市级奖学金',
        text: '无论最终去哪所，都在三层渠道上提名——CSC、校级奖学金和市级层（北大的北京市政府奖学金；复旦的上海市政府A/B类）——而不是押注单一渠道。',
      },
    ],
    ctaTitle: '正在北大与复旦之间选择？',
    ctaSubtitle:
      'SICA顾问帮你对比两校的目标项目，按复旦更早的截止日期排好申请顺序，并核验每一项CSCA组合与奖学金层级。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university',
        label: '北京大学主页',
        description: '院系、标志性项目、历史、奖学金与就读成本。',
      },
      {
        href: '/fudan-university',
        label: '复旦大学主页',
        description: '上海旗舰：新闻、经济、医学与校园生活。',
      },
      {
        href: '/fudan-university-admissions-guide',
        label: '复旦大学申请指南',
        description: '中国最早的申请日历——截止日期、材料与CSC时机。',
      },
    ],
  },
};
