import type { LocalizedGuide } from './types';

/**
 * Fudan University admissions deep-dive — flagship admissions guide #3
 * of 5 (docs/flagship-admissions-5-article-plan.md).
 *
 * Complements /fudan-university profile with operational depth.
 *
 * Target queries: "fudan admissions", "Fudan application international",
 * "apply Fudan international students", "Fudan requirements",
 * "复旦 申请", "复旦大学 留学生 入学".
 */
export const fudanUniversityAdmissionsGuide: LocalizedGuide = {
  en: {
    slug: 'fudan-university-admissions-guide',
    eyebrow: 'ADMISSIONS DEEP-DIVE',
    title: 'Fudan University admissions — step-by-step guide for international students',
    description:
      'How to apply to Fudan University as an international student: routes, deadlines, document checklist, CSCA combinations by school, language requirements, scholarship stack, and what makes a competitive applicant.',
    subtitle:
      'Fudan University admits international bachelor\'s and master\'s applicants through a study-plan-based admissions process with the CSCA exam mandatory from 2026. This guide walks the full operational picture: which application channel to use (Fudan ISO portal vs CSC channel vs embassy recommendation), when each intake window closes, what documents to send, the exact CSCA combination each Fudan school asks for, the language thresholds (HSK / IELTS / TOEFL) by program level, how to stack CSC + Fudan\'s own scholarships + Shanghai Government Scholarship, what to expect in the Fudan interview, and the profile components that move a borderline applicant to admit.',
    stats: [
      { value: '~5-10%', label: 'Typical international admit rate (master\'s)' },
      { value: 'Dec–Mar', label: 'Fall intake main deadline window' },
      { value: '2', label: 'Recommended recommendation letters' },
      { value: 'Yes', label: 'CSCA mandatory from 2026 intake' },
    ],
    quickAnswer:
      'Fudan University admits international students through three channels — direct application via the Fudan International Students Office portal, the Chinese Government Scholarship (CSC) channel with Fudan as host institution, and embassy recommendation. For September 2026 fall intake, the main deadline window is December to March (Fudan opens and closes earlier than Beijing universities — many programs close by mid-March). The CSCA is mandatory from the 2026 intake. Required documents include passport, transcripts, a personal statement / study plan (800–1,500 words), 2 recommendation letters, language evidence (HSK 5+ for Chinese-taught; IELTS 6.5+ / TOEFL 90+ for English-taught), and a ¥400–¥800 application fee. Fudan is Shanghai\'s most comprehensive flagship — strongest in humanities, journalism, economics, international relations, mathematics, physics, and medicine.',
    keyTakeaways: [
      'Three application channels: Fudan ISO direct, CSC through Fudan, embassy recommendation — pick by funding strategy',
      'Fall intake main deadline: December–March window; Fudan opens early and many programs close by mid-March — earlier than PKU/Tsinghua',
      'CSCA mandatory from 2026 intake; humanities and social sciences typically require Humanities Chinese + Math; sciences and medicine require Math + Physics or Chemistry',
      'Document package: passport, transcripts (notarized Chinese or English translation), 800–1,500-word personal statement, 2 recommendation letters, language test, application fee',
      'Language thresholds vary by program: Chinese-taught usually HSK 5 or 6; English-taught usually IELTS 6.5 / TOEFL 90',
      'Scholarship stack: CSC (full funding) + Fudan\'s own scholarships + Shanghai Government Scholarship; Shanghai\'s municipal scholarship is among the most generous city-level awards in China',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'Fudan admissions at a glance',
        intro:
          'The Fudan admissions picture for international students in 2026.',
        blocks: [
          {
            type: 'p',
            text: 'Fudan University processes international applications through its International Students Office, which runs a central online application portal. From 2026 intake onward, the CSCA is mandatory for international bachelor\'s degree applicants and most master\'s programs. Fudan\'s admit rate for international master\'s applicants is roughly 5–10%, with the most competitive programs (journalism, economics, international relations, clinical medicine, mathematics) admitting fewer. Fudan\'s calendar runs earlier than PKU and Tsinghua — the application portal typically opens in November–December and many programs close by mid-March, so applicants targeting both Beijing and Shanghai universities need to sequence their applications carefully.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Fudan\'s International Students Office responds to written inquiries in English within 3–5 business days. Use the contact form on the Fudan ISO portal for the fastest response.',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: 'Application routes — which channel to use',
        intro:
          'Three routes lead to Fudan; pick by funding strategy.',
        blocks: [
          {
            type: 'p',
            text: 'All three routes use the same Fudan ISO portal — the difference is your funding source and your application deadline. Your route choice does not change Fudan\'s academic assessment of your candidacy, but it does change which scholarships you are eligible for and which deadline applies.',
          },
          {
            type: 'table',
            caption: 'Fudan application routes — channel comparison',
            columns: ['Route', 'How it works', 'Best for', 'Deadline'],
            rows: [
              ['Fudan ISO direct (self-funded)', 'Apply via the Fudan ISO portal with self-funding declaration', 'Self-funded applicants; those applying only to Fudan\'s own or Shanghai Government scholarships', 'December – March (most programs)'],
              ['CSC channel (through Fudan)', 'Select CSC scholarship on the Fudan ISO portal; Fudan nominates you to CSC', 'Applicants for full CSC funding (tuition + dorm + stipend + airfare)', 'December – mid-March (early); check current cycle'],
              ['Embassy recommendation', 'Apply through your home-country Chinese embassy; embassy nominates you to Fudan', 'Applicants from countries with active bilateral scholarship programs', 'Varies by embassy (often January–March)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Fudan ISO direct** — the standard path for self-funded applicants; you can also apply for Fudan\'s own scholarships or the Shanghai Government Scholarship through this route',
              '**CSC channel** — the path for full-funded scholarship; select CSC on the Fudan ISO portal; Fudan\'s ISO submits nominations to CSC in batches',
              '**Embassy recommendation** — for applicants in countries with active Chinese government bilateral scholarship programs; the embassy does the first-round screening',
              '**English-taught master\'s programs** — Fudan runs a growing set of English-medium master\'s programs (IMBA, international relations, economics, data science); these use the same portal but with English-language document requirements',
              '**Practical advice** — most international applicants use the Fudan ISO direct route, then apply for CSC as a parallel scholarship after admission; Fudan\'s early deadline means you should start document preparation by October',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'You can apply through the Fudan ISO direct route AND submit a CSC scholarship application in parallel — they are not mutually exclusive. CSC will not fund you if you are not admitted to Fudan, so apply to Fudan first, then chase CSC.',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: 'Deadlines — when to apply',
        intro:
          'Fudan runs early: many programs close by mid-March.',
        blocks: [
          {
            type: 'p',
            text: 'Fudan\'s fall intake (September 2026 start) has a primary deadline window from December to March — earlier than PKU or Tsinghua. The CSC channel typically closes in December–January, among the earliest of any top Chinese university. Spring intake (March 2027 start, where available) typically closes October 31 of the prior year. The dates below are planning approximations — verify on the program page before submitting.',
          },
          {
            type: 'table',
            caption: 'Fudan intake windows (planning approximations — verify per program)',
            columns: ['Intake', 'Programs', 'Main deadline', 'Notes'],
            rows: [
              ['Fall 2026 (September start)', 'Bachelor\'s, most master\'s, most PhD', 'December – March', 'Portal opens November–December'],
              ['Fall 2026 — CSC channel', 'Most programs', 'December – mid-January', 'Among the earliest CSC deadlines'],
              ['Fall 2026 — competitive master\'s', 'Journalism, economics, IR, clinical medicine, mathematics', 'Mid-February – mid-March', 'Earlier than the general deadline'],
              ['Spring 2027 (March start, limited)', 'Some master\'s (verify per school)', 'October 31, 2026', 'Not all schools offer spring intake'],
              ['Doctoral (PhD)', 'Most schools', 'December – March', 'Some schools have rolling review'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Earliest deadlines first** — CSC channel closes December–January; competitive master\'s close mid-February to mid-March',
              '**Most programs** — the general deadline is mid-March; submit by early March to leave room for document corrections',
              '**Sequencing with other universities** — Fudan closes before PKU and Tsinghua; if applying to both, prepare Fudan documents first, then reuse them for the Beijing applications',
              '**Spring intake** — only some schools accept spring intake; spring applications close October 31 of the prior year',
              '**Late submissions** — Fudan does not accept late applications under any circumstances',
              '**Recommendation letters** — ask your referees 4–6 weeks before the deadline; their late submission can void your application',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Fudan\'s CSC deadline is among the earliest of any top Chinese university — often December to mid-January. If you are pursuing CSC funding at Fudan, your application must be complete by December. Start document preparation by October.',
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
            text: 'Fudan\'s document requirements follow the standard Chinese university pattern with strict enforcement. Missing or improperly formatted documents are the most common reason for application rejection before academic review. Prepare all documents in digital form before the deadline; physical mail is generally not required for initial application.',
          },
          {
            type: 'table',
            caption: 'Fudan application document checklist',
            columns: ['Document', 'Specific requirement', 'Format', 'Translation needed?'],
            rows: [
              ['Passport', 'Valid for at least 1 year; clear color scan of bio page', 'PDF, <5 MB', 'No'],
              ['High school diploma / Bachelor\'s degree', 'Original + notarized translation if not in Chinese/English', 'PDF, color scan', 'Yes if not Chinese/English'],
              ['Transcripts', 'All years; original or notarized translation; GPA visible', 'PDF, color scan', 'Yes if not Chinese/English'],
              ['Personal statement / study plan', '800–1,500 words in Chinese (Chinese-taught) or English (English-taught); program-specific', 'PDF, ≤2 MB', 'In language of instruction'],
              ['Recommendation letters', '2 letters from lecturers or above (master\'s); associate professors or above preferred (PhD)', 'PDF on letterhead, signed', 'Optional English translation'],
              ['Language test — Chinese-taught', 'HSK 5 or 6 (program-dependent); valid for 2 years', 'PDF scan of score report', 'No'],
              ['Language test — English-taught', 'IELTS 6.5+ / TOEFL 90+; valid for 2 years; native English speakers may waive', 'PDF scan of score report', 'No'],
              ['Application fee', '¥400–¥800 per program; non-refundable', 'Online payment', 'No'],
              ['Passport-style photo', 'Recent; white background; full face', 'JPG, <500 KB', 'No'],
              ['Physical examination form', 'Fudan\'s specific form; completed by a licensed physician', 'PDF, signed and stamped', 'English translation acceptable'],
              ['CV / resume', 'Academic CV; education, awards, publications, research', 'PDF, 1–2 pages', 'In language of instruction'],
              ['Publications (PhD applicants)', 'Copies of published papers, theses, or research outputs', 'PDF', 'Optional English translation'],
              ['No-criminal-record certificate', 'Issued by home-country police; less than 6 months old', 'PDF, notarized', 'Yes if not Chinese/English'],
              ['Financial proof', 'Bank statement showing sufficient funds for one year (¥80,000+) OR scholarship award letter', 'PDF', 'English translation acceptable'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Translation requirements** — documents not in Chinese or English must be notarized translations; use a certified translation service',
              '**Personal statement** — Fudan weights the personal statement heavily for humanities, journalism, and IR programs; demonstrate specific knowledge of the school and its faculty',
              '**Recommendation letters** — referees should be academic; Fudan prefers professors who can speak to your research or academic ability',
              '**Physical examination** — use the Fudan-provided form; the form must be completed by a licensed physician and signed/stamped',
              '**Financial proof** — bank statements should show ¥80,000+ available; approximately one year of all-in costs in Shanghai; a scholarship award letter substitutes',
              '**Early preparation** — Fudan\'s December–March deadline window means October is the practical start for document gathering, especially notarized translations',
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
        h2: 'CSCA strategy — what each Fudan school asks for',
        intro:
          'CSCA combinations vary by school within Fudan. Verify per program.',
        blocks: [
          {
            type: 'p',
            text: 'Fudan does not publish a single master list of CSCA combinations. Each school publishes the required combination on its program page. The combinations below are typical patterns — but the official source is always the program\'s current admissions page.',
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations by Fudan school (verify per program)',
            columns: ['Fudan school / program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['School of Journalism (China\'s top journalism program)', 'Humanities Chinese + Math', 'Study plan and writing quality often decide'],
              ['School of Economics', 'Math + Humanities Chinese', 'Quant-heavy; some programs in English'],
              ['School of International Relations & Public Affairs', 'Humanities Chinese + Math', 'IR is one of Fudan\'s most competitive'],
              ['School of Philosophy', 'Humanities Chinese + Math', 'Study plan often decides'],
              ['Department of Chinese Language & Literature', 'Humanities Chinese + Math', 'Highest Chinese-language expectations'],
              ['School of Mathematical Sciences', 'STEM Chinese + Math + Physics', 'Some programs drop Physics'],
              ['Department of Physics', 'STEM Chinese + Math + Physics', 'Physics research essential'],
              ['Department of Chemistry', 'Math + Chemistry', 'Some programs add Physics'],
              ['School of Life Sciences', 'Math + Chemistry', 'Some programs add Biology'],
              ['School of Computer Science', 'STEM Chinese + Math + Physics', 'Quant-heavy screening'],
              ['School of Data Science', 'STEM Chinese + Math + Physics', 'AI / statistics emphasis'],
              ['School of Information Science & Technology', 'STEM Chinese + Math + Physics', 'EE + information emphasis'],
              ['Fudan Shanghai Medical College (clinical medicine)', 'Math + Chemistry', 'Biology helpful; MBBS route uses English track'],
              ['School of Public Health', 'Math + Chemistry', 'Some programs accept Physics'],
              ['School of Pharmacy', 'Math + Chemistry', 'Pharmaceutical emphasis'],
              ['School of Management (business, finance, IMBA)', 'Math + (Humanities or STEM Chinese)', 'IMBA in English; often no Chinese track'],
              ['School of Law', 'Humanities Chinese + Math', 'Some programs add English evidence'],
              ['School of Sociology', 'Humanities Chinese + Math', 'Research-methods emphasis'],
              ['History Department', 'Humanities Chinese + Math', 'Study plan often decides'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Humanities Chinese track** — required by most humanities, social sciences, law, journalism, and IR programs',
              '**STEM Chinese track** — required by most sciences, engineering, and data programs',
              '**Math** — required by virtually all programs; the only CSCA subject everyone sits',
              '**Physics** — required by physics, engineering, CS, and data science programs',
              '**Chemistry** — required by life sciences, medicine, pharmacy, and chemistry programs',
              '**English-taught programs** — IMBA, some economics and data science master\'s accept English language evidence in lieu of the Chinese track',
              '**MBBS applicants** — the English-taught MBBS route uses the Math + Chemistry combination with English language evidence',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Always verify the CSCA combination on the program\'s official admissions page before registering for a CSCA session. Journalism, IR, and clinical medicine are the most competitive at Fudan — target 85+ percentile in your CSCA subjects.',
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
            text: 'Fudan\'s language requirements are program-specific. The thresholds below are planning approximations — verify on the program page.',
          },
          {
            type: 'table',
            caption: 'Fudan language thresholds by program type (planning approximations)',
            columns: ['Program type', 'Chinese-taught — minimum', 'English-taught — minimum', 'Notes'],
            rows: [
              ['Bachelor\'s (most programs)', 'HSK 5 (≥180) or HSK 6 (≥200)', 'IELTS 6.5 / TOEFL 90', 'Most bachelor\'s are Chinese-taught'],
              ['Bachelor\'s (MBBS English track)', 'HSK 3–4 (for clinical years)', 'IELTS 6.0 / TOEFL 80', 'English-taught MBBS; basic HSK for hospital placements'],
              ['Master\'s (Chinese-taught)', 'HSK 5 (≥200) or HSK 6 (≥220)', 'IELTS 6.0 / TOEFL 80 (as supplement)', 'Humanities and journalism often require HSK 6'],
              ['Master\'s (English-taught)', 'HSK 4 (optional)', 'IELTS 6.5 / TOEFL 90', 'IMBA, some economics and data science'],
              ['Master\'s (IMBA)', 'HSK optional', 'IELTS 6.5 / TOEFL 90 / GMAT 600+', 'Competitive admission; work experience valued'],
              ['PhD (most programs)', 'HSK 5 (≥200)', 'IELTS 6.5 / TOEFL 90', 'Higher HSK for Chinese-supervised PhDs'],
              ['PhD (English-supervised)', 'HSK 4 (optional)', 'IELTS 6.5 / TOEFL 90', 'Co-supervisor arrangement'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**HSK validity** — HSK scores are valid for 2 years from the test date',
              '**IELTS / TOEFL validity** — also 2 years; same rule',
              '**Native English speakers** — applicants from countries where English is the official language may waive IELTS/TOEFL',
              '**Journalism and humanities** — the highest Chinese expectations at Fudan; HSK 6 (≥220) is the practical floor for these programs',
              '**MBBS route** — English-taught with IELTS 6.0 / TOEFL 80 entry; HSK 3–4 needed before clinical years for hospital placements',
              '**IMBA** — IELTS 6.5 / TOEFL 90 plus GMAT 600+ (preferred); 2+ years work experience strengthens candidacy',
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
        h2: 'Scholarship stack — CSC + Fudan + Shanghai Government',
        intro:
          'How to stack multiple scholarships to fully fund your Fudan degree.',
        blocks: [
          {
            type: 'p',
            text: 'Fudan admits international students regardless of funding source. Most international applicants use a stacked approach: apply through the CSC channel for full funding, apply for Fudan\'s own scholarships as a backup, and apply for the Shanghai Government Scholarship if eligible. The Shanghai Government Scholarship is among the most generous city-level awards in China — Class A covers tuition + accommodation + stipend, Class B covers tuition.',
          },
          {
            type: 'table',
            caption: 'Fudan scholarship stack — what to apply for and when',
            columns: ['Scholarship', 'Coverage', 'Deadline', 'How to apply'],
            rows: [
              ['Chinese Government Scholarship (CSC)', 'Full: tuition + dorm + ¥2,500–3,500/month stipend + airfare', 'December – mid-January (verify per cycle)', 'Select CSC on Fudan ISO portal; Fudan nominates to CSC'],
              ['Fudan University Scholarship', 'Tuition waiver (partial to full) + some stipends', 'Same as admission deadline', 'Automatic consideration with strong application'],
              ['Shanghai Government Scholarship — Class A', 'Tuition + accommodation + monthly stipend (full)', 'April – May (verify per cycle)', 'Apply via Shanghai Education Commission; through Fudan ISO'],
              ['Shanghai Government Scholarship — Class B', 'Tuition waiver', 'April – May (verify per cycle)', 'Apply via Shanghai Education Commission; through Fudan ISO'],
              ['Confucius Institute Scholarship', 'Full funding for Chinese language + culture programs', 'Varies', 'Through home-country Confucius Institute or Fudan ISO'],
              ['Home-country government scholarships', 'Varies by country; sometimes full funding', 'Varies by country', 'Through home-country scholarship agency'],
              ['External / foundation scholarships', 'Varies; partial to full', 'Varies', 'Direct to scholarship provider'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Apply for CSC first — but early** — Fudan\'s CSC deadline (December–January) is among the earliest of any Chinese university; late CSC applications at Fudan are simply not considered',
              '**Fudan University scholarship** — automatic for strong applicants; Fudan identifies scholarship-worthy applicants from the admission pool',
              '**Shanghai Government Scholarship** — separate application through the Shanghai Education Commission; Class A (full) is highly competitive; Class B (tuition) has a larger pool; both stack with other funding for different cost components',
              '**Confucius Institute Scholarship** — for Chinese language and culture programs; full funding with conditions',
              '**The stacking principle** — multiple smaller scholarships often beat one large one because each covers different costs',
              '**Scholarship after admission** — if admitted self-funded, you can still apply for the Shanghai Government Scholarship and external scholarships post-admission',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'A typical fully-funded international student at Fudan has CSC full + Shanghai Government Class B (tuition top-up) + Fudan scholarship (stipend top-up). The Shanghai municipal scholarship ecosystem is among the richest in China — use it.',
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
            text: 'Fudan\'s interview process is program-specific. Most bachelor\'s programs do not interview; competitive master\'s programs (journalism, economics, IR, clinical medicine, mathematics) interview nearly all short-listed applicants; PhD programs always interview. The interview is the deciding factor for borderline applicants.',
          },
          {
            type: 'table',
            caption: 'Fudan interview format by program type',
            columns: ['Program type', 'Interview format', 'Duration', 'Language'],
            rows: [
              ['Bachelor\'s (most)', 'Rare; some programs have a short online interview', '15–30 minutes', 'Chinese or English depending on program'],
              ['Master\'s (most)', 'Online interview via Tencent Meeting or Zoom; panel of 2–3 faculty', '20–45 minutes', 'Chinese or English depending on program'],
              ['Master\'s (journalism, IR, economics)', 'Panel interview + sometimes a written component', '45–90 minutes', 'Chinese for Chinese-taught; English for English-taught'],
              ['Master\'s (IMBA)', 'Multi-round: group discussion + individual interview', '60–90 minutes', 'English'],
              ['PhD (most)', 'Online interview; research proposal presentation + Q&A', '45–90 minutes', 'Chinese or English depending on supervisor'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Format** — most interviews are online via Tencent Meeting or Zoom; in-person interviews are rare for international applicants',
              '**Panel** — typically 2–3 faculty members; they have read your application; do not repeat content from your personal statement — instead, deepen it',
              '**Common questions** — why Fudan? Why this program? What is your research direction? Why Shanghai?',
              '**Academic questions** — be ready to discuss your undergraduate thesis or major projects in depth; PhD applicants should expect questions on the research proposal',
              '**Chinese-language questions** — for Chinese-taught programs, expect at least some questions in Chinese',
              '**Journalism-specific** — expect questions on current media landscape, your portfolio, and writing samples; bring published work if any',
              '**IMBA-specific** — group discussion on a business case; be ready to speak to your work experience and career goals',
              '**Logistics** — confirm the interview platform 24 hours in advance; test camera, microphone, and internet',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For journalism and IR interviews, prepare a portfolio of writing or media work. Fudan\'s journalism school is China\'s oldest and most respected — the interview panel often includes working journalists and editors among the faculty.',
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
            text: 'Fudan\'s admissions review weighs academic record most heavily, but for borderline applicants the soft components decide. The profile components below are listed in rough order of importance for competitive programs.',
          },
          {
            type: 'table',
            caption: 'Fudan competitive profile components',
            columns: ['Component', 'Weight', 'What "strong" looks like'],
            rows: [
              ['Academic record (GPA, ranking)', 'Highest', 'Top 10–15% of graduating class; GPA 3.4+/4.0 or equivalent'],
              ['CSCA scores', 'High', 'Target 80+ percentile in each subject; 85+ for journalism, IR, medicine'],
              ['Language proficiency', 'High', 'HSK 6 (≥220) for Chinese-taught humanities; IELTS 7.0+ for English-taught'],
              ['Personal statement quality', 'High', 'Program-specific; clear direction; faculty-fit awareness'],
              ['Recommendation letters', 'High', '2 letters from professors who know you academically; specific examples'],
              ['Portfolio / writing samples', 'High (journalism, humanities)', 'Published work, essays, media projects'],
              ['Research experience', 'Medium-high', 'Undergraduate thesis, research assistantships, publications (PhD)'],
              ['Work experience', 'Medium (IMBA, professional master\'s)', '2+ years in relevant field'],
              ['Awards and distinctions', 'Medium', 'National/international academic competitions, university awards'],
              ['Fit with Fudan faculty', 'Medium (research programs)', 'Mention specific faculty whose work aligns with yours'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Top 10–15% rule** — Fudan is marginally less selective than PKU/Tsinghua but still highly competitive; top 10–15% of the national system is the strong zone',
              '**CSCA target scores** — 80+ percentile in each subject is the typical strong range; 85+ for journalism, IR, clinical medicine',
              '**Personal statement as differentiator** — for humanities and journalism, writing quality in the personal statement is heavily weighted; it functions as a writing sample',
              '**Portfolio** — journalism and humanities applicants with published work or strong writing samples have a significant edge',
              '**Letters from known referees** — recommendation letters from professors with research relationships to Fudan faculty carry more weight',
              '**Research output** — for PhD applicants, a published paper significantly strengthens the application',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For journalism and humanities applicants, the personal statement doubles as a writing sample — Fudan\'s faculty read it as evidence of your ability to write. Invest disproportionate effort in it.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When does Fudan open applications for fall 2026?',
        a: 'The Fudan ISO portal typically opens for fall intake applications in November–December of the prior year. Many programs close by mid-March; the CSC channel closes December–January. Verify the specific deadline on the program\'s official page.',
      },
      {
        q: 'Is the CSCA mandatory for Fudan in 2026?',
        a: 'Yes — from the 2026 intake, the CSCA is mandatory for international bachelor\'s degree applicants and most master\'s programs. Some English-taught master\'s programs accept IELTS/TOEFL in lieu of the Chinese track but still require the Math (and sometimes Science) CSCA subjects.',
      },
      {
        q: 'What CSCA combination does Fudan ask for?',
        a: 'It varies by school. Most humanities, journalism, and social-science programs require Humanities Chinese + Math; sciences and engineering require STEM Chinese + Math + Physics; medicine and life sciences require Math + Chemistry. IMBA uses Math + English. Always check the program\'s official page.',
      },
      {
        q: 'How much does it cost to apply to Fudan?',
        a: 'The application fee is ¥400–¥800 per program, paid online through the Fudan ISO portal. The fee is non-refundable. Financial proof of ¥80,000+ is required for self-funded applicants.',
      },
      {
        q: 'Does Fudan interview international applicants?',
        a: 'Most bachelor\'s programs do not interview. Competitive master\'s programs (journalism, economics, IR, clinical medicine) interview nearly all short-listed applicants. PhD programs always interview. Interviews are typically online via Tencent Meeting or Zoom.',
      },
      {
        q: 'How competitive is Fudan for international students?',
        a: 'Highly competitive. Master\'s admit rate is roughly 5–10%; journalism, IR, and clinical medicine are below 5%. Applicants from the top 10–15% of their national system with strong CSCA scores have the best chance.',
      },
      {
        q: 'What is the Shanghai Government Scholarship and how do I apply?',
        a: 'A municipal-level scholarship for international students at Shanghai universities. Class A covers tuition + accommodation + stipend (full); Class B covers tuition. Apply through the Shanghai Education Commission via the Fudan ISO, typically April–May. It stacks with other funding.',
      },
      {
        q: 'Can I apply to Fudan and Tsinghua in the same cycle?',
        a: 'Yes — but Fudan closes earlier (December–March vs Tsinghua\'s March–May). Prepare Fudan documents first, then reuse them for the Beijing applications.',
      },
      {
        q: 'Does Fudan accept spring intake applications?',
        a: 'Some master\'s programs offer spring intake (March start); spring applications typically close October 31 of the prior year. Not all schools offer spring intake. Bachelor\'s and PhD programs generally only offer fall intake.',
      },
      {
        q: 'Does Fudan offer English-taught MBBS?',
        a: 'Yes — Fudan Shanghai Medical College offers an English-taught MBBS track with IELTS 6.0 / TOEFL 80 entry. HSK 3–4 is needed before the clinical years for hospital placements. The MBBS route uses the Math + Chemistry CSCA combination.',
      },
    ],
    howToSteps: [
      {
        name: 'Verify the program\'s CSCA combination and language requirements',
        text: 'Visit the Fudan ISO portal; find your target program; note the CSCA subject combination, language thresholds (HSK / IELTS / TOEFL), and any program-specific tests. Plan your CSCA session and language test around this combination.',
      },
      {
        name: 'Start document preparation by October',
        text: 'Fudan closes earlier than most top universities. Notarized translations, recommendation letters, and physical examinations take weeks — start by October for a December submission.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September 2026 intake, target a late-autumn or winter CSCA session. Fudan\'s CSC channel closes December–January; competitive master\'s close mid-February to mid-March.',
      },
      {
        name: 'Apply online through the Fudan ISO portal',
        text: 'Submit the full package before the program deadline (most programs close December–March). Save the confirmation email.',
      },
      {
        name: 'Apply for scholarships in parallel',
        text: 'Submit the CSC scholarship application through the Fudan ISO portal (closes December–January — earliest in China). Apply for the Shanghai Government Scholarship (April–May) and rely on automatic consideration for Fudan\'s own scholarships.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs interview. Prepare academic questions on your personal statement and research direction, Chinese-language questions if relevant, and a portfolio for journalism applications.',
      },
    ],
    ctaTitle: 'Applying to Fudan University?',
    ctaSubtitle:
      'SICA counselors verify your target program\'s CSCA combination and language requirements, refine your personal statement to match Fudan faculty research, and coordinate CSC + Fudan + Shanghai Government scholarship applications. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/fudan-university',
        label: 'Fudan University profile',
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
        description: 'The full-funding scholarship path for Fudan and most Chinese universities.',
      },
      {
        href: '/best-universities-in-shanghai',
        label: 'Best universities in Shanghai',
        description: 'How Fudan compares to SJTU, Tongji, and other Shanghai universities.',
      },
    ],
  },
  zh: {
    slug: 'fudan-university-admissions-guide',
    eyebrow: '申请深度指南',
    title: '复旦大学申请——国际生逐步指南',
    description:
      '如何以国际生身份申请复旦大学：申请渠道、截止日期、材料清单、各院系 CSCA 组合、语言要求、奖学金组合，以及申请者的竞争画像。',
    subtitle:
      '复旦大学通过基于学习计划的招生流程（2026 起 CSCA 必考）招收国际本科生与硕士生。本指南覆盖完整操作细节：选用哪个申请渠道（复旦 ISO 门户 vs CSC 渠道 vs 使馆推荐）、各入学窗口的截止日期、需要提交的材料、复旦各院系所要求的 CSCA 组合、按项目层级的语言门槛（HSK / 雅思 / 托福）、如何叠加 CSC + 复旦自有奖学金 + 上海市政府奖学金、复旦面试内容，以及让擦边申请者转录的画像要素。',
    stats: [
      { value: '约 5-10%', label: '典型国际硕士录取率' },
      { value: '12-3月', label: '秋季入学主要截止窗口' },
      { value: '2', label: '建议推荐信数量' },
      { value: '是', label: '2026 起 CSCA 必考' },
    ],
    quickAnswer:
      '复旦大学通过三条渠道招收国际生——复旦国际学生办公室门户直接申请、CSC 奖学金渠道（复旦为接收单位）、使馆推荐。2026 年 9 月入学的主要截止窗口为 12 月至 3 月（复旦开网与截止都比北京高校早——多数项目 3 月中旬截止）。2026 起 CSCA 必考。所需材料：护照、成绩单、800-1,500 字个人陈述、2 封推荐信、语言成绩（中文授课要 HSK 5+；英文授课要雅思 6.5+ / 托福 90+）、¥400-800 申请费。复旦是上海最全面的旗舰——人文、新闻、经济、国关、数学、物理、医学最强。',
    keyTakeaways: [
      '三条申请渠道：复旦 ISO 直申、CSC 通过复旦、使馆推荐——按奖学金策略选择',
      '秋季入学主要截止：12 月-3 月窗口；复旦开网早、多数项目 3 月中截止——早于北大/清华',
      '2026 起 CSCA 必考；人文社科通常要求人文中文 + 数学；理科与医学要求数学 + 物理或化学',
      '申请材料：护照、成绩单（公证翻译件）、800-1,500 字个人陈述、2 封推荐信、语言成绩、申请费',
      '语言门槛因项目而异：中文授课通常 HSK 5 或 6；英文授课通常雅思 6.5 / 托福 90',
      '奖学金组合：CSC（全额）+ 复旦自有奖学金 + 上海市政府奖学金；上海市级奖学金是中国最大方的市级奖项之一',
    ],
    sections: [
      {
        id: 'overview',
        h2: '复旦录取概览',
        intro:
          '2026 年复旦国际生录取全貌。',
        blocks: [
          {
            type: 'p',
            text: '复旦大学通过国际学生办公室处理国际申请，运营统一的在线申请门户。2026 年起，CSCA 是国际本科生与多数硕士项目的必考。复旦国际硕士申请者录取率约 5-10%，最热门项目（新闻、经济、国关、临床医学、数学）更低。复旦的日历比北大清华早——申请门户通常 11-12 月开放，多数项目 3 月中截止，因此同时申请北京和上海高校的申请者需要仔细排序。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '复旦国际学生办公室在 3-5 个工作日内以英文回复书面问询。用复旦 ISO 门户的联系表单提交最快。',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: '申请渠道——如何选',
        intro:
          '三条路通向复旦；按资金策略选。',
        blocks: [
          {
            type: 'p',
            text: '三条渠道都用同一复旦 ISO 门户——区别是资金来源与截止日期。渠道选择不改变复旦对你的学术评估，但会改变你能申请的奖学金与适用的截止日期。',
          },
          {
            type: 'table',
            caption: '复旦申请渠道对比',
            columns: ['渠道', '运作方式', '适合人群', '截止日期'],
            rows: [
              ['复旦 ISO 直接申请（自费）', '通过复旦 ISO 门户申报并声明自费', '自费申请者；只申请复旦自有奖或上海市政府奖者', '多数项目 12 月 - 3 月'],
              ['CSC 渠道（通过复旦）', '在复旦 ISO 门户勾选 CSC；复旦提名至 CSC', '申请全额 CSC 资助者', '12 月 - 1 月中（早；按当年通知）'],
              ['使馆推荐', '通过本国中国使馆申请；使馆提名至复旦', '本国与中国有双边奖学金项目者', '按本国使馆规定（常为 1-3 月）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**复旦 ISO 直接申请**——自费申请者的标准路径；可申请复旦自有奖或上海市政府奖学金',
              '**CSC 渠道**——全额奖学金路径；勾选 CSC；复旦 ISO 分批向 CSC 提名',
              '**使馆推荐**——所在国与中国有政府间双边奖学金项目者；使馆做初筛',
              '**英文授课硕士项目**——复旦有不断增长的英文硕士（IMBA、国关、经济、数据科学）；同一门户但按英文材料要求',
              '**实务建议**——多数国际申请者用复旦 ISO 直接渠道，再平行申请 CSC；复旦截止早意味着 10 月就要开始准备材料',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '你可以在复旦 ISO 直接渠道申报的同时平行申请 CSC 奖学金——两者不互斥。CSC 只在你被复旦录取后才资助，所以先申请复旦，再追 CSC。',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: '截止日期——什么时候申请',
        intro:
          '复旦开网早：多数项目 3 月中截止。',
        blocks: [
          {
            type: 'p',
            text: '复旦秋季入学（2026 年 9 月）的主要截止窗口为 12 月至 3 月——早于北大清华。CSC 渠道通常 12 月至 1 月截止，是中国顶尖大学中最早的之一。春季入学（2027 年 3 月，如适用）通常在前一年 10 月 31 日截止。以下日期为规划近似值——提交前务必在项目页核验。',
          },
          {
            type: 'table',
            caption: '复旦入学窗口（规划近似值——以项目页为准）',
            columns: ['入学', '项目', '主要截止', '说明'],
            rows: [
              ['2026 秋（9 月入学）', '本科、多数硕士、多数博士', '12 月 - 3 月', '门户 11-12 月开放'],
              ['2026 秋——CSC 渠道', '多数项目', '12 月 - 1 月中', '中国最早的 CSC 截止之一'],
              ['2026 秋——热门硕士', '新闻、经济、国关、临床、数学', '2 月中 - 3 月中', '早于普通截止'],
              ['2027 春（3 月入学，限部分）', '部分硕士（按院系）', '2026 年 10 月 31 日', '并非所有院系都有春季入学'],
              ['博士（PhD）', '多数院系', '12 月 - 3 月', '部分院系滚动评审'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**最早截止优先**——CSC 渠道 12-1 月截止；热门硕士 2 月中-3 月中截止',
              '**多数项目**——普通截止为 3 月中；建议 3 月初提交留出材料修改时间',
              '**与其他大学排序**——复旦比北大清华早截止；若同时申请，先备复旦材料再复用到北京申请',
              '**春季入学**——仅部分院系；前一年 10 月 31 日截止',
              '**逾期不候**——复旦不接受任何情况的逾期申请',
              '**推荐信**——提前 4-6 周联系推荐人；推荐人延迟提交会让你申请作废',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '复旦的 CSC 截止是中国顶尖大学中最早的——通常 12 月至 1 月中。如走 CSC 资助复旦，12 月前材料必须齐备。10 月开始准备材料。',
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
            text: '复旦的申请材料遵循中国大学标准模式并严格执行。材料缺失或格式不符是申请在学术评审前被拒的最常见原因。截止日期前把所有材料准备好数字版；初次申请通常不要求邮寄。',
          },
          {
            type: 'table',
            caption: '复旦申请材料清单',
            columns: ['材料', '具体要求', '格式', '需要翻译？'],
            rows: [
              ['护照', '有效期 1 年以上；个人信息页清晰彩色扫描', 'PDF，<5 MB', '否'],
              ['高中毕业证书 / 本科学位证', '原件 + 公证翻译（非中英文）', 'PDF，彩色扫描', '非中英文要'],
              ['成绩单', '全部学年；原件或公证翻译；GPA 可见', 'PDF，彩色扫描', '非中英文要'],
              ['个人陈述 / 学习计划', '800-1,500 字中文（中文授课）或英文（英文授课）；按项目', 'PDF，≤2 MB', '用授课语言'],
              ['推荐信', '硕士 2 封讲师及以上；博士优先副教授及以上', 'PDF，抬头纸，签字', '可选英文翻译'],
              ['语言——中文授课', 'HSK 5 或 6（按项目）；2 年有效', 'PDF 成绩单扫描', '否'],
              ['语言——英文授课', '雅思 6.5+ / 托福 90+；2 年有效；母语者可能免', 'PDF 成绩单扫描', '否'],
              ['申请费', '¥400-800 / 项目；不退', '在线支付', '否'],
              ['护照照片', '近期；白底；正面', 'JPG，<500 KB', '否'],
              ['体检表', '复旦规定表格；执业医师填写', 'PDF，签字盖章', '可接受英文翻译'],
              ['CV / 简历', '学术 CV；教育、奖项、发表、研究', 'PDF，1-2 页', '用授课语言'],
              ['发表（博士申请者）', '已发表论文、毕业论文或研究成果', 'PDF', '可选英文翻译'],
              ['无犯罪记录证明', '本国警察出具；6 个月内', 'PDF，公证', '非中英文要'],
              ['经济证明', '银行流水一年 ¥80,000+ OR 奖学金证明', 'PDF', '可接受英文翻译'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**翻译要求**——非中英文材料须公证翻译；用认证翻译服务',
              '**个人陈述**——复旦对人文、新闻、国关项目的个人陈述权重很大；展示对学院与师资的具体了解',
              '**推荐信**——推荐人应为学术；复旦偏好能评价你研究或学术能力的教授',
              '**体检**——使用复旦规定表格；执业医师填写并签字盖章',
              '**经济证明**——银行流水应显示 ¥80,000+ 可用资金（上海一年总开销）；奖学金证明可替代',
              '**提前准备**——复旦 12-3 月截止意味着 10 月是材料收集（尤其公证翻译）的实际起点',
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
        h2: 'CSCA 策略——复旦各院系要求',
        intro:
          'CSCA 组合按院系不同。按项目核验。',
        blocks: [
          {
            type: 'p',
            text: '复旦不发布 CSCA 组合的统一总表。每个院系在项目页公布所需组合。下表是典型模式——但官方来源始终是项目当年录取页。',
          },
          {
            type: 'table',
            caption: '复旦各院系典型 CSCA 组合（按项目核验）',
            columns: ['院系 / 项目族', '常见 CSCA 组合', '说明'],
            rows: [
              ['新闻学院（中国顶尖新闻项目）', '人文中文 + 数学', '学习计划与写作质量常决定'],
              ['经济学院', '数学 + 人文中文', '量化重；部分项目英文'],
              ['国际关系与公共事务学院', '人文中文 + 数学', '国关是复旦最激烈项目之一'],
              ['哲学学院', '人文中文 + 数学', '学习计划常决定'],
              ['中国语言文学系', '人文中文 + 数学', '中文要求最高'],
              ['数学科学学院', '理工中文 + 数学 + 物理', '部分项目免物理'],
              ['物理学系', '理工中文 + 数学 + 物理', '物理研究必需'],
              ['化学系', '数学 + 化学', '部分项目加物理'],
              ['生命科学学院', '数学 + 化学', '部分项目加生物'],
              ['计算机科学技术学院', '理工中文 + 数学 + 物理', '量化筛选'],
              ['大数据学院', '理工中文 + 数学 + 物理', 'AI / 统计侧重'],
              ['信息科学与工程学院', '理工中文 + 数学 + 物理', '电子 + 信息侧重'],
              ['上海医学院（临床医学）', '数学 + 化学', '生物有帮助；MBBS 路线用英文轨'],
              ['公共卫生学院', '数学 + 化学', '部分项目接受物理'],
              ['药学院', '数学 + 化学', '药学侧重'],
              ['管理学院（商科、金融、IMBA）', '数学 +（人文或理工中文）', 'IMBA 英文；常无中文轨'],
              ['法学院', '人文中文 + 数学', '部分项目加英语成绩'],
              ['社会学系', '人文中文 + 数学', '研究方法侧重'],
              ['历史学系', '人文中文 + 数学', '学习计划常决定'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**人文中文轨**——多数人文、社科、法学、新闻、国关项目要求',
              '**理工中文轨**——多数理科、工科、数据项目要求',
              '**数学**——几乎所有项目要求；唯一人人必考的 CSCA 科目',
              '**物理**——物理、工科、计算机、数据科学项目要求',
              '**化学**——生命科学、医学、药学、化学项目要求',
              '**英文授课项目**——IMBA、部分经济与数据科学硕士接受英语成绩替代中文轨',
              '**MBBS 申请者**——英文授课 MBBS 路线用数学 + 化学组合加英语成绩',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '报名 CSCA 场次前务必在项目官方录取页核验当年科目组合。新闻、国关、临床医学是复旦最激烈的——目标 85+ 百分位。',
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
            text: '复旦语言要求因项目而异。以下门槛为规划近似值——以项目页为准。',
          },
          {
            type: 'table',
            caption: '复旦语言门槛（按项目类型，规划近似值）',
            columns: ['项目类型', '中文授课最低', '英文授课最低', '说明'],
            rows: [
              ['本科（多数）', 'HSK 5（≥180）或 HSK 6（≥200）', '雅思 6.5 / 托福 90', '多数本科中文授课'],
              ['本科（MBBS 英文轨）', 'HSK 3-4（临床年前）', '雅思 6.0 / 托福 80', '英文 MBBS；医院实习需基础 HSK'],
              ['硕士（中文授课）', 'HSK 5（≥200）或 HSK 6（≥220）', '雅思 6.0 / 托福 80（补充）', '人文与新闻常要 HSK 6'],
              ['硕士（英文授课）', 'HSK 4（可选）', '雅思 6.5 / 托福 90', 'IMBA、部分经济与数据科学'],
              ['硕士（IMBA）', 'HSK 可选', '雅思 6.5 / 托福 90 / GMAT 600+', '竞争激烈；看重工作经验'],
              ['博士（多数）', 'HSK 5（≥200）', '雅思 6.5 / 托福 90', '中文导师项目 HSK 更高'],
              ['博士（英文导师）', 'HSK 4（可选）', '雅思 6.5 / 托福 90', '可配中文共同导师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**HSK 有效期**——HSK 成绩 2 年有效',
              '**雅思/托福有效期**——同为 2 年',
              '**母语英语者**——本国官方语言为英语者可免雅思/托福',
              '**新闻与人文**——复旦中文要求最高；HSK 6（≥220）是这些项目的实际底线',
              '**MBBS 路线**——英文授课，雅思 6.0 / 托福 80 入学；临床年前需 HSK 3-4 用于医院实习',
              '**IMBA**——雅思 6.5 / 托福 90 加 GMAT 600+（优先）；2 年以上工作经验加分',
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
        h2: '奖学金组合——CSC + 复旦 + 上海市政府',
        intro:
          '如何叠加多项奖学金为复旦学位全额筹资。',
        blocks: [
          {
            type: 'p',
            text: '复旦录取国际生不分资金来源。多数国际申请者用叠加策略：通过 CSC 渠道申请全额资助，平行申请复旦自有奖学金作为保底，符合条件再申请上海市政府奖学金。上海市政府奖学金是中国最大方的市级奖项之一——A 类覆盖学费 + 住宿 + 津贴，B 类覆盖学费。',
          },
          {
            type: 'table',
            caption: '复旦奖学金组合——申请什么、何时申请',
            columns: ['奖学金', '覆盖', '截止', '申请方式'],
            rows: [
              ['中国政府奖学金（CSC）', '全额：学费 + 住宿 + ¥2,500-3,500/月 + 机票', '12 月 - 1 月中（按当年通知）', '在复旦 ISO 门户勾选 CSC；复旦提名'],
              ['复旦奖学金', '学费减免（部分至全额）+ 部分津贴', '与录取截止相同', '强申请自动评审'],
              ['上海市政府奖学金——A 类', '学费 + 住宿 + 月津贴（全额）', '4-5 月（按当年通知）', '通过上海市教委；经复旦 ISO 提交'],
              ['上海市政府奖学金——B 类', '学费减免', '4-5 月（按当年通知）', '通过上海市教委；经复旦 ISO 提交'],
              ['孔子学院奖学金', '中文语言与文化项目全额资助', '按孔子学院网络', '通过本国孔子学院或复旦 ISO'],
              ['本国政府奖学金', '按国家不同；有时全额', '按国家不同', '通过本国奖学金机构'],
              ['外部 / 基金会奖学金', '部分至全额不等', '不定', '直接申请提供方'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**优先申请 CSC——但要早**——复旦 CSC 截止（12-1 月）是中国大学中最早的之一；迟交的 CSC 申请直接不受理',
              '**复旦奖学金**——强申请者自动；复旦从录取池中识别值得奖学金的申请者',
              '**上海市政府奖学金**——通过上海市教委单独申请；A 类（全额）竞争激烈；B 类（学费）名额更多；与其他资金覆盖不同开销可叠加',
              '**孔子学院奖学金**——中文语言与文化项目；全额资助带条件',
              '**叠加原则**——多笔小额常胜一笔大额，因为各项覆盖不同开销',
              '**录取后申请**——自费录取后仍可申请上海市政府奖与外部奖学金',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '典型的复旦全额资助国际生：CSC 全额 + 上海市政府 B 类（学费加给）+ 复旦奖学金（津贴加给）。上海市级奖学金生态是中国最丰厚的之一——用好它。',
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
            text: '复旦面试因项目而异。多数本科项目不面试；热门硕士（新闻、经济、国关、临床医学、数学）几乎面试所有候选；博士一律面试。面试是擦边申请者的决定性因素。',
          },
          {
            type: 'table',
            caption: '复旦面试形式（按项目类型）',
            columns: ['项目类型', '面试形式', '时长', '语言'],
            rows: [
              ['本科（多数）', '罕见；部分项目有简短在线面试', '15-30 分钟', '中文或英文按项目'],
              ['硕士（多数）', '在线面试通过腾讯会议或 Zoom；2-3 位教师组', '20-45 分钟', '中文或英文按项目'],
              ['硕士（新闻、国关、经济）', '教师组面试 + 有时笔试环节', '45-90 分钟', '中文授课用中文；英文授课用英文'],
              ['硕士（IMBA）', '多轮：小组讨论 + 个人面试', '60-90 分钟', '英文'],
              ['博士（多数）', '在线面试；研究计划陈述 + Q&A', '45-90 分钟', '中文或英文按导师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**形式**——多数面试在线通过腾讯会议或 Zoom；线下面试对国际生少见',
              '**面试组**——通常 2-3 位教师；他们已读过你的申请；不要重复个人陈述内容——而要深化',
              '**常见问题**——为什么选复旦？为什么这个项目？研究方向？为什么选上海？',
              '**学术问题**——准备好深入讨论本科毕业论文或主要项目；博士申请者预期被问研究计划',
              '**中文问题**——中文授课项目预期至少部分中文问题',
              '**新闻专项**——预期被问当前媒体格局、作品集、写作样本；有发表作品带上',
              '**IMBA 专项**——商业案例小组讨论；准备好谈工作经验与职业目标',
              '**后勤**——提前 24 小时确认面试平台；测试摄像头、麦克风、网络',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '新闻与国关面试准备作品集或媒体作品。复旦新闻学院是中国最古老最受尊重的——面试组常包括在职记者与编辑出身的教师。',
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
            text: '复旦录取评审最看重学业成绩，但擦边申请者由软要素决定。以下画像要素按热门项目的大致重要性排序。',
          },
          {
            type: 'table',
            caption: '复旦竞争画像要素',
            columns: ['要素', '权重', '"强"长什么样'],
            rows: [
              ['学业成绩（GPA、排名）', '最高', '毕业班前 10-15%；GPA 3.4+/4.0'],
              ['CSCA 成绩', '高', '各科目标 80+ 百分位；新闻、国关、医学 85+'],
              ['语言水平', '高', '中文授课人文 HSK 6（≥220）；英文授课雅思 7.0+'],
              ['个人陈述质量', '高', '按项目；清晰方向；体现对师资的了解'],
              ['推荐信', '高', '2 封了解你学术的教授；具体例子'],
              ['作品集 / 写作样本', '高（新闻、人文）', '发表作品、文章、媒体项目'],
              ['研究经历', '中-高', '本科论文、研究助理、发表（博士）'],
              ['工作经验', '中（IMBA、专业硕士）', '相关领域 2 年以上'],
              ['奖项荣誉', '中', '国家级 / 国际学术竞赛、大学奖项'],
              ['与复旦师资契合度', '中（研究项目）', '提到与你研究一致的具体教师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**前 10-15% 规则**——复旦比北大清华略宽松但仍高度竞争；本国前 10-15% 是强区',
              '**CSCA 目标分**——各科 80+ 百分位为典型强线；新闻、国关、临床医学 85+',
              '**个人陈述作为差异化因素**——人文与新闻项目的写作质量权重很大；个人陈述兼具写作样本功能',
              '**作品集**——有发表作品或强写作样本的新闻与人文申请者有明显优势',
              '**来自知名推荐人的信**——与复旦教师有研究关系的教授推荐信权重更大',
              '**研究产出**——博士申请者发表过论文显著加分',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '新闻与人文申请者，个人陈述兼作写作样本——复旦教师把它当作你写作能力的证据。投入超额精力打磨它。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '复旦什么时候开放 2026 年秋季入学申请？',
        a: '复旦 ISO 门户通常在前一年 11-12 月开放秋季入学申请。多数项目 3 月中截止；CSC 渠道 12-1 月截止。以项目官方页为准。',
      },
      {
        q: '2026 年复旦 CSCA 必考吗？',
        a: '是——2026 年起，国际本科生必须考 CSCA；多数硕士项目也要求。部分英文授课硕士接受雅思/托福替代中文轨，但仍需 CSCA 数学（通常还有科学）。',
      },
      {
        q: '复旦要求哪些 CSCA 组合？',
        a: '按院系不同。多数人文、新闻、社科要求人文中文 + 数学；理工科要求理工中文 + 数学 + 物理；医学与生命科学要求数学 + 化学。IMBA 用数学 + 英语。始终以项目官方页为准。',
      },
      {
        q: '申请复旦要多少钱？',
        a: '申请费每项目 ¥400-800，通过复旦 ISO 门户在线支付，不退。自费申请者需 ¥80,000+ 经济证明。',
      },
      {
        q: '复旦面试国际生吗？',
        a: '多数本科项目不面试。热门硕士（新闻、经济、国关、临床医学）几乎面试所有候选。博士一律面试。面试通常在线通过腾讯会议或 Zoom。',
      },
      {
        q: '复旦对国际生录取竞争多大？',
        a: '高度竞争。硕士录取率约 5-10%；新闻、国关、临床医学低于 5%。本国前 10-15%、CSCA 强分的申请者机会最大。',
      },
      {
        q: '什么是上海市政府奖学金？如何申请？',
        a: '面向上海高校国际生的市级奖学金。A 类覆盖学费 + 住宿 + 津贴（全额）；B 类覆盖学费。通过上海市教委经复旦 ISO 申请，通常 4-5 月。可与其他资金叠加。',
      },
      {
        q: '可以同一年申请复旦和清华吗？',
        a: '可以——但复旦截止更早（12-3 月 vs 清华 3-5 月）。先备复旦材料再复用到北京申请。',
      },
      {
        q: '复旦接受春季入学申请吗？',
        a: '部分硕士项目提供春季入学（3 月开始）；春季申请通常前一年 10 月 31 日截止。并非所有院系都有春季入学。本科与博士一般仅秋季入学。',
      },
      {
        q: '复旦有英文授课 MBBS 吗？',
        a: '有——复旦上海医学院提供英文授课 MBBS，雅思 6.0 / 托福 80 入学。临床年前需 HSK 3-4 用于医院实习。MBBS 路线用数学 + 化学 CSCA 组合。',
      },
    ],
    howToSteps: [
      {
        name: '核验项目的 CSCA 组合与语言要求',
        text: '访问复旦 ISO 门户；找到目标项目；记录 CSCA 科目组合、语言门槛（HSK / 雅思 / 托福）、项目特有考试。围绕这个组合规划 CSCA 场次与语言考试。',
      },
      {
        name: '10 月开始准备材料',
        text: '复旦比多数顶尖大学截止早。公证翻译、推荐信、体检要数周——12 月提交的话 10 月就启动。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学瞄准深秋或冬季 CSCA 场次。复旦 CSC 渠道 12-1 月截止；热门硕士 2 月中-3 月中截止。',
      },
      {
        name: '通过复旦 ISO 门户网上申请',
        text: '项目截止前（多数项目 12-3 月截止）提交完整材料。保存确认邮件。',
      },
      {
        name: '并行申请奖学金',
        text: '通过复旦 ISO 门户提交 CSC 申请（12-1 月截止——中国最早）。申请上海市政府奖学金（4-5 月）并依靠复旦自有奖学金的自动评审。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '热门硕士与博士要面试。准备学术问题（个人陈述与研究方向）、中文问题（如适用）、新闻申请者带作品集。',
      },
    ],
    ctaTitle: '正在申请复旦大学？',
    ctaSubtitle:
      'SICA 顾问核验目标项目的 CSCA 组合与语言要求、优化个人陈述以匹配复旦教师研究、协调 CSC + 复旦 + 上海市政府奖学金申请。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/fudan-university',
        label: '复旦大学简介',
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
        description: '复旦与多数中国大学的全额资助奖学金路径。',
      },
      {
        href: '/best-universities-in-shanghai',
        label: '上海最好的大学',
        description: '复旦与上交、同济等上海高校如何对比。',
      },
    ],
  },
};
