import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCourses } from '../../api/courses.js';

export const fetchCourses = createAsyncThunk(
  'courses/fetchCourses',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCourses();
      console.log('fetchCourses response:', response, 'isArray:', Array.isArray(response));
      return response;
    } catch (error) {
      console.error('fetchCourses error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  list: [],
  loading: false,
  error: null,
};

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.loading = false;
        // Handle both array and object responses
        const payload = action.payload;
        console.log('coursesSlice fulfilled, payload:', payload, 'isArray:', Array.isArray(payload));
        
        if (Array.isArray(payload)) {
          state.list = payload;
          console.log('Set courses list (array):', state.list.length, 'items');
        } else if (payload && Array.isArray(payload.courses)) {
          state.list = payload.courses;
          console.log('Set courses list (payload.courses):', state.list.length, 'items');
        } else if (payload && payload.data && Array.isArray(payload.data)) {
          state.list = payload.data;
          console.log('Set courses list (payload.data):', state.list.length, 'items');
        } else {
          console.warn('Unexpected courses response format:', payload);
          state.list = [];
        }
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = coursesSlice.actions;
export default coursesSlice.reducer;