import { NextRequest, NextResponse } from 'next/server';
import { getAIProvider } from '@/lib/ai/provider';
import { captureAIError } from '@/lib/ai/with-capture';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';
import { getRequestAuth } from '@/lib/supabase-auth';

const SYSTEM_PROMPT = `You are a university data generator for a Study in China platform. Given a Chinese university name, generate comprehensive information about it.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text) with EXACTLY these field names and shapes:

{
  "name": "English name of the university (string)",
  "nameCn": "Chinese name of the university (string)",
  "slug": "url-friendly-slug-using-english-name-lowercase-hyphenated (string, ASCII only)",
  "city": "City in English (string)",
  "cityCn": "City in Chinese (string)",
  "ranking": "China ranking number (integer, e.g. 1, 5, 20)",
  "rating": "Rating out of 5 as a NUMBER, e.g. 4.7 (not a string)",
  "type": "University type in English (e.g. Public University)",
  "typeCn": "University type in Chinese (e.g. 公立大学)",
  "established": "Year established as INTEGER, e.g. 1911",
  "students": "Total student count as a string with comma and plus, e.g. 40,000+",
  "intlStudents": "International student count as a string with comma and plus, e.g. 2,500+",
  "description": "Detailed English description (3-5 sentences about the university's reputation, strengths, and campus)",
  "descriptionCn": "Detailed Chinese description (3-5 sentences)",
  "popularPrograms": ["Program 1", "Program 2", "Program 3", "Program 4", "Program 5"],
  "popularProgramsCn": ["项目1", "项目2", "项目3", "项目4", "项目5"],
  "tuitionUndergrad": "Undergraduate annual tuition as a string, e.g. ¥25,000-40,000/year or $3,500-5,000/year",
  "tuitionGraduate": "Graduate annual tuition as a string, e.g. ¥30,000-50,000/year or $4,000-6,000/year",
  "intake": "Intake months in English (e.g. 'September (main); February/March (limited)')",
  "intakeCn": "Intake months in Chinese (e.g. '九月（主入学）；二/三月（部分项目）')",
  "disciplines": ["Engineering", "Business", "Computer Science", "Medicine"],
  "qsRanking": "QS Asia University Ranking as a string (e.g. '5' or '15')",
  "qsWorldRanking": "QS World University Ranking as INTEGER, e.g. 14, 25, 100",
  "tags": ["985", "211", "Double First Class"],
  "tagsCn": ["985工程", "211工程", "双一流"],
  "accommodation": "English description of on-campus accommodation for international students (2-3 sentences)",
  "accommodationCn": "Chinese description of accommodation",
  "accommodationCost": "Monthly cost range (e.g. ¥800-1,500/month)",
  "accommodationCostCn": "Chinese cost range (e.g. ¥800-1,500/月)",
  "accommodationTypes": ["Single Room", "Double Room", "International Student Dorm"],
  "accommodationTypesCn": ["单人间", "双人间", "留学生宿舍"],
  "highlights": {
    "en": ["English highlight 1", "English highlight 2", "English highlight 3", "English highlight 4"],
    "zh": ["亮点1", "亮点2", "亮点3", "亮点4"]
  },
  "scholarshipInfo": "University-specific scholarship narrative in English. 2-3 sentences about the named scholarship portfolio this university administers (e.g. 'Tsinghua's Schwarzman Scholars and university merit awards cover up to 100% of tuition for top applicants').",
  "scholarshipInfoCn": "Same in Chinese (2-3 sentences)",
  "applicationDeadline": "Next application deadline as ISO 8601 date string. Use a date ~2-3 months in the future from today (e.g. '2026-09-30'). Powers the live countdown timer on the detail page.",
  "gallery": ["https://images.unsplash.com/photo-XXXXXXXX?w=800", "url2", "url3", "url4"],
  "image": "Main campus/building photo URL (string)",
  "logo": "University logo URL (string, can be empty if not available)"
}

CRITICAL field shape rules:
- "ranking" must be an INTEGER (1, 5, 20) — NOT a string
- "rating" must be a NUMBER (4.7) — NOT a string
- "established" must be an INTEGER (year) — NOT a string
- "qsWorldRanking" must be an INTEGER — NOT a string
- "students" and "intlStudents" must be STRINGS with comma and plus (e.g. "40,000+")
- "highlights" MUST be an OBJECT with "en" and "zh" arrays — NOT a flat array
- "popularPrograms" and "popularProgramsCn" must be ARRAYS of strings
- "accommodationTypes" and "accommodationTypesCn" must be ARRAYS of strings
- "tags" and "tagsCn" must be ARRAYS of strings

Rules:
- For gallery, provide 4 Unsplash photo URLs related to the university or its city (use format: https://images.unsplash.com/photo-XXXXX?w=800)
- For image, use one of the gallery URLs (the first one is usually best)
- For tags, include "985" if it's a 985 university, "211" if it's a 211 university, "Double First Class" if applicable
- For tagsCn, use Chinese equivalents: "985工程", "211工程", "双一流"
- For disciplines, use one of: Engineering, Computer Science, Business, Medicine, Sciences, Humanities, Arts, Law, Education, Agriculture
- All fields must be present and non-empty (except logo which can be empty string)
- Be accurate with real facts about the university
- Respond with ONLY the JSON object, no other text, no markdown formatting, no code blocks
- Do NOT wrap the JSON in backtick code blocks
- Make sure the JSON is complete and valid - every opening brace must have a closing brace
- Do NOT include trailing commas
- For gallery, use realistic Unsplash photo IDs (e.g. https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800) related to Chinese universities or campus scenes`;

export async function POST(request: NextRequest) {
  // Phase 36: gate on admin auth. The admin modal already runs from
  // the admin layout, so this just enforces that the Bearer token is
  // present + valid — closes a Phase-1-era security gap where this
  // route was callable without any auth (anyone could burn the
  // provider quota). Returns 401 + 503 the same shape as the existing
  // getRequestAuth contract so the client error path is unchanged.
  const auth = await getRequestAuth(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  // Per-admin rate limit (10/15min). Auth above guarantees a real
  // user.id for the bucket key, so an admin can't burn quota by
  // rotating IPs or rotating sessions.
  const rl = checkAdminAIRateLimit(auth.user.id, 'generate-university');
  if (rl.blocked) return rl.response;

  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'University name is required' }), {
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

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Generate complete university information for: ${name.trim()}` },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        try {
          // Lower temperature for structured JSON output; max_tokens
          // cap protects against runaway generations on long university
          // descriptions in either language.
          for await (const chunk of provider.stream(messages, {
            temperature: 0.3,
            maxTokens: 4000,
          })) {
            if (chunk.content) {
              fullContent += chunk.content;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`),
              );
            }
            if (chunk.done) break;
          }

          // Server-side JSON validation and repair
          let jsonStr = fullContent.trim();
          // Remove markdown code blocks
          jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
          // Extract JSON object
          const firstBrace = jsonStr.indexOf('{');
          const lastBrace = jsonStr.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
          }
          // Remove trailing commas
          jsonStr = jsonStr.replace(/,\s*([}\]])/g, '$1');

          try {
            const parsed = JSON.parse(jsonStr);
            // Send validated parsed JSON as final event
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ parsed })}\n\n`));
          } catch (parseError) {
            // Phase 36: capture AI parse failures (the user's explicit
            // ask) — "empty / malformed" is the most common AI failure
            // mode here. We still send raw content for the client to try.
            captureAIError('ai-generate-university', parseError, {
              stage: 'parse',
              universityName: name.trim(),
              responseLength: fullContent.length,
            });
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ raw: fullContent })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamError) {
          // Phase 36: capture stream-level failures (network timeout,
          // provider 5xx, socket teardown). The client gets the same
          // error event either way; this just keeps Sentry informed.
          captureAIError('ai-generate-university', streamError, {
            stage: 'stream',
            universityName: name.trim(),
          });
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
    // Phase 36: capture pre-stream errors (request body parse, etc.).
    captureAIError('ai-generate-university', error, { stage: 'request' });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
