import { cleanup, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiFetchJson: vi.fn().mockResolvedValue({ intakes: [{ label: '2026 Fall' }], options: [], hasMore: false }),
}));
vi.mock('@/lib/i18n', () => ({ useI18n: () => ({ t: (key: string) => key }) }));

import { PartnerApplicationTargetDialog } from '@/components/admin/partner-application-target-dialog';

beforeEach(() => { cleanup(); });

describe('PartnerApplicationTargetDialog', () => {
  it('keeps program selection closed until a university is chosen', () => {
    render(
      <PartnerApplicationTargetDialog
        open
        mode="assign"
        onOpenChange={() => {}}
        onSubmit={async () => {}}
      />,
    );
    expect(screen.getByRole('button', { name: 'adminPartnerAppTarget.selectUniversityFirst' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'adminPartnerAppTarget.saveAssignment' })).toBeDisabled();
  });

  it('asks for an intake when creating another application', async () => {
    render(
      <PartnerApplicationTargetDialog
        open
        mode="create"
        onOpenChange={() => {}}
        onSubmit={async () => {}}
      />,
    );
    expect(await screen.findByText('adminPartnerAppTarget.intake')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'adminPartnerAppTarget.saveAssignment' })).not.toBeInTheDocument();
  });
});
