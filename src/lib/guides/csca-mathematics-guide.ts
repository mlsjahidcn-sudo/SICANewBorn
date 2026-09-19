import type { LocalizedGuide } from './types';

/**
 * "CSCA Mathematics — syllabus & prep" — Batch 2, article #6 of the
 * 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca math", "csca mathematics syllabus", "csca
 * math practice".
 *
 * Static content. Topic coverage is framed against the Chinese
 * senior-high-school mathematics curriculum domain (the basis for
 * China's standardized exams); unit-level specifics defer to the
 * official outline on the portal. No invented past papers.
 */
export const cscaMathGuide: LocalizedGuide = {
  en: {
    slug: 'csca-mathematics-guide',
    eyebrow: 'GUIDE · CSCA MATH',
    title: 'CSCA Mathematics — Syllabus, Question Format, and Prep Strategy for the Compulsory Subject',
    description:
      'Mathematics is the one CSCA subject every candidate must sit: 48 multiple-choice questions in ~60 minutes, no calculator. Topic map vs A-Level/IB/AP, no-calculator technique, and the 75-seconds-per-question drill system.',
    subtitle:
      'Mathematics is the only CSCA subject that is compulsory for every candidate — regardless of major or teaching language. The paper is 48 multiple-choice questions in about 60 minutes with no calculator, drawing from the Chinese senior-high mathematics curriculum. For A-Level/IB/AP students most content overlaps, but notation, question style, and speed demands differ enough that unprepared candidates lose points to the clock, not to the math.',
    stats: [
      { value: '48', label: 'Multiple-choice questions' },
      { value: '~60 min', label: 'Per paper' },
      { value: '~75 sec', label: 'Per question' },
      { value: 'No', label: 'Calculators — everyone' },
    ],
    quickAnswer:
      'CSCA Mathematics is the compulsory fundamental subject every international bachelor\'s candidate sits: 48 multiple-choice questions in about 60 minutes, scored out of 100, with calculators banned. The content draws from the Chinese senior-high mathematics curriculum — functions, trigonometry, sequences, vectors, complex numbers, solid and analytic geometry, probability and statistics, and basic derivatives. Students with A-Level, IB, or AP backgrounds have usually met all of the content before; what costs points is the format: roughly 75 seconds per question, Chinese notation on paper stems, and no calculator anywhere. Drill speed and notation recognition, not new theory.',
    keyTakeaways: [
      'Math is compulsory for all CSCA candidates — no major or program exempts it',
      '48 MCQs in ~60 minutes ≈ 75 seconds per question; speed, not difficulty, is the filter',
      'Calculators are banned — mental arithmetic and exact-value recall are tested skills',
      'Content sits inside the Chinese senior-high curriculum: functions, trig, sequences, vectors, complex numbers, geometry, probability/statistics, basic derivatives',
      'A-Level/IB/AP students: content overlaps ~80-90%, but notation and MCQ style need a translation pass',
      'Confirm unit-level coverage against the official outline on the CSCA portal — this guide maps the domain, not the official unit list',
    ],
    sections: [
      {
        id: 'why-compulsory',
        h2: 'Why Mathematics is compulsory for everyone',
        intro:
          'Every CSCA candidate sits Mathematics — business, arts, medicine, engineering, everyone. There is no published subject-level opt-out.',
        blocks: [
          {
            type: 'p',
            text: 'The design logic mirrors China\'s domestic gaokao, where mathematics is a universal paper: it is the cheapest standardized signal of academic reasoning across applicants from thousands of different school systems. Universities cannot compare transcripts from Lagos, Lima, and London — but they can compare a 100-point multiple-choice math score. That is why the subject is compulsory even for Humanities-track applicants and even for candidates whose entire degree is essay-based.',
          },
          {
            type: 'ul',
            items: [
              '**No opt-out** — the mandate applies to every candidate; exemptions cover the Professional Chinese subject or the whole exam for language-program applicants, never Mathematics',
              '**Level expectation** — senior-high mathematics, not university calculus; candidates with solid high-school math are tested on fluency more than on new content',
              '**Weight in admission** — because everyone sits it, Math is the one score every university can line up across its whole applicant pool; a weak Math score is visible everywhere you apply',
            ],
          },
        ],
      },
      {
        id: 'topic-map',
        h2: 'Topic map — what the paper draws from',
        intro:
          'The CSCA fundamental subjects draw from the Chinese senior-high-school curriculum domain. The standard curriculum spans the topics below — confirm unit-level scope against the official outline when it is published on the portal.',
        blocks: [
          {
            type: 'table',
            caption: 'Chinese senior-high math domain vs international curricula',
            columns: ['Domain', 'Typical content', 'A-Level/IB/AP overlap'],
            rows: [
              ['Functions', 'Quadratics, exponential & logarithmic, function transformations', 'Near-total — appears in every curriculum'],
              ['Trigonometry', 'Identities, sine/cosine rules, trig equations', 'Near-total — notation differs'],
              ['Sequences', 'Arithmetic & geometric sequences, series sums', 'Common (IB AA, A-Level); lighter in AP Precalc'],
              ['Vectors', '2D vectors, dot product applications', 'High overlap; China emphasizes coordinate methods'],
              ['Complex numbers', 'Arithmetic, modulus, polar form', 'IB HL & A-Level Further; lighter elsewhere'],
              ['Solid geometry', 'Lines & planes in space, volume, angles between lines/planes', 'Less emphasized in AP; present in IB/A-Level'],
              ['Analytic geometry', 'Lines, circles, conic sections (ellipse, parabola, hyperbola)', 'China goes deeper on conics than most curricula'],
              ['Probability & statistics', 'Counting, classical probability, sampling, basic distributions', 'High overlap; AP Stats goes wider, China goes more computational'],
              ['Basic derivatives', 'Polynomial/exponential derivatives, tangents, extrema', 'AP Calc/IB HL overlap; A-Level P-paper overlap'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The two areas that most often surprise Western-curricula students: conic sections (China drills ellipse/parabola/hyperbola harder than A-Level or AP) and computational probability (less modeling, more fast counting).',
          },
        ],
      },
      {
        id: 'no-calculator',
        h2: 'No calculator — the skill nobody practiced',
        intro:
          'Every question is answerable without a calculator — the paper is designed that way — but "answerable" and "fast" are different skills.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Exact values are assumed** — sin/cos/tan of standard angles, log values of powers, square roots of common surds: recall, don\'t derive',
              '**Fraction arithmetic is the hidden tax** — Chinese exams keep answers in exact fraction/radical form; decimal approximations slow you down and miss MCQ options',
              '**Estimation to eliminate** — bounding an answer\'s magnitude kills 2–3 wrong options instantly; practice order-of-magnitude checks per question',
              '**Mental multiplication tables to 20×20 and squares to 25²** — boring, and worth seconds on every arithmetic-heavy question',
              '**Work in the question\'s units** — no-calculator papers hide clean numbers inside messy appearances; if your working turns ugly, you have almost certainly taken a wrong turn, not a hard path',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'A-Level and IB students: your strongest habit — reach for the calculator — is exactly the reflex the CSCA punishes. From your first practice set, the calculator stays in the bag. Full stop.',
          },
        ],
      },
      {
        id: 'timing-system',
        h2: 'The 75-seconds-per-question system',
        intro:
          'Forty-eight questions in sixty minutes leaves about 75 seconds each — including reading the stem. Speed is a trained system, not a personality trait.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Three-pass pacing** — pass 1 (~35 min): answer everything answerable in ≤60s, mark the rest; pass 2 (~20 min): return to marked questions; pass 3 (~5 min): guess remaining with elimination + bubble discipline',
              '**Read the question line first** — for geometry and word problems, read what is asked BEFORE the setup; MCQ stems bury the ask in the last line',
              '**Answer-first sanity** — MCQs include the answer; plug options back in when a direct path is slow (back-solving is a legitimate 20-second strategy, not a hack)',
              '**Flag-and-move discipline** — one question stuck >90 seconds in pass 1 costs you two easy ones later; the mark button is your best friend',
              '**Bubble in batches** — fill answers every 8–10 questions, not one-by-one and not only at the end',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Benchmark to train for: by week 4 of prep you should clear 30 of 48 questions in 30 minutes on a mixed set. If you can\'t, your problem is speed hygiene, not knowledge — drill the clock, not the theory.',
          },
        ],
      },
      {
        id: 'notation-bridge',
        h2: 'The notation bridge for non-China-educated candidates',
        intro:
          'The math is universal; the handwriting on the page is not. A short notation pass converts your existing knowledge into CSCA-readable form.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Stems may mix Chinese labels with universal symbols** — the equation is universal, but scenario words (set 集, equation 方程, maximum 最大值) appear as Chinese terms; the STEM Chinese track and a term glossary cover this overlap',
              '**Function notation matches international norms** — f(x), domain, range: no surprises; sequence notation and combinatorial symbols (排列/组合 for permutations/combinations) are the terms to memorize',
              '**Geometry figures are labeled in Chinese** — 点 (point), 线 (line), 面 (plane), 圆 (circle) appear on diagrams; learn the 20 highest-frequency geometry characters',
              '**Answer options are numeric or symbolic** — options themselves rarely need translation, which is why MCQ is friendlier to international candidates than free-response would be',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Build a one-page glossary of the ~60 highest-frequency Chinese math terms and review it daily for two weeks — it removes most of the reading friction in one cheap habit. SICA\'s prep pack includes the current list.',
          },
        ],
      },
      {
        id: 'prep-framework',
        h2: 'A six-week Mathematics prep framework',
        intro:
          'Slotted inside the flagship 8-week plan, the Math track is six weeks: diagnose, patch, drill, mock.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Week 1 — diagnose against the domain map** — sit a 48-question mixed set untimed; score by domain. Your two weakest domains become the spine of weeks 2–4.',
              '**Weeks 2–3 — patch the weak domains** — one domain per week: relearn from your own curriculum\'s materials (the math is the same), then immediately drill 30+ MCQs on that domain, timed, no calculator.',
              '**Week 4 — speed benchmark** — mixed sets under exam timing; hit the 30-in-30 benchmark and log every question that took >90 seconds by cause (knowledge gap vs arithmetic vs misread).',
              '**Week 5 — no-calculator fluency** — every practice set with the calculator in the bag; add 10 minutes of mental-arithmetic drills daily (tables, exact trig values, fraction ops).',
              '**Week 6 — full mocks + error log review** — two full timed mocks; review the error log and re-drill only the recurring cause categories. Stop new content 3 days out.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Score heuristic from the flagship guide: competitive Math scores at selective universities sit in the 80+ band. The gap from 65 to 80 is almost never new theory — it is timing, arithmetic, and notation, which is exactly what weeks 4–6 fix.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is CSCA Mathematics required for every student?',
        a: 'Yes — Mathematics is compulsory for every CSCA candidate regardless of major, program language, or degree type. Exemptions affect the Professional Chinese subject or the whole exam for Chinese-language program applicants; Mathematics is never waived.',
      },
      {
        q: 'What level is the math — high school or university?',
        a: 'Senior-high level: functions, trigonometry, sequences, vectors, complex numbers, solid and analytic geometry, probability and statistics, and basic derivatives. It is fluency-testing, not theory- pushing — the difficulty is speed and precision, not new content.',
      },
      {
        q: 'Is the CSCA math harder than A-Level or AP?',
        a: 'It is different, not harder. Content overlaps 80–90% with A-Level/IB/AP foundation levels, but China\'s curriculum goes deeper on conic sections and computational probability, and the exam is strictly timed multiple choice with no calculator — which punishes calculator-dependent habits.',
      },
      {
        q: 'Can I use a calculator on the CSCA?',
        a: 'No — calculators are banned in all subjects, including Mathematics, Physics, and Chemistry. The paper is designed to be answerable with exact values and clean numbers, so prep must include mental-arithmetic and fraction-fluency drills.',
      },
      {
        q: 'Are the math questions in Chinese?',
        a: 'Stems mix universal mathematical notation with Chinese scenario terms, and diagrams carry Chinese labels (点/线/面/圆). Answer options are numeric or symbolic. A ~60-term glossary of high-frequency Chinese math vocabulary removes most of the reading friction.',
      },
      {
        q: 'How should I prepare if I only have one month?',
        a: 'Compress to the diagnosis-and-speed core: week 1 diagnose with a timed set and pick your two weakest domains; week 2 drill those domains MCQ-style without a calculator; week 3 mixed timed sets to the 30-in-30 benchmark; week 4 two full mocks plus your error log. Skip new theory entirely.',
      },
    ],
    howToSteps: [
      {
        name: 'Sit a diagnostic set untimed',
        text: 'Take a 48-question mixed MCQ set without time pressure and score it by domain (functions, trig, geometry, probability, derivatives). The two weakest domains define your prep spine — not the comfortable ones you like drilling.',
      },
      {
        name: 'Patch your two weakest domains',
        text: 'One domain per week for two weeks: relearn from your own curriculum\'s textbooks (the content is universal), then immediately convert it to CSCA style with 30+ timed MCQs per domain, calculator in the bag.',
      },
      {
        name: 'Build the notation glossary habit',
        text: 'Compile or obtain the ~60-term Chinese math glossary (sets, equations, maximum/minimum, permutations, geometry labels) and review it daily. Pair it with STEM Chinese reading so the vocabulary reinforces itself.',
      },
      {
        name: 'Train the three-pass clock',
        text: 'Every practice set runs the 3-pass system: ≤60s questions first, marked questions second, elimination guesses last. Track your 30-in-30 benchmark weekly; the number is your readiness metric.',
      },
      {
        name: 'Go cold-turkey on the calculator',
        text: 'From the first practice set, calculators stay away. Add daily 10-minute mental-arithmetic blocks — exact trig values, squares, fraction operations — until clean-number confidence returns.',
      },
      {
        name: 'Close with two full mocks and an error log',
        text: 'Two full timed mocks in the final fortnight. Log every miss by cause — knowledge, arithmetic, misread, timing — and re-drill only the recurring causes. No new content in the last 3 days.',
      },
    ],
    ctaTitle: 'Building your CSCA Math prep plan?',
    ctaSubtitle:
      'SICA counselors review your curriculum background against the CSCA domain map, set your weekly benchmarks, and supply the term glossary and MCQ practice packs. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, exemptions, and the CSC requirement.',
      },
      {
        href: '/csca-physics-guide',
        label: 'CSCA Physics — syllabus & prep',
        description: 'The other science fundamental: mechanics to modern physics in 48 MCQs.',
      },
      {
        href: '/csca-exam-preparation',
        label: 'The 8-week CSCA study plan',
        description: 'How the Math track slots into the full prep calendar across all your subjects.',
      },
    ],
  },
  zh: {
    slug: 'csca-mathematics-guide',
    eyebrow: '指南 · CSCA 数学',
    title: 'CSCA 数学——必考科目的大纲范围、题型与备考策略',
    description:
      '数学是每位考生必考的 CSCA 科目：约 60 分钟 48 道选择题、禁用计算器。知识域对照 A-Level/IB/AP、无计算器技巧与「每题 75 秒」训练体系。',
    subtitle:
      '数学是 CSCA 唯一人人必考的科目——无论专业或授课语言。试卷为约 60 分钟 48 道选择题、满分 100、全程禁用计算器，内容出自中国高中数学课程域。A-Level/IB/AP 学生八至九成内容见过，但记号、题型与速度要求差异足以让未训练者输给时钟而不是输给数学。',
    stats: [
      { value: '48', label: '道选择题' },
      { value: '约 60 分钟', label: '单科时长' },
      { value: '约 75 秒', label: '每题均摊' },
      { value: '禁止', label: '计算器——人人如此' },
    ],
    quickAnswer:
      'CSCA 数学是每位国际本科考生必考的基础科目：约 60 分钟 48 道选择题、满分 100、禁用计算器。内容出自中国高中数学课程域——函数、三角、数列、向量、复数、立体与解析几何、概率统计、导数初步。A-Level/IB/AP 背景的考生绝大多数内容都学过；丢分的是形式：每题约 75 秒、卷面中文术语、全程无计算器。要练的是速度与符号识别，不是新理论。',
    keyTakeaways: [
      '数学对全体 CSCA 考生必考——任何专业或项目都不能豁免',
      '约 60 分钟 48 道选择题 ≈ 每题 75 秒；筛选你的是速度不是难度',
      '禁用计算器——心算与精确值记忆是被直接考查的技能',
      '内容位于中国高中课程域：函数、三角、数列、向量、复数、几何、概率统计、导数初步',
      'A-Level/IB/AP 考生：内容重合约八至九成，但记号与选择题风格需要一次「翻译」训练',
      '单元级覆盖范围以 CSCA 门户公布的官方大纲为准——本指南描绘的是知识域而非官方单元清单',
    ],
    sections: [
      {
        id: 'why-compulsory',
        h2: '为什么数学人人必考',
        intro:
          '每位 CSCA 考生都考数学——商科、文科、医学、工科，无一例外。没有公布的科目级豁免。',
        blocks: [
          {
            type: 'p',
            text: '设计逻辑与中国国内高考一致——数学是全民卷：它是跨数千种不同学制比较学术推理能力最廉价的标准化信号。大学无法直接比较拉各斯、利马与伦敦的成绩单——但可以比较一份百分制选择题数学成绩。这就是它对人文轨申请者、乃至全部课程皆为论文型的申请者同样必考的原因。',
          },
          {
            type: 'ul',
            items: [
              '**无豁免**——强制令覆盖每位考生；豁免只涉及专业中文科目或语言类项目申请者的整体豁免，从不及于数学',
              '**难度定位**——高中数学，不是大学微积分；基础扎实的考生考的是熟练度而非新内容',
              '**录取权重**——因为人人都考，数学是大学能在全部申请者间对齐的唯一分数；数学弱分在你申请的每一所都可见',
            ],
          },
        ],
      },
      {
        id: 'topic-map',
        h2: '知识域地图——试卷从哪里出',
        intro:
          'CSCA 基础科目出自中国高中课程域。标准课程覆盖下表主题——单元级范围以门户公布的官方大纲为准。',
        blocks: [
          {
            type: 'table',
            caption: '中国高中数学知识域与国际课程对照',
            columns: ['知识域', '典型内容', '与 A-Level/IB/AP 重合度'],
            rows: [
              ['函数', '二次、指数与对数、函数变换', '几乎完全重合——各课程皆有'],
              ['三角', '恒等变换、正余弦定理、三角方程', '几乎完全重合——记号有差异'],
              ['数列', '等差与等比数列、求和', '常见（IB AA、A-Level）；AP 预备微积分较轻'],
              ['向量', '平面向量、数量积应用', '重合度高；中国偏坐标法'],
              ['复数', '四则运算、模、三角形式', 'IB HL 与 A-Level Further；其他课程较轻'],
              ['立体几何', '空间线面关系、体积、线面角', 'AP 较少强调；IB/A-Level 有'],
              ['解析几何', '直线、圆、圆锥曲线（椭圆、抛物线、双曲线）', '中国对圆锥曲线的深度超过多数课程'],
              ['概率统计', '计数、古典概型、抽样、基本分布', '重合度高；AP Stats 更广，中国更计算化'],
              ['导数初步', '多项式/指数求导、切线、极值', '与 AP 微积分/IB HL、A-Level P 卷重合'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '最常让西方学制考生意外两处：圆锥曲线（中国对椭圆/抛物线/双曲线的训练强度高于 A-Level 或 AP）与计算型概率（少建模、多快算）。',
          },
        ],
      },
      {
        id: 'no-calculator',
        h2: '无计算器——你没练过的那项技能',
        intro:
          '每道题都设计为可无计算器求解——但「能解」与「解得快」是两种技能。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**精确值默认已记**——特殊角三角函数值、幂的对数值、常见根式：靠记忆，不靠推导',
              '**分数运算是隐性税**——中国考试保留精确分数/根式形式；小数近似既慢又对不上选项',
              '**估算排除**——估计数量级可瞬间排除 2-3 个选项；每题都练量级校验',
              '**心算乘法表到 20×20、平方到 25²**——枯燥，但为每道算术重的题省下数秒',
              '**顺着题目的单位走**——无计算器试卷把整洁的数藏在脏外观里；若你的演算变丑，几乎肯定走错路而非走上难路',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'A-Level 与 IB 考生：你们最强的习惯——伸手拿计算器——恰恰是 CSCA 要惩罚的反射。从第一套练习起，计算器就收进包里。没有例外。',
          },
        ],
      },
      {
        id: 'timing-system',
        h2: '「每题 75 秒」训练体系',
        intro:
          '四十八题六十分钟，均摊约每题 75 秒——含读题时间。速度是训练出来的系统，不是天赋。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**三轮节奏**——第一轮（约 35 分钟）：60 秒内能解的全解，其余标记；第二轮（约 20 分钟）：回攻标记题；第三轮（约 5 分钟）：用排除法作答剩余题 + 涂卡纪律',
              '**先读问题行**——几何与文字题先读「求什么」再看题设；选择题的题干常把问题藏在最后一行',
              '**选项回代**——选择题自带答案；直接路径慢就把选项代回（回代是正当的 20 秒策略，不是作弊）',
              '**标记就走纪律**——第一轮在单题上卡超 90 秒，代价是后面两道容易题；标记键是你最好的朋友',
              '**分批涂卡**——每 8-10 题涂一次，不逐题涂，也不全留到最后',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '训练基准：备考第 4 周起，混合卷 30 分钟内应清完 48 题中的 30 题。做不到，问题在速度习惯而非知识——练钟，不练理论。',
          },
        ],
      },
      {
        id: 'notation-bridge',
        h2: '非中国学制考生的「记号桥」',
        intro:
          '数学是普世的，卷面不是。一次短暂的术语训练就能把已有知识转成 CSCA 可读形式。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**题干是中文术语 + 通用符号的混合**——方程是普世的，但场景词（集、方程、最大值）以中文出现；理工中文轨与术语表正好覆盖这层重叠',
              '**函数记号与国际一致**——f(x)、定义域、值域：无意外；需记忆的是数列与排列组合符号（排列/组合）',
              '**几何图用中文标注**——点、线、面、圆出现在图上；背下最高频的 20 个几何汉字',
              '**选项本身是数字或符号**——选项极少需要翻译，这也是选择题对国际考生比解答题友好的原因',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '把约 60 个高频中文数学术语做成一页纸术语表，连续两周每天过一遍——一个低成本习惯即可消掉大部分阅读摩擦。SICA 备考资料包含当前清单。',
          },
        ],
      },
      {
        id: 'prep-framework',
        h2: '数学六周备考框架',
        intro:
          '嵌入旗舰 8 周计划中的数学轨是六周：诊断、补弱、提速、模考。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1 周——对照知识域地图诊断**——不限时做一套 48 题混合卷，按知识域计分。最弱的两个知识域成为第 2-4 周的主线。',
              '**第 2-3 周——补最弱知识域**——每周一个：用自己学制的教材重学（数学内容是普世的），随即限时无计算器刷 30+ 道该域选择题。',
              '**第 4 周——速度基准**——混合卷按考试限时；达到「30 分钟 30 题」基准，并把每个超 90 秒的题按原因记录（知识/算术/读题）。',
              '**第 5 周——无计算器流利度**——所有练习卷全程收起计算器；每天加 10 分钟心算训练（乘法表、精确三角值、分数运算）。',
              '**第 6 周——整卷模考 + 错误日志复盘**——两套限时整卷；复盘错误日志，只针对重复出现的成因再训练。考前 3 天停止新内容。',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '沿用旗舰指南的分数经验值：选拔性大学的竞争性数学成绩在 80+ 区间。从 65 到 80 的差距几乎从来不是新理论——是计时、算术与记号，而这正是第 4-6 周要修的东西。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '每个考生都要考 CSCA 数学吗？',
        a: '是——数学对每位 CSCA 考生必考，不论专业、授课语言或学位类型。豁免只涉及专业中文科目或中文授课语言类项目的整体豁免；数学从不豁免。',
      },
      {
        q: '数学是高中难度还是大学难度？',
        a: '高中水平：函数、三角、数列、向量、复数、立体与解析几何、概率统计、导数初步。它考熟练度而非推新理论——难度在于速度与精度，不在新内容。',
      },
      {
        q: 'CSCA 数学比 A-Level 或 AP 难吗？',
        a: '是「不同」而非「更难」。内容与 A-Level/IB/AP 基础层重合八至九成，但中国课程在圆锥曲线与计算型概率上更深，且考试是严格限时的选择题、无计算器——会惩罚依赖计算器的习惯。',
      },
      {
        q: 'CSCA 可以用计算器吗？',
        a: '不能——所有科目禁用计算器，含数学、物理、化学。试卷按精确值与整洁数字设计，所以备考必须含心算与分数流利度训练。',
      },
      {
        q: '数学题是中文的吗？',
        a: '题干是通用数学记号与中文场景词的混合，几何图带中文标注（点/线/面/圆）。选项本身是数字或符号。一份约 60 词的高频中文数学术语表即可消掉大部分阅读摩擦。',
      },
      {
        q: '只剩一个月该怎么备？',
        a: '压缩到「诊断 + 提速」内核：第 1 周限时诊断、锁定两个最弱知识域；第 2 周以选择题方式无计算器强攻；第 3 周混合限时卷冲「30 分钟 30 题」；第 4 周两套整卷加错误日志。完全跳过新理论。',
      },
    ],
    howToSteps: [
      {
        name: '不限时做一套诊断卷',
        text: '不限时完成一套 48 题混合选择题，按知识域计分（函数、三角、几何、概率、导数）。最弱的两个知识域决定备考主线——而不是你喜欢的舒适区。',
      },
      {
        name: '补齐两个最弱知识域',
        text: '每周一个、连补两周：用自己学制教材重学（内容普世），随即转成 CSCA 风格——每域限时刷 30+ 道选择题，计算器收包。',
      },
      {
        name: '养成术语表习惯',
        text: '整理或获取约 60 词的中文数学术语表（集、方程、最值、排列组合、几何标注）并每日复习。配合理工中文阅读，让词汇相互强化。',
      },
      {
        name: '训练三轮时钟',
        text: '每套练习都执行三轮：先清 ≤60 秒题，再回攻标记题，最后排除法作答。每周记录「30 分钟 30 题」基准；这个数字就是你的就绪度指标。',
      },
      {
        name: '对计算器彻底戒断',
        text: '从第一套练习起就不用计算器。每天加 10 分钟心算——精确三角值、平方数、分数运算——直到整洁数字的信心回来。',
      },
      {
        name: '以两套整卷和错误日志收尾',
        text: '最后两周两套限时整卷。每个失分按成因记录——知识、算术、读题、计时——只针对重复成因再训练。最后 3 天不碰新内容。',
      },
    ],
    ctaTitle: '正在规划 CSCA 数学备考？',
    ctaSubtitle:
      'SICA 顾问把你的学制背景对照 CSCA 知识域地图、设定每周基准，并提供术语表与选择题训练包。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用、豁免与 CSC 要求。',
      },
      {
        href: '/csca-physics-guide',
        label: 'CSCA 物理——大纲与备考',
        description: '另一门基础理科：48 道选择题覆盖力学到近代物理。',
      },
      {
        href: '/csca-exam-preparation',
        label: 'CSCA 八周备考计划',
        description: '数学轨如何嵌入覆盖全部科目的完整备考日历。',
      },
    ],
  },
};
