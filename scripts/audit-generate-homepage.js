#!/usr/bin/env node
/**
 * Generates spark-output/context/audit.json from the findings array.
 *
 * The summary block MUST be derived from `findings` programmatically —
 * never hand-estimated. This script is the single source of truth for
 * the counts so the JSON and the Markdown report can never disagree.
 */
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'spark-output', 'context', 'audit.json');

const findings = [
  // ---------- visibility ----------
  {
    id: 'audit-1',
    heuristic: 'visibility',
    severity: 'major',
    description:
      'Five fixed-position overlays (WhatsApp group popup, chatbot prompt card, chatbot launcher, WhatsApp float, sticky contact) all render on the homepage at z-40/z-50 with no mutual exclusion, so they stack on top of each other and on top of the page content.',
    evidence:
      'Live https://studyinchina.academy/ @390x844. Fixed-overlay rects: WhatsApp group popup `fixed bottom-4 right-4 z-50 max-w-[420px] w-[calc(100vw-2rem)]` = 358x431 at x=16,y=397 (51% of a 390x844 viewport); chatbot prompt card = 288x118; chatbot launcher = 56x56; WhatsApp float = 64x64; sticky contact = 48x48. The popup and the prompt card overlap each other.',
    suggestion:
      'Make the overlays mutually exclusive (show one prompt at a time), cap the WhatsApp popup to a bottom sheet of at most ~40% viewport height, and hold the chatbot prompt back until the WhatsApp popup has been dismissed or scrolled past.',
    effort: 'medium',
  },
  {
    id: 'audit-2',
    heuristic: 'visibility',
    severity: 'minor',
    description:
      "The hero's catalogue search renders inside a Suspense boundary whose fallback is an empty 176px-tall strip — a warm-white band with a crimson top border and no content — so on a slow connection the first screen shows a coloured bar instead of a search field.",
    evidence: 'src/app/_components/home-hero.tsx:36-38 (`HeroSearchFallback` = `h-44 border-t-2 border-[#9B1B30] bg-[#FAFAF8]/95`, no children).',
    suggestion:
      'Render the real search frame in the fallback (title, tab labels, input outline, button) and let only the data-bound parts stay blank, so the first screen never collapses into an empty band.',
    effort: 'quick-win',
  },

  // ---------- real-world-match ----------
  {
    id: 'audit-3',
    heuristic: 'real-world-match',
    severity: 'major',
    description:
      'The homepage meta description advertises "300+ universities" while the page\'s own stats band says "200+ Partner Universities" and the live catalogue holds 204. A visitor who reads the Google snippet and then the page sees the site contradict itself.',
    evidence:
      'src/lib/i18n-translations.ts:990 (en) / :6984 (zh) — `seo.homeDescription` says "300+ universities". Stats band on the live homepage says "200+ PARTNER UNIVERSITIES". `GET https://studyinchina.academy/api/universities?limit=1` returns `total: 204`.',
    suggestion:
      'Either derive the number in the description from the same live count the stats band uses, or drop the number from the description. One string, one source, one number.',
    effort: 'quick-win',
  },
  {
    id: 'audit-4',
    heuristic: 'real-world-match',
    severity: 'major',
    description:
      '"Popular Fields of Study" promises a discipline-specific result but five of the six tiles resolve to the identical unfiltered /universities URL, so "Computer Science" and "Artificial Intelligence" both land on the generic catalogue with no discipline filter applied.',
    evidence:
      'Live tile hrefs: Computer Science -> /universities, Engineering -> /universities, Business & Management -> /universities, Medicine & Health -> /mbbs-in-china, Artificial Intelligence -> /universities, Languages & Culture -> /universities. Source: src/app/_components/home-proof.tsx:249-254.',
    suggestion:
      'Point each tile at the catalogue with its discipline filter (the finder already accepts a `discipline` param) and keep Medicine & Health on /mbbs-in-china. A tile that says "Computer Science" must show computer-science programs.',
    effort: 'quick-win',
  },
  {
    id: 'audit-5',
    heuristic: 'real-world-match',
    severity: 'minor',
    description: 'The "View All Programs" link under Popular Fields of Study points at /universities, not /programs.',
    evidence: 'src/app/_components/home-proof.tsx:270 — `href="/universities"` with label `t(\'fields.viewAll\')` = "View All Programs".',
    suggestion: 'Point it at /programs, or rename it to match its destination.',
    effort: 'quick-win',
  },
  {
    id: 'audit-6',
    heuristic: 'real-world-match',
    severity: 'minor',
    description:
      'The stats band mixes three live-derived counts (universities, programs, scholarships) with one asserted business claim (5,000+ Successful Admissions) under identical gold-on-navy styling, so a visitor cannot tell which numbers are counted and which are claimed.',
    evidence:
      'src/app/_components/home-proof.tsx:127-156 builds the array from `getStat(...)` (curated, src/lib/site-stats.ts) and `formatCount(counts.universities/programs/scholarships)` (live DB counts) and renders them with one identical style. site-stats.ts comments call 5,000+ a "business claim, not a derived count".',
    suggestion:
      'Mark the business claim (a footnote, or a different treatment), or drop it until it can be sourced. Do not present counted and claimed numbers in the same visual register.',
    effort: 'quick-win',
  },

  // ---------- user-control ----------
  {
    id: 'audit-7',
    heuristic: 'user-control',
    severity: 'blocker',
    description:
      "The Chinese language selection is destroyed by the homepage. The hero CTA mounts its own nested I18nProvider with a hard-coded initialLocale=\"en\"; because it is loaded through next/dynamic it mounts after the outer provider's effect, and its mount effect writes sica-locale=en to the cookie and sets document.documentElement.lang='en'. The visitor's chosen language is silently reset, the page declares itself English while its content is Chinese, and the very next click lands on a fully English page.",
    evidence:
      'src/components/ConsultationCta.tsx:36-38 wraps itself in `<I18nProvider initialLocale="en">`; src/lib/i18n.tsx:66-77 writes the cookie and src/lib/i18n.tsx:79-81 sets `document.documentElement.lang`. Verified live on https://studyinchina.academy/ with `sica-locale=zh`: server renders h1 = 留学中国塑造你的未来 (Chinese) and the header/nav/search in Chinese, but after hydration the hero CTA reads "Book a free consultation" (English), the cookie reads `sica-locale=en`, and `document.documentElement.lang` is "en". Following the CTA to /programs renders the whole page in English ("Find a program in China", "Subject, university, or city…"). Reproduced identically on the local dev server.',
    suggestion:
      'Delete the nested provider and let ConsultationCta consume the outer context (the component already imports useI18n). Make the provider\'s cookie write idempotent and locale-safe, and add a regression test that asserts a zh visit keeps sica-locale=zh and <html lang="zh"> after hydration.',
    effort: 'quick-win',
  },
  {
    id: 'audit-8',
    heuristic: 'user-control',
    severity: 'major',
    description:
      'Three of the four hero quick-access cards are not clickable. "Top Universities", "Diverse Programs" and "Support Services" are plain divs — no anchor, no onClick, and no link anywhere inside them — yet they are styled as interactive tiles (icon plate, shadow, hover elevation) so they read as buttons.',
    evidence:
      'Live measurement: all four cards report `cursor: auto` and none is an anchor; the Scholarships card is the only one with a link inside ("CSC Scholarship 2027 guide"). Source: src/app/_components/home-hero.tsx:99-126 — only the `quick.scholarships` entry carries `link` / `linkLabel`.',
    suggestion:
      'Make each card a link to the obvious destination (Top Universities -> /universities, Diverse Programs -> /programs, Support Services -> /counselling) — or remove the hover elevation so they stop reading as buttons.',
    effort: 'quick-win',
  },
  {
    id: 'audit-9',
    heuristic: 'user-control',
    severity: 'major',
    description:
      'In "How SICA Helps You", the step with the highest intent — 01 Free Consultation — has no link, and neither do 03 Visa & Travel and 04 Post-Arrival Support. Only step 02 links anywhere, and it points at the application-deadlines guide, not at the service the card describes.',
    evidence:
      'Live card link audit: Free Consultation -> no link, Application Support -> /china-university-application-deadlines, Visa & Travel -> no link, Post-Arrival Support -> no link. Source: src/app/_components/home-proof.tsx:286-321 (only the `sica.application` entry defines link/linkLabel).',
    suggestion:
      'Link 01 to /counselling, 03 to the visa guide, 04 to the accommodation guide. The cards describe a service; they should take the visitor to it.',
    effort: 'quick-win',
  },

  // ---------- consistency ----------
  {
    id: 'audit-10',
    heuristic: 'consistency',
    severity: 'major',
    description:
      'The first four H2s in the document outline are the utility quick-access cards, ahead of every real content section, so the heading hierarchy presents four chrome elements as the top-level structure of the page.',
    evidence:
      'Live H2 order: ["Top Universities", "Diverse Programs", "Scholarships", "Support Services", "Featured universities", "Popular programs", "Why Study in China?", "Popular Fields of Study", "How SICA Helps You", ...]. Source: src/app/_components/home-hero.tsx:107 (`<h2 className="text-sm font-semibold ...">`).',
    suggestion:
      'Render the card titles as paragraphs or headings nested under a visually-hidden "Quick access" H2, so the outline starts at "Featured universities".',
    effort: 'quick-win',
  },
  {
    id: 'audit-11',
    heuristic: 'consistency',
    severity: 'minor',
    description:
      'The page the homepage sends visitors to from "Popular programs -> Browse all programs" serves a doubled brand suffix in its title, while the homepage title carries none.',
    evidence:
      'Live https://studyinchina.academy/programs <title> = "Programs in China | SICA | SICA"; live homepage <title> = "Study in China: Universities, Programs & Scholarships". The `{ absolute }` title convention documented in src/lib/document-title.ts is applied on the homepage but not on /programs.',
    suggestion: 'Apply the same absolute-title convention on /programs so the brand appears once.',
    effort: 'quick-win',
  },
  {
    id: 'audit-12',
    heuristic: 'consistency',
    severity: 'minor',
    description:
      'The homepage H1 has the accessible name "Study in ChinaShape Your Future" — the two lines are joined by a <br> with no separating space, so the two halves run together when the heading is read out or concatenated.',
    evidence: 'Live `document.querySelector("h1").textContent` = "Study in ChinaShape Your Future". Source: src/app/_components/home-hero.tsx:76-80.',
    suggestion: 'Put a space before the <br> or join the lines with a separator so the heading reads as one phrase.',
    effort: 'quick-win',
  },

  // ---------- error-prevention ----------
  {
    id: 'audit-13',
    heuristic: 'error-prevention',
    severity: 'blocker',
    description:
      'The public Success Stories cards publish full admission letters in which the student\'s full name, gender, nationality and passport number are legible. These are government-ID-grade identifiers exposed on an indexable public page, and the "anonymise at upload" intent was never implemented.',
    evidence:
      'Live homepage Success Stories grid renders admission-notice images from the public admission-notices bucket. The Hubei University of Technology card is legible enough to read "BABU TANVIR RANA ZIM (Male, Bangladesh, Passport No.: A09573291)"; the other two cards show "Dear Ms. FAROLIA SYNDII MEKUI MANDJI" and "Dear Mr. HOSSAIN TANIM" with barcode + application number. The same images are served on /success-stories. AGENTS.md records the watermark as the only privacy step.',
    suggestion:
      'Add a redaction step in the upload pipeline (mask the applicant name and the passport/ID line before the public file is written), record consent at upload, and re-process the already-published originals. Confirm with the students whose images are live before the page is re-published.',
    effort: 'major-rework',
  },

  // ---------- recognition ----------
  {
    id: 'audit-14',
    heuristic: 'recognition',
    severity: 'minor',
    description:
      'Program cards repeat the program title as its own discipline on roughly half the cards ("BSc in Computer Science" with the line "Computer Science"), while the tuition and duration — the facts a student actually compares — are pushed down to the card footer.',
    evidence:
      'Live Popular programs cards: "BSc in Computer Science" / discipline "Computer Science"; "MA in International Relations" / "Social Sciences"; "MBBS in Clinical Medicine". Source: src/app/_components/home-catalog.tsx:172-187 (discipline line then footer row with duration + tuition).',
    suggestion: 'Drop the discipline line when it already appears in the title, and lift tuition and duration next to the badge row.',
    effort: 'quick-win',
  },

  // ---------- flexibility ----------
  {
    id: 'audit-15',
    heuristic: 'flexibility',
    severity: 'minor',
    description:
      'The homepage offers exactly one discovery affordance — the hero search — and it is not reachable once the visitor scrolls past the hero. There is no second search entry point, no sticky search, and no "recently viewed" continuity, so the 8000px page can only be re-searched from the header nav.',
    evidence: 'src/components/catalog/home-catalog-search.tsx is mounted only inside HomeHero (src/app/_components/home-hero.tsx:86-88); no other mount exists on the page.',
    suggestion:
      'Add a compact search to the sticky header once the hero scrolls out of view, or a floating "Find a program" affordance, so a visitor who has scrolled to the testimonials can still search without scrolling back up.',
    effort: 'medium',
  },

  // ---------- aesthetic ----------
  {
    id: 'audit-16',
    heuristic: 'aesthetic',
    severity: 'minor',
    description:
      'The "Why Study in China?" illustration is a generic 3-D stock render (a 3-D map of China, a graduation cap, a stack of books, a globe) that illustrates nothing specific, and its alt text is the section heading itself, so assistive technology hears "Why Study in China?" twice.',
    evidence: 'src/app/_components/home-proof.tsx:200-208 — `src="/why-study-china.avif"` with `alt={t(\'why.title\')}`; the asset is a 24.7KB 3-D render.',
    suggestion: 'Replace it with a real photograph of students on a Chinese campus and give it an alt that adds information the heading does not already carry.',
    effort: 'medium',
  },
  {
    id: 'audit-17',
    heuristic: 'aesthetic',
    severity: 'minor',
    description:
      'The three Success Stories cards render full A4 letter scans at 3:4, so at ~460px wide the letter body text is unreadable and the three cards read as near-identical beige rectangles; the tiled SICA watermark further flattens them.',
    evidence: 'Live Success Stories grid on the homepage — three tall letter images whose only legible elements are the applicant line, the university header and the red stamp.',
    suggestion: 'Crop each card to the letterhead and stamp region, or pair a small thumbnail with a typed summary card (student, university, programme, date).',
    effort: 'medium',
  },

  // ---------- error-recovery ----------
  {
    id: 'audit-18',
    heuristic: 'error-recovery',
    severity: 'minor',
    description:
      'Every data-driven homepage section renders null when its query returns nothing, so a Supabase outage or an empty catalogue silently deletes whole sections with no message, no retry and no explanation — the page just reads as if it always had less content.',
    evidence:
      'src/app/_components/home-catalog.tsx:202 and :227 gate the university and program sections on `length > 0`; src/app/_components/home-proof.tsx:327 and :403 do the same for news and admissions. `fetchLatestNews` / `fetchLatestAdmissions` (home-proof.tsx:64-102) swallow the Supabase error and return [] with no log.',
    suggestion:
      'Distinguish "empty" from "failed": on a failed query render a short inline notice with a retry, and reserve the empty state for a genuinely empty table.',
    effort: 'medium',
  },

  // ---------- help-docs ----------
  {
    id: 'audit-19',
    heuristic: 'help-docs',
    severity: 'minor',
    description:
      'The "Why Study in China?" column makes cost and scholarship claims ("significantly lower than in Western countries", "generous scholarships available") with no figures and no link to any source; the only link in the whole column is "Learn More About China" to /about.',
    evidence: 'src/app/_components/home-proof.tsx:168-197 — the four why-cards are plain text, and the single link (home.deadlinesLink aside) goes to /about.',
    suggestion:
      'Give each claim one concrete, sourced figure and link it to the guide that substantiates it (cost -> the cost guide, scholarships -> the scholarship guide).',
    effort: 'medium',
  },

  // ---------- responsive ----------
  {
    id: 'audit-20',
    heuristic: 'responsive',
    severity: 'major',
    description:
      'Between 1024px and 1359px the entire primary navigation is behind a hamburger, so on a screen with plenty of horizontal room the visitor gets a 16-row mobile drawer instead of a nav bar. 1280x800 is still a very common laptop viewport.',
    evidence:
      'Live https://studyinchina.academy/ @1280x800: the only visible header link is the logo; the burger is visible. Breakpoint is `min-[1360px]` in src/components/header.tsx:54, :109, :119 and src/components/main-nav.tsx:269. 1366x768 is the narrowest width that still gets the desktop nav.',
    suggestion:
      'Drop the desktop-nav breakpoint to ~1024px (seven nav items plus three actions fit at 1024), or introduce a condensed nav for the 1024-1359px band.',
    effort: 'medium',
  },
  {
    id: 'audit-21',
    heuristic: 'responsive',
    severity: 'major',
    description:
      "On a 390px phone the hero's primary CTA is completely covered by the WhatsApp group popup and the chatbot launcher. Hit-testing the first glyph of \"Book a free consultation\" returns the popup container, not the link, so the page's main action is neither visible nor clickable on arrival.",
    evidence:
      'Live @390x844. Hero CTA rect = x16 y674 w201 h44. `document.elementsFromPoint(cta.x+6, cta.y+22)` returns: the chatbot prompt card, the WhatsApp popup (`fixed bottom-4 right-4 z-50`, 358x431 at x16 y397), the chatbot launcher button (`h-14 w-14 bg-[#1B2A4A]`, 56x56 at x16 y692) and the launcher wrapper (`fixed bottom-24 left-4 z-40`). The CTA sits entirely inside the popup rect.',
    suggestion:
      'Keep the bottom-left launcher clear of the hero CTA band, and hold the WhatsApp popup until the visitor has scrolled past the hero or interacted with the CTA.',
    effort: 'medium',
  },
  {
    id: 'audit-22',
    heuristic: 'responsive',
    severity: 'minor',
    description:
      "The hero search's placeholder is truncated to \"Subject, univers…\" on a 390px screen, so the third suggested term (\"city\") is never seen on mobile — and the search is the page's primary discovery affordance.",
    evidence: 'Live @390x844, the hero search input placeholder renders as "Subject, univers" with the rest cut off.',
    suggestion: 'Shorten the placeholder on narrow viewports ("Subject, school, city") or reduce the font size below 400px.',
    effort: 'quick-win',
  },
  {
    id: 'audit-23',
    heuristic: 'responsive',
    severity: 'minor',
    description:
      'The quick-access card grid is 2-up below 1024px, but the two cards that carry an extra link render 205px tall against 161px for the other two, so the row is visibly ragged.',
    evidence: 'Live measurement at 390/500px: "Top Universities" and "Diverse Programs" = 171x161; "Scholarships" and "Support Services" = 171x205 (the extra link adds a line).',
    suggestion: 'Make the cards equal height (grid `items-stretch` + `flex-col` on the card), or move the extra link inside the card body so the heights match.',
    effort: 'quick-win',
  },

  // ---------- performance ----------
  {
    id: 'audit-24',
    heuristic: 'performance',
    severity: 'minor',
    description:
      'A 285KB hero background is preloaded at high fetch priority on every homepage view — ahead of the search UI that is the actual first-screen interactive element — for an audience that is largely on mobile networks in West Africa and South Asia.',
    evidence: 'public/hero-bg.avif = 284,657 bytes; src/app/page.tsx:34 — `<link rel="preload" as="image" href="/hero-bg.avif" fetchPriority="high" />`. The catalogue search in the same viewport is the only thing a first-time visitor can act on.',
    suggestion:
      'Ship a smaller mobile-first hero (AVIF at <=1280px wide, ~60-90KB) and load the full-size one only above 1280px, or drop the preload and let the browser prioritise the search card.',
    effort: 'medium',
  },
  {
    id: 'audit-25',
    heuristic: 'performance',
    severity: 'minor',
    description:
      'The CSCA promo banner\'s dismiss control is a 28x28px target at the top of every public page — below the 44px touch-target guideline and easy to mis-tap on a phone.',
    evidence: 'Live measurement of the button with aria-label "Dismiss banner": 28x28 px on both desktop and 390px viewports. Source: src/components/csca-prep-banner.tsx.',
    suggestion: 'Give the dismiss button a 44x44px hit area (padding or a larger icon button) while keeping the icon visually small.',
    effort: 'quick-win',
  },
];

const opportunities = [
  {
    title: 'Make the locale choice survive the homepage',
    addresses_findings: ['audit-7'],
    priority: 'high',
    rationale:
      'One blocker, but it silently corrupts the experience of the whole Chinese-language audience: the server renders Chinese, hydration flips the hero CTA to English, the locale cookie is reset to "en", <html lang> says "en", and the next click lands on a fully English page. The fix is one component (drop the nested I18nProvider) plus a regression test, and it should land before anything else because every other homepage change gets evaluated in both locales.',
  },
  {
    title: 'Give every homepage action a working destination, and stop the overlays from covering them',
    addresses_findings: ['audit-1', 'audit-8', 'audit-9', 'audit-10', 'audit-21'],
    priority: 'high',
    rationale:
      'Five findings — one major overlay-collision finding, three major "the action does nothing" findings, and the heading-hierarchy problem that the same quick-access cards create — all land on the same three surfaces: the hero CTA, the four quick-access tiles, and the four "How SICA Helps You" steps. Right now the hero CTA is hidden under a popup on mobile, three of the four quick tiles are inert, the highest-intent step (Free Consultation) has no link at all, and the four tiles sit at the top of the document outline as H2s. Fixing them together is one pass over three components and turns the page from decorative to navigable.',
  },
  {
    title: 'Restore the desktop navigation between 1024px and 1359px',
    addresses_findings: ['audit-20', 'audit-15'],
    priority: 'high',
    rationale:
      'At 1280x800 — still a common laptop width — the only visible header element is the logo, and the whole navigation is a 16-row drawer. The desktop nav does not actually need 1360px; seven items plus three actions fit comfortably at 1024. Pairing this with one persistent search entry point (the hero search is currently reachable only at the top of the page) turns the page from scroll-only into navigable.',
  },
  {
    title: 'Redact student identifiers before publishing success stories',
    addresses_findings: ['audit-13', 'audit-17'],
    priority: 'high',
    rationale:
      'The strongest social proof on the site is currently built on publishing students\' passport numbers and full names on an indexable page. This is the one finding that cannot be fixed with a copy or layout tweak — it needs a redaction step in the upload pipeline and a pass over the already-published originals. Pairing it with a crop/typographic treatment (audit-17) means the section gets rebuilt once rather than twice.',
  },
  {
    title: 'One source of truth for the catalogue numbers on the page',
    addresses_findings: ['audit-3', 'audit-5', 'audit-6'],
    priority: 'medium',
    rationale:
      'Three findings, one root cause: numbers and destinations on the page are maintained in three places (the i18n description, the stats band, the live counts) and have already drifted — the snippet says 300+, the page says 200+, the catalogue holds 204. The same pass fixes the mislabeled "View All Programs" link that points at /universities and the stats band that presents counted and claimed numbers identically.',
  },
  {
    title: 'Make "Popular Fields of Study" land on a filtered result',
    addresses_findings: ['audit-4', 'audit-14'],
    priority: 'medium',
    rationale:
      'The section makes a six-way promise and delivers one generic page — five of the six tiles resolve to the identical unfiltered /universities URL. The catalogue finder already supports a discipline filter, so this is a wiring change, not a new feature. audit-14 rides along: drop the discipline line that repeats the card title and give the space to tuition and duration.',
  },
  {
    title: 'A page that fails gracefully and explains itself',
    addresses_findings: ['audit-2', 'audit-18', 'audit-19'],
    priority: 'low',
    rationale:
      'Three small but compounding gaps in the page\'s floor: the hero search collapses into an empty coloured band while loading, four whole sections can vanish silently on a Supabase error, and the "Why Study in China?" column makes cost and scholarship claims with no figures and no sources. Individually minor; together they are what makes the page feel thin rather than considered.',
  },
  {
    title: 'Polish pass: eight quick fixes that make the page feel finished',
    addresses_findings: ['audit-11', 'audit-12', 'audit-16', 'audit-22', 'audit-23', 'audit-24', 'audit-25'],
    priority: 'low',
    rationale:
      'Seven minor findings that share one property: each is a quick-win with no architectural risk, and together they are the difference between "designed" and "assembled". A doubled title suffix, an H1 that reads as one run-together word, a stock 3-D render standing in for a real photo, a truncated mobile placeholder, a ragged card row, an oversized hero preload, and a 28px dismiss target. They can be batched into one pass and verified together.',
  },
];

// ---- derive the summary programmatically (never hand-estimated) ----
const bySeverity = { blocker: 0, major: 0, minor: 0 };
const byHeuristic = {};
for (const f of findings) {
  bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
  byHeuristic[f.heuristic] = (byHeuristic[f.heuristic] || 0) + 1;
}

const payload = {
  skill: 'audit',
  generated_at: '2026-10-26T00:00:00.000Z',
  project_name: 'SICA — Study in China Academy',
  target: {
    type: 'url',
    reference: 'https://studyinchina.academy/ (local dev server on :5050 used for source cross-checks)',
    pages_audited: [
      '/ (homepage — hero, quick-access cards, featured universities, popular programs, why-China, stats band, fields of study, how-SICA-helps, video testimonials, consultation activity, news, success stories, closing CTA, footer)',
      '/programs (handoff target of the homepage CTA, checked for title/consistency)',
    ],
  },
  audit_framework: ['Nielsen-10', 'responsive', 'performance'],
  findings,
  opportunities,
  summary: {
    total_findings: findings.length,
    by_severity: bySeverity,
    by_heuristic: byHeuristic,
    top_opportunities: opportunities.map((o) => o.title),
  },
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
console.log('wrote', OUT);
console.log('findings:', findings.length, '| by severity:', JSON.stringify(bySeverity));
console.log('opportunities:', opportunities.length);
console.log('heuristic coverage:', Object.keys(byHeuristic).length, 'of 12 dimensions');

// ---------------------------------------------------------------- Markdown report
const DIMENSIONS = [
  ['visibility', '系统状态可见性'],
  ['real-world-match', '与现实世界匹配'],
  ['user-control', '用户控制与自由'],
  ['consistency', '一致性与标准'],
  ['error-prevention', '错误预防'],
  ['recognition', '识别优于回忆'],
  ['flexibility', '使用的灵活性与效率'],
  ['aesthetic', '美学与极简设计'],
  ['error-recovery', '错误识别与恢复'],
  ['help-docs', '帮助与文档'],
  ['responsive', '响应式适配（自定义）'],
  ['performance', '性能感知（自定义）'],
];

const SEV_LABEL = { blocker: '🔴 Blocker', major: '🟠 Major', minor: '🟡 Minor' };
const EFFORT_LABEL = {
  'quick-win': 'quick-win（当日可改）',
  medium: 'medium（一次改动）',
  'major-rework': 'major-rework（需新建流程）',
};
const PRIO_MARK = { high: '🥇', medium: '🥈', low: '🥉' };

const lines = [];
lines.push('# Audit — SICA 首页 UI/UX 启发式走查');
lines.push('');
lines.push('- **生成时间**：2026-10-26');
lines.push('- **走查对象**：https://studyinchina.academy/ （生产环境，实测）＋ 本地代码 `src/app/page.tsx` / `src/app/_components/home-{hero,catalog,proof}.tsx`');
lines.push('- **走查页面数**：1 个主页面（首页）+ 1 个交接页（/programs，校验一致性）');
lines.push('- **走查模式**：自动走查（代码 + 无头浏览器实测，桌面 1440/1280、移动 390 三档视口）');
lines.push('- **走查框架**：Nielsen 10 原则 + 响应式 + 性能，共 12 个维度');
lines.push('');
lines.push('## 总览');
lines.push('');
lines.push('| 严重度 | 数量 |');
lines.push('| --- | --- |');
lines.push(`| 🔴 Blocker | ${bySeverity.blocker} |`);
lines.push(`| 🟠 Major | ${bySeverity.major} |`);
lines.push(`| 🟡 Minor | ${bySeverity.minor} |`);
lines.push(`| **合计** | **${findings.length}** |`);
lines.push('');
lines.push('**按维度分布**：');
lines.push('');
lines.push('| 维度 | findings 数 |');
lines.push('| --- | --- |');
for (const [key, label] of DIMENSIONS) {
  lines.push(`| ${label} (\`${key}\`) | ${byHeuristic[key] || 0} |`);
}
lines.push('');
lines.push('> 走查过程中另外核对了首页全部 49 个站内链接，生产环境全部返回 200，无死链；下述问题均为「链接有效但目的与承诺不符」或「不可点击」，不是死链问题。');
lines.push('');
lines.push('## 改版机会点（按优先级排序）');
lines.push('');
const grouped = { high: [], medium: [], low: [] };
for (const o of opportunities) grouped[o.priority].push(o);
for (const prio of ['high', 'medium', 'low']) {
  if (!grouped[prio].length) continue;
  lines.push(`### ${PRIO_MARK[prio]} ${prio === 'high' ? '高优先级' : prio === 'medium' ? '中优先级' : '低优先级'}`);
  lines.push('');
  grouped[prio].forEach((o, i) => {
    lines.push(`**机会点 ${grouped[prio].indexOf(o) + 1}：${o.title}**`);
    lines.push('');
    lines.push(`- 关联 findings：${o.addresses_findings.length} 个 → ${o.addresses_findings.join(', ')}`);
    lines.push(`- 优先级理由：${o.rationale}`);
    lines.push('');
  });
}
lines.push('## 完整 Findings 清单');
lines.push('');
let n = 0;
for (const [key, label] of DIMENSIONS) {
  const list = findings.filter((f) => f.heuristic === key);
  if (!list.length) continue;
  lines.push(`### 维度 ${DIMENSIONS.findIndex((d) => d[0] === key) + 1}：${label} (\`${key}\`)`);
  lines.push('');
  for (const f of list) {
    n += 1;
    lines.push(`${n}. **${SEV_LABEL[f.severity]}** ${f.description}`);
    lines.push(`   - 出现位置：${f.evidence}`);
    lines.push(`   - 修复建议：${f.suggestion}`);
    lines.push(`   - 修复成本：${EFFORT_LABEL[f.effort]}`);
    lines.push('');
  }
}
lines.push('## 下一步建议');
lines.push('');
lines.push('- **先修两个 blocker**：`audit-7`（中文用户的语言选择在首页被静默清空）是一处组件删除 + 一条回归测试的改动；`audit-13`（公开的成功案例图片里有护照号与全名）需要上传管线加一道遮蔽并处理已发布的存量图片，属于需要单独排期的隐私项。');
lines.push('- **再做一个高优先级批次**：`audit-1 / 8 / 9 / 10 / 21` 合并为「让首页上每个动作都真的有落点，并让浮层别挡住主 CTA」，涉及 hero、quick-access 卡片、How-SICA-Helps 卡片三个组件 + 浮层互斥逻辑。');
lines.push('- **导航断点单独处理**：`audit-20`（1024–1359px 整条导航收进汉堡菜单）是一处断点值调整，收益直接。');
lines.push('- **数据一致性**：`audit-3 / 5 / 6` 一起改——把 meta description 里的「300+」与统计条的数字统一到同一个数据源，顺手修掉「View All Programs → /universities」的错链。');
lines.push('');
lines.push('> 走查基于专家启发式判断与真实浏览器实测，不替代 5–10 人真实用户测试（/用户研究 Probe）与完整 WCAG 合规审计（/无障碍 Access）。');
lines.push('');

const MD = path.join(__dirname, '..', 'spark-output', 'audit', 'sica-homepage.md');
fs.writeFileSync(MD, lines.join('\n'), 'utf8');
console.log('wrote', MD);
