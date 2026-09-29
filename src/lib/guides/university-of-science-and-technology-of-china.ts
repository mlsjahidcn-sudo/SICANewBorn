import type { LocalizedGuide } from './types';

/**
 * University of Science and Technology of China (USTC, 中科大)
 * profile — university profile #7 of 10.
 * Target queries: "USTC admission", "USTC international students",
 * "中国科学技术大学", "Hefei university".
 */
export const ustcGuide: LocalizedGuide = {
  en: {
    slug: 'university-of-science-and-technology-of-china',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'USTC — University of Science and Technology of China — Sciences, Programs & International Admissions',
    description:
      'University of Science and Technology of China (USTC, 中科大) — CAS-affiliated sciences powerhouse in Hefei. History, signature programs (physics, mathematics, computer science, chemistry), English-taught options, CSCA combinations, scholarships (CSC + CAS + USTC-specific), cost, and practical guidance.',
    subtitle:
      'USTC is China\'s top sciences-focused research university, established by the Chinese Academy of Sciences in 1958 in Hefei. The only university directly affiliated with the CAS, USTC is renowned for basic sciences (physics, mathematics, computer science, chemistry) and increasingly for engineering and management. For international applicants considering physics, math, computer science, or chemistry at a research-intensive Chinese university, USTC is often the top option alongside Peking and Tsinghua.',
    stats: [
      { value: '1958', label: 'Founded by the Chinese Academy of Sciences' },
      { value: 'Multiple', label: 'Schools and research institutes' },
      { value: 'Many', label: 'English-taught master\'s / PhD' },
      { value: 'Hefei', label: 'Anhui provincial flagship' },
    ],
    quickAnswer:
      'USTC is China\'s top sciences-focused research university, established by the CAS in 1958. International applicants apply through CSCA (mandatory from 2026) plus a study plan. Sciences and engineering programs typically require STEM Chinese + Math + Physics or Chemistry. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s; USTC offers CAS-affiliated scholarships in addition to CSC, plus the USTC fellowships for outstanding applicants. Hefei is significantly more affordable than Beijing or Shanghai.',
    keyTakeaways: [
      'Founded 1958 by the Chinese Academy of Sciences — the only university directly affiliated with the CAS',
      'Strengths: physics, mathematics, computer science, chemistry, life sciences — the top sciences powerhouse in China',
      'Strong CAS partnership for graduate research; labs and resources tied to CAS institutes',
      'English-taught master\'s and PhD programs across most sciences; selective English undergraduate options',
      'CSCA combinations: STEM Chinese + Math + Physics for most sciences; Math + Chemistry for chemistry and life sciences',
      'Scholarships: CSC + CAS-affiliated scholarships + USTC fellowships; cost ~¥45,000–¥75,000/year (Hefei is affordable)',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'USTC at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'USTC is China\'s top sciences-focused research university, established by the Chinese Academy of Sciences in 1958. The only university directly affiliated with the CAS, USTC is renowned for basic sciences (physics, mathematics, computer science, chemistry) and increasingly for engineering and management. For international applicants considering physics, math, computer science, or chemistry at a research-intensive Chinese university, USTC is often the top option alongside Peking and Tsinghua, with the advantage of lower cost of living in Hefei.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from CAS founding to sciences powerhouse',
        intro:
          'How USTC became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1958 — founded by the Chinese Academy of Sciences** in Beijing; the only university directly under CAS, founded to train scientists for the national academy\'s research institutes',
              '**1970 — moved to Hefei, Anhui Province** as part of wartime-era dispersal planning; the relocation defined USTC\'s physical and cultural home',
              '**1978s onward** — became one of China\'s key national universities under Project 211 (1995) and Project 985 (1998); a core CAS-affiliated research university',
              '**1990s–2000s** — major investment in basic sciences and engineering; grew the computer science department into one of the strongest in China',
              '**2010s–present** — first Chinese university to host a quantum computing research program; continued investment in sciences and selective expansion into engineering, management, and international programs',
              '**Today** — multiple schools and research institutes across sciences, engineering, computer science, and management; ~16,000 students including ~1,500 international students; among the top-ranked Chinese universities globally',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For international applicants, USTC\'s CAS partnership is its distinctive advantage: graduate students can often work in CAS labs with both university and CAS resources, which is unique in Chinese higher education.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where USTC is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'USTC schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['School of Physical Sciences', 'Physics, Applied Physics, Optics, Acoustics', 'Master\'s in English available'],
              ['School of Mathematical Sciences', 'Mathematics, Applied Mathematics, Statistics, Computational Mathematics', 'Master\'s in English available'],
              ['School of Chemistry & Materials Science', 'Chemistry, Materials Chemistry, Polymer Chemistry', 'Master\'s in English available'],
              ['School of Computer Science & Technology', 'Computer Science, Software Engineering, AI, Information Security', 'Master\'s in English available'],
              ['School of Information Science & Technology', 'Information Science, Electronic Engineering, Automation', 'Master\'s in English available'],
              ['School of Life Sciences', 'Biological Sciences, Biotechnology, Biomedical Sciences', 'Master\'s in English available'],
              ['School of Earth and Space Sciences', 'Geology, Geophysics, Astronomy', 'Master\'s in English available'],
              ['School of Engineering Science', 'Thermal Engineering, Materials Science, Mechanics', 'Master\'s in English available'],
              ['School of Management', 'Management, Business Administration, Finance', 'Some master\'s in English'],
              ['School of Humanities & Social Sciences', 'Foreign Languages, Communication, Philosophy', 'Some master\'s in English'],
              ['USTC-QSTECH Quantum Computing Joint Lab', 'Quantum computing research and education', 'Research labs in English'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — smaller than at Peking/Tsinghua; selective English-medium options across sciences and computer science',
              '**Master\'s in English** — substantial breadth across sciences, computer science, engineering; particularly strong in physics and mathematics',
              '**PhD in English** — most PhD programs can be completed in English; CAS lab partnerships allow English-language research',
              '**Strengths to weigh** — physics, mathematics, computer science, chemistry; the top sciences powerhouse in China outside of CAS labs themselves',
              '**Distinctive advantages** — direct CAS partnership for graduate research; quantum computing research; Hefei\'s lower cost of living',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What USTC actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — USTC\'s programs each specify a CSCA subject combination; physics/math require STEM Chinese + Math + Physics; chemistry/life sciences require Math + Chemistry',
              '**Sit the CSCA early** — for September intake, target the earliest viable session; USTC\'s competitive science programs have January–March deadlines',
              '**Prepare the application package** — passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence (HSK for Chinese-taught, IELTS/TOEFL for English-taught)',
              '**Apply online** — through the USTC International Students Office portal; pay the application fee',
              '**Submit before the program deadline** — most fall-intake programs close March–May',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations USTC asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Physics / applied physics', 'STEM Chinese + Math + Physics', 'Verify per program'],
              ['Mathematics / statistics / applied math', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['Chemistry / materials chemistry', 'STEM Chinese + Math + Chemistry', 'Some add Physics'],
              ['Computer science / AI / software engineering', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['Information science / electronic engineering', 'STEM Chinese + Math + Physics', 'Engineering fundamentals'],
              ['Life sciences / biotechnology', 'Math + Chemistry', 'Some require Physics too'],
              ['Earth and space sciences / geology', 'STEM Chinese + Math + Physics', 'Specialized'],
              ['Management / business administration', 'Math (sometimes + STEM Chinese)', 'Some master\'s in English'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the current CSCA combination. USTC\'s International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund a USTC degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the USTC International Students Office as your host institution',
              '**CAS-affiliated scholarships** — USTC\'s CAS affiliation unlocks specific scholarship paths through CAS partner institutes; check the International Students Office for current offerings',
              '**USTC fellowships** — partial tuition waivers and merit awards; university-managed; competitive for outstanding science applicants',
              '**Anhui Provincial Government Scholarship** — for international students studying in Anhui Province; tuition waiver + monthly stipend',
              '**CAS-affiliated research positions** — graduate students often work in CAS labs with stipend; a distinctive advantage of USTC',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and USTC-affiliated private scholarships',
              '**Program-specific awards** — select departments offer research assistantships or teaching assistantships that include tuition waivers and a monthly stipend',
              '**Confucius Institute Scholarship** — for international students in Chinese language and culture programs at USTC-affiliated Confucius Institutes',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr crunch applies; USTC\'s international office can advise on the application',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at USTC costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year (varies by program)', 'Some programs more expensive'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard'],
              ['Living expenses', '¥1,200–¥2,500/month', '¥1,200–¥2,500/month', 'Hefei is affordable'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme'],
              ['Annual total (typical)', '~¥45,000–¥75,000', '~¥55,000–¥105,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare. USTC\'s own fellowships range from partial tuition waivers to substantial packages. The CAS affiliation adds a distinctive research-institute path that other universities cannot match.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Hefei, the campus, international community',
        intro:
          'What it feels like to live and study at USTC.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Main campus** — the primary campus in southwestern Hefei (Shushan District); combines teaching, research, and residential facilities; modern design',
              '**CAS-affiliated research institutes** — USTC students often work in CAS institutes in Hefei (including the Hefei Institutes of Physical Science); a distinctive advantage',
              '**Hefei city** — capital of Anhui Province; growing tech hub (home to iFlytek, USTC alumni-founded AI companies); lower cost of living than Beijing or Shanghai',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes',
              '**Dining** — multiple cafeterias on campus with halal, vegetarian, and international options',
              '**Research culture** — USTC\'s smaller campus and CAS partnership create a close, research-intensive culture; many undergraduates participate in lab work',
              '**Cost of living in Hefei** — significantly more affordable than Beijing or Shanghai; dormitory + cooking keeps expenses very manageable',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is USTC ranked in world rankings?',
        a: 'Yes — USTC is consistently in the top 100 globally across QS, THE, and ARWU rankings, particularly strong on natural-sciences indicators. It is often the top Chinese university for physics and basic sciences outside Peking and Tsinghua.',
      },
      {
        q: 'What CSCA subjects does USTC require?',
        a: 'It varies by program. Physics and mathematics typically ask for STEM Chinese + Math + Physics; chemistry and life sciences usually ask for Math + Chemistry. Always check the program\'s official page.',
      },
      {
        q: 'What is USTC known for?',
        a: 'Physics, mathematics, computer science, chemistry — the top sciences powerhouse in China, with the unique advantage of direct CAS affiliation.',
      },
      {
        q: 'Are there English-taught programs at USTC?',
        a: 'Yes — substantial at the master\'s level across sciences, computer science, and engineering. The CAS-affiliated research labs also operate in English.',
      },
      {
        q: 'How much does it cost to study at USTC as an international student?',
        a: 'Typical all-in is ¥45,000–¥75,000/year for a bachelor\'s and ¥55,000–¥105,000 for a master\'s, excluding scholarships. Hefei is significantly more affordable than Beijing or Shanghai.',
      },
      {
        q: 'Does USTC have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories; early application improves dormitory assignment.',
      },
      {
        q: 'How competitive is USTC for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan.',
      },
      {
        q: 'Does USTC offer scholarships for international students?',
        a: 'Yes — USTC\'s own fellowships, CSC, the CAS-affiliated scholarships, the Anhui Provincial Government scholarship, and CAS-lab research positions are the main options.',
      },
      {
        q: 'Where is the USTC campus?',
        a: 'The main campus is in southwestern Hefei, Anhui Province (Shushan District).',
      },
      {
        q: 'Is there an application fee for USTC international admissions?',
        a: 'Yes — typically ¥400–¥800 per application, paid online through the application portal.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the USTC International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September intake, target the earliest viable CSCA session. USTC\'s competitive science programs have January–March deadlines.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence, application fee.',
      },
      {
        name: 'Apply online through the USTC portal',
        text: 'Submit the full package before the program deadline. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant.',
      },
      {
        name: 'Apply for scholarships in parallel — CAS research positions included',
        text: 'Submit CSC through the USTC international office; apply for USTC\'s own fellowships and the Anhui Provincial Government scholarship. The CAS affiliation opens a distinctive research-institute path that other universities cannot match.',
      },
    ],
    ctaTitle: 'Applying to USTC?',
    ctaSubtitle:
      'SICA counselors review your target program\'s CSCA requirements, refine your study plan, and coordinate scholarship applications including CAS-affiliated research positions. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university',
        label: 'Peking University',
        description: 'Beijing\'s sciences flagship.',
      },
      {
        href: '/tsinghua-university',
        label: 'Tsinghua University',
        description: 'Beijing\'s engineering powerhouse.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The exam that determines what combinations you can apply with.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'The full-funding scholarship path.',
      },
    ],
  },
  zh: {
    slug: 'university-of-science-and-technology-of-china',
    eyebrow: '大学简介',
    title: '中科大——中国科学技术大学，理学、院系与留学生申请',
    description:
      '中国科学技术大学（中科大, USTC）——中科院直属的合肥理学强校。历史、特色专业（物理、数学、计算机、化学）、英语授课选项、CSCA 组合、奖学金（CSC + 中科院 + 中科大自有）、费用与实务指引。',
    subtitle:
      '中科大是中国顶级理学研究型大学，1958 年由中国科学院创办于合肥。是唯一直接隶属中科院的大学，以基础科学（物理、数学、计算机、化学）闻名，工程与管理也越来越强。对考虑物理、数学、计算机或化学研究型学府的申请者，中科大是常与北大、清华并列的首选，且合肥生活成本更低。',
    stats: [
      { value: '1958', label: '中科院创立' },
      { value: '多个', label: '院系与研究所' },
      { value: '多个', label: '英语授课硕博' },
      { value: '合肥', label: '安徽省旗舰' },
    ],
    quickAnswer:
      '中科大是中国顶级理学研究型大学，1958 年由中科院创办。国际申请者通过 CSCA（2026 起必考）+ 学习计划申请。理工通常要求理工中文 + 数学 + 物理或化学。学费本科约 ¥30,000–60,000/年；中科大除 CSC 外还有中科院相关奖学金与中科大自有奖学金；合肥显著比北京或上海便宜。',
    keyTakeaways: [
      '1958 年由中科院创办——唯一直接隶属中科院的大学',
      '强项：物理、数学、计算机、化学、生命科学——中国顶级理学强校',
      '与中科院紧密合作的硕博研究；实验室与资源对接中科院研究所',
      '英语授课硕博项目几乎覆盖全部理学；选择性英语本科选项',
      'CSCA 组合：理工为理工中文 + 数学 + 物理；化学与生科为数学 + 化学',
      '奖学金：CSC + 中科院相关 + 中科大自有；费用约 ¥45,000–75,000/年（合肥便宜）',
    ],
    sections: [
      {
        id: 'overview',
        h2: '中科大概览',
        intro: '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '中科大是中国顶级理学研究型大学，1958 年由中科院创办。是唯一直接隶属中科院的大学，以基础科学（物理、数学、计算机、化学）闻名，工程与管理也越来越强。对考虑物理、数学、计算机或化学研究型学府的申请者而言，中科大是常与北大、清华并列的首选，且合肥生活成本更低。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从中科院创立到理学强校',
        intro: '中科大如何成为今天的学府。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1958 年**——中科院在北京创办；唯一直接隶属中科院的大学',
              '**1970 年**——迁至安徽合肥；搬迁定义了中科大的物理与文化家园',
              '**1978 年后**——进入 211 工程（1995）与 985 工程（1998）；中科院直属核心研究型大学',
              '**1990–2000 年代**——在基础科学与工程方面加大投入；计算机系成长为国内顶尖',
              '**2010 年代至今**——率先在国内开展量子计算研究；在科学、管理与国际项目方面持续投入',
              '**今天**——多个院系与研究所覆盖理学、工程、计算机、管理；约 1.6 万学生含约 1,500 国际学生；中国顶尖大学之一',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对国际申请者而言，中科大的中科院合作是其差异化优势：研究生常能在中科院实验室使用大学与中科院双重资源，这是中国高等教育中独有的。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色项目',
        intro: '中科大强势在哪里，申什么。',
        blocks: [
          {
            type: 'table',
            caption: '中科大院系与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['物理学院', '物理、应用物理、光学、声学', '硕士英文可选'],
              ['数学科学学院', '数学、应用数学、统计、计算数学', '硕士英文可选'],
              ['化学与材料科学学院', '化学、材料化学、高分子化学', '硕士英文可选'],
              ['计算机科学与技术学院', '计算机科学、软件工程、AI、信息安全', '硕士英文可选'],
              ['信息科学与技术学院', '信息科学、电子工程、自动化', '硕士英文可选'],
              ['生命科学学院', '生物科学、生物技术、生物医学', '硕士英文可选'],
              ['地球与空间科学学院', '地质、地球物理、天文', '硕士英文可选'],
              ['工程科学学院', '热能工程、材料科学、力学', '硕士英文可选'],
              ['管理学院', '管理、工商管理、金融', '部分硕士英文'],
              ['人文与社会科学学院', '外语、传播、哲学', '部分硕士英文'],
              ['USTC-QSTECH 量子计算联合实验室', '量子计算研究与教育', '英文实验室'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本科英语授课项目**——少于北大或清华；理科与计算机有选择性英语项目',
              '**硕士英文授课**——理科、计算机、工学范围广；物理与数学尤为突出',
              '**博士英文授课**——多数博士项目可英文完成；中科院实验室合作允许英文研究',
              '**强势权衡**——物理、数学、计算机、化学；北大清华之外的顶级理学强校',
              '**独特优势**——中科院直接合作的硕博研究；量子计算研究；合肥较低生活成本',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro: '中科大实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——中科大每个项目都指定 CSCA 科目组合；物理/数学要求理工中文 + 数学 + 物理；化学/生科要求数学 + 化学',
              '**早点考 CSCA**——9 月入学最早考一次；中科大竞争理科项目 1-3 月截止',
              '**备齐申请材料**——护照、成绩单、学习计划、2 封推荐信、语言证明',
              '**网上申请**——通过中科大留学生办公室门户；付申请费',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试',
            ],
          },
            {
              type: 'table',
              caption: '中科大常见 CSCA 组合（逐项目核验）',
              columns: ['项目族', '常见 CSCA 组合', '说明'],
              rows: [
                ['物理 / 应用物理', '理工中文 + 数学 + 物理', '逐项目核验'],
                ['数学 / 统计 / 应用数学', '理工中文 + 数学 + 物理', '量化筛选'],
                ['化学 / 材料化学', '理工中文 + 数学 + 化学', '部分加物理'],
                ['计算机 / AI / 软件工程', '理工中文 + 数学 + 物理', '量化筛选'],
                ['信息科学 / 电子工程', '理工中文 + 数学 + 物理', '工科基础'],
                ['生命科学 / 生物技术', '数学 + 化学', '部分也要求物理'],
                ['地球与空间科学 / 地质', '理工中文 + 数学 + 物理', '专业向'],
                ['管理 / 工商管理', '数学（有时加理工中文）', '部分硕士英文'],
              ],
            },
            {
              type: 'callout',
            tone: 'info',
            text: '始终查项目的官方录取页确认当年组合。中科大留学生办以英文回复书面问询，一般几个工作日内。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro: '如何为中科大学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过中科大留学生办作为接收单位申请',
              '**中科院相关奖学金**——中科院合作开通专属奖学金路径；查留学生办当年公告',
              '**中科大自有奖学金**——学费减免与优秀奖；校方管理；理科杰出申请者竞争激烈',
              '**安徽省政府奖学金**——在安徽学习的国际生；学费减免 + 月津贴',
              '**中科院相关研究岗位**——研究生常在中科院实验室工作并领津贴；中科大独家的优势',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、中科大相关私立奖学金',
              '**项目专项奖**——部分院系提供研究助理或教学助理，含学费减免与月津贴',
              '**孔子学院奖学金**——中科大附属孔子学院的汉语言文化项目',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用；中科大留学生办可指导申请',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro: '在中科大一年的花销。',
        blocks: [
          {
            type: 'table',
              caption: '留学费用（规划近似值）',
              columns: ['项目', '本科', '硕士', '说明'],
              rows: [
                ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年', '部分项目更贵'],
                ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍'],
                ['生活费', '¥1,200–2,500/月', '¥1,200–2,500/月', '合肥便宜'],
                ['医保', '¥800/年', '¥800/年', '强制基础方案'],
                ['年度合计（典型）', '约 ¥45,000–75,000', '约 ¥55,000–105,000', '不含奖学金'],
              ],
            },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 覆盖学费、住宿、月津贴与机票。中科大自有奖学金从学费减免到大额套餐不等；中科院合作开通其他大学没有的独特路径；安徽省政府奖学金是省级补充。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——合肥、校园、国际社群',
        intro: '在中科大生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**主校区**——合肥市西南部（蜀山区）；教学/科研/住宿一体；现代设计',
              '**中科院相关研究所**——中科大学生常在合肥的中科院研究所工作（含合肥物质科学研究院）；独特优势',
              '**合肥城**——安徽省会；新兴科技中心（科大讯飞总部等中科大校友创办的 AI 公司）；生活成本低于北京/上海',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划',
              '**餐饮**——多个校园食堂提供清真、素食、国际窗口',
              '**研究文化**——较小校园与中科院合作营造紧密的研究型氛围；许多本科生参与实验室工作',
              '**合肥生活成本**——显著低于北京或上海；宿舍加自己做饭能压得很低',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中科大在世界排名里怎么样？',
        a: '是——中科大长期位列 QS、THE、ARWU 全球前 100，在自然科学指标上尤强。在物理与基础科学方面常是北大清华之外的中国顶尖。',
      },
      {
        q: '中科大要求哪些 CSCA 科目？',
        a: '按项目而定。物理与数学通常要求理工中文 + 数学 + 物理；化学与生科常为数学 + 化学。始终查项目官方页面。',
      },
      {
        q: '中科大以什么出名？',
        a: '物理、数学、计算机、化学——中国顶级理学强校，独有的中科院直属优势。',
      },
      {
        q: '中科大有英语授课项目吗？',
        a: '有——硕士层面广泛，理科、计算机、工学都有。中科院相关实验室也以英语运行。',
      },
      {
        q: '在中科大读一年多少钱？',
        a: '本科通常 ¥45,000–75,000/年，硕士 ¥55,000–105,000/年，不含奖学金。合肥显著比北京/上海便宜。',
      },
      {
        q: '中科大给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍；早申有助于拿到好分配。',
      },
      {
        q: '中科大录取国际生竞争多大？',
        a: '中国最严格之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。',
      },
      {
        q: '中科大给国际生提供奖学金吗？',
        a: '是——中科大自有奖学金、CSC、中科院相关奖学金、安徽省政府奖学金，以及中科院实验室研究岗位是主要选项。',
      },
      {
        q: '中科大校园在哪？',
        a: '主校区在合肥市西南部（蜀山区），安徽。',
      },
      {
        q: '中科大申请费多少？',
        a: '通常每份 ¥400–800，通过申请门户在线支付。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览中科大留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。中科大竞争理科项目 1-3 月截止。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字）、2 封学术推荐信、语言证明、申请费。',
      },
      {
        name: '通过中科大门户网上申请',
        text: '项目截止前提交完整材料。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）。',
      },
      {
        name: '并行申请奖学金——含中科院研究岗位',
        text: '通过中科大留学生办提交 CSC 申请；符合条件时申请中科大与安徽省政府奖学金。中科院合作开通其他大学没有的研究所路径。',
      },
    ],
    ctaTitle: '正在申请中科大？',
    ctaSubtitle:
      'SICA 顾问核对目标项目的 CSCA 要求、优化你的学习计划、并协调各项奖学金申请（包括中科院研究岗位）。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university',
        label: '北京大学',
        description: '北京的理科旗舰。',
      },
      {
        href: '/tsinghua-university',
        label: '清华大学',
        description: '北京的工科强校。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '决定你能拿什么科目组合去申请的那场考试。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: '全额资助奖学金路径。',
      },
    ],
  },
};
