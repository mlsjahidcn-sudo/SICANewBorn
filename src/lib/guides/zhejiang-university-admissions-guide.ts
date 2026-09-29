import type { LocalizedGuide } from './types';

/**
 * Zhejiang University admissions deep-dive — flagship admissions guide #5
 * of 5 (docs/flagship-admissions-5-article-plan.md).
 *
 * Complements /zhejiang-university profile with operational depth +
 * the International Campus (Haining) joint institutes and the Alibaba /
 * Hangzhou tech-ecosystem angle.
 *
 * Target queries: "ZJU admissions", "Zhejiang University application
 * international", "apply ZJU", "ZJU CSCA", "浙大 申请".
 */
export const zhejiangUniversityAdmissionsGuide: LocalizedGuide = {
  en: {
    slug: 'zhejiang-university-admissions-guide',
    eyebrow: 'ADMISSIONS DEEP-DIVE',
    title: 'Zhejiang University admissions — step-by-step guide for international students',
    description:
      'How to apply to Zhejiang University as an international student: routes, deadlines, document checklist, CSCA combinations by school, language requirements, the International Campus joint institutes, scholarship stack, and what makes a competitive applicant.',
    subtitle:
      'Zhejiang University (ZJU) admits international bachelor\'s and master\'s applicants through a study-plan-based admissions process with the CSCA exam mandatory from 2026. ZJU\'s distinctive feature is its multi-campus structure: the main Hangzhou campuses plus the International Campus in Haining, which hosts English-medium joint institutes with the University of Edinburgh (biomedical sciences) and the University of Illinois Urbana-Champaign (engineering). Hangzhou\'s tech ecosystem — Alibaba\'s home city — makes ZJU a magnet for CS, data science, and entrepreneurship-focused international students. This guide covers routes, deadlines, document checklist, CSCA combinations by ZJU school, language thresholds (HSK / IELTS / TOEFL), the CSC + ZJU + Zhejiang Provincial Government scholarship stack, interview prep, and the profile components that move a borderline applicant to admit.',
    stats: [
      { value: '~8-12%', label: 'Typical international admit rate (master\'s)' },
      { value: 'Nov–Mar', label: 'Fall intake main deadline window' },
      { value: 'Haining', label: 'International Campus (English-medium)' },
      { value: 'Yes', label: 'CSCA mandatory from 2026 intake' },
    ],
    quickAnswer:
      'Zhejiang University admits international students through three channels — direct application via the ZJU International College portal, the Chinese Government Scholarship (CSC) channel with ZJU as host institution, and the International Campus joint institutes (ZJU-UoE and ZJU-UIUC) for English-medium programs. For September 2026 fall intake, the main deadline window is November to March (ZJU opens early — often November). The CSCA is mandatory from the 2026 intake. Required documents include passport, transcripts, a study plan, 2 recommendation letters, language evidence (HSK 5+ for Chinese-taught; IELTS 6.5+ / TOEFL 90+ for English-taught), and a ¥400–¥800 application fee. ZJU is strongest in computer science, engineering, medicine, agriculture, and business — with Hangzhou\'s tech ecosystem (Alibaba, NetEase, Hikvision) providing internship and career opportunities no other Chinese university city matches.',
    keyTakeaways: [
      'Three application channels: ZJU direct, CSC through ZJU, and the International Campus joint institutes (ZJU-UoE biomedical, ZJU-UIUC engineering) for English-medium programs',
      'Fall intake main deadline: November–March window; ZJU opens among the earliest — often November; CSC closes December–January',
      'CSCA mandatory from 2026 intake; engineering and CS typically require STEM Chinese + Math + Physics; the International Campus English programs follow their own requirements',
      'Hangzhou advantage: Alibaba\'s home city with the deepest tech-internship ecosystem of any Chinese university city; cost of living below Beijing/Shanghai',
      'Document package: passport, transcripts (notarized Chinese or English translation), study plan, 2 recommendation letters, language test, application fee',
      'Scholarship stack: CSC (full funding) + ZJU\'s own scholarships + Zhejiang Provincial Government Scholarship; Hangzhou living costs stretch further than Beijing or Shanghai',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'ZJU admissions at a glance',
        intro:
          'The Zhejiang University admissions picture for international students in 2026.',
        blocks: [
          {
            type: 'p',
            text: 'Zhejiang University processes international applications through its International College (the international students office), which runs a central online application portal. From 2026 intake onward, the CSCA is mandatory for international bachelor\'s degree applicants and most master\'s programs. ZJU\'s admit rate for international master\'s applicants is roughly 8–12% — marginally more accessible than PKU/Tsinghua — with the most competitive programs (computer science, data science, clinical medicine) below that. ZJU\'s calendar opens early: the portal often opens in November and many programs close by March. The International Campus in Haining (about 40 minutes from Hangzhou by high-speed rail) hosts English-medium joint institutes with the University of Edinburgh (ZJU-UoE Institute) and the University of Illinois Urbana-Champaign (ZJU-UIUC Institute) — these follow their own admissions requirements.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'ZJU\'s International College responds to written inquiries in English within 3–5 business days. Use the contact form on the ZJU International College portal for the fastest response.',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: 'Application routes — which channel to use',
        intro:
          'Three routes lead to ZJU; the International Campus is its own stream.',
        blocks: [
          {
            type: 'p',
            text: 'The standard ZJU International College portal serves two routes (direct application and CSC scholarship). The International Campus joint institutes (ZJU-UoE, ZJU-UIUC) run English-medium programs with their own admissions requirements, though applications typically still flow through ZJU\'s portal with program-specific selection. Choosing between the Hangzhou main-campus programs and the Haining International Campus is the first decision for English-medium applicants.',
          },
          {
            type: 'table',
            caption: 'ZJU application routes — channel comparison',
            columns: ['Route', 'How it works', 'Best for', 'Deadline'],
            rows: [
              ['ZJU direct (self-funded)', 'Apply via the ZJU International College portal with self-funding declaration', 'Standard bachelor\'s or master\'s applicants', 'November – March (most programs)'],
              ['CSC channel (through ZJU)', 'Select CSC scholarship on the ZJU portal; ZJU nominates you to CSC', 'Applicants for full CSC funding', 'December – January (early); check current cycle'],
              ['International Campus joint institutes', 'Apply through the ZJU portal to ZJU-UoE (biomedical) or ZJU-UIUC (engineering) programs', 'English-medium applicants wanting joint-institute degrees', 'Typically November – February; verify per program'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**ZJU direct** — the standard path for self-funded applicants; also handles ZJU\'s own scholarships and the Zhejiang Provincial Government Scholarship',
              '**CSC channel** — the path for full-funded scholarship; select CSC on the ZJU portal; ZJU nominates to CSC',
              '**International Campus (Haining)** — English-medium joint institutes: ZJU-UoE (biomedical sciences, with University of Edinburgh) and ZJU-UIUC (engineering, with University of Illinois Urbana-Champaign); degrees carry the joint-institute designation; programs are English throughout',
              '**Hangzhou main campus** — most ZJU schools (CS, engineering, medicine, business, agriculture) are on the Hangzhou campuses; mix of Chinese-taught and a growing set of English-taught master\'s',
              '**Practical advice** — CS and data-science applicants should weigh the Hangzhou ecosystem heavily: Alibaba, NetEase, Hikvision, and hundreds of startups make ZJU the best-integrated Chinese university for tech internships',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The International Campus programs and Hangzhou main-campus programs are selected through the same ZJU portal but are different degrees — the joint-institute programs are English-medium with joint curriculum governance. Read the program page carefully before applying.',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: 'Deadlines — when to apply',
        intro:
          'ZJU opens early: often November, with March the general close.',
        blocks: [
          {
            type: 'p',
            text: 'ZJU\'s fall intake (September 2026 start) has a primary deadline window from November to March — among the earliest opening of any top Chinese university. The CSC channel typically closes December–January. The International Campus programs typically run November–February deadlines. Spring intake (March 2027 start, where available) typically closes October 31 of the prior year. The dates below are planning approximations — verify on the program page.',
          },
          {
            type: 'table',
            caption: 'ZJU intake windows (planning approximations — verify per program)',
            columns: ['Intake', 'Programs', 'Main deadline', 'Notes'],
            rows: [
              ['Fall 2026 (September start)', 'Bachelor\'s, most master\'s, most PhD', 'November – March', 'Portal often opens November'],
              ['Fall 2026 — CSC channel', 'Most programs', 'December – January', 'Early CSC deadline'],
              ['Fall 2026 — International Campus', 'ZJU-UoE, ZJU-UIUC programs', 'November – February', 'English-medium; verify per program'],
              ['Fall 2026 — competitive master\'s', 'CS, data science, clinical medicine', 'December – February', 'Earlier than the general deadline'],
              ['Spring 2027 (March start, limited)', 'Some master\'s (verify per school)', 'October 31, 2026', 'Not all schools offer spring intake'],
              ['Doctoral (PhD)', 'Most schools', 'November – March', 'Some schools have rolling review'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Earliest deadlines first** — CSC channel (December–January) and International Campus (November–February) close early',
              '**Most programs** — the general deadline falls January–March; submit 4+ weeks early for document corrections',
              '**Sequencing** — ZJU and Fudan open earliest (November–December); prepare shared documents once and reuse for Beijing and later Shanghai applications',
              '**Spring intake** — only some schools; closes October 31 of the prior year',
              '**Late submissions** — ZJU does not accept late applications',
              '**Recommendation letters** — ask referees 4–6 weeks before the deadline',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'ZJU opens among the earliest of any top Chinese university — often November. If you are applying to multiple universities, prepare documents by October and submit the ZJU (and Fudan) applications first, then reuse for the Beijing universities.',
          },
        ],
      },
      {
        id: 'documents',
        h2: 'Document checklist — what to prepare',
        intro:
          'A line-item checklist of what to send, in what format.',
        blocks: [
          {
            type: 'p',
            text: 'ZJU\'s document requirements follow the standard Chinese university pattern with strict enforcement. The International Campus programs have English-language requirements throughout; joint-institute applicants submit everything in English.',
          },
          {
            type: 'table',
            caption: 'ZJU application document checklist',
            columns: ['Document', 'Specific requirement', 'Format', 'Translation needed?'],
            rows: [
              ['Passport', 'Valid for at least 1 year; clear color scan of bio page', 'PDF, <5 MB', 'No'],
              ['High school diploma / Bachelor\'s degree', 'Original + notarized translation if not in Chinese/English', 'PDF, color scan', 'Yes if not Chinese/English'],
              ['Transcripts', 'All years; original or notarized translation; GPA visible', 'PDF, color scan', 'Yes if not Chinese/English'],
              ['Study plan / personal statement', '800–1,500 words in Chinese (Chinese-taught) or English (English-taught); program-specific', 'PDF, ≤2 MB', 'In language of instruction'],
              ['Recommendation letters', '2 letters from lecturers or above (master\'s); associate professors or above preferred (PhD)', 'PDF on letterhead, signed', 'Optional English translation'],
              ['Language test — Chinese-taught', 'HSK 5 or 6 (program-dependent); valid for 2 years', 'PDF scan of score report', 'No'],
              ['Language test — English-taught', 'IELTS 6.5+ / TOEFL 90+; valid for 2 years; native English speakers may waive', 'PDF scan of score report', 'No'],
              ['Application fee', '¥400–¥800 per program; non-refundable', 'Online payment', 'No'],
              ['Passport-style photo', 'Recent; white background; full face', 'JPG, <500 KB', 'No'],
              ['Physical examination form', 'ZJU\'s specific form; completed by a licensed physician', 'PDF, signed and stamped', 'English translation acceptable'],
              ['CV / resume', 'Academic CV; education, awards, publications, research', 'PDF, 1–2 pages', 'In language of instruction'],
              ['Publications (PhD applicants)', 'Copies of published papers, theses, or research outputs', 'PDF', 'Optional English translation'],
              ['No-criminal-record certificate', 'Issued by home-country police; less than 6 months old', 'PDF, notarized', 'Yes if not Chinese/English'],
              ['Financial proof', 'Bank statement showing ¥70,000+ available OR scholarship award letter', 'PDF', 'English translation acceptable'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Translation requirements** — documents not in Chinese or English must be notarized translations',
              '**International Campus applicants** — the entire application is in English; Chinese-language documents still need certified English translation',
              '**Study plan** — the most important non-academic document; demonstrate specific knowledge of the school and its faculty',
              '**Physical examination** — use the ZJU-provided form',
              '**Financial proof** — bank statements should show ¥70,000+ available (Hangzhou costs slightly less than Beijing/Shanghai); a scholarship award letter substitutes',
              '**Early preparation** — ZJU\'s November opening means October is the practical start for document gathering',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Documents not in Chinese or English MUST be notarized translations. Untranslated documents or non-notarized translations will result in your application being marked incomplete and rejected before review.',
          },
        ],
      },
      {
        id: 'csca-strategy',
        h2: 'CSCA strategy — what each ZJU school asks for',
        intro:
          'CSCA combinations vary by school within ZJU. Verify per program.',
        blocks: [
          {
            type: 'p',
            text: 'ZJU does not publish a single master list of CSCA combinations. Each school publishes the required combination on its program page. The combinations below are typical patterns — but the official source is always the program\'s current admissions page. The International Campus joint institutes follow English-based requirements; check the current policy on CSCA applicability.',
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations by ZJU school (verify per program)',
            columns: ['ZJU school / program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['College of Computer Science & Technology', 'STEM Chinese + Math + Physics', 'One of ZJU\'s most competitive'],
              ['School of Software Technology', 'STEM Chinese + Math + Physics', 'Hangzhou ecosystem advantage'],
              ['College of Information Science & Engineering', 'STEM Chinese + Math + Physics', 'EE + information emphasis'],
              ['School of Mechanical Engineering', 'STEM Chinese + Math + Physics', 'ZJU founding discipline'],
              ['School of Materials Science & Engineering', 'STEM Chinese + Math + Physics', 'Some programs add Chemistry'],
              ['College of Chemical & Biological Engineering', 'Math + Chemistry', 'Process emphasis'],
              ['College of Civil Engineering & Architecture', 'STEM Chinese + Math + Physics', 'Structures emphasis'],
              ['School of Aeronautics & Astronautics', 'STEM Chinese + Math + Physics', 'Aerospace emphasis'],
              ['College of Optical Science & Engineering', 'STEM Chinese + Math + Physics', 'Optics is a ZJU signature'],
              ['School of Medicine (clinical)', 'Math + Chemistry', 'Biology helpful'],
              ['School of Public Health', 'Math + Chemistry', 'Some programs accept Physics'],
              ['College of Pharmaceutical Sciences', 'Math + Chemistry', 'Pharmaceutical emphasis'],
              ['College of Life Sciences', 'Math + Chemistry', 'Some programs add Biology'],
              ['School of Mathematical Sciences', 'STEM Chinese + Math + Physics', 'Some programs drop Physics'],
              ['Department of Physics', 'STEM Chinese + Math + Physics', 'Physics research essential'],
              ['Department of Chemistry', 'Math + Chemistry', 'Some programs add Physics'],
              ['School of Economics & Zhejiang Financial Institute', 'Math + (Humanities or STEM Chinese)', 'Quant-heavy'],
              ['School of Management (business, finance)', 'Math + (Humanities or STEM Chinese)', 'Some programs in English'],
              ['International Campus — ZJU-UoE (biomedical)', 'English-based requirements; check current CSCA policy', 'English-medium joint institute'],
              ['International Campus — ZJU-UIUC (engineering)', 'English-based requirements; check current CSCA policy', 'English-medium joint institute'],
              ['School of International Studies', 'Humanities Chinese + Math', 'Foreign languages + IR'],
              ['Guanghua Law School', 'Humanities Chinese + Math', 'Some programs add English evidence'],
              ['School of Humanities', 'Humanities Chinese + Math', 'Study plan often decides'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**STEM Chinese track** — required by most engineering, CS, and science programs',
              '**Humanities Chinese track** — required by humanities, social sciences, law, and IR programs',
              '**Math** — required by virtually all programs',
              '**Physics** — required by engineering, CS, physics, and optics programs',
              '**Chemistry** — required by medicine, life sciences, pharmacy, and chemical engineering programs',
              '**International Campus** — English-medium joint institutes; verify the current CSCA policy on the program page before registering',
              '**Business programs** — some English-taught options with Math + English evidence',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Always verify the CSCA combination on the program\'s official admissions page before registering for a CSCA session. CS and data science are the most competitive at ZJU — target 85+ percentile.',
          },
        ],
      },
      {
        id: 'language-requirements',
        h2: 'Language requirements — HSK, IELTS, TOEFL by program',
        intro:
          'Language thresholds vary by program level and language of instruction.',
        blocks: [
          {
            type: 'p',
            text: 'ZJU\'s language requirements are program-specific. The thresholds below are planning approximations — verify on the program page. The International Campus programs are English-only.',
          },
          {
            type: 'table',
            caption: 'ZJU language thresholds by program type (planning approximations)',
            columns: ['Program type', 'Chinese-taught — minimum', 'English-taught — minimum', 'Notes'],
            rows: [
              ['Bachelor\'s (most programs)', 'HSK 5 (≥180) or HSK 6 (≥200)', 'IELTS 6.5 / TOEFL 90', 'Most bachelor\'s are Chinese-taught'],
              ['Bachelor\'s (International Campus)', 'No Chinese requirement', 'IELTS 6.5 / TOEFL 90', 'ZJU-UoE / ZJU-UIUC English-medium'],
              ['Master\'s (Chinese-taught)', 'HSK 5 (≥200) or HSK 6 (≥220)', 'IELTS 6.0 / TOEFL 80 (as supplement)', 'Engineering master\'s often bilingual'],
              ['Master\'s (English-taught)', 'HSK 4 (optional)', 'IELTS 6.5 / TOEFL 90', 'Growing set across CS, business, engineering'],
              ['Master\'s (International Campus)', 'No Chinese requirement', 'IELTS 6.5–7.0 / TOEFL 90–100', 'Joint-institute standards'],
              ['PhD (most programs)', 'HSK 5 (≥200)', 'IELTS 6.5 / TOEFL 90', 'Higher HSK for Chinese-supervised PhDs'],
              ['PhD (English-supervised)', 'HSK 4 (optional)', 'IELTS 6.5 / TOEFL 90', 'Co-supervisor arrangement'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**HSK validity** — HSK scores are valid for 2 years from the test date',
              '**IELTS / TOEFL validity** — also 2 years',
              '**Native English speakers** — may waive IELTS/TOEFL at most programs',
              '**International Campus** — no Chinese requirement for admission; Chinese language courses available as electives',
              '**Engineering master\'s** — many ZJU engineering master\'s are effectively bilingual; HSK 5 is the safe floor',
              '**CS master\'s in English** — ZJU\'s English-taught CS and data science master\'s are among the largest of any Chinese university; IELTS 6.5 / TOEFL 90 typical',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSCA scores do NOT replace HSK scores. For Chinese-taught programs, you typically need BOTH a passing CSCA combination AND HSK 5 or 6.',
          },
        ],
      },
      {
        id: 'scholarship-stack',
        h2: 'Scholarship stack — CSC + ZJU + Zhejiang Provincial Government',
        intro:
          'How to stack multiple scholarships to fully fund your ZJU degree.',
        blocks: [
          {
            type: 'p',
            text: 'ZJU admits international students regardless of funding source. Most international applicants use a stacked approach: apply through the CSC channel for full funding, rely on automatic consideration for ZJU\'s own scholarships, and apply for the Zhejiang Provincial Government Scholarship if eligible. Hangzhou\'s living costs run below Beijing and Shanghai, so the same stipend stretches further.',
          },
          {
            type: 'table',
            caption: 'ZJU scholarship stack — what to apply for and when',
            columns: ['Scholarship', 'Coverage', 'Deadline', 'How to apply'],
            rows: [
              ['Chinese Government Scholarship (CSC)', 'Full: tuition + dorm + ¥2,500–3,500/month stipend + airfare', 'December – January (verify per cycle)', 'Select CSC on ZJU portal; ZJU nominates to CSC'],
              ['ZJU University Scholarship', 'Tuition waiver (partial to full) + some stipends', 'Same as admission deadline', 'Automatic consideration with strong application'],
              ['Zhejiang Provincial Government Scholarship', 'Tuition + stipend support', 'Spring (verify per cycle)', 'Through ZJU International College'],
              ['Hangzhou Municipal programs (where available)', 'Top-up awards for Hangzhou-based students', 'Varies', 'Through ZJU International College'],
              ['Confucius Institute Scholarship', 'Full funding for Chinese language + culture programs', 'Varies', 'Through home-country Confucius Institute or ZJU'],
              ['Home-country government scholarships', 'Varies by country', 'Varies', 'Through home-country scholarship agency'],
              ['External / foundation scholarships', 'Varies; partial to full', 'Varies', 'Direct to scholarship provider'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Apply for CSC first — but early** — ZJU\'s CSC deadline (December–January) is among the earliest in China',
              '**ZJU scholarship** — automatic for strong applicants',
              '**Zhejiang Provincial Government Scholarship** — provincial-level award for international students at Zhejiang universities; apply through the ZJU International College',
              '**The stacking principle** — multiple smaller scholarships often beat one large one',
              '**Cost advantage** — Hangzhou living costs run below Beijing and Shanghai; a CSC stipend covers more in Hangzhou than in either first-tier capital',
              '**Scholarship after admission** — if admitted self-funded, you can still apply for provincial and external scholarships post-admission',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'A typical fully-funded international student at ZJU has CSC full + ZJU scholarship (top-up) + Zhejiang Provincial Government Scholarship. Because Hangzhou costs less than Beijing or Shanghai, the same package buys a noticeably better quality of life.',
          },
        ],
      },
      {
        id: 'interview-prep',
        h2: 'Interview prep — what to expect',
        intro:
          'Most competitive master\'s and PhD programs interview; International Campus interviews in English.',
        blocks: [
          {
            type: 'p',
            text: 'ZJU\'s interview process is program-specific. Most bachelor\'s programs do not interview; competitive master\'s programs interview nearly all short-listed applicants; PhD programs always interview. International Campus interviews are conducted in English with joint-institute faculty.',
          },
          {
            type: 'table',
            caption: 'ZJU interview format by program type',
            columns: ['Program type', 'Interview format', 'Duration', 'Language'],
            rows: [
              ['Bachelor\'s (most)', 'Rare; some programs have a short online interview', '15–30 minutes', 'Chinese or English'],
              ['Bachelor\'s (International Campus)', 'Online interview with joint-institute faculty', '20–40 minutes', 'English'],
              ['Master\'s (most)', 'Online interview via Tencent Meeting or Zoom; panel of 2–3 faculty', '20–45 minutes', 'Chinese or English depending on program'],
              ['Master\'s (CS, data science, medicine)', 'Technical interview + panel', '60–90 minutes total', 'Chinese or English'],
              ['PhD (most)', 'Online interview; research proposal presentation + Q&A', '45–90 minutes', 'Chinese or English depending on supervisor'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Format** — most interviews are online via Tencent Meeting or Zoom',
              '**Panel** — typically 2–3 faculty members; do not repeat content from your study plan — deepen it',
              '**Common questions** — why ZJU? Why this program? Research direction? Why Hangzhou?',
              '**Technical questions** — CS and engineering interviews often include technical questions (math, physics, coding); be ready to solve problems live',
              '**International Campus interviews** — English academic discussion with joint-institute faculty; questions about your preparation for the specific joint curriculum',
              '**Career questions** — for CS and data science applicants, expect questions about the Hangzhou tech ecosystem and internship interests; a thoughtful answer signals seriousness',
              '**Logistics** — confirm the platform 24 hours in advance; test equipment; have a backup device',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CS and data-science interviews at ZJU often include live technical problem-solving — refresh core math, algorithms, and physics. A concrete answer to "why Hangzhou / why ZJU for tech" signals you understand the ecosystem advantage.',
          },
        ],
      },
      {
        id: 'profile-strength',
        h2: 'What makes a competitive applicant',
        intro:
          'The components of a profile that moves a borderline applicant to admit.',
        blocks: [
          {
            type: 'p',
            text: 'ZJU\'s admissions review weighs academic record most heavily, but for borderline applicants the soft components decide. The profile components below are listed in rough order of importance for competitive programs.',
          },
          {
            type: 'table',
            caption: 'ZJU competitive profile components',
            columns: ['Component', 'Weight', 'What "strong" looks like'],
            rows: [
              ['Academic record (GPA, ranking)', 'Highest', 'Top 10–15% of graduating class; GPA 3.4+/4.0 or equivalent'],
              ['CSCA scores', 'High', 'Target 80+ percentile; 85+ for CS, data science, medicine'],
              ['Technical / coding preparation (CS track)', 'High', 'Demonstrated projects, competition results (ACM-ICPC valued)'],
              ['Language proficiency', 'High', 'HSK 6 for Chinese-taught; IELTS 7.0+ for English-taught / International Campus'],
              ['Study plan quality', 'High', 'Program-specific; clear direction; faculty-fit awareness'],
              ['Recommendation letters', 'High', '2 letters from professors; specific examples'],
              ['Research experience', 'Medium-high', 'Undergraduate thesis, research assistantships, publications (PhD)'],
              ['Ecosystem fit (CS / entrepreneurship)', 'Medium', 'Concrete interest in the Hangzhou tech ecosystem'],
              ['Awards and distinctions', 'Medium', 'National/international competitions'],
              ['Fit with ZJU faculty', 'Medium (research programs)', 'Mention specific faculty whose work aligns with yours'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Top 10–15% rule** — ZJU is marginally more accessible than PKU/Tsinghua but still highly competitive',
              '**CSCA target scores** — 80+ percentile typical; 85+ for CS, data science, and medicine',
              '**Coding portfolio (CS track)** — ZJU\'s CS programs value demonstrated coding ability; ACM-ICPC or equivalent competition participation and personal projects help significantly',
              '**Study plan as differentiator** — a specific, faculty-fit-aware study plan can overcome a slightly weaker academic record',
              '**Research output** — for PhD applicants, publications significantly strengthen the application',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For CS and data-science applicants, a coding portfolio (competition results, GitHub projects, internship experience) is the highest-leverage differentiator after GPA — and a concrete "why Hangzhou" narrative signals you understand the Alibaba-ecosystem advantage.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When does ZJU open applications for fall 2026?',
        a: 'The ZJU International College portal typically opens for fall intake applications in November of the prior year — among the earliest of any top Chinese university. Most programs close January–March; the CSC channel closes December–January. Verify on the program\'s official page.',
      },
      {
        q: 'Is the CSCA mandatory for ZJU in 2026?',
        a: 'Yes — from the 2026 intake, the CSCA is mandatory for international bachelor\'s degree applicants and most master\'s programs. The International Campus joint institutes follow English-based requirements; check the current policy on CSCA applicability.',
      },
      {
        q: 'What is the ZJU International Campus?',
        a: 'A campus in Haining (about 40 minutes from Hangzhou by high-speed rail) hosting English-medium joint institutes: ZJU-UoE (biomedical sciences, with the University of Edinburgh) and ZJU-UIUC (engineering, with the University of Illinois Urbana-Champaign). Programs are English throughout with their own admissions requirements.',
      },
      {
        q: 'What CSCA combination does ZJU ask for?',
        a: 'It varies by school. Most engineering and CS programs require STEM Chinese + Math + Physics; medicine and life sciences require Math + Chemistry; humanities and social sciences require Humanities Chinese + Math. Always check the program\'s official page.',
      },
      {
        q: 'How much does it cost to apply to ZJU?',
        a: 'The application fee is ¥400–¥800 per program, paid online. The fee is non-refundable. Financial proof of ¥70,000+ is required for self-funded applicants (Hangzhou costs slightly less than Beijing/Shanghai).',
      },
      {
        q: 'Does ZJU interview international applicants?',
        a: 'Most bachelor\'s programs do not interview (International Campus is an exception — English interviews). Competitive master\'s programs interview nearly all short-listed applicants. PhD programs always interview. Interviews are typically online.',
      },
      {
        q: 'How competitive is ZJU for international students?',
        a: 'Highly competitive but marginally more accessible than PKU/Tsinghua. Master\'s admit rate is roughly 8–12%; CS, data science, and clinical medicine are below that. Applicants from the top 10–15% of their national system have the best chance.',
      },
      {
        q: 'Why is Hangzhou an advantage for ZJU students?',
        a: 'Hangzhou is Alibaba\'s home city, with NetEase, Hikvision, and hundreds of startups — the deepest tech-internship ecosystem of any Chinese university city. Living costs run below Beijing and Shanghai, so scholarships stretch further.',
      },
      {
        q: 'Does ZJU accept spring intake applications?',
        a: 'Some master\'s programs offer spring intake (March start); spring applications typically close October 31 of the prior year. Not all schools offer spring intake.',
      },
      {
        q: 'What scholarships can I stack at ZJU?',
        a: 'The typical stack is CSC (full funding, apply December–January) + ZJU University Scholarship (automatic consideration) + Zhejiang Provincial Government Scholarship (apply through the ZJU International College). Hangzhou\'s lower living costs make the same package go further.',
      },
    ],
    howToSteps: [
      {
        name: 'Verify the program\'s CSCA combination and language requirements',
        text: 'Visit the ZJU International College portal; find your target program; note the CSCA subject combination, language thresholds, and any program-specific tests. International Campus programs have English-based requirements.',
      },
      {
        name: 'Start document preparation by October',
        text: 'ZJU opens among the earliest — often November. Notarized translations and recommendation letters take weeks; prepare by October.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September 2026 intake, target a late-autumn or winter CSCA session. Engineering and CS applicants typically need STEM Chinese + Math + Physics.',
      },
      {
        name: 'Apply online through the ZJU portal',
        text: 'Submit the full package before the program deadline (most programs close November–March). Save the confirmation email.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit the CSC application through the ZJU portal (closes December–January). Apply for the Zhejiang Provincial Government Scholarship through the ZJU International College. ZJU\'s own scholarships are automatic for strong applicants.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs interview; International Campus interviews in English. CS interviews may include live technical problem-solving — refresh math, algorithms, and physics.',
      },
    ],
    ctaTitle: 'Applying to Zhejiang University?',
    ctaSubtitle:
      'SICA counselors verify your target program\'s CSCA combination and language requirements, help you choose between the Hangzhou main campus and the International Campus, refine your study plan, and coordinate CSC + ZJU + Zhejiang Provincial scholarship applications. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/zhejiang-university',
        label: 'Zhejiang University profile',
        description: 'Schools, signature programs, history, scholarships, cost of attendance.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The exam that determines what subject combinations you can apply with.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'The full-funding scholarship path for ZJU and most Chinese universities.',
      },
      {
        href: '/best-cities-china-international-students',
        label: 'Best cities in China for international students',
        description: 'How Hangzhou compares to Beijing, Shanghai, and other student cities.',
      },
    ],
  },
  zh: {
    slug: 'zhejiang-university-admissions-guide',
    eyebrow: '申请深度指南',
    title: '浙江大学申请——国际生逐步指南',
    description:
      '如何以国际生身份申请浙江大学：申请渠道、截止日期、材料清单、各院系 CSCA 组合、语言要求、国际校区联合学院路径、奖学金组合，以及申请者的竞争画像。',
    subtitle:
      '浙江大学通过基于学习计划的招生流程（2026 起 CSCA 必考）招收国际本科生与硕士生。浙大的独特之处是多校区结构：杭州主校区加海宁国际校区——后者与爱丁堡大学（生物医学）和伊利诺伊大学厄巴纳-香槟分校（工科）合办英文联合学院。杭州的科技生态（阿里巴巴总部所在）使浙大成为计算机、数据科学与创业方向国际学生的磁石。本指南覆盖渠道、截止、材料清单、浙大各院系 CSCA 组合、语言门槛（HSK / 雅思 / 托福）、CSC + 浙大 + 浙江省政府奖学金组合、面试准备，以及让擦边申请者转录的画像要素。',
    stats: [
      { value: '约 8-12%', label: '典型国际硕士录取率' },
      { value: '11-3月', label: '秋季入学主要截止窗口' },
      { value: '海宁', label: '国际校区（英文授课）' },
      { value: '是', label: '2026 起 CSCA 必考' },
    ],
    quickAnswer:
      '浙江大学通过三条渠道招收国际生——浙大国际学院门户直接申请、CSC 奖学金渠道（浙大为接收单位）、以及国际校区联合学院（浙大-爱丁堡、浙大-UIUC）的英文项目。2026 年 9 月入学的主要截止窗口为 11 月至 3 月（浙大开网早——常为 11 月）。2026 起 CSCA 必考。所需材料：护照、成绩单、学习计划、2 封推荐信、语言成绩（中文授课要 HSK 5+；英文授课要雅思 6.5+ / 托福 90+）、¥400-800 申请费。浙大最强的是计算机、工科、医学、农学与商科——杭州的科技生态（阿里、网易、海康威视）提供其他中国大学城市无法匹敌的实习与就业机会。',
    keyTakeaways: [
      '三条申请渠道：浙大直申、CSC 通过浙大、国际校区联合学院（浙大-爱丁堡生物医学、浙大-UIUC 工科）英文项目',
      '秋季入学主要截止：11-3 月窗口；浙大开网最早之一——常为 11 月；CSC 12-1 月截止',
      '2026 起 CSCA 必考；工科与 CS 通常要求理工中文 + 数学 + 物理；国际校区英文项目按自己的要求',
      '杭州优势：阿里巴巴总部所在，科技实习生态中国最深；生活费低于京沪',
      '申请材料：护照、成绩单（公证翻译件）、学习计划、2 封推荐信、语言成绩、申请费',
      '奖学金组合：CSC（全额）+ 浙大自有奖学金 + 浙江省政府奖学金；杭州生活成本比京沪更省',
    ],
    sections: [
      {
        id: 'overview',
        h2: '浙大录取概览',
        intro:
          '2026 年浙大国际生录取全貌。',
        blocks: [
          {
            type: 'p',
            text: '浙江大学通过国际学院（国际学生办公室）处理国际申请，运营统一在线门户。2026 年起，CSCA 是国际本科生与多数硕士项目的必考。浙大国际硕士申请者录取率约 8-12%——比北大清华略宽松——最热门项目（计算机、数据科学、临床医学）低于此。浙大日历开网早：门户常在 11 月开放，多数项目 3 月前截止。海宁国际校区（距杭州高铁约 40 分钟）与爱丁堡大学（浙大-爱丁堡学院）和伊利诺伊大学厄巴纳-香槟分校（浙大-UIUC 学院）合办英文联合学院——按自己的招生要求运行。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '浙大国际学院在 3-5 个工作日内以英文回复书面问询。用浙大国际学院门户的联系表单提交最快。',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: '申请渠道——如何选',
        intro:
          '三条路通向浙大；国际校区是独立路径。',
        blocks: [
          {
            type: 'p',
            text: '浙大标准国际学院门户服务两条渠道（直接申请 + CSC 奖学金）。国际校区联合学院（浙大-爱丁堡、浙大-UIUC）运行英文项目，有自己的招生要求，但申请通常仍通过浙大门户加项目特定选拔。英文授课申请者的第一个决定是在杭州主校区项目与海宁国际校区之间选择。',
          },
          {
            type: 'table',
            caption: '浙大申请渠道对比',
            columns: ['渠道', '运作方式', '适合人群', '截止日期'],
            rows: [
              ['浙大直接申请（自费）', '通过浙大国际学院门户申报并声明自费', '标准本科或硕士申请者', '多数项目 11 月 - 3 月'],
              ['CSC 渠道（通过浙大）', '在浙大门户勾选 CSC；浙大提名至 CSC', '申请全额 CSC 资助者', '12 月 - 1 月（早；按当年通知）'],
              ['国际校区联合学院', '通过浙大门户申请浙大-爱丁堡（生物医学）或浙大-UIUC（工科）项目', '想要联合学院学位的英文授课申请者', '通常 11 月 - 2 月；按项目核验'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**浙大直接申请**——自费申请者的标准路径；也处理浙大自有奖学金与浙江省政府奖学金',
              '**CSC 渠道**——全额奖学金路径；勾选 CSC；浙大向 CSC 提名',
              '**国际校区（海宁）**——英文联合学院：浙大-爱丁堡（生物医学，与爱丁堡大学）与浙大-UIUC（工科，与伊利诺伊大学香槟分校）；学位含联合学院标注；全程英文',
              '**杭州主校区**——多数浙大院系（计算机、工科、医学、商科、农学）在杭州校区；中文授课与不断增长的英文硕士并存',
              '**实务建议**——计算机与数据科学申请者应重点权衡杭州生态：阿里、网易、海康威视与数百家创业公司使浙大成为科技实习整合度最高的中国大学',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '国际校区项目与杭州主校区项目通过同一浙大门户选拔但是不同的学位——联合学院项目全英文授课、联合课程治理。申请前仔细读项目页。',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: '截止日期——什么时候申请',
        intro:
          '浙大开网早：常为 11 月，3 月普通截止。',
        blocks: [
          {
            type: 'p',
            text: '浙大秋季入学（2026 年 9 月）的主要截止窗口为 11 月至 3 月——中国顶尖大学中开网最早的之一。CSC 渠道通常 12-1 月截止。国际校区项目通常 11-2 月截止。春季入学（2027 年 3 月，如适用）通常在前一年 10 月 31 日截止。以下日期为规划近似值——以项目页为准。',
          },
          {
            type: 'table',
            caption: '浙大入学窗口（规划近似值——以项目页为准）',
            columns: ['入学', '项目', '主要截止', '说明'],
            rows: [
              ['2026 秋（9 月入学）', '本科、多数硕士、多数博士', '11 月 - 3 月', '门户常 11 月开放'],
              ['2026 秋——CSC 渠道', '多数项目', '12 月 - 1 月', 'CSC 截止早'],
              ['2026 秋——国际校区', '浙大-爱丁堡、浙大-UIUC 项目', '11 月 - 2 月', '英文授课；按项目核验'],
              ['2026 秋——热门硕士', 'CS、数据科学、临床医学', '12 月 - 2 月', '早于普通截止'],
              ['2027 春（3 月入学，限部分）', '部分硕士（按院系）', '2026 年 10 月 31 日', '并非所有院系都有春季入学'],
              ['博士（PhD）', '多数院系', '11 月 - 3 月', '部分院系滚动评审'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**最早截止优先**——CSC 渠道（12-1 月）与国际校区（11-2 月）早截止',
              '**多数项目**——普通截止落在 1-3 月；建议提前 4 周以上提交',
              '**排序**——浙大与复旦开网最早（11-12 月）；共享材料准备一次，先交浙大（和复旦）再复用到北京高校',
              '**春季入学**——仅部分院系；前一年 10 月 31 日截止',
              '**逾期不候**——浙大不接受逾期申请',
              '**推荐信**——提前 4-6 周联系推荐人',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '浙大是中国顶尖大学中开网最早的之一——常为 11 月。如申请多所大学，10 月备齐材料先交浙大（与复旦），再复用到北京高校。',
          },
        ],
      },
      {
        id: 'documents',
        h2: '材料清单——准备什么',
        intro:
          '逐项说明要交什么、什么格式。',
        blocks: [
          {
            type: 'p',
            text: '浙大申请材料遵循中国大学标准模式并严格执行。国际校区项目全程英文要求；联合学院申请者全部提交英文。',
          },
          {
            type: 'table',
            caption: '浙大申请材料清单',
            columns: ['材料', '具体要求', '格式', '需要翻译？'],
            rows: [
              ['护照', '有效期 1 年以上；个人信息页清晰彩色扫描', 'PDF，<5 MB', '否'],
              ['高中毕业证书 / 本科学位证', '原件 + 公证翻译（非中英文）', 'PDF，彩色扫描', '非中英文要'],
              ['成绩单', '全部学年；原件或公证翻译；GPA 可见', 'PDF，彩色扫描', '非中英文要'],
              ['学习计划 / 个人陈述', '800-1,500 字中文（中文授课）或英文（英文授课）；按项目', 'PDF，≤2 MB', '用授课语言'],
              ['推荐信', '硕士 2 封讲师及以上；博士优先副教授及以上', 'PDF，抬头纸，签字', '可选英文翻译'],
              ['语言——中文授课', 'HSK 5 或 6（按项目）；2 年有效', 'PDF 成绩单扫描', '否'],
              ['语言——英文授课', '雅思 6.5+ / 托福 90+；2 年有效；母语者可能免', 'PDF 成绩单扫描', '否'],
              ['申请费', '¥400-800 / 项目；不退', '在线支付', '否'],
              ['护照照片', '近期；白底；正面', 'JPG，<500 KB', '否'],
              ['体检表', '浙大规定表格；执业医师填写', 'PDF，签字盖章', '可接受英文翻译'],
              ['CV / 简历', '学术 CV；教育、奖项、发表、研究', 'PDF，1-2 页', '用授课语言'],
              ['发表（博士申请者）', '已发表论文、毕业论文或研究成果', 'PDF', '可选英文翻译'],
              ['无犯罪记录证明', '本国警察出具；6 个月内', 'PDF，公证', '非中英文要'],
              ['经济证明', '银行流水一年 ¥70,000+ OR 奖学金证明', 'PDF', '可接受英文翻译'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**翻译要求**——非中英文材料须公证翻译',
              '**国际校区申请者**——整个申请用英文；中文材料仍需认证英文翻译',
              '**学习计划**——最重要的非学术材料；展示对学院与师资的具体了解',
              '**体检**——使用浙大规定表格',
              '**经济证明**——银行流水显示 ¥70,000+ 可用资金（杭州成本略低于京沪）；奖学金证明可替代',
              '**提前准备**——浙大 11 月开网意味着 10 月是材料收集的实际起点',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '非中英文材料必须公证翻译。未翻译或非公证翻译将导致申请被标记为不完整，在评审前被拒。',
          },
        ],
      },
      {
        id: 'csca-strategy',
        h2: 'CSCA 策略——浙大各院系要求',
        intro:
          'CSCA 组合按院系不同。按项目核验。',
        blocks: [
          {
            type: 'p',
            text: '浙大不发布 CSCA 组合的统一总表。每个院系在项目页公布所需组合。下表是典型模式——但官方来源始终是项目当年录取页。国际校区联合学院按英文要求；查当前 CSCA 适用政策。',
          },
          {
            type: 'table',
            caption: '浙大各院系典型 CSCA 组合（按项目核验）',
            columns: ['院系 / 项目族', '常见 CSCA 组合', '说明'],
            rows: [
              ['计算机科学与技术学院', '理工中文 + 数学 + 物理', '浙大最激烈的项目之一'],
              ['软件学院', '理工中文 + 数学 + 物理', '杭州生态优势'],
              ['信息与电子工程学院', '理工中文 + 数学 + 物理', '电子 + 信息侧重'],
              ['机械工程学院', '理工中文 + 数学 + 物理', '浙大创始学科'],
              ['材料科学与工程学院', '理工中文 + 数学 + 物理', '部分项目加化学'],
              ['化学工程与生物工程学院', '数学 + 化学', '过程侧重'],
              ['建筑工程学院', '理工中文 + 数学 + 物理', '结构侧重'],
              ['航空航天学院', '理工中文 + 数学 + 物理', '航天侧重'],
              ['光电科学与工程学院', '理工中文 + 数学 + 物理', '光学是浙大招牌'],
              ['医学院（临床）', '数学 + 化学', '生物有帮助'],
              ['公共卫生学院', '数学 + 化学', '部分项目接受物理'],
              ['药学院', '数学 + 化学', '药学侧重'],
              ['生命科学学院', '数学 + 化学', '部分项目加生物'],
              ['数学科学学院', '理工中文 + 数学 + 物理', '部分项目免物理'],
              ['物理学系', '理工中文 + 数学 + 物理', '物理研究必需'],
              ['化学系', '数学 + 化学', '部分项目加物理'],
              ['经济学院 / 浙江金融研究院', '数学 +（人文或理工中文）', '量化重'],
              ['管理学院（商科、金融）', '数学 +（人文或理工中文）', '部分项目英文'],
              ['国际校区——浙大-爱丁堡（生物医学）', '英文要求；查当前 CSCA 政策', '英文联合学院'],
              ['国际校区——浙大-UIUC（工科）', '英文要求；查当前 CSCA 政策', '英文联合学院'],
              ['国际联合学院（国际关系）', '人文中文 + 数学', '外国语言 + IR'],
              ['光华法学院', '人文中文 + 数学', '部分项目加英语成绩'],
              ['人文学院', '人文中文 + 数学', '学习计划常决定'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**理工中文轨**——多数工科、计算机、理科项目要求',
              '**人文中文轨**——人文、社科、法学、国关项目要求',
              '**数学**——几乎所有项目要求',
              '**物理**——工科、计算机、物理、光学项目要求',
              '**化学**——医学、生命科学、药学、化工项目要求',
              '**国际校区**——英文联合学院；报名前查项目页当前 CSCA 政策',
              '**商科项目**——部分英文选项用数学 + 英语成绩',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '报名 CSCA 场次前务必在项目官方录取页核验当年科目组合。CS 与数据科学是浙大最激烈的——目标 85+ 百分位。',
          },
        ],
      },
      {
        id: 'language-requirements',
        h2: '语言要求——按项目的 HSK / 雅思 / 托福',
        intro:
          '语言门槛按项目层级与授课语言不同。',
        blocks: [
          {
            type: 'p',
            text: '浙大语言要求因项目而异。以下门槛为规划近似值——以项目页为准。国际校区项目全英文。',
          },
          {
            type: 'table',
            caption: '浙大语言门槛（按项目类型，规划近似值）',
            columns: ['项目类型', '中文授课最低', '英文授课最低', '说明'],
            rows: [
              ['本科（多数）', 'HSK 5（≥180）或 HSK 6（≥200）', '雅思 6.5 / 托福 90', '多数本科中文授课'],
              ['本科（国际校区）', '无中文要求', '雅思 6.5 / 托福 90', '浙大-爱丁堡 / 浙大-UIUC 全英文'],
              ['硕士（中文授课）', 'HSK 5（≥200）或 HSK 6（≥220）', '雅思 6.0 / 托福 80（补充）', '工科硕士常双语'],
              ['硕士（英文授课）', 'HSK 4（可选）', '雅思 6.5 / 托福 90', 'CS、商科、工科英文项目不断增长'],
              ['硕士（国际校区）', '无中文要求', '雅思 6.5-7.0 / 托福 90-100', '联合学院标准'],
              ['博士（多数）', 'HSK 5（≥200）', '雅思 6.5 / 托福 90', '中文导师项目 HSK 更高'],
              ['博士（英文导师）', 'HSK 4（可选）', '雅思 6.5 / 托福 90', '可配中文共同导师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**HSK 有效期**——HSK 成绩 2 年有效',
              '**雅思/托福有效期**——同为 2 年',
              '**母语英语者**——多数项目可免雅思/托福',
              '**国际校区**——录取无中文要求；中文课作为选修开放',
              '**工科硕士**——浙大很多工科硕士实际双语；HSK 5 是安全底线',
              '**CS 英文硕士**——浙大的英文 CS 与数据科学硕士是中国大学中规模最大的之一；通常雅思 6.5 / 托福 90',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSCA 成绩不能替代 HSK 成绩。中文授课项目通常需要 CSCA 组合与 HSK 5 或 6 同时合格。',
          },
        ],
      },
      {
        id: 'scholarship-stack',
        h2: '奖学金组合——CSC + 浙大 + 浙江省政府',
        intro:
          '如何叠加多项奖学金为浙大学位全额筹资。',
        blocks: [
          {
            type: 'p',
            text: '浙大录取国际生不分资金来源。多数国际申请者用叠加策略：通过 CSC 渠道申请全额资助，依靠浙大自有奖学金的自动评审，符合条件再申请浙江省政府奖学金。杭州生活成本低于京沪，同样的津贴能撑更多。',
          },
          {
            type: 'table',
            caption: '浙大奖学金组合——申请什么、何时申请',
            columns: ['奖学金', '覆盖', '截止', '申请方式'],
            rows: [
              ['中国政府奖学金（CSC）', '全额：学费 + 住宿 + ¥2,500-3,500/月 + 机票', '12 月 - 1 月（按当年通知）', '在浙大门户勾选 CSC；浙大提名'],
              ['浙大奖学金', '学费减免（部分至全额）+ 部分津贴', '与录取截止相同', '强申请自动评审'],
              ['浙江省政府奖学金', '学费 + 津贴支持', '春季（按当年通知）', '通过浙大国际学院'],
              ['杭州市级项目（如有）', '在杭学生加给奖励', '按通知', '通过浙大国际学院'],
              ['孔子学院奖学金', '中文语言与文化项目全额资助', '按孔子学院网络', '通过本国孔子学院或浙大'],
              ['本国政府奖学金', '按国家不同', '按国家不同', '通过本国奖学金机构'],
              ['外部 / 基金会奖学金', '部分至全额不等', '不定', '直接申请提供方'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**优先申请 CSC——但要早**——浙大 CSC 截止（12-1 月）是中国最早之一',
              '**浙大奖学金**——强申请者自动',
              '**浙江省政府奖学金**——面向浙江高校国际生的省级奖项；通过浙大国际学院申请',
              '**叠加原则**——多笔小额常胜一笔大额',
              '**成本优势**——杭州生活成本低于京沪；CSC 津贴在杭州比在两个一线首都覆盖更多',
              '**录取后申请**——自费录取后仍可申请省级与外部奖学金',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '典型的浙大全额资助国际生：CSC 全额 + 浙大奖学金（加给）+ 浙江省政府奖学金。因为杭州成本低于京沪，同样的组合能买到明显更好的生活质量。',
          },
        ],
      },
      {
        id: 'interview-prep',
        h2: '面试准备——会问什么',
        intro:
          '多数热门硕士与博士项目面试；国际校区全英文面试。',
        blocks: [
          {
            type: 'p',
            text: '浙大面试因项目而异。多数本科项目不面试；热门硕士几乎面试所有候选；博士一律面试。国际校区面试用英文进行，面试组含联合学院教师。',
          },
          {
            type: 'table',
            caption: '浙大面试形式（按项目类型）',
            columns: ['项目类型', '面试形式', '时长', '语言'],
            rows: [
              ['本科（多数）', '罕见；部分项目有简短在线面试', '15-30 分钟', '中文或英文'],
              ['本科（国际校区）', '与联合学院教师在线面试', '20-40 分钟', '英文'],
              ['硕士（多数）', '在线面试通过腾讯会议或 Zoom；2-3 位教师组', '20-45 分钟', '中文或英文按项目'],
              ['硕士（CS、数据科学、医学）', '技术面试 + 教师组', '合计 60-90 分钟', '中文或英文'],
              ['博士（多数）', '在线面试；研究计划陈述 + Q&A', '45-90 分钟', '中文或英文按导师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**形式**——多数面试在线通过腾讯会议或 Zoom',
              '**面试组**——通常 2-3 位教师；不要重复学习计划内容——而要深化',
              '**常见问题**——为什么选浙大？为什么这个项目？研究方向？为什么选杭州？',
              '**技术问题**——计算机与工科面试常含技术题（数学、物理、编程）；准备现场解题',
              '**国际校区面试**——与联合学院教师的英文学术讨论；问你对特定联合课程的准备',
              '**职业问题**——CS 与数据科学申请者预期被问杭州科技生态与实习意向；有思考的回答显示认真程度',
              '**后勤**——提前 24 小时确认平台；测试设备；备好备用设备',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '浙大计算机与数据科学面试常含现场技术解题——复习核心数学、算法与物理。对"为什么杭州 / 为什么浙大读 tech"有具体回答，表明你理解生态优势。',
          },
        ],
      },
      {
        id: 'profile-strength',
        h2: '什么样的申请者有竞争力',
        intro:
          '让擦边申请者转录的画像要素。',
        blocks: [
          {
            type: 'p',
            text: '浙大录取评审最看重学业成绩，但擦边申请者由软要素决定。以下画像要素按热门项目的大致重要性排序。',
          },
          {
            type: 'table',
            caption: '浙大竞争画像要素',
            columns: ['要素', '权重', '"强"长什么样'],
            rows: [
              ['学业成绩（GPA、排名）', '最高', '毕业班前 10-15%；GPA 3.4+/4.0'],
              ['CSCA 成绩', '高', '目标 80+ 百分位；CS、数据科学、医学 85+'],
              ['技术 / 编程功底（CS 轨）', '高', '可证明的项目、竞赛成绩（ACM-ICPC 加分）'],
              ['语言水平', '高', '中文授课 HSK 6；英文授课 / 国际校区雅思 7.0+'],
              ['学习计划质量', '高', '按项目；清晰方向；体现对师资的了解'],
              ['推荐信', '高', '2 封教授推荐；具体例子'],
              ['研究经历', '中-高', '本科论文、研究助理、发表（博士）'],
              ['生态契合（CS / 创业）', '中', '对杭州科技生态的具体兴趣'],
              ['奖项荣誉', '中', '国家级 / 国际竞赛'],
              ['与浙大师资契合度', '中（研究项目）', '提到与你研究一致的具体教师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**前 10-15% 规则**——浙大比北大清华略宽松但仍高度竞争',
              '**CSCA 目标分**——80+ 百分位典型；CS、数据科学、医学 85+',
              '**编程作品集（CS 轨）**——浙大计算机项目看重可证明的编程能力；ACM-ICPC 或同等竞赛参与与个人项目显著加分',
              '**学习计划作为差异化因素**——具体、了解师资的学习计划可弥补稍弱成绩',
              '**研究产出**——博士申请者发表过论文显著加分',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '计算机与数据科学申请者，GPA 之后最高杠杆的差异化因素是编程作品集（竞赛成绩、GitHub 项目、实习经历）——加一个具体的"为什么杭州"叙事，表明你理解阿里生态优势。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '浙大什么时候开放 2026 年秋季入学申请？',
        a: '浙大国际学院门户通常在前一年 11 月开放秋季入学申请——中国顶尖大学最早之一。多数项目 1-3 月截止；CSC 渠道 12-1 月截止。以项目官方页为准。',
      },
      {
        q: '2026 年浙大 CSCA 必考吗？',
        a: '是——2026 年起，国际本科生必须考 CSCA；多数硕士项目也要求。国际校区联合学院按英文要求；查当前 CSCA 适用政策。',
      },
      {
        q: '什么是浙大国际校区？',
        a: '位于海宁的校区（距杭州高铁约 40 分钟），与爱丁堡大学（浙大-爱丁堡生物医学）和伊利诺伊大学香槟分校（浙大-UIUC 工科）合办英文联合学院。全程英文授课、独立招生要求。',
      },
      {
        q: '浙大要求哪些 CSCA 组合？',
        a: '按院系不同。多数工科与 CS 要求理工中文 + 数学 + 物理；医学与生命科学要求数学 + 化学；人文与社科要求人文中文 + 数学。始终以项目官方页为准。',
      },
      {
        q: '申请浙大要多少钱？',
        a: '申请费每项目 ¥400-800，在线支付，不退。自费申请者需 ¥70,000+ 经济证明（杭州成本略低于京沪）。',
      },
      {
        q: '浙大面试国际生吗？',
        a: '多数本科项目不面试（国际校区例外——英文面试）。热门硕士几乎面试所有候选。博士一律面试。面试通常在线。',
      },
      {
        q: '浙大对国际生录取竞争多大？',
        a: '高度竞争但比北大清华略宽松。硕士录取率约 8-12%；CS、数据科学、临床医学低于此。本国前 10-15% 的申请者机会最大。',
      },
      {
        q: '为什么杭州对浙大学生是优势？',
        a: '杭州是阿里巴巴总部所在，有网易、海康威视与数百家创业公司——中国大学城市中最深的科技实习生态。生活成本低于京沪，奖学金更耐用。',
      },
      {
        q: '浙大接受春季入学申请吗？',
        a: '部分硕士项目提供春季入学（3 月开始）；春季申请通常前一年 10 月 31 日截止。并非所有院系都有春季入学。',
      },
      {
        q: '浙大可以叠加哪些奖学金？',
        a: '典型组合：CSC（全额，12-1 月申请）+ 浙大奖学金（自动评审）+ 浙江省政府奖学金（通过浙大国际学院申请）。杭州更低的生活成本让同样的组合走得更远。',
      },
    ],
    howToSteps: [
      {
        name: '核验项目的 CSCA 组合与语言要求',
        text: '访问浙大国际学院门户；找到目标项目；记录 CSCA 科目组合、语言门槛、项目特有考试。国际校区项目按英文要求。',
      },
      {
        name: '10 月开始准备材料',
        text: '浙大开网最早之一——常为 11 月。公证翻译与推荐信要数周；10 月备齐。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学瞄准深秋或冬季 CSCA 场次。工科与 CS 申请者通常需要理工中文 + 数学 + 物理。',
      },
      {
        name: '通过浙大门户网上申请',
        text: '项目截止前（多数项目 11-3 月截止）提交完整材料。保存确认邮件。',
      },
      {
        name: '并行申请奖学金',
        text: '通过浙大门户提交 CSC 申请（12-1 月截止）。通过浙大国际学院申请浙江省政府奖学金。浙大自有奖学金对强申请者自动。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '热门硕士与博士要面试；国际校区全英文面试。CS 面试可能含现场技术解题——复习数学、算法与物理。',
      },
    ],
    ctaTitle: '正在申请浙江大学？',
    ctaSubtitle:
      'SICA 顾问核验目标项目的 CSCA 组合与语言要求、帮你选择杭州主校区与国际校区、优化学习计划、协调 CSC + 浙大 + 浙江省政府奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/zhejiang-university',
        label: '浙江大学简介',
        description: '院系、特色项目、历史、奖学金、留学费用。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '决定你能拿什么科目组合去申请的那场考试。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: '浙大与多数中国大学的全额资助奖学金路径。',
      },
      {
        href: '/best-cities-china-international-students',
        label: '中国最好的留学城市',
        description: '杭州与北京、上海及其他学生城市如何对比。',
      },
    ],
  },
};
