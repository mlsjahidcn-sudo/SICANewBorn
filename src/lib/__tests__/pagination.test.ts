import { describe, expect, it } from 'vitest';
import { pageNumbers } from '@/lib/pagination';

describe('pageNumbers', () => {
  it('shows the first window and last page', () => {
    expect(pageNumbers(1, 29)).toEqual([1, 2, 3, '…', 29]);
  });

  it('shows a middle window between the first and last pages', () => {
    expect(pageNumbers(15, 29)).toEqual([1, '…', 13, 14, 15, 16, 17, '…', 29]);
  });

  it('shows every page for a small total', () => {
    expect(pageNumbers(2, 3)).toEqual([1, 2, 3]);
  });
});
