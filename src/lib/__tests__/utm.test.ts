import { describe, it, expect, beforeEach } from 'vitest';
import {
  captureUtmFromCurrentUrl,
  getStoredUtm,
  getCurrentUtm,
} from '@/lib/utm';

describe('utm helper', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    // jsdom doesn't implement URLSearchParams location.search
    // by default — start each test with an empty search.
    window.history.replaceState({}, '', '/');
  });

  it('returns {} when no UTMs are in the URL or storage', () => {
    expect(getStoredUtm()).toEqual({});
  });

  it('captures whitelisted UTMs from the current URL', () => {
    window.history.replaceState(
      {},
      '',
      '/?utm_source=google&utm_medium=cpc&utm_campaign=spring_2026',
    );
    const captured = captureUtmFromCurrentUrl();
    expect(captured).toEqual({
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'spring_2026',
    });
  });

  it('ignores non-whitelisted keys', () => {
    window.history.replaceState(
      {},
      '',
      '/?utm_source=google&not_a_real_param=hax&evil_key=owned',
    );
    const captured = captureUtmFromCurrentUrl();
    expect(captured).toEqual({ utm_source: 'google' });
    expect(captured).not.toHaveProperty('not_a_real_param');
    expect(captured).not.toHaveProperty('evil_key');
  });

  it('trims whitespace and skips empty values', () => {
    window.history.replaceState(
      {},
      '',
      '/?utm_source=%20google%20&utm_medium=&utm_term=   ',
    );
    const captured = captureUtmFromCurrentUrl();
    expect(captured).toEqual({ utm_source: 'google' });
  });

  it('captures click IDs (gclid, fbclid)', () => {
    window.history.replaceState(
      {},
      '',
      '/?gclid=TeSter-123&fbclid=fb-tester-456',
    );
    const captured = captureUtmFromCurrentUrl();
    expect(captured).toEqual({
      gclid: 'TeSter-123',
      fbclid: 'fb-tester-456',
    });
  });

  it('persists across calls (sessionStorage)', () => {
    window.history.replaceState({}, '', '/?utm_source=google');
    captureUtmFromCurrentUrl();
    // Simulate navigation that drops the query string
    window.history.replaceState({}, '', '/universities');
    expect(getStoredUtm()).toEqual({ utm_source: 'google' });
  });

  it('merges new captures with stored values (preserves earlier keys)', () => {
    window.history.replaceState({}, '', '/?utm_source=google');
    captureUtmFromCurrentUrl();
    // User later clicks an internal link that has utm_campaign
    // but no source. Source from the earlier visit is preserved.
    window.history.replaceState({}, '', '/?utm_campaign=summer');
    captureUtmFromCurrentUrl();
    expect(getStoredUtm()).toEqual({
      utm_source: 'google',
      utm_campaign: 'summer',
    });
  });

  it('getCurrentUtm captures + reads in one call', () => {
    window.history.replaceState({}, '', '/?utm_source=newsletter');
    const result = getCurrentUtm();
    expect(result).toEqual({ utm_source: 'newsletter' });
    // Subsequent read (no query string) still returns the value
    window.history.replaceState({}, '', '/');
    expect(getCurrentUtm()).toEqual({ utm_source: 'newsletter' });
  });

  it('handles malformed sessionStorage gracefully', () => {
    window.sessionStorage.setItem('sica_utm_v1', 'not-json{');
    expect(getStoredUtm()).toEqual({});
  });
});
