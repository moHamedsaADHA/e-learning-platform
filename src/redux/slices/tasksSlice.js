import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasksByGrade } from '../../api/tasks.js';

export const fetchTasksByGrade = createAsyncThunk(
  'tasks/fetchTasksByGrade',
  async (gradeParam, { rejectWithValue }) => {
    try {
      const response = await getTasksByGrade(gradeParam);
      // Handle API response structure
      const tasks = response?.data || response || [];
      return { gradeParam, tasks };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  byGrade: {},
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasksByGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasksByGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.byGrade[action.payload.gradeParam] = action.payload.tasks;
      })
      .addCase(fetchTasksByGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = tasksSlice.actions;
export default tasksSlice.reducer;