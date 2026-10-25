/** Keep structured data valid JSON while preventing an embedded closing script tag. */
export function serializeJsonLd(value: unknown): string {
  return (JSON.stringify(value) ?? 'null').replace(/</g, '\\u003c');
}
