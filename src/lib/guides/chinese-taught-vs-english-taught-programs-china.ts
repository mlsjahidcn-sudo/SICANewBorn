import type { LocalizedGuide } from './types';

/**
 * Chinese-taught vs English-taught comparison.
 * Target query: "chinese taught vs english taught programs in china".
 */
export const chineseVsEnglishTaughtGuide: LocalizedGuide = {
  en: {
    slug: 'chinese-taught-vs-english-taught-programs-china',
    eyebrow: 'GUIDE · PROGRAM LANGUAGE',
    title: 'Chinese-Taught vs English-Taught Programs in China',
    description:
      'Chinese-taught vs English-taught degrees in China: tuition fees, HSK vs IELTS, jobs after graduation, and links to both programme catalogs.',
    seoTitle: 'Chinese vs English Taught Programs in China | SICA',
    seoDescription:
      'Compare Chinese-taught and English-taught programs in China: fees, HSK level, career impact, and when to choose each track.',
    subtitle:
      'Same universities, different language tracks. English-taught (ETP) costs more but skips HSK at entry; Chinese-taught is usually cheaper and opens deeper local job options if you reach HSK 4–5+.',
    stats: [
      { value: '+10–30%', label: 'Typical ETP tuition premium' },
      { value: 'HSK 4–5', label: 'Common Chinese-track bar' },
      { value: 'IELTS/TOEFL', label: 'English-track language test' },
      { value: 'CSCA', label: 'Bachelor’s: both tracks (2026+)' },
    ],
    quickAnswer:
      '**English-taught programs** use IELTS/TOEFL (no HSK to apply), charge roughly **10–30% higher tuition**, and suit students who need a fast academic start. **Chinese-taught programs** usually need **HSK 4–5** (sometimes 5–6 for competitive majors), cost less, and help if you want Chinese-language internships or post-grad work in China. From the **2026 intake**, bachelor’s applicants on **both** tracks still sit **CSCA**. Filter SICA’s catalog with language=English or language=Chinese on /programs.',
    keyTakeaways: [
      'ETP: IELTS/TOEFL in, HSK not required to apply; tuition often higher',
      'Chinese-taught: HSK 4–5+ typical; lower fees; stronger Mandarin campus life',
      'CSCA still applies to bachelor’s on both tracks from 2026',
      'CSC funding is open to both language tracks',
      'Jobs in China after graduation reward Chinese ability even for ETP grads',
    ],
    sections: [
      {
        id: 'comparison',
        h2: 'Side-by-side comparison',
        intro: 'Use this table to choose a track before you shortlist universities.',
        blocks: [
          {
            type: 'table',
            caption: 'Chinese-taught vs English-taught in China',
            columns: ['Dimension', 'Chinese-taught', 'English-taught (ETP)'],
            rows: [
              ['Entry language test', 'HSK 4–5 (5–6 at top programs)', 'IELTS ~5.5–7.5 / TOEFL ~60–100'],
              ['Tuition', 'Usually lower', 'Often 10–30% higher at the same school'],
              ['Bachelor’s CSCA (2026+)', 'Required', 'Required'],
              ['Classroom language', 'Mandarin', 'English (campus life still Mandarin-heavy)'],
              ['Internship / local jobs', 'Easier with HSK in hand', 'Possible; Chinese still helps off campus'],
              ['Best if you…', 'Want lower fees + China career immersion', 'Need English instruction now'],
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'Browse English-taught programmes', href: '/programs?language=English' },
              { label: 'Browse Chinese-taught programmes', href: '/programs?language=Chinese' },
              { label: 'English-taught programs deep dive', href: '/english-taught-programs-china' },
              { label: 'HSK guide', href: '/guides/hsk' },
            ],
          },
        ],
      },
      {
        id: 'fees',
        h2: 'Fees: what you actually pay',
        intro: 'Language track changes tuition more than dorm or food.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese-taught bachelor’s** — often toward the lower published bands at the same university',
              '**ETP bachelor’s** — commonly ¥18,000–50,000/year depending on school and major',
              '**ETP master’s** — commonly ¥25,000–70,000/year; MBBS English tracks higher still',
              '**Living costs** — same city = same rent/food whether your classes are EN or ZH',
              '**CSC** — can wipe the tuition gap entirely when awarded',
            ],
          },
        ],
      },
      {
        id: 'hsk-jobs',
        h2: 'HSK level and jobs',
        intro: 'Instruction language ≠ career language.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese-taught** — HSK 4 unlocks many bachelor’s; HSK 5 is safer for competitive majors and daily academic reading',
              '**ETP** — you can graduate without HSK, but Z-visa / local employer interviews still favor HSK 4+',
              '**Hybrid path** — start ETP, take free campus Chinese classes, sit HSK before final year',
              '**Return-home careers** — English-taught degrees are fine; Chinese-taught can be a plus for China-facing roles',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'If your goal is working in China after graduation, treat Mandarin as a career skill even on an English degree track.',
          },
          {
            type: 'links',
            items: [
              { label: 'Working in China after graduation', href: '/guides/part-time-work' },
              { label: 'CSCA for English-taught programs', href: '/csca-english-taught-programs' },
            ],
          },
        ],
      },
      {
        id: 'how-to-choose',
        h2: 'How to choose in 3 questions',
        intro: 'Answer these before paying any application fee.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Can I reach HSK 4–5 before enrollment?** If no, prefer ETP or a language year first',
              '**Is my major deep on the MOE ETP catalog?** Some humanities/law majors are still mostly Chinese-taught',
              '**Where will I work?** China-based career → invest in Mandarin; home-country Anglophone career → ETP is enough for many fields',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is English-taught more expensive than Chinese-taught in China?',
        a: 'Usually yes — often about 10–30% higher tuition at the same university. Dorm and living costs are similar. CSC can cover either track.',
      },
      {
        q: 'Do English-taught programs require HSK?',
        a: 'Not to apply. Universities ask for IELTS/TOEFL instead. Many still offer free Chinese classes, and HSK helps daily life and jobs.',
      },
      {
        q: 'Do Chinese-taught programs require IELTS?',
        a: 'Usually no. They require HSK. Some bilingual programs may ask for both — read the notice.',
      },
      {
        q: 'Does CSCA apply to both tracks?',
        a: 'Yes for bachelor’s applicants from the 2026 intake onward, including English-taught programs.',
      },
    ],
    howToSteps: [
      {
        name: 'Pick the language track',
        text: 'Match HSK readiness, budget, and career geography.',
      },
      {
        name: 'Filter the SICA catalog',
        text: 'Use /programs?language=English or /programs?language=Chinese, then open university pages.',
      },
      {
        name: 'Confirm tests',
        text: 'Book IELTS/TOEFL or HSK, plus CSCA for bachelor’s.',
      },
    ],
    ctaTitle: 'Not sure which language track fits you?',
    ctaSubtitle:
      'SICA matches majors to English vs Chinese catalogs and builds a test timeline (HSK / IELTS / CSCA). First consult free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/english-taught-programs-china',
        label: 'English-taught programs in China',
        description: 'Full ETP landscape and admissions path.',
      },
      {
        href: '/guides/hsk',
        label: 'HSK guide',
        description: 'Levels, prep, and when you need which band.',
      },
      {
        href: '/guides/part-time-work',
        label: 'Work during & after study',
        description: 'Why Mandarin still matters on ETP.',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
  zh: {
    slug: 'chinese-taught-vs-english-taught-programs-china',
    eyebrow: '指南 · 授课语言',
    title: '中国留学：中文授课 vs 英文授课',
    description:
      '中国中文授课与英文授课学位对比：学费、HSK 与雅思、毕业就业，并链到两套项目目录。',
    seoTitle: '中文授课 vs 英文授课项目 | SICA',
    seoDescription:
      '对比中国中文授课与英文授课：学费、HSK 等级、职业影响，以及何时选哪条轨道。',
    subtitle:
      '同一所大学，不同语言轨道。英文授课（ETP）学费更高但入学可免 HSK；中文授课通常更便宜，达到 HSK 4–5+ 后更利于本地实习与就业。',
    stats: [
      { value: '+10–30%', label: 'ETP 学费常见溢价' },
      { value: 'HSK 4–5', label: '中文轨常见门槛' },
      { value: '雅思/托福', label: '英文轨语言考试' },
      { value: 'CSCA', label: '本科：两轨都要（2026+）' },
    ],
    quickAnswer:
      '**英文授课项目**用雅思/托福申请（入学可不要求 HSK），学费通常高约 **10–30%**，适合需要尽快开课的学生。**中文授课项目**通常需要 **HSK 4–5**（竞争专业或要 5–6），费用更低，若目标是中文实习或留华工作更有优势。自 **2026 级**起，本科申请者**两轨**都仍需参加 **CSCA**。在 /programs 用 language=English 或 language=Chinese 筛选 SICA 目录。',
    keyTakeaways: [
      'ETP：雅思/托福入学，申请通常免 HSK；学费往往更高',
      '中文授课：常见 HSK 4–5+；费用更低；校园中文环境更深',
      '2026 级起本科 CSCA 两轨都要',
      'CSC 资助对两种语言轨道均开放',
      '毕业后在华就业即使读 ETP 也更看重中文能力',
    ],
    sections: [
      {
        id: 'comparison',
        h2: '对照表',
        intro: '先选轨道，再筛选大学。',
        blocks: [
          {
            type: 'table',
            caption: '中文授课 vs 英文授课',
            columns: ['维度', '中文授课', '英文授课（ETP）'],
            rows: [
              ['入学语言考试', 'HSK 4–5（顶尖项目 5–6）', '雅思约 5.5–7.5 / 托福约 60–100'],
              ['学费', '通常更低', '同学同专业常高 10–30%'],
              ['本科 CSCA（2026+）', '需要', '需要'],
              ['课堂语言', '普通话', '英语（校园生活仍偏中文）'],
              ['实习 / 本地工作', '已有 HSK 更易', '可以；校外仍受益于中文'],
              ['更适合…', '要低学费 + 中国职场沉浸', '现在就需要全英文教学'],
            ],
          },
          {
            type: 'links',
            items: [
              { label: '浏览英文授课项目', href: '/programs?language=English' },
              { label: '浏览中文授课项目', href: '/programs?language=Chinese' },
              { label: '英文授课深度指南', href: '/english-taught-programs-china' },
              { label: 'HSK 指南', href: '/guides/hsk' },
            ],
          },
        ],
      },
      {
        id: 'fees',
        h2: '费用：实际多付在哪',
        intro: '语言轨道对学费影响大于宿舍或餐饮。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中文授课本科**——同学费区间里往往靠下沿',
              '**ETP 本科**——常见每年 ¥18,000–50,000，因校因专业而异',
              '**ETP 硕士**——常见每年 ¥25,000–70,000；英文 MBBS 更高',
              '**生活费**——同城则中英授课租金餐饮相近',
              '**CSC**——获奖后可抹平学费差距',
            ],
          },
        ],
      },
      {
        id: 'hsk-jobs',
        h2: 'HSK 等级与就业',
        intro: '授课语言 ≠ 职业语言。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中文授课**——HSK 4 可开许多本科；竞争专业与学术阅读更稳妥到 HSK 5',
              '**ETP**——可不考 HSK 毕业，但 Z 字签证 / 本地雇主面试仍偏好 HSK 4+',
              '**混合路径**——先读 ETP，利用免费汉语课，毕业前考 HSK',
              '**回国就业**——英文学位通常足够；面向中国业务的岗位则中文授课是加分项',
            ],
          },
        ],
      },
      {
        id: 'how-to-choose',
        h2: '三个问题帮你选型',
        intro: '缴费前先回答。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**入学前能否达到 HSK 4–5？** 不能 → 优先 ETP 或先读语言年',
              '**我的专业在教育部 ETP 目录里深吗？** 部分人文/法学仍以中文授课为主',
              '**毕业后在哪工作？** 留华 → 投资普通话；回国英语职场 → 许多专业读 ETP 即可',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国英文授课比中文授课更贵吗？',
        a: '通常更贵——同学同专业学费常高约 10–30%。宿舍与生活费相近。CSC 可覆盖任一轨道。',
      },
      {
        q: '英文授课需要 HSK 吗？',
        a: '申请通常不需要，改考雅思/托福。许多学校仍提供免费汉语课；日常生活与就业仍受益于 HSK。',
      },
      {
        q: '中文授课需要雅思吗？',
        a: '通常不需要，改考 HSK。部分双语项目可能两者都要——以简章为准。',
      },
      {
        q: 'CSCA 两轨都要考吗？',
        a: '自 2026 级起，本科申请者两轨都要，包括英文授课。',
      },
    ],
    howToSteps: [
      {
        name: '选定语言轨道',
        text: '对照 HSK 准备度、预算与职业地理。',
      },
      {
        name: '筛选 SICA 目录',
        text: '使用 /programs?language=English 或 /programs?language=Chinese，再打开大学页。',
      },
      {
        name: '确认考试',
        text: '预约雅思/托福或 HSK；本科另加 CSCA。',
      },
    ],
    ctaTitle: '不确定选哪条语言轨道？',
    ctaSubtitle:
      'SICA 按专业匹配中英文目录，并制定考试时间线（HSK / 雅思 / CSCA）。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/english-taught-programs-china',
        label: '中国英文授课项目',
        description: 'ETP 全景与申请路径。',
      },
      {
        href: '/guides/hsk',
        label: 'HSK 指南',
        description: '等级、备考与所需分数。',
      },
      {
        href: '/guides/part-time-work',
        label: '在读与毕业后工作',
        description: '为何 ETP 仍需要普通话。',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
};
