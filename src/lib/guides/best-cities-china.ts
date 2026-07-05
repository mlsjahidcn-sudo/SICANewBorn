import type { LocalizedGuide } from './types';

/**
 * "Best Cities in China for International Students" — listicle
 * guide. Target queries: "best cities china international students",
 * "china student city", "study in beijing", "study in shanghai",
 * "best city for international students china".
 *
 * Different angle from /guides/study-in-china (which is a broad
 * overview): this page ranks specific cities by international-
 * student-relevant criteria.
 *
 * Page wrapper fetches the live university list from the DB and
 * computes the city ranking at render time, injecting the
 * results into the `best-cities-table` block.
 */
export const bestCitiesGuide: LocalizedGuide = {
  en: {
    slug: 'best-cities-china-international-students',
    eyebrow: 'GUIDE · CITIES',
    title: 'Best Cities in China for International Students (2026 Ranking)',
    description:
      'Top-ranked Chinese cities for international students — by number of top universities, English-medium programs, cost of living, and lifestyle.',
    subtitle:
      'Choosing the right Chinese city affects your university quality, living cost, job opportunities, and overall experience. Here is the data, ranked.',
    stats: [
      { value: '9', label: 'Top-tier university cities' },
      { value: '6', label: 'Universities in top city (Hangzhou)' },
      { value: '40%', label: 'Lower cost in Tier 2 vs Tier 1' },
      { value: 'LIVE', label: 'Universities ranked below' },
    ],
    quickAnswer:
      'The best cities in China for international students are: (1) Beijing — most top universities, biggest international community, highest cost; (2) Shanghai — global business hub, top-tier schools, premium cost; (3) Hangzhou — tech hub, 6 top universities including Zhejiang, mid-tier cost; (4) Wuhan — flagship universities (Wuhan, Huazhong UST), 40% lower cost than Tier 1; (5) Nanjing — historical + modern mix, top schools (Nanjing, Southeast); (6) Chengdu — quality + lifestyle balance, growing international scene. The right city depends on your priorities: career focus → Beijing/Shanghai; affordability → Wuhan/Xi\'an; lifestyle → Hangzhou/Chengdu; safety + English community → Beijing/Shanghai.',
    keyTakeaways: [
      'Beijing and Shanghai have the most top-tier universities but the highest cost of living',
      'Hangzhou leads in # of top universities per city (6 in the SICA catalog) — emerging tech hub',
      'Wuhan, Xi\'an, Changsha offer flagship-university quality at 40-50% lower cost than Tier 1',
      'Tier 1 cities (Beijing, Shanghai, Shenzhen) have the largest international student communities and best English support',
      'Tier 2 cities (Hangzhou, Nanjing, Wuhan, Chengdu) are the best value-for-quality balance',
      'City choice affects scholarship access — provincial scholarships (Beijing, Shanghai, Jiangsu) are city-specific',
    ],
    sections: [
      {
        id: 'ranking-criteria',
        h2: 'How cities are ranked for international students',
        intro:
          'Six criteria matter for choosing a Chinese city as an international student. Each carries different weight depending on your priorities.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**University quality** — number of top-tier universities (QS top 200) in the city. Beijing leads with Peking, Tsinghua, Renmin, BNU. Shanghai has Fudan, SJTU, Tongji, ECNU. Hangzhou has Zhejiang. Wuhan has Wuhan University + Huazhong UST.',
              '**English-medium program availability** — Tier 1 cities (Beijing, Shanghai) and joint-venture hubs (Ningbo, Suzhou, Wenzhou) have the most English-medium programs. Tier 2 cities typically have English-medium master\'s but fewer bachelor options.',
              '**Cost of living** — monthly living costs range from ¥1,500-2,500 (Tier 2/3 cities) to ¥3,500-5,000 (Tier 1). The same university degree can cost 40-50% more in Beijing than in Wuhan.',
              '**International student community** — Beijing, Shanghai, Hangzhou, Wuhan have the largest international student communities. Bigger communities mean better support services, more English-speaking counselors, more international restaurants, easier social integration.',
              '**Career opportunities** — Beijing, Shanghai, Shenzhen, Hangzhou have the most internship + job opportunities. Tech: Hangzhou (Alibaba), Shenzhen (Tencent, Huawei), Beijing (ByteDance). Finance: Shanghai, Beijing. Manufacturing: Shenzhen, Suzhou, Guangzhou.',
              '**Quality of life** — climate, food culture, transport, safety, English-friendliness. Hangzhou + Chengdu score high on livability. Beijing + Shanghai score high on infrastructure but lower on air quality. Tier 2 cities generally have better air quality + lower density.',
            ],
          },
        ],
      },
      {
        id: 'best-cities-table',
        h2: 'Top cities for international students, ranked',
        intro:
          'Every city in the SICA catalog with at least one top-tier university, ranked by combined criteria: # of top universities + English-medium availability + international community size + cost-of-living favorability.',
        blocks: [
          {
            type: 'table',
            caption: 'Top Chinese cities for international students (2026 ranking)',
            columns: ['#', 'City', 'Tier', 'Universities', 'Avg tuition/yr', 'Living cost/yr', 'Intl. community'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The right city is a personal decision. Use this ranking as a starting point, then factor in your program location, scholarship opportunities, and career goals.',
          },
        ],
      },
      {
        id: 'tier1-cities',
        h2: 'Tier 1 cities: Beijing, Shanghai, Shenzhen, Guangzhou',
        intro:
          'The four traditional first-tier cities. Most top universities, most international community, highest cost. Best for career-focused students.',
        blocks: [
          {
            type: 'table',
            caption: 'Tier 1 Chinese cities for international students',
            columns: ['City', 'Top universities', 'Avg tuition/yr', 'Living cost/yr', 'Best for'],
            rows: [
              ['Beijing', 'Peking, Tsinghua, Renmin, BNU, Beihang, BUAA, China Agricultural, China U Political Sci & Law', '¥30,000-50,000', '¥54,000-60,000', 'Politics, tech, finance, research careers'],
              ['Shanghai', 'Fudan, SJTU, Tongji, ECNU, Shanghai U, Shanghai U Finance & Economics, East China UST', '¥30,000-50,000', '¥54,000-60,000', 'Finance, consulting, tech, international business'],
              ['Shenzhen', 'Shenzhen U, SZU-HK Baptist (UIC nearby), SUSTech, Southern UST', '¥26,000-50,000', '¥50,000-60,000', 'Tech (Tencent, Huawei, ZTE), startups, hardware'],
              ['Guangzhou', 'Sun Yat-sen U, SCUT, South China Normal, Jinan U', '¥24,000-40,000', '¥45,000-55,000', 'Manufacturing, trade, ASEAN connections (Cantonese-speaking)'],
            ],
          },
        ],
      },
      {
        id: 'tier2-cities',
        h2: 'Tier 2 cities: the best value-for-quality balance',
        intro:
          'The most interesting category for budget-conscious international students. Flagship universities with strong research output, 40-50% lower living costs, growing international communities.',
        blocks: [
          {
            type: 'table',
            caption: 'Top Tier 2 Chinese cities for international students',
            columns: ['City', 'Top universities', 'Avg tuition/yr', 'Living cost/yr', 'Best for'],
            rows: [
              ['Hangzhou (Zhejiang)', 'Zhejiang U, Zhejiang UST, Zhejiang U Finance, Zhejiang Intl Studies, China Jiliang, Westlake U', '¥14,000-40,000', '¥36,000-48,000', 'Tech (Alibaba HQ), lifestyle (West Lake), research'],
              ['Wuhan', 'Wuhan U, Huazhong UST, Wuhan UST, China U Geosciences', '¥18,000-35,000', '¥30,000-42,000', 'Research, affordability, strong international community'],
              ['Nanjing', 'Nanjing U, Southeast U, Nanjing UST, Nanjing Agricultural, Hohai U', '¥18,000-35,000', '¥36,000-48,000', 'Engineering, history, central location (2hrs to Shanghai)'],
              ['Xi\'an', 'Xi\'an Jiaotong, Northwestern Polytechnical, Xidian U, Chang\'an U, NW A&F U', '¥18,000-35,000', '¥30,000-42,000', 'Engineering (esp. aerospace, electronics), history, affordability'],
              ['Chengdu', 'Sichuan U, UESTC, Southwest Jiaotong, Sichuan Agricultural', '¥18,000-30,000', '¥30,000-42,000', 'Engineering, lifestyle (food capital), growing tech scene'],
              ['Tianjin', 'Nankai U, Tianjin U, Tianjin UST, Tianjin Normal, Tianjin U Finance', '¥18,000-30,000', '¥30,000-42,000', 'Engineering, near-Beijing access, history'],
              ['Changsha', 'Central South U, Hunan U, National U Defense Technology', '¥16,000-30,000', '¥28,000-40,000', 'Engineering, medicine, affordability, food capital'],
              ['Harbin', 'Harbin IT, Harbin Engineering, Northeast Forestry, Northeast Agricultural', '¥16,000-28,000', '¥24,000-36,000', 'Engineering, cold climate, lowest cost'],
            ],
          },
        ],
      },
      {
        id: 'city-scholarships',
        h2: 'City-specific scholarships',
        intro:
          'Several Chinese provinces and cities run their own scholarship programs for international students — apply for these in addition to CSC and university-specific awards.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Beijing Government Scholarship** — ¥20,000-50,000/year for international students at Beijing universities',
              '**Shanghai Government Scholarship** — ¥20,000-50,000/year for international students at Shanghai universities',
              '**Jiangsu Government Scholarship (Jasmine Scholarship)** — ¥20,000-50,000/year for international students at Jiangsu universities',
              '**Zhejiang Government Scholarship** — ¥20,000-50,000/year for international students at Zhejiang universities',
              '**Guangdong Government Scholarship** — ¥20,000-50,000/year for international students at Guangdong universities',
              '**Sichuan, Hubei, Shaanxi, Hunan, Tianjin, Chongqing government scholarships** — ¥10,000-30,000/year at respective provinces',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Provincial scholarships are typically separate from CSC — you can stack them with CSC, university-specific waivers, and Confucius Institute scholarships. SICA helps you apply for all four in parallel.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the best city in China for international students?',
        a: 'It depends on your priorities. Beijing and Shanghai have the most top universities + largest international community + best career opportunities, but also the highest cost of living (¥3,500-5,000/month). Hangzhou is the best tech-focused city (Alibaba HQ, 6 top universities, moderate cost). Wuhan, Xi\'an, Changsha offer flagship-university quality at 40-50% lower cost. For most international students, Beijing and Shanghai are the safest picks for career; Hangzhou for tech lifestyle; Wuhan or Xi\'an for affordability.',
      },
      {
        q: 'Is Beijing or Shanghai better for international students?',
        a: 'Both are excellent Tier 1 choices. Beijing has more top universities (Peking, Tsinghua, Renmin, BNU) and is the political + tech center. Shanghai has Fudan, SJTU, Tongji, ECNU and is the financial + international business center. Beijing is denser + more international community; Shanghai is more spread out + more European feel. For most international students, both are equivalent in quality — choose based on program location and career goals.',
      },
      {
        q: 'What is the cheapest major city in China for international students?',
        a: 'Among major university cities, Harbin is the cheapest (¥24,000-36,000/year living + ¥16,000-28,000/year tuition at Harbin IT, Harbin Engineering, etc.). Changsha, Xi\'an, Chengdu, Tianjin, and Wuhan are the next cheapest Tier 1.5 cities (¥28,000-42,000/year living). The cheapest university cities with flagship quality are Wuhan and Xi\'an (Wuhan University, Huazhong UST, Xi\'an Jiaotong — all top-30 domestically, all under ¥42,000/year living).',
      },
      {
        q: 'Which Chinese city is safest for international students?',
        a: 'All major Chinese university cities are very safe by global standards. Beijing, Shanghai, Hangzhou, Nanjing, Xi\'an, Chengdu, and Wuhan consistently rank as the safest in safety-focused surveys. Tier 2/3 cities (Changsha, Harbin, Kunming) are also very safe — lower crime + lower density + more community feel. The main safety consideration in China is petty theft (pickpocketing in tourist areas) and traffic (jaywalking, electric bikes) — both are universal urban concerns, not city-specific.',
      },
      {
        q: 'Is Hangzhou a good city for international students?',
        a: 'Yes — Hangzhou is one of the best. It has 6 top universities in the SICA catalog (Zhejiang University, ZUST, ZUFE, ZISU, China Jiliang, Westlake), Alibaba + many tech companies for internships, West Lake + tea culture for lifestyle, lower cost than Beijing/Shanghai (¥36,000-48,000/year living), high-speed rail to Shanghai (45 min). The international student community is growing fast but smaller than Beijing/Shanghai. Best for tech-focused + lifestyle-oriented students.',
      },
      {
        q: 'How much does it cost to live in Beijing vs Shanghai?',
        a: 'Beijing and Shanghai have similar costs — ¥3,500-5,000/month for a modest student lifestyle (dorm + food + transport + phone + occasional entertainment). Tuition is also similar: ¥30,000-50,000/year at top universities. The main difference is lifestyle: Beijing is denser + more international community; Shanghai is more spread out + more European feel. Both cities are 40-50% more expensive than Wuhan or Xi\'an for similar university quality.',
      },
      {
        q: 'What is the best city in China for tech internships?',
        a: 'Beijing (ByteDance, JD, Xiaomi, Lenovo, Microsoft Research Asia, Google China), Shenzhen (Tencent, Huawei, ZTE, BYD, DJI), Hangzhou (Alibaba, NetEase, Ant Group), Shanghai (Microsoft, SAP, Intel, many multinational R&D centers), and Suzhou (Microsoft, Intel, AMD, semiconductor ecosystem). For pure tech exposure, Shenzhen + Hangzhou are the best — they\'re the headquarters of China\'s biggest tech companies and the cities are designed around tech-industry growth.',
      },
      {
        q: 'Should I choose a Tier 1 or Tier 2 city for studying in China?',
        a: 'Tier 1 (Beijing, Shanghai, Shenzhen, Guangzhou) for career-focused students who want maximum internship + job opportunities + international community + English support. Tier 2 (Hangzhou, Wuhan, Nanjing, Xi\'an, Chengdu, Changsha) for value-conscious students who want flagship-university quality at 40-50% lower cost + more authentic cultural immersion. The deciding factors are usually career goals + budget + language comfort (Tier 1 has more English signage + services). Both are excellent — most international students have a great experience in either.',
      },
    ],
    howToSteps: [
      {
        name: 'Rank your priorities',
        text: 'Decide what matters most: career opportunities (Tier 1), affordability (Tier 2/3), lifestyle (Hangzhou/Chengdu), or international community (Beijing/Shanghai). This determines the right city tier.',
      },
      {
        name: 'Identify target universities first',
        text: 'Start with your target program + university (not city). Apply to 3-5 universities in parallel. Most international students end up in the city where their target university is — work backward from the program.',
      },
      {
        name: 'Compare cities on 4 dimensions',
        text: 'Use the table in section 3 to compare cities on: number of top universities, English-medium program availability, cost of living, international community size. Weight each dimension by your priorities.',
      },
      {
        name: 'Check provincial scholarship opportunities',
        text: 'Each province (Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong) runs its own scholarship program — typically ¥20,000-50,000/year. You can stack these with CSC, university waivers, and Confucius Institute scholarships.',
      },
      {
        name: 'Look at career + internship opportunities',
        text: 'Tech: Hangzhou (Alibaba), Shenzhen (Tencent, Huawei), Beijing (ByteDance, JD). Finance: Shanghai, Beijing. Manufacturing: Shenzhen, Suzhou, Guangzhou. Research: Beijing, Shanghai, Wuhan. Match your career goal to the city cluster.',
      },
      {
        name: 'Plan for the cost difference',
        text: 'Tier 1 cities cost 40-50% more than Tier 2 for the same university quality. Total budget: Tier 1 ~¥80,000-130,000/year all-in; Tier 2 ~¥45,000-65,000/year. If budget is tight, prioritize Tier 2 flagship universities (Wuhan, Xi\'an, Huazhong) over Tier 1 mid-tier schools.',
      },
      {
        name: 'Consider climate + lifestyle',
        text: 'Climate varies: Beijing/Shanghai (cold winters, hot summers, continental), Hangzhou/Chengdu (humid subtropical, milder), Xi\'an (dry, hot summers, cold winters), Kunming (spring-like year-round, "Spring City"). Lifestyle varies: Beijing (denser, more international), Shanghai (more spread out, European feel), Chengdu (food capital, relaxed), Xi\'an (historical, traditional).',
      },
      {
        name: 'Plan for arrival + first month',
        text: 'Most universities have international student pickup services from the airport (especially Tier 1 cities). Plan to arrive 1-2 weeks before orientation. First month: get your residence permit, bank account, phone number, student ID, and connect with the international student office for city orientation.',
      },
    ],
    ctaTitle: 'Need help choosing the right city?',
    ctaSubtitle:
      'SICA counselors help you match the right city to your goals, budget, and lifestyle preferences. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/study-in-china',
        label: 'Why & how to study in China',
        description: 'The full picture: top universities, costs, scholarships, admissions, student life, and career outcomes.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'Every Chinese university ranked by domestic ranking + QS World — the canonical 2026 ranking.',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: 'Cost of living in China by city',
        description: 'City-by-city cost comparison — what the same monthly budget buys in 8 representative Chinese cities.',
      },
    ],
  },
  zh: {
    slug: 'best-cities-china-international-students',
    eyebrow: '指南 · 城市',
    title: '2026 来华留学最好的城市（排名）',
    description:
      '中国国际生最佳城市——按顶尖大学数、英文授课项目数、生活成本、生活方式排名。',
    subtitle:
      '选择正确的中国城市影响你的大学质量、生活成本、就业机会和整体体验。数据、排名如下。',
    stats: [
      { value: '9', label: '顶尖大学城市' },
      { value: '6', label: '顶尖城市大学数（杭州）' },
      { value: '40%', label: '二线比一线成本低' },
      { value: '实时', label: '下方排名大学数' },
    ],
    quickAnswer:
      '国际生来华最好的城市：（1）北京——最多顶尖大学、最大国际生社区、最高成本；（2）上海——全球商业中心、顶尖院校、高端成本；（3）杭州——科技中心，SICA 目录中 6 所顶尖大学（含浙大），中端成本；（4）武汉——旗舰大学（武汉大学、华中科技），比一线低 40% 成本；（5）南京——历史与现代结合，顶尖大学（南大、东南）；（6）成都——质量与生活平衡，国际场景发展。正确城市取决于优先级：职业→北京/上海；可负担→武汉/西安；生活→杭州/成都；安全 + 英文社区→北京/上海。',
    keyTakeaways: [
      '北京、上海有最多顶尖大学但生活成本最高',
      '杭州在每城市顶尖大学数上领先（SICA 目录中 6 所）——新兴科技中心',
      '武汉、西安、长沙以 40-50% 更低成本提供旗舰大学质量',
      '一线城市（北京、上海、深圳）拥有最大国际生社区与最佳英文支持',
      '二线城市（杭州、南京、武汉、成都）是性价比最佳平衡',
      '城市选择影响奖学金机会——省市奖学金（北京、上海、江苏）按城市发放',
    ],
    sections: [
      {
        id: 'ranking-criteria',
        h2: '城市如何为国际生排名',
        intro:
          '六项标准影响中国城市作为国际生目的地的选择。每项根据你的优先级权重不同。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**大学质量**——该城市顶尖大学（QS 前 200）数量。北京领先（北大、清华、人大、北师大）。上海有复旦、上海交大、同济、华师大。杭州有浙大。武汉有武汉大学 + 华中科技。',
              '**英文授课项目可得性**——一线城市（北京、上海）及合办中心（宁波、苏州、温州）英文授课项目最多。二线城市通常有英文授课硕士，但本科选项较少。',
              '**生活成本**——月生活费从 ¥1,500-2,500（二/三线）到 ¥3,500-5,000（一线）。同所大学学位北京可比武汉贵 40-50%。',
              '**国际生社区**——北京、上海、杭州、武汉拥有最大国际生社区。更大社区意味着更好的支持服务、更多英文辅导员、更多国际餐厅、更容易社交融入。',
              '**就业机会**——北京、上海、深圳、杭州有最多实习 + 工作机会。科技：杭州（阿里）、深圳（腾讯、华为）、北京（字节跳动）。金融：上海、北京。制造：深圳、苏州、广州。',
              '**生活质量**——气候、饮食文化、交通、安全、英文友好度。杭州 + 成都宜居评分高。北京 + 上海基础设施评分高但空气质量评分低。二线城市通常空气质量更好 + 密度更低。',
            ],
          },
        ],
      },
      {
        id: 'best-cities-table',
        h2: '国际生最佳城市排名',
        intro:
          'SICA 目录中所有拥有至少一所顶尖大学的城市，按综合标准排名：顶尖大学数 + 英文授课可得性 + 国际社区规模 + 生活成本友好度。',
        blocks: [
          {
            type: 'table',
            caption: '2026 国际生最佳中国城市（排名）',
            columns: ['#', '城市', '层级', '大学数', '平均学费/年', '生活费/年', '国际社区'],
            rows: [['（从 SICA 数据库加载中…）', '—', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '正确城市是个人决定。以本排名为起点，再考虑你的项目位置、奖学金机会与职业目标。',
          },
        ],
      },
      {
        id: 'tier1-cities',
        h2: '一线城市：北京、上海、深圳、广州',
        intro:
          '四个传统一线城市。最多顶尖大学、最大的国际社区、最高成本。最适合职业导向的学生。',
        blocks: [
          {
            type: 'table',
            caption: '中国一线城市（国际生）',
            columns: ['城市', '顶尖大学', '平均学费/年', '生活费/年', '最适合'],
            rows: [
              ['北京', '北大、清华、人大、北师大、北航、北理工、中国农大、中国政法', '¥30,000-50,000', '¥54,000-60,000', '政治、科技、金融、研究'],
              ['上海', '复旦、上海交大、同济、华师大、上海大学、上海财大、华东理工', '¥30,000-50,000', '¥54,000-60,000', '金融、咨询、科技、国际商业'],
              ['深圳', '深圳大学、北师香港浸大（UIC 附近）、南方科技、华南理工', '¥26,000-50,000', '¥50,000-60,000', '科技（腾讯、华为、中兴）、创业、硬件'],
              ['广州', '中山大学、华南理工、华南师范、暨南大学', '¥24,000-40,000', '¥45,000-55,000', '制造、贸易、东盟联系（粤语区）'],
            ],
          },
        ],
      },
      {
        id: 'tier2-cities',
        h2: '二线城市：性价比的最佳平衡',
        intro:
          '对预算敏感的国际生最有趣的类别。旗舰大学研究实力强，生活成本低 40-50%，国际社区在增长。',
        blocks: [
          {
            type: 'table',
            caption: '国际生最佳中国二线城市',
            columns: ['城市', '顶尖大学', '平均学费/年', '生活费/年', '最适合'],
            rows: [
              ['杭州（浙江）', '浙大、浙工大、浙财大、浙外大、中国计量大学、西湖大学', '¥14,000-40,000', '¥36,000-48,000', '科技（阿里总部）、生活（西湖）、研究'],
              ['武汉', '武大、华中科技、武汉理工、中国地大', '¥18,000-35,000', '¥30,000-42,000', '研究、可负担、强国际社区'],
              ['南京', '南大、东南大学、南理工、南农、河海大学', '¥18,000-35,000', '¥36,000-48,000', '工程、历史、地理位置（距上海 2 小时）'],
              ['西安', '西安交大、西北工大、西安电子、长安大学、西北农林', '¥18,000-35,000', '¥30,000-42,000', '工程（尤其航空、电子）、历史、可负担'],
              ['成都', '川大、电子科大、西南交大、川农大', '¥18,000-30,000', '¥30,000-42,000', '工程、生活（美食之都）、科技发展'],
              ['天津', '南开、天大、天理工、天津师大、天津财大', '¥18,000-30,000', '¥30,000-42,000', '工程、近北京、历史'],
              ['长沙', '中南大学、湖南大学、国防科大', '¥16,000-30,000', '¥28,000-40,000', '工程、医学、可负担、美食之都'],
              ['哈尔滨', '哈工大、哈工程、东北林业、东北农大', '¥16,000-28,000', '¥24,000-36,000', '工程、寒冷气候、最低成本'],
            ],
          },
        ],
      },
      {
        id: 'city-scholarships',
        h2: '城市专项奖学金',
        intro:
          '中国多个省市为国际生设有专项奖学金——除 CSC 与院校奖学金外另行申请。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**北京市政府奖学金**——北京高校国际生 ¥20,000-50,000/年',
              '**上海市政府奖学金**——上海高校国际生 ¥20,000-50,000/年',
              '**江苏省政府奖学金（茉莉花奖学金）**——江苏高校国际生 ¥20,000-50,000/年',
              '**浙江省政府奖学金**——浙江高校国际生 ¥20,000-50,000/年',
              '**广东省政府奖学金**——广东高校国际生 ¥20,000-50,000/年',
              '**四川、湖北、陕西、湖南、天津、重庆政府奖学金**——对应省份 ¥10,000-30,000/年',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '省市奖学金通常与 CSC 独立——可与 CSC、院校减免、孔子学院奖学金叠加。SICA 可助你并行申请。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国国际生最好的城市是哪？',
        a: '取决于优先级。北京、上海有最多顶尖大学 + 最大国际社区 + 最佳就业机会，但生活成本最高（¥3,500-5,000/月）。杭州是最佳科技导向城市（阿里总部、6 所顶尖大学、中端成本）。武汉、西安、长沙以 40-50% 更低成本提供旗舰大学质量。对多数国际生：北京/上海是职业最安全选择；杭州是科技生活；武汉/西安是可负担性。',
      },
      {
        q: '北京和上海哪个更适合国际生？',
        a: '两个都是优秀的一线选择。北京有更多顶尖大学（北大、清华、人大、北师大），是政治 + 科技中心。上海有复旦、上海交大、同济、华师大，是金融 + 国际商业中心。北京更密集 + 国际社区更大；上海更分散 + 欧式氛围更强。对多数国际生两者质量相当——按项目位置和职业目标选择。',
      },
      {
        q: '中国主要城市最便宜的是哪个？',
        a: '主要大学城市中，哈尔滨最便宜（生活费 ¥24,000-36,000/年 + 哈工大/哈工程学费 ¥16,000-28,000/年）。长沙、西安、成都、天津、武汉是下一档便宜的 Tier 1.5 城市（生活费 ¥28,000-42,000/年）。旗舰质量大学城市最便宜的是武汉和西安（武大、华中科技、西安交大——均国内前 30，生活费均低于 ¥42,000/年）。',
      },
      {
        q: '中国哪个城市对国际生最安全？',
        a: '所有主要中国大学城市按全球标准都非常安全。北京、上海、杭州、南京、西安、成都、武汉在安全调查中长期排名前列。二/三线城市（长沙、哈尔滨、昆明）也非常安全——犯罪率更低 + 密度更低 + 社区感更强。中国主要安全考虑是小偷（旅游区扒窃）和交通（乱穿马路、电动车）——都是普遍城市问题，不是城市特定。',
      },
      {
        q: '杭州对国际生好吗？',
        a: '是——杭州是最佳之一。SICA 目录中有 6 所顶尖大学（浙大、浙工大、浙财大、浙外大、中国计量大学、西湖大学）；阿里 + 众多科技公司提供实习；西湖 + 茶文化适合生活；比北京/上海成本低（生活费 ¥36,000-48,000/年）；距上海高铁 45 分钟。国际生社区在快速增长但小于北京/上海。最适合科技导向 + 生活导向学生。',
      },
      {
        q: '北京和上海生活成本对比？',
        a: '北京和上海成本相似——¥3,500-5,000/月（宿舍 + 餐饮 + 交通 + 手机 + 偶尔娱乐）。学费也相似：顶尖大学 ¥30,000-50,000/年。主要差异在生活方式：北京更密集 + 国际社区更大；上海更分散 + 欧式氛围更强。两城市比武汉或西安贵 40-50%，但大学质量相同。',
      },
      {
        q: '中国科技实习最好的城市是哪个？',
        a: '北京（字节跳动、京东、小米、联想、微软亚研、Google 中国）、深圳（腾讯、华为、中兴、比亚迪、大疆）、杭州（阿里、网易、蚂蚁集团）、上海（微软、SAP、Intel、众多跨国 R&D 中心）、苏州（微软、Intel、AMD、半导体生态）。纯科技曝光：深圳 + 杭州最佳——它们是中国最大科技公司总部，城市围绕科技产业增长设计。',
      },
      {
        q: '一线还是二线城市更适合来华读书？',
        a: '一线（北京、上海、深圳、广州）适合职业导向学生——最大实习 + 工作机会 + 国际社区 + 英文支持。二线（杭州、武汉、南京、西安、成都、长沙）适合价值敏感学生——40-50% 更低成本 + 更真实的文化融入。决定因素通常是职业目标 + 预算 + 语言舒适度（一线有更多英文标识 + 服务）。两者都很优秀——多数国际生在任一类别都有良好体验。',
      },
    ],
    howToSteps: [
      {
        name: '排定优先级',
        text: '决定最重要的因素：就业机会（一线）、可负担性（二/三线）、生活（杭州/成都）、国际社区（北京/上海）。这决定正确的城市层级。',
      },
      {
        name: '先确定目标大学',
        text: '从目标项目 + 大学开始（不是城市）。同时申请 3-5 所大学。多数国际生最终进入目标大学所在城市——从项目反推。',
      },
      {
        name: '四维比较城市',
        text: '使用第 3 节表格对比城市：顶尖大学数、英文授课项目可得性、生活成本、国际社区规模。根据优先级加权各维度。',
      },
      {
        name: '查看省市奖学金机会',
        text: '每个省（北京、上海、江苏、浙江、广东）都设有专项奖学金——通常 ¥20,000-50,000/年。可与 CSC、院校减免、孔子学院奖学金叠加。',
      },
      {
        name: '关注就业 + 实习机会',
        text: '科技：杭州（阿里）、深圳（腾讯、华为）、北京（字节跳动、京东）。金融：上海、北京。制造：深圳、苏州、广州。研究：北京、上海、武汉。根据职业目标匹配城市集群。',
      },
      {
        name: '规划成本差异',
        text: '一线城市比二线贵 40-50%（同等大学质量）。总预算：一线 ¥80,000-130,000/年（全部），二线 ¥45,000-65,000/年。预算紧张时优先考虑二线旗舰大学（武汉、华中、西安）而非一线中等学校。',
      },
      {
        name: '考虑气候 + 生活方式',
        text: '气候差异：北京/上海（寒冬热夏，大陆性）、杭州/成都（湿润亚热带，温和）、西安（干燥，夏热冬冷）、昆明（常年如春，"春城"）。生活方式差异：北京（密集、国际）、上海（分散、欧式）、成都（美食之都、轻松）、西安（历史、传统）。',
      },
      {
        name: '规划抵华 + 第一个月',
        text: '多数大学有机场国际生接机服务（尤其一线城市）。建议开学前 1-2 周到达。第一个月：办理居留许可、银行账户、手机号、学生证，并通过国际学生办公室参加城市导览。',
      },
    ],
    ctaTitle: '需要帮你选城市？',
    ctaSubtitle:
      'SICA 顾问可帮你根据目标、预算、生活方式偏好匹配合适城市。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/study-in-china',
        label: '为什么及如何来华留学',
        description: '完整图景：顶尖大学、学费、奖学金、录取要求、校园生活与职业发展。',
      },
      {
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '所有中国大学按国内排名 + QS 世界排名——2026 标准排名表。',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: '中国各城市生活费',
        description: '城市间生活成本对比——同样月预算在 8 个代表中国城市能买什么。',
      },
    ],
  },
};