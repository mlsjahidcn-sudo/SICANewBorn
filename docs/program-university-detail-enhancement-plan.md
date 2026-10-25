# Program and university detail enhancement plan

Reviewed: 24 October 2026. Status: proposed; implementation has not started.

## Scope and evidence

Improve the public `/programs/[slug]` and `/universities/[slug]` pages, their public catalog reads, and the handoff to assessment/counselling. Preserve current URLs, server rendering, translations, listing filters, and SICA's Inter/crimson/navy/warm-white/square-corner design.

Reviewed the live UI at desktop size and 390 × 844, including:

- [Tsinghua University](https://studyinchina.academy/universities/tsinghua-university): overview, admissions, scholarships, and mobile layout.
- [BSc in Computer Science](https://studyinchina.academy/programs/computer-science-bsc-tsinghua): populated program, fees, mobile navigation, and floating controls.
- [Chinese Language Program](https://studyinchina.academy/programs/chinese-language-program-chinese-language-chinese-tsinghua-university): imported record with an empty overview and curriculum.

Also reviewed the route components, query helpers, mappers, FAQ builders, application links, booking/assessment forms, loading states, gallery, and floating contact components. Production catalog inspection used read-only schema and aggregate queries. No student records, form submissions, or database changes were needed.

### Live catalog coverage

Counts use `is_published = true AND archived_at IS NULL`. They describe the database at review time, not a permanent catalog size. Missing array counts below inspect the English/base fields; translation fallback coverage was not separately counted.

| Measure | Count | Consequence |
|---|---:|---|
| Published, non-archived programs | 6,616 | Design for a large, uneven catalog |
| Missing requirements | 6,281 (94.9%) | A permanently visible requirements tab often opens an empty panel |
| Missing curriculum | 6,600 (99.8%) | Curriculum should be conditional until verified content exists |
| Missing tuition | 3,661 (55.3%) | Unknown fees need an explicit state, rather than blank values |
| Missing duration | 2,064 (31.2%) | Summary cards need missing-value handling |
| Missing intake | 419 | Do not invent the next available intake |
| Universities with more than 50 public programs | 45 | The detail route's 50-record limit is materially misleading |
| Largest public program count at one university | 413 | Loading every program into the initial detail page is unsuitable |
| Unpublished or archived program rows | 19 | Public visibility rules need consistent enforcement |

Reproduce the coverage check:

```sql
WITH live AS (
  SELECT * FROM public.programs
  WHERE is_published = true AND archived_at IS NULL
), per_uni AS (
  SELECT university_slug, count(*) AS n FROM live GROUP BY university_slug
)
SELECT
  (SELECT count(*) FROM live) AS published_programs,
  (SELECT count(*) FROM live WHERE coalesce(cardinality(requirements), 0) = 0) AS missing_requirements,
  (SELECT count(*) FROM live WHERE coalesce(cardinality(curriculum), 0) = 0) AS missing_curriculum,
  (SELECT count(*) FROM live WHERE tuition IS NULL OR btrim(tuition) = '') AS missing_tuition,
  (SELECT count(*) FROM live WHERE duration IS NULL OR btrim(duration) = '') AS missing_duration,
  (SELECT count(*) FROM live WHERE intake IS NULL OR btrim(intake) = '') AS missing_intake,
  (SELECT count(*) FROM per_uni WHERE n > 50) AS universities_above_50,
  (SELECT max(n) FROM per_uni) AS largest_program_count;
```

## Findings and priorities

| Priority | Confirmed finding | Evidence and proposed correction |
|---|---|---|
| P0 | University page overflows on phones | Tsinghua measured **401px document width at a 390px viewport**, on Overview. The main grid and its children extend past the container. Inspect intrinsic minimum widths, use a bounded single-column mobile grid and `min-w-0`, and allow long text to wrap. Do not mask the defect with a global overflow rule. |
| P0 | Empty program panels have no explanation | The language program shows an About heading without descriptive text and an empty Curriculum panel. Add honest unavailable states; omit a curriculum tab when there is no curriculum in either locale. Keep requirements discoverable with a confirmation action when requirements are absent. |
| P0 | Public visibility rules differ between reads | `getProgramBySlug` filters only by slug; `fetchProgramRows`, used by university details, has no publication/archive restriction. The public finder does filter. This is a confirmed code gap; direct access to the 19 non-public rows was not exercised. Apply the same public rules to detail, related, count, and embedded-list reads, and test them. |
| P0 | Program count is a loaded subset | University route calls `getProgramsByUniversity(slug, 50)` and displays `programs.length` as the count. Fetch an exact public count separately and a small paginated program page. Scholarship totals must use the complete public set too. |
| P0 | Admission information looks university-specific but is generic | University Admissions hardcodes HSK 4/5 and IELTS 6.0/TOEFL 80 for every university. Clearly distinguish general preparation guidance from published university/program requirements. Do not infer language scores or eligibility from a template. |
| P0 | Intake status lacks sufficient context | Tsinghua displays “Applications closed for this intake,” while its language program lists February 2027. The university deadline can also inherit a static 2026-07-15 fallback. State which intake/year a deadline concerns; expired or unverified dates must not imply every program is closed. |
| P1 | Action names and destinations disagree | University “Apply Now” opens counselling; program “Apply via SICA” opens assessment. University “View Admissions” opens Contact instead of the Admissions section. Use clear action labels and consistent destinations. |
| P1 | Selection context is lost during conversion | Program links pass `program`, but assessment reads only `major`; counselling does not read the passed program/university selection and submits only its pathname plus UTM data. Carry validated catalog slugs through the form, server payload, saved lead/booking, and confirmation. |
| P1 | Program tab controls lack tab semantics | Program navigation consists of plain buttons without tab/tabpanel roles or selected state. At 390px the selected Tuition & Fees tab is outside the visible strip. Reuse accessible Tabs, ensure the active tab is visible, and preserve the selected section in the URL. |
| P1 | Floating prompts compete with primary actions | On a phone the AI prompt covered the program support card's Apply button. Global chatbot, WhatsApp float, contact launcher, group popup, and university apply bar can coexist. Coordinate them on detail routes and reserve space for the primary action. |
| P1 | Costs are not a useful breakdown | Tuition & Fees repeats tuition, duration, intake, and scholarship status. Separate published tuition and its billing period from accommodation, other published fees, and unknown costs. Do not calculate an all-in cost from arbitrary fee strings. |
| P2 | Important content is repeated or buried | Program duration/tuition/language are repeated in hero and overview; university programs sit below other overview content. Related universities precede application support in the sidebar. Elevate program selection and decision facts, and move alternatives lower. |
| P2 | Gallery has no image-viewing interaction | Campus images are thumbnails without an enlarge action; `selectedImage` state is unused. Add an accessible gallery dialog with captions and keyboard controls, or remove the unused state until that feature is implemented. |
| P2 | Data normalization and presentation drift | Detail programs have a separate mapper from the finder. University mapper uses `String(row.field)` on nullable values, which can emit literal `null`/`undefined`. Consolidate shared normalization while preserving current localized fallbacks. |

Additional code issue: university FAQ schema always claims CSC participation and university scholarships, regardless of saved evidence. Its program count also uses the capped subset. Make visible guidance and structured answers use the same verified facts. The program FAQ helper already handles unknown values more cautiously and is a useful starting point.

## Target page designs

### University detail

1. **Compact identity header:** campus image, logo, university name, city, verified classification/rank with year/source when available. Keep SICA's editorial rating explicitly labelled as editorial.
2. **Decision summary:** next published intake, program count, tuition basis/range, accommodation estimate, and dated availability status. Missing values say “Not published” or “Confirm with SICA.”
3. **Primary action:** “Book a free consultation,” with the university already selected. “Start assessment” is a separate, accurately named secondary path.
4. **Five sections:** Overview · Programs · Admissions · Costs & funding · Campus life. Use sticky navigation with clear horizontal-scroll affordance on phones and visible selected state.
5. **Programs section:** server-paginated results, search plus degree/language filters, true total count, and compact rows showing program, language, duration, tuition basis, intake, and scholarship state. Keep it usable for a university with 413 programs. Preserve filters/page when returning from a program.
6. **Admissions:** published criteria where available, a clearly labelled general document-preparation checklist, and links to individual program requirements. Avoid universal score requirements.
7. **Costs & funding:** separate published university/program funding from the existing general China scholarship guide. Unknown availability remains unknown. Show coverage, eligibility, intake and deadline only when supported by saved information.
8. **Campus life:** accommodation, room types, saved costs, gallery, and location information when available. Present testimonials as SICA stories unless they are actually linked to this university.
9. **Desktop sidebar:** selected university and consultation action first; related universities below. On phones use one coordinated action bar, with bottom content padding and safe-area support.

### Program detail

1. **Compact header:** program name, university link, degree, teaching language and scholarship state. Present a single fact summary instead of duplicating the same tiles below it.
2. **Four sections at most:** Overview · Requirements · Costs & funding · Curriculum. Only show Curriculum when there is saved content in at least one locale. Requirements always explains whether criteria are published or awaiting confirmation.
3. **Requirements:** distinguish academic entry criteria, language evidence and application documents when that information is actually saved. No generated minimum scores or automatic eligibility claims.
4. **Costs & funding:** published tuition with currency and annual/semester basis, duration, available accommodation estimates with their source university, and verified scholarship details. Mark unknown costs individually; do not present unknown as zero or free.
5. **Application support:** a persistent desktop action card and coordinated mobile bar, carrying the exact program and university. A context-aware WhatsApp link is secondary.
6. **Next steps:** short explanation of consultation, document preparation, assessment and submission. Label actions according to the step they start.
7. **Related programs:** show degree, language, tuition/intake when available, and university identity so cross-university suggestions are understandable. Preserve the existing finder return query.

## Implementation sequence

### DP-1 — Public data correctness and missing states

Start here. No design overhaul or catalog rewrite is required.

- Define public visibility once and reuse it for detail queries, counts, related programs and university program previews. Preserve unrestricted admin reads through explicit separate access paths.
- Separate a successful not-found/hidden result from a failed database read. Static seed fallback must not resurrect a hidden record; make offline fallback an explicit contract.
- Normalize nullable values, scholarship's true/false/unknown states and localized fallbacks consistently. Preserve raw published fee strings.
- Return an exact public program total plus a small result page; stop using a 50-row subset as the total.
- Add unavailable states for description, requirements, curriculum, fees, language and intake. Remove unverified deadline fallback from public availability decisions.
- Replace universal requirements and unconditional scholarship assertions with evidence-based content and clearly labelled general guidance.

### DP-2 — Mobile layout and accessible navigation

- Fix the measured university overflow through grid sizing, wrapping and bounded children.
- Reuse existing shadcn Tabs on both pages. Add section URL state, keyboard navigation, visible focus, and automatic active-tab visibility.
- Coordinate detail-page chat/contact/popup/apply-bar display. Ensure prompts cannot cover the primary action or trap a tab click.
- Use appropriate content skeletons and distinguish unavailable data, zero programs and a failed request. Provide retry for transient failures.

### DP-3 — Conversion and selection handoff

- Use one link/context helper for university and program actions; retain existing UTM behavior and finder return state.
- Make consultation and assessment distinct, accurately labelled actions.
- Validate program/university slugs server-side; derive the university from the selected program and reject mismatched references.
- Persist selected catalog context in booking/assessment records and expose it to staff and on confirmation. Inspect existing lead/booking columns before deciding whether an additive migration is needed.
- Track meaningful detail views, primary action clicks, section changes, and handoff completion using existing analytics conventions. Never include personal form data in analytics.

### DP-4 — University program browser and information hierarchy

- Introduce the dedicated Programs section with server pagination and degree/language/search controls, reusing the public finder query layer.
- Keep counts and filters consistent with `/programs?university=…` and provide a link to that finder.
- Build shared summary facts and costs/funding presentation; move application support before alternatives.
- Keep server-fetched initial HTML and bound the data passed into client components. Do not ship the whole university catalog to the browser.

### DP-5 — Verified content and finishing work

- Introduce source URL, last verified date and intake-specific deadline/funding information where the existing schema cannot represent it. Any new schema changes should be additive and reviewed separately.
- Prioritize requirements, fees and intake verification for frequently visited/selected programs before writing long descriptions or curricula for every row.
- Keep AI-assisted drafts unpublished until staff verify them against official university material. Do not infer missing fees, scholarship awards or admission scores.
- Add the accessible gallery, useful visible FAQs backed by the same facts as schema, and relevant related programs/news. Reduce unrelated material ahead of decision-critical sections.
- Preserve canonicals, detail slugs, language alternates and truthful structured data. Do not add a new visual framework or animation library.

## Code areas

| Area | Existing files |
|---|---|
| University route, totals, FAQ and related data | `src/app/universities/[slug]/page.tsx` |
| University UI and embedded programs | `src/app/universities/[slug]/_components/university-detail-client.tsx` |
| Program route and related data | `src/app/programs/[slug]/page.tsx` |
| Program UI | `src/app/programs/[slug]/_components/program-detail-client.tsx` |
| Public reads and normalization | `src/lib/program-queries.ts`, `src/lib/program-query.ts`, `src/lib/program-rows.ts`, `src/lib/university-queries.ts`, `src/lib/catalog-mappers.ts` |
| FAQ content | `src/lib/program-faq.ts`, university route's `buildFaqSchema` |
| Existing reusable UI | `src/components/ui/tabs.tsx`, `src/components/StickyApplyBar.tsx`, `src/components/deadline-countdown.tsx`, `src/components/university-logo.tsx` |
| Contact overlays | `src/components/client-layout.tsx`, `src/components/ai/Chatbot.tsx`, `src/components/whatsapp-group-popup.tsx`, `src/components/whatsapp-float.tsx`, `src/components/sticky-contact.tsx` |
| Selection handoff | `src/components/GetStartedCta.tsx`, `src/app/assessment/assessment-form.tsx`, `src/app/counselling/booking-wizard.tsx`, their API/storage handlers |

## Acceptance and verification

- At 320, 390, 768 and 1440px, the document does not scroll horizontally; long university/program names and fee text wrap. Tab strips may scroll inside their own bounded container.
- Every section is usable by keyboard, exposes selected state, stays visible when activated, and survives refresh/back navigation.
- No popup, chat launcher or action bar obscures an application action, a focused field or the final content. Test after timed prompts appear, not only on first load.
- A university with more than 50 programs shows its exact public total, can reach every public program through pagination, and never exposes an unpublished/archived program through detail, preview, related or count results.
- Blank descriptions, empty requirements/curriculum, null scholarships and unpublished fees/intakes produce understandable states. No fabricated values, literal `null`, false “free” costs or unsupported admission thresholds.
- A deadline names its intake/year. An expired deadline for one intake does not mark unrelated future programs closed.
- Consultation and assessment actions retain program, university, originating page and UTM context through a successful submission. Use mocks or a development database for write tests.
- Program and university actions, labels and destinations agree. “View Admissions” opens admissions information.
- English and Chinese handle partial translations; existing slugs, canonical links, finder filters and return navigation remain valid.
- Visible FAQs and schema contain the same supported facts; general scholarship guidance is not represented as verified university funding.
- Measure performance before and after at the same viewport/network settings; retain server rendering and avoid an unbounded catalog payload. No performance score is claimed by this review.
- Add meaningful query/mapper/visibility and context-handoff tests, plus browser checks on one rich record, one sparse record, one university above 50 programs, and expired/unknown/future intake states.
- Before shipping implementation, run `npm run lint`, `npm run ts-check`, `npm test`, `npm run build`, then smoke-test the production server. Repeat the core browser checks after deployment.

Recommended first release: **DP-1 + DP-2**, followed by **DP-3**, then the program-browser/layout work in **DP-4**. Verified content enrichment and gallery polish follow in **DP-5**.
