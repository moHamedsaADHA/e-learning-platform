import { apiPost } from './apiClient.js';

export const signup = async (userData) => {
  return await apiPost('/api/users/', userData);
};

export const login = async (credentials) => {
  return await apiPost('/api/users/login', credentials);
};

export const verifyOtp = async (otpData) => {
  return await apiPost('/api/users/verify-otp', otpData);
};

export const resendOtp = async (email) => {
  return await apiPost('/api/users/resend-otp', { email });
};

export const changePassword = async (passwordData) => {
  // Extract only the required fields for the backend
  const { email, oldPassword, newPassword } = passwordData;
  return await apiPost('/api/users/change-password', {
    email,
    oldPassword,
    newPassword
  });
};

export const requestPasswordReset = async (email) => {
  return await apiPost('/api/users/reset-password/request', { email });
};

export const performPasswordReset = async (resetData) => {
  return await apiPost('/api/users/reset-password/perform', resetData);
};

// Refresh Token endpoint
export const refreshToken = async (refreshToken) => {
  return await apiPost('/auth/refresh-token', { refreshToken });
};

// Forgot Password endpoints
export const forgotPassword = async (email) => {
  return await apiPost('/auth/forgot-password', { email });
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
  return await apiPost('/auth/reset-password', { 
    token, 
    newPassword, 
    confirmPassword 
  });
};