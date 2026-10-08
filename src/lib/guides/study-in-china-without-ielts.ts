import type { LocalizedGuide } from './types';

/**
 * "Study in China without IELTS (2027)" — Phase 147 SEO Task 5 #5.
 * Target queries: "study in china without ielts", "china universities
 * without english test", "ielts waiver china".
 *
 * Facts: IELTS is typically waived when 1) prior degree was taught
 * in English (4-year English-medium undergrad), 2) the applicant is
 * from a country where English is an official language, 3) the
 * university runs its own English interview/placement test. Per-
 * university policy [verify].
 */
export const noIeltsGuide: LocalizedGuide = {
  en: {
    slug: 'study-in-china-without-ielts',
    eyebrow: 'GUIDE · ENGLISH-TEST WAIVERS',
    title: 'Study in China without IELTS (2027)',
    description:
      'Studying in China without IELTS or TOEFL: when waivers apply (prior English-medium degree, official-language country), and when they don\'t',
    subtitle:
      'You can study at English-taught Chinese universities without IELTS or TOEFL in three situations: you completed a 4-year English-medium degree at an officially recognized institution; you come from a country where English is an official language; or you sit the university\'s own English placement test. Each university sets its own waiver policy — there is no central CLE list, so check your target\'s international-student page before applying.',
    stats: [
      { value: '3 paths', label: 'Prior degree · official language · placement test' },
      { value: 'No CLE', label: 'No central waiver list — per university' },
      { value: 'Verify', label: 'Always check each target university' },
      { value: 'CSCA', label: 'Required separately for bachelor\'s' },
    ],
    quickAnswer:
      'You can study at English-taught Chinese universities without IELTS or TOEFL in three situations. (1) Prior 4-year English-medium degree at an officially recognized institution — most universities waive English test scores if your prior degree was taught entirely in English for the full 4-year duration. (2) Official-language country — applicants from countries where English is the official language are commonly waived; check whether your country is on each university\'s published list. (3) University English placement test — the university interviews or tests you itself, and you waive the external test if you pass. There is no central waiver list — every university publishes its own policy [verify each target\'s international-student page]. The CSCA is a separate requirement that does not waive the English test or vice versa.',
    keyTakeaways: [
      'Three typical waiver paths: 4-year English-medium prior degree, official-English-language country, university English placement test',
      'There is no central CLE/waiver list — every university sets its own policy [verify each target]',
      'The 4-year rule is strict: short programs, online programs, and language institutes usually do not qualify as the qualifying English-medium credential',
      'Some universities waive English test for native English speakers (broadly defined) or for applicants with 4-year English-taught secondary school',
      'CSCA and English-test are independent — passing one does not waive the other',
      'Always confirm with your target university\'s current notice before relying on a waiver',
    ],
    sections: [
      {
        id: 'three-waiver-paths',
        h2: 'The three typical English-test waiver paths',
        intro:
          'Each path runs through the target university. Per-university policy — there is no central CLE list.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Path 1 — 4-year English-medium prior degree** — most waive external English tests if your undergrad (or master\'s) was taught entirely in English for the full 4-year duration at an officially recognized institution. Short programs, online programs, and language institutes usually do not qualify',
              '**Path 2 — Official-language country** — many universities waive English tests when the applicant is a national of (or completed secondary school in) a country where English is the official language. Each university publishes the list of accepted countries — check before assuming',
              '**Path 3 — University English placement test** — many universities run their own English interview/oral assessment or written placement test. Pass it and you waive the external test; fail it and most universities offer a 1-semester language bridge',
              '**Path 4 (rare) — MOE-published exemptions** — a few scholarship paths waive the English test by category (CSC scholarship undergraduate applicants typically still need a language proof unless the program is Chinese-taught)',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The CSCA is not an English-test replacement. CSCA tests academic competency (Math, Physics, Chemistry, and sometimes Professional Chinese). Universities ask for language proof in addition to the CSCA, not in place of it.',
          },
        ],
      },
      {
        id: 'what-might-surprise',
        h2: 'What might surprise applicants',
        intro:
          'The most common "I thought I qualified for a waiver" moments — and how to check before you apply.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Two-year master\'s counts as "4-year"?** — no, almost never; the 4-year qualifier typically refers to the undergrad credential',
              '**Online degree counts?** — no, by default. Some universities accept fully-online English-medium degrees from specifically recognized institutions; the safe default is "no"',
              '**Foundation year + degree counts?** — usually no; the foundation year is not itself the bachelor\'s, and the 4-year rule applies to the bachelor\'s, not the bridging year',
              '**Dual-language degree (English + Chinese)?** — depends on whether the medium of instruction is documented as 100% English; partial English-medium degrees often do not qualify',
              '**Native English speaker without formal proof** — accepted by some schools as a self-declared status, by others only with documentation',
              '**Always confirm with your target** — per-university, per-cycle; the published notice is the only ground to rely on',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I study in China without IELTS?',
        a: 'Yes, in three situations: (1) you completed a 4-year English-medium degree at an officially recognized institution; (2) you are from a country where English is the official language; or (3) you pass the university\'s own English placement test. Each university sets its own policy [verify each target].',
      },
      {
        q: 'Does a 2-year master\'s count as a 4-year English-medium credential?',
        a: 'No, almost never. The 4-year qualifier typically refers to the undergrad credential. Check with your target university if your master\'s degree is the only English-medium credential you have.',
      },
      {
        q: 'Does an online English-medium degree waive the IELTS?',
        a: 'By default, no. Some universities accept fully-online English-medium degrees from specifically recognized institutions; the safe default is that online programs do not meet the 4-year English-medium criterion. Verify with your target.',
      },
      {
        q: 'Does passing the CSCA waive the IELTS?',
        a: 'No — they are separate. The CSCA tests academic competency (Math, Physics, Chemistry, sometimes Professional Chinese). English tests test English. Universities ask for both, separately.',
      },
      {
        q: 'Does an English-medium secondary school count?',
        a: 'Some universities waive English tests for applicants whose secondary education was taught entirely in English (4-year secondary, English-medium school on the university\'s accepted list). It is not universal — verify per university.',
      },
    ],
    howToSteps: [
      {
        name: 'Identify which waiver path applies',
        text: 'Path 1 = 4-year English-medium prior degree at a recognized institution. Path 2 = official-language country on the university\'s list. Path 3 = pass the university\'s English placement test.',
      },
      {
        name: 'Gather the supporting documentation',
        text: 'Medium-of-Instruction letter from your prior institution; passport showing your country; or a note from the target that they accept your profile in Path 2. Documentation closes 90% of waiver disputes.',
      },
      {
        name: 'Confirm with your target\'s current notice',
        text: 'Open the university\'s international-student page for the current cycle. Look for "English language requirements" — the published notice overrides any agent or alumni claim.',
      },
      {
        name: 'Apply and bring the proof',
        text: 'Mark the waiver on the application form; attach the documentation; if the university does not see the waiver, expect a language-bridge semester.',
      },
    ],
    ctaTitle: 'Not sure whether you need IELTS?',
    ctaSubtitle:
      'SICA counselors check each target\'s English waiver rules against your credential and pick universities where your profile qualifies — or tell you which tests to sit. First consultation free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/application',
        label: 'How to apply to Chinese universities',
        description: 'Language requirements, document package, and the application timeline.',
      },
      {
        href: '/chinese-university-application-deadlines',
        label: 'China university application deadlines 2027',
        description: 'September + March intake deadlines across Chinese universities.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China 2027',
        description: 'Universities that waive English tests for medium-of-instruction proof.',
      },
    ],
  },
  zh: {
    slug: 'study-in-china-without-ielts',
    eyebrow: '指南 · 英文成绩豁免',
    title: '2027 不考雅思也能来华读书',
    description:
      '免雅思/托福来华读书：什么时候可以豁免（4 年英文授课学位、官方语言国），什么时候不可以',
    subtitle:
      '免英文成绩就读英文授课的中国大学有三种情况：在官方认可的机构完成 4 年英文授课学位；来自英语为官方语言的国家；或通过大学自己的英文测试。每所大学有自己的豁免政策——没有中央统一清单，先查目标学校的国际生页面。',
    stats: [
      { value: '3 条路径', label: '前置学位 · 官方语言国 · 大学测试' },
      { value: '无 CLE', label: '无统一豁免名单——逐校' },
      { value: '核实', label: '务必查每所目标' },
      { value: 'CSCA', label: '本科另须，不能互免' },
    ],
    quickAnswer:
      '不考雅思/托福也能在英文授课的中国大学读书有三种情况。(1) 在官方认可机构完成 4 年英文授课学位——多数大学若你本科（或硕士）全程 4 年英文授课，则免外部英语测试；短期项目、网课、语言学校通常不算。(2) 官方语言国家——大学若你来自（或就读高中于）英语为官方语言的国家，常可豁免；每所大学公布自己的清单。(3) 大学英文测试——学校自行面试或笔试，通过即可豁免；不通过通常有一学期语言桥接。没有中央豁免名单——每所大学各是独立政策 [逐校核实]。CSCA 与英文测试是独立的两件事，不可互免。',
    keyTakeaways: [
      '三条典型豁免路径：4 年英文授课前置学位、官方语言国、大学英文测试',
      '没有中央统一清单——每所大学各是独立政策 [逐校核实]',
      '4 年规则很严：短期项目、网课、语言学校通常不符合英文授课前置',
      '部分大学对以英语为官方语言的国家学生豁免，或接受 4 年英文中学',
      'CSCA 与英文测试独立——通过一项不豁免另一项',
      '申请前务必以目标大学当期通知为准',
    ],
    sections: [
      {
        id: 'three-waiver-paths',
        h2: '三条典型英文成绩豁免路径',
        intro:
          '每条路径都通过目标大学——逐校政策，没有中央统一清单。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**路径 1——4 年英文授课前置学位**——多数大学若你本科（或硕士）全程 4 年英文授课、毕业自已认可学校，则免外部英语测试；短期项目、网课、语言学校通常不算',
              '**路径 2——官方语言国家**——大学若你来自（或就读高中于）英语为官方语言的国家，常可豁免；每所大学公布清单——勿凭印象假设',
              '**路径 3——大学英文测试**——许多大学自行面试或笔试，通过即免外部测试；不通过通常提供一学期语言桥接',
              '**路径 4（罕见）——MOE 公布的豁免**——少数奖学金路径按类别豁免英文测试（CSC 本科奖学金申请者除非项目是中文授课，否则仍须语言证明）',
              '',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSCA 不是英文测试的替代品。CSCA 考学术能力（数学、物理、化学、有时专业中文）；英文测试考英语。大学同时要求这两项，互不替代。',
          },
        ],
      },
      {
        id: 'what-might-surprise',
        h2: '常见「我以为可以豁免」误区',
        intro:
          '最常见的「以为可以豁免」瞬间——以及申请前如何核实。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**2 年制硕士算 4 年吗？**——基本不算；4 年通常指本科前置',
              '**网课算吗？**——默认不算；少数大学接受特定认可的纯网课英文授课学位；默认「不算」',
              '**预科 + 学位算吗？**——通常不算；预科不是学士学位本身，4 年规则适用于学位',
              '**双语学位（中英）呢？**——视授课语言是否 100% 英文证明而定；部分英文授课通常不豁免',
              '**母语英语但无正式证明？**——部分学校接受自我申报，部分只认文件',
              '**始终以目标为准**——逐校逐期；当期通知是唯一可靠依据',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '不考雅思能来华读书吗？',
        a: '可以，三种情况：(1) 在官方认可机构完成 4 年英文授课学位；(2) 来自英语为官方语言的国家；(3) 通过大学自己的英文测试。每所大学各是独立政策 [逐校核实]。',
      },
      {
        q: '2 年硕士算 4 年英文授课前置吗？',
        a: '基本不算。4 年通常指本科前置。若你只有硕士这一英文授课凭证，请先向目标大学核实。',
      },
      {
        q: '网课英文授课学位算吗？',
        a: '默认不算。少数大学接受特定认可的纯网课英文授课学位；默认「不算」。向目标大学核实。',
      },
      {
        q: '通过 CSCA 能豁免雅思吗？',
        a: '不能——两者独立。CSCA 考学术能力（数学、物理、化学、有时专业中文）；英文测试考英语。大学同时要求这两项，分开。',
      },
      {
        q: '英文中学算吗？',
        a: '部分大学对中学全程英文授课（在大学接受清单内）的学生豁免；不是通用的。逐校核实。',
      },
    ],
    howToSteps: [
      {
        name: '判断适用的豁免路径',
        text: '路径 1 = 4 年英文授课前置学位（认可机构）；路径 2 = 官方语言国家（在大学清单内）；路径 3 = 通过大学英文测试。',
      },
      {
        name: '准备支持材料',
        text: '前置机构的授课语言证明；显示国籍的护照；或目标学校接受你路径 2 的说明。材料能解决 90% 的豁免争议。',
      },
      {
        name: '以当期通知为准',
        text: '打开大学的国际生页面，找「English language requirements」——当期通知压过任何代理或校友说法。',
      },
      {
        name: '申请并附上证明',
        text: '在申请表标记豁免，附材料；若学校没看到豁免，准备一学期语言桥接。',
      },
    ],
    ctaTitle: '不确定是否需要雅思？',
    ctaSubtitle:
      'SICA 顾问把每所目标的英文豁免规则与你的学历比对，挑出你符合条件的大学——或告诉你该考什么。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/application',
        label: '中国大学申请流程',
        description: '语言要求、材料包与申请时间线。',
      },
      {
        href: '/chinese-university-application-deadlines',
        label: '2027 中国大学申请截止日',
        description: '9 月 + 3 月入学的中国大学截止日。',
      },
      {
        href: '/best-universities-china',
        label: '2027 中国最佳大学',
        description: '对授课语言证明开放豁免的大学。',
      },
    ],
  },
};