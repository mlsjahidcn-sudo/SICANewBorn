import { describe, expect, it } from 'vitest';
import {
  MESSAGE_MAX_LENGTH,
  countUnreadFor,
  isDeliverableEmail,
  mapApplicationMessage,
  messagePreview,
  portalRoleFor,
  shouldEmail,
  validateMessageBody,
} from '@/lib/application-messages';

describe('validateMessageBody', () => {
  it('trims and normalises line endings', () => {
    expect(validateMessageBody('  hi\r\nthere  ')).toEqual({ ok: true, body: 'hi\nthere' });
  });
  it('rejects empty, whitespace and non-strings', () => {
    expect(validateMessageBody('   ')).toEqual({ ok: false, error: 'empty' });
    expect(validateMessageBody(undefined)).toEqual({ ok: false, error: 'invalid' });
    expect(validateMessageBody(42)).toEqual({ ok: false, error: 'invalid' });
  });
  it('enforces the length cap after trimming', () => {
    expect(validateMessageBody('a'.repeat(MESSAGE_MAX_LENGTH)).ok).toBe(true);
    expect(validateMessageBody(`  ${'a'.repeat(MESSAGE_MAX_LENGTH)}  `).ok).toBe(true);
    expect(validateMessageBody('a'.repeat(MESSAGE_MAX_LENGTH + 1))).toEqual({ ok: false, error: 'too_long' });
  });
});

describe('shouldEmail (one email per side per hour)', () => {
  const now = Date.parse('2026-11-26T12:00:00Z');
  it('emails when nothing was emailed before', () => {
    expect(shouldEmail(null, now)).toBe(true);
    expect(shouldEmail(undefined, now)).toBe(true);
    expect(shouldEmail('not a date', now)).toBe(true);
  });
  it('holds back within the hour and resumes after it', () => {
    expect(shouldEmail('2026-11-26T11:30:00Z', now)).toBe(false);
    expect(shouldEmail('2026-11-26T11:00:01Z', now)).toBe(false);
    expect(shouldEmail('2026-11-26T11:00:00Z', now)).toBe(true);
    expect(shouldEmail('2026-11-26T09:00:00Z', now)).toBe(true);
  });
});

describe('messagePreview', () => {
  it('flattens whitespace and keeps short text whole', () => {
    expect(messagePreview('hello\n\n  world', 50)).toBe('hello world');
  });
  it('cuts long text at a word boundary with an ellipsis', () => {
    const out = messagePreview('alpha beta gamma delta epsilon', 18);
    expect(out.endsWith('…')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(19);
    expect(out).toBe('alpha beta gamma…');
  });
});

describe('isDeliverableEmail', () => {
  it('rejects empty and placeholder addresses', () => {
    expect(isDeliverableEmail(null)).toBe(false);
    expect(isDeliverableEmail('')).toBe(false);
    expect(isDeliverableEmail('no-at-sign')).toBe(false);
    expect(isDeliverableEmail('sica-noemail-123@SICA.invalid')).toBe(false);
    expect(isDeliverableEmail('student@example.com')).toBe(true);
  });
});

describe('mapApplicationMessage / countUnreadFor / portalRoleFor', () => {
  it('maps rows and falls back to admin for unknown roles', () => {
    const m = mapApplicationMessage({
      id: '1',
      sender_role: 'weird',
      sender_name: null,
      body: 'x',
      read_at: null,
      created_at: '2026-11-26T00:00:00Z',
    });
    expect(m).toEqual({ id: '1', senderRole: 'admin', senderName: '', body: 'x', readAt: null, createdAt: '2026-11-26T00:00:00Z' });
  });
  it('counts only unread messages from the other side', () => {
    const msgs = [
      { senderRole: 'admin' as const, readAt: null },
      { senderRole: 'admin' as const, readAt: '2026-01-01' },
      { senderRole: 'student' as const, readAt: null },
    ];
    expect(countUnreadFor(msgs, 'student')).toBe(1);
    expect(countUnreadFor(msgs, 'admin')).toBe(1);
  });
  it('maps surfaces to their portal role', () => {
    expect(portalRoleFor('student')).toBe('student');
    expect(portalRoleFor('partner')).toBe('partner');
  });
});
