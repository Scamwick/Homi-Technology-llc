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
          const notifications: Notification[] = result.data?.notifications ?? [];
          set({ notifications }, false, 'notifications/fetched');
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
        fetch('/api/user/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationId: id }),
        }).catch(() => {/* best-effort persistence */});
      },

      markAllRead: () => {
        set(
          (state) => ({
            notifications: state.notifications.map((n) => ({ ...n, read: true })),
          }),
          false,
          'notifications/markAllRead',
        );
        // Persist each unread notification as read (best-effort)
        const currentState = useNotificationStore.getState();
        const unread = currentState.notifications.filter(n => !n.read);
        Promise.all(
          unread.map(n =>
            fetch('/api/user/notifications', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ notificationId: n.id }),
            }),
          ),
        ).catch(() => {/* best-effort */});
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
