import type { LocalizedGuide } from './types';

/**
 * "Student accommodation in China" — long-form guide.
 * Target queries: "china student housing", "international student
 * dormitory china", "off-campus apartment china".
 */
export const accommodationGuide: LocalizedGuide = {
  en: {
    slug: 'accommodation',
    eyebrow: 'GUIDE · HOUSING',
    title: 'Student Accommodation in China: Dorms, Apartments, and What to Expect',
    description:
      'How to find housing as an international student in China: on-campus dorms, off-campus apartments, costs, contracts, and what to look for.',
    subtitle:
      'Your dorm is where you\'ll spend half your time in China. Here is how to pick the right one.',
    stats: [
      { value: '$50-250', label: 'On-campus dorm range' },
      { value: '$250-800', label: 'Off-campus apartment range' },
      { value: '15-25m²', label: 'Typical dorm room size' },
      { value: '70%+', label: 'International students in dorms' },
    ],
    quickAnswer:
      'About 70% of international students in China live in on-campus dorms. Dorms cost $50-250/month (single or shared), include utilities, Wi-Fi, and basic furniture, and are the easiest way to plug into campus life. Off-campus apartments cost $250-800/month for a 1-bedroom in a tier-1 city, but require a Chinese-speaking helper to navigate contracts. Most universities guarantee international students a dorm bed for the first year; after that, demand varies. Apply for the dorm as soon as you accept admission — popular universities fill up by July.',
    keyTakeaways: [
      'On-campus dorms are the default for year 1 ($50-250/month)',
      'Off-campus apartments are 3-5x more expensive but give you privacy',
      'Apply for the dorm immediately after accepting admission',
      'Shared dorm = $50-100, single = $80-200, apartment = $300-800',
      'Always sign a Chinese rental contract and read every clause',
      'Off-campus requires a 1-month deposit + 3 months rent upfront (押一付三)',
    ],
    sections: [
      {
        id: 'on-campus-dorms',
        h2: 'On-campus dorms: the default choice',
        intro: 'On-campus dorms are where most international students live, especially in year 1. They are cheaper, more social, and require zero Chinese-language skills to navigate.',
        blocks: [
          {
            type: 'table',
            caption: 'Dorm room types at major Chinese universities (2026)',
            columns: ['Room type', 'Size', 'Monthly cost', 'Who it suits'],
            rows: [
              ['Double room (2 people)', '15-20m²', '$50-100', 'First-year students, social butterflies, budget-conscious'],
              ['Single room (1 person)', '12-18m²', '$80-200', 'Returning students, scholars, those who value quiet'],
              ['Triple room (3 people)', '20-25m²', '$40-80', 'Budget-focused, large friend groups'],
              ['Suite (2-4 rooms, shared bathroom)', '40-60m²', '$200-400', 'Couples, families, masters/PhD students'],
              ['Studio apartment (university-owned)', '25-40m²', '$200-450', 'Seniors, those wanting a kitchen'],
            ],
          },
          {
            type: 'h3',
            text: 'What\'s included in a typical dorm',
            body: 'Bed (usually a single), desk + chair, wardrobe, bookshelves, Wi-Fi, electricity (¥10-30/month in winter for heating in some regions, ¥20-50 in summer for air conditioning), water (free or ¥10-20/month), shared bathroom per floor or per room, shared laundry room, public kitchen (some dorms), 24/7 security guard at building entrance.',
          },
          {
            type: 'h3',
            text: 'What you need to bring',
            body: 'Bedding (sheets, pillow, duvet, mattress cover — you can buy on Taobao for ¥200-500 or order an "arrival package" from the university for ¥300-800). Toiletries and towels. Power adapters (China uses Type A/C/I plugs, 220V). Small kitchenware if you plan to cook. Laptop and electronics. Books and study materials.',
          },
        ],
      },
      {
        id: 'off-campus',
        h2: 'Off-campus apartments: when you want more space',
        intro: 'Off-campus housing is for students who want privacy, a kitchen, or to live with friends. It costs 3-5x more than a dorm and requires more legwork.',
        blocks: [
          {
            type: 'h3',
            text: 'When to consider off-campus',
            body: 'You\'re past year 1 and want a kitchen. You have a family with you. You and a group of friends want to share. You want to live near a specific job or research site. The dorm is full (rare but happens at the most popular universities).',
          },
          {
            type: 'h3',
            text: 'Where to find off-campus housing',
            body: 'Apps: 链家 (Lianjia) — biggest real estate agency, has English-speaking agents in some cities. 贝壳 (Beike) — Lianjia\'s app, similar listings. Ziroom (自如) — modern furnished apartments, slightly pricier, English app. 58同城 (58.com) — biggest classifieds, but watch for scams. Danke (蛋壳) — co-living brand, but check current status (it had financial trouble in 2021). WeChat groups — your university\'s international student group often posts available apartments.',
          },
          {
            type: 'h3',
            text: 'The Chinese rental contract: 5 things to watch for',
            body: '1) 押一付三 (deposit 1 month + 3 months rent upfront) is standard. 2) 押二付一 (deposit 2 months + 1 month rent) is common in tier-1 cities. 3) Agency fee is 1 month rent (50% if no agent). 4) The contract should be in Chinese and English (request bilingual). 5) Termination clauses — most require 30 days notice and forfeit 1-2 months deposit if you break the contract early.',
          },
          {
            type: 'h3',
            text: 'Costs beyond rent',
            body: 'Utilities (electricity, water, gas, internet): ¥200-500/month combined. Property management fee (物业费): ¥1-3/m²/month = ¥50-300 for a 1BR. Internet installation: ¥100-300 one-time. Furniture if unfurnished: ¥2,000-10,000 to set up. Cleaning service (optional): ¥100-200/month.',
          },
        ],
      },
      {
        id: 'application',
        h2: 'How to apply for on-campus housing',
        intro: 'Dorm applications are usually part of the university admission process. Miss the deadline and you may end up on a waitlist.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Accept your admission offer** — most universities send a dorm application link within 1-2 weeks of acceptance',
              '**Fill in the housing form** — choose room type (single/shared/triple), roommate preferences (gender, smoking, sleeping schedule), and any medical needs',
              '**Pay the dorm deposit** — typically 1 semester or 1 year, ¥500-3,000 depending on room type',
              '**Receive your dorm assignment** — usually in August for September intake, via the university portal or email',
              '**Check in on arrival** — bring your passport, admission notice, and dorm payment receipt. Universities run a 2-3 day check-in window before orientation',
              '**Buy bedding and supplies** — on campus or order online for delivery before you arrive',
            ],
          },
          {
            type: 'h3',
            text: 'Roommate matching',
            body: 'Most universities let you set preferences: same language, similar age, similar field of study, no smoking. Some even let you request a specific roommate. Preferences are matched after the assignment is made, so you usually don\'t get to choose. If you have a conflict, talk to the dorm manager — most universities allow one room change per semester.',
          },
        ],
      },
      {
        id: 'safety-comfort',
        h2: 'Safety, comfort, and what to expect',
        intro: 'Here is what life is actually like in a Chinese university dorm.',
        blocks: [
          {
            type: 'h3',
            text: 'Safety',
            body: 'Most dorms have 24/7 security guards at the entrance, requiring a key card or face recognition. Visitors must sign in. CCTV is standard in hallways. Theft is rare. Fire safety: dorm rooms usually have smoke detectors; kitchens have fire extinguishers. The biggest fire risk is cooking in non-kitchen rooms — most dorms prohibit electric stoves, hot plates, and high-power appliances.',
          },
          {
            type: 'h3',
            text: 'Quiet hours and rules',
            body: 'Most dorms enforce quiet hours from 11pm-6am. Music, calls, and conversation should be quiet. Guests of the opposite gender are usually allowed in common areas but not in private rooms (varies by university). Smoking is generally banned inside the building. Alcohol is allowed in rooms but not in common areas. Pets are not allowed.',
          },
          {
            type: 'h3',
            text: 'Laundry and cleaning',
            body: 'Shared laundry rooms on each floor or building: washing machines ¥3-5/load, dryers ¥3-5/load. Some dorms have a 24/7 self-service laundry (no staff, you use an app to pay). Housekeeping cleans common areas weekly. Your own room is your responsibility — many students hire a part-time cleaner for ¥100-200/month.',
          },
          {
            type: 'h3',
            text: 'Internet and Wi-Fi',
            body: 'Free in most dorms. Speed is usually 100-300 Mbps, fast enough for video calls and online classes. The catch: many Western sites (Google, YouTube, Facebook) are blocked, so you need a VPN. Universities often run their own network with separate logins for Chinese and international students.',
          },
        ],
      },
      {
        id: 'homestay',
        h2: 'Homestay and other options',
        intro: 'Dorms and apartments aren\'t the only choice. A few alternatives worth knowing about.',
        blocks: [
          {
            type: 'h3',
            text: 'Homestay with a Chinese family',
            body: 'Some programs arrange homestays, especially for short-term students (1 semester or less). Cost: ¥3,000-8,000/month, including a private room, breakfast and dinner, and laundry. Best for: language students who want maximum immersion. Drawbacks: less privacy, can\'t choose your roommates, family schedules may feel restrictive.',
          },
          {
            type: 'h3',
            text: 'Co-living spaces',
            body: 'Modern co-living brands (Ziroom, Danke, Youtha) target young professionals but accept students. Fully furnished private rooms with shared kitchen, gym, lounge, and events. Cost: ¥2,000-6,000/month for a private room. Best for: students who want social life + privacy + no contract hassle.',
          },
          {
            type: 'h3',
            text: 'Staying with friends or family',
            body: 'If you have a relative or close family friend in China, staying with them is the cheapest option. Be aware: visa registration requires a local address, so you still need to register with the local police station. Universities can sometimes help with this.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do Chinese universities have dorms for international students?',
        a: 'Yes. Every major Chinese university has dedicated dormitory buildings or floors for international students. Rooms are typically furnished (bed, desk, wardrobe, Wi-Fi), with shared or private bathrooms. Most universities guarantee housing for the first year. After that, you can choose to stay in the dorm or move off-campus.',
      },
      {
        q: 'How much does a university dorm cost in China?',
        a: 'On-campus dorms cost $50-250/month. Shared rooms (2-3 people) run $50-100, single rooms $80-200, and university-owned studio apartments $200-450. Utilities (electricity, water, Wi-Fi) are usually included or cost ¥10-50/month extra. Off-campus apartments cost $250-800/month for a 1-bedroom, plus utilities and a 1-month deposit.',
      },
      {
        q: 'Can international students live off-campus in China?',
        a: 'Yes. After year 1, most international students can choose to live off-campus. You\'ll need a Chinese rental contract (sign in Chinese, get a Chinese-speaking friend to help), a local police station registration, and your university\'s international office to update your residence permit. Expect 1-2 months deposit + 1 month rent as agency fee.',
      },
      {
        q: 'What is included in a Chinese university dorm?',
        a: 'A typical dorm includes: bed (single), desk, chair, wardrobe, bookshelves, Wi-Fi, electricity (sometimes metered), water (free or cheap), shared or private bathroom, shared laundry room, 24/7 security. You need to bring or buy: bedding (sheets, duvet, pillow — ¥200-500 on Taobao), towels, toiletries, and small kitchenware if you want to cook.',
      },
      {
        q: 'How do I apply for a university dorm in China?',
        a: 'After accepting admission, most universities send a housing application link within 1-2 weeks. Fill in the form (room type, roommate preferences, medical needs), pay the deposit (¥500-3,000), and wait for your assignment (usually August for September intake). Apply as soon as you accept — popular universities fill up by July.',
      },
      {
        q: 'Can I choose my dorm roommate?',
        a: 'Most universities let you set preferences (language, age, field, smoking, sleeping schedule) but don\'t let you pick a specific roommate. A few let you request a specific person if you both apply. If you have a conflict after moving in, talk to the dorm manager — most allow one room change per semester.',
      },
      {
        q: 'Are there rules in Chinese university dorms?',
        a: 'Yes. Most dorms enforce quiet hours (11pm-6am), prohibit cooking in rooms (no electric stoves, hot plates, or high-power appliances), and ban smoking inside the building. Guests of the opposite gender are usually allowed in common areas but not in private rooms. Pets are not allowed. Most dorms have CCTV in hallways and 24/7 security at the entrance.',
      },
      {
        q: 'Is it cheaper to live on-campus or off-campus in China?',
        a: 'On-campus is much cheaper. A shared dorm room costs $50-100/month, while the cheapest off-campus apartment is $250-400/month. Beyond rent, off-campus has higher utility bills, agency fees, and a 1-2 month deposit. The only case where off-campus wins is for seniors and graduate students who need a kitchen or private space.',
      },
    ],
    howToSteps: [
      { name: 'Apply for housing right after admission', text: 'Most universities send a housing application link within 1-2 weeks of acceptance. Fill it in immediately — popular dorms fill by July for September intake.' },
      { name: 'Pay the dorm deposit', text: 'Typically ¥500-3,000 depending on room type. Pay via the university portal, bank transfer, or at the international office.' },
      { name: 'Receive your assignment', text: 'You\'ll get a room number and check-in date in August via the portal or email. The assignment includes building, floor, room, and roommate(s).' },
      { name: 'Buy bedding and supplies', text: 'Order on Taobao for delivery, buy on campus, or use the university\'s "arrival package" (¥300-800 for sheets, duvet, pillow, towel, basic kitchenware).' },
      { name: 'Check in on arrival', text: 'Bring your passport, admission notice, and dorm payment receipt. Universities run a 2-3 day check-in window before orientation.' },
      { name: 'Settle in and meet your floor-mates', text: 'Most dorms organize a welcome event in the first week. Exchange WeChat with your neighbors — they\'ll help you with everything from laundry to food delivery.' },
      { name: 'Plan for year 2 (if needed)', text: 'If you want to move off-campus in year 2, start looking 2-3 months before the end of year 1. WeChat groups and 链家 are your best resources.' },
      { name: 'Register with the local police (off-campus only)', text: 'Within 24 hours of moving into an off-campus apartment, register with the local police station. Your landlord or university can help.' },
    ],
    ctaTitle: 'Need help figuring out where you\'ll live?',
    ctaSubtitle: 'SICA counselors help you apply for the right dorm room, plan your off-campus move, and navigate contracts in Chinese.',
    ctaApplyLabel: 'Get housing help',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      { href: '/guides/study-in-china', label: 'Why study in China', description: 'Top universities, costs, scholarships, student life.' },
      { href: '/guides/cost-of-living', label: 'Cost of living', description: 'Real monthly budgets: housing, food, transport, phone, healthcare.' },
      { href: '/guides/application', label: 'How to apply', description: 'Step-by-step application guide, documents, and timeline.' },
    ],
  },

  zh: {
    slug: 'accommodation',
    eyebrow: '指南 · 住宿',
    title: '中国留学生住宿完全攻略：宿舍、公寓与注意事项',
    description: '国际生住宿指南：校内宿舍、校外公寓、费用、合同、注意事项。',
    subtitle: '宿舍是你在中国一半时间待的地方。下面告诉你怎么选对。',
    stats: [
      { value: '¥360-1,800', label: '校内宿舍月费' },
      { value: '¥1,800-5,800', label: '校外公寓月费' },
      { value: '15-25平米', label: '标准宿舍面积' },
      { value: '70%+', label: '国际生住校比例' },
    ],
    quickAnswer:
      '约70%国际生住校内宿舍。宿舍月费¥360-1,800（单/双人间），含水电、Wi-Fi、基础家具，最易融入校园。校外公寓月费¥1,800-5,800（一线城市一居室），需中文好的帮手。多数大学第一年保证国际生宿舍床位，之后视情况。拿到录取后立即申请——热门大学7月就满。',
    keyTakeaways: [
      '校内宿舍是默认选择（¥360-1,800/月）',
      '校外公寓贵3-5倍但更私密',
      '拿到录取后立即申宿舍',
      '双人间¥360-720；单人间¥580-1,450；公寓¥2,200-5,800',
      '务必签中文合同并逐条读',
      '校外需要押一付三（1月押金+3月租金）',
    ],
    sections: [
      {
        id: 'on-campus-dorms',
        h2: '校内宿舍：默认选择',
        intro: '校内宿舍是多数国际生的选择，尤其是第一年。更便宜、更社交，零中文门槛。',
        blocks: [
          {
            type: 'table',
            caption: '中国重点大学宿舍类型（2026）',
            columns: ['房型', '面积', '月费', '适合人群'],
            rows: [
              ['双人间（2人）', '15-20平米', '¥360-720', '大一新生、社牛、预算紧'],
              ['单人间', '12-18平米', '¥580-1,450', '老生、学者、想要安静'],
              ['三人间', '20-25平米', '¥290-580', '预算紧、朋友多'],
              ['套房（2-4间+共用卫生间）', '40-60平米', '¥1,450-2,900', '情侣、家庭、硕博生'],
              ['大学自有单身公寓', '25-40平米', '¥1,450-3,300', '高年级、想要厨房'],
            ],
          },
          {
            type: 'h3',
            text: '标准宿舍有什么',
            body: '床（一般单人）、书桌+椅、衣柜、书架、Wi-Fi、电（冬季供暖部分高校另算¥10-30/月，夏季空调¥20-50/月）、水（免费或¥10-20/月）、每层或每间共用卫生间、共用洗衣房、公共厨房（部分）、24小时保安。',
          },
          {
            type: 'h3',
            text: '需要带什么',
            body: '床上用品（床单、枕头、被子、床垫套——淘宝买¥200-500，或订学校的"到货包"¥300-800）。洗漱用品和毛巾。电源转换器（中国用A/C/I型，220V）。小厨具（如果要自己做饭）。笔记本和电子产品。书和学习用品。',
          },
        ],
      },
      {
        id: 'off-campus',
        h2: '校外公寓：想要更多空间时',
        intro: '校外住宿适合想要隐私、厨房或和朋友合租的学生。贵3-5倍，要花更多精力。',
        blocks: [
          {
            type: 'h3',
            text: '什么时候考虑校外',
            body: '过完第一年想要厨房。带了家人。想要和朋友合住。宿舍满了（罕见但热门大学有）。想要离特定工作或研究地近。',
          },
          {
            type: 'h3',
            text: '在哪找校外房',
            body: 'App：链家（最大中介，部分城市有英文经纪人）、贝壳（链家App，房源类似）、自如（Ziroom，装修好的整租公寓，略贵，有英文App）、58同城（最大分类信息，注意骗局）、蛋壳（合租品牌，2021年有过财务问题，订前查现状）。微信群：你大学的国际生群经常发房源。',
          },
          {
            type: 'h3',
            text: '中国租房合同：5个要看清的地方',
            body: '1) 押一付三（1月押金+3月租金）是标准。2) 押二付一（一线城市常见）。3) 中介费1月租金（无中介减半）。4) 合同要中英双语（要求提供）。5) 退租条款——多数要求提前30天通知，提前退租罚1-2月押金。',
          },
          {
            type: 'h3',
            text: '房租外的费用',
            body: '水电燃气网：¥200-500/月合计。物业费：¥1-3/平米/月=¥50-300（一居室）。宽带安装：¥100-300一次性。家具（如空房）：¥2,000-10,000布置。清洁服务（可选）：¥100-200/月。',
          },
        ],
      },
      {
        id: 'application',
        h2: '怎么申请校内宿舍',
        intro: '宿舍申请通常是入学流程的一部分。错过截止日可能上候补。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**接受录取**——多数学校录取后1-2周内会发宿舍申请链接',
              '**填住宿表**——选房型（单/双/三）、室友偏好（性别、吸烟、作息）、医疗需求',
              '**缴宿舍定金**——一般一学期或一年，¥500-3,000视房型',
              '**收宿舍分配**——一般在8月（9月入学），通过学校系统或邮件',
              '**到校入住**——带护照、录取通知书、缴费收据。学校在orientation前2-3天开放入住',
              '**买床上用品和日用品**——校内或网购提前送达',
            ],
          },
          {
            type: 'h3',
            text: '室友匹配',
            body: '多数学校让你设偏好：同语言、相近年龄、相近专业、不吸烟等。分配后才知道具体室友。如果你有冲突，找宿舍管理员——多数允许每学期调换一次。',
          },
        ],
      },
      {
        id: 'safety-comfort',
        h2: '安全、舒适和实际生活',
        intro: '下面是住中国大学宿舍的真实日常。',
        blocks: [
          {
            type: 'h3',
            text: '安全',
            body: '多数宿舍有24小时门卫（刷卡或人脸识别），访客要登记。楼道有CCTV。盗窃罕见。消防：房间有烟感器，厨房有灭火器。最大火灾隐患是房间内做饭——多数宿舍禁用电磁炉、电热壶、高功率电器。',
          },
          {
            type: 'h3',
            text: '安静时间和规则',
            body: '多数宿舍23:00-6:00为安静时间。音乐、电话、谈话要小声。异性访客一般允许在公共区但不允许进私人房间（视学校而定）。楼内禁烟。房间内允许饮酒但公共区不允许。不允许养宠物。',
          },
          {
            type: 'h3',
            text: '洗衣和清洁',
            body: '每层或每栋楼有共用洗衣房：洗衣机¥3-5/次，烘干机¥3-5/次。部分宿舍有24小时自助洗衣（无工作人员，App付款）。公共区每周清洁。房间自己负责——很多学生雇兼职清洁工¥100-200/月。',
          },
          {
            type: 'h3',
            text: '网络和Wi-Fi',
            body: '多数宿舍免费。速度100-300Mbps，视频课和视频通话够用。问题：很多西方网站（Google、YouTube、Facebook）被封，要VPN。高校常为国际生另开独立网络。',
          },
        ],
      },
      {
        id: 'homestay',
        h2: '寄宿家庭和其他选择',
        intro: '宿舍和公寓不是唯一选择。',
        blocks: [
          {
            type: 'h3',
            text: '寄宿中国家庭',
            body: '部分项目安排寄宿家庭，尤其是短期生（1学期或以下）。费用：¥3,000-8,000/月含单间+早晚两餐+洗衣。适合：想最大程度沉浸语言的学生。缺点：隐私少、不能选室友、家庭作息可能感觉受限。',
          },
          {
            type: 'h3',
            text: '合租空间',
            body: '现代合租品牌（自如、蛋壳、Youtha）面向年轻白领也接受学生。精装独立房间+共享厨房、健身房、休息室、活动。费用：独立房间¥2,000-6,000/月。适合：要社交+隐私+免签合同麻烦的学生。',
          },
          {
            type: 'h3',
            text: '亲戚朋友家',
            body: '如果你在中国有亲戚或密友，住在他们家最便宜。注意：签证注册需要本地地址，仍要去派出所登记。学校可以协助。',
          },
        ],
      },
    ],
    faqs: [
      { q: '中国大学有国际生宿舍吗？', a: '有。每所重点中国大学都有专门的国际生宿舍楼或楼层。房间配家具（床、书桌、衣柜、Wi-Fi），公用或独立卫浴。多数大学第一年保证住宿。之后可选择继续住或转校外。' },
      { q: '中国大学宿舍多少钱？', a: '校内宿舍¥360-1,800/月。双人间¥360-720、单人间¥580-1,450、大学自有单身公寓¥1,450-3,300。水电网一般包含或另付¥10-50/月。校外公寓¥1,800-5,800/月（一居室），另加水电和1月押金。' },
      { q: '国际生能在校外住吗？', a: '可以。第一年后多数国际生可以选择校外。要签中文合同（签中文的，找中文好的朋友帮忙），派出所登记，找学校国际处更新居留许可。预期1-2月押金+1月租金中介费。' },
      { q: '中国大学宿舍含什么？', a: '标准宿舍含：床（单人）、书桌、椅、衣柜、书架、Wi-Fi、电（部分独立计费）、水（免费或便宜）、共用或独立卫浴、共用洗衣房、24小时保安。需要自购或自带：床上用品（淘宝¥200-500）、毛巾、洗漱用品、小厨具。' },
      { q: '怎么申请中国大学宿舍？', a: '录取后，多数学校1-2周内会发住宿申请链接。立即填表（房型、室友偏好、医疗需求），缴定金（¥500-3,000），等分配（8月，9月入学）。拿到录取马上申——热门学校7月满。' },
      { q: '能选室友吗？', a: '多数学校让你设偏好（语言、年龄、专业、吸烟、作息）但不能指定室友。少数允许互选（双方都申）。如冲突找宿管——多数允许每学期调换一次。' },
      { q: '中国大学宿舍有什么规定？', a: '有。多数宿舍执行安静时间（23:00-6:00），禁止房间内做饭（禁用电磁炉、电热壶、高功率电器），楼内禁烟。异性访客一般允许在公共区不允许进私人房间。不允许养宠物。楼道有CCTV、入口24小时保安。' },
      { q: '住校内还是校外便宜？', a: '校内便宜得多。共用宿舍¥360-720/月，最便宜校外公寓¥1,800-3,000/月。除房租外，校外水电、中介费、押金都更高。校外唯一的优势是：高年级和研究生需要厨房或私密空间。' },
    ],
    howToSteps: [
      { name: '录取后立即申请宿舍', text: '多数学校录取后1-2周内发住宿申请链接。立即填表——热门宿舍7月就满，9月入学。' },
      { name: '缴宿舍定金', text: '一般¥500-3,000视房型。通过学校系统、银行转账或国际处缴。' },
      { name: '收宿舍分配', text: '8月通过系统或邮件收房间号、报到日。分配含楼、层、房间、室友。' },
      { name: '买床上用品和日用品', text: '淘宝网购配送到校，或买学校"到货包"（¥300-800含床单、被子、枕头、毛巾、基础厨具）。' },
      { name: '到校入住', text: '带护照、录取通知书、宿舍缴费收据。学校在orientation前2-3天开放入住。' },
      { name: '安顿+认识邻居', text: '多数宿舍第一周有迎新活动。和邻居加微信——他们能帮你从洗衣到外卖一切。' },
      { name: '第二年规划（如果需要）', text: '如想第二年转校外，提前2-3个月开始找。微信群和链家是首选。' },
      { name: '校外要派出所登记', text: '搬入校外24小时内去当地派出所登记。房东或学校可以帮忙。' },
    ],
    ctaTitle: '还在想住哪？',
    ctaSubtitle: 'SICA顾问帮你申合适的宿舍、规划校外搬家、协助中文合同。',
    ctaApplyLabel: '申请住宿协助',
    ctaContactLabel: '联系顾问',
    related: [
      { href: '/guides/study-in-china', label: '为什么来华留学', description: '顶尖大学、学费、奖学金、校园生活。' },
      { href: '/guides/cost-of-living', label: '生活费', description: '月度真实预算：住房、餐饮、交通、手机、医疗。' },
      { href: '/guides/application', label: '如何申请', description: '申请流程、材料、时间线分步指南。' },
    ],
  },
};
