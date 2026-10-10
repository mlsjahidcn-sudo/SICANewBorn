import type { LocalizedGuide } from './types';

/**
 * "Peking vs Tsinghua for international students" — deep comparison
 * listicle. Target queries: "peking vs tsinghua for international
 * students", "which is better pku or tsinghua", "pk international
 * student", "tsinghua international student", "pku vs thu".
 *
 * Different angle from /peking-university-vs-tsinghua (which is a
 * 12-min metrics-only compare) and /peking-university-admissions-guide
 * + /tsinghua-university-admissions-guide (per-school operational
 * deep dives). This page is the international-student-centered
 * "should I apply here or there, and what changes if I do" guide.
 */
export const pekingVsTsinghuaGuide: LocalizedGuide = {
  en: {
    slug: 'peking-vs-tsinghua-international-students',
    eyebrow: 'GUIDE · PKU × THU',
    title: 'Peking vs Tsinghua for International Students: 2027 Decision Guide',
    description:
      'Peking University vs Tsinghua University for international bachelor\'s, master\'s, and PhD applicants — rankings, program mix, language of instruction, admissions selectivity, campus life, scholarship competitiveness, employability outcomes, and a decision framework that actually decides.',
    subtitle:
      'Peking and Tsinghua sit 3 km apart in northwest Beijing and rank in the top 20 of every major global ranking — but the experience of studying at each, and what they look for, is materially different. Peking is a comprehensive university with strengths across humanities, social sciences, and basic sciences; Tsinghua is an engineering-and-applied-science powerhouse with a fast-rising public policy and business school. Both run English-medium programs; both require the CSCA from the 2026 intake; both have selective admissions. Here is the international-student-centered comparison and the decision framework.',
    stats: [
      { value: '2 schools', label: 'Both top-20 globally' },
      { value: '3 km apart', label: 'Beijing Haidian district' },
      { value: '~50:50', label: 'CSCA + IELTS applicant profile' },
      { value: 'Hard choice', label: 'Each has a clear "fit" profile' },
    ],
    quickAnswer:
      'Peking University (PKU) and Tsinghua University (THU) both rank in the top 20 globally and sit 3 km apart in Beijing\'s Haidian district. PKU is the more comprehensive university with strong humanities (Yenching Academy), social sciences, basic sciences, and a full English-medium bachelor\'s catalog. Tsinghua is the engineering + applied-science flagship (Schwarzman Scholars, Schwarzman College, software / EE / materials / aerospace) with a fast-rising public policy and business school. Both require the CSCA from the 2026 intake and both accept IELTS 6.5+ (or TOEFL 90+) for English-medium programs. Apply to both, and choose based on subject fit + career trajectory + the campus you can picture yourself in. The "fit" differences are bigger than the ranking differences.',
    keyTakeaways: [
      'Both top-20 globally (QS, THE); ranking differences within a few places — the decision is about subject fit, not prestige',
      'PKU strengths: humanities, social sciences, basic sciences, Yenching Academy, international relations, economics, philosophy',
      'Tsinghua strengths: engineering, computer science, EE, materials, public policy (Schwarzman), business (SEM), architecture',
      'CSCA required for both from 2026 intake; Math + 1–2 subjects of your program\'s choice',
      'Both accept IELTS 6.5+ / TOEFL 90+ for English-medium; no HSK required on English track',
      'Both cover full tuition + dorm + monthly stipend for CSC scholars; university top-ups are competitive at both',
      'Campus: PKU is older, more traditional, near the Summer Palace; Tsinghua is newer, more engineering-campus, near Wudaokou; both are in Haidian',
      'Employability: both feed into the same Beijing + Greater China employer network; the difference is field-specific (PKU for policy / consulting, Tsinghua for engineering / tech / finance)',
    ],
    sections: [
      {
        id: 'ranking-context',
        h2: 'Rankings — both top-20, but the gaps are tiny',
        intro:
          'Any honest answer has to start: Peking and Tsinghua are at the same level by every global ranking. The decision is about fit, not prestige.',
        blocks: [
          {
            type: 'table',
            caption: 'Peking vs Tsinghua — global + domestic rankings (2024–2026 cycle)',
            columns: ['Ranking', 'Peking (PKU)', 'Tsinghua (THU)', 'Gap'],
            rows: [
              ['QS World University Rankings 2025', '14', '20', '6 places'],
              ['Times Higher Education 2025', '12', '12', 'tied'],
              ['ARWU (Shanghai) 2024', '24 (within top 50 for 9 fields)', '22 (within top 50 for 8 fields)', '2 places'],
              ['U.S. News Best Global Universities 2024', '31', '16', '15 places (US News skews toward STEM)'],
              ['Domestic (Ministry of Education)', 'Tier A (top research universities), Class A+ for 48 subjects', 'Tier A (top research universities), Class A+ for 51 subjects', 'Different subjects dominate each'],
              ['Subject strength (THE + QS by subject)', 'Arts & humanities, social sciences, life sciences, natural sciences', 'Engineering + technology, computer science, materials, public policy', 'Different — not a hierarchy'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The ranking differences are tiny** — the bigger gap is between these two and every other Chinese university; the gap between them is the noise floor',
              '**US News ranks Tsinghua higher** because Tsinghua publishes more STEM research in English; this does not mean Tsinghua is "better" — it means the ranking methodology favors one over the other',
              '**Subject strength is what actually matters** — Peking wins arts, humanities, social sciences, life sciences; Tsinghua wins engineering, computer science, materials',
              '**For a PhD or research career** — look at the specific research group + supervisor publications, not the university ranking',
            ],
          },
        ],
      },
      {
        id: 'program-mix',
        h2: 'Program mix — the actual difference between them',
        intro:
          'PKU and Tsinghua are organized around very different historical strengths. The choice for an international student is largely a subject-fit choice, not a prestige choice.',
        blocks: [
          {
            type: 'table',
            caption: 'Where each university clearly leads (subjects to anchor your choice)',
            columns: ['Subject area', 'Peking strengths', 'Tsinghua strengths'],
            rows: [
              ['Humanities (philosophy, history, literature, religion)', 'Peking — Yenching Academy, Department of Philosophy (top in Asia), Department of Chinese Literature', 'Tsinghua has solid humanities but smaller scale'],
              ['Social sciences (economics, political science, sociology)', 'Peking — top in China for economics, government, sociology', 'Tsinghua\'s School of Public Policy (Schwarzman) is the rising star in policy + international relations'],
              ['Law', 'Peking — top 3 in China, strong international law', 'Tsinghua law school is competitive but younger'],
              ['Natural sciences (physics, chemistry, biology, math)', 'Peking — strong across all four, with the School of Mathematical Sciences and the School of Physics at the top tier', 'Tsinghua — strong in chemistry, materials, applied math; less depth in pure physics'],
              ['Engineering (mechanical, EE, civil, chemical)', 'Tsinghua — top in China across all engineering disciplines', 'Peking has solid engineering but not at Tsinghua\'s level'],
              ['Computer science + AI', 'Tsinghua — flagship CS school (especially AI, systems, theory); ranked top 1-2 in China', 'Peking has strong CS in the School of EECS, with strength in theory and interdisciplinary computing'],
              ['Materials science', 'Tsinghua — flagship; widely considered #1 in China', 'Peking has the School of Materials Science but smaller'],
              ['Architecture, design, art', 'Tsinghua — top architecture school in China; strong art and design programs', 'Peking is solid but smaller in art and design'],
              ['Clinical medicine (MBBS, public health)', 'Peking — top 3 medical school in China; full hospital system', 'Tsinghua has a newer medical school (joint with Beijing Tsinghua Changgung Hospital) but smaller'],
              ['Business (MBA, finance, accounting)', 'Both competitive — Tsinghua SEM is famous for finance; Peking Guanghua is famous for marketing + management', 'Different emphases — both rank top 5 in China'],
              ['Public policy + international affairs', 'Peking has the School of International Studies (Yenching) — historically #1', 'Tsinghua\'s Schwarzman College is a global-policy destination — strong for MPP / global affairs'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**The humanities vs engineering choice is the dominant decision** — Peking is your pick for humanities, social sciences, law, basic sciences, medicine; Tsinghua for engineering, CS, materials, architecture, business (finance) — this is the single most important filter',
              '**PhD / research candidates** — look at the research group + supervisor publications + lab resources; the university ranking is secondary to the supervisor fit',
              '**MBBS candidates** — Peking is the stronger clinical medicine program; the MOE-listed MBBS universe is broader (see /moe-listed-mbbs-universities-china)',
              '**The "both" answer** — for many students the right answer is to apply to both (and add a third like Fudan, SJTU, or Zhejiang as a back-up); the CSCA score unlocks both',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Schwarzman Scholars at Tsinghua is the standalone global-affairs MBA-style program — fully funded, master\'s-level, English-medium, ~200 scholars per year. Apply separately from the regular Tsinghua master\'s programs; it has its own deadline (usually May).',
          },
        ],
      },
      {
        id: 'language-instruction',
        h2: 'Language of instruction — both are increasingly English-medium',
        intro:
          'Both PKU and Tsinghua have invested heavily in English-medium programs over the last decade. The CSCA is required regardless; an English test replaces HSK.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Bachelor\'s ETP coverage** — both universities offer full English-medium bachelor\'s across most popular subjects (engineering, business, CS, economics, sciences, public health); coverage is roughly 80%+ of bachelor\'s programs at both',
              '**Master\'s ETP coverage** — both offer English-medium master\'s in most STEM subjects + the major business / public policy programs; PKU\'s Yenching Academy is bilingual (Chinese classics, English seminars)',
              '**PhD English-medium** — most STEM PhDs can be done in English with a Chinese-speaking supervisor; humanities / social science PhDs often require Chinese reading by year 2-3 even if classes are bilingual',
              '**Free Chinese courses** — both universities bundle free Chinese courses into international programs; survival Chinese is realistic in 1-2 semesters, academic Chinese in 2-3 years',
              '**CSCA requirement** — both universities require the CSCA from the 2026 intake for bachelor\'s applicants; Math + 1-2 program-specific subjects; the exam is administered in English for English-track candidates',
              '**English language test** — both accept IELTS 6.5+ / TOEFL 90+ (master\'s) / IELTS 6.0+ (bachelor\'s) for English-medium programs; higher IELTS (7.0+) is competitive for top programs',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'A Chinese-speaking life outside the classroom is unavoidable in Beijing — banking, hospitals, food delivery, taxi apps are all primarily Chinese. Plan to carry a translation app (Pleco, Google Translate, DeepL) for the first 6 months. The English-medium program is the academic context; the daily life is bilingual.',
          },
        ],
      },
      {
        id: 'admissions-selectivity',
        h2: 'Admissions selectivity — what they look for',
        intro:
          'Both are extremely selective, but the weight between academics, language, and "fit" differs. The CSCA score has become a hard filter; the rest is differentiation.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSCA score** — the new hard filter from the 2026 intake; competitive scores are 85+ in required subjects (per the scores guide\'s "tier bands")',
              '**English test** — IELTS 6.5+ (master\'s) / IELTS 6.0+ (bachelor\'s) is the floor; 7.0+ / 100+ is competitive',
              '**GPA + class rank** — for bachelor\'s applicants, top 10% of high school class is competitive; for master\'s, 3.5+/4.0 (or equivalent); for PhD, research output matters more than grades',
              '**Study plan / research proposal** — 800-1,500 words for master\'s; 1,500-3,000 words for PhD; must be specific (cite faculty + labs + facilities)',
              '**Recommendation letters** — 2-3 academic; PhD applicants need supervisor pre-match (essential for thesis-track master\'s and PhDs)',
              '**For Yenching Academy (PKU) + Schwarzman Scholars (THU)** — separate application, separate deadline, separate competitive profile (work experience, leadership, global outlook); these are global-affairs feeder programs',
            ],
          },
          {
            type: 'table',
            caption: 'Admissions profile — bachelor\'s + master\'s, by university',
            columns: ['Factor', 'Peking University', 'Tsinghua University'],
            rows: [
              ['CSCA competitive score', '85+ in required subjects', '85+ in required subjects'],
              ['English test (master\'s)', 'IELTS 6.5+ / TOEFL 90+', 'IELTS 6.5+ / TOEFL 90+'],
              ['GPA (high school / bachelor\'s)', 'Top 10% / 3.5+', 'Top 10% / 3.5+'],
              ['Study plan length', '800-1,500 words', '800-1,500 words'],
              ['Key differentiator', 'Specificity to PKU faculty + research; humanities applicants cite Yenching', 'Specificity to THU faculty + labs; engineering / CS applicants cite research group + project fit'],
              ['PhD requirement', 'Supervisor pre-match essential', 'Supervisor pre-match essential'],
              ['Separate elite program', 'Yenching Academy (apply separately)', 'Schwarzman Scholars (apply separately)'],
            ],
          },
        ],
      },
      {
        id: 'campus-life',
        h2: 'Campus life — Beijing Haidian, two different vibes',
        intro:
          'Both campuses are in northwest Beijing\'s university district, ~3 km apart. The day-to-day feel of each is distinct, and the difference matters when you spend 2-6 years there.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Peking campus (Yanyuan)** — historic, garden-style, the oldest continuous university site in China (since 1898); near the Summer Palace and Old Summer Palace; the campus has the iconic "Weiming Lake" and classical Chinese architecture alongside modern buildings',
              '**Tsinghua campus** — newer (founded 1911 but with a 1950s Russian-influenced expansion + 1990s+ modernization); more engineering campus feel, larger green spaces, the famous "Old Library" and the more recent Schwarzman College building',
              '**Both campuses** — closed during the day, walkable inside, extensive cafeteria networks, multiple libraries, dedicated international student dorms with English-speaking staff',
              '**Dining** — both have ~10-20 cafeterias serving regional Chinese cuisines + a few international options; PKU is famous for its food court diversity; Tsinghua for the nearby Wudaokuo food street',
              '**Sports + clubs** — both have strong basketball, soccer, swimming facilities; PKU has a historic (Yanyuan) jogging track around the lake; Tsinghua has the famous Tsinghua swim team + multiple engineering-club culture',
              '**Getting around** — both are on Beijing subway line 4 (PKU at East Gate station; Tsinghua at Wudaokou or East Gate of Tsinghua); 3 km between the two universities by bike, bus, or subway',
              '**City access** — both 30-40 min by subway to Tiananmen + Forbidden City + Sanlitun; 1 hour to Beijing Capital International Airport; 45 min to Daxing International Airport',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'You can take classes at the other university as a visiting student (audit / cross-registration) once you are enrolled — many PKU students take a Tsinghua course and vice versa, especially in interdisciplinary subjects. The two universities share a joint research park.',
          },
        ],
      },
      {
        id: 'scholarships-cost',
        h2: 'Scholarships + cost — both fully fund CSC scholars',
        intro:
          'CSC scholarship covers full tuition + dorm + monthly stipend + insurance for both. University top-ups and external funding can stack; the difference is in what each offers as a top-up.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSC** — same terms at both: full tuition + on-campus dorm + monthly stipend (bachelor\'s 2,500 / master\'s 3,000 / PhD 3,500 CNY/mo [verify against the current CSC notice]) + health insurance + (for some channels) airfare',
              '**University top-up** — both universities add their own scholarship on top of CSC; the exact amount varies by program and year but commonly ¥2,000-10,000/month for top candidates; engineering + PhD top-ups are usually larger',
              '**Beijing Government Scholarship** — separate from CSC, offered by the Beijing Municipal Education Commission; both universities\' international students can apply; covers tuition or stipend top-ups',
              '**Confucius Institute Scholarship** — for Chinese language year (1-year program), covers tuition + dorm + stipend + insurance; both universities host Confucius Institute scholarship recipients',
              '**Self-funded costs** — tuition ¥20,000-50,000/year (bachelor\'s) / ¥30,000-80,000/year (master\'s) for English-medium; dorm ¥1,500-2,500/month for international dorm',
            ],
          },
          {
            type: 'table',
            caption: 'CSC coverage + typical university top-up at PKU vs Tsinghua (2027 cycle, illustrative)',
            columns: ['Component', 'PKU', 'Tsinghua'],
            rows: [
              ['CSC tuition waiver', 'Full', 'Full'],
              ['CSC on-campus dorm', 'Provided', 'Provided'],
              ['CSC monthly stipend (bachelor\'s / master\'s / PhD)', '¥2,500 / ¥3,000 / ¥3,500', '¥2,500 / ¥3,000 / ¥3,500'],
              ['University top-up (CSC scholars, top candidates)', '¥2,000-8,000/month typical', '¥2,000-10,000/month typical (engineering + CS higher)'],
              ['Total monthly for fully-funded top candidate', '¥4,500-10,000/month', '¥4,500-13,000/month'],
              ['Self-funded tuition (English-medium bachelor\'s)', '¥20,000-45,000/year', '¥22,000-50,000/year'],
              ['Self-funded dorm (international, double/sem)', '¥1,500-2,500', '¥1,500-2,500'],
            ],
          },
        ],
      },
      {
        id: 'career-outcomes',
        h2: 'Career outcomes — the same employer network, different paths',
        intro:
          'Both PKU and Tsinghua feed into the top of the China + global employer network. The path differs by field.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Finance + consulting + tech + policy** — both universities land at McKinsey, BCG, Bain, Goldman Sachs, Morgan Stanley, JP Morgan, Alibaba, Tencent, ByteDance, Bytedance, Pinduoduo, Huawei, the Big Four, the World Bank, IMF, UN agencies, MOF China, the central state-owned banks',
              '**PKU alumni advantages** — public policy + government (PKU feeds the State Council, the Ministry of Foreign Affairs, the central media); economics + finance; Yenching Academy leads international relations + global affairs; law + consulting',
              '**Tsinghua alumni advantages** — engineering + tech (Tsinghua feeds Alibaba, ByteDance, Tencent, Huawei, the major Chinese tech firms + their global engineering offices); SEM feeds investment banking; architecture feeds the major design firms; Schwarzman College is the standalone global-affairs feeder',
              '**PhD + academia** — both universities place PhDs in top global research positions; Tsinghua tends to have stronger engineering / materials / CS research output, PKU has stronger economics / politics / law / natural sciences',
              '**For international students** — both universities place well in their home country\'s top employers, but the China-network advantage is the bigger deal for internationals who want a China-based career',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For an international student who wants a career in China, both PKU and Tsinghua are gateway degrees. The choice is about subject fit, not employer outcome.',
          },
        ],
      },
      {
        id: 'decision-framework',
        h2: 'Decision framework — when to apply where',
        intro:
          'The cleanest decision rule: subject fit first, then campus, then scholarship competitiveness, then career geography.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Apply to Peking if** — your subject is humanities, social sciences, law, basic sciences (physics/chemistry/biology/math), medicine (MBBS), or international relations; you value the historic garden campus; your career is policy / consulting / finance / academia / government',
              '**Apply to Tsinghua if** — your subject is engineering, computer science, materials, architecture, business (especially finance), or public policy; you value the modern engineering-campus feel; your career is tech / engineering / finance / product management',
              '**Apply to both if** — your subject is offered at both (CS, math, business, public health, economics) and you cannot decide; the cost is one more application + CSCA score + study plan; many international students apply to 3-5 top schools, not just 2',
              '**For Schwarzman Scholars** — apply separately, regardless of the regular Tsinghua master\'s programs; Schwarzman has its own deadline (usually May), its own application, and a separate admissions process',
              '**For Yenching Academy** — apply separately, regardless of the regular PKU master\'s programs; Yenching has its own application process',
            ],
          },
          {
            type: 'table',
            caption: 'Decision matrix — pick the right university by your profile',
            columns: ['Your profile', 'Peking?', 'Tsinghua?', 'Apply both?'],
            rows: [
              ['Humanities / social sciences / law', 'Strong fit', 'Secondary', 'No — apply PKU + 1-2 other top schools'],
              ['Engineering / CS / materials / architecture', 'Secondary', 'Strong fit', 'No — apply THU + 1-2 other top schools'],
              ['Economics / finance / business / public policy', 'Strong fit', 'Strong fit', 'Yes — apply both + 1-2 other'],
              ['Math / physics / chemistry / biology', 'Strong fit', 'Strong fit', 'Yes — apply both + 1-2 other'],
              ['MBBS / clinical medicine', 'Strong fit', 'Secondary', 'No — apply PKU + other MOE MBBS'],
              ['Public health', 'Strong fit', 'Strong fit', 'Yes — apply both + 1-2 other'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Do NOT apply to only one of the two. The application cost (CSCA + study plan + recommendation letters) is the same whether you apply to 1 or to 3-5 top schools. Maximize your chances by applying broadly.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'Is Peking or Tsinghua better for international students?',
        a: 'Both are top-20 globally and at the same prestige tier; the choice is about subject fit, not prestige. Peking is stronger in humanities, social sciences, law, basic sciences, and medicine; Tsinghua is stronger in engineering, computer science, materials, architecture, and business (especially finance). Apply to both if your subject is offered at both.',
      },
      {
        q: 'Do PKU and Tsinghua require the CSCA?',
        a: 'Yes — from the 2026 intake, both universities require CSCA scores for bachelor\'s applicants (and many master\'s programs also use it as a screening signal). Math is required for everyone; Physics and/or Chemistry depend on the program. The exam is administered in English for English-track candidates. See /csca-exam for the full CSCA guide.',
      },
      {
        q: 'Can I study at Peking or Tsinghua in English?',
        a: 'Yes — both offer full English-medium bachelor\'s and master\'s programs across most popular subjects. The CSCA replaces HSK for English-track candidates; IELTS 6.5+ (master\'s) / IELTS 6.0+ (bachelor\'s) is the language requirement. Free Chinese courses are bundled into the program for daily life.',
      },
      {
        q: 'How do PKU and Tsinghua compare on scholarships?',
        a: 'Both fully cover tuition + dorm + monthly stipend + insurance for CSC scholars, with the same base stipend tiers (bachelor\'s 2,500 / master\'s 3,000 / PhD 3,500 CNY/month [verify against the current CSC notice]). University top-ups stack on top — Tsinghua engineering/CS top-ups are typically slightly higher. Beijing Government Scholarship is available at both.',
      },
      {
        q: 'Should I apply to both Peking and Tsinghua?',
        a: 'Yes, if your subject is offered at both (CS, math, business, public health, economics, etc.). The application cost is the same whether you apply to 1 or 5 top schools — CSCA score + study plan + recommendation letters are the bottleneck, not application fees. Apply broadly to maximize chances.',
      },
      {
        q: 'What is the Schwarzman Scholars program at Tsinghua?',
        a: 'Schwarzman Scholars is a fully-funded, English-medium, one-year master\'s program at Tsinghua focused on global affairs, public policy, and business. ~200 scholars per year, separate application from regular Tsinghua master\'s, typically May deadline, very competitive (single-digit acceptance rate).',
      },
      {
        q: 'What is the Yenching Academy at Peking?',
        a: 'Yenching Academy is PKU\'s interdisciplinary master\'s program in China Studies, with a strong focus on Chinese history, philosophy, religion, and society. Bilingual instruction (Chinese classics + English seminars), residential college, ~150 scholars per year, separate application with its own deadline and admission process.',
      },
      {
        q: 'Where are PKU and Tsinghua located?',
        a: 'Both are in Beijing\'s Haidian district, ~3 km apart. Peking is near the Summer Palace (Yanyuan campus, historic garden-style). Tsinghua is near Wudaokou (larger, more modern campus). Both are 30-40 min by subway to central Beijing; 1 hour to Beijing Capital International Airport.',
      },
    ],
    howToSteps: [
      {
        name: 'Decide your subject — the dominant filter',
        text: 'Humanities, social sciences, law, basic sciences, medicine → PKU leads. Engineering, CS, materials, architecture, business (finance) → Tsinghua leads. CS, math, business, public health, economics → both competitive. Apply to whichever leads, plus the other if your subject is offered at both.',
      },
      {
        name: 'Take the English test and plan the CSCA',
        text: 'IELTS 6.5+ (master\'s) / 6.0+ (bachelor\'s) is the floor. For September 2027 intake, sit the CSCA in November 2026 (register Oct 15-21, Beijing time), December 2026, or January 2027 so the score exists before CSC deadlines.',
      },
      {
        name: 'Shortlist 3-5 target programs across both universities + 1-2 backups',
        text: 'Peking + Tsinghua + Fudan + SJTU + Zhejiang is the realistic 5-school shortlist for top-tier applicants. Add a safety school ranked 20-50 in China to your list. The application cost is the same whether you apply to 1 or 5.',
      },
      {
        name: 'Submit university applications FIRST (parallel path with CSC)',
        text: 'Apply to your target universities via the international student portal in November-December 2026. Get a pre-admission letter in hand before submitting CSC.',
      },
      {
        name: 'Draft a study plan specific to each target program',
        text: '800-1,500 words (master\'s) / 1,500-3,000 words (PhD). Must cite specific faculty + labs + facilities at the target university. Generic plans are the most common reason for rejection. One study plan per target — do not re-use the same essay.',
      },
      {
        name: 'For Yenching or Schwarzman, apply separately',
        text: 'Both Yenching Academy (PKU) and Schwarzman Scholars (Tsinghua) have separate application processes with separate deadlines (Yenching: typically January-February; Schwarzman: typically May). These are global-affairs feeder programs with very competitive admissions (single-digit acceptance rates).',
      },
      {
        name: 'Apply for CSC + Beijing Government Scholarship + university top-ups',
        text: 'Run CSC + Beijing Government Scholarship + university top-up applications in parallel. All three are stackable. CSC deadline: January-April 2027 depending on channel; Beijing Government Scholarship: typically March-May for the September intake.',
      },
    ],
    ctaTitle: 'Choosing between Peking and Tsinghua?',
    ctaSubtitle:
      'SICA counselors help you map your subject to the right university, plan the CSCA + English-test timeline, write a study plan specific to PKU or Tsinghua, and stack CSC + Beijing Government + university top-up scholarships. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university',
        label: 'Peking University profile',
        description: 'Schools, signature programs, English-medium master\'s, CSCA combinations, scholarships, cost.',
      },
      {
        href: '/tsinghua-university',
        label: 'Tsinghua University profile',
        description: 'Engineering + applied-science flagship, Schwarzman Scholars, English-medium master\'s, CSCA combinations.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'Subjects, format, scoring, fees, exemptions, the CSC requirement, and the November-December-January sittings.',
      },
    ],
  },
  zh: {
    slug: 'peking-vs-tsinghua-international-students',
    eyebrow: '指南 · 北大 × 清华',
    title: '2027 北大 vs 清华——国际生决策指南',
    description:
      '北京大学与清华大学——国际本科、硕士、博士申请者视角——排名、学科分布、授课语言、录取选择度、校园生活、奖学金竞争、就业去向，以及真正能拍板的选择框架。',
    subtitle:
      '北大与清华在所有全球排名中都位于前 20，且相距仅 3 公里（都在北京海淀）。但两校的学习体验与招生取向差异显著。北大是综合性大学，人文、社会科学与基础科学见长；清华是工程与应用科学强校，公共政策与商学院快速崛起。两校都开设英文授课项目；自 2026 级起都要求 CSCA；录取都很挑剔。这里是国际生中心的对比 + 真正能拍板的决策框架。',
    stats: [
      { value: '2 所学校', label: '都进全球前 20' },
      { value: '相距 3 公里', label: '北京海淀区' },
      { value: '约 50:50', label: 'CSCA + 雅思申请画像' },
      { value: '难选', label: '各有明确「适合」画像' },
    ],
    quickAnswer:
      '北京大学（PKU）与清华大学（THU）在所有全球排名中都位于前 20，且都在北京海淀区相距 3 公里。北大是更综合的大学——人文、社会科学、基础科学突出，提供完整英文本科学位。清华是工程 + 应用科学旗舰（苏世民学者、苏世民学院、软件/电气/材料/航天）+ 公共政策与商学院快速崛起。两校自 2026 级起都要求 CSCA，英文授课都接受雅思 6.5+（或托福 90+）。两校都申请，按学科匹配 + 职业方向 + 你能想象自己生活其中的校园来选。「适合」差异比排名差异大。',
    keyTakeaways: [
      '全球都进前 20（QS、THE）；排名差在 5-6 名内——决策靠学科匹配，不是名气',
      '北大强项：人文、社会科学、基础科学、燕京学堂、国际关系、经济、哲学',
      '清华强项：工程、计算机、电气工程、材料、公共政策（苏世民）、商科（经管学院）、建筑',
      '自 2026 级起两校都要求 CSCA；数学 + 1-2 科项目方向科目',
      '英文轨两校都接受雅思 6.5+ / 托福 90+；免 HSK',
      'CSC 奖学金两校都全额覆盖学费 + 住宿 + 月津贴；院校追加都很竞争',
      '校园：北大更古朴、临近颐和园；清华更新更工程范、临近五道口；都在海淀',
      '就业：两校进入同一批北京 + 大中华雇主网络；区别在领域（北大偏政策/咨询；清华偏工程/科技/金融）',
    ],
    sections: [
      {
        id: 'ranking-context',
        h2: '排名——都进前 20，差距极小',
        intro:
          '任何诚实的回答都要先说：北大和清华在所有全球排名中处于同一档。决策看的是学科匹配，不是名气。',
        blocks: [
          {
            type: 'table',
            caption: '北大 vs 清华——全球 + 国内排名（2024-2026 周期）',
            columns: ['排名', '北大（PKU）', '清华（THU）', '差距'],
            rows: [
              ['QS 世界大学排名 2025', '14', '20', '6 名'],
              ['泰晤士高等教育 2025', '12', '12', '并列'],
              ['ARWU（上海）2024', '24（9 个学科进前 50）', '22（8 个学科进前 50）', '2 名'],
              ['U.S. News 2024', '31', '16', '15 名（U.S. News 偏 STEM）'],
              ['国内（教育部）', 'A 类一流大学，48 个 A+ 学科', 'A 类一流大学，51 个 A+ 学科', '不同学科各领风骚'],
              ['学科优势（THE + QS 按学科）', '人文、社会科学、生命科学、自然科学', '工程 + 技术、计算机、材料、公共政策', '不同——不是高下'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**排名差异极小**——真正的差距是这两所与中国其他大学之间；两所之间的差距在噪声范围内',
              '**U.S. News 清华更高**——因为清华发表更多英文 STEM 论文；不代表清华「更好」，是这个排名方法对一所有利',
              '**学科优势是真正关键**——北大在人文、社会科学、生命科学、自然科学领先；清华在工程、计算机、材料领先',
              '**博士 / 研究方向**——看具体研究组 + 导师论文 + 实验室资源，不是大学排名',
            ],
          },
        ],
      },
      {
        id: 'program-mix',
        h2: '学科布局——两校的实际差异',
        intro:
          '北大和清华围绕不同的历史优势组建。对国际生来说，决策主要是学科匹配决策，不是名气决策。',
        blocks: [
          {
            type: 'table',
            caption: '两校明显领先的领域（用来定位你的选择）',
            columns: ['学科领域', '北大强项', '清华强项'],
            rows: [
              ['人文（哲学、历史、文学、宗教）', '北大——燕京学堂、哲学系（亚洲顶尖）、中文系', '清华人文扎实但规模较小'],
              ['社会科学（经济、政治、社会学）', '北大——经济、政府、社会学全国顶尖', '清华公共政策学院（苏世民）是政策 + 国际关系新星'],
              ['法学', '北大——全国前 3，国际法强', '清华法学院竞争强但更年轻'],
              ['自然科学（物理、化学、生物、数学）', '北大——四个学科都强，数学与物理学院顶尖', '清华——化学、材料、应用数学强；纯物理深度稍弱'],
              ['工程（机械、电气、土木、化工）', '清华——所有工程学科全国第一', '北大的工程扎实但不及清华'],
              ['计算机 + AI', '清华——旗舰 CS 学院（尤其 AI、系统、理论）；中国 1-2 名', '北大有强 EECS 学院，理论 + 交叉计算强'],
              ['材料科学', '清华——旗舰；广泛认为中国第一', '北大材料科学学院有但规模较小'],
              ['建筑、设计、艺术', '清华——中国第一建筑学院；强艺术与设计', '北大艺术设计扎实但规模较小'],
              ['临床医学（MBBS、公共卫生）', '北大——中国前 3 医学院；完整医院体系', '清华有较新医学院（与北京清华长庚医院共建）但规模小'],
              ['商科（MBA、金融、会计）', '两校都强——清华经管学院金融闻名；北大光华营销 + 管理闻名', '不同侧重——都进中国前 5'],
              ['公共政策 + 国际事务', '北大国际关系学院（燕京）历史第一', '清华苏世民学院是全球事务的热门——MPP / 全球事务强'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**人文 vs 工程是主要决策**——人文、社科、法、基础科学、医学选北大；工程、CS、材料、建筑、商科（金融）选清华',
              '**博士 / 研究方向**——看研究组 + 导师论文 + 实验室资源；大学排名次要，导师匹配重要',
              '**MBBS 申请者**——北大临床医学更强；教育部名单 MBBS 大学更广（见 /moe-listed-mbbs-universities-china）',
              '**「都申请」的答案**——许多学生两校都申请（再加复旦、上交或浙大作为保底）；CSCA 成绩同时解锁两校',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '清华苏世民学者是独立的全球事务 MBA 式项目——全额资助、硕士级、英文授课、每年约 200 人。单独申请，与清华常规硕士项目分开；单独截止（通常 5 月）。',
          },
        ],
      },
      {
        id: 'language-instruction',
        h2: '授课语言——两校英文项目都在增加',
        intro:
          '北大和清华过去十年都在英文授课项目上重投。CSCA 不分语种必考；英语成绩替代 HSK。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**本科 ETP 覆盖**——两校在多数主流学科（工程、商科、CS、经济、理科、公共卫生）都提供完整英文本科学位；覆盖率约 80%+',
              '**硕士 ETP 覆盖**——两校在多数 STEM 学科 + 主要商科 / 公共政策项目都提供英文授课硕士；北大燕京学堂中英双语（中国经典、英文研讨）',
              '**博士英文授课**——多数 STEM 博士可英文完成配中文导师；人文 / 社科博士常在 2-3 年内需要中文阅读，即使课程是双语',
              '**免费中文课**——两校都在国际生项目里内置免费中文课；1-2 学期能掌握生存中文，2-3 年达到学术中文',
              '**CSCA 要求**——两校自 2026 级起都要求学士申请者考 CSCA；数学 + 1-2 科项目方向科目；英文轨候选人为英文版',
              '**英语成绩**——两校都接受雅思 6.5+ / 托福 90+（硕士）/ 雅思 6.0+（本科）作为英文项目门槛；雅思 7.0+ / 100+ 在头部项目里竞争',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '北京课堂外的生活汉语避不开——银行、医院、外卖、打车都主要是中文。前 6 个月带翻译 App（Google 翻译、DeepL、Pleco）。英文授课是学术场景；日常生活是双语。',
          },
        ],
      },
      {
        id: 'admissions-selectivity',
        h2: '录取选择度——两校看重什么',
        intro:
          '两校都极挑剔，但学术 / 语言 / 「匹配」三者权重不同。CSCA 分数已是硬筛选；剩下是差异化。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSCA 分数**——2026 级起新的硬筛选；竞争分数 85+（必考科）（按分数指南「层次带」）',
              '**英语成绩**——雅思 6.5+（硕士）/ 6.0+（本科）为基础；7.0+ / 100+ 才有竞争力',
              '**GPA + 排名**——本科申请者高中前 10% 有竞争力；硕士 3.5+/4.0；博士研究产出比分数更重要',
              '**学习计划 / 研究计划**——硕士 800-1,500 字；博士 1,500-3,000 字；必须具体（引用教师 + 实验室 + 设施）',
              '**推荐信**——2-3 封学术；博士申请者必须导师预匹配（论文轨道硕士与博士都必要）',
              '**燕京学堂（北大）+ 苏世民学者（清华）**——单独申请、单独截止、单独竞争画像（工作经验、领导力、全球视野）；是全球事务的精英通道',
            ],
          },
          {
            type: 'table',
            caption: '录取画像——本科 + 硕士，按大学',
            columns: ['因素', '北京大学', '清华大学'],
            rows: [
              ['CSCA 竞争分数', '必考科 85+', '必考科 85+'],
              ['英语成绩（硕士）', '雅思 6.5+ / 托福 90+', '雅思 6.5+ / 托福 90+'],
              ['GPA（高中 / 本科）', '前 10% / 3.5+', '前 10% / 3.5+'],
              ['学习计划长度', '800-1,500 字', '800-1,500 字'],
              ['关键差异化', '对北大教师 + 研究的具体性；人文申请者引用燕京', '对清华教师 + 实验室的具体性；工程 / CS 申请者引用研究组 + 项目匹配'],
              ['博士要求', '导师预匹配必须', '导师预匹配必须'],
              ['独立精英项目', '燕京学堂（单独申请）', '苏世民学者（单独申请）'],
            ],
          },
        ],
      },
      {
        id: 'campus-life',
        h2: '校园生活——北京海淀，两种不同气质',
        intro:
          '两校都在北京海淀大学区，相距 3 公里。日常氛围截然不同，选哪个会决定你 2-6 年的生活感受。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**北大校园（燕园）**——历史悠久，园林风格，中国最古老的连续大学所在地（始于 1898）；临近颐和园与圆明园；校园有未名湖 + 古典建筑 + 现代建筑',
              '**清华校园**——更新（1911 年建，但 1950 年代俄式扩展 + 1990 年代后现代化）；更工程大学感，更大绿地，有著名「老图书馆」+ 较新的苏世民学院大楼',
              '**两校共性**——日间有出入管理，校园内可步行，有多个食堂，有多个图书馆，有专设的国际生宿舍楼（英语员工）',
              '**餐饮**——两校都有 10-20 个食堂覆盖各地中国菜 + 少数国际选项；北大以食堂多样性闻名；清华以临近五道口美食街闻名',
              '**体育 + 社团**——两校都有强篮球、足球、游泳设施；北大有未名湖晨跑路线；清华有著名游泳队 + 多个工程类社团文化',
              '**通勤**——两校都在北京地铁 4 号线（北大东门站；清华五道口或清华东路西口站）；两校间 3 公里，骑车 / 公交 / 地铁可达',
              '**城市可达**——两校到天安门 + 故宫 + 三里屯 30-40 分钟地铁；到首都机场 1 小时；到大兴机场 45 分钟',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '你可以作为访问学生去对方学校旁听或交叉选课——许多北大学生选清华课，反之亦然，尤其交叉学科。两校共享一个联合研究园区。',
          },
        ],
      },
      {
        id: 'scholarships-cost',
        h2: '奖学金 + 费用——CSC 学者两校都全额资助',
        intro:
          'CSC 奖学金覆盖两校全额学费 + 住宿 + 月津贴 + 保险。院校追加与外部资助可叠加；差异在每校各自的追加水平。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**CSC**——两校条件相同：全额学费 + 校内住宿 + 月津贴（本科 2,500 / 硕士 3,000 / 博士 3,500 元 [以当期通知核实]）+ 医疗保险 + （部分渠道）机票',
              '**院校追加**——两校在 CSC 之外加自有奖学金；具体金额因项目与年级而异，常见 ¥2,000-10,000/月给头部候选人；工程 + 博士追加通常更高',
              '**北京市政府奖学金**——独立于 CSC，由北京市教委提供；两校国际生都可申请；覆盖学费或津贴追加',
              '**孔子学院奖学金**——1 年中文语言项目；覆盖学费 + 住宿 + 津贴 + 保险；两校都接收孔子学院奖学金学生',
              '**自费成本**——英文授课学费本科 ¥20,000-50,000/年；硕士 ¥30,000-80,000/年；国际生宿舍 ¥1,500-2,500/月',
            ],
          },
          {
            type: 'table',
            caption: 'CSC 覆盖 + 常见院校追加（2027 周期，示意）',
            columns: ['项目', '北大', '清华'],
            rows: [
              ['CSC 学费全免', '全额', '全额'],
              ['CSC 校内住宿', '提供', '提供'],
              ['CSC 月津贴（本科/硕士/博士）', '¥2,500/3,000/3,500', '¥2,500/3,000/3,500'],
              ['院校追加（头部 CSC 学者）', '通常 ¥2,000-8,000/月', '通常 ¥2,000-10,000/月（工程 + CS 更高）'],
              ['头部候选人月合计', '¥4,500-10,000/月', '¥4,500-13,000/月'],
              ['自费学费（英文本科）', '¥20,000-45,000/年', '¥22,000-50,000/年'],
              ['自费住宿（国际生双人间/学期）', '¥1,500-2,500', '¥1,500-2,500'],
            ],
          },
        ],
      },
      {
        id: 'career-outcomes',
        h2: '就业去向——同一雇主网络，不同路径',
        intro:
          '北大和清华都进入中国 + 全球顶级雇主网络。路径因领域而异。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**金融 + 咨询 + 科技 + 政策**——两校都进入麦肯锡、BCG、Bain、高盛、摩根士丹利、JP 摩根、阿里巴巴、腾讯、字节跳动、拼多多、华为、四大、世行、IMF、UN 机构、财政部中国、央企银行',
              '**北大校友优势**——公共政策 + 政府（北大学生进入国务院、外交部、央媒）；经济 + 金融；燕京学堂进入国际关系 + 全球事务；法学 + 咨询',
              '**清华校友优势**——工程 + 科技（清华进入阿里巴巴、字节跳动、腾讯、华为、中国主要科技公司 + 全球工程办公室）；经管进入投行；建筑进入主要设计公司；苏世民是独立全球事务通道',
              '**博士 + 学术**——两校博士都进入全球顶级研究岗位；清华工程 / 材料 / CS 研究产出更强，北大经济 / 政治 / 法学 / 自然科学更强',
              '**对国际生**——两校都让毕业生进入本国顶级雇主；中国本土网络对想在中国就业的国际生是更大优势',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '对想在中国就业的国际生来说，北大和清华都是入门学位。差异在学科匹配，不在雇主去向。',
          },
        ],
      },
      {
        id: 'decision-framework',
        h2: '决策框架——什么时候申请哪所',
        intro:
          '最干净的决策规则：学科匹配第一，校园氛围第二，奖学金竞争第三，职业地理第四。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**申请北大**——若学科为人文、社科、法、基础科学（物理/化学/生物/数学）、医学（MBBS）、或国际关系；你欣赏历史园林校园；你的职业是政策 / 咨询 / 金融 / 学术 / 政府',
              '**申请清华**——若学科为工程、CS、材料、建筑、商科（尤其金融）、或公共政策；你欣赏现代工程校园；你的职业是科技 / 工程 / 金融 / 产品管理',
              '**两校都申请**——若学科两校都开设（CS、数学、商科、公共卫生、经济等）且你无法决定；成本是再多一份申请 + CSCA 成绩 + 学习计划；许多国际生申请 3-5 所顶尖大学，不止 2 所',
              '**苏世民学者**——单独申请，与清华常规硕士分开；苏世民单独截止（通常 5 月），单独申请，单独录取流程',
              '**燕京学堂**——单独申请，与北大常规硕士分开；燕京单独申请流程',
            ],
          },
          {
            type: 'table',
            caption: '决策矩阵——按你的画像选对大学',
            columns: ['你的画像', '北大？', '清华？', '都申请？'],
            rows: [
              ['人文 / 社科 / 法学', '强匹配', '次选', '否——申北大 + 1-2 所其他'],
              ['工程 / CS / 材料 / 建筑', '次选', '强匹配', '否——申清华 + 1-2 所其他'],
              ['经济 / 金融 / 商科 / 公共政策', '强匹配', '强匹配', '是——两校都申 + 1-2 所其他'],
              ['数学 / 物理 / 化学 / 生物', '强匹配', '强匹配', '是——两校都申 + 1-2 所其他'],
              ['MBBS / 临床医学', '强匹配', '次选', '否——申北大 + 其他教育部 MBBS'],
              ['公共卫生', '强匹配', '强匹配', '是——两校都申 + 1-2 所其他'],
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '不要只申请两校之一。申请成本（CSCA + 学习计划 + 推荐信）在 1 所和 3-5 所顶尖大学之间是一样的——CSCA 成绩 + 学习计划 + 推荐信是瓶颈，不是申请费。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '北大和清华哪个对国际生更好？',
        a: '两校都是全球前 20，处于同一档；选择看学科匹配，不是名气。北大在人文、社科、法、基础科学与医学领先；清华在工程、CS、材料、建筑、商科（尤其金融）领先。若两校都开设你的学科，都申请。',
      },
      {
        q: '北大和清华要求 CSCA 吗？',
        a: '是——自 2026 级起两校都要求学士申请者提交 CSCA 成绩（许多硕士项目也用作筛选信号）。数学全员必考；物理和/或化学取决于项目。CSCA 对英文轨候选人为英文版。见 /csca-exam 完整指南。',
      },
      {
        q: '能在北大或清华读英文项目吗？',
        a: '能——两校在多数主流学科都提供完整英文本科学位与英文硕士。CSCA 替代 HSK 给英文轨申请者；雅思 6.5+（硕士）/ 6.0+（本科）是语言门槛。免费中文课内置于项目。',
      },
      {
        q: '北大和清华奖学金怎么比？',
        a: '两校都全额覆盖 CSC 学者的学费 + 住宿 + 月津贴 + 保险，基础津贴档位相同（本科 2,500 / 硕士 3,000 / 博士 3,500 元/月 [以当期通知核实]）。院校追加叠加在 CSC 之上——清华工程 / CS 追加通常稍高。北京市政府奖学金两校都可申。',
      },
      {
        q: '我应该两校都申请吗？',
        a: '如果你的学科两校都有（CS、数学、商科、公共卫生、经济等），是的。1 所和 5 所顶尖大学之间的申请成本一样——CSCA + 学习计划 + 推荐信是瓶颈，不是申请费。广申提高命中率。',
      },
      {
        q: '清华苏世民学者是什么？',
        a: '苏世民学者是清华全资助、英文授课、一年制硕士项目，聚焦全球事务、公共政策、商科。每年约 200 人，与清华常规硕士项目分开申请，截止通常在 5 月，录取率个位数。',
      },
      {
        q: '北大燕京学堂是什么？',
        a: '燕京学堂是北大的跨学科硕士项目，聚焦中国研究——历史、哲学、宗教、社会。中英双语教学（中文经典 + 英文研讨），住宿学院制，每年约 150 人，单独申请流程。',
      },
      {
        q: '北大和清华在哪里？',
        a: '两校都在北京海淀区，相距 3 公里。北大临颐和园（燕园校园，古典园林风格）。清华临五道口（更大、更现代校园）。两校到北京市中心 30-40 分钟地铁；到首都机场 1 小时。',
      },
    ],
    howToSteps: [
      {
        name: '确定学科——主要筛选',
        text: '人文、社科、法、基础科学、医学选北大。工程、CS、材料、建筑、商科（金融）选清华。CS、数学、商科、公共卫生、经济两校都强。',
      },
      {
        name: '考英语 + 规划 CSCA',
        text: '雅思 6.5+（硕士）/ 6.0+（本科）是基础。2027 年 9 月入学参加 2026 年 11 月（报名 10 月 15-21 日北京时间）、12 月或 2027 年 1 月 CSCA 场次，确保成绩早于 CSC 截止前到位。',
      },
      {
        name: '筛选 3-5 所目标（两校 + 1-2 所保底）',
        text: '北大 + 清华 + 复旦 + 上交 + 浙大是头部申请者的现实 5 校清单。加 1 所排名 20-50 的保底校。1 所和 5 所申请成本相同。',
      },
      {
        name: '先申请大学（与 CSC 并行）',
        text: '2026 年 11-12 月通过国际学生门户提交申请。拿到预录取函后再申 CSC。',
      },
      {
        name: '写针对目标项目的学习计划',
        text: '硕士 800-1,500 字；博士 1,500-3,000 字。必须引用目标大学的具体教师 + 实验室 + 设施。通用模板是常见拒因。每个目标一份学习计划——不要重复用。',
      },
      {
        name: '燕京与苏世民单独申请',
        text: '燕京学堂（北大）+ 苏世民学者（清华）都有单独申请流程与单独截止（燕京通常 1-2 月；苏世民通常 5 月）。是全球事务的精英通道，录取率个位数。',
      },
      {
        name: '申请 CSC + 北京市政府 + 院校追加',
        text: 'CSC + 北京市政府 + 院校追加并行申请，三者可叠加。CSC 截止 1-4 月；北京市政府通常 3-5 月对秋季入学。',
      },
    ],
    ctaTitle: '正在北大和清华之间选择？',
    ctaSubtitle:
      'SICA 顾问按你的学科匹配对的大学、规划 CSCA + 英语成绩时间线、针对北大或清华写专属学习计划、叠加 CSC + 北京市政府 + 院校追加奖学金。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university',
        label: '北京大学简介',
        description: '院系、特色项目、英文授课硕士、CSCA 组合、奖学金、费用。',
      },
      {
        href: '/tsinghua-university',
        label: '清华大学简介',
        description: '工程 + 应用科学旗舰、苏世民学者、英文授课硕士、CSCA 组合。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '科目、形式、计分、费用、豁免、CSC 要求、11/12/1 月场次。',
      },
    ],
  },
};
