import type { LocalizedGuide } from './types';

/**
 * "How to register for the CSCA — step-by-step" — Batch 1, article
 * #3 of the 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca registration", "csca sign up", "csca exam
 * registration portal", "how to register csca exam".
 *
 * Static content. Registration UI details are described at the
 * level verified from launch-period university/embassy notices;
 * portal-specific screens are not invented.
 */
export const cscaRegistrationGuide: LocalizedGuide = {
  en: {
    slug: 'csca-exam-registration',
    eyebrow: 'GUIDE · CSCA REGISTRATION',
    title: 'How to Register for the CSCA Exam — Step-by-Step Guide (Portal, Centers, Mistakes to Avoid)',
    description:
      'The complete CSCA registration walkthrough: finding the official portal, the 8-step flow, choosing a test center at home or abroad, payment, admission tickets, and the 6 mistakes that cost candidates a session.',
    subtitle:
      'CSCA registration runs through a single official portal: create an account with passport-exact details, pick a session and test center, select your subjects, pay ¥450 (1 subject) or ¥700 (2+ subjects) via Alipay, WeChat Pay, or bank transfer, then download your admission ticket. The window closes about 15 days before each test — and most registration failures come from preventable mistakes, not portal complexity.',
    stats: [
      { value: '8 steps', label: 'Account → ticket' },
      { value: '~15 days', label: 'Before test — window closes' },
      { value: '¥450 / ¥700', label: '1 subject / 2+ subjects' },
      { value: '3 channels', label: 'Alipay · WeChat · bank' },
    ],
    quickAnswer:
      'To register for the CSCA: (1) confirm your required subject combination on your target university\'s program page, (2) find the official CSCA registration website — the .org.cn domain published in university and embassy notices, never a third-party agent, (3) create an account with your name exactly as printed in your passport, (4) choose the session and nearest test center with seats, (5) select your subjects, (6) pay ¥450 for one subject or ¥700 total for two or more via Alipay, WeChat Pay, or bank transfer, (7) download and print the admission ticket when it is released shortly before the test, and (8) bring the ticket plus your original passport on test day. Registration closes about 15 days before each session.',
    keyTakeaways: [
      'Register only on the official CSCA portal (.org.cn) — agents charge inflated fees and cannot get you extra seats',
      'Name must match your passport character-for-character — mismatches are the #1 test-day problem',
      'Choose your subject combination BEFORE registering: ¥450 for 1 subject, ¥700 covers 2+ in the same session',
      'Center seats are the real bottleneck — register in the first days of the window, not the last',
      'Admission tickets are released shortly before the test — print a physical copy, screen-only tickets cause check-in problems',
      'Keep the payment confirmation until results are out — it is your receipt for any support dispute',
    ],
    sections: [
      {
        id: 'before-you-register',
        h2: 'Before you register — three things to lock down',
        intro:
          'Registration itself takes 15 minutes. The failures happen when candidates start without the three inputs below.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Your subject combination** — open your target program\'s admission page and note the required CSCA subjects: which Professional Chinese track (Humanities or STEM) plus which fundamentals (Math is compulsory for everyone; Physics and/or Chemistry per program). Registering for the wrong combo means paying again for a corrected sitting.',
              '**A valid passport** — the account and admission ticket use your passport details. If your passport expires or renews between registration and test day, contact the portal support before the exam — name/number mismatches block check-in.',
              '**A working payment channel** — Alipay or WeChat Pay for candidates with Chinese accounts; bank transfer for those without (start early — international transfers take 3–5 business days to clear).',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'If you are unsure which subjects your program requires, email the university\'s international admissions office before registering — a one-day wait beats a wasted session and a second fee.',
          },
        ],
      },
      {
        id: 'official-portal',
        h2: 'Finding the official registration portal (and avoiding agents)',
        intro:
          'All legitimate CSCA registration goes through one official website. University and embassy notices publish its link; nothing legitimate is sold through intermediaries.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The domain pattern** — official Chinese government exam portals use .org.cn domains. The link in your university\'s admissions notice or your embassy\'s CSCA announcement is authoritative — use it directly.',
              '**Agent red flags** — anyone charging a "registration service fee", promising "guaranteed seats" at a closed center, or asking for your passport to "register on your behalf" is a third party. They cannot create seats that the portal does not have, and errors they make are on your record, not theirs.',
              '**Lookalike sites** — some aggregator sites mirror official announcements and link to their own (paid) "registration help". Check the domain every time; bookmark the official portal after your first visit.',
              '**Where the links appear** — university international-college admission pages (BLCU, CUMT, GDUFS and others published step-by-step instructions at launch), Chinese embassy/consulate education notices, and the portal itself.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If a site asks for a fee different from ¥450/¥700, it is not the official portal. The only published CSCA fees are ¥450 for one subject and ¥700 total for two or more, paid on the portal itself.',
          },
        ],
      },
      {
        id: 'step-by-step',
        h2: 'The registration flow, step by step',
        intro:
          'The portal follows the standard Chinese national-exam registration pattern: account → session/center → subjects → payment → admission ticket.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Create your account** — register with your email or phone number, then fill in your personal details with your name EXACTLY as printed in your passport (surname/family-name order included). Save your login credentials — you will return for the ticket and the score report.',
              '**Choose your session** — select the sitting you planned (see the dates guide): 4–6 months before intake, at least 6–8 weeks before your earliest application deadline.',
              '**Choose your test center** — pick the nearest center with remaining seats: domestic centers in China, or embassy/consulate and partner-institution centers abroad. Center lists are per-session.',
              '**Select your subjects** — add the Professional Chinese track + fundamentals your program requires. One subject costs ¥450; two or more cost ¥700 total — so a second subject added at registration is effectively cheap, while a missed subject means a new session later.',
              '**Pay** — via Alipay, WeChat Pay, or bank transfer inside the window. Save the payment confirmation screenshot or receipt.',
              '**Verify your registration status** — after payment, confirm the portal shows your session, center, and subjects as registered and paid. Do not assume a failed payment resolved itself.',
              '**Download the admission ticket** — released on the portal shortly before the test. Check every field (name, passport number, center address, subject list, reporting time) and print a physical copy.',
              '**Sit the exam** — bring the printed ticket + original passport + pencils/eraser as instructed. Arrive 30–45 minutes early; phones stay outside the room.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Total time in the portal: about 15–20 minutes if your materials are ready. Every step that goes wrong later (name typo, wrong subject, unpaid order) traces back to rushing one of steps 1, 4, or 6.',
          },
        ],
      },
      {
        id: 'test-centers',
        h2: 'Choosing a test center',
        intro:
          'CSCA sessions run at designated centers inside China and at Chinese embassies, consulates, and partner institutions abroad. Availability is published per session.',
        blocks: [
          {
            type: 'table',
            caption: 'Center types and who they suit',
            columns: ['Center type', 'Where', 'Best for'],
            rows: [
              ['Domestic centers', 'Designated sites in Chinese cities', 'Students already in China (language year, exchange, transfer)'],
              ['Embassy / consulate centers', 'Chinese diplomatic missions abroad', 'Overseas applicants near a capital/consular city'],
              ['Partner institutions', 'Universities and Confucius Institute partners abroad', 'Applicants in countries with partner-venue arrangements — list varies per session'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Seats are finite** — each center has a capacity; popular overseas centers can fill in the first days of a window',
              '**Travel cost is real** — if the only available center in your country is in another city, budget the trip; a cheap exam plus an expensive flight is still cheaper than most alternatives, but plan it',
              '**Center ≠ university** — sitting at a center has no admission implication; your score report goes to whichever universities you apply to',
              '**If your country has no center this session** — check the next session\'s list before booking international travel; center lists expand as the program matures',
            ],
          },
        ],
      },
      {
        id: 'common-mistakes',
        h2: 'The 6 registration mistakes that cost candidates a session',
        intro:
          'Most CSCA registration failures are not technical — they are preventable detail errors discovered at the worst possible moment.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Name not matching the passport** — reversed name order, missing middle name, or a nickname in the account. The ticket will not match your ID at check-in. Fix: type from the passport page, not memory.',
              '**Wrong subject combination** — sitting Humanities Chinese when the program wants STEM, or omitting a required fundamental. The score report cannot be re-cut after the fact. Fix: confirm from the program page, in writing if unsure.',
              '**Starting a bank transfer on the last day** — international CNY transfers take 3–5 business days; the unpaid order expires and the window closes. Fix: pay Alipay/WeChat where possible, transfer early otherwise.',
              '**Assuming payment went through** — a failed/canceled payment looks like a registration on screen until it silently drops. Fix: check the registered-and-paid status after paying, and keep the confirmation.',
              '**Screen-only admission ticket** — a photo on your phone fails at some check-in desks. Fix: print the ticket the day it is released.',
              '**Registering for the wrong session month** — candidates confuse session dates (e.g., registering for the March sitting while planning a January-deadline application). Fix: re-read the ticket when it is issued and your whole plan still works.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Every one of these is fixable before the window closes and irreversible after the test. Set a personal deadline of "registered and verified paid" — not just "started registration" — one week before the official closing date.',
          },
        ],
      },
      {
        id: 'after-registering',
        h2: 'After you register',
        intro:
          'Registration is not the finish line — three follow-ups stand between a paid order and a sat exam.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Watch for the admission-ticket release** — announced on the portal and often by universities; download and print same-day, and verify every field against your passport',
              '**If details are wrong** — contact portal support (and your university admissions office) immediately after discovering the error; corrections before ticket issue are routine, after ticket issue they are not',
              '**Keep your paper trail** — payment confirmation, registration confirmation, and the ticket email; if any dispute arises (a dropped subject, a center change), these are your evidence',
              '**No-show policy** — there is no published automatic refund for missing the exam; treat the fee as spent if you cannot attend, and re-register for the next session early',
              '**Prep continues** — with the date fixed, run your study plan backwards from test day; the 8-week prep guide in the flagship maps week-by-week',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Where do I register for the CSCA exam?',
        a: 'On the official CSCA registration website — the .org.cn domain linked from university admissions notices and Chinese embassy announcements. Register only there: third-party agents charge inflated fees, cannot create extra seats, and any errors they make go on your record.',
      },
      {
        q: 'What do I need before starting registration?',
        a: 'Three things: your confirmed subject combination from the target program page, a valid passport (details entered exactly as printed), and a working payment channel — Alipay or WeChat Pay if you have Chinese accounts, otherwise a bank that can transfer CNY (which takes 3–5 business days, so start early).',
      },
      {
        q: 'Can an agent register for the CSCA on my behalf?',
        a: 'Technically someone can fill the form for you, but it is a bad deal: agents charge well above the official ¥450/¥700 fees, cannot guarantee seats, and a name or subject error they make is yours to live with at check-in. The portal is simple enough to use directly — 15–20 minutes with prepared materials.',
      },
      {
        q: 'How do I choose a CSCA test center?',
        a: 'During registration you pick from the per-session center list: designated centers in China, or Chinese embassies/consulates and partner institutions abroad. Choose the nearest center with remaining seats — popular overseas centers fill early in the window — and budget travel if the only option is in another city.',
      },
      {
        q: 'When is the CSCA admission ticket issued?',
        a: 'Shortly before the test, via the registration portal. Download it as soon as it is released, verify the name, passport number, center address, subject list, and reporting time against your documents, and print a physical copy — screen-only tickets cause problems at check-in.',
      },
      {
        q: 'My passport is renewing before the exam — what do I do?',
        a: 'Register with the passport you will hold on test day if possible. If the passport renews between registration and the exam, contact portal support before test day so the ticket matches your current document — a mismatch between ticket and ID can block entry.',
      },
      {
        q: 'Can I change subjects after registering?',
        a: 'Subject changes are handled on the portal within the registration window — which is why adding a subject at registration time (¥700 total for 2+) is far cheaper than booking a corrected sitting later. After the window closes, changes are not published as available; plan your combination before you pay.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm your subject combination in writing',
        text: 'Read your target program\'s admission page for the required CSCA subjects (Chinese track + fundamentals). If anything is ambiguous, email international admissions and save the reply — it is your reference if a dispute arises.',
      },
      {
        name: 'Locate the official portal from an authoritative notice',
        text: 'Use the link in your university\'s admissions page or your embassy\'s CSCA announcement (official domains end .org.cn). Bookmark it. Ignore agents and lookalike aggregator sites.',
      },
      {
        name: 'Create the account with passport-exact details',
        text: 'Type your name from the passport data page — character-for-character, correct name order. Use an email you check daily; the ticket and score-report notices go there.',
      },
      {
        name: 'Select session, center, and subjects',
        text: 'Pick the session you planned months ahead, the nearest center with seats, and your full subject list. Remember the fee band: ¥450 for one subject, ¥700 total for two or more in the same session.',
      },
      {
        name: 'Pay inside the window and verify the status',
        text: 'Alipay/WeChat for instant confirmation; bank transfer only if started days before the closing date. After paying, confirm the portal shows registered-and-paid, and save the confirmation.',
      },
      {
        name: 'Print the admission ticket the day it is released',
        text: 'When the portal issues tickets, download immediately, verify every field against your passport, and print a physical copy. Errors found now are correctable; errors found at the door are not.',
      },
      {
        name: 'Prepare your test-day kit',
        text: 'Printed ticket, original passport, pencils and eraser as instructed. No calculator, no phone in the room. Route planned to arrive 30–45 minutes early.',
      },
      {
        name: 'After the exam, retrieve and forward your scores',
        text: 'When results release on the portal, download the score report and attach it to every university application — and to your CSC scholarship file if applicable. Then update your plan using the dates guide.',
      },
    ],
    ctaTitle: 'Want a counselor to review your registration plan?',
    ctaSubtitle:
      'SICA counselors verify your subject combination against your target programs, review your registration before you pay, and keep your ticket-to-application chain error-free. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, exemptions, and the CSC requirement.',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA exam dates & registration windows',
        description: 'Which session to pick and how to plan backwards from your intake.',
      },
      {
        href: '/csca-exam-fees',
        label: 'CSCA exam fees & payment guide',
        description: '¥450/¥700 banding, Alipay/WeChat/bank payment, and paying from outside China.',
      },
    ],
  },
  zh: {
    slug: 'csca-exam-registration',
    eyebrow: '指南 · CSCA 报名',
    title: 'CSCA 考试报名全流程——逐步操作指南（门户、考点、避坑清单）',
    description:
      'CSCA 报名完整 walkthrough：找到官方门户、8 步流程、境内外考点选择、缴费、准考证，以及让考生损失一场考试的 6 个错误。',
    subtitle:
      'CSCA 经唯一官方门户报名：用与护照逐字一致的姓名注册账号，选场次与考点，选科目，经支付宝、微信支付或银行转账支付 ¥450（1 科）或 ¥700（两科及以上），再下载准考证。报名考前约 15 天截止——多数报名失败源于可预防的细节错误，而非门户复杂。',
    stats: [
      { value: '8 步', label: '注册 → 准考证' },
      { value: '约 15 天', label: '考前——窗口截止' },
      { value: '¥450 / ¥700', label: '1 科 / 两科及以上' },
      { value: '3 通道', label: '支付宝 · 微信 · 银行' },
    ],
    quickAnswer:
      'CSCA 报名流程：(1) 在目标大学项目页确认要求的科目组合；(2) 找到官方 CSCA 报名网站——大学与使馆通知中公布的 .org.cn 域名，绝不通过第三方中介；(3) 用与护照逐字一致的姓名注册账号；(4) 选场次与最近的有位考点；(5) 选科目；(6) 经支付宝、微信支付或银行转账支付单科 ¥450、两科及以上合计 ¥700；(7) 考前准考证发布后下载并打印；(8) 考试日携带纸质准考证与护照原件入场。报名在每场考试前约 15 天截止。',
    keyTakeaways: [
      '只在官方 CSCA 门户（.org.cn）报名——中介收费虚高，也变不出额外考位',
      '姓名必须与护照逐字一致——信息不一致是考试日头号问题',
      '报名前先定科目组合：单科 ¥450，¥700 覆盖同场两科及以上',
      '考位才是真正瓶颈——窗口开放头几天报，别拖到最后',
      '准考证考前不久发布——打印纸质版，仅凭屏幕入场容易出问题',
      '成绩发布前保留支付凭证——发生争议时它就是你的凭证',
    ],
    sections: [
      {
        id: 'before-you-register',
        h2: '报名前——先锁死三件事',
        intro:
          '报名本身只要 15 分钟。失败都发生在没备齐以下三项输入就动手的考生身上。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**科目组合**——打开目标项目招生页，记下要求的 CSCA 科目：专业中文哪条轨（人文/理工）加哪些基础科（数学人人必考；物理/化学按项目）。报错组合意味着花钱再考一场。',
              '**有效护照**——账号与准考证都用护照信息。若护照在报名后、考试前到期换发，考前联系门户支持处理——姓名/号码不一致会被拦在入场处。',
              '**可用的支付通道**——有国内账户走支付宝或微信支付；没有则走银行转账（尽早启动——跨境转账需 3-5 个工作日到账）。',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '不确定项目要求哪些科目，先邮件问大学国际招生办再报名——等一天的回复，好过浪费一场考试加一笔报名费。',
          },
        ],
      },
      {
        id: 'official-portal',
        h2: '找到官方报名门户（并避开中介）',
        intro:
          '所有合规的 CSCA 报名都经一个官方网站。大学与使馆通知公布其链接；没有任何合规渠道经中间商出售。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**域名特征**——中国官方考试门户使用 .org.cn 域名。大学招生通知或使馆 CSCA 公告里的链接即权威来源——直接使用。',
              '**中介红旗**——任何收「代报名服务费」、承诺「保证考位」、或要你护照「代你报名」的都是第三方。门户没有的考位他们变不出来，他们犯的错记在你的档案上。',
              '**仿冒站点**——部分聚合站镜像官方公告并导向自己的（收费）「报名协助」。每次都核对域名；首次访问后收藏官方门户。',
              '**链接出现在哪**——大学国际学院招生页（北语、矿大、广外等启动期均发布过逐步指引）、中国使领馆教育通知、以及门户本身。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '任何要价不是 ¥450/¥700 的站点都不是官方门户。CSCA 公布的费用只有：单科 ¥450、同场两科及以上合计 ¥700，且在门户内直接支付。',
          },
        ],
      },
      {
        id: 'step-by-step',
        h2: '报名流程，逐步操作',
        intro:
          '门户遵循中国国家级考试报名的标准范式：账号 → 场次/考点 → 科目 → 缴费 → 准考证。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**注册账号**——用邮箱或手机号注册，然后按护照数据页逐字填写个人信息（含姓名顺序）。保存登录凭据——准考证和成绩单都要回来取。',
              '**选场次**——选你规划好的那一场（见时间指南）：入学前 4-6 个月，且距最早申请截止至少 6-8 周。',
              '**选考点**——从有余位的考点中选最近的：中国境内指定考点，或境外使领馆及合作机构考点。考点清单逐场公布。',
              '**选科目**——加选项目要求的专业中文轨 + 基础科。单科 ¥450；两科及以上合计 ¥700——报名时加一科几乎等于白送，漏报一科却意味着之后再考一场。',
              '**缴费**——窗口内经支付宝、微信支付或银行转账支付。保存支付确认截图或回执。',
              '**核对报名状态**——支付后确认门户显示所选场次、考点、科目均为「已报名已支付」。不要默认失败的支付会自行恢复。',
              '**下载准考证**——考前不久在门户发布。逐项核对（姓名、护照号、考点地址、科目清单、报到时间）并打印纸质版。',
              '**参加考试**——携带打印准考证 + 护照原件 + 按要求的铅笔/橡皮。提前 30-45 分钟到场；手机留在考场外。',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '材料备齐时，门户内全程约 15-20 分钟。后续出问题的每一步（姓名打错、科目报错、订单未付）都能追溯到第 1、4、6 步中的仓促。',
          },
        ],
      },
      {
        id: 'test-centers',
        h2: '考点怎么选',
        intro:
          'CSCA 场次在中国境内指定考点及中国驻外使领馆、海外合作机构举行。可用性逐场公布。',
        blocks: [
          {
            type: 'table',
            caption: '考点类型与适用人群',
            columns: ['考点类型', '位置', '适合人群'],
            rows: [
              ['境内考点', '中国各城市指定场地', '已在中国境内的学生（语言年、交换、转学）'],
              ['使领馆考点', '境外中国外交机构', '靠近首都/领事城市的境外申请者'],
              ['合作机构考点', '境外合作大学与孔子学院等', '所在国有合作场地安排的申请者——清单逐场变化'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**考位有限**——每个考点有容量上限；热门境外考点常在窗口头几天满员',
              '**交通成本是真实的**——若国内唯一考点在另一座城市，把路费计入预算；便宜的考试加上一张机票仍比多数替代方案便宜，但要提前计划',
              '**考点 ≠ 大学**——在哪个考点考试不影响录取；成绩单寄给你申请的大学',
              '**本国本场无考点**——先查下一场的考点清单再订国际机票；随项目成熟，考点清单会持续扩容',
            ],
          },
        ],
      },
      {
        id: 'common-mistakes',
        h2: '让考生损失一场考试的 6 个报名错误',
        intro:
          'CSCA 报名失败大多不是技术问题——而是最坏时刻才被发现、本可预防的细节错误。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**姓名与护照不符**——姓名顺序颠倒、漏中间名、或账号里用了昵称。准考证与证件对不上就无法入场。解法：照护照数据页录入，不凭记忆。',
              '**科目组合报错**——项目要理工中文却报了人文中文，或漏了必需基础科。成绩单事后无法重切。解法：以项目页为准，不确定就书面确认。',
              '**最后一天才启动银行转账**——跨境人民币转账需 3-5 个工作日；未支付订单过期、窗口关闭。解法：能用支付宝/微信就即时付，转账则尽早。',
              '**默认支付已成功**——支付失败/取消在屏幕上看起来像报名成功，直到悄悄掉单。解法：支付后核对「已报名已支付」状态并保留凭证。',
              '**仅凭屏幕准考证**——手机照片在一些检录台不被接受。解法：准考证发布当天就打印。',
              '**报错场次月份**——把场次日期搞混（如计划 1 月截止的申请却报了 3 月场）。解法：准考证发布时重读一遍，确认整个计划仍然成立。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '以上每一条在窗口截止前都可修正，考试之后都不可逆。给自己设一条内部截止线：「已报名且已核实支付」——而不是「已开始报名」——官方截止日前一周完成。',
          },
        ],
      },
      {
        id: 'after-registering',
        h2: '报名之后',
        intro:
          '报名不是终点——从一笔已付订单到走进考场，还差三个跟进动作。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**盯准考证发布**——门户（通常大学也会）公告发布时间；当天下载打印，并逐项与护照核对',
              '**信息有误**——发现后立即联系门户支持（及大学招生办）；准考证发布前的更正是常规操作，发布后不是',
              '**保留凭证链**——支付凭证、报名确认、准考证邮件；任何争议（掉科目、考点变更）都以这些为证',
              '**缺考政策**——没有公布的缺考自动退款；无法参加就把这笔费用当作已支出，尽早报名下一场',
              '**备考继续**——日期锁定后，从考试日倒排学习计划；旗舰指南的 8 周备考有逐周安排',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 在哪里报名？',
        a: '在官方 CSCA 报名网站——大学招生通知与中国使馆公告中链接的 .org.cn 域名。只在那里报名：第三方中介收费远高于官方 ¥450/¥700，无法保证考位，且他们犯的姓名或科目错误要在入场时由你自己承担。',
      },
      {
        q: '报名前需要准备什么？',
        a: '三样：目标项目页确认的科目组合、有效护照（信息逐字录入）、可用的支付通道——有国内账户走支付宝/微信支付，否则用能转人民币的银行（需 3-5 个工作日，尽早启动）。',
      },
      {
        q: '可以找中介代报名 CSCA 吗？',
        a: '技术上别人可以替你填表，但很亏：中介收费远超官方 ¥450/¥700，无法保证考位，且姓名或科目错误由你在入场时承担。门户本身足够简单——备齐材料 15-20 分钟即可自行完成。',
      },
      {
        q: 'CSCA 考点怎么选？',
        a: '报名时从逐场公布的考点清单中选择：中国境内指定考点，或境外中国使领馆与合作机构。选最近的有位考点——热门境外考点窗口早期就满——若唯一选项在另一城市，把交通费计入预算。',
      },
      {
        q: 'CSCA 准考证什么时候发？',
        a: '考前不久经报名门户发布。发布后尽快下载，核对姓名、护照号、考点地址、科目清单与报到时间，并打印纸质版——仅凭屏幕入场容易出问题。',
      },
      {
        q: '护照在考试前到期换发怎么办？',
        a: '尽量用考试日将持有的护照报名。若护照在报名后、考试前换发，考前联系门户支持使准考证与新证件匹配——准考证与证件不一致可能被拒入场。',
      },
      {
        q: '报名后可以换科目吗？',
        a: '科目变更在报名窗口内经门户处理——这正是报名时加科（两科及以上合计 ¥700）远比事后重考便宜的原因。窗口关闭后没有公布的变更通道；付费前定好组合。',
      },
    ],
    howToSteps: [
      {
        name: '书面确认科目组合',
        text: '读目标项目招生页的 CSCA 科目要求（中文轨 + 基础科）。有含糊之处就邮件国际招生办并保存回复——发生争议时它就是依据。',
      },
      {
        name: '从权威通知定位官方门户',
        text: '使用大学招生页或使馆 CSCA 公告中的链接（官方域名为 .org.cn）。收藏之。无视中介与仿冒聚合站。',
      },
      {
        name: '用护照逐字一致的信息注册账号',
        text: '照护照数据页录入姓名——逐字符、顺序正确。使用你每天查看的邮箱；准考证与成绩通知都发那里。',
      },
      {
        name: '选场次、考点与科目',
        text: '选提前数月规划好的场次、最近的有位考点、完整科目清单。记住费用档：单科 ¥450，同场两科及以上合计 ¥700。',
      },
      {
        name: '窗口内缴费并核实状态',
        text: '支付宝/微信即时确认；银行转账只在距截止还有数日时启动。支付后确认门户显示已报名已支付，并保存凭证。',
      },
      {
        name: '准考证发布当天打印',
        text: '门户发布准考证后立即下载，逐项与护照核对，打印纸质版。现在发现的错误可更正；门口发现的不能。',
      },
      {
        name: '备好考试日装备',
        text: '纸质准考证、护照原件、按要求准备的铅笔与橡皮。禁计算器，手机不入场。规划路线提前 30-45 分钟到达。',
      },
      {
        name: '考后取分并寄送',
        text: '成绩在门户发布后下载成绩单，附到每所大学申请——如适用附到 CSC 奖学金材料。然后按时间指南更新你的计划。',
      },
    ],
    ctaTitle: '需要顾问复核你的报名方案？',
    ctaSubtitle:
      'SICA 顾问核对科目组合与目标项目的匹配、在你付费前复核报名信息，让准考证到申请材料的链条零差错。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用、豁免与 CSC 要求。',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA 考试时间与报名窗口',
        description: '该选哪一场，以及如何从入学时间倒推规划。',
      },
      {
        href: '/csca-exam-fees',
        label: 'CSCA 考试费用与支付指南',
        description: '¥450/¥700 分档、支付宝/微信/银行支付，以及境外付款方案。',
      },
    ],
  },
};
