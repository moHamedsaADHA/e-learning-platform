import { apiGet } from './apiClient.js';

// Get dashboard analytics data
export const getDashboardAnalytics = async () => {
  return await apiGet('/api/analytics/dashboard');
};

export default {
  getDashboardAnalytics
};