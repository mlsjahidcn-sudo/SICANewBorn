import type { Locale } from './i18n-translations';

export type MissingDocumentCategory = 'passport' | 'transcript' | 'english_test' | 'photo' | 'other';

interface MissingDocumentOption {
  key: string;
  en: string;
  zh: string;
  category: MissingDocumentCategory;
}

/** Specific documents, rather than upload categories, so the request is actionable. */
export const MISSING_DOCUMENT_OPTIONS: readonly MissingDocumentOption[] = [
  { key: 'passport', en: 'Passport photo page', zh: '护照个人信息页', category: 'passport' },
  { key: 'photo', en: 'Passport-size photo (white background)', zh: '白底证件照', category: 'photo' },
  { key: 'transcript', en: 'Academic transcripts', zh: '成绩单', category: 'transcript' },
  { key: 'diploma', en: 'Graduation diploma / degree certificate', zh: '毕业证 / 学位证', category: 'other' },
  { key: 'pregraduation', en: 'Pre-graduation / enrollment certificate', zh: '预毕业 / 在读证明', category: 'other' },
  { key: 'english', en: 'English proficiency certificate (IELTS / TOEFL / equivalent)', zh: '英语能力证明（雅思 / 托福等）', category: 'english_test' },
  { key: 'hsk', en: 'Chinese proficiency certificate (HSK)', zh: '汉语水平考试（HSK）证书', category: 'other' },
  { key: 'study_plan', en: 'Study plan / personal statement', zh: '学习计划 / 个人陈述', category: 'other' },
  { key: 'recommendations', en: 'Recommendation letters', zh: '推荐信', category: 'other' },
  { key: 'medical', en: 'Foreigner physical examination form', zh: '外国人体格检查表', category: 'other' },
  { key: 'police', en: 'Non-criminal record certificate', zh: '无犯罪记录证明', category: 'other' },
  { key: 'bank', en: 'Bank statement / financial support proof', zh: '银行流水 / 经济担保证明', category: 'other' },
  { key: 'application_form', en: 'Signed application form', zh: '已签字的申请表', category: 'other' },
  { key: 'portfolio', en: 'Portfolio / research proposal', zh: '作品集 / 研究计划', category: 'other' },
];

export interface MissingDocumentContext {
  studentName: string;
  partnerName?: string | null;
  applicationNumber?: string | null;
  university?: string | null;
  program?: string | null;
  intake?: string | null;
  /** Offline students may not have a portal account. */
  studentHasPortal?: boolean;
}

export interface MissingDocumentMessageInput extends MissingDocumentContext {
  recipient: 'student' | 'partner';
  language: Locale;
  documents: readonly string[];
  note?: string;
}

export function buildMissingDocumentMessage(input: MissingDocumentMessageInput): string {
  const documents = [...new Set(input.documents.map((name) => name.trim()).filter(Boolean))];
  if (documents.length === 0) return '';
  const zh = input.language === 'zh';
  const studentName = input.studentName.trim() || (zh ? '申请人' : 'the applicant');
  const context = [input.applicationNumber, input.university, input.program, input.intake]
    .map((value) => value?.trim()).filter(Boolean).join(' · ');
  const partner = input.recipient === 'partner';
  const greeting = partner
    ? (input.partnerName?.trim() ? (zh ? `${input.partnerName.trim()} 您好，` : `Hello ${input.partnerName.trim()},`) : (zh ? '合作伙伴您好，' : 'Hello,'))
    : (zh ? `${studentName} 您好，` : `Hi ${studentName},`);
  const introduction = partner
    ? (zh ? `我们正在审核 ${studentName} 的 SICA 申请，还需要补充以下材料才能继续：` : `We are reviewing ${studentName}'s SICA application and still need the following documents to continue:`)
    : (zh ? '我们正在审核您的 SICA 申请，还需要补充以下材料才能继续：' : 'We are reviewing your SICA application and still need the following documents to continue:');
  const instruction = partner
    ? (zh ? '请协助学生准备清晰、完整的材料，通过 SICA 合作伙伴门户上传，或直接回复此消息发送给我们。' : 'Please help the student collect clear, complete copies and upload them through the SICA partner portal, or send them to us by replying to this message.')
    : input.studentHasPortal === false
      ? (zh ? '请直接回复此消息，将清晰、完整的材料发送给我们。' : 'Please send clear, complete copies by replying to this message.')
      : (zh ? '请通过 SICA 学生门户上传清晰、完整的材料。如需帮助，请回复此消息。' : 'Please upload clear, complete copies through your SICA student portal. Reply to this message if you need help.');
  return [
    greeting,
    introduction,
    context ? `${zh ? '申请' : 'Application'}: ${context}` : '',
    documents.map((name, index) => `${index + 1}. ${name}`).join('\n'),
    input.note?.trim(),
    instruction,
    zh ? '如暂时无法提供某项材料，请告知我们。' : 'If any document is currently unavailable, please let us know.',
    zh ? 'SICA 招生团队' : 'SICA Admissions Team',
  ].filter(Boolean).join('\n\n');
}

/** Empty/invalid contact opens a chooser instead of addressing the wrong person. */
export function buildDocumentDraftLinks(message: string, email?: string | null, phone?: string | null): { email: string; whatsapp: string } {
  const recipientEmail = email?.trim() ?? '';
  const safeEmail = /^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(recipientEmail) ? recipientEmail : '';
  let digits = phone?.replace(/[^\d]/g, '') ?? '';
  if (digits.startsWith('00')) digits = digits.slice(2);
  const safePhone = digits.length >= 7 && digits.length <= 15 ? digits : '';
  return {
    email: `mailto:${encodeURIComponent(safeEmail)}?subject=${encodeURIComponent('SICA — Missing application documents')}&body=${encodeURIComponent(message)}`,
    whatsapp: `https://wa.me/${safePhone}?text=${encodeURIComponent(message)}`,
  };
}
