import { z } from 'zod';
import { stringArraySchema } from './shared';

export const programSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  name: z.string().min(1, 'Name is required'),
  nameCn: z.string().default(''),
  universitySlug: z.string().min(1, 'University slug is required'),
  degree: z.enum(['Bachelor', 'Master', 'PhD']).default('Bachelor'),
  discipline: z.string().min(1, 'Discipline is required'),
  disciplineCn: z.string().default(''),
  language: z.enum(['English', 'Chinese', 'Bilingual']).default('English'),
  duration: z.string().default(''),
  durationCn: z.string().default(''),
  tuition: z.string().default(''),
  description: z.string().min(1, 'Description is required'),
  descriptionCn: z.string().default(''),
  requirements: stringArraySchema,
  requirementsCn: stringArraySchema,
  curriculum: stringArraySchema,
  curriculumCn: stringArraySchema,
  scholarshipAvailable: z.coerce.boolean().default(false),
  intake: z.string().default(''),
  intakeCn: z.string().default(''),
});

export type ProgramInput = z.infer<typeof programSchema>;
