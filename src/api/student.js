// جلب المستوى العام للطالب
import { apiGet } from './apiClient.js';

export const getStudentOverallProgress = async () => {
  return await apiGet('/api/students/overall-progress');
};
