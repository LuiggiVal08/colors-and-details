import { create } from 'zustand';
import notificationService from '@/services/notification.service';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
  addNotification: (notif: Notification) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const data = await notificationService.getAll();
      set({
        notifications: data,
        unreadCount: data.filter((n) => !n.leido).length,
        loading: false,
      });
    } catch {
      set({ loading: false, error: 'No se pudieron cargar las notificaciones' });
    }
  },

  addNotification: (notif: Notification) => {
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: notif.leido ? state.unreadCount : state.unreadCount + 1,
    }));
  },

  markAsRead: (id: number) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, leido: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, leido: true })),
        unreadCount: 0,
      }));
    } catch {
      set({ error: 'Error al marcar notificaciones' });
    }
  },
}));
