import type { LocalizedGuide } from './types';

/**
 * Shanghai Jiao Tong University admissions deep-dive — flagship
 * admissions guide #4 of 5 (docs/flagship-admissions-5-article-plan.md).
 *
 * Complements /shanghai-jiao-tong-university profile with operational
 * depth + the UM-SJTU Joint Institute as a distinct admissions stream.
 *
 * Target queries: "SJTU admissions", "SJTU application international",
 * "UM-SJTU JI application", "Antai MBA international", "SJTU CSCA",
 * "上海交大 申请".
 */
export const shanghaiJiaoTongUniversityAdmissionsGuide: LocalizedGuide = {
  en: {
    slug: 'shanghai-jiao-tong-university-admissions-guide',
    eyebrow: 'ADMISSIONS DEEP-DIVE',
    title: 'Shanghai Jiao Tong University admissions — step-by-step guide for international students',
    description:
      'How to apply to SJTU as an international student: routes, deadlines, documents, CSCA combinations by school, language requirements, the UM-SJTU Joint Institute stream, scholarship stack, and what makes a competitive applicant.',
    subtitle:
      'Shanghai Jiao Tong University admits international bachelor\'s and master\'s applicants through a study-plan-based admissions process with the CSCA exam mandatory from 2026. SJTU has a distinctive two-track structure: the standard SJTU ISO application serves most schools, while the UM-SJTU Joint Institute (JI) — the English-medium engineering partnership with the University of Michigan — runs its own admissions stream with separate deadlines and English-only requirements. This guide covers both: routes, deadlines, document checklist, CSCA combinations by SJTU school, language thresholds (HSK / IELTS / TOEFL), the CSC + SJTU + Shanghai Government scholarship stack, interview prep, and the profile components that move a borderline applicant to admit.',
    stats: [
      { value: '~5-10%', label: 'Typical international admit rate (master\'s)' },
      { value: 'Dec–Apr', label: 'Fall intake main deadline window' },
      { value: 'Yes', label: 'UM-SJTU JI (separate English stream)' },
      { value: 'Yes', label: 'CSCA mandatory from 2026 intake' },
    ],
    quickAnswer:
      'Shanghai Jiao Tong University admits international students through three channels — direct application via the SJTU International Students Office portal, the Chinese Government Scholarship (CSC) channel with SJTU as host institution, and the UM-SJTU Joint Institute (JI) English-medium engineering stream with its own application. For September 2026 fall intake, the main deadline window is December to April (CSC closes earliest, often December–January). The CSCA is mandatory from the 2026 intake. Required documents include passport, transcripts, a study plan, 2 recommendation letters, language evidence (HSK 5+ for Chinese-taught; IELTS 6.5+ / TOEFL 90+ for English-taught; JI typically requires IELTS 6.5 / TOEFL 90+ with no Chinese requirement), and a ¥400–¥800 application fee. SJTU is strongest in engineering, computer science, medicine, and business (Antai College).',
    keyTakeaways: [
      'Three application channels: SJTU ISO direct, CSC through SJTU, and the UM-SJTU Joint Institute English-medium engineering stream (separate application)',
      'Fall intake main deadline: December–April window; CSC closes December–January; JI deadlines differ from the standard calendar',
      'CSCA mandatory from 2026 intake; engineering and CS typically require STEM Chinese + Math + Physics; the JI stream follows its own English-based requirements',
      'UM-SJTU Joint Institute: English-medium ECE / mechanical / other engineering degrees with University of Michigan partnership; separate admissions, often earlier deadlines',
      'Document package: passport, transcripts (notarized Chinese or English translation), study plan, 2 recommendation letters, language test, application fee',
      'Scholarship stack: CSC (full funding) + SJTU\'s own scholarships + Shanghai Government Scholarship (Class A full / Class B tuition)',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'SJTU admissions at a glance',
        intro:
          'The SJTU admissions picture for international students in 2026.',
        blocks: [
          {
            type: 'p',
            text: 'Shanghai Jiao Tong University processes international applications through its International Students Office, which runs a central online application portal. From 2026 intake onward, the CSCA is mandatory for international bachelor\'s degree applicants and most master\'s programs. SJTU\'s admit rate for international master\'s applicants is roughly 5–10%, with the most competitive programs (computer science, electronic engineering, Antai IMBA, clinical medicine at SJTU School of Medicine) admitting fewer. The distinctive feature of SJTU\'s international admissions is the UM-SJTU Joint Institute (JI) — an English-medium engineering college jointly run with the University of Michigan, with its own application process, its own deadlines, and degree options that include transfer pathways to Ann Arbor.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'SJTU\'s International Students Office responds to written inquiries in English within 3–5 business days. Use the contact form on the SJTU ISO portal for the fastest response.',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: 'Application routes — standard, CSC, and the JI stream',
        intro:
          'Three routes lead to SJTU; the Joint Institute is its own stream.',
        blocks: [
          {
            type: 'p',
            text: 'The standard SJTU ISO portal serves two routes (direct application and CSC scholarship). The UM-SJTU Joint Institute runs a separate English-medium admissions process. Choosing between the standard SJTU application and the JI stream is the first decision for engineering applicants — JI offers a US-style engineering education in English with Michigan partnership, while SJTU\'s standard engineering schools are mostly Chinese-taught with stronger domestic industry ties.',
          },
          {
            type: 'table',
            caption: 'SJTU application routes — channel comparison',
            columns: ['Route', 'How it works', 'Best for', 'Deadline'],
            rows: [
              ['SJTU ISO direct (self-funded)', 'Apply via the SJTU ISO portal with self-funding declaration', 'Standard bachelor\'s or master\'s applicants', 'December – April (most programs)'],
              ['CSC channel (through SJTU)', 'Select CSC scholarship on the SJTU ISO portal; SJTU nominates you to CSC', 'Applicants for full CSC funding', 'December – January (early); check current cycle'],
              ['UM-SJTU Joint Institute (JI)', 'Apply through the JI admissions portal (separate from SJTU ISO)', 'Engineering applicants wanting English-medium, Michigan-partnership education', 'Earlier than standard; typically November – February rounds (verify per cycle)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**SJTU ISO direct** — the standard path for self-funded applicants; also handles SJTU\'s own scholarships and the Shanghai Government Scholarship',
              '**CSC channel** — the path for full-funded scholarship; select CSC on the SJTU ISO portal; SJTU\'s ISO submits nominations to CSC',
              '**UM-SJTU Joint Institute (JI)** — English-medium engineering college (ECE, mechanical, and related); separate application portal; degrees awarded by SJTU with JI designation; some students spend time at the University of Michigan campus in Ann Arbor via exchange pathways',
              '**Antai College of Economics & Management** — SJTU\'s business school; IMBA and master\'s programs use the standard SJTU ISO portal but with English-based requirements (some programs ask for GMAT)',
              '**Practical advice** — engineering applicants should evaluate both the JI stream and the standard SJTU engineering schools; the choice determines the language of instruction and the application calendar',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The JI stream and the standard SJTU application are separate — applying to JI does not require a separate SJTU ISO application, and vice versa. Engineering applicants can apply to both in the same cycle if timelines permit.',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: 'Deadlines — when to apply',
        intro:
          'Fall intake window runs December–April; CSC closes earliest.',
        blocks: [
          {
            type: 'p',
            text: 'SJTU\'s fall intake (September 2026 start) has a primary deadline window from December to April. The CSC channel typically closes December–January. The JI stream runs its own rounds, typically November–February. Spring intake (March 2027 start, where available) typically closes October 31 of the prior year. The dates below are planning approximations — verify on the program page.',
          },
          {
            type: 'table',
            caption: 'SJTU intake windows (planning approximations — verify per program)',
            columns: ['Intake', 'Programs', 'Main deadline', 'Notes'],
            rows: [
              ['Fall 2026 (September start)', 'Bachelor\'s, most master\'s, most PhD', 'December – April', 'Portal opens November–December'],
              ['Fall 2026 — CSC channel', 'Most programs', 'December – January', 'Earliest SJTU deadline'],
              ['Fall 2026 — UM-SJTU JI', 'JI engineering programs', 'November – February rounds', 'Separate calendar; verify per cycle'],
              ['Fall 2026 — competitive master\'s', 'CS, EE, Antai IMBA, clinical medicine', 'January – March', 'Earlier than the general deadline'],
              ['Spring 2027 (March start, limited)', 'Some master\'s (verify per school)', 'October 31, 2026', 'Not all schools offer spring intake'],
              ['Doctoral (PhD)', 'Most schools', 'December – April', 'Some schools have rolling review'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Earliest deadlines first** — CSC channel (December–January) and the JI stream (November–February) close before the general window',
              '**Most programs** — the general deadline falls January–April depending on school; submit 4+ weeks early for document corrections',
              '**Sequencing** — SJTU sits between Fudan (earlier) and the Beijing universities (later); prepare shared documents once and reuse',
              '**Spring intake** — only some schools; closes October 31 of the prior year',
              '**Late submissions** — SJTU does not accept late applications',
              '**Recommendation letters** — ask referees 4–6 weeks before the deadline',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'The CSC deadline at SJTU closes December–January — among the earliest in China. If you are pursuing CSC funding, your application must be complete by December. Start document preparation by October.',
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
            text: 'SJTU\'s document requirements follow the standard Chinese university pattern with strict enforcement. The JI stream has additional requirements (English-language essays and sometimes standardized test scores like SAT/AP for bachelor\'s applicants or GRE for graduate applicants).',
          },
          {
            type: 'table',
            caption: 'SJTU application document checklist (standard)',
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
              ['Physical examination form', 'SJTU\'s specific form; completed by a licensed physician', 'PDF, signed and stamped', 'English translation acceptable'],
              ['CV / resume', 'Academic CV; education, awards, publications, research', 'PDF, 1–2 pages', 'In language of instruction'],
              ['Publications (PhD applicants)', 'Copies of published papers, theses, or research outputs', 'PDF', 'Optional English translation'],
              ['No-criminal-record certificate', 'Issued by home-country police; less than 6 months old', 'PDF, notarized', 'Yes if not Chinese/English'],
              ['Financial proof', 'Bank statement showing ¥80,000+ available OR scholarship award letter', 'PDF', 'English translation acceptable'],
            ],
          },
          {
            type: 'table',
            caption: 'UM-SJTU JI — additional / differing requirements',
            columns: ['Document', 'Specific requirement', 'Notes'],
            rows: [
              ['English-language essays', 'Personal statement + supplementary essays per the JI application', 'Writing quality matters; English only'],
              ['Standardized tests (bachelor\'s)', 'SAT / AP / ACT or national curriculum scores considered', 'Check the JI page for current policy'],
              ['Standardized tests (graduate)', 'GRE accepted/preferred for some JI master\'s programs', 'Verify per program'],
              ['English proficiency', 'IELTS 6.5+ / TOEFL 90+ typical; no Chinese requirement', 'JI is English-medium throughout'],
              ['Recommendation letters', 'Same 2-letter standard; English letters preferred', 'JI reads letters in English'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Translation requirements** — documents not in Chinese or English must be notarized translations',
              '**JI applicants** — the entire JI application is in English; Chinese-language documents still need certified English translation',
              '**Study plan** — the most important non-academic document for the standard route; JI equivalents are the English essays',
              '**Physical examination** — use the SJTU-provided form',
              '**Financial proof** — bank statements should show ¥80,000+ available; a scholarship award letter substitutes',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Documents not in Chinese or English MUST be notarized translations. JI applicants submit everything in English — including translations of any Chinese-language credentials.',
          },
        ],
      },
      {
        id: 'csca-strategy',
        h2: 'CSCA strategy — what each SJTU school asks for',
        intro:
          'CSCA combinations vary by school within SJTU. Verify per program.',
        blocks: [
          {
            type: 'p',
            text: 'SJTU does not publish a single master list of CSCA combinations. Each school publishes the required combination on its program page. The combinations below are typical patterns — but the official source is always the program\'s current admissions page. The JI stream follows English-based requirements; check the current JI policy on CSCA applicability.',
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations by SJTU school (verify per program)',
            columns: ['SJTU school / program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['School of Electronic Information (EE, information engineering)', 'STEM Chinese + Math + Physics', 'One of SJTU\'s most competitive'],
              ['School of Computer Science', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['School of Mechanical Engineering', 'STEM Chinese + Math + Physics', 'SJTU\'s founding discipline'],
              ['School of Naval Architecture & Ocean Engineering', 'STEM Chinese + Math + Physics', 'World-class; SJTU signature'],
              ['School of Materials Science & Engineering', 'STEM Chinese + Math + Physics', 'Some programs add Chemistry'],
              ['School of Chemical Engineering', 'Math + Chemistry', 'Process emphasis'],
              ['School of Civil Engineering', 'STEM Chinese + Math + Physics', 'Structures emphasis'],
              ['School of Aeronautics & Astronautics', 'STEM Chinese + Math + Physics', 'Aerospace emphasis'],
              ['School of Electronic Information (communications)', 'STEM Chinese + Math + Physics', 'Same as EE'],
              ['UM-SJTU Joint Institute (JI)', 'English-based requirements; check current CSCA policy', 'English-medium throughout'],
              ['SJTU School of Medicine (clinical)', 'Math + Chemistry', 'Biology helpful'],
              ['School of Biomedical Engineering', 'Math + Physics', 'Some programs add Chemistry'],
              ['School of Life Sciences & Biotechnology', 'Math + Chemistry', 'Some programs add Biology'],
              ['School of Mathematical Sciences', 'STEM Chinese + Math + Physics', 'Some programs drop Physics'],
              ['Department of Physics & Astronomy', 'STEM Chinese + Math + Physics', 'Physics research essential'],
              ['Antai College of Economics & Management', 'Math + (Humanities or STEM Chinese)', 'IMBA in English; often no Chinese track'],
              ['School of International & Public Affairs', 'Humanities Chinese + Math', 'IR + public policy emphasis'],
              ['School of Humanities', 'Humanities Chinese + Math', 'Study plan often decides'],
              ['KoGuan School of Law', 'Humanities Chinese + Math', 'Some programs add English evidence'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**STEM Chinese track** — required by most engineering, CS, and science programs',
              '**Humanities Chinese track** — required by humanities, social sciences, law, and international affairs programs',
              '**Math** — required by virtually all programs',
              '**Physics** — required by engineering, CS, physics, and materials programs',
              '**Chemistry** — required by chemical engineering, medicine, and life sciences programs',
              '**UM-SJTU JI** — English-medium stream; verify the current CSCA policy on the JI admissions page before registering',
              '**Antai IMBA** — English-based; often no Chinese track',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Always verify the CSCA combination on the program\'s official admissions page before registering for a CSCA session. EE and CS are the most competitive at SJTU — target 85+ percentile.',
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
            text: 'SJTU\'s language requirements are program-specific. The thresholds below are planning approximations — verify on the program page. The JI stream is English-only.',
          },
          {
            type: 'table',
            caption: 'SJTU language thresholds by program type (planning approximations)',
            columns: ['Program type', 'Chinese-taught — minimum', 'English-taught — minimum', 'Notes'],
            rows: [
              ['Bachelor\'s (most programs)', 'HSK 5 (≥180) or HSK 6 (≥200)', 'IELTS 6.5 / TOEFL 90', 'Most bachelor\'s are Chinese-taught'],
              ['Bachelor\'s (UM-SJTU JI)', 'No Chinese requirement', 'IELTS 6.5 / TOEFL 90', 'English-medium throughout'],
              ['Master\'s (Chinese-taught)', 'HSK 5 (≥200) or HSK 6 (≥220)', 'IELTS 6.0 / TOEFL 80 (as supplement)', 'Engineering master\'s often bilingual'],
              ['Master\'s (English-taught)', 'HSK 4 (optional)', 'IELTS 6.5 / TOEFL 90', 'Growing set of English master\'s'],
              ['Master\'s (Antai IMBA)', 'HSK optional', 'IELTS 6.5 / TOEFL 90 / GMAT 600+', 'Work experience valued'],
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
              '**JI stream** — no Chinese requirement for admission; Chinese language courses available as electives',
              '**Engineering master\'s** — many SJTU engineering master\'s are effectively bilingual (lectures in Chinese, literature in English); HSK 5 is the safe floor',
              '**Antai IMBA** — IELTS 6.5 / TOEFL 90 plus GMAT 600+ (preferred); 2+ years work experience strengthens candidacy',
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
        h2: 'Scholarship stack — CSC + SJTU + Shanghai Government',
        intro:
          'How to stack multiple scholarships to fully fund your SJTU degree.',
        blocks: [
          {
            type: 'p',
            text: 'SJTU admits international students regardless of funding source. Most international applicants use a stacked approach: apply through the CSC channel for full funding, rely on automatic consideration for SJTU\'s own scholarships, and apply for the Shanghai Government Scholarship if eligible. JI students have additional scholarship options through the Joint Institute itself.',
          },
          {
            type: 'table',
            caption: 'SJTU scholarship stack — what to apply for and when',
            columns: ['Scholarship', 'Coverage', 'Deadline', 'How to apply'],
            rows: [
              ['Chinese Government Scholarship (CSC)', 'Full: tuition + dorm + ¥2,500–3,500/month stipend + airfare', 'December – January (verify per cycle)', 'Select CSC on SJTU ISO portal; SJTU nominates to CSC'],
              ['SJTU University Scholarship', 'Tuition waiver (partial to full) + some stipends', 'Same as admission deadline', 'Automatic consideration with strong application'],
              ['Shanghai Government Scholarship — Class A', 'Tuition + accommodation + monthly stipend (full)', 'April – May (verify per cycle)', 'Apply via Shanghai Education Commission; through SJTU ISO'],
              ['Shanghai Government Scholarship — Class B', 'Tuition waiver', 'April – May (verify per cycle)', 'Apply via Shanghai Education Commission; through SJTU ISO'],
              ['UM-SJTU JI scholarships', 'Partial to substantial tuition awards for JI students', 'Varies; often bundled with JI admission', 'Through the JI application'],
              ['Confucius Institute Scholarship', 'Full funding for Chinese language + culture programs', 'Varies', 'Through home-country Confucius Institute or SJTU ISO'],
              ['Home-country government scholarships', 'Varies by country', 'Varies', 'Through home-country scholarship agency'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Apply for CSC first — but early** — SJTU\'s CSC deadline (December–January) is among the earliest in China',
              '**SJTU scholarship** — automatic for strong applicants',
              '**Shanghai Government Scholarship** — separate application through the Shanghai Education Commission; Class A (full) is highly competitive; Class B (tuition) has a larger pool',
              '**JI scholarships** — the Joint Institute offers its own tuition awards; check the JI admissions page for current offerings',
              '**The stacking principle** — multiple smaller scholarships often beat one large one',
              '**Scholarship after admission** — if admitted self-funded, you can still apply for the Shanghai Government Scholarship post-admission',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'A typical fully-funded international student at SJTU has CSC full + Shanghai Government Class B (tuition top-up) + SJTU scholarship (stipend top-up). JI students should additionally check JI-specific awards.',
          },
        ],
      },
      {
        id: 'interview-prep',
        h2: 'Interview prep — what to expect',
        intro:
          'Most competitive master\'s and PhD programs interview; JI interviews in English.',
        blocks: [
          {
            type: 'p',
            text: 'SJTU\'s interview process is program-specific. Most bachelor\'s programs do not interview; competitive master\'s programs interview nearly all short-listed applicants; PhD programs always interview. JI interviews are conducted in English and follow a US-style format (academic discussion rather than formal panel).',
          },
          {
            type: 'table',
            caption: 'SJTU interview format by program type',
            columns: ['Program type', 'Interview format', 'Duration', 'Language'],
            rows: [
              ['Bachelor\'s (most)', 'Rare; some programs have a short online interview', '15–30 minutes', 'Chinese or English'],
              ['Bachelor\'s (UM-SJTU JI)', 'Online interview; academic discussion format', '20–40 minutes', 'English'],
              ['Master\'s (most)', 'Online interview via Tencent Meeting or Zoom; panel of 2–3 faculty', '20–45 minutes', 'Chinese or English depending on program'],
              ['Master\'s (CS, EE, Antai IMBA)', 'Technical / case interview + panel', '60–90 minutes total', 'English for IMBA'],
              ['PhD (most)', 'Online interview; research proposal presentation + Q&A', '45–90 minutes', 'Chinese or English depending on supervisor'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Format** — most interviews are online via Tencent Meeting or Zoom',
              '**Panel** — typically 2–3 faculty members; do not repeat content from your study plan — deepen it',
              '**Common questions** — why SJTU? Why this program? Research direction? Why Shanghai?',
              '**Technical questions** — engineering and CS interviews often include technical questions (math, physics, coding); be ready to solve problems live',
              '**JI interviews** — US-style academic discussion; questions about your interest in engineering, your math/physics preparation, and why the Michigan partnership appeals',
              '**IMBA interviews** — group discussion + individual interview on work experience and career goals',
              '**Logistics** — confirm the platform 24 hours in advance; test equipment; have a backup device',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Engineering and CS interviews at SJTU often include live technical problem-solving — refresh core math and physics before the interview. JI interviews are conversational but academically probing.',
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
            text: 'SJTU\'s admissions review weighs academic record most heavily, but for borderline applicants the soft components decide. The profile components below are listed in rough order of importance for competitive programs.',
          },
          {
            type: 'table',
            caption: 'SJTU competitive profile components',
            columns: ['Component', 'Weight', 'What "strong" looks like'],
            rows: [
              ['Academic record (GPA, ranking)', 'Highest', 'Top 10–15% of graduating class; GPA 3.4+/4.0 or equivalent'],
              ['CSCA scores', 'High', 'Target 80+ percentile; 85+ for EE, CS, medicine'],
              ['Math / physics preparation (JI + engineering)', 'High', 'Strong calculus, physics, and (for CS) coding background'],
              ['Language proficiency', 'High', 'HSK 6 for Chinese-taught; IELTS 7.0+ for English-taught / JI'],
              ['Study plan / essays quality', 'High', 'Program-specific; clear direction; faculty-fit awareness'],
              ['Recommendation letters', 'High', '2 letters from professors; specific examples'],
              ['Research experience', 'Medium-high', 'Undergraduate thesis, research assistantships, publications (PhD)'],
              ['Work experience', 'Medium (IMBA)', '2+ years in relevant field'],
              ['Awards and distinctions', 'Medium', 'National/international competitions (math/physics olympiads valued at JI)'],
              ['Fit with SJTU faculty', 'Medium (research programs)', 'Mention specific faculty whose work aligns with yours'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Top 10–15% rule** — SJTU is marginally less selective than PKU/Tsinghua but still highly competitive',
              '**CSCA target scores** — 80+ percentile typical; 85+ for EE, CS, and medicine',
              '**Technical depth (JI + engineering)** — JI and the engineering schools value demonstrated math/physics problem-solving; olympiad participation and strong quantitative coursework help',
              '**Study plan as differentiator** — a specific, faculty-fit-aware study plan can overcome a slightly weaker academic record',
              '**Research output** — for PhD applicants, publications significantly strengthen the application',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For engineering and JI applicants, demonstrated quantitative preparation (math olympiads, strong calculus/physics coursework, coding projects) is the highest-leverage differentiator after GPA.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When does SJTU open applications for fall 2026?',
        a: 'The SJTU ISO portal typically opens for fall intake applications in November–December of the prior year. Most programs close December–April; the CSC channel closes December–January. Verify on the program\'s official page.',
      },
      {
        q: 'Is the CSCA mandatory for SJTU in 2026?',
        a: 'Yes — from the 2026 intake, the CSCA is mandatory for international bachelor\'s degree applicants and most master\'s programs. The UM-SJTU JI stream follows English-based requirements; check the current JI policy on CSCA applicability.',
      },
      {
        q: 'What is the UM-SJTU Joint Institute?',
        a: 'An English-medium engineering college at SJTU jointly run with the University of Michigan, offering ECE, mechanical, and related engineering degrees. It runs its own admissions process with separate deadlines, English-only requirements, and some exchange pathways to the Ann Arbor campus.',
      },
      {
        q: 'What CSCA combination does SJTU ask for?',
        a: 'It varies by school. Most engineering and CS programs require STEM Chinese + Math + Physics; medicine and life sciences require Math + Chemistry; humanities and social sciences require Humanities Chinese + Math. Antai IMBA is English-based. Always check the program\'s official page.',
      },
      {
        q: 'How much does it cost to apply to SJTU?',
        a: 'The application fee is ¥400–¥800 per program, paid online. The fee is non-refundable. Financial proof of ¥80,000+ is required for self-funded applicants.',
      },
      {
        q: 'Does SJTU interview international applicants?',
        a: 'Most bachelor\'s programs do not interview (JI is an exception — it interviews in English). Competitive master\'s programs interview nearly all short-listed applicants. PhD programs always interview. Interviews are typically online.',
      },
      {
        q: 'How competitive is SJTU for international students?',
        a: 'Highly competitive. Master\'s admit rate is roughly 5–10%; EE, CS, Antai IMBA, and clinical medicine are below 5%. Applicants from the top 10–15% of their national system have the best chance.',
      },
      {
        q: 'Can I apply to both the UM-SJTU JI and the standard SJTU application?',
        a: 'Yes — they are separate applications with separate deadlines. Engineering applicants can apply to both in the same cycle if timelines permit.',
      },
      {
        q: 'Does SJTU accept spring intake applications?',
        a: 'Some master\'s programs offer spring intake (March start); spring applications typically close October 31 of the prior year. Not all schools offer spring intake.',
      },
      {
        q: 'What scholarships can I stack at SJTU?',
        a: 'The typical stack is CSC (full funding, apply December–January) + SJTU University Scholarship (automatic consideration) + Shanghai Government Scholarship (Class A full or Class B tuition, apply April–May). JI students should also check JI-specific awards.',
      },
    ],
    howToSteps: [
      {
        name: 'Verify the program\'s CSCA combination and language requirements',
        text: 'Visit the SJTU ISO portal (or the JI admissions page for the Joint Institute); find your target program; note the CSCA subject combination, language thresholds, and any program-specific tests.',
      },
      {
        name: 'Start document preparation by October',
        text: 'SJTU\'s CSC deadline closes December–January — among the earliest in China. Notarized translations and recommendation letters take weeks.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September 2026 intake, target a late-autumn or winter CSCA session. Engineering applicants need STEM Chinese + Math + Physics (typically).',
      },
      {
        name: 'Apply online (SJTU ISO portal or JI portal)',
        text: 'Standard programs: submit before the program deadline (December–April). JI: follow the JI rounds (typically November–February). Save confirmation emails.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit the CSC application through the SJTU ISO portal (closes December–January). Apply for the Shanghai Government Scholarship (April–May). SJTU\'s own scholarships are automatic for strong applicants.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs interview; JI interviews in English. Engineering interviews may include live technical problem-solving — refresh core math and physics.',
      },
    ],
    ctaTitle: 'Applying to Shanghai Jiao Tong University?',
    ctaSubtitle:
      'SICA counselors verify your target program\'s CSCA combination and language requirements, help you choose between the standard and JI streams, refine your study plan, and coordinate CSC + SJTU + Shanghai Government scholarship applications. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/shanghai-jiao-tong-university',
        label: 'Shanghai Jiao Tong University profile',
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
        description: 'The full-funding scholarship path for SJTU and most Chinese universities.',
      },
      {
        href: '/best-universities-in-shanghai',
        label: 'Best universities in Shanghai',
        description: 'How SJTU compares to Fudan, Tongji, and other Shanghai universities.',
      },
    ],
  },
  zh: {
    slug: 'shanghai-jiao-tong-university-admissions-guide',
    eyebrow: '申请深度指南',
    title: '上海交通大学申请——国际生逐步指南',
    description:
      '如何以国际生身份申请上海交大：申请渠道、截止日期、材料清单、各院系 CSCA 组合、语言要求、密西根学院（JI）路径、奖学金组合，以及申请者的竞争画像。',
    subtitle:
      '上海交通大学通过基于学习计划的招生流程（2026 起 CSCA 必考）招收国际本科生与硕士生。上交有独特的双轨结构：标准 SJTU ISO 申请服务多数院系，而密西根学院（JI）——与美国密西根大学合作的英文工科项目——运行自己的招生路径，截止日期独立、全英文要求。本指南覆盖两条路径：渠道、截止、材料清单、上交各院系 CSCA 组合、语言门槛（HSK / 雅思 / 托福）、CSC + 上交 + 上海市政府奖学金组合、面试准备，以及让擦边申请者转录的画像要素。',
    stats: [
      { value: '约 5-10%', label: '典型国际硕士录取率' },
      { value: '12-4月', label: '秋季入学主要截止窗口' },
      { value: '是', label: '密西根学院 JI（独立英文轨）' },
      { value: '是', label: '2026 起 CSCA 必考' },
    ],
    quickAnswer:
      '上海交大通过三条渠道招收国际生——SJTU 国际学生办公室门户直接申请、CSC 奖学金渠道（上交为接收单位）、以及密西根学院（JI）英文工科路径（独立申请）。2026 年 9 月入学的主要截止窗口为 12 月至 4 月（CSC 最早，常为 12-1 月）。2026 起 CSCA 必考。所需材料：护照、成绩单、学习计划、2 封推荐信、语言成绩（中文授课要 HSK 5+；英文授课要雅思 6.5+ / 托福 90+；JI 通常要求雅思 6.5 / 托福 90+ 无中文要求）、¥400-800 申请费。上交最强的是工科、计算机、医学与商科（安泰）。',
    keyTakeaways: [
      '三条申请渠道：上交 ISO 直申、CSC 通过上交、密西根学院（JI）英文工科路径（独立申请）',
      '秋季入学主要截止：12-4 月窗口；CSC 12-1 月截止；JI 截止与标准日历不同',
      '2026 起 CSCA 必考；工科与 CS 通常要求理工中文 + 数学 + 物理；JI 路径按英文要求',
      '密西根学院（JI）：与密西根大学合作的英文 ECE / 机械等工科学位；独立招生、截止常更早',
      '申请材料：护照、成绩单（公证翻译件）、学习计划、2 封推荐信、语言成绩、申请费',
      '奖学金组合：CSC（全额）+ 上交自有奖学金 + 上海市政府奖学金（A 类全额 / B 类学费）',
    ],
    sections: [
      {
        id: 'overview',
        h2: '上交录取概览',
        intro:
          '2026 年上交国际生录取全貌。',
        blocks: [
          {
            type: 'p',
            text: '上海交通大学通过国际学生办公室处理国际申请，运营统一在线门户。2026 年起，CSCA 是国际本科生与多数硕士项目的必考。上交国际硕士申请者录取率约 5-10%，最热门项目（计算机、电气工程、安泰 IMBA、医学院临床）更低。上交国际招生最独特的是密西根学院（JI）——与美国密西根大学合办的英文工科学院，独立申请流程、独立截止日期，学位含安阿伯交换路径。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '上交国际学生办公室在 3-5 个工作日内以英文回复书面问询。用 SJTU ISO 门户的联系表单提交最快。',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: '申请渠道——标准、CSC 与 JI 路径',
        intro:
          '三条路通向上交；密西根学院是独立项目。',
        blocks: [
          {
            type: 'p',
            text: '上交标准 ISO 门户服务两条渠道（直接申请 + CSC 奖学金）。密西根学院（JI）运行独立的英文招生流程。工科申请者的第一个决定是在标准上交申请与 JI 路径之间选择——JI 提供美式英文工科教育加密西根合作，而上交标准工科院系多为中文授课、国内产业联系更强。',
          },
          {
            type: 'table',
            caption: '上交申请渠道对比',
            columns: ['渠道', '运作方式', '适合人群', '截止日期'],
            rows: [
              ['上交 ISO 直接申请（自费）', '通过 SJTU ISO 门户申报并声明自费', '标准本科或硕士申请者', '多数项目 12 月 - 4 月'],
              ['CSC 渠道（通过上交）', '在上交 ISO 门户勾选 CSC；上交提名至 CSC', '申请全额 CSC 资助者', '12 月 - 1 月（早；按当年通知）'],
              ['密西根学院（JI）', '通过 JI 招生门户（独立于上交 ISO）', '想要英文授课、密西根合作的工科申请者', '早于标准；通常 11-2 月多轮（按当年通知）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**上交 ISO 直接申请**——自费申请者的标准路径；也处理上交自有奖学金与上海市政府奖学金',
              '**CSC 渠道**——全额奖学金路径；勾选 CSC；上交 ISO 向 CSC 提名',
              '**密西根学院（JI）**——英文工科学院（ECE、机械及相关）；独立申请门户；上交授学位含 JI 标注；部分学生通过交换路径赴密西根安阿伯校区',
              '**安泰经济与管理学院**——上交商学院；IMBA 与硕士项目用标准上交 ISO 门户但按英文要求（部分项目要 GMAT）',
              '**实务建议**——工科申请者应同时评估 JI 路径与上交标准工科院系；选择决定授课语言与申请日历',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'JI 路径与标准上交申请相互独立——申请 JI 不需要另填上交 ISO 申请，反之亦然。工科申请者时间允许时同一轮可两者都申请。',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: '截止日期——什么时候申请',
        intro:
          '秋季入学窗口 12-4 月；CSC 最早截止。',
        blocks: [
          {
            type: 'p',
            text: '上交秋季入学（2026 年 9 月）的主要截止窗口为 12 月至 4 月。CSC 渠道通常 12-1 月截止。JI 路径运行自己的轮次，通常 11-2 月。春季入学（2027 年 3 月，如适用）通常在前一年 10 月 31 日截止。以下日期为规划近似值——以项目页为准。',
          },
          {
            type: 'table',
            caption: '上交入学窗口（规划近似值——以项目页为准）',
            columns: ['入学', '项目', '主要截止', '说明'],
            rows: [
              ['2026 秋（9 月入学）', '本科、多数硕士、多数博士', '12 月 - 4 月', '门户 11-12 月开放'],
              ['2026 秋——CSC 渠道', '多数项目', '12 月 - 1 月', '上交最早的截止'],
              ['2026 秋——密西根学院 JI', 'JI 工科项目', '11 月 - 2 月多轮', '独立日历；按当年通知'],
              ['2026 秋——热门硕士', 'CS、电气、安泰 IMBA、临床医学', '1 月 - 3 月', '早于普通截止'],
              ['2027 春（3 月入学，限部分）', '部分硕士（按院系）', '2026 年 10 月 31 日', '并非所有院系都有春季入学'],
              ['博士（PhD）', '多数院系', '12 月 - 4 月', '部分院系滚动评审'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**最早截止优先**——CSC 渠道（12-1 月）与 JI 路径（11-2 月）先于普通窗口截止',
              '**多数项目**——普通截止按院系落在 1-4 月；建议提前 4 周以上提交',
              '**排序**——上交介于复旦（更早）与北京高校（更晚）之间；共享材料准备一次复用',
              '**春季入学**——仅部分院系；前一年 10 月 31 日截止',
              '**逾期不候**——上交不接受逾期申请',
              '**推荐信**——提前 4-6 周联系推荐人',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '上交 CSC 截止 12-1 月——中国最早之一。走 CSC 资助的话 12 月前材料必须齐备。10 月开始准备材料。',
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
            text: '上交申请材料遵循中国大学标准模式并严格执行。JI 路径有额外要求（英文文书，本科申请者有时要 SAT/AP 等标化，研究生部分项目接受/偏好 GRE）。',
          },
          {
            type: 'table',
            caption: '上交标准申请材料清单',
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
              ['体检表', '上交规定表格；执业医师填写', 'PDF，签字盖章', '可接受英文翻译'],
              ['CV / 简历', '学术 CV；教育、奖项、发表、研究', 'PDF，1-2 页', '用授课语言'],
              ['发表（博士申请者）', '已发表论文、毕业论文或研究成果', 'PDF', '可选英文翻译'],
              ['无犯罪记录证明', '本国警察出具；6 个月内', 'PDF，公证', '非中英文要'],
              ['经济证明', '银行流水一年 ¥80,000+ OR 奖学金证明', 'PDF', '可接受英文翻译'],
            ],
          },
          {
            type: 'table',
            caption: '密西根学院 JI——额外 / 不同要求',
            columns: ['材料', '具体要求', '说明'],
            rows: [
              ['英文文书', '个人陈述 + 补充文书（按 JI 申请要求）', '写作质量重要；全英文'],
              ['标化（本科）', 'SAT / AP / ACT 或本国课程成绩被考虑', '查 JI 页当前政策'],
              ['标化（研究生）', '部分 JI 硕士接受/偏好 GRE', '按项目核验'],
              ['英语水平', '通常雅思 6.5+ / 托福 90+；无中文要求', 'JI 全英文授课'],
              ['推荐信', '同 2 封标准；偏好英文信', 'JI 以英文阅读推荐信'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**翻译要求**——非中英文材料须公证翻译',
              '**JI 申请者**——整个 JI 申请用英文；中文材料仍需认证英文翻译',
              '**学习计划**——标准路径最重要的非学术材料；JI 对应的是英文文书',
              '**体检**——使用上交规定表格',
              '**经济证明**——银行流水显示 ¥80,000+ 可用资金；奖学金证明可替代',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '非中英文材料必须公证翻译。JI 申请者全部提交英文——包括中文成绩凭证的翻译件。',
          },
        ],
      },
      {
        id: 'csca-strategy',
        h2: 'CSCA 策略——上交各院系要求',
        intro:
          'CSCA 组合按院系不同。按项目核验。',
        blocks: [
          {
            type: 'p',
            text: '上交不发布 CSCA 组合的统一总表。每个院系在项目页公布所需组合。下表是典型模式——但官方来源始终是项目当年录取页。JI 路径按英文要求；查 JI 页当前 CSCA 适用政策。',
          },
          {
            type: 'table',
            caption: '上交各院系典型 CSCA 组合（按项目核验）',
            columns: ['院系 / 项目族', '常见 CSCA 组合', '说明'],
            rows: [
              ['电子信息与电气工程学院（电气、信息工程）', '理工中文 + 数学 + 物理', '上交最激烈的项目之一'],
              ['计算机学院', '理工中文 + 数学 + 物理', '量化筛选'],
              ['机械与动力工程学院', '理工中文 + 数学 + 物理', '上交创始学科'],
              ['船舶海洋与建筑工程学院', '理工中文 + 数学 + 物理', '世界级；上交招牌'],
              ['材料科学与工程学院', '理工中文 + 数学 + 物理', '部分项目加化学'],
              ['化学化工学院', '数学 + 化学', '过程侧重'],
              ['船舶土木（结构）', '理工中文 + 数学 + 物理', '结构侧重'],
              ['航空航天学院', '理工中文 + 数学 + 物理', '航天侧重'],
              ['密西根学院（JI）', '英文要求；查当前 CSCA 政策', '全程英文授课'],
              ['医学院（临床）', '数学 + 化学', '生物有帮助'],
              ['生物医学工程学院', '数学 + 物理', '部分项目加化学'],
              ['生命科学技术学院', '数学 + 化学', '部分项目加生物'],
              ['数学科学学院', '理工中文 + 数学 + 物理', '部分项目免物理'],
              ['物理与天文学院', '理工中文 + 数学 + 物理', '物理研究必需'],
              ['安泰经济与管理学院', '数学 +（人文或理工中文）', 'IMBA 英文；常无中文轨'],
              ['国际与公共事务学院', '人文中文 + 数学', '国关 + 公共政策侧重'],
              ['人文学院', '人文中文 + 数学', '学习计划常决定'],
              ['凯原法学院', '人文中文 + 数学', '部分项目加英语成绩'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**理工中文轨**——多数工科、计算机、理科项目要求',
              '**人文中文轨**——人文、社科、法学、国际事务项目要求',
              '**数学**——几乎所有项目要求',
              '**物理**——工科、计算机、物理、材料项目要求',
              '**化学**——化工、医学、生命科学项目要求',
              '**密西根学院 JI**——英文路径；报名前查 JI 招生页当前 CSCA 政策',
              '**安泰 IMBA**——英文为主；常无中文轨',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '报名 CSCA 场次前务必在项目官方录取页核验当年科目组合。电气与 CS 是上交最激烈的——目标 85+ 百分位。',
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
            text: '上交语言要求因项目而异。以下门槛为规划近似值——以项目页为准。JI 路径全英文。',
          },
          {
            type: 'table',
            caption: '上交语言门槛（按项目类型，规划近似值）',
            columns: ['项目类型', '中文授课最低', '英文授课最低', '说明'],
            rows: [
              ['本科（多数）', 'HSK 5（≥180）或 HSK 6（≥200）', '雅思 6.5 / 托福 90', '多数本科中文授课'],
              ['本科（密西根学院 JI）', '无中文要求', '雅思 6.5 / 托福 90', '全程英文授课'],
              ['硕士（中文授课）', 'HSK 5（≥200）或 HSK 6（≥220）', '雅思 6.0 / 托福 80（补充）', '工科硕士常双语'],
              ['硕士（英文授课）', 'HSK 4（可选）', '雅思 6.5 / 托福 90', '英文硕士不断增长'],
              ['硕士（安泰 IMBA）', 'HSK 可选', '雅思 6.5 / 托福 90 / GMAT 600+', '看重工作经验'],
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
              '**JI 路径**——录取无中文要求；中文课作为选修开放',
              '**工科硕士**——上交很多工科硕士实际双语（讲课中文、文献英文）；HSK 5 是安全底线',
              '**安泰 IMBA**——雅思 6.5 / 托福 90 加 GMAT 600+（优先）；2 年以上工作经验加分',
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
        h2: '奖学金组合——CSC + 上交 + 上海市政府',
        intro:
          '如何叠加多项奖学金为上交学位全额筹资。',
        blocks: [
          {
            type: 'p',
            text: '上交录取国际生不分资金来源。多数国际申请者用叠加策略：通过 CSC 渠道申请全额资助，依靠上交自有奖学金的自动评审，符合条件再申请上海市政府奖学金。JI 学生还有密西根学院自己的奖学金选项。',
          },
          {
            type: 'table',
            caption: '上交奖学金组合——申请什么、何时申请',
            columns: ['奖学金', '覆盖', '截止', '申请方式'],
            rows: [
              ['中国政府奖学金（CSC）', '全额：学费 + 住宿 + ¥2,500-3,500/月 + 机票', '12 月 - 1 月（按当年通知）', '在上交 ISO 门户勾选 CSC；上交提名'],
              ['上交奖学金', '学费减免（部分至全额）+ 部分津贴', '与录取截止相同', '强申请自动评审'],
              ['上海市政府奖学金——A 类', '学费 + 住宿 + 月津贴（全额）', '4-5 月（按当年通知）', '通过上海市教委；经上交 ISO 提交'],
              ['上海市政府奖学金——B 类', '学费减免', '4-5 月（按当年通知）', '通过上海市教委；经上交 ISO 提交'],
              ['密西根学院奖学金', 'JI 学费奖励（部分到大额）', '按通知；常与 JI 录取捆绑', '通过 JI 申请'],
              ['孔子学院奖学金', '中文语言与文化项目全额资助', '按孔子学院网络', '通过本国孔子学院或上交 ISO'],
              ['本国政府奖学金', '按国家不同', '按国家不同', '通过本国奖学金机构'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**优先申请 CSC——但要早**——上交 CSC 截止（12-1 月）是中国最早之一',
              '**上交奖学金**——强申请者自动',
              '**上海市政府奖学金**——通过上海市教委单独申请；A 类（全额）竞争激烈；B 类（学费）名额更多',
              '**JI 奖学金**——密西根学院提供自己的学费奖励；查 JI 招生页当年选项',
              '**叠加原则**——多笔小额常胜一笔大额',
              '**录取后申请**——自费录取后仍可申请上海市政府奖',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '典型的上交全额资助国际生：CSC 全额 + 上海市政府 B 类（学费加给）+ 上交奖学金（津贴加给）。JI 学生还应查看 JI 专属奖项。',
          },
        ],
      },
      {
        id: 'interview-prep',
        h2: '面试准备——会问什么',
        intro:
          '多数热门硕士与博士项目面试；JI 全英文面试。',
        blocks: [
          {
            type: 'p',
            text: '上交面试因项目而异。多数本科项目不面试；热门硕士几乎面试所有候选；博士一律面试。JI 面试用英文进行，采用美式风格（学术讨论而非正式考核组）。',
          },
          {
            type: 'table',
            caption: '上交面试形式（按项目类型）',
            columns: ['项目类型', '面试形式', '时长', '语言'],
            rows: [
              ['本科（多数）', '罕见；部分项目有简短在线面试', '15-30 分钟', '中文或英文'],
              ['本科（密西根学院 JI）', '在线面试；学术讨论形式', '20-40 分钟', '英文'],
              ['硕士（多数）', '在线面试通过腾讯会议或 Zoom；2-3 位教师组', '20-45 分钟', '中文或英文按项目'],
              ['硕士（CS、电气、安泰 IMBA）', '技术 / 案例面试 + 教师组', '合计 60-90 分钟', 'IMBA 用英文'],
              ['博士（多数）', '在线面试；研究计划陈述 + Q&A', '45-90 分钟', '中文或英文按导师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**形式**——多数面试在线通过腾讯会议或 Zoom',
              '**面试组**——通常 2-3 位教师；不要重复学习计划内容——而要深化',
              '**常见问题**——为什么选上交？为什么这个项目？研究方向？为什么选上海？',
              '**技术问题**——工科与 CS 面试常含技术题（数学、物理、编程）；准备现场解题',
              '**JI 面试**——美式学术讨论；问对工程的兴趣、数学/物理准备、为何被密西根合作吸引',
              '**IMBA 面试**——小组讨论 + 个人面试谈工作经验与职业目标',
              '**后勤**——提前 24 小时确认平台；测试设备；备好备用设备',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '上交工科与 CS 面试常含现场技术解题——面试前复习核心数学与物理。JI 面试是对话式但学术上有深度。',
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
            text: '上交录取评审最看重学业成绩，但擦边申请者由软要素决定。以下画像要素按热门项目的大致重要性排序。',
          },
          {
            type: 'table',
            caption: '上交竞争画像要素',
            columns: ['要素', '权重', '"强"长什么样'],
            rows: [
              ['学业成绩（GPA、排名）', '最高', '毕业班前 10-15%；GPA 3.4+/4.0'],
              ['CSCA 成绩', '高', '目标 80+ 百分位；电气、CS、医学 85+'],
              ['数学 / 物理功底（JI + 工科）', '高', '强微积分、物理、（CS）编程背景'],
              ['语言水平', '高', '中文授课 HSK 6；英文授课 / JI 雅思 7.0+'],
              ['学习计划 / 文书质量', '高', '按项目；清晰方向；体现对师资的了解'],
              ['推荐信', '高', '2 封教授推荐；具体例子'],
              ['研究经历', '中-高', '本科论文、研究助理、发表（博士）'],
              ['工作经验', '中（IMBA）', '相关领域 2 年以上'],
              ['奖项荣誉', '中', '国家级 / 国际竞赛（JI 看重数学/物理奥赛）'],
              ['与上交师资契合度', '中（研究项目）', '提到与你研究一致的具体教师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**前 10-15% 规则**——上交比北大清华略宽松但仍高度竞争',
              '**CSCA 目标分**——80+ 百分位典型；电气、CS、医学 85+',
              '**技术深度（JI + 工科）**——JI 与工科院系看重数学/物理解题能力；奥赛参与与强量化课程有帮助',
              '**学习计划作为差异化因素**——具体、了解师资的学习计划可弥补稍弱成绩',
              '**研究产出**——博士申请者发表过论文显著加分',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '工科与 JI 申请者，GPA 之后最高杠杆的差异化因素是可证明的量化功底（数学奥赛、强微积分/物理课程、编程项目）。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '上交什么时候开放 2026 年秋季入学申请？',
        a: '上交 ISO 门户通常在前一年 11-12 月开放秋季入学申请。多数项目 12-4 月截止；CSC 渠道 12-1 月截止。以项目官方页为准。',
      },
      {
        q: '2026 年上交 CSCA 必考吗？',
        a: '是——2026 年起，国际本科生必须考 CSCA；多数硕士项目也要求。密西根学院 JI 路径按英文要求；查 JI 页当前 CSCA 适用政策。',
      },
      {
        q: '什么是密西根学院（UM-SJTU JI）？',
        a: '上交与美国密西根大学合办的英文工科学院，提供 ECE、机械等工程学位。独立招生流程、独立截止、全英文要求，含安阿伯校区交换路径。',
      },
      {
        q: '上交要求哪些 CSCA 组合？',
        a: '按院系不同。多数工科与 CS 要求理工中文 + 数学 + 物理；医学与生命科学要求数学 + 化学；人文与社科要求人文中文 + 数学。安泰 IMBA 英文为主。始终以项目官方页为准。',
      },
      {
        q: '申请上交要多少钱？',
        a: '申请费每项目 ¥400-800，在线支付，不退。自费申请者需 ¥80,000+ 经济证明。',
      },
      {
        q: '上交面试国际生吗？',
        a: '多数本科项目不面试（JI 例外——全英文面试）。热门硕士几乎面试所有候选。博士一律面试。面试通常在线。',
      },
      {
        q: '上交对国际生录取竞争多大？',
        a: '高度竞争。硕士录取率约 5-10%；电气、CS、安泰 IMBA、临床医学低于 5%。本国前 10-15% 的申请者机会最大。',
      },
      {
        q: '可以同时申请密西根学院 JI 与标准上交申请吗？',
        a: '可以——两者是独立申请、独立截止。工科申请者时间允许时同一轮可都申请。',
      },
      {
        q: '上交接受春季入学申请吗？',
        a: '部分硕士项目提供春季入学（3 月开始）；春季申请通常前一年 10 月 31 日截止。并非所有院系都有春季入学。',
      },
      {
        q: '上交可以叠加哪些奖学金？',
        a: '典型组合：CSC（全额，12-1 月申请）+ 上交奖学金（自动评审）+ 上海市政府奖学金（A 类全额或 B 类学费，4-5 月申请）。JI 学生还应查 JI 专属奖项。',
      },
    ],
    howToSteps: [
      {
        name: '核验项目的 CSCA 组合与语言要求',
        text: '访问上交 ISO 门户（JI 路径看 JI 招生页）；找到目标项目；记录 CSCA 科目组合、语言门槛、项目特有考试。',
      },
      {
        name: '10 月开始准备材料',
        text: '上交 CSC 截止 12-1 月——中国最早之一。公证翻译与推荐信要数周。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学瞄准深秋或冬季 CSCA 场次。工科申请者通常需要理工中文 + 数学 + 物理。',
      },
      {
        name: '网上申请（上交 ISO 门户或 JI 门户）',
        text: '标准项目：项目截止前（12-4 月）提交。JI：按 JI 轮次（通常 11-2 月）。保存确认邮件。',
      },
      {
        name: '并行申请奖学金',
        text: '通过上交 ISO 门户提交 CSC 申请（12-1 月截止）。申请上海市政府奖学金（4-5 月）。上交自有奖学金对强申请者自动。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '热门硕士与博士要面试；JI 全英文面试。工科面试可能含现场技术解题——复习核心数学与物理。',
      },
    ],
    ctaTitle: '正在申请上海交通大学？',
    ctaSubtitle:
      'SICA 顾问核验目标项目的 CSCA 组合与语言要求、帮你选择标准轨与密西根学院路径、优化学习计划、协调 CSC + 上交 + 上海市政府奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/shanghai-jiao-tong-university',
        label: '上海交通大学简介',
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
        description: '上交与多数中国大学的全额资助奖学金路径。',
      },
      {
        href: '/best-universities-in-shanghai',
        label: '上海最好的大学',
        description: '上交与复旦、同济等上海高校如何对比。',
      },
    ],
  },
};
