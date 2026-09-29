import type { LocalizedGuide } from './types';

/**
 * "Best Universities in Hong Kong for International Students" —
 * regional/comparison article #3 of 4
 * (docs/regional-comparisons-4-article-plan.md). Target queries:
 * "best universities in hong kong for international students",
 * "hong kong vs mainland china universities", "study in hong kong
 * requirements", "hku vs cuhk vs hkust".
 *
 * Static listicle + system explainer. Hong Kong is a SEPARATE
 * admissions jurisdiction from mainland China: no CSCA, no CSC
 * scholarship, direct application per university on international
 * qualifications, earlier deadlines (Sep–Nov main rounds). The page
 * states this explicitly and closes with a mainland-vs-HK decision
 * table that routes budget-sensitive readers back to the mainland
 * funnel (CSCA + CSC + lower tuition). All HK figures carry
 * verify-qualifiers per the no-invented-numbers rule.
 */
export const bestUniversitiesInHongKongGuide: LocalizedGuide = {
  en: {
    slug: 'best-universities-in-hong-kong',
    eyebrow: 'REGIONAL GUIDE · HONG KONG',
    title: 'Best Universities in Hong Kong for International Students — and How HK Admissions Differ From Mainland China',
    description:
      'The top Hong Kong universities for international students — HKU, CUHK, HKUST, PolyU, CityU, HKBU — plus how HK admissions differ from the mainland: no CSCA, direct application.',
    subtitle:
      'Hong Kong appears on almost every "study in China" shortlist, but it is a separate admissions jurisdiction from the mainland: different application system, different exam requirements (none of the mainland\'s CSCA), different deadlines (fall rounds, not spring), and a different price level. This guide ranks the universities worth applying to, explains exactly how the Hong Kong system works for international students, and closes with an honest mainland-vs-Hong-Kong decision table — because for many applicants the right answer is a mainland university with a full scholarship, and for others it is Hong Kong\'s English-medium, finance-hub campus life.',
    stats: [
      { value: '8', label: 'Government-funded universities in HK' },
      { value: 'Sep–Nov', label: 'Main-round application deadlines' },
      { value: 'HK$145k–218k', label: 'Typical non-local tuition per year (verify per university)' },
      { value: 'No CSCA', label: 'Hong Kong runs its own admissions system' },
    ],
    quickAnswer:
      'The best universities in Hong Kong for international students are the University of Hong Kong (HKU, the comprehensive flagship), the Chinese University of Hong Kong (CUHK, bilingual with a collegiate system), and HKUST (science, engineering, and business) — followed by PolyU, CityU, and HKBU for applied sciences, professional programs, and communication. Hong Kong is a separate admissions jurisdiction from mainland China: there is no CSCA requirement, no CSC scholarship, and you apply directly to each university on international qualifications (A-Levels, IB, SAT/AP, or your national curriculum), with main-round deadlines typically September–November — earlier than the mainland\'s spring windows. Tuition for non-local students typically runs HK$145,000–218,000 per year (verify per university and program), which is several times the mainland\'s international rate.',
    keyTakeaways: [
      'Top tier: HKU (comprehensive flagship), CUHK (bilingual, collegiate), HKUST (science/engineering/business) — all English-medium and internationally ranked',
      'Strong second tier: PolyU (applied sciences, hospitality, design), CityU (professional programs), HKBU (communication, Chinese medicine, business)',
      'Hong Kong is a separate admissions jurisdiction: no CSCA, no CSC scholarship, no HSK requirement — direct application to each university on A-Levels / IB / SAT / national curricula',
      'The calendar is reversed: HK main rounds close September–November; mainland windows run December–May — so you can apply to Hong Kong first and still apply to mainland universities afterwards',
      'Cost is the headline difference: non-local HK tuition typically HK$145,000–218,000/year versus ~¥30,000–¥60,000 on the mainland — mainland plus a CSC scholarship can be fully funded',
      'English is the default teaching language in HK; the wider environment is Cantonese + English, not Mandarin',
    ],
    sections: [
      {
        id: 'quick-picks',
        h2: 'Quick picks: which Hong Kong university for what',
        intro: 'If you already know your direction, start here. Every pick is a government-funded university open to international applicants.',
        blocks: [
          {
            type: 'table',
            caption: 'Best university by goal',
            columns: ['Your goal', 'Pick', 'Why'],
            rows: [
              ['Best overall / classic flagship', 'HKU', 'Hong Kong\'s oldest and most comprehensive university — medicine, law, business, arts'],
              ['Best for engineering & science', 'HKUST', 'Research-intensive, world-ranked in engineering and science despite being founded in 1991'],
              ['Best bilingual + Chinese studies', 'CUHK', 'The only fundamentally bilingual university; collegiate system; strong Chinese studies'],
              ['Best applied / professional', 'PolyU', 'Hospitality, design, engineering, health sciences — industry-embedded programs'],
              ['Best professional programs in the city core', 'CityU', 'Business, engineering, data science, veterinary medicine; central Kowloon campus'],
              ['Best communication & liberal arts mix', 'HKBU', 'Communication, Chinese medicine, business; the most "liberal-arts college" feel of the big six'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Also worth knowing: Lingnan University (a small liberal-arts college) and the Education University of Hong Kong (teacher education) complete the eight government-funded universities — both admit international students and suit specific profiles.',
          },
        ],
      },
      {
        id: 'the-list',
        h2: 'The six universities international students actually choose between',
        intro:
          'Short profiles of the big six. All teach primarily in English, all are internationally ranked, and all charge non-local tuition in roughly the same band.',
        blocks: [
          {
            type: 'h3',
            text: '1. University of Hong Kong (HKU) — the comprehensive flagship',
            body: 'Founded in 1911, HKU is Hong Kong\'s oldest university and its classic flagship: medicine, law, business, architecture, and the arts all carry top regional standing, and its medical faculty is the territory\'s reference school. The main campus sits on Mid-Levels above Central. International students make up a substantial share of each cohort, and admissions weigh international qualifications (A-Levels, IB, SAT/AP) plus interviews for competitive programs such as medicine.',
          },
          {
            type: 'h3',
            text: '2. Chinese University of Hong Kong (CUHK) — bilingual and collegiate',
            body: 'Founded in 1963, CUHK is the only Hong Kong university that is genuinely bilingual — English and Chinese (both Cantonese and Mandarin) appear in official life — and the only one with an Oxford-style collegiate system. Its hillside campus above Shatin is the territory\'s largest and greenest. Strengths: medicine, business, engineering, education, and one of the world\'s great Chinese studies traditions. International students who want their Chinese to improve alongside an English-medium degree often choose CUHK.',
          },
          {
            type: 'h3',
            text: '3. Hong Kong University of Science and Technology (HKUST) — science, engineering, business',
            body: 'Founded in 1991 on a spectacular Clear Water Bay campus, HKUST built world-ranked engineering, science, and business programs in a single generation and is routinely cited among the world\'s best young universities. It is research-intensive, intensely international, and heavily recruited by technology and finance employers across Asia. The profile suits applicants who know they want STEM or business and want an English-medium environment with strong industry pipelines.',
          },
          {
            type: 'h3',
            text: '4. Polytechnic University (PolyU) — applied and industry-embedded',
            body: 'With roots back to 1937, PolyU is Hong Kong\'s applied-sciences university: hospitality and tourism (one of the world\'s reference programs), design, engineering, rehabilitation and health sciences, and surveying. Programs embed internships and industry projects as a structural feature rather than an add-on. For students who want a professionally-shaped degree rather than a purely academic one, PolyU is the natural pick.',
          },
          {
            type: 'h3',
            text: '5. City University of Hong Kong (CityU) — professional programs in the city core',
            body: 'Founded as a polytechnic in 1984 and granted university status in 1994, CityU has grown into a comprehensive professional university in Kowloon Tong: business, engineering, data science, energy, and veterinary medicine (through its Jockey Club college). Its central location makes part-time work and internships across the harbor unusually practical.',
          },
          {
            type: 'h3',
            text: '6. Hong Kong Baptist University (HKBU) — communication, Chinese medicine, liberal arts',
            body: 'With roots back to 1956, HKBU is the most liberal-arts-flavored of the big six. Its School of Communication is one of Asia\'s best-known, its Chinese medicine school is a regional reference, and its business school carries strong accreditation. The compact Kowloon Tong campus suits students who want a smaller-community feel inside a big city.',
          },
        ],
      },
      {
        id: 'how-hk-admissions-differ',
        h2: 'How Hong Kong admissions differ from mainland China',
        intro:
          'This is the section most "study in China" advice gets wrong. Hong Kong is not part of the mainland system — the applications share nothing except the word "China".',
        blocks: [
          {
            type: 'table',
            caption: 'Two systems, side by side',
            columns: ['Dimension', 'Mainland China', 'Hong Kong'],
            rows: [
              ['Admissions exam', 'CSCA required for bachelor\'s from the 2026 intake (plus HSK for Chinese-taught programs)', 'No CSCA, no HSK — admission on your existing qualifications'],
              ['Qualifications used', 'CSCA subjects + transcripts', 'A-Levels, IB, SAT/AP, or national curricula, case by case'],
              ['How to apply', 'University international-student portals (e.g., studyatpku.com)', 'Directly to each university\'s own admissions portal'],
              ['Main deadlines', 'Mostly December–May (varies by university)', 'Main rounds typically September–November of the preceding year'],
              ['Language of instruction', 'Chinese-taught or English-taught tracks', 'Predominantly English'],
              ['Scholarship system', 'CSC (full funding), university scholarships, provincial/municipal awards', 'Mostly university entrance scholarships; no CSC'],
              ['Non-local tuition (bachelor\'s)', '~¥30,000–¥60,000/year', 'Typically ~HK$145,000–218,000/year (verify per university)'],
              ['Student visa', 'X1/X2 visa via the university', 'Student visa via the university as local sponsor'],
            ],
          },
          {
            type: 'ul',
            items: [
              'Apply to each Hong Kong university separately — there is no centralized application system for international applicants',
              'English evidence (IELTS/TOEFL or English-medium schooling) is typically expected; typical bands are IELTS 6.0–6.5 or TOEFL iBT ~80–93 depending on program — verify per program',
              'Competitive programs (medicine most famously) add interviews, often in a multiple-mini-interview format',
              'Later application rounds sometimes run into winter and spring, but the funded scholarship consideration is usually tied to the main round — apply in September–November',
              'All dates and fees above are typical patterns; confirm current-cycle figures on each university\'s official admissions pages',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The calendar asymmetry works in your favor: Hong Kong\'s main rounds close September–November, BEFORE the mainland\'s December–May windows open in earnest. You can apply to Hong Kong in the fall, hold the results, and still apply to mainland universities in the spring — the two systems never conflict.',
          },
        ],
      },
      {
        id: 'mainland-vs-hong-kong',
        h2: 'Mainland China vs Hong Kong: the honest decision table',
        intro:
          'Both routes lead to internationally recognized degrees. The right answer is mostly a function of budget, language goals, and career geography.',
        blocks: [
          {
            type: 'table',
            caption: 'Mainland vs Hong Kong for international students',
            columns: ['Dimension', 'Mainland China', 'Hong Kong'],
            rows: [
              ['Annual tuition (intl. bachelor\'s)', '~¥30,000–¥60,000 (≈HK$33,000–66,000)', 'Typically ~HK$145,000–218,000'],
              ['Full-funding path', 'CSC + provincial/municipal scholarships can cover tuition, dorm, and stipend', 'Rare at bachelor\'s level — mostly partial entrance scholarships'],
              ['Exam to prepare', 'CSCA (+ HSK for Chinese-taught)', 'None beyond your school qualifications'],
              ['Language environment', 'Mandarin immersion (or English-taught bubble)', 'Cantonese + English; Mandarin useful but secondary'],
              ['Chinese-language outcome', 'Strongest possible — daily-life Mandarin', 'Moderate — campus English dilutes immersion'],
              ['Career geography', 'The mainland economy + Chinese fluency: tech, manufacturing, trade, academia', 'HK finance hub + common-law system; gateway roles for Greater Bay Area'],
              ['Cost of living', '¥1,500–¥4,000/month depending on city', 'Among the world\'s priciest housing; budget substantially more'],
              ['Application timing', 'December–May', 'September–November (main round)'],
            ],
          },
          {
            type: 'ul',
            items: [
              'Choose the mainland if: budget matters, you want real Mandarin fluency, you are aiming for CSC full funding, or your target universities (Tsinghua, PKU, Fudan, and the rest of the C9) outrank the HK set in your field',
              'Choose Hong Kong if: the budget is manageable, you want an English-medium common-law international city, or your career target is HK finance or a Greater Bay Area gateway role',
              'Choose both if: you can run two applications — HK in the fall, mainland in the spring — and compare real offers side by side',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For most cost-sensitive applicants the conclusion is blunt: a CSC scholarship at a strong mainland university (full tuition, dorm, and a monthly stipend) against full-price Hong Kong tuition is not a close comparison. Hong Kong wins on environment and finance access; the mainland wins on cost by a factor that changes lives.',
          },
        ],
      },
      {
        id: 'hk-scholarships',
        h2: 'Paying for Hong Kong: scholarships and the self-funding reality',
        intro:
          'Hong Kong has no equivalent of the CSC. What exists is a layer of university entrance scholarships and, at research level, government fellowship schemes.',
        blocks: [
          {
            type: 'ul',
            items: [
              'University entrance scholarships: each of the big six awards merit scholarships to admitted international students — some consider you automatically with your application, others require a separate form; amounts range from partial tuition to (rarely) full coverage',
              'The Hong Kong PhD Fellowship Scheme: a well-funded government scheme for research postgraduate students of any nationality — generous stipend plus conference allowance; not applicable at bachelor\'s level',
              'Program-specific awards: business schools and engineering faculties often hold donor-funded awards for international students',
              'The realistic baseline: most international bachelor\'s students at HK universities are self- or family-funded; treat any scholarship as a bonus, not a plan',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Contrast with the mainland: the CSC alone waives tuition, provides a dorm place, and pays a monthly stipend (~¥2,000–3,000), and it stacks with university and municipal awards. If funding is the deciding constraint, the mainland route is structurally more generous — verify current schemes on official sources each cycle.',
          },
        ],
      },
      {
        id: 'decision',
        h2: 'Putting it together: a four-step plan',
        intro:
          'The smart play uses the calendar asymmetry: run the Hong Kong and mainland applications as one sequenced season.',
        blocks: [
          {
            type: 'ol',
            items: [
              'Decide your priority by budget and language goals — if cost is decisive, weight the mainland and CSC; if an English-medium finance-hub environment is decisive, weight Hong Kong',
              'Shortlist two or three HK universities by subject fit (the quick-picks table above) and check their current-cycle deadlines in August–September',
              'Submit HK applications in September–November with your school qualifications and English evidence',
              'Whatever the HK outcome, prepare the mainland applications in parallel — CSCA subjects, HSK if needed, transcripts, recommendations — and file them across the December–May windows',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'The final comparison happens when real offers are on the table: an HK admission at full price versus a mainland offer with a scholarship attached is a genuinely personal decision — but only an applicant who ran both tracks gets to make it.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Do Hong Kong universities require the CSCA?',
        a: 'No. The CSCA is a mainland-China admissions requirement for bachelor\'s applicants from the 2026 intake. Hong Kong is a separate admissions jurisdiction — its universities admit international students directly on school qualifications such as A-Levels, the IB, or SAT/AP, with no separate entrance exam.',
      },
      {
        q: 'Which is the best university in Hong Kong?',
        a: 'HKU is the classic comprehensive flagship (medicine, law, business, arts); HKUST is the research-intensive pick for engineering, science, and business; CUHK is the bilingual, collegiate alternative with exceptional Chinese studies. All three sit at the top of Hong Kong\'s system — choose by subject fit and campus environment.',
      },
      {
        q: 'How much does it cost to study in Hong Kong as an international student?',
        a: 'Non-local bachelor\'s tuition typically runs HK$145,000–218,000 per year depending on the university and program, with living costs on top in one of the world\'s most expensive housing markets. This is several times the mainland\'s international tuition rate (~¥30,000–¥60,000/year). Verify current figures on each university\'s official page.',
      },
      {
        q: 'Can mainland scholarships (CSC) be used at Hong Kong universities?',
        a: 'No. The Chinese Government Scholarship (CSC) applies to mainland universities. Hong Kong has its own, thinner scholarship layer: mostly university entrance scholarships for bachelor\'s students and the Hong Kong PhD Fellowship Scheme at research level. Budget assuming you will self-fund, and treat any award as a bonus.',
      },
      {
        q: 'When do Hong Kong university applications open and close?',
        a: 'Main-round applications for the following year\'s intake typically run from around September to November, with later rounds sometimes extending into winter and spring. This is earlier than the mainland\'s December–May windows, so applicants can complete their HK applications first and then apply to mainland universities in the same season.',
      },
      {
        q: 'Is studying in Hong Kong a good way to learn Chinese?',
        a: 'It builds reading and listening, but daily life runs on Cantonese and English, so Mandarin immersion is weaker than on the mainland. Applicants whose primary goal is Mandarin fluency usually do better at a mainland university — possibly in Shanghai or Beijing — where the environment enforces the language.',
      },
      {
        q: 'Do I need IELTS or TOEFL for Hong Kong universities?',
        a: 'Usually, unless your schooling was in English. Typical expectation is around IELTS 6.0–6.5 or TOEFL iBT 80–93 depending on the program, with higher bands for competitive programs. Each university sets its own requirements — check the specific program page.',
      },
      {
        q: 'Which is better for a finance career: Hong Kong or a mainland university?',
        a: 'For Hong Kong-based finance roles, HK universities (HKU, CUHK, HKUST business schools) have the home advantage and the internship pipeline. For mainland-market finance and Greater Bay Area roles, a top mainland university (Fudan, SJTU, PKU, Tsinghua) plus Mandarin fluency is increasingly the differentiator. Both routes work; they point at different versions of the career.',
      },
    ],
    howToSteps: [
      {
        name: 'Set your priority: cost or environment',
        text: 'Decide up front whether budget (pointing to the mainland and CSC full funding) or an English-medium Hong Kong environment (pointing to the big six) is the decisive factor — every later choice follows from this.',
      },
      {
        name: 'Shortlist by subject fit',
        text: 'Pick two or three universities from the big six using the quick-picks mapping (HKU comprehensive, HKUST engineering/science, CUHK bilingual, PolyU applied, CityU professional, HKBU communication).',
      },
      {
        name: 'Check deadlines in August–September',
        text: 'Hong Kong main rounds typically close September–November; funded scholarship consideration is usually tied to the main round, so confirm each university\'s current-cycle dates as soon as they publish.',
      },
      {
        name: 'Prepare qualifications and English evidence',
        text: 'Assemble your school qualifications (A-Levels, IB, SAT/AP, or national curriculum transcripts) and an accepted English test score (typically IELTS 6.0–6.5 / TOEFL iBT 80–93 — verify per program).',
      },
      {
        name: 'Submit HK applications in the fall',
        text: 'Apply directly to each shortlisted university\'s own portal — there is no centralized system — and prepare for possible interviews if you are targeting competitive programs like medicine.',
      },
      {
        name: 'Run the mainland track in parallel',
        text: 'Whatever the HK outcome, book CSCA subjects, prepare transcripts and recommendations, and file mainland applications across the December–May windows — then compare real offers, with scholarships attached, side by side.',
      },
    ],
    ctaTitle: 'Hong Kong or the mainland?',
    ctaSubtitle:
      'SICA counselors compare both routes against your budget and goals — and if the mainland wins, we handle the full package: CSCA combinations, scholarship stacking, and program selection. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'The mainland counterpart list — the flagship universities HK applicants should compare against.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The mainland exam you skip in Hong Kong — and need if you apply to the mainland.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'The full-funding route that makes the mainland the budget answer.',
      },
    ],
  },
  zh: {
    slug: 'best-universities-in-hong-kong',
    eyebrow: '地区指南 · 香港',
    title: '香港最好的大学 — 国际学生择校指南，以及香港与内地申请体系的区别',
    description:
      '国际学生最值得申请的香港高校——港大、中大、科大、理大、城大、浸会——以及香港与内地申请体系的完整区别：无需CSCA、直接申请。',
    subtitle:
      '几乎每份"留学中国"的名单上都有香港，但它是一个独立于内地的招生体系：申请系统不同、考试要求不同（没有内地的CSCA）、截止日期不同（秋季轮次而非春季）、价格水平也不同。本指南列出值得申请的香港高校，讲清楚香港体系对国际学生究竟如何运作，最后附上一张诚实的"内地 vs 香港"决策表——因为对很多申请者来说，正确答案是拿全额奖学金读内地大学；而对另一些人，答案是香港的英语授课与金融中心城市生活。',
    stats: [
      { value: '8所', label: '香港政府资助大学' },
      { value: '9–11月', label: '主轮申请截止日期' },
      { value: 'HK$14.5–21.8万', label: '非本地生学费/年（以各校为准）' },
      { value: '免CSCA', label: '香港实行独立招生体系' },
    ],
    quickAnswer:
      '国际学生最值得申请的香港高校是香港大学（港大，综合旗舰）、香港中文大学（中大，双语书院制）和香港科技大学（科大，理科、工科与商科），其次是理工大学（应用科学）、城市大学（专业学科）和浸会大学（传理与博雅）。香港是独立于内地的招生体系：不要求CSCA、没有CSC奖学金，凭现有学历资格（A-Level、IB、SAT/AP或本国课程）直接向各校申请，主轮截止通常在9月至11月——早于内地的春季窗口。非本地生学费通常为每年HK$145,000–218,000（以各校与项目为准），是内地国际生费率的数倍。',
    keyTakeaways: [
      '第一梯队：港大（综合旗舰）、中大（双语、书院制）、科大（理工与商科）——全英语授课、国际排名高',
      '强势第二梯队：理大（应用科学、酒店、设计）、城大（专业学科）、浸大（传理、中医、商科）',
      '香港是独立招生体系：无CSCA、无CSC奖学金、无HSK要求——凭A-Level/IB/SAT/本国课程直接申请各校',
      '日历正好相反：香港主轮9–11月截止；内地窗口12–5月——可以先申香港，之后照常申内地',
      '成本是头号差异：香港非本地学费通常HK$145,000–218,000/年，内地约¥30,000–¥60,000/年——内地+CSC奖学金可实现全额资助',
      '香港默认英语授课；城市大环境是粤语+英语，而不是普通话',
    ],
    sections: [
      {
        id: 'quick-picks',
        h2: '快速选择：不同目标选哪所港校',
        intro: '如果你已经明确方向，从这里开始。每一项都是开放国际申请的政府资助大学。',
        blocks: [
          {
            type: 'table',
            caption: '按目标选校',
            columns: ['你的目标', '选择', '原因'],
            rows: [
              ['综合最强/经典旗舰', '港大', '香港历史最久、学科最全的大学——医学、法律、商科、文科'],
              ['工程与理科最强', '科大', '研究密集型；1991年建校却在工程与科学上位列世界排名前列'],
              ['双语+中国研究', '中大', '唯一真正双语的大学；书院制；中国研究传统深厚'],
              ['应用与专业学科', '理大', '酒店、设计、工程、健康科学——课程嵌入产业'],
              ['市中心的专业学科', '城大', '商科、工程、数据科学、兽医；九龙塘核心校区'],
              ['传理与博雅兼顾', '浸大', '传理、中医、商科；六大中最有"文理学院"气质'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '另外两所：岭南大学（小型博雅学院）与香港教育大学（师范教育）共同构成八所政府资助大学——两校都招收国际学生，适合特定画像的申请者。',
          },
        ],
      },
      {
        id: 'the-list',
        h2: '国际学生真正在比较的六所大学',
        intro: '六大高校速览。全部以英语为主要授课语言，全部位列国际排名，非本地学费也都在相近区间。',
        blocks: [
          {
            type: 'h3',
            text: '1. 香港大学（港大）——综合旗舰',
            body: '港大1911年建校，是香港历史最悠久的大学，也是经典旗舰：医学、法律、商科、建筑与文科在区域内都处于顶尖水平，医学院更是全港的标杆院系。主校园位于中环上方半山。国际学生占每届相当比例，录取审读国际课程成绩（A-Level、IB、SAT/AP），竞争项目（以医学最为著名）另有面试。',
          },
          {
            type: 'h3',
            text: '2. 香港中文大学（中大）——双语与书院制',
            body: '中大1963年建校，是香港唯一真正双语的大学——官方生活中英语与中文（粤语和普通话）并存——也是唯一实行牛津式书院制的港校。沙田山上的校园是全港最大最绿的。强项：医学、商科、工程、教育，以及世界级的中国研究传统。希望英语授课之余同时提升中文水平的国际学生常选中大。',
          },
          {
            type: 'h3',
            text: '3. 香港科技大学（科大）——理科、工科、商科',
            body: '科大1991年建校于壮丽的清水湾校园，用一代人的时间建起了世界排名靠前的工程、科学与商科项目，并常年被评为全球最佳年轻大学之一。研究密集、高度国际化，科技与金融雇主在亚洲范围内的招聘重点校。适合明确要走STEM或商科、想要英语环境加产业管道的申请者。',
          },
          {
            type: 'h3',
            text: '4. 香港理工大学（理大）——应用与产业嵌入',
            body: '理大渊源可追溯至1937年，是香港的应用科学型大学：酒店与旅游（世界标杆项目之一）、设计、工程、康复与健康科学、测绘。课程把实习和产业项目作为结构性环节而非附加项。想要职业导向学位而非纯学术学位的学生，理大是自然之选。',
          },
          {
            type: 'h3',
            text: '5. 香港城市大学（城大）——市中心的专业学科',
            body: '城大1984年以理工学院起步、1994年正名大学，已成长为九龙塘的综合型专业大学：商科、工程、数据科学、能源以及兽医学（赛马会动物医学及生命科学院）。市中心的位置让跨海兼职与实习格外便利。',
          },
          {
            type: 'h3',
            text: '6. 香港浸会大学（浸大）——传理、中医、博雅',
            body: '浸大渊源可追溯至1956年，是六大中最具博雅气质的学校。传理学院是亚洲最知名的传理学府之一，中医学院是区域标杆，商学院拥有权威认证。九龙塘的紧凑校园适合想要大城市里小社区感的学生。',
          },
        ],
      },
      {
        id: 'how-hk-admissions-differ',
        h2: '香港招生与内地的区别',
        intro: '这是多数"留学中国"攻略讲错的部分。香港不属于内地体系——两边的申请除了"中国"两个字之外毫无共享。',
        blocks: [
          {
            type: 'table',
            caption: '两个体系并排看',
            columns: ['维度', '中国内地', '香港'],
            rows: [
              ['招生考试', '2026级起本科要求CSCA（中文授课另需HSK）', '无CSCA、无HSK——凭现有学历资格录取'],
              ['使用的资格', 'CSCA科目+成绩单', 'A-Level、IB、SAT/AP或本国课程，个案审读'],
              ['申请方式', '各校国际学生门户（如 studyatpku.com）', '直接向各校自己的招生门户申请'],
              ['主要截止', '多为12–5月（因校而异）', '主轮通常在前一年9–11月'],
              ['授课语言', '中文授课或英文授课双轨', '以英语为主'],
              ['奖学金体系', 'CSC（全额）、校级奖学金、省市级奖项', '主要为校设入学奖学金；无CSC'],
              ['非本地本科学费', '约¥30,000–¥60,000/年', '通常约HK$145,000–218,000/年（以各校为准）'],
              ['学生签证', '凭录取办X1/X2签证', '由学校作为本地担保人办理学生签证'],
            ],
          },
          {
            type: 'ul',
            items: [
              '每所香港高校单独申请——国际申请者没有集中申请系统',
              '通常需要英语证明（IELTS/TOEFL或英语授课学历）；典型要求为IELTS 6.0–6.5或TOEFL iBT约80–93，因项目而异——申请前逐项核实',
              '竞争项目（以医学最典型）另有面试，常为多站式迷你面试（MMI）',
              '后续轮次有时延至冬春，但奖学金评审通常绑定主轮——请在9–11月申请',
              '以上日期与费用均为典型情形；当季数字请以各校官方招生页面为准',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '日历的不对称对你有利：香港主轮9–11月截止，早于内地12–5月的窗口。你可以秋季先申香港、拿到结果，之后照常在春季申请内地大学——两套体系互不冲突。',
          },
        ],
      },
      {
        id: 'mainland-vs-hong-kong',
        h2: '内地 vs 香港：诚实的决策表',
        intro: '两条路都通向国际认可的学位。正确答案基本取决于预算、语言目标与职业地理。',
        blocks: [
          {
            type: 'table',
            caption: '国际学生的内地与香港对比',
            columns: ['维度', '中国内地', '香港'],
            rows: [
              ['国际本科年学费', '约¥30,000–¥60,000（≈HK$33,000–66,000）', '通常约HK$145,000–218,000'],
              ['全额资助路径', 'CSC+省市级奖学金可覆盖学费、住宿与补助', '本科层面罕见——多为部分入学奖学金'],
              ['需备考的考试', 'CSCA（中文授课另加HSK）', '除学历资格外无需额外考试'],
              ['语言环境', '普通话沉浸（或英文授课项目）', '粤语+英语；普通话有用但居次'],
              ['中文学习效果', '最强——日常生活即普通话', '中等——校园英语稀释了沉浸度'],
              ['职业地理', '内地经济+中文流利：科技、制造、贸易、学术', '香港金融中心+普通法体系；大湾区跳板岗位'],
              ['生活成本', '¥1,500–¥4,000/月（因城市而异）', '全球最贵住房市场之一；预算需大幅上调'],
              ['申请时间', '12–5月', '9–11月（主轮）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '选内地，如果：预算重要、想要真正的普通话流利度、目标是CSC全额资助，或你领域的内地目标校（清华、北大、复旦等C9）排名高于港校',
              '选香港，如果：预算可承受、想要英语授课的普通法国际城市，或职业目标是香港金融/大湾区跳板岗位',
              '两边都选，如果：你能跑两套申请——秋季香港、春季内地——然后并排比较真实录取结果',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '对多数预算敏感的申请者，结论很直白：强内地大学的CSC奖学金（全免学费+住宿+每月补助）对阵香港的全价学费，这不是一场接近的比较。香港赢在环境与金融通道；内地赢在足以改变人生的成本差距。',
          },
        ],
      },
      {
        id: 'hk-scholarships',
        h2: '香港的花费：奖学金与自费的现实',
        intro: '香港没有CSC的对等项。存在的是一层校设入学奖学金，以及研究层次的政府资助计划。',
        blocks: [
          {
            type: 'ul',
            items: [
              '校设入学奖学金：六大高校都向录取的国际学生发放学业奖学金——部分学校随申请自动评审，部分需另行申请；金额从部分学费到（少数）全覆盖',
              '香港博士研究生奖学金计划：面向各国研究型研究生的政府资助计划——丰厚津贴加会议经费；本科阶段不适用',
              '项目专项奖学金：商学院与工学院常设有捐赠人资助的国际学生奖项',
              '现实基线：港校的多数国际本科生为自费或家庭资助；把奖学金当作加分项而不是计划本身',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '与内地对照：仅CSC一项就免学费、提供宿舍并支付每月补助（约¥2,000–3,000），还可与校级、市级奖项叠加。如果资助是决定性约束，内地路线在结构上慷慨得多——每个申请季请以官方来源核实最新计划。',
          },
        ],
      },
      {
        id: 'decision',
        h2: '整合起来：四步计划',
        intro: '聪明的打法是利用日历不对称：把香港与内地的申请当成一个有先后顺序的申请季。',
        blocks: [
          {
            type: 'ol',
            items: [
              '按预算与语言目标定优先级——成本决定性则倾向内地与CSC；英语授课的金融中心城市环境决定性则倾向香港',
              '按学科匹配从六大中选出两三所（见上方快速选表），并在8–9月查好当季截止日期',
              '9–11月凭学历资格与英语成绩提交香港申请',
              '无论香港结果如何，并行准备内地申请——CSCA科目、必要时的HSK、成绩单、推荐信——并在12–5月的窗口内提交',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '最终比较发生在真实录取都到手之后：全价的港校录取 vs 附带奖学金的内地录取，是高度个人化的决定——但只有两条线都跑了的申请者，才有资格做这个决定。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '香港的大学要求CSCA吗？',
        a: '不要求。CSCA是内地自2026级起对本科申请者的招生考试要求。香港是独立招生体系——港校凭A-Level、IB、SAT/AP等学历资格直接录取国际学生，没有另外的入学考试。',
      },
      {
        q: '香港最好的大学是哪所？',
        a: '港大是经典综合旗舰（医学、法律、商科、文科）；科大是理工科与研究密集型的选择；中大是双语书院制的替代项，中国研究实力深厚。三所都位于香港体系顶端——按学科匹配与校园环境选择。',
      },
      {
        q: '国际学生在香港读书一年多少钱？',
        a: '非本地本科学费通常为每年HK$145,000–218,000（因学校与项目而异），外加全球最贵住房市场之一的生活成本。这是内地国际学费（约¥30,000–¥60,000/年）的数倍。当季数字请以各校官方页面为准。',
      },
      {
        q: '内地奖学金（CSC）能用于香港的大学吗？',
        a: '不能。中国政府奖学金（CSC）适用于内地大学。香港有自己较薄的奖学金层：本科层面主要是校设入学奖学金，研究层面有香港博士研究生奖学金计划。请按自费做预算，把任何奖项当作加分项。',
      },
      {
        q: '香港的大学申请什么时候开放和截止？',
        a: '次年入学的主轮申请通常从9月前后持续到11月，后续轮次有时延至冬春。这早于内地12–5月的窗口，所以申请者可以先完成港校申请，再在同一申请季申请内地大学。',
      },
      {
        q: '在香港读书是学中文的好途径吗？',
        a: '能积累阅读与听力，但日常生活以粤语和英语为主，普通话沉浸弱于内地。以普通话流利为首要目标的学生，通常在内地大学（例如上海或北京）效果更好——环境本身在强化语言。',
      },
      {
        q: '申请香港的大学需要IELTS或TOEFL吗？',
        a: '通常需要，除非你的学业全程英语授课。典型要求约IELTS 6.0–6.5或TOEFL iBT 80–93，因项目而异，竞争项目要求更高。各校自行设定标准——请查具体项目页面。',
      },
      {
        q: '金融职业选香港还是内地的大学更好？',
        a: '面向香港本地金融岗位，港校（港大、中大、科大的商学院）拥有主场优势与实习管道。面向内地市场金融与大湾区岗位，顶尖内地大学（复旦、上交、北大、清华）加普通话流利度日益成为差异化优势。两条路都通——只是指向职业的不同版本。',
      },
    ],
    howToSteps: [
      {
        name: '定优先级：成本还是环境',
        text: '先想清楚决定性因素是预算（指向内地与CSC全额资助）还是英语授课的香港环境（指向六大港校）——后续所有选择都由此展开。',
      },
      {
        name: '按学科匹配列短名单',
        text: '用快速选表从六大中挑两三所（港大综合、科大理工、中大双语、理大应用、城大专业、浸大传理）。',
      },
      {
        name: '8–9月核对截止日期',
        text: '香港主轮通常9–11月截止，且奖学金评审通常绑定主轮——各校公布当季日期后尽早确认。',
      },
      {
        name: '备齐学历资格与英语成绩',
        text: '整理学历材料（A-Level、IB、SAT/AP或本国课程成绩单）与受认可的英语考试成绩（通常IELTS 6.0–6.5 / TOEFL iBT 80–93——按项目核实）。',
      },
      {
        name: '秋季提交香港申请',
        text: '向每所短名单学校的独立门户直接申请——没有集中系统——若目标为医学等竞争项目，做好面试准备。',
      },
      {
        name: '并行跑内地申请线',
        text: '无论香港结果如何，报好CSCA科目、备齐成绩单与推荐信，在12–5月的窗口内提交内地申请——然后把附带奖学金的真实录取并排比较。',
      },
    ],
    ctaTitle: '香港还是内地？',
    ctaSubtitle:
      'SICA顾问把两条路线放进你的预算与目标里比较——如果内地更合适，我们负责全套：CSCA科目组合、奖学金叠加与选校方案。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '内地对应名单——申请港校值得对照的旗舰大学。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA考试完全指南',
        description: '香港不需要、申请内地却必需的考试。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: '让内地成为预算答案的全额资助路线。',
      },
    ],
  },
};
