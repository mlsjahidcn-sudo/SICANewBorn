import type { LocalizedGuide } from './types';

/**
 * "How to prepare for the CSCA — 8-week study plan" — Batch 2,
 * article #11 of the 20-article CSCA cluster
 * (docs/csca-content-plan.md). The cluster's prep hub that the
 * subject guides (#6–10) slot into.
 * Target queries: "csca preparation", "csca study guide", "csca
 * practice test", "how to study for csca".
 *
 * Static content. The 8-week plan expands the flagship's prep
 * section; per-subject tracks defer to the subject guides.
 */
export const cscaPrepGuide: LocalizedGuide = {
  en: {
    slug: 'csca-exam-preparation',
    eyebrow: 'GUIDE · CSCA PREP',
    title: 'How to Prepare for the CSCA — The 8-Week Study Plan, Mock Strategy, and Resource Stack',
    description:
      'A complete CSCA preparation system: the four prep principles, the week-by-week 8-week plan across all your subjects, how to assemble full mocks from aligned materials, the retake playbook, and the resource stack.',
    subtitle:
      'The CSCA is new, so past-paper supply is thin — preparation leans on four principles and a structured 8-week plan: map the syllabus, patch your weakest fundamentals first, build academic Chinese in parallel, and train the multiple-choice clock from day one (no calculator, ~75 seconds per question). This guide assembles the whole system: the weekly schedule, the mock-test assembly method, the score-improvement and retake playbook, and where to find materials.',
    stats: [
      { value: '8 weeks', label: 'The standard prep cycle' },
      { value: '4', label: 'Prep principles' },
      { value: '2', label: 'Full mocks minimum' },
      { value: '~75 sec', label: 'Per question — train it' },
    ],
    quickAnswer:
      'Prepare for the CSCA on an 8-week plan built on four principles: (1) map the syllabus from the official portal before studying anything, (2) patch your weakest fundamental subject first — Math is compulsory for everyone, (3) build academic Chinese reading in parallel throughout, since the Professional Chinese track tests domain vocabulary HSK never covered, and (4) train multiple-choice speed from day one — no calculator, about 75 seconds per question. Week 1 diagnoses, weeks 2–4 patch weak subjects, weeks 3–8 run the Chinese track in parallel, weeks 5–6 drill exam technique, week 7 runs a full timed mock, and week 8 handles logistics and rest. Two full mocks minimum, an error log for every miss, and no new content in the final 3 days.',
    keyTakeaways: [
      'Four principles: syllabus-first, weakest-subject-first, Chinese-in-parallel, clock-from-day-one',
      'No past-paper supply — prep materials are the official outline, China senior-high curriculum content, and aligned MCQ banks',
      'The 8-week plan: diagnose (1) → patch weak fundamentals (2–4) → Chinese track in parallel (3–8) → technique (5–6) → full mock (7) → logistics (8)',
      'Two full timed mocks minimum; every miss goes in an error log classified by cause: knowledge / arithmetic / misread / timing',
      'Speed is the universal filter: ~75 seconds per question on fundamentals, ~45 on the Chinese track — pace drills beat theory review',
      'Retake calculus: with 5 sessions a year, plan attempt 1 for retake room, and resit only weak subjects in the next session',
    ],
    sections: [
      {
        id: 'principles',
        h2: 'The four prep principles',
        intro:
          'Everything in the 8-week plan derives from four principles. Candidates who violate them study hard and still underperform.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Syllabus-first** — download the official subject outlines from the CSCA portal and map them against what you already know before buying or studying anything; prep effort follows the map, not habit',
              '**Weakest-first** — your lowest domain (usually the compulsory Math, sometimes a science) gets the early weeks; strong subjects only need maintenance and format training',
              '**Chinese-in-parallel** — the Professional Chinese track cannot be crammed in a fortnight; reading diet and glossary decks run from week 3 to week 8 while fundamentals get patched',
              '**Clock-from-day-one** — every practice set from the first week runs timed, no calculator, at exam pace; untimed practice builds knowledge but not the skill being tested',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The meta-principle: the CSCA tests fluent recognition under time pressure, not exploration. Every hour of prep should make some question faster, not just make some topic familiar.',
          },
        ],
      },
      {
        id: 'materials',
        h2: 'What to study from — the material stack',
        intro:
          'With no past-paper back catalog, materials come from four sources. Assemble them in week 1, before the plan starts.',
        blocks: [
          {
            type: 'table',
            caption: 'The material stack, by purpose',
            columns: ['Material', 'What it gives you', 'Where from'],
            rows: [
              ['Official syllabus outline', 'The authoritative topic scope per subject', 'CSCA official portal (per subject)'],
              ['Your own curriculum materials', 'Relearning weak domains — the content is universal', 'Your A-Level/IB/AP/high-school notes and textbooks'],
              ['China senior-high MCQ banks', 'The question style: speed, distractor patterns, Chinese stems', 'Standard exam-prep collections aligned to the senior-high curriculum'],
              ['Academic-register Chinese texts', 'The Professional Chinese track: textbook pages, science/business articles', 'First-year university materials, quality news features'],
              ['SICA prep pack', 'Term glossaries, MCQ sets, subject-combination review', 'Included with SICA application-support tiers'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Verify against the outline, always** — third-party "CSCA syllabus" pages often guess; the portal\'s outline outranks everything',
              '**One MCQ source is enough per subject** — style familiarity is the goal, not volume; switch sources only when a bank runs dry',
              '**Beware fake "past papers"** — sellers offering "real CSCA past papers" are selling fabrications; there is no released back catalog yet',
            ],
          },
        ],
      },
      {
        id: 'the-plan',
        h2: 'The 8-week plan, week by week',
        intro:
          'The standard cycle for a candidate with a solid high-school background and 10–15 hours per week. Compress to 4 weeks only by dropping breadth, never mocks.',
        blocks: [
          {
            type: 'table',
            caption: 'The 8-week schedule at a glance',
            columns: ['Week', 'Fundamentals track', 'Chinese track (parallel)'],
            rows: [
              ['1', 'Diagnostic sets per subject; score by domain; pick the 2 weakest', 'Baseline: read one academic page, list every unknown term'],
              ['2', 'Patch weak domain #1 — relearn + 30 timed MCQs', 'Switch reading diet; start connectives deck'],
              ['3', 'Patch weak domain #2 — same method', 'Domain glossary deck starts; timed passage sets begin'],
              ['4', 'Speed benchmarks: 30-of-48 in 30 min per fundamentals subject', '80-question-paced Chinese sets; claim/direction discipline'],
              ['5', 'Mixed timed sets; error log by cause', 'Full-paced Chinese sets; glossary convergence review'],
              ['6', 'Subject-specific technique polish (checks, flag-and-return)', 'Re-read all glossaried passages; second glossary pass'],
              ['7', 'FULL MOCK under exam conditions; review by cause', 'Chinese sections inside the same full mock'],
              ['8', 'Logistics week: ticket, passport, route; light review only', 'Freeze new vocabulary; rest'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Weekly hour budget** — roughly 6–8 hours fundamentals + 4–6 hours Chinese in weeks 2–6; week 1 and 7 are diagnostic/mock-heavy',
              '**The two-track structure is the point** — fundamentals get intensity, Chinese gets consistency; candidates who sequence them instead of paralleling them run out of calendar',
              '**4-week compression** — if registration caught you early: week 1 diagnose, week 2 patch the single weakest domain, week 3 mixed timed sets + Chinese sets, week 4 mock + logistics. Keep the mock; drop the second patch',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'One-plan-per-person rule: your plan is the 8-week skeleton with your diagnostic results filled in — not the table above read as universal. A candidate weak in Math and strong in HSK 5 Chinese runs a very different fill than the mirror image.',
          },
        ],
      },
      {
        id: 'mock-assembly',
        h2: 'Assembling a full mock',
        intro:
          'The full mock is the highest-value session of the entire plan — and since no official past papers exist, you assemble it.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Count your subjects** — from your registered combination (e.g., STEM Chinese + Math + Physics = 3 papers); the mock covers exactly what you registered, at full length each',
              '**Source aligned sets per subject** — 48-question MCQ sets for fundamentals, 80 for the Chinese track, matched to the syllabus outline you verified in week 1',
              '**Schedule like the real day** — same order, same per-paper durations, one sitting where possible; the fatigue profile is part of what you are training',
              '**Simulate the rules** — no calculator anywhere, answer-sheet-style bubbling, no pauses except the real schedule allows',
              '**Review the same day** — score per subject, then classify every miss: knowledge gap / arithmetic slip / misread / timing. The classified log drives week 8\'s light review and any retake plan',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'A mock without the same-day classified review is worth half. The error log — not the score — is the deliverable; it tells you whether your remaining days go to a knowledge patch or to clock discipline.',
          },
        ],
      },
      {
        id: 'score-improvement',
        h2: 'If your first attempt disappoints — the retake playbook',
        intro:
          'Five sessions a year make retaking a strategy, not a crisis. The playbook is about converting the error log into points, fast.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Diagnose the miss distribution** — mostly timing/arithmetic → 2–3 weeks of clock drills fix it; mostly knowledge → a targeted patch on the specific domains; mixed → prioritize whichever dominates the log',
              '**Resit only weak subjects** — the next session lets you re-register selectively; keep strong subjects\' scores and replace the weak ones',
              '**Mind the deadline math** — the retake must land before your earliest still-open application deadline; see the dates guide for the session lattice',
              '**One retake is a plan; three is a lifestyle** — if two attempts sit in the same score band, the binding constraint is usually method (clock habits, reading discipline), not knowledge — change the method before booking attempt three',
              '**Send the right report** — universities see what you submit; a clean retake report replaces a weak one for every deadline still open',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC scholarship applicants have the tightest retake calculus — the Jan–Apr window leaves room for at most one fallback sitting. Sit the earliest viable session and treat the retake as insurance, not the plan.',
          },
        ],
      },
      {
        id: 'resources',
        h2: 'The resource stack and where SICA fits',
        intro:
          'A final word on materials and support — including what SICA provides inside its application-support tiers.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Free and authoritative** — the official portal\'s syllabus outlines and session announcements; university admissions pages for combination requirements',
              '**General materials** — your own curriculum resources for relearning; senior-high-aligned MCQ banks for style; academic-register texts for the Chinese track',
              '**SICA prep pack** — the term glossaries (math, physics diagrams, STEM/humanities decks), aligned MCQ sets, subject-combination review, and calendar planning — included in application-support tiers',
              '**Counselor value** — the highest-leverage SICA input is not materials but sequencing: mapping your exam session, subject combination, application deadlines, and waiver questions into one plan that does not collide',
              '**What to avoid** — "guaranteed score" agents, fabricated past papers, and any third party asking for your portal credentials',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The plan in one sentence: verify the syllabus, patch your weakest fundamentals first, read academic Chinese every day from week 3, train the clock from day one, run two full mocks with classified error logs, and leave week 8 for logistics and rest.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How long should I prepare for the CSCA?',
        a: 'Eight weeks is the standard cycle for a candidate with a solid high-school background at 10–15 hours per week. Two to three months is comfortable; four weeks is the realistic compression floor (diagnose, patch the single weakest domain, timed sets, one full mock). Below that you are scheduling luck, not preparation.',
      },
      {
        q: 'Are there past papers for the CSCA?',
        a: 'Not yet — the exam is new and no official past-paper catalog has been released. Anyone selling "real CSCA past papers" is selling fabrications. Prepare from the official syllabus outlines, your own curriculum materials, and China senior-high-aligned MCQ banks instead.',
      },
      {
        q: 'What should I study first?',
        a: 'Diagnose, then patch your weakest fundamental subject — usually Mathematics, which is compulsory for everyone. The Chinese track runs in parallel from week 3 because it cannot be crammed. Strong subjects need only format training and speed work.',
      },
      {
        q: 'How many mock tests do I need?',
        a: 'Two full timed mocks minimum, assembled from aligned MCQ sets at full length for your registered subjects, under exam rules (no calculator, real schedule). Each mock needs same-day classified review — every miss logged as knowledge, arithmetic, misread, or timing.',
      },
      {
        q: 'How do I improve my score between attempts?',
        a: 'Classify your error log first. If misses are dominated by timing and arithmetic, 2–3 weeks of clock drills fix it; if by knowledge, patch the specific weak domains. Resit only the weak subjects in the next session — five sessions a year make this routine rather than drastic.',
      },
      {
        q: 'Can I prepare while also preparing HSK/IELTS?',
        a: 'Yes, with sequencing: CSCA fundamentals and IELTS/TOEFL train different skills and can run concurrently, but HSK and the CSCA Chinese track overlap heavily — if you need both, the CSCA academic-Chinese preparation covers most of the HSK higher-level work and can serve as the shared track.',
      },
    ],
    howToSteps: [
      {
        name: 'Verify the syllabus before anything else',
        text: 'Download the official subject outlines from the CSCA portal and your program\'s required combination. Prep effort follows this map — every third-party syllabus claim gets checked against it.',
      },
      {
        name: 'Assemble the material stack in week 1',
        text: 'Your own curriculum notes (for relearning), one senior-high-aligned MCQ bank per subject, and academic-register Chinese texts. Verify each item against the outline; skip anything you cannot verify.',
      },
      {
        name: 'Run week-1 diagnostics per subject',
        text: 'Untimed mixed sets per subject, scored by domain. The two weakest domains (and your baseline reading speed for the Chinese track) become the plan\'s fill — this is what makes the plan yours.',
      },
      {
        name: 'Patch weak fundamentals while Chinese runs in parallel',
        text: 'Weeks 2–4: one weak domain per week with 30+ timed MCQs after relearning. From week 3, the daily Chinese reading + glossary decks run alongside without exception.',
      },
      {
        name: 'Drill the clock, then run two full mocks',
        text: 'Weeks 4–6 move everything to exam pace (75s fundamentals / 45s Chinese). Week 7: a full mock under real rules with same-day classified review; schedule a second mock if the calendar allows.',
      },
      {
        name: 'Close with logistics and rest',
        text: 'Week 8: admission ticket printed, passport ready, route planned, payment records archived. Light review of the error log only — no new content in the final 3 days.',
      },
    ],
    ctaTitle: 'Want this plan built around your calendar?',
    ctaSubtitle:
      'SICA counselors run your diagnostics, fill the 8-week skeleton with your results, supply the glossary and MCQ packs, and keep the exam plan aligned with your application deadlines. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, exemptions, and the CSC requirement.',
      },
      {
        href: '/csca-mathematics-guide',
        label: 'CSCA Mathematics — syllabus & prep',
        description: 'The compulsory subject\'s six-week track inside this plan.',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA exam dates & registration windows',
        description: 'Which session your 8-week plan should target — and the retake lattice.',
      },
    ],
  },
  zh: {
    slug: 'csca-exam-preparation',
    eyebrow: '指南 · CSCA 备考',
    title: 'CSCA 备考方法——八周学习计划、模考策略与资料栈',
    description:
      '完整的 CSCA 备考体系：四条备考原则、覆盖全部科目的逐周八周计划、如何用对齐材料拼装整卷模考、重考打法与资料栈。',
    subtitle:
      'CSCA 是新考试，真题存量少——备考依靠四条原则与结构化的八周计划：先梳理大纲、先补最弱基础科、并行提升学术中文、从第一天就练选择题时钟（无计算器、每题约 75 秒）。本指南把整个体系拼到一起：逐周日程、模考拼装方法、提分与重考打法、资料从哪里找。',
    stats: [
      { value: '8 周', label: '标准备考周期' },
      { value: '4 条', label: '备考原则' },
      { value: '2 套', label: '整卷模考下限' },
      { value: '约 75 秒', label: '每题——练到它' },
    ],
    quickAnswer:
      '按八周计划备考 CSCA，四条原则打底：(1) 学习任何内容前先从官方门户下载大纲梳理范围；(2) 先补最弱的基础科目——数学人人必考；(3) 全程并行提升学术中文阅读——专业中文考的是 HSK 从未覆盖的领域词汇；(4) 从第一天起按考试节奏练选择题——无计算器、每题约 75 秒。第 1 周诊断，第 2-4 周补弱科，第 3-8 周并行中文轨，第 5-6 周练考试技巧，第 7 周整卷限时模考，第 8 周后勤与休息。整卷模考至少两套，每个失分进错误日志，最后 3 天不碰新内容。',
    keyTakeaways: [
      '四原则：大纲先行、最弱优先、中文并行、时钟从第一天开始',
      '无真题存量——备考材料是官方大纲、中国高中课程内容与对齐的选择题题库',
      '八周计划：诊断（1）→ 补弱基础科（2-4）→ 中文轨并行（3-8）→ 技巧（5-6）→ 整卷模考（7）→ 后勤（8）',
      '整卷限时模考至少两套；每个失分按成因分类：知识/算术/读题/计时',
      '速度是通用筛选器：基础科每题约 75 秒、中文轨约 45 秒——节奏训练胜过理论复习',
      '重考算术：一年 5 场，首考要留重考空间，下场只重考弱科',
    ],
    sections: [
      {
        id: 'principles',
        h2: '四条备考原则',
        intro:
          '八周计划的一切都由四条原则推出。违反它们的考生很努力，仍然考不好。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**大纲先行**——从 CSCA 门户下载官方科目大纲，在购买或学习任何东西之前对照已知知识做映射；备考精力跟地图走，不跟习惯走',
              '**最弱优先**——你最弱的域（通常是必考数学，有时是一门理科）拿走前几周；强科目只需要维持与形式训练',
              '**中文并行**——专业中文轨无法两周突击；阅读食谱与术语卡组从第 3 周跑到第 8 周，与补弱科同时进行',
              '**时钟从第一天开始**——从第一周起每套练习都限时、无计算器、按考试节奏；不限时练习长知识，但长不出被考的那个技能',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '元原则：CSCA 考的是时间压力下的流利识别，不是探索。每一小时备考都应该让某道题变快，而不只是让某个话题变熟。',
          },
        ],
      },
      {
        id: 'materials',
        h2: '学什么——材料栈',
        intro:
          '没有真题存量，材料来自四个来源。第 1 周、计划开始前备齐。',
        blocks: [
          {
            type: 'table',
            caption: '材料栈，按用途',
            columns: ['材料', '给你什么', '从哪来'],
            rows: [
              ['官方大纲', '每科权威的考点范围', 'CSCA 官方门户（逐科目）'],
              ['你自己的课程材料', '重学弱域——内容是普世的', '你的 A-Level/IB/AP/高中笔记与教材'],
              ['中国高中对齐选择题库', '题型：速度、干扰项模式、中文题干', '对齐高中课程的标准备考题集'],
              ['学术语域中文文本', '专业中文轨：教科书页面、理科/商科文章', '大一教材、优质新闻特稿'],
              ['SICA 备考包', '术语表、选择题套题、科目组合复核', '包含在 SICA 申请支持档位中'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**永远以大纲为准**——第三方「CSCA 大纲」页面常靠猜；门户大纲高于一切',
              '**每科一个题库就够**——目标是风格熟悉，不是题量；题库刷干再换',
              '**警惕假「真题」**——卖「CSCA 真题」的都是在卖编造；目前不存在已发布的真题库',
            ],
          },
        ],
      },
      {
        id: 'the-plan',
        h2: '八周计划，逐周拆解',
        intro:
          '面向基础扎实、每周 10-15 小时的考生的标准周期。压缩到 4 周只能砍广度，不能砍模考。',
        blocks: [
          {
            type: 'table',
            caption: '八周日程一览',
            columns: ['周', '基础科轨', '中文轨（并行）'],
            rows: [
              ['1', '逐科诊断套题；按域计分；锁定最弱两个域', '基线：读一页学术文本，列出所有生词'],
              ['2', '补弱域 #1——重学 + 30 道限时选择题', '切换阅读食谱；启动连接词卡组'],
              ['3', '补弱域 #2——同一方法', '领域术语卡组启动；限时语篇套题开始'],
              ['4', '速度基准：各基础科 30 分钟 30/48 题', '80 题节奏中文套题；主张/方向纪律'],
              ['5', '混合限时套题；错误日志按成因', '整节奏中文套题；术语收敛复盘'],
              ['6', '科目专项技巧打磨（三道检查、标记回攻）', '重读所有记过术语的语篇；第二遍术语复习'],
              ['7', '考试条件整卷模考；按成因复盘', '中文部分并入同一套整卷'],
              ['8', '后勤周：准考证、护照、路线；仅轻量复习', '冻结新词汇；休息'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**每周小时预算**——第 2-6 周约为基础科 6-8 小时 + 中文 4-6 小时；第 1 与第 7 周偏诊断/模考',
              '**双轨结构就是要点**——基础科吃强度，中文吃连续性；把两者串行而不是并行的考生，日历不够用',
              '**4 周压缩版**——如果报名来得早：第 1 周诊断、第 2 周补最弱单域、第 3 周混合限时套题 + 中文套题、第 4 周模考 + 后勤。模考必须保留，砍掉的是第二次补弱',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '一人一计划法则：你的计划是填入你诊断结果的八周骨架——不是把上表当普适答案来读。数学弱、HSK 5 中文强的考生，填法与镜像情形完全不同。',
          },
        ],
      },
      {
        id: 'mock-assembly',
        h2: '拼装一套整卷模考',
        intro:
          '整卷模考是整个计划里价值最高的一次训练——既然没有官方真题，就自己拼。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**数清你的科目**——按报名组合（如理工中文 + 数学 + 物理 = 3 卷）；模考精确覆盖所报科目、每科全长度',
              '**逐科取对齐套题**——基础科 48 题选择题、中文轨 80 题，全部对齐第 1 周核验过的大纲',
              '**按真实考试日排程**——同顺序、同单科时长，尽量一口气考完；疲劳曲线本身就是训练对象',
              '**模拟规则**——全程无计算器、答题卡式涂卡、除真实日程允许外不暂停',
              '**当天复盘**——逐科计分，然后把每个失分分类：知识缺口/算术失误/读题错误/时间不足。分类日志驱动第 8 周的轻复习与任何重考计划',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '没有当天分类复盘的模考只值一半。错误日志——而不是分数——才是交付物；它告诉你剩下的日子该补给知识还是该练时钟。',
          },
        ],
      },
      {
        id: 'score-improvement',
        h2: '首考不理想——重考打法',
        intro:
          '一年五场让重考是策略而非危机。打法的核心是把错误日志快速换成分数。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**诊断失分分布**——集中在计时/算术 → 2-3 周时钟训练可修；集中在知识 → 针对性补特定域；混合 → 优先处理日志中占大头的一类',
              '**只重考弱科**——下一场允许选择性报名；强科成绩保留，弱科替换',
              '**算清截止日**——重考成绩必须落在你最早仍开放的申请截止前；场次格子见时间指南',
              '**重考一次是计划，三次是生活方式**——若两次尝试落在同一分数带，约束通常是方法（时钟习惯、阅读纪律）而非知识——订第三场之前先换方法',
              '**交对成绩单**——大学看你提交的那份；干净的重考成绩单可为所有仍开放的截止日替换弱分',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 奖学金申请者的重考算术最紧——1-4 月窗口最多留得下一次兜底场次。参加最早可行场次，把重考当保险，不当计划。',
          },
        ],
      },
      {
        id: 'resources',
        h2: '资料栈与 SICA 的位置',
        intro:
          '关于材料与支持的最后一节——包括 SICA 在申请支持档位中提供什么。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**免费且权威**——官方门户的大纲与场次公告；大学招生页的组合要求',
              '**通用材料**——自己学制的资源用于重学；高中对齐题库用于风格；学术语域文本用于中文轨',
              '**SICA 备考包**——术语表（数学、物理图形、理工/人文卡组）、对齐选择题套题、科目组合复核、日历规划——包含在申请支持档位中',
              '**顾问价值**——SICA 最大的杠杆不是材料而是排序：把你的考试场次、科目组合、申请截止、豁免问题映射进一个互不冲突的计划',
              '**要避开的**——「保分」中介、编造的真题、以及任何索要你门户凭据的第三方',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '一句话版本：核验大纲、先补最弱基础科、第 3 周起每天读学术中文、从第一天练时钟、跑两套带分类错误日志的整卷模考、第 8 周留给后勤与休息。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 要备考多久？',
        a: '基础扎实、每周 10-15 小时的考生，标准周期是八周。两到三个月从容；四周是现实压缩下限（诊断、补最弱单域、限时套题、一套整卷模考）。再短就不是备考，是碰运气。',
      },
      {
        q: 'CSCA 有真题吗？',
        a: '还没有——考试很新，官方没有发布真题库。任何卖「CSCA 真题」的都是在卖编造。用官方大纲、自己的课程材料与中国高中对齐的选择题题库备考。',
      },
      {
        q: '应该先学什么？',
        a: '先诊断，再补最弱的基础科目——通常是人人必考的数学。中文轨从第 3 周并行，因为它无法突击。强科目只需要形式训练与速度训练。',
      },
      {
        q: '需要几套模考？',
        a: '整卷限时模考至少两套：按所报科目全长度拼装、按考试规则执行（无计算器、真实日程）。每套模考都要当天分类复盘——每个失分记为知识、算术、读题或计时。',
      },
      {
        q: '两次考试之间怎么提分？',
        a: '先给错误日志分类。失分集中在计时与算术，2-3 周时钟训练可修；集中在知识，就补特定弱域。下一场只重考弱科——一年五场让这是常规操作而非孤注一掷。',
      },
      {
        q: '能同时备考 HSK/雅思吗？',
        a: '可以，要排好序：CSCA 基础科与雅思/托福训练不同技能，可并行；HSK 与 CSCA 中文轨重叠很大——若两者都要，CSCA 学术中文备考覆盖 HSK 高级别的多数内容，可作共用轨。',
      },
    ],
    howToSteps: [
      {
        name: '先核验大纲，再做任何事',
        text: '从 CSCA 门户下载官方科目大纲与项目的科目组合。备考精力跟这张地图走——每个第三方大纲说法都要对照核验。',
      },
      {
        name: '第 1 周备齐材料栈',
        text: '自己的课程笔记（重学用）、每科一本高中对齐题库、学术语域中文文本。逐项对照大纲核验；核验不了的直接跳过。',
      },
      {
        name: '第 1 周逐科诊断',
        text: '逐科不限时混合套题，按域计分。最弱的两个域（以及中文轨的基线阅读速度）就是计划的填空——这一步让计划属于你。',
      },
      {
        name: '补弱基础科，中文并行',
        text: '第 2-4 周：每周一个弱域，重学后 30+ 道限时选择题。从第 3 周起，每日中文阅读 + 术语卡组无例外并行。',
      },
      {
        name: '练时钟，然后跑两套整卷',
        text: '第 4-6 周把一切切到考试节奏（基础科 75 秒/中文 45 秒）。第 7 周：真实规则整卷模考 + 当天分类复盘；日历允许就排第二套。',
      },
      {
        name: '以后勤与休息收尾',
        text: '第 8 周：准考证已打印、护照就绪、路线已规划、支付凭证已归档。只轻量复习错误日志——最后 3 天不碰新内容。',
      },
    ],
    ctaTitle: '要把这套计划装进你的日历吗？',
    ctaSubtitle:
      'SICA 顾问为你跑诊断、把八周骨架填成你的计划、提供术语表与选择题资料包，并让考试计划与申请截止互不冲突。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用、豁免与 CSC 要求。',
      },
      {
        href: '/csca-mathematics-guide',
        label: 'CSCA 数学——大纲与备考',
        description: '必考科目在本计划中的六周轨。',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA 考试时间与报名窗口',
        description: '八周计划该瞄准哪一场——以及重考场次格子。',
      },
    ],
  },
};
