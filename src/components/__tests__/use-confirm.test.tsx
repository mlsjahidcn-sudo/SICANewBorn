import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useConfirm, type ConfirmOptions } from '@/components/admin/use-confirm';

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: 'en' }),
}));

let ask: (options: ConfirmOptions) => Promise<boolean> = async () => false;

function Harness() {
  const [confirm, dialog] = useConfirm();
  useEffect(() => {
    ask = confirm;
  }, [confirm]);
  return <>{dialog}</>;
}

describe('useConfirm', () => {
  it('resolves true when the confirm button is pressed', async () => {
    render(<Harness />);
    let result: Promise<boolean> = Promise.resolve(false);
    act(() => {
      result = ask({ title: 'Delete this note?', confirmLabel: 'Delete', destructive: true });
    });
    expect(await screen.findByText('Delete this note?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await expect(result).resolves.toBe(true);
    await waitFor(() => expect(screen.queryByText('Delete this note?')).toBeNull());
  });

  it('resolves false on cancel and shows the description', async () => {
    render(<Harness />);
    let result: Promise<boolean> = Promise.resolve(true);
    act(() => {
      result = ask({ title: 'Approve Acme?', description: 'They can sign in immediately.' });
    });
    expect(await screen.findByText('They can sign in immediately.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'adminCommon.cancel' }));
    await expect(result).resolves.toBe(false);
  });

  it('cancels an earlier prompt when a second one opens', async () => {
    render(<Harness />);
    let first: Promise<boolean> = Promise.resolve(true);
    act(() => {
      first = ask({ title: 'First?' });
    });
    act(() => {
      void ask({ title: 'Second?' });
    });
    await expect(first).resolves.toBe(false);
    expect(await screen.findByText('Second?')).toBeTruthy();
  });
});
