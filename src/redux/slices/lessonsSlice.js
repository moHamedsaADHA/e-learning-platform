import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLessonsByGrade, getLessonById } from '../../api/lessons.js';

export const fetchLessonsByGrade = createAsyncThunk(
  'lessons/fetchLessonsByGrade',
  async (gradeParam, { rejectWithValue }) => {
    try {
      const response = await getLessonsByGrade(gradeParam);
      // Handle API response structure
      const lessons = response?.lessons || response || [];
      return { gradeParam, lessons };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchLessonById',
  async (lessonId, { rejectWithValue }) => {
    try {
      const response = await getLessonById(lessonId);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  byGrade: {},
  currentLesson: null,
  loading: false,
  error: null,
};

const lessonsSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    clearCurrentLesson: (state) => {
      state.currentLesson = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLessonsByGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonsByGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.byGrade[action.payload.gradeParam] = action.payload.lessons;
      })
      .addCase(fetchLessonsByGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchLessonById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentLesson = action.payload;
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentLesson, clearError } = lessonsSlice.actions;
export default lessonsSlice.reducer;