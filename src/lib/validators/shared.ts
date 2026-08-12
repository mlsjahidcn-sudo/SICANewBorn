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
