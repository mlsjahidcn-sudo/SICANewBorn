import { NextRequest } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const SYSTEM_PROMPT = `You are a university data generator for a Study in China platform. Given a Chinese university name, generate comprehensive information about it.

You MUST respond with ONLY a valid JSON object (no markdown, no code blocks, no extra text) with the following fields:

{
  "name": "English name of the university",
  "nameCn": "Chinese name of the university",
  "slug": "url-friendly-slug-using-english-name-lowercase-hyphenated",
  "city": "City in English",
  "cityCn": "City in Chinese",
  "ranking": "China ranking number (integer, based on general reputation)",
  "rating": "Rating out of 5 (e.g. 4.7, between 4.0-5.0)",
  "type": "University type in English (e.g. Public University)",
  "typeCn": "University type in Chinese (e.g. 公立大学)",
  "established": "Year established (integer)",
  "students": "Total student count (e.g. 40,000+)",
  "intlStudents": "International student count (e.g. 2,500+)",
  "description": "Detailed English description (3-5 sentences about the university's reputation, strengths, and campus)",
  "descriptionCn": "Detailed Chinese description (3-5 sentences)",
  "popularPrograms": ["Program1", "Program2", "Program3", "Program4", "Program5"],
  "popularProgramsCn": ["项目1", "项目2", "项目3", "项目4", "项目5"],
  "qsWorldRanking": "QS World University Ranking number (integer, approximate latest)",
  "tags": ["985", "211", "Double First Class"],
  "tagsCn": ["985工程", "211工程", "双一流"],
  "accommodation": "English description of on-campus accommodation for international students (2-3 sentences)",
  "accommodationCn": "Chinese description of accommodation",
  "accommodationCost": "Monthly cost range (e.g. ¥800-1,500/month)",
  "accommodationCostCn": "Chinese cost range (e.g. ¥800-1,500/月)",
  "accommodationTypes": ["Single Room", "Double Room", "International Student Dorm"],
  "accommodationTypesCn": ["单人间", "双人间", "留学生宿舍"],
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3", "Highlight 4"],
  "highlightsCn": ["亮点1", "亮点2", "亮点3", "亮点4"],
  "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
  "requirementsCn": ["要求1", "要求2", "要求3"],
  "scholarshipInfo": "English info about available scholarships (2-3 sentences)",
  "scholarshipInfoCn": "Chinese scholarship info",
  "campusLife": "English description of campus life (2-3 sentences)",
  "campusLifeCn": "Chinese campus life description",
  "gallery": ["unsplash url1", "unsplash url2", "unsplash url3", "unsplash url4"],
  "logo": ""
}

Rules:
- For gallery, provide 4 Unsplash photo URLs related to the university or its city (use format: https://images.unsplash.com/photo-XXXXX?w=800)
- For tags, include "985" if it's a 985 university, "211" if it's a 211 university, "Double First Class" if applicable
- For tagsCn, use Chinese equivalents: "985工程", "211工程", "双一流"
- All fields must be present and non-empty (except logo which can be empty string)
- Be accurate with real facts about the university
- Respond with ONLY the JSON object, no other text, no markdown formatting, no code blocks
- Do NOT wrap the JSON in backtick code blocks
- Make sure the JSON is complete and valid - every opening brace must have a closing brace
- Do NOT include trailing commas
- For gallery, use realistic Unsplash photo IDs (e.g. https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800) related to Chinese universities or campus scenes`;

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'University name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Generate complete university information for: ${name.trim()}` },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullContent = '';
        try {
          const llmStream = client.stream(messages, {
            model: 'doubao-seed-2-0-lite-260215',
            temperature: 0.3,
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              fullContent += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
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
          } catch {
            // If server can't parse either, send raw content for client to try
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ raw: fullContent })}\n\n`));
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (streamError) {
          const errorMessage = streamError instanceof Error ? streamError.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
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
