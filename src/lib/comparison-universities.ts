/** Display aliases once in the picker; no database records or detail URLs are merged. */
export function uniqueComparisonUniversities<T extends { slug: string; name: string; city: string }>(universities: T[]): T[] {
  const seen = new Set<string>();
  return universities.filter((university) => {
    const normalize = (value: string): string => value.normalize('NFKC').trim().toLowerCase().replace(/\s+/g, ' ');
    const identity = `${normalize(university.name)}|${normalize(university.city)}`;
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}
