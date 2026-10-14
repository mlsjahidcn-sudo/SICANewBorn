import type { LocalizedGuide } from './types';

/**
 * "CSCA fee in Pakistan, Nigeria and Bangladesh: what it costs and
 * how to pay" (Phase 170, article #1 from the 20-article audit).
 *
 * Phase 147's /csca-exam-fees covers the global CSCA fee structure
 * (RMB 450 / 700, payment methods, etc.). Phase 170 closes the
 * country-specific angle the audit flagged: how a Pakistani /
 * Nigerian / Bangladeshi applicant actually PAYS the fee from
 * their home country — which payment rails work, the bank-wire
 * fallback for applicants without credit cards, common failures
 * (declined cards, currency conversion losses, missing receipts
 * for the visa office), and a per-country payment timeline.
 *
 * Target queries: "csca fee pakistan", "csca fee nigeria",
 * "csca fee bangladesh", "how to pay csca from pakistan",
 * "csca fee online payment", "csca registration fee international
 * students".
 */
export const cscaFeePakistanNigeriaBangladeshGuide: LocalizedGuide = {
  en: {
    slug: 'csca-fee-pakistan-nigeria-bangladesh',
    eyebrow: 'GUIDE · CSCA FEE',
    title: 'CSCA Fee in Pakistan, Nigeria and Bangladesh: What It Costs and How to Pay',
    description:
      'CSCA exam fee for Pakistani, Nigerian, and Bangladeshi applicants 2027: amount (RMB 450 / 700), how to pay from each country (bank wire, Payoneer, Flutterwave, bKash, Nagad), common payment failures, and per-country timeline.',
    subtitle:
      'The CSCA exam fee is the same for every applicant (RMB 450 for one subject, RMB 700 for two or more) — but how you PAY it from Pakistan, Nigeria, or Bangladesh differs dramatically. Most international applicants don\'t have a Chinese credit card or Alipay; the practical payment paths are international bank wires, regional mobile money, and Payoneer / Flutterwave transfers. This guide covers the per-country payment mechanics, common failures, and the timeline that gets your CSCA sitting done before your CSC deadline.',
    stats: [
      { value: 'RMB 450', label: 'CSCA fee — 1 subject' },
      { value: 'RMB 700', label: 'CSCA fee — 2+ subjects' },
      { value: 'USD ~63 / NGN ~95k / BDT ~7,400', label: 'Approx local equivalents (Aug 2026)' },
      { value: '3 countries', label: 'Pakistan + Nigeria + Bangladesh covered' },
    ],
    quickAnswer:
      'CSCA fee structure is uniform globally: RMB 450 for one subject, RMB 700 for two or more. The payment method differs by country. Pakistan: international bank wire (HBL / UBL / MCB) to CSC\'s designated account, OR Payoneer transfer, OR credit/debit card via Stripe. Nigeria: bank wire to CSC\'s designated account, Flutterwave (Nigerian fintech), or Payoneer. Bangladesh: bank wire (Dutch-Bangla / BRAC / Islami Bank), bKash / Nagad (where CSC accepts mobile wallet), or Payoneer. Common failures: declined cards (most Pakistani + Bangladeshi + Nigerian cards fail China-side Stripe), currency conversion losses (~3-5% lost to FX + wire fees), missing CSCA confirmation email in spam folder. The fastest path: register at csca.cn → choose \'bank wire\' → wire in USD/EUR → CSC confirms in 3-5 business days. Plan 6-8 weeks total from registration to score receipt.',
    keyTakeaways: [
      'CSCA fee is uniform: RMB 450 for 1 subject, RMB 700 for 2+ subjects. No waivers, no income-based discounts — the fee is the same for every applicant worldwide',
      'Payment methods from Pakistan, Nigeria, Bangladesh: international bank wire (the most reliable) + Payoneer (mid-tier, ~3-5% FX loss) + regional mobile wallets (bKash, Nagad — limited acceptance) + Flutterwave (Nigeria only)',
      'Most Pakistani, Nigerian, and Bangladeshi credit/debit cards FAIL on China-side Stripe due to international fraud filters; bank wire is the safe path',
      'CSCA fee must be paid before the registration window closes; late payment = not registered = not eligible to sit the exam',
      'Currency conversion costs eat 3-5% of the fee (bank wire fees + FX spread + intermediary bank fees); budget RMB 470 / 735 to be safe, not 450 / 700',
      'Always request the CSC wire-transfer receipt (汇款凭证) and attach it to your visa application — embassies + universities want to see proof of payment',
      'The whole process (register → pay → confirm → take exam → receive score) takes 4-8 weeks depending on payment method; budget 8 weeks to be safe for the November or December 2026 sitting',
    ],
    sections: [
      {
        id: 'fee-structure',
        h2: 'The fee structure (uniform globally)',
        intro:
          'CSCA charges a single fee schedule — no country-specific variation, no waivers, no income-based discounts. The only variable is how many subjects you take.',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA fee structure (2026-27 academic year)',
            columns: ['Subjects', 'Fee (CNY)', 'Equivalent (USD, Aug 2026)', 'Equivalent (NGN)', 'Equivalent (BDT)'],
            rows: [
              ['1 subject', '¥450', '~$63', '~¥95,000', '~¥7,400'],
              ['2 subjects', '¥700', '~$98', '~¥148,000', '~¥11,500'],
              ['3 subjects', '¥700', '~$98', '~¥148,000', '~¥11,500'],
              ['4+ subjects', '¥700', '~$98', '~¥148,000', '~¥11,500'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**One subject vs two+** — most bachelor\'s applicants take 2 (Math + Physics, or Math + Chemistry depending on the program); some programs require Math only (1 subject)',
              '**Fee is non-refundable** — once you register and pay, the only way to get the money back is if CSC cancels your specific sitting (rare)',
              '**No fee waiver** — CSCA does not offer income-based or country-based waivers; every applicant pays the same',
              '**Late registration surcharge** — some sittings charge ¥50-100 extra if you register in the final 48 hours before the window closes; register early to avoid',
              '**CSCA Prep note** — cscaprep.academy offers free mocks + study plans for every sitting; you only pay the official CSCA fee, not for prep materials',
            ],
          },
        ],
      },
      {
        id: 'how-to-pay-from-pakistan',
        h2: 'How to pay from Pakistan (HBL, UBL, MCB, Payoneer)',
        intro:
          'Pakistani applicants have the most constrained payment options. Cards rarely work; bank wire is the safe path; Payoneer is the second-best.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Step 1 — Register at csca.cn** — the registration portal accepts Pakistani applicants; use your Bangla (your name) on the form, with English transliteration for foreign-facing fields',
              '**Step 2 — Choose \'International Bank Wire\' as the payment method** — credit card payments via Stripe fail for most Pakistani cards (Habib Bank, UBL, MCB issued, Meezan, Allied, Standard Chartered PK); bank wire is the safe path',
              '**Step 3 — Get the wire instructions from CSC** — after registration, the portal generates a wire-transfer instruction sheet with: beneficiary bank (usually Bank of China), beneficiary name (China Scholarship Council or equivalent), account number, SWIFT code, and reference number (your CSCA application ID)',
              '**Step 4 — Visit your bank (HBL, UBL, MCB, Meezan, Allied, Standard Chartered, or any Pakistani bank with international wire capability)** — request an "international outward remittance" for education purposes. Provide the wire details from Step 3. Banks charge ~PKR 1,500-3,000 in fees + 1-2% FX spread',
              '**Step 5 — Provide your bank the purpose of remittance** — "Education / Examination Fee" with the CSCA reference number; this matters for State Bank of Pakistan\'s reporting requirements',
              '**Step 6 — Wait for confirmation** — wire transfers take 3-7 business days to reach CSC\'s account; once CSC confirms receipt, you receive an email + the portal status changes to "Confirmed"',
              '**Step 7 — Keep your wire receipt** — print + scan + save the bank\'s wire transfer receipt (remittance receipt); you\'ll need it for your visa application',
              '**Alternative path — Payoneer** — if you have a Payoneer account (common for freelancers + remote workers), withdraw from Payoneer to your Pakistani bank or directly to the CSC wire account; ~3-5% total fees vs ~5-7% for direct bank wire',
              '**What NOT to do** — don\'t use JazzCash / Easypaisa / other Pakistani mobile wallets (CSC does not accept them); don\'t try to send via Western Union or MoneyGram (too slow + no fee tracking)',
            ],
          },
        ],
      },
      {
        id: 'how-to-pay-from-nigeria',
        h2: 'How to pay from Nigeria (bank wire, Flutterwave, Payoneer)',
        intro:
          'Nigerian applicants have slightly more options — Flutterwave (Nigerian fintech) works for some CSC payment methods; bank wire is still the safe path.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Step 1 — Register at csca.cn** — use your English transliteration of your name (not the Yoruba / Igbo / Hausa script)',
              '**Step 2 — Choose payment method** — the portal shows credit/debit card + bank wire + (some sittings) Flutterwave. Nigerian GTBank + Zenith Bank + First Bank cards have higher Stripe approval rates than Pakistani / Bangladeshi cards; try card first, fall back to wire if declined',
              '**Step 3 — Card declined? Use bank wire** — visit GTBank / Zenith / First Bank / UBA / Access Bank with the CSC wire details; Nigeria has 24-48 hour international wire turnaround (faster than Pakistan because Nigerian banks have stronger correspondent relationships with Chinese banks)',
              '**Step 4 — Use Flutterwave for mid-amount transfers** — Flutterwave is a Nigerian fintech that handles international transfers with lower fees than traditional bank wire (~2-3% vs ~4-6% for direct bank wire); supports USD, EUR, GBP payouts. Create a Flutterwave account, link your Nigerian bank, transfer to CSC\'s designated account. Note: Flutterwave\'s international business transfer limits may require business account verification',
              '**Step 5 — Use Payoneer for stable payouts** — Payoneer has strong Nigerian bank coverage; withdraw from Payoneer to your Nigerian bank account, then initiate international wire from your bank',
              '**Step 6 — Wait for confirmation** — 2-5 business days for wire; 1-3 business days for Flutterwave',
              '**Step 7 — Get your wire receipt** — print + scan the CBN-approved international remittance receipt; embassy + universities want to see this',
              '**What NOT to do** — don\'t use OPay / PalmPay / Moniepoint (Nigerian mobile wallets — CSC does not accept them); don\'t send cash via informal channels',
            ],
          },
        ],
      },
      {
        id: 'how-to-pay-from-bangladesh',
        h2: 'How to pay from Bangladesh (Dutch-Bangla, BRAC, bKash, Nagad)',
        intro:
          'Bangladeshi applicants have the most constrained options — international wires are slower, Payoneer works, mobile wallets are limited.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Step 1 — Register at csca.cn** — use your English transliteration of your name (not Bangla script); pick ONE English spelling and use it identically on every document including the wire reference',
              '**Step 2 — Choose \'International Bank Wire\' as the payment method** — credit card payments via Stripe fail for most Bangladeshi cards (Dutch-Bangla, BRAC, Islami, EBL, City Bank issued); bank wire is the safe path',
              '**Step 3 — Get the wire instructions from CSC** — after registration, the portal generates a wire-transfer instruction sheet; beneficiary bank (Bank of China), beneficiary name (China Scholarship Council or equivalent), account number, SWIFT code, and reference number (your CSCA application ID)',
              '**Step 4 — Visit your bank (Dutch-Bangla / BRAC / Islami / EBL / City / Southeast / Mutual Trust)** — request an "international outward remittance for education purposes"; provide the wire details from Step 3. Bangladeshi banks charge ~BDT 1,500-3,000 in fees + 1-2.5% FX spread',
              '**Step 5 — Bangladesh → China wire transfer timing** — expect 5-10 business days (slower than Pakistan + Nigeria because Bangladesh correspondent banking relationships with Chinese banks are less developed); plan accordingly',
              '**Step 6 — Use bKash / Nagad where accepted** — some sittings accept bKash / Nagad transfers to a Bangladesh intermediary account that re-wires to CSC; check the portal\'s payment page for the current accepted wallet options',
              '**Step 7 — Use Payoneer for stable payouts** — Payoneer has strong Bangladeshi bank coverage (Dutch-Bangla + BRAC + EBL); withdraw from Payoneer to your Bangladeshi bank, then initiate international wire',
              '**Step 8 — Wait for confirmation** — 5-10 business days; check the portal\'s status page after 7 days if you haven\'t received the email',
              '**Step 9 — Get your wire receipt** — print + scan the Bangladesh Bank-approved international remittance receipt',
              '**What NOT to do** — don\'t use bKash / Nagad for amounts above ৳50,000 (BTRC limits); don\'t use informal channels (hundi) — illegal + no receipt',
            ],
          },
        ],
      },
      {
        id: 'common-failures',
        h2: 'Common payment failures + how to avoid them',
        intro:
          'These are the failure modes the CSC portal support team sees most often. Avoid them upfront.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Card declined by Stripe** — most Pakistani + Bangladeshi + ~30% of Nigerian cards fail China-side Stripe due to international fraud filters. Solution: use bank wire',
              '**Currency conversion loss** — banks + intermediaries charge 1-3% FX spread + wire fees = 3-5% total loss on the CSCA fee. Solution: budget RMB 470 / 735 (not 450 / 700) to be safe',
              '**Missing CSC wire receipt** — the wire transfer receipt (汇款凭证) is required for your visa application + for CSC\'s own records. Solution: request + scan + save immediately after the wire',
              '**Email confirmation in spam folder** — CSC sends confirmation to the email you registered with; check spam. Solution: whitelist csca.cn + csc.cn emails',
              '**Wrong reference number on the wire** — the wire must include your CSCA application ID; without it, CSC can\'t match your payment. Solution: triple-check the reference number from the portal',
              '**Bank intermediary fees** — international wires often pass through 1-2 intermediary banks; each charges ~$15-30. Solution: ask your bank for the total cost upfront',
              '**Slow wire from Bangladesh** — Bangladesh → China wires can take 5-10 business days; plan accordingly',
              '**Wrong beneficiary name** — must match CSC\'s exact registered name (often "China Scholarship Council" or "CSC" — check the portal)',
            ],
          },
        ],
      },
      {
        id: 'timeline',
        h2: 'The 8-week timeline (registration → score receipt)',
        intro:
          'The whole process takes longer than most applicants expect. Budget 8 weeks from start to finish.',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA fee payment + exam timeline (8 weeks total)',
            columns: ['Week', 'Action'],
            rows: [
              ['Week 1', 'Register at csca.cn — choose subjects, fill in personal info, generate wire instructions'],
              ['Week 1-2', 'Visit your bank — initiate international wire transfer with CSC\'s wire details'],
              ['Week 2-3', 'Wire reaches CSC\'s account (Pakistan + Nigeria 3-7 days; Bangladesh 5-10 days)'],
              ['Week 3', 'CSC confirms receipt — email + portal status changes to "Confirmed"'],
              ['Week 3-4', 'Take the CSCA sitting (live online, proctored) — verify your subject + date'],
              ['Week 4-5', 'CSCA scores released (typically 2-3 weeks after the exam)'],
              ['Week 5-8', 'Receive the official CSCA score certificate (downloadable from the portal)'],
              ['Week 8', 'Submit the score to your target university (Type B) or CSC (via bilateral channel) — start your application'],
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How much is the CSCA exam fee for Pakistani / Nigerian / Bangladeshi applicants?',
        a: 'The fee is uniform globally: ¥450 for 1 subject, ¥700 for 2+ subjects. Most bachelor\'s applicants take 2 subjects (Math + Physics, or Math + Chemistry depending on the program). Budget ~3-5% extra to cover currency conversion losses (so ~¥470 or ~¥735 in your local currency, not ¥450 / ¥700).',
      },
      {
        q: 'Can I pay the CSCA fee with a Pakistani / Nigerian / Bangladeshi credit card?',
        a: 'Usually no — most cards issued in these countries fail on China-side Stripe due to international fraud filters. Even if the card works for other international purchases, CSCA\'s payment portal often declines it. The safe path is bank wire (most reliable) or Payoneer / Flutterwave (faster but with slightly higher fees).',
      },
      {
        q: 'Which Bangladeshi banks support CSCA bank wire transfers?',
        a: 'Dutch-Bangla Bank, BRAC Bank, Islami Bank Bangladesh, Eastern Bank (EBL), City Bank, Southeast Bank, and Mutual Trust Bank all support international outward remittances to China. Expect 5-10 business days for the wire to land in CSC\'s Bank of China account + ~BDT 1,500-3,000 in fees + 1-2.5% FX spread. bKash / Nagad do not accept international wires above ~BDT 50,000.',
      },
      {
        q: 'Which Nigerian banks support CSCA bank wire transfers?',
        a: 'GTBank, Zenith Bank, First Bank of Nigeria, United Bank for Africa (UBA), Access Bank, Ecobank, and Fidelity Bank all support international wires to China. Expect 2-5 business days + ~NGN 5,000-15,000 in fees + 1-2% FX spread. Flutterwave (Nigerian fintech) handles the same transfers with ~2-3% fees vs ~4-6% for direct bank wire.',
      },
      {
        q: 'Can I pay the CSCA fee via bKash / Nagad?',
        a: 'Some sittings accept bKash / Nagad transfers to a Bangladesh intermediary account that re-wires to CSC; check the portal\'s payment page for current accepted wallet options. Bangladeshi mobile wallets are not universally accepted — bank wire is the safe path.',
      },
      {
        q: 'What is the CSCA refund policy?',
        a: 'Non-refundable. The fee is non-refundable once paid; the only way to get money back is if CSC cancels your specific sitting (rare — happens only for severe events like natural disasters). If you miss the exam after paying, you still lose the fee.',
      },
      {
        q: 'Can I get a CSCA fee waiver?',
        a: 'No. CSCA does not offer income-based or country-based waivers; every applicant pays the same fee regardless of financial circumstances.',
      },
      {
        q: 'How long does it take to receive the CSCA score after the exam?',
        a: 'Typically 2-3 weeks after the exam date for the score to be released on the portal. The official score certificate (PDF download) is usually available within 4-6 weeks. Budget 8 weeks total from registration to score receipt — this is the safe timeline for CSC application planning.',
      },
    ],
    howToSteps: [
      {
        name: 'Register at csca.cn + choose subjects + generate wire instructions',
        text: 'Open csca.cn, register with your English name (use the same spelling as your passport), choose 1 or 2+ subjects, fill in personal info, generate the wire-transfer instruction sheet. The sheet will have the beneficiary bank, account number, SWIFT code, and your unique CSCA reference number.',
      },
      {
        name: 'Decide your payment method: bank wire vs Payoneer / Flutterwave',
        text: 'Bank wire is the most reliable for Pakistan + Bangladesh; Nigeria can also use Flutterwave (~2-3% fees). Payoneer works for all 3 countries if you already have an account. Budget RMB 470 / 735 (not 450 / 700) to cover FX + wire fees.',
      },
      {
        name: 'Initiate the wire transfer at your bank',
        text: 'Pakistan: HBL / UBL / MCB / Meezan / Allied / Standard Chartered. Nigeria: GTBank / Zenith / First Bank / UBA / Access / Ecobank. Bangladesh: Dutch-Bangla / BRAC / Islami / EBL / City / Southeast / Mutual Trust. Provide the CSC wire details + your CSCA reference number. Ask for the total cost upfront.',
      },
      {
        name: 'Wait for the wire to land + get your receipt',
        text: 'Pakistan + Nigeria: 3-7 business days. Bangladesh: 5-10 business days. Once confirmed, request + scan + save the bank\'s international remittance receipt — you\'ll need it for the visa application.',
      },
      {
        name: 'Take the CSCA sitting',
        text: 'Live online exam at the scheduled date + time. Verify your subject + date + time zone in advance. The portal lists your proctoring instructions ~1 week before the sitting.',
      },
      {
        name: 'Receive the score + download the certificate',
        text: 'Score released 2-3 weeks after the exam. Official certificate (PDF) available 4-6 weeks after. Download + save immediately — you\'ll need this for your university application + CSC application.',
      },
      {
        name: 'Submit the score with your university + CSC applications',
        text: 'Use the CSCA score in your Type B university applications (most bachelor\'s programs require it). Submit it with your CSC application if you\'re going the bilateral route. The score is valid for 2 academic cycles.',
      },
    ],
    ctaTitle: 'Need help with the CSCA fee payment from Pakistan / Nigeria / Bangladesh?',
    ctaSubtitle:
      'SICA counselors review your country-specific payment path (bank wire rails, currency conversion, intermediary fees, common failure modes) + check the timeline against your CSC deadline. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-exam-fees',
        label: 'CSCA exam fee 2026-27: RMB 450 or 700 & how to pay',
        description: 'The global CSCA fee structure + payment methods.',
      },
      {
        href: '/csc-scholarship-pakistan',
        label: 'CSC Scholarship for Pakistani students 2027',
        description: 'HEC route + Type B university route, December-January deadline, CSCA requirement.',
      },
      {
        href: '/csc-scholarship-nigeria',
        label: 'CSC Scholarship for Nigerian students 2027',
        description: 'Type B university route, January-April 2027 deadlines, CSCA, agent-fraud warning.',
      },
      {
        href: '/csc-scholarship-bangladesh',
        label: 'CSC Scholarship for Bangladeshi students 2027',
        description: 'MoE Bangladesh + UGC embassy route vs Type B, October-November notice window, CSCA, name-match.',
      },
    ],
  },
  zh: {
    slug: 'csca-fee-pakistan-nigeria-bangladesh',
    eyebrow: '指南 · CSCA 考试费',
    title: '巴基斯坦、尼日利亚、孟加拉国 CSCA 考试费：费用与支付方式',
    description:
      '2027 年巴基斯坦、尼日利亚、孟加拉国申请者 CSCA 考试费：金额（人民币 450 / 700）、从各国支付的方式（银行汇款、Payoneer、Flutterwave、bKash、Nagad）、常见支付失败、按国时间线。',
    subtitle:
      'CSCA 考试费全球统一——每位申请者 RMB 450 单科或 RMB 700 两科及以上——但从巴基斯坦、尼日利亚或孟加拉国支付的方式截然不同。大多数国际申请者没有中国信用卡或支付宝；实际支付路径是国际银行电汇、区域移动钱包、Payoneer / Flutterwave 转账。本指南涵盖按国支付机制、常见失败与时间线，确保 CSCA 考试在你的 CSC 截止前完成。',
    stats: [
      { value: '人民币 450', label: 'CSCA 费用——单科' },
      { value: '人民币 700', label: 'CSCA 费用——两科及以上' },
      { value: '美元 ~63 / 奈拉 ~95k / 塔卡 ~7,400', label: '约当地货币等价（2026 年 8 月）' },
      { value: '3 国', label: '巴 + 尼 + 孟加拉国全覆盖' },
    ],
    quickAnswer:
      'CSCA 费用结构全球统一：单科 RMB 450，两科及以上 RMB 700。支付方式因国而异。巴基斯坦：国际银行电汇（HBL / UBL / MCB）到 CSC 指定账户，或 Payoneer 转账，或信用卡经 Stripe。尼日利亚：银行电汇到 CSC 指定账户，Flutterwave（尼日利亚金融科技），或 Payoneer。孟加拉国：银行电汇（Dutch-Bangla / BRAC / Islami Bank），bKash / Nagad（CSC 接受移动钱包的范围内），或 Payoneer。常见失败：中国侧 Stripe 大多数巴基斯坦 + 孟加拉国 + 尼日利亚信用卡被拒、汇率转换损失（约 3-5%）、CSCA 确认邮件被丢到垃圾邮件夹。最快路径：在 csca.cn 注册 → 选"银行电汇" → 用美元 / 欧元电汇 → CSC 3-5 个工作日确认。注册到拿成绩总计规划 6-8 周。',
    keyTakeaways: [
      'CSCA 费用全球统一：单科 RMB 450，两科及以上 RMB 700。无减免、无收入折扣——所有申请者支付相同',
      '巴基斯坦、尼日利亚、孟加拉国支付方式：国际银行电汇（最可靠）+ Payoneer（中等，约 3-5% 汇率损失）+ 区域移动钱包（bKash、Nagad——接受有限）+ Flutterwave（仅尼日利亚）',
      '中国侧 Stripe 大多数巴基斯坦、孟加拉国、尼日利亚信用卡因国际欺诈过滤器被拒；银行电汇是安全路径',
      'CSCA 费用必须在注册窗口关闭前支付；逾期支付 = 未注册 = 不能参加考试',
      '汇率转换成本吃掉 3-5% 费用（电汇费 + 汇率差 + 中转行费）；预算 RMB 470 / 735 以保安全，不要 450 / 700',
      '总是索取 CSC 电汇凭证（汇款凭证）并附在签证申请里——大使馆 + 大学要求看支付证明',
      '整个流程（注册 → 支付 → 确认 → 考试 → 拿成绩）需 4-8 周视支付方式而定；为 2026 年 11 月或 12 月场次预算 8 周',
    ],
    sections: [
      {
        id: 'fee-structure',
        h2: '费用结构（全球统一）',
        intro:
          'CSCA 收费单一时间表——无按国变化、无减免、无收入折扣。唯一变量是你考几科。',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA 费用结构（2026-27 学年）',
            columns: ['科目', '费用（人民币）', '等价（美元，2026 年 8 月）', '等价（奈拉）', '等价（塔卡）'],
            rows: [
              ['单科', '¥450', '~$63', '~¥95,000', '~¥7,400'],
              ['两科', '¥700', '~$98', '~¥148,000', '~¥11,500'],
              ['三科', '¥700', '~$98', '~¥148,000', '~¥11,500'],
              ['四科及以上', '¥700', '~$98', '~¥148,000', '~¥11,500'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**单科 vs 两科+**——大多数本科申请者考 2 科（数学 + 物理，或数学 + 化学取决于项目）；部分项目只要求数学（单科）',
              '**费用不退**——一旦注册并支付，退款的唯一方式是 CSC 取消你特定的考试场次（罕见）',
              '**无费用减免**——CSCA 不提供基于收入或国家的减免；每位申请者支付相同',
              '**逾期注册附加费**——某些场次在窗口关闭前最后 48 小时注册收 ¥50-100 附加费；尽早注册以避免',
              '**CSCA Prep 说明**——cscaprep.academy 为每场次提供免费模拟 + 学习计划；你只需支付官方 CSCA 费用，不用为备考材料付费',
            ],
          },
        ],
      },
      {
        id: 'how-to-pay-from-pakistan',
        h2: '从巴基斯坦支付（HBL、UBL、MCB、Payoneer）',
        intro:
          '巴基斯坦申请者的支付选项最受限。信用卡几乎无效；银行电汇是安全路径；Payoneer 是次选。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1 步——在 csca.cn 注册**——注册门户接受巴基斯坦申请者；表单上用你的英语姓名（转写），外文用英语转写',
              '**第 2 步——选择"国际银行电汇"作为支付方式**——通过 Stripe 的信用卡支付大多数巴基斯坦信用卡（Habib Bank、UBL、MCB、Meezan、Allied、Standard Chartered PK）被拒；银行电汇是安全路径',
              '**第 3 步——从 CSC 获取电汇说明**——注册后，门户生成电汇说明：收款行（中国银行）、收款人名称（国家留学基金委或等效）、账号、SWIFT 代码、参考号（你的 CSCA 申请 ID）',
              '**第 4 步——去你的银行（HBL、UBL、MCB、Meezan、Allied、Standard Chartered 或任何有国际电汇能力的巴基斯坦银行）**——申请"教育目的国际外汇汇款"。提供第 3 步的电汇详情。银行收 ~PKR 1,500-3,000 费用 + 1-2% 汇率差',
              '**第 5 步——告诉银行汇款用途**——"教育 / 考试费"加 CSCA 参考号；这关系到巴基斯坦国家银行报告要求',
              '**第 6 步——等待确认**——电汇到 CSC 账户 3-7 个工作日；CSC 确认收款后你会收到邮件 + 门户状态变为"已确认"',
              '**第 7 步——保管电汇凭证**——打印 + 扫描 + 保存银行的电汇凭证（汇款凭证）；签证申请需要',
              '**替代路径——Payoneer**——如果你有 Payoneer 账户（自由职业 + 远程工作者常见），从 Payoneer 提现到你的巴基斯坦银行或直接到 CSC 电汇账户；总费用约 3-5% vs 直接银行电汇的 5-7%',
              '**不要做的**——不要用 JazzCash / Easypaisa / 其他巴基斯坦移动钱包（CSC 不接受）；不要通过 Western Union 或 MoneyGram 发送（太慢 + 无法追踪费用）',
            ],
          },
        ],
      },
      {
        id: 'how-to-pay-from-nigeria',
        h2: '从尼日利亚支付（银行电汇、Flutterwave、Payoneer）',
        intro:
          '尼日利亚申请者选项稍多——Flutterwave（尼日利亚金融科技）适用于部分 CSC 支付方式；银行电汇仍是安全路径。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1 步——在 csca.cn 注册**——用你姓名的英语转写（不是 Yoruba / Igbo / Hausa 文字）',
              '**第 2 步——选择支付方式**——门户显示信用卡 + 银行电汇 +（部分场次）Flutterwave。尼日利亚 GTBank + Zenith Bank + First Bank 卡的 Stripe 通过率高于巴基斯坦 / 孟加拉国；先试卡，失败后退回电汇',
              '**第 3 步——卡被拒？用银行电汇**——去 GTBank / Zenith / First Bank / UBA / Access Bank 出示 CSC 电汇详情；尼日利亚国际电汇周转 24-48 小时（比巴基斯坦快，因为尼日利亚银行与中国银行的代理关系更强）',
              '**第 4 步——中额转账用 Flutterwave**——Flutterwave 是尼日利亚金融科技，国际转账手续费低于传统银行电汇（约 2-3% vs 直接银行电汇的 4-6%）；支持美元、欧元、英镑支付。创建 Flutterwave 账户，关联你的尼日利亚银行，转账到 CSC 指定账户。注意：Flutterwave 国际业务转账限额可能要求企业账户验证',
              '**第 5 步——稳定支付用 Payoneer**——Payoneer 在尼日利亚银行覆盖强；从 Payoneer 提现到你的尼日利亚银行账户，然后从银行发起国际电汇',
              '**第 6 步——等待确认**——电汇 2-5 个工作日；Flutterwave 1-3 个工作日',
              '**第 7 步——获得电汇凭证**——打印 + 扫描 CBN 批准的国际汇款凭证；大使馆 + 大学要求看这个',
              '**不要做的**——不要用 OPay / PalmPay / Moniepoint（尼日利亚移动钱包——CSC 不接受）；不要通过非正式渠道送现金',
            ],
          },
        ],
      },
      {
        id: 'how-to-pay-from-bangladesh',
        h2: '从孟加拉国支付（Dutch-Bangla、BRAC、bKash、Nagad）',
        intro:
          '孟加拉国申请者选项最受限——国际电汇较慢，Payoneer 可用，移动钱包有限。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第 1 步——在 csca.cn 注册**——用你姓名的英语转写（不是孟加拉文）；选一种英语拼写并与所有文件上保持一致',
              '**第 2 步——选择"国际银行电汇"作为支付方式**——通过 Stripe 的信用卡支付大多数孟加拉国信用卡（Dutch-Bangla、BRAC、Islami、EBL、City Bank 发行）被拒；银行电汇是安全路径',
              '**第 3 步——从 CSC 获取电汇说明**——注册后，门户生成电汇说明：收款行（中国银行）、收款人名称（国家留学基金委或等效）、账号、SWIFT 代码、参考号（你的 CSCA 申请 ID）',
              '**第 4 步——去你的银行（Dutch-Bangla / BRAC / Islami / EBL / City / Southeast / Mutual Trust）**——申请"教育目的国际外汇汇款"；提供第 3 步的电汇详情。孟加拉国银行收 ~BDT 1,500-3,000 费用 + 1-2.5% 汇率差',
              '**第 5 步——孟加拉国 → 中国电汇时间**——预期 5-10 个工作日（比巴基斯坦 + 尼日利亚慢，因为孟加拉国与中国银行的代理关系较弱）；相应规划',
              '**第 6 步——bKash / Nagad（接受的话）**——某些场次接受 bKash / Nagad 转账到孟加拉国中介账户，由中介再电汇到 CSC；查门户的支付页面看当前接受的移动钱包选项',
              '**第 7 步——稳定支付用 Payoneer**——Payoneer 在孟加拉国银行覆盖强（Dutch-Bangla + BRAC + EBL）；从 Payoneer 提现到你的孟加拉国银行，然后发起国际电汇',
              '**第 8 步——等待确认**——5-10 个工作日；7 天后没收到邮件就查门户状态页',
              '**第 9 步——获得电汇凭证**——打印 + 扫描孟加拉国央行批准的国际汇款凭证',
              '**不要做的**——不要用 bKash / Nagad 转账超过 BDT 50,000（BTRC 限额）；不要用非正式渠道（hundi）——违法 + 无凭证',
            ],
          },
        ],
      },
      {
        id: 'common-failures',
        h2: '常见支付失败 + 避免方式',
        intro:
          '这些是 CSC 门户支持团队最常见的失败模式。提前避免。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**卡被 Stripe 拒**——大多数巴基斯坦 + 孟加拉国 + ~30% 尼日利亚信用卡因国际欺诈过滤器在中国侧 Stripe 被拒。解决：用电汇',
              '**汇率转换损失**——银行 + 中介收 1-3% 汇率差 + 电汇费 = 总 3-5% CSCA 费用损失。解决：预算 RMB 470 / 735（不是 450 / 700）以保安全',
              '**缺失 CSC 电汇凭证**——电汇凭证（汇款凭证）是签证申请 + CSC 自己记录必需的。解决：电汇后立即索取 + 扫描 + 保存',
              '**邮件确认在垃圾邮件夹**——CSC 用你注册的邮箱发确认；查垃圾邮件。解决：白名单 csca.cn + csc.cn 邮件',
              '**电汇参考号错误**——电汇必须包含你的 CSCA 申请 ID；没有 ID CSC 无法匹配你的付款。解决：从门户三次核对参考号',
              '**银行中介费**——国际电汇经常经过 1-2 个中介行；每个收 ~$15-30。解决：让银行预先报总价',
              '**孟加拉国电汇慢**——孟加拉国 → 中国电汇可能需要 5-10 个工作日；相应规划',
              '**收款人名称错误**——必须与 CSC 准确注册名称匹配（通常是"国家留学基金委"或"CSC"——查门户）',
            ],
          },
        ],
      },
      {
        id: 'timeline',
        h2: '8 周时间线（注册 → 拿成绩）',
        intro:
          '整个流程比大多数申请者预期的要长。规划 8 周从头到尾。',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA 费用支付 + 考试时间线（共 8 周）',
            columns: ['周', '动作'],
            rows: [
              ['第 1 周', '在 csca.cn 注册——选科目，填个人信息，生成电汇说明'],
              ['第 1-2 周', '去你的银行——用 CSC 电汇详情发起国际电汇'],
              ['第 2-3 周', '电汇到达 CSC 账户（巴基斯坦 + 尼日利亚 3-7 天；孟加拉国 5-10 天）'],
              ['第 3 周', 'CSC 确认收款——邮件 + 门户状态变为"已确认"'],
              ['第 3-4 周', '参加 CSCA 场次（线上真人监考）——预先核对科目 + 日期 + 时区'],
              ['第 4-5 周', 'CSCA 成绩公布（通常考试后 2-3 周）'],
              ['第 5-8 周', '收到官方 CSCA 成绩证书（可从门户下载）'],
              ['第 8 周', '把成绩提交给目标大学（Type B）或 CSC（双边渠道）——开始申请'],
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '巴基斯坦 / 尼日利亚 / 孟加拉国申请者 CSCA 考试费是多少？',
        a: '费用全球统一：单科 ¥450，两科及以上 ¥700。大多数本科申请者考 2 科（数学 + 物理，或数学 + 化学取决于项目）。预算比 ¥450 / ¥700 多 3-5% 以覆盖汇率转换损失（即约 ¥470 或 ¥735 本地货币）。',
      },
      {
        q: '我可以用巴基斯坦 / 尼日利亚 / 孟加拉国信用卡支付 CSCA 费用吗？',
        a: '通常不能——大多数这些国家发行的卡在中国侧 Stripe 因国际欺诈过滤器被拒。即使卡对其他国际购买有效，CSCA 支付门户通常会拒它。安全路径是银行电汇（最可靠）或 Payoneer / Flutterwave（更快但费用略高）。',
      },
      {
        q: '哪些孟加拉国银行支持 CSCA 银行电汇？',
        a: 'Dutch-Bangla Bank、BRAC Bank、Islami Bank Bangladesh、Eastern Bank (EBL)、City Bank、Southeast Bank、Mutual Trust Bank 都支持国际外汇汇款到中国。预期电汇 5-10 个工作日落地 CSC 中国银行账户 + 费用 ~BDT 1,500-3,000 + 1-2.5% 汇率差。bKash / Nagad 不接受超过 ~BDT 50,000 的国际汇款。',
      },
      {
        q: '哪些尼日利亚银行支持 CSCA 银行电汇？',
        a: 'GTBank、Zenith Bank、First Bank of Nigeria、United Bank for Africa (UBA)、Access Bank、Ecobank、Fidelity Bank 都支持国际电汇到中国。预期 2-5 个工作日 + 费用 ~NGN 5,000-15,000 + 1-2% 汇率差。Flutterwave（尼日利亚金融科技）处理同样转账的费用约 2-3% vs 直接银行电汇的 4-6%。',
      },
      {
        q: '我可以用 bKash / Nagad 支付 CSCA 费用吗？',
        a: '部分场次接受 bKash / Nagad 转账到孟加拉国中介账户，由中介再电汇到 CSC；查门户的支付页面看当前接受的移动钱包选项。孟加拉国移动钱包不接受国际汇款——银行电汇是安全路径。',
      },
      {
        q: 'CSCA 退款政策是什么？',
        a: '不退。费用支付后不退；拿回钱的唯一方式是 CSC 取消你特定的考试场次（罕见——只在严重事件如自然灾害时）。错过考试后费用也损失。',
      },
      {
        q: '我可以申请 CSCA 费用减免吗？',
        a: '不能。CSCA 不提供基于收入或国家的减免；每位申请者无论财务状况都支付相同费用。',
      },
      {
        q: '考完后多久能拿到 CSCA 成绩？',
        a: '通常考试后 2-3 周在门户上公布成绩。官方成绩证书（PDF 下载）通常 4-6 周内可用。规划从注册到拿成绩总共 8 周——这是 CSC 申请规划的安全时间线。',
      },
    ],
    howToSteps: [
      {
        name: '在 csca.cn 注册 + 选科目 + 生成电汇说明',
        text: '打开 csca.cn，用你的英语姓名注册（与护照拼写一致），选 1 或 2+ 科目，填个人信息，生成电汇说明单。单上有收款行、账号、SWIFT 代码和你唯一的 CSCA 参考号。',
      },
      {
        name: '决定支付方式：银行电汇 vs Payoneer / Flutterwave',
        text: '银行电汇对巴基斯坦 + 孟加拉国最可靠；尼日利亚也可用 Flutterwave（约 2-3% 费用）。如果你已有 Payoneer 账户，三国都能用。预算 RMB 470 / 735（不是 450 / 700）以覆盖汇率 + 电汇费。',
      },
      {
        name: '在银行发起电汇',
        text: '巴基斯坦：HBL / UBL / MCB / Meezan / Allied / Standard Chartered。尼日利亚：GTBank / Zenith / First Bank / UBA / Access / Ecobank。孟加拉国：Dutch-Bangla / BRAC / Islami / EBL / City / Southeast / Mutual Trust。提供 CSC 电汇详情 + CSCA 参考号。预先询问总价。',
      },
      {
        name: '等待电汇落地 + 拿凭证',
        text: '巴基斯坦 + 尼日利亚：3-7 个工作日。孟加拉国：5-10 个工作日。确认后立即索取 + 扫描 + 保存银行的国际汇款凭证——签证申请需要。',
      },
      {
        name: '参加 CSCA 考试',
        text: '线上考试在预定日期 + 时间进行。提前核对科目 + 日期 + 时区。门户在考试前约 1 周列出你的监考说明。',
      },
      {
        name: '拿成绩 + 下载证书',
        text: '考试后 2-3 周公布成绩。官方证书（PDF）4-6 周内可用。立即下载 + 保存——大学申请 + CSC 申请都需要。',
      },
      {
        name: '把成绩随大学 + CSC 申请提交',
        text: '在 Type B 大学申请中使用 CSCA 成绩（大多数本科项目要求）。如果你走双边渠道，把成绩附在 CSC 申请里。成绩 2 个学年周期有效。',
      },
    ],
    ctaTitle: '需要从巴基斯坦 / 尼日利亚 / 孟加拉国支付 CSCA 费用的帮助？',
    ctaSubtitle:
      'SICA 顾问审查你按国支付路径（电汇轨道、汇率转换、中介费、常见失败模式）+ 对照 CSC 截止核对时间线。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-exam-fees',
        label: 'CSCA 考试费 2026-27：人民币 450 / 700 与支付方式',
        description: '全球 CSCA 费用结构 + 支付方式。',
      },
      {
        href: '/csc-scholarship-pakistan',
        label: '2027 巴基斯坦学生 CSC 奖学金',
        description: 'HEC 渠道 + Type B 大学渠道，12-1 月截止，CSCA 要求。',
      },
      {
        href: '/csc-scholarship-nigeria',
        label: '2027 尼日利亚学生 CSC 奖学金',
        description: 'Type B 大学渠道，2027 年 1-4 月截止，CSCA，防骗提醒。',
      },
      {
        href: '/csc-scholarship-bangladesh',
        label: '2027 孟加拉国学生 CSC 奖学金',
        description: 'MoE 孟加拉国 + UGC 使馆渠道 vs Type B，10-11 月通知窗口，CSCA，姓名一致性。',
      },
    ],
  },
};
