import api from './api';

export interface NotificationsResponse {
  count: number;
  data: Notification[];
}

const notificationService = {
  getAll: async (): Promise<Notification[]> => {
    const { data } = await api.get<NotificationsResponse>('/notifications');
    return data.data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};

export default notificationService;
