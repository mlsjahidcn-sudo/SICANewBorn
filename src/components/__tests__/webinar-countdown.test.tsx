import { act, cleanup, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CountdownTimer } from '@/app/webinar-2027-intake-csc/CountdownTimer';

vi.mock('@/lib/i18n', () => ({ useI18n: () => ({ t: (key: string): string => key }) }));

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2098-12-31T23:59:50Z'));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('webinar countdown hydration', () => {
  it('renders no time-dependent digits on the server', () => {
    const html = renderToString(<CountdownTimer sessionDate="2099-01-01T00:00:00Z" />);
    expect(html).not.toMatch(/\d/);
    expect(html).toBe('');
  });

  it('hydrates cached HTML without errors after the browser clock has moved', async () => {
    const container = document.createElement('div');
    container.innerHTML = renderToString(<CountdownTimer sessionDate="2099-01-01T00:00:00Z" />);
    vi.setSystemTime(new Date('2098-12-31T23:59:55Z'));
    const onRecoverableError = vi.fn();
    let root: ReturnType<typeof hydrateRoot>;
    await act(async () => {
      root = hydrateRoot(container, <CountdownTimer sessionDate="2099-01-01T00:00:00Z" />, { onRecoverableError });
    });
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector('[aria-label="webinar.countdown.ariaLabel"]')).toHaveTextContent('05');
    act(() => root.unmount());
  });

  it('appears immediately after mount and updates every second', () => {
    render(<CountdownTimer sessionDate="2099-01-01T00:00:00Z" />);
    const timer = screen.getByLabelText('webinar.countdown.ariaLabel');
    expect(timer.querySelectorAll('.text-base')[3]).toHaveTextContent('10');
    act(() => vi.advanceTimersByTime(1000));
    expect(timer.querySelectorAll('.text-base')[3]).toHaveTextContent('09');
    act(() => vi.advanceTimersByTime(9000));
    expect(screen.queryByLabelText('webinar.countdown.ariaLabel')).not.toBeInTheDocument();
  });
});
