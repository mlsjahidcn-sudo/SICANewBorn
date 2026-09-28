import type { LocalizedGuide } from './types';

/**
 * Peking University (北大) profile — one of 10 GEO-optimized
 * university profile pages (docs/university-profiles-10-article-plan.md).
 * Target queries: "peking university", "Peking University admission",
 * "Peking University international students", "PKU", "北大".
 */
export const pekingUniversityGuide: LocalizedGuide = {
  en: {
    slug: 'peking-university',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'Peking University — Programs, Admissions & International Student Guide',
    description:
      'Peking University (PKU, 北大) — China\'s oldest modern national university. History, schools, signature programs, English-taught options, CSCA admissions combinations, scholarships, cost of attendance, and practical guidance for international applicants.',
    subtitle:
      'Peking University is the oldest modern national university in China, founded in 1898 as the Imperial University of Peking (Jingshi Daxuetang). It sits at the top of every Chinese university ranking and runs the full range of humanities, social sciences, and natural sciences — most with strong international recognition. This profile covers what international applicants actually need: PKU\'s schools and signature programs, the CSCA subject combinations Peking requires, the English-taught master\'s and undergraduate programs, the scholarships (CSC + PKU\'s own Peking University scholarships), cost of attendance, and the practical application timeline.',
    stats: [
      { value: '1898', label: 'Founded as Jingshi Daxuetang' },
      { value: '30+', label: 'Schools and colleges' },
      { value: 'Multiple', label: 'English-taught master\'s programs' },
      { value: 'Beijing', label: 'Hai Dian, near Old Summer Palace' },
    ],
    quickAnswer:
      'Peking University (PKU) is China\'s oldest modern national university, founded 1898. It admits international bachelor\'s and master\'s applicants through the CSCA pathway (mandatory from 2026) plus a study-plan-based admissions process. Most English-taught master\'s programs require the Humanities Chinese track + a Math/fundamentals combination; verify the exact subjects per program. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s, less for master\'s. PKU offers the Peking University scholarship on top of CSC for outstanding applicants; the campus is in northwestern Beijing with extensive international student services.',
    keyTakeaways: [
      'Founded 1898 as Jingshi Daxuetang; among the oldest modern national universities in the world',
      'Full range of schools — humanities, social sciences, natural sciences, medicine; ~30 schools/colleges',
      'English-taught master\'s programs across most disciplines; undergraduate English-taught programs are growing',
      'Admissions for international students: CSCA + study plan + recommendation letters; program-specific subject combinations',
      'Cost: international bachelor\'s ~¥30,000–¥60,000/year; master\'s varies by program; dorm + living expenses on top',
      'Scholarships: CSC + Peking University\'s own programs + external; apply through the international student office',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'Peking University at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'Peking University is the oldest modern national university in China, with a reputation for academic depth, intellectual freedom, and the full range of disciplines from theoretical mathematics to comparative literature. For international students considering China, Peking University is the top-of-list option for those seeking the strongest academic environment — particularly in the humanities, social sciences, and basic sciences — and is increasingly competitive in applied and professional fields as well.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from Jingshi Daxuetang to today',
        intro:
          'How Peking University became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1898 — founded as Jingshi Daxuetang (Imperial University of Peking)** as part of the Hundred Days Reform; the predecessor of modern Chinese higher education',
              '**1911 — renamed Peking University** after the fall of the Qing; early 20th-century intellectual center',
              '**1919 — May Fourth Movement** centered on the Peking University campus; shaped modern Chinese intellectual culture',
              '**1952 — restructuring** absorbed departments from elsewhere; the merger with Yenching University among others shaped the modern PKU',
              '**1998 — centennial** marked PKU\'s role as a national flagship; subsequent decades brought the Project 985, Project 211, and Double First Class designations',
              '**Today** — ~30 schools and colleges, ~40,000 students including ~6,000 international students; one of the top-ranked Chinese universities globally',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For international applicants, the historical reputation translates into admissions expectations: PKU\'s screening is academically rigorous across disciplines, and the study plan matters more for borderline applicants than at less-selective universities.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where Peking University is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'PKU schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['School of Humanities', 'Chinese Language & Literature, History, Philosophy, Archaeology', 'Some master\'s programs in English'],
              ['School of Social Sciences', 'International Relations, Sociology, Economics (undergraduate in Chinese; master\'s in English)', 'Several master\'s programs in English'],
              ['School of Mathematical Sciences', 'Mathematics, Statistics, Data Science', 'Master\'s programs available in English'],
              ['School of Physics', 'Physics, Astronomy, Atmospheric Sciences', 'Master\'s programs in English'],
              ['School of Life Sciences', 'Biological Sciences, Biomedical Sciences', 'Master\'s in English'],
              ['School of Information Science & Technology', 'Computer Science, Software Engineering, AI', 'Several master\'s programs in English'],
              ['Peking University HSBC Business School (PHBS)', 'Finance, Management, Economics (full English track)', 'English for all main programs'],
              ['Yenching Academy of Chinese Studies', 'Master\'s in Chinese Studies', 'English-language program'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — PKU\'s full-English undergraduate options are smaller than the master\'s; most undergrad programs are Chinese-taught',
              '**Master\'s in English** — substantially broader, especially in business, public policy, international relations, sciences, and engineering; verify per program',
              '**PhD in English** — most PhD programs can be completed in English with a Chinese-language co-supervisor; common for international PhD students',
              '**Yenching Academy** — the dedicated master\'s program for international students studying Chinese civilization, taught in English with intensive Chinese language training',
              '**Strengths to weigh** — humanities, social sciences, basic sciences are world-class; applied fields have grown but remain less famous than the sciences and humanities',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What Peking University actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — Peking University\'s programs each specify a CSCA subject combination; some require the Humanities Chinese track, others do not',
              '**Sit the CSCA early** — for September intake, target the earliest viable session; Peking University\'s competitive master\'s programs often have January–March deadlines',
              '**Prepare the application package** — passport, high school / bachelor\'s transcripts, study plan (500–1,500 words in Chinese or English), 2 recommendation letters, language evidence (HSK for Chinese-taught, IELTS/TOEFL for English-taught)',
              '**Apply online** — through the Peking University International Students Office portal; pay the application fee (typically ¥400–¥800)',
              '**Submit before the program deadline** — most fall-intake programs close March–May; some early-bird or rolling deadlines exist',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview; prepare for both academic and Chinese-language questions',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations PKU asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Humanities (Chinese literature, history, philosophy)', 'Humanities Chinese + Math', 'Study-plan quality often decides'],
              ['Social sciences (economics, sociology, IR)', 'Humanities Chinese + Math', 'Some programs add a Math-heavy track'],
              ['Mathematics / physics', 'STEM Chinese (sometimes) + Math + Physics', 'Verify per program'],
              ['Life sciences / biomedical', 'Math + Chemistry', 'Some programs require Physics too'],
              ['Computer science / AI', 'STEM Chinese (sometimes) + Math + Physics', 'Quant-heavy screening'],
              ['Business / finance (PHBS)', 'Math + English language (often no Chinese track)', 'English-language instruction throughout'],
              ['Chinese studies (Yenching)', 'Humanities Chinese + Math', 'Chinese language training built in'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the exact CSCA combination and any program-specific test requirements. The International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund a Peking University degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the Peking University international student office as your host institution',
              '**Peking University scholarships** — partial tuition waivers and merit awards; university-managed; check the International Students Office for current offerings',
              '**Beijing Government Scholarship** — for international students studying in Beijing; tuition waiver + monthly stipend; smaller pool',
              '**Confucius Institute Scholarship** — for students in Chinese language and culture programs; full funding with conditions',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and Peking-affiliated private scholarships',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr deadline crunch applies; the Peking University international office can advise on the application',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at Peking University costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year (varies by program)', 'Some master\'s programs more expensive (MBA, etc.)'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard; off-campus is much higher'],
              ['Living expenses', '¥1,500–¥3,000/month', '¥1,500–¥3,000/month', 'Food, transport, books; can be lower on a tight budget'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme; commercial top-up optional'],
              ['Annual total (typical)', '~¥50,000–¥80,000', '~¥60,000–¥110,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare — for many international students the all-in cost is essentially zero. Peking University\'s own scholarships range from partial tuition waivers to substantial packages; combine them where eligible.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Beijing, the campus, international community',
        intro:
          'What it feels like to live and study at Peking University.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Yan Yuan (燕园) campus** — the historic central campus in Hai Dian, near the Old Summer Palace; combines classical Chinese architecture with modern facilities',
              '**Multiple satellite campuses** — Yanyuan is supplemented by newer facilities for sciences and medicine; most international student services are at the central campus',
              '**Beijing city** — the political and cultural capital; transport via metro and bike-share is convenient; nearby attractions include the Great Wall, Forbidden City, Summer Palace',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes; PKU has a long history of hosting international students and the services are mature',
              '**Dining** — multiple cafeterias on campus with halal, vegetarian, and international options; nearby restaurants cover most cuisines; central Beijing is a food capital',
              '**Cost of living in Beijing** is moderate for a Chinese tier-1 city; dormitory + cooking for yourself keeps expenses low',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Peking University ranked in world rankings?',
        a: 'Yes — PKU is consistently in the top 50 globally across QS, THE, and ARWU rankings, and is the top-ranked Chinese university on most indicators. Verify the current year\'s rankings before publication.',
      },
      {
        q: 'What CSCA subjects does Peking University require?',
        a: 'It varies by program. Most humanities and social-science programs ask for Humanities Chinese + Math; sciences and engineering programs vary. Always check the program\'s official page for the current combination.',
      },
      {
        q: 'Are there English-taught programs at Peking University?',
        a: 'Yes — substantially more at the master\'s and PhD level than at the undergraduate level. The Yenching Academy master\'s in Chinese Studies is taught in English; Peking HSBC Business School is entirely English-language.',
      },
      {
        q: 'How much does it cost to study at Peking University as an international student?',
        a: 'Typical all-in is ¥50,000–¥80,000/year for a bachelor\'s and ¥60,000–¥110,000 for a master\'s, excluding scholarships. A CSC scholarship covers most costs; Peking University\'s own scholarships and the Beijing Government scholarship are additional options.',
      },
      {
        q: 'Does Peking University have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories with both Chinese and international roommates where possible; early application improves dormitory assignment.',
      },
      {
        q: 'What is Yenching Academy?',
        a: 'A dedicated master\'s program for international students studying Chinese civilization, taught in English with intensive Chinese language training. One of the most respected programs of its kind in Asia.',
      },
      {
        q: 'How competitive is Peking University for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan. Applicants from the top 10% of their national system typically have the best chance.',
      },
      {
        q: 'Does Peking University offer scholarships for international students?',
        a: 'Yes — the Peking University scholarships (partial tuition waivers and merit awards), the Chinese Government Scholarship (CSC, full funding), the Beijing Government Scholarship, and the Confucius Institute Scholarship are the main options. Check the International Students Office for the current year\'s offerings.',
      },
      {
        q: 'Where is the Peking University campus?',
        a: 'The historic Yan Yuan (燕园) campus is in Hai Dian District, northwestern Beijing, near the Old Summer Palace. The International Students Office is on this central campus. Some departments and facilities are at newer satellite campuses.',
      },
      {
        q: 'Is there an application fee for Peking University international admissions?',
        a: 'Yes — typically ¥400–¥800 per application, paid online through the application portal. Some programs waive the fee for specific scholarship applicants or nationals of partner countries.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the Peking University International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests. Plan your CSCA session around this combination.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September 2026 intake, target the earliest viable CSCA session. Beijing scholarship deadlines often close in March–April, so a winter or early-spring session gives you the most flexibility.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words; program-specific; written in the language of instruction), 2 recommendation letters from academic referees, language evidence (HSK or IELTS/TOEFL), application fee.',
      },
      {
        name: 'Apply online through the PKU portal',
        text: 'Submit the full package before the program deadline. Most fall-intake programs close March–May. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant, and questions about your study plan and research interests.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit CSC scholarship application through the PKU international office; apply for the Peking University scholarship and Beijing Government scholarship where eligible. Multiple small scholarships often beat one large one.',
      },
    ],
    ctaTitle: 'Applying to Peking University?',
    ctaSubtitle:
      'SICA counselors review your target program\'s CSCA requirements, refine your study plan, and coordinate scholarship applications. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/tsinghua-university',
        label: 'Tsinghua University',
        description: 'Beijing\'s engineering powerhouse, just across the road from PKU.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The exam that determines what combinations you can apply with.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'The full-funding scholarship path for PKU and most other Chinese universities.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'How Peking University compares to other top Chinese universities.',
      },
    ],
  },
  zh: {
    slug: 'peking-university',
    eyebrow: '大学简介',
    title: '北京大学——院系、申请与留学生指南',
    description:
      '北京大学（PKU, 北大）——中国最古老的现代国立大学。历史、院系、特色专业、英语授课项目、CSCA 申请科目组合、奖学金、留学费用，以及给国际申请者的实务指引。',
    subtitle:
      '北京大学是 1898 年成立的京师大学堂，是中国最古老的现代国立大学，居各类中国大学排名之首，文、社、理科齐全，多数国际知名度高。本简介覆盖国际申请者实际需要的信息：北大学院与特色专业、CSCA 申请科目、英语授课硕博项目、奖学金（ CSC + 北大自有奖学金）、留学费用，以及实用申请时间线。',
    stats: [
      { value: '1898', label: '京师大学堂创立' },
      { value: '30+', label: '院系' },
      { value: '多个', label: '英语授课硕博项目' },
      { value: '北京', label: '海淀，邻近颐和园' },
    ],
    quickAnswer:
      '北京大学（PKU）是中国最古老的现代国立大学，1898 年成立。通过 CSCA 通道（2026 年起必考）+ 学习计划方式招收国际本科生与硕士生。多数英语授课硕士项目要求人文中文轨 + 数学/基础科组合；具体科目按项目核验。本科国际生学费约 ¥30,000–60,000/年，硕士按项目不同。除 CSC 外，北大提供北大奖学金；校园在北京西北部，留学生服务成熟。',
    keyTakeaways: [
      '1898 年创立（前身京师大学堂），是世界上最古老的现代国立大学之一',
      '院系齐全——文、社、理、医；约 30 个院系',
      '英语授课硕士项目几乎覆盖全部学科；本科英语项目在增长',
      '国际生申请：CSCA + 学习计划 + 推荐信；按项目定科目组合',
      '费用：本科国际生约 ¥30,000–60,000/年；硕士按项目；宿舍与生活费另算',
      '奖学金：CSC + 北大自有项目 + 外部；通过留学生办公室申请',
    ],
    sections: [
      {
        id: 'overview',
        h2: '北京大学概览',
        intro:
          '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '北京大学是中国最古老的现代国立大学，以学术深度、思想自由以及从理论数学到比较文学的完整学科覆盖而著称。对考虑来华的国际学生而言，北大是寻求最强学术环境——尤其在人文学科、社会科学与基础科学方面——的首选；在应用与专业领域的竞争力也在持续增强。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从京师大学堂到今日',
        intro:
          '北大如何成为今天这所大学。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1898 年**——戊戌变法期间创立京师大学堂，是中国现代高等教育的先声',
              '**1911 年**——清亡后更名为北京大学；20 世纪早期成为新文化运动中心',
              '**1919 年**——五四运动以北大校园为中心；塑造了现代中国知识分子文化',
              '**1952 年**——院系调整，吸纳其他高校相关系科；与燕京大学等合并塑造了现代北大',
              '**1998 年**——百年校庆，确立北大作为国家旗舰的角色；此后相继入选 211、985、双一流',
              '**今天**——约 30 个院系，约 4 万学生含约 6,000 国际学生；各类中国大学排名的前列',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对国际申请者而言，悠久声誉意味着录取预期：北大的学术筛选严格，学习计划对擦边申请者的影响远大于普通学校。',
          },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色专业',
        intro:
          '北大强势在哪里，该申哪些方向。',
        blocks: [
          {
            type: 'table',
            caption: '北大学院与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['人文学院', '中国语言文学、历史、哲学、考古', '部分硕士项目英文'],
              ['社会科学学院', '国际关系、社会学、经济学（本科中文；硕博英文）', '若干硕士项目英文'],
              ['数学科学学院', '数学、统计、数据科学', '硕士项目英文可选'],
              ['物理学院', '物理、天文、大气科学', '硕士项目英文'],
              ['生命科学学院', '生物科学、生物医学', '硕士项目英文'],
              ['信息科学技术学院', '计算机科学、软件工程、AI', '若干硕士项目英文'],
              ['北大汇丰商学院（PHBS）', '金融、管理、经济（全英文项目）', '主要项目全英文'],
              ['燕京学堂（Yenching Academy）', '中国研究硕士', '全英文授课'],
            ],
          },
            {
              type: 'ul',
            items: [
              '**本科英语授课项目**——北大的本科全英文项目少于硕士；多数本科项目中文授课',
              '**硕士英文授课**——范围显著更广，尤其是商科、公共政策、国际关系、理科与工科；逐项目核验',
              '**博士英文授课**——多数博士项目可以英文完成（需中文共同导师）；国际博士生常见',
              '**燕京学堂**——国际生攻读中国文明的硕士项目，全英文授课，密集中文训练',
              '**强势权衡**——人文、社科、基础科学世界级；应用学科近年来成长但仍不如人文学科知名',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro:
          '北大实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——北大的每个项目都指定 CSCA 科目组合；有些要求人文中文轨，有些不要',
              '**早点考 CSCA**——9 月入学最早考一次；北大热门硕博项目常在 1-3 月截止',
              '**备齐申请材料**——护照、高中/本科成绩单、学习计划（500-1,500 字中文或英文）、2 封推荐信、语言证明（中文授课要 HSK；英文授课要 IELTS/TOEFL）',
              '**网上申请**——通过北大留学生办公室门户；付申请费（通常 ¥400-800）',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止；有些有早鸟或滚动截止',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试；准备学术与中文语言问题',
            ],
          },
            {
              type: 'table',
              caption: '北大常见 CSCA 组合（逐项目核验）',
              columns: ['项目族', '常见 CSCA 组合', '说明'],
              rows: [
                ['人文（中文、历史、哲学）', '人文中文 + 数学', '学习计划质量常决定结果'],
                ['社科（经济、社会、国关）', '人文中文 + 数学', '部分项目加重数学'],
                ['数学 / 物理', '理工中文（部分）+ 数学 + 物理', '逐项目核验'],
                ['生命科学 / 生物医学', '数学 + 化学', '部分项目也要物理'],
                ['计算机 / AI', '理工中文（部分）+ 数学 + 物理', '量化筛选'],
                ['商科 / 金融（PHBS）', '数学 + 英语（通常无中文轨）', '全英文授课'],
                ['中国研究（燕京学堂）', '人文中文 + 数学', '含中文训练'],
              ],
            },
            {
              type: 'callout',
              tone: 'info',
            text: '始终查项目的官方录取页，确认 CSCA 科目组合与项目特有考试要求。留学生办公室以英文回复书面问询，一般几个工作日内答复。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro:
          '如何为北大学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国国家留学基金委奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过北大留学生办作为接收单位申请',
              '**北大奖学金**——学费减免与优秀奖；校方管理；查留学生办当年公告',
              '**北京市政府奖学金**——在京学习的国际生；学费减免+月津贴；名额较少',
              '**孔子学院奖学金**——汉语言文化项目；全额资助带条件',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、北大相关私立奖学金',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用；北大留学生办可指导申请',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro:
          '在北大一年的花销。',
        blocks: [
          {
            type: 'table',
            caption: '留学费用（规划近似值）',
            columns: ['项目', '本科', '硕士', '说明'],
            rows: [
              ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年（按项目）', '部分硕士项目更贵（如 MBA）'],
              ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍标配；校外高得多'],
              ['生活费', '¥1,500–3,000/月', '¥1,500–3,000/月', '吃饭、交通、教材；省一点可更低'],
              ['医保', '¥800/年', '¥800/年', '强制基础方案；可选商业补充'],
              ['年度合计（典型）', '约 ¥50,000–80,000', '约 ¥60,000–110,000', '不含奖学金'],
            ],
          },
            {
              type: 'callout',
            tone: 'info',
            text: 'CSC 奖学金覆盖学费、住宿、月津贴、机票——多数国际生实际花销接近零。北大自有奖学金从学费减免到大额套餐不等；符合条件可叠加申请。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——北京、校园、国际社群',
        intro:
          '在北大生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**燕园校区**——历史中心校区在海淀，邻近颐和园；古典建筑与现代设施融合',
              '**多个卫星校区**——燕园之外有理学部、医学部等较新设施；多数留学生服务在中心校区',
              '**北京城**——政治文化中心；地铁与共享单车便利；附近景点有长城、故宫、颐和园',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划；北大的留学生接待历史长，体系成熟',
              '**餐饮**——多个校园食堂提供清真、素食、国际窗口；附近餐馆覆盖多数菜系；北京是美食之都',
              '**北京生活成本**——对中国一线城市属于中等；宿舍加自己做饭能压低支出',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '北京大学在世界排名里怎么样？',
        a: '是——北大长期位列 QS、THE、ARWU 等全球前 50，且在多数指标上是中国排名最高的大学。发布前请核验当年最新排名。',
      },
      {
        q: '北大要求哪些 CSCA 科目？',
        a: '按项目而定。多数人文与社科项目要求人文中文 + 数学；理工科各异。始终查项目官方页面的当年科目组合。',
      },
      {
        q: '北大有英语授课项目吗？',
        a: '有——硕博层面远多于本科。燕京学堂的中国研究硕士为全英文授课；北大汇丰商学院全英文。',
      },
      {
        q: '在北大读一年多少钱？',
        a: '本科通常 ¥50,000–80,000/年，硕士 ¥60,000–110,000/年，不含奖学金。CSC 覆盖主要费用；北大与北京市奖学金是补充。',
      },
      {
        q: '北大给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍，尽可能与中外学生混住；早申有助于拿到好分配。',
      },
      {
        q: '什么是燕京学堂？',
        a: '国际生攻读中国文明的硕士项目，全英文授课，密集中文训练。亚洲同类最受认可的项目之一。',
      },
      {
        q: '北大录取国际生竞争多大？',
        a: '中国最竞争之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。在本国前 10% 的申请者通常机会最大。',
      },
      {
        q: '北大给国际生提供奖学金吗？',
        a: '是——北大奖学金（学费减免与优秀奖）、CSC（全额资助）、北京市政府奖学金、孔子学院奖学金是主要选项。查留学生办当年公告。',
      },
      {
        q: '北大校园在哪？',
        a: '历史燕园校区在北京市海淀区西北部，邻近颐和园。留学生办公室在中心校区。',
      },
      {
        q: '北大申请费多少？',
        a: '通常每份 ¥400–800，通过申请门户在线支付。部分项目为特定奖学金或合作国家申请者免申请费。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览北大留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。围绕这个组合规划 CSCA 场次。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。北京的奖学金截止常在 3-4 月，冬季或早春场次给你最大灵活。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字、按项目、用授课语言）、2 封学术推荐信、语言证明（HSK 或 IELTS/TOEFL）、申请费。',
      },
      {
        name: '通过北大门户网上申请',
        text: '项目截止前提交完整材料。多数秋季入学项目 3-5 月截止。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）以及关于学习计划与研究兴趣的问题。',
      },
      {
        name: '并行申请奖学金',
        text: '通过北大留学生办提交 CSC 申请；符合条件时申请北大奖学金与北京市政府奖学金。多笔小额常胜一笔大额。',
      },
    ],
    ctaTitle: '正在申请北京大学？',
    ctaSubtitle:
      'SICA 顾问核对目标项目的 CSCA 要求、优化你的学习计划、并协调各项奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/tsinghua-university',
        label: '清华大学',
        description: '北京的工科强校，与北大一路之隔。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '决定你能拿什么科目组合去申请的那场考试。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: '北大与多数中国大学的全额资助奖学金路径。',
      },
      {
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '北大与中国其他顶级大学如何对比。',
      },
    ],
  },
};
