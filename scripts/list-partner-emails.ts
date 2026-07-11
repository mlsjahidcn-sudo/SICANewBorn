import { createClient } from '@supabase/supabase-js';

const main = async () => {
  const sb = createClient(
    process.env.COZE_SUPABASE_URL || '',
    process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '',
  );
  // Get all partner + member user IDs
  const { data: partners } = await sb.from('partners').select('id, company_name, user_id, status');
  const { data: members } = await sb.from('partner_team_members').select('id, user_id, role, status, partner_id');

  const userIds = new Set<string>();
  for (const p of partners || []) if (p.user_id) userIds.add(p.user_id);
  for (const m of members || []) userIds.add(m.user_id);

  // Look up the auth emails via the admin API (one by one, since
  // Supabase JS SDK 2.95 doesn't expose a batch getUserByEmail).
  const emailByUserId = new Map<string, { email: string; lastSignIn: string | null; createdAt: string }>();
  for (const uid of userIds) {
    const { data, error } = await sb.auth.admin.getUserById(uid);
    if (error) {
      emailByUserId.set(uid, { email: `(error: ${error.message})`, lastSignIn: null, createdAt: '' });
      continue;
    }
    if (data?.user) {
      emailByUserId.set(uid, {
        email: data.user.email || '(no email)',
        lastSignIn: data.user.last_sign_in_at || null,
        createdAt: data.user.created_at,
      });
    }
  }

  console.log('\n=== Partners (org owner path) ===');
  for (const p of partners || []) {
    if (!p.user_id) {
      console.log(`  ${p.company_name} [${p.status}]  — no user_id bound (cannot login)`);
      continue;
    }
    const info = emailByUserId.get(p.user_id);
    console.log(`  ${p.company_name} [${p.status}]`);
    console.log(`    user_id: ${p.user_id}`);
    console.log(`    email:   ${info?.email || '?'}`);
    console.log(`    last login: ${info?.lastSignIn || 'never'}`);
  }

  console.log('\n=== Team members (additional users) ===');
  const ownerUserIds = new Set((partners || []).map((p) => p.user_id).filter(Boolean) as string[]);
  for (const m of members || []) {
    if (ownerUserIds.has(m.user_id)) continue; // already shown as owner
    const info = emailByUserId.get(m.user_id);
    const partner = (partners || []).find((p) => p.id === m.partner_id);
    console.log(`  ${info?.email || '?'}  →  ${partner?.company_name || '?'} (${m.role}, ${m.status})`);
    console.log(`    user_id: ${m.user_id}`);
    console.log(`    last login: ${info?.lastSignIn || 'never'}`);
  }
};
main().catch((e) => { console.error('fatal', e); process.exit(1); });
