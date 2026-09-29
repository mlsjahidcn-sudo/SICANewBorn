import type { LocalizedGuide } from './types';

/**
 * Tsinghua University admissions deep-dive — flagship admissions guide #2
 * of 5 (docs/flagship-admissions-5-article-plan.md).
 *
 * Complements /tsinghua-university profile with operational depth +
 * the Schwarzman Scholars pathway as a distinct admissions stream.
 *
 * Target queries: "tsinghua admissions", "apply Tsinghua international",
 * "Schwarzman application", "Tsinghua CSCA", "清华 申请".
 */
export const tsinghuaUniversityAdmissionsGuide: LocalizedGuide = {
  en: {
    slug: 'tsinghua-university-admissions-guide',
    eyebrow: 'ADMISSIONS DEEP-DIVE',
    title: 'Tsinghua University admissions — step-by-step guide for international students',
    description:
      'How to apply to Tsinghua University as an international student: routes, deadlines, document checklist, CSCA combinations by school, language requirements, scholarship stack, the Schwarzman Scholars pathway, and what makes a competitive applicant.',
    subtitle:
      'Tsinghua University admits international bachelor\'s and master\'s applicants through a study-plan-based admissions process with the CSCA exam mandatory from 2026. Beyond the standard Tsinghua ISO portal route, the Schwarzman Scholars master\'s program runs a separate global application process with its own deadlines and requirements. This guide covers both the standard Tsinghua application and the Schwarzman pathway: routes, deadlines, document checklist, CSCA combinations by Tsinghua school, language thresholds (HSK / IELTS / TOEFL), the Tsinghua + CSC + Beijing Government scholarship stack, the Schwarzman-specific application timeline, what to expect in the Tsinghua interview, and the profile components that move a borderline applicant to admit.',
    stats: [
      { value: '~5-8%', label: 'Typical international admit rate (master\'s)' },
      { value: 'Mar–May', label: 'Fall intake main deadline' },
      { value: 'Yes', label: 'Schwarzman Scholars (separate stream)' },
      { value: 'Yes', label: 'CSCA mandatory from 2026 intake' },
    ],
    quickAnswer:
      'Tsinghua admits international students through three channels — direct application via the Tsinghua International Students Office (ISO) portal, the Chinese Government Scholarship (CSC) channel through Tsinghua as the host institution, and the Schwarzman Scholars master\'s program (a separate global application with its own deadline in late May). For September 2026 fall intake, the main deadline is March 31 to May 31. The CSCA is mandatory from 2026 intake. Required documents include passport, transcripts, an 800–1,500-word study plan, 2 recommendation letters (associate professor or above), language evidence (HSK 5+ for Chinese-taught; IELTS 6.5+ / TOEFL 90+ for English-taught), and a ¥500–¥800 application fee. Apply at https://www.tsinghua.edu.cn — the ISO portal serves all channels; Schwarzman has its own portal at https://schwarzmanscholars.org.',
    keyTakeaways: [
      'Three application channels: Tsinghua ISO direct, CSC through Tsinghua, Schwarzman Scholars (separate global application)',
      'Fall intake main deadline: March 31 for most programs; competitive master\'s close earlier; Schwarzman closes late May for the following September',
      'CSCA mandatory from 2026 intake; engineering and CS programs typically require STEM Chinese + Math + Physics',
      'Schwarzman Scholars: fully funded, English-language master\'s in global affairs; one of the world\'s most selective programs (~5% admit rate); separate application at https://schwarzmanscholars.org',
      'Document package: passport, transcripts (notarized Chinese or English translation), 800–1,500-word study plan, 2 recommendation letters, language test, application fee',
      'Scholarship stack: CSC (full funding) + Tsinghua\'s own scholarships + Beijing Government scholarship; Schwarzman is fully funded standalone (tuition + dorm + stipend + airfare + laptop)',
    ],
    sections: [
      {
        id: 'overview',
        h2: 'Tsinghua admissions at a glance',
        intro:
          'The Tsinghua admissions picture for international students in 2026.',
        blocks: [
          {
            type: 'p',
            text: 'Tsinghua University processes international applications through its International Students Office (ISO), which runs the central application portal at https://www.tsinghua.edu.cn. From 2026 intake onward, the CSCA is mandatory for international bachelor\'s degree applicants and most master\'s programs. Tsinghua\'s admit rate for international master\'s applicants is roughly 5–8%, with the most competitive programs (computer science, AI, electronic engineering, applied math, Schwarzman) admitting fewer than 5%. The signature Schwarzman Scholars program is a fully-funded, English-language master\'s in global affairs (public policy, economics, international relations) with its own application portal and late-May deadline — it is the most selective Tsinghua pathway and one of the most selective globally.',
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'The Tsinghua ISO responds to written inquiries in English within 3–5 business days. Email iso@tsinghua.edu.cn or use the contact form on the Tsinghua ISO portal.',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: 'Application routes — three channels including Schwarzman',
        intro:
          'Three routes lead to Tsinghua; the Schwarzman pathway is its own stream.',
        blocks: [
          {
            type: 'p',
            text: 'The standard Tsinghua ISO portal serves two routes (direct application and CSC scholarship). Schwarzman Scholars runs a separate global application with its own deadline, its own portal, and a more selective admit rate. Choosing between the standard Tsinghua application and Schwarzman is the first decision — they serve different student profiles.',
          },
          {
            type: 'table',
            caption: 'Tsinghua application routes — channel comparison',
            columns: ['Route', 'How it works', 'Best for', 'Deadline'],
            rows: [
              ['Tsinghua ISO direct (self-funded)', 'Apply via the Tsinghua ISO portal with self-funding declaration', 'Standard bachelor\'s or master\'s applicants; those not pursuing CSC', 'March 31 – May 31 (most programs)'],
              ['CSC channel (through Tsinghua)', 'Select CSC scholarship on the Tsinghua ISO portal; Tsinghua nominates you to CSC', 'Applicants for full CSC funding (tuition + dorm + stipend + airfare)', 'January 31 – April 15 (early); verify current cycle'],
              ['Schwarzman Scholars (separate global stream)', 'Apply at https://schwarzmanscholars.org with global application', 'Highly competitive applicants for a fully-funded English-language master\'s in global affairs', 'Late May (verify per cycle)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Tsinghua ISO direct** — the standard path for self-funded applicants; you can also apply for Tsinghua\'s own scholarships or Beijing Government scholarship through this route',
              '**CSC channel** — the path for full-funded scholarship; select CSC on the Tsinghua ISO portal; Tsinghua\'s ISO submits nominations to CSC',
              '**Schwarzman Scholars** — a fully-funded, English-language master\'s in global affairs at Tsinghua\'s Schwarzman College; one of the world\'s most selective programs (~5% admit rate); separate application portal at https://schwarzmanscholars.org; covers tuition + dorm + stipend + airfare + laptop',
              '**Joint / dual degree programs** — some Tsinghua joint programs have their own application portals (e.g., the Tsinghua–University of Washington Global Innovation Exchange; the Tsinghua–Berkeley joint programs); check the program\'s page directly',
              '**Practical advice** — most international applicants use the Tsinghua ISO direct route; Schwarzman applicants should treat the Schwarzman application as their primary effort given its selectivity',
              '**Schwarzman eligibility** — bachelor\'s degree or equivalent; 18+ years old; English proficiency (IELTS 7.0+ or TOEFL 100+); leadership track record; strong academic record',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Schwarzman Scholars is its own stream — applying to Schwarzman does not require a separate Tsinghua ISO application. Schwarzman admittees are automatically enrolled at Tsinghua Schwarzman College. The Schwarzman application is at https://schwarzmanscholars.org.',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: 'Deadlines — fall intake windows + Schwarzman\'s late-May cut',
        intro:
          'Fall intake is the main window; Schwarzman closes in late May.',
        blocks: [
          {
            type: 'p',
            text: 'Tsinghua\'s fall intake (September 2026 start) has a primary deadline window from March 31 to May 31, with the most competitive programs closing as early as January 31. The Schwarzman Scholars deadline is in late May for the following September — later than standard master\'s programs because Schwarzman runs its own global admissions cycle.',
          },
          {
            type: 'table',
            caption: 'Tsinghua intake windows (planning approximations — verify per program)',
            columns: ['Intake', 'Programs', 'Main deadline', 'Notes'],
            rows: [
              ['Fall 2026 (September start)', 'Bachelor\'s, most master\'s, most PhD', 'March 31 – May 31', 'Most programs close April–May'],
              ['Fall 2026 — competitive master\'s', 'CS, AI, electronic engineering, applied math', 'January 31 – March 15', 'Earlier deadlines for top programs'],
              ['Fall 2026 — CSC channel', 'Most programs', 'January 31 – April 15', 'Earlier than direct'],
              ['Schwarzman Scholars (Fall 2026)', 'Master\'s in Global Affairs (Schwarzman College)', 'Late May (verify current cycle)', 'Separate portal at https://schwarzmanscholars.org'],
              ['Spring 2027 (limited)', 'Some master\'s (verify per school)', 'October 31, 2026', 'Not all schools offer spring intake'],
              ['Doctoral (PhD)', 'Most schools', 'March 31 – May 31', 'Some schools have rolling review'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Standard deadlines** — most master\'s and bachelor\'s programs close March 31 to May 31; submit by April 15 to leave room for document corrections',
              '**Competitive master\'s** — CS, AI, electronic engineering, applied math close January 31 to March 15; submit earlier rather than later',
              '**CSC channel** — closes earlier than direct applications (January–April); if pursuing CSC, target the early CSC deadline',
              '**Schwarzman deadline** — late May; later than standard master\'s programs; the Schwarzman application is intensive (essays + recommendations + video), so plan to start 6–8 weeks ahead',
              '**Spring intake** — only some schools; closes October 31 of prior year; verify per program',
              '**Late submissions** — Tsinghua does not accept late applications under any circumstances',
              '**Recommendation letters** — ask your referees 4–6 weeks before the deadline; Schwarzman requires 3 letters (vs. 2 for standard Tsinghua)',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'For Schwarzman Scholars, the late-May deadline is fixed but the application is intensive. Most successful Schwarzman applicants start 2–3 months before the deadline. The application includes 3 essays, 3 recommendation letters, a video introduction, and a multi-round interview process.',
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
            text: 'Tsinghua\'s document requirements are strict — missing or improperly formatted documents are the most common reason for application rejection before academic review. Schwarzman has additional requirements (3 essays, video introduction, 3 recommendation letters) on top of the standard document package.',
          },
          {
            type: 'table',
            caption: 'Tsinghua application document checklist (standard)',
            columns: ['Document', 'Specific requirement', 'Format', 'Translation needed?'],
            rows: [
              ['Passport', 'Valid for at least 1 year; clear color scan of bio page', 'PDF, <5 MB', 'No'],
              ['High school diploma / Bachelor\'s degree', 'Original + notarized translation if not in Chinese/English', 'PDF, color scan', 'Yes if not Chinese/English'],
              ['Transcripts', 'All years; original or notarized translation; GPA visible', 'PDF, color scan', 'Yes if not Chinese/English'],
              ['Study plan', '800–1,500 words in Chinese (Chinese-taught) or English (English-taught); program-specific', 'PDF, ≤2 MB', 'In language of instruction'],
              ['Recommendation letters', '2 letters from associate professors or above (PhD); 2 from lecturers or above (master\'s)', 'PDF on letterhead, signed', 'Optional English translation'],
              ['Language test — Chinese-taught', 'HSK 5 or 6 (program-dependent); valid for 2 years', 'PDF scan of score report', 'No'],
              ['Language test — English-taught', 'IELTS 6.5+ / TOEFL 90+; valid for 2 years; native English speakers may waive', 'PDF scan of score report', 'No'],
              ['Application fee', '¥500–¥800 per program; non-refundable', 'Online payment', 'No'],
              ['Passport-style photo', 'Recent; white background; full face', 'JPG, <500 KB', 'No'],
              ['Physical examination form', 'Tsinghua\'s specific form; completed by a licensed physician', 'PDF, signed and stamped', 'English translation acceptable'],
              ['CV / resume', 'Academic CV; education, awards, publications, research', 'PDF, 1–2 pages', 'In language of instruction'],
              ['Publications (PhD applicants)', 'Copies of published papers, theses, or research outputs', 'PDF', 'Optional English translation'],
              ['No-criminal-record certificate', 'Issued by home-country police; less than 6 months old', 'PDF, notarized', 'Yes if not Chinese/English'],
              ['Financial proof', 'Bank statement showing ¥80,000+ available OR scholarship award letter', 'PDF', 'English translation acceptable'],
            ],
          },
          {
            type: 'table',
            caption: 'Schwarzman Scholars — additional requirements',
            columns: ['Document', 'Specific requirement', 'Format', 'Notes'],
            rows: [
              ['3 essays', 'Leadership essay, career goals essay, global perspective essay; each ~750 words', 'Online text submission', 'Strict word limits enforced'],
              ['Video introduction', '2-minute personal introduction; clear audio and video', 'Video upload (MP4)', 'No professional production needed'],
              ['3 recommendation letters', 'From supervisors, professors, or mentors who can speak to leadership and academic ability', 'Online form', 'Tsinghua ISO portal requires only 2 — Schwarzman requires 3'],
              ['Resume / CV', 'Detailed CV including leadership roles, awards, international experience', 'PDF, 2–3 pages', 'Leadership emphasis vs. academic emphasis for standard Tsinghua'],
              ['English proficiency', 'IELTS 7.0+ / TOEFL 100+ (preferred); native English speakers may waive', 'PDF scan', 'Higher threshold than standard Tsinghua (6.5/90)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Translation requirements** — documents not in Chinese or English must be notarized translations; use a certified translation service',
              '**Recommendation letters** — referees should be academic; Tsinghua prefers professors who can speak to your research or academic ability',
              '**Study plan** — the most important non-academic document; Tsinghua reads this carefully for fit, motivation, and research direction',
              '**Schwarzman essays** — the most heavily weighted component of the Schwarzman application; writing quality and self-reflection matter more than credentials',
              '**Schwarzman video** — authenticity matters; do not use professional video production services; the Tsinghua admissions committee wants to see the real you',
              '**Physical examination** — use the Tsinghua-provided form; signed and stamped by a licensed physician',
              '**Financial proof** — bank statements should show ¥80,000+ available; if you have a scholarship, the award letter substitutes',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Schwarzman Scholars\'s 3 essays + video introduction are the most heavily weighted components. Most successful Schwarzman applicants spend 4–8 weeks on the essays alone. The essays ask about leadership, career goals, and global perspective — there are no "right answers" but specificity and self-reflection are rewarded.',
          },
        ],
      },
      {
        id: 'csca-strategy',
        h2: 'CSCA strategy — what each Tsinghua school asks for',
        intro:
          'CSCA combinations vary by school within Tsinghua. Verify per program.',
        blocks: [
          {
            type: 'p',
            text: 'Tsinghua does not publish a single master list of CSCA combinations. Each school publishes the required combination on its program page. The combinations below are typical patterns verified from recent application cycles — but the official source is always the program\'s current admissions page.',
          },
          {
            type: 'table',
            caption: 'Typical CSCA combinations by Tsinghua school (verify per program)',
            columns: ['Tsinghua school / program family', 'Common CSCA combination', 'Notes'],
            rows: [
              ['School of Computer Science (CS, AI, software)', 'STEM Chinese + Math + Physics', 'Quant-heavy; CS is one of the most competitive'],
              ['Department of Electronic Engineering', 'STEM Chinese + Math + Physics', 'Same as CS for screening'],
              ['Department of Automation', 'STEM Chinese + Math + Physics', 'Signals systems + control theory'],
              ['Department of Mechanical Engineering', 'STEM Chinese + Math + Physics', 'Mechanical + materials emphasis'],
              ['Department of Materials Science', 'STEM Chinese + Math + Physics', 'Some programs add Chemistry'],
              ['Department of Chemical Engineering', 'Math + Chemistry', 'Process engineering emphasis'],
              ['Department of Civil Engineering', 'STEM Chinese + Math + Physics', 'Structures + environmental'],
              ['School of Aerospace Engineering', 'STEM Chinese + Math + Physics', 'Aerospace + propulsion'],
              ['Department of Electrical Engineering', 'STEM Chinese + Math + Physics', 'Power + electronics'],
              ['School of Life Sciences', 'Math + Chemistry', 'Some programs add Biology'],
              ['School of Pharmaceutical Sciences', 'Math + Chemistry', 'Pharmaceutical chemistry emphasis'],
              ['Department of Physics', 'STEM Chinese + Math + Physics', 'Physics research essential'],
              ['Department of Mathematics', 'STEM Chinese + Math + Physics', 'Math research essential'],
              ['Department of Chemistry', 'Math + Chemistry', 'Some programs add Physics'],
              ['School of Economics & Management (SEM)', 'Math + (Humanities or STEM Chinese)', 'Quant-heavy; some programs waive Chinese track'],
              ['School of Public Policy & Management (SPPM)', 'Math + Humanities Chinese', 'Policy + management emphasis'],
              ['Schwarzman College', 'No CSCA required', 'English-language program throughout; IELTS/TOEFL only'],
              ['School of Humanities (literature, history, philosophy)', 'Humanities Chinese + Math', 'Study plan often decides'],
              ['School of Social Sciences', 'Humanities Chinese + Math', 'Some programs add English evidence'],
              ['School of Law', 'Humanities Chinese + Math', 'Some programs add English evidence'],
              ['School of International Studies', 'Humanities Chinese + Math', 'Foreign languages + IR'],
              ['Academy of Arts & Design', 'Humanities Chinese + Math', 'Portfolio review additional'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**STEM Chinese track** — required by most sciences and engineering programs; tests technical Chinese for science contexts',
              '**Humanities Chinese track** — required by humanities, social sciences, law, IR, and policy programs',
              '**Math** — required by virtually all programs; the only CSCA subject everyone sits',
              '**Physics** — required by engineering, physics, CS, and some materials programs',
              '**Chemistry** — required by life sciences, chemical engineering, and pharmaceutical programs',
              '**Schwarzman College** — does NOT require CSCA; English-language program throughout; IELTS/TOEFL only',
              '**Combination locking** — once you register for a CSCA session, your subject combination is fixed',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Always verify the CSCA combination on the program\'s official admissions page before registering for a CSCA session. CS and AI programs are the most competitive at Tsinghua — target 90+ percentile in your CSCA subjects if applying.',
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
            text: 'Tsinghua\'s language requirements are program-specific. The thresholds below are planning approximations — verify on the program page. Schwarzman has higher English requirements than standard English-taught programs.',
          },
          {
            type: 'table',
            caption: 'Tsinghua language thresholds by program type (planning approximations)',
            columns: ['Program type', 'Chinese-taught — minimum', 'English-taught — minimum', 'Notes'],
            rows: [
              ['Bachelor\'s (most programs)', 'HSK 5 (≥180) or HSK 6 (≥200)', 'IELTS 6.5 / TOEFL 90', 'Most bachelor\'s are Chinese-taught'],
              ['Master\'s (Chinese-taught)', 'HSK 5 (≥200) or HSK 6 (≥220)', 'IELTS 6.0 / TOEFL 80 (as supplement)', 'Higher HSK for humanities'],
              ['Master\'s (English-taught)', 'HSK 4 (optional)', 'IELTS 6.5 / TOEFL 90', 'Most English-taught master\'s do not require HSK'],
              ['Master\'s (SEM, SPPM English track)', 'HSK 5 optional', 'IELTS 7.0 / TOEFL 100', 'Strong English required'],
              ['Schwarzman Scholars (master\'s)', 'No Chinese required', 'IELTS 7.0 / TOEFL 100 (preferred)', 'English-language program throughout'],
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
              '**Schwarzman English requirement** — higher than standard Tsinghua; IELTS 7.0 / TOEFL 100 strongly preferred; competitive Schwarzman applicants typically score above these thresholds',
              '**Chinese-taught programs** — most require HSK 5 minimum for master\'s and bachelor\'s; humanities programs often require HSK 6',
              '**English-taught programs** — most require IELTS 6.5 or TOEFL 90 minimum; competitive programs (SEM, SPPM) ask for IELTS 7.0 / TOEFL 100',
              '**Dual-language programs** — some international studies and economics programs require both HSK and IELTS/TOEFL evidence',
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
        h2: 'Scholarship stack — CSC + Tsinghua + Beijing Government + Schwarzman',
        intro:
          'How to stack scholarships for standard Tsinghua; Schwarzman is fully funded standalone.',
        blocks: [
          {
            type: 'p',
            text: 'Tsinghua admits international students regardless of funding source. For the standard Tsinghua application, apply for admission first then layer scholarships. For Schwarzman Scholars, funding is bundled — Schwarzman is fully funded standalone (tuition + dorm + stipend + airfare + laptop + insurance + course materials), so no separate scholarship application is needed.',
          },
          {
            type: 'table',
            caption: 'Tsinghua scholarship stack — what to apply for and when',
            columns: ['Scholarship', 'Coverage', 'Deadline', 'How to apply'],
            rows: [
              ['Chinese Government Scholarship (CSC)', 'Full: tuition + dorm + ¥2,500–3,500/month stipend + airfare', 'January 31 – April 15 (verify per cycle)', 'Select CSC on Tsinghua ISO portal; Tsinghua nominates to CSC'],
              ['Tsinghua University Scholarship (full)', 'Tuition waiver + dorm + monthly stipend', 'Same as admission deadline (March–May)', 'Automatic consideration or separate application via Tsinghua ISO'],
              ['Tsinghua University Scholarship (partial)', 'Tuition waiver (partial or full) OR monthly stipend', 'Same as admission deadline', 'Automatic consideration with strong application'],
              ['Beijing Government Scholarship', 'Tuition waiver + ¥3,000/month stipend (1 year, renewable)', 'April 30 (verify per cycle)', 'Apply via Beijing Education Commission; submit through Tsinghua ISO'],
              ['Schwarzman Scholars (full)', 'Tuition + dorm + stipend + airfare + laptop + insurance + course materials (full funding)', 'Late May (verify per cycle)', 'Built into the Schwarzman application at https://schwarzmanscholars.org'],
              ['Home-country government scholarships', 'Varies by country; sometimes full funding', 'Varies by country', 'Through home-country scholarship agency'],
              ['External / foundation scholarships', 'Varies; partial to full', 'Varies', 'Direct to scholarship provider'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Apply for CSC first** — CSC is the most generous single scholarship for standard Tsinghua applicants; if you get it, you have full funding including airfare and stipend',
              '**Tsinghua scholarship** — automatic for strong applicants; Tsinghua identifies scholarship-worthy applicants from the admission pool',
              '**Beijing Government scholarship** — separate application; smaller pool but adds ¥36,000/year on top of tuition waiver',
              '**Schwarzman funding** — Schwarzman is fully funded standalone; do not apply for CSC or Beijing Government scholarship if you are admitted to Schwarzman (Schwarzman covers everything)',
              '**The stacking principle** — for standard Tsinghua, multiple smaller scholarships often beat one large one because each covers different costs',
              '**Scholarship after admission** — if you are admitted self-funded, you can still apply for the Beijing Government scholarship post-admission',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'A typical fully-funded international student at Tsinghua (standard application) has CSC full + Beijing Government scholarship (top-up) + Tsinghua scholarship (top-up). For Schwarzman admittees, Schwarzman itself covers everything — no separate scholarship needed.',
          },
        ],
      },
      {
        id: 'interview-prep',
        h2: 'Interview prep — what to expect (including Schwarzman)',
        intro:
          'Most competitive master\'s and PhD programs interview; Schwarzman interviews extensively.',
        blocks: [
          {
            type: 'p',
            text: 'Tsinghua\'s interview process is program-specific. Most bachelor\'s programs do not interview; competitive master\'s programs (CS, AI, SEM, SPPM, applied math, electronic engineering) interview nearly all short-listed applicants; PhD programs always interview. Schwarzman has a distinctive multi-round interview process that is the most selective of any Tsinghua pathway.',
          },
          {
            type: 'table',
            caption: 'Tsinghua interview format by program type',
            columns: ['Program type', 'Interview format', 'Duration', 'Language'],
            rows: [
              ['Bachelor\'s (most)', 'Rare; some programs have a short online interview', '15–30 minutes', 'Chinese (Chinese-taught) or English (English-taught)'],
              ['Master\'s (most)', 'Online interview via Tencent Meeting or Zoom; panel of 2–3 faculty', '20–45 minutes', 'Chinese or English depending on program'],
              ['Master\'s (competitive — CS, AI, SEM)', 'Multi-round: technical interview + panel interview', '60–90 minutes total', 'English for SEM English track'],
              ['PhD (most)', 'Online interview; presentation of research proposal + Q&A', '45–90 minutes', 'Chinese or English depending on supervisor'],
              ['Schwarzman Scholars', 'Multi-round: video interview + 2 live interviews with faculty/alumni + final selection', '90+ minutes across multiple sessions', 'English only'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Format** — most interviews are online via Tencent Meeting or Zoom; in-person interviews at Tsinghua\'s campus are rare for international applicants',
              '**Panel** — typically 2–3 faculty members from the program; they have read your application and study plan; do not repeat content from your study plan — instead, deepen it',
              '**Common questions** — why Tsinghua? Why this program? What is your research direction? Where do you see yourself in 5 years? What unique perspective do you bring?',
              '**Academic questions** — be ready to discuss your undergraduate thesis or major projects in depth; for PhD applicants, expect questions on your research proposal',
              '**Chinese-language questions** — for Chinese-taught programs, expect at least some questions in Chinese; basic conversational proficiency is sufficient',
              '**Schwarzman interviews** — distinctive multi-round process: initial video interview, then 2 live interviews (one with Tsinghua faculty, one with Schwarzman alumni or leadership), then a final selection round; the live interviews probe leadership, global perspective, and fit with the Schwarzman community',
              '**Logistics** — confirm the interview platform 24 hours in advance; test your camera, microphone, and internet; have a backup device ready',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Schwarzman interviews are the most intensive of any Tsinghua pathway. Successful Schwarzman applicants typically have a clear leadership narrative (specific instances of leadership impact), a global perspective that connects their background to international issues, and a strong fit with the Schwarzman community of future global leaders.',
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
            text: 'Tsinghua\'s admissions review weighs academic record most heavily, but for borderline applicants the soft components decide. The profile components below are listed in rough order of importance for competitive programs; for less competitive programs, the academic record alone may suffice. Schwarzman Scholars emphasizes leadership and global perspective over raw academic credentials.',
          },
          {
            type: 'table',
            caption: 'Tsinghua competitive profile components',
            columns: ['Component', 'Weight', 'What "strong" looks like'],
            rows: [
              ['Academic record (GPA, ranking)', 'Highest', 'Top 10% of graduating class; GPA 3.5+/4.0 or equivalent'],
              ['CSCA scores', 'High', 'Target 80+ percentile in each subject; 90+ for competitive programs (CS, AI, applied math)'],
              ['Language proficiency', 'High', 'HSK 6 (≥220) for Chinese-taught; IELTS 7.0+ for English-taught; Schwarzman: IELTS 7.0+ / TOEFL 100+ preferred'],
              ['Study plan quality', 'High', 'Program-specific; clear research direction; faculty-fit awareness'],
              ['Recommendation letters', 'High', '2 letters from professors who know you academically; specific examples'],
              ['Research experience', 'Medium-high', 'Undergraduate thesis, research assistantships, publications (PhD)'],
              ['Awards and distinctions', 'Medium', 'National/international academic competitions, university awards'],
              ['Leadership (Schwarzman emphasis)', 'High (Schwarzman)', 'Documented leadership roles with measurable impact'],
              ['Global perspective (Schwarzman emphasis)', 'High (Schwarzman)', 'International experience, cross-cultural engagement, multilingual abilities'],
              ['Extracurriculars', 'Medium-low', 'Leadership, community service, cross-cultural experience'],
              ['Work experience', 'Medium (MBA, professional master\'s)', '2–5 years in relevant field for professional programs'],
              ['Fit with Tsinghua faculty', 'Medium (research programs)', 'Mention specific faculty whose work aligns with yours'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Top 10% rule** — applicants from the top 10% of their national university system have the strongest admit probability; below top 20% is difficult for competitive programs',
              '**CSCA target scores** — 80+ percentile in each subject is the typical strong range; 90+ for top programs (CS, AI, applied math)',
              '**Study plan as differentiator** — for borderline applicants, the study plan is the most leveraged document; a specific, faculty-fit-aware, program-research-direction-aligned study plan can overcome a slightly weaker academic record',
              '**Schwarzman-specific components** — leadership track record, global perspective, and fit with the Schwarzman community are weighted more heavily than academic credentials alone',
              '**Letters from known referees** — recommendation letters from professors with research relationships to Tsinghua faculty carry more weight',
              '**Research output** — for PhD applicants, a published paper significantly strengthens the application',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: 'For Schwarzman Scholars, the essays and interviews matter more than GPA. Most successful Schwarzman admittees have a clear leadership narrative (specific instances of impact), a global perspective grounded in real experience, and articulate why Tsinghua Schwarzman College specifically is the right fit for their goals.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'When does Tsinghua open applications for fall 2026?',
        a: 'The Tsinghua International Students Office portal typically opens for fall intake applications in November of the prior year. Most programs close March 31 to May 31. Schwarzman Scholars closes in late May. Verify the specific deadline on the program\'s official page.',
      },
      {
        q: 'Is the CSCA mandatory for Tsinghua in 2026?',
        a: 'Yes — from the 2026 intake, the CSCA is mandatory for international bachelor\'s degree applicants and most master\'s programs. Schwarzman Scholars does not require CSCA (English-language program throughout).',
      },
      {
        q: 'What CSCA combination does Tsinghua ask for?',
        a: 'It varies by school. Most engineering and CS programs require STEM Chinese + Math + Physics; life sciences and chemistry programs require Math + Chemistry; humanities and social sciences require Humanities Chinese + Math. SEM and SPPM often use Math + a Chinese track. Schwarzman does not require CSCA.',
      },
      {
        q: 'How does Schwarzman Scholars differ from a standard Tsinghua master\'s?',
        a: 'Schwarzman Scholars is a fully-funded, English-language master\'s in global affairs (public policy, economics, international relations) at Tsinghua Schwarzman College. It has its own application portal (https://schwarzmanscholars.org), its own late-May deadline, a more selective admit rate (~5%), and a distinctive leadership and global perspective emphasis. Schwarzman admittees do not apply for separate scholarships — Schwarzman funding is bundled.',
      },
      {
        q: 'How much does it cost to apply to Tsinghua?',
        a: 'The application fee is ¥500–¥800 per program for the standard Tsinghua ISO application. Schwarzman Scholars has a $100 application fee. Both fees are non-refundable.',
      },
      {
        q: 'Does Tsinghua interview international applicants?',
        a: 'Most bachelor\'s programs do not interview. Competitive master\'s programs (CS, AI, SEM, SPPM, applied math, electronic engineering) interview nearly all short-listed applicants. PhD programs always interview. Schwarzman has a distinctive multi-round interview process.',
      },
      {
        q: 'How competitive is Tsinghua for international students?',
        a: 'Among the most competitive in China. Master\'s admit rate is roughly 5–8%; CS, AI, and Schwarzman admit rates are below 5%. Applicants from the top 10% of their national system with strong CSCA scores and a competitive study plan have the best chance.',
      },
      {
        q: 'Can I apply for CSC and Tsinghua scholarship at the same time?',
        a: 'Yes — for standard Tsinghua, CSC and Tsinghua scholarship applications are independent. For Schwarzman, the program is fully funded standalone — do not apply for CSC if you are admitted to Schwarzman.',
      },
      {
        q: 'Does Tsinghua accept spring intake applications?',
        a: 'Some master\'s programs offer spring intake (March start); spring applications typically close October 31 of the prior year. Not all schools offer spring intake. Bachelor\'s and PhD programs generally only offer fall intake.',
      },
      {
        q: 'How do I contact the Tsinghua International Students Office?',
        a: 'Email iso@tsinghua.edu.cn or use the contact form on the Tsinghua ISO portal. The ISO responds to written inquiries in English within 3–5 business days. For program-specific questions, contact the program coordinator listed on the program\'s admissions page.',
      },
    ],
    howToSteps: [
      {
        name: 'Verify the program\'s CSCA combination and language requirements',
        text: 'Visit the Tsinghua ISO portal or https://schwarzmanscholars.org; find your target program; note the CSCA subject combination, language thresholds, and any program-specific tests. Plan your CSCA session and language test around this combination.',
      },
      {
        name: 'Sit the CSCA early enough for fall intake',
        text: 'For a September 2026 intake, target the earliest viable CSCA session. CSC channel closes January 31 to April 15; competitive master\'s close January–March. A winter or early-spring CSCA session gives you the most flexibility.',
      },
      {
        name: 'Prepare the application package',
        text: 'Passport, transcripts (notarized translation), 800–1,500-word study plan, 2 recommendation letters from academic referees, language test, CV, publications (PhD), application fee, physical examination form. Schwarzman additionally requires 3 essays, 3 recommendation letters, and a 2-minute video introduction.',
      },
      {
        name: 'Apply online through the Tsinghua ISO portal (or Schwarzman)',
        text: 'Submit the standard application at the Tsinghua ISO portal before the program deadline. For Schwarzman, apply at https://schwarzmanscholars.org by the late-May deadline. Save confirmation emails.',
      },
      {
        name: 'Apply for scholarships in parallel (standard Tsinghua only)',
        text: 'For standard Tsinghua, submit CSC scholarship application through the Tsinghua ISO portal (CSC channel closes January–April). Apply for the Tsinghua scholarship (automatic consideration) and Beijing Government scholarship (separate application, April 30). Schwarzman is fully funded standalone.',
      },
      {
        name: 'Prepare for the interview (where applicable)',
        text: 'Competitive master\'s and PhD programs interview. Schwarzman has multi-round interviews. Prepare for academic questions on your study plan, Chinese-language questions if relevant, and program-specific questions. Confirm the interview platform 24 hours in advance and test your equipment.',
      },
    ],
    ctaTitle: 'Applying to Tsinghua University?',
    ctaSubtitle:
      'SICA counselors verify your target program\'s CSCA combination and language requirements, refine your study plan to match Tsinghua faculty research, coordinate CSC + Tsinghua + Beijing Government scholarship applications, and (for Schwarzman applicants) provide guidance on the essay + video components. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/tsinghua-university',
        label: 'Tsinghua University profile',
        description: 'Schools, signature programs, history, scholarships, cost of attendance.',
      },
      {
        href: '/csca-exam',
        label: 'CSCA exam — complete guide',
        description: 'The exam that determines what subject combinations you can apply with.',
      },
      {
        href: '/csca-english-taught-programs',
        label: 'CSCA for English-taught programs',
        description: 'What English-taught candidates (including Schwarzman-style applicants) still sit.',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: 'Chinese Government Scholarship (CSC)',
        description: 'The full-funding scholarship path for Tsinghua and most Chinese universities.',
      },
    ],
  },
  zh: {
    slug: 'tsinghua-university-admissions-guide',
    eyebrow: '申请深度指南',
    title: '清华大学申请——国际生逐步指南',
    description:
      '如何以国际生身份申请清华大学：申请渠道、截止日期、材料清单、各院系 CSCA 组合、语言要求、奖学金组合、苏世民学者路径，以及申请者的竞争画像。',
    subtitle:
      '清华大学通过基于学习计划的招生流程（2026 起 CSCA 必考）招收国际本科生与硕士生。除清华 ISO 门户的标准路径外，苏世民学者硕士项目运行独立的全球申请流程，有自己的截止日期与要求。本指南覆盖清华标准申请与苏世民两条路径：渠道、截止、材料清单、清华各院系所要求的 CSCA 组合、语言门槛（HSK / 雅思 / 托福）、清华 + CSC + 北京市政府奖学金组合、苏世民特定的申请时间线、清华面试内容，以及让擦边申请者转录的画像要素。',
    stats: [
      { value: '约 5-8%', label: '典型国际硕士录取率' },
      { value: '3-5月', label: '秋季入学主要截止' },
      { value: '是', label: '苏世民学者（独立项目）' },
      { value: '是', label: '2026 起 CSCA 必考' },
    ],
    quickAnswer:
      '清华通过三条渠道招收国际生——通过清华国际学生办公室（ISO）门户直接申请、CSC 奖学金渠道（通过清华作为接收单位）、以及苏世民学者硕士项目（独立的全球申请，5 月底截止）。2026 年 9 月入学的主要截止日期为 3 月 31 日至 5 月 31 日。2026 起 CSCA 必考。所需材料：护照、成绩单、800-1,500 字学习计划、2 封推荐信（副教授及以上）、语言成绩（中文授课要 HSK 5+；英文授课要雅思 6.5+ / 托福 90+）、¥500-800 申请费。申请入口：https://www.tsinghua.edu.cn——ISO 门户服务所有渠道；苏世民独立门户 https://schwarzmanscholars.org。',
    keyTakeaways: [
      '三条申请渠道：清华 ISO 直申、CSC 通过清华、苏世民学者（独立的全球申请）',
      '秋季入学主要截止：多数项目 3 月 31 日；热门硕士 1-3 月截止；苏世民 5 月底截止',
      '2026 起 CSCA 必考；工科与计算机项目通常要求理工中文 + 数学 + 物理',
      '苏世民学者：全额资助、英语授课的全球事务硕士；全球最激烈的项目之一（约 5% 录取率）；独立申请 https://schwarzmanscholars.org',
      '申请材料：护照、成绩单（公证翻译件）、800-1,500 字学习计划、2 封推荐信、语言成绩、申请费',
      '奖学金组合：CSC（全额）+ 清华自有奖学金 + 北京市政府奖学金；苏世民独立全额资助（学费 + 住宿 + 津贴 + 机票 + 笔记本）',
    ],
    sections: [
      {
        id: 'overview',
        h2: '清华录取概览',
        intro:
          '2026 年清华国际生录取全貌。',
        blocks: [
          {
            type: 'p',
            text: '清华大学通过国际学生办公室（ISO）处理国际申请，ISO 运营统一门户 https://www.tsinghua.edu.cn。2026 年起，CSCA 是国际本科生与多数硕士项目的必考。清华国际硕士申请者录取率约 5-8%，最热门项目（计算机、AI、电气工程、应用数学、苏世民）录取率低于 5%。苏世民学者项目是清华全额资助、英语授课的全球事务硕士（公共政策、经济学、国际关系），独立门户、5 月底截止——是清华最激烈的路径，也是全球最激烈的之一。',
          },
          {
            type: 'callout',
            tone: 'info',
            text: '清华 ISO 在 3-5 个工作日内以英文回复书面问询。邮件 iso@tsinghua.edu.cn，或在清华 ISO 门户联系表单提交。',
          },
        ],
      },
      {
        id: 'application-routes',
        h2: '申请渠道——三条路含苏世民',
        intro:
          '三条路通向清华；苏世民路径是独立项目。',
        blocks: [
          {
            type: 'p',
            text: '清华标准 ISO 门户服务两条渠道（直接申请 + CSC 奖学金）。苏世民学者运行独立的全球申请，有自己的截止与独立门户，是清华申请最激烈的路径。在标准清华申请与苏世民之间选择是第一步决定——两者服务不同学生画像。',
          },
          {
            type: 'table',
            caption: '清华申请渠道对比',
            columns: ['渠道', '运作方式', '适合人群', '截止日期'],
            rows: [
              ['清华 ISO 直接申请（自费）', '通过清华 ISO 门户申报并声明自费', '标准本科或硕士申请者；不申请 CSC 者', '多数项目 3 月 31 日 - 5 月 31 日'],
              ['CSC 渠道（通过清华）', '在清华 ISO 门户勾选 CSC；清华提名至 CSC', '申请全额 CSC 资助者', '1 月 31 日 - 4 月 15 日'],
              ['苏世民学者（独立全球项目）', '通过 https://schwarzmanscholars.org 全球申请', '激烈竞争的申请者申请英语授课全球事务硕士', '5 月底（按当年通知）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**清华 ISO 直接申请**——自费申请者的标准路径；可申请清华自有奖或北京市政府奖',
              '**CSC 渠道**——全额奖学金路径；勾选 CSC；清华 ISO 向 CSC 提名',
              '**苏世民学者**——清华苏世民学院全额资助、英语授课的全球事务硕士；全球最激烈的项目之一（约 5% 录取率）；独立门户 https://schwarzmanscholars.org；覆盖学费 + 住宿 + 津贴 + 机票 + 笔记本',
              '**联合 / 双学位项目**——部分清华联合项目有独立申请门户（如清华-华盛顿大学全球创新交换、清华-伯克利联合项目）；直接看项目页',
              '**实务建议**——多数国际申请者用清华 ISO 直接渠道；苏世民申请者应将苏世民申请视为主要精力来源',
              '**苏世民申请资格**——学士学位或同等学历；18 岁以上；英语水平（雅思 7.0+ 或托福 100+）；领导力履历；强学业成绩',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '苏世民学者是独立项目——申请苏世民不需要另填清华 ISO 申请。苏世民录取者自动入读清华苏世民学院。苏世民申请入口 https://schwarzmanscholars.org。',
          },
        ],
      },
      {
        id: 'deadlines',
        h2: '截止日期——秋季入学窗口 + 苏世民 5 月底',
        intro:
          '秋季入学是主窗口；苏世民 5 月底截止。',
        blocks: [
          {
            type: 'p',
            text: '清华秋季入学（2026 年 9 月）的主要截止窗口为 3 月 31 日至 5 月 31 日，热门项目最早 1 月 31 日截止。苏世民学者截止在 5 月底（次年 9 月入学）——比标准硕士晚，因为苏世民运行独立的全球招生周期。',
          },
          {
            type: 'table',
            caption: '清华入学窗口（规划近似值——以项目页为准）',
            columns: ['入学', '项目', '主要截止', '说明'],
            rows: [
              ['2026 秋（9 月入学）', '本科、多数硕士、多数博士', '3 月 31 日 - 5 月 31 日', '多数项目 4-5 月截止'],
              ['2026 秋——热门硕士', 'CS、AI、电气工程、应用数学', '1 月 31 日 - 3 月 15 日', '顶尖项目截止更早'],
              ['2026 秋——CSC 渠道', '多数项目', '1 月 31 日 - 4 月 15 日', '早于直接申请'],
              ['苏世民学者（2026 秋）', '苏世民学院全球事务硕士', '5 月底（按当年通知）', '独立门户 https://schwarzmanscholars.org'],
              ['2027 春（限部分）', '部分硕士（按院系）', '2026 年 10 月 31 日', '并非所有院系都有春季入学'],
              ['博士（PhD）', '多数院系', '3 月 31 日 - 5 月 31 日', '部分院系滚动评审'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**标准截止**——多数硕士与本科项目 3 月 31 日 - 5 月 31 日截止；建议 4 月 15 日前提交留出修改时间',
              '**热门硕士**——CS、AI、电气、应用数学 1 月 31 日 - 3 月 15 日截止；尽早提交',
              '**CSC 渠道**——比直接渠道截止更早（1-4 月）；如走 CSC，瞄准早期 CSC 截止',
              '**苏世民截止**——5 月底；比标准硕士晚；苏世民申请强度大（文书 + 推荐 + 视频），建议提前 6-8 周启动',
              '**春季入学**——仅部分院系；前一年 10 月 31 日截止；按项目核验',
              '**逾期不候**——清华不接受任何情况的逾期申请',
              '**推荐信**——提前 4-6 周联系推荐人；苏世民要 3 封（标准清华要 2 封）',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '苏世民学者 5 月底截止固定但申请强度大。多数成功苏世民申请者提前 2-3 个月启动。申请含 3 篇文书、3 封推荐信、1 个视频自我介绍、多轮面试。',
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
            text: '清华对申请材料要求严格——材料缺失或格式不符是申请在学术评审前被拒的最常见原因。苏世民在标准材料包之外有额外要求（3 篇文书、视频自我介绍、3 封推荐信）。',
          },
          {
            type: 'table',
            caption: '清华标准申请材料清单',
            columns: ['材料', '具体要求', '格式', '需要翻译？'],
            rows: [
              ['护照', '有效期 1 年以上；个人信息页清晰彩色扫描', 'PDF，<5 MB', '否'],
              ['高中毕业证书 / 本科学位证', '原件 + 公证翻译（非中英文）', 'PDF，彩色扫描', '非中英文要'],
              ['成绩单', '全部学年；原件或公证翻译；GPA 可见', 'PDF，彩色扫描', '非中英文要'],
              ['学习计划', '800-1,500 字中文（中文授课）或英文（英文授课）；按项目', 'PDF，≤2 MB', '用授课语言'],
              ['推荐信', '硕士 2 封讲师及以上；博士 2 封副教授及以上', 'PDF，抬头纸，签字', '可选英文翻译'],
              ['语言——中文授课', 'HSK 5 或 6（按项目）；2 年有效', 'PDF 成绩单扫描', '否'],
              ['语言——英文授课', '雅思 6.5+ / 托福 90+；2 年有效；母语者可能免', 'PDF 成绩单扫描', '否'],
              ['申请费', '¥500-800 / 项目；不退', '在线支付', '否'],
              ['护照照片', '近期；白底；正面', 'JPG，<500 KB', '否'],
              ['体检表', '清华规定表格；执业医师填写', 'PDF，签字盖章', '可接受英文翻译'],
              ['CV / 简历', '学术 CV；教育、奖项、发表、研究', 'PDF，1-2 页', '用授课语言'],
              ['发表（博士申请者）', '已发表论文、毕业论文或研究成果', 'PDF', '可选英文翻译'],
              ['无犯罪记录证明', '本国警察出具；6 个月内', 'PDF，公证', '非中英文要'],
              ['经济证明', '银行流水一年 ¥80,000+ OR 奖学金证明', 'PDF', '可接受英文翻译'],
            ],
          },
          {
            type: 'table',
            caption: '苏世民学者——额外要求',
            columns: ['材料', '具体要求', '格式', '说明'],
            rows: [
              ['3 篇文书', '领导力文书、职业目标文书、全球视野文书；每篇约 750 字', '在线文本提交', '严格字数限制'],
              ['视频自我介绍', '2 分钟个人介绍；音画清晰', '视频上传（MP4）', '无需专业制作'],
              ['3 封推荐信', '来自上司、教授或导师，能评价领导力与学术能力', '在线表单', '清华 ISO 门户仅要 2 封；苏世民要 3 封'],
              ['简历 / CV', '详尽 CV 含领导力角色、奖项、国际经历', 'PDF，2-3 页', '苏世民更重领导力'],
              ['英语水平', '雅思 7.0+ / 托福 100+（优先）；母语者可能免', 'PDF 扫描', '高于标准清华（6.5/90）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**翻译要求**——非中英文材料须公证翻译；用认证翻译服务',
              '**推荐信**——推荐人应为学术；清华偏好能评价你研究或学术能力的教授',
              '**学习计划**——最重要的非学术材料；清华仔细阅读评估契合度、动机与研究方向',
              '**苏世民文书**——苏世民申请中权重最大的部分；写作质量与自我反思比资历更重要',
              '**苏世民视频**——真实性重要；不要用专业视频制作；清华录取委员会想看到真实的你',
              '**体检**——使用清华规定表格；签字盖章',
              '**经济证明**——银行流水显示 ¥80,000+ 可用资金；如有奖学金可用奖学证书替代',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '苏世民学者的 3 篇文书与视频自我介绍是权重最大的部分。多数成功申请者单独花 4-8 周写文书。文书问领导力、职业目标、全球视野——没有"正确答案"，但具体性与自我反思有加分。',
          },
        ],
      },
      {
        id: 'csca-strategy',
        h2: 'CSCA 策略——清华各院系要求',
        intro:
          'CSCA 组合按院系不同。按项目核验。',
        blocks: [
          {
            type: 'p',
            text: '清华不发布 CSCA 组合的统一总表。每个院系在项目页公布所需组合。下表是近期申请周期的典型模式——但官方来源始终是项目当年录取页。',
          },
          {
            type: 'table',
            caption: '清华各院系典型 CSCA 组合（按项目核验）',
            columns: ['院系 / 项目族', '常见 CSCA 组合', '说明'],
            rows: [
              ['计算机系（CS、AI、软件）', '理工中文 + 数学 + 物理', '量化重；CS 是最激烈的项目'],
              ['电子工程系', '理工中文 + 数学 + 物理', '同 CS 筛选'],
              ['自动化系', '理工中文 + 数学 + 物理', '信号系统 + 控制论'],
              ['机械工程系', '理工中文 + 数学 + 物理', '机械 + 材料侧重'],
              ['材料科学系', '理工中文 + 数学 + 物理', '部分项目加化学'],
              ['化学工程系', '数学 + 化学', '过程工程侧重'],
              ['土木工程系', '理工中文 + 数学 + 物理', '结构 + 环境'],
              ['航天航空学院', '理工中文 + 数学 + 物理', '航天 + 推进'],
              ['电气工程系', '理工中文 + 数学 + 物理', '电力 + 电子'],
              ['生命科学学院', '数学 + 化学', '部分项目加生物'],
              ['药学院', '数学 + 化学', '药物化学侧重'],
              ['物理系', '理工中文 + 数学 + 物理', '物理研究必需'],
              ['数学系', '理工中文 + 数学 + 物理', '数学研究必需'],
              ['化学系', '数学 + 化学', '部分项目加物理'],
              ['经济管理学院（SEM）', '数学 +（人文或理工中文）', '量化重；部分项目免中文轨'],
              ['公共管理学院（SPPM）', '数学 + 人文中文', '政策 + 管理侧重'],
              ['苏世民学院', '不要求 CSCA', '全程英语授课；只需雅思/托福'],
              ['人文学院（文学、历史、哲学）', '人文中文 + 数学', '学习计划常决定结果'],
              ['社会科学学院', '人文中文 + 数学', '部分项目加英语成绩'],
              ['法学院', '人文中文 + 数学', '部分项目加英语成绩'],
              ['国际关系学院', '人文中文 + 数学', '外国语言 + IR'],
              ['美术学院', '人文中文 + 数学', '作品集评审额外'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**理工中文轨**——多数理工科项目要求；测试科学语境下的技术中文',
              '**人文中文轨**——人文、社科、法学、国关、政策项目要求',
              '**数学**——几乎所有项目要求；唯一人人必考的 CSCA 科目',
              '**物理**——工科、物理、CS、部分材料项目要求',
              '**化学**——生命科学、化工、药学项目要求',
              '**苏世民学院**——不要求 CSCA；全程英语授课；只需雅思/托福',
              '**组合锁定**——CSCA 报名后科目组合固定；更改需重新报名再付费',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '报名 CSCA 场次前务必在项目官方录取页核验当年科目组合。CS 与 AI 项目是清华最激烈的——申请的话目标 90+ 百分位。',
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
            text: '清华语言要求因项目而异。以下门槛为规划近似值——以项目页为准。苏世民比标准英文项目要求更高。',
          },
          {
            type: 'table',
            caption: '清华语言门槛（按项目类型，规划近似值）',
            columns: ['项目类型', '中文授课最低', '英文授课最低', '说明'],
            rows: [
              ['本科（多数）', 'HSK 5（≥180）或 HSK 6（≥200）', '雅思 6.5 / 托福 90', '多数本科中文授课'],
              ['硕士（中文授课）', 'HSK 5（≥200）或 HSK 6（≥220）', '雅思 6.0 / 托福 80（补充）', '人文项目 HSK 更高'],
              ['硕士（英文授课）', 'HSK 4（可选）', '雅思 6.5 / 托福 90', '多数英文硕士不需 HSK'],
              ['硕士（SEM、SPPM 英文轨）', 'HSK 5 可选', '雅思 7.0 / 托福 100', '英文强要求'],
              ['苏世民学者（硕士）', '不要求中文', '雅思 7.0 / 托福 100（优先）', '全程英语授课'],
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
              '**苏世民英文要求**——高于标准清华；雅思 7.0 / 托福 100 强烈优先；竞争申请者通常超过门槛',
              '**中文授课项目**——多数要求本科与硕士 HSK 5 最低；人文项目常要求 HSK 6',
              '**英文授课项目**——多数要求雅思 6.5 或托福 90 最低；热门项目（SEM、SPPM）要求雅思 7.0 / 托福 100',
              '**双语项目**——部分国际研究与经济项目同时要求 HSK 与雅思/托福',
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
        h2: '奖学金组合——CSC + 清华 + 北京市政府 + 苏世民',
        intro:
          '如何叠加奖学金申请标准清华；苏世民独立全额资助。',
        blocks: [
          {
            type: 'p',
            text: '清华录取国际生不分资金来源。标准清华申请者先申请入学再叠加奖学金。苏世民学者资金是捆绑的——苏世民独立全额资助（学费 + 住宿 + 津贴 + 机票 + 笔记本 + 保险 + 课程材料），无需单独申请奖学金。',
          },
          {
            type: 'table',
            caption: '清华奖学金组合——申请什么、何时申请',
            columns: ['奖学金', '覆盖', '截止', '申请方式'],
            rows: [
              ['中国政府奖学金（CSC）', '全额：学费 + 住宿 + ¥2,500-3,500/月 + 机票', '1 月 31 日 - 4 月 15 日', '在清华 ISO 门户勾选 CSC；清华提名至 CSC'],
              ['清华奖学金（全额）', '学费减免 + 住宿 + 月津贴', '与录取截止相同（3-5 月）', '自动评审或单独申请'],
              ['清华奖学金（部分）', '学费减免（部分或全额）OR 月津贴', '与录取截止相同', '强申请自动评审'],
              ['北京市政府奖学金', '学费减免 + ¥3,000/月（1 年，可续）', '4 月 30 日', '通过北京市教委；通过清华 ISO 提交'],
              ['苏世民学者（全额）', '学费 + 住宿 + 津贴 + 机票 + 笔记本 + 保险 + 课程材料', '5 月底', '苏世民申请自带 https://schwarzmanscholars.org'],
              ['本国政府奖学金', '按国家不同；有时全额', '按国家不同', '通过本国奖学金机构'],
              ['外部 / 基金会奖学金', '部分至全额不等', '不定', '直接申请提供方'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**优先申请 CSC**——CSC 是标准清华申请者最慷慨的单项奖学金',
              '**清华奖学金**——强申请者自动；清华从录取池中识别值得奖学金的申请者',
              '**北京市政府奖学金**——单独申请；与清华奖学金叠加',
              '**苏世民资助**——苏世民独立全额资助；录取后不要申请 CSC 或北京市政府奖（苏世民已覆盖全部）',
              '**叠加原则**——标准清华多笔小额常胜一笔大额',
              '**录取后申请**——自费录取后仍可申请北京市政府奖与外部奖学金',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '典型全额资助国际生在清华（标准申请）：CSC 全额 + 北京市政府奖加给 + 清华奖加给。苏世民录取者由苏世民本身覆盖全部开销——无需单独奖学金申请。',
          },
        ],
      },
      {
        id: 'interview-prep',
        h2: '面试准备——会问什么（含苏世民）',
        intro:
          '多数热门硕士与博士项目面试；苏世民面试密度最高。',
        blocks: [
          {
            type: 'p',
            text: '清华面试因项目而异。多数本科项目不面试；热门硕士（CS、AI、SEM、SPPM、应用数学、电气工程）几乎面试所有候选；博士一律面试。苏世民有独特的多轮面试流程，是清华路径中最具选择性的。',
          },
          {
            type: 'table',
            caption: '清华面试形式（按项目类型）',
            columns: ['项目类型', '面试形式', '时长', '语言'],
            rows: [
              ['本科（多数）', '罕见；部分项目有简短在线面试', '15-30 分钟', '中文（中文授课）或英文（英文授课）'],
              ['硕士（多数）', '在线面试通过腾讯会议或 Zoom；2-3 位教师组', '20-45 分钟', '中文或英文按项目'],
              ['硕士（热门——CS、AI、SEM）', '多轮：技术面试 + 教师组面试', '合计 60-90 分钟', 'SEM 英文轨用英文'],
              ['博士（多数）', '在线面试；研究计划陈述 + Q&A', '45-90 分钟', '中文或英文按导师'],
              ['苏世民学者', '多轮：视频面试 + 2 场现场面试（教师 + 校友）+ 最终决选', '90+ 分钟跨多场', '仅英文'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**形式**——多数面试在线通过腾讯会议或 Zoom；校园内线下面试对国际生少见',
              '**面试组**——通常 2-3 位项目教师；他们已读过你的申请与学习计划；不要重复学习计划内容——而要深化',
              '**常见问题**——为什么选清华？为什么选这个项目？研究方向？五年后规划？独特视角？',
              '**学术问题**——准备好深入讨论本科毕业论文或主要项目；博士申请者预期被问研究计划',
              '**中文问题**——中文授课项目预期至少部分中文问题',
              '**苏世民面试**——独特多轮流程：初轮视频面试，然后 2 场现场面试（一场清华教师、一场苏世民校友或领导），最终决选；现场面试考察领导力、全球视野、与苏世民社区的契合度',
              '**后勤**——提前 24 小时确认面试平台；测试摄像头、麦克风、网络；备好备用设备',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '苏世民面试是清华路径中最具压力的。成功苏世民申请者通常有清晰的领导力叙事（具体的影响力实例）、基于真实经历的全球视野、与苏世民全球未来领袖社区的强契合。',
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
            text: '清华录取评审最看重学业成绩，但擦边申请者由软要素决定。以下画像要素按热门项目的大致重要性排序；非热门项目单凭学业成绩即可。苏世民学者更看重领导力与全球视野而非纯粹的学业资历。',
          },
          {
            type: 'table',
            caption: '清华竞争画像要素',
            columns: ['要素', '权重', '"强"长什么样'],
            rows: [
              ['学业成绩（GPA、排名）', '最高', '毕业班前 10%；GPA 3.5+/4.0'],
              ['CSCA 成绩', '高', '各科目标 80+ 百分位；热门项目（CS、AI、应用数学）90+'],
              ['语言水平', '高', '中文授课 HSK 6（≥220）；英文授课雅思 7.0+；苏世民雅思 7.0+ / 托福 100+ 优先'],
              ['学习计划质量', '高', '按项目；清晰研究方向；体现对师资的了解'],
              ['推荐信', '高', '2 封了解你学术的教授；具体例子'],
              ['研究经历', '中-高', '本科论文、研究助理、发表（博士）'],
              ['奖项荣誉', '中', '国家级 / 国际学术竞赛、大学奖项'],
              ['领导力（苏世民侧重）', '高（苏世民）', '有可衡量影响的具体领导力角色'],
              ['全球视野（苏世民侧重）', '高（苏世民）', '国际经历、跨文化参与、多语言能力'],
              ['课外活动', '中-低', '领导力、社区服务、跨文化经历'],
              ['工作经验', '中（MBA、专业硕士）', '专业项目相关领域 2-5 年'],
              ['与清华师资契合度', '中（研究项目）', '提到与你研究一致的具体教师'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**前 10% 规则**——本国前 10% 申请者录取概率最强；低于前 20% 在热门项目较难',
              '**CSCA 目标分**——80+ 百分位为典型强线；CS、AI、应用数学 90+',
              '**学习计划作为差异化因素**——擦边申请者最高杠杆',
              '**苏世民特定要素**——领导力履历、全球视野、与苏世民社区契合比学业资历权重更高',
              '**来自知名推荐人的信**——与清华教师有研究关系的教授推荐信权重更大',
              '**研究产出**——博士申请者发表过论文显著加分',
            ],
          },
          {
            type: 'callout',
            tone: 'success',
            text: '苏世民学者申请，文书与面试比 GPA 更重要。多数成功苏世民录取者有清晰的领导力叙事（具体的影响力实例）、基于真实经历的全球视野、能清晰说明为何清华苏世民学院是契合其目标的最佳选择。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '清华什么时候开放 2026 年秋季入学申请？',
        a: '清华国际学生办公室门户通常在前一年 11 月开放秋季入学申请。多数项目 3 月 31 日 - 5 月 31 日截止。苏世民学者 5 月底截止。以项目官方页为准。',
      },
      {
        q: '2026 年清华 CSCA 必考吗？',
        a: '是——2026 年起，国际本科生必须考 CSCA；多数硕士项目也要求。苏世民学者不要求 CSCA（全程英语授课）。',
      },
      {
        q: '清华要求哪些 CSCA 组合？',
        a: '按院系不同。多数工科与 CS 项目要求理工中文 + 数学 + 物理；生命科学与化学项目要求数学 + 化学；人文与社科要求人文中文 + 数学。SEM 与 SPPM 常用数学 + 中文轨。苏世民不要求 CSCA。',
      },
      {
        q: '苏世民学者与标准清华硕士有什么不同？',
        a: '苏世民学者是清华苏世民学院全额资助、英语授课的全球事务硕士（公共政策、经济学、国际关系）。独立申请门户 https://schwarzmanscholars.org，5 月底截止，录取率约 5%，侧重领导力与全球视野。苏世民录取者不需另申奖学金——苏世民资金捆绑。',
      },
      {
        q: '申请清华要多少钱？',
        a: '标准清华 ISO 申请费每项目 ¥500-800。苏世民学者申请费 $100。两者均不退。',
      },
      {
        q: '清华面试国际生吗？',
        a: '多数本科项目不面试。热门硕士（CS、AI、SEM、SPPM、应用数学、电气）几乎面试所有候选。博士一律面试。苏世民有独特的多轮面试流程。',
      },
      {
        q: '清华对国际生录取竞争多大？',
        a: '中国最激烈之一。硕士录取率约 5-8%；CS、AI、苏世民录取率低于 5%。本国前 10%、CSCA 强分、竞争性学习计划的申请者机会最大。',
      },
      {
        q: '可以同时申请 CSC 与清华奖学金吗？',
        a: '可以——标准清华申请中 CSC 与清华奖学金申请相互独立。苏世民录取后不要再申请 CSC（苏世民已全额资助）。',
      },
      {
        q: '清华接受春季入学申请吗？',
        a: '部分硕士项目提供春季入学（3 月开始）；春季申请通常前一年 10 月 31 日截止。并非所有院系都有春季入学——查项目页。本科与博士一般仅秋季入学。',
      },
      {
        q: '怎么联系清华国际学生办公室？',
        a: '邮件 iso@tsinghua.edu.cn 或清华 ISO 门户联系表单。ISO 在 3-5 个工作日内以英文回复书面问询。程序性问题联系项目页列出的项目协调员。',
      },
    ],
    howToSteps: [
      {
        name: '核验项目的 CSCA 组合与语言要求',
        text: '访问清华 ISO 门户或 https://schwarzmanscholars.org；找到目标项目；记录 CSCA 科目组合、语言门槛、项目特有考试。围绕这个组合规划 CSCA 场次与语言考试。',
      },
      {
        name: '早点考 CSCA 配合秋季入学',
        text: '2026 年 9 月入学瞄准最早可行 CSCA 场次。CSC 渠道 1 月 31 日 - 4 月 15 日截止；热门硕士 1-3 月截止。冬季或早春场次给你最大灵活。',
      },
      {
        name: '准备申请材料',
        text: '护照、成绩单（公证翻译件）、800-1,500 字学习计划、2 封学术推荐信、语言考试、CV、发表（博士）、申请费、体检表。苏世民额外要 3 篇文书、3 封推荐信、2 分钟视频自我介绍。',
      },
      {
        name: '通过清华 ISO 门户（或苏世民）网上申请',
        text: '标准申请在清华 ISO 门户项目截止前提交。苏世民在 https://schwarzmanscholars.org 5 月底截止前提交。保存确认邮件。',
      },
      {
        name: '并行申请奖学金（仅标准清华）',
        text: '标准清华：通过清华 ISO 门户提交 CSC 申请（CSC 渠道 1-4 月截止）；申请清华奖学金（自动评审）与北京市政府奖（单独，4 月 30 日截止）。苏世民本身全额资助。',
      },
      {
        name: '为面试做准备（如适用）',
        text: '热门硕士与博士要面试。苏世民多轮面试。准备学术问题（你的学习计划与研究方向）、中文问题（如适用）、项目相关问题。提前 24 小时确认面试平台并测试设备。',
      },
    ],
    ctaTitle: '正在申请清华大学？',
    ctaSubtitle:
      'SICA 顾问核验目标项目的 CSCA 组合与语言要求、优化学习计划以匹配清华教师研究、协调 CSC + 清华 + 北京市政府奖学金申请，并对苏世民申请者提供文书与视频组件指导。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/tsinghua-university',
        label: '清华大学简介',
        description: '院系、特色项目、历史、奖学金、留学费用。',
      },
      {
        href: '/csca-exam',
        label: 'CSCA 考试完全指南',
        description: '决定你能拿什么科目组合去申请的那场考试。',
      },
      {
        href: '/csca-english-taught-programs',
        label: '英文授课项目的 CSCA',
        description: '英文授课考生（含苏世民式申请者）仍要考什么。',
      },
      {
        href: '/chinese-government-scholarship-csc',
        label: '中国政府奖学金（CSC）',
        description: '清华与多数中国大学的全额资助奖学金路径。',
      },
    ],
  },
};
