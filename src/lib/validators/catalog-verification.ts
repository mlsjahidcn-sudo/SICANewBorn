import { z } from 'zod';
import type { CatalogVerification } from '@/lib/catalog-verification';

const sourceUrl = z.union([z.literal(''), z.url().refine((value) => /^https?:\/\//i.test(value), 'Use an HTTP or HTTPS source')]).optional();
const date = z.union([z.literal(''), z.iso.date()]).optional();

/** Only staff-authored evidence; absence never implies that a fact was verified. */
export const catalogVerificationSchema = z.object({
  sourceUrl,
  verifiedAt: date,
  intake: z.string().max(160).optional(),
  intakeCn: z.string().max(160).optional(),
  intakeStatus: z.enum(['unknown', 'open', 'closed']).optional(),
  deadline: date,
  funding: z.string().max(4000).optional(),
  fundingCn: z.string().max(4000).optional(),
  rankingYear: z.union([z.literal(''), z.string().regex(/^20\d{2}$/)]).optional(),
  rankingSourceUrl: sourceUrl,
}).superRefine((value, context) => {
  if ((value.intakeStatus && value.intakeStatus !== 'unknown') || value.deadline || value.funding || value.fundingCn) {
    if (!value.sourceUrl || !value.verifiedAt) context.addIssue({ code: 'custom', message: 'A source and verification date are required for availability, deadlines and funding', path: ['sourceUrl'] });
  }
  if ((value.intakeStatus && value.intakeStatus !== 'unknown') || value.deadline) {
    if (!value.intake || !/\b20\d{2}\b/.test(value.intake)) context.addIssue({ code: 'custom', message: 'Name the intake and year for this status or deadline', path: ['intake'] });
  }
  if (value.verifiedAt && value.verifiedAt > new Date().toISOString().slice(0, 10)) context.addIssue({ code: 'custom', message: 'Verification date cannot be in the future', path: ['verifiedAt'] });
});

export function readCatalogVerification(value: unknown): CatalogVerification | undefined {
  const parsed = catalogVerificationSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

