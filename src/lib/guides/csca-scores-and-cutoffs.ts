import type { LocalizedGuide } from './types';

/**
 * "CSCA scores explained — how universities set cutoffs" — Batch 3,
 * article #14 of the 20-article CSCA cluster
 * (docs/csca-content-plan.md).
 * Target queries: "csca passing score", "csca score report",
 * "csca score validity", "good csca score".
 *
 * Static content. Scoring mechanics (100/subject, no national pass
 * mark) from the verified baseline; tier benchmarks are labeled as
 * planning heuristics / market observations, never published
 * minimums.
 */
export const cscaScoresGuide: LocalizedGuide = {
  en: {
    slug: 'csca-scores-and-cutoffs',
    eyebrow: 'GUIDE · CSCA SCORES',
    title: 'CSCA Scores Explained — No National Pass Mark, University Cutoffs, and What Score You Should Target',
    description:
      'How CSCA scoring works: 100 points per subject, no national pass mark, each university sets its own cutoffs. Score-report mechanics, tier benchmarks (80+/70+/60s as planning heuristics), and how to pick a target score.',
    subtitle:
      'The CSCA has no pass mark and no national ranking — each subject is scored out of 100, results go to universities as a reference, and every university draws its own admission lines per program. That makes "what score do I need?" a question about your target schools, not about the exam. This guide explains the scoring mechanics, how universities use the results, the realistic benchmarks by university tier, and the mechanics of the score report itself.',
    stats: [
      { value: '0–100', label: 'Per subject, MCQ scored' },
      { value: '0', label: 'National pass marks — there are none' },
      { value: '80+ / 70+ / 60s', label: 'Planning bands by university tier' },
      { value: 'You', label: 'Who submits the report to universities' },
    ],
    quickAnswer:
      'Each CSCA subject is scored on a 0–100 scale from its multiple-choice questions. There is no national pass mark and no centralized ranking — results serve as a reference for universities, and each university sets its own admission cutoffs per program and intake. As planning heuristics (not published minimums): selective C9/985 universities typically admit applicants scoring 80+ in required subjects, mid-tier (211/top-300) programs commonly look for 70+, and regional universities may admit in the 60s. The score report is issued to you via the registration portal; you download it and attach it to each university application and, if applicable, your CSC scholarship file — universities do not receive scores automatically. Because cutoffs are unpublished and school-specific, the working method is: ask your target schools what last year\'s admitted applicants scored, then aim about 10 points above that.',
    keyTakeaways: [
      '0–100 per subject, scored from multiple choice — no partial credit mechanics to learn',
      'No national pass mark exists; universities set their own cutoffs per program and intake',
      'Planning bands: 80+ for selective (C9/985), 70+ for mid-tier (211/top-300), 60s possible at regional universities — heuristics, not published minimums',
      'The score report goes to universities through YOU — download from the portal and attach it to each application',
      'Ask target schools for last cycle\'s admitted-score range; target 10 points above it',
      'Scores follow the report you choose to submit — a retake report can replace a weak one for deadlines still open',
    ],
    sections: [
      {
        id: 'scoring-mechanics',
        h2: 'How the scoring works',
        intro:
          'The mechanics are deliberately simple — the complexity lives in how universities interpret the numbers.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Per-subject scale** — each of your subjects (Chinese track, Math, and any sciences) is scored 0–100 independently; there is no composite total',
              '**Multiple-choice scoring** — answers are machine-scored selections; there are no essays, no partial credit, no negative marking published at launch',
              '**All subjects count separately** — a university reads your Math score against its Math expectation and your Chinese track against its language expectation; a weak subject is not averaged away by strong ones',
              '**Results via the portal** — per-session release through the registration portal; you download the score report yourself',
              '**No published percentiles** — unlike the SAT, no national percentile or ranking accompanies the score; context comes from each university\'s own applicant experience',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The no-composite design has a strategic edge: you can be excellent in exactly the subjects your program requires. An engineering applicant with 85 Math / 82 Physics / 70s Chinese-track presents a different (and for engineering, better) profile than a flat 75 everywhere.',
          },
        ],
      },
      {
        id: 'no-pass-mark',
        h2: 'What "no national pass mark" means in practice',
        intro:
          'The phrase appears in every official notice — here is what it changes and what it does not.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**What it means** — no ministry publishes a minimum score for "passing" the CSCA; there is no score below which you have formally failed the exam',
              '**Where the lines moved** — every effective cutoff now lives at the university level, set per program, per intake, against that year\'s applicant pool',
              '**What it does NOT mean** — it is not a free pass: a university cutoff of 75 behaves exactly like a pass mark for that program, it just isn\'t national and isn\'t printed',
              '**Why the design** — a national line would force one standard onto programs as different as engineering and Chinese literature; university-level lines let each faculty demand what its curriculum needs',
              '**The practical consequence** — "Is my score good enough?" is unanswerable in the abstract; it is answerable only against named target programs',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Beware blog posts quoting a "CSCA pass mark". Any specific national number you read is fabricated — the entire design delegates the line to universities.',
          },
        ],
      },
      {
        id: 'tier-benchmarks',
        h2: 'Realistic benchmarks by university tier',
        intro:
          'With no published lines, applicants need a starting heuristic. These bands come from market observation of Chinese university admission behavior — treat them as planning anchors, never as official minimums.',
        blocks: [
          {
            type: 'table',
            caption: 'Planning bands for required-subject scores (heuristics, not published minimums)',
            columns: ['Target tier', 'Typical band', 'Examples', 'Reality check'],
            rows: [
              ['Top selective (C9/985)', '80+', 'Tsinghua, Peking, Fudan, Shanghai Jiao Tong, Zhejiang', 'Programs may effectively run higher; scholarship lines run higher still'],
              ['Strong national (211 / top ~300)', '70+', 'Most provincial flagships and strong sector universities', 'Popular programs (CS, medicine) run above the tier band'],
              ['Regional universities', '60s', 'Regional comprehensives, teaching universities', 'Some accept lower for programs with capacity; verify per program'],
              ['Scholarship-added pressure', '+5–10 on all of the above', 'CSC and full university scholarships', 'Funding lines sit above admission lines everywhere'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Program skew beats tier** — computer science at a 211 can demand more than history at a 985; always price the PROGRAM, not just the university',
              '**Bands shift with applicant volume** — as CSCA cohorts grow, lines at popular programs can move; last cycle\'s data beats any static table',
              '**The required subjects dominate** — cutoffs are drawn on the subjects the program names; your unrequired subjects matter less to that program\'s line',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The band-to-target conversion: take your best-fit band, add 10, and that is your prep target. "70+ tier" means walk in aiming for 80 — the cushion absorbs session variance and keeps scholarship options alive.',
          },
        ],
      },
      {
        id: 'score-report',
        h2: 'The score report — mechanics and logistics',
        intro:
          'The report is the artifact universities actually see. Its logistics are candidate-driven, which is both freedom and a failure mode.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Issued to you** — per-session release through the registration portal; download the PDF/report as soon as the window opens',
              '**Candidate-submitted** — attach the report to each university application yourself; there is no automatic transmission to universities at launch',
              '**One report, many destinations** — the same report file serves every application: universities, scholarship files, and direct email inquiries to admissions offices',
              '**Which report counts** — universities consider the report you choose to submit; a cleaner retake report replaces a weak one for any deadline still open',
              '**Keep the source files** — registration confirmation, payment receipt, and the report itself; any discrepancy dispute is resolved with these documents',
              '**CSC files are mechanical** — scholarship screening checks completeness; a missing report reads as an incomplete file regardless of the reason',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The #1 report failure is not a low score — it is a good score that never reaches an application because the candidate forgot to attach it. Build a checklist: per university, "report attached" is a line item.',
          },
        ],
      },
      {
        id: 'choosing-target',
        h2: 'Choosing your target score — the working method',
        intro:
          'Since no universal line exists, target-setting is a research exercise. It takes one afternoon and reshapes your whole prep plan.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Shortlist 3–5 programs** — name the exact program + university pairs you would accept an offer from, in preference order.',
              '**Ask each for last cycle\'s range** — one email per admissions office: "What CSCA scores did admitted applicants to this program present last intake?" Many will answer; some will publish ranges.',
              '**Take the maximum of the answers** — your target is set by your most demanding realistic option, not your average one.',
              '**Add the +10 cushion** — the cushion covers session-to-session variance, test-day performance, and keeps scholarship lanes open.',
              '**Split the target per subject** — convert "80 overall" into per-subject targets weighted by your diagnostic results; your weakest required subject gets the biggest gap to close.',
              '**Re-anchor after attempt 1** — if your first sitting beats the target, you are done; if it falls short by under 10, a targeted retake of weak subjects is usually worth it (see the dates guide for session math).',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'If schools won\'t disclose ranges, fall back to the tier bands above and the +10 cushion — then let your first sitting be the data point that calibrates the retake decision.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the passing score for the CSCA?',
        a: 'There is no national pass mark — each subject is scored 0–100 and every university sets its own admission cutoffs per program. As planning heuristics: selective C9/985 universities typically admit around 80+ in required subjects, mid-tier programs around 70+, and regional universities may admit in the 60s.',
      },
      {
        q: 'What is a good CSCA score?',
        a: 'Good is program-relative: 80+ in required subjects is competitive for top-tier universities; 70+ clears most mid-tier program lines; 60s can work at regional universities. Add 5–10 points on top of any of these when scholarship funding is the goal.',
      },
      {
        q: 'How is the CSCA scored?',
        a: 'Each subject is machine-scored from its multiple-choice questions on a 0–100 scale. There is no essay, no published partial credit, and no composite total — each subject stands alone, and universities read each against their own expectation.',
      },
      {
        q: 'How do I get my CSCA score report?',
        a: 'Results release per session through the official registration portal. You download the report yourself and attach it to each university application — universities do not receive scores automatically. The same report file serves every application and your CSC scholarship file.',
      },
      {
        q: 'Do CSCA scores expire?',
        a: 'No expiration period has been published at launch. Practically, scores are used within application cycles, and universities evaluate the report you submit — if a specific university imposes its own recency preference, it will say so in its requirements.',
      },
      {
        q: 'Can I submit only my best subjects?',
        a: 'Universities read the report you submit, and required subjects are what they evaluate — a strong required-subject profile matters more than a flat average. But never omit a subject your target program requires; a missing required score reads as an incomplete application.',
      },
      {
        q: 'My score is just below a program\'s apparent line — retake or apply anyway?',
        a: 'Apply anyway (applications are cheap; decisions are free) and register the retake in parallel if the session math works — a cleaner report can replace the weak one for any deadline still open. If the gap is 10+ points and no session fits, target a tier down rather than losing the cycle.',
      },
    ],
    howToSteps: [
      {
        name: 'Shortlist programs, not just universities',
        text: 'Name 3–5 program + university pairs in preference order. Cutoffs live at the program level, so "Tsinghua" is not a target — "Tsinghua X program" is.',
      },
      {
        name: 'Research last cycle\'s admitted ranges',
        text: 'One email per admissions office asking what CSCA scores admitted applicants presented. Published ranges, agent networks, and SICA\'s counselor knowledge all feed this step.',
      },
      {
        name: 'Set the target at max-of-list + 10',
        text: 'Your most demanding realistic option sets the bar; the +10 cushion absorbs variance and keeps scholarship lanes open. Write the number down — vague targets produce vague prep.',
      },
      {
        name: 'Split the target across subjects by diagnostic',
        text: 'A flat target hides the work. Convert it into per-subject targets using your week-1 diagnostics; the weakest required subject inherits the largest gap and the earliest prep weeks.',
      },
      {
        name: 'Build the report-attachment checklist',
        text: 'One line per application: report downloaded, report attached, confirmation filed. Most report failures are logistics failures — make them impossible by checklist.',
      },
      {
        name: 'Re-anchor after your first sitting',
        text: 'Beat the target: you are done, submit everywhere. Short by under 10: register the retake for weak subjects and keep applying. Short by a lot: re-tier your list rather than burning the cycle.',
      },
    ],
    ctaTitle: 'Need a target score for your exact program list?',
    ctaSubtitle:
      'SICA counselors maintain score intelligence across Chinese universities, set your per-subject targets from diagnostics, and manage the report-to-application checklist so nothing goes missing. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, and the CSC requirement.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China — rankings',
        description: 'The tier landscape your score bands map onto, with live university data.',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA exam dates & registration windows',
        description: 'The session math behind retake decisions and score-to-deadline timing.',
      },
    ],
  },
  zh: {
    slug: 'csca-scores-and-cutoffs',
    eyebrow: '指南 · CSCA 分数',
    title: 'CSCA 分数解读——无全国及格线、大学自划线，以及你该定多少分',
    description:
      'CSCA 计分机制：单科 100 分、无全国及格线、各校自划录取线。成绩单流转、按层次的规划分数带（80+/70+/60 分段），以及如何定目标分。',
    subtitle:
      'CSCA 没有及格线也没有全国排名——每科按百分制计分，成绩作为参考交给大学，每所大学按项目与批次自行划线。这让「我需要多少分」变成一个关于目标院校的问题，而非关于考试本身。本指南解释计分机制、大学如何使用成绩、按层次的现实分数带，以及成绩单本身的流转细节。',
    stats: [
      { value: '0–100', label: '单科，选择题计分' },
      { value: '0', label: '条全国及格线——不存在' },
      { value: '80+ / 70+ / 60s', label: '按层次的规划分数带' },
      { value: '你', label: '把成绩单交给大学的人' },
    ],
    quickAnswer:
      '每门 CSCA 科目按选择题在 0-100 区间计分。没有全国及格线、没有中央排名——成绩作为大学参考，每所大学按项目与批次自划录取线。作为规划经验值（非公布的最低线）：选拔性的 C9/985 大学通常录取必考科 80+ 的申请者，中游（211/前 300）项目常见 70+，地方院校 60 分段亦有可能录取。成绩单经报名门户发给你；由你下载并附到每所大学申请及（如适用）CSC 奖学金材料——大学不会自动收到成绩。由于分数线不公开且因校而异，实操方法是：问目标院校上年录取者的分数，然后以「该分数 +10」为目标。',
    keyTakeaways: [
      '单科 0-100、选择题机读计分——无需学习任何部分给分机制',
      '不存在全国及格线；大学按项目与批次自划线',
      '规划分数带：选拔层（C9/985）80+、中游（211/前 300）70+、地方院校 60 分段——经验值而非公布最低线',
      '成绩单由你交给大学——从门户下载并附到每份申请',
      '询问目标院校上轮录取分数区间；以「该分数 +10」为目标',
      '大学以你提交的成绩单为准——重考成绩可为仍开放的截止日替换弱分',
    ],
    sections: [
      {
        id: 'scoring-mechanics',
        h2: '计分如何运作',
        intro:
          '机制刻意简单——复杂性全在大学如何解读这些数字。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**单科刻度**——你的每门科目（中文轨、数学、各理科）独立计 0-100 分；不存在合计总分',
              '**选择题计分**——选项机器判分；启动时未公布作文、部分给分或倒扣分机制',
              '**各科分别计账**——大学把你的数学分对照它的数学预期、中文轨对照语言预期；弱科不会被强科平均掉',
              '**成绩经门户发布**——按场次经报名门户发布；成绩单由你自行下载',
              '**无公开百分位**——不同于 SAT，成绩不附全国百分位或排名；参照系来自各校自己的申请者经验',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '无总分设计有个战略优势：你可以在项目恰好要求的科目上做到卓越。工科申请者 85 数学 / 82 物理 / 70 分段中文轨，对工科而言是比处处 75 更好的画像。',
          },
        ],
      },
      {
        id: 'no-pass-mark',
        h2: '「无全国及格线」在实践中意味着什么',
        intro:
          '每份官方通知都有这句话——它改变了什么、没改变什么。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**它意味着**——教育部不公布「通过」CSCA 的最低分；不存在「低于即正式不及格」的分数',
              '**线去了哪里**——每条实际生效的线都在大学层，按项目、按批次、对着当年申请者池划定',
              '**它不意味着**——不是放水：某项目 75 分的线在实际效果上就是那条及格线，只是它不是全国的、也不印在通知里',
              '**为何这样设计**——全国统一线会把一个标准强加给从工科到中文文学差异巨大的项目；校级线让每个院系按课程需要提要求',
              '**实操后果**——「我的分够不够？」在抽象层面无解；只有对着具名目标项目才可回答',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '警惕引用「CSCA 及格线」的博客文章。你读到的任何具体全国数字都是编造的——整个设计就是把线下放给大学。',
          },
        ],
      },
      {
        id: 'tier-benchmarks',
        h2: '按层次的现实分数带',
        intro:
          '没有公布线，申请者需要一个起点经验值。以下分数带来自对中国大学录取行为的市场观察——只作规划锚点，绝非官方最低线。',
        blocks: [
          {
            type: 'table',
            caption: '必考科分数的规划带（经验值，非公布最低线）',
            columns: ['目标层次', '典型分数带', '示例', '现实校验'],
            rows: [
              ['顶尖选拔层（C9/985）', '80+', '清华、北大、复旦、上海交大、浙大', '项目实际线可能更高；奖学金线更高'],
              ['强全国层（211 / 前 300 左右）', '70+', '多数省属重点与强行业院校', '热门项目（计算机、医学）高于层次带'],
              ['地方院校', '60 分段', '地方综合、教学型大学', '部分项目有容量时接受更低；逐项目核验'],
              ['奖学金加压', '以上全部 +5-10', 'CSC 与大学全额奖学金', '资助线处处高于录取线'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**项目热度压过层次**——211 的计算机可能比 985 的历史要求更高；永远给「项目」定价，不只给大学定价',
              '**分数带随申请量漂移**——随 CSCA 考生规模增长，热门项目的线会上移；上一周期的数据胜过任何静态表',
              '**必考科主导**——线画在项目点名的科目上；非必考科对该项目的线影响较小',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '从分数带到目标的换算：取最适配的带，加 10，就是你的备考目标。「70+ 层次」意味着进场就要冲 80——缓冲吸收场次波动，也让奖学金选项保持存活。',
          },
        ],
      },
      {
        id: 'score-report',
        h2: '成绩单——机制与流转',
        intro:
          '成绩单是大学真正看到的物件。流转由考生驱动——既是自由，也是故障点。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**发给你**——按场次经报名门户发布；窗口一开就下载报告',
              '**考生提交**——由你把报告附到每份大学申请；启动时没有向大学的自动传送',
              '**一份报告多目的地**——同一份报告文件服务所有申请：各大学、奖学金材料、以及致招生办的直接邮件询问',
              '**哪份算数**——大学以你选择提交的报告为准；更干净的重考报告可为任何仍开放的截止日替换弱分',
              '**保留源头文件**——报名确认、支付回执、报告本体；任何出入争议靠这些文件解决',
              '**CSC 材料是机械化审查**——奖学金筛审查完整性；缺报告就是缺件，无论理由',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '成绩单的头号失败不是分低——而是好成绩因为忘了附上从没到达申请材料。建一张清单：每所大学一行「报告已附」。',
          },
        ],
      },
      {
        id: 'choosing-target',
        h2: '定你的目标分——实操方法',
        intro:
          '既然没有统一线，定目标就是一次调研作业。花一个下午，重塑整个备考计划。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**圈定 3-5 个项目**——写出你愿意接受 offer 的精确「项目 + 大学」对，按偏好排序。',
              '**逐校询问上轮区间**——每校一封邮件：「上一批录取该项目的申请者 CSCA 大概多少分？」多数会答；有些公布区间。',
              '**取答案的最大值**——目标由你最有野心且现实的那一项决定，不是平均值。',
              '**加 +10 缓冲**——缓冲吸收场次波动与考日发挥，也让奖学金通道保持开放。',
              '**按科目拆分目标**——把「总分 80」按诊断结果拆成逐科目标；最弱的必考科拿到最大的差距与最早的备考周。',
              '**首考后重新锚定**——首考达标即收工；差 10 分以内，弱科定向重考通常值得（场次算术见时间指南）。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '若学校不肯透露区间，退回上面的层次分数带 + 10 缓冲——然后让首考成为校准重考决策的数据点。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 的及格分是多少？',
        a: '没有全国及格线——每科 0-100 计分，每所大学按项目自划录取线。规划经验值：选拔性 C9/985 通常录取必考科 80+ 左右，中游项目约 70+，地方院校 60 分段亦有可能。',
      },
      {
        q: '多少分算好？',
        a: '「好」相对于项目：必考科 80+ 对顶尖大学有竞争力；70+ 过多数中游项目线；60 分段在地方院校可行。目标含奖学金时，在上述任何数上再加 5-10 分。',
      },
      {
        q: 'CSCA 怎么计分？',
        a: '每科按选择题在 0-100 区间机读计分。无作文、无公布的部分给分、无合计总分——每科独立存在，大学逐科对照自己的预期来读。',
      },
      {
        q: '怎么拿到 CSCA 成绩单？',
        a: '成绩按场次经官方报名门户发布。由你自行下载报告并附到每份大学申请——大学不会自动收到。同一份报告文件服务所有申请与你的 CSC 奖学金材料。',
      },
      {
        q: 'CSCA 成绩会过期吗？',
        a: '启动时未公布有效期。实际上成绩在申请周期内使用，大学评估你提交的报告——若某校有自己的时效偏好，会写在要求里。',
      },
      {
        q: '可以只提交最好的科目吗？',
        a: '大学读你提交的报告，评估的是必考科——强必考科画像比扁平均分更有用。但绝不能缺目标项目要求的科目；缺必考成绩就是缺件申请。',
      },
      {
        q: '分数略低于项目 apparent 线——重考还是照申？',
        a: '照申（申请成本低、决定免费），同时若场次算术可行就并行报名重考——更干净的成绩可为任何仍开放的截止日替换弱分。若差距 10+ 且无场次赶上，降一档目标别烧掉整个周期。',
      },
    ],
    howToSteps: [
      {
        name: '圈定项目，而不只是大学',
        text: '按偏好写出 3-5 对精确的「项目 + 大学」。线在项目层，所以「清华」不是目标——「清华 X 项目」才是。',
      },
      {
        name: '调研上一周期的录取区间',
        text: '每校一封邮件询问录取者的 CSCA 分数。公布区间、中介网络、SICA 顾问的知识库都为这一步供料。',
      },
      {
        name: '目标定为清单最大值 + 10',
        text: '最有野心且现实的那一项定标；+10 缓冲吸收波动并保住奖学金通道。把数字写下来——模糊的目标产生模糊的备考。',
      },
      {
        name: '按诊断把目标拆到科目',
        text: '扁平目标隐藏工作量。用第 1 周诊断把它拆成逐科目标；最弱必考科继承最大差距与最早的备考周。',
      },
      {
        name: '建「报告已附」清单',
        text: '每份申请一行：报告已下载、报告已附、凭证已归档。多数成绩单失败是物流失败——用清单让它们不可能发生。',
      },
      {
        name: '首考后重新锚定',
        text: '达标：收工、处处提交。差 10 分内：为弱科报名重考、继续申请。差很多：给清单降档，别烧掉整个周期。',
      },
    ],
    ctaTitle: '需要为你的精确项目清单定目标分？',
    ctaSubtitle:
      'SICA 顾问维护中国大学的分数情报、按诊断设定你的逐科目标，并管理「报告到申请」的清单确保万无一失。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用与 CSC 要求。',
      },
      {
        href: '/best-universities-china',
        label: '中国最好的大学——排名',
        description: '分数带所映射的层次版图，附实时大学数据。',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA 考试时间与报名窗口',
        description: '重考决策与成绩到截止日时序背后的场次算术。',
      },
    ],
  },
};
