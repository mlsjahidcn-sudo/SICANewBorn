/**
 * Phase 89: OCR prompt + sanitizer tests.
 *
 * Covers:
 *   - prompt builders emit the right system + user content shape
 *   - passport sanitizer: date validation, gender strict enum,
 *     nationality canonicalization, doc-number uppercase + length cap,
 *     confidence clamping
 *   - transcript sanitizer: year-only date coercion, GPA passthrough,
 *     graduation year plausibility range
 *   - JSON extraction tolerates markdown fences + trailing commas
 */
import { describe, it, expect } from 'vitest';
import {
  buildPassportOcrPrompt,
  buildTranscriptOcrPrompt,
} from '@/lib/ai/ocr-prompt';
import {
  normalizePassportOcrPayload,
  normalizeTranscriptOcrPayload,
  extractJsonObject,
} from '@/lib/ai/ocr-sanitize';

describe('buildPassportOcrPrompt', () => {
  it('returns a system prompt describing the passport schema', () => {
    const { system } = buildPassportOcrPrompt();
    expect(system).toContain('firstName');
    expect(system).toContain('dateOfBirth');
    expect(system).toContain('passportIssueDate');
    expect(system).toContain('passportExpiryDate');
  });

  it('returns a user prompt with a text content part only (image added by route)', () => {
    const { user } = buildPassportOcrPrompt();
    expect(Array.isArray(user)).toBe(true);
    expect(user.length).toBeGreaterThanOrEqual(1);
    const textPart = user[0];
    expect(textPart.type).toBe('text');
    expect(typeof (textPart as { text: string }).text).toBe('string');
  });
});

describe('buildTranscriptOcrPrompt', () => {
  it('returns a system prompt with the 5 transcript fields', () => {
    const { system } = buildTranscriptOcrPrompt();
    expect(system).toContain('highSchoolName');
    expect(system).toContain('highSchoolGPA');
    expect(system).toContain('highSchoolGraduationDate');
  });
});

describe('normalizePassportOcrPayload', () => {
  it('returns all nulls for non-object input', () => {
    const out = normalizePassportOcrPayload(null);
    expect(out.firstName).toBeNull();
    expect(out.confidence).toEqual({});
  });

  it('drops invalid date formats', () => {
    const out = normalizePassportOcrPayload({
      dateOfBirth: '31/12/1990', // wrong format
      passportIssueDate: '2020-01-32', // invalid day
      passportExpiryDate: 'not a date',
    });
    expect(out.dateOfBirth).toBeNull();
    expect(out.passportIssueDate).toBeNull();
    expect(out.passportExpiryDate).toBeNull();
  });

  it('keeps valid ISO dates + clamps implausible years', () => {
    const out = normalizePassportOcrPayload({
      dateOfBirth: '1990-05-15',
      passportExpiryDate: '1850-01-01', // too old
    });
    expect(out.dateOfBirth).toBe('1990-05-15');
    expect(out.passportExpiryDate).toBeNull();
  });

  it('strict enum on gender (Male / Female / Other only)', () => {
    expect(normalizePassportOcrPayload({ gender: 'Male' }).gender).toBe('Male');
    expect(normalizePassportOcrPayload({ gender: 'Female' }).gender).toBe('Female');
    expect(normalizePassportOcrPayload({ gender: 'Other' }).gender).toBe('Other');
    expect(normalizePassportOcrPayload({ gender: 'male' }).gender).toBeNull();
    expect(normalizePassportOcrPayload({ gender: 'X' }).gender).toBeNull();
    expect(normalizePassportOcrPayload({ gender: 42 }).gender).toBeNull();
  });

  it('uppercases + length-caps passportNumber', () => {
    const out = normalizePassportOcrPayload({
      passportNumber: '  ab1234567  ',
    });
    expect(out.passportNumber).toBe('AB1234567');
  });

  it('truncates a passportNumber over the cap', () => {
    const out = normalizePassportOcrPayload({
      passportNumber: 'x'.repeat(80),
    });
    expect(out.passportNumber?.length).toBe(50);
  });

  it('canonicalizes nationality when it matches ALL_COUNTRIES', () => {
    const out = normalizePassportOcrPayload({ nationality: 'united states' });
    expect(out.nationality).toBe('United States');
  });

  it('keeps nationality as raw string when not in ALL_COUNTRIES (admin can correct)', () => {
    const out = normalizePassportOcrPayload({ nationality: 'Atlantis' });
    expect(out.nationality).toBe('Atlantis');
  });

  it('clamps confidence to [0, 1] and defaults to 0 when missing', () => {
    const out = normalizePassportOcrPayload({
      firstName: 'Sara',
      conf: { firstName: 1.5, dateOfBirth: -0.2 },
    });
    expect(out.confidence.firstName).toBe(1);
    expect(out.confidence.dateOfBirth).toBe(0);
    expect(out.confidence.gender).toBe(0);
  });

  it('returns all 8 keys in confidence when model returned a conf object', () => {
    const out = normalizePassportOcrPayload({
      conf: {
        firstName: 0.9,
        lastName: 0.9,
        dateOfBirth: 0.8,
        nationality: 0.9,
        passportNumber: 0.9,
        gender: 0.9,
        passportIssueDate: 0.7,
        passportExpiryDate: 0.7,
      },
    });
    expect(Object.keys(out.confidence).sort()).toEqual(
      [
        'dateOfBirth',
        'firstName',
        'gender',
        'lastName',
        'nationality',
        'passportExpiryDate',
        'passportIssueDate',
        'passportNumber',
      ].sort(),
    );
  });
});

describe('normalizeTranscriptOcrPayload', () => {
  it('returns all nulls for non-object input', () => {
    const out = normalizeTranscriptOcrPayload(undefined);
    expect(out.highSchoolName).toBeNull();
    expect(out.confidence).toEqual({});
  });

  it('coerces year-only dates to YYYY-01-01', () => {
    const out = normalizeTranscriptOcrPayload({ highSchoolGraduationDate: '2024' });
    expect(out.highSchoolGraduationDate).toBe('2024-01-01');
  });

  it('coerces year-month dates to YYYY-MM-01', () => {
    const out = normalizeTranscriptOcrPayload({ highSchoolGraduationDate: '2024-06' });
    expect(out.highSchoolGraduationDate).toBe('2024-06-01');
  });

  it('accepts full ISO date', () => {
    const out = normalizeTranscriptOcrPayload({ highSchoolGraduationDate: '2024-06-15' });
    expect(out.highSchoolGraduationDate).toBe('2024-06-15');
  });

  it('rejects implausible years (before 1950 or too far in future)', () => {
    const out1 = normalizeTranscriptOcrPayload({ highSchoolGraduationDate: '1949' });
    const out2 = normalizeTranscriptOcrPayload({ highSchoolGraduationDate: '2099' });
    expect(out1.highSchoolGraduationDate).toBeNull();
    expect(out2.highSchoolGraduationDate).toBeNull();
  });

  it('keeps GPA as raw string (preserves scale like 3.7/4.0)', () => {
    const out = normalizeTranscriptOcrPayload({ highSchoolGPA: '3.7/4.0' });
    expect(out.highSchoolGPA).toBe('3.7/4.0');
  });

  it('canonicalizes country against ALL_COUNTRIES', () => {
    const out = normalizeTranscriptOcrPayload({ highSchoolCountry: 'china' });
    expect(out.highSchoolCountry).toBe('China');
  });

  it('clamps GPA length', () => {
    const out = normalizeTranscriptOcrPayload({
      highSchoolGPA: 'g'.repeat(50),
    });
    expect(out.highSchoolGPA?.length).toBe(30);
  });
});

describe('extractJsonObject', () => {
  it('strips markdown fences', () => {
    expect(extractJsonObject('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('strips leading preamble + keeps trailing JSON', () => {
    expect(extractJsonObject('Sure, here it is: {"a":1}')).toBe('{"a":1}');
  });

  it('repairs trailing commas', () => {
    expect(extractJsonObject('{"a":1, "b":2,}')).toBe('{"a":1, "b":2}');
  });

  it('returns null when no JSON object is present', () => {
    expect(extractJsonObject('No JSON here, sorry')).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(extractJsonObject('')).toBeNull();
    expect(extractJsonObject('   ')).toBeNull();
  });
});