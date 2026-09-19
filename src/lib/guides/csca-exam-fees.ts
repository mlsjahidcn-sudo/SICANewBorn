import type { LocalizedGuide } from './types';

/**
 * "CSCA exam fees & payment guide" — Batch 1, article #4 of the
 * 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca exam fee", "csca cost", "csca registration
 * fee", "how to pay csca".
 *
 * Static content. The ¥450/¥700 banding is from launch-period
 * official notices; comparison figures for other exams are labeled
 * approximate. Refund/policy specifics stay qualified since the
 * portal handles them per session.
 */
export const cscaFeesGuide: LocalizedGuide = {
  en: {
    slug: 'csca-exam-fees',
    eyebrow: 'GUIDE · CSCA FEES',
    title: 'CSCA Exam Fees & Payment Guide — Costs, Payment Methods, and Paying from Abroad',
    description:
      'CSCA registration costs ¥450 for one subject or ¥700 total for two or more, paid via Alipay, WeChat Pay, or bank transfer. Full fee breakdown, payment walkthroughs for overseas candidates, refund caveats, and how it compares to the SAT and IELTS.',
    subtitle:
      'The CSCA is one of the cheapest standardized admissions exams in the world: ¥450 CNY for a single subject, or ¥700 total for two or more subjects in the same session — meaning the typical candidate sitting 3–4 subjects pays ¥700 flat. Payment runs through the official portal via Alipay, WeChat Pay, or bank transfer. The real cost traps are not the fees but payment-channel friction and refund assumptions.',
    stats: [
      { value: '¥450', label: '1 subject' },
      { value: '¥700', label: '2+ subjects (total)' },
      { value: '3', label: 'Payment methods' },
      { value: '~$100', label: 'Typical total, all subjects' },
    ],
    quickAnswer:
      'CSCA registration costs ¥450 CNY for one subject or ¥700 CNY total for two or more subjects in the same session — so a candidate sitting the typical 3–4 subject combination pays ¥700 flat (roughly US$100). Payment is made on the official portal via Alipay, WeChat Pay, or bank transfer, and must complete inside the registration window (which closes ~15 days before the test). Candidates outside China without Alipay or WeChat should start a bank transfer several business days early. There is no published automatic refund for no-shows, and the registration is only valid once payment is confirmed — an unpaid or failed order does not hold your seat.',
    keyTakeaways: [
      'Flat banding: ¥450 for one subject, ¥700 total for two or more — the per-subject cost falls sharply as you add subjects',
      'Typical candidate (3–4 subjects) pays ¥700 (~US$100) — far below SAT, IELTS, or A-Level exam fees',
      'Pay via Alipay, WeChat Pay, or bank transfer inside the registration window; the seat is held only by a confirmed payment',
      'No Chinese payment account? Start a bank transfer 3–5 business days before the window closes, or register via a trusted person in China',
      'Keep the payment confirmation until results are released — it is your evidence for any payment dispute',
      'No published automatic no-show refund; treat policy questions (refunds, subject changes) as per-session portal matters',
    ],
    sections: [
      {
        id: 'fee-structure',
        h2: 'The CSCA fee structure',
        intro:
          'Fees are banded by subject count per session, not per subject — which makes the CSCA unusually cheap for candidates sitting the full combination.',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA registration fees (per session)',
            columns: ['Subjects registered', 'Fee (CNY)', '≈ USD', 'Per-subject equivalent'],
            rows: [
              ['1 subject', '¥450', '~$63', '¥450'],
              ['2 subjects', '¥700', '~$98', '¥350'],
              ['3 subjects (typical minimum)', '¥700', '~$98', '~¥233'],
              ['4 subjects (full combination)', '¥700', '~$98', '~¥175'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The band is the deal** — one subject costs ¥450, but the second, third, and fourth cost almost nothing extra. Sitting only the Chinese track to "save money" is almost always the wrong trade',
              '**Per session, not per year** — each sitting is paid separately; a retake in the next session pays the band again (¥700 for a 3-subject retake)',
              '**What is NOT charged** — no separate score-report fee is published at launch, no application fee to universities for receiving CSCA scores, no calculator rental (calculators are banned anyway)',
              '**Fee currency** — all fees are denominated in CNY; your bank\'s FX rate and any transfer charges come on top for overseas candidates',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Budget rule: every candidate should plan to pay ¥700 once per sitting. If your program only requires one subject, you pay ¥450; if it requires four, you pay the same ¥700 as the three-subject candidate.',
          },
        ],
      },
      {
        id: 'payment-methods',
        h2: 'Payment methods — Alipay, WeChat Pay, bank transfer',
        intro:
          'The portal accepts three payment channels. Which one to use depends on whether you have a Chinese payment account.',
        blocks: [
          {
            type: 'table',
            caption: 'Payment channels compared',
            columns: ['Method', 'Speed', 'Best for', 'Watch out'],
            rows: [
              ['Alipay', 'Instant', 'Candidates living in China or with a verified Alipay account', 'Foreign cards on Alipay can fail on merchant payments — test small first'],
              ['WeChat Pay', 'Instant', 'Candidates living in China or with a verified WeChat Pay account', 'Same foreign-card caveat as Alipay'],
              ['Bank transfer', '3–5 business days (international)', 'Candidates abroad without Chinese payment apps', 'Must start days before the window closes; keep the transfer receipt'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Instant channels are safest** — Alipay and WeChat Pay confirm immediately, and your registration status flips to paid on the spot',
              '**Bank transfer is the fallback** — the portal shows the beneficiary account details at checkout; transfer the exact amount and keep the receipt until the portal reflects payment',
              '**A trusted person in China can pay for you** — payment is not identity-bound the way registration is; they pay, you complete the registration under your own passport details',
              '**Verify the status after paying** — whichever channel you use, the registration is not real until the portal shows registered-and-paid; a failed payment silently drops after the window',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The most common fee-related failure is not the amount — it is a bank transfer started on the last day of the window that clears after registration closes. Calendar the payment two steps ahead of the deadline, not on it.',
          },
        ],
      },
      {
        id: 'paying-from-abroad',
        h2: 'Paying from outside China — the overseas candidate\'s options',
        intro:
          'Most international applicants do not hold a Chinese bank account. Three workable paths exist, ranked by reliability.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**International version of Alipay/WeChat Pay** — both apps support foreign passports and (in many countries) linking international cards. Set the account up BEFORE the registration window opens and test that merchant payments work in your region — card support varies by country.',
              '**International bank transfer** — your home bank sends CNY (or equivalent converted by the bank) to the beneficiary account shown on the portal. Costs a transfer fee (typically $10–40) and takes 3–5 business days; start at least a week before the window closes.',
              '**A trusted person in China** — a friend, relative, or education consultant with Alipay/WeChat pays the order you create. This is common practice and legitimate; just never hand over your account credentials — they pay, you register.',
            ],
          },
          {
            type: 'ul',
            items: [
              '**Exchange-rate reality** — ¥700 converts to roughly $98–105 at recent rates; your bank\'s rate plus fees may push it to $110–140 by the time it lands. Budget that, not the headline number',
              '**Keep every receipt** — the transfer receipt plus the portal payment confirmation together resolve any "paid but not reflected" case',
              '**No credit-card checkout is published** — unlike the SAT or IELTS, the CSCA portal does not advertise a direct Visa/Mastercard flow at launch; assume one of the three channels above',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'If you will apply to Chinese universities at all, setting up an international-version Alipay account is worth an hour of setup — it also pays application fees, deposits, and campus costs later.',
          },
        ],
      },
      {
        id: 'refunds-changes',
        h2: 'Refunds, subject changes, and no-shows',
        intro:
          'Fee policies are handled per session by the registration portal. The safe planning assumptions are conservative.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**No-shows** — no published automatic refund. If you miss the exam, treat the fee as spent and re-register early for the next session',
              '**Subject changes** — handled within the registration window where the portal supports them; after the window closes, no change path is published. This is why the combination must be right before you pay',
              '**Session cancellation** — if a session or center is cancelled by the organizer (rare, e.g., force majeure), the portal announces re-registration or refund handling for affected candidates',
              '**Payment made, portal not reflecting it** — contact portal support with your transfer receipt; resolution is routine but not instant, which is another reason to pay early',
              '**Double payment** — if a retry after a "failed" payment succeeded twice, keep both receipts and dispute one through support immediately',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Planning assumption: CSCA fees are non-refundable by default. Any refund you ever receive is a bonus, not a plan.',
          },
        ],
      },
      {
        id: 'cost-comparison',
        h2: 'How the CSCA compares to other admissions exams',
        intro:
          'Price is one of the CSCA\'s quiet advantages: a full sitting costs less than most single-subject international exams.',
        blocks: [
          {
            type: 'table',
            caption: 'Approximate exam costs (varies by country and level — check current local pricing)',
            columns: ['Exam', 'Typical cost (≈USD)', 'What it covers'],
            rows: [
              ['CSCA (full 4-subject sitting)', '~$98 (¥700 flat)', 'Chinese track + Math + Physics + Chemistry, one session'],
              ['SAT (international)', '~$70 + international fees, often $100–130 total', 'Reading/Writing + Math'],
              ['IELTS (academic)', '~$200–260', 'English proficiency, one sitting'],
              ['TOEFL iBT', '~$180–270', 'English proficiency, one sitting'],
              ['A-Level (per subject, international)', '~$100–250 per subject', 'One subject, one sitting'],
              ['HSK (per level, varies by country)', '~$30–100', 'One Chinese proficiency level'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Per subject, the CSCA is the cheapest** — ~$25/subject at the ¥700 band versus $100+ per A-Level subject',
              '**English-taught applicants still pay twice** — CSCA + IELTS/TOEFL together is the real budget line for most international bachelor\'s applicants (~$300–400 total)',
              '**But retakes multiply everything** — a second CSCA sitting adds another ¥700; budget two sittings, not one',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Figures above are planning approximations — exam fees move with exchange rates and local pricing. The CSCA\'s own numbers (¥450/¥700) are the only ones in the table that are official.',
          },
        ],
      },
      {
        id: 'total-budget',
        h2: 'The real total cost of sitting the CSCA',
        intro:
          'The exam fee is the headline, not the budget. Here is what a complete CSCA attempt actually costs a typical overseas candidate.',
        blocks: [
          {
            type: 'table',
            caption: 'Budget planner — one CSCA attempt, overseas candidate',
            columns: ['Item', 'Cost', 'Notes'],
            rows: [
              ['Registration (4 subjects)', '¥700 (~$100)', 'The official fee band'],
              ['Payment transfer fees', '$0–40', '$0 with Alipay/WeChat; bank transfer adds fees'],
              ['Travel to center (if not local)', '$0–200+', 'Embassy/consulate centers may be in another city'],
              ['Passport (if not held)', '$30–150', 'Required — details must match registration'],
              ['Photos/documents', '~$0–20', 'Per ticket/photo requirements'],
              ['Prep materials', '$0–100', 'Syllabus is free; prep packs vary'],
              ['Realistic planning total', '~$130–500', 'vs $100–130 for the exam fee alone'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Even at the top of the range, one CSCA attempt costs less than half of a single IELTS sitting in many countries — the exam fee itself is almost never the barrier; payment-channel setup is. SICA counselors walk applicants through payment setup before the registration window opens.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does the CSCA exam cost?',
        a: '¥450 CNY for one subject, or ¥700 CNY total for two or more subjects in the same session. The typical candidate sitting a 3–4 subject combination pays ¥700 flat — about US$100. Bank transfer fees and exchange-rate margins come on top for overseas candidates.',
      },
      {
        q: 'Do I pay per subject or per session?',
        a: 'Per session, with a band: one subject costs ¥450, and two or more subjects cost a flat ¥700 total regardless of count. Adding your third or fourth subject at registration costs nothing extra — but a retake in a later session pays the band again.',
      },
      {
        q: 'How do I pay for the CSCA from outside China?',
        a: 'Three options: (1) set up the international version of Alipay or WeChat Pay with a linked foreign card, (2) make an international bank transfer to the account shown on the portal (3–5 business days — start a week before the window closes), or (3) have a trusted person in China pay the order you created. Keep all receipts.',
      },
      {
        q: 'Can I pay with a credit card?',
        a: 'No direct Visa/Mastercard checkout was published at launch — payment runs through Alipay, WeChat Pay, or bank transfer. Some candidates\' international cards do work when linked inside Alipay/WeChat Pay, but support varies by country, so test before relying on it.',
      },
      {
        q: 'Is the CSCA fee refundable if I don\'t attend?',
        a: 'There is no published automatic refund for no-shows — plan as if the fee is non-refundable. If a session or center is cancelled by the organizer, the portal announces refund or re-registration handling for affected candidates.',
      },
      {
        q: 'My payment failed but money left my account — what now?',
        a: 'Keep the bank/app receipt, check whether the portal now shows registered-and-paid (it sometimes lags), and contact portal support with the receipt if it does not. This is exactly why paying early in the window matters — resolution is routine but not instant.',
      },
      {
        q: 'Is the CSCA cheaper than the SAT?',
        a: 'For the full combination, yes: ¥700 (~$98) covers all four subjects in one sitting, while a domestic SAT is ~$70 before international fees that often push it to $100–130. Per subject, the CSCA (~$25) is far cheaper than any international alternative.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm your subject count and fee band',
        text: 'From your target program\'s requirements, count required subjects. One subject = ¥450; anything more = ¥700 total. If two programs you\'re targeting have different combinations, register for the union and confirm both accept it.',
      },
      {
        name: 'Set up your payment channel before the window opens',
        text: 'International Alipay/WeChat Pay users: create and verify the account, and test a small merchant payment. Bank-transfer users: confirm your bank can send CNY and ask about fees and timeline.',
      },
      {
        name: 'Register and select subjects on the portal',
        text: 'Complete account creation, session/center choice, and subject selection. The order only becomes real when payment confirms — start this step early in the window, not the final days.',
      },
      {
        name: 'Pay via the fastest channel you have',
        text: 'Alipay/WeChat for instant confirmation. Bank transfer only with enough days to clear — and screenshot the transfer receipt the moment it is issued.',
      },
      {
        name: 'Verify registered-and-paid status and archive the confirmation',
        text: 'Refresh the portal and confirm the order shows paid. Save the payment confirmation with your application documents — it is your evidence for any dispute through results day.',
      },
      {
        name: 'Budget the surrounding costs, not just the fee',
        text: 'Add transfer fees, possible travel to the test center, and a second-sitting reserve (another ¥700) to your planning spreadsheet. Cash-flow surprises in registration week are avoidable.',
      },
    ],
    ctaTitle: 'Sorting out CSCA payment and budget?',
    ctaSubtitle:
      'SICA counselors confirm your subject combination (so you pay the right band once), review your payment setup before the window opens, and fold exam costs into your full application budget. The first consultation is free.',
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
        description: 'The 8-step portal walkthrough and the mistakes that cost candidates a session.',
      },
      {
        href: '/csca-exam-exemptions',
        label: 'Who must take the CSCA — and who is exempt',
        description: 'HSK-4 exemptions and waivers — sometimes the cheapest exam is the one you don\'t sit.',
      },
    ],
  },
  zh: {
    slug: 'csca-exam-fees',
    eyebrow: '指南 · CSCA 费用',
    title: 'CSCA 考试费用与支付指南——收费标准、支付方式与境外付款',
    description:
      'CSCA 报名费单科 ¥450、两科及以上合计 ¥700，经支付宝、微信支付或银行转账支付。费用明细、境外考生支付方案、退款注意事项，以及与 SAT、雅思的费用对比。',
    subtitle:
      'CSCA 是全球最便宜的标准化入学考试之一：单科 ¥450，同场两科及以上合计 ¥700——典型考生（3-4 科）只付 ¥700。经官方门户以支付宝、微信支付或银行转账支付。真正的成本陷阱不在费用本身，而在支付通道摩擦与退款假设。',
    stats: [
      { value: '¥450', label: '1 科' },
      { value: '¥700', label: '两科及以上（合计）' },
      { value: '3 种', label: '支付方式' },
      { value: '约 $100', label: '全科典型总价' },
    ],
    quickAnswer:
      'CSCA 报名费为单科 450 元人民币，同场两科及以上合计 700 元——即典型 3-4 科考生只付 ¥700（约合 100 美元）。经官方门户以支付宝、微信支付或银行转账支付，且必须在报名窗口内完成（窗口考前约 15 天截止）。无国内支付宝/微信的境外考生应提前数个工作日启动银行转账。缺考无公布的自动退款；支付确认后报名才生效——未支付或掉单的订单不保留考位。',
    keyTakeaways: [
      '按档收费：单科 ¥450，两科及以上合计 ¥700——科目越多单科成本越低',
      '典型考生（3-4 科）付 ¥700（约 100 美元）——远低于 SAT、雅思或 A-Level 考试费',
      '窗口内经支付宝、微信支付或银行转账支付；只有支付确认才锁定考位',
      '没有国内支付账户？在窗口截止前 3-5 个工作日启动银行转账，或请国内的信任之人代付',
      '成绩发布前保留支付凭证——它是任何支付争议的证据',
      '缺考无公布的自动退款；退款、改科等政策按场次由门户处理',
    ],
    sections: [
      {
        id: 'fee-structure',
        h2: 'CSCA 收费结构',
        intro:
          '费用按每场科目数分档，而非逐科计价——这让全科报考的 CSCA 异常便宜。',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA 报名费（每场）',
            columns: ['报考科目数', '费用（人民币）', '≈ 美元', '折合单科'],
            rows: [
              ['1 科', '¥450', '约 $63', '¥450'],
              ['2 科', '¥700', '约 $98', '¥350'],
              ['3 科（典型下限）', '¥700', '约 $98', '约 ¥233'],
              ['4 科（完整组合）', '¥700', '约 $98', '约 ¥175'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**分档即优惠**——单科 ¥450，第二、三、四科几乎不增加成本。为「省钱」只考中文轨几乎总是错误选择',
              '**按场次而非按年**——每场单独缴费；下一场重考再付一次档位费（3 科重考 ¥700）',
              '**不收取的费用**——启动时未公布单独的成绩单寄送费、大学接收 CSCA 成绩的申请费；计算器租赁费也不存在（本就禁用）',
              '**计价货币**——全部以人民币计价；境外考生的银行汇率与转账手续费另计',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '预算法则：每位考生按「每场 ¥700」规划。项目只要求一科就付 ¥450；要求四科也和三科考生一样付 ¥700。',
          },
        ],
      },
      {
        id: 'payment-methods',
        h2: '支付方式——支付宝、微信支付、银行转账',
        intro:
          '门户接受三种支付通道。选哪种取决于你是否有国内支付账户。',
        blocks: [
          {
            type: 'table',
            caption: '支付通道对比',
            columns: ['方式', '到账速度', '适合人群', '注意事项'],
            rows: [
              ['支付宝', '即时', '在华考生或已实名支付宝用户', '支付宝绑外卡在商户支付时可能失败——先小额测试'],
              ['微信支付', '即时', '在华考生或已实名微信支付用户', '与支付宝相同的外卡限制'],
              ['银行转账', '跨境 3-5 个工作日', '无国内支付 App 的境外考生', '必须在窗口截止前数日启动；保留转账回执'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**即时通道最稳**——支付宝与微信支付即时确认，报名状态当场翻转为已支付',
              '**银行转账是兜底**——结账时门户展示收款账户信息；按精确金额转账并保留回执直至门户反映到账',
              '**国内的信任之人可以代付**——支付不像报名那样绑定身份；对方付款，你用本人护照信息完成报名',
              '**支付后核实状态**——无论走哪条通道，门户显示已报名已支付之前报名都不算数；失败的支付会在窗口关闭后悄悄掉单',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '最常见的费用相关失败不是金额——而是窗口最后一天才启动、到账时报名已关闭的银行转账。支付日程要比截止日提前两步，而不是卡在截止日。',
          },
        ],
      },
      {
        id: 'paying-from-abroad',
        h2: '境外付款——海外考生的三条路',
        intro:
          '多数国际申请者没有国内银行账户。三条可行路径，按可靠度排序。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**国际版支付宝/微信支付**——两个 App 都支持外国护照实名，（在许多国家）可绑定国际卡。在报名窗口开启前完成设置，并测试你所在地区的商户支付是否可用——各国卡组织支持度不同。',
              '**跨境银行转账**——由本国银行向门户展示的收款账户汇入人民币（或由银行折算）。手续费通常 $10-40，需 3-5 个工作日；至少在窗口截止前一周启动。',
              '**国内的信任之人**——有支付宝/微信的亲友或留学顾问为你创建的订单付款。这是常见且合规的做法；但绝不要交出账号凭据——对方只管付款，报名用你本人的护照信息完成。',
            ],
          },
          {
            type: 'ul',
            items: [
              '**汇率现实**——¥700 按近期汇率约合 $98-105；加上银行汇率与手续费，到账成本可能到 $110-140。按这个数做预算，而非宣传数字',
              '**保留所有回执**——转账回执加门户支付确认，两者合起来能解决任何「已付未显示」的情况',
              '**未公布银行卡直付**——与 SAT、雅思不同，CSCA 门户启动时未宣传 Visa/Mastercard 直付通道；按上面三条通道之一做预案',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '只要打算申请中国大学，花一小时开通国际版支付宝就值得——后续申请费、押金、校园开销都用得上。',
          },
        ],
      },
      {
        id: 'refunds-changes',
        h2: '退款、改科与缺考',
        intro:
          '费用政策按场次由报名门户处理。安全的规划假设是保守的。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**缺考**——无公布的自动退款。错过考试就把费用当作已支出，尽早报名下一场',
              '**改科**——门户支持的范围内在报名窗口内处理；窗口关闭后没有公布的变更通道。这就是付费前必须定对组合的原因',
              '**场次取消**——若主办方取消某场次或考点（罕见，如不可抗力），门户会为受影响考生公告重新报名或退款安排',
              '**已付款但门户未显示**——携转账回执联系门户支持；处理是常规操作但不即时，这也是要提早付费的又一个理由',
              '**重复扣款**——若「失败」后重试导致扣款两次，保留两张回执并立即通过支持申诉其中一笔',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '规划假设：CSCA 费用默认不可退。任何退回来的款项都是意外之喜，不是计划的一部分。',
          },
        ],
      },
      {
        id: 'cost-comparison',
        h2: 'CSCA 与其他入学考试的费用对比',
        intro:
          '价格是 CSCA 的隐形优势：全科一场的花费低于多数国际考试的单科费用。',
        blocks: [
          {
            type: 'table',
            caption: '考试费用参考（各国各层级有差异——以当地现价为准）',
            columns: ['考试', '典型费用（≈美元）', '覆盖内容'],
            rows: [
              ['CSCA（全科 4 科）', '约 $98（¥700）', '中文轨 + 数学 + 物理 + 化学，一场'],
              ['SAT（国际场）', '约 $70 + 国际附加费，常达 $100-130', '阅读写作 + 数学'],
              ['雅思（学术类）', '约 $200-260', '英语水平，一场'],
              ['托福 iBT', '约 $180-270', '英语水平，一场'],
              ['A-Level（国际场，每科）', '每科约 $100-250', '单科，一场'],
              ['HSK（每级，各国不同）', '约 $30-100', '单一级别汉语水平'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**单科口径 CSCA 最便宜**——¥700 档约合每科 $25，而 A-Level 每科 $100+',
              '**英文授课申请者仍要付两份**——CSCA + 雅思/托福才是多数国际本科申请者的真实预算线（合计约 $300-400）',
              '**重考会让一切翻倍**——第二场 CSCA 再加 ¥700；按两场做预算，别按一场',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '上表为规划近似值——考试费用随汇率与当地定价浮动。表中唯一官方数字是 CSCA 自己的 ¥450/¥700。',
          },
        ],
      },
      {
        id: 'total-budget',
        h2: '考一场 CSCA 的真实总成本',
        intro:
          '考试费是标题，不是预算。这是海外考生一次完整 CSCA 尝试的真实开销。',
        blocks: [
          {
            type: 'table',
            caption: '预算表——海外考生一次 CSCA 尝试',
            columns: ['项目', '费用', '说明'],
            rows: [
              ['报名费（4 科）', '¥700（约 $100）', '官方档位费'],
              ['支付转账手续费', '$0-40', '支付宝/微信为 $0；银行转账另计'],
              ['赴考交通（非本地时）', '$0-200+', '使领馆考点可能在另一座城市'],
              ['护照（如未持有）', '$30-150', '必备——信息须与报名一致'],
              ['照片/材料', '约 $0-20', '按准考证/照片要求'],
              ['备考资料', '$0-100', '大纲免费；备考包价格不一'],
              ['实际规划总价', '约 $130-500', '对比仅考试费的 $100-130'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '即便按区间上限，一次 CSCA 尝试也低于许多国家单场雅思的一半——考试费本身几乎从不构成障碍；构成障碍的是支付通道设置。SICA 顾问在报名窗口开启前协助申请者完成支付设置。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 考试多少钱？',
        a: '单科 450 元人民币，同场两科及以上合计 700 元。典型 3-4 科考生只付 ¥700（约 100 美元）。境外考生的银行手续费与汇率差另计。',
      },
      {
        q: '费用按科收还是按场收？',
        a: '按场次分档：单科 ¥450，两科及以上不论数量合计 ¥700。报名时加第三、四科不增加费用——但下一场重考要再付一次档位费。',
      },
      {
        q: '人在国外怎么付 CSCA 费用？',
        a: '三条路：(1) 开通国际版支付宝或微信支付并绑定外卡；(2) 向门户展示的账户跨境银行转账（3-5 个工作日——窗口截止前一周启动）；(3) 请国内的信任之人为你创建的订单付款。所有回执都要保留。',
      },
      {
        q: '可以用信用卡支付吗？',
        a: '启动时未公布 Visa/Mastercard 直付——支付经支付宝、微信支付或银行转账。部分考生的国际卡绑定在支付宝/微信内可用，但各国支持度不同，不要在没有测试前依赖它。',
      },
      {
        q: '不参加考试可以退款吗？',
        a: '缺考无公布的自动退款——按不可退做规划。若主办方取消场次或考点，门户会为受影响考生公告退款或重新报名安排。',
      },
      {
        q: '支付失败但钱已扣了怎么办？',
        a: '保留银行/App 回执，先看门户是否已显示已报名已支付（有时滞后），未显示则携回执联系门户支持。这正是要提早支付的原因——处理是常规操作但不即时。',
      },
      {
        q: 'CSCA 比 SAT 便宜吗？',
        a: '全科口径是的：¥700（约 $98）覆盖一场四科，而 SAT 国际场约 $70 起加国际附加费常到 $100-130。单科口径 CSCA（约 $25）远低于任何国际替代考试。',
      },
    ],
    howToSteps: [
      {
        name: '确认科目数与费用档',
        text: '按目标项目要求数清科目。单科 = ¥450；更多 = 合计 ¥700。若两个目标项目组合不同，按并集报名并向双方确认可接受。',
      },
      {
        name: '窗口开启前设好支付通道',
        text: '国际版支付宝/微信支付用户：创建并实名账户，测试小额商户支付。银行转账用户：确认本行可汇人民币并问清手续费与时效。',
      },
      {
        name: '在门户完成报名与选科',
        text: '完成账号、场次/考点选择与科目勾选。订单只有支付确认后才生效——在窗口早期启动这一步，别拖到最后几天。',
      },
      {
        name: '用你最快的通道支付',
        text: '支付宝/微信即时确认。银行转账只在有足够到账天数时启动——回执一经出具立即截图保存。',
      },
      {
        name: '核实已报名已支付状态并归档凭证',
        text: '刷新门户确认订单已支付。把支付确认与申请材料放在一起——它是对抗任何争议、直到出分日的证据。',
      },
      {
        name: '把周边成本纳入预算，而不只是考试费',
        text: '把转账手续费、可能的赴考交通、以及第二场备用金（再一个 ¥700）加进规划表。报名周的现金流意外完全可以避免。',
      },
    ],
    ctaTitle: '正在处理 CSCA 付款与预算？',
    ctaSubtitle:
      'SICA 顾问确认你的科目组合（让你一次付对档位）、在窗口开启前复核支付设置，并把考试成本纳入完整申请预算。首次咨询免费。',
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
        description: '门户 8 步操作与让考生损失一场考试的报名错误。',
      },
      {
        href: '/csca-exam-exemptions',
        label: '谁必须参加 CSCA——谁可豁免',
        description: 'HSK-4 豁免与免考路径——最便宜的考试，有时是你不用考的那场。',
      },
    ],
  },
};
