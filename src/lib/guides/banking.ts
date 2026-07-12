import type { LocalizedGuide } from './types';

/**
 * "Banking, Alipay & WeChat Pay setup for international students in China"
 * — process guide. Target queries: "china bank account for international
 * student", "open bank account china foreign passport", "alipay international
 * student china", "wechat pay international student", "china mobile payment
 * foreign", "send money china overseas", "china bank account documents".
 *
 * Every international student needs (1) a Chinese bank account or
 * international-friendly mobile payment app to receive scholarships, pay rent,
 * and avoid carrying cash; (2) Alipay and/or WeChat Pay linked to a payment
 * method for daily purchases (food, transport, shopping — China is 80%+ cashless
 * at the point of sale); and (3) a way to move money between home country and
 * China. This guide walks through the 3 account types, the documents needed,
 * common blockers, and the workarounds for the 30% of students who cannot open
 * a Chinese bank account (US/Canada sanctions, rural campus, KYC delays).
 */
export const bankingGuide: LocalizedGuide = {
  en: {
    slug: 'banking',
    eyebrow: 'GUIDE · BANKING & PAYMENTS',
    title: 'Banking, Alipay & WeChat Pay Setup for International Students in China (2026)',
    description:
      "Set up a Chinese bank account, link Alipay + WeChat Pay, and move money in/out of China. Documents, branches, fees, monthly limits, and the workarounds for students who can't open a Chinese account.",
    subtitle:
      "Three things every international student needs: a way to receive scholarship money, a way to pay for food/transport/rent without carrying cash, and a way to move money between home and China. Here's how to set all three up — including the workarounds for the 30% of students who hit KYC blocks.",
    stats: [
      { value: '~30 min', label: 'Typical bank account opening' },
      { value: '¥20', label: 'Annual card fee (most banks)' },
      { value: '¥10K/day', label: 'Default Alipay outgoing limit' },
      { value: '80%+', label: 'Of China payments are mobile' },
    ],
    quickAnswer:
      "You need three things: a Chinese bank account (or an international-friendly workaround), Alipay linked to a payment method, and WeChat Pay linked to a payment method. The standard path: bring your passport + university admission letter + residence permit to a branch of ICBC, Bank of China, China Construction Bank, or Agricultural Bank of China; the account opens same day. The card costs ¥10-20/year and gives you a UnionPay debit card. To use Alipay/WeChat Pay at food stalls and small shops, link your bank card through the app — Alipay and WeChat Pay are accepted almost everywhere. If your home bank is sanctioned (US/Canada/EU restrictions for some banks) or you can't reach a branch, use the workarounds: Wise/Revolut multi-currency card + Alipay Tour Card, or a Hong Kong bank account.",
    keyTakeaways: [
      "Bring passport + admission letter + residence permit to a Big Four bank (ICBC, BoC, CCB, ABC) on campus or downtown",
      "Account opens same day; debit card (UnionPay) is mailed in 7-10 working days or issued instantly at the branch",
      "Link your Chinese bank card to Alipay + WeChat Pay for mobile payments (80%+ of China transactions)",
      "Default Alipay limit: ¥3,000/single transaction, ¥10,000/day, ¥50,000/year for unverified accounts",
      "Complete Alipay identity verification (real-name + passport + facial scan) to raise the limit to ¥50,000/year",
      "For money in/out: Wise, Revolut, or Western Union for small transfers; SWIFT for large scholarships",
      "If you can't open a Chinese account (sanctions, KYC, rural campus): use Wise/Revolut + Alipay Tour Card or a HK bank account",
      "Never rely on cash alone — most vendors and all taxis/Didi reject cash or give no change",
    ],
    sections: [
      {
        id: 'why-three-accounts',
        h2: 'Why you need three things, not one',
        intro:
          "China runs on mobile payments. Cash is increasingly useless for daily life, but the mobile payment apps (Alipay, WeChat Pay) require a Chinese bank card or a foreign card from a supported country. Most international students end up with: (1) a Chinese bank account to receive scholarships, (2) Alipay linked to a Chinese card for daily purchases, and (3) WeChat Pay linked to the same card for social payments.",
        blocks: [
          {
            type: 'h3',
            text: 'The daily-life reality',
            body:
              "80%+ of in-person transactions in China are mobile payments. Street food, taxis (Didi), convenience stores, supermarkets, university canteens, hospital registration desks, museum tickets, train tickets — all default to Alipay/WeChat Pay QR codes. Even if a vendor accepts cash, you'll get no change from a ¥100 bill on a ¥6 meal. And Didi (the rideshare app) requires mobile payment — no cash, no card swipe.",
          },
          {
            type: 'h3',
            text: 'The scholarship reality',
            body:
              "Universities and the Chinese Government Scholarship (CSC) pay in RMB via transfer to a Chinese bank account. If you don't have one, your scholarship arrives late, in cash, or in a check you can't cash. Open the account in your first week — it's the single most consequential setup task.",
          },
          {
            type: 'callout',
            tone: 'info',
            text: "Open your Chinese bank account in the first week. Almost every other setup step (Tuition, dorm deposit, scholarship receipt, mobile payment linking) depends on it. A 1-week delay cascades.",
          },
        ],
      },
      {
        id: 'open-chinese-account',
        h2: 'Opening a Chinese bank account: the standard path',
        intro:
          "The Big Four (ICBC, Bank of China, China Construction Bank, Agricultural Bank of China) all open accounts for international students. The process takes 30-60 minutes at a branch; bring the right documents and you walk out with a passbook (存折) and a temporary card. The permanent UnionPay debit card is mailed in 7-10 working days.",
        blocks: [
          {
            type: 'table',
            caption: 'The Big Four banks for international students',
            columns: ['Bank', 'Chinese name', 'Branch density on campus', 'Notes'],
            rows: [
              ['ICBC', '中国工商银行 (工商银行)', 'Highest', 'Largest bank, English-speaking branches in Beijing/Shanghai/Guangzhou'],
              ['Bank of China', '中国银行', 'High', 'Best for international transfers (SWIFT specialist)'],
              ['China Construction Bank', '中国建设银行 (建行)', 'High', 'Good mobile app, popular with students'],
              ['Agricultural Bank of China', '中国农业银行 (农行)', 'Medium', 'Better rates in rural/satellite campus cities'],
            ],
          },
          {
            type: 'h3',
            text: 'Documents you need (all four required)',
            body:
              "(1) Passport (original + 1 photocopy of the photo page + 1 of the visa page). (2) Valid Chinese visa (X1 or X2) on the passport — some branches require the residence permit instead, which you get 30 days after arrival. (3) University admission letter (录取通知书) — the original, in your name. (4) Temporary residence registration form (住宿登记表 or 居住登记) — your university issues this at registration. Some branches also ask for a phone number (Chinese SIM required, see below) and a small cash deposit (¥10-100).",
          },
          {
            type: 'h3',
            text: 'The 8-step branch visit',
            body:
              "(1) Take a queue number at the entrance — look for 个人业务 (personal banking) or 外汇业务 (foreign exchange). (2) When called, hand the four documents to the banker. (3) Fill out a 1-page application form (Chinese — the banker will help). (4) Choose account type: 借记卡 (debit card) is what you want, not 信用卡 (credit card). (5) Set a 6-digit PIN. (6) Pay ¥10-20 annual card fee in cash. (7) Receive your passbook (存折) and a temporary card. (8) Wait 7-10 working days for the permanent UnionPay card in the mail, or pick it up at the branch.",
          },
          {
            type: 'callout',
            tone: 'success',
            text: "Most universities have a Big Four branch or ATM on campus, often in the international student services building. If you're at a major university (Peking, Tsinghua, Fudan, SJTU, Wuhan), the on-campus branch has English-speaking staff specifically for international students.",
          },
        ],
      },
      {
        id: 'kitchen-issues',
        h2: 'Common blockers and how to fix them',
        intro:
          "About 30% of international students hit a problem during account opening. Most are solvable with the right documents or a different branch; some require a workaround account.",
        blocks: [
          {
            type: 'h3',
            text: 'Blocker 1: No residence permit yet',
            body:
              "Banks technically require the residence permit (居留许可), but in practice most will accept the X1/X2 visa + university admission letter + temporary residence form for the first 30-90 days. If a branch refuses, try a different branch — on-campus branches are usually more flexible. As soon as you have the residence permit, go back and update your account info.",
          },
          {
            type: 'h3',
            text: 'Blocker 2: No Chinese phone number',
            body:
              "Almost every bank requires a Chinese mobile number for SMS verification. Get a SIM card first (China Mobile 中国移动, China Unicom 中国联通, or China Telecom 中国电信 — ¥50-100/month plans, sold at campus kiosks with your passport). The SIM takes 1-2 hours to activate; do it the day before the bank visit.",
          },
          {
            type: 'h3',
            text: 'Blocker 3: Sanctioned home country or bank',
            body:
              "US/Canadian/UK/EU students usually have no problem. But students from countries under comprehensive sanctions (Iran, North Korea, Syria, Cuba) or whose home bank is sanctioned (some Russian, Belarusian banks) will be refused a Chinese account. Workaround: use a third-country bank account + Alipay/WeChat Pay international version (see below).",
          },
          {
            type: 'h3',
            text: 'Blocker 4: KYC name mismatch',
            body:
              "If your passport name uses characters that don't transliterate cleanly into Chinese (e.g. Arabic, Thai, Korean), the bank may create an account in the transliterated Chinese name that doesn't match the passport. Always check the printed name on the passbook matches your passport before leaving the branch. Future scholarship transfers depend on this.",
          },
        ],
      },
      {
        id: 'alipay',
        h2: 'Alipay (支付宝): the universal payment app',
        intro:
          "Alipay is China's #1 mobile payment app and the most widely accepted. Every international student needs it. The setup takes 15 minutes once you have a Chinese phone number and a bank card.",
        blocks: [
          {
            type: 'h3',
            text: 'The 5-step setup',
            body:
              "(1) Download Alipay from the App Store (search 支付宝) — the international version auto-detects. (2) Sign up with your Chinese phone number (no +86 prefix needed if registered in China). (3) Real-name verification: scan your passport photo page + take a facial recognition scan. (4) Link a bank card: enter your Chinese debit card number + the bank's app verification code. (5) Set a 6-digit payment PIN. Done.",
          },
          {
            type: 'h3',
            text: 'Default limits and how to raise them',
            body:
              "Without identity verification: ¥1,000/transaction, ¥5,000/day, ¥50,000/year. With identity verification (passport + facial scan): ¥50,000/year. To raise further: complete the bank card binding + add a backup card. Some users report ¥200,000/year limits after 6 months of active use. The 余额 (account balance) feature lets you top up Alipay from your bank and spend from the balance without re-entering the PIN for small purchases.",
          },
          {
            type: 'h3',
            text: 'Alipay Tour Card (for those without a Chinese account)',
            body:
              "Alipay Tour Card is a prepaid Visa/Mastercard-branded digital card inside the Alipay app, available to non-Chinese passport holders. Top up with a foreign Visa/Mastercard, spend anywhere Alipay is accepted. Limits are lower (~$1,000/day default, raise with bank card binding) and there's a 3% foreign transaction fee. It's the right answer if you can't open a Chinese bank account.",
          },
          {
            type: 'callout',
            tone: 'info',
            text: "Alipay and WeChat Pay are mostly interchangeable for consumers, but some vendors accept only one. In tier-1 cities, 99% accept both. In smaller cities, WeChat Pay has slightly wider reach because everyone uses WeChat to chat. Link both.",
          },
        ],
      },
      {
        id: 'wechat-pay',
        h2: 'WeChat Pay (微信支付): the social payment app',
        intro:
          "WeChat Pay is built into the WeChat messaging app (used by 1.3 billion Chinese for daily communication). Setup is faster than Alipay if you already use WeChat to talk to friends. Acceptance is similar to Alipay; some vendors (especially small restaurants, taxi drivers, school events) prefer WeChat Pay.",
        blocks: [
          {
            type: 'h3',
            text: 'The 4-step setup',
            body:
              "(1) Open WeChat → Me → Services (服务) → Wallet (钱包). (2) Add a bank card: same Chinese debit card you linked to Alipay works fine. (3) Real-name verification: same passport + facial scan. (4) Set a 6-digit payment PIN. You're done. WeChat Pay also has a Tour Card equivalent called Weixin Pay International, with the same limits as Alipay Tour Card.",
          },
          {
            type: 'h3',
            text: 'When to use WeChat Pay over Alipay',
            body:
              "Sending money to friends (红包 hongbao, group splits), paying for group meals, paying at small vendors that display only WeChat Pay QR codes, paying for train tickets through 12306 (which integrates with WeChat Pay). For larger merchants (hotels, big supermarkets, e-commerce), Alipay and WeChat Pay are equivalent.",
          },
        ],
      },
      {
        id: 'transfer-money',
        h2: 'Moving money: in, out, and around',
        intro:
          "Three flows: (1) money in from home country (parents, savings), (2) money out of China (back home, or to a third country), (3) RMB-to-foreign-currency cash exchange. Each has a best tool, and the wrong tool can cost 3-5% in fees.",
        blocks: [
          {
            type: 'table',
            caption: 'Money transfer tools compared',
            columns: ['Tool', 'Best for', 'Fee', 'Speed'],
            rows: [
              ['Wise (formerly TransferWise)', 'Mid-size transfers ($500-5,000)', '0.4-1.5%', '1-2 working days'],
              ['Revolut', 'Small transfers + multi-currency hold', '0% on weekends, 0.5% weekday', 'Same day'],
              ['Western Union', 'Cash pickup, emergency', '5-10%', 'Minutes to 1 day'],
              ['SWIFT (via your home bank)', 'Large scholarships, tuition refund', '$25-50 flat', '3-7 working days'],
              ['Alipay/WeChat international top-up', 'Small daily spending money', '3% FX + $1-2 fee', 'Instant'],
            ],
          },
          {
            type: 'h3',
            text: 'The Wise path (recommended for most students)',
            body:
              "Open a Wise multi-currency account before you leave home. Get the Wise debit card (Mastercard) mailed to your home address. Once in China, top up Wise from your home bank in your home currency, convert to CNY inside Wise (rate is mid-market + 0.4-1.5% fee), then either spend directly with the Wise card or transfer the CNY to your Chinese bank account. Average cost: ~1% total. Most students use Wise for monthly allowance + emergency top-up.",
          },
          {
            type: 'h3',
            text: 'Cashing foreign currency',
            body:
              "For cash, the Big Four branches all offer 外汇兑换 (foreign exchange) with your passport. Daily limit: $500 equivalent without prior notice, $5,000 with 24-hour notice. Rates are 0.5-1% worse than mid-market. For larger amounts or better rates, use a currency exchange shop in your embassy district or a dedicated FX service like WorldRemit.",
          },
        ],
      },
      {
        id: 'daily-usage',
        h2: 'Daily usage: what the first month looks like',
        intro:
          "Week 1: open bank account, get SIM, link Alipay + WeChat Pay. Week 2: receive scholarship deposit, set up auto-pay for dorm. Week 3: pay for everything via QR codes, learn the in-app mini-programs (小程序) for food delivery, ride-hailing, ticket booking. Week 4: refine — set up Alipay 余额 for small daily purchases, get comfortable with split bills, and figure out the workarounds for vendors that don't take mobile payment (rare but exists).",
        blocks: [
          {
            type: 'h3',
            text: 'The in-app mini-programs you will use daily',
            body:
              "Meituan 美团 (food delivery, restaurant booking, movie tickets, group deals), Ele.me 饿了么 (second food delivery option), Didi 滴滴 (ride-hailing — must have Alipay/WeChat Pay linked), Taobao 淘宝 (e-commerce — Alipay checkout), 12306 (train tickets, Alipay/WeChat Pay), Ctrip 携程 (flights, hotels), Dianping 大众点评 (restaurant reviews, similar to Yelp). All run inside Alipay or WeChat — no separate app download needed.",
          },
          {
            type: 'h3',
            text: 'Common pain points and workarounds',
            body:
              "Some vendors display only one QR code (e.g. WeChat only). If you don't have that app set up, you can't pay. Workaround: have at least ¥50 cash as backup. Old-style street markets and very small vendors sometimes still take cash only. University campus vending machines usually accept both. Didi requires mobile payment — no exceptions. Most universities now require payment of dorm/meal plan via Alipay/WeChat, with no cash option.",
          },
          {
            type: 'callout',
            tone: 'warning',
            text: "Don't lose your Chinese bank card. Replacing it requires a visit to the branch, ID verification, and 7-10 days for a new card to arrive. Most students have a backup foreign card (Visa/Mastercard) and a stash of ¥200-500 cash for emergencies.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I open a Chinese bank account as an international student?',
        a: "Yes, in most cases. Bring your passport, university admission letter, valid visa, and temporary residence registration form to a branch of ICBC, Bank of China, CCB, or ABC. The account opens same day. Some banks require the residence permit (issued 30 days after arrival); on-campus branches are usually flexible with the X1/X2 visa + admission letter for the first 30-90 days.",
      },
      {
        q: 'What documents do I need to open a Chinese bank account?',
        a: "Four required: (1) Passport original + 1 photocopy of the photo page + 1 of the visa page. (2) Valid Chinese visa (X1 or X2) on the passport. (3) University admission letter (录取通知书), original. (4) Temporary residence registration form (住宿登记表) from your university. Most branches also ask for a Chinese phone number and a small cash deposit (¥10-100).",
      },
      {
        q: 'How do I set up Alipay as an international student?',
        a: "Download Alipay from the App Store, sign up with your Chinese phone number, complete real-name verification (passport scan + facial recognition), link a Chinese bank card (debit or credit), and set a 6-digit payment PIN. The whole process takes 15 minutes. Without real-name verification, your limit is ¥5,000/day. With verification, ¥50,000/year.",
      },
      {
        q: 'Can I use Alipay without a Chinese bank account?',
        a: "Yes — Alipay Tour Card is a prepaid Visa/Mastercard digital card inside the Alipay app, available to non-Chinese passport holders. Top up with a foreign Visa/Mastercard, spend anywhere Alipay is accepted. Limits are lower (~$1,000/day default), and there's a 3% foreign transaction fee. Good for emergency spending if you can't open a Chinese account.",
      },
      {
        q: 'How do I send money from my home country to China?',
        a: "Three best options: (1) Wise (formerly TransferWise) — 0.4-1.5% fee, 1-2 day delivery, mid-market rate. (2) Revolut — 0% on weekends, 0.5% weekday. (3) SWIFT via your home bank — $25-50 flat fee, 3-7 days, good for large scholarships. Avoid Western Union for regular transfers — fees are 5-10%.",
      },
      {
        q: 'What is the difference between Alipay and WeChat Pay?',
        a: "Functionally similar for most purchases (food, transport, shopping), but different ecosystems. Alipay is a payment-first app, WeChat Pay is built into the WeChat messaging app. Alipay has a stronger international transfer and small-business ecosystem. WeChat Pay is more social (红包 hongbao, group splits, mini-programs) and slightly more accepted in smaller cities. Link both — most students use both daily.",
      },
      {
        q: 'Do I need cash in China?',
        a: "Less than 5% of daily transactions are cash, but keep ¥200-500 as backup. Some old-style street markets and very small vendors take cash only. Universities increasingly require mobile payment for dorm/meal plans. Didi (ride-hailing) requires mobile payment — no exceptions. The 1-2 week window before you set up mobile payment is the highest-risk period for needing cash.",
      },
      {
        q: 'How much does it cost to open a Chinese bank account?',
        a: "Annual card fee: ¥10-20 (some banks waive for students). Minimum opening deposit: ¥0-100 depending on the bank. No monthly maintenance fee on basic student accounts. ATM withdrawals at your own bank's ATMs: free. ATM withdrawals at other banks: ¥2-4 per transaction + 1% of amount. SWIFT outgoing transfers: ¥80-150 per transaction.",
      },
    ],
    howToSteps: [
      {
        name: 'Get a Chinese SIM card',
        text: "Visit a China Mobile, China Unicom, or China Telecom store with your passport. Pick a plan (¥50-100/month for 10-30 GB + 200 min). The SIM activates in 1-2 hours. Do this BEFORE the bank visit — banks require a Chinese phone number.",
      },
      {
        name: 'Visit a Big Four bank branch with 4 documents',
        text: "Bring passport + admission letter + visa + residence form. Take a queue number (个人业务). Hand documents to the banker, fill the form, choose 借记卡 (debit card), set a 6-digit PIN, pay ¥10-20 annual fee. Walk out with a passbook + temporary card.",
      },
      {
        name: 'Wait for the permanent UnionPay card',
        text: "Mailed in 7-10 working days to your registered address, or pick up at the branch. The card works at all ATMs in China and internationally (UnionPay network). Activate by setting a separate ATM PIN at any Big Four ATM.",
      },
      {
        name: 'Download Alipay and WeChat',
        text: "Both from the App Store. Sign up with your Chinese phone number. Complete real-name verification (passport scan + facial recognition). Link the new bank card. Set a 6-digit payment PIN. Total time: 30 minutes for both apps.",
      },
      {
        name: 'Top up your balance',
        text: "Inside Alipay: Me → 余额 → Top up. Transfer ¥500-1,000 from your bank card. This unlocks faster small-amount payments (no PIN needed for purchases under ¥200 with 免密支付).",
      },
      {
        name: 'Set up money in from home',
        text: "Open a Wise or Revolut account before you leave home. Get the debit card mailed to your home address. Top up from your home bank, convert to CNY inside Wise/Revolut, spend directly or transfer to your Chinese account. Average cost: ~1%.",
      },
      {
        name: 'Test with a small purchase',
        text: "Buy a ¥3 bottle of water at a convenience store. Confirm the Alipay/WeChat Pay flow works end-to-end. Then test a ¥50 restaurant bill (where the vendor scans YOUR QR code, not you scanning theirs). Practice makes perfect.",
      },
      {
        name: 'Set up auto-pay for recurring expenses',
        text: "Dorm rent, meal plan, phone bill, utilities — set up auto-deduction from your bank card through Alipay's 生活缴费 (utility payment) mini-program. Saves manual payment every month and avoids late fees.",
      },
    ],
    ctaTitle: 'Need help opening your first Chinese bank account?',
    ctaSubtitle:
      'SICA can pre-confirm which Big Four branch your university prefers, walk you through the document checklist, and help you wire your scholarship money without losing 3-5% in transfer fees.',
    ctaApplyLabel: 'Start with free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/cost-of-living',
        label: 'Cost of living',
        description: 'Real monthly budgets for housing, food, transport, phone, healthcare, and entertainment.',
      },
      {
        href: '/guides/visa',
        label: 'Student visa (X1 / X2)',
        description: 'Document checklist, fees, processing times, residence permit, work rights, and renewals.',
      },
      {
        href: '/guides/application',
        label: 'How to apply',
        description: 'The full application timeline, document checklist, and scholarship paths.',
      },
    ],
  },

  zh: {
    slug: 'banking',
    eyebrow: '指南 · 银行与支付',
    title: '中国留学生银行、支付宝、微信支付开户指南（2026）',
    description:
      '开中国银行账户、绑定支付宝+微信支付、跨境汇款。材料、网点、费用、限额，以及无法开中国账户学生的替代方案。',
    subtitle:
      '每位国际学生需要三件事：收款方式、不带现金也能付款的方式、跨境汇款方式。本文教你三件事如何一站式搞定——包括30%学生遇到KYC问题的解决方案。',
    stats: [
      { value: '~30分钟', label: '银行开户时长' },
      { value: '¥20', label: '年费（多数银行）' },
      { value: '¥1万/日', label: '支付宝默认付款限额' },
      { value: '80%+', label: '中国支付为移动端' },
    ],
    quickAnswer:
      '你需要三件套：中国银行账户（或国际版替代）、绑定银行卡的支付宝、绑定银行卡的微信支付。标准路径：带护照、录取通知书、居留许可，去工行、中行、建行、农行的任一网点，当天开户。卡片年费¥10-20，给的是银联借记卡。然后在支付宝/微信支付里绑定这张卡——几乎所有商家都接受。如果你所在国家的银行受制裁（美加对部分银行）、或无法到网点，用替代方案：Wise/Revolut多币种卡 + 支付宝Tour Card，或香港银行账户。',
    keyTakeaways: [
      '带护照+录取通知书+居留许可去工/中/建/农四大行（校内或市中心）',
      '当天开户；银联借记卡7-10个工作日寄到',
      '把中国银行卡绑定支付宝+微信支付，80%+交易都能扫码付',
      '支付宝默认限额：单笔¥3,000，日¥1万，年¥5万（未实名）',
      '完成实名认证（身份证+护照+人脸）可提升至年¥5万',
      '跨境汇款：Wise、Revolut、Western Union小额；SWIFT大额奖学金',
      '无法开中国账户（制裁、KYC、偏远校区）：用Wise/Revolut + 支付宝Tour Card或香港账户',
      '不要只靠现金——多数商家和所有出租车/滴滴拒收现金或不找零',
    ],
    sections: [
      {
        id: 'why-three-accounts',
        h2: '为什么需要三件套',
        intro:
          '中国是移动支付的天下。现金在日常生活中越来越没用，但移动支付App（支付宝、微信支付）需要中国银行卡或来自支持国家的外卡。多数国际学生最终会有：(1) 中国银行账户收奖学金，(2) 绑定中国卡的支付宝日常消费，(3) 绑定同一张卡的微信支付用于社交转账。',
        blocks: [
          {
            type: 'h3',
            text: '日常现实',
            body:
              '中国80%+的面对面交易是移动支付。街边小吃、出租车（滴滴）、便利店、超市、大学食堂、医院挂号、博物馆门票、火车票——默认都是支付宝/微信扫码。即使商家收现金，¥6的饭你给¥100也不找零。滴滴（打车App）必须移动支付——不收现金、不刷卡。',
          },
          {
            type: 'h3',
            text: '奖学金现实',
            body:
              '大学和中国政府奖学金（CSC）以人民币转账到中国银行账户。没有账户，奖学金会延迟发放、给现金、或者给无法兑现的支票。第一周就去开户——这是最重要的设置任务。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '第一周就开好中国银行账户。几乎其他所有设置（学费、住宿押金、奖学金收款、移动支付绑定）都依赖它。延迟1周会连锁影响。',
          },
        ],
      },
      {
        id: 'open-chinese-account',
        h2: '开中国银行账户：标准路径',
        intro:
          '工行、中行、建行、农行四大行都向国际学生开户。整个过程在网点30-60分钟；带齐材料，当场拿到存折和临时卡。永久银联借记卡7-10个工作日寄到。',
        blocks: [
          {
            type: 'table',
            caption: '四大行对比',
            columns: ['银行', '中文名', '校园网点密度', '备注'],
            rows: [
              ['工商银行', '中国工商银行 (工行)', '最高', '最大行，北上广有英语网点'],
              ['中国银行', '中国银行', '高', '国际汇款最强（SWIFT专家）'],
              ['建设银行', '中国建设银行 (建行)', '高', '手机App好用，学生常用'],
              ['农业银行', '中国农业银行 (农行)', '中', '二三线城市/偏远校区费率更好'],
            ],
          },
          {
            type: 'h3',
            text: '需要带的材料（4项必备）',
            body:
              '（1）护照原件+1张照片页复印件+1张签证页复印件。（2）有效中国签证（X1或X2）——部分网点要求居留许可（入境30天后办）。（3）大学录取通知书原件（写你名字的）。（4）临时住宿登记表/居住登记——学校注册时发。部分网点还要中国手机号和少量现金（¥10-100）。',
          },
          {
            type: 'h3',
            text: '到网点8步流程',
            body:
              '（1）进门取号——找"个人业务"或"外汇业务"窗口。（2）叫号后把4份材料交给柜员。（3）填1页申请表（中文，柜员会帮忙）。（4）选账户类型：选"借记卡"（debit card），不是"信用卡"（credit card）。（5）设置6位密码。（6）现金付¥10-20年费。（7）拿到存折和临时卡。（8）等7-10个工作日收永久银联卡，或到网点自取。',
          },
          {
            type: 'callout',
            tone: 'success',
            text: '多数大学校内或国际学生服务楼都有四大行网点或ATM。如果你上的是重点大学（北大、清华、复旦、上交、武大），校内网点有专门服务国际学生的英语柜员。',
          },
        ],
      },
      {
        id: 'kitchen-issues',
        h2: '常见问题与解决方案',
        intro:
          '约30%国际学生在开户时会遇到问题。多数带对材料或换网点就能解决；少数需要用替代账户。',
        blocks: [
          {
            type: 'h3',
            text: '问题1：还没有居留许可',
            body:
              '银行理论上要求居留许可（居留许可），但实际操作中前30-90天，多数网点接受X1/X2签证+录取通知书+临时住宿登记表。如果被拒，换一个网点试试——校内网点通常更灵活。拿到居留许可后，再回去更新账户信息。',
          },
          {
            type: 'h3',
            text: '问题2：没有中国手机号',
            body:
              '几乎所有银行都要中国手机号接收短信验证码。先办SIM卡（中国移动、中国联通、中国电信，¥50-100/月套餐，校内营业厅凭护照办理）。SIM卡1-2小时激活；去银行前一天办好。',
          },
          {
            type: 'h3',
            text: '问题3：来自受制裁国家',
            body:
              '美/加/英/欧学生通常没问题。但来自全面制裁国家（伊朗、朝鲜、叙利亚、古巴）或本国银行受制裁（部分俄罗斯、白俄罗斯银行）的学生会被拒开中国账户。替代方案：用第三国银行账户 + 支付宝/微信支付国际版（见下文）。',
          },
          {
            type: 'h3',
            text: '问题4：KYC姓名不匹配',
            body:
              '如果你的护照名字用无法直接音译为中文的字符（如阿拉伯文、泰文、韩文），银行可能用音译中文名开户，与护照不一致。离开网点前务必核对存折上打印的名字与护照一致。后续奖学金转账依赖这一点。',
          },
        ],
      },
      {
        id: 'alipay',
        h2: '支付宝：通用支付App',
        intro:
          '支付宝是中国第一大移动支付App，接受最广。每位国际学生都需要。拿到中国手机号和银行卡后，15分钟设置完成。',
        blocks: [
          {
            type: 'h3',
            text: '5步设置',
            body:
              '（1）App Store下载支付宝（搜"支付宝"）——国际版自动识别。（2）用中国手机号注册（中国注册的号不用+86前缀）。（3）实名认证：扫护照照片页+人脸识别。（4）绑银行卡：输入中国借记卡号+银行App验证码。（5）设6位支付密码。完成。',
          },
          {
            type: 'h3',
            text: '默认限额和提升方法',
            body:
              '未实名：单笔¥1,000，日¥5,000，年¥5万。完成实名（护照+人脸）：年¥5万。进一步提升：完成绑卡+加备用卡。活跃使用6个月后，部分用户能到年¥20万。余额功能可以先从银行卡充值到支付宝余额，余额支付小额免密。',
          },
          {
            type: 'h3',
            text: '支付宝Tour Card（无中国账户版）',
            body:
              '支付宝Tour Card是App内的预付Visa/Mastercard数字卡，非中国护照持有人可用。用外卡充值，任意支持支付宝的商家消费。限额较低（日$1,000默认，绑卡可提升），3%外汇手续费。适合无法开中国银行账户的学生。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '支付宝和微信支付对消费者几乎通用，但部分商家只接受一个。一线城市99%两个都收。二三线城市微信支付略广（因为大家都用微信聊天）。两个都绑。',
          },
        ],
      },
      {
        id: 'wechat-pay',
        h2: '微信支付：社交支付App',
        intro:
          '微信支付内置于微信（13亿中国人日常通讯App）。如果你已经用微信和朋友聊天，设置比支付宝更快。接受度与支付宝类似；部分商家（尤其小餐馆、出租车司机、校园活动）偏好微信支付。',
        blocks: [
          {
            type: 'h3',
            text: '4步设置',
            body:
              '（1）打开微信→我→服务→钱包。（2）添加银行卡：之前绑支付宝的同一张中国借记卡就行。（3）实名认证：同样护照+人脸。（4）设6位支付密码。完成。微信支付也有国际版叫Weixin Pay International，限额同支付宝Tour Card。',
          },
          {
            type: 'h3',
            text: '什么时候用微信支付',
            body:
              '给朋友发红包、分摊账单、付小餐馆（只贴微信收款码的）、通过12306买火车票（接入微信支付）。大商家（酒店、大超市、电商）支付宝和微信支付通用。',
          },
        ],
      },
      {
        id: 'transfer-money',
        h2: '汇款：进、出、内部',
        intro:
          '三件事：（1）从家里汇钱进来（父母、生活费），（2）汇出去（回家或第三国），（3）人民币兑外币现金。每种有最佳工具，用错工具3-5%手续费就没了。',
        blocks: [
          {
            type: 'table',
            caption: '汇款工具对比',
            columns: ['工具', '适合', '费用', '速度'],
            rows: [
              ['Wise (原TransferWise)', '中额汇款 ($500-5,000)', '0.4-1.5%', '1-2个工作日'],
              ['Revolut', '小额+多币种持有', '周末0%，工作日0.5%', '当日'],
              ['Western Union', '现金领取、紧急', '5-10%', '分钟到1天'],
              ['SWIFT (本国银行)', '大额奖学金、学费退费', '$25-50 固定', '3-7个工作日'],
              ['支付宝/微信国际充值', '日常小额消费', '3%外汇 + $1-2 手续费', '即时'],
            ],
          },
          {
            type: 'h3',
            text: 'Wise路径（多数学生推荐）',
            body:
              '出国前开Wise多币种账户。Wise借记卡（Mastercard）寄到家庭地址。到了中国后，从本国银行充值到Wise，在Wise内换成人民币（中间价+0.4-1.5%手续费），然后直接用Wise卡消费，或转到中国银行账户。总成本约1%。多数学生用Wise做月度生活费+应急充值。',
          },
          {
            type: 'h3',
            text: '外币现金兑换',
            body:
              '需要现金的话，四大行网点都提供"外汇兑换"，凭护照办理。日限：$500等值（无需预约），$5,000（24小时预约）。汇率比中间价差0.5-1%。大额或更优汇率，去使馆区货币兑换店或WorldRemit等专业外汇服务。',
          },
        ],
      },
      {
        id: 'daily-usage',
        h2: '日常使用：第一月长这样',
        intro:
          '第1周：开银行账户、办SIM、绑支付宝+微信支付。第2周：收到奖学金入账、设置自动扣住宿费。第3周：扫码搞定所有消费，学会App内小程序（小程序）订外卖、打车、买票。第4周：优化——设置支付宝余额做小额免密、熟悉分账、学会应对少数不收移动支付的商家。',
        blocks: [
          {
            type: 'h3',
            text: '每天都会用的小程序',
            body:
              '美团（外卖、订餐、电影票、团购）、饿了么（第二个外卖）、滴滴（打车——必须绑支付宝/微信支付）、淘宝（电商——支付宝付款）、12306（火车票，支付宝/微信支付）、携程（机票、酒店）、大众点评（餐厅评价，类似Yelp）。都跑在支付宝或微信内——无需单独下载App。',
          },
          {
            type: 'h3',
            text: '常见痛点和解决方案',
            body:
              '部分商家只贴一个二维码（如只微信）。如果没设那个App就付不了。解决方案：备¥50现金。老式街市和很小的商家有时只收现金。校园自动售货机两个都收。滴滴必须移动支付——无例外。多数大学现在要求住宿/餐费通过支付宝/微信付，不收现金。',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '别丢中国银行卡。补办要去网点、身份验证、等7-10天。多数学生有备份外卡（Visa/Mastercard）和¥200-500现金应急。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '国际学生能在中行开户吗？',
        a: '多数情况下可以。带护照、录取通知书、有效签证、临时住宿登记表，去工/中/建/农任一网点。当天开户。部分银行要求居留许可（入境30天办），但校内网点通常前30-90天接受X1/X2签证+录取通知书。',
      },
      {
        q: '开中国银行账户需要什么材料？',
        a: '4项必备：（1）护照原件+1张照片页复印件+1张签证页复印件。（2）有效中国签证（X1或X2）。（3）大学录取通知书原件。（4）学校发的临时住宿登记表。多数网点还要中国手机号和¥10-100现金。',
      },
      {
        q: '国际学生怎么开支付宝？',
        a: 'App Store下载支付宝，用中国手机号注册，完成实名认证（扫护照+人脸），绑中国银行卡（借记或信用卡），设6位支付密码。全程15分钟。未实名限额日¥5,000，实名后年¥5万。',
      },
      {
        q: '没有中国银行卡能用支付宝吗？',
        a: '可以。支付宝Tour Card是App内预付Visa/Mastercard数字卡，非中国护照可用。用外卡充值，任意支持支付宝的商家消费。限额较低（日$1,000默认），3%外汇手续费。适合无法开中国账户的应急消费。',
      },
      {
        q: '怎么从家里汇款到中国？',
        a: '三个最佳方案：（1）Wise（原TransferWise）——0.4-1.5%手续费，1-2天到账，中间价汇率。（2）Revolut——周末0%、工作日0.5%。（3）SWIFT经本国银行——$25-50固定费，3-7天，适合大额奖学金。日常避免Western Union，手续费5-10%。',
      },
      {
        q: '支付宝和微信支付有什么区别？',
        a: '对消费者功能类似（餐饮、交通、购物），但生态不同。支付宝是支付优先App，微信支付内置于微信。支付宝国际转账和小商户生态更强。微信支付更社交（红包、分账、小程序），二三线城市覆盖略广。两个都绑——多数学生每天两个都用。',
      },
      {
        q: '在中国需要现金吗？',
        a: '不到5%的日常交易是现金，但备¥200-500应急。部分老式街市和很小的商家只收现金。大学越来越要求移动支付付住宿/餐费。滴滴（打车）必须移动支付——无例外。设好移动支付前1-2周是用现金风险最高的时段。',
      },
      {
        q: '开中国银行账户要多少钱？',
        a: '年费：¥10-20（部分银行学生免费）。最低开户存款：¥0-100（视银行）。学生基础账户无月管理费。本行ATM取现：免费。跨行ATM：¥2-4/笔 + 1%金额。SWIFT汇出：¥80-150/笔。',
      },
    ],
    howToSteps: [
      { name: '办中国SIM卡', text: '带护照去中国移动、中国联通、中国电信营业厅。选套餐（¥50-100/月，10-30 GB + 200分钟）。SIM卡1-2小时激活。去银行前办好——银行要中国手机号。' },
      { name: '带4份材料去四大行网点', text: '护照+录取通知书+签证+住宿登记表。取号（个人业务）。把材料交给柜员，填表，选"借记卡"（debit card），设6位密码，付¥10-20年费。当场拿到存折+临时卡。' },
      { name: '等永久银联卡', text: '7-10个工作日寄到注册地址，或到网点自取。该卡在中国所有ATM和全球银联网络可用。激活：到任一四大行ATM设独立ATM密码。' },
      { name: '下载支付宝和微信', text: '都从App Store下。用中国手机号注册。完成实名（扫护照+人脸）。绑新银行卡。设6位支付密码。两个App共30分钟。' },
      { name: '充值余额', text: '支付宝：我的→余额→充值。从银行卡转¥500-1,000。解锁小额免密（¥200以下免密支付）。' },
      { name: '设置跨境汇款', text: '出国前开Wise或Revolut账户。借记卡寄到家庭地址。从本国银行充值，在Wise/Revolut内换人民币，直接消费或转中国账户。总成本约1%。' },
      { name: '小额测试', text: '在便利店买一瓶¥3的水。确认支付宝/微信支付全流程通。再去餐厅测一笔¥50的（商家扫你二维码，不是你扫商家的）。熟能生巧。' },
      { name: '设置自动缴费', text: '住宿、餐费、手机费、水电——通过支付宝"生活缴费"小程序设自动扣款。省去每月手动缴费、避免滞纳金。' },
    ],
    ctaTitle: '需要首次开中国银行账户的帮助？',
    ctaSubtitle:
      'SICA可以提前确认你所在大学偏好的四大行网点、带你走完材料清单、帮你把奖学金汇进来不损失3-5%手续费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/cost-of-living', label: '中国留学生活费', description: '月度真实预算：住房、餐饮、交通、手机、医疗、娱乐。' },
      { href: '/guides/visa', label: '学生签证 (X1 / X2)', description: '材料清单、费用、办理时长、居留许可、兼职、续签。' },
      { href: '/guides/application', label: '如何申请', description: '完整申请时间线、材料清单、奖学金路径。' },
    ],
  },
};
