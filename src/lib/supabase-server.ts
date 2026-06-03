import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseServerInstance: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  if (supabaseServerInstance) {
    return supabaseServerInstance;
  }

  const supabaseUrl = process.env.COZE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (supabaseUrl && supabaseServiceKey) {
    supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey, {
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
