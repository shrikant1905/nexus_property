import { apiClient } from './api';

export const dashboardService = {
  /**
   * Fetch all aggregated Maintenance Dashboard stats in a single API call.
   * Returns: { stageCounts, totalJobs, staffWorkload, weeklyTrend, recentJobs, pendingQuoteRequests }
   */
  async getStats() {
    return apiClient.get('/dashboard/stats');
  },
};
