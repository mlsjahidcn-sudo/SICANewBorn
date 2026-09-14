/**
 * Phase 89: OCR prompt builders for passport + high-school-transcript
 * extraction. Output is a strict JSON object — the extractor route
 * pipes the model's response through `extractJsonObject` +
 * `normalizePassportOcrPayload` / `normalizeTranscriptOcrPayload`
 * (src/lib/ai/ocr-sanitize.ts) to handle preamble / markdown
 * fences the model adds.
 *
 * Temperature is set low (0.1) by the caller — OCR benefits from
 * deterministic, low-creativity decoding. Confidence is per-field
 * (0..1) so the admin UI can flag low-confidence rows for review.
 */

import type { VisionContentPart } from '@/lib/ai/provider';

const PASSPORT_SCHEMA_DESCRIPTION = `{
  "firstName": "string or null — Given names as shown on the passport (Latin transliteration preferred).",
  "lastName": "string or null — Family name (Latin transliteration preferred).",
  "dateOfBirth": "YYYY-MM-DD or null — Use ISO date format. If only year/month/day in non-Gregorian calendar, convert to Gregorian.",
  "nationality": "string or null — English country name in canonical form (e.g. 'China', 'United States', 'Nigeria').",
  "passportNumber": "string or null — Document number exactly as printed (uppercase, no spaces).",
  "gender": "Male | Female | Other or null — Use 'Male' or 'Female' if printed; 'Other' if ambiguous.",
  "passportIssueDate": "YYYY-MM-DD or null",
  "passportExpiryDate": "YYYY-MM-DD or null",
  "confidence": {
    "firstName": 0..1, "lastName": 0..1, "dateOfBirth": 0..1, "nationality": 0..1,
    "passportNumber": 0..1, "gender": 0..1, "passportIssueDate": 0..1, "passportExpiryDate": 0..1
  }
}`;

const TRANSCRIPT_SCHEMA_DESCRIPTION = `{
  "highSchoolName": "string or null — School name (in original language or transliterated English).",
  "highSchoolCity": "string or null",
  "highSchoolCountry": "string or null",
  "highSchoolGPA": "string or null — Keep the original scale (e.g. '3.7/4.0', '85/100', 'A'). If unclear, null.",
  "highSchoolGraduationDate": "YYYY-MM-DD or null — Use the graduation year + month + day if available; YYYY-01 otherwise.",
  "confidence": {
    "highSchoolName": 0..1, "highSchoolCity": 0..1, "highSchoolCountry": 0..1,
    "highSchoolGPA": 0..1, "highSchoolGraduationDate": 0..1
  }
}`;

const COMMON_RULES = `Rules:
- Output ONLY the JSON object — no markdown fences, no preamble, no trailing prose.
- If a field is unreadable, blurry, or you're not confident, set it to null (do NOT guess).
- Dates MUST be ISO YYYY-MM-DD. If only the year is legible, use YYYY-01-01.
- Names should be in Latin transliteration (the form expects ASCII-friendly storage).
- Confidence is your self-reported certainty for each field (0 = guessing, 1 = certain).
- Be conservative — a wrong field is worse for an admin than an empty one.`;

/**
 * Build the system + user prompt for passport OCR. The caller is
 * responsible for appending the image_url content part to `user`
 * (with the file as base64 data URL) before sending to the model.
 */
export function buildPassportOcrPrompt(): {
  system: string;
  user: VisionContentPart[];
} {
  const system =
    'You are an OCR specialist for international passport documents.\n\n' +
    `Return a JSON object matching this schema:\n${PASSPORT_SCHEMA_DESCRIPTION}\n\n${COMMON_RULES}`;
  const user: VisionContentPart[] = [
    {
      type: 'text',
      text: 'Extract the passport fields from this image. Return only the JSON.',
    },
  ];
  return { system, user };
}

/**
 * Build the system + user prompt for high-school-transcript OCR.
 * Single-page only — multi-page PDFs are rejected at the client.
 */
export function buildTranscriptOcrPrompt(): {
  system: string;
  user: VisionContentPart[];
} {
  const system =
    'You are an OCR specialist for international high-school transcripts.\n\n' +
    `Return a JSON object matching this schema:\n${TRANSCRIPT_SCHEMA_DESCRIPTION}\n\n${COMMON_RULES}`;
  const user: VisionContentPart[] = [
    {
      type: 'text',
      text: 'Extract the high-school transcript fields from this page. Return only the JSON.',
    },
  ];
  return { system, user };
}

/**
 * Type that the upload-url + extract routes' UI consumer expects. The
 * 'image_url' part is appended to the user array inside the route,
 * after the file is downloaded from Storage.
 */
export type { VisionContentPart };