import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ConsultationBookingCard } from '../public-detail/consultation-booking-card';
import type { CatalogSelection } from '@/lib/catalog-selection';

/**
 * The detail-page sidebar card carries the free-consultation booking form.
 * These tests cover the two things that matter for a lead:
 *
 *  1. the booking is attached to the university / program the visitor was
 *     reading about, and
 *  2. a lost slot is reported instead of silently failing.
 *
 * The wizard is the same component /counselling renders, so these exercise
 * the real slot-picking → details → POST path rather than a stub.
 */

// The i18n context and the analytics tracker both have to be mocked — the
// card and the wizard delegate all copy to t() and fire GA events.
const tMock = vi.fn((key: string) => {
  const map: Record<string, string> = {
    'consultationBooking.title': 'Book a free 10-minute consultation',
    'consultationBooking.subtitle': 'Pick a time that suits you.',
    'consultationBooking.allOptions': 'See all consultation options',
    'detail.withSica': 'With SICA',
    'detail.startAssessment': 'Start your assessment',
    'detail.askWhatsapp': 'Ask on WhatsApp',
    'detail.discussing': 'Discussing',
    'counselling.timezoneNote': 'All times are Beijing time (GMT+8).',
    'counselling.pickDate': 'Choose a date',
    'counselling.pickSlot': 'Choose a time',
    'counselling.loadingDates': 'Loading dates...',
    'counselling.loadingSlots': 'Loading times...',
    'counselling.noSlots': 'No open slots on this day.',
    'counselling.slotFree': 'Free',
    'counselling.slotBooked': 'Booked',
    'counselling.slotsFreeSummary': '{free} of {total} free',
    'counselling.stepTime': '1. Pick a time',
    'counselling.stepDetails': '2. Your details',
    'counselling.nextDetails': 'Continue',
    'counselling.backToTime': 'Back',
    'counselling.selectedSlot': 'Selected:',
    'counselling.fieldName': 'Full name',
    'counselling.fieldEmail': 'Email',
    'counselling.fieldPhone': 'Phone / WhatsApp',
    'counselling.fieldCountry': 'Country',
    'counselling.fieldEducation': 'Current education level',
    'counselling.fieldTopic': 'What would you like to discuss?',
    'counselling.submit': 'Book my session',
    'counselling.submitting': 'Booking...',
    'counselling.errorName': 'Enter your name',
    'counselling.errorEmail': 'Enter a valid email',
    'counselling.errorPhone': 'Enter a valid phone',
    'counselling.errorSlotTaken': 'That slot was just taken — please pick another time',
    'counselling.errorGeneric': 'Something went wrong',
    'counselling.successTitle': 'Booked',
    'counselling.successBody': 'We will confirm by email.',
    'counselling.successWhen': 'When',
    'counselling.successReference': 'Reference',
    'counselling.successNext': 'What happens next',
    'counselling.successNextBody': 'We email you the meeting link.',
    'counselling.successWhatsappMessage': 'Hi SICA, about my booking',
    'counselling.successWhatsappCta': 'Message us on WhatsApp',
    'counselling.backHome': 'Back to home',
  };
  return map[key] ?? key;
});

const trackMock = vi.fn();

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: tMock, locale: 'en', setLocale: vi.fn() }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/lib/contact', () => ({
  WHATSAPP_PHONE: '8617325764171',
}));

vi.mock('@/lib/analytics', () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

// The real UTM helper reads the current URL and localStorage; the booking
// payload just needs the keys, not the values.
vi.mock('@/lib/utm', () => ({
  getCurrentUtm: () => ({}),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

const SELECTION: CatalogSelection = {
  universitySlug: 'tsinghua-university',
  universityName: 'Tsinghua University',
  universityNameCn: '清华大学',
  programSlug: 'bs-computer-science',
  programName: 'BSc Computer Science',
  programNameCn: '计算机科学学士',
  sourcePath: '/programs/bs-computer-science',
};

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

const fetchMock = vi.fn();

/** Drive the wizard from the slot grid to the details form. */
async function pickSlotAndContinue(): Promise<void> {
  const slot = await screen.findByRole('button', { name: /10:00/ });
  fireEvent.click(slot);
  const next = screen.getByRole('button', { name: 'Continue' });
  await waitFor(() => expect(next).not.toBeDisabled());
  fireEvent.click(next);
  await screen.findByPlaceholderText('John Smith');
}

function fillDetails(): void {
  fireEvent.change(screen.getByPlaceholderText('John Smith'), { target: { value: 'Ayesha Rahman' } });
  fireEvent.change(screen.getByPlaceholderText('john@example.com'), { target: { value: 'ayesha@example.com' } });
  fireEvent.change(screen.getByPlaceholderText('+92 300 1234567'), { target: { value: '+8801700000000' } });
}

beforeEach(() => {
  tMock.mockClear();
  trackMock.mockClear();
  fetchMock.mockReset();
  fetchMock.mockImplementation(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.startsWith('/api/counselling/slots')) {
      if (url.includes('date=')) {
        return jsonResponse({ slots: [{ start: '2026-12-01T02:00:00.000Z', label: '10:00', available: true }] });
      }
      return jsonResponse({ dates: ['2026-12-01'] });
    }
    if (url === '/api/counselling/bookings') {
      return jsonResponse({
        booking: {
          reference: 'CS-20261124-ABCD',
          slotStart: '2026-12-01T02:00:00.000Z',
          slotLabel: '10:00',
          selection: SELECTION,
        },
      });
    }
    return jsonResponse({});
  });
  vi.stubGlobal('fetch', fetchMock);
});

describe('ConsultationBookingCard — inline booking on the detail pages', () => {
  it('tells the visitor what the consultation is about', async () => {
    render(<ConsultationBookingCard selection={SELECTION} name="Tsinghua University" surface="program_detail" />);

    expect(screen.getByText('Book a free 10-minute consultation')).toBeInTheDocument();
    // The selection strip names the exact program + university being viewed.
    expect(screen.getByText('BSc Computer Science — Tsinghua University')).toBeInTheDocument();
    // Let the wizard's slot fetch settle before the test ends.
    await screen.findByRole('button', { name: /10:00/ });
  });

  it('attaches the university and program to the booking request', async () => {
    render(<ConsultationBookingCard selection={SELECTION} name="Tsinghua University" surface="program_detail" />);

    await pickSlotAndContinue();
    fillDetails();
    fireEvent.click(screen.getByRole('button', { name: 'Book my session' }));

    await waitFor(() => {
      const call = fetchMock.mock.calls.find(([url]) => String(url) === '/api/counselling/bookings');
      expect(call).toBeDefined();
      const body = JSON.parse(String((call?.[1] as RequestInit | undefined)?.body));
      expect(body.university).toBe('tsinghua-university');
      expect(body.program).toBe('bs-computer-science');
      expect(body.sourcePage).toBe('/programs/bs-computer-science');
      expect(body.email).toBe('ayesha@example.com');
    });

    // The booking reference is shown once the slot is secured.
    expect(await screen.findByText('CS-20261124-ABCD')).toBeInTheDocument();
  });

  it('reports a slot that was taken while the visitor was filling the form', async () => {
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.startsWith('/api/counselling/slots')) {
        if (url.includes('date=')) {
          return jsonResponse({ slots: [{ start: '2026-12-01T02:00:00.000Z', label: '10:00', available: true }] });
        }
        return jsonResponse({ dates: ['2026-12-01'] });
      }
      if (url === '/api/counselling/bookings') {
        return jsonResponse({ error: 'That slot was just taken — please pick another time' }, 409);
      }
      return jsonResponse({});
    });

    render(<ConsultationBookingCard selection={SELECTION} name="Tsinghua University" surface="program_detail" />);

    await pickSlotAndContinue();
    fillDetails();
    fireEvent.click(screen.getByRole('button', { name: 'Book my session' }));

    expect(await screen.findByText(/That slot was just taken/i)).toBeInTheDocument();
    // A lost slot sends the visitor back to the time picker.
    expect(await screen.findByRole('button', { name: /10:00/ })).toBeInTheDocument();
  });

  it('keeps the dedicated booking page reachable with the selection attached', async () => {
    render(<ConsultationBookingCard selection={SELECTION} name="Tsinghua University" surface="program_detail" />);

    const link = screen.getByRole('link', { name: 'See all consultation options' });
    expect(link).toHaveAttribute(
      'href',
      expect.stringContaining('/counselling?interest=tsinghua-university'),
    );
    expect(link.getAttribute('href')).toContain('program=bs-computer-science');
    await screen.findByRole('button', { name: /10:00/ });
  });

  it('does not offer to clear the selection — the page IS the selection', async () => {
    render(<ConsultationBookingCard selection={SELECTION} name="Tsinghua University" surface="program_detail" />);

    // "Continue without this selection" points at /counselling, which is the
    // page the selection was carried FROM. On a detail page there is nothing
    // to clear, and the link would throw the visitor off the page.
    expect(screen.queryByRole('link', { name: /Continue without this selection/i })).not.toBeInTheDocument();
    await screen.findByRole('button', { name: /10:00/ });
  });

  it('tags the funnel events with the detail surface', async () => {
    render(<ConsultationBookingCard selection={SELECTION} name="Tsinghua University" surface="program_detail" />);

    await waitFor(() => {
      expect(trackMock).toHaveBeenCalledWith(
        'counselling_wizard_start',
        expect.objectContaining({ surface: 'program_detail' }),
      );
    });
  });
});
