import { describe, it, expect } from 'vitest';
import {
  extractNameFromMessages,
  extractEmailFromMessages,
} from '@/components/ai/ChatWindow';

/**
 * Tests for the chat → lead-form pre-fill extractors.
 *
 * The point: when a visitor opens "Save your progress", the form
 * should pre-fill Name (and Email if they typed it in chat). The
 * regex needs to be lenient enough to catch the common patterns
 * ("my name is X", "I'm X", etc.) but strict enough to NOT
 * false-positive on sentences like "I am looking for a Master's".
 *
 * Phase X: pre-filled chat form.
 */
describe('extractNameFromMessages', () => {
  const mk = (
    role: 'user' | 'assistant',
    content: string,
  ): { role: 'user' | 'assistant'; content: string } => ({
    role,
    content,
  });

  it('extracts from "my name is X" (canonical)', () => {
    expect(
      extractNameFromMessages([
        mk('user', 'Hi, my name is John Smith'),
        mk('assistant', 'Hi John!'),
      ]),
    ).toBe('John Smith');
  });

  it('extracts from "my name\'s X" (apostrophe-s)', () => {
    expect(
      extractNameFromMessages([mk('user', "Hi, my name's Maria")]),
    ).toBe('Maria');
  });

  it('extracts from "I\'m X"', () => {
    expect(
      extractNameFromMessages([mk('user', "Hi, I'm Ahmed")]),
    ).toBe('Ahmed');
  });

  it('extracts from "I am X" (capital A)', () => {
    expect(
      extractNameFromMessages([mk('user', 'Hello, I am Yuki Tanaka')]),
    ).toBe('Yuki Tanaka');
  });

  it('extracts from "this is X"', () => {
    expect(
      extractNameFromMessages([mk('user', 'Hi, this is Priya')]),
    ).toBe('Priya');
  });

  it('extracts from "call me X"', () => {
    expect(
      extractNameFromMessages([mk('user', "Everyone just calls me Sam")]),
    ).toBe('Sam');
  });

  it('does NOT extract from "I am looking for..."', () => {
    expect(
      extractNameFromMessages([mk('user', 'I am looking for a Master\'s in CS')]),
    ).toBeNull();
  });

  it('does NOT extract from "I am interested in..."', () => {
    expect(
      extractNameFromMessages([mk('user', 'I am interested in Computer Science')]),
    ).toBeNull();
  });

  it('does NOT extract from "I am a student"', () => {
    expect(
      extractNameFromMessages([mk('user', 'I am a student from Nigeria')]),
    ).toBeNull();
  });

  it('does NOT extract from assistant messages', () => {
    expect(
      extractNameFromMessages([
        mk('user', 'Tell me about scholarships'),
        mk('assistant', 'Your name is John'),
        mk('user', 'ok thanks'),
      ]),
    ).toBeNull();
  });

  it('returns null for empty conversation', () => {
    expect(extractNameFromMessages([])).toBeNull();
  });

  it('prefers the most recent name when introduced multiple times', () => {
    expect(
      extractNameFromMessages([
        mk('user', 'my name is Alice'),
        mk('assistant', 'Hi Alice'),
        mk('user', 'actually I should mention, my name is Bob Jones'),
      ]),
    ).toBe('Bob Jones');
  });

  it('rejects overly long captures (sanity bound)', () => {
    const longish = 'A'.repeat(60);
    expect(
      extractNameFromMessages([mk('user', `my name is ${longish}`)]),
    ).toBeNull();
  });
});

describe('extractEmailFromMessages', () => {
  const mk = (
    role: 'user' | 'assistant',
    content: string,
  ): { role: 'user' | 'assistant'; content: string } => ({
    role,
    content,
  });

  it('extracts a plain email typed in chat', () => {
    expect(
      extractEmailFromMessages([mk('user', 'my email is foo@gmail.com')]),
    ).toBe('foo@gmail.com');
  });

  it('extracts from "reach me at X"', () => {
    expect(
      extractEmailFromMessages([mk('user', 'you can reach me at jane.doe@university.edu')]),
    ).toBe('jane.doe@university.edu');
  });

  it('returns null when no email in chat', () => {
    expect(
      extractEmailFromMessages([mk('user', 'Tell me about scholarships')]),
    ).toBeNull();
  });

  it('does not extract from assistant messages', () => {
    expect(
      extractEmailFromMessages([
        mk('user', 'Tell me about scholarships'),
        mk('assistant', 'Please email foo@bar.com for details'),
      ]),
    ).toBeNull();
  });

  it('handles multiple users + picks first match', () => {
    expect(
      extractEmailFromMessages([
        mk('user', 'hi'),
        mk('user', 'contact: alice@example.com'),
      ]),
    ).toBe('alice@example.com');
  });
});