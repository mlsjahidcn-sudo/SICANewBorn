import type { LocalizedGuide } from './types';

/**
 * "CSCA exam dates & registration windows" — Batch 1, article #2 of
 * the 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca exam dates", "csca registration deadline",
 * "when is the csca exam", "csca 2027 dates".
 *
 * Static content. Dates are per-session and the calendar evolves —
 * per the plan doc's standing rule, published session dates are
 * labeled "as announced"; future sessions are NEVER invented, the
 * copy routes readers to the official portal for the live calendar.
 */
export const cscaDatesGuide: LocalizedGuide = {
  en: {
    slug: 'csca-exam-dates',
    eyebrow: 'GUIDE · CSCA DATES',
    title: 'CSCA Exam Dates 2026-27 & When to Sit for Your Intake',
    description:
      'Next CSCA exam: 14-15 Nov 2026 (register 15-21 Oct, Beijing time), then 19-20 Dec 2026 and 23-24 Jan 2027. Which sitting fits your 2027 application.',
    subtitle:
      'The CSCA exam runs mainly online at home with a live proctor. The next sitting is 14–15 November 2026 (registration 15–21 October, Beijing time), then 19–20 December 2026 and 23–24 January 2027. Pick the sitting that lands your score before your 2027 application deadline — especially CSC scholarship deadlines in January–April.',
    stats: [
      { value: '6/year', label: 'Sittings per year' },
      { value: '14–15 Nov 2026', label: 'Next sitting' },
      { value: '15–21 Oct', label: 'Registration (Beijing time)' },
      { value: 'Online', label: 'Main mode — live-proctored at home' },
    ],
    quickAnswer:
      'The CSCA runs 6 sittings per year, mainly online at home with a live proctor. The next confirmed dates are 14–15 November 2026 (register 15–21 October 2026, Beijing time), 19–20 December 2026, and 23–24 January 2027, with further sittings in March, April, and June 2027. For a September 2027 intake, sit the November–January window so your score exists before CSC scholarship deadlines cluster in January–April. The confirmed calendar lives on the official portal, csca.cn.',
    keyTakeaways: [
      '6 sittings per year; next confirmed: Nov 14–15 2026 (register Oct 15–21 Beijing time), Dec 19–20 2026, Jan 23–24 2027',
      'The exam is mainly online at home with a live proctor — offline centres are only being added in some countries',
      'Registration for the November sitting runs 15–21 October 2026 (Beijing time) — there is no general closing rule of thumb; each window is announced per session',
      'For a September 2027 intake: sit Nov 2026 – Jan 2027 at the latest; CSC scholarship applicants should sit the earliest viable date',
      'The official site is csca.cn — score reports are released via the portal and you attach them to each application yourself',
      'Full session calendar, reminders, and free practice tests: cscaprep.academy/exam-dates',
    ],
    sections: [
      {
        id: 'how-often',
        h2: 'How often is the CSCA held, and where do you sit it?',
        intro:
          'The CSCA runs 6 sittings per year, mainly online at home with a live proctor — you do not need to travel to a test centre in most countries.',
        blocks: [
          {
            type: 'p',
            text: 'The exam is organized by the China Scholarship Council (CSC) and developed with Chinese university experts. It runs mainly online: you sit at home with a live proctor watching via webcam. Offline centres (computer-based or paper) are being added in some countries, but online is the default path for most international applicants. Six sittings a year means a candidate who misses one, or wants to improve a score, waits at most a couple of months for the next.',
          },
          {
            type: 'table',
            caption: 'CSCA sittings for the 2026-27 application cycle (official calendar: csca.cn)',
            columns: ['Sitting', 'Test date', 'Registration window', 'Status'],
            rows: [
              ['November 2026', '14–15 Nov 2026', '15–21 Oct 2026 (Beijing time)', 'Confirmed'],
              ['December 2026', '19–20 Dec 2026', 'Announced per session', 'Confirmed'],
              ['January 2027', '23–24 Jan 2027', 'Announced per session', 'Confirmed'],
              ['March 2027', 'Exact dates TBA', 'Announced per session', 'Pending official notice'],
              ['April 2027', 'Exact dates TBA', 'Announced per session', 'Pending official notice'],
              ['June 2027', 'Exact dates TBA', 'Announced per session', 'Pending official notice'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For the full session calendar, registration walkthroughs, and free practice tests for every sitting, see CSCA Prep: https://cscaprep.academy/exam-dates. SICA covers the admissions side — which universities require the CSCA and when your score must exist. CSCA Prep covers the exam itself.',
          },
        ],
      },
      {
        id: 'registration-windows',
        h2: 'When does CSCA registration open and close?',
        intro:
          'Each sitting has its own announced registration window — there is no general rule of thumb. The November 2026 window runs 15–21 October, Beijing time.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**November 2026 sitting** — registration runs 15–21 October 2026, Beijing time. That is a one-week window; there is no general rule of thumb for when windows close — check each announcement',
              '**Later sittings** — each window is announced per session on the official portal; check csca.cn rather than extrapolating from the November window',
              '**Payment inside the window** — registration is only complete once the fee is paid (RMB 450 for 1 subject / RMB 700 for 2 or more); payment methods that take days to clear can run past the deadline if started late',
              '**No late window** — there is no published late-registration or walk-in option; a missed window means the next sitting',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Treat the window like a concert-ticket drop: know the opening date in advance, have your passport, subject list, and payment channel ready, and register in the first 48 hours.',
          },
        ],
      },
      {
        id: 'planning-backwards',
        h2: 'When should you sit the CSCA? Plan backwards from your 2027 intake',
        intro:
          'Your sitting choice is determined by one constraint: your score must exist before your application deadline. The live cycle is now the March 2027 and September 2027 intakes.',
        blocks: [
          {
            type: 'table',
            caption: 'Backwards planning by target intake (2027 cycle)',
            columns: ['Target intake', 'Application window', 'Latest viable CSCA sitting', 'Recommended sitting'],
            rows: [
              ['September 2027 (Fall)', 'Roughly Nov 2026 – June 2027 (top schools close earlier)', 'January 2027 (23–24 Jan)', 'November or December 2026 — leaves a retake before CSC deadlines'],
              ['March 2027 (Spring)', 'Roughly Jul – Dec 2026', 'December 2026 (19–20 Dec)', 'November 2026 (14–15 Nov)'],

              ['CSC scholarship + Sept 2027', 'Jan – Apr 2027 (varies; Pakistan HEC route can close Dec–Jan [verify])', 'December 2026 at the latest', 'November 2026 — the earliest viable sitting'],
            ],
          },
          {
            type: 'ol',
            items: [
              '**Write down your application deadlines** — for each target university. Top-tier (C9/985) schools often close months before mid-tier rolling deadlines.',
              '**Count back 6–8 weeks from the earliest deadline** — that is the last date you need your score in hand, so the test itself must be even earlier.',
              '**Pick the sitting that leaves retake room** — for September 2027, that means Nov 2026 (first attempt) with Dec 2026 or Jan 2027 as the backup.',
              '**Register the week the window opens** — the November window (15–21 Oct 2026) is only one week long.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The ideal first attempt leaves room for exactly one retake before your most important deadline. If your first sitting is later than that, you are gambling the whole cycle on one performance.',
          },
        ],
      },
      {
        id: 'deadline-crunch',
        h2: 'The CSC scholarship deadline crunch',
        intro:
          'CSC (Chinese Government Scholarship) deadlines cluster in January–April 2027, which effectively forces scholarship applicants into the November–December 2026 sittings.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Hard constraint** — CSC scholarship undergraduate applications require a CSCA score; a missing score disqualifies the application regardless of other strengths',
              '**Pakistan HEC route (agency no. 5861)** — an earlier December–January deadline is reported [verify]; HEC applicants should sit November 2026',
              '**University (Type B) channel** — deadlines roughly January–April 2027 and vary by university [verify]; top universities close earlier',
              '**Practical rule** — sit November 2026. If the score disappoints, the December sitting still lands before most deadlines — barely; January usually does not',
              '**Self-funded fallback** — if the retake misses the CSC cutoff, you can still apply self-funded with the new score and re-attempt CSC next cycle',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC deadlines do not move. Unlike university deadlines — where admissions offices sometimes grant extensions — a scholarship file without a CSCA score is simply incomplete. Build your entire exam calendar around the November sitting.',
          },
        ],
      },
      {
        id: 'missed-session',
        h2: 'Missed a sitting or a registration window?',
        intro:
          'Missing a sitting is recoverable if you understand which universities can still use a later score.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Top-tier schools (early deadlines)** — a later sitting\'s score arrives too late this cycle; target the next cycle or shift to mid-tier targets',
              '**Mid-tier and regional universities (rolling into mid-2027)** — a January 2027 score still fits; ask the admissions office explicitly whether applications remain open',
              '**Scholarship applicants** — a missed November sitting usually means the CSC cycle is gone; self-funded applications can continue, and you can re-attempt CSC next cycle with a stronger score',
              '**Registration closed but test not yet held** — no published late-registration path; your realistic option is the next sitting',
              '**Score weaker than hoped** — do not wait a full year; the roughly 2-month sitting gap is exactly why the exam runs 6 times a year',
            ],
          },
        ],
      },
      {
        id: 'where-to-check',
        h2: 'Where to find the confirmed calendar',
        intro:
          'Sitting dates, registration windows, and subject availability are announced per session. The official sources are few; everything else is rumor.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**The official CSCA portal — csca.cn** — it carries each sitting\'s announcement: test date, registration window, mode, and subject availability.',
              '**Your target university\'s international admissions page** — universities publish CSCA requirements in their admission notices for international students.',
              '**Your country\'s CSC dispatch authority** — for scholarship applicants, the agency running the CSC channel in your country (e.g. HEC in Pakistan) publishes CSCA notices for applicants there.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Third-party blogs and agencies republish dates with errors and stale fee amounts — and some invent dates to push registrations. If a date does not trace to csca.cn, an official dispatch authority, or a university admissions page, do not plan around it.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When is the next CSCA exam?',
        a: 'The next confirmed sitting is 14–15 November 2026, with registration open 15–21 October 2026 (Beijing time). After that: 19–20 December 2026 and 23–24 January 2027, with further sittings in March, April, and June 2027. Each sitting is announced on the official portal, csca.cn — that announcement, not any pattern, is the confirmed source.',
      },
      {
        q: 'How far in advance should I register?',
        a: 'Each sitting has its own announced window — there is no general rule. The November 2026 window runs just one week, 15–21 October (Beijing time). Register in the first days of the window and have your payment channel ready, because the fee (RMB 450 for one subject, RMB 700 for two or more) must clear before the window closes.',
      },
      {
        q: 'What happens if I miss the registration deadline?',
        a: 'There is no published late-registration or walk-in option. Your options are the next sitting (typically 1–2 months later) or, if your target university\'s deadline still allows, contacting the admissions office about the following sitting.',
      },
      {
        q: 'Which CSCA sitting should I take for the September 2027 intake?',
        a: 'Sit November or December 2026 at the latest. The recommended first attempt is November 2026 (14–15 Nov) — early enough that a December or January retake still lands before application deadlines, especially CSC scholarship deadlines that cluster in January–April 2027.',
      },
      {
        q: 'When do CSCA results come out?',
        a: 'Results are released through the official portal after each sitting — within 10 working days for online and computer-based tests is the published guidance [verify]. You download the score report yourself and attach it to each university application — universities do not receive it automatically.',
      },
      {
        q: 'Can I take the CSCA twice in one year?',
        a: 'Yes — with 6 sittings a year, sitting twice (typically 1–2 months apart) is normal and often planned: first attempt for the real deadline, second as a score improvement. Check your target universities\' policy on multiple score reports [verify].',
      },
      {
        q: 'Do I have to go to a test centre to sit the CSCA?',
        a: 'No — the exam is mainly online at home with a live proctor. Offline centres (computer-based or paper) are being added in some countries, but online is the default path for most international applicants. The per-sitting announcement on csca.cn lists the modes available.',
      },
    ],
    howToSteps: [
      {
        name: 'Fix your target intake and deadline list',
        text: 'Write down every target university\'s application deadline for your intake, in date order. The earliest one — not the average — determines your session. CSC scholarship applicants: your earliest deadline is January–April, full stop.',
      },
      {
        name: 'Find the next viable session on the official portal',
        text: 'Open the official CSCA registration portal and read the current session announcement. Pick the session that lands 4–6 months before your intake and at least 6–8 weeks before your earliest deadline.',
      },
      {
        name: 'Prepare registration materials before the window opens',
        text: 'Passport (valid, details memorized exactly as printed), your confirmed subject combination from the target program page, and a working payment channel — Alipay, WeChat Pay, or a bank account that can transfer CNY.',
      },
      {
        name: 'Register in the first 48 hours of the window',
        text: 'Create the account, choose session + nearest center with availability, select subjects, pay (¥450 / 1 subject, ¥700 / 2+), and save the payment confirmation. Center seats, not the closing date, are the usual bottleneck.',
      },
      {
        name: 'Schedule prep backwards from the test date',
        text: 'An 8-week plan means registration must happen ~9 weeks before the test. If the next window is sooner, compress to a 4-week drill of weakest subjects rather than sitting unprepared.',
      },
      {
        name: 'Keep a backup session in your plan',
        text: 'Before you sit, note the registration window of the following session. If the first attempt underperforms, you register immediately — a retake only helps if it lands before your earliest remaining deadline.',
      },
    ],
    ctaTitle: 'Need help mapping your CSCA calendar?',
    ctaSubtitle:
      'SICA counselors build your session plan around your target universities and scholarship deadlines, then keep your exam, application, and document timelines from colliding. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, exemptions, and the CSC requirement.',
      },
      {
        href: '/csca-exam-registration',
        label: 'How to register for the CSCA',
        description: 'Step-by-step portal walkthrough, test centers, and the mistakes that cost sessions.',
      },
      {
        href: '/csca-csc-scholarship',
        label: 'CSCA for CSC scholarship applicants',
        description: 'The January–April deadline crunch and how to plan exam attempts around it.',
      },
    ],
  },
  zh: {
    slug: 'csca-exam-dates',
    eyebrow: '指南 · CSCA 时间',
    title: 'CSCA 考试时间 2026-27：下一场 11 月 14-15 日',
    description:
      '下一场 CSCA 考试：2026 年 11 月 14-15 日（报名 10 月 15-21 日，北京时间），随后 12 月 19-20 日、2027 年 1 月 23-24 日。哪一场适合你的 2027 年申请。',
    subtitle:
      'CSCA 考试以居家线上为主，真人监考。下一场为 2026 年 11 月 14-15 日（报名 10 月 15-21 日，北京时间），随后是 12 月 19-20 日与 2027 年 1 月 23-24 日。选择能让成绩赶在 2027 年申请截止前到位的那一场——尤其是截止集中在 1-4 月的 CSC 奖学金。',
    stats: [
      { value: '6 次/年', label: '每年场次' },
      { value: '2026-11-14/15', label: '下一场' },
      { value: '10 月 15-21 日', label: '报名窗口（北京时间）' },
      { value: '线上', label: '主要模式——居家真人监考' },
    ],
    quickAnswer:
      'CSCA 每年举行 6 场，以居家线上、真人监考为主。已确认的最近日期为 2026 年 11 月 14-15 日（报名 2026 年 10 月 15-21 日，北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日，其后 2027 年 3 月、4 月、6 月还有场次。2027 年 9 月入学的申请者应在 2026 年 11 月至 2027 年 1 月之间完成考试，确保成绩赶在集中在 1-4 月的 CSC 奖学金截止之前。确认日历以官方 csca.cn 为准。',
    keyTakeaways: [
      '每年 6 场；已确认：2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日',
      '考试以居家线上、真人监考为主——线下考点仅在部分国家逐步增设',
      '11 月场次报名窗口为 2026 年 10 月 15-21 日（北京时间）——不存在统一的截止规律，逐场以公告为准',
      '2027 年 9 月入学：最迟 2027 年 1 月考完；CSC 奖学金申请者应尽早参加',
      '官方网站是 csca.cn——成绩从门户自行下载后随申请提交',
      '完整场次日历与免费练习：cscaprep.academy/exam-dates',
    ],
    sections: [
      {
        id: 'how-often',
        h2: 'CSCA 多久考一次？在哪里考？',
        intro:
          'CSCA 每年举行 6 场，以居家线上、真人监考为主——大多数国家的考生无需前往考点。',
        blocks: [
          {
            type: 'p',
            text: 'CSCA 由中国国家留学基金委（CSC）组织、联合中国高校专家开发。考试以线上为主：考生在家作答，监考人员通过摄像头实时监督。部分国家正在增设线下考点（机考或纸笔），但对多数国际考生而言，线上是默认路径。每年 6 场意味着错过或想刷分的考生最多等一两个月就有下一场。',
          },
          {
            type: 'table',
            caption: '2026-27 申请周期的 CSCA 场次（官方日历：csca.cn）',
            columns: ['场次', '考试日期', '报名窗口', '状态'],
            rows: [
              ['2026 年 11 月', '2026 年 11 月 14-15 日', '2026 年 10 月 15-21 日（北京时间）', '已确认'],
              ['2026 年 12 月', '2026 年 12 月 19-20 日', '逐场公告', '已确认'],
              ['2027 年 1 月', '2027 年 1 月 23-24 日', '逐场公告', '已确认'],
              ['2027 年 3 月', '具体日期待定', '逐场公告', '待官方通知'],
              ['2027 年 4 月', '具体日期待定', '逐场公告', '待官方通知'],
              ['2027 年 6 月', '具体日期待定', '逐场公告', '待官方通知'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '完整场次日历、报名操作指引与每场免费模拟题见 CSCA Prep：https://cscaprep.academy/exam-dates。SICA 负责招生侧——哪些大学要求 CSCA、成绩何时必须到位；考试本身的内容与练习在 CSCA Prep。',
          },
        ],
      },
      {
        id: 'registration-windows',
        h2: 'CSCA 报名何时开放、何时截止？',
        intro:
          '每场考试的报名窗口单独公告——没有可套用的一般规律。2026 年 11 月场次的窗口为 10 月 15-21 日（北京时间）。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**2026 年 11 月场次**——报名窗口为 2026 年 10 月 15-21 日（北京时间），仅一周；不存在统一的截止规律，逐场以公告为准',
              '**后续场次**——每场窗口由官方门户单独公告；请查 csca.cn，不要从 11 月窗口外推',
              '**窗口内完成支付**——缴费完成报名才算生效（单科 450 元 / 两科及以上 700 元人民币）；到账需数日的支付方式拖到最后会过期',
              '**无补报通道**——没有公布的逾期报名或现场报名选项；错过窗口即等下一场',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '把报名窗口当成抢票：提前知道开放日，备好护照、科目清单与支付通道，窗口开放后 48 小时内完成报名。',
          },
        ],
      },
      {
        id: 'planning-backwards',
        h2: '什么时候考？从 2027 年入学倒推',
        intro:
          '场次选择只有一个硬约束：成绩必须在申请截止前存在。当前申请周期为 2027 年 3 月与 9 月入学。',
        blocks: [
          {
            type: 'table',
            caption: '按目标入学倒推（2027 周期）',
            columns: ['目标入学', '申请窗口', '最迟可行场次', '推荐场次'],
            rows: [
              ['2027 年 9 月（秋季）', '约 2026 年 11 月 – 2027 年 6 月（顶尖校更早截止）', '2027 年 1 月（23-24 日）', '2026 年 11 月或 12 月——CSC 截止前留有重考空间'],
              ['2027 年 3 月（春季）', '约 2026 年 7 – 12 月', '2026 年 12 月（19-20 日）', '2026 年 11 月（14-15 日）'],
              ['CSC 奖学金 + 2027 年 9 月', '2027 年 1 – 4 月（各国渠道不同；巴基斯坦 HEC 渠道据报 12-1 月截止 [待核实]）', '最迟 2026 年 12 月', '2026 年 11 月——最早可行场次'],
            ],
          },
          {
            type: 'ol',
            items: [
              '**列下所有申请截止日**——按日期排序。决定场次的是最早的那个，不是平均数。顶尖（C9/985）校的截止远早于滚动录取的中游校。',
              '**从最早截止日往前推 6-8 周**——这是成绩必须到手的最后日期，考试本身还要更早。',
              '**选留有重考空间的场次**——2027 年 9 月入学的理想安排：11 月首考，12 月或 1 月作为备份。',
              '**窗口开放首周报名**——11 月窗口（2026 年 10 月 15-21 日）只有一周。',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '理想的首考安排应为目标截止日前留出恰好一次重考空间。如果首考晚于这个时点，整个申请周期就押在一次发挥上了。',
          },
        ],
      },
      {
        id: 'deadline-crunch',
        h2: 'CSC 奖学金的截止挤压',
        intro:
          'CSC（中国政府奖学金）截止集中在 2027 年 1-4 月，这事实上把奖学金申请者锁定在 2026 年 11-12 月的场次。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**硬约束**——CSC 奖学金本科申请必须附 CSCA 成绩；缺成绩即不合格，其他条件再强也不行',
              '**巴基斯坦 HEC 渠道（机构号 5861）**——据报截止更早，在 12-1 月 [待核实]；HEC 申请者应参加 2026 年 11 月场次',
              '**大学（Type B）渠道**——截止约在 2027 年 1-4 月，因校而异 [待核实]；顶尖大学更早关闸',
              '**实操法则**——参加 2026 年 11 月场次。若成绩不理想，12 月场次勉强赶得上多数截止；1 月通常来不及',
              '**自费兜底**——重考错过 CSC 截止，仍可用新成绩走自费申请，并在下一周期再战 CSC',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC 截止日不会动。大学截止有时可协商延期，但缺 CSCA 成绩的奖学金材料就是材料不齐。整个考试日历必须围绕 11 月场次排布。',
          },
        ],
      },
      {
        id: 'missed-session',
        h2: '错过场次或报名截止怎么办？',
        intro:
          '错过场次可以补救，前提是清楚哪些大学还能用更晚的成绩。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**顶尖院校（早截止）**——更晚场次的成绩本周期赶不上；瞄准下一周期，或转向中游目标',
              '**中游与地方院校（滚动至 2027 年年中）**——2027 年 1 月场成绩仍然可行；直接询问招生办申请是否仍开放',
              '**奖学金申请者**——错过 11 月场次通常意味着本轮 CSC 结束；自费申请可继续，下周期携更强成绩再战 CSC',
              '**报名已关、考试未考**——无公布的补报通道；现实选项是下一场',
              '**成绩不理想**——不要等一年；一年 6 场、约 1-2 个月一场的节奏正是为此设计的',
            ],
          },
        ],
      },
      {
        id: 'where-to-check',
        h2: '到哪里查确认日历',
        intro:
          '场次日期、报名窗口与科目可用性逐场公布。官方来源很少；其余都是传闻。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**官方 CSCA 门户——csca.cn**——承载每场公告：考试日期、报名窗口、考试模式与科目可用性。',
              '**目标大学国际招生页**——大学在国际学生招生通知中公布 CSCA 要求。',
              '**所在国的 CSC 派出机构**——奖学金申请者所在国负责 CSC 渠道的机构（如巴基斯坦 HEC）会面向本国申请者发布 CSCA 通知。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '第三方博客与中介转载日期常带错误与过期费用——有的甚至编造日期催促报名。任何无法追溯到 csca.cn、官方派出机构或大学招生页的日期，都不要据此规划。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '下一场 CSCA 什么时候考？',
        a: '下一场已确认为 2026 年 11 月 14-15 日，报名窗口 10 月 15-21 日（北京时间）。随后：12 月 19-20 日、2027 年 1 月 23-24 日，2027 年 3 月、4 月、6 月另有场次。每场均以官方 csca.cn 公告为准——不是任何"规律"。',
      },
      {
        q: '应提前多久报名？',
        a: '每场报名窗口单独公告——没有一般规律。2026 年 11 月场次的窗口只有一周：10 月 15-21 日（北京时间）。窗口开放头几天就报，并备好支付通道——费用（单科 450 元、两科及以上 700 元人民币）必须在窗口内到账。',
      },
      {
        q: '错过报名截止怎么办？',
        a: '没有公布的补报或现场报名通道。选项是下一场（通常 1-2 个月后），或若目标院校截止仍允许，联系招生办确认下一场次是否可行。',
      },
      {
        q: '2027 年 9 月入学应参加哪场 CSCA？',
        a: '最迟 2027 年 1 月考完。推荐首考选 2026 年 11 月（14-15 日）——早到 12 月或 1 月还有一次重考空间，尤其 CSC 奖学金截止集中在 2027 年 1-4 月。',
      },
      {
        q: 'CSCA 成绩什么时候出？',
        a: '每场考试后经官方门户发布——线上与机考的公布口径为 10 个工作日内 [待核实]。成绩单需自行下载并附到各大学申请中——大学不会自动收到。',
      },
      {
        q: '一年可以考两次 CSCA 吗？',
        a: '可以——一年 6 场，间隔约 1-2 个月，连考两场很常见且有规划价值：首考冲真实截止，次考刷分。多次成绩单如何提交请核对目标大学的要求 [待核实]。',
      },
      {
        q: '必须去考点参加 CSCA 吗？',
        a: '不需要——考试以居家线上、真人监考为主。部分国家正在增设线下考点（机考或纸笔），但线上是多数国际考生的默认路径。csca.cn 的逐场公告列出当次可用的模式。',
      },
    ],
    howToSteps: [
      {
        name: '锁定目标入学与截止日清单',
        text: '列出每所目标大学对应入学的申请截止日，按日期排序。决定场次的是最早的那个——不是平均数。CSC 奖学金申请者：你的最早截止就是 1-4 月，没有商量。',
      },
      {
        name: '在官方门户找到下一个可行场次',
        text: '打开官方 CSCA 报名门户读当次公告。选出距入学 4-6 个月、且距最早截止至少 6-8 周的场次。',
      },
      {
        name: '窗口开放前备齐报名材料',
        text: '护照（有效，信息与证件逐字一致）、目标项目页确认的科目组合、可用的支付通道——支付宝、微信支付或可转人民币的银行账户。',
      },
      {
        name: '窗口开放 48 小时内完成报名',
        text: '注册账号，选场次与最近的有位考点，选科目，缴费（¥450 / 1 科，¥700 / 两科及以上），保存支付凭证。通常卡人的是考位，不是截止日。',
      },
      {
        name: '从考试日期倒排列备考计划',
        text: '8 周备考计划意味着考前约 9 周就要完成报名。若下一窗口更近，就把计划压缩成 4 周弱科集训，而不是裸考。',
      },
      {
        name: '计划里永远留一场备份',
        text: '首考前记下下一场次的报名窗口。首考不理想就立即报名——重考只有在赶得上最早剩余截止日时才有意义。',
      },
    ],
    ctaTitle: '需要帮你排 CSCA 日历？',
    ctaSubtitle:
      'SICA 顾问围绕你的目标院校与奖学金截止排布场次计划，让考试、申请、材料三条时间线互不打架。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用、豁免与 CSC 要求。',
      },
      {
        href: '/csca-exam-registration',
        label: 'CSCA 报名流程详解',
        description: '门户逐步操作、考点选择，以及那些会让你损失一场考试的报名错误。',
      },
      {
        href: '/csca-csc-scholarship',
        label: 'CSC 奖学金申请者的 CSCA',
        description: '1-4 月截止挤压与考试场次规划打法。',
      },
    ],
  },
};
