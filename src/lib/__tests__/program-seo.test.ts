import { describe, expect, it } from 'vitest';
import {
  buildProgramDocumentTitle,
  buildProgramHeading,
  buildProgramMetaDescription,
  teachingLanguageLabel,
} from '@/lib/program-seo';

const PLACEHOLDER = /\b(undefined|null|to be confirmed)\b/i;

describe('programme document titles', () => {
  it('keeps an English-taught title within 60 characters with the university and one SICA', () => {
    const title = buildProgramDocumentTitle({
      major: 'Computer Science',
      degree: 'Bachelor',
      language: 'English',
      university: 'Tsinghua University',
    });
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toContain('English-taught');
    expect(title).toMatch(/Tsinghua/);
    expect(title.match(/SICA/g)).toEqual(['SICA']);
    expect(title.endsWith('| SICA')).toBe(true);
  });

  it('keeps a Chinese-taught title and never drops the language to fit', () => {
    const title = buildProgramDocumentTitle({
      major: 'Clinical Medicine',
      degree: 'Bachelor',
      language: 'Chinese',
      university: 'Peking University',
    });
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toContain('Chinese-taught');
    expect(title).toMatch(/Peking/);
    expect(title.match(/SICA/g)).toEqual(['SICA']);
  });

  it('shortens the university before the major', () => {
    const title = buildProgramDocumentTitle({
      major: 'Nursing',
      degree: 'Bachelor',
      language: 'Chinese',
      university: 'Southwestern University of Finance and Economics',
    });
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title.startsWith('Nursing (')).toBe(true);
    expect(title).toContain('Chinese-taught');
    expect(title).not.toContain('University');
  });

  it('keeps the language on a very long major', () => {
    const title = buildProgramDocumentTitle({
      major: 'The Category of Electronic Information (Including Information Engineering, Telecommunication Engineering, and Electronic Information Engineering)',
      degree: 'Bachelor',
      language: 'Chinese',
      university: 'Guangdong University of Technology',
    });
    expect(title.length).toBeLessThanOrEqual(60);
    expect(title).toContain('Chinese-taught');
    expect(title).not.toMatch(PLACEHOLDER);
    expect(title.match(/SICA/g)).toEqual(['SICA']);
  });

  it('omits empty fields instead of printing placeholders', () => {
    const title = buildProgramDocumentTitle({
      major: 'Law',
      degree: 'To be confirmed',
      language: 'undefined',
      university: 'null',
    });
    expect(title).toBe('Law | SICA');
    expect(title).not.toMatch(PLACEHOLDER);
  });
});

describe('programme meta descriptions', () => {
  it('uses the English-taught sentence and stays within 155 characters', () => {
    const description = buildProgramMetaDescription({
      major: 'Computer Science',
      degree: 'Bachelor',
      language: 'English',
      university: 'Tsinghua University',
      city: 'Beijing',
    });
    expect(description.length).toBeLessThanOrEqual(155);
    expect(description.length).toBeGreaterThanOrEqual(140);
    expect(description).toContain('in English');
    expect(description).toContain('Entry requirements, intake and how SICA helps you apply.');
    expect(description).toContain('Book a free 10-minute check.');
    expect(description).not.toMatch(PLACEHOLDER);
  });

  it('uses the Chinese-taught HSK sentence', () => {
    const description = buildProgramMetaDescription({
      major: 'Clinical Medicine',
      degree: 'Bachelor',
      language: 'Chinese',
      university: 'Peking University',
      city: 'Beijing',
    });
    expect(description.length).toBeLessThanOrEqual(155);
    expect(description.length).toBeGreaterThanOrEqual(140);
    expect(description).toContain('in Chinese');
    expect(description).toContain('HSK requirement, intake and how SICA helps you apply.');
  });

  it('keeps a whole university word instead of a mid-word fragment', () => {
    const agronomy = buildProgramMetaDescription({
      major: 'Agronomy and Seed Industry',
      degree: 'Master',
      language: 'English',
      university: 'Guizhou University',
      city: 'Guiyang',
    });
    const vehicle = buildProgramMetaDescription({
      major: 'Vehicle Operation Engineering',
      degree: 'PhD',
      language: 'Chinese',
      university: 'Beijing Jiaotong University',
      city: 'Beijing',
    });
    expect(agronomy.length).toBeLessThanOrEqual(155);
    expect(vehicle.length).toBeLessThanOrEqual(155);
    expect(agronomy).not.toMatch(/\bat Gui,/);
    expect(vehicle).not.toMatch(/\bBeijin\b/);
    expect(agronomy).toMatch(/Guizhou|Guiyang/);
    expect(vehicle).toContain('Beijing');
    const power = buildProgramMetaDescription({
      major: 'Power Engineering and Engineering Thermophysics',
      degree: 'Master',
      language: 'English',
      university: 'Tianjin University',
      city: 'Tianjin',
    });
    expect(power).not.toMatch(/Engineering and \(/);
    expect(power.length).toBeLessThanOrEqual(155);
  });

  it('leaves out an empty city', () => {
    const description = buildProgramMetaDescription({
      major: 'Nursing',
      degree: 'Master',
      language: 'English',
      university: 'Fudan University',
      city: '',
    });
    expect(description).toContain('at Fudan University.');
    expect(description).not.toContain('undefined');
    expect(description.length).toBeLessThanOrEqual(155);
  });

  it('does not print placeholders when the record is sparse', () => {
    const description = buildProgramMetaDescription({
      major: 'null',
      degree: '',
      language: 'To be confirmed',
      university: 'undefined',
      city: 'n/a',
    });
    expect(description).not.toMatch(PLACEHOLDER);
    expect(description.length).toBeLessThanOrEqual(155);
    expect(description.startsWith('Study this program.')).toBe(true);
  });
});

describe('programme heading and language label', () => {
  it('builds a unique H1 and a teaching-language label', () => {
    expect(buildProgramHeading({
      major: 'Computer Science',
      degree: 'Bachelor',
      university: 'Tsinghua University',
    })).toBe('Computer Science – Bachelor at Tsinghua University');
    expect(teachingLanguageLabel('English')).toBe('English-taught');
    expect(teachingLanguageLabel('Chinese')).toBe('Chinese-taught');
    expect(teachingLanguageLabel('To be confirmed')).toBe('');
  });

  it('omits an empty university from the heading', () => {
    expect(buildProgramHeading({ major: 'Law', degree: 'Master', university: '' })).toBe('Law – Master');
  });
});
