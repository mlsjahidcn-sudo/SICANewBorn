import type { LocalizedGuide } from './types';

/**
 * "HSK 3.0 vocabulary list" — Phase 122, Batch 2 (HSK 3.0),
 * article #2. Target queries: "hsk 3 vocabulary", "hsk word list",
 * "hsk 词汇", "hsk vocabulary", "hsk 3.0 word list".
 *
 * Static content. Vocabulary counts are flagged as "as published in
 * the 2025 revised standard; subject to update per cycle" — the
 * rollout is live and is the most likely drift surface.
 */
export const hsk3VocabularyListGuide: LocalizedGuide = {
  en: {
    slug: 'hsk-3-0-vocabulary-list',
    eyebrow: 'GUIDE · HSK 3.0 VOCABULARY',
    title: 'HSK 3.0 vocabulary — what is on the list and what dropped',
    description:
      'Per-level word counts, the modern vocab that replaced classical terms, a starter list for each band, and how to build your own study deck from the official 2025 syllabus without buying a prep book.',
    seoTitle: 'HSK 3.0 vocabulary — what is on the list and what',
    seoDescription: 'Per-level word counts, the modern vocab that replaced classical terms, a starter list for each band, and how to build your own study deck from the',
    subtitle:
      'The HSK 3.0 vocabulary list is the single biggest change from 2.0 — and the most useful study artifact you can build. Per-level word counts roughly double at L1–L5 but the practical coverage is comparable because the new list is more efficient: modern Chinese replaces classical and literary vocabulary, and high-frequency everyday and professional terms are added. This guide walks through what is on the list, what dropped from 2.0, how to build your own study deck from the official sources, and which prep books are still worth using.',
    stats: [
      { value: '300 / 600', label: 'L1 / L2 vocab' },
      { value: '~40% drop', label: 'Classical terms' },
      { value: 'Modern +', label: 'Everyday + professional' },
      { value: 'Free', label: 'Official source list' },
    ],
    quickAnswer:
      'The HSK 3.0 vocabulary list is published as the "HSK 3.0 Vocabulary Syllabus" by CLEC (the Center for Language Education and Cooperation) on the official HSK portal — free to download as a PDF. Per-level word counts roughly doubled at L1–L5 compared to HSK 2.0 (L1: 150 → 300; L2: 300 → 600; L3: 600 → 1,200; L4: 1,200 → 2,500; L5: 2,500 → 3,500), but the new vocabulary is more efficient — classical and literary terms were dropped, contemporary and high-frequency terms were added. Build your study deck from the official PDF plus a spaced-repetition app (Anki or similar) sorted by frequency bands.',
    keyTakeaways: [
      'Per-level word counts in HSK 3.0 doubled at L1–L5 vs HSK 2.0, but the new vocabulary is more efficient and modern',
      'Classical and literary vocabulary that was on the 2.0 list was largely dropped; contemporary everyday, professional, and academic vocabulary replaced it',
      'Build your study deck from the official "HSK 3.0 Vocabulary Syllabus" PDF (free on the HSK portal) rather than relying on prep book lists',
      'Spaced-repetition apps (Anki or similar) are the most efficient way to memorize the list — sort by frequency band, not alphabetical',
      'The 600-word L2 list is the most efficient starting point — it covers most everyday conversation and basic workplace Chinese',
      'For L4+ targets: prioritize academic and disciplinary vocabulary over general words; the L4+ list is heavily discipline-specific',
    ],
    sections: [
      {
        id: 'list-source',
        h2: 'Where to find the official list',
        intro:
          'One free source, one PDF, fully aligned with the test. Anything else is derivative.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Official source** — "HSK 3.0 Vocabulary Syllabus" published by CLEC on the HSK portal (registration.hsk.org / hsk.org); free PDF download; the canonical word list',
              '**Chinese International Education Confederation** — same list republished on their portal; check the publication date matches the current cycle',
              '**Prep books** — useful for explanatory notes and example sentences but verify the words against the official PDF; some 2018-edition prep books still circulate with the 2.0 list',
              '**Frequency bands** — sort by frequency of use in contemporary Chinese (news, academic, professional), not alphabetical; the most useful words come first',
              '**Audio pronunciation** — pair the visual list with audio (Pleco, Skritter, or the official HSK audio companion) so you learn the character, the pronunciation, and the word together',
            ],
          },
        ],
      },
      {
        id: 'level-by-level',
        h2: 'Per-level vocabulary — what is actually on the list',
        intro:
          'The vocabulary counts roughly double at L1–L5 but the practical coverage is comparable. Levels 6–9 add academic depth.',
        blocks: [
          {
            type: 'table',
            caption: 'HSK 3.0 vocabulary counts per level (as published in the 2025 revised standard; verify against official sources each cycle)',
            columns: ['Level', 'Vocab', 'What is in it'],
            rows: [
              ['L1', '300', 'Greetings, family, numbers, basic time, common daily activities. The 50 most-frequent Chinese characters account for 40% of usage — learn these first.'],
              ['L2', '600', 'Daily routines, food and drink, weather, basic workplace vocabulary, transportation. Doubles L1 — the additional words are the practical modern vocabulary that old L2 lists lacked.'],
              ['L3', '1,200', 'Sustained conversation topics, common news vocabulary, basic academic terms. The first level that requires serious vocabulary memorization effort.'],
              ['L4', '2,500', 'Extended reading vocabulary, structured writing vocabulary, common academic terms across disciplines. The most common target for general undergraduate study.'],
              ['L5', '3,500', 'Academic reading vocabulary, disciplinary terms, formal writing vocabulary. Common for top undergraduate programs and most master\'s programs.'],
              ['L6', '5,000', 'Near-native operational vocabulary across genres and registers. Required for academic-track master\'s and most PhD programs.'],
              ['L7', '7,000+', 'Disciplinary depth vocabulary — formal academic register, journal article vocabulary, presentation language.'],
              ['L8', '9,000+', 'Specialized disciplinary vocabulary; ability to read technical material in your field.'],
              ['L9', '11,000+', 'Comprehensive academic vocabulary; command across genres and registers.'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The vocabulary jumps roughly double at each level from L1–L5 because the new list is more efficient. You can communicate at a basic daily-life level with 300 words; you can read news at L3 with 1,200; you can handle academic work at L5 with 3,500. The doubling is not a sign the test got harder — it is a sign the test got more efficient at measuring the same competencies.',
          },
        ],
      },
      {
        id: 'modern-replaces-classical',
        h2: 'Modern replaces classical — what changed in the word list',
        intro:
          'The most consequential change is the swap: contemporary high-frequency vocabulary replaced classical and literary terms.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Dropped from L1–L3** — many classical characters and literary compound words that were on the 2.0 list but rarely appear in contemporary Chinese (texts, news, casual writing, digital communication)',
              '**Added to L1–L3** — high-frequency modern vocabulary: digital communication terms, current idiom, contemporary compound words, basic professional vocabulary',
              '**Added to L4–L5** — disciplinary academic vocabulary that reflects the current state of Chinese academic publishing across disciplines',
              '**Updated throughout** — cultural references updated to reflect post-2020 usage; some older cultural references that referenced pre-2020 contexts were refreshed',
              '**Practical implication** — students who prepared for HSK 2.0 using 2018-era prep books find that the vocabulary lists do not match the new test; updated prep materials are essential',
            ],
          },
        ],
      },
      {
        id: 'starter-lists',
        h2: 'Starter vocabulary by band — what to memorize first',
        intro:
          'Frequency band ordering beats alphabetical ordering for efficient study. Start with the high-frequency core.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**L1 starter (50 words)** — the highest-frequency 50 Chinese characters account for roughly 40% of all Chinese text usage; learn these first',
              '**L1 complete (300 words)** — survival Chinese for the first 30 days in China: greetings, directions, food, money, basic requests',
              '**L2 high-frequency (200 words)** — beyond the L1 base, the 200 most-frequent L2 words cover most everyday conversation',
              '**L2 complete (600 words)** — workplace basics, transportation, daily life, common idioms',
              '**L3 academic core (400 words)** — common news and academic vocabulary; the most efficient step from conversational to academic Chinese',
              '**L4 disciplinary starter (200 words per discipline)** — pick your target discipline and learn the 200 most-frequent words in that field',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Spaced-repetition apps turn the 300-word L1 list into 2–4 weeks of focused study. Sort by frequency band, not alphabetical. Review daily in 15-minute sessions; the algorithm handles the rest.',
          },
        ],
      },
      {
        id: 'build-your-own-deck',
        h2: 'Building your own study deck from the official list',
        intro:
          'Skip the prep book reformatting. Build directly from the official PDF and a spaced-repetition app.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Download the official "HSK 3.0 Vocabulary Syllabus" PDF** from the HSK portal; do not rely on prep book reprints',
              '**Import into a spaced-repetition app** — Anki (free, cross-platform), Pleco (Chinese-specific, includes audio), or Skritter (focuses on character writing)',
              '**Sort by frequency band, not alphabetical** — frequency-based study is significantly more efficient; high-frequency words appear in everything you read and hear',
              '**Add audio** — most spaced-repetition apps support audio; pair the visual character with the spoken pronunciation so you learn the word, not just the writing',
              '**Add example sentences** — the official PDF includes 1–2 example sentences per word; use them; context reinforces retention',
              '**Review daily in 15-minute sessions** — spaced repetition is most effective in short, consistent sessions; the algorithm schedules reviews at the optimal intervals',
              '**Track your coverage** — most apps show mastery % per level; aim for 95%+ per level before sitting the test',
              '**Re-balance quarterly** — as your level progresses, retire mastered words from the daily queue and bring in the next band',
            ],
          },
        ],
      },
      {
        id: 'what-dropped',
        h2: 'What dropped from HSK 2.0 — and what replaced it',
        intro:
          'Most prep books published before 2024 cover the 2.0 list. The dropped words are still useful for cultural literacy, but the new words are what the test rewards.',
        blocks: [
          {
            type: 'table',
            caption: 'Examples of vocabulary changes from 2.0 → 3.0 (representative; verify against the official 2025 syllabus)',
            columns: ['Band', '2.0 word (dropped or reduced)', '3.0 word (added or expanded)'],
            rows: [
              ['L1', 'Heavy classical characters (e.g., 之、乎、者)', 'Modern greetings, basic requests, digital communication'],
              ['L2', 'Some literary compounds', 'Workplace vocabulary, transportation, common idioms'],
              ['L3', 'Some older formal vocabulary', 'News vocabulary, common academic terms, contemporary compound words'],
              ['L4', 'Some older disciplinary terms', 'Updated disciplinary vocabulary, modern academic register'],
              ['L5', 'Some pre-2010 academic vocabulary', 'Updated disciplinary vocabulary, contemporary research vocabulary'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The dropped classical and literary vocabulary is still part of the Chinese language — you will encounter it in older texts, classical poetry, and some formal writing. It is just no longer rewarded on the HSK 3.0 test. Keep the dropped list for cultural literacy if you are interested in classical Chinese; do not waste study time on it for the test.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Where can I download the official HSK 3.0 vocabulary list?',
        a: 'The "HSK 3.0 Vocabulary Syllabus" is published by CLEC (the Center for Language Education and Cooperation) on the official HSK portal (hsk.org or registration.hsk.org) as a free PDF download. This is the canonical word list — verify any prep book list against it.',
      },
      {
        q: 'Should I memorize all 11,000 HSK 3.0 words?',
        a: 'No — most applicants need L1–L6 (up to 5,000 words) for general academic admissions. L7–L9 (additional 6,000+ words) are for disciplinary depth in academic and research-track programs. Memorize the bands you actually need for your target program.',
      },
      {
        q: 'How long does it take to memorize the L1 300-word list?',
        a: 'With a spaced-repetition app and 15-minute daily sessions, the L1 300-word list takes 2–4 weeks to reach 95% mastery. The list is small because the highest-frequency 50 characters account for 40% of usage — you learn the practical core quickly, then build out the rest.',
      },
      {
        q: 'Is the HSK 3.0 vocabulary the same for all levels?',
        a: 'No — each level has its own vocabulary list. The lists are cumulative at the surface but not strictly cumulative in usage: words from L1 appear across all higher levels; L4+ words are heavily discipline-specific. Build one level at a time, in order.',
      },
      {
        q: 'Are the new HSK 3.0 words in any free app?',
        a: 'Yes — Pleco and Anki both have community-built HSK 3.0 decks. Verify against the official PDF before relying on them; community decks sometimes lag the official update.',
      },
      {
        q: 'What about words not on the HSK list?',
        a: 'The HSK list is a tested-competence baseline, not a comprehensive Chinese vocabulary. Native speakers use 20,000–30,000 words in everyday speech and 50,000+ in academic writing. The HSK list covers the words you need to demonstrate the tested competencies; reading real-world material exposes you to the rest.',
      },
      {
        q: 'Do I need to memorize characters and pinyin together?',
        a: 'Yes — most learners find character + pinyin + audio in one entry is the most efficient. The character is what you read; the pinyin is what you pronounce; the audio confirms both. Spaced-repetition apps like Skritter are character-focused; Pleco and Anki work for character + audio.',
      },
      {
        q: 'Should I learn simplified or traditional characters?',
        a: 'Mainland China uses simplified characters exclusively; the HSK 3.0 test uses simplified characters throughout. Learn simplified characters for HSK prep. Taiwan, Hong Kong, and Macau use traditional characters — they have their own proficiency tests (TOCFL) that use traditional.',
      },
    ],
    howToSteps: [
      {
        name: 'Download the official vocabulary syllabus',
        text: 'Get the "HSK 3.0 Vocabulary Syllabus" PDF from the HSK portal. Verify the publication date matches the current cycle. This is your canonical word list.',
      },
      {
        name: 'Pick a spaced-repetition app',
        text: 'Anki (free, cross-platform), Pleco (Chinese-specific, includes audio), or Skritter (focuses on character writing). All three work for HSK 3.0 prep; pick the one you will actually use daily.',
      },
      {
        name: 'Import the L1 starter list (300 words)',
        text: 'Sort by frequency band, not alphabetical. Add audio + example sentence for each word. Review daily in 15-minute sessions.',
      },
      {
        name: 'Master the L1 list before moving on',
        text: 'Aim for 95%+ mastery on the L1 band before moving to L2. Spaced repetition is most efficient when you fully consolidate one band before adding the next.',
      },
      {
        name: 'Progress through L2 → L6 systematically',
        text: 'Same pattern: 600 words at L2, 1,200 at L3, 2,500 at L4, 3,500 at L5, 5,000 at L6. Most general academic admissions need L4–L6.',
      },
      {
        name: 'Add disciplinary vocabulary at L4+',
        text: 'Beyond L4, prioritize 200 most-frequent words per your target discipline (engineering, business, science, humanities, etc.). The general L4+ list is heavily discipline-specific.',
      },
      {
        name: 'Review active vocabulary daily',
        text: 'Spaced repetition schedules reviews at the optimal interval for retention. Daily 15-minute sessions beat weekly 2-hour marathons.',
      },
      {
        name: 'Verify mastery before the test',
        text: 'Most apps show mastery % per word. Aim for 95%+ across your target band before sitting the test; this correlates with passing scores.',
      },
    ],
    ctaTitle: 'Want help building an HSK 3.0 study plan?',
    ctaSubtitle:
      'SICA\'s team can map your current Chinese level to an HSK 3.0 prep timeline, recommend study resources, and review your application package end-to-end.',
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
        href: '/hsk-3-0-speaking-writing',
        label: 'Speaking and writing in HSK 3.0 — the new components',
        description:
          'The speaking and writing components become scored at L3+. Format, scoring rubrics, computer-based testing, and how to practice.',
      },
      {
        href: '/hsk-3-0-prep-timeline',
        label: 'HSK 3.0 prep timeline — what to do at every stage',
        description:
          'Branched by where you are now: just heard about HSK 3.0 / already sat 2.0 / mid-prep. Sequenced against intake deadlines.',
      },
    ],
  },
  zh: {
    slug: 'hsk-3-0-vocabulary-list',
    eyebrow: '指南 · HSK 3.0 词汇',
    title: 'HSK 3.0 词汇 — 列表内容与变化',
    description:
      '各级词汇量、被现代词汇替换的古典词汇、每个等级段的入门列表,以及如何从官方 2025 大纲自主构建学习卡组。',
    subtitle:
      'HSK 3.0 词汇列表是 2.0 以来单一最大的变化 — 也是你能构建的最有用的学习材料。L1–L5 各级词汇量大致翻倍,但新词汇更高效:现代中文替换了古典和文学词汇,高频日常和专业词汇被加入。本指南介绍列表内容、2.0 中被剔除的部分、如何从官方来源自主构建学习卡组,以及哪些备考书仍然值得使用。',
    stats: [
      { value: '300 / 600', label: 'L1 / L2 词汇' },
      { value: '~40% 削减', label: '古典词汇' },
      { value: '现代 +', label: '日常 + 专业' },
      { value: '免费', label: '官方来源' },
    ],
    quickAnswer:
      'HSK 3.0 词汇列表由中外语言交流合作中心(CLEC)在 HSK 官网发布,名为《HSK 3.0 词汇大纲》,免费 PDF 下载。L1–L5 各级词汇量较 HSK 2.0 大致翻倍(L1: 150 → 300;L2: 300 → 600;L3: 600 → 1,200;L4: 1,200 → 2,500;L5: 2,500 → 3,500),但新词汇更高效 — 古典和文学词汇被剔除,当代和高频词汇被加入。从官方 PDF 加间隔重复应用(Anki 或类似)按频率段排序构建学习卡组。',
    keyTakeaways: [
      'HSK 3.0 L1–L5 各级词汇量较 HSK 2.0 翻倍,但新词汇更高效、更现代',
      '2.0 列表中的古典和文学词汇大部分被剔除;当代日常、专业和学术词汇取而代之',
      '从官方《HSK 3.0 词汇大纲》PDF(HSK 官网免费下载)构建学习卡组,不要依赖备考书的转载',
      '间隔重复应用(Anki 或类似)是记忆列表最有效的方式 — 按频率段排序,而非字母顺序',
      'L2 600 词列表是最有效的起点 — 覆盖大多数日常对话和基础工作场所中文',
      '针对 L4+ 目标:优先学术和学科词汇,而非通用词;L4+ 列表高度学科化',
    ],
    sections: [
      {
        id: 'list-source',
        h2: '在哪里找到官方列表',
        intro: '一个免费来源、一个 PDF、与考试完全对齐。其他都是衍生的。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**官方来源** — 《HSK 3.0 词汇大纲》由 CLEC 在 HSK 官网(hsk.org / registration.hsk.org)发布;免费 PDF 下载;权威词表',
              '**中国国际中文教育协会** — 在其门户网站上重新发布同一列表;检查发布日期与当前周期一致',
              '**备考书** — 对解释性注释和例句有用,但请对照官方 PDF 核对词汇;一些 2018 年版的备考书仍在流通 2.0 列表',
              '**频率段** — 按当代中文(新闻、学术、专业)的使用频率排序,而非字母顺序;最常用的词汇排在前面',
              '**音频发音** — 将视觉列表与音频(Pleco、Skritter 或官方 HSK 音频配套)配对,让你同时学习字形、发音和词汇',
            ],
          },
        ],
      },
      {
        id: 'level-by-level',
        h2: '各级词汇 — 实际列表内容',
        intro: 'L1–L5 词汇量大致翻倍,但实际覆盖范围相近。L6–L9 增添学术深度。',
        blocks: [
          {
            type: 'table',
            caption: 'HSK 3.0 各级词汇量(按 2025 修订标准公布;每周期根据官方来源核对)',
            columns: ['等级', '词汇量', '内容'],
            rows: [
              ['L1', '300', '问候、家庭、数字、基本时间、常见日常活动。最常用的 50 个汉字占使用量的 40% — 先学这些。'],
              ['L2', '600', '日常作息、饮食、天气、基础工作场所词汇、交通。在 L1 基础上翻倍 — 新增词汇是旧 L2 列表所缺的实用现代词汇。'],
              ['L3', '1,200', '持续性话题词汇、常见新闻词汇、基础学术词汇。第一个需要严肃词汇记忆投入的等级。'],
              ['L4', '2,500', '扩展阅读词汇、结构化写作词汇、跨学科常见学术词汇。一般本科入学最常见的目标等级。'],
              ['L5', '3,500', '学术阅读词汇、学科术语、正式写作词汇。顶尖本科和多数硕士入学的常见要求。'],
              ['L6', '5,000', '跨体裁和语域的近母语操作词汇。学术型硕士和多数博士项目的要求。'],
              ['L7', '7,000+', '学科深度词汇 — 正式学术语域、期刊文章词汇、演讲语言。'],
              ['L8', '9,000+', '专业学科词汇;能阅读本领域的技术材料。'],
              ['L9', '11,000+', '综合学术词汇;跨体裁和语域的掌握。'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'L1–L5 各级词汇量大致翻倍,因为新列表更高效。你可以用 300 词进行基础日常交流;L3 时 1,200 词可读懂新闻;L5 时 3,500 词可处理学术工作。翻倍不是考试变难的信号 — 是考试更高效地衡量相同能力的信号。',
          },
        ],
      },
      {
        id: 'modern-replaces-classical',
        h2: '现代取代古典 — 词表发生了什么变化',
        intro: '最重大的变化是替换:当代高频词汇取代了古典和文学词汇。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**L1–L3 剔除** — 许多古典汉字和文学复合词,在 2.0 列表中但很少出现在当代中文(文本、新闻、随笔、数字通信)中',
              '**L1–L3 新增** — 高频现代词汇:数字通信术语、当前习语、当代复合词、基础专业词汇',
              '**L4–L5 新增** — 反映当前中文学术出版跨学科现状的学科词汇',
              '**全程更新** — 文化引用更新以反映 2020 年后的用法;一些引用 2020 年前背景的旧文化引用被刷新',
              '**实际意义** — 用 2018 年版备考书备考 HSK 2.0 的学生会发现词汇列表与新考试不匹配;更新的备考资料必不可少',
            ],
          },
        ],
      },
      {
        id: 'starter-lists',
        h2: '各等级段入门词汇 — 先记什么',
        intro: '频率段排序比字母顺序更高效。从高频核心开始。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**L1 入门(50 词)** — 最高频的 50 个汉字约占所有中文文本使用量的 40%;先学这些',
              '**L1 完整(300 词)** — 在华前 30 天的生存中文:问候、问路、饮食、金钱、基本请求',
              '**L2 高频(200 词)** — 除 L1 基础外,200 个最高频 L2 词汇覆盖大多数日常对话',
              '**L2 完整(600 词)** — 工作场所基础、交通、日常生活、常见习语',
              '**L3 学术核心(400 词)** — 常见新闻和学术词汇;从会话中文到学术中文最高效的一步',
              '**L4 学科入门(每个学科 200 词)** — 选择目标学科,学习该领域 200 个最高频词汇',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '间隔重复应用将 300 词 L1 列表变成 2–4 周的专注学习。按频率段排序,而非字母顺序。每天 15 分钟复习;算法处理其余部分。',
          },
        ],
      },
      {
        id: 'build-your-own-deck',
        h2: '从官方列表自主构建学习卡组',
        intro: '跳过备考书的二次排版。直接从官方 PDF 和间隔重复应用构建。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**下载官方《HSK 3.0 词汇大纲》PDF** — 从 HSK 官网下载;不要依赖备考书的转载',
              '**导入间隔重复应用** — Anki(免费、跨平台)、Pleco(中文专用、含音频)或 Skritter(侧重汉字书写)',
              '**按频率段排序,而非字母顺序** — 基于频率的学习显著更高效;高频词出现在你读和听的一切内容中',
              '**添加音频** — 多数间隔重复应用支持音频;将视觉字符与口语发音配对,这样你学习的是词汇,而不仅是书写',
              '**添加例句** — 官方 PDF 包含每个词 1–2 个例句;使用它们;语境强化记忆',
              '**每天 15 分钟复习** — 间隔重复在短而持续的会话中最有效;算法以最优间隔安排复习',
              '**跟踪覆盖率** — 多数应用显示每个等级的掌握率 %;考试前目标 95%+',
              '**每季度再平衡** — 随着等级提升,将已掌握的词从每日队列中淘汰,引入下一段',
            ],
          },
        ],
      },
      {
        id: 'what-dropped',
        h2: 'HSK 2.0 中剔除的内容 — 以及替代词汇',
        intro: '2024 年前出版的大多数备考书涵盖 2.0 列表。被剔除的词汇对文化素养仍然有用,但考试奖励的是新词汇。',
        blocks: [
          {
            type: 'table',
            caption: '2.0 → 3.0 词汇变化示例(代表性;请对照官方 2025 大纲核对)',
            columns: ['等级段', '2.0 词汇(剔除或减少)', '3.0 词汇(新增或扩展)'],
            rows: [
              ['L1', '较多古典汉字(如 之、乎、者)', '现代问候、基本请求、数字通信'],
              ['L2', '部分文学复合词', '工作场所词汇、交通、常见习语'],
              ['L3', '部分旧式正式词汇', '新闻词汇、常见学术术语、当代复合词'],
              ['L4', '部分旧学科术语', '更新后的学科词汇、现代学术语域'],
              ['L5', '部分 2010 年前学术词汇', '更新后的学科词汇、当代研究词汇'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '被剔除的古典和文学词汇仍然是中文的一部分 — 你会在旧文本、古典诗歌和一些正式写作中遇到它们。只是 HSK 3.0 考试不再奖励它们。如果你对古典中文感兴趣,保留剔除列表作为文化素养;但不要为考试浪费时间。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '在哪里可以下载官方 HSK 3.0 词汇表?',
        a: '《HSK 3.0 词汇大纲》由 CLEC(中外语言交流合作中心)在官方 HSK 官网(hsk.org 或 registration.hsk.org)发布,免费 PDF 下载。这是权威词表 — 任何备考书列表都应与它对照。',
      },
      {
        q: '我需要记住全部 11,000 个 HSK 3.0 词汇吗?',
        a: '不需要 — 多数申请者本科或硕士一般入学需要 L1–L6(最多 5,000 词)。L7–L9(额外 6,000+ 词)面向学术和研究轨道项目的学科深度。记住目标项目实际需要的等级段。',
      },
      {
        q: '记住 L1 300 词列表需要多长时间?',
        a: '使用间隔重复应用,每天 15 分钟,L1 300 词列表需要 2–4 周达到 95% 掌握率。列表很小,因为最高频的 50 个汉字占使用量的 40% — 你能快速学习实用核心,然后建立其余部分。',
      },
      {
        q: 'HSK 3.0 词汇在各级都一样吗?',
        a: '不一样 — 每个等级都有自己的词汇列表。列表表面上是累积的,但实际使用上并非严格累积:L1 词汇出现在所有更高级别;L4+ 词汇高度学科化。逐级构建,按顺序。',
      },
      {
        q: '新 HSK 3.0 词汇在任何免费应用中都有吗?',
        a: '有 — Pleco 和 Anki 都有社区构建的 HSK 3.0 卡组。在依赖之前请与官方 PDF 核对;社区卡组有时滞后于官方更新。',
      },
      {
        q: 'HSK 列表之外的词汇呢?',
        a: 'HSK 列表是被测能力的基准,不是综合中文词汇。母语者在日常口语中使用 20,000–30,000 词,在学术写作中使用 50,000+ 词。HSK 列表涵盖展示被测能力所需的词汇;阅读真实世界的材料会让你接触其余部分。',
      },
      {
        q: '我需要同时记忆汉字和拼音吗?',
        a: '是的 — 多数学习者发现字形 + 拼音 + 音频三合一是最有效的。字形是你读的;拼音是你发音的;音频确认两者。Skritter 侧重汉字;Pleco 和 Anki 处理字形 + 音频。',
      },
      {
        q: '我应该学简体字还是繁体字?',
        a: '中国大陆全程使用简体字;HSK 3.0 考试全程使用简体字。备考 HSK 学习简体字。台湾、香港和澳门使用繁体字 — 他们有自己的中文水平考试(TOCFL)使用繁体字。',
      },
    ],
    howToSteps: [
      {
        name: '下载官方词汇大纲',
        text: '从 HSK 官网获取《HSK 3.0 词汇大纲》PDF。验证发布日期与当前周期一致。这是你的权威词表。',
      },
      {
        name: '选择间隔重复应用',
        text: 'Anki(免费、跨平台)、Pleco(中文专用、含音频)或 Skritter(侧重汉字书写)。三者都适用于 HSK 3.0 备考;选择你愿意每天使用的。',
      },
      {
        name: '导入 L1 入门列表(300 词)',
        text: '按频率段排序,而非字母顺序。为每个词添加音频 + 例句。每天 15 分钟复习。',
      },
      {
        name: '掌握 L1 列表后再继续',
        text: '在进入 L2 之前,目标 L1 段掌握率达到 95%+。当你完全巩固一个等级段后,间隔重复最为有效。',
      },
      {
        name: '系统地推进 L2 → L6',
        text: '同样模式:L2 600 词、L3 1,200 词、L4 2,500 词、L5 3,500 词、L6 5,000 词。多数一般学术入学需要 L4–L6。',
      },
      {
        name: '在 L4+ 添加学科词汇',
        text: '超过 L4,优先每个目标学科的 200 个最高频词汇(工程、商业、科学、人文等)。一般 L4+ 列表高度学科化。',
      },
      {
        name: '每天复习主动词汇',
        text: '间隔重复以保留率最优间隔安排复习。每天 15 分钟的会话胜过每周 2 小时的马拉松。',
      },
      {
        name: '考试前验证掌握率',
        text: '多数应用显示每个词的掌握率 %。考试前目标目标等级段 95%+;这与通过分数相关。',
      },
    ],
    ctaTitle: '需要帮忙构建 HSK 3.0 学习计划?',
    ctaSubtitle:
      'SICA 团队可以将你当前的中文水平映射到 HSK 3.0 备考时间线,推荐学习资源,并对你的整套申请材料进行端到端审核。',
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
        href: '/hsk-3-0-speaking-writing',
        label: 'HSK 3.0 口语与写作 — 新增部分',
        description:
          '口语和写作部分在 L3+ 成为计分项。格式、评分标准、机考,以及练习方法。',
      },
      {
        href: '/hsk-3-0-prep-timeline',
        label: 'HSK 3.0 备考时间线 — 每个阶段的行动',
        description:
          '按你目前的状态分支:刚刚听说 HSK 3.0 / 已考过 2.0 / 备考中。针对入学截止日期排序。',
      },
    ],
  },
};
