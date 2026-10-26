import { loadSitemapParts } from '@/lib/sitemap-entries';
import { renderUrlSet } from '@/lib/sitemap-xml';

export const revalidate = 3600;

export async function GET(): Promise<Response> {
  const { programs } = await loadSitemapParts();
  return new Response(renderUrlSet(programs), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
