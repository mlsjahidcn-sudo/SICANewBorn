/**
 * Phase 89 / edit-OCR: OCR prompt + sanitizer tests.
 *
 * Covers:
 *   - prompt builders emit the right system + user content shape
 *   - passport sanitizer: date validation, gender strict enum,
 *     nationality canonicalization, doc-number uppercase + length cap,
 *     confidence clamping
 *   - transcript sanitizer (high_school / bachelor / master): year-only
 *     date coercion, GPA passthrough, graduation year plausibility,
 *     level-scoped fields (others stay null)
 *   - resume sanitizer: null-on-missing, partnerInfo trim, phone/address
 *     caps, email @-gate, nationality canonicalization
 *   - JSON extraction tolerates markdown fences + trailing commas
 */
import { describe, it, expect } from 'vitest';
import {
  buildPassportOcrPrompt,
  buildTranscriptOcrPrompt,
  buildResumeOcrPrompt,
} from '@/lib/ai/ocr-prompt';
import {
  normalizePassportOcrPayload,
  normalizeTranscriptOcrPayload,
  normalizeResumeOcrPayload,
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
  it('defaults to high_school schema with the 5 high-school fields', () => {
    const { system } = buildTranscriptOcrPrompt();
    expect(system).toContain('highSchoolName');
    expect(system).toContain('highSchoolGPA');
    expect(system).toContain('highSchoolGraduationDate');
  });

  it('emits bachelor schema when level=bachelor', () => {
    const { system } = buildTranscriptOcrPrompt('bachelor');
    expect(system).toContain('bachelorUniversityName');
    expect(system).toContain('bachelorMajor');
    expect(system).toContain('bachelorGPA');
    expect(system).toContain('bachelorGraduationDate');
    expect(system).not.toContain('highSchoolName');
  });

  it('emits master schema when level=master', () => {
    const { system } = buildTranscriptOcrPrompt('master');
    expect(system).toContain('masterUniversityName');
    expect(system).toContain('masterMajor');
    expect(system).toContain('masterGPA');
    expect(system).toContain('masterGraduationDate');
    expect(system).not.toContain('bachelorUniversityName');
  });
});

describe('buildResumeOcrPrompt', () => {
  it('returns a system prompt describing contact + partnerInfo', () => {
    const { system } = buildResumeOcrPrompt();
    expect(system).toContain('partnerInfo');
    expect(system).toContain('phone');
    expect(system).toContain('address');
    expect(system).toContain('whatsapp');
  });

  it('returns a user prompt with a text content part only', () => {
    const { user } = buildResumeOcrPrompt();
    expect(Array.isArray(user)).toBe(true);
    expect(user[0]?.type).toBe('text');
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

  it('populates bachelor fields only when level=bachelor', () => {
    const out = normalizeTranscriptOcrPayload(
      {
        bachelorUniversityName: ' Peking University ',
        bachelorMajor: 'Computer Science',
        bachelorGPA: '3.6/4.0',
        bachelorGraduationDate: '2022',
        highSchoolName: 'should-be-ignored',
      },
      'bachelor',
    );
    expect(out.bachelorUniversityName).toBe('Peking University');
    expect(out.bachelorMajor).toBe('Computer Science');
    expect(out.bachelorGPA).toBe('3.6/4.0');
    expect(out.bachelorGraduationDate).toBe('2022-01-01');
    expect(out.highSchoolName).toBeNull();
    expect(out.masterUniversityName).toBeNull();
  });

  it('populates master fields only when level=master', () => {
    const out = normalizeTranscriptOcrPayload(
      {
        masterUniversityName: 'Tsinghua University',
        masterMajor: 'AI',
        masterGPA: '3.9',
        masterGraduationDate: '2024-06',
        bachelorUniversityName: 'should-be-ignored',
      },
      'master',
    );
    expect(out.masterUniversityName).toBe('Tsinghua University');
    expect(out.masterMajor).toBe('AI');
    expect(out.masterGPA).toBe('3.9');
    expect(out.masterGraduationDate).toBe('2024-06-01');
    expect(out.bachelorUniversityName).toBeNull();
    expect(out.highSchoolName).toBeNull();
  });

  it('returns all-null leveled fields for non-object input at bachelor/master', () => {
    const b = normalizeTranscriptOcrPayload(null, 'bachelor');
    const m = normalizeTranscriptOcrPayload(undefined, 'master');
    expect(b.bachelorUniversityName).toBeNull();
    expect(b.confidence).toEqual({});
    expect(m.masterUniversityName).toBeNull();
    expect(m.confidence).toEqual({});
  });
});

describe('normalizeResumeOcrPayload', () => {
  it('returns all nulls for non-object input', () => {
    const out = normalizeResumeOcrPayload(null);
    expect(out.firstName).toBeNull();
    expect(out.partnerInfo).toBeNull();
    expect(out.confidence).toEqual({});
  });

  it('trims + caps partnerInfo / phone / address', () => {
    const out = normalizeResumeOcrPayload({
      partnerInfo: '  Parent: Ada · Phone: +1  · Address: X  ',
      phone: '  +86 138 0000 0000  ',
      address: 'a'.repeat(600),
    });
    expect(out.partnerInfo).toBe('Parent: Ada · Phone: +1  · Address: X');
    expect(out.phone).toBe('+86 138 0000 0000');
    expect(out.address?.length).toBe(500);
  });

  it('nulls email without @ and keeps valid emails', () => {
    expect(normalizeResumeOcrPayload({ email: 'not-an-email' }).email).toBeNull();
    expect(normalizeResumeOcrPayload({ email: '  ada@example.com ' }).email).toBe(
      'ada@example.com',
    );
  });

  it('maps contact fields when present and leaves missing as null', () => {
    const out = normalizeResumeOcrPayload({
      firstName: 'Ada',
      phone: '+123',
      whatsapp: '+456',
      city: 'Lagos',
    });
    expect(out.firstName).toBe('Ada');
    expect(out.lastName).toBeNull();
    expect(out.phone).toBe('+123');
    expect(out.whatsapp).toBe('+456');
    expect(out.address).toBeNull();
    expect(out.partnerInfo).toBeNull();
    expect(out.city).toBe('Lagos');
  });

  it('canonicalizes country against ALL_COUNTRIES', () => {
    const out = normalizeResumeOcrPayload({ country: 'nigeria' });
    expect(out.country).toBe('Nigeria');
  });

  it('clamps confidence to [0, 1] for resume keys', () => {
    const out = normalizeResumeOcrPayload({
      firstName: 'Ada',
      conf: { firstName: 2, phone: -1 },
    });
    expect(out.confidence.firstName).toBe(1);
    expect(out.confidence.phone).toBe(0);
    expect(out.confidence.partnerInfo).toBe(0);
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