import { describe, expect, it } from 'vitest';

import {
  APPLICATION_SOURCES,
  DOC_REQUEST_CATEGORIES,
  DOC_REQUEST_CATEGORY_LABEL_KEY,
  DOC_REQUEST_TO_PARTNER_DOC_CATEGORY,
  PRIORITY_VARIANTS,
  SOURCE_LABEL_KEY,
  STATUS_VARIANTS,
  countDocumentsForRequest,
} from '@/lib/partner-status-styles';
import {
  PARTNER_APPLICATION_PRIORITIES,
  PARTNER_APPLICATION_STATUSES,
} from '@/lib/partner-application-mapper';
import { PARTNER_DOC_CATEGORIES } from '@/lib/partner-doc-mapper';

/**
 * The partner surfaces used to keep their own copies of the badge class
 * maps, and the copies had already drifted (the `Low` priority used two
 * different greys). These tests lock the shared module down so a future
 * edit can't silently reintroduce a second source of truth.
 */
describe('partner status styles', () => {
  it('covers every application status', () => {
    for (const status of PARTNER_APPLICATION_STATUSES) {
      expect(STATUS_VARIANTS[status]).toBeDefined();
    }
    expect(Object.keys(STATUS_VARIANTS).sort()).toEqual(
      [...PARTNER_APPLICATION_STATUSES].sort(),
    );
  });

  it('covers every application priority', () => {
    expect(Object.keys(PRIORITY_VARIANTS).sort()).toEqual(
      [...PARTNER_APPLICATION_PRIORITIES].sort(),
    );
  });

  it('keeps a single Low priority colour', () => {
    // The list page used text-gray-600 and the detail page text-gray-700.
    expect(PRIORITY_VARIANTS.Low).toContain('text-gray-600');
    expect(PRIORITY_VARIANTS.Low).not.toContain('text-gray-700');
  });

  it('maps every request category to a label key and to a bridge', () => {
    for (const category of DOC_REQUEST_CATEGORIES) {
      expect(DOC_REQUEST_CATEGORY_LABEL_KEY[category]).toBeTruthy();
      expect(category in DOC_REQUEST_TO_PARTNER_DOC_CATEGORY).toBe(true);
    }
  });

  it('bridges the snake-case request vocabulary to the Title-case upload vocabulary', () => {
    expect(DOC_REQUEST_TO_PARTNER_DOC_CATEGORY.passport).toBe('Identity');
    expect(DOC_REQUEST_TO_PARTNER_DOC_CATEGORY.transcript).toBe('Academic');
    expect(DOC_REQUEST_TO_PARTNER_DOC_CATEGORY.english_test).toBe('Language');
    // Photo + Other have no upload counterpart — a null bridge means
    // "no automatic evidence", not "zero documents".
    expect(DOC_REQUEST_TO_PARTNER_DOC_CATEGORY.photo).toBeNull();
    expect(DOC_REQUEST_TO_PARTNER_DOC_CATEGORY.other).toBeNull();
  });

  it('only bridges to real upload categories', () => {
    for (const target of Object.values(DOC_REQUEST_TO_PARTNER_DOC_CATEGORY)) {
      if (target === null) continue;
      expect(PARTNER_DOC_CATEGORIES).toContain(target);
    }
  });

  it('covers every application source', () => {
    expect(Object.keys(SOURCE_LABEL_KEY).sort()).toEqual(
      [...APPLICATION_SOURCES].sort(),
    );
  });
});

describe('countDocumentsForRequest', () => {
  const docs = [
    { category: 'Identity', uploadedAt: '2026-10-20T10:00:00Z' },
    { category: 'Identity', uploadedAt: '2026-10-01T10:00:00Z' },
    { category: 'Academic', uploadedAt: '2026-10-21T10:00:00Z' },
  ];

  it('counts only documents uploaded after the request', () => {
    expect(countDocumentsForRequest('passport', '2026-10-15T00:00:00Z', docs)).toBe(1);
  });

  it('counts every document uploaded after the request', () => {
    expect(countDocumentsForRequest('transcript', '2026-10-15T00:00:00Z', docs)).toBe(1);
  });

  it('counts nothing when the request is newer than every document', () => {
    expect(countDocumentsForRequest('passport', '2026-11-01T00:00:00Z', docs)).toBe(0);
  });

  it('returns null for a category with no upload counterpart', () => {
    expect(countDocumentsForRequest('photo', '2026-10-01T00:00:00Z', docs)).toBeNull();
    expect(countDocumentsForRequest('other', '2026-10-01T00:00:00Z', docs)).toBeNull();
  });

  it('returns null for an unknown category', () => {
    expect(countDocumentsForRequest('something_else', '2026-10-01T00:00:00Z', docs)).toBeNull();
  });

  it('returns null for an unparseable request date', () => {
    expect(countDocumentsForRequest('passport', 'not-a-date', docs)).toBeNull();
  });

  it('ignores documents with no upload timestamp', () => {
    expect(
      countDocumentsForRequest('passport', '2026-01-01T00:00:00Z', [
        { category: 'Identity', uploadedAt: null },
      ]),
    ).toBe(0);
  });
});
