import type { LocalizedGuide } from './types';

/**
 * "CSCA Chemistry — syllabus & prep" — Batch 2, article #8 of the
 * 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca chemistry", "csca for medicine", "csca
 * science subjects".
 *
 * Static content. Topic coverage framed against the Chinese
 * senior-high chemistry curriculum domain; unit-level scope defers
 * to the official outline on the portal.
 */
export const cscaChemistryGuide: LocalizedGuide = {
  en: {
    slug: 'csca-chemistry-guide',
    eyebrow: 'GUIDE · CSCA CHEMISTRY',
    title: 'CSCA Chemistry — Syllabus Domain, Question Style, and Prep for Medicine & Science Applicants',
    description:
      'Who sits CSCA Chemistry, what the paper covers (mole calculations, inorganic element chemistry, organic basics, electrochemistry, equilibrium), the China-style MCQs to expect, and a five-week prep framework.',
    subtitle:
      'CSCA Chemistry is the fundamental subject most medicine, pharmacy, and chemical-science programs require: 48 multiple-choice questions in about 60 minutes, scored out of 100, no calculator. The content draws from the Chinese senior-high chemistry curriculum — stoichiometry and the mole, periodicity and bonding, reaction types and energy, electrochemistry, rates and equilibrium, inorganic element chemistry, and organic basics. China\'s exams lean computational and process-driven, which rewards candidates who drill calculation speed early.',
    stats: [
      { value: '48', label: 'Multiple-choice questions' },
      { value: '~60 min', label: 'Per paper' },
      { value: 'Med/pharmacy', label: 'Typical programs requiring it' },
      { value: 'No', label: 'Calculators or data books' },
    ],
    quickAnswer:
      'CSCA Chemistry is the fundamental subject most medicine, pharmacy, and chemical-science applicants sit: 48 multiple-choice questions in about 60 minutes, scored out of 100, with no calculator. Content draws from the Chinese senior-high chemistry curriculum — mole-based stoichiometry, periodic table and bonding, reaction energy, electrochemistry, rates and equilibrium, inorganic element chemistry (metals and non-metals), and organic basics. Compared with A-Level/IB/AP, China\'s papers are more computational (mole arithmetic without a calculator) and feature process-flow questions that follow an industrial or laboratory sequence step by step. Drill calculation fluency and element-reaction facts; the theory itself will feel familiar.',
    keyTakeaways: [
      'Chemistry is the standard requirement for medicine, pharmacy, and chemical/bio programs — always confirm per program page',
      '48 MCQs in ~60 minutes; no calculator, no data book — mole arithmetic must be mental',
      'Domains from the Chinese senior-high curriculum: stoichiometry, periodicity/bonding, reaction energy, electrochemistry, rates/equilibrium, inorganic elements, organic basics',
      'China-style signatures: mole-based numerical questions and industrial/laboratory process-flow MCQs',
      'Pair with Math (compulsory) and usually the STEM Chinese track for medicine-route applications',
      'Element chemistry (what reacts with what, colors, precipitates) is fact-heavy — flashcard territory, not derivation territory',
    ],
    sections: [
      {
        id: 'who-sits',
        h2: 'Who sits CSCA Chemistry',
        intro:
          'Chemistry is the medicine-route subject. The program page decides; these are the typical patterns.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Typical programs requiring Chemistry** — MBBS and dentistry, pharmacy, chemistry and chemical engineering, bioengineering, materials science at many universities, food science, environmental engineering',
              '**Typical combination** — Math (compulsory) + Chemistry, often with the STEM Chinese track for Chinese-taught programs; some universities accept Physics OR Chemistry for certain bioscience programs',
              '**Medicine-route note** — MBBS applicants usually need Math + Chemistry (not Physics); verify on each program page because medical faculties set their own combinations',
              '**Fee note** — sitting Chemistry alongside Math stays inside the ¥700 band for 2+ subjects, so the marginal cost of adding it at registration is small',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'If your list is medicine-heavy, your CSCA core is Math + Chemistry + STEM Chinese; if it is engineering-heavy, it is Math + Physics. Mixed lists should target the session where the union of subjects fits one sitting.',
          },
        ],
      },
      {
        id: 'content-domains',
        h2: 'The content domains',
        intro:
          'The paper draws from the Chinese senior-high chemistry curriculum domain. Confirm unit-level scope against the official outline on the portal.',
        blocks: [
          {
            type: 'table',
            caption: 'Chinese senior-high chemistry domain vs international curricula',
            columns: ['Domain', 'Typical content', 'Notes vs A-Level/IB/AP'],
            rows: [
              ['Stoichiometry & the mole', 'Mole concept, reacting masses, gas volumes, concentration calculations', 'China drills this computationally and without calculators'],
              ['Periodicity & bonding', 'Periodic table structure, trends, ionic/covalent/metallic bonds, intermolecular forces', 'High overlap; notation largely universal'],
              ['Reaction types & energy', 'Redox, exothermic/endothermic, thermochemistry basics', 'Redox balancing is a reliable question source'],
              ['Electrochemistry', 'Galvanic cells, electrolysis, basic calculations', 'Appears earlier and more numerically in China than in AP'],
              ['Rates & equilibrium', 'Collision theory, Le Chatelier, equilibrium expressions', 'Conceptual overlap high; computation lighter than A-Level'],
              ['Inorganic element chemistry', 'Na/Al/Fe/Cu chemistry; Cl/S/N chemistry; colors, precipitates, flame tests', 'The most "China-style" block — fact recall heavy'],
              ['Organic basics', 'Hydrocarbons, functional groups, isomerism, polymers intro', 'Lighter than A-Level organic; naming and reactions of simple homologous series'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The block most Western-curricula candidates underestimate: inorganic element chemistry. Chinese exams expect instant recall of reaction products, precipitate colors, and gas identities — pure flashcard material that A-Level/IB/AP barely test.',
          },
        ],
      },
      {
        id: 'china-style',
        h2: 'The China-style questions to expect',
        intro:
          'Two question archetypes dominate Chinese chemistry MCQs and are worth training explicitly.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Mole-arithmetic chains** — multi-step stoichiometry (mass → moles → limiting reagent → yield) with numbers engineered for mental math; a calculator habit is the main thing standing between you and these marks',
              '**Process-flow questions** — an industrial or laboratory sequence (ore → purification → product; sample → separation → identification) presented as a flow diagram, with MCQs probing each step; train by reading the flow BEFORE the questions',
              '**"Experiment-situation" MCQs** — setup + observation + conclusion triplets where the conclusion overreaches the observation; a classic distractor pattern worth learning to spot',
              '**Ion-coexistence checks** — which ion pairs can coexist in solution (considering color, redox, precipitation); instant-recall territory',
              '**Organic isomer counting** — how many structural isomers fit a formula; systematic counting beats trial and error',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Process-flow questions punish skimmers. Chinese exam flow diagrams pack 5–8 facts into one figure; budget 20 seconds of pure reading time before touching the options, or you will answer about a different process than the one described.',
          },
        ],
      },
      {
        id: 'no-calculator',
        h2: 'Chemistry without a calculator',
        intro:
          'Chinese chemistry papers are engineered for clean numbers: molar masses round conveniently, concentrations resolve to tidy values.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Memorize common molar masses** — H/C/N/O/Na/Mg/Al/S/Cl/K/Fe/Cu/Zn/Ag/Br/I plus common compounds (H₂O, CO₂, HCl, NaOH, CaCO₃…); looking these up is impossible and recalculating them wastes seconds',
              '**Arithmetic tricks that carry over** — 10% and 25% mental shortcuts, dividing by 0.1/0.01 as digit shifts, fraction-first working',
              '**Unit sanity per question** — mL vs L, g vs kg mistakes are a designed distractor family in Chinese numerical MCQs',
              '**Significant-figure expectations** — Chinese MCQs give exact-match options, so imprecise mental arithmetic shows up immediately as "close but wrong"',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Ten minutes daily of molar-mass flashcards for two weeks covers the entire lookup layer. It is the cheapest point-per-hour investment in the whole chemistry syllabus.',
          },
        ],
      },
      {
        id: 'fact-recall',
        h2: 'The fact-recall layer (flashcards, not derivations)',
        intro:
          'A third of the paper is answerable instantly if the facts are in your head — and unanswerable quickly if they are not.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Precipitate colors & identities** — the classic white/blue/rust-brown/gelatinous precipitates and their ions',
              '**Gas identification** — how you test for H₂, O₂, CO₂, Cl₂, NH₃, SO₂ and what observations result',
              '**Flame colors & solution colors** — Na yellow, K violet through cobalt glass, Cu green/blue-green; Cu²⁺ blue, Fe²⁺ pale green, Fe³⁺ yellow',
              '**Core reaction families** — Na/Al/Fe/Cu with water, acid, oxygen; Cl/S/N compounds interconverting',
              '**Format** — two-sided flashcards, 15 minutes daily, shuffled; mastery target is instant (<2 s) recall, not recognition',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Fact recall is the highest-yield chemistry prep for international candidates precisely because it is curriculum-independent: colors, gases, and reactions are the same facts in every system — Chinese papers just ask them faster.',
          },
        ],
      },
      {
        id: 'prep-framework',
        h2: 'A five-week Chemistry prep framework',
        intro:
          'Chemistry prep = calculation fluency + fact recall + China-style question training. Five weeks inside the flagship 8-week plan.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Week 1 — diagnose by domain** — untimed mixed set scored across the domains; most international candidates flag inorganic element chemistry and mole chains — those become the patch list.',
              '**Week 2 — mole arithmetic, calculator-free** — relearn stoichiometry from your own curriculum, then 30+ Chinese-style numerical MCQs with mental-math-only rules; start the molar-mass flashcard deck.',
              '**Week 3 — fact-recall campaign** — daily 15-minute flashcard blocks (precipitates, gases, flames, reactions) plus process-flow question reading practice (20 seconds before options).',
              '**Week 4 — speed & mixed sets** — timed mixed sets integrating the three checks (units, estimate, exact-match); benchmark 30-of-48 in 30 minutes.',
              '**Week 5 — two full mocks + error log** — review by cause (fact gap / arithmetic / misread flow), re-drill recurring causes; no new content in the last 3 days.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Chemistry has the steepest prep curve of the three sciences for fact-heavy candidates — but also the flattest once the decks are learned: weeks 3–5 mostly maintain, while Math and Physics keep demanding new problem-solving.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do MBBS applicants need CSCA Chemistry?',
        a: 'Typically yes — the common medicine-route combination is Mathematics + Chemistry (often with the STEM Chinese track for Chinese-taught programs). Combinations are set per program, so verify on each target program\'s page and confirm with its admissions office.',
      },
      {
        q: 'What topics does CSCA Chemistry cover?',
        a: 'It draws from the Chinese senior-high chemistry curriculum: mole-based stoichiometry, periodicity and bonding, reaction types and energy, electrochemistry, rates and equilibrium, inorganic element chemistry (metals and non-metals), and organic basics. Confirm unit-level scope against the official outline on the portal.',
      },
      {
        q: 'Is CSCA Chemistry harder than A-Level chemistry?',
        a: 'Different emphasis rather than harder: A-Level goes deeper on organic mechanisms and equilibrium calculations, while the Chinese paper leans harder on mole arithmetic without a calculator and fact-based inorganic chemistry (colors, gases, reactions). Most theory will feel familiar.',
      },
      {
        q: 'How do I handle mole calculations without a calculator?',
        a: 'The papers use clean numbers by design: memorize common molar masses and compounds, work in fractions, treat 0.1/0.01 divisions as digit shifts, and sanity-check units (mL/L, g/kg) — unit swaps are a standard designed distractor.',
      },
      {
        q: 'What are the "process-flow" questions?',
        a: 'A Chinese-exam signature: an industrial or laboratory sequence shown as a flow diagram (ore → purification → product), with MCQs probing each step. Spend 20 seconds reading the whole flow before the options — skimming causes most misses here.',
      },
      {
        q: 'Do I need both Physics and Chemistry for biosciences?',
        a: 'It varies: medicine/pharmacy usually want Chemistry (with Math); some bio and materials programs accept Physics OR Chemistry; a few want both. The ¥700 band makes a third subject cheap if one program\'s union demands it — confirm per program.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm the chemistry requirement across your list',
        text: 'Audit each target program page: medicine/pharmacy almost always require Chemistry, some bioscience programs make it optional vs Physics. Build the subject union for the session you register.',
      },
      {
        name: 'Diagnose by domain',
        text: 'Sit an untimed mixed set and score by domain. For most international candidates the weak blocks are inorganic element chemistry and no-calculator mole chains — those get the patch weeks.',
      },
      {
        name: 'Build the molar-mass flashcard deck',
        text: 'Common elements plus common compounds, two-sided, 10 minutes daily. This is the lookup layer that no-calculator exams assume you carry in your head.',
      },
      {
        name: 'Run the fact-recall campaign',
        text: 'Daily 15-minute shuffled flashcards: precipitate colors, gas tests, flame colors, solution colors, core reaction families. Target instant recall, not recognition.',
      },
      {
        name: 'Train China-style question patterns',
        text: 'Process-flow reading (20 seconds before options), experiment-situation distractor spotting, ion-coexistence checks, isomer counting. These archetypes repeat; pattern familiarity is the skill.',
      },
      {
        name: 'Close with two mocks and an error log',
        text: 'Two full timed mocks; log misses as fact gap / arithmetic / misread and re-drill recurring causes. Same closing discipline as the other science tracks.',
      },
    ],
    ctaTitle: 'Planning the medicine-route CSCA combination?',
    ctaSubtitle:
      'SICA counselors confirm your programs\' subject combinations, set your Chemistry plan, and supply the fact-recall decks and process-flow practice packs. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-mathematics-guide',
        label: 'CSCA Mathematics — syllabus & prep',
        description: 'The compulsory companion subject for medicine-route candidates.',
      },
      {
        href: '/csca-mbbs-applicants',
        label: 'CSCA for MBBS & medicine applicants',
        description: 'The full medicine-route picture: subjects, timing, and program expectations.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, exemptions, and the CSC requirement.',
      },
    ],
  },
  zh: {
    slug: 'csca-chemistry-guide',
    eyebrow: '指南 · CSCA 化学',
    title: 'CSCA 化学——知识域、中国考风题型与医学类申请者备考方案',
    description:
      '谁要考 CSCA 化学、试卷覆盖什么（物质的量、元素化学、有机基础、电化学、平衡）、预期中的中国式选择题，以及五周备考框架。',
    subtitle:
      'CSCA 化学是多数医学、药学与化学科学项目要求的基础科目：约 60 分钟 48 道选择题、满分 100、无计算器。内容出自中国高中化学课程域——以物质的量为中心的计算、周期表与化学键、反应类型与能量、电化学、速率与平衡、无机元素化学、有机基础。中国考试更偏计算化与流程化，早练计算速度的考生占优。',
    stats: [
      { value: '48', label: '道选择题' },
      { value: '约 60 分钟', label: '单科时长' },
      { value: '医学/药学', label: '典型要求项目' },
      { value: '没有', label: '计算器或数据手册' },
    ],
    quickAnswer:
      'CSCA 化学是多数医学、药学与化学科学申请者要考的基础科目：约 60 分钟 48 道选择题、满分 100、无计算器。内容出自中国高中化学课程域——物质的量相关计算、周期表与化学键、反应能量、电化学、速率与平衡、无机元素化学（金属与非金属）、有机基础。与 A-Level/IB/AP 相比，中国卷更偏计算（无计算器的物质的量运算），并出现逐步推进的工业/实验室流程图题。要练的是计算流利度与元素反应事实；理论本身不会陌生。',
    keyTakeaways: [
      '化学是医学、药学与化工/生物类项目的标准要求——逐项目页确认',
      '约 60 分钟 48 道选择题；无计算器、无数据手册——物质的量运算全靠心算',
      '中国高中课程域的知识块：化学计算、周期性/化学键、反应能量、电化学、速率/平衡、无机元素、有机基础',
      '中国考风标志：物质的量数值题与工业/实验室流程图选择题',
      '医学路线通常与数学（必考）及理工中文轨搭配报考',
      '元素化学（谁与谁反应、颜色、沉淀）偏事实记忆——用闪卡，不靠推导',
    ],
    sections: [
      {
        id: 'who-sits',
        h2: '谁要考 CSCA 化学',
        intro:
          '化学是医学路线的科目。项目页说了算；以下是典型模式。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**典型要求化学的项目**——MBBS 与口腔、药学、化学与化工、生物工程、多数大学的材料科学、食品科学、环境工程',
              '**典型组合**——数学（必考）+ 化学，中文授课项目常配理工中文轨；部分大学生物类项目接受物理或化学二选一',
              '**医学路线提示**——MBBS 申请者通常考数学 + 化学（而非物理）；医学院系自定组合，逐项目页核验',
              '**费用提示**——化学与数学同场报考仍在两科及以上的 ¥700 档内，报名时加科几乎不加钱',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '若清单以医学为主，你的 CSCA 内核是数学 + 化学 + 理工中文；以工科为主则是数学 + 物理。混合清单应选择科目并集能一场考完的场次。',
          },
        ],
      },
      {
        id: 'content-domains',
        h2: '知识域',
        intro:
          '试卷出自中国高中化学课程域。单元级范围以门户公布的官方大纲为准。',
        blocks: [
          {
            type: 'table',
            caption: '中国高中化学知识域与国际课程对照',
            columns: ['知识域', '典型内容', '与 A-Level/IB/AP 差异'],
            rows: [
              ['化学计算与物质的量', '物质的量、质量关系、气体体积、浓度计算', '中国以无计算器的计算训练见长'],
              ['周期性与化学键', '周期表结构、周期律、离子/共价/金属键、分子间作用力', '重合度高；记号基本通用'],
              ['反应类型与能量', '氧化还原、吸放热反应、热化学基础', '氧化还原配平是稳定出题点'],
              ['电化学', '原电池、电解、基础计算', '中国出现更早、更数值化（对比 AP）'],
              ['速率与平衡', '碰撞理论、勒夏特列、平衡表达式', '概念重合高；计算轻于 A-Level'],
              ['无机元素化学', 'Na/Al/Fe/Cu 化学；Cl/S/N 化学；颜色、沉淀、焰色', '最「中国考风」的块——重事实记忆'],
              ['有机基础', '烃、官能团、同分异构、聚合物入门', '轻于 A-Level 有机；简单同系列命名与反应'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '西方学制考生最常低估的块：无机元素化学。中国考试要求即刻记起反应产物、沉淀颜色、气体身份——纯闪卡材料，A-Level/IB/AP 几乎不考。',
          },
        ],
      },
      {
        id: 'china-style',
        h2: '要预期的中国式题型',
        intro:
          '两类题型主导中国化学选择题，值得专门训练。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**物质的量计算链**——多步化学计算（质量→物质的量→限量试剂→产率），数字为心算设计；计算器习惯正是你与这些分数之间隔着的东西',
              '**流程图题**——工业或实验室序列（矿石→提纯→产品）以流程图呈现，选择题逐步设问；先读流程再看题',
              '**「实验情景」选择题**——装置 + 现象 + 结论三段式，结论超出现象支撑；这是值得学会识别的经典干扰模式',
              '**离子共存判断**——哪些离子对可在溶液中共存（考虑颜色、氧化还原、沉淀）；即时记忆型考点',
              '**同分异构计数**——某分子式有多少种结构异构；系统计数胜过试错',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '流程图题惩罚略读者。中国考试的流程图把 5-8 个事实塞进一张图；先花 20 秒纯读图再看选项，否则你答的是另一条流程。',
          },
        ],
      },
      {
        id: 'no-calculator',
        h2: '没有计算器的化学',
        intro:
          '中国化学卷为整洁数字而设计：摩尔质量取整方便，浓度解出整齐值。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**背下常见摩尔质量**——H/C/N/O/Na/Mg/Al/S/Cl/K/Fe/Cu/Zn/Ag/Br/I 加常见化合物（H₂O、CO₂、HCl、NaOH、CaCO₃……）；查表不可能，重算费秒',
              '**迁移过来的算术技巧**——10% 与 25% 的心算捷径、除以 0.1/0.01 即移位、分数优先',
              '**每题单位体检**——mL 与 L、g 与 kg 的错位是中国数值选择题刻意设计的干扰族',
              '**有效数字预期**——中国选择题给精确匹配选项，不精确的心算会立刻表现为「接近但错误」',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '摩尔质量闪卡每天 10 分钟、连续两周，覆盖整个「查表层」。这是整个化学大纲里单位时间回报最高的投入。',
          },
        ],
      },
      {
        id: 'fact-recall',
        h2: '事实记忆层（闪卡，不靠推导）',
        intro:
          '卷面约三分之一，事实在脑中即可秒答——不在则根本快不起来。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**沉淀颜色与身份**——经典的白/蓝/红褐/胶状沉淀及其离子',
              '**气体检验**——H₂、O₂、CO₂、Cl₂、NH₃、SO₂ 的检验方法与对应现象',
              '**焰色与溶液颜色**——Na 黄、K 透过钴玻璃紫、Cu 绿/蓝绿；Cu²⁺ 蓝、Fe²⁺ 浅绿、Fe³⁺ 黄',
              '**核心反应族**——Na/Al/Fe/Cu 与水、酸、氧气的反应；Cl/S/N 化合物相互转化',
              '**形式**——双面闪卡，每天 15 分钟，乱序抽取；掌握目标是即时（<2 秒）回忆，不是认得出',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '对国际考生而言，事实记忆是化学备考回报率最高的一环——它不依赖课程体系：颜色、气体、反应在每个体系里是同样的事实，中国试卷只是问得更快。',
          },
        ],
      },
      {
        id: 'prep-framework',
        h2: '化学五周备考框架',
        intro:
          '化学备考 = 计算流利度 + 事实记忆 + 中国式题型训练。嵌入旗舰 8 周计划的五个专注周。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1 周——按知识域诊断**——不限时混合卷按域计分；多数国际考生命中的是无机元素化学与物质的量计算链——这两块进补弱清单。',
              '**第 2 周——无计算器的物质的量运算**——用自己学制教材重学化学计算，随即按「仅心算」规则刷 30+ 道中国式数值选择题；同时启动摩尔质量闪卡组。',
              '**第 3 周——事实记忆战役**——每天 15 分钟闪卡（沉淀、气体、焰色、反应）加流程图读题训练（看选项前先读 20 秒）。',
              '**第 4 周——速度与混合卷**——限时混合卷融入三道检查（单位、估算、精确匹配）；基准 30 分钟清 30/48 题。',
              '**第 5 周——两套整卷 + 错误日志**——按成因复盘（事实/算术/读错流程），重复成因再训练；最后 3 天不碰新内容。',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '申 MBBS 要考 CSCA 化学吗？',
        a: '通常要——医学路线常见组合是数学 + 化学（中文授课项目常配理工中文轨）。组合由项目自定，逐项目页核验并向招生办确认。',
      },
      {
        q: 'CSCA 化学考什么内容？',
        a: '出自中国高中化学课程域：物质的量相关计算、周期性与化学键、反应类型与能量、电化学、速率与平衡、无机元素化学（金属与非金属）、有机基础。单元级范围以门户官方大纲为准。',
      },
      {
        q: 'CSCA 化学比 A-Level 化学难吗？',
        a: '是侧重不同而非更难：A-Level 在有机机理与平衡计算上更深，中国卷则在无计算器的物质的量运算与事实型无机化学（颜色、气体、反应）上更重。多数理论都会感到熟悉。',
      },
      {
        q: '没有计算器怎么做物质的量计算？',
        a: '试卷按整洁数字设计：背熟常见摩尔质量与化合物、以分数运算、把除以 0.1/0.01 当作移位、每题做单位体检（mL/L、g/kg）——单位错位是标准设计的干扰项。',
      },
      {
        q: '什么是「流程图题」？',
        a: '中国考风标志：工业或实验室序列以流程图呈现（矿石→提纯→产品），选择题逐步设问。看选项前先花 20 秒读完整流程——略读是这里失分的主因。',
      },
      {
        q: '生物科学类要物理化学都考吗？',
        a: '视项目而变：医学/药学通常要化学（配数学）；部分生物与材料项目接受物理或化学二选一；少数两者都要。¥700 档让第三科很便宜——若科目并集需要就加上，逐项目确认。',
      },
    ],
    howToSteps: [
      {
        name: '核验清单中的化学要求',
        text: '逐项目页审计：医学/药学几乎必考化学，部分生物类项目化学与物理二选一。为你报名的场次构建科目并集。',
      },
      {
        name: '按知识域诊断',
        text: '不限时混合卷按域计分。多数国际考生的弱块是无机元素化学与无计算器的物质的量链——这两块拿去补弱。',
      },
      {
        name: '建立摩尔质量闪卡组',
        text: '常见元素加常见化合物，双面卡，每天 10 分钟。这是无计算器考试默认你随身携带的「查表层」。',
      },
      {
        name: '启动事实记忆战役',
        text: '每天 15 分钟乱序闪卡：沉淀颜色、气体检验、焰色、溶液颜色、核心反应族。目标是即时回忆，不是认得出。',
      },
      {
        name: '训练中国式题型模式',
        text: '流程图读题（看选项前 20 秒）、实验情景干扰项识别、离子共存判断、同分异构计数。这些原型反复出现；模式熟悉度就是技能。',
      },
      {
        name: '以两套整卷和错误日志收尾',
        text: '两套限时整卷；失分按事实缺口/算术/读错流程归因并重复训练。与其他理科轨相同的收尾纪律。',
      },
    ],
    ctaTitle: '正在规划医学路线的 CSCA 组合？',
    ctaSubtitle:
      'SICA 顾问核对项目科目组合、排定化学计划，并提供事实记忆卡组与流程图训练资料包。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-mathematics-guide',
        label: 'CSCA 数学——大纲与备考',
        description: '医学路线考生必考的同伴科目。',
      },
      {
        href: '/csca-mbbs-applicants',
        label: 'MBBS 与医学申请者的 CSCA',
        description: '医学路线全图：科目、时间与项目预期。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用、豁免与 CSC 要求。',
      },
    ],
  },
};
