import { apiClient } from './api';

export const staffService = {
  // Fetch all staff members / technicians (supports optional search query)
  async getStaff(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/staff${query ? `?${query}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Fetch single staff member by ID
  async getStaffById(id) {
    return apiClient.get(`/staff/${id}`);
  },

  // Create new staff profile (creates user account + staff profile)
  async addStaff(staffData) {
    return apiClient.post('/staff', staffData);
  },

  // Update existing staff profile (role, phone, working hours/days)
  async updateStaff(id, staffData) {
    return apiClient.put(`/staff/${id}`, staffData);
  },

  // Delete staff profile and associated user account (Admin only)
  async deleteStaff(id) {
    return apiClient.delete(`/staff/${id}`);
  },
};

