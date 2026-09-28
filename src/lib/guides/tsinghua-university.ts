import type { LocalizedGuide } from './types';

/**
 * Tsinghua University (清华) profile — university profile #2 of 10.
 */
export const tsinghuaUniversityGuide: LocalizedGuide = {
  en: {
    slug: 'tsinghua-university',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'Tsinghua University — Engineering Powerhouse, Programs & International Admissions',
    description:
      'Tsinghua University (清华) — engineering and applied-science flagship of China. History, signature programs, English-taught options, CSCA admissions combinations, scholarships, cost, and practical guidance.',
    subtitle:
      'Tsinghua University is China\'s engineering and applied-science flagship — founded in 1911 as a study-abroad preparatory school, it became a full university in 1928 and grew into the nation\'s premier engineering school after 1952. Today it runs across all major disciplines with particular strength in engineering, computer science, materials, and increasingly in basic sciences and management. International applicants face one of the most selective admissions environments in China, with strong programs across engineering, business, public policy, and sciences.',
    stats: [
      { value: '1911', label: 'Founded as Tsinghua School' },
      { value: '21+', label: 'Schools and colleges' },
      { value: 'Many', label: 'English-taught master\'s / PhD' },
      { value: 'Beijing', label: 'Hai Dian, near PKU' },
    ],
    quickAnswer:
      'Tsinghua University is China\'s engineering and applied-science flagship. International applicants apply through CSCA (mandatory from 2026) plus a study plan. Engineering and computer science programs typically require STEM Chinese + Math + Physics; verify the exact combination per program. English-taught master\'s programs are extensive; undergraduate English programs are growing. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s; Tsinghua offers its own scholarships in addition to CSC, and the Schwarzman Scholars program (English-language, fully funded) is one of the world\'s most selective master\'s programs in public policy and economics.',
    keyTakeaways: [
      'Founded 1911 as a study-abroad preparatory school; became a full university in 1928; post-1952 restructuring built the engineering powerhouse',
      'Strengths: engineering (mechanical, electrical, civil, chemical, materials), computer science, architecture, life sciences, increasingly basic sciences and management',
      'Schwarzman Scholars — fully funded, English-language master\'s in public policy / economics / international relations; one of the most selective in the world',
      'CSCA combinations: STEM Chinese + Math + Physics for engineering/CS; STEM Chinese + Math + Chemistry for chemical/materials/life sciences',
      'Cost: international bachelor\'s ~¥30,000–¥60,000/year; dorm + living on top',
      'Scholarships: CSC + Tsinghua\'s own + Schwarzman + Beijing Government',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'Tsinghua at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'Tsinghua University is China\'s engineering and applied-science flagship, with a long-running reputation for academic rigor, technical depth, and strong ties to industry and government. International applicants considering engineering, computer science, architecture, or quantitative sciences should consider Tsinghua first; it also has growing programs in public policy, management, and basic sciences that are competitive with Peking University in their own right.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from Tsinghua School to engineering powerhouse',
        intro:
          'How Tsinghua became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1911 — founded as Tsinghua School (清华学堂)** to prepare students for study in the United States; funded by the Boxer Indemnity remissions',
              '**1928 — renamed Tsinghua University and expanded** into a full university',
              '**1930s–40s** — major contributions to science and engineering, faculty training in the West, founding influence on modern Chinese engineering education',
              '**1952 — restructuring** absorbed engineering and science departments from elsewhere; emerged as China\'s premier engineering school',
              '**1990s–2000s** — Project 211 (1995) and Project 985 (1998); establishment of Schwarzman College and Xinya College for new directions',
              '**Today** — ~21 schools and colleges, ~50,000 students including ~5,000 international students; among the most selective in China',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For international applicants, Tsinghua\'s identity translates into specific program expectations: engineering and applied sciences are the differentiators; humanities are present but not as famous as Peking University\'s.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where Tsinghua is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'Tsinghua schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['School of Information Science & Technology', 'Computer Science, Software Engineering, AI, Information Security', 'Master\'s in English available'],
              ['Department of Automation', 'Automation, AI, Control Engineering', 'Master\'s in English available'],
              ['School of Mechanical Engineering', 'Mechanical Engineering, Energy & Power Engineering, Automotive Engineering', 'Master\'s in English available'],
              ['School of Materials Science & Engineering', 'Materials Science, Nano-materials', 'Master\'s in English available'],
              ['School of Civil Engineering', 'Civil Engineering, Hydraulic Engineering, Architecture', 'Some master\'s in English'],
              ['Department of Chemistry', 'Chemistry, Chemical Engineering', 'Master\'s in English available'],
              ['School of Life Sciences', 'Biological Sciences, Biomedical Engineering, Pharmacy', 'Some master\'s in English'],
              ['School of Economics & Management (SEM)', 'Economics, Finance, Management, Accounting', 'Several master\'s in English (e.g., Tsinghua MBA, IMBA)'],
              ['School of Public Policy & Management', 'Public Administration, International Development', 'IMPP master\'s in English'],
              ['Schwarzman College', 'Master\'s in Global Affairs (English-language, fully funded)', 'All-English instruction'],
              ['Xinya College', 'Liberal arts undergraduate program with cross-disciplinary focus', 'Some English-medium coursework'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — Xinya College is one prominent option; engineering undergraduate programs remain mostly Chinese-taught',
              '**Master\'s in English** — substantial breadth: engineering, computer science, business (IMBA, Tsinghua MBA), public policy (IMPP), and the Schwarzman global affairs program',
              '**Schwarzman Scholars** — the most selective English-language master\'s in public policy / economics / international relations; fully funded; targeted at high-achieving international applicants',
              '**PhD in English** — most PhD programs can be completed in English with a Chinese co-supervisor; common for international PhD students',
              '**Strengths to weigh** — engineering, computer science, materials, architecture, and increasingly management are world-class; humanities and basic sciences are present but less famous than the applied fields',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What Tsinghua actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — Tsinghua\'s programs each specify a CSCA subject combination; engineering typically requires STEM Chinese + Math + Physics',
              '**Sit the CSCA early** — Tsinghua\'s competitive engineering and business programs have January–March deadlines; the earliest viable CSCA session is critical',
              '**Prepare the application package** — passport, transcripts, study plan (500–1,500 words in Chinese or English), 2 recommendation letters, language evidence (HSK for Chinese-taught, IELTS/TOEFL for English-taught)',
              '**Apply online** — through the Tsinghua University International Students Office portal; pay the application fee',
              '**Submit before the program deadline** — most fall-intake programs close March–May; some engineering master\'s have earlier deadlines',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations Tsinghua asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Computer science / AI / software engineering', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['Mechanical / civil / automotive engineering', 'STEM Chinese + Math + Physics', 'Engineering fundamentals'],
              ['Materials science / chemistry', 'STEM Chinese + Math + Chemistry', 'Some programs add Physics'],
              ['Life sciences / biomedical / pharmacy', 'STEM Chinese + Math + Chemistry', 'Some require Physics too'],
              ['Architecture', 'STEM Chinese + Math + (Physics or both)', 'Studio-based; portfolio often required'],
              ['Economics / finance / management', 'Math (sometimes + STEM Chinese)', 'IMBA / Tsinghua MBA in English'],
              ['Public policy', 'Math + Humanities Chinese', 'IMPP master\'s in English'],
              ['Schwarzman Scholars', 'No formal CSCA requirement; English-language master\'s', 'Separate application with global pool'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the current combination. Tsinghua\'s International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund a Tsinghua degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the Tsinghua International Students Office',
              '**Tsinghua University scholarships** — partial tuition waivers and merit awards; university-managed; check the International Students Office for current offerings',
              '**Beijing Government Scholarship** — for international students studying in Beijing; tuition waiver + monthly stipend',
              '**Schwarzman Scholars** — fully funded English-language master\'s; one of the world\'s most selective programs; separate application process',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and Tsinghua-affiliated private scholarships',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr crunch applies',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at Tsinghua costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year (varies by program)', 'Some master\'s programs more expensive (MBA, etc.)'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard'],
              ['Living expenses', '¥1,500–¥3,000/month', '¥1,500–¥3,000/month', 'Food, transport, books'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme'],
              ['Annual total (typical)', '~¥50,000–¥80,000', '~¥60,000–¥110,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare. Tsinghua\'s own scholarships range from partial tuition waivers to substantial packages. Schwarzman Scholars is a separate, fully funded path.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Beijing, the campus, international community',
        intro:
          'What it feels like to live and study at Tsinghua.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Main campus** — in Hai Dian District, near the Old Summer Palace, neighboring Peking University',
              '**Satellite campuses** — additional facilities for sciences, engineering, and continuing education',
              '**Beijing city** — the political and cultural capital; metro and bike-share convenient; nearby attractions include the Great Wall, Forbidden City, Summer Palace',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes',
              '**Dining** — multiple cafeterias on campus with halal, vegetarian, and international options; nearby restaurants cover most cuisines',
              '**Cost of living in Beijing** — moderate for a Chinese tier-1 city; dormitory + cooking keeps expenses low',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Tsinghua ranked in world rankings?',
        a: 'Yes — Tsinghua is consistently in the top 50 globally across QS, THE, and ARWU rankings, and is among the top-ranked Chinese universities, particularly on engineering and computer science indicators.',
      },
      {
        q: 'What CSCA subjects does Tsinghua require?',
        a: 'It varies by program. Engineering and computer science typically ask for STEM Chinese + Math + Physics; chemistry and life sciences usually ask for Math + Chemistry. Always check the program\'s official page.',
      },
      {
        q: 'What is Schwarzman Scholars?',
        a: 'A fully funded one-year master\'s in Global Affairs (public policy, economics, international relations) taught entirely in English. One of the world\'s most selective programs; the application is separate from the standard Tsinghua international admissions.',
      },
      {
        q: 'Are there English-taught programs at Tsinghua?',
        a: 'Yes — substantially more at the master\'s and PhD level. SEM\'s IMBA, IMPP, and the Tsinghua MBA are taught in English; Schwarzman College is entirely English. Undergraduate English programs are smaller but growing through Xinya College.',
      },
      {
        q: 'How much does it cost to study at Tsinghua as an international student?',
        a: 'Typical all-in is ¥50,000–¥80,000/year for a bachelor\'s and ¥60,000–¥110,000 for a master\'s, excluding scholarships. CSC, Tsinghua\'s own scholarships, and the Beijing Government scholarship are the main funding options.',
      },
      {
        q: 'Does Tsinghua have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories; early application improves dormitory assignment.',
      },
      {
        q: 'How competitive is Tsinghua for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan. Applicants from the top of their national system typically have the best chance.',
      },
      {
        q: 'Does Tsinghua offer scholarships for international students?',
        a: 'Yes — Tsinghua\'s own scholarships, CSC, Beijing Government scholarship, and the Schwarzman Scholars program are the main options. Check the International Students Office for current year\'s offerings.',
      },
      {
        q: 'Where is the Tsinghua campus?',
        a: 'The main campus is in Hai Dian District, northwestern Beijing, near the Old Summer Palace, close to Peking University.',
      },
      {
        q: 'Is there an application fee for Tsinghua international admissions?',
        a: 'Yes — typically ¥400–¥800 per application, paid online through the application portal.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the Tsinghua International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September intake, target the earliest viable CSCA session. Tsinghua scholarship deadlines often close in March–April, so a winter or early-spring session gives you the most flexibility.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words; program-specific; written in the language of instruction), 2 recommendation letters from academic referees, language evidence, application fee.',
      },
      {
        name: 'Apply online through the Tsinghua portal',
        text: 'Submit the full package before the program deadline. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant, and questions about your study plan and research interests.',
      },
      {
        name: 'Consider Schwarzman Scholars as a separate path',
        text: 'If you have a global-affairs/public-policy/economics background and a strong application, the fully funded Schwarzman Scholars program is a Tsinghua option that operates on its own application cycle.',
      },
    ],
    ctaTitle: 'Applying to Tsinghua University?',
    ctaSubtitle:
      'SICA counselors review your target program\'s CSCA requirements, refine your study plan, and coordinate scholarship applications including Schwarzman if relevant. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university',
        label: 'Peking University',
        description: 'Tsinghua\'s across-the-road peer, the humanities and sciences flagship.',
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
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'How Tsinghua compares to other top Chinese universities.',
      },
    ],
  },
  zh: {
    slug: 'tsinghua-university',
    eyebrow: '大学简介',
    title: '清华大学——工科强校、院系与留学生申请',
    description:
      '清华大学（清华）——中国工科与应用科学旗舰。历史、特色专业、英语授课选项、CSCA 申请科目、奖学金、费用与实务指引。',
    subtitle:
      '清华大学是 1911 年成立的留学预备学校，1928 年成为正式大学，1952 年院系调整后成为中国顶级工科学校。今天覆盖所有主要学科，工科、计算机、材料尤强，基础科学与管理也在增长。国际申请者面对中国最严格的录取之一，工科、商科、公共政策与理科均有强项。',
    stats: [
      { value: '1911', label: '清华学堂创立' },
      { value: '21+', label: '院系' },
      { value: '多个', label: '英语授课硕博' },
      { value: '北京', label: '海淀，邻近北大' },
    ],
    quickAnswer:
      '清华大学是中国工科与应用科学旗舰。国际申请者通过 CSCA（2026 起必考）+ 学习计划申请。工科与计算机项目通常要求理工中文 + 数学 + 物理；逐项目核验。英语授课硕士项目很多；本科英语项目在增长。学费本科约 ¥30,000–60,000/年；清华提供自有奖学金与 CSC，苏世民学者项目（全英文、全额资助的公共政策/经济硕士）是全球最严格的同类项目之一。',
    keyTakeaways: [
      '1911 年创立（前身清华学堂），1928 年成为大学；1952 年院系调整奠定工科强校',
      '强项：工科（机械、电气、土木、化工、材料）、计算机、建筑、生命科学，基础与管理也在增长',
      '苏世民学者——全额资助、全英文公共政策/经济/国际关系硕士，全球最严格之一',
      'CSCA 组合：工科/CS 为理工中文 + 数学 + 物理；化工/材料/生科为理工中文 + 数学 + 化学',
      '费用：本科国际生约 ¥30,000–60,000/年；宿舍与生活费另算',
      '奖学金：CSC + 清华自有 + 苏世民 + 北京市',
    ],
    sections: [
      {
        id: 'overview',
        h2: '清华概览',
        intro: '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '清华大学是中国工科与应用科学旗舰，以学术严谨、技术深度以及与产业和政府的紧密联系著称。考虑工科、计算机、建筑或量化理科的国际申请者应将清华列为首选；公共政策、管理与基础科学也在成长，与北大各有千秋。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从清华学堂到工科强校',
        intro: '清华如何成为今天的工科旗舰。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1911 年**——为留美预备创立清华学堂；庚子赔款退还资助',
              '**1928 年**——更名为清华大学，扩展为正式大学',
              '**1930–40 年代**——在科学和工程上做出重大贡献，师资赴西方训练，奠定现代中国工程教育',
              '**1952 年**——院系调整，吸纳其他高校工科与理科系；成为中国顶级工科学校',
              '**1990–2000 年代**——211 工程（1995）与 985 工程（1998）；苏世民学院与新雅书院成立',
              '**今天**——约 21 个院系，约 5 万学生含约 5,000 国际学生；中国最严格的学校之一',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对国际申请者而言，清华的定位决定项目预期：工科与应用科学是差异化所在；人文学科虽在但不如北大有名。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色项目',
        intro: '清华强势在哪里，申什么。',
        blocks: [
          {
            type: 'table',
            caption: '清华院系与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['信息科学技术学院', '计算机科学、软件工程、AI、信息安全', '硕士项目英文可选'],
              ['自动化系', '自动化、AI、控制工程', '硕士项目英文'],
              ['机械工程系', '机械工程、能源与动力工程、汽车工程', '硕士项目英文'],
              ['材料科学与工程系', '材料科学、纳米材料', '硕士项目英文'],
              ['土木工程系', '土木工程、水利工程、建筑', '部分硕士英文'],
              ['化学系', '化学、化学工程', '硕士项目英文'],
              ['生命科学学院', '生物科学、生物医学工程、药学', '部分硕士英文'],
              ['经济管理学院（SEM）', '经济、金融、管理、会计', '多个硕士英文（IMBA、清华 MBA）'],
              ['公共管理学院', '公共管理、国际发展', 'IMPP 硕士英文'],
              ['苏世民书院', '全球事务硕士（全英文、全额资助）', '全英文'],
              ['新雅书院', '跨学科本科文理项目', '部分英文课程'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本科英语授课项目**——新雅书院是选项之一；工科本科仍以中文为主',
              '**硕士英文授课**——工科、CS、商科（IMBA、清华 MBA）、公共政策（IMPP）范围广；苏世民项目全英文',
              '**苏世民学者**——全球最严格的英文授课公共政策/经济/国际关系硕士；全额资助；独立申请池',
              '**博士英文授课**——多数博士项目可英文完成（需中文共同导师）；国际博士生常见',
              '**强势权衡**——工科、CS、材料、建筑、管理世界级；人文学科与基础科学虽在但不如应用领域知名',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro: '清华实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——清华每个项目都指定 CSCA 科目组合；工科通常为理工中文 + 数学 + 物理',
              '**早点考 CSCA**——清华的工科与商科竞争项目 1-3 月截止；最早场次很关键',
              '**备齐申请材料**——护照、成绩单、学习计划（500-1,500 字中文或英文）、2 封推荐信、语言证明',
              '**网上申请**——通过清华留学生办公室门户；付申请费',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止；部分工科硕士截止更早',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试',
            ],
          },
          {
            type: 'table',
            caption: '清华常见 CSCA 组合（逐项目核验）',
            columns: ['项目族', '常见 CSCA 组合', '说明'],
            rows: [
              ['计算机 / AI / 软件工程', '理工中文 + 数学 + 物理', '量化筛选'],
              ['机械 / 土木 / 汽车工程', '理工中文 + 数学 + 物理', '工科基础'],
              ['材料科学 / 化学', '理工中文 + 数学 + 化学', '部分项目也加物理'],
              ['生命科学 / 生物医学 / 药学', '理工中文 + 数学 + 化学', '部分也要物理'],
              ['建筑', '理工中文 + 数学 +（物理或两科）', '画室制；通常要作品集'],
              ['经济 / 金融 / 管理', '数学（有时加理工中文）', 'IMBA / 清华 MBA 全英文'],
              ['公共政策', '数学 + 人文中文', 'IMPP 硕士英文'],
              ['苏世民学者', '无正式 CSCA 要求；英文授课硕士', '独立全球申请池'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '始终查项目官方录取页确认当年组合。清华留学生办以英文回复书面问询，一般几个工作日内。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro: '如何为清华学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过清华留学生办作为接收单位申请',
              '**清华自有奖学金**——学费减免与优秀奖；校方管理；查留学生办当年公告',
              '**北京市政府奖学金**——在京学习的国际生；学费减免 + 月津贴',
              '**苏世民学者**——全额资助英文授课硕士；全球最严格之一；独立申请流程',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、清华相关私立奖学金',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro: '在清华一年的花销。',
        blocks: [
          {
            type: 'table',
            caption: '留学费用（规划近似值）',
            columns: ['项目', '本科', '硕士', '说明'],
            rows: [
              ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年', '部分硕士项目更贵（如 MBA）'],
              ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍'],
              ['生活费', '¥1,500–3,000/月', '¥1,500–3,000/月', '吃饭、交通、教材'],
              ['医保', '¥800/年', '¥800/年', '强制基础方案'],
              ['年度合计（典型）', '约 ¥50,000–80,000', '约 ¥60,000–110,000', '不含奖学金'],
            ],
          },
            {
              type: 'callout',
            tone: 'info',
            text: 'CSC 覆盖学费、住宿、月津贴与机票。清华自有奖学金从学费减免到大额套餐不等；苏世民学者是独立的全额资助路径。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——北京、校园、国际社群',
        intro: '在清华生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**主校区**——在海淀区，邻近颐和园，与北大比邻',
              '**卫星校区**——理科、工科与继续教育等额外设施',
              '**北京城**——政治文化中心；地铁与共享单车便利；附近景点有长城、故宫、颐和园',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划',
              '**餐饮**——多个校园食堂提供清真、素食、国际窗口；附近餐馆覆盖多数菜系',
              '**北京生活成本**——对中国一线城市属于中等；宿舍加自己做饭能压低支出',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '清华在世界排名里怎么样？',
        a: '是——清华长期位列 QS、THE、ARWU 等全球前 50，且在中国大学中工科与计算机指标领先。发布前请核验当年最新排名。',
      },
      {
        q: '清华要求哪些 CSCA 科目？',
        a: '按项目而定。工科与计算机通常要求理工中文 + 数学 + 物理；化工与生科常为数学 + 化学。始终查项目官方页面。',
      },
      {
        q: '什么是苏世民学者？',
        a: '全额资助、一年制全球事务硕士（公共政策、经济、国际关系），全英文授课。全球最严格的项目之一；申请与清华常规国际生招生独立。',
      },
      {
        q: '清华有英语授课项目吗？',
        a: '有——硕博层面远多于本科。SEM 的 IMBA、IMPP 与清华 MBA 都是英文；苏世民书院全英文。本科英语项目较少但在新雅书院在增长。',
      },
      {
        q: '在清华读一年多少钱？',
        a: '本科通常 ¥50,000–80,000/年，硕士 ¥60,000–110,000/年，不含奖学金。CSC、清华与北京市奖学金是主要资金来源。',
      },
      {
        q: '清华给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍；早申有助于拿到好分配。',
      },
      {
        q: '清华录取国际生竞争多大？',
        a: '中国最严格之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。在本国顶尖的申请者通常机会最大。',
      },
      {
        q: '清华给国际生提供奖学金吗？',
        a: '是——清华自有奖学金、CSC、北京市政府奖学金、苏世民学者项目是主要选项。查留学生办当年公告。',
      },
      {
        q: '清华校园在哪？',
        a: '主校区在北京市海淀区西北部，邻近颐和园，紧邻北大。',
      },
      {
        q: '清华申请费多少？',
        a: '通常每份 ¥400–800，通过申请门户在线支付。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览清华留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。清华的奖学金截止常在 3-4 月，冬季或早春场次给你最大灵活。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字、按项目、用授课语言）、2 封学术推荐信、语言证明、申请费。',
      },
      {
        name: '通过清华门户网上申请',
        text: '项目截止前提交完整材料。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）以及关于学习计划与研究兴趣的问题。',
      },
      {
        name: '把苏世民学者作为独立路径考虑',
        text: '若你有全球事务/公共政策/经济背景且申请很强，全额资助的苏世民学者项目按独立申请周期运作。',
      },
    ],
    ctaTitle: '正在申请清华大学？',
    ctaSubtitle:
      'SICA 顾问核对目标项目的 CSCA 要求、优化你的学习计划、并协调各项奖学金申请（包括苏世民）。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university',
        label: '北京大学',
        description: '清华的马路对面邻居，人文与理科旗舰。',
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
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '清华与中国其他顶级大学如何对比。',
      },
    ],
  },
};
