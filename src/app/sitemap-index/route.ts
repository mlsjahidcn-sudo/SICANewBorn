import { SITE_URL } from '@/lib/site-url';
import { renderSitemapIndex } from '@/lib/sitemap-xml';

export const revalidate = 3600;

export function GET(): Response {
  const xml = renderSitemapIndex([
    `${SITE_URL}/sitemap-pages.xml`,
    `${SITE_URL}/sitemap-programs.xml`,
  ]);
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
    },
  });
}
