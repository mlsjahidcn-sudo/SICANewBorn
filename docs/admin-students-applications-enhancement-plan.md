# Admin students and applications: review and enhancement plan

Date: 22 October 2026 (Asia/Dhaka)  
Scope: admin Students and Applications lists, create/edit/detail flows, unified partner applications, related APIs, documents, notes, payments, and lifecycle actions.  
Status: review and proposed implementation plan. No application behavior or production data changed.

The first release should make results, actions, and note visibility trustworthy. The next release should connect the existing features into a daily admissions workspace. Most of the underlying capabilities already exist; the main gaps are inconsistent query behavior, disconnected workflows, and insufficient ownership/follow-up tools.

## Evidence and limits

- Reviewed the current working tree, route handlers, shared mappers/hooks, migrations, and relevant tests. The working tree was clean at the start.
- Queried production project `wbzdwwvtbaftjxecgdxk` read-only for aggregate counts and notification column names. No student records, application outcomes, account permissions, emails, or payments were modified.
- Production snapshot: **87 student profiles** (84 Online, 3 Admin), **31 student applications**, **1 non-archived partner application**, **0 archived partner applications**, and **5,159 programs**. Student applications: 14 Draft, 10 Submitted, 7 Withdrawn; all 31 belong to Online profiles. No student application has a decision set.
- Opened the production admin Students URL; the browser redirected to the login page. Authenticated visual layout, responsive behavior, and deployed frontend/API parity were not verified. Findings below concern the checked-out implementation; the production aggregates establish scale and schema, not the deployed code version.
- Executed temporary diagnostic probes against actual route/component code with mocked dependencies. Reproduced five defects: capped list totals, export ignoring surface, broken student select-all, false note-save success, and student serialization of the field labelled internal notes. Removed these probes after the review; permanent regression tests belong with the fixes.
- Existing relevant tests passed: 9 suites / 117 tests, covering application mapping/grouping/campaigns, student profile completion, student application ownership checks, admin authentication, student application display, failed application deletion, and earlier student audit fixes. Passing these tests does not establish that the uncovered behaviors are correct.
- Baseline `npm run ts-check` passed with zero errors. Only this review document remains changed; no build was needed for the documentation-only result.

## What already works and should be retained

| Students | Applications |
| --- | --- |
| Server pagination, debounced search, status/source/service-paid filters, sortable columns | Unified student and partner application list, source tabs, filters and sorting |
| Offline student creation, optional email, temporary account credentials | Create wizard, existing-student and unlinked-applicant paths, lead attribution |
| Passport/resume/transcript OCR and education history | Shortlist builder, campaign grouping, catalog resync |
| Documents tab with in-place preview/review, notes, activity, application links | Documents, timeline, notes, document requests, enrollment controls |
| Application counts, payment summaries, email composer, CSV export | Bulk status/priority/notes/payment actions and CSV export |
| Suspension and confirmed permanent deletion | Status notifications and student/partner detail routes |

Do not rebuild these features or merge the student and partner tables as a prerequisite. Preserve their distinct status vocabularies while presenting consistent admin concepts.

## Findings requiring fixes

P1 means fix in the first release because it affects confidentiality, completeness, destructive behavior, or trust in a saved result. P2 means address in the subsequent workflow release unless it can be safely included earlier.

### F1 · P1 · “Internal admin notes” are exposed to students

The Notes tab labels `admin_notes` as internal and claims the full content is admin-only. The student mapper includes that same field as `adminNotes`, and the student detail page renders the complete text in a banner. This is a confirmed visibility-contract defect; the review did not inspect actual note contents or establish historical disclosure of sensitive notes.

Evidence: `src/lib/i18n-translations.ts:4205`, `src/app/admin/applications/_components/notes-tab.tsx:63`, `src/lib/application-mapper.ts:289`, `src/app/student/applications/[id]/page.tsx:375`.

Plan: separate **Message to student** and **Internal team note** in storage, API serialization, UI labels, and notification composition. Preserve the existing student-visible message behavior. Because `admin_notes` historically held messages intended for students, do not automatically migrate every existing value into a private channel or publish private notes through a fallback. Inventory the other note fields and readers before mapping legacy data. Strip private content on the server; hiding it in the student UI is insufficient. Test list, detail, timeline, notification, and export boundaries.

### F2 · P1 · Default application pagination omits records

Each surface fetch starts at offset zero and normally retrieves at most `limit` records. The route merges those prefixes, reports their length as the total, and only then applies the requested page slice. Sorting also runs on that incomplete population. Cohort filters raise the cap to 200, which remains incomplete as data grows.

With production-shaped fixtures (31 student applications + 1 partner application, `limit=20`), the actual route reports **21 total**, and page 2 contains **1 row**, rather than 32 total and 12 rows. At current volume, 11 student applications fall outside the default All view's candidate window. Other tabs have different over-fetch limits and can expose a different population.

Evidence: `src/app/api/admin/applications/route.ts:172`, `:370`, `:469`, `:531`.

Plan: create a shared query contract that filters the full population, normalizes display fields, sorts deterministically, counts, and then paginates. Implement a database UNION query/RPC or an equivalent correctly paginated query layer; increasing caps is not the fix. Include a stable `(surface, id)` tiebreaker. Order priorities by business rank, rather than alphabetically.

### F3 · P1 · Application filters disagree across API, browser, counts, and CSV

- API status filtering maps `Under Review` to partner `In Review`, but the browser repeats exact-status filtering and removes the mapped partner results.
- The browser search pass checks name/email/university but omits program and application number, so valid API matches can disappear. The API's related-student OR search syntax also needs a real PostgREST integration check; mocked tests cannot verify it.
- Student filtering is applied to the student query but not the partner query; the browser then hides partner rows, leaving totals and displayed rows inconsistent. Partner rows are serialized with `studentId: null`, even where a profile bridge may exist.
- Decision/enrollment filters affect only student rows; payment-status filters deliberately let partner rows pass through. These mixed populations are not clear from the filter labels.
- CSV reads source/status/search/intake/IDs, but ignores `surface`, student, decision, enrollment, payment, payment channel, campaign, and requested sort. The page also omits some active filters when building the export URL. A probe with `surface=partner` exported both surfaces.
- CSV does not exclude archived partner rows, uses different search predicates, and always leaves student decisions blank despite the current decision column.
- Export truncation is inferred after capped fetches; a single surface can have more than 1,000 matches while the export reports `X-Truncated: false`.

Evidence: `src/app/admin/applications/page.tsx:528`, `:612`; `src/app/api/admin/applications/route.ts:130`, `:187`, `:204`; `src/app/api/admin/applications/export/route.ts:91`, `:235`, `:276`, `:359`.

Plan: one typed filter specification and shared query service for list, scoped counts, export, and grouped results. Remove the competing browser filter pass. For each filter, explicitly define student/partner support; exclude unsupported surfaces or clearly state the scope. Selected export should use explicit `(surface, id)` keys. Show matching/exported counts and any cap; neutralize spreadsheet formulas in user-controlled CSV values as part of the export repair.

### F4 · P1 · Single and bulk “Delete” have different consequences

Single student-application DELETE changes status to Withdrawn. Bulk delete permanently deletes both student and partner application rows. Single partner DELETE also permanently deletes. The UI's similar “Delete” controls conceal these differences. The single student delete does not use the usual status-change timeline/notification chain.

Evidence: `src/app/api/admin/applications/[id]/route.ts:399`, `src/app/api/admin/applications/bulk/route.ts:208`, `src/app/api/admin/partner-applications/[id]/route.ts:401`.

Plan: distinguish **Withdraw**, **Archive**, **Restore**, and **Delete permanently**. Use reversible archive for routine record removal, and share action implementations between single and bulk paths. Preserve genuine withdrawals as workflow events. Restrict permanent deletion by explicit capability, show the affected dependencies and exact count, and record an audit event. Do not silently reinterpret historical Withdrawn rows as archived records.

### F5 · P1 · Notes can falsely report a successful save

The Notes tab awaits `apiFetch` without checking `response.ok`, then shows “saved.” That wrapper only rejects network failures; HTTP 400/403/500 responses resolve normally. An actual component probe reproduced success feedback after HTTP 500.

Evidence: `src/app/admin/applications/_components/notes-tab.tsx:58`, `src/lib/api-client.ts:13`.

Plan: use the checked JSON wrapper or explicitly verify the response. Keep draft text on failure, offer retry, and display success only after the server confirms persistence.

### F6 · P1 · Student bulk select-all captures the empty initial list

`toggleSelectAllVisible` uses `students` but has an empty dependency array. The callback permanently sees the initial empty list, so clicking the header checkbox after loading does not select the rows. Individual selection is separate and is not the same defect.

Evidence: `src/app/admin/students/page.tsx:193`. Confirmed in a component probe.

Plan: derive selection from the current visible rows. Keep “Select this page” explicit; bulk actions should preview affected students, unsupported records, and notification effects. Clear or reconcile selection whenever its scope changes.

### F7 · P2 · Student edits cannot reliably clear existing values

The edit form drops every empty string/null/undefined from its PATCH payload. Clearing a phone, passport field, or other optional text therefore omits the update and leaves the old value stored. JSONB changes also use a read/merge/write sequence without conflict detection.

Evidence: `src/app/admin/students/[id]/edit/page.tsx:263`, `src/app/api/admin/students/[id]/route.ts:199`.

Plan: send changed fields, preserve explicit clears, and validate nullable versus required values consistently. Add an `updated_at`/version precondition for concurrent edits, plus an atomic JSONB patch. Reuse create/edit field definitions, while preserving their different required-field rules.

### F8 · P2 · Student activity silently loses notification events

The activity route selects notification `body` and `read`; production exposes `message` and `is_read`. Query errors are not surfaced, so the route can return an apparently successful but incomplete feed. Student detail tab-loading failures are also console-only and can appear as empty lists.

Evidence: `src/app/api/admin/students/[id]/activity/route.ts:64`, `src/app/admin/students/[id]/page.tsx:222`; read-only production column lookup.

Plan: correct the schema contract and use typed event mappings. Report partial availability explicitly, provide per-tab retry, and reserve empty states for successful empty responses. Make the future audit feed identify actor, action, time, and relevant record.

### F9 · P2 · Counts mix students and applications

Application tab badges count Online/Partner profiles rather than their applications. Production currently has **84 Online students but 31 Online applications**. Student list application counts include archived partner rows, while the student detail Applications endpoint excludes them. Status breakdowns fetch up to 5,000 rows without paging; their cap flag does not account for a lower configured Data API row limit.

Evidence: `src/app/api/admin/applications/counts/route.ts:55`, `:88`, `:192`; `src/app/api/admin/students/route.ts:150`; `src/app/api/admin/students/[id]/applications/route.ts:63`.

Plan: count applications for application badges, profiles for student totals, and use consistent archive/identity definitions. Label global statistics versus filtered statistics. Obtain aggregates in SQL, or page correctly; do not infer completeness from the requested limit.

### F10 · P2 · Pickers have silent completeness limits

The shared student hook requests 500 rows; the API caps the response at 100. This has not yet excluded a profile at the current 87-profile volume, but will at 101. The application create wizard requests only 500 programs from a live catalog of 5,159, making most programs unreachable in that control. Catalog failures are console-only and can look like an empty catalog.

Evidence: `src/hooks/use-student-list.ts:27`, `src/app/api/admin/students/route.ts:88`, `src/app/admin/applications/new/page.tsx:154`.

Plan: server-search student and program pickers with paging, selected-value hydration, explicit errors, and retry. Do not return full student profiles and payment aggregates merely to populate a picker. Preserve automatic university derivation from program selection. Include this fix in the first release because the program cap already matters.

## Proposed daily workflow

### Students workspace

Keep the Students list focused on people and the next action:

1. Compact primary row: student name/reference, contact, source, intake/degree, assigned advisor, readiness, next follow-up, and latest activity. Make optional columns configurable; financial detail stays behind a clear summary/link.
2. Named views: All students, No application, Profile incomplete, Documents needed, Follow-up due, and My students. Enable each view only when its backing query exists. Follow-up and assignment views depend on the new workflow data below.
3. Persist search, filters, sorting, page, and view in the URL; restore the same view when returning from detail/edit. Provide active filters and Clear all.
4. Student detail: a compact persistent identity header, clear application/document/payment summaries, and a next-action panel before the existing tabs. Retain the in-place document viewer and controlled tab URLs.
5. Primary actions: Create application (prefilled student), Add to shortlist, Request documents, Send email, and Schedule follow-up. Show only relevant actions, with failure/retry feedback.
6. Profile readiness: show which required fields/documents are missing for the target degree/intake. Reuse the existing completion helper where suitable, and distinguish incomplete information from rejected evidence. Do not present a generic completeness percentage as an admissions eligibility decision.
7. Duplicate detection: warn on exact normalized email/passport and possible phone/name matches. Review/link manually; never auto-merge people based only on similar names.
8. Clarify service payment: label the manually managed `service_paid` indicator as **Service fee recorded** (or another agreed operational term) and display it separately from fee-ledger totals. Preserve currency separation and show unknown/unavailable aggregates accurately.

### Applications workspace

Keep this list focused on a target university/program and its processing work:

1. Default view: applicant + reference, university/program, intake, normalized display stage, owner, next action/due date, document readiness, and payment summary. Source and partner organization remain easy to inspect.
2. Named queues: New submissions, Needs documents, Ready for submission, Awaiting university decision, Decision received, and Enrolled. Define readiness from real checklist fields; do not equate Submitted with submission to a university.
3. Preserve the flat table for bulk work and campaign grouping for shortlists. Fetch/paginate groups by campaign or student identity, rather than grouping only the current 20 application rows. Show complete target totals and matched versus total targets when filters apply.
4. Detail page: stage header and a prominent next action; overview/documents/timeline/notes/enrollment remain. Keep internal notes and student messages visually and technically separate.
5. Make status/decision changes a shared action with valid transitions, required reasons for rejection/withdrawal/reopening, notification preview, and an explicit notify choice. Require confirmation when an action changes an applicant-facing outcome.
6. Use one canonical display-stage mapping with native student/partner values at the write boundary. Retain unsupported partner stages as explicit unsupported operations, rather than offering a bulk action that predictably fails for those rows.
7. Show pending/sent/failed notification state and retry failed delivery independently from the successful application update. A retry must not repeat the status change or payment creation.
8. Retain form drafts during errors and warn before discarding unsaved edits. Document upload/linking failures should identify what succeeded and allow retry without creating a second application.

### Shared usability rules

- Preserve SICA Inter, warm-white backgrounds, crimson actions, navy icons, and square cards/buttons. Fix current colored action/stat icons and rounded elements as the affected screens are updated.
- Use compact desktop tables with a sticky identity/action area where useful. On narrow screens, expose essential fields in readable rows/cards and move secondary filters into a sheet. Validate the actual authenticated UI at 390px and desktop widths before accepting layout work.
- Use skeletons on first load; preserve the last successful data during background refresh and label stale data after a refresh failure.
- Include visible field labels, labelled icon actions, keyboard access, focus handling for dialogs, and `aria-sort` on sortable columns.
- Finish EN/ZH strings in these flows, including validation, statuses, confirmation copy, errors, and accessibility labels.

## Implementation sequence and acceptance criteria

| Phase | Work | Acceptance |
| --- | --- | --- |
| 1 — Trust and completeness | F1–F6; F10 catalog/student search; align application counts and export through a shared query contract | All 32 application records in the production snapshot's default scope (including Withdrawn) are reachable; synthetic 5,000+ application fixtures have correct pages/totals/order; any catalog program and any student beyond row 100 is searchable; internal notes are absent from student responses; failed writes never report success; single/bulk destructive actions match their labels |
| 2 — Connected lists and detail | F7–F9; URL state, shared fields/components, scoped summaries, consistent identity links, complete campaign groups, mobile/keyboard/EN-ZH states | Returning from edit/detail restores the list; clears persist; concurrent updates yield a visible conflict; tabs distinguish error from empty; application badges match application records; a campaign spanning pages shows every target |
| 3 — Ownership and follow-up | Advisor assignment, next-action tasks, due dates, operational queues, application/document checklist | Every active case can have an owner and next action; My work/Overdue counts reproduce their linked lists; completing a task writes an audit event; no reminder is sent without the configured workflow/recipient rules |
| 4 — Delivery and operational insight | Durable notification retries, bulk-job progress/idempotency, stage aging, advisor workload, submission-to-enrollment funnel | Retrying an action does not duplicate payments/messages; failures are actionable; stage durations use actual transition timestamps; reports distinguish people, applications, shortlists, decisions, and enrollments |

Ship Phase 1 as several focused changes: note visibility/save feedback; query/list/count/export parity; single/bulk action semantics and selection; search pickers. Do not combine the entire plan into a single page rewrite.

## Data and service design

1. **Shared query types:** define `AdminApplicationFilters`, surface-aware row keys, canonical display stage, stable sorting, archive scope, and a slim picker response. Return applied filters and completeness information with results.
2. **Query implementation:** prefer a database UNION/SQL function for complete application filtering/counting/paging. Keep service-role credentials on the server and enforce the admin/capability check before invoking it. If introducing views exposed to authenticated clients, use explicit grants and appropriate invoker/RLS behavior; do not expose an unrestricted admin view. Supabase documents grants and RLS as separate required controls in [Securing your API](https://supabase.com/docs/guides/api/securing-your-api).
3. **Action service:** route single, grouped, and bulk changes through shared validation and lifecycle functions. Update the record, audit event, and notification intent atomically where practical; dispatch notifications from a durable outbox with an event/idempotency key.
4. **Notes:** separate student-facing communication from internal collaboration. Prefer author/timestamped append-only internal note records over overwriting a shared text blob. Audit existing timeline-note readers as part of the visibility repair.
5. **Workflow data:** add advisor assignment and a task table with explicit student/application/partner references, assignee, due time, completion, and actor timestamps. Use real foreign keys and constraints. Defer tags/custom fields until there is a defined search/reporting need.
6. **Archive/capabilities:** add missing archive fields through a reviewed migration, define restore behavior, and preserve evidence of withdrawal. Introduce explicit permissions for permanent deletion and finance writes; current `requireAdmin` treats admin/super_admin alike for the reviewed routes.
7. **Identity:** preserve the existing student-profile/partner-student bridge. Include linked identity in the unified display response and route to the appropriate detail page. Unlinked applicants remain valid; do not fabricate a profile link by name or email alone.
8. **Payments:** retain currency-separated totals. Make mark-paid idempotent, review partial-payment handling, distinguish service-paid triage from the fee ledger, and show a preview before applying a payment action to multiple applications. Never treat a failed payment fetch as authoritative zero debt.

Create migrations through the repository's Supabase workflow. New tables/functions need explicit grants, policies, and negative authorization tests; preserve the existing partner member/owner protections. Validate any schema changes locally/staging before production rollout.

## Verification checklist for implementation

- Query tests: both surfaces; 0/1/many applications per student; linked/unlinked applicants; archived rows; more than one page; 1,000-row Data API cap; identical timestamps; full-population sorting and search; native status aliases; combined payment/decision/enrollment filters.
- Parity tests: the same filter set yields the same population for table totals, badge counts, grouped results, and CSV; selected export contains exactly the selected surface/ID pairs; truncation is reported honestly.
- Privacy/authorization tests: anonymous, student, partner member/owner, admin, and super_admin; private note content never reaches student/partner payloads or applicant emails; sensitive capabilities are enforced on the server.
- Mutation tests: unsuccessful saves preserve drafts; explicit clears persist; version conflicts are visible; single/bulk withdraw/archive/restore semantics match; partial failures identify the affected rows; idempotency prevents duplicate money/message side effects.
- Component tests: select all after async load and page changes, sort/filter selection reconciliation, notification scope confirmation, tab error/retry, list-state return navigation, complete group expansion.
- Authenticated browser checks: real PostgREST search behavior, student-to-application/document navigation, document modal context preservation, 390px and desktop layout, keyboard-only operation, EN/ZH, export download, and stale-refresh behavior.
- Required repository gates after implementation: `npm run ts-check`, `npm run lint:build`, relevant tests followed by the required validation suite, translation checks, and application/server builds as applicable. No production outcome changes or real-recipient notifications during smoke tests.

## Recommended first increment

Start with the note visibility/save repair and the unified application query/export/count repair. These remove the highest-impact risks and give every later queue a reliable foundation. Then fix selection/action semantics and replace the capped pickers before investing in new dashboards or broader visual redesign.
