import type { LocalizedGuide } from './types';

/**
 * Sun Yat-sen University (中山大学, SYSU) profile — university
 * profile #9 of 10. Guangzhou; medicine + business + Pearl River Delta.
 */
export const sunYatSenUniversityGuide: LocalizedGuide = {
  en: {
    slug: 'sun-yat-sen-university',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'Sun Yat-sen University — Guangzhou Flagship, Medicine & Business, Programs & International Admissions',
    description:
      'Sun Yat-sen University (中山大学, SYSU) — the flagship comprehensive university of the Pearl River Delta. History, signature programs (medicine, business, sciences), English-taught options, CSCA combinations, scholarships, cost, and practical guidance.',
    subtitle:
      'Sun Yat-sen University is the flagship comprehensive university of Guangzhou and the Pearl River Delta region, founded in 1924 by Sun Yat-sen. Strong across medicine, business, sciences, and humanities, with five campuses across Guangdong. For international applicants considering medicine, business, or sciences in southern China, SYSU is the top option and one of the most internationally diverse Chinese universities.',
    stats: [
      { value: '1924', label: 'Founded by Sun Yat-sen' },
      { value: '5', label: 'Campuses across Guangdong' },
      { value: 'Many', label: 'English-taught master\'s / PhD' },
      { value: 'Guangzhou', label: 'Pearl River Delta flagship' },
    ],
    quickAnswer:
      'Sun Yat-sen University (SYSU) is the flagship comprehensive university of Guangzhou, with strong programs across medicine, business, sciences, and humanities. International applicants apply through CSCA (mandatory from 2026) plus a study plan. Medical programs require Math + Chemistry; sciences vary; business programs are flexible. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s; Guangzhou is significantly more affordable than Beijing or Shanghai. SYSU offers its own scholarships in addition to CSC, plus the Guangdong Provincial Government scholarship and a substantial international student population.',
    keyTakeaways: [
      'Founded 1924 by Sun Yat-sen — the Pearl River Delta\'s flagship university',
      'Strengths: medicine (one of China\'s strongest medical traditions), business, sciences, humanities',
      'Guangzhou location — China\'s southern economic center; lower cost of living than Beijing or Shanghai; Cantonese cultural hub',
      'English-taught master\'s programs across most disciplines; substantial international student population',
      'CSCA combinations: Math + Chemistry for medical; STEM Chinese + Math + Physics for sciences; Math for business',
      'Scholarships: CSC + Guangdong Provincial Government + SYSU-specific; cost ~¥45,000–¥80,000/year',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'SYSU at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'Sun Yat-sen University is the flagship comprehensive university of Guangzhou and the Pearl River Delta region, founded in 1924 by Sun Yat-sen. Strong across medicine, business, sciences, and humanities, with five campuses across Guangdong Province, SYSU is one of the most internationally diverse Chinese universities and the top option for international applicants considering southern China.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from Sun Yat-sen\'s founding to Pearl River Delta flagship',
        intro:
          'How SYSU became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1924 — founded by Sun Yat-sen** as National Guangdong University (国立广东大学); one of the few Chinese universities founded by a national political figure',
              '**1926 — renamed Sun Yat-sen University** in honor of its founder; became the leading university of southern China',
              '**1952 — restructuring** absorbed departments from elsewhere; strengthened medicine (Sun Yat-sen University of Medical Sciences was a separate institution from 1953 to 2001) and sciences',
              '**2001 — re-merger** with Sun Yat-sen University of Medical Sciences; expanded medical school became one of China\'s strongest',
              '**2000s–2010s** — major expansion across Guangdong; multiple new campuses; international programs grew significantly',
              '**Today** — multiple schools across sciences, engineering, medicine, business, humanities; ~80,000 students including ~6,000 international students; one of the top-ranked Chinese universities globally',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For international applicants, SYSU\'s founding by Sun Yat-sen and its location in the Pearl River Delta give it unique ties to Greater China\'s economic and diaspora networks.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where SYSU is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'SYSU schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['Sun Yat-sen University Cancer Center / Medical School', 'Clinical Medicine (8-year program), Oncology, Public Health, Pharmacy, Nursing', 'Some master\'s in English'],
              ['School of Life Sciences', 'Biological Sciences, Biotechnology, Ecology', 'Master\'s in English available'],
              ['School of Mathematics & Computational Science', 'Mathematics, Applied Mathematics, Statistics, Computational Mathematics', 'Master\'s in English available'],
              ['School of Physics', 'Physics, Applied Physics, Optics, Acoustics', 'Master\'s in English available'],
              ['School of Chemistry & Chemical Engineering', 'Chemistry, Applied Chemistry, Materials Chemistry', 'Master\'s in English available'],
              ['School of Information Science & Technology', 'Computer Science, Software Engineering, Information Security, AI', 'Master\'s in English available'],
              ['School of Engineering', 'Materials Engineering, Energy Engineering, Biomedical Engineering', 'Master\'s in English available'],
              ['Lingnan (University) College', 'Liberal arts undergraduate program with cross-disciplinary focus', 'English-medium coursework'],
              ['School of Business (Sun Yat-sen Business School)', 'Economics, Management, Finance, Marketing', 'IMBA in English; master\'s options'],
              ['School of International Studies', 'International Relations, Foreign Languages, International Business', 'Some master\'s in English'],
              ['School of Law', 'Law, International Law', 'Some master\'s in English'],
              ['School of Government', 'Public Administration, Public Policy, Sociology', 'Some master\'s in English'],
              ['School of Geography & Planning', 'Geography, GIS, Urban Planning', 'Some master\'s in English'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — Lingnan College is the standout English-medium undergraduate option; international programs in some sciences and business',
              '**Master\'s in English** — substantial breadth across medicine, business, sciences, and engineering',
              '**PhD in English** — most PhD programs can be completed in English with a Chinese co-supervisor',
              '**Strengths to weigh** — medicine (one of China\'s strongest), business, sciences; the comprehensive flagship for the Pearl River Delta',
              '**Distinctive advantages** — Sun Yat-sen Business School (IMBA in English), Cancer Center research, Guangzhou\'s economic role',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What SYSU actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — SYSU\'s programs each specify a CSCA subject combination; medical programs require Math + Chemistry',
              '**Sit the CSCA early** — for September intake, target the earliest viable session; SYSU\'s competitive programs have January–March deadlines',
              '**Prepare the application package** — passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence',
              '**Apply online** — through the SYSU International Students Office portal; pay the application fee',
              '**Submit before the program deadline** — most fall-intake programs close March–May',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations SYSU asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Clinical medicine / public health / pharmacy', 'Math + Chemistry', 'MBBS 8 years; verify specific requirements'],
              ['Life sciences / biotechnology', 'Math + Chemistry', 'Some require Physics too'],
              ['Mathematics / physics / statistics', 'STEM Chinese + Math + Physics', 'Verify per program'],
              ['Chemistry / chemical engineering', 'STEM Chinese + Math + Chemistry', 'Some add Physics'],
              ['Computer science / information science', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['Engineering (materials, energy)', 'STEM Chinese + Math + Physics', 'Engineering fundamentals'],
              ['Business / management / finance', 'Math (sometimes + STEM Chinese)', 'IMBA in English'],
              ['International relations / public administration', 'Humanities Chinese + Math', 'Specialized'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the current CSCA combination. SYSU\'s International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund a SYSU degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the SYSU International Students Office as your host institution',
              '**SYSU scholarships** — partial tuition waivers and merit awards; university-managed; check the International Students Office for current offerings',
              '**Guangdong Provincial Government Scholarship** — for international students studying in Guangdong Province; tuition waiver + monthly stipend',
              '**Guangzhou Municipal Government Scholarship** — for international students studying in Guangzhou specifically; tuition waiver + monthly stipend',
              '**Sun Yat-sen Business School merit scholarships** — for IMBA and other graduate business programs; often combined with CSC',
              '**SYSU medical school research positions** — for students in life sciences and medicine; partial funding via lab positions',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and SYSU-affiliated private scholarships',
              '**Program-specific awards** — select departments offer research assistantships or teaching assistantships that include tuition waivers and a monthly stipend',
              '**Confucius Institute Scholarship** — for international students in Chinese language and culture programs at SYSU-affiliated Confucius Institutes',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr crunch applies; SYSU\'s international office can advise on the application',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at SYSU costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year (varies by program)', 'Medical programs may have additional fees'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard'],
              ['Living expenses', '¥1,500–¥3,000/month', '¥1,500–¥3,000/month', 'Guangzhou is more affordable than Beijing or Shanghai'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme'],
              ['Annual total (typical)', '~¥50,000–¥90,000', '~¥60,000–¥110,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare. SYSU\'s own scholarships range from partial tuition waivers to substantial packages. The Guangdong Provincial and Guangzhou Municipal scholarships add city-specific options.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Guangzhou, the campus, international community',
        intro:
          'What it feels like to live and study at Sun Yat-sen University.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Multiple campuses** — Guangzhou South (the main), Guangzhou North (the historic old campus), Zhuhai, Shenzhen, and a fifth; each with specific functions',
              '**Guangzhou city** — the Pearl River Delta\'s economic center; Cantonese cultural hub; major transportation hub; the Guangzhou-Shenzhen-Hong Kong Greater Bay Area',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes; one of the largest international student communities in southern China',
              '**Dining** — multiple cafeterias on campus with halal, vegetarian, and international options; Guangzhou\'s famous Cantonese cuisine is world-class',
              '**Cultural proximity** — within 1 hour of Shenzhen, 2 hours of Hong Kong by high-speed rail; major Greater Bay Area opportunities',
              '**Cost of living in Guangzhou** — more affordable than Beijing or Shanghai; dormitory + cooking keeps expenses manageable',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is SYSU ranked in world rankings?',
        a: 'Yes — SYSU is consistently in the top 200 globally across QS, THE, and ARWU rankings, and is among the top-ranked Chinese universities, particularly strong on medicine and business indicators.',
      },
      {
        q: 'What CSCA subjects does SYSU require?',
        a: 'It varies by program. Medical programs ask for Math + Chemistry; sciences and engineering programs vary; business programs are flexible. Always check the program\'s official page.',
      },
      {
        q: 'What is SYSU known for?',
        a: 'Medicine (one of China\'s strongest medical traditions), business (Sun Yat-sen Business School), sciences, and humanities — the Pearl River Delta\'s flagship comprehensive university.',
      },
      {
        q: 'Are there English-taught programs at SYSU?',
        a: 'Yes — substantial at the master\'s level across medicine, business, sciences, and engineering. The Lingnan College is the standout English-medium undergraduate option.',
      },
      {
        q: 'How much does it cost to study at SYSU as an international student?',
        a: 'Typical all-in is ¥50,000–¥90,000/year for a bachelor\'s and ¥60,000–¥110,000 for a master\'s, excluding scholarships. Guangzhou is more affordable than Beijing or Shanghai.',
      },
      {
        q: 'Does SYSU have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories; early application improves dormitory assignment.',
      },
      {
        q: 'How competitive is SYSU for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan.',
      },
      {
        q: 'Does SYSU offer scholarships for international students?',
        a: 'Yes — SYSU\'s own scholarships, CSC, the Guangdong Provincial Government scholarship, the Guangzhou Municipal Government scholarship, and program-specific awards are the main options.',
      },
      {
        q: 'Where is the SYSU campus?',
        a: 'SYSU has five campuses across Guangdong Province. Guangzhou South is the main campus; Guangzhou North is the historic old campus; Zhuhai, Shenzhen, and a fifth campus round out the network.',
      },
      {
        q: 'Is there an application fee for SYSU international admissions?',
        a: 'Yes — typically ¥400–¥800 per application, paid online through the application portal.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the SYSU International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September intake, target the earliest viable CSCA session. SYSU\'s competitive programs have January–March deadlines.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence, application fee.',
      },
      {
        name: 'Apply online through the SYSU portal',
        text: 'Submit the full package before the program deadline. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit CSC through the SYSU international office; apply for SYSU\'s own scholarships, the Guangdong Provincial Government scholarship, and the Guangzhou Municipal Government scholarship. Guangzhou-specific options are valuable additions.',
      },
    ],
    ctaTitle: 'Applying to Sun Yat-sen University?',
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
        href: '/shanghai-jiao-tong-university',
        label: 'Shanghai Jiao Tong University',
        description: 'Shanghai\'s engineering and medicine flagship.',
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
    slug: 'sun-yat-sen-university',
    eyebrow: '大学简介',
    title: '中山大学——广州旗舰、医学与商科、院系与留学生申请',
    description:
      '中山大学（中山, SYSU）——珠三角的旗舰综合性大学。历史、特色专业（医学、商科、理科）、英语授课选项、CSCA 组合、奖学金、费用与实务指引。',
    subtitle:
      '中山大学是广州与珠三角的旗舰综合性大学，1924 年由孙中山创立。在医学、商科、理科、人文方面有强势，在广东有 5 个校区，是国际化程度最高的中国大学之一，是考虑华南的国际申请者的首选。',
    stats: [
      { value: '1924', label: '孙中山创立' },
      { value: '5', label: '广东校区' },
      { value: '多个', label: '英语授课硕博' },
      { value: '广州', label: '珠三角旗舰' },
    ],
    quickAnswer:
      '中山大学是广州综合性旗舰大学，在医学、商科、理科、人文方面有强势。国际申请者通过 CSCA（2026 起必考）+ 学习计划申请。医学项目要求数学 + 化学；理科各异；商科项目灵活。学费本科约 ¥30,000–60,000/年；广州显著比北京/上海便宜。中山除 CSC 外还有自有奖学金与广东省政府奖学金，且国际学生群体庞大。',
    keyTakeaways: [
      '1924 年由孙中山创立——珠三角旗舰大学',
      '强项：医学（中国最强医学传统之一）、商科、理科、人文',
      '广州位置——中国南方经济中心；生活成本低于北京或上海；粤语文化中心',
      '英语授课硕士项目几乎覆盖全部学科；国际学生群体庞大',
      'CSCA 组合：医学为数学 + 化学；理科为理工中文 + 数学 + 物理；商科为数学',
      '奖学金：CSC + 广东省政府 + 中山自有；费用约 ¥50,000–90,000/年',
    ],
    sections: [
      {
        id: 'overview',
        h2: '中山概览',
        intro: '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '中山大学是广州与珠三角的旗舰综合性大学，1924 年由孙中山创立。在医学、商科、理科、人文方面有强势，在广东有 5 个校区，是国际化程度最高的中国大学之一，是考虑华南的国际申请者的首选。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从孙中山创立到珠三角旗舰',
        intro: '中山如何成为今天的学府。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1924 年**——孙中山创立国立广东大学；少数由中国政治人物创立的大学之一',
              '**1926 年**——更名为中山大学纪念创办人；成为华南顶级学府',
              '**1952 年**——院系调整，吸纳其他高校院系；加强医学（中山医科大学 1953-2001 独立）与理科',
              '**2001 年**——与中山医科大学合并；扩张的医学院成为中国最强之一',
              '**2000-2010 年代**——在广东大规模扩张；多个新校区；国际项目显著增加',
              '**今天**——多个院系覆盖理科、工科、医学、商科、人文；约 8 万学生含约 6,000 国际学生；中国顶尖大学之一',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对国际申请者而言，中山的孙中山创办背景与珠三角位置赋予了它独有的联系——大中华经济圈与侨民网络。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色项目',
        intro: '中山强势在哪里，申什么。',
        blocks: [
          {
            type: 'table',
            caption: '中山院系与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['中山大学肿瘤防治中心 / 医学院', '临床医学（8 年制）、肿瘤学、公共卫生、药学、护理', '部分硕士英文'],
              ['生命科学学院', '生物科学、生物技术、生态', '硕士英文可选'],
              ['数学与计算科学学院', '数学、应用数学、统计、计算数学', '硕士英文可选'],
              ['物理学院', '物理、应用物理、光学、声学', '硕士英文可选'],
              ['化学与化工学院', '化学、应用化学、材料化学', '硕士英文可选'],
              ['信息科学与技术学院', '计算机科学、软件工程、信息安全、AI', '硕士英文可选'],
              ['工学院', '材料工程、能源工程、生物医学工程', '硕士英文可选'],
              ['岭南（大学）学院', '跨学科本科文理项目', '英语课程'],
              ['商学院（中山大学商学院）', '经济、管理、金融、市场营销', 'IMBA 英文；硕士选项'],
              ['国际研究学院', '国际关系、外语、国际商务', '部分硕士英文'],
              ['法学院', '法学、国际法', '部分硕士英文'],
              ['政治与公共事务管理学院', '公共管理、公共政策、社会学', '部分硕士英文'],
              ['地理科学与规划学院', '地理、GIS、城市规划', '部分硕士英文'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本科英语授课项目**——岭南学院是突出的英语本科项目；部分科学与商学的国际项目',
              '**硕士英文授课**——医学、商科、理科、工学范围广',
              '**博士英文授课**——多数博士项目可英文完成（需中文共同导师）',
              '**强势权衡**——医学（中国最强之一）、商科、理科；珠三角综合性旗舰',
              '**独特优势**——中山商学院（IMBA 英文）、肿瘤防治中心研究、广州的经济角色',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro: '中山实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——中山每个项目都指定 CSCA 科目组合；医学项目要求数学 + 化学',
              '**早点考 CSCA**——9 月入学最早考一次；中山竞争项目 1-3 月截止',
              '**备齐申请材料**——护照、成绩单、学习计划、2 封推荐信、语言证明',
              '**网上申请**——通过中山留学生办公室门户；付申请费',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试',
            ],
          },
          {
            type: 'table',
            caption: '中山常见 CSCA 组合（逐项目核验）',
            columns: ['项目族', '常见 CSCA 组合', '说明'],
            rows: [
              ['临床医学 / 公共卫生 / 药学', '数学 + 化学', 'MBBS 8 年制；具体核验'],
              ['生命科学 / 生物技术', '数学 + 化学', '部分也要求物理'],
              ['数学 / 物理 / 统计', '理工中文 + 数学 + 物理', '逐项目核验'],
              ['化学 / 化学工程', '理工中文 + 数学 + 化学', '部分加物理'],
              ['计算机 / 信息科学', '理工中文 + 数学 + 物理', '量化筛选'],
              ['工科（材料、能源）', '理工中文 + 数学 + 物理', '工科基础'],
              ['商科 / 管理 / 金融', '数学（有时加理工中文）', 'IMBA 全英文'],
              ['国际关系 / 公共管理', '人文中文 + 数学', '专业向'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '始终查项目的官方录取页确认当年组合。中山留学生办以英文回复书面问询，一般几个工作日内。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro: '如何为中山学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过中山留学生办作为接收单位申请',
              '**中山自有奖学金**——学费减免与优秀奖；校方管理；查留学生办当年公告',
              '**广东省政府奖学金**——在广东学习的国际生；学费减免 + 月津贴',
              '**广州市政府奖学金**——在广州学习的国际生；学费减免 + 月津贴',
              '**中山商学院优秀奖学金**——IMBA 与其他研究生商业项目；常与 CSC 配合',
              '**中山医学院研究岗位**——生命科学与医学方向学生的部分经费来源',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、中山相关私立奖学金',
              '**项目专项奖**——部分院系提供研究助理或教学助理，含学费减免与月津贴',
              '**孔子学院奖学金**——中山附属孔子学院的汉语言文化项目',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用；中山留学生办可指导申请',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro: '在中山一年的花销。',
        blocks: [
          {
            type: 'table',
            caption: '留学费用（规划近似值）',
            columns: ['项目', '本科', '硕士', '说明'],
            rows: [
              ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年', '医学项目可能有附加费'],
              ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍'],
              ['生活费', '¥1,500–3,000/月', '¥1,500–3,000/月', '广州比北京/上海便宜'],
              ['医保', '¥800/年', '¥800/年', '强制基础方案'],
              ['年度合计（典型）', '约 ¥50,000–90,000', '约 ¥60,000–110,000', '不含奖学金'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 覆盖学费、住宿、月津贴与机票。中山自有奖学金从学费减免到大额套餐不等；广东省与广州市政府奖学金是省市两级的补充。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——广州、校园、国际社群',
        intro: '在中山生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**多个校区**——广州南（主校区）、广州北（历史老校区）、珠海、深圳、第五校区；各有特定功能',
              '**广州城**——珠三角经济中心；粤语文化中心；主要交通枢纽；广州-深圳-香港大湾区',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划；华南最大的国际学生社群之一',
              '**餐饮**——多个校园食堂提供清真、素食、国际窗口；广州粤菜世界闻名',
              '**文化邻近**——距深圳 1 小时、距香港高铁 2 小时；大湾区机会丰富',
              '**广州生活成本**——比北京或上海便宜；宿舍加自己做饭能把支出控制住',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中山大学在世界排名里怎么样？',
        a: '是——中山长期位列 QS、THE、ARWU 全球前 200，是医学与商科指标领先的中国大学之一。',
      },
      {
        q: '中山要求哪些 CSCA 科目？',
        a: '按项目而定。医学项目要求数学 + 化学；理科各异；商科项目灵活。始终查项目官方页面。',
      },
      {
        q: '中山以什么出名？',
        a: '医学（中国最强医学传统之一）、商科（中山商学院）、理科、人文——珠三角综合性旗舰。',
      },
      {
        q: '中山有英语授课项目吗？',
        a: '有——硕士层面广泛，医学、商科、理科、工学都有。岭南学院是突出的英语本科项目。',
      },
      {
        q: '在中山读一年多少钱？',
        a: '本科通常 ¥50,000–90,000/年，硕士 ¥60,000–110,000/年，不含奖学金。广州比北京/上海便宜。',
      },
      {
        q: '中山给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍；早申有助于拿到好分配。',
      },
      {
        q: '中山录取国际生竞争多大？',
        a: '中国最严格之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。',
      },
      {
        q: '中山给国际生提供奖学金吗？',
        a: '是——中山自有奖学金、CSC、广东省政府奖学金、广州市政府奖学金是主要选项。',
      },
      {
        q: '中山校园在哪？',
        a: '中山在广东省有 5 个校区。广州南是主校区；广州北是历史老校区；珠海、深圳与第五校区补全网络。',
      },
      {
        q: '中山申请费多少？',
        a: '通常每份 ¥400–800，通过申请门户在线支付。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览中山留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。中山竞争项目 1-3 月截止。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字）、2 封学术推荐信、语言证明、申请费。',
      },
      {
        name: '通过中山门户网上申请',
        text: '项目截止前提交完整材料。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）。',
      },
      {
        name: '并行申请奖学金',
        text: '通过中山留学生办提交 CSC 申请；符合条件时申请中山、广东省与广州市政府奖学金。广州特有的选项是重要补充。',
      },
    ],
    ctaTitle: '正在申请中山大学？',
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
        href: '/shanghai-jiao-tong-university',
        label: '上海交通大学',
        description: '上海的工科与医学旗舰。',
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
