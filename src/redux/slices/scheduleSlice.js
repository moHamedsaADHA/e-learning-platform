import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getSchedule, getScheduleByGrade } from '../../api/schedule.js';

export const fetchSchedule = createAsyncThunk(
  'schedule/fetchSchedule',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSchedule();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchScheduleByGrade = createAsyncThunk(
  'schedule/fetchScheduleByGrade',
  async (gradeParam, { rejectWithValue }) => {
    try {
      const response = await getScheduleByGrade(gradeParam);
      // Handle API response structure
      const schedule = response?.schedules || response || [];
      return { gradeParam, schedule };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  list: [],
  byGrade: {},
  loading: false,
  error: null,
};

const scheduleSlice = createSlice({
  name: 'schedule',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedule.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Schedule By Grade
      .addCase(fetchScheduleByGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleByGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.byGrade[action.payload.gradeParam] = action.payload.schedule;
      })
      .addCase(fetchScheduleByGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = scheduleSlice.actions;
export default scheduleSlice.reducer;