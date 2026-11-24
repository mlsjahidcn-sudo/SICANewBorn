import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

/**
 * `RemoteSearchSelect` fetches `{ options, hasMore }` and writes `options`
 * straight into state. A response that does not carry an `options` array used
 * to put `undefined` into that state, and the very next render crashed on
 * `options.map` — taking down the whole admin/partner page that embeds this
 * picker, not just the test.
 */
const apiMock = vi.fn();

vi.mock('@/lib/api-client', () => ({
  apiFetchJson: (...args: unknown[]) => apiMock(...args),
}));

vi.mock('@/lib/i18n', () => ({
  useI18n: () => ({ t: (key: string) => key, locale: 'en' }),
}));

vi.mock('@/components/ui/searchable-select', () => ({
  SearchableSelect: ({ options }: { options: Array<{ value: string }> }) => (
    <div data-testid="options">{options.length}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
}));

import { RemoteSearchSelect } from '../admin/remote-search-select';

beforeEach(() => {
  apiMock.mockReset();
});

describe('RemoteSearchSelect', () => {
  it('renders an empty list when the response carries no options array', async () => {
    apiMock.mockResolvedValue({ student: { id: 'student-1' } });

    render(
      <RemoteSearchSelect
        url="/api/admin/students?kind=partner"
        value=""
        onChange={vi.fn()}
        placeholder="Pick a student"
      />,
    );

    await waitFor(() => expect(apiMock).toHaveBeenCalled());
    expect(screen.getByTestId('options')).toHaveTextContent('0');
  });

  it('renders the options the response does carry', async () => {
    apiMock.mockResolvedValue({
      options: [{ value: 'student-1', label: 'Test Student', record: { id: 'student-1' } }],
      hasMore: false,
    });

    render(
      <RemoteSearchSelect
        url="/api/admin/students?kind=partner"
        value=""
        onChange={vi.fn()}
        placeholder="Pick a student"
      />,
    );

    await waitFor(() => expect(screen.getByTestId('options')).toHaveTextContent('1'));
  });
});
