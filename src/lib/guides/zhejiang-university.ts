import type { LocalizedGuide } from './types';

/**
 * Zhejiang University (浙大) profile — university profile #5 of 10.
 */
export const zhejiangUniversityGuide: LocalizedGuide = {
  en: {
    slug: 'zhejiang-university',
    eyebrow: 'UNIVERSITY PROFILE',
    title: 'Zhejiang University — Hangzhou\'s Comprehensive Flagship, Programs & International Admissions',
    description:
      'Zhejiang University (ZJU, 浙大) — Hangzhou\'s flagship comprehensive research university. History, signature programs (engineering, sciences, medicine, business), English-taught options, CSCA combinations, scholarships, cost, and practical guidance.',
    subtitle:
      'Zhejiang University is one of China\'s oldest and most selective universities, located in Hangzhou — the home of Alibaba and a growing tech center. Strong across engineering, computer science, basic sciences, and medicine, ZJU has substantial international programs and English-language options at the master\'s and PhD levels. For international applicants considering a strong comprehensive university outside Beijing or Shanghai, ZJU is the top option.',
    stats: [
      { value: '1897', label: 'Founded as Qiushi Academy' },
      { value: 'Multiple', label: 'Schools including medical' },
      { value: 'Many', label: 'English-taught master\'s / PhD' },
      { value: 'Hangzhou', label: 'Zijingang main campus' },
    ],
    quickAnswer:
      'Zhejiang University is one of China\'s oldest comprehensive universities, founded 1897, located in Hangzhou. International applicants apply through CSCA (mandatory from 2026) plus a study plan. Engineering programs typically require STEM Chinese + Math + Physics; sciences vary; medical programs require Math + Chemistry. Tuition is ~¥30,000–¥60,000/year for international bachelor\'s; ZJU offers its own scholarships in addition to CSC, plus the Zhejiang University scholarships for outstanding applicants.',
    keyTakeaways: [
      'Founded 1897 as Qiushi Academy; one of China\'s oldest universities; current form after the 1998 merger of four universities',
      'Strengths: engineering (mechanical, electrical, materials, computer), basic sciences, medicine, business',
      'Hangzhou location — home of Alibaba; tech center; relatively lower cost of living than Beijing or Shanghai',
      'English-taught master\'s programs across most disciplines; undergraduate English programs growing',
      'CSCA combinations: STEM Chinese + Math + Physics for engineering; Math + Chemistry for medical',
      'Scholarships: CSC + ZJU\'s own + Zhejiang provincial government',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'ZJU at a glance',
        intro:
          'What kind of university it is, in one paragraph.',
        blocks: [
          {
            type: 'p',
            text: 'Zhejiang University is one of China\'s oldest and most selective comprehensive universities, with a tradition in engineering, computer science, basic sciences, and medicine. The 1998 merger of four universities formed the modern ZJU, giving it both the heritage of a 100+ year institution and the breadth of a modern comprehensive research university. For international applicants considering engineering, computer science, sciences, or medicine in Hangzhou, ZJU is the top option.',
          },
        ],
      },
      {
        id: 'history',
        h2: 'History — from Qiushi Academy to Hangzhou\'s flagship',
        intro:
          'How ZJU became the institution it is.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1897 — founded as Qiushi Academy (求是书院)** in Hangzhou; one of the earliest modern Chinese universities',
              '**1928 — renamed National Chekiang University (国立浙江大学)**',
              '**1930s–40s** — major contributions to Chinese academic development under the presidency of Zhu Kezhen and others',
              '**1952 — restructuring** absorbed and lost departments; the school entered a long rebuilding period',
              '**1998 — modern form created** by merger of four universities (Zhejiang University, Hangzhou University, Zhejiang Agricultural University, and Zhejiang Medical University); the new ZJU became a comprehensive flagship',
              '**Today** — multiple schools including humanities, sciences, engineering, medicine; ~70,000 students including ~9,000 international students; one of the top-ranked Chinese universities globally',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'ZJU\'s Hangzhou location is increasingly attractive for international students in tech: Alibaba, Ant Group, NetEase, and many other tech firms are headquartered there, providing internship and post-graduation employment opportunities.',
          },
        ],
      },
      {
        id: 'academics',
        h2: 'Academics — schools and signature programs',
        intro:
          'Where ZJU is strong and what to apply for.',
        blocks: [
          {
            type: 'table',
            caption: 'ZJU schools and example signature programs',
            columns: ['School', 'Example signature programs', 'English instruction'],
            rows: [
              ['College of Engineering', 'Mechanical Engineering, Energy Engineering, Materials Science', 'Master\'s in English available'],
              ['College of Computer Science & Technology', 'Computer Science, Software Engineering, AI', 'Master\'s in English available'],
              ['College of Electrical Engineering', 'Electrical Engineering, Automation, Information Engineering', 'Master\'s in English available'],
              ['School of Mathematical Sciences', 'Mathematics, Applied Mathematics, Statistics', 'Master\'s in English available'],
              ['School of Physics', 'Physics, Optics, Condensed Matter', 'Master\'s in English available'],
              ['School of Chemistry & Chemical Engineering', 'Chemistry, Chemical Engineering', 'Master\'s in English available'],
              ['School of Life Sciences', 'Biological Sciences, Biotechnology, Ecology', 'Master\'s in English available'],
              ['School of Medicine (formerly Zhejiang Medical University)', 'Clinical Medicine, Public Health, Pharmacy, Nursing', 'Some master\'s in English'],
              ['School of Management', 'Business Administration, Marketing, Accounting', 'Some master\'s in English'],
              ['School of Economics', 'Economics, Finance, International Economics', 'Some master\'s in English'],
              ['School of Public Affairs', 'Public Administration, International Relations', 'Some master\'s in English'],
              ['Zhejiang University/University of Edinburgh Institute (ZJU-UoE)', 'Biomedical Sciences, Public Health (joint degree)', 'All-English instruction'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Undergraduate English-taught programs** — ZJU-UoE joint institute is a signature English-medium undergraduate option; some engineering and business programs have English tracks',
              '**Master\'s in English** — substantial breadth across engineering, computer science, sciences, medicine, and business',
              '**ZJU-UoE Institute** — joint programs with the University of Edinburgh; all-English instruction',
              '**PhD in English** — most PhD programs can be completed in English with a Chinese co-supervisor',
              '**Strengths to weigh** — engineering, computer science, basic sciences, medicine; a comprehensive option outside Beijing/Shanghai',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: 'Admissions for international students',
        intro:
          'What ZJU actually requires from international applicants.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Check program-specific subject requirements** — ZJU\'s programs each specify a CSCA subject combination; engineering typically requires STEM Chinese + Math + Physics',
              '**Sit the CSCA early** — for September intake, target the earliest viable session; ZJU\'s competitive programs have January–March deadlines',
              '**Prepare the application package** — passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence',
              '**Apply online** — through the ZJU International Students Office portal; pay the application fee',
              '**Submit before the program deadline** — most fall-intake programs close March–May',
              '**Interview (where applicable)** — competitive master\'s and PhD programs may request an online interview',
            ],
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations ZJU asks for (verify per program)',
            columns: ['Program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['Computer science / AI / software engineering', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['Mechanical / electrical / energy engineering', 'STEM Chinese + Math + Physics', 'Engineering fundamentals'],
              ['Materials science / chemical engineering', 'STEM Chinese + Math + Chemistry', 'Some add Physics'],
              ['Mathematics / physics', 'STEM Chinese + Math + Physics', 'Verify per program'],
              ['Life sciences / biotechnology', 'Math + Chemistry', 'Some require Physics too'],
              ['Clinical medicine / public health / pharmacy', 'Math + Chemistry', 'MBBS 6 years; verify specific requirements'],
              ['Business / management / economics', 'Math (sometimes + STEM Chinese)', 'Some master\'s in English'],
              ['ZJU-UoE joint institute', 'Math + Chemistry', 'English-medium instruction'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Always check the program\'s official admissions page for the current CSCA combination. ZJU\'s International Students Office responds in English to written inquiries within a few business days.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships and financial aid',
        intro:
          'How to fund a ZJU degree.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — full funding (tuition, dorm, monthly stipend, airfare); submit through the ZJU International Students Office',
              '**ZJU scholarships** — partial tuition waivers and merit awards; university-managed; check the International Students Office for current offerings',
              '**Zhejiang Provincial Government Scholarship** — for international students studying in Zhejiang; tuition waiver + monthly stipend',
              '**ZJU-UoE Institute scholarships** — for the joint programs with Edinburgh; partial coverage available',
              '**External scholarships** — home-country government scholarships, foundation scholarships, and ZJU-affiliated private scholarships',
              '**CSC scholarship applicants must submit CSCA scores** — the Jan–Apr crunch applies',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: 'Cost of attendance',
        intro:
          'What a year at ZJU costs.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of attendance (planning approximations)',
            columns: ['Item', 'Bachelor\'s', 'Master\'s', 'Notes'],
            rows: [
              ['Tuition', '¥30,000–¥60,000/year', '¥35,000–¥80,000/year', 'Some programs more expensive'],
              ['Dormitory', '¥1,200–¥3,000/year', '¥1,500–¥4,000/year', 'On-campus dormitory standard'],
              ['Living expenses', '¥1,200–¥2,500/month', '¥1,200–¥2,500/month', 'Hangzhou is more affordable than Beijing/Shanghai'],
              ['Insurance', '¥800/year', '¥800/year', 'Required basic scheme'],
              ['Annual total (typical)', '~¥45,000–¥75,000', '~¥55,000–¥105,000', 'Excluding scholarships'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A CSC scholarship covers tuition, dorm, monthly stipend, and airfare. ZJU\'s own scholarships range from partial tuition waivers to substantial packages. Hangzhou\'s lower cost of living compared to Beijing/Shanghai is a quiet advantage.',
          },
        ],
      },
      {
        id: 'life',
        h2: 'Student life — Hangzhou, the campus, international community',
        intro:
          'What it feels like to live and study at ZJU.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Zijingang campus** — the main, modern campus southwest of Hangzhou; combines teaching, research, and residential facilities; relatively new with green-space design',
              '**Other campuses** — Yuquan (historic, smaller), Xihu (engineering research), Zhijiang (medical); each with specific functions',
              '**Hangzhou city** — the home of Alibaba, Ant Group, NetEase; historic West Lake scenery; lower cost of living than Beijing or Shanghai',
              '**International student services** — dedicated office, orientation programs, language support, mentorship schemes',
              '**Dining** — multiple cafeterias with halal, vegetarian, and international options; Hangzhou cuisine is one of China\'s eight great traditions',
              '**Tech industry connections** — Hangzhou is increasingly important for tech careers; ZJU students benefit directly',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is ZJU ranked in world rankings?',
        a: 'Yes — ZJU is consistently in the top 100 globally across QS, THE, and ARWU rankings, and is among the top-ranked Chinese universities, particularly on engineering and science indicators.',
      },
      {
        q: 'What CSCA subjects does ZJU require?',
        a: 'It varies by program. Engineering typically asks for STEM Chinese + Math + Physics; medical programs ask for Math + Chemistry. Always check the program\'s official page.',
      },
      {
        q: 'What is ZJU-UoE Institute?',
        a: 'A joint institute with the University of Edinburgh, primarily in biomedical sciences and public health. All-English instruction; one of ZJU\'s signature international offerings.',
      },
      {
        q: 'What is ZJU known for?',
        a: 'Engineering (mechanical, electrical, materials), computer science, basic sciences, medicine — a comprehensive top-tier university outside Beijing/Shanghai.',
      },
      {
        q: 'Are there English-taught programs at ZJU?',
        a: 'Yes — substantial at the master\'s level across engineering, sciences, and business. The ZJU-UoE joint institute is the standout English-taught undergraduate program.',
      },
      {
        q: 'How much does it cost to study at ZJU as an international student?',
        a: 'Typical all-in is ¥45,000–¥75,000/year for a bachelor\'s and ¥55,000–¥105,000 for a master\'s, excluding scholarships. Hangzhou is more affordable than Beijing or Shanghai.',
      },
      {
        q: 'Does ZJU have dormitory space for international students?',
        a: 'Yes — international students are typically assigned to on-campus dormitories; early application improves dormitory assignment.',
      },
      {
        q: 'How competitive is ZJU for international students?',
        a: 'Among the most competitive in China. Most admitted international students have strong academic records, language proficiency, and a focused study plan.',
      },
      {
        q: 'Does ZJU offer scholarships for international students?',
        a: 'Yes — ZJU\'s own scholarships, CSC, the Zhejiang Provincial Government scholarship, and the ZJU-UoE Institute specific scholarships are the main options.',
      },
      {
        q: 'Where is the ZJU campus?',
        a: 'ZJU has multiple campuses in Hangzhou. Zijingang is the main campus; Yuquan is historic; Xihu is engineering research; Zhijiang is the medical campus.',
      },
    ],
    howToSteps: [
      {
        name: 'Check program-specific CSCA requirements',
        text: 'Visit the ZJU International Students Office portal; find your target program; note the CSCA subject combination, language requirements, and any program-specific tests.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September intake, target the earliest viable CSCA session. ZJU\'s competitive programs have January–March deadlines.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts, study plan (500–1,500 words), 2 recommendation letters, language evidence, application fee.',
      },
      {
        name: 'Apply online through the ZJU portal',
        text: 'Submit the full package before the program deadline. Save the confirmation email.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs may request an online interview. Prepare for academic questions, Chinese-language questions if relevant.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit CSC through the ZJU international office; apply for ZJU\'s own scholarships and the Zhejiang Provincial Government scholarship.',
      },
    ],
    ctaTitle: 'Applying to Zhejiang University?',
    ctaSubtitle:
      'SICA counselors review your target program\'s CSCA requirements, refine your study plan, and coordinate scholarship applications. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/fudan-university',
        label: 'Fudan University',
        description: 'Shanghai\'s flagship comprehensive university.',
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
        description: 'How ZJU compares to other top Chinese universities.',
      },
    ],
  },
  zh: {
    slug: 'zhejiang-university',
    eyebrow: '大学简介',
    title: '浙江大学——杭州旗舰综合大学、院系与留学生申请',
    description:
      '浙江大学（ZJU, 浙大）——杭州旗舰综合性研究型大学。历史、特色专业（工科、理科、医学、商科）、英语授课选项、CSCA 组合、奖学金、费用与实务指引。',
    subtitle:
      '浙江大学是中国最古老、最严格的大学之一，位于杭州——阿里巴巴的故乡与新兴科技中心。在工科、CS、基础科学、医学方面有强势，硕博层面有大量国际生与英语授课项目。对考虑北京或上海之外综合性大学的国际申请者而言，浙大是首选。',
    stats: [
      { value: '1897', label: '求是书院创立' },
      { value: '多个', label: '含医学院的院系' },
      { value: '多个', label: '英语授课硕博' },
      { value: '杭州', label: '紫金港主校区' },
    ],
    quickAnswer:
      '浙江大学是中国最古老的综合性大学之一，1897 年创立，位于杭州。国际申请者通过 CSCA（2026 起必考）+ 学习计划申请。工科通常要求理工中文 + 数学 + 物理；医学要求数学 + 化学。学费本科约 ¥30,000–60,000/年；除 CSC 外浙大有自有奖学金。',
    keyTakeaways: [
      '1897 年创立（前身求是书院），1998 年由四所大学合并形成现代浙大',
      '强项：工科（机械、电气、材料、计算机）、基础科学、医学、商科',
      '杭州位置——阿里巴巴故乡；科技中心；生活成本低于北京或上海',
      '英语授课硕士项目几乎覆盖全部学科；本科英语项目在增长',
      'CSCA 组合：工科为理工中文 + 数学 + 物理；医学为数学 + 化学',
      '奖学金：CSC + 浙大自有 + 浙江省政府',
    ],
    sections: [
      {
        id: 'overview',
        h2: '浙大概览',
        intro: '用一段话说明这所大学是什么样的。',
        blocks: [
          {
            type: 'p',
            text: '浙江大学是中国最古老、最严格的综合性大学之一，在工科、计算机、基础科学、医学方面有传统。1998 年四所大学合并成现代浙大，既保留了 100 年以上的传承，又拥有了现代综合性研究大学的广度。对考虑杭州工科、CS、理科或医学的国际申请者而言，浙大是首选。',
          },
        ],
      },
      {
        id: 'history',
        h2: '历史——从求是书院到杭州旗舰',
        intro: '浙大如何成为今天的旗舰。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**1897 年**——杭州创立求是书院；中国最早的现代大学之一',
              '**1928 年**——更名为国立浙江大学',
              '**1930–40 年代**——在竺可桢校长等领导下对中国学术发展做出重大贡献',
              '**1952 年**——院系调整，吸纳和失去院系；经历长时期重建',
              '**1998 年**——四所大学合并（浙大、杭州大学、浙江农业大学、浙江医科大学）成现代浙大；成为综合性旗舰',
              '**今天**——多个院系含人文、理科、工科、医学；约 7 万学生含约 9,000 国际学生；中国顶尖大学之一',
            ],
          },
          {
              type: 'callout',
              tone: 'info',
              text: '浙大所在的杭州越来越吸引科技领域国际学生：阿里巴巴、蚂蚁集团、网易等总部都在杭州，为实习与毕业后就业提供机会。',
            },
        ],
      },
      {
        id: 'academics',
        h2: '学术——院系与特色项目',
        intro: '浙大强势在哪里，申什么。',
        blocks: [
          {
            type: 'table',
            caption: '浙大院系与特色项目示例',
            columns: ['院系', '特色项目示例', '英语授课'],
            rows: [
              ['工学部', '机械工程、能源工程、材料科学', '硕士英文可选'],
              ['计算机科学与技术学院', '计算机科学、软件工程、AI', '硕士英文可选'],
              ['电气工程学院', '电气工程、自动化、信息工程', '硕士英文可选'],
              ['数学科学学院', '数学、应用数学、统计', '硕士英文可选'],
              ['物理学院', '物理、光学、凝聚态', '硕士英文可选'],
              ['化学与化工学院', '化学、化学工程', '硕士英文可选'],
              ['生命科学学院', '生物科学、生物技术、生态', '硕士英文可选'],
              ['医学院（前浙江医科大学）', '临床医学、公共卫生、药学、护理', '部分硕士英文'],
              ['管理学院', '工商管理、营销、会计', '部分硕士英文'],
              ['经济学院', '经济、金融、国际经济', '部分硕士英文'],
              ['公共管理学院', '公共管理、国际关系', '部分硕士英文'],
              ['浙江大学-爱丁堡大学联合学院（ZJU-UoE）', '生物医学、公共卫生（双学位）', '全英文授课'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**本科英语授课项目**——ZJU-UoE 联合学院是突出的英语本科项目；部分工科与商科项目有英语轨道',
              '**硕士英文授课**——工科、CS、理科、医学、商科范围广',
              '**ZJU-UoE 学院**——与爱丁堡大学的联合项目；全英文授课',
              '**博士英文授课**——多数博士项目可英文完成（需中文共同导师）',
              '**强势权衡**——工科、CS、基础科学、医学；北京/上海之外的综合性选项',
            ],
          },
        ],
      },
      {
        id: 'admissions',
        h2: '国际生录取',
        intro: '浙大实际要求什么。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**查项目具体科目要求**——浙大每个项目都指定 CSCA 科目组合；工科通常要求理工中文 + 数学 + 物理',
              '**早点考 CSCA**——9 月入学最早考一次；浙大竞争项目 1-3 月截止',
              '**备齐申请材料**——护照、成绩单、学习计划、2 封推荐信、语言证明',
              '**网上申请**——通过浙大留学生办公室门户；付申请费',
              '**项目截止前提交**——多数秋季入学项目 3-5 月截止',
              '**面试（按项目）**——有竞争力的硕博项目可能要求视频面试',
            ],
          },
            {
              type: 'table',
              caption: '浙大常见 CSCA 组合（逐项目核验）',
              columns: ['项目族', '常见 CSCA 组合', '说明'],
              rows: [
                ['计算机 / AI / 软件工程', '理工中文 + 数学 + 物理', '量化筛选'],
                ['机械 / 电气 / 能源工程', '理工中文 + 数学 + 物理', '工程基础'],
                ['材料科学 / 化学工程', '理工中文 + 数学 + 化学', '部分加物理'],
                ['数学 / 物理', '理工中文 + 数学 + 物理', '逐项目核验'],
                ['生命科学 / 生物技术', '数学 + 化学', '部分也要求物理'],
                ['临床医学 / 公共卫生 / 药学', '数学 + 化学', 'MBBS 6 年制；具体核验'],
                ['商科 / 管理 / 经济', '数学（有时加理工中文）', '部分硕士英文'],
                ['ZJU-UoE 联合学院', '数学 + 化学', '全英文授课'],
              ],
            },
            {
              type: 'callout',
            tone: 'info',
            text: '始终查项目的官方录取页确认当年组合。浙大留学生办以英文回复书面问询，一般几个工作日内。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金与资助',
        intro: '如何为浙大学位筹款。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助（学费、住宿、月津贴、机票）；通过浙大留学生办作为接收单位申请',
              '**浙大自有奖学金**——学费减免与优秀奖；校方管理；查留学生办当年公告',
              '**浙江省政府奖学金**——在浙江学习的国际生；学费减免 + 月津贴',
              '**ZJU-UoE 联合学院奖学金**——爱丁堡联合项目部分资助',
              '**外部奖学金**——本国政府奖学金、基金会奖学金、浙大相关私立奖学金',
              '**CSC 申请者必须提交 CSCA 成绩**——1-4 月截止挤压适用',
            ],
          },
        ],
      },
      {
        id: 'cost',
        h2: '留学费用',
        intro: '在浙大一年的花销。',
        blocks: [
          {
            type: 'table',
            caption: '留学费用（规划近似值）',
            columns: ['项目', '本科', '硕士', '说明'],
              rows: [
                ['学费', '¥30,000–60,000/年', '¥35,000–80,000/年', '部分项目更贵'],
                ['宿舍', '¥1,200–3,000/年', '¥1,500–4,000/年', '校内宿舍'],
                ['生活费', '¥1,200–2,500/月', '¥1,200–2,500/月', '杭州比北京/上海便宜'],
                ['医保', '¥800/年', '¥800/年', '强制基础方案'],
                ['年度合计（典型）', '约 ¥45,000–75,000', '约 ¥55,000–105,000', '不含奖学金'],
              ],
            },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 覆盖学费、住宿、月津贴与机票。浙大自有奖学金从学费减免到大额套餐不等；浙江省政府奖学金是浙江特有的选项。杭州较低的生活成本是隐性优势。',
          },
        ],
      },
      {
        id: 'life',
        h2: '学生生活——杭州、校园、国际社群',
        intro: '在浙大生活与学习是什么感觉。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**紫金港校区**——杭州西南部的主校区；较新、教学/科研/住宿一体、绿地设计',
              '**其他校区**——玉泉（历史、较小）、西溪（工程研究）、紫金港（医学）；各有特定功能',
              '**杭州城**——阿里巴巴、蚂蚁集团、网易的故乡；西湖景观；生活成本低于北京/上海',
              '**国际学生服务**——专职办公室、迎新项目、语言支持、导师计划',
              '**餐饮**——多个食堂提供清真、素食、国际窗口；杭帮菜是中国八大菜系之一',
              '**科技产业联系**——杭州在科技职业方面越来越重要；浙大学生直接受益',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '浙大在世界排名里怎么样？',
        a: '是——浙大长期位列 QS、THE、ARWU 全球前 100，是工科与科学指标领先的中国大学之一。',
      },
      {
        q: '浙大要求哪些 CSCA 科目？',
        a: '按项目而定。工科通常要求理工中文 + 数学 + 物理；医学项目要求数学 + 化学。始终查项目官方页面。',
      },
      {
        q: '什么是 ZJU-UoE 联合学院？',
        a: '与爱丁堡大学的联合学院，主要在生物医学与公共卫生。全英文授课；浙大国际化的标志性项目之一。',
      },
      {
        q: '浙大以什么出名？',
        a: '工科（机械、电气、材料）、计算机、基础科学、医学——北京/上海之外的综合性顶级大学。',
      },
      {
        q: '浙大有英语授课项目吗？',
        a: '有——硕士层面广泛，工科、理科、商科都有。ZJU-UoE 联合学院是突出的英语本科项目。',
      },
      {
        q: '在浙大读一年多少钱？',
        a: '本科通常 ¥45,000–75,000/年，硕士 ¥55,000–105,000/年，不含奖学金。杭州比北京/上海便宜。',
      },
      {
        q: '浙大给国际生提供宿舍吗？',
        a: '是——通常分配校内宿舍；早申有助于拿到好分配。',
      },
      {
        q: '浙大录取国际生竞争多大？',
        a: '中国最严格之一。多数录取者学业成绩优秀、语言过关、学习计划聚焦。',
      },
      {
        q: '浙大给国际生提供奖学金吗？',
        a: '是——浙大自有奖学金、CSC、浙江省政府奖学金、ZJU-UoE 联合学院特定奖学金是主要选项。',
      },
      {
        q: '浙大校园在哪？',
        a: '浙大在杭州有多个校区。紫金港是主校区；玉泉是历史校区；西溪是工程研究；紫金港是医学院。',
      },
    ],
    howToSteps: [
      {
        name: '查项目具体的 CSCA 要求',
        text: '浏览浙大留学生办门户，找到目标项目，记录 CSCA 科目组合、语言要求与项目特有考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学锁定最早可行场次。浙大竞争项目 1-3 月截止。',
      },
      {
        name: '备齐申请材料',
        text: '护照、成绩单、学习计划（500-1,500 字）、2 封学术推荐信、语言证明、申请费。',
      },
      {
        name: '通过浙大门户网上申请',
        text: '项目截止前提交完整材料。保存确认邮件。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '有竞争力的硕博项目可能要求视频面试。准备学术问题、中文语言问题（如适用）。',
      },
      {
        name: '并行申请奖学金',
        text: '通过浙大留学生办提交 CSC 申请；符合条件时申请浙大与浙江省政府奖学金。',
      },
    ],
    ctaTitle: '正在申请浙江大学？',
    ctaSubtitle:
      'SICA 顾问核对目标项目的 CSCA 要求、优化你的学习计划、并协调各项奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/fudan-university',
        label: '复旦大学',
        description: '上海旗舰综合性大学。',
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
        description: '浙大与中国其他顶级大学的对比。',
      },
    ],
  },
};
