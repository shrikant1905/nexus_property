import { apiClient } from './api';

export const notificationService = {
  // Get latest user notifications and unread count
  async getNotifications() {
    return apiClient.get('/notifications');
  },

  // Mark a single notification as read
  async markAsRead(id) {
    return apiClient.put(`/notifications/${id}/read`);
  },

  // Mark all user notifications as read
  async markAllAsRead() {
    return apiClient.put('/notifications/read-all');
  },
};
