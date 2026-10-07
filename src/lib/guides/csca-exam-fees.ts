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
    title: 'CSCA Exam Fee 2026-27: RMB 450 or 700 & How to Pay',
    description:
      'CSCA exam fee: RMB 450 for one subject, RMB 700 for two or more (official, csca.cn). How to pay from abroad, refunds, and what else to budget.',
    subtitle:
      'The CSCA exam fee is RMB 450 for one subject or RMB 700 total for two or more subjects in the same sitting (official, csca.cn). Math is required for everyone; English-taught applicants usually add 1–2 more subjects, paying the RMB 700 band. Payment runs through the official portal — the real cost traps are payment-channel friction from abroad, not the fee itself.',
    stats: [
      { value: 'RMB 450', label: '1 subject' },
      { value: 'RMB 700', label: '2+ subjects (total)' },
      { value: '6/year', label: 'Sittings per year' },
      { value: 'Online', label: 'Main mode — no travel needed' },
    ],
    quickAnswer:
      'The CSCA exam fee is RMB 450 for one subject or RMB 700 total for two or more subjects in the same sitting — official figures from csca.cn. Math is required for everyone; Physics and/or Chemistry depend on the university and program, and the four-subject Professional Chinese track applies only to Chinese-taught programs. Registration for the November 2026 sitting (14–15 Nov) runs 15–21 October, Beijing time, and the fee must be paid inside that window. There is no published automatic no-show refund — treat the fee as non-refundable when budgeting.',
    keyTakeaways: [
      'Flat banding: RMB 450 for one subject, RMB 700 total for two or more — the per-subject cost falls sharply as you add subjects',
      'Math is required for everyone; English-taught applicants usually sit Math plus 1–2 subjects (RMB 700). Four subjects apply only to Chinese-taught programs',
      'Pay inside the registration window — for the November 2026 sitting that window is 15–21 October (Beijing time); the seat is held only by a confirmed payment',
      'Payment channels reported by applicants: Alipay, WeChat Pay, and bank transfer [verify each on csca.cn before relying on one]',
      'Keep the payment confirmation until results are released — it is your evidence for any payment dispute',
      'No published automatic no-show refund; treat policy questions (refunds, subject changes) as per-session portal matters',
    ],
    sections: [
      {
        id: 'fee-structure',
        h2: 'The CSCA fee structure',
        intro:
          'Fees are banded by subject count per sitting, not per subject — and the subject count depends on your program, not a fixed package.',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA registration fees (per sitting, official: csca.cn)',
            columns: ['Subjects registered', 'Fee (CNY)', 'Who typically sits this'],
            rows: [
              ['1 subject (Math only)', 'RMB 450', 'Programs that require Math alone'],
              ['2 subjects (Math + 1)', 'RMB 700', 'Common for English-taught applicants'],
              ['3 subjects (Math + 2)', 'RMB 700', 'Many English-taught MBBS / science programs'],
              ['4 subjects (incl. Professional Chinese)', 'RMB 700', 'Chinese-taught programs only'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Math is required for everyone.** Physics and/or Chemistry depend on the university and program; Professional Chinese applies only to Chinese-taught programs',
              '**English-taught applicants usually sit Math plus 1–2 subjects** — paying the RMB 700 band. The four-subject combination is a Chinese-taught-program requirement, not the default',
              '**Per sitting, not per year** — each sitting is paid separately; a retake in a later sitting pays the band again',
              '**What is NOT charged** — no separate score-report fee is published, and there is no application fee to universities for receiving CSCA scores',
              '**Fee currency** — all fees are denominated in CNY (RMB); your bank\'s FX rate and any transfer charges come on top for overseas candidates',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Budget rule: plan to pay RMB 700 once per sitting. If your program only requires one subject, you pay RMB 450; if it requires three or four, you pay the same RMB 700 band.',
          },
        ],
      },
      {
        id: 'payment-methods',
        h2: 'Payment methods — what the portal accepts',
        intro:
          'Applicants report paying via Chinese payment channels; confirm the exact channels shown at checkout on csca.cn before relying on one.',
        blocks: [
          {
            type: 'table',
            caption: 'Payment channels reported by applicants [verify each on csca.cn at checkout]',
            columns: ['Method', 'Speed', 'Best for', 'Watch out'],
            rows: [
              ['Alipay [verify]', 'Instant', 'Candidates living in China or with a verified Alipay account', 'Foreign cards on Alipay can fail on merchant payments — test small first'],
              ['WeChat Pay [verify]', 'Instant', 'Candidates living in China or with a verified WeChat Pay account', 'Same foreign-card caveat as Alipay'],
              ['Bank transfer [verify]', 'Days (international)', 'Candidates abroad without Chinese payment apps', 'Must start well before the window closes; keep the transfer receipt'],
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
              '**Exchange-rate reality** — RMB 700 converts to roughly US$100 at recent rates; your bank\'s rate plus fees may push the landed cost higher. Budget that, not the headline number',
              '**Keep every receipt** — the transfer receipt plus the portal payment confirmation together resolve any "paid but not reflected" case',
              '**No credit-card checkout is published** — the CSCA portal does not advertise a direct Visa/Mastercard flow [verify on csca.cn at checkout]; assume one of the channels above',
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
        h2: 'How the CSCA fee compares to other admissions exams',
        intro:
          'The only figures we can state with a source are the CSCA\'s own: RMB 450 for one subject, RMB 700 for two or more, from csca.cn.',
        blocks: [
          {
            type: 'p',
            text: 'For context, international exams such as the SAT, IELTS, TOEFL, A-Levels, and the HSK each carry their own fees that vary by country, year, and testing partner — we deliberately do not quote them here because we cannot source current local pricing for every country. Check each exam\'s official registration page for the fee that applies to you. What is safe to say: the CSCA\'s banded structure means a full multi-subject sitting costs RMB 700 total, which is modest by international exam standards.',
          },
          {
            type: 'ul',
            items: [
              '**English-taught applicants usually pay twice** — CSCA (RMB 450–700) plus an English test if your program requires one; that combination is the real budget line for most international bachelor\'s applicants',
              '**Retakes multiply everything** — a second CSCA sitting adds another band fee; budget two sittings, not one',
            ],
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
              ['Registration (2+ subjects)', 'RMB 700', 'The official fee band (csca.cn)'],
              ['Payment transfer fees', 'Varies by bank', 'Often 0 with Alipay/WeChat; international bank transfer adds fees'],
              ['Travel to a test centre', 'Usually RMB 0', 'The exam is mainly online at home with a live proctor — offline centres only in some countries'],
              ['Passport (if not held)', 'Varies by country', 'Required — details must match registration'],
              ['Prep materials', 'Free options exist', 'Free practice tests and study plans: cscaprep.academy'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Because the exam runs mainly online, most candidates\' total cost is the RMB fee plus payment-channel friction — not travel. SICA counselors walk applicants through payment setup before the registration window opens.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does the CSCA exam cost?',
        a: 'RMB 450 for one subject, or RMB 700 total for two or more subjects in the same sitting (official figures, csca.cn). Math is required for everyone; English-taught applicants usually sit Math plus 1–2 subjects, paying the RMB 700 band. Bank transfer fees and exchange-rate margins come on top for overseas candidates.',
      },
      {
        q: 'Do I pay per subject or per sitting?',
        a: 'Per sitting, with a band: one subject costs RMB 450, and two or more subjects cost a flat RMB 700 total regardless of count. Adding a third or fourth subject at registration costs nothing extra — but a retake in a later sitting pays the band again.',
      },
      {
        q: 'How do I pay for the CSCA from outside China?',
        a: 'Applicants report three routes [verify current channels on csca.cn]: (1) set up the international version of Alipay or WeChat Pay with a linked foreign card, (2) make an international bank transfer to the account shown on the portal — start well before the window closes, or (3) have a trusted person in China pay the order you created. Keep all receipts.',
      },
      {
        q: 'Can I pay with a credit card?',
        a: 'No direct Visa/Mastercard checkout has been published [verify on csca.cn at checkout] — payment is reported to run through Alipay, WeChat Pay, or bank transfer. Some candidates\' international cards work when linked inside Alipay/WeChat Pay, but support varies by country, so test before relying on it.',
      },
      {
        q: 'Is the CSCA fee refundable if I don\'t attend?',
        a: 'There is no published automatic refund for no-shows — plan as if the fee is non-refundable. If a sitting is cancelled by the organizer, the portal announces refund or re-registration handling for affected candidates.',
      },
      {
        q: 'My payment failed but money left my account — what now?',
        a: 'Keep the bank/app receipt, check whether the portal now shows registered-and-paid (it sometimes lags), and contact portal support with the receipt if it does not. This is exactly why paying early in the window matters — resolution is routine but not instant.',
      },
      {
        q: 'Which subjects do I actually pay for?',
        a: 'Math is required for everyone. Physics and/or Chemistry depend on the university and program. Professional Chinese (the four-subject combination) applies only to Chinese-taught programs. Check each target program\'s admission notice before registering — the band means adding subjects is free, but sitting subjects you don\'t need wastes prep time.',
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
    title: 'CSCA 考试费 2026-27：450 或 700 元及支付方法',
    description:
      'CSCA 考试费：单科 450 元人民币，两科及以上 700 元（官方 csca.cn）。境外如何支付、退款政策以及其他预算项。',
    subtitle:
      'CSCA 考试费为单科 450 元人民币，或同场两科及以上合计 700 元（官方 csca.cn）。数学为全员必考；英文授课申请者通常加考 1-2 科，支付 700 元档。缴费经官方门户完成——真正的成本陷阱是境外支付通道的摩擦，不是费用本身。',
    stats: [
      { value: '450 元', label: '1 科' },
      { value: '700 元', label: '两科及以上（合计）' },
      { value: '6 场/年', label: '每年考试场次' },
      { value: '线上', label: '主要模式——无需赶考' },
    ],
    quickAnswer:
      'CSCA 考试费为单科 450 元人民币，或同场两科及以上合计 700 元——官方 csca.cn 口径。数学为全员必考；物理和/或化学取决于大学与项目，四科组合（含专业中文）仅适用于中文授课项目。2026 年 11 月场次（11 月 14-15 日）报名窗口为 10 月 15-21 日（北京时间），费用须在窗口内付清。缺考无公布的自动退款——做预算时按不可退处理。',
    keyTakeaways: [
      '按档收费：单科 450 元，两科及以上合计 700 元——科目越多单科成本越低',
      '数学全员必考；英文授课申请者通常考数学加 1-2 科（700 元）。四科组合仅限中文授课项目',
      '报名窗口内支付——2026 年 11 月场次窗口为 10 月 15-21 日（北京时间）；只有支付确认才锁定考位',
      '考生报告的支付通道：支付宝、微信支付、银行转账 [结账时以 csca.cn 实际显示为准]',
      '成绩发布前保留支付凭证——它是任何支付争议的证据',
      '缺考无公布的自动退款；退款、改科等政策按场次由门户处理',
    ],
    sections: [
      {
        id: 'fee-structure',
        h2: 'CSCA 收费结构',
        intro:
          '费用按每场科目数分档，而非逐科计价——科目数取决于你的项目要求，不是固定套餐。',
        blocks: [
          {
            type: 'table',
            caption: 'CSCA 报名费（每场，官方：csca.cn）',
            columns: ['报考科目数', '费用（人民币）', '典型适用人群'],
            rows: [
              ['1 科（仅数学）', '450 元', '仅要求数学的项目'],
              ['2 科（数学 + 1）', '700 元', '英文授课申请者常见'],
              ['3 科（数学 + 2）', '700 元', '许多英文授课 MBBS / 理工科项目'],
              ['4 科（含专业中文）', '700 元', '仅中文授课项目'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**数学全员必考。**物理和/或化学取决于大学与项目；专业中文仅适用于中文授课项目',
              '**英文授课申请者通常考数学加 1-2 科**——付 700 元档。四科组合是中文授课项目的要求，不是默认',
              '**按场次而非按年**——每场单独缴费；下一场重考再付一次档位费',
              '**不收取的费用**——未公布单独的成绩单寄送费、大学接收 CSCA 成绩的申请费',
              '**计价货币**——全部以人民币计价；境外考生的银行汇率与转账手续费另计',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '预算法则：每场按 700 元规划。项目只要求一科就付 450 元；要求三科或四科也付同样的 700 元档。',
          },
        ],
      },
      {
        id: 'payment-methods',
        h2: '支付方式——门户接受什么',
        intro:
          '考生报告可通过国内支付通道缴费；依赖某一条通道前，先在 csca.cn 结账页确认实际显示的通道。',
        blocks: [
          {
            type: 'table',
            caption: '考生报告的支付通道 [以 csca.cn 结账页实际显示为准]',
            columns: ['方式', '到账速度', '适合人群', '注意事项'],
            rows: [
              ['支付宝 [待核实]', '即时', '在华考生或已实名支付宝用户', '支付宝绑外卡在商户支付时可能失败——先小额测试'],
              ['微信支付 [待核实]', '即时', '在华考生或已实名微信支付用户', '与支付宝相同的外卡限制'],
              ['银行转账 [待核实]', '数日（跨境）', '无国内支付 App 的境外考生', '须远早于窗口截止启动；保留转账回执'],
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
              '**汇率现实**——700 元按近期汇率约合 100 美元；加上银行汇率与手续费，到账成本可能更高。按这个数做预算，而非宣传数字',
              '**保留所有回执**——转账回执加门户支付确认，两者合起来能解决任何「已付未显示」的情况',
              '**未公布银行卡直付**——CSCA 门户未宣传 Visa/Mastercard 直付通道 [在 csca.cn 结账页核实]；按上述通道之一做预案',
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
        h2: 'CSCA 费用与其他入学考试对比',
        intro:
          '我们能给出出处的只有 CSCA 官方数字：单科 450 元、两科及以上 700 元（csca.cn）。',
        blocks: [
          {
            type: 'p',
            text: '作为参照，SAT、雅思、托福、A-Level、HSK 等国际考试各有收费，且因国家、年份与考试机构而异——本文不再逐项引用，因为我们无法为每个国家核实当前当地定价。请查各考试官方报名页获取适用于你的费用。可以放心说的是：CSCA 的分档结构意味着一场多科考试合计 700 元人民币，按国际考试标准属于温和水平。',
          },
          {
            type: 'ul',
            items: [
              '**英文授课申请者通常要付两份**——CSCA（450-700 元）加上项目要求的英语考试；这才是多数国际本科申请者的真实预算线',
              '**重考会让一切翻倍**——第二场 CSCA 再付一次档位费；按两场做预算，别按一场',
            ],
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
              ['报名费（两科及以上）', '700 元', '官方档位费（csca.cn）'],
              ['支付转账手续费', '视银行而定', '支付宝/微信通常为 0；跨境银行转账另计'],
              ['赴考交通', '通常 0 元', '考试以居家线上、真人监考为主——仅部分国家设线下考点'],
              ['护照（如未持有）', '视国家而定', '必备——信息须与报名一致'],
              ['备考资料', '有免费选项', '免费模拟题与学习计划：cscaprep.academy'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '因为考试以线上为主，多数考生的总成本就是人民币报名费加支付通道摩擦——不含差旅。SICA 顾问在报名窗口开启前协助申请者完成支付设置。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'CSCA 考试多少钱？',
        a: '单科 450 元人民币，或同场两科及以上合计 700 元（官方口径，csca.cn）。数学全员必考；英文授课申请者通常考数学加 1-2 科，付 700 元档。境外考生的银行手续费与汇率差另计。',
      },
      {
        q: '费用按科收还是按场收？',
        a: '按场次分档：单科 450 元，两科及以上不论数量合计 700 元。报名时加第三、四科不增加费用——但下一场重考要再付一次档位费。',
      },
      {
        q: '人在国外怎么付 CSCA 费用？',
        a: '考生报告三条路径 [以 csca.cn 结账页实际显示为准]：(1) 开通国际版支付宝或微信支付并绑定外卡；(2) 向门户展示的账户跨境银行转账——远早于窗口截止启动；(3) 请国内的信任之人为你创建的订单付款。所有回执都要保留。',
      },
      {
        q: '可以用信用卡支付吗？',
        a: '未公布 Visa/Mastercard 直付 [在 csca.cn 结账页核实]——考生报告的支付走支付宝、微信支付或银行转账。部分考生的国际卡绑定在支付宝/微信内可用，但各国支持度不同，不要在没有测试前依赖它。',
      },
      {
        q: '不参加考试可以退款吗？',
        a: '缺考无公布的自动退款——按不可退做规划。若主办方取消场次，门户会为受影响考生公告退款或重新报名安排。',
      },
      {
        q: '支付失败但钱已扣了怎么办？',
        a: '保留银行/App 回执，先看门户是否已显示已报名已支付（有时滞后），未显示则携回执联系门户支持。这正是要提早支付的原因——处理是常规操作但不即时。',
      },
      {
        q: '我到底要为哪些科目付费？',
        a: '数学全员必考。物理和/或化学取决于大学与项目。专业中文（四科组合）仅适用于中文授课项目。报名前查每个目标项目的招生通知——分档意味着加科免费，但考不需要的科目浪费备考时间。',
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
