import type { LocalizedGuide } from './types';

/**
 * "CSCA Professional Chinese — STEM track" — Batch 2, article #10
 * of the 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca stem chinese", "csca technical chinese",
 * "csca chinese track engineering".
 *
 * Static content. Track existence, 80-question MCQ format and
 * 60-minute duration from launch-period official notices; glossary
 * entries are study-aid vocabulary, not an official word list.
 */
export const cscaStemChineseGuide: LocalizedGuide = {
  en: {
    slug: 'csca-stem-chinese-guide',
    eyebrow: 'GUIDE · CSCA STEM CHINESE',
    title: 'CSCA Professional Chinese — STEM Track: Technical Chinese for Engineering & Science Applicants',
    description:
      'The STEM Chinese track of the CSCA Professional Chinese subject: 80 MCQs in ~60 minutes testing technical and academic Chinese for engineering and science degrees. A starter glossary, reading-speed drills, and the two-birds strategy with Physics and Chemistry prep.',
    subtitle:
      'Professional Chinese is the language half of the CSCA, offered in two tracks. The STEM track (理工中文) serves applicants to engineering, computer science, physical sciences, and technical degrees: 80 multiple-choice questions in about 60 minutes, scored out of 100. It tests academic Chinese in technical contexts — textbook passages, scenario descriptions, and the vocabulary of math, physics, and chemistry in Chinese. The hidden advantage: preparing this track IS preparing your Physics and Chemistry reading comprehension — one effort, two subjects.',
    stats: [
      { value: '80', label: 'Multiple-choice questions' },
      { value: '~60 min', label: 'Per paper' },
      { value: '~150', label: 'Core technical terms to start' },
      { value: '2-in-1', label: 'Doubles as science-subject prep' },
    ],
    quickAnswer:
      'The STEM Chinese track (理工中文) is one of two Professional Chinese tracks in the CSCA — the language subject for international bachelor\'s applicants. It serves applicants to engineering, computer science, and physical-science degrees: 80 multiple-choice questions in about 60 minutes, scored out of 100. It tests academic Chinese in technical contexts — passage-based questions using the vocabulary of mathematics, physics, chemistry, and engineering. The strategic insight most candidates miss: the technical vocabulary you build for this track is the same vocabulary the Math/Physics/Chemistry papers use in their stems and diagrams, so STEM Chinese preparation compounds with your science-subject preparation rather than competing with it.',
    keyTakeaways: [
      'Two Professional Chinese tracks — Humanities (人文中文) and STEM (理工中文); engineering/science programs typically require STEM',
      'STEM track: 80 MCQs in ~60 minutes, scored out of 100; no writing, no listening',
      'Tests academic Chinese in technical contexts: textbook-register passages, scenario descriptions, technical terminology',
      'The vocabulary overlaps heavily with the stems/diagrams of the Math, Physics, and Chemistry papers — prep once, benefit twice',
      'Starter glossary: ~150 technical terms covers most reading friction; word-formation compounds multiply your yield',
      'Programs specify which track you sit — check each program page; a qualifying HSK can waive this subject for some applicants',
    ],
    sections: [
      {
        id: 'what-it-is',
        h2: 'What the STEM Chinese track is',
        intro:
          'The STEM track is the language subject for technical-degree applicants — and the one most engineering-bound international candidates will sit.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Position** — one of the five CSCA subjects; the language half alongside the fundamental subjects (Math compulsory, plus Physics and/or Chemistry per program)',
              '**The pair** — Humanities Chinese (人文中文) for business/law/humanities, STEM Chinese (理工中文) for engineering/computer science/physical sciences; your program page specifies which',
              '**Format** — 80 multiple-choice questions in about 60 minutes, scored out of 100; multiple choice only — no essay, listening, or oral',
              '**What it tests** — the ability to read academic and technical Chinese: textbook-register passages, problem scenarios, and the terminology of STEM disciplines',
              '**English-taught engineering applicants** — many programs still require the track or accept a fundamentals-only combination; the variation is wider for English-taught degrees, so verify per program',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Engineering applicants from English-speaking systems: this track is usually your biggest CSCA unknown, and your biggest opportunity — it is the one subject where preparation for the exam and preparation for surviving a Chinese university lecture are the same activity.',
          },
        ],
      },
      {
        id: 'the-vocabulary',
        h2: 'The technical vocabulary layer',
        intro:
          'Three sub-stacks: general academic Chinese, math/quantity terms, and science-domain terms. All three compound with your other CSCA subjects.',
        blocks: [
          {
            type: 'table',
            caption: 'Starter glossary — the ~30 highest-yield terms per stack',
            columns: ['Stack', 'Sample terms (zh — en)'],
            rows: [
              ['Academic verbs/connectives', '因此 therefore · 然而 however · 根据 according to · 表明 indicates · 导致 leads to · 计算 calculate · 分析 analyze · 证明 prove'],
              ['Math & quantity', '数 number · 函数 function · 方程 equation · 微分/导数 derivative · 概率 probability · 图形 figure · 增大/减小 increase/decrease · 约等于 approximately equal'],
              ['Physics & engineering', '力 force · 速度 velocity · 能量 energy · 电流 electric current · 电压 voltage · 磁场 magnetic field · 材料 material · 结构 structure · 温度 temperature'],
              ['Chemistry & biology', '元素 element · 反应 reaction · 溶液 solution · 分子 molecule · 实验 experiment · 细胞 cell · 浓度 concentration · 氧化 oxidation'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Word-formation compounds** — technical Chinese is built from a small set of recurring characters: 电 (electric-) spawns 电流/电压/电阻/电荷; 力 (force) spawns 压力/重力/张力; master ~100 characters and you parse hundreds of terms',
              '**Scenario adjectives that change the physics** — 匀速 (uniform velocity), 静止 (at rest), 光滑 (frictionless), 密闭 (sealed) — the same terms the Physics paper uses in its stems',
              '**Verb precision matters** — 升高 vs 增加 vs 提升 are near-synonyms in prose but signal different things in technical descriptions; context questions probe exactly this',
              '**Glossary method** — one deck, sorted by stack; every unknown term from practice passages and science-subject stems goes in; review daily, 20 minutes',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The compounding rule: any term you learn for STEM Chinese that appears in a Physics or Chemistry stem is a term you will recognize at reading speed in those papers too. Annotate your science-prep materials IN Chinese and the decks build themselves.',
          },
        ],
      },
      {
        id: 'question-style',
        h2: 'What the questions ask',
        intro:
          'Like the Humanities track, the format is passage-based multiple choice — the register and vocabulary are technical. The exact internal blueprint lives on the portal; train the transferable skills.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Expect textbook-register passages** — explanations of processes, mechanisms, or scenarios drawn from first-year STEM teaching materials',
              '**Expect scenario comprehension** — a described experimental or engineering situation with questions on what follows from the setup — reading the scenario correctly IS the skill',
              '**Expect terminology-in-context** — a technical term quoted from the passage with options testing whether you can infer its meaning from surrounding description',
              '**Expect quantitative-language questions** — passages describing trends, comparisons, and magnitudes (增大/减小/高于/低于) where misreading the direction of change is the designed trap',
              '**80 questions / 60 minutes** — same clock discipline as the Humanities track: ~45 seconds per question, flag-and-return on long passages',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The signature STEM-track trap is direction-of-change: options that reverse 增大/减小 (increase/decrease) or swap 高于/低于 (higher/lower). Underline every direction word in the passage before looking at options.',
          },
        ],
      },
      {
        id: 'two-birds',
        h2: 'The two-birds strategy with Physics and Chemistry',
        intro:
          'STEM Chinese is the only CSCA subject where preparation for another subject IS preparation for this one — if you set it up deliberately.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Annotate science prep in Chinese** — as you drill Physics/Chemistry MCQs, write the Chinese term beside every technical concept in your notes; your error log becomes a glossary source',
              '**Read science, not literature** — your daily Chinese reading should be textbook pages and popular-science articles, not essays; the register and vocabulary transfer directly',
              '**Do formula sheets bilingually** — write your Physics formula sheet with Chinese labels (速度 for velocity, 加速度 for acceleration); review sessions train both decks at once',
              '**Use the diagram vocabulary** — the 20-character circuit/force-diagram label list from the Physics guide is a subset of this track\'s glossary; one list, three papers',
              '**Sequence within the 8-week plan** — run STEM Chinese reading (weeks 3–8, parallel track) against the science-patch weeks (2–4) so the same domains are being read and drilled simultaneously',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Candidates who set this up properly report the STEM Chinese paper reads like a slow-motion version of their Physics paper: same words, no formulas. That is the compounding working as designed.',
          },
        ],
      },
      {
        id: 'reading-speed',
        h2: 'Reading-speed drills',
        intro:
          'Vocabulary is necessary but not sufficient — the clock demands reading throughput. Throughput is trainable in small daily blocks.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Daily minimum** — one textbook-register page or popular-science article, read twice: once for content, once for speed',
              '**Chunk reading** — Chinese technical prose reads in multi-character chunks (函数关系 as one unit, not four characters); practice chunk-level recognition over character-by-character decoding',
              '**Timed extraction** — after each passage, write its three main claims in one line each, in any language; if you cannot, you read characters but not the passage',
              '**Progress metric** — words-per-minute on familiar-topic passages; expect slow weeks 1–2, then a step change around week 4 as the glossary converges',
              '**Exam simulation** — from week 5, full 80-question paced sets; the reading fatigue on question 60+ is real and only simulated practice prepares it',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Ten focused pages over ten days beats fifty skimmed pages over the same period. The glossary-convergence effect only kicks in when every unknown term actually enters the deck.',
          },
        ],
      },
      {
        id: 'hsk-bridge',
        h2: 'The HSK bridge and the waiver check',
        intro:
          'Same structure as the Humanities track: HSK 4–5 is the floor, domain terms are the differentiator — and a qualifying HSK may remove the subject entirely.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The floor** — HSK 4–5 general vocabulary; if shaky, restore it first, because technical compounds are built from general characters',
              '**The differentiator** — the technical stacks in the glossary section above; this is where engineering applicants who never studied Chinese academically gain or lose the most',
              '**The waiver** — a qualifying HSK score can waive the Professional Chinese subject for some applicants; the bar is university-specific — ask each target in writing (see the exemptions guide)',
              '**Even with a waiver** — the vocabulary is not wasted: it is the working language of your future lectures, labs, and textbooks in a Chinese university',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'English-taught engineering applicants sometimes assume the track is waived because the program is in English. Sometimes it is — and sometimes it is not. The written answer from the admissions office is the only version that counts.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the STEM Chinese track?',
        a: 'It is one of the two Professional Chinese tracks — the CSCA\'s language subject — designed for applicants to engineering, computer science, and physical-science degrees. It is 80 multiple-choice questions in about 60 minutes, scored out of 100, testing academic Chinese in technical contexts.',
      },
      {
        q: 'Who takes STEM Chinese instead of the Humanities track?',
        a: 'Applicants whose programs specify it — typically engineering, computer science, physics, materials, and other technical degrees. Business, law, and humanities applicants usually sit the Humanities track instead. Your program page is the authority on which track applies.',
      },
      {
        q: 'Is the STEM track easier if I\'m good at math and physics?',
        a: 'It helps more than candidates expect: the track\'s vocabulary (力, 电流, 函数, 反应) is exactly the vocabulary the science papers use in stems and diagrams. But the track still tests Chinese reading comprehension — science intuition does not substitute for vocabulary and reading speed.',
      },
      {
        q: 'Does the paper include writing or listening?',
        a: 'No — like both Professional Chinese tracks and all CSCA subjects, it is multiple choice only: 80 questions in about 60 minutes. There is no essay, no listening, and no oral component.',
      },
      {
        q: 'Can a good HSK score waive the STEM Chinese track?',
        a: 'A qualifying HSK score can waive the Professional Chinese subject for some applicants — the qualifying bar is university-specific and applied inconsistently. Ask each target university in writing. Mathematics and required sciences remain compulsory regardless.',
      },
      {
        q: 'How many technical terms do I actually need?',
        a: 'A working starter set is around 150 terms across academic connectives, math/quantity language, and physics/chemistry/engineering nouns — built from a base of ~100 recurring characters. Your glossary converges quickly because technical passages reuse a small working vocabulary heavily.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm the track requirement per program',
        text: 'Check each engineering/science program page for its required Professional Chinese track and whether English-taught variants accept fundamentals-only combinations. Get ambiguous cases confirmed in writing by admissions.',
      },
      {
        name: 'Audit the HSK floor first',
        text: 'Technical compounds are built from general characters. If HSK 4–5 vocabulary is weak, restore it in weeks 1–2 alongside starting the academic-reading diet; do not jump straight to terminology.',
      },
      {
        name: 'Start the bilingual annotation habit',
        text: 'From your first Physics/Chemistry prep session, annotate notes and formula sheets with the Chinese terms. Your error log becomes a glossary source and the two-birds compounding starts immediately.',
      },
      {
        name: 'Build the three-stack glossary deck',
        text: 'Academic connectives, math/quantity terms, science-domain nouns — one deck, ~150 starter terms, reviewed 20 minutes daily. Add every unknown term from practice passages and science stems.',
      },
      {
        name: 'Drill direction-of-change discipline',
        text: 'In every practice passage, underline 增大/减小/高于/低于-type words before reading options. This one habit neutralizes the track\'s signature trap family.',
      },
      {
        name: 'Close with two full timed mocks',
        text: 'Two 80-question mocks under exam conditions in the final fortnight — reading fatigue on question 60+ only responds to simulated full-length practice. Re-read glossaried passages in the last week.',
      },
    ],
    ctaTitle: 'Building technical Chinese for the CSCA?',
    ctaSubtitle:
      'SICA counselors confirm your track requirements, set up the two-birds prep structure with your science subjects, and supply the STEM glossary decks and passage packs. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-humanities-chinese-guide',
        label: 'CSCA Professional Chinese — Humanities track',
        description: 'The other track: academic Chinese for business, law, and humanities applicants.',
      },
      {
        href: '/csca-physics-guide',
        label: 'CSCA Physics — syllabus & prep',
        description: 'The science subject whose vocabulary overlaps most with this track.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, exemptions, and the CSC requirement.',
      },
    ],
  },
  zh: {
    slug: 'csca-stem-chinese-guide',
    eyebrow: '指南 · CSCA 理工中文',
    title: 'CSCA 专业中文——理工中文轨：工科与理科申请者的技术中文',
    description:
      'CSCA 专业中文的理工中文轨：约 60 分钟 80 道选择题，考查工科与理科学位所需的技术学术中文。入门术语表、阅读速度训练，以及与物理化学备考的「一石二鸟」策略。',
    subtitle:
      '专业中文是 CSCA 的语言科目，分两轨。理工中文轨面向工科、计算机、物理科学与技术类学位申请者：约 60 分钟 80 道选择题、满分 100。它考技术语境下的学术中文——教科书语篇、情景描述，以及中文的数理化词汇。隐藏优势：备考这条轨就是在备考你物理化学试卷的读题理解——一份努力，两科受益。',
    stats: [
      { value: '80', label: '道选择题' },
      { value: '约 60 分钟', label: '单科时长' },
      { value: '约 150', label: '个核心术语起步' },
      { value: '一举两得', label: '兼治理科科目备考' },
    ],
    quickAnswer:
      '理工中文轨（理工中文）是 CSCA 专业中文两轨之一——面向国际本科申请者的语言科目。服务工科、计算机与物理科学学位申请者：约 60 分钟 80 道选择题、满分 100。它考技术语境下的学术中文——使用数学、物理、化学、工程词汇的语篇题。多数考生错过的战略要点：你为这条轨建的技术词汇，正是数学/物理/化学试卷题干与图形用的词汇——理工中文备考与理科科目备考相互叠加而非互相争夺。',
    keyTakeaways: [
      '专业中文两轨——人文中文与理工中文；工科/理科项目通常要求理工',
      '理工轨：约 60 分钟 80 道选择题，满分 100；无写作、无听力',
      '考技术语境的学术中文：教科书语域语篇、情景描述、技术术语',
      '词汇与数学/物理/化学试卷的题干/图形高度重叠——备一次，两处受益',
      '入门术语表：约 150 个术语覆盖大部分阅读摩擦；构词复合让收益翻倍',
      '考哪轨由项目规定——逐项目页核对；合格 HSK 可为部分申请者免考此科',
    ],
    sections: [
      {
        id: 'what-it-is',
        h2: '理工中文轨是什么',
        intro:
          '理工轨是技术类学位申请者的语言科目——也是多数工科方向国际考生会考的那一轨。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**位置**——五科之一；与基础科目（数学必考，加按项目要求的物理/化学）并列的语言半场',
              '**一对**——人文中文面向商科/法律/人文，理工中文面向工科/计算机/物理科学；项目页规定考哪轨',
              '**形式**——约 60 分钟 80 道选择题，满分 100；全为选择题——无作文、听力、口试',
              '**考什么**——读学术与技术中文的能力：教科书语域语篇、问题情景、STEM 学科术语',
              '**英文授课工科申请者**——许多项目仍要求本轨或接受仅基础科组合；英文授课学位变异更大，逐项目核验',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '英语体系出身的工科申请者：这条轨通常是你最大的 CSCA 未知数，也是最大的机会——它是唯一一门「备考考试」与「为在中国大学生存做准备」完全同一件事的科目。',
          },
        ],
      },
      {
        id: 'the-vocabulary',
        h2: '技术词汇层',
        intro:
          '三个子栈：通用学术中文、数学/数量词、科学领域词。三者都与你其他 CSCA 科目相互叠加。',
        blocks: [
          {
            type: 'table',
            caption: '入门术语表——每栈约 30 个高收益词（示例）',
            columns: ['栈', '示例术语'],
            rows: [
              ['学术动词/连接词', '因此 · 然而 · 根据 · 表明 · 导致 · 计算 · 分析 · 证明'],
              ['数学与数量', '数 · 函数 · 方程 · 微分/导数 · 概率 · 图形 · 增大/减小 · 约等于'],
              ['物理与工程', '力 · 速度 · 能量 · 电流 · 电压 · 磁场 · 材料 · 结构 · 温度'],
              ['化学与生物', '元素 · 反应 · 溶液 · 分子 · 实验 · 细胞 · 浓度 · 氧化'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**构词复合**——技术中文由一小组反复出现的字构成：电 生出 电流/电压/电阻/电荷；力 生出 压力/重力/张力；掌握约 100 字即可解析数百词',
              '**改变物理图景的情景形容词**——匀速、静止、光滑、密闭——与物理试卷题干用词相同',
              '**动词精度**——升高/增加/提升在散文里近义，在技术描述中信号不同；语境题专门探这个',
              '**术语表法**——一副卡组、按栈分类；练习语篇与理科题干的每个生词都进卡组；每天复习 20 分钟',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '叠加法则：你为理工中文学的词，只要出现在物理或化学题干里，就会在那些试卷里以阅读速度被你认出。把理科备考材料直接用中文标注，卡组就自动生长。',
          },
        ],
      },
      {
        id: 'question-style',
        h2: '题目问什么',
        intro:
          '与人文轨相同，形式是语篇选择题——语域与词汇是技术的。内部细目以门户为准；训练可迁移技能。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**预期教科书语域语篇**——取材于大一 STEM 教材的过程、机理或情景说明',
              '**预期情景理解**——描述的实验或工程情景，考「从题设能推出什么」——正确读出情景本身就是技能',
              '**预期术语-语境题**——从语篇引出的技术术语，选项考能否从周边描述推断词义',
              '**预期数量语言题**——描述趋势、比较与量级的语篇（增大/减小/高于/低于），读反变化方向是设计好的陷阱',
              '**80 题 / 60 分钟**——与人文轨相同的计时纪律：均摊约每题 45 秒，长语篇标记回攻',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '理工轨的招牌陷阱是变化方向：反转 增大/减小 或对调 高于/低于 的选项。看选项前，先把语篇里所有方向词下划线。',
          },
        ],
      },
      {
        id: 'two-birds',
        h2: '与物理化学的「一石二鸟」策略',
        intro:
          '理工中文是唯一一门「为别科备考就是为本科备考」的 CSCA 科目——前提是你刻意安排。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**理科备考用中文标注**——刷物理/化学选择题时，在笔记里为每个技术概念写上中文术语；你的错误日志就成了术语表素材',
              '**读科学，不读散文**——每天的中文阅读应是教科书页面与科普文章，不是随笔；语域与词汇直接迁移',
              '**公式表做成双语**——物理公式表用中文标注（速度、加速度……）；复习时同时训练两副卡组',
              '**复用图形词汇**——物理指南里的 20 字电路/受力标注清单是本轨术语表的子集；一份清单，三张试卷',
              '**嵌入 8 周计划的时序**——理工中文阅读（第 3-8 周并行轨）对齐理科补弱周（第 2-4 周），同一知识域边读边刷',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '安排得当的考生反馈：理工中文卷读起来像慢动作的物理卷——同样的词，没有公式。这就是叠加效应按设计生效。',
          },
        ],
      },
      {
        id: 'reading-speed',
        h2: '阅读速度训练',
        intro:
          '词汇是必要条件不充分——时钟要求阅读吞吐量。吞吐量可以在小块日常训练中练出来。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**每日下限**——一页教科书语域文本或一篇科普文章，读两遍：一遍内容，一遍速度',
              '**组块阅读**——中文技术文本按多字组块读（「函数关系」是一个单元，不是四个字）；练组块级识别，别逐字解码',
              '**限时提取**——每篇读完后，用一行一条写出三个主要主张（任何语言都行）；写不出，说明你读的是字不是语篇',
              '**进度指标**——熟悉主题语篇的每分钟字数；第 1-2 周慢，第 4 周前后随术语收敛出现台阶',
              '**全真模拟**——第 5 周起做 80 题节奏整卷；第 60 题后的阅读疲劳是真实的，只有全真练习能准备',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '十天精读十页胜过十天略读五十页。术语收敛效应只有在每个生词真正进卡组时才会启动。',
          },
        ],
      },
      {
        id: 'hsk-bridge',
        h2: 'HSK 之桥与免考检查',
        intro:
          '与人文轨同构：HSK 4-5 是地板，领域术语是差异化——合格 HSK 还可能整科免考。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**地板**——HSK 4-5 通用词汇；不稳先补，因为技术复合词由通用字构成',
              '**差异化**——上文术语表一节的技术栈；这是没受过中文学术训练的工科申请者得失最大处',
              '**免考**——合格 HSK 成绩可为部分申请者免考专业中文；门槛因校而异——逐校书面询问（见豁免指南）',
              '**即使免考**——词汇也不浪费：它是你未来在中国大学听课、实验、读教材的工作语言',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '英文授课工科申请者有时以为「项目是英文的，这轨就免了」。有时免——有时不免。招生办的书面答复是唯一算数的版本。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '理工中文轨是什么？',
        a: '它是专业中文两轨之一——CSCA 的语言科目——面向工科、计算机与物理科学学位申请者。约 60 分钟 80 道选择题、满分 100，考技术语境下的学术中文。',
      },
      {
        q: '谁考理工中文而不是人文轨？',
        a: '项目规定的申请者——典型为工科、计算机、物理、材料等技术类学位。商科、法律、人文申请者通常考人文轨。项目页是哪轨适用的权威。',
      },
      {
        q: '数理好会让理工轨更容易吗？',
        a: '帮助比预期大：本轨词汇（力、电流、函数、反应）正是理科试卷题干与图形用的词汇。但本轨仍考中文阅读理解——理科直觉替代不了词汇量与阅读速度。',
      },
      {
        q: '试卷有写作或听力吗？',
        a: '没有——与两条专业中文轨及所有 CSCA 科目一样，全为选择题：约 60 分钟 80 题。无作文、无听力、无口试。',
      },
      {
        q: 'HSK 分数高能免理工中文轨吗？',
        a: '合格 HSK 成绩可为部分申请者免考专业中文——合格线因校而异且执行不一。逐校书面询问。无论如何，数学与要求理科仍为必考。',
      },
      {
        q: '实际需要多少个技术术语？',
        a: '可用的起步集约 150 词，覆盖学术连接词、数学/数量语言与理化工程名词——建立在约 100 个反复出现的汉字之上。术语表收敛很快，因为技术语篇高度复用一小组工作词汇。',
      },
    ],
    howToSteps: [
      {
        name: '逐项目确认考轨要求',
        text: '核对每个工科/理科项目页要求的专业中文轨，以及英文授课变体是否接受仅基础科组合。含糊 case 让招生办书面确认。',
      },
      {
        name: '先审计 HSK 地板',
        text: '技术复合词由通用字构成。若 HSK 4-5 词汇薄弱，第 1-2 周边启动学术阅读食谱边保温地板；别直冲术语。',
      },
      {
        name: '养成双语标注习惯',
        text: '从第一次物理/化学备考起，笔记与公式表都标中文术语。错误日志变成术语表素材，一石二鸟的叠加立即启动。',
      },
      {
        name: '建三栈术语卡组',
        text: '学术连接词、数学/数量词、科学领域名词——一副卡组、约 150 个起步词，每天复习 20 分钟。练习语篇与理科题干的新词随手加。',
      },
      {
        name: '练变化方向纪律',
        text: '每篇练习语篇，看选项前先给 增大/减小/高于/低于 类词下划线。这一个习惯就能拆掉本轨的招牌陷阱族。',
      },
      {
        name: '以两套全真限时整卷收尾',
        text: '最后两周两套考试条件的 80 题整卷——第 60 题后的阅读疲劳只对全真练习有反应。最后一周重读记过术语的语篇。',
      },
    ],
    ctaTitle: '正在为 CSCA 建技术中文？',
    ctaSubtitle:
      'SICA 顾问确认你的考轨要求、与理科科目一起搭好「一石二鸟」备考结构，并提供理工术语卡组与语篇资料包。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-humanities-chinese-guide',
        label: 'CSCA 专业中文——人文中文轨',
        description: '另一条轨：面向商科、法律与人文申请者的学术中文。',
      },
      {
        href: '/csca-physics-guide',
        label: 'CSCA 物理——大纲与备考',
        description: '与本轨词汇重叠最多的理科科目。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用、豁免与 CSC 要求。',
      },
    ],
  },
};
