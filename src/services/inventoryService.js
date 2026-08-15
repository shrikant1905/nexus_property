import { apiClient } from './api';

export const inventoryService = {
  async getInventory(filters = {}) {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.lowStock) queryParams.append('lowStock', 'true');
    
    return apiClient.get(`/inventory?${queryParams.toString()}`);
  },

  async getItem(id) {
    return apiClient.get(`/inventory/${id}`);
  },

  async createItem(data) {
    return apiClient.post('/inventory', data);
  },

  async updateItem(id, data) {
    return apiClient.put(`/inventory/${id}`, data);
  },

  async deactivateItem(id) {
    return apiClient.delete(`/inventory/${id}`);
  },

  async restockItem(id, quantity, notes = '') {
    return apiClient.post(`/inventory/${id}/restock`, { quantity, notes });
  }
};
