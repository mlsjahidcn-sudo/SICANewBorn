import { describe, expect, it } from 'vitest';
import {
  buildComposeSystemPrompt,
  buildComposeUserPrompt,
  composeLinkLibrary,
  extractEmailDraft,
} from '../email-compose';
import { WHATSAPP_GROUP_URL, WHATSAPP_PHONE } from '@/lib/contact';
import { SITE_URL } from '@/lib/site-url';

describe('extractEmailDraft', () => {
  it('parses a direct JSON object', () => {
    const raw = JSON.stringify({ subject: 'Hi there', body: 'Welcome to SICA!' });
    expect(extractEmailDraft(raw)).toEqual({ subject: 'Hi there', body: 'Welcome to SICA!' });
  });

  it('parses JSON inside markdown fences', () => {
    const raw = '```json\n{"subject":"S","body":"B"}\n```';
    expect(extractEmailDraft(raw)).toEqual({ subject: 'S', body: 'B' });
  });

  it('parses JSON wrapped in leading prose', () => {
    const raw = 'Here is your draft:\n{"subject":"A real subject","body":"A real body."} — hope it helps!';
    expect(extractEmailDraft(raw)).toEqual({ subject: 'A real subject', body: 'A real body.' });
  });

  it('rejects when subject or body is missing/empty', () => {
    expect(extractEmailDraft('{"subject":"","body":"x"}')).toBeNull();
    expect(extractEmailDraft('{"subject":"x"}')).toBeNull();
    expect(extractEmailDraft('{"subject":"x","body":42}')).toBeNull();
  });

  it('rejects a runaway subject (payload guard)', () => {
    const raw = JSON.stringify({ subject: 'x'.repeat(301), body: 'ok' });
    expect(extractEmailDraft(raw)).toBeNull();
  });

  it('returns null for garbage', () => {
    expect(extractEmailDraft('')).toBeNull();
    expect(extractEmailDraft('no json here')).toBeNull();
    expect(extractEmailDraft('[1,2,3]')).toBeNull();
  });
});

describe('compose link library + prompt', () => {
  it('includes every key site link the admin asked for', () => {
    const lib = composeLinkLibrary();
    expect(lib).toContain(WHATSAPP_GROUP_URL);
    expect(lib).toContain(WHATSAPP_PHONE);
    expect(lib).toContain(`${SITE_URL}/counselling`);
    expect(lib).toContain(`${SITE_URL}/scholarships`);
    expect(lib).toContain(`${SITE_URL}/universities`);
  });

  it('the system prompt embeds the link library', () => {
    const prompt = buildComposeSystemPrompt();
    expect(prompt).toContain(WHATSAPP_GROUP_URL);
    expect(prompt).toContain(`${SITE_URL}/counselling`);
    // The "never dump the whole library" rule is spelled out.
    expect(prompt).toMatch(/1-3 links/i);
  });
});

describe('buildComposeUserPrompt', () => {
  it('includes theme and all provided context fields', () => {
    const prompt = buildComposeUserPrompt({
      theme: 'Invite to consultation',
      recipientName: 'Amina',
      country: 'Nigeria',
      sourceKind: 'assessment',
      notes: 'Asked about CSC scholarship deadlines.',
    });
    expect(prompt).toContain('Theme: Invite to consultation');
    expect(prompt).toContain('Amina');
    expect(prompt).toContain('Nigeria');
    expect(prompt).toContain('assessment');
    expect(prompt).toContain('CSC scholarship');
  });

  it('omits absent context fields', () => {
    const prompt = buildComposeUserPrompt({ theme: 'Follow up' });
    expect(prompt).not.toContain('Recipient name');
    expect(prompt).not.toContain('Notes');
  });
});
