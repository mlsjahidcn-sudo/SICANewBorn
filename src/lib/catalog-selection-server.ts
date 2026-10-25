import { getProgramBySlug } from '@/lib/program-queries';
import { getUniversityBySlug } from '@/lib/university-queries';
import type { CatalogSelection } from './catalog-selection';

export class CatalogSelectionError extends Error {
  constructor(message: string, public status: number = 400) { super(message); }
}

function slug(value: unknown): string {
  if (value == null || value === '') return '';
  if (typeof value !== 'string' || value.length > 240 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) throw new CatalogSelectionError('Invalid catalog selection');
  return value;
}

export async function resolveCatalogSelection(input: { university?: unknown; program?: unknown; interest?: unknown }): Promise<CatalogSelection | null> {
  const universitySlug = slug(input.university ?? input.interest);
  const programSlug = slug(input.program);
  if (!universitySlug && !programSlug) return null;
  try {
    const program = programSlug ? await getProgramBySlug(programSlug) : null;
    if (programSlug && !program) throw new CatalogSelectionError('This program is no longer available. Choose another program.');
    if (program && universitySlug && program.universitySlug !== universitySlug) throw new CatalogSelectionError('The selected program does not belong to this university');
    const university = await getUniversityBySlug(program?.universitySlug || universitySlug);
    if (!university) throw new CatalogSelectionError('This university is no longer available. Choose another university.');
    return {
      universitySlug: university.slug, universityName: university.name, universityNameCn: university.nameCn,
      ...(program ? { programSlug: program.slug, programName: program.name, programNameCn: program.nameCn } : {}),
      sourcePath: program ? `/programs/${program.slug}` : `/universities/${university.slug}`,
    };
  } catch (error) {
    if (error instanceof CatalogSelectionError) throw error;
    throw new CatalogSelectionError('Unable to confirm the selected catalog entry. Please try again.', 503);
  }
}

export async function selectionForPage(params: Record<string, string | string[] | undefined>): Promise<{ selection: CatalogSelection | null; selectionError: boolean }> {
  try { return { selection: await resolveCatalogSelection(params), selectionError: false }; }
  catch { return { selection: null, selectionError: true }; }
}
