/**
 * Google Analytics 4 event helper.
 *
 * Wraps the `@next/third-parties/google` `sendGAEvent` with:
 *   - SSR safety (no-op on the server)
 *   - Strongly-typed event names + per-event property shapes
 *     so the call site gets autocomplete + a compile error if
 *     a typo sneaks in.
 *
 * How to call from a client component:
 *
 *   import { track } from '@/lib/analytics';
 *   const { locale } = useI18n();
 *   <button onClick={() => track('apply_click', { location: 'sticky_bar', locale, slug: 'tsinghua-university' })}>
 *
 * The `locale` property is included on every caller's hands — we
 * don't auto-attach it from the helper because the function is
 * usable outside a React tree (e.g. from a non-i18n context).
 * The locale property is the single most-useful segmentation
 * dimension on SICA (en vs zh traffic is genuinely different
 * audiences) so it's a small price for explicitness.
 *
 * Consent:
 *   SICA currently runs GA4 with `analytics_storage: 'granted'`
 *   by default (no consent banner). For an EU-strict deploy, add
 *   a consent banner that downgrades to 'denied' and call
 *   `gtag('consent', 'update', { analytics_storage: 'denied' })`
 *   on opt-out. See the @next/third-parties/google docs for
 *   the consent-mode prop on <GoogleAnalytics>.
 */
import { sendGAEvent } from '@next/third-parties/google';

/**
 * Catalog of GA4 events SICA fires, with the per-event property
 * shape. Add a new entry here when wiring a new call site — the
 * `track()` overloads will pick it up automatically and the
 * caller's TypeScript will refuse to pass the wrong props.
 */
export interface AnalyticsEventMap {
  /** User clicked any Apply CTA. */
  apply_click: {
    /** Which surface fired the click (sticky_bar, support_card, etc.). */
    location: string;
    /** University the lead is applying to (slug). */
    slug: string;
    /** Page locale (en|zh). */
    locale: 'en' | 'zh';
  };
  /** User clicked any WhatsApp link. */
  whatsapp_click: {
    /** Which surface (sticky_bar, support_card, float_button, etc.). */
    location: string;
    /** Page locale. */
    locale: 'en' | 'zh';
    /** Optional: pre-filled message context (slug for uni-specific messages). */
    slug?: string;
  };
  /** Assessment form was rendered (user landed on /assessment). */
  assessment_start: {
    /** Where the lead came from — the page that linked here. */
    source: 'home' | 'university' | 'nav' | 'direct' | 'other';
    /** Page locale. */
    locale: 'en' | 'zh';
    /** University slug if the lead came from a university page's Apply CTA. */
    interest?: string;
  };
  /** User advanced from one wizard step to the next. */
  assessment_step_complete: {
    /** Step number they finished (1-4). */
    step: 1 | 2 | 3 | 4;
    /** Page locale. */
    locale: 'en' | 'zh';
  };
  /** User successfully submitted the assessment. */
  assessment_submit: {
    /** Page locale. */
    locale: 'en' | 'zh';
    /** Did the lead upload a transcript? */
    has_transcript: boolean;
    /** University slug if pre-filled from a university page. */
    interest?: string;
  };
  /** User successfully submitted the contact form. */
  contact_submit: {
    /** Page locale. */
    locale: 'en' | 'zh';
    /** Subject category from the dropdown. */
    subject: 'general' | 'application' | 'scholarship' | 'visa' | 'other';
  };
  /** User clicked a university card on the list page. */
  university_click: {
    /** University slug. */
    slug: string;
    /** Position in the list (0-indexed) — useful for ranking analysis. */
    position: number;
    /** Page locale. */
    locale: 'en' | 'zh';
  };
  /** User clicked a program card on the programs list. */
  program_click: {
    /** Program slug. */
    slug: string;
    /** Position in the list (0-indexed). */
    position: number;
    /** Page locale. */
    locale: 'en' | 'zh';
  };
  /** User clicked a scholarship card on the scholarships list. */
  scholarship_click: {
    /** Scholarship slug. */
    slug: string;
    /** Position in the list (0-indexed). */
    position: number;
    /** Page locale. */
    locale: 'en' | 'zh';
  };
  /** User typed in a search/filter input (debounced). */
  search_performed: {
    /** Which search input (universities, programs, scholarships). */
    surface: 'universities' | 'programs' | 'scholarships';
    /** The term the user typed (trimmed, lowercased). Empty string = cleared. */
    term: string;
    /** Page locale. */
    locale: 'en' | 'zh';
  };
  /** User toggled a filter (tag, type, rating, etc.). */
  filter_change: {
    /** Which list. */
    surface: 'universities' | 'programs' | 'scholarships';
    /** Filter name (tag, type, minRating, scholarship, etc.). */
    filter: string;
    /** New value (or null when cleared). */
    value: string | null;
    /** Page locale. */
    locale: 'en' | 'zh';
  };
  /** User sent a message to the AI chatbot. */
  chatbot_message_sent: {
    /** Page locale. */
    locale: 'en' | 'zh';
    /** Length of the user's message in characters. */
    message_length: number;
  };
  /** User opened the chatbot. */
  chatbot_opened: {
    locale: 'en' | 'zh';
  };
  /** User closed the chatbot. */
  chatbot_closed: {
    locale: 'en' | 'zh';
  };
  // -----------------------------------------------------------------
  // Partner portal events (Phase: partner documents UI)
  //
  // The three partner events are added to the same map (not split
  // into a separate PartnerEventMap) so a single `track()` overload
  // covers all surfaces — call sites get autocomplete for both the
  // public and partner event names, and a typo on either side
  // fails at compile time. The `locale` property stays mandatory
  // across every event for the same segmentation reason documented
  // at the top of this file.
  //
  // Search tracking is intentionally NOT added for the partner
  // portal — the helper requires keys to be in the map, so simply
  // not calling track('search_performed', …) from partner code
  // means partner search is un-instrumented. The public list
  // pages keep the existing search_performed behavior.
  // -----------------------------------------------------------------
  /** Partner opened the /partner/documents page. Fires once on mount. */
  partner_documents_page_view: {
    /** Page locale. */
    locale: 'en' | 'zh';
    /** Status filter active when the page loaded, or null for "all". */
    filter_status: 'Pending' | 'Verified' | 'Rejected' | null;
  };
  /** Partner uploaded a document (single file) via the upload dialog. */
  partner_document_upload: {
    /** Page locale. */
    locale: 'en' | 'zh';
    /** Document category (the 6-value closed enum). */
    category: 'Identity' | 'Academic' | 'Language' | 'Financial' | 'Recommendation' | 'Other';
    /** File size in bytes (useful for spotting oversized uploads). */
    file_size: number;
  };
  /** Partner deleted one or more documents (single row OR bulk). */
  partner_document_delete: {
    /** Page locale. */
    locale: 'en' | 'zh';
    /** Number of rows deleted in this action (1 for single-row, >1 for bulk). */
    count: number;
  };
  // -----------------------------------------------------------------
  // VideoTestimonials events
  //
  // The two student-review videos on the home page and every
  // university page share these two events. `video_play` fires
  // when the user clicks the poster thumbnail (intent to watch).
  // `videoId` is the static identifier so a dashboard can compute
  // play-through and per-video popularity without parsing URLs.
  // -----------------------------------------------------------------
  /** User clicked a video testimonial's poster to open the modal. */
  video_play: {
    /** Static video identifier (review-1, review-2). */
    videoId: 'review-1' | 'review-2';
    /** Where the section is mounted. */
    location: 'home' | 'university';
    /** Page locale. */
    locale: 'en' | 'zh';
    /** University slug when location='university', otherwise null. */
    universitySlug?: string | null;
  };
}

/** Convenience alias for the event-name union. */
export type AnalyticsEventName = keyof AnalyticsEventMap;

/**
 * Strongly-typed `track` overloads. Call site gets:
 *   - autocomplete for event name
 *   - autocomplete + required-property check for the props arg
 *   - compile error if a typo sneaks in (`applyclick` won't compile)
 *
 * The overload shape is the standard TS pattern for "key of a
 * mapped type determines the props shape". See:
 * https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#distributive-conditional-types
 */
type EventName = keyof AnalyticsEventMap;
type PropsFor<E extends EventName> = AnalyticsEventMap[E];

export function track<E extends EventName>(event: E, props: PropsFor<E>): void;
export function track(event: string, props: Record<string, unknown> = {}): void {
  // SSR guard — the analytics script only exists in the browser.
  // Calling sendGAEvent on the server would throw because
  // @next/third-parties/google checks `typeof window`.
  if (typeof window === 'undefined') return;

  // sendGAEvent ultimately calls window.dataLayer.push(['event', ...]).
  // If the gtag script isn't loaded (NEXT_PUBLIC_GA_MEASUREMENT_ID
  // unset, or blocked by an ad blocker, or still loading), the
  // dataLayer push is still safe — gtag picks it up on init and
  // becomes a no-op for events it doesn't know about. So we don't
  // need a "is gtag loaded" guard here. (The official
  // @next/third-parties helper does the same.)
  sendGAEvent('event', event, props);
}
