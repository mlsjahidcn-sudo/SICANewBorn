import type { Program } from './data';

type FaqProgram = Pick<Program, 'name' | 'tuition' | 'language' | 'requirements' | 'intake'>;

export function buildProgramFaqSchema(program: FaqProgram, universityName: string) {
  const confirmation = 'Confirm the current requirements and availability with the university before applying.';
  const answers = [
    {
      question: `How much does the ${program.name} cost?`,
      answer: program.tuition
        ? `The published tuition for ${program.name} at ${universityName} is ${program.tuition}. Confirm the fee for your intake.`
        : `The tuition for ${program.name} at ${universityName} has not been confirmed for the next intake.`,
    },
    {
      question: `What language is the ${program.name} taught in?`,
      answer: program.language && program.language !== 'To be confirmed'
        ? `The listed teaching language is ${program.language}. ${confirmation}`
        : `The teaching language has not been confirmed. ${confirmation}`,
    },
    {
      question: `What are the admission requirements for the ${program.name}?`,
      answer: program.requirements.length
        ? `The published requirements include: ${program.requirements.join('; ')}. ${confirmation}`
        : `The program-specific admission requirements have not been confirmed. ${confirmation}`,
    },
    {
      question: `When can I start the ${program.name}?`,
      answer: program.intake
        ? `The published intake information is: ${program.intake}. Confirm the next available start date with the university.`
        : 'The next available intake has not been confirmed. Contact the university for the current start date.',
    },
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: answers.map(({ question, answer }) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer },
    })),
  };
}
