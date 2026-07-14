/**
 * SICA contact / WhatsApp configuration.
 *
 * Single source of truth for the WhatsApp business phone number
 * and the canonical pre-filled message templates. Before this
 * helper existed, the phone was hardcoded as '8617325764171' in
 * 4+ files (whatsapp-float, footer, StickyApplyBar, contact
 * page) — changing the number required a grep across the whole
 * codebase. Now every consumer (floating WhatsApp button, sales
 * page, sticky apply bar, footer, contact page) imports from
 * this file.
 *
 * How to change the number later:
 *   1. Update WHATSAPP_PHONE here (one line).
 *   2. Update the support email in src/lib/contact-config.ts (or
 *      wherever the canonical support email lives — see AGENTS.md
 *      for the current home: support@sica.com.cn).
 *   3. Deploy.
 */

/**
 * SICA's WhatsApp Business number in E.164 format (no `+` prefix,
 * no spaces). Used in `wa.me/<PHONE>` URLs that open the WhatsApp
 * app on mobile or WhatsApp Web in the browser.
 */
export const WHATSAPP_PHONE = '8617325764171';

/**
 * Build a `wa.me/` URL with a pre-filled message. The message is
 * URL-encoded so newlines / emoji / non-ASCII characters survive
 * transit through TikTok/YouTube description fields.
 *
 * The optional `extraContext` is appended to the base message and
 * is meant to carry UTM source + the lead's chosen service tier
 * (e.g. 'utm_source=youtube, tier=full_service'). When undefined
 * the base message is used as-is.
 *
 * Examples:
 *   whatsappUrl()  → wa.me/8617325764171?text=Hi%20SICA%2C...
 *   whatsappUrl({ utmSource: 'youtube', tier: 'diy' })
 *                 → wa.me/...?text=...%0A%0AFrom%3A%20youtube%0ATier%3A%20diy
 */
export const WHATSAPP_BASE_MESSAGE =
  "Hi SICA, I came from your video and want to learn about your admission services.";

export interface WhatsAppContext {
  utmSource?: string;
  tier?: 'diy' | 'full_service';
}

export function whatsappUrl(ctx?: WhatsAppContext): string {
  const base = WHATSAPP_BASE_MESSAGE;
  if (!ctx || (!ctx.utmSource && !ctx.tier)) {
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(base)}`;
  }
  // Append context as a small block at the end of the message so
  // the human-readable part stays at the top for the consultant.
  const lines = [base, ''];
  if (ctx.utmSource) lines.push(`From: ${ctx.utmSource}`);
  if (ctx.tier) lines.push(`Tier: ${ctx.tier}`);
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

/**
 * Display version of the phone (with country code prefix), used
 * when the page shows the digits as text (e.g. "Or call us at
 * +86 173 2576 4171"). Pure formatting — does NOT carry the
 * number; consumers that need the raw digits should use
 * WHATSAPP_PHONE directly.
 */
export const WHATSAPP_DISPLAY = '+86 173 2576 4171';
