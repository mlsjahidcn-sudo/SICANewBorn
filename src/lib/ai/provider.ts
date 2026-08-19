/**
 * AI provider abstraction — unifies the Doubao (Volcengine Ark) and
 * DeepSeek APIs behind a single interface. Both are OpenAI-compatible
 * (POST /chat/completions with the same body shape), so the implementation
 * is just two thin fetch wrappers around different base URLs and keys.
 *
 * Switch provider at deploy time via the AI_PROVIDER env var
 * (`doubao` | `deepseek`, default `doubao` for backward compat).
 *
 * Each provider has its own auth + base URL:
 *   - Doubao:    DOUBAO_API_KEY, DOUBAO_BASE_URL, DOUBAO_MODEL
 *   - DeepSeek:  DEEPSEEK_API_KEY, DEEPSEEK_BASE_URL, DEEPSEEK_MODEL
 *
 * If the configured provider is missing its key, the constructor logs
 * a warning and the next chat() call will throw — the route handler
 * catches that and falls back to a friendly "AI not configured" error
 * so users see a clear message instead of a 500.
 */

export type AIProviderName = 'doubao' | 'deepseek';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  /** Override the env-var default model for this call only. */
  model?: string;
  /** Sampling temperature. 0 = deterministic, 1 = creative. Default 0.7. */
  temperature?: number;
  /** Cap on generated tokens. */
  maxTokens?: number;
}

export interface ChatResponse {
  content: string;
  /** Model identifier that produced the response (echoed by the API). */
  model: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface StreamChunk {
  /** Delta text from this chunk (may be empty for finish_reason-only chunks). */
  content: string;
  /** True on the final chunk of the stream. */
  done: boolean;
}

export interface AIProvider {
  readonly name: AIProviderName;
  /** True if the env-var config for this provider is present. */
  readonly isConfigured: boolean;
  /** Non-streaming chat completion. */
  chat(messages: ChatMessage[], options?: ChatOptions): Promise<ChatResponse>;
  /** Streaming chat completion. Yields text deltas. */
  stream(messages: ChatMessage[], options?: ChatOptions): AsyncIterable<StreamChunk>;
}

// ---------------------------------------------------------------------------
// Doubao (Volcengine Ark)
// ---------------------------------------------------------------------------
//
// API docs: https://www.volcengine.com/docs/82379
// OpenAI-compatible endpoint. The default base URL is the public Ark
// gateway; users with dedicated deployments can override via env.
const DOUBAO_DEFAULT_BASE = 'https://ark.cn-beijing.volces.com/api/v3';
const DOUBAO_DEFAULT_MODEL = 'doubao-seed-2-0-lite-260215';

class DoubaoProvider implements AIProvider {
  readonly name = 'doubao' as const;

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly defaultModel: string,
  ) {}

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.defaultModel);
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const res = await this.fetchCompletion(messages, options, false);
    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage?: ChatResponse['usage'];
    };
    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: data.model ?? this.defaultModel,
      usage: data.usage,
    };
  }

  async *stream(messages: ChatMessage[], options: ChatOptions = {}): AsyncIterable<StreamChunk> {
    const res = await this.fetchCompletion(messages, options, true);
    if (!res.body) throw new Error('Doubao: no response body for stream');
    yield* parseOpenAIStream(res.body);
  }

  private async fetchCompletion(
    messages: ChatMessage[],
    options: ChatOptions,
    stream: boolean,
  ): Promise<Response> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model ?? this.defaultModel,
        messages,
        stream,
        temperature: options.temperature ?? 0.7,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      }),
    });
    // Phase 71: surface provider errors instead of swallowing them.
    // A non-2xx (401 bad key, 402 insufficient balance, 404 unknown
    // model) previously fell through: chat() returned empty content
    // and stream() tried to parse the error JSON as SSE, yielding
    // nothing — the route then sent `{raw: ''}` and the admin UI
    // showed a cryptic JSON parse failure. Throw with the provider's
    // own message so the modal shows the real cause.
    if (!res.ok) {
      throw new Error(`Doubao ${await readProviderError(res)}`);
    }
    return res;
  }
}

// ---------------------------------------------------------------------------
// DeepSeek
// ---------------------------------------------------------------------------
//
// API docs: https://api-docs.deepseek.com/
// OpenAI-compatible endpoint. Default model is `deepseek-chat` (V3) for
// general chat. `deepseek-reasoner` (R1) is also available for chain-of-
// thought reasoning — set DEEPSEEK_MODEL=deepseek-reasoner to use it.
const DEEPSEEK_DEFAULT_BASE = 'https://api.deepseek.com/v1';
const DEEPSEEK_DEFAULT_MODEL = 'deepseek-chat';

class DeepSeekProvider implements AIProvider {
  readonly name = 'deepseek' as const;

  constructor(
    private readonly apiKey: string,
    private readonly baseUrl: string,
    private readonly defaultModel: string,
  ) {}

  get isConfigured(): boolean {
    return Boolean(this.apiKey && this.defaultModel);
  }

  async chat(messages: ChatMessage[], options: ChatOptions = {}): Promise<ChatResponse> {
    const res = await this.fetchCompletion(messages, options, false);
    const data = await res.json() as {
      choices: Array<{ message: { content: string } }>;
      model: string;
      usage?: ChatResponse['usage'];
    };
    return {
      content: data.choices?.[0]?.message?.content ?? '',
      model: data.model ?? this.defaultModel,
      usage: data.usage,
    };
  }

  async *stream(messages: ChatMessage[], options: ChatOptions = {}): AsyncIterable<StreamChunk> {
    const res = await this.fetchCompletion(messages, options, true);
    if (!res.body) throw new Error('DeepSeek: no response body for stream');
    yield* parseOpenAIStream(res.body);
  }

  private async fetchCompletion(
    messages: ChatMessage[],
    options: ChatOptions,
    stream: boolean,
  ): Promise<Response> {
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model ?? this.defaultModel,
        messages,
        stream,
        temperature: options.temperature ?? 0.7,
        ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}),
      }),
    });
    // Phase 71: see the Doubao fetchCompletion note — surface
    // provider errors (401/402/404/5xx) with the provider's own
    // message instead of letting them masquerade as empty output.
    if (!res.ok) {
      throw new Error(`DeepSeek ${await readProviderError(res)}`);
    }
    return res;
  }
}

/**
 * Read a failed provider response into a short, human-readable error
 * string: `API error (HTTP 402): Insufficient Balance`. Both Doubao
 * and DeepSeek return OpenAI-style `{ error: { message } }` bodies;
 * fall back to the raw text (capped) when the shape differs.
 */
async function readProviderError(res: Response): Promise<string> {
  let detail = '';
  try {
    const text = await res.text();
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string } };
      detail = parsed.error?.message ?? text;
    } catch {
      detail = text;
    }
  } catch {
    detail = res.statusText;
  }
  return `API error (HTTP ${res.status}): ${detail.slice(0, 300)}`;
}

// ---------------------------------------------------------------------------
// OpenAI-compatible SSE stream parser
// ---------------------------------------------------------------------------
//
// Both Doubao and DeepSeek return Server-Sent Events when stream=true,
// with the same `data: {...}\n\n` envelope. Each chunk is JSON like
//   { choices: [{ delta: { content: '...' } }] }
// The final chunk has `finish_reason: 'stop'` and may have an empty
// delta. Done is signaled by `data: [DONE]` from some providers; we
// also detect finish_reason to be safe.
async function* parseOpenAIStream(body: ReadableStream<Uint8Array>): AsyncIterable<StreamChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE messages are separated by a blank line. Split on \n\n.
      let sep: number;
      while ((sep = buffer.indexOf('\n\n')) !== -1) {
        const raw = buffer.slice(0, sep);
        buffer = buffer.slice(sep + 2);
        const chunk = parseSseMessage(raw);
        if (chunk) yield chunk;
      }
    }
    // Flush any trailing event that didn't end with \n\n.
    if (buffer.trim()) {
      const chunk = parseSseMessage(buffer);
      if (chunk) yield chunk;
    }
  } finally {
    try { reader.releaseLock(); } catch {}
  }
}

function parseSseMessage(raw: string): StreamChunk | null {
  // Each SSE message is one or more `field: value` lines.
  let content = '';
  let done = false;
  for (const line of raw.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (payload === '[DONE]') {
      done = true;
      continue;
    }
    try {
      const parsed = JSON.parse(payload) as {
        choices?: Array<{ delta?: { content?: string }; finish_reason?: string }>;
      };
      const delta = parsed.choices?.[0]?.delta?.content;
      if (delta) content += delta;
      if (parsed.choices?.[0]?.finish_reason) done = true;
    } catch {
      // Some providers send `data:` heartbeats; ignore.
    }
  }
  if (content || done) return { content, done };
  return null;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let cachedProvider: AIProvider | null = null;

/** Return the configured AI provider, instantiating it lazily. */
export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;
  const name = (process.env.AI_PROVIDER ?? 'doubao').toLowerCase() as AIProviderName;
  if (name === 'deepseek') {
    cachedProvider = new DeepSeekProvider(
      process.env.DEEPSEEK_API_KEY ?? '',
      (process.env.DEEPSEEK_BASE_URL ?? DEEPSEEK_DEFAULT_BASE).replace(/\/+$/, ''),
      process.env.DEEPSEEK_MODEL ?? DEEPSEEK_DEFAULT_MODEL,
    );
  } else {
    cachedProvider = new DoubaoProvider(
      process.env.DOUBAO_API_KEY ?? '',
      (process.env.DOUBAO_BASE_URL ?? DOUBAO_DEFAULT_BASE).replace(/\/+$/, ''),
      process.env.DOUBAO_MODEL ?? DOUBAO_DEFAULT_MODEL,
    );
  }
  return cachedProvider;
}

/** Test-only — reset the cached provider so tests can re-init it. */
export function _resetAIProviderForTests() {
  cachedProvider = null;
}
