// جلب مهمة واحدة بالتفصيل
export const getTaskById = async (taskId) => {
  return await apiGet(`/api/tasks/${taskId}`);
};

// إرسال إجابات الطالب على المهمة
export const submitTaskAnswers = async (taskId, answersData) => {
  return await apiPost(`/api/tasks/${taskId}/submit`, answersData);
};
import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

// جلب نتائج جميع المهام الخاصة بالطالب الحالي
export const getMyTaskResults = async () => {
  return await apiGet('/api/tasks/results/my-results');
};

export const getTasks = async () => {
  return await apiGet('/api/tasks/');
};

export const getTasksByGrade = async (gradeParam) => {
  return await apiGet(`/api/tasks/grade/${gradeParam}`);
};

export const createTask = async (taskData) => {
  return await apiPost('/api/tasks/', taskData);
};

export const updateTask = async (id, taskData) => {
  return await apiPut(`/api/tasks/${id}`, taskData);
};

export const deleteTask = async (id) => {
  return await apiDelete(`/api/tasks/${id}`);
};