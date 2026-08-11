import { apiClient } from './api';

export const settingsService = {
  async getSettings() {
    return apiClient.get('/settings');
  },
  async updateSettings(settingsData) {
    return apiClient.put('/settings', settingsData);
  }
};
