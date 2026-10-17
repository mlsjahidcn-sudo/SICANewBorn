import type { LocalizedGuide } from './types';

/**
 * "HSK 3.0 prep timeline" — Phase 122, Batch 2 (HSK 3.0),
 * article #4. Target queries: "hsk prep schedule", "hsk 3.0 timeline",
 * "hsk 备考计划", "hsk prep plan", "when to start hsk".
 */
export const hsk3PrepTimelineGuide: LocalizedGuide = {
  en: {
    slug: 'hsk-3-0-prep-timeline',
    eyebrow: 'GUIDE · HSK 3.0 PREP TIMELINE',
    title: 'HSK 3.0 prep timeline — what to do at every stage of your application',
    description:
      'Branched by where you are now: just heard about HSK 3.0, already sat 2.0, or mid-prep. Sequenced against the March 2027 and September 2027 intake deadlines with monthly task checklists for each path.',
    seoTitle: 'HSK 3.0 prep timeline — what to do at every stage',
    seoDescription: 'Branched by where you are now: just heard about HSK 3.0, already sat 2.0, or mid-prep.',
    subtitle:
      'The HSK 3.0 transition makes prep timing more consequential than ever. With the December 13, 2026 format switch, applicants targeting March 2027 intake must prep for 3.0; applicants targeting September 2027 intake definitely prep for 3.0; and applicants between intakes can use a longer prep window. This guide provides branched prep timelines for three starting points (no Chinese yet, basic Chinese, advanced Chinese), monthly task checklists for each path, and the calendar anchors that should drive your test date.',
    stats: [
      { value: '3 paths', label: 'Branched by current level' },
      { value: 'Mar + Sep 2027', label: 'Intake anchors' },
      { value: 'Dec 13, 2026', label: 'Format switch' },
      { value: '15-min/day', label: 'Minimum study time' },
    ],
    quickAnswer:
      'Pick your starting point (no Chinese yet, basic Chinese, or advanced Chinese), choose your target level (L4 for general undergraduate, L5 for most master\'s, L6 for top programs), then work backward from your application deadline. For March 2027 intake: target a test date in October–November 2026 to clear the December 13, 2026 cutover. For September 2027 intake: target a test date in April–May 2027. For each path, the monthly task checklist follows: vocabulary building (months 1–3), reading and listening practice (months 3–5), speaking and writing at L3+ (months 5–7), full mock tests (months 7–8), final review (last 2 weeks before the test).',
    keyTakeaways: [
      'Pick your starting point and target level, then work backward from your application deadline',
      'For March 2027 intake: target a test date in October–November 2026 to clear the Dec 13, 2026 cutover',
      'For September 2027 intake: target a test date in April–May 2027',
      'Each path follows the same monthly arc: vocabulary (months 1–3), reading + listening (months 3–5), speaking + writing at L3+ (months 5–7), full mock tests (months 7–8)',
      'Daily minimum is 15 minutes for spaced repetition; weekly full-length mock tests in the final 2 months',
      'Most efficient prep uses official HSK 3.0 materials, not 2018-era prep books',
    ],
    sections: [
      {
        id: 'pick-your-path',
        h2: 'Pick your starting point',
        intro:
          'Three prep paths based on your current Chinese level. Each path follows the same monthly arc but at different intensities.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Path A — No Chinese yet** — you have 0 prior study or conversational ability; aim for L4 by March 2027 intake (12 months) or L5 by September 2027 intake (18 months)',
              '**Path B — Basic Chinese** — you can have simple conversations, know ~200 words, read short texts; aim for L4 by March 2027 intake (6–9 months) or L5 by September 2027 intake (12 months)',
              '**Path C — Advanced Chinese** — you have studied HSK 2.0 L4–L5 vocabulary, can read news, write basic paragraphs; aim for L5+ by March 2027 intake (3–6 months) or L6 by September 2027 intake (6–9 months)',
              '**For all paths** — daily minimum is 15 minutes for spaced repetition; weekly full-length mock tests in the final 2 months',
              '**Adjust based on your target program\'s required level** — verify the required HSK level on your target program\'s admissions page; it varies more by program than by institution',
            ],
          },
        ],
      },
      {
        id: 'march-2027',
        h2: 'March 2027 intake — 4–9 month prep window',
        intro:
          'Most efficient path to clear the December 13, 2026 cutover.',
        blocks: [
          {
            type: 'table',
            caption: 'March 2027 intake prep calendar by starting point',
            columns: ['Window', 'Path A (no Chinese)', 'Path B (basic)', 'Path C (advanced)'],
            rows: [
              ['April 2026', 'Begin vocabulary building (L1 300 words)', 'Refresh L1–L2 vocabulary; map to HSK 3.0 list', 'Take HSK 3.0 diagnostic; identify gaps to L5'],
              ['May 2026', 'Continue L1; begin basic speaking practice', 'Begin L3 vocabulary (1,200 words)', 'Begin L4 vocabulary (2,500 words)'],
              ['June 2026', 'Complete L1; begin L2 vocabulary (600 words)', 'Continue L3; begin reading practice', 'Begin L5 vocabulary (3,500 words)'],
              ['July 2026', 'Complete L2; begin L3 vocabulary', 'Complete L3 vocabulary; begin L4', 'Complete L5 vocabulary; full mock tests'],
              ['August 2026', 'Continue L3; begin listening practice', 'Begin L4 reading + listening practice', 'Begin L6 vocabulary (5,000 words)'],
              ['September 2026', 'Complete L3 vocabulary; begin L4', 'Complete L4 vocabulary; begin L5', 'Complete L6 vocabulary; full mock tests'],
              ['October 2026', 'Take HSK 3.0 mock test; book test date', 'Take HSK 3.0 mock test; book test date', 'Final review; book test date'],
              ['November 2026', 'Final review + sit the test (early November)', 'Final review + sit the test', 'Sit the test (early November)'],
              ['December 2026', 'Score release (2–4 weeks); submit to programs', 'Score release; submit to programs', 'Score release; submit to programs'],
              ['January–February 2027', 'Application package finalization', 'Application package finalization', 'Application package finalization'],
              ['March 2027', 'Intake', 'Intake', 'Intake'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The most common mistake for March 2027 intake applicants: booking a December 2026 test date and missing the cutover. If you are prepping for March 2027, target an early November 2026 test date — this gives a 2–4 week score release buffer before the December 13, 2026 cutover.',
          },
        ],
      },
      {
        id: 'september-2027',
        h2: 'September 2027 intake — 8–14 month prep window',
        intro:
          'Longer prep window with HSK 3.0 fully established. More flexibility on test dates.',
        blocks: [
          {
            type: 'table',
            caption: 'September 2027 intake prep calendar by starting point (HSK 3.0 is fully established; test centers have rolled out)',
            columns: ['Window', 'Path A (no Chinese)', 'Path B (basic)', 'Path C (advanced)'],
            rows: [
              ['July 2026', 'Begin vocabulary building (L1 300 words)', 'Refresh L1–L2 vocabulary; map to HSK 3.0 list', 'Take HSK 3.0 diagnostic; identify gaps'],
              ['August 2026', 'Continue L1; begin basic speaking practice', 'Begin L3 vocabulary (1,200 words)', 'Begin L5 vocabulary (3,500 words)'],
              ['September 2026', 'Complete L1; begin L2 vocabulary', 'Continue L3; begin reading practice', 'Begin L6 vocabulary (5,000 words)'],
              ['October 2026', 'Complete L2; begin L3 vocabulary', 'Complete L3 vocabulary; begin L4', 'Complete L6 vocabulary; mock tests'],
              ['November 2026', 'Continue L3; sit a December test if ready', 'Complete L4 vocabulary; mock tests', 'Full mock tests'],
              ['December 2026', 'HSK 3.0 full format switch — sit test if ready', 'Sit HSK 3.0 (December test window)', 'Sit HSK 3.0'],
              ['January–February 2027', 'Continue prep; retake if needed', 'Continue prep; retake if needed', 'Continue prep; retake if needed'],
              ['March 2027', 'Continue prep; second test attempt if needed', 'Continue prep', 'Continue prep'],
              ['April 2027', 'Final review; book May test date', 'Final review; book May test date', 'Final review; book May test date'],
              ['May 2027', 'Sit the test', 'Sit the test', 'Sit the test'],
              ['June–August 2027', 'Application package finalization', 'Application package finalization', 'Application package finalization'],
              ['September 2027', 'Intake', 'Intake', 'Intake'],
            ],
          },
        ],
      },
      {
        id: 'monthly-arc',
        h2: 'The monthly arc — what each phase focuses on',
        intro:
          'Vocabulary building, then skills practice, then full tests. The arc applies to all three paths.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Months 1–3: Vocabulary building** — daily spaced repetition on the vocabulary list for your target level; aim for 95% mastery of the target band before moving to skills practice',
              '**Months 3–5: Reading and listening practice** — read Chinese news, articles, and short texts at your target level; listen to Chinese podcasts and news broadcasts; the goal is to build recognition speed and comprehension accuracy',
              '**Months 5–7: Speaking and writing at L3+** — daily speaking recording; timed typed writing prompts; the new components require their own practice arc',
              '**Months 7–8: Full mock tests** — run official HSK 3.0 mock tests under real conditions weekly; calibrate timing, stamina, and microphone/keyboard',
              '**Last 2 weeks before the test: Final review** — light review of vocabulary; no new material; one final mock test; rest the day before the test',
              '**After the test: Score release + application submission** — scores release 2–4 weeks after the test; submit to your target programs as soon as the score is available',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The most efficient prep is consistent daily study rather than weekly marathons. 15 minutes daily for spaced repetition + 30 minutes 3x per week for skills practice outperforms 5-hour weekend sessions on every retention metric.',
          },
        ],
      },
      {
        id: 'prep-materials',
        h2: 'Prep materials — what to use',
        intro:
          'Updated materials only. Pre-2024 prep books cover the 2.0 vocabulary list.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Official HSK 3.0 materials** — published by CLEC; free PDF downloads; the canonical word list + mock tests',
              '**Updated prep books (2024 or later)** — verify publication date; older books cover 2.0 vocabulary',
              '**Spaced-repetition apps** — Anki, Pleco, or Skritter; community-built HSK 3.0 decks; verify against the official list',
              '**Chinese input method practice** — practice typing pinyin and selecting characters on a desktop keyboard; the writing component uses typed input',
              '**Native Chinese content** — podcasts (Chinese Learn, Mandarin Chinese Commentary), news apps (The Initium, Caixin), Chinese Wikipedia; builds listening and reading skills with current vocabulary',
              '**Conversation partners** — language exchange apps (Tandem, HelloTalk), local Chinese community events, university Chinese student networks; builds spontaneous fluency',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How long does HSK 3.0 prep take?',
        a: 'For a learner starting from scratch, plan 9–18 months depending on target level. For a learner starting with HSK 2.0 L2 (basic conversation), targeting HSK 4 in HSK 3.0 takes 3–6 months of focused study. The most efficient prep timeline uses updated 3.0 materials, regular speaking practice, and timed mock tests.',
      },
      {
        q: 'When should I take the test for March 2027 intake?',
        a: 'Target a test date in early November 2026 — this clears the December 13, 2026 HSK 3.0 format switch (which only accepts 3.0 scores) and gives a 2–4 week score release buffer. Most test centers have multiple test dates in October and November 2026; book early as the transition window sees higher demand.',
      },
      {
        q: 'When should I take the test for September 2027 intake?',
        a: 'Target a test date in April or May 2027. The HSK 3.0 format is fully established by then; test centers have rolled out; you have flexibility on test dates. Aim to have your score in hand by June 2027 for application package finalization.',
      },
      {
        q: 'Can I prep for HSK 2.0 instead of 3.0?',
        a: 'No — for March 2027 and later intakes, HSK 3.0 is the only accepted format at new admissions. For September 2026 intake (already closed) and any transition-window admissions, HSK 2.0 scores from before December 13, 2026 may still be accepted by some programs. For new test-takers, prep for 3.0.',
      },
      {
        q: 'What if I miss my target test date?',
        a: 'HSK allows re-takes on the next available test date. If you miss your target date, book the next one immediately — most centers offer multiple test dates per month. Plan a 2–3 month prep cycle between attempts; do not rush a re-take without sufficient prep.',
      },
      {
        q: 'Do I need a Chinese tutor?',
        a: 'For speaking and writing components at L3+, a tutor or advanced conversation partner is highly recommended. For vocabulary and reading/listening practice, self-study with official materials and a spaced-repetition app is sufficient. Most efficient: combine self-study for vocabulary + skills with a tutor for speaking and writing feedback.',
      },
      {
        q: 'How do I find a Chinese conversation partner?',
        a: 'Language exchange apps (Tandem, HelloTalk), local Chinese community events (universities, cultural centers, churches), university Chinese student networks, online tutoring platforms (iTalki, Preply). Practice 2–3 times per week for 30–60 minutes; the spontaneity builds real fluency.',
      },
      {
        q: 'Can I use AI tools like ChatGPT for HSK prep?',
        a: 'Yes — AI tools are useful for vocabulary explanations, example sentences, and grammar clarification. They are less useful for speaking feedback (which requires audio analysis) and writing feedback (which requires composition evaluation). Combine AI tools with a tutor or conversation partner for the components that need real-time feedback.',
      },
    ],
    howToSteps: [
      {
        name: 'Pick your starting point (A, B, or C)',
        text: 'No Chinese yet (Path A), basic Chinese (Path B), or advanced Chinese (Path C). Your starting point determines the prep duration.',
      },
      {
        name: 'Pick your target HSK level',
        text: 'L4 for general undergraduate, L5 for most master\'s, L6 for top programs. Verify the required level on your target program\'s admissions page.',
      },
      {
        name: 'Choose your intake (March or September 2027)',
        text: 'March 2027 has a tighter prep window with the December 13, 2026 format switch. September 2027 has a longer window with HSK 3.0 fully established.',
      },
      {
        name: 'Work backward from your application deadline',
        text: 'For March 2027 intake: target an early November 2026 test date. For September 2027 intake: target an April or May 2027 test date. Plan a 2–3 month prep buffer before each test date.',
      },
      {
        name: 'Follow the monthly arc',
        text: 'Vocabulary building (months 1–3), reading + listening (months 3–5), speaking + writing at L3+ (months 5–7), full mock tests (months 7–8), final review (last 2 weeks).',
      },
      {
        name: 'Study 15 minutes daily + 30 minutes 3x per week',
        text: 'Daily spaced repetition + weekly skills practice outperforms weekly marathons on every retention metric.',
      },
      {
        name: 'Run weekly full mock tests in the final 2 months',
        text: 'Official HSK 3.0 mock tests under real conditions. Calibrate timing, stamina, and microphone/keyboard.',
      },
      {
        name: 'Rest the day before the test',
        text: 'Light review only; no new material; rest. Sleep matters more than last-minute cramming.',
      },
    ],
    ctaTitle: 'Want help building your HSK 3.0 prep timeline?',
    ctaSubtitle:
      'SICA\'s team can map your current Chinese level to an HSK 3.0 prep plan, recommend study resources, and review your application package end-to-end.',
    ctaApplyLabel: 'Book a free 15-minute consultation',
    ctaContactLabel: 'Email SICA admissions',
    related: [
      {
        href: '/hsk-3-vs-hsk-2',
        label: 'HSK 3.0 vs HSK 2.0 — what is changing and when',
        description:
          'The flagship comparison: 6→9 levels, vocabulary shifts, the new speaking and writing components, and the Dec 13, 2026 full format switch.',
      },
      {
        href: '/hsk-3-0-vocabulary-list',
        label: 'HSK 3.0 vocabulary — what is on the list and what dropped',
        description:
          'Per-level word counts, the modern vocab that replaced classical terms, a starter list for each band, and how to build your own study deck.',
      },
      {
        href: '/hsk-3-0-speaking-writing',
        label: 'Speaking and writing in HSK 3.0 — the new components',
        description:
          'The speaking and writing components become scored at L3+. Format, rubrics, computer-based testing, and how to practice.',
      },
    ],
  },
  zh: {
    slug: 'hsk-3-0-prep-timeline',
    eyebrow: '指南 · HSK 3.0 备考时间线',
    title: 'HSK 3.0 备考时间线 — 每个阶段的行动',
    description:
      '按你目前的状态分支:刚刚听说 HSK 3.0、已考过 2.0、或备考中。针对 2027 年 3 月和 9 月入学截止日期排序,每条路径提供月度任务清单。',
    subtitle:
      'HSK 3.0 过渡使备考时机比以往任何时候都更具决定性。2026 年 12 月 13 日格式切换,目标 2027 年 3 月入学的申请者必须备考 3.0;目标 2027 年 9 月入学的申请者必定备考 3.0;中间入学的申请者可以使用更长的备考窗口。本指南为三个起点(零基础、基础中文、高级中文)提供分支备考时间线、每条路径的月度任务清单,以及应驱动考试日期的日历锚点。',
    stats: [
      { value: '3 条路径', label: '按当前水平分支' },
      { value: '2027.3 + 2027.9', label: '入学锚点' },
      { value: '2026.12.13', label: '格式切换' },
      { value: '15 分钟/天', label: '最低学习时间' },
    ],
    quickAnswer:
      '选择你的起点(零基础、基础中文、或高级中文),选择目标等级(L4 用于一般本科、L5 用于多数硕士、L6 用于顶尖项目),然后从申请截止日期向前推算。针对 2027 年 3 月入学:目标 2026 年 10–11 月的考试日期,以便赶在 12 月 13 日切换截止之前完成。针对 2027 年 9 月入学:目标 2027 年 4–5 月的考试日期。每条路径的月度任务清单遵循:词汇构建(第 1–3 月)、阅读与听力练习(第 3–5 月)、L3+ 口语与写作(第 5–7 月)、完整模拟考试(第 7–8 月)、最后复习(考试前 2 周)。',
    keyTakeaways: [
      '选择起点和目标等级,然后从申请截止日期向前推算',
      '针对 2027 年 3 月入学:目标 2026 年 10–11 月的考试日期,以赶在 12 月 13 日切换截止之前完成',
      '针对 2027 年 9 月入学:目标 2027 年 4–5 月的考试日期',
      '每条路径遵循相同的月度弧线:词汇(第 1–3 月)、阅读 + 听力(第 3–5 月)、L3+ 口语 + 写作(第 5–7 月)、完整模拟考试(第 7–8 月)',
      '每日最少 15 分钟用于间隔重复;最后 2 个月每周进行完整模拟考试',
      '最高效的备考使用官方 HSK 3.0 资料,而非 2018 年版的备考书',
    ],
    sections: [
      {
        id: 'pick-your-path',
        h2: '选择起点',
        intro: '基于你当前中文水平的三条备考路径。每条路径遵循相同的月度弧线,但强度不同。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**路径 A — 零基础** — 0 基础学习或会话能力;目标 2027 年 3 月入学达到 L4(12 个月)或 2027 年 9 月入学达到 L5(18 个月)',
              '**路径 B — 基础中文** — 可以进行简单对话,知道约 200 词,能读短文;目标 2027 年 3 月入学达到 L4(6–9 个月)或 2027 年 9 月入学达到 L5(12 个月)',
              '**路径 C — 高级中文** — 已学完 HSK 2.0 L4–L5 词汇,能读新闻,能写基础段落;目标 2027 年 3 月入学达到 L5+(3–6 个月)或 2027 年 9 月入学达到 L6(6–9 个月)',
              '**所有路径** — 每日最少 15 分钟用于间隔重复;最后 2 个月每周进行完整模拟考试',
              '**根据目标项目要求的等级调整** — 在目标项目的招生页面上确认所需的 HSK 等级;因专业差异大于因学校差异',
            ],
          },
        ],
      },
      {
        id: 'march-2027',
        h2: '2027 年 3 月入学 — 4–9 个月备考窗口',
        intro: '赶在 2026 年 12 月 13 日切换截止之前完成的最有效路径。',
        blocks: [
          {
            type: 'table',
            caption: '2027 年 3 月入学备考日历(按起点)',
            columns: ['时间', '路径 A(零基础)', '路径 B(基础)', '路径 C(高级)'],
            rows: [
              ['2026 年 4 月', '开始词汇构建(L1 300 词)', '复习 L1–L2 词汇;映射到 HSK 3.0 列表', '参加 HSK 3.0 诊断测试;识别 L5 差距'],
              ['2026 年 5 月', '继续 L1;开始基础口语练习', '开始 L3 词汇(1,200 词)', '开始 L4 词汇(2,500 词)'],
              ['2026 年 6 月', '完成 L1;开始 L2 词汇(600 词)', '继续 L3;开始阅读练习', '开始 L5 词汇(3,500 词)'],
              ['2026 年 7 月', '完成 L2;开始 L3 词汇', '完成 L3 词汇;开始 L4', '完成 L5 词汇;完整模拟考试'],
              ['2026 年 8 月', '继续 L3;开始听力练习', '开始 L4 阅读 + 听力练习', '开始 L6 词汇(5,000 词)'],
              ['2026 年 9 月', '完成 L3 词汇;开始 L4', '完成 L4 词汇;开始 L5', '完成 L6 词汇;完整模拟考试'],
              ['2026 年 10 月', '进行 HSK 3.0 模拟考试;预订考试日期', '进行 HSK 3.0 模拟考试;预订考试日期', '最终复习;预订考试日期'],
              ['2026 年 11 月', '最终复习 + 参加考试(11 月初)', '最终复习 + 参加考试', '参加考试(11 月初)'],
              ['2026 年 12 月', '成绩公布(2–4 周);提交给项目', '成绩公布;提交给项目', '成绩公布;提交给项目'],
              ['2027 年 1–2 月', '申请材料最终确定', '申请材料最终确定', '申请材料最终确定'],
              ['2027 年 3 月', '入学', '入学', '入学'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '2027 年 3 月入学申请者最常见的错误:预订 2026 年 12 月的考试日期但错过切换截止。如果你在备考 2027 年 3 月入学,目标 2026 年 11 月初的考试日期 — 这为 2026 年 12 月 13 日切换截止前的成绩公布留出 2–4 周缓冲。',
          },
        ],
      },
      {
        id: 'september-2027',
        h2: '2027 年 9 月入学 — 8–14 个月备考窗口',
        intro: '更长的备考窗口,HSK 3.0 完全建立。考试日期选择更灵活。',
        blocks: [
          {
            type: 'table',
            caption: '2027 年 9 月入学备考日历(按起点,HSK 3.0 完全建立,考点已全面铺开)',
            columns: ['时间', '路径 A(零基础)', '路径 B(基础)', '路径 C(高级)'],
            rows: [
              ['2026 年 7 月', '开始词汇构建(L1 300 词)', '复习 L1–L2 词汇;映射到 HSK 3.0 列表', '参加 HSK 3.0 诊断;识别差距'],
              ['2026 年 8 月', '继续 L1;开始基础口语练习', '开始 L3 词汇(1,200 词)', '开始 L5 词汇(3,500 词)'],
              ['2026 年 9 月', '完成 L1;开始 L2 词汇', '继续 L3;开始阅读练习', '开始 L6 词汇(5,000 词)'],
              ['2026 年 10 月', '完成 L2;开始 L3 词汇', '完成 L3 词汇;开始 L4', '完成 L6 词汇;模拟考试'],
              ['2026 年 11 月', '继续 L3;如准备好可参加 12 月考试', '完成 L4 词汇;模拟考试', '完整模拟考试'],
              ['2026 年 12 月', 'HSK 3.0 完全格式切换 — 如准备好可参加考试', '参加 HSK 3.0(12 月考试窗口)', '参加 HSK 3.0'],
              ['2027 年 1–2 月', '继续备考;必要时重考', '继续备考;必要时重考', '继续备考;必要时重考'],
              ['2027 年 3 月', '继续备考;如需要可第二次尝试', '继续备考', '继续备考'],
              ['2027 年 4 月', '最终复习;预订 5 月考试日期', '最终复习;预订 5 月考试日期', '最终复习;预订 5 月考试日期'],
              ['2027 年 5 月', '参加考试', '参加考试', '参加考试'],
              ['2027 年 6–8 月', '申请材料最终确定', '申请材料最终确定', '申请材料最终确定'],
              ['2027 年 9 月', '入学', '入学', '入学'],
            ],
          },
        ],
      },
      {
        id: 'monthly-arc',
        h2: '月度弧线 — 每个阶段的重点',
        intro: '词汇构建,然后技能练习,然后完整考试。弧线适用于所有三条路径。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1–3 月:词汇构建** — 每日间隔重复目标等级的词汇列表;目标等级段 95% 掌握率后再进入技能练习',
              '**第 3–5 月:阅读与听力练习** — 阅读中文新闻、文章和目标等级的短文;听中文播客和新闻广播;目标是建立识别速度和理解准确性',
              '**第 5–7 月:L3+ 口语与写作** — 每日口语录音;限时键入写作提示;新部分需要自己的练习弧线',
              '**第 7–8 月:完整模拟考试** — 在真实条件下每周进行官方 HSK 3.0 模拟考试;校准时间、耐力和麦克风/键盘',
              '**考试前 2 周:最终复习** — 词汇轻量复习;无新材料;一次最终模拟考试;考试前一天休息',
              '**考试后:成绩公布 + 申请提交** — 成绩在考试后 2–4 周公布;成绩一公布立即提交给目标项目',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '最高效的备考是持续的每日学习,而不是每周的马拉松。每日 15 分钟间隔重复 + 每周 3 次 30 分钟技能练习,在每个记忆指标上都优于每周 5 小时的突击。',
          },
        ],
      },
      {
        id: 'prep-materials',
        h2: '备考资料 — 使用什么',
        intro: '仅使用更新后的资料。2024 年前的备考书涵盖的是 2.0 词汇列表。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**官方 HSK 3.0 资料** — 由 CLEC 发布;免费 PDF 下载;权威词表 + 模拟考试',
              '**更新后的备考书(2024 年或以后)** — 验证出版日期;旧书涵盖 2.0 词汇',
              '**间隔重复应用** — Anki、Pleco 或 Skritter;社区构建的 HSK 3.0 卡组;请与官方列表核对',
              '**中文输入法练习** — 在桌面键盘上练习键入拼音和选择汉字;写作部分使用键入输入',
              '**母语中文内容** — 播客(中文学习、普通话评论)、新闻应用(端传媒、财新)、中文维基百科;用当代词汇建立听力和阅读技能',
              '**对话伙伴** — 语言交换应用(Tandem、HelloTalk)、当地华人社区活动、大学中国学生网络;建立自发流利度',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'HSK 3.0 备考需要多长时间?',
        a: '对于从零开始的申请者,根据目标等级需要 9–18 个月。对于已有 HSK 2.0 L2(基础对话)水平的申请者,目标 HSK 3.0 L4 需要 3–6 个月的专注学习。最高效的备考时间线使用更新后的 3.0 资料、定期口语练习和限时模拟考试。',
      },
      {
        q: '2027 年 3 月入学我应该何时参加考试?',
        a: '目标 2026 年 11 月初的考试日期 — 这赶在 2026 年 12 月 13 日的 HSK 3.0 格式切换截止之前(只接受 3.0 成绩),并为成绩公布留出 2–4 周的缓冲。多数考点在 2026 年 10 月和 11 月有多个考试日期;由于过渡窗口期内需求较高,请尽早预订。',
      },
      {
        q: '2027 年 9 月入学我应该何时参加考试?',
        a: '目标 2027 年 4 月或 5 月的考试日期。HSK 3.0 格式届时已完全建立;考点已全面铺开;你对考试日期的选择更灵活。目标 2027 年 6 月前拿到成绩,以便进行申请材料的最终确定。',
      },
      {
        q: '我可以备考 HSK 2.0 而不是 3.0 吗?',
        a: '不能 — 对于 2027 年 3 月及之后的入学,HSK 3.0 是新录取中唯一被接受的格式。对于 2026 年 9 月入学(已截止)和任何过渡窗口期内的录取,2026 年 12 月 13 日之前的 HSK 2.0 成绩仍可能被部分项目接受。对于新考生,备考 3.0。',
      },
      {
        q: '如果错过目标考试日期怎么办?',
        a: 'HSK 允许在下一个可用考试日期重考。如果错过目标日期,立即预订下一个 — 多数考点每月提供多个考试日期。规划重考之间 2–3 个月的备考周期;没有充分准备不要匆忙重考。',
      },
      {
        q: '我需要中文家教吗?',
        a: '对于 L3+ 的口语和写作部分,家教或高级对话伙伴强烈推荐。对于词汇和阅读/听力练习,使用官方资料和间隔重复应用的自学已足够。最高效的方法:词汇和技能自学 + 口语和写作反馈的家教相结合。',
      },
      {
        q: '如何找到中文对话伙伴?',
        a: '语言交换应用(Tandem、HelloTalk)、当地华人社区活动(大学、文化中心、教会)、大学中国学生网络、在线辅导平台(iTalki、Preply)。每周练习 2–3 次,每次 30–60 分钟;自发性建立真实流利度。',
      },
      {
        q: '我可以使用 ChatGPT 等 AI 工具进行 HSK 备考吗?',
        a: '可以 — AI 工具对词汇解释、例句和语法澄清有用。对口语反馈(需要音频分析)和写作反馈(需要作文评估)用处较小。将 AI 工具与家教或对话伙伴结合,用于需要实时反馈的部分。',
      },
    ],
    howToSteps: [
      {
        name: '选择起点(A、B 或 C)',
        text: '零基础(路径 A)、基础中文(路径 B)或高级中文(路径 C)。你的起点决定备考时长。',
      },
      {
        name: '选择目标 HSK 等级',
        text: 'L4 用于一般本科,L5 用于多数硕士,L6 用于顶尖项目。在目标项目的招生页面上确认所需等级。',
      },
      {
        name: '选择入学时间(2027 年 3 月或 9 月)',
        text: '2027 年 3 月有更紧张的备考窗口,涉及 2026 年 12 月 13 日格式切换。2027 年 9 月有更长的窗口,HSK 3.0 已完全建立。',
      },
      {
        name: '从申请截止日期向前推算',
        text: '针对 2027 年 3 月入学:目标 2026 年 11 月初的考试日期。针对 2027 年 9 月入学:目标 2027 年 4 月或 5 月的考试日期。每次考试前规划 2–3 个月的备考缓冲。',
      },
      {
        name: '遵循月度弧线',
        text: '词汇构建(第 1–3 月)、阅读 + 听力(第 3–5 月)、L3+ 口语 + 写作(第 5–7 月)、完整模拟考试(第 7–8 月)、最终复习(最后 2 周)。',
      },
      {
        name: '每天学习 15 分钟 + 每周 3 次 30 分钟',
        text: '每日间隔重复 + 每周技能练习在每个记忆指标上都优于每周突击。',
      },
      {
        name: '最后 2 个月每周进行完整模拟考试',
        text: '官方 HSK 3.0 模拟考试在真实条件下。校准时间、耐力和麦克风/键盘。',
      },
      {
        name: '考试前一天休息',
        text: '仅轻量复习;无新材料;休息。睡眠比考前临时抱佛脚更重要。',
      },
    ],
    ctaTitle: '需要帮忙构建 HSK 3.0 备考时间线?',
    ctaSubtitle:
      'SICA 团队可以将你当前的中文水平映射到 HSK 3.0 备考计划,推荐学习资源,并对你的整套申请材料进行端到端审核。',
    ctaApplyLabel: '预约免费 15 分钟咨询',
    ctaContactLabel: '邮件联系 SICA 招生',
    related: [
      {
        href: '/hsk-3-vs-hsk-2',
        label: 'HSK 3.0 与 2.0 — 变化内容与时间表',
        description:
          '旗舰对比:6→9 等级、词汇变化、新增口语和写作部分,以及 2026 年 12 月 13 日全部格式切换。',
      },
      {
        href: '/hsk-3-0-vocabulary-list',
        label: 'HSK 3.0 词汇 — 列表内容与变化',
        description:
          '各级词汇量、被现代词汇替换的古典词汇、每个等级段的入门列表,以及如何从官方 2025 大纲自主构建学习卡组。',
      },
      {
        href: '/hsk-3-0-speaking-writing',
        label: 'HSK 3.0 口语与写作 — 新增部分',
        description:
          '口语和写作部分在 L3+ 成为计分项。格式、评分标准、机考,以及练习方法。',
      },
    ],
  },
};
