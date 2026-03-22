import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

export const getCategories = async () => {
  return await apiGet('/api/categories/');
};

export const createCategory = async (categoryData) => {
  return await apiPost('/api/categories/', categoryData);
};

export const updateCategory = async (id, categoryData) => {
  return await apiPut(`/api/categories/${id}`, categoryData);
};

export const deleteCategory = async (id) => {
  return await apiDelete(`/api/categories/${id}`);
};