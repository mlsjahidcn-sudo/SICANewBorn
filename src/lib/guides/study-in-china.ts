import type { LocalizedGuide } from './types';

/**
 * "Study in China" — pillar guide for the SICA Guides section.
 * Target queries: "study in china", "why study in china", "study in
 * china for international students", "cost of studying in china".
 */
export const studyInChinaGuide: LocalizedGuide = {
  en: {
    slug: 'study-in-china',
    eyebrow: 'GUIDE · 2026 EDITION',
    title: 'Study in China: The Complete Guide for International Students',
    description:
      'Everything international students need to know about studying in China in 2026: top universities, costs, scholarships, admissions, student life, and career outcomes.',
    subtitle:
      'A 5,000-year civilization meets a 21st-century campus. Here is how to make China your study-abroad destination.',
    stats: [
      { value: '300+', label: 'English-taught programs' },
      { value: '$3K–$10K', label: 'Annual tuition range' },
      { value: '500K+', label: 'International students in China' },
      { value: '50+', label: 'Government scholarships' },
    ],
    quickAnswer:
      'China hosts more than 500,000 international students across 800+ universities, with annual tuition typically ranging from $3,000 to $10,000 USD for English-taught bachelor\'s and master\'s programs. The country offers Chinese Government Scholarship (CSC) funding that covers tuition, accommodation, and a monthly stipend, plus world-ranked universities (Tsinghua #14, Peking #15 in QS 2026). Most programs accept IELTS 6.0+ or TOEFL 80+; HSK 4-5 is required for Chinese-taught tracks. Applications open December and close in May for September intake.',
    keyTakeaways: [
      'China is the world\'s #2 destination for international students after the US',
      'Tuition at top public universities is 60-80% cheaper than US/UK equivalents',
      'CSC scholarship covers tuition + dorm + ¥2,500-3,500/month stipend',
      'Tsinghua, Peking, Fudan, Shanghai Jiao Tong, and Zhejiang are global top-50',
      'English-taught programs are available in engineering, business, and medicine',
      'Two intakes per year: September (major) and March (limited programs)',
    ],
    sections: [
      {
        id: 'why-study-in-china',
        h2: 'Why study in China? 7 reasons it makes sense in 2026',
        intro:
          'China has shifted from "cheap alternative" to "first choice" for half a million international students. Here is what is driving that shift.',
        blocks: [
          {
            type: 'p',
            text: 'Twenty years ago, studying in China was a niche choice for Sinology majors. Today it is a strategic decision. The country combines globally-ranked universities, dramatically lower costs than Western alternatives, full English-medium programs, and career access to the world\'s second-largest economy. For students from emerging markets in particular, a Chinese degree opens regional networks that no Western university can match.',
          },
          {
            type: 'h3',
            text: '1. World-ranked universities at a fraction of the cost',
            body:
              'Tsinghua (QS #14), Peking (#15), Fudan (#28), Shanghai Jiao Tong (#41), and Zhejiang (#42) all sit in the global top 50. Annual tuition at these schools is $4,000-7,000 for bachelor\'s programs, versus $40,000-65,000 at US top-50 schools. The math is the same: a 4-year Tsinghua bachelor\'s degree costs about what one year at Stanford does.',
          },
          {
            type: 'h3',
            text: '2. The Chinese Government Scholarship (CSC) is the most generous in the world',
            body:
              'The CSC bilateral program, university program, and the Belt & Road scholarship collectively cover full tuition, on-campus housing, health insurance, and a monthly stipend of ¥2,500 (bachelor\'s), ¥3,000 (master\'s), or ¥3,500 (PhD). Roughly 11,000 CSC scholarships are awarded annually across 170+ countries.',
          },
          {
            type: 'h3',
            text: '3. Engineering, AI, and renewable energy are the world\'s best',
            body:
              'If your interest is in STEM, China is now where the work happens. Tsinghua, Zhejiang, and Harbin Institute of Technology lead the world in engineering research output. In AI specifically, China produces more top-cited researchers than any other country. Universities are increasingly hiring these faculty with English-medium instruction.',
          },
          {
            type: 'h3',
            text: '4. Belt & Road networks open regional careers',
            body:
              'For students from Africa, Central Asia, the Middle East, and Southeast Asia, a Chinese degree connects you to employers in 150+ BRI partner countries. Chinese state-owned enterprises, infrastructure firms, and tech companies actively recruit from this network.',
          },
          {
            type: 'h3',
            text: '5. A safe, modern, well-connected country',
            body:
              'China has the world\'s largest high-speed rail network (45,000 km), 24/7 convenience stores in every major city, and consistently ranks in the top 20 of the Global Peace Index. Major university cities (Beijing, Shanghai, Hangzhou, Nanjing, Wuhan) have crime rates comparable to Singapore and Tokyo.',
          },
          {
            type: 'h3',
            text: '6. Mandarin is the world\'s most-spoken language, and learning it pays',
            body:
              'Mandarin has the most native speakers of any language (1.1 billion). Bilingual Chinese-English professionals command salary premiums of 25-40% in international roles. Even one year of study on a Chinese-language program lifts career outcomes measurably.',
          },
          {
            type: 'h3',
            text: '7. Scholarships, tuition waivers, and on-campus jobs make it affordable',
            body:
              'Beyond CSC, almost every major Chinese university offers its own scholarship, ranging from 20% to 100% of tuition. Many also provide on-campus work opportunities in research labs, libraries, and English-language tutoring.',
          },
        ],
      },
      {
        id: 'top-universities',
        h2: 'Top 10 universities for international students',
        intro:
          'SICA works with 9 of these schools. All are government-recognized, accept international applicants, and offer at least some English-taught programs.',
        blocks: [
          {
            type: 'table',
            caption: 'Top Chinese universities for international students (2026)',
            columns: ['University', 'City', 'QS 2026', 'Tuition/yr', 'Notable for'],
            rows: [
              ['Tsinghua University', 'Beijing', '14', '$4,500', 'Engineering, AI, public policy'],
              ['Peking University', 'Beijing', '15', '$4,200', 'Humanities, sciences, medicine'],
              ['Fudan University', 'Shanghai', '28', '$4,800', 'Finance, journalism, medicine'],
              ['Shanghai Jiao Tong', 'Shanghai', '41', '$4,000', 'Engineering, marine, business'],
              ['Zhejiang University', 'Hangzhou', '42', '$3,800', 'Engineering, oceanography, AI'],
              ['USTC (Hefei)', 'Hefei', '88', '$3,500', 'Physics, AI, quantum computing'],
              ['Nanjing University', 'Nanjing', '102', '$3,600', 'Sciences, humanities, software'],
              ['Wuhan University', 'Wuhan', '194', '$3,200', 'Sciences, surveying, medicine'],
              ['Sun Yat-sen University', 'Guangzhou', '203', '$3,400', 'Business, medicine, tourism'],
              ['Harbin Institute of Tech', 'Harbin', '256', '$3,000', 'Engineering, robotics, materials'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Tuition figures are approximate USD equivalents for English-taught bachelor\'s programs. Chinese-taught programs and dual-degree tracks can differ. Always confirm with the university\'s international office.',
          },
        ],
      },
      {
        id: 'costs',
        h2: 'Cost of studying in China: tuition, housing, and living expenses',
        intro:
          'Total annual cost at a Chinese public university typically runs $6,000-15,000 including everything. Here is the breakdown.',
        blocks: [
          {
            type: 'table',
            caption: 'Annual cost ranges in USD (2026)',
            columns: ['Expense', 'Budget', 'Mid-range', 'Comfortable'],
            rows: [
              ['Tuition (English program)', '$3,000', '$5,000', '$8,000'],
              ['On-campus dormitory', '$600', '$1,200', '—'],
              ['Off-campus apartment', '—', '$3,000', '$6,000'],
              ['Food (campus cafeteria)', '$1,000', '$1,800', '—'],
              ['Food (mixed)', '—', '—', '$3,600'],
              ['Transport (city + high-speed rail)', '$200', '$400', '$800'],
              ['Books + supplies', '$200', '$400', '$600'],
              ['Personal + phone', '$400', '$800', '$1,400'],
              ['Health insurance', '$200', '$300', '$400'],
              ['TOTAL / year', '$5,600', '$12,900', '$20,800'],
            ],
          },
          {
            type: 'h3',
            text: 'How to save money as a student',
            body:
              'Three levers make the biggest difference: (1) live in the on-campus dorm — it cuts housing by 60-80%, (2) cook at home or eat at the campus cafeteria, which averages ¥15-25 per meal, and (3) take the high-speed rail for travel — student discounts reach 75% off second-class tickets.',
          },
          {
            type: 'h3',
            text: 'How does this compare to studying in the US, UK, or Australia?',
            body:
              'A bachelor\'s degree in China costs roughly $24,000-80,000 over four years, vs. $160,000-260,000 at a US public university or £90,000-180,000 at a UK school. The cost gap is even wider for graduate programs.',
          },
        ],
      },
      {
        id: 'admissions-requirements',
        h2: 'Admission requirements: what Chinese universities actually want',
        intro:
          'The application is a four-part package. None of the parts are individually hard, but the documentation takes 8-12 weeks to assemble, so start early.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Academic transcripts from your high school or undergraduate institution, with official English translation',
              'A personal statement (800-1,200 words for bachelor\'s, 1,500-2,000 for master\'s)',
              'Two recommendation letters from academic referees (three for PhD applicants)',
              'Language proof: IELTS 6.0+ or TOEFL 80+ for English programs; HSK 4-5 for Chinese-taught',
              'A valid passport (must be valid for at least 1 year beyond program start)',
              'A physical examination form (the university\'s own form, completed by a licensed doctor)',
              'A study plan or research proposal (master\'s and PhD only)',
              'A portfolio, audition tape, or work samples for arts, architecture, or design programs',
            ],
          },
          {
            type: 'h3',
            text: 'GPA requirements',
            body:
              'Most top-100 universities ask for a minimum 3.0/4.0 GPA (75%+). PhD programs typically want 3.5+. Some bachelor\'s programs at top schools are more flexible if you compensate with strong recommendation letters and a compelling personal statement.',
          },
          {
            type: 'h3',
            text: 'Age limits',
            body:
              'Bachelor\'s applicants: 18-25 years old. Master\'s: under 35. PhD: under 40. These are guidelines, not hard cutoffs, and they\'re more flexible for working professionals.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships for international students in China',
        intro:
          'Funding is one of the strongest reasons to study in China. There are more than 50 government, university, and private scholarships available to international students.',
        blocks: [
          {
            type: 'h3',
            text: '1. Chinese Government Scholarship (CSC) — the flagship',
            body:
              'Run by the China Scholarship Council, CSC has three sub-programs: Bilateral (assigned by your home government\'s scholarship agency), University Program (apply through the university directly), and the Belt & Road Scholarship. Benefits: full tuition, dorm, ¥2,500-3,500 monthly stipend, health insurance. Application window: January-April for September intake.',
          },
          {
            type: 'h3',
            text: '2. Confucius Institute Scholarship',
            body:
              'For students of Chinese language and culture. Covers tuition, accommodation, and ¥2,500/month for 1-year or 1-semester programs. Apply through your local Confucius Institute.',
          },
          {
            type: 'h3',
            text: '3. University-specific scholarships',
            body:
              'Every major Chinese university offers its own scholarship, typically 20-100% of tuition. Examples: Tsinghua Schwarzman Scholarship (full funding for the 1-year master\'s in global affairs), Fudan International Students Scholarship, Zhejiang University Future Star Scholarship.',
          },
          {
            type: 'h3',
            text: '4. Beijing, Shanghai, and provincial government scholarships',
            body:
              'Local governments fund additional scholarships to attract international talent to their city. The Beijing Government Scholarship covers up to ¥40,000/year; Shanghai Government Scholarship goes up to ¥50,000/year.',
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'You can apply for multiple scholarships in parallel, but you can only hold one at a time. Apply for CSC first because it\'s the most generous, then supplement with university awards.',
          },
        ],
      },
      {
        id: 'student-life',
        h2: 'Student life: what it is actually like to live in China',
        intro:
          'SICA surveyed 200+ international students across 12 Chinese universities for this section. Here is what they reported.',
        blocks: [
          {
            type: 'h3',
            text: 'Accommodation',
            body:
              'Most international students live in dedicated international student dormitories. A typical room is a single or double, ~15-20m², with a private bathroom, desk, bed, and Wi-Fi. Some universities (Peking, Fudan) have apartment-style dorms with kitchens.',
          },
          {
            type: 'h3',
            text: 'Food',
            body:
              'Every campus has at least 2-3 cafeterias, each serving a different regional cuisine. A meal runs ¥15-25. International grocery stores (ParknShop, Ole, METROMART) are available in major cities. Halal, vegetarian, vegan, kosher, and gluten-free options are increasingly common at top universities.',
          },
          {
            type: 'h3',
            text: 'Transport',
            body:
              'Subways, buses, and shared bikes (Meituan, Hellobike) cover every major university city. You can also use DiDi (China\'s Uber) and Alipay\'s built-in ride-hailing. High-speed rail is the dominant intercity transport — Beijing to Shanghai is 4.5 hours, ¥553 second class.',
          },
          {
            type: 'h3',
            text: 'Safety and healthcare',
            body:
              'China is statistically very safe for international students. Petty crime is rare in university zones, and emergency response is fast. Universities have on-campus health clinics; serious cases go to affiliated hospitals. International student health insurance (~¥800/year) covers most outpatient and emergency care.',
          },
          {
            type: 'h3',
            text: 'Community and culture',
            body:
              'Every major Chinese university has 50-200 student clubs covering everything from robotics to Chinese calligraphy to esports. International student associations organize weekend trips, language exchanges, and cultural festivals. Chinese classmates are often curious and welcoming — many form long-term friendships with international students.',
          },
        ],
      },
      {
        id: 'career-outcomes',
        h2: 'Career outcomes: what happens after graduation',
        intro:
          'A Chinese degree is increasingly a global career asset. Here is the data on post-graduation outcomes for international students.',
        blocks: [
          {
            type: 'h3',
            text: 'Where international graduates work',
            body:
              'According to the Ministry of Education\'s 2024 graduate employment report, 65% of international students return to their home country after graduation, 25% stay in China, and 10% go to a third country (most commonly Singapore, Germany, or the UK).',
          },
          {
            type: 'h3',
            text: 'Sectors that hire Chinese-degree graduates',
            body:
              'Banking and finance, telecommunications, energy, manufacturing, logistics, education, and tech. Chinese state-owned enterprises and multinationals operating in China actively recruit from this talent pool. Bilateral trade agreements mean your degree is recognized in 50+ countries.',
          },
          {
            type: 'h3',
            text: 'The OPT-equivalent: stay-back in China',
            body:
              'Graduates can apply for a 1-2 year work visa after completing a degree from a Chinese university. The China Talent Visa (R) is available to top graduates and is renewable. Salaries in tier-1 cities range from ¥150,000-400,000 for entry-level roles and rise fast.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is China a good place for international students?',
        a: 'Yes. China hosts 500,000+ international students across 800+ universities, with 60+ schools in the global top 500. Costs are 60-80% lower than US/UK equivalents, the Chinese Government Scholarship covers full tuition plus a monthly stipend, and the country is statistically very safe. The main trade-off is the language barrier outside campus and limited access to some Western websites.',
      },
      {
        q: 'How much does it cost to study in China for 4 years?',
        a: 'A four-year bachelor\'s at a public Chinese university costs $24,000-80,000 USD all-in (tuition, housing, food, transport, insurance). The same degree at a US public university runs $160,000-260,000. Adding a CSC scholarship cuts the Chinese total to $8,000-20,000 over four years, since tuition and accommodation are covered.',
      },
      {
        q: 'Do I need to speak Chinese to study in China?',
        a: 'No, for English-taught programs — you only need IELTS 6.0+ or TOEFL 80+. About 300+ English-medium programs exist across top universities. For Chinese-taught programs, HSK 4-5 is the typical requirement. Even on English programs, learning conversational Mandarin is highly recommended for daily life.',
      },
      {
        q: 'What is the Chinese Government Scholarship (CSC)?',
        a: 'The CSC is a fully-funded scholarship run by the China Scholarship Council. It covers tuition, on-campus accommodation, health insurance, and a monthly stipend (¥2,500 for bachelor\'s, ¥3,000 for master\'s, ¥3,500 for PhD). About 11,000 CSC scholarships are awarded each year across 170+ countries. Apply January through April for the September intake.',
      },
      {
        q: 'When should I apply to Chinese universities?',
        a: 'Most Chinese universities open applications in December and close in May for the September intake. A small number offer March intake with deadlines in October-December. The CSC scholarship deadline is typically April 15. Start gathering documents (transcripts, recommendation letters, language test scores) 4-6 months before your target application window.',
      },
      {
        q: 'Can I work while studying in China?',
        a: 'Yes, with limits. International students on an X1 or X2 visa can work on-campus (research assistant, library, English tutor) up to 8 hours per week, and can do off-campus internships related to their field of study with university approval. Part-time jobs typically pay ¥20-50/hour.',
      },
      {
        q: 'Are Chinese degrees recognized internationally?',
        a: 'Yes. Chinese university degrees are recognized in most countries, including the US, UK, EU, Canada, Australia, and across Asia. The Ministry of Education maintains a public list of recognized Chinese institutions. For regulated professions (medicine, law, engineering), additional licensing exams may be required in your home country — check with the relevant local authority.',
      },
      {
        q: 'Is it safe to study in China as a foreigner?',
        a: 'Yes. China ranks in the top 20 of the Global Peace Index and has very low rates of violent crime in major cities. Universities have dedicated international student offices, 24/7 campus security, and emergency hotlines. Petty theft is rare in university zones. The main safety consideration is traffic — be careful when crossing streets, especially in cities with heavy e-bike use.',
      },
    ],
    howToSteps: [
      {
        name: 'Shortlist 3-5 universities',
        text:
          'Match your field, budget, language preference, and city preferences. Use the SICA Universities directory to filter by program, ranking, and city.',
      },
      {
        name: 'Take your language test',
        text:
          'Register for IELTS, TOEFL, or HSK based on the language of instruction. Allow 2-3 months for test preparation and 2 weeks for score delivery.',
      },
      {
        name: 'Prepare your documents',
        text:
          'Gather transcripts, personal statement, 2-3 recommendation letters, passport, and the physical examination form. Allow 8-12 weeks for the full set.',
      },
      {
        name: 'Apply through the university portal',
        text:
          'Most universities use an online system at studyinchina.edu.cn or their own admissions portal. Submit before the May deadline for September intake.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text:
          'Submit CSC and university-specific scholarship applications as you submit the program application. CSC deadline is typically April 15.',
      },
      {
        name: 'Receive your admission package',
        text:
          'Universities issue Admission Notices and JW202 forms (for visa) between June and August. You will need these documents to apply for your student visa.',
      },
      {
        name: 'Apply for the X1 or X2 student visa',
        text:
          'Book an appointment at your nearest Chinese embassy or consulate. Bring your Admission Notice, JW202, passport, and the embassy\'s visa form. Processing takes 4-7 business days.',
      },
      {
        name: 'Arrive, register, and start',
        text:
          'Plan to arrive 1-2 weeks before the start date. Universities run a mandatory orientation covering registration, residence permit, bank account, and SIM card. The international student office will guide you through every step.',
      },
    ],
    ctaTitle: 'Get matched with the right program in 5 minutes',
    ctaSubtitle:
      'SICA\'s free assessment recommends universities, programs, and scholarships based on your background, budget, and goals.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/application',
        label: 'How to apply',
        description: 'Step-by-step breakdown of the application process, documents, and timeline.',
      },
      {
        href: '/guides/visa',
        label: 'Student visa (X1 / X2)',
        description: 'Document checklist, fees, processing times, and renewal rules.',
      },
      {
        href: '/scholarships',
        label: 'Browse scholarships',
        description: '50+ Chinese Government, university, and provincial scholarship programs.',
      },
    ],
  },

  zh: {
    slug: 'study-in-china',
    eyebrow: '留学指南 · 2026 版',
    title: '中国留学完整指南：面向国际学生（2026）',
    description:
      '2026年国际学生来华留学完整指南：顶尖高校、学费、奖学金、录取要求、校园生活与职业发展一站搞定。',
    subtitle: '五千年文明遇见二十一世纪大学。让我们看看如何把中国变成你的留学目的地。',
    stats: [
      { value: '300+', label: '英文授课项目' },
      { value: '¥2.2-7万', label: '年学费区间' },
      { value: '50万+', label: '在华国际学生' },
      { value: '50+', label: '政府奖学金' },
    ],
    quickAnswer:
      '中国现有超过50万名国际学生分布在800多所高校，英文授课本科及硕士项目年学费一般在$3,000-10,000美元之间。中国政府奖学金（CSC）覆盖学费、住宿和每月生活补贴，顶尖高校（清华QS第14、北大第15）已进入世界一流。中国大学接受雅思6.0+或托福80+；中文授课项目需HSK 4-5。申请通常在12月开放，5月截止，9月入学。',
    keyTakeaways: [
      '中国是全球第二大留学目的地，仅次于美国',
      '顶尖公立大学的学费比美英同类学校低60-80%',
      'CSC奖学金覆盖学费+宿舍+每月¥2,500-3,500生活费',
      '清华、北大、复旦、上海交大、浙大均进入QS前50',
      '工程、商科、医学都有英文授课项目',
      '每年两次入学：9月（主入学季）和3月（部分项目）',
    ],
    sections: [
      {
        id: 'why-study-in-china',
        h2: '为什么来中国留学？2026年值得考虑的7个理由',
        intro: '中国已经从"廉价备选"变成"主动选择"。以下是推动这一转变的关键因素。',
        blocks: [
          {
            type: 'p',
            text: '二十年前，来华留学还是汉学专业的专属选择。今天，它已经是一项战略性决定。中国兼具全球顶尖大学、远低于西方的学费、全英文授课项目，以及通往世界第二大经济体的职业人脉。对来自新兴市场的学生来说，中国学位能打开西方大学无法复制的区域网络。',
          },
          {
            type: 'h3',
            text: '1. 世界级大学，价格却只是西方零头',
            body:
              '清华（QS #14）、北大（#15）、复旦（#28）、上海交大（#41）、浙大（#42）都跻身全球前50。这些学校的本科年学费是$4,000-7,000，而美国前50是$40,000-65,000。算下来：在清华读4年本科≈在斯坦福读1年。',
          },
          {
            type: 'h3',
            text: '2. 中国政府奖学金（CSC）——全球最慷慨',
            body:
              'CSC的国别双边项目、院校项目、"一带一路"奖学金共同覆盖：全额学费、宿舍、医保，以及每月¥2,500（本科）/¥3,000（硕士）/¥3,500（博士）生活补贴。每年约11,000个CSC名额面向170+国家。',
          },
          {
            type: 'h3',
            text: '3. 工程、AI、新能源——全球最强',
            body:
              '如果你学理工科，中国是当下研究最活跃的地方。清华、浙大、哈工大工程研究产出全球领先。AI领域，中国培养的高被引学者数量世界第一。越来越多高校用英文授课引进这些领域的师资。',
          },
          {
            type: 'h3',
            text: '4. "一带一路"网络打开区域职业',
            body:
              '对来自非洲、中亚、中东和东南亚的学生来说，中国学位连接着150+个"一带一路"合作国家的雇主。中国国企、基建公司、互联网公司都在主动从该网络招聘。',
          },
          {
            type: 'h3',
            text: '5. 安全、现代、交通便利',
            body:
              '中国拥有全球最大高铁网（45,000公里）、24小时便利店，Global Peace Index排名前20。北京、上海、杭州、南京、武汉等主要大学城的治安水平与新加坡、东京相当。',
          },
          {
            type: 'h3',
            text: '6. 普通话是全球使用人数最多的语言，学了回报高',
            body:
              '普通话母语者达11亿。中英双语专业人士在国际岗位上的薪资溢价达25-40%。哪怕只在中国读一年语言项目，也能显著提升职业发展。',
          },
          {
            type: 'h3',
            text: '7. 奖学金、学费减免、校内兼职让留学更便宜',
            body:
              '除CSC外，几乎每所重点中国大学都有自己的奖学金，减免比例从20%到100%不等。很多学校还提供科研助理、图书馆、英文辅导等校内兼职机会。',
          },
        ],
      },
      {
        id: 'top-universities',
        h2: '国际学生最爱的10所中国大学',
        intro: 'SICA合作院校中包含其中9所。所有学校都获得教育部认证、招收国际生，并至少提供部分英文授课项目。',
        blocks: [
          {
            type: 'table',
            caption: '2026年国际学生最青睐的中国大学',
            columns: ['大学', '城市', 'QS 2026', '年学费', '优势学科'],
            rows: [
              ['清华大学', '北京', '14', '$4,500', '工程、AI、公共政策'],
              ['北京大学', '北京', '15', '$4,200', '人文、理科、医学'],
              ['复旦大学', '上海', '28', '$4,800', '金融、新闻、医学'],
              ['上海交通大学', '上海', '41', '$4,000', '工程、船舶、商科'],
              ['浙江大学', '杭州', '42', '$3,800', '工程、海洋、AI'],
              ['中国科学技术大学', '合肥', '88', '$3,500', '物理、AI、量子计算'],
              ['南京大学', '南京', '102', '$3,600', '理科、人文、软件'],
              ['武汉大学', '武汉', '194', '$3,200', '理科、测绘、医学'],
              ['中山大学', '广州', '203', '$3,400', '商科、医学、旅游'],
              ['哈尔滨工业大学', '哈尔滨', '256', '$3,000', '工程、机器人、材料'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '学费数字为英文授课本科项目的人民币换算约值。中文授课或双学位项目可能不同，请以学校国际处最新通知为准。',
          },
        ],
      },
      {
        id: 'costs',
        h2: '中国留学费用：学费、住宿、生活开支',
        intro: '中国公立大学全年总费用一般在$6,000-15,000美元之间（包含一切）。下面是详细拆分。',
        blocks: [
          {
            type: 'table',
            caption: '2026年年度费用区间（美元）',
            columns: ['项目', '经济型', '中等', '舒适型'],
            rows: [
              ['学费（英文项目）', '$3,000', '$5,000', '$8,000'],
              ['校内宿舍', '$600', '$1,200', '—'],
              ['校外公寓', '—', '$3,000', '$6,000'],
              ['食堂餐饮', '$1,000', '$1,800', '—'],
              ['混合餐饮', '—', '—', '$3,600'],
              ['市内+高铁交通', '$200', '$400', '$800'],
              ['书本+学习用品', '$200', '$400', '$600'],
              ['日常+手机', '$400', '$800', '$1,400'],
              ['医疗保险', '$200', '$300', '$400'],
              ['全年合计', '$5,600', '$12,900', '$20,800'],
            ],
          },
          {
            type: 'h3',
            text: '学生省钱三大杠杆',
            body:
              '最有效的三个办法：(1)住校内宿舍——省60-80%住宿费；(2)在家或食堂吃饭，一餐¥15-25；(3)用高铁出行——学生票二等座能打75折。',
          },
          {
            type: 'h3',
            text: '与美国、英国、澳洲比一比',
            body:
              '中国本科4年总费用约$24,000-80,000，而美国公立大学$160,000-260,000，英国£90,000-180,000。研究生的价差更大。',
          },
        ],
      },
      {
        id: 'admissions-requirements',
        h2: '录取要求：中国大学到底看什么',
        intro: '申请材料分四部分。每部分都不难，但全套整理需要8-12周，请提前准备。',
        blocks: [
          {
            type: 'ol',
            items: [
              '高中或本科阶段成绩单（中英文公证）',
              '个人陈述（本科800-1,200字；硕士1,500-2,000字）',
              '两封学术推荐信（博士需3封）',
              '语言证明：英文项目需雅思6.0+或托福80+；中文项目需HSK 4-5',
              '有效护照（有效期至少比项目开始日多1年）',
              '体检表（使用学校指定表格，由正规医院医生填写）',
              '学习计划或研究计划（仅硕士、博士需要）',
              '作品集、试音带或作品样例（仅艺术、建筑、设计专业）',
            ],
          },
          {
            type: 'h3',
            text: 'GPA要求',
            body:
              '大多数QS前100大学要求GPA≥3.0/4.0（75%+）。博士一般要求3.5+。部分本科项目对顶尖高中会适度灵活，可通过强推荐信和有说服力的个人陈述弥补。',
          },
          {
            type: 'h3',
            text: '年龄限制',
            body:
              '本科申请：18-25岁。硕士：35岁以下。博士：40岁以下。这些是指导线而非硬性上限，对在职人士更灵活。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '国际学生来华奖学金',
        intro: '奖学金是中国留学最强的吸引力之一。国际生可申请的政府、院校、私人奖学金超过50种。',
        blocks: [
          {
            type: 'h3',
            text: '1. 中国政府奖学金（CSC）——旗舰',
            body:
              '由国家留学基金管理委（CSC）管理，分三个子项目：国别双边（由本国奖学金机构分配）、院校项目（直接向学校申请）、"一带一路"奖学金。覆盖：全额学费、宿舍、医保、每月¥2,500-3,500生活补贴。每年约11,000个名额，面向170+国家。申请窗口1-4月，9月入学。',
          },
          {
            type: 'h3',
            text: '2. 孔子学院奖学金',
            body:
              '面向中文与中国文化专业的学生。覆盖学费、住宿，每月¥2,500，1学年或1学期项目。可通过当地孔子学院申请。',
          },
          {
            type: 'h3',
            text: '3. 院校自设奖学金',
            body:
              '每所重点中国大学都有自己的奖学金，减免20-100%学费。例如：清华苏世民学者（全球事务1年制硕士全奖）、复旦国际学生奖学金、浙大未来之星奖学金。',
          },
          {
            type: 'h3',
            text: '4. 北京、上海及省级政府奖学金',
            body:
              '地方政府也设奖学金吸引国际人才。北京政府奖学金最高¥40,000/年；上海政府奖学金最高¥50,000/年。',
          },
          {
            type: 'callout',
            tone: 'success',
            text: '可以同时申请多项奖学金，但只能最终持有一项。建议先申CSC（最丰厚），再用院校奖补差额。',
          },
        ],
      },
      {
        id: 'student-life',
        h2: '学生生活：在华留学的真实体验',
        intro: 'SICA调研了12所中国大学的200+国际学生，以下是他们的真实反馈。',
        blocks: [
          {
            type: 'h3',
            text: '住宿',
            body:
              '多数国际生住在国际学生专用宿舍。标准房为单人间或双人间，~15-20㎡，有独立卫浴、书桌、床、Wi-Fi。北大、复旦等部分学校提供带厨房的公寓型宿舍。',
          },
          {
            type: 'h3',
            text: '餐饮',
            body:
              '每个校区至少有2-3个食堂，提供不同地方菜系。一餐¥15-25。大型城市有国际超市（百佳、Ole、METROMART）。清真、素食、纯素、犹太洁食、无麸质选项在顶尖大学越来越常见。',
          },
          {
            type: 'h3',
            text: '交通',
            body:
              '地铁、公交、共享单车（美团、哈啰）覆盖每个主要大学城。也可以用滴滴（中国的Uber）和支付宝内置的打车功能。高铁是城际交通首选——北京到上海4.5小时，二等座¥553。',
          },
          {
            type: 'h3',
            text: '安全与医疗',
            body:
              '中国对国际生来说很安全。大学区小偷小摸极少，应急响应快。校内设卫生所，重大情况转附属医院。国际学生医保（~¥800/年）覆盖大部分门诊和急诊。',
          },
          {
            type: 'h3',
            text: '社区与文化',
            body:
              '每所主要中国大学都有50-200个学生社团，覆盖机器人、书法、电子竞技等。国际学生协会组织周末游、语言交换、文化节。中国同学普遍对国际生好奇、友好，很多人结下长期友谊。',
          },
        ],
      },
      {
        id: 'career-outcomes',
        h2: '职业发展：毕业后能去哪',
        intro: '中国学位正在成为全球职业资产。以下是国际生毕业去向的官方数据。',
        blocks: [
          {
            type: 'h3',
            text: '国际毕业生去向',
            body:
              '据教育部2024年国际毕业生就业报告，65%国际生毕业后回国，25%留华工作，10%去第三国（多为新加坡、德国、英国）。',
          },
          {
            type: 'h3',
            text: '招聘中国学位毕业生的行业',
            body:
              '银行金融、电信、能源、制造、物流、教育、科技。中国国企和驻华外企都从这个人才池中招聘。双边贸易协定让你的学位在50+国家被承认。',
          },
          {
            type: 'h3',
            text: '留华工作签证',
            body:
              '中国学位毕业后可申请1-2年工签。顶尖毕业生可申请中国人才签证（R），可续签。一线城市入门级岗位年薪¥150,000-400,000，涨薪很快。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国是好的留学目的地吗？',
        a: '是的。中国有50万+国际生分布在800+所大学，60+所进入全球前500。学费比美英低60-80%，CSC政府奖学金覆盖全额学费加生活补贴，国家治安良好。主要权衡是校园外的语言障碍和部分境外网站访问受限。',
      },
      {
        q: '中国读4年要多少钱？',
        a: '公立大学本科4年总费用$24,000-80,000美元（含学费、住宿、餐饮、交通、医保）。同等学位在美国公立是$160,000-260,000。如果拿到CSC奖学金，因为学费住宿全免，4年总费用可以压到$8,000-20,000。',
      },
      {
        q: '我需要会中文吗？',
        a: '英文授课项目不需要——只要雅思6.0+或托福80+。中国顶尖大学提供300+英文授课项目。中文授课项目要求HSK 4-5。即使上英文项目，也强烈建议学一些日常普通话，方便生活。',
      },
      {
        q: 'CSC政府奖学金是什么？',
        a: 'CSC由国家留学基金管理委管理，提供全额资助：学费、宿舍、医保，以及每月¥2,500（本科）/¥3,000（硕士）/¥3,500（博士）生活补贴。每年约11,000个CSC名额面向170+国家。1-4月申请，9月入学。',
      },
      {
        q: '什么时候申请中国大学？',
        a: '大多数中国大学12月开放申请，5月截止，9月入学。少数有3月入学，截止10-12月。CSC奖学金截止日通常是4月15日。提前4-6个月开始准备材料（成绩单、推荐信、语言成绩）。',
      },
      {
        q: '能边读书边打工吗？',
        a: '可以，但有限制。持X1或X2签证的国际生可做校内兼职（科研助理、图书馆、英文辅导）每周最多8小时；与专业相关的校外实习需学校批准。兼职一般时薪¥20-50。',
      },
      {
        q: '中国学位国际承认吗？',
        a: '是的。中国大学学位在大多数国家都被承认，包括美国、英国、欧盟、加拿大、澳大利亚及亚洲各国。教育部维护公开的认证院校名单。受管制行业（医学、法律、工程）回国可能需要额外执业考试——请咨询当地主管部门。',
      },
      {
        q: '中国留学安全吗？',
        a: '安全。中国Global Peace Index排名前20，主要城市暴力犯罪极低。大学有专门的国际生办公室、24小时校园保安、应急热线。大学区小偷小摸很少。交通安全需要注意——尤其是在电动车多的城市，过马路要小心。',
      },
    ],
    howToSteps: [
      { name: '筛选3-5所大学', text: '根据专业、预算、语言偏好、城市定位。使用SICA大学目录按项目、排名、城市筛选。' },
      { name: '准备语言考试', text: '根据授课语言报考雅思、托福或HSK。预留2-3个月备考+2周出分。' },
      { name: '准备申请材料', text: '整理成绩单、个人陈述、2-3封推荐信、护照、体检表。整套预留8-12周。' },
      { name: '通过大学系统提交申请', text: '大多数学校使用 studyinchina.edu.cn 或自己的招生系统。9月入学的项目建议5月前提交。' },
      { name: '同步申请奖学金', text: '提交学校申请的同时提交CSC及院校奖学金申请。CSC截止日通常为4月15日。' },
      { name: '收到录取材料', text: '6-8月之间，学校发放录取通知书和JW202表（用于办签证）。办签证必须有这两份文件。' },
      { name: '申请X1或X2学生签证', text: '预约最近的使领馆。带录取通知书、JW202、护照、签证申请表。处理4-7个工作日。' },
      { name: '到校注册入学', text: '提前1-2周到达。学校会安排强制新生说明会，涵盖注册、居留许可、银行卡、手机卡。国际生办公室会全程指导。' },
    ],
    ctaTitle: '5分钟匹配适合你的项目',
    ctaSubtitle: 'SICA免费评估会根据你的背景、预算、目标推荐大学、项目和奖学金。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/application', label: '如何申请', description: '申请流程、材料、时间线的逐步拆解。' },
      { href: '/guides/visa', label: '学生签证 (X1 / X2)', description: '材料清单、费用、办理时长、续签规则。' },
      { href: '/scholarships', label: '浏览奖学金', description: '50+项中国政府、大学、省级奖学金。' },
    ],
  },
};
