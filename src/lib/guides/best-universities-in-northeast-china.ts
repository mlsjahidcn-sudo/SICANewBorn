import type { LocalizedGuide } from './types';

/**
 * "Best Universities in Northeast China for International Students" —
 * regional/comparison article #4 of 4
 * (docs/regional-comparisons-4-article-plan.md). Target queries:
 * "best universities in northeast china", "study in harbin",
 * "jilin university international students", "dalian university of
 * technology", "cheap universities in china quality".
 *
 * Static listicle. The region's pitch is value: 985-tier engineering
 * (HIT, DUT, NEU, Jilin) at the cheapest cost-of-living tier in
 * China, plus specialist niches (HEU shipbuilding, NENU
 * education/Chinese-language). Facts for HIT mirror the shipped
 * harbin-institute-of-technology profile; costs use that module's
 * bands as the region benchmark. Climate honesty is required copy
 * (Harbin winters below -20°C).
 */
export const bestUniversitiesInNortheastChinaGuide: LocalizedGuide = {
  en: {
    slug: 'best-universities-in-northeast-china',
    eyebrow: 'REGIONAL GUIDE · NORTHEAST CHINA',
    title: 'Best Universities in Northeast China for International Students — 985 Quality at China\'s Lowest Living Costs',
    description:
      'The best universities in Northeast China — HIT, Jilin, Dalian UT, Northeastern U, NENU, Harbin Engineering — 985-tier degrees at the cheapest living costs in China.',
    subtitle:
      'Northeast China (Liaoning, Jilin, Heilongjiang) is the most under-priced region in Chinese higher education: it holds four 985-universities — Harbin Institute of Technology, Jilin University, Dalian University of Technology, and Northeastern University — plus the country\'s reference schools for naval architecture (Harbin Engineering) and teacher education (Northeast Normal), all sitting in cities whose living costs are the lowest tier among Chinese university towns. Applications at these universities are often less crowded than at equally-ranked coastal flagships, because international demand concentrates in Beijing, Shanghai, and the south. This guide ranks the universities worth applying to, breaks down the real costs, and is honest about the winters.',
    stats: [
      { value: '4', label: '985 universities in the region (HIT, Jilin, DUT, NEU)' },
      { value: '¥45k–75k', label: 'All-in annual cost at HIT — the region benchmark' },
      { value: '−20°C', label: 'Typical Harbin winter lows — plan for it' },
      { value: 'Lowest', label: 'Living-cost tier among Chinese university cities' },
    ],
    quickAnswer:
      'The best universities in Northeast China are Harbin Institute of Technology (aerospace and engineering flagship of the region), Jilin University (one of China\'s largest comprehensive universities, strong in vehicles, law, chemistry, and math), Dalian University of Technology (chemical and port engineering on the coast), Northeastern University at Shenyang (metallurgy, materials, automation), Northeast Normal University (education and one of the strongest Chinese-language environments), and Harbin Engineering University (the national reference for shipbuilding and naval engineering). All require the CSCA from the 2026 intake like every mainland university. The regional trade is simple: 985-tier degrees and the cheapest living costs in China, in exchange for cold winters and cities that are less internationally famous than Beijing or Shanghai.',
    keyTakeaways: [
      'Four 985 universities: HIT (aerospace/engineering), Jilin (comprehensive), DUT (chemical/port engineering), NEU (metallurgy/materials/automation) — the same elite tier as Beijing and Shanghai flagships',
      'Two specialist references: Harbin Engineering (shipbuilding, ocean, naval, nuclear) and Northeast Normal (education, Chinese-language programs)',
      'Living costs are China\'s lowest university-city tier: benchmark all-in cost at HIT is ~¥45,000–¥75,000/year versus ¥50,000–¥95,000 at coastal flagships',
      'CSCA still applies from 2026 — engineering combinations typically STEM Chinese + Math + Physics; verify per program',
      'Scholarship depth: CSC stacks with Heilongjiang, Jilin, and Liaoning provincial awards, municipal awards (Harbin is documented), and university scholarships — money stretches further where living is cheap',
      'The honest trade-off: winters are serious (Harbin regularly below −20°C) and the cities are less internationally known — but the degrees carry the same national weight',
    ],
    sections: [
      {
        id: 'quick-picks',
        h2: 'Quick picks: which Northeast university for what',
        intro: 'Start here if you know your direction. Every pick is a Double First-Class university that accepts international students.',
        blocks: [
          {
            type: 'table',
            caption: 'Best university by goal',
            columns: ['Your goal', 'Pick', 'Why'],
            rows: [
              ['Best overall / engineering flagship', 'HIT (Harbin)', 'The region\'s 985 leader — aerospace, mechanical, materials, CS; three campuses (Harbin, Weihai, Shenzhen)'],
              ['Best comprehensive breadth', 'Jilin University (Changchun)', 'One of China\'s largest comprehensive universities — vehicles, law, chemistry, math, medicine'],
              ['Best coastal city + engineering', 'Dalian UT (Dalian)', 'Chemical and port/coastal engineering reference school; Dalian is the region\'s mildest, most livable city'],
              ['Best for Chinese-language immersion', 'Northeast Normal (Changchun)', 'A national education hub with large, long-running Chinese-language programs'],
              ['Best niche engineering', 'Harbin Engineering (Harbin)', 'The reference school for shipbuilding, ocean engineering, naval systems, and nuclear applications'],
              ['Best materials / automation in a big industrial city', 'Northeastern U (Shenyang)', 'Metallurgy and materials heritage plus strong automation, in the region\'s largest city'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Also worth knowing: Dalian Maritime University (the reference school for maritime education) and strong provincial universities such as Liaoning University and Heilongjiang University round out the region for particular profiles.',
          },
        ],
      },
      {
        id: 'why-northeast',
        h2: 'Why choose Northeast China at all?',
        intro:
          'The regional case in one section: 985-tier quality, the cheapest living costs in the system, real engineering heritage, and admissions that are often less crowded than the coastal equivalents.',
        blocks: [
          {
            type: 'h3',
            text: 'The value case',
            body: 'China\'s 985 universities are supposed to be the system\'s elite tier, and the Northeast holds four of them. But because international demand concentrates in Beijing, Shanghai, Guangzhou, and the southeast coast, equally-ranked Northeast universities often review smaller, less crowded international applicant pools. For the same CSCA score, the realistic admission set in the Northeast can include universities that would be reaches in Beijing — and once you are enrolled, every yuan of stipend or savings goes further in the cheapest cost-of-living tier of Chinese university cities.',
          },
          {
            type: 'h3',
            text: 'The engineering heritage',
            body: 'The Northeast was the industrial heartland of twentieth-century China, and its universities were built to feed it: HIT grew around aerospace and defense engineering with a distinctive Russian-influenced tradition and one of the most internationally diverse engineering student bodies in the country; Dalian UT anchors chemical and port engineering on the coast; Northeastern U grew out of the metals industry; Harbin Engineering descends from the military-engineering tradition and owns the shipbuilding niche. For engineering students who want depth rather than a famous city, this is the densest concentration of heritage engineering programs outside Beijing.',
          },
          {
            type: 'h3',
            text: 'The honest trade-offs',
            body: 'Winters are serious: Harbin and Changchun regularly see lows around or below −20°C, though buildings are well heated and the cities are built for it (Dalian, on the coast, is the mildest). English-language daily life is thinner than in Beijing or Shanghai. And the cities are less internationally famous — which matters for name recognition back home but not for the degree\'s standing inside China\'s system.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'A practical extra for the right applicant: the region\'s proximity to Russia and Korea shapes its economy and its language environment — HIT\'s international population includes a large Belt-and-Road cohort, and applicants from Russia, Central Asia, and Korea often find the Northeast the most natural cultural fit in China.',
          },
        ],
      },
      {
        id: 'the-list',
        h2: 'The six universities worth shortlisting',
        intro: 'Profiles of the regional picks, strongest first. All are Double First-Class; four carry the 985 designation.',
        blocks: [
          {
            type: 'h3',
            text: '1. Harbin Institute of Technology (HIT) — the regional flagship',
            body: 'Founded in 1920 as a Sino-Russian industrial school, HIT is one of China\'s premier engineering universities — aerospace, mechanical, materials, computer science, automation, electrical — with three campuses (Harbin main, Weihai, Shenzhen) and one of the most internationally diverse engineering populations in the country, anchored by a large Belt-and-Road cohort. CSCA combinations for engineering run STEM Chinese + Math + Physics. International bachelor\'s tuition runs ~¥30,000–¥60,000 with all-in costs around ¥45,000–¥75,000 per year; the scholarship stack includes CSC, HIT\'s own awards, Heilongjiang provincial and Harbin municipal scholarships, and Belt-and-Road-specific funding.',
          },
          {
            type: 'h3',
            text: '2. Jilin University (JLU) — comprehensive breadth at scale',
            body: 'Based in Changchun and founded in 1946, Jilin University is one of the largest comprehensive universities in China by any measure — a single institution spanning vehicles and automotive engineering (it sits in China\'s auto-manufacturing capital), law, chemistry (a top-tier national tradition), mathematics, medicine, and the humanities. For international students who want a comprehensive-university experience with 985 standing at Northeast prices, JLU is the region\'s default. Verify per-program tuition; the university\'s size means standards vary by faculty.',
          },
          {
            type: 'h3',
            text: '3. Dalian University of Technology (DUT) — coastal engineering',
            body: 'Founded in 1949 and located in Dalian — the region\'s mildest, most livable coastal city — DUT is a 985 engineering university with particular depth in chemical engineering, port and coastal engineering (a national reference), mechanical engineering, and shipbuilding-adjacent fields, plus a growing computer-science presence fed by Dalian\'s software industry. For students who want the Northeast value proposition without the deepest winters, DUT is the natural pick.',
          },
          {
            type: 'h3',
            text: '4. Northeastern University (NEU) — metals, materials, automation in Shenyang',
            body: 'Founded in 1923 in Shenyang, the region\'s largest city, NEU is a 985 university whose identity grew out of the metals and heavy industry that built the Northeast: metallurgy and materials remain reference disciplines, complemented by strong automation, computer science, and software engineering. Shenyang\'s cost of living sits in the region\'s cheap tier, and the city\'s industrial base makes internships in manufacturing and materials unusually accessible.',
          },
          {
            type: 'h3',
            text: '5. Northeast Normal University (NENU) — education and Chinese language',
            body: 'Founded in 1946 in Changchun, NENU is one of China\'s six directly-administered normal (education) universities and a Double First-Class institution. For international students it matters for two reasons: its education and humanities programs are region-leading, and its international Chinese-language education programs are large, long-running, and well organized — making NENU one of the best environments in China to study education or to build a strong Chinese foundation before (or alongside) a degree.',
          },
          {
            type: 'h3',
            text: '6. Harbin Engineering University (HEU) — the shipbuilding niche',
            body: 'Founded in 1953 from the military-engineering tradition and located in Harbin, HEU is the national reference university for shipbuilding and ocean engineering — the "three seas and one nuclear" complex: shipbuilding, ocean development, naval applications, and nuclear power engineering. It is a Double First-Class (211-tier) university, less internationally known than HIT but with a niche where its graduates are unusually sought after. Students targeting maritime, ocean, or nuclear engineering in China should shortlist HEU alongside the 985s.',
          },
        ],
      },
      {
        id: 'cost-living',
        h2: 'What it actually costs',
        intro:
          'The regional benchmark is HIT\'s published band — other Northeast cities sit at or below it, with Dalian the mild exception.',
        blocks: [
          {
            type: 'table',
            caption: 'Cost bands in the region (international bachelor\'s, per year)',
            columns: ['Item', 'Band', 'Notes'],
            rows: [
              ['Tuition', '~¥30,000–¥60,000', 'Standard mainland international range; specialist programs can exceed it'],
              ['All-in cost (HIT benchmark)', '~¥45,000–¥75,000', 'Versus ~¥50,000–¥95,000 at coastal flagships'],
              ['Dormitory', '~¥1,200–¥2,500/month', 'University housing is plentiful and heated through winter'],
              ['Food & daily living', '~¥1,200–¥3,000/month', 'Cheapest tier among Chinese university cities'],
              ['City differences', 'Harbin/Changchun cheapest; Shenyang similar; Dalian highest in region', 'Dalian remains below Beijing/Shanghai levels'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The compounding effect: a CSC stipend that feels modest in Shanghai is comfortable in Changchun. When comparing offers, convert every package into local purchasing power, not raw yuan.',
          },
        ],
      },
      {
        id: 'admissions-csca',
        h2: 'Admissions: CSCA, language, and the application calendar',
        intro:
          'The Northeast universities run on the same national rules as the rest of the mainland — CSCA included — with the practical difference that international applicant pools are often smaller.',
        blocks: [
          {
            type: 'ul',
            items: [
              'CSCA: mandatory from the 2026 intake like every mainland bachelor\'s program — engineering combinations typically STEM Chinese + Math + Physics (HIT is the documented example); verify each program\'s specified combination before booking subjects',
              'Chinese-taught programs: HSK 5+ is the typical threshold; NENU\'s Chinese-language pipeline is a natural on-ramp if you arrive below it',
              'English-taught options: growing but thinner than at Beijing/Shanghai flagships — check each program\'s language of instruction before assuming',
              'Deadlines: international admissions windows typically run from winter through spring (December–May pattern) — always verify each university\'s current-cycle dates on its official international-student portal',
              'Practical note: application file requirements are the same national pattern — passport, transcripts, study plan, two recommendation letters, language evidence',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '"Less crowded" is a pattern, not a promise: flagship engineering programs at HIT are competitive everywhere. The realistic advantage shows at the strong-but-not-famous layer — a DUT or NEU admit is typically more reachable than a same-tier Shanghai admit with the same profile.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'Scholarships: the stack stretches further here',
        intro: 'The same three national layers apply, and the provincial layer in the Northeast is well developed.',
        blocks: [
          {
            type: 'ul',
            items: [
              'Chinese Government Scholarship (CSC): tuition waiver, dorm, and a monthly stipend (~¥2,000–3,000) — available at all six universities',
              'Provincial scholarships: Heilongjiang, Jilin, and Liaoning all run provincial government scholarships for international students — HIT\'s stack documents the Heilongjiang layer',
              'Municipal awards: Harbin\'s municipal scholarship is documented on the HIT stack; other major cities in the region run equivalents — verify per university',
              'University scholarships: each of the six runs its own international-student awards, from partial to full tuition',
              'Belt-and-Road funding: HIT in particular carries dedicated awards that overlap with its large Belt-and-Road cohort',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Where the same CSC package in Shanghai covers a frugal life, in Changchun or Harbin it covers a comfortable one — the region effectively multiplies every scholarship yuan. Verify current schemes and amounts on official sources each cycle.',
          },
        ],
      },
      {
        id: 'decision',
        h2: 'Should you choose Northeast China? A three-question check',
        intro: 'The region is not for everyone — answer these honestly.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Is your priority degree quality per yuan, not city fame? If yes, the Northeast is the strongest value trade in the system.',
              'Does your subject match the region\'s strengths — engineering (especially aerospace, chemical, port, metallurgy, naval), vehicles, chemistry, education, Chinese language? If your field is finance or fashion, the region is the wrong tool.',
              'Can you genuinely accept a real winter? Students who thrive in Harbin treat the cold as a feature (ice festival, heating, snow sports); students who resent it transfer south. Be honest with yourself.',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The short version: for an engineering- or education-focused international student working with a budget, the Northeast offers the best quality-to-cost ratio in mainland China — the same 985 degrees, at the lowest living costs, often with more reachable admissions.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Which is the best university in Northeast China?',
        a: 'Harbin Institute of Technology is the region\'s flagship — a 985 engineering university with national-tier strength in aerospace, mechanical, materials, and computer science. Jilin University is the strongest comprehensive option, Dalian UT the best coastal engineering choice, and Harbin Engineering owns the shipbuilding and naval niche.',
      },
      {
        q: 'Are Northeast China universities respected?',
        a: 'Yes — inside China\'s system they carry full national weight: HIT, Jilin, DUT, and NEU are all 985 universities (the elite tier), and NENU and HEU are Double First-Class institutions. The caveat is international name recognition: they are less famous abroad than Beijing or Shanghai flagships, though that is changing as rankings and graduate outcomes spread.',
      },
      {
        q: 'Is Northeast China too cold for international students?',
        a: 'Winters are serious — Harbin and Changchun regularly see lows around or below −20°C — but the cities are built for it: central heating runs through winter, buildings are warm, and Harbin\'s ice festival is a genuine attraction. Dalian on the coast is the mildest city in the region. Students from cold climates adjust easily; students from tropical climates should visit before committing.',
      },
      {
        q: 'How much cheaper is it to study in Northeast China than Beijing or Shanghai?',
        a: 'The benchmark: all-in costs at HIT run ~¥45,000–¥75,000 per year versus ~¥50,000–¥95,000 at coastal flagships — and daily living (food, transport, off-campus housing) is cheaper still in the cheapest tier of Chinese university cities. A CSC stipend that is frugal in Shanghai is comfortable in Changchun.',
      },
      {
        q: 'Do Northeast universities require the CSCA?',
        a: 'Yes. The CSCA is a national requirement for mainland bachelor\'s admission from the 2026 intake, and the Northeast universities are no exception. Engineering combinations typically specify STEM Chinese + Math + Physics (HIT is the documented example) — verify each program\'s combination before booking exam subjects.',
      },
      {
        q: 'Is Northeast China good for learning Chinese?',
        a: 'Very — for a specific reason: fewer international students means fewer English bubbles, and cities like Changchun (home of NENU\'s large Chinese-language programs) offer strong immersion at low cost. The regional dialect is mild and standard Mandarin dominates university environments.',
      },
      {
        q: 'What jobs can I get after studying in Northeast China?',
        a: 'The regional strengths map to real pipelines: aerospace and defense engineering (HIT), automotive (Jilin, in China\'s auto capital), chemicals and ports (DUT), metals and manufacturing (NEU), shipbuilding and nuclear (HEU). Graduates also compete nationally — a 985 degree travels — but the deepest industry networks are regional.',
      },
      {
        q: 'I\'m from Russia / Central Asia / Korea — is the Northeast a good fit?',
        a: 'Often, yes. The region\'s geography and history make it the most natural cultural fit in China for students from Russia, Central Asia, and both Koreas — HIT in particular hosts a large Belt-and-Road international cohort, and dedicated funding lines overlap with that population.',
      },
    ],
    howToSteps: [
      {
        name: 'Match your subject to the region\'s strengths',
        text: 'Shortlist by discipline: aerospace/mechanical/materials → HIT; comprehensive or vehicles/law/chemistry → Jilin; chemical/port/coastal → DUT; metallurgy/automation → NEU; education or Chinese language → NENU; shipbuilding/ocean/nuclear → HEU.',
      },
      {
        name: 'Verify the CSCA combination and language requirements',
        text: 'Check each target program\'s specified CSCA subjects (engineering typically STEM Chinese + Math + Physics) and whether the teaching language is Chinese (HSK 5+ typical) or English — then book your exam subjects and language tests accordingly.',
      },
      {
        name: 'Plan for the climate deliberately',
        text: 'Budget for serious winter gear, choose your city consciously (Dalian mildest, Harbin coldest), and treat the cold as a managed fact — heated dorms and the ice-festival culture make it livable, not just endurable.',
      },
      {
        name: 'Stack the regional scholarships',
        text: 'Nominate across CSC, the provincial layer (Heilongjiang, Jilin, or Liaoning), municipal awards, and each university\'s own scholarships — the stack is deeper than most applicants realize, and each yuan goes further in the region.',
      },
      {
        name: 'Apply through the standard mainland process',
        text: 'Prepare the standard file (passport, transcripts, study plan, two recommendation letters, language evidence) and submit through each university\'s international-student portal within its December–May-style window — verify each university\'s current dates.',
      },
      {
        name: 'Compare offers in local purchasing power',
        text: 'When decisions arrive, convert each package (tuition waivers, stipends, city costs) into what it actually buys in that city — the same stipend can mean "comfortable" in Changchun and "tight" in Shanghai.',
      },
    ],
    ctaTitle: 'Considering Northeast China?',
    ctaSubtitle:
      'SICA counselors match the region\'s universities to your subject and budget, verify every CSCA combination, and build the provincial-scholarship stack that makes the Northeast the best value in mainland China. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/harbin-institute-of-technology',
        label: 'Harbin Institute of Technology profile',
        description: 'The regional flagship — programs, CSCA combinations, scholarships, and costs.',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: 'Cost of living in China by city',
        description: 'City-by-city costs — see where the Northeast sits in the national picture.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The exam every mainland university requires, including the Northeast.',
      },
    ],
  },
  zh: {
    slug: 'best-universities-in-northeast-china',
    eyebrow: '地区指南 · 中国东北',
    title: '中国东北最好的大学 — 以全国最低生活成本，读985层次的学位',
    description:
      '东北最好的大学——哈工大、吉大、大连理工、东北大学、东北师大、哈工程——用最低的生活成本拿到985层次的学位。',
    subtitle:
      '中国东北（辽宁、吉林、黑龙江）是中国高等教育中性价比最高的地区：这里有四所985高校——哈尔滨工业大学、吉林大学、大连理工大学和东北大学——再加上船舶领域的全国标杆（哈尔滨工程大学）和师范教育重镇（东北师范大学），而这些城市的生活成本处于中国大学城市的最低档。由于国际学生的需求集中在北京、上海和南方，这些大学的国际申请池往往不如同层次的沿海旗舰拥挤。本指南排出值得申请的大学、拆解真实成本，并且对冬天保持诚实。',
    stats: [
      { value: '4所', label: '地区内985高校（哈工大、吉大、大连理工、东北大学）' },
      { value: '¥4.5–7.5万', label: '哈工大全年的总成本——地区基准' },
      { value: '−20°C', label: '哈尔滨常见冬季低温——请做好准备' },
      { value: '最低档', label: '中国大学城市中的生活成本档位' },
    ],
    quickAnswer:
      '东北最好的大学包括：哈尔滨工业大学（本地区航空航天与工程旗舰）、吉林大学（中国规模最大的综合性大学之一，车辆、法学、化学、数学见长）、大连理工大学（化工与港口工程，滨海城市）、东北大学（沈阳，冶金、材料、自动化）、东北师范大学（教育学科与最强的中文语言环境之一）以及哈尔滨工程大学（船舶与海洋工程的全国标杆）。与所有内地高校一样，2026级起都要求CSCA。这个地区的交换很简单：985层次的学位+全国最低的生活成本，代价是寒冷的冬天和国际知名度略低的城市。',
    keyTakeaways: [
      '四所985：哈工大（航天/工程）、吉大（综合）、大连理工（化工/港口）、东北大学（冶金/材料/自动化）——与京沪旗舰同属精英层次',
      '两所特色标杆：哈尔滨工程大学（船舶、海洋、海军、核工程）与东北师范大学（教育、中文项目）',
      '生活成本为全国大学城市最低档：哈工大基准全年约¥45,000–¥75,000，沿海旗舰约¥50,000–¥95,000',
      'CSCA照常适用（2026级起）——工科组合通常为理工中文+数学+物理；以各项目要求为准',
      '奖学金纵深：CSC可叠加黑龙江、吉林、辽宁省级奖项、市级奖项（哈尔滨已有记载）与校级奖学金——生活越便宜，每一分钱越经花',
      '诚实的取舍：冬天是真的（哈尔滨常见低于−20°C），城市国际知名度低于京沪——但学位在全国体系中的分量完全相同',
    ],
    sections: [
      {
        id: 'quick-picks',
        h2: '快速选择：东北各校适合谁',
        intro: '如果你已明确方向，从这里开始。每一所都是接收国际学生的双一流大学。',
        blocks: [
          {
            type: 'table',
            caption: '按目标选校',
            columns: ['你的目标', '选择', '原因'],
            rows: [
              ['综合最强/工程旗舰', '哈工大（哈尔滨）', '本地区985领头羊——航天、机械、材料、计算机；哈尔滨、威海、深圳三校区'],
              ['综合学科最全', '吉林大学（长春）', '中国规模最大的综合大学之一——车辆、法学、化学、数学、医学'],
              ['滨海城市+工科', '大连理工（大连）', '化工与港口/海岸工程标杆；大连是本地区气候最温和、最宜居的城市'],
              ['中文沉浸最佳', '东北师范大学（长春）', '全国教育重镇，中文语言项目规模大、历史久'],
              ['特色工科', '哈尔滨工程（哈尔滨）', '船舶、海洋工程、海军装备与核应用的全国标杆'],
              ['工业大城市里的材料/自动化', '东北大学（沈阳）', '冶金与材料传统深厚，自动化强势；地处本地区最大城市'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '另外值得了解：大连海事大学（航海教育标杆）以及辽宁大学、黑龙江大学等省属强校，可满足特定画像的需求。',
          },
        ],
      },
      {
        id: 'why-northeast',
        h2: '为什么选中国东北？',
        intro: '一节讲完地区理由：985层次的质量、体系内最低的生活成本、真实的工程传统，以及通常不如沿海同层次拥挤的申请竞争。',
        blocks: [
          {
            type: 'h3',
            text: '性价比的理由',
            body: '985大学是中国体系的精英层，而东北独有四所。但由于国际学生需求集中在北京、上海、广州和东南沿海，同层次的东北高校评审的国际申请池往往更小、更不拥挤。同样的CSCA分数，在东北能够到的现实录取集合，可能包含在北京属于冲刺档的大学——而入学之后，在生活成本最低的大学城市里，每一元补助或积蓄都更经花。',
          },
          {
            type: 'h3',
            text: '工程的传承',
            body: '东北是二十世纪中国的工业心脏，这里的大学正是为它而建：哈工大围绕航天与国防工程成长，带有鲜明的俄式传统，拥有全国最具国际化色彩的工科学生群体之一；大连理工锚定沿海的化工与港口工程；东北大学脱胎于金属工业；哈尔滨工程承袭军事工程传统并占据船舶领域的制高点。对想要深度而非名城的工科学生来说，这里是北京之外传承性工程学科最密集的地方。',
          },
          {
            type: 'h3',
            text: '诚实的代价',
            body: '冬天是认真的：哈尔滨和长春常见低温在−20°C左右或以下，不过建筑供暖充足、城市本身为此而建（沿海的大连最温和）。日常英语环境比京沪薄。而且这些城市的国际知名度较低——这影响的是回国后的名字辨识度，而不是学位在中国体系内的分量。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对合适的申请者的额外加分：地区毗邻俄罗斯与朝鲜半岛，塑造了这里的经济与语言环境——哈工大的国际学生中有庞大的"一带一路"群体，来自俄罗斯、中亚和韩国的申请者常觉得东北是中国最自然的文化契合地。',
          },
        ],
      },
      {
        id: 'the-list',
        h2: '值得列入短名单的六所大学',
        intro: '地区院校速览，实力优先。全部为双一流，其中四所是985。',
        blocks: [
          {
            type: 'h3',
            text: '1. 哈尔滨工业大学（哈工大）——地区旗舰',
            body: '1920年以中俄工业学校建校，哈工大是中国顶尖的工科大学——航天、机械、材料、计算机、自动化、电气——拥有三个校区（哈尔滨本部、威海、深圳）和全国最具国际化色彩的工科群体之一，以庞大的"一带一路"学生群体为中坚。工科CSCA组合为理工中文+数学+物理。国际本科学费约¥30,000–¥60,000，全年总成本约¥45,000–¥75,000；奖学金体系包括CSC、校级奖项、黑龙江省与哈尔滨市级奖学金以及"一带一路"专项资助。',
          },
          {
            type: 'h3',
            text: '2. 吉林大学（吉大）——规模化综合广度',
            body: '坐落长春、1946年建校，吉林大学按任何口径都是中国最大的综合性大学之一——车辆工程（地处中国汽车工业之都）、法学、化学（全国顶尖传统）、数学、医学与人文学科在同一所大学里。想要985层次的综合大学体验+东北价格的国际学生，吉大是地区的默认选项。学费请按项目核实；学校体量大，各学院标准不一。',
          },
          {
            type: 'h3',
            text: '3. 大连理工大学（大连理工）——沿海工科',
            body: '1949年建校，坐落于大连——本地区气候最温和、最宜居的滨海城市——大连理工是985工科大学，化学工程、港口与海岸工程（全国标杆）、机械工程及船舶相关领域实力深厚，大连的软件产业也为计算机学科提供了增长土壤。想要东北的性价比、又不想要最深寒冬的学生，大连理工是自然之选。',
          },
          {
            type: 'h3',
            text: '4. 东北大学——沈阳的金属、材料与自动化',
            body: '1923年建校于沈阳（本地区最大城市），东北大学是身份源于建造东北的金属与重工业的985大学：冶金与材料仍是标杆学科，辅以强势的自动化、计算机与软件工程。沈阳的生活成本处于地区低位，城市的工业基础让制造与材料方向的实习格外便利。',
          },
          {
            type: 'h3',
            text: '5. 东北师范大学——教育与中文',
            body: '1946年建校于长春，东北师范大学是中国六所部属师范大学之一、双一流高校。对国际学生它有两个意义：教育与人文项目领先区域，而其国际中文教育项目规模大、历史久、组织成熟——无论是攻读教育学科，还是在学位之前（或同时）打好中文基础，东北师大都是全国最好的环境之一。',
          },
          {
            type: 'h3',
            text: '6. 哈尔滨工程大学——船舶领域的制高点',
            body: '1953年承袭军事工程传统建校于哈尔滨，哈尔滨工程大学是船舶与海洋工程的全国标杆——"三海一核"：船舶工业、海洋开发、海军装备与核动力工程。双一流（211层次）高校，国际知名度不及哈工大，但其在船舶领域的毕业生极为抢手。目标是海事、海洋或核工程的学生，应把哈工程与985一起列入短名单。',
          },
        ],
      },
      {
        id: 'cost-living',
        h2: '实际花费',
        intro: '地区基准是哈工大公布的区间——其他东北城市持平或更低，温和的大连是例外。',
        blocks: [
          {
            type: 'table',
            caption: '地区成本区间（国际本科生，每年）',
            columns: ['项目', '区间', '说明'],
            rows: [
              ['学费', '约¥30,000–¥60,000', '内地国际生标准区间；特殊项目可能上浮'],
              ['全年总成本（哈工大基准）', '约¥45,000–¥75,000', '沿海旗舰约¥50,000–¥95,000'],
              ['宿舍', '约¥1,200–¥2,500/月', '校内房源充足，冬季全程供暖'],
              ['伙食与日常', '约¥1,200–¥3,000/月', '中国大学城市最低档'],
              ['城市差异', '哈尔滨/长春最低；沈阳相近；大连地区最高', '大连仍低于京沪水平'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '复利效应：在上海捉襟见肘的CSC补助，在长春是舒适的。比较录取结果时，请把每个套餐换算成当地购买力，而不是名义金额。',
          },
        ],
      },
      {
        id: 'admissions-csca',
        h2: '录取：CSCA、语言与申请日历',
        intro: '东北高校执行与全国相同的规则——包括CSCA——实际差异是国际申请池往往更小。',
        blocks: [
          {
            type: 'ul',
            items: [
              'CSCA：与所有内地本科一样，2026级起强制——工科组合通常为理工中文+数学+物理（哈工大为有据可查的示例）；报考科目前往项目官页核对指定组合',
              '中文授课项目：典型门槛HSK 5级以上；若入学时未达标，东北师大的中文项目是自然的衔接通道',
              '英文授课选择：在增长但比京沪旗舰薄——申请前逐项确认项目的授课语言',
              '截止日期：国际招生窗口通常从冬季跨到春季（12–5月模式）——当季日期务必以各校国际学生门户为准',
              '实操提示：材料清单是全国统一模式——护照、成绩单、学习计划、两封推荐信、语言证明',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '"不拥挤"是规律而非承诺：哈工大的旗舰工科在任何地方都有竞争。真实的优势体现在强而不名的层次——同样的背景，大连理工或东北大学的录取通常比同层次上海高校更可及。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: '奖学金：在这里叠得更厚',
        intro: '全国三层体系照常适用，而且东北的省级层相当发达。',
        blocks: [
          {
            type: 'ul',
            items: [
              '中国政府奖学金（CSC）：学费减免、住宿加每月补助（约¥2,000–3,000）——六所大学全部开放',
              '省级奖学金：黑龙江、吉林、辽宁均设有面向国际学生的省政府奖学金——哈工大的奖学金体系记载了黑龙江层',
              '市级奖项：哈尔滨市级奖学金见于哈工大的叠加体系；地区其他大城市也有同类——以各校为准',
              '校级奖学金：六所大学都设有自己的国际学生奖项，从部分到全额学费不等',
              '"一带一路"资助：哈工大尤其设有与庞大"一带一路"群体对应的专项奖项',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '同样的CSC套餐在上海够节俭地生活，在长春或哈尔滨则够舒适地生活——这个地区实际上放大了每一元奖学金。每个申请季请以官方来源核实最新计划与金额。',
          },
        ],
      },
      {
        id: 'decision',
        h2: '该选东北吗？三问自检',
        intro: '这个地区不适合所有人——请诚实地回答这三个问题。',
        blocks: [
          {
            type: 'ol',
            items: [
              '你的优先级是"每元的学位质量"而不是城市名气吗？如果是，东北是全体系最强的性价比交换。',
              '你的专业与地区强项匹配吗——工程（尤其航天、化工、港口、冶金、船舶）、车辆、化学、教育、中文？如果你的方向是金融或时尚，这个地区是错的工具。',
              '你能真正接受一个真正的冬天吗？在哈尔滨如鱼得水的学生把寒冷当特色（冰雪节、暖气、雪上运动）；怨冬的学生会往南转学。对自己诚实。',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '简短版：对预算有限、以工程或教育为方向的国际学生，东北提供中国大陆最好的质量成本比——同样的985学位、最低的生活成本、往往更可及的录取。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国东北最好的大学是哪所？',
        a: '哈尔滨工业大学是地区旗舰——985工科大学，在航天、机械、材料与计算机领域具有全国层次实力。吉林大学是最强的综合选择，大连理工是最佳沿海工科选择，哈尔滨工程大学占据船舶与海军领域的制高点。',
      },
      {
        q: '东北的大学受认可吗？',
        a: '受认可——在中国体系内它们具有完整的全国分量：哈工大、吉大、大连理工、东北大学均为985大学（精英层），东北师大与哈工程为双一流高校。需要注意的是国际知名度：它们在海外的名气不如京沪旗舰，但随着排名与毕业生去向的传播，这一差距在缩小。',
      },
      {
        q: '东北对国际学生来说太冷了吗？',
        a: '冬天是认真的——哈尔滨和长春常见低温在−20°C左右或以下——但城市为此而建：冬季全程集中供暖，室内温暖，哈尔滨冰雪节是真正的吸引力。沿海的大连是本地区最温和的城市。寒冷地区的学生适应容易；热带地区的学生最好先实地看看再决定。',
      },
      {
        q: '在东北读书比北京上海便宜多少？',
        a: '基准：哈工大全年的总成本约¥45,000–¥75,000，沿海旗舰约¥50,000–¥95,000——而在生活最低档的大学城市里，日常开销（伙食、交通、校外住宿）还要更便宜。在上海捉襟见肘的CSC补助，在长春是舒适的。',
      },
      {
        q: '东北的大学要求CSCA吗？',
        a: '要求。CSCA是2026级起内地本科的全国性要求，东北高校也不例外。工科组合通常为理工中文+数学+物理（哈工大为有据可查的示例）——报考科目前往项目官页核对。',
      },
      {
        q: '东北适合学中文吗？',
        a: '非常适合——原因很具体：国际学生少意味着英语气泡少，而长春（东北师大大型中文项目所在地）这类城市能以低成本提供强沉浸。地区方言较轻，大学环境以标准普通话为主。',
      },
      {
        q: '在东北读完能找什么工作？',
        a: '地区强项对应真实的管道：航天与国防工程（哈工大）、汽车（吉大，地处中国汽车之都）、化工与港口（大连理工）、金属与制造（东北大学）、船舶与核（哈工程）。毕业生也在全国范围竞争——985学位是全国通行的——但最深的产业网络在区域内部。',
      },
      {
        q: '我来自俄罗斯/中亚/韩国——东北合适吗？',
        a: '通常很合适。地区的地理与历史使它成为来自俄罗斯、中亚和朝鲜半岛学生在中国最自然的文化契合地——哈工大尤其拥有庞大的"一带一路"国际群体，且有与之对应的专项资助渠道。',
      },
    ],
    howToSteps: [
      {
        name: '把专业匹配到地区强项',
        text: '按学科列短名单：航天/机械/材料→哈工大；综合或车辆/法学/化学→吉大；化工/港口/海岸→大连理工；冶金/自动化→东北大学；教育或中文→东北师大；船舶/海洋/核→哈工程。',
      },
      {
        name: '核对CSCA组合与语言要求',
        text: '查询每个目标项目指定的CSCA科目（工科通常为理工中文+数学+物理）以及授课语言是中文（典型HSK 5+）还是英语——再据此报考科目与语言考试。',
      },
      {
        name: '认真规划气候',
        text: '把认真的冬季装备列入预算，有意识地选城市（大连最温和，哈尔滨最冷），把寒冷当作可管理的事实——供暖充足的宿舍与冰雪文化让它可居，而不仅可忍。',
      },
      {
        name: '叠加地区奖学金',
        text: '在CSC、省级层（黑龙江/吉林/辽宁）、市级奖项与各校奖学金之间提名——这个体系比多数申请者以为的更厚，而且在东北每一元都更经花。',
      },
      {
        name: '走标准内地申请流程',
        text: '按全国模式备料（护照、成绩单、学习计划、两封推荐信、语言证明），在各校国际学生门户的12–5月式窗口内提交——当季日期以各校为准。',
      },
      {
        name: '按当地购买力比较录取',
        text: '放榜后把每个套餐（学费减免、补助、城市成本）换算成它在那座城市实际能买到什么——同样的补助，在长春可能是"舒适"，在上海可能是"紧张"。',
      },
    ],
    ctaTitle: '正在考虑中国东北？',
    ctaSubtitle:
      'SICA顾问把东北的高校匹配到你的专业与预算，核验每一项CSCA组合，并搭好让东北成为大陆最佳性价比的省级奖学金体系。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/harbin-institute-of-technology',
        label: '哈尔滨工业大学主页',
        description: '地区旗舰——项目、CSCA组合、奖学金与费用。',
      },
      {
        href: '/cost-of-living-china-by-city',
        label: '中国各城市生活成本',
        description: '逐城成本——看东北在全国版图中的位置。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA考试完全指南',
        description: '包括东北在内每所内地大学都要求的考试。',
      },
    ],
  },
};
