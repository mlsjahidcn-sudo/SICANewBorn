import type { LocalizedGuide } from './types';

/**
 * "Cost of Living in China by City" — listicle guide. Target
 * queries: "cost of living china city", "china living expenses
 * beijing shanghai", "monthly budget china student", "cheap
 * cities china".
 *
 * Different angle from /guides/cost-of-living (which is a generic
 * budget breakdown): this page is a city-by-city comparison.
 *
 * Page wrapper aggregates university tuition by city from the DB
 * and pairs it with a per-city living cost estimate, surfacing
 * the result in the `cost-by-city-table` block.
 */
export const costOfLivingByCityGuide: LocalizedGuide = {
  en: {
    slug: 'cost-of-living-china-by-city',
    eyebrow: 'GUIDE · COST',
    title: 'Cost of Living in China by City: 2026 Comparison',
    description:
      'City-by-city cost of living comparison for international students in China — Beijing, Shanghai, Hangzhou, Wuhan, Xi\'an, Chengdu + more.',
    subtitle:
      'The same monthly budget buys dramatically different lifestyles in different Chinese cities. Here is the data, ranked.',
    stats: [
      { value: '¥1,500-5,000', label: 'Monthly living cost range' },
      { value: '3x', label: 'Cost difference (Tier 1 vs Tier 3)' },
      { value: '10+', label: 'Cities compared' },
      { value: '¥0', label: 'Tuition variation by city' },
    ],
    quickAnswer:
      'Cost of living for international students in China varies 3-4x by city. Tier 1 cities (Beijing, Shanghai, Shenzhen, Guangzhou): ¥3,500-5,000/month for a modest student lifestyle. Tier 2 cities (Hangzhou, Nanjing, Wuhan, Xi\'an, Chengdu): ¥2,500-3,500/month. Tier 3 cities (Harbin, Kunming, Lishui): ¥1,500-2,500/month. Tuition is roughly the same across cities for the same university tier (the variation is in living cost, not tuition). The same budget at a Wuhan or Xi\'an flagship university (Wuhan University, Huazhong UST, Xi\'an Jiaotong) gives you 40-50% more purchasing power than at a Beijing or Shanghai equivalent.',
    keyTakeaways: [
      'Beijing + Shanghai cost ~¥3,500-5,000/month; Wuhan + Xi\'an cost ~¥2,500-3,000/month for the same lifestyle',
      'Tuition is roughly equal across cities for the same university tier — the variation is in living cost',
      'Tier 2/3 cities (Wuhan, Xi\'an, Changsha, Harbin) offer flagship university quality at 40-60% lower cost',
      'Food is the biggest variable — Tier 1 cities have more international restaurants at higher prices',
      'Dorm is the second biggest variable — on-campus dorms run ¥800-2,500/month depending on city + room type',
      'Transport is cheap nationwide — student metro pass ¥100-200/month, intercity high-speed rail ¥50-300 for short trips',
    ],
    sections: [
      {
        id: 'monthly-budget',
        h2: 'Monthly budget breakdown: what does ¥3,000 buy in China?',
        intro:
          'A typical international student in China spends ¥2,500-5,000/month on living costs. Here is where the money goes.',
        blocks: [
          {
            type: 'table',
            caption: 'Typical monthly budget for an international student in China (¥/month)',
            columns: ['Item', 'Budget (¥/month)', 'Mid (¥/month)', 'Comfortable (¥/month)', 'Notes'],
            rows: [
              ['Dorm (on-campus, double)', '500', '1,000', '2,000', 'Single room or off-campus = 1.5-2x'],
              ['Food (cafeteria)', '600', '900', '1,200', '¥20-40/meal × 3 meals; cooking cuts 30-50%'],
              ['Food (mixed: cafeteria + restaurants)', '900', '1,500', '2,500', 'Mix of dining out + cafeteria'],
              ['Transport (bus + metro)', '60', '120', '200', 'Student discount on metro'],
              ['Phone + internet', '50', '80', '120', '¥50-100/month'],
              ['Books + supplies', '50', '100', '200', 'Most universities use digital materials'],
              ['Personal + entertainment', '300', '600', '1,200', 'Movies, outings, shopping, hobbies'],
              ['Gym / sports', '0', '50', '150', 'Most universities have free campus gyms'],
              ['Travel (within China)', '0', '300', '800', 'High-speed rail, weekend trips'],
              ['TOTAL', '¥1,560', '¥3,650', '¥8,370', 'Multiply by 12 for annual budget'],
            ],
          },
          {
            type: 'p',
            text: 'Practical takeaway: a budget-conscious student in a Tier 2 city can live well on ¥2,000-2,500/month (¥24,000-30,000/year living cost). A comfortable Tier 1 lifestyle runs ¥4,000-6,000/month (¥48,000-72,000/year). The big variables are dorm type + food style + travel habits.',
          },
        ],
      },
      {
        id: 'cost-by-city-table',
        h2: 'All cities compared: monthly + annual cost',
        intro:
          'Every city in the SICA catalog with at least one university, ranked by total estimated annual cost (tuition + living). Tuition is aggregated from the SICA database; living costs are based on student surveys + university cost-of-living estimates.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost of living by city (annual: tuition + dorm + living)',
            columns: ['#', 'City', 'Tier', 'Universities', 'Avg tuition/yr', 'Living/yr', 'Total/yr (USD)'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Use this table to plan your budget. Tier 2 cities like Wuhan, Xi\'an, Chengdu offer the best flagship-university quality at 40-50% lower total cost than Tier 1.',
          },
        ],
      },
      {
        id: 'cheapest-vs-expensive',
        h2: 'Cheapest vs most expensive cities: what\'s the difference?',
        intro:
          'The difference between the cheapest and most expensive Chinese cities for international students is 3-4x — here is what you actually get for the price difference.',
        blocks: [
          {
            type: 'table',
            caption: 'Cheapest vs most expensive Chinese cities (¥/year, all-in)',
            columns: ['Category', 'Cheapest (Harbin, Kunming)', 'Mid (Wuhan, Xi\'an)', 'Most expensive (Beijing, Shanghai)'],
            rows: [
              ['Tuition (avg bachelor)', '¥16,000-28,000', '¥18,000-35,000', '¥30,000-50,000'],
              ['Tuition (avg master\'s)', '¥18,000-30,000', '¥22,000-40,000', '¥30,000-50,000'],
              ['Dorm (on-campus double)', '¥3,000-5,000/yr', '¥4,000-7,000/yr', '¥5,000-12,000/yr'],
              ['Food (cafeteria)', '¥7,000-9,000/yr', '¥9,000-12,000/yr', '¥12,000-18,000/yr'],
              ['Food (mixed dining)', '¥9,000-14,000/yr', '¥12,000-20,000/yr', '¥18,000-30,000/yr'],
              ['Transport', '¥1,000-1,500/yr', '¥1,200-1,800/yr', '¥1,500-2,400/yr'],
              ['Personal + entertainment', '¥4,000-7,000/yr', '¥6,000-10,000/yr', '¥10,000-15,000/yr'],
              ['Travel (within China)', '¥2,000-4,000/yr', '¥3,000-6,000/yr', '¥5,000-10,000/yr'],
              ['TOTAL bachelor (cafeteria)', '¥34,500-57,000', '¥44,000-75,000', '¥74,000-117,000'],
              ['TOTAL master\'s (mixed dining)', '¥37,500-66,500', '¥50,000-83,800', '¥83,000-132,400'],
              ['In USD', '$4,900-9,500', '$6,300-12,000', '$10,500-19,000'],
            ],
          },
        ],
      },
      {
        id: 'hidden-costs',
        h2: 'Hidden costs: what to budget beyond tuition + living',
        intro:
          'Several one-time and recurring costs don\'t show up in the standard budget. Here is the full list.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Visa + residence permit** — ¥400-800/year (first year includes JW202 processing for ~¥200 extra)',
              '**Medical insurance** — ¥800/year, required by law for X1 visa holders',
              '**Physical examination** — ¥500-800 one-time on arrival (mandatory for residence permit)',
              '**Airfare to China** — ¥3,000-8,000 one-way depending on origin country; CSC scholarships cover round-trip',
              '**Settling-in costs (first month)** — ¥2,000-5,000 (deposit on dorm, bedding, kitchen supplies, phone setup, bank account)',
              '**Winter clothing** — ¥1,000-3,000 (if you\'re from a tropical country, you may need a real winter coat; northern China gets very cold)',
              '**HSK prep materials** — ¥500-2,000 if you want to learn Chinese formally (most programs include free Chinese courses)',
              '**Industry visit + travel for master\'s/PhD** — ¥3,000-10,000/year depending on program (engineering MBAs often travel for site visits)',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC scholarship covers tuition + dorm + ¥2,500-3,500/month stipend + round-trip airfare + settling-in allowance. For a top-30 university, the total all-in cost is effectively ¥0 for the student.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How much does it cost to live in Beijing vs Shanghai?',
        a: 'Beijing and Shanghai have similar costs — ¥3,500-5,000/month for a modest student lifestyle (dorm + food + transport + phone + occasional entertainment). Shanghai is slightly more expensive for off-campus housing and international restaurants; Beijing is slightly more expensive for air quality mitigation (air purifiers, etc.). The total cost difference is typically <10%.',
      },
      {
        q: 'What is the cheapest major city in China for international students?',
        a: 'Among major university cities, Harbin is the cheapest (¥24,000-36,000/year living + ¥16,000-28,000/year tuition at Harbin IT, Harbin Engineering, etc.). Changsha, Xi\'an, Chengdu, Tianjin, and Wuhan are the next cheapest Tier 1.5 cities (¥28,000-42,000/year living). The cheapest university cities with flagship quality are Wuhan and Xi\'an (Wuhan University, Huazhong UST, Xi\'an Jiaotong — all top-30 domestically, all under ¥42,000/year living).',
      },
      {
        q: 'How much does it cost to live in Hangzhou?',
        a: 'Hangzhou is mid-tier: ¥3,000-4,000/month for a modest student lifestyle. The city has 6 top universities in the SICA catalog (Zhejiang University, ZUST, ZUFE, ZISU, China Jiliang, Westlake), and the cost is lower than Beijing/Shanghai but higher than Wuhan/Xi\'an. Hangzhou is a good value-for-quality choice for tech-focused students.',
      },
      {
        q: 'How much is dorm rent in China?',
        a: 'On-campus dorm rent: ¥500-2,000/month depending on city and room type. Double rooms (most common) run ¥500-1,000/month; single rooms ¥1,000-1,800/month; suites (rare) ¥1,800-3,000/month. Off-campus apartments: ¥1,500-4,000/month for a 1-bedroom depending on city (Beijing/Shanghai most expensive, Harbin/Changsha cheapest). Most international students live in on-campus dorms in year 1, then move off-campus in year 2.',
      },
      {
        q: 'How much does food cost in China?',
        a: 'Campus cafeteria: ¥20-40/meal = ¥1,800-3,600/month for 3 meals/day, 30 days. Mixed (cafeteria + restaurant): ¥2,500-5,000/month. Mostly restaurant/cooking: ¥3,000-6,000/month. International food is the big variable: a meal at a Western restaurant is ¥80-200/person, while a Chinese cafeteria meal is ¥15-30. Cooking for yourself cuts the food bill by 30-50% (ingredients ¥1,000-2,000/month).',
      },
      {
        q: 'Is China cheaper than the US for international students?',
        a: 'Yes, dramatically. Total annual cost at a top Chinese university (Tier 1 city): ¥80,000-130,000 (USD 11,000-18,000). Total annual cost at a comparable US public university: USD 35,000-55,000. Top US private university: USD 70,000-85,000. So China is 3-7x cheaper than the US depending on the comparison point, and you get a globally recognized degree + Chinese-market network access.',
      },
      {
        q: 'How much does transport cost in China?',
        a: 'Public transport is very cheap. Student metro pass: ¥100-200/month in Tier 1 cities (regular adult price is ¥2-8 per ride). Bus: ¥1-2/ride. Intercity high-speed rail: ¥50-300 for short trips (Beijing-Tianjin 30 min, ¥55; Shanghai-Hangzhou 45 min, ¥80; Beijing-Xi\'an 4.5 hrs, ¥515). Student discount: 75% off hard-seat / hard-sleeper trains; some intercity rail discounts for students. International flights: ¥3,000-8,000 one-way depending on origin country.',
      },
      {
        q: 'Can I work part-time to cover living costs in China?',
        a: 'Yes — under the X1 student visa, you can work ≤20 hours/week on campus with permission from your university\'s international student office. Typical on-campus roles: library assistant, lab assistant, dorm RA, research assistant, Chinese-language tutor (for incoming Chinese students learning English), cafeteria cashier. Most international students earn ¥1,500-3,000/month this way — enough to cover 30-50% of living costs. Off-campus work is restricted but possible with prior approval. Master\'s and PhD students often have RA positions that cover tuition + ¥2,000-8,000/month stipend.',
      },
    ],
    howToSteps: [
      {
        name: 'Estimate your baseline budget',
        text: 'Use the table in section 1 to estimate your baseline monthly budget. Budget tier (¥1,500-3,000), Mid tier (¥2,500-4,500), Comfortable tier (¥4,000-6,000). Multiply by 12 for annual living cost.',
      },
      {
        name: 'Compare cities on total annual cost',
        text: 'Use the table in section 2 to compare cities on total annual cost (tuition + living). Beijing + Shanghai total ¥80,000-130,000/year; Wuhan + Xi\'an total ¥50,000-75,000/year; Harbin + Changsha total ¥40,000-60,000/year. Pick the city that fits your budget without sacrificing university quality.',
      },
      {
        name: 'Account for hidden costs',
        text: 'Add ¥5,000-15,000 one-time for the first year: visa + residence permit, medical insurance, physical exam, airfare, settling-in costs, winter clothing, HSK prep materials. For master\'s/PhD, add ¥3,000-10,000/year for industry visits + travel.',
      },
      {
        name: 'Plan for part-time work',
        text: 'On-campus work (X1 visa, ≤20 hours/week) can cover 30-50% of living costs. Plan on ¥1,500-3,000/month from part-time work. Master\'s/PhD students can often fund their entire degree through RA positions.',
      },
      {
        name: 'Apply for scholarships that cover living costs',
        text: 'CSC scholarship covers tuition + dorm + ¥2,500-3,500/month stipend + airfare — effectively ¥0 total cost. University-specific waivers cover 50-100% of tuition. Provincial scholarships (Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong) cover ¥20,000-50,000/year. Stack all three for a fully funded degree.',
      },
      {
        name: 'Consider food strategy',
        text: 'Campus cafeteria is the cheapest (¥1,800-3,600/month for 3 meals/day). Cooking for yourself cuts the food bill 30-50% but requires an off-campus kitchen. International restaurants are the biggest budget item — limit to 1-2 per week. Most students eat mostly cafeteria + occasional restaurant for ¥2,500-4,000/month total.',
      },
      {
        name: 'Use student discounts aggressively',
        text: 'Student metro pass (¥100-200/month), student rail discount (75% off hard-seat trains), student ID discounts at museums, cultural sites, and some restaurants. Always carry your student ID. Saves ¥500-2,000/month in a Tier 1 city.',
      },
      {
        name: 'Plan for exchange-rate + remittance',
        text: 'If your family sends money from abroad, use a Chinese bank account (Bank of China, ICBC, or your university\'s partner bank). Remittance fees: ¥100-300 per transfer + 1-3% FX margin. Better: use Wise, Revolut, or Alipay+ for lower fees. Plan to transfer monthly or quarterly to reduce FX exposure.',
      },
    ],
    ctaTitle: 'Need help budgeting your China degree?',
    ctaSubtitle:
      'SICA counselors help you compare city costs, apply for tuition waivers and CSC scholarships, and plan your living budget. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/cost-of-living',
        label: 'Cost of living in China',
        description: 'Real monthly budgets for housing, food, transport, phone, healthcare, and entertainment. City-by-city breakdown.',
      },
      {
        href: '/cheapest-universities-china',
        label: 'Cheapest universities in China',
        description: 'Every Chinese university ranked by undergraduate tuition — including dorm + insurance estimates.',
      },
      {
        href: '/best-cities-china-international-students',
        label: 'Best cities in China for international students',
        description: 'City-by-city comparison — university quality, cost, international community, career opportunities.',
      },
    ],
  },
  zh: {
    slug: 'cost-of-living-china-by-city',
    eyebrow: '指南 · 成本',
    title: '2026 中国各城市生活费对比',
    description:
      '中国国际生各城市生活成本对比——北京、上海、杭州、武汉、西安、成都等。',
    subtitle:
      '同样月预算在不同中国城市能买到的生活方式差异巨大。数据、排名如下。',
    stats: [
      { value: '¥1,500-5,000', label: '月生活费范围' },
      { value: '3 倍', label: '成本差异（一线 vs 三线）' },
      { value: '10+', label: '对比城市数' },
      { value: '¥0', label: '城市间学费差异' },
    ],
    quickAnswer:
      '中国国际生生活费按城市差异 3-4 倍。一线城市（北京、上海、深圳、广州）：简约学生生活方式 ¥3,500-5,000/月。二线城市（杭州、南京、武汉、西安、成都）：¥2,500-3,500/月。三线城市（哈尔滨、昆明、丽水）：¥1,500-2,500/月。相同大学层级学费跨城市基本相同——变化在生活费，不在学费。武汉或西安旗舰大学（武汉大学、华中科技、西安交大）的同预算购买力比北京或上海同等大学高 40-50%。',
    keyTakeaways: [
      '北京 + 上海约 ¥3,500-5,000/月；武汉 + 西安约 ¥2,500-3,000/月，同样的生活方式',
      '相同大学层级的学费跨城市基本相同——差异在生活费',
      '二/三线城市（武汉、西安、长沙、哈尔滨）以 40-60% 更低成本提供旗舰大学质量',
      '餐饮是最大变量——一线城市国际餐厅多且贵',
      '住宿是第二大变量——校内宿舍 ¥800-2,500/月，取决于城市 + 房型',
      '交通全国便宜——学生地铁卡 ¥100-200/月，城际高铁短途 ¥50-300',
    ],
    sections: [
      {
        id: 'monthly-budget',
        h2: '月预算明细：¥3,000 在中国能买什么？',
        intro:
          '典型中国国际生月生活费 ¥2,500-5,000。下面是钱花在哪里。',
        blocks: [
          {
            type: 'table',
            caption: '中国国际生典型月预算（¥/月）',
            columns: ['项目', '低预算（¥/月）', '中（¥/月）', '舒适（¥/月）', '备注'],
            rows: [
              ['住宿（校内，双人间）', '500', '1,000', '2,000', '单人间或校外 = 1.5-2 倍'],
              ['餐饮（食堂）', '600', '900', '1,200', '¥20-40/餐 × 3 餐；自己做饭省 30-50%'],
              ['餐饮（混合：食堂 + 餐厅）', '900', '1,500', '2,500', '外出就餐 + 食堂混合'],
              ['交通（公交 + 地铁）', '60', '120', '200', '地铁学生折扣'],
              ['手机 + 网络', '50', '80', '120', '¥50-100/月'],
              ['教材 + 学习用品', '50', '100', '200', '多数大学使用数字材料'],
              ['个人 + 娱乐', '300', '600', '1,200', '电影、外出、购物、爱好'],
              ['健身 / 运动', '0', '50', '150', '多数大学有免费校内健身房'],
              ['中国境内旅游', '0', '300', '800', '高铁、周末游'],
              ['合计', '¥1,560', '¥3,650', '¥8,370', '年预算 × 12'],
            ],
          },
          {
            type: 'p',
            text: '实用结论：二线城市的预算型学生可凭 ¥2,000-2,500/月活得不错（年生活费 ¥24,000-30,000）。一线城市舒适型生活方式 ¥4,000-6,000/月（年 ¥48,000-72,000）。最大变量是住宿类型 + 餐饮方式 + 旅游习惯。',
          },
        ],
      },
      {
        id: 'cost-by-city-table',
        h2: '所有城市对比：月 + 年成本',
        intro:
          'SICA 目录中至少有一所大学的所有城市，按估算年总成本（学费 + 生活费）排序。学费取自 SICA 数据库；生活费基于学生调查 + 大学生活费估算。',
        blocks: [
          {
            type: 'table',
            caption: '城市生活成本（年：学费 + 住宿 + 生活费）',
            columns: ['#', '城市', '层级', '大学数', '平均学费/年', '生活费/年', '总/年（美元）'],
            rows: [['（从 SICA 数据库加载中…）', '—', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '用本表规划预算。二线城市（武汉、西安、成都）以 40-50% 更低总成本提供旗舰大学质量。',
          },
        ],
      },
      {
        id: 'cheapest-vs-expensive',
        h2: '最便宜 vs 最贵城市：差异在哪？',
        intro:
          '最便宜与最贵中国城市之间国际生差异 3-4 倍——下面是价格差异实际能买什么。',
        blocks: [
          {
            type: 'table',
            caption: '最便宜 vs 最贵中国城市（¥/年，全部费用）',
            columns: ['类别', '最便宜（哈尔滨、昆明）', '中（武汉、西安）', '最贵（北京、上海）'],
            rows: [
              ['学费（平均本科）', '¥16,000-28,000', '¥18,000-35,000', '¥30,000-50,000'],
              ['学费（平均硕士）', '¥18,000-30,000', '¥22,000-40,000', '¥30,000-50,000'],
              ['住宿（校内双人间）', '¥3,000-5,000/年', '¥4,000-7,000/年', '¥5,000-12,000/年'],
              ['餐饮（食堂）', '¥7,000-9,000/年', '¥9,000-12,000/年', '¥12,000-18,000/年'],
              ['餐饮（混合）', '¥9,000-14,000/年', '¥12,000-20,000/年', '¥18,000-30,000/年'],
              ['交通', '¥1,000-1,500/年', '¥1,200-1,800/年', '¥1,500-2,400/年'],
              ['个人 + 娱乐', '¥4,000-7,000/年', '¥6,000-10,000/年', '¥10,000-15,000/年'],
              ['中国境内旅游', '¥2,000-4,000/年', '¥3,000-6,000/年', '¥5,000-10,000/年'],
              ['合计本科（食堂）', '¥34,500-57,000', '¥44,000-75,000', '¥74,000-117,000'],
              ['合计硕士（混合）', '¥37,500-66,500', '¥50,000-83,800', '¥83,000-132,400'],
              ['美元', '$4,900-9,500', '$6,300-12,000', '$10,500-19,000'],
            ],
          },
        ],
      },
      {
        id: 'hidden-costs',
        h2: '隐性成本：除学费 + 生活费外还应预算什么',
        intro:
          '多项一次性和经常性成本不体现在标准预算中。下面是完整清单。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**签证 + 居留许可**——¥400-800/年（首年含 JW202 办理约 ¥200 额外）',
              '**医疗保险**——¥800/年，X1 签证持有人法定要求',
              '**体检**——抵华一次性 ¥500-800（居留许可必需）',
              '**抵华机票**——根据出发国 ¥3,000-8,000 单程；CSC 奖学金覆盖往返',
              '**安家费（首月）**——¥2,000-5,000（宿舍押金、床上用品、厨房用品、手机开户、银行账户）',
              '**冬季衣物**——¥1,000-3,000（来自热带国家的学生可能需要真正的冬装；中国北方很冷）',
              '**HSK 备考材料**——¥500-2,000（多数项目含免费中文课）',
              '**硕士/博士行业参观 + 出差**——¥3,000-10,000/年（工程/MBA 常需实地考察）',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSC 奖学金覆盖学费 + 住宿 + ¥2,500-3,500/月补贴 + 往返机票 + 安家费。对前 30 名大学，学生实际总成本为 ¥0。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '北京 vs 上海生活成本？',
        a: '北京和上海成本相似——简约学生生活方式 ¥3,500-5,000/月（住宿 + 餐饮 + 交通 + 手机 + 偶尔娱乐）。上海校外房租和国际餐厅略贵；北京空气质量治理（空气净化器等）略贵。总成本差异通常 <10%。',
      },
      {
        q: '中国主要城市最便宜的是哪个？',
        a: '主要大学城市中，哈尔滨最便宜（生活费 ¥24,000-36,000/年 + 哈工大/哈工程学费 ¥16,000-28,000/年）。长沙、西安、成都、天津、武汉是下一档便宜的 Tier 1.5 城市（生活费 ¥28,000-42,000/年）。旗舰质量大学城市最便宜的是武汉和西安（武大、华中科技、西安交大——均国内前 30，生活费均低于 ¥42,000/年）。',
      },
      {
        q: '杭州生活费多少？',
        a: '杭州中端：简约学生生活方式 ¥3,000-4,000/月。城市在 SICA 目录中有 6 所顶尖大学（浙大、浙工大、浙财大、浙外大、中国计量大学、西湖大学），成本低于北京/上海但高于武汉/西安。杭州是科技导向学生性价比好的选择。',
      },
      {
        q: '中国宿舍租金多少？',
        a: '校内宿舍：¥500-2,000/月，取决于城市和房型。双人间（最常见）¥500-1,000/月；单人间 ¥1,000-1,800/月；套间（少见）¥1,800-3,000/月。校外公寓：¥1,500-4,000/月/一居，取决于城市（北京/上海最贵，哈尔滨/长沙最便宜）。多数国际生第一年住校内宿舍，第二年搬校外。',
      },
      {
        q: '中国餐饮多少钱？',
        a: '校园食堂：¥20-40/餐 = ¥1,800-3,600/月（每日 3 餐，30 天）。混合（食堂 + 餐厅）：¥2,500-5,000/月。多数餐厅/自己做饭：¥3,000-6,000/月。国际餐饮是大变量：西餐厅 ¥80-200/人，中式食堂 ¥15-30。自己做饭可节省 30-50% 餐饮开支（食材 ¥1,000-2,000/月）。',
      },
      {
        q: '中国比美国便宜吗？',
        a: '是的，显著便宜。一线城市顶尖中国大学年度总成本：¥80,000-130,000（11,000-18,000 美元）。美国可比公立大学年度总成本：35,000-55,000 美元。顶尖美国私立大学：70,000-85,000 美元。所以中国比美国便宜 3-7 倍，取决于比较点，并获得全球认证学位 + 中国市场校友网络。',
      },
      {
        q: '中国交通多少钱？',
        a: '公共交通很便宜。一线城市学生地铁卡：¥100-200/月（成人价 ¥2-8/次）。公交：¥1-2/次。城际高铁短途：¥50-300（北京-天津 30 分钟 ¥55；上海-杭州 45 分钟 ¥80；北京-西安 4.5 小时 ¥515）。学生折扣：硬座/硬卧 75% 折扣；部分城际铁路学生折扣。国际机票：¥3,000-8,000 单程，取决于出发国。',
      },
      {
        q: '中国可以兼职支付生活费吗？',
        a: '可以——持 X1 学生签证经学校国际学生办公室批准后可做 ≤20 小时/周的校内工作。典型校内岗位：图书馆助理、实验室助理、宿舍 RA、研究助理、中文家教（教来华学英语的中国学生）、食堂收银员。多数国际生月入 ¥1,500-3,000——可覆盖 30-50% 生活费。校外工作受限但可申请提前批准。硕士/博士生常通过 RA 岗位资助整个学位。',
      },
    ],
    howToSteps: [
      {
        name: '估算基础预算',
        text: '使用第 1 节表格估算基础月预算。低预算（¥1,500-3,000），中（¥2,500-4,500），舒适（¥4,000-6,000）。年生活费 × 12。',
      },
      {
        name: '对比城市年总成本',
        text: '使用第 2 节表格对比城市年总成本（学费 + 生活费）。北京 + 上海合计 ¥80,000-130,000/年；武汉 + 西安 ¥50,000-75,000/年；哈尔滨 + 长沙 ¥40,000-60,000/年。选符合预算且不牺牲大学质量的城市。',
      },
      {
        name: '预留隐性成本',
        text: '首年加 ¥5,000-15,000 一次性费用：签证 + 居留许可、医疗保险、体检、机票、安家费、冬装、HSK 备考材料。硕士/博士加 ¥3,000-10,000/年行业参观 + 出差。',
      },
      {
        name: '规划兼职',
        text: '校内工作（X1 签证，≤20 小时/周）可覆盖 30-50% 生活费。预计月入 ¥1,500-3,000。硕士/博士生常通过 RA 岗位资助整个学位。',
      },
      {
        name: '申请覆盖生活费的奖学金',
        text: 'CSC 覆盖学费 + 住宿 + ¥2,500-3,500/月补贴 + 机票——实际总成本 ¥0。院校减免 50-100% 学费。省市奖学金（北京、上海、江苏、浙江、广东）¥20,000-50,000/年。叠加申请以全额资助学位。',
      },
      {
        name: '规划餐饮策略',
        text: '校园食堂最便宜（每日 3 餐 ¥1,800-3,600/月）。自己做饭节省 30-50%，但需要校外厨房。国际餐厅是最大预算项——限制在每周 1-2 次。多数学生主要食堂 + 偶尔餐厅，总计 ¥2,500-4,000/月。',
      },
      {
        name: '善用学生折扣',
        text: '学生地铁卡（¥100-200/月）、学生铁路票（硬座 75% 折扣）、学生证博物馆、文化景点、部分餐厅折扣。始终携带学生证。一线城市可节省 ¥500-2,000/月。',
      },
      {
        name: '规划汇率 + 汇款',
        text: '如果家人从海外汇款，开设中国银行账户（中国银行、工商银行或大学合作银行）。汇款费：¥100-300/次 + 1-3% 汇率差。更好选择：Wise、Revolut 或支付宝+（费用更低）。月度或季度汇款以降低汇率风险。',
      },
    ],
    ctaTitle: '需要帮你规划留学预算？',
    ctaSubtitle:
      'SICA 顾问可帮你对比城市成本、申请学费减免与 CSC 奖学金、规划生活费。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/cost-of-living',
        label: '中国留学生活费',
        description: '月度真实预算：住房、餐饮、交通、手机、医疗、娱乐，按城市拆分。',
      },
      {
        href: '/cheapest-universities-china',
        label: '中国最便宜的大学',
        description: '所有中国大学按本科学费排序——含住宿与保险估算。',
      },
      {
        href: '/best-cities-china-international-students',
        label: '中国国际生最佳城市',
        description: '城市间对比——大学质量、成本、国际社区、就业机会。',
      },
    ],
  },
};