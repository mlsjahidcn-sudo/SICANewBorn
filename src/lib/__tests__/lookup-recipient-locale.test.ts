import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lookupRecipientLocale, type EmailLocale } from '@/lib/email';

// Mock getSupabaseServer so we don't hit a real DB.
const mockSupabase = {
  from: vi.fn(),
};
vi.mock('@/lib/supabase-server', () => ({
  getSupabaseServer: () => mockSupabase,
}));

function chain(data: unknown) {
  // .from(table).select().eq().eq().maybeSingle() — return the data.
  const sel = { eq: () => sel, maybeSingle: async () => ({ data, error: null }) };
  const from = { select: () => sel };
  return from;
}

describe('lookupRecipientLocale', () => {
  beforeEach(() => {
    mockSupabase.from.mockReset();
    mockSupabase.from.mockImplementation(() => chain(null));
  });

  it('returns en by default when nothing is provided', async () => {
    const locale: EmailLocale = await lookupRecipientLocale({});
    expect(locale).toBe('en');
  });

  it('persistedLocale="zh" wins over everything', async () => {
    const locale = await lookupRecipientLocale({
      persistedLocale: 'zh',
      cookieLocale: 'en',
      acceptLanguage: 'en-US',
      studentId: 'should-never-be-looked-up',
    });
    expect(locale).toBe('zh');
    expect(mockSupabase.from).not.toHaveBeenCalled();
  });

  it('persistedLocale="en" wins', async () => {
    const locale = await lookupRecipientLocale({
      persistedLocale: 'en',
      cookieLocale: 'zh',
    });
    expect(locale).toBe('en');
  });

  it('cookieLocale="zh" wins over Accept-Language', async () => {
    const locale = await lookupRecipientLocale({
      cookieLocale: 'zh',
      acceptLanguage: 'en-US',
    });
    expect(locale).toBe('zh');
  });

  it('cookieLocale="zh-CN" prefixes match to zh', async () => {
    const locale = await lookupRecipientLocale({ cookieLocale: 'zh-CN' });
    expect(locale).toBe('zh');
  });

  it('Accept-Language "zh" wins over the en default', async () => {
    const locale = await lookupRecipientLocale({ acceptLanguage: 'zh-CN,zh;q=0.9' });
    expect(locale).toBe('zh');
  });

  it('Accept-Language "en" still falls through to en', async () => {
    const locale = await lookupRecipientLocale({ acceptLanguage: 'en-US' });
    expect(locale).toBe('en');
  });

  it('looks up student_profiles.locale when studentId is provided', async () => {
    mockSupabase.from.mockImplementationOnce(() => chain({ locale: 'zh' }));
    const locale = await lookupRecipientLocale({ studentId: 'student-uuid-1' });
    expect(locale).toBe('zh');
    expect(mockSupabase.from).toHaveBeenCalledWith('student_profiles');
  });

  it('falls through to cookie when student profile has no locale', async () => {
    mockSupabase.from.mockImplementationOnce(() => chain({ locale: null }));
    const locale = await lookupRecipientLocale({
      studentId: 'student-uuid-1',
      cookieLocale: 'zh',
    });
    expect(locale).toBe('zh');
  });

  it('student profile en overrides cookie zh', async () => {
    mockSupabase.from.mockImplementationOnce(() => chain({ locale: 'en' }));
    const locale = await lookupRecipientLocale({
      studentId: 'student-uuid-1',
      cookieLocale: 'zh',
    });
    expect(locale).toBe('en');
  });
});