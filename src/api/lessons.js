import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

export const getLessons = async () => {
  return await apiGet('/api/lessons/');
};

export const getLessonById = async (id) => {
  return await apiGet(`/api/lessons/${id}`);
};

export const getLessonsByGrade = async (gradeParam) => {
  return await apiGet(`/api/lessons/grade/${gradeParam}`);
};

export const createLesson = async (lessonData) => {
  return await apiPost('/api/lessons/', lessonData);
};

export const updateLesson = async (id, lessonData) => {
  return await apiPut(`/api/lessons/${id}`, lessonData);
};

export const deleteLesson = async (id) => {
  return await apiDelete(`/api/lessons/${id}`);
};