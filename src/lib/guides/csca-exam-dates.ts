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
    title: 'CSCA Exam Dates & Registration Windows (2026–2027) — When to Sit the Exam',
    description:
      'The CSCA runs 5 sessions a year. Session calendar so far, registration windows (~15 days before each test), and how to plan backwards from your intake so scores land before deadlines.',
    subtitle:
      'The CSCA runs 5 sessions a year. The inaugural global test was December 21, 2025, and the 2026 calendar included January 25 and March 15 with further sittings through the year. Registration typically opens 3–4 weeks and closes about 15 days before each test — plan backwards from your intake so your score exists before your application deadline.',
    stats: [
      { value: '5×/year', label: 'Sessions per year' },
      { value: '~15 days', label: 'Before test — registration closes' },
      { value: '4–6 months', label: 'Before intake — ideal session' },
      { value: 'Jan–Apr', label: 'CSC scholarship deadline crunch' },
    ],
    quickAnswer:
      'The CSCA is held 5 times a year. The inaugural global session was December 21, 2025; the 2026 calendar included January 25 and March 15 sessions with more sittings through the year. Registration windows are short — they typically open a few weeks ahead and close about 15 days before each test (the January 25, 2026 session, for example, registered from December 23, 2025 to January 10, 2026). For a September intake, sit the winter or early-spring session of that calendar year at the latest; CSC scholarship applicants must sit even earlier because scholarship deadlines cluster in January–April. The confirmed calendar for each session is published on the official CSCA registration portal — never assume last year\'s pattern repeats exactly.',
    keyTakeaways: [
      '5 sessions per year; recent announced sittings: Dec 21, 2025 (inaugural), Jan 25, 2026, Mar 15, 2026',
      'Registration closes ~15 days before each test — windows are short, so register the week they open',
      'For a September intake: latest viable session is the winter/early-spring sitting of the same year',
      'CSC scholarship applicants effectively must sit the earliest session of the year (deadlines Jan–Apr)',
      'Results are released via the registration portal per session — download and forward to universities yourself',
      'Never build a plan on rumored future dates — the official portal\'s per-session announcement is the only source',
    ],
    sections: [
      {
        id: 'how-often',
        h2: 'How often is the CSCA held?',
        intro:
          'The CSCA runs 5 sessions per year — a cadence designed so applicants can sit (or re-sit) the exam within any application cycle without waiting a full year.',
        blocks: [
          {
            type: 'p',
            text: 'The inaugural global session was held December 21, 2025. The 2026 calendar included January 25 and March 15 sessions, with further sittings through the year — the launch notices described a schedule of roughly one session every two to three months across January, March, April, and beyond. Five sessions a year means a candidate who misses one, or wants to improve a score, waits at most a few months for the next sitting.',
          },
          {
            type: 'table',
            caption: 'Sessions announced so far (as published at launch — confirm each on the official portal)',
            columns: ['Session', 'Test date', 'Registration window', 'Status'],
            rows: [
              ['Inaugural global test', 'December 21, 2025', 'Opened Nov 2025', 'Held'],
              ['2026 Session 2', 'January 25, 2026', 'Dec 23, 2025 – Jan 10, 2026', 'Held'],
              ['2026 Session 3', 'March 15, 2026', 'Closed ~Mar 1, 2026', 'Held'],
              ['2026 Sessions 4–5', 'Through 2026', 'Per-session announcements', 'See official portal'],
              ['2027 sessions', 'TBA', 'TBA', 'Announced per session'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The table above lists only dates that were officially announced at launch. Later 2026 and all 2027 dates follow a per-session announcement rhythm — check the official CSCA registration portal (or your target university\'s admissions notice) rather than extrapolating.',
          },
        ],
      },
      {
        id: 'registration-windows',
        h2: 'When does CSCA registration open and close?',
        intro:
          'Registration windows are short — typically opening 3–4 weeks before the test and closing about 15 days before the exam date.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Close date** — roughly 15 days before each test, consistently across announced sessions',
              '**Open date** — varies per session; the January 25, 2026 session opened December 23, 2025 (about 4–5 weeks ahead)',
              '**Center capacity** — domestic and overseas centers fill up; late registrants may find their nearest center full even while the window is technically open',
              '**Payment inside the window** — the registration is only complete once the fee is paid (¥450 for 1 subject / ¥700 for 2+); bank transfers that take 3–5 business days can run past the deadline if started late',
              '**No late window** — there is no published late-registration or walk-in option; a missed window means the next session',
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
        h2: 'When should you sit the CSCA? Plan backwards from your intake',
        intro:
          'Your session choice is determined by one constraint: your score must exist before your application deadline. Work backwards.',
        blocks: [
          {
            type: 'table',
            caption: 'Backwards planning by target intake',
            columns: ['Target intake', 'Application window', 'Latest viable CSCA session', 'Recommended session'],
            rows: [
              ['September (Fall)', '~Nov – June (rolling; top schools close Jan–Feb)', 'Winter/early-spring of the same year', 'Winter session — leaves one backup before CSC deadlines'],
              ['March (Spring)', '~Jul – Dec of prior year', 'Mid-year session of the prior year', 'Autumn session of the prior year'],
              ['CSC scholarship + September', 'Jan – Apr', 'Winter session of the same year', 'Earliest available session of the year (retake room before April)'],
            ],
          },
          {
            type: 'ol',
            items: [
              '**Write down your application deadlines** — for each target university. Note that top-tier (C9/985) schools often close in January–February, months before mid-tier rolling deadlines.',
              '**Count back 6–8 weeks from the earliest deadline** — that is the last date you need your score in hand, so the test itself must be even earlier.',
              '**Pick the session 4–6 months before your intake** — early enough to retake, late enough that your prep is complete.',
              '**Register the week the window opens** — center availability, not the deadline, is the real constraint.',
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
          'CSC (Chinese Government Scholarship) deadlines cluster in January–April, which effectively forces scholarship applicants into the earliest CSCA session of each year.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Hard constraint** — CSC applications require a CSCA score from the 2026 intake onward; a missing score disqualifies the application regardless of other strengths',
              '**Embassy (Bilateral) channel** — deadlines often the earliest, sometimes January–March',
              '**University (Chinese University Program) channel** — typically February–April, but top universities close earlier',
              '**Practical rule** — sit the first session of the calendar year. If your score disappoints, the second session (~2 months later) still lands before most April deadlines — barely; the third usually does not',
              '**Self-funded fallback** — if the retake misses the CSC cutoff, you can still apply self-funded with the new score and re-attempt CSC next cycle',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC deadlines do not move. Unlike university deadlines — where admissions offices sometimes grant extensions — a scholarship file without a CSCA score is simply incomplete. Build your entire exam calendar around the January–April window.',
          },
        ],
      },
      {
        id: 'missed-session',
        h2: 'Missed a session or a deadline?',
        intro:
          'Missing a session is recoverable if you understand which universities can still use a later score.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Top-tier schools (Jan–Feb deadlines)** — a later session\'s score arrives too late this cycle; target the next cycle or shift to mid-tier targets',
              '**Mid-tier and regional universities (rolling to June)** — a spring session score still fits; ask the admissions office explicitly whether applications remain open',
              '**Scholarship applicants** — a missed early session usually means the CSC cycle is gone; self-funded applications can continue, and you can re-attempt CSC next cycle with a stronger score',
              '**Registration closed but test not yet held** — no published late-registration path; your realistic option is the next session',
              '**Score weaker than hoped** — do not wait a full year; the 2-month session gap is exactly why the exam runs 5 times a year',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Universities see the score report you choose to submit — so a retake in the next session can replace a weak first attempt for any deadline that is still open. SICA counselors track which of your target schools remain viable after each session.',
          },
        ],
      },
      {
        id: 'where-to-check',
        h2: 'Where to find the confirmed calendar',
        intro:
          'Session dates, registration windows, and center lists are announced per session. Three sources are authoritative; everything else is rumor.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**The official CSCA registration portal** — the .org.cn domain linked from government notices. It carries each session\'s announcement: test date, registration window, center list, and subject availability.',
              '**Your target university\'s international admissions page** — universities email current applicants the session announcements relevant to their programs; BLCU, CUMT, GDUFS and others published launch-period instructions this way.',
              '**The Chinese embassy/consulate in your country** — the Bilateral (scholarship) channel publishes CSCA notices for applicants in your country, including local center arrangements.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Third-party blogs and agencies republish dates with errors and stale fee amounts — and some invent dates to push registrations. If a date does not trace to the official portal, an embassy notice, or a university admissions page, do not plan around it.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When is the next CSCA exam?',
        a: 'The CSCA runs 5 sessions per year. Dates announced so far: the inaugural global test on December 21, 2025, then January 25 and March 15, 2026, with further sessions through the year. Each new session is announced on the official CSCA registration portal — that announcement, not last year\'s pattern, is the confirmed source for the next date.',
      },
      {
        q: 'How far in advance should I register?',
        a: 'Registration windows open roughly 3–5 weeks before each test and close about 15 days before the exam date. Register in the first days of the window: overseas center seats are limited and bank-transfer payments can take 3–5 business days to clear.',
      },
      {
        q: 'What happens if I miss the registration deadline?',
        a: 'There is no published late-registration or walk-in option — the window closes about 15 days before the test. Your options are the next session (typically 2–3 months later) or, if your target university\'s deadline still allows, contacting the admissions office about the following sitting.',
      },
      {
        q: 'Which CSCA session should I take for September intake?',
        a: 'Sit the winter or early-spring session of the same calendar year at the latest. The recommended choice is 4–6 months before intake — early enough that a retake in the next session still lands before your deadlines, especially top universities that close applications in January–February.',
      },
      {
        q: 'When do CSCA results come out?',
        a: 'Results are released through the official registration portal after each session; the portal publishes the expected release window when the session opens. You download the score report yourself and attach it to each university application — universities do not receive it automatically.',
      },
      {
        q: 'Can I take the CSCA twice in one year?',
        a: 'Yes — with 5 sessions a year, sitting two sessions (typically ~2–3 months apart) is normal and often planned: first attempt for the real deadline, second as a score improvement. Universities consider the score report you choose to submit.',
      },
      {
        q: 'Do all test centers operate in every session?',
        a: 'No — center availability varies by session and country. The official portal publishes the center list per session during registration, and popular overseas centers can fill up before the window closes, which is why registering early matters even when the deadline looks far away.',
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
    title: 'CSCA 考试时间与报名窗口（2026–2027）——什么时候考最合适',
    description:
      'CSCA 每年 5 次考试。已公布场次日历、报名窗口（考前约 15 天截止）、以及如何从入学时间倒推规划，确保成绩赶在申请截止前拿到。',
    subtitle:
      'CSCA 每年举行 5 次。全球首考为 2025 年 12 月 21 日，2026 年含 1 月 25 日与 3 月 15 日场次，年内另有后续场次。报名窗口很短——通常提前 3-4 周开放、考前约 15 天截止（如 2026 年 1 月 25 日场次报名期为 2025 年 12 月 23 日至 1 月 10 日）。从入学时间倒推规划，确保成绩在申请截止前到位。',
    stats: [
      { value: '5 次/年', label: '每年场次' },
      { value: '约 15 天', label: '考前——报名截止' },
      { value: '4-6 个月', label: '入学前——理想场次' },
      { value: '1-4 月', label: 'CSC 奖学金截止窗口' },
    ],
    quickAnswer:
      'CSCA 每年举行 5 次。全球首考为 2025 年 12 月 21 日；2026 年含 1 月 25 日与 3 月 15 日场次，年内另有更多场次。报名窗口很短——通常提前数周开放、考前约 15 天截止（如 2026 年 1 月 25 日场次报名期为 2025 年 12 月 23 日至 2026 年 1 月 10 日）。对应 9 月入学，最迟参加同年冬季或早春场次；CSC 奖学金申请者须更早，因为奖学金截止集中在 1-4 月。每场次的确认日历以官方 CSCA 报名门户公布为准——不要假设去年节奏完全复刻。',
    keyTakeaways: [
      '每年 5 场；已公布场次：2025 年 12 月 21 日（首考）、2026 年 1 月 25 日、3 月 15 日',
      '报名考前约 15 天截止——窗口短，窗口一开就报',
      '对应 9 月入学：最迟参加同年冬季/早春场次',
      'CSC 奖学金申请者事实上必须参加年内最早场次（截止 1-4 月）',
      '成绩按场次在报名门户发布——自行下载并寄送各大学',
      '不要按传闻中的未来日期做规划——官方门户的场次公告是唯一可靠来源',
    ],
    sections: [
      {
        id: 'how-often',
        h2: 'CSCA 多久考一次？',
        intro:
          'CSCA 每年举行 5 次——这个节奏让申请者在任何申请周期内都能完成首考或重考，无需等待一整年。',
        blocks: [
          {
            type: 'p',
            text: '全球首考为 2025 年 12 月 21 日。2026 年日历含 1 月 25 日与 3 月 15 日场次，年内另有后续场次——启动通知描述的节奏约为每两到三个月一场，覆盖 1 月、3 月、4 月等。每年 5 场意味着错过或想刷分的考生最多等几个月就有下一场。',
          },
          {
            type: 'table',
            caption: '已公布场次（启动时口径——逐场以官方门户为准）',
            columns: ['场次', '考试日期', '报名窗口', '状态'],
            rows: [
              ['全球首考', '2025 年 12 月 21 日', '2025 年 11 月起', '已举行'],
              ['2026 年第 2 场', '2026 年 1 月 25 日', '2025 年 12 月 23 日 – 2026 年 1 月 10 日', '已举行'],
              ['2026 年第 3 场', '2026 年 3 月 15 日', '约 2026 年 3 月 1 日截止', '已举行'],
              ['2026 年第 4-5 场', '2026 年内', '逐场公告', '见官方门户'],
              ['2027 年场次', '待公布', '待公布', '逐场公布'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '上表仅列启动时官方公布的日期。其后的 2026 年及全部 2027 年日期按场次逐次公告——请查官方 CSCA 报名门户或目标大学招生通知，不要外推。',
          },
        ],
      },
      {
        id: 'registration-windows',
        h2: 'CSCA 报名何时开放、何时截止？',
        intro:
          '报名窗口很短——通常提前 3-4 周开放，考前约 15 天截止。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**截止时间**——各场次一致：考前约 15 天',
              '**开放时间**——逐场不同；2026 年 1 月 25 日场次自 2025 年 12 月 23 日开放（提前约 4-5 周）',
              '**考点容量**——境内外考位有限；窗口名义上未关、最近考点却已满员是常事',
              '**窗口内完成支付**——缴费完成报名才算生效（单科 ¥450 / 两科及以上 ¥700）；银行转账 3-5 个工作日，拖到最后才启动会过期',
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
        h2: '什么时候考？从入学时间倒推',
        intro:
          '场次选择只有一个硬约束：成绩必须在申请截止前存在。倒推即可。',
        blocks: [
          {
            type: 'table',
            caption: '按目标入学倒推',
            columns: ['目标入学', '申请窗口', '最迟可行场次', '推荐场次'],
            rows: [
              ['9 月（秋季）', '约 11 月 – 次年 6 月（滚动；顶尖校 1-2 月截止）', '同年冬季/早春', '冬季场次——CSC 截止前还留有一场备份'],
              ['3 月（春季）', '前一年约 7 – 12 月', '前一年年中场次', '前一年秋季场次'],
              ['CSC 奖学金 + 9 月入学', '1 – 4 月', '同年冬季场次', '年内最早场次（4 月前留一次重考空间）'],
            ],
          },
          {
            type: 'ol',
            items: [
              '**列下所有申请截止日**——按日期排序。决定场次的是最早的那个，不是平均数。顶尖（C9/985）常在 1-2 月就截止。',
              '**从最早截止日往前推 6-8 周**——这是成绩必须到手的最后日期，考试本身还要更早。',
              '**选入学前 4-6 个月的场次**——早到可重考，晚到备考充分。',
              '**窗口开放首周报名**——真正的约束是考位，不是截止日。',
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
          'CSC（中国政府奖学金）截止集中在 1-4 月，这事实上把奖学金申请者锁定在每年最早的 CSCA 场次。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**硬约束**——自 2026 级起 CSC 申请必须附 CSCA 成绩；缺成绩即不合格，其他条件再强也不行',
              '**使馆（双边）渠道**——截止往往最早，常在 1-3 月',
              '**大学（中国大学项目）渠道**——通常 2-4 月，但顶尖大学更早关闸',
              '**实操法则**——参加年内第一场。若成绩不理想，第二场（约 2 个月后）勉强赶得上多数 4 月截止；第三场通常赶不上',
              '**自费兜底**——重考错过 CSC 截止，仍可用新成绩走自费申请，并在下一周期再战 CSC',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC 截止日不会动。大学截止有时可协商延期，但缺 CSCA 成绩的奖学金材料就是材料不齐。整个考试日历必须围绕 1-4 月窗口排布。',
          },
        ],
      },
      {
        id: 'missed-session',
        h2: '错过场次或截止怎么办？',
        intro:
          '错过场次可以补救，前提是清楚哪些大学还能用更晚的成绩。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**顶尖院校（1-2 月截止）**——更晚场次的成绩本周期赶不上；瞄准下一周期，或转向中游目标',
              '**中游与地方院校（滚动至 6 月）**——春季场成绩仍然可行；直接询问招生办申请是否仍开放',
              '**奖学金申请者**——错过早期场次通常意味着本轮 CSC 结束；自费申请可继续，下周期携更强成绩再战 CSC',
              '**报名已关、考试未考**——无公布的补报通道；现实选项是下一场',
              '**成绩不理想**——不要等一年；一年 5 场、2-3 个月一场的节奏正是为此设计的',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '大学只看你选择提交的成绩单——所以下一场重考可以替换首次弱分，只要目标院校截止仍开放。SICA 顾问逐场追踪哪些目标院校仍然可行。',
          },
        ],
      },
      {
        id: 'where-to-check',
        h2: '到哪里查确认日历',
        intro:
          '场次日期、报名窗口与考点清单逐场公布。三个来源是权威的；其余都是传闻。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**官方 CSCA 报名门户**——政府通知中链接的 .org.cn 域名。承载每场公告：考试日期、报名窗口、考点清单、科目可用性。',
              '**目标大学国际招生页**——大学会把与项目相关的场次公告推给在读申请者；北语、矿大、广外等在启动期均如此发布。',
              '**所在国的中国使领馆**——双边（奖学金）渠道面向本国申请者发布 CSCA 通知，含当地考点安排。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '第三方博客与中介转载日期常带错误与过期费用——有的甚至编造日期催促报名。任何无法追溯到官方门户、使馆通知或大学招生页的日期，都不要据此规划。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '下一场 CSCA 什么时候考？',
        a: 'CSCA 每年 5 场。已公布日期：2025 年 12 月 21 日全球首考，随后 2026 年 1 月 25 日与 3 月 15 日，年内另有后续场次。每一新场次都在官方 CSCA 报名门户公告——该公告（而非去年规律）是下一场日期的确认来源。',
      },
      {
        q: '应提前多久报名？',
        a: '报名窗口通常考前 3-5 周开放、考前约 15 天截止。窗口开放头几天就报：境外考位有限，银行转账到账可能需 3-5 个工作日。',
      },
      {
        q: '错过报名截止怎么办？',
        a: '没有公布的补报或现场报名通道——窗口考前约 15 天关闭。选项是下一场（通常 2-3 个月后），或若目标院校截止仍允许，联系招生办确认下一场次是否可行。',
      },
      {
        q: '对应 9 月入学应参加哪场 CSCA？',
        a: '最迟参加同年冬季或早春场次。推荐选择入学前 4-6 个月的那场——早到可在下一场重考并仍赶在截止前，尤其是 1-2 月就关闸的顶尖大学。',
      },
      {
        q: 'CSCA 成绩什么时候出？',
        a: '成绩在每场考试后经官方报名门户发布；门户在报名开放时公布预计发布时间。成绩单需自行下载并附到各大学申请中——大学不会自动收到。',
      },
      {
        q: '一年可以考两次 CSCA 吗？',
        a: '可以——一年 5 场，间隔约 2-3 个月，连考两场很常见且有规划价值：首考冲真实截止，次考刷分。大学以你选择提交的成绩单为准。',
      },
      {
        q: '所有考点每场都开吗？',
        a: '不是——考点可用性逐场次、逐国家而变。官方门户在报名时公布当次考点清单；热门境外考点常在窗口截止前就满员，所以即便截止日看似尚远也要尽早报名。',
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
