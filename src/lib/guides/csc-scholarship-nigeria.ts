import type { LocalizedGuide } from './types';

/**
 * "CSC scholarship for Nigerian students 2027" — country-specific
 * scholarship guide (Phase 147, SEO Task 5 #2). Target queries:
 * "csc scholarship nigeria", "chinese government scholarship
 * nigerian students", "china scholarship nigeria 2027".
 *
 * Facts: Type B university route is the practical path; the
 * embassy/bilateral channel's current status for Nigeria is
 * [verify]; WAEC/passport name-matching is the classic Nigerian
 * application failure; fraud warning for agents charging for "free"
 * CSC applications.
 */
export const cscNigeriaGuide: LocalizedGuide = {
  en: {
    slug: 'csc-scholarship-nigeria',
    eyebrow: 'GUIDE · NIGERIA',
    title: 'CSC Scholarship for Nigerian Students 2027',
    description:
      'CSC (Chinese Government Scholarship) for Nigerian students 2027: the university (Type B) route, deadlines, CSCA for bachelor\'s, WAEC/passport name-matching, and avoiding agent fraud.',
    subtitle:
      'For Nigerian students, the practical route to the Chinese Government Scholarship (CSC) is usually Type B — applying directly to a Chinese university that nominates you, with deadlines roughly January-April 2027 that vary by university. Bachelor\'s applicants need a CSCA score (next sittings: November 2026, December 2026, January 2027), and every document must match your passport name exactly.',
    stats: [
      { value: 'Type B', label: 'University route (main path)' },
      { value: 'Jan-Apr 2027', label: 'Deadlines (varies by university)' },
      { value: 'CSCA', label: 'Required for bachelor\'s' },
      { value: 'Free', label: 'CSC never charges agents' },
    ],
    quickAnswer:
      'Nigerian students apply for the Chinese Government Scholarship (CSC) mainly through Type B — applying directly to a target Chinese university, which nominates you to CSC. Deadlines fall roughly January-April 2027 and vary by university [verify each target]. The embassy/bilateral channel\'s current availability for Nigeria should be confirmed with the Chinese embassy in Abuja [verify]. Bachelor\'s applicants must submit a CSCA score — sit the November 2026 (register 15-21 October, Beijing time), December 2026, or January 2027 sitting. Two Nigeria-specific rules: every name on every document must match your passport exactly (WAEC records included), and the CSC application itself is free — anyone charging a "guaranteed CSC placement" fee is a fraud.',
    keyTakeaways: [
      'Type B (university route) is the practical path: apply to the university, it nominates you to CSC',
      'Deadlines roughly January-April 2027, set university-by-university [verify each target]; the embassy route\'s status should be confirmed with the embassy [verify]',
      'Bachelor\'s applicants: CSCA score required — next sittings Nov 14-15 2026 (register Oct 15-21), Dec 19-20 2026, Jan 23-24 2027',
      'Name-matching is the classic failure: WAEC certificate, transcript, passport, and bank documents must all carry the identical name',
      'A pre-admission letter from the host university is expected for 2026/27 onward [verify]',
      'CSC applications are free — agents charging for "guaranteed" CSC placement are fraudulent',
    ],
    sections: [
      {
        id: 'routes-nigeria',
        h2: 'Your routes into CSC from Nigeria',
        intro:
          'Two channels exist in theory; in practice, Type B is where most successful Nigerian applicants land.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Type B — Chinese University Program (recommended)** — apply directly to your target university\'s international-student portal; the university nominates you to CSC. Deadlines roughly January-April 2027, set by each university [verify each target]',
              '**Embassy / bilateral channel** — handled through the Chinese embassy in Abuja; whether Nigeria runs an open bilateral CSC batch in the current cycle should be confirmed directly with the embassy [verify]',
              '**Other CSC sub-programs** (China-Africa Friendship, MOFCOM) run their own channels — the CAFP announcement each cycle lists participating countries [verify]',
              '**The routes are not mutually exclusive** — file Type B applications at 3-5 universities and any embassy channel that is open',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Type B puts the university in your corner: the international-student office wants strong applicants and will guide document issues before submission — an advantage the embassy route cannot match.',
          },
        ],
      },
      {
        id: 'name-matching',
        h2: 'The name-matching rule (WAEC, passport, everything)',
        intro:
          'The most common reason Nigerian CSC files stall is a mismatch between the name on the passport and the name on WAEC or university documents.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Pick one canonical name** — exactly as printed in your international passport — and make every document match it: WAEC certificate, transcripts, degree, affidavit-backed name changes included',
              '**WAEC + passport mismatches** (initials, middle-name ordering, hyphenation) trigger verification delays that can outlast the deadline',
              '**Affidavits and newspaper publications** are accepted for name changes in Nigeria, but they must be submitted WITH the documents, not after a query arrives',
              '**Translations** — documents not in English need notarized translations; WAEC certificates are in English already',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Before you submit anything, lay every document side by side and compare names letter by letter. A one-letter difference is a verification flag; two documents with different name orders is a stalled file.',
          },
        ],
      },
      {
        id: 'csca-bachelors',
        h2: 'CSCA for Nigerian bachelor\'s applicants',
        intro:
          'CSC scholarship undergraduate applications require a CSCA score — plan the sitting against your Type B deadlines.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Math is required for everyone**; Physics and/or Chemistry depend on the university and program',
              '**Next confirmed sittings**: Nov 14-15 2026 (register Oct 15-21, Beijing time), Dec 19-20 2026, Jan 23-24 2027',
              '**Mode** — mainly online at home with a live proctor; fee RMB 450 (one subject) / RMB 700 (two or more) at csca.cn',
              '**Free practice** — mocks and study plans for every sitting at https://cscaprep.academy',
            ],
          },
        ],
      },
      {
        id: 'fraud-warning',
        h2: 'Fraud warning: CSC is free, "agents" are not',
        intro:
          'Every cycle, Nigerians lose money to fake "CSC placement agents". The rules are simple.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The CSC application itself costs nothing** — the portal and university channels do not charge an application fee for the scholarship',
              '**No one can sell you a CSC slot** — selection runs through the university and CSC committees; there is no paid fast lane',
              '**Red flags** — "guaranteed scholarship", upfront "processing fees" for CSC, agents asking for your passport to "apply on your behalf"',
              '**Legitimate help exists** — consultants (like SICA) can prepare documents and strategy, but the fee buys preparation, never a promised award',
              '**Verify everything** — deadlines and requirements live on the university\'s own page and csca.cn, not on an agent\'s WhatsApp broadcast',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If anyone promises a guaranteed CSC scholarship for a fee, walk away. Genuine awards come from the CSC system after real review — and no third party can insert you into it.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How do Nigerian students get the CSC scholarship?',
        a: 'Most successfully through Type B: apply directly to a Chinese university (deadlines roughly January-April 2027, set per university [verify]), and the university nominates you to CSC. The embassy/bilateral channel\'s current availability should be confirmed with the Chinese embassy in Abuja [verify].',
      },
      {
        q: 'Do Nigerian bachelor\'s applicants need the CSCA?',
        a: 'Yes — a CSCA score is required for CSC scholarship undergraduate applications. Math is required for everyone; Physics and/or Chemistry depend on the university. Next sittings: Nov 14-15 2026 (register Oct 15-21, Beijing time), Dec 19-20 2026, Jan 23-24 2027. Free practice: cscaprep.academy',
      },
      {
        q: 'My WAEC name differs slightly from my passport — is that a problem?',
        a: 'Yes — it is the most common Nigerian application failure. Every document (WAEC, transcripts, degree, bank statements) must carry the identical name as your passport. If you have formally changed names, submit the affidavit and supporting documents together with the application.',
      },
      {
        q: 'Are there agents who can guarantee my CSC scholarship?',
        a: 'No. The CSC application is free and selection runs through university + CSC review. Anyone charging for a "guaranteed" CSC placement is committing fraud. Legitimate consultants help you prepare documents and strategy — they never sell the award itself.',
      },
      {
        q: 'What documents does a Nigerian CSC application need?',
        a: 'Passport (valid beyond the program), WAEC certificate and/or degree + transcripts with notarized translations where needed, a study plan tailored to each university, two recommendation letters, the official physical-examination form completed by a licensed physician, a police clearance certificate, and the pre-admission letter where expected [verify].',
      },
      {
        q: 'Can I work in China after graduating on a CSC scholarship?',
        a: 'The CSC award covers your study; post-graduation work rights follow Chinese visa policy, not the scholarship. Graduates typically transition through work or other visa categories — check the current rules when the time comes.',
      },
    ],
    howToSteps: [
      {
        name: 'Shortlist 3-5 universities with open Type B windows',
        text: 'Check each target\'s international-student page for its CSC (Type B) deadline — roughly January-April 2027, set per university [verify]. Prioritize programs matching your degree and grades.',
      },
      {
        name: 'Register for the CSCA (bachelor\'s applicants)',
        text: 'Register at csca.cn in the Oct 15-21 window for the Nov 14-15 sitting. Math is required; add Physics/Chemistry only if your target universities ask. Free mocks: cscaprep.academy',
      },
      {
        name: 'Normalize your name across every document',
        text: 'Passport, WAEC, transcripts, degree, affidavits — one identical name. Fix mismatches BEFORE applying; verification queries after submission stall files.',
      },
      {
        name: 'Start university applications in parallel',
        text: 'A pre-admission letter is expected for 2026/27 CSC applications [verify]. Submit university applications as soon as portals open so the letter exists before CSC deadlines.',
      },
      {
        name: 'Prepare the CSC document package',
        text: 'Study plan per university (specific — reference faculty and labs), two recommendation letters, physical exam form by a licensed physician, police clearance, notarized translations where needed.',
      },
      {
        name: 'Submit each Type B application before its deadline',
        text: 'Attach the pre-admission letter (or proof of review), CSCA score where required, and the full document set. Track each university\'s deadline separately.',
      },
      {
        name: 'On success: JW201, X1 visa, departure',
        text: 'Accept the award, receive the admission notice + JW201, apply for the X1 visa at the Chinese visa centre, and convert it to a residence permit within 30 days of arriving in China.',
      },
    ],
    ctaTitle: 'Applying for CSC from Nigeria?',
    ctaSubtitle:
      'SICA counselors pick universities whose Type B windows fit your profile, line up the CSCA sitting, and audit your documents for the name-match and completeness traps. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC Scholarship 2027: complete guide',
        description: 'What CSC covers, the application channels, and the general timeline.',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA exam dates 2026-27',
        description: 'Next sittings and registration windows for bachelor\'s applicants.',
      },
      {
        href: '/scholarships-for/nigeria',
        label: 'Scholarships for Nigerian students',
        description: 'Every scholarship in the SICA catalog open to Nigerian applicants.',
      },
    ],
  },
  zh: {
    slug: 'csc-scholarship-nigeria',
    eyebrow: '指南 · 尼日利亚',
    title: '2027 尼日利亚学生 CSC 奖学金申请指南',
    description:
      '2027 年尼日利亚学生的中国政府奖学金（CSC）：大学（Type B）渠道、截止时间、本科 CSCA 要求、WAEC 与护照姓名一致性问题及防骗提醒。',
    subtitle:
      '对尼日利亚学生而言，申请中国政府奖学金（CSC）的现实路径通常是 Type B——直接向中国大学申请并由其提名，截止约在 2027 年 1-4 月且因校而异。本科申请者需提交 CSCA 成绩（下一批场次：2026 年 11 月、12 月、2027 年 1 月），且所有文件姓名必须与护照完全一致。',
    stats: [
      { value: 'Type B', label: '大学渠道（主路径）' },
      { value: '2027 年 1-4 月', label: '截止（因校而异）' },
      { value: 'CSCA', label: '本科申请者必考' },
      { value: '免费', label: 'CSC 从不向中介收费' },
    ],
    quickAnswer:
      '尼日利亚学生申请中国政府奖学金（CSC）主要走 Type B——直接向目标中国大学申请，由大学向 CSC 提名。截止约在 2027 年 1-4 月且因校而异 [逐校核实]。使馆/双边渠道本周期对尼日利亚是否开放，请直接向中国驻阿布贾使馆确认 [待核实]。本科申请者必须提交 CSCA 成绩——应参加 2026 年 11 月（报名 10 月 15-21 日北京时间）、12 月或 2027 年 1 月场次。两条尼日利亚专属规则：所有文件的姓名必须与护照逐字一致（含 WAEC 记录）；CSC 申请本身免费——任何收取「保证 CSC 名额」费用的都是骗局。',
    keyTakeaways: [
      'Type B（大学渠道）是现实主路径：向大学申请，由大学提名给 CSC',
      '截止约 2027 年 1-4 月，逐校自定 [逐校核实]；使馆渠道状态请向使馆确认 [待核实]',
      '本科申请者：须提交 CSCA 成绩——下一批场次 2026 年 11 月 14-15 日（报名 10 月 15-21 日）、12 月 19-20 日、2027 年 1 月 23-24 日',
      '姓名一致是经典失败点：WAEC 证书、成绩单、护照、银行文件的姓名必须完全相同',
      '2026/27 起预计需接收大学预录取函 [待核实]',
      'CSC 申请免费——收取「保证录取」费用的中介均为欺诈',
    ],
    sections: [
      {
        id: 'routes-nigeria',
        h2: '尼日利亚申请者的 CSC 渠道',
        intro:
          '理论上两条渠道；实践中多数成功的尼日利亚申请者走 Type B。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Type B——中国大学项目（推荐）**——直接向目标大学国际生门户申请，大学向 CSC 提名。截止约 2027 年 1-4 月，逐校自定 [逐校核实]',
              '**使馆/双边渠道**——经中国驻阿布贾使馆办理；本周期尼日利亚是否有公开双边批次请直接向使馆确认 [待核实]',
              '**其他 CSC 子项目**（中非友谊、MOFCOM）走各自渠道——每期公告列出参与国 [待核实]',
              '**渠道不互斥**——可同时向 3-5 所大学提交 Type B，并行任何开放的使馆渠道',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Type B 让大学站在你这边：国际学生办公室希望招到强申请者，会在提交前帮你纠正材料问题——这是使馆渠道给不了的优势。',
          },
        ],
      },
      {
        id: 'name-matching',
        h2: '姓名一致规则（WAEC、护照及一切文件）',
        intro:
          '尼日利亚 CSC 材料最常见的卡壳原因：护照姓名与 WAEC 或大学文件不一致。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**确定一个规范姓名**——与国际护照逐字一致——并让所有文件匹配：WAEC 证书、成绩单、学位证、公证件更名文件',
              '**WAEC 与护照不一致**（缩写、中间名顺序、连字符）会触发核验延迟，往往拖过截止日',
              '**更名宣誓书与报纸公示**在尼日利亚被承认，但必须随材料一并提交，而不是等核验质询后补',
              '**翻译**——非英文文件需公证翻译；WAEC 证书本身即英文',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '提交前把所有文件并排摊开，逐字母比对姓名。一个字母的差异就是一个核验标记；两份文件姓名顺序不同就是一份被卡住的材料。',
          },
        ],
      },
      {
        id: 'csca-bachelors',
        h2: '尼日利亚本科申请者的 CSCA',
        intro:
          'CSC 奖学金本科申请须提交 CSCA 成绩——把场次对准 Type B 截止来规划。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**数学全员必考**；物理和/或化学取决于大学与项目',
              '**已确认场次**：2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日',
              '**模式**——以居家线上、真人监考为主；费用单科 450 元、两科及以上 700 元（csca.cn）',
              '**免费练习**——每场次模拟与学习计划：https://cscaprep.academy',
            ],
          },
        ],
      },
      {
        id: 'fraud-warning',
        h2: '防骗提醒：CSC 免费，「中介」不免费',
        intro:
          '每个申请季都有尼日利亚学生被假「CSC 安排中介」骗钱。规则很简单。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSC 申请本身不收费**——门户与大学渠道对该奖学金不收申请费',
              '**没人能卖给你 CSC 名额**——评选经大学与 CSC 委员会，没有付费快车道',
              '**危险信号**——「保证奖学金」、CSC 的预付「处理费」、要你护照「代办申请」的中介',
              '**正当协助是存在的**——顾问（如 SICA）可帮你备材料、定策略，但费用买到的是准备，绝非录取承诺',
              '**一切以官方为准**——截止与要求只看大学官网与 csca.cn，不看中介的 WhatsApp 群发',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '任何人承诺付费保 CSC 奖学金，立刻离开。真实资助来自 CSC 系统的真实评审——没有任何第三方能把你插进去。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '尼日利亚学生怎么拿到 CSC 奖学金？',
        a: '多数走 Type B：直接向中国大学申请（截止约 2027 年 1-4 月，逐校自定 [待核实]），由大学提名给 CSC。使馆/双边渠道本周期是否开放请向中国驻阿布贾使馆确认 [待核实]。',
      },
      {
        q: '尼日利亚本科申请者需要 CSCA 吗？',
        a: '需要——CSC 奖学金本科申请必须提交 CSCA 成绩。数学全员必考；物理和/或化学因校而异。下一批场次：2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日。免费练习：cscaprep.academy',
      },
      {
        q: 'WAEC 姓名与护照略有出入——有问题吗？',
        a: '有——这是尼日利亚申请最常见的失败。所有文件（WAEC、成绩单、学位、银行文件）的姓名必须与护照完全一致。若已正式更名，请把宣誓书与证明随申请一并提交。',
      },
      {
        q: '有中介能保证我拿到 CSC 奖学金吗？',
        a: '没有。CSC 申请免费，评选经大学 + CSC 评审。任何收取「保证名额」费用的都是欺诈。正当顾问帮你备材料定策略——绝不出售奖项本身。',
      },
      {
        q: '尼日利亚 CSC 申请需要哪些材料？',
        a: '护照（有效期覆盖项目期）、WAEC 证书和/或学位 + 成绩单（按需公证翻译）、按校定制的学习计划、两封推荐信、执业医师填写的官方体检表、无犯罪证明，以及按需的预录取函 [待核实]。',
      },
      {
        q: 'CSC 奖学金毕业后能在中国工作吗？',
        a: 'CSC 资助覆盖学业；毕业后的工作权利取决于中国签证政策而非奖学金。毕业生通常经工作或其他签证类别过渡——届时以现行规则为准。',
      },
    ],
    howToSteps: [
      {
        name: '筛选 3-5 所 Type B 窗口开放的大学',
        text: '查每所目标大学国际生页面的 CSC（Type B）截止——约 2027 年 1-4 月，逐校自定 [待核实]。优先匹配你学位与成绩的项目。',
      },
      {
        name: '报名 CSCA（本科申请者）',
        text: '在 10 月 15-21 日窗口到 csca.cn 报名 11 月 14-15 日场次。数学必考；仅当目标大学要求时加考物理/化学。免费模拟：cscaprep.academy',
      },
      {
        name: '统一所有文件的姓名',
        text: '护照、WAEC、成绩单、学位、宣誓书——一个完全相同的姓名。申请前修正好不一致；提交后的核验质询会卡住材料。',
      },
      {
        name: '并行启动大学申请',
        text: '2026/27 起 CSC 申请预计需预录取函 [待核实]。门户一开放就提交大学申请，确保函件赶在 CSC 截止前到位。',
      },
      {
        name: '准备 CSC 材料包',
        text: '按校定制学习计划（具体提及教师与实验室）、两封推荐信、执业医师体检表、无犯罪证明、按需公证翻译。',
      },
      {
        name: '按各校截止提交 Type B 申请',
        text: '附预录取函（或审核中证明）、要求的 CSCA 成绩与完整材料。逐校跟踪截止。',
      },
      {
        name: '获资助后：JW201、X1 签证、出发',
        text: '接受资助、领取录取通知 + JW201、在中国签证中心办 X1，抵华后 30 天内换发居留许可。',
      },
    ],
    ctaTitle: '正在从尼日利亚申请 CSC？',
    ctaSubtitle:
      'SICA 顾问挑选 Type B 窗口匹配你背景的大学、对准 CSCA 场次、并检查材料的姓名一致与完整性陷阱。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/chinese-government-scholarship-csc',
        label: 'CSC 奖学金 2027 完全指南',
        description: 'CSC 覆盖内容、申请渠道与通用时间线。',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA 考试时间 2026-27',
        description: '本科申请者的下一批场次与报名窗口。',
      },
      {
        href: '/scholarships-for/nigeria',
        label: '尼日利亚学生奖学金',
        description: 'SICA 目录中面向尼日利亚申请者的全部奖学金。',
      },
    ],
  },
};
