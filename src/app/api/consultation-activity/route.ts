import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getActiveConsultationShots } from '@/lib/consultation-activity';
import type { Locale } from '@/lib/i18n-translations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/consultation-activity — public list of active consultation
 * activity shots. Drives the home page + consultation page sections
 * server-side via `getActiveConsultationShots()` (which also signs
 * the storage URLs). Returns:
 *   - 200 `{ shots: ResolvedConsultationShot[] }` on success
 *   - 200 `{ shots: [] }` when no active shots (the page renders
 *     nothing rather than an empty grid; the API is still 200 so
 *     the page can decide)
 *   - 200 `{ shots: [] }` when Supabase is not configured (no rows
 *     = section hidden, no DB error)
 *
 * No auth: the consultation page + home page are public.
 */
export async function GET() {
  const cookieStore = await cookies();
  const locale: Locale = cookieStore.get('sica-locale')?.value === 'zh' ? 'zh' : 'en';
  const shots = await getActiveConsultationShots(locale);
  return NextResponse.json({ shots });
}
