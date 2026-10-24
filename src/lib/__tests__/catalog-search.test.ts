import { describe, expect, it } from 'vitest';
import { catalogMatches, catalogQueryTerms, parseCatalogQuery, catalogHref, catalogTabHref, normalizeCatalogText } from '@/lib/catalog-search';

describe('public catalog query semantics', () => {
  it('combines subject, language and city across one offering', () => {
    const terms = catalogQueryTerms('English computer science in Beijing');
    expect(catalogMatches(terms, 'Computer Science Bachelor English Tsinghua University Beijing')).toBe(true);
    expect(catalogMatches(terms, 'Computer Science Bachelor Chinese Beijing')).toBe(false);
    expect(catalogMatches(terms, 'Computer Science Bachelor English Shanghai')).toBe(false);
  });
  it('does not combine terms from separate university programs', () => {
    const terms = catalogQueryTerms('English computer science');
    const offerings = ['English Business', 'Chinese Computer Science'];
    expect(offerings.some((offering) => catalogMatches(terms, offering))).toBe(false);
  });
  it.each([
    ['CS', 'Computer Science'], ['AI', 'Artificial Intelligence'], ['MSc', 'Master'],
    ['博士', 'PhD'], ['英语 计算机', 'English Computer Science'], ['本科', 'Bachelor'],
  ])('supports the alias %s', (query, text) => {
    expect(catalogMatches(catalogQueryTerms(query), text)).toBe(true);
  });
  it('matches Chinese university names and punctuation safely', () => {
    expect(catalogMatches(catalogQueryTerms('清华'), '清华大学')).toBe(true);
    expect(normalizeCatalogText('ＣＳ， English—Beijing')).toBe('cs english beijing');
    expect(catalogMatches(catalogQueryTerms('unknown % ) , query'), 'Computer Science Beijing')).toBe(false);
  });
  it('defaults searched results to relevance and retains explicit sorting', () => {
    expect(parseCatalogQuery('programs', new URLSearchParams('q=CS')).sort).toBe('relevance');
    expect(parseCatalogQuery('universities', new URLSearchParams()).sort).toBe('ranking');
    expect(parseCatalogQuery('programs', new URLSearchParams('q=CS&sort=tuition')).sort).toBe('tuition');
  });
  it('retains API aliases and normalized numeric bounds', () => {
    const query = parseCatalogQuery('programs', new URLSearchParams('search=CS&language=English&university=tsinghua&discipline=Engineering&tuition_min=0&duration_max=4'));
    expect(query.filters).toEqual({ language: 'English', university: 'tsinghua', discipline: 'Engineering', tuition_min: '0', duration_max: '4' });
    expect(catalogHref(query)).toContain('lang=English');
    expect(catalogHref(query)).toContain('uni=tsinghua');
  });
  it('rejects invalid pagination, numeric bounds, sort values and budget bands', () => {
    const query = parseCatalogQuery('programs', new URLSearchParams('q=x&page=NaN&limit=99999&sort=bogus&year=bad&duration_min=-1&tuition=garbage'));
    expect(query.page).toBe(1); expect(query.limit).toBe(500); expect(query.sort).toBe('relevance');
    expect(query.filters).toEqual({});
  });
  it('keeps explicit not-published selections, including the numeric intake year', () => {
    expect(parseCatalogQuery('programs', new URLSearchParams('year=__none__&disc=__none__')).filters).toEqual({ year: '__none__', discipline: '__none__' });
  });
  it('does not confuse the hreflang locale with a teaching-language filter', () => {
    expect(parseCatalogQuery('programs', new URLSearchParams('lang=zh')).filters).toEqual({});
    expect(parseCatalogQuery('programs', new URLSearchParams('lang=en')).filters).toEqual({});
    expect(parseCatalogQuery('programs', new URLSearchParams('lang=zh&language=English')).filters).toEqual({ language: 'English' });
  });
  it('drops incompatible filters and pagination when switching tabs', () => {
    const query = parseCatalogQuery('programs', new URLSearchParams('q=CS&city=Beijing&degree=Master&lang=English&uni=tsinghua&page=4'));
    expect(catalogTabHref(query, 'universities')).toBe('/universities?q=CS&city=Beijing');
  });
  it('round-trips shared URLs without administrative visibility flags', () => {
    const query = parseCatalogQuery('programs', new URLSearchParams('q=CS&lang=English&disc=Engineering&scholarship=1&page=2&include_archived=true'));
    const href = catalogHref(query);
    expect(href).not.toContain('archived');
    expect(parseCatalogQuery('programs', new URLSearchParams(href.split('?')[1]))).toEqual(query);
  });
});
