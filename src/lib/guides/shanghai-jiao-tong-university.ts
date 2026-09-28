import type { LocalizedGuide } from './types';

/**
 * Shanghai Jiao Tong University (上交) profile — university profile #4 of 10.
 */
export const shanghaiJiaoTongGuide: LocalizedGuide = {
  en: {
    slug: 'shanghai-jiao-tong-university',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'Shanghai Jiao Tong University — Engineering, Medicine & International Programs',
    description:
      'Shanghai Jiao Tong University (SJTU, 上交) — Shanghai\'s engineering and applied-science flagship. History, signature programs (engineering, medicine, business, AI), English-taught options, CSCA combinations, scholarships, cost, and practical guidance.',
    subtitle:
      'Shanghai Jiao Tong University is one of China\'s oldest and most selective universities, with particular strength in engineering, computer science, medicine, and applied business. The merger with Shanghai Second Medical University significantly expanded the medical school. For international applicants considering engineering or medicine in Shanghai, SJTU is often the top option alongside Tsinghua.',
    stats: [
      { value: '1896', label: 'Founded as Nanyang Public School' },
      { value: '30+', label: 'Schools and colleges' },
      { value: 'Many', label: 'English-taught master\'s / PhD' },
      { value: 'Shanghai', label: 'Minhang + Xuhui campuses' },
    ],
    quickAnswer:
      'Shanghai Jiao Tong University is Shanghai\'s engineering and applied-science flagship. International applicants apply through CSCA (mandatory from 2026) plus a study plan. Engineering programs typically require STEM Chinese + Math + Physics; medical programs require Math + Chemistry. English-taught master\'s programs are extensive; undergraduate English programs are growing. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s; SJTU offers its own scholarships in addition to CSC, plus the Antai College full-English business program and the UM-SJTU joint institute.',
    keyTakeaways: [
      'Founded 1896 as Nanyang Public School; one of the oldest modern Chinese universities',
      'Strengths: engineering (mechanical, electrical, ocean, materials), computer science, medicine, business (Antai College)',
      'Medical tradition strengthened by the merger with Shanghai Second Medical University',
      'English-taught master\'s programs across most disciplines; undergraduate English programs include UM-SJTU joint institute and Antai College',
      'CSCA combinations: STEM Chinese + Math + Physics for engineering; Math + Chemistry for medicine',
      'Scholarships: CSC + SJTU\'s own + Shanghai Government; cost similar to other Chinese flagships',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'SJTU at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'Shanghai Jiao Tong University is one of China\'s oldest and most selective universities, with a long tradition in engineering, applied sciences, and — through the merger with Shanghai Second Medical University — one of the country\'s strongest medical programs. For international applicants considering engineering, computer science, medicine, or applied business in Shanghai, SJTU is a top option with substantial international intake.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from Nanyang Public School to Shanghai\'s engineering flagship',
        intro:
          'How SJTU became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1896 — founded as Nanyang Public School (南洋公学)** in Shanghai; one of the earliest modern Chinese universities',
              '**Early 20th century** — major contributions to engineering education and Chinese modernization',
              '**1959 — renamed Shanghai Jiao Tong University**; grew as a research university',
              '**1999 — merger with Shanghai Second Medical University** (now Shanghai Jiao Tong University School of Medicine); strengthened the medical school',
              '**2000s–present** — Antai College of Economics & Management established, UM-SJTU joint institute founded, expansion of English-taught programs',
              '**Today** — ~30 schools and colleges, ~50,000 students including ~7,000 international students; one of the top-ranked Chinese universities globally',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'SJTU\'s deep industry connections — especially in Shanghai\'s tech and finance sectors — are a major asset for international students considering internships and post-graduation employment in China.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where SJTU is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'SJTU schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['School of Mechanical Engineering', 'Mechanical Engineering, Energy & Power Engineering, Industrial Engineering', 'Master\'s in English available'],
              ['School of Materials Science & Engineering', 'Materials Science, Composite Materials', 'Master\'s in English available'],
              ['School of Electronic Information & Electrical Engineering', 'Electrical Engineering, Information Engineering, Automation', 'Master\'s in English available'],
              ['School of Computer Science & Engineering', 'Computer Science, Software Engineering, AI', 'Master\'s in English available'],
              ['Department of Ocean Engineering', 'Ocean Engineering, Naval Architecture', 'Some master\'s in English'],
              ['School of Life Sciences & Biotechnology', 'Biological Sciences, Biotechnology', 'Master\'s in English available'],
              ['School of Medicine (formerly Shanghai Second Medical University)', 'Clinical Medicine (8-year program), Public Health, Nursing, Pharmacy', 'Some master\'s and PhD in English'],
              ['Antai College of Economics & Management', 'Economics, Finance, Business Administration (full English track)', 'All-English instruction'],
              ['School of International and Public Affairs', 'International Relations, Public Administration', 'Master\'s in English available'],
              ['UM-SJTU Joint Institute', 'Engineering (dual-degree with University of Michigan); Electrical, Computer, Mechanical', 'All-English instruction; dual-degree option'],
              ['University of Michigan Joint Institute (UM-SJTU)', 'See above', 'All-English; a signature SJTU international program'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — UM-SJTU joint institute and Antai College are the standout English-taught undergraduate options; SJTU has more English undergraduate capacity than Peking or Tsinghua in some programs',
              '**Master\'s in English** — substantial breadth across engineering, computer science, medicine, business, and sciences',
              '**UM-SJTU Joint Institute** — engineering programs with dual-degree option from the University of Michigan; all-English instruction; one of SJTU\'s signature international offerings',
              '**PhD in English** — most PhD programs can be completed in English with a Chinese co-supervisor',
              '**Strengths to weigh** — engineering, computer science, medicine (especially clinical medicine), business; humanities and basic sciences are present but less famous than the applied fields',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What SJTU actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — SJTU\'s programs each specify a CSCA subject combination; engineering typically requires STEM Chinese + Math + Physics',
              '**Sit the CSCA early** — for September intake, target the earliest viable session; SJTU\'s competitive engineering programs have January–March deadlines',
              '**Prepare the application package** — passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence (HSK for Chinese-taught, IELTS/TOEFL for English-taught)',
              '**Apply online** — through the SJTU International Students Office portal; pay the application fee',
              '**Submit before the program deadline** — most fall-intake programs close March–May',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations SJTU asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Computer science / AI / software engineering', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['Mechanical / electrical / energy engineering', 'STEM Chinese + Math + Physics', 'Engineering fundamentals'],
              ['Materials science', 'STEM Chinese + Math + Physics', 'Some programs add Chemistry'],
              ['Ocean / naval architecture', 'STEM Chinese + Math + Physics', 'Specialized but strong'],
              ['Life sciences / biotechnology', 'Math + Chemistry', 'Some require Physics too'],
              ['Clinical medicine / public health / pharmacy', 'Math + Chemistry', 'MBBS is 6 years; verify specific requirements'],
              ['Economics / finance / management', 'Math (sometimes + STEM Chinese)', 'Antai MBA/IMBA in English'],
              ['UM-SJTU Joint Institute', 'STEM Chinese + Math + Physics', 'All-English; Michigan dual-degree option'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the current CSCA combination and any program-specific requirements. SJTU\'s International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund an SJTU degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the SJTU International Students Office',
              '**SJTU scholarships** — partial tuition waivers and merit awards; university-managed; check the International Students Office for current offerings',
              '**Shanghai Government Scholarship** — for international students studying in Shanghai; tuition waiver + monthly stipend',
              '**UM-SJTU Joint Institute scholarships** — for the dual-degree engineering program; partial and full coverage available',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and SJTU-affiliated private scholarships',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr crunch applies',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at SJTU costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year (varies by program)', 'Some master\'s programs more expensive (MBA, etc.)'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard'],
              ['Living expenses', '¥1,800–¥3,500/month', '¥1,800–¥3,500/month', 'Shanghai'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme'],
              ['Annual total (typical)', '~¥55,000–¥95,000', '~¥65,000–¥120,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare. SJTU\'s own scholarships range from partial tuition waivers to substantial packages. The Shanghai Government scholarship adds a city-specific option.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Shanghai, the campus, international community',
        intro:
          'What it feels like to live and study at SJTU.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Multiple campuses** — Minhang campus (the main campus, where most undergraduate students live), Xuhui campus (the historic original campus, with graduate schools and hospitals), Songjiang (medical campus expansion), and the Lingang Advanced Research Institute',
              '**Shanghai city** — China\'s financial and tech center; deep international connections; metro, bike-share, and walkable',
              '**Industry connections** — Shanghai is the natural place for tech, finance, automotive, biotech, and AI careers; SJTU students benefit directly',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes',
              '**Dining** — multiple cafeterias on campus with halal, vegetarian, and international options; Shanghai\'s food scene is world-famous',
              '**Cost of living in Shanghai** — slightly higher than Beijing; dormitory + cooking keeps expenses manageable',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is SJTU ranked in world rankings?',
        a: 'Yes — SJTU is consistently in the top 100 globally across QS, THE, and ARWU rankings, and is among the top-ranked Chinese universities, particularly on engineering and computer science indicators.',
      },
      {
        q: 'What CSCA subjects does SJTU require?',
        a: 'It varies by program. Engineering typically asks for STEM Chinese + Math + Physics; medical programs ask for Math + Chemistry. Always check the program\'s official page.',
      },
      {
        q: 'What is UM-SJTU Joint Institute?',
        a: 'A joint engineering program with the University of Michigan; students can earn a dual degree. All-English instruction; one of SJTU\'s signature international offerings in engineering.',
      },
      {
        q: 'What is Antai College?',
        a: 'SJTU\'s economics and management school, with a fully English-language business track. Strong in finance, economics, and MBA programs.',
      },
      {
        q: 'Are there English-taught programs at SJTU?',
        a: 'Yes — substantial more than at Peking. UM-SJTU joint institute, Antai College, and a growing number of master\'s programs across engineering and sciences are taught in English.',
      },
      {
        q: 'How much does it cost to study at SJTU as an international student?',
        a: 'Typical all-in is ¥55,000–¥95,000/year for a bachelor\'s and ¥65,000–¥120,000 for a master\'s, excluding scholarships. Shanghai is slightly more expensive than Beijing.',
      },
      {
        q: 'Does SJTU have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories; early application improves dormitory assignment.',
      },
      {
        q: 'How competitive is SJTU for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan.',
      },
      {
        q: 'Does SJTU offer scholarships for international students?',
        a: 'Yes — SJTU\'s own scholarships, CSC, the Shanghai Government scholarship, and UM-SJTU-specific scholarships are the main options.',
      },
      {
        q: 'Where is the SJTU campus?',
        a: 'SJTU has multiple campuses in Shanghai. Minhang is the main campus; Xuhui is the historic original; Songjiang is the medical expansion.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the SJTU International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September intake, target the earliest viable CSCA session. SJTU\'s competitive engineering programs have January–March deadlines.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence, application fee.',
      },
      {
        name: 'Apply online through the SJTU portal',
        text: 'Submit the full package before the program deadline. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit CSC through the SJTU international office; apply for SJTU\'s own scholarships and the Shanghai Government scholarship.',
      },
    ],
    ctaTitle: 'Applying to Shanghai Jiao Tong University?',
    ctaSubtitle:
      'SICA counselors review your target program\'s CSCA requirements, refine your study plan, and coordinate scholarship applications including UM-SJTU joint institute options. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/tsinghua-university',
        label: 'Tsinghua University',
        description: 'Beijing\'s engineering powerhouse — SJTU\'s strongest peer.',
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
      {
        href: '/best-universities-in-shanghai',
        label: 'Best universities in Shanghai',
        description: 'How SJTU compares to other top Shanghai universities.',
      },
    ],
  },
  zh: {
    slug: 'shanghai-jiao-tong-university',
    eyebrow: '大学简介',
    title: '上海交通大学——工科、医学与留学生申请',
    description:
      '上海交通大学（上交）——上海的工科与应用科学旗舰。历史、特色专业（工科、医学、商科、AI）、英语授课选项、CSCA 组合、奖学金、费用与实务指引。',
    subtitle:
      '上海交通大学是中国最古老、最严格的大学之一，在工科、计算机、医学与应用商业方面有优势。通过与上海第二医科大学的合并加强了医学院。对考虑上海工科或医学的国际申请者而言，上交与清华并列首选。',
    stats: [
      { value: '1896', label: '南洋公学创立' },
      { value: '30+', label: '院系' },
      { value: '多个', label: '英语授课硕博' },
      { value: '上海', label: '闵行 + 徐汇校区' },
    ],
    quickAnswer:
      '上海交通大学是上海的工科与应用科学旗舰。国际申请者通过 CSCA（2026 起必考）+ 学习计划申请。工科通常要求理工中文 + 数学 + 物理；医学项目要求数学 + 化学。英语授课硕士项目很多；本科英语项目在增长。学费本科约 ¥30,000–60,000/年；除 CSC 外上交有自有奖学金，还有安泰经管全英文商业项目与 UM-SJTU 联合学院。',
    keyTakeaways: [
      '1896 年创立（前身南洋公学），中国最古老的现代大学之一',
      '强项：工科（机械、电气、海洋、材料）、计算机、医学、商科（安泰学院）',
      '医学传统由与上海第二医科大学的合并加强',
      '英语授课硕士项目几乎覆盖全部学科；本科英语项目含 UM-SJTU 联合学院与安泰',
      'CSCA 组合：工科为理工中文 + 数学 + 物理；医学为数学 + 化学',
      '奖学金：CSC + 上交自有 + 上海市政府；费用与其他中国旗舰相近',
    ],
    sections: [
      {
        id: 'overview',
        h2: '上交概览',
        intro: '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '上海交通大学是中国最古老、最严格的大学之一，在工科、应用科学以及通过与上海第二医科大学的合并建立的医学院方面有传统。对考虑上海工科、计算机、医学或应用商业的国际申请者而言，上交是顶级选项，国际生招收规模可观。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从南洋公学到上海工科旗舰',
        intro: '上交如何成为今天的旗舰。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1896 年**——上海创立南洋公学；中国最早的现代大学之一',
              '**20 世纪早期**——对中国工程教育与中国现代化做出重大贡献',
              '**1959 年**——更名为上海交通大学；发展为研究型大学',
              '**1999 年**——与上海第二医科大学合并（即今上海交大医学院）；加强医学院',
              '**2000 年代至今**——安泰经管学院成立、UM-SJTU 联合学院创办、英语授课项目扩展',
              '**今天**——约 30 个院系，约 5 万学生含约 7,000 国际学生；中国顶尖大学之一',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '上交与上海科技、金融、汽车产业的紧密联系，是考虑上海实习与毕业后就业的国际学生的重大资产。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色项目',
        intro: '上交强势在哪里，申什么。',
        blocks: [
          {
            type: 'table',
            caption: '上交院系与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['机械与动力工程学院', '机械工程、能源与动力工程、工业工程', '硕士英文可选'],
              ['材料科学与工程学院', '材料科学、复合材料', '硕士英文可选'],
              ['电子信息与电气工程学院', '电气工程、信息工程、自动化', '硕士英文可选'],
              ['计算机科学与工程学院', '计算机科学、软件工程、AI', '硕士英文可选'],
              ['船舶海洋与建筑工程学院', '船舶与海洋工程', '部分硕士英文'],
              ['生命科学技术学院', '生物科学、生物技术', '硕士英文可选'],
              ['医学院（前上海第二医科大学）', '临床医学（8 年制）、公共卫生、护理、药学', '部分硕博英文'],
              ['安泰经济与管理学院', '经济、金融、工商管理（全英文项目）', '全英文'],
              ['国际与公共事务学院', '国际关系、公共管理', '硕士英文可选'],
              ['UM-SJTU 联合学院', '工程（与密歇根大学双学位）；电气、计算机、机械', '全英文授课，可选双学位'],
              ['密歇根大学联合学院（UM-SJTU）', '见上', '全英文；上交国际化标志性项目'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本科英语授课项目**——UM-SJTU 联合学院与安泰是突出的英语本科项目；上交在某些项目的英语本科容量超过北大清华',
              '**硕士英文授课**——工科、CS、医学、商科、理科范围广',
              '**UM-SJTU 联合学院**——与密歇根大学的双学位工程；全英文授课；上交国际化的标志性项目',
              '**博士英文授课**——多数博士项目可英文完成（需中文共同导师）',
              '**强势权衡**——工科、CS、医学（尤其临床医学）、商科；人文与基础科学虽在但不如应用领域知名',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro: '上交实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——上交每个项目都指定 CSCA 科目组合；工科通常要求理工中文 + 数学 + 物理',
              '**早点考 CSCA**——9 月入学最早考一次；上交竞争项目 1-3 月截止',
              '**备齐申请材料**——护照、成绩单、学习计划、2 封推荐信、语言证明',
              '**网上申请**——通过上交留学生办公室门户；付申请费',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试',
            ],
          },
            {
              type: 'table',
              caption: '上交常见 CSCA 组合（逐项目核验）',
              columns: ['项目族', '常见 CSCA 组合', '说明'],
              rows: [
                ['计算机 / AI / 软件工程', '理工中文 + 数学 + 物理', '量化筛选'],
                ['机械 / 电气 / 能源工程', '理工中文 + 数学 + 物理', '工程基础'],
                ['材料科学', '理工中文 + 数学 + 物理', '部分项目加化学'],
                ['海洋 / 船舶工程', '理工中文 + 数学 + 物理', '专业但强'],
                ['生命科学 / 生物技术', '数学 + 化学', '部分也要求物理'],
                ['临床医学 / 公共卫生 / 药学', '数学 + 化学', 'MBBS 6 年制；具体要求核验'],
                ['经济 / 金融 / 管理', '数学（有时加理工中文）', '安泰 MBA/IMBA 全英文'],
                ['UM-SJTU 联合学院', '理工中文 + 数学 + 物理', '全英文；密歇根双学位选项'],
              ],
            },
            {
              type: 'callout',
            tone: 'info',
            text: '始终查项目的官方录取页确认当年组合。上交留学生办以英文回复书面问询，一般几个工作日内。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro: '如何为上交学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过上交留学生办作为接收单位申请',
              '**上交自有奖学金**——学费减免与优秀奖；校方管理；查留学生办当年公告',
              '**上海市政府奖学金**——在上海学习的国际生；学费减免 + 月津贴',
              '**UM-SJTU 联合学院奖学金**——双学位工程项目的部分与全额资助',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、上交相关私立奖学金',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro: '在上交一年的花销。',
        blocks: [
          {
            type: 'table',
            caption: '留学费用（规划近似值）',
            columns: ['项目', '本科', '硕士', '说明'],
              rows: [
                ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年', '部分硕士更贵'],
                ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍'],
                ['生活费', '¥1,800–3,500/月', '¥1,800–3,500/月', '上海'],
                ['医保', '¥800/年', '¥800/年', '强制基础方案'],
                ['年度合计（典型）', '约 ¥55,000–95,000', '约 ¥65,000–120,000', '不含奖学金'],
              ],
            },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 覆盖学费、住宿、月津贴与机票。上交自有奖学金从学费减免到大额套餐不等；UM-SJTU 联合学院有特定的全额资助机会；上海市政府奖学金是上海特有的选项。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——上海、校园、国际社群',
        intro: '在上交生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**多个校区**——闵行校区（主校区，多数本科生在此）、徐汇校区（历史本部，研究生院与医院）、松江（医学院扩展）、临港先进研究院',
              '**上海城**——中国金融与科技中心；国际联系深厚；地铁、共享单车与可步行',
              '**产业联系**——上海是科技、金融、汽车、生物科技、AI 职业的天然地点；上交学生直接受益',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划',
              '**餐饮**——多个校园食堂提供清真、素食、国际窗口；上海餐饮世界知名',
              '**上海生活成本**——比北京略高；宿舍加自己做饭能压低支出',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '上交在世界排名里怎么样？',
        a: '是——上交长期位列 QS、THE、ARWU 全球前 100，是工科与计算机指标领先的中国大学之一。',
      },
      {
        q: '上交要求哪些 CSCA 科目？',
        a: '按项目而定。工科通常要求理工中文 + 数学 + 物理；医学项目要求数学 + 化学。始终查项目官方页面。',
      },
      {
        q: '什么是 UM-SJTU 联合学院？',
        a: '与密歇根大学的联合工程项目；学生可获双学位。全英文授课；上交国际化的标志性工程项目之一。',
      },
      {
        q: '什么是安泰学院？',
        a: '上交的经管学院，全英文商业项目。在金融、经济、MBA 项目上实力强。',
      },
      {
        q: '上交有英语授课项目吗？',
        a: '有——多于北大。UM-SJTU 联合学院、安泰学院，以及工科、理科越来越多的硕士项目都是英文授课。',
      },
      {
        q: '在上交读一年多少钱？',
        a: '本科通常 ¥55,000–95,000/年，硕士 ¥65,000–120,000/年，不含奖学金。上海比北京略贵。',
      },
      {
        q: '上交给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍；早申有助于拿到好分配。',
      },
      {
        q: '上交录取国际生竞争多大？',
        a: '中国最严格之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。',
      },
      {
        q: '上交给国际生提供奖学金吗？',
        a: '是——上交自有奖学金、CSC、上海市政府奖学金、UM-SJTU 联合学院特定奖学金是主要选项。',
      },
      {
        q: '上交校园在哪？',
        a: '上交在上海有多个校区。闵行是主校区；徐汇是历史本部；松江是医学院扩展。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览上交留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。上交竞争项目 1-3 月截止。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字）、2 封学术推荐信、语言证明、申请费。',
      },
      {
        name: '通过上交门户网上申请',
        text: '项目截止前提交完整材料。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）。',
      },
      {
        name: '并行申请奖学金',
        text: '通过上交留学生办提交 CSC 申请；符合条件时申请上交与上海市政府奖学金；UM-SJTU 联合学院项目有特定的奖学金。',
      },
    ],
    ctaTitle: '正在申请上海交通大学？',
    ctaSubtitle:
      'SICA 顾问核对目标项目的 CSCA 要求、优化你的学习计划、并协调各项奖学金申请（包括 UM-SJTU 联合学院选项）。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/tsinghua-university',
        label: '清华大学',
        description: '北京的工科强校——上交最强同行。',
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
      {
        href: '/best-universities-in-shanghai',
        label: '上海最好的大学',
        description: '上交与上海其他顶级大学的对比。',
      },
    ],
  },
};
