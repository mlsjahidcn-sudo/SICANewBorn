import type { LocalizedGuide } from './types';

/**
 * "Scholarships to study in China" — long-form guide.
 * Target queries: "scholarships to study in china", "fully funded
 * scholarships china", "CSC scholarship", "chinese government
 * scholarship", "university scholarships china".
 */
export const scholarshipsGuide: LocalizedGuide = {
  en: {
    slug: 'scholarships',
    eyebrow: 'GUIDE · FUNDING',
    title: 'Scholarships to Study in China: The Complete 2026 Guide',
    description:
      'How to fund your China degree: Chinese Government Scholarship (CSC), Confucius Institute, university-specific awards, provincial scholarships, and how to apply for each.',
    subtitle:
      'China is the only major study-abroad destination where full-ride scholarships are still common. Here is how to get one.',
    stats: [
      { value: '11,000+', label: 'CSC scholarships awarded' },
      { value: '¥2,500-3,500', label: 'Monthly stipend' },
      { value: '170+', label: 'Eligible countries' },
      { value: '50+', label: 'University scholarship programs' },
    ],
    quickAnswer:
      'There are five main scholarship categories for international students in China: the Chinese Government Scholarship (CSC, ~11,000 awards per year, fully funded), the Confucius Institute Scholarship (for Chinese language and culture), university-specific scholarships (Tsinghua, Peking, Fudan, etc., typically 20-100% of tuition), provincial scholarships (Beijing, Shanghai, etc., up to ¥50,000/year), and private/corporate awards. Most applications open January and close in April for September intake. CSC and university awards are separate applications — you must apply to both, and you can only hold one at a time. Required documents for most: transcripts, personal statement, recommendation letters, language scores (IELTS/TOEFL or HSK), and a study plan.',
    keyTakeaways: [
      'CSC is the most generous — full tuition, dorm, ¥2,500-3,500/month stipend',
      'Application window: January-April for September intake',
      'You can apply for CSC and university scholarships in parallel, but hold only one',
      'Most Chinese universities have their own 20-100% tuition scholarships',
      'Provincial government scholarships (Beijing, Shanghai) are underrated and easy to win',
      'HSK 4-5 required for Chinese-taught programs; IELTS/TOEFL for English programs',
    ],
    sections: [
      {
        id: 'csc-scholarship',
        h2: 'Chinese Government Scholarship (CSC) — the flagship',
        intro:
          'The CSC is the most generous government scholarship for international students worldwide. It is also one of the largest, with 11,000+ awards each year. If you qualify, apply first — everything else is supplemental.',
        blocks: [
          {
            type: 'h3',
            text: 'What CSC covers',
            body:
              'Full tuition for the entire program duration. On-campus dormitory (or housing subsidy of ¥700-1,500/month if you live off-campus). Comprehensive medical insurance (~¥800/year). Monthly stipend: ¥2,500 for bachelor\'s, ¥3,000 for master\'s, ¥3,500 for PhD. Settlement allowance: ¥1,500 one-time upon arrival. Airfare: round-trip economy from your home country (most sub-programs).',
          },
          {
            type: 'h3',
            text: 'CSC sub-programs (pick the right one)',
            body:
              'Bilateral Program: assigned by your home country\'s scholarship agency (e.g., Fulbright in the US, CSC Australia, etc.). Apply through your local agency first, they nominate you. University Program: you apply directly to a Chinese university through the CSC portal. The university nominates you. Belt & Road Scholarship: for students from 150+ BRI partner countries (most of Africa, Central/Southeast Asia, Latin America, Eastern Europe). Apply via studyinchina.edu.cn. Great Wall Program: for UN agency-sponsored students only. EU Program: specific to EU member states.',
          },
          {
            type: 'h3',
            text: 'CSC eligibility',
            body:
              'Non-Chinese citizen in good health. High school diploma for bachelor\'s, bachelor\'s for master\'s, master\'s for PhD. Age limits: under 25 for bachelor\'s, 35 for master\'s, 40 for PhD (some flexibility). Language requirements depend on the program: HSK 4-5 for Chinese-taught, IELTS 6.0+ or TOEFL 80+ for English-taught. Academic record: usually 3.0+ GPA for top schools.',
          },
          {
            type: 'h3',
            text: 'How to apply for CSC',
            body:
              'Step 1: Get pre-admission from a Chinese university (apply separately through the university\'s system). Step 2: Submit the CSC application via studyinchina.edu.cn or your home country\'s CSC agency. Step 3: Required documents: CSC Application Form, pre-admission letter, transcripts, language scores, personal statement, 2 recommendation letters, study plan, passport, physical examination form. Step 4: Submit before the deadline (typically April 15 for September intake). Step 5: Wait 2-3 months for the result.',
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Apply for CSC first, then apply to universities and other scholarships in parallel. You can hold CSC plus a partial university award, but you cannot hold two full scholarships at the same time.',
          },
        ],
      },
      {
        id: 'university-scholarships',
        h2: 'University-specific scholarships',
        intro:
          'Every major Chinese university offers its own scholarship, ranging from 20% to 100% of tuition. These are often easier to win than CSC because the pool is smaller.',
        blocks: [
          {
            type: 'table',
            caption: 'Notable university scholarships (2026)',
            columns: ['University', 'Scholarship name', 'Coverage', 'How to apply'],
            rows: [
              ['Tsinghua', 'Schwarzman Scholars', 'Full funding, 1-year master\'s in global affairs at Tsinghua', 'Apply directly to Schwarzman program (separate from regular Tsinghua master\'s)'],
              ['Tsinghua', 'Tsinghua University Scholarship', '20-100% of tuition', 'Auto-considered when you apply to any Tsinghua program'],
              ['Peking University', 'PKU International Student Scholarship', '20-100% of tuition, ¥2,000-3,000/month stipend', 'Auto-considered; you submit a separate short essay'],
              ['Fudan University', 'Fudan International Students Scholarship', '20-100% of tuition, partial stipend', 'Auto-considered; priority for academic merit'],
              ['Zhejiang University', 'Future Star Scholarship', '100% of tuition + ¥2,000/month stipend', 'Apply during program application'],
              ['Shanghai Jiao Tong', 'SJTU International Scholarship', '30-100% of tuition', 'Auto-considered; merit-based'],
              ['USTC (Hefei)', 'CAS-TWAS President\'s Fellowship', 'Full funding, PhD only, ¥8,000/month', 'Apply through TWAS for developing-country students'],
              ['Wuhan University', 'WHU International Student Scholarship', '20-100% of tuition', 'Auto-considered'],
              ['Beijing Normal University', 'BNU New Era Scholarship', 'Full funding for master\'s in education', 'Separate application'],
              ['Nanjing University', 'NJU International Student Scholarship', '20-100% of tuition', 'Auto-considered'],
            ],
          },
          {
            type: 'h3',
            text: 'How university scholarships work',
            body:
              'Most are auto-considered: when you apply for admission, the university evaluates you for merit-based awards at the same time. Some require an extra essay (500-1,000 words on your goals, why this university, how you\'ll contribute). A few — Schwarzman, CAS-TWAS — have separate applications with their own deadlines (usually December-January for the following September).',
          },
        ],
      },
      {
        id: 'provincial-scholarships',
        h2: 'Provincial and city government scholarships',
        intro:
          'These are the most underrated scholarships in China. Awarded by local governments to attract international talent, they have smaller applicant pools than CSC and are easier to win.',
        blocks: [
          {
            type: 'h3',
            text: 'Beijing Government Scholarship',
            body:
              'Up to ¥40,000/year. For international students at any Beijing university (Tsinghua, Peking, BNU, Renmin, etc.). Application: through the host university\'s international office. Deadline: usually May. Awards are renewable annually.',
          },
          {
            type: 'h3',
            text: 'Shanghai Government Scholarship',
            body:
              'Up to ¥50,000/year (Type A: full program funding; Type B: partial; Type C: one-time). For international students at Shanghai universities (Fudan, Shanghai Jiao Tong, Tongji, East China Normal, etc.). Apply through the host university.',
          },
          {
            type: 'h3',
            text: 'Other provinces and cities',
            body:
              'Jiangsu Government Scholarship (¥30,000-50,000/year for students in Nanjing, Suzhou, etc.). Zhejiang Provincial Scholarship (¥30,000/year for Hangzhou universities). Wuhan municipal scholarship (¥20,000-30,000/year). Guangdong (Canton) scholarship (¥30,000-50,000/year, plus 1,000+ awards/year for BRI students). Sichuan, Yunnan, Liaoning, and most other provinces have similar programs.',
          },
        ],
      },
      {
        id: 'confucius-scholarship',
        h2: 'Confucius Institute Scholarship',
        intro:
          'For students of Chinese language, culture, and education. Funded by the Confucius Institute Headquarters (Hanban) and administered locally.',
        blocks: [
          {
            type: 'h3',
            text: 'What it covers',
            body:
              'Full tuition for 1-semester or 1-year Chinese language + culture programs. On-campus dorm. Monthly stipend of ¥2,500. Comprehensive medical insurance. Eligibility: non-Chinese citizen, age 16-35, HSK 3+ (or 2+ for 1-semester programs). Some programs require an in-person interview at your local Confucius Institute.',
          },
          {
            type: 'h3',
            text: 'What you can study',
            body:
              'Chinese language (HSK 1-6 preparation). Chinese culture and history. Chinese traditional arts (calligraphy, painting, music). Teaching Chinese as a foreign language (TCSOL) — the most popular program, designed for future Chinese teachers. International Chinese education master\'s degree (2-3 years, full funding).',
          },
          {
            type: 'h3',
            text: 'How to apply',
            body:
              'Contact your local Confucius Institute (most countries have at least one). Submit the application via the Confucius Institute Scholarship portal (cis.chinese.cn). Required: transcripts, HSK score, study plan, recommendation letter, passport. Application window: usually March-June for September intake.',
          },
        ],
      },
      {
        id: 'private-corporate',
        h2: 'Private and corporate scholarships',
        intro:
          'Foundations and companies fund targeted scholarships, usually tied to specific fields or regions.',
        blocks: [
          {
            type: 'h3',
            text: 'World Bank Scholarship',
            body:
              'For students from developing countries. Covers tuition + stipend for master\'s programs in development-related fields at partner universities (Peking, Fudan, etc.). Apply through your World Bank country office.',
          },
          {
            type: 'h3',
            text: 'ADB-Japan Scholarship',
            body:
              'Asian Development Bank + Japan Government. For citizens of ADB member countries. Covers master\'s in economics, business, science, technology at Asian universities including Peking U, Tsinghua.',
          },
          {
            type: 'h3',
            text: 'Corporate scholarships',
            body:
              'Huawei Seeds for the Future (tech + leadership, covers 2-week program in China). Alibaba Global Leadership Program (for African students). Sinopec STAR Program (energy). Most are short programs (1-8 weeks) but provide excellent exposure and networking.',
          },
        ],
      },
      {
        id: 'application-strategy',
        h2: 'How to maximize your chances: a 5-step strategy',
        intro:
          'Don\'t apply to just one. Treat scholarship applications as a portfolio — even one win can save $20,000+ over a 4-year program.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Step 1: Get a strong base.** Language scores (HSK 4-5 or IELTS 6.5+), GPA 3.5+, compelling personal statement. These are the foundation for every scholarship.',
              '**Step 2: Apply to 3-5 universities.** Match programs to your field. Each university auto-considers you for its own scholarship — 3-5 applications = 3-5 shots at merit awards.',
              '**Step 3: Apply for CSC in parallel.** Through studyinchina.edu.cn or your home country\'s agency. Deadline: April 15. Most students who get CSC also have a university offer.',
              '**Step 4: Add provincial scholarships.** Beijing, Shanghai, Wuhan, and other city awards are smaller but stackable. Apply to 2-3 provinces where your target university is located.',
              '**Step 5: Stack smaller awards.** Confucius Institute Scholarship, corporate awards, and private scholarships. They often have non-conflicting rules and can supplement CSC.',
            ],
          },
          {
            type: 'h3',
            text: 'A real-world portfolio example',
            body:
              'A Pakistani student applying to a master\'s in environmental science at Tsinghua: CSC bilateral program (full funding), Tsinghua University Scholarship (likely 50-100% tuition), Beijing Government Scholarship (¥40,000/year), and the Chinese Government Scholarship-BRI sub-program. Total potential: full funding + stipend + extra awards. The most common outcome: 2-3 of these 4 applications succeed, totaling $30,000-50,000/year in funding.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How do I get a full scholarship to study in China?',
        a: 'The Chinese Government Scholarship (CSC) is the most common path to a full ride. Apply via studyinchina.edu.cn (or your home country\'s CSC agency) by April 15 for the September intake. CSC covers tuition, dorm, ¥2,500-3,500/month stipend, and health insurance. You also need a pre-admission letter from a Chinese university — apply to the university first, then submit the CSC application with the pre-admission attached. About 11,000 CSC scholarships are awarded each year to students from 170+ countries.',
      },
      {
        q: 'What is the CSC scholarship?',
        a: 'The Chinese Government Scholarship (CSC) is a fully-funded scholarship run by the China Scholarship Council. It covers tuition, on-campus dormitory, health insurance, and a monthly stipend (¥2,500 bachelor\'s, ¥3,000 master\'s, ¥3,500 PhD). There are five sub-programs: Bilateral (through your home government), University Program (through a Chinese university), Belt & Road Scholarship (for BRI countries), Great Wall Program (UN-affiliated), and EU Program. Apply via studyinchina.edu.cn by April 15 for September intake.',
      },
      {
        q: 'Can I get a scholarship for a master\'s in China?',
        a: 'Yes — most scholarships fund master\'s programs. CSC covers ~5,000 master\'s scholarships per year. University-specific awards at Tsinghua, Peking, Fudan, and others cover 20-100% of master\'s tuition. Provincial scholarships (Beijing, Shanghai) cover up to ¥50,000/year. Corporate and foundation scholarships (World Bank, ADB-Japan) target specific regions. For a full ride, combine CSC with a university offer; for partial funding, the university scholarship alone is often enough.',
      },
      {
        q: 'How much is the CSC monthly stipend?',
        a: 'The CSC monthly stipend is ¥2,500 for bachelor\'s students, ¥3,000 for master\'s students, and ¥3,500 for PhD students. The stipend is paid for the duration of the program (typically 4 years for a bachelor\'s, 2-3 years for a master\'s, 3-5 years for a PhD). It is paid monthly, in addition to full tuition coverage, dorm, and health insurance.',
      },
      {
        q: 'What GPA do I need for a Chinese university scholarship?',
        a: 'Most merit-based scholarships at Chinese universities require a minimum 3.0/4.0 GPA (75%+). Top scholarships (Schwarzman, CAS-TWAS, full CSC awards) typically want 3.5+ or equivalent (85%+). Some universities are flexible if you compensate with strong language scores, research experience, or a compelling personal statement. Master\'s and PhD scholarships are more competitive than bachelor\'s.',
      },
      {
        q: 'Can I get a scholarship without IELTS or TOEFL?',
        a: 'For Chinese-taught programs, you need HSK 4-5 instead of IELTS/TOEFL. For English-taught programs, most scholarships require the same language proof as the program itself. A few conditional scholarship pathways exist: 1-year Chinese language preparatory program on scholarship (covers tuition + stipend), then enter the degree program once you reach the required HSK level. This is the most common path for students who don\'t have IELTS/TOEFL or HSK at the start.',
      },
      {
        q: 'When should I apply for Chinese scholarships?',
        a: 'Most Chinese scholarship deadlines fall between January and April for the September intake. CSC deadline is April 15. University scholarships often have the same deadline as the program application (May for most, March for top-10 schools). Provincial scholarships are usually May-June. Confucius Institute Scholarship: March-June. The most important date is April 15 — start preparing documents in November of the previous year.',
      },
      {
        q: 'Are Chinese scholarships fully funded?',
        a: 'Some are. CSC and a few top university awards (Schwarzman, CAS-TWAS) are fully funded: tuition, dorm, stipend, insurance, sometimes airfare. Most university scholarships are partial: 20-100% of tuition, no stipend. Provincial scholarships are partial: ¥20,000-50,000/year. For a fully funded experience, apply for CSC or one of the top scholarship programs, then layer partial university and provincial awards to cover the gap.',
      },
    ],
    howToSteps: [
      {
        name: 'Strengthen your base',
        text:
          'Get a 6.5+ IELTS or HSK 5+ score. Aim for 3.5+ GPA. Write a strong personal statement and get 2-3 solid recommendation letters.',
      },
      {
        name: 'Shortlist 3-5 universities and programs',
        text:
          'Match your field, budget, and language preference. Use the SICA directory to filter by ranking, language, and city.',
      },
      {
        name: 'Apply to the universities',
        text:
          'Submit applications through each university\'s portal. Most will auto-consider you for their internal scholarship.',
      },
      {
        name: 'Apply for CSC (most important)',
        text:
          'Submit via studyinchina.edu.cn (or your home country\'s CSC agency) by April 15. Attach pre-admission letter from a Chinese university.',
      },
      {
        name: 'Layer provincial and corporate scholarships',
        text:
          'Apply to Beijing/Shanghai/your target city\'s government scholarship, plus any relevant corporate or foundation awards.',
      },
      {
        name: 'Wait for results (May-July)',
        text:
          'Universities issue admission + scholarship notices from May. CSC results come in June-July. Provincial awards: July-August.',
      },
      {
        name: 'Accept the best combination',
        text:
          'You can only hold one full scholarship at a time. If CSC accepts you, you usually defer or decline smaller awards. If CSC rejects you, take the best university + provincial combination.',
      },
      {
        name: 'Use the funding for visa + arrival',
        text:
          'CSC funds arrive after enrollment. Make sure you have ~$2,000 for visa fees, flights, and initial settling-in costs.',
      },
    ],
    ctaTitle: 'Find the right scholarship for you',
    ctaSubtitle:
      'SICA\'s free assessment checks your profile against CSC, university, and provincial scholarships — and tells you which ones to apply for.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/study-in-china',
        label: 'Why study in China',
        description: 'Top universities, costs, scholarships, student life, career outcomes.',
      },
      {
        href: '/guides/application',
        label: 'How to apply',
        description: 'Step-by-step application guide, documents, and timeline.',
      },
      {
        href: '/scholarships',
        label: 'Browse all scholarships',
        description: '50+ Chinese Government, university, and provincial scholarship programs.',
      },
    ],
  },

  zh: {
    slug: 'scholarships',
    eyebrow: '指南 · 奖学金',
    title: '中国留学奖学金完整指南（2026）',
    description:
      '中国留学资金攻略：CSC、孔子学院、院校奖、省市政府奖，每种的申请方法。',
    subtitle: '中国是少数仍能轻松拿全奖的留学目的地。下面告诉你怎么拿到。',
    stats: [
      { value: '11,000+', label: 'CSC每年名额' },
      { value: '¥2,500-3,500', label: '每月补贴' },
      { value: '170+', label: '覆盖国家' },
      { value: '50+', label: '院校奖学金' },
    ],
    quickAnswer:
      '国际学生来华奖学金分五大类：中国政府奖学金（CSC，每年11,000+全奖名额）、孔子学院奖学金（中文与文化专业）、院校自设奖学金（清华、北大、复旦等，减免20-100%学费）、省市政府奖学金（北京、上海等，最高¥50,000/年）、私人和企业奖学金。多数申请1月开放，4月截止，9月入学。CSC和院校奖是独立申请——必须分别提交，但同时只能持有一个全奖。多数项目所需材料：成绩单、个人陈述、推荐信、语言成绩（雅思/托福或HSK）、学习计划。',
    keyTakeaways: [
      'CSC最丰厚——全学费+宿舍+¥2,500-3,500/月补贴',
      '申请窗口：1-4月，9月入学',
      'CSC和院校奖可平行申请，但只能同时持有一个',
      '大多数中国大学有自己的20-100%学费奖学金',
      '省市政府奖（北京、上海）被低估，相对容易拿',
      '中文项目需HSK 4-5；英文项目需雅思/托福',
    ],
    sections: [
      {
        id: 'csc-scholarship',
        h2: '中国政府奖学金（CSC）——旗舰',
        intro: 'CSC是国际生最丰厚、规模最大的政府奖学金（每年11,000+）。有资格就优先申请。',
        blocks: [
          {
            type: 'h3',
            text: 'CSC覆盖内容',
            body:
              '全部学费（覆盖项目全程）。校内宿舍（或¥700-1,500/月住房补贴）。综合医保（~¥800/年）。每月补贴：本科¥2,500、硕士¥3,000、博士¥3,500。安置费：一次性¥1,500。机票：往返经济舱（多数子项目）。',
          },
          {
            type: 'h3',
            text: 'CSC子项目（选对的那个）',
            body:
              '双边项目：由本国奖学金机构分配（如美国的Fulbright、澳大利亚CSC等）。先向本国机构申请，他们提名你。院校项目：通过studyinchina.edu.cn直接向中国大学申请，由学校提名。一带一路奖学金：面向150+个一带一路合作国家（多数非洲、中亚、东南亚、拉美、东欧）。通过studyinchina.edu.cn申请。长城项目：仅限联合国机构推荐的学生。欧盟项目：仅限欧盟成员国。',
          },
          {
            type: 'h3',
            text: 'CSC申请条件',
            body:
              '非中国籍，身体健康。高中/本科/硕士学位（视项目）。年龄限制：本科25岁以下、硕士35岁以下、博士40岁以下（可适度灵活）。语言根据项目定：中文授课HSK 4-5；英文授课雅思6.0+或托福80+。学业：顶尖学校一般GPA 3.0+。',
          },
          {
            type: 'h3',
            text: 'CSC申请流程',
            body:
              '第一步：拿到中国大学的预录取（单独通过学校系统申请）。第二步：通过studyinchina.edu.cn或本国CSC机构提交CSC申请。第三步：所需材料——CSC申请表、预录取、成绩单、语言成绩、个人陈述、2封推荐信、学习计划、护照、体检表。第四步：截止日前提交（9月入学一般4月15日）。第五步：等2-3个月出结果。',
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC先申，然后平行申请院校和其他奖。CSC可叠加部分院校奖，但不可同时持两个全奖。',
          },
        ],
      },
      {
        id: 'university-scholarships',
        h2: '院校自设奖学金',
        intro: '每所重点中国大学都有自己的奖学金，减免20-100%学费。因为竞争池小，比CSC更容易拿。',
        blocks: [
          {
            type: 'table',
            caption: '代表性院校奖学金（2026）',
            columns: ['大学', '奖学金名称', '覆盖', '怎么申请'],
            rows: [
              ['清华', '苏世民学者', '全奖，1年制全球事务硕士', '单独向苏世民项目申请（与常规清华硕士分开）'],
              ['清华', '清华大学奖学金', '学费20-100%', '申请任何清华项目时自动考虑'],
              ['北大', '北大国际学生奖学金', '学费20-100%，¥2,000-3,000/月补贴', '自动考虑；需提交额外短文'],
              ['复旦', '复旦国际学生奖学金', '学费20-100%，部分补贴', '自动考虑；学术优先'],
              ['浙大', '未来之星奖学金', '全额学费+¥2,000/月补贴', '在项目申请时同步申请'],
              ['上海交大', 'SJTU国际奖学金', '学费30-100%', '自动考虑；基于学术'],
              ['中科大', 'CAS-TWAS校长奖学金', '全奖，仅限博士，¥8,000/月', '通过TWAS面向发展中国家学生'],
              ['武大', '武大国际学生奖学金', '学费20-100%', '自动考虑'],
              ['北师大', 'BNU新时代奖学金', '教育学硕士全奖', '单独申请'],
              ['南大', 'NJU国际学生奖学金', '学费20-100%', '自动考虑'],
            ],
          },
          {
            type: 'h3',
            text: '院校奖学金怎么运作',
            body:
              '多数自动考虑：你申请入学时，学校同时评估你的奖学金资格。部分需额外短文（500-1,000字，主题：你的目标、为何选该校、你将如何贡献）。少数（苏世民、CAS-TWAS）有独立申请和独立截止（一般为12-1月，申请次年9月）。',
          },
        ],
      },
      {
        id: 'provincial-scholarships',
        h2: '省市政府奖学金',
        intro: '这是中国最被低估的奖学金。由地方政府出资吸引国际人才，竞争池比CSC小得多。',
        blocks: [
          {
            type: 'h3',
            text: '北京市政府奖学金',
            body:
              '最高¥40,000/年。面向北京所有大学的国际生（清华、北大、北师大、人大等）。通过学校国际处申请。截止：5月。可逐年续。',
          },
          {
            type: 'h3',
            text: '上海市政府奖学金',
            body:
              '最高¥50,000/年（A类：全项目；B类：部分；C类：一次性）。面向上海所有大学（复旦、上海交大、同济、华东师大等）。通过学校申请。',
          },
          {
            type: 'h3',
            text: '其他省市',
            body:
              '江苏省政府奖学金（¥30,000-50,000/年，面向南京、苏州等）。浙江省政府奖学金（¥30,000/年，面向杭州）。武汉市政府奖（¥20,000-30,000/年）。广东省（¥30,000-50,000/年，一带一路学生1,000+名额）。四川、云南、辽宁等省都有类似项目。',
          },
        ],
      },
      {
        id: 'confucius-scholarship',
        h2: '孔子学院奖学金',
        intro: '面向中文、文化、教育专业学生。由孔子学院总部（汉办）出资，本地管理。',
        blocks: [
          {
            type: 'h3',
            text: '覆盖内容',
            body:
              '1学期或1年制中文+文化项目全额学费。校内宿舍。每月¥2,500补贴。综合医保。条件：非中国籍，16-35岁，HSK 3+（1学期项目HSK 2+）。部分项目需要在当地孔子学院面谈。',
          },
          {
            type: 'h3',
            text: '可学方向',
            body:
              '中文（HSK 1-6备考）。中国文化与历史。中国传统艺术（书法、国画、音乐）。对外汉语教学（TCSOL）——最热门，为未来中文教师设计。国际中文教育硕士（2-3年，全奖）。',
          },
          {
            type: 'h3',
            text: '申请方式',
            body:
              '联系当地孔子学院（多数国家至少有1所）。通过孔子学院奖学金门户（cis.chinese.cn）提交申请。所需：成绩单、HSK成绩、学习计划、推荐信、护照。窗口：3-6月，9月入学。',
          },
        ],
      },
      {
        id: 'private-corporate',
        h2: '私人与企业奖学金',
        intro: '基金会和企业资助定向奖学金，一般针对特定领域或地区。',
        blocks: [
          {
            type: 'h3',
            text: '世界银行奖学金',
            body:
              '面向发展中国家学生。覆盖合作大学（北大、复旦等）发展相关硕士项目的学费+补贴。通过本国世界银行办公室申请。',
          },
          {
            type: 'h3',
            text: '亚行-日本奖学金',
            body:
              '亚洲开发银行+日本政府。面向亚行成员国公民。覆盖亚洲大学（含北大、清华）的经济、商科、理工科硕士项目。',
          },
          {
            type: 'h3',
            text: '企业奖学金',
            body:
              '华为"未来种子"（科技+领导力，2周中国项目）。阿里巴巴全球领导力项目（面向非洲学生）。中石化STAR项目（能源）。多数为短期项目（1-8周），但提供优质曝光和人脉。',
          },
        ],
      },
      {
        id: 'application-strategy',
        h2: '如何最大化成功率：5步策略',
        intro: '别只申一个。把奖学金申请当投资组合——即使只中一个，4年下来也能省$20,000+。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**第一步：打好基础**。语言成绩（HSK 4-5或雅思6.5+），GPA 3.5+，有说服力的个人陈述，2-3封扎实推荐信。这是所有奖学金的根基。',
              '**第二步：申请3-5所大学**。匹配你的专业。每所大学自动评估你的内部奖学金——3-5个申请=3-5次获奖机会。',
              '**第三步：平行申CSC**。通过studyinchina.edu.cn或本国机构。4月15日截止。大部分CSC获得者同时也有大学录取。',
              '**第四步：加申省市政府奖**。北京、上海、目标城市政府奖金额较小但可叠加。申2-3个学校所在地的奖。',
              '**第五步：叠加小奖**。孔子学院、企业、私人奖学金。它们规则常不冲突，能补充CSC。',
            ],
          },
          {
            type: 'h3',
            text: '真实投资组合示例',
            body:
              '一位巴基斯坦学生申请清华环境科学硕士：CSC双边项目（全奖）、清华大学奖学金（可能50-100%学费）、北京市政府奖学金（¥40,000/年）、CSC一带一路子项目。潜在总额：全奖+补贴+额外奖励。最常见结果：4个申请中2-3个成功，每年$30,000-50,000资金。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '怎么拿到中国留学全奖？',
        a: 'CSC是最常见路径。通过studyinchina.edu.cn或本国CSC机构，9月入学的项目4月15日截止。CSC覆盖学费、宿舍、¥2,500-3,500/月补贴、医保。你还需要中国大学的预录取——先申学校，再带预录取提交CSC。',
      },
      {
        q: 'CSC奖学金是什么？',
        a: 'CSC是中国国家留学基金管理委管理的全额奖学金。覆盖学费、宿舍、医保，以及每月补贴（本科¥2,500、硕士¥3,000、博士¥3,500）。五个子项目：双边（通过本国政府）、院校（通过中国大学）、一带一路（BRI国家）、长城（联合国）、欧盟。通过studyinchina.edu.cn申请，4月15日截止，9月入学。',
      },
      {
        q: '硕士能拿中国奖学金吗？',
        a: '可以——多数奖学金资助硕士。CSC每年资助约5,000名硕士。清华、北大、复旦等院校奖覆盖20-100%硕士学费。省市政府奖（北京、上海）最高¥50,000/年。企业和基金会奖学金（世界银行、亚行-日本）针对特定地区。全奖靠CSC+大学offer组合；部分奖只院校奖就够。',
      },
      {
        q: 'CSC每月补贴多少？',
        a: 'CSC每月补贴：本科¥2,500、硕士¥3,000、博士¥3,500。按项目时长发放（一般本科4年、硕士2-3年、博士3-5年）。月付。除补贴外，还覆盖全额学费、宿舍、医保。',
      },
      {
        q: '中国大学奖学金需要多少GPA？',
        a: '多数院校绩优奖学金最低3.0/4.0（75%+）。顶级奖（苏世民、CAS-TWAS、CSC全奖）一般要3.5+（85%+）。部分学校可以用强语言成绩、研究经历、有说服力的个人陈述弥补。硕博奖学金比本科竞争更激烈。',
      },
      {
        q: '没有雅思/托福能拿奖学金吗？',
        a: '中文授课项目用HSK 4-5替代。英文授课项目多数要求与项目本身相同的语言证明。有条件路径：1年中文预科带奖（学费+补贴），达标后再入读学位。这是没雅思/托福或HSK的学生最常见的路径。',
      },
      {
        q: '什么时候申请中国奖学金？',
        a: '多数9月入学的奖学金截止1-4月。CSC截止4月15日。院校奖通常和项目申请同截止（多数5月，顶尖10校3月）。省市政府奖一般5-6月。孔子学院奖学金3-6月。最重要日期4月15日——前一年11月开始准备。',
      },
      {
        q: '中国奖学金是全奖吗？',
        a: '部分是。CSC和少数顶级院校奖（苏世民、CAS-TWAS）是全奖：学费+宿舍+补贴+医保+有时机票。多数院校奖是部分：学费20-100%，无补贴。省市政府奖是部分：¥20,000-50,000/年。全奖体验靠CSC或顶级奖+部分院校省市政府奖补差。',
      },
    ],
    howToSteps: [
      { name: '打好基础', text: '雅思6.5+或HSK 5+。GPA 3.5+。强个人陈述，2-3封扎实的推荐信。' },
      { name: '筛选3-5所大学和专业', text: '匹配专业、预算、授课语言。用SICA目录按排名、语言、城市筛选。' },
      { name: '申请大学', text: '通过每所学校的招生系统提交。多数自动评估内部奖学金。' },
      { name: '申CSC（最重要）', text: '通过studyinchina.edu.cn或本国CSC机构，4月15日前提交。附上中国大学的预录取。' },
      { name: '叠加省市政府和企业奖', text: '申北京/上海/目标城市政府奖，加上相关企业或基金会奖。' },
      { name: '等结果（5-7月）', text: '5月起大学发录取+奖学金通知。CSC 6-7月出。省市政府奖7-8月。' },
      { name: '接最佳组合', text: '一次只能持一个全奖。CSC录取一般延期或放弃小奖。CSC拒了就接最佳大学+省市组合。' },
      { name: '用资金办签证+入学', text: 'CSC资金入学后到账。确保有$2,000支付签证、机票、初始安家费。' },
    ],
    ctaTitle: '找到适合你的奖学金',
    ctaSubtitle: 'SICA免费评估根据你的背景，匹配CSC、院校、省市政府奖，并告诉你申哪些。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/study-in-china', label: '为什么来华留学', description: '顶尖大学、学费、奖学金、校园生活、职业发展。' },
      { href: '/guides/application', label: '如何申请', description: '申请流程、材料、时间线分步指南。' },
      { href: '/scholarships', label: '浏览所有奖学金', description: '50+项中国政府、大学、省级奖学金。' },
    ],
  },
};
