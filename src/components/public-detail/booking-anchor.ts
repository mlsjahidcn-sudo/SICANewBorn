/**
 * Anchor helpers for the inline consultation booking form.
 *
 * The university and program detail pages render the booking form in their
 * right sidebar. Their CTAs (hero button, sticky mobile bar) scroll to that
 * form instead of navigating away to /counselling, so the visitor never loses
 * the page they were reading.
 *
 * The target is the CARD, not the form: scrolling to the form alone would
 * push the card's heading ("Book a free 10-minute consultation") above the
 * fold, so the visitor would land on a form with no visible explanation of
 * what it is.
 */
export const BOOKING_ANCHOR_SELECTOR = '[data-booking-anchor]';

/**
 * Scroll the booking card into view and move focus to it.
 *
 * Focus matters as much as the scroll: a keyboard or screen-reader user who
 * activates "Book a free consultation" must end up inside the form, not back
 * at the top of the document. The container is `tabIndex={-1}`, so focusing it
 * does not add it to the tab order.
 *
 * Must only be called from a user gesture — it touches `document`.
 */
export function scrollToBooking(): void {
  const target = document.querySelector(BOOKING_ANCHOR_SELECTOR);
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  if (target instanceof HTMLElement) target.focus({ preventScroll: true });
}
