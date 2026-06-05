// Fix all body_html fields: replace 'greet(firstName)$' literal with '$GREET$firstName$'
// (the original SQL seed had escaping issues with $-quoted strings).
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = Object.fromEntries(
  readFileSync('.env', 'utf-8')
    .split('\n')
    .filter((l) => l && !l.startsWith('#') && l.includes('='))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')];
    }),
);

const supabase = createClient(env.COZE_SUPABASE_URL, env.COZE_SUPABASE_SERVICE_ROLE_KEY);

const { data: templates, error } = await supabase
  .from('email_templates')
  .select('id, slug, body_html, body_text');
if (error) {
  console.error('Fetch failed:', error);
  process.exit(1);
}

let fixed = 0;
for (const t of templates) {
  let body = t.body_html;
  let text = t.body_text;
  let changed = false;

  // The broken pattern: greet(firstName)$ — the literal text from my heredoc
  if (body.includes('greet(firstName)$')) {
    body = body.replaceAll('greet(firstName)$', '$GREET$firstName$');
    changed = true;
  }
  if (text.includes('greet(firstName)$')) {
    text = text.replaceAll('greet(firstName)$', '$GREET$firstName$');
    changed = true;
  }

  if (changed) {
    const { error: updErr } = await supabase
      .from('email_templates')
      .update({ body_html: body, body_text: text })
      .eq('id', t.id);
    if (updErr) {
      console.error('Update failed for', t.slug, updErr);
    } else {
      console.log('Fixed', t.slug);
      fixed++;
    }
  }
}
console.log('Done. Fixed', fixed, 'templates.');
