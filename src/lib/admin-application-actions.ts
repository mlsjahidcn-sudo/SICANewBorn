import type { SupabaseClient } from '@supabase/supabase-js';
export async function archiveApplication(service: SupabaseClient, id: string, surface: 'student' | 'partner', archive: boolean, actorId: string): Promise<void> {
  const { error } = await service.rpc('admin_archive_application', { p_id: id, p_surface: surface, p_archive: archive, p_actor: actorId });
  if (error) throw new Error(error.message);
}
