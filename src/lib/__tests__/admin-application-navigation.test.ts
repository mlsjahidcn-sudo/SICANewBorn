import { describe, expect, it } from 'vitest';
import { applicationDetailHref, applicationListHref, applicationReturnTo, readApplicationListLocation } from '@/lib/admin-application-navigation';

describe('application list navigation', () => {
  it('round-trips the full list context including multiple expanded students', () => {
    const params = new URLSearchParams('source=Partner&search=Amina&status=Submitted&student=s1&archive=archived&decision=with&enrolled=enrolled&payment=partial&channel=offline&view=flat&sort=university&order=asc&page=3&expanded=student%3As1&expanded=partner%3Ap1');
    const state = readApplicationListLocation(params);
    const href = applicationListHref(state, '2027-fall', false);
    expect(readApplicationListLocation(new URL(href, 'https://example.test').searchParams)).toEqual(state);
    expect(href).toContain('intake=2027-fall');
  });
  it('normalizes invalid values without losing a valid search', () => {
    const state = readApplicationListLocation(new URLSearchParams('page=NaN&status=bogus&view=bogus&archive=all&sort=bogus&search=Amina'));
    expect(state).toMatchObject({ page: 1, status: 'all', view: 'grouped', archive: 'active', sort: 'createdAt', search: 'Amina' });
    expect(applicationListHref(state, null, false)).toBe('/admin/applications?search=Amina');
  });
  it('preserves the partner-only surface without broadening the list on return', () => {
    const href = applicationListHref(readApplicationListLocation(new URLSearchParams('source=Partner&page=2')), null, true);
    expect(href).toContain('surface=partner');
    expect(href).not.toContain('source=');
    expect(new URL(applicationDetailHref('p1', 'partner', href), 'https://example.test').searchParams.get('returnTo')).toBe(href);
  });
  it.each(['https://evil.test', '//evil.test', '/admin/applications/other', '/admin/students', 'javascript:alert(1)'])('rejects an unrelated return destination: %s', value => {
    expect(applicationReturnTo(value)).toBe('/admin/applications');
  });
});
