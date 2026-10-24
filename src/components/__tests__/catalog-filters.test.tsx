import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { I18nProvider } from '@/lib/i18n';
import { CatalogFiltersPanel } from '@/components/catalog/catalog-filters';

describe('mobile public catalog filters', () => {
  it('applies a draft only when Apply is clicked and resets the draft', () => {
    const onChange = vi.fn();
    render(<I18nProvider initialLocale="en"><CatalogFiltersPanel kind="programs" filters={{ degree: 'Master' }} facets={{ degree: [{ value: 'Master', label: 'Master', count: 2 }, { value: 'Bachelor', label: 'Bachelor', count: 3 }] }} onChange={onChange} /></I18nProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Filters (1)' }));
    const drawer = within(screen.getByRole('dialog'));
    fireEvent.change(drawer.getByLabelText('Degree'), { target: { value: 'Bachelor' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(drawer.getByRole('button', { name: 'Apply filters' }));
    expect(onChange).toHaveBeenCalledWith({ degree: 'Bachelor' });
    fireEvent.click(screen.getByRole('button', { name: 'Filters (1)' }));
    const reopened = within(screen.getByRole('dialog'));
    expect(reopened.getByLabelText('Degree')).toHaveValue('Master');
    fireEvent.click(reopened.getByRole('button', { name: 'Reset' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    fireEvent.click(reopened.getByRole('button', { name: 'Apply filters' }));
    expect(onChange).toHaveBeenLastCalledWith({});
  });
});
