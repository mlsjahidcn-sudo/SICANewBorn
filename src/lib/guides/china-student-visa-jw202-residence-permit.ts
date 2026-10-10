import type { LocalizedGuide } from './types';

/**
 * "China student visa: X1 vs X2, JW202, and the residence permit" —
 * deep operational guide. Target queries: "china student visa",
 * "x1 visa china", "x2 visa china", "jw202 form china", "residence
 * permit china student", "china student visa JW201".
 *
 * Different angle from /x1-vs-x2-student-visa-china (which is a
 * short summary) and /guides/visa (the general process guide). This
 * page is the operational deep-dive on the JW202 form itself, the
 * 30-day residence permit conversion, biometrics, extensions, and
 * common rejection reasons.
 */
export const chinaVisaJw202Guide: LocalizedGuide = {
  en: {
    slug: 'china-student-visa-jw202-residence-permit',
    eyebrow: 'GUIDE · CHINA VISA',
    title: 'China Student Visa: X1 vs X2, the JW202 Form, and the Residence Permit (2027)',
    description:
      'The X1 vs X2 student visa decision (180-day rule), the JW202 form (what it is, who issues it, when it arrives), the 30-day residence permit conversion after arrival, biometrics at the Public Security Bureau, extensions, dependents (spouse + child rules), and the most common rejection reasons for the application.',
    subtitle:
      'The China student visa has two flavors — X1 for programs longer than 180 days (almost every bachelor\'s, master\'s, PhD, and language program that\'s a year or longer) and X2 for short programs. Behind the X1 is the JW202 form, an official Chinese government document your host university issues. After you land, the 30-day residence permit conversion is the step where students fail the most often. This guide walks every step — from the X1/X2 decision through the JW202 arrival, biometrics, residence permit, and renewal — with the operational details that the official pages leave out.',
    stats: [
      { value: 'X1 vs X2', label: '180-day rule decides which' },
      { value: '30 days', label: 'Window to convert X1 → residence permit' },
      { value: 'JW202', label: 'Form from host university' },
      { value: '¥400–800', label: 'Visa fee (single entry)' },
    ],
    quickAnswer:
      'For any program longer than 180 days, you need the X1 student visa. The X2 is only for short programs (language summer schools, exchanges of a few weeks, executive short courses). The X1 is paired with a JW202 form that the host Chinese university issues after you accept the admission — you need the original JW202 to apply for the X1 visa at your local Chinese embassy or consulate. After arrival in China, you have 30 days to convert the X1 visa into a residence permit at the local Public Security Bureau exit-entry office — this is the step where most international students run into issues. The whole process takes 2-6 weeks from admission to arrival + 1-2 hours at the PSB on day 1-30 for biometrics and the residence permit card.',
    keyTakeaways: [
      'X1 is for programs > 180 days; X2 is for short programs (language summer, exchanges). Bachelor\'s, master\'s, PhD = X1',
      'The JW202 form is issued by your host Chinese university after you accept admission — you need the original for the X1 visa application',
      'Apply for the X1 visa at your local Chinese embassy or consulate; processing typically 5-10 working days',
      'The X1 visa is single-entry or multiple-entry (request multi-entry if you plan to leave and re-enter China during your studies)',
      'Within 30 days of arrival, convert the X1 to a residence permit at the local Public Security Bureau (PSB) exit-entry office',
      'The residence permit is valid for the duration of your program (1 year for language, 2-5 years for degree programs, renewable)',
      'For CSC scholars, the JW201 form is issued (different from JW202) — the process is the same but the form number differs',
      'Dependents (spouse + minor children) qualify for the S1 / S2 family visa category, not the student visa; the dependent visa requires additional documents',
    ],
    sections: [
      {
        id: 'x1-vs-x2',
        h2: 'X1 vs X2 — the 180-day rule that decides everything',
        intro:
          'The X1 / X2 decision is purely a duration question. Most international students at degree programs get the X1; only short-term students get the X2.',
        blocks: [
          {
            type: 'table',
            caption: 'X1 vs X2 — duration, eligibility, and what you can do with each',
            columns: ['Dimension', 'X1 student visa', 'X2 student visa'],
            rows: [
              ['Program duration', '> 180 days', '≤ 180 days'],
              ['Typical use case', 'Bachelor\'s, master\'s, PhD, 1-year+ language programs, visiting scholar (1+ year)', 'Language summer (4-12 weeks), short exchange, executive short course'],
              ['Validity', 'Up to 5 years (matches program duration; usually 1-5 years)', 'Up to 180 days (matches the program length)'],
              ['Entries', 'Single-entry or multiple-entry (request multi-entry at the embassy)', 'Single-entry'],
              ['Residence permit required after arrival?', 'YES — convert within 30 days of arrival', 'NO — the X2 itself covers the stay'],
              ['Can I work?', '≤ 20 hours/week on campus (X1)', 'Generally no work permitted (X2)'],
              ['Can I bring dependents?', 'Yes (spouse + minor children via S1 / S2)', 'Generally no (program too short)'],
              ['Exit and re-enter during studies?', 'Multiple-entry allows this; single-entry requires a re-entry permit', 'Generally no (single-entry + short stay)'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**When in doubt, X1 is the safer choice** — Chinese embassies typically issue X1 for any degree program regardless of actual duration; the JW202 form your university issues specifies the duration',
              '**Language year program = X1** — 1-year language programs (Yenching, Schwarzman pre-year) are > 180 days and get the X1 even though the program is technically "non-degree"',
              '**PhD = X1 with multi-year validity** — Chinese embassies typically issue the X1 valid for the full PhD program length (4-5 years)',
              '**X2 holders cannot convert to X1 in China** — if you arrive on X2 and want to extend your studies, you must leave China, apply for a new X1 from your home country, and re-enter',
              '**X1 single-entry is the default at some embassies** — request multi-entry explicitly if you plan to travel in / out of China during your studies (holidays, conferences, home visits)',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'For September 2027 intake, plan the visa application for July-August 2027 — most embassies open X1 visa processing 2-3 months before the program start. Earlier is fine; the X1 is valid for the program duration regardless of when you enter.',
          },
        ],
      },
      {
        id: 'jw202-form',
        h2: 'The JW202 form — what it is, who issues it, when it arrives',
        intro:
          'The JW202 (Visa Application for International Students) is the official Chinese government document that proves your admission. The host university issues it; you need the original to apply for the X1 visa at your embassy.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**What it is** — the official Chinese government form titled "Visa Application for International Students to Study in China" (《外国留学人员来华签证申请表》); it is the only document your embassy will check to verify you are a legitimate student',
              '**Who issues it** — your host Chinese university\'s international student office, after you accept the admission offer and pay the deposit / first-semester fees',
              '**When it arrives** — typically 2-4 weeks after you accept the admission + pay the deposit; the international student office emails a scan first and ships the original (or arranges courier) to you',
              '**What\'s on it** — your name (must match passport), passport number, host university name, program name, program duration, intended start date, signature + official university seal',
              '**CSC variant** — CSC-funded students get a JW201 form (different from JW202) issued by the China Scholarship Council; the visa application process is the same but the form number differs',
              '**Original required for the visa** — embassies require the original JW202 (or JW201) with a wet seal; a scan is not enough for the visa application',
              '**When to apply for the visa** — as soon as the original JW202 arrives; embassies typically process in 5-10 working days',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Do NOT book flights before the X1 visa is in your passport. Some embassies require the original admission notice AND the original JW202; the visa stamp is the only legal entry document. Arriving on a tourist visa (L) and trying to convert is not a legal path.',
          },
        ],
      },
      {
        id: 'visa-application',
        h2: 'The X1 visa application at your local Chinese embassy',
        intro:
          'Once you have the original JW202 + admission notice + supporting documents, the X1 visa application is straightforward. Processing time is usually 5-10 working days at most embassies.',
        blocks: [
          {
            type: 'table',
            caption: 'X1 visa application documents + typical processing',
            columns: ['Document', 'What it is', 'Notes'],
            rows: [
              ['Passport', 'Original, valid 6+ months beyond program end, 1+ blank visa pages', 'Name must match the JW202 exactly'],
              ['JW202 form (or JW201 for CSC)', 'Original + copy, with university seal', 'The single most important document'],
              ['Admission Notice', 'Original + copy from the host university', 'Confirms the program, dates, and tuition'],
              ['Visa application form', 'Completed online via the Chinese Visa Application Service Center (CVASC) or embassy website', 'Most embassies have moved this online'],
              ['Photo', 'Recent passport-style photo (some embassies require 1, some 2)', 'White background, 48mm × 33mm or as specified'],
              ['Physical exam form', 'For programs > 6 months; the official "Foreigner Physical Examination Form" completed by a licensed physician', 'Some embassies require this; some let you do it in China within 30 days'],
              ['Proof of funds', 'Bank statement showing tuition + living cost coverage (often ¥50,000-100,000 minimum)', 'CSC-funded students are exempt (CSC covers it)'],
              ['Police clearance', 'Clean criminal record certificate, within validity', 'Some embassies require; some defer to in-China'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**Where to apply** — the Chinese embassy, consulate, or Chinese Visa Application Service Center (CVASC) in your home country; some embassies allow mail-in applications',
              '**Processing time** — typically 5-10 working days; expedited processing available at some embassies for an extra fee',
              '**Visa fee** — varies by nationality and visa type; commonly $30-150 USD (¥200-1,000) for a single-entry X1; multiple-entry X1 is usually 50-100% more',
              '**Validity of the X1** — up to 5 years; matches the program duration shown on the JW202; single or multiple entries',
              '**How long you can enter** — the X1 is typically valid for 3-6 months from the issue date as a "window to enter" before the visa becomes invalid; the residence permit (issued after arrival) is the actual long-term document',
            ],
          },
        ],
      },
      {
        id: 'residence-permit',
        h2: 'The 30-day residence permit conversion — the most-missed step',
        intro:
          'After you arrive in China on an X1, the X1 itself is a temporary entry visa. The residence permit is the actual long-term document. You have 30 days from arrival to convert — and the conversion is at the local Public Security Bureau (PSB) exit-entry office.',
        blocks: [
          {
            type: 'ol',
            items: [
              '**Schedule the PSB appointment** — the international student office helps you book; some universities have a dedicated on-campus PSB window (rare but ideal); most require you to visit the local PSB exit-entry office in person',
              '**Gather the documents** — passport + X1 visa, original JW202, Admission Notice, the university\'s enrollment confirmation, your on-campus dorm assignment, physical exam form (completed in China if not from home), 2-3 passport photos, residence permit application fee',
              '**Visit the PSB exit-entry office** — biometrics (photo + fingerprints) on-site, document review, fee payment; the office may ask you to wait for processing (typically 7-15 working days) or issue a temporary receipt on the spot',
              '**Receive the residence permit card** — pick up the physical card when notified (or wait for delivery to your dorm); the card replaces the X1 as your long-term stay document',
              '**Update your bank + phone + dorm records** — the residence permit becomes your primary ID at the bank, phone carrier, and dorm; carry it with you at all times as the police can request it',
            ],
          },
          {
            type: 'ul',
            items: [
              '**30 days from arrival** — late conversion = fines (¥200-1,000/day depending on the city) and, in serious cases, detention + deportation',
              '**Physical exam** — if you did not do it at home, the PSB can refer you to a designated hospital in China; cost ¥400-800; takes 3-5 business days for results',
              '**Photo at the PSB** — bring 2-3 standard passport photos; some PSBs do photos on-site, some require you to bring them',
              '**Fee** — ¥400-800 for the residence permit (varies by city; tier-1 cities are typically more expensive); valid for the duration of your program (1 year for language, 2-5 years for degree programs, renewable)',
              '**Address registration** — register your dorm address with the local police station (派出所) within 24 hours of moving in (or moving off-campus); the PSB will not issue the residence permit without this registration',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'Missing the 30-day residence permit conversion is the #1 reason international students get into legal trouble in China. Calendar the date the day you land; if anything goes wrong with the appointment (PSB is closed, documents missing), contact the international student office immediately — universities have protocols for these cases.',
          },
        ],
      },
      {
        id: 'renewal-extensions',
        h2: 'Renewal + extensions — keeping the permit valid through your program',
        intro:
          'The residence permit is valid for the duration of your program (1-5 years depending on program length), but you must renew it if your program extends, if you transfer universities, or if you change your passport.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Standard renewal** — apply at the PSB exit-entry office 30 days before the residence permit expires; bring the same document set as the initial application + the university\'s enrollment confirmation for the next year',
              '**Passport renewal** — if your passport is renewed (new number) while in China, the residence permit must be re-issued with the new passport number; coordinate with the international student office and PSB',
              '**University transfer** — if you transfer from one university to another (e.g., for a master\'s + PhD), the residence permit must be updated with the new university\'s JW202',
              '**Program extension** — if you extend from master\'s to PhD, or add a research year, the residence permit needs re-issue; budget 2-4 weeks of processing time',
              '**Lost or damaged residence permit** — report to the PSB within 3 days; replacement process takes 2-3 weeks and costs ¥200-400',
            ],
          },
          {
            type: 'table',
            caption: 'Residence permit life events + what to do',
            columns: ['Life event', 'What to do', 'Time to resolve'],
            rows: [
              ['Permit expiring in 60 days', 'Apply for renewal at the PSB', '2-4 weeks'],
              ['Passport renewed (new number)', 'Re-issue residence permit at the PSB', '2-3 weeks'],
              ['Lost or damaged permit', 'Report to PSB + apply for replacement', '2-3 weeks'],
              ['University transfer (master\'s to PhD elsewhere)', 'Current permit becomes invalid; apply for new X1 + residence permit with new university', '4-8 weeks'],
              ['Address change (dorm to off-campus, or city change)', 'Register new address with local police within 24 hours; update residence permit at the PSB', '1-2 weeks'],
              ['Family arrival (spouse + child)', 'Apply for S1 / S2 dependent visa at the Chinese embassy before the family travels', '5-10 working days'],
            ],
          },
        ],
      },
      {
        id: 'dependents',
        h2: 'Dependents — bringing spouse + minor children',
        intro:
          'X1 visa holders can bring their spouse and minor children to China on dependent visas. The process is separate from the student visa and requires additional documents.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Visa category for dependents** — S1 (long-term stay, > 180 days) or S2 (short-term, ≤ 180 days) visa; S1 is what spouses + children of X1 holders apply for',
              '**Required documents** — marriage certificate (for spouse) + birth certificate (for children), notarized + translated into Chinese; proof of relationship; the X1 holder\'s passport + residence permit; proof of financial support (the X1 holder\'s stipend or bank statement)',
              '**Application process** — the X1 holder applies for the dependent visa on behalf of the family at the Chinese embassy in the home country; some embassies require the X1 holder to be in China already',
              '**Residence permit for dependents** — once the family arrives, the S1 visa converts to a residence permit at the PSB; the S1 residence permit validity matches the X1 holder\'s residence permit (renew together)',
              '**Work rights for spouse** — the S1 spouse is generally NOT permitted to work in China; the X1 holder\'s stipend + savings are expected to support the family; some cities issue work permits for S1 spouses on a case-by-case basis',
              '**Children\'s schooling** — minor children on S1 visas can attend local schools (public or private); the international school option is widely available in tier-1 cities at $15,000-30,000/year',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: 'Bringing dependents adds paperwork lead time. Plan the dependent visa 4-6 weeks before the family plans to travel; document notarization + Chinese translation can take 2-3 weeks alone.',
          },
        ],
      },
      {
        id: 'rejection-reasons',
        h2: 'Common rejection reasons — and how to avoid them',
        intro:
          'Most X1 visa rejections are preventable. Here are the most common reasons, in order of frequency, and what to do about each.',
        blocks: [
          {
            type: 'ul',
            items: [
              '**Name mismatch between passport, JW202, and admission notice** — embassies compare character-by-character; the slightest spelling difference triggers rejection; fix by having the university re-issue the JW202 with the correct name',
              '**Missing or wrong form** — applicants show up with JW201 (for non-CSC) or JW202 (for CSC) mixed up; or with a scan instead of the original; or with an out-of-date form; bring the original + a copy + verify the form number matches the funding source',
              '**Insufficient proof of funds** — for self-funded applicants, the bank statement must show tuition + 1 year of living cost; ¥50,000-100,000 minimum depending on the city; CSC-funded applicants are exempt',
              '**Incomplete admission notice** — embassies require the original notice with the university seal; photocopies or scans trigger rejection',
              '**Apply too early or too late** — embassies open X1 visa processing 2-3 months before program start; applying 6+ months early is too early (program details can change); applying 2 weeks before travel is too late (processing time + passport mail time)',
              '**Previous overstay or violation in China** — a prior residence-permit overstay (even by 1 day) is recorded; the next application can be denied for 1-5 years; fix by being honest in the application and providing context',
              '**Passport too short** — passport must be valid 6+ months beyond the program end date; renew your passport before applying if it expires within the program duration',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: 'If your visa is rejected, the embassy will issue a written reason. Read it carefully — most rejections are fixable with additional documents or a re-application with corrected paperwork. SICA counselors review visa files before submission to catch the common issues.',
          },
        ],
      },
    ],
    faqs: [
      {
        q: 'What is the difference between X1 and X2 student visa for China?',
        a: 'X1 is for programs longer than 180 days (most bachelor\'s, master\'s, PhD, and 1-year+ language programs); X2 is for programs 180 days or shorter (language summer schools, short exchanges, executive short courses). X1 requires a JW202 form from the host university and converts to a residence permit within 30 days of arrival; X2 is valid for the stay and does not require conversion.',
      },
      {
        q: 'What is the JW202 form?',
        a: 'JW202 is the official Chinese government form titled "Visa Application for International Students to Study in China". Your host Chinese university\'s international student office issues it after you accept the admission + pay the deposit. You need the original JW202 to apply for the X1 visa at your local Chinese embassy. CSC-funded students get a JW201 form instead (same process, different form number).',
      },
      {
        q: 'How long does it take to get the X1 visa?',
        a: 'Processing time at most Chinese embassies is 5-10 working days from when you submit a complete application. Plan the visa application 2-3 months before your program start; allow additional time for passport mail round-trip. Expedited processing is available at some embassies for an extra fee.',
      },
      {
        q: 'What happens if I do not convert my X1 visa to a residence permit within 30 days?',
        a: 'Late conversion results in fines (typically ¥200-1,000/day depending on the city) and, in serious cases, detention + deportation. A late-conversion record can also make future China visa applications harder. Calendar the 30-day deadline the day you arrive in China; contact the international student office immediately if anything goes wrong with the appointment.',
      },
      {
        q: 'How long is the residence permit valid?',
        a: 'The residence permit is valid for the duration of your program — 1 year for language programs, 2-3 years for master\'s programs, 4-5 years for PhD programs, and renewable. The first residence permit is usually issued within 1-2 weeks of your PSB application (after the 30-day conversion window has been met).',
      },
      {
        q: 'Can I travel outside China during my studies with an X1 visa?',
        a: 'Yes, if your X1 visa is multiple-entry (request this at the embassy when applying). Single-entry X1 requires you to apply for a re-entry permit before each trip outside China. Multiple-entry avoids this friction. The residence permit you receive in China does not change the visa entry rules — the entry type was set when the X1 was issued.',
      },
      {
        q: 'Can I bring my spouse and children on an X1 visa?',
        a: 'No — the X1 is for the student only. Spouse + minor children apply for S1 (long-term stay) or S2 (short-term) dependent visas at the Chinese embassy in the home country. S1 holders get a residence permit that matches the X1 holder\'s permit. S1 spouses are generally not permitted to work in China.',
      },
      {
        q: 'What if I lose my passport or residence permit in China?',
        a: 'Report to the local PSB exit-entry office within 3 days for the residence permit, and to your home country\'s embassy for the passport. The embassy issues an emergency travel document; the PSB re-issues the residence permit (with the new passport number). Replacement process takes 2-3 weeks; budget ¥200-400 for the residence permit re-issue.',
      },
    ],
    howToSteps: [
      {
        name: 'Confirm X1 vs X2 from your program duration',
        text: 'Programs > 180 days = X1 (most bachelor\'s, master\'s, PhD, 1-year+ language). Programs ≤ 180 days = X2 (language summer, short exchange). The host university\'s JW202 form specifies which.',
      },
      {
        name: 'Accept the admission and pay the deposit / first-semester fees',
        text: 'The JW202 form is issued only after you accept the admission + pay the deposit. This is the trigger — the international student office emails you a scan and ships the original (or arranges courier) within 2-4 weeks.',
      },
      {
        name: 'Receive the original JW202 + Admission Notice',
        text: 'Verify your name matches the passport character-by-character; verify the program name, dates, and university match the admission; if anything is off, request a re-issue BEFORE applying for the visa.',
      },
      {
        name: 'Gather the X1 visa application documents',
        text: 'Passport (6+ months validity, 1+ blank pages), original JW202, original Admission Notice, completed visa application form, passport photos, physical exam form (if required), proof of funds (¥50,000-100,000 bank statement; CSC-funded applicants are exempt), police clearance (if required).',
      },
      {
        name: 'Apply for the X1 visa at your local Chinese embassy / CVASC',
        text: 'Submit in person or by mail per the embassy\'s process. Request MULTIPLE-ENTRY if you plan to leave and re-enter China during your studies. Processing time 5-10 working days. Visa fee varies by nationality and entry type (single vs multiple).',
      },
      {
        name: 'After arrival: schedule the residence permit appointment',
        text: 'Within 30 days of arrival. The international student office helps you book. Gather: passport + X1 visa, original JW202, Admission Notice, university enrollment confirmation, dorm assignment, physical exam (if not done at home), 2-3 passport photos, residence permit application fee ¥400-800. PSB biometrics on-site.',
      },
      {
        name: 'Maintain the permit throughout your program',
        text: 'Renew at the PSB 30 days before expiration. Update within 1-2 weeks of: passport renewal (new number), university transfer, program extension, address change. Carry the permit with you at all times; police can request it.',
      },
      {
        name: 'Plan dependent visas 4-6 weeks before family travels',
        text: 'S1 dependent visa for spouse + minor children; separate application at the Chinese embassy; requires notarized marriage + birth certificates in Chinese; family residence permit matches the X1 holder\'s permit validity.',
      },
    ],
    ctaTitle: 'Sorting out the China student visa?',
    ctaSubtitle:
      'SICA counselors review your X1/X2 decision, audit the JW202 + visa application documents, walk you through the 30-day residence permit conversion, and help with renewals + dependent visas. The first consultation is free.',
    ctaApplyLabel: 'Start free assessment',
    ctaContactLabel: 'Talk to a counselor',
    related: [
      {
        href: '/x1-vs-x2-student-visa-china',
        label: 'X1 vs X2 — the short summary',
        description: 'The 180-day rule, the JW202 form, the residence permit — the summary version.',
      },
      {
        href: '/guides/visa',
        label: 'China student visa — general guide',
        description: 'X1 vs X2, document checklist, fees, processing times, residence permit, work rights, and renewals.',
      },
      {
        href: '/china-university-application-deadlines',
        label: 'Chinese university application deadlines',
        description: 'The 2027 application calendar for September and March intake — including the parallel visa timeline.',
      },
    ],
  },
  zh: {
    slug: 'china-student-visa-jw202-residence-permit',
    eyebrow: '指南 · 中国签证',
    title: '2027 中国学生签证：X1 vs X2、JW202 表、居留许可全指南',
    description:
      'X1 与 X2 学生签证的 180 天判断规则、JW202 表（是什么、谁发、何时到）、抵华后 30 天居留许可转换、公安出入境生物信息采集、续签、家属（配偶 + 子女）规则，以及最常见的拒签原因。',
    subtitle:
      '中国学生签证分两种——X1 给超过 180 天的项目（几乎所有本科、硕士、博士与 1 年以上语言项目），X2 给短期项目。X1 背后是 JW202 表，由接收大学正式出具。抵华后 30 天内要换成居留许可，这是国际生最容易踩坑的一步。本指南带你走每一步——从 X1/X2 判断到 JW202 到达、生物信息、居留许可、续签——加上官方页面没说清的操作细节。',
    stats: [
      { value: 'X1 vs X2', label: '180 天规则决定' },
      { value: '30 天', label: 'X1 转居留许可窗口' },
      { value: 'JW202', label: '接收大学出具' },
      { value: '¥400-800', label: '签证费（单次入境）' },
    ],
    quickAnswer:
      '任何超过 180 天的项目，你都需要 X1 学生签证。X2 只给短期项目（语言暑期学校、几周的交换、高管短训）。X1 配一份由接收中国大学出具的 JW202 表——办签证时需原始件。抵华后，你有 30 天在本地公安局出入境办证大厅把 X1 换成居留许可——这一步是国际生最容易出问题的环节。从录取到抵华 + 第一天到第 30 天的 PSB 生物信息 + 居留许可卡，全程 2-6 周 + 1-2 小时。',
    keyTakeaways: [
      'X1 给超过 180 天的项目；X2 给短期项目（语言暑期、交换）。本科、硕士、博士 = X1',
      'JW202 表由接收大学出具，需接收录取 + 缴押金后发出——原始件用于办 X1 签证',
      '在本国中国大使馆 / 领馆申请 X1 签证；处理通常 5-10 个工作日',
      'X1 可单次或多次入境（学习期间要出入境的，务必申请多次）',
      '抵华 30 天内，到本地公安局（PSB）出入境办证大厅换成居留许可',
      '居留许可有效期与项目时长一致（语言 1 年 / 学位项目 2-5 年，可续）',
      'CSC 学者拿到的是 JW201 表（不是 JW202）——流程相同但表号不同',
      '家属（配偶 + 未成年子女）走 S1 / S2 家属签证类别，不是学生签证；家属签证需额外文件',
    ],
    sections: [
      {
        id: 'x1-vs-x2',
        h2: 'X1 vs X2——180 天规则决定一切',
        intro:
          'X1 / X2 的判断纯粹是时长问题。多数学位项目国际生拿 X1；只有短期学生拿 X2。',
        blocks: [
          {
            type: 'table',
            caption: 'X1 vs X2——时长、资格与各自能做什么',
            columns: ['维度', 'X1 学生签证', 'X2 学生签证'],
            rows: [
              ['项目时长', '> 180 天', '≤ 180 天'],
              ['典型使用场景', '本科、硕士、博士、1 年以上语言项目、1 年以上访问学者', '语言暑期（4-12 周）、短期交换、高管短训'],
              ['有效期', '最长 5 年（与项目时长一致，通常 1-5 年）', '最长 180 天（与项目时长一致）'],
              ['入境', '单次或多次（申请时明确要求多次）', '单次'],
              ['抵华后需换居留许可？', '要——抵华 30 天内', '不要——X2 本身覆盖停留'],
              ['能打工吗？', '校内 ≤ 20 小时/周（X1）', '一般不可（X2）'],
              ['可带家属吗？', '可（配偶 + 未成年子女走 S1 / S2）', '一般不可（项目太短）'],
              ['学习期间可出入境？', '多次入境允许；单次入境每次需办再入境许可', '一般不可（单次 + 短停留）'],
            ],
          },
          {
            type: 'ul',
            items: [
              '**拿不准时 X1 更保险**——中国大使馆通常对任何学位项目都给 X1，不论实际时长；接收大学出的 JW202 表会注明时长',
              '**语言年项目 = X1**——1 年语言项目（燕京、苏世民预科）超过 180 天，给 X1 即使项目名义上是「非学位」',
              '**博士 = 多年 X1**——中国大使馆通常给 X1 覆盖整个博士项目时长（4-5 年）',
              '**X2 不能在中国境内转 X1**——若你持 X2 入境并想延期，必须离境、回国申请新 X1、重新入境',
              '**默认单次入境**——部分大使馆默认单次；学习期间要出入境的（假期、会议、回国），务必明确申请多次',
            ],
          },
          {
            type: 'callout',
            tone: 'info',
            text: '2027 年 9 月入学，请把签证申请安排在 2027 年 7-8 月——多数大使馆在开学前 2-3 个月开放 X1 签证。',
          },
        ],
      },
      {
        id: 'jw202-form',
        h2: 'JW202 表——是什么、谁发、何时到',
        intro:
          'JW202（外国留学人员来华签证申请表）是证明你被录取的中国政府官方文件。接收大学出具；办 X1 签证时需要原始件。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**是什么**——中国官方表《外国留学人员来华签证申请表》；是大使馆核实你是合法留学生的唯一文件',
              '**谁出具**——接收中国大学国际生办公室，在你接受录取 + 缴押金 / 第一学期费用之后',
              '**何时到**——通常在你接受录取 + 缴押金后 2-4 周；国际生办公室先发扫描件，原始件快递给你',
              '**表上内容**——姓名（必须与护照一致）、护照号、接收大学名、项目名、项目时长、预计开始日期、签字 + 大学公章',
              '**CSC 变体**——CSC 资助学生拿到的是 JW201 表（不是 JW202）——签证申请流程相同但表号不同',
              '**办签证需原始件**——大使馆要求带公章的原始 JW202；扫描件办不了签证',
              '**何时办签证**——原始件一到就办；大使馆通常 5-10 个工作日处理',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '拿到 X1 签证再订机票。一些大使馆要求原始录取通知 + 原始 JW202；签证章是唯一合法入境文件。持旅游签证（L 签）入境再转身份不是合法路径。',
          },
        ],
      },
      {
        id: 'visa-application',
        h2: '在本国中国大使馆申请 X1 签证',
        intro:
          '拿到原始 JW202 + 录取通知 + 配套文件，X1 签证申请很直接。多数大使馆 5-10 个工作日处理。',
        blocks: [
          {
            type: 'table',
            caption: 'X1 签证申请文件 + 常见处理',
            columns: ['文件', '说明', '备注'],
            rows: [
              ['护照', '原始件，有效期超项目结束 6+ 个月，1+ 页空白签证页', '姓名必须与 JW202 完全一致'],
              ['JW202 表（或 JW201 给 CSC）', '原始件 + 复印件，带大学公章', '最重要的单份文件'],
              ['录取通知', '大学发的原始件 + 复印件', '确认项目、日期与学费'],
              ['签证申请表', '在中国签证申请服务中心（CVASC）或大使馆网站在线填写', '多数大使馆已上线'],
              ['照片', '近期护照照（1 张或 2 张，1+ 视使馆要求）', '白底，48mm × 33mm 或按指定'],
              ['体检表', '超过 6 个月项目；执证医师填写的官方《外国人体格检查表》', '部分使馆要；部分允许抵华 30 天内做'],
              ['资金证明', '银行流水显示学费 + 生活费（通常 ¥50,000-100,000 起）', 'CSC 资助学生豁免'],
              ['无犯罪证明', '有效期内清白记录', '部分使馆要；部分留给抵华后'],
            ],
          },
            {
            type: 'ul',
            items: [
              '**申请地点**——本国中国大使馆、领馆或中国签证申请服务中心（CVASC）；部分使馆接受邮寄',
              '**处理时间**——通常 5-10 个工作日；加急处理部分使馆有，加收费用',
              '**签证费**——因国籍与签证类型而异；通常 $30-150 美元（¥200-1,000）单次入境 X1；多次入境通常多 50-100%',
              '**X1 有效期**——最长 5 年；与 JW202 上的项目时长一致；可单次或多次入境',
              '**入境窗口**——X1 通常自签发日起 3-6 个月「入境窗口」有效；超期入境无效；居留许可（抵华后申请）才是长期文件',
            ],
          },
        ],
      },
      {
        id: 'residence-permit',
        h2: '30 天居留许可转换——最常被忽略的一步',
        intro:
          '持 X1 抵华后，X1 本身是临时入境签证。居留许可是真正的长期文件。抵华后 30 天内到本地公安局（PSB）出入境办证大厅转换。',
        blocks: [
          {
            type: 'ol',
            items: [
              '**预约 PSB**——国际生办公室帮你预约；少数大学在校内有专用 PSB 窗口（罕见但理想）；多数需要你亲自去本地 PSB 出入境办证大厅',
              '**备文件**——护照 + X1 签证、原始 JW202、录取通知、大学的注册确认、你的校内宿舍分配、体检表（国内做的话）、2-3 张护照照、居留许可申请费',
              '**去 PSB 出入境办证大厅**——现场生物信息（照片 + 指纹）、文件审核、缴费；可能要求等待处理（通常 7-15 个工作日）或当场给临时收据',
              '**领居留许可卡**——通知后取卡（或寄到宿舍）；卡片取代 X1 作为长期停留文件',
              '**更新银行 + 手机 + 宿舍记录**——居留许可是你的银行、手机运营商、宿舍的主要 ID；随身携带，警察可以要求查看',
            ],
          },
          {
            type: 'ul',
            items: [
              '**抵华 30 天内**——逾期罚款（视城市 ¥200-1,000/天），严重者拘留 + 遣返',
              '**体检**——若没在国内做，PSB 可指定一家指定医院；费用 ¥400-800；3-5 个工作日出结果',
              '**PSB 现场照片**——带 2-3 张标准护照照；部分 PSB 现场拍，部分要求自带',
              '**费用**——居留许可 ¥400-800（视城市；一线城市较贵）；有效期与项目时长一致（语言 1 年 / 学位项目 2-5 年，可续）',
              '**地址登记**——入住（或搬出校外）后 24 小时内到当地派出所登记；PSB 居留许可以此为前提',
            ],
          },
          {
            type: 'callout',
            tone: 'warning',
            text: '错过 30 天居留许可转换是国际生在中国出法律问题的 #1 原因。抵华当天就在日历上标注；若预约出问题（PSB 关门、文件缺失），立刻联系国际生办公室——大学有处理这类情况的协议。',
          },
        ],
      },
      {
        id: 'renewal-extensions',
        h2: '续签与延期——保持居留许可在整个项目期有效',
        intro:
          '居留许可有效期与项目时长一致（1-5 年），但若项目延期、转学、换护照，必须续签。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**常规续签**——居留许可到期前 30 天到 PSB 出入境办证大厅申请；带与首次申请相同的文件 + 大学下一年的注册确认',
              '**护照换新**——若在中国期间护照换新（新号码），居留许可必须按新护照号重发；与大学 + PSB 协调',
              '**转学**——若从一个大学转到另一个（如硕士 + 博士），居留许可必须按新大学的 JW202 更新',
              '**项目延期**——若从硕士延期到博士，或加一年研究，居留许可需重发；预留 2-4 周处理时间',
              '**居留许可丢失或损坏**——3 天内向 PSB 报告；补办 2-3 周，费用 ¥200-400',
            ],
          },
            {
              type: 'table',
              caption: '居留许可生命周期事件 + 处理',
              columns: ['事件', '处理', '解决时间'],
              rows: [
                ['居留许可 60 天内到期', '到 PSB 申请续签', '2-4 周'],
                ['护照换新（新号码）', '到 PSB 重发居留许可', '2-3 周'],
                ['丢失或损坏', '向 PSB 报告 + 申请补发', '2-3 周'],
                ['转学（硕士到博士他校）', '当前许可失效；以新大学 JW202 申请新 X1 + 居留许可', '4-8 周'],
                ['地址变更（宿舍到校外，或换城）', '24 小时内到派出所登记新地址；到 PSB 更新居留许可', '1-2 周'],
                ['家属到达（配偶 + 子女）', '家属出行前在所在国中国大使馆申请 S1 / S2 签证', '5-10 个工作日'],
              ],
          },
        ],
      },
      {
        id: 'dependents',
        h2: '家属——带配偶 + 未成年子女',
        intro:
          'X1 持有人可带配偶 + 未成年子女来华，办理家属签证。流程与学生签证分开，需额外文件。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**家属签证类别**——S1（长期停留，> 180 天）或 S2（短期，≤ 180 天）签证；X1 持有人的配偶 + 子女申请 S1',
              '**所需文件**——结婚证（配偶）+ 出生证（子女），公证 + 翻译为中文；亲属关系证明；X1 持有人护照 + 居留许可；经济能力证明（X1 持有人津贴或银行流水）',
              '**申请流程**——X1 持有人在所在国中国大使馆代家属申请；部分大使馆要求 X1 持有人已在中国',
              '**家属居留许可**——家属抵华后，S1 在 PSB 换成居留许可；有效期与 X1 持有人的居留许可一致（同步续签）',
              '**配偶工作权**——S1 配偶一般不能在中国工作；靠 X1 持有人津贴 + 存款供养；部分城市按情况给 S1 配偶发工作许可',
              '**子女上学**——S1 签证未成年子女可上本地学校（公立或私立）；一线城市国际学校选项多，$15,000-30,000/年',
            ],
          },
            {
            type: 'callout',
            tone: 'info',
            text: '带家属要预留时间。建议家属出行前 4-6 周申请家属签证；文件公证 + 中文翻译单是 2-3 周。',
          },
        ],
      },
      {
        id: 'rejection-reasons',
        h2: '常见拒签原因——及如何避免',
        intro:
          '多数 X1 签证拒签都可避免。按发生频率列出最常见原因与处理。',
        blocks: [
          {
            type: 'ul',
            items: [
              '**护照、JW202、录取通知姓名不一致**——大使馆逐字比对；任何拼写差异触发拒签；让大学重发一份正确姓名的 JW202',
              '**表号错或用错**——申请人拿 JW201（给非 CSC）或 JW202（给 CSC）混着；或带扫描件而非原始件；或带过期表；带原始件 + 复印件 + 核实表号与资助来源匹配',
              '**资金证明不足**——自费申请人银行流水必须显示学费 + 1 年生活费；¥50,000-100,000 起，取决于城市；CSC 资助豁免',
              '**录取通知不完整**——大使馆要求带大学公章的原始录取通知；复印件或扫描件触发拒签',
              '**申请太早或太晚**——大使馆在开学前 2-3 个月开放 X1 签证办理；提前 6+ 个月太早（项目细节可能变）；出行前 2 周太晚（处理时间 + 护照邮寄时间）',
              '**曾在中国逾期停留或违规**——既往居留许可逾期（哪怕 1 天）会被记录；后续申请可能 1-5 年拒签；申请时如实说明',
              '**护照有效期不足**——护照有效期需超项目结束日期 6+ 个月；若在项目期内到期，签证办之前先换护照',
            ],
          },
            {
            type: 'callout',
            tone: 'warning',
            text: '若被拒签，使馆会给书面原因。仔细读——多数拒签可通过补文件或更正后重新申请解决。SICA 顾问在递交前审文件，把常见问题挡在门外。',
          },
        ],
      },
    ],
    faqs: [
      {
        q: '中国 X1 与 X2 学生签证的区别？',
        a: 'X1 给超过 180 天的项目（多数本科、硕士、博士、1 年以上语言项目）；X2 给 180 天及以下的短期项目（语言暑期、短期交换、高管短训）。X1 需接收大学 JW202 表，抵华 30 天内换居留许可；X2 本身覆盖停留，不需要换。',
      },
      {
        q: 'JW202 表是什么？',
        a: 'JW202 是中国官方表《外国留学人员来华签证申请表》。接收中国大学国际生办公室在你接受录取 + 缴押金后出具。办 X1 签证时需原始件。CSC 资助学生拿到的是 JW201 表（流程同，表号不同）。',
      },
      {
        q: '办 X1 签证要多久？',
        a: '多数中国大使馆处理 5-10 个工作日。建议开学前 2-3 个月申请；留出护照邮寄往返时间。部分使馆提供加急（加收费用）。',
      },
      {
        q: '若 30 天内没换居留许可会怎样？',
        a: '逾期罚款（视城市 ¥200-1,000/天），严重者拘留 + 遣返。逾期记录还会让未来中国签证申请更困难。抵华当天就在日历上标注；若预约出问题，立刻联系国际生办公室。',
      },
      {
        q: '居留许可有效期多长？',
        a: '居留许可有效期与项目时长一致——语言项目 1 年；硕士 2-3 年；博士 4-5 年；可续。首次居留许可通常在 PSB 申请后 1-2 周内签发。',
      },
      {
        q: '学习期间可以出境吗？',
        a: '可以，若你的 X1 签证是多次入境（办签证时申请）。单次入境 X1 每次出境前需办再入境许可。多次入境省事。居留许可不改变入境规则——入境类型在 X1 签发时已定。',
      },
      {
        q: '可以带配偶和子女吗？',
        a: '可以——但不走 X1 签证。配偶 + 未成年子女在本国中国大使馆申请 S1（长期）或 S2（短期）家属签证。S1 持有人获居留许可（与 X1 持有人有效期一致）。S1 配偶一般不能在中国工作。',
      },
      {
        q: '护照或居留许可丢失怎么办？',
        a: '居留许可丢失 3 天内向 PSB 报告；护照丢失向本国大使馆办紧急旅行证件。大使馆出旅行证件，PSB 按新护照号重发居留许可。补办 2-3 周；居留许可补发 ¥200-400。',
      },
    ],
    howToSteps: [
      {
        name: '按项目时长确定 X1 或 X2',
        text: '> 180 天 = X1（多数本科、硕士、博士、1 年以上语言）。≤ 180 天 = X2（语言暑期、短期交换）。接收大学的 JW202 表会注明。',
      },
      {
        name: '接受录取 + 缴押金 / 第一学期费用',
        text: 'JW202 表只在录取确认 + 缴押金后出具。这是触发点——国际生办公室 2-4 周内发扫描件 + 邮寄原始件。',
      },
      {
        name: '收原始 JW202 + 录取通知',
        text: '逐字核实姓名与护照一致；核实项目名、日期与大学一致；任何不符先让大学重发再办签证。',
      },
      {
        name: '备 X1 签证申请文件',
        text: '护照（6+ 个月有效，1+ 空白页）、原始 JW202、原始录取通知、签证申请表、护照照、体检表（如要）、资金证明（¥50,000-100,000 银行流水；CSC 豁免）、无犯罪证明（如要）。',
      },
      {
        name: '在本国中国大使馆 / CVASC 申请 X1 签证',
        text: '面交或邮寄（按使馆流程）。学习期间要出入境的务必申请「多次入境」。处理 5-10 个工作日。签证费因国籍与入境类型而异。',
      },
      {
        name: '抵华后：预约居留许可办理',
        text: '抵华 30 天内。国际生办公室帮你预约。备：护照 + X1 签证、原始 JW202、录取通知、注册确认、宿舍分配、体检（若未在国内做）、2-3 张护照照、申请费 ¥400-800。PSB 现场生物信息。',
      },
      {
        name: '整个项目期内维护居留许可',
        text: '到期前 30 天到 PSB 续签。1-2 周内更新：护照换新（号变）、转学、项目延期、地址变更。随身携带，警察可查。',
      },
      {
        name: '家属出行前 4-6 周申请签证',
        text: 'S1 家属签证（配偶 + 未成年子女）；在中国大使馆单独申请；需公证结婚证 + 出生证 + 中文翻译；家属居留许可与 X1 持有人许可有效期一致。',
      },
    ],
    ctaTitle: '正在处理中国学生签证？',
    ctaSubtitle:
      'SICA 顾问审查你的 X1/X2 判断、审核 JW202 + 签证申请文件、带你走 30 天居留许可转换、协助续签与家属签证。首次咨询免费。',
    ctaApplyLabel: '开始免费评估',
    ctaContactLabel: '联系顾问',
    related: [
      {
        href: '/x1-vs-x2-student-visa-china',
        label: 'X1 vs X2——精简版',
        description: '180 天规则、JW202 表、居留许可——精简版摘要。',
      },
      {
        href: '/guides/visa',
        label: '中国学生签证——通用指南',
        description: 'X1 vs X2、材料清单、费用、处理时长、居留许可、工作权、续签。',
      },
      {
        href: '/china-university-application-deadlines',
        label: '中国大学申请截止日',
        description: '2027 年 9 月与 3 月入学的申请日历——含并行的签证时间线。',
      },
    ],
  },
};
