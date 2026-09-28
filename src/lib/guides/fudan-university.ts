import type { LocalizedGuide } from './types';

/**
 * Fudan University (复旦) profile — university profile #3 of 10.
 */
export const fudanUniversityGuide: LocalizedGuide = {
  en: {
    slug: 'fudan-university',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'Fudan University — Shanghai\'s Flagship, Programs & International Admissions',
    description:
      'Fudan University (复旦) — Shanghai\'s flagship comprehensive research university. History, signature programs (humanities, sciences, medicine), English-taught options, CSCA combinations, scholarships, cost, and practical guidance.',
    subtitle:
      'Fudan University is one of China\'s oldest and most prestigious universities, located in Shanghai. With a tradition in humanities, journalism, economics, and basic sciences, and a strong medical school through the merger with Shanghai Medical University, Fudan offers a full range of programs for international applicants. The Shanghai location is itself a major draw — China\'s financial and cultural center with deep international connections.',
    stats: [
      { value: '1905', label: 'Founded (predecessor school)' },
      { value: 'Multiple', label: 'Schools including medical' },
      { value: 'Many', label: 'English-taught master\'s' },
      { value: 'Shanghai', label: 'Yangpu + Jing\'an campuses' },
    ],
    quickAnswer:
      'Fudan University is Shanghai\'s flagship comprehensive university, with strong programs across humanities, social sciences, basic sciences, and medicine. International applicants apply through CSCA (mandatory from 2026) plus a study plan; humanities and social-science programs typically require Humanities Chinese + Math; sciences require Math + Physics or Chemistry combinations. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s; Fudan offers its own scholarships in addition to CSC; the Shanghai Government scholarship is also available.',
    keyTakeaways: [
      'Founded 1905 as Fudan Public School; one of China\'s oldest universities; later merged with Shanghai Medical University',
      'Strengths: humanities (literature, journalism, history), social sciences, basic sciences, medicine (Shanghai Medical College)',
      'Shanghai location — financial and cultural capital; deep international connections; English widely used',
      'English-taught master\'s programs across most disciplines; undergraduate English programs growing',
      'CSCA combinations: Humanities Chinese + Math for humanities/social sciences; Math + Physics for engineering/natural sciences; Math + Chemistry for medical/life sciences',
      'Scholarships: CSC + Fudan\'s own + Shanghai Government; cost similar to other Chinese flagships',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'Fudan at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'Fudan University is one of China\'s oldest comprehensive universities, with a tradition in humanities, journalism, economics, and basic sciences, and a strong medical school through the merger with Shanghai Medical University. For international applicants considering Shanghai specifically — China\'s financial and cultural capital — Fudan is the top-of-list option. The university offers a full range of programs with English instruction increasingly available at the master\'s and PhD levels.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from Fudan Public School to Shanghai\'s flagship',
        intro:
          'How Fudan became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1905 — founded as Fudan Public School (复旦公学)** by a Qing-era educator; one of the earliest modern Chinese universities',
              '**1917 — renamed Fudan University**; early 20th-century intellectual center in Shanghai',
              '**1920s–40s** — major contributions to humanities, journalism, economics; wartime disruption',
              '**1952 — restructuring** absorbed departments from elsewhere; strengthened mathematics and sciences',
              '**2000 — merger with Shanghai Medical University** significantly expanded the medical school; current school of medicine traces to this merger',
              '**Today** — multiple schools including humanities, social sciences, sciences, engineering, medicine; ~50,000 students including ~7,000 international students; one of the top-ranked Chinese universities globally',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For international applicants, Fudan\'s Shanghai location is itself a major asset: deep international connections, English widely used in the city, and proximity to industry that drives internships and graduate employment.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where Fudan is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'Fudan schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['School of Chinese Language & Literature', 'Chinese literature, Chinese linguistics, Comparative literature', 'Some master\'s in English'],
              ['School of Journalism', 'Journalism, Communication, New Media', 'Some master\'s in English'],
              ['School of Economics', 'Economics, Finance, World Economy', 'Several master\'s in English'],
              ['School of Management', 'Management, Business Administration, Accounting', 'Master\'s (MBA) in English available'],
              ['School of International Relations & Public Affairs', 'International Relations, Political Science, Public Administration', 'Master\'s in English available'],
              ['School of Mathematical Sciences', 'Mathematics, Applied Mathematics, Statistics', 'Master\'s in English available'],
              ['School of Physics', 'Physics, Condensed Matter, Optics', 'Master\'s in English available'],
              ['School of Chemistry & Materials Science', 'Chemistry, Materials Chemistry', 'Master\'s in English available'],
              ['School of Life Sciences', 'Biological Sciences, Biotechnology, Ecology', 'Master\'s in English available'],
              ['Shanghai Medical College', 'Clinical Medicine, Public Health, Pharmacy, Nursing', 'Some master\'s in English'],
              ['School of Data Science & Computer Engineering', 'Computer Science, Big Data, Software Engineering', 'Master\'s in English available'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — smaller than at Peking or Tsinghua; Fudan focuses on Chinese-language undergraduate education with selective English-medium options',
              '**Master\'s in English** — substantial breadth, especially in economics, finance, journalism, public affairs, sciences, and engineering',
              '**PhD in English** — most PhD programs can be completed in English with a Chinese co-supervisor; common for international PhD students',
              '**Medical programs** — Shanghai Medical College has the strongest medical tradition in China after Peking University; some master\'s and PhD programs in English',
              '**Strengths to weigh** — humanities, journalism, economics, basic sciences, medicine; engineering is present but less famous than Tsinghua\'s',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What Fudan actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — Fudan\'s programs each specify a CSCA subject combination; humanities typically require Humanities Chinese + Math',
              '**Sit the CSCA early** — for September intake, target the earliest viable session; Fudan\'s competitive programs have January–March deadlines',
              '**Prepare the application package** — passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence (HSK for Chinese-taught, IELTS/TOEFL for English-taught)',
              '**Apply online** — through the Fudan University International Students Office portal; pay the application fee',
              '**Submit before the program deadline** — most fall-intake programs close March–May',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations Fudan asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Humanities (literature, history, journalism)', 'Humanities Chinese + Math', 'Study-plan quality often decides'],
              ['Social sciences (economics, IR, public affairs)', 'Humanities Chinese + Math', 'Some programs add Math-heavy track'],
              ['Mathematics / physics', 'STEM Chinese (sometimes) + Math + Physics', 'Verify per program'],
              ['Life sciences / biotechnology', 'Math + Chemistry', 'Some programs add Physics'],
              ['Medical / public health / pharmacy', 'Math + Chemistry', 'Some programs require Biology'],
              ['Computer science / data science', 'STEM Chinese (sometimes) + Math + Physics', 'Quant-heavy screening'],
              ['Business / management', 'Math (sometimes + Humanities Chinese)', 'MBA in English available'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the current CSCA combination and any program-specific requirements. The International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund a Fudan degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the Fudan International Students Office',
              '**Fudan University scholarships** — partial tuition waivers and merit awards; university-managed; check the International Students Office for current offerings',
              '**Shanghai Government Scholarship** — for international students studying in Shanghai; tuition waiver + monthly stipend',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and Fudan-affiliated private scholarships',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr crunch applies',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at Fudan costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year (varies by program)', 'Some master\'s programs more expensive (MBA, etc.)'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard'],
              ['Living expenses', '¥1,800–¥3,500/month', '¥1,800–¥3,500/month', 'Shanghai is slightly more expensive than Beijing'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme'],
              ['Annual total (typical)', '~¥55,000–¥95,000', '~¥65,000–¥120,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare. Fudan\'s own scholarships range from partial tuition waivers to substantial packages. The Shanghai Government scholarship adds an option specific to the city.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Shanghai, the campus, international community',
        intro:
          'What it feels like to live and study at Fudan.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Multiple campuses** — Handan campus (the original), Fenglin campus (medical and life sciences), Zhangjiang campus (science park, near Shanghai\'s tech hub), Jing\'an campus (newer professional programs)',
              '**Shanghai city** — China\'s financial center; English widely spoken; deep international connections; metro, bike-share, and walkable neighborhoods',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes',
              '**Dining** — multiple cafeterias on campus with halal, vegetarian, and international options; Shanghai\'s food scene is world-famous',
              '**Industry connections** — Shanghai is the natural place for finance, consulting, trade, and tech careers; Fudan students benefit',
              '**Cost of living in Shanghai** — slightly higher than Beijing; dormitory + cooking keeps expenses manageable',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Fudan ranked in world rankings?',
        a: 'Yes — Fudan is consistently in the top 100 globally across QS, THE, and ARWU rankings, and is among the top-ranked Chinese universities, particularly on humanities and social-sciences indicators.',
      },
      {
        q: 'What CSCA subjects does Fudan require?',
        a: 'It varies by program. Humanities and social-science programs typically ask for Humanities Chinese + Math; sciences and engineering programs vary. Always check the program\'s official page.',
      },
      {
        q: 'What is Fudan known for?',
        a: 'Humanities (especially literature and journalism), economics, basic sciences, and the medical school (Shanghai Medical College) — the latter is one of China\'s strongest medical traditions.',
      },
      {
        q: 'Are there English-taught programs at Fudan?',
        a: 'Yes — substantially more at the master\'s and PhD level. Economics, finance, journalism, public affairs, sciences, and engineering all have English-language master\'s options. Undergraduate English programs are smaller.',
      },
      {
        q: 'How much does it cost to study at Fudan as an international student?',
        a: 'Typical all-in is ¥55,000–¥95,000/year for a bachelor\'s and ¥65,000–¥120,000 for a master\'s, excluding scholarships. Shanghai is slightly more expensive than Beijing.',
      },
      {
        q: 'Does Fudan have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories; early application improves dormitory assignment.',
      },
      {
        q: 'How competitive is Fudan for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan.',
      },
      {
        q: 'Does Fudan offer scholarships for international students?',
        a: 'Yes — Fudan\'s own scholarships, CSC, and the Shanghai Government scholarship are the main options.',
      },
      {
        q: 'Where is the Fudan campus?',
        a: 'Fudan has multiple campuses in Shanghai. Handan campus is the original; Fenglin is for medical and life sciences; Zhangjiang is for science park and tech companies; Jing\'an is for newer professional programs.',
      },
      {
        q: 'Is there an application fee for Fudan international admissions?',
        a: 'Yes — typically ¥400–¥800 per application, paid online through the application portal.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the Fudan International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September intake, target the earliest viable CSCA session. Fudan\'s competitive programs have January–March deadlines.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence, application fee.',
      },
      {
        name: 'Apply online through the Fudan portal',
        text: 'Submit the full package before the program deadline. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit CSC through the Fudan international office; apply for Fudan\'s own scholarships and the Shanghai Government scholarship. Shanghai-based options are valuable for the city\'s industry connections.',
      },
    ],
    ctaTitle: 'Applying to Fudan University?',
    ctaSubtitle:
      'SICA counselors review your target program\'s CSCA requirements, refine your study plan, and coordinate Shanghai-specific scholarship applications. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university',
        label: 'Peking University',
        description: 'Beijing\'s humanities and sciences flagship.',
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
        href: '/best-universities-in-shanghai',
        label: 'Best universities in Shanghai',
        description: 'How Fudan compares to other top Shanghai universities.',
      },
    ],
  },
  zh: {
    slug: 'fudan-university',
    eyebrow: '大学简介',
    title: '复旦大学——上海旗舰、院系与留学生申请',
    description:
      '复旦大学（复旦）——上海旗舰综合性研究型大学。历史、特色专业（人文、理科、医学）、英语授课选项、CSCA 组合、奖学金、费用与实务指引。',
    subtitle:
      '复旦大学是中国最古老、最负盛名的大学之一，坐落上海。在人文、新闻、经济、基础科学方面有传统，并通过与上海医科大学的合并加强了医学院。给国际申请者提供完整的项目选择。上海本身——中国的金融与文化中心，国际联系深厚——也是一大吸引力。',
    stats: [
      { value: '1905', label: '前身创立' },
      { value: '多个', label: '含医学院的院系' },
      { value: '多个', label: '英语授课硕士' },
      { value: '上海', label: '杨浦 + 静安校区' },
    ],
    quickAnswer:
      '复旦大学是上海旗舰综合性大学，在人文、社科、基础科学、医学领域实力强劲。国际申请者通过 CSCA（2026 起必考）+ 学习计划申请；人文与社科通常要求人文中文 + 数学；理科要求数学 + 物理或化学。学费本科约 ¥30,000–60,000/年；除 CSC 外复旦有自有奖学金，上海市政府奖学金也是选项。',
    keyTakeaways: [
      '1905 年创立（复旦公学），中国最古老的大学之一；后与上海医科大学合并',
      '强项：人文（文学、新闻、历史）、社科、基础科学、医学（上海医学院）',
      '上海位置——金融与文化中心；国际联系深；英语广泛使用',
      '英语授课硕士项目几乎覆盖全部学科；本科英语项目在增长',
      'CSCA 组合：人文/社科为人文中文 + 数学；理科为数学 + 物理或化学；医学为数学 + 化学',
      '奖学金：CSC + 复旦自有 + 上海市政府；费用与其他中国旗舰相近',
    ],
    sections: [
      {
        id: 'overview',
        h2: '复旦概览',
        intro: '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '复旦大学是中国最古老、最负盛名的综合性大学之一，在人文、新闻、经济、基础科学方面有传统，通过与上海医科大学的合并加强了医学院。考虑上海——中国金融与文化中心——的国际申请者应将复旦列为首选。学校提供完整的项目选择，硕博层面英语授课项目持续增加。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从复旦公学到上海旗舰',
        intro: '复旦如何成为今天的旗舰。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1905 年**——晚清教育家创立复旦公学；中国最早的现代大学之一',
              '**1917 年**——更名为复旦大学；20 世纪早期上海的知识分子中心',
              '**1920–40 年代**——在人文、新闻、经济做出重大贡献；战时受到干扰',
              '**1952 年**——院系调整，吸纳其他高校院系；加强数学与理科',
              '**2000 年**——与上海医科大学合并，医学院大幅扩展；当前医学院源于此次合并',
              '**今天**——多个院系含人文、社科、理科、工科、医科；约 5 万学生含约 7,000 国际学生；中国顶尖大学之一',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对国际申请者而言，上海位置本身是重要资产：国际联系深，城市里英语广泛使用，靠近产业带动实习与毕业就业。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色项目',
        intro: '复旦强势在哪里，申什么。',
        blocks: [
          {
            type: 'table',
            caption: '复旦院系与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['中国语言文学系', '中国文学、汉语言学、比较文学', '部分硕士英文'],
              ['新闻学院', '新闻学、传播学、新媒体', '部分硕士英文'],
              ['经济学院', '经济学、金融、世界经济', '多个硕士英文'],
              ['管理学院', '管理学、工商管理、会计', '硕士 MBA 英文可选'],
              ['国际关系与公共事务学院', '国际关系、政治学、公共管理', '硕士英文可选'],
              ['数学科学学院', '数学、应用数学、统计', '硕士英文可选'],
              ['物理学系', '物理、凝聚态、光学', '硕士英文可选'],
              ['化学与材料科学系', '化学、材料化学', '硕士英文可选'],
              ['生命科学学院', '生物科学、生物技术、生态学', '硕士英文可选'],
              ['上海医学院', '临床医学、公共卫生、药学、护理', '部分硕博英文'],
              ['数据科学与计算机工程学院', '计算机科学、大数据、软件工程', '硕士英文可选'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本科英语授课项目**——少于北大或清华；复旦以中文本科教育为主，英文项目较少',
              '**硕士英文授课**——范围广，尤其是经济、金融、新闻、公共事务、理科、工科',
              '**博士英文授课**——多数博士项目可英文完成（需中文共同导师）；国际博士生常见',
              '**医学项目**——上海医学院拥有仅次于北大的中国最强医学传统之一；部分硕博英文',
              '**强势权衡**——人文、新闻、经济、基础科学、医学；工科虽在但不如清华有名',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro: '复旦实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——复旦每个项目都指定 CSCA 科目组合；人文通常要求人文中文 + 数学',
              '**早点考 CSCA**——9 月入学最早考一次；复旦的竞争项目 1-3 月截止',
              '**备齐申请材料**——护照、成绩单、学习计划（500-1,500 字）、2 封推荐信、语言证明',
              '**网上申请**——通过复旦留学生办公室门户；付申请费',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试',
            ],
          },
            {
              type: 'table',
              caption: '复旦常见 CSCA 组合（逐项目核验）',
              columns: ['项目族', '常见 CSCA 组合', '说明'],
              rows: [
                ['人文（文学、历史、新闻）', '人文中文 + 数学', '学习计划质量常决定'],
                ['社科（经济、国关、公共事务）', '人文中文 + 数学', '部分加重数学'],
                ['数学 / 物理', '理工中文（部分）+ 数学 + 物理', '逐项目核验'],
                ['生命科学 / 生物技术', '数学 + 化学', '部分项目也加物理'],
                ['医学 / 公共卫生 / 药学', '数学 + 化学', '部分项目要求生物'],
                ['计算机 / 数据科学', '理工中文（部分）+ 数学 + 物理', '量化筛选'],
                ['商科 / 管理', '数学（有时加人文中文）', 'MBA 英文可选'],
              ],
            },
            {
              type: 'callout',
            tone: 'info',
            text: '始终查项目的官方录取页确认当年 CSCA 组合与项目特有要求。复旦留学生办以英文回复书面问询，一般几个工作日内。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro: '如何为复旦学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过复旦留学生办作为接收单位申请',
              '**复旦自有奖学金**——学费减免与优秀奖；校方管理；查留学生办当年公告',
              '**上海市政府奖学金**——在上海学习的国际生；学费减免 + 月津贴',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、复旦相关私立奖学金',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro: '在复旦一年的花销。',
        blocks: [
          {
            type: 'table',
            caption: '留学费用（规划近似值）',
            columns: ['项目', '本科', '硕士', '说明'],
              rows: [
                ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年', '部分硕士更贵'],
                ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍'],
                ['生活费', '¥1,800–3,500/月', '¥1,800–3,500/月', '上海比北京略贵'],
                ['医保', '¥800/年', '¥800/年', '强制基础方案'],
                ['年度合计（典型）', '约 ¥55,000–95,000', '约 ¥65,000–120,000', '不含奖学金'],
              ],
            },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 覆盖学费、住宿、月津贴与机票。复旦自有奖学金从学费减免到大额套餐不等；上海市政府奖学金是上海特有的选项。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——上海、校园、国际社群',
        intro: '在复旦生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**多个校区**——邯郸（本部）、枫林（医学与生科）、张江（科学园区，近科技公司）、静安（较新的专业项目）',
              '**上海城**——中国金融中心；英语广泛使用；国际联系深厚；地铁、共享单车与可步行街区',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划',
              '**餐饮**——多个校园食堂提供清真、素食、国际窗口；上海餐饮世界知名',
              '**产业联系**——上海是金融、咨询、贸易、科技职业的天然地点；复旦学生受益',
              '**上海生活成本**——比北京略高；宿舍加自己做饭能压低支出',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '复旦在世界排名里怎么样？',
        a: '是——复旦长期位列 QS、THE、ARWU 全球前 100，是中国人文与社科指标领先的大学之一。',
      },
      {
        q: '复旦要求哪些 CSCA 科目？',
        a: '按项目而定。人文与社科通常要求人文中文 + 数学；理科各异。始终查项目官方页面。',
      },
      {
        q: '复旦的强项是什么？',
        a: '人文（尤其文学与新闻）、经济、基础科学、医学（上海医学院）——后者是中国仅次于北大的最强医学传统之一。',
      },
      {
        q: '复旦有英语授课项目吗？',
        a: '有——硕博层面远多于本科。经济、金融、新闻、公共事务、理科、工科都有英文硕士项目。本科英语项目较少。',
      },
      {
        q: '在复旦读一年多少钱？',
        a: '本科通常 ¥55,000–95,000/年，硕士 ¥65,000–120,000/年，不含奖学金。上海比北京略贵。',
      },
      {
        q: '复旦给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍；早申有助于拿到好分配。',
      },
      {
        q: '复旦录取国际生竞争多大？',
        a: '中国最严格之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。',
      },
      {
        q: '复旦给国际生提供奖学金吗？',
        a: '是——复旦自有奖学金、CSC、上海市政府奖学金是主要选项。',
      },
      {
        q: '复旦校园在哪？',
        a: '复旦在上海有多个校区。邯郸是本部；枫林是医学与生科；张江是科学园区与科技公司；静安是较新的专业项目。',
      },
      {
        q: '复旦申请费多少？',
        a: '通常每份 ¥400–800，通过申请门户在线支付。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览复旦留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。复旦的竞争项目 1-3 月截止。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字）、2 封学术推荐信、语言证明、申请费。',
      },
      {
        name: '通过复旦门户网上申请',
        text: '项目截止前提交完整材料。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）。',
      },
      {
        name: '并行申请奖学金',
        text: '通过复旦留学生办提交 CSC 申请；符合条件时申请复旦与上海市政府奖学金。上海特有的选项对上海产业联系很有价值。',
      },
    ],
    ctaTitle: '正在申请复旦大学？',
    ctaSubtitle:
      'SICA 顾问核对目标项目的 CSCA 要求、优化你的学习计划、并协调上海特有的奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university',
        label: '北京大学',
        description: '北京的人文与理科旗舰。',
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
        href: '/best-universities-in-shanghai',
        label: '上海最好的大学',
        description: '复旦与上海其他顶级大学的对比。',
      },
    ],
  },
};
