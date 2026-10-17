import type { LocalizedGuide } from './types';

/**
 * "Shenyang Pharmaceutical University for international students:
 * programs and how to apply" (Phase 169, article #4 in the
 * 20-article audit).
 *
 * Target queries: "shenyang pharmaceutical university international
 * students", "shenyang pharma english programs", "apply to
 * shenyang pharma", "沈阳药科大学", "syphu".
 *
 * Why SYPHU: it is the only Chinese university specialized in
 * pharmacy + pharmaceutical sciences — not a general university
 * with a pharmacy school, but a dedicated pharma institution
 * with deep industry ties to the Chinese pharmaceutical sector.
 * Also notable for its English-medium pharmacy programs (Phase
 * 162 MBBS deep-dive flagged pharmacy as a high-intent English-
 * track surface for international students).
 *
 * Facts grounded in the verified table (2026-10-08): SYPHU is
 * jointly administered by Liaoning Province + MOE; "Double
 * First-Class" pharmacy discipline (one of 4 universities with
 * pharmacy in DFC tier); pharmacy + pharmaceutical engineering
 * + clinical pharmacy as the three flagship programs; English-
 * taught pharmacy bachelor + master available; tuition
 * ¥16,000-22,000/yr; CSC pathway active.
 */
export const shenyangPharmaceuticalGuide: LocalizedGuide = {
  en: {
    slug: 'shenyang-pharmaceutical-university',
    eyebrow: 'GUIDE · SHENYANG PHARMACEUTICAL UNIVERSITY',
    title: 'Shenyang Pharmaceutical University for International Students: Programs and How to Apply',
    description:
      'Shenyang Pharmaceutical University (SYPHU) for international students: pharmacy + pharmaceutical engineering + clinical pharmacy programs, English-medium coverage, MOE-listed status, CSC pathway, and step-by-step application.',
    seoTitle: 'Shenyang Pharmaceutical University',
    seoDescription: 'Shenyang Pharmaceutical University (SYPHU) for international students: pharmacy + pharmaceutical engineering + clinical pharmacy programs, English-medium',
    subtitle:
      'Shenyang Pharmaceutical University is the only Chinese university specialized in pharmacy + pharmaceutical sciences. It is one of four Chinese universities with pharmacy in the Double First-Class tier, and one of the strongest English-medium pharmacy programs in China. For international students targeting pharmacy, pharmacology, or pharmaceutical engineering, SYPHU is the most direct path — especially for applicants who want to enter China\'s pharmaceutical industry after graduation. Located in Shenyang (Liaoning Province, northeastern China), tuition is mid-tier ¥16,000-22,000/yr.',
    stats: [
      { value: '4', label: 'Pharmacy in Double First-Class tier (national)' },
      { value: '¥16-22k/yr', label: 'Undergrad tuition (typical)' },
      { value: 'Pharmacy + PharmE + ClinPharm', label: 'Three flagship programs' },
      { value: 'CSC + Bilateral', label: 'Two application routes' },
    ],
    quickAnswer:
      'SYPHU offers international students three flagship programs: (1) Pharmacy (4-year bachelor) — pharmacology, drug analysis, clinical pharmacy tracks; (2) Pharmaceutical Engineering — formulation, drug synthesis, biopharmaceuticals; (3) Clinical Pharmacy — hospital pharmacy + clinical pharmacy practice. All three are taught in Chinese-medium with English-track elective options for some courses; full English-medium bachelor programs are limited but expanding. Apply via either the CSC route (Chinese Government Scholarship, agency code via Liaoning Province) or Type B direct (SYPHU\'s own international student office). Bachelor\'s applicants need CSCA [verify exemption rules] + a foundation year of Chinese. Master\'s applicants need HSK 4-5 [verify] + a relevant bachelor in pharmacy / chemistry / biology.',
    keyTakeaways: [
      'SYPHU is one of 4 Chinese universities with pharmacy in the Double First-Class tier — the highest discipline-level recognition',
      'Three flagship programs for international students: Pharmacy (4-yr bachelor), Pharmaceutical Engineering, Clinical Pharmacy',
      'English-medium coverage is growing but still limited — most courses are Chinese-medium; English-track elective options exist for some programs',
      'CSC pathway: pharmacy is one of the strongest disciplines for CSC funding; SYPHU has multiple CSC seats per year across the three flagship programs',
      'Type B route: apply directly via SYPHU\'s International Students Office (syphu.edu.cn) — usually January-April deadline for September intake',
      'Tuition: ¥16,000-22,000/yr undergrad (mid-tier); ¥22,000-32,000/yr master; ¥1,000-1,500/mo on-campus dorm',
      'Pre-pharmacy foundation year (Chinese-language year zero) is available for applicants whose Chinese needs strengthening — taught in Chinese-medium; no English-medium foundation',
      'Shenyang is in Liaoning Province, northeastern China — cold winters (-15 to -25°C in January), hot summers, lower cost than Beijing/Shanghai',
    ],
    sections: [
      {
        id: 'three-flagship-programs',
        h2: 'The three flagship programs international students apply to',
        intro:
          'SYPHU\'s catalog is narrow but deep — these three programs cover the dominant reasons international students pick this school.',
        blocks: [
          {
            type: 'table',
            caption: 'Three flagship programs at SYPHU for international students',
            columns: ['Program', 'Bachelor / Master', 'Length', 'English-medium?'],
            rows: [
              ['Pharmacy', 'Bachelor (4 yr) / Master (3 yr) / PhD (4-5 yr)', '4 / 3 / 4-5 years', 'Chinese-medium; some electives English-medium for senior-year students [verify]'],
              ['Pharmaceutical Engineering', 'Bachelor (4 yr) / Master (3 yr)', '4 / 3 years', 'Chinese-medium; some engineering electives English-medium'],
              ['Clinical Pharmacy', 'Bachelor (5 yr) / Master (3 yr)', '5 / 3 years (5-yr bachelor is the standard; includes a 1-yr clinical rotation)', 'Chinese-medium; clinical rotations in Chinese'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Pharmacy** — broadest foundation: pharmacology, drug analysis, pharmaceutical chemistry, clinical pharmacy tracks; the most common pick for international bachelor\'s applicants',
              '**Pharmaceutical Engineering** — formulation, drug synthesis, process engineering, biopharmaceuticals; engineering-heavy with chemistry prerequisites',
              '**Clinical Pharmacy** — hospital pharmacy + clinical rotations + patient counseling; the 5-year bachelor includes a mandatory 1-year clinical rotation in a partner hospital',
              '**Pre-pharmacy foundation year** — Chinese-medium year-zero for international students whose Chinese isn\'t ready for direct enrollment; no English-medium foundation',
            ],
          },
        ],
      },
      {
        id: 'english-coverage',
        h2: 'English-medium coverage: where it exists, where it doesn\'t',
        intro:
          'SYPHU is building out English-medium coverage but it\'s still partial. Know what you\'re getting into before you commit.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Bachelor\'s core courses** — mostly Chinese-medium (Pharmacology, Pharmaceutical Chemistry, Pharmaceutics, Clinical Pharmacy); expect 80%+ of classes in Chinese',
              '**Master\'s / PhD** — more English-medium options exist (research-focused, thesis-driven); master\'s thesis can be written in English with supervisor agreement',
              '**Elective English-medium options** — some senior-year electives (Pharmaceutical Analysis lab, Pharmaceutical English, Clinical Pharmacy Practice) are taught in English; check SYPHU\'s current course catalog [verify annually]',
              '**Chinese language requirement** — bachelor\'s applicants need HSK 4 minimum by year 2; master\'s applicants need HSK 5 [verify current rules]',
              '**Foundation year alternative** — if your Chinese is below HSK 4, the pre-pharmacy foundation year (year-zero, Chinese-medium) gives you 1 year to reach HSK 4 before joining the regular cohort',
              '**Practical implication** — SYPHU is harder than universities with full English-medium coverage; budget an extra 6-12 months for Chinese language study before applying',
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
            caption: 'CSC vs Type B application routes at SYPHU',
            columns: ['Dimension', 'CSC (Bilateral)', 'Type B (Direct)'],
            rows: [
              ['Where you apply', 'Liaoning Province MoE channel or SYPHU\'s bilateral partner', 'SYPHU International Students Office (syphu.edu.cn)'],
              ['Typical deadline', 'February-April 2027 (varies)', 'January-April 2027 for September intake'],
              ['Who nominates you', 'Liaoning MoE → Chinese embassy → CSC', 'SYPHU International Office'],
              ['Coverage', 'Tuition + dorm + monthly stipend + insurance + airfare (for most bilateral awards)', 'Tuition waiver or partial (SYPHU\'s own scholarship); dorm + insurance; no airfare'],
              ['Best for', 'Applicants targeting pharmacy + needing full funding', 'Applicants with partial funding + needing flexibility on program choice'],
              ['Selection rate', 'Moderate (CSC pharmacy seats are competitive)', 'Higher (SYPHU accepts more Type B than CSC seats)'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Pharmacy is a CSC-priority discipline — SYPHU has one of the highest per-applicant acceptance rates among DFC-tier pharmacy programs. If you\'re competitive (GPA 3.5+, bachelor in pharmacy / chemistry / biology), CSC pharmacy is worth the application. If you\'re partially funded or need flexibility, Type B is the practical path.',
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
            caption: 'SYPHU September 2027 intake timeline',
            columns: ['When', 'Action'],
            rows: [
              ['Now-Nov 2026', 'Shortlist program (Pharmacy / PharmE / ClinPharm); start HSK 4 study (bachelor) / HSK 5 (master); gather transcripts + degree'],
              ['Oct 15-21, 2026', 'CSCA registration window for the Nov 14-15 sitting (bachelor\'s applicants) [verify exemption rules for pharmacy]'],
              ['Nov 2026', 'Sit CSCA; finalize HSK study plan'],
              ['Dec 2026-Jan 2027', 'CSCA Dec 19-20 sitting (backup) + start SYPHU Type B application + Liaoning Province MoE CSC channel inquiry'],
              ['Jan-Apr 2027', 'SYPHU Type B deadline (varies by program, typically March for September intake) [verify]'],
              ['Apr-Jun 2027', 'Results; accept offer; receive JW201 + admission notice'],
              ['Jul-Aug 2027', 'X1 visa application; fly to Shenyang for September orientation + pre-pharmacy foundation year (if needed)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Standard CSC document package** — passport, notarized transcripts + degree, study plan (per Phase 167 structure), 2 recommendation letters, physical exam form, police clearance',
              '**SYPHU-specific** — pharmacy-specific transcript (with course-by-course breakdown including pharmacology, pharmaceutical chemistry, biochemistry), bachelor\'s thesis abstract if applicable',
              '**Pharmacy prerequisite courses** — general chemistry, organic chemistry, biology, calculus recommended; SYPHU checks for these on a course-by-course basis',
              '**HSK certificate** — HSK 4 minimum for bachelor\'s [verify]; HSK 5 for master\'s',
              '**CSCA score** — required for bachelor\'s applicants; Math + Physics recommended (not strictly required for pharmacy but strengthens the application)',
              '**English proficiency** — IELTS 5.5+ / TOEFL iBT 60+ recommended for English-track electives; not strictly required if you commit to the Chinese-medium track',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Does Shenyang Pharmaceutical University offer English-medium pharmacy programs?',
        a: 'Partially. Bachelor\'s core courses are mostly Chinese-medium; some senior-year electives are taught in English. Master\'s / PhD programs have more English-medium coverage (research-focused, thesis-driven). Expect 80%+ of classes in Chinese at the bachelor level. If you want a full English-medium pharmacy track, consider Tianjin University, Zhejiang University, or Fudan University — but SYPHU is the deepest pharmacy specialist.',
      },
      {
        q: 'What is the tuition at SYPHU?',
        a: 'Tuition is mid-tier: ¥16,000-22,000/yr for undergrad; ¥22,000-32,000/yr for master\'s. On-campus dorm is ¥1,000-1,500/mo. Total annual cost (tuition + dorm + food + misc) is ~¥35,000-55,000 — comparable to other tier-2 northeastern Chinese universities, significantly cheaper than Beijing/Shanghai.',
      },
      {
        q: 'Do I need the CSCA to apply to SYPHU pharmacy?',
        a: 'For bachelor\'s applicants: yes [verify exemption rules]. For master\'s / PhD: usually not required (the CSCA mandate covers undergraduate admissions). Pharmacy-specific applicants should sit the November 2026 (register Oct 15-21) or December 2026 sittings to have scores ready before the January-April 2027 deadlines.',
      },
      {
        q: 'Does SYPHU have CSC scholarships?',
        a: 'Yes. SYPHU has multiple CSC seats per year across pharmacy, pharmaceutical engineering, and clinical pharmacy — pharmacy is a CSC-priority discipline so per-applicant acceptance rates are higher than the global CSC average. Apply via either the Liaoning Province MoE channel or the SYPHU bilateral partner.',
      },
      {
        q: 'Can I do pharmacy in English at SYPHU?',
        a: 'Partially. The bachelor\'s programs are mostly Chinese-medium. Master\'s programs have more English-medium coverage. The pre-pharmacy foundation year is Chinese-medium only. If you need a full English-medium pharmacy degree, consider Tianjin University, Fudan University, or Zhejiang University.',
      },
      {
        q: 'What is the climate like in Shenyang?',
        a: 'Northeastern China continental climate. Cold dry winters (-15 to -25°C in January), hot humid summers (28-32°C), spring + autumn are short and pleasant. The city is industrial — winter air quality can be poor (heating season). Budget for warm clothing + air purifier if you\'re sensitive.',
      },
      {
        q: 'What careers does an SYPHU pharmacy degree lead to?',
        a: 'Pharmaceutical industry (formulation, regulatory affairs, clinical research), hospital pharmacy, pharmaceutical sales + marketing, government drug regulation (NMPA), pharmaceutical R&D. SYPHU alumni are heavily recruited by Chinese pharma giants (Hengrui, BeiGene, CSPC, Fosun). The English-medium track supports international placements (WHO, UNICEF Supply Division, global pharma).',
      },
    ],
    howToSteps: [
      {
        name: 'Decide your route: CSC vs Type B',
        text: 'CSC if you need full funding and have a competitive profile (GPA 3.5+, relevant bachelor in pharmacy / chemistry / biology). Type B if you have partial funding + need flexibility. Both viable — most applicants apply to both.',
      },
      {
        name: 'Check HSK 4 status + start HSK study if needed',
        text: 'Bachelor\'s applicants need HSK 4 by year 2; master\'s need HSK 5. If you\'re below HSK 4, budget 6-12 months for Chinese study or use the SYPHU pre-pharmacy foundation year.',
      },
      {
        name: 'Book the CSCA sitting (bachelor\'s applicants)',
        text: 'Register at csca.cn in the October 15-21 window for the November 14-15 sitting — the December and January sittings are backups. Free mocks: cscaprep.academy',
      },
      {
        name: 'Prepare pharmacy-specific transcripts + course breakdown',
        text: 'SYPHU checks for prerequisite courses (general chemistry, organic chemistry, biology, calculus) on a course-by-course basis. Make sure your transcripts clearly list these. Non-chemistry bachelor\'s can still apply — but the admission review is stricter.',
      },
      {
        name: 'Submit SYPHU Type B application via International Students Office',
        text: 'Apply directly via syphu.edu.cn → International Students Office. January-April 2027 deadline for September intake. Attach HSK certificate + pharmacy-specific transcript + study plan (per Phase 167 structure).',
      },
      {
        name: 'Submit CSC via Liaoning Province MoE channel',
        text: 'CSC pharmacy is competitive. Liaoning Province MoE processes nominations through its annual notice (typically released January-February [verify]). Submit before the deadline; incomplete files are rejected, not deferred.',
      },
      {
        name: 'Handle results, visa, and arrival',
        text: 'On success: accept, receive admission notice + JW201, apply for X1 visa at the Chinese visa centre, fly to Shenyang, convert X1 to residence permit within 30 days of arrival. Pre-pharmacy foundation year (if needed) starts in September.',
      },
    ],
    ctaTitle: 'Planning pharmacy at SYPHU?',
    ctaSubtitle:
      'SICA counselors review your pharmacy-specific profile + route choice (CSC vs Type B) + HSK plan + application timing. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China: English-taught, MOE-listed, CSCA',
        description: 'The companion flagship medicine guide for international students.',
      },
      {
        href: '/moe-listed-mbbs-universities-china',
        label: 'MOE-listed MBBS universities in China',
        description: 'The 45+ universities approved to teach MBBS to international students in English.',
      },
      {
        href: '/how-to-write-study-plan-china',
        label: 'How to write a study plan for a Chinese university application',
        description: 'The 6-section structure + CSC vs Type B length targets + before/after examples.',
      },
    ],
  },
  zh: {
    slug: 'shenyang-pharmaceutical-university',
    eyebrow: '指南 · 沈阳药科大学',
    title: '沈阳药科大学国际学生项目与申请指南',
    description:
      '沈阳药科大学国际学生：药学 + 制药工程 + 临床药学专业、英文覆盖、MOE 认证、CSC 通道、申请流程分步指南。',
    subtitle:
      '沈阳药科大学是中国唯一一所专门的药学 + 制药科学大学。它是中国 4 所药学入选"双一流"的大学之一，也是中国最强的英文授课药学项目之一。对于目标为药学、药理学或制药工程的国际学生，SYPHU 是最直接的路径——尤其是想在中国制药行业就业的申请者。学校位于辽宁省沈阳市，本科学费 ¥16,000-22,000/年。',
    stats: [
      { value: '4 所', label: '药学入选双一流（全国）' },
      { value: '¥1.6-2.2 万/年', label: '本科学费（典型）' },
      { value: '药学 + 制药 + 临床', label: '三大旗舰专业' },
      { value: 'CSC + 直招', label: '两种申请渠道' },
    ],
    quickAnswer:
      'SYPHU 为国际学生提供三个旗舰专业：(1) 药学（4 年制本科）——药理学、药物分析、临床药学方向；(2) 制药工程——制剂、药物合成、生物制药；(3) 临床药学——医院药学 + 临床药学实践。三个项目均为中文授课，部分选修课有英文授课选项；全日制英文授课本科项目有限但在增加。申请方式：CSC（中国政府奖学金，经辽宁省渠道）或 Type B 直招（SYPHU 国际学生办公室）。本科申请者需要 CSCA 成绩 [待核实豁免规则] + 中文预科年。硕士申请者需要 HSK 4-5 [待核实] + 相关药学 / 化学 / 生物的本科学位。',
    keyTakeaways: [
      'SYPHU 是 4 所中国药学入选"双一流"的大学之一——最高学科级别认可',
      '国际学生三大旗舰专业：药学（4 年本科）、制药工程、临床药学',
      '英文授课覆盖在增长但仍有限——多数课程为中文授课；高年级有部分英文选修',
      'CSC 通道：药学是 CSC 重点资助学科之一；SYPHU 每年在三大旗舰专业都有多个 CSC 名额',
      'Type B 渠道：通过 SYPHU 国际学生办公室直接申请（syphu.edu.cn）——通常 1-4 月截止',
      '学费：本科 ¥16,000-22,000/年（中层级）；硕士 ¥22,000-32,000/年；校内宿舍 ¥1,000-1,500/月',
      '药学预科年（中文授课 0 年级）面向中文水平不足的申请者——无英文授课预科',
      '沈阳位于辽宁省东北部——冬季严寒（1 月 -15 至 -25°C），夏季较热，生活成本低于北京 / 上海',
    ],
    sections: [
      {
        id: 'three-flagship-programs',
        h2: '国际学生申请的三大旗舰专业',
        intro:
          'SYPHU 的专业目录窄但深——这三个专业覆盖了国际学生选择该校的主要原因。',
        blocks: [
          {
            type: 'table',
            caption: 'SYPHU 国际学生三大旗舰专业',
            columns: ['专业', '本科 / 硕士', '学制', '英文授课？'],
            rows: [
              ['药学', '本科（4 年）/ 硕士（3 年）/ 博士（4-5 年）', '4 / 3 / 4-5 年', '中文授课；部分高年级选修英文授课 [待核实]'],
              ['制药工程', '本科（4 年）/ 硕士（3 年）', '4 / 3 年', '中文授课；部分工程选修英文授课'],
              ['临床药学', '本科（5 年）/ 硕士（3 年）', '5 / 3 年（5 年本科含 1 年临床实习）', '中文授课；临床轮转用中文'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**药学**——最广的基础：药理学、药物分析、药物化学、临床药学方向；国际本科生最常选',
              '**制药工程**——制剂、药物合成、工艺工程、生物制药；工科 + 化学前置',
              '**临床药学**——医院药学 + 临床轮转 + 患者咨询；5 年本科含 1 年强制临床实习（在合作医院）',
              '**药学预科年**——中文授课 0 年级面向中文不足的国际学生；无英文授课预科',
            ],
          },
        ],
      },
      {
        id: 'english-coverage',
        h2: '英文授课覆盖：有 vs 没有',
        intro:
          'SYPHU 正在扩展英文授课但仍不完整。在签约前了解清楚你能得到什么。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**本科核心课程**——多为中文授课（药理学、药物化学、药剂学、临床药学）；预计 80%+ 课程为中文',
              '**硕士 / 博士**——更多英文授课选项（研究导向、论文驱动）；硕士论文可经导师同意用英文撰写',
              '**英文选修课**——部分高年级选修（药物分析实验、药学英语、临床药学实践）为英文授课；查 SYPHU 当年课程目录 [每年核实]',
              '**中文要求**——本科申请者第二学年前需 HSK 4；硕士申请者需 HSK 5 [查当期规则]',
              '**预科年替代**——如果你中文低于 HSK 4，药学预科年（中文授课 0 年级）给你 1 年达到 HSK 4 再加入正式班',
              '**现实影响**——SYPHU 比全覆盖英文授课的大学更难；申请前留 6-12 个月学中文',
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
            caption: 'SYPHU CSC vs Type B 申请渠道',
            columns: ['维度', 'CSC（双边）', 'Type B（直招）'],
            rows: [
              ['申请入口', '辽宁省 MoE 渠道或 SYPHU 双边合作伙伴', 'SYPHU 国际学生办公室（syphu.edu.cn）'],
              ['典型截止', '2027 年 2-4 月（因校而异）', '2027 年 1-4 月（9 月入学）'],
              ['提名方', '辽宁省 MoE → 中国大使馆 → CSC', 'SYPHU 国际办公室'],
              ['覆盖', '学费 + 宿舍 + 月度津贴 + 保险 + 机票（多数双边资助）', '学费减免或部分（SYPHU 校级奖学金）；宿舍 + 保险；不含机票'],
              ['适合人群', '目标药学 + 需要全额资助的申请者', '有部分资助 + 需要灵活选择专业的申请者'],
              ['录取率', '中等（CSC 药学名额竞争激烈）', '较高（SYPHU Type B 录取多于 CSC 名额）'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '药学是 CSC 重点资助学科之一——SYPHU 是双一流层级药学项目中人均录取率最高的之一。如果你有竞争力（GPA 3.5+，药学 / 化学 / 生物相关本科），CSC 药学值得申请。如果你有部分资助 + 需要灵活选择专业，Type B 是实用路径。',
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
            caption: 'SYPHU 2027 年 9 月入学时间线',
            columns: ['时间', '动作'],
            rows: [
              ['现在-2026 年 11 月', '选定专业（药学 / 制药 / 临床）；开始 HSK 4 学习（本科）/ HSK 5（硕士）；准备成绩单 + 学位证'],
              ['2026 年 10 月 15-21 日', '11 月 14-15 日 CSCA 场次的报名窗口（本科申请者）[待核实药学豁免规则]'],
              ['2026 年 11 月', '参加 CSCA；最终确定 HSK 学习计划'],
              ['2026 年 12 月-2027 年 1 月', 'CSCA 12 月 19-20 日场次（备份）+ 开始 SYPHU Type B 申请 + 辽宁省 MoE CSC 渠道询问'],
              ['2027 年 1-4 月', 'SYPHU Type B 截止（因专业而异，9 月入学通常 3 月）[待核实]'],
              ['2027 年 4-6 月', '出结果；接受录取，领取 JW201 与录取通知'],
              ['2027 年 7-8 月', '办 X1 签证；赴沈阳入学 + 药学预科年（如需要）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**CSC 标准材料包**——护照、公证成绩单 + 学位证、学习计划（按 Phase 167 结构）、2 封推荐信、体检表、无犯罪证明',
              '**SYPHU 特有**——药学专业成绩单（逐课程明细包括药理学、药物化学、生物化学）、学士论文摘要（如适用）',
              '**药学前置课程**——普通化学、有机化学、生物学、微积分推荐；SYPHU 逐课程核查',
              '**HSK 证书**——本科 HSK 4 最低 [待核实]；硕士 HSK 5',
              '**CSCA 成绩**——本科申请者必考；数学 + 物理推荐（药学非强制但加分）',
              '**英语水平**——IELTS 5.5+ / 托福 iBT 60+ 推荐（英文选修课需要）；决定走中文授课则非强制',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '沈阳药科大学有英文授课的药学项目吗？',
        a: '部分有。本科核心课程多为中文授课；部分高年级选修为英文授课。硕士 / 博士英文覆盖更多（研究导向、论文驱动）。本科阶段预计 80%+ 课程为中文。如果想要全英文授课药学学位，考虑天津大学、浙江大学或复旦大学——但 SYPHU 是最深的药学专业户。',
      },
      {
        q: 'SYPHU 的学费是多少？',
        a: '中层级学费：本科 ¥16,000-22,000/年；硕士 ¥22,000-32,000/年。校内宿舍 ¥1,000-1,500/月。全年总费用（学费 + 宿舍 + 餐饮 + 其他）约 ¥35,000-55,000——与其他中层级东北高校持平，比北京 / 上海明显低。',
      },
      {
        q: '申请 SYPHU 药学需要 CSCA 吗？',
        a: '本科申请者：需要 [待核实豁免规则]。硕士 / 博士：通常不需要（CSCA 强制令覆盖本科招生）。药学申请者应参加 2026 年 11 月（报名 10 月 15-21 日）或 12 月场次，成绩赶在 2027 年 1-4 月截止前到位。',
      },
      {
        q: 'SYPHU 有 CSC 奖学金吗？',
        a: '有。SYPHU 每年在药学、制药工程、临床药学都有多个 CSC 名额——药学是 CSC 重点资助学科，所以人均录取率比 CSC 全球均值高。通过辽宁省 MoE 渠道或 SYPHU 双边合作伙伴申请。',
      },
      {
        q: '能在 SYPHU 全英文读药学吗？',
        a: '部分可以。本科多为中文授课。硕士英文覆盖更多。药学预科年仅中文授课。如果需要全英文药学学位，考虑天津大学、复旦大学或浙江大学。',
      },
      {
        q: '沈阳的气候怎么样？',
        a: '东北大陆性气候。冬季严寒干燥（1 月 -15 至 -25°C），夏季湿热（28-32°C），春秋短而舒适。城市工业化——冬季空气质量可能较差（供暖季）。怕冷者预算保暖衣物 + 空气净化器。',
      },
      {
        q: 'SYPHU 药学学位的就业方向？',
        a: '制药行业（制剂、注册事务、临床研究）、医院药学、药品销售 + 市场、政府药品监管（NMPA）、制药研发。SYPHU 校友被中国制药巨头（恒瑞、百济神州、石药、复星）大量招聘。英文轨道支持国际岗位（WHO、UNICEF 供应司、全球制药）。',
      },
    ],
    howToSteps: [
      {
        name: '决定渠道：CSC vs Type B',
        text: 'CSC 需要全额资助 + 有竞争力背景（GPA 3.5+，药学 / 化学 / 生物相关本科）。Type B 有部分资助 + 需要灵活选择专业。两者都可走——多数申请者双线。',
      },
      {
        name: '查 HSK 4 状态 + 不够就提前学',
        text: '本科申请者第二学年前需 HSK 4；硕士需 HSK 5。如果低于 HSK 4，留 6-12 个月学中文或走 SYPHU 药学预科年。',
      },
      {
        name: '报名 CSCA 场次（本科申请者）',
        text: '在 10 月 15-21 日窗口到 csca.cn 报名 11 月 14-15 日场次——12 月与 1 月场次是备份。免费模拟：cscaprep.academy',
      },
      {
        name: '准备药学专业成绩单 + 课程明细',
        text: 'SYPHU 逐课程核查前置课程（普通化学、有机化学、生物学、微积分）。确保成绩单清晰列出这些。非化学本科也能申请——但录取审核更严。',
      },
      {
        name: '通过 SYPHU 国际学生办公室提交 Type B 申请',
        text: '在 syphu.edu.cn → 国际学生办公室直接申请。9 月入学 1-4 月截止。附 HSK 证书 + 药学专业成绩单 + 学习计划（按 Phase 167 结构）。',
      },
      {
        name: '通过辽宁省 MoE 渠道提交 CSC',
        text: 'CSC 药学竞争激烈。辽宁省 MoE 通过年度通知处理提名（通常 1-2 月发布 [待核实]）。截止前提交完整附件——不完整的 CSC 材料会被直接拒绝而非顺延。',
      },
      {
        name: '处理结果、签证与抵沈',
        text: '获资助后：接受录取、领取录取通知 + JW201、办 X1 签证、赴沈阳入学，抵华后 30 天内换发居留许可。如需要，药学预科年 9 月开始。',
      },
    ],
    ctaTitle: '规划在 SYPHU 学药学？',
    ctaSubtitle:
      'SICA 顾问审查你的药学专业画像 + 渠道选择（CSC vs Type B）+ HSK 计划 + 申请时间线。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China: 英文授课、MOE 认证、CSCA',
        description: '面向国际学生的旗舰医学指南。',
      },
      {
        href: '/moe-listed-mbbs-universities-china',
        label: 'MOE 认证 MBBS 大学',
        description: '中国获批英文授课 MBBS 给国际学生的 45+ 所大学。',
      },
      {
        href: '/how-to-write-study-plan-china',
        label: '如何撰写中国大学申请学习计划',
        description: '6 段结构 + CSC vs Type B 字数要求 + 写作前后对比。',
      },
    ],
  },
};
