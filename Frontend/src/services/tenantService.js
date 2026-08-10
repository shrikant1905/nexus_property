import { apiClient } from './api';

export const tenantService = {
  // Fetch all residents / tenants (supports optional search query)
  async getTenants(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/tenants${query ? `?${query}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Fetch single resident by ID
  async getTenantById(id) {
    return apiClient.get(`/tenants/${id}`);
  },

  // Create new resident (Full Name, Phone, Address required; Email optional)
  async addTenant(tenantData) {
    return apiClient.post('/tenants', tenantData);
  },

  // Update existing resident
  async updateTenant(id, tenantData) {
    return apiClient.put(`/tenants/${id}`, tenantData);
  },

  // Delete resident (Admin only)
  async deleteTenant(id) {
    return apiClient.delete(`/tenants/${id}`);
  },
};

