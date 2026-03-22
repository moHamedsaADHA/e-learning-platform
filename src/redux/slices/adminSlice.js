import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createLesson, updateLesson, deleteLesson } from '../../api/lessons.js';
import { createTask, updateTask, deleteTask } from '../../api/tasks.js';
import { createQuiz, updateQuiz, deleteQuiz } from '../../api/quizzes.js';
import { createSchedule, updateSchedule, deleteSchedule } from '../../api/schedule.js';

export const createLessonAdmin = createAsyncThunk(
  'admin/createLesson',
  async (lessonData, { rejectWithValue }) => {
    try {
      const response = await createLesson(lessonData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLessonAdmin = createAsyncThunk(
  'admin/updateLesson',
  async ({ id, lessonData }, { rejectWithValue }) => {
    try {
      const response = await updateLesson(id, lessonData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteLessonAdmin = createAsyncThunk(
  'admin/deleteLesson',
  async (id, { rejectWithValue }) => {
    try {
      const response = await deleteLesson(id);
      return { id, response };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  loading: false,
  error: null,
  lastAction: null,
  success: false,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.lastAction = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Lessons
      .addCase(createLessonAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createLessonAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastAction = 'createLesson';
      })
      .addCase(createLessonAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLessonAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateLessonAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastAction = 'updateLesson';
      })
      .addCase(updateLessonAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteLessonAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(deleteLessonAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.lastAction = 'deleteLesson';
      })
      .addCase(deleteLessonAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess } = adminSlice.actions;
export default adminSlice.reducer;