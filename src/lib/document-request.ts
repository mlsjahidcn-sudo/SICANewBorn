/**
 * document-request.ts
 *
 * Phase 177 — shared logic for the admin-only "request missing
 * documents" flow.
 *
 * The flow: an admin opens a student's (or partner student's)
 * Documents tab, ticks the documents that are still missing from a
 * standard checklist, optionally adds a custom one, picks a channel
 * (email / WhatsApp / both) and a language, then sends. The student
 * receives a plain-text list of what to upload.
 *
 * Everything in this module is pure and server-safe: no React, no
 * Supabase client, no `process.env`. The API route imports it to
 * validate + render, the admin dialog imports it to preview, and the
 * vitest suite imports it directly.
 *
 * Two deliberate choices worth knowing about:
 *
 *   1. `items[].category` is constrained to `STUDENT_DOC_CATEGORIES`
 *      (the same closed set `student_documents.category` uses). A
 *      request therefore maps 1:1 onto what the student will later
 *      upload — the category of a requested document is always a
 *      legal category for the uploaded row.
 *
 *   2. The message text is rendered HERE, in code, rather than being
 *      assembled in the API route. The API route owns I/O (fetch the
 *      student, send the email, write the audit row); this module owns
 *      wording. That split is what makes the wording testable without
 *      a database.
 */

import {
  STUDENT_DOC_CATEGORIES,
  type StudentDocCategory,
} from './admin-document-categories';
import { renderTextTemplate } from './email/index';

// ============================================================================
// Types
// ============================================================================

export type DocumentRequestLocale = 'en' | 'zh';

/** One document the admin is asking for. */
export interface DocumentRequestItem {
  name: string;
  category: StudentDocCategory;
  /** Optional per-item instruction ("issued within the last 12 months"). */
  note?: string | null;
}

/** A checklist row the admin can tick. */
export interface DocumentChecklistEntry {
  /** Stable key — used by the UI for selection state. */
  key: string;
  name: string;
  category: StudentDocCategory;
  /** Shown under the name in the admin picker. */
  hint?: string;
}

// ============================================================================
// The standard checklist
// ============================================================================

/**
 * The documents SICA asks for on a Chinese-university application.
 * Deliberately a *document* list (not the category taxonomy): an admin
 * asks for "Passport copy (photo page)", not for the category
 * "Passport". Custom entries outside this list are supported by the
 * UI and fall back to the 'Other' category.
 */
export const STANDARD_DOCUMENT_CHECKLIST: readonly DocumentChecklistEntry[] = [
  { key: 'passport', name: 'Passport copy (photo page)', category: 'Passport' },
  { key: 'passport_pages', name: 'Passport (all pages with stamps)', category: 'Passport' },
  { key: 'transcript', name: 'High school / college transcript', category: 'Transcript' },
  { key: 'transcript_sealed', name: 'Sealed transcript (issued directly by the school)', category: 'Transcript' },
  { key: 'diploma', name: 'Graduation diploma / degree certificate', category: 'Diploma' },
  { key: 'degree_certificate', name: 'Degree certificate (if diploma not yet issued)', category: 'Diploma' },
  { key: 'language_test', name: 'English language test certificate (IELTS / TOEFL / Duolingo)', category: 'Language Test' },
  { key: 'language_test_zh', name: 'Chinese language certificate (HSK)', category: 'Language Test' },
  { key: 'recommendation', name: 'Recommendation letter', category: 'Recommendation' },
  { key: 'personal_statement', name: 'Personal statement / study plan', category: 'Other' },
  { key: 'passport_photo', name: 'Passport photo (white background)', category: 'Other' },
  { key: 'bank_statement', name: 'Bank statement (proof of funds)', category: 'Other' },
  { key: 'medical_report', name: 'Physical examination report', category: 'Other' },
  { key: 'police_clearance', name: 'Police clearance certificate', category: 'Other' },
  { key: 'application_form', name: 'Signed application form', category: 'Other' },
] as const;

/** Longest a single document name may be. */
const MAX_ITEM_NAME = 120;
/** Longest a per-item note may be. */
const MAX_ITEM_NOTE = 300;
/** Most documents one request may list. */
const MAX_ITEMS = 30;
/** Longest the admin's free-form note may be. */
const MAX_EXTRA_NOTE = 2000;
/** Longest a custom checklist entry name may be. */
const MAX_CUSTOM_NAME = 120;

// ============================================================================
// Parsing / validation
// ============================================================================

export interface DocumentRequestPayload {
  /** 'student' → student_id, 'partner' → partner_student_id. */
  targetType: 'student' | 'partner';
  targetId: string;
  items: DocumentRequestItem[];
  channel: 'email' | 'whatsapp' | 'both';
  locale: DocumentRequestLocale;
  /** Free-form note appended to the message (deadline, instructions…). */
  extraNote?: string | null;
  /** Optional application scope. */
  applicationId?: string | null;
  /** Send now, or only record the request. */
  send: boolean;
  /** Also notify the partner agency (partner students only). */
  notifyPartner: boolean;
}

export type DocumentRequestParseResult =
  | { ok: true; value: DocumentRequestPayload }
  | { ok: false; error: string };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value.trim());
}

/**
 * Validate the POST body of /api/admin/documents/requests.
 * Returns the first failure as a 400-friendly message.
 */
export function parseDocumentRequestBody(body: unknown): DocumentRequestParseResult {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { ok: false, error: 'Request body must be a JSON object.' };
  }
  const b = body as Record<string, unknown>;

  const targetTypeRaw = typeof b.targetType === 'string' ? b.targetType.trim() : '';
  if (targetTypeRaw !== 'student' && targetTypeRaw !== 'partner') {
    return { ok: false, error: "targetType must be 'student' or 'partner'." };
  }

  const targetId = typeof b.targetId === 'string' ? b.targetId.trim() : '';
  if (!isUuid(targetId)) {
    return { ok: false, error: 'targetId must be a valid UUID.' };
  }

  const items = parseDocumentRequestItems(b.items);
  if (!items.ok) return items;

  const channelRaw = typeof b.channel === 'string' ? b.channel.trim() : 'email';
  if (channelRaw !== 'email' && channelRaw !== 'whatsapp' && channelRaw !== 'both') {
    return { ok: false, error: "channel must be 'email', 'whatsapp' or 'both'." };
  }

  const localeRaw = typeof b.locale === 'string' ? b.locale.trim() : 'en';
  if (localeRaw !== 'en' && localeRaw !== 'zh') {
    return { ok: false, error: "locale must be 'en' or 'zh'." };
  }

  const extraNote =
    typeof b.extraNote === 'string' ? b.extraNote.trim().slice(0, MAX_EXTRA_NOTE) : null;

  const applicationIdRaw = typeof b.applicationId === 'string' ? b.applicationId.trim() : '';
  if (applicationIdRaw && !isUuid(applicationIdRaw)) {
    return { ok: false, error: 'applicationId must be a valid UUID.' };
  }

  return {
    ok: true,
    value: {
      targetType: targetTypeRaw,
      targetId,
      items: items.value,
      channel: channelRaw,
      locale: localeRaw,
      extraNote: extraNote || null,
      applicationId: applicationIdRaw || null,
      send: b.send !== false,
      notifyPartner: b.notifyPartner === true,
    },
  };
}

export type DocumentRequestItemsResult =
  | { ok: true; value: DocumentRequestItem[] }
  | { ok: false; error: string };

/**
 * Validate the `items` array. Each entry needs a `name`; `category` is
 * optional and defaults to 'Other' (the catch-all bucket) so a custom
 * document name never has to be categorised by the admin.
 */
export function parseDocumentRequestItems(input: unknown): DocumentRequestItemsResult {
  if (!Array.isArray(input)) {
    return { ok: false, error: 'items must be an array.' };
  }
  if (input.length === 0) {
    return { ok: false, error: 'Select at least one missing document.' };
  }
  if (input.length > MAX_ITEMS) {
    return { ok: false, error: `A request can list at most ${MAX_ITEMS} documents.` };
  }

  const out: DocumentRequestItem[] = [];
  const seen = new Set<string>();

  for (const raw of input) {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
      return { ok: false, error: 'Each item must be an object.' };
    }
    const r = raw as Record<string, unknown>;

    const name = typeof r.name === 'string' ? r.name.trim() : '';
    if (!name) {
      return { ok: false, error: 'Each item needs a name.' };
    }
    if (name.length > MAX_ITEM_NAME) {
      return { ok: false, error: `Document name is too long (max ${MAX_ITEM_NAME} characters).` };
    }

    const categoryRaw = typeof r.category === 'string' ? r.category.trim() : '';
    const category: StudentDocCategory =
      (STUDENT_DOC_CATEGORIES as readonly string[]).includes(categoryRaw)
        ? (categoryRaw as StudentDocCategory)
        : 'Other';

    const note =
      typeof r.note === 'string' && r.note.trim() ? r.note.trim().slice(0, MAX_ITEM_NOTE) : null;

    // Duplicates (same name, case-insensitive) are collapsed rather than
    // rejected — the admin may have picked a checklist row AND added a
    // custom row with the same wording.
    const dedupeKey = name.toLowerCase();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    out.push({ name, category, note });
  }

  if (out.length === 0) {
    return { ok: false, error: 'Select at least one missing document.' };
  }
  return { ok: true, value: out };
}

/**
 * Validate a custom (free-text) checklist entry the admin typed in.
 * Returns the trimmed name, or null when the input is unusable.
 */
export function parseCustomDocumentName(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const name = input.trim();
  if (!name) return null;
  return name.slice(0, MAX_CUSTOM_NAME);
}

// ============================================================================
// Phone → WhatsApp
// ============================================================================

/**
 * Normalize a phone number into the digit-only form `wa.me` expects.
 *
 * Rules (deliberately conservative):
 *   - strip spaces, dashes, dots, parentheses, slashes
 *   - drop a leading `+`
 *   - keep a leading `00` international prefix only if it is followed
 *     by digits (converted to the bare country code)
 *
 * Returns null when fewer than 7 digits remain — a wa.me link with a
 * 4-digit number opens a broken chat, which is worse than no link.
 */
export function normalizePhoneForWhatsApp(phone: string | null | undefined): string | null {
  if (typeof phone !== 'string') return null;
  let digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.length < 7) return null;
  return digits;
}

/**
 * Build a `wa.me` deep link with the message pre-filled. Returns null
 * when the phone number is unusable.
 */
export function buildWhatsAppUrl(
  phone: string | null | undefined,
  message: string,
): string | null {
  const digits = normalizePhoneForWhatsApp(phone);
  if (!digits) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// ============================================================================
// Template rendering
// ============================================================================

/**
 * Render `{{#if var}}…{{else}}…{{/if}}` blocks, then hand the result to
 * the shared `renderTextTemplate` for `{{var}}` substitution.
 *
 * Deliberately NOT added to `src/lib/email/index.ts`: that helper is
 * shared by every drip + status email in the system, and changing its
 * regex could alter the output of templates that were written before
 * this feature existed. A local renderer keeps the blast radius at
 * exactly the two new templates.
 *
 * `{{#if}}` blocks are non-nested (one level). A variable is truthy when
 * it is not null/undefined/'' /false.
 */
export function renderConditionalText(
  body: string,
  variables: Record<string, string | number | boolean | null | undefined>,
): string {
  const withConditionals = body.replace(
    /\{\{#if\s+([\w.]+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, key: string, inner: string) => {
      const value = variables[key];
      const truthy = !(value == null || value === '' || value === false);
      if (!truthy) return '';
      const elseIndex = inner.indexOf('{{else}}');
      if (elseIndex === -1) return inner;
      return inner.slice(0, elseIndex);
    },
  );
  return renderTextTemplate(withConditionals, variables);
}

// ============================================================================
// Message builders
// ============================================================================

export interface DocumentRequestContext {
  studentName: string;
  /** Applied university (optional). */
  university?: string | null;
  /** Applied program (optional). */
  program?: string | null;
  /** Intake period (optional). */
  intake?: string | null;
  /** The admin's free-form note (optional). */
  extraNote?: string | null;
  /** Where the student uploads. */
  portalUrl: string;
}

/**
 * The numbered list of requested documents. Note that a per-item note
 * is appended after an em dash so the student knows what "good" looks
 * like ("High school transcript — issued within the last 12 months").
 */
export function buildDocumentListText(
  items: readonly DocumentRequestItem[],
  locale: DocumentRequestLocale,
): string {
  return items
    .map((item, index) => {
      const suffix = item.note ? ` — ${item.note}` : '';
      return `${index + 1}. ${item.name}${suffix}`;
    })
    .join('\n');
}

/**
 * The "Applied university / program / intake" block. Returns '' when
 * nothing is known, so the caller can drop it cleanly.
 */
export function buildApplicationContextText(
  context: Pick<DocumentRequestContext, 'university' | 'program' | 'intake'>,
  locale: DocumentRequestLocale,
): string {
  const lines: string[] = [];
  if (context.university && context.university.trim()) {
    lines.push(locale === 'zh' ? `申请院校：${context.university.trim()}` : `Applied university: ${context.university.trim()}`);
  }
  if (context.program && context.program.trim()) {
    lines.push(locale === 'zh' ? `申请专业：${context.program.trim()}` : `Applied program: ${context.program.trim()}`);
  }
  if (context.intake && context.intake.trim()) {
    lines.push(locale === 'zh' ? `入学时间：${context.intake.trim()}` : `Intake: ${context.intake.trim()}`);
  }
  return lines.join('\n');
}

/**
 * Build the variables shared by the email template and the WhatsApp
 * message. Both renderings use the SAME item list and context, so the
 * admin never sees two different document lists side by side.
 */
export function buildDocumentRequestVariables(
  items: readonly DocumentRequestItem[],
  context: DocumentRequestContext,
  locale: DocumentRequestLocale,
): Record<string, string> {
  const applicationContext = buildApplicationContextText(context, locale);
  return {
    studentName: context.studentName.trim() || (locale === 'zh' ? '同学' : 'there'),
    documentCount: String(items.length),
    documentList: buildDocumentListText(items, locale),
    context: applicationContext,
    extraNote: context.extraNote && context.extraNote.trim() ? context.extraNote.trim() : '',
    university: context.university || '',
    program: context.program || '',
    intake: context.intake || '',
    portalUrl: context.portalUrl,
  };
}

/**
 * The WhatsApp message. WhatsApp renders `*text*` as bold, so the
 * headings are wrapped — the email body deliberately does NOT use
 * markers, because plain-text email would show the asterisks.
 */
export function buildWhatsAppMessage(
  items: readonly DocumentRequestItem[],
  context: DocumentRequestContext,
  locale: DocumentRequestLocale,
): string {
  const variables = buildDocumentRequestVariables(items, context, locale);
  const contextBlock = variables.context ? `\n\n${variables.context}` : '';
  const noteBlock = variables.extraNote ? `\n\n${variables.extraNote}` : '';

  if (locale === 'zh') {
    return [
      `${variables.studentName} 您好，`,
      '我们正在审核您的 SICA 申请，还需要补充以下材料才能继续。',
      '*需要补交的材料：*',
      variables.documentList,
      `${contextBlock}${noteBlock}`,
      `请登录学生门户上传：${variables.portalUrl}`,
      '如果其中某项材料暂时无法提供，请直接回复本消息告诉我们，我们会协助寻找替代方案。',
      '— SICA 招生团队',
    ]
      .filter((part) => part !== '')
      .join('\n\n');
  }

  return [
    `Hi ${variables.studentName},`,
    'We are reviewing your SICA application and need a few more documents before we can continue.',
    '*Documents we still need:*',
    variables.documentList,
    `${contextBlock}${noteBlock}`,
    `Please upload them to your student portal: ${variables.portalUrl}`,
    'If any of these documents are not available to you, reply to this message and tell us — we will find an alternative.',
    '— SICA Admissions Team',
  ]
    .filter((part) => part !== '')
    .join('\n\n');
}

/**
 * Default email subject. Used when the DB template has no subject of
 * its own or when the admin overrides it.
 */
export function buildDefaultEmailSubject(
  items: readonly DocumentRequestItem[],
  locale: DocumentRequestLocale,
): string {
  const count = items.length;
  if (locale === 'zh') {
    return `需要补交材料：你的 SICA 申请还缺 ${count} 份文件`;
  }
  return `Action needed: ${count} document${count === 1 ? '' : 's'} still needed for your SICA application`;
}

/**
 * Build the portal URL a student uploads to.
 */
export function buildStudentPortalUrl(siteUrl: string, applicationId?: string | null): string {
  const base = `${siteUrl.replace(/\/+$/, '')}/student/documents`;
  return applicationId ? `${base}?applicationId=${applicationId}` : base;
}
