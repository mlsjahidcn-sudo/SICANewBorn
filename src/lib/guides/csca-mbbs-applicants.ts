import type { LocalizedGuide } from './types';

/**
 * "CSCA for MBBS & medicine applicants" — Batch 4, article #16 of
 * the 20-article CSCA cluster (docs/csca-content-plan.md).
 * Target queries: "csca mbbs", "csca for medical students", "mbbs
 * china entrance exam".
 *
 * Static content. Medicine-route combinations framed as typical
 * patterns to verify per program; home-country licensing context
 * (NMC/PMDC) kept general — the CSCA is an admission requirement,
 * not a licensing exam.
 */
export const cscaMbbsGuide: LocalizedGuide = {
  en: {
    slug: 'csca-mbbs-applicants',
    eyebrow: 'GUIDE · CSCA × MBBS',
    title: 'CSCA for MBBS & Medicine Applicants — Subject Combinations, Timing, and Licensing Context',
    description:
      'What MBBS and medical-program applicants need from the CSCA: the typical Math + Chemistry combination, English-taught vs Chinese-taught differences, the MOE-listed program landscape, home-country licensing exams (NMC/PMDC), and a planning calendar for the long medical timeline.',
    subtitle:
      'MBBS remains the single biggest program type international students pursue in China, and from the 2026 intake its applicants sit the CSCA like everyone else — typically Mathematics + Chemistry, often alongside the STEM Chinese track for Chinese-taught programs. The critical distinctions for medical applicants: most MBBS programs are English-taught (so IELTS/TOEFL, not HSK), combinations are set per program by medical faculties (verify every one), and the CSCA is an admission requirement only — your home country\'s medical council licensing exam (India\'s NMC/FMGE-NExT, Pakistan\'s PMDC/NRE) still stands between you and practice at home.',
    stats: [
      { value: 'Math + Chem', label: 'Typical medicine-route combination' },
      { value: '5–6 yrs', label: 'MBBS program length' },
      { value: 'English', label: 'Most MBBS teaching language' },
      { value: 'Per program', label: 'Who sets the exact combination' },
    ],
    quickAnswer:
      'MBBS and medical-program applicants sit the CSCA from the 2026 intake like all bachelor\'s applicants. The typical medicine-route combination is Mathematics (compulsory for everyone) plus Chemistry, with Physics appearing at some programs — the exact combination is set per program by each medical faculty, so verify on every program page before registering. Most Chinese MBBS programs are English-taught, which means your language evidence is IELTS/TOEFL rather than HSK, though the CSCA itself still applies. Plan the exam around a long timeline: MBBS runs 5–6 years, applications for popular medical programs close early, and your home country\'s medical council licensing exam (India\'s FMGE/NExT, Pakistan\'s NRE) awaits after graduation — the CSCA is the admission gate, not the licensing one.',
    keyTakeaways: [
      'Medicine-route CSCA is typically Math + Chemistry; some programs add or swap Physics — verify per program, medical faculties set their own combinations',
      'Most Chinese MBBS programs are English-taught: IELTS/TOEFL is the language requirement; the CSCA still applies regardless',
      'Chemistry is the differentiating subject for medicine — the fact-recall layer (colors, gases, reactions) is where medicine-route candidates win or lose',
      'Apply early and wide: popular MOE-listed MBBS programs fill fast, and medicine deadlines often close earlier than other faculties',
      'The CSCA gates admission only — home-country licensing (NMC FMGE/NExT for India, PMDC NRE for Pakistan) comes after graduation and is unchanged',
      'Budget for the long game: 5–6 years of tuition and living costs, or pair the application with CSC/university scholarships where medicine places are offered',
    ],
    sections: [
      {
        id: 'combination',
        h2: 'The medicine-route subject combination',
        intro:
          'Medical faculties set their own CSCA combinations. The typical pattern is clear; the exceptions are real.',
        blocks: [
          {
            type: 'table',
            caption: 'Subject combinations observed across medicine-type programs',
            columns: ['Program type', 'Typical CSCA combination', 'Notes'],
            rows: [
              ['MBBS / BDS (English-taught)', 'Math + Chemistry', 'The dominant pattern; some programs add Physics'],
              ['MBBS (Chinese-taught)', 'STEM Chinese + Math + Chemistry', 'Chinese-taught medicine is rarer for international intake'],
              ['Pharmacy / pharmaceutical science', 'Math + Chemistry', 'Occasionally accepts Physics as alternative'],
              ['Biomedical / life sciences', 'Math + Chemistry, or Math + Physics', 'Program-dependent; some accept either science'],
              ['Dentistry, nursing, public health', 'Math + Chemistry (varies widely)', 'Nursing and health programs sometimes fundamentals-only'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Verify every single program** — medical faculties are the most independent combination-setters in Chinese universities; two MBBS programs in the same city can require different sciences',
              '**The union strategy** — if your program list mixes "Math + Chem" and "Math + Phys + Chem" programs, register for the union in one session (the ¥700 band makes the extra subject nearly free)',
              '**Math is non-negotiable** — compulsory for every candidate; medicine route included, no exceptions published',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Do not register on the basis of what "most MBBS programs" require — one email to each admissions office with your program name gets you the authoritative combination in writing. Attach those confirmations to your registration planning.',
          },
        ],
      },
      {
        id: 'chemistry-first',
        h2: 'Chemistry is your differentiating subject',
        intro:
          'For medicine-route candidates, the CSCA Chemistry paper is the highest-leverage exam of the set — and the most fact-heavy.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Where medicine-route points live** — Chemistry is the subject medical faculties read most closely; it is also the paper where China\'s exam style diverges most from A-Level/IB/AP (fact recall + mole arithmetic + process flows)',
              '**The fact-recall layer decides** — precipitate colors, gas tests, flame colors, and core reaction families are pure memorization; international candidates who skip this layer cap out in the 60s–70s',
              '**No-calculator mole arithmetic** — the stoichiometry chains are engineered for mental math; the molar-mass flashcard deck is the entry ticket',
              '**Math still matters** — medical faculties read Math as the reasoning signal; a weak Math score undercuts an otherwise strong medicine file',
              '**Physics only if required** — don\'t prep Physics speculatively; if one program on your list demands it, the union strategy covers you at registration time',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The medicine-route prep center of gravity: the Chemistry guide\'s five-week framework (diagnose → mole arithmetic → fact-recall campaign → speed → mocks), with Math following the six-week track in parallel.',
          },
        ],
      },
      {
        id: 'english-taught-landscape',
        h2: 'The English-taught MBBS landscape',
        intro:
          'Most international MBBS intake in China is English-taught — which shapes your language evidence and your CSCA shape.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Language evidence** — English-taught MBBS requires IELTS/TOEFL (or equivalent) per program thresholds, commonly around IELTS 6.0–6.5; HSK is not required for English-taught medicine',
              '**The CSCA still applies** — teaching language does not exempt the exam; your combination is typically the fundamentals (Math + Chemistry) without the Professional Chinese track — but verify, as some programs do list it',
              '**MBBS in Chinese-taught form** — exists but is the minority route for international students; it adds HSK 4–5 + the STEM Chinese track to your stack',
              '**Program lists matter** — apply to programs on the MOE\'s international-student list; unlisted programs carry recognition risk back home',
              '**CSC medicine places** — scholarship funding for MBBS exists but is thinner than for other faculties; the CSC guide\'s calendar crunch applies with even less margin',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Your typical English-taught medicine stack: CSCA (Math + Chemistry) + IELTS/TOEFL + MOE-listed program applications. Total standardized cost is modest — the CSCA band plus one language test.',
          },
        ],
      },
      {
        id: 'licensing-context',
        h2: 'Licensing back home — what the CSCA does and doesn\'t touch',
        intro:
          'Medical applicants plan in two jurisdictions: China admits you, your home country licenses you. Keep the two separate.',
        blocks: [
          {
            type: 'table',
            caption: 'The two-gate structure for an international medical student',
            columns: ['Gate', 'What it is', 'Governing body'],
            rows: [
              ['Admission (China)', 'CSCA + language test + program application — your entry to the MBBS', 'Chinese universities / MOE'],
              ['Degree (China)', '5–6 years of study, clinical rotations, university exams', 'Your university'],
              ['Licensing (home country)', 'National licensing exam after returning — e.g., India\'s FMGE/NExT, Pakistan\'s NRE', 'NMC, PMDC, and equivalents'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The CSCA is admission-only** — it has no standing in home-country licensing; your licensing exam performance after graduation is a separate, later battle',
              '**Check your council\'s current rules early** — licensing requirements (which universities\' degrees are accepted, internship rules, exam formats) change periodically; read your council\'s current year guidance before choosing programs',
              '**MOE-listing is the recognition anchor** — for most councils, the degree must come from a listed Chinese medical program; unlisted programs risk the license regardless of quality',
              '**English-taught ≠ license-exempt** — studying in English changes your study experience, not your licensing obligations at home',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Agents who blur the admission gate and the licensing gate cause the most expensive MBBS mistakes. Verify program listing and licensing implications from your council\'s own publications, not from promotional material.',
          },
        ],
      },
      {
        id: 'planning-calendar',
        h2: 'The medicine-route planning calendar',
        intro:
          'Medical programs close early and the files are heavier. The calendar is the standard one, front-loaded.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**12+ months out — build the list** — shortlist MOE-listed MBBS programs; confirm each one\'s CSCA combination and language threshold in writing',
              '**9–12 months out — sit the CSCA** — the earliest viable session; medicine files benefit from banked scores because program deadlines run early',
              '**6–9 months out — language test** — IELTS/TOEFL to program threshold; retest once if needed while deadlines hold',
              '**4–8 months out — apply wide** — medical programs fill on rolling bases; submit complete files (transcripts, physical exam, financial proof per program) early rather than perfectly',
              '**On offers — verify before accepting** — re-check MOE listing and your council\'s recognition position for the specific program before any deposit',
              '**Parallel: scholarship lane** — if pursuing CSC or university scholarships for medicine, the January–April crunch applies with the CSC guide\'s full force',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Medicine-route edge case: because combinations cluster around Math + Chemistry, one well-chosen CSCA session typically covers your entire program list — the union strategy rarely adds a subject.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do MBBS applicants need the CSCA?',
        a: 'Yes — from the 2026 intake, MBBS and all other bachelor\'s applicants sit the CSCA. The typical medicine-route combination is Mathematics + Chemistry, sometimes with Physics or the STEM Chinese track depending on the program.',
      },
      {
        q: 'Which subjects do medical programs require in the CSCA?',
        a: 'The dominant pattern is Math + Chemistry; some programs add Physics, a few accept either science. Combinations are set per program by medical faculties — verify on each program page and get it in writing before registering.',
      },
      {
        q: 'Is the CSCA required for English-taught MBBS?',
        a: 'Yes — the CSCA applies regardless of teaching language. English-taught MBBS applicants typically sit Math + Chemistry and provide IELTS/TOEFL as language evidence; HSK is not required for English-taught programs.',
      },
      {
        q: 'Does the CSCA count toward medical licensing in my home country?',
        a: 'No — the CSCA is a Chinese admission requirement only. Licensing at home (India\'s FMGE/NExT, Pakistan\'s NRE, and equivalents) is a separate post-graduation exam run by your home medical council. The two gates are independent.',
      },
      {
        q: 'How hard is CSCA Chemistry for medicine-route students?',
        a: 'It rewards different preparation than A-Level/IB/AP chemistry: China\'s paper leans on no-calculator mole arithmetic, inorganic fact recall (colors, gases, reactions), and process-flow questions. The fact-recall flashcard layer is the make-or-break — see the Chemistry guide\'s five-week plan.',
      },
      {
        q: 'When should MBBS applicants sit the CSCA?',
        a: 'Early — medicine programs close applications earlier than most faculties and fill on rolling bases. Sit the earliest viable session 9–12 months before your intake so banked scores cover every application you submit.',
      },
      {
        q: 'Can I get a scholarship for MBBS in China?',
        a: 'Some CSC and university scholarship places exist for medicine but are thinner than other faculties and carry higher competition. If pursuing them, the CSC guide\'s January–April calendar crunch applies in full — earliest CSCA session, one fallback at most.',
      },
    ],
    howToSteps: [
      {
        name: 'Build a MOE-listed program list first',
        text: 'Shortlist MBBS programs from the MOE international-student listing — this anchors both admission and home-country recognition. Unlisted programs are a licensing risk regardless of quality.',
      },
      {
        name: 'Confirm each program\'s CSCA combination in writing',
        text: 'One email per program: "Which CSCA subjects does this MBBS program require?" Collect the written answers — they are your registration list and your dispute evidence.',
      },
      {
        name: 'Sit the CSCA early — 9–12 months before intake',
        text: 'Medicine files run on early deadlines; banked scores cover every rolling application. The typical sitting is Math + Chemistry in the earliest viable session.',
      },
      {
        name: 'Center your prep on the Chemistry guide\'s framework',
        text: 'Five weeks: diagnose by domain, no-calculator mole arithmetic, the fact-recall flashcard campaign, timed mixed sets, two mocks. Run the Math track in parallel.',
      },
      {
        name: 'Take the language test to threshold',
        text: 'IELTS/TOEFL at your programs\' stated level (commonly 6.0–6.5 for MBBS) — schedule it after the CSCA session or in parallel, with one retest window before deadlines.',
      },
      {
        name: 'Verify licensing before depositing anything',
        text: 'Before accepting an offer, re-check your home council\'s current recognition rules and the program\'s MOE listing status. The CSCA got you in; your council decides what the degree is worth at home.',
      },
    ],
    ctaTitle: 'Planning the medicine route through the CSCA?',
    ctaSubtitle:
      'SICA counselors verify program combinations and MOE listing, plan the early CSCA sitting, and coordinate the language test and application files around medicine\'s early deadlines. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China — complete guide',
        description: 'Programs, costs, duration, and the full MBBS application picture.',
      },
      {
        href: '/csca-chemistry-guide',
        label: 'CSCA Chemistry — syllabus & prep',
        description: 'The differentiating subject for medicine routes, with the five-week plan.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The flagship overview: subjects, format, scoring, fees, and the CSC requirement.',
      },
    ],
  },
  zh: {
    slug: 'csca-mbbs-applicants',
    eyebrow: '指南 · CSCA × MBBS',
    title: 'MBBS 与医学申请者的 CSCA——科目组合、时间线与执照背景',
    description:
      'MBBS 与医学项目申请者需要从 CSCA 拿到什么：典型的数学 + 化学组合、英文授课与中文授课差异、MOE 名单项目版图、母国执照考试（NMC/PMDC），以及长医学时间线的规划日历。',
    subtitle:
      'MBBS 仍是国际学生在中国攻读的最大单项项目类型，自 2026 级起其申请者与其他人一样参加 CSCA——典型为数学 + 化学，中文授课项目常配理工中文轨。医学申请者的关键区分：多数 MBBS 为英文授课（语言要雅思/托福而非 HSK）、组合由各医学院系按项目设定（逐一核验），且 CSCA 只是入学门槛——你母国医学委员会的执照考试（印度 NMC/FMGE-NExT、巴基斯坦 PMDC/NRE）仍横在你与回国执业之间。',
    stats: [
      { value: '数学 + 化学', label: '典型医学路线组合' },
      { value: '5-6 年', label: 'MBBS 学制' },
      { value: '英文', label: '多数 MBBS 授课语言' },
      { value: '按项目', label: '谁定确切组合' },
    ],
    quickAnswer:
      '自 2026 级起，MBBS 与其他医学项目申请者与所有本科申请者一样参加 CSCA。医学路线的典型组合是数学（人人必考）加化学，部分项目出现物理——确切组合由各医学院系按项目设定，报名前逐项目页核验。多数中国 MBBS 为英文授课，语言证明是雅思/托福而非 HSK，但 CSCA 本身仍然适用。按长时间线规划考试：MBBS 学制 5-6 年、热门医学项目申请关闭早，毕业后的母国医学委员会执照考试（印度 FMGE/NExT、巴基斯坦 NRE）在等你——CSCA 是入学闸门，不是执照闸门。',
    keyTakeaways: [
      '医学路线 CSCA 典型为数学 + 化学；部分项目加物理或换科——逐项目核验，医学院系自定组合',
      '多数中国 MBBS 为英文授课：语言要求是雅思/托福；CSCA 无论授课语言都适用',
      '化学是医学路线的差异化科目——事实记忆层（颜色、气体、反应）决定医学路线考生的成败',
      '早申、广申：MOE 名单上的热门 MBBS 项目满位快，医学院截止常早于其他院系',
      'CSCA 只管入学——母国执照（印度 NMC FMGE/NExT、巴基斯坦 PMDC NRE）在毕业后、规则不变',
      '按长线做预算：5-6 年学费与生活费，或搭配提供医学名额的 CSC/大学奖学金',
    ],
    sections: [
      {
        id: 'combination',
        h2: '医学路线的科目组合',
        intro:
          '医学院系自定 CSCA 组合。典型模式清晰；例外也真实存在。',
        blocks: [
          {
            type: 'table',
            caption: '各医学类项目观察到的科目组合',
            columns: ['项目类型', '典型 CSCA 组合', '说明'],
            rows: [
              ['MBBS / 口腔（英文授课）', '数学 + 化学', '主导模式；部分项目加物理'],
              ['MBBS（中文授课）', '理工中文 + 数学 + 化学', '中文授课医学的国际招生较少'],
              ['药学 / 制药科学', '数学 + 化学', '偶尔接受物理替代'],
              ['生物医学 / 生命科学', '数学 + 化学，或数学 + 物理', '依项目而定；部分两者任选其一'],
              ['护理、公共卫生等', '数学 + 化学（差异大）', '护理与健康类项目有时仅基础科'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**逐一核验每个项目**——医学院系是中国大学里最独立的组合设定者；同城的两所 MBBS 项目可能要求不同理科',
              '**并集策略**——若清单混有「数学 + 化学」与「数学 + 物理 + 化学」项目，一场考试报并集（¥700 档让加科几乎免费）',
              '**数学不可协商**——人人必考；医学路线亦然，无公布的例外',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '不要按「多数 MBBS 项目」的要求报名——给每个招生办发一封带项目名的邮件，就能拿到书面权威组合。把这些确认函附进你的报名规划。',
          },
        ],
      },
      {
        id: 'chemistry-first',
        h2: '化学是你的差异化科目',
        intro:
          '对医学路线考生，CSCA 化学是整套考试里杠杆最高的一科——也是事实记忆最重的一科。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**医学路线的分数在哪里**——化学是医学院系读得最细的科目；也是中国考风与 A-Level/IB/AP 分歧最大的卷（事实记忆 + 物质的量运算 + 流程图）',
              '**事实记忆层定生死**——沉淀颜色、气体检验、焰色、核心反应族是纯记忆；跳过这层的国际考生上限就在 60-70 分段',
              '**无计算器物质的量运算**——化学计算链按心算设计；摩尔质量闪卡是入场券',
              '**数学仍然要紧**——医学院把数学读作推理信号；数学弱分会拖累整份医学档案',
              '**仅在要求时才考物理**——不要投机性备考物理；清单里有一所要求，报名时的并集策略自然会覆盖',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '医学路线的备考重心：化学指南的五周框架（诊断 → 物质的量运算 → 事实记忆战役 → 提速 → 模考），数学六周轨并行。',
          },
        ],
      },
      {
        id: 'english-taught-landscape',
        h2: '英文授课 MBBS 版图',
        intro:
          '中国国际 MBBS 招生以英文授课为主——这决定了你的语言证明与 CSCA 的形状。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**语言证明**——英文授课 MBBS 按项目阈值要求雅思/托福（或同等），常见雅思 6.0-6.5；英文授课不要求 HSK',
              '**CSCA 仍然适用**——授课语言不免考试；你的组合通常是基础科（数学 + 化学）、不含专业中文轨——但要核验，部分项目确实列出',
              '**中文授课 MBBS**——存在但非国际学生主流；它会在你的清单上叠加 HSK 4-5 + 理工中文轨',
              '**项目名单要紧**——申请教育部国际学生名单上的项目；名单外项目带回国认证风险',
              '**CSC 医学名额**——MBBS 的奖学金资助存在但比其他院系更薄；CSC 指南的日历挤压以更小的余量适用',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '典型的英文授课医学组合：CSCA（数学 + 化学）+ 雅思/托福 + MOE 名单项目申请。标准化总成本不高——CSCA 一档加一次语言考试。',
          },
        ],
      },
      {
        id: 'licensing-context',
        h2: '回国执照——CSCA 碰与不碰的边界',
        intro:
          '医学申请者在两个法域规划：中国录取你，母国给你执照。把两者分开。',
        blocks: [
          {
            type: 'table',
            caption: '国际医学生的双闸结构',
            columns: ['闸门', '是什么', '主管方'],
            rows: [
              ['入学（中国）', 'CSCA + 语言考试 + 项目申请——进入 MBBS 的门票', '中国大学 / 教育部'],
              ['学位（中国）', '5-6 年学习、临床轮转、校内考试', '你的大学'],
              ['执照（母国）', '回国后的国家执照考试——如印度 FMGE/NExT、巴基斯坦 NRE', 'NMC、PMDC 及各国对应机构'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**CSCA 仅管入学**——它在母国执照中没有地位；毕业后的执照考试是另一场、更晚的战役',
              '**提早读你委员会的现行规则**——执照要求（接受哪些大学学位、实习规则、考试形式）会周期变化；选项目前读委员会当年指引',
              '**MOE 名单是认证锚**——对多数委员会，学位须来自名单内的中国医学项目；名单外项目无论质量都有执照风险',
              '**英文授课 ≠ 免执照**——用英文学习改变的是学习体验，不是你在母国的执照义务',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '把入学闸门与执照闸门混为一谈的中介，制造了最昂贵的 MBBS 错误。项目名单与执照影响要从你委员会自己的出版物核验，不从宣传材料。',
          },
        ],
      },
      {
        id: 'planning-calendar',
        h2: '医学路线的规划日历',
        intro:
          '医学项目关闸早、材料更重。日历就是标准日历的前置加载版。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**入学前 12 个月以上——建清单**——圈定 MOE 名单上的 MBBS 项目；书面确认各自的 CSCA 组合与语言阈值',
              '**9-12 个月前——考 CSCA**——最早可行场次；医学文件受益于存分，因为项目截止早',
              '**6-9 个月前——语言考试**——雅思/托福到项目阈值；截止允许时留一次重考窗口',
              '**4-8 个月前——广申**——医学项目滚动满位；完整材料（成绩单、体检、财力证明）早交优先于完美交',
              '**拿 offer 时——先核验再接受**——任何押金前，重新核对该项目的 MOE 名单状态与你委员会的认证立场',
              '**并行：奖学金道**——若追求 CSC 或大学医学奖学金，1-4 月挤压以 CSC 指南的全部力度适用',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '医学路线的边界情形：因为组合都聚在数学 + 化学周围，一场选对了的 CSCA 场次通常覆盖你的全部项目清单——并集策略很少真正加科。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'MBBS 申请者要考 CSCA 吗？',
        a: '要——自 2026 级起，MBBS 与所有其他本科申请者都参加 CSCA。医学路线典型组合为数学 + 化学，部分项目加物理或理工中文轨。',
      },
      {
        q: '医学项目在 CSCA 里要求哪些科目？',
        a: '主导模式是数学 + 化学；部分加物理，少数两种理科任选。组合由医学院系按项目设定——报名前逐项目页核验并拿到书面确认。',
      },
      {
        q: '英文授课 MBBS 也要 CSCA 吗？',
        a: '要——CSCA 与授课语言无关。英文授课 MBBS 申请者通常考数学 + 化学、另附雅思/托福作语言证明；英文授课不要求 HSK。',
      },
      {
        q: 'CSCA 能算我母国的医学执照吗？',
        a: '不能——CSCA 只是中国的入学要求。母国执照（印度 FMGE/NExT、巴基斯坦 NRE 及对应考试）是毕业后由本国医学委员会组织的另一场考试。两个闸门相互独立。',
      },
      {
        q: '医学路线的 CSCA 化学有多难？',
        a: '它奖励与 A-Level/IB/AP 化学不同的备考：中国卷倚重无计算器物质的量运算、无机事实记忆（颜色、气体、反应）与流程图题。事实记忆闪卡层定生死——见化学指南的五周计划。',
      },
      {
        q: 'MBBS 申请者什么时候考 CSCA？',
        a: '尽早——医学项目的申请关闭早于多数院系且滚动满位。在入学前 9-12 个月的最早可行场次考试，让存下的成绩覆盖你提交的每一份申请。',
      },
      {
        q: '中国的 MBBS 能拿奖学金吗？',
        a: '部分 CSC 与大学奖学金名额对医学开放，但比其他院系更薄、竞争更高。若追求，CSC 指南的 1-4 月日历挤压以全额生效——最早场次、至多一次兜底。',
      },
    ],
    howToSteps: [
      {
        name: '先建 MOE 名单项目清单',
        text: '从教育部国际学生名单圈定 MBBS 项目——这同时锚定入学与母国认证。名单外项目无论质量都是执照风险。',
      },
      {
        name: '书面确认每个项目的 CSCA 组合',
        text: '每项目一封邮件：「该 MBBS 项目要求哪些 CSCA 科目？」收集书面答复——它们是你的报名清单，也是争议证据。',
      },
      {
        name: '早考 CSCA——入学前 9-12 个月',
        text: '医学文件跑在早期截止上；存分覆盖每一份滚动申请。典型报考为最早可行场次的数学 + 化学。',
      },
      {
        name: '以化学指南的框架为备考重心',
        text: '五周：按域诊断、无计算器物质的量运算、事实记忆闪卡战役、限时混合套题、两套模考。数学轨并行。',
      },
      {
        name: '语言考试考到阈值',
        text: '雅思/托福达到项目公布的水平（MBBS 常见 6.0-6.5）——排在 CSCA 场次之后或并行，截止前留一次重考窗口。',
      },
      {
        name: '押金之前先核验执照',
        text: '接受 offer 前，重新核对你母国委员会的现行认证规则与该项目的 MOE 名单状态。CSCA 送你进门；你的委员会决定学位在家值多少。',
      },
    ],
    ctaTitle: '正在规划经 CSCA 的医学路线？',
    ctaSubtitle:
      'SICA 顾问核验项目组合与 MOE 名单、规划早场 CSCA，并围绕医学的早期截止协调语言考试与申请材料。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/mbbs-in-china',
        label: '中国 MBBS——完整指南',
        description: '项目、费用、学制与 MBBS 申请全图。',
      },
      {
        href: '/csca-chemistry-guide',
        label: 'CSCA 化学——大纲与备考',
        description: '医学路线的差异化科目，附五周计划。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '旗舰总览：科目、形式、计分、费用与 CSC 要求。',
      },
    ],
  },
};
