import type { LocalizedGuide } from './types';

/**
 * "CSCA vs SAT / A-Level / IB" — Batch 3, article #13 of the
 * 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca vs sat", "csca a-level equivalent",
 * "does china accept sat".
 *
 * Static comparison content. CSCA facts from the cluster baseline;
 * SAT/A-Level/IB facts are widely known program structures, cost
 * figures labeled approximate.
 */
export const cscaVsInternationalGuide: LocalizedGuide = {
  en: {
    slug: 'csca-vs-sat-a-level-ib',
    eyebrow: 'GUIDE · CSCA VS INTL TESTS',
    title: 'CSCA vs SAT, A-Level & IB — Does China Accept International Test Scores?',
    description:
      'The CSCA is China\'s own standardized admissions test — SAT, A-Level, and IB scores complement but do not replace it. Full comparison, what transfers, how Chinese exam style differs, and what gap-year candidates should do.',
    subtitle:
      'A question every internationally-schooled applicant asks: "I already have SAT / A-Levels / IB — why another exam?" The short answer: the CSCA was created precisely because those scores measure different things and couldn\'t be compared across China\'s applicant pool. International qualifications remain your academic record — the CSCA sits on top as the China-specific standardized signal. Content overlaps heavily; format, speed, and no-calculator rules are where candidates lose points.',
    stats: [
      { value: 'Not replaceable', label: 'Intl scores ≠ CSCA' },
      { value: '~80-90%', label: 'Content overlap (fundamentals)' },
      { value: '¥700', label: 'CSCA all-subject fee (~$98)' },
      { value: '2026+', label: 'CSCA mandatory for China bachelor\'s' },
    ],
    quickAnswer:
      'No — SAT, A-Level, and IB scores do not replace the CSCA. From the 2026 intake, the CSCA is the mandatory standardized exam for most international bachelor\'s applicants to China regardless of which international qualifications you hold; your A-Levels, IB diploma, or SAT results remain part of your application as academic records, but the CSCA is the China-specific signal universities use to compare applicants from thousands of school systems. Content-wise the fundamentals (Math, Physics, Chemistry) overlap 80–90% with A-Level/IB/AP foundation material, but the exam differs in style: all multiple choice, no calculator, no formula sheet, roughly 75 seconds per question, with Chinese-labeled stems. Plan the CSCA as an additional, format-focused preparation — not a repeat of what you already know.',
    keyTakeaways: [
      'International scores complement the CSCA but never replace it — the mandate applies regardless of SAT/A-Level/IB standing',
      'The CSCA exists because transcripts and international tests couldn\'t be standardized across China\'s applicant pool',
      'Content overlap with A-Level/IB/AP is high (~80–90%) — your prep is format translation, not relearning',
      'Format deltas: all MCQ, no calculator, no formula sheet, ~75 s/question, Chinese-labeled stems and diagrams',
      'Cost is modest: ¥700 total for 2+ subjects vs $100+ per A-Level subject sitting',
      'If applying ONLY to China, the SAT is optional rather than expected — A-Level/IB students already hold school qualifications',
    ],
    sections: [
      {
        id: 'why-not-replaceable',
        h2: 'Why international scores can\'t replace the CSCA',
        intro:
          'The exam exists because of a comparison problem — understanding that problem tells you exactly what the CSCA adds.',
        blocks: [
          {
            type: 'p',
            text: 'A Chinese admissions office comparing applicants sees transcripts from thousands of school systems: A-Levels graded A*–E, IB scored to 45, American transcripts with GPAs of unknown rigor, national curricula from dozens of countries. None of these are comparable to each other, and none measure readiness in the framework Chinese faculties teach against. International tests help — the SAT and A-Levels are externally verified — but they test different curricula at different depths, and almost no applicant pool has uniform access to them. The CSCA gives every applicant the same 100-point-per-subject yardstick, in the subjects Chinese programs actually require, written in the academic language many will study in.',
          },
          {
            type: 'ul',
            items: [
              '**Same yardstick for everyone** — universities line up all applicants on one scale; this is the SAT\'s historical role in the US, applied to China\'s intake',
              '**China-specific subject demands** — the subject combinations (Math compulsory; Physics/Chemistry per program) map to Chinese program requirements, not to US/UK admission conventions',
              '**Language-of-instruction signal** — the Professional Chinese track certifies something no international test measures: academic Chinese in your degree domain',
              '**Policy function** — the mandate from the 2026 intake is a quality-control measure; international scores were part of the inconsistency it addresses',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Mental model: A-Levels/IB get you considered; the CSCA gets you compared. Chinese universities will read both — but only one of them ranks you against the entire applicant pool on their terms.',
          },
        ],
      },
      {
        id: 'comparison-table',
        h2: 'CSCA vs SAT vs A-Level vs IB — full comparison',
        intro:
          'The four systems side by side. Costs for international tests are approximate and vary by country and level.',
        blocks: [
          {
            type: 'table',
            caption: 'The standardized-exam landscape for a China-bound applicant',
            columns: ['Dimension', 'CSCA', 'SAT', 'A-Level', 'IB Diploma'],
            rows: [
              ['Purpose', 'China bachelor\'s admission (2026+)', 'US admissions; accepted in some other markets', 'UK curriculum qualification; worldwide university acceptance', 'Full 2-year diploma; worldwide acceptance'],
              ['Who runs it', 'China (Ministry of Education framework)', 'College Board', 'UK exam boards', 'IBO'],
              ['Structure', '5 subjects, all MCQ, ~60 min each', 'Reading/Writing + Math, digital', '3–4+ subjects, written exams + practicals', '6 subjects + core (EE, TOK, CAS)'],
              ['Scoring', '100 per subject; university cutoffs', '400–1600 total', 'A*–E per subject', '1–7 per subject, up to 45 total'],
              ['Calculator', 'Banned everywhere', 'Allowed (on designated portions)', 'Allowed per subject rules', 'Allowed per paper rules'],
              ['Frequency', '5 sessions/year', 'Multiple dates/year', 'May/June + Oct/Nov windows', 'Nov + May sessions'],
              ['Cost (approx.)', '¥450/¥700 total (~$63–98)', '~$70 + intl fees (~$100–130)', '~$100–250 per subject', 'Program fees via school'],
              ['Required for China?', 'Yes — most bachelor\'s applicants from 2026', 'No — complementary only', 'No — but often your school qualification', 'No — but often your school qualification'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Reading the table by column: the CSCA is the only row-9 "Yes". Everything else in your exam history is an asset in your application — none of it is the mandatory standardized signal.',
          },
        ],
      },
      {
        id: 'what-transfers',
        h2: 'What transfers from A-Level/IB/AP preparation — and what doesn\'t',
        intro:
          'The overlap is real and it is your biggest advantage — but three format deltas silently cost unprepared candidates points.',
        blocks: [
          {
            type: 'table',
            caption: 'Transfer audit by CSCA component',
            columns: ['CSCA component', 'Transfers from intl curricula', 'Doesn\'t transfer'],
            rows: [
              ['Mathematics', '~85% of content (functions, trig, calculus basics, stats)', 'Conic-section depth, computational probability style, no-calculator fluency, Chinese stems'],
              ['Physics', 'Core theory across all five domains', 'AC circuits + waves (AP P1 gap), multi-step numeric style, formula memorization (no sheet), diagram labels'],
              ['Chemistry', 'Core theory, organic basics, equilibrium concepts', 'Mole-arithmetic speed without calculator, inorganic fact recall (colors/gases), process-flow question style'],
              ['Professional Chinese', 'Nothing directly — unless you studied Chinese', 'Everything: academic register, domain vocabulary, reading speed'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The 80/20 insight** — your first diagnostic set will likely confirm you KNOW most of the content; every point of prep should target the right-hand column of this table',
              '**The no-calculator shock is the #1 score thief** — A-Level/IB/AP trained you to compute with a machine; the CSCA trained its numbers to be done by hand, and only re-conditioning fixes it',
              '**Speed is the #2 thief** — 75 seconds per question rewards different habits than 90-minute structured papers; the three-pass pacing system from the subject guides is the fix',
              '**Stems in Chinese** — universal symbols plus scenario vocabulary; the notation glossary habit closes most of this gap in two weeks',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Do NOT treat overlap as "already prepared". Candidates who walk in on content confidence alone typically lose 15–25 points to format — the exact gap between a mid-tier admit and a competitive score.',
          },
        ],
      },
      {
        id: 'which-tests-to-sit',
        h2: 'Which exams should a China-only applicant actually sit?',
        intro:
          'If your entire application list is China, your exam budget can be lean. Here is the minimal set by curriculum background.',
        blocks: [
          {
            type: 'table',
            caption: 'Minimal exam set by applicant background (China-only applications)',
            columns: ['Your background', 'Must sit', 'Optional/skip'],
            rows: [
              ['A-Level student', 'CSCA (program combination)', 'Nothing else — A-Levels are your qualification; SAT adds little for China'],
              ['IB student', 'CSCA (program combination)', 'Nothing else — the diploma is your qualification; SAT optional'],
              ['American-curriculum (no AP)', 'CSCA + school transcript', 'SAT if any non-China targets exist; otherwise optional for China'],
              ['AP student', 'CSCA; AP scores strengthen the file', 'SAT optional — AP scores already signal rigor'],
              ['National curriculum (non-China)', 'CSCA + transcripts (+ IELTS/TOEFL if English-taught)', 'SAT rarely needed for China'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The SAT question** — for China-only lists, most universities do not expect it; spend the budget on CSCA prep instead. If your list is mixed (US + China), the SAT serves the US side and does no harm in China',
              '**A-Level/IB practicals** — your school qualifications keep their full structure; the CSCA adds no practical component',
              '**Language tests stack separately** — IELTS/TOEFL (English-taught) or HSK (Chinese-taught) is orthogonal to all of the above; see the CSCA-vs-HSK guide',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Lean China-only stack: CSCA (¥700 all subjects) + language test ≈ $300–400 total. The full SAT + A-Level + CSCA combination is for mixed-destination applicants, not China-only ones.',
          },
        ],
      },
      {
        id: 'gap-year-retests',
        h2: 'Gap-year and retest candidates',
        intro:
          'Already finished school and sitting between cycles? Your position is actually strong — with two adjustments.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Your certificates do not expire** — A-Level/IB/diploma results remain valid qualifications for China applications; the CSCA mandate applies on top regardless of when you finished school',
              '**Advantage: time** — gap candidates can run the full 8-week prep plan twice if needed, chase the earliest session, and still hold retake room before deadlines',
              '**Advantage: content maturity** — the fundamentals content is fresher than for a current student juggling school exams; diagnostics usually come back stronger',
              '**Adjustment 1: no-calculator re-conditioning takes longer** — if your school years were calculator-heavy, budget an extra fortnight of mental-arithmetic drills',
              '**Adjustment 2: freshness of Chinese** — if your Chinese has slipped since school, the reading-speed rebuild starts earlier; the two-birds STEM strategy applies doubly',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Gap-year applicants applying with last cycle\'s results sometimes ask whether old SAT/AP scores help in China: they enter the file as academic records, but they change nothing about the CSCA requirement or your target score.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Does China accept SAT scores instead of the CSCA?',
        a: 'No — the SAT complements your application but does not replace the CSCA. From the 2026 intake, the CSCA is mandatory for most international bachelor\'s applicants regardless of SAT standing. The SAT is optional for China-only applications.',
      },
      {
        q: 'Are A-Levels enough to apply to Chinese universities?',
        a: 'A-Levels are your academic qualification and remain necessary — but from the 2026 intake they are not sufficient alone: the CSCA is required on top for most bachelor\'s applicants. Your predicted or final A-Level grades still anchor the academic side of the file.',
      },
      {
        q: 'Is the CSCA similar to the SAT?',
        a: 'In role, yes — a standardized yardstick across a huge applicant pool. In content and format, no: the CSCA includes subject papers (Physics, Chemistry) the SAT lacks, bans calculators entirely, runs at ~75 seconds per question, and includes a Professional Chinese track the SAT world has no equivalent for.',
      },
      {
        q: 'I already know the math content — can I skip CSCA Math prep?',
        a: 'Skip relearning, not preparation. The content overlaps ~85%, but no-calculator arithmetic, Chinese stems, and the 75-second clock are trained skills. A weekend diagnostic will show you exactly which of the three is your gap.',
      },
      {
        q: 'Which is cheaper, the CSCA or international tests?',
        a: 'The CSCA is the cheapest component: ¥700 total covers all your subjects in one sitting (~$98), versus ~$100–250 per A-Level subject, ~$100–130 SAT total, and IB via school fees. Per subject, it is the least expensive standardized exam most applicants will ever sit.',
      },
      {
        q: 'I finished school last year — do I need to redo my qualifications?',
        a: 'No — A-Level, IB, and equivalent qualifications do not expire for China applications. You sit the CSCA on top of your existing results; as a gap candidate you actually have a scheduling advantage for sessions and retakes.',
      },
    ],
    howToSteps: [
      {
        name: 'List every exam your full application set actually needs',
        text: 'China-only lists usually reduce to CSCA + language test. Mixed lists (US/UK + China) keep SAT/A-Level obligations for the other destinations — but China adds the CSCA regardless of how many tests you already hold.',
      },
      {
        name: 'Run a diagnostic to find your transfer gaps',
        text: 'One timed, no-calculator MCQ set per fundamentals subject. Score content misses separately from format misses (arithmetic, timing, misread) — your prep budget belongs to the format column.',
      },
      {
        name: 'Re-condition the calculator reflex first',
        text: 'For A-Level/IB/AP students this is the highest-priority fix: every practice set from day one runs without a calculator, plus daily mental-arithmetic blocks until clean-number confidence returns.',
      },
      {
        name: 'Add the format layer, not a second education',
        text: 'Three-pass pacing, the three physics checks, flag-and-return, Chinese-label glossaries — these format skills convert your existing knowledge into CSCA points far faster than studying new theory would.',
      },
      {
        name: 'Decide the SAT question honestly',
        text: 'If your list is China-only, skip the SAT and reinvest the budget in CSCA sessions and prep. If it is mixed, keep the SAT for the US side and add the CSCA calendar on top — the two do not conflict.',
      },
      {
        name: 'Keep your international file strong in parallel',
        text: 'The CSCA does not lower the bar on your other credentials: final A-Level/IB grades, transcripts, and references still carry the academic story. Plan the CSCA around your school exam calendar, not instead of it.',
      },
    ],
    ctaTitle: 'Mapping international qualifications onto the CSCA?',
    ctaSubtitle:
      'SICA counselors audit which of your existing scores transfer, identify your format gaps with diagnostics, and build the CSCA calendar around your school exam schedule. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, and the CSC requirement.',
      },
      {
        href: '/csca-vs-hsk',
        label: 'CSCA vs HSK',
        description: 'The other comparison: how the HSK language certificate interacts with the CSCA.',
      },
      {
        href: '/csca-mathematics-guide',
        label: 'CSCA Mathematics — syllabus & prep',
        description: 'The transfer audit in action: what A-Level/IB/AP math students still need to train.',
      },
    ],
  },
  zh: {
    slug: 'csca-vs-sat-a-level-ib',
    eyebrow: '指南 · CSCA 对比国际考试',
    title: 'CSCA 与 SAT、A-Level、IB——中国接受国际考试成绩吗？',
    description:
      'CSCA 是中国自己的标准化入学考试——SAT、A-Level、IB 成绩是补充但不能替代它。完整对比、哪些可迁移、中国考风差异，以及间隔年考生怎么做。',
    subtitle:
      '每个国际学校背景的申请者都会问：「我已经有 SAT / A-Level / IB 了，为什么还要再考？」简短回答：CSCA 的创立正是因为这些成绩测的东西不同、无法在中国申请者池内互相比较。国际学历仍是你学业档案的一部分——CSCA 叠加其上，作为中国特定的标准化信号。内容重合度高；形式、速度与无计算器规则才是丢分处。',
    stats: [
      { value: '不可替代', label: '国际成绩 ≠ CSCA' },
      { value: '约 80-90%', label: '基础科内容重合度' },
      { value: '¥700', label: 'CSCA 全科费用（约 $98）' },
      { value: '2026 级起', label: '中国本科强制 CSCA' },
    ],
    quickAnswer:
      '不能——SAT、A-Level、IB 成绩不能替代 CSCA。自 2026 级起，无论持何种国际学历，多数申请中国本科的国际学生都必须参加 CSCA；你的 A-Level、IB 文凭或 SAT 成绩仍是申请中的学业记录，但 CSCA 是大学用来在数千种学制的申请者间作比较的中国特定信号。内容上基础科（数学、物理、化学）与 A-Level/IB/AP 基础层重合约八至九成，但考试形式不同：全选择题、无计算器、无公式表、每题约 75 秒、中文题干。把 CSCA 当作一次针对形式的额外备考——而不是把已会的内容再学一遍。',
    keyTakeaways: [
      '国际成绩是补充、永不能替代 CSCA——强制令与 SAT/A-Level/IB 状态无关',
      'CSCA 的存在理由：成绩单与国际考试无法在中国申请者池内标准化比较',
      '与 A-Level/IB/AP 内容重合约八至九成——备考是形式转译，不是重学',
      '形式差异：全选择题、无计算器、无公式表、每题约 75 秒、中文题干与图形',
      '费用不高：两科及以上合计 ¥700，对比 A-Level 单科 $100+',
      '若只申中国，SAT 是可选项而非预期项——A-Level/IB 学生已持有学历资格',
    ],
    sections: [
      {
        id: 'why-not-replaceable',
        h2: '为什么国际成绩替代不了 CSCA',
        intro:
          '这门考试因一个「比较难题」而生——理解这个难题，你就知道 CSCA 到底加的是什么。',
        blocks: [
          {
            type: 'p',
            text: '中国招生办面对的申请者成绩单来自数千种学制：A*–E 的 A-Level、45 分制的 IB、严谨度不明的美式 GPA、几十个国家的国家课程。这些彼此不可比，也都不是按中国院系的教学框架来测的。国际考试有帮助——SAT 与 A-Level 有外部认证——但它们考不同课程、不同深度，申请者池内也几乎没有人人都考过。CSCA 给每位申请者同一把「单科百分制」的尺子、考中国项目真正要求的科目、用许多人将要学习的学术语言书写。',
          },
          {
            type: 'ul',
            items: [
              '**同一把尺子量所有人**——大学在一条刻度上排列全部申请者；这正是 SAT 在美国的历史角色，如今用于中国招生',
              '**中国特定的科目要求**——科目组合（数学必考；物理/化学按项目）映射中国项目要求，而非美英录取惯例',
              '**授课语言信号**——专业中文轨认证了任何国际考试都不测的东西：你学位域内的学术中文',
              '**政策功能**——2026 级起的强制令是质量控制措施；国际成绩正是它所解决的不一致性的一部分',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '心智模型：A-Level/IB 让你「被考虑」；CSCA 让你「被比较」。中国大学两份都看——但只有一份能按它们的标准把你与整个申请者池排序。',
          },
        ],
      },
      {
        id: 'comparison-table',
        h2: 'CSCA 与 SAT、A-Level、IB 全面对比',
        intro:
          '四个体系并排。国际考试费用为近似值，随国家与级别浮动。',
        blocks: [
          {
            type: 'table',
            caption: '面向中国申请者的标准化考试版图',
            columns: ['维度', 'CSCA', 'SAT', 'A-Level', 'IB 文凭'],
            rows: [
              ['用途', '中国本科录取（2026 级起）', '美国录取；部分其他市场接受', '英国课程学历；全球大学接受', '两年制完整文凭；全球接受'],
              ['主办方', '中国（教育部框架）', 'College Board', '英国考试局', 'IBO'],
              ['结构', '5 科全选择题、每科约 60 分钟', '阅读写作 + 数学、机考', '3-4+ 科、笔试 + 实操', '6 科 + 核心（EE、TOK、CAS）'],
              ['计分', '单科 100；大学划线', '总分 400-1600', '单科 A*–E', '单科 1-7，总分至 45'],
              ['计算器', '全程禁用', '部分环节允许', '按科目规则允许', '按卷面规则允许'],
              ['频次', '每年 5 次', '一年多场', '5/6 月 + 10/11 月窗口', '11 月 + 5 月场次'],
              ['费用（约）', '合计 ¥450/¥700（约 $63-98）', '约 $70 + 国际附加费（$100-130）', '每科约 $100-250', '经学校缴项目费'],
              ['中国是否必须？', '是——2026 级起多数本科申请者', '否——仅补充', '否——但常是你的学历资格', '否——但常是你的学历资格'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '按行读表：唯一的「必须」是 CSCA。你考试履历里的其他一切是申请资产——没有一项是强制的标准化信号。',
          },
        ],
      },
      {
        id: 'what-transfers',
        h2: 'A-Level/IB/AP 备考什么可迁移——什么不可',
        intro:
          '重合是真实的、是你最大的优势——但三个形式差异会悄悄吃掉未准备者的分数。',
        blocks: [
          {
            type: 'table',
            caption: '按 CSCA 组成部分的可迁移性审计',
            columns: ['CSCA 组成', '国际课程可迁移', '不可迁移'],
            rows: [
              ['数学', '约 85% 内容（函数、三角、微积分初步、统计）', '圆锥曲线深度、计算型概率风格、无计算器流利度、中文题干'],
              ['物理', '五大域核心理论', '交流电 + 波（AP P1 缺口）、多步数值风格、公式记忆（无表）、图形标注'],
              ['化学', '核心理论、有机基础、平衡概念', '无计算器物质的量运算速度、无机事实记忆（颜色/气体）、流程图题型'],
              ['专业中文', '无直接迁移——除非学过中文', '全部：学术语域、领域词汇、阅读速度'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**八二洞察**——你的第一套诊断卷多半会确认：内容你大多会。每一分备考都应投向本表右列',
              '**无计算器冲击是头号偷分者**——A-Level/IB/AP 训练你用机器计算；CSCA 的数字按手算设计，只有重新 conditioned 才能修',
              '**速度是二号偷分者**——每题 75 秒奖励的习惯不同于 90 分钟结构化大卷；科目指南的三轮节奏系统就是解法',
              '**中文题干**——通用符号加场景词汇；两周的术语表习惯即可填平大部分',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '不要把重合当作「已经准备好了」。只凭内容信心进场的考生，通常因形式丢 15-25 分——这正好是中游录取线与竞争性分数之间的差距。',
          },
        ],
      },
      {
        id: 'which-tests-to-sit',
        h2: '只申中国的申请者到底该考哪些？',
        intro:
          '若你的申请清单全是中国，考试预算可以很精简。按课程背景给出最小集合。',
        blocks: [
          {
            type: 'table',
            caption: '按背景的最小考试集合（仅申中国）',
            columns: ['你的背景', '必须考', '可选/跳过'],
            rows: [
              ['A-Level 学生', 'CSCA（项目组合）', '其他都不必——A-Level 就是你的学历；SAT 对中国加分有限'],
              ['IB 学生', 'CSCA（项目组合）', '其他都不必——文凭即学历；SAT 可选'],
              ['美式课程（无 AP）', 'CSCA + 校内成绩单', '若存在非中国目标则考 SAT；仅中国则可选'],
              ['AP 学生', 'CSCA；AP 成绩为档案加分', 'SAT 可选——AP 已证明严谨度'],
              ['其他国家课程', 'CSCA + 成绩单（英文授课加雅思/托福）', 'SAT 对中国很少必要'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**SAT 问题**——仅申中国的清单，多数大学并不期待它；把预算投给 CSCA 备考更值。若清单混合（美 + 中），SAT 服务美国那侧，在中国也无害',
              '**A-Level/IB 实操**——你的学历资格保持完整结构；CSCA 不加实操部分',
              '**语言考试独立叠加**——雅思/托福（英文授课）或 HSK（中文授课）与上述全部正交；见 CSCA 对比 HSK 指南',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '精简的仅中国组合：CSCA（全科 ¥700）+ 语言考试 ≈ 合计 $300-400。SAT + A-Level + CSCA 的全组合是混合目的地申请者的事，不是仅中国申请者的。',
          },
        ],
      },
      {
        id: 'gap-year-retests',
        h2: '间隔年与再申请考生',
        intro:
          '已毕业、正处于周期之间？你的位置其实很强——只需两个调整。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**证书不过期**——A-Level/IB/同等学历在中国申请中始终是有效学历；CSCA 强制令叠加其上，与你何时毕业无关',
              '**优势：时间**——间隔年考生可以完整跑两遍八周备考计划、追最早场次、并在截止前留足重考空间',
              '**优势：内容成熟度**——基础科内容比还在应付校内考试的学生更熟；诊断成绩通常更强',
              '**调整一：无计算器重建更耗时**——若你的学生时代重度依赖计算器，多留两周心算训练',
              '**调整二：中文的新鲜度**——若毕业后中文退步了，阅读速度重建要更早启动；理工「一石二鸟」策略加倍适用',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '持上一周期成绩申请的间隔年考生常问旧 SAT/AP 分数在中国是否有用：它们作为学业记录进入档案，但丝毫不改变 CSCA 要求或你的目标分数。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国接受用 SAT 成绩替代 CSCA 吗？',
        a: '不接受——SAT 是申请的补充，不能替代 CSCA。自 2026 级起，无论 SAT 状态如何，多数国际本科申请者必须参加 CSCA。仅申中国的话 SAT 是可选项。',
      },
      {
        q: '只凭 A-Level 可以申请中国大学吗？',
        a: 'A-Level 是你的学业资格、依然必要——但自 2026 级起仅凭它不够：多数本科申请者在其上还须考 CSCA。你的预估或最终 A-Level 成绩仍是档案学术侧的锚。',
      },
      {
        q: 'CSCA 与 SAT 相似吗？',
        a: '角色上相似——都是跨巨大申请者池的标准化尺子。内容与形式上不同：CSCA 含 SAT 没有的科目卷（物理、化学）、全程禁计算器、每题约 75 秒，还包含 SAT 世界没有对应物的专业中文轨。',
      },
      {
        q: '数学内容我已会——可以跳过 CSCA 数学备考吗？',
        a: '可以跳过重学，不能跳过备考。内容重合约 85%，但无计算器算术、中文题干与 75 秒时钟是训练出来的技能。一套周末诊断会精确告诉你是这三者中的哪个在拖后腿。',
      },
      {
        q: 'CSCA 和国际考试哪个便宜？',
        a: 'CSCA 是最便宜的组成：合计 ¥700 覆盖一场全部科目（约 $98），对比 A-Level 每科 $100-250、SAT 合计 $100-130、IB 经学校缴费。按单科算，它是多数申请者考过的最便宜的标准化考试。',
      },
      {
        q: '我去年毕业——需要重读学历吗？',
        a: '不需要——A-Level、IB 及同等学历在中国申请中不过期。你在既有成绩之上考 CSCA；作为间隔年考生，你在场次与重考的排期上反而有优势。',
      },
    ],
    howToSteps: [
      {
        name: '列出全部申请目的地真正需要的考试',
        text: '仅中国的清单通常精简为 CSCA + 语言考试。混合清单（美/英 + 中）为另一侧保留 SAT/A-Level 义务——但中国无论如何叠加 CSCA。',
      },
      {
        name: '跑诊断找出可迁移性缺口',
        text: '每门基础科一套限时、无计算器的选择题。内容性失分与形式性失分（算术、计时、读题）分开计——备考预算属于形式那一列。',
      },
      {
        name: '先重建计算器反射',
        text: '对 A-Level/IB/AP 学生这是最高优先修正：从第一天起每套练习都无计算器，外加每日心算块，直到整洁数字的信心回来。',
      },
      {
        name: '加形式层，而不是再受一次教育',
        text: '三轮节奏、物理三道检查、标记回攻、中文标注术语表——这些形式技能把你已有的知识转成 CSCA 分数的速度，远快于学新理论。',
      },
      {
        name: '诚实地决定 SAT 问题',
        text: '清单仅中国：跳过 SAT，预算转投 CSCA 场次与备考。清单混合：为美国侧保留 SAT，把 CSCA 日历叠加其上——两者不冲突。',
      },
      {
        name: '并行保持国际档案的强度',
        text: 'CSCA 不会降低其他凭证的门槛：最终 A-Level/IB 成绩、成绩单、推荐信仍承载学术叙事。把 CSCA 排进校内考试日历周围，而不是取而代之。',
      },
    ],
    ctaTitle: '正在把国际学历映射到 CSCA？',
    ctaSubtitle:
      'SICA 顾问审计你既有成绩哪些可迁移、用诊断找出形式缺口，并把 CSCA 日历排进你的校内考试日程。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用与 CSC 要求。',
      },
      {
        href: '/csca-vs-hsk',
        label: 'CSCA 对比 HSK',
        description: '另一组对比：HSK 语言证书与 CSCA 的交互关系。',
      },
      {
        href: '/csca-mathematics-guide',
        label: 'CSCA 数学——大纲与备考',
        description: '可迁移性审计的实战：A-Level/IB/AP 数学考生还要练什么。',
      },
    ],
  },
};
