# Admin dashboard and webinar statistics enhancement plan

Date: 22 October 2026  
Scope: `/admin/dashboard` and `/admin/webinar-signups`  
Status: phases 1–4 implemented on 22 October 2026; deployment verification recorded below.

## Outcome

Make the dashboard a useful starting point for daily admissions work, and make webinar statistics easier to understand, filter, and act on. Improve metric reliability alongside the visual design so a polished number is also a trustworthy number.

This plan treats “dashboard” as the admin dashboard because webinar registration management is part of that portal. Findings below come from the current repository, rather than an authenticated production UI or database audit.

## Current findings

| Area | Finding | Effect |
| --- | --- | --- |
| Dashboard priorities | Student/application totals and university/program catalog totals share the primary row. | Routine admissions work competes with relatively static catalog information. |
| Dashboard reporting | The endpoint uses fixed seven-day counts and the page has no reporting range, trend chart, or freshness label. | Staff cannot quickly compare periods or tell when a number was refreshed. |
| Dashboard accuracy | Most individual query errors are not checked before null counts become zero. | A database failure can look like a genuine empty queue. |
| Archive consistency | Partner application totals exclude archived rows, but the recent partner application query does not. | Recent activity can surface applications outside the default active list. |
| Student definition | The student total counts `student_profiles`; recent activity also includes `partner_students`. | “Students” needs a precise definition before reporting a combined total. |
| Webinar filter scope | The registration list accepts dates, status, and search; the stats component independently fetches all-time statistics without those filters. | The cards and the list can describe different populations on the same screen. |
| Webinar summary reliability | The stats endpoint ignores individual query errors and returns zero-filled HTTP 200 data on an exception. | Failed reporting can appear as zero registrations. |
| Webinar scale | Four breakdown queries read separate, unpaginated sets of signup rows. | Breakdowns can be truncated by the Data API row limit even when the headline count is exact. |
| Webinar refresh | Statistics poll every 30 seconds; a successful status edit only changes the local list. Refresh failures are hidden once old stats exist. | Totals can be temporarily stale without an explanation. |
| Webinar search | The list applies both server search and local filtering; country appears only in the local filter. | Country search cannot find records excluded by the server, and results can disagree with pagination totals. |
| Webinar readability | Interests appear as raw codes in statistics, status labels are partly untranslated, and several controls remain hardcoded English. | The analytics section is harder to scan, particularly in Chinese. |
| Webinar history | Phase 165 deliberately removed session tables and signup session IDs. | Registration dates do not establish which webinar somebody attended. Per-session statistics need additional tracking. |

## Shared design direction

- Use the existing `PageContainer` with `width="wide"` for both pages.
- Keep Inter, warm white backgrounds, white panels, square corners, deep navy icons, and crimson primary actions.
- Use a compact page header, four consistent metric tiles, quieter borders, aligned numeric columns, and predictable spacing.
- Put labels and values before decorative graphics. Show explicit counts alongside chart bars and accessible chart summaries.
- Use navy for the principal chart series and crimson for the comparison/emphasis series. Reserve semantic status colors for status information and avoid a rainbow of categories.
- Reuse the installed Recharts library and existing UI components. Build small shared pieces for metric tiles, reporting filters, panel headers, empty states, and freshness indicators.
- Preserve loaded data during refresh. Show an inline stale/error message and retry action instead of clearing the whole screen.
- Make all new labels, tooltips, dates, and statuses work in English and Chinese.

## Proposed dashboard

### Desktop arrangement

```text
Dashboard                              [Last 30 days ▾] [Refresh]
Date range · reporting timezone · last updated

[New leads]  [New applications]  [New student accounts]  [Webinar registrations]
 value + prior-period comparison on each tile

[Intake activity trend — wide]           [Needs attention — narrow]
 Leads / applications                    Unassigned leads
 Daily totals + comparison               Follow-ups due
                                         Applications needing review
                                         Consultations awaiting action

[Recent applications — wide]             [Webinar overview — narrow]
 Applicant · program/university           Registrations + recent trend
 Source · status · date                   Recorded attendance + pending marking
 View all                                Open webinar registrations

[Recent activity]                        [Compact quick actions]

Catalog snapshot: universities · programs · scholarships
```

### Behavior

1. Offer 7-day, 30-day, 90-day, and custom ranges, with 30 days as the initial view. Persist reporting state in the URL.
2. Keep period metrics separate from current work queues. “New applications in this period” is a flow; “applications awaiting review now” is a current snapshot.
3. Use four primary period metrics: new leads, new applications, new student accounts, and webinar registrations. Label student accounts explicitly until a reliable combined student identity model exists.
4. Compare equal-length periods using the same reporting timezone. Show a count change; use “New” or an em dash when a previous value of zero makes a percentage misleading.
5. Make every attention count link to a list that actually reproduces its filter. Add missing destination filters as part of the work.
6. Show a compact webinar overview with a link to the detailed webinar page, rather than reproducing all webinar charts on the dashboard.
7. Keep recent application rows compact: applicant and reference, program/university, student or partner source, status, and date. Exclude archived applications consistently.
8. Move catalog totals below operational content. Keep adding a student/application prominent; put catalog creation links in a compact secondary action group.
9. On phones, use a two-column metric grid, place the attention queue before charts, and render application rows as readable compact cards.

## Proposed webinar registrations and statistics page

### Desktop arrangement

```text
Webinar registrations                      [Export filtered CSV]
[Date range ▾] [Source ▾] [Country ▾] [Interest ▾] [Refresh]
Reporting timezone · last updated

[Registrations]  [Marked attended]  [Awaiting marking]  [Recorded attendance rate]

[Registration trend — wide]                 [Attendance breakdown — narrow]
 Daily registrations                         Attended / no-show / cancelled
                                             Awaiting attendance marking

[Top countries]  [Program interests]  [Registration sources]
 Ranked horizontal bars · count + share · top 5 + expand

[Search registrations…] [All statuses ▾] [Clear filters]
Active filters · matching registration count

[Compact attendee table with selection]
 Name/contact · country · interests · source · registered date · status
 [Selected: N] [Change status] [Export selected]
```

### Behavior

1. Share one reporting filter model across charts, totals, registration results, and CSV export. Return the applied filters and timezone with the response so scope is explicit.
2. Keep the attendance distribution visible when filtering the table by status: label it “all statuses in this cohort.” Label table totals separately as “matching registrations.” All other audience/date filters apply to both.
3. Use top-five ranked bars for country, interest, and source; show “Other” and an expand control where appropriate. Retain missing values as “Not provided” or “Unattributed.” Missing UTM data does not prove direct traffic.
4. Translate interest codes through one shared mapping already used by the registration list. Count each selected interest once per signup and explain that multiple interests can make shares add to more than 100%.
5. Replace tall desktop attendee cards with a compact table. Use a detail drawer for full notes and status history, with a dedicated mobile presentation.
6. Add a registration trend using `created_at`, including zero-registration days. Keep this separate from attendance updates; the signup date is not an attendance timestamp.
7. After a status update, refresh the affected summary and table together. Preserve the confirmation flow, keep failed changes visible, and restore the previous value on failure.
8. Add bulk attendance marking with a selection count, confirmation, and partial-failure results. Selecting a page must not silently select every filtered registration.
9. Add filtered and selected CSV export through an admin-authenticated endpoint. Export the same population shown by the filters; use safe CSV escaping and protect spreadsheet users from formula injection.
10. Debounce server search, cancel superseded requests, and reset pagination once when filters change. Implement country/source/interest filtering server-side and remove the competing client-only search pass.
11. Refresh quietly while the page is visible, with an explicit refresh action and “last updated” label. Retain the last successful response when polling fails and identify it as stale.

## Metric definitions and data boundaries

| Metric | Definition |
| --- | --- |
| New leads | Contact submissions, chat leads, and assessments created in the selected period; label these as records unless deduplication is implemented. |
| New applications | Student and unarchived partner application records created in the selected period, with the same inclusion rules as the destination list. |
| New student accounts | `student_profiles` created in the period; partner CRM people are not silently added to this count. |
| Webinar registrations | Signup records in the selected audience/date cohort. Label lifetime totals explicitly when they are shown. |
| Marked attended | Cohort records whose current status is `Attended`; this is staff-recorded attendance. |
| Awaiting marking | Cohort records still in `Registered` status; this does not imply they failed to attend. |
| Recorded attendance rate | `Attended / (Attended + No-Show)`. Show the denominator and marking coverage; show an em dash if nobody has been classified. |
| Attendance marking coverage | `(Attended + No-Show) / (registrations − Cancelled)`. Keep pending `Registered` rows visible instead of treating them as no-shows. |
| Registration sources | Stored UTM source/campaign and source-page data; missing attribution stays visible. |

Use one named reporting timezone for day boundaries, presets, comparisons, and exports. The proposed business default is `Asia/Shanghai`, matching the webinar configuration; display the timezone beside the range. Validate calendar dates and use an exclusive next-day upper bound for date filters.

These changes can report registration cohorts and current attendance statuses with existing data. Accurate per-webinar attendance, repeat-attendee comparisons, attendance duration, and webinar-to-application conversion require additional event/identity tracking. Do not infer them from registration dates, screenshots, or matching email strings.

If repeated webinars need session comparisons later, first design a minimal stable webinar key plus immutable session metadata captured at signup. Preserve legacy rows as “Unassigned webinar” unless reliable evidence supports a backfill. Keep the public webinar page's current static configuration approach unless a separate decision changes it.

## Delivery order

| Phase | Work | Acceptance gate |
| --- | --- | --- |
| 1 — Reliable reporting | Define metrics, unify filters/timezone, check every query error, fix archive/search discrepancies, and make stats refresh after edits. Replace raw-row breakdown scans with complete database aggregates or bounded, fully paginated reads. | Counts reconcile with matching lists; failed queries never appear as successful zeros; data beyond the API row limit is included. |
| 2 — Webinar UI | Build the reporting toolbar, metric tiles, registration trend, ranked breakdowns, compact table/detail drawer, and translated labels. | Range and audience filters behave consistently across panels and the list; clear empty/error states; usable phone layout. |
| 3 — Operational dashboard | Add the period controls, primary activity metrics, trend, attention queue, compact recent applications, webinar summary, and catalog strip. | Each action opens the correct filtered list; current queues and period counts are visibly distinct; dashboard and webinar totals reconcile. |
| 4 — Workflow polish | Add filtered/selected export and bulk status updates; refine refresh behavior, accessibility, loading, and history. | Selection, cancellation, failed writes, and partial failures behave predictably; export matches the applied scope. |
| Later — Session analytics | Add minimal durable session/identity tracking only when per-event reporting is needed. | Historical uncertainty remains explicit; new registrations have reliable attribution before session comparison is enabled. |

Recommended first implementation batch: Phase 1 and the webinar summary/table redesign. This establishes the reporting contract and visual components the dashboard can reuse.

## Implementation touchpoints

- `src/app/admin/dashboard/page.tsx` and `src/app/api/admin/dashboard/route.ts`
- `src/app/admin/webinar-signups/page.tsx`
- `src/components/admin/WebinarStatsCards.tsx`
- `src/app/api/admin/webinar-signups/route.ts`, `stats/route.ts`, and `[id]/route.ts`
- Existing report aggregates in `src/app/api/admin/reports/funnel/route.ts`; audit scope before reuse.
- Shared metric/filter/empty-state components under `src/components/admin/` and shared typed reporting contracts/helpers under `src/lib/`.
- English/Chinese translation keys in `src/lib/i18n-translations.ts`.
- Database migrations only for required aggregate functions/indexes or subsequently agreed session tracking; retain `requireAdmin` and existing authorization boundaries.

## Verification

- Metric/list/export reconciliation across dates, statuses, sources, countries, interests, and archived records.
- More-than-row-limit fixtures, blank attribution, duplicate interests, zero-denominator rates, and invalid date ranges.
- Boundary dates around reporting midnight and equal-length comparison periods.
- Status changes, bulk partial failures, stale polling responses, out-of-order search requests, and tab return with preserved state.
- Admin authorization on every read, export, and mutation endpoint.
- Desktop, tablet, and 390px phone checks; keyboard operation, accessible chart summaries, readable contrast, and English/Chinese layouts.
- TypeScript, focused behavior tests, lint, translation checks, and the production build.

## Implementation and verification — 22 October 2026

- Implemented shared Beijing-time reporting ranges, equal prior periods, complete paginated reads, explicit errors, URL filters and scoped refresh/cancellation.
- Rebuilt webinar statistics and registration management, including the compact table/mobile cards, detail/history drawer, authenticated filtered/selected CSV, and confirmed bulk attendance marking with per-record failures.
- Rebuilt the dashboard around admissions activity, current work queues, recent applications, webinar reporting and secondary catalog totals. Added queue drill-down filtering to Leads and Submitted filtering to Applications.
- Existing-table queries were checked against the production database read-only: 218 registrations in the current 30-day cohort, 216 awaiting marking, 2 cancelled, no classified attendance. Dashboard/webinar totals reconciled. No registration statuses or production records were changed during verification.
- Verified 1,278 tests across 114 files, TypeScript, translation parity/missing keys, scoped lint (no errors; pre-existing warnings), and the production build.
- Reviewed the actual page components in an isolated local preview with synthetic data: desktop and 390px phone layouts, English/Chinese text, search focus, drawer, confirmation, and summary refresh after attendance marking. The production admin session was not available for an authenticated browser check.
- Per-session attendance, duration and conversion analytics remain future work; registration dates are not treated as evidence of event attendance.
