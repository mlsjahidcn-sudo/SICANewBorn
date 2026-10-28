import type { LocalizedGuide } from './types';

/**
 * CSC 2027 results + what “pre-admitted” means.
 * Target query: "csc scholarship result 2027".
 *
 * Distinguishes portal “pre-admitted” status from a university
 * pre-admission letter (see /pre-admission-letter-csc-2027).
 */
export const cscScholarshipResult2027Guide: LocalizedGuide = {
  en: {
    slug: 'csc-scholarship-result-2027',
    eyebrow: 'GUIDE · CSC 2027',
    title: 'CSC Scholarship Result 2027: Timeline and What “Pre-Admitted” Means',
    description:
      'CSC scholarship results 2027: spring publish window, how to check status, what “pre-admitted” means vs a pre-admission letter, and next steps after award.',
    seoTitle: 'CSC Scholarship Result 2027 | SICA',
    seoDescription:
      'When CSC 2027 results come out, what “pre-admitted” means on the portal, and how that differs from a university pre-admission letter.',
    subtitle:
      'Most bilateral and university CSC cycles publish awards in **spring** (often April–June for a September intake). “Pre-admitted” on a portal is not the same document as the university pre-admission letter you may have uploaded months earlier.',
    stats: [
      { value: 'Spring', label: 'Typical result season' },
      { value: 'Apr–Jun', label: 'Common award window' },
      { value: '≠ letter', label: '“Pre-admitted” ≠ pre-admission PDF' },
      { value: 'JW201', label: 'Follows a funded award' },
    ],
    quickAnswer:
      '**CSC scholarship results for 2027** are usually released in **spring** — many Pakistan / Bangladesh / Nigeria timelines point to roughly **May–June 2027** for final awards ahead of September enrollment, while some Type B universities notify earlier or later. Check the CSC system (studyinchina.edu.cn / Campus China) and any local embassy or HEC / MoE portal your route used. **“Pre-admitted”** on a status screen generally means a university has indicated interest or provisional placement in the scholarship pipeline; it is **not** a guarantee of funding and is **not** the same as the **pre-admission letter** PDF you requested from a university to complete your application file.',
    keyTakeaways: [
      'Expect results in spring; country CSC guides often list May–Jun for final notices',
      'Type B university awards can arrive on a different clock than bilateral Type A',
      '“Pre-admitted” ≠ funded; wait for official award + admission + JW201',
      'Pre-admission letter (application document) ≠ portal “pre-admitted” (status label)',
      'After award: accept on time, prepare X1 visa, plan 30-day residence-permit conversion',
    ],
    sections: [
      {
        id: 'when-results',
        h2: 'When are CSC 2027 results published?',
        intro: 'There is no single global day — watch your channel.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Bilateral / embassy (Type A)** — often finalizes in **late spring** after CSC and the dispatching authority finish reviews',
              '**University (Type B)** — each school publishes its own award list; some notify as early as March–April, others later',
              '**Working range for Sept 2027 intake** — plan for **April–June 2027** result traffic; do not book non-refundable flights before JW201 timing is clear',
              '**Pakistan / Bangladesh / Nigeria** — country guides on SICA use May–Jun 2027 as the results milestone [confirm on the live notice]',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'CSC deadlines 2027/2028 tracker', href: '/csc-scholarship-deadlines-2027-2028' },
              { label: 'CSC Pakistan', href: '/csc-scholarship-pakistan' },
              { label: 'CSC Bangladesh', href: '/csc-scholarship-bangladesh' },
              { label: 'CSC Nigeria', href: '/csc-scholarship-nigeria' },
            ],
          },
        ],
      },
      {
        id: 'pre-admitted-meaning',
        h2: 'What does “pre-admitted” mean?',
        intro: 'Two different things share similar English words. Do not mix them up.',
        blocks: [
          {
            type: 'table',
            caption: 'Pre-admission letter vs portal “pre-admitted”',
            columns: ['Term', 'What it is', 'When you see it', 'Does it fund you?'],
            rows: [
              [
                'Pre-admission letter / notice',
                'PDF from a university to support your CSC Type A (or similar) file',
                'Usually Nov–Mar, before you submit CSC',
                'No — application evidence only',
              ],
              [
                'Portal status “pre-admitted”',
                'System label that a university has provisionally engaged your file',
                'During or after review, before/around award season',
                'No — wait for official scholarship award',
              ],
              [
                'Final admission + JW201',
                'Award package after CSC funding is confirmed',
                'After spring results',
                'Yes — this is the funded path',
              ],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If an agent says “pre-admitted = you won CSC,” ask for the official award notice and JW201 timeline in writing. Status labels are not funding.',
          },
          {
            type: 'links',
            items: [
              {
                label: 'How to get a pre-admission letter for CSC 2027',
                href: '/pre-admission-letter-csc-2027',
              },
            ],
          },
        ],
      },
      {
        id: 'how-to-check',
        h2: 'How to check your result',
        intro: 'Use the same portals you applied through.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Log into the CSC / Campus China account used for the application',
              'Check email (including spam) from the university international office and your embassy / HEC / MoE contact',
              'For Type B, also check the university scholarship page or applicant dashboard',
              'Screenshot every status change with date — useful if a deadline to accept is short',
            ],
          },
        ],
      },
      {
        id: 'after-award',
        h2: 'If you are awarded',
        intro: 'Move quickly — visa and housing clocks start.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Accept the award inside the required window',
              'Collect final admission notice + JW201',
              'Apply for the X1 student visa in your country',
              'Plan arrival so the 30-day residence-permit conversion still fits',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'China X1 visa — Pakistan', href: '/china-student-visa-pakistan' },
              { label: 'X1 vs X2 overview', href: '/x1-vs-x2-student-visa-china' },
            ],
          },
        ],
      },
      {
        id: 'if-not-awarded',
        h2: 'If you are not awarded',
        intro: 'A CSC “no” is not the end of studying in China.',
        blocks: [
          {
            type: 'ul',
            items: [
              'Ask the university about **self-funded** or **university/president/provincial** scholarships',
              'Keep Type B options open for the next cycle while you strengthen CSCA / language / study plan',
              'See SICA’s scholarships guide for non-CSC funding paths',
            ],
          },
          {
            type: 'links',
            items: [{ label: 'Scholarships beyond CSC', href: '/guides/scholarships' }],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When will CSC scholarship results 2027 come out?',
        a: 'Most channels publish in spring. Many country timelines for a September 2027 intake point to about May–June 2027 for final awards, while Type B universities may notify on their own schedule. Confirm on your portal and dispatching authority.',
      },
      {
        q: 'What does pre-admitted mean in CSC?',
        a: 'It usually means provisional university interest in the scholarship pipeline. It is not a funded award and is not the same as the pre-admission letter PDF used when you applied.',
      },
      {
        q: 'Is pre-admitted the same as a pre-admission letter?',
        a: 'No. The letter is an application document you obtain before or while filing CSC. “Pre-admitted” is a later status label. Funding requires an official award plus admission/JW201.',
      },
      {
        q: 'What if my status never changes?',
        a: 'Email the university international office and your embassy/agency contact with your CSC application number. Keep checking through June; some late adjustments still appear before enrollment.',
      },
    ],
    howToSteps: [
      {
        name: 'Watch spring portals',
        text: 'CSC / Campus China plus any local HEC, MoE, or embassy system you used.',
      },
      {
        name: 'Read status carefully',
        text: 'Treat “pre-admitted” as provisional. Wait for award + JW201 before major spending.',
      },
      {
        name: 'Accept and visa',
        text: 'On award, accept on time, collect documents, apply for X1, plan the 30-day permit conversion.',
      },
    ],
    ctaTitle: 'Waiting on CSC 2027 results?',
    ctaSubtitle:
      'SICA helps you interpret portal statuses and build a backup self-funded or university-scholarship plan. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/pre-admission-letter-csc-2027',
        label: 'Pre-admission letter for CSC 2027',
        description: 'The application PDF — not the result status.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027/2028',
        description: 'Full program guide and document list.',
      },
      {
        href: '/guides/scholarships',
        label: 'Scholarships guide',
        description: 'University and provincial options if CSC says no.',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
  zh: {
    slug: 'csc-scholarship-result-2027',
    eyebrow: '指南 · CSC 2027',
    title: 'CSC 奖学金 2027 结果：时间线与“预录取”含义',
    description:
      'CSC 2027 结果：春季公布窗口、如何查询、“预录取”与预录取通知书的区别，以及获奖后下一步。',
    seoTitle: 'CSC 奖学金结果 2027 | SICA',
    seoDescription:
      'CSC 2027 结果何时出、门户上“预录取”是什么意思，以及它与大学预录取通知书有何不同。',
    subtitle:
      '多数双边与高校 CSC 周期在**春季**公布（九月入学常见为 4–6 月）。门户上的“预录取”状态，与你数月前上传的大学预录取通知书不是同一份文件。',
    stats: [
      { value: '春季', label: '常见出结果季节' },
      { value: '4–6 月', label: '常见获奖窗口' },
      { value: '≠ 信件', label: '“预录取”≠ 预录取 PDF' },
      { value: 'JW201', label: '获资助后发放' },
    ],
    quickAnswer:
      '**CSC 2027 奖学金结果**多在**春季**公布——巴基斯坦 / 孟加拉 / 尼日利亚时间线常指向约 **2027 年 5–6 月**的最终结果（九月入学前），部分 Type B 高校更早或更晚。请查询 CSC 系统（studyinchina.edu.cn / 来华留学）以及使馆、HEC / 教育部等本地门户。状态里的 **“预录取 / pre-admitted”** 通常表示高校在奖学金流程中给出了意向或临时安排；**不等于**已获资助，也**不等于**你申请时使用的**预录取通知书** PDF。',
    keyTakeaways: [
      '结果多在春季；分国指南常把 5–6 月列为最终通知节点',
      'Type B 高校获奖时钟可能与双边 Type A 不同',
      '“预录取”≠ 已资助；等待正式获奖 + 录取 + JW201',
      '预录取通知书（申请材料）≠ 门户“预录取”（状态标签）',
      '获奖后：按时接受、办 X1、规划 30 天居留许可换发',
    ],
    sections: [
      {
        id: 'when-results',
        h2: 'CSC 2027 结果何时公布？',
        intro: '没有全球统一日期——盯住你的渠道。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**双边 / 使馆（Type A）**——CSC 与选派机构审完后，常在**晚春**最终确定',
              '**高校（Type B）**——各校自行公布；有的 3–4 月即通知，有的更晚',
              '**2027 年 9 月入学工作区间**——按 **2027 年 4–6 月**结果高峰规划；JW201 时间未明前勿订不可退机票',
              '**巴 / 孟 / 尼**——SICA 分国指南以 2027 年 5–6 月为结果节点 [以现行通知确认]',
            ],
          },
          {
            type: 'links',
            items: [
              { label: 'CSC 2027/2028 截止日追踪', href: '/csc-scholarship-deadlines-2027-2028' },
              { label: 'CSC 巴基斯坦', href: '/csc-scholarship-pakistan' },
              { label: 'CSC 孟加拉', href: '/csc-scholarship-bangladesh' },
              { label: 'CSC 尼日利亚', href: '/csc-scholarship-nigeria' },
            ],
          },
        ],
      },
      {
        id: 'pre-admitted-meaning',
        h2: '“预录取”是什么意思？',
        intro: '两个英文概念相近，切勿混用。',
        blocks: [
          {
            type: 'table',
            caption: '预录取通知书 vs 门户“预录取”',
            columns: ['术语', '是什么', '何时出现', '是否等于资助'],
            rows: [
              [
                '预录取通知书 / Pre-admission letter',
                '大学出具的 PDF，支撑 CSC Type A（等）材料',
                '通常 11–3 月，提交 CSC 前',
                '否——仅申请证明',
              ],
              [
                '门户状态“预录取”',
                '系统标签：高校已临时介入你的材料',
                '评审期间或前后、获奖季附近',
                '否——等待正式奖学金结果',
              ],
              [
                '最终录取 + JW201',
                'CSC 资助确认后的获奖材料包',
                '春季结果之后',
                '是——资助路径',
              ],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '若中介称“预录取 = 已拿下 CSC”，请书面索要正式获奖通知与 JW201 时间线。状态标签不是资助。',
          },
          {
            type: 'links',
            items: [
              { label: '如何获取 CSC 2027 预录取通知书', href: '/pre-admission-letter-csc-2027' },
            ],
          },
        ],
      },
      {
        id: 'how-to-check',
        h2: '如何查询结果',
        intro: '使用你申请时的同一套门户。',
        blocks: [
          {
            type: 'ol',
            items: [
              '登录申请所用的 CSC / 来华留学账号',
              '查收大学国际学生办公室与使馆 / HEC / 教育部联系人邮件（含垃圾箱）',
              'Type B 另查高校奖学金页或申请人后台',
              '每次状态变化截图并注明日期——接受期限可能很短',
            ],
          },
        ],
      },
      {
        id: 'after-award',
        h2: '若已获奖',
        intro: '尽快行动——签证与住宿时钟已启动。',
        blocks: [
          {
            type: 'ol',
            items: [
              '在要求窗口内接受奖学金',
              '收齐最终录取通知 + JW201',
              '在本国申请 X1 学生签证',
              '规划抵达时间，确保仍能在 30 天内换发居留许可',
            ],
          },
        ],
      },
      {
        id: 'if-not-awarded',
        h2: '若未获奖',
        intro: 'CSC“未通过”不等于不能来华留学。',
        blocks: [
          {
            type: 'ul',
            items: [
              '向大学询问**自费**或**校长 / 省市**奖学金',
              '强化 CSCA / 语言 / 学习计划，为下一轮 Type B 做准备',
              '参阅 SICA 奖学金指南了解非 CSC 路径',
            ],
          },
          {
            type: 'links',
            items: [{ label: '奖学金指南（含非 CSC）', href: '/guides/scholarships' }],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSC 奖学金 2027 结果何时出来？',
        a: '多数渠道在春季公布。九月入学的分国时间线常指向约 2027 年 5–6 月最终结果；Type B 高校可能有自己的通知节奏。以门户与选派机构为准。',
      },
      {
        q: 'CSC 里的预录取是什么意思？',
        a: '通常表示高校在奖学金流程中给出了临时意向。不等于已获资助，也不等于申请时使用的预录取通知书 PDF。',
      },
      {
        q: '预录取状态等于预录取通知书吗？',
        a: '不等于。通知书是提交 CSC 前/时的申请材料；“预录取”是之后的状态标签。资助需正式获奖及录取/JW201。',
      },
      {
        q: '状态一直不变怎么办？',
        a: '携带 CSC 申请号邮件联系大学国际学生办公室与使馆/机构联系人。持续查看到 6 月；入学前仍可能有晚到调整。',
      },
    ],
    howToSteps: [
      {
        name: '春季盯紧门户',
        text: 'CSC / 来华留学，以及你使用的 HEC、教育部或使馆系统。',
      },
      {
        name: '仔细读状态',
        text: '将“预录取”视为临时。重大花费前等待获奖 + JW201。',
      },
      {
        name: '接受并办签证',
        text: '获奖后按时接受、收齐材料、申请 X1，规划 30 天换发。',
      },
    ],
    ctaTitle: '正在等 CSC 2027 结果？',
    ctaSubtitle:
      'SICA 帮你解读门户状态，并准备自费或校级奖学金备选方案。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/pre-admission-letter-csc-2027',
        label: 'CSC 2027 预录取通知书',
        description: '申请用 PDF——不是结果状态。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027/2028',
        description: '完整项目指南与材料清单。',
      },
      {
        href: '/guides/scholarships',
        label: '奖学金指南',
        description: 'CSC 未过时的院校与省市选项。',
      },
    ],
    publishedAt: '2026-10-28',
    updatedAt: '2026-10-28',
  },
};
