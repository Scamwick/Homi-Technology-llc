import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface Session {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user: User;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

interface AuthActions {
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;

function mapUser(supaUser: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at: string }): User {
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    full_name: (supaUser.user_metadata?.full_name as string) ?? null,
    avatar_url: (supaUser.user_metadata?.avatar_url as string) ?? null,
    created_at: supaUser.created_at,
  };
}

function mapSession(s: { access_token: string; refresh_token: string; expires_at?: number; user: { id: string; email?: string; user_metadata?: Record<string, unknown>; created_at: string } }): Session {
  return {
    access_token: s.access_token,
    refresh_token: s.refresh_token,
    expires_at: s.expires_at ?? 0,
    user: mapUser(s.user),
  };
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // --- State ---
        user: null,
        session: null,
        loading: false,
        initialized: false,
        error: null,

        // --- Actions ---
        signUp: async (email, password, fullName) => {
          set({ loading: true, error: null }, false, 'auth/signUp');
          try {
            const supabase = createClient();
            if (!supabase) throw new Error('Supabase is not configured');
            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: { data: { full_name: fullName } },
            });
            if (error) throw error;
            if (data.user) set({ user: mapUser(data.user) }, false, 'auth/signUp/success');
            if (data.session) set({ session: mapSession(data.session) }, false, 'auth/signUp/session');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign up failed';
            set({ error: message }, false, 'auth/signUp/error');
            throw err;
          } finally {
            set({ loading: false }, false, 'auth/signUp/done');
          }
        },

        signIn: async (email, password) => {
          set({ loading: true, error: null }, false, 'auth/signIn');
          try {
            const supabase = createClient();
            if (!supabase) throw new Error('Supabase is not configured');
            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;
            if (data.user) set({ user: mapUser(data.user) }, false, 'auth/signIn/success');
            if (data.session) set({ session: mapSession(data.session) }, false, 'auth/signIn/session');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign in failed';
            set({ error: message }, false, 'auth/signIn/error');
            throw err;
          } finally {
            set({ loading: false }, false, 'auth/signIn/done');
          }
        },

        signOut: async () => {
          set({ loading: true, error: null }, false, 'auth/signOut');
          try {
            const supabase = createClient();
            if (!supabase) throw new Error('Supabase is not configured');
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            set({ user: null, session: null }, false, 'auth/signOut/success');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Sign out failed';
            set({ error: message }, false, 'auth/signOut/error');
            throw err;
          } finally {
            set({ loading: false }, false, 'auth/signOut/done');
          }
        },

        refreshSession: async () => {
          try {
            const supabase = createClient();
            if (!supabase) return;
            const { data, error } = await supabase.auth.refreshSession();
            if (error) throw error;
            if (data.session) {
              set({
                session: mapSession(data.session),
                user: mapUser(data.session.user),
              }, false, 'auth/refreshSession/success');
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Session refresh failed';
            set({ error: message }, false, 'auth/refreshSession/error');
          }
        },

        initialize: async () => {
          if (get().initialized) return;
          set({ loading: true }, false, 'auth/initialize');
          try {
            const supabase = createClient();
            if (!supabase) {
              set({ initialized: true }, false, 'auth/initialize/noSupabase');
              return;
            }
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              set({
                user: mapUser(session.user),
                session: mapSession(session),
              }, false, 'auth/initialize/session');
            }
            set({ initialized: true }, false, 'auth/initialize/done');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Initialization failed';
            set({ error: message, initialized: true }, false, 'auth/initialize/error');
          } finally {
            set({ loading: false }, false, 'auth/initialize/done');
          }
        },

        setUser: (user) => set({ user }, false, 'auth/setUser'),
        setSession: (session) => set({ session }, false, 'auth/setSession'),
        setLoading: (loading) => set({ loading }, false, 'auth/setLoading'),
        setError: (error) => set({ error }, false, 'auth/setError'),
        clearError: () => set({ error: null }, false, 'auth/clearError'),
      }),
      {
        name: 'homi-auth',
        partialize: (state) => ({
          user: state.user,
          session: state.session,
        }),
      },
    ),
    { name: 'AuthStore' },
  ),
);
