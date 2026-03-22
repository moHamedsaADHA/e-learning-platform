import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice.js';
import coursesSlice from './slices/coursesSlice.js';
import lessonsSlice from './slices/lessonsSlice.js';
import scheduleSlice from './slices/scheduleSlice.js';
import tasksSlice from './slices/tasksSlice.js';
import quizzesSlice from './slices/quizzesSlice.js';
import adminSlice from './slices/adminSlice.js';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    courses: coursesSlice,
    lessons: lessonsSlice,
    schedule: scheduleSlice,
    tasks: tasksSlice,
    quizzes: quizzesSlice,
    admin: adminSlice,
  },
});

export default store;