// One-off fix: replace the body_html of oneoff.followup with a proper version.
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

const url = env.COZE_SUPABASE_URL;
const key = env.COZE_SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Supabase env not set');
  process.exit(1);
}
const supabase = createClient(url, key);

const newBodyHtml = '$GREET$firstName$\n<p>It has been a week since we last reached out about your interest in studying in China. We want to make sure your application does not get stuck — many of our students are preparing for the Fall 2026 intake right now.</p>\n\n<p>If you are still interested, just reply to this email and we will set up a free 30-minute call with one of our advisors this week.</p>\n\n<p>If now is not the right time, no problem at all — we keep your file and you can come back when you are ready.</p>\n\n<p>Talk soon,<br/><strong style="color:#1B2A4A">The SICA Team</strong></p>';

const { data, error } = await supabase
  .from('email_templates')
  .update({ body_html: newBodyHtml })
  .eq('slug', 'oneoff.followup')
  .select('slug, body_html')
  .single();

if (error) {
  console.error('Update failed:', error);
  process.exit(1);
}
console.log('Updated:', data && data.slug);
console.log('New body_html:');
console.log(data && data.body_html);
