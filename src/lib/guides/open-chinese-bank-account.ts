import type { LocalizedGuide } from './types';

/**
 * "How international students open a Chinese bank account" — the
 * first article of the new 20-article study-in-china expansion
 * cluster (docs/study-in-china-20-article-plan.md), Phase 121,
 * Batch 1, article #1.
 * Target queries: "open bank account china student",
 * "中国银行 学生开户", "china bank account foreigner",
 * "international student banking china".
 *
 * Static content. Deep dive beyond the existing /guides/banking
 * process guide — which bank, which app/branch path, what
 * documents, the monthly-fee traps, what works in the first 30
 * days, and the specific note that an Alipay/WeChat Pay wallet
 * without a bank card works only inside the payment app for
 * small balances.
 */
export const openChineseBankAccountGuide: LocalizedGuide = {
  en: {
    slug: 'open-chinese-bank-account',
    eyebrow: 'GUIDE · BANKING',
    title: 'How International Students Open a Chinese Bank Account — Banks, Documents, and First-30-Day Reality',
    description:
      'The most-searched banking gap for international students: which Chinese bank, what documents, branch vs app paths, monthly-fee traps, the deposit minimums, and what a student can do in the first 30 days before an account is fully operational.',
    subtitle:
      'A Chinese bank account is the gateway to tuition payment, dorm deposits, Alipay/WeChat Pay setup, monthly stipends, and the payment apps that don\'t work without one — and yet the process differs wildly between the Big Four, regional banks, and the new app-only paths. This deep dive covers what every international student should know: which bank to pick, what documents you actually need (passport, admission letter, residence permit), how branch visits vs in-app signup work for foreigners, the monthly-fee and minimum-balance traps, and the practical first-30-day reality for an account that technically exists but cannot receive or move money yet.',
    stats: [
      { value: 'Big 4 + apps', label: 'Main account paths' },
      { value: '~30 days', label: 'To fully operational' },
      { value: 'Passport + permit', label: 'Standard docs' },
      { value: '¥0', label: 'Best student accounts' },
    ],
    quickAnswer:
      'International students open a Chinese bank account at one of the Big Four (ICBC, ABC, Bank of China, CCB) or regional banks (Merchants Bank, Pudong, etc.); the process is in-person at a branch, with passport + admission letter + student visa at minimum, and the full account (with a working debit card and online banking) usually takes 1–4 weeks depending on city and residence-permit timing. App-only paths exist for citizens; foreigners almost always need a branch visit. There is typically no monthly fee on student-tier accounts, but most banks enforce a minimum balance (often ¥100–¥500) and charge for paper statements and inter-bank transfers above a small free quota. Your Alipay/WeChat Pay setup is the next dependency — those wallets need a linked bank card to send money, so the order is: bank account first, then link the card, then enable the wallet\'s student verification.',
    keyTakeaways: [
      'Big Four (ICBC, ABC, BoC, CCB) are the default safe choice for international students; regional banks sometimes offer better student perks',
      'In-person branch visit is mandatory for foreigners; app-only account paths almost never accept a non-Chinese ID',
      'Documents: passport, valid Chinese visa, admission letter (JW202 for CSC or university admission notice), and — once issued — your residence permit',
      'Expect 1–4 weeks for a fully operational account including the debit card; a same-day partial account is possible for campus payments but not for transfers',
      'Watch the minimum-balance and monthly-fee traps: most student-tier accounts are ¥0 monthly but enforce a small minimum balance',
      'Order is bank account first, then Alipay/WeChat Pay setup — most payment apps require a linked Chinese debit card',
    ],
    sections: [
      {
        id: 'which-bank',
        h2: 'Which bank — Big Four, regional, or international',
        intro:
          'Three paths exist; the right one depends on where your university is and what services you need.',
        blocks: [
          {
            type: 'table',
            caption: 'Where international students typically open accounts',
            columns: ['Bank type', 'Examples', 'Why it works for international students'],
            rows: [
              ['Big Four state-owned', 'ICBC, ABC, Bank of China, CCB', 'Widest branch + ATM coverage; most established foreigner onboarding; BoC has bilingual forms and foreigner-friendly branches in major university districts'],
              ['Regional commercial banks', 'Merchants Bank (CMB), Pudong (SPD), Everbright, CITIC', 'Often better digital apps + student-tier perks; some have international-friendly branches in Shanghai/Beijing/Shenzhen'],
              ['University-affiliated banks', 'Varies by campus', 'On-campus branches or partner desks during orientation week — the easiest path if available, with same bank products'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Default to Big Four** — ICBC, ABC, Bank of China, and CCB have the most documented international-student workflows; choose the one your university has a relationship with (the international office usually lists the partner bank)',
              '**Bank of China’s bilingual advantage** — Bank of China (BoC) has the strongest bilingual documentation and the most foreigner-friendly branches in major university districts, especially in Beijing',
              '**Regional banks for app quality** — Merchants Bank (CMB) and Pudong (SPD) tend to have slicker apps; useful if you do most of your banking from your phone',
              '**University-affiliated branches** — if your campus has an in-campus bank branch or partner desk during orientation, this is the lowest-friction path; same products as main branch',
              '**Avoid currency-only specialist banks** — they exist, but you want a debit card that works at every campus POS and Alipay checkout',
            ],
          },
        ],
      },
      {
        id: 'documents',
        h2: 'What documents you actually need',
        intro:
          'The document list is the same at every Big Four bank — the only variable is whether you have your residence permit yet, which determines what the account can do.',
        blocks: [
          {
            type: 'table',
            caption: 'The standard document checklist (and what each enables)',
            columns: ['Document', 'Required for?', 'Notes'],
            rows: [
              ['Original passport', 'Account opening', 'Must be valid through at least your first year; check the visa-page expiry'],
              ['Valid Chinese visa (X1 / X2 / study)', 'Account opening', 'Usually the X1 student visa for degree students; X2 for short-term'],
              ['Admission letter / JW202', 'Account opening', 'University admission notice OR the CSC\'s JW202 form for scholarship students; both prove student status'],
              ['Temporary residence registration form', 'Recommended at opening; required for some banks', 'The police-issued form you get within 24 hours of arriving in your city'],
              ['Residence permit (居留许可)', 'Required for full-feature account; enables debit card and online banking', 'Issued by the local Public Security Bureau; takes 1–4 weeks; without it the account can be opened but cannot receive university stipends'],
              ['Student ID / university-issued proof', 'Optional but helpful', 'Some branches discount proof requirements when presented together'],
              ['Chinese phone number', 'Required for SMS verification', 'Get a Chinese SIM first (see the mobile-internet guide); the bank will refuse to open an account without one'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The first-30-day reality** — most students arrive, register at the university, get their residence permit filed, then have 1–4 weeks before the permit is issued. In that window, the bank can open a limited account that accepts deposits but cannot receive university stipend wires (which require the permit)',
              '**Plan it in the right order** — university registration → temporary residence registration → Chinese SIM → bank account visit (bring everything you have) → residence permit issued → revisit bank to upgrade',
              '**Make copies** — branches routinely ask for one photocopy of each document; many also keep a digital scan on file',
              '**Bring a translator or a Chinese-speaking friend** — the forms are in Chinese; bilingual forms are common at Bank of China but not guaranteed elsewhere',
              '**Don\'t bring a debit card from home expecting it to work** — your home card works at some ATMs but not as the primary Chinese account; you need a Chinese-issued card',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The single biggest mistake: arriving in China without a Chinese phone number. Banks need one for SMS verification; without it, the account opening is refused on the spot. SIM first, bank second.',
          },
        ],
      },
      {
        id: 'account-types',
        h2: 'Account types and what they actually do',
        intro:
          'Banks offer a few flavors; for an international student, the choice is mostly between a basic CNY savings account and a student-tier account with bundled perks.',
        blocks: [
          {
            type: 'table',
            caption: 'Account types you\'ll be offered',
            columns: ['Account type', 'What it does', 'Student-relevant notes'],
            rows: [
              ['CNY savings account (RMB current)', 'Receives CNY deposits and transfers, withdraws at any ATM in China', 'The default; everything else rides on top of this'],
              ['Multi-currency account', 'Holds multiple currencies (USD/EUR/GBP/CNY); receives foreign wires', 'Useful if your family wires from abroad; FX rate is per-bank'],
              ['Student-tier account', 'CNY savings with fee waivers, sometimes higher transfer limits', 'Available at most Big Four for admitted students with JW202 / admission letter; ask specifically'],
              ['Credit card', 'RMB-denominated credit line; foreign cards usually work too but with FX fees', 'Most students don\'t get one in year 1; not required for daily life'],
              ['Debit card', 'The plastic you take to the supermarket and bind to Alipay/WeChat Pay', 'Issued at account opening or sent by mail in 1–2 weeks; can be expedited at some branches'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Ask for student-tier explicitly** — the default teller workflow may not surface it; bringing the admission letter and asking by name saves a return visit',
              '**Multi-currency account is worth it** — incoming international wires carry ¥20–¥80 fees at most CNY-only banks; a multi-currency account absorbs the fee in the FX margin instead',
              '**A debit card, not just an account number** — Alipay and WeChat Pay need the 16-digit debit card number; get the physical card before leaving the branch',
              '**Online banking setup at the branch** — most banks let the teller activate the app for you; doing it in branch catches any error immediately',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Do NOT open a credit card in year one just because the bank offers it. International students carry no Chinese credit history; missed payments hurt both your credit (now being built into the PBOC system) and any future visa renewals that ask about Chinese financial standing.',
          },
        ],
      },
      {
        id: 'fees-and-minimums',
        h2: 'The fee traps and the minimum-balance reality',
        intro:
          'Big Four student-tier accounts are usually fee-free with a small minimum balance; outside that envelope, fees arrive fast.',
        blocks: [
          {
            type: 'table',
            caption: 'Fees you should know about (typical, varies by bank)',
            columns: ['Item', 'Typical student-tier', 'What to ask for'],
            rows: [
              ['Monthly account fee', '¥0 (waived for student-tier)', 'Confirm waiver in writing; some banks auto-charge if balance falls below the minimum'],
              ['Minimum balance', '¥0–¥500', 'Student-tier often waives this; check the printed tariff at the branch'],
              ['Inter-bank transfer (CNY)', 'Free up to a monthly quota, then ¥2–¥15 per transfer', 'Alipay and WeChat Pay handle small inter-bank transfers free of charge — useful workaround'],
              ['ATM withdrawal at another bank\'s ATM', '¥2–¥16 per withdrawal', 'Use your own bank\'s ATM whenever possible'],
              ['International wire (incoming)', '¥20–¥80 per wire + FX margin', 'Multi-currency accounts can reduce this'],
              ['International wire (outgoing)', '¥80–¥200 per wire + FX margin', 'Compare to Wise/Revolut/Wise-style services for large amounts'],
              ['Annual debit card fee', '¥0–¥10 (varies; waived on most student-tier accounts)', 'Ask before signing'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Get the printed tariff** — every bank has one; keep it for reference and dispute',
              '**Don\'t let the balance drop below minimums for 30+ days** — some banks auto-charge a penalty that recurs; set a low-balance alert in the app',
              '**Inter-bank transfers** — for amounts under ¥50k, Alipay/WeChat Pay often routes free of charge; for amounts over that, compare to bank wire',
              '**Keep one bank\'s ATM as your primary** — switch costs add up; pick the bank with the nearest ATM to your dorm',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The cheapest strategy is "one bank, all functions, no minimum-balance surprises." Adding a second bank is fine for specific reasons (multi-currency for foreign wires, separate savings), but most students over-bank.',
          },
        ],
      },
      {
        id: 'what-to-do',
        h2: 'What to do in the first 30 days',
        intro:
          'A practical day-by-day sequence from landing to fully operational.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Day 1–3: register at the university** — admission office, international student office, residence registration at the local police station; you get the temporary residence form',
              '**Day 2–5: get a Chinese phone number** — the mobile-internet guide walks through it; this is the hard prerequisite for everything else',
              '**Day 5–10: visit a bank branch with the full document set** — passport, visa, admission letter, temporary residence form, student ID, Chinese phone number; ask for student-tier CNY savings + debit card + app activation',
              '**Day 10–14: receive debit card (mail or branch pickup)** — meanwhile, the bank can give you the account number for tuition deposits',
              '**Day 10–21: file the residence permit application** — the Public Security Bureau issues this in 1–4 weeks; the residence permit unlocks the full account (stipend wires, online banking limits)',
              '**Day 21+: revisit the bank to upgrade** — bring the residence permit, ask the teller to upgrade the account features (transfer limits, international wire enabled, etc.)',
              '**Day 21+: bind the debit card to Alipay and WeChat Pay** — this is what unlocks every Chinese payment app and most campus payments',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Once the debit card is bound to Alipay/WeChat Pay, your daily life flips: dorm payments, meal cards, transport cards, campus POS, and almost every merchant accept the wallet. The 30-day grind pays off in years of friction-free payment.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Can international students open a Chinese bank account online?',
        a: 'No — foreigner accounts almost always require an in-person branch visit with passport, visa, admission letter, and a Chinese phone number. The apps are useful for managing an account you already have, not for opening one.',
      },
      {
        q: 'Which bank is best for international students in China?',
        a: 'The Big Four (ICBC, ABC, Bank of China, CCB) are the default safe choice; Bank of China has the strongest bilingual form support and foreigner-friendly branches. If your university has a partner bank or on-campus branch, that is usually the easiest path.',
      },
      {
        q: 'What documents do I need to open a bank account?',
        a: 'Passport, valid Chinese student visa (X1 for degree students), admission letter or JW202 form, a Chinese phone number, and — for a full-feature account — your residence permit (issued 1–4 weeks after arrival). Temporary residence registration helps at opening.',
      },
      {
        q: 'How long does it take to get a fully working Chinese bank account?',
        a: 'Plan 1–4 weeks: 1–2 weeks for the residence permit, then a branch visit to upgrade the account features. A partial account can be opened same-day for deposits, but cannot receive university stipends or enable online banking until the residence permit is in place.',
      },
      {
        q: 'Is there a minimum balance or monthly fee for international student accounts?',
        a: 'Most Big Four student-tier accounts waive the monthly fee, but a small minimum balance (often ¥100–¥500) may apply. Ask the teller for the printed tariff and confirm the waiver in writing.',
      },
      {
        q: 'Can I open a bank account before I have a residence permit?',
        a: 'Yes — a partial account can be opened with the temporary residence form and admission letter. It will receive deposits but cannot receive university stipend wires or enable online banking until the residence permit is issued and you revisit the bank to upgrade.',
      },
      {
        q: 'Do I need a Chinese phone number to open a bank account?',
        a: 'Yes — banks require SMS verification on a Chinese phone number for account opening. Get a SIM card first (see the mobile-internet guide); without one, the branch visit ends without an account.',
      },
      {
        q: 'Should I open a credit card in my first year?',
        a: 'No — international students carry no Chinese credit history; missed payments hurt your credit profile and any future visa renewal questions about financial standing. A debit card is sufficient for daily life; only consider a credit card later when you have stable income and a clear purpose.',
      },
      {
        q: 'What is JW202 and do I need it?',
        a: 'JW202 is the visa application form for Chinese Government Scholarship (CSC) students, issued by your admitting university. Banks accept it as proof of student status instead of (or alongside) a standard admission letter. Self-funded students use their university\'s admission notice instead.',
      },
      {
        q: 'Can my home country debit card work for daily payments in China?',
        a: 'Somewhat — most ATMs accept Visa/Mastercard, but merchant card readers vary widely and Alipay/WeChat Pay do not bind foreign cards for top-up. A Chinese-issued debit card is required for full daily payment participation.',
      },
    ],
    howToSteps: [
      {
        name: 'Register at the university and file temporary residence',
        text: 'Day 1–3: international student office, police station temporary residence registration. The temporary residence form helps at the bank and is a prerequisite for the residence permit.',
      },
      {
        name: 'Get a Chinese phone number',
        text: 'Day 2–5: SIM card or eSIM. The bank will refuse the account without SMS verification on a Chinese number; this is the hard prerequisite before the branch visit.',
      },
      {
        name: 'Visit a branch with the full document set',
        text: 'Day 5–10: passport, visa, admission letter / JW202, temporary residence form, student ID, Chinese phone number. Ask for the student-tier CNY savings + debit card + app activation in one visit; the teller can often process all three at once.',
      },
      {
        name: 'Receive the debit card and start binding apps',
        text: 'Day 10–14: collect the debit card (mail or branch pickup). Bind it to Alipay and WeChat Pay immediately; that single step unlocks campus POS, dorm payments, transport, and most merchants.',
      },
      {
        name: 'File the residence permit application',
        text: 'Day 10–21: Public Security Bureau visit with passport, JW202/visa, admission letter, accommodation certificate, and the police temporary residence form. Permit is typically issued in 1–4 weeks.',
      },
      {
        name: 'Upgrade the account when the residence permit arrives',
        text: 'Bring the residence permit to the bank, ask the teller to upgrade the account features (online banking limits, stipend wires enabled, international wire enabled). Confirm the printed tariff with the student-tier fee waivers in writing.',
      },
    ],
    ctaTitle: 'Need help sequencing the first 30 days in China?',
    ctaSubtitle:
      'SICA counselors walk new international students through arrival-day checklists: SIM, bank, residence permit, Alipay setup, registration — coordinated with your university\'s orientation week. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/banking',
        label: 'Banking in China — overview',
        description: 'The original process guide covering cards, transfers, and mobile banking apps.',
      },
      {
        href: '/international-money-transfer-china',
        label: 'Sending money to and from China',
        description: 'The deep dive on cross-border transfer fees and the Alipay/WeChat Pay setup for foreigners.',
      },
      {
        href: '/china-mobile-internet-for-international-students',
        label: 'Mobile internet, eSIM, and VPNs',
        description: 'Why the Chinese phone number is a hard prerequisite for the bank — and how to get one.',
      },
    ],
  },
  zh: {
    slug: 'open-chinese-bank-account',
    eyebrow: '指南 · 银行',
    title: '国际学生如何开中国银行账户——银行选择、材料与「前 30 天」现实',
    description:
      '国际学生搜索最多的银行缺口：选哪家银行、带什么材料、网点 vs App 路径、月费陷阱、最低存款，以及在账户完全可用前的 30 天里你能做什么。',
    subtitle:
      '中国银行账户是缴学费、缴宿舍押金、设置支付宝/微信支付、领取月度补贴，以及离开它就玩不转的各种支付 App 的入口——可流程在四大行、地区银行与新 App 路径之间差异巨大。本文深入覆盖每位国际学生需要知道的事：选哪家银行、到底要哪些文件（护照、录取通知书、居留许可）、外籍人士的网点办理 vs App 流程、月费与最低存款陷阱、以及「账户开了但 30 天内还无法收款或转账」的实务现实。',
    stats: [
      { value: '四大 + App', label: '主要开户路径' },
      { value: '约 30 天', label: '到完全可用' },
      { value: '护照 + 居留许可', label: '标准材料' },
      { value: '¥0', label: '最佳学生账户' },
    ],
    quickAnswer:
      '国际学生在中国开户，通常选择四大行（工行、农行、中行、建行）或地区银行（招行、浦发等）；流程是本人到网点办理，需要护照、录取通知书与学生签证至少三项，加中国手机号——整个账户（含可用借记卡与网银）通常需要 1-4 周，取决于城市与居留许可签发节奏。外籍人士几乎无法走纯 App 开户路径。学生档账户通常免月费，但多数银行设有最低存款（通常 ¥100-¥500），并对纸质对账单与跨行超额转账收费。下一步是绑定支付宝/微信支付——这两个钱包需要绑中国借记卡才能发钱，所以顺序是：先开银行账户、再绑卡、再做钱包的学生认证。',
    keyTakeaways: [
      '四大行（工行、农行、中行、建行）是国际学生默认的安全选择；地区银行有时提供更好的学生福利',
      '外籍人士必须本人到网点办理；几乎所有 App 开户路径不接受非中国身份证',
      '材料：护照、有效中国签证、录取通知书（JW202 或大学录取通知）、以及签发后的居留许可',
      '账户完全可用（含借记卡）通常要 1-4 周；当日开出的「部分账户」可用于校内支付，但还不能收款或转账',
      '警惕最低存款与月费陷阱：多数学生档账户免月费但设小额最低存款',
      '顺序是银行账户先、再设置支付宝/微信支付——多数支付 App 需要绑中国借记卡',
    ],
    sections: [
      {
        id: 'which-bank',
        h2: '选哪家银行——四大、地区或国际',
        intro:
          '三条路径；选哪条取决于大学位置与你需要的服务。',
        blocks: [
          {
            type: 'table',
            caption: '国际学生通常在哪开户',
            columns: ['银行类型', '示例', '为什么对国际学生合适'],
            rows: [
              ['四大国有行', '工行、农行、中行、建行', '网点 + ATM 覆盖最广；外籍开户流程最成熟；中行在北京等大学区有最多双语网点'],
              ['地区商业银行', '招行、浦发、光大、中信', 'App 通常更好用、学生档福利更多；上海/北京/深圳有较多外籍友好网点'],
              ['大学合作行', '因校而异', '校内或校旁有合作网点或迎新周驻点——阻力最低的路径，产品与主行一致'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**默认选四大**——工行、农行、中行、建行的国际学生开户流程有最完整文档；选你大学合作的银行（国际办通常会列合作行）',
              '**中行的双语优势**——中行在主要大学区的外籍友好网点最多、双语表单最完整',
              '**地区银行 App 更好用**——招行、浦发的手机 App 通常体验更好；若你以手机银行为主就考虑它们',
              '**校内合作网点**——若校园内有银行网点或迎新周有合作驻点，这是阻力最低的路径',
              '**避开外币专营行**——它们存在，但你需要一张能在每个校园 POS 与支付宝结账的借记卡',
            ],
          },
        ],
      },
      {
        id: 'documents',
        h2: '你到底要哪些材料',
        intro:
          '每个四大行的材料清单相同——唯一变量是你有没有居留许可，它决定账户能做什么。',
        blocks: [
          {
            type: 'table',
            caption: '标准材料清单（每项的作用）',
            columns: ['材料', '用途', '备注'],
            rows: [
              ['护照原件', '开户必需', '有效期须覆盖至少第一年；检查签证页有效期'],
              ['有效中国签证（X1/X2/学习）', '开户必需', '学位生通常 X1 学生签证；短期生 X2'],
              ['录取通知书 / JW202', '开户必需', '大学录取通知或 CSC 的 JW202 表（奖学金生）；两者都证明学生身份'],
              ['临时住宿登记表', '建议携带；部分行要求', '到本市 24 小时内由派出所开具'],
              ['居留许可', '全功能账户必需；解锁借记卡与网银', '由当地公安局签发；需 1-4 周；没有它账户可开但不能收大学补贴'],
              ['学生证 / 大学证明', '可选但有用', '一起出示时部分行会减少证明要求'],
              ['中国手机号', '短信验证必需', '先办中国 SIM（见手机上网指南）；没有它银行拒绝开户'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**前 30 天的现实**——多数学生到校、注册、办理临时住宿登记、然后等 1-4 周拿到居留许可。在此期间银行可开「限制」账户接受存款但不能收大学补贴（需要居留许可）',
              '**按对顺序排**——入学注册 → 临时住宿登记 → 中国 SIM → 银行网点（带齐材料）→ 居留许可签发 → 再访银行升级',
              '**多备几份复印件**——网点通常要求每项复印一份；有些还会存档电子扫描',
              '**带翻译或中文朋友**——表单是中文的；中行有双语表单但其他行不一定',
              '**别指望国内卡在这里通用**——国内卡在部分 ATM 能用，但不能作为主要中国账户；你需要中国发的借记卡',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '最大错误：到中国时还没办中国手机号。银行需要中国手机号做短信验证；没有就直接拒绝。SIM 优先，银行其次。',
          },
        ],
      },
      {
        id: 'account-types',
        h2: '账户类型与它们实际的功能',
        intro:
          '银行提供几种类型；对国际学生来说主要在「基础人民币储蓄」与「带福利的学生档」之间选。',
        blocks: [
          {
            type: 'table',
            caption: '你会看到的账户类型',
            columns: ['账户类型', '做什么', '学生相关备注'],
            rows: [
              ['人民币活期储蓄账户', '收人民币存款与转账、可在中国任何 ATM 取现', '默认账户；其他功能都搭在上面'],
              ['多币种账户', '存多种货币（美元/欧元/英镑/人民币）；收外币汇款', '若家里要境外汇款有用；汇率按银行牌价'],
              ['学生档账户', '人民币储蓄+免手续费、有时更高转账额度', '工农中建皆为录取学生提供；明示询问'],
              ['信用卡', '人民币信用额度；外币卡通常能用但有外汇手续费', '多数学生大一拿不到；日常生活不必要'],
              ['借记卡', '那张刷食堂、绑支付宝/微信的塑料卡', '开户当时或在 1-2 周寄到；可加速'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**明示要求学生档**——默认柜员流程可能不展示；带录取通知书并指名要求，省一次往返',
              '**多币种账户值得开**——境外汇款在纯人民币账户要 ¥20-80 手续费；多币种账户把费用摊在汇率差里',
              '**要借记卡，不仅要账号**——支付宝/微信支付需要 16 位借记卡号；离开网点前拿到塑料卡',
              '**当场开通网银**——大多数银行的柜员可在当场激活 App；当场验错',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '不要在大一为了银行推销就开信用卡。国际学生没有中国信用记录；逾期会损害你的信用（PBOC 系统已纳入）以及未来签证续签对财务状况的审查。一张借记卡足够日常生活。',
          },
        ],
      },
      {
        id: 'fees-and-minimums',
        h2: '费陷阱与最低存款现实',
        intro:
          '四大行的学生档账户通常免手续费、有小额最低存款；超出这个范围，费用很快找上来。',
        blocks: [
          {
            type: 'table',
            caption: '你应该知道的费用（典型值，因行而异）',
            columns: ['项目', '学生档典型', '要问什么'],
            rows: [
              ['月费', '¥0（学生档豁免）', '书面确认豁免；部分行余额低于下限时自动收'],
              ['最低存款', '¥0-¥500', '学生档常豁免；看网点印刷的价目表'],
              ['跨行转账（人民币）', '每月免费额度内 ¥0，超出 ¥2-15/笔', '小金额可走支付宝/微信支付免跨行费'],
              ['他行 ATM 取款', '¥2-16/笔', '尽量用本行 ATM'],
              ['境外汇款（汇入）', '¥20-80/笔 + 汇率差', '多币种账户可减少此项'],
              ['境外汇款（汇出）', '¥80-200/笔 + 汇率差', '大额对比 Wise/Revolut 等服务'],
              ['借记卡年费', '¥0-10', '签字前先问'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**要印刷的价目表**——每个银行都有；保留备查与争议',
              '**别让余额连续 30 天低于最低限**——部分行自动重复扣罚；在 App 里设低余额提醒',
              '**跨行转账**——5 万以下的小额走支付宝/微信支付通常免费；大额再比银行电汇',
              '**锁定一个 ATM 网络**——换行成本累积；选 ATM 离宿舍最近的那家',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '最便宜的打法是「一家银行、全功能、不踩最低存款意外」。加第二家可以（多币种接境外汇款、分账储蓄），但多数学生开了太多家。',
          },
        ],
      },
      {
        id: 'what-to-do',
        h2: '前 30 天做什么',
        intro:
          '从落地到账户完全可用的逐日序列。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1-3 天：在校注册**——招生办、国际学生办、派出所临时住宿登记；你会拿到临时住宿登记表',
              '**第 2-5 天：办中国手机号**——手机上网指南有详细步骤；这是后续一切的硬前提',
              '**第 5-10 天：带齐材料去银行网点**——护照、签证、录取通知书、临时住宿登记表、学生证、中国手机号；明示要求「学生档人民币储蓄+借记卡+App 激活」一次办完',
              '**第 10-14 天：拿到借记卡**（邮寄或网点领取）；银行先给你账号用于学费缴纳',
              '**第 10-21 天：申请居留许可**——去公安局，1-4 周签发；居留许可解锁账户全功能（可收补贴、可上网银）',
              '**第 21 天以后：再访银行升级账户**——带居留许可，让柜员开通网银额度、跨境汇款等',
              '**第 21 天以后：把借记卡绑进支付宝、微信支付**——这一步解锁校内 POS、宿舍支付、交通卡与几乎所有商家',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '借记卡一绑进支付宝/微信支付，日常支付就通了：宿舍、食堂、交通、校园 POS、几乎所有商家都接。30 天的折腾换来多年的顺畅支付。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '国际学生能在网上开中国银行账户吗？',
        a: '不能——外籍账户几乎都需要本人到网点办理，带护照、签证、录取通知书与中国手机号。App 适合管理已开的账户，不能开。',
      },
      {
        q: '哪家银行最适合国际学生？',
        a: '四大行（工行、农行、中行、建行）是默认安全选择；中行在双语表单与外籍友好网点方面最强。如果大学有合作行或校内网点，那通常是最省力的路径。',
      },
      {
        q: '开户要哪些材料？',
        a: '护照、有效的中国学生签证（学位生 X1）、录取通知书或 JW202 表、中国手机号，以及——全功能账户——居留许可（到校后 1-4 周签发）。临时住宿登记表也有帮助。',
      },
      {
        q: '账户完全可用要多久？',
        a: '规划 1-4 周：1-2 周拿居留许可，再去网点升级账户。当日能开「部分账户」用于存款，但还不能收大学补贴或开通网银。',
      },
      {
        q: '国际学生账户有月费或最低存款吗？',
        a: '四大行学生档账户通常免月费，但可能设有 ¥100-¥500 的最低存款。开户时让柜员给你印刷价目表并书面确认豁免。',
      },
      {
        q: '居留许可下来前能开户吗？',
        a: '可以——凭临时住宿登记表与录取通知书能开部分账户，能接受存款但不能收大学补贴或开通网银。居留许可下来后再访银行升级。',
      },
      {
        q: '需要中国手机号才能开户吗？',
        a: '需要——银行需要中国手机号做短信验证，没有就直接拒绝。',
      },
      {
        q: '第一年该开信用卡吗？',
        a: '不该——国际学生没有中国信用记录；逾期会损害你的信用与未来签证续签。一张借记卡足够日常生活，信用卡等你有稳定收入与明确目的时再考虑。',
      },
      {
        q: 'JW202 是什么？我需要吗？',
        a: 'JW202 是 CSC 奖学金生的签证申请表，由录取大学签发。银行接受它作为学生身份证明。自费生用大学录取通知代替。',
      },
      {
        q: '我的国内借记卡在中国日常支付能用吗？',
        a: '部分能——多数 ATM 收 Visa/Mastercard，但商户 POS 兼容性差异大；支付宝/微信支付不接受外卡充值。中国发的借记卡是日常支付全参与的必要条件。',
      },
    ],
    howToSteps: [
      {
        name: '在校注册并办理临时住宿登记',
        text: '第 1-3 天：国际学生办、派出所临时住宿登记。临时住宿登记表在银行能用，也是居留许可的前置。',
      },
      {
        name: '办中国手机号',
        text: '第 2-5 天：SIM 卡或 eSIM。银行需要中国手机号做短信验证；这是网点开户前的硬前提。',
      },
      {
        name: '带齐材料去银行网点',
        text: '第 5-10 天：护照、签证、录取通知书/JW202、临时住宿登记表、学生证、中国手机号。明示要求「学生档人民币储蓄+借记卡+App 激活」一次办完。',
      },
      {
        name: '收到借记卡并绑支付 App',
        text: '第 10-14 天：拿到塑料卡（邮寄或网点领）。立即绑支付宝与微信支付，这一步解锁校园 POS、宿舍支付与交通。',
      },
      {
        name: '申请居留许可',
        text: '第 10-21 天：去公安局，带护照、JW202/签证、录取通知、住宿证明与临时住宿登记表。1-4 周签发。',
      },
      {
        name: '居留许可下来后升级账户',
        text: '带居留许可去银行，让柜员升级账户功能（网银额度、跨境汇款）。印刷价目表与学生档豁免都要落到书面。',
      },
    ],
    ctaTitle: '需要有人帮你排前 30 天？',
    ctaSubtitle:
      'SICA 顾问带新生走过抵达清单：SIM、银行、居留许可、支付宝、注册——与你大学迎新周节奏同步。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/banking',
        label: '中国银行——总览',
        description: '覆盖卡片、转账与手机银行的原版流程指南。',
      },
      {
        href: '/international-money-transfer-china',
        label: '向中国与境外汇款',
        description: '深入跨境汇款手续费与支付宝/微信支付外籍设置。',
      },
      {
        href: '/china-mobile-internet-for-international-students',
        label: '手机上网、eSIM 与 VPN',
        description: '为什么中国手机号是银行的硬前提——以及怎么拿到。',
      },
    ],
  },
};
