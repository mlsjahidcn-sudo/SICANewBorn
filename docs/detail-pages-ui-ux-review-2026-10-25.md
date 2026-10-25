# University and program detail: UI/UX review and enhancement plan

Reviewed 25 October 2026. Scope: review and planning; no application code changed by this review.

## Assessment

Keep the current SICA visual direction. The local pages already have a useful shared structure: campus imagery, clear typography, square bordered panels, a single facts summary, accessible tabs, and application support before alternatives. The highest-value next release is to finish navigation and the consultation handoff, reduce mobile obstruction, and clarify intake and funding evidence.

The deployed university page and current workspace differ substantially. Production still has the older four-tab layout, related universities above application support, “View Admissions” linking to Contact, and an unqualified “Applications closed for this intake” message. The workspace already improves these areas. Do not rebuild completed local work or treat it as deployed.

This is a follow-up to `docs/program-university-detail-enhancement-plan.md`, dated 24 October. Its “implementation has not started” status no longer describes the workspace. Preserve that document as the earlier baseline; use this review to prioritize the remaining work. Its catalog coverage statistics were not re-queried for this review.

## Evidence and limits

Browser inspection covered:

- Deployed Tsinghua University: initial layout, information hierarchy, action destinations, and floating controls.
- Local Tsinghua University: Overview, Programs, subject shortcut, program links, and navigation during scroll.
- Local BSc in Computer Science: mobile summary, Costs and funding, related programs, and university return link.
- Local Chinese Language Program: sparse description, absent Curriculum tab, summary, desktop layout, and consultation destination.
- Consultation arrival from the language program: selected catalog context is in the URL but absent from the visible booking page. Booking payload and API inspected in code; no booking submitted.

Actual browser-reported viewport widths were 375px and 1384px. The requested browser overrides were 390px and 1440px; measurements below use the actual widths. The inspected local views had document width equal to viewport width. This does not establish overflow safety for every route, tab, language, or device.

Code inspection also covered shared detail components, program pagination/count helpers, public program reads, FAQ builders, assessment and booking payloads, global overlays, and loading components. No production writes or personal form submissions were performed. Performance, full accessibility compliance, Chinese rendering, and complete pagination coverage were not measured in this pass.

## Existing improvements to retain

| Area | Current workspace status |
|---|---|
| Shared structure | Both pages use the same containers, fact tiles, support panel, and Radix tab components. |
| University programs | Dedicated Programs tab, server result pages, search, degree/language filters, exact public count queries, and finder link exist. End-to-end large-catalog pagination still needs verification. |
| Program return navigation | Opening Computer Science from the university preserves the university Programs section in a validated return URL. |
| Sparse program content | Language program explains its missing description and omits the empty Curriculum tab. Requirements has an explicit missing-content state. |
| Admissions | University UI replaces universal score requirements with program-specific guidance and a labelled general preparation checklist. |
| Action labels | Primary detail actions now say “Book a free consultation”; assessment is a separate action. |
| Public program reads | Detail and university program-row helpers now apply publication/archive restrictions in code. Verify consistently before release. |
| Gallery | Dialog, previous/next controls, image position, and arrow-key handlers exist. Keyboard/focus and image-error behavior still need a browser check. |

## Prioritized remaining findings

P0 means release-blocking misinformation or loss of essential conversion context. P1 means a significant usability improvement. P2 means finishing work or a later feature.

| Priority | Finding and evidence | Enhancement and completion criterion |
|---|---|---|
| P0 | **Consultation loses the student's selection.** Detail URLs include university/program, but `BookingWizard` neither reads those parameters nor includes them in POST. Booking API stores contact/topic/source data without catalog context. The arrival page is generic. | Show a compact “Discussing: program — university” summary near the booking form. Validate catalog slugs server-side, derive the university from the selected program, and persist the selection through booking, staff view, and confirmation. For this entry path, land at `#book` so the student does not repeat the full counselling landing-page journey. Inspect storage before choosing an additive migration. |
| P0 | **University structured answers still make blanket claims.** `buildFaqSchema` says every university participates in CSC and offers its own scholarship. It also supplies generic program/discipline assertions. Visible university funding guidance is more cautious. | Use one evidence-based, localized answer model for visible FAQs and structured data. Unknown scholarship participation stays unknown. No invented program offerings, ranking context, or university partnerships. |
| P1 | **Floating controls obstruct detail content.** At mobile size the fixed contact and WhatsApp launchers overlap fact labels/values. On desktop an automatic WhatsApp group panel covered the hero and summary. Multiple independent launchers remain globally mounted. | Coordinate detail routes through the public layout. Keep one unobtrusive help entry; open additional options on request. If adding a mobile primary-action bar, replace competing fixed widgets on these routes and reserve bottom/safe-area space. Verify after delayed prompts appear. |
| P1 | **University section navigation is not actually sticky through its content.** The sticky element sits inside a wrapper only as tall as the tab strip. During the program list, its top measured about -306px while the active panel still extended to about 808px below the viewport top. | Remove the limiting wrapper or put sticky behavior on the correct ancestor. Tabs should remain directly below the site header while the active panel is being read and stop when the detail section ends. |
| P1 | **Program header delays useful detail on phones.** Back row, campus photo, badges, title, university card, CTA, and fact tiles occupy more than the first mobile viewport. Tabs and requirements start further down. On desktop the same elements stack vertically with substantial unused space to the right. | Keep imagery, but reduce its mobile height and compact the university identity into a lighter row. Prioritize duration, tuition basis and next recorded intake over discipline. At desktop, group title/identity and action more efficiently. Aim to show the title, key cost/intake facts, and a clear next action in the first mobile screen for normal-length titles. |
| P1 | **Intake information is not a current availability decision.** Computer Science lists “September” without a year. The university lists recurring seasons, while the language program lists February 2027. Production's closed-state message lacks a named intake. The local deadline notice is safer but still has no intake association. | Separate recurring start months, a dated intake, an application deadline, and verified open/closed status. Show “Next intake: confirm with SICA” when no dated intake is verified. Never infer that all programs are closed from one university deadline. |
| P1 | **Missing critical facts disappear from the summary.** Both clients filter unknown facts out. A sparse record can therefore silently omit tuition or intake exactly where students expect to compare them. | Keep stable slots for tuition, duration, teaching language and intake as appropriate, using “Not published” or “Confirm with SICA.” Do not present missing tuition as zero or calculate totals from fee strings. |
| P1 | **Subject shortcuts promise more than they do.** Clicking “Computer Science” opens the unfiltered four-program list; every subject button runs the same handler. Some displayed subjects may have no current published program. | Either render these subjects as noninteractive information, or link each to a supported discipline/program filter and display the applied filter. Offer only shortcuts grounded in current catalog data. |
| P1 | **Empty program lists conflate no catalog entries with no filter matches.** `UniversityPrograms` always says “No programs match” and advises clearing a filter, even when the university has zero public programs and no filter is active. | Use distinct states: no published programs → consultation/finder alternative; no matches → reset current filters; failed read → retry. Keep a direct recovery action inside the state. |
| P1 | **Related programs lack university context.** Computer Science's related list includes Artificial Intelligence at Harbin, but the card shows no university. It also mixes degrees/languages without an explanation of the match. | Put the university name on every related-program card. Prefer same degree/discipline/language when available and label the reason, such as “Same university” or “Similar subject.” Preserve return context when moving through related records. |
| P2 | **Requirements confirmation is remote from the missing-content message.** The empty requirements notice tells students to ask a counselor; the actionable support card is elsewhere and below the content on mobile. | Add an inline “Confirm this program's requirements” link with selected program context. Separate academic criteria, language evidence and documents only when the saved information supports those groups. |
| P2 | **Funding presentation needs clearer labels and evidence.** Costs currently displays “Scholarship Available” as both a label and a value for funded programs. The summary badge gives no coverage, eligibility or intake detail. | Use “Scholarship status” as the label. Distinguish listed funding, no listed funding and unknown status. Add coverage, eligibility, source and relevant intake only after staff verification. |
| P2 | **Localization and navigation polish are incomplete.** The tablist's accessible name is hardcoded in English; embedded and related rows print raw degree/language values. Tab auto-scroll always uses smooth behavior, without consulting reduced-motion preference. | Localize accessible labels and catalog values consistently. Respect reduced motion. Add a subtle clipped-edge/scroll cue for narrow tab strips, and check active-tab visibility, keyboard focus, back/forward and refresh. |
| P2 | **Loading and failure presentation is generic.** Both detail routes use the shared route skeleton, and there is no detail-specific error boundary. | Match skeleton geometry to the final detail header/facts/panels. Provide a useful retry and return-to-results action for failed reads; preserve the distinction between failure and not-found. |
| P2 | **Trust metadata is absent.** QS rank has no displayed edition/source; content is labelled “Published by the university” based on nonempty requirements, without source evidence in this UI. | Add source/last-verified information for decision-critical content. Until evidence is recorded, use “Listed requirements.” Verify high-traffic programs before expanding long descriptions or curricula. |

## Proposed page layouts

### University

1. Compact campus hero: name, logo, city, classification, program count; accurately named consultation action and “Explore programs.”
2. Stable decision summary: recorded intake, tuition ranges/basis, relevant verified ranking. State unknown values explicitly.
3. Sticky tabs: Overview · Programs · Admissions · Costs and funding · Campus life.
4. Overview: concise description, verified highlights, brief profile, gallery preview. Subject links only when they actually filter.
5. Programs: exact total, bounded result page, search and degree/language filters; clear empty/error recovery; preserve results on return.
6. Desktop support panel beside active content. On mobile, one coordinated primary action after the hero scrolls away, with help available on demand.
7. Related universities, relevant stories/news, then footer. Use institution-specific stories only when that association is verified.

### Program

1. Compact image and identity area: program, university, degree and teaching language. Keep university identity visually secondary to the program title.
2. Stable summary: duration, tuition with billing period, dated intake or confirmation state; scholarship status qualified by evidence.
3. Primary consultation action; secondary assessment path with the same validated selection.
4. Sticky tabs: Overview · Requirements · Costs and funding · Curriculum when populated.
5. Requirements: actual listed criteria or a concise confirmation state with an inline action. Avoid a large empty content panel.
6. Costs: tuition, university housing range explicitly labelled as such, known other fees, unknown items, and funding status. No unsupported all-in estimate.
7. Alternatives: university name, degree/language, cost basis, intake, and why each program is related.

## Delivery sequence

| Batch | Work | Dependencies and checks |
|---|---|---|
| 1 — Finish existing work | Fix university sticky tabs; coordinate overlays; correct subject shortcuts, empty states, scholarship label, and unsupported FAQ assertions. | Works with the existing components. Browser checks on rich/sparse records, long scrolling, and delayed prompts. |
| 2 — Complete the handoff | Consultation/assessment selection summary, validated payload, persistence, staff visibility and confirmation; context-aware booking entry. | Inspect booking/assessment schema first. Mock writes in tests; do not create real bookings for verification. |
| 3 — Improve mobile decisions | Compact program header; stable missing-value facts; clear dated intake/availability states; better related-program context. | Layout can ship with honest unknown states. Verified availability needs structured intake data. |
| 4 — Add verified depth | Source/date metadata, intake-specific deadlines and funding, verified requirements, contextual FAQs, gallery/error/loading/localization polish. | Editorial and potentially additive schema work. Prioritize frequently visited programs; preserve raw published fees. |

Recommended first release: batches 1 and 2. Keep existing Inter, crimson/navy/warm-white palette, square corners, Lucide icons, URLs, server rendering, and catalog return links.

## Acceptance criteria

- Check 320, 375/390, 768 and 1440px; record actual viewport dimensions. No document-level horizontal overflow, clipped fee text, covered controls or hidden final content.
- Tabs remain visible within active detail content; keyboard selection, active state, refresh/back/forward, narrow-strip scrolling and reduced motion work.
- A university with more than 50 programs shows the exact public total and every result is reachable. Degree/language/search, reset and return navigation remain consistent.
- Rich, sparse, zero-program, no-match, failed-read, unknown-funding and unknown/past/future-intake states each have appropriate content and recovery.
- Consultation and assessment preserve validated university/program context through UI, API, storage, staff view and confirmation. No personal form data in analytics.
- Claims in visible content and schema use the same supported facts; no blanket CSC claims, invented scores, assumed next intake or inferred cost totals.
- Check English/Chinese, long names, missing images, gallery focus/close/arrow keys, and delayed global prompts.
- For implementation, run relevant behavior/query/handoff tests plus required type, lint, translation, test and build gates. Measure production performance separately; this review makes no score claim.

## Main implementation locations

- University UI: `src/app/universities/[slug]/_components/university-detail-client.tsx`
- Program UI: `src/app/programs/[slug]/_components/program-detail-client.tsx`
- Shared navigation/facts/actions: `src/components/public-detail/detail-ui.tsx`
- Embedded program browser: `src/components/public-detail/university-programs.tsx`
- University program reads/counts: `src/lib/university-programs.ts`
- Global overlays: `src/components/client-layout.tsx` and its chat/contact/popup components
- Consultation handoff: `src/app/counselling/booking-wizard.tsx`, `src/app/api/counselling/bookings/route.ts`
- Assessment handoff: `src/app/assessment/assessment-form.tsx`, `src/app/api/assessments/route.ts`
- Visible/schema answer consistency: university route's `buildFaqSchema`, `src/lib/program-faq.ts`

## Implementation follow-up — 25 October 2026

The enhancement plan is implemented in the workspace. Both detail pages now share stable decision facts, localized accessible section navigation, clear source/intake/funding states, contextual consultation and assessment links, visible FAQs backed by the same JSON-LD, responsive support actions, and detail-specific loading/error recovery. The program header is substantially more compact on mobile. Global promotional/chat overlays are suppressed on detail and handoff routes; the mobile action/help bar appears after the hero action scrolls away and reserves safe-area space.

University programs retain exact public totals, bounded result pages and filter/return state. Subject chips are now explicitly informational. Empty, filtered-empty and failed results have different recovery actions. Related program cards show their university and matching reason. Public program detail API reads enforce publication/archive rules, with authenticated admin reads retained for editing. Fallback query pagination has a unique slug tie-breaker.

The consultation and assessment pages resolve the catalog selection on the server. POST handlers validate it again, derive the institution from the selected program and reject mismatches. Canonical selection is retained in the existing booking topic/assessment notes and source path, visible to staff, and returned to confirmation. UTM attribution remains separate. Assessment prefill survives wizard step changes. No real form submission or email was used for verification.

Migration `supabase/migrations/20261025035558_catalog_detail_verification.sql` was applied to project `wbzdwwvtbaftjxecgdxk`. It adds optional `detail_verification` JSONB columns to the two catalog tables. Both existing RLS settings were checked and remain enabled. Staff can edit source/date, named intake/year, recorded status/deadline, funding details and ranking evidence in the existing admin forms, or save verification independently of incomplete catalog descriptions. Availability/deadline/funding assertions require a source and verification date; dated availability also requires a named intake/year. Existing catalog entries were not backfilled with invented evidence.

Browser verification includes the rich Computer Science record, the sparse language program, consultation/assessment selection arrival, and Xiamen's 413-program catalog (35 pages), including page-two navigation and an exact return from a program. The university tabs remain at the header offset during long program lists. Production rendering was checked at actual CSS widths 320, 390, 768 and 1440px; the inspected program layouts had no document-level horizontal overflow. English/Chinese FAQ rendering and structured data share one component, so changing language updates both together. Document language follows the chosen locale.

Deployment of the application remains separate from these local implementation and verification steps. Source dates, funding terms and intake availability remain explicitly unverified until staff enter supporting evidence.

Final checks: `npm run validate` passed (TypeScript, lint, English/Chinese parity, missing-key scan, and **147 test files / 1,511 tests**). `npm run build:app` and `npm run build:server` passed. `git diff --check` passed. The built gallery was checked with arrow keys and Escape; focus returns to the originating photo button. Production-preview checks used the Next.js server directly so background email schedulers were not started.
