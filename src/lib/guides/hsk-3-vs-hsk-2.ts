import type { LocalizedGuide } from './types';

/**
 * "HSK 3.0 vs HSK 2.0" — Phase 122, Batch 2 (HSK 3.0), article #1
 * of the new study-in-china expansion cluster.
 * Target queries: "hsk 3.0 vs 2.0", "new hsk 2026", "hsk change",
 * "hsk 改革", "hsk level change", "what's the new hsk".
 *
 * Static content. HSK 3.0 numbers (vocabulary counts, dates,
 * format rules) are flagged as "as published in the 2025 revised
 * standard; subject to update per cycle" — the rollout is live and
 * is the most likely drift surface in the whole cluster.
 */
export const hsk3VsHsk2Guide: LocalizedGuide = {
  en: {
    slug: 'hsk-3-vs-hsk-2',
    eyebrow: 'GUIDE · HSK 3.0 TRANSITION',
    title: 'HSK 3.0 vs HSK 2.0 — what is changing and when',
    description:
      'The new HSK 3.0 syllabus became the official standard in July 2026; the full format switch is December 13, 2026. This guide explains the six-to-nine level shift, the vocabulary cuts at levels 1–5, the new speaking and writing components, and what current prep materials are out of date.',
    subtitle:
      'HSK 3.0 is the most consequential update to the Chinese proficiency test since its launch in 1984. The shift from a six-level to a nine-level scale, the vocabulary reductions at the lower levels, and the new speaking and writing components change which materials to use, which prep timelines to plan against, and which test centers to look for. Candidates searching "HSK 3.0" today still land on the existing /guides/hsk which describes the 2.0 syllabus — that page is the single most out-of-date SEO liability on the SICA domain.',
    stats: [
      { value: '6 → 9', label: 'Levels' },
      { value: 'Dec 13, 2026', label: 'Full format switch' },
      { value: '–40% to –60%', label: 'Vocab at L1–L5' },
      { value: 'New', label: 'Speaking + writing' },
    ],
    quickAnswer:
      'HSK 3.0 is the official revised syllabus, adopted July 2026, with the full format switch on December 13, 2026. The number of levels goes from 6 to 9 (three new "upper-intermediate" levels: 7–9). Vocabulary targets at the lower levels drop 40–60% — HSK 2.0 L1 required 150 words; HSK 3.0 L1 requires 300 but covers the same practical ground with a more modern lexicon. Speaking and writing are new scored components at levels 3 and above. Computer-based testing is the default. If your application deadline is before March 2027, you can still take the 2.0-aligned format in transition windows; if it is March 2027 or later, prep for 3.0.',
    keyTakeaways: [
      'HSK 3.0 is official since July 2026; the full format switch is December 13, 2026',
      'Levels go from 6 to 9 — three new upper-intermediate bands (L7, L8, L9) bridge the gap to advanced academic Chinese',
      'Vocabulary at L1–L5 drops 40–60% — HSK 3.0 L1 = 300 words covering the same practical ground as HSK 2.0 L1 (150 words) with more modern terms',
      'Speaking and writing become scored components at L3+ — no handwriting requirement until L5',
      'Computer-based testing is the default; paper tests only at designated centers and on limited dates',
      'For March 2027 intake: prep for 3.0. For Sept 2026 / transition intakes: either format accepted through the transition window',
    ],
    sections: [
      {
        id: 'what-changed',
        h2: 'What actually changed in HSK 3.0',
        intro:
          'Five structural shifts, all working together to make the new test a better measure of real-world Chinese ability.',
        blocks: [
          {
            type: 'p',
            text: 'The Chinese Ministry of Education — via the Chinese International Education Confederation and the Center for Language Education and Cooperation (CLEC, formerly Hanban) — published the revised HSK syllabus in 2024, ran a parallel "transitional" testing window through 2025, declared the new syllabus the official standard in July 2026, and committed to the full format switch on December 13, 2026. Between those dates, both the 2.0 and 3.0 formats were accepted; after December 13, 2026, only the 3.0 format counts toward new admissions.',
          },
          {
            type: 'ol',
            items: [
              '**Six to nine levels** — three new bands (L7 "advanced", L8 "near-native operational", L9 "academic-native") bridge the gap between the previous L6 (high intermediate) and what used to be the HSKK advanced exam. Most international applicants need L4–L6 for undergraduate or master\'s admissions, depending on the program.',
              '**Vocabulary reductions at L1–L5** — the single biggest practical change. Modern Chinese language use is captured with fewer classical and literary words; the new lists emphasize everyday, professional, and academic vocabulary. L1 jumps from 150 words to 300 but the practical coverage is comparable because the new list is more efficient.',
              '**Speaking and writing are scored at L3+** — previously only listening and reading were scored. The new components use recorded audio (speaking) and typed input (writing) — no handwriting until L5. Computer-based testing is the default delivery mode.',
              '**Computer-based default** — paper tests only at designated centers and limited dates. Most international test centers are now computer-equipped; remote proctoring is available at some locations.',
              '**Updated cultural and topical coverage** — the vocabulary list and reading passages reflect post-2020 usage including digital communication, professional email, and current idiom. Older prep books (2018 and earlier) cover vocabulary that no longer appears on the test.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The vocabulary list was rebuilt from scratch using corpus analysis of contemporary Chinese (news, academic, professional, social media). Words that appeared frequently but rarely outside classical / literary contexts were dropped; words that appear frequently in contemporary usage were added. The result: L1 vocabulary is 300 words instead of 150, but you can read the same practical signs, menus, and short messages.',
          },
        ],
      },
      {
        id: 'level-by-level',
        h2: 'Level-by-level — what each band means now',
        intro:
          'HSK 3.0 levels 1–3 cover the same ground as HSK 2.0 levels 1–3; levels 4–6 are roughly equivalent; levels 7–9 are new.',
        blocks: [
          {
            type: 'table',
            caption: 'HSK 3.0 level bands and typical use case (vocabulary counts as published in the 2025 revised standard; verify against official sources each cycle)',
            columns: ['Level', 'Vocab', 'Typical use case'],
            rows: [
              ['L1', '300', 'Survival Chinese — greetings, directions, ordering food, basic signs. Equivalent practical coverage to old HSK 2.0 L1.'],
              ['L2', '600', 'Everyday conversation, simple workplace interactions. Often the minimum for short study-abroad programs.'],
              ['L3', '1,200', 'Sustained conversation, basic reading of news, simple writing. The typical minimum for non-language-track undergraduate programs.'],
              ['L4', '2,500', 'Academic listening, extended reading, structured writing. The most common target for general undergraduate admissions.'],
              ['L5', '3,500', 'Academic reading across disciplines, argumentative writing, nuanced listening. Common for top-tier programs and most master\'s admissions.'],
              ['L6', '5,000', 'Near-native operational fluency. Required for academic-track master\'s and most PhD programs.'],
              ['L7', '7,000+', 'Advanced academic — journal articles, formal presentations. Required for some research-track programs.'],
              ['L8', '9,000+', 'Near-academic-native. Disciplinary depth.'],
              ['L9', '11,000+', 'Academic-native. Disciplinary command across genres.'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Most Chinese university programs require HSK 4 for general undergraduate study, HSK 5 for master\'s, and HSK 6 for top programs and PhD work. The new L7–L9 bands are for academic and research tracks; day-to-day operational fluency is established at L6. Verify each program\'s required level — it varies more by program than by institution.',
          },
        ],
      },
      {
        id: 'transition-window',
        h2: 'The transition window — what to take and when',
        intro:
          'Both formats were accepted through 2026; after December 13, 2026, only HSK 3.0 counts.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**September 2026 intake (already closed)** — both formats accepted; HSK 2.0 scores from this cycle are still valid for admission',
              '**March 2027 intake** — applicants must take HSK 3.0; 2.0 scores no longer accepted at the December 2026 cutover and beyond',
              '**September 2027 intake and later** — HSK 3.0 only',
              '**Score validity** — HSK scores are valid for two years from the test date; older scores may need to be re-tested under the new syllabus',
              '**Conditional admits** — some universities issue conditional admission letters pending HSK 3.0 submission; check with the international office for the deadline',
              '**Phased rollouts** — some provinces and individual universities are running their own transition windows; confirm with your target program\'s international admissions office',
            ],
          },
        ],
      },
      {
        id: 'what-stayed-the-same',
        h2: 'What stayed the same',
        intro:
          'Not everything changed. The familiar structure of the exam — and the way scores map to admissions — is largely preserved.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Score range** — still 0–300 per section, 0–900 total',
              '**Validity window** — still 2 years from the test date',
              '**Test centers** — same international network; same registration portal (registration.hsk.org or via the Chinese Education Examination Authority portal)',
              '**Admissions mapping** — most universities have published mapping tables for 2.0 → 3.0 scores; the conversion is roughly L4(2.0) ≈ L4(3.0) at the high-pass band, with minor adjustments at L5–L6',
              '**Recognition** — same set of accepting institutions globally (the HSK is recognized by 80+ countries and 1,200+ universities outside China)',
            ],
          },
        ],
      },
      {
        id: 'what-this-means',
        h2: 'What this means for your application',
        intro:
          'Three practical adjustments if you are applying between now and Sept 2027.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check your target program\'s required level and accepted test cycle** — admissions pages typically post both HSK level and the test cycle window they accept',
              '**If you already have an HSK 2.0 score** — confirm whether your target program will accept it for the cycle you are applying to; some universities will still accept 2.0 scores through 2027 admissions for older intakes',
              '**If you have not taken HSK yet** — start with HSK 3.0 prep; the new materials are more efficient and the format is the only one that will count for 2027+ admissions',
              '**Confirm test centers near you** — most international centers offer the 3.0 format from late 2026; remote proctoring is available at some locations for added flexibility',
              '**For transition applicants (March 2027 intake)** — book your test slot early; the transition window sees higher demand and earlier centers fill up',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If your prep materials are dated 2018 or earlier, the vocabulary list has changed substantially. The reading passages, the speaking prompts, and the writing tasks also reflect contemporary Chinese. Investing in updated prep saves months of wasted study.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is HSK 3.0 harder than HSK 2.0?',
        a: 'HSK 3.0 is designed to be a fairer test of real-world Chinese ability, not a harder one. The vocabulary targets at L1–L5 are lower in absolute number, but the speaking and writing components are new scored sections at L3+. The perceived difficulty depends on your strengths: if your listening and reading were already strong, HSK 3.0 may feel easier; if speaking and writing are weaker, HSK 3.0 will require new practice.',
      },
      {
        q: 'Can I still take HSK 2.0 after December 13, 2026?',
        a: 'No — after December 13, 2026, the 2.0 format is no longer administered. Universities will accept 2.0 scores from before that date for some transition admissions, but new test-takers must take the 3.0 format.',
      },
      {
        q: 'What is a good HSK score for university admissions?',
        a: 'Most Chinese university programs require HSK 4 for general undergraduate study, HSK 5 for master\'s programs, and HSK 6 for top programs and PhD work. Some programs accept HSK 3 with conditional admission and require HSK 4 by the end of the first year. The exact level varies by program and institution — check the international admissions page for your target program.',
      },
      {
        q: 'How long does HSK 3.0 prep take?',
        a: 'For a learner starting from HSK 2.0 L2 (basic conversation), targeting HSK 4 in HSK 3.0 takes 3–6 months of focused study. For a learner starting from scratch, plan 9–18 months depending on target level. The most efficient prep timeline uses updated 3.0 materials, regular speaking practice, and timed mock tests.',
      },
      {
        q: 'Are HSK scores valid for graduate school?',
        a: 'Yes — HSK scores are valid for two years from the test date. For graduate admissions, most programs require HSK 5 or 6; some research-track programs require L7+. Plan your test date accordingly — too early and your score expires before you finish the application.',
      },
      {
        q: 'Where can I take HSK 3.0 outside China?',
        a: 'The international HSK test center network covers 80+ countries. Most major cities have at least one center; some offer computer-based testing and remote proctoring. Registration is through the official HSK portal (registration.hsk.org) or via local partner institutions. Verify the center offers the 3.0 format before booking.',
      },
      {
        q: 'Will universities accept HSK 3.0 scores immediately?',
        a: 'Yes — the HSK 3.0 syllabus is the official standard from July 2026, and all accepting institutions have published mapping tables for 2.0 → 3.0 scores. If you are applying between now and March 2027, confirm with your target program whether they will accept a 2.0 score from before the cutover or require 3.0.',
      },
      {
        q: 'What is the difference between HSK and HSKK?',
        a: 'HSK is the standard Chinese proficiency test with six levels (2.0) or nine levels (3.0). HSKK is the older speaking and writing test that was previously a separate exam — in HSK 3.0, the speaking and writing components are integrated into the main HSK at levels 3 and above. HSKK is no longer administered as a standalone test under HSK 3.0.',
      },
    ],
    howToSteps: [
      {
        name: 'Check your target program\'s required HSK level',
        text: 'Look at the international admissions page for your top 3 programs. Most list the required HSK level + the test cycle window they accept (e.g., "HSK 4 within 2 years of application").',
      },
      {
        name: 'Map your current level to HSK 3.0',
        text: 'If you have an HSK 2.0 score, the university mapping table will tell you the equivalent HSK 3.0 level. If you have not taken HSK, the official self-assessment quiz on the HSK portal places you in roughly the right band.',
      },
      {
        name: 'Pick updated prep materials',
        text: 'Use prep materials published in 2024 or later. The vocabulary list, reading passages, and speaking prompts all reflect the 2025 revised standard; older prep books cover vocabulary that no longer appears on the test.',
      },
      {
        name: 'Build a study plan around your application deadline',
        text: 'Work backward from your deadline: aim to sit the test 2–3 months before your application is due (the score takes 2–4 weeks to release). For most March 2027 intakes, target a test date in October–November 2026 to clear the December 13, 2026 cutover.',
      },
      {
        name: 'Register at a center that offers HSK 3.0',
        text: 'Confirm the center offers the 3.0 format before booking. Most international centers switched to 3.0 in late 2026; some still offer 2.0 in the transition window through December 2026.',
      },
      {
        name: 'Take a timed mock test 1 week before',
        text: 'A timed mock test under real conditions reveals pacing issues. The computer-based format is the default — practice on a desktop with the same interface the real test uses.',
      },
      {
        name: 'Submit the score to your target programs',
        text: 'Most programs accept self-reported scores during the application phase, with verification at the admissions stage. Confirm each program\'s policy; some require direct submission from the test center.',
      },
      {
        name: 'Plan for re-takes if needed',
        text: 'HSK allows re-takes on the next available test date. If your first attempt misses the target level, plan for a re-take 2–3 months later (the typical prep cycle between attempts).',
      },
    ],
    ctaTitle: 'Need help timing your HSK prep around your application?',
    ctaSubtitle:
      'SICA\'s admissions team can map your current Chinese level to HSK 3.0, recommend a prep timeline against your target intake, and review your application package end-to-end.',
    ctaApplyLabel: 'Book a free 15-minute consultation',
    ctaContactLabel: 'Email SICA admissions',
    related: [
      {
        href: '/guides/hsk',
        label: 'HSK preparation guide (legacy 2.0 content — keep for reference)',
        description:
          'The original HSK preparation guide covers 2.0 prep tactics; useful if you have a 2.0 score from before the cutover.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — the new mandatory Chinese test for international applicants',
        description:
          'CSCA (China Scholastic Competency Assessment) became mandatory for international bachelor\'s applicants from the 2026 intake; overlaps with HSK in the application package.',
      },
      {
        href: '/english-taught-programs-china',
        label: 'English-taught programs in China — the 300+ university ETP catalog',
        description:
          'For applicants prioritizing English-medium instruction, the ETP catalog includes 300+ universities across disciplines; HSK requirements are often lower for these programs.',
      },
    ],
  },
  zh: {
    slug: 'hsk-3-vs-hsk-2',
    eyebrow: '指南 · HSK 3.0 过渡',
    title: 'HSK 3.0 与 2.0 — 变化内容与时间表',
    description:
      'HSK 3.0 已于 2026 年 7 月正式成为官方标准,12 月 13 日完成全部格式切换。本文解读六级到九级的转变、L1–L5 词汇量的削减、新增的口语与写作部分、以及现行备考资料的过时之处。',
    subtitle:
      'HSK 3.0 是 1984 年 HSK 推出以来最重大的更新。从六级到九级的扩展、L1–L5 词汇量的削减、新增的口语和写作部分,共同改变了应使用的备考资料、备考时间线、以及应寻找的考点。仍在搜索"HSK 3.0"的考生目前会进入现有的 /guides/hsk 页面 — 该页面介绍的仍是 2.0 内容,是 SICA 域名上最过时的 SEO 隐患。',
    stats: [
      { value: '6 → 9', label: '等级数' },
      { value: '2026.12.13', label: '全部格式切换' },
      { value: '–40% ~ –60%', label: 'L1–L5 词汇量' },
      { value: '新增', label: '口语 + 写作' },
    ],
    quickAnswer:
      'HSK 3.0 是官方修订大纲,2026 年 7 月正式采用,2026 年 12 月 13 日完成全部格式切换。等级数从 6 增至 9(新增 7–9 三个"高中级"等级)。L1–L5 词汇量减少 40–60% — HSK 2.0 L1 要求 150 词,HSK 3.0 L1 要求 300 词,但用更现代的词汇覆盖相同的实际场景。L3 及以上新增口语和写作计分部分。机考为默认。若申请截止日期在 2027 年 3 月之前,可参加过渡期内的 2.0 格式考试;若在 2027 年 3 月及之后,需备考 3.0。',
    keyTakeaways: [
      'HSK 3.0 自 2026 年 7 月起为官方标准;2026 年 12 月 13 日完成全部格式切换',
      '等级数从 6 增至 9 — 新增三个高级阶段(L7、L8、L9),衔接原 L6 与学术中文之间的过渡',
      'L1–L5 词汇量减少 40–60% — HSK 3.0 L1 = 300 词,但用更现代词汇覆盖与 HSK 2.0 L1(150 词)相同的实际场景',
      'L3 及以上新增口语与写作计分部分 — L5 及以下不要求手写',
      '机考为默认;纸笔考试仅在指定考点和限定日期提供',
      '针对 2027 年 3 月入学:备考 3.0。针对 2026 年 9 月 / 过渡期入学:两种格式在过渡窗口期内均可接受',
    ],
    sections: [
      {
        id: 'what-changed',
        h2: 'HSK 3.0 实际改变了什么',
        intro: '五项结构性变化,共同让新考试成为对真实中文能力更好的衡量。',
        blocks: [
          {
            type: 'p',
            text: '中国教育部 — 通过中国国际中文教育协会和中外语言交流合作中心(原汉办) — 于 2024 年发布修订版 HSK 大纲,2025 年开设平行"过渡期"考试窗口,2026 年 7 月宣布新大纲为官方标准,并承诺 2026 年 12 月 13 日完成全部格式切换。在这两个日期之间,2.0 与 3.0 格式均可接受;2026 年 12 月 13 日之后,只有 3.0 格式计入新的录取审核。',
          },
          {
            type: 'ol',
            items: [
              '**六级到九级** — 新增三个高级阶段(L7"高级"、L8"近母语操作"、L9"学术母语"),衔接原 L6(高级中级)与原 HSKK 高级考试之间。多数国际申请者本科或硕士入学需要 L4–L6,具体取决于专业。',
              '**L1–L5 词汇量削减** — 单一最大的实际变化。新列表强调日常、专业和学术词汇,减少古典和文学词汇。L1 词汇从 150 词增至 300 词,但实际覆盖范围相近,因为新列表更高效。',
              '**L3 及以上新增口语与写作计分部分** — 此前仅听力和阅读计分。新部分使用录音(口语)和键盘输入(写作)— L5 及以下不要求手写。机考为默认模式。',
              '**机考默认** — 纸笔考试仅在指定考点和限定日期提供。多数国际考点已配备机考设备;部分考点提供远程监考。',
              '**文化和主题内容更新** — 词汇列表和阅读材料反映 2020 年后的用法,包括数字通信、专业邮件和当前习语。旧版备考书(2018 年及以前)涵盖的词汇已不再出现在考试中。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '词汇列表完全基于当代中文语料分析(新闻、学术、专业、社交媒体)重建。频繁出现但仅在古典 / 文学语境中使用的词汇被剔除;在当代用法中频繁出现的词汇被加入。结果是:L1 词汇量为 300 词而非 150 词,但你能读懂相同的实用标识、菜单和简短消息。',
          },
        ],
      },
      {
        id: 'level-by-level',
        h2: '逐级解读 — 每个等级段的含义',
        intro: 'HSK 3.0 L1–L3 覆盖与 HSK 2.0 L1–L3 相同的范围;L4–L6 大致对应;L7–L9 为新增。',
        blocks: [
          {
            type: 'table',
            caption: 'HSK 3.0 等级段与典型用途(词汇量按 2025 修订标准公布;每周期根据官方来源核对)',
            columns: ['等级', '词汇量', '典型用途'],
            rows: [
              ['L1', '300', '生存中文 — 问候、问路、点餐、基本标识。与旧 HSK 2.0 L1 实际覆盖范围相近。'],
              ['L2', '600', '日常对话、简单工作场所互动。常作为短期交换项目的最低要求。'],
              ['L3', '1,200', '持续对话、阅读基础新闻、简单写作。非语言专业本科课程的常见最低要求。'],
              ['L4', '2,500', '学术听力、扩展阅读、结构化写作。一般本科入学最常见的目标等级。'],
              ['L5', '3,500', '跨学科学术阅读、论证写作、细致听力。顶尖本科和多数硕士入学的常见要求。'],
              ['L6', '5,000', '近母语操作流利度。学术型硕士和多数博士项目的要求。'],
              ['L7', '7,000+', '高级学术 — 期刊文章、正式演讲。某些研究型项目的要求。'],
              ['L8', '9,000+', '近学术母语。学科深度。'],
              ['L9', '11,000+', '学术母语。跨学科跨文体的掌握。'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '多数中国大学本科一般要求 HSK 4,硕士要求 HSK 5,顶尖项目和博士要求 HSK 6。新的 L7–L9 等级面向学术和研究轨道;日常操作流利度在 L6 已建立。每个项目要求的具体等级因专业差异大于因学校差异 — 请核对目标项目要求。',
          },
        ],
      },
      {
        id: 'transition-window',
        h2: '过渡窗口 — 何时考哪种',
        intro: '2026 年内两种格式均可接受;2026 年 12 月 13 日之后,只有 HSK 3.0 计入审核。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**2026 年 9 月入学(已截止)** — 两种格式均可接受;本轮获得的 HSK 2.0 成绩在录取审核中仍然有效',
              '**2027 年 3 月入学** — 申请者必须参加 HSK 3.0;2.0 成绩在 2026 年 12 月过渡截止后不再被接受',
              '**2027 年 9 月及之后入学** — 仅 HSK 3.0',
              '**成绩有效期** — HSK 成绩自考试之日起两年有效;旧成绩在新大纲下可能需要重考',
              '**条件录取** — 部分大学发放条件录取通知书,要求后续补交 HSK 3.0 成绩;请与国际办公室确认截止日期',
              '**分阶段推进** — 部分省份和个别大学有自己的过渡窗口;请与目标项目的国际招生办公室确认',
            ],
          },
        ],
      },
      {
        id: 'what-stayed-the-same',
        h2: '保持不变的部分',
        intro: '并非一切都变了。考试的整体结构和成绩与录取的对应关系基本保持。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**分数范围** — 仍然各部分 0–300,总分 0–900',
              '**有效期** — 仍然为考试之日起两年',
              '**考点** — 同一国际网络;同一报名渠道(registration.hsk.org 或中国教育考试院官网)',
              '**录取映射** — 多数大学已公布 2.0 → 3.0 成绩映射表;转换大致为 L4(2.0) ≈ L4(3.0) 的高分段,L5–L6 有细微调整',
              '**认可范围** — 同一全球接受机构集合(HSK 被全球 80 多个国家和 1,200 多所大学认可)',
            ],
          },
        ],
      },
      {
        id: 'what-this-means',
        h2: '对你的申请意味着什么',
        intro: '三个实际调整建议,适用于现在到 2027 年 9 月之间申请的申请者。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**核对目标项目要求的 HSK 等级和接受的考试周期** — 招生页面通常同时列出 HSK 等级和接受的考试周期窗口(例如"近两年内的 HSK 4")',
              '**如果你已有 HSK 2.0 成绩** — 与目标项目确认该轮申请是否接受 2.0 成绩;部分大学对 2027 年之前的入学申请仍接受 2.0',
              '**如果你尚未参加过 HSK** — 直接开始 HSK 3.0 备考;新教材更高效,且 3.0 格式是 2027 年以后申请唯一被接受的格式',
              '**确认考点** — 多数国际考点在 2026 年底已切换至 3.0 格式;部分考点提供远程监考以增加灵活性',
              '**针对过渡期申请者(2027 年 3 月入学)** — 尽早预订考试名额;过渡窗口期内需求较高,考点提前满额',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '如果你的备考资料是 2018 年或更早的版本,词汇列表已发生重大变化。阅读材料、口语提示和写作任务也反映了当代中文。投资更新的备考资料可节省数月浪费的学习时间。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'HSK 3.0 比 HSK 2.0 难吗?',
        a: 'HSK 3.0 旨在成为对真实中文能力更公平的测试,而非更难的测试。L1–L5 的词汇量绝对值下降,但 L3 及以上新增口语和写作计分部分。感知难度取决于你的强项:如果听力和阅读已经很强,HSK 3.0 可能感觉更简单;如果口语和写作较弱,HSK 3.0 需要新的练习。',
      },
      {
        q: '2026 年 12 月 13 日之后还能考 HSK 2.0 吗?',
        a: '不能 — 2026 年 12 月 13 日之后,2.0 格式不再提供考试。大学对在此日期之前获得的 2.0 成绩,在部分过渡期录取中可能仍然接受,但新考生必须参加 3.0 格式。',
      },
      {
        q: '大学入学 HSK 多少分算好?',
        a: '多数中国大学本科一般要求 HSK 4,硕士要求 HSK 5,顶尖项目和博士要求 HSK 6。部分项目接受 HSK 3 条件录取,并要求第一学年末达到 HSK 4。具体等级因专业和学校差异较大 — 请查看目标项目的国际招生页面。',
      },
      {
        q: 'HSK 3.0 备考需要多长时间?',
        a: '从 HSK 2.0 L2(基础对话)起步,目标 HSK 4,需要 3–6 个月的专注学习。从零起步,根据目标等级需要 9–18 个月。最有效的备考时间线采用更新的 3.0 资料、定期口语练习和限时模拟考试。',
      },
      {
        q: 'HSK 成绩对研究生申请有效吗?',
        a: '有效 — HSK 成绩自考试之日起两年内有效。对于研究生入学,多数项目要求 HSK 5 或 6;部分研究型项目要求 L7+。相应规划考试日期 — 过早则成绩在完成申请前过期。',
      },
      {
        q: '我在中国境外哪里可以考 HSK 3.0?',
        a: '国际 HSK 考点网络覆盖 80 多个国家。多数主要城市至少有一个考点;部分提供机考和远程监考。通过官方 HSK 报名网站(registration.hsk.org)或当地合作机构报名。预订前请确认考点提供 3.0 格式。',
      },
      {
        q: '大学会立即接受 HSK 3.0 成绩吗?',
        a: '是的 — HSK 3.0 大纲自 2026 年 7 月起为官方标准,所有接受机构都已发布 2.0 → 3.0 成绩映射表。如果你在现在到 2027 年 3 月之间申请,请与目标项目确认他们是否接受切换前的 2.0 成绩,或要求 3.0。',
      },
      {
        q: 'HSK 和 HSKK 有什么区别?',
        a: 'HSK 是标准中文水平考试,2.0 有 6 个等级,3.0 有 9 个等级。HSKK 是较早的口语和写作考试,以前是独立考试 — 在 HSK 3.0 中,口语和写作部分已整合到 L3 及以上的主 HSK 考试中。HSK 3.0 下,HSKK 不再作为独立考试提供。',
      },
    ],
    howToSteps: [
      {
        name: '核对目标项目要求的 HSK 等级',
        text: '查看你的 3 个目标项目的国际招生页面。多数页面列出要求的 HSK 等级 + 接受的考试周期窗口(例如"申请前两年内的 HSK 4")。',
      },
      {
        name: '将你当前的水平映射到 HSK 3.0',
        text: '如果你有 HSK 2.0 成绩,大学的映射表会告诉你对应的 HSK 3.0 等级。如果你尚未参加过 HSK,HSK 官网上的官方自测题会把你放在大致正确的等级段。',
      },
      {
        name: '选择更新的备考资料',
        text: '使用 2024 年或之后出版的备考资料。词汇列表、阅读材料和口语提示都反映了 2025 修订标准;旧版备考书涵盖的词汇已不再出现在考试中。',
      },
      {
        name: '围绕申请截止日期制定学习计划',
        text: '从截止日期向前推算:目标考试日期在申请提交前 2–3 个月(成绩需要 2–4 周发布)。对于多数 2027 年 3 月入学,目标考试日期在 2026 年 10–11 月,以便赶在 12 月 13 日切换截止之前完成。',
      },
      {
        name: '在提供 HSK 3.0 的考点报名',
        text: '预订前请确认考点提供 3.0 格式。多数国际考点在 2026 年底已切换至 3.0;部分考点在 2026 年 12 月之前的过渡窗口期内仍提供 2.0。',
      },
      {
        name: '考前一周做一次限时模拟考试',
        text: '真实条件下的限时模拟考试能暴露节奏问题。机考是默认格式 — 在与真实考试相同界面的桌面上练习。',
      },
      {
        name: '将成绩提交给目标项目',
        text: '多数项目在申请阶段接受自报成绩,在录取阶段进行核实。请确认每个项目的政策;部分项目要求考点直接提交。',
      },
      {
        name: '必要时规划重考',
        text: 'HSK 允许在下一个可用考试日期重考。如果第一次未达到目标等级,规划 2–3 个月后重考(典型备考周期)。',
      },
    ],
    ctaTitle: '需要帮忙围绕申请规划 HSK 备考时间?',
    ctaSubtitle:
      'SICA 招生团队可以将你当前的中文水平映射到 HSK 3.0,推荐针对目标入学的备考时间线,并对你的整套申请材料进行端到端审核。',
    ctaApplyLabel: '预约免费 15 分钟咨询',
    ctaContactLabel: '邮件联系 SICA 招生',
    related: [
      {
        href: '/guides/hsk',
        label: 'HSK 备考指南(旧 2.0 内容 — 供参考)',
        description:
          '原 HSK 备考指南介绍 2.0 备考策略;如果你有过渡截止前的 2.0 成绩,仍有参考价值。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试 — 国际申请者的新强制中文考试',
        description:
          'CSCA(中文学术能力评估)从 2026 年起成为国际本科申请者的强制考试;与 HSK 在申请材料中有重叠。',
      },
      {
        href: '/english-taught-programs-china',
        label: '中国英文授课项目 — 300+ 大学 ETP 目录',
        description:
          '对于优先考虑英文授课的申请者,ETP 目录涵盖 300+ 大学跨学科专业;这些项目的 HSK 要求通常较低。',
      },
    ],
  },
};
