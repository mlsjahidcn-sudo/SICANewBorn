import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Program, University } from '@/lib/data';
import { selectionLabel, selectionNotes, selectionQuery, selectionTopic } from '@/lib/catalog-selection';

const mocks = vi.hoisted(() => ({ program: vi.fn(), university: vi.fn() }));
vi.mock('@/lib/program-queries', () => ({ getProgramBySlug: mocks.program }));
vi.mock('@/lib/university-queries', () => ({ getUniversityBySlug: mocks.university }));
import { resolveCatalogSelection, selectionForPage } from '@/lib/catalog-selection-server';

beforeEach(() => {
  vi.clearAllMocks();
  mocks.program.mockResolvedValue({ slug: 'computer-science', name: 'Computer Science', nameCn: '计算机科学', universitySlug: 'example-university' } satisfies Partial<Program>);
  mocks.university.mockResolvedValue({ slug: 'example-university', name: 'Example University', nameCn: '示例大学' } satisfies Partial<University>);
});

describe('validated catalog handoff', () => {
  it('derives the institution and names from the public program, ignoring untrusted labels', async () => {
    const selection = await resolveCatalogSelection({ program: 'computer-science' });
    expect(selection).toMatchObject({ universitySlug: 'example-university', universityName: 'Example University', programName: 'Computer Science', sourcePath: '/programs/computer-science' });
    expect(mocks.university).toHaveBeenCalledWith('example-university');
    expect(selectionLabel(selection!, 'zh')).toBe('计算机科学 — 示例大学');
    expect(selectionQuery(selection!).toString()).toContain('program=computer-science');
    expect(selectionTopic(selection, 'Funding question')).toContain('Computer Science — Example University\nFunding question');
    expect(selectionNotes(selection, 'My notes')).toContain('(/programs/computer-science)\n\nMy notes');
  });
  it('rejects a mismatched university before any downstream submission', async () => {
    await expect(resolveCatalogSelection({ program: 'computer-science', university: 'other-university' })).rejects.toMatchObject({ status: 400 });
    expect(mocks.university).not.toHaveBeenCalled();
  });
  it('rejects hidden/missing public programs and does not fall back to a supplied name', async () => {
    mocks.program.mockResolvedValue(null);
    await expect(resolveCatalogSelection({ program: 'computer-science' })).rejects.toMatchObject({ status: 400 });
  });
  it('distinguishes catalog failures from invalid selections', async () => {
    mocks.program.mockRejectedValue(new Error('Database unavailable'));
    await expect(resolveCatalogSelection({ program: 'computer-science' })).rejects.toMatchObject({ status: 503 });
    expect(await selectionForPage({ program: 'computer-science' })).toEqual({ selection: null, selectionError: true });
  });
  it.each(['../admin', 'https://example.test', ['computer-science']])('rejects malformed selection %s', async (program) => {
    await expect(resolveCatalogSelection({ program })).rejects.toMatchObject({ status: 400 });
    expect(mocks.program).not.toHaveBeenCalled();
  });
  it('keeps the ordinary unselected form path and supports legacy university interest links', async () => {
    expect(await resolveCatalogSelection({})).toBeNull();
    expect(selectionTopic(null, 'Other question')).toBe('Other question');
    expect(await resolveCatalogSelection({ interest: 'example-university' })).toMatchObject({ sourcePath: '/universities/example-university' });
  });
});
