import type { LocalizedGuide } from './types';

/**
 * "Best Universities in Shanghai for International Students" —
 * long-form listicle. Target queries: "best universities shanghai",
 * "study in shanghai", "shanghai universities for international
 * students", "shanghai university ranking", "shanghai cost of
 * living students".
 *
 * Page wrapper fetches the live university list and filters to
 * city=Shanghai (case-insensitive), sorted by ranking. Injects
 * into the `shanghai-universities-table` block at render time.
 */
export const bestShanghaiUniversitiesGuide: LocalizedGuide = {
  en: {
    slug: 'best-universities-in-shanghai',
    eyebrow: 'GUIDE · SHANGHAI',
    title: 'Best Universities in Shanghai for International Students (2026)',
    description:
      'Every Shanghai university ranked by domestic ranking + QS World — tuition, international student population, programs, scholarships, and cost of living for students in Shanghai.',
    subtitle:
      'Shanghai is China\'s #1 international student destination — the financial capital, a global tech hub, and home to C9 League + multiple strong research universities. Here is how to pick the right one.',
    stats: [
      { value: 'TOP 2', label: 'Most international students in China' },
      { value: '¥24-40K/yr', label: 'Average tuition (undergrad)' },
      { value: '¥3,000-4,500/mo', label: 'Living cost in Shanghai' },
      { value: 'LIVE', label: 'Shanghai universities ranked below' },
    ],
    quickAnswer:
      'Shanghai is home to 8-12 strong universities across C9 League (Shanghai Jiao Tong, Fudan), Double First-Class (Tongji, East China Normal, Shanghai University, ShanghaiTech, East China University of Science and Technology), and applied/medical schools (Shanghai University of Traditional Chinese Medicine, Shanghai Maritime). Tuition runs ¥18,000-50,000/year for English-medium programs; total all-in budget (tuition + dorm + living) is ¥80,000-130,000/year. Shanghai is China\'s most international city — 30-50% of master\'s students at top Shanghai universities are international. Most programs have English tracks, and the city\'s international infrastructure (expat communities, English-friendly public services, world-class healthcare) makes it the easiest Chinese city to settle into as a foreign student.',
    keyTakeaways: [
      'Shanghai Jiao Tong + Fudan are C9 League + top 5 in China for international students',
      'Tongji + East China Normal are Double First-Class + globally recognized',
      'Tuition ¥18,000-50,000/year for English-medium programs',
      'Living cost ¥3,000-4,500/month in Shanghai (Tier 1 city)',
      '30-50% international students at master\'s level at top Shanghai universities',
      'Strongest programs: Engineering, Business, Computer Science, International Relations, Medicine, Design',
    ],
    sections: [
      {
        id: 'why-shanghai',
        h2: 'Why Shanghai for international students?',
        intro:
          'Shanghai combines three things no other Chinese city does: a C9 League university cluster (Shanghai Jiao Tong + Fudan), a deep international community (200,000+ international residents), and career opportunities at MNCs + Chinese tech giants. It is the default choice for international students who want a globally-oriented China experience.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**University quality** — Shanghai hosts two of China\'s top 5 universities (Shanghai Jiao Tong + Fudan) and 4-6 other Double First-Class universities. No other Chinese city outside Beijing has this concentration of world-class institutions.',
              '**International community** — Shanghai has 200,000+ international residents (the largest expat community in China). Master\'s programs at top Shanghai universities are 30-50% international. English-friendly infrastructure: hospitals with international departments, metro in English, banks that handle international transfers.',
              '**Career opportunities** — Shanghai is the financial capital of China (home to Shanghai Stock Exchange, most foreign banks\' China HQs, and most Chinese tech companies\' second headquarters). Internships + post-graduation placements are strongest here.',
              '**City quality** — Shanghai is a global city with world-class restaurants, museums, nightlife, transport, and healthcare. Quality of life rivals Hong Kong, Tokyo, Singapore. Most international students prefer Shanghai to other Chinese cities for daily living.',
              '**English accessibility** — Shanghai has the highest density of English-speaking Chinese in mainland China. Restaurants, hospitals, banks, government offices routinely have English-speaking staff. Daily life requires minimal Chinese language.',
              '**Connections** — Shanghai\'s Pudong airport is Asia\'s largest international hub with direct flights to 100+ cities worldwide. Visa runs to Hong Kong, Japan, Korea, Singapore are easy and cheap.',
            ],
          },
          {
            type: 'h3',
            text: 'Trade-offs to consider',
            body:
              'Three honest trade-offs: (1) Cost — Shanghai is the most expensive Chinese city for students (¥3,000-4,500/month living cost vs ¥1,500-2,500 in Tier 2 cities). 30-50% higher than Wuhan or Xi\'an. (2) Distance from political power — Beijing has the ministries, state-owned enterprises, and policy think tanks. If your career is policy/IR/government-focused, Beijing beats Shanghai. (3) Tropical climate — summers are very hot (35-40°C with high humidity). Winters are mild but damp. Spring and autumn are pleasant.',
          },
        ],
      },
      {
        id: 'shanghai-universities',
        h2: 'Shanghai universities ranked',
        intro:
          'Shanghai has 8-12 strong universities serving international students. The top 6 are world-class (C9 League or Double First-Class); the next 4-6 are strong applied/medical/design schools with growing international programs.',
        blocks: [
          {
            type: 'table',
            caption: 'Top Shanghai universities by domestic ranking',
            columns: ['University', 'Tier', 'Founded', 'Strongest fields'],
            rows: [
              ['Shanghai Jiao Tong University', 'C9 League', '1896', 'Engineering (mechanical, electronic, naval), Medicine, Business (Antai MBA)'],
              ['Fudan University', 'C9 League', '1905', 'Liberal arts, Sciences, Medicine, International Relations, Journalism'],
              ['Tongji University', 'Double First-Class', '1907', 'Engineering (architecture, automotive), Civil Engineering, Environmental Science, Design'],
              ['East China Normal University', 'Double First-Class', '1951', 'Education, Linguistics, Psychology, Sciences'],
              ['East China University of Science and Technology', 'Double First-Class', '1952', 'Chemical Engineering, Materials Science, Energy'],
              ['Shanghai University', 'Double First-Class', '1922', 'Engineering, Sciences, Business, Arts'],
              ['ShanghaiTech University', 'Double First-Class (new)', '2013', 'Sciences, AI, Biomedical, Materials (English-only instruction)'],
              ['Shanghai University of Traditional Chinese Medicine', 'Strong applied', '1956', 'TCM, Acupuncture, Chinese Medicine'],
              ['Shanghai Maritime University', 'Strong applied', '1909', 'Maritime Engineering, Logistics, International Business'],
              ['Shanghai University of Finance and Economics', 'Strong applied', '1917', 'Finance, Economics, Accounting, Taxation'],
              ['Shanghai International Studies University', 'Strong applied', '1949', 'Foreign Languages, Translation, International Relations'],
              ['Shanghai Conservatory of Music', 'Strong applied', '1927', 'Music performance, Composition'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'ShanghaiTech University is a special case: all programs are taught in English by default, with a research-focused undergraduate model and small classes (student:faculty ratio ~8:1). Strongest choice for international students who want a fully English-medium + research-intensive experience.',
          },
        ],
      },
      {
        id: 'shanghai-universities-table',
        h2: 'All Shanghai universities in the SICA catalog',
        intro:
          'Every Shanghai-based university in the SICA live database — filtered to city=Shanghai and sorted by lowest (= best) domestic ranking. Use this for the canonical up-to-date list.',
        blocks: [
          {
            type: 'table',
            caption: 'Shanghai universities for international students (live catalog)',
            columns: ['#', 'University', 'Type', 'Established', 'Students', 'Intl students'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Top 6 Shanghai universities (SJTU, Fudan, Tongji, ECNU, ECUST, SHU) are world-class + Double First-Class. The next 6 specialize in applied fields (TCM, maritime, finance, languages, music). Talk to SICA about which Shanghai school is the best fit for your target program.',
          },
        ],
      },
      {
        id: 'cost-shanghai',
        h2: 'Cost of studying in Shanghai',
        intro:
          'Shanghai is China\'s most expensive student city. Total all-in budget for international students runs ¥80,000-130,000/year — about 20-30% higher than Tier 2 cities (Wuhan, Xi\'an, Changsha). Here is the realistic breakdown.',
        blocks: [
          {
            type: 'table',
            caption: 'Annual cost of studying in Shanghai (¥/year, USD/year)',
            columns: ['Item', 'Budget tier 1 (comfortable)', 'Budget tier 2 (frugal)', 'Notes'],
            rows: [
              ['Tuition (English-medium undergrad)', '32,000', '18,000', 'Range: 18K-50K depending on program'],
              ['Tuition (English-medium master)', '40,000', '25,000', 'SJTU/Fudan master\'s programs run 20-40K'],
              ['On-campus dorm (single)', '12,000', '6,000', 'Single room standard at SJTU + Fudan'],
              ['Off-campus apartment (shared)', '36,000+', '24,000', '¥3,000-6,000/month near campus'],
              ['Food (campus cafeteria)', '14,400', '7,200', '¥20-40/meal × 3 meals/day'],
              ['Food (eating out mix)', '24,000', '12,000', 'Shanghai has world-class international dining'],
              ['Transport (metro + bus)', '1,800', '600', 'Shanghai Metro: ¥3-8 per ride'],
              ['Phone + internet', '1,200', '600', '¥50-100/month'],
              ['Books + supplies', '1,500', '500', 'Year 1 may need more'],
              ['Personal + entertainment', '6,000', '3,000', '¥250-500/month'],
              ['Visa + insurance', '1,000', '800', 'Year 1 higher (JW202 processing)'],
              ['TOTAL UNDERGRAD (all-in)', '89,900', '50,700', 'USD: $12,700-7,200'],
              ['TOTAL MASTER\'S (all-in)', '97,900', '57,700', 'USD: $13,800-8,100'],
              ['TOTAL PhD (with funding)', '10,000-15,000 (stipend surplus)', 'Same', 'Funding typically covers all costs'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'PhD students at Shanghai universities typically have funding packages (CSC + university top-up + supervisor grant) totaling ¥5,000-7,000/month in stipends — fully covering all living costs and generating surplus.',
          },
        ],
      },
      {
        id: 'programs-shanghai',
        h2: 'Popular programs at Shanghai universities',
        intro:
          'Shanghai universities excel in specific disciplines. Here is the program-by-program breakdown of where each Shanghai university is strongest.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Engineering (mechanical, electronic, naval, automotive)** — Shanghai Jiao Tong (SJTU) is the historical top-1 for engineering in China. The university grew out of the older Nanyang University (founded 1896) and is the alma mater of many of China\'s top engineers. Strongest engineering schools in Shanghai: SJTU > Tongji > ECUST.',
              '**Business / Finance / MBA** — CEIBS (China Europe International Business School, in Shanghai but joint-venture with EU partners) is the global top-5 MBA. SJTU Antai is the top mainland Chinese MBA (consistently ranked top 3 by Financial Times China). Shanghai University of Finance and Economics is the top finance undergrad + graduate school. Strongest business schools: CEIBS > Antai > SUFE.',
              '**Computer Science / AI** — SJTU has a top-3 CS program in China (especially strong in computer architecture + systems). Fudan + ShanghaiTech are emerging fast in AI. All three have English-medium master\'s programs with strong international students ratios.',
              '**Medicine / Clinical Medicine** — SJTU Medical School (formerly Shanghai Second Medical University) is the top medical school in China. Fudan Shanghai Medical College is a close #2. Shanghai has the highest concentration of top hospitals (Ruijin, Huashan, Zhongshan).',
              '**International Relations / Political Science** — Fudan is the consensus #1 IR school in China. The university has produced many senior Chinese diplomats and policy advisors.',
              '**Architecture / Urban Planning** — Tongji is the #1 architecture + urban planning school in China (and top 20 globally). Strong connections to international practice (Harvard GSD, MIT, ETH Zurich partnerships).',
              '**Design / Industrial Design** — Tongji College of Design + Innovation is the top design school in mainland China (international faculty, English-medium master\'s programs).',
              '**Traditional Chinese Medicine** — Shanghai University of Traditional Chinese Medicine is the top TCM university in China with strong international student programs (5-year TCM bachelor + acupuncture + integrated Chinese-Western medicine).',
              '**Finance + Economics** — Shanghai University of Finance and Economics (SUFE) is the top specialized finance university in China. Career placement at Chinese banks + securities firms is exceptionally strong.',
              '**Liberal Arts / Humanities** — Fudan has the strongest humanities + social sciences cluster in China (philosophy, history, literature, linguistics, journalism).',
            ],
          },
        ],
      },
      {
        id: 'shanghai-vs-beijing',
        h2: 'Shanghai vs Beijing: which city for international students?',
        intro:
          'Beijing and Shanghai are the two dominant destinations for international students in China. Both have multiple world-class universities; both have strong career placement. The right choice depends on your field, career goals, and lifestyle preferences.',
        blocks: [
          {
            type: 'table',
            caption: 'Shanghai vs Beijing for international students',
            columns: ['Factor', 'Shanghai', 'Beijing'],
            rows: [
              ['Top universities', 'SJTU + Fudan + Tongji', 'Tsinghua + Peking + Renmin'],
              ['Cost of living', '¥3,000-4,500/mo (higher)', '¥2,500-3,500/mo'],
              ['International community', 'Larger (200K+)', 'Smaller (~100K)'],
              ['Career focus', 'Finance, MNC, tech', 'Government, policy, state-owned'],
              ['Climate', 'Hot humid summer + mild damp winter', 'Dry cold winter + hot dry summer'],
              ['Air quality', 'Better (coastal city)', 'Variable (inland + industrial)'],
              ['English accessibility', 'Highest', 'High'],
              ['Best for careers in', 'Finance, consulting, tech, design', 'Government, policy, state-owned, tech'],
              ['Best for students in', 'Business, engineering, design, IR, finance', 'Engineering, CS, policy, sciences, Chinese'],
              ['Visa runs', 'Hong Kong + Japan + Korea (cheap)', 'Hong Kong + Mongolia + Russia (cheaper)'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: pick Shanghai if your career target is finance / consulting / tech / design. Pick Beijing if your career is government / policy / Chinese studies / sciences. Both have strong research universities + international communities.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Which is the best university in Shanghai?',
        a: 'For most international students: Shanghai Jiao Tong University (SJTU) and Fudan University are tied for the top. SJTU is stronger in engineering + medicine; Fudan is stronger in humanities + international relations. Both are C9 League universities (China\'s top 9 research universities) and rank in QS World top-50.',
      },
      {
        q: 'How many international students study in Shanghai?',
        a: 'Approximately 80,000-100,000 international students study in Shanghai universities each year, with the largest concentrations at SJTU (~8,000 international students), Fudan (~7,000), Tongji (~6,000), and ECNU (~5,000). At master\'s level at SJTU + Fudan, international students make up 30-50% of cohorts.',
      },
      {
        q: 'Cost of living in Shanghai for students?',
        a: '¥3,000-4,500/month covers housing + food + transport + phone + entertainment for a frugal-to-comfortable student budget. Add tuition ¥18,000-50,000/year depending on program. Total all-in budget: ¥80,000-130,000/year (USD 11,300-18,300). PhD students at top Shanghai universities typically have full funding packages that cover all costs.',
      },
      {
        q: 'Which Shanghai universities teach in English?',
        a: 'All top-6 Shanghai universities teach many master\'s programs in English. SJTU is strongest for engineering/CS; Fudan for humanities/social sciences/business; Tongji for architecture/design. ShanghaiTech is the only university with all programs in English by default. Bachelor\'s programs in English are limited (most are Chinese-medium); check the SICA /programs catalog for the specific English-medium list.',
      },
      {
        q: 'Is Shanghai safe for international students?',
        a: 'Yes — Shanghai is one of the safest major cities in the world. Violent crime against foreigners is extremely rare. Petty crime (bag-snatching, pickpocketing) is uncommon in university areas. Public infrastructure (metro, buses) is well-patrolled. The main safety risks: traffic accidents (look both ways!), and air quality issues during winter smog episodes. Police help is available in English in central districts.',
      },
      {
        q: 'Should I pick Shanghai or Beijing for studying in China?',
        a: 'Pick Shanghai if your career target is finance / consulting / tech / design / engineering. Pick Beijing if your career is government / policy / state-owned enterprises / Chinese studies / sciences. Shanghai has the larger international community + better climate for most students. Beijing has more prestigious universities (Tsinghua + Peking are both top 2 in China) but a more demanding Mandarin-language environment.',
      },
      {
        q: 'Are there scholarships for Shanghai universities?',
        a: 'Yes — four types: (1) CSC scholarship — fully-funded, available at all Shanghai universities (~100 awards/year for Shanghai-bound students); (2) Shanghai municipal government scholarship — ¥20,000-60,000/year, applying directly to the Shanghai Education Commission; (3) University-specific scholarships — SJTU/Fudan/Tongji waive 50-100% of tuition for top applicants; (4) Confucius Institute Scholarship — for Chinese language year.',
      },
      {
        q: 'Can I work part-time in Shanghai as a student?',
        a: 'Yes — under the X1 student visa, you can work ≤20 hours/week on-campus with permission. Typical roles: library assistant, lab assistant, dorm RA, research assistant, Chinese-language tutor. Off-campus work is restricted but possible with prior approval. Many Shanghai-based MNCs and startups offer paid internships to current international students, but these typically need university + immigration approval.',
      },
    ],
    howToSteps: [
      {
        name: 'Identify your target field + career stage',
        text: 'Shanghai is strongest for: engineering (SJTU), humanities/IR/business (Fudan), architecture/design (Tongji), finance/economics (SUFE), Chinese medicine (SHUTCM). Match your target program to the university with the strongest program, not the highest overall ranking.',
      },
      {
        name: 'Compare tuition + cost of living vs other Tier 1 cities',
        text: 'Shanghai is 20-30% more expensive than Wuhan/Xi\'an/Changsha for living costs (¥3,000-4,500/mo vs ¥1,500-2,500/mo). Tuition is similar across Shanghai universities (¥18K-50K/year for English-medium programs). Plan your budget accordingly.',
      },
      {
        name: 'Confirm English-medium availability for your target program',
        text: 'Master\'s programs at SJTU + Fudan + Tongji + ECNU are widely available in English. Bachelor\'s programs in English are limited. PhD programs are available in English at all top-6 universities, subject to supervisor availability. Use the SICA /programs catalog to filter by language=English.',
      },
      {
        name: 'Check scholarship paths (CSC + Shanghai municipal + university)',
        text: 'CSC covers full tuition + stipend + dorm + airfare — apply January-April for September intake. Shanghai municipal scholarship (¥20K-60K/year) — apply directly to the Shanghai Education Commission by May. University-specific waivers (50-100% tuition) — automatic with admission; submit early for best chance.',
      },
      {
        name: 'Prepare the application package (9-6 months out)',
        text: 'Take language test (IELTS 6.0-6.5+ / TOEFL 80-90+). Draft personal statement / study plan / research proposal. Gather transcripts + recommendation letters + CV + health certificate. PhD applicants: contact potential supervisors 9-12 months ahead for pre-match.',
      },
      {
        name: 'Submit applications to 3-5 Shanghai universities in parallel',
        text: 'Shanghai has 6 strong universities + 4 specialized applied schools. Apply to 3-5 in parallel to maximize chances. Each application is separate (no centralized system). Rolling admissions start in November; top programs close by April for September intake.',
      },
      {
        name: 'Confirm admission + plan arrival',
        text: 'Most master\'s decisions arrive within 4-8 weeks. PhD decisions take 6-12 weeks (supervisor matching + committee review). After admission: apply for X1 visa, book travel to Shanghai (Pudong airport), reserve on-campus dorm (apply early — on-campus dorms fill by June).',
      },
      {
        name: 'Settle into Shanghai + activate student status',
        text: 'On arrival: register at the university\'s international student office. Apply for residence permit within 24 hours of entry. Open a Chinese bank account (Bank of China, ICBC). Get a local SIM card. Activate any scholarship funding. Join the international student association for community support.',
      },
    ],
    ctaTitle: 'Ready to study in Shanghai?',
    ctaSubtitle:
      'SICA counselors help you choose between SJTU, Fudan, Tongji, and other Shanghai universities, prepare your application package, and apply for CSC + Shanghai municipal + university-specific scholarships. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'Every Chinese university ranked by domestic ranking + QS World — the canonical 2026 ranking.',
      },
      {
        href: '/best-cities-china-international-students',
        label: 'Best cities in China for international students',
        description: 'Top China cities ranked by international student population + university quality + career opportunities.',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: 'Cost of living in China by city',
        description: 'City-by-city total cost (tuition + living) — Shanghai vs Beijing vs Tier 2 cities.',
      },
    ],
  },
  zh: {
    slug: 'best-universities-in-shanghai',
    eyebrow: '指南 · 上海',
    title: '2026 上海最好的大学（国际生）',
    description:
      '上海所有大学按国内排名 + QS 世界排名——学费、国际生人数、项目、奖学金、上海留学生活费。',
    subtitle:
      '上海是中国第一国际生生源城市——金融中心、全球科技中心、C9 联盟 + 多所强研究型大学所在地。下面是如何选对学校。',
    stats: [
      { value: '前 2', label: '中国国际生人数最多城市' },
      { value: '¥2.4-4 万/年', label: '平均本科学费' },
      { value: '¥3,000-4,500/月', label: '上海生活费' },
      { value: '实时', label: '下方排名上海大学数' },
    ],
    quickAnswer:
      '上海拥有 8-12 所强大学，分属 C9 联盟（上海交大、复旦）、双一流（同济、华东师大、上海大学、上海科技大学、华东理工大学）及应用型 / 医学院校（上海中医药大学、上海海事大学）。英文授课项目学费 ¥18,000-50,000/年；总预算（学费 + 住宿 + 生活费）¥80,000-130,000/年。上海是中国最国际化的城市——顶尖上海大学硕士项目中 30-50% 是国际生。多数项目有英文授课，城市国际化基础设施（外籍社区、英语友好的公共服务、世界级医疗）使其成为外国学生最容易安顿的中国城市。',
    keyTakeaways: [
      '上海交大 + 复旦是中国国际生前 5 名 C9 联盟高校',
      '同济 + 华东师大为双一流 + 全球认可',
      '英文授课项目学费 ¥18,000-50,000/年',
      '上海生活费 ¥3,000-4,500/月（一线城市）',
      '顶尖上海大学硕士项目国际生占比 30-50%',
      '最强学科：工程、商科、计算机、国际关系、医学、设计',
    ],
    sections: [
      {
        id: 'why-shanghai',
        h2: '为什么选择上海？',
        intro:
          '上海汇聚三件其他中国城市所无之物：C9 联盟大学集群（上海交大 + 复旦）、深厚的国际社区（200,000+ 国际居民）、跨国与中国科技巨头就业机会。它是寻求全球化中国体验的国际生的默认选择。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**大学质量**——上海拥有中国前 5 名大学中的两所（上海交大 + 复旦）及 4-6 所其他双一流高校。除北京外无其他中国城市有此密度的世界级机构。',
              '**国际社区**——上海拥有 200,000+ 国际居民（中国最大外籍社区）。顶尖上海大学硕士项目 30-50% 为国际生。英语友好基础设施：国际部医院、英文地铁、办理国际汇款的银行。',
              '**就业机会**——上海是中国金融之都（上海证券交易所所在地，多数外资银行中国总部，多数中国科技公司第二总部）。实习 + 毕业后就业最强。',
              '**城市品质**——上海是全球城市，世界级餐饮、博物馆、夜生活、交通、医疗。生活质量与香港、东京、新加坡媲美。多数国际生觉得上海比其他中国城市更适合日常居住。',
              '**英语便利度**——上海在中国大陆拥有最高密度的英语中文使用者。餐厅、医院、银行、政府办公室常配英语员工。日常生活只需少量中文。',
              '**交通连接**——上海浦东机场是亚洲最大国际枢纽，直飞 100+ 城市。去香港、日本、韩国、新加坡的签证旅行便利便宜。',
            ],
          },
          {
            type: 'h3',
            text: '需要权衡的方面',
            body:
              '三个诚实权衡：（1）成本——上海是中国最贵的学生城市（生活费 ¥3,000-4,500/月 vs 二线城市 ¥1,500-2,500）。比武汉或西安高 30-50%；（2）距离政治中心较远——北京有部委、央企、智库。如果你的职业是政策 / 国际关系 / 政府导向，北京胜过上海；（3）气候——夏季酷热潮湿（35-40°C 高湿）。冬季温和但潮。春秋宜人。',
          },
        ],
      },
      {
        id: 'shanghai-universities',
        h2: '上海大学排名',
        intro:
          '上海拥有 8-12 所强大学服务国际生。前 6 所世界一流（C9 联盟或双一流）；后 4-6 所是强应用型 / 医学 / 设计院校，国际项目发展迅速。',
        blocks: [
          {
            type: 'table',
            caption: '上海顶尖大学按国内排名',
            columns: ['大学', '层级', '建校年份', '最强学科'],
            rows: [
              ['上海交通大学', 'C9 联盟', '1896', '工程（机械、电子、船舶）、医学、商科（安泰 MBA）'],
              ['复旦大学', 'C9 联盟', '1905', '文科、理科、医学、国际关系、新闻'],
              ['同济大学', '双一流', '1907', '工程（建筑、汽车）、土木、环境、设计'],
              ['华东师范大学', '双一流', '1951', '教育、语言、心理、理科'],
              ['华东理工大学', '双一流', '1952', '化工、材料、能源'],
              ['上海大学', '双一流', '1922', '工程、理科、商科、艺术'],
              ['上海科技大学', '双一流（新）', '2013', '理科、AI、生物医学、材料（全英文授课）'],
              ['上海中医药大学', '强应用型', '1956', '中医药、针灸、中西医结合'],
              ['上海海事大学', '强应用型', '1909', '海事工程、物流、国际商务'],
              ['上海财经大学', '强应用型', '1917', '金融、经济、会计、税务'],
              ['上海外国语大学', '强应用型', '1949', '外语、翻译、国际关系'],
              ['上海音乐学院', '强应用型', '1927', '音乐表演、作曲'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '上海科技大学是特殊情况：所有项目默认英文授课，研究导向本科模式与小班（师生比 ~8:1）。想要全英文 + 研究密集体验的国际生首选。',
          },
        ],
      },
      {
        id: 'shanghai-universities-table',
        h2: 'SICA 目录中所有上海大学',
        intro:
          'SICA 实时数据库中所有位于上海的大学——筛选 city=Shanghai 并按最低（= 最好）国内排名排序。',
        blocks: [
          {
            type: 'table',
            caption: '上海大学（国际生）（实时目录）',
            columns: ['#', '大学', '类型', '建校年份', '学生数', '国际生'],
            rows: [['(从 SICA 数据库加载中…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '前 6 所上海大学（上交、复旦、同济、华东师大、华东理工、上大）世界一流 + 双一流。后 6 所专攻应用领域（中医药、海事、金融、外语、音乐）。联系 SICA 了解哪所上海学校最适合你的目标项目。',
          },
        ],
      },
      {
        id: 'cost-shanghai',
        h2: '上海留学费用',
        intro:
          '上海是中国最贵的学生城市。国际生总预算 ¥80,000-130,000/年——比二线城市（武汉、西安、长沙）高 20-30%。下面是真实明细。',
        blocks: [
          {
            type: 'table',
            caption: '上海年度留学费用（¥/年，美元/年）',
            columns: ['项目', '预算档 1（舒适）', '预算档 2（节俭）', '备注'],
            rows: [
              ['学费（本科英文授课）', '32,000', '18,000', '区间：18K-50K 因项目'],
              ['学费（硕士英文授课）', '40,000', '25,000', '上交 / 复旦硕士项目 20-40K'],
              ['校内住宿（单人间）', '12,000', '6,000', '上交 + 复旦默认单人间'],
              ['校外公寓（合租）', '36,000+', '24,000', '校园附近 ¥3,000-6,000/月'],
              ['餐饮（校园食堂）', '14,400', '7,200', '¥20-40/餐 × 每日三餐'],
              ['餐饮（混合外出）', '24,000', '12,000', '上海有世界级国际餐厅'],
              ['交通（地铁 + 公交）', '1,800', '600', '上海地铁：¥3-8/次'],
              ['手机 + 网络', '1,200', '600', '¥50-100/月'],
              ['教材 + 学习用品', '1,500', '500', '第一年可能更多'],
              ['个人 + 娱乐', '6,000', '3,000', '¥250-500/月'],
              ['签证 + 保险', '1,000', '800', '第一年较高（JW202 办理）'],
              ['本科总费用', '89,900', '50,700', '美元：$12,700-7,200'],
              ['硕士总费用', '97,900', '57,700', '美元：$13,800-8,100'],
              ['博士总费用（带资助）', '10,000-15,000（津贴盈余）', '同', '资助通常覆盖所有费用'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '上海大学的博士生通常有资助包（CSC + 院校追加 + 导师项目），月津贴合计 ¥5,000-7,000——完全覆盖所有生活费还有盈余。',
          },
        ],
      },
      {
        id: 'programs-shanghai',
        h2: '上海大学的热门项目',
        intro:
          '上海大学各有所长。下面逐项目拆解每所上海大学的强项。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**工程（机械、电子、船舶、汽车）**——上海交大（XJTU/SJTU）是工程历史第一。前身为南洋公学（1896），培养出中国许多顶级工程师。上海最强工程院校：上海交大 > 同济 > 华东理工。',
              '**商科 / 金融 / MBA**——中欧国际工商学院（CEIBS，位于上海但与欧盟伙伴合办）是全球前 5 名 MBA。上海交大安泰是中国大陆顶级 MBA（FT 中国常年排前 3）。上海财经大学是顶级金融本硕院校。',
              '**计算机 / AI**——上海交大有中国前 3 的 CS 项目（尤其强计算机体系 + 系统）。复旦 + 上科大在 AI 崛起迅速。三校均有英文授课硕士项目，国际生比例高。',
              '**医学 / 临床医学**——上海交大医学院（原上海二医大）是中国顶尖医学院。复旦上海医学院紧随其后。上海拥有最多顶级医院（瑞金、华山、中山）。',
              '**国际关系 / 政治学**——复旦大学是公认中国第一 IR 院校。培养出许多中国资深外交官与政策顾问。',
              '**建筑 / 城市规划**——同济是中国第一建筑 + 城市规划院校（全球前 20）。与国际实践（哈佛 GSD、MIT、苏黎世联邦理工）有密切联系。',
              '**设计 / 工业设计**——同济设计创意学院是中国大陆顶尖设计院校（国际师资、英文授课硕士项目）。',
              '**中医药**——上海中医药大学是中国顶尖中医药大学，国际项目强（5 年中医药本科 + 针灸 + 中西医结合）。',
              '**金融 + 经济**——上海财经大学（SUFE）是中国顶级财经院校。在中国银行 + 证券公司的就业极强。',
              '**文科 / 人文**——复旦拥有人文社科最强集群（哲学、历史、文学、语言、新闻）。',
            ],
          },
        ],
      },
      {
        id: 'shanghai-vs-beijing',
        h2: '上海 vs 北京：哪个城市更适合国际生？',
        intro:
          '北京与上海是国际生在中国的两大主导目的地，均有多所世界级大学与强大就业。选哪个取决于你的领域、职业目标、生活方式偏好。',
        blocks: [
          {
            type: 'table',
            caption: '上海 vs 北京（国际生对比）',
            columns: ['维度', '上海', '北京'],
            rows: [
              ['顶尖大学', '上交 + 复旦 + 同济', '清华 + 北大 + 人大'],
              ['生活费', '¥3,000-4,500/月（高）', '¥2,500-3,500/月'],
              ['国际社区', '更大（200K+）', '较小（~100K）'],
              ['就业重心', '金融、MNC、科技', '政府、政策、央企'],
              ['气候', '夏酷热湿 + 冬温和潮', '冬干冷 + 夏干热'],
              ['空气质量', '较好（沿海）', '变化大（内陆工业）'],
              ['英语便利度', '最高', '高'],
              ['适合职业', '金融、咨询、科技、设计', '政府、政策、央企、科技'],
              ['适合学生方向', '商科、工程、设计、IR、金融', '工程、CS、政策、理科、中文'],
              ['签证旅行', '香港 + 日本 + 韩国（便宜）', '香港 + 蒙古 + 俄罗斯（更便宜）'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：若职业目标是金融 / 咨询 / 科技 / 设计，选上海。若职业是政府 / 政策 / 央企 / 中文研究 / 理科，选北京。两者都有强研究型大学 + 国际社区。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '上海最好的大学是哪所？',
        a: '对多数国际生：上海交大与复旦并列第一。上交在工程 + 医学更强；复旦在人文 + 国际关系更强。两所都是 C9 联盟（中国前 9 名研究型大学），QS 世界排名前 50。',
      },
      {
        q: '上海有多少国际生？',
        a: '每年约 80,000-100,000 国际生在上海大学就读，最大集中在上交（约 8,000 国际生）、复旦（约 7,000）、同济（约 6,000）、华东师大（约 5,000）。上交 + 复旦硕士层面国际生占 30-50%。',
      },
      {
        q: '上海学生生活费多少？',
        a: '¥3,000-4,500/月覆盖住宿 + 餐饮 + 交通 + 手机 + 娱乐（节俭至舒适学生预算）。加学费 ¥18,000-50,000/年因项目。总预算：¥80,000-130,000/年（11,300-18,300 美元）。顶尖上海大学的博士生通常有全额资助包覆盖所有费用。',
      },
      {
        q: '上海哪些大学英文授课？',
        a: '所有前 6 所上海大学许多硕士项目为英文授课。上交在工程 / CS 最强；复旦在人文 / 社科 / 商科最强；同济在建筑 / 设计最强。上海科技大学是唯一默认所有项目英文授课的大学。英文授课本科有限（多数为中文）；查询 SICA /programs 目录具体英文项目列表。',
      },
      {
        q: '上海对国际生安全吗？',
        a: '是——上海是世界上最安全的主要城市之一。针对外国人的暴力犯罪极少。大学区小偷小摸罕见。公共交通（地铁、公交）有良好巡逻。主要安全风险：交通事故（注意看路！）+ 冬季雾霾期空气质量问题。中央区域有英文警务协助。',
      },
      {
        q: '上海还是北京？',
        a: '若职业目标是金融 / 咨询 / 科技 / 设计 / 工程，选上海。若是政府 / 政策 / 央企 / 中文研究 / 理科，选北京。上海国际社区更大 + 大多数学生气候更宜。北京更负盛名的大学更多（清华 + 北大均为中国前 2）但中文环境更苛刻。',
      },
      {
        q: '上海大学有奖学金吗？',
        a: '有——四种：（1）CSC 奖学金——全额，所有上海大学可得（每年 ~100 名额给上海）；（2）上海市政府奖学金——¥20,000-60,000/年，直接向上海市教委申请；（3）院校专项奖学金——上交 / 复旦 / 同济为顶尖申请者减免 50-100% 学费；（4）孔子学院奖学金——给中文语言年。',
      },
      {
        q: '上海读国际生能兼职吗？',
        a: '能——持 X1 学生签证经学校批准可做 ≤20 小时/周校内兼职。常见岗位：图书馆助理、实验室助理、宿舍 RA、研究助理、中文家教。校外工作受限但可申请提前批准。许多上海 MNC 与创业公司向在读国际生提供带薪实习，但通常需大学 + 移民局批准。',
      },
    ],
    howToSteps: [
      {
        name: '确定目标领域 + 职业阶段',
        text: '上海最强：工程（上交）、人文 / IR / 商科（复旦）、建筑 / 设计（同济）、金融 / 经济（上财）、中医药（上中医）。将目标项目匹配到最强项目的大学，而非最高整体排名。',
      },
      {
        name: '对比学费 + 生活费 vs 其他一线城市',
        text: '上海生活费比武汉 / 西安 / 长沙高 20-30%（¥3,000-4,500/月 vs ¥1,500-2,500/月）。各校学费相近（英文授课项目 ¥18K-50K/年）。相应规划预算。',
      },
      {
        name: '确认目标项目英文授课可得性',
        text: '上交 + 复旦 + 同济 + 华东师大的硕士项目广泛有英文授课。英文本科有限。博士项目在前 6 所均英文可得，视导师可得性而定。用 SICA /programs 目录按 language=English 筛选。',
      },
      {
        name: '查奖学金路径（CSC + 上海市政府 + 院校）',
        text: 'CSC 覆盖全额学费 + 津贴 + 住宿 + 机票——9 月入学请 1-4 月申请。上海市政府奖学金（¥20K-60K/年）——直接向上海市教委 5 月前申请。院校减免（50-100% 学费）——随入学自动；尽早提交以获最佳机会。',
      },
      {
        name: '提前 9-6 个月准备申请包',
        text: '考语言（雅思 6.0-6.5+ / 托福 80-90+）。起草个人陈述 / 学习计划 / 研究计划。收集成绩单 + 推荐信 + 简历 + 健康证明。博士生：提前 9-12 个月联系潜在导师以预匹配。',
      },
      {
        name: '并行申请 3-5 所上海大学',
        text: '上海拥有 6 所强大学 + 4 所专业应用型院校。并行申请 3-5 所以最大化机会。各申请独立（无集中系统）。滚动录取从 11 月开始；顶尖项目 4 月截止 9 月入学。',
      },
      {
        name: '确认录取 + 规划抵沪',
        text: '多数硕士决定 4-8 周内到达。博士决定需 6-12 周（导师匹配 + 委员会评审）。录取后：申请 X1 签证、订飞往上海的机票（浦东机场）、预订校内住宿（尽早申请——校内住宿 6 月前满）。',
      },
      {
        name: '安顿上海 + 激活学生身份',
        text: '抵沪后：在大学国际学生办公室注册。入境 24 小时内申请居留许可。开中国银行账户（中行、工行）。办本地手机卡。激活任何奖学金资助。加入国际学生协会获取社区支持。',
      },
    ],
    ctaTitle: '准备好在上海留学了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你对比上交、复旦、同济等上海大学、准备申请包、并申请 CSC + 上海市政府 + 院校专项奖学金。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '所有中国大学按国内排名 + QS 世界排名——2026 标准排名表。',
      },
      {
        href: '/best-cities-china-international-students',
        label: '中国最好的留学城市',
        description: '中国顶尖城市按国际生人数 + 大学质量 + 就业排名。',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: '中国各城市生活费',
        description: '逐城市总费用（学费 + 生活费）——上海 vs 北京 vs 二线城市。',
      },
    ],
  },
};
