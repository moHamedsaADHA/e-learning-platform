import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getQuizzesByGrade } from '../../api/quizzes.js';

export const fetchQuizzesByGrade = createAsyncThunk(
  'quizzes/fetchQuizzesByGrade',
  async (gradeParam, { rejectWithValue }) => {
    try {
      const response = await getQuizzesByGrade(gradeParam);
      // Handle API response structure
      const quizzes = response?.data || response || [];
      return { gradeParam, quizzes };
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

const quizzesSlice = createSlice({
  name: 'quizzes',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzesByGrade.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzesByGrade.fulfilled, (state, action) => {
        state.loading = false;
        state.byGrade[action.payload.gradeParam] = action.payload.quizzes;
      })
      .addCase(fetchQuizzesByGrade.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = quizzesSlice.actions;
export default quizzesSlice.reducer;