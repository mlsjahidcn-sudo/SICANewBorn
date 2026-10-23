# Student application workflow enhancement plan

Date: 23 October 2026 (Asia/Dhaka)

Scope: improve the admin's daily work on student applications first, then the corresponding student experience. This is a focused continuation of [the existing admin review](admin-students-applications-enhancement-plan.md), rather than a replacement for its completed fixes. The remaining phases below are proposed work, not implemented features.

## Implemented review-workspace release — 23 October 2026

This release is implemented locally. It requires deployment; no database migration is needed for these changes.

| Confirmed issue | Fix in this release |
| --- | --- |
| Detail status changes used unchecked `apiFetch`, so HTTP failures could show a new status without a saved change | Checked requests, an accessible confirmation dialog, visible error/retry, and retained note drafts |
| Grouped status dropdowns wrote immediately | Preview the student, program and before/after status; confirm before writing; student notification settings match the existing API, while partner changes retain their automatic notification behavior |
| Detail controls covered only Accepted / Rejected / Withdrawn and left other stages without useful actions | Complete canonical student status selector and a suggested next step for every current stage |
| Fee-query errors became a successful “no fees” aggregate; enrollment read errors became “not enrolled” | Unknown-state warnings and retry; do not offer enrollment creation from a failed read |
| Timeline tried to map already-camelCase API rows as database rows | Use the normalized API response directly; retain actor, transitions and timestamps; add retry and refresh after changes |
| A failed notes load left an editable blank form | Retry-only error state until existing notes load; retain unsaved note content when changing detail tabs |
| Returning from detail reset filters, page and group expansion; clearing some filters left URL state behind | Serialize list controls together, preserve a validated list return URL through detail/edit, retain expansion, and reset the page only after an actual filter or sort change |
| Flat student/partner rows used an ID-only React key | Use `(surface, id)` for row identity |
| Detail used an absent `notes` field, omitting actual student-facing notes | Show the mapped applicant notes and message-to-student fields with explicit labels; keep private team notes in their own tab |
| Fee links promised an application-filtered history although fee management ignores that parameter | Link explicitly to fee management; application-scoped fee drill-through remains separate follow-up work |

The detail page now has a student-first header, compact metadata, suggested next action, responsive review tabs, status controls, enrollment/payment sections and recoverable Delete/Restore. New review and confirmation copy is provided in English and Chinese. Archived application details cannot be edited or advanced through status/enrollment controls until restored.

The remaining roadmap covers saved document-request persistence, advisor assignment/follow-up tasks, fee drill-through and student-portal reliability. Those features are not included in this release. The student/partner schemas, authorization model, native status vocabularies and existing mail delivery behavior remain in use.

## Target experience

An advisor opens Applications, sees one expandable student/shortlist overview, and immediately understands the applications, intakes, outstanding requirements, and next action. Opening an application provides a compact review workspace. Students see the same applicant-facing status and instructions, without internal notes or administrative controls.

Keep the current Search / Status / More filters toolbar, server pagination, live catalog selection, status notifications, notes separation, document review, payments, and per-application audit trail. Preserve the student and partner tables and their different status vocabularies.

## Current evidence

This review used the local source and tests. No authenticated production session or live student records were used. The earlier review's production totals are historical and are not current counts.

| Area | Current implementation | Enhancement |
| --- | --- | --- |
| Admin application overview | Grouped view defaults on; partner identity, intake summaries and complete-group pagination exist | Add actionable completeness and next-action summaries without adding permanent filters |
| Remove an application | Both admin DELETE routes call `admin_archive_application`; flat view already exposed archive/restore, grouped view lacked it | Expose confirmed Delete/Restore on each individual application; explain recoverable removal; preserve the remaining applications in a group |
| Admin detail | Overview / Documents / Notes / Timeline tabs plus status, enrollment and payment cards | Give review tasks a clear reading order and a single primary next action |
| Document requests | Student application detail uses `MissingDocumentsRequest` without its optional `onSave`; it provides message composition/sharing, not a saved request in this flow | Connect a persisted, application-specific request lifecycle and expose its outcome to the student |
| Student list fetching | Two effects call `fetchList()` when the same search/filter dependencies change; requests are not cancelled; search is not debounced | One debounced, abortable query effect; retain successful results during refresh and failed load-more |
| Student attention counts | Draft/document-request counts are calculated from the currently loaded, filtered application array | Return student-scoped summary counts independently from the displayed page/filter |
| Student draft wizard | Three steps with explicit Save as Draft and resume support | Protect unsaved work, show save state, and make partial document-linking failures retryable |
| Archive visibility | Admin and partner lists have archive scope; the student list GET currently has no `archived_at` predicate | Define and apply an explicit student archive policy across list, detail and mutation endpoints before extending archive behavior across portals |

Evidence locations: `src/app/admin/applications/page.tsx`, `_components/application-groups.tsx`, `[id]/page.tsx`; `src/app/api/admin/applications/[id]/route.ts`; `src/app/api/admin/partner-applications/[id]/route.ts`; `src/components/admin/missing-documents-request.tsx`; `src/app/student/applications/page.tsx`, `[id]/page.tsx`, `new/page.tsx`; `src/app/api/student/applications/route.ts`.

## Delivery sequence

### 1. Immediate: make individual removal accessible

- Show Delete beside each expanded application; a collapsed group containing one application can expose it directly.
- Confirmation identifies the student, university, program, intake and reference. Explain that the application moves to Archived applications and can be restored.
- In Archived applications, replace Delete with Restore. Keep Withdraw as a separate admissions status transition.
- Use the existing authenticated endpoints. Address rows by `(surface, id)` so two tables sharing an ID cannot remove each other's rows.
- Update application totals versus group totals correctly, refresh counts/results and return to the previous valid page after removing the last group on a page.
- Retain the row and confirmation on HTTP errors. Prevent duplicate submissions while the action is pending.

Acceptance: deleting one of several applications preserves its student group and siblings; deleting the last application removes that group; restore works on either surface; cancel makes no write; failed requests remove nothing; the last-page case stays usable.

### 2. Admin review workspace: highest-value next release

Use the existing application detail route, rather than introducing a competing dashboard.

1. **Compact identity header:** student, application reference, university/program, intake, source, status and last update. Link to the student record where a real profile exists.
2. **Review summary:** show missing information, documents awaiting review, outstanding fee totals by currency, and the recommended next action. Unknown/loading data must not appear as complete or paid.
3. **Task-focused sections:** Overview, Documents, Communication and Activity. Keep internal notes clearly separated from messages intended for the student, including in API responses and notifications.
4. **Document checklist:** show required / uploaded / under review / verified / rejected with rejection reasons. Persist requests with application ID, categories, author, due time and a documented completion rule. Upload alone is evidence of a response; it must not automatically mean verified.
5. **Status and decision controls:** use shared transition rules, explain the effect on the applicant, preview the message and make the notification choice explicit. A failed email must not make a successful status change appear to have failed.
6. **Context-preserving navigation:** restore filters, page, sort and expanded student when returning to the list; keep active detail tabs in the URL.

Acceptance: an advisor can identify what is missing, review the relevant document, send/record a request and return to the same list context. Student/partner payloads never expose private notes. Both native status vocabularies remain valid. EN/ZH, keyboard and 390px layouts cover all new controls.

### 3. Ownership and follow-up

- Assign an advisor and a next-action due date to each active case.
- Add optional queues under More filters: My work, Due today, Overdue and Awaiting student. Do not add another row of always-visible dropdowns.
- Record task completion/reassignment in the activity history. Clearly distinguish people, application targets and shortlist counts.
- Store owner/task/due-date data with proper references and indexes through a reviewed migration; do not derive deadlines from `updated_at` or overwrite free-text notes to simulate tasks.
- Add stage aging only after transition timestamps and event completeness have been verified.

Acceptance: every queue's count matches its linked list, changing a task does not change an admissions decision, and two advisors cannot silently overwrite the same assignment.

### 4. Student-facing improvements

- Reduce the visible list controls to Search plus three clear views: All, Action needed and Completed. Keep detailed status choices available on demand.
- Show the next required action on each application card, with its intake, reference and document-request due date where one actually exists.
- Repair duplicate/stale list requests and full-population attention counts before redesigning summary cards.
- Add a focused application header and progress history using real events; avoid invented progress percentages.
- Improve draft recovery: a visible last-saved state, unsaved-change protection, and retry of failed uploads/links without creating another application. Introduce autosave only with version/conflict handling and a stable draft ID.
- Link each saved document request to the correct application and upload context, then confirm that the response reached SICA.
- Apply the chosen archive visibility policy consistently. Routine student actions remain constrained by ownership and the existing transition matrix.

Acceptance: refresh/back navigation preserves filters and draft identity, slow search cannot replace newer results, load-more failure retains existing cards, attention totals remain correct beyond 20 applications, and a student cannot access another student's case or private staff content.

## Implementation boundaries and validation

Ship the immediate removal control separately from the review workspace, ownership schema and student portal changes. The removal control reuses the existing archive RPC and requires no new migration. Permanent erasure is a separate capability and dependency-cleanup operation; it is not the existing DELETE route's behavior.

For the later phases, define a shared action/query contract before adding database columns or routes. Document-request persistence needs an explicit API integration; the existing draft-message component alone does not provide it. Assignment/tasks, request completion and durable delivery retries may need additive migrations. Do not apply a speculative production migration as part of this plan.

Tests should cover both surfaces, linked/unlinked students, same UUID in different tables, multiple intakes, multiple pages, archive/restore, native status values, permission failures and note visibility. Exercise actual page components for confirmations, errors and context retention. Verify the authenticated admin/student experience with representative accounts before release; local fixture rendering does not establish production parity.

Suggested order: individual deletion controls → admin header/review summary → saved document requests and communication → advisor/tasks → student list reliability and draft recovery. Each release should pass TypeScript, lint and relevant regression tests, followed by a production build for application changes.

## Validation for the review-workspace release

- Full workspace suite: 128 files / 1,392 tests passed. The added regression coverage exercises failed/successful status changes, internal versus email notes, payment/enrollment error states, draft retention across tabs, normalized timeline rows, full list-context round trips, validated return destinations and the admin detail API's authorization/error behavior.
- TypeScript, lint and the Next.js production app build pass. English/Chinese parity reports zero missing or orphan keys; the referenced-key check passes. Final focused regression run: 4 files / 22 tests passed after the navigation and refresh-failure refinements.
- Real local browser rendering with fixture responses: 1440, 1024, 768 and 390px, no horizontal document overflow and no page JavaScript exceptions. The confirmation was also rendered and inspected. The temporary preview route was removed afterward.
- No production student records or live status updates were used during verification. Authenticated production UI/API parity and actual email delivery remain deployment smoke checks.
