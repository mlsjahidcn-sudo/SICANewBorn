import type { LocalizedGuide } from './types';

/**
 * "HSK 3.0 speaking and writing" — Phase 122, Batch 2 (HSK 3.0),
 * article #3. Target queries: "hsk speaking", "hsk writing",
 * "hsk 3.0 format", "hsk speaking component", "hsk writing component".
 */
export const hsk3SpeakingWritingGuide: LocalizedGuide = {
  en: {
    slug: 'hsk-3-0-speaking-writing',
    eyebrow: 'GUIDE · HSK 3.0 SPEAKING + WRITING',
    title: 'Speaking and writing in HSK 3.0 — the new scored components',
    description:
      'Speaking and writing become scored at L3+. Audio recording for speaking, typed input for writing, no handwriting until L5, computer-based default. Format, rubrics, practice strategies, and which test centers support the new components.',
    subtitle:
      'The biggest practical change for HSK 3.0 is the integration of speaking and writing into the main test at L3+. The two new components use recorded audio and typed input — no handwriting requirement until L5 — which removes a barrier that discouraged applicants with weaker character-writing skills. This guide covers the format, rubrics, and practice strategies for the new components, plus what to look for in a test center (computer-based default, microphone calibration, typing interface).',
    stats: [
      { value: 'L3+', label: 'First scored level' },
      { value: 'Audio', label: 'Speaking input' },
      { value: 'Typed', label: 'Writing input (L3–L4)' },
      { value: 'No handwriting', label: 'Until L5' },
    ],
    quickAnswer:
      'Speaking and writing are scored components at HSK 3.0 L3 and above. Speaking uses recorded audio (you speak into a headset microphone; the system scores pronunciation, fluency, and content). Writing uses typed input at L3–L4 (no handwriting — character recognition is separate from composition scoring) and mixed typed + handwritten at L5+. Computer-based testing is the default; paper tests are only at designated centers and on limited dates. Practice strategies: record yourself daily for speaking feedback, type timed writing prompts for writing fluency, and use official HSK 3.0 mock tests under real conditions before the test.',
    keyTakeaways: [
      'Speaking and writing become scored components at L3+ — L1 and L2 remain listening + reading only',
      'Speaking uses recorded audio with a headset microphone; system scores pronunciation, fluency, and content',
      'Writing at L3–L4 uses typed input only — no handwriting requirement; L5+ mixes typed and handwritten',
      'Computer-based testing is the default; verify your test center offers computer-based HSK 3.0',
      'Practice daily: record yourself for speaking; use timed typed prompts for writing; run full mock tests under real conditions',
      'The new components are designed to be fairer to non-character-writing-strong applicants — the integration does not make the test harder for applicants who excel at listening and reading',
    ],
    sections: [
      {
        id: 'what-changed',
        h2: 'What is new — the speaking and writing integration',
        intro:
          'Speaking and writing move from a separate HSKK exam (discontinued under 3.0) into the main HSK test at L3+.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**L1–L2 unchanged** — listening and reading only; no speaking or writing scoring',
              '**L3+ integrated** — speaking and writing become scored components alongside listening and reading',
              '**Speaking component** — recorded audio; you speak into a headset microphone; the system scores pronunciation accuracy, fluency, and content appropriateness',
              '**Writing component at L3–L4** — typed input only; you type Chinese characters on the keyboard; the system scores composition (the words you choose, the structure you build) — not character recognition or handwriting quality',
              '**Writing component at L5+** — mixed input; some items are typed (composition), some are handwritten (character recognition); the mixed format tests both composition and traditional handwriting',
              '**HSKK discontinued** — the separate HSK Speaking test (HSKK) is no longer administered as a standalone exam under HSK 3.0; the speaking component is integrated into the main test',
            ],
          },
        ],
      },
      {
        id: 'speaking-format',
        h2: 'Speaking format — what you actually do on test day',
        intro:
          'Recorded audio, headset microphone, system scoring. The format is designed to test real conversational ability.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Microphone check** — first 30 seconds; read the calibration prompt aloud; the system confirms audio levels',
              '**Warm-up prompts (1–2 minutes)** — read a short passage aloud to calibrate voice + clarity',
              '**Short-answer prompts (5–8 items)** — answer a question or describe an image in 15–30 seconds each',
              '**Long-turn prompts (2–3 items)** — speak for 1–2 minutes on a topic; the system scores pronunciation, fluency, vocabulary use, and content structure',
              '**At L5+** — more complex prompts including argumentation, comparison, and discussion of abstract topics',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The speaking test is scored by an automated system that compares your audio to a reference corpus. Strong pronunciation and natural pacing matter more than perfect grammar; the system rewards fluency over hesitation.',
          },
        ],
      },
      {
        id: 'writing-format',
        h2: 'Writing format — typed at L3–L4, mixed at L5+',
        intro:
          'No handwriting requirement until L5 — character recognition is a separate skill from composition.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**L3–L4 writing** — typed input only; you compose sentences and short paragraphs using the on-screen keyboard; the system scores word choice, sentence structure, and content appropriateness',
              '**L5+ writing** — mixed format; some items are typed (composition tasks), some are handwritten (character recognition tasks); the mixed format tests both composition and traditional character writing',
              '**Word count targets** — L3: 30–50 characters per task; L4: 80–120; L5: 150–200; L6+: 250+',
              '**Task types** — sentence ordering, sentence completion, short paragraph writing, summarization, opinion writing',
              '**Scoring** — automated system evaluates word choice, grammar accuracy, content structure, and (at L5+) handwriting quality for the handwritten portion',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The integration of typed input at L3–L4 is a major accessibility win. Applicants who can read and listen to Chinese but struggle with character-by-character handwriting can now demonstrate writing competence through composition rather than calligraphy.',
          },
        ],
      },
      {
        id: 'test-center',
        h2: 'Test centers — what to look for',
        intro:
          'Computer-based is the default; verify before booking. Some centers are still paper-only or partial.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Computer-based default** — most international test centers are now computer-equipped; remote proctoring is available at some locations for added flexibility',
              '**Microphone calibration** — every computer-based center has headset microphones; some centers have external desktop microphones for clearer audio capture',
              '**Keyboard layout** — Chinese input method editors (IMEs) are installed at all centers; standard pinyin input is the default; some centers offer additional input methods (wubi, etc.)',
              '**Practice environment** — most centers offer a brief practice session before the test starts; use it to calibrate audio and confirm the input method',
              '**Special accommodations** — if you require accommodations (extended time, breaks, assistive technology), request them in advance through the HSK portal',
              '**Paper tests** — still available at designated centers on limited dates for applicants who cannot access computer-based testing; verify availability before booking',
            ],
          },
        ],
      },
      {
        id: 'practice-strategies',
        h2: 'Practice strategies — what actually works',
        intro:
          'Daily practice with feedback. The new components reward fluency over perfection.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Speaking: daily recording** — 10–15 minutes daily; record yourself answering prompts from the official HSK 3.0 speaking prep materials; listen back for pronunciation, pacing, and filler-word habits',
              '**Speaking: shadow native audio** — find native-speaker audio (Chinese podcasts, news broadcasts, audio courses); pause and repeat to calibrate pronunciation and rhythm',
              '**Writing: timed typed prompts** — set a timer for 5 minutes per prompt; type a paragraph on the topic using the keyboard IME; review for word choice and structure',
              '**Writing: vocabulary → sentences → paragraphs** — start with single-word recall, then sentence construction, then paragraph composition; build up the complexity gradually',
              '**Speaking: conversation partners** — find a language exchange partner (in-person, online, or via apps like Tandem); real conversation practice develops the spontaneous fluency the test rewards',
              '**Writing: feedback loop** — get feedback from a teacher or advanced speaker; self-correction without feedback is unreliable',
              '**Mock tests under real conditions** — run official HSK 3.0 mock tests 1–2 weeks before the actual test; calibrate timing, microphone, keyboard, and stamina',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When do the speaking and writing components start?',
        a: 'The speaking and writing components are scored at HSK 3.0 L3 and above. L1 and L2 remain listening and reading only — no speaking or writing scoring at those levels.',
      },
      {
        q: 'Is the speaking test graded by humans or machines?',
        a: 'The speaking test is scored by an automated system that compares your audio to a reference corpus. The system scores pronunciation accuracy, fluency, vocabulary use, and content structure. There is no human grader involved — scoring is consistent across all test takers worldwide.',
      },
      {
        q: 'Do I need to write Chinese characters by hand at L3?',
        a: 'No — at L3–L4, the writing component uses typed input only. You type Chinese characters on the keyboard using the input method editor (IME); the system scores composition (word choice, sentence structure, content) rather than handwriting quality. Handwriting becomes a scored component at L5+.',
      },
      {
        q: 'What if my pronunciation is not native?',
        a: 'The automated scoring system is calibrated to recognize non-native pronunciation with reasonable accuracy. Strong pronunciation and natural pacing matter more than native-level fluency. The system rewards fluency over hesitation — speaking slowly and clearly is better than speaking quickly with errors.',
      },
      {
        q: 'Can I take the speaking component separately?',
        a: 'No — the speaking component is integrated into the main HSK 3.0 test at L3+. You cannot take it separately. The separate HSKK (HSK Speaking) exam is discontinued under HSK 3.0.',
      },
      {
        q: 'What if I have a speech impediment or hearing impairment?',
        a: 'Special accommodations are available — request them in advance through the HSK portal. Common accommodations include extended time, written-response alternatives, and assistive technology. Contact your target test center to discuss available options.',
      },
      {
        q: 'Can I use a dictionary during the writing component?',
        a: 'No — dictionaries and external references are not allowed during the test. The writing component tests your ability to compose under time pressure using the vocabulary you have memorized. Prepare by memorizing the vocabulary for your target band before the test.',
      },
      {
        q: 'Is the keyboard Chinese input method (IME) hard to use?',
        a: 'Pinyin input — typing the romanization of Chinese characters and selecting from a list of candidates — is the standard IME and is intuitive for anyone who can read pinyin. Most centers offer a brief practice session before the test starts; use it to confirm the input method.',
      },
    ],
    howToSteps: [
      {
        name: 'Check the speaking and writing components for your target level',
        text: 'If your target is L1 or L2: no speaking or writing components — focus on listening and reading only. If L3+: prepare for both components.',
      },
      {
        name: 'Practice speaking daily with recording',
        text: '10–15 minutes daily; record yourself answering official HSK 3.0 speaking prompts; listen back for pronunciation, pacing, and filler-word habits.',
      },
      {
        name: 'Shadow native Chinese audio',
        text: 'Find native-speaker audio (podcasts, news broadcasts, audio courses); pause and repeat to calibrate pronunciation and rhythm.',
      },
      {
        name: 'Practice timed typed writing',
        text: 'Set a timer for 5 minutes per prompt; type a paragraph on the topic using the keyboard IME; review for word choice and structure.',
      },
      {
        name: 'Build writing complexity gradually',
        text: 'Start with single-word recall, then sentence construction, then paragraph composition. Build complexity over weeks, not days.',
      },
      {
        name: 'Get feedback from a teacher or advanced speaker',
        text: 'Self-correction without feedback is unreliable. A teacher or advanced speaker can identify patterns you will not catch yourself.',
      },
      {
        name: 'Find a conversation partner',
        text: 'Real conversation practice develops the spontaneous fluency the test rewards. In-person, online, or via language exchange apps.',
      },
      {
        name: 'Run a full mock test 1–2 weeks before',
        text: 'Official HSK 3.0 mock tests under real conditions. Calibrate timing, microphone, keyboard, and stamina.',
      },
    ],
    ctaTitle: 'Need help preparing for the HSK 3.0 speaking and writing components?',
    ctaSubtitle:
      'SICA\'s team can recommend prep resources, connect you with conversation partners, and review your application package end-to-end.',
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
        href: '/hsk-3-0-prep-timeline',
        label: 'HSK 3.0 prep timeline — what to do at every stage',
        description:
          'Branched by where you are now: just heard about HSK 3.0 / already sat 2.0 / mid-prep. Sequenced against intake deadlines.',
      },
    ],
  },
  zh: {
    slug: 'hsk-3-0-speaking-writing',
    eyebrow: '指南 · HSK 3.0 口语与写作',
    title: 'HSK 3.0 口语与写作 — 新增计分部分',
    description:
      '口语和写作在 L3+ 成为计分项。口语录音输入、写作键盘输入、L5 及以下不要求手写、机考默认。格式、评分标准、练习策略,以及哪些考点支持新增部分。',
    subtitle:
      'HSK 3.0 最大的实际变化是口语和写作部分在 L3+ 整合到主考试中。两个新部分使用录音和键盘输入 — L5 及以下不要求手写 — 消除了阻碍汉字书写能力较弱申请者的障碍。本指南涵盖新部分的格式、评分标准和练习策略,以及考点需要具备的条件(机考默认、麦克风校准、键盘界面)。',
    stats: [
      { value: 'L3+', label: '首次计分等级' },
      { value: '录音', label: '口语输入' },
      { value: '键盘', label: '写作输入(L3–L4)' },
      { value: '无手写', label: '直到 L5' },
    ],
    quickAnswer:
      '口语和写作是 HSK 3.0 L3 及以上的计分部分。口语使用录音音频(你对着耳机麦克风说话;系统评分发音、流利度和内容)。L3–L4 写作使用键盘输入(不要求手写 — 汉字识别与写作评分是分开的),L5+ 混合键盘输入和手写。机考为默认;纸笔考试仅在指定考点和限定日期提供。每天练习:口语录音自我反馈,写作限时键入提示,考试前在真实条件下进行完整的模拟考试。',
    keyTakeaways: [
      '口语和写作在 L3+ 成为计分项 — L1 和 L2 仍只考听力和阅读',
      '口语使用录音音频配合耳机麦克风;系统评分发音、流利度和内容',
      'L3–L4 写作仅使用键盘输入 — 不要求手写;L5+ 混合键盘和手写',
      '机考为默认;预订前请确认你的考点提供机考 HSK 3.0',
      '每天练习:口语录音;写作限时键入提示;在真实条件下进行完整的模拟考试',
      '新部分旨在对汉字书写能力较弱的申请者更公平 — 整合并不会让擅长听力和阅读的申请者更难',
    ],
    sections: [
      {
        id: 'what-changed',
        h2: '新增内容 — 口语和写作整合',
        intro: '口语和写作从独立的 HSKK 考试(在 3.0 下已停用)整合到 L3+ 的主 HSK 考试中。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**L1–L2 不变** — 仅听力和阅读;不计口语和写作',
              '**L3+ 整合** — 口语和写作成为听力和阅读之外的计分项',
              '**口语部分** — 录音音频;你对着耳机麦克风说话;系统评分发音准确性、流利度和内容适配性',
              '**L3–L4 写作部分** — 仅键盘输入;你在屏幕上用键盘输入汉字;系统评分作文(词汇选择、句子结构、内容)— 不评分汉字识别或手写质量',
              '**L5+ 写作部分** — 混合输入;部分题目键盘输入(作文),部分手写(汉字识别);混合格式同时测试作文和传统手写',
              '**HSKK 已停用** — 独立的 HSK 口语考试(HSKK)在 HSK 3.0 下不再作为独立考试提供;口语部分已整合到主考试',
            ],
          },
        ],
      },
      {
        id: 'speaking-format',
        h2: '口语格式 — 考试当天你实际做什么',
        intro: '录音音频、耳机麦克风、系统评分。格式旨在测试真实对话能力。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**麦克风校准** — 前 30 秒;大声朗读校准提示;系统确认音频水平',
              '**热身提示(1–2 分钟)** — 大声朗读短文以校准声音 + 清晰度',
              '**简答提示(5–8 题)** — 每题用 15–30 秒回答问题或描述图片',
              '**长题提示(2–3 题)** — 就话题说 1–2 分钟;系统评分发音、流利度、词汇使用和内容结构',
              '**L5+** — 更复杂的提示包括论证、比较和抽象话题讨论',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '口语考试由自动化系统评分,该系统将你的音频与参考语料库对比。发音准确和节奏自然比语法完美更重要;系统奖励流利度而非犹豫。',
          },
        ],
      },
      {
        id: 'writing-format',
        h2: '写作格式 — L3–L4 键入,L5+ 混合',
        intro: 'L5 及以下不要求手写 — 汉字识别是与作文评分分开的能力。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**L3–L4 写作** — 仅键盘输入;你使用屏幕键盘上的输入法编辑(IME)组成句子和短段落;系统评分词汇选择、句子结构和内容适配性',
              '**L5+ 写作** — 混合格式;部分题目键盘输入(作文),部分手写(汉字识别);混合格式同时测试作文和传统汉字书写',
              '**字数目标** — L3: 每题 30–50 字;L4: 80–120 字;L5: 150–200 字;L6+: 250 字以上',
              '**题目类型** — 句子排序、句子补全、短段落写作、总结、观点写作',
              '**评分** — 自动化系统评估词汇选择、语法准确性、内容结构,以及(L5+)手写题目的手写质量',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'L3–L4 整合键入输入是无障碍方面的重大胜利。能读懂和听懂中文但汉字书写能力较弱的申请者,现在可以通过作文而非书法来展示写作能力。',
          },
        ],
      },
      {
        id: 'test-center',
        h2: '考点 — 需要了解什么',
        intro: '机考为默认;预订前请确认。部分考点仍是仅纸笔或部分。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**机考默认** — 多数国际考点现已配备机考设备;部分考点提供远程监考以增加灵活性',
              '**麦克风校准** — 每个机考考点都有耳机麦克风;部分考点有外置桌面麦克风以获得更清晰的音频捕获',
              '**键盘布局** — 所有考点都安装了中文输入法编辑(IME);标准拼音输入为默认;部分考点提供额外的输入法(五笔等)',
              '**练习环境** — 多数考点在考试开始前提供简短的练习环节;用其校准音频并确认输入法',
              '**特殊便利** — 如果你需要便利条件(延时、休息、辅助技术),通过 HSK 官网提前申请',
              '**纸笔考试** — 仍在指定考点和限定日期为无法使用机考的申请者提供;预订前请确认可用性',
            ],
          },
        ],
      },
      {
        id: 'practice-strategies',
        h2: '练习策略 — 真正有效的方法',
        intro: '每天练习并获得反馈。新部分奖励流利度而非完美。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**口语:每天录音** — 每天 10–15 分钟;录音自己回答官方 HSK 3.0 口语备考材料中的提示;回听发音、节奏和口头禅',
              '**口语:跟读母语音频** — 找到母语者音频(中文播客、新闻广播、音频课程);暂停并跟读以校准发音和节奏',
              '**写作:限时键入提示** — 每题设置 5 分钟计时器;用键盘 IME 输入主题段落;检查词汇选择和结构',
              '**写作:词汇 → 句子 → 段落** — 从单词回忆开始,然后句子构建,然后段落组成;逐步建立复杂度',
              '**口语:对话伙伴** — 找到语言交换伙伴(面对面、线上或通过 Tandem 等应用);真实对话练习培养考试奖励的自发流利度',
              '**写作:反馈循环** — 从教师或高级使用者获得反馈;没有反馈的自我纠正是不可靠的',
              '**真实条件下的模拟考试** — 考试前 1–2 周进行官方 HSK 3.0 模拟考试;校准时间、麦克风、键盘和耐力',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '口语和写作部分什么时候开始?',
        a: '口语和写作部分是 HSK 3.0 L3 及以上的计分项。L1 和 L2 仍只考听力和阅读 — 这两个等级不评分口语和写作。',
      },
      {
        q: '口语考试由人工还是机器评分?',
        a: '口语考试由自动化系统评分,该系统将你的音频与参考语料库对比。系统评分发音准确性、流利度、词汇使用和内容结构。不涉及人工评分 — 全球所有考生的评分标准一致。',
      },
      {
        q: 'L3 需要手写汉字吗?',
        a: '不需要 — 在 L3–L4,写作部分仅使用键盘输入。你使用输入法编辑(IME)在键盘上输入汉字;系统评分作文(词汇选择、句子结构、内容)而非手写质量。手写成为 L5+ 的计分项。',
      },
      {
        q: '如果我的发音不标准怎么办?',
        a: '自动化评分系统经过校准,可以合理识别非母语者的发音。发音准确和节奏自然比母语级流利度更重要。系统奖励流利度而非犹豫 — 说得慢而清晰比说得快但错误好。',
      },
      {
        q: '可以单独考口语部分吗?',
        a: '不能 — 口语部分已整合到 L3+ 的主 HSK 3.0 考试中。无法单独考。独立的 HSKK(HSK 口语)考试在 HSK 3.0 下已停用。',
      },
      {
        q: '如果有语言障碍或听力障碍怎么办?',
        a: '可提供特殊便利 — 通过 HSK 官网提前申请。常见便利包括延时、书面回答替代和辅助技术。联系目标考点讨论可用选项。',
      },
      {
        q: '写作部分可以使用词典吗?',
        a: '不能 — 考试期间不允许使用词典和外部参考资料。写作部分测试你在时间压力下使用你已记忆词汇进行作文的能力。考试前为目标等级段记忆词汇。',
      },
      {
        q: '中文输入法(IME)难用吗?',
        a: '拼音输入 — 输入汉字的罗马化并从候选列表中选择 — 是标准 IME,对任何能读拼音的人来说都很直观。多数考点在考试开始前提供简短的练习环节;用其确认输入法。',
      },
    ],
    howToSteps: [
      {
        name: '检查目标等级的口语和写作部分',
        text: '如果目标是 L1 或 L2:无口语或写作部分 — 专注于听力和阅读。如果 L3+:为两个部分都做准备。',
      },
      {
        name: '每天练习口语录音',
        text: '每天 10–15 分钟;录音自己回答官方 HSK 3.0 口语提示;回听发音、节奏和口头禅。',
      },
      {
        name: '跟读母语中文音频',
        text: '找到母语者音频(播客、新闻广播、音频课程);暂停并跟读以校准发音和节奏。',
      },
      {
        name: '练习限时键入写作',
        text: '每题设置 5 分钟计时器;用键盘 IME 输入主题段落;检查词汇选择和结构。',
      },
      {
        name: '逐步建立写作复杂度',
        text: '从单词回忆开始,然后句子构建,然后段落组成。数周内逐步建立复杂度,不要数日。',
      },
      {
        name: '从教师或高级使用者获得反馈',
        text: '没有反馈的自我纠正是不可靠的。教师或高级使用者可以识别你不会自己发现的问题模式。',
      },
      {
        name: '找到对话伙伴',
        text: '真实对话练习培养考试奖励的自发流利度。面对面、线上或通过语言交换应用。',
      },
      {
        name: '考前 1–2 周进行一次完整的模拟考试',
        text: '官方 HSK 3.0 模拟考试在真实条件下。校准时间、麦克风、键盘和耐力。',
      },
    ],
    ctaTitle: '需要帮忙准备 HSK 3.0 口语和写作部分?',
    ctaSubtitle:
      'SICA 团队可以推荐备考资源,为你对接对话伙伴,并对你的整套申请材料进行端到端审核。',
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
        href: '/hsk-3-0-prep-timeline',
        label: 'HSK 3.0 备考时间线 — 每个阶段的行动',
        description:
          '按你目前的状态分支:刚刚听说 HSK 3.0 / 已考过 2.0 / 备考中。针对入学截止日期排序。',
      },
    ],
  },
};
