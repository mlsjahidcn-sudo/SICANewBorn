import type { LocalizedGuide } from './types';

/**
 * "SUFE (Shanghai University of Finance and Economics) for
 * international students" (Phase 169, article #7 in the
 * 20-article audit).
 *
 * Target queries: "shanghai university of finance and economics
 * international students", "sufe english programs", "apply to
 * sufe", "上海财经大学", "sufe admissions", "上海财大".
 *
 * Why SUFE: it is THE most specialized finance + economics
 * university in China — not a general university with a
 * business school, but a dedicated finance-and-economics
 * institution. One of the strongest actuarial science +
 * financial engineering + public finance + taxation +
 * international business programs in China. Located in
 * Shanghai (Yangpu district, near Tongji University and Fudan
 * University). Tier: not 985 (not in the original 9 universities
 * list), but a "Double First-Class" discipline-tier recognition
 * (economics + business administration). Strong industry ties
 * to Shanghai's finance sector (Lujiazui + Pudong financial
 * district employers actively recruit SUFE graduates).
 *
 * Facts grounded in the verified table (2026-10-08): SUFE is
 * jointly administered by Shanghai Municipality + MOE;
 * "Double First-Class" economics + business administration
 * disciplines; tuition mid-tier ¥14,000-25,000/yr; Shanghai
 * cost of living ¥3,500-5,500/mo (the most expensive city in
 * China for international students).
 */
export const sufeGuide: LocalizedGuide = {
  en: {
    slug: 'sufe',
    eyebrow: 'GUIDE · SUFE',
    title: 'SUFE (Shanghai University of Finance and Economics) for International Students',
    description:
      'SUFE (Shanghai University of Finance and Economics) for international students: programs (finance + economics + actuarial + taxation + international business), English-medium coverage, application routes (CSC + Type B), deadlines, scholarships, and how to apply.',
    subtitle:
      'SUFE is the most specialized finance + economics university in China. Not 985-tier, but with Double First-Class discipline recognition in economics + business administration. Located in Shanghai (the most expensive city in China for international students, but with the deepest finance industry ties — Lujiazui + Pudong actively recruit SUFE graduates). Strongest programs: actuarial science, financial engineering, public finance, taxation, international business. For international students targeting finance + economics + actuarial careers, SUFE is the most direct path. Mid-tier tuition ¥14,000-25,000/yr; high-tier living cost ¥3,500-5,500/mo.',
    stats: [
      { value: 'DFC', label: 'Economics + Business Admin (Double First-Class tier)' },
      { value: 'Shanghai', label: 'Deepest finance industry ties in China' },
      { value: '¥14-25k/yr', label: 'Undergrad tuition (mid-tier)' },
      { value: '¥3.5-5.5k/mo', label: 'Living cost (highest in China)' },
    ],
    quickAnswer:
      'SUFE offers international students strong programs in (1) Finance + Financial Engineering + Actuarial Science (one of the strongest actuarial programs in China; CFA + FRM-aligned curriculum); (2) Economics + International Economics + Trade (focus on applied economics + trade policy); (3) Public Finance + Taxation + Auditing (one of the strongest in China; Shanghai tax bureau + Big 4 accounting firms recruit here); (4) International Business + Business Administration (solid English-medium coverage). Apply via CSC (Shanghai MoE channel) or Type B direct (SUFE\'s own International Students Office, sufe.edu.cn). Bachelor\'s applicants need CSCA + HSK 4; master\'s applicants need HSK 5 + a bachelor in finance / economics / business / math.',
    keyTakeaways: [
      'SUFE is the most specialized finance + economics university in China — not a general university with a business school',
      'DFC disciplines: economics + business administration (Double First-Class tier) — high discipline-level recognition despite not being 985',
      'Strongest programs for international applicants: Actuarial Science (CFA + FRM-aligned), Financial Engineering, Public Finance, Taxation, International Business',
      'Shanghai location = deepest finance industry ties in China; Lujiazui + Pudong financial district actively recruit SUFE graduates',
      'Tuition: ¥14,000-25,000/yr undergrad (mid-tier); Shanghai living cost ¥3,500-5,500/mo (highest in China — budget accordingly)',
      'CSC pathway: SUFE participates via Shanghai MoE channel; finance + economics are CSC-priority disciplines; per-applicant acceptance rate moderate',
      'Application routes: (1) CSC via Shanghai MoE (typical February-April); (2) Type B direct via SUFE International Students Office (deadline typically March-April)',
      'Founded 1917 as a commercial school; merged with Shanghai Institute of Finance and Economics in 2000; one of the oldest finance-specific institutions in China',
    ],
    sections: [
      {
        id: 'programs-for-internationals',
        h2: 'Programs international students apply to most',
        intro:
          'SUFE\'s catalog is narrow but deep — these four programs cover the dominant reasons international students pick this school.',
        blocks: [
          {
            type: 'table',
            caption: 'Top SUFE programs for international students',
            columns: ['Program', 'Bachelor / Master', 'Length', 'English-medium coverage'],
            rows: [
              ['Finance + Financial Engineering + Actuarial Science', 'Bachelor (4 yr) / Master (2-3 yr)', '4 / 2-3 years', 'Strong — CFA + FRM-aligned curriculum; some English-medium cohorts'],
              ['Economics + International Economics + Trade', 'Bachelor (4 yr) / Master (2-3 yr)', '4 / 2-3 years', 'Strong — economics department has growing English-medium coverage'],
              ['Public Finance + Taxation + Auditing', 'Bachelor (4 yr) / Master (3 yr)', '4 / 3 years', 'Moderate — most courses Chinese-medium; some senior electives English'],
              ['International Business + Business Administration (MBA-track)', 'Bachelor (4 yr) / Master (2-3 yr)', '4 / 2-3 years', 'Strong — IB + BA programs have the most English-medium coverage of any SUFE program'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Finance + Financial Engineering + Actuarial Science** — one of the strongest actuarial programs in China; CFA + FRM-aligned curriculum; international applicants in finance + insurance target SUFE specifically',
              '**Economics + International Economics + Trade** — applied economics + trade policy focus; growing English-medium coverage; strong placement in Chinese government economic policy + multinational trade',
              '**Public Finance + Taxation + Auditing** — one of the strongest in China; Shanghai tax bureau + Big 4 accounting firms (PwC, Deloitte, EY, KPMG) actively recruit SUFE graduates',
              '**International Business + Business Administration** — solid English-medium coverage; the most international-facing program at SUFE; CFA-style curriculum',
              '**Other notable programs** — statistics, applied math, law (with finance concentration), information management + information systems',
            ],
          },
        ],
      },
      {
        id: 'shanghai-context',
        h2: 'The Shanghai cost-of-living dimension',
        intro:
          'SUFE is in Shanghai — which is the most expensive city in China for international students. This is the single biggest financial consideration for choosing SUFE over its regional competitors.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Shanghai is the most expensive** — on-campus dorm ¥2,500-4,000/mo (vs ¥1,200-1,800 in Changsha/Fuzhou); off-campus ¥4,500-6,500/mo; food + transport + misc ¥2,500-3,500/mo',
              '**Total monthly cost** — ¥3,500-5,500/mo on-campus, ¥6,500-9,500/mo off-campus; the highest in China for international students',
              '**Annual cost** — ~¥60,000-110,000 in living expenses alone (10-month academic year); add tuition ¥14,000-25,000 = ¥74,000-135,000 total',
              '**But — Shanghai finance industry ties are unmatched** — Lujiazui + Pudong financial district employers actively recruit SUFE; the on-campus career fair is one of the strongest in China for finance + economics graduates',
              '**CSC-funded applicants don\'t feel this** — CSC covers tuition + dorm + monthly stipend + insurance, so the high living cost is essentially neutralized for scholarship winners',
              '**Self-funded bachelor\'s applicants** — Shanghai cost is the single biggest financial consideration; if budget matters, Fudan + Tongji + Jinan U (Guangzhou) are comparable-quality alternatives at much lower cost',
              '**Internship access** — Shanghai has the deepest finance internship market in China (Lujiazui banks + funds + Big 4); a 2-month summer internship can pay ¥15,000-30,000 which offsets most of the cost difference',
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
            caption: 'CSC vs Type B application routes at SUFE',
            columns: ['Dimension', 'CSC (Bilateral)', 'Type B (Direct)'],
            rows: [
              ['Where you apply', 'Shanghai MoE channel or SUFE\'s bilateral partner', 'SUFE International Students Office (sufe.edu.cn)'],
              ['Typical deadline', 'February-April 2027 (varies)', 'March-April 2027 for September intake'],
              ['Who nominates you', 'Shanghai MoE → Chinese embassy → CSC', 'SUFE International Office'],
              ['Coverage', 'Tuition + dorm + monthly stipend + insurance + airfare (for most bilateral awards)', 'Tuition waiver or partial (SUFE\'s own scholarship); dorm + insurance; no airfare'],
              ['Best for', 'Applicants targeting finance/economics + needing full funding', 'Applicants with partial funding + needing flexibility'],
              ['Selection rate', 'Moderate (finance + economics are competitive)', 'Higher (SUFE accepts more Type B than CSC seats)'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Shanghai\'s high cost-of-living is offset by CSC-funded applicants — if you win the scholarship, you don\'t feel the cost. If you\'re self-funded, budget accordingly or consider regional competitors with comparable-quality programs (Central U of Finance and Economics in Wuhan, Dongbei U of Finance and Economics in Dalian, Zhongnan U of Economics and Law in Wuhan).',
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
            caption: 'SUFE September 2027 intake timeline',
            columns: ['When', 'Action'],
            rows: [
              ['Now-Nov 2026', 'Shortlist program (Finance / Economics / IB); start HSK 4 study (bachelor) / HSK 5 (master); gather transcripts + degree'],
              ['Oct 15-21, 2026', 'CSCA registration window for the Nov 14-15 sitting (bachelor\'s applicants) [verify exemption rules]'],
              ['Nov 2026', 'Sit CSCA; finalize HSK study plan'],
              ['Dec 2026-Jan 2027', 'CSCA Dec 19-20 sitting (backup) + start SUFE Type B application + Shanghai MoE CSC channel inquiry'],
              ['Feb-Apr 2027', 'Shanghai MoE CSC deadline (typical) [verify]'],
              ['Mar-Apr 2027', 'SUFE Type B deadline for September intake (typical) [verify]'],
              ['May-Jun 2027', 'Results; accept offer; receive JW201 + admission notice'],
              ['Jul-Aug 2027', 'X1 visa application; fly to Shanghai for September orientation'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Standard CSC document package** — passport, notarized transcripts + degree, study plan (per Phase 167 structure), 2 recommendation letters, physical exam form, police clearance',
              '**SUFE-specific for finance** — a quantitative skills statement (math olympiad, CFA Level 1 pass, GRE Quant) is a strong differentiator; SUFE\'s admissions review looks for quantitative evidence',
              '**Finance / Economics prerequisite courses** — calculus, statistics, microeconomics, macroeconomics recommended; SUFE checks for these on a course-by-course basis',
              '**HSK certificate** — HSK 4 minimum for bachelor\'s [verify]; HSK 5 for master\'s',
              '**CSCA score** — required for bachelor\'s applicants; Math recommended (Physics not required for finance/economics programs)',
              '**English proficiency** — IELTS 6.5+ / TOEFL iBT 80+ recommended for English-medium tracks; required for the IB + BA programs',
              '**Optional strengthening credentials** — CFA Level 1 pass, FRM Part 1 pass, or a math competition ranking strengthens the application significantly',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Does SUFE offer English-medium finance programs?',
        a: 'Partially. International Business + Business Administration have the most English-medium coverage. Finance + Economics + Actuarial have growing but still partial English-medium options (mostly senior-year electives + master\'s-level courses). For most English-medium tracks, IELTS 6.5+ or TOEFL iBT 80+ is expected.',
      },
      {
        q: 'What is the tuition at SUFE?',
        a: 'Tuition is mid-tier for a Shanghai specialized university: ¥14,000-25,000/yr undergrad depending on program. The bigger cost is Shanghai living expenses — ¥3,500-5,500/mo on-campus. Total annual cost (tuition + dorm + food + misc) is ~¥74,000-135,000 — the highest in China for international students. CSC-funded applicants don\'t feel this.',
      },
      {
        q: 'Is Shanghai worth the cost for SUFE?',
        a: 'Yes, if you\'re targeting finance + economics + actuarial careers. Shanghai has the deepest finance industry ties in China — Lujiazui + Pudong financial district employers actively recruit SUFE graduates, the on-campus career fair is one of the strongest in China, and a 2-month summer internship can pay ¥15,000-30,000 which offsets most of the cost difference. For self-funded bachelor\'s, consider regional competitors (Central U of Finance and Economics in Wuhan, Dongbei UFE in Dalian) for the same quality at lower cost.',
      },
      {
        q: 'Does SUFE have CSC scholarships?',
        a: 'Yes. SUFE participates via the Shanghai MoE channel. Finance + economics are CSC-priority disciplines so per-applicant acceptance rates are higher than the global CSC average. Apply via Shanghai MoE (typical February-April deadline [verify]).',
      },
      {
        q: 'What is SUFE famous for?',
        a: 'Founded 1917 as a commercial school; merged with Shanghai Institute of Finance and Economics in 2000. Famous for: (1) Actuarial Science — one of the strongest programs in China; CFA + FRM-aligned curriculum; (2) Public Finance + Taxation — one of the strongest in China; (3) Financial Engineering — quantitative finance + risk management; (4) Shanghai location — the deepest finance industry ties of any Chinese university.',
      },
      {
        q: 'What careers does an SUFE degree lead to?',
        a: 'Finance + Economics: banking, asset management, insurance, consulting, fintech, government economic policy. Actuarial Science: insurance companies, pension funds, Big 4 actuarial consulting. Public Finance + Taxation: state tax bureau, Big 4 accounting firms (PwC, Deloitte, EY, KPMG), corporate tax departments. International Business + BA: trade, multinational corporations, foreign enterprises in China. SUFE graduates are heavily recruited by Shanghai-based finance + accounting + consulting firms.',
      },
      {
        q: 'Should I pick SUFE or a 985 for finance?',
        a: 'Depends. For actuarial + public finance + taxation: SUFE has the deepest specialty (one of the strongest programs in China); Fudan + Peking + Tsinghua have broader business schools but aren\'t actuarial specialists. For general finance + economics: Fudan + Peking + Tsinghua (985) carry more weight internationally. For self-funded bachelor\'s on budget: regional competitors like Central U of Finance and Economics in Wuhan, Dongbei UFE in Dalian, Zhongnan U of Economics and Law in Wuhan offer comparable finance programs at much lower cost.',
      },
    ],
    howToSteps: [
      {
        name: 'Decide your route: CSC vs Type B',
        text: 'CSC if you need full funding + have a competitive profile (GPA 3.5+, bachelor in finance / economics / business / math). Type B if you have partial funding + need flexibility. Both viable — most applicants apply to both.',
      },
      {
        name: 'Check HSK 4 status + start HSK study if needed',
        text: 'Bachelor\'s applicants need HSK 4 by year 2; master\'s need HSK 5. If you\'re below HSK 4, budget 6-12 months for Chinese study before applying.',
      },
      {
        name: 'Book the CSCA sitting (bachelor\'s applicants)',
        text: 'Register at csca.cn in the October 15-21 window for the November 14-15 sitting — Math recommended (Physics not required for finance/economics). Free mocks: cscaprep.academy',
      },
      {
        name: 'Prepare quantitative skills statement + transcripts',
        text: 'SUFE\'s admissions review looks for quantitative evidence — math olympiad rankings, CFA Level 1 pass, GRE Quant scores, finance competitions. Make sure your transcripts clearly list calculus, statistics, microeconomics, macroeconomics.',
      },
      {
        name: 'Submit SUFE Type B application via International Students Office',
        text: 'Apply directly via sufe.edu.cn → International Students Office. March-April 2027 deadline for September intake. Attach HSK certificate + quantitative skills evidence + study plan (per Phase 167 structure).',
      },
      {
        name: 'Submit CSC via Shanghai MoE channel',
        text: 'Shanghai MoE processes nominations through its annual notice (typically released January-February [verify]). Submit before the deadline; incomplete files are rejected, not deferred.',
      },
      {
        name: 'Handle results, visa, and arrival in Shanghai',
        text: 'On success: accept, receive admission notice + JW201, apply for X1 visa at the Chinese visa centre, fly to Shanghai, convert X1 to residence permit within 30 days of arrival. Apply for Lujiazui / Pudong internship access during your program.',
      },
    ],
    ctaTitle: 'Planning SUFE?',
    ctaSubtitle:
      'SICA counselors review your finance + economics profile + route choice (CSC vs Type B) + Shanghai cost planning + quantitative skills positioning. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/best-universities-china',
        label: 'Best universities in China for international students 2027',
        description: 'The top tier across all provinces, with English-taught catalog flags.',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: 'Monthly cost of living in China by city (20 cities ranked)',
        description: 'Live budget table ranked by monthly cost — Shanghai ranks highest.',
      },
      {
        href: '/how-to-write-study-plan-china',
        label: 'How to write a study plan for a Chinese university application',
        description: 'The 6-section structure + CSC vs Type B length targets + before/after examples.',
      },
    ],
  },
  zh: {
    slug: 'sufe',
    eyebrow: '指南 · 上海财经大学',
    title: '上海财经大学国际学生指南',
    description:
      '上海财经大学（SUFE）国际学生：专业（金融 + 经济 + 精算 + 税务 + 工商管理）、英文覆盖、申请渠道（CSC + Type B）、截止、奖学金与申请流程。',
    subtitle:
      'SUFE 是中国最专业的金融 + 经济大学——不是综合性大学有商学院，而是专门的金融经济院校。经济学 + 工商管理双一流学科（非 985）。位于上海（中国对国际学生最贵的城市，但金融产业关联最深——陆家嘴 + 浦东金融区雇主主动招聘 SUFE 毕业生）。最强专业：精算、金融工程、公共财政、税务、工商管理。对于目标金融 + 经济 + 精算职业的国际学生，SUFE 是最直接的路径。中层级学费 ¥14,000-25,000/年；上海高生活成本 ¥3,500-5,500/月。',
    stats: [
      { value: '双一流', label: '经济 + 工商管理（双一流学科层级）' },
      { value: '上海', label: '中国最深金融产业关联' },
      { value: '¥1.4-2.5 万/年', label: '本科学费（中层级）' },
      { value: '¥3.5-5.5 千/月', label: '生活费（中国最高）' },
    ],
    quickAnswer:
      'SUFE 为国际学生提供强专业：(1) 金融 + 金融工程 + 精算科学（中国最强的精算项目之一；CFA + FRM 对齐课程）；(2) 经济 + 国际经济 + 贸易（应用经济 + 贸易政策）；(3) 公共财政 + 税务 + 审计（中国最强之一；上海税务局 + 四大会计师事务所招聘）；(4) 工商管理 + 国际商务（最英文授课覆盖）。申请方式：CSC（上海市 MoE 渠道）或 Type B 直招（SUFE 国际学生办公室 sufe.edu.cn）。本科申请者需要 CSCA + HSK 4；硕士需要 HSK 5 + 金融 / 经济 / 商业 / 数学本科。',
    keyTakeaways: [
      'SUFE 是中国最专业的金融 + 经济大学——不是综合性大学有商学院',
      '双一流学科：经济 + 工商管理（双一流学科层级）——尽管不是 985 也有高学科级别认可',
      '国际申请者最强专业：精算科学（CFA + FRM 对齐）、金融工程、公共财政、税务、国际商务',
      '上海位置 = 中国最深金融产业关联；陆家嘴 + 浦东金融区主动招聘 SUFE 毕业生',
      '学费：本科 ¥14,000-25,000/年（中层级）；上海生活费 ¥3,500-5,500/月（中国最高）',
      'CSC 通道：SUFE 通过上海市 MoE 渠道参与；金融 + 经济是 CSC 重点资助学科；人均录取率中等',
      '申请渠道：(1) CSC 经上海市 MoE（典型截止 2-4 月）；(2) Type B 直招经 SUFE 国际学生办公室（9 月入学典型截止 3-4 月）',
      '1917 年建校（商业学校前身）；2000 年与上海财经学院合并；中国最古老的金融专门院校之一',
    ],
    sections: [
      {
        id: 'programs-for-internationals',
        h2: '国际学生申请最多的专业',
        intro:
          'SUFE 的专业目录窄但深——这四个专业覆盖了国际学生选择该校的主要原因。',
        blocks: [
          {
            type: 'table',
            caption: 'SUFE 国际学生热门专业',
            columns: ['专业', '本科 / 硕士', '学制', '英文授课覆盖'],
            rows: [
              ['金融 + 金融工程 + 精算科学', '本科（4 年）/ 硕士（2-3 年）', '4 / 2-3 年', '强——CFA + FRM 对齐课程；部分英文授课班次'],
              ['经济 + 国际经济 + 贸易', '本科（4 年）/ 硕士（2-3 年）', '4 / 2-3 年', '强——经济系有成长中的英文授课覆盖'],
              ['公共财政 + 税务 + 审计', '本科（4 年）/ 硕士（3 年）', '4 / 3 年', '中等——多数课程中文授课；部分高年级选修英文'],
              ['国际商务 + 工商管理（MBA 方向）', '本科（4 年）/ 硕士（2-3 年）', '4 / 2-3 年', '强——IB + BA 在 SUFE 所有专业中英文授课覆盖最多'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**金融 + 金融工程 + 精算科学**——中国最强的精算项目之一；CFA + FRM 对齐课程；金融 + 保险专业的国际申请者专门瞄准 SUFE',
              '**经济 + 国际经济 + 贸易**——应用经济 + 贸易政策焦点；成长中的英文授课覆盖；中国政府经济政策 + 跨国贸易领域的强劲就业',
              '**公共财政 + 税务 + 审计**——中国最强之一；上海税务局 + 四大会计师事务所（PwC、Deloitte、EY、KPMG）主动招聘 SUFE 毕业生',
              '**国际商务 + 工商管理**——强英文授课覆盖；SUFE 最国际化的项目；CFA 风格课程',
              '**其他值得注意的专业**——统计、应用数学、法学（金融方向）、信息管理 + 信息系统',
            ],
          },
        ],
      },
      {
        id: 'shanghai-context',
        h2: '上海生活成本维度',
        intro:
          'SUFE 在上海——这是中国国际学生最贵的城市。这是选择 SUFE 而非地区竞品时最大的财务考量。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**上海最贵**——校内宿舍 ¥2,500-4,000/月（长沙 / 福州为 ¥1,200-1,800）；校外 ¥4,500-6,500/月；餐饮 + 交通 + 其他 ¥2,500-3,500/月',
              '**月总计**——住校内 ¥3,500-5,500/月，住校外 ¥6,500-9,500/月；中国国际学生最贵',
              '**年成本**——仅生活费约 ¥60,000-110,000（10 个月学年）；加学费 ¥14,000-25,000 = 总计 ¥74,000-135,000',
              '**但——上海金融产业关联无与伦比**——陆家嘴 + 浦东金融区雇主主动招聘 SUFE；校内招聘会是中国最强的金融 + 经济毕业生招聘会之一',
              '**CSC 资助申请者感觉不到这点**——CSC 覆盖学费 + 宿舍 + 月度津贴 + 保险，高生活成本对获奖学金者基本抵消',
              '**自费本科生**——上海成本是最大的财务考量；如果预算重要，复旦 + 同济 + 暨南大学（广州）等质量相当的替代成本更低',
              '**实习机会**——上海有中国最深的金融实习市场（陆家嘴银行 + 基金 + 四大）；2 个月暑期实习可赚 ¥15,000-30,000，能抵消大部分成本差异',
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
            caption: 'SUFE CSC vs Type B 申请渠道',
            columns: ['维度', 'CSC（双边）', 'Type B（直招）'],
            rows: [
              ['申请入口', '上海市 MoE 渠道或 SUFE 双边合作伙伴', 'SUFE 国际学生办公室（sufe.edu.cn）'],
              ['典型截止', '2027 年 2-4 月（因校而异）', '2027 年 3-4 月（9 月入学）'],
              ['提名方', '上海市 MoE → 中国大使馆 → CSC', 'SUFE 国际办公室'],
              ['覆盖', '学费 + 宿舍 + 月度津贴 + 保险 + 机票（多数双边资助）', '学费减免或部分（SUFE 校级奖学金）；宿舍 + 保险；不含机票'],
              ['适合人群', '目标金融 / 经济 + 需要全额资助的申请者', '有部分资助 + 需要灵活性的申请者'],
              ['录取率', '中等（金融 + 经济竞争激烈）', '较高（SUFE Type B 录取多于 CSC 名额）'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '上海高生活成本对 CSC 获奖学金者抵消——如果你拿到奖学金，感觉不到成本。自费本科生请相应预算或考虑武汉的中南财经政法大学、大连的东北财经大学等质量相当的地区替代。',
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
            caption: 'SUFE 2027 年 9 月入学时间线',
            columns: ['时间', '动作'],
            rows: [
              ['现在-2026 年 11 月', '选定专业（金融 / 经济 / IB）；开始 HSK 4 学习（本科）/ HSK 5（硕士）；准备成绩单 + 学位证'],
              ['2026 年 10 月 15-21 日', '11 月 14-15 日 CSCA 场次的报名窗口（本科申请者）[待核实豁免规则]'],
              ['2026 年 11 月', '参加 CSCA；最终确定 HSK 学习计划'],
              ['2026 年 12 月-2027 年 1 月', 'CSCA 12 月 19-20 日场次（备份）+ 开始 SUFE Type B 申请 + 上海市 MoE CSC 渠道询问'],
              ['2027 年 2-4 月', '上海市 MoE CSC 截止（典型）[待核实]'],
              ['2027 年 3-4 月', 'SUFE Type B 截止（9 月入学典型）[待核实]'],
              ['2027 年 5-6 月', '出结果；接受录取，领取 JW201 与录取通知'],
              ['2027 年 7-8 月', '办 X1 签证；赴上海入学'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**CSC 标准材料包**——护照、公证成绩单 + 学位证、学习计划（按 Phase 167 结构）、2 封推荐信、体检表、无犯罪证明',
              '**SUFE 金融特有**——定量能力陈述（数学奥赛、CFA 一级通过、GRE Quant）是强差异化因素；SUFE 招生审核看定量证据',
              '**金融 / 经济前置课程**——微积分、统计、微观经济、宏观经济推荐；SUFE 逐课程核查',
              '**HSK 证书**——本科 HSK 4 最低 [待核实]；硕士 HSK 5',
              '**CSCA 成绩**——本科申请者必考；数学推荐（金融 / 经济专业不要求物理）',
              '**英语水平**——IELTS 6.5+ / 托福 iBT 80+ 推荐（英文授课轨道）；IB + BA 项目必备',
              '**可选强化凭证**——CFA 一级通过、FRM 一级通过、或数学竞赛排名能显著加分',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'SUFE 有英文授课金融项目吗？',
        a: '部分有。国际商务 + 工商管理英文授课覆盖最多。金融 + 经济 + 精算有成长但仍部分的英文授课选项（多为高年级选修 + 硕士课程）。多数英文授课轨道要求 IELTS 6.5+ 或托福 iBT 80+。',
      },
      {
        q: 'SUFE 的学费是多少？',
        a: '上海专业型大学的中层级学费：本科 ¥14,000-25,000/年（因专业而异）。更大的成本是上海生活费——住校内 ¥3,500-5,500/月。全年总费用（学费 + 宿舍 + 餐饮 + 其他）约 ¥74,000-135,000——中国国际学生最高。CSC 获奖学金者感觉不到这点。',
      },
      {
        q: '上海值得为 SUFE 付出这个成本吗？',
        a: '如果你目标是金融 + 经济 + 精算职业，值。上海有中国最深的金融产业关联——陆家嘴 + 浦东金融区主动招聘 SUFE 毕业生，校内招聘会是中国最强的之一，2 个月暑期实习可赚 ¥15,000-30,000 能抵消大部分成本差异。自费本科生请考虑武汉的中南财经政法大学、大连的东北财经大学等地区替代。',
      },
      {
        q: 'SUFE 有 CSC 奖学金吗？',
        a: '有。SUFE 通过上海市 MoE 渠道参与。金融 + 经济是 CSC 重点资助学科，所以人均录取率比 CSC 全球均值高。通过上海市 MoE 申请（典型截止 2-4 月 [待核实]）。',
      },
      {
        q: 'SUFE 以什么闻名？',
        a: '1917 年建校（商业学校前身）；2000 年与上海财经学院合并。以：(1) 精算科学——中国最强之一；CFA + FRM 对齐课程；(2) 公共财政 + 税务——中国最强之一；(3) 金融工程——量化金融 + 风险管理；(4) 上海位置——任何中国大学中最深的金融产业关联。',
      },
      {
        q: 'SUFE 学位的就业方向？',
        a: '金融 + 经济：银行、资管、保险、咨询、金融科技、政府经济政策。精算：保险公司、养老基金、四大精算咨询。公共财政 + 税务：国家税务局、四大（PwC、Deloitte、EY、KPMG）、企业税务部。国际商务 + BA：贸易、跨国公司、在华外企。SUFE 毕业生被上海金融 + 会计 + 咨询公司大量招聘。',
      },
      {
        q: '金融专业选 SUFE 还是 985？',
        a: '看情况。精算 + 公共财政 + 税务：SUFE 最深专业（中国最强之一）；复旦 + 北大 + 清华（985）有更广的商学院但不是精算专家。通用金融 + 经济：复旦 + 北大 + 清华（985）国际认可度更高。自费本科生预算紧：武汉的中南财经政法大学、大连的东北财经大学等地区替代提供质量相当的金融项目且成本更低。',
      },
    ],
    howToSteps: [
      {
        name: '决定渠道：CSC vs Type B',
        text: 'CSC 需要全额资助 + 有竞争力背景（GPA 3.5+，金融 / 经济 / 商业 / 数学本科）。Type B 有部分资助 + 需要灵活性。两者都可走——多数申请者双线。',
      },
      {
        name: '查 HSK 4 状态 + 不够就提前学',
        text: '本科申请者第二学年前需 HSK 4；硕士需 HSK 5。如果低于 HSK 4，留 6-12 个月学中文再申请。',
      },
      {
        name: '报名 CSCA 场次（本科申请者）',
        text: '在 10 月 15-21 日窗口到 csca.cn 报名 11 月 14-15 日场次——数学推荐（金融 / 经济不要求物理）。免费模拟：cscaprep.academy',
      },
      {
        name: '准备定量能力陈述 + 成绩单',
        text: 'SUFE 招生看定量证据——数学奥赛排名、CFA 一级通过、GRE Quant 分数、金融竞赛。确保成绩单清晰列出微积分、统计、微观经济、宏观经济。',
      },
      {
        name: '通过 SUFE 国际学生办公室提交 Type B 申请',
        text: '在 sufe.edu.cn → 国际学生办公室直接申请。9 月入学 3-4 月截止。附 HSK 证书 + 定量能力证据 + 学习计划（按 Phase 167 结构）。',
      },
      {
        name: '通过上海市 MoE 渠道提交 CSC',
        text: '上海市 MoE 通过年度通知处理提名（通常 1-2 月发布 [待核实]）。截止前提交完整附件——不完整的 CSC 材料会被直接拒绝而非顺延。',
      },
      {
        name: '处理结果、签证与抵沪',
        text: '获资助后：接受录取、领取录取通知 + JW201、办 X1 签证、赴上海入学，抵华后 30 天内换发居留许可。利用陆家嘴 / 浦东实习通道。',
      },
    ],
    ctaTitle: '规划 SUFE？',
    ctaSubtitle:
      'SICA 顾问审查你的金融 + 经济画像 + 渠道选择（CSC vs Type B）+ 上海成本规划 + 定量能力定位。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/best-universities-china',
        label: '2027 中国顶尖大学（国际生）',
        description: '全省份第一梯队，标注英文项目覆盖。',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: '中国各城市月生活费排名（20 城）',
        description: '实时预算表按月生活费排序——上海排名最高。',
      },
      {
        href: '/how-to-write-study-plan-china',
        label: '如何撰写中国大学申请学习计划',
        description: '6 段结构 + CSC vs Type B 字数要求 + 写作前后对比。',
      },
    ],
  },
};
