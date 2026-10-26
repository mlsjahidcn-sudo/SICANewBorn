import type { MetadataRoute } from 'next';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function lastmodValue(value: Date | string): string | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export function renderUrlSet(entries: MetadataRoute.Sitemap): string {
  const body = entries
    .map((entry) => {
      const lastmod = entry.lastModified ? lastmodValue(entry.lastModified) : null;
      const parts = [`<loc>${escapeXml(entry.url)}</loc>`];
      if (lastmod) parts.push(`<lastmod>${lastmod}</lastmod>`);
      if (entry.changeFrequency) parts.push(`<changefreq>${entry.changeFrequency}</changefreq>`);
      if (typeof entry.priority === 'number') parts.push(`<priority>${entry.priority}</priority>`);
      return `<url>${parts.join('')}</url>`;
    })
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</urlset>\n`;
}

export function renderSitemapIndex(locs: string[]): string {
  const body = locs
    .map((loc) => `<sitemap><loc>${escapeXml(loc)}</loc></sitemap>`)
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}</sitemapindex>\n`;
}
