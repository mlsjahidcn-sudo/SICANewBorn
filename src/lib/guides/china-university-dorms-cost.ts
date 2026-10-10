import type { LocalizedGuide } from './types';

/**
 * "China University Dorms: what to expect and what it costs" — listicle
 * guide. Target queries: "china university dorms", "international
 * student dorm china", "dorm cost china university", "single room
 * dorm china", "off campus housing china".
 *
 * Different angle from /guides/accommodation (the general process
 * guide covering on-campus + off-campus) and /best-cities-china-
 * international-students (which is city-level). This page is the
 * deep-dive into the dorm room itself — room types, in-room
 * amenities, the international-dorm-vs-local-dorm distinction, the
 * full cost table, and the off-campus fallback.
 */
export const chinaDormsCostGuide: LocalizedGuide = {
  en: {
    slug: 'china-university-dorms-cost',
    eyebrow: 'GUIDE · DORMS',
    title: 'China University Dorms: What to Expect and What It Costs (2027)',
    description:
      'On-campus dorms for international students in China — room types (single, double, quad, suite), shared vs in-suite bathrooms, the international-dorm vs local-dorm distinction, what\'s in the room (WiFi, washer, kettle) and what isn\'t, full cost tables by city tier, and when to live off-campus.',
    subtitle:
      'Most international students in China live in university dorms in year one. The dorm system is standardized across Chinese universities but the room type, the in-room amenities, and whether the building is reserved for international students all affect cost and comfort. This guide maps the full dorm landscape — from the ¥800/semester quad room with a floor-shared bathroom up to the ¥2,500/semester single suite in an international dorm — so you can pick the right room when you apply, not the leftover.',
    stats: [
      { value: '¥800–2,500', label: 'Per semester dorm cost range' },
      { value: '4 types', label: 'Single, double, quad, suite' },
      { value: '2 buildings', label: 'International vs local dorm' },
      { value: '60%', label: 'On-campus, year one' },
    ],
    quickAnswer:
      'Chinese university dorms for international students run ¥800–2,500 per semester (¥1,600–5,000/year) for on-campus housing. Four room types: single (¥1,800–2,500/sem), double (¥1,200–1,800/sem), quad (¥800–1,200/sem), and a rarer suite (¥2,500+/sem). Most universities separate international-student dorms from local-student dorms — international buildings are usually newer, smaller (2-4 person floors), and have English-speaking staff. In-room amenities are consistent: bed, desk, wardrobe, AC (in the south) or shared heating (in the north), WiFi, shared bathroom. Most first-year international students are required to live on campus; year two and beyond most move off-campus into private rentals for more independence.',
    keyTakeaways: [
      'On-campus dorm cost: ¥800–2,500 per semester (¥1,600–5,000/year); CSC scholarship covers this fully',
      'Four room types: single, double, quad, suite — singles are the most expensive and limited',
      'Two building types: international dorms (newer, smaller, English-speaking staff) and local dorms (larger, mixed with Chinese students)',
      'In-room amenities: bed, desk, wardrobe, AC (south) / central heating (north), WiFi, shared bathroom; washer + dryer usually floor-shared',
      'What is NOT in the room: bedding, towels, kitchenware, kettle (often — bring or buy locally), shower shoes, hangers',
      'Most first-year international students are required to live on campus; check your admission notice for the dorm-assignment rules',
      'Off-campus private rentals: ¥1,500–4,000/month for a 1-bedroom depending on city — usually year two and beyond',
      'Apply for dorms early in the application window — popular room types fill within the first 2-3 weeks of the assignment window',
    ],
    sections: [
      {
        id: 'room-types',
        h2: 'The four room types',
        intro:
          'Dorm room types are standardized across Chinese universities, but the actual layout and bathroom arrangement vary. Here is what each type actually looks like.',
        blocks: [
          {
            type: 'table',
            caption: 'Dorm room types at Chinese universities — typical layout, occupancy, and cost',
            columns: ['Type', 'Layout', 'Bathroom', 'Cost/sem (¥)', 'Best for'],
            rows: [
              ['Single', '1 person, ~10–15 m², bed + desk + wardrobe + AC', 'Floor-shared or in-suite', '1,800–2,500', 'Scholars + students who need quiet'],
              ['Double', '2 people, ~14–20 m², twin beds + 2 desks + 2 wardrobes', 'Floor-shared (typical) or in-suite (premium)', '1,200–1,800', 'Most common — first-year default for many programs'],
              ['Quad', '4 people, ~20–28 m², 4 beds + 4 desks + 4 wardrobes', 'Floor-shared', '800–1,200', 'Budget-conscious; great for socializing'],
              ['Suite', '2–4 people, ~30–40 m², separate bedroom + small living area', 'In-suite', '2,500+', 'Premium international dorms; rarely available first year'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Double is the default** — most first-year international students are assigned a double; singles are limited and often need a medical or family-separation reason to be approved',
              '**Quad is the budget choice** — increasingly rare at top-tier universities but still common at provincial universities; cost roughly half of a single',
              '**Suites are rare and competitive** — usually only at top-tier universities (Tsinghua, Peking, Fudan, SJTU) and often in newer international-dorm buildings',
              '**Floor-shared bathroom is the norm** — typically 2-4 shower stalls + 2-3 toilets per floor for ~10-15 rooms; newer buildings have in-suite bathrooms as the premium option',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Layout pictures are not standardized — the same "double room" looks different at every university. Always check the international student office\'s dorm photos before you assume what you\'re getting.',
          },
        ],
      },
      {
        id: 'in-room-amenities',
        h2: 'In-room amenities — what is in the dorm and what is not',
        intro:
          'Chinese dorms are functional and the standard equipment is consistent. Some things that first-year internationals assume are provided are not — plan to bring or buy them locally in the first week.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Standard (provided)** — bed (single bed frame with thin mattress, 90cm × 200cm typical), desk + chair, wardrobe, small bookshelf, AC (southern universities) or central heating (northern universities — Heilongjiang, Jilin, Inner Mongolia, Beijing, Tianjin, Hebei, Shandong, Shanxi, Henan, Shaanxi, Gansu, Ningxia, Xinjiang, Qinghai, Tibet, Inner Mongolia, Liaoning in winter)',
              '**Standard (shared, on each floor)** — communal bathroom with shower stalls + toilets + sinks, drinking water dispenser (hot + cold), washing machine (¥3–5/load), sometimes a small kitchenette with microwave + induction cooktop',
              '**NOT provided — bring or buy** — bedding (sheets, pillows, duvet, mattress topper — the university mattress is hard and thin by international standards), towels, kitchenware, electric kettle (often prohibited for fire safety — use the floor dispenser), shower shoes, hangers, laundry detergent, power adapter if your home country uses a different plug type',
              '**Wifi** — most dorms have campus WiFi (sometimes free, sometimes a small fee per semester like ¥30–50); a Chinese phone number is required to register',
            ],
          },
          {
            type: 'table',
            caption: 'What to bring vs. what to buy locally — first-week packing list',
            columns: ['Item', 'Bring from home', 'Buy in China', 'Why'],
            rows: [
              ['Bedding (sheets, duvet, pillows)', 'From home if space allows (international brands are pricier in China)', 'Buy locally in the first week (Taobao / on-campus store / nearby supermarket)', 'The university mattress is hard by international standards; bring or buy a topper'],
              ['Kitchenware', 'No', 'Buy locally', 'Cuts down on initial carry weight; available everywhere'],
              ['Electric kettle', 'No (often banned in dorms for fire safety)', 'No — use floor dispensers', 'Universities prohibit in-room heating appliances; the violation can cost your dorm assignment'],
              ['Towels, shower shoes', 'No', 'Buy locally', 'Cheap and universally available'],
              ['Power adapters', 'From home (one is enough)', 'Buy a few locally if you bring many devices', 'China uses Type A / I plugs; most universal adapters work'],
              ['Personal electronics', 'From home', 'No', 'Laptops, phones, hair dryers are common travel items'],
              ['Medicine / prescriptions', 'From home (bring documentation in Chinese + English)', 'Top up locally', 'Some medications are not available in China; bring enough for 1-2 months'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'High-power appliances (electric kettles, rice cookers, induction cooktops, irons) are prohibited in most dorms for fire safety. Violations are tracked, fined, and can cost your dorm assignment. Use the floor\'s shared appliances.',
          },
        ],
      },
      {
        id: 'cost-by-tier',
        h2: 'Cost by city tier — international dorm vs local dorm',
        intro:
          'Dorm cost varies by city tier (Tier 1 / Tier 2 / Tier 3) and by which building you are assigned to. International-student dorms are usually 20-50% more expensive than the same university\'s local-student dorms.',
        blocks: [
          {
            type: 'table',
            caption: 'Dorm cost per semester by city tier + building type (double room, typical)',
            columns: ['City tier', 'Local dorm (double/sem)', 'International dorm (double/sem)', 'Notes'],
            rows: [
              ['Tier 1: Beijing, Shanghai, Shenzhen, Guangzhou', '¥1,200–1,800', '¥1,800–2,500', 'International dorms are newer; some universities (Tsinghua, SJTU) charge more'],
              ['Tier 2: Hangzhou, Nanjing, Wuhan, Chengdu, Xi\'an, Tianjin', '¥900–1,400', '¥1,400–1,900', 'Mid-tier cities balance quality + cost'],
              ['Tier 3: Changsha, Hefei, Lanzhou, regional capitals', '¥600–1,000', '¥1,000–1,400', 'Cheaper overall but fewer international-specific amenities'],
              ['Special administrative regions: Hainan, Xinjiang, Tibet', '¥600–1,200', '¥1,000–1,500', 'Universities often offer climate subsidies to attract international students'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**International vs local dorms** — international buildings typically have a 24h English-speaking RA staff, kitchenette per floor, dedicated study rooms, sometimes a small gym; local buildings have larger rooms but less English support',
              '**Deposit** — most universities require a refundable damage deposit (¥500–1,000) on top of the semester cost; refunded when you check out (minus any damages)',
              '**Utilities** — most dorms include water + electricity in the dorm fee; AC/heating may be metered separately in newer buildings (¥50–150/month extra in heavy-use months)',
              '**Payment timing** — semester dorm fees are due BEFORE the semester starts (typically August for fall, January for spring); the deposit is separate from the semester fee',
              '**Refund on withdrawal** — most universities refund a prorated amount if you leave mid-semester (minus an administrative fee of ~¥200)',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC scholarship covers the on-campus dorm fee in full — the cost is ¥0 out-of-pocket for CSC scholars. The choice between international and local dorm is one of comfort, not budget.',
          },
        ],
      },
      {
        id: 'assignment-process',
        h2: 'How dorms are assigned — and how to get the room you want',
        intro:
          'Dorm assignment at Chinese universities follows a predictable process, but the steps vary. Here is what the typical workflow looks like and how to maximize your odds of getting a single or international-dorm spot.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Receive the dorm-assignment email** — typically 4-6 weeks before the semester starts; the email includes a link to the dorm application portal',
              '**Submit your preferences** — room type (single / double / quad), building (international / local), roommate preferences (some universities allow you to request; most don\'t), move-in date',
              '**Pay the dorm fee** — usually required to confirm the assignment; failure to pay before the deadline = lose the spot',
              '**Receive your assignment** — building + room number + roommate name (if applicable) 1-2 weeks before the semester starts',
              '**Move in** — check in at the dorm reception, get your key card, sign the dorm rules agreement, and pick up your bedding / dorm kit if you ordered it through the university',
            ],
          },
          {
            type: 'ul',
            items: [
              '**Apply early** — dorm application windows typically open 4-6 weeks before move-in and close 2-3 weeks before; the most popular room types (singles, international dorms, certain buildings) fill first',
              '**Medical / family-separation priority for singles** — most universities give single-room priority to documented medical conditions, family separation (spouse/children joining), or scholarship status; document any of these in the application',
              '**Roommate matching** — most universities pair roommates by age + program; some let you submit a request with a friend; very few allow you to choose from a public list',
              '**Extensions** — year 1 dorms are usually required; year 2 and beyond most universities let you re-apply or move off-campus',
              '**Special needs** — if you have dietary, religious, accessibility, or quiet-hours needs, write them in the application — the international student office routes these to the dorm manager',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Some universities (Tsinghua, SJTU, Zhejiang) assign international dorms by lottery once applications are in. Apply early + put a single room + international building as your top three preferences even if your odds are long.',
          },
        ],
      },
      {
        id: 'off-campus',
        h2: 'Off-campus housing — when to move and what it costs',
        intro:
          'After year 1, most international students move off campus for more independence, better cooking, and more space. The market is mature in Tier 1/2 cities; thin in Tier 3.',
        blocks: [
          {
            type: 'table',
            caption: 'Off-campus private rental market by city tier (1-bedroom apartment, typical)',
            columns: ['City tier', 'Monthly rent (¥)', 'Lease length', 'Notes'],
            rows: [
              ['Tier 1: Beijing, Shanghai, Shenzhen, Guangzhou', '3,000–5,000', '6–12 months', 'Most demand; closest to campus is most expensive'],
              ['Tier 2: Hangzhou, Nanjing, Wuhan, Chengdu, Xi\'an, Tianjin', '2,000–3,500', '6–12 months', 'Good selection within 20-minute commute'],
              ['Tier 3: Changsha, Hefei, regional capitals', '1,200–2,000', '6–12 months', 'Thinner selection; many landlords prefer students short-term'],
              ['Foreign-rented via agency', '+ ¥500–1,500/month', '12 months typical', 'Some agencies specialize in international tenants (English-speaking landlord, western-style kitchen, internet included)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**When to consider moving off campus** — year 2+, when dorm rules allow; when you have a kitchen requirement (most dorms prohibit cooking); when you need more space or quiet',
              '**Lease terms** — 6-month and 12-month leases are standard; month-to-month is rare and expensive; some landlords require 1-month deposit + 1-month prepaid rent',
              '**Utilities** — usually ¥100–300/month extra (water, electricity, gas, internet); AC/heating can add another ¥50–200/month in heavy-use months',
              '**Practical tip: agent vs direct** — agents in Tier 1 cities charge 30-70% of one month\'s rent as a fee; direct-from-landlord (via 小红书 Xiaohongshu, 豆瓣 Douban, university housing WeChat groups) avoids the fee but requires more Chinese-language work',
              '**Visa / dorm-release paperwork** — when you move off campus, you must register your new address with the local police station within 24 hours AND update your residence permit with the new address; failure to register can invalidate your visa',
              '**Quality variations** — most student-targeted rentals are furnished (bed, sofa, fridge, washing machine, AC); unfurnished (毛坯) apartments need a ¥5,000–15,000 setup investment',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Moving off campus triggers a 24-hour police registration requirement + a residence-permit address change. Missing this is a common cause of residence permit complications. Do the registration the day you sign the lease, not the day you move in.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How much do university dorms cost in China?',
        a: 'On-campus dorms for international students run ¥800–2,500 per semester (¥1,600–5,000/year) depending on city tier and room type. Singles ¥1,800–2,500/sem, doubles ¥1,200–1,800/sem (most common), quads ¥800–1,200/sem, suites ¥2,500+/sem. CSC scholarship covers the full dorm fee.',
      },
      {
        q: 'Are international student dorms different from local student dorms?',
        a: 'Yes — most universities reserve newer, better-equipped buildings for international students. International dorms usually have 24h English-speaking RA staff, per-floor kitchenettes, dedicated study rooms, and smaller (2-4 person) floor layouts. Local dorms are larger, more Chinese-student-dominated, and typically ¥500–700/sem cheaper for the same room type.',
      },
      {
        q: 'Are dorms co-ed?',
        a: 'Mostly separated by floor or building — male floors and female floors within the same building, sometimes male and female buildings. Same-floor co-ed dorms exist at some universities (notably Fudan and a few liberal-arts universities) but are not the default. Couples housing is rare and not generally offered to unmarried international students.',
      },
      {
        q: 'Can I cook in my dorm?',
        a: 'Generally no — high-power appliances (rice cookers, induction cooktops, electric kettles, hot plates, toaster ovens) are prohibited for fire safety. The good news: most international dorms have a floor kitchenette with a microwave + induction cooktop + sink, and there is always a cafeteria within a 5-minute walk. Off-campus apartments allow full kitchens.',
      },
      {
        q: 'What is NOT provided in the dorm?',
        a: 'Bedding (sheets, duvet, pillows, mattress topper), kitchenware, electric kettle (banned in most dorms), towels, shower shoes, hangers, and laundry detergent. The university mattress is thin by international standards — bring a topper or buy one locally in the first week. International student offices often sell a "dorm kit" at move-in.',
      },
      {
        q: 'Can I pick my roommate?',
        a: 'Sometimes. Most universities pair roommates by age + program; some allow you to submit a roommate request with a friend or partner (where couples housing exists); very few allow you to pick from a public list. Put the request in your dorm application and the dorm manager will usually accommodate if both parties request each other.',
      },
      {
        q: 'Is WiFi included in the dorm?',
        a: 'Most dorms have campus WiFi (sometimes free, sometimes a small fee like ¥30–50/semester). A Chinese phone number is required to register the WiFi account. For most international students, a separate mobile data SIM (¥30–100/month) is essential for off-campus navigation, food delivery, and translation apps.',
      },
      {
        q: 'When can I move off campus?',
        a: 'Most universities require first-year international students to live on campus; from year 2, you can re-apply to the dorm or move off campus. Off-campus rentals run ¥1,200–5,000/month for a 1-bedroom depending on city tier. You must register your new address with the local police within 24 hours and update your residence permit — missing this creates visa problems.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm whether on-campus living is required for your program',
        text: 'Check your admission notice. Most bachelor\'s programs and many master\'s programs require first-year on-campus living; some master\'s/PhD candidates are exempt. The exact rule varies by university.',
      },
      {
        name: 'Decide your room type + building priority',
        text: 'Singles are quietest but limited and most expensive; doubles are the default and most common; quads are cheapest and most social; international dorms are the comfort pick. Decide before the application window opens.',
      },
      {
        name: 'Apply early in the dorm-assignment window',
        text: 'Watch for the dorm-assignment email 4-6 weeks before move-in. Apply within the first 2-3 days for the best room selection — popular room types fill quickly. Pay the dorm fee immediately to confirm.',
      },
      {
        name: 'Pack the right things and buy the rest locally',
        text: 'Bring: power adapter, prescriptions with documentation, personal electronics. Buy locally: bedding, towels, kitchenware, hangers, shower shoes. Do NOT bring electric kettles, hot plates, or rice cookers — they are fire-safety violations.',
      },
      {
        name: 'Set up the on-arrival essentials in week 1',
        text: 'Chinese SIM card + bank account + Alipay in the first 3 days. Campus WiFi registration requires the Chinese phone number. The international student office runs a "first week" orientation — attend it.',
      },
      {
        name: 'Live on campus in year 1; reassess for year 2',
        text: 'Year 1 dorms are the easiest way to settle in, build a social network, and learn the campus. Year 2, reassess: if you need more space / a kitchen / quiet, off-campus becomes attractive. If you value the community, re-apply to the dorm.',
      },
      {
        name: 'If moving off campus, complete the address registration',
        text: 'Within 24 hours of signing the lease, register your new address at the local police station (派出所). Bring the lease + passport + residence permit. Update your residence permit with the new address at the local Public Security Bureau exit-entry office.',
      },
    ],
    ctaTitle: 'Sorting out your China dorm?',
    ctaSubtitle:
      'SICA counselors help you compare universities by dorm quality + international-building availability, prepare the dorm application with your room + building preferences, and walk you through the on-arrival + off-campus transitions. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/accommodation',
        label: 'Accommodation in China (general guide)',
        description: 'On-campus dorms vs off-campus apartments — costs, contracts, roommate matching, and what to expect.',
      },
      {
        href: '/best-cities-china-international-students',
        label: 'Best cities in China for international students',
        description: 'Top Chinese cities ranked by # of top universities + international community + career opportunities.',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: 'Cost of living in China by city',
        description: 'City-by-city total cost (tuition + living) + budget breakdown + hidden costs across tier 1/2/3 cities.',
      },
    ],
  },
  zh: {
    slug: 'china-university-dorms-cost',
    eyebrow: '指南 · 住宿',
    title: '2027 中国大学宿舍：实际什么样、多少钱、怎么选',
    description:
      '中国大学国际生宿舍——房型（单人间、双人间、四人间、套间）、公共与独立卫浴、留学生楼与本土学生楼的差异、房内配置（WiFi、洗衣机、电水壶）与不配置、按城市分级的完整费用表，以及什么时候该搬出校园租房。',
    subtitle:
      '多数国际生第一年住校内宿舍。宿舍系统在中国大学是标准化的，但房型、房内设施以及宿舍楼是否专供国际生会影响成本与舒适度。本指南绘制完整住宿图景——从 800 元/学期的四人间配楼层公卫，到 2,500 元/学期的单人间套间带独立卫浴的留学生楼——让你申请时选对房型，而不是挑剩下的。',
    stats: [
      { value: '¥800-2,500', label: '每学期宿舍费用范围' },
      { value: '4 种房型', label: '单/双/四/套间' },
      { value: '2 栋楼', label: '留学生楼 vs 本土楼' },
      { value: '60%', label: '第一年住校内' },
    ],
    quickAnswer:
      '中国大学国际生宿舍每学期 800-2,500 元（年 1,600-5,000 元）。四种房型：单人间（1,800-2,500/学期）、双人间（1,200-1,800/学期）、四人间（800-1,200/学期）、少数套间（2,500+）。多数大学把留学生楼与本土学生楼分开——留学生楼通常更新、楼层小（2-4 人楼层），有英语工作人员。房内标配：床、书桌、衣柜、空调（南方）或集中供暖（北方）、WiFi、共享卫浴。第一年多数国际生必须住校内；大二起多数搬出校园租房。',
    keyTakeaways: [
      '校内宿舍：每学期 800-2,500 元（年 1,600-5,000）；CSC 奖学金全额覆盖',
      '四种房型：单人间、双人间、四人间、套间——单人间最贵且名额有限',
      '两栋楼型：留学生楼（更新、更小、英语员工）与本土楼（更大、与中国学生混住）',
      '房内配置：床、书桌、衣柜、空调（南）/ 集中供暖（北）、WiFi、共享卫浴；洗衣机烘干机通常楼层共享',
      '不配置——床上用品、毛巾、厨具、电水壶（多数禁止）、洗澡拖鞋、衣架、洗涤剂',
      '第一年国际生多数强制住校；查看录取通知的宿舍分配规则',
      '校外租房：每月 1,500-4,000 元一居，按城市分级——通常大二起',
      '早申请宿舍——热门房型在分配窗口开放头 2-3 周就报满',
    ],
    sections: [
      {
        id: 'room-types',
        h2: '四种房型',
        intro:
          '中国大学的宿舍房型是标准化的，但实际布局与卫浴安排各校不同。这里是每种房型实际什么样。',
        blocks: [
          {
            type: 'table',
            caption: '中国大学宿舍房型——典型布局、人数与费用',
            columns: ['房型', '布局', '卫浴', '费用/学期（¥）', '适合人群'],
            rows: [
              ['单人间', '1 人，约 10-15 m²，床+书桌+衣柜+空调', '楼层共享或独立', '1,800-2,500', '公派生 + 需要安静者'],
              ['双人间', '2 人，约 14-20 m²，两张床+两套书桌+两衣柜', '楼层共享（典型）或独立（高端）', '1,200-1,800', '最常见——许多项目一年级默认'],
              ['四人间', '4 人，约 20-28 m²，四张床+四书桌+四衣柜', '楼层共享', '800-1,200', '预算型；适合社交'],
              ['套间', '2-4 人，约 30-40 m²，独立卧室+小客厅', '独立', '2,500+', '高端留学生楼；一年级罕见'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**双人间是默认**——多数一年级国际生分到双人间；单人间名额有限，常需医疗或家庭分居证明',
              '**四人间是预算型选择**——顶尖大学越来越少见，省属大学仍有；费用约为单人间的 50%',
              '**套间稀有且竞争激烈**——通常仅顶尖大学（清华、北大、复旦、上交）+ 较新留学生楼才有',
              '**楼层共享卫浴是常态**——每 10-15 间房 2-4 个淋浴隔间 + 2-3 个厕所；新楼高端房型才有独立卫浴',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '布局照片不标准化——同一「双人间」在每所大学看起来都不同。务必在国际生办公室的宿舍照片中确认你将得到什么。',
          },
        ],
      },
      {
        id: 'in-room-amenities',
        h2: '房内配置——宿舍有什么，没有什么',
        intro:
          '中国宿舍功能实用，标准配置一致。国际生第一年常假设有但实际没有的——计划自带或第一周本地购买。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**标配（提供）**——床（单层床架配薄床垫，90cm × 200cm 常见）、书桌 + 椅、衣柜、小书架、空调（南方大学）或集中供暖（北方大学——黑龙江、吉林、内蒙、北京、天津、河北、山东、山西、河南、陕西、甘肃、宁夏、新疆、青海、西藏、辽宁冬季）',
              '**标配（每层共享）**——公共卫浴带淋浴隔间 + 厕所 + 洗手台、饮水机（热+冷）、洗衣机（每 3-5 元/次）、有时小厨房角带微波炉 + 电磁炉',
              '**不配置——自带或买**——床上用品（床单、枕头、被子、床垫——大学床垫按国际标准偏硬偏薄）、毛巾、厨具、电水壶（多数禁止——消防）、洗澡拖鞋、衣架、洗涤剂、电源转换插头（如本国插座规格不同）',
              '**WiFi**——多数宿舍有校园 WiFi（有时免费，有时每学期 30-50 元）；需要中国手机号才能注册',
            ],
          },
          {
            type: 'table',
            caption: '自带 vs 本地购买——第一周物品清单',
            columns: ['物品', '自带', '本地购买', '原因'],
            rows: [
              ['床上用品（床单、被子、枕头）', '空间允许可自带（国际品牌在中国更贵）', '第一周本地买（淘宝 / 校内商店 / 附近超市）', '大学床垫按国际标准偏硬；带或买一个床垫加厚层'],
              ['厨具', '不带', '本地买', '减轻初始负重；到处有售'],
              ['电水壶', '不带（多数宿舍禁用）', '不带——用楼层饮水机', '大学禁止房内加热电器；违规可致失去宿舍资格'],
              ['毛巾、洗澡拖鞋', '不带', '本地买', '便宜且到处有售'],
              ['电源转换插头', '自带（一个就够）', '带多设备则多买几个', '中国用 A / I 型插头；多数万能转换头可用'],
              ['个人电子设备', '自带', '不带', '笔记本、手机、吹风机是常见行李'],
              ['药品 / 处方', '自带（带中英双语文件）', '本地补货', '部分药品在中国买不到；带够 1-2 个月用量'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '大功率电器（电水壶、电饭煲、电磁炉、熨斗）在多数宿舍因消防安全禁止。违规会被记录、罚款，严重者失去宿舍资格。用楼层共享电器。',
          },
        ],
      },
      {
        id: 'cost-by-tier',
        h2: '按城市分级——留学生楼 vs 本土楼',
        intro:
          '宿舍费用按城市分级（一线 / 二线 / 三线）+ 你被分配的楼。留学生楼通常比同校本土楼贵 20-50%。',
        blocks: [
          {
            type: 'table',
            caption: '按城市分级 + 楼型的宿舍费用（双人间每学期）',
            columns: ['城市分级', '本土楼（双/学期）', '留学生楼（双/学期）', '备注'],
            rows: [
              ['一线：北京、上海、深圳、广州', '1,200-1,800', '1,800-2,500', '留学生楼更新；部分大学（清华、上交）更贵'],
              ['二线：杭州、南京、武汉、成都、西安、天津', '900-1,400', '1,400-1,900', '中等城市平衡质量与成本'],
              ['三线：长沙、合肥、兰州、省会', '600-1,000', '1,000-1,400', '整体更便宜但国际生专属配置较少'],
              ['特殊：海南、新疆、西藏', '600-1,200', '1,000-1,500', '大学常提供气候补贴吸引国际生'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**留学生 vs 本土楼**——留学生楼通常 24 小时英语宿舍管理员、楼层小厨房、专用自习室、有时小健身房；本土楼房间更大但英语支持少',
              '**押金**——多数大学要求可退损坏押金（500-1,000 元）每学期；退宿时退还（扣除损坏）',
              '**水电**——多数宿舍含水电；新楼空调 / 供暖按表另计（旺季每月多 50-150 元）',
              '**付费时间**——学期宿舍费在学期开始前交（秋季通常 8 月，春季 1 月）；押金与学期费分开',
              '**退费**——中途离宿多数大学按比例退费（扣除约 200 元行政费）',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC 奖学金全额覆盖校内宿舍费——CSC 学者实际成本为 ¥0。选留学生楼还是本土楼是舒适度问题，不是预算问题。',
          },
        ],
      },
      {
        id: 'assignment-process',
        h2: '宿舍分配流程——怎么拿到你想要的房',
        intro:
          '中国大学的宿舍分配流程是可预期的，但步骤各校不同。这里是典型工作流 + 如何最大化拿到单人间或留学生楼的机会。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**收宿舍分配邮件**——通常开学前 4-6 周；邮件含宿舍申请门户链接',
              '**提交偏好**——房型（单/双/四）、楼（留学生/本土）、室友偏好（部分大学允许申请，多数不允许）、入住日期',
              '**交宿舍费**——通常需要交费才能确认分配；截止前未交 = 失去名额',
              '**收分配结果**——开学前 1-2 周收到楼号 + 房号 + 室友姓名（若有）',
              '**入住**——在宿舍前台 check-in，领门卡，签宿舍规则协议，领取预定的宿舍套件',
            ],
          },
          {
            type: 'ul',
            items: [
              '**早申请**——宿舍申请窗口通常开学前 4-6 周开放、2-3 周关闭；最热门房型（单人间、留学生楼、某些楼）先报满',
              '**单人间优先权**——多数大学给单人间优先于：医疗证明、家庭分居（配偶/子女随行）、奖学金身份；在申请中附文件',
              '**室友匹配**——多数大学按年龄+项目配对；部分允许和朋友共同申请；少数允许从公开名单选',
              '**续期**——第一年宿舍通常强制；大二起多数大学允许续申请或搬出',
              '**特殊需求**——如有饮食、宗教、无障碍、安静时间等需求，写在申请中；国际生办公室会转给宿舍经理',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '部分大学（清华、上交、浙大）留学生楼用抽签分配。申请要早 + 把单人间 + 留学生楼列为前三偏好，即使概率不高。',
          },
        ],
      },
      {
        id: 'off-campus',
        h2: '校外住宿——什么时候搬、多少钱',
        intro:
          '大一后，多数国际生搬出校园获得更多独立、更好做饭、更多空间。一二线城市市场成熟，三线较薄。',
        blocks: [
          {
            type: 'table',
            caption: '校外私人租赁市场（按城市分级，一居室典型）',
            columns: ['城市分级', '月租（¥）', '租期', '备注'],
            rows: [
              ['一线：北京、上海、深圳、广州', '3,000-5,000', '6-12 个月', '需求最大；离校园越近越贵'],
              ['二线：杭州、南京、武汉、成都、西安、天津', '2,000-3,500', '6-12 个月', '通勤 20 分钟内选择多'],
              ['三线：长沙、合肥、省会', '1,200-2,000', '6-12 个月', '选择较薄；多数房东偏好长期租客'],
              ['外国租客中介', '+500-1,500 元/月', '通常 12 个月', '部分中介专做国际客（英语房东、西式厨房、含网络）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**何时考虑搬出**——大二起，当宿舍规则允许；当你需要做饭（多数宿舍禁）；当需要更多空间或安静',
              '**租期**——6 个月和 12 个月是标准；月付少且贵；一些房东要求 1 押 1 付',
              '**水电**——通常另加每月 100-300 元（水、电、气、网）；空调 / 供暖旺季再 +50-200 元',
              '**实用建议：中介 vs 直租**——一线城市中介收 30-70% 月租作佣金；直租（通过小红书、豆瓣、大学租房微信群）免佣金但需要更多中文沟通',
              '**签证 / 退宿手续**——搬出校外时，必须 24 小时内到当地派出所登记新地址，并更新居留许可地址；未登记会导致签证问题',
              '**配置差异**——多数学生公寓带家具（床、沙发、冰箱、洗衣机、空调）；毛坯公寓需 5,000-15,000 元置办',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '搬出校外会触发 24 小时派出所登记 + 居留许可地址变更。漏登是居留许可出问题的常见原因。签完合同当天就登记，而不是入住当天。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国大学宿舍多少钱？',
        a: '国际生校内宿舍每学期 800-2,500 元（年 1,600-5,000 元），因城市分级和房型而异。单人间 1,800-2,500/学期；双人间 1,200-1,800/学期（最常见）；四人间 800-1,200/学期；套间 2,500+。CSC 奖学金全额覆盖。',
      },
      {
        q: '国际生宿舍与本土生宿舍有区别吗？',
        a: '有——多数大学把更新、配置更好的楼给国际生。留学生楼通常 24 小时英语宿舍管理员、楼层小厨房、专用自习室、楼层小（2-4 人）；本土楼更大、更多中国学生、同等房型便宜 500-700 元/学期。',
      },
      {
        q: '宿舍男女混住吗？',
        a: '通常按楼层或楼栋分开——同一栋有男生层和女生层，部分大学分栋。极少数大学（尤其人文类）有同层混宿；未婚国际生一般没有夫妻房型。',
      },
      {
        q: '能在宿舍做饭吗？',
        a: '通常不能——大功率电器（电饭煲、电磁炉、电水壶、烤面包机）因消防安全禁止。好消息：多数留学生楼每层有小厨房角（微波炉 + 电磁炉 + 水槽），步行 5 分钟内有食堂。校外公寓可享全厨房。',
      },
      {
        q: '宿舍不提供什么？',
        a: '床上用品（床单、被子、枕头、床垫加厚层）、厨具、电水壶（多数禁）、毛巾、洗澡拖鞋、衣架、洗涤剂。大学床垫按国际标准偏薄——带或买一个加厚层。国际生办公室通常在入住时卖「宿舍套件」。',
      },
      {
        q: '能选室友吗？',
        a: '有时。多数大学按年龄+项目配对；部分允许和好友共同申请；少数允许从公开名单选。把请求写在宿舍申请中，双方都写对方时宿舍经理通常会成全。',
      },
      {
        q: '宿舍有 WiFi 吗？',
        a: '多数宿舍有校园 WiFi（有时免费，有时 30-50 元/学期）。注册需要中国手机号。多数国际生另办一张移动数据 SIM（30-100 元/月），用于校外导航、外卖和翻译 App。',
      },
      {
        q: '什么时候能搬出校外？',
        a: '多数大学第一年强制住校；大二起可续申请宿舍或搬出校外。校外一居室 1,200-5,000 元/月因城市分级。搬出后必须 24 小时内到派出所登记新地址并更新居留许可——漏登会出签证问题。',
      },
    ],
    howToSteps: [
      {
        name: '确认项目是否要求住校',
        text: '查录取通知。多数本科和许多硕士项目要求第一年住校；部分硕博可豁免。规则各校不同。',
      },
      {
        name: '确定房型 + 楼偏好',
        text: '单人间最安静但最贵且名额少；双人间是默认；四人间最便宜最社交；留学生楼是舒适首选。申请窗口开前就定。',
      },
      {
        name: '早申请宿舍',
        text: '入住前 4-6 周留意宿舍分配邮件。头 2-3 天内申请，热门房型先报满。立即交费确认。',
      },
      {
        name: '带对东西，剩下的本地买',
        text: '自带：电源转换插头、处方带文件、个人电子设备。本地买：床上用品、毛巾、厨具、衣架、洗澡拖鞋。不要带电水壶、电热锅、电饭煲——违反消防。',
      },
      {
        name: '第一周办妥基本配置',
        text: '中国手机卡 + 银行账户 + 支付宝在前 3 天办完。校园 WiFi 注册需要中国手机号。国际生办公室办「第一周」迎新——务必参加。',
      },
      {
        name: '第一年住校；大二再评估',
        text: '第一年宿舍是融入、社交、熟悉校园的最简方式。大二时再评估：需要更多空间 / 厨房 / 安静？校外就有吸引力。重视社群？续申请宿舍。',
      },
      {
        name: '搬出校外则 24 小时内完成地址登记',
        text: '签完租约 24 小时内到当地派出所登记新地址。带租约 + 护照 + 居留许可。到当地公安局出入境办证大厅更新居留许可地址。',
      },
    ],
    ctaTitle: '正在规划你的中国宿舍？',
    ctaSubtitle:
      'SICA 顾问帮你按宿舍质量与国际楼可用性比较大学、准备带房型与楼偏好的宿舍申请、并陪你走过入学与搬出校外的过渡。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/accommodation',
        label: '中国住宿通用指南',
        description: '校内宿舍 vs 校外公寓——费用、合同、室友匹配与注意事项。',
      },
      {
        href: '/best-cities-china-international-students',
        label: '中国国际生最佳城市',
        description: '按顶尖大学数量 + 国际社群 + 就业机会排名的中国留学城市。',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: '中国各城市生活费',
        description: '按城市分级的总费用（学费 + 生活费）+ 预算明细 + 隐藏成本。',
      },
    ],
  },
};
