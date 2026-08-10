import { apiClient } from './api';

export const calendarService = {
  // Fetch calendar dispatches and dynamic staff list
  async getCalendar(params = {}) {
    const query = new URLSearchParams();
    if (params.start) query.append('start', params.start);
    if (params.end) query.append('end', params.end);
    if (params.staffId) query.append('staffId', params.staffId);
    
    const queryString = query.toString();
    const endpoint = `/calendar${queryString ? `?${queryString}` : ''}`;
    return apiClient.get(endpoint);
  },

  // Dispatch work order to a technician slot
  async dispatchJob(dispatchData) {
    return apiClient.post('/calendar/dispatch', dispatchData);
  },
};
