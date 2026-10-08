import type { LocalizedGuide } from './types';

/**
 * "MOE-listed MBBS universities in China 2026-27" — Phase 147 SEO
 * Task 5 #3. Target queries: "moe listed universities mbbs",
 * "moe approved mbbs universities china", "english medium mbbs
 * china list".
 *
 * Facts: only MOE-listed universities may teach clinical medicine
 * in English to international students; the 2026-27 list counts
 * 43 or 45 depending on source [verify]; regulators: NMC FMGL 2021
 * criteria [verify], PM&DC [verify], BM&DC [verify]; CSCA subjects
 * by university where published.
 */
export const moeMbbsGuide: LocalizedGuide = {
  en: {
    slug: 'moe-listed-mbbs-universities-china',
    eyebrow: 'GUIDE · MBBS LIST',
    title: 'MOE-Listed MBBS Universities in China 2026-27',
    description:
      'What the MOE MBBS list is, why only listed universities may teach clinical medicine in English (43 or 45 schools [verify]), what regulators require, and CSCA subjects by university.',
    subtitle:
      'China\'s Ministry of Education (MOE) publishes the list of universities permitted to teach clinical medicine in English to international students — the 2026-27 list counts 43 or 45 universities depending on the source [verify]. Only these universities can award an English-taught MBBS that WHO lists and your regulator will assess.',
    stats: [
      { value: '43 or 45', label: 'Universities on the list [verify]' },
      { value: '6 years', label: 'MBBS duration (incl. internship)' },
      { value: 'English', label: 'Only listed schools may teach in' },
      { value: 'CSCA', label: 'Required by many MBBS programs' },
    ],
    quickAnswer:
      'The MOE list is the official register of Chinese universities permitted to teach clinical medicine (MBBS) in English to international students — the 2026-27 edition counts 43 or 45 universities depending on the source [verify]. Studying MBBS at a non-listed university means an English-taught clinical degree that is not recognized in the WHO directory pathway, which regulators like India\'s NMC (FMGL 2021 criteria [verify]), Pakistan\'s PM&DC [verify], and Bangladesh\'s BM&DC [verify] assess against. Many listed universities now also require the CSCA — Math for everyone, plus Chemistry and/or Physics per university. Confirm both the current list and each university\'s CSCA subjects before applying.',
    keyTakeaways: [
      'Only MOE-listed universities may teach clinical medicine in English to international students',
      'The 2026-27 list counts 43 or 45 universities depending on the source [verify] — always confirm the current edition',
      'Non-listed "English MBBS" degrees fail the WDOMS/regulator pathway — check before paying any fee',
      'Regulator checks: India NMC FMGL 2021 criteria [verify], Pakistan PM&DC [verify], Bangladesh BM&DC [verify]',
      'Many listed universities require the CSCA (Math + Chemistry/Physics per school) — next sittings Nov/Dec 2026, Jan 2027',
      'The SICA catalog lists MOE-listed programs with tuition and language — see the table on /mbbs-in-china',
    ],
    sections: [
      {
        id: 'what-is-list',
        h2: 'What the MOE list is — and what it is not',
        intro:
          'The list is a permission register, not a ranking. Its only question: which universities may teach clinical medicine in English to international students.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Who publishes it** — China\'s Ministry of Education, updated periodically; the 2026-27 edition counts 43 or 45 universities depending on the source [verify]',
              '**What inclusion means** — the university may enroll international students in English-taught clinical medicine (MBBS)',
              '**What it does not mean** — inclusion is not a quality ranking; within the list, tuition, city, and internship hospitals differ widely',
              '**The WHO connection** — listed universities appear in the World Directory of Medical Schools (WDOMS), the baseline most regulators check',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If a university outside the current list offers you an "English-taught MBBS", the degree will not carry the recognition pathway you are paying for. Verify the list, not the brochure.',
          },
        ],
      },
      {
        id: 'regulators',
        h2: 'What your regulator requires after graduation',
        intro:
          'The MOE list gets you a recognized degree; your home regulator decides what you can do with it.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**India (NMC)** — a China MBBS must meet the FMGL 2021 criteria; the qualifying exam follows current NMC policy [verify both before choosing a university]',
              '**Pakistan (PM&DC)** — registration and the licensing exam run through the current regulator; confirm its name and rules for the year you graduate [verify]',
              '**Bangladesh (BM&DC)** — the BMDC registration exam applies to foreign graduates',
              '**US / UK / Australia** — USMLE, PLAB, and AMC pathways assess any WDOMS-listed degree; program-level coaching support varies by university',
              '**Rule of thumb** — check your regulator\'s CURRENT criteria first, then pick a listed university that fits them',
            ],
          },
        ],
      },
      {
        id: 'csca-by-university',
        h2: 'CSCA subjects by university',
        intro:
          'Many MOE-listed MBBS programs now require the CSCA. The subject combination is set university-by-university in each admission notice.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Math is required for everyone** — no exceptions',
              '**Chemistry and/or Physics** — required by many MBBS programs; the exact combination appears in each university\'s admission notice',
              '**Next confirmed sittings** — Nov 14-15 2026 (register Oct 15-21, Beijing time), Dec 19-20 2026, Jan 23-24 2027; mainly online at home with a live proctor',
              '**Fee** — RMB 450 for one subject / RMB 700 for two or more (csca.cn)',
              '**Free practice** — https://cscaprep.academy offers mocks and study plans for every sitting',
              '**Where SICA fits** — our counselors track which listed universities require which subjects; the full MBBS context lives at /mbbs-in-china and /csca-mbbs-applicants',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How many universities are on the MOE MBBS list?',
        a: 'The 2026-27 list counts 43 or 45 universities depending on the source [verify]. The count shifts as the MOE updates the register — always confirm the current edition and the university\'s presence on it before applying.',
      },
      {
        q: 'What happens if I study MBBS at a non-listed university?',
        a: 'An English-taught clinical medicine degree from a non-listed university does not carry the recognition pathway: it will not support the WDOMS-based licensing routes that regulators like NMC, PM&DC, and BM&DC assess. Treat any such offer as a red flag.',
      },
      {
        q: 'Is the MOE list the same as a ranking?',
        a: 'No. The list is a permission register — it says which universities MAY teach clinical medicine in English to international students. Quality, tuition, and internship hospitals vary widely within the list; use rankings and program fit to choose among listed schools.',
      },
      {
        q: 'Do MOE-listed MBBS programs require the CSCA?',
        a: 'Many do. The CSCA is required for CSC scholarship undergraduate applicants, and many universities — including many English-taught MBBS programs — require it for direct admission. Math is required for everyone; Chemistry and/or Physics depend on each university\'s notice. Free practice: cscaprep.academy',
      },
      {
        q: 'Which document proves a university is on the list?',
        a: 'The MOE\'s published notice for the current cycle, cross-checkable against the university\'s own international-student page and the WHO World Directory of Medical Schools (WDOMS). If a school cannot be found in those sources, do not rely on an agent\'s assurance.',
      },
    ],
    howToSteps: [
      {
        name: 'Check your regulator\'s current criteria',
        text: 'NMC FMGL 2021 (India) [verify], PM&DC (Pakistan) [verify], BM&DC (Bangladesh), or USMLE/PLAB/AMC pathways — know what your degree must satisfy before choosing a university.',
      },
      {
        name: 'Verify the university is on the current MOE list',
        text: '43 or 45 schools for 2026-27 [verify]. Cross-check the MOE notice, the university\'s page, and WDOMS. Never trust a brochure alone.',
      },
      {
        name: 'Note the university\'s CSCA subjects',
        text: 'Math is universal; Chemistry and/or Physics vary. Register at csca.cn for the Nov 14-15 sitting (window Oct 15-21) if you need a score for September 2027.',
      },
      {
        name: 'Compare listed universities by fit',
        text: 'Tuition (typically RMB 30,000-45,000/year), city, internship hospital load, and regulator track record — the SICA catalog lists MOE-listed programs at /mbbs-in-china.',
      },
      {
        name: 'Apply and verify everything in writing',
        text: 'Submit through the university\'s official portal; keep the admission notice, JW202, and every fee receipt. On arrival, convert the X1 visa to a residence permit within 30 days.',
      },
    ],
    ctaTitle: 'Choosing an MBBS university?',
    ctaSubtitle:
      'SICA counselors verify the current MOE list against your regulator\'s criteria, check each school\'s CSCA subjects, and build your application timeline. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China 2027',
        description: 'The full MBBS guide: tuition, CSCA, eligibility, scholarships, and licensing.',
      },
      {
        href: '/csca-mbbs-applicants',
        label: 'CSCA for MBBS applicants',
        description: 'Subject combinations, timing, and licensing context for medicine.',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA exam dates 2026-27',
        description: 'Next sittings and registration windows.',
      },
    ],
  },
  zh: {
    slug: 'moe-listed-mbbs-universities-china',
    eyebrow: '指南 · MBBS 名单',
    title: '2026-27 教育部认可 MBBS 大学名单',
    description:
      '教育部 MBBS 名单是什么、为什么只有名单内大学可英文授课临床医学（43 或 45 所 [待核实]）、各国监管要求，及各校 CSCA 科目。',
    subtitle:
      '中国教育部公布可向国际学生英文授课临床医学的大学名单——2026-27 版依来源为 43 或 45 所 [待核实]。只有这些大学能授予进入 WHO 名录通道的英文授课 MBBS 学位，供本国监管机构审核。',
    stats: [
      { value: '43 或 45 所', label: '名单大学数 [待核实]' },
      { value: '6 年', label: 'MBBS 学制（含实习）' },
      { value: '英文', label: '仅名单内可英文授课' },
      { value: 'CSCA', label: '许多 MBBS 项目要求' },
    ],
    quickAnswer:
      '教育部名单是允许向国际学生英文授课临床医学（MBBS）的中国大学官方名册——2026-27 版依来源为 43 或 45 所 [待核实]。在名单外大学读「英文 MBBS」意味着学位无法进入 WHO 名录通道，也就无法通过印度 NMC（FMGL 2021 标准 [待核实]）、巴基斯坦 PM&DC [待核实]、孟加拉 BM&DC [待核实] 等监管审核。许多名单内大学现也要求 CSCA——数学全员必考，化学和/或物理因校而异。申请前同时核实现行名单与各校 CSCA 科目要求。',
    keyTakeaways: [
      '只有教育部名单内大学可向国际学生英文授课临床医学',
      '2026-27 名单依来源为 43 或 45 所 [待核实]——务必核实现行版本',
      '名单外的「英文 MBBS」学位无法通过 WDOMS/监管通道——缴费前先查',
      '监管核对：印度 NMC FMGL 2021 标准 [待核实]、巴基斯坦 PM&DC [待核实]、孟加拉 BM&DC [待核实]',
      '许多名单内大学要求 CSCA（数学 + 化学/物理，因校而异）——下一批场次 2026 年 11/12 月、2027 年 1 月',
      'SICA 目录列出教育部认可项目及学费与授课语言——见 /mbbs-in-china',
    ],
    sections: [
      {
        id: 'what-is-list',
        h2: '教育部名单是什么——又不是什么',
        intro:
          '这份名单是许可名册，不是排名。它只回答一个问题：哪些大学可向国际学生英文授课临床医学。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**发布方**——中国教育部，不定期更新；2026-27 版依来源为 43 或 45 所 [待核实]',
              '**入选意味着什么**——该大学可招收国际学生就读英文授课临床医学（MBBS）',
              '**不意味着什么**——入选不是质量排名；名单内各校学费、城市与实习医院差异很大',
              '**与 WHO 的关系**——名单内大学列入世界医学院名录（WDOMS），是多数监管机构核对的基线',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '若名单外大学向你提供「英文授课 MBBS」，该学位不携带你为之付费的认证通道。核实名单，而不是宣传册。',
          },
        ],
      },
      {
        id: 'regulators',
        h2: '毕业后你的监管机构要求什么',
        intro:
          '教育部名单给你受认可的学位；本国的监管机构决定你能用它做什么。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**印度（NMC）**——中国 MBBS 须满足 FMGL 2021 标准；资格考试按 NMC 现行政策 [择校前双核实]',
              '**巴基斯坦（PM&DC）**——注册与执业考试经现行监管机构；毕业当年确认其名称与规则 [待核实]',
              '**孟加拉（BM&DC）**——外国毕业生参加 BMDC 注册考试',
              '**美 / 英 / 澳**——USMLE、PLAB、AMC 通道评估任何 WDOMS 列名学位；各校的备考支持差异较大',
              '**通用法则**——先查本国监管机构的现行标准，再选符合标准的名单内大学',
            ],
          },
        ],
      },
      {
        id: 'csca-by-university',
        h2: '各校 CSCA 科目',
        intro:
          '许多教育部认可的 MBBS 项目现要求 CSCA。科目组合由各校招生通知逐一确定。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**数学全员必考**——无例外',
              '**化学和/或物理**——许多 MBBS 项目要求；确切组合见各校招生通知',
              '**已确认场次**——2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日；以居家线上、真人监考为主',
              '**费用**——单科 450 元、两科及以上 700 元（csca.cn）',
              '**免费练习**——https://cscaprep.academy 提供每场次模拟与学习计划',
              '**SICA 的角色**——顾问跟踪各名单大学要求哪些科目；完整 MBBS 背景见 /mbbs-in-china 与 /csca-mbbs-applicants',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '教育部 MBBS 名单有多少所大学？',
        a: '2026-27 名单依来源为 43 或 45 所 [待核实]。数量随教育部更新而变——申请前务必核实现行版本及目标大学是否在列。',
      },
      {
        q: '在名单外大学读 MBBS 会怎样？',
        a: '名单外大学的英文授课临床医学学位不携带认证通道：无法支撑 NMC、PM&DC、BM&DC 等监管机构审核的 WDOMS 执业路径。任何此类录取都应视为危险信号。',
      },
      {
        q: '教育部名单等于排名吗？',
        a: '不是。名单是许可名册——只说明哪些大学「可以」向国际学生英文授课临床医学。名单内各校质量、学费与实习医院差异很大；请用排名与项目匹配度在名单内选择。',
      },
      {
        q: '教育部认可的 MBBS 项目要求 CSCA 吗？',
        a: '许多要求。CSC 奖学金本科申请者必须提交；许多大学（含许多英文授课 MBBS）对直接录取也要求。数学全员必考；化学和/或物理因校而异。免费练习：cscaprep.academy',
      },
      {
        q: '用什么文件证明大学在名单上？',
        a: '教育部当期公布的通知，并与大学国际生页面及 WHO 世界医学院名录（WDOMS）交叉核对。这些来源查不到的学校，不要依赖中介的口头保证。',
      },
    ],
    howToSteps: [
      {
        name: '查本国监管机构现行标准',
        text: 'NMC FMGL 2021（印度）[待核实]、PM&DC（巴基斯坦）[待核实]、BM&DC（孟加拉）或 USMLE/PLAB/AMC——择校前先明确学位必须满足什么。',
      },
      {
        name: '核实大学在现行教育部名单上',
        text: '2026-27 为 43 或 45 所 [待核实]。交叉核对教育部通知、大学页面与 WDOMS。绝不只信宣传册。',
      },
      {
        name: '记下该大学的 CSCA 科目',
        text: '数学必考；化学和/或物理因校而异。2027 年 9 月入学需成绩者，在 10 月 15-21 日窗口到 csca.cn 报名 11 月 14-15 日场次。',
      },
      {
        name: '按匹配度比较名单内大学',
        text: '学费（通常 30,000-45,000 元/年）、城市、实习医院病源量、监管通道记录——SICA 目录见 /mbbs-in-china。',
      },
      {
        name: '申请并书面留痕',
        text: '经大学官方门户提交；保留录取通知、JW202 与每张缴费凭证。抵华后 30 天内将 X1 签证换发为居留许可。',
      },
    ],
    ctaTitle: '正在挑选 MBBS 大学？',
    ctaSubtitle:
      'SICA 顾问用本国监管标准核对现行教育部名单、检查各校 CSCA 科目、并制定申请时间线。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/mbbs-in-china',
        label: '2027 来华 MBBS',
        description: '完整 MBBS 指南：学费、CSCA、申请条件、奖学金与执业。',
      },
      {
        href: '/csca-mbbs-applicants',
        label: 'MBBS 申请者的 CSCA',
        description: '科目组合、时间安排与执业背景。',
      },
      {
        href: '/csca-exam-dates',
        label: 'CSCA 考试时间 2026-27',
        description: '下一批场次与报名窗口。',
      },
    ],
  },
};
