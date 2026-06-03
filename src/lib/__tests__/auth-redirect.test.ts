import { describe, it, expect } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { getPostLoginRedirectPath } from '@/lib/auth-redirect';

function makeUser(role?: string | null): User {
  return {
    id: 'test-uid',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: role === undefined ? {} : { role },
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
  } as User;
}

describe('getPostLoginRedirectPath', () => {
  it('returns /admin/dashboard for admin', () => {
    expect(getPostLoginRedirectPath(makeUser('admin'))).toBe('/admin/dashboard');
  });
  it('returns /admin/dashboard for super_admin', () => {
    expect(getPostLoginRedirectPath(makeUser('super_admin'))).toBe('/admin/dashboard');
  });
  it('returns /partner for partner', () => {
    expect(getPostLoginRedirectPath(makeUser('partner'))).toBe('/partner');
  });
  it('returns /student for student', () => {
    expect(getPostLoginRedirectPath(makeUser('student'))).toBe('/student');
  });
  it('returns /student when role is missing (default)', () => {
    expect(getPostLoginRedirectPath(makeUser(undefined))).toBe('/student');
  });
  it('returns /student for unknown role (defensive)', () => {
    expect(getPostLoginRedirectPath(makeUser('wizard'))).toBe('/student');
  });
  it('returns /login when user is null', () => {
    expect(getPostLoginRedirectPath(null)).toBe('/login');
  });
  it('handles null role value', () => {
    expect(getPostLoginRedirectPath(makeUser(null))).toBe('/student');
  });
});
