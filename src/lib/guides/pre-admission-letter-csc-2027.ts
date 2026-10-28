import type { LocalizedGuide } from './types';

/**
 * How to get a pre-admission letter for CSC 2027.
 * Target query: "pre-admission letter csc 2027".
 *
 * Grounded in USTB International Student Center notice
 * "2027 Pre-Admission for CSC Type A" (posted 2026-10-28):
 * https://iscen.ustb.edu.cn/Notices/a9ea21b5369b4dab90c7132331768704.htm
 *
 * Complements the flagship CSC guide section that only states
 * evidence is required — this page is the how-to.
 */
export const preAdmissionLetterCsc2027Guide: LocalizedGuide = {
  en: {
    slug: 'pre-admission-letter-csc-2027',
    eyebrow: 'GUIDE · CSC 2027',
    title: 'How to Get a Pre-Admission Letter for CSC 2027',
    description:
      'CSC 2027 pre-admission letter: Type A vs Type B, the November–March window, required documents, and an email template for professors and international offices.',
    seoTitle: 'Pre-Admission Letter for CSC 2027 | SICA',
    seoDescription:
      'Get a CSC 2027 pre-admission letter: Type A vs Type B, Nov–March timing, documents, and a ready email template for universities.',
    subtitle:
      'Many 2027/2028 country CSC routes require university admission or pre-admission evidence before you submit. This guide explains Type A vs Type B letters, when to ask (generally November–March), what to attach, and how to email the right office — using the University of Science and Technology Beijing (USTB) 2027 Type A notice as a concrete example.',
    stats: [
      { value: 'Type A', label: 'Bilateral / embassy channel letter' },
      { value: 'Type B', label: 'University program channel' },
      { value: 'Nov–Mar', label: 'Typical pre-admission window' },
      { value: '≠ offer', label: 'Not the final admission notice' },
    ],
    quickAnswer:
      'A **CSC pre-admission letter** (also called a pre-admission notice) is a university document that helps you complete a Chinese Government Scholarship application in your home country. It is **not** the final Admission Notice. For **Type A** (bilateral / embassy) applicants, some universities — for example USTB for 2027 — issue a dedicated Pre-Admission Notice (CSC—Type A) when you email a document pack during roughly **November to March**. **Type B** (High-Level Postgraduate / Silk Road and similar university programs) usually follows the university’s own supervisor or admissions process; do not apply for a Type A–only notice if you are only filing Type B. List the issuing university among your CSC choices (first choice when possible).',
    keyTakeaways: [
      'Pre-admission ≠ final admission; it supports the scholarship file',
      'Type A letters serve embassy/bilateral routes; Type B uses university program channels',
      'Working window at many schools: November → March of the intake year',
      'Typical pack: passport, degrees/enrollment proof, transcripts, study plan, language evidence; bachelor’s may need CSCA',
      'Email subject and body must name the exact program; follow each school’s address (e.g. USTB csctypea@ustb.edu.cn)',
      'After you receive the letter, put that university on your CSC preference list',
    ],
    sections: [
      {
        id: 'type-a-vs-type-b',
        h2: 'Type A vs Type B pre-admission letters',
        intro: 'Ask for the letter that matches the CSC channel you will actually submit.',
        blocks: [
          {
            type: 'table',
            caption: 'CSC pre-admission: Type A vs Type B',
            columns: ['', 'Type A (bilateral / embassy)', 'Type B (university programs)'],
            rows: [
              [
                'Who you apply through',
                'Home dispatching authority, ministry, or Chinese embassy/consulate',
                'Directly to a Chinese university (e.g. High-Level Postgraduate, Silk Road)',
              ],
              [
                'What the letter is for',
                'Upload / submit with the country CSC file as university evidence',
                'Often a supervisor acceptance or university pre-admit inside the Type B portal',
              ],
              [
                'USTB 2027 rule (example)',
                'Dedicated “Pre-Admission Notice (CSC—Type A)” via international student centre email',
                'Do **not** use the Type A pre-admission mailbox for Type B-only applicants',
              ],
              [
                'After you receive it',
                'List that university on your CSC Type A choices (first choice recommended)',
                'Follow the university’s Type B checklist and deadline',
              ],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'USTB’s 2027 notice states clearly: applicants for the High-Level Postgraduate Program or Silk Road Program (CSC—Type B) shall not apply for the Type A Pre-Admission Notice. Mixing channels wastes time and can confuse reviewers.',
          },
          {
            type: 'links',
            items: [
              {
                label: 'USTB — 2027 Pre-Admission for CSC Type A (official notice)',
                href: 'https://iscen.ustb.edu.cn/Notices/a9ea21b5369b4dab90c7132331768704.htm',
              },
              {
                label: 'SICA: CSC Scholarship 2027/2028',
                href: '/chinese-government-scholarship-csc',
              },
              {
                label: 'SICA: CSC deadlines tracker',
                href: '/csc-scholarship-deadlines-2027-2028',
              },
            ],
          },
        ],
      },
      {
        id: 'nov-march-window',
        h2: 'The November–March window',
        intro: 'Start early — country CSC deadlines can close while you are still waiting on a letter.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Typical university window** — USTB describes Type A pre-admission as generally **November to March** of the following year',
              '**Parallel tracks** — request letters while you prepare CSCA (bachelor’s), study plan, and recommendation letters',
              '**Country deadlines** — some 2027/28 bilateral notices close in December–January; do not assume March is safe for your embassy route',
              '**Processing time** — USTB aims to issue within **7 working days** after a complete email pack (other schools vary)',
              '**Multiple universities** — you may request more than one letter, but only submit evidence that matches the universities you list on CSC',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A pre-admission document does not guarantee CSC funding. It only helps you complete a compliant scholarship application.',
          },
        ],
      },
      {
        id: 'documents',
        h2: 'Documents to attach',
        intro: 'USTB’s 2027 Type A list is a solid template; always mirror the target university’s notice.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Passport copy** — biodata page',
              '**Degree certificates** — bachelor’s and master’s as applicable; or official enrollment certificate with expected graduation date if you have not graduated yet',
              '**Transcripts** — all courses, scores, and grading scale; original or notarised Chinese/English copy',
              '**Study plan** — clearly state the intended degree and major name',
              '**Language evidence** — HSK or English proficiency; if unavailable, explain in the email',
              '**Bachelor’s applicants** — CSCA score report when the university or CSC route requires it',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'How to write a study plan for China', href: '/how-to-write-study-plan-china' },
              { label: 'CSC recommendation letter sample', href: '/csc-recommendation-letter-sample' },
              { label: 'CSCA and the CSC scholarship', href: '/csca-csc-scholarship' },
            ],
          },
        ],
      },
      {
        id: 'email-template',
        h2: 'Email template (professors & international offices)',
        intro:
          'Use the university’s published mailbox when one exists. For supervisor-led Type B routes, write the professor and CC the international student office.',
        blocks: [
          {
            type: 'h3',
            text: 'Subject line',
            body: 'Pre-Admission (Type A) Application + [Your English Full Name] — or follow the exact subject format in the university notice.',
          },
          {
            type: 'p',
            text: 'Example body you can adapt:',
          },
          {
            type: 'ul',
            items: [
              'Dear International Student Center / Professor [Name],',
              'I am [Full Name as on passport], a citizen of [Country], applying for the Chinese Government Scholarship **Type A** for the **2027/2028** intake.',
              'I request a **Pre-Admission Notice (CSC—Type A)** for the program: **[Exact major name, degree level]** at **[University name]**.',
              'Attached: passport copy; degree / enrollment certificates; transcripts; study plan; language certificate (or explanation); CSCA report if applicable.',
              'If awarded, I will list **[University]** among my CSC university choices (first choice if allowed).',
              'Thank you for your time. I am happy to provide any additional materials.',
              'Kind regards, [Full Name] | [Email] | [Phone / WhatsApp] | [Passport number]',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'USTB example: send materials to csctypea@ustb.edu.cn with a clear subject such as “Pre-Admission (Type A) Application + English Full Name”, and name the program in the email body (Chinese or English).',
          },
        ],
      },
      {
        id: 'after-you-get-it',
        h2: 'After you receive the letter',
        intro: 'The letter only helps if your CSC form and uploads stay consistent.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Save the PDF and a print-ready copy',
              'Enter the same university (and preferably first choice) on the CSC application',
              'Upload the letter where your country portal or embassy checklist asks for admission / pre-admission evidence',
              'Keep requesting final admission and JW201 through the normal scholarship result path — pre-admission is not your visa document',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is a CSC pre-admission letter the same as an admission notice?',
        a: 'No. Universities such as USTB state that the Pre-Admission Notice only helps you complete the scholarship application at home. Final admission and JW201/JW202 come later if you are selected.',
      },
      {
        q: 'Do Type B applicants need a Type A pre-admission letter?',
        a: 'Usually no. Type B (university programs such as High-Level Postgraduate or Silk Road) follows the university’s own process. USTB’s 2027 notice tells Type B applicants not to apply for the Type A pre-admission mailbox.',
      },
      {
        q: 'When should I request a pre-admission letter for 2027?',
        a: 'Many universities process Type A pre-admission from about November to March. Start as soon as your transcripts and study plan are ready, and check your country CSC deadline — some close earlier than March.',
      },
      {
        q: 'What if the university never replies?',
        a: 'Follow up once after the stated processing time (e.g. seven working days). Parallel-request another CSC-eligible university rather than waiting on a single silent inbox.',
      },
      {
        q: 'Can I use a professor invitation instead of an admissions-office letter?',
        a: 'Some country notices accept a school/supervisor invitation as admission evidence. Confirm with your dispatching authority; a generic application receipt is often not enough.',
      },
    ],
    howToSteps: [
      {
        name: 'Choose Type A or Type B',
        text: 'Match the letter request to the CSC channel you will submit. Do not ask for a Type A-only notice if you are Type B-only.',
      },
      {
        name: 'Prepare the document pack',
        text: 'Passport, degrees or enrollment proof, transcripts, study plan, language evidence, CSCA if required.',
      },
      {
        name: 'Email in the Nov–March window',
        text: 'Use the published address and subject format. Name the exact program in the body.',
      },
      {
        name: 'List the university on CSC',
        text: 'When the pre-admission arrives, put that school on your preference list and upload the file with your scholarship application.',
      },
    ],
    ctaTitle: 'Need a CSC 2027 document timeline?',
    ctaSubtitle:
      'SICA helps you sequence pre-admission requests, CSCA, recommendation letters, and country deadlines for Pakistan, Bangladesh, and Nigeria. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csc-recommendation-letter-sample',
        label: 'CSC recommendation letter sample',
        description: 'Who signs, what to cover, and a referee outline.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027/2028',
        description: 'Categories, coverage, and the full document list.',
      },
      {
        href: '/csc-scholarship-deadlines-2027-2028',
        label: 'CSC deadlines 2027/2028',
        description: 'Country-by-country dates and [Check] rows for PK/BD/NG.',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
  zh: {
    slug: 'pre-admission-letter-csc-2027',
    eyebrow: '指南 · CSC 2027',
    title: '如何获取 CSC 2027 预录取通知书',
    description:
      'CSC 2027 预录取：Type A 与 Type B、11–3 月窗口、所需材料，以及写给教授与国际学生办公室的邮件模板。',
    seoTitle: 'CSC 2027 预录取通知书指南 | SICA',
    seoDescription:
      '获取 CSC 2027 预录取通知：Type A/B 区别、11–3 月时间、材料清单，以及可直接使用的大学邮件模板。',
    subtitle:
      '许多 2027/2028 国家 CSC 路径要求在提交前具备大学录取或预录取证明。本指南说明 Type A 与 Type B 信件、何时申请（一般 11–3 月）、附哪些材料、如何写邮件——并以北京科技大学（USTB）2027 Type A 通知为具体示例。',
    stats: [
      { value: 'Type A', label: '双边 / 使馆渠道预录取' },
      { value: 'Type B', label: '高校项目渠道' },
      { value: '11–3 月', label: '常见预录取窗口' },
      { value: '≠ 正式录取', label: '不是最终录取通知书' },
    ],
    quickAnswer:
      '**CSC 预录取通知书**是帮助你在本国完成中国政府奖学金申请的大学文件，**不等于**最终录取通知书。**Type A**（双边 / 使馆）申请人可向部分高校——例如 USTB 2027——在约 **11 月至次年 3 月**通过邮件材料包申请专用的 Pre-Admission Notice（CSC—Type A）。**Type B**（高水平研究生 / 丝绸之路等高校项目）通常走学校自己的导师或招生流程；若只申请 Type B，不要去申请仅限 Type A 的预录取邮箱。收到后请将该校列入 CSC 志愿（尽可能第一志愿）。',
    keyTakeaways: [
      '预录取 ≠ 最终录取；它服务于奖学金材料包',
      'Type A 服务使馆/双边路径；Type B 走高校项目渠道',
      '许多学校工作窗口：11 月 → 入学年 3 月',
      '常见材料：护照、学历/在读证明、成绩单、学习计划、语言证明；本科可能需要 CSCA',
      '邮件主题与正文须写明具体专业；遵循各校地址（如 USTB csctypea@ustb.edu.cn）',
      '收到信件后，须在 CSC 志愿中填写该校',
    ],
    sections: [
      {
        id: 'type-a-vs-type-b',
        h2: 'Type A 与 Type B 预录取',
        intro: '申请与你实际提交的 CSC 渠道一致的信件。',
        blocks: [
          {
            type: 'table',
            caption: 'CSC 预录取：Type A 与 Type B',
            columns: ['', 'Type A（双边 / 使馆）', 'Type B（高校项目）'],
            rows: [
              ['申请渠道', '本国选派机构、部委或中国使领馆', '直接向中国高校（如高水平研究生、丝绸之路）'],
              ['信件用途', '随本国 CSC 材料作为大学证明上传/递交', '多为 Type B 系统内的导师接收或学校预录取'],
              [
                'USTB 2027 示例',
                '国际学生中心邮箱出具专用“Pre-Admission Notice (CSC—Type A)”',
                '**不要**用 Type A 预录取邮箱申请纯 Type B',
              ],
              ['收到之后', '在 CSC Type A 志愿中填写该校（建议第一志愿）', '遵循该校 Type B 清单与截止日期'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'USTB 2027 通知写明：申请高水平研究生项目或丝绸之路项目（CSC—Type B）者，不得申请 Type A 预录取通知。渠道混用浪费时间，也易让评审困惑。',
          },
          {
            type: 'links',
            items: [
              {
                label: 'USTB——2027 CSC Type A 预录取（官方通知）',
                href: 'https://iscen.ustb.edu.cn/Notices/a9ea21b5369b4dab90c7132331768704.htm',
              },
              { label: 'SICA：CSC 奖学金 2027/2028', href: '/chinese-government-scholarship-csc' },
              { label: 'SICA：CSC 截止日期追踪', href: '/csc-scholarship-deadlines-2027-2028' },
            ],
          },
        ],
      },
      {
        id: 'nov-march-window',
        h2: '11–3 月时间窗口',
        intro: '尽早启动——国家 CSC 截止日期可能在你仍在等信时就关闭。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**常见高校窗口**——USTB 将 Type A 预录取描述为一般在 **11 月至次年 3 月**',
              '**并行准备**——在申请信件的同时准备 CSCA（本科）、学习计划与推荐信',
              '**国家截止日**——部分 2027/28 双边通知在 12–1 月关闭；不要默认 3 月对你的使馆路径仍安全',
              '**办理时长**——USTB 在材料齐全后约 **7 个工作日**出具（其他学校各异）',
              '**多所大学**——可申请多封，但只提交与 CSC 志愿一致的证明',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '预录取文件不保证获得 CSC 资助，只帮助你完成合规的奖学金申请。',
          },
        ],
      },
      {
        id: 'documents',
        h2: '需附材料',
        intro: 'USTB 2027 Type A 清单是实用模板；务必对照目标大学通知。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**护照复印件**——个人信息页',
              '**学位证书**——按需提供学士 / 硕士；未毕业者提供注明预计毕业日期的在读证明',
              '**成绩单**——全部课程、分数与评分标准；中英文原件或公证件',
              '**学习计划**——写明拟申请学位与专业名称',
              '**语言证明**——HSK 或英语成绩；若无，请在邮件中说明',
              '**本科申请人**——在学校或 CSC 路径要求时提交 CSCA 成绩单',
            ],
          },
          {
            type: 'links',
            items: [
              { label: '如何写赴华学习计划', href: '/how-to-write-study-plan-china' },
              { label: 'CSC 推荐信范文结构', href: '/csc-recommendation-letter-sample' },
              { label: 'CSCA 与 CSC 奖学金', href: '/csca-csc-scholarship' },
            ],
          },
        ],
      },
      {
        id: 'email-template',
        h2: '邮件模板（教授与国际学生办公室）',
        intro: '若学校公布了专用邮箱，优先使用。导师主导的 Type B 路径可写给教授并抄送国际学生办公室。',
        blocks: [
          {
            type: 'h3',
            text: '主题行',
            body: 'Pre-Admission (Type A) Application + [英文全名]——或严格按大学通知中的主题格式。',
          },
          { type: 'p', text: '正文示例（可改写）：' },
          {
            type: 'ul',
            items: [
              '尊敬的国际学生中心 / [教授姓名] 老师：',
              '我是 [护照全名]，[国籍] 公民，申请 **2027/2028** 学年中国政府奖学金 **Type A**。',
              '现申请 **[大学名称]** **[确切专业名称、学位层次]** 的 **Pre-Admission Notice (CSC—Type A)**。',
              '附件：护照复印件；学历/在读证明；成绩单；学习计划；语言证明（或说明）；如适用附 CSCA 成绩。',
              '若获推荐，我将在 CSC 志愿中填写 **[大学]**（若允许则作为第一志愿）。',
              '感谢审阅。如需补充材料，请随时告知。',
              '此致，[全名] | [邮箱] | [电话/WhatsApp] | [护照号]',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'USTB 示例：将材料发送至 csctypea@ustb.edu.cn，主题如 “Pre-Admission (Type A) Application + English Full Name”，并在正文写明专业名称（中文或英文均可）。',
          },
        ],
      },
      {
        id: 'after-you-get-it',
        h2: '收到信件之后',
        intro: '只有 CSC 表格与上传保持一致，信件才真正有用。',
        blocks: [
          {
            type: 'ol',
            items: [
              '保存 PDF 与可打印副本',
              '在 CSC 申请中填写同一所大学（尽可能第一志愿）',
              '按本国门户或使馆清单上传录取 / 预录取证明',
              '最终录取与 JW201 仍走奖学金结果路径——预录取不是签证文件',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSC 预录取通知等于录取通知书吗？',
        a: '不等于。USTB 等高校写明：预录取通知仅用于在本国完成奖学金申请。最终录取与 JW201/JW202 在获选后另行发放。',
      },
      {
        q: 'Type B 申请人需要 Type A 预录取吗？',
        a: '通常不需要。Type B（高水平研究生、丝绸之路等）走学校自身流程。USTB 2027 通知要求 Type B 申请人不要申请 Type A 预录取邮箱。',
      },
      {
        q: '2027 年应何时申请预录取？',
        a: '许多高校约在 11 月至 3 月办理 Type A 预录取。成绩单与学习计划就绪后尽早申请，并核对本国 CSC 截止日——有的早于 3 月。',
      },
      {
        q: '大学一直不回复怎么办？',
        a: '在官方办理时限（如 7 个工作日）过后跟进一次。与其死等一个静默邮箱，不如并行联系另一所 CSC 可选高校。',
      },
      {
        q: '导师邀请函能否代替招生办预录取？',
        a: '部分国家通知接受学校/导师邀请作为录取证明。请向本国选派机构确认；笼统的网申回执往往不够。',
      },
    ],
    howToSteps: [
      {
        name: '选定 Type A 或 Type B',
        text: '信件申请须匹配你将提交的 CSC 渠道。纯 Type B 不要去申请仅限 Type A 的通知。',
      },
      {
        name: '准备材料包',
        text: '护照、学历或在读证明、成绩单、学习计划、语言证明，按需附 CSCA。',
      },
      {
        name: '在 11–3 月窗口发邮件',
        text: '使用公布地址与主题格式，正文写明确切专业。',
      },
      {
        name: '在 CSC 中填写该校',
        text: '收到预录取后列入志愿，并随奖学金申请上传文件。',
      },
    ],
    ctaTitle: '需要 CSC 2027 材料时间线？',
    ctaSubtitle:
      'SICA 协助巴基斯坦、孟加拉、尼日利亚申请人安排预录取申请、CSCA、推荐信与国家截止日。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csc-recommendation-letter-sample',
        label: 'CSC 推荐信范文结构',
        description: '谁签署、写什么、推荐人提纲。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027/2028',
        description: '类别、资助范围与完整材料清单。',
      },
      {
        href: '/csc-scholarship-deadlines-2027-2028',
        label: 'CSC 截止日期 2027/2028',
        description: '分国日期，以及巴/孟/尼的 [Check] 行。',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
};
