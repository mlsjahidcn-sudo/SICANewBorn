# Inline free-consultation booking on university & program detail pages

**Date:** 2026-11-24
**Status:** Approved (placement + triggers confirmed by user)
**Scope:** Public university detail pages (`/universities/[slug]`) and program detail pages (`/programs/[slug]`).

## Problem

Both public detail pages end with a "Book a free consultation" CTA that is only a
**link** to `/counselling`. The visitor loses the page they were reading, and the
booking flow starts from a generic context even though the page already knows
exactly which university and program the visitor is looking at.

The booking machinery itself does not need to be built. `POST /api/counselling/bookings`
already stores the lead in `counselling_bookings`, emails the student, notifies the
admin, and honours a `university` + `program` selection. `GET /api/counselling/slots`
already serves open dates and times. `/counselling` already renders a complete
two-step `BookingWizard`.

This is a **UI-surface** feature: put the existing booking flow on the detail pages.

## Decision

- **Placement:** the booking form renders **inline in the right sidebar** of the
  detail pages, replacing the sidebar card's outbound link.
- **Triggers:** all three existing CTAs — the hero button, the sidebar card, and
  the mobile sticky action bar — scroll to that inline form instead of navigating
  to `/counselling`.

### Accepted trade-off

The detail pages use `lg:grid-cols-[minmax(0,1fr)_20rem]`, so below the `lg`
breakpoint the sidebar stacks **below** all tab content. A mobile visitor therefore
scrolls past the university/program content to reach the form. The sticky mobile
bar's CTA jumps straight to it, which mitigates but does not remove the cost.
This is inherent to the chosen placement and was flagged to the user before
approval.

## Architecture

### 1. `src/components/counselling/booking-wizard.tsx` (moved)

The wizard moves out of `src/app/counselling/booking-wizard.tsx` into
`src/components/counselling/`. Production components do not import from `@/app/`
today (only tests do), and the wizard now has a second consumer.

`src/app/counselling/page.tsx` imports it from the new location.

New props:

| Prop | Type | Default | Purpose |
|---|---|---|---|
| `variant` | `'full' \| 'compact'` | `'full'` | Layout density. `compact` is tuned for the 320px sidebar. |
| `surface` | `'counselling' \| 'university_detail' \| 'program_detail'` | `'counselling'` | GA tagging so detail-page bookings are separable. |

`compact` differences:

- Slot grid: `grid-cols-3` only (the `full` variant adds `sm:grid-cols-5`).
- Success boxes stack to a single column (`full` uses `sm:grid-cols-2`).
- Tighter container padding (`p-5` vs `p-6 sm:p-8`).
- The success state drops the "Back home" button — the visitor stays on the page
  they came from. The WhatsApp escape hatch and the booking reference remain.

**The fetch / validate / submit logic is not modified.** One implementation, two
layouts. In particular the `slotsFetched` guard stays intact: it is what stops the
wizard from rendering "No open slots on this day" before the first fetch resolves,
and `src/lib/__tests__/seo-audit-2026-10-17.test.ts` asserts that behaviour by
reading the wizard source. That test's file path is updated for the move; its
assertions are unchanged.

### 2. `src/components/public-detail/consultation-booking-card.tsx` (new)

The sidebar card, rendering:

1. "With SICA" eyebrow + heading.
2. The compact `BookingWizard` with the page's `CatalogSelection`.
3. The assessment link and the WhatsApp link as secondary options.
4. A small "See all consultation options" link to `/counselling`, so that page is
   not orphaned and the sitemap link still has an in-page referrer.

The generic "check eligibility / review documents / confirm costs" bullet list is
replaced by the form — the bullets were marketing copy, the form is the
conversion.

### 3. `src/components/public-detail/detail-ui.tsx`

`DetailSupport` changes from loose name/slug props to a `selection: CatalogSelection`
prop plus the localized display `name`, and renders the new card. It stays the one
sidebar card used by both detail pages.

## Data flow

| Page | Selection | `source_page` |
|---|---|---|
| University | `university` only | `/universities/<slug>` |
| Program | `university` + `program` | `/programs/<slug>` |

- University client builds: `{ universitySlug: uni.slug, universityName: uni.name, universityNameCn: uni.nameCn ?? '', sourcePath: '/universities/' + uni.slug }`
- Program client builds: `{ universitySlug: program.universitySlug, universityName: university?.name ?? '', universityNameCn: university?.nameCn ?? '', programSlug: program.slug, programName: program.name, programNameCn: program.nameCn ?? '', sourcePath: '/programs/' + program.slug }`

`resolveCatalogSelection` validates the pair **server-side**: a program that does not
belong to the university, or a slug that no longer exists, is rejected with a 400
rather than booked against the wrong school. The visitor sees a
*"Discussing: BSc Computer Science — Tsinghua University"* strip above the form
(`SelectionSummary`), and the admin sees the topic pre-filled in `/admin/counselling`.

## The three CTAs

All three scroll to the inline form. The wizard renders `id="book"` with
`scroll-mt-24`, so the sticky header does not cover the target.

The success state currently returns early and drops that `id`. The success
container therefore also carries `id="book"`, so the anchor survives the booking
and a later CTA click still lands on the card instead of silently doing nothing.
Only one wizard renders per page, so the id stays unique.

| Surface | Before | After |
|---|---|---|
| Hero button | link → `/counselling?…#book` | scroll to `#book` |
| Sidebar card | link → `/counselling?…#book` | the form itself |
| Mobile sticky bar | link → `/counselling?…#book` | scroll to `#book` |

Scrolling uses `scrollIntoView` with a `prefers-reduced-motion` guard, matching the
existing `openPrograms()` pattern in the detail clients, and moves focus to the form
container (`tabIndex={-1}`) so keyboard users land where sighted users land.

## i18n

Three new key pairs, added to `src/lib/i18n-translations.ts` in both `en` and `zh`:

- `consultationBooking.title` — "Book a free 10-minute consultation" / "预约免费 10 分钟咨询"
- `consultationBooking.subtitle` — "Pick a time that suits you." / "选择适合你的时间。"
- `consultationBooking.allOptions` — "See all consultation options" / "查看所有咨询选项"

Everything else reuses the existing bilingual `counselling.*` keys.

## Analytics

- `counselling_wizard_start` gains `surface`.
- `counselling_booking_submit` gains `surface`.

Both are typed in the `EventMap` in `src/lib/analytics.ts`. Existing `apply_click`
location values (`university_hero`, `program_hero`, `detail_mobile_bar`) are kept so
historical funnel comparisons still line up.

## Tests

- **New** `src/components/__tests__/consultation-booking-card.test.tsx`:
  - renders the selection summary with the program and university;
  - the POST payload to `/api/counselling/bookings` carries `university`,
    `program` and `sourcePage`;
  - a 409 response surfaces the "slot just taken" error and returns to step 1.
- **Updated** `src/lib/__tests__/seo-audit-2026-10-17.test.ts`: wizard source path.

## Verification

The project's own gate, `scripts/validate.sh`, is the bar — all five steps must pass:

1. `npm run ts-check` (0 errors)
2. `npm run lint:build`
3. `npm run i18n:check`
4. `npm run i18n:missing`
5. `npm test`

Plus a production build (`npm run build:app`) to confirm the moved module resolves
and nothing depended on the wizard's old path.

## Out of scope

- The `/counselling` page keeps its current full-page layout and behaviour.
- The booking API, the `counselling_bookings` table, and the admin console are
  unchanged.
- No change to the exit-intent popup, the assessment form, or the lead pipeline.
