import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { login as loginApi, signup as signupApi, verifyOtp as verifyOtpApi, refreshToken as refreshTokenApi } from '../../api/auth.js';
import { setTokenOnLogin, clearTokenTimestamp } from '../../utils/tokenManager.js';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await loginApi(credentials);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setTokenOnLogin();
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await signupApi(userData);
      return response;
    } catch (error) {
      // إرجاع الـ error object الكامل مع البيانات من response
      const errorData = error.response?.data || { message: error.message };
      return rejectWithValue(errorData);
    }
  }
);

export const verifyOtpUser = createAsyncThunk(
  'auth/verifyOtpUser',
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await verifyOtpApi(otpData);
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setTokenOnLogin();
      }
      return response;
    } catch (error) {
      // إرجاع الـ error object الكامل مع البيانات من response
      const errorData = error.response?.data || { message: error.message };
      return rejectWithValue(errorData);
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await refreshTokenApi();
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setTokenOnLogin();
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('authToken') || null,
  isAuthenticated: !!localStorage.getItem('authToken'),
  loading: false,
  error: null,
  requiresOtp: false,
  tempToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.requiresOtp = false;
      state.tempToken = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      clearTokenTimestamp();
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    changePassword: (state, action) => {
      // Password change is handled by backend, no state update needed
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.requiresOtp = true;
        state.tempToken = action.payload.tempToken;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtpUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtpUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.requiresOtp = false;
        state.tempToken = null;
      })
      .addCase(verifyOtpUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Refresh Token
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // If refresh token fails, logout user
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        clearTokenTimestamp();
      });
  },
});

export const { logout, clearError, updateProfile, changePassword } = authSlice.actions;
export default authSlice.reducer;