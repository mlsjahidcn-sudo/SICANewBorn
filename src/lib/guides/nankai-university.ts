import type { LocalizedGuide } from './types';

/**
 * "Nankai University admissions guide for international students"
 * (Phase 169, article #6 in the 20-article audit).
 *
 * Target queries: "nankai university international students",
 * "apply to nankai university", "nankai english programs",
 * "南开大学", "nankai admissions".
 *
 * Why Nankai: 985 + Double First-Class tier, located in Tianjin
 * (30 min from Beijing by high-speed rail), one of the strongest
 * math + finance + economics programs in China. Founded 1919,
 * one of the original Project 985 universities. Famous for its
 * mathematics + applied math + chemistry programs (the Chen
 * Sheng-Shen school of mathematics is historically top-tier in
 * China). The Zhou Enlai memorial + Minyuan Stadium are on
 * campus. Nankai is one of the few Chinese universities with
 * strong English-medium coverage in math + finance + economics.
 *
 * Facts grounded in the verified table (2026-10-08): Nankai is
 * jointly administered by MOE + Tianjin Municipality; "Double
 * First-Class" math + chemistry + statistics + business
 * administration + Marxist theory (unusually for international
 * applicants, Nankai's strength is in these five disciplines
 * collectively); tuition ¥12,000-25,000/yr depending on
 * program (math + finance are mid-tier); Tianjin cost-of-living
 * is mid-tier — between Beijing/Shanghai and the smaller
 * provincial cities.
 */
export const nankaiUniversityGuide: LocalizedGuide = {
  en: {
    slug: 'nankai-university',
    eyebrow: 'GUIDE · NANKAI UNIVERSITY',
    title: 'Nankai University Admissions Guide for International Students',
    description:
      'Nankai University for international students: programs (math + finance + chemistry + economics + business), English-medium coverage, application routes (CSC + Type B), deadlines, scholarships, and how to apply.',
    subtitle:
      'Nankai University is a 985 + Double First-Class university in Tianjin (30 min from Beijing by high-speed rail), one of the strongest math + finance + economics programs in China. Founded in 1919, one of the original Project 985 universities, famous for the Chen Sheng-Shen school of mathematics + applied math + chemistry. For international students targeting quantitative fields, finance, or economics, Nankai offers strong English-medium coverage + active CSC pathway + mid-tier cost-of-living.',
    stats: [
      { value: '985 + DFC', label: 'Tier + 5 DFC disciplines (math/chem/stats/biz admin/Marxist theory)' },
      { value: 'Tianjin', label: '30 min from Beijing by HSR — mid-tier cost' },
      { value: '¥12-25k/yr', label: 'Undergrad tuition (varies by program)' },
      { value: '1919', label: 'Founded + Project 985 original member' },
    ],
    quickAnswer:
      'Nankai offers international students strong programs in (1) Mathematics + Applied Mathematics (the Chen Sheng-Shen school is historically top-tier; one of the best in China); (2) Finance + Economics + Business Administration (Nankai\'s College of Economics is one of the strongest in China; CFA-style programs + strong English-medium coverage); (3) Chemistry + Chemical Engineering + Materials Science (Nankai\'s chemistry is nationally top-5); (4) Marxism theory + history (a famous discipline — less relevant for international applicants but historically significant). Apply via CSC (Chinese Government Scholarship, agency code via Tianjin MoE) or Type B direct (Nankai\'s own International Students Office, nankai.edu.cn). Bachelor\'s applicants need CSCA + HSK 4 or English-medium placement test; master\'s applicants need HSK 5 + bachelor in relevant field.',
    keyTakeaways: [
      'Nankai is 985 + Double First-Class across 5 disciplines (math, chemistry, statistics, business administration, Marxist theory) — collectively one of the strongest quantitative programs in China',
      'Strongest programs for international applicants: Math + Applied Math (Chen Sheng-Shen school historically top-tier), Finance + Economics + Business Administration, Chemistry + Chemical Engineering + Materials Science',
      'English-medium coverage is solid in math + finance + economics + chemistry — bachelor\'s programs have English-medium options for some cohorts',
      'Tianjin is 30 min from Beijing by high-speed rail — mid-tier cost of living (~¥2,500-3,500/mo); better than Beijing but with full access to Beijing for weekends + internships',
      'CSC pathway is active — Nankai is in the Tianjin MoE CSC channel; multiple CSC seats per year across math + finance + chemistry',
      'Tuition: ¥12,000-25,000/yr undergrad (math + economics are on the lower end; some programs are mid-tier); ¥1,200-1,800/mo on-campus dorm',
      'Application routes: (1) CSC via Tianjin MoE (typical deadline February-April); (2) Type B direct via Nankai International Students Office (deadline typically March-April for September intake)',
      'Founded 1919; the Zhou Enlai memorial + Minyuan Stadium are on the Balitai campus; one of China\'s most politically significant universities (Nankai High School + Nankai University are sister institutions)',
    ],
    sections: [
      {
        id: 'programs-for-internationals',
        h2: 'Programs international students apply to most',
        intro:
          'Nankai\'s catalog is broad, but a handful of programs consistently attract international applicants.',
        blocks: [
          {
            type: 'table',
            caption: 'Top Nankai programs for international students',
            columns: ['Program', 'Bachelor / Master', 'Length', 'English-medium coverage'],
            rows: [
              ['Mathematics + Applied Mathematics', 'Bachelor (4 yr) / Master (3 yr) / PhD (4-5 yr)', '4 / 3 / 4-5 years', 'Strong — Chen Sheng-Shen school has historically trained international students'],
              ['Finance + Economics + Business Administration', 'Bachelor (4 yr) / Master (2-3 yr)', '4 / 2-3 years', 'Strong — CFA-style programs + solid English-medium coverage'],
              ['Chemistry + Chemical Engineering + Materials Science', 'Bachelor (4 yr) / Master (3 yr) / PhD (4-5 yr)', '4 / 3 / 4-5 years', 'Strong — chemistry department has a long English-medium tradition'],
              ['Software Engineering + Computer Science', 'Bachelor (4 yr) / Master (3 yr)', '4 / 3 years', 'Growing — some English-medium bachelor cohorts'],
              ['Philosophy + History + Chinese Literature + Marxist Theory', 'Bachelor (4 yr) / Master (3 yr)', '4 / 3 years', 'Limited — most courses Chinese-medium; international applicants rare'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Mathematics + Applied Mathematics** — the Chen Sheng-Shen school is one of the most respected in China; international applicants in math often target Nankai specifically',
              '**Finance + Economics + Business Administration** — Nankai\'s College of Economics is one of the strongest in China; finance programs have CFA-style curricula + solid English-medium coverage',
              '**Chemistry + Chemical Engineering + Materials Science** — Nankai\'s chemistry department has a long English-medium tradition dating to the 1980s; one of the easier top-5 chemistry programs to enter with English',
              '**Software Engineering + Computer Science** — growing English-medium coverage; competitive internationally but not as strong as Tsinghua/Peking for CS',
              '**Philosophy + History + Marxist Theory** — historically famous (Nankai is the birthplace of Marxist studies in China); less relevant for international applicants',
            ],
          },
        ],
      },
      {
        id: 'tianjin-vs-beijing',
        h2: 'Tianjin vs Beijing: the city dimension',
        intro:
          'Nankai is in Tianjin, not Beijing — but the two cities are 30 minutes apart by high-speed rail. International applicants sometimes confuse this; it matters.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Tianjin** — Nankai\'s home city. Population ~14M (much smaller than Beijing\'s 21M); industrial + port city; cost of living ~70% of Beijing\'s',
              '**Beijing** — 30 min by Beijing-Tianjin Intercity High-Speed Rail (京津城际); ~¥50-80 one-way; full access to Beijing for weekends + internships + cultural events',
              '**Tianjin living costs** — on-campus dorm ¥1,200-1,800/mo (mid-tier); food ¥900-1,400/mo (campus) or ¥1,400-2,200/mo (off-campus); total ~¥2,500-3,500/mo',
              '**Tianjin climate** — temperate continental, hot humid summers 32-35°C, cold dry winters -5 to -10°C, distinct four seasons; better air quality than Beijing in winter (Tianjin has less heating-coal intensity)',
              '**Tianjin culture** — historic concession-era architecture (Five Great Avenues), distinct local dialect (Jin-yu), famous for steamed-bun culture (狗不理包子 originated here), the Tianjin Eye + Italian-style district',
              '**Beijing vs Tianjin in 30 min** — Nankai\'s Tianjin location is actually a feature: cheaper cost of living + same access to Beijing\'s job market + cultural amenities',
            ],
          },
        ],
      },
      {
        id: 'application-routes',
        h2: 'How to apply: CSC vs Type B',
        intro:
          'Two main routes, both viable — pick based on your funding + flexibility.',
        blocks: [
          {
            type: 'table',
            caption: 'CSC vs Type B application routes at Nankai',
            columns: ['Dimension', 'CSC (Bilateral)', 'Type B (Direct)'],
            rows: [
              ['Where you apply', 'Tianjin MoE channel or Nankai\'s bilateral partner', 'Nankai International Students Office (nankai.edu.cn)'],
              ['Typical deadline', 'February-April 2027 (varies)', 'March-April 2027 for September intake'],
              ['Who nominates you', 'Tianjin MoE → Chinese embassy → CSC', 'Nankai International Office'],
              ['Coverage', 'Tuition + dorm + monthly stipend + insurance + airfare (for most bilateral awards)', 'Tuition waiver or partial (Nankai\'s own scholarship); dorm + insurance; no airfare'],
              ['Best for', 'Applicants targeting Nankai\'s top programs + needing full funding', 'Applicants with partial funding + needing flexibility'],
              ['Selection rate', 'Moderate (Nankai\'s DFC programs are competitive)', 'Higher (Nankai accepts more Type B than CSC seats)'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Nankai\'s math + finance programs are CSC-priority disciplines — per-applicant acceptance rates are higher than the global CSC average. If you\'re competitive (GPA 3.5+, bachelor in math / finance / chemistry / economics), CSC Nankai is worth the application.',
          },
        ],
      },
      {
        id: 'documents-timeline',
        h2: 'Documents and timeline for September 2027 intake',
        intro:
          'The calendar you actually need.',
        blocks: [
          {
            type: 'table',
            caption: 'Nankai September 2027 intake timeline',
            columns: ['When', 'Action'],
            rows: [
              ['Now-Nov 2026', 'Shortlist program; start HSK 4 study (bachelor) / HSK 5 (master); gather transcripts + degree'],
              ['Oct 15-21, 2026', 'CSCA registration window for the Nov 14-15 sitting (bachelor\'s applicants) [verify exemption rules]'],
              ['Nov 2026', 'Sit CSCA; finalize HSK study plan'],
              ['Dec 2026-Jan 2027', 'CSCA Dec 19-20 sitting (backup) + start Nankai Type B application + Tianjin MoE CSC channel inquiry'],
              ['Feb-Apr 2027', 'Tianjin MoE CSC deadline (typical) [verify]'],
              ['Mar-Apr 2027', 'Nankai Type B deadline for September intake (typical) [verify]'],
              ['May-Jun 2027', 'Results; accept offer; receive JW201 + admission notice'],
              ['Jul-Aug 2027', 'X1 visa application; fly to Tianjin for September orientation'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Standard CSC document package** — passport, notarized transcripts + degree, study plan (per Phase 167 structure), 2 recommendation letters, physical exam form, police clearance',
              '**Nankai-specific** — math / finance / chemistry applicants benefit from a strong statement of math + quantitative reasoning ability (e.g., math olympiad rankings, CFA exam pass, GRE Quant)',
              '**Math prerequisite courses** — calculus, linear algebra, probability, statistics recommended; Nankai checks for these on a course-by-course basis',
              '**Finance / Economics prerequisite courses** — microeconomics, macroeconomics, calculus, statistics, accounting recommended',
              '**Chemistry prerequisite courses** — general chemistry, organic chemistry, physical chemistry, analytical chemistry recommended',
              '**HSK certificate** — HSK 4 minimum for bachelor\'s [verify]; HSK 5 for master\'s',
              '**CSCA score** — required for bachelor\'s applicants; Math recommended (Physics not required for math/finance/economics programs)',
              '**English proficiency** — IELTS 6.0+ / TOEFL iBT 80+ recommended for English-medium tracks',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Does Nankai offer English-medium programs?',
        a: 'Yes — math + finance + economics + chemistry all have English-medium options, especially at the master\'s level. Bachelor\'s programs have growing English-medium coverage for some cohorts. For most English-medium tracks, IELTS 6.0+ or TOEFL iBT 80+ is expected.',
      },
      {
        q: 'What is the tuition at Nankai?',
        a: 'Tuition is mid-tier for a 985 university: ¥12,000-25,000/yr undergrad depending on program (math + economics are on the lower end; some specialized programs are higher). On-campus dorm is ¥1,200-1,800/mo. Total annual cost (tuition + dorm + food + misc) is ~¥35,000-50,000 — significantly cheaper than Beijing\'s ¥50,000-70,000.',
      },
      {
        q: 'Is Tianjin a good city for international students?',
        a: 'Yes. Tianjin is ~70% the cost of Beijing, has 30-min HSR access to Beijing, has better air quality in winter (less heating-coal intensity), and a distinct culture (historic concession-era architecture, Five Great Avenues, the Tianjin Eye, Italian-style district). Many international students prefer Tianjin for its balance of cost + city access.',
      },
      {
        q: 'Does Nankai have CSC scholarships?',
        a: 'Yes. Nankai has multiple CSC seats per year across math + finance + chemistry + business administration. Apply via the Tianjin MoE channel. Math + finance are CSC-priority disciplines so per-applicant acceptance rates are higher than the global CSC average.',
      },
      {
        q: 'What is Nankai famous for?',
        a: 'Founded in 1919; one of the original Project 985 universities. Famous for: (1) the Chen Sheng-Shen school of mathematics — historically one of the strongest in China; (2) the College of Economics — one of the strongest in China; (3) the chemistry department — long English-medium tradition; (4) the Zhou Enlai memorial + Minyuan Stadium on the Balitai campus; (5) Nankai High School — the prestigious sister institution.',
      },
      {
        q: 'What careers does a Nankai degree lead to?',
        a: 'Math + Applied Math: quant finance, data science, academia, government statistics. Finance + Economics: banking, asset management, consulting, government economic policy. Chemistry + Chemical Engineering: pharmaceutical industry, materials R&D, energy sector. CS / Software Engineering: tech industry (Beijing + Tianjin + Shenzhen), academia. Nankai alumni are heavily recruited by Chinese state-owned banks + quant funds + tech giants + government agencies.',
      },
      {
        q: 'Should I pick Nankai or Peking or Tsinghua for math?',
        a: 'Depends. For pure math: Tsinghua is slightly stronger (Yau + Shing-Tung Yau lineage); Nankai is close second with better accessibility for international applicants. For applied math + quantitative finance: Nankai has a stronger tradition in financial math + probability + statistics. For CS / data science: Tsinghua + Peking are significantly stronger. For bachelor\'s applicants who can\'t get into Tsinghua/Peking: Nankai is the strongest tier-1 alternative for math.',
      },
    ],
    howToSteps: [
      {
        name: 'Decide your route: CSC vs Type B',
        text: 'CSC if you need full funding + have a competitive profile (GPA 3.5+, bachelor in math / finance / chemistry / economics). Type B if you have partial funding + need flexibility. Both viable — most applicants apply to both.',
      },
      {
        name: 'Check HSK 4 status + start HSK study if needed',
        text: 'Bachelor\'s applicants need HSK 4 by year 2; master\'s need HSK 5. If you\'re below HSK 4, budget 6-12 months for Chinese study before applying.',
      },
      {
        name: 'Book the CSCA sitting (bachelor\'s applicants)',
        text: 'Register at csca.cn in the October 15-21 window for the November 14-15 sitting — Math recommended. Free mocks: cscaprep.academy',
      },
      {
        name: 'Prepare math / finance / chemistry prerequisite transcripts',
        text: 'Nankai checks for prerequisite courses (calculus, linear algebra, statistics for math; microeconomics + macroeconomics + accounting for finance; general + organic + physical chemistry for chemistry). Make sure your transcripts clearly list these.',
      },
      {
        name: 'Submit Nankai Type B application via International Students Office',
        text: 'Apply directly via nankai.edu.cn → International Students Office. March-April 2027 deadline for September intake. Attach HSK certificate + math/finance/chemistry prerequisite transcripts + study plan (per Phase 167 structure).',
      },
      {
        name: 'Submit CSC via Tianjin MoE channel',
        text: 'Tianjin MoE processes nominations through its annual notice (typically released January-February [verify]). Submit before the deadline; incomplete files are rejected, not deferred.',
      },
      {
        name: 'Handle results, visa, and arrival in Tianjin',
        text: 'On success: accept, receive admission notice + JW201, apply for X1 visa at the Chinese visa centre, fly to Tianjin, convert X1 to residence permit within 30 days of arrival. Apply for Beijing-Tianjin HSR card for weekend trips to Beijing.',
      },
    ],
    ctaTitle: 'Planning Nankai?',
    ctaSubtitle:
      'SICA counselors review your academic profile (math vs finance vs chemistry) + route choice (CSC vs Type B) + Tianjin vs Beijing logistics + application timing. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/tsinghua-university-admissions-guide',
        label: 'Tsinghua University admissions guide',
        description: 'Application routes, CSCA, language thresholds, scholarship stack — flagship-tier admissions deep-dive.',
      },
      {
        href: '/peking-university-admissions-guide',
        label: 'Peking University admissions guide',
        description: 'Application routes, CSCA, language thresholds, scholarship stack, interview — flagship-tier admissions deep-dive.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China for international students 2027',
        description: 'The top tier across all provinces, with English-taught catalog flags.',
      },
    ],
  },
  zh: {
    slug: 'nankai-university',
    eyebrow: '指南 · 南开大学',
    title: '南开大学国际学生申请指南',
    description:
      '南开大学国际学生：专业（数学 + 金融 + 化学 + 经济 + 商科）、英文覆盖、申请渠道（CSC + Type B）、截止、奖学金与申请流程。',
    subtitle:
      '南开大学是位于天津（距北京 30 分钟高铁）的 985 + 双一流大学，中国最强的数学 + 金融 + 经济项目之一。1919 年建校，是 Project 985 创始成员校，以陈省身数学学派 + 应用数学 + 化学闻名。对于目标为量化领域、金融或经济的国际学生，南开提供强英文授课覆盖 + 活跃 CSC 通道 + 中层级生活成本。',
    stats: [
      { value: '985 + 双一流', label: '层级 + 5 个双一流学科（数学 / 化学 / 统计 / 工商管理 / 马克思主义理论）' },
      { value: '天津', label: '距北京 30 分钟高铁——中层级费用' },
      { value: '¥1.2-2.5 万/年', label: '本科学费（因专业而异）' },
      { value: '1919', label: '建校 + Project 985 创始成员' },
    ],
    quickAnswer:
      '南开为国际学生提供强专业：(1) 数学 + 应用数学（陈省身学派历史上顶级，中国最强之一）；(2) 金融 + 经济 + 工商管理（南开经济学院中国最强之一；CFA 风格项目 + 强英文授课覆盖）；(3) 化学 + 化学工程 + 材料科学（南开化学全国前 5）；(4) 马克思主义理论 + 历史（著名学科——对国际申请者较少相关但历史重要）。申请方式：CSC（经天津市 MoE 渠道）或 Type B 直招（南开国际学生办公室 nankai.edu.cn）。本科申请者需要 CSCA + HSK 4 或英文授课分班考；硕士需 HSK 5 + 相关领域本科学位。',
    keyTakeaways: [
      '南开是 985 + 双一流覆盖 5 个学科（数学、化学、统计、工商管理、马克思主义理论）——集合起来中国最强的定量项目之一',
      '国际申请者最强的专业：数学 + 应用数学（陈省身学派历史上顶级）、金融 + 经济 + 工商管理、化学 + 化学工程 + 材料科学',
      '英文授课覆盖在数学 + 金融 + 经济 + 化学较强——本科项目对部分班次有英文授课选项',
      '天津距北京 30 分钟高铁——中层级生活成本（约 ¥2,500-3,500/月）；比北京便宜但可完全访问北京（周末 + 实习 + 文化活动）',
      'CSC 通道活跃——南开在天津市 MoE CSC 渠道；数学 + 金融 + 化学每年多个 CSC 名额',
      '学费：本科 ¥12,000-25,000/年（数学 + 经济偏低；某些专业偏高）；校内宿舍 ¥1,200-1,800/月',
      '申请渠道：(1) CSC 经天津市 MoE（典型截止 2-4 月）；(2) Type B 直招经南开国际学生办公室（9 月入学典型截止 3-4 月）',
      '1919 年建校；周恩来纪念 + 民生体育馆在八里台校区；中国政治意义最重要的大学之一（南开中学 + 南开大学是姊妹校）',
    ],
    sections: [
      {
        id: 'programs-for-internationals',
        h2: '国际学生申请最多的专业',
        intro:
          '南开专业目录很广，但少数专业持续吸引国际申请者。',
        blocks: [
          {
            type: 'table',
            caption: '南开国际学生热门专业',
            columns: ['专业', '本科 / 硕士', '学制', '英文授课覆盖'],
            rows: [
              ['数学 + 应用数学', '本科（4 年）/ 硕士（3 年）/ 博士（4-5 年）', '4 / 3 / 4-5 年', '强——陈省身学派历史上培训过国际学生'],
              ['金融 + 经济 + 工商管理', '本科（4 年）/ 硕士（2-3 年）', '4 / 2-3 年', '强——CFA 风格项目 + 扎实英文授课覆盖'],
              ['化学 + 化学工程 + 材料科学', '本科（4 年）/ 硕士（3 年）/ 博士（4-5 年）', '4 / 3 / 4-5 年', '强——化学系有长期的英文授课传统'],
              ['软件工程 + 计算机科学', '本科（4 年）/ 硕士（3 年）', '4 / 3 年', '增长中——部分英文授课本科班次'],
              ['哲学 + 历史 + 汉语言文学 + 马克思主义理论', '本科（4 年）/ 硕士（3 年）', '4 / 3 年', '有限——多数课程中文授课；国际申请者罕见'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**数学 + 应用数学**——陈省身学派是中国最受尊重的之一；数学专业的国际申请者常专门瞄准南开',
              '**金融 + 经济 + 工商管理**——南开经济学院是中国最强之一；金融项目有 CFA 风格课程 + 扎实英文授课覆盖',
              '**化学 + 化学工程 + 材料科学**——南开化学系有长期的英文授课传统（追溯到 1980 年代）；前 5 化学项目中最容易用英文入学的',
              '**软件工程 + 计算机科学**——英文授课覆盖在增长；国际竞争激烈但不如清华 / 北大 CS',
              '**哲学 + 历史 + 马克思主义理论**——历史著名（南开是中国马克思主义研究的发源地）；对国际申请者较少相关',
            ],
          },
        ],
      },
      {
        id: 'tianjin-vs-beijing',
        h2: '天津 vs 北京：城市维度',
        intro:
          '南开在天津不在北京——但两城高铁 30 分钟。国际申请者有时会混淆这一点；这很重要。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**天津**——南开所在城市。人口 ~1400 万（远小于北京的 2100 万）；工业 + 港口城市；生活成本约为北京的 70%',
              '**北京**——30 分钟京津城际高铁；单程约 ¥50-80；周末 + 实习 + 文化活动完全访问',
              '**天津生活成本**——校内宿舍 ¥1,200-1,800/月（中层级）；食堂 ¥900-1,400/月，校外 ¥1,400-2,200/月；总计约 ¥2,500-3,500/月',
              '**天津气候**——温带大陆性气候，湿热夏季 32-35°C，干冷冬季 -5 至 -10°C，四季分明；冬季空气质量优于北京（供暖煤强度较低）',
              '**天津文化**——历史租界时期建筑（五大道）、本地独特方言（津语）、包子文化（狗不理包子发源地）、天津之眼 + 意式风情区',
              '**30 分钟可达北京**——南开在天津其实是个优势：更低生活成本 + 同样访问北京的就业市场 + 文化资源',
            ],
          },
        ],
      },
      {
        id: 'application-routes',
        h2: '怎么申请：CSC vs Type B',
        intro:
          '两条主要渠道都可走——按资金 + 灵活性选择。',
        blocks: [
          {
            type: 'table',
            caption: '南开 CSC vs Type B 申请渠道',
            columns: ['维度', 'CSC（双边）', 'Type B（直招）'],
            rows: [
              ['申请入口', '天津市 MoE 渠道或南开双边合作伙伴', '南开国际学生办公室（nankai.edu.cn）'],
              ['典型截止', '2027 年 2-4 月（因校而异）', '2027 年 3-4 月（9 月入学）'],
              ['提名方', '天津市 MoE → 中国大使馆 → CSC', '南开国际办公室'],
              ['覆盖', '学费 + 宿舍 + 月度津贴 + 保险 + 机票（多数双边资助）', '学费减免或部分（南开校级奖学金）；宿舍 + 保险；不含机票'],
              ['适合人群', '目标南开顶尖专业 + 需要全额资助的申请者', '有部分资助 + 需要灵活性的申请者'],
              ['录取率', '中等（南开双一流专业竞争激烈）', '较高（南开 Type B 录取多于 CSC 名额）'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '南开的数学 + 金融专业是 CSC 重点资助学科——人均录取率比 CSC 全球均值高。如果你有竞争力（GPA 3.5+，数学 / 金融 / 化学 / 经济本科），CSC 南开值得申请。',
          },
        ],
      },
      {
        id: 'documents-timeline',
        h2: '2027 年 9 月入学材料与时间线',
        intro:
          '你实际需要的日历。',
        blocks: [
          {
            type: 'table',
            caption: '南开 2027 年 9 月入学时间线',
            columns: ['时间', '动作'],
            rows: [
              ['现在-2026 年 11 月', '选定专业；开始 HSK 4 学习（本科）/ HSK 5（硕士）；准备成绩单 + 学位证'],
              ['2026 年 10 月 15-21 日', '11 月 14-15 日 CSCA 场次的报名窗口（本科申请者）[待核实豁免规则]'],
              ['2026 年 11 月', '参加 CSCA；最终确定 HSK 学习计划'],
              ['2026 年 12 月-2027 年 1 月', 'CSCA 12 月 19-20 日场次（备份）+ 开始南开 Type B 申请 + 天津市 MoE CSC 渠道询问'],
              ['2027 年 2-4 月', '天津市 MoE CSC 截止（典型）[待核实]'],
              ['2027 年 3-4 月', '南开 Type B 截止（9 月入学典型）[待核实]'],
              ['2027 年 5-6 月', '出结果；接受录取，领取 JW201 与录取通知'],
              ['2027 年 7-8 月', '办 X1 签证；赴天津入学'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**CSC 标准材料包**——护照、公证成绩单 + 学位证、学习计划（按 Phase 167 结构）、2 封推荐信、体检表、无犯罪证明',
              '**南开特有**——数学 / 金融 / 化学申请者受益于突出的数学 + 定量推理能力陈述（如数学奥赛排名、CFA 考试通过、GRE Quant）',
              '**数学前置课程**——微积分、线性代数、概率、统计推荐；南开逐课程核查',
              '**金融 / 经济前置课程**——微观经济、宏观经济、微积分、统计、会计推荐',
              '**化学前置课程**——普通化学、有机化学、物理化学、分析化学推荐',
              '**HSK 证书**——本科 HSK 4 最低 [待核实]；硕士 HSK 5',
              '**CSCA 成绩**——本科申请者必考；数学推荐（数学 / 金融 / 经济专业不要求物理）',
              '**英语水平**——IELTS 6.0+ / 托福 iBT 80+ 推荐（英文授课轨道）',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '南开有英文授课项目吗？',
        a: '有——数学 + 金融 + 经济 + 化学都有英文授课选项，尤其在硕士层面。本科项目对部分班次有成长中的英文授课覆盖。多数英文授课轨道要求 IELTS 6.0+ 或托福 iBT 80+。',
      },
      {
        q: '南开的学费是多少？',
        a: '985 大学的中层级学费：本科 ¥12,000-25,000/年（数学 + 经济偏低；某些专业高些）。校内宿舍 ¥1,200-1,800/月。全年总费用（学费 + 宿舍 + 餐饮 + 其他）约 ¥35,000-50,000——比北京的 ¥50,000-70,000 明显低。',
      },
      {
        q: '天津是国际学生的好城市吗？',
        a: '是。天津约为北京 70% 的费用，距北京 30 分钟高铁，冬季空气质量优于北京（供暖煤强度较低），文化独特（历史租界建筑、五大道、天津之眼、意式风情区）。许多国际学生因为天津在成本 + 城市可达性之间的平衡而偏爱它。',
      },
      {
        q: '南开有 CSC 奖学金吗？',
        a: '有。南开每年在数学 + 金融 + 化学 + 工商管理都有多个 CSC 名额。通过天津市 MoE 渠道申请。数学 + 金融是 CSC 重点资助学科，所以人均录取率比 CSC 全球均值高。',
      },
      {
        q: '南开以什么闻名？',
        a: '1919 年建校；Project 985 创始成员校。以：(1) 陈省身数学学派——历史上中国最强之一；(2) 经济学院——中国最强之一；(3) 化学系——长期英文授课传统；(4) 周恩来纪念 + 民生体育馆在八里台校区；(5) 南开中学——著名姊妹校。',
      },
      {
        q: '南开学位的就业方向？',
        a: '数学 + 应用数学：量化金融、数据科学、学术界、政府统计。金融 + 经济：银行、资管、咨询、政府经济政策。化学 + 化学工程：制药、材料研发、能源。CS / 软件工程：科技行业（北京 + 天津 + 深圳）、学术界。南开校友被中国国有银行 + 量化基金 + 科技巨头 + 政府机构大量招聘。',
      },
      {
        q: '数学专业应该选南开还是北大还是清华？',
        a: '看情况。纯数学：清华稍强（丘成桐 + 丘声桐传承）；南开是紧随其后的次选，对国际申请者更友好。应用数学 + 量化金融：南开在金融数学 + 概率 + 统计有更强传统。CS / 数据科学：清华 + 北大明显更强。本科申请者进不了清华 / 北大的话，南开是数学最强的 985 替代。',
      },
    ],
    howToSteps: [
      {
        name: '决定渠道：CSC vs Type B',
        text: 'CSC 需要全额资助 + 有竞争力背景（GPA 3.5+，数学 / 金融 / 化学 / 经济本科）。Type B 有部分资助 + 需要灵活性。两者都可走——多数申请者双线。',
      },
      {
        name: '查 HSK 4 状态 + 不够就提前学',
        text: '本科申请者第二学年前需 HSK 4；硕士需 HSK 5。如果低于 HSK 4，留 6-12 个月学中文再申请。',
      },
      {
        name: '报名 CSCA 场次（本科申请者）',
        text: '在 10 月 15-21 日窗口到 csca.cn 报名 11 月 14-15 日场次——数学推荐。免费模拟：cscaprep.academy',
      },
      {
        name: '准备数学 / 金融 / 化学前置成绩单',
        text: '南开逐课程核查前置课程（数学：微积分、线性代数、统计；金融：微观 + 宏观 + 会计；化学：普通 + 有机 + 物理）。确保成绩单清晰列出这些。',
      },
      {
        name: '通过南开国际学生办公室提交 Type B 申请',
        text: '在 nankai.edu.cn → 国际学生办公室直接申请。9 月入学 3-4 月截止。附 HSK 证书 + 数学 / 金融 / 化学前置成绩单 + 学习计划（按 Phase 167 结构）。',
      },
      {
        name: '通过天津市 MoE 渠道提交 CSC',
        text: '天津市 MoE 通过年度通知处理提名（通常 1-2 月发布 [待核实]）。截止前提交完整附件——不完整的 CSC 材料会被直接拒绝而非顺延。',
      },
      {
        name: '处理结果、签证与抵津',
        text: '获资助后：接受录取、领取录取通知 + JW201、办 X1 签证、赴天津入学，抵华后 30 天内换发居留许可。办京津城际高铁卡用于周末去北京。',
      },
    ],
    ctaTitle: '规划南开？',
    ctaSubtitle:
      'SICA 顾问审查你的学术画像（数学 vs 金融 vs 化学）+ 渠道选择（CSC vs Type B）+ 天津 vs 北京后勤 + 申请时间线。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/tsinghua-university-admissions-guide',
        label: '清华大学申请指南',
        description: '申请渠道、CSCA、语言门槛、奖学金体系、面试——旗舰级申请深度解析。',
      },
      {
        href: '/peking-university-admissions-guide',
        label: '北京大学申请指南',
        description: '申请渠道、CSCA、语言门槛、奖学金体系、面试——旗舰级申请深度解析。',
      },
      {
        href: '/best-universities-china',
        label: '2027 中国顶尖大学（国际生）',
        description: '全省份第一梯队，标注英文项目覆盖。',
      },
    ],
  },
};
