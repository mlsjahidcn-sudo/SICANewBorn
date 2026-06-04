import type { LocalizedGuide } from './types';

/**
 * "Cost of living in China for international students" — long-form guide.
 * Target queries: "cost of living in china for students", "monthly
 * expenses china", "china student budget".
 */
export const costOfLivingGuide: LocalizedGuide = {
  en: {
    slug: 'cost-of-living',
    eyebrow: 'GUIDE · BUDGET',
    title: 'Cost of Living in China for International Students (2026)',
    description:
      'Real monthly budgets for international students in China: housing, food, transport, phone, healthcare.',
    subtitle: 'A 4-year China bachelor\'s costs $24,000-80,000. Here is where the money goes.',
    stats: [
      { value: '$800-1,500', label: 'Monthly budget range' },
      { value: '$2-4', label: 'Average meal' },
      { value: '70%', label: 'Cheaper than US tuition' },
      { value: '$200-600', label: 'Monthly dorm rent' },
    ],
    quickAnswer:
      'International students in China typically spend $800-1,500 USD per month for everything. A 4-year bachelor\'s at a public Chinese university costs $24,000-80,000 total, vs. $160,000-260,000 at a US public school. The biggest variables are city (Beijing/Shanghai cost 30-50% more than tier-2 cities), housing (on-campus dorm cuts costs by 60-80%), and lifestyle (cooking vs eating out). With a CSC scholarship, out-of-pocket drops to $1,000-2,000 per year.',
    keyTakeaways: [
      'Total monthly budget: $800-1,500',
      'On-campus dorm is 60-80% cheaper than off-campus',
      'Beijing and Shanghai cost 30-50% more than tier-2 cities',
      'Campus cafeteria meals average $2-4',
      'A full 4-year bachelor\'s at a public Chinese university: $24,000-80,000',
    ],
    sections: [
      {
        id: 'total-cost',
        h2: 'Total cost: the 4-year bachelor\'s picture',
        intro: 'The biggest factor in total cost is whether you get a scholarship.',
        blocks: [
          {
            type: 'p',
            text: 'With CSC, your out-of-pocket drops to ~$1,000-2,000 per year. Without any scholarship, plan for $6,000-15,000 per year all-in. The breakdown below shows the range across major scenarios.',
          },
          {
            type: 'table',
            caption: '4-year bachelor\'s total cost (USD, 2026)',
            columns: ['Scenario', 'Tier-1 city', 'Tier-2 city'],
            rows: [
              ['Self-funded, on-campus dorm', '$60,000-80,000', '$30,000-50,000'],
              ['Self-funded, off-campus apartment', '$80,000-120,000', '$50,000-80,000'],
              ['University scholarship (50% tuition) + dorm', '$40,000-55,000', '$20,000-35,000'],
              ['CSC scholarship (full funding) + dorm', '$5,000-10,000', '$3,000-6,000'],
            ],
          },
        ],
      },
      {
        id: 'housing',
        h2: 'Housing: on-campus dorm vs. off-campus apartment',
        intro: 'Housing is your single biggest cost. Picking the right option can save $3,000-8,000 per year.',
        blocks: [
          {
            type: 'table',
            caption: 'Housing cost comparison (USD, 2026)',
            columns: ['Option', 'Monthly cost', 'Pros', 'Cons'],
            rows: [
              ['On-campus dorm (single)', '$80-200', 'Cheapest, utilities included, near classes, English-speaking community', 'Smaller rooms, less privacy'],
              ['On-campus dorm (shared)', '$50-100', 'Cheapest option, social, easy to make friends', 'Roommate conflicts possible, less privacy'],
              ['On-campus apartment', '$300-600', 'Privacy, kitchen, more space', 'Limited availability, often only for seniors or couples'],
              ['Off-campus 1BR', '$400-800', 'Privacy, full kitchen, near city life', 'Find it yourself, Chinese contract, deposit + agency fee'],
              ['Off-campus shared', '$250-450', 'Affordable, more space than dorm', 'Find roommates, contract complexity'],
            ],
          },
          {
            type: 'h3',
            text: 'How to find off-campus housing',
            body: 'Most international students stay in dorms for at least the first year. After that, common platforms: 链家 (Lianjia), 贝壳 (Beike), Ziroom (Zuber), or WeChat groups. Expect to pay 1 month deposit (often "押一付三"), 1 month rent as agency fee (50% if no agent), utilities ¥200-400/month. Always sign a Chinese contract and have a Chinese-speaking friend review it.',
          },
        ],
      },
      {
        id: 'food',
        h2: 'Food: campus cafeteria, restaurants, and groceries',
        intro: 'Food is the second-biggest cost after housing. Cooking at home cuts it by 60-70%.',
        blocks: [
          {
            type: 'table',
            caption: 'Food costs in China (USD, 2026)',
            columns: ['Option', 'Per meal', 'Monthly (3 meals/day)'],
            rows: [
              ['Campus cafeteria (basic)', '$1.50-2.50', '$130-220'],
              ['Campus cafeteria (premium)', '$2.50-4', '$220-360'],
              ['Local restaurant (cheap)', '$3-5', '$270-450'],
              ['Local restaurant (mid-range)', '$5-10', '$450-900'],
              ['Cooking at home', '$2-3 per meal', '$180-270'],
              ['Mix (cafeteria + cooked dinner)', '—', '$200-350'],
            ],
          },
          {
            type: 'h3',
            text: 'Where to shop for groceries',
            body: 'Supermarkets: 物美 (Wumart), 永辉 (Yonghui), 沃尔玛 (Walmart), 盒马 (Hema, premium). Convenience: 全家 (FamilyMart), 7-11, 便利蜂. International: Ole, ParknShop (in tier-1 cities). Budget hack: shop at the local wet market (菜市场) for fresh produce at 30-50% off supermarket prices.',
          },
          {
            type: 'h3',
            text: 'Food delivery apps',
            body: '美团 (Meituan) and 饿了么 (Eleme) deliver food, groceries, and pharmacy. Most international students use them 2-4 times per week. Cost: ¥20-40 per delivery meal, ¥5-8 delivery fee.',
          },
        ],
      },
      {
        id: 'transport',
        h2: 'Transport: subway, bus, taxi, high-speed rail',
        intro: 'Public transport in China is the best in the world: cheap, fast, and ubiquitous.',
        blocks: [
          {
            type: 'table',
            caption: 'Transport costs (USD, 2026)',
            columns: ['Mode', 'Cost', 'Notes'],
            rows: [
              ['Subway (single ride)', '$0.30-0.80', 'Distance-based; ¥3-7'],
              ['Bus', '$0.20-0.30', 'Flat fare; ¥1-2'],
              ['Subway monthly pass', '$20-40', 'Unlimited rides within one city'],
              ['Shared bike', '$0.15-0.30 per ride', 'Great for last-mile; monthly pass ~$10'],
              ['DiDi (ride-hail) short trip', '$2-5', 'Slightly cheaper than Uber'],
              ['High-speed rail 2nd class', '$0.05-0.10/km', 'Beijing-Shanghai ¥553 (~$77)'],
              ['Domestic flight', '$50-200', 'For trips >1,000 km'],
            ],
          },
          {
            type: 'h3',
            text: 'Student transport discounts',
            body: 'Most university students get 50% off public transit via the campus card. High-speed rail has a 75% off student discount on most routes — register at the station with your student ID. This makes intercity travel much cheaper than flying for distances under 1,000 km.',
          },
          {
            type: 'h3',
            text: 'Do you need a car?',
            body: 'No. License plates in Beijing/Shanghai cost $10,000-15,000 alone. Parking is expensive. Traffic is bad. Subways and bikes cover 95% of student needs.',
          },
        ],
      },
      {
        id: 'phone-internet',
        h2: 'Phone, internet, and streaming',
        intro: 'Mobile data in China is cheap and fast. Getting a Chinese phone number is essential for daily life.',
        blocks: [
          {
            type: 'h3',
            text: 'Phone plans',
            body: 'Three major carriers: 中国移动 (China Mobile, biggest coverage), 中国联通 (China Unicom), 中国电信 (China Telecom). For international students, China Mobile and Unicom are the most foreigner-friendly. Plans start at ¥39-99/month ($5-15) for 30-100 GB of data + free domestic calls. Bring your passport to a carrier store.',
          },
          {
            type: 'h3',
            text: 'Internet and VPN',
            body: 'Home internet: 100-1,000 Mbps fiber, ¥50-150/month ($7-22). Most universities include internet in the dorm fee. To access Google, YouTube, Facebook, Instagram, WhatsApp, you need a VPN. Paid options like Astrill, ExpressVPN, or NordVPN cost $5-12/month. Many students pool a subscription with classmates.',
          },
        ],
      },
      {
        id: 'healthcare',
        h2: 'Healthcare: insurance, clinics, and emergency',
        intro: 'Healthcare in China is affordable by international standards, but you need insurance to access the good hospitals easily.',
        blocks: [
          {
            type: 'h3',
            text: 'International student health insurance',
            body: 'Required for X1 visa holders. Costs ¥800/year (~$115). Covers outpatient visits (70-90% reimbursement), hospitalization (80-100%), emergency care. Buy through your university\'s international office during the first week.',
          },
          {
            type: 'h3',
            text: 'Where to go for healthcare',
            body: 'On-campus clinic: free or ¥10-30 per visit, handles minor issues. University-affiliated hospital: most international students go here for non-emergency care. Public hospital: tier-3 hospitals have international wings (VIP/外宾) but wait times are long. Private international clinic (Beijing United Family, Shanghai United Family): Western-trained doctors, English-speaking, no queues, but ¥1,000-3,000 per visit.',
          },
        ],
      },
      {
        id: 'city-comparison',
        h2: 'City comparison: where your money goes furthest',
        intro: 'Same lifestyle costs 30-50% more in Beijing or Shanghai than in tier-2 cities.',
        blocks: [
          {
            type: 'table',
            caption: 'Monthly cost comparison by city (USD, 2026)',
            columns: ['Expense', 'Beijing/Shanghai', 'Wuhan/Nanjing', 'Kunming/Lanzhou'],
            rows: [
              ['On-campus dorm', '$150-250', '$80-150', '$60-100'],
              ['Off-campus 1BR', '$600-1,000', '$300-500', '$200-350'],
              ['Campus meals (3/day)', '$250-350', '$180-250', '$150-200'],
              ['Restaurants (3x/week)', '$100-150', '$70-100', '$50-80'],
              ['Public transit', '$30-50', '$20-30', '$15-25'],
              ['Phone + internet', '$20-30', '$20-30', '$15-25'],
              ['Personal + entertainment', '$150-250', '$100-200', '$80-150'],
              ['TOTAL (dorm + cafeteria)', '$800-1,200', '$500-800', '$400-650'],
              ['TOTAL (apartment + restaurants)', '$1,500-2,500', '$900-1,500', '$700-1,100'],
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How much money do I need per month to study in China?',
        a: 'Plan for $800-1,500 USD per month to cover everything: housing, food, transport, phone, healthcare, and personal expenses. Tier-1 cities cost $1,200-1,500/month with off-campus housing, while tier-2 cities cost $800-1,200. If you live in a dorm and eat at the cafeteria, you can get by on $500-800/month.',
      },
      {
        q: 'Is China expensive for international students?',
        a: 'No — China is one of the most affordable major study-abroad destinations. A 4-year bachelor\'s at a public Chinese university costs $24,000-80,000 USD total, vs. $160,000-260,000 at a US public university.',
      },
    ],
    howToSteps: [
      { name: 'Estimate your total annual budget', text: 'Use a city-comparison table to estimate your monthly cost. Multiply by 9 months (school year) + 3 months summer. Add tuition + insurance + visa + travel.' },
      { name: 'Apply for scholarships to reduce costs', text: 'CSC, university, and provincial scholarships can cover $20,000-50,000/year. Apply for at least 2-3 in parallel.' },
      { name: 'Choose a city that matches your budget', text: 'If budget is tight, consider tier-2 cities. Zhejiang U (Hangzhou), Nanjing U, and Wuhan U are top-100 schools with lower costs than Beijing/Shanghai.' },
      { name: 'Plan your housing for year 1', text: 'Most international students live on campus for year 1. The dorm is the cheapest, easiest, and most social option.' },
    ],
    ctaTitle: 'Get a personalized budget estimate',
    ctaSubtitle: 'SICA\'s free assessment calculates your projected monthly cost and shows you which scholarships close the gap.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      { href: '/guides/study-in-china', label: 'Why study in China', description: 'Top universities, costs, scholarships, student life, career outcomes.' },
      { href: '/guides/scholarships', label: 'Scholarships', description: 'CSC, Confucius, university, and provincial scholarship programs.' },
      { href: '/guides/accommodation', label: 'Accommodation', description: 'On-campus dorms, off-campus apartments, what to expect.' },
    ],
  },

  zh: {
    slug: 'cost-of-living',
    eyebrow: '指南 · 生活成本',
    title: '中国留学生活费完全攻略（2026）',
    description: '国际生月度真实预算：住房、餐饮、交通、手机、医疗。',
    subtitle: '中国本科4年总费用$24,000-80,000。下面告诉你钱花在哪。',
    stats: [
      { value: '¥5,800-10,800', label: '月预算' },
      { value: '¥15-30', label: '平均餐费' },
      { value: '70%', label: '比美国便宜' },
      { value: '¥1,500-4,500', label: '月住宿' },
    ],
    quickAnswer:
      '国际生在中国每月总开销$800-1,500美元。中国公立大学4年本科总费用$24,000-80,000美元，相比美国公立$160,000-260,000。最大变量是城市、住房、生活方式。拿CSC奖学金后，自付部分降到$1,000-2,000/年。',
    keyTakeaways: [
      '月度总预算：$800-1,500',
      '校内宿舍比校外省60-80%',
      '北京、上海比二线贵30-50%',
      '食堂一餐¥10-30',
      '公立中国大学4年本科：$24,000-80,000',
    ],
    sections: [
      {
        id: 'total-cost',
        h2: '总费用：4年本科全景',
        intro: '总费用最大的因素是奖学金。',
        blocks: [
          { type: 'p', text: '拿CSC，自付部分降到约$1,000-2,000/年；不拿任何奖，预算$6,000-15,000/年全包。' },
          {
            type: 'table',
            caption: '4年本科总费用（美元，2026）',
            columns: ['情形', '一线城市', '二线城市'],
            rows: [
              ['自费，校内宿舍', '$60,000-80,000', '$30,000-50,000'],
              ['自费，校外公寓', '$80,000-120,000', '$50,000-80,000'],
              ['院校奖+宿舍', '$40,000-55,000', '$20,000-35,000'],
              ['CSC全奖+宿舍', '$5,000-10,000', '$3,000-6,000'],
            ],
          },
        ],
      },
      {
        id: 'housing',
        h2: '住房：校内宿舍 vs 校外公寓',
        intro: '住房是单项最大开销。选对住房一年能省$3,000-8,000。',
        blocks: [
          {
            type: 'table',
            caption: '住房费用对比（美元，2026）',
            columns: ['选项', '月费', '优点', '缺点'],
            rows: [
              ['校内宿舍（单人间）', '$80-200', '最便宜，水电网全包，离教室近，国际生圈', '房间小，隐私少'],
              ['校内宿舍（双人间）', '$50-100', '最便宜选项，社交，易交到朋友', '室友可能冲突，隐私少'],
              ['校内公寓', '$300-600', '隐私、厨房、空间大', '稀缺，通常只对高年级或情侣开放'],
              ['校外1居室', '$400-800', '隐私、完整厨房、近城市生活', '需自己找，中文合同，押金+中介费'],
              ['校外合租', '$250-450', '实惠，比宿舍空间大', '需自己找室友，合同复杂'],
            ],
          },
          {
            type: 'h3',
            text: '怎么找校外房',
            body: '多数国际生第一年住宿舍。之后常用：链家（最大中介）、贝壳、Ziroom（自如），或通过微信群。预期：1个月押金（"押一付三"）、1个月房租中介费（无中介减半）、水电燃气网¥200-400/月。务必签中文合同，找中文好的朋友把关。',
          },
        ],
      },
      {
        id: 'food',
        h2: '餐饮：食堂、餐厅、买菜',
        intro: '餐饮是第二大开销。自己做饭省60-70%。',
        blocks: [
          {
            type: 'table',
            caption: '中国餐饮费用（美元，2026）',
            columns: ['选项', '每餐', '月费（一日3餐）'],
            rows: [
              ['食堂（基础）', '$1.50-2.50', '$130-220'],
              ['食堂（精选）', '$2.50-4', '$220-360'],
              ['本地小馆', '$3-5', '$270-450'],
              ['本地中端餐厅', '$5-10', '$450-900'],
              ['在家做饭', '$2-3每餐', '$180-270'],
              ['混合（食堂+晚餐在家）', '—', '$200-350'],
            ],
          },
          {
            type: 'h3',
            text: '买菜去哪',
            body: '超市：物美、永辉、沃尔玛、盒马（高端）。便利店：全家、7-11、便利蜂。国际：Ole、百佳（一线城市）。窍门：去当地菜市场买生鲜鱼肉，比超市便宜30-50%。',
          },
          {
            type: 'h3',
            text: '外卖App',
            body: '美团和饿了么送一切：餐饮、生鲜、药品。多数国际生每周用2-4次。一单外卖¥20-40、配送费¥5-8、打赏¥3-5。',
          },
        ],
      },
      {
        id: 'transport',
        h2: '交通：地铁、公交、网约车、高铁',
        intro: '中国公共交通世界一流：便宜、快速、四通八达。',
        blocks: [
          {
            type: 'table',
            caption: '交通费用（美元，2026）',
            columns: ['方式', '费用', '备注'],
            rows: [
              ['地铁（单次）', '$0.30-0.80', '按距离；¥3-7'],
              ['公交', '$0.20-0.30', '统一票价；¥1-2'],
              ['地铁月票', '$20-40', '市内无限次'],
              ['共享单车', '$0.15-0.30/次', '接驳神器；月卡~$10'],
              ['滴滴短途', '$2-5', '比Uber略便宜'],
              ['高铁二等座', '$0.05-0.10/公里', '北京-上海 ¥553（~$77）'],
              ['国内航班', '$50-200', '1,000公里以上首选'],
            ],
          },
          {
            type: 'h3',
            text: '学生交通优惠',
            body: '多数大学生凭校园卡公共交通5折。高铁二等座有75折学生票（多数线路），去车站凭学生证办。1,000公里以下城际出行神器。',
          },
          {
            type: 'h3',
            text: '需要买车吗？',
            body: '不需要。北京上海光车牌就¥70,000-100,000。停车贵。堵车。地铁+单车覆盖95%学生需求。',
          },
        ],
      },
      {
        id: 'phone-internet',
        h2: '手机、上网、流媒体',
        intro: '中国移动数据便宜又快速。中国手机号是日常生活必备。',
        blocks: [
          {
            type: 'h3',
            text: '手机套餐',
            body: '三大运营商：中国移动（覆盖最广）、中国联通、中国电信。国际生推荐中国移动或联通。套餐¥39-99/月（$5-15），含30-100GB流量+免费国内通话。带护照去营业厅办。',
          },
          {
            type: 'h3',
            text: '宽带和VPN',
            body: '家庭宽带：100-1,000Mbps光纤，¥50-150/月（$7-22）。多数大学宿舍包含在住宿费里。访问Google、YouTube、Facebook、Instagram、WhatsApp需要VPN。付费VPN（Astrill、ExpressVPN、NordVPN）$5-12/月。国际生常合伙买分摊。',
          },
        ],
      },
      {
        id: 'healthcare',
        h2: '医疗：保险、诊所、急诊',
        intro: '中国医疗相对国际标准便宜，但需要保险才能顺畅看病。',
        blocks: [
          {
            type: 'h3',
            text: '国际生医保',
            body: 'X1签证持有人必须购买。¥800/年（~$115）。覆盖：门诊（报销70-90%）、住院（80-100%）、急诊、意外。通过学校国际处在第一周购买。',
          },
          {
            type: 'h3',
            text: '去哪看病',
            body: '校医院：免费或¥10-30/次，处理小毛病。附属医院：多数国际生非急诊首选。公立医院：三甲有国际部（VIP/外宾），排队长，英文医生少。私立国际诊所（北京/上海和睦家）：西方医生、英文好、不排队，但¥1,000-3,000/次。',
          },
        ],
      },
      {
        id: 'city-comparison',
        h2: '城市对比：钱花得最值的地方',
        intro: '同样生活方式，北京/上海比二线城市贵30-50%。',
        blocks: [
          {
            type: 'table',
            caption: '按城市月度开销对比（美元，2026）',
            columns: ['项目', '北京/上海', '武汉/南京', '昆明/兰州'],
            rows: [
              ['校内宿舍', '$150-250', '$80-150', '$60-100'],
              ['校外1居室', '$600-1,000', '$300-500', '$200-350'],
              ['食堂3餐', '$250-350', '$180-250', '$150-200'],
              ['餐厅3次/周', '$100-150', '$70-100', '$50-80'],
              ['公共交通', '$30-50', '$20-30', '$15-25'],
              ['手机+宽带', '$20-30', '$20-30', '$15-25'],
              ['个人+娱乐', '$150-250', '$100-200', '$80-150'],
              ['合计（宿舍+食堂）', '$800-1,200', '$500-800', '$400-650'],
              ['合计（公寓+餐厅）', '$1,500-2,500', '$900-1,500', '$700-1,100'],
            ],
          },
        ],
      },
    ],
    faqs: [
      { q: '中国留学每月要多少钱？', a: '预算$800-1,500美元/月。一线城市$1,200-1,500/月，二线$800-1,200/月。宿舍+食堂能压到$500-800/月。CSC奖学金每月补贴¥2,500-3,500覆盖大部分开销。' },
      { q: '中国留学贵吗？', a: '不贵——中国是最实惠的主要留学目的地之一。4年本科$24,000-80,000美元，而美国公立$160,000-260,000。' },
    ],
    howToSteps: [
      { name: '估算年度总预算', text: '用城市对比表估算月开销，乘以9+3，加上学费+医保+签证+旅行。' },
      { name: '申请奖学金降成本', text: 'CSC、院校、省市奖能覆盖$20,000-50,000/年。至少平行申2-3个。' },
      { name: '选匹配预算的城市', text: '预算紧就选二线。浙大、南大、武大都是名校+低成本。' },
      { name: '第一年住校内', text: '多数国际生第一年住宿舍：最便宜、最方便、最易交朋友。' },
    ],
    ctaTitle: '拿到你的个性化预算',
    ctaSubtitle: 'SICA免费评估算你的月开销，并告诉你哪些奖学金能补上。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/study-in-china', label: '为什么来华留学', description: '顶尖大学、学费、奖学金、校园生活。' },
      { href: '/guides/scholarships', label: '奖学金', description: 'CSC、孔子学院、院校、省市政府奖。' },
      { href: '/guides/accommodation', label: '住宿', description: '校内宿舍、校外公寓。' },
    ],
  },
};
