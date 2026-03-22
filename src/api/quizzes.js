import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

export const getQuizzes = async () => {
  return await apiGet('/api/quizzes/');
};

export const getQuizzesByGrade = async (gradeParam) => {
  return await apiGet(`/api/quizzes/grade/${gradeParam}`);
};

export const createQuiz = async (quizData) => {
  return await apiPost('/api/quizzes/', quizData);
};

export const updateQuiz = async (id, quizData) => {
  return await apiPut(`/api/quizzes/${id}`, quizData);
};

export const deleteQuiz = async (id) => {
  return await apiDelete(`/api/quizzes/${id}`);
};

// Student Quiz APIs
export const startQuiz = async (quizId) => {
  return await apiGet(`/api/quizzes/${quizId}/start`);
};

export const submitQuiz = async (quizId, submissionData) => {
  return await apiPost(`/api/quizzes/${quizId}/submit`, submissionData);
};

export const getMyQuizResults = async () => {
  return await apiGet('/api/quizzes/results/my-results');
};

export const getQuizResultDetails = async (resultId) => {
  return await apiGet(`/api/quizzes/results/${resultId}/details`);
};