import type { LocalizedGuide } from './types';

/**
 * "Study in China vs Russia for MBBS" — long-form comparison
 * listicle. Target queries: "mbbs in china vs russia", "mbbs in
 * china", "mbbs in russia", "cheapest mbbs abroad", "which
 * country is best for mbbs", "mbbs recognized india", "mbbs
 * neet qualification".
 *
 * Mostly static comparison. Page wrapper fetches MBBS programs
 * from the live SICA catalog (filtered by discipline=Medicine +
 * name contains MBBS) and injects into the `mbbs-china-programs`
 * block at render time.
 */
export const chinaVsRussiaMbbsGuide: LocalizedGuide = {
  en: {
    slug: 'study-in-china-vs-russia-for-mbbs',
    eyebrow: 'GUIDE · COMPARISON',
    title: 'Study MBBS in China vs Russia — Full Comparison for International Students (2026)',
    description:
      'Side-by-side comparison of MBBS in China vs Russia — duration, tuition, recognition (MCI/NMC, WHO, FAIMER, ECFMG), clinical exposure, language, climate, and post-MBBS career paths.',
    subtitle:
      'China and Russia are the two largest destinations for international MBBS students — together they host 60,000+ international medical students from India, Pakistan, Bangladesh, Nigeria, and beyond. This page compares them across the dimensions that matter for your career.',
    stats: [
      { value: '2 destinations', label: 'China vs Russia MBBS' },
      { value: '~70K', label: 'Intl students in MBBS globally' },
      { value: '¥30-70K/yr', label: 'China MBBS tuition (vs Russia ¥15-40K)' },
      { value: '5-6 yrs', label: 'Both — typical MBBS duration' },
    ],
    quickAnswer:
      'China and Russia are the two largest MBBS destinations for international students. Both offer 5-6 year English-medium MBBS programs at Chinese / Russian government universities with WHO + FAIMER recognition. China\'s advantages: lower tuition (¥30,000-50,000/year vs Russia ¥15,000-40,000/year with the ruble\'s current weakness), stronger English-medium programs, better climate for most international students, and direct WHO/FAIMER/MCI recognition. Russia\'s advantages: longer history of international MBBS, much larger established alumni network (especially in India, Pakistan, Bangladesh), and lower cost in ruble terms. For most international students today, China offers the better package: recognized, English-medium, modern facilities, and a strong global reputation.',
    keyTakeaways: [
      'Both China + Russia offer 5-6 year English-medium MBBS with WHO + FAIMER + most-country recognition',
      'China MBBS tuition is ¥30,000-50,000/year vs Russia ¥15,000-40,000/year (current ruble weakness)',
      'China has stronger English-medium programs + more modern facilities',
      'Russia has longer MBBS history + larger established alumni network (esp. India/Pakistan/Bangladesh)',
      'MCI/NMC recognition is solid for both — pass rates depend on the specific student',
      'Climate + language are deciding factors — China wins on climate, both have language barriers',
    ],
    sections: [
      {
        id: 'why-mbbs-abroad',
        h2: 'Why international students pick MBBS abroad (China + Russia dominate)',
        intro:
          'Approximately 70,000 international students enroll in MBBS programs outside their home country each year. China + Russia together host the majority — ~30,000 students in Chinese English-medium MBBS programs + ~25,000 in Russian programs. Other destinations (Philippines, Ukraine pre-war, Kyrgyzstan, Bangladesh, Nepal) round out the top destinations.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Cost** — government MBBS in China or Russia runs ¥30,000-50,000/year total (tuition + dorm + living). Compare to private MBBS in India (¥800,000-1,200,000/year total) or US medical school (USD 200,000-300,000/year).',
              '**Recognition** — Chinese + Russian MBBS degrees are recognized by WHO, FAIMER, and most country medical councils (MCI/NMC in India, PMDC in Pakistan, NMC in Nigeria, etc.).',
              '**No entrance exam barriers** — Chinese + Russian MBBS do not require MCAT or highly competitive local medical entrance exams. Admission is GPA + language proficiency + financial documentation.',
              '**English-medium instruction** — Both countries offer MBBS programs taught in English, with separate Russian-language or Chinese-language tracks for local students.',
              '**Clinical exposure** — Both countries have large public hospital systems with high patient volumes — strong clinical training for international students.',
            ],
          },
        ],
      },
      {
        id: 'china-mbbs',
        h2: 'MBBS in China — overview, duration, cost, recognition',
        intro:
          'China\'s MBBS programs have grown rapidly since 2004 when the Ministry of Education first allowed English-medium MBBS at 30 designated universities. Today there are ~45 Chinese universities offering English-medium MBBS with ~30,000 international students enrolled.',
        blocks: [
          {
            type: 'table',
            caption: 'MBBS in China at a glance',
            columns: ['Dimension', 'Details', 'Notes'],
            rows: [
              ['Duration', '5-6 years', '5 years clinical coursework + 1 year internship (most programs)'],
              ['Tuition', '¥30,000-50,000/year', '~USD 4,200-7,000/year'],
              ['Living cost', '¥18,000-30,000/year', 'Tier 2 cities lower; Tier 1 cities higher'],
              ['Total all-in (5 yrs)', '¥240,000-400,000', '~USD 34,000-56,000'],
              ['Language', 'English-medium', 'Optional Chinese language courses'],
              ['Admission GPA', '70%+ in high school biology, chemistry, physics', 'No entrance exam required'],
              ['Recognition', 'WHO, FAIMER, MCI/NMC, PMDC, NMC Nigeria', 'Most countries recognize Chinese MBBS'],
              ['Internship year', 'Included in program', 'At the university\'s teaching hospitals'],
              ['NEET qualification (India)', 'Required for Indian students before admission', 'Per Indian government regulation 2018'],
              ['PG (residency) eligibility', 'USMLE, PLAB, AMC, MCI screening test', 'Required for PG in any country'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'China\'s top MBBS universities include China Medical University, Capital Medical University, Dalian Medical University, Jilin University, Wuhan University, and Zhejiang University. All are WHO + FAIMER recognized and listed in the World Directory of Medical Schools.',
          },
        ],
      },
      {
        id: 'russia-mbbs',
        h2: 'MBBS in Russia — overview, duration, cost, recognition',
        intro:
          'Russia has been hosting international MBBS students since the 1980s (especially from India, Pakistan, Bangladesh, Sri Lanka, Nepal, African countries). The program is called "MBBS-equivalent" in Russian ("Лечебное дело", 6-year specialist degree). About 25,000 international students currently enroll each year.',
        blocks: [
          {
            type: 'table',
            caption: 'MBBS in Russia at a glance',
            columns: ['Dimension', 'Details', 'Notes'],
            rows: [
              ['Duration', '6 years', 'No separate internship year — included in 6 years'],
              ['Tuition', '$3,500-5,500/year (RUB 350-550K)', 'Varies by university; ruble weakness makes Russia cheaper'],
              ['Living cost', '$2,500-4,500/year', 'Varies by city; Moscow + St. Petersburg higher'],
              ['Total all-in (6 yrs)', '$36,000-60,000', '~RUB 3,600,000-6,000,000'],
              ['Language', 'English-medium (most)', 'Some programs Russian-medium; bilingual tracks available'],
              ['Admission GPA', '50%+ in PCB (Physics, Chemistry, Biology)', 'Lower bar than most countries'],
              ['Recognition', 'WHO, FAIMER, MCI/NMC, PMDC, NMC, ECFMG, GMC', 'Solid international recognition'],
              ['Internship year', 'Included in 6 years', 'At university teaching hospitals'],
              ['NEET qualification (India)', 'Required for Indian students', 'Same as China per Indian regulation 2018'],
              ['PG eligibility', 'USMLE, PLAB, AMC, MCI screening test', 'Same pathways as China'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Russia\'s top MBBS universities include Moscow State Medical University (Sechenov), Saint Petersburg State Medical University (Pavlov), Kazan Federal University, Pirogov Russian National Research Medical University, and Volgograd State Medical University. All are WHO + FAIMER recognized.',
          },
        ],
      },
      {
        id: 'head-to-head',
        h2: 'MBBS: China vs Russia — head-to-head comparison',
        intro:
          'Here is the side-by-side comparison of the dimensions that matter most for an international MBBS student. China + Russia are roughly equivalent on quality + recognition; they differ significantly on cost, climate, language, and culture.',
        blocks: [
          {
            type: 'table',
            caption: 'MBBS China vs Russia — head-to-head comparison',
            columns: ['Dimension', 'China', 'Russia'],
            rows: [
              ['Duration', '5-6 years', '6 years'],
              ['Tuition (USD/year)', '$4,200-7,000', '$3,500-5,500'],
              ['Living cost (USD/year)', '$2,500-4,200', '$2,500-4,500'],
              ['Total 6-year cost', '$40,000-67,000', '$36,000-60,000'],
              ['English-medium availability', 'Wide (~45 universities)', 'Wide (~30 universities)'],
              ['Climate (most international students)', 'Mild to cold', 'Cold to very cold'],
              ['Language ease (after MBBS)', 'Mandarin (HSK 4 sufficient for clinical practice)', 'Russian (much harder for non-Slavic speakers)'],
              ['Established international alumni', 'Growing (est. 2010s)', 'Large (since 1980s)'],
              ['PG in US/UK (USMLE/PLAB pass)', 'Comparable', 'Comparable'],
              ['PG in home country (MCI/NMC, PMDC)', 'Eligible', 'Eligible'],
              ['Cultural adaptation for English speakers', 'Easier (less language barrier in cities)', 'Harder (Russian-only outside Moscow/SPb)'],
              ['Career opportunities in destination country', 'Restricted for foreign MBBS graduates', 'Restricted for foreign MBBS graduates'],
              ['Food quality + dietary preferences', 'Strong options for vegetarian + halal + vegan', 'Limited vegetarian/halal outside major cities'],
              ['Best for', 'Climate-sensitive students, those with vegetarian/halal diet, modern facilities-focused students', 'Budget-focused students, students targeting specific alumni networks'],
            ],
          },
          {
            type: 'p',
            text: 'Practical takeaway: pick China if climate-sensitive or vegetarian/halal. Pick Russia if budget is the primary concern and you don\'t mind cold weather + the Russian language challenge. Both produce qualified MBBS graduates recognized globally.',
          },
        ],
      },
      {
        id: 'recognition-comparison',
        h2: 'Recognition: WHO, MCI/NMC, FAIMER, ECFMG',
        intro:
          'Recognition is the #1 career question for any international MBBS student. Both China + Russia have strong international recognition, but the recognition details differ by destination country. Here is how to verify recognition before you apply.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**WHO + FAIMER World Directory of Medical Schools** — both China + Russia publish their MBBS-granting universities in the WDMS. Before applying, verify your target university is listed: wdoms.org.',
              '**India (MCI/NMC recognition)** — both countries have most of their MBBS-granting universities recognized by India\'s NMC. Indian students must qualify NEET before admission. After graduation, you take the NMC screening test (NEXT exam) to practice in India.',
              '**Pakistan (PMDC recognition)** — both China + Russia\'s MBBS universities are recognized by PMDC. Pakistani students must qualify MDCAT-equivalent before admission.',
              '**US (ECFMG recognition)** — both are ECFMG-eligible. US residency requires USMLE Step 1 + Step 2 CK + Step 3 + clinical rotations in the US (typically via clinical elective rotations during 5th year).',
              '**UK (GMC recognition)** — both are GMC-eligible for PLAB pathway. UK residency requires PLAB 1 + PLAB 2 + clinical foundation years.',
              '**Australia (AMC recognition)** — both are AMC-eligible. Australia residency requires AMC MCQ + clinical exam + internship in Australia.',
              '**Canada / South Africa / Gulf countries** — both China + Russia are recognized in most countries, but specific licensing requirements vary.',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Always verify your specific target MBBS university is recognized by your home country\'s medical council BEFORE applying. China + Russia both publish lists of WHO-recognized universities; the medical council of your home country determines if specific Chinese / Russian MBBS grads are eligible to practice.',
          },
        ],
      },
      {
        id: 'cost-comparison',
        h2: 'Total investment: MBBS China vs Russia — 6 years',
        intro:
          'Total cost is the #1 deciding factor for most international MBBS students. The ruble\'s recent weakness makes Russia cheaper; China offers better value when you account for quality + facilities + climate.',
        blocks: [
          {
            type: 'table',
            caption: 'Total investment comparison: MBBS China vs Russia (USD, 6 years)',
            columns: ['Item', 'China (top-10 universities)', 'Russia (top-10 universities)'],
            rows: [
              ['Tuition (6 years)', '$25,200-42,000', '$21,000-33,000'],
              ['Living cost (6 years)', '$15,000-25,200', '$15,000-27,000'],
              ['Airfare (round-trip, annual visits home)', '$6,000-9,000', '$6,000-9,000'],
              ['Books + equipment (stethoscope, lab coat, etc.)', '$2,000-3,000', '$2,000-3,000'],
              ['Visa + residence permit (6 years)', '$1,500-2,500', '$1,500-2,500'],
              ['TOTAL all-in (6 years)', '$49,700-81,700', '$45,500-74,500'],
              ['TOTAL (Tier 2 city lifestyle, frugal)', '—', '$40,000-55,000'],
              ['TOTAL (Tier 1 city lifestyle, comfortable)', '—', '$70,000-90,000'],
            ],
          },
          {
            type: 'p',
            text: 'Pricing context: $50,000-80,000 total for a Chinese or Russian MBBS is roughly 5-10% of the cost of private MBBS in India ($500,000+) or US medical school ($300,000+). Both countries offer the most affordable globally-recognized MBBS options.',
          },
        ],
      },
      {
        id: 'mbbs-china-programs',
        h2: 'MBBS programs in SICA\'s catalog',
        intro:
          'The live MBBS programs from the SICA database — filtered to discipline=Medicine + name contains "MBBS" or "Clinical Medicine". Use this to verify a specific university before applying.',
        blocks: [
          {
            type: 'table',
            caption: 'MBBS / Clinical Medicine programs at Chinese universities (live catalog)',
            columns: ['Program', 'University', 'City', 'Duration', 'Tuition', 'Language'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'SICA works with ~10 top Chinese universities offering English-medium MBBS with full WHO + FAIMER recognition. Talk to SICA for the canonical list + current admission requirements + NEET guidance.',
          },
        ],
      },
      {
        id: 'post-mbbs',
        h2: 'After MBBS: career paths and PG preparation',
        intro:
          'What happens after MBBS in China or Russia? The path forward is similar for both: PG preparation (USMLE, PLAB, NEXT for India, AMC), or return to home country and clear the local licensing exam.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**US residency (most lucrative path for non-US citizens)** — USMLE Step 1 + Step 2 CK + clinical rotations in the US during 5th year + Step 3 during residency application. Match via NRMP. ~50-60% of USMLE-eligible Chinese/Russian MBBS grads who apply get matched into US residency programs (vs ~90% for US-trained MDs).',
              '**UK foundation + specialty training** — PLAB 1 + PLAB 2 + 2-year UK Foundation Programme + specialty training. Long path (8-10 years to consultant) but well-supported for international MBBS grads.',
              '**Return to home country + clear licensing** — NMC screening (NEXT exam) for India, PMDC licensing for Pakistan, MDCN for Nigeria, AMC for Australia/NZ, etc. The home-country licensing is the most reliable path for the majority of Chinese/Russian MBBS graduates.',
              '**Practice in China or Russia** — restricted for foreign MBBS graduates; typically requires passing the destination country\'s licensing exam + 2-3 years of additional supervised practice.',
              '**Academia / research career** — PhD after MBBS opens clinical research + university teaching careers. Common path is MBBS + PhD in clinical sciences or public health.',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is MBBS better in China or Russia?',
        a: 'Both offer globally-recognized MBBS at similar quality. China offers: milder climate, stronger English-medium programs, more modern facilities, easier cultural adaptation. Russia offers: longer history of international MBBS, larger established alumni network (especially in India, Pakistan, Bangladesh), and lower cost (with current ruble weakness). For most international students, China offers the better overall package today.',
      },
      {
        q: 'Is MBBS in China recognized in India?',
        a: 'Yes — most Chinese MBBS-granting universities are recognized by India\'s NMC (formerly MCI). Indian students must qualify NEET before admission (per Indian government regulation 2018). After graduation, MBBS graduates must pass the NMC screening test (NEXT exam) before practicing in India. Chinese MBBS grads who clear NEXT are eligible for PG and practice in India on equal footing with Indian MBBS grads.',
      },
      {
        q: 'How much does MBBS cost in China vs Russia?',
        a: '6-year total: China $49,000-82,000 USD, Russia $45,000-75,000 USD. Russia is slightly cheaper due to ruble weakness. China tuition is higher ($4,200-7,000/year vs $3,500-5,500/year) but the cost difference is small enough that program quality + recognition + climate should drive the decision.',
      },
      {
        q: 'What\'s the duration of MBBS in China vs Russia?',
        a: 'China: 5-6 years (5 years clinical coursework + 1 year internship at most Chinese universities). Russia: 6 years (no separate internship year — included). Both lead to the "MBBS" or equivalent qualification. After graduation, both pathways require home-country licensing exams for practice.',
      },
      {
        q: 'Which country has better MCI/NMC passing rates?',
        a: 'Comparable — pass rates depend more on individual study effort + preparation quality than on country of study. Indian students who seriously prepare for NEXT and complete a strong clinical elective year in the US or UK have the best PG outcomes regardless of whether they studied in China or Russia.',
      },
      {
        q: 'Is language a barrier in China or Russia?',
        a: 'Yes, but in different ways. China: English-medium MBBS is widely available; daily life requires Mandarin (HSK 3-4 sufficient for daily living; HSK 4-5 needed for clinical practice). Russia: English-medium MBBS is available but most daily life + clinical practice requires Russian (much harder for non-Slavic speakers — Cyrillic alphabet + Russian grammar). On language barrier alone, China is easier for international students.',
      },
      {
        q: 'What\'s the climate like for medical students?',
        a: 'China: diverse climate. Most MBBS cities are in North China (Beijing, Shenyang, Dalian) or East China (Nanjing, Hangzhou, Wuhan). Winters cold (-10 to 5°C) but summers warm (25-30°C). Russia: cold climate, especially northern universities (Moscow, Saint Petersburg, Kazan, Novosibirsk). Winters very cold (-20 to -5°C for months). Snow 4-6 months per year. China wins on climate for most tropical-country students.',
      },
      {
        q: 'Can I do PG (residency) abroad after MBBS in China or Russia?',
        a: 'Yes — both pathways support PG eligibility in most countries. For US: USMLE + NRMP match. For UK: PLAB + Foundation Programme. For Australia: AMC + internship. For home country (India, Pakistan, Nigeria, etc.): local licensing exam (NEXT, PMDC, MDCN). After MBBS, expect 2-5 additional years of clinical rotations + exams before full PG training.',
      },
    ],
    howToSteps: [
      {
        name: 'Verify your target MBBS university is recognized',
        text: 'Before applying: check the World Directory of Medical Schools (wdoms.org) to confirm your target university + program is WHO-recognized. Also verify recognition by your home country\'s medical council (NMC in India, PMDC in Pakistan, MDCN in Nigeria, ECFMG in US, GMC in UK, AMC in Australia).',
      },
      {
        name: 'Qualify NEET (Indian students) or equivalent entrance exam',
        text: 'Indian students: qualify NEET UG before applying to any international MBBS program (per Indian regulation 2018). Pakistani students: qualify MDCAT. Nigerian students: qualify UTME. Other countries: verify local medical entrance exam requirements.',
      },
      {
        name: 'Compare 3-5 target universities in China vs Russia',
        text: 'Build a comparison list with: tuition, living cost, duration, climate, English-medium availability, hospital attachments, NEET pass rates of past graduates, current international student population. Consider both countries for at least 2-3 programs each.',
      },
      {
        name: 'Prepare the application package',
        text: 'High school transcripts (PCB - Physics, Chemistry, Biology, English), NEET or equivalent score, passport, IELTS 6.0+ / TOEFL 80+ (English-medium programs), statement of purpose (why medicine, why this country), 2-3 recommendation letters from science teachers, medical fitness certificate. Apply to 5-8 programs in parallel.',
      },
      {
        name: 'Submit applications 9-12 months before intake',
        text: 'Both China + Russia run September (Fall) intakes. Submit applications 9-12 months ahead (October-January for September intake). China takes 4-6 weeks for admission; Russia takes 2-4 weeks (faster). Plan around your country\'s NEET/MDCAT result release date.',
      },
      {
        name: 'Apply for scholarships (CSC for China, Russian government scholarship for Russia)',
        text: 'Chinese Government Scholarship (CSC) covers up to 100% of MBBS tuition + dorm + stipend + airfare. Apply via Chinese universities January-April for September intake. Russian government scholarship (available for select countries) covers tuition + dorm. Apply via Russian Cultural Center or Rossotrudnichestvo.',
      },
      {
        name: 'Receive admission + apply for student visa',
        text: 'After admission: pay first-year tuition + dorm. Receive JW202 (China) or invitation letter (Russia). Apply for X1 visa (China) or student visa (Russia). Book travel. Allow 4-6 weeks for visa processing.',
      },
      {
        name: 'Plan PG pathway during MBBS',
        text: 'In parallel with MBBS: prepare for PG pathway in your target destination. For US: take USMLE Step 1 in year 4-5 + Step 2 CK during internship. For UK: PLAB 1 + 2 pathway. For India: NEXT exam after graduation. For home-country practice: focus on home-country licensing exam. Active PG prep during MBBS is the #1 differentiator for international MBBS graduates.',
      },
    ],
    ctaTitle: 'Ready to apply for MBBS in China or Russia?',
    ctaSubtitle:
      'SICA counselors help you compare Chinese + Russian MBBS programs, verify WHO + home-country recognition, qualify NEET (for Indian students), apply for CSC scholarships, and plan your PG pathway. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/mbbs-in-china',
        label: 'MBBS in China — full guide',
        description: 'China\'s top English-medium MBBS programs — duration, tuition, scholarships, NEET guidance, hospital training, and PG pathways.',
      },
      {
        href: '/best-universities-china',
        label: 'Best universities in China',
        description: 'Every Chinese university ranked by domestic ranking + QS World — the canonical 2026 ranking.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'CSC fully funds MBBS at top universities — tuition + dorm + stipend + airfare.',
      },
    ],
  },
  zh: {
    slug: 'study-in-china-vs-russia-for-mbbs',
    eyebrow: '指南 · 对比',
    title: '2026 中国 vs 俄罗斯 MBBS——国际生完整对比',
    description:
      '中国与俄罗斯 MBBS 全方位对比——学制、学费、认证（MCI/NMC、WHO、FAIMER、ECFMG）、临床实习、语言、气候、毕业 MBBS 后的职业路径。',
    subtitle:
      '中国与俄罗斯是国际 MBBS 学生的两大目的地——共有 60,000+ 名来自印度、巴基斯坦、孟加拉、尼日利亚等的国际医学生。本文在影响你职业的各维度上对比两者。',
    stats: [
      { value: '2 目的地', label: '中国 vs 俄罗斯 MBBS' },
      { value: '~7 万', label: '全球 MBBS 国际生' },
      { value: '¥3-7 万/年', label: '中国 MBBS 学费（vs 俄罗斯 ¥1.5-4 万）' },
      { value: '5-6 年', label: '两者——典型 MBBS 学制' },
    ],
    quickAnswer:
      '中国与俄罗斯是国际生最大的两个 MBBS 目的地。两国均提供 5-6 年英文授课 MBBS 项目，所在中国 / 俄罗斯政府大学均获 WHO + FAIMER 认证。中国优势：学费更低（¥30,000-50,000/年 vs 俄罗斯 ¥15,000-40,000/年含当前卢布弱势）、英文授课项目更强、多数国际生气候更宜、WHO/FAIMER/MCI 直接认证。俄罗斯优势：历史更久的国际 MBBS、已建立的庞大校友网（尤其印度、巴基斯坦、孟加拉）、以卢布计成本更低。对多数当代国际生而言，中国提供更优组合：被认证、英文授课、现代设施、强大全球声誉。',
    keyTakeaways: [
      '中国 + 俄罗斯均提供 5-6 年英文授课 MBBS，WHO + FAIMER + 多数国家认证',
      '中国 MBBS 学费 ¥30,000-50,000/年 vs 俄罗斯 ¥15,000-40,000/年（当前卢布弱势）',
      '中国英文授课项目更强 + 设施更现代',
      '俄罗斯 MBBS 历史更久 + 已建校友网更大（尤其印度 / 巴基斯坦 / 孟加拉）',
      'MCI/NMC 认证对两国均稳定——通过率因学生个人而异',
      '气候 + 语言是决定因素——中国胜在气候，两者都有语言障碍',
    ],
    sections: [
      {
        id: 'why-mbbs-abroad',
        h2: '为什么国际生选择海外读 MBBS（中国 + 俄罗斯占主导）',
        intro:
          '每年约 70,000 国际生在母国以外入读 MBBS 项目。中国 + 俄罗斯合计占多数——约 30,000 名在中国英文授课 MBBS + 约 25,000 名在俄罗斯。其他目的地（菲律宾、战前乌克兰、吉尔吉斯斯坦、孟加拉、尼泊尔）补齐前列。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**成本**——中国或俄罗斯政府 MBBS 一年合计 ¥30,000-50,000（学费 + 住宿 + 生活费）。比较印度私立 MBBS（¥800,000-1,200,000/年）或美国医学院（200,000-300,000 美元/年）。',
              '**认证**——中国 + 俄罗斯 MBBS 学位获 WHO、FAIMER 及多数国家医学委员会（印度 MCI/NMC、巴基斯坦 PMDC、尼日利亚 NMC 等）认证。',
              '**无入学考试门槛**——中国 + 俄罗斯 MBBS 不要求 MCAT 或高竞争本地医学院入学考试。录取看 GPA + 语言水平 + 经济证明。',
              '**英文授课**——两国均提供英文授课 MBBS 项目，并有独立的中文或俄文轨道服务本地学生。',
              '**临床实习**——两国都有大型公立医院系统，患者量大——为国际生提供强有力的临床培训。',
            ],
          },
        ],
      },
      {
        id: 'china-mbbs',
        h2: '中国 MBBS——概览、学制、费用、认证',
        intro:
          '中国 MBBS 项目从 2004 年起快速成长，当时教育部首次允许 30 所指定大学开设英文授课 MBBS。如今约 45 所中国大学提供英文授课 MBBS，约 30,000 名国际生注册。',
        blocks: [
          {
            type: 'table',
            caption: '中国 MBBS 一览',
            columns: ['维度', '详情', '备注'],
            rows: [
              ['学制', '5-6 年', '5 年临床课程 + 1 年实习（多数项目）'],
              ['学费', '¥30,000-50,000/年', '约 4,200-7,000 美元/年'],
              ['生活费', '¥18,000-30,000/年', '二线城市更低，一线更高'],
              ['总预算（5 年）', '¥240,000-400,000', '约 34,000-56,000 美元'],
              ['语言', '英文授课', '可选中文课程'],
              ['录取 GPA', '高中生物、化学、物理 70%+', '无需入学考试'],
              ['认证', 'WHO、FAIMER、MCI/NMC、PMDC、尼日利亚 NMC', '多数国家认证中国 MBBS'],
              ['实习年', '包含在项目内', '在大学教学医院'],
              ['NEET 资格（印度）', '印度学生入学前必需', '按印度政府 2018 年法规'],
              ['研究生（住院医师）资格', 'USMLE、PLAB、AMC、MCI 筛选考试', '任何国家的研究生都需要'],
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '中国顶尖 MBBS 大学包括中国医科大学、首都医科大学、大连医科大学、吉林大学、武汉大学、浙江大学等。全部获 WHO + FAIMER 认证，并列入世界医学院目录。',
          },
        ],
      },
      {
        id: 'russia-mbbs',
        h2: '俄罗斯 MBBS——概览、学制、费用、认证',
        intro:
          '俄罗斯自 1980 年代起接待国际 MBBS 学生（尤其来自印度、巴基斯坦、孟加拉、斯里兰卡、尼泊尔、非洲国家）。该课程在俄罗斯称为"医疗业务"（6 年专家学位）。目前每年约 25,000 名国际生注册。',
        blocks: [
          {
            type: 'table',
            caption: '俄罗斯 MBBS 一览',
            columns: ['维度', '详情', '备注'],
            rows: [
              ['学制', '6 年', '无单独实习年——含在 6 年内'],
              ['学费', '$3,500-5,500/年（RUB 350-550K）', '因大学而异，卢布弱势使俄罗斯更便宜'],
              ['生活费', '$2,500-4,500/年', '因城市而异，莫斯科 + 圣彼得堡较高'],
              ['总预算（6 年）', '$36,000-60,000', '约 RUB 3,600,000-6,000,000'],
              ['语言', '英文授课（多数）', '部分项目俄文授课；可选双语轨道'],
              ['录取 GPA', 'PCB（物理、化学、生物）50%+', '比多数国家门槛低'],
              ['认证', 'WHO、FAIMER、MCI/NMC、PMDC、NMC、ECFMG、GMC', '国际认证稳固'],
              ['实习年', '含在 6 年内', '在大学教学医院'],
              ['NEET 资格（印度）', '印度学生必需', '与中国相同按印度 2018 法规'],
              ['研究生资格', 'USMLE、PLAB、AMC、MCI 筛选考试', '与中国相同路径'],
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '俄罗斯顶尖 MBBS 大学包括莫斯科国立医科大学（谢东诺夫）、圣彼得堡国立医科大学（巴甫洛夫）、喀山联邦大学、皮罗戈夫俄罗斯国家研究医科大学、伏尔加格勒国立医科大学等。全部获 WHO + FAIMER 认证。',
          },
        ],
      },
      {
        id: 'head-to-head',
        h2: 'MBBS：中国 vs 俄罗斯——直接对比',
        intro:
          '下面是对国际 MBBS 学生最重要的维度的并列对比。两国在质量 + 认证上大致对等；在成本、气候、语言、文化上差异显著。',
        blocks: [
          {
            type: 'table',
            caption: 'MBBS 中国 vs 俄罗斯——直接对比',
            columns: ['维度', '中国', '俄罗斯'],
            rows: [
              ['学制', '5-6 年', '6 年'],
              ['学费（美元/年）', '$4,200-7,000', '$3,500-5,500'],
              ['生活费（美元/年）', '$2,500-4,200', '$2,500-4,500'],
              ['6 年总成本', '$40,000-67,000', '$36,000-60,000'],
              ['英文授课可得性', '广（约 45 所大学）', '广（约 30 所大学）'],
              ['气候（多数国际生）', '温和至冷', '冷至极冷'],
              ['MBBS 后语言易度', '普通话（HSK 4 足够临床执业）', '俄语（对非斯拉夫语者难很多）'],
              ['已建立国际校友', '增长中（始于 2010 年代）', '庞大（自 1980 年代）'],
              ['美英 PG（USMLE/PLAB 通过）', '相当', '相当'],
              ['母国 PG（MCI/NMC、PMDC）', '有资格', '有资格'],
              ['英语者文化适应', '更容易（城市中语言障碍小）', '更难（莫斯科 / 圣彼得堡外俄语专有）'],
              ['目的地国家职业机会', '外国 MBBS 毕业生受限', '外国 MBBS 毕业生受限'],
              ['饮食 + 膳食偏好', '素食 + 清真 + 纯素选项强', '主要城市外素食 / 清真有限'],
              ['最适合', '气候敏感学生、素食 / 清真饮食者、现代化设施导向学生', '预算优先学生、瞄准特定校友网络的学生'],
            ],
          },
          {
            type: 'p',
            text: '实用结论：若气候敏感或素食 / 清真，选中国。若预算为优先且不介意寒冷 + 俄语挑战，选俄罗斯。两者都培养出全球认证的合格 MBBS 毕业生。',
          },
        ],
      },
      {
        id: 'recognition-comparison',
        h2: '认证：WHO、MCI/NMC、FAIMER、ECFMG',
        intro:
          '认证是任何国际 MBBS 学生的首要职业问题。两国均有强大的国际认证，但认证细节因目标国而异。以下是申请前验证认证的方法。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**WHO + FAIMER 世界医学院目录**——中国 + 俄罗斯均公布其 MBBS 授予大学于 WDMS。申请前核实你的目标大学是否列入：wdoms.org。',
              '**印度（MCI/NMC 认证）**——两国多数 MBBS 授予大学获印度 NMC 认证。印度学生入学前需通过 NEET 资格。毕业后参加 NMC 筛选考试（NEXT 考试）。',
              '**巴基斯坦（PMDC 认证）**——中国 + 俄罗斯的 MBBS 大学均获 PMDC 认证。巴基斯坦学生需入学前通过 MDCAT 等价考试。',
              '**美国（ECFMG 认证）**——两国均符合 ECFMG 资格。美国住院医师需 USMLE Step 1 + Step 2 CK + Step 3 + 在美临床轮转（通常第 5 年通过临床选修轮转）。',
              '**英国（GMC 认证）**——两国均符合 PLAB 路径资格。英国住院医师需 PLAB 1 + PLAB 2 + 临床基础年。',
              '**澳大利亚（AMC 认证）**——两国均符合 AMC 资格。澳大利亚住院医师需 AMC MCQ + 临床考试 + 在澳实习。',
              '**加拿大 / 南非 / 海湾国家**——两国在多数国家获认证，但具体执照要求因国而异。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '申请前务必核实你的具体目标 MBBS 大学获你母国医学委员会认证。中国 + 俄罗斯均公布 WHO 认证大学名单；母国医学委员会决定特定中国 / 俄罗斯 MBBS 毕业生是否有资格在本国执业。',
          },
        ],
      },
      {
        id: 'cost-comparison',
        h2: '总投入：MBBS 中国 vs 俄罗斯——6 年',
        intro:
          '总成本是多数国际 MBBS 学生的首要决定因素。卢布近期弱势使俄罗斯更便宜；中国在质量 + 设施 + 气候后提供更优价值。',
        blocks: [
          {
            type: 'table',
            caption: '总投入对比：MBBS 中国 vs 俄罗斯（美元，6 年）',
            columns: ['项目', '中国（前 10 大学）', '俄罗斯（前 10 大学）'],
            rows: [
              ['学费（6 年）', '$25,200-42,000', '$21,000-33,000'],
              ['生活费（6 年）', '$15,000-25,200', '$15,000-27,000'],
              ['机票（往返，年度探亲）', '$6,000-9,000', '$6,000-9,000'],
              ['教材 + 设备（听诊器、白大褂等）', '$2,000-3,000', '$2,000-3,000'],
              ['签证 + 居留许可（6 年）', '$1,500-2,500', '$1,500-2,500'],
              ['合计（6 年）', '$49,700-81,700', '$45,500-74,500'],
              ['合计（二线城市，节俭）', '—', '$40,000-55,000'],
              ['合计（一线城市，舒适）', '—', '$70,000-90,000'],
            ],
          },
          {
            type: 'p',
            text: '价格背景：中国或俄罗斯 MBBS $50,000-80,000 总费用约为印度私立 MBBS（$500,000+）或美国医学院（$300,000+）的 5-10%。两国均提供最经济、被全球认证的 MBBS 选项。',
          },
        ],
      },
      {
        id: 'mbbs-china-programs',
        h2: 'SICA 目录中的 MBBS 项目',
        intro:
          '来自 SICA 数据库的实时 MBBS 项目——筛选 discipline=Medicine + 名称含 "MBBS" 或"临床医学"。用此核实具体大学后再申请。',
        blocks: [
          {
            type: 'table',
            caption: '中国大学 MBBS / 临床医学项目（实时目录）',
            columns: ['项目', '大学', '城市', '学制', '学费', '语言'],
            rows: [['(从 SICA 数据库加载中…)', '—', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'SICA 与约 10 所顶尖中国大学合作提供英文授课 MBBS，全部获 WHO + FAIMER 认证。联系 SICA 获取标准名单 + 当前录取要求 + NEET 指导。',
          },
        ],
      },
      {
        id: 'post-mbbs',
        h2: 'MBBS 后：职业路径与研究生准备',
        intro:
          '中国或俄罗斯 MBBS 后怎么走？两条路径相似：研究生准备（USMLE、PLAB、印度 NEXT、AMC）或回国通过本地执照考试。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**美国住院医师（非美国人最赚钱路径）**——USMLE Step 1 + Step 2 CK + 5 年期间在美临床轮转 + 住院医师申请期间 Step 3。通过 NRMP 匹配。约 50-60% 申请美国住院医师的中国 / 俄罗斯 MBBS 毕业生匹配成功（vs 美国训练 MD 约 90%）。',
              '**英国基础 + 专科培训**——PLAB 1 + PLAB 2 + 2 年英国基础项目 + 专科培训。路径长（8-10 年至顾问），但对国际 MBBS 毕业生支持良好。',
              '**回国 + 通过本地执照**——NMC 筛选（NEXT 考试）给印度，PMDC 给巴基斯坦，MDCN 给尼日利亚，AMC 给澳/新等。回国执照是多数中国 / 俄罗斯 MBBS 毕业生最可靠的路径。',
              '**在中国或俄罗斯执业**——外国 MBBS 毕业生受限；通常需通过目的地国执照考试 + 2-3 年额外监督执业。',
              '**学术 / 研究职业**——MBBS 后读博士开启临床研究 + 大学教学职业。常见路径为 MBBS + 临床科学或公共卫生博士。',
            ],
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国还是俄罗斯 MBBS 更好？',
        a: '两国均提供全球认证 MBBS，质量相似。中国提供：温和气候、英文授课项目更强、设施更现代、文化适应更容易。俄罗斯提供：国际 MBBS 历史更久、已建校友网更大（尤其印度、巴基斯坦、孟加拉）、卢布弱势下成本更低。对多数当代国际生，中国在今日提供更好的整体组合。',
      },
      {
        q: '中国 MBBS 在印度被认可吗？',
        a: '认可——多数中国 MBBS 授予大学获印度 NMC（前 MCI）认证。印度学生入学前必须通过 NEET 资格（按印度 2018 政府法规）。毕业后，MBBS 毕业生需通过 NMC 筛选考试（NEXT 考试）才能在印度执业。通过 NEXT 的中国 MBBS 毕业生在印度 PG 与执业上与印度 MBBS 毕业生地位平等。',
      },
      {
        q: '中国 vs 俄罗斯 MBBS 多少钱？',
        a: '6 年总：中国 49,000-82,000 美元，俄罗斯 45,000-75,000 美元。俄罗斯因卢布弱势略便宜。中国学费更高（4,200-7,000 美元/年 vs 3,500-5,500 美元/年），但价差小到质量 + 认证 + 气候应驱动决策。',
      },
      {
        q: '中国 vs 俄罗斯 MBBS 学制？',
        a: '中国：5-6 年（多数中国大学 5 年临床课程 + 1 年实习）。俄罗斯：6 年（无单独实习年——含）。两者均获"MBBS"或等同学位。毕业后两国路径均需母国执照考试才能执业。',
      },
      {
        q: 'MCI/NMC 通过率哪个国家更好？',
        a: '相当——通过率更取决于个人学习努力 + 备考质量而非学习国家。认真准备 NEXT + 第 5 年在美国或英国完成强临床选修的印度学生，无论在中国还是俄罗斯读，PG 成果最好。',
      },
      {
        q: '语言在中国或俄罗斯有障碍吗？',
        a: '有，但方式不同。中国：英文授课 MBBS 广泛可得；日常生活需普通话（HSK 3-4 足够日常；HSK 4-5 临床执业需要）。俄罗斯：英文授课 MBBS 可得，但多数日常生活 + 临床执业需俄语（对非斯拉夫语者难很多——西里尔字母 + 俄语语法）。仅就语言障碍而言，中国对国际生更容易。',
      },
      {
        q: '医学生气候如何？',
        a: '中国：多元气候。多数 MBBS 城市在华北（北京、沈阳、大连）或华东（南京、杭州、武汉）。冬季寒冷（-10 至 5°C）但夏季温和（25-30°C）。俄罗斯：寒冷气候，尤其北方大学（莫斯科、圣彼得堡、喀山、新西伯利亚）。冬季极寒（-20 至 -5°C 持续数月）。每年 4-6 个月有雪。中国在气候上胜在多数热带国家学生。',
      },
      {
        q: '中国或俄罗斯 MBBS 后能出国做 PG（住院医师）吗？',
        a: '能——两国路径在多数国家支持 PG 资格。美：USMLE + NRMP 匹配。英国：PLAB + Foundation Programme。澳：AMC + 实习。母国（印度、巴基斯坦、尼日利亚等）：本地执照考试（NEXT、PMDC、MDCN）。MBBS 后预期 2-5 年额外临床轮转 + 考试才能进入完整 PG 培训。',
      },
    ],
    howToSteps: [
      {
        name: '核实目标 MBBS 大学已被认证',
        text: '申请前：查世界医学院目录（wdoms.org）确认目标大学 + 项目获 WHO 认证。还要核实你母国医学委员会的认证（NMC 在印度、PMDC 在巴基斯坦、MDCN 在尼日利亚、ECFMG 在美、GMC 在英、AMC 在澳）。',
      },
      {
        name: '通过 NEET（印度学生）或等价入学考试',
        text: '印度学生：在申请任何国际 MBBS 项目前通过 NEET UG（按印度 2018 法规）。巴基斯坦学生：通过 MDCAT。尼日利亚学生：通过 UTME。其他国家：核实本地医学院入学考试要求。',
      },
      {
        name: '对比 3-5 所中国与俄罗斯目标大学',
        text: '建对比表：学费、生活费、学制、气候、英文授课可得性、医院附属、毕业生 NEET 通过率、当前国际生人数。每个国家至少考虑 2-3 个项目。',
      },
      {
        name: '准备申请包',
        text: '高中成绩单（PCB - 物理、化学、生物、英语）、NEET 或等价成绩、护照、雅思 6.0+ / 托福 80+（英文授课项目）、目标陈述（为何读医、为何此国）、2-3 封理科教师推荐信、体检合格证明。并行申请 5-8 个项目。',
      },
      {
        name: '提前 9-12 个月提交申请',
        text: '中国 + 俄罗斯均开设 9 月（秋）入学。提前 9-12 个月提交（10 月-1 月对应 9 月入学）。中国录取需 4-6 周；俄罗斯录取需 2-4 周（更快）。按母国 NEET/MDCAT 结果公布日规划。',
      },
      {
        name: '申请奖学金（中国 CSC、俄罗斯政府奖学金）',
        text: '中国政府奖学金（CSC）覆盖最多 100% MBBS 学费 + 住宿 + 津贴 + 机票。9 月入学请 1-4 月通过中国大学申请。俄罗斯政府奖学金（特定国家可得）覆盖学费 + 住宿。通过俄罗斯文化中心或 Rossotrudnichestvo 申请。',
      },
      {
        name: '收到录取 + 申请学生签证',
        text: '录取后：支付第一年学费 + 住宿。获 JW202（中国）或邀请函（俄罗斯）。申请 X1 签证（中国）或学生签证（俄罗斯）。订机票。预留 4-6 周签证处理时间。',
      },
      {
        name: '在 MBBS 期间规划 PG 路径',
        text: '与 MBBS 并行：为目标目的地的 PG 路径做准备。美：第 4-5 年参加 USMLE Step 1 + 实习期间 Step 2 CK。英国：PLAB 1 + 2 路径。印度：毕业后 NEXT 考试。母国执业：聚焦母国执照考试。MBBS 期间的积极 PG 准备是国际 MBBS 毕业生的首要差异化。',
      },
    ],
    ctaTitle: '准备好申请中国或俄罗斯 MBBS 了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你对比中国 + 俄罗斯 MBBS 项目、核实 WHO + 母国认证、印度学生通过 NEET、申请 CSC 奖学金、并规划你的 PG 路径。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/mbbs-in-china',
        label: '中国 MBBS——完整指南',
        description: '中国顶尖英文授课 MBBS 项目——学制、学费、奖学金、NEET 指导、医院实习、PG 路径。',
      },
      {
        href: '/best-universities-china',
        label: '中国最好的大学',
        description: '所有中国大学按国内排名 + QS 世界排名——2026 标准排名表。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: 'CSC 全额资助顶尖大学的 MBBS——学费 + 住宿 + 津贴 + 机票。',
      },
    ],
  },
};
