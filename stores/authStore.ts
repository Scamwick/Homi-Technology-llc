import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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

/** Map a Supabase user to our local User shape. */
function mapUser(su: SupabaseUser): User {
  return {
    id: su.id,
    email: su.email ?? '',
    full_name: su.user_metadata?.full_name ?? su.user_metadata?.name ?? null,
    avatar_url: su.user_metadata?.avatar_url ?? su.user_metadata?.picture ?? null,
    created_at: su.created_at,
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

            // Dev mode: no Supabase configured
            if (!supabase) {
              const mockUser: User = {
                id: 'dev-user',
                email,
                full_name: fullName ?? null,
                avatar_url: null,
                created_at: new Date().toISOString(),
              };
              set({ user: mockUser, session: null }, false, 'auth/signUp/dev');
              return;
            }

            const { data, error } = await supabase.auth.signUp({
              email,
              password,
              options: { data: { full_name: fullName } },
            });
            if (error) throw error;

            if (data.user) {
              const user = mapUser(data.user);
              const session = data.session
                ? {
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                    expires_at: data.session.expires_at ?? 0,
                    user,
                  }
                : null;
              set({ user, session }, false, 'auth/signUp/success');
            }
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

            if (!supabase) {
              const mockUser: User = {
                id: 'dev-user',
                email,
                full_name: 'Dev User',
                avatar_url: null,
                created_at: new Date().toISOString(),
              };
              set({ user: mockUser, session: null }, false, 'auth/signIn/dev');
              return;
            }

            const { data, error } = await supabase.auth.signInWithPassword({
              email,
              password,
            });
            if (error) throw error;

            const user = mapUser(data.user);
            const session: Session = {
              access_token: data.session.access_token,
              refresh_token: data.session.refresh_token,
              expires_at: data.session.expires_at ?? 0,
              user,
            };
            set({ user, session }, false, 'auth/signIn/success');
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
            if (supabase) {
              const { error } = await supabase.auth.signOut();
              if (error) throw error;
            }
            set(
              { user: null, session: null },
              false,
              'auth/signOut/success',
            );
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
              const user = mapUser(data.session.user);
              set({
                session: {
                  access_token: data.session.access_token,
                  refresh_token: data.session.refresh_token,
                  expires_at: data.session.expires_at ?? 0,
                  user,
                },
                user,
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
              set({ initialized: true }, false, 'auth/initialize/dev');
              return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const user = mapUser(session.user);
              set({
                user,
                session: {
                  access_token: session.access_token,
                  refresh_token: session.refresh_token,
                  expires_at: session.expires_at ?? 0,
                  user,
                },
              }, false, 'auth/initialize/session');
            }

            // Subscribe to auth state changes (login, logout, token refresh)
            supabase.auth.onAuthStateChange((_event, session) => {
              if (session) {
                const user = mapUser(session.user);
                set({
                  user,
                  session: {
                    access_token: session.access_token,
                    refresh_token: session.refresh_token,
                    expires_at: session.expires_at ?? 0,
                    user,
                  },
                }, false, 'auth/stateChange');
              } else {
                set({ user: null, session: null }, false, 'auth/stateChange/signedOut');
              }
            });

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
