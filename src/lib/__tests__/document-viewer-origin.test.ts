import { describe, it, expect } from 'vitest';
import {
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_ZOOM,
  ZOOM_STEP,
  classifyFile,
  clampZoom,
  encodeOrigin,
  formatFileSize,
  isUuid,
  originHref,
  originQuery,
  parseOrigin,
} from '@/lib/document-viewer-origin';

const UUID = 'a1b2c3d4-1111-2222-3333-444455556666';
const UUID_UPPER = 'A1B2C3D4-1111-2222-3333-444455556666';

describe('isUuid', () => {
  it('accepts a canonical uuid', () => {
    expect(isUuid(UUID)).toBe(true);
  });

  it('accepts uppercase hex', () => {
    expect(isUuid(UUID_UPPER)).toBe(true);
  });

  it('rejects malformed values', () => {
    expect(isUuid('')).toBe(false);
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid('a1b2c3d4-1111-2222-3333-44445555666')).toBe(false);
    expect(isUuid('a1b2c3d4-1111-2222-3333-4444555566667')).toBe(false);
    expect(isUuid(`${UUID} OR 1=1`)).toBe(false);
  });
});

describe('encodeOrigin / parseOrigin', () => {
  it('round-trips a student origin', () => {
    const origin = { kind: 'student', id: UUID } as const;
    expect(encodeOrigin(origin)).toBe(`student:${UUID}`);
    expect(parseOrigin(`student:${UUID}`)).toEqual(origin);
  });

  it('round-trips a partner origin', () => {
    const origin = { kind: 'partner', id: UUID } as const;
    expect(parseOrigin(encodeOrigin(origin))).toEqual(origin);
  });

  it('round-trips an application origin', () => {
    const origin = { kind: 'application', id: UUID } as const;
    expect(parseOrigin(encodeOrigin(origin))).toEqual(origin);
  });

  it('round-trips the queue origin (no id)', () => {
    const origin = { kind: 'queue', id: null } as const;
    expect(encodeOrigin(origin)).toBe('queue');
    expect(parseOrigin('queue')).toEqual(origin);
  });

  it('returns null for empty / missing input', () => {
    expect(parseOrigin(null)).toBeNull();
    expect(parseOrigin(undefined)).toBeNull();
    expect(parseOrigin('')).toBeNull();
    expect(parseOrigin('   ')).toBeNull();
  });

  it('returns null for an unknown kind', () => {
    expect(parseOrigin('teacher:abc')).toBeNull();
    expect(parseOrigin('queue:whatever')).toEqual({ kind: 'queue', id: null });
  });

  it('returns null when the id is not a uuid', () => {
    expect(parseOrigin('student:not-a-uuid')).toBeNull();
    expect(parseOrigin('student:')).toBeNull();
    expect(parseOrigin(`student:${UUID}/../../admin`)).toBeNull();
  });

  it('returns null for a param with no separator', () => {
    expect(parseOrigin('student')).toBeNull();
    expect(parseOrigin(':123')).toBeNull();
  });

  it('does not accept a path-traversal payload', () => {
    expect(parseOrigin(`partner:${UUID}`)).not.toBeNull();
    expect(parseOrigin(`partner:../../etc/passwd`)).toBeNull();
  });
});

describe('originHref', () => {
  it('restores the documents tab of a student', () => {
    expect(originHref({ kind: 'student', id: UUID })).toBe(
      `/admin/students/${UUID}?tab=documents`,
    );
  });

  it('restores the documents tab of a partner student', () => {
    expect(originHref({ kind: 'partner', id: UUID })).toBe(
      `/admin/partner-students/${UUID}?tab=documents`,
    );
  });

  it('restores the documents tab of an application', () => {
    expect(originHref({ kind: 'application', id: UUID })).toBe(
      `/admin/applications/${UUID}?tab=documents`,
    );
  });

  it('sends the queue origin to the review queue', () => {
    expect(originHref({ kind: 'queue', id: null })).toBe('/admin/documents');
  });

  it('falls back to the review queue for a null origin', () => {
    expect(originHref(null)).toBe('/admin/documents');
  });

  it('falls back to the review queue when an id is missing', () => {
    expect(originHref({ kind: 'student', id: null })).toBe('/admin/documents');
  });
});

describe('originQuery', () => {
  it('builds a query string for a student origin', () => {
    expect(originQuery({ kind: 'student', id: UUID })).toBe(
      `?from=${encodeURIComponent(`student:${UUID}`)}`,
    );
  });

  it('builds a query string for the queue origin', () => {
    expect(originQuery({ kind: 'queue', id: null })).toBe('?from=queue');
  });

  it('returns an empty string for a null origin', () => {
    expect(originQuery(null)).toBe('');
  });
});

describe('classifyFile', () => {
  it('classifies pdf by mime type', () => {
    expect(classifyFile('application/pdf', 'anything.bin')).toBe('pdf');
  });

  it('classifies pdf by extension when the mime is missing', () => {
    expect(classifyFile(null, 'transcript.PDF')).toBe('pdf');
    expect(classifyFile('', 'transcript.pdf')).toBe('pdf');
  });

  it('classifies images by mime type', () => {
    expect(classifyFile('image/png', 'x')).toBe('image');
    expect(classifyFile('image/jpeg', 'x')).toBe('image');
    expect(classifyFile('image/webp', 'x')).toBe('image');
  });

  it('classifies images by extension when the mime is missing', () => {
    expect(classifyFile(null, 'passport.JPG')).toBe('image');
    expect(classifyFile(undefined, 'passport.jpeg')).toBe('image');
    expect(classifyFile(undefined, 'passport.webp')).toBe('image');
  });

  it('classifies word documents', () => {
    expect(classifyFile('application/msword', 'a.doc')).toBe('office');
    expect(
      classifyFile(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'a.docx',
      ),
    ).toBe('office');
    expect(classifyFile(null, 'a.docx')).toBe('office');
  });

  it('returns unknown for anything else', () => {
    expect(classifyFile('application/zip', 'a.zip')).toBe('unknown');
    expect(classifyFile(null, null)).toBe('unknown');
    expect(classifyFile('', '')).toBe('unknown');
  });

  it('prefers the mime type over a misleading extension', () => {
    // A .pdf name with an image mime is still an image.
    expect(classifyFile('image/png', 'scan.pdf')).toBe('image');
  });
});

describe('clampZoom', () => {
  it('keeps a zoom inside the range', () => {
    expect(clampZoom(1)).toBe(1);
    expect(clampZoom(2.5)).toBe(2.5);
  });

  it('clamps below the minimum', () => {
    expect(clampZoom(0.1)).toBe(MIN_ZOOM);
    expect(clampZoom(0)).toBe(MIN_ZOOM);
    expect(clampZoom(-3)).toBe(MIN_ZOOM);
  });

  it('clamps above the maximum', () => {
    expect(clampZoom(10)).toBe(MAX_ZOOM);
    expect(clampZoom(1000)).toBe(MAX_ZOOM);
  });

  it('falls back to 100% for non-finite input', () => {
    expect(clampZoom(NaN)).toBe(DEFAULT_ZOOM);
    expect(clampZoom(Infinity)).toBe(DEFAULT_ZOOM);
    expect(clampZoom(-Infinity)).toBe(DEFAULT_ZOOM);
  });

  it('rounds to two decimals', () => {
    expect(clampZoom(1.23456)).toBe(1.23);
  });

  it('has a step that stays inside the range from the defaults', () => {
    expect(clampZoom(DEFAULT_ZOOM + ZOOM_STEP)).toBe(1.25);
    expect(clampZoom(DEFAULT_ZOOM - ZOOM_STEP)).toBe(0.75);
  });
});

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(512)).toBe('512 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(2048)).toBe('2 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(5 * 1024 * 1024)).toBe('5.0 MB');
  });

  it('returns an em dash for unknown sizes', () => {
    expect(formatFileSize(null)).toBe('—');
    expect(formatFileSize(undefined)).toBe('—');
    expect(formatFileSize(-1)).toBe('—');
    expect(formatFileSize(NaN)).toBe('—');
  });
});
