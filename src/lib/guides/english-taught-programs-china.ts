import type { LocalizedGuide } from './types';

/**
 * "English-Taught Programs in China: a Guide for Students Who Don't
 * Speak Chinese" — listicle guide. Target queries: "english taught
 * programs china", "study in china without chinese", "english
 * medium degree china", "taught in english china", "etp
 * universities", "english bachelor china", "english master china".
 *
 * Different angle from /csca-english-taught-programs (which is
 * narrowly about CSCA exemption), /study-in-china-without-ielts
 * (which is about IELTS exemption routes), and /guides/visa (which
 * is about visa mechanics). This guide is the broad ETP landscape
 * — what exists, where, what subjects, how to apply, scholarships,
 * and the realistic English-campus experience.
 */
export const englishTaughtProgramsGuide: LocalizedGuide = {
  en: {
    slug: 'english-taught-programs-china',
    eyebrow: 'GUIDE · ENGLISH-TRACK',
    title: 'English-Taught Programs in China: 2027 Guide for Non-Chinese Speakers',
    description:
      'English-taught bachelor\'s, master\'s and PhD programs in China for 2027 — the MOE ETP catalog, top universities by ETP depth, subjects with the biggest catalogs, admissions pathway, CSC scholarships, and what the English-track campus experience actually looks like.',
    subtitle:
      'China is one of the largest English-taught-degree markets in Asia — over 300 universities now run ETP bachelor\'s and master\'s programs in engineering, business, medicine, computer science, and the natural sciences, all taught in English without an HSK requirement. The MOE publishes an official ETP catalog each cycle; the C9 League + ~30 strong research universities lead it. You apply with IELTS/TOEFL (no Chinese needed) — but you still sit the CSCA from the 2026 intake, even on the English track. Here is the landscape, the universities to target by field, the admissions pathway, and what to budget for an English-taught China degree in 2027.',
    stats: [
      { value: '300+', label: 'Universities with ETP programs' },
      { value: 'C9 + ~30', label: 'Flagships with deep ETP catalogs' },
      { value: '6 fields', label: 'Largest ETP catalogs' },
      { value: 'IELTS 5.5–7.5', label: 'Typical English requirement' },
    ],
    quickAnswer:
      'Over 300 Chinese universities run English-taught bachelor\'s, master\'s, and PhD programs covering engineering, business, computer science, medicine (MBBS), the natural sciences, and an expanding set of humanities and law programs — the largest ETP catalog in any single non-Anglophone country. The MOE (Ministry of Education) publishes an official ETP catalog each cycle that your target university operates under; the deepest catalogs are at Tsinghua, Peking, Fudan, Shanghai Jiao Tong, Zhejiang, USTC, Sun Yat-sen, Wuhan, and a cluster of strong research universities that publish full English-medium bachelor\'s degrees. Admissions run on the same calendar as Chinese-taught programs (Sep primary intake, Mar secondary) with IELTS 5.5–7.5+ or TOEFL 60–100+ instead of HSK; the CSCA exam is required from the 2026 intake even on the English track, and CSC scholarships are open to English-track applicants.',
    keyTakeaways: [
      '300+ Chinese universities run ETP bachelor\'s, master\'s, and PhD programs — the largest non-Anglophone ETP catalog in Asia',
      'Deepest catalogs: Tsinghua, Peking, Fudan, Shanghai Jiao Tong, Zhejiang, USTC, Sun Yat-sen, Wuhan, Nanjing, Huazhong UST, Harbin IT, XJTU, Tongji, Beihang, Central South',
      'Admissions requirement is IELTS 5.5–7.5+ or TOEFL 60–100+ instead of HSK — no Chinese required to apply',
      'CSCA is required even on the English track from the 2026 intake; Math + 1–2 subjects of your program\'s choice',
      'MBBS taught in English is the largest single ETP category — 45 MOE-listed universities offer English-medium MBBS',
      'Tuition for ETP programs: ¥18,000–50,000/year (bachelor\'s); ¥25,000–70,000/year (master\'s); same dorm + living costs as Chinese-track',
      'CSC scholarship fully funds ETP students the same as Chinese-track applicants (tuition + dorm + stipend + insurance + airfare for some channels)',
      'The English-track campus experience: lecture halls are 100% English, course materials in English, exams in English; daily life (banking, hospitals, grocery delivery) is mixed Chinese/English',
    ],
    sections: [
      {
        id: 'etp-landscape',
        h2: 'The English-taught landscape in China',
        intro:
          'English-taught degree programs in China have grown from a few dozen pilot programs in the early 2010s to over 300 universities running ETP bachelor\'s, master\'s, and PhD programs today.',
        blocks: [
          {
            type: 'p',
            text: 'The MOE (Ministry of Education) maintains an official ETP catalog by institution: a published list of programs a university is allowed to teach in English, the duration, tuition band, and intake capacity. Each cycle, the catalog is republished with adjustments to scope — some universities add new ETP programs, others retire under-enrolled ones. Your target university\'s ETP catalog is the binding document: if the MOE catalog does not list your program as English-medium for the current cycle, it cannot be advertised as ETP regardless of what the marketing says.',
          },
          {
            type: 'ul',
            items: [
              '**Scale** — over 300 Chinese universities operate ETP bachelor\'s, master\'s, or PhD programs (per the latest MOE cycle); the full ETP catalog grows cycle by cycle but the headline count has been roughly stable since 2022',
              '**Where it lives** — engineering, business, computer science, clinical medicine (MBBS), economics, finance, public health, and the natural sciences dominate; humanities and law are growing but still smaller',
              '**The flagship cluster** — the C9 League (Peking, Tsinghua, Fudan, SJTU, Zhejiang, USTC, Nanjing, Harbin IT, Xi\'an Jiaotong) + ~30 strong research universities publish the deepest ETP catalogs with full bachelor\'s and master\'s coverage',
              '**Why it exists** — China is the world\'s largest source of international students, and Anglophone markets (US, UK, Australia, Canada) are increasingly expensive and competitive; ETP is the official route to capture students who want a Chinese degree at English-track tuition without a multi-year Chinese-language prerequisite',
              '**Quality control** — programs are MOE-listed and re-audited each cycle; English-medium degrees are recognized by China\'s MOE and (for accredited programs) by foreign credential services like WES, ECE, and most home-country ministries',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The MOE ETP catalog is the authoritative source — it is republished annually and the previous cycle\'s catalog may list programs the new one does not. Always verify the program is in the current MOE ETP catalog before applying; the university\'s international student office can confirm if you are unsure.',
          },
        ],
      },
      {
        id: 'best-etp-universities',
        h2: 'Best universities for English-taught programs',
        intro:
          'The top ETP universities in China split into two buckets: the flagship group with broad ETP coverage (full bachelor\'s and master\'s) and the subject-strong group with deep but narrower coverage (e.g., Harbin IT\'s mechanical engineering ETP).',
        blocks: [
          {
            type: 'table',
            caption: 'Universities with the deepest ETP catalogs (by subject coverage)',
            columns: ['University', 'City', 'Strongest ETP subjects', 'Bachelor\'s ETP coverage'],
            rows: [
              ['Tsinghua University', 'Beijing', 'Engineering, Computer Science, Public Policy, Schwarzman Scholars (master\'s)', 'Full bachelor\'s + master\'s ETP catalog'],
              ['Peking University', 'Beijing', 'Economics, International Relations, Sciences, Yenching Academy', 'Full bachelor\'s + master\'s ETP catalog'],
              ['Fudan University', 'Shanghai', 'Economics, Business, Journalism, Public Health', 'Full bachelor\'s + master\'s ETP catalog'],
              ['Shanghai Jiao Tong University', 'Shanghai', 'Engineering, Computer Science, UM-SJTU Joint Institute', 'Full bachelor\'s + master\'s ETP catalog'],
              ['Zhejiang University', 'Hangzhou', 'Engineering, Computer Science, Medicine, Business', 'Full bachelor\'s + master\'s ETP catalog'],
              ['USTC', 'Hefei', 'Physics, Computer Science, Mathematics, Chemistry', 'Strong bachelor\'s + master\'s ETP catalog'],
              ['Sun Yat-sen University', 'Guangzhou', 'Medicine (MBBS), Business, Sciences', 'Strong MBBS ETP + business ETP'],
              ['Wuhan University', 'Wuhan', 'Sciences, Engineering, Public Health', 'Full bachelor\'s + master\'s ETP catalog'],
              ['Nanjing University', 'Nanjing', 'Sciences, Humanities, Business', 'Full bachelor\'s + master\'s ETP catalog'],
              ['Huazhong UST', 'Wuhan', 'Engineering, Computer Science, Medicine', 'Strong ETP catalog'],
              ['Harbin Institute of Technology', 'Harbin / Weihai / Shenzhen', 'Engineering (mechanical, EE, materials), Computer Science', 'Full ETP across three campuses'],
              ['Xi\'an Jiaotong University', 'Xi\'an', 'Engineering, Medicine, Management', 'Strong ETP catalog'],
              ['Tongji University', 'Shanghai', 'Engineering, Architecture, Automotive (with German roots)', 'Strong ETP catalog'],
              ['Beihang University', 'Beijing', 'Aerospace, Engineering, Computer Science', 'Strong ETP catalog'],
              ['Central South University', 'Changsha', 'Medicine, Engineering, Materials', 'Strong ETP catalog'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**C9 League** — Peking, Tsinghua, Fudan, SJTU, Zhejiang, USTC, Nanjing, Harbin IT, Xi\'an Jiaotong — all 9 have deep ETP catalogs; the most selective options',
              '**985 engineering powerhouse cluster** — Harbin IT, Beihang, Huazhong UST, XJTU, Central South, Tongji, TianJin University — best for engineering and applied science ETP candidates',
              '**MBBS-strong cluster** — Sun Yat-sen, Wuhan, Fudan, Jilin, Shandong, XJTU, Central South, Nantong — the MOE-listed MBBS universities with the largest English-medium MBBS cohorts',
              '**Business-strong cluster** — CEIBS (Shanghai), Fudan, Tsinghua, SJTU Antai, Renmin, Zhejiang, Lingnan (Sun Yat-sen) — for English-medium MBA and business master\'s',
              '**Regional research universities** — Nanjing, Huazhong UST, Wuhan, XJTU, Sun Yat-sen, Shandong, Jilin — strong ETP coverage at lower tuition than the top 5',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For maximum ETP choice, start with the C9 + ~15 strong research universities — roughly 25 institutions cover 80%+ of the ETP demand from international bachelor\'s applicants.',
          },
        ],
      },
      {
        id: 'subject-coverage',
        h2: 'Which subjects have the biggest ETP catalogs?',
        intro:
          'Engineering, business, and clinical medicine dominate English-taught enrollments; humanities and law are catching up; the natural sciences have full coverage across the C9. Your intended subject partly determines your university shortlist.',
        blocks: [
          {
            type: 'table',
            caption: 'ETP subject coverage by size of catalog',
            columns: ['Subject', 'Approximate ETP bachelor\'s catalog size', 'Top destinations'],
            rows: [
              ['Engineering (general + EE + ME + Civil)', 'Large — 100+ programs', 'Harbin IT, Beihang, Tsinghua, SJTU, Tongji, XJTU'],
              ['Computer Science + Software + AI', 'Large — 80+ programs', 'Zhejiang, SJTU, USTC, Tsinghua, Peking, Huazhong UST'],
              ['MBBS (Clinical Medicine, English-medium)', 'Very large — 45 universities', 'Sun Yat-sen, Wuhan, Jilin, Fudan, XJTU, Shandong, Central South'],
              ['Business (BBA / Economics / Finance)', 'Large — 80+ programs', 'CEIBS, Fudan, Tsinghua, SJTU Antai, Renmin, Zhejiang'],
              ['Natural Sciences (Physics, Chemistry, Biology)', 'Medium — 40+ programs', 'USTC, Peking, Fudan, Nanjing, Zhejiang, Wuhan'],
              ['Mathematics + Statistics', 'Medium — 30+ programs', 'Peking, Tsinghua, Fudan, USTC, Zhejiang, SJTU'],
              ['Public Health, Nursing', 'Medium — 25+ programs', 'Peking, Fudan, Sun Yat-sen, Wuhan, Huazhong UST'],
              ['Public Policy, International Relations', 'Small — 15+ programs', 'Tsinghua, Peking, Fudan, Renmin, UIBE (Beijing)'],
              ['Law (LLB, LLM)', 'Small — 10+ programs', 'Tsinghua, Peking, Renmin, Fudan, Wuhan'],
              ['Humanities, Chinese Studies', 'Small — 10+ programs (often Chinese-track)', 'Peking, Fudan, Nanjing, Wuhan, Tsinghua'],
              ['Journalism, Communications', 'Small — 5+ programs', 'Tsinghua, Fudan, Renmin, CUC'],
              ['Art, Design, Music, Film', 'Very small — <10 programs per field', 'Tsinghua (Academy of Art & Design), Central Academy of Fine Arts, Beijing Film Academy, Shanghai Theatre Academy'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Engineering is the largest ETP category** — your engineering ETP choices outnumber every other field by a factor of 2-3',
              '**MBBS in English** has the highest international-student density — 45 universities run it, and the cohort is 70%+ international',
              '**Business ETP** is concentrated at the top — fewer universities, but the programs are well-funded and well-marketed to international applicants',
              '**Humanities + law ETP** is the smallest category — top universities offer selective programs, but most humanities at the bachelor\'s level are still Chinese-taught',
              '**Art and design ETP** is rare — if your target is art or design, verify the program is in the MOE ETP catalog for the 2027 cycle before committing',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The subject mix in the MOE ETP catalog has been stable for engineering, computer science, and medicine. Humanities and design grow by 5-10 programs per cycle — always check the current cycle\'s catalog.',
          },
        ],
      },
      {
        id: 'admissions-english',
        h2: 'How to apply — the admissions pathway',
        intro:
          'ETP applications run the same calendar as Chinese-taught programs (September primary intake, March secondary) but with English language tests replacing HSK.',
        blocks: [
          {
            type: 'table',
            caption: 'ETP admissions — language + document requirements by degree level',
            columns: ['Requirement', 'Bachelor\'s ETP', 'Master\'s ETP', 'PhD ETP'],
            rows: [
              ['English test', 'IELTS 5.5–7.5+ / TOEFL 60–100+', 'IELTS 6.5+ / TOEFL 80+', 'IELTS 6.5+ / TOEFL 90+'],
              ['CSCA exam', 'Required (2026 intake onward)', 'Not required for master\'s/PhD (under current rules; verify cycle)', 'Not required'],
              ['Chinese test (HSK)', 'Waived on ETP path', 'Waived on ETP path', 'Waived on ETP path'],
              ['GPA', 'High school transcript + strong grades', 'Bachelor\'s degree + 3.0+/4.0 (75%+)', 'Master\'s + 3.3+/4.0 (80%+)'],
              ['Recommendation letters', '1–2 (academic)', '2 (academic + work/research)', '2–3 (research supervisors)'],
              ['Study plan / personal statement', '500–1,000 words', '800–1,500 words', '1,500–3,000 words research proposal'],
              ['Interview', 'Rare', 'Common (especially thesis track)', 'Standard (research presentation)'],
              ['Pre-admission letter (for CSC)', 'Strongly recommended', 'Strongly recommended', 'Strongly recommended (supervisor pre-match essential)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**English tests** — top programs want IELTS 6.5+ (master\'s) or 7.0+ (PhD); bachelor\'s ETP thresholds vary (5.5–7.5+) with the most selective programs at the top of the band',
              '**CSCA is required even on the English track from the 2026 intake** — see /csca-english-taught-programs for the CSCA-specific exemption/waiver landscape and which programs accept the four-subject route',
              '**No HSK required on the ETP path** — but basic Chinese (survival-level) is helpful for daily life outside campus; free Chinese courses are bundled into most bachelor\'s ETP programs',
              '**Pre-admission letter** — increasingly expected for both CSC and direct-admission routes; apply to your target university first (Sep–Dec for the next intake) and use the pre-admission letter to anchor your CSC application',
              '**Documents** — passport, transcripts with certified English translation, English language scores, 1–3 recommendation letters, study plan + (PhD) research proposal, physical exam (post-acceptance)',
              '**Application channels** — same as Chinese-taught: university international student portal (university route, Type B), Chinese embassy (Bilateral), CSC partner institution',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The CSCA requirement applies to ETP bachelor\'s applicants from the 2026 intake onward — a common misconception is that English-taught = no CSCA. Plan CSCA into the application calendar regardless of language track.',
          },
        ],
      },
      {
        id: 'csca-english-track',
        h2: 'The CSCA on the English track — what you sit and what to expect',
        intro:
          'ETP bachelor\'s applicants sit the CSCA from the 2026 intake — the exam is in English (for ETP-track candidates) and the subject mix typically fits Math + 1–2 program-specific subjects.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Exam language** — the CSCA for ETP-track candidates is administered in English (paper + oral instructions); confirm on the CSCA portal before your sitting',
              '**Subject mix for ETP candidates** — Math is required for everyone; Physics and/or Chemistry depend on the program (engineering often wants Math + Physics, MBBS wants Math + Chemistry, business + humanities often wants just Math)',
              '**Professional Chinese** — the four-subject track (Math + Professional Chinese + 2 electives) applies only to Chinese-medium programs; ETP candidates do not sit Professional Chinese',
              '**Fee band** — same as Chinese-track: RMB 450 for one subject, RMB 700 for two or more; pay via Alipay / WeChat / bank transfer during the registration window',
              '**Planning** — for a September 2027 ETP intake, sit the CSCA in November 2026 (14–15), December 2026, or January 2027 so the score exists before CSC deadlines in January–April 2027',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For the full CSCA-ETP deep-dive (waiver routes, common mistakes, what a strong ETP-track score looks like), see /csca-english-taught-programs — the dedicated CSCA-angle guide.',
          },
        ],
      },
      {
        id: 'csc-scholarship-english',
        h2: 'CSC scholarship + university funding for ETP students',
        intro:
          'CSC is open to English-track applicants on the same terms as Chinese-track — full tuition + dorm + monthly stipend + insurance + airfare for most channels.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSC eligibility** — same for ETP and Chinese-track; non-Chinese citizen, academic record (GPA 3.0+ for most programs, 3.3+ for selective), English test (IELTS 6.5+ or TOEFL 90+ commonly), 1–2 recommendation letters',
              '**CSC channels** — same four: embassy/Bilateral, university (Type B), partner institution, special programs; ETP candidates most often apply through the university route (Type B)',
              '**Stipends** — same band by degree (bachelor\'s 2,500, master\'s 3,000, PhD 3,500 CNY/month as a working figure; verify on the current CSC notice)',
              '**University top-up funding** — many universities add their own scholarship to ETP candidates (extra monthly stipend, research grants, tuition waivers); stacking CSC + university top-up is the optimal funding stack',
              '**Provincial government scholarships** — Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong each run their own ETP-eligible scholarship pools, usually separate from CSC',
              '**Tuition for self-funded ETP students** — bachelor\'s ¥18,000–50,000/year, master\'s ¥25,000–70,000/year; MBBS in English typically ¥40,000–60,000/year; business master\'s (MBA) typically ¥80,000–200,000 total program cost',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For full CSC coverage detail, see /chinese-government-scholarship-csc — the dedicated CSC-angle guide. ETP and Chinese-track applications follow the same CSC process.',
          },
        ],
      },
      {
        id: 'campus-experience',
        h2: 'The English-track campus experience — what it actually looks like',
        intro:
          'ETP students spend lecture hours in English but step into a Chinese-speaking daily life outside campus. Here is the realistic mixed-language experience.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Lectures and assessments are 100% English** — class time, slides, textbooks, exams, thesis writing',
              '**Daily life is mixed Chinese / English** — banking, hospitals, grocery delivery, transport apps, and city services are primarily Chinese-language; most ETP students carry a translation app (Pleco, Google Translate, DeepL) for the first 3-6 months',
              '**Free Chinese courses are bundled into most bachelor\'s ETP programs** — 2-4 credits of Chinese per semester; not required for graduation but heavily recommended',
              '**International student offices** — every university has one with English-speaking staff for admissions, visa, and day-to-day support',
              '**Buddies + mentors** — most programs pair incoming ETP students with upper-class international students; helps with bank account opening, phone SIM, dorm setup, and the first-week logistics',
              '**Cultural services** — international student associations run orientation week, Mid-Autumn Festival, Lunar New Year events; the international dorms are the social hub for ETP students in the first year',
              '**Internships and work** — same visa rules as Chinese-track students (≤20 hours/week on-campus under X1, off-campus in 9 pilot cities with prior approval)',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Bring the same expectations you\'d have for studying in any second-language country: English for academics, mixed for daily life. Students who arrive with a survival-Chinese mindset and carry a translation app for the first semester tend to settle fastest.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Can I study in China without speaking Chinese?',
        a: 'Yes — over 300 Chinese universities run English-taught programs at the bachelor\'s, master\'s, and PhD level covering engineering, business, computer science, MBBS, and the natural sciences. No HSK (Chinese proficiency test) is required to apply; an IELTS or TOEFL score is the language requirement instead.',
      },
      {
        q: 'Which Chinese universities have the most English-taught programs?',
        a: 'The C9 League (Peking, Tsinghua, Fudan, SJTU, Zhejiang, USTC, Nanjing, Harbin IT, XJTU) + ~30 strong research universities run the deepest catalogs. For engineering, Harbin IT, Beihang, SJTU, Tsinghua, XJTU, and Tongji lead; for MBBS, Sun Yat-sen, Wuhan, Jilin, Fudan, and XJTU; for business, CEIBS, Fudan, Tsinghua, and SJTU Antai.',
      },
      {
        q: 'Do English-taught programs require the CSCA exam?',
        a: 'Yes — from the 2026 intake onward, CSCA scores are required for bachelor\'s applicants regardless of language track, including ETP students. The CSCA is administered in English for ETP-track candidates. The fee band is the same (RMB 450–700). See /csca-english-taught-programs for the dedicated CSCA-angle guide.',
      },
      {
        q: 'Is English-taught more expensive than Chinese-taught?',
        a: 'Tuition for ETP programs is generally 10-30% higher than Chinese-taught at the same university — bachelor\'s ¥18,000–50,000/year for ETP, master\'s ¥25,000–70,000/year, MBBS in English ¥40,000–60,000/year. Dorm and living costs are the same. CSC scholarship covers the full tuition difference for funded students.',
      },
      {
        q: 'Will my English-taught Chinese degree be recognized?',
        a: 'Yes — MOE-listed ETP degrees are recognized by China\'s Ministry of Education and by foreign credential services (WES, ECE in the US; ENIC-NARIC networks in Europe). For home-country licensing (US bar, UK medical, etc.), check the specific licensing body\'s recognition list — most accept ETP degrees accredited by MOE, but verify per profession.',
      },
      {
        q: 'What about scholarships for ETP students?',
        a: 'CSC scholarship is open to ETP applicants on the same terms as Chinese-track (full tuition + dorm + monthly stipend + insurance + airfare for most channels). Many universities add their own scholarships on top (extra monthly stipend, tuition waivers, research grants). Provincial government scholarships (Beijing, Shanghai, Jiangsu, Zhejiang, Guangdong) are also ETP-eligible.',
      },
      {
        q: 'Can I work part-time on an English-taught program?',
        a: 'Yes — under the X1 student visa, you can work ≤20 hours/week on campus with university approval (typical pay: ¥1,500–3,000/month for library, lab, RA, or tutoring roles). Off-campus work is restricted but possible with prior approval in 9 pilot cities (Beijing, Shanghai, Guangzhou, Shenzhen, etc.).',
      },
      {
        q: 'What is the deadline for September 2027 ETP intake?',
        a: 'For C9 universities + competitive ETP programs (Tsinghua, Peking, Fudan, SJTU, Zhejiang, USTC), apply by March 2027 for September intake — earlier is competitive. For mid-tier universities, deadlines run April–June 2027; less-selective universities accept rolling applications through August 2027. CSC scholarship deadlines for September 2027 cluster January–April 2027.',
      },
    ],
    howToSteps: [
      {
        name: 'Verify your target program is in the MOE ETP catalog',
        text: 'Check that the program + university combination is in the current MOE-published English-taught catalog. If it isn\'t, the program is Chinese-taught regardless of what marketing says — pick a different option.',
      },
      {
        name: 'Take the English test + plan the CSCA',
        text: 'IELTS 6.0–7.5+ (master\'s) / 5.5–7.5+ (bachelor\'s) or equivalent TOEFL. Sit the CSCA at the right moment — for September 2027 ETP intake, sit November 2026, December 2026, or January 2027 so the score exists before scholarship deadlines.',
      },
      {
        name: 'Shortlist 5–10 ETP-strong universities',
        text: 'Use the C9 + strong research cluster (Tsinghua, Peking, Fudan, SJTU, Zhejiang, USTC, Sun Yat-sen, Wuhan, Huazhong UST, Harbin IT, XJTU, Tongji, Beihang, Central South, Nanjing) and filter by your target subject\'s ETP coverage. Verify each program\'s intake + deadline on the university\'s international student office website.',
      },
      {
        name: 'Apply to the university FIRST (parallel path with CSC)',
        text: 'Submit your university application via the international student portal in November–December for the September 2027 intake. Get a pre-admission letter in hand before you submit CSC.',
      },
      {
        name: 'Draft study plan + 2–3 recommendation letters',
        text: 'Study plan: 800–1,500 words (master\'s) / 1,500–3,000 words (PhD) covering why China, why this program, why this university, career goals. Brief your referees 4–6 weeks before letters are due.',
      },
      {
        name: 'Apply for CSC scholarship through your channel',
        text: 'Bilateral (through home-country embassy — January–March) or university (Type B — February–April) or partner institution. ETP-eligible on all channels. Submit by mid-March 2027 for the September intake.',
      },
      {
        name: 'Plan arrival + X1 visa logistics',
        text: 'After admission (April–June 2027 results), receive Admission Notice + JW201 (CSC) or JW202 (non-CSC). Apply for X1 visa at home embassy. Set up Chinese phone SIM + bank account + Alipay in the first 7 days on arrival. Carry a translation app (Pleco, Google Translate, DeepL) for the first 3–6 months.',
      },
      {
        name: 'Activate your funding + join the ETP cohort',
        text: 'On arrival, register at the international student office. CSC funding disburses monthly; first-month stipend takes 4–6 weeks. Free Chinese courses are bundled into most bachelor\'s ETP programs — sign up in week 1. International student office runs orientation week and pairs you with a buddy.',
      },
    ],
    ctaTitle: 'Building your English-taught China application?',
    ctaSubtitle:
      'SICA counselors match your profile to the strongest ETP-fit universities, plan the CSCA + English-test timeline, stack CSC + university + provincial scholarships, and walk you through the visa + arrival logistics. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/csca-english-taught-programs',
        label: 'CSCA for English-taught applicants — the dedicated CSCA-angle guide',
        description: 'Yes, you sit the CSCA on the English track — what to register, which subjects, the waiver routes, and exemption checks.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC) — full guide',
        description: 'CSC coverage, channels, deadlines, and the application package for ETP-eligible candidates.',
      },
      {
        href: '/chinese-university-application-deadlines',
        label: 'Chinese university application deadlines',
        description: 'The 2027 application calendar for September and March intake — including the parallel CSC path.',
      },
    ],
  },
  zh: {
    slug: 'english-taught-programs-china',
    eyebrow: '指南 · 英文轨',
    title: '2027 中国英文授课项目全指南：非汉语母语者的完整路径',
    description:
      '2027 年中国学士、硕士、博士英文授课项目——教育部 ETP 目录、英文轨最深的高校目录、英文项目最多的学科、申请路径、CSC 奖学金，以及英文轨校园的真实体验。',
    subtitle:
      '中国是亚洲规模最大的英文授课学位市场之一——300+ 所大学开设英文授课的工科、商科、医学、计算机与自然科学学士、硕士、博士项目，全部英文教学，无需 HSK。教育部（MOE）每周期发布官方 ETP 目录；C9 联盟 + ~30 所强研究型大学领衔。凭雅思/托福申请（不需要汉语），但自 2026 级起仍须参加 CSCA 考试（含英文轨）。本文给出全图、按学科对应的高校、申请路径与 2027 年英文授课中国的预算。',
    stats: [
      { value: '300+', label: '开设 ETP 的高校' },
      { value: 'C9 + ~30', label: '英文轨目录最深的旗舰' },
      { value: '6 大学科', label: '英文项目最密集的领域' },
      { value: '雅思 5.5–7.5', label: '常见英语门槛' },
    ],
    quickAnswer:
      '300+ 所中国大学开设英文授课学士、硕士、博士项目，覆盖工科、商科、计算机科学、临床医学（MBBS）、自然科学，以及人文与法学领域不断扩展的项目——是全球非英语母语国家中规模最大的 ETP 目录。教育部（MOE）每周期发布一份按高校的官方 ETP 目录；目录最深的为清华、北大、复旦、上海交大、浙江、中科大，以及 30 所左右出版完整英文本科学位的强研究型大学。录取使用与中国授课项目同样的日历（9 月为主入学，3 月为次），用雅思 5.5–7.5+ 或托福 60–100+ 替代 HSK；2026 级起英文轨本科申请者亦须参加 CSCA 考试，CSC 奖学金对英文轨申请开放。',
    keyTakeaways: [
      '300+ 所中国大学运行英文授课学士、硕士、博士项目——亚洲规模最大',
      '目录最深：清华、北大、复旦、上海交大、浙大、中科大、中山大学、武大、南大、华中科大、哈工大、西交、同济、北航、中南',
      '录取门槛用雅思 5.5–7.5+ 或托福 60–100+ 替代 HSK——不需要汉语也能申请',
      '2026 级起英文轨也须参加 CSCA；数学 + 1-2 科针对项目方向的科目',
      '英文授课 MBBS 是最大单类——45 所教育部名单大学提供英文 MBBS',
      '英文授课学费：本科 ¥18,000-50,000/年；硕士 ¥25,000-70,000/年；住宿与生活费与中国轨相同',
      'CSC 奖学金对英文轨申请者全额资助（学费 + 住宿 + 津贴 + 保险，部分渠道含机票）',
      '英文轨校园体验：课堂与考试 100% 英文；日常生活（银行、医院、点外卖、买机票）则中英混杂',
    ],
    sections: [
      {
        id: 'etp-landscape',
        h2: '英文授课生态全图',
        intro:
          '英文授课学位项目在中国从 2010 年代的几十个试点项目，增长到今天 300+ 所大学运行 ETP 学士、硕士、博士项目。',
        blocks: [
          {
            type: 'p',
            text: 'MOE（教育部）按机构维护一份官方 ETP 目录：列明大学被允许开设哪些英文授课项目、学制、学费档位、招生规模。每周期该目录重新发布并调整范围——有的学校增设 ETP 项目，有的撤销招生不足的项目。你的目标大学的 ETP 目录是约束文件：若 MOE 目录未将该项目列为英文授课，则无论营销怎么说都不能以 ETP 名义招生。',
          },
          {
            type: 'ul',
            items: [
              '**规模**——超过 300 所中国大学运行 ETP 学士、硕士或博士项目（按最新 MOE 周期）；完整 ETP 目录逐周期增长，但 2022 年以来头部规模基本稳定',
              '**集中领域**——工科、商科、计算机、临床医学（MBBS）、经济、金融、公共卫生与自然科学占主导；人文与法学在增长但规模仍较小',
              '**旗舰集群**——C9 联盟（北大、清华、复旦、上交、浙大、中科大、南大、哈工大、西交）+ ~30 所强研究型大学出版最深 ETP 目录，并提供完整英文本科学位',
              '**为何存在**——中国是全球最大国际生生源国之一，英语母语市场（美、英、澳、加）日益昂贵、竞争激烈；ETP 是官方路径，让想要中国学位、不想多年汉语先修的学生按英文轨学费入学',
              '**质量控制**——项目 MOE 名单管理并逐周期复审；英文学位由教育部承认，并由主要学历认证机构（WES、ECE、中国境外学历认证网络）按认证程序认可',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'MOE ETP 目录是权威源——它每周期重新发布，上一轮目录可能列出本轮未列出的项目。申请前务必核实项目在本周期的 MOE ETP 目录中；学校国际学生办公室可在你不确定时确认。',
          },
        ],
      },
      {
        id: 'best-etp-universities',
        h2: '英文授课最强高校',
        intro:
          '英文授课最强高校分两类：目录广的旗舰群（完整学士 + 硕士覆盖）+ 学科强但目录较窄的高校（如哈工大的机械工程 ETP）。',
        blocks: [
          {
            type: 'table',
            caption: '英文授课目录最深的高校（按学科覆盖）',
            columns: ['高校', '城市', '最强 ETP 学科', '本科 ETP 覆盖'],
            rows: [
              ['清华大学', '北京', '工科、计算机、公共政策、苏世民学者（硕士）', '完整学士 + 硕士 ETP 目录'],
              ['北京大学', '北京', '经济、国际关系、理科、燕京学堂', '完整学士 + 硕士 ETP 目录'],
              ['复旦大学', '上海', '经济、商科、新闻、公共卫生', '完整学士 + 硕士 ETP 目录'],
              ['上海交通大学', '上海', '工科、计算机、UM-SJTU 联合学院', '完整学士 + 硕士 ETP 目录'],
              ['浙江大学', '杭州', '工科、计算机、医学、商科', '完整学士 + 硕士 ETP 目录'],
              ['中国科学技术大学', '合肥', '物理、计算机、数学、化学', '强势学士 + 硕士 ETP 目录'],
              ['中山大学', '广州', '医学（MBBS）、商科、理科', '强势 MBBS ETP + 商科 ETP'],
              ['武汉大学', '武汉', '理科、工科、公共卫生', '完整学士 + 硕士 ETP 目录'],
              ['南京大学', '南京', '理科、人文、商科', '完整学士 + 硕士 ETP 目录'],
              ['华中科技大学', '武汉', '工科、计算机、医学', '强势 ETP 目录'],
              ['哈尔滨工业大学', '哈尔滨 / 威海 / 深圳', '工科（机械、电气工程、材料）、计算机', '三大校区全 ETP'],
              ['西安交通大学', '西安', '工科、医学、管理', '强势 ETP 目录'],
              ['同济大学', '上海', '工科、建筑、汽车（德系背景）', '强势 ETP 目录'],
              ['北京航空航天大学', '北京', '航空航天、工科、计算机', '强势 ETP 目录'],
              ['中南大学', '长沙', '医学、工科、材料', '强势 ETP 目录'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**C9 联盟**——北大、清华、复旦、上交、浙大、中科大、南大、哈工大、西交——9 所均有深 ETP 目录；最具选择性的选项',
              '**985 工科强校集群**——哈工大、北航、华中科大、西交、中南、同济、天津大学——工科与应用科学 ETP 候选最优',
              '**MBBS 强校集群**——中山、武大、复旦、吉大、山大、西交、中南、南通大学——MOE 名单中英文 MBBS 招生规模最大的大学',
              '**商科强校集群**——CEIBS（上海）、复旦、清华、上交安泰、人大、浙大、岭南（中山）——英文 MBA 与商科硕士',
              '**地区研究型大学**——南大、华中科大、武大、西交、中山、山大、吉大——强势 ETP 覆盖、学费低于前 5 所',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '想 ETP 选择最多，从 C9 + ~15 所强研究型大学开始——约 25 所机构覆盖 80%+ 的英文轨国际本科生需求。',
          },
        ],
      },
      {
        id: 'subject-coverage',
        h2: '哪些学科英文项目最多？',
        intro:
          '工科、商科、临床医学占英文授课大头；人文与法学追赶中；自然科学在 C9 实现完整覆盖。你的目标学科部分决定你的高校短名单。',
        blocks: [
          {
            type: 'table',
            caption: '英文授课学科覆盖（按目录规模）',
            columns: ['学科', '英文本科目录规模（约）', '主要去向'],
            rows: [
              ['工科（综合 + 电气 + 机械 + 土木）', '大——100+ 项目', '哈工大、北航、清华、上交、同济、西交'],
              ['计算机 + 软件 + AI', '大——80+ 项目', '浙大、上交、中科大、清华、北大、华中科大'],
              ['MBBS（临床医学，英文授课）', '非常大——45 所大学', '中山、武大、吉大、复旦、西交、山大、中南'],
              ['商科（BBA / 经济 / 金融）', '大——80+ 项目', 'CEIBS、复旦、清华、上交安泰、人大、浙大'],
              ['自然科学（物理、化学、生物）', '中——40+ 项目', '中科大、北大、复旦、南大、浙大、武大'],
              ['数学 + 统计', '中——30+ 项目', '北大、清华、复旦、中科大、浙大、上交'],
              ['公共卫生、护理', '中——25+ 项目', '北大、复旦、中山、武大、华中科大'],
              ['公共政策、国际关系', '小——15+ 项目', '清华、北大、复旦、人大、对外经贸大学'],
              ['法学（LLB、LLM）', '小——10+ 项目', '清华、北大、人大、复旦、武大'],
              ['人文、中国研究', '小——10+ 项目（多中文授课）', '北大、复旦、南大、武大、清华'],
              ['新闻、传播', '小——5+ 项目', '清华、复旦、人大、中传'],
              ['艺术、设计、音乐、电影', '极小——每领域 <10 项目', '清华美院、中央美院、北京电影学院、上海戏剧学院'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**工科是最大 ETP 类别**——你的工科 ETP 选择数量比所有其他领域多 2-3 倍',
              '**英文 MBBS 国际生生源密度最高**——45 所大学开设，国际生占比常 70%+',
              '**商科 ETP 集中在头部**——大学数量较少，但项目资金与营销到位',
              '**人文 + 法学 ETP 最小**——头部大学提供少量选择性项目；但本科人文大部分仍是中文授课',
              '**艺术与设计 ETP 极少**——若目标是艺术/设计，先核实本周期 MOE 目录',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'MOE ETP 目录中工科、CS、医学的学科组合多年来稳定。人文与设计每周期增 5-10 个项目——务必查本周期目录。',
          },
        ],
      },
      {
        id: 'admissions-english',
        h2: '如何申请——录取路径',
        intro:
          'ETP 申请日历与中国授课项目相同（9 月主入学，3 月次入学），但用英语成绩替代 HSK。',
        blocks: [
          {
            type: 'table',
            caption: 'ETP 录取语言 + 文件要求（按学位层级）',
            columns: ['要求', '本科 ETP', '硕士 ETP', '博士 ETP'],
            rows: [
              ['英语成绩', '雅思 5.5–7.5+ / 托福 60–100+', '雅思 6.5+ / 托福 80+', '雅思 6.5+ / 托福 90+'],
              ['CSCA 考试', '需要（2026 级起）', '硕博（按当期规则，按周期核实）', '不需要'],
              ['汉语考试（HSK）', 'ETP 路径免考', 'ETP 路径免考', 'ETP 路径免考'],
              ['GPA', '高中成绩单 + 高分', '本科学位 + 3.0+/4.0（75%+）', '硕士 + 3.3+/4.0（80%+）'],
              ['推荐信', '1-2（学术）', '2（学术 + 工作/研究）', '2-3（研究导师）'],
              ['学习计划 / 个人陈述', '500-1,000 字', '800-1,500 字', '1,500-3,000 字研究计划'],
              ['面试', '少见', '常见（尤其论文轨道）', '常规（研究汇报）'],
              ['预录取函（CSC 用）', '强烈推荐', '强烈推荐', '强烈推荐（导师预匹配必）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**英语成绩**——头部项目要雅思 6.5+（硕士）或 7.0+（博士）；本科 ETP 门槛差异大（5.5–7.5+），最强项目在档顶',
              '**CSCA 即使在英文轨也要求**（2026 级起）——见 /csca-english-taught-programs 了解豁免路径与四科路线',
              '**ETP 路径免 HSK**——但基础汉语（生存级）对校园外生活有用；多数本科 ETP 项目含免费中文课',
              '**预录取函**——CSC 与直接录取路径都越来越需要；先申请目标大学（9-12 月对次年入学），用预录取函锚定 CSC 申请',
              '**文件**——护照、成绩单（公证英文翻译）、英语成绩、1-3 封推荐信、学习计划 + （博士）研究计划、体检（录取后）',
              '**申请渠道**——与中国授课相同：大学国际学生门户（大学路径，Type B）、中国大使馆（双边）、CSC 合作机构',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'CSCA 要求覆盖 ETP 本科申请者（自 2026 级起）——常见误区是「英文授课 = 不用考 CSCA」。无论哪种语言轨，CSCA 都须进入申请日历。',
          },
        ],
      },
      {
        id: 'csca-english-track',
        h2: '英文轨 CSCA——考什么与怎么准备',
        intro:
          'ETP 本科申请者自 2026 级起参加 CSCA——考试对英文轨候选人为英文版（试卷 + 口试指导语），科目组合通常是数学 + 1-2 科项目相关科目。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**考试语言**——英文轨候选人的 CSCA 试卷与指导语均为英文；确认当期 CSCA 门户',
              '**英文轨科目组合**——数学全员必考；物理和/或化学取决于项目（工科常选数学 + 物理；MBBS 选数学 + 化学；商科与人文多仅选数学）',
              '**专业中文**——四科组合（数学 + 专业中文 + 2 科选修）仅适用中文授课项目；英文轨不考专业中文',
              '**费用档位**——与中国轨同：单科 RMB 450、两科及以上 RMB 700；报名窗口内通过支付宝 / 微信 / 银行转账支付',
              '**规划**——2027 年 9 月入学 ETP 申请者，参加 2026 年 11 月（14-15 日）、12 月、或 2027 年 1 月场次，确保成绩早于 CSC 截止（2027 年 1-4 月）到位',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSCA + ETP 全图（豁免路径、常见误区、英文轨的强分线）见 /csca-english-taught-programs——CSCA 角度的专项指南。',
          },
        ],
      },
      {
        id: 'csc-scholarship-english',
        h2: 'CSC 奖学金 + 大学英文轨资助',
        intro:
          'CSC 对英文轨申请者开放，条款与中国轨相同——全额学费 + 住宿 + 月津贴 + 保险 + 多数渠道机票。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSC 资格**——与中文轨相同；非中国公民、学术记录（多数项目 GPA 3.0+，最强项目 3.3+）、英语（雅思 6.5+ 或托福 90+ 常见）、1-2 封推荐信',
              '**CSC 渠道**——四大渠道相同：使馆 / 双边、大学（Type B）、合作机构、专项项目；ETP 申请者最多走大学路径（Type B）',
              '**月津贴**——按学位同档（本科 2,500、硕士 3,000、博士 3,500 CNY/月作为工作数字；以当期 CSC 通知核实）',
              '**大学追加资助**——许多大学给英文轨候选人在 CSC 之外再加奖学金（额外月津贴、学费减免、科研经费）；CSC + 院校追加是最优资助叠加',
              '**省市奖学金**——北京、上海、江苏、浙江、广东各有面向英文轨的奖学金池，通常与 CSC 独立',
              '**自费英文授课学费**——本科 ¥18,000-50,000/年；硕士 ¥25,000-70,000/年；英文 MBBS 典型 ¥40,000-60,000/年；MBA 项目 ¥80,000-200,000/全程',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'CSC 覆盖详情见 /chinese-government-scholarship-csc——CSC 角度专项指南。ETP 与中文轨走同一 CSC 流程。',
          },
        ],
      },
      {
        id: 'campus-experience',
        h2: '英文轨校园体验——真实场景',
        intro:
          'ETP 学生在课堂用英语，校外日常生活则进入汉英混杂的真实环境。这里是混合语言的校园生活图景。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**课堂与考核 100% 英文**——上课、PPT、教材、考试、论文写作',
              '**日常生活汉英混杂**——银行、医院、外卖、出行 App、市政服务主要为中文；多数 ETP 学生在前 3-6 个月依赖翻译 App（Pleco、Google 翻译、DeepL）',
              '**免费中文课**——多数本科 ETP 项目含 2-4 学分/学期的中文课；毕业不要求，但强烈推荐',
              '**国际学生办公室**——每所大学都有英语服务团队，处理录取、签证与日常支持',
              '**朋辈导师**——多数项目为新 ETP 学生对接高年级国际生，协助开户、办手机卡、宿舍入住与首周安排',
              '**文化活动**——国际学生协会组织迎新周、中秋节、春节活动；国际宿舍是 ETP 学生首年的社交中心',
              '**实习与兼职**——X1 签证下校内兼职 ≤20 小时/周（须经学校批准，校外在 9 个试点城市经提前批准可做）',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '带着「二语国家留学」的心态来：课堂用英语，校外混合。带着生存级汉语准备 + 一款翻译 App 的学生在首学期适应最快。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '不会汉语能在中国留学吗？',
        a: '能——300+ 所中国大学开设学士、硕士、博士英文授课项目，覆盖工科、商科、计算机、MBBS 与自然科学。申请不需要 HSK；用雅思或托福替代。',
      },
      {
        q: '中国哪所大学英文授课项目最多？',
        a: 'C9 联盟（北大、清华、复旦、上交、浙大、中科大、南大、哈工大、西交）+ ~30 所强研究型大学目录最深。工科：哈工大、北航、上交、清华、西交、同济；MBBS：中山、武大、吉大、复旦、西交；商科：CEIBS、复旦、清华、上交安泰。',
      },
      {
        q: '英文授课项目要不要 CSCA 考试？',
        a: '要——2026 级起学士申请者无论语言轨都要提交 CSCA 成绩。CSCA 对 ETP 候选人为英文版。费用档相同（¥450-700）。详见 /csca-english-taught-programs。',
      },
      {
        q: '英文授课比中文授课贵吗？',
        a: 'ETP 学费通常比同校中文授课高 10-30%：本科 ETP ¥18,000-50,000/年；硕士 ¥25,000-70,000/年；英文 MBBS ¥40,000-60,000/年。住宿与生活费相同。CSC 奖学金对受资助学生覆盖全部学费差额。',
      },
      {
        q: '英文授课的中国学位被承认吗？',
        a: '承认——MOE 名单上的 ETP 学位获中国教育部及海外学历认证机构（WES、ECE、欧亚国家 ENIC-NARIC 网络）承认。专业执业资格（美国律师、英国医师等）请查各执业机构名单——多数接受 MOE 认证的 ETP 学位，但请按专业核实。',
      },
      {
        q: '英文轨有奖学金吗？',
        a: 'CSC 对 ETP 申请开放，条款同中文轨（全额学费 + 住宿 + 月津贴 + 保险，部分渠道含机票）。许多大学在 CSC 外加奖学金（额外月津贴、学费减免、科研经费）。省市奖学金（北京、上海、江苏、浙江、广东）也面向 ETP。',
      },
      {
        q: '英文轨能兼职吗？',
        a: '能——X1 学签下校内兼职 ≤20 小时/周（须经学校批准，典型岗位月入 ¥1,500-3,000）。校外在 9 个试点城市经提前批准可做。',
      },
      {
        q: '2027 年 9 月英文轨入学的截止日？',
        a: 'C9 + 强竞争 ETP 项目（清华、北大、复旦、上交、浙大、中科大）请在 2027 年 3 月前申请——更早越有优势。中档大学截止 4-6 月；次选滚动录取至 8 月。CSC 奖学金截止 1-4 月。',
      },
    ],
    howToSteps: [
      {
        name: '核实目标项目在 MOE ETP 目录',
        text: '核实项目 + 大学的组合在本周期 MOE 公布的英文授课目录中。若不在，则该项目按中文授课招生，不论营销怎么说——换一个选项。',
      },
      {
        name: '考英语 + 规划 CSCA',
        text: '雅思 6.0–7.5+（硕士）/ 5.5–7.5+（本科）或相应托福。CSCA 选对场次——2027 年 9 月 ETP 入学，参加 2026 年 11、12 月或 2027 年 1 月场次，让成绩早于奖学金截止前到位。',
      },
      {
        name: '筛选 5-10 所 ETP 强校',
        text: '用 C9 + 强研究型集群（清华、北大、复旦、上交、浙大、中科大、中山、武大、华中科大、哈工大、西交、同济、北航、中南、南大）按目标学科的 ETP 覆盖筛选。核实各校国际学生办公室网站公布的入学与截止。',
      },
      {
        name: '先申请大学（与 CSC 并行）',
        text: '通过国际学生门户提交申请，在 11-12 月对 2027 年 9 月入学。预录取函到手后再提 CSC。',
      },
      {
        name: '起草学习计划 + 2-3 封推荐信',
        text: '学习计划：硕士 800-1,500 字 / 博士 1,500-3,000 字：为何中国、为何该项目、为何该校、职业目标。提前 4-6 周与推荐人打招呼。',
      },
      {
        name: '通过对应渠道申请 CSC',
        text: '双边（本国使馆——1-3 月）或大学（Type B——2-4 月）或合作机构或专项项目。ETP 在所有渠道开放。2027 年 9 月入学请在 3 月中前提交。',
      },
      {
        name: '抵华 + X1 签证',
        text: '录取后（4-6 月出结果），收 Admission Notice + JW201（CSC）或 JW202（非 CSC）。在国内大使馆申请 X1 签证。抵华首 7 天办电话 SIM、银行账户、支付宝。带一款翻译 App（Pleco、Google 翻译、DeepL），前 3-6 个月要用。',
      },
      {
        name: '激活资助 + 融入 ETP 群体',
        text: '抵华后在国际学生办公室注册。CSC 资助按月发放，首月津贴需 4-6 周处理。多数本科 ETP 含免费中文课——第 1 周就选上。国际学生办公室办迎新周并为新生配备导师。',
      },
    ],
    ctaTitle: '正在规划你的英文授课中国申请？',
    ctaSubtitle:
      'SICA 顾问按你的画像匹配最强的 ETP 高校，规划 CSCA + 英语成绩时间线，叠加 CSC + 大学 + 省市奖学金，并陪你走过签证与抵华全流程。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/csca-english-taught-programs',
        label: 'CSCA for English-taught applicants（CSCA 专项）',
        description: '英文轨也要 CSCA——注册什么科目、豁免路径与豁免检验。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）完整指南',
        description: 'CSC 覆盖、渠道、截止与申请包——面向 ETP 合格申请者。',
      },
      {
        href: '/chinese-university-application-deadlines',
        label: '中国大学申请截止日',
        description: '2027 年 9 月与 3 月入学的申请日历——含并行的 CSC 路径。',
      },
    ],
  },
};
