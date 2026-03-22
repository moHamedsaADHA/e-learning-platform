import { apiGet } from './apiClient.js';

// جلب جميع المستخدمين مع الفلترة والبحث
export const getAllUsers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  
  // إضافة البارامترات إذا كانت موجودة
  if (params.name) queryParams.append('name', params.name);
  if (params.code) queryParams.append('code', params.code);
  if (params.role) queryParams.append('role', params.role);
  if (params.grade) queryParams.append('grade', params.grade);
  if (params.location) queryParams.append('location', params.location);
  if (params.isVerified !== undefined) queryParams.append('isVerified', params.isVerified);
  if (params.page) queryParams.append('page', params.page);
  if (params.limit) queryParams.append('limit', params.limit);

  const queryString = queryParams.toString();
  const url = `/api/users/all${queryString ? `?${queryString}` : ''}`;
  
  return await apiGet(url);
};

// جلب إحصائيات المستخدمين
export const getUsersStatistics = async () => {
  return await apiGet('/api/users/statistics');
};