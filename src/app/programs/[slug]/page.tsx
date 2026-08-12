import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProgramBySlug } from '@/lib/program-queries';
import { getUniversityBySlug } from '@/lib/university-queries';
import ProgramDetailClient from './_components/program-detail-client';

interface ProgramPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProgramPageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  if (!program) return { title: 'Program not found | SICA' };

  const title = `${program.name} | ${program.degree} Program in China | SICA`;
  const description = program.description.slice(0, 160);

  return {
    title,
    description,
    alternates: {
      canonical: `/programs/${slug}`,
    },
    openGraph: {
      title,
      description,
    },
  };
}

function buildFaqSchema(program: NonNullable<Awaited<ReturnType<typeof getProgramBySlug>>>, universityName: string) {
  const programName = program.name;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How much does the ${programName} cost?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: program.tuition
            ? `Tuition for the ${programName} at ${universityName} is ${program.tuition} per year. The SICA admissions team can confirm the exact figure for your intake and help you apply for partial or full scholarships that often cover 50–100% of tuition.`
            : `Tuition for the ${programName} at ${universityName} varies by intake. Submit a free assessment at https://studyinchina.academy/assessment for an exact quote.`,
        },
      },
      {
        '@type': 'Question',
        name: `What language is the ${programName} taught in?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: program.language
            ? `The ${programName} is taught in ${program.language}. ${program.language === 'English' ? 'No Chinese proficiency is required for admission. HSK is recommended for daily life but not for entry.' : 'Students need HSK 4–5 (intermediate Chinese) for admission. SICA offers a 1-year language preparatory year option for students who need to reach the required level.'}`
            : `The ${programName} is offered in English and Chinese tracks. SICA matches you to the right track based on your language background.`,
        },
      },
      {
        '@type': 'Question',
        name: `What are the admission requirements for the ${programName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Admission to the ${programName} typically requires a bachelor's degree (for Master's) or master's degree (for PhD), GPA 3.0+, IELTS 6.0+ or TOEFL 80+, and 2 recommendation letters. Specific requirements vary by intake — the SICA team will confirm the exact list for your application.`,
        },
      },
      {
        '@type': 'Question',
        name: `When can I start the ${programName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `The ${programName} typically has two intakes per year: September (Fall) and February/March (Spring). Most students apply 6–9 months in advance. SICA's admissions timeline helps you hit every key milestone.`,
        },
      },
    ],
  };
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const university = program.universitySlug
    ? await getUniversityBySlug(program.universitySlug)
    : null;
  const universityName = university ? university.name : 'the partner university';
  const faqSchema = buildFaqSchema(program, universityName);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProgramDetailClient program={program} university={university} />
    </>
  );
}
