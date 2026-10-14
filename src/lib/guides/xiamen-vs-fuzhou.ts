import type { LocalizedGuide } from './types';

/**
 * "Xiamen vs Fuzhou for international students" (Phase 168,
 * article #3 in the 20-article audit). Second comparator page
 * following the Phase 168 Hunan vs Yunnan template.
 *
 * Both cities are in Fujian province, coastal, similar climate
 * (subtropical), similar tier-2 cost bracket, both home to one
 * flagship university + one secondary. The differentiators:
 *
 *   - Xiamen: stronger international reputation (Tan Kah Kee
 *     legacy, cleaner city, tourism economy), Xiamen University
 *     has 985 status + strongest English-medium coverage in
 *     Fujian, marine sciences / chemistry / economics strengths
 *   - Fuzhou: cheaper, larger local student base, Fuzhou
 *     University has 211 status + stronger materials / math /
 *     chemistry, fewer international students per program
 *
 * Target queries: "xiamen vs fuzhou", "study in xiamen", "study
 * in fuzhou", "xiamen university international students",
 * "fuzhou university international students", "厦门 福州 大学",
 * "厦门大学 福州大学 哪个好".
 */
export const xiamenVsFuzhouGuide: LocalizedGuide = {
  en: {
    slug: 'xiamen-vs-fuzhou',
    eyebrow: 'GUIDE · COMPARATOR',
    title: 'Xiamen vs Fuzhou for International Students',
    description:
      'Xiamen vs Fuzhou for international students: cost, climate, universities, programs, English coverage, international community, scholarships, and which fits which student profile.',
    subtitle:
      'Two Fujian-province coastal cities that international students often compare. Xiamen (XMU, Tan Kah Kee legacy) has stronger English-medium coverage + cleaner coastal city + tourism economy. Fuzhou (FZU) has cheaper living costs + larger local student community + materials + math strengths. Both have 211 options + coastal Fujian climate (mild winters, hot humid summers) + the cross-strait scholarship history (Tan Kah Kee). The choice comes down to: English-medium depth, community size preference, and budget tolerance.',
    stats: [
      { value: 'Xiamen', label: 'XMU (985) + Xiamen Uni of Tech' },
      { value: 'Fuzhou', label: 'FZU (211) + Minjiang Uni' },
      { value: '¥18-28k/yr', label: 'Xiamen undergrad tuition (typical)' },
      { value: '¥14-22k/yr', label: 'Fuzhou undergrad tuition (typical)' },
    ],
    quickAnswer:
      'Xiamen (XMU) wins on English-medium coverage (XMU runs 40+ English programs, top-3 marine sciences in China, Tan Kah Kee cross-strait scholarship history) + coastal city amenity (cleaner, more tourist-friendly, English more common). Fuzhou (FZU) wins on cost (~20% cheaper overall) + larger local student base + materials + math strengths + a more grounded Chinese-cultural-immersion environment. Both cities are in Fujian province, similar subtropical coastal climate (hot humid summers 33-36°C, mild winters 8-15°C). The choice comes down to: (a) English-medium depth — pick Xiamen if you need 20+ ETP options; (b) community size — pick Fuzhou if you want a more Chinese-immersive cohort; (c) program — pick Xiamen for marine + chemistry + economics, pick Fuzhou for materials + math + chemistry.',
    keyTakeaways: [
      'Xiamen universities: Xiamen University (985, marine sciences / chemistry / economics / Tan Kah Kee legacy), Xiamen University of Technology (undergrad-focused engineering)',
      'Fuzhou universities: Fuzhou University (211, materials / chemistry / mathematics / economics), Minjiang University (undergrad-focused), Fujian Normal University (teacher training)',
      'Cost: Xiamen ~¥18-28k/yr undergrad tuition + ¥1,500-2,500/mo dorm; Fuzhou ~¥14-22k/yr + ¥1,000-1,800/mo — Fuzhou is ~20% cheaper overall',
      'Climate: Both Fujian coastal subtropical. Hot humid summers 33-36°C, mild winters 8-15°C, typhoon risk Aug-Sept',
      'Language: Xiamen = stronger English-medium programs + more English in daily life; Fuzhou = more Min + Fuzhou dialect + more Chinese-immersion environment',
      'International community: Xiamen has the larger international cohort (XMU alone has 2,000+); Fuzhou has fewer international students per program',
      'CSC pathways: both participate; XMU has more seats through both Xiamen University + Xiamen University of Technology; Fuzhou has fewer seats but lower per-applicant competition',
    ],
    sections: [
      {
        id: 'side-by-side',
        h2: 'Xiamen vs Fuzhou at a glance',
        intro:
          'The dimensions that actually matter when you\'re choosing between two coastal Fujian cities.',
        blocks: [
          {
            type: 'table',
            caption: 'Xiamen vs Fuzhou for international students',
            columns: ['Dimension', 'Xiamen (XMU)', 'Fuzhou (FZU)'],
            rows: [
              ['Top universities', 'Xiamen University (985, marine/chemistry/economics, Tan Kah Kee), Xiamen University of Technology (undergrad engineering)', 'Fuzhou University (211, materials/chemistry/math), Minjiang University, Fujian Normal University'],
              ['Undergrad tuition (typical)', '¥18,000-28,000/yr', '¥14,000-22,000/yr'],
              ['On-campus dorm (typical)', '¥1,500-2,500/mo (shared room)', '¥1,000-1,800/mo (shared room)'],
              ['Monthly living cost (off-campus reference)', '¥2,800-3,800/mo (food + transport + misc)', '¥2,200-3,200/mo'],
              ['Climate', 'Fujian coastal subtropical: hot humid summers 33-36°C, mild winters 8-15°C, typhoon risk Aug-Sept', 'Fujian coastal subtropical: similar profile (slightly more continental influence, slightly less humid)'],
              ['Language challenge', 'Mandarin with Min-nan accent; more English in commercial settings + campus; some Hokkien', 'Mandarin with Min + Fuzhou dialect; less English in daily life; stronger Chinese-immersion environment'],
              ['International student community', 'Large: XMU alone has 2,000+ international students; bigger events + networks + Gulangyu tourism appeal', 'Smaller: FZU international students per program is ~30% of XMU; tighter community but less variety'],
              ['Industry ties', 'XMU chemistry → petrochemicals (Fujian petrochemical cluster); marine sciences → Xiamen port + marine biotech; Tan Kah Kee → Malaysia + SE Asia', 'FZU materials → Fujian electronics + new energy (CATL Fujian plant); chemistry → regional pharma; Fuzhou new district tech corridor'],
              ['CSC seats', 'More (XMU + XUT both well-represented)', 'Fewer but less competitive (per-applicant rate higher)'],
              ['City amenity', 'Gulangyu Island UNESCO site, beach access, cleaner air + more tourism infrastructure, more English in service industry', 'Three Lanes and Seven Alleys historic district, Fuzhou national forest park, less tourism, more "real" Fujian-life'],
              ['Best for', 'Marine / chemistry / economics / cross-strait-tied students who value English-medium + clean coastal city + Tan Kah Kee scholarship history', 'Materials / math / chemistry students on tighter budget who want a more grounded Chinese-immersion environment'],
            ],
          },
        ],
      },
      {
        id: 'when-xiamen',
        h2: 'Pick Xiamen if…',
        intro:
          'Xiamen makes sense for a specific applicant profile. If you match the criteria below, XMU is the stronger fit.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**You\'re studying marine sciences, chemistry, economics, or environmental science** — XMU\'s College of Ocean and Earth Sciences is top-3 in China; XMU chemistry is nationally competitive; the Xiamen petrochemical cluster (Fujian Refining, etc.) is a direct employer pipeline',
              '**You want strong English-medium coverage** — XMU runs 40+ English-taught programs across Bachelor + Master + PhD; the largest in Fujian by far',
              '**You value a clean, scenic coastal city** — Gulangyu Island is a UNESCO site; Xiamen consistently ranks in China\'s top-3 "most宜居" cities; cleaner air + more English in daily life',
              '**You\'re interested in the Tan Kah Kee scholarship history** — Mr. Tan Kah Kee (Ong Kah Kee) founded XMU; the scholarship named after him funds Southeast Asian students (Malaysia, Singapore, Indonesia, Philippines) preferentially; this is one of the strongest cross-strait ties in Chinese higher education',
              '**You want a larger international student community** — XMU alone has 2,000+ international students; bigger events + programs + networks',
              '**Budget is not the top constraint** — Xiamen is mid-tier coastal city for cost, not cheap; if every ¥1000/month matters, consider Fuzhou or smaller cities',
            ],
          },
        ],
      },
      {
        id: 'when-fuzhou',
        h2: 'Pick Fuzhou if…',
        intro:
          'Fuzhou makes sense for a different profile. If you match the criteria below, FZU is the stronger fit.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**You\'re studying materials science, chemistry, mathematics, or physics** — FZU\'s College of Materials Science is one of the strongest in southeastern China; FZU math is nationally competitive',
              '**You can\'t afford Xiamen\'s premium** — Fuzhou is ~20% cheaper across tuition + dorm + living costs',
              '**You want a more grounded Chinese-immersion environment** — fewer international students per program = more Chinese-speaking peers + more daily Chinese use',
              '**You\'re interested in Fujian\'s new energy + electronics boom** — CATL (Contemporary Amperex Technology, world\'s largest EV battery maker) has major operations in Fujian; FZU materials science feeds directly into this',
              '**You want a culturally rich historic city** — Three Lanes and Seven Alleys is one of China\'s best-preserved Ming/Qing residential districts; Fuzhou is the historical capital of Fujian province with deep Min-cultural roots',
              '**You want a less-competitive CSC route** — FZU has fewer applicants per seat than XMU; per-applicant acceptance is meaningfully higher',
            ],
          },
        ],
      },
      {
        id: 'cost-of-living',
        h2: 'Cost of living: side-by-side monthly budget',
        intro:
          'Real numbers a 2027 applicant should plan for, both cities.',
        blocks: [
          {
            type: 'table',
            caption: 'Monthly living cost comparison for international students (CNY, 2027 estimate)',
            columns: ['Item', 'Xiamen', 'Fuzhou'],
            rows: [
              ['On-campus dorm (shared)', '¥1,500-2,500/mo', '¥1,000-1,800/mo'],
              ['Meals (campus cafeteria)', '¥1,000-1,500/mo', '¥800-1,200/mo'],
              ['Meals (off-campus)', '¥1,500-2,400/mo', '¥1,200-1,800/mo'],
              ['Public transport', '¥80-200/mo (campus shuttle + bus)', '¥80-150/mo'],
              ['Phone + internet', '¥100-150/mo', '¥100-150/mo'],
              ['Personal / misc', '¥400-800/mo', '¥300-700/mo'],
              ['Monthly total (on-campus)', '¥3,180-5,150/mo', '¥2,280-4,000/mo'],
              ['Monthly total (off-campus)', '¥3,680-5,950/mo', '¥2,780-4,800/mo'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Across an academic year (10 months), Xiamen costs ~¥32,000-59,500 in living expenses alone; Fuzhou costs ~¥23,000-48,000. The ~¥9,000-11,500 difference is significant for self-funded students — equivalent to roughly 2-3 months of tuition at a tier-2 university.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Xiamen or Fuzhou cheaper for international students?',
        a: 'Fuzhou is cheaper. Across tuition + dorm + living costs, Fuzhou runs ~20% below Xiamen. A 4-year undergrad at a tier-2 university in Fuzhou can be ¥36,000-46,000 cheaper overall than the same program in Xiamen.',
      },
      {
        q: 'Which city has better English-taught programs?',
        a: 'Xiamen (XMU). XMU runs 40+ English-taught bachelor + master programs across marine sciences, chemistry, economics, and more. Fuzhou University has fewer English-medium programs but is strengthening. If you don\'t speak Chinese and need English-medium, Xiamen is the easier entry point.',
      },
      {
        q: 'What is the climate like in Xiamen vs Fuzhou?',
        a: 'Both are Fujian-province coastal subtropical with similar profiles: hot humid summers 33-36°C, mild winters 8-15°C, typhoon risk in Aug-Sept. Xiamen is slightly more humid due to island geography; Fuzhou has slightly more continental influence.',
      },
      {
        q: 'Which city is better for marine sciences students?',
        a: 'Xiamen. XMU\'s College of Ocean and Earth Sciences is top-3 in China; Xiamen port + marine biotech is a direct industry pipeline; the Tan Kah Kee legacy gives Malaysian + SE Asian marine biology students a clear cultural + academic tie.',
      },
      {
        q: 'Which city is better for materials science students?',
        a: 'Fuzhou. FZU\'s College of Materials Science is one of the strongest in southeastern China, with direct industry ties to CATL (the world\'s largest EV battery maker, with major operations in Fujian). XMU has materials science too but FZU is the specialist.',
      },
      {
        q: 'Do Xiamen and Fuzhou universities offer CSC scholarships?',
        a: 'Both do. XMU has more total CSC seats (XMU + XUT both well-represented); Fuzhou has fewer seats but less competition per seat — per-applicant acceptance rates are meaningfully higher at FZU.',
      },
      {
        q: 'Where is the larger international student community?',
        a: 'Xiamen. XMU alone has 2,000+ international students; the broader Xiamen network is bigger. Fuzhou has fewer international students per program — tighter community but less variety. Both cities benefit from the cross-strait Tan Kah Kee scholarship history for SE Asian applicants.',
      },
    ],
    howToSteps: [
      {
        name: 'Identify your priority dimensions',
        text: 'List the 2-3 dimensions that matter most to you (cost / English-medium depth / program / community / city amenity). The Phase 168 comparison table breaks these out per city — use it as the decision matrix.',
      },
      {
        name: 'Check the specific universities',
        text: 'Xiamen: visit xmu.edu.cn + xmut.edu.cn. Fuzhou: visit fzu.edu.cn + mju.edu.cn + fjnu.edu.cn. Look at the program pages for your target major + the international student pages for the application route.',
      },
      {
        name: 'Compare tuition + living cost on your scholarship',
        text: 'If you have a CSC or university scholarship that covers tuition + dorm, the cost difference between Xiamen and Fuzhou shrinks to food + transport. If you\'re self-funded, Fuzhou saves you ¥9,000-11,500/year.',
      },
      {
        name: 'Check the language of instruction',
        text: 'Xiamen has more English-medium programs; Fuzhou leans Chinese-medium. If your Chinese isn\'t ready, Xiamen makes the transition easier. If you\'re working on HSK 3.0 anyway, Fuzhou\'s immersive environment may help you progress faster.',
      },
      {
        name: 'Apply to both + decide later',
        text: 'CSC + Type B applications cost ¥0-100 per university — apply to 2-3 in each city, then pick the one that offers the best package. Don\'t pre-optimize; the market decides.',
      },
    ],
    ctaTitle: 'Choosing between Xiamen and Fuzhou?',
    ctaSubtitle:
      'SICA counselors map your academic profile (marine vs materials vs economics) + budget + city amenity preference to the right city + university. They cross-check the specific program + CSC pathway for 2027. First consultation is free.',
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
        description: 'Live budget table ranked by monthly cost — Xiamen + Fuzhou both first-class rows.',
      },
    ],
  },
  zh: {
    slug: 'xiamen-vs-fuzhou',
    eyebrow: '指南 · 城市对比',
    title: '厦门 vs 福州：哪个城市更适合国际学生？',
    description:
      '厦门 vs 福州国际学生对比：费用、气候、大学、专业、英文覆盖、国际生社区、奖学金与适合什么样的学生画像。',
    subtitle:
      '国际学生常拿来对比的两个福建沿海城市。厦门（厦门大学，陈嘉庚创办）有更强英文授课覆盖 + 更干净的沿海城市 + 旅游经济。福州（福州大学）有更便宜的生活成本 + 更深的本地学生社区 + 材料 + 数学优势。两城都有 211 选项 + 沿海亚热带气候（湿热夏季 33-36°C，温和冬季 8-15°C）+ 陈嘉庚奖学金的跨海峡历史。选择取决于：英文项目深度、社区规模偏好、预算耐受度。',
    stats: [
      { value: '厦门', label: '厦大（985）+ 厦门理工学院' },
      { value: '福州', label: '福州大学（211）+ 闽江学院' },
      { value: '¥1.8-2.8 万/年', label: '厦门本科学费（典型）' },
      { value: '¥1.4-2.2 万/年', label: '福州本科学费（典型）' },
    ],
    quickAnswer:
      '厦门（厦大）赢在英文项目覆盖（厦大开 40+ 英文项目，海洋科学全国前 3，陈嘉庚跨海峡奖学金历史）+ 干净的沿海城市 + 旅游经济 + 服务业英语更多。福州（福州大学）赢在成本（整体便宜约 20%）+ 更深的本地学生社区 + 材料 + 数学优势 + 更接地气的中华文化沉浸环境。两城都在福建，气候接近（湿热夏季 33-36°C，温和冬季 8-15°C）。选择取决于：(a) 英文项目深度——需要 20+ 英文项目就选厦门；(b) 社区规模——要更接地气的中华沉浸环境就选福州；(c) 专业——海洋 + 化学 + 经济选厦门，材料 + 数学 + 化学选福州。',
    keyTakeaways: [
      '厦门大学：厦门大学（985，海洋 / 化学 / 经济 / 陈嘉庚历史）、厦门理工学院（本科工程为主）',
      '福州大学：福州大学（211，材料 / 化学 / 数学 / 经济）、闽江学院（本科为主）、福建师范大学（师范）',
      '费用：厦门本科 ¥1.8-2.8 万/年 + 宿舍 ¥1,500-2,500/月；福州本科 ¥1.4-2.2 万/年 + 宿舍 ¥1,000-1,800/月——福州整体便宜约 20%',
      '气候：都是福建沿海亚热带。湿热夏季 33-36°C，温和冬季 8-15°C，8-9 月台风风险',
      '语言：厦门 = 普通话带闽南口音；商业 + 校园英语更多；部分闽南话；福州 = 普通话带闽 + 福州口音；日常生活英语较少；中华沉浸环境更强',
      '国际生社区：厦门规模更大（厦大单独 2000+ 国际生）；福州每项目国际生数约为厦大的 30%——社区更紧密但多元性较低',
      'CSC 通道：两城都参与；厦大 + 厦理工名额更多；福州名额少但人均竞争小（录取率更高）',
    ],
    sections: [
      {
        id: 'side-by-side',
        h2: '厦门 vs 福州一目了然',
        intro:
          '在两个沿海福建城市之间做选择时真正起作用的维度。',
        blocks: [
          {
            type: 'table',
            caption: '厦门 vs 福州国际学生对比',
            columns: ['维度', '厦门（厦大）', '福州（福州大学）'],
            rows: [
              ['顶尖大学', '厦门大学（985，海洋 / 化学 / 经济 / 陈嘉庚历史）、厦门理工学院（本科工程）', '福州大学（211，材料 / 化学 / 数学）、闽江学院、福建师范大学'],
              ['本科学费（典型）', '¥18,000-28,000/年', '¥14,000-22,000/年'],
              ['校内宿舍（典型）', '¥1,500-2,500/月（双人间）', '¥1,000-1,800/月（双人间）'],
              ['月生活费（校外参考）', '¥2,800-3,800/月（餐饮 + 交通 + 其他）', '¥2,200-3,200/月'],
              ['气候', '福建沿海亚热带：湿热夏季 33-36°C，温和冬季 8-15°C，8-9 月台风风险', '福建沿海亚热带：接近（大陆影响稍多，湿度略低）'],
              ['语言挑战', '普通话带闽南口音；商业环境英语更多；部分闽南话', '普通话带闽 + 福州口音；日常生活英语较少；中华沉浸环境更强'],
              ['国际生社区', '大：厦大单独 2000+ 国际生；活动更多 + 鼓浪屿旅游吸引', '较小：每项目国际生约为厦大 30%；社区紧密但多元性低'],
              ['产业对接', '厦大化学 → 石化（福建炼化）；海洋科学 → 厦门港 + 海洋生物科技；陈嘉庚 → 马来西亚 + 东南亚', '福大材料 → 福建电子 + 新能源（宁德时代福建基地）；化学 → 区域制药；福州新区科技走廊'],
              ['CSC 名额', '更多（厦大 + 厦理工都覆盖好）', '更少但人均竞争小（录取率更高）'],
              ['城市配套', '鼓浪屿 UNESCO 遗产，海滩可达，空气更干净 + 旅游设施更完善 + 服务业英语更多', '三坊七巷历史街区，福州国家森林公园，旅游较少，更"真实"的福建生活'],
              ['适合人群', '海洋 / 化学 / 经济 / 跨海峡关联学生；偏好英文授课 + 干净沿海城市 + 陈嘉庚奖学金历史', '材料 / 数学 / 化学学生；预算更紧；偏好接地气的中华沉浸环境'],
            ],
          },
        ],
      },
      {
        id: 'when-xiamen',
        h2: '以下情况选厦门……',
        intro:
          '厦门适合特定的申请者画像。如果你符合下列标准，厦大就是更强的选择。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**你读海洋科学 / 化学 / 经济 / 环境科学**——厦大海洋与地球科学学院全国前 3；厦大化学全国有竞争力；厦门石化集群（福建炼化等）是直接就业通道',
              '**你想要强英文授课覆盖**——厦大开 40+ 英文授课本硕项目；福建最多',
              '**你看重干净、风景好的沿海城市**——鼓浪屿是 UNESCO 遗产；厦门常年位居中国"最宜居"城市前三；空气更干净 + 日常生活英语更多',
              '**你对陈嘉庚奖学金历史感兴趣**——陈嘉庚先生创办厦大；以他命名的奖学金优先资助东南亚学生（马来西亚、新加坡、印尼、菲律宾）；这是中国高等教育最强的跨海峡纽带之一',
              '**你想要更大的国际生社区**——厦大单独 2000+ 国际生；活动 + 项目 + 人脉都更多',
              '**预算不是首要约束**——厦门在费用上属中层级沿海城市而不是便宜；每月差 ¥1000 都肉痛的话，考虑福州或更小的城市',
            ],
          },
        ],
      },
      {
        id: 'when-fuzhou',
        h2: '以下情况选福州……',
        intro:
          '福州适合另一类画像。如果你符合下列标准，福大就是更强的选择。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**你读材料科学 / 化学 / 数学 / 物理**——福大材料学院是华东最强之一；福大数学全国有竞争力',
              '**你付不起厦门的溢价**——福州整体比厦门便宜约 20%（学费 + 宿舍 + 生活费）',
              '**你想要更接地气的中华沉浸环境**——每项目国际生较少 = 更多说中文的同侪 + 更多日常中文使用',
              '**你对福建的新能源 + 电子崛起感兴趣**——宁德时代（全球最大电动车电池厂商）在福建有重大业务；福大材料科学直接对接',
              '**你想要文化底蕴深厚的历史名城**——三坊七巷是中国保护最好的明清居住区之一；福州是福建历史文化中心 + 闽文化深度根植',
              '**你想要竞争较小的 CSC 通道**——福大每席位申请者少于厦大；人均录取率明显更高',
            ],
          },
        ],
      },
      {
        id: 'cost-of-living',
        h2: '月生活费：每月预算横向对比',
        intro:
          '2027 申请者应规划的真实数字，两城对比。',
        blocks: [
          {
            type: 'table',
            caption: '国际学生月生活费对比（人民币，2027 估算）',
            columns: ['项目', '厦门', '福州'],
            rows: [
              ['校内宿舍（双人间）', '¥1,500-2,500/月', '¥1,000-1,800/月'],
              ['校内食堂', '¥1,000-1,500/月', '¥800-1,200/月'],
              ['校外餐饮', '¥1,500-2,400/月', '¥1,200-1,800/月'],
              ['公共交通', '¥80-200/月（校车 + 公交）', '¥80-150/月'],
              ['手机 + 宽带', '¥100-150/月', '¥100-150/月'],
              ['个人 / 其他', '¥400-800/月', '¥300-700/月'],
              ['月总计（住校内）', '¥3,180-5,150/月', '¥2,280-4,000/月'],
              ['月总计（住校外）', '¥3,680-5,950/月', '¥2,780-4,800/月'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '按一学年（10 个月）计，厦门生活费 ~¥32,000-59,500；福州 ~¥23,000-48,000。¥9,000-11,500 的差距对自费学生很可观——相当于中层级大学 2-3 个月的学费。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '厦门和福州哪个对国际学生更便宜？',
        a: '福州更便宜。学费 + 宿舍 + 生活费合计，福州比厦门低约 20%。四年本科在福州中层级大学总计可比厦门省 ¥36,000-46,000。',
      },
      {
        q: '哪个城市的英文授课项目更多？',
        a: '厦门（厦大）。厦大开 40+ 英文授课本硕项目覆盖海洋科学、化学、经济等。福州大学英文项目较少但正在加强。如果你不熟中文又要英文授课，厦门是更轻松的选择。',
      },
      {
        q: '厦门和福州气候差别多大？',
        a: '都是福建沿海亚热带：夏季 33-36°C 湿度高，冬季温和 8-15°C，8-9 月有台风风险。厦门因岛屿地理略湿，福州受大陆影响略多、湿度略低。',
      },
      {
        q: '哪个城市更适合海洋科学学生？',
        a: '厦门。厦大海洋与地球科学学院全国前 3；厦门港 + 海洋生物科技是直接产业通道；陈嘉庚传统让马来西亚 + 东南亚海洋生物学生有清晰的学术 + 文化纽带。',
      },
      {
        q: '哪个城市更适合材料科学学生？',
        a: '福州。福大材料学院是华东最强之一，直接对接宁德时代（全球最大电动车电池厂商，在福建有重大业务）。厦大也有材料科学但福大是专业户。',
      },
      {
        q: '厦门和福州的大学提供 CSC 奖学金吗？',
        a: '都提供。厦大 + 厦理工总名额更多。福州名额少但每席位竞争小——福大的人均录取率明显更高。',
      },
      {
        q: '哪里国际生社区更大？',
        a: '厦门。厦大单独 2000+ 国际生；整个厦门网络更大。福州每项目国际生较少——社区更紧密但多元性较低。两城都受益于陈嘉庚跨海峡奖学金历史，对东南亚申请者是加分项。',
      },
    ],
    howToSteps: [
      {
        name: '识别你的优先维度',
        text: '列出 2-3 个对你最重要的维度（费用 / 英文项目深度 / 专业 / 社区 / 城市配套）。Phase 168 对比表按维度拆分——把它当决策矩阵。',
      },
      {
        name: '查具体大学',
        text: '厦门：xmu.edu.cn + xmut.edu.cn。福州：fzu.edu.cn + mju.edu.cn + fjnu.edu.cn。看目标专业的项目页面 + 国际生页面的申请通道。',
      },
      {
        name: '对比学费 + 生活费与你的奖学金',
        text: '如果你有 CSC 或校级奖学金覆盖学费 + 宿舍，厦门 vs 福州的差距缩小到餐饮 + 交通。如果自费，福州一年省 ¥9,000-11,500。',
      },
      {
        name: '查授课语言',
        text: '厦门英文项目多；福州偏中文。如果中文还没准备好，厦门转换更容易。如果本来就在备考 HSK 3.0，福州沉浸环境可能让你进步更快。',
      },
      {
        name: '两城都申请 + 之后再决定',
        text: 'CSC + Type B 申请每所大学 ¥0-100——每城申请 2-3 所，之后挑 offer 最好的。别过早优化；让市场决定。',
      },
    ],
    ctaTitle: '在厦门与福州之间选择？',
    ctaSubtitle:
      'SICA 顾问把你的学术画像（海洋 vs 材料 vs 经济）+ 预算 + 城市配套偏好映射到合适的城市 + 大学，并交叉核对 2027 年具体专业 + CSC 通道。首次咨询免费。',
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
        description: '实时预算表按月生活费排序——厦门 + 福州都是第一梯队行。',
      },
    ],
  },
};
