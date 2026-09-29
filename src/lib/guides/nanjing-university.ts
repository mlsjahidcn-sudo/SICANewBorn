import type { LocalizedGuide } from './types';

/**
 * Nanjing University (南大) profile — university profile #6 of 10
 * (docs/university-profiles-10-article-plan.md).
 * Target queries: "nanjing university", "NJU international students",
 * "南大", "Nanjing University admissions".
 */
export const nanjingUniversityGuide: LocalizedGuide = {
  en: {
    slug: 'nanjing-university',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'Nanjing University — History, Programs, Admissions & International Student Guide',
    description:
      'Nanjing University (南大, NJU) — one of China\'s oldest and most prestigious comprehensive universities. History, schools, signature programs, English-taught options, CSCA combinations, scholarships (CSC + provincial + NJU-specific), cost, and practical guidance.',
    subtitle:
      'Nanjing University is one of China\'s oldest universities, with a long tradition in humanities, basic sciences, and engineering. Located in Nanjing — a historic capital with rich cultural heritage — NJU is the flagship of Jiangsu province and one of the top-ranked Chinese universities globally. This profile covers what international applicants need: NJU\'s schools and signature programs, the CSCA subject combinations Nanjing requires, English-taught master\'s options, the scholarship landscape (CSC, Jiangsu provincial scholarship, Nanjing University scholarships), cost of attendance, and practical application timeline.',
    stats: [
      { value: '1902', label: 'Founded as Sanjiang Normal School' },
      { value: 'Multiple', label: 'Schools including Xianlin + Gulou campuses' },
      { value: 'Many', label: 'English-taught master\'s / PhD' },
      { value: 'Nanjing', label: 'Jiangsu provincial flagship' },
    ],
    quickAnswer:
      'Nanjing University (NJU) is one of China\'s oldest comprehensive universities, with strong programs across humanities, sciences, and engineering. International applicants apply through CSCA (mandatory from 2026) plus a study plan. Humanities and social-science programs typically require Humanities Chinese + Math; sciences require Math + Physics or Chemistry combinations. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s; Nanjing is significantly more affordable than Beijing or Shanghai. NJU offers its own scholarships in addition to CSC and the Jiangsu Provincial Government scholarship.',
    keyTakeaways: [
      'Founded 1902 as Sanjiang Normal School; one of China\'s oldest universities',
      'Strengths: humanities (philosophy, history, literature), basic sciences (physics, chemistry, mathematics), engineering, computer science',
      'Nanjing location — historic capital; rich cultural heritage; lower cost of living than Beijing or Shanghai',
      'English-taught master\'s programs across most disciplines; undergraduate English programs growing',
      'CSCA combinations: Humanities Chinese + Math for humanities/social sciences; Math + Physics or Chemistry for sciences',
      'Scholarships: CSC + NJU\'s own + Jiangsu Provincial Government; cost ~¥45,000–¥80,000/year',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'Nanjing University at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'Nanjing University is one of China\'s oldest and most prestigious comprehensive universities, with a long tradition in humanities, basic sciences, and engineering. Located in the historic city of Nanjing — a former national capital with deep cultural roots — NJU is the flagship of Jiangsu province and one of the top-ranked Chinese universities globally. For international applicants considering a strong comprehensive university outside Beijing or Shanghai, Nanjing offers an excellent balance of academic quality, lower cost of living, and rich cultural experience.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from Sanjiang Normal School to today',
        intro:
          'How NJU became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1902 — founded as Sanjiang Normal School (三江师范学堂)** in Nanjing; one of the earliest modern Chinese universities',
              '**1921 — renamed National Southeast University (国立东南大学)**',
              '**1928 — renamed National Central University (国立中央大学)**; major academic center in the Republican era',
              '**1952 — restructuring** absorbed departments from elsewhere; became Nanjing University and built strength in mathematics, physics, chemistry, and humanities',
              '**2000s** — major expansion to Xianlin campus; engineering and computer science programs grew significantly',
              '**Today** — multiple schools across humanities, social sciences, sciences, engineering, and computer science; ~35,000 students including ~3,000 international students; among the top-ranked Chinese universities globally',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For international applicants, NJU\'s 100+ year heritage in humanities and sciences means strong academic expectations across all programs, but its Nanjing location offers a more affordable alternative to Beijing/Shanghai universities.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where NJU is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'NJU schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['School of Philosophy', 'Philosophy, Logic, Ethics, Religion', 'Master\'s in English available'],
              ['Department of Chinese Language & Literature', 'Chinese Literature, Comparative Literature', 'Some master\'s in English'],
              ['Department of History', 'Chinese History, World History, Archaeology', 'Some master\'s in English'],
              ['School of Mathematics & Computer Science', 'Mathematics, Applied Mathematics, Statistics, Computer Science', 'Master\'s in English available'],
              ['School of Physics', 'Physics, Condensed Matter, Optics, Acoustics', 'Master\'s in English available'],
              ['School of Chemistry & Chemical Engineering', 'Chemistry, Chemical Engineering, Materials Chemistry', 'Master\'s in English available'],
              ['School of Life Sciences', 'Biological Sciences, Biotechnology, Ecology', 'Master\'s in English available'],
              ['School of Geography & Ocean Science', 'Geography, GIS, Ocean Science', 'Some master\'s in English'],
              ['School of Earth Sciences & Engineering', 'Geology, Environmental Science', 'Some master\'s in English'],
              ['School of Engineering & Applied Sciences', 'Materials Engineering, Energy Engineering, Biomedical Engineering', 'Some master\'s in English'],
              ['School of Business', 'Economics, Management, Finance, Accounting', 'Some master\'s in English'],
              ['School of International Relations', 'International Relations, Political Science', 'Some master\'s in English'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — smaller than at Peking/Tsinghua; selective English-medium options across sciences and humanities',
              '**Master\'s in English** — substantial breadth across mathematics, physics, chemistry, life sciences, engineering, computer science, and humanities',
              '**PhD in English** — most PhD programs can be completed in English with a Chinese co-supervisor; common for international PhD students',
              '**Strengths to weigh** — philosophy, mathematics, physics, chemistry, history, computer science; a humanities and sciences flagship outside Beijing/Shanghai',
              '**Distinctive advantages** — Nanjing University Press (publishes important academic journals), Nanjing\'s proximity to Suzhou, Shanghai, and Hangzhou',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What NJU actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — NJU\'s programs each specify a CSCA subject combination; humanities typically require Humanities Chinese + Math',
              '**Sit the CSCA early** — for September intake, target the earliest viable session; NJU\'s competitive programs have January–March deadlines',
              '**Prepare the application package** — passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence (HSK for Chinese-taught, IELTS/TOEFL for English-taught)',
              '**Apply online** — through the NJU International Students Office portal; pay the application fee',
              '**Submit before the program deadline** — most fall-intake programs close March–May',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations NJU asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Philosophy / history / Chinese literature', 'Humanities Chinese + Math', 'Study-plan quality often decides'],
              ['Economics / management / international relations', 'Humanities Chinese + Math', 'Some programs add Math-heavy track'],
              ['Mathematics / physics', 'STEM Chinese (sometimes) + Math + Physics', 'Verify per program'],
              ['Chemistry / materials', 'STEM Chinese + Math + Chemistry', 'Some add Physics'],
              ['Life sciences / biotechnology', 'Math + Chemistry', 'Some require Physics too'],
              ['Computer science / engineering', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['Geography / earth sciences', 'STEM Chinese + Math + Physics (or Chemistry)', 'Specialized'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the current CSCA combination and any program-specific requirements. NJU\'s International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund a Nanjing University degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the NJU International Students Office as your host institution',
              '**Nanjing University scholarships** — partial tuition waivers and merit awards; university-managed; check the International Students Office for current offerings',
              '**Jiangsu Provincial Government Scholarship** — for international students studying in Jiangsu Province; tuition waiver + monthly stipend; smaller pool',
              '**Nanjing Municipal Government Scholarship** — for international students studying in Nanjing specifically; tuition waiver + monthly stipend',
              '**Nanjing University\'s Institute of International Students (IIS) awards** — merit-based awards for incoming international students; often combined with CSC',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and NJU-affiliated private scholarships',
              '**Program-specific awards** — select departments offer research assistantships or teaching assistantships that include tuition waivers and a monthly stipend',
              '**Confucius Institute Scholarship** — for international students in Chinese language and culture programs at NJU-affiliated Confucius Institutes',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr crunch applies; NJU\'s international office can advise on the application',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at Nanjing University costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year (varies by program)', 'Some master\'s programs more expensive (MBA, etc.)'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard'],
              ['Living expenses', '¥1,200–¥2,500/month', '¥1,200–¥2,500/month', 'Nanjing is significantly more affordable than Beijing or Shanghai'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme'],
              ['Annual total (typical)', '~¥45,000–¥80,000', '~¥55,000–¥110,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare. NJU\'s own scholarships range from partial tuition waivers to substantial packages. The Jiangsu Provincial Government and Nanjing Municipal Government scholarships are additional options specific to the city.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Nanjing, the campus, international community',
        intro:
          'What it feels like to live and study at Nanjing University.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Xianlin campus** — the modern, larger campus southeast of Nanjing; combines teaching, research, and residential facilities; green-space design',
              '**Gulou campus** — the historic central campus; humanities and some social sciences departments; closer to downtown Nanjing',
              '**Nanjing city** — historic capital; UNESCO-listed Ming-era city wall; rich cultural heritage; lower cost of living than Beijing or Shanghai',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes; mature international student community',
              '**Dining** — multiple cafeterias on campus with halal, vegetarian, and international options; nearby restaurants cover all major Chinese cuisines',
              '**Cultural proximity** — Nanjing is close to Suzhou, Shanghai (1.5 hours by train), and Hangzhou (2 hours); easy weekend travel',
              '**Cost of living in Nanjing** — significantly more affordable than Beijing or Shanghai; dormitory + cooking keeps expenses very manageable',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Nanjing University ranked in world rankings?',
        a: 'Yes — NJU is consistently in the top 150 globally across QS, THE, and ARWU rankings, and is among the top-ranked Chinese universities, particularly on humanities and basic-sciences indicators.',
      },
      {
        q: 'What CSCA subjects does Nanjing University require?',
        a: 'It varies by program. Humanities and social-science programs typically ask for Humanities Chinese + Math; sciences and engineering programs vary. Always check the program\'s official page.',
      },
      {
        q: 'What is NJU known for?',
        a: 'Philosophy, mathematics, physics, chemistry, history, computer science — a humanities and sciences flagship outside Beijing/Shanghai with a 100+ year heritage.',
      },
      {
        q: 'Are there English-taught programs at Nanjing University?',
        a: 'Yes — substantially more at the master\'s level across sciences, mathematics, engineering, and humanities. Undergraduate English programs are smaller but growing.',
      },
      {
        q: 'How much does it cost to study at NJU as an international student?',
        a: 'Typical all-in is ¥45,000–¥80,000/year for a bachelor\'s and ¥55,000–¥110,000 for a master\'s, excluding scholarships. Nanjing is significantly more affordable than Beijing or Shanghai.',
      },
      {
        q: 'Does NJU have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories; early application improves dormitory assignment.',
      },
      {
        q: 'How competitive is NJU for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan.',
      },
      {
        q: 'Does NJU offer scholarships for international students?',
        a: 'Yes — NJU\'s own scholarships, CSC, the Jiangsu Provincial Government scholarship, and the Nanjing Municipal Government scholarship are the main options.',
      },
      {
        q: 'Where is the NJU campus?',
        a: 'NJU has two main campuses in Nanjing. Xianlin is the modern campus southeast of the city; Gulou is the historic central campus.',
      },
      {
        q: 'Is there an application fee for NJU international admissions?',
        a: 'Yes — typically ¥400–¥800 per application, paid online through the application portal.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the NJU International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September intake, target the earliest viable CSCA session. NJU\'s competitive programs have January–March deadlines.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence, application fee.',
      },
      {
        name: 'Apply online through the NJU portal',
        text: 'Submit the full package before the program deadline. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit CSC through the NJU international office; apply for NJU\'s own scholarships, the Jiangsu Provincial Government scholarship, and the Nanjing Municipal Government scholarship. Nanjing-specific options are valuable additions.',
      },
    ],
    ctaTitle: 'Applying to Nanjing University?',
    ctaSubtitle:
      'SICA counselors review your target program\'s CSCA requirements, refine your study plan, and coordinate scholarship applications including provincial and municipal options. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university',
        label: 'Peking University',
        description: 'Beijing\'s humanities and sciences flagship.',
      },
      {
        href: '/fudan-university',
        label: 'Fudan University',
        description: 'Shanghai\'s flagship, NJU\'s strongest peer.',
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
    slug: 'nanjing-university',
    eyebrow: '大学简介',
    title: '南京大学——历史、院系、申请与留学生指南',
    description:
      '南京大学（南大, NJU）——中国最古老、最负盛名的综合性大学之一。历史、院系、特色专业、英语授课选项、CSCA 组合、奖学金（CSC + 省 + 南大自有）、费用与实务指引。',
    subtitle:
      '南京大学是中国最古老的大学之一，在人文、基础科学、工程方面有传统。位于南京——历史古都、文化底蕴深厚，是江苏省的旗舰大学，也是中国顶尖的综合性大学。本简介覆盖国际申请者需要的信息：南大学院与特色专业、CSCA 申请科目、英语授课硕博项目、奖学金图景（CSC、江苏省、南大自有）、留学费用，以及实用申请时间线。',
    stats: [
      { value: '1902', label: '三江师范学堂创立' },
      { value: '多个', label: '仙林 + 鼓楼校区' },
      { value: '多个', label: '英语授课硕博' },
      { value: '南京', label: '江苏省旗舰' },
    ],
    quickAnswer:
      '南京大学是中国最古老的综合性大学之一，在人文、基础科学与工程方面有强势。国际申请者通过 CSCA（2026 起必考）+ 学习计划申请。人文与社科通常要求人文中文 + 数学；理科要求数学 + 物理或化学。学费本科约 ¥30,000–60,000/年；南京生活成本显著低于北京或上海。除 CSC 外，南大有自有奖学金与江苏省奖学金。',
    keyTakeaways: [
      '1902 年创立（三江师范学堂），中国最古老的大学之一',
      '强项：人文（哲学、历史、文学）、基础科学（物理、化学、数学）、工程、计算机',
      '南京位置——历史古都；文化遗产深厚；生活成本低于北京或上海',
      '英语授课硕士项目几乎覆盖全部学科；本科英语项目在增长',
      'CSCA 组合：人文/社科为人文中文 + 数学；理科为数学 + 物理或化学',
      '奖学金：CSC + 南大自有 + 江苏省 + 南京市；费用约 ¥45,000–80,000/年',
    ],
    sections: [
      {
        id: 'overview',
        h2: '南大概览',
        intro: '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '南京大学是中国最古老、最负盛名的综合性大学之一，在人文、基础科学与工程方面有传统。位于历史名城南京——曾是国都、文化底蕴深厚，是江苏省的旗舰大学，也是中国顶尖综合性大学之一。对考虑北京或上海之外优质综合性大学的国际申请者而言，南大提供学术质量、较低生活成本与深厚文化体验的平衡。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从三江师范学堂到今日',
        intro: '南大如何成为今天的学府。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1902 年**——南京创立三江师范学堂；中国最早的现代大学之一',
              '**1921 年**——更名为国立东南大学',
              '**1928 年**——更名为国立中央大学；民国时期的主要学术中心',
              '**1952 年**——院系调整，吸纳其他高校院系；形成数学、物理、化学、人文强势',
              '**2000 年代**——向仙林校区大幅扩展；工程与计算机项目显著增长',
              '**今天**——多个院系覆盖人文、社科、理科、工程、计算机；约 3.5 万学生含约 3,000 国际学生；中国顶尖大学之一',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对国际申请者而言，南大 100 多年的人文与理学传承意味着所有项目都有较高学术期望，但其南京位置提供了比北京/上海更经济的选择。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色项目',
        intro: '南大强势在哪里，申什么。',
        blocks: [
          {
            type: 'table',
            caption: '南大院系与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['哲学系', '哲学、逻辑、伦理学、宗教', '硕士英文可选'],
              ['中国语言文学系', '中国文学、比较文学', '部分硕士英文'],
              ['历史学系', '中国史、世界史、考古', '部分硕士英文'],
              ['数学与计算机科学学院', '数学、应用数学、统计、计算机科学', '硕士英文可选'],
              ['物理学院', '物理、凝聚态、光学、声学', '硕士英文可选'],
              ['化学化工学院', '化学、化工、材料化学', '硕士英文可选'],
              ['生命科学学院', '生物科学、生物技术、生态', '硕士英文可选'],
              ['地理与海洋科学学院', '地理、GIS、海洋科学', '部分硕士英文'],
              ['地球科学与工程学院', '地质、环境科学', '部分硕士英文'],
              ['工程与应用科学学院', '材料工程、能源工程、生物医学工程', '部分硕士英文'],
              ['商学院', '经济、管理、金融、会计', '部分硕士英文'],
              ['国际关系学院', '国际关系、政治学', '部分硕士英文'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本科英语授课项目**——少于北大或清华；理科与人文有选择性英语项目',
              '**硕士英文授课**——数学、物理、化学、生命科学、工程、计算机、人文范围广',
              '**博士英文授课**——多数博士项目可英文完成（需中文共同导师）',
              '**强势权衡**——哲学、数学、物理、化学、历史、计算机；北京/上海之外的人文与理科旗舰',
              '**独特优势**——南京大学出版社（出版重要学术期刊）；临近苏州、上海、杭州',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro: '南大实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——南大每个项目都指定 CSCA 科目组合；人文通常要求人文中文 + 数学',
              '**早点考 CSCA**——9 月入学最早考一次；南大竞争项目 1-3 月截止',
              '**备齐申请材料**——护照、成绩单、学习计划、2 封推荐信、语言证明',
              '**网上申请**——通过南大留学生办公室门户；付申请费',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试',
            ],
          },
            {
              type: 'table',
              caption: '南大常见 CSCA 组合（逐项目核验）',
              columns: ['项目族', '常见 CSCA 组合', '说明'],
              rows: [
                ['哲学 / 历史 / 中文', '人文中文 + 数学', '学习计划质量常决定'],
                ['经济 / 管理 / 国际关系', '人文中文 + 数学', '部分加重数学'],
                ['数学 / 物理', '理工中文（部分）+ 数学 + 物理', '逐项目核验'],
                ['化学 / 材料', '理工中文 + 数学 + 化学', '部分加物理'],
                ['生命科学 / 生物技术', '数学 + 化学', '部分也要求物理'],
                ['计算机 / 工程', '理工中文 + 数学 + 物理', '量化筛选'],
                ['地理 / 地球科学', '理工中文 + 数学 + 物理（或化学）', '专业向'],
              ],
            },
            {
              type: 'callout',
            tone: 'info',
            text: '始终查项目的官方录取页确认当年组合。南大留学生办以英文回复书面问询，一般几个工作日内。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro: '如何为南大学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过南大留学生办作为接收单位申请',
              '**南大自有奖学金**——学费减免与优秀奖；校方管理；查留学生办当年公告',
              '**江苏省政府奖学金**——在江苏学习的国际生；学费减免 + 月津贴；名额较少',
              '**南京市政府奖学金**——在南京学习的国际生；学费减免 + 月津贴',
              '**南大国际学生学院（IIS）奖项**——基于优秀的入学奖学金；常与 CSC 配合',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、南大相关私立奖学金',
              '**项目专项奖**——部分院系提供研究助理或教学助理，含学费减免与月津贴',
              '**孔子学院奖学金**——南大附属孔子学院的汉语言文化项目',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用；南大留学生办可指导申请',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro: '在南大一年的花销。',
        blocks: [
          {
            type: 'table',
              caption: '留学费用（规划近似值）',
              columns: ['项目', '本科', '硕士', '说明'],
              rows: [
                ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年', '部分硕士更贵'],
                ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍'],
                ['生活费', '¥1,200–2,500/月', '¥1,200–2,500/月', '南京比北京/上海便宜'],
                ['医保', '¥800/年', '¥800/年', '强制基础方案'],
                ['年度合计（典型）', '约 ¥45,000–80,000', '约 ¥55,000–110,000', '不含奖学金'],
              ],
            },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 覆盖学费、住宿、月津贴与机票。南大自有奖学金从学费减免到大额套餐不等；江苏省政府与南京市政府奖学金是省市两级的补充。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——南京、校园、国际社群',
        intro: '在南大生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**仙林校区**——现代、较大的校园在南京东南部；教学/科研/住宿一体；绿地设计',
              '**鼓楼校区**——历史中心校区；人文与部分社科院系；靠近南京市区',
              '**南京城**——历史古都；联合国教科文组织的明代城墙；文化遗产深厚；生活成本低于北京/上海',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划；成熟的国际学生社群',
              '**餐饮**——多个校园食堂提供清真、素食、国际窗口；附近餐馆覆盖中国主要菜系',
              '**文化邻近**——南京靠近苏州、上海（1.5 小时高铁）、杭州（2 小时）；周末出行方便',
              '**南京生活成本**——显著低于北京或上海；宿舍加自己做饭能把支出压得很低',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '南京大学在世界排名里怎么样？',
        a: '是——南大长期位列 QS、THE、ARWU 全球前 150，是中国人文与基础科学指标领先的大学之一。',
      },
      {
        q: '南大要求哪些 CSCA 科目？',
        a: '按项目而定。人文与社科通常要求人文中文 + 数学；理科各异。始终查项目官方页面。',
      },
      {
        q: '南大以什么出名？',
        a: '哲学、数学、物理、化学、历史、计算机——北京/上海之外的人文与理科旗舰。',
      },
      {
        q: '南大有英语授课项目吗？',
        a: '有——硕士层面广泛，理科、数学、工程、人文都有。',
      },
      {
        q: '在南大读一年多少钱？',
        a: '本科通常 ¥45,000–80,000/年，硕士 ¥55,000–110,000/年，不含奖学金。南京显著比北京/上海便宜。',
      },
      {
        q: '南大给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍；早申有助于拿到好分配。',
      },
      {
        q: '南大录取国际生竞争多大？',
        a: '中国最严格之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。',
      },
      {
        q: '南大给国际生提供奖学金吗？',
        a: '是——南大自有奖学金、CSC、江苏省政府奖学金、南京市政府奖学金是主要选项。',
      },
      {
        q: '南大校园在哪？',
        a: '南大在南京有两个主校区。仙林是南京市东南部的现代校区；鼓楼是历史中心校区。',
      },
      {
        q: '南大申请费多少？',
        a: '通常每份 ¥400–800，通过申请门户在线支付。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览南大留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。南大竞争项目 1-3 月截止。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字）、2 封学术推荐信、语言证明、申请费。',
      },
      {
        name: '通过南大门户网上申请',
        text: '项目截止前提交完整材料。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）。',
      },
      {
        name: '并行申请奖学金',
        text: '通过南大留学生办提交 CSC 申请；符合条件时申请南大、江苏省与南京市政府奖学金。南京特有的选项是重要补充。',
      },
    ],
    ctaTitle: '正在申请南京大学？',
    ctaSubtitle:
      'SICA 顾问核对目标项目的 CSCA 要求、优化你的学习计划、并协调包括省/市级奖学金在内的各项奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university',
        label: '北京大学',
        description: '北京的人文与理科旗舰。',
      },
      {
        href: '/fudan-university',
        label: '复旦大学',
        description: '上海旗舰，南大最强同行。',
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
