import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { PublicPromotions } from '@/components/public-promotions';

afterEach(() => { Object.defineProperty(window, 'scrollY', { value: 0, configurable: true }); });

function engage(): void {
  Object.defineProperty(window, 'scrollY', { value: 200, configurable: true });
  fireEvent.scroll(window);
}

describe('public campaign priority', () => {
  it('waits for browsing and yields while navigation is open', () => {
    const { rerender } = render(<PublicPromotions paused={false}><p>Campaign</p></PublicPromotions>);
    expect(screen.queryByText('Campaign')).toBeNull();
    engage();
    expect(screen.getByText('Campaign')).toBeInTheDocument();
    rerender(<PublicPromotions paused><p>Campaign</p></PublicPromotions>);
    expect(screen.queryByText('Campaign')).toBeNull();
    rerender(<PublicPromotions paused={false}><p>Campaign</p></PublicPromotions>);
    expect(screen.getByText('Campaign')).toBeInTheDocument();
  });

  it('does not interrupt form entry', async () => {
    render(<><main><form><label>Email<input aria-label="Email" /></label></form></main><PublicPromotions paused={false}><p>Campaign</p></PublicPromotions></>);
    engage();
    await act(async () => { screen.getByRole('textbox', { name: 'Email' }).focus(); });
    expect(screen.queryByText('Campaign')).toBeNull();
    await act(async () => { screen.getByRole('textbox', { name: 'Email' }).blur(); });
    expect(screen.getByText('Campaign')).toBeInTheDocument();
  });

  it('yields to an opened contact dialog', async () => {
    const { rerender } = render(<><div role="dialog" data-state="closed" /><PublicPromotions paused={false}><p>Campaign</p></PublicPromotions></>);
    engage();
    rerender(<><div role="dialog" data-state="open" /><PublicPromotions paused={false}><p>Campaign</p></PublicPromotions></>);
    await waitFor(() => expect(screen.queryByText('Campaign')).toBeNull());
  });
});
