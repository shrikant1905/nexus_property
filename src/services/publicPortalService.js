import { apiClient } from './api';

export const publicPortalService = {
  // Fetch public request / booking information by secure token (No Auth Header needed)
  async getPublicRequestInfo(token) {
    return apiClient.get(`/public/request/${token}`);
  },

  // Fetch available dispatch time slots for resident self-booking by token
  async getPublicAvailableSlots(token, date) {
    return apiClient.get(`/public/booking/${token}/available-slots?date=${date}`);
  },

  // Confirm resident self-booking
  async confirmPublicBooking(token, bookingData) {
    return apiClient.post(`/public/booking/${token}/confirm`, bookingData);
  },

  // Upload resident quote request photos & notes
  async uploadPublicQuotePhotos(token, formData) {
    return apiClient.post(`/public/quote-request/${token}/upload`, formData);
  },
};
