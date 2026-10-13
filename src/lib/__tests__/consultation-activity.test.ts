/**
 * consultation-activity.test.ts
 *
 * Phase 160: vitest coverage for the pickConsultationShotInput
 * whitelist validator. Both the admin POST + PATCH routes lean on
 * this helper — a regression here would either let bad rows into
 * the DB (whitelist too loose) or block every save (whitelist too
 * strict). These cases pin the contract.
 */

import { describe, it, expect } from 'vitest';
import { pickConsultationShotInput } from '../consultation-activity';

const VALID = {
  image_url: 'consultation/abc-123/shot.jpg',
  caption_en: 'A consultation call in progress',
  caption_zh: '一通进行中的咨询通话',
  person_name: 'Carlos De Avila Bravo',
  initials: 'CD',
  shot_date: '2026-10-13',
  is_active: true,
  display_order: 1,
};

describe('pickConsultationShotInput — valid payloads', () => {
  it('accepts a complete valid payload', () => {
    const out = pickConsultationShotInput(VALID);
    expect(out).not.toBeNull();
    expect(out?.image_url).toBe('consultation/abc-123/shot.jpg');
    expect(out?.caption_en).toBe('A consultation call in progress');
    expect(out?.caption_zh).toBe('一通进行中的咨询通话');
    expect(out?.person_name).toBe('Carlos De Avila Bravo');
    expect(out?.initials).toBe('CD');
    expect(out?.shot_date).toBe('2026-10-13');
    expect(out?.is_active).toBe(true);
    expect(out?.display_order).toBe(1);
  });

  it('accepts null shot_date (optional field)', () => {
    const out = pickConsultationShotInput({ ...VALID, shot_date: null });
    expect(out).not.toBeNull();
    expect(out?.shot_date).toBeNull();
  });

  it('accepts empty-string shot_date as null', () => {
    const out = pickConsultationShotInput({ ...VALID, shot_date: '' });
    expect(out).not.toBeNull();
    expect(out?.shot_date).toBeNull();
  });

  it('accepts string booleans for is_active (form-encoded edge case)', () => {
    const out = pickConsultationShotInput({ ...VALID, is_active: 'false' });
    expect(out).not.toBeNull();
    expect(out?.is_active).toBe(false);
  });

  it('accepts string display_order and coerces to int', () => {
    const out = pickConsultationShotInput({ ...VALID, display_order: '3' });
    expect(out).not.toBeNull();
    expect(out?.display_order).toBe(3);
  });
});

describe('pickConsultationShotInput — rejects invalid payloads', () => {
  it('rejects null / undefined / non-object body', () => {
    expect(pickConsultationShotInput(null)).toBeNull();
    expect(pickConsultationShotInput(undefined)).toBeNull();
    expect(pickConsultationShotInput('string')).toBeNull();
  });

  it('rejects image_url outside the consultation/ prefix', () => {
    // Defense-in-depth: the path-prefix check prevents admin-ui bugs
    // from writing rows that reference other buckets / arbitrary paths.
    expect(pickConsultationShotInput({ ...VALID, image_url: 'student/abc/file.jpg' })).toBeNull();
    expect(pickConsultationShotInput({ ...VALID, image_url: '/absolute/path.jpg' })).toBeNull();
    expect(pickConsultationShotInput({ ...VALID, image_url: 'consultation' })).toBeNull();
  });

  it('rejects missing image_url', () => {
    const { image_url: _drop, ...rest } = VALID;
    void _drop;
    expect(pickConsultationShotInput(rest)).toBeNull();
  });

  it('rejects empty or missing caption_en', () => {
    expect(pickConsultationShotInput({ ...VALID, caption_en: '' })).toBeNull();
    expect(pickConsultationShotInput({ ...VALID, caption_en: '   ' })).toBeNull();
  });

  it('rejects empty or missing caption_zh', () => {
    expect(pickConsultationShotInput({ ...VALID, caption_zh: '' })).toBeNull();
  });

  it('rejects missing person_name', () => {
    expect(pickConsultationShotInput({ ...VALID, person_name: '' })).toBeNull();
  });

  it('rejects initials longer than 8 chars', () => {
    expect(pickConsultationShotInput({ ...VALID, initials: 'TOOLONGINITIALS' })).toBeNull();
  });

  it('rejects empty initials', () => {
    expect(pickConsultationShotInput({ ...VALID, initials: '' })).toBeNull();
  });

  it('rejects invalid shot_date format', () => {
    // 'not-a-date' fails the YYYY-MM-DD regex and is dropped from the
    // output (shot_date key absent) — but the validator still returns
    // the rest of the valid payload, so it's NOT null. The contract
    // we pin here: an unparseable date doesn't poison the whole save;
    // it just drops the date field. The API layer treats a missing
    // shot_date as null (optional field).
    const out = pickConsultationShotInput({ ...VALID, shot_date: 'not-a-date' });
    expect(out).not.toBeNull();
    expect(out).not.toHaveProperty('shot_date');
    // '13/10/2026' also fails the regex → also dropped.
    const out2 = pickConsultationShotInput({ ...VALID, shot_date: '13/10/2026' });
    expect(out2).not.toBeNull();
    expect(out2).not.toHaveProperty('shot_date');
  });

  it('rejects missing is_active', () => {
    const { is_active: _drop, ...rest } = VALID;
    void _drop;
    expect(pickConsultationShotInput(rest)).toBeNull();
  });

  it('rejects invalid is_active type', () => {
    expect(pickConsultationShotInput({ ...VALID, is_active: 'yes' })).toBeNull();
    expect(pickConsultationShotInput({ ...VALID, is_active: 1 })).toBeNull();
  });

  it('rejects non-numeric display_order', () => {
    expect(pickConsultationShotInput({ ...VALID, display_order: 'abc' })).toBeNull();
  });

  it('rejects missing display_order', () => {
    const { display_order: _drop, ...rest } = VALID;
    void _drop;
    expect(pickConsultationShotInput(rest)).toBeNull();
  });

  it('rejects Infinity display_order', () => {
    expect(pickConsultationShotInput({ ...VALID, display_order: Infinity })).toBeNull();
  });
});
