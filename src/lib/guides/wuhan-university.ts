import type { LocalizedGuide } from './types';

/**
 * Wuhan University (武大) profile — university profile #8 of 10.
 * Target queries: "wuhan university", "whu international students",
 * "武汉大学", "Wuhan University admissions".
 */
export const wuhanUniversityGuide: LocalizedGuide = {
  en: {
    slug: 'wuhan-university',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'Wuhan University — Comprehensive Flagship on the Yangtze, Programs & International Admissions',
    description:
      'Wuhan University (武大, WHU) — one of China\'s most beautiful and prestigious comprehensive universities. History, signature programs (sciences, engineering, humanities, medicine), English-taught options, CSCA combinations, scholarships (CSC + Hubei provincial + WHU-specific), cost, and practical guidance.',
    subtitle:
      'Wuhan University is one of China\'s oldest comprehensive universities, with a long tradition in sciences, engineering, humanities, and medicine. Located in Wuhan — the largest city in central China and a growing tech and education hub — WHU is famous for its beautiful campus on the shores of East Lake and its strong international programs. This profile covers what international applicants need: WHU\'s schools and signature programs, CSCA subject combinations, English-taught master\'s options, the scholarship landscape (CSC, Hubei provincial scholarship, Wuhan University scholarships), cost of attendance, and practical application timeline.',
    stats: [
      { value: '1893', label: 'Founded as Ziqiang Institute' },
      { value: 'Multiple', label: 'Schools including 4 campuses' },
      { value: 'Many', label: 'English-taught master\'s / PhD' },
      { value: 'Wuhan', label: 'Hubei provincial flagship' },
    ],
    quickAnswer:
      'Wuhan University is one of China\'s oldest comprehensive universities, with strong programs across sciences, engineering, humanities, and medicine. International applicants apply through CSCA (mandatory from 2026) plus a study plan. Sciences typically require STEM Chinese + Math + Physics; humanities require Humanities Chinese + Math; medicine requires Math + Chemistry. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s; Wuhan is significantly more affordable than Beijing or Shanghai. WHU offers its own scholarships in addition to CSC and the Hubei Provincial Government scholarship.',
    keyTakeaways: [
      'Founded 1893 as Ziqiang Institute; one of China\'s oldest universities',
      'Strengths: sciences (physics, chemistry, mathematics, life sciences), engineering, humanities, medicine',
      'Wuhan location — central China\'s largest city; growing tech hub; lower cost of living than Beijing or Shanghai',
      'Beautiful East Lake campus; one of China\'s most-photographed university grounds',
      'English-taught master\'s programs across most disciplines; selective English undergraduate options',
      'CSCA combinations: STEM Chinese + Math + Physics for sciences; Humanities Chinese + Math for humanities; Math + Chemistry for medicine',
      'Scholarships: CSC + WHU\'s own + Hubei Provincial Government; cost ~¥45,000–¥75,000/year',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'Wuhan University at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'Wuhan University is one of China\'s oldest comprehensive universities, with a long tradition in sciences, engineering, humanities, and medicine. Located in Wuhan — the largest city in central China and a growing tech and education hub — WHU is famous for its beautiful campus on the shores of East Lake and its strong international programs. For international applicants considering a strong comprehensive university outside Beijing or Shanghai, WHU offers excellent academic quality at a significantly more affordable cost.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from Ziqiang Institute to comprehensive flagship',
        intro:
          'How WHU became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1893 — founded as Ziqiang Institute (自强学堂)** in Wuhan; one of the earliest modern Chinese universities',
              '**1902s** — became Hubei Self-strengthening School (湖北方言学堂)',
              '**1928 — renamed National Wuhan University (国立武汉大学)** under the Republic of China',
              '**1952 — restructuring** absorbed departments from elsewhere; built strength in sciences, engineering, and humanities',
              '**2000s** — major expansion; merger with four other Wuhan-area universities (Wuhan Surveying, Hubei Medical, Wuhan Water Conservancy, Wuhan Railway) significantly expanded the university',
              '**Today** — multiple schools across sciences, engineering, humanities, and medicine; ~70,000 students including ~7,000 international students; one of the top-ranked Chinese universities globally',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For international applicants, WHU\'s East Lake campus is one of the most beautiful in China; the campus itself is a recruiting asset for students choosing between large comprehensive universities.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where WHU is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'WHU schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['School of Physical Sciences & Technology', 'Physics, Materials Physics, Optoelectronics', 'Master\'s in English available'],
              ['School of Chemistry & Molecular Sciences', 'Chemistry, Applied Chemistry', 'Master\'s in English available'],
              ['School of Mathematics & Statistics', 'Mathematics, Applied Mathematics, Statistics', 'Master\'s in English available'],
              ['School of Life Sciences', 'Biological Sciences, Biotechnology, Ecology', 'Master\'s in English available'],
              ['School of Computer Science', 'Computer Science, Software Engineering, Information Security', 'Master\'s in English available'],
              ['School of Electrical Engineering', 'Electrical Engineering, Automation', 'Master\'s in English available'],
              ['School of Power & Energy Engineering', 'Thermal Engineering, Nuclear Engineering, Hydropower', 'Some master\'s in English'],
              ['School of Civil Engineering', 'Civil Engineering, Hydraulic Engineering, Architecture', 'Some master\'s in English'],
              ['School of Information Management', 'Information Science, Library Science, Archives', 'Some master\'s in English'],
              ['School of Chinese Language & Literature', 'Chinese Literature, Linguistics, Classical Studies', 'Some master\'s in English'],
              ['School of History', 'Chinese History, World History, Archaeology', 'Some master\'s in English'],
              ['School of Philosophy', 'Philosophy, Logic, Ethics', 'Some master\'s in English'],
              ['School of Economics & Management', 'Economics, Management, Finance', 'Some master\'s in English'],
              ['School of Law', 'Law, International Law', 'Some master\'s in English'],
              ['School of Medicine', 'Clinical Medicine, Public Health, Pharmacy, Nursing', 'Some master\'s in English'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — selective English-medium options; the international programs in some sciences and management',
              '**Master\'s in English** — substantial breadth across sciences, engineering, computer science, and humanities',
              '**PhD in English** — most PhD programs can be completed in English with a Chinese co-supervisor',
              '**Strengths to weigh** — physics, chemistry, mathematics, life sciences, water resources engineering, traditional humanities; the comprehensive flagship for central China',
              '**Distinctive advantages** — East Lake campus; Wuhan\'s growing tech and education hub; large international student community',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What WHU actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — WHU\'s programs each specify a CSCA subject combination; sciences typically require STEM Chinese + Math + Physics',
              '**Sit the CSCA early** — for September intake, target the earliest viable session; WHU\'s competitive programs have January–March deadlines',
              '**Prepare the application package** — passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence (HSK for Chinese-taught, IELTS/TOEFL for English-taught)',
              '**Apply online** — through the WHU International Students Office portal; pay the application fee',
              '**Submit before the program deadline** — most fall-intake programs close March–May',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations WHU asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Physics / chemistry / mathematics', 'STEM Chinese + Math + Physics', 'Verify per program'],
              ['Computer science / electrical engineering', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['Life sciences / biotechnology', 'Math + Chemistry', 'Some require Physics too'],
              ['Civil / hydraulic engineering', 'STEM Chinese + Math + Physics', 'Specialized but strong'],
              ['Chinese literature / history / philosophy', 'Humanities Chinese + Math', 'Study-plan quality often decides'],
              ['Economics / management / law', 'Humanities Chinese + Math', 'Some programs add Math-heavy track'],
              ['Clinical medicine / public health / pharmacy', 'Math + Chemistry', 'MBBS 6 years; verify specific requirements'],
              ['International relations / political science', 'Humanities Chinese + Math', 'Specialized'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the current CSCA combination. WHU\'s International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund a Wuhan University degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the WHU International Students Office as your host institution',
              '**Wuhan University scholarships** — partial tuition waivers and merit awards; university-managed; check the International Students Office for current offerings',
              '**Hubei Provincial Government Scholarship** — for international students studying in Hubei Province; tuition waiver + monthly stipend; smaller pool',
              '**Wuhan Municipal Government Scholarship** — for international students studying in Wuhan specifically; tuition waiver + monthly stipend',
              '**Confucius Institute Scholarship** — for international students in Chinese language and culture programs at WHU-affiliated Confucius Institutes',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and WHU-affiliated private scholarships',
              '**Program-specific awards** — select departments offer research assistantships or teaching assistantships that include tuition waivers and a monthly stipend',
              '**WHU scholarship stacking** — combining multiple smaller scholarships often beats one large one; the WHU International Students Office can advise on combinations',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr crunch applies; WHU\'s international office can advise on the application',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at Wuhan University costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year (varies by program)', 'Some master\'s programs more expensive'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard'],
              ['Living expenses', '¥1,200–¥2,500/month', '¥1,200–¥2,500/month', 'Wuhan is more affordable than Beijing or Shanghai'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme'],
              ['Annual total (typical)', '~¥45,000–¥75,000', '~¥55,000–¥105,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare. WHU\'s own scholarships range from partial tuition waivers to substantial packages. The Hubei Provincial and Wuhan Municipal scholarships add city-specific options.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Wuhan, the campus, international community',
        intro:
          'What it feels like to live and study at Wuhan University.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**East Lake campus** — the primary campus on the shores of East Lake; one of China\'s most beautiful university grounds; combines teaching, research, and residential facilities with extensive green space',
              '**Other campuses** — the historic campus near the city center; medical campus; engineering campus; each with specific functions',
              '**Wuhan city** — the largest city in central China; Yangtze River crossing; major transportation hub (Beijing–Guangzhou high-speed rail); growing tech and education hub',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes; mature international student community',
              '**Dining** — multiple cafeterias on campus with halal, vegetarian, and international options; Wuhan\'s food scene includes signature breakfast culture (hot dry noodles, etc.)',
              '**Cultural proximity** — Wuhan is within 5 hours of Shanghai, Beijing, Guangzhou, and Chongqing by high-speed rail; easy weekend travel',
              '**Cost of living in Wuhan** — significantly more affordable than Beijing or Shanghai; dormitory + cooking keeps expenses very manageable',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Wuhan University ranked in world rankings?',
        a: 'Yes — WHU is consistently in the top 150 globally across QS, THE, and ARWU rankings, and is among the top-ranked Chinese universities, particularly strong on sciences and water-resources engineering.',
      },
      {
        q: 'What CSCA subjects does Wuhan University require?',
        a: 'It varies by program. Sciences typically ask for STEM Chinese + Math + Physics; humanities require Humanities Chinese + Math; medicine requires Math + Chemistry. Always check the program\'s official page.',
      },
      {
        q: 'What is WHU known for?',
        a: 'Sciences (physics, chemistry, mathematics, life sciences), engineering (especially water resources), traditional humanities, and medicine — the comprehensive flagship for central China.',
      },
      {
        q: 'Are there English-taught programs at Wuhan University?',
        a: 'Yes — substantial at the master\'s level across sciences, engineering, computer science, and humanities. Undergraduate English programs are smaller but growing.',
      },
      {
        q: 'How much does it cost to study at WHU as an international student?',
        a: 'Typical all-in is ¥45,000–¥75,000/year for a bachelor\'s and ¥55,000–¥105,000 for a master\'s, excluding scholarships. Wuhan is significantly more affordable than Beijing or Shanghai.',
      },
      {
        q: 'Does WHU have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories; early application improves dormitory assignment.',
      },
      {
        q: 'How competitive is WHU for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan.',
      },
      {
        q: 'Does WHU offer scholarships for international students?',
        a: 'Yes — WHU\'s own scholarships, CSC, the Hubei Provincial Government scholarship, and the Wuhan Municipal Government scholarship are the main options.',
      },
      {
        q: 'Where is the WHU campus?',
        a: 'WHU has multiple campuses in Wuhan. The primary East Lake campus is on the shores of East Lake; the historic campus is near the city center; the medical campus is separate.',
      },
      {
        q: 'Is there an application fee for WHU international admissions?',
        a: 'Yes — typically ¥400–¥800 per application, paid online through the application portal.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the WHU International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September intake, target the earliest viable CSCA session. WHU\'s competitive programs have January–March deadlines.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence, application fee.',
      },
      {
        name: 'Apply online through the WHU portal',
        text: 'Submit the full package before the program deadline. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit CSC through the WHU international office; apply for WHU\'s own scholarships, the Hubei Provincial Government scholarship, and the Wuhan Municipal Government scholarship. Wuhan-specific options are valuable additions.',
      },
    ],
    ctaTitle: 'Applying to Wuhan University?',
    ctaSubtitle:
      'SICA counselors review your target program\'s CSCA requirements, refine your study plan, and coordinate scholarship applications including provincial and municipal options. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university',
        label: 'Peking University',
        description: 'Beijing\'s sciences flagship.',
      },
      {
        href: '/zhejiang-university',
        label: 'Zhejiang University',
        description: 'Hangzhou\'s flagship, similar comprehensive profile.',
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
    slug: 'wuhan-university',
    eyebrow: '大学简介',
    title: '武汉大学——长江边的综合性旗舰、院系与留学生申请',
    description:
      '武汉大学（武大, WHU）——中国最美、最负盛名的综合性大学之一。历史、特色专业（理科、工科、人文、医学）、英语授课选项、CSCA 组合、奖学金（CSC + 湖北省 + 武大自有）、费用与实务指引。',
    subtitle:
      '武汉大学是中国最古老的综合性大学之一，在理科、工科、人文、医学方面有传统。位于中国中部最大城市武汉——新兴的科技与教育中心——武大以东湖岸边的美丽校园与强大的国际项目闻名。本简介覆盖国际申请者需要的信息：武大学院与特色专业、CSCA 申请科目、英语授课硕博项目、奖学金图景（CSC、湖北省、武大自有）、留学费用，以及实用申请时间线。',
    stats: [
      { value: '1893', label: '自强学堂创立' },
      { value: '多个', label: '含 4 个校区' },
      { value: '多个', label: '英语授课硕博' },
      { value: '武汉', label: '湖北省旗舰' },
    ],
    quickAnswer:
      '武汉大学是中国最古老的综合性大学之一，在理科、工科、人文、医学方面有强势。国际申请者通过 CSCA（2026 起必考）+ 学习计划申请。理科通常要求理工中文 + 数学 + 物理；人文要求人文中文 + 数学；医学要求数学 + 化学。学费本科约 ¥30,000–60,000/年；武汉显著比北京/上海便宜。武大有自有奖学金与 CSC 及湖北省政府奖学金。',
    keyTakeaways: [
      '1893 年创立（自强学堂），中国最古老的大学之一',
      '强项：理科（物理、化学、数学、生命科学）、工科、人文、医学',
      '武汉位置——中国中部最大城市；新兴科技中心；生活成本低于北京或上海',
      '美丽的东湖校园；中国最上镜的大学校园之一',
      '英语授课硕士项目几乎覆盖全部学科；选择性英语本科选项',
      'CSCA 组合：理科为理工中文 + 数学 + 物理；人文为人文中文 + 数学；医学为数学 + 化学',
      '奖学金：CSC + 武大自有 + 湖北省政府；费用约 ¥45,000–75,000/年',
    ],
    sections: [
      {
        id: 'overview',
        h2: '武大概览',
        intro: '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '武汉大学是中国最古老、最负盛名的综合性大学之一，在理科、工科、人文、医学方面有传统。位于中国中部最大城市武汉——新兴的科技与教育中心——武大以东湖岸边的美丽校园与强大的国际项目闻名。对考虑北京或上海之外优质综合性大学的国际申请者而言，武大提供出色的学术质量，且显著更经济。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从自强学堂到综合性旗舰',
        intro: '武大如何成为今天的学府。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1893 年**——武汉创立自强学堂；中国最早的现代大学之一',
              '**1900 年代**——更名湖北方言学堂',
              '**1928 年**——更名为国立武汉大学',
              '**1952 年**——院系调整，吸纳其他高校院系；建立理科、工科、人文强势',
              '**2000 年代**——大规模扩张；与武汉地区四所大学合并（武汉测绘、湖北医科、武汉水利、武汉铁路）大幅扩展了学校',
              '**今天**——多个院系覆盖理科、工科、人文、医学；约 7 万学生含约 7,000 国际学生；中国顶尖大学之一',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对国际申请者而言，武大的东湖校园是中国最美的校园之一；校园本身对在大型综合性大学之间选择的学生是一种吸引力。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色项目',
        intro: '武大强势在哪里，申什么。',
        blocks: [
          {
            type: 'table',
            caption: '武大院系与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['物理科学与技术学院', '物理、材料物理、光电', '硕士英文可选'],
              ['化学与分子科学学院', '化学、应用化学', '硕士英文可选'],
              ['数学与统计学院', '数学、应用数学、统计', '硕士英文可选'],
              ['生命科学学院', '生物科学、生物技术、生态', '硕士英文可选'],
              ['计算机学院', '计算机科学、软件工程、信息安全', '硕士英文可选'],
              ['电气工程学院', '电气工程、自动化', '硕士英文可选'],
              ['动力与能源工程学院', '热能工程、核能工程、水电', '部分硕士英文'],
              ['土木工程学院', '土木工程、水利工程、建筑', '部分硕士英文'],
              ['信息管理学院', '信息科学、图书馆学、档案', '部分硕士英文'],
              ['中国语言文学学院', '中国文学、语言学、古典研究', '部分硕士英文'],
              ['历史学院', '中国史、世界史、考古', '部分硕士英文'],
              ['哲学学院', '哲学、逻辑、伦理学', '部分硕士英文'],
              ['经济与管理学院', '经济、管理、金融', '部分硕士英文'],
              ['法学院', '法学、国际法', '部分硕士英文'],
              ['医学院', '临床医学、公共卫生、药学、护理', '部分硕士英文'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本科英语授课项目**——选择性英语项目；部分科学与管理的国际项目',
              '**硕士英文授课**——理科、工科、计算机、人文范围广',
              '**博士英文授课**——多数博士项目可英文完成（需中文共同导师）',
              '**强势权衡**——物理、化学、数学、生命科学、水利工程、传统人文；中部中国综合性旗舰',
              '**独特优势**——东湖校园；武汉的科技与教育中心；较大的国际学生社群',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro: '武大实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——武大每个项目都指定 CSCA 科目组合；理科通常要求理工中文 + 数学 + 物理',
              '**早点考 CSCA**——9 月入学最早考一次；武大竞争项目 1-3 月截止',
              '**备齐申请材料**——护照、成绩单、学习计划、2 封推荐信、语言证明',
              '**网上申请**——通过武大留学生办公室门户；付申请费',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试',
            ],
          },
            {
              type: 'table',
              caption: '武大常见 CSCA 组合（逐项目核验）',
              columns: ['项目族', '常见 CSCA 组合', '说明'],
              rows: [
                ['物理 / 化学 / 数学', '理工中文 + 数学 + 物理', '逐项目核验'],
                ['计算机 / 电气工程', '理工中文 + 数学 + 物理', '量化筛选'],
                ['生命科学 / 生物技术', '数学 + 化学', '部分也要求物理'],
                ['土木 / 水利工程', '理工中文 + 数学 + 物理', '专业但强'],
                ['中文 / 历史 / 哲学', '人文中文 + 数学', '学习计划质量常决定'],
                ['经济 / 管理 / 法学', '人文中文 + 数学', '部分加重数学'],
                ['临床医学 / 公共卫生 / 药学', '数学 + 化学', 'MBBS 6 年制；具体核验'],
                ['国际关系 / 政治学', '人文中文 + 数学', '专业向'],
              ],
            },
            {
              type: 'callout',
            tone: 'info',
            text: '始终查项目的官方录取页确认当年组合。武大留学生办以英文回复书面问询，一般几个工作日内。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro: '如何为武大学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过武大留学生办作为接收单位申请',
              '**武大自有奖学金**——学费减免与优秀奖；校方管理；查留学生办当年公告',
              '**湖北省政府奖学金**——在湖北学习的国际生；学费减免 + 月津贴；名额较少',
              '**武汉市政府奖学金**——在武汉学习的国际生；学费减免 + 月津贴',
              '**孔子学院奖学金**——武大附属孔子学院的汉语言文化项目',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、武大相关私立奖学金',
              '**项目专项奖**——部分院系提供研究助理或教学助理，含学费减免与月津贴',
              '**武大奖学金叠加**——多笔小额常胜一笔大额；武大留学生办可指导组合',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用；武大留学生办可指导申请',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro: '在武大一年的花销。',
        blocks: [
          {
            type: 'table',
              caption: '留学费用（规划近似值）',
              columns: ['项目', '本科', '硕士', '说明'],
              rows: [
                ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年', '部分硕士更贵'],
                ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍'],
                ['生活费', '¥1,200–2,500/月', '¥1,200–2,500/月', '武汉比北京/上海便宜'],
                ['医保', '¥800/年', '¥800/年', '强制基础方案'],
                ['年度合计（典型）', '约 ¥45,000–75,000', '约 ¥55,000–105,000', '不含奖学金'],
              ],
            },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 覆盖学费、住宿、月津贴与机票。武大自有奖学金从学费减免到大额套餐不等；湖北省与武汉市政府奖学金是省市两级的补充。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——武汉、校园、国际社群',
        intro: '在武大生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**东湖校区**——东湖岸边的校区；中国最美的大学校园之一；教学/科研/住宿一体，绿地广阔',
              '**其他校区**——市中心附近的历史校区；医学院校区；工学院校区；各有特定功能',
              '**武汉城**——中国中部最大城市；长江穿城；主要交通枢纽（京广高铁）；新兴的科技与教育中心',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划；成熟的国际学生社群',
              '**餐饮**——多个校园食堂提供清真、素食、国际窗口；武汉餐饮有标志性的早餐文化（热干面等）',
              '**文化邻近**——武汉距上海、北京、广州、重庆高铁均在 5 小时内；周末出行方便',
              '**武汉生活成本**——显著低于北京或上海；宿舍加自己做饭能压得很低',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '武大在世界排名里怎么样？',
        a: '是——武大长期位列 QS、THE、ARWU 全球前 150，是理科与水利工程指标领先的中国大学之一。',
      },
      {
        q: '武大要求哪些 CSCA 科目？',
        a: '按项目而定。理科通常要求理工中文 + 数学 + 物理；人文要求人文中文 + 数学；医学要求数学 + 化学。始终查项目官方页面。',
      },
      {
        q: '武大以什么出名？',
        a: '理科（物理、化学、数学、生命科学）、工科（尤其水利）、传统人文、医学——中部中国的综合性旗舰。',
      },
      {
        q: '武大有英语授课项目吗？',
        a: '有——硕士层面广泛，理科、工科、计算机、人文都有。本科英语项目较少但在增长。',
      },
      {
        q: '在武大读一年多少钱？',
        a: '本科通常 ¥45,000–75,000/年，硕士 ¥55,000–105,000/年，不含奖学金。武汉显著比北京/上海便宜。',
      },
      {
        q: '武大给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍；早申有助于拿到好分配。',
      },
      {
        q: '武大录取国际生竞争多大？',
        a: '中国最严格之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。',
      },
      {
        q: '武大给国际生提供奖学金吗？',
        a: '是——武大自有奖学金、CSC、湖北省政府奖学金、武汉市政府奖学金是主要选项。',
      },
      {
        q: '武大校园在哪？',
        a: '武大在武汉有多个校区。东湖校区在东湖边；历史校区在市中心附近；医学院校区独立。',
      },
      {
        q: '武大申请费多少？',
        a: '通常每份 ¥400–800，通过申请门户在线支付。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览武大留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。武大竞争项目 1-3 月截止。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字）、2 封学术推荐信、语言证明、申请费。',
      },
      {
        name: '通过武大门户网上申请',
        text: '项目截止前提交完整材料。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）。',
      },
      {
        name: '并行申请奖学金',
        text: '通过武大留学生办提交 CSC 申请；符合条件时申请武大、湖北省与武汉市政府奖学金。武汉特有的选项是重要补充。',
      },
    ],
    ctaTitle: '正在申请武汉大学？',
    ctaSubtitle:
      'SICA 顾问核对目标项目的 CSCA 要求、优化你的学习计划、并协调包括省/市级奖学金在内的各项奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university',
        label: '北京大学',
        description: '北京的理科旗舰。',
      },
      {
        href: '/zhejiang-university',
        label: '浙江大学',
        description: '杭州旗舰，武大类似的综合性画像。',
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
