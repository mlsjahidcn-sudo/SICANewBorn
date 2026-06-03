/**
 * getPostLoginRedirectPath()
 *
 * Decides where to send a user after they sign in, based on their role.
 * Centralized so all 3 login pages (admin / student / partner) use the
 * same logic — the user lands in the right portal regardless of which
 * login page they submitted from.
 *
 * Role detection:
 *   - 'admin' / 'super_admin' → /admin/dashboard
 *   - 'partner'              → /partner
 *   - 'student' (default)    → /student
 *
 * Role is sourced from `user.user_metadata.role` (set at signup time).
 * Falls back to /student only if role is missing (preserves the
 * "everyone is a student by default" assumption of the original
 * signup flow).
 */
import type { User } from '@supabase/supabase-js';

export function getPostLoginRedirectPath(user: User | null): string {
  if (!user) return '/login';
  const role = (user.user_metadata?.role as string | undefined) ?? 'student';
  switch (role) {
    case 'admin':
    case 'super_admin':
      return '/admin/dashboard';
    case 'partner':
      return '/partner';
    case 'student':
    default:
      return '/student';
  }
}
