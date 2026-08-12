import { z } from 'zod';
import { stringArraySchema } from './shared';

export const scholarshipSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  name: z.string().min(1, 'Name is required'),
  nameCn: z.string().default(''),
  type: z.enum(['Full', 'Partial']).default('Partial'),
  typeCn: z.string().default(''),
  coverage: stringArraySchema,
  coverageCn: stringArraySchema,
  degreeLevels: stringArraySchema,
  degreeLevelsCn: stringArraySchema,
  eligibleRegions: z.string().default(''),
  eligibleRegionsCn: z.string().default(''),
  duration: z.string().default(''),
  durationCn: z.string().default(''),
  deadline: z.string().default(''),
  deadlineCn: z.string().default(''),
  description: z.string().min(1, 'Description is required'),
  descriptionCn: z.string().default(''),
  requirements: stringArraySchema,
  requirementsCn: stringArraySchema,
  applicationMethod: z.string().default(''),
  applicationMethodCn: z.string().default(''),
  benefits: stringArraySchema,
  benefitsCn: stringArraySchema,
  officialLink: z.string().default(''),
});

export type ScholarshipInput = z.infer<typeof scholarshipSchema>;
