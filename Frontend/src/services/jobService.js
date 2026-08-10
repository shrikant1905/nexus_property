import { apiClient } from './api';

export const jobService = {
  // Fetch all work orders (supports filters: section, staffId, search)
  async getJobs(params = {}) {
    const query = new URLSearchParams(params).toString();
    const endpoint = `/jobs${query ? `?${query}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Fetch single work order by ID
  async getJobById(id) {
    return apiClient.get(`/jobs/${id}`);
  },

  // Create new work order (passes resident_id, assigned_staff_id, durationHours, section)
  async createJob(jobData) {
    return apiClient.post('/jobs', jobData);
  },

  // Move pipeline stage (Drag & Drop / Tab Change)
  async moveJobStage(id, section) {
    return apiClient.put(`/jobs/${id}/stage`, { section });
  },

  // Update work order status & assigned staff
  async updateJobStatus(id, updateData) {
    return apiClient.put(`/jobs/${id}/status`, updateData);
  },

  // Delete work order (Admin only)
  async deleteJob(id) {
    return apiClient.delete(`/jobs/${id}`);
  },

  // Generate public resident token link (type: 'BOOKING' or 'QUOTE_UPLOAD')
  async generatePublicLink(jobId, type = 'BOOKING') {
    return apiClient.post(`/public/jobs/${jobId}/generate-link`, { type });
  },
};

