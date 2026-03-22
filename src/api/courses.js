import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

export const getCourses = async () => {
  const response = await apiGet('/api/courses/');
  // Ensure we always return an array
  if (Array.isArray(response)) {
    return response;
  } else if (response && Array.isArray(response.courses)) {
    return response.courses;
  } else if (response && response.data && Array.isArray(response.data)) {
    return response.data;
  }
  console.warn('getCourses returned unexpected format:', response);
  return [];
};

export const getCourseById = async (id) => {
  return await apiGet(`/api/courses/${id}`);
};

export const createCourse = async (courseData) => {
  return await apiPost('/api/courses/', courseData);
};

export const updateCourse = async (id, courseData) => {
  return await apiPut(`/api/courses/${id}`, courseData);
};

export const deleteCourse = async (id) => {
  return await apiDelete(`/api/courses/${id}`);
};

export const getInstructorCourses = async () => {
  return await apiGet('/api/courses/instructor');
};