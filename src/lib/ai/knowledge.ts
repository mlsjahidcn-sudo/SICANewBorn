import { universities as _staticUniversities } from '@/lib/data';
void _staticUniversities; // Phase 3: searchUniversities now uses the live Supabase cache; static array is kept for the fallback path in live-data-context.

export interface FAQ {
  question: string;
  answer: string;
  category: 'general' | 'application' | 'visa' | 'scholarship' | 'life';
}

export const sicaFAQ: FAQ[] = [
  {
    question: 'What is SICA?',
    answer: 'SICA (Study in China Academy) is a professional education institution that provides end-to-end support for international students wishing to study in China. We help with university selection, application preparation, visa processing, and post-arrival support.',
    category: 'general'
  },
  {
    question: 'How much does it cost to study in China?',
    answer: 'Tuition fees in China are very affordable compared to Western countries. Undergraduate programs typically cost ¥20,000-40,000 per year, and graduate programs ¥25,000-50,000 per year. Living expenses are approximately ¥1,500-3,000 per month depending on the city.',
    category: 'general'
  },
  {
    question: 'What scholarships are available?',
    answer: 'There are several scholarship options: Chinese Government Scholarship (full coverage), university-specific scholarships, Confucius Institute Scholarship, and provincial scholarships. SICA can help you find and apply for suitable scholarships!',
    category: 'scholarship'
  },
  {
    question: 'What documents do I need to apply?',
    answer: 'Typical required documents: passport copy, academic transcripts, graduation diploma/degree certificate, language proficiency test scores (HSK/TOEFL/IELTS), personal statement, letters of recommendation, and portfolio (for art/design programs).',
    category: 'application'
  },
  {
    question: 'How long does the application process take?',
    answer: 'The application process typically takes 2-3 months from start to finish. University decisions usually come within 2-8 weeks after application submission. SICA recommends starting 6-9 months before your intended start date.',
    category: 'application'
  },
  {
    question: 'What visa do I need?',
    answer: 'You need either an X1 visa (for long-term study over 180 days) or X2 visa (for short-term study under 180 days). SICA provides complete guidance through the visa application process.',
    category: 'visa'
  },
  {
    question: 'Can I work while studying in China?',
    answer: 'International students can work part-time on campus with university approval. Off-campus work generally requires permission from the university and immigration authorities. SICA can provide more details about work regulations.',
    category: 'life'
  },
  {
    question: 'What is student life like in China?',
    answer: 'Student life in China is vibrant and exciting! Universities have modern facilities, international student communities, and many clubs and activities. You\'ll experience rich Chinese culture, make friends from around the world, and have access to amazing food and travel opportunities!',
    category: 'life'
  },
  {
    question: 'Do I need to know Chinese to study in China?',
    answer: 'Not necessarily! Many universities offer programs taught in English. For Chinese-taught programs, you will need HSK proficiency. SICA can help you find English-taught programs or arrange Chinese language courses before your degree program.',
    category: 'application'
  },
  {
    question: 'When should I start my application?',
    answer: 'We recommend starting your application 6-9 months before your intended start date. Fall semester (September) applications usually open in January-March, and Spring semester (March) applications usually open in September-November of the previous year.',
    category: 'application'
  }
];

export interface ApplicationStep {
  step: number;
  title: string;
  description: string;
  duration: string;
}

export const applicationSteps: ApplicationStep[] = [
  {
    step: 1,
    title: 'Research & Consultation',
    description: 'Explore universities and programs, get free consultation with SICA consultants',
    duration: '1-2 weeks'
  },
  {
    step: 2,
    title: 'Document Preparation',
    description: 'Prepare all required documents including transcripts, passport, language scores',
    duration: '2-4 weeks'
  },
  {
    step: 3,
    title: 'Application Submission',
    description: 'Complete application forms and submit all documents through SICA',
    duration: '1 week'
  },
  {
    step: 4,
    title: 'University Review',
    description: 'Wait for university decision, SICA will follow up on your behalf',
    duration: '2-8 weeks'
  },
  {
    step: 5,
    title: 'Visa Application',
    description: 'Apply for X1/X2 visa at Chinese embassy/consulate',
    duration: '2-4 weeks'
  },
  {
    step: 6,
    title: 'Pre-Departure',
    description: 'Book flights, arrange accommodation, attend orientation',
    duration: '2-4 weeks'
  },
  {
    step: 7,
    title: 'Arrival in China',
    description: 'Airport pickup, check-in, campus orientation, enrollment',
    duration: '1 week'
  }
];

// Phase 3: searchUniversities now uses the live Supabase cache
// (5-min TTL) so admin-added schools show up in the per-query
// RAG retrieval — not just the 9 hardcoded fallbacks.
import { getLiveUniversities } from '@/lib/ai/live-data-context';

export async function searchUniversities(query: string) {
  const lowerQuery = query.toLowerCase();
  const live = await getLiveUniversities();
  return live.filter(uni =>
    uni.name.toLowerCase().includes(lowerQuery) ||
    (uni.nameCn && uni.nameCn.toLowerCase().includes(lowerQuery)) ||
    uni.city.toLowerCase().includes(lowerQuery) ||
    uni.disciplines.some(d => d.toLowerCase().includes(lowerQuery)) ||
    uni.popularPrograms.some(p => p.toLowerCase().includes(lowerQuery))
  );
}

export function searchFAQ(query: string) {
  const lowerQuery = query.toLowerCase();
  return sicaFAQ.filter(faq =>
    faq.question.toLowerCase().includes(lowerQuery) ||
    faq.answer.toLowerCase().includes(lowerQuery)
  );
}

export async function getUniversityContext(query: string) {
  const relevantUnis = await searchUniversities(query);
  if (relevantUnis.length === 0) return '';

  return relevantUnis.slice(0, 3).map(uni => `
## ${uni.name} (${uni.city})
- Ranking: #${uni.ranking} in China, ${uni.qsRanking}
- Type: ${uni.type}
- Established: ${uni.established}
- Students: ${uni.students} (${uni.intlStudents} international)
- Popular Programs: ${uni.popularPrograms.join(', ')}
- Tuition: ${uni.tuitionUndergrad} (Undergraduate), ${uni.tuitionGraduate} (Graduate)
- Intake: ${uni.intake}
- Tags: ${uni.tags.join(', ')}
- Accommodation: ${uni.accommodationCost}
`).join('\n');
}

export function getApplicationGuideContext() {
  return applicationSteps.map(step => 
    `Step ${step.step}: ${step.title} (${step.duration})\n${step.description}`
  ).join('\n\n');
}
