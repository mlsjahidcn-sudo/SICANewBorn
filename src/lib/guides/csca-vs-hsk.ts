import type { LocalizedGuide } from './types';

/**
 * "CSCA vs HSK — what's the difference" — Batch 3, article #12 of
 * the 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca vs hsk", "do i need hsk for csca",
 * "hsk or csca".
 *
 * Static comparison content. All CSCA facts from the cluster's
 * verified baseline; HSK facts are general-proficiency common
 * knowledge (levels 1-6, listening/reading/writing, year-round
 * sessions).
 */
export const cscaVsHskGuide: LocalizedGuide = {
  en: {
    slug: 'csca-vs-hsk',
    eyebrow: 'GUIDE · CSCA VS HSK',
    title: 'CSCA vs HSK — What\'s the Difference, and Which Do You Actually Need?',
    description:
      'The CSCA tests academic competency (Professional Chinese + Math, Physics, Chemistry); the HSK tests general Chinese proficiency. Side-by-side comparison, who needs which or both, and how the HSK exemption and waiver interact.',
    subtitle:
      'They sound similar and get confused constantly, but they measure different things: the HSK is a general Chinese-language proficiency test (levels 1–6); the CSCA is an academic competency exam for bachelor\'s admission that includes a Professional Chinese track plus Mathematics and sciences. Most Chinese-taught degree applicants need both; English-taught applicants usually need the CSCA + IELTS/TOEFL instead of HSK; and a strong HSK can reduce or eliminate parts of your CSCA through the exemption and waiver routes.',
    stats: [
      { value: 'Different', label: 'Tests — not interchangeable' },
      { value: 'Both', label: 'Common for Chinese-taught degrees' },
      { value: 'HSK 4', label: 'Full-exemption threshold (language programs)' },
      { value: 'HSK 5', label: 'Safe waiver-planning benchmark' },
    ],
    quickAnswer:
      'The HSK (Hanyu Shuiping Kaoshi) measures general Chinese-language proficiency on a 1–6 level scale, with listening, reading, and writing sections — it is the standard language certificate for Chinese-taught programs. The CSCA (China Scholastic Competency Assessment) is an academic admissions exam for bachelor\'s applicants: it tests a Professional Chinese track (academic Chinese in your study domain) plus fundamental subjects (Mathematics, and per program Physics/Chemistry), all multiple choice. Neither replaces the other: HSK alone does not satisfy the CSCA requirement for degree admission, and the CSCA does not certify general language proficiency. The two connect in two places — a valid HSK 4 can fully exempt applicants to Chinese-language programs from the CSCA, and a qualifying HSK score can waive the CSCA\'s Professional Chinese subject for degree applicants.',
    keyTakeaways: [
      'HSK = general language proficiency (levels 1–6); CSCA = academic admissions exam (Professional Chinese + fundamentals)',
      'Neither substitutes for the other: HSK alone ≠ CSCA requirement; CSCA ≠ language certificate',
      'Chinese-taught degree applicants typically need BOTH: HSK 4–5 for language + CSCA fundamentals for academics',
      'English-taught applicants typically need CSCA + IELTS/TOEFL — no HSK, but the CSCA still applies',
      'Two intersection points: HSK 4 full exemption (language programs) and the qualifying-HSK Professional Chinese waiver',
      'If budget-constrained, sequence HSK first — it unlocks the waiver check before you commit CSCA prep months',
    ],
    sections: [
      {
        id: 'at-a-glance',
        h2: 'CSCA vs HSK at a glance',
        intro:
          'One table, the whole difference. Every row is a reason the two exams get confused — and why they coexist.',
        blocks: [
          {
            type: 'table',
            caption: 'Side by side',
            columns: ['Dimension', 'HSK', 'CSCA'],
            rows: [
              ['What it measures', 'General Chinese proficiency', 'Academic competency: Professional Chinese + Math, Physics, Chemistry'],
              ['Primary role', 'Language certificate for Chinese-taught programs & scholarships', 'Standardized admissions exam for bachelor\'s applicants (2026 intake+)'],
              ['Structure', 'Levels 1–6; listening + reading + writing sections', '5 subjects; all multiple choice; ~60 min each; no calculator'],
              ['Scoring', 'Level bands (pass a level or not)', '100 points per subject; university-set cutoffs'],
              ['Frequency', 'Multiple sessions year-round worldwide', '5 sessions per year'],
              ['Cost (approx.)', '~$30–100 per level, varies by country', '¥450 (1 subject) / ¥700 (2+ subjects)'],
              ['Can one replace the other?', 'No — HSK alone does not satisfy CSCA degree requirements', 'No — CSCA does not certify general proficiency'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The one-sentence version: HSK asks "how good is your Chinese?" — the CSCA asks "can you study a degree, in Chinese academic contexts, with the required fundamentals?" Different questions, different exams.',
          },
        ],
      },
      {
        id: 'who-needs-which',
        h2: 'Who needs which — and who needs both',
        intro:
          'Your required exam set falls out of two variables: the teaching language of your degree and your current HSK position.',
        blocks: [
          {
            type: 'table',
            caption: 'Exam requirements by applicant type',
            columns: ['Applicant type', 'HSK', 'CSCA', 'Notes'],
            rows: [
              ['Chinese-taught bachelor\'s (typical)', 'Yes — HSK 4–5 per program', 'Yes — Professional Chinese track + fundamentals', 'The "both" case; waiver may remove the Chinese track'],
              ['English-taught bachelor\'s', 'No', 'Yes — subject combination per program', 'IELTS/TOEFL covers language; CSCA still mandatory'],
              ['Chinese-language (language/prep) program', 'Yes — valid HSK 4 can exempt from CSCA', 'May be fully exempt', 'The HSK-4 route replaces the exam'],
              ['CSC scholarship (bachelor\'s)', 'Per program + scholarship rules', 'Yes — scores required from 2026', 'Both tracks likely relevant'],
              ['Master\'s / PhD', 'Per program', 'Not under the mandate', 'Program-specific requirements apply'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The most expensive mistake in this space: assuming "I have HSK 5, so no CSCA" for a degree program. The exemption routes are program-type-bound and university-confirmed — see the exemptions guide and get every waiver in writing.',
          },
        ],
      },
      {
        id: 'waiver-interplay',
        h2: 'Where the two exams intersect: exemption and waiver',
        intro:
          'The CSCA rules deliberately reward existing HSK achievement in two specific ways. This is the overlap worth exploiting strategically.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The full exemption (language programs)** — a valid HSK 4 certificate exempts applicants to Chinese-language programs from the CSCA entirely: no registration, no fee, no score report',
              '**The subject waiver (degree applicants)** — a qualifying HSK score can waive the Professional Chinese subject, leaving Mathematics (compulsory) and program-required sciences; the exact qualifying bar is university-specific with no universal published cutoff — HSK 5 is the safe planning benchmark',
              '**What never shrinks** — Mathematics is compulsory for every candidate; no HSK level removes it',
              '**The strategic sequence** — if your HSK is near the waiver bar, retest HSK BEFORE booking CSCA sessions; a waived subject is worth more than a retake slot',
              '**Paper trail** — the waiver only exists with the university\'s written confirmation; attach it wherever the application lists test scores',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Budget logic: the waiver converts "4 subjects of prep" into "2–3 subjects". If you already hold a strong HSK, email admissions before you plan a single CSCA study week — the answer may restructure your entire calendar.',
          },
        ],
      },
      {
        id: 'prep-overlap',
        h2: 'Preparing for both — what overlaps and what doesn\'t',
        intro:
          'The good news: the two exams share a vocabulary foundation. The bad news: they train different skills on top of it.',
        blocks: [
          {
            type: 'table',
            caption: 'Skill overlap between HSK prep and CSCA prep',
            columns: ['Skill', 'HSK trains it?', 'CSCA trains it?'],
            rows: [
              ['General vocabulary (HSK 4–5 lists)', 'Yes — primary', 'Partially — it is the floor'],
              ['Reading speed in Chinese', 'Yes', 'Yes — academic register goes further'],
              ['Academic/domain vocabulary', 'Lightly', 'Yes — primary'],
              ['Listening & writing', 'Yes — primary', 'No — CSCA is multiple choice only'],
              ['Math/science under time pressure', 'No', 'Yes — primary'],
              ['No-calculator exam technique', 'No', 'Yes — primary'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**If you need both** — run one shared Chinese study block: HSK materials for the floor, CSCA academic-reading diet for the domain layer; the CSCA prep covers most HSK 5–6 reading work as a byproduct',
              '**If you only need CSCA (English-taught route)** — skip HSK entirely unless you are chasing the waiver; IELTS/TOEFL is your language exam',
              '**If you only need HSK (language-program route)** — confirm the HSK-4 exemption in writing, then put every hour into HSK rather than splitting effort',
              '**Sequencing** — HSK first is usually right: its result determines whether the waiver restructures your CSCA plan',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The prep-plan guide\'s parallel-track structure assumes exactly this: the Chinese study block serves whichever language exam(s) you face, while fundamentals get their own weeks.',
          },
        ],
      },
      {
        id: 'decision-flowchart',
        h2: 'The 5-minute decision: which exams do you actually need?',
        intro:
          'Answer five questions in order; the answer at the end is your exam list.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**What degree level?** — Master\'s or PhD: the CSCA mandate does not apply; follow your program\'s requirements (often HSK for Chinese-taught research degrees) and stop here.',
              '**Which program type?** — Chinese-language/preparatory program: with a valid HSK 4 you are fully exempt from CSCA — your exam is HSK (and confirm the exemption in writing). Otherwise continue.',
              '**Teaching language?** — English-taught degree: your set is CSCA (subject combination per program) + IELTS/TOEFL. No HSK unless you want the waiver option. Chinese-taught degree: continue.',
              '**Current HSK level?** — HSK 5+ (or near it): email admissions to check the Professional Chinese waiver — if confirmed, your CSCA is fundamentals only; run HSK + CSCA-fundamentals. Below HSK 4: plan HSK 4–5 + full CSCA (both prep tracks).',
              '**Scholarship route?** — Applying for CSC: the CSCA score is mandatory regardless of the above — move your first sitting to the earliest viable session (see the dates guide).',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Output examples: "Chinese-taught business, HSK 5 held, waiver confirmed" = HSK (done) + Math only. "English-taught CS, no Chinese" = IELTS + STEM-adjacent subject combination. "Language program, no HSK yet" = HSK 4 first, no CSCA.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is the CSCA the same as HSK?',
        a: 'No. The HSK is a general Chinese-language proficiency test (levels 1–6, listening/reading/writing). The CSCA is an academic admissions exam for bachelor\'s applicants that tests a Professional Chinese track plus Mathematics and required sciences, all multiple choice. They measure different things and neither replaces the other.',
      },
      {
        q: 'Do I need HSK if I\'m taking the CSCA?',
        a: 'Depends on your program: Chinese-taught degree applicants typically need both (HSK for language, CSCA for academics). English-taught applicants usually need CSCA + IELTS/TOEFL and no HSK — unless they are pursuing the HSK-based Professional Chinese waiver.',
      },
      {
        q: 'Does HSK 5 exempt me from the CSCA?',
        a: 'Not automatically. A valid HSK 4 fully exempts only applicants to Chinese-language programs. For degree applicants, a qualifying HSK score can waive the Professional Chinese subject — but the qualifying bar is university-specific and must be confirmed in writing. Mathematics and required sciences are never waived.',
      },
      {
        q: 'Which is harder, HSK 6 or the CSCA Chinese track?',
        a: 'They are different: HSK 6 tests broad general proficiency including writing and listening at high difficulty; the CSCA Chinese track tests academic reading in your degree domain, multiple choice only. A candidate can find one substantially easier than the other depending on their strengths.',
      },
      {
        q: 'Can I use my HSK prep for the CSCA?',
        a: 'Partially — HSK 4–5 vocabulary is exactly the CSCA Chinese track\'s floor, so HSK prep transfers. What it does not cover: domain terminology, academic-register reading speed, and the fundamentals subjects. See the HSK-to-CSCA bridging plan in the subject guides.',
      },
      {
        q: 'Should I take HSK or CSCA first?',
        a: 'Usually HSK first: its result feeds the waiver decision, which can remove the Professional Chinese subject and restructure your entire CSCA plan. The exception is time pressure — if your target CSCA session is imminent and the HSK date is far, sit CSCA first and chase the waiver later.',
      },
      {
        q: 'Do CSC scholarship applicants need both HSK and CSCA?',
        a: 'The CSCA is mandatory for CSC bachelor\'s applicants from the 2026 intake. HSK requirements follow the underlying program and scholarship channel — Chinese-taught programs still ask for HSK, while English-taught ones ask for IELTS/TOEFL. Check your specific channel\'s rules.',
      },
    ],
    howToSteps: [
      {
        name: 'Classify your program type and teaching language',
        text: 'Language program, Chinese-taught degree, or English-taught degree — this single classification drives every exam decision that follows. Get it from the program page, not from forum advice.',
      },
      {
        name: 'Audit your current HSK position',
        text: 'Do you hold a valid HSK 4 or higher? Check the certificate\'s validity window. This determines whether the full exemption (language programs) or the Professional Chinese waiver (degrees) is even in play.',
      },
      {
        name: 'Run the waiver check with each target university',
        text: 'One email per target: state your program, HSK level, and ask for written confirmation of whether the Professional Chinese subject is waived. This answer restructures your CSCA registration before you spend a prep week.',
      },
      {
        name: 'Build your exam list and sequence it',
        text: 'Typical outcomes: both exams for Chinese-taught degrees (HSK first), CSCA + IELTS/TOEFL for English-taught, HSK-only for language programs with the exemption confirmed. Sequence the language exam first wherever the waiver is in play.',
      },
      {
        name: 'Merge your Chinese prep into one shared track',
        text: 'If facing both exams, run one Chinese study block: HSK materials maintain the floor while the CSCA academic-reading diet builds the domain layer. Two separate study plans double the work for the same vocabulary.',
      },
      {
        name: 'Confirm everything in writing before booking anything',
        text: 'Exemption, waiver, subject combination, and HSK requirement — each exists only as confirmed by the university or program in writing. File the confirmations with your application records.',
      },
    ],
    ctaTitle: 'Unsure whether you need HSK, CSCA, or both?',
    ctaSubtitle:
      'SICA counselors classify your program, run the waiver checks with your target universities, and build one exam calendar that covers both tests without wasted prep. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/hsk',
        label: 'HSK Chinese proficiency test guide',
        description: 'The full HSK picture: levels, scoring, dates, and program thresholds.',
      },
      {
        href: '/csca-exam-exemptions',
        label: 'Who must take the CSCA — and who is exempt',
        description: 'The HSK-4 exemption and the Professional Chinese waiver in full detail.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, and the CSC requirement.',
      },
    ],
  },
  zh: {
    slug: 'csca-vs-hsk',
    eyebrow: '指南 · CSCA 对比 HSK',
    title: 'CSCA 与 HSK 有什么区别——你到底需要考哪个？',
    description:
      'CSCA 考学术能力（专业中文 + 数学、物理、化学）；HSK 考通用汉语水平。逐项对比、谁需要哪个或都要，以及 HSK 豁免与免考的交叉规则。',
    subtitle:
      '两者听起来相似、经常被混淆，但测的是不同的东西：HSK 是通用汉语水平考试（1-6 级）；CSCA 是面向本科录取的学术能力考试，含专业中文轨加数学与理科。多数中文授课学位申请者两个都要考；英文授课申请者通常考 CSCA + 雅思/托福而非 HSK；而高分 HSK 可通过豁免与免考通道减少乃至取消你的部分 CSCA。',
    stats: [
      { value: '不同', label: '两种考试——不可互换' },
      { value: '都要', label: '中文授课学位的常见情况' },
      { value: 'HSK 4', label: '整体豁免门槛（语言类项目）' },
      { value: 'HSK 5', label: '安全的免考规划基准' },
    ],
    quickAnswer:
      'HSK（汉语水平考试）测通用汉语水平，1-6 级，含听力、阅读、书写——是中文授课项目的标准语言证书。CSCA（中国国际学生学业能力评估）是本科申请者的学术入学考试：考专业中文轨（学业领域内的学术中文）加基础科目（数学，及按项目要求的物理/化学），全为选择题。两者互不替代：仅 HSK 不满足学位入学的 CSCA 要求，CSCA 也不认证通用语言水平。两者有两个交点——有效 HSK 4 可让中文授课项目申请者整体豁免 CSCA；合格 HSK 成绩可为学位申请者免考 CSCA 的专业中文科目。',
    keyTakeaways: [
      'HSK = 通用语言水平（1-6 级）；CSCA = 学术入学考试（专业中文 + 基础科）',
      '互不替代：仅 HSK ≠ CSCA 要求；CSCA ≠ 语言证书',
      '中文授课学位申请者通常两个都要：HSK 4-5 管语言 + CSCA 基础科教学术',
      '英文授课申请者通常考 CSCA + 雅思/托福——无 HSK，但 CSCA 仍适用',
      '两个交点：HSK 4 整体豁免（语言类项目）与合格 HSK 免专业中文',
      '预算紧张时先考 HSK——它在投入数月 CSCA 备考前先解锁免考检查',
    ],
    sections: [
      {
        id: 'at-a-glance',
        h2: 'CSCA 与 HSK 一览对比',
        intro:
          '一张表说完全部区别。每一行都是两者被混淆的原因——也是它们并存的原因。',
        blocks: [
          {
            type: 'table',
            caption: '逐项对比',
            columns: ['维度', 'HSK', 'CSCA'],
            rows: [
              ['考什么', '通用汉语水平', '学术能力：专业中文 + 数学、物理、化学'],
              ['主要角色', '中文授课项目与奖学金的语言证书', '本科申请者的标准化入学考试（2026 级起）'],
              ['结构', '1-6 级；听力 + 阅读 + 书写', '5 科；全选择题；每科约 60 分钟；无计算器'],
              ['计分', '级别制（过级与否）', '单科 100 分；大学自划线'],
              ['频次', '全球全年多场次', '每年 5 次'],
              ['费用（约）', '每级约 $30-100，各国不同', '¥450（1 科）/ ¥700（两科及以上）'],
              ['能否互相替代？', '不能——仅 HSK 不满足 CSCA 学位要求', '不能——CSCA 不认证通用水平'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '一句话版本：HSK 问「你的汉语多好？」——CSCA 问「你能否在中文学术语境下、具备所需基础科地读完一个学位？」不同的问题，不同的考试。',
          },
        ],
      },
      {
        id: 'who-needs-which',
        h2: '谁需要哪个——谁都要',
        intro:
          '你所需的考试组合由两个变量决定：学位的授课语言与你当前的 HSK 位置。',
        blocks: [
          {
            type: 'table',
            caption: '按申请者类型的考试要求',
            columns: ['申请者类型', 'HSK', 'CSCA', '说明'],
            rows: [
              ['中文授课本科（典型）', '要——项目要求 HSK 4-5', '要——专业中文轨 + 基础科', '「都要」的情形；免考可去掉中文轨'],
              ['英文授课本科', '不要', '要——按项目的科目组合', '雅思/托福管语言；CSCA 仍必考'],
              ['中文授课语言/预科项目', '要——有效 HSK 4 可豁免 CSCA', '可整体豁免', 'HSK-4 通道替代考试'],
              ['CSC 奖学金（本科）', '按项目与奖学金规则', '要——2026 起须提交成绩', '两条轨大概率都相关'],
              ['硕士 / 博士', '按项目', '不在强制令内', '适用项目自有的要求'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '这个领域最贵的错误：以为「我有 HSK 5，所以不用考 CSCA」就去申学位项目。豁免通道绑定项目类型且需大学书面确认——见豁免指南，每个豁免都落到书面。',
          },
        ],
      },
      {
        id: 'waiver-interplay',
        h2: '两考的交点：豁免与免考',
        intro:
          'CSCA 规则刻意在两个具体位置奖励已有的 HSK 成就。这才是值得战略利用的重叠。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**整体豁免（语言类项目）**——有效 HSK 4 证书让中文授课项目申请者完全免考 CSCA：不报名、不缴费、不交成绩单',
              '**科目免考（学位申请者）**——合格 HSK 成绩可免考专业中文，留下数学（必考）与项目要求理科；合格线因校而异、无统一公布线——HSK 5 是安全规划基准',
              '**永不缩减的部分**——数学对每位考生必考；任何 HSK 级别都免不掉',
              '**战略顺序**——若你的 HSK 接近免考线，先重考 HSK 再订 CSCA 场次；免掉一科比多一个重考名额值钱',
              '**书面凭证**——免考只有大学书面确认后才存在；把它附在申请材料列成绩的位置',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '预算逻辑：免考把「4 科备考」变成「2-3 科」。若你已持高分 HSK，规划任何一周 CSCA 备考前先邮件招生办——答案可能重构你的整个日历。',
          },
        ],
      },
      {
        id: 'prep-overlap',
        h2: '两考同备——什么重叠、什么不重叠',
        intro:
          '好消息：两考共享词汇地基。坏消息：在地基之上训练的是不同技能。',
        blocks: [
          {
            type: 'table',
            caption: 'HSK 备考与 CSCA 备考的技能重叠',
            columns: ['技能', 'HSK 练吗？', 'CSCA 练吗？'],
            rows: [
              ['通用词汇（HSK 4-5 词表）', '是——主打', '部分——只是地板'],
              ['中文阅读速度', '是', '是——学术语域走得更远'],
              ['学术/领域词汇', '轻触', '是——主打'],
              ['听力与书写', '是——主打', '否——CSCA 全选择题'],
              ['限时下的数理', '否', '是——主打'],
              ['无计算器考试技巧', '否', '是——主打'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**两考都要**——中文学习合并为一个共享块：HSK 材料保地板，CSCA 学术阅读食谱建领域层；CSCA 备考顺带覆盖多数 HSK 5-6 阅读工作',
              '**只需 CSCA（英文授课路线）**——除非冲免考，否则完全跳过 HSK；雅思/托福才是你的语言考试',
              '**只需 HSK（语言项目路线）**——书面确认 HSK-4 豁免后，把每一小时都投入 HSK，不要分兵',
              '**排序**——通常 HSK 在前：它的成绩决定免考检查结果，免考会重构你的 CSCA 计划',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '备考指南的并行双轨结构默认的正是这一点：中文学习块服务你面对的任何语言考试，基础科拿走自己的周次。',
          },
        ],
      },
      {
        id: 'decision-flowchart',
        h2: '五分钟决策：你到底要考哪些？',
        intro:
          '按顺序回答五个问题；结尾的答案就是你的考试清单。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**什么学位层级？**——硕士或博士：CSCA 强制令不适用；跟项目要求走（中文授课研究型学位常要 HSK），到此为止。',
              '**哪类项目？**——中文授课语言/预科项目：持有效 HSK 4 即整体免考 CSCA——你的考试是 HSK（并书面确认豁免）。否则继续。',
              '**授课语言？**——英文授课学位：你的组合是 CSCA（按项目科目）+ 雅思/托福。无 HSK，除非想要免考选项。中文授课学位：继续。',
              '**当前 HSK 级别？**——HSK 5+（或接近）：邮件招生办查专业中文免考——确认后你的 CSCA 只剩基础科；走 HSK + CSCA 基础科。低于 HSK 4：规划 HSK 4-5 + 全套 CSCA（双轨备考）。',
              '**奖学金路线？**——申 CSC：无论以上如何，CSCA 成绩强制——把首考挪到最早可行场次（见时间指南）。',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '输出示例：「中文授课商科、持 HSK 5、免考已确认」= HSK（已完成）+ 仅数学。「英文授课计算机、零中文」= 雅思 + 理工向科目组合。「语言项目、尚无 HSK」= 先考 HSK 4，无 CSCA。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 就是 HSK 吗？',
        a: '不是。HSK 是通用汉语水平考试（1-6 级，听力/阅读/书写）。CSCA 是面向本科申请者的学术入学考试，考专业中文轨加数学与要求理科，全为选择题。两者测的东西不同，互不替代。',
      },
      {
        q: '考 CSCA 还需要 HSK 吗？',
        a: '取决于项目：中文授课学位申请者通常两个都要（HSK 管语言，CSCA 教学术）。英文授课申请者通常 CSCA + 雅思/托福、不需要 HSK——除非追求基于 HSK 的专业中文免考。',
      },
      {
        q: 'HSK 5 能免考 CSCA 吗？',
        a: '不会自动免。有效 HSK 4 只整体豁免中文授课项目申请者。学位申请者凭合格 HSK 成绩可免专业中文科目——但合格线因校而异、须书面确认。数学与要求理科永不豁免。',
      },
      {
        q: 'HSK 6 和 CSCA 中文轨哪个更难？',
        a: '是「不同」：HSK 6 考广泛通用水平、含高难度写作与听力；CSCA 中文轨考你学位域内的学术阅读、全选择题。依个人强项，完全可能出现一方显著更难。',
      },
      {
        q: 'HSK 备考能用在这 CSCA 上吗？',
        a: '部分能——HSK 4-5 词汇正是 CSCA 中文轨的地板，所以 HSK 备考可迁移。覆盖不到的：领域术语、学术语域阅读速度、基础科目。见科目指南中的 HSK 到 CSCA 衔接计划。',
      },
      {
        q: '先考 HSK 还是先考 CSCA？',
        a: '通常 HSK 在前：它的成绩决定免考检查，免考可能去掉专业中文并重构整个 CSCA 计划。例外是时间压力——若目标 CSCA 场次临近而 HSK 考位尚远，先考 CSCA，之后再追免考。',
      },
      {
        q: '申 CSC 奖学金要 HSK 和 CSCA 都考吗？',
        a: '自 2026 级起 CSC 本科申请者强制考 CSCA。HSK 要求跟随底层项目与奖学金通道——中文授课项目仍要 HSK，英文授课项目要雅思/托福。以你具体通道的规则为准。',
      },
    ],
    howToSteps: [
      {
        name: '判定项目类型与授课语言',
        text: '语言类项目、中文授课学位、英文授课学位——这一个分类驱动之后所有考试决策。以项目页为准，不以论坛说法为准。',
      },
      {
        name: '审计当前 HSK 位置',
        text: '是否持有效 HSK 4 或更高？核对证书有效期。这决定整体豁免（语言类项目）或专业中文免考（学位）是否在牌桌上。',
      },
      {
        name: '对每所目标大学跑免考检查',
        text: '每校一封邮件：写明项目与 HSK 级别，请求书面确认专业中文是否免考。这个答案会在你投入任何一周备考前重构 CSCA 报名。',
      },
      {
        name: '列出考试清单并排序',
        text: '典型输出：中文授课学位两考都要（HSK 在前）、英文授课 CSCA + 雅思/托福、语言项目书面确认豁免后仅 HSK。凡免考在牌桌上，语言考试排在前。',
      },
      {
        name: '把中文备考合并为一个共享轨',
        text: '若两考都要，中文学习跑一个块：HSK 材料保地板、CSCA 学术阅读食谱建领域层。两套独立学习计划是为同一份词汇付双倍工时。',
      },
      {
        name: '订任何考试前先全部书面确认',
        text: '豁免、免考、科目组合、HSK 要求——每一项都只在大学或项目书面确认后才存在。确认函与申请材料一起归档。',
      },
    ],
    ctaTitle: '不确定要考 HSK、CSCA 还是都要？',
    ctaSubtitle:
      'SICA 顾问判定你的项目类型、替你向目标大学跑免考检查，并把两场考试排进一个不浪费备考的日历。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/hsk',
        label: 'HSK 汉语水平考试指南',
        description: 'HSK 全图：级别、计分、考试时间与项目门槛。',
      },
      {
        href: '/csca-exam-exemptions',
        label: '谁必须参加 CSCA——谁可豁免',
        description: 'HSK-4 豁免与专业中文免考的完整细节。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用与 CSC 要求。',
      },
    ],
  },
};
