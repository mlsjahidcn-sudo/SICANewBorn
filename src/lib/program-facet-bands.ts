/**
 * program-facet-bands.ts
 *
 * PF-2: the tuition + duration bands, shared by the server (which
 * applies them as numeric bounds) and the client (which renders them
 * as a select). One table, so a band label can never drift from the
 * bounds it filters by.
 *
 * The values are the URL's `tuition_min` / `tuition_max` /
 * `duration_min` / `duration_max` params. `null` means "no bound on
 * that side".
 */

export interface NumericBand {
  /** Stable key used in the URL (`tuition=0-20000`). */
  value: string;
  /** Inclusive lower bound, or null for "no lower bound". */
  min: number | null;
  /** Inclusive upper bound, or null for "no upper bound". */
  max: number | null;
  /** i18n key for the option label. */
  labelKey: string;
}

/** Tuition bands in CNY per year. */
export const TUITION_BANDS: NumericBand[] = [
  { value: '0-20000', min: null, max: 20000, labelKey: 'prog.tuitionUnder20k' },
  { value: '20000-40000', min: 20000, max: 40000, labelKey: 'prog.tuition20to40k' },
  { value: '40000-', min: 40000, max: null, labelKey: 'prog.tuitionOver40k' },
];

/** Duration bands in years. */
export const DURATION_BANDS: NumericBand[] = [
  { value: '0-1', min: null, max: 1, labelKey: 'prog.durationUpTo1' },
  { value: '1-2', min: 1, max: 2, labelKey: 'prog.duration1to2' },
  { value: '2-3', min: 2, max: 3, labelKey: 'prog.duration2to3' },
  { value: '3-', min: 3, max: null, labelKey: 'prog.durationOver3' },
];

/** Look a band up by its URL value. */
export function findBand(bands: NumericBand[], value: string | null | undefined): NumericBand | null {
  if (!value) return null;
  return bands.find((b) => b.value === value) ?? null;
}
