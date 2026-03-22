import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

// جلب جميع المواد التعليمية
export const getAllEducationalMaterials = async () => {
  return apiGet('/api/educational-materials');
};

// جلب المواد التعليمية حسب الصف
export const getEducationalMaterialsByGrade = async (grade) => {
  return apiGet(`/api/educational-materials/grade/${encodeURIComponent(grade)}`);
};

// إضافة مادة تعليمية جديدة
export const createEducationalMaterial = async (data) => {
  return apiPost('/api/educational-materials', data);
};

// تحديث مادة تعليمية
export const updateEducationalMaterial = async (id, data) => {
  return apiPut(`/api/educational-materials/${id}`, data);
};

// حذف مادة تعليمية
export const deleteEducationalMaterial = async (id) => {
  return apiDelete(`/api/educational-materials/${id}`);
};
