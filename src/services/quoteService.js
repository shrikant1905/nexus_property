import { apiClient } from './api';

export const quoteService = {
  // Admin: Get all quote photo requests
  async getQuoteRequests() {
    return apiClient.get('/quote-requests');
  },

  // Admin: Generate new photo/video upload link
  async generateQuoteRequestLink(data) {
    return apiClient.post('/quote-requests', data);
  },

  // Public Resident Portal: Get quote upload details by token
  async getQuoteRequestByToken(token) {
    return apiClient.get(`/public/request/${token}`);
  },

  // Public Resident Portal: Upload photos, videos, and work description report
  async submitResidentQuote(token, formData) {
    return apiClient.post(`/public/quote-request/${token}/upload`, formData);
  },

  // Admin: Update quote request status
  async updateQuoteStatus(token, status) {
    return apiClient.put(`/quote-requests/${token}/status`, { status });
  },
};
