'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase-browser';
import type { User, Session } from '@supabase/supabase-js';

export type SignUpRole = 'student' | 'admin' | 'super_admin' | 'partner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role?: SignUpRole,
    profile?: Record<string, string | undefined>,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const client = supabase;

    // Safety timeout — never let the layout's loading spinner stay up
    // forever. getSession() reads from localStorage and should resolve
    // in <50ms, but a slow Supabase backend (or a JS bundle that
    // failed to hydrate) could leave `loading=true` indefinitely and
    // hang every protected page in a permanent spinner state. 5s is
    // generous; real sessions resolve in tens of milliseconds.
    const safety = setTimeout(() => {
      setLoading(false);
    }, 5_000);

    const getSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch {
        // Swallow — the user simply isn't signed in
      } finally {
        clearTimeout(safety);
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase is not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      role: SignUpRole = 'student',
      profile?: Record<string, string | undefined>,
    ) => {
      if (!supabase) return { error: 'Supabase is not configured' };

      const userMetadata: Record<string, unknown> = {
        full_name: fullName,
        role,
      };
      if (profile) {
        for (const [key, value] of Object.entries(profile)) {
          if (value !== undefined && value !== '') {
            userMetadata[key] = value;
          }
        }
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userMetadata,
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (!data.user) {
        return { error: 'Signup succeeded but no user record was returned' };
      }

      // Only insert into admin_profiles when the user is signing up as an admin.
      // Student/partner signups rely on the database trigger (handle_new_student_user)
      // or partner provisioning to create their profile rows — we MUST NOT touch
      // admin_profiles here, or every student gets an admin row (regression: C4).
      if (role === 'admin' || role === 'super_admin') {
        const { error: profileError } = await supabase.from('admin_profiles').insert({
          user_id: data.user.id,
          full_name: fullName,
          email,
          role,
          is_active: true,
        });
        if (profileError) {
          return { error: profileError.message };
        }
      }

      return { error: null };
    },
    [],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut, isConfigured: isSupabaseConfigured }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
