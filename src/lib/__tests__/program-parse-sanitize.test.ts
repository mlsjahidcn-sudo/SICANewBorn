import { describe, it, expect } from 'vitest';
import {
  extractProgramsJson,
  normalizeProgramRows,
  MAX_PARSED_PROGRAMS,
} from '@/lib/ai/program-parse-sanitize';

describe('extractProgramsJson', () => {
  it('parses a bare JSON array', () => {
    const raw = '[{"name":"MBA","degree":"Master"}]';
    expect(extractProgramsJson(raw)).toEqual([{ name: 'MBA', degree: 'Master' }]);
  });

  it('strips markdown code fences', () => {
    const raw = '```json\n[{"name":"MBA","degree":"Master"}]\n```';
    expect(extractProgramsJson(raw)).toEqual([{ name: 'MBA', degree: 'Master' }]);
  });

  it('strips prose before and after the array', () => {
    const raw = 'Here are the programs I found:\n[{"name":"MBA","degree":"Master"}]\nHope this helps!';
    expect(extractProgramsJson(raw)).toEqual([{ name: 'MBA', degree: 'Master' }]);
  });

  it('repairs trailing commas', () => {
    const raw = '[{"name":"MBA","degree":"Master",},{"name":"BSc Nursing","degree":"Bachelor",},]';
    const out = extractProgramsJson(raw);
    expect(out).toHaveLength(2);
    expect(out?.[1]).toEqual({ name: 'BSc Nursing', degree: 'Bachelor' });
  });

  it('returns null when there is no array', () => {
    expect(extractProgramsJson('{"name":"MBA"}')).toBeNull();
    expect(extractProgramsJson('no json at all')).toBeNull();
    expect(extractProgramsJson('')).toBeNull();
  });

  it('returns null when the array is unclosed', () => {
    expect(extractProgramsJson('[{"name":"MBA"}')).toBeNull();
  });

  it('returns null when JSON.parse fails after slicing', () => {
    expect(extractProgramsJson('[{name: MBA}]')).toBeNull();
  });

  it('returns null for a top-level non-array', () => {
    // "[5]" parses but isn't an array of objects — still an array,
    // so it passes extraction; normalization drops non-object rows.
    const out = extractProgramsJson('["just a string"]');
    expect(out).toEqual(['just a string']);
    const { programs } = normalizeProgramRows(out ?? []);
    expect(programs).toHaveLength(0);
  });
});

describe('normalizeProgramRows', () => {
  it('maps a well-formed row straight through', () => {
    const { programs, warnings } = normalizeProgramRows([
      {
        name: 'Computer Science and Technology',
        nameCn: '计算机科学与技术',
        degree: 'Bachelor',
        discipline: 'Computer Science',
        disciplineCn: '计算机科学',
        language: 'English',
        duration: '4 years',
        durationCn: '4年',
        tuition: '¥30,000/year',
        intake: 'September',
        intakeCn: '9月',
        scholarshipAvailable: false,
      },
    ]);
    expect(programs).toHaveLength(1);
    expect(programs[0]).toMatchObject({
      name: 'Computer Science and Technology',
      degree: 'Bachelor',
      language: 'English',
      tuition: '¥30,000/year',
    });
    expect(warnings).toHaveLength(0);
  });

  it('defaults unknown degrees to Bachelor with a warning', () => {
    const { programs, warnings } = normalizeProgramRows([
      { name: 'Diploma in Nursing', degree: 'diploma', discipline: 'Nursing' },
    ]);
    expect(programs[0].degree).toBe('Bachelor');
    expect(warnings.some((w) => w.includes('unrecognized degree'))).toBe(true);
  });

  it('accepts degree aliases including Chinese', () => {
    const { programs, warnings } = normalizeProgramRows([
      { name: 'MBA', degree: '硕士', discipline: 'Business' },
      { name: 'Mechanical Engineering', degree: 'PhD Program', discipline: 'Engineering' },
      { name: 'Civil Engineering', degree: 'Undergraduate', discipline: 'Engineering' },
    ]);
    expect(programs.map((p) => p.degree)).toEqual(['Master', 'PhD', 'Bachelor']);
    expect(warnings).toHaveLength(0);
  });

  it('defaults a missing degree with a warning', () => {
    const { programs, warnings } = normalizeProgramRows([
      { name: 'Business Administration', discipline: 'Business' },
    ]);
    expect(programs[0].degree).toBe('Bachelor');
    expect(warnings.some((w) => w.includes('no degree given'))).toBe(true);
  });

  it('treats blank language as English silently, unknown language as a warning', () => {
    const blank = normalizeProgramRows([
      { name: 'MBA', degree: 'Master', discipline: 'Business', language: '' },
    ]);
    expect(blank.programs[0].language).toBe('English');
    expect(blank.warnings).toHaveLength(0);

    const odd = normalizeProgramRows([
      { name: 'MBA', degree: 'Master', discipline: 'Business', language: 'French' },
    ]);
    expect(odd.programs[0].language).toBe('English');
    expect(odd.warnings.some((w) => w.includes('unrecognized language'))).toBe(true);
  });

  it('maps 中文 language and boolean strings', () => {
    const { programs } = normalizeProgramRows([
      { name: 'TCM', degree: 'Bachelor', discipline: 'Medicine', language: '中文', scholarshipAvailable: 'true' },
      { name: 'Law', degree: 'Bachelor', discipline: 'Law', language: 'Bilingual', scholarshipAvailable: 'yes' },
    ]);
    expect(programs[0].language).toBe('Chinese');
    expect(programs[0].scholarshipAvailable).toBe(true);
    expect(programs[1].scholarshipAvailable).toBe(true);
  });

  it('falls back to the program name when discipline is missing', () => {
    const { programs, warnings } = normalizeProgramRows([
      { name: 'MBA', degree: 'Master' },
    ]);
    expect(programs[0].discipline).toBe('MBA');
    expect(warnings.some((w) => w.includes('no discipline given'))).toBe(true);
  });

  it('drops rows without a name and non-object entries', () => {
    const { programs, warnings } = normalizeProgramRows([
      null,
      'a string',
      { degree: 'Master' },
      { name: 'MBA', degree: 'Master', discipline: 'Business' },
    ]);
    expect(programs).toHaveLength(1);
    expect(warnings.some((w) => w.includes('no program name'))).toBe(true);
  });

  it('dedupes by lowercase name + degree', () => {
    const { programs, warnings } = normalizeProgramRows([
      { name: 'MBA', degree: 'Master', discipline: 'Business' },
      { name: 'mba', degree: 'Master', discipline: 'Business' },
      { name: 'MBA', degree: 'PhD', discipline: 'Business' },
    ]);
    expect(programs).toHaveLength(2);
    expect(warnings.some((w) => w.includes('duplicate'))).toBe(true);
  });

  it('truncates over-long fields to the DB column caps', () => {
    const longName = 'X'.repeat(400);
    const { programs } = normalizeProgramRows([
      { name: longName, degree: 'Master', discipline: 'Business', tuition: '¥'.repeat(200) },
    ]);
    expect(programs[0].name).toHaveLength(255);
    expect(programs[0].tuition).toHaveLength(100);
  });

  it(`caps the batch at ${MAX_PARSED_PROGRAMS} rows with a warning`, () => {
    const rows = Array.from({ length: MAX_PARSED_PROGRAMS + 10 }, (_, i) => ({
      name: `Program ${i}`,
      degree: 'Master',
      discipline: 'Business',
    }));
    const { programs, warnings } = normalizeProgramRows(rows);
    expect(programs).toHaveLength(MAX_PARSED_PROGRAMS);
    expect(warnings.some((w) => w.includes('Capped at'))).toBe(true);
  });

  it('trims whitespace on every string field', () => {
    const { programs } = normalizeProgramRows([
      {
        name: '  MBA  ',
        nameCn: ' 工商管理硕士 ',
        degree: ' Master ',
        discipline: ' Business ',
        tuition: ' ¥30,000/year ',
      },
    ]);
    expect(programs[0].name).toBe('MBA');
    expect(programs[0].nameCn).toBe('工商管理硕士');
    expect(programs[0].degree).toBe('Master');
    expect(programs[0].discipline).toBe('Business');
    expect(programs[0].tuition).toBe('¥30,000/year');
  });
});
