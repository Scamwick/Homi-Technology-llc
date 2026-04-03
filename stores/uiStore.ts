import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration?: number;
}

interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  toasts: Toast[];
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export type UIStore = UIState & UIActions;

const DEFAULT_TOAST_DURATION = 5000;

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      // --- State ---
      sidebarCollapsed: false,
      activeModal: null,
      toasts: [],

      // --- Actions ---
      toggleSidebar: () => {
        set(
          (state) => ({ sidebarCollapsed: !state.sidebarCollapsed }),
          false,
          'ui/toggleSidebar',
        );
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed }, false, 'ui/setSidebarCollapsed');
      },

      openModal: (modalId) => {
        set({ activeModal: modalId }, false, 'ui/openModal');
      },

      closeModal: () => {
        set({ activeModal: null }, false, 'ui/closeModal');
      },

      addToast: (toast) => {
        const id = crypto.randomUUID();
        const newToast: Toast = { ...toast, id };

        set(
          (state) => ({ toasts: [...state.toasts, newToast] }),
          false,
          'ui/addToast',
        );

        // Auto-dismiss after duration
        const duration = toast.duration ?? DEFAULT_TOAST_DURATION;
        if (duration > 0) {
          setTimeout(() => {
            set(
              (state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
              }),
              false,
              'ui/autoRemoveToast',
            );
          }, duration);
        }

        return id;
      },

      removeToast: (id) => {
        set(
          (state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }),
          false,
          'ui/removeToast',
        );
      },

      clearToasts: () => {
        set({ toasts: [] }, false, 'ui/clearToasts');
      },
    }),
    { name: 'UIStore' },
  ),
);
