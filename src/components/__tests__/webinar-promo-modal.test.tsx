import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

/**
 * The webinar promo is a sitewide MODAL that owns the promo slot while a
 * session is upcoming. These tests cover the parts that are easy to break:
 * when it is allowed to appear, when it must stay away, and that the Kit
 * exit-intent promo stands down for the same period so the two never
 * compete for the same moment.
 */

const trackMock = vi.fn();
const pathnameMock = vi.fn(() => '/universities/tsinghua-university');

vi.mock('@/lib/analytics', () => ({
  track: (...args: unknown[]) => trackMock(...args),
}));

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: 'en' }),
}));

vi.mock('next/navigation', () => ({
  usePathname: () => pathnameMock(),
}));

import { WebinarPromoPopup } from '../webinar-promo-popup';
import { KitPromoPopup } from '../kit-promo-popup';
import { WEBINAR_CONFIG } from '@/lib/webinar-config';

/** jsdom has no matchMedia — the popup probes it for the touch trigger. */
function stubMatchMedia(matches: boolean): void {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

/** Exit intent: the visitor's pointer leaves through the top of the window. */
function fireExitIntent(): void {
  act(() => {
    document.dispatchEvent(new MouseEvent('mouseleave', { clientY: 0 }));
  });
}

beforeEach(() => {
  trackMock.mockClear();
  pathnameMock.mockReturnValue('/universities/tsinghua-university');
  stubMatchMedia(false);
  window.sessionStorage.clear();
});

afterEach(() => {
  window.sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe('webinar session configuration', () => {
  it('points at Wednesday 2 December 2026, 21:00 Beijing time', () => {
    expect(WEBINAR_CONFIG.sessionDateIso).toBe('2026-12-02T13:00:00.000Z');
    // 13:00 UTC is 21:00 Asia/Shanghai.
    const beijing = new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Shanghai',
    }).format(new Date(WEBINAR_CONFIG.sessionDateIso));
    expect(beijing).toContain('Wednesday, 2 December 2026');
    expect(beijing).toContain('21:00');
  });
});

describe('WebinarPromoPopup — the sitewide modal', () => {
  it('opens on exit intent on a university page', async () => {
    render(<WebinarPromoPopup />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireExitIntent();

    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /webinar\.popupCta/ })).toHaveAttribute(
      'href',
      '/webinar-2027-intake-csc#signup',
    );
    expect(trackMock).toHaveBeenCalledWith(
      'webinar_popup_view',
      expect.objectContaining({ locale: 'en' }),
    );
  });

  it('opens on a program page and on a guide page', async () => {
    for (const path of ['/programs/bs-computer-science', '/guides/visa']) {
      pathnameMock.mockReturnValue(path);
      const { unmount } = render(<WebinarPromoPopup />);
      fireExitIntent();
      await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());
      unmount();
    }
  });

  it('stays away on the webinar landing page and the conversion pages', () => {
    for (const path of [
      '/webinar-2027-intake-csc',
      '/counselling',
      '/apply',
      '/assessment',
      '/contact',
      '/thank-you',
    ]) {
      pathnameMock.mockReturnValue(path);
      const { unmount } = render(<WebinarPromoPopup />);
      fireExitIntent();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      unmount();
    }
  });

  it('does not come back after the visitor dismisses it', async () => {
    render(<WebinarPromoPopup />);
    fireExitIntent();
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument());

    // Two dismiss controls share the label: the "Maybe later" button and
    // the X in the corner.
    const [maybeLater] = screen.getAllByRole('button', { name: 'webinar.popupDismiss' });
    fireEvent.click(maybeLater);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    fireExitIntent();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('the Kit promo stands down while the webinar campaign is live', () => {
  it('does not open on a university page', () => {
    render(<KitPromoPopup />);
    fireExitIntent();
    // One promo at a time: the webinar modal owns the slot until the
    // session date has passed.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
