import type { LocalizedGuide } from './types';

/**
 * "CSCA Physics — syllabus & prep" — Batch 2, article #7 of the
 * 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca physics", "csca physics syllabus", "csca
 * science subjects".
 *
 * Static content. Topic coverage framed against the Chinese
 * senior-high physics curriculum domain; unit-level scope defers to
 * the official outline on the portal.
 */
export const cscaPhysicsGuide: LocalizedGuide = {
  en: {
    slug: 'csca-physics-guide',
    eyebrow: 'GUIDE · CSCA PHYSICS',
    title: 'CSCA Physics — Syllabus Domain, MCQ Strategy, and Prep for Engineering & Science Applicants',
    description:
      'Who sits CSCA Physics, what the paper covers (mechanics to modern physics), how 48 no-calculator MCQs in 60 minutes reward dimensional analysis and limiting-case checks, and a five-week prep framework.',
    subtitle:
      'CSCA Physics is the fundamental subject for most engineering and physical-science programs: 48 multiple-choice questions in about 60 minutes, scored out of 100, no calculator. The content draws from the Chinese senior-high physics curriculum — mechanics, electromagnetism, thermal physics, optics, and modern physics. A-Level/IB/AP students know the physics; what the paper adds is speed, Chinese-labeled diagrams, and the absence of both a formula sheet and a calculator.',
    stats: [
      { value: '48', label: 'Multiple-choice questions' },
      { value: '~60 min', label: 'Per paper' },
      { value: '5', label: 'Content domains' },
      { value: 'No', label: 'Formula sheet or calculator' },
    ],
    quickAnswer:
      'CSCA Physics is the fundamental subject most engineering and physical-science applicants sit: 48 multiple-choice questions in about 60 minutes, scored out of 100, with no calculator and no formula sheet. The content draws from the Chinese senior-high physics curriculum — mechanics (kinematics, Newton\'s laws, energy, momentum, circular motion, waves), electromagnetism (electrostatics, circuits, magnetic fields, induction), thermal physics, optics, and modern physics. Compared with A-Level, IB, or AP, the theory overlaps heavily, but China\'s exams lean harder on multi-step numerical reasoning and diagram-based questions, and everything runs at roughly 75 seconds per question. Dimensional analysis, limiting-case checks, and memorized formulas are the survival kit.',
    keyTakeaways: [
      'Physics is required by most engineering/physical-science programs — confirm the exact combination on each program page',
      '48 MCQs in ~60 minutes (~75 s/question); no calculator, no formula sheet — formulas are memorized',
      'Five domains from the Chinese senior-high curriculum: mechanics, electromagnetism, thermal, optics, modern physics',
      'Theory overlaps heavily with A-Level/IB/AP; the differentiators are multi-step numerics, diagram reading, and speed',
      'China\'s exam style loves diagram-and-scenario questions — practice reading Chinese-labeled circuit and force diagrams',
      'No practical/lab paper — unlike A-Level practicals, everything is multiple choice',
    ],
    sections: [
      {
        id: 'who-sits',
        h2: 'Who sits CSCA Physics',
        intro:
          'Physics is not universal — it is required when your target program says so. The combination is set per program, not by the exam.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Typical programs requiring Physics** — engineering (all branches), computer science at many universities, physics and materials science, architecture at some schools',
              '**Typical combinations** — STEM Chinese + Math + Physics is the standard engineering combo; medicine usually pairs Math + Chemistry instead (verify per program)',
              '**Check before registering** — the same university may require Physics for mechanical engineering but not for software engineering; the program page and its admissions office are authoritative',
              '**With the Math track** — Physics candidates sit Math (compulsory for everyone) plus Physics; add Chemistry only if a program demands it',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Rule of thumb for planning: if you are applying to anything with 「工程」 (engineering) in the name, register for Physics. If your list mixes engineering and business programs, pick the session where you can sit the union of required subjects.',
          },
        ],
      },
      {
        id: 'content-domains',
        h2: 'The five content domains',
        intro:
          'The paper draws from the Chinese senior-high physics curriculum domain, which spans five blocks — confirm unit-level scope against the official outline on the portal.',
        blocks: [
          {
            type: 'table',
            caption: 'Chinese senior-high physics domain vs international curricula',
            columns: ['Domain', 'Typical content', 'Notes vs A-Level/IB/AP'],
            rows: [
              ['Mechanics', 'Kinematics, Newton\'s laws, circular motion, gravitation, work-energy, momentum, vibration & waves', 'The biggest block; China emphasizes multi-body and process-analysis problems'],
              ['Electromagnetism', 'Electrostatics, DC circuits, magnetic fields, electromagnetic induction, AC basics', 'China includes alternating current earlier than many curricula'],
              ['Thermal physics', 'Gas laws, kinetic theory, first law basics', 'Compact but computational'],
              ['Optics', 'Reflection, refraction, lenses; basic wave optics', 'Geometric optics carries most of the weight'],
              ['Modern physics', 'Photoelectric effect, atomic models, nuclear basics', 'Factual + conceptual; easiest domain to secure quickly'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Weakest-return check for Western-curricula students: AC circuits and vibration/waves tend to be under-covered by AP Physics 1 and lighter A-Level routes — patch those two first if your diagnostic flags them.',
          },
        ],
      },
      {
        id: 'formula-memory',
        h2: 'No formula sheet — the memorization list',
        intro:
          'Everything is closed-book: formulas, constants, and standard results live in your head. The list is finite and shorter than it feels.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Core constants** — g (as used in Chinese papers), electron charge/mass, speed of light, Planck\'s constant, standard values for air/water',
              '**Mechanics set** — kinematic equations, Newton\'s second law forms, centripetal relations, work-energy theorem, momentum-impulse, spring energy, wave equation',
              '**EM set** — Coulomb\'s law, field of a point charge, Ohm\'s law + resistor networks, power relations, F=BIL, induction/emf basics, transformer relation',
              '**Thermal/optic/modern set** — gas law relations, first law sign convention, snell\'s law, lens formula, photoelectric equation, mass-energy relation',
              '**Drill method** — a one-page formula sheet you write from memory daily until it reproduces perfectly three days in a row; then retire it',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Closed-book is a design assumption, not an obstacle: MCQ papers reuse a small formula vocabulary heavily. Memorize the ~40 core relations and you cover the overwhelming majority of numerical questions.',
          },
        ],
      },
      {
        id: 'mcq-strategy',
        h2: 'Physics MCQ strategy — the three checks',
        intro:
          'Physics MCQs reward elimination physics: most wrong options violate something checkable in seconds.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Dimensional analysis** — any option with the wrong units dies immediately; run this first on every numerical question',
              '**Limiting cases** — push a variable to zero/infinity and see which options collapse; this kills algebra-heavy questions without full solutions',
              '**Sanity extremes** — is the answer magnitude physically plausible (a car at 10⁸ m/s? a spring period of 10⁻⁶ s)? Chinese numerical distractors are often arithmetically close but physically absurd',
              '**Diagram first** — for circuit/force-diagram questions, spend 10 seconds annotating the figure before touching equations; mis-labeled directions cause most avoidable misses',
              '**Flag-and-return** — same 3-pass pacing as Math: fast clear, marked return, elimination guess; ~75 seconds/question average leaves no room for one 5-minute algebra slog',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'On multi-step numerical questions, estimate before you calculate: knowing the answer is "a bit more than 20" lets you pick among 18 / 21 / 210 / 200 without finishing the algebra.',
          },
        ],
      },
      {
        id: 'diagram-reading',
        h2: 'Reading Chinese-labeled diagrams',
        intro:
          'Circuit diagrams and force sketches are universal; their labels are not. Twenty characters cover most of the friction.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**High-frequency labels** — 力 (force), 速度 (velocity), 加速度 (acceleration), 质量 (mass), 电 (electricity), 电流 (current), 电压 (voltage), 电阻 (resistance), 磁场 (magnetic field), 光 (light)',
              '**Circuit components** — 电阻 resistor, 电源 power source, 开关 switch, 电流表 ammeter, 电压表 voltmeter — Chinese circuit symbols follow the same international conventions',
              '**Scenario terms** — 匀速 (uniform velocity), 静止 (at rest), 光滑 (frictionless), 轻绳 (light string) — these adjectives change the physics and appear constantly',
              '**Pair it with STEM Chinese prep** — the same vocabulary serves the STEM Chinese track, so diagram-label drills earn double credit',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Five minutes a day on the physics label list for two weeks makes diagrams read as fast as your home curriculum\'s. SICA\'s prep pack includes the current list.',
          },
        ],
      },
      {
        id: 'prep-framework',
        h2: 'A five-week Physics prep framework',
        intro:
          'Physics prep is diagnosis + formula memory + diagram fluency + mocks. Five focused weeks inside the flagship 8-week plan.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Week 1 — diagnose by domain** — untimed mixed set scored across the five domains; the two weakest become your patch list (bet: AC circuits or waves).',
              '**Week 2 — formula memory campaign** — write the one-page sheet from memory daily; patch weak domain #1 with 30+ timed MCQs.',
              '**Week 3 — patch weak domain #2 + diagram drills** — continue the memory routine; add daily 5-minute Chinese-label diagram annotation practice.',
              '**Week 4 — speed & the three checks** — mixed timed sets forcing dimensional-analysis-first and limiting-case habits; hit 30-of-48 in 30 minutes on mixed sets.',
              '**Week 5 — two full mocks + error log** — review misses by cause; re-drill recurring causes; no new content in the last 3 days.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Physics rewards prep efficiency: it has the most "free" marks of the science subjects for candidates who already studied it at A-Level/IB/AP — the gap is format, not theory.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do I need CSCA Physics for engineering programs?',
        a: 'Almost always yes — engineering programs typically require the STEM Chinese track + Mathematics + Physics combination, but the exact combination is set per program. Check each target program\'s page and confirm with its admissions office before registering.',
      },
      {
        q: 'What topics does CSCA Physics cover?',
        a: 'It draws from the Chinese senior-high physics curriculum: mechanics (the biggest block), electromagnetism including AC basics, thermal physics, optics, and modern physics. Confirm unit-level scope against the official outline on the CSCA portal.',
      },
      {
        q: 'Is there a formula sheet or a lab/practical paper?',
        a: 'No formula sheet — formulas and constants are memorized. And there is no practical paper: the CSCA is multiple choice only, so unlike A-Level practicals there is no lab component.',
      },
      {
        q: 'How hard is CSCA Physics compared to A-Level/IB/AP?',
        a: 'The theory overlaps heavily with senior-level A-Level/IB/AP content. The differentiators: multi-step numerical questions at ~75 seconds each, Chinese-labeled diagrams, and closed-book formula recall. AP Physics 1 students typically need to patch AC circuits and waves.',
      },
      {
        q: 'Do I sit both Physics and Chemistry?',
        a: 'Only if a program requires both (some do — e.g., certain chemical/materials programs). The common patterns: engineering = Physics; medicine/pharmacy = Chemistry; some programs accept either. Remember the fee band: ¥700 total covers 2+ subjects, so adding a subject costs little.',
      },
      {
        q: 'Should I take Physics in English-medium thinking?',
        a: 'The question stems are Chinese with universal symbols and diagrams. Since you will sit STEM Chinese or read Chinese-labeled diagrams anyway, studying physics content in Chinese-language materials kills two birds — language and physics — in one prep block.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm Physics is required by your program list',
        text: 'Audit each target program page for its required CSCA combination. If any program requires Physics, you sit Physics — plan it into the session where your subject union fits.',
      },
      {
        name: 'Diagnose across the five domains',
        text: 'Sit an untimed mixed set and score by domain (mechanics, EM, thermal, optics, modern). The two weakest domains get your patch weeks; expect AC circuits or waves if you come from AP Physics 1.',
      },
      {
        name: 'Run the formula-memory campaign',
        text: 'Write the one-page formula sheet from memory every day until it reproduces three days running: constants, mechanics, EM, thermal/optics/modern sets. Retire the written sheet once perfect.',
      },
      {
        name: 'Drill Chinese-label diagrams',
        text: 'Five minutes daily annotating circuit and force diagrams with the 20 high-frequency labels (力/电流/电阻/磁场…). The symbols are international; the words are the barrier.',
      },
      {
        name: 'Institutionalize the three checks',
        text: 'Every numerical question: units first, limiting case second, magnitude sanity third — before any algebra. Practice until these run in under 10 seconds combined.',
      },
      {
        name: 'Close with two mocks and an error log',
        text: 'Two full timed mocks in the final fortnight; log misses by cause and re-drill recurring ones. Same closing discipline as the Math track — no new content in the last 3 days.',
      },
    ],
    ctaTitle: 'Planning your Physics sitting?',
    ctaSubtitle:
      'SICA counselors confirm the subject combinations across your target programs, set your five-week Physics plan, and supply the formula list and diagram-label packs. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-mathematics-guide',
        label: 'CSCA Mathematics — syllabus & prep',
        description: 'The compulsory companion: 48 MCQs, no calculator, the 75-seconds system.',
      },
      {
        href: '/csca-stem-chinese-guide',
        label: 'CSCA Professional Chinese — STEM track',
        description: 'The Chinese-language track engineering applicants usually pair with Physics.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, exemptions, and the CSC requirement.',
      },
    ],
  },
  zh: {
    slug: 'csca-physics-guide',
    eyebrow: '指南 · CSCA 物理',
    title: 'CSCA 物理——知识域、选择题策略与理工科申请者备考方案',
    description:
      '谁要考 CSCA 物理、试卷覆盖什么（力学到近代物理）、60 分钟 48 道无计算器选择题为何奖励量纲分析与极限检验，以及五周备考框架。',
    subtitle:
      'CSCA 物理是多数工科与物理科学项目要求的基础科目：约 60 分钟 48 道选择题、满分 100、无计算器、无公式表。内容出自中国高中物理课程域——力学、电磁学、热学、光学、近代物理。与 A-Level/IB/AP 相比理论重合度高，但中国考试更多考多步数值推理与图形题，且全程约每题 75 秒。量纲分析、极限检验与公式记忆是生存包。',
    stats: [
      { value: '48', label: '道选择题' },
      { value: '约 60 分钟', label: '单科时长' },
      { value: '5', label: '个知识域' },
      { value: '没有', label: '公式表或计算器' },
    ],
    quickAnswer:
      'CSCA 物理是多数工科与物理科学申请者要考的基础科目：约 60 分钟 48 道选择题、满分 100、无计算器、无公式表。内容出自中国高中物理课程域——力学（运动学、牛顿定律、能量、动量、圆周运动、波）、电磁学（静电、电路、磁场、电磁感应）、热学、光学、近代物理。与 A-Level、IB、AP 相比理论高度重合，但中国考试更偏多步数值与图形题，且约每题 75 秒。量纲分析、极限检验、背熟公式是生存包。',
    keyTakeaways: [
      '多数工科/物理科学项目要求物理——具体组合以各项目页为准',
      '约 60 分钟 48 道选择题（每题约 75 秒）；无计算器、无公式表——公式靠背',
      '中国高中课程域的五大块：力学、电磁、热学、光学、近代物理',
      '理论与 A-Level/IB/AP 高度重合；差异在多步数值、读图与速度',
      '中国考风偏爱图形与情景题——练读中文标注的电路图与受力图',
      '无实验卷——不同于 A-Level 实操，全部为选择题',
    ],
    sections: [
      {
        id: 'who-sits',
        h2: '谁要考 CSCA 物理',
        intro:
          '物理不是人人必考——目标项目要求才考。组合由项目设定，而非考试本身。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**典型要求物理的项目**——各分支工科、多数大学的计算机、物理与材料科学、部分院校的建筑',
              '**典型组合**——理工中文 + 数学 + 物理是标准工科组合；医学通常配数学 + 化学（逐项目核验）',
              '**报名前核对**——同一大学可能机械工程要物理而软件工程不要；项目页与其招生办是权威',
              '**与数学轨的关系**——物理考生考数学（人人必考）加物理；仅当项目要求时再加化学',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '规划经验法则：申请任何带「工程」二字的项目，就报物理。若你的院校清单混有工科与商科，选择能一次覆盖科目并集的那场考试。',
          },
        ],
      },
      {
        id: 'content-domains',
        h2: '五大知识域',
        intro:
          '试卷出自中国高中物理课程域，覆盖五大块——单元级范围以门户公布的官方大纲为准。',
        blocks: [
          {
            type: 'table',
            caption: '中国高中物理知识域与国际课程对照',
            columns: ['知识域', '典型内容', '与 A-Level/IB/AP 差异'],
            rows: [
              ['力学', '运动学、牛顿定律、圆周运动、万有引力、功能关系、动量、振动与波', '占比最大；中国偏多体与过程分析题'],
              ['电磁学', '静电、直流电路、磁场、电磁感应、交流电基础', '中国比多数课程更早纳入交流电'],
              ['热学', '气体定律、分子动理论、热力学第一定律基础', '篇幅紧凑但重计算'],
              ['光学', '反射、折射、透镜；波动光学基础', '几何光学占大头'],
              ['近代物理', '光电效应、原子模型、原子核基础', '偏事实与概念；最容易快速拿稳的域'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '西方学制考生收益检查：交流电、振动与波常在 AP Physics 1 与较轻的 A-Level 路线中覆盖不足——若诊断命中，先补这两块。',
          },
        ],
      },
      {
        id: 'formula-memory',
        h2: '无公式表——记忆清单',
        intro:
          '全卷闭卷：公式、常数、标准结论都在脑子里。清单有限，也比感觉中短。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**核心常数**——g（按中国试卷取值）、电子电荷/质量、光速、普朗克常量、空气/水标准值',
              '**力学组**——运动学公式、牛顿第二定律各种形态、向心关系、动能定理、动量-冲量、弹簧能量、波动方程',
              '**电磁组**——库仑定律、点电荷场强、欧姆定律 + 电阻网络、功率关系、F=BIL、感应电动势基础、变压器关系',
              '**热光近代组**——气体定律关系、第一定律符号约定、折射定律、透镜公式、光电方程、质能关系',
              '**训练法**——一页纸公式表每天默写，直到连续三天全对为止；然后退役',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '闭卷是设计前提而非障碍：选择题试卷高频复用一小组公式。背熟约 40 条核心关系，就覆盖了绝大多数数值题。',
          },
        ],
      },
      {
        id: 'mcq-strategy',
        h2: '物理选择题策略——三道检查',
        intro:
          '物理选择题奖励排除法：多数错误选项违反某个几秒可查的东西。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**量纲分析**——单位不对的选项当场出局；每道数值题先做这一步',
              '**极限检验**——把变量推到零/无穷，看哪些选项崩塌；不解代数也能杀掉代数重的题',
              '**量级常识**——答案的量级物理上合理吗（汽车 10⁸ m/s？弹簧周期 10⁻⁶ s？）中国卷的数值干扰项常常算术接近而物理荒谬',
              '**先读图**——电路/受力题先花 10 秒在图上标注再动方程；方向标错是多数可避免失分的来源',
              '**标记回攻**——与数学相同的三轮节奏：快清、回攻、排除猜；均摊约 75 秒/题容不下五分钟的代数拉锯',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '多步数值题先估算再动笔：知道答案「比 20 稍大」，就能在 18 / 21 / 210 / 200 里直接选，不必写完代数。',
          },
        ],
      },
      {
        id: 'diagram-reading',
        h2: '读中文标注的图',
        intro:
          '电路图与受力图是普世的；标注不是。二十个字覆盖大部分摩擦。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**高频标注**——力、速度、加速度、质量、电、电流、电压、电阻、磁场、光',
              '**电路元件**——电阻、电源、开关、电流表、电压表——中国电路符号遵循同样的国际惯例',
              '**情景词**——匀速、静止、光滑、轻绳——这些形容词改变物理图景，出现频率极高',
              '**与理工中文并轨**——同一批词汇正好服务理工中文轨，图形标注训练一石二鸟',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '物理标注清单每天五分钟、连续两周，读图速度就能追上母课程。SICA 备考资料包含当前清单。',
          },
        ],
      },
      {
        id: 'prep-framework',
        h2: '物理五周备考框架',
        intro:
          '物理备考 = 诊断 + 公式记忆 + 读图流利度 + 模考。嵌入旗舰 8 周计划的五个专注周。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1 周——按知识域诊断**——不限时混合卷按五域计分；最弱两域进补弱清单（AP Physics 1 背景者常是交流电或波）。',
              '**第 2 周——公式记忆战役**——每天默写一页公式表；补弱域 #1，限时刷 30+ 道选择题。',
              '**第 3 周——补弱域 #2 + 读图训练**——记忆照常；每天加 5 分钟中文标注图形标注练习。',
              '**第 4 周——速度与三道检查**——混合限时卷强制「量纲优先、极限次之」；混合卷达到 48 题清 30 题/30 分钟。',
              '**第 5 周——两套整卷 + 错误日志**——按成因复盘；只对重复成因再训练；最后 3 天不碰新内容。',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '物理的备考性价比最高：对已学过 A-Level/IB/AP 的考生，它是理科中「白送分」最多的——差距在形式，不在理论。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '申工科要考 CSCA 物理吗？',
        a: '几乎必然——工科项目通常要求理工中文 + 数学 + 物理组合，但确切组合由项目自定。报名前逐项目核对页面并向招生办确认。',
      },
      {
        q: 'CSCA 物理考什么内容？',
        a: '出自中国高中物理课程域：力学（占比最大）、含交流电基础的电磁学、热学、光学、近代物理。单元级范围以 CSCA 门户官方大纲为准。',
      },
      {
        q: '有公式表或实验卷吗？',
        a: '没有公式表——公式与常数靠记忆。也没有实验卷：CSCA 全为选择题，不像 A-Level 有实操部分。',
      },
      {
        q: 'CSCA 物理与 A-Level/IB/AP 相比难吗？',
        a: '理论与 A-Level/IB/AP 高年级内容高度重合。差异在：每题约 75 秒的多步数值题、中文标注图形、闭卷公式记忆。AP Physics 1 考生通常需补交流电与波。',
      },
      {
        q: '物理化学都要考吗？',
        a: '仅当项目同时要求（部分如此——某些化工/材料项目）。常见模式：工科 = 物理；医学/药学 = 化学；部分项目二者任选其一。注意费用档：¥700 已覆盖同场两科及以上，加科几乎不加钱。',
      },
      {
        q: '该不该用英文资料备考物理？',
        a: '题干是中文 + 通用符号与图形。反正要考理工中文或读中文标注图形，直接用中文材料学物理内容——语言与物理一个备考块里同时解决。',
      },
    ],
    howToSteps: [
      {
        name: '确认院校清单是否要求物理',
        text: '逐项目页核查要求的 CSCA 组合。只要有一所要求物理，你就考物理——把它排进科目并集适配的那场考试。',
      },
      {
        name: '按五域诊断',
        text: '不限时做一套混合卷并按知识域计分（力学、电磁、热学、光学、近代）。最弱两域进补弱周；AP Physics 1 背景先查交流电与波。',
      },
      {
        name: '启动公式记忆战役',
        text: '每天默写一页公式表，直到连续三天全对：常数、力学、电磁、热光近代四组。全对后退役书面版。',
      },
      {
        name: '练中文标注读图',
        text: '每天 5 分钟给电路图与受力图标注 20 个高频词（力/电流/电阻/磁场……）。符号是国际的；词是门槛。',
      },
      {
        name: '把三道检查制度化',
        text: '每道数值题：先单位、再极限、再三量级常识——然后才动代数。练到三步合计 10 秒内完成。',
      },
      {
        name: '以两套整卷和错误日志收尾',
        text: '最后两周两套限时整卷；失分按成因记录并重复训练。与数学轨同一收尾纪律——最后 3 天不碰新内容。',
      },
    ],
    ctaTitle: '正在规划物理场次？',
    ctaSubtitle:
      'SICA 顾问核对目标项目组合、为你排定五周物理计划，并提供公式清单与图形标注资料包。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-mathematics-guide',
        label: 'CSCA 数学——大纲与备考',
        description: '必考的同伴科目：48 道选择题、无计算器、75 秒体系。',
      },
      {
        href: '/csca-stem-chinese-guide',
        label: 'CSCA 专业中文——理工轨',
        description: '工科申请者通常与物理搭配的中文轨。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用、豁免与 CSC 要求。',
      },
    ],
  },
};
