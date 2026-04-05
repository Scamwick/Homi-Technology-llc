import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// TODO: Replace with actual type when @/types/notification is available
// import type { Notification } from '@/types/notification';

type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'agent_action';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, unknown>;
}

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  error: string | null;
}

interface NotificationActions {
  fetchNotifications: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'created_at'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export type NotificationStore = NotificationState & NotificationActions;

export const useNotificationStore = create<NotificationStore>()(
  devtools(
    (set) => ({
      // --- State ---
      notifications: [],
      loading: false,
      error: null,

      // --- Actions ---
      fetchNotifications: async () => {
        set({ loading: true, error: null }, false, 'notifications/fetch');
        try {
          const response = await fetch('/api/user/notifications');
          if (!response.ok) throw new Error('Failed to fetch notifications');
          const result = await response.json();
          const notifications: Notification[] = result.data ?? result.notifications ?? [];
          set({ notifications }, false, 'notifications/fetch/success');
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Fetch failed';
          set({ error: message }, false, 'notifications/fetch/error');
        } finally {
          set({ loading: false }, false, 'notifications/fetch/done');
        }
      },

      markRead: (id) => {
        set(
          (state) => ({
            notifications: state.notifications.map((n) =>
              n.id === id ? { ...n, read: true } : n,
            ),
          }),
          false,
          'notifications/markRead',
        );
        // Persist to API (fire-and-forget)
        fetch('/api/user/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, read: true }),
        }).catch(() => { /* silent — local state already updated */ });
      },

      markAllRead: () => {
        set(
          (state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
          }),
          false,
          'notifications/markAllRead',
        );
        // Persist to API (fire-and-forget)
        fetch('/api/user/notifications', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ markAllRead: true }),
        }).catch(() => { /* silent — local state already updated */ });
      },

      addNotification: (partial) => {
        const notification: Notification = {
          ...partial,
          id: crypto.randomUUID(),
          read: false,
          created_at: new Date().toISOString(),
        };

        set(
          (state) => ({
            notifications: [notification, ...state.notifications],
          }),
          false,
          'notifications/add',
        );
      },

      removeNotification: (id) => {
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          'notifications/remove',
        );
      },

      clearAll: () => {
        set({ notifications: [] }, false, 'notifications/clearAll');
      },
    }),
    { name: 'NotificationStore' },
  ),
);

/** Selector: unread count (for use outside the store getter) */
export const selectUnreadCount = (state: NotificationStore): number =>
  state.notifications.filter((n) => !n.read).length;
