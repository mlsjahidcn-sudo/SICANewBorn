import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatWithSignature } from '@/lib/email';

const ORIGINAL_ENV = { ...process.env };

describe('formatWithSignature', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('prefixes the subject with [SICA]', () => {
    const out = formatWithSignature({
      subject: 'Welcome aboard',
      bodyText: 'Hi there',
    });
    expect(out.subject).toBe('[SICA] Welcome aboard');
  });

  it('appends the standard signature block (navy line + URL + reply-to)', () => {
    const out = formatWithSignature({
      subject: 'X',
      bodyText: 'Body content',
    });
    expect(out.text).toContain('-- ');
    expect(out.text).toContain('SICA Study in China Academy');
    expect(out.text).toContain('https://studyinchina.academy');
  });

  it('does NOT include the unsubscribe footer when token is empty', () => {
    const out = formatWithSignature({
      subject: 'X',
      bodyText: 'Body',
      unsubscribeToken: '',
    });
    expect(out.text).not.toContain('Unsubscribe');
    expect(out.text).not.toContain('/api/email/unsubscribe');
  });

  it('includes the unsubscribe footer when token is present', () => {
    const out = formatWithSignature({
      subject: 'X',
      bodyText: 'Body',
      unsubscribeToken: 'abc123',
    });
    expect(out.text).toContain('Update preferences or unsubscribe');
    expect(out.text).toContain('/api/email/unsubscribe?token=abc123');
  });

  it('URL-encodes the unsubscribe token', () => {
    const out = formatWithSignature({
      subject: 'X',
      bodyText: 'Body',
      unsubscribeToken: 'a/b?c=1',
    });
    expect(out.text).toContain('a%2Fb%3Fc%3D1');
  });

  it('trims trailing whitespace from the body before joining', () => {
    const out = formatWithSignature({
      subject: 'X',
      bodyText: 'Body\n\n\n\n\n',
    });
    // The signature starts with an empty line, then '-- '. The body's
    // trailing newlines are trimmed, so the body + signature join has
    // exactly the right number of newlines (no 5-blank-line gap).
    expect(out.text).not.toMatch(/Body\n{4,}-- /);
    expect(out.text).toMatch(/Body\n\n+-- /);
  });

  it('separates body + signature with a blank line, signature + footer with a blank line', () => {
    const out = formatWithSignature({
      subject: 'X',
      bodyText: 'Body',
      unsubscribeToken: 't',
    });
    // Body (no trailing newline) + \n\n + signature (starts with \n, so
    // total 3 newlines between 'Body' and '-- '), then signature lines
    // joined by \n, then \n\n to the unsubscribe footer.
    expect(out.text).toBe(
      'Body' +
        '\n\n\n' +
        '-- \nSICA Study in China Academy\nhttps://studyinchina.academy\ninfo@studyinchina.academy' +
        '\n\n' +
        'Update preferences or unsubscribe: ' +
        'https://studyinchina.academy/api/email/unsubscribe?token=t',
    );
  });
});