import type { LocalizedGuide } from './types';

/**
 * "CSCA Professional Chinese — Humanities track" — Batch 2, article
 * #9 of the 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca humanities chinese", "csca chinese subject",
 * "professional chinese exam".
 *
 * Static content. The track's existence, 80-question MCQ format and
 * 60-minute duration are from launch-period official notices; the
 * internal question taxonomy is described at the level of "what such
 * papers assess" without inventing an official blueprint.
 */
export const cscaHumanitiesChineseGuide: LocalizedGuide = {
  en: {
    slug: 'csca-humanities-chinese-guide',
    eyebrow: 'GUIDE · CSCA HUMANITIES CHINESE',
    title: 'CSCA Professional Chinese — Humanities Track: Format, Vocabulary, and Prep for Business, Law & Arts Applicants',
    description:
      'The Humanities Chinese track of the CSCA Professional Chinese subject: 80 multiple-choice questions in ~60 minutes testing academic Chinese for humanities and social-science degrees. Who picks it, the vocabulary layer, and the HSK-to-CSCA bridging plan.',
    subtitle:
      'Professional Chinese is the language half of the CSCA, offered in two tracks — Humanities (人文中文) and STEM (理工中文). The Humanities track serves applicants to business, economics, law, humanities, social sciences, and arts degrees: 80 multiple-choice questions in about 60 minutes, scored out of 100. It tests academic and professional Chinese — reading passages and vocabulary from the domains you will study — beyond general proficiency as measured by HSK. HSK 4–5 vocabulary is the floor; domain terminology is the differentiator.',
    stats: [
      { value: '80', label: 'Multiple-choice questions' },
      { value: '~60 min', label: 'Per paper' },
      { value: '2 tracks', label: 'Humanities vs STEM — pick one' },
      { value: 'HSK 5', label: 'Safe planning vocabulary floor' },
    ],
    quickAnswer:
      'The Humanities Chinese track (人文中文) is one of two Professional Chinese tracks in the CSCA — the language subject for international bachelor\'s applicants. It serves applicants to humanities-domain degrees: business, economics, management, law, humanities, social sciences, and arts. The format is 80 multiple-choice questions in about 60 minutes, scored out of 100. Unlike HSK, which measures general proficiency, Professional Chinese tests academic Chinese in your study domain — passage-based questions using the vocabulary of business, law, and society. Plan on HSK 4–5 as the vocabulary floor, with domain terminology built on top; a qualifying HSK score can also waive this subject entirely for some applicants.',
    keyTakeaways: [
      'Two Professional Chinese tracks exist — Humanities (人文中文) and STEM (理工中文); you sit the one your program requires',
      'Humanities track: 80 MCQs in ~60 minutes, scored out of 100',
      'For applicants to business, economics, management, law, humanities, social sciences, and arts degrees',
      'Tests academic/professional Chinese — domain passages and terminology, beyond general HSK proficiency',
      'Vocabulary floor: HSK 4–5; differentiator: business/law/social-science terms in Chinese',
      'A qualifying HSK score can waive this subject for some applicants — confirm the bar with each university in writing',
    ],
    sections: [
      {
        id: 'what-it-is',
        h2: 'What the Humanities Chinese track is',
        intro:
          'Professional Chinese is the CSCA\'s language subject, split into two tracks by academic domain. The Humanities track is the one most international applicants in non-STEM fields will sit.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Position in the exam** — one of the five CSCA subjects; the language half alongside the fundamental subjects (Math compulsory, plus program-required sciences)',
              '**The choice** — Humanities Chinese (人文中文) vs STEM Chinese (理工中文); your program\'s page specifies which track its applicants sit — do not pick by preference',
              '**Format** — 80 multiple-choice questions in about 60 minutes, all scored out of 100; no essay, no listening, no oral component',
              '**Audience** — applicants to business, economics, management, finance, law, international relations, humanities, social sciences, media, and arts programs',
              '**Purpose** — proof that you can read and process academic Chinese in your degree domain, not just order food and pass an HSK grid',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'English-taught business applicants: check whether your program lists the Humanities track or a fundamentals-only combination — combinations for English-taught degrees vary more between universities, and some accept the exam without the Chinese track.',
          },
        ],
      },
      {
        id: 'beyond-hsk',
        h2: 'Professional Chinese vs HSK — what "academic" means here',
        intro:
          'HSK measures general proficiency on everyday and semi-formal registers. Professional Chinese measures whether you can function in an academic domain — a different, higher bar.',
        blocks: [
          {
            type: 'table',
            caption: 'What changes when you move from HSK to Professional Chinese',
            columns: ['Dimension', 'HSK 4–5', 'Humanities Chinese track'],
            rows: [
              ['Register', 'Everyday to semi-formal', 'Academic and professional writing'],
              ['Vocabulary', 'General frequency lists', 'Domain terms: economics, law, management, society'],
              ['Texts', 'Dialogues, notices, short essays', 'Textbook-style passages, argumentative extracts, case descriptions'],
              ['Skill tested', 'Comprehension of the language', 'Comprehension of the language INSIDE a discipline'],
              ['Question logic', '"What does this sentence mean?"', '"What does this passage claim, assume, or conclude about its subject?"'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A useful self-test: read a Chinese news article about trade policy or a university textbook page on management theory. If you understood the general shape but missed the precise claims, that gap — not your HSK level — is what this track examines.',
          },
        ],
      },
      {
        id: 'vocabulary-layer',
        h2: 'The vocabulary layer — the floor and the differentiator',
        intro:
          'Two distinct vocabulary stacks: the general-proficiency floor from HSK, and the domain stack this track exists to test.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The floor (HSK 4–5)** — ~2,500–4,000 characters/words of general vocabulary; if this layer is shaky, fix it first, because no domain term helps if connective vocabulary fails',
              '**The differentiator (domain terms)** — the recurring nouns of your target field: for business/economics (市场 market, 需求 demand, 投资 investment, 消费 consumption, 增长 growth); for law/society (法律 law, 权利 rights, 政策 policy, 社会 society, 教育 education)',
              '**Academic connectives** — 因此 (therefore), 然而 (however), 表明 (indicates), 导致 (leads to), 根据 (according to) — the logical skeleton of argumentative passages and the highest-frequency exam vocabulary of all',
              '**Word-formation leverage** — Chinese domain terms are compounds of familiar characters (经济 + 学 = economics); learning 100 high-frequency academic characters unlocks hundreds of terms',
              '**Method** — two decks: one for connectives/academic verbs, one for your domain; 20 minutes daily beats 2 hours weekly',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The single highest-yield habit: keep a running glossary of every unknown term from practice passages, and re-read passages a week later. Domain vocabulary repeats heavily within each field — your glossary converges on the exam\'s working set.',
          },
        ],
      },
      {
        id: 'question-style',
        h2: 'What the questions ask (and how to train for it)',
        intro:
          'As a multiple-choice academic-reading paper, the track rewards passage-processing speed and claim-level accuracy. The exact internal blueprint lives on the portal — train the transferable skills.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Expect passage-based comprehension** — textbook-register passages in humanities domains with questions on main claims, supporting details, and logical function of specific sentences',
              '**Expect vocabulary-in-context** — a term or expression quoted from the passage; the options test whether you can read its meaning from the surrounding argument, not from a dictionary definition',
              '**Expect logical-relation questions** — which connective fits, what follows from the passage, what the author is assuming — reading for argument structure, not just content',
              '**80 questions in 60 minutes** — about 45 seconds per question average; passage questions need budgeting (read fast, answer faster), so train a strict per-question clock from week one',
              '**No writing** — everything is selection, so precision of recognition matters more than production; you never have to compose Chinese, only to parse it',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The classic Humanities-track miss: answering with what is TRUE in the real world instead of what the PASSAGE claims. Train the discipline of answer-from-passage-only — options that contradict your knowledge but follow from the text are correct.',
          },
        ],
      },
      {
        id: 'hsk-bridge',
        h2: 'The HSK-to-CSCA bridging plan',
        intro:
          'Most candidates arrive from HSK preparation. The bridge is deliberately short: keep the HSK floor warm, switch reading material to academic-register texts, and drill the domain glossary.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Weeks 1–2 — switch your reading diet** — keep HSK 5 vocabulary reviews running at half volume; add daily reading of one academic-register text: a business/society news feature or a first-year textbook page in your target field',
              '**Weeks 3–4 — build the two decks** — extract every unknown term into the connectives deck and the domain deck; start timed passage sets (5 passages, strict clocks) to build the 45-seconds-per-question rhythm',
              '**Weeks 5–6 — mixed timed sets + claim discipline** — full 80-question-paced sets; practice the answer-from-passage-only rule on every question; log every miss as vocabulary / logic / clock',
              '**Weeks 7–8 — mock + glossary convergence** — two full mocks under exam conditions; re-read all glossaried passages; freeze new vocabulary in the final week',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Candidates holding a strong HSK score should first ask each target university whether it waives the Professional Chinese subject entirely (see the exemptions guide) — the waiver can replace this whole track. The bridging plan is for applicants who must sit it.',
          },
        ],
      },
      {
        id: 'who-waives',
        h2: 'Who can skip this track entirely',
        intro:
          'One of the published exemption routes touches exactly this subject — worth checking before you commit eight weeks of prep.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The HSK waiver** — a qualifying HSK score can waive the Professional Chinese subject for degree applicants; the exact qualifying bar is university-specific (no universal published cutoff), so ask in writing',
              '**The language-program exemption** — applicants to Chinese-language programs with HSK 4 skip the whole exam, not just this subject — a different route for a different program type',
              '**Fundamentals remain** — waiving the Chinese track does not waive Mathematics (compulsory for everyone) or program-required sciences',
              '**Strategic view** — if your HSK is near the waiver bar, retesting HSK may be cheaper than preparing this track; if your HSK is far from it, start the bridging plan now and treat the waiver as a bonus',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Waiver bars are applied inconsistently across universities. The waiver only exists if your target university confirms it in writing — an assumed waiver is a missing score at review time.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the Humanities Chinese track in the CSCA?',
        a: 'It is one of the two Professional Chinese tracks — the language subject of the CSCA — designed for applicants to humanities-domain degrees: business, economics, management, law, humanities, social sciences, and arts. It is 80 multiple-choice questions in about 60 minutes, scored out of 100, testing academic Chinese in those domains.',
      },
      {
        q: 'How do I choose between the Humanities and STEM tracks?',
        a: 'You don\'t pick by preference — your target program specifies the track its applicants must sit. Business/law/humanities programs typically require the Humanities track; engineering/science programs typically require STEM Chinese. Check each program page.',
      },
      {
        q: 'Is the Humanities Chinese track harder than HSK 5?',
        a: 'It is different rather than uniformly harder: HSK 5 measures general proficiency, while this track measures academic Chinese inside a discipline. Candidates at HSK 5 level usually find the general language manageable but the domain vocabulary and argument-structure questions demanding.',
      },
      {
        q: 'Does the paper include writing or listening?',
        a: 'No — the Professional Chinese subject is multiple choice only: 80 questions in about 60 minutes. There is no essay, no listening section, and no oral component. Recognition and parsing skills are what is examined.',
      },
      {
        q: 'Can a good HSK score exempt me from this track?',
        a: 'Possibly — a qualifying HSK score can waive the Professional Chinese subject for degree applicants, but the qualifying bar is university-specific and applied inconsistently. Ask each target university in writing; the fundamentals (Math, required sciences) remain compulsory either way.',
      },
      {
        q: 'How long should I prepare for the Humanities track?',
        a: 'Four to eight weeks depending on your HSK base. Candidates at a solid HSK 4 can bridge in about four weeks (diet switch + two glossary decks + timed sets); candidates below that should first shore up the HSK 4–5 floor, then follow the full eight-week plan.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm the track with each target program',
        text: 'Read each program page for its required Professional Chinese track. Business and humanities programs almost always mean the Humanities track, but English-taught variants sometimes accept fundamentals-only combinations — verify, don\'t assume.',
      },
      {
        name: 'Audit your HSK floor',
        text: 'If HSK 4–5 vocabulary is solid, go straight to domain building. If not, spend the first two weeks restoring the floor at half volume while adding academic reading — the floor is what makes domain terms learnable.',
      },
      {
        name: 'Switch your reading diet to academic register',
        text: 'Replace general HSK readers with one daily academic-register text: a business or society news feature, or a first-year textbook page from your target field. Underline every unknown term.',
      },
      {
        name: 'Build the two glossary decks',
        text: 'Deck 1: academic connectives and verbs (因此/然而/表明/导致…). Deck 2: your domain\'s recurring nouns. Review both daily; add every new term from practice passages.',
      },
      {
        name: 'Drill timed passage sets with claim discipline',
        text: 'Five-passage sets on strict clocks, training the answer-from-passage-only rule: an option that contradicts your world knowledge but follows from the text is correct. Log every miss as vocabulary, logic, or clock.',
      },
      {
        name: 'Close with two full 80-question mocks',
        text: 'Two mocks under exam timing in the final fortnight; re-read all glossaried passages the week before; freeze new vocabulary in the last week.',
      },
    ],
    ctaTitle: 'Bridging from HSK to Professional Chinese?',
    ctaSubtitle:
      'SICA counselors assess your HSK base against the waiver bar, build your Humanities-track plan, and supply the domain glossary decks and timed passage packs. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-stem-chinese-guide',
        label: 'CSCA Professional Chinese — STEM track',
        description: 'The other track: technical Chinese for engineering and science applicants.',
      },
      {
        href: '/guides/hsk',
        label: 'HSK Chinese proficiency test guide',
        description: 'The general-proficiency floor — and the waiver route for strong speakers.',
      },
      {
        href: '/csca-exam-exemptions',
        label: 'Who must take the CSCA — and who is exempt',
        description: 'The qualifying-HSK waiver that can replace this subject entirely.',
      },
    ],
  },
  zh: {
    slug: 'csca-humanities-chinese-guide',
    eyebrow: '指南 · CSCA 人文中文',
    title: 'CSCA 专业中文——人文中文轨：题型、词汇与商科/法律/艺术类申请者备考方案',
    description:
      'CSCA 专业中文的人文中文轨：约 60 分钟 80 道选择题，考查人文社科类学位所需的学术中文。适用人群、词汇层次与 HSK 到 CSCA 的衔接计划。',
    subtitle:
      '专业中文是 CSCA 的语言科目，分人文中文与理工中文两轨。人文中文轨面向商科、经济学、法律、人文社科与艺术类学位申请者：约 60 分钟 80 道选择题、满分 100。它考的是学术与专业中文——来自你将攻读领域的语篇与词汇——超出 HSK 所测的通用水平。HSK 4-5 词汇是地板；领域术语才是拉开差距处。',
    stats: [
      { value: '80', label: '道选择题' },
      { value: '约 60 分钟', label: '单科时长' },
      { value: '2 轨', label: '人文 vs 理工——二选一' },
      { value: 'HSK 5', label: '安全的规划词汇地板' },
    ],
    quickAnswer:
      '人文中文轨（人文中文）是 CSCA 专业中文的两轨之一——面向国际本科申请者的语言科目。服务人文领域学位申请者：商科、经济、管理、法律、人文社科、艺术。形式为约 60 分钟 80 道选择题、满分 100。与测通用水平的 HSK 不同，专业中文考的是你学业领域内的学术中文——使用商科、法律、社会领域词汇的语篇题。以 HSK 4-5 为词汇地板，其上叠加领域术语；合格 HSK 成绩还可为部分申请者整体免考此科。',
    keyTakeaways: [
      '专业中文分两轨——人文中文与理工中文；考哪轨由项目要求决定',
      '人文轨：约 60 分钟 80 道选择题，满分 100',
      '面向商科、经济、管理、法律、人文社科与艺术类学位申请者',
      '考学术/专业中文——领域语篇与术语，超出 HSK 通用水平',
      '词汇地板：HSK 4-5；差异化：中文的商科/法律/社科术语',
      '合格 HSK 成绩可为部分申请者免考此科——逐校书面确认门槛',
    ],
    sections: [
      {
        id: 'what-it-is',
        h2: '人文中文轨是什么',
        intro:
          '专业中文是 CSCA 的语言科目，按学科域分两轨。非理工领域的多数国际申请者考的就是人文轨。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**在考试中的位置**——五科之一；与基础科目（数学必考，加项目要求的理科）并列的语言半场',
              '**选择**——人文中文 vs 理工中文；项目页规定其申请者考哪轨——不要凭偏好选',
              '**形式**——约 60 分钟 80 道选择题，满分 100；无作文、无听力、无口试',
              '**面向人群**——商科、经济、管理、金融、法律、国际关系、人文社科、传媒、艺术类项目申请者',
              '**目的**——证明你能读并能处理学位领域内的学术中文，而不只是点菜和刷 HSK 题库',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '英文授课商科申请者：核对你的项目列的是人文轨还是仅基础科组合——英文授课学位的组合在各校之间差异更大，有些接受不含中文轨的报考。',
          },
        ],
      },
      {
        id: 'beyond-hsk',
        h2: '专业中文与 HSK——「学术」意味着什么',
        intro:
          'HSK 测日常与半正式语域的通用水平。专业中文测的是你能否在学术领域内运作——是另一道更高的门槛。',
        blocks: [
          {
            type: 'table',
            caption: '从 HSK 到专业中文，改变的是什么',
            columns: ['维度', 'HSK 4-5', '人文中文轨'],
            rows: [
              ['语域', '日常到半正式', '学术与专业书面语'],
              ['词汇', '通用频率词表', '领域术语：经济、法律、管理、社会'],
              ['文本', '对话、通知、短文', '教科书式语篇、论述节选、案例描述'],
              ['考查技能', '对语言的理解', '对「学科之内语言」的理解'],
              ['题目逻辑', '「这句话什么意思？」', '「这段话对其主题主张、预设或结论了什么？」'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '一个有用的自测：读一篇中文的贸易政策新闻或管理教科书页面。若你懂了大意却没抓住精确主张——这个差距（而非 HSK 级别）正是本轨考查的东西。',
          },
        ],
      },
      {
        id: 'vocabulary-layer',
        h2: '词汇层次——地板与差异化',
        intro:
          '两层独立的词汇栈：来自 HSK 的通用水平地板，以及本轨存在意义所在的领域栈。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**地板（HSK 4-5）**——约 2500-4000 字/词的通用词汇；这一层不稳先补它——连接词汇不牢，领域术语再多也没用',
              '**差异化（领域术语）**——目标领域的高频名词：商科/经济（市场、需求、投资、消费、增长）；法律/社会（法律、权利、政策、社会、教育）',
              '**学术连接词**——因此、然而、表明、导致、根据——论述语篇的逻辑骨架，也是全卷最高频的考试词汇',
              '**构词杠杆**——中文领域术语是熟字复合（经济 + 学 = 经济学）；掌握 100 个高频学术汉字可解锁数百个术语',
              '**方法**——两副卡组：连接词/学术动词一副、领域名词一副；每天 20 分钟胜过每周 2 小时',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '回报率最高的习惯：把练习语篇里每个生词记进术语表，一周后重读语篇。领域词汇在每个领域内高度重复——你的术语表会收敛到考试的常用集。',
          },
        ],
      },
      {
        id: 'question-style',
        h2: '题目问什么（怎么训练）',
        intro:
          '作为选择题学术阅读卷，本轨奖励语篇处理速度与主张级准确度。内部细目以门户为准——训练可迁移的技能。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**预期语篇理解**——人文领域的教科书语域语篇，考主要主张、支撑细节、特定句子的逻辑功能',
              '**预期语境词汇**——从语篇中引出的术语或表达；选项考的是否能从上下文论证中读出词义，而非词典义',
              '**预期逻辑关系题**——哪个连接词合适、从语篇能推出什么、作者预设了什么——读的是论证结构，不只是内容',
              '**80 题 60 分钟**——均摊约每题 45 秒；语篇题需要预算（快读、更快答），从第一周就练严格计时',
              '**无写作**——全是选择，因此识别精度比产出更重要；你从不需要写中文，只需要解析它',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '人文轨经典失分：用「现实世界中什么是对的」作答，而不是「语篇主张什么」。训练「仅从语篇作答」的纪律——与你的常识矛盾但从原文可推出的选项，就是正确答案。',
          },
        ],
      },
      {
        id: 'hsk-bridge',
        h2: '从 HSK 到 CSCA 的衔接计划',
        intro:
          '多数考生来自 HSK 备考。衔接刻意做短：保温 HSK 地板、把阅读材料换成学术语域、刷领域术语表。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1-2 周——切换阅读食谱**——HSK 5 词汇复习减半保温；每天加读一篇学术语域文本：目标领域的商科/社会新闻特稿或大一教科书页面',
              '**第 3-4 周——建两副卡组**——把练习语篇中的生词分别归入连接词卡组与领域卡组；开始限时语篇套题（5 篇、严格计时）以建立每题 45 秒的节奏',
              '**第 5-6 周——混合限时套题 + 主张纪律**——按 80 题节奏的整卷套题；每题执行「仅从语篇作答」；把每个失分记为词汇/逻辑/计时',
              '**第 7-8 周——模考 + 术语收敛**——两套全真模考；重读所有记过术语的语篇；最后一周冻结新词汇',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '持高分 HSK 的考生应先逐校询问是否可整体免考专业中文（见豁免指南）——免考能替代整条轨。衔接计划是给必须参加的考生准备的。',
          },
        ],
      },
      {
        id: 'who-waives',
        h2: '谁可以完全不考这条轨',
        intro:
          '已公布的豁免通道中恰有一条触及本科目——投入八周备考前值得先查。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**HSK 免考**——合格 HSK 成绩可为学位申请者免考专业中文；合格线因校而异（无统一公布线），务必书面询问',
              '**语言项目豁免**——中文授课项目申请者凭 HSK 4 免整场考试，不止此科——是针对另一类项目类型的另一条通道',
              '**基础科保留**——免考中文轨不免数学（人人必考）与项目要求的理科',
              '**策略视角**——若你的 HSK 接近免考线，重考 HSK 可能比备考此轨便宜；若相距甚远，现在就开始衔接计划，把免考当作意外之喜',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '免考线各校执行不一。免考只有目标大学书面确认后才存在——假设出来的免考，就是审核时的缺分。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 的人文中文轨是什么？',
        a: '它是专业中文两轨之一——CSCA 的语言科目——面向人文领域学位申请者：商科、经济、管理、法律、人文社科、艺术。约 60 分钟 80 道选择题、满分 100，考这些领域内的学术中文。',
      },
      {
        q: '人文轨和理工轨怎么选？',
        a: '不由偏好选——目标项目规定其申请者考哪轨。商科/法律/人文项目通常要求人文轨；工科/理科项目通常要求理工中文。逐项目页核对。',
      },
      {
        q: '人文中文轨比 HSK 5 难吗？',
        a: '是「不同」而非全面更难：HSK 5 测通用水平，本轨测学科内的学术中文。HSK 5 水平的考生通常发现通用语言可应付，但领域词汇与论证结构题有挑战。',
      },
      {
        q: '试卷有写作或听力吗？',
        a: '没有——专业中文全为选择题：约 60 分钟 80 题。无作文、无听力、无口试。考的是识别与解析技能。',
      },
      {
        q: 'HSK 分数高能免考这条轨吗？',
        a: '可能——合格 HSK 成绩可为学位申请者免考专业中文，但合格线因校而异且执行不一。逐校书面询问；无论免考与否，基础科（数学、要求理科）仍为必考。',
      },
      {
        q: '人文轨要备多久？',
        a: '依 HSK 基础四到八周。扎实的 HSK 4 水平约四周可完成衔接（换食谱 + 两副术语卡组 + 限时套题）；更低的水平应先补 HSK 4-5 地板，再走完整八周计划。',
      },
    ],
    howToSteps: [
      {
        name: '逐项目确认考轨',
        text: '读每个项目页要求的专业中文轨。商科与人文项目几乎必然是人文轨，但英文授课变体有时接受仅基础科组合——核验，别假设。',
      },
      {
        name: '审计你的 HSK 地板',
        text: '若 HSK 4-5 词汇扎实，直接进入领域建设。若不扎实，前两周以半量复习保温地板、同时加学术阅读——地板是领域术语可学的前提。',
      },
      {
        name: '把阅读食谱换成学术语域',
        text: '把通用 HSK 读物换成每天一篇学术语域文本：目标领域的商科或社会新闻特稿、或大一教科书页面。给每个生词下划线。',
      },
      {
        name: '建两副术语卡组',
        text: '卡组一：学术连接词与动词（因此/然而/表明/导致……）。卡组二：你领域的反复出现的名词。每天复习；练习语篇的新词随手加。',
      },
      {
        name: '限时语篇套题 + 主张纪律',
        text: '严格计时的五篇套题，训练「仅从语篇作答」：与你的世界知识矛盾但从原文可推出的选项就是正确答案。把失分记为词汇、逻辑或计时。',
      },
      {
        name: '以两套 80 题整卷收尾',
        text: '最后两周两套考试计时的整卷；考前一周重读所有记过术语的语篇；最后一周冻结新词汇。',
      },
    ],
    ctaTitle: '正在从 HSK 衔接专业中文？',
    ctaSubtitle:
      'SICA 顾问评估你的 HSK 基础对照免考线、制定人文轨计划，并提供领域术语卡组与限时语篇资料包。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-stem-chinese-guide',
        label: 'CSCA 专业中文——理工轨',
        description: '另一条轨：面向工科与理科申请者的技术中文。',
      },
      {
        href: '/guides/hsk',
        label: 'HSK 汉语水平考试指南',
        description: '通用水平的地板——以及高水平者的免考通道。',
      },
      {
        href: '/csca-exam-exemptions',
        label: '谁必须参加 CSCA——谁可豁免',
        description: '可整体替代此科的合格 HSK 免考通道。',
      },
    ],
  },
};
