import type { LocalizedGuide } from './types';

/**
 * "Health insurance for international students in China" — process
 * guide. Target queries: "china international student insurance",
 * "ping an international student insurance", "china health insurance
 * for students", "china medical insurance foreigner", "china student
 * insurance claim", "china international student medical".
 *
 * Every international student in China is required by the Ministry of
 * Education to carry medical insurance for the entire duration of
 * study — the practical university-endorsed plan is Ping An's
 * Comprehensive Insurance & Protection Scheme for Foreigners Staying
 * in China (¥800/12-month standard). This guide walks through
 * what's covered, how to claim, and the upgrade options for
 * international students who want richer coverage.
 */
export const healthInsuranceGuide: LocalizedGuide = {
  en: {
    slug: 'health-insurance',
    eyebrow: 'GUIDE · HEALTH INSURANCE',
    title: 'Health Insurance for International Students in China (2026)',
    description:
      "China's Ministry of Education requires every international student to carry health insurance. The standard Ping An plan costs ¥800/year; here's exactly what it covers, how to claim, and when to upgrade.",
    subtitle:
      "Mandatory, modest, and misunderstood — here's how to make sure you're covered, claim without surprises, and decide if you need to upgrade.",
    stats: [
      { value: '¥800/yr', label: 'Ping An basic plan (12 mo)' },
      { value: '400-810-5119', label: 'Claims + 24/7 hotline' },
      { value: 'Public', label: 'Hospitals covered (mainland)' },
      { value: 'Required', label: 'For university registration' },
    ],
    quickAnswer:
      "Every international student in China is required by the Ministry of Education to carry medical insurance for the entire planned period of study. The standard university-endorsed plan is Ping An's Comprehensive Insurance & Protection Scheme for Foreigners Staying in China, costing ¥800 for 12 months or ¥400 for 6 months. It covers accidental injury, major-disease hospitalization, and emergency medical aid at public hospitals in mainland China. You buy it on registration day (or online before you arrive), and claims are filed by paying upfront at the hospital, collecting stamped invoices + medical records, then submitting them to Ping An by phone or through your university's international office. For richer coverage (private hospitals, dental, mental health, repatriation, pre-existing conditions), upgrade to an international plan (Cigna, AXA, Allianz, MSH) for $800-3,000/year.",
    keyTakeaways: [
      "Health insurance is mandatory — universities will not register you without it",
      "The standard plan is Ping An's Comprehensive Scheme (¥800/12 months, ¥400/6 months)",
      "Ping An basic covers accidental injury + major-disease hospitalization + emergency aid at public hospitals",
      "Always go to a public hospital; skip VIP / international / special-needs departments (not covered)",
      'Claims: pay upfront, collect stamped invoices + medical records, submit to Ping An (400-810-5119) for reimbursement',
      "Network hospitals (公立医院) can offer advance payment (垫付) for hospitalization — call the hotline first",
      "For private hospitals, dental, mental health, or pre-existing conditions, upgrade to an international plan",
    ],
    sections: [
      {
        id: 'is-it-mandatory',
        h2: 'Is health insurance mandatory for international students in China?',
        intro:
          "Yes — and your university will refuse to register you without it. The Ministry of Education has required it since the 2010s; every Chinese university enforces it as part of enrollment.",
        blocks: [
          {
            type: 'p',
            text: "The regulation is straightforward: every international student holding an X1 or X2 visa who is enrolled in a degree or non-degree program at a Chinese university must be covered by medical insurance for the entire planned period of study. Universities check the insurance certificate during registration, and students who fail to buy insurance within the deadline are not allowed to enroll. Students who let their coverage lapse mid-program are subject to suspension or dismissal.",
          },
          {
            type: 'h3',
            text: 'Why the rule exists',
            body:
              "China's public healthcare system is not free for foreigners. International students who arrive uninsured face the full cost of any medical treatment — and a single serious accident or illness can run into six figures of yuan. The insurance rule protects students from financial ruin and reduces the legal exposure of universities.",
          },
          {
            type: 'callout',
            tone: 'info',
            text: "Even short-term language students (1 semester) need insurance. Confucius Institute programs, summer schools, and exchange students are all subject to the same rule.",
          },
        ],
      },
      {
        id: 'ping-an-basic',
        h2: 'The standard plan: Ping An Comprehensive Scheme',
        intro:
          "Ping An is the Ministry of Education's recommended insurer. Almost every Chinese university has an institutional agreement with Ping An, and the registration-day insurance desk is the easiest way to buy.",
        blocks: [
          {
            type: 'table',
            caption: "Ping An Comprehensive Insurance & Protection Scheme (2026)",
            columns: ['Item', 'Details', 'Notes'],
            rows: [
              ['Insurer', 'Ping An Insurance (中国平安)', 'Largest insurer by premium volume in China'],
              ['Premium (12 months)', '¥800', 'Payable in RMB on registration day'],
              ['Premium (6 months)', '¥400', 'For short-term programs'],
              ['Accidental death / disability', 'Up to ¥100,000 lump sum', 'Worldwide (incl. home country travel)'],
              ['Accidental medical (outpatient)', 'Up to ¥10,000/year', 'Public hospitals only, mainland China'],
              ['Major disease hospitalization', 'Up to ¥400,000/year', 'Cancer, cardiac, stroke, etc.'],
              ['Emergency medical aid / evacuation', 'Included', 'Call 400-810-5119'],
              ['Hospital network', 'Public hospitals nationwide', 'Excludes HK / Macao / Taiwan'],
              ['Excluded departments', 'VIP, international, special-needs', 'You pay out of pocket at these'],
            ],
          },
          {
            type: 'h3',
            text: 'How to buy',
            body:
              "Three options: (1) Buy at the registration-day insurance desk on campus — most common, takes 10 minutes, you get a paper certificate and Ping An service card. (2) Buy online through the Ping An portal (lxs.pingan.com) before you travel — useful if you want coverage to start on your arrival day rather than registration day. (3) Buy through your university international office — they bundle it with tuition or housing deposit in some cases.",
          },
        ],
      },
      {
        id: 'what-is-covered',
        h2: "What's actually covered — and what's not",
        intro:
          "Ping An basic is good enough for emergencies, but the coverage has limits that bite if you have specific medical needs. Read the exclusions carefully before you assume you're covered.",
        blocks: [
          {
            type: 'h3',
            text: 'Covered scenarios',
            body:
              'Accidental injury (broken bone, sprain, burn, road accident) is fully covered for outpatient treatment up to ¥10,000/year. Major-disease hospitalization (cancer, cardiac event, stroke, organ failure) is covered up to ¥400,000/year — the cap is high enough to handle most serious conditions at public hospitals. Emergency medical aid and evacuation within mainland China is included, and the 400 hotline is staffed 24/7 with English-speaking agents.',
          },
          {
            type: 'h3',
            text: 'Common exclusions',
            body:
              "Pre-existing conditions are not covered. Dental is excluded except for emergency extraction. Vision (eyeglasses, contact lenses, LASIK) is excluded. Mental health counseling and psychiatric care are not covered. Cosmetic surgery, fertility treatment, and maternity are excluded. High-risk activities (scuba, skydiving, mountaineering, martial arts competitions, motor racing) are excluded. Injuries sustained while working part-time (勤工助学) are explicitly excluded — a critical gap for students planning to work on campus. Treatment outside mainland China is excluded. VIP wards, international departments, and special-needs clinics are not covered even at public hospitals.",
          },
          {
            type: 'callout',
            tone: 'warning',
            text: "Part-time work injuries are a real gap. If you plan to work on campus (research assistant, TA, library assistant) or do an internship, the Ping An basic plan will not cover you on the job. See the upgrade section below.",
          },
        ],
      },
      {
        id: 'how-to-claim',
        h2: 'How to claim: step by step',
        intro:
          "Ping An claims follow a 'pay-then-reimburse' model at non-network hospitals, and an 'advance-payment' model at network hospitals. Either way, the process is paperwork-heavy but reliable.",
        blocks: [
          {
            type: 'ol',
            items: [
              '**Get sick or injured** — go to a public hospital (公立医院). Skip VIP / international / special-needs departments; treatment there is not covered.',
              '**At registration** — give your name (matching your passport exactly) and tell the desk you have "商业保险" (commercial insurance) or "自费" (self-paid).',
              '**See a normal-department doctor** — not VIP, not international. Ask the doctor to write a 门诊病历 (outpatient medical record) at every visit.',
              '**Pay upfront** — keep every stamped invoice (发票, with 2 stamps), test reports, and prescriptions. Lost invoices cannot be reimbursed.',
              '**For hospitalization** — call 400-810-5119 first. If the hospital is in Ping An\'s network, they arrange advance payment (垫付). If not, you pay and claim after discharge.',
              '**Collect discharge documents** — original stamped invoices, detailed medical expenditure sheet, discharge summary, and medical records copy.',
              '**Submit the claim** — bring the documents to your university\'s international student insurance assistant, who will review and forward to Ping An. Or call 400-810-5119 to start a claim directly.',
              '**Receive reimbursement** — Ping An transfers to your Chinese bank account (provide bank card info: account name, number, branch). Processing: 10-30 working days.',
            ],
          },
          {
            type: 'h3',
            text: 'Documentation checklist for a clean claim',
            body:
              "Five items: (1) Original invoices with two stamps (fapiao), (2) detailed medical expenditure sheet (费用明细清单), (3) discharge summary or outpatient medical record (病历), (4) bank card information printout (go to your bank with passport and card, ask for 银行卡客户信息表), (5) accident description if applicable (for accidental injury claims, write what happened and sign). If your invoice name differs from your passport name, attach a confirmation that they're the same person.",
          },
          {
            type: 'callout',
            tone: 'info',
            text: "Save digital copies of every invoice and medical record the day you receive them. Phone photos are fine as backup. Ping An claims are processed fast when documentation is complete; missing documents add 2-4 weeks.",
          },
        ],
      },
      {
        id: 'network-hospitals',
        h2: "Network hospitals vs non-network: what's the difference",
        intro:
          "Ping An's network hospitals are public hospitals that have a billing agreement with the insurer. Going to a network hospital unlocks advance payment for hospitalization; going elsewhere means you pay everything and claim later.",
        blocks: [
          {
            type: 'table',
            caption: 'Network vs non-network public hospital',
            columns: ['Aspect', 'Network hospital', 'Non-network hospital'],
            rows: [
              ['Outpatient', 'Pay upfront, claim later', 'Pay upfront, claim later'],
              ['Hospitalization', 'Ping An can pay the hospital directly (垫付)', 'You pay the full amount, claim after discharge'],
              ['English-speaking staff', 'Usually yes at tier-2 cities and up', 'Less common'],
              ['International department', 'Skip — not covered', 'Skip — not covered'],
              ['How to find one', 'lxs.pingan.com → 网络医院 list, or call 400-810-5119', 'Any public hospital in mainland China'],
            ],
          },
          {
            type: 'h3',
            text: "The major international-student cities have good coverage",
            body:
              "Beijing (Peking Union Medical College Hospital, Beijing Tiantan Hospital, China-Japan Friendship Hospital), Shanghai (Huashan, Ruijin, Zhongshan), Guangzhou (First Affiliated Hospital of Sun Yat-sen, Nanfang Hospital), Wuhan (Tongji, Union), Xi'an (Xijing, Tangdu), and Nanjing (Drum Tower, Gulou) all have Ping An network hospitals with international-patient coordinators. Your university international office will have a local-network list for the hospitals closest to campus.",
          },
        ],
      },
      {
        id: 'when-to-upgrade',
        h2: "When to upgrade to an international plan",
        intro:
          "Ping An basic is fine for emergencies. If you have ongoing health needs, want private-hospital access, or want to be covered outside mainland China, an international plan is worth the cost.",
        blocks: [
          {
            type: 'h3',
            text: 'Reasons to upgrade',
            body:
              "(1) Pre-existing conditions — diabetes, asthma, mental health, ongoing therapy. Ping An excludes these; international plans offer coverage with moratorium or with loading. (2) Private / international hospital preference — VIP wings, English-speaking doctors, faster appointments, Western-style care. Beijing United Family, Parkway Health, Jiahui International are common choices. (3) Dental and vision — cleanings, fillings, glasses, contact lenses. (4) Mental health — counseling, therapy sessions, psychiatric care. (5) Coverage outside mainland China — weekend trips to Hong Kong, Japan, Korea, or trips home. (6) Maternity — if you or your spouse is planning a pregnancy during the program. (7) Sports and high-risk activities.",
          },
          {
            type: 'h3',
            text: 'The major international insurers in China',
            body:
              'Cigna Global (4 plan tiers, 24/7 multilingual support, US-excluding global coverage, $1,500-4,000/year for students), AXA (global, customizable, evacuation included), Allianz Care (broad network, modular riders), MSH (founded in China, strong local network, Chinese + English support), NOW Health (student-specific plans, mobile app claims), William Russell (annual renewal, 4,000+ hospital network), and Blue Cross Blue Shield Global Solutions (US-friendly for students who travel home). Most have student-specific plans starting at $800-1,500/year.',
          },
          {
            type: 'table',
            caption: "Ping An basic vs typical international plan",
            columns: ['Feature', 'Ping An basic (¥800)', 'International plan ($1,500)'],
            rows: [
              ['Public hospital coverage', 'Yes', 'Yes'],
              ['Private / international hospital', 'No', 'Yes'],
              ['Dental + vision', 'No', 'Optional rider'],
              ['Mental health', 'No', 'Yes'],
              ['Pre-existing conditions', 'Excluded', 'Moratorium or loading'],
              ['Maternity', 'No', 'Optional rider'],
              ['Coverage outside mainland China', 'No', 'Yes (varies by plan)'],
              ['English claims process', 'Limited (hotline OK)', 'Full'],
              ['Advance payment network', 'Ping An network', 'Insurer network, often larger'],
            ],
          },
        ],
      },
      {
        id: 'campus-clinic',
        h2: 'The campus clinic: your first stop for everything minor',
        intro:
          "Every Chinese university has a campus health clinic (校医院). For 90% of student health needs — colds, flu, stomach bugs, minor injuries, vaccinations, basic prescriptions — the campus clinic is faster, cheaper, and Ping An-covered.",
        blocks: [
          {
            type: 'h3',
            text: 'What the campus clinic handles',
            body:
              'Common cold and flu, stomach upsets, headaches, minor cuts and burns, sprains, basic lab tests, blood pressure checks, vaccinations (including the free flu shot most universities offer in October-November), tuberculosis screening (required for residence permit), women\'s health consultations, mental health counseling (most large universities now have a counselor on staff). The campus clinic can write referrals to specialist departments at network hospitals if you need more advanced care.',
          },
          {
            type: 'h3',
            text: 'How to use it',
            body:
              'Bring your student ID and Ping An insurance certificate. Most clinics operate Monday-Friday 8:00-17:00 with limited weekend hours. The consultation fee is nominal (¥5-20). Prescriptions are filled at the clinic pharmacy or at a hospital pharmacy. For anything beyond minor issues, the campus clinic writes a 转诊单 (referral) to a network hospital. Without a referral, Ping An may reduce your reimbursement or deny the claim — always start at the campus clinic for non-emergency issues.',
          },
          {
            type: 'callout',
            tone: 'success',
            text: "The campus clinic is the right starting point even if you think your issue is serious. They can write same-day referrals to a network hospital specialist, and the referral paper smooths the reimbursement process.",
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is health insurance mandatory for international students in China?',
        a: "Yes. The Ministry of Education requires every international student to carry medical insurance for the entire planned period of study. Universities will not register you without proof of insurance, and students who let their coverage lapse face suspension or dismissal. The rule applies to degree students, language students, exchange students, and summer-school attendees.",
      },
      {
        q: "How much does Ping An's basic plan cost?",
        a: "¥800 for 12 months or ¥400 for 6 months. The plan is the Ministry of Education's recommended scheme and is available at every Chinese university's international student services desk on registration day. You can also buy it online at lxs.pingan.com before you travel.",
      },
      {
        q: 'What does Ping An basic cover?',
        a: "Accidental injury (outpatient up to ¥10,000/year), major-disease hospitalization (up to ¥400,000/year, including cancer, cardiac, stroke), and 24/7 emergency medical aid. Treatment must be at a public hospital in mainland China; VIP, international, and special-needs departments are not covered. Pre-existing conditions, dental, vision, mental health, and maternity are excluded.",
      },
      {
        q: "Can I go to a private or international hospital?",
        a: "Not under Ping An basic. If you want to use Beijing United Family, Parkway Health, Jiahui International, or another private/international facility, you need an international plan (Cigna, AXA, Allianz, MSH, NOW Health). These cost $800-4,000/year depending on coverage level.",
      },
      {
        q: 'How do I file a claim?',
        a: "Pay upfront at the hospital, collect original stamped invoices (with 2 stamps), the detailed expenditure sheet, the discharge summary or outpatient medical record, and your bank card information. Submit through your university international student insurance assistant, or call Ping An directly at 400-810-5119. Reimbursement is transferred to your Chinese bank account within 10-30 working days.",
      },
      {
        q: 'What is a network hospital?',
        a: "A public hospital that has a billing agreement with Ping An. Network hospitals can offer advance payment (垫付) for hospitalization — you call 400-810-5119 first, Ping An pays the hospital directly. Non-network public hospitals also accept Ping An basic but require you to pay upfront and claim after discharge. Your university international office has a list of nearby network hospitals.",
      },
      {
        q: 'Does Ping An cover part-time work injuries?',
        a: "No. Work-study (勤工助学) injuries are explicitly excluded from the basic plan. If you work on campus (TA, research assistant, library staff) or do an internship, consider an international plan that includes work-injury coverage. Some universities offer supplemental work-injury insurance for student employees — ask your international office.",
      },
      {
        q: 'Can I keep using my home-country insurance instead?',
        a: "In theory, some universities accept foreign insurance if it meets Chinese coverage requirements. In practice, almost all universities require you to buy Ping An (or an equivalent) regardless of what you already have. Foreign plans usually do not meet the MoE standard for public-hospital coverage, direct billing in mainland China, and Chinese-language claims support.",
      },
    ],
    howToSteps: [
      {
        name: 'Confirm the requirement with your university',
        text: "Your admission package or international office will list the accepted insurance plans. Most universities mandate Ping An; some accept equivalent international plans.",
      },
      {
        name: 'Buy Ping An basic on registration day (or before)',
        text: "Visit the insurance desk at the international student services office, or buy online at lxs.pingan.com. Cost: ¥800/12 months or ¥400/6 months. Keep the paper certificate and the Ping An service card.",
      },
      {
        name: 'For ongoing health needs, upgrade to an international plan',
        text: "If you have pre-existing conditions, want private-hospital access, need dental/vision/mental-health coverage, or travel frequently, get a Cigna / AXA / Allianz / MSH / NOW Health international plan ($800-4,000/year).",
      },
      {
        name: 'For non-emergencies, start at the campus clinic',
        text: "Bring your student ID and Ping An certificate. The campus clinic handles 90% of student health needs for ¥5-20 per visit and can write referrals to network hospitals for specialist care.",
      },
      {
        name: 'For emergencies or serious issues, go to a public hospital',
        text: "Skip VIP / international / special-needs departments. Register under your passport name, choose 商业保险 (commercial insurance) or 自费 (self-paid) at the desk, and see a normal-department doctor.",
      },
      {
        name: 'For hospitalization, call the Ping An hotline first',
        text: "400-810-5119 (24/7, English support). If the hospital is a Ping An network hospital, they arrange advance payment. If not, pay upfront and claim after discharge.",
      },
      {
        name: 'Collect every document the day you receive it',
        text: "Stamped original invoices (with 2 stamps), detailed expenditure sheet, discharge summary, outpatient medical record, lab reports, prescriptions. Digital backups (phone photos) are essential.",
      },
      {
        name: 'File the claim within 30 days',
        text: "Submit documents through your university international student insurance assistant, or call 400-810-5119. Provide your Chinese bank card information. Reimbursement: 10-30 working days.",
      },
    ],
    ctaTitle: 'Need help with the medical insurance paperwork?',
    ctaSubtitle:
      'SICA can pre-confirm your university insurance requirements, walk you through the Ping An signup, and advise on whether you need an international upgrade.',
    ctaApplyLabel: 'Start with free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/application',
        label: 'How to apply',
        description: 'The full application timeline, document checklist, and scholarship paths.',
      },
      {
        href: '/guides/visa',
        label: 'Student visa (X1 / X2)',
        description: 'Document checklist, fees, processing times, and residence permit rules.',
      },
      {
        href: '/guides/cost-of-living',
        label: 'Cost of living',
        description: 'Real monthly budgets for housing, food, transport, and healthcare in Chinese cities.',
      },
    ],
  },

  zh: {
    slug: 'health-insurance',
    eyebrow: '指南 · 医疗保险',
    title: '中国留学生医疗保险完整指南（2026）',
    description:
      '中国教育部要求每位国际学生购买医疗保险。平安基础方案¥800/年——本文详解保障范围、理赔流程，以及何时升级到国际计划。',
    subtitle:
      '强制、便宜、被误解——本文帮你确保有保障、顺利理赔，并判断是否需要升级。',
    stats: [
      { value: '¥800/年', label: '平安基础方案（12个月）' },
      { value: '400-810-5119', label: '理赔+24小时热线' },
      { value: '公立医院', label: '保障范围（中国大陆）' },
      { value: '强制', label: '新生注册必备' },
    ],
    quickAnswer:
      '中国教育部要求每位国际学生在整个学习期间必须购买医疗保险。教育部推荐的标准方案是中国平安的"来华人员综合保险保障计划"，12个月¥800或6个月¥400。覆盖意外伤害、大病住院和紧急医疗救援，可在大陆公立医院使用。注册当天现场购买（或提前线上购买）。理赔流程：先垫付、收集盖章发票+病历，然后通过学校国际办或拨打400-810-5119向平安提交申请，平安审核后把报销款打入你在中国银行卡。如需更全面保障（私立医院、牙科、心理咨询、原有疾病、回国保障），需升级到国际计划（Cigna、AXA、Allianz、MSH），$800-3,000/年。',
    keyTakeaways: [
      '医疗保险是强制要求——没有保险学校不予注册',
      '标准方案是平安综合保险（¥800/12个月，¥400/6个月）',
      '平安基础覆盖意外+大病住院+紧急救援，仅限公立医院',
      '必须去公立医院普通部，特需/外宾/国际部不能报销',
      '理赔：先垫付、收齐盖章发票+病历，提交平安（400-810-5119）报销',
      '网络医院可申请住院垫付——先打热线电话',
      '需要私立医院、牙科、心理咨询、原有疾病保障，可升级国际计划',
    ],
    sections: [
      {
        id: 'is-it-mandatory',
        h2: '中国留学生医疗保险是强制的吗？',
        intro:
          '是的——没有保险学校不会让你注册。这是教育部规定，每所中国大学都在入学时强制执行。',
        blocks: [
          {
            type: 'p',
            text: '规定很直接：持X1或X2签证、在中方院校就读学位或非学位项目的每位国际学生，在整个学习期间必须有医疗保障。各校在注册时核验保险证明；未在规定期限内购买的学生不予注册，已在校的学生如保险中断将面临休学或退学处理。',
          },
          {
            type: 'h3',
            text: '为什么有这个规定',
            body:
              '中国公立医疗体系对外籍人士并非免费。未购买保险的国际学生需自行承担所有医疗费用——一次严重意外或重疾费用可达数十万元。保险规定保护学生免于因病返贫，也降低了学校的法律风险。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '即便是短期语言生（一学期）也需要保险。孔子学院项目、夏令营、交换生都适用同样规定。',
          },
        ],
      },
      {
        id: 'ping-an-basic',
        h2: '标准方案：平安来华人员综合保险',
        intro:
          '平安是教育部推荐的保险公司，几乎每所中国大学都和平安有校级合作协议。注册日的保险窗口是最方便的购买点。',
        blocks: [
          {
            type: 'table',
            caption: '平安来华人员综合保险保障计划（2026）',
            columns: ['项目', '详情', '备注'],
            rows: [
              ['保险公司', '中国平安', '中国保费规模最大的保险公司'],
              ['保费（12个月）', '¥800', '注册当天以人民币支付'],
              ['保费（6个月）', '¥400', '短期项目适用'],
              ['意外身故/伤残', '最高¥10万一次性赔付', '全球范围（含回国期间）'],
              ['意外医疗（门急诊）', '最高¥1万/年', '仅限大陆公立医院'],
              ['大病住院', '最高¥40万/年', '癌症、心脏病、卒中等'],
              ['紧急医疗救援/转运', '包含', '拨打400-810-5119'],
              ['医院网络', '全国公立医院', '不含港澳台'],
              ['不保障科室', '特需、外宾、国际医疗部', '需自费'],
            ],
          },
          {
            type: 'h3',
            text: '购买方式',
            body:
              '三种方式：(1) 注册当天在校内保险窗口购买——最常见，10分钟办完，会拿到纸质证明和平安服务卡。(2) 出发前通过平安官网（lxs.pingan.com）线上购买——适合希望保险从抵达日开始生效的学生。(3) 通过学校国际办购买——部分学校会与学费或住宿押金绑定。',
          },
        ],
      },
      {
        id: 'what-is-covered',
        h2: '保什么、不保什么',
        intro:
          '平安基础方案应对紧急情况够用，但保障范围有限，遇到特定医疗需求容易踩坑。签合同前请仔细阅读免责条款。',
        blocks: [
          {
            type: 'h3',
            text: '保障情形',
            body:
              '意外伤害（骨折、扭伤、烧伤、交通事故）门急诊可报销，最高¥1万/年。大病住院（癌症、心脏病、卒中、器官衰竭）最高¥40万/年——额度足够覆盖公立医院的大多数严重病症。紧急医疗救援和大陆境内转运包含在内，400热线24小时提供英语服务。',
          },
          {
            type: 'h3',
            text: '常见免责',
            body:
              '原有疾病不保。牙科仅紧急拔牙可赔。视力（眼镜、隐形、激光手术）不保。心理咨询和精神科不保。整容手术、生育、辅助生殖不保。高风险活动（潜水、跳伞、攀岩、蹦极、武术比赛、赛车）不保。勤工助学期间受伤明确不保——这点对想在校内打工的学生很关键。大陆以外地区治疗不保。即便在公立医院，特需、外宾、国际医疗部等高端科室也不保。',
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '勤工助学受伤是真实的保障缺口。如果你打算在校内工作（科研助理、助教、图书馆员）或做实习，平安基础方案不覆盖工伤。请参考下方升级方案。',
          },
        ],
      },
      {
        id: 'how-to-claim',
        h2: '理赔流程：一步一步教你',
        intro:
          '平安理赔在非网络医院是"先付后报"，在网络医院可申请"住院垫付"。流程文件多但顺畅。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**生病或受伤** — 去公立医院。避开特需/外宾/国际医疗部，这些不能报销',
              '**挂号时** — 名字与护照完全一致，告知窗口有"商业保险"或"自费"',
              '**看普通门诊** — 不是特需、不是外宾。每次就诊请医生写门诊病历',
              '**先垫付** — 保留每张盖章发票（2个章）、检查报告、处方。发票丢失无法报销',
              '**住院时** — 先打400-810-5119。如果是平安网络医院可申请住院垫付，否则先付费、出院后报销',
              '**出院时收集资料** — 盖章发票原件、费用明细清单原件、出院小结或住院病历复印件',
              '**提交理赔** — 交给学校国际学生保险助理审核转交平安，或直接拨打400-810-5119',
              '**收到理赔款** — 平安打入你在中国银行卡（需提供银行卡信息：户名、账号、开户行）。处理周期：10-30个工作日',
            ],
          },
          {
            type: 'h3',
            text: '理赔资料清单',
            body:
              '五项必备：(1) 盖章发票原件（2个章），(2) 费用明细清单，(3) 出院小结或门诊病历，(4) 银行卡信息打印件（持护照和卡去银行打印"银行卡客户信息表"），(5) 意外事故证明（如适用，需手写经过并签名）。如果发票姓名与护照不一致，需提供姓名证明。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '收到发票和病历的当天就拍照留底。资料齐全时平安处理很快；缺资料会拖2-4周。',
          },
        ],
      },
      {
        id: 'network-hospitals',
        h2: '网络医院 vs 非网络医院',
        intro:
          '平安网络医院是和保险公司有结算协议的公立医院。去网络医院可申请住院垫付；去非网络医院则全部先垫付、出院后报销。',
        blocks: [
          {
            type: 'table',
            caption: '网络医院 vs 非网络公立医院',
            columns: ['项目', '网络医院', '非网络医院'],
            rows: [
              ['门诊', '先付后报', '先付后报'],
              ['住院', '平安可直付医院（垫付）', '全部自付，出院后报销'],
              ['英语服务', '二线城市以上一般有', '较少'],
              ['国际部', '不报销', '不报销'],
              ['查询方式', 'lxs.pingan.com 网络医院列表，或拨400-810-5119', '大陆境内任何公立医院'],
            ],
          },
          {
            type: 'h3',
            text: '主要留学城市的覆盖情况',
            body:
              '北京（北京协和医院、北京天坛医院、中日友好医院）、上海（华山、瑞金、中山）、广州（中山一院、南方医院）、武汉（同济、协和）、西安（西京、唐都）、南京（鼓楼）都有平安网络医院且有国际患者协调员。所在学校的国际办会有附近网络医院清单。',
          },
        ],
      },
      {
        id: 'when-to-upgrade',
        h2: '什么时候升级到国际计划',
        intro:
          '平安基础方案应对紧急情况足够。如果有持续健康需求、希望使用私立医院、或需要大陆以外保障，国际计划值得这笔投入。',
        blocks: [
          {
            type: 'h3',
            text: '需要升级的情形',
            body:
              '（1）原有疾病——糖尿病、哮喘、心理疾病、持续治疗。平安免责；国际计划可走等待期或加费承保。（2）私立/国际医院偏好——VIP病房、英语医生、更快预约、西方诊疗风格。和睦家、百汇、嘉会都是常见选择。（3）牙科和视力——洁牙、补牙、眼镜、隐形。（4）心理——咨询、治疗、精神科。（5）大陆以外保障——周末去港澳、日韩，或回国探亲。（6）生育——你或配偶计划在学期间怀孕。（7）运动和高风险活动。',
          },
          {
            type: 'h3',
            text: '中国主要国际保险公司',
            body:
              'Cigna Global（4档计划、24小时多语种客服、除美国外全球保障，学生$1,500-4,000/年）、AXA（全球、可定制、含转运）、Allianz Care（网络广、模块化附加）、MSH（植根中国、本地网络强、中英客服）、NOW Health（学生专项、手机App理赔）、William Russell（年度续保、4000+医院网络）、Blue Cross Blue Shield Global Solutions（适合频繁回美的学生）。大多数有学生计划$800-1,500/年起。',
          },
          {
            type: 'table',
            caption: '平安基础 vs 典型国际计划',
            columns: ['项目', '平安基础（¥800）', '国际计划（$1,500）'],
            rows: [
              ['公立医院', '覆盖', '覆盖'],
              ['私立/国际医院', '不覆盖', '覆盖'],
              ['牙科+视力', '不覆盖', '可选附加'],
              ['心理咨询', '不覆盖', '覆盖'],
              ['原有疾病', '免责', '等待期或加费'],
              ['生育', '不覆盖', '可选附加'],
              ['大陆以外保障', '不覆盖', '覆盖（视计划）'],
              ['英语理赔', '有限（热线OK）', '全流程'],
              ['直付网络', '平安网络', '保险公司网络，通常更大'],
            ],
          },
        ],
      },
      {
        id: 'campus-clinic',
        h2: '校医院：日常健康问题的第一站',
        intro:
          '每所中国大学都有校医院。90%的学生健康问题——感冒、流感、肠胃不适、轻伤、疫苗、基础处方——校医院更快、更便宜、且平安可报销。',
        blocks: [
          {
            type: 'h3',
            text: '校医院能处理什么',
            body:
              '感冒流感、肠胃不适、头痛、轻度创伤和烧伤、扭伤、基础化验、血压检查、疫苗（含10-11月多数学校提供的免费流感疫苗）、肺结核筛查（办居留许可必需）、女性健康咨询、心理咨询（多数重点高校已配备专职咨询师）。校医院可开具转诊单，转至网络医院专科。',
          },
          {
            type: 'h3',
            text: '如何使用',
            body:
              '带学生证和保险证明。多数校医院周一至周五8:00-17:00开放，周末有值班。挂号费象征性（¥5-20）。药品在校医院药房或医院药房取。如需进一步诊疗，校医院开转诊单到网络医院。非紧急情况没有转诊单，平安可能降低报销比例或拒赔——非急症先去校医院。',
          },
          {
            type: 'callout',
            tone: 'success',
            text: '即便是看起来严重的问题，也建议先去校医院。他们可以当天开具转诊单到网络医院专科，转诊单能加快理赔流程。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国留学生医疗保险是强制的吗？',
        a: '是。教育部要求每位国际学生在整个学习期间必须购买医疗保险。学校注册时核验保险证明，保险中断将面临休学或退学。学位生、语言生、交换生、夏令营学生都适用。',
      },
      {
        q: '平安基础方案多少钱？',
        a: '12个月¥800或6个月¥400。该方案是教育部推荐的标准方案，每所中国大学的国际学生服务窗口在注册当天均可办理。也可通过 lxs.pingan.com 提前在线购买。',
      },
      {
        q: '平安基础保什么？',
        a: '意外伤害（门急诊最高¥1万/年）、大病住院（最高¥40万/年，含癌症、心脏病、卒中）、24小时紧急医疗救援。仅限大陆公立医院普通部；特需、外宾、国际部不保。原有疾病、牙科、视力、心理咨询、生育免责。',
      },
      {
        q: '可以去私立或国际医院吗？',
        a: '平安基础方案不行。如果想用和睦家、百汇、嘉会或其他私立/国际医院，需要国际计划（Cigna、AXA、Allianz、MSH、NOW Health等），$800-4,000/年。',
      },
      {
        q: '怎么理赔？',
        a: '先垫付、收齐盖章发票原件（2个章）、费用明细清单、出院小结或门诊病历、银行卡信息。通过学校国际学生保险助理提交，或直接拨打400-810-5119。理赔款打入你在中国银行卡，10-30个工作日到账。',
      },
      {
        q: '什么是网络医院？',
        a: '与平安有结算协议的公立医院。网络医院可申请住院垫付——先打400-810-5119，平安直接付医院。非网络公立医院也接受平安基础方案，但需先付费、出院后报销。学校国际办会有附近网络医院清单。',
      },
      {
        q: '平安保勤工助学受伤吗？',
        a: '不保。勤工助学期间受伤明确写入平安基础方案的免责条款。如果你在校内打工（助教、科研助理、图书馆员）或做实习，建议买含工伤的国际计划。少数学校为学生雇员提供工伤补充险，可向国际办咨询。',
      },
      {
        q: '可以用自己国家的保险代替吗？',
        a: '理论上部分学校接受符合中国保障要求的外籍保险。实际操作中，几乎所有学校都要求购买平安（或同等方案）。外国保险通常不符合教育部关于公立医院覆盖、大陆直付、中文理赔支持的要求。',
      },
    ],
    howToSteps: [
      { name: '向学校确认保险要求', text: '录取材料或国际办会列出认可的保险方案。多数学校要求平安；少数接受对等的国际计划。' },
      { name: '注册当天（或提前）购买平安基础方案', text: '到国际学生服务办公室保险窗口办理，或在 lxs.pingan.com 线上购买。费用：12个月¥800或6个月¥400。保留纸质证明和平安服务卡。' },
      { name: '如有持续健康需求，升级国际计划', text: '如有原有疾病、需要私立医院、牙科/视力/心理咨询、或频繁出行，可买 Cigna/AXA/Allianz/MSH/NOW Health 国际计划（$800-4,000/年）。' },
      { name: '非急症先去校医院', text: '带学生证和平安证明。校医院处理90%的学生健康问题，挂号费¥5-20，可开具转诊单到网络医院专科。' },
      { name: '急症或严重问题去公立医院', text: '避开特需/外宾/国际医疗部。用护照名挂号，窗口告知"商业保险"或"自费"，看普通门诊。' },
      { name: '住院先打平安热线', text: '400-810-5119（24小时，英语支持）。如是平安网络医院可申请垫付，否则先付费、出院后报销。' },
      { name: '当天收集所有资料', text: '盖章发票原件（2个章）、费用明细清单、出院小结、门诊病历、检验报告、处方。手机拍照备份关键。' },
      { name: '30天内提交理赔', text: '通过学校国际学生保险助理提交，或打400-810-5119。提供中国银行卡信息。10-30个工作日到账。' },
    ],
    ctaTitle: '需要医疗保险方面的协助？',
    ctaSubtitle:
      'SICA可以提前确认你所在大学的保险要求、带你走完平安购买流程，并判断是否需要升级到国际计划。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/application', label: '如何申请', description: '完整申请时间线、材料清单、奖学金路径。' },
      { href: '/guides/visa', label: '学生签证 (X1 / X2)', description: '材料清单、费用、办理时长、居留许可规则。' },
      { href: '/guides/cost-of-living', label: '中国留学生活费', description: '月度真实预算：住房、餐饮、交通、医疗。' },
    ],
  },
};
