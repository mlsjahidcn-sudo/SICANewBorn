import { NextRequest } from 'next/server';
import { requireAdmin, getServerEnv } from '@/lib/supabase-auth';
import { checkAdminAIRateLimit } from '@/lib/ai/admin-ai-rate-limit';
import { downloadOcrFile } from '@/lib/ocr-storage';
import { captureAIError } from '@/lib/ai/with-capture';
import { getAIProvider } from '@/lib/ai/provider';
import {
  buildPassportOcrPrompt,
  buildTranscriptOcrPrompt,
  buildResumeOcrPrompt,
} from '@/lib/ai/ocr-prompt';
import {
  extractJsonObject,
  normalizePassportOcrPayload,
  normalizeTranscriptOcrPayload,
  normalizeResumeOcrPayload,
} from '@/lib/ai/ocr-sanitize';
import { isTranscriptLevel } from '@/components/admin/ocr-result-types';
import type { TranscriptLevel } from '@/components/admin/ocr-result-types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/students/ocr/extract
 *
 * Phase 89 / edit-OCR: second step of the 2-step OCR flow.
 *
 * Body: {
 *   kind: 'passport' | 'transcript' | 'resume',
 *   level?: 'high_school' | 'bachelor' | 'master',  // required when kind=transcript
 *   storagePath: string,
 *   fileType: string
 * }
 * Response: SSE stream
 *   data: {status, progress}\n\n
 *   data: {parsed: PassportOcrResult | TranscriptOcrResult | ResumeOcrResult}\n\n
 *   data: {error: string}\n\n
 *   data: [DONE]\n\n
 *
 * Admin-only, rate-limited (shared bucket with upload-url — 15/15min).
 */
export async function POST(request: NextRequest) {
  if (!getServerEnv().serviceKey) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return new Response(
      JSON.stringify({ error: auth.error }),
      { status: auth.status, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const rl = checkAdminAIRateLimit(auth.user.id, 'student-ocr');
  if (rl.blocked) {
    return rl.response;
  }

  let body: {
    kind?: string;
    level?: string;
    storagePath?: string;
    fileType?: string;
  };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { kind, storagePath, fileType } = body;
  if (kind !== 'passport' && kind !== 'transcript' && kind !== 'resume') {
    return new Response(
      JSON.stringify({
        error: 'kind must be "passport", "transcript", or "resume"',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let transcriptLevel: TranscriptLevel = 'high_school';
  if (kind === 'transcript') {
    if (body.level == null || body.level === '') {
      // Backward-compat: Phase 89 callers omitted level → high_school
      transcriptLevel = 'high_school';
    } else if (!isTranscriptLevel(body.level)) {
      return new Response(
        JSON.stringify({
          error:
            'level must be "high_school", "bachelor", or "master" when kind is "transcript"',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    } else {
      transcriptLevel = body.level;
    }
  }

  if (typeof storagePath !== 'string' || !storagePath.startsWith('ocr-tmp-')) {
    return new Response(
      JSON.stringify({ error: 'Invalid storagePath' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (typeof fileType !== 'string') {
    return new Response(
      JSON.stringify({ error: 'Invalid fileType' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const provider = getAIProvider();
  if (!provider.isConfigured) {
    return new Response(
      JSON.stringify({ error: 'AI provider not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const emit = (event: object) =>
        controller.enqueue(enc.encode(`data: ${JSON.stringify(event)}\n\n`));

      try {
        emit({ status: 'extracting', progress: 'Reading file...' });
        const buffer = await downloadOcrFile(storagePath);
        if (!buffer) {
          throw new Error('Failed to download uploaded file from storage');
        }

        const base64 = buffer.toString('base64');
        const dataUrl = `data:${fileType};base64,${base64}`;

        emit({ status: 'extracting', progress: 'Sending to AI...' });
        const { system, user } =
          kind === 'passport'
            ? buildPassportOcrPrompt()
            : kind === 'resume'
              ? buildResumeOcrPrompt()
              : buildTranscriptOcrPrompt(transcriptLevel);
        // Append the image content part after the instruction text
        const userMessages = [
          ...user,
          { type: 'image_url' as const, image_url: { url: dataUrl } },
        ];

        const response = await provider.visionChat(
          [
            { role: 'system', content: system },
            { role: 'user', content: userMessages },
          ],
          { temperature: 0.1, maxTokens: 1500 },
        );

        emit({ status: 'extracting', progress: 'Parsing response...' });
        const jsonText = extractJsonObject(response.content);
        if (!jsonText) {
          throw new Error('Model returned no parseable JSON');
        }

        let parsed: unknown;
        try {
          parsed = JSON.parse(jsonText);
        } catch (err) {
          throw new Error(
            `JSON parse failed: ${err instanceof Error ? err.message : 'unknown'}`,
          );
        }

        const normalized =
          kind === 'passport'
            ? normalizePassportOcrPayload(parsed)
            : kind === 'resume'
              ? normalizeResumeOcrPayload(parsed)
              : normalizeTranscriptOcrPayload(parsed, transcriptLevel);

        emit({ parsed: normalized });
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
      } catch (err) {
        captureAIError('admin-student-ocr', err, {
          stage: 'extract',
          kind,
          level: kind === 'transcript' ? transcriptLevel : undefined,
          fileType,
          responseLength: 0,
        });
        const message = err instanceof Error ? err.message : 'OCR failed';
        emit({ error: message });
        controller.enqueue(enc.encode('data: [DONE]\n\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
