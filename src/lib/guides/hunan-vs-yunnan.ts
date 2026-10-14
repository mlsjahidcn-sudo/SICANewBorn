import type { LocalizedGuide } from './types';

/**
 * "Hunan vs Yunnan: which province is better for international
 * students" (Phase 168, article #2 in the 20-article audit).
 * Novel comparator template — pairs two SICA-listed regions head
 * to head on the dimensions that matter: cost, climate, language,
 * programs, international student community, scholarships,
 * which-profile-fits-where. Target queries: "hunan vs yunnan",
 * "study in changsha", "study in kunming", "changsha vs
 * kunming", "湖南 云南 大学", "昆明 长沙 留学".
 *
 * Both regions are real long-tail SICA surfaces — Hunan
 * (Changsha) hosts Hunan University + Central South University;
 * Yunnan (Kunming) hosts Yunnan University + Kunming University
 * of Science and Technology + Kunming Medical University. Cost
 * difference is real (Yunnan is tier 3-tier-tier, Hunan is tier 2
 * but cheaper than Beijing/Shanghai); climate is dramatically
 * different (Yangtze valley vs Yunnan plateau).
 */
export const hunanVsYunnanGuide: LocalizedGuide = {
  en: {
    slug: 'hunan-vs-yunnan',
    eyebrow: 'GUIDE · COMPARATOR',
    title: 'Hunan vs Yunnan: Which Province Is Better for International Students?',
    description:
      'Hunan vs Yunnan for international students: cost, climate, language, top universities, programs, international student community, scholarships, and which fits which student profile.',
    subtitle:
      'Two mid-tier Chinese provinces that international students often compare. Hunan (Changsha) has the Yangtze-valley climate + dense university network (Hunan University, Central South University); Yunnan (Kunming) has the eternal-spring climate + lower cost + a smaller but tight international student community (Yunnan University, KUST, Kunming Medical). Both have 211 / Double First-Class options, both have CSC pathways, both have unique program strengths. The choice comes down to cost tolerance, climate preference, and program fit.',
    stats: [
      { value: 'Changsha', label: 'Hunan capital — Hunan U + CSU' },
      { value: 'Kunming', label: 'Yunnan capital — YNU + KUST + KMU' },
      { value: '¥15-25k/yr', label: 'Hunan undergrad tuition (typical)' },
      { value: '¥10-20k/yr', label: 'Yunnan undergrad tuition (typical)' },
    ],
    quickAnswer:
      'Hunan (Changsha) wins on density + English-program coverage + industry ties (CSU\'s metallurgy and transportation programs feed Guangzhou Auto + CRRC). Yunnan (Kunming) wins on cost (lower tier, cheaper dorm + meals), climate (eternal spring, ~15°C year-round), and a tight international student community (smaller cohort = more personalized attention). Both have 211 + Double First-Class options (Hunan University + Central South vs Yunnan University + KUST). The choice comes down to: (a) budget — pick Yunnan if every ¥1000/month matters; (b) climate tolerance — pick Yunnan if you can\'t handle Changsha\'s 38°C humid summers; (c) program — pick Hunan for engineering/materials/transp, pick Yunnan for ecology/biology/medicine/biodiversity.',
    keyTakeaways: [
      'Hunan universities: Hunan University (211, history/literature), Central South University (985, metallurgy/transportation/engineering), Xiangtan University, Hunan Normal — all in Changsha',
      'Yunnan universities: Yunnan University (211, ecology/biology), KUST (Kunming University of Science and Technology, 211, metallurgy), Kunming Medical University (pharmacy/clinical), Dali University — all in Kunming',
      'Cost: Hunan ~¥15-25k/yr undergrad tuition + ¥1,200-2,000/mo dorm; Yunnan ~¥10-20k/yr + ¥800-1,500/mo — Yunnan is ~30% cheaper overall',
      'Climate: Hunan = Yangtze valley (hot humid summers 35-38°C, cold wet winters 0-5°C); Yunnan = Kunming plateau (eternal spring ~15°C year-round, mild winters 5-15°C, very sunny)',
      'Language: Hunan = Mandarin with Xiang accent (some vocabulary); Yunnan = Mandarin with Yunnanese accent + many minority languages + stronger ESL programs at YNU',
      'International community: Hunan has the larger absolute number of international students (CSU alone has 1,500+); Yunnan has a tighter community (better 1:1 faculty access)',
      'CSC pathways: both provinces participate; Hunan has more CSC seats through CSU + Hunan University; Yunnan has fewer seats but a higher per-applicant acceptance rate (less competition)',
    ],
    sections: [
      {
        id: 'side-by-side',
        h2: 'Hunan vs Yunnan at a glance',
        intro:
          'The dimensions that actually matter when you\'re choosing between two mid-tier provinces.',
        blocks: [
          {
            type: 'table',
            caption: 'Hunan (Changsha) vs Yunnan (Kunming) for international students',
            columns: ['Dimension', 'Hunan (Changsha)', 'Yunnan (Kunming)'],
            rows: [
              ['Top universities', 'Central South University (985), Hunan University (211), Xiangtan University, Hunan Normal', 'Yunnan University (211), KUST (Kunming Univ of Science and Tech, 211), Kunming Medical University, Dali University'],
              ['Undergrad tuition (typical)', '¥15,000-25,000/yr', '¥10,000-20,000/yr'],
              ['On-campus dorm (typical)', '¥1,200-2,000/mo (shared room)', '¥800-1,500/mo (shared room)'],
              ['Monthly living cost (off-campus reference)', '¥2,500-3,500/mo (food + transport + misc)', '¥1,800-2,800/mo'],
              ['Climate', 'Yangtze-valley humid subtropical: hot humid summers 35-38°C, cold wet winters 0-5°C', 'Kunming plateau sub-tropical highland: eternal spring ~15°C year-round, mild dry winters 5-15°C, very sunny'],
              ['Language challenge', 'Mandarin with Xiang-accent; some vocabulary differs; English less common outside campus', 'Mandarin with Yunnanese accent; many minority languages (Bai, Yi, Hani); stronger ESL prep at YNU'],
              ['International student community', 'Large: CSU alone has 1,500+ international students; bigger events + networks', 'Tight: smaller cohort but better 1:1 faculty access + more personal advising'],
              ['Industry ties', 'CSU metallurgy → Guangzhou Auto + CRRC; Xiangtan → engineering manufacturing', 'YNU ecology → biodiversity + pharmaceuticals; KMU → regional hospitals + Yunnan Baiyao (TCM giant)'],
              ['CSC seats', 'More (CSU + Hunan U + 3 others)', 'Fewer but less competitive (per-applicant rate higher)'],
              ['Best for', 'Engineering / materials / transportation / business students who can handle humid heat', 'Biology / ecology / medicine / pharmacology students who prefer mild climate + tight community'],
            ],
          },
        ],
      },
      {
        id: 'when-hunan',
        h2: 'Pick Hunan if…',
        intro:
          'Hunan makes sense for a specific applicant profile. If you match the criteria below, Changsha is the stronger fit.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**You\'re studying engineering, metallurgy, materials science, transportation, or mechanical engineering** — CSU\'s College of Materials Science + College of Transportation Engineering are top-3 in China; direct industry placement with Guangzhou Auto, CRRC, Sany',
              '**You want a larger international student community** — Changsha has more programs running in English, more cultural events, larger peer networks',
              '**You can tolerate (or prefer) hot humid summers** — Changsha hits 35-38°C with high humidity from June to September; winter is cold but short (1-2 months)',
              '**You\'re targeting a 985 university specifically** — CSU is 985 + Double First-Class (the highest tier); Hunan University is 211 + Double First-Class',
              '**You want strong English-medium coverage** — CSU runs 30+ English-taught bachelor/master programs; Hunan University runs 15+',
              '**Budget is not the top constraint** — Changsha is mid-tier for cost, not cheap; if ¥1000/month matters, consider Yunnan or smaller cities',
            ],
          },
        ],
      },
      {
        id: 'when-yunnan',
        h2: 'Pick Yunnan if…',
        intro:
          'Yunnan makes sense for a different profile. If you match the criteria below, Kunming is the stronger fit.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**You\'re studying biology, ecology, biodiversity, pharmacology, or clinical medicine** — YNU\'s ecology program is nationally top-5; Kunming Medical University is one of China\'s strongest TCM-adjacent medical schools; the Yunnan biodiversity hotspot is a research goldmine',
              '**You can\'t handle humid heat** — Kunming\'s eternal-spring climate (~15°C year-round) is famous in China for a reason; summers never hit 30°C',
              '**You want a tighter, more personal academic community** — YNU + KUST have smaller international cohorts; faculty-to-student ratio is better; advising is more personal',
              '**Budget matters** — Kunming is ~30% cheaper than Changsha across tuition + dorm + living costs; for self-funded bachelor\'s students this adds up',
              '**You\'re interested in TCM (Traditional Chinese Medicine) + biodiversity** — KMU + Yunnan Baiyao have strong industry ties; Yunnan is a global biodiversity hotspot',
              '**You want a less-competitive CSC route** — YNU + KUST have fewer applicants per seat than CSU + Hunan U; per-applicant acceptance is meaningfully higher',
              '**You like outdoor access** — Kunming is the gateway to Yunnan\'s mountains, lakes (Erhai, Lugu), and the Stone Forest; weekends are a destination',
            ],
          },
        ],
      },
      {
        id: 'cost-of-living',
        h2: 'Cost of living: side-by-side monthly budget',
        intro:
          'Real numbers a 2027 applicant should plan for, both regions.',
        blocks: [
          {
            type: 'table',
            caption: 'Monthly living cost comparison for international students (CNY, 2027 estimate)',
            columns: ['Item', 'Changsha (Hunan)', 'Kunming (Yunnan)'],
            rows: [
              ['On-campus dorm (shared)', '¥1,200-2,000/mo', '¥800-1,500/mo'],
              ['Meals (campus cafeteria)', '¥900-1,400/mo', '¥700-1,100/mo'],
              ['Meals (off-campus)', '¥1,400-2,200/mo', '¥1,100-1,700/mo'],
              ['Public transport', '¥100-200/mo (campus shuttle + bus)', '¥80-150/mo (smaller city, shorter distances)'],
              ['Phone + internet', '¥100-150/mo', '¥100-150/mo'],
              ['Personal / misc', '¥400-800/mo', '¥300-700/mo'],
              ['Monthly total (on-campus)', '¥2,700-4,550/mo', '¥1,980-3,600/mo'],
              ['Monthly total (off-campus)', '¥3,400-5,550/mo', '¥2,680-4,300/mo'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Across an academic year (10 months), Changsha costs ~¥27,000-55,500 in living expenses alone; Kunming costs ~¥20,000-43,000. The ~¥7,000-12,000 difference is significant for self-funded bachelor\'s students — equivalent to roughly 1-2 months of tuition at a tier-2 university.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Hunan or Yunnan cheaper for international students?',
        a: 'Yunnan is cheaper. Across tuition + dorm + living costs, Kunming runs ~30% below Changsha. A 4-year undergrad at a tier-2 university in Kunming can be ¥30,000-50,000 cheaper overall than the same program in Changsha — a significant difference for self-funded students.',
      },
      {
        q: 'Which province has better English-taught programs?',
        a: 'Hunan (Changsha). CSU runs 30+ English-taught bachelor + master programs; Hunan University runs 15+. Yunnan\'s English coverage is thinner — YNU and KUST have strong programs but in Chinese-medium. If you don\'t speak Chinese and need English-medium, Changsha is the easier entry point.',
      },
      {
        q: 'What is the climate difference between Changsha and Kunming?',
        a: 'Dramatic. Changsha is Yangtze-valley humid subtropical: 35-38°C summers with high humidity, cold wet winters 0-5°C. Kunming is on the Yunnan plateau, famous in China as the "eternal spring" city: ~15°C year-round, mild dry winters 5-15°C, very sunny. Students who can\'t handle humid heat should pick Kunming.',
      },
      {
        q: 'Which province is better for engineering students?',
        a: 'Hunan. Central South University\'s metallurgy, materials science, and transportation engineering programs are top-3 in China with direct industry placement (Guangzhou Auto, CRRC, Sany). Kunming has engineering at KUST but the ecosystem + industry ties are smaller.',
      },
      {
        q: 'Which province is better for biology / medicine students?',
        a: 'Yunnan. YNU\'s ecology program is nationally top-5; Kunming Medical University is one of China\'s strongest TCM-adjacent medical schools; Yunnan is a global biodiversity hotspot. Changsha has medical programs (Central South + Hunan Normal) but the research ecosystem is smaller for these fields.',
      },
      {
        q: 'Do Hunan and Yunnan universities offer CSC scholarships?',
        a: 'Both do. Hunan has more total CSC seats (CSU + Hunan U + others are all in the CSC pool). Yunnan has fewer seats but less competition per seat — per-applicant acceptance rates are meaningfully higher at YNU + KUST.',
      },
      {
        q: 'Where is the larger international student community?',
        a: 'Hunan (Changsha) — CSU alone has 1,500+ international students; the broader Changsha network is bigger. Kunming (Yunnan) has a tighter, smaller community where students know each other better and faculty access is more personal.',
      },
    ],
    howToSteps: [
      {
        name: 'Identify your priority dimensions',
        text: 'List the 2-3 dimensions that matter most to you (cost / climate / program / community / language). The Phase 168 comparison table breaks these out per province — use it as the decision matrix.',
      },
      {
        name: 'Check the specific universities',
        text: 'Hunan: visit csu.edu.cn + hunu.edu.cn. Yunnan: visit ynu.edu.cn + kmust.edu.cn + kmmc.cn. Look at the program pages for your target major + the international student pages for the application route.',
      },
      {
        name: 'Compare tuition + living cost on your scholarship',
        text: 'If you have a CSC or university scholarship that covers tuition + dorm, the cost difference between Hunan and Yunnan shrinks to food + transport. If you\'re self-funded, Kunming saves you ¥7,000-12,000/year.',
      },
      {
        name: 'Check the language of instruction',
        text: 'Hunan has more English-medium programs; Yunnan leans Chinese-medium. If your Chinese isn\'t ready, Hunan makes the transition easier. If you\'re working on HSK 3.0 anyway, Yunnan\'s immersive environment may help you progress faster.',
      },
      {
        name: 'Apply to both + decide later',
        text: 'CSC + Type B applications cost ¥0-100 per university — apply to 2-3 in each province, then pick the one that offers the best package. Don\'t pre-optimize; the market decides.',
      },
    ],
    ctaTitle: 'Choosing between Hunan and Yunnan?',
    ctaSubtitle:
      'SICA counselors map your academic profile (engineering vs biology vs business) + budget + climate tolerance to the right province + university. They cross-check the specific program + CSC pathway for 2027. First consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/best-universities-china',
        label: 'Best universities in China for international students 2027',
        description: 'The top tier across all provinces, with English-taught catalog flags.',
      },
      {
        href: '/best-cities-china-international-students',
        label: 'Best cities in China for international students',
        description: 'A 12-city ranking by cost, climate, international community, and program depth.',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: 'Monthly cost of living in China by city (20 cities ranked)',
        description: 'Live budget table ranked by monthly cost — Changsha + Kunming both first-class rows.',
      },
    ],
  },
  zh: {
    slug: 'hunan-vs-yunnan',
    eyebrow: '指南 · 省份对比',
    title: '湖南 vs 云南：哪个省份更适合国际学生？',
    description:
      '湖南 vs 云南国际学生对比：费用、气候、语言、顶尖大学、专业、国际生社区、奖学金与适合什么样的学生画像。',
    subtitle:
      '国际学生常拿来对比的两个中层级省份。湖南（长沙）有长江流域气候 + 密集的大学网络（湖南大学、中南大学）；云南（昆明）有恒春气候 + 更低成本 + 更紧密的国际生社区（云南大学、昆明理工大学、昆明医科大学）。两边都有 211 / 双一流选项，都走 CSC 通道，都有独特专业优势。取舍取决于成本承受力、气候偏好与专业契合。',
    stats: [
      { value: '长沙', label: '湖南首府——湖南大学 + 中南大学' },
      { value: '昆明', label: '云南首府——云大 + 昆工 + 昆医' },
      { value: '¥1.5-2.5 万/年', label: '湖南本科学费（典型）' },
      { value: '¥1-2 万/年', label: '云南本科学费（典型）' },
    ],
    quickAnswer:
      '湖南（长沙）赢在密度 + 英文项目覆盖 + 产业对接（中南大学冶金 + 交通工程对接广州汽车 + 中车）；云南（昆明）赢在成本（更低层级，更便宜的宿舍 + 餐饮）、气候（恒春 ~15°C 全年）、更紧密的国际生社区（更小的班 = 更个性化关注）。两边都有 211 + 双一流选项（湖南大学 + 中南 vs 云南大学 + 昆工）。取舍取决于：(a) 预算——每多花 ¥1000/月都肉痛就选云南；(b) 气候耐受度——扛不住长沙 38°C 湿热就选云南；(c) 专业——工程 / 材料 / 交通选湖南，生态 / 生物 / 医学选云南。',
    keyTakeaways: [
      '湖南大学：湖南大学（211，文史类）、中南大学（985，冶金 / 交通 / 工程）、湘潭大学、湖南师范大学——都在长沙',
      '云南大学：云南大学（211，生态 / 生物）、昆工（昆明理工大学，211，冶金）、昆明医科大学（药学 / 临床）、大理大学——都在昆明',
      '费用：湖南本科 ¥1.5-2.5 万/年 + 宿舍 ¥1,200-2,000/月；云南本科 ¥1-2 万/年 + 宿舍 ¥800-1,500/月——云南整体便宜约 30%',
      '气候：湖南 = 长江流域湿润亚热带：夏季湿热 35-38°C，冬季湿冷 0-5°C；云南 = 昆明高原亚热带高地：恒春 ~15°C 全年，冬季干凉 5-15°C，晴朗多',
      '语言：湖南 = 普通话带湘语口音；云南 = 普通话带云南口音 + 众多少数民族语言（白、彝、哈尼）+ 云大英语课程更强',
      '国际生社区：湖南规模更大（中南大学单独就有 1500+ 国际生）；云南社区更紧密（1:1 师资对接更好）',
      'CSC 通道：两省都参与；湖南名额更多（中南 + 湖南大学 + 其他）；云南名额少但人均录取率高（竞争小）',
    ],
    sections: [
      {
        id: 'side-by-side',
        h2: '湖南 vs 云南一目了然',
        intro:
          '在两个中层级省份之间做选择时真正起作用的维度。',
        blocks: [
          {
            type: 'table',
            caption: '湖南（长沙）vs 云南（昆明）国际学生对比',
            columns: ['维度', '湖南（长沙）', '云南（昆明）'],
            rows: [
              ['顶尖大学', '中南大学（985）、湖南大学（211）、湘潭大学、湖南师范大学', '云南大学（211）、昆工（昆明理工大学，211）、昆明医科大学、大理大学'],
              ['本科学费（典型）', '¥15,000-25,000/年', '¥10,000-20,000/年'],
              ['校内宿舍（典型）', '¥1,200-2,000/月（双人间）', '¥800-1,500/月（双人间）'],
              ['月生活费（校外参考）', '¥2,500-3,500/月（餐饮 + 交通 + 其他）', '¥1,800-2,800/月'],
              ['气候', '长江流域湿润亚热带：湿热夏季 35-38°C，湿冷冬季 0-5°C', '昆明高原亚热带高地：恒春 ~15°C 全年，干凉冬季 5-15°C，晴朗多'],
              ['语言挑战', '普通话带湘语口音；部分词汇不同；校园外英语较少', '普通话带云南口音 + 众多少数民族语言（白、彝、哈尼）+ 云大英语备考更强'],
              ['国际生社区', '大：中南大学单独 1500+ 国际生；活动多、人脉广', '紧密：班型小，师资对接更个人化'],
              ['产业对接', '中南冶金 → 广州汽车 + 中车；湘潭 → 工程制造', '云大生态 → 生物多样性 + 制药；昆医 → 区域医院 + 云南白药'],
              ['CSC 名额', '更多（中南 + 湖南大学 + 其他）', '更少但人均竞争小（录取率更高）'],
              ['适合人群', '工程 / 材料 / 交通 / 商科学生；耐湿热', '生物 / 生态 / 医学 / 药学学生；偏好温和气候 + 紧密社区'],
            ],
          },
        ],
      },
      {
        id: 'when-hunan',
        h2: '以下情况选湖南……',
        intro:
          '湖南适合特定的申请者画像。如果你符合下列标准，长沙就是更强的选择。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**你读工程 / 冶金 / 材料 / 交通 / 机械**——中南大学材料科学与工程学院 + 交通运输工程学院全国前 3；直接对接广州汽车、中车、三一重工',
              '**你想要更大的国际生社区**——长沙英文项目更多、文化活动更多、人脉更广',
              '**你能耐受（或喜欢）湿热的夏天**——长沙 6-9 月 35-38°C 湿度高；冬季短（1-2 个月）',
              '**你目标明确是 985 大学**——中南大学是 985 + 双一流（最高层级）；湖南大学是 211 + 双一流',
              '**你想要强英文授课覆盖**——中南大学开 30+ 英文授课本硕项目；湖南大学开 15+',
              '**预算不是首要约束**——长沙在费用上属中层级而不是便宜；每月差 ¥1000 都肉痛的话，考虑云南或更小的城市',
            ],
          },
        ],
      },
      {
        id: 'when-yunnan',
        h2: '以下情况选云南……',
        intro:
          '云南适合另一类画像。如果你符合下列标准，昆明就是更强的选择。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**你读生物 / 生态 / 生物多样性 / 药学 / 临床医学**——云大生态学全国前 5；昆医是中国最强的中医周边医学院校之一；云南是全球生物多样性热点',
              '**你扛不住湿热**——昆明恒春气候（~15°C 全年）在中国是出了名的；夏天从来不到 30°C',
              '**你想要更紧密、更个性化的学术社区**——云大 + 昆工国际生班型小；师生比更好；指导更个人',
              '**预算重要**——昆明整体比长沙便宜 30%（学费 + 宿舍 + 生活费）；对自费本科学生累计可观',
              '**你对中医 + 生物多样性感兴趣**——昆医 + 云南白药产业对接强；云南是全球生物多样性热点',
              '**你想要竞争较小的 CSC 通道**——云大 + 昆工每席位申请者比中南 + 湖南大学少；人均录取率明显更高',
              '**你喜欢户外活动**——昆明是云南山川、湖泊（洱海、泸沽湖）、石林的门户；周末就是目的地',
            ],
          },
        ],
      },
      {
        id: 'cost-of-living',
        h2: '月生活费：每月预算横向对比',
        intro:
          '2027 申请者应规划的真实数字，两省对比。',
        blocks: [
          {
            type: 'table',
            caption: '国际学生月生活费对比（人民币，2027 估算）',
            columns: ['项目', '长沙（湖南）', '昆明（云南）'],
            rows: [
              ['校内宿舍（双人间）', '¥1,200-2,000/月', '¥800-1,500/月'],
              ['校内食堂', '¥900-1,400/月', '¥700-1,100/月'],
              ['校外餐饮', '¥1,400-2,200/月', '¥1,100-1,700/月'],
              ['公共交通', '¥100-200/月（校车 + 公交）', '¥80-150/月（小城市，距离短）'],
              ['手机 + 宽带', '¥100-150/月', '¥100-150/月'],
              ['个人 / 其他', '¥400-800/月', '¥300-700/月'],
              ['月总计（住校内）', '¥2,700-4,550/月', '¥1,980-3,600/月'],
              ['月总计（住校外）', '¥3,400-5,550/月', '¥2,680-4,300/月'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '按一学年（10 个月）计，长沙生活费 ~¥27,000-55,500；昆明 ~¥20,000-43,000。¥7,000-12,000 的差距对自费本科生很可观——相当于中层级大学 1-2 个月的学费。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '湖南和云南哪个对国际学生更便宜？',
        a: '云南更便宜。学费 + 宿舍 + 生活费合计，昆明比长沙低约 30%。四年本科在昆明中层级大学总计可比长沙省 ¥30,000-50,000——对自费学生差距可观。',
      },
      {
        q: '哪个省的英文授课项目更多？',
        a: '湖南（长沙）。中南大学开 30+ 英文授课本硕项目；湖南大学开 15+。云南英文覆盖薄——云大 + 昆工有强项但以中文授课为主。如果你不熟中文又要英文授课，长沙是更轻松的选择。',
      },
      {
        q: '长沙和昆明气候差别多大？',
        a: '差别巨大。长沙是长江流域湿润亚热带：夏季 35-38°C 湿度高，冬季湿冷 0-5°C。昆明在云贵高原，中国出名的"春城"：~15°C 全年，冬季干凉 5-15°C，晴朗多。扛不住湿热的学生应选昆明。',
      },
      {
        q: '哪个省更适合工科学生？',
        a: '湖南。中南大学的冶金、材料科学与交通运输工程全国前 3，直接对接广州汽车、中车、三一。昆工有工科但生态 + 产业对接更小。',
      },
      {
        q: '哪个省更适合生物 / 医学学生？',
        a: '云南。云大生态学全国前 5；昆医是中国最强的中医周边医学院校之一；云南是全球生物多样性热点。长沙有医学项目（中南 + 湖南师大）但这些领域的研究生态较小。',
      },
      {
        q: '湖南和云南的大学提供 CSC 奖学金吗？',
        a: '都提供。湖南总名额更多（中南 + 湖南大学 + 其他都在 CSC 池内）。云南名额少但每席位竞争小——云大 + 昆工的人均录取率明显更高。',
      },
      {
        q: '哪里国际生社区更大？',
        a: '湖南（长沙）——中南大学单独就有 1500+ 国际生；整个长沙网络更大。云南（昆明）社区更紧密、更小，学生互相认识更多、师资对接更个人。',
      },
    ],
    howToSteps: [
      {
        name: '识别你的优先维度',
        text: '列出 2-3 个对你最重要的维度（费用 / 气候 / 专业 / 社区 / 语言）。Phase 168 对比表按维度拆分——把它当决策矩阵。',
      },
      {
        name: '查具体大学',
        text: '湖南：csu.edu.cn + hunu.edu.cn。云南：ynu.edu.cn + kmust.edu.cn + kmmc.cn。看目标专业的项目页面 + 国际生页面的申请通道。',
      },
      {
        name: '对比学费 + 生活费与你的奖学金',
        text: '如果你有 CSC 或校级奖学金覆盖学费 + 宿舍，湖南 vs 云南的差距缩小到餐饮 + 交通。如果自费，昆明一年省 ¥7,000-12,000。',
      },
      {
        name: '查授课语言',
        text: '湖南英文项目多；云南偏中文。如果中文还没准备好，湖南转换更容易。如果本来就在备考 HSK 3.0，云南沉浸环境可能让你进步更快。',
      },
      {
        name: '两省都申请 + 之后再决定',
        text: 'CSC + Type B 申请每所大学 ¥0-100——每省申请 2-3 所，之后挑 offer 最好的。别过早优化；让市场决定。',
      },
    ],
    ctaTitle: '在湖南与云南之间选择？',
    ctaSubtitle:
      'SICA 顾问把你的学术画像（工程 vs 生物 vs 商科）+ 预算 + 气候耐受度映射到合适的省份 + 大学，并交叉核对 2027 年具体专业 + CSC 通道。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/best-universities-china',
        label: '2027 中国顶尖大学（国际生）',
        description: '全省份第一梯队，标注英文项目覆盖。',
      },
      {
        href: '/best-cities-china-international-students',
        label: '中国最适合国际学生的城市',
        description: '12 城按费用、气候、国际社区与专业深度排名。',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: '中国各城市月生活费排名（20 城）',
        description: '实时预算表按月生活费排序——长沙 + 昆明都是第一梯队行。',
      },
    ],
  },
};
