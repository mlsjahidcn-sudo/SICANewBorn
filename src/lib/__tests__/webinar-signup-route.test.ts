import { NextRequest } from 'next/server';
import { expect, it, vi } from 'vitest';
import { POST } from '@/app/api/webinar-signups/route';
import { getSupabaseServer } from '@/lib/supabase-server';
import { WEBINAR_CONFIG } from '@/lib/webinar-config';

vi.mock('@/lib/supabase-server', () => ({
  getSupabaseServer: vi.fn(),
  isSupabaseServerConfigured: () => true,
}));

it('returns 410 before accessing the database after the webinar starts', async () => {
  const clock = vi.spyOn(Date, 'now').mockReturnValue(Date.parse(WEBINAR_CONFIG.sessionDateIso) + 60_000);
  try {
    const response = await POST(new NextRequest('http://localhost/api/webinar-signups', {
      method: 'POST',
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Student',
        email: 'test@example.com',
        whatsapp: '+12025550123',
        country: 'Bangladesh',
      }),
    }));

    expect(response.status).toBe(410);
    expect(await response.json()).toEqual({ error: 'Webinar registration is currently closed.' });
    expect(getSupabaseServer).not.toHaveBeenCalled();
  } finally {
    clock.mockRestore();
  }
});
