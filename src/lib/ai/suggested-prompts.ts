/**
 * Curated suggested-prompt chips shown on the public chat's first
 * open (messages.length === 0). Manual curation so we can A/B test
 * copy + ensure every chip maps to a question SICA can actually answer.
 *
 * The chip label is what the visitor sees. `starter` is what gets sent
 * to the LLM when the chip is clicked. i18n'd via the chat.* namespace
 * so the visitor's locale picks the language.
 *
 * Phase 81. Kept intentionally short (6) — research from Drift +
 * Intercom shows 4-6 chips is the sweet spot before choice paralysis.
 */
export interface SuggestedPrompt {
  /** Stable id so React keys stay stable across re-renders. */
  id: string;
  /** Short label (≤ 32 chars) shown on the chip button. */
  label: string;
  /** Full sentence sent to the LLM as the visitor's first message. */
  starter: string;
}

export const SUGGESTED_PROMPTS_EN: SuggestedPrompt[] = [
  {
    id: 'scholarships',
    label: 'What scholarships are available?',
    starter: 'What scholarships are available for international students?',
  },
  {
    id: 'tuition',
    label: 'How much does tuition cost?',
    starter: 'How much does tuition cost at Chinese universities?',
  },
  {
    id: 'csc',
    label: 'Tell me about CSC',
    starter: 'Tell me about the Chinese Government Scholarship (CSC).',
  },
  {
    id: 'top-unis',
    label: 'What are the top universities?',
    starter: 'What are the top-ranked universities in China?',
  },
  {
    id: 'how-to-apply',
    label: 'How do I apply?',
    starter: 'How do I apply to a Chinese university as an international student?',
  },
  {
    id: 'compare',
    label: 'Help me compare universities',
    starter: 'Help me compare universities in China.',
  },
];

export const SUGGESTED_PROMPTS_ZH: SuggestedPrompt[] = [
  { id: 'scholarships', label: '有哪些奖学金？', starter: '国际学生可以申请哪些奖学金？' },
  { id: 'tuition', label: '学费多少？', starter: '中国大学的学费大概是多少？' },
  { id: 'csc', label: '介绍一下 CSC 奖学金', starter: '介绍一下中国政府奖学金 (CSC)。' },
  { id: 'top-unis', label: '顶尖大学有哪些？', starter: '中国排名靠前的大学有哪些？' },
  { id: 'how-to-apply', label: '怎么申请？', starter: '国际学生怎么申请中国大学？' },
  { id: 'compare', label: '帮我对比大学', starter: '帮我对比几所中国大学。' },
];

export function pickSuggestedPrompts(locale: string): SuggestedPrompt[] {
  return locale.startsWith('zh') ? SUGGESTED_PROMPTS_ZH : SUGGESTED_PROMPTS_EN;
}