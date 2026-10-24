import { NextResponse } from 'next/server';
import { getCatalogSuggestions, isCatalogSearchEnabled } from '@/lib/catalog-search-server';
import { checkRateLimit, extractClientIp } from '@/lib/rate-limit';

export async function GET(request: Request): Promise<NextResponse> {
  const sp = new URL(request.url).searchParams;
  const q = (sp.get('q') ?? '').trim().slice(0, 200);
  if (q.length < 2) return NextResponse.json({ suggestions: [] });
  const rate = checkRateLimit({ action: 'catalog-suggestions', key: extractClientIp(request), max: 120, windowMs: 60000 });
  if (!rate.ok) return NextResponse.json({ error: 'Please retry shortly' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } });
  if (!await isCatalogSearchEnabled()) return NextResponse.json({ suggestions: [] });
  try {
    const started = performance.now();
    const suggestions = await getCatalogSuggestions(q, sp.get('locale') === 'zh' ? 'zh' : 'en');
    return NextResponse.json({ suggestions }, { headers: { 'Cache-Control': 'no-store', 'Server-Timing': `search;dur=${(performance.now() - started).toFixed(1)}` } });
  } catch {
    return NextResponse.json({ error: 'Search suggestions are temporarily unavailable' }, { status: 503 });
  }
}
