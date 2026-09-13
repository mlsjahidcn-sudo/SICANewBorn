import { describe, it, expect } from 'vitest';
import {
  validatePartnerCreate,
  whitelistPartnerUpdate,
  EMAIL_REGEX,
} from '@/lib/admin-partner-validation';

describe('validatePartnerCreate', () => {
  it('accepts a minimal valid body and normalizes email + trims strings', () => {
    const r = validatePartnerCreate({
      email: '  Sara@Example.COM  ',
      company_name: '  Acme Co  ',
      contact_person: '  Sara Lee  ',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toMatchObject({
      email: 'sara@example.com',
      company_name: 'Acme Co',
      contact_person: 'Sara Lee',
      phone: '',
      country: '',
      notes: '',
      commission_rate: null,
      send_welcome_email: true,
    });
  });

  it('accepts all optional fields including a numeric commission_rate', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      phone: '+86 123 4567',
      country: 'China',
      notes: 'VIP',
      commission_rate: 12.5,
      send_welcome_email: false,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.commission_rate).toBe(12.5);
    expect(r.value.send_welcome_email).toBe(false);
  });

  it('rejects a missing email', () => {
    const r = validatePartnerCreate({
      company_name: 'Acme',
      contact_person: 'Sara',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/email/);
  });

  it('rejects a malformed email', () => {
    const r = validatePartnerCreate({
      email: 'not-an-email',
      company_name: 'Acme',
      contact_person: 'Sara',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/email/i);
  });

  it('rejects an empty company_name', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: '   ',
      contact_person: 'Sara',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/company_name/);
  });

  it('rejects a company_name over 255 chars', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'x'.repeat(256),
      contact_person: 'Sara',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/company_name too long/);
  });

  it('rejects an empty contact_person', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: '',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/contact_person/);
  });

  it('rejects a phone over 50 chars', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      phone: 'x'.repeat(51),
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/phone too long/);
  });

  it('rejects a country over 100 chars', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      country: 'x'.repeat(101),
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/country too long/);
  });

  it('accepts commission_rate = 0', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      commission_rate: 0,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.commission_rate).toBe(0);
  });

  it('accepts commission_rate = 100', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      commission_rate: 100,
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.commission_rate).toBe(100);
  });

  it('rejects commission_rate > 100', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      commission_rate: 101,
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/commission_rate/);
  });

  it('rejects commission_rate < 0', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      commission_rate: -1,
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/commission_rate/);
  });

  it('rejects a non-numeric commission_rate string', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      commission_rate: 'abc',
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/commission_rate/);
  });

  it('treats an empty-string commission_rate as null (not set)', () => {
    const r = validatePartnerCreate({
      email: 's@a.com',
      company_name: 'Acme',
      contact_person: 'Sara',
      commission_rate: '',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.commission_rate).toBeNull();
  });

  it('rejects a null body', () => {
    expect(validatePartnerCreate(null).ok).toBe(false);
    expect(validatePartnerCreate(undefined).ok).toBe(false);
    expect(validatePartnerCreate({} as unknown).ok).toBe(false);
  });

  it('rejects when the value at email/company_name/contact_person is not a string', () => {
    expect(validatePartnerCreate({ email: 42 } as unknown).ok).toBe(false);
    expect(
      validatePartnerCreate({
        email: 's@a.com',
        company_name: 42,
        contact_person: 'Sara',
      } as unknown).ok,
    ).toBe(false);
    expect(
      validatePartnerCreate({
        email: 's@a.com',
        company_name: 'Acme',
        contact_person: ['Sara'],
      } as unknown).ok,
    ).toBe(false);
  });
});

describe('whitelistPartnerUpdate', () => {
  it('returns only the 6 admin-editable fields', () => {
    const r = whitelistPartnerUpdate({
      company_name: 'New Co',
      user_id: 'evil-uuid',
      status: 'active',
      id: 'evil-id',
      created_at: '2026-01-01',
      updated_at: '2026-01-02',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value).toEqual({ company_name: 'New Co' });
    expect(r.value).not.toHaveProperty('user_id');
    expect(r.value).not.toHaveProperty('status');
    expect(r.value).not.toHaveProperty('id');
    expect(r.value).not.toHaveProperty('created_at');
    expect(r.value).not.toHaveProperty('updated_at');
  });

  it('returns the action field ignored — only field values count', () => {
    const r = whitelistPartnerUpdate({
      company_name: 'Co',
      contact_person: 'Sara',
      phone: '+86',
      country: 'China',
      commission_rate: 10,
      notes: 'VIP',
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(Object.keys(r.value).sort()).toEqual(
      ['commission_rate', 'company_name', 'contact_person', 'country', 'notes', 'phone'].sort(),
    );
  });

  it('rejects when no editable fields are present', () => {
    const r = whitelistPartnerUpdate({ user_id: 'x', status: 'active' });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.error).toMatch(/no editable fields/i);
  });

  it('rejects when body is null/undefined', () => {
    expect(whitelistPartnerUpdate(null).ok).toBe(false);
    expect(whitelistPartnerUpdate(undefined).ok).toBe(false);
    expect(whitelistPartnerUpdate({} as unknown).ok).toBe(false);
  });
});

describe('EMAIL_REGEX', () => {
  it('accepts typical emails', () => {
    expect(EMAIL_REGEX.test('a@b.co')).toBe(true);
    expect(EMAIL_REGEX.test('first.last+tag@example.com')).toBe(true);
  });

  it('rejects malformed emails', () => {
    expect(EMAIL_REGEX.test('')).toBe(false);
    expect(EMAIL_REGEX.test('a@b')).toBe(false);
    expect(EMAIL_REGEX.test('@b.com')).toBe(false);
    expect(EMAIL_REGEX.test('a@')).toBe(false);
    expect(EMAIL_REGEX.test('a b@c.com')).toBe(false);
  });
});