import { apiRequest } from './api';
import { AppNotification } from '../types';

export const notificationService = {
  async getNotifications(userId?: string): Promise<AppNotification[]> {
    const url = userId ? `/api/notifications?user_id=${userId}` : '/api/notifications';
    const res = await apiRequest<{ notifications: AppNotification[] }>(url);
    return res.notifications;
  },

  async markAsRead(id: string): Promise<void> {
    await apiRequest(`/api/notifications/${id}/read`, { method: 'POST' });
  },

  async markAllAsRead(userId?: string): Promise<void> {
    await apiRequest('/api/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId })
    });
  }
};
