import type { LocalizedGuideCards } from './hub-types';

/**
 * Hub data for /guides. Each card links to a single long-form
 * article — either a `/guides/*` process guide (Phase 39a) or a
 * Phase 39b/40/41 listicle landing page (top-level URLs).
 *
 * Categories:
 * - `process`  — the original 6 end-to-end process guides
 *                (study-in-china, application, scholarships, visa,
 *                cost-of-living, accommodation)
 * - `listicle` — best-of / rankings / comparison / scholarship /
 *                deadline deep-dives added in Phase 39b, 40, and 41.
 *                Each has its own top-level URL like
 *                `/best-mba-programs-china`.
 *
 * The hub page renders 2 sections (one per category) with a
 * responsive grid — process guides as the first row, then the
 * listicles.
 */
export const guideCards: LocalizedGuideCards = {
  en: [
    // ───── Process guides (Phase 39a) ─────
    {
      slug: 'study-in-china',
      href: '/guides/study-in-china',
      icon: 'compass',
      category: 'process',
      title: 'Why & how to study in China',
      subtitle:
        'The full picture: top universities, costs, scholarships, admissions, student life, and career outcomes.',
      readTime: '14 min read',
      highlight: 'Best for first-time applicants',
    },
    {
      slug: 'application',
      href: '/guides/application',
      icon: 'clipboard-list',
      category: 'process',
      title: 'How to apply to Chinese universities',
      subtitle:
        'Step-by-step timeline, document checklist, language requirements, application channels, and post-admission steps.',
      readTime: '9 min read',
      highlight: 'Best for active applicants',
    },
    {
      slug: 'scholarships',
      href: '/guides/scholarships',
      icon: 'award',
      category: 'process',
      title: 'Scholarships to study in China',
      subtitle:
        'CSC, Confucius Institute, university-specific, and provincial scholarships — what each covers and how to apply.',
      readTime: '10 min read',
      highlight: 'Best for budget-conscious students',
    },
    {
      slug: 'visa',
      href: '/guides/visa',
      icon: 'passport',
      category: 'process',
      title: 'China student visa (X1 / X2)',
      subtitle:
        'X1 vs X2, document checklist, fees, processing times, residence permit, work rights, and renewals.',
      readTime: '8 min read',
      highlight: 'Best for admitted students',
    },
    {
      slug: 'cost-of-living',
      href: '/guides/cost-of-living',
      icon: 'wallet',
      category: 'process',
      title: 'Cost of living in China',
      subtitle:
        'Real monthly budgets for housing, food, transport, phone, healthcare, and entertainment. City-by-city breakdown.',
      readTime: '9 min read',
      highlight: 'Best for budget planning',
    },
    {
      slug: 'accommodation',
      href: '/guides/accommodation',
      icon: 'bed',
      category: 'process',
      title: 'Student accommodation in China',
      subtitle:
        'On-campus dorms vs. off-campus apartments: costs, contracts, roommate matching, and what to expect.',
      readTime: '8 min read',
      highlight: 'Best for housing decisions',
    },
    {
      slug: 'health-insurance',
      href: '/guides/health-insurance',
      icon: 'heart-pulse',
      category: 'process',
      title: 'Health insurance for international students',
      subtitle:
        "Mandatory Ping An plan (¥800/yr), what's covered, how to claim, network hospitals, and when to upgrade to an international plan.",
      readTime: '10 min read',
      highlight: 'Required for registration',
    },
    {
      slug: 'banking',
      href: '/guides/banking',
      icon: 'credit-card',
      category: 'process',
      title: 'Banking, Alipay & WeChat Pay setup',
      subtitle:
        'Open a Chinese bank account, link Alipay + WeChat Pay, and move money in/out. Workarounds for sanctioned-country and KYC-blocked students.',
      readTime: '10 min read',
      highlight: 'First-week setup',
    },
    {
      slug: 'part-time-work',
      href: '/guides/part-time-work',
      icon: 'clock',
      category: 'process',
      title: 'Part-time work & post-study visa',
      subtitle:
        "Work legally during your X1 visa (on-campus 勤工助学 + off-campus in 9 pilot cities) and switch to a Z work visa or stay-back visa after graduation.",
      readTime: '11 min read',
      highlight: 'Career & income',
    },
    {
      slug: 'hsk',
      href: '/guides/hsk',
      icon: 'book-open',
      category: 'process',
      title: 'HSK Chinese language test prep',
      subtitle:
        'Exam format, score requirements by program type, study plans for HSK 1-6, and 10 best free + paid prep resources.',
      readTime: '12 min read',
      highlight: 'Required for CSC',
    },

    // ───── Evergreen listicles & best-of guides (Phase 39b / 40 / 41) ─────
    {
      slug: 'best-universities-china',
      href: '/best-universities-china',
      icon: 'trophy',
      category: 'listicle',
      title: 'Best universities in China (2026 ranking)',
      subtitle:
        'Every Chinese university ranked by domestic ranking + QS World — the SEO/GEO canonical 2026 list.',
      readTime: '12 min read',
      highlight: 'Top-tier rankings',
    },
    {
      slug: 'best-mba-programs-china',
      href: '/best-mba-programs-china',
      icon: 'briefcase',
      category: 'listicle',
      title: 'Best MBA programs in China',
      subtitle:
        'Top MBA programs at C9 League + CEIBS — tuition, GMAT/GRE, English-medium options, scholarship paths.',
      readTime: '11 min read',
      highlight: 'Career changers',
    },
    {
      slug: 'top-engineering-universities-china',
      href: '/top-engineering-universities-china',
      icon: 'cog',
      category: 'listicle',
      title: 'Top engineering universities in China',
      subtitle:
        'Best schools for CS, EE, mechanical, civil, biomedical, chemical + materials engineering in English.',
      readTime: '11 min read',
      highlight: 'STEM prospects',
    },
    {
      slug: 'best-cities-china-international-students',
      href: '/best-cities-china-international-students',
      icon: 'map-pin',
      category: 'listicle',
      title: 'Best cities in China for international students',
      subtitle:
        'Top Chinese cities ranked by # of top universities + international community + career opportunities.',
      readTime: '10 min read',
      highlight: 'Where to live',
    },
    {
      slug: 'cost-of-living-china-by-city',
      href: '/cost-of-living-china-by-city',
      icon: 'wallet',
      category: 'listicle',
      title: 'Cost of living in China by city',
      subtitle:
        'City-by-city total cost (tuition + living), budget breakdown, and hidden costs across Tier 1/2/3 cities.',
      readTime: '10 min read',
      highlight: 'City-by-city budgets',
    },
    {
      slug: 'china-university-admission-requirements',
      href: '/china-university-admission-requirements',
      icon: 'file-check',
      category: 'listicle',
      title: 'China university admission requirements',
      subtitle:
        "Bachelor's, master's, and PhD admission requirements cheat sheet — GPA, language tests, work experience.",
      readTime: '9 min read',
      highlight: 'Eligibility check',
    },
    {
      slug: 'cheapest-universities-china',
      href: '/cheapest-universities-china',
      icon: 'tag',
      category: 'listicle',
      title: 'Cheapest universities in China',
      subtitle:
        'Every Chinese university ranked by undergraduate tuition — including dorm + insurance + scholarship options.',
      readTime: '11 min read',
      highlight: 'Budget shoppers',
    },
    {
      slug: 'mbbs-in-china',
      href: '/mbbs-in-china',
      icon: 'activity',
      category: 'listicle',
      title: 'MBBS in China — full guide',
      subtitle:
        'English-medium MBBS at top Chinese universities — duration, tuition, NEET, scholarships, PG pathways.',
      readTime: '12 min read',
      highlight: 'Future doctors',
    },
    {
      slug: 'best-universities-in-shanghai',
      href: '/best-universities-in-shanghai',
      icon: 'building-2',
      category: 'listicle',
      title: 'Best universities in Shanghai',
      subtitle:
        'Top Shanghai universities (SJTU, Fudan, Tongji + others) — tuition, programs, international community.',
      readTime: '11 min read',
      highlight: "China's #1 city",
    },
    {
      slug: 'best-universities-in-beijing',
      href: '/best-universities-in-beijing',
      icon: 'landmark',
      category: 'listicle',
      title: 'Best universities in Beijing',
      subtitle:
        'Top Beijing universities (Tsinghua, Peking, Renmin + 15 more) — tuition, programs, scholarships, and cost of living.',
      readTime: '11 min read',
      highlight: "China's #2 city",
    },
    {
      slug: 'chinese-government-scholarship-csc',
      href: '/chinese-government-scholarship-csc',
      icon: 'landmark',
      category: 'listicle',
      title: 'Chinese Government Scholarship (CSC)',
      subtitle:
        'The CSC fully funds tuition + dorm + ¥2,500-3,500/month stipend + airfare. Categories, channels, deadlines.',
      readTime: '12 min read',
      highlight: 'Fully-funded',
    },
    {
      slug: 'china-university-application-deadlines',
      href: '/china-university-application-deadlines',
      icon: 'calendar-clock',
      category: 'listicle',
      title: 'China university application deadlines',
      subtitle:
        'Fall (September) and Spring (March) intake deadlines by program type + the 9-12 month application timeline.',
      readTime: '10 min read',
      highlight: 'Timing matters',
    },
    {
      slug: 'phd-in-china-international-students',
      href: '/phd-in-china-international-students',
      icon: 'graduation-cap',
      category: 'listicle',
      title: 'PhD in China for international students',
      subtitle:
        'Fully-funded PhD packages, supervisor matching, research areas, CSC scholarship, and the 9-12 month timeline.',
      readTime: '13 min read',
      highlight: 'Doctoral candidates',
    },
    {
      slug: 'study-in-china-vs-russia-for-mbbs',
      href: '/study-in-china-vs-russia-for-mbbs',
      icon: 'scale',
      category: 'listicle',
      title: 'MBBS in China vs Russia — comparison',
      subtitle:
        'Side-by-side comparison of MBBS in China vs Russia — cost, duration, recognition, climate, career pathways.',
      readTime: '14 min read',
      highlight: 'Indian/Pakistani/Nigerian',
    },
  ],
  zh: [
    // ───── Process guides (Phase 39a) ─────
    {
      slug: 'study-in-china',
      href: '/guides/study-in-china',
      icon: 'compass',
      category: 'process',
      title: '为什么及如何来华留学',
      subtitle:
        '完整图景：顶尖大学、学费、奖学金、录取要求、校园生活与职业发展。',
      readTime: '14分钟阅读',
      highlight: '适合首次申请者',
    },
    {
      slug: 'application',
      href: '/guides/application',
      icon: 'clipboard-list',
      category: 'process',
      title: '中国大学申请全流程',
      subtitle:
        '逐步时间线、材料清单、语言要求、申请渠道、录取后步骤。',
      readTime: '9分钟阅读',
      highlight: '适合正在申请的同学',
    },
    {
      slug: 'scholarships',
      href: '/guides/scholarships',
      icon: 'award',
      category: 'process',
      title: '中国留学奖学金',
      subtitle:
        'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。',
      readTime: '10分钟阅读',
      highlight: '适合关注预算的同学',
    },
    {
      slug: 'visa',
      href: '/guides/visa',
      icon: 'passport',
      category: 'process',
      title: '中国学生签证 (X1 / X2)',
      subtitle:
        'X1 vs X2、材料清单、费用、办理时长、居留许可、兼职、续签。',
      readTime: '8分钟阅读',
      highlight: '适合已被录取的同学',
    },
    {
      slug: 'cost-of-living',
      href: '/guides/cost-of-living',
      icon: 'wallet',
      category: 'process',
      title: '中国留学生活费',
      subtitle:
        '月度真实预算：住房、餐饮、交通、手机、医疗、娱乐，按城市拆分。',
      readTime: '9分钟阅读',
      highlight: '适合做预算规划',
    },
    {
      slug: 'accommodation',
      href: '/guides/accommodation',
      icon: 'bed',
      category: 'process',
      title: '中国留学生住宿',
      subtitle:
        '校内宿舍 vs 校外公寓：费用、合同、室友匹配、注意事项。',
      readTime: '8分钟阅读',
      highlight: '适合做住宿决策',
    },
    {
      slug: 'health-insurance',
      href: '/guides/health-insurance',
      icon: 'heart-pulse',
      category: 'process',
      title: '中国留学生医疗保险',
      subtitle:
        '强制平安方案（¥800/年）、保障范围、理赔流程、网络医院、何时升级国际计划。',
      readTime: '10分钟阅读',
      highlight: '注册必备',
    },
    {
      slug: 'banking',
      href: '/guides/banking',
      icon: 'credit-card',
      category: 'process',
      title: '银行、支付宝、微信支付开户',
      subtitle:
        '开中国银行账户、绑定支付宝+微信支付、跨境汇款。受制裁国家与KYC被拒学生的替代方案。',
      readTime: '10分钟阅读',
      highlight: '第一周必办',
    },
    {
      slug: 'part-time-work',
      href: '/guides/part-time-work',
      icon: 'clock',
      category: 'process',
      title: '兼职与毕业后工签',
      subtitle:
        'X1签证合法打工（校内勤工助学 + 9试点城市校外），毕业后转Z工签或留居签。',
      readTime: '11分钟阅读',
      highlight: '职业与收入',
    },
    {
      slug: 'hsk',
      href: '/guides/hsk',
      icon: 'book-open',
      category: 'process',
      title: 'HSK汉语水平考试备考',
      subtitle:
        '考试形式、按项目类型的分数要求、HSK 1-6备考计划、10个最佳免费+付费资源。',
      readTime: '12分钟阅读',
      highlight: 'CSC奖学金必备',
    },

    // ───── Evergreen listicles & best-of guides (Phase 39b / 40 / 41) ─────
    {
      slug: 'best-universities-china',
      href: '/best-universities-china',
      icon: 'trophy',
      category: 'listicle',
      title: '中国最好的大学（2026 排名）',
      subtitle:
        '所有中国大学按国内排名 + QS 世界排名——SEO/GEO 标准排名表。',
      readTime: '12分钟阅读',
      highlight: '顶尖大学排名',
    },
    {
      slug: 'best-mba-programs-china',
      href: '/best-mba-programs-china',
      icon: 'briefcase',
      category: 'listicle',
      title: '中国最好的 MBA 项目',
      subtitle:
        'C9 联盟 + CEIBS 顶尖 MBA——学费、GMAT/GRE、英文授课选项、奖学金路径。',
      readTime: '11分钟阅读',
      highlight: '职业转型者',
    },
    {
      slug: 'top-engineering-universities-china',
      href: '/top-engineering-universities-china',
      icon: 'cog',
      category: 'listicle',
      title: '中国顶尖工科大学',
      subtitle:
        'CS、EE、机械、土木、生物医学、化工 + 材料工程顶尖院校，英文授课。',
      readTime: '11分钟阅读',
      highlight: 'STEM 申请者',
    },
    {
      slug: 'best-cities-china-international-students',
      href: '/best-cities-china-international-students',
      icon: 'map-pin',
      category: 'listicle',
      title: '中国最好的留学城市',
      subtitle:
        '按顶尖大学数量 + 国际社区 + 就业机会排名的中国留学城市榜。',
      readTime: '10分钟阅读',
      highlight: '城市选择',
    },
    {
      slug: 'cost-of-living-china-by-city',
      href: '/cost-of-living-china-by-city',
      icon: 'wallet',
      category: 'listicle',
      title: '中国各城市生活费',
      subtitle:
        '逐城市总费用（学费 + 生活费）+ 预算明细 + 一/二/三线城市隐藏成本。',
      readTime: '10分钟阅读',
      highlight: '城市预算',
    },
    {
      slug: 'china-university-admission-requirements',
      href: '/china-university-admission-requirements',
      icon: 'file-check',
      category: 'listicle',
      title: '中国大学录取要求',
      subtitle:
        '本科、硕士、博士录取要求速查——GPA、语言成绩、工作经验。',
      readTime: '9分钟阅读',
      highlight: '资格核对',
    },
    {
      slug: 'cheapest-universities-china',
      href: '/cheapest-universities-china',
      icon: 'tag',
      category: 'listicle',
      title: '中国最便宜的大学',
      subtitle:
        '所有中国大学按本科学费排序——含住宿、保险、奖学金选项。',
      readTime: '11分钟阅读',
      highlight: '预算有限者',
    },
    {
      slug: 'mbbs-in-china',
      href: '/mbbs-in-china',
      icon: 'activity',
      category: 'listicle',
      title: '中国 MBBS——完整指南',
      subtitle:
        '顶尖中国大学英文授课 MBBS——学制、学费、NEET、奖学金、PG 路径。',
      readTime: '12分钟阅读',
      highlight: '未来医生',
    },
    {
      slug: 'best-universities-in-shanghai',
      href: '/best-universities-in-shanghai',
      icon: 'building-2',
      category: 'listicle',
      title: '上海最好的大学',
      subtitle:
        '上海顶尖大学（上交、复旦、同济等）——学费、项目、国际社区。',
      readTime: '11分钟阅读',
      highlight: '中国第一城',
    },
    {
      slug: 'best-universities-in-beijing',
      href: '/best-universities-in-beijing',
      icon: 'landmark',
      category: 'listicle',
      title: '北京最好的大学',
      subtitle:
        '北京顶尖大学（清华、北大、人大等15+）——学费、项目、奖学金、生活费。',
      readTime: '11分钟阅读',
      highlight: '中国第二城',
    },
    {
      slug: 'chinese-government-scholarship-csc',
      href: '/chinese-government-scholarship-csc',
      icon: 'landmark',
      category: 'listicle',
      title: '中国政府奖学金（CSC）',
      subtitle:
        'CSC 全额资助学费 + 住宿 + ¥2,500-3,500/月津贴 + 机票。类别、渠道、截止日。',
      readTime: '12分钟阅读',
      highlight: '全额资助',
    },
    {
      slug: 'china-university-application-deadlines',
      href: '/china-university-application-deadlines',
      icon: 'calendar-clock',
      category: 'listicle',
      title: '中国大学申请截止日',
      subtitle:
        '秋季（9 月）与春季（3 月）入学截止日按项目类型 + 9-12 个月申请时间线。',
      readTime: '10分钟阅读',
      highlight: '时机关键',
    },
    {
      slug: 'phd-in-china-international-students',
      href: '/phd-in-china-international-students',
      icon: 'graduation-cap',
      category: 'listicle',
      title: '中国博士项目（国际生）',
      subtitle:
        '全额资助博士包、导师匹配、研究方向、CSC 奖学金、9-12 个月时间线。',
      readTime: '13分钟阅读',
      highlight: '博士申请人',
    },
    {
      slug: 'study-in-china-vs-russia-for-mbbs',
      href: '/study-in-china-vs-russia-for-mbbs',
      icon: 'scale',
      category: 'listicle',
      title: '中国 vs 俄罗斯 MBBS 对比',
      subtitle:
        '中国 vs 俄罗斯 MBBS 全方位对比——费用、学制、认证、气候、职业路径。',
      readTime: '14分钟阅读',
      highlight: '印度 / 巴基斯坦 / 尼日利亚',
    },
  ],
};
