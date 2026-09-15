import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseServerInstance: SupabaseClient | null = null;
let warnedAnonKeyFallback = false;

export function getSupabaseServer(): SupabaseClient | null {
  if (supabaseServerInstance) {
    return supabaseServerInstance;
  }

  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';
  // Phase 91: keep the anon-key fallback (CI builds run without the
  // service key by design and fall back to static seed data) but log it
  // loudly — server code that assumes service-role privileges silently
  // returning empty/403 results looks exactly like a data bug.
  const supabaseKey = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  if (supabaseUrl && !supabaseServiceKey && supabaseKey && !warnedAnonKeyFallback) {
    warnedAnonKeyFallback = true;
    console.error(
      '[supabase-server] COZE_SUPABASE_SERVICE_ROLE_KEY is not set — using the PUBLIC anon key. ' +
        'Server code that expects to bypass RLS will return empty/403 results.',
    );
  }

  if (supabaseUrl && supabaseKey) {
    supabaseServerInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return supabaseServerInstance;
  }

  return null;
}

// Backward compatibility with lazy initialization
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseServer();
    if (!client) {
      throw new Error('Supabase not configured');
    }
    return client[prop as keyof SupabaseClient];
  }
}) as SupabaseClient;

export function isSupabaseServerConfigured(): boolean {
  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return !!(supabaseUrl && supabaseServiceKey);
}
