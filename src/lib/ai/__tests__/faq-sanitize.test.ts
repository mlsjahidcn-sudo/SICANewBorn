import { describe, it, expect } from 'vitest';
import {
  extractAndNormalizeFaq,
  normalizeFaqPayload,
  normalizeQueueQuestion,
  isQueueWorthyQuestion,
  FAQ_CATEGORIES,
} from '../faq-sanitize';

describe('extractAndNormalizeFaq', () => {
  it('parses a plain JSON object', () => {
    const raw = `{"question":"How do I get a student visa?","answer":"You need an X1 or X2 visa.","category":"visa"}`;
    const payload = extractAndNormalizeFaq(raw);
    expect(payload).not.toBeNull();
    expect(payload?.question).toBe('How do I get a student visa?');
    expect(payload?.category).toBe('visa');
  });

  it('strips code fences and preamble around the JSON object', () => {
    const raw = '```json\n{"question":"Q?","answer":"A","category":"general"}\n```\nHope this helps!';
    const payload = extractAndNormalizeFaq(raw);
    expect(payload?.question).toBe('Q?');
  });

  it('tolerates trailing commas the model emits', () => {
    const raw = `{"question":"Q?","answer":"A","category":"life",}`;
    expect(extractAndNormalizeFaq(raw)?.category).toBe('life');
  });

  it('returns null when there is no JSON object at all', () => {
    expect(extractAndNormalizeFaq('Here is a helpful answer in plain prose.')).toBeNull();
    expect(extractAndNormalizeFaq('')).toBeNull();
  });

  it('returns null when the JSON parses but is unusable', () => {
    expect(extractAndNormalizeFaq('{"answer":"only an answer"}')).toBeNull();
    expect(extractAndNormalizeFaq('{"question":"only a question"}')).toBeNull();
  });
});

describe('normalizeFaqPayload', () => {
  it('throws on missing question', () => {
    expect(() => normalizeFaqPayload({ question: '   ', answer: 'A' })).toThrow(/no question/);
  });

  it('throws on missing answer', () => {
    expect(() => normalizeFaqPayload({ question: 'Q', answer: '' })).toThrow(/no answer/);
  });

  it('coerces an unknown category to general instead of failing the row', () => {
    const payload = normalizeFaqPayload({ question: 'Q', answer: 'A', category: 'sports' });
    expect(payload.category).toBe('general');
  });

  it('keeps only valid categories', () => {
    expect(FAQ_CATEGORIES).toEqual(['general', 'application', 'visa', 'scholarship', 'life']);
  });

  it('scrubs third-party agency names from the answer', () => {
    const payload = normalizeFaqPayload({
      question: 'Which platform should I use?',
      answer: 'You could apply through CUCAS or ApplyBoard, but SICA is better.',
      category: 'general',
    });
    expect(payload.answer).not.toContain('CUCAS');
    expect(payload.answer).not.toContain('ApplyBoard');
    expect(payload.answer).toContain('other agencies');
  });

  it('strips script tags from the answer', () => {
    const payload = normalizeFaqPayload({
      question: 'Q',
      answer: 'Safe text<script>alert(1)</script> more text',
      category: 'general',
    });
    expect(payload.answer).not.toContain('<script>');
    expect(payload.answer).toContain('Safe text');
  });

  it('caps the answer at 4000 chars and the question at 500', () => {
    const payload = normalizeFaqPayload({
      question: 'Q'.repeat(900),
      answer: 'A'.repeat(9_000),
      category: 'general',
    });
    expect(payload.question.length).toBeLessThanOrEqual(500);
    expect(payload.answer.length).toBeLessThanOrEqual(4_000);
  });
});

describe('normalizeQueueQuestion', () => {
  it('lowercases, trims, and collapses whitespace — the chatbot_faq_queue dedup key', () => {
    expect(normalizeQueueQuestion('  How much   does it COST? ')).toBe('how much does it cost?');
  });

  it('maps phrasing variants to the same key only when truly identical', () => {
    expect(normalizeQueueQuestion('What is the deadline?')).toBe(
      normalizeQueueQuestion('what is the deadline?'),
    );
    expect(normalizeQueueQuestion('What is the deadline')).not.toBe(
      normalizeQueueQuestion('What is the deadline?'),
    );
  });

  it('caps at 500 chars', () => {
    expect(normalizeQueueQuestion('x'.repeat(2_000)).length).toBeLessThanOrEqual(500);
  });
});

describe('isQueueWorthyQuestion', () => {
  it('rejects greetings and short fragments', () => {
    expect(isQueueWorthyQuestion('hi')).toBe(false);
    expect(isQueueWorthyQuestion('Hello!')).toBe(false);
    expect(isQueueWorthyQuestion('good morning')).toBe(false);
    expect(isQueueWorthyQuestion('你好')).toBe(false);
    expect(isQueueWorthyQuestion('visa?')).toBe(false);
    expect(isQueueWorthyQuestion('   ')).toBe(false);
  });

  it('accepts real questions', () => {
    expect(isQueueWorthyQuestion('How much is tuition at Tsinghua for 2026?')).toBe(true);
    expect(isQueueWorthyQuestion('Can I get a scholarship with a 3.2 GPA?')).toBe(true);
  });

  it('accepts questions that merely start with a greeting word', () => {
    expect(isQueueWorthyQuestion('Hello, how do I apply for the X1 visa?')).toBe(true);
  });
});
