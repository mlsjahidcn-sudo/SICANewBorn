import type { LocalizedGuide } from './types';

/**
 * CSC recommendation letter sample — who signs, what it must cover,
 * and a usable outline. Target query: "csc recommendation letter sample".
 *
 * Complements /chinese-government-scholarship-csc (checklist only) and
 * /how-to-write-study-plan-china (applicant-written plan).
 */
export const cscRecommendationLetterSampleGuide: LocalizedGuide = {
  en: {
    slug: 'csc-recommendation-letter-sample',
    eyebrow: 'GUIDE · CSC · DOCUMENTS',
    title: 'CSC Recommendation Letter Sample: Who Signs It and What It Must Cover',
    description:
      'CSC recommendation letter sample for 2027: who should sign, required content, length, and a section-by-section outline you can give your referees.',
    seoTitle: 'CSC Recommendation Letter Sample 2027 | SICA',
    seoDescription:
      'CSC recommendation letter sample: who signs, what reviewers expect, length tips, and a clear outline for academic and employer referees.',
    subtitle:
      'Chinese Government Scholarship (CSC) applications usually need two recommendation letters. This page is the sample outline — not a fake letter to copy verbatim — covering who may sign, what must appear, and a structure referees can finish in one sitting.',
    stats: [
      { value: '2 letters', label: 'Typical CSC minimum' },
      { value: 'Associate+', label: 'Usual academic rank floor' },
      { value: '1–2 pages', label: 'Working length' },
      { value: 'Official', label: 'Letterhead + contact details' },
    ],
    quickAnswer:
      'For CSC, prepare **at least two recommendation letters** on official letterhead. For degree applicants, referees are usually **professors or associate professors** who taught or supervised you; one academic + one research/employer letter is common for applicants with work experience. Each letter should identify the referee, state how they know you and for how long, evaluate academic ability and character with concrete examples, affirm suitability for study in China, and end with a clear recommendation plus contact details. Do not write the letter yourself for a signature-only stamp — weak, generic praise is easy to spot.',
    keyTakeaways: [
      'Two letters is the working minimum; PhD tracks often expect stronger academic referees (sometimes three)',
      'Prefer associate professor / professor (or equivalent) who know your coursework, thesis, or research',
      'Must cover: relationship + duration, academic/research evidence, character, China/program fit, explicit recommend',
      'Use institutional letterhead, dated signature, email and phone the embassy/university can verify',
      'English or Chinese is fine when the program language matches; keep spelling of your name identical to the passport',
      'Give referees your CV, study plan, and target major — not a finished letter to rubber-stamp',
    ],
    sections: [
      {
        id: 'who-signs',
        h2: 'Who should sign a CSC recommendation letter?',
        intro: 'Rank matters less than genuine knowledge of your work — but CSC reviewers still expect academic credibility.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Bachelor’s / master’s** — typically two academic referees (course lecturers, thesis advisors). Associate professor or above is the usual ask when your university uses those ranks',
              '**PhD / research master’s** — prioritize research supervisors who can discuss methods, publications, or lab performance; some notices ask for three academic letters',
              '**Work experience** — one academic + one employer/research manager is acceptable when the job is relevant to the major',
              '**Avoid** — relatives, classmates, agents, or anyone who has never assessed your academic work',
              '**Language** — English for English-taught targets; Chinese (or bilingual) for Chinese-taught when the referee can write it well',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'A letter signed by a famous professor who cannot describe a single project of yours is weaker than a detailed letter from your actual thesis advisor.',
          },
        ],
      },
      {
        id: 'must-cover',
        h2: 'What the letter must cover',
        intro: 'Reviewers skim for these elements. Missing any one makes the letter look incomplete.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Referee identity** — full name, title/rank, department, university or company, email, phone',
              '**Relationship** — courses taught, thesis supervised, or projects managed; start and end dates',
              '**Academic evaluation** — grades relative to peers, research skills, publications, awards — with specifics',
              '**Character & soft skills** — integrity, teamwork, perseverance (one short paragraph, still concrete)',
              '**Fit for China / the program** — why this applicant can succeed in the named degree field',
              '**Clear recommendation** — “I strongly recommend…” plus willingness to answer follow-up questions',
              '**Signature block** — handwritten or verified digital signature, date, official letterhead or stamp where customary',
            ],
          },
        ],
      },
      {
        id: 'outline-sample',
        h2: 'Sample outline (give this to your referee)',
        intro:
          'This is a structure, not a fill-in-the-blank fake letter. Referees should write in their own voice.',
        blocks: [
          {
            type: 'h3',
            text: 'Paragraph 1 — Introduction',
            body: 'State who you are, your position, and that you recommend [Full Name as on passport] for the Chinese Government Scholarship / [degree] in [major] at [university if known]. Mention how long you have known the applicant and in what capacity.',
          },
          {
            type: 'h3',
            text: 'Paragraph 2 — Academic or professional evidence',
            body: 'Name 2–3 concrete achievements: thesis title, lab techniques, competition results, GPA rank, papers, or workplace deliverables. Compare briefly to classmates or colleagues (“top 5% of my 2024 cohort”).',
          },
          {
            type: 'h3',
            text: 'Paragraph 3 — Character and readiness',
            body: 'Describe work habits, communication, and resilience with one short anecdote. Link these traits to studying abroad in China (independent learning, cross-cultural teamwork).',
          },
          {
            type: 'h3',
            text: 'Paragraph 4 — Closing recommendation',
            body: 'Reaffirm a strong recommendation. Invite verification: email and phone. Sign, date, and attach letterhead.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Length: about 400–800 words (one to two pages). Longer is fine if every paragraph adds evidence; shorter is fine if every claim is specific.',
          },
        ],
      },
      {
        id: 'applicant-checklist',
        h2: 'Applicant checklist before you ask',
        intro: 'Help your referees write faster and stronger.',
        blocks: [
          {
            type: 'ul',
            items: [
              'Send passport-name spelling, target degree, major, and whether the route is Type A or Type B',
              'Attach CV, transcript, and your study-plan draft (see /how-to-write-study-plan-china)',
              'Remind them of deadlines (country CSC notices often close before university Type B dates)',
              'Ask for PDF on letterhead + a signed scan if a wet-ink original is required later',
              'Keep copies; some universities and embassies both collect the letters',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'CSC Scholarship 2027/2028 guide', href: '/chinese-government-scholarship-csc' },
              { label: 'How to write a study plan for China', href: '/how-to-write-study-plan-china' },
              { label: 'Pre-admission letter for CSC 2027', href: '/pre-admission-letter-csc-2027' },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How many recommendation letters does CSC require?',
        a: 'Most CSC degree applications ask for at least two. PhD and some research tracks may expect additional academic letters — follow your country notice and university checklist.',
      },
      {
        q: 'Can I write the recommendation letter myself?',
        a: 'No. Drafting talking points for your referee is fine; submitting a self-written letter for a signature-only stamp risks rejection if the voice and detail do not match the referee’s knowledge.',
      },
      {
        q: 'What rank should the referee hold?',
        a: 'Universities commonly ask for associate professor or professor (or equivalent). A detailed letter from your actual supervisor beats a vague letter from a higher-ranked stranger.',
      },
      {
        q: 'Should the letter be in Chinese or English?',
        a: 'Match the program language when possible. English is widely accepted for English-taught programs; Chinese-taught programs often prefer Chinese or bilingual letters when the referee can write them well.',
      },
      {
        q: 'Is a company recommendation letter accepted?',
        a: 'Yes as one of the two when you have relevant work experience, usually paired with at least one academic letter. Pure employer letters without academic context are weaker for fresh graduates.',
      },
    ],
    howToSteps: [
      {
        name: 'Pick two credible referees',
        text: 'Choose people who taught or supervised you. Confirm they can meet the CSC deadline.',
      },
      {
        name: 'Send a brief pack',
        text: 'Passport name, CV, transcript, study-plan draft, target major, and the outline on this page.',
      },
      {
        name: 'Collect letterhead PDFs',
        text: 'Ensure signature, date, email, and phone are present. Keep backups for embassy and university uploads.',
      },
      {
        name: 'Upload with the CSC file',
        text: 'Submit alongside the study plan and any pre-admission evidence your route requires.',
      },
    ],
    ctaTitle: 'Building your full CSC document pack?',
    ctaSubtitle:
      'SICA counselors review recommendation strategy, study plans, and pre-admission timing for Pakistan, Bangladesh, and Nigeria applicants. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/pre-admission-letter-csc-2027',
        label: 'Pre-admission letter for CSC 2027',
        description: 'Type A vs Type B letters, Nov–March window, professor email template.',
      },
      {
        href: '/how-to-write-study-plan-china',
        label: 'Study plan for China',
        description: 'The applicant-written counterpart to recommendation letters.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027/2028',
        description: 'Full scholarship categories, documents, and deadlines.',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
  zh: {
    slug: 'csc-recommendation-letter-sample',
    eyebrow: '指南 · CSC · 材料',
    title: 'CSC 推荐信范文结构：谁来写、必须写什么',
    description:
      '2027 年 CSC 推荐信：签署人资格、必备内容、篇幅建议，以及可直接发给推荐人的分段提纲。',
    seoTitle: 'CSC 推荐信范文结构 2027 | SICA',
    seoDescription:
      'CSC 推荐信：谁适合签署、评审关注点、篇幅建议，以及学术与雇主推荐人可用的清晰提纲。',
    subtitle:
      '中国政府奖学金（CSC）申请通常需要两封推荐信。本页提供结构提纲——不是可供照抄的虚假全文——说明谁可签署、必须包含什么，以及推荐人一次就能写完的框架。',
    stats: [
      { value: '2 封', label: 'CSC 常见下限' },
      { value: '副教授+', label: '常见学术职级要求' },
      { value: '1–2 页', label: '建议篇幅' },
      { value: '公函', label: '单位抬头 + 联系方式' },
    ],
    quickAnswer:
      'CSC 申请请准备**至少两封**印有单位抬头的推荐信。学位申请人的推荐人通常是教过或指导过你的**教授 / 副教授**；有工作经历者常见“一学术 + 一研究/雇主”。每封信应写明推荐人身份、认识你的方式与时长、用具体事例评价学业与品行、说明适合赴华学习，并以明确推荐语与可核验联系方式收尾。不要自己写好全文只求盖章——空洞套话很容易被识破。',
    keyTakeaways: [
      '通常至少两封；博士方向往往要求更强的学术推荐人（有时三封）',
      '优先选择了解你课程、论文或科研的副教授 / 教授（或同等职级）',
      '必须覆盖：关系与时长、学业证据、品行、项目匹配、明确推荐',
      '使用单位抬头、注明日期与签名，并留下可核验的邮箱与电话',
      '英文或中文均可，尽量与授课语言匹配；姓名拼写与护照完全一致',
      '给推荐人简历、学习计划与目标专业——而不是一份只待签字的成稿',
    ],
    sections: [
      {
        id: 'who-signs',
        h2: '谁适合签署 CSC 推荐信？',
        intro: '职级重要，但真正了解你的工作更重要——评审仍期待学术可信度。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**本科 / 硕士**——通常两名学术推荐人（任课教师、论文导师）。学校使用相应职级时，常见要求为副教授及以上',
              '**博士 / 研究型硕士**——优先能谈方法、论文或实验室表现的科研导师；部分通知要求三封学术推荐信',
              '**有工作经历**——专业相关时，一学术 + 一雇主/研究管理者可接受',
              '**避免**——亲属、同学、中介，或从未评价过你学业的人',
              '**语言**——英文授课目标用英文；中文授课且推荐人中文写作能力强时可用中文或双语',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '一位不了解你任何具体项目的“名教授”签名，往往弱于你的论文导师写出的详实推荐信。',
          },
        ],
      },
      {
        id: 'must-cover',
        h2: '推荐信必须覆盖的内容',
        intro: '评审会快速扫描这些要素，缺一项都会显得不完整。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**推荐人身份**——全名、职称/职级、院系、学校或单位、邮箱、电话',
              '**关系说明**——所授课程、指导论文或管理的项目；起止时间',
              '**学业评价**——相对同龄人的成绩、科研能力、论文、奖项——要具体',
              '**品行与软技能**——诚信、协作、毅力（一小段，仍需具体）',
              '**与中国 / 项目的匹配**——为何能胜任该学位专业',
              '**明确推荐**——“我强烈推荐……”并愿意接受追问',
              '**签署栏**——手写或可核验电子签名、日期、单位抬头或按惯例盖章',
            ],
          },
        ],
      },
      {
        id: 'outline-sample',
        h2: '范文提纲（可发给推荐人）',
        intro: '这是结构，不是填空假信。请推荐人用自己的语气撰写。',
        blocks: [
          {
            type: 'h3',
            text: '第 1 段——引言',
            body: '说明你的身份与职务，并推荐 [护照全名] 申请中国政府奖学金 / [学位] [专业]（若已知目标大学可写出）。写明认识申请人的时长与身份。',
          },
          {
            type: 'h3',
            text: '第 2 段——学业或专业证据',
            body: '列出 2–3 项具体成就：论文题目、实验技能、竞赛、GPA 排名、发表或工作成果。可与同学/同事简要比较（如“2024 级前 5%”）。',
          },
          {
            type: 'h3',
            text: '第 3 段——品行与赴华准备',
            body: '用一小段事例说明学习习惯、沟通与抗压能力，并关联在中国留学所需的独立学习与跨文化协作。',
          },
          {
            type: 'h3',
            text: '第 4 段——结尾推荐',
            body: '再次明确强烈推荐，留下邮箱与电话以便核实，签名、注明日期并使用单位抬头。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '篇幅：约 400–800 词（一至两页）。每段都有证据则可更长；句句具体则可更短。',
          },
        ],
      },
      {
        id: 'applicant-checklist',
        h2: '请托前申请人自检',
        intro: '帮助推荐人写得更快、更有力。',
        blocks: [
          {
            type: 'ul',
            items: [
              '发送护照姓名拼写、目标学位与专业，以及 Type A 或 Type B 路径',
              '附上简历、成绩单与学习计划草稿（见 /how-to-write-study-plan-china）',
              '提醒截止日期（国家 CSC 通知往往早于大学 Type B）',
              '索取带抬头的 PDF；若后续需要纸质原件，再补签字扫描件',
              '自行留存副本；使馆与大学可能都要收集',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'CSC 奖学金 2027/2028 指南', href: '/chinese-government-scholarship-csc' },
              { label: '如何写赴华学习计划', href: '/how-to-write-study-plan-china' },
              { label: 'CSC 2027 预录取通知', href: '/pre-admission-letter-csc-2027' },
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSC 需要几封推荐信？',
        a: '多数学位申请至少两封。博士及部分研究型项目可能要求更多学术推荐信——以本国通知与大学清单为准。',
      },
      {
        q: '可以自己写推荐信吗？',
        a: '不可以代写全文。给推荐人提供要点可以；只求签字盖章的自写推荐信，一旦语气与细节对不上，有拒件风险。',
      },
      {
        q: '推荐人需要什么职级？',
        a: '高校常见要求为副教授或教授（或同等）。真正指导过你的人写的详实信件，优于陌生“更高职级”的空泛信件。',
      },
      {
        q: '用中文还是英文？',
        a: '尽量匹配授课语言。英文授课项目广泛接受英文；中文授课项目在推荐人中文写作能力强时，往往更偏好中文或双语。',
      },
      {
        q: '公司推荐信可以吗？',
        a: '有相关工作经历时可作为两封中的一封，通常仍需至少一封学术推荐信。应届生仅有雇主信、缺少学术语境时较弱。',
      },
    ],
    howToSteps: [
      {
        name: '选定两名可信推荐人',
        text: '选择教过或指导过你的人，并确认能赶上 CSC 截止日期。',
      },
      {
        name: '发送简要材料包',
        text: '护照姓名、简历、成绩单、学习计划草稿、目标专业，以及本页提纲。',
      },
      {
        name: '收取带抬头的 PDF',
        text: '确保有签名、日期、邮箱与电话，并为使馆与大学上传留备份。',
      },
      {
        name: '随 CSC 材料一并上传',
        text: '与学习计划及路径所需的预录取证明一起提交。',
      },
    ],
    ctaTitle: '正在准备完整的 CSC 材料包？',
    ctaSubtitle:
      'SICA 顾问可为巴基斯坦、孟加拉、尼日利亚申请人检查推荐信策略、学习计划与预录取时间节点。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/pre-admission-letter-csc-2027',
        label: 'CSC 2027 预录取通知',
        description: 'Type A 与 Type B、11–3 月窗口、教授邮件模板。',
      },
      {
        href: '/how-to-write-study-plan-china',
        label: '赴华学习计划',
        description: '与推荐信对应的申请人自书材料。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027/2028',
        description: '奖学金类别、材料与截止日期全览。',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
};
