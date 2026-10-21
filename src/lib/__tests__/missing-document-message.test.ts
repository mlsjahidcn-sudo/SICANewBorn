import { describe, expect, it } from 'vitest';
import { buildDocumentDraftLinks, buildMissingDocumentMessage } from '../missing-document-message';

describe('missing document messages', () => {
  it('names the student, application and exact documents, including custom instructions', () => {
    const message = buildMissingDocumentMessage({
      studentName: 'Amina Khan', recipient: 'student', language: 'en',
      applicationNumber: 'SICA-123', university: 'Zhejiang University', program: 'Computer Science',
      documents: ['Passport photo page', 'Academic transcripts'], note: 'Please send these by Friday.',
    });
    expect(message).toContain('Hi Amina Khan,');
    expect(message).toContain('Application: SICA-123 · Zhejiang University · Computer Science');
    expect(message).toContain('1. Passport photo page\n2. Academic transcripts');
    expect(message).toContain('Please send these by Friday.');
    expect(message).toContain('student portal');
    expect(message).not.toContain('undefined');
  });

  it('asks the agency to collect documents for the named student', () => {
    const message = buildMissingDocumentMessage({
      studentName: 'Amina', partnerName: 'Global Education', recipient: 'partner', language: 'en', documents: ['Passport'],
    });
    expect(message).toContain('Hello Global Education,');
    expect(message).toContain("Amina's SICA application");
    expect(message).toContain('partner portal');
    expect(message).not.toContain('your SICA application');
  });

  it('does not ask offline applicants to log in to an account they may not have', () => {
    expect(buildMissingDocumentMessage({
      studentName: 'Amina', recipient: 'student', language: 'en', studentHasPortal: false, documents: ['Passport'],
    })).not.toContain('portal');
  });

  it('supports Chinese requests and removes empty or duplicate document names', () => {
    const message = buildMissingDocumentMessage({
      studentName: '张三', recipient: 'student', language: 'zh', documents: [' 护照 ', '', '护照', '成绩单'],
    });
    expect(message).toContain('张三 您好');
    expect(message).toContain('1. 护照\n2. 成绩单');
    expect(message).not.toContain('3.');
  });

  it('requires at least one missing document', () => {
    expect(buildMissingDocumentMessage({ studentName: 'Amina', recipient: 'student', language: 'en', documents: [' '] })).toBe('');
  });
});

describe('document message draft links', () => {
  it('preserves message punctuation, Unicode and line breaks in drafts', () => {
    const message = 'Hi Amina,\n1. 护照 & transcript?\nThank you!';
    const links = buildDocumentDraftLinks(message, 'amina@example.com', '+880 (171) 234-5678');
    expect(new URL(links.whatsapp).pathname).toBe('/8801712345678');
    expect(new URL(links.whatsapp).searchParams.get('text')).toBe(message);
    expect(new URL(links.email).searchParams.get('body')).toBe(message);
    expect(decodeURIComponent(new URL(links.email).pathname)).toBe('amina@example.com');
  });

  it('opens an unaddressed draft for absent or invalid contacts', () => {
    for (const [email, phone] of [[null, null], ['a@example.com?bcc=bad@example.com', '123'], ['a@example.com\nBcc:bad@example.com', '999999999999999999']]) {
      const links = buildDocumentDraftLinks('Please send a passport.', email, phone);
      expect(new URL(links.email).pathname).toBe('');
      expect(new URL(links.whatsapp).pathname).toBe('/');
    }
  });
});
