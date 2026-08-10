import { apiClient } from './api';

export const staffPortalService = {
  // Fetch jobs assigned specifically to the logged-in technician (resolved via JWT)
  async getMyJobs() {
    return apiClient.get('/staff/my-jobs');
  },

  // Fetch details of a single assigned job
  async getMyJobById(jobId) {
    return apiClient.get(`/staff/my-jobs/${jobId}`);
  },

  // Submit work completion report notes and actual hours spent
  async submitReport(jobId, reportData) {
    return apiClient.post(`/staff/jobs/${jobId}/report`, reportData);
  },

  // Upload proof photos (JPEG, PNG, WebP; max 5 photos, 5MB each)
  async uploadProofPhotos(jobId, formData) {
    return apiClient.post(`/staff/jobs/${jobId}/photos`, formData);
  },

  // Finalize job completion (verifies report + at least 1 proof photo exists)
  async finalizeCompletion(jobId) {
    return apiClient.put(`/staff/jobs/${jobId}/complete`);
  },
};
