import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// TODO: Import from @/types/auth when available
// import type { User, Session } from '@/types/auth';

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
            // TODO: Implement with @supabase/ssr
            // const supabase = createBrowserClient(...)
            // const { data, error } = await supabase.auth.signUp({
            //   email,
            //   password,
            //   options: { data: { full_name: fullName } },
            // });
            // if (error) throw error;
            // set({ user: data.user, session: data.session });
            throw new Error('Not implemented: wire up Supabase auth');
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
            // TODO: Implement with @supabase/ssr
            // const supabase = createBrowserClient(...)
            // const { data, error } = await supabase.auth.signInWithPassword({
            //   email,
            //   password,
            // });
            // if (error) throw error;
            // set({ user: data.user, session: data.session });
            throw new Error('Not implemented: wire up Supabase auth');
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
            // TODO: Implement with @supabase/ssr
            // const supabase = createBrowserClient(...)
            // const { error } = await supabase.auth.signOut();
            // if (error) throw error;
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
            // TODO: Implement with @supabase/ssr
            // const supabase = createBrowserClient(...)
            // const { data, error } = await supabase.auth.refreshSession();
            // if (error) throw error;
            // set({ session: data.session, user: data.session?.user ?? get().user });
            throw new Error('Not implemented: wire up Supabase auth');
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Session refresh failed';
            set({ error: message }, false, 'auth/refreshSession/error');
          }
        },

        initialize: async () => {
          if (get().initialized) return;
          set({ loading: true }, false, 'auth/initialize');
          try {
            // TODO: Implement with @supabase/ssr
            // const supabase = createBrowserClient(...)
            // const { data: { session } } = await supabase.auth.getSession();
            // if (session) {
            //   set({ user: session.user, session });
            // }
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
