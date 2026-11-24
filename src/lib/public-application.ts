import { z } from 'zod';

/** Public applicants may need help choosing. Keep this separate from partner CRM rules. */
export const publicApplicationSchema = z.object({
  website: z.string().optional(),
  studentName: z.string().trim().min(1, 'Please enter your name.').max(255),
  studentEmail: z.string().trim().email().max(255).optional().or(z.literal('')),
  studentPhone: z.string().trim().min(5).max(50).optional().or(z.literal('')),
  nationality: z.string().trim().max(100).optional().or(z.literal('')),
  university: z.string().trim().max(255).optional().or(z.literal('')),
  program: z.string().trim().max(255).optional().or(z.literal('')),
  degree: z.enum(['Bachelor', 'Master', 'PhD']).optional().or(z.literal('')),
  intake: z.string().trim().max(100).optional().or(z.literal('')),
  gpa: z.string().trim().max(16).optional().or(z.literal('')),
  englishTest: z.enum(['IELTS', 'TOEFL', 'Duolingo', 'PTE', 'Other']).optional().or(z.literal('')),
  englishScore: z.string().trim().max(16).optional().or(z.literal('')),
  whyProgram: z.string().trim().max(500).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  referringPartnerId: z.string().uuid().optional(),
}).superRefine((data, ctx) => {
  if (!data.studentEmail && !data.studentPhone) {
    ctx.addIssue({ code: 'custom', path: ['studentEmail'], message: 'Enter an email address or phone number so we can contact you.' });
  }
  if ((!data.university || !data.program) && (!data.notes || data.notes.length < 20)) {
    ctx.addIssue({ code: 'custom', path: ['notes'], message: 'Describe your study goals in at least 20 characters if you need help choosing a university or program.' });
  }
});
