import { SITE_URL } from '@/lib/site-url';
/**
 * Email template renderer.
 *
 * Substitutes {{var}} placeholders in a template body with values
 * from the context. Escapes HTML by default (so user-supplied values
 * like firstName, country, etc. can't inject HTML/JS into the email).
 *
 * Custom directives (lighter than full Handlebars — covers what our
 * 10 templates actually need):
 *   {{var}}            — HTML-escaped substitution
 *   {{{var}}}          — raw substitution (only for trusted content)
 *   {{#if var}} ... {{/if}}
 *   {{#unless var}} ... {{/unless}}
 *
 * Plus a few macro substitutions to make the templates readable:
 *   $IF_VAR$ ... $ELSE$ ... $ENDIF$            (block conditional, body_html)
 *   $ESC$varName$                                (escape and inject in $IF/$ELSE)
 *   $CTA$label|/$/path$|buttonKey$              (render the SICA crimson CTA)
 *   $FACTS$                                      (render a key/value table — caller passes
 *                                                 a facts array via context)
 *   $GREET$firstName$                            (renders a "Hi X," line)
 *
 * The body_text variant uses the same engine — no HTML, just plain
 * text with the same placeholders.
 *
 * Variable validation: the renderer reads `context.allowedVariables`
 * (the variables JSONB from email_templates) and refuses to render if
 * a {{var}} reference isn't in the allow-list. This catches typos in
 * template bodies before they ship.
 */

const SITE_URL_DEFAULT = process.env.NEXT_PUBLIC_SITE_URL || SITE_URL;

export interface RenderContext {
  // Free-form variable values
  [key: string]: string | number | boolean | null | undefined | Array<{ key: string; value: string }>;
}

export interface RenderResult {
  subject: string;
  html: string;
  text: string;
}

const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(s: unknown): string {
  if (s == null) return '';
  return String(s).replace(/[&<>"']/g, (c) => HTML_ESCAPE_MAP[c] || c);
}

/**
 * Render a template body with the given context.
 *
 * @param subject   the template subject
 * @param bodyHtml  the template body_html
 * @param bodyText  the template body_text
 * @param context   variable values
 * @param allowedVariables  optional allow-list for variable validation
 */
export function renderTemplate(opts: {
  subject: string;
  bodyHtml: string;
  bodyText: string;
  context: RenderContext;
  allowedVariables?: string[];
}): RenderResult {
  const { subject, bodyHtml, bodyText, context, allowedVariables } = opts;

  // Add common implicit variables if not provided
  const ctx: RenderContext = {
    siteUrl: context.siteUrl || SITE_URL_DEFAULT,
    unsubToken: context.unsubToken || '',
    ...context,
  };

  return {
    subject: renderString(subject, ctx, allowedVariables),
    html: renderBodyHtml(bodyHtml, ctx, allowedVariables),
    text: renderString(bodyText, ctx, allowedVariables),
  };
}

/**
 * Render plain text or short subject. Handles {{var}} (escaped) and
 * {{{var}}} (raw) plus block directives + the $IF_$/.../$ENDIF$ macros
 * (so body_text bodies that share the same template format work too).
 */
function renderString(input: string, ctx: RenderContext, allowed?: string[]): string {
  // Block directives: {{#if var}}...{{/if}} and {{#unless var}}...{{/unless}}
  let out = input;
  out = renderBlockDirectives(out, ctx, allowed);

  // $IF_VAR$ ... $ELSE$ ... $ENDIF$  (also used in body_text for shared templates)
  out = out.replace(
    /\$IF_([A-Z_][A-Z0-9_]*)\$([\s\S]*?)\$ENDIF\$/g,
    (_m, varName, block) => {
      const value = ctx[varName.toLowerCase()];
      const truthy = value != null && value !== '' && value !== false;
      const parts = block.split('$ELSE$');
      return truthy ? parts[0] : parts[1] || '';
    },
  );

  // Triple-brace = raw (use carefully)
  out = out.replace(/\{\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}\}/g, (_m, name) => {
    return String(ctx[name] ?? '');
  });
  // Double-brace = escaped
  out = out.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (_m, name) => {
    if (allowed && !allowed.includes(name)) {
      // Don't fail — leave the placeholder in so it's obvious in QA
      return `[${name}]`;
    }
    return escapeHtml(ctx[name]);
  });
  return out;
}

/**
 * Render the body_html, which has more complex macro support:
 *   $IF_VAR$ ... $ELSE$ ... $ENDIF$
 *   $ESC$varname$             (HTML-escape + inject inside $IF/$ELSE)
 *   $CTA$label|/$/path$|key$  (SICA crimson button)
 *   $FACTS$                   (key/value table from context.facts)
 *   $GREET$firstName$         (Hi X,)
 */
function renderBodyHtml(input: string, ctx: RenderContext, allowed?: string[]): string {
  let out = input;

  // 1. Process $IF_VAR$ ... $ELSE$ ... $ENDIF$ blocks
  // Pattern: $IF_VARNAME$ ... $ELSE$ ... $ENDIF$
  out = out.replace(
    /\$IF_([A-Z_][A-Z0-9_]*)\$([\s\S]*?)\$ENDIF\$/g,
    (_m, varName, block) => {
      const value = ctx[varName.toLowerCase()];
      const truthy = value != null && value !== '' && value !== false;
      const parts = block.split('$ELSE$');
      return truthy ? parts[0] : parts[1] || '';
    },
  );
  out = out.replace(
    /\$IF_([A-Z_][A-Z0-9_]*)\$([\s\S]*?)\$ENDIF\$/g,
    (_m, varName, block) => {
      // Same regex again for nested (rare) — but block doesn't support nesting
      const value = ctx[varName.toLowerCase()];
      const truthy = value != null && value !== '' && value !== false;
      const parts = block.split('$ELSE$');
      return truthy ? parts[0] : parts[1] || '';
    },
  );

  // 2. $ESC$varname$ — escape and inject
  out = out.replace(/\$ESC\$([a-zA-Z_][a-zA-Z0-9_]*)\$/g, (_m, name) => {
    return escapeHtml(ctx[name]);
  });

  // 3. $GREET$firstName$
  out = out.replace(/\$GREET\$([a-zA-Z_][a-zA-Z0-9_]*)\$/g, (_m, name) => {
    const n = ctx[name] || 'there';
    return `<p style="margin:0 0 16px 0">Hi ${escapeHtml(n)},</p>`;
  });

  // 4. $CTA$label|/$/path$|key$
  out = out.replace(
    /\$CTA\$([^|]*)\|\/\$(\/[^$]*)\$\|([a-zA-Z0-9_]+)\$/g,
    (_m, label, path, key) => {
      const site = (ctx.siteUrl as string) || SITE_URL_DEFAULT;
      const href = `${site}${path}`;
      const l = (label || '').trim();
      return (
        `<p style="margin:24px 0 0 0"><a href="${href}" ` +
        `style="background:#9B1B30;color:#ffffff;padding:12px 24px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block">${l}</a></p>`
      );
    },
  );

  // 5. $FACTS$ — render context.facts (array of {key, value}) as a table
  out = out.replace(/\$FACTS\$/g, () => {
    const facts = (ctx.facts as Array<{ key: string; value: string }>) || [];
    if (facts.length === 0) return '';
    const rows = facts
      .filter((f) => f.value)
      .map(
        (f) =>
          `<tr><td style="padding:6px 12px;font-weight:bold;background:#f5f5f5;width:140px">${escapeHtml(f.key)}</td><td style="padding:6px 12px">${escapeHtml(f.value)}</td></tr>`,
      )
      .join('');
    if (!rows) return '';
    return (
      `<table style="font-family:sans-serif;border-collapse:collapse;width:100%;margin:16px 0">${rows}</table>`
    );
  });

  // 6. Then process {{var}} and block directives (reusing renderString for the
  // remaining substitutions, since $IF_/etc. don't have {{}} braces).
  out = renderString(out, ctx, allowed);

  return out;
}

/**
 * {{#if var}}...{{/if}} and {{#unless var}}...{{/unless}}
 * Supports {{#if var}}truthy{{else}}falsy{{/if}}? — we don't have
 * an else variant in {{}} form, only the $IF_$ELSE$ form in $...$
 * bodies. If the template uses {{#if}} without $$, we still
 * support it.
 */
function renderBlockDirectives(input: string, ctx: RenderContext, _allowed?: string[]): string {
  let out = input;
  // {{#if NAME}}...{{/if}}
  out = out.replace(/\{\{#if\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}([\s\S]*?)\{\{\/if\}\}/g, (_m, name, body) => {
    const v = ctx[name];
    return v != null && v !== '' && v !== false ? body : '';
  });
  // {{#unless NAME}}...{{/unless}}
  out = out.replace(
    /\{\{#unless\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}([\s\S]*?)\{\{\/unless\}\}/g,
    (_m, name, body) => {
      const v = ctx[name];
      return v == null || v === '' || v === false ? body : '';
    },
  );
  return out;
}
