/**
 * Phase 153 (#24): normalize a meeting link before storage so the
 * "did the link change?" comparison treats `http://x` and `HTTP://x`
 * as the same URL. We lower-case the scheme + host; the path / query
 * / hash are left alone (path segments can be case-sensitive in some
 * apps — better to preserve them than to second-guess the server).
 * Returns '' for empty input.
 */
export function normalizeMeetingLink(raw: string): string {
  if (!raw) return '';
  const m = raw.match(/^(https?):\/\/([^/?#]+)(.*)$/i);
  if (!m) return raw;
  return `${m[1].toLowerCase()}://${m[2].toLowerCase()}${m[3]}`;
}
