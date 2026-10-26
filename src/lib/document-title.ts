import type { Metadata } from 'next';

/**
 * The root layout title template is `%s | SICA`.
 * A title that already includes the brand must be absolute, otherwise
 * the template appends a second "| SICA".
 */
export function documentTitle(title: string): NonNullable<Metadata['title']> {
  if (/\|\s*SICA\b/.test(title)) return { absolute: title };
  return title;
}
