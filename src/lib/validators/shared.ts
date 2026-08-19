import { NextResponse } from 'next/server';
import { z, ZodError } from 'zod';

export interface ValidationErrorResponse {
  error: string;
  details: { path: (string | number)[]; message: string }[];
}

export function formatZodError(error: ZodError): ValidationErrorResponse {
  return {
    error: 'Validation failed',
    details: error.issues.map((issue) => ({
      path: issue.path.filter((p): p is string | number => typeof p !== 'symbol'),
      message: issue.message,
    })),
  };
}

export function validationErrorResponse(error: ZodError): NextResponse<ValidationErrorResponse> {
  return NextResponse.json(formatZodError(error), { status: 400 });
}

export const stringArraySchema = z
  .union([z.array(z.string()), z.string()])
  .default([])
  .transform((val) => {
    if (Array.isArray(val)) return val;
    return val
      .split(/[\n•·,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  })
  .pipe(z.array(z.string()));

export const highlightsSchema = z.object({
  en: z.array(z.string()).default([]),
  zh: z.array(z.string()).default([]),
});

/**
 * Track 1.3 U2: keep only the keys the client actually sent from a
 * partial-schema parse result. In zod v4, `.partial()` makes every
 * field optional but still applies per-field defaults to omitted
 * keys — merging that over an existing row would blank the omitted
 * fields with '' / [] / 0. Filtering by the raw body's keys restores
 * true partial-update semantics for the [slug] PUT handlers.
 */
export function pickSentFields<T extends Record<string, unknown>>(
  parsed: T,
  raw: unknown,
): Partial<T> {
  const sent = new Set(
    Object.keys(raw && typeof raw === 'object' ? raw : {}),
  );
  return Object.fromEntries(
    Object.entries(parsed).filter(([key]) => sent.has(key)),
  ) as Partial<T>;
}
