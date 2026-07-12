import type { LocalizedGuide } from './types';

/**
 * "Best Universities in Beijing for International Students" — long-form
 * listicle. Target queries: "best universities beijing", "study in
 * beijing", "beijing universities for international students", "beijing
 * university ranking", "tsinghua vs beijing normal", "beijing cost of
 * living students".
 *
 * Page wrapper fetches the live university list and filters to
 * city=Beijing (case-insensitive), sorted by ranking. Injects into the
 * `beijing-universities-table` block at render time.
 */
export const bestBeijingUniversitiesGuide: LocalizedGuide = {
  en: {
    slug: 'best-universities-in-beijing',
    eyebrow: 'GUIDE · BEIJING',
    title: 'Best Universities in Beijing for International Students (2026)',
    description:
      'Every Beijing university ranked by domestic ranking + QS World — tuition, international student population, programs, scholarships, and cost of living for students in Beijing.',
    subtitle:
      "Beijing is China's capital + political center + top-2 international student destination. It hosts the two best universities in the country (Tsinghua + Peking) and 6+ other world-class institutions. Here's how to pick the right one for your field.",
    stats: [
      { value: 'TOP 1', label: 'Best universities cluster in China' },
      { value: '¥22-40K/yr', label: 'Average tuition (undergrad)' },
      { value: '¥2,500-3,500/mo', label: 'Living cost in Beijing' },
      { value: 'LIVE', label: 'Beijing universities ranked below' },
    ],
    quickAnswer:
      "Beijing is home to 15+ strong universities across C9 League (Peking, Tsinghua, Renmin), Double First-Class (Beihang, Beijing Institute of Technology, Beijing Normal, China Agricultural University, Beijing University of Chemical Technology, Beijing Jiaotong, China University of Geosciences, Beijing University of Posts and Telecommunications, Beijing Forestry), and applied/medical schools (Capital Medical, Beijing University of Chinese Medicine, Communication University of China, Beijing Sport University, Central Academy of Fine Arts, Central Conservatory of Music). Tuition runs ¥18,000-50,000/year for English-medium programs; total all-in budget (tuition + dorm + living) is ¥70,000-110,000/year — slightly cheaper than Shanghai. Beijing has the most prestigious universities in the country (Tsinghua + Peking are both top 30 globally), the strongest government/IR/policy programs, and the most Chinese-speaking environment of any major city (less English-friendliness than Shanghai but more immersive).",
    keyTakeaways: [
      'Tsinghua + Peking are C9 League + top 30 globally — the most prestigious universities in mainland China',
      'Beihang, BIT, BNU, Renmin, USTB are Double First-Class — strong in engineering, sciences, education',
      'Tuition ¥18,000-50,000/year for English-medium programs',
      'Living cost ¥2,500-3,500/month in Beijing (cheaper than Shanghai)',
      'Strongest programs: Engineering, CS, Sciences, Government, IR, Education, Medicine, Chinese Studies',
      'Beijing is the political center — best for careers in government, SOE, think tanks, policy',
      'Most Chinese-language environment of any Tier 1 city — best for students prioritizing Chinese fluency',
    ],
    sections: [
      {
        id: 'why-beijing',
        h2: 'Why Beijing for international students?',
        intro:
          'Beijing combines three things no other Chinese city does: the two most prestigious universities in the country (Tsinghua + Peking, both top 30 globally), the seat of political power (central government, ministries, state-owned enterprises), and the deepest cultural heritage (Forbidden City, Great Wall, Summer Palace, hutong neighborhoods). For students targeting government careers, policy work, or top-tier research, Beijing is the clear default.',
        blocks: [
          {
            type: 'ul',
            items: [
              "**University quality** — Beijing hosts the two most prestigious universities in mainland China (Tsinghua + Peking), both ranked in the global top 30. No other Chinese city has this concentration of world-class institutions, including 4 additional Double First-Class universities in central Beijing alone (Beihang, BIT, Renmin, BNU).",
              "**Political + policy center** — Beijing is the seat of the central government, all major ministries, the State Council, the National People's Congress, and 80+ of the 100 largest state-owned enterprises. If your career is government, policy, IR, or law, Beijing has unmatched placement.",
              "**Cultural heritage** — Beijing has more UNESCO World Heritage Sites than any other city (Forbidden City, Great Wall, Temple of Heaven, Summer Palace, Ming Tombs). Living here is a daily exposure to 3,000+ years of Chinese history.",
              "**Most international community after Shanghai** — 100,000+ international residents, the second-largest expat community in mainland China. International students at top Beijing universities number 4,000-8,000 per school.",
              "**Career opportunities** — Beyond government + SOE, Beijing hosts ByteDance, JD, Meituan, Lenovo, Xiaomi, the Chinese Academy of Sciences, and most of China's top think tanks. Strong internship + post-graduation placement in tech, research, policy.",
              "**English accessibility** — Lower than Shanghai, higher than Wuhan/Xi'an. Most universities have English-speaking staff; central Beijing restaurants and hotels have English menus. Daily life requires more Chinese than Shanghai but less than Tier 2 cities.",
            ],
          },
          {
            type: 'h3',
            text: 'Trade-offs to consider',
            body:
              "Three honest trade-offs: (1) Air quality — Beijing has historically had worse air quality than coastal cities, though it has improved dramatically since 2013. Winter smog episodes (December-February) can still hit AQI 200+. (2) Climate — dry cold winters (-10 to 0°C) and hot dry summers (30-38°C). Spring sandstorms in April. (3) Cost — slightly cheaper than Shanghai but still 30-40% more expensive than Tier 2 cities.",
          },
        ],
      },
      {
        id: 'beijing-universities',
        h2: 'Beijing universities ranked',
        intro:
          'Beijing has 15+ strong universities serving international students. The top 2 (Tsinghua + Peking) are world-class; the next 4-6 are Double First-Class powerhouses; the rest are strong applied/medical/arts schools with growing international programs.',
        blocks: [
          {
            type: 'table',
            caption: 'Top Beijing universities by domestic ranking',
            columns: ['University', 'Tier', 'Founded', 'Strongest fields'],
            rows: [
              ['Tsinghua University', 'C9 League, top 1 China', '1911', 'Engineering (all), CS, AI, Architecture, Sciences, Public Policy'],
              ['Peking University', 'C9 League, top 2 China', '1898', 'Liberal arts, Sciences, Medicine, IR, Economics, Law, Chinese Studies'],
              ['Renmin University of China', 'C9 League (top-tier)', '1937', 'Economics, Finance, Law, Sociology, Public Administration, Journalism'],
              ['Beihang University (BUAA)', 'Double First-Class', '1952', 'Aerospace, Mechanical, Materials, CS, Instrumentation'],
              ['Beijing Institute of Technology (BIT)', 'Double First-Class', '1940', 'Mechanical, Materials, CS, Weapon Sciences, Vehicle Engineering'],
              ['Beijing Normal University (BNU)', 'Double First-Class', '1902', 'Education, Psychology, Chinese Linguistics, Geography, Sciences'],
              ['China Agricultural University', 'Double First-Class', '1905', 'Agriculture, Veterinary, Food Science, Biology, Environmental Engineering'],
              ['University of Science and Technology Beijing (USTB)', 'Double First-Class', '1952', 'Materials Science, Metallurgy, Mining, Mechanical Engineering'],
              ['Beijing University of Chemical Technology', 'Double First-Class', '1958', 'Chemical Engineering, Materials, Safety Science'],
              ['Beijing Jiaotong University', 'Double First-Class', '1896', 'Transportation, Civil Engineering, Electrical, Information, Management'],
              ['China University of Geosciences (Beijing)', 'Double First-Class', '1952', 'Geology, Earth Sciences, Environmental, Resources Engineering'],
              ['Beijing University of Posts and Telecommunications (BUPT)', 'Double First-Class', '1955', 'Telecommunications, Information Engineering, CS, AI'],
              ['Beijing Forestry University', 'Double First-Class', '1952', 'Forestry, Landscape Architecture, Wood Science, Environmental'],
              ['Capital Medical University', 'Strong applied', '1960', 'Clinical Medicine, Public Health, Neurology, Cardiology'],
              ['Beijing University of Chinese Medicine', 'Strong applied', '1956', 'Traditional Chinese Medicine, Acupuncture, Chinese Pharmacy'],
              ['Communication University of China (CUC)', 'Strong applied', '1954', 'Journalism, Broadcasting, Communication, Film & TV'],
              ['Central Academy of Fine Arts (CAFA)', 'Top applied', '1918', 'Fine Arts, Design, Architecture, Art Theory'],
              ['Central Conservatory of Music', 'Top applied', '1950', 'Music Performance, Composition, Musicology'],
              ['Beijing Sport University', 'Top applied', '1953', 'Sports Science, Physical Education, Athletic Training'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Tsinghua and Peking are not just the best in Beijing — they are the most prestigious in mainland China, both ranked in the global top 30. Admission is highly competitive (acceptance rates <5% for international students at the undergrad level, ~10% for master\'s). Plan your application 12+ months ahead for these two.',
          },
        ],
      },
      {
        id: 'beijing-universities-table',
        h2: 'All Beijing universities in the SICA catalog',
        intro:
          'Every Beijing-based university in the SICA live database — filtered to city=Beijing and sorted by lowest (= best) domestic ranking. Use this for the canonical up-to-date list.',
        blocks: [
          {
            type: 'table',
            caption: 'Beijing universities for international students (live catalog)',
            columns: ['#', 'University', 'Type', 'Established', 'Students', 'Intl students'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Top 2 (Tsinghua + Peking) are the most prestigious in mainland China. The next 5 (Renmin, Beihang, BIT, BNU, USTB) are top-tier research universities. The remaining 10+ specialize in applied fields (medicine, journalism, art, music, sports). Talk to SICA about which Beijing school is the best fit for your target program.',
          },
        ],
      },
      {
        id: 'cost-beijing',
        h2: 'Cost of studying in Beijing',
        intro:
          "Beijing is China's second most expensive student city (after Shanghai). Total all-in budget for international students runs ¥70,000-110,000/year — about 10-20% cheaper than Shanghai but 30-50% more expensive than Tier 2 cities (Wuhan, Xi'an, Changsha). Here is the realistic breakdown.",
        blocks: [
          {
            type: 'table',
            caption: 'Annual cost of studying in Beijing (¥/year, USD/year)',
            columns: ['Item', 'Budget tier 1 (comfortable)', 'Budget tier 2 (frugal)', 'Notes'],
            rows: [
              ['Tuition (English-medium undergrad)', '30,000', '18,000', 'Range: 18K-50K depending on program'],
              ['Tuition (English-medium master)', '38,000', '25,000', 'Tsinghua/Peking master\'s programs run 25-45K'],
              ['On-campus dorm (single)', '10,000', '6,000', 'Tsinghua + Peking dorms are well-maintained'],
              ['Off-campus apartment (shared)', '30,000+', '18,000', '¥2,500-5,000/month near Haidian/Wudaokou'],
              ['Food (campus cafeteria)', '12,000', '6,000', '¥20-35/meal × 3 meals/day'],
              ['Food (eating out mix)', '20,000', '10,000', 'Beijing has strong international dining scene'],
              ['Transport (metro + bus + bike)', '1,500', '500', 'Beijing Metro: ¥3-9 per ride'],
              ['Phone + internet', '1,200', '600', '¥50-100/month'],
              ['Books + supplies', '1,500', '500', 'Year 1 may need more'],
              ['Personal + entertainment', '5,000', '3,000', '¥250-500/month'],
              ['Visa + insurance', '1,000', '800', 'Year 1 higher (JW202 processing)'],
              ['TOTAL UNDERGRAD (all-in)', '83,200', '47,400', 'USD: $11,700-6,700'],
              ['TOTAL MASTER\'S (all-in)', '91,200', '54,400', 'USD: $12,800-7,650'],
              ['TOTAL PhD (with funding)', '10,000-15,000 (stipend surplus)', 'Same', 'Funding typically covers all costs'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'PhD students at Tsinghua + Peking typically have funding packages (CSC + university top-up + supervisor grant) totaling ¥5,000-7,000/month in stipends — fully covering all living costs and generating surplus.',
          },
        ],
      },
      {
        id: 'programs-beijing',
        h2: 'Popular programs at Beijing universities',
        intro:
          'Beijing universities excel in specific disciplines. Here is the program-by-program breakdown of where each Beijing university is strongest.',
        blocks: [
          {
            type: 'ul',
            items: [
              "**Engineering (mechanical, electronic, civil, materials)** — Tsinghua is the consensus #1 engineering school in China (top 15 globally). Beihang is #1 for aerospace + aeronautics. BIT is top-3 for weapons + vehicle engineering. USTB is #1 for metallurgy + materials science.",
              "**Computer Science / AI** — Tsinghua's CS department is the strongest in China (top 20 globally), especially in AI + systems. Peking is a close #2. Both have English-medium master's programs with strong international student ratios.",
              "**Sciences (Physics, Chemistry, Biology, Math)** — Peking is the consensus #1 for natural sciences in China (Tsinghua is #2). Both rank in the global top 30 for physics + math.",
              "**Economics / Finance / Public Policy** — Peking's economics + finance programs are top-3 in China. Renmin University of China is the #1 public policy + economics school (the training ground for senior Chinese government economists). Tsinghua's School of Public Policy + Economics is #2 (Tsinghua's Schwarzman Scholars is the top public-policy master's program globally for international students).",
              "**International Relations / Political Science** — Peking + Renmin are the top IR/political science schools in China. Both have produced many senior Chinese diplomats and policy advisors.",
              "**Law** — Peking is the #1 law school in China. Renmin is #2 (especially strong in civil + commercial law).",
              "**Chinese Studies / Sinology** — Peking is the global #1 destination for Chinese studies (most foreign Sinology scholars trace intellectual lineage to Peking faculty). The Yenching Academy is the top Chinese studies master's program globally for international students.",
              "**Medicine / Clinical Medicine** — Peking University Health Science Center (PUHSC, formerly Beijing Medical University) is the #1 medical school in China. Capital Medical University is the #1 specialized medical university.",
              "**Architecture / Urban Planning** — Tsinghua's School of Architecture is the top architecture program in mainland China (top 20 globally).",
              "**Education / Psychology** — Beijing Normal University (BNU) is the #1 education + psychology university in China. The school trains most of China's K-12 teachers and education researchers.",
              "**Traditional Chinese Medicine** — Beijing University of Chinese Medicine is the top TCM university in China (along with Shanghai TCM and Guangzhou TCM).",
              "**Journalism / Communication** — Communication University of China (CUC) is the #1 journalism + broadcasting university in China. The school trains most of China's CCTV anchors and media executives.",
              "**Fine Arts / Design** — Central Academy of Fine Arts (CAFA) is the top fine arts university in China (and top 5 in Asia).",
              "**Music** — Central Conservatory of Music is the top music university in China.",
            ],
          },
        ],
      },
      {
        id: 'beijing-vs-shanghai',
        h2: 'Beijing vs Shanghai: which city for international students?',
        intro:
          'Beijing and Shanghai are the two dominant destinations for international students in China. Both have multiple world-class universities; both have strong career placement. The right choice depends on your field, career goals, and lifestyle preferences.',
        blocks: [
          {
            type: 'table',
            caption: 'Beijing vs Shanghai for international students',
            columns: ['Factor', 'Beijing', 'Shanghai'],
            rows: [
              ['Top universities', 'Tsinghua + Peking + Renmin', 'SJTU + Fudan + Tongji'],
              ['Cost of living', '¥2,500-3,500/mo (lower)', '¥3,000-4,500/mo'],
              ['International community', 'Smaller (~100K)', 'Larger (200K+)'],
              ['Career focus', 'Government, policy, SOE, research', 'Finance, MNC, tech, design'],
              ['Climate', 'Dry cold winter + hot dry summer', 'Hot humid summer + mild damp winter'],
              ['Air quality', 'Variable (improving, occasional winter smog)', 'Better (coastal city)'],
              ['English accessibility', 'High', 'Highest'],
              ['Best for careers in', 'Government, policy, SOE, tech, Chinese studies', 'Finance, consulting, tech, design, business'],
              ['Best for students in', 'Engineering, CS, sciences, policy, Chinese, IR', 'Business, engineering, design, IR, finance'],
              ['Visa runs', 'Hong Kong + Mongolia + Russia (cheaper)', 'Hong Kong + Japan + Korea (cheap)'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: pick Beijing if your career target is government / policy / state-owned enterprises / top-tier research / Chinese studies. Pick Shanghai if your career is finance / consulting / tech / design / business. Beijing has the more prestigious universities (Tsinghua + Peking are both top 2 in China) and the more Chinese-language environment. Shanghai has the larger international community + better climate + slightly easier daily life.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Which is the best university in Beijing?',
        a: "For most international students: Tsinghua University and Peking University are tied for the top. Tsinghua is stronger in engineering + CS + architecture; Peking is stronger in humanities + sciences + international relations. Both are C9 League universities (China's top 9 research universities) and rank in QS World top-30 — the two most prestigious universities in mainland China.",
      },
      {
        q: 'How many international students study in Beijing?',
        a: 'Approximately 70,000-90,000 international students study in Beijing universities each year, with the largest concentrations at Tsinghua (~5,500 international students), Peking (~5,000), Renmin (~3,000), BNU (~2,800), and Beihang (~2,500). At master\'s level at Tsinghua + Peking, international students make up 20-40% of cohorts.',
      },
      {
        q: 'Cost of living in Beijing for students?',
        a: '¥2,500-3,500/month covers housing + food + transport + phone + entertainment for a frugal-to-comfortable student budget. Add tuition ¥18,000-50,000/year depending on program. Total all-in budget: ¥70,000-110,000/year (USD 9,900-15,500). PhD students at top Beijing universities typically have full funding packages that cover all costs.',
      },
      {
        q: 'Which Beijing universities teach in English?',
        a: 'All top-7 Beijing universities teach many master\'s programs in English. Tsinghua is strongest for engineering/CS; Peking for humanities/social sciences/sciences/IR; Renmin for economics/policy; BIT for engineering; Beihang for aerospace. Bachelor\'s programs in English are limited (most are Chinese-medium); check the SICA /programs catalog for the specific English-medium list.',
      },
      {
        q: 'Is Beijing safe for international students?',
        a: "Yes — Beijing is one of the safest major cities in the world. Violent crime against foreigners is extremely rare. Petty crime (bag-snatching, pickpocketing) is uncommon in university areas. Public infrastructure (metro, buses) is well-patrolled. The main safety risks: traffic accidents (look both ways!), and air quality issues during winter smog episodes. Police help is available in central districts; the central Haidian university district has an active English-speaking police liaison office.",
      },
      {
        q: 'Should I pick Beijing or Shanghai for studying in China?',
        a: "Pick Beijing if your career target is government / policy / state-owned enterprises / top-tier research / Chinese studies. Pick Shanghai if your career is finance / consulting / tech / design / business. Beijing has the more prestigious universities (Tsinghua + Peking are both top 2 in China) and the more Chinese-language environment. Shanghai has the larger international community + better climate + slightly easier daily life.",
      },
      {
        q: 'Are there scholarships for Beijing universities?',
        a: 'Yes — four types: (1) CSC scholarship — fully-funded, available at all Beijing universities (~150 awards/year for Beijing-bound students); (2) Beijing municipal government scholarship — ¥20,000-60,000/year, applying directly to the Beijing Education Commission; (3) University-specific scholarships — Tsinghua/Peking/BIT/Beihang waive 50-100% of tuition for top applicants; (4) Schwarzman Scholars (Tsinghua only) — fully-funded master\'s program in global affairs, US$80,000+ value, very competitive.',
      },
      {
        q: 'Can I work part-time in Beijing as a student?',
        a: "Yes — under the X1 student visa, you can work ≤20 hours/week on-campus with permission. Typical roles: library assistant, lab assistant, dorm RA, research assistant, Chinese-language tutor. Off-campus work is restricted but possible with prior approval. Beijing is the off-campus part-time pilot city — many Beijing-based MNCs and startups (ByteDance, JD, Lenovo) offer paid internships to current international students, but these typically need university + immigration approval.",
      },
    ],
    howToSteps: [
      {
        name: 'Identify your target field + career stage',
        text: 'Beijing is strongest for: engineering + CS (Tsinghua), sciences + IR + Chinese studies (Peking), economics + policy (Renmin), aerospace (Beihang), education + psychology (BNU), materials + metallurgy (USTB), journalism (CUC), fine arts (CAFA). Match your target program to the university with the strongest program, not the highest overall ranking.',
      },
      {
        name: 'Compare tuition + cost of living vs other Tier 1 cities',
        text: "Beijing is 10-20% cheaper than Shanghai for living costs (¥2,500-3,500/mo vs ¥3,000-4,500/mo) and 30-50% more expensive than Tier 2 cities. Tuition is similar across Beijing universities (¥18K-50K/year for English-medium programs). Plan your budget accordingly.",
      },
      {
        name: 'Confirm English-medium availability for your target program',
        text: "Master's programs at Tsinghua + Peking + BIT + Beihang + Renmin are widely available in English. Bachelor's programs in English are limited. PhD programs are available in English at all top-7 universities, subject to supervisor availability. Use the SICA /programs catalog to filter by language=English.",
      },
      {
        name: 'Check scholarship paths (CSC + Beijing municipal + university + Schwarzman)',
        text: 'CSC covers full tuition + stipend + dorm + airfare — apply January-April for September intake. Beijing municipal scholarship (¥20K-60K/year) — apply directly to the Beijing Education Commission by May. University-specific waivers (50-100% tuition) — automatic with admission; submit early for best chance. Schwarzman Scholars (Tsinghua) — separate application, US$80,000+ value, very competitive.',
      },
      {
        name: 'Prepare the application package (12-9 months out for Tsinghua/Peking)',
        text: 'Take language test (IELTS 6.5-7.0+ / TOEFL 95-100+ for Tsinghua/Peking; lower thresholds for other top schools). Draft personal statement / study plan / research proposal. Gather transcripts + recommendation letters + CV + health certificate. PhD applicants: contact potential supervisors 12-15 months ahead for pre-match.',
      },
      {
        name: 'Submit applications to 3-5 Beijing universities in parallel',
        text: 'Beijing has 7 strong universities + 12+ specialized applied schools. Apply to 3-5 in parallel to maximize chances. Each application is separate (no centralized system). Rolling admissions start in November; top programs close by April for September intake. Tsinghua + Peking close earlier than other Beijing schools.',
      },
      {
        name: 'Confirm admission + plan arrival',
        text: "Most master's decisions arrive within 4-8 weeks. PhD decisions take 6-12 weeks (supervisor matching + committee review). After admission: apply for X1 visa, book travel to Beijing (Capital International Airport or Daxing), reserve on-campus dorm (apply early — on-campus dorms fill by June, especially at Tsinghua + Peking).",
      },
      {
        name: 'Settle into Beijing + activate student status',
        text: "On arrival: register at the university's international student office. Apply for residence permit within 24 hours of entry. Open a Chinese bank account (ICBC, Bank of China, CCB). Get a local SIM card. Activate any scholarship funding. Join the international student association for community support. Get a Beijing transportation card (subway + bus).",
      },
    ],
    ctaTitle: 'Ready to study in Beijing?',
    ctaSubtitle:
      'SICA counselors help you choose between Tsinghua, Peking, Renmin, BIT, Beihang, and other Beijing universities, prepare your application package, and apply for CSC + Beijing municipal + Schwarzman + university-specific scholarships. Free initial consultation.',
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
        href: '/best-universities-in-shanghai',
        label: 'Best universities in Shanghai',
        description: 'Top Shanghai universities (SJTU, Fudan, Tongji + others) — tuition, programs, international community.',
      },
    ],
  },
  zh: {
    slug: 'best-universities-in-beijing',
    eyebrow: '指南 · 北京',
    title: '2026 北京最好的大学（国际生）',
    description:
      '北京所有大学按国内排名 + QS 世界排名——学费、国际生人数、项目、奖学金、北京留学生活费。',
    subtitle:
      '北京是中国的首都 + 政治中心 + 前2大国际生生源地。坐拥全国两所最好大学（清华+北大）以及6+所世界级院校。下面教你如何选对学校。',
    stats: [
      { value: '第 1', label: '中国大学最密集城市' },
      { value: '¥2.2-4 万/年', label: '平均本科学费' },
      { value: '¥2,500-3,500/月', label: '北京生活费' },
      { value: '实时', label: '下方排名北京大学数' },
    ],
    quickAnswer:
      '北京拥有15+所强大学，分属C9联盟（北大、清华、人大）、双一流（北航、北理、北师大、中国农大、北化工、北交、中地大、北邮、北林）及应用型/医学院校（首医、北中医、中传、首体、中央美院、中央音乐学院）。英文授课项目学费¥18,000-50,000/年；总预算（学费+住宿+生活费）¥70,000-110,000/年——比上海略便宜。北京有国内最负盛名的大学（清华+北大均进全球前30），最强的政府/国际关系/政策项目，最浓厚的中文环境（比上海英语友好度低，但沉浸度更高）。',
    keyTakeaways: [
      '清华+北大是C9联盟+全球前30——中国大陆最负盛名的两所大学',
      '北航、北理、北师大、人大、北科大是双一流——工科、理科、教育强',
      '英文授课项目学费¥18,000-50,000/年',
      '北京生活费¥2,500-3,500/月（比上海便宜）',
      '最强学科：工科、计算机、理科、政府、国际关系、教育、医学、汉学',
      '北京是政治中心——政府、国企、智库、政策职业的最佳起点',
      '一线城市里中文环境最浓——最看重中文流利度的学生首选',
    ],
    sections: [
      {
        id: 'why-beijing',
        h2: '为什么选择北京留学？',
        intro:
          '北京有三件其他中国城市没有的东西：中国最负盛名的两所大学（清华+北大，均QS前30）、政治权力中心（中央政府、各部委、国企）、最深厚的文化遗产（故宫、长城、颐和园、胡同）。目标是政府、政策、顶级研究的学生，北京是默认选择。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**大学质量**——北京坐拥中国大陆最负盛名的两所大学（清华+北大），均进全球前30。北京没有任何其他中国城市有这种集中度，包括在中心城区内的4所双一流（北航、北理、人大、北师大）。',
              '**政治+政策中心**——北京是中央政府、所有主要部委、国务院、全国人大所在地，以及中国100强国企中的80+总部。如果你的职业方向是政府、政策、国际关系、法律，北京有无可匹敌的就业渠道。',
              '**文化遗产**——北京的UNESCO世界遗产比任何其他城市都多（故宫、长城、天坛、颐和园、明十三陵）。住在这里是日常沉浸于3000+年中国历史。',
              '**仅次于上海的国际社区**——10万+国际居民，中国大陆第二大外籍社区。顶尖北京大学的国际生人数4,000-8,000人/校。',
              '**职业机会**——除政府+国企外，北京有字节跳动、京东、美团、联想、小米、中国科学院、中国大多数顶级智库。科技、研究、政策方向的实习+毕业后就业强劲。',
              '**英语可及性**——比上海低，比武汉/西安高。多数大学有英语服务人员；中心城区餐厅酒店有英文菜单。日常生活比上海需要更多中文，但比二线城市少。',
            ],
          },
          {
            type: 'h3',
            text: '需要考虑的取舍',
            body:
              '三个诚实取舍：（1）空气质量——北京历史上空气污染比沿海城市严重，2013年以来大幅改善，但冬季雾霾（12-2月）仍会到AQI 200+。（2）气候——干冷冬季（-10至0°C）和干热夏季（30-38°C）。4月春季沙尘暴。（3）成本——比上海略便宜但仍比二线城市高30-40%。',
          },
        ],
      },
      {
        id: 'beijing-universities',
        h2: '北京大学排名',
        intro:
          '北京有15+所强大学服务国际生。前2名（清华+北大）世界一流；接下来4-6所是双一流强校；其余是强应用型/医学/艺术院校，国际项目快速发展。',
        blocks: [
          {
            type: 'table',
            caption: '顶尖北京大学（按国内排名）',
            columns: ['大学', '层级', '创办年', '最强学科'],
            rows: [
              ['清华大学', 'C9联盟，中国Top 1', '1911', '工科（所有）、CS、AI、建筑、理科、公共政策'],
              ['北京大学', 'C9联盟，中国Top 2', '1898', '文科、理科、医学、国际关系、经济学、法学、汉学'],
              ['中国人民大学', 'C9联盟（顶级）', '1937', '经济学、金融、法学、社会学、公共管理、新闻'],
              ['北京航空航天大学（北航）', '双一流', '1952', '航空、机械、材料、计算机、仪器'],
              ['北京理工大学（北理工）', '双一流', '1940', '机械、材料、计算机、武器科学、车辆工程'],
              ['北京师范大学（北师大）', '双一流', '1902', '教育、心理学、汉语语言学、地理、理科'],
              ['中国农业大学', '双一流', '1905', '农学、兽医、食品科学、生物、环境工程'],
              ['北京科技大学（北科大）', '双一流', '1952', '材料科学、冶金、矿业、机械工程'],
              ['北京化工大学', '双一流', '1958', '化学工程、材料、安全科学'],
              ['北京交通大学（北交）', '双一流', '1896', '交通、土木、电气、信息、管理'],
              ['中国地质大学（北京）', '双一流', '1952', '地质、地球科学、环境、资源工程'],
              ['北京邮电大学（北邮）', '双一流', '1955', '电信、信息工程、计算机、AI'],
              ['北京林业大学（北林）', '双一流', '1952', '林业、园林、木材科学、环境'],
              ['首都医科大学', '强应用型', '1960', '临床医学、公共卫生、神经科、心脏科'],
              ['北京中医药大学', '强应用型', '1956', '中医、针灸、中药'],
              ['中国传媒大学（中传）', '强应用型', '1954', '新闻、广播、传播、影视'],
              ['中央美术学院（央美）', '顶尖应用型', '1918', '美术、设计、建筑、艺术理论'],
              ['中央音乐学院', '顶尖应用型', '1950', '音乐表演、作曲、音乐学'],
              ['北京体育大学（北体）', '顶尖应用型', '1953', '体育科学、体育教育、运动训练'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '清华和北大不仅北京最强——也是中国大陆最负盛名的两所大学，均进全球前30。录取竞争激烈（本科国际生录取率<5%，硕士~10%）。申请这两所提前12+个月规划。',
          },
        ],
      },
      {
        id: 'beijing-universities-table',
        h2: 'SICA目录中所有北京高校',
        intro:
          'SICA实时数据库中所有北京高校——按city=Beijing过滤，按最低（=最好）国内排名排序。下方为最新标准列表。',
        blocks: [
          {
            type: 'table',
            caption: '北京国际生高校（实时目录）',
            columns: ['#', '大学', '类型', '创办年', '学生数', '国际生数'],
            rows: [['(从SICA数据库加载…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '前2（清华+北大）是中国大陆最负盛名的大学。接下来的5所（人大、北航、北理工、北师大、北科大）是顶级研究型大学。其余10+所专注应用领域（医学、新闻、艺术、音乐、体育）。联系SICA了解哪所北京学校最适合你的目标项目。',
          },
        ],
      },
      {
        id: 'cost-beijing',
        h2: '北京留学费用',
        intro:
          '北京是中国第二贵留学城市（仅次于上海）。国际生年度总预算¥70,000-110,000——比上海便宜10-20%，但比二线城市贵30-50%。下面是真实明细。',
        blocks: [
          {
            type: 'table',
              caption: '北京年度留学费用（¥/年，USD/年）',
              columns: ['项目', '预算1档（宽裕）', '预算2档（节俭）', '备注'],
              rows: [
                ['本科学费（英文授课）', '30,000', '18,000', '范围：18K-50K视项目'],
                ['硕士学费（英文授课）', '38,000', '25,000', '清华/北大硕士项目25-45K'],
                ['校内宿舍（单人间）', '10,000', '6,000', '清华+北大宿舍条件好'],
                ['校外公寓（合租）', '30,000+', '18,000', '海淀/五道口附近¥2,500-5,000/月'],
                ['伙食（校内食堂）', '12,000', '6,000', '¥20-35/餐×3餐/天'],
                ['伙食（外食混合）', '20,000', '10,000', '北京国际餐饮场景强'],
                ['交通（地铁+公交+单车）', '1,500', '500', '北京地铁：¥3-9/次'],
                ['手机+网络', '1,200', '600', '¥50-100/月'],
                ['教材+用品', '1,500', '500', '第一年可能更多'],
                ['个人+娱乐', '5,000', '3,000', '¥250-500/月'],
                ['签证+保险', '1,000', '800', '第一年较高（JW202手续）'],
                ['本科总预算（含）', '83,200', '47,400', '美元：$11,700-6,700'],
                ['硕士总预算（含）', '91,200', '54,400', '美元：$12,800-7,650'],
                ['博士（有资助）', '10,000-15,000（津贴盈余）', '同上', '资助通常覆盖所有费用'],
              ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '清华+北大的博士通常有资助包（CSC+学校补+导师补助）津贴¥5,000-7,000/月——完全覆盖所有生活费并有盈余。',
          },
        ],
      },
      {
        id: 'programs-beijing',
        h2: '北京大学的热门项目',
        intro:
          '北京高校在特定学科领先。下面按项目拆解每所北京大学的强项。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**工科（机械、电子、土木、材料）**——清华是中国公认的#1工科学校（全球前15）。北航是航空#1。北理工是武器+车辆工程前三。北科大是冶金+材料#1。',
              '**计算机/AI**——清华计算机系中国最强（全球前20），尤其AI+系统方向。北大紧跟其后。两校都有英文授课硕士项目，国际生比例高。',
              '**理科（物理、化学、生物、数学）**——北大是公认中国理科#1（清华#2）。两校物理+数学均进全球前30。',
              '**经济/金融/公共政策**——北大经济+金融中国前三。人大是#1公共政策+经济学校（中国高级政府经济学家的摇篮）。清华公共管理+经济#2（清华苏世民学者是全球顶级国际生公共政策硕士）。',
              '**国际关系/政治学**——北大+人大是顶级IR/政治学学校。两校都培养了大量中国高级外交官和政策顾问。',
              '**法学**——北大是中国#1法学院。人大#2（民商法尤强）。',
              '**汉学/中国学**——北大是全球#1汉学目的地（多数海外汉学家学术谱系可追溯至北大教师）。燕京学堂是全球顶级汉学硕士项目（国际生）。',
              '**医学/临床医学**——北京大学医学部（原北京医科大学）是中国#1医学院。首都医科大学是#1专门医科大学。',
              '**建筑/城市规划**——清华建筑学院是中国大陆#1建筑项目（全球前20）。',
              '**教育/心理学**——北师大是中国#1教育+心理大学。培养中国大多数K-12教师和教育研究者。',
              '**中医**——北京中医药大学是中国#1中医大学（与上海中医药大学、广州中医药大学并列）。',
              '**新闻/传播**——中国传媒大学是#1新闻+广播大学。培养中国大多数CCTV主持人和媒体高管。',
              '**美术/设计**——中央美术学院是中国#1美术学院（亚洲前5）。',
              '**音乐**——中央音乐学院是中国#1音乐学院。',
            ],
          },
        ],
      },
      {
        id: 'beijing-vs-shanghai',
        h2: '北京 vs 上海：哪座城市更适合国际生？',
        intro:
          '北京和上海是中国国际生的两个主要目的地。两地都有多所世界级大学；都有强劲的就业渠道。正确选择取决于你的领域、职业目标、生活方式偏好。',
        blocks: [
          {
            type: 'table',
              caption: '北京 vs 上海（国际生）',
              columns: ['因素', '北京', '上海'],
              rows: [
                ['顶尖大学', '清华+北大+人大', '上交+复旦+同济'],
                ['生活费', '¥2,500-3,500/月（更低）', '¥3,000-4,500/月'],
                ['国际社区', '较小（~10万）', '较大（20万+）'],
                ['职业焦点', '政府、政策、国企、研究', '金融、外企、科技、设计'],
                ['气候', '干冷冬+干热夏', '湿热夏+湿凉冬'],
                ['空气质量', '变化（改善中，偶有冬季雾霾）', '更好（沿海）'],
                ['英语可及性', '高', '最高'],
                ['适合职业', '政府、政策、国企、科技、汉学', '金融、咨询、科技、设计、商科'],
                ['适合学生专业', '工科、CS、理科、政策、汉语、IR', '商科、工科、设计、IR、金融'],
                ['签证旅行', '香港+蒙古+俄罗斯（更便宜）', '香港+日本+韩国（便宜）'],
              ],
          },
          {
            type: 'p',
            text: '实际建议：职业目标是政府/政策/国企/顶级研究/汉学的，选北京。职业是金融/咨询/科技/设计/商科的，选上海。北京有更负盛名的大学（清华+北大均中国前2）和更浓厚的中文环境。上海有更大的国际社区+更好的气候+稍微更轻松的日常生活。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '北京最好的大学是哪所？',
        a: '对多数国际生：清华大学和北京大学并列第一。清华工科+CS+建筑更强；北大文科+理科+国际关系更强。两所都是C9联盟（中国前9研究型大学），均进QS全球前30——中国大陆最负盛名的两所大学。',
      },
      {
        q: '北京有多少国际生？',
        a: '每年约70,000-90,000国际生在北京高校就读，最大的集中在清华（约5,500国际生）、北大（约5,000）、人大（约3,000）、北师大（约2,800）和北航（约2,500）。清华+北大硕士项目国际生占20-40%。',
      },
      {
        q: '北京留学生生活费？',
        a: '¥2,500-3,500/月覆盖节俭-宽裕学生预算的住房+伙食+交通+手机+娱乐。学费另算¥18,000-50,000/年视项目。总预算¥70,000-110,000/年（USD 9,900-15,500）。北京顶尖大学的博士通常有覆盖所有费用的资助包。',
      },
      {
        q: '北京哪些大学英文授课？',
        a: '所有前7名北京大学都有大量英文授课硕士项目。清华工科/CS最强；北大文科/社科/理科/IR最强；人大经济/政策最强；北理工工科最强；北航航空航天最强。本科英文项目有限（多数中文授课）；查SICA项目目录按language=English筛选。',
      },
      {
        q: '北京对国际生安全吗？',
        a: '安全——北京是世界上最安全的大城市之一。暴力犯罪针对外国人极为罕见。校园区小偷小摸（抢包、扒手）少见。公共交通（地铁、公交）巡逻良好。主要安全风险：交通事故（过马路看两边！）、冬季雾霾期空气质量问题。中心区警察有英语服务；中心海淀区大学区有活跃的英语警察联络处。',
      },
      {
        q: '该选北京还是上海留学？',
        a: '职业目标是政府/政策/国企/顶级研究/汉学的，选北京。职业是金融/咨询/科技/设计/商科的，选上海。北京有更负盛名的大学（清华+北大均中国前2）和更浓厚的中文环境。上海有更大的国际社区+更好的气候+稍微更轻松的日常生活。',
      },
      {
        q: '北京高校有奖学金吗？',
        a: '有——4种：（1）CSC奖学金——全额资助，所有北京高校可申（约150个/年名额分配给北京方向学生）。（2）北京市政府奖学金——¥20,000-60,000/年，直接向北京市教委申请。（3）大学专项奖——清华/北大/北理工/北航对优秀申请者减免50-100%学费。（4）苏世民学者（仅清华）——全额资助全球事务硕士，价值US$80,000+，竞争激烈。',
      },
      {
        q: '北京留学能兼职吗？',
        a: '能——持X1学生签证，校内≤20小时/周可工作（需批准）。常见岗位：图书馆助理、实验室助理、宿舍管理、科研助理、中文家教。校外工作受限但可事先批准。北京是校外兼职试点城市——多数北京外企和创业公司（字节、京东、联想）向在校国际生提供有薪实习，但通常需要学校+移民局批准。',
      },
    ],
    howToSteps: [
      { name: '确定目标领域+职业阶段', text: '北京最强：工科+CS（清华）、理科+IR+汉学（北大）、经济+政策（人大）、航空航天（北航）、教育+心理（北师大）、材料+冶金（北科大）、新闻（中传）、美术（央美）。将目标项目与最强项目所在大学匹配，而非整体排名最高。' },
      { name: '比较学费+生活费 vs 其他一线城市', text: '北京生活成本比上海便宜10-20%（¥2,500-3,500/月 vs ¥3,000-4,500/月），比二线城市贵30-50%。北京大学学费相近（英文授课¥18K-50K/年）。按预算规划。' },
      { name: '确认目标项目英文授课可用性', text: '清华+北大+北理工+北航+人大的硕士英文项目很全。本科英文项目有限。博士英文项目在所有前7名大学可用，视导师情况。用SICA项目目录按language=English筛选。' },
      { name: '了解奖学金路径（CSC+北京市+学校+苏世民）', text: 'CSC覆盖全额学费+津贴+住宿+机票——1-4月申请9月入学。北京市奖学金（¥20K-60K/年）——5月前直接向北京市教委申请。学校专项减免（50-100%学费）——随录取自动发，尽早申请提高机会。苏世民学者（清华）——独立申请，US$80,000+价值，竞争激烈。' },
      { name: '准备申请材料（清华/北大提前12-9个月）', text: '考语言（清华/北大要求IELTS 6.5-7.0+ / TOEFL 95-100+；其他学校略低）。写个人陈述/学习计划/研究计划。准备成绩单+推荐信+CV+健康证明。博士申请者提前12-15月联系潜在导师预匹配。' },
      { name: '并行申请3-5所北京大学', text: '北京有7所强大学+12+所专门应用型大学。并行申请3-5所提高机会。每份申请独立（无统一系统）。滚动录取11月开始；顶尖项目4月截止9月入学。清华+北大比其他北京学校截止更早。' },
      { name: '确认录取+规划行程', text: '多数硕士决定4-8周内发出。博士决定6-12周（含导师匹配+委员会审核）。录取后：申请X1签证，订飞北京的票（首都机场或大兴），预订校内宿舍（尽早——宿舍6月前订完，清华+北大尤其紧俏）。' },
      { name: '安顿北京+激活学生身份', text: '抵达后：到大学国际学生办公室注册。24小时内申请居留许可。开中国银行账户（工行、中行、建行）。办本地SIM卡。激活奖学金。加入国际学生协会获取社群支持。办北京交通卡（地铁+公交）。' },
    ],
    ctaTitle: '准备好去北京留学了吗？',
    ctaSubtitle:
      'SICA顾问帮你选清华、北大、人大、北理工、北航等北京高校，准备申请包，申请CSC+北京市+苏世民+学校专项奖学金。免费初步咨询。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/best-universities-china', label: '中国最好的大学', description: '所有中国大学按国内排名+QS世界排名——2026标准排名。' },
      { href: '/best-cities-china-international-students', label: '中国最好的留学城市', description: '按国际生人数+大学质量+职业机会排名的中国留学城市榜。' },
      { href: '/best-universities-in-shanghai', label: '上海最好的大学', description: '上海顶尖大学（上交、复旦、同济等）——学费、项目、国际社区。' },
    ],
  },
};
