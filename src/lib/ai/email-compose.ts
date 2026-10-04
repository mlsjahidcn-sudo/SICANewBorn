/**
 * AI email composer for the admin "Send email" dialog (Phase 136).
 *
 * The admin types a theme ("remind them about the WhatsApp group",
 * "follow up on their CSC scholarship question") and the AI drafts a
 * subject + plain-text body that weaves in the RIGHT links from the
 * site — never all of them, never invented ones.
 *
 * Lives in lib (not the route) so the prompt, the link library, and
 * the JSON extractor can be unit-tested — same split as Phase 127's
 * program-parse-sanitize and Phase 128+'s university-refine-sanitize.
 */
import { WHATSAPP_PHONE, WHATSAPP_GROUP_URL } from '@/lib/contact';
import { SITE_URL } from '@/lib/site-url';

/** Context the AI gets about the recipient (all fields optional). */
export interface EmailComposeContext {
  /** The admin's theme / instruction — the only required input. */
  theme: string;
  recipientName?: string;
  country?: string;
  /** Where the contact came from: contact form / chat / assessment / student portal. */
  sourceKind?: string;
  /** Extra free-form context (e.g. the lead's original message). */
  notes?: string;
}

export interface ComposedEmailDraft {
  subject: string;
  body: string;
}

/**
 * The links the AI may use, with one-line usage notes. Kept as code
 * (not env) because every URL here is public on the site — the
 * single source of truth for each lives in lib (contact.ts /
 * site-url.ts) or the App Router itself.
 */
export function composeLinkLibrary(): string {
  const lines = [
    `1. WhatsApp group (student community, always relevant as a soft CTA):`,
    `   ${WHATSAPP_GROUP_URL}&utm_source=email&utm_medium=admin&utm_campaign=outreach`,
    `2. WhatsApp 1:1 chat with a SICA advisor (use when the theme is "talk to us" / "questions"):`,
    `   https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent('Hi SICA, I received your email and have a question.')}`,
    `3. Book a FREE 10-minute online consultation (use when inviting them to talk):`,
    `   ${SITE_URL}/counselling`,
    `4. Contact page (general enquiries):`,
    `   ${SITE_URL}/contact`,
    `5. Free academic assessment (profile + transcript review):`,
    `   ${SITE_URL}/assessment`,
    `6. Browse universities:`,
    `   ${SITE_URL}/universities`,
    `7. Scholarships:`,
    `   ${SITE_URL}/scholarships`,
    `8. Browse programs:`,
    `   ${SITE_URL}/programs`,
    `9. How to apply guide:`,
    `   ${SITE_URL}/guides/application`,
  ];
  return lines.join('\n');
}

export function buildComposeSystemPrompt(): string {
  return `You are an email copywriter for SICA (Study in China Academy), a platform that helps international students apply to Chinese universities. You write short, warm, professional outreach emails to leads and students.

You receive: a THEME (what the admin wants this email to accomplish) plus optional recipient context (name, country, where they came from, notes).

You produce — a single JSON object, no markdown fences, no prose outside the JSON:
  {
    "subject": "email subject line",
    "body": "plain-text email body"
  }

Rules — do NOT violate:
1. **Links.** Use ONLY the links from the library below, copied EXACTLY as written (no shortening, no wrapping, no anchor text). Include only the 1-3 links the theme actually calls for — NEVER dump the whole library. If the theme is "join our WhatsApp group", link the group; if it's "book a call", link the consultation page; if it's "explore programs", link programs or universities.
2. **No invented facts.** Do not invent scholarships, deadlines, prices, discounts, admission guarantees, or university partnerships. The free 10-minute consultation IS real. The WhatsApp group IS real. Everything else must come from the theme/notes.
3. **Language.** Write in English by default. If the theme or notes are written in Chinese, write subject+body in Chinese instead.
4. **Tone.** Warm, direct, human. Short sentences. No marketing fluff ("world-class", "prestigious", "exciting opportunity"). The reader is a 17-25 year old student deciding whether to study in China.

Format:
- subject: under 70 characters, no ALL CAPS, no clickbait, may include the recipient's first name only if provided.
- body: 100-200 words of plain text. Greet by first name when known, else "Hi there". One clear call-to-action tied to the theme's most relevant link; at most one secondary link. End with:
  Best regards,
  The SICA Team
  Study in China Academy
- Put each link on its own line so it stays copy-pasteable in plain-text email.
- Do NOT add an unsubscribe line (the sending system appends its own footer).

Link library:
${composeLinkLibrary()}`;
}

export function buildComposeUserPrompt(ctx: EmailComposeContext): string {
  const lines = [`Theme: ${ctx.theme}`];
  if (ctx.recipientName) lines.push(`Recipient name: ${ctx.recipientName}`);
  if (ctx.country) lines.push(`Recipient country: ${ctx.country}`);
  if (ctx.sourceKind) lines.push(`Where this contact came from: ${ctx.sourceKind}`);
  if (ctx.notes) {
    const trimmed = ctx.notes.slice(0, 1500);
    lines.push(`Notes / their original message:\n${trimmed}`);
  }
  return lines.join('\n');
}

/**
 * Extract { subject, body } from the model's reply. Tolerates the
 * usual failure modes: markdown fences, leading prose ("Here is your
 * draft:"), and trailing commas. Returns null when no parseable JSON
 * object with non-empty subject+body strings is found — the route
 * turns that into a 502 retry message.
 */
export function extractEmailDraft(raw: string): ComposedEmailDraft | null {
  if (typeof raw !== 'string' || !raw.trim()) return null;

  // Strip ``` / ```json fences if present.
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) text = fence[1].trim();

  // Direct parse first.
  const direct = tryParse(text);
  if (direct) return direct;

  // Otherwise scan for the outermost { ... } containing "subject".
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  return tryParse(text.slice(start, end + 1));
}

function tryParse(candidate: string): ComposedEmailDraft | null {
  try {
    const parsed: unknown = JSON.parse(candidate);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const obj = parsed as Record<string, unknown>;
    const subject = typeof obj.subject === 'string' ? obj.subject.trim() : '';
    const body = typeof obj.body === 'string' ? obj.body.trim() : '';
    if (!subject || !body) return null;
    // Hard caps so a runaway model can't hand the admin a wall of
    // text — the dialog textarea handles the rest.
    if (subject.length > 300 || body.length > 8000) return null;
    return { subject, body };
  } catch {
    return null;
  }
}
