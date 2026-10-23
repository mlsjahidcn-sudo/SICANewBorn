/** Windowed page list with ellipses for large catalogues. */
export function pageNumbers(current: number, total: number, window = 2): (number | '…')[] {
  const out: (number | '…')[] = [];
  const from = Math.max(1, current - window);
  const to = Math.min(total, current + window);
  if (from > 1) {
    out.push(1);
    if (from > 2) out.push('…');
  }
  for (let p = from; p <= to; p++) out.push(p);
  if (to < total) {
    if (to < total - 1) out.push('…');
    out.push(total);
  }
  return out;
}
