/**
 * Phase 89 / edit-OCR: OCR prompt builders for passport, leveled
 * transcripts (high school / bachelor / master), and resume/CV.
 * Output is a strict JSON object — the extractor route pipes the
 * model's response through `extractJsonObject` + the matching
 * normalizer in `src/lib/ai/ocr-sanitize.ts`.
 *
 * Temperature is set low (0.1) by the caller — OCR benefits from
 * deterministic, low-creativity decoding. Confidence is per-field
 * (0..1) so the admin UI can flag low-confidence rows for review.
 */

import type { VisionContentPart } from '@/lib/ai/provider';
import type { TranscriptLevel } from '@/components/admin/ocr-result-types';

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

const HIGH_SCHOOL_TRANSCRIPT_SCHEMA = `{
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

const BACHELOR_TRANSCRIPT_SCHEMA = `{
  "bachelorUniversityName": "string or null — University / college name.",
  "bachelorMajor": "string or null — Major / programme of study.",
  "bachelorGPA": "string or null — Keep the original scale (e.g. '3.7/4.0', '85/100', 'A'). If unclear, null.",
  "bachelorGraduationDate": "YYYY-MM-DD or null — Graduation or expected graduation; year-only → YYYY-01-01.",
  "confidence": {
    "bachelorUniversityName": 0..1, "bachelorMajor": 0..1,
    "bachelorGPA": 0..1, "bachelorGraduationDate": 0..1
  }
}`;

const MASTER_TRANSCRIPT_SCHEMA = `{
  "masterUniversityName": "string or null — University / graduate school name.",
  "masterMajor": "string or null — Major / programme of study.",
  "masterGPA": "string or null — Keep the original scale (e.g. '3.7/4.0', '85/100', 'A'). If unclear, null.",
  "masterGraduationDate": "YYYY-MM-DD or null — Graduation or expected graduation; year-only → YYYY-01-01.",
  "confidence": {
    "masterUniversityName": 0..1, "masterMajor": 0..1,
    "masterGPA": 0..1, "masterGraduationDate": 0..1
  }
}`;

const RESUME_SCHEMA_DESCRIPTION = `{
  "firstName": "string or null — Given name (Latin transliteration preferred).",
  "lastName": "string or null — Family name.",
  "email": "string or null — Primary contact email.",
  "phone": "string or null — Phone number as printed (include country code if present).",
  "whatsapp": "string or null — WhatsApp number if listed separately from phone; otherwise null (do NOT copy phone into whatsapp).",
  "address": "string or null — Full street / mailing address if present.",
  "city": "string or null",
  "country": "string or null — English country name in canonical form when possible.",
  "partnerInfo": "string or null — Parent / guardian / emergency-contact block. Format as short readable lines, e.g. 'Parent: Name · Phone · Address'. Null when absent. Do NOT invent family members.",
  "confidence": {
    "firstName": 0..1, "lastName": 0..1, "email": 0..1, "phone": 0..1,
    "whatsapp": 0..1, "address": 0..1, "city": 0..1, "country": 0..1, "partnerInfo": 0..1
  }
}`;

const COMMON_RULES = `Rules:
- Output ONLY the JSON object — no markdown fences, no preamble, no trailing prose.
- If a field is unreadable, blurry, or you're not confident, set it to null (do NOT guess).
- Dates MUST be ISO YYYY-MM-DD. If only the year is legible, use YYYY-01-01.
- Names should be in Latin transliteration (the form expects ASCII-friendly storage).
- Confidence is your self-reported certainty for each field (0 = guessing, 1 = certain).
- Be conservative — a wrong field is worse for an admin than an empty one.
- Do NOT invent SICA offers, scholarships, prices, or deadlines.`;

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

const TRANSCRIPT_LEVEL_META: Record<
  TranscriptLevel,
  { role: string; schema: string; userText: string }
> = {
  high_school: {
    role: 'international high-school transcripts',
    schema: HIGH_SCHOOL_TRANSCRIPT_SCHEMA,
    userText:
      'Extract the high-school transcript fields from this page. Return only the JSON.',
  },
  bachelor: {
    role: 'bachelor / undergraduate transcripts and degree certificates',
    schema: BACHELOR_TRANSCRIPT_SCHEMA,
    userText:
      'Extract the bachelor / undergraduate transcript fields from this page. Return only the JSON.',
  },
  master: {
    role: 'master / graduate transcripts and degree certificates',
    schema: MASTER_TRANSCRIPT_SCHEMA,
    userText:
      'Extract the master / graduate transcript fields from this page. Return only the JSON.',
  },
};

/**
 * Build the system + user prompt for leveled transcript OCR.
 * Defaults to high_school for backward compatibility with Phase 89.
 * Single-page only — multi-page PDFs are rejected at the client.
 */
export function buildTranscriptOcrPrompt(
  level: TranscriptLevel = 'high_school',
): {
  system: string;
  user: VisionContentPart[];
} {
  const meta = TRANSCRIPT_LEVEL_META[level];
  const system =
    `You are an OCR specialist for ${meta.role}.\n\n` +
    `Return a JSON object matching this schema:\n${meta.schema}\n\n${COMMON_RULES}`;
  const user: VisionContentPart[] = [
    {
      type: 'text',
      text: meta.userText,
    },
  ];
  return { system, user };
}

/**
 * Build the system + user prompt for resume / CV OCR — contact
 * fields + parent/guardian block into partnerInfo.
 */
export function buildResumeOcrPrompt(): {
  system: string;
  user: VisionContentPart[];
} {
  const system =
    'You are an OCR specialist for student resumes and CVs.\n\n' +
    `Return a JSON object matching this schema:\n${RESUME_SCHEMA_DESCRIPTION}\n\n${COMMON_RULES}`;
  const user: VisionContentPart[] = [
    {
      type: 'text',
      text:
        'Extract contact and parent/guardian fields from this resume/CV. Return only the JSON.',
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
