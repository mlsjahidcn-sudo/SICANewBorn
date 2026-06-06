import { NextRequest } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { buildBlogSystemPrompt, buildBlogUserPrompt } from '@/lib/ai/blog-prompts';
import {
  sanitizeMarkdown,
  scrubThirdPartyAgencies,
  scrubFaq,
  slugify,
  extractJsonObject,
  normalizeBlogPayload,
} from '@/lib/ai/blog-sanitize';

/**
 * POST /api/ai/generate-blog
 *
 * Stream-generates a SICA news post (markdown body) for the given
 * topic + category + length. The response is a Server-Sent Events
 * stream (text/event-stream) so the admin can watch the post
 * materialize live, same pattern as /api/ai/generate-university.
 *
 * Each event is `data: { content: <chunk> }\n\n` for raw text deltas
 * and `data: { parsed: <object> }\n\n` for the final validated
 * JSON object (after the stream finishes).
 *
 * The AI is the writer, not the publisher. The post still has to be
 * reviewed and explicitly published by an admin (status='published')
 * in the admin panel before it goes live at /news/[slug].
 *
 * Body:
 *   { topic: string, category?: string, length?: 'short'|'medium'|'long', language?: 'en'|'zh'|'both',
 *     tone?: string, targetKeyword?: string, slug?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = (body.topic as string)?.trim();
    if (!topic) {
      return new Response(JSON.stringify({ error: 'topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const provider = getAIProvider();
    if (!provider.isConfigured) {
      return new Response(
        JSON.stringify({
          error:
            'AI provider not configured. Set DEEPSEEK_API_KEY or DOUBAO_API_KEY on the server.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const category = (body.category as string) || 'announcement';
    const length = (body.length as 'short' | 'medium' | 'long') || 'medium';
    const language = (body.language as 'en' | 'zh' | 'both') || 'en';
    const tone = (body.tone as string) || 'informational';
    const targetKeyword = (body.targetKeyword as string)?.trim() || '';

    const systemPrompt = buildBlogSystemPrompt({
      category,
      length,
      language,
      tone,
      targetKeyword,
    });
    const userPrompt = buildBlogUserPrompt({ topic, category, targetKeyword });

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        try {
          for await (const chunk of provider.stream(messages, {
            temperature: 0.7,
            // S36: the structured fields (key_takeaways,
            // at_a_glance, faq, sources) take real output tokens
            // on top of the body. Bumped the limits so the model
            // has room to finish the full JSON — the previous
            // 1500/2500/4000 caps truncated mid-content and the
            // parser fell back to raw, losing all the structured
            // fields.
            maxTokens:
              length === 'long' ? 7000 :
              length === 'medium' ? 5000 :
              3000,
          })) {
            if (chunk.content) {
              fullContent += chunk.content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`),
              );
            }
            if (chunk.done) break;
          }

          // Parse the AI's JSON response. Fall back to raw content if
          // parsing fails (the client tries again client-side).
          const jsonStr = extractJsonObject(fullContent);
          if (!jsonStr) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ raw: fullContent })}\n\n`));
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
            return;
          }
          try {
            const parsed = JSON.parse(jsonStr) as Record<string, unknown>;
            const normalized = normalizeBlogPayload(parsed);
            // Emit the same shape the old inline code emitted so the
            // client doesn't have to change. The normalized payload
            // already includes every field the old code massaged.
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ parsed: { ...parsed, ...normalized } })}\n\n`));
          } catch {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ raw: fullContent })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamError) {
          const errorMessage =
            streamError instanceof Error ? streamError.message : 'Stream error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Prompt builders + sanitizers moved to:
//   src/lib/ai/blog-prompts.ts   — buildBlogSystemPrompt, buildBlogUserPrompt
//   src/lib/ai/blog-sanitize.ts  — sanitizeMarkdown, scrubThirdPartyAgencies,
//                                  scrubFaq, slugify, extractJsonObject,
//                                  normalizeBlogPayload
// Both the interactive streaming endpoint (this file) and the
// non-streaming daily cron (/api/cron/generate-news) share them.
