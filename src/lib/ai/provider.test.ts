import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAIProvider, _resetAIProviderForTests } from '@/lib/ai/provider';

describe('AI provider factory', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    _resetAIProviderForTests();
  });

  afterEach(() => {
    // Restore the original env so we don't pollute the test process
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
    _resetAIProviderForTests();
  });

  it('defaults to Doubao when AI_PROVIDER is unset', () => {
    delete process.env.AI_PROVIDER;
    process.env.DOUBAO_API_KEY = 'test-key';
    process.env.DOUBAO_MODEL = 'doubao-test';
    const provider = getAIProvider();
    expect(provider.name).toBe('doubao');
    expect(provider.isConfigured).toBe(true);
  });

  it('returns DeepSeek when AI_PROVIDER=deepseek and key is set', () => {
    process.env.AI_PROVIDER = 'deepseek';
    process.env.DEEPSEEK_API_KEY = 'test-deepseek-key';
    process.env.DEEPSEEK_MODEL = 'deepseek-chat';
    const provider = getAIProvider();
    expect(provider.name).toBe('deepseek');
    expect(provider.isConfigured).toBe(true);
  });

  it('falls back to Doubao when AI_PROVIDER is an unknown value', () => {
    process.env.AI_PROVIDER = 'openai-not-supported-yet';
    process.env.DOUBAO_API_KEY = 'test-key';
    const provider = getAIProvider();
    expect(provider.name).toBe('doubao');
  });

  it('isConfigured=false for Doubao when key is missing', () => {
    delete process.env.AI_PROVIDER;
    delete process.env.DOUBAO_API_KEY;
    delete process.env.DOUBAO_MODEL;
    const provider = getAIProvider();
    expect(provider.name).toBe('doubao');
    expect(provider.isConfigured).toBe(false);
  });

  it('isConfigured=false for DeepSeek when key is missing', () => {
    process.env.AI_PROVIDER = 'deepseek';
    delete process.env.DEEPSEEK_API_KEY;
    const provider = getAIProvider();
    expect(provider.name).toBe('deepseek');
    expect(provider.isConfigured).toBe(false);
  });

  it('honors DEEPSEEK_BASE_URL override', () => {
    process.env.AI_PROVIDER = 'deepseek';
    process.env.DEEPSEEK_API_KEY = 'test-key';
    process.env.DEEPSEEK_BASE_URL = 'https://custom.deepseek.example/v1/';
    // Just ensure factory doesn't throw on construction with a custom base
    const provider = getAIProvider();
    expect(provider.name).toBe('deepseek');
  });
});
