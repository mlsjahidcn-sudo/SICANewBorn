import type { LocalizedGuide } from './types';

/**
 * "China mobile internet for international students" — Phase 121,
 * Batch 1, article #3 of the new study-in-china expansion cluster.
 * Target queries: "china esim international student",
 * "china vpn student", "china mobile data tourist",
 * "china phone number for foreign students".
 *
 * Static content. Carrier plans, app-availability details, and
 * regulatory facts (the firewall's existence, the legal
 * distinction between licensed VPN and unauthorized tunneling) are
 * general-knowledge; specific plan prices and roaming surcharges
 * are flagged as planning approximations.
 */
export const chinaMobileInternetGuide: LocalizedGuide = {
  en: {
    slug: 'china-mobile-internet-for-international-students',
    eyebrow: 'GUIDE · MOBILE INTERNET',
    title: 'China Mobile Internet for International Students — eSIM, Real Apps, and the Practical Workarounds',
    description:
      'Pre-arrival setup for the Chinese phone, data plans that work, the apps that fail without a Chinese number, and the licensed-VPN discussion every student eventually has — practical, not political.',
    subtitle:
      'A Chinese phone number is the hard prerequisite for almost everything else in this cluster: bank account, Alipay/WeChat Pay, university portals, food delivery, campus Wi-Fi authentication. This guide covers the pre-arrival setup (eSIM vs physical SIM, data plans, the first-week activation), the apps that fail without a Chinese number, and the practical — not theoretical — discussion of VPNs: which kinds are legal, where they are needed, and how students actually use them for academic work without taking on unnecessary risk.',
    stats: [
      { value: 'eSIM or SIM', label: 'Activation on landing' },
      { value: '~¥100–¥300/mo', label: 'Common student data plans' },
      { value: 'Few apps', label: 'Need a Chinese phone' },
      { value: 'Use legal', label: 'VPN paths only' },
    ],
    quickAnswer:
      'Get a Chinese phone number within the first 48 hours — at the airport, a carrier store, or a university partner kiosk during orientation. eSIM works on most modern phones (iPhone XS and later, most Android flagships from 2019+); physical SIM is universal. Plan pricing is ~¥100–¥300 per month for student data tiers from China Mobile, China Unicom, or China Telecom. After activation: most campus apps, food delivery, ride-hailing, university SSO, and payment apps all require the number. The "internet access" question is about content apps (Google, WhatsApp, Instagram, YouTube, Wikipedia, many academic resources) — they require either a licensed business VPN or are entirely blocked. Students handle academic access through their university library/IT department and licensed enterprise tools, not consumer tunneling services. Keep this rule: never use an unauthorized VPN for anything you would not defend in writing.',
    keyTakeaways: [
      'Get a Chinese number within 48 hours — at the airport, carrier store, or university partner kiosk during orientation',
      'eSIM works on most modern phones; physical SIM is universal; both are valid choices',
      'Plan pricing is ~¥100–¥300/month for student tiers across China Mobile, China Unicom, China Telecom',
      'Without a Chinese number: most campus apps, payment apps, ride-hailing, and food delivery fail',
      'The "VPN" question is about content apps (Google/WhatsApp/YouTube/etc.) — handle academic access through the university, not consumer tunneling',
      'Never use an unauthorized VPN — it is a regulatory offense, and the legal path exists for the genuine academic needs that come up',
    ],
    sections: [
      {
        id: 'getting-number',
        h2: 'Getting a Chinese number — airport, store, or orientation',
        intro:
          'You need a Chinese number before the bank, the residence permit, or the wallet. The order of activation matters.',
        blocks: [
          {
            type: 'table',
            caption: 'Where to get a Chinese SIM on arrival',
            columns: ['Path', 'Pros', 'Cons'],
            rows: [
              ['Airport carrier kiosks (Beijing/Shanghai/Guangzhou)', 'Open during flight hours; passport activation; English signage at major airports', 'Limited plan selection; often pricier than downtown'],
              ['Carrier stores in city center', 'Full plan catalog; same passport activation; staff familiar with student needs', 'Need to navigate to a store; require address proof or residence form for some plans'],
              ['University partner kiosk during orientation', 'Designed for international students; minimal bureaucracy; bundled SIM with account and residence registration', 'Only available during orientation week (typically one week per intake)'],
              ['Online eSIM (Airalo, Nomad, etc., before arrival)', 'Activate on landing without an address; good for the first 30 days', 'Limited Chinese-number provisioning (usually Hong Kong/Macau numbers, not mainland); poor for Chinese app onboarding'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Airport kiosk for speed** — most international students activate on landing day; the SIM is working before you leave the airport',
              '**Orientation week for the best plan** — most universities arrange a partner-kiosk with student-tier plans and sometimes subsidies; check your arrival email',
              '**Documents needed everywhere** — passport + Chinese visa + arrival stamp; some plans also require the temporary residence registration',
              '**eSIM caveat** — international eSIMs (Airalo, Nomad) work for data but usually issue HK/Macau numbers, which most Chinese apps reject; treat them as a 30-day bridge, not a permanent solution',
              '**Real plan timing** — pick a Chinese number BEFORE the bank visit; the bank will refuse the account without SMS verification on a Chinese phone',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The single biggest mistake new students make: arriving in China with only an international roaming SIM. Everything that follows — bank account, residence permit, university SSO, food delivery — assumes a Chinese number. Get the SIM within 48 hours of landing.',
          },
        ],
      },
      {
        id: 'plans',
        h2: 'Data plans — what the carriers actually offer',
        intro:
          'Three major carriers, similar student tiers, similar pricing. Pick by coverage at your campus and city.',
        blocks: [
          {
            type: 'table',
            caption: 'Common student data plans (planning approximation)',
            columns: ['Plan tier', 'Data/month', 'Voice/SMS', 'Approx price'],
            rows: [
              ['Light', '5–10 GB', '100–200 minutes / 100 SMS', '¥60–¥100/month'],
              ['Standard (most students)', '20–30 GB', '200+ minutes / unlimited SMS', '¥100–¥200/month'],
              ['Heavy / laptop tethering', '60–100 GB or unlimited', '500+ minutes', '¥200–¥300/month'],
              ['Campus-wide Wi-Fi only', '0–3 GB', 'Minimal', '¥30–¥50/month'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Coverage matters more than data volume** — China Mobile has the best rural and high-speed-rail coverage; China Unicom leads in northern cities; China Telecom is competitive in southern cities; check with your campus IT for the recommendation',
              '**Most universities provide campus Wi-Fi** — you may not need 30 GB if your dorm, classroom, and library have reliable Wi-Fi; a 10 GB plan covers commuting and weekends',
              '**Data-only second SIM is cheap** — for international travel home or backup, a data-only eSIM is typically ¥50–¥100 for 5 GB lasting 30 days',
              '**Prepaid vs postpaid** — postpaid (billed monthly to your Chinese bank account) is cheaper but requires the account to exist first; prepaid works on day 1',
              '**Family plans** — once you have your own line, consider adding parents for occasional contact; rates are negligible for Chinese numbers',
            ],
          },
        ],
      },
      {
        id: 'apps',
        h2: 'The apps that need a Chinese number (and what to do)',
        intro:
          'A surprising number of daily services fail without one. Here is the practical workaround for each.',
        blocks: [
          {
            type: 'table',
            caption: 'App availability by phone number status',
            columns: ['App / service', 'Without CN number', 'With CN number'],
            rows: [
              ['Alipay / WeChat Pay wallet activation', 'Foreign card only — Tour Pass / limited support', 'Full function + student verification'],
              ['Didi / ride-hailing', 'Works with foreign cards but not all drivers accept; some promo regions blocked', 'Full function + China-region discounts'],
              ['Meituan / Eleme (food delivery)', 'Limited menus; some restaurants require CN phone', 'Full menus + campus restaurant integration'],
              ['JD.com / Taobao / Pinduoduo (e-commerce)', 'Most orders work; refunds / customer service require CN phone', 'Full function + student discounts'],
              ['12306 (train tickets)', 'Foreign passport supported; some verification needs CN phone', 'Full function + student rail discounts'],
              ['University SSO / campus app', 'Usually requires CN phone for SMS 2FA', 'Full function'],
              ['WeChat (messaging)', 'Foreign number OK; some features (payment, mini-programs) need CN phone', 'Full function'],
              ['WhatsApp / Telegram / Google Meet', 'Blocked without licensed VPN; not for daily casual use', 'Blocked without licensed VPN — same as left column'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The pivot moment is WeChat Pay activation. Once your Chinese debit card is bound to a Chinese-issued WeChat Pay wallet, the entire daily-payment stack works — dorm payments, food cards, transport, most merchants. The number is the unlock.',
          },
        ],
      },
      {
        id: 'vpn',
        h2: 'The VPN question — practical, not political',
        intro:
          'Most students have the conversation once: how do I get to Google, WhatsApp, Instagram, Wikipedia? Here is the responsible answer.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**The regulatory situation** — China restricts unauthorized VPN services; licensed enterprise VPNs for cross-border business are legal; consumer tunneling services are not.',
              '**What that means for you** — using a consumer VPN "to watch YouTube" is an offense in China\'s regulatory framework. Treat it like any other law: do not plan around breaking it.',
              '**The legal path for academic needs** — your university library or IT department can issue licensed enterprise VPN credentials for accessing international academic databases (JSTOR, ProQuest, specific journal sites, Google Scholar). This is the path.',
              '**What is blocked vs not blocked** — many services you need (Google Docs via university SSO, GitHub, Stack Overflow, Zoom/Teams with a university invite) often work through university-provided enterprise routes; check with IT before assuming you need a personal VPN.',
              '**Stay informed** — regulations and enforcement priorities change; follow your university\'s IT communications and the official news cycle, not Reddit threads.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'This guide will not tell you how to circumvent Chinese internet regulations. The legal path exists for the academic and business needs that come up — use it. Students who take the regulatory question seriously have a much better China experience than those who do not.',
          },
        ],
      },
      {
        id: 'campus-wifi',
        h2: 'Campus Wi-Fi and the university network',
        intro:
          'Most Chinese universities provide campus-wide Wi-Fi — but with a Chinese-phone authentication requirement.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Authentication** — campus Wi-Fi usually requires your student ID + Chinese phone number for SMS verification; foreign phones do not receive the verification SMS',
              '**Speed and coverage** — most university campuses have excellent Wi-Fi in dorms, classrooms, and libraries; speeds are usually adequate for video and code',
              '**Off-campus alternatives** — cafes, malls, and most restaurants have free Wi-Fi; international hotel chains have stable Wi-Fi for short stays',
              '**VPN through the university** — academic-resource access typically uses the university\'s enterprise VPN or proxy; check IT for the setup',
              '**Personal hotspot** — your phone\'s data plan is the reliable fallback; plan accordingly if your campus Wi-Fi fails',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How do I get a Chinese phone number as an international student?',
        a: 'At the airport on landing day, at a carrier store in the city, or at a university partner kiosk during orientation. Bring your passport + Chinese visa + arrival stamp; some plans also require the temporary residence registration. eSIM works on most modern phones; physical SIM is universal.',
      },
      {
        q: 'Which carrier should I pick: China Mobile, China Unicom, or China Telecom?',
        a: 'Pick by campus coverage, not price — China Mobile has the best rural/HSR coverage, China Unicom is strong in northern cities, China Telecom is competitive in southern cities. Most plans are ¥100–¥300/month for student tiers. Check with your university IT for the recommendation.',
      },
      {
        q: 'Can I use eSIM like Airalo or Nomad in China?',
        a: 'International eSIMs work for data but usually issue HK/Macau numbers, which most Chinese apps (Alipay, WeChat Pay, university SSO) reject. Treat them as a 30-day bridge for your first weeks, then move to a real Chinese SIM.',
      },
      {
        q: 'Do I really need a Chinese phone number?',
        a: 'Yes — for the bank account (SMS verification), Alipay/WeChat Pay full function, university SSO, food delivery, ride-hailing, e-commerce, and most daily services. Get one within 48 hours of arrival.',
      },
      {
        q: 'Is using a VPN in China legal?',
        a: 'Licensed enterprise VPNs for cross-border business are legal; consumer tunneling services are not. Use your university\'s licensed VPN for academic resources, and do not plan around circumventing Chinese internet regulations.',
      },
      {
        q: 'How can I access Google, Wikipedia, or academic journals from China?',
        a: 'Through your university\'s licensed enterprise VPN or library proxy — ask the international student office or IT department. Many academic databases (JSTOR, ProQuest, Google Scholar) have university-arranged access that does not require a personal VPN.',
      },
      {
        q: 'Will WhatsApp / Instagram / YouTube work in China?',
        a: 'No — these services are blocked without a licensed enterprise VPN, and using unauthorized tunneling is a regulatory issue. Plan accordingly; communicate with family and friends using the services that work in China (WeChat, the international version of which functions normally for messaging).',
      },
      {
        q: 'How much data do I need per month?',
        a: 'Most students use 20–30 GB/month with active campus Wi-Fi supplementing; heavy users who tether to laptops or stream regularly may need 60–100 GB. Student plan pricing is ¥100–¥200/month for the standard tier.',
      },
      {
        q: 'Is Chinese campus Wi-Fi reliable?',
        a: 'Generally yes — Chinese universities have invested heavily in campus networks, with reliable Wi-Fi in dorms, classrooms, and libraries. The main friction is the Chinese phone number required for SMS authentication.',
      },
      {
        q: 'Can I keep my home country SIM active while in China?',
        a: 'Yes — most carriers offer international roaming, but the data costs are prohibitive for regular use. Use your home SIM for the occasional call home; rely on your Chinese SIM for daily data. A data-only international eSIM is a cheaper backup for short trips.',
      },
    ],
    howToSteps: [
      {
        name: 'Activate a Chinese SIM within 48 hours of landing',
        text: 'At the airport carrier kiosk, in a city store, or at the university partner kiosk during orientation. Bring passport + Chinese visa + arrival stamp; some plans require the temporary residence registration.',
      },
      {
        name: 'Pick a plan by campus coverage, not price',
        text: 'Ask university IT which carrier has the strongest signal on campus; check China Mobile for rural/HSR coverage, China Unicom for northern cities, China Telecom for southern cities. Standard student tier is ¥100–¥200/month.',
      },
      {
        name: 'Activate Alipay and WeChat Pay with the new number',
        text: 'Once the SIM is active, complete student verification on both apps. This unlocks the entire daily-payment stack — dorm, food, transport, most merchants — through your bound Chinese debit card.',
      },
      {
        name: 'Authenticate on campus Wi-Fi with your Chinese number',
        text: 'University Wi-Fi requires SMS verification on a Chinese phone. Once authenticated, campus Wi-Fi covers most daily data and saves your mobile plan for commuting and weekends.',
      },
      {
        name: 'Use the university\'s licensed VPN for academic resources',
        text: 'For JSTOR, ProQuest, Google Scholar, and other academic databases, use the licensed enterprise VPN or library proxy your university provides. Do not use unauthorized consumer tunneling services.',
      },
      {
        name: 'Save your home country SIM for emergencies and short calls',
        text: 'International roaming is expensive; use the home SIM only for occasional calls home. A data-only international eSIM (Airalo, Nomad) is a cheaper backup for short trips or as a first-week bridge.',
      },
    ],
    ctaTitle: 'Need a pre-arrival connectivity plan?',
    ctaSubtitle:
      'SICA counselors review your university\'s recommended carrier and orientation-week SIM activation, plus the campus-Wi-Fi and academic-VPN setup. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/open-chinese-bank-account',
        label: 'Opening a Chinese bank account',
        description: 'The bank-account deep dive that requires a Chinese phone number.',
      },
      {
        href: '/international-money-transfer-china',
        label: 'Sending money to and from China',
        description: 'The Alipay and WeChat Pay setup for foreigners that depends on a Chinese SIM.',
      },
      {
        href: '/first-week-in-china-survival-guide',
        label: 'First week in China survival guide',
        description: 'The complete pre-arrival through first-7-days checklist including the SIM.',
      },
    ],
  },
  zh: {
    slug: 'china-mobile-internet-for-international-students',
    eyebrow: '指南 · 手机上网',
    title: '国际学生手机上网——eSIM、能用的 App 与实用变通方案',
    description:
      '到校前的中国手机设置、能用的流量套餐、没有中国号就废的 App，以及每个学生最后都会碰到的 VPN 实务讨论——实操而非政治。',
    subtitle:
      '中国手机号是本簇几乎所有事情的前提：银行账户、支付宝/微信支付、大学门户、外卖、校园 Wi-Fi 认证。本指南覆盖到校前设置（eSIM 与实体 SIM、流量套餐、第一周激活）、没有中国号就废的 App，以及 VPN 的实务讨论——合法可用的路径有哪些。',
    stats: [
      { value: 'eSIM 或 SIM', label: '落地即激活' },
      { value: '约 ¥100-300/月', label: '常见学生档流量套餐' },
      { value: '少数 App', label: '必须有中国手机号' },
      { value: '走合法', label: '只用合规 VPN 路径' },
    ],
    quickAnswer:
      '落地 48 小时内拿到中国手机号——机场、运营商门店或迎新周合作伙伴柜台。现代手机大多支持 eSIM（iPhone XS 及以后、2019 年后多数 Android 旗舰）；实体 SIM 通用。学生档流量套餐约 ¥100-300/月，覆盖中国移动、中国联通、中国电信。激活后：校园 App、外卖、打车、大学 SSO、支付 App 都需要这个号。「上网」问题指内容 App（Google、WhatsApp、Instagram、YouTube、Wikipedia、多数学术资源）——需要走合规商业 VPN，或直接被屏蔽。学生通过大学图书馆/IT 部门与合规企业工具处理学术访问，不要使用消费级隧道服务。规矩：不用违规 VPN 做你自己不敢落纸的事。',
    keyTakeaways: [
      '落地 48 小时内拿到中国号——机场、运营商门店或迎新周合作伙伴柜台',
      'eSIM 适用于多数现代手机；实体 SIM 通用；任选其一',
      '学生档流量约 ¥100-300/月，三大运营商都有',
      '没中国号：多数校园 App、支付 App、打车、外卖都废',
      '「VPN」问题是内容 App（Google/WhatsApp/YouTube 等）——学术访问走大学，不要走消费级隧道',
      '不用违规 VPN——是监管违规；真有学术需求有合规路径',
    ],
    sections: [
      {
        id: 'getting-number',
        h2: '拿中国号——机场、门店或迎新周',
        intro:
          '你需要银行、居留许可、钱包之前就有中国号。激活的顺序很关键。',
        blocks: [
          {
            type: 'table',
            caption: '到校后哪里拿中国 SIM',
            columns: ['路径', '优点', '缺点'],
            rows: [
              ['机场运营商柜台（北京/上海/广州）', '航班时段营业；护照激活；大机场有英文标识', '可选套餐有限；通常比市区贵'],
              ['市区运营商门店', '套餐齐全；同样的护照激活；员工熟悉学生需求', '需要导航到门店；部分套餐要求地址证明或临时住宿登记'],
              ['迎新周大学合作柜台', '为国际学生设计；流程极简；SIM 与账户、住宿登记打包', '只在迎新周开放（通常每批一周）'],
              ['到校前线上 eSIM（Airalo、Nomad 等）', '落地即激活无需地址；适合头 30 天', '提供的是港/澳号，多数中国 App 拒绝；不是永久方案'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**机场柜台最快**——多数国际学生落地当天就激活；离开机场前 SIM 已工作',
              '**迎新周套餐最划算**——多数大学安排合作伙伴柜台，提供学生档套餐还有补贴；查你的到达邮件',
              '**到处都需要的文件**——护照 + 中国签证 + 入境章；部分套餐还要求临时住宿登记表',
              '**eSIM 警示**——国际 eSIM（Airalo、Nomad）能上网但提供港/澳号，多数中国 App 拒绝；视为 30 天桥梁，不是永久方案',
              '**真实套餐的时机**——去银行前先选好中国号；银行没有中国手机号短信验证会直接拒绝',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '新生最常犯的一个错误：只带国际漫游 SIM 到中国。后面所有事——银行账户、居留许可、大学 SSO、外卖——都假设你有中国号。落地 48 小时内必须办。',
          },
        ],
      },
      {
        id: 'plans',
        h2: '流量套餐——三大运营商实际提供的',
        intro:
          '三家大运营商、学生档套餐相近、价格相近。按校园与城市覆盖选。',
        blocks: [
          {
            type: 'table',
            caption: '常见学生流量套餐（规划近似值）',
            columns: ['套餐', '月流量', '通话/短信', '约价'],
            rows: [
              ['轻量', '5-10 GB', '100-200 分钟 / 100 短信', '¥60-100/月'],
              ['标准（多数学生）', '20-30 GB', '200+ 分钟 / 短信不限', '¥100-200/月'],
              ['重度 / 笔记本 tethering', '60-100 GB 或不限', '500+ 分钟', '¥200-300/月'],
              ['仅靠校园 Wi-Fi', '0-3 GB', '极少', '¥30-50/月'],
            ],
          },
            {
              type: 'ul',
            items: [
              '**覆盖比流量重要**——中国移动在乡村与高铁覆盖最好；中国联通在北方城市领先；中国电信在南方城市有竞争力；问问你们校园 IT 推荐哪家',
              '**多数大学提供校园 Wi-Fi**——宿舍、教室、图书馆 Wi-Fi 稳定的话，10 GB 套餐就够通勤与周末用',
              '**纯流量副卡便宜**——为回国或备用，国际数据 eSIM 通常 ¥50-100/30 天 5 GB',
              '**预付费 vs 后付费**——后付费（按月从中国银行账户扣）便宜但要先有账户；预付费第一天就能用',
              '**亲情号**——自己开号后考虑加父母做偶尔联络；中国号码之间费率极低',
            ],
          },
        ],
      },
      {
        id: 'apps',
        h2: '必须有中国号的 App（与解法）',
        intro:
          '多得惊人的日常服务没中国号就废。逐项给实务解法。',
        blocks: [
          {
            type: 'table',
            caption: '按手机号状态看 App 可用性',
            columns: ['App / 服务', '无中国号', '有中国号'],
            rows: [
              ['支付宝/微信支付钱包激活', '仅外卡——Tour Pass/有限支持', '全功能 + 学生认证'],
              ['滴滴/打车', '外卡可用但司机可能拒接；部分优惠区被屏蔽', '全功能 + 中国区优惠'],
              ['美团/饿了么（外卖）', '菜单受限；部分商家要求中国号', '全菜单 + 校园食堂集成'],
              ['京东/淘宝/拼多多（电商）', '多数订单可用；退款/客服要求中国号', '全功能 + 学生折扣'],
              ['12306（火车票）', '支持外籍护照；部分验证要中国号', '全功能 + 学生火车票折扣'],
              ['大学 SSO / 校园 App', '通常需要中国号短信 2FA', '全功能'],
              ['微信（通讯）', '外籍号可用；部分功能（支付、小程序）要中国号', '全功能'],
              ['WhatsApp / Telegram / Google Meet', '无合规 VPN 就被屏蔽；非日常随便用', '无合规 VPN 同左列——被屏蔽'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '转折点是微信支付激活。一旦你的中国借记卡绑到中国发的微信支付钱包，整个日常支付栈就通了：宿舍、食堂、交通、多数商家。手机号是解锁。',
          },
        ],
      },
      {
        id: 'vpn',
        h2: 'VPN 问题——实务而非政治',
        intro:
          '多数学生最后都有一次这样的对话：怎么访问 Google、WhatsApp、Instagram、Wikipedia？这里是负责任的回答。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**监管现状**——中国限制未授权 VPN 服务；用于跨境商业的合规企业 VPN 是合法的；消费级隧道服务不合法',
              '**对你的含义**——用消费 VPN 「看 YouTube」在中国监管框架内是违规。把它当作任何其他法律：不打算违反就别做',
              '**学术需求的合规路径**——大学图书馆或 IT 部门可以发合规企业 VPN 凭据，访问国际学术数据库（JSTOR、ProQuest、特定期刊、Google Scholar）。这是合规路径',
              '**屏蔽与否的实情**——多数你真正需要的服务（通过大学 SSO 的 Google Docs、GitHub、Stack Overflow、有大学邀请的 Zoom/Teams）通常通过大学企业路由即可用；先问 IT，别假设需要个人 VPN',
              '**保持更新**——监管和执法重点会变；跟大学 IT 通告与官方新闻周期走，不跟 Reddit 走',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '本指南不会教你怎么绕过中国互联网法规。合规路径存在，能满足出现的学术与商业需求——用吧。把监管问题当回事的学生，中国体验远好过不当回事的。',
          },
        ],
      },
      {
        id: 'campus-wifi',
        h2: '校园 Wi-Fi 与大学网络',
        intro:
          '多数中国大学提供覆盖校园的 Wi-Fi——但需要中国手机号做认证。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**认证**——校园 Wi-Fi 通常需要学号 + 中国手机号短信验证；外籍手机收不到验证码短信',
              '**速度与覆盖**——多数大学校园宿舍、教室、图书馆 Wi-Fi 都很好；速度对视频与编程足够',
              '**校外替代**——咖啡馆、商场、多数餐厅都有免费 Wi-Fi；国际连锁酒店提供稳定 Wi-Fi 用于短期停留',
              '**通过大学的 VPN**——学术资源访问通常走大学企业 VPN 或代理；问 IT 怎么设置',
              '**个人热点**——手机套餐是最可靠的后备；校园 Wi-Fi 不行时按此规划',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '国际学生怎么拿中国手机号？',
        a: '落地当天机场、城里运营商门店、或迎新周大学合作柜台。带护照 + 中国签证 + 入境章；部分套餐还要求临时住宿登记表。eSIM 适用于多数现代手机；实体 SIM 通用。',
      },
      {
        q: '选哪家运营商：中国移动、联通还是电信？',
        a: '按校园覆盖选，不是按价格——中国移动在乡村/高铁覆盖最好，中国联通在北方城市强，中国电信在南方城市有竞争力。多数学生档套餐 ¥100-300/月。问问你们校园 IT 推荐哪家。',
      },
      {
        q: 'Airalo、Nomad 这类 eSIM 在中国能用吗？',
        a: '国际 eSIM 能上网但提供港/澳号，多数中国 App（支付宝、微信支付、大学 SSO）拒绝。视为头几周的 30 天桥梁，再换成真正的中国 SIM。',
      },
      {
        q: '我真的需要中国手机号吗？',
        a: '要——银行账户（短信验证）、支付宝/微信支付全功能、大学 SSO、外卖、打车、电商、多数日常服务。落地 48 小时内办。',
      },
      {
        q: '在中国用 VPN 合法吗？',
        a: '用于跨境的合规企业 VPN 合法；消费级隧道服务不合法。学术资源用大学的合规 VPN，不要计划绕开中国互联网法规。',
      },
      {
        q: '在中国怎么访问 Google、Wikipedia 或学术期刊？',
        a: '通过大学合规企业 VPN 或图书馆代理——问国际学生办或 IT。多数学术数据库（JSTOR、ProQuest、Google Scholar）都有大学安排的访问，不需要个人 VPN。',
      },
      {
        q: 'WhatsApp / Instagram / YouTube 在中国能用吗？',
        a: '不能——这些服务无合规企业 VPN 就被屏蔽，用未授权隧道是监管问题。提前规划；与家人朋友用在中国能用的服务（微信，国际版功能正常）沟通。',
      },
      {
        q: '每月需要多少流量？',
        a: '多数学生用 20-30 GB/月，配合校园 Wi-Fi；笔记本 tethering 或常看视频的重度用户需要 60-100 GB。学生档标准档 ¥100-200/月。',
      },
      {
        q: '中国校园 Wi-Fi 稳定吗？',
        a: '通常稳定——中国大学在校园网络上投入大，宿舍、教室、图书馆 Wi-Fi 都好。主要摩擦是中国手机号用于短信认证。',
      },
      {
        q: '在中国期间可以保留母国 SIM 吗？',
        a: '可以——多数运营商有国际漫游，但日常数据费用高。母国 SIM 仅用于偶尔打电话；日常数据靠中国 SIM。纯流量国际 eSIM 是短期出行或备份的便宜选择。',
      },
    ],
    howToSteps: [
      {
        name: '落地 48 小时内激活中国 SIM',
        text: '机场运营商柜台、市区门店、或迎新周大学合作柜台。带护照 + 中国签证 + 入境章；部分套餐要临时住宿登记表。',
      },
      {
        name: '按校园覆盖选套餐，不按价格',
        text: '问校园 IT 哪家运营商信号最强；中国移动乡村/高铁覆盖好、中国联通北方城市强、中国电信南方城市有竞争力。学生档标准 ¥100-200/月。',
      },
      {
        name: '用新号激活支付宝与微信支付',
        text: 'SIM 激活后，在两个 App 完成学生认证。这解锁整个日常支付栈——宿舍、食堂、交通、多数商家——通过你绑的中国借记卡。',
      },
      {
        name: '用中国号认证校园 Wi-Fi',
        text: '大学 Wi-Fi 需要中国手机号短信验证。认证后，校园 Wi-Fi 覆盖多数日常数据，手机套餐省下来给通勤与周末。',
      },
      {
        name: '用大学合规 VPN 访问学术资源',
        text: 'JSTOR、ProQuest、Google Scholar 等学术数据库，用大学提供的合规企业 VPN 或图书馆代理。不要用未授权消费级隧道。',
      },
      {
        name: '母国 SIM 仅留紧急与短通话用',
        text: '国际漫游贵；母国 SIM 仅偶尔给家里打电话用。纯流量国际 eSIM（Airalo、Nomad）作为短期出行或头几天桥梁更便宜。',
      },
    ],
    ctaTitle: '需要一个到校前的连接方案？',
    ctaSubtitle:
      'SICA 顾问审核你大学推荐的运营商与迎新周 SIM 激活，加上校园 Wi-Fi 与学术 VPN 设置。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/open-chinese-bank-account',
        label: '开中国银行账户',
        description: '需要中国手机号的银行账户深度指南。',
      },
      {
        href: '/international-money-transfer-china',
        label: '向中国汇款与从中国汇出',
        description: '依赖中国 SIM 的支付宝/微信支付外籍设置。',
      },
      {
        href: '/first-week-in-china-survival-guide',
        label: '第一周在中国生存指南',
        description: '含 SIM 在内的完整到校前到前 7 天清单。',
      },
    ],
  },
};
