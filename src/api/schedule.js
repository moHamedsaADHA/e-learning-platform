import { apiGet, apiPost, apiPut, apiDelete } from './apiClient.js';

export const getSchedule = async () => {
  return await apiGet('/api/schedule/');
};

export const getScheduleByGrade = async (gradeParam) => {
  return await apiGet(`/api/schedule/grade/${gradeParam}`);
};

export const createSchedule = async (scheduleData) => {
  return await apiPost('/api/schedule/', scheduleData);
};

export const updateSchedule = async (id, scheduleData) => {
  return await apiPut(`/api/schedule/${id}`, scheduleData);
};

export const deleteSchedule = async (id) => {
  return await apiDelete(`/api/schedule/${id}`);
};

// Student Calendar APIs
export const getStudentCalendar = async (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  
  const queryString = params.toString();
  return await apiGet(`/api/students/calendar${queryString ? `?${queryString}` : ''}`);
};

export const getStudentDayEvents = async (date) => {
  return await apiGet(`/api/students/calendar/day/${date}`);
};