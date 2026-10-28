import type { Program, University } from './data';
import { catalogLabel, detailText, localizedDetail, localizedItems } from './detail-content';
import { datedIntake, verifiedEvidence } from './catalog-verification';

export interface DetailFaqItem { question: string; answer: string }

export function faqSchema(items: DetailFaqItem[]): { '@context': string; '@type': string; mainEntity: { '@type': string; name: string; acceptedAnswer: { '@type': string; text: string } }[] } {
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: items.map(({ question, answer }) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) };
}

type FaqProgram = Pick<Program, 'name' | 'tuition' | 'language' | 'requirements' | 'intake'> & Partial<Program>;

/**
 * Only emit Q&A pairs with confirmed catalog values. Not-listed / not-confirmed
 * fallbacks stay out of the visible FAQ and out of FAQPage JSON-LD.
 */
export function buildProgramFaqItems(program: FaqProgram, universityName: string, locale: 'en' | 'zh' = 'en'): DetailFaqItem[] {
  const zh = locale === 'zh';
  const name = localizedDetail(program.name, program.nameCn, locale);
  const requirements = localizedItems(program.requirements, program.requirementsCn, locale);
  const intake = datedIntake(localizedDetail(program.intake, program.intakeCn, locale), program.detailVerification);
  const funding = verifiedEvidence(program.detailVerification) ? localizedDetail(program.detailVerification?.funding, program.detailVerification?.fundingCn, locale) : '';
  const language = detailText(program.language);
  const tuition = detailText(program.tuition);
  const items: DetailFaqItem[] = [];

  if (tuition) {
    items.push({
      question: zh ? `${name}的学费是多少？` : `How much does ${name} cost?`,
      answer: zh
        ? `${universityName}该项目列出的学费为 ${tuition}。请确认适用于你的入学季的费用。`
        : `The listed tuition at ${universityName} is ${tuition}. Confirm the fee for your intake.`,
    });
  }

  if (language) {
    items.push({
      question: zh ? '使用什么语言授课？' : 'What is the teaching language?',
      answer: zh
        ? `记录的授课语言为 ${catalogLabel(program.language, locale)}。请按入学季确认。`
        : `The listed teaching language is ${language}. Confirm it for your intake.`,
    });
  }

  if (requirements.length > 0) {
    items.push({
      question: zh ? '如何确认入学要求？' : 'What are the entry requirements?',
      answer: `${requirements.join('; ')}. ${zh ? '要求可能随入学季变化，请在申请前确认。' : 'Requirements can change by intake; confirm before applying.'}`,
    });
  }

  if (intake) {
    items.push({
      question: zh ? '何时可以入学？' : 'When can I start?',
      answer: zh
        ? `记录的入学季为 ${intake}。请确认当前名额和截止日期。`
        : `The recorded intake is ${intake}. Confirm current availability and its deadline.`,
    });
  }

  if (funding) {
    items.push({
      question: zh ? '有奖学金吗？' : 'Is funding available?',
      answer: funding,
    });
  }

  return items;
}

export function buildProgramFaqSchema(program: FaqProgram, universityName: string, locale: 'en' | 'zh' = 'en'): ReturnType<typeof faqSchema> | null {
  const items = buildProgramFaqItems(program, universityName, locale);
  if (items.length < 2) return null;
  return faqSchema(items);
}

export function buildUniversityFaqItems(university: University, count: number, locale: 'en' | 'zh'): DetailFaqItem[] {
  const zh = locale === 'zh';
  const name = localizedDetail(university.name, university.nameCn, locale);
  const tuition = detailText(university.tuitionUndergrad);
  return [
    { question: zh ? `${name}有哪些项目？` : `Which programs are listed at ${name}?`, answer: zh ? `SICA 目录目前列出了 ${count} 个公开项目。请打开项目列表查看学位、授课语言、费用和入学季。` : `The SICA catalog currently lists ${count} public programs. Open the program list for degree, teaching language, fees and intake details.` },
    { question: zh ? '学费是多少？' : 'What does tuition cost?', answer: tuition ? (zh ? `记录的本科费用为 ${tuition}。具体项目和入学季的费用需另行确认。` : `The recorded undergraduate range is ${tuition}. Confirm fees for the specific program and intake.`) : (zh ? '费用因项目而异，当前本科费用区间尚未列出。' : 'Fees vary by program; an undergraduate range is not listed.') },
    { question: zh ? '申请需要哪些条件？' : 'What are the admission requirements?', answer: zh ? '条件因项目和入学季而异。请选择具体项目；学校页面上的材料清单仅为一般准备说明。' : 'Requirements vary by program and intake. Choose a program; the document checklist on this university page is general preparation guidance.' },
    { question: zh ? '可以申请奖学金吗？' : 'Can I apply for a scholarship?', answer: zh ? '请确认具体项目的奖学金类型、覆盖范围、资格和截止日期。此页面不推定该校参与任何特定奖学金。' : 'Confirm the specific program’s funding type, coverage, eligibility and deadline. This page does not infer participation in any scholarship scheme.' },
  ];
}
