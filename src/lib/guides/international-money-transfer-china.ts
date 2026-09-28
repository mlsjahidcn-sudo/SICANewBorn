import type { LocalizedGuide } from './types';

/**
 * "Sending money to and from China" — Phase 121, Batch 1, article
 * #2 of the new study-in-china expansion cluster
 * (docs/study-in-china-20-article-plan.md).
 * Target queries: "send money china student", "alipay foreigner setup",
 * "wechat pay international card", "international wire china".
 */
export const internationalMoneyTransferGuide: LocalizedGuide = {
  en: {
    slug: 'international-money-transfer-china',
    eyebrow: 'GUIDE · MONEY TRANSFER',
    title: 'Sending Money to and from China — Cross-Border Fees, Alipay/WeChat Pay for Foreigners, and the Workarounds',
    description:
      'The day-to-day payment reality for international students: how to get money in and out, cross-border transfer fees, how to set up Alipay and WeChat Pay with a foreign card, and the common failure modes.',
    subtitle:
      'Moving money in and out of China for an international student is its own small project: incoming family wires carry bank transfer fees and FX margin; outgoing remittances cost more; Alipay and WeChat Pay do not bind most foreign cards for top-up. This guide walks through every practical path and the three day-to-day traps that quietly drain budgets.',
    stats: [
      { value: '~3 paths', label: 'Cross-border channels' },
      { value: 'FX margin', label: 'Hidden cost on every transfer' },
      { value: 'Card-bind', label: 'The Alipay/WeChat Pay problem' },
      { value: '¥0–200', label: 'Typical fee band per wire' },
    ],
    quickAnswer:
      'Three practical paths for moving money into China for an international student: bank wire transfers from abroad (¥20–¥80 per wire + FX margin), third-party services like Wise or Revolut (lower FX margin, transparent fee), and cash agents (rare for students; sometimes the only emergency option). Outgoing remittances usually cost more (¥80–¥200 per outgoing wire) and may require tax-residency evidence. For daily payments, Alipay\'s Tour Pass works for small amounts and short stays; the durable solution is a Chinese debit card bound to both wallets. Order: bank account first, then bind the card, then enable student verification.',
    keyTakeaways: [
      'Three cross-border channels: bank wire, third-party service (Wise/Revolut), cash agents — each with its own fee structure',
      'FX margin is usually larger than the headline fee — compare total cost, not just the wire fee',
      'Alipay Tour Pass and WeChat Pay international card support are limited workarounds; bind a Chinese debit card for the long term',
      'Outgoing transfers are usually more expensive and may require tax-residency evidence',
      'Three day-to-day traps: card-binding failures, Chinese-network-only merchants, card-not-present surcharges',
      'Order of operations: bank account first, bind debit card to Alipay/WeChat Pay second, enable student verification last',
    ],
    sections: [
      {
        id: 'channels',
        h2: 'Three cross-border channels — and when to use each',
        intro:
          'Each channel has its own cost, speed, and limit. Match the channel to the situation.',
        blocks: [
          {
            type: 'table',
            caption: 'Cross-border money transfer channels compared',
            columns: ['Channel', 'Typical fee', 'Time to clear', 'Best for'],
            rows: [
              ['Bank wire (SWIFT)', '¥20–¥80 per wire + 0.3%–1% FX margin', '1–3 business days', 'Large amounts, scholarship stipend wires, tuition payments'],
              ['Third-party service (Wise, Revolut, Remitly, etc.)', '0.4%–1% total (mid-market FX + small fee)', 'Hours to 1 business day', 'Recurring family support, small-to-medium amounts, better FX'],
              ['Cash delivered via licensed agent (e.g., Western Union)', '3%–7% of amount + fixed fee', 'Minutes to hours', 'Emergencies only — fee is high; verify licensing in your jurisdiction'],
            ],
          },
          {
            type: 'ul',
            items: [
              'Bank wire for tuition and stipends — large amounts are where the per-wire fee matters less than the FX margin',
              'Third-party services for recurring support — Wise/Revolut-style services offer mid-market FX with a small transparent fee',
              'Cash agents for emergencies only — the percentage fee is 5–10x what you would pay otherwise',
              'Always include the reference — wire transfers without a clear student ID reference can be held for compliance checks',
              'Avoid Chinese credit cards for receiving foreign currency — most Chinese debit cards are CNY-only',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Total-cost comparison rule: when picking between channels, compare the all-in rate (FX margin + fee) in your home currency, not the headline fee. A "fee-free" transfer with 1.5% FX margin costs more than a ¥50-fee transfer at mid-market FX on ¥3,000.',
          },
        ],
      },
      {
        id: 'alipay-wechat-setup',
        h2: 'Setting up Alipay and WeChat Pay for international students',
        intro:
          'The wallet setup is the harder problem. Foreign cards have limited bind ability — Chinese debit cards are the durable solution.',
        blocks: [
          {
            type: 'table',
            caption: 'Payment app options for foreigners',
            columns: ['Option', 'What it does', 'Limits'],
            rows: [
              ['Alipay — Tour Pass', 'Prepaid wallet loaded from a Visa/Mastercard; works for small payments', 'Per-transaction caps (~US$300); 90-day validity; not all merchants accept'],
              ['WeChat Pay — international card binding', 'Bind a foreign Visa/Mastercard; works for many merchants', 'Per-transaction caps; some merchant categories excluded; not all online services accept'],
              ['Alipay / WeChat Pay bound to a Chinese debit card', 'Full function, full limit, accepted everywhere', 'Requires Chinese bank account + Chinese phone number; the durable solution'],
            ],
          },
          {
            type: 'ul',
            items: [
              'Alipay Tour Pass is a workaround, not a solution — it works for the first 90 days but has per-transaction and merchant-acceptance limits',
              'WeChat Pay international card support exists but is inconsistent — some merchants accept, others do not',
              'The durable setup is: Chinese bank account → Chinese debit card → bind to Alipay and WeChat Pay → complete student verification',
              'Verification levels matter — Alipay and WeChat Pay tier their users by verification; full verification removes most caps',
              "Don't try to bypass verification — using a fake ID or borrowed phone number is a fast way to lose the account permanently",
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The foreign-card-binding failure mode is silent: the card appears to bind, the first payment succeeds, then the wallet refuses the second one with an opaque error. The fix is always the same — bind a Chinese debit card.',
          },
        ],
      },
      {
        id: 'fees',
        h2: 'The full fee picture for incoming transfers',
        intro:
          'The wire fee is the smallest part of the cost; FX margin and intermediary banks do the damage.',
        blocks: [
          {
            type: 'ul',
            items: [
              'SWIFT wire — typically ¥20–¥80 per wire at the receiving end; check your university\'s recommended payment method for tuition',
              'Correspondent/intermediary bank fees — SWIFT wires often route through 1–2 intermediary banks, each of which may take ¥10–¥30',
              'FX margin — the bank buys at a rate slightly worse than mid-market; typical 0.3%–1% on CNY',
              'Third-party service comparison — Wise-style services quote mid-market FX with a small transparent fee (often 0.4%–1% total)',
              'Stipend wires from universities — usually no fee at the receiving end; check your scholarship agreement',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For monthly family support of US$1,000–US$3,000, a third-party service usually beats a bank wire by ¥100–¥300 per transfer. For tuition (¥50,000+) and CSC stipends, the bank wire is usually the only path the university supports.',
          },
        ],
      },
      {
        id: 'outgoing',
        h2: 'Sending money home — the harder path',
        intro:
          'Outgoing remittances face stricter rules, higher fees, and tax-residency questions. Plan ahead.',
        blocks: [
          {
            type: 'ul',
            items: [
              'Outgoing SWIFT wire — typically ¥80–¥200 per wire + FX margin; bank will ask for a purpose (living expenses, education-related, family support)',
              'Annual quota — China caps foreign-currency outflows per person per year; the cap changes per policy cycle; check with your bank before large transfers',
              'Tax residency evidence — for amounts above certain thresholds, the bank may ask for your tax-residency status in China and/or your home country',
              'CNY-to-foreign-currency conversion timing — the bank converts at the rate posted that day; large transfers can request a forward contract to lock a rate',
              'Carry-forward rules — what you do NOT spend from your stipend during the year can typically be remitted at year-end, with documentation',
              'Small amounts via Alipay/WeChat Pay — both apps allow small outgoing transfers via linked Chinese debit cards; useful for <¥5,000',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Never try to remit money through informal channels (e.g., crypto-to-cash, money mules). Chinese law treats undeclared capital outflows as a serious violation; foreign students can lose their visa. The official channels are slow but legal.',
          },
        ],
      },
      {
        id: 'day-to-day-traps',
        h2: 'Three day-to-day traps — and the workarounds',
        intro:
          'Most of the cost is not the transfer; it is the small daily-friction fees you forget about.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Foreign-card binding failures — your Visa/Mastercard may bind to Alipay/WeChat Pay initially and then refuse on the second or third transaction. Workaround: bind a Chinese debit card; the foreign card is for emergency only.',
              'Chinese-network-only merchants — some merchants (especially older campus POS systems, smaller restaurants, some vending machines) accept only China UnionPay cards. Workaround: a multi-network debit card (most Chinese debit cards include both UnionPay and Visa/Mastercard) plus Alipay/WeChat Pay as backup.',
              'Card-not-present surcharges — online services (flight tickets, streaming subscriptions, foreign software) that process your Chinese debit card may apply 2%–3% FX surcharges. Workaround: use the home card for foreign services; use the Chinese card for Chinese merchants.',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The combined result of these three traps is rarely more than ¥200–¥500 per month for an average student, but they are recurring and invisible. The fix is structural: one Chinese debit card for Chinese merchants, one foreign card for foreign services, and one bound Chinese debit card for Alipay/WeChat Pay.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does it cost to send money to China from abroad?',
        a: 'Plan on ¥20–¥80 per SWIFT wire plus 0.3%–1% FX margin at the receiving bank, or 0.4%–1% all-in with a third-party service like Wise or Revolut. Total cost varies by amount, currency, and intermediary banks involved.',
      },
      {
        q: 'Can international students use Alipay and WeChat Pay with a foreign card?',
        a: 'Limited — Alipay\'s Tour Pass works for ~90 days with per-transaction caps; WeChat Pay binds some foreign cards but inconsistently. The durable solution is a Chinese debit card bound to both wallets.',
      },
      {
        q: 'What is Alipay Tour Pass and is it enough?',
        a: 'Alipay Tour Pass is a prepaid wallet loaded from a Visa/Mastercard; designed for short-stay tourists. It has per-transaction caps (~US$300), 90-day validity, and many merchants do not accept it. Useful as a bridge but not durable.',
      },
      {
        q: 'Is Wise or Revolut available in China?',
        a: 'Wise and Revolut-style services are typically used for sending money into China from abroad, not for in-country payments. They offer mid-market FX with small transparent fees and are often the cheapest option for recurring family support transfers.',
      },
      {
        q: 'How long does an international wire take to reach China?',
        a: 'Typically 1–3 business days for SWIFT, depending on intermediary banks and the receiving bank\'s compliance checks. Wires with clear student-ID references and matching names clear faster.',
      },
      {
        q: 'How do I send money from China to my home country?',
        a: 'Through your Chinese bank\'s outgoing wire service — typically ¥80–¥200 per wire plus FX margin, with bank confirmation required. Annual foreign-currency outflow caps apply; check with your bank before large transfers. Tax-residency evidence may be requested for amounts above certain thresholds.',
      },
      {
        q: 'Why does my foreign card fail to bind to Alipay or WeChat Pay?',
        a: 'Foreign cards have limited bind support and may appear to bind initially and then refuse on subsequent transactions. The durable solution is a Chinese debit card bound to the wallet.',
      },
      {
        q: 'Is it legal to use crypto or informal channels to move money into or out of China?',
        a: 'No — Chinese law treats undeclared capital flows as a serious violation; international students who use such channels risk visa cancellation and legal consequences. Use only the official bank and licensed third-party channels.',
      },
      {
        q: 'What is the cheapest way to send money home from China at the end of my program?',
        a: 'Carry-forward rules usually allow unused stipend to be remitted at year-end; check with your bank branch in advance for the documentation required. A bank wire is typically the cheapest route for amounts above ¥30,000; third-party services can be cheaper for smaller amounts.',
      },
      {
        q: 'Can I pay my tuition directly from a foreign account?',
        a: 'Usually not — universities ask for CNY payments to a Chinese bank account. Plan to receive the wire into your Chinese account, then pay tuition from that account. The university\'s international office has the exact receiving-bank instructions and reference requirements.',
      },
    ],
    howToSteps: [
      {
        name: 'Plan the order of operations on arrival',
        text: 'Chinese SIM → bank account → debit card → bind to Alipay/WeChat Pay → student verification. Skipping the bank-card step leaves you dependent on foreign-card bindings that fail silently.',
      },
      {
        name: 'Set up incoming transfers before you need them',
        text: 'If family support is planned, set up the third-party service (Wise/Revolut) or share the bank-wire instructions with your family while you still have internet access at home. Wire reference = your passport name + university student ID.',
      },
      {
        name: 'Use Tour Pass as a bridge, not a destination',
        text: 'Alipay Tour Pass for the first 90 days while your Chinese debit card is in process; transition to the bound Chinese card the moment it arrives. Don\'t depend on Tour Pass for rent payments.',
      },
      {
        name: 'Match the channel to the amount',
        text: 'Under ~US$1,000: third-party service. Over ~US$3,000: bank wire. Tuition and stipends: bank wire (usually the only path the university supports). Emergencies only: licensed cash agents despite the high fee.',
      },
      {
        name: 'Plan outgoing remittances early',
        text: 'Ask your bank branch about annual caps, tax-residency documentation, and the carry-forward rules for unused stipend. Large outgoing transfers need 1–2 weeks of documentation lead time.',
      },
      {
        name: 'Build the three-card daily setup',
        text: 'One Chinese debit card for Chinese merchants and wallet binding; one foreign card for foreign online services; the Chinese card bound to Alipay/WeChat Pay as the universal Chinese-network payment default.',
      },
    ],
    ctaTitle: 'Need help sequencing the money flow on arrival?',
    ctaSubtitle:
      'SICA counselors review your specific fee picture — tuition payment path, family-support channels, stipend remittance, wallet setup — and help you avoid the three day-to-day traps. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/open-chinese-bank-account',
        label: 'Opening a Chinese bank account',
        description: 'The bank-account deep dive that precedes the wallet setup.',
      },
      {
        href: '/guides/banking',
        label: 'Banking in China — overview',
        description: 'The original process guide covering cards, transfers, and mobile banking apps.',
      },
      {
        href: '/guides/cost-of-living',
        label: 'Cost of living in China',
        description: 'Monthly budgets and where the rent, food, and transport go.',
      },
    ],
  },
  zh: {
    slug: 'international-money-transfer-china',
    eyebrow: '指南 · 跨境汇款',
    title: '向中国汇款与从中国汇出——跨境手续费、外籍人士的支付宝/微信支付与变通方案',
    description:
      '国际学生日常支付现实：钱怎么进怎么出、跨境汇款悄悄累积的手续费、外籍人士如何设置支付宝与微信支付，以及三个悄悄吃掉预算的日常陷阱。',
    subtitle:
      '国际学生把钱汇入汇出中国本身就是一项小工程：家里汇来的钱要银行手续费与汇率差；从中国汇出的更贵；支付宝、微信支付又不能绑大多数外币卡充值；有些商家只收中国网络卡。本文带你走每一条实操路径——银行电汇、第三方服务、支付宝/微信支付变通——以及每条的限制，再加三个默默蚕食预算的日常陷阱。',
    stats: [
      { value: '约 3 条', label: '跨境汇款渠道' },
      { value: '汇率差', label: '每笔的隐形成本' },
      { value: '绑卡', label: '支付宝/微信支付难题' },
      { value: '¥0-200', label: '单笔典型手续费' },
    ],
    quickAnswer:
      '国际学生向中国汇款有三条实操路径：境外银行电汇（¥20-80/笔 + 收款行汇率差）、第三方服务如 Wise 或 Revolut（汇率差较低、¥10-30/笔、大额较慢）、通过持牌代理的现金交付（学生少见；偶为紧急唯一选项）。反向——把钱汇回家——通常更贵（¥80-200/笔 + 汇率差），且需要银行同意与税务居住证明。日常支付方面，支付宝、微信支付设置才是更难的问题：两个 App 都对绑外币卡充值有限（支付宝 Tour Pass 适用于小金额短期停留；可持久用的是绑中国借记卡）。规划顺序：先开银行账户、再绑借记卡、再做钱包的学生认证。',
    keyTakeaways: [
      '三条跨境通道：银行电汇、第三方服务（Wise/Revolut）、现金代理；每条都有自己的费用结构与到账时间',
      '每笔的汇率差通常大于名目手续费——比的是总成本，不只是电汇费',
      '支付宝 Tour Pass 与微信支付外卡支持是有限变通，不是持久方案；长期要看绑中国借记卡',
      '汇出（汇回家）通常比汇入贵，且可能要求税务居住证明',
      '三个日常陷阱：绑卡失败、中国网络独享商家、无卡附加费——每个都有解法',
      '操作顺序：先开银行账户、再绑借记卡到支付宝/微信支付、最后做学生认证',
    ],
    sections: [
      {
        id: 'channels',
        h2: '三条跨境通道——何时用哪条',
        intro:
          '每条通道有自己的成本、速度、限额。按情境选通道。',
        blocks: [
          {
            type: 'table',
            caption: '跨境汇款通道对比',
            columns: ['通道', '典型费用', '到账时间', '适合'],
            rows: [
              ['银行电汇（SWIFT）', '¥20-80/笔 + 0.3%-1% 汇率差', '1-3 个工作日', '大额、奖学金补贴、学费'],
              ['第三方服务（Wise、Revolut、Remitly 等）', '0.4%-1% 总费用（中间价 + 小额费）', '数小时至 1 个工作日', '常规家庭支持、中小金额、汇率更好'],
              ['持牌代理现金交付（如西联）', '3%-7% + 固定费', '分钟到小时', '仅限紧急——费率很高；查你所在司法区的牌照'],
            ],
          },
          {
            type: 'ul',
            items: [
              '学费与补贴走银行电汇——大额时单笔费不重要，汇率差才是；问收款行的牌价，对比中间价',
              '常规家庭支持走第三方服务——Wise/Revolut 类提供中间价、费率透明；月度小汇很合适',
              '现金代理仅紧急——费率是别处的 5-10 倍；只在速度压过成本时用',
              '务必附参考号——没有清晰学生 ID 参考的电汇可能被合规审查拖住；1-3 天变 5-10 天',
              '避开人民币信用卡收外币——多数中国借记卡是人民币单币；可能拒收美元电汇或用不利汇率',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '总成本对比法则：选通道时比的是「全包汇率」（汇率差 + 费）换算到本币的金额，不只是名目手续费。「零手续费」但有 1.5% 汇率差的 ¥3,000 转账，比「¥50 手续费 + 中间价」的更贵。',
          },
        ],
      },
      {
        id: 'alipay-wechat-setup',
        h2: '国际学生的支付宝/微信支付设置',
        intro:
          '钱包设置才是更难的问题。外币卡绑定能力有限——中国借记卡才是持久方案。',
        blocks: [
          {
            type: 'table',
            caption: '外籍人士的支付 App 选项',
            columns: ['选项', '做什么', '限制'],
            rows: [
              ['支付宝 — Tour Pass', '从 Visa/Mastercard 充值的预付钱包；适合小额支付', '单笔上限（约 $300）；90 天有效期；不是所有商家接受'],
              ['微信支付 — 绑外卡', '绑 Visa/Mastercard；很多商家可用', '单笔上限；部分商家类别排除；线上服务比线下 POS 限制更多'],
              ['支付宝/微信支付 — 绑中国借记卡', '全功能、全额度、全商家', '要中国银行账户+中国手机号；持久方案'],
            ],
          },
          {
            type: 'ul',
            items: [
              '支付宝 Tour Pass 是过渡不是终局——前 90 天可用，单笔与商家接受度都受限；用它做桥梁，等中国借记卡到位',
              '微信支付外卡支持存在但不一致——部分商家接受、部分不接受；线上服务比线下 POS 限制更多',
              '持久方案是：中国银行账户 → 中国借记卡 → 绑支付宝与微信支付 → 完成学生认证',
              '认证等级很关键——支付宝/微信支付对用户分等级；完整认证（中国身份证+银行卡）解除大多数限额',
              '别想着绕过认证——假身份证或借手机号会在平台审查时永久封号',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '外卡绑失败的典型是静默：首次支付成功、第二笔被拒并报不明错误。解法永远是绑中国借记卡；外卡不构成日常支付的持久方案。',
          },
        ],
      },
      {
        id: 'fees',
        h2: '汇入的全费用图景',
        intro:
          '电汇费只是成本最小的那一块；汇率差与中转行才是大头。',
        blocks: [
          {
            type: 'ul',
            items: [
              'SWIFT 电汇——收款端通常 ¥20-80/笔；很多中国银行会照收；查你大学推荐的学费支付方式',
              '中转/代理行费——SWIFT 电汇通常经过 1-2 家中转行，每家可能收 ¥10-30；汇出与汇入两端都可能承担中转费',
              '汇率差——银行以略差于中间价的汇率买入；人民币典型 0.3%-1%；$5,000 的美元-人民币电汇，差值在 $15-50',
              '第三方服务对比——Wise 类服务报中间价 + 小额透明费（常 0.4%-1% 总成本），发钱前就告诉你最终费率',
              '大学的补贴电汇——通常收款端免费；查奖学金协议的收款行电汇指令',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '月汇 $1,000-3,000 的家庭支持，第三方服务通常比银行电汇省 ¥100-300/月——够一份餐食或一本专业书。学费（¥50,000+）与 CSC 补贴，银行电汇通常是大学唯一支持的路径，中转费相对本金可忽略。',
          },
        ],
      },
      {
        id: 'outgoing',
        h2: '把钱汇回家——更难的路',
        intro:
          '汇出面对更严格的规则、更高的费用、更复杂的税务问题。提前规划。',
        blocks: [
          {
            type: 'ul',
            items: [
              '汇出 SWIFT 电汇——通常 ¥80-200/笔 + 汇率差；银行会问用途（生活费、与学业相关、家庭支持）',
              '年度额度——中国对个人年度外汇流出有上限；按政策周期变化；大额汇出前先问银行',
              '税务居住证明——达到一定金额，银行可能要求你提供中国与/或母国的税务居住证明；提前备好',
              '人民币兑外币的时点——银行按当日牌价结汇；大额可申请「远期合约」锁定汇率，通常加一笔小额费',
              '结余汇出规则——年度内未用完的补贴通常可年末汇出，需文档；到银行网点问清楚',
              '小额走支付宝/微信支付——两者都允许通过绑定的中国借记卡向已知收款人做小额汇出；<¥5,000 适用',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '永远不要通过非正式渠道（如加密币换现金、钱骡子）汇钱。中国法律把未申报的资本流出视为严重违规；国际学生可能因此丧失签证。官方渠道慢但合法。',
          },
        ],
      },
      {
        id: 'day-to-day-traps',
        h2: '三个日常陷阱——与解法',
        intro:
          '大部分成本不是汇款本身，而是你忘记的小额日常摩擦费。',
        blocks: [
          {
            type: 'ol',
            items: [
              '外卡绑失败——你的 Visa/Mastercard 起初能绑支付宝/微信支付，第二/三笔被拒。解法：绑中国借记卡；外卡只作紧急',
              '中国网络独享商家——些商家（尤其老式校园 POS、小餐馆、部分自动售货机）只收中国银联卡。解法：多网络借记卡（多数中国借记卡含银联与 Visa/Mastercard 跨境）+ 支付宝/微信支付作后备',
              '无卡附加费——线上服务（机票、流媒体订阅、外语软件）用中国借记卡付款，可能加 2%-3% 外汇附加费。解法：外语服务用母国卡；中文商家用中国卡',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '三个陷阱加起来对一个普通学生每月通常不超过 ¥200-500，但它们是经常性且隐性。结构性解法：一张中国借记卡覆盖中文商家、一张外卡覆盖外语服务、一张绑好的中国借记卡作支付宝/微信支付的默认。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '从境外汇款到中国要多少钱？',
        a: 'SWIFT 通常 ¥20-80/笔 + 收款行 0.3%-1% 汇率差；第三方服务如 Wise/Revolut 通常 0.4%-1% 总费用。具体看金额、币种与中转行。',
      },
      {
        q: '国际学生能用外卡绑支付宝/微信支付吗？',
        a: '有限——支付宝 Tour Pass 90 天有效、单笔有上限；微信支付外卡支持不稳定。持久方案是中国借记卡绑两个钱包。',
      },
      {
        q: '支付宝 Tour Pass 是什么？够用吗？',
        a: 'Tour Pass 是从 Visa/Mastercard 充值的预付钱包，给短期游客用。单笔上限约 $300，90 天有效期，多数商家不接受。它对最初几周有用，但不是多年学位的持久方案。',
      },
      {
        q: 'Wise 或 Revolut 在中国能用吗？',
        a: 'Wise、Revolut 类服务通常用来从境外汇钱入华，不是国内支付。它们提供中间价 + 透明小费，是常规家庭汇款的便宜选择。',
      },
      {
        q: '跨境电汇到中国要多久？',
        a: 'SWIFT 通常 1-3 个工作日，视中转行与收款行合规审查而定。参考号清晰（护照姓名 + 学号）的到账更快；缺参考号或不匹配的会被多扣几天。',
      },
      {
        q: '怎么从中国把钱汇回家？',
        a: '通过你中国银行的汇出电汇——通常 ¥80-200/笔 + 汇率差，需银行确认。中国有个人年度外汇流出上限；大额前先问银行。达到一定金额可能要求税务居住证明。',
      },
      {
        q: '为什么外卡绑支付宝/微信支付会失败？',
        a: '外卡绑卡能力有限，初期能绑、之后会拒。持久方案是中国借记卡（中国银联）绑钱包。',
      },
      {
        q: '用加密币或非正式渠道汇钱入华/出华合法吗？',
        a: '不合法——中国法律把未申报的资本流动视为严重违规；国际学生用这些渠道有签证吊销与法律后果风险。只用官方银行与持牌第三方渠道。',
      },
      {
        q: '毕业时把剩余补贴汇回家，最便宜的方式？',
        a: '结余通常允许年末汇出，需文档；先到银行网点问清。大额（¥30,000+）走银行电汇通常最便宜；小额第三方服务更划算。',
      },
      {
        q: '学费能直接从外卡账户付吗？',
        a: '通常不行——大学要求人民币付到中国银行账户。规划：先汇到你的中国账户，再从那付学费。大学国际办有收款行电汇指令与参考号要求。',
      },
    ],
    howToSteps: [
      {
        name: '到后按顺序规划',
        text: '中国 SIM → 银行账户 → 借记卡 → 绑支付宝/微信支付 → 学生认证。跳过绑卡会让你依赖会静默失败的外卡。',
      },
      {
        name: '需要前就设好汇入通道',
        text: '若规划家庭支持，在家时就把第三方服务（Wise/Revolut）设好或把银行电汇指令发给家人。参考号 = 护照姓名 + 学号。',
      },
      {
        name: '把 Tour Pass 当过渡不当终局',
        text: '前 90 天用支付宝 Tour Pass，中国借记卡到位后立即切到绑卡。不要靠 Tour Pass 付房租。',
      },
      {
        name: '按金额匹配通道',
        text: '<$1,000：第三方服务。>$3,000：银行电汇。学费与补贴：银行电汇（大学通常唯一支持路径）。紧急：持牌现金代理（费率除外）。',
      },
      {
        name: '提前规划汇出',
        text: '到银行网点问年度上限、税务居住证明、未用补贴结余规则。大额汇出需要 1-2 周的文档准备。',
      },
      {
        name: '建三卡日常配置',
        text: '中国借记卡覆盖中文商家与钱包绑卡；母国卡覆盖外语线上服务；绑卡后中国借记卡作支付宝/微信支付默认。别把外卡当主力。',
      },
    ],
    ctaTitle: '需要有人帮你排到达后的资金流？',
    ctaSubtitle:
      'SICA 顾问评审你的具体费用图景——学费支付路径、家庭支持通道、补贴汇出、钱包设置——并帮你避开三个日常陷阱。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/open-chinese-bank-account',
        label: '开中国银行账户',
        description: '钱包设置前置的银行账户深度指南。',
      },
      {
        href: '/guides/banking',
        label: '中国银行——总览',
        description: '覆盖卡片、转账与手机银行的原版流程指南。',
      },
      {
        href: '/guides/cost-of-living',
        label: '中国生活费',
        description: '月度预算与房租、饮食、交通的分布。',
      },
    ],
  },
};
