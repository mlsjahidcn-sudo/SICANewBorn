import type { LocalizedGuide } from './types';

/**
 * Peking University admissions deep-dive — flagship admissions guide #1
 * of 5 (docs/flagship-admissions-5-article-plan.md).
 *
 * Complements the /peking-university profile page with operational depth:
 * application routes, deadlines, document checklist, CSCA combinations
 * by school, language thresholds, scholarship stack, interview prep,
 * and what makes a competitive applicant.
 *
 * Target queries: "peking university admissions", "PKU application
 * international", "apply PKU international students", "PKU requirements",
 * "北大 申请", "北京大学 留学生 入学".
 */
export const pekingUniversityAdmissionsGuide: LocalizedGuide = {
  en: {
    slug: 'peking-university-admissions-guide',
    eyebrow: 'ADMISSIONS DEEP-DIVE',
    title: 'Peking University admissions — step-by-step guide for international students',
    description:
      'How to apply to Peking University as an international student: routes, deadlines, document checklist, CSCA combinations by school, language requirements, scholarship stack, and what makes a competitive applicant.',
    subtitle:
      'Peking University admits international bachelor\'s and master\'s applicants through a study-plan-based admissions process with the CSCA exam mandatory from 2026. This guide walks through the full operational picture: which application channel to use (PKU ISO portal vs CSC channel vs embassy recommendation), when each intake window closes, what documents to send, the exact CSCA combination each PKU school asks for, the language thresholds (HSK / IELTS / TOEFL) by program level, how to stack CSC + Peking University scholarship + Beijing Government scholarship, what to expect in the PKU interview, and the profile components that move a borderline applicant to admit.',
    stats: [
      { value: '~3-5%', label: 'Typical international admit rate (master\'s)' },
      { value: 'Mar–May', label: 'Fall intake main deadline' },
      { value: '2', label: 'Recommended recommendation letters' },
      { value: 'Yes', label: 'CSCA mandatory from 2026 intake' },
    ],
    quickAnswer:
      'Peking University admits international students through three channels — direct application via the PKU International Students Office (ISO) portal, the Chinese Government Scholarship (CSC) channel through the PKU ISO as the host institution, and embassy recommendation channels. For September 2026 intake, the main deadline is March 31 to May 31 depending on program (competitive master\'s close earlier — many in January–March). The CSCA is mandatory from the 2026 intake. Required documents include passport, transcripts, a study plan of 800–1,500 words, two recommendation letters (associate professor or above), language evidence (HSK 5+ for Chinese-taught; IELTS 6.5+ / TOEFL 90+ for English-taught), and the ¥400–¥800 application fee. Apply through the PKU ISO portal at https://www.studyatpku.com — the same portal serves all three channels once you select your funding source.',
    keyTakeaways: [
      'Three application channels: PKU ISO direct, CSC through PKU, embassy recommendation — pick by funding strategy, not by prestige',
      'Fall intake main deadline: March 31 for most programs; competitive master\'s close January–March; spring intake (limited programs) closes October–November',
      'CSCA mandatory from 2026 intake; verify the exact subject combination per school on the program\'s official page before registering for the exam',
      'Document package: passport, transcripts (notarized Chinese or English translation), 800–1,500-word study plan, 2 recommendation letters, language test, application fee',
      'Language thresholds vary by program: Chinese-taught usually HSK 5 or 6; English-taught usually IELTS 6.5 / TOEFL 90 — some programs ask for higher',
      'Scholarship stack: CSC (full funding) + Peking University\'s own scholarships (partial to substantial) + Beijing Government scholarship (separate application); multiple small scholarships often beat one large one',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'Peking University admissions at a glance',
        intro:
          'The PKU admissions picture for international students in 2026.',
        blocks: [
          {
            type: 'p',
            text: 'Peking University processes international applications through its International Students Office (ISO), which runs the central application portal at https://www.studyatpku.com. The ISO handles admissions regardless of whether you apply as a self-funded student, a CSC scholarship recipient, or an embassy-recommended student — your funding source is a separate field in the same application. From 2026 intake onward, all international applicants to bachelor\'s degree programs (and most master\'s programs) must submit CSCA scores as part of the application. PKU\'s admissions standards are among the most selective in China — competitive master\'s programs admit roughly 3–5% of international applicants, with stronger admit rates in less-subscribed fields and weaker in PKU\'s signature programs (Yenching Academy, PHBS, mathematics).',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The PKU ISO responds to written inquiries in English within 3–5 business days. Email iso@pku.edu.cn or use the contact form on https://www.studyatpku.com for the fastest response.',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: 'Application routes — which channel to use',
        intro:
          'Three routes lead to PKU; pick by funding strategy.',
        blocks: [
          {
            type: 'p',
            text: 'All three routes use the same PKU ISO portal — the difference is your funding source and your application deadline. Your route choice does not change PKU\'s academic assessment of your candidacy, but it does change which scholarships you are eligible for and which deadline applies.',
          },
          {
            type: 'table',
            caption: 'PKU application routes — channel comparison',
            columns: ['Route', 'How it works', 'Best for', 'Deadline'],
            rows: [
              ['PKU ISO direct (self-funded)', 'Apply via https://www.studyatpku.com with self-funding declaration', 'Self-funded applicants; those applying only to PKU\'s own scholarships or Beijing Government scholarship', 'March 31 – May 31 (most programs)'],
              ['CSC channel (through PKU)', 'Select CSC scholarship on the PKU ISO portal; PKU nominates you to CSC', 'Applicants for full CSC funding (tuition + dorm + stipend + airfare)', 'January 31 – April 15 (early); check current cycle'],
              ['Embassy recommendation', 'Apply through your home-country Chinese embassy; embassy nominates you to PKU', 'Applicants from countries with active bilateral scholarship programs; varies by country', 'Varies by embassy (often January–March)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**PKU ISO direct** — the standard path for self-funded applicants; you can also apply for PKU\'s own scholarships or the Beijing Government scholarship through this route',
              '**CSC channel** — the path for full-funded scholarship; PKU\'s nomination is required, so you apply through the PKU ISO portal and select CSC as your funding source; PKU\'s ISO submits nominations to CSC in batches',
              '**Embassy recommendation** — for applicants in countries with active Chinese government bilateral scholarship programs (often Belt-and-Road countries); the embassy does the first-round screening',
              '**Joint / dual degree programs** — a fourth option: some PKU joint programs (e.g., with Yenching Academy, with PKU–University of London programs) have their own application portals; check the program\'s page directly',
              '**Practical advice** — most international applicants use the PKU ISO direct route, then apply for CSC as a parallel scholarship after admission; this gives you a fallback if CSC does not fund you',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'You can apply through the PKU ISO direct route AND submit a CSC scholarship application in parallel — they are not mutually exclusive. CSC will not fund you if you are not admitted to PKU, so apply to PKU first, then chase CSC.',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: 'Deadlines — when to apply',
        intro:
          'Fall intake is the main window; spring intake exists for some programs only.',
        blocks: [
          {
            type: 'p',
            text: 'PKU\'s fall intake (September 2026 start) has a primary deadline window from March 31 to May 31, with the most competitive master\'s programs closing as early as January 31. Spring intake (March 2027 start, where available) typically closes October 31 of the prior year. Most programs post their specific deadline on the program\'s official page; the dates below are planning approximations and you must verify on the program page before submitting.',
          },
          {
            type: 'table',
            caption: 'PKU intake windows (planning approximations — verify per program)',
            columns: ['Intake', 'Programs', 'Main deadline', 'Notes'],
            rows: [
              ['Fall 2026 (September start)', 'Bachelor\'s, most master\'s, most PhD', 'March 31 – May 31', 'Competitive programs close earlier'],
              ['Fall 2026 — competitive master\'s', 'PHBS, Yenching Academy, applied math, CS, AI, economics', 'January 31 – March 15', 'Earlier deadlines for top programs'],
              ['Fall 2026 — CSC channel', 'Most programs', 'January 31 – April 15', 'Earlier than direct applications'],
              ['Spring 2027 (March start, limited)', 'Some master\'s (verify per school)', 'October 31, 2026', 'Not all schools offer spring intake'],
              ['Doctoral (PhD)', 'Most schools', 'March 31 – May 31', 'Some schools have rolling review'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Earliest deadlines first** — Yenching Academy typically closes January 15; PHBS master\'s close in early February; some economics and applied math programs close in mid-March',
              '**Most programs** — the May 31 deadline is the rule for non-competitive master\'s and most bachelor\'s; submit by April 15 to leave room for document corrections',
              '**CSC channel** — closes earlier than the direct route; if you are pursuing CSC, target the early CSC deadline (often January or February)',
              '**Spring intake** — only some schools accept spring intake; verify on the program page; spring applications close October 31 of the prior year',
              '**Late submissions** — PKU does not accept late applications under any circumstances; missing the deadline means waiting for the next cycle',
              '**Recommendation letters** — ask your referees 4–6 weeks before the deadline; their late submission can void your application',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'For competitive programs (Yenching, PHBS, applied math, AI), submit by January 31 even though the official deadline is later. Late applications are reviewed with the same rigor but admit rates drop sharply in the last month as the admit pool fills.',
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
            text: 'PKU\'s document requirements are strict — missing or improperly formatted documents are the most common reason for application rejection before academic review even begins. Prepare all documents in digital form before the deadline; physical mail is generally not required for initial application but may be requested for verification.',
          },
          {
            type: 'table',
            caption: 'PKU application document checklist',
            columns: ['Document', 'Specific requirement', 'Format', 'Translation needed?'],
            rows: [
              ['Passport', 'Valid for at least 1 year; clear color scan of bio page', 'PDF, <5 MB', 'No'],
              ['High school diploma / Bachelor\'s degree', 'Original + notarized translation if not in Chinese/English', 'PDF, color scan', 'Yes if not Chinese/English'],
              ['Transcripts', 'All years; original or notarized translation; GPA visible', 'PDF, color scan', 'Yes if not Chinese/English'],
              ['Study plan', '800–1,500 words in Chinese (Chinese-taught) or English (English-taught); program-specific', 'PDF, ≤2 MB', 'In language of instruction'],
              ['Recommendation letters', '2 letters from associate professors or above (PhD); 2 from lecturers or above (master\'s)', 'PDF on letterhead, signed', 'Optional English translation'],
              ['Language test — Chinese-taught', 'HSK 5 or 6 (program-dependent); valid for 2 years', 'PDF scan of score report', 'No'],
              ['Language test — English-taught', 'IELTS 6.5+ / TOEFL 90+; valid for 2 years; native English speakers may waive', 'PDF scan of score report', 'No'],
              ['Application fee', '¥400–¥800 per program; non-refundable', 'Online payment', 'No'],
              ['Passport-style photo', 'Recent; white background; full face', 'JPG, <500 KB', 'No'],
              ['Physical examination form', 'PKU\'s specific form; completed by a licensed physician', 'PDF, signed and stamped', 'English translation acceptable'],
              ['CV / resume', 'Academic CV; education, awards, publications, research', 'PDF, 1–2 pages', 'In language of instruction'],
              ['Publications (PhD applicants)', 'Copies of published papers, theses, or research outputs', 'PDF', 'Optional English translation'],
              ['No-criminal-record certificate', 'Issued by home-country police; less than 6 months old', 'PDF, notarized', 'Yes if not Chinese/English'],
              ['Financial proof', 'Bank statement showing sufficient funds for one year (¥80,000+) OR scholarship award letter', 'PDF', 'English translation acceptable'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Translation requirements** — documents not in Chinese or English must be notarized translations; use a certified translation service, not a self-translation',
              '**Recommendation letters** — referees should be academic; PKU prefers professors who can speak to your research or academic ability, not just employment supervisors',
              '**Study plan** — the most important non-academic document; PKU reads this carefully for fit, motivation, and research direction; 800–1,500 words is the sweet spot (too short looks lazy; too long looks unfocused)',
              '**Physical examination** — PKU provides a specific form; use the form provided, not a generic one; the form must be completed by a licensed physician and signed/stamped',
              '**Financial proof** — bank statements should show ¥80,000+ available; this is approximately one year of all-in costs; if you have a scholarship, the award letter substitutes for the bank statement',
              '**Public documents** — diplomas, transcripts, and the no-criminal-record certificate must be originals or notarized copies; PKU does not accept self-scans of unmarked documents',
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
        h2: 'CSCA strategy — what each PKU school asks for',
        intro:
          'CSCA combinations vary by school within PKU. Verify per program.',
        blocks: [
          {
            type: 'p',
            text: 'PKU does not publish a single master list of CSCA combinations. Each school publishes the required combination on its program page. The combinations below are typical patterns verified from recent application cycles — but the official source is always the program\'s current admissions page.',
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations by PKU school (verify per program)',
            columns: ['PKU school / program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['School of Humanities (literature, history, philosophy, archaeology)', 'Humanities Chinese + Math', 'Study plan often decides'],
              ['School of Social Sciences (IR, sociology, economics — undergraduate)', 'Humanities Chinese + Math', 'Master\'s in English may waive Chinese track'],
              ['School of Mathematical Sciences', 'STEM Chinese + Math + Physics', 'Verify — some programs drop Physics'],
              ['School of Physics', 'STEM Chinese + Math + Physics', 'Both required for physics research'],
              ['School of Life Sciences', 'Math + Chemistry', 'Some programs add Biology'],
              ['School of Information Science & Technology (CS, AI, software)', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['School of Electronics (EE, microelectronics)', 'STEM Chinese + Math + Physics', 'Same as CS'],
              ['School of Chemistry & Molecular Engineering', 'Math + Chemistry', 'Add Physics for materials'],
              ['School of Earth and Space Sciences', 'Math + Physics', 'Add Chemistry for atmospheric'],
              ['School of Medicine (clinical, public health)', 'Math + Chemistry', 'Biology helpful but not always required'],
              ['School of Biomedical Engineering', 'Math + Physics', 'Some programs add Chemistry'],
              ['PHBS — Peking University HSBC Business School', 'Math + English language (often no Chinese track)', 'English-medium program throughout'],
              ['Yenching Academy', 'Humanities Chinese + Math', 'Chinese language training built in'],
              ['School of International Studies (foreign languages, IR)', 'Humanities Chinese + Math', 'Verify per program'],
              ['School of Law', 'Humanities Chinese + Math', 'Some programs add English evidence'],
              ['School of Government (public administration, public policy)', 'Humanities Chinese + Math', 'Master\'s in English at some programs'],
              ['National School of Development (economics)', 'Math + (Humanities or STEM Chinese)', 'Quant-heavy'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Humanities Chinese track** — required by most humanities, social sciences, law, and IR programs; tests academic Chinese beyond HSK',
              '**STEM Chinese track** — required by most sciences and engineering programs; tests technical Chinese for science contexts',
              '**Math** — required by virtually all programs; the only CSCA subject everyone sits; no waiver',
              '**Physics** — required by physics, engineering, and some CS programs',
              '**Chemistry** — required by life sciences, medical, and materials programs',
              '**English-taught programs** — PHBS, Yenching Academy\'s English-language master\'s, and some master\'s in international studies do NOT require the Chinese track; they often accept English language evidence instead',
              '**Combination locking** — once you register for a CSCA session, your subject combination is fixed; changing it requires re-registration and another fee',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Always verify the CSCA combination on the program\'s official admissions page before registering for a CSCA session. The combination listed in the table above is typical but not guaranteed — programs update their requirements each year.',
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
            text: 'PKU\'s language requirements are program-specific. Most programs require either Chinese or English proficiency depending on the language of instruction; some highly competitive programs require both. The thresholds below are planning approximations — verify on the program page.',
          },
          {
            type: 'table',
            caption: 'PKU language thresholds by program type (planning approximations)',
            columns: ['Program type', 'Chinese-taught — minimum', 'English-taught — minimum', 'Notes'],
            rows: [
              ['Bachelor\'s (most programs)', 'HSK 5 (≥180) or HSK 6 (≥200)', 'IELTS 6.5 / TOEFL 90', 'Most bachelor\'s are Chinese-taught'],
              ['Bachelor\'s (Yenching-style English)', 'HSK 4 acceptable as supplement', 'IELTS 7.0 / TOEFL 100', 'Some programs waive Chinese if English is strong'],
              ['Master\'s (Chinese-taught)', 'HSK 5 (≥200) or HSK 6 (≥220)', 'IELTS 6.0 / TOEFL 80 (as supplement)', 'Higher HSK for humanities and Chinese-focused programs'],
              ['Master\'s (English-taught)', 'HSK 4 (optional)', 'IELTS 6.5 / TOEFL 90', 'Most English-taught master\'s do not require HSK'],
              ['Master\'s (PHBS, Yenching)', 'HSK 5 optional', 'IELTS 7.0 / TOEFL 100', 'Strong English required; competitive admission'],
              ['PhD (most programs)', 'HSK 5 (≥200)', 'IELTS 6.5 / TOEFL 90', 'Higher HSK for Chinese-supervised PhDs'],
              ['PhD (English-supervised)', 'HSK 4 (optional)', 'IELTS 6.5 / TOEFL 90', 'Co-supervisor arrangement for Chinese-language support'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**HSK validity** — HSK scores are valid for 2 years from the test date; expired scores cannot be used for admission',
              '**IELTS / TOEFL validity** — also 2 years; same rule',
              '**Native English speakers** — applicants from countries where English is the official language may waive IELTS/TOEFL; check the program\'s specific waiver policy',
              '**Chinese-taught programs** — most require HSK 5 minimum for master\'s and bachelor\'s; humanities and Chinese-focused programs often require HSK 6',
              '**English-taught programs** — most require IELTS 6.5 or TOEFL 90 minimum; competitive programs (PHBS, Yenching) ask for IELTS 7.0 or TOEFL 100',
              '**Dual-language programs** — rare at PKU but exist (e.g., some international relations master\'s); require both HSK and IELTS/TOEFL evidence',
              '**Language waiver for English-medium programs** — some English-taught programs accept a degree from an English-medium university as proof of English proficiency, in lieu of IELTS/TOEFL',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSCA scores do NOT replace HSK scores. They serve different purposes — CSCA tests academic Chinese in context (Humanities or STEM track), HSK tests general Chinese proficiency. For Chinese-taught programs, you typically need BOTH a passing CSCA combination AND HSK 5 or 6.',
          },
        ],
      },
      {
        id: 'scholarship-stack',
        h2: 'Scholarship stack — CSC + Peking University + Beijing Government',
        intro:
          'How to stack multiple scholarships to fully fund your PKU degree.',
        blocks: [
          {
            type: 'p',
            text: 'PKU admits international students regardless of funding source — your application is reviewed on academic merit, then funding is decided separately. You can apply for admission self-funded and win scholarships later, OR apply for admission with a scholarship application bundled in. Most international applicants use a stacked approach: apply through the CSC channel for full funding, apply for the Peking University scholarship as a backup, and apply for the Beijing Government scholarship if eligible for partial additional support.',
          },
          {
            type: 'table',
            caption: 'PKU scholarship stack — what to apply for and when',
            columns: ['Scholarship', 'Coverage', 'Deadline', 'How to apply'],
            rows: [
              ['Chinese Government Scholarship (CSC)', 'Full: tuition + dorm + ¥2,500–3,500/month stipend + airfare', 'January 31 – April 15 (verify per cycle)', 'Select CSC on PKU ISO portal; PKU nominates to CSC'],
              ['Peking University Scholarship (full)', 'Tuition waiver + dorm + monthly stipend (¥2,000–3,000)', 'Same as admission deadline (March–May)', 'Automatic consideration or separate application via PKU ISO'],
              ['Peking University Scholarship (partial)', 'Tuition waiver (partial or full) OR monthly stipend', 'Same as admission deadline', 'Automatic consideration with strong application'],
              ['Beijing Government Scholarship', 'Tuition waiver + ¥3,000/month stipend (1 year, renewable)', 'April 30 (verify per cycle)', 'Apply via Beijing Education Commission; submit through PKU ISO'],
              ['Confucius Institute Scholarship', 'Full funding for Chinese language + culture programs', 'Varies; check Confucius Institute network', 'Through home-country Confucius Institute or PKU ISO'],
              ['Home-country government scholarships', 'Varies by country; sometimes full funding', 'Varies by country', 'Through home-country scholarship agency'],
              ['External / foundation scholarships', 'Varies; partial to full', 'Varies', 'Direct to scholarship provider'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Apply for CSC first** — CSC is the most generous single scholarship; if you get it, you have full funding including airfare and stipend; the trade-off is earlier deadlines and more competitive review',
              '**Peking University scholarship** — automatic for strong applicants; PKU identifies scholarship-worthy applicants from the admission pool and awards them; you do not need a separate application in most cases',
              '**Beijing Government scholarship** — separate application; smaller pool but adds ¥36,000/year on top of tuition waiver; stack with PKU scholarship for combined funding',
              '**External scholarships** — your home-country government (e.g., Malaysia, Indonesia, Pakistan have active programs), private foundations (e.g., Schwarzman-linked for non-Schwarzman master\'s), and PKU-affiliated private scholarships',
              '**The stacking principle** — multiple smaller scholarships often beat one large one because each covers different costs; e.g., CSC full + Beijing Government top-up gives you the same tuition coverage but extra stipend',
              '**Scholarship after admission** — if you are admitted self-funded, you can still apply for the Beijing Government scholarship and external scholarships post-admission; PKU scholarship decisions are usually communicated with the admission decision',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'A typical fully-funded international student at PKU has CSC full + Beijing Government scholarship (top-up) + Peking University scholarship (top-up or research assistantship). Total annual value: ~¥150,000–200,000 covering all-in costs. Apply for all three in parallel.',
          },
        ],
      },
      {
        id: 'interview-prep',
        h2: 'Interview prep — what to expect',
        intro:
          'Most competitive master\'s and PhD programs interview; bachelor\'s rarely.',
        blocks: [
          {
            type: 'p',
            text: 'PKU\'s interview process is program-specific. Most bachelor\'s programs do not interview; competitive master\'s programs (PHBS, Yenching Academy, applied math, AI, top economics) interview nearly all short-listed applicants; PhD programs always interview. The interview is the deciding factor for borderline applicants on academic merit.',
          },
          {
            type: 'table',
            caption: 'PKU interview format by program type',
            columns: ['Program type', 'Interview format', 'Duration', 'Language'],
            rows: [
              ['Bachelor\'s (most)', 'Rare; some programs have a short online interview', '15–30 minutes', 'Chinese (Chinese-taught) or English (English-taught)'],
              ['Master\'s (most)', 'Online interview via Tencent Meeting or Zoom; panel of 2–3 faculty', '20–45 minutes', 'Chinese or English depending on program'],
              ['Master\'s (competitive — PHBS, Yenching)', 'Multi-round: written test or case study + panel interview', '60–90 minutes total', 'English for PHBS and Yenching'],
              ['PhD (most)', 'Online interview; presentation of research proposal + Q&A', '45–90 minutes', 'Chinese or English depending on supervisor'],
              ['PhD (research-track with supervisor)', 'Interview with prospective supervisor + panel', '60–120 minutes', 'Chinese or English'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Format** — most interviews are online via Tencent Meeting or Zoom; in-person interviews at PKU\'s campus are rare for international applicants but do occur for some PhD programs',
              '**Panel** — typically 2–3 faculty members from the program; they have read your application and study plan; do not repeat content from your study plan — instead, deepen it',
              '**Common questions** — why PKU? Why this program? What is your research direction? Where do you see yourself in 5 years? What unique perspective do you bring?',
              '**Academic questions** — be ready to discuss your undergraduate thesis or major projects in depth; for PhD applicants, expect questions on your research proposal',
              '**Chinese-language questions** — for Chinese-taught programs, expect at least some questions in Chinese; basic conversational proficiency is sufficient, but specialized vocabulary may come up',
              '**Logistics** — confirm the interview platform 24 hours in advance; test your camera, microphone, and internet; have a backup device ready',
              '**Follow-up** — send a brief thank-you email to the program coordinator (not the panel) within 24 hours of the interview',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For Yenching Academy and PHBS interviews, expect rigorous case studies or written components in addition to the panel interview. Yenching\'s interview often includes a Chinese-language reading comprehension exercise even for English-medium applicants.',
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
            text: 'PKU\'s admissions review weighs academic record most heavily, but for borderline applicants the soft components decide. The profile components below are listed in rough order of importance for competitive programs; for less competitive programs, the academic record alone may suffice.',
          },
          {
            type: 'table',
            caption: 'PKU competitive profile components',
            columns: ['Component', 'Weight', 'What "strong" looks like'],
            rows: [
              ['Academic record (GPA, ranking)', 'Highest', 'Top 10% of graduating class; GPA 3.5+/4.0 or equivalent'],
              ['CSCA scores', 'High', 'Target 80+ percentile in each subject; 90+ for competitive programs'],
              ['Language proficiency', 'High', 'HSK 6 (≥220) for Chinese-taught; IELTS 7.0+ for English-taught'],
              ['Study plan quality', 'High', 'Program-specific; clear research direction; faculty-fit awareness'],
              ['Recommendation letters', 'High', '2 letters from professors who know you academically; specific examples'],
              ['Research experience', 'Medium-high', 'Undergraduate thesis, research assistantships, publications (PhD)'],
              ['Awards and distinctions', 'Medium', 'National/international academic competitions, university awards'],
              ['Extracurriculars', 'Medium-low', 'Leadership, community service, cross-cultural experience'],
              ['Work experience', 'Medium (MBA, professional master\'s)', '2–5 years in relevant field for professional programs'],
              ['Fit with PKU faculty', 'Medium (research programs)', 'Mention specific faculty whose work aligns with yours'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Top 10% rule** — applicants from the top 10% of their national university system have the strongest admit probability; below top 20% is difficult for competitive programs',
              '**CSCA target scores** — 80+ percentile in each subject is the typical strong range; 90+ for top programs like Yenching, PHBS, applied math, AI',
              '**Study plan as differentiator** — for borderline applicants, the study plan is the most leveraged document; a specific, faculty-fit-aware, program-research-direction-aligned study plan can overcome a slightly weaker academic record',
              '**Letters from known referees** — recommendation letters from professors with research relationships to PKU faculty carry more weight; reach out to PKU faculty before applying to gauge research alignment',
              '**Research output** — for PhD applicants, a published paper (even undergraduate) significantly strengthens the application',
              '**International experience** — exchange semesters, summer schools, conferences abroad; signals adaptability',
              '**What to avoid** — generic study plans, recommendation letters that do not address you specifically, application essays that could apply to any university',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For borderline applicants, the highest-leverage move is a study plan that demonstrates specific knowledge of PKU faculty research and a clear fit with the program. A generic study plan that could apply to any top Chinese university is the single biggest application-killer.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When does Peking University open applications for fall 2026?',
        a: 'The PKU International Students Office portal typically opens for fall intake applications in November of the prior year. Competitive master\'s programs close as early as January 31; most programs close by May 31. Verify the specific deadline on the program\'s official page.',
      },
      {
        q: 'Is the CSCA mandatory for Peking University in 2026?',
        a: 'Yes — from the 2026 intake, the CSCA is mandatory for international bachelor\'s degree applicants and is required for most master\'s programs. Some English-taught master\'s programs accept IELTS/TOEFL in lieu of the Chinese track but still require the Math (and sometimes Science) CSCA subjects.',
      },
      {
        q: 'What CSCA combination does Peking University ask for?',
        a: 'It varies by school. Most humanities and social-science programs require Humanities Chinese + Math; most sciences and engineering programs require STEM Chinese + Math + Physics (or Math + Chemistry for life sciences). PHBS and Yenching Academy use Math + English language. Always check the program\'s official page.',
      },
      {
        q: 'How much does it cost to apply to Peking University?',
        a: 'The application fee is ¥400–¥800 per program, paid online through the PKU ISO portal. The fee is non-refundable and does not guarantee admission. Financial proof of ¥80,000+ is required for self-funded applicants.',
      },
      {
        q: 'Does Peking University interview international applicants?',
        a: 'Most bachelor\'s programs do not interview. Competitive master\'s programs (PHBS, Yenching Academy, applied math, AI, economics) interview nearly all short-listed applicants. PhD programs always interview. Interviews are typically online via Tencent Meeting or Zoom.',
      },
      {
        q: 'Can I apply to Peking University with IELTS/TOEFL only?',
        a: 'Only for English-taught master\'s and PhD programs. Most bachelor\'s programs and Chinese-taught programs require HSK 5 or 6. Even for English-taught programs, the CSCA Math (and often Science) subjects are still required.',
      },
      {
        q: 'How competitive is Peking University for international students?',
        a: 'Among the most competitive in China. Top master\'s programs admit roughly 3–5% of international applicants; bachelor\'s admit rates are higher but still selective. Applicants from the top 10% of their national system with strong CSCA scores and a competitive study plan have the best chance.',
      },
      {
        q: 'Can I apply for CSC and the Peking University scholarship at the same time?',
        a: 'Yes — CSC and Peking University scholarship applications are independent. You can apply through the CSC channel on the PKU ISO portal AND be considered for the Peking University scholarship automatically. Most successful international applicants apply for both in parallel.',
      },
      {
        q: 'Does Peking University accept spring intake applications?',
        a: 'Some master\'s programs offer spring intake (March start); spring applications typically close October 31 of the prior year. Not all schools offer spring intake — verify on the program\'s page. Bachelor\'s and PhD programs generally only offer fall intake.',
      },
      {
        q: 'How do I contact the PKU International Students Office?',
        a: 'Email iso@pku.edu.cn or use the contact form on https://www.studyatpku.com. The ISO responds to written inquiries in English within 3–5 business days. For program-specific questions, contact the program coordinator listed on the program\'s admissions page.',
      },
    ],
    howToSteps: [
      {
        name: 'Verify the program\'s CSCA combination and language requirements',
        text: 'Visit https://www.studyatpku.com; find your target program; note the CSCA subject combination, language thresholds (HSK / IELTS / TOEFL), and any program-specific tests. Plan your CSCA session and language test around this combination.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September 2026 intake, target the earliest viable CSCA session. CSC channel closes January 31 to April 15; competitive master\'s close January–March. A winter or early-spring CSCA session gives you the most flexibility for scholarship and admission timing.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts (notarized Chinese or English translation), 800–1,500-word study plan (program-specific, in the language of instruction), 2 recommendation letters from academic referees, language test (HSK or IELTS/TOEFL), CV, publications (PhD applicants), application fee, physical examination form.',
      },
      {
        name: 'Apply online through the PKU ISO portal',
        text: 'Submit the full package at https://www.studyatpku.com before the program deadline. Most fall-intake programs close March 31 to May 31. Save the confirmation email.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit CSC scholarship application through the PKU ISO portal (CSC channel closes January–April). Apply for the Peking University scholarship (automatic consideration with strong application) and the Beijing Government scholarship (separate application, closes April 30).',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs interview. Prepare for academic questions on your study plan and research direction, Chinese-language questions if relevant, and program-specific questions. Confirm the interview platform 24 hours in advance and test your equipment.',
      },
    ],
    ctaTitle: 'Applying to Peking University?',
    ctaSubtitle:
      'SICA counselors verify your target program\'s CSCA combination and language requirements, refine your study plan to match PKU faculty research, and coordinate CSC + Peking University + Beijing Government scholarship applications. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/peking-university',
        label: 'Peking University profile',
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
        description: 'The full-funding scholarship path for PKU and most Chinese universities.',
      },
      {
        href: '/china-university-admission-requirements',
        label: 'China university admission requirements',
        description: 'Bachelor\'s, master\'s, and PhD admission requirements cheat sheet.',
      },
    ],
  },
  zh: {
    slug: 'peking-university-admissions-guide',
    eyebrow: '申请深度指南',
    title: '北京大学申请——国际生逐步指南',
    description:
      '如何以国际生身份申请北京大学：申请渠道、截止日期、材料清单、各院系 CSCA 组合、语言要求、奖学金组合，以及申请者的竞争画像。',
    subtitle:
      '北京大学通过基于学习计划的招生流程（2026 起 CSCA 必考）招收国际本科生与硕士生。本指南覆盖完整操作细节：选用哪个申请渠道（PKU ISO 门户 vs CSC 渠道 vs 使馆推荐）、各入学窗口的截止日期、需要提交的材料、北大各院系所要求的 CSCA 组合、按项目层级的语言门槛（HSK / 雅思 / 托福）、如何叠加 CSC + 北大奖学金 + 北京市政府奖学金、北大面试内容，以及能让擦边申请者转录的画像要素。',
    stats: [
      { value: '约 3-5%', label: '典型国际硕士录取率' },
      { value: '3-5月', label: '秋季入学主要截止' },
      { value: '2', label: '建议推荐信数量' },
      { value: '是', label: '2026 起 CSCA 必考' },
    ],
    quickAnswer:
      '北京大学通过三条渠道招收国际生——通过 PKU 国际学生办公室（ISO）门户直接申请、CSC 奖学金渠道（通过北大 ISO 作为接收单位）、以及使馆推荐渠道。2026 年 9 月入学的主要截止日期为 3 月 31 日至 5 月 31 日（视项目而定；热门硕士 1-3 月截止）。2026 起 CSCA 必考。所需材料：护照、成绩单、800-1,500 字学习计划、2 封推荐信（副教授及以上）、语言成绩（中文授课要 HSK 5+；英文授课要雅思 6.5+ / 托福 90+）、¥400-800 申请费。申请入口：https://www.studyatpku.com——三条渠道共用同一门户。',
    keyTakeaways: [
      '三条申请渠道：北大 ISO 直申、CSC 通过北大、使馆推荐——按奖学金策略选择，而非按声誉',
      '秋季入学主要截止：多数项目 3 月 31 日；热门硕士 1-3 月截止；春季入学（仅部分项目）10-11 月截止',
      '2026 起 CSCA 必考；报名考试前先在项目官方页核验当年具体科目组合',
      '申请材料：护照、成绩单（公证翻译件）、800-1,500 字学习计划、2 封推荐信、语言成绩、申请费',
      '语言门槛因项目而异：中文授课通常 HSK 5 或 6；英文授课通常雅思 6.5 / 托福 90——部分项目要求更高',
      '奖学金组合：CSC（全额）+ 北大自有奖学金（部分到大额）+ 北京市政府奖学金（单独申请）；多笔小额常胜一笔大额',
    ],
    sections: [
      {
        id: 'overview',
        h2: '北京大学录取概览',
        intro:
          '2026 年北大国际生录取全貌。',
        blocks: [
          {
            type: 'p',
            text: '北京大学通过其国际学生办公室（ISO）处理国际申请，ISO 运营统一门户 https://www.studyatpku.com。ISO 处理录取无论你是自费、CSC 奖学金、还是使馆推荐——你的资金来源在同一申请中是单独字段。2026 年起，所有国际本科生（以及多数硕士项目）申请者必须提交 CSCA 成绩作为申请的一部分。北大录取标准是中国最严格的之一——热门硕士项目录取率约 3-5%，特色项目（燕京学堂、PHBS、数学）录取难度更高，较小众领域则相对容易。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '北大 ISO 在 3-5 个工作日内以英文回复书面问询。邮件 iso@pku.edu.cn，或在 https://www.studyatpku.com 联系表单提交。',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: '申请渠道——如何选',
        intro:
          '三条路通向北大；按资金策略选。',
        blocks: [
          {
            type: 'p',
            text: '三条渠道都用同一 PKU ISO 门户——区别是资金来源与截止日期。渠道选择不改变北大对你的学术评估，但会改变你能申请的奖学金与适用的截止日期。',
          },
          {
            type: 'table',
            caption: '北大申请渠道对比',
            columns: ['渠道', '运作方式', '适合人群', '截止日期'],
            rows: [
              ['PKU ISO 直接申请（自费）', '通过 https://www.studyatpku.com 申报并声明自费', '自费申请者；只申请北大自有奖或北京市政府奖学金者', '多数项目 3 月 31 日 - 5 月 31 日'],
              ['CSC 渠道（通过北大）', '在 PKU ISO 门户勾选 CSC 奖学金；北大提名至 CSC', '申请全额 CSC 资助（学费+住宿+月津贴+机票）者', '1 月 31 日 - 4 月 15 日（按当年通知）'],
              ['使馆推荐', '通过本国中国使馆申请；使馆提名至北大', '本国与中国有双边奖学金项目者（常为一带一路国家）', '按本国使馆规定（常为 1-3 月）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**PKU ISO 直接申请**——自费申请者的标准路径；也可在此渠道申请北大自有奖或北京市政府奖学金',
              '**CSC 渠道**——全额奖学金路径；需北大提名，所以在 PKU ISO 门户申报并勾选 CSC 作为资金来源；北大 ISO 分批向 CSC 提名',
              '**使馆推荐**——所在国与中国有政府间双边奖学金项目者（常为一带一路国家）；使馆做初筛',
              '**联合 / 双学位项目**——第四种选择：部分北大联合项目（如燕京学堂、北大-伦敦大学学院项目）有独立申请门户；直接看项目页',
              '**实务建议**——多数国际申请者用 PKU ISO 直接申请渠道，再平行申请 CSC 作为奖学金；这样即使 CSC 没奖也有保底',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '你可以在 PKU ISO 直接申请渠道申报的同时平行申请 CSC 奖学金——两者不互斥。CSC 只在你被北大录取后才资助，所以先申请北大，再追 CSC。',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: '截止日期——什么时候申请',
        intro:
          '秋季入学是主窗口；春季入学仅部分项目。',
        blocks: [
          {
            type: 'p',
            text: '北大秋季入学（2026 年 9 月）的主要截止窗口为 3 月 31 日至 5 月 31 日，热门硕士项目最早 1 月 31 日截止。春季入学（2027 年 3 月，如适用）通常在前一年 10 月 31 日截止。下面日期为规划近似值，提交前务必在项目页核验。',
          },
          {
            type: 'table',
            caption: '北大入学窗口（规划近似值——以项目页为准）',
            columns: ['入学', '项目', '主要截止', '说明'],
            rows: [
              ['2026 秋（9 月入学）', '本科、多数硕士、多数博士', '3 月 31 日 - 5 月 31 日', '热门项目更早'],
              ['2026 秋——热门硕士', 'PHBS、燕京学堂、应用数学、计算机、AI、经济学', '1 月 31 日 - 3 月 15 日', '顶尖项目截止更早'],
              ['2026 秋——CSC 渠道', '多数项目', '1 月 31 日 - 4 月 15 日', '早于直接申请'],
              ['2027 春（3 月入学，限部分）', '部分硕士（按院系）', '2026 年 10 月 31 日', '并非所有院系都有春季入学'],
              ['博士（PhD）', '多数院系', '3 月 31 日 - 5 月 31 日', '部分院系滚动评审'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**最早截止优先**——燕京学堂通常 1 月 15 日截止；PHBS 硕士 2 月初；部分经济与应用数学项目 3 月中旬截止',
              '**多数项目**——5 月 31 日截止适用于非热门硕士与多数本科；建议 4 月 15 日前提交，留出材料修改时间',
              '**CSC 渠道**——比直接渠道截止更早；如果走 CSC，瞄准早期 CSC 截止（通常 1-2 月）',
              '**春季入学**——仅部分院系提供；查项目页；春季申请前一年 10 月 31 日截止',
              '**逾期不候**——北大不接受任何情况的逾期申请；错过截止意味着等下一轮',
              '**推荐信**——提前 4-6 周联系推荐人；推荐人延迟提交会让你申请作废',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '热门项目（燕京、PHBS、应用数学、AI）即使官方截止较晚，也建议 1 月 31 日前提交。逾期申请同样严格审核，但录取率在最后一个月会因录取池填满而骤降。',
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
            text: '北大对申请材料要求严格——材料缺失或格式不符是申请在学术评审前被拒的最常见原因。在截止日期前把所有材料准备好数字版；初次申请通常不要求邮寄，但核验阶段可能要求。',
          },
          {
            type: 'table',
            caption: '北大申请材料清单',
            columns: ['材料', '具体要求', '格式', '需要翻译？'],
            rows: [
              ['护照', '有效期 1 年以上；个人信息页清晰彩色扫描', 'PDF，<5 MB', '否'],
              ['高中毕业证书 / 本科学位证', '原件 + 公证翻译（非中英文）', 'PDF，彩色扫描', '非中英文要'],
              ['成绩单', '全部学年；原件或公证翻译；GPA 可见', 'PDF，彩色扫描', '非中英文要'],
              ['学习计划', '800-1,500 字中文（中文授课）或英文（英文授课）；按项目', 'PDF，≤2 MB', '用授课语言'],
              ['推荐信', '硕士 2 封讲师及以上；博士 2 封副教授及以上', 'PDF，抬头纸，签字', '可选英文翻译'],
              ['语言——中文授课', 'HSK 5 或 6（按项目）；2 年有效', 'PDF 成绩单扫描', '否'],
              ['语言——英文授课', '雅思 6.5+ / 托福 90+；2 年有效；母语者可能免', 'PDF 成绩单扫描', '否'],
              ['申请费', '¥400-800 / 项目；不退', '在线支付', '否'],
              ['护照照片', '近期；白底；正面', 'JPG，<500 KB', '否'],
              ['体检表', '北大规定表格；执业医师填写', 'PDF，签字盖章', '可接受英文翻译'],
              ['CV / 简历', '学术 CV；教育、奖项、发表、研究', 'PDF，1-2 页', '用授课语言'],
              ['发表（博士申请者）', '已发表论文、毕业论文或研究成果', 'PDF', '可选英文翻译'],
              ['无犯罪记录证明', '本国警察出具；6 个月内', 'PDF，公证', '非中英文要'],
              ['经济证明', '银行流水一年 ¥80,000+ OR 奖学金证明', 'PDF', '可接受英文翻译'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**翻译要求**——非中英文材料须公证翻译；用认证翻译服务，不要自己翻译',
              '**推荐信**——推荐人应为学术；北大偏好能评价你研究或学术能力的教授，而不仅是工作主管',
              '**学习计划**——最重要的非学术材料；北大仔细阅读评估契合度、动机与研究方向；800-1,500 字最佳（太短显敷衍，太长显散焦）',
              '**体检**——使用北大规定表格，不用通用表；须执业医师填写并签字盖章',
              '**经济证明**——银行流水应显示 ¥80,000+ 可用资金；约一年总开销；如有奖学金可用奖学证书替代',
              '**公开材料**——毕业证书、成绩单、无犯罪记录证明须为原件或公证复印件；不接受未盖章材料的自我扫描',
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
        h2: 'CSCA 策略——北大各院系要求',
        intro:
          'CSCA 组合按院系不同。按项目核验。',
        blocks: [
          {
            type: 'p',
            text: '北大不发布 CSCA 组合的统一总表。每个院系在项目页公布所需组合。下表是近期申请周期的典型模式——但官方来源始终是项目当年录取页。',
          },
          {
            type: 'table',
            caption: '北大各院系典型 CSCA 组合（按项目核验）',
            columns: ['院系 / 项目族', '常见 CSCA 组合', '说明'],
            rows: [
              ['人文学院（文学、历史、哲学、考古）', '人文中文 + 数学', '学习计划常决定结果'],
              ['社会科学学院（国关、社会、经济学本科）', '人文中文 + 数学', '英文硕士可能免中文轨'],
              ['数学科学学院', '理工中文 + 数学 + 物理', '核验——部分项目免物理'],
              ['物理学院', '理工中文 + 数学 + 物理', '物理研究两科都需'],
              ['生命科学学院', '数学 + 化学', '部分项目加生物'],
              ['信息科学技术学院（计算机、AI、软件）', '理工中文 + 数学 + 物理', '量化筛选'],
              ['电子学院（电子工程、微电子）', '理工中文 + 数学 + 物理', '同计算机'],
              ['化学与分子工程学院', '数学 + 化学', '材料方向加物理'],
              ['地球与空间科学学院', '数学 + 物理', '大气方向加化学'],
              ['医学部（临床、公共卫生）', '数学 + 化学', '生物有帮助但不总需'],
              ['生物医学工程系', '数学 + 物理', '部分项目加化学'],
              ['PHBS——北大汇丰商学院', '数学 + 英语（通常无中文轨）', '全程英文授课'],
              ['燕京学堂', '人文中文 + 数学', '含中文训练'],
              ['外国语学院（外国语言、国关）', '人文中文 + 数学', '按项目核验'],
              ['法学院', '人文中文 + 数学', '部分项目加英语成绩'],
              ['政府管理学院（公共行政、公共政策）', '人文中文 + 数学', '部分硕士英文授课'],
              ['国家发展研究院（经济学）', '数学 +（人文或理工中文）', '量化重'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**人文中文轨**——多数人文、社科、法学、国关项目要求；测试学术中文超越 HSK',
              '**理工中文轨**——多数理工科项目要求；测试科学语境下的技术中文',
              '**数学**——几乎所有项目要求；唯一人人必考的 CSCA 科目；无豁免',
              '**物理**——物理、工科、部分计算机项目要求',
              '**化学**——生命科学、医学、材料项目要求',
              '**英文授课项目**——PHBS、燕京学堂英文硕士、部分国际研究硕士不要求中文轨；通常接受英语成绩替代',
              '**组合锁定**——CSCA 一旦报名，科目组合固定；更改需重新报名并再付费',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '报名 CSCA 场次前务必在项目官方录取页核验当年科目组合。上表为典型但不保证——项目每年更新要求。',
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
            text: '北大语言要求因项目而异。多数项目按授课语言要求相应成绩；部分竞争激烈项目同时要求两种语言。以下门槛为规划近似值——以项目页为准。',
          },
          {
            type: 'table',
            caption: '北大语言门槛（按项目类型，规划近似值）',
            columns: ['项目类型', '中文授课最低', '英文授课最低', '说明'],
            rows: [
              ['本科（多数）', 'HSK 5（≥180）或 HSK 6（≥200）', '雅思 6.5 / 托福 90', '多数本科中文授课'],
              ['本科（燕京式英文）', 'HSK 4 可作补充', '雅思 7.0 / 托福 100', '英文强可免中文'],
              ['硕士（中文授课）', 'HSK 5（≥200）或 HSK 6（≥220）', '雅思 6.0 / 托福 80（补充）', '人文与中文项目 HSK 更高'],
              ['硕士（英文授课）', 'HSK 4（可选）', '雅思 6.5 / 托福 90', '多数英文硕士不需 HSK'],
              ['硕士（PHBS、燕京）', 'HSK 5 可选', '雅思 7.0 / 托福 100', '英文强要求；竞争激烈'],
              ['博士（多数）', 'HSK 5（≥200）', '雅思 6.5 / 托福 90', '中文导师项目 HSK 更高'],
              ['博士（英文导师）', 'HSK 4（可选）', '雅思 6.5 / 托福 90', '可配中文共同导师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**HSK 有效期**——HSK 成绩自考试日起 2 年有效；过期不能用于申请',
              '**雅思/托福有效期**——同为 2 年；规则相同',
              '**母语英语者**——来自官方语言为英语的国家者可免雅思/托福；查项目具体豁免政策',
              '**中文授课项目**——多数要求本科与硕士 HSK 5 最低；人文与中文项目常要求 HSK 6',
              '**英文授课项目**——多数要求雅思 6.5 或托福 90 最低；热门项目（PHBS、燕京）要求雅思 7.0 或托福 100',
              '**双语项目**——北大少见但存在（如部分国际关系硕士）；同时要求 HSK 与雅思/托福',
              '**英文授课项目的语言豁免**——部分英文项目接受英文大学毕业证作为英语证明，免雅思/托福',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'CSCA 成绩不能替代 HSK 成绩。两者用途不同——CSCA 测试学术中文（人文或理工轨），HSK 测试通用中文水平。中文授课项目通常需要 CSCA 组合与 HSK 5 或 6 同时合格。',
          },
        ],
      },
      {
        id: 'scholarship-stack',
        h2: '奖学金组合——CSC + 北大 + 北京市政府',
        intro:
          '如何叠加多项奖学金为北大学位全额筹资。',
        blocks: [
          {
            type: 'p',
            text: '北大录取国际生不分资金来源——申请按学术评估，资金单独决定。可以自费录取后再申请奖学金，也可以在申请时捆绑奖学金申请。多数国际申请者用叠加策略：通过 CSC 渠道申请全额资助，平行申请北大奖学金作为保底，符合条件再申请北京市政府奖学金。',
          },
          {
            type: 'table',
            caption: '北大奖学金组合——申请什么、何时申请',
            columns: ['奖学金', '覆盖', '截止', '申请方式'],
            rows: [
              ['中国政府奖学金（CSC）', '全额：学费 + 住宿 + ¥2,500-3,500/月 + 机票', '1 月 31 日 - 4 月 15 日（按当年通知）', '在 PKU ISO 门户勾选 CSC；北大提名至 CSC'],
              ['北大奖学金（全额）', '学费减免 + 住宿 + 月津贴（¥2,000-3,000）', '与录取截止相同（3-5 月）', '自动评审或通过 PKU ISO 单独申请'],
              ['北大奖学金（部分）', '学费减免（部分或全额）OR 月津贴', '与录取截止相同', '强申请自动评审'],
              ['北京市政府奖学金', '学费减免 + ¥3,000/月（1 年，可续）', '4 月 30 日（按当年通知）', '通过北京市教委；通过 PKU ISO 提交'],
              ['孔子学院奖学金', '中文语言与文化项目全额资助', '按孔子学院网络', '通过本国孔子学院或 PKU ISO'],
              ['本国政府奖学金', '按国家不同；有时全额', '按国家不同', '通过本国奖学金机构'],
              ['外部 / 基金会奖学金', '部分至全额不等', '不定', '直接申请提供方'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**优先申请 CSC**——CSC 是最慷慨的单项奖学金；如果拿到，等于全额资助加机票月津贴；代价是更早截止与更激烈竞争',
              '**北大奖学金**——对强申请者自动；北大从录取池中识别值得奖学金的申请者并颁奖；多数情况无需单独申请',
              '**北京市政府奖学金**——单独申请；名额少但加 ¥36,000/年与学费减免；与北大奖学金叠加',
              '**外部奖学金**——本国政府（马来西亚、印尼、巴基斯坦有活跃项目）、私人基金会（如苏世民关联的非苏世民硕士）、北大相关私立奖学金',
              '**叠加原则**——多笔小额常胜一笔大额，因为各项覆盖不同开销；例如 CSC 全额 + 北京市政府奖加给 = 同等学费覆盖但更多津贴',
              '**录取后申请**——如果自费录取，仍可在录取后申请北京市政府奖与外部奖学金；北大奖学金决定通常与录取决定一同告知',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '典型的北大全额资助国际生：CSC 全额 + 北京市政府奖学金（加给）+ 北大奖学金（加给或研究助理）。年总价值约 ¥150,000-200,000 覆盖全部开销。三项并行申请。',
          },
        ],
      },
      {
        id: 'interview-prep',
        h2: '面试准备——会问什么',
        intro:
          '多数热门硕士与博士项目面试；本科通常不。',
        blocks: [
          {
            type: 'p',
            text: '北大面试因项目而异。多数本科项目不面试；热门硕士项目（PHBS、燕京学堂、应用数学、AI、顶尖经济学）几乎面试所有进入候选名单的申请者；博士项目一律面试。面试是擦边申请者学术评估之外的决定性因素。',
          },
          {
            type: 'table',
            caption: '北大面试形式（按项目类型）',
            columns: ['项目类型', '面试形式', '时长', '语言'],
            rows: [
              ['本科（多数）', '罕见；部分项目有简短在线面试', '15-30 分钟', '中文（中文授课）或英文（英文授课）'],
              ['硕士（多数）', '在线面试通过腾讯会议或 Zoom；2-3 位教师组', '20-45 分钟', '中文或英文按项目'],
              ['硕士（热门——PHBS、燕京）', '多轮：笔试或案例分析 + 教师组面试', '合计 60-90 分钟', 'PHBS 与燕京用英文'],
              ['博士（多数）', '在线面试；研究计划陈述 + Q&A', '45-90 分钟', '中文或英文按导师'],
              ['博士（科研导向有导师）', '准导师 + 教师组面试', '60-120 分钟', '中文或英文'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**形式**——多数面试在线通过腾讯会议或 Zoom；北大校园内的线下面试对国际生少见但部分博士项目存在',
              '**面试组**——通常 2-3 位项目教师；他们已读过你的申请与学习计划；不要重复学习计划内容——而要深化它',
              '**常见问题**——为什么选北大？为什么选这个项目？你的研究方向？五年后规划？你带来什么独特视角？',
              '**学术问题**——准备好深入讨论本科毕业论文或主要项目；博士申请者预期被问研究计划',
              '**中文问题**——中文授课项目预期至少部分中文问题；基础会话水平足够，但可能涉及专业词汇',
              '**后勤**——提前 24 小时确认面试平台；测试摄像头、麦克风、网络；备好备用设备',
              '**后续**——面试后 24 小时内向项目协调员（非面试组）发简短感谢邮件',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '燕京学堂与 PHBS 面试除教师组面试外还有严格的案例分析或笔试环节。燕京面试常含中文阅读理解练习，即使英文授课申请者。',
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
            text: '北大录取评审最看重学业成绩，但擦边申请者由软要素决定。以下画像要素按热门项目的大致重要性排序；非热门项目单凭学业成绩即可。',
          },
          {
            type: 'table',
            caption: '北大竞争画像要素',
            columns: ['要素', '权重', '"强"长什么样'],
            rows: [
              ['学业成绩（GPA、排名）', '最高', '毕业班前 10%；GPA 3.5+/4.0 或相当'],
              ['CSCA 成绩', '高', '各科目标 80+ 百分位；顶尖项目 90+'],
              ['语言水平', '高', '中文授课 HSK 6（≥220）；英文授课雅思 7.0+'],
              ['学习计划质量', '高', '按项目；清晰研究方向；体现对师资的了解'],
              ['推荐信', '高', '2 封了解你学术的教授；具体例子'],
              ['研究经历', '中-高', '本科论文、研究助理、发表（博士）'],
              ['奖项荣誉', '中', '国家级 / 国际学术竞赛、大学奖项'],
              ['课外活动', '中-低', '领导力、社区服务、跨文化经历'],
              ['工作经验', '中（MBA、专业硕士）', '专业项目相关领域 2-5 年'],
              ['与北大师资契合度', '中（研究项目）', '提到与你研究一致的具体教师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**前 10% 规则**——本国大学体系前 10% 的申请者录取概率最强；热门项目低于前 20% 较难',
              '**CSCA 目标分**——各科 80+ 百分位为典型强线；燕京、PHBS、应用数学、AI 等 90+',
              '**学习计划作为差异化因素**——擦边申请者最高杠杆的材料是学习计划；具体、了解师资、与项目研究方向一致的学习计划可弥补稍弱的学业成绩',
              '**来自知名推荐人的信**——与北大教师有研究关系的教授推荐信权重更大；申请前联系北大教师了解研究方向',
              '**研究产出**——博士申请者发表过论文（哪怕本科阶段）显著加分',
              '**国际经历**——交换生、暑校、海外会议；体现适应力',
              '**避免**——通用的学习计划、不针对你个人的推荐信、可套到任何大学的申请文书',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '擦边申请者最高杠杆的动作：写一份展示对北大教师研究的具体了解、与项目研究明确契合的学习计划。一份通用、套到任何顶尖中国大学的学习计划是最致命的申请杀手。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '北大什么时候开放 2026 年秋季入学申请？',
        a: 'PKU 国际学生办公室门户通常在前一年 11 月开放秋季入学申请。热门硕士最早 1 月 31 日截止；多数项目 5 月 31 日截止。以项目官方页具体日期为准。',
      },
      {
        q: '2026 年北大 CSCA 必考吗？',
        a: '是——2026 年起，国际本科生必须考 CSCA；多数硕士项目也要求。部分英文授课硕士接受雅思/托福替代中文轨，但仍需 CSCA 数学（通常还有科学）。',
      },
      {
        q: '北大要求哪些 CSCA 组合？',
        a: '按院系不同。多数人文社科要求人文中文 + 数学；多数理工科要求理工中文 + 数学 + 物理（或数学 + 化学面向生命科学）。PHBS 与燕京学堂用数学 + 英语。始终以项目官方页为准。',
      },
      {
        q: '申请北大要多少钱？',
        a: '申请费每项目 ¥400-800，通过 PKU ISO 门户在线支付。费用不退且不保证录取。自费申请者需提供 ¥80,000+ 经济证明。',
      },
      {
        q: '北大面试国际生吗？',
        a: '多数本科项目不面试。热门硕士项目（PHBS、燕京学堂、应用数学、AI、经济学）几乎面试所有候选。博士项目一律面试。面试通常在线通过腾讯会议或 Zoom。',
      },
      {
        q: '北大只接受雅思/托福申请吗？',
        a: '仅英文授课硕士与博士项目。多数本科与中文授课项目要求 HSK 5 或 6。即使英文授课项目，CSCA 数学（通常还有科学）仍需考。',
      },
      {
        q: '北大对国际生录取竞争多大？',
        a: '中国最激烈之一。顶尖硕士录取率约 3-5%；本科录取率较高但仍筛选。本国大学前 10%、CSCA 强分、竞争性学习计划的申请者机会最大。',
      },
      {
        q: '可以同时申请 CSC 与北大奖学金吗？',
        a: '可以——CSC 与北大奖学金申请相互独立。可在 PKU ISO 门户通过 CSC 渠道申请，同时自动被考虑北大奖学金。多数成功国际申请者两者并行。',
      },
      {
        q: '北大接受春季入学申请吗？',
        a: '部分硕士项目提供春季入学（3 月开始）；春季申请通常前一年 10 月 31 日截止。并非所有院系都有春季入学——查项目页。本科与博士一般仅秋季入学。',
      },
      {
        q: '怎么联系北大国际学生办公室？',
        a: '邮件 iso@pku.edu.cn 或 https://www.studyatpku.com 联系表单。ISO 在 3-5 个工作日内以英文回复书面问询。程序性问题联系项目页列出的项目协调员。',
      },
    ],
    howToSteps: [
      {
        name: '核验项目的 CSCA 组合与语言要求',
        text: '访问 https://www.studyatpku.com；找到目标项目；记录 CSCA 科目组合、语言门槛（HSK / 雅思 / 托福）、项目特有考试。围绕这个组合规划 CSCA 场次与语言考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学瞄准最早可行 CSCA 场次。CSC 渠道 1 月 31 日 - 4 月 15 日截止；热门硕士 1-3 月截止。冬季或早春场次给你最大灵活。',
      },
      {
        name: '准备申请材料',
        text: '护照、成绩单（公证翻译件）、800-1,500 字学习计划（按项目、用授课语言）、2 封学术推荐信、语言考试（HSK 或雅思/托福）、CV、发表（博士）、申请费、体检表。',
      },
      {
        name: '通过 PKU ISO 门户网上申请',
        text: '项目截止前在 https://www.studyatpku.com 提交完整材料。多数秋季入学项目 3 月 31 日 - 5 月 31 日截止。保存确认邮件。',
      },
      {
        name: '并行申请奖学金',
        text: '通过 PKU ISO 门户提交 CSC 申请（CSC 渠道 1-4 月截止）。申请北大奖学金（强申请自动）与北京市政府奖学金（单独申请，4 月 30 日截止）。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '热门硕士与博士项目要面试。准备学术问题（你的学习计划与研究方向）、中文问题（如适用）、与项目相关的问题。提前 24 小时确认面试平台并测试设备。',
      },
    ],
    ctaTitle: '正在申请北京大学？',
    ctaSubtitle:
      'SICA 顾问核验目标项目的 CSCA 组合与语言要求、优化学习计划以匹配北大教师研究、协调 CSC + 北大 + 北京市政府奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/peking-university',
        label: '北京大学简介',
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
        description: '北大与多数中国大学的全额资助奖学金路径。',
      },
      {
        href: '/china-university-admission-requirements',
        label: '中国大学录取要求',
        description: '本科、硕士、博士录取要求速查。',
      },
    ],
  },
};
