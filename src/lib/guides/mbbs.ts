import type { LocalizedGuide } from './types';

/**
 * "MBBS in China for International Students" — long-form guide.
 * Target queries: "mbbs in china", "study medicine in china",
 * "english mbbs china", "china medical school international".
 *
 * Page wrapper fetches the live MBBS program list from the DB
 * and injects it into the `mbbs-programs-table` block at render
 * time. Everything else is static copy + locale variants.
 */
export const mbbsGuide: LocalizedGuide = {
  en: {
    slug: 'mbbs-in-china',
    eyebrow: 'GUIDE · MEDICINE',
    title: 'MBBS in China 2027: English-Taught, MOE-Listed, CSCA',
    description:
      'English-taught MBBS at MOE-listed Chinese universities for 2027: tuition, CSCA requirements, eligibility, scholarships, visa, and licensing back home.',
    subtitle:
      'A 6-year WHO-recognized medical degree in English at MOE-listed universities — with a CSCA score now required by many MBBS programs. Register for the November 2026 sitting (15-21 Oct) to stay on the September 2027 timeline.',
    stats: [
      { value: '¥30-45K', label: 'Annual tuition (USD 4.2-6.3K)' },
      { value: '6 years', label: 'Program length (incl. 1-yr internship)' },
      { value: '43 or 45', label: 'MOE-listed unis [verify]' },
      { value: 'LIVE', label: 'Programs in catalog (see table)' },
    ],
    quickAnswer:
      'MBBS in China is a 6-year English-taught Bachelor of Medicine & Bachelor of Surgery program at MOE-listed universities — the 2026-27 MOE list counts 43 or 45 universities depending on the source [verify]. Tuition is typically ¥30,000-45,000/year (USD 4,200-6,300). Admission requires a high school diploma with strong biology + chemistry and IELTS 6.0+ or equivalent; no HSK is required at admission. Many MBBS programs now also require the CSCA exam — Math plus, at many schools, Chemistry and/or Physics — so check each university\'s notice and sit the November or December 2026 sitting for the September 2027 intake. After graduation you sit your home country\'s licensing exam (USMLE, NMC FMGL criteria, PM&DC, BM&DC, etc.).',
    keyTakeaways: [
      'Only MOE-listed universities may teach clinical medicine in English to international students — the 2026-27 list counts 43 or 45 depending on source [verify]',
      'Tuition ranges ¥30,000-45,000/year — a fraction of US/UK private medical school',
      'Many MBBS programs now require the CSCA (Math + Chemistry/Physics per university) — see /csca-mbbs-applicants; free practice at cscaprep.academy',
      'No HSK Chinese required at admission; you learn medical Chinese during the first 2 years',
      '1-year clinical internship at affiliated teaching hospitals is built into the program',
      'After graduation, licensing depends on your home regulator: USMLE (US), PLAB (UK), AMC (Australia), NMC FMGL 2021 criteria (India) [verify], PM&DC (Pakistan) [verify], BM&DC (Bangladesh)',
    ],
    sections: [
      {
        id: 'what-is-mbbs-china',
        h2: 'What is MBBS in China?',
        intro:
          'MBBS (Bachelor of Medicine, Bachelor of Surgery) is the standard 6-year medical undergraduate degree in most countries. In China it is taught at MOE-listed universities as a Clinical Medicine program in English, with the final year spent in clinical rotation at affiliated teaching hospitals.',
        blocks: [
          {
            type: 'p',
            text: 'The Chinese MBBS curriculum is broadly aligned with international standards: 5 years of classroom + lab + early clinical exposure (anatomy, physiology, biochemistry, pathology, pharmacology, internal medicine, surgery, pediatrics, OB-GYN, etc.), followed by a 1-year clinical internship at an affiliated teaching hospital.',
          },
          {
            type: 'h3',
            text: 'Why study MBBS in China',
            body:
              'Three reasons international students pick China for MBBS: (1) Cost — annual tuition ¥30,000-45,000 versus far higher fees at Western private medical schools; (2) Recognition — MOE-listed universities appear in the WHO World Directory of Medical Schools (WDOMS), so graduates can pursue licensing in many countries; (3) Clinical volume — Chinese teaching hospitals handle enormous patient loads, so you graduate with substantial hands-on experience.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Important: only MOE-listed universities may teach clinical medicine in English to international students. The 2026-27 list counts 43 or 45 universities depending on the source [verify] — always confirm a university is on the current list before applying. The table below lists the ones in the SICA catalog with English-medium 6-year tracks.',
          },
        ],
      },
      {
        id: 'csca-requirement',
        h2: 'CSCA requirement for MBBS applicants',
        intro:
          'Many MBBS programs — including many English-taught ones — now require a CSCA score. Treat it as part of the MBBS application checklist, not a separate concern.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Who requires it** — the CSCA is required for Chinese Government Scholarship undergraduate applicants, and many universities (including many English-taught MBBS programs) require it for direct admission as well. Check each university\'s admission notice',
              '**Subjects** — Math is required for everyone; Physics and/or Chemistry depend on the university and program. MBBS applicants commonly need Math + Chemistry and/or Physics — verify per university',
              '**Format** — 48 multiple-choice questions per subject, 60 minutes per subject. Sit Math first, then Physics or Chemistry in the same booking. Multiple-choice only; no short-answer or essay sections',
              '**When to sit** — 6 sittings a year, mainly online at home with a live proctor. Next confirmed: 14-15 Nov 2026 (register 15-21 Oct, Beijing time), 19-20 Dec 2026, 23-24 Jan 2027. For September 2027 intake, sit November or December 2026',
              '**MBBS-specific guidance** — see our dedicated guide at /csca-mbbs-applicants for subject combinations, timing, and licensing context',
              '**Free practice** — CSCA Prep (https://cscaprep.academy) offers free practice tests, mocks, and study plans for every sitting',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'MBBS deadlines for September 2027 cluster in spring 2027, and CSC scholarship deadlines even earlier (January-April). A CSCA score must exist before those deadlines — the November 2026 sitting is the safe choice.',
          },
        ],
      },
      {
        id: 'eligibility-requirements',
        h2: 'Eligibility requirements: who can apply',
        intro:
          'MBBS in China is open to non-Chinese citizens with a high school diploma and a strong science background. Here is the full checklist.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Nationality** — non-Chinese citizen in good health, no criminal record',
              '**Age** — 18 to 25 years old at the time of admission (most universities cap at 25)',
              '**Education** — high school diploma or equivalent with strong grades in biology + chemistry (physics preferred)',
              '**GPA** — minimum 3.0/4.0 (70%+ in most systems; top universities want 3.5+)',
              '**English proficiency** — IELTS 6.0+ or TOEFL 70+ if English is not your native language',
              '**Medical fitness** — clean bill of health, no infectious diseases (you will complete a physical examination form)',
              '**No HSK required** at admission — Chinese language is taught during the program',
            ],
          },
          {
            type: 'h3',
            text: 'Documents you will need',
            body:
              'High school diploma + official transcripts (notarized English translation), passport (valid 1+ year beyond program start), passport-style photos, personal statement (800-1,200 words), two recommendation letters (from science teachers preferred), IELTS/TOEFL score report, physical examination form (use the university\'s form, completed by a licensed doctor), and a non-criminal record certificate.',
          },
        ],
      },
      {
        id: 'mbbs-programs-table',
        h2: 'MOE-listed MBBS programs in the SICA catalog',
        intro:
          'Every program below is a 6-year English-medium MBBS track at a Chinese university recognized by the WHO World Directory of Medical Schools (WDOMS). The list is pulled from the SICA database and updates as new programs are added.',
        // The table block here is a placeholder — the live page
        // wrapper injects actual rows from the programs API at
        // render time. We keep one empty row here so the static
        // structure still validates if the DB is unreachable.
        blocks: [
          {
            type: 'table',
            caption: 'English-medium MBBS programs at MOE-listed universities (sorted by university ranking)',
            columns: ['Program', 'University', 'Duration', 'Tuition', 'Language'],
            rows: [['(loading from SICA database…)', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'Don\'t see the school you want? SICA tracks every MOE-listed MBBS program in China. Talk to a counselor for the full shortlist.',
          },
        ],
      },
      {
        id: 'tuition-and-costs',
        h2: 'Tuition and total cost',
        intro:
          'MBBS tuition in China is one of the most affordable in the world for a WHO-recognized English-medium medical degree. Here is the full cost breakdown.',
        blocks: [
          {
            type: 'table',
            caption: '6-year total cost comparison (USD)',
            columns: ['Country', 'Tuition/year', '6-year total', 'Notes'],
            rows: [
              ['China (English-medium MBBS)', '¥30,000-45,000 / $4,200-6,300', '$30,000-50,000', 'CSC scholarships available'],
              ['United States (private)', '$50,000-80,000', '$300,000-500,000', 'Including residency'],
              ['United Kingdom (international)', '£25,000-50,000', '£150,000-300,000', '5-6 year program'],
              ['Australia / New Zealand', 'AUD 70,000-90,000', 'AUD 420,000-540,000', '4-6 year program'],
              ['Russia / Ukraine / Philippines', '$4,000-8,000', '$25,000-50,000', 'Lower cost, fewer scholarships'],
            ],
          },
          {
            type: 'h3',
            text: 'All-in budget for MBBS in China (per year)',
            body:
              'Tuition ¥30,000-45,000 + on-campus dorm ¥4,000-8,000 + medical insurance ~¥800 + visa/residence permit ~¥400-800 + living costs ¥18,000-30,000 (outside Tier 1 cities) or ¥30,000-54,000 (Beijing/Shanghai) = **¥53,200-138,800/year total** (USD 7,500-19,500). Most international students can cover this with a CSC scholarship + part-time on-campus work.',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'MBBS scholarships: how to fund your degree',
        intro:
          'Three scholarship layers stack — apply for all three in parallel to maximize your chance of a fully funded seat.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Chinese Government Scholarship (CSC)** — fully funded: tuition + dorm + monthly stipend + settlement allowance + round-trip airfare. The CSCA score is required for CSC undergraduate (MBBS) applicants. Highly competitive; apply by mid-April 2027 for September intake',
              '**University-specific MBBS scholarships** — most MOE-listed universities waive a substantial share of tuition for top applicants. Some also offer monthly stipends. Application is often automatic when you apply for admission',
              '**Provincial government scholarships** — Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong all offer awards for international students at local universities. Separate application; ask your target university\'s international student office',
              '**MBBS-specific partner-country scholarships** — Pakistan, Bangladesh, Indonesia, and several African countries have dedicated lines for medical study in China. Check your home-country\'s Ministry of Education',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'You can apply for CSC and university-specific scholarships in parallel, but you can only hold ONE at a time. Universities decide which award is higher if both come through.',
          },
        ],
      },
      {
        id: 'recognition-after-graduation',
        h2: 'Recognition after graduation',
        intro:
          'A WHO-recognized MBBS from China unlocks medical licensing pathways in 170+ countries. The exact exam depends on where you want to practice.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**United States** — sit USMLE Step 1 + Step 2 CK; match into residency through NRMP',
              '**United Kingdom** — sit PLAB 1 + PLAB 2; register with GMC; Foundation Year 1/2',
              '**Australia** — sit AMC MCQ + AMC Clinical; apply for internship via PMCV',
              '**Canada** — apply through MCC (Medical Council of Canada); NAC + MCCQE1 + MCCQE2',
              '**India** — a China MBBS must meet the NMC FMGL 2021 criteria to qualify for the licensure pathway [verify current NMC rules]; the qualifying exam is NEXT/FMGE per current NMC policy [verify]',
              '**Pakistan** — sit the licensing exam and register with the current regulator, PM&DC (Pakistan Medical & Dental Council) [verify current name and exam]',
              '**Bangladesh** — sit the BMDC registration exam',
              '**Home country** — check your regulator\'s requirements for foreign medical graduates before choosing a university',
            ],
          },
          {
            type: 'p',
            text: 'Practical tip: if your target is the US or UK, look for universities with USMLE/PLAB coaching built into the curriculum. Several MOE-listed universities have dedicated prep modules — ask about current cohort outcomes when you shortlist.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'How long is MBBS in China?',
        a: 'MBBS in China is a 6-year program: 5 years of classroom + lab + early clinical instruction (anatomy, physiology, biochemistry, pathology, pharmacology, internal medicine, surgery, pediatrics, OB-GYN, etc.), followed by a 1-year clinical internship at an affiliated teaching hospital. The internship is hands-on patient care under licensed Chinese physicians.',
      },
      {
        q: 'Is MBBS in China taught in English?',
        a: 'Yes — every program on this page is a full 6-year English-medium track. HSK Chinese is taught as a separate subject (3-4 hours/week in years 1-3) so you can communicate with patients during clinical rotations. You do NOT need to submit an HSK score for admission. Some universities require HSK 4 by graduation.',
      },
      {
        q: 'Is MBBS in China recognized internationally?',
        a: 'MBBS degrees from MOE-listed Chinese universities appear in the WHO World Directory of Medical Schools (WDOMS), which is the baseline for most licensing pathways. What each regulator requires varies: India applies the NMC FMGL 2021 criteria [verify]; Pakistan registers through PM&DC [verify]; the US/UK/Australia run their own licensing exams (USMLE/PLAB/AMC). Check your regulator\'s current rules for foreign medical graduates before choosing a university.',
      },
      {
        q: 'What is the tuition for MBBS in China?',
        a: 'Tuition for English-medium MBBS programs typically runs ¥30,000-45,000/year (~USD 4,200-6,300). The total 6-year cost including tuition, accommodation, insurance, and visa fees is usually under ¥250,000 (~USD 35,000) — about one-fifth of a US private medical school. Some provinces (Xinjiang, Guangxi) charge ¥22,000-28,000/year.',
      },
      {
        q: 'What are the eligibility requirements for MBBS in China?',
        a: 'Non-Chinese citizen in good health, age 18-25, high school diploma with strong science background (biology + chemistry required, physics preferred), minimum GPA 3.0/4.0 (70%+). English proficiency: IELTS 6.0+ or TOEFL 70+. Some universities require an entrance exam in biology + chemistry, or an interview. No HSK required at intake.',
      },
      {
        q: 'Can I get a scholarship for MBBS in China?',
        a: 'Yes. Three main paths: (1) Chinese Government Scholarship (CSC) — fully funded, and the CSCA score is required for undergraduate applications; (2) university-specific scholarships — many MBBS-hosting universities waive a substantial share of tuition for top applicants; (3) provincial government scholarships (Beijing, Shanghai, Jiangsu, etc.). SICA helps you apply for all three in parallel.',
      },
      {
        q: 'Do MBBS applicants need the CSCA?',
        a: 'Many do. The CSCA is required for CSC scholarship undergraduate applicants, and many universities — including many English-taught MBBS programs — require it for direct admission. Math is required for everyone; Physics and/or Chemistry depend on the university, so check each notice. For September 2027, sit the November 2026 (register 15-21 Oct), December 2026, or January 2027 sitting. Details: /csca-mbbs-applicants — free practice at cscaprep.academy',
      },
      {
        q: 'Do I need to learn Chinese for MBBS in China?',
        a: 'You can complete the entire MBBS program in English without speaking Chinese. However, the 1-year clinical internship requires daily patient interaction in Chinese. All MBBS programs include Medical Chinese as a compulsory subject (HSK 4 by graduation is typical). Plan on 3-4 hours/week of Chinese language classes during years 1-3.',
      },
      {
        q: 'What is the MBBS admission process in China?',
        a: 'Six steps: (1) Choose 2-3 MOE-listed universities. (2) Submit online application via university portal or CSC portal. Typical deadline: April-July for September intake. (3) Receive admission notice + JW202 visa form within 4-8 weeks. (4) Apply for X1 student visa at your local Chinese embassy/consulate. (5) Fly to China, complete mandatory health check, register at the university. (6) Begin classes in early September. SICA handles the entire workflow end-to-end.',
      },
    ],
    howToSteps: [
      {
        name: 'Shortlist MOE-listed universities',
        text: 'Use the table on this page to pick 2-3 universities that fit your budget, ranking goals, and city preference. All listed programs are WHO-recognized and taught in English for all 6 years.',
      },
      {
        name: 'Prepare your document package',
        text: 'Gather high school diploma + transcripts (notarized English translation), passport (1+ year validity), IELTS/TOEFL score, two recommendation letters from science teachers, personal statement (800-1,200 words), and physical examination form. Start 4-6 months before the deadline.',
      },
      {
        name: 'Submit online applications',
        text: 'Apply via the Study in China portal (studyinchina.edu.cn) or directly through the university portal. Most MOE-listed universities have rolling admissions from January to July for September intake. Apply to 3-5 universities in parallel.',
      },
      {
        name: 'Apply for CSC scholarship in parallel',
        text: 'If you want full funding, apply for the Chinese Government Scholarship via the CSC portal (campuschina.org) by mid-April. Same deadlines as university admissions but a separate application system. University-specific scholarships are automatic.',
      },
      {
        name: 'Receive admission notice + JW202',
        text: 'Universities issue admission notices and the JW202 visa application form within 4-8 weeks of submission. The JW202 is required for your X1 student visa application.',
      },
      {
        name: 'Apply for X1 student visa',
        text: 'Take your admission notice + JW202 + passport to your local Chinese embassy/consulate. Processing takes 5-10 working days. The X1 visa covers entry for study longer than 180 days — within 30 days of arriving in China you must convert it to a residence permit at the local entry-exit administration.',
      },
      {
        name: 'Arrive in China + register',
        text: 'Arrive 1-2 weeks before orientation. Complete the mandatory health check, register at the university, activate your residence permit, open a bank account, and pick up your student ID. Orientation week covers all of this.',
      },
      {
        name: 'Begin your MBBS program',
        text: 'Classes begin in early September. Year 1 covers foundational medical sciences (anatomy, physiology, biochemistry); clinical rotations begin in year 4; internship year is year 6. Plan on 3-4 hours/week of Medical Chinese throughout.',
      },
    ],
    ctaTitle: 'Ready to apply for MBBS in China?',
    ctaSubtitle:
      'SICA counselors help you shortlist MOE-listed universities, prepare your application package, and apply for medical school scholarships. Free initial consultation.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/guides/scholarships',
        label: 'Scholarships to study in China',
        description: 'CSC, Confucius, university-specific, and provincial scholarships — what each covers and how to apply.',
      },
      {
        href: '/guides/application',
        label: 'How to apply to Chinese universities',
        description: 'Step-by-step timeline, document checklist, language requirements, application channels, and post-admission steps.',
      },
      {
        href: '/guides/visa',
        label: 'China student visa (X1 / X2)',
        description: 'X1 vs X2, document checklist, fees, processing times, residence permit, work rights, and renewals.',
      },
    ],
  },
  zh: {
    slug: 'mbbs-in-china',
    eyebrow: '指南 · 医学',
    title: '2027 来华 MBBS：英文授课、教育部认可、CSCA',
    description:
      '2027 年教育部认可中国大学的英文授课 MBBS：学费、CSCA 要求、申请条件、奖学金、签证与回国执业。',
    subtitle:
      '6 年制 WHO 认证医学学位，英文授课，教育部认可大学开设——许多 MBBS 项目现要求 CSCA 成绩。报名 2026 年 11 月场次（10 月 15-21 日）即可赶上 2027 年 9 月入学。',
    stats: [
      { value: '¥3-4.5 万', label: '年学费（4,200-6,300 美元）' },
      { value: '6 年', label: '学制（含 1 年实习）' },
      { value: '43 或 45 所', label: '教育部认可大学 [待核实]' },
      { value: '实时', label: '目录项目数（见下表）' },
    ],
    quickAnswer:
      '中国 MBBS 为 6 年制英文授课临床医学学士项目，由教育部认可大学开设——2026-27 名单依来源为 43 或 45 所 [待核实]。学费 ¥30,000-45,000/年（4,200-6,300 美元）。申请需高中毕业、生物化学成绩优秀、雅思 6.0+ 或同等英语成绩；入学无需 HSK。许多 MBBS 项目现还要求 CSCA 成绩——数学必考，多数医学院另要求化学和/或物理，请逐校核对招生通知；2027 年 9 月入学应参加 2026 年 11 月或 12 月场次。毕业后参加本国执业考试（USMLE、NMC FMGL 2021 标准、PM&DC、BM&DC 等）。',
    keyTakeaways: [
      '只有教育部认可大学可向国际生英文授课临床医学——2026-27 名单依来源为 43 或 45 所 [待核实]',
      '学费 ¥30,000-45,000/年，远低于美英私立医学院',
      '许多 MBBS 项目现要求 CSCA（数学 + 化学/物理，因校而异）——见 /csca-mbbs-applicants；免费练习 cscaprep.academy',
      '入学时无需 HSK 中文，前两年同步学习医学汉语',
      '课程包含 1 年附属教学医院临床实习',
      '毕业后执业取决于本国监管：USMLE（美）、PLAB（英）、AMC（澳）、NMC FMGL 2021 标准（印度）[待核实]、PM&DC（巴基斯坦）[待核实]、BM&DC（孟加拉）',
    ],
    sections: [
      {
        id: 'what-is-mbbs-china',
        h2: '什么是来华 MBBS？',
        intro:
          'MBBS（临床医学学士）是多数国家标准的 6 年制医学本科。中国由教育部认可大学以英文授课，最后一年在附属教学医院完成临床轮转。',
        blocks: [
          {
            type: 'p',
            text: '中国 MBBS 课程与国际标准基本对齐：5 年课堂 + 实验 + 早期临床（解剖、生理、生化、病理、药理、内科、外科、儿科、妇产科等），随后 1 年在附属教学医院完成临床实习。',
          },
          {
            type: 'h3',
            text: '为什么选择来华攻读 MBBS',
            body:
              '国际生选择中国 MBBS 的三个原因：（1）学费低——年学费 ¥30,000-45,000，远低于西方私立医学院；（2）认证广——教育部认可大学均位列 WHO 世界医学院名录（WDOMS），毕业生可在多国申请执业；（3）临床量大——中国教学医院门诊量巨大，毕业生具备扎实临床经验。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '重要：只有教育部认可大学可向国际生英文授课临床医学。2026-27 名单依来源为 43 或 45 所 [待核实]——申请前务必确认目标大学在现行名单上。下表列出 SICA 目录中提供英文授课 6 年制项目的院校。',
          },
        ],
      },
      {
        id: 'csca-requirement',
        h2: 'MBBS 申请者的 CSCA 要求',
        intro:
          '许多 MBBS 项目——包括许多英文授课项目——现要求 CSCA 成绩。请把它当作 MBBS 申请清单的一部分，而不是单独事项。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**谁要求**——CSC 奖学金本科申请者必须提交；许多大学（含许多英文授课 MBBS）对直接录取也要求。逐校核对招生通知',
              '**科目**——数学全员必考；物理和/或化学取决于大学与项目。MBBS 申请者常见要求为数学 + 化学和/或物理——逐校核实',
              '**形式**——每科 48 道选择题，每科 60 分钟。先考数学，再在同一预约中考物理或化学。纯选择题，无简答或作文',
              '**何时考**——每年 6 场，以居家线上、真人监考为主。已确认：2026 年 11 月 14-15 日（报名 10 月 15-21 日北京时间）、12 月 19-20 日、2027 年 1 月 23-24 日。2027 年 9 月入学应参加 2026 年 11 或 12 月场次',
              '**MBBS 专项指引**——科目组合、时间安排与执业背景见 /csca-mbbs-applicants',
              '**免费练习**——CSCA Prep（https://cscaprep.academy）提供每场次的免费模拟题与学习计划',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '2027 年 9 月入学的 MBBS 截止集中在 2027 年春，CSC 奖学金更早（1-4 月）。CSCA 成绩必须赶在这些截止之前——2026 年 11 月场次是稳妥选择。',
          },
        ],
      },
      {
        id: 'eligibility-requirements',
        h2: '申请条件：谁能申请',
        intro:
          '中国 MBBS 招收非中国公民，需高中毕业且理科基础扎实。完整清单如下。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**国籍**——非中国公民，身心健康，无犯罪记录',
              '**年龄**——入学时 18-25 岁（多数大学上限 25 岁）',
              '**学历**——高中毕业或同等学历，生物 + 化学成绩优秀（物理优先）',
              '**GPA**——至少 3.0/4.0（多数体系 70% 以上；顶尖大学要求 3.5+）',
              '**英语水平**——母语非英语者需雅思 6.0+ 或托福 70+',
              '**身体健康**——无传染病（需完成体检表）',
              '**入学时无需 HSK**——中文为课程内必修',
            ],
          },
          {
            type: 'h3',
            text: '所需材料',
            body:
              '高中毕业证书 + 官方成绩单（公证英文翻译）、护照（有效期超过入学 1 年以上）、护照照片、个人陈述（800-1,200 字）、两封推荐信（理科教师优先）、雅思/托福成绩单、体检表（使用学校指定表格，由执业医师完成）、无犯罪记录证明。',
          },
        ],
      },
      {
        id: 'mbbs-programs-table',
        h2: 'SICA 目录中的教育部认可 MBBS 项目',
        intro:
          '下表所有项目均为 6 年制英文授课 MBBS，由获 WHO 世界医学院名录（WDOMS）认证的中国大学开设。列表从 SICA 数据库实时拉取，新增项目自动出现。',
        blocks: [
          {
            type: 'table',
            caption: '教育部认可大学的英文授课 MBBS 项目（按大学排名排序）',
            columns: ['项目', '大学', '学制', '学费', '授课语言'],
            rows: [['（从 SICA 数据库加载中…）', '—', '—', '—', '—']],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '没看到想去的学校？SICA 跟踪中国所有教育部认可的 MBBS 项目。联系顾问获取完整名单。',
          },
        ],
      },
      {
        id: 'tuition-and-costs',
        h2: '学费与总费用',
        intro:
          '中国 MBBS 是全球最经济实惠的 WHO 认证英文医学学位之一。完整费用明细如下。',
        blocks: [
          {
            type: 'table',
            caption: '6 年总费用对比（美元）',
            columns: ['国家', '年学费', '6 年总费用', '备注'],
            rows: [
              ['中国（英文授课 MBBS）', '¥30,000-45,000 / $4,200-6,300', '$30,000-50,000', '可申请 CSC 奖学金'],
              ['美国（私立）', '$50,000-80,000', '$300,000-500,000', '含住院医师培训'],
              ['英国（国际生）', '£25,000-50,000', '£150,000-300,000', '5-6 年制'],
              ['澳大利亚 / 新西兰', 'AUD 70,000-90,000', 'AUD 420,000-540,000', '4-6 年制'],
              ['俄罗斯 / 乌克兰 / 菲律宾', '$4,000-8,000', '$25,000-50,000', '费用低，奖学金少'],
            ],
          },
          {
            type: 'h3',
            text: '来华 MBBS 全年总预算',
            body:
              '学费 ¥30,000-45,000 + 校内住宿 ¥4,000-8,000 + 医疗保险 ~¥800 + 签证/居留许可 ~¥400-800 + 生活费 ¥18,000-30,000（非一线城市）或 ¥30,000-54,000（北京/上海）= **¥53,200-138,800/年**（7,500-19,500 美元）。多数国际生可借助 CSC 奖学金 + 校内兼职覆盖。',
          },
        ],
      },
      {
        id: 'scholarships',
        h2: 'MBBS 奖学金：如何为学位筹款',
        intro:
          '三层奖学金可叠加——并行申请所有三种以最大化获得全额资助的机会。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**中国政府奖学金（CSC）**——全额资助：学费 + 住宿 + 月度生活补贴 + 安家费 + 往返机票。CSC 本科（MBBS）申请者须提交 CSCA 成绩。竞争激烈；2027 年 9 月入学请于 2027 年 4 月中前申请。',
              '**院校 MBBS 奖学金**——多数教育部认可大学为优秀申请者减免大比例学费。部分提供月度补贴。多随入学申请自动评审。',
              '**省市奖学金**——北京、上海、江苏、浙江、广东均提供国际生奖学金。需单独申请；向目标学校国际学生办公室咨询。',
              '**伙伴国专项 MBBS 奖学金**——巴基斯坦、孟加拉、印尼及多个非洲国家设有来华医学专项。请咨询本国教育部。',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSC 与院校奖学金可并行申请，但最终只能获得其一。若两项均获批，学校会按金额较高的执行。',
          },
        ],
      },
      {
        id: 'recognition-after-graduation',
        h2: '毕业后的国际认证',
        intro:
          'WHO 名录内的中国 MBBS 是多数国家医师执业路径的起点。具体考试视执业国家而定。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**美国**——参加 USMLE Step 1 + Step 2 CK；通过 NRMP 匹配住院医师',
              '**英国**——参加 PLAB 1 + PLAB 2；在 GMC 注册；Foundation Year 1/2',
              '**澳大利亚**——参加 AMC MCQ + AMC Clinical；通过 PMCV 申请实习',
              '**加拿大**——通过 MCC（加拿大医学会）申请；NAC + MCCQE1 + MCCQE2',
              '**印度**——中国 MBBS 须满足 NMC FMGL 2021 标准 [以现行 NMC 规则核实]；资格考试按 NMC 现行政策为 NEXT/FMGE [待核实]',
              '**巴基斯坦**——参加执业考试并向现行监管机构 PM&DC（巴基斯坦医学与牙科委员会）注册 [机构名称与考试以现行规定核实]',
              '**孟加拉国**——参加 BMDC 注册考试',
              '**本国**——择校前先核实本国监管机构对海外医学毕业生的现行要求',
            ],
          },
          {
            type: 'p',
            text: '实用建议：若目标是美国或英国，请挑选将 USMLE/PLAB 备考纳入课程的大学。多所教育部认可院校开设专项备考模块——择校时直接询问近年毕业生的考试结果。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '来华 MBBS 学制多长？',
        a: '中国 MBBS 为 6 年制：5 年课堂 + 实验 + 早期临床（解剖、生理、生化、病理、药理、内科、外科、儿科、妇产科等），随后 1 年在附属教学医院完成临床实习。实习阶段由具备中国执业资格的医师带教。',
      },
      {
        q: 'MBBS 是否全英文授课？',
        a: '是——本页所有项目均为 6 年制全英文授课。医学汉语作为单独课程同步教学（第 1-3 年每周 3-4 小时），以便在临床实习阶段与患者沟通。入学时无需提交 HSK 成绩。部分大学毕业前要求 HSK 4 级。',
      },
      {
        q: '来华 MBBS 是否获得国际认证？',
        a: '教育部认可的中国大学 MBBS 学位列于 WHO 世界医学院名录（WDOMS），这是多数执业路径的基础。各国监管要求不同：印度适用 NMC FMGL 2021 标准 [待核实]；巴基斯坦经 PM&DC 注册 [待核实]；美英澳各有执业考试（USMLE/PLAB/AMC）。择校前请核实本国监管机构对海外医学毕业生的现行规则。',
      },
      {
        q: '来华 MBBS 学费多少？',
        a: '英文授课 MBBS 学费通常为 ¥30,000-45,000/年（约 4,200-6,300 美元）。含学费、住宿、保险、签证在内的 6 年总费用通常不超过 ¥250,000（约 3.5 万美元），远低于美国私立医学院。新疆、广西等地部分院校同类型项目学费低至 ¥22,000-28,000/年。',
      },
      {
        q: 'MBBS 入学条件有哪些？',
        a: '非中国公民、身心健康、18-25 岁、高中毕业且理科基础扎实（生物 + 化学为必修，物理优先）、GPA 至少 3.0/4.0（或 70% 以上）。英语要求：母语非英语者需雅思 6.0+ 或托福 70+。部分大学要求生物化学笔试或面试。入学时无 HSK 要求。',
      },
      {
        q: 'MBBS 是否可申请奖学金？',
        a: '可以。三种主要路径：（1）中国政府奖学金（CSC）——全额资助，本科申请者须提交 CSCA 成绩；（2）院校奖学金——多数 MBBS 招生院校为优秀申请者减免大比例学费；（3）省市奖学金（北京、上海、江苏等）。SICA 可协助并行申请。',
      },
      {
        q: 'MBBS 申请者需要 CSCA 吗？',
        a: '许多需要。CSC 奖学金本科申请者必须提交；许多大学（含许多英文授课 MBBS）对直接录取也要求。数学全员必考；物理和/或化学因校而异，请逐校核对通知。2027 年 9 月入学应参加 2026 年 11 月（报名 10 月 15-21 日）、12 月或 2027 年 1 月场次。详见 /csca-mbbs-applicants——免费练习 cscaprep.academy',
      },
      {
        q: '攻读 MBBS 是否需要学中文？',
        a: '可不使用中文完成全部课程。但 1 年临床实习要求日常用中文与患者交流。所有 MBBS 项目均将医学汉语列为必修课（毕业前通常要求 HSK 4 级）。建议第 1-3 年每周安排 3-4 小时中文学习。',
      },
      {
        q: '来华 MBBS 完整申请流程？',
        a: '六步走：（1）挑选 2-3 所教育部认可大学；（2）通过学校官网或 CSC 系统提交在线申请。9 月入学通常截止于 4-7 月；（3）4-8 周内收到录取通知书 + JW202 签证表；（4）前往本国中国大使馆/领事馆申请 X1 学生签证；（5）抵华后完成强制体检与入学注册，并在入境 30 天内将 X1 签证换发为居留许可；（6）9 月初正式开课。SICA 可全程代办。',
      },
    ],
    howToSteps: [
      {
        name: '筛选教育部认可大学',
        text: '通过本页表格挑选 2-3 所符合预算、排名与城市偏好的大学。所有项目均 WHO 名列、全英文授课 6 年。',
      },
      {
        name: '准备申请材料',
        text: '高中毕业证书 + 成绩单（公证英文翻译）、护照（1 年以上有效期）、雅思/托福成绩、两封理科教师推荐信、个人陈述（800-1,200 字）、体检表。建议截止日期前 4-6 个月开始准备。',
      },
      {
        name: '提交在线申请',
        text: '通过 Study in China 系统（studyinchina.edu.cn）或学校官网直接申请。多数教育部认可大学 1-7 月滚动录取 9 月入学。建议同时申请 3-5 所。',
      },
      {
        name: '并行申请 CSC 奖学金',
        text: '如需全额资助，通过 CSC 系统（campuschina.org）申请中国政府奖学金。申请截止日期与学校类似但走单独系统。院校奖学金自动评审。',
      },
      {
        name: '收到录取通知书 + JW202',
        text: '学校通常在申请后 4-8 周内发放录取通知书与 JW202 签证申请表。JW202 是申请 X1 学生签证的必需文件。',
      },
      {
        name: '申请 X1 学生签证',
        text: '携带录取通知书、JW202、护照前往本国中国大使馆/领事馆。处理时间 5-10 个工作日。X1 签证用于超过 180 天的学习入境——抵华后须在 30 天内到当地出入境管理部门换发居留许可。',
      },
      {
        name: '抵华 + 注册',
        text: '建议开学前 1-2 周到达。完成强制体检、学校注册、激活居留许可、开设银行账户、领取学生证。开学周统一安排上述流程。',
      },
      {
        name: '开始 MBBS 课程',
        text: '9 月初正式开课。第 1 年为基础医学（解剖、生理、生化）；第 4 年起进入临床轮转；第 6 年为实习年。期间需每周 3-4 小时学习医学汉语。',
      },
    ],
    ctaTitle: '准备好申请来华 MBBS 了吗？',
    ctaSubtitle:
      'SICA 顾问可帮你筛选教育部认可大学、准备申请材料、申请医学院奖学金。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/guides/scholarships',
        label: '中国留学奖学金',
        description: 'CSC、孔子学院、院校、省市奖学金——各自覆盖什么，怎么申请。',
      },
      {
        href: '/guides/application',
        label: '中国大学申请全流程',
        description: '逐步时间线、材料清单、语言要求、申请渠道、录取后步骤。',
      },
      {
        href: '/guides/visa',
        label: '中国学生签证 (X1 / X2)',
        description: 'X1 vs X2、材料清单、费用、办理时长、居留许可、兼职、续签。',
      },
    ],
  },
};