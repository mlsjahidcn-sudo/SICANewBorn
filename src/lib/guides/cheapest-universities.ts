import type { LocalizedGuide } from './types';

/**
 * "Cheapest Universities in China for International Students"
 * — long-form guide. Target queries: "cheapest universities china",
 * "affordable universities china", "low tuition china", "cheap
 * mbbs china".
 *
 * Page wrapper fetches the live university list from the DB and
 * injects it into the `cheapest-universities-table` block at
 * render time, sorted ASC by undergraduate tuition.
 */
export const cheapestUniversitiesGuide: LocalizedGuide = {
  en: {
    slug: 'cheapest-universities-china',
    eyebrow: 'GUIDE · BUDGET',
    title: 'Cheapest Universities in China for International Students (2026)',
    description:
      'Every Chinese university in the SICA catalog ranked by undergraduate tuition — including dorm + insurance estimates, scholarship options, and the real all-in budget.',
    subtitle:
      'Studying in China is one of the most affordable paths to a globally-recognized degree. Here is exactly what it costs — by university, by program, by city.',
    stats: [
      { value: '¥14K+', label: 'Lowest undergrad tuition/year' },
      { value: '¥18-22K', label: 'Realistic all-in budget/yr' },
      { value: 'LIVE', label: 'Universities ranked below' },
      { value: '50-100%', label: 'Scholarships available' },
    ],
    quickAnswer:
      'Studying in China costs ¥14,000-45,000/year for undergraduate tuition at English-medium programs. The cheapest bachelor programs in the SICA catalog start at ¥14,000-18,000/year (about USD 2,000-2,500). Add ¥4,000-8,000/year for an on-campus dorm, ~¥800/year for medical insurance, and ¥18,000-30,000/year for living costs (outside Tier 1 cities) — realistic all-in budget is ¥36,800-65,000/year (USD 5,200-9,200). Most universities waive 50-100% of tuition for top applicants via their own scholarship programs; the Chinese Government Scholarship (CSC) can fully fund tuition + dorm + ¥2,500/month stipend.',
    keyTakeaways: [
      'Bachelor tuition starts at ¥14,000/year (USD 2,000) — about 1/30 the cost of US private universities',
      'All-in budget ¥36,800-65,000/year including tuition, dorm, insurance, and living costs',
      'English-medium bachelor programs are available at the cheapest universities (China Jiliang, Zhejiang International Studies, several Guangxi/Hunan regional universities)',
      'CSC scholarship covers full tuition + dorm + ¥2,500/month stipend for top applicants',
      'Most universities waive 50-100% of tuition via their own scholarship programs — apply early',
      'Tier 2/3 cities (Wuhan, Xi\'an, Changsha, Kunming, Hangzhou) offer flagship-university quality at lower living costs',
    ],
    sections: [
      {
        id: 'what-cheap-means',
        h2: 'What "cheap" actually means in China',
        intro:
          'A Chinese university might list ¥18,000/year for tuition, but your real budget includes dorm, insurance, food, transport, and visa fees. Here is the full breakdown.',
        blocks: [
          {
            type: 'table',
            caption: 'Realistic all-in annual budget for an international student in China',
            columns: ['Item', 'Low estimate (¥/year)', 'High estimate (¥/year)', 'Notes'],
            rows: [
              ['Tuition (bachelor, English-medium)', '14,000', '45,000', 'Top universities charge more; lower-tier cities less'],
              ['On-campus dorm (double room)', '4,000', '8,000', 'Single rooms + private bath cost more'],
              ['Medical insurance', '800', '1,000', 'Required by law for X1 visa holders'],
              ['Visa + residence permit', '400', '800', 'Year 1 includes JW202 processing'],
              ['Food (campus cafeteria)', '7,200', '14,400', '¥20-40/meal × 3 meals/day'],
              ['Transport (bus + metro)', '600', '1,800', 'Student discount on metro'],
              ['Phone + internet', '600', '1,200', '¥50-100/month'],
              ['Books + supplies', '500', '1,500', 'Year 1 may need more'],
              ['Personal + entertainment', '3,000', '6,000', '¥250-500/month'],
              ['TOTAL (low estimate)', '31,100', '—', 'USD ~4,400/year'],
              ['TOTAL (high estimate)', '—', '79,700', 'USD ~11,200/year'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'All figures are 2025-2026 published rates sourced from each university\'s official admissions page. Verify the latest rates with SICA before applying — universities update fees annually.',
          },
        ],
      },
      {
        id: 'cheapest-universities-table',
        h2: 'All universities ranked by undergraduate tuition',
        intro:
          'Every university in the SICA catalog with published tuition data, sorted by lowest undergraduate tuition first. Dorm + insurance are listed on each university\'s profile page.',
        blocks: [
          {
            type: 'table',
            caption: 'Universities ranked by undergraduate tuition (lowest first)',
            columns: ['#', 'University', 'City', 'Undergrad tuition', 'Graduate tuition', 'Rank', 'Type'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Low tuition does NOT mean low quality. Several universities in this list are MOE-recognized, English-medium, and graduate thousands of international students each year.',
          },
        ],
      },
      {
        id: 'cheap-vs-quality',
        h2: 'Cheap vs. quality: do trade-offs exist?',
        intro:
          'Yes — but mostly in the wrong places. The deciding factors for "is this university worth it?" are usually fit (program + city) and English-medium availability, not the headline tuition.',
        blocks: [
          {
            type: 'p',
            text: 'For most disciplines, the cheapest universities in this table are perfectly good schools — MOE-recognized, English-medium at the master\'s level, and (for many bachelor programs) English-medium too. The trade-off is usually one of three things:',
          },
          {
            type: 'ul',
            items: [
              '**City tier** — cheaper universities are often in Tier 2/3 cities (Wuhan, Xi\'an, Changsha, Kunming, Hangzhou, Hefei). Living costs and lifestyle differ from Beijing/Shanghai/Shenzhen. For some students this is a feature (lower cost, less hectic); for others a bug (fewer international amenities).',
              '**Bachelor English-medium availability** — most cheap universities offer English-medium master\'s programs but fewer English-medium bachelor programs. If you want a fully English-medium bachelor\'s, you\'ll narrow your options to a subset of schools (the table sorts by tuition regardless of language — filter the live /programs page by language: English to see only English-medium options).',
              '**Research intensity** — Tier 1 universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong) have stronger research output and global brand recognition. If your goal is academia or a globally-recognized CV, the higher tuition may be worth it. If your goal is "affordable, accredited, recognized degree that lets me work in China or my home country," a cheaper university is the right call.',
            ],
          },
          {
            type: 'h3',
            text: 'Cheap + English-medium bachelor programs',
            body:
              'As of 2026, the cheapest fully English-medium bachelor programs in the SICA catalog are: Zhejiang International Studies University (Hangzhou, ~¥18,000/year), China Jiliang University (Hangzhou, ~¥18,000/year), several Hunan regional universities (¥14,000-22,000/year), and several Guangxi universities (¥14,000-20,000/year, especially strong for international students from ASEAN countries).',
          },
        ],
      },
      {
        id: 'scholarships-cheap',
        h2: 'Scholarships that stack with low tuition',
        intro:
          'Three scholarship layers can stack — apply for all three in parallel to maximize your chance of a fully funded seat even at the cheapest universities.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — covers full tuition + dorm + ¥2,500/month stipend + round-trip airfare. Awarded regardless of which university hosts you — even a ¥14,000/year university gets fully covered. ~3,000 awards per year across all Chinese universities.',
              '**University-specific tuition waivers** — most cheap universities waive 50-100% of tuition for students with GPA 3.5+ in their high school (bachelor) or bachelor\'s (master). Application is automatic when you apply for admission — no separate form.',
              '**Provincial government scholarships** — Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong all offer ¥20,000-50,000/year for international students at local universities. SICA helps you identify which provinces match your target school.',
              '**Confucius Institute Scholarship** — fully funded 1-year Chinese language program at any Confucius Institute worldwide, plus a follow-on scholarship for a bachelor\'s at a Chinese university. Open to students with strong academic records.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'You can apply for CSC and university-specific waivers in parallel, but you can only hold ONE at a time. Universities decide which award is higher if both come through.',
          },
        ],
      },
      {
        id: 'city-cost-comparison',
        h2: 'City cost comparison: where your money goes furthest',
        intro:
          'The same ¥18,000/year tuition buys dramatically different lifestyles depending on the city. Here is what the same monthly budget looks like in four representative cities.',
        blocks: [
          {
            type: 'table',
            caption: 'Monthly living costs in 4 representative Chinese university cities (¥/month, dorm + food + transport + phone + entertainment)',
            columns: ['City', 'Budget tier 1', 'Budget tier 2', 'Notes'],
            rows: [
              ['Beijing', '4,500', '3,000', 'Tier 1; international hub'],
              ['Shanghai', '4,500', '3,000', 'Tier 1; financial center'],
              ['Wuhan', '2,500', '1,500', 'Tier 2; flagship universities'],
              ['Xi\'an', '2,500', '1,500', 'Tier 2; affordable'],
              ['Changsha', '2,200', '1,400', 'Tier 2; food capital'],
              ['Kunming', '2,200', '1,400', 'Tier 2; mild climate'],
              ['Hangzhou', '3,000', '2,000', 'Tier 2; tech hub'],
              ['Hefei', '2,000', '1,300', 'Tier 2; USTC + Hefei uni'],
            ],
          },
          {
            type: 'p',
            text: 'Practical advice: if your budget is tight, pick a university in a Tier 2 city with a flagship program. You\'ll get the same degree, the same faculty, the same accreditation, at 40-50% lower living costs than Tier 1.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the cheapest university in China for international students?',
        a: 'Among universities in the SICA catalog, China Jiliang University, Zhejiang International Studies University, and several Hunan/Guangxi regional universities offer English-medium bachelor programs starting at ¥14,000-18,000/year — the lowest in the country. All are MOE-recognized, all accept international students, all teach in English at the bachelor level.',
      },
      {
        q: 'How much does it cost to study in China per year (all-in)?',
        a: 'A realistic all-in budget for a low-cost Chinese university: ¥14,000-22,000 tuition + ¥4,000-8,000 dorm + ¥800 insurance + ¥18,000-30,000 living = ¥36,800-60,800/year (~USD 5,200-8,600). Tier 1 city universities (Tsinghua, Peking, Fudan, Shanghai Jiao Tong) run ¥80,000-130,000/year all-in. Most universities waive 30-100% of tuition for top applicants.',
      },
      {
        q: 'Are there scholarships for low-tuition universities?',
        a: 'Yes. Three layers stack: (1) Chinese Government Scholarship (CSC) — full tuition + dorm + ¥2,500/month stipend, awarded regardless of which university hosts you; (2) university-specific tuition waivers — most low-cost universities waive 50-100% of tuition for students with GPA 3.5+; (3) provincial government scholarships (Beijing, Shanghai, Jiangsu, Zhejiang, etc.) — typically ¥20,000-50,000/year. SICA helps you stack all three.',
      },
      {
        q: 'Is a cheap Chinese university still good quality?',
        a: 'For most disciplines, yes. Many "cheap" universities in the SICA catalog are MOE-recognized, English-medium, and graduate thousands of international students each year. The cheapest options are typically outside Tier 1 cities — Wuhan University, Xi\'an Jiaotong, Central South, Huazhong University of Science and Technology routinely appear in global QS / ARWU rankings at top-500 positions. The deciding factors are usually fit (program + city) and English-medium availability, not the headline tuition.',
      },
      {
        q: 'Do cheap Chinese universities teach in English?',
        a: 'It depends on the program, not the price. Most bachelor programs at low-tuition regional universities are taught in Chinese (you\'ll need HSK 4-5). Several — including Zhejiang International Studies, China Jiliang, and a handful of Guangxi/Hunan medical universities — offer fully English-medium programs at low tuition. Filter by "language: English" on the /programs page to see only English-medium options.',
      },
      {
        q: 'What is included in the tuition fee?',
        a: 'Tuition covers academic instruction, use of campus facilities (library, labs, gym), and access to student services. It does NOT typically include: dorm (¥4,000-12,000/year extra), textbooks (¥500-1,500/year), medical insurance (~¥800/year), visa/residence permit (~¥400-800/year), or meals (¥600-1,200/month). A handful of "package" programs (especially MBBS) bundle dorm + insurance + visa — check the program page for the breakdown.',
      },
      {
        q: 'How much does living cost in China on a budget?',
        a: 'Outside Beijing/Shanghai/Shenzhen: ¥1,500-2,500/month covers dorm + 3 meals/day in the cafeteria + bus/metro + phone + occasional entertainment. Tier 1 cities: ¥3,000-4,500/month. Cooking for yourself (rather than eating all meals in the cafeteria) cuts the food bill by 30-50%. Many universities also offer part-time library / lab / admin assistant jobs for international students (legal under X1 visa with school permission) that cover another 30-50% of your living costs.',
      },
      {
        q: 'Can I work part-time while studying at a cheap Chinese university?',
        a: 'Yes — under the X1 student visa, you can work part-time (≤20 hours/week) on campus with permission from your university\'s international student office. Typical on-campus roles: library assistant, lab assistant, dorm RA, research assistant, Chinese-language tutor (for incoming Chinese students learning English), cafeteria cashier. Off-campus work is restricted but possible with prior approval. Most international students earn ¥1,500-3,000/month this way — enough to cover 30-50% of living costs.',
      },
    ],
    howToSteps: [
      {
        name: 'Sort universities by your budget',
        text: 'Use the table on this page (sorted ASC by undergrad tuition) to identify 3-5 schools that fit your annual budget. Most students focus on the top 10 — the tuition gap widens significantly after that.',
      },
      {
        name: 'Check English-medium availability',
        text: 'Tuition is only one factor. Visit each university\'s /programs page and filter by "language: English" to confirm your target program is taught in English. Several cheap universities offer only Chinese-medium at the bachelor\'s level.',
      },
      {
        name: 'Apply for university-specific waivers',
        text: 'Most cheap universities waive 50-100% of tuition for top applicants. Application is automatic when you apply for admission — no separate form. Submit your application with strong GPA (3.5+) and IELTS/TOEFL (6.5+/90+) to maximize the waiver.',
      },
      {
        name: 'Apply for CSC scholarship in parallel',
        text: 'Even at a cheap university, CSC can cover tuition + dorm + ¥2,500/month stipend + airfare. Apply via the CSC portal (campuschina.org) by mid-April for September intake. Same timeline as university admissions but a separate system.',
      },
      {
        name: 'Look at provincial scholarships',
        text: 'Each province (Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong, etc.) runs its own scholarship program — typically ¥20,000-50,000/year. Check your target province\'s international education exchange council website for the latest cycle.',
      },
      {
        name: 'Budget the full year, not just tuition',
        text: 'Add dorm, insurance, visa, food, transport, phone, and entertainment to get the real all-in budget. The table on this page lists each line item. Tier 2/3 cities can save 40-50% on living costs vs Tier 1.',
      },
      {
        name: 'Plan for part-time on-campus work',
        text: 'Under the X1 visa you can work ≤20 hours/week on campus with your university\'s permission. Most international students earn ¥1,500-3,000/month — enough to cover 30-50% of living costs. Ask your target university\'s international student office about available roles.',
      },
      {
        name: 'Confirm rates before applying',
        text: 'Tuition figures on this page are 2025-2026 published rates. Universities update fees annually (typically 0-5% increase). Verify the latest rate with SICA or directly with the university\'s international student office before submitting your application.',
      },
    ],
    ctaTitle: 'Need help budgeting your China degree?',
    ctaSubtitle:
      'SICA counselors help you compare costs, apply for tuition waivers and CSC scholarships, and plan your living budget city-by-city. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/scholarships',
        label: 'Scholarships to study in China',
        description: 'CSC, Confucius, university-specific, and provincial scholarships — what each covers and how to apply.',
      },
      {
        href: '/guides/cost-of-living',
        label: 'Cost of living in China',
        description: 'Real monthly budgets for housing, food, transport, phone, healthcare, and entertainment. City-by-city breakdown.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China (2026 ranking)',
        description: 'Every Chinese university ranked by domestic ranking + QS World — the SEO/GEO canonical list.',
      },
    ],
  },
  zh: {
    slug: 'cheapest-universities-china',
    eyebrow: '指南 · 预算',
    title: '2026 来华留学最便宜的大学（国际生）',
    description:
      'SICA 目录中所有中国大学按本科学费排名——含住宿与保险估算、奖学金选项、真实总预算。',
    subtitle:
      '来华留学是获得全球认证学位的最经济路径之一。下面按大学、按项目、按城市拆解实际费用。',
    stats: [
      { value: '¥1.4 万+', label: '最低本科学费/年' },
      { value: '¥1.8-2.2 万', label: '真实年度总预算' },
      { value: '实时', label: '下方排名大学数' },
      { value: '50-100%', label: '可申请奖学金比例' },
    ],
    quickAnswer:
      '来华本科英文授课项目学费 ¥14,000-45,000/年。SICA 目录中最便宜的本科学费 ¥14,000-18,000/年（约 2,000-2,500 美元）。加上校内住宿 ¥4,000-8,000/年、医疗保险 ~¥800/年、非一线城市生活费 ¥18,000-30,000/年，真实总预算 ¥36,800-65,000/年（5,200-9,200 美元）。多数大学通过自有奖学金项目为优秀申请者减免 50-100% 学费；中国政府奖学金（CSC）可全额覆盖学费 + 住宿 + ¥2,500/月生活补贴。',
    keyTakeaways: [
      '本科学费 ¥14,000/年起（2,000 美元）——约为美国私立大学的 1/30',
      '真实总预算 ¥36,800-65,000/年（含学费、住宿、保险、生活费）',
      '最便宜大学也提供英文授课本科项目（中国计量大学、浙江外国语学院、广西/湖南多所地方高校）',
      'CSC 奖学金可覆盖全额学费 + 住宿 + ¥2,500/月生活补贴',
      '多数大学通过自有奖学金项目减免 50-100% 学费——尽早申请',
      '二线/三线城市（武汉、西安、长沙、昆明、杭州）以更低生活费提供一流大学质量',
    ],
    sections: [
      {
        id: 'what-cheap-means',
        h2: '"便宜"在中国的真实含义',
        intro:
          '一所中国大学可能学费 ¥18,000/年，但你的真实预算还包含住宿、保险、餐饮、交通、签证。完整明细如下。',
        blocks: [
          {
            type: 'table',
            caption: '中国国际生年度真实总预算',
            columns: ['项目', '低估值（¥/年）', '高估值（¥/年）', '备注'],
            rows: [
              ['学费（本科，英文授课）', '14,000', '45,000', '顶尖大学更贵，低线城市更低'],
              ['校内住宿（双人间）', '4,000', '8,000', '单人间 + 独立卫浴更贵'],
              ['医疗保险', '800', '1,000', 'X1 签证持有人法定要求'],
              ['签证 + 居留许可', '400', '800', '第一年含 JW202 办理'],
              ['餐饮（校园食堂）', '7,200', '14,400', '¥20-40/餐 × 每日三餐'],
              ['交通（公交 + 地铁）', '600', '1,800', '地铁学生折扣'],
              ['手机 + 网络', '600', '1,200', '¥50-100/月'],
              ['教材 + 学习用品', '500', '1,500', '第一年可能更多'],
              ['个人 + 娱乐', '3,000', '6,000', '¥250-500/月'],
              ['合计（低估值）', '31,100', '—', '约 4,400 美元/年'],
              ['合计（高估值）', '—', '79,700', '约 11,200 美元/年'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '所有数据为各校官方招生网 2025-2026 学年公布数据。申请前请联系 SICA 或学校核实最新数据——大学每年都会更新费用。',
          },
        ],
      },
      {
        id: 'cheapest-universities-table',
        h2: '所有大学按本科学费排序',
        intro:
          'SICA 目录中所有公布了学费数据的大学，按本科学费由低到高排序。住宿与保险费详见各校主页。',
        blocks: [
          {
            type: 'table',
            caption: '按本科学费由低到高排名',
            columns: ['#', '大学', '城市', '本科学费', '研究生学费', '排名', '类型'],
            rows: [['（从 SICA 数据库加载中…）', '—', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '学费低不等于质量低。本表多所大学均教育部认可、英文授课、每年毕业数千名国际生。',
          },
        ],
      },
      {
        id: 'cheap-vs-quality',
        h2: '便宜 vs 质量：有取舍吗？',
        intro:
          '有——但通常不在你想象的地方。"这所大学值不值得"通常取决于专业匹配、城市氛围、英文授课可得性，而非学费数字本身。',
        blocks: [
          {
            type: 'p',
            text: '对大多数学科而言，本表中"最便宜"的大学完全是合格的学校——教育部认可、英文授课硕士项目（许多本科也是）、每年毕业数千名国际生。取舍通常是以下三种之一：',
          },
          {
            type: 'ul',
            items: [
              '**城市层级**——便宜的大学常位于二线/三线城市（武汉、西安、长沙、昆明、杭州、合肥）。生活费与生活节奏与北上深不同。对一些学生这是优点（成本低、不那么紧张）；对另一些是缺点（国际设施较少）。',
              '**本科英文授课可得性**——多数便宜大学提供英文授课硕士项目，但英文授课本科项目较少。如果你想要全英文本科，可选学校会缩窄至子集（表格按学费排序，不分语言；在 /programs 页面按"语言：English"筛选可只看英文授课项目）。',
              '**研究强度**——一线大学（清华、北大、复旦、上海交大）研究产出与全球品牌更强。如果你目标是学术或全球认证简历，高学费可能值得；如果你目标是"可负担、被认证、被认可的学位，让我能在中国或回国工作"，便宜大学是正确的选择。',
            ],
          },
          {
            type: 'h3',
            text: '便宜 + 英文授课本科项目',
            body:
              '截至 2026 年，SICA 目录中最便宜的全英文授课本科项目包括：浙江外国语学院（杭州，约 ¥18,000/年）、中国计量大学（杭州，约 ¥18,000/年）、湖南若干地方高校（¥14,000-22,000/年）、广西若干高校（¥14,000-20,000/年，对东盟国际生尤其友好）。',
          },
        ],
      },
      {
        id: 'scholarships-cheap',
        h2: '与低学费叠加的奖学金',
        intro:
          '三层奖学金可叠加——并行申请所有三种以最大化获得全额资助的机会，即使在最便宜的大学也一样。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——覆盖全额学费 + 住宿 + ¥2,500/月生活补贴 + 往返机票。无论你在哪所大学就读都能获奖（即使是 ¥14,000/年的大学）。每年约 3,000 个名额。',
              '**院校学费减免**——多数便宜大学为高中 GPA 3.5+（本科）或本科 GPA 3.5+（硕士）的学生减免 50-100% 学费。随入学申请自动评审，无需单独表格。',
              '**省市奖学金**——北京、上海、江苏、浙江、广东均提供 ¥20,000-50,000/年的国际生奖学金。SICA 可帮你识别目标学校所在的省份项目。',
              '**孔子学院奖学金**——全额资助 1 年汉语语言项目（全球任意孔子学院），后续衔接中国大学本科学位。学业成绩优秀者可申请。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC 与院校学费减免可并行申请，但最终只能获得其一。若两项均获批，学校会按金额较高的执行。',
          },
        ],
      },
      {
        id: 'city-cost-comparison',
        h2: '城市成本对比：同样预算哪里过得更舒服',
        intro:
          '同样的 ¥18,000/年学费，因城市不同生活方式差异巨大。下面是 4 个代表性城市的同月预算对比。',
        blocks: [
          {
            type: 'table',
            caption: '4 个代表性大学城市月生活费（¥/月，住宿 + 餐饮 + 交通 + 手机 + 娱乐）',
            columns: ['城市', '预算档 1', '预算档 2', '备注'],
            rows: [
              ['北京', '4,500', '3,000', '一线，国际枢纽'],
              ['上海', '4,500', '3,000', '一线，金融中心'],
              ['武汉', '2,500', '1,500', '二线，旗舰大学云集'],
              ['西安', '2,500', '1,500', '二线，宜居'],
              ['长沙', '2,200', '1,400', '二线，美食之都'],
              ['昆明', '2,200', '1,400', '二线，气候温和'],
              ['杭州', '3,000', '2,000', '二线，科技中心'],
              ['合肥', '2,000', '1,300', '二线，中科大所在地'],
            ],
          },
          {
            type: 'p',
            text: '实用建议：预算紧张时，挑选二线城市的旗舰大学。同样的学位、同样的师资、同样的认证，生活费比一线低 40-50%。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国最便宜的大学是哪所？',
        a: '在 SICA 目录中，中国计量大学、浙江外国语学院及湖南、广西的若干地方高校开设有学费 ¥14,000-18,000/年的英文授课本科项目，是全国最低价位。所有学校均获教育部认可、招收国际生、本科阶段提供英文授课。',
      },
      {
        q: '来华留学一年的全部费用大概多少？',
        a: '低费用大学的真实预算：学费 ¥14,000-22,000 + 住宿 ¥4,000-8,000 + 保险 ¥800 + 生活费 ¥18,000-30,000 = 合计 ¥36,800-60,800/年（约 5,200-8,600 美元）。一线城市顶尖高校（清华、北大、复旦、上海交大）合计 ¥80,000-130,000/年。多数大学为优秀申请者减免 30-100% 学费。',
      },
      {
        q: '学费低的大学也有奖学金吗？',
        a: '有。三层叠加：（1）中国政府奖学金（CSC）——全额学费 + 住宿 + ¥2,500/月生活补贴，与所在学校无关；（2）院校学费减免——多数低学费大学为 GPA 3.5+ 申请者减免 50-100% 学费；（3）省市奖学金（北京、上海、江苏、浙江等）——通常 ¥20,000-50,000/年。SICA 可协助并行申请。',
      },
      {
        q: '便宜的大学教学质量有保障吗？',
        a: '对大多数学科来说，有保障。SICA 目录中的许多"便宜"大学均获教育部认可、提供英文授课、每年毕业数千名国际生。最便宜的选项通常位于一线城市之外——武汉大学、西安交大、中南大学、华中科技大学等常年位列 QS / ARWU 全球前 500 名。决定因素通常是匹配度（专业 + 城市）与英文授课可得性，而非学费数字本身。',
      },
      {
        q: '学费低的大学是否英文授课？',
        a: '取决于具体专业，与价格无关。多数低学费地方大学的本科项目为中文授课（需 HSK 4-5）。但部分学校——包括浙江外国语学院、中国计量大学及广西、湖南的少数医学院——在低学费下提供全英文授课项目。在 /programs 页面按"语言：English"筛选即可查看所有英文授课选项。',
      },
      {
        q: '学费包含哪些内容？',
        a: '学费覆盖课堂教学、校园设施使用（图书馆、实验室、健身房）、学生服务。通常不含：住宿（¥4,000-12,000/年）、教材（¥500-1,500/年）、医疗保险（~¥800/年）、签证/居留许可（~¥400-800/年）、餐饮（¥600-1,200/月）。少数"套餐"项目（尤其 MBBS）会打包住宿 + 保险 + 签证——具体见项目页面说明。',
      },
      {
        q: '中国低预算生活成本如何？',
        a: '北京、上海、深圳以外：¥1,500-2,500/月可覆盖住宿 + 食堂三餐 + 公交地铁 + 手机 + 偶尔娱乐。一线城市：¥3,000-4,500/月。自己做饭（而非全部食堂）可节省 30-50% 餐饮开支。多数大学还提供校内兼职（图书馆助理、实验室助理、宿舍 RA、研究助理、中文家教等），合法且收入 ¥1,500-3,000/月，可覆盖 30-50% 生活费。',
      },
      {
        q: '在便宜的中国大学可以兼职吗？',
        a: '可以。持 X1 学生签证经学校国际学生办公室批准后可做 ≤20 小时/周的校内兼职。常见岗位：图书馆助理、实验室助理、宿舍 RA、研究助理、中文家教（教来华学英语的中国学生）、食堂收银员。校外工作受限但可申请提前批准。多数国际生月收入 ¥1,500-3,000，可覆盖 30-50% 生活费。',
      },
    ],
    howToSteps: [
      {
        name: '按预算排序大学',
        text: '使用本页表格（本科学费由低到高排序）挑选 3-5 所符合年度预算的大学。多数学生关注前 10 名——之后的学费差距显著拉大。',
      },
      {
        name: '确认英文授课可得性',
        text: '学费只是其中一个因素。访问各校 /programs 页面按"语言：English"筛选，确认目标专业是英文授课。若干便宜大学本科阶段仅提供中文授课。',
      },
      {
        name: '申请院校学费减免',
        text: '多数便宜大学为优秀申请者减免 50-100% 学费。随入学申请自动评审——无需单独表格。提交申请时附上高 GPA（3.5+）与雅思/托福（6.5+/90+）成绩以最大化减免幅度。',
      },
      {
        name: '并行申请 CSC 奖学金',
        text: '即使在最便宜的大学，CSC 也能覆盖学费 + 住宿 + ¥2,500/月生活补贴 + 往返机票。9 月入学请于 4 月中前通过 CSC 系统（campuschina.org）申请。申请时间线与学校类似但走单独系统。',
      },
      {
        name: '查看省市奖学金',
        text: '每个省（北京、上海、江苏、浙江、广东等）都有各自的奖学金项目——通常 ¥20,000-50,000/年。查询目标省份的国际教育交流委员会官网了解最新周期。',
      },
      {
        name: '预算全年，不只是学费',
        text: '在学费基础上加上住宿、保险、签证、餐饮、交通、手机、娱乐，才得到真实总预算。本页表格列出每一项。二线/三线城市可比一线城市节省 40-50% 生活费。',
      },
      {
        name: '规划校内兼职',
        text: '持 X1 签证经学校批准后可做 ≤20 小时/周的校内兼职。多数国际生月收入 ¥1,500-3,000，可覆盖 30-50% 生活费。入学后向国际学生办公室咨询可申请的岗位。',
      },
      {
        name: '申请前核实最新学费',
        text: '本页学费数据为 2025-2026 学年公布数据。大学每年更新（通常 0-5% 涨幅）。提交申请前向 SICA 或学校国际学生办公室核实最新数字。',
      },
    ],
    ctaTitle: '需要帮你规划留学预算？',
    ctaSubtitle:
      'SICA 顾问可帮你对比费用、申请学费减免与 CSC 奖学金、按城市规划生活费。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/scholarships',
        label: '中国留学奖学金',
        description: 'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。',
      },
      {
        href: '/guides/cost-of-living',
        label: '中国留学生活费',
        description: '月度真实预算：住房、餐饮、交通、手机、医疗、娱乐，按城市拆分。',
      },
      {
        href: '/best-universities-china',
        label: '中国最好的大学（2026 排名）',
        description: '所有中国大学按国内排名 + QS 世界排名——SEO/GEO 标准排名表。',
      },
    ],
  },
};