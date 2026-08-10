import { apiClient } from './api';

export const bookingService = {
  // Admin: Get all active booking links
  async getBookingRequests() {
    return apiClient.get('/booking-links');
  },

  // Admin: Generate new booking link
  async generateBookingLink(data) {
    return apiClient.post('/booking-links', data);
  },

  // Public Resident Portal: Get booking details by secure token
  async getBookingByToken(token) {
    return apiClient.get(`/public/booking/${token}`);
  },

  // Public Resident Portal: Confirm booking time slot
  async confirmBooking(token, bookingData) {
    return apiClient.post(`/public/booking/${token}/confirm`, bookingData);
  },
};
