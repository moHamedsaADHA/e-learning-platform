import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import GradePage from './pages/GradePage.jsx';
import LessonPage from './pages/LessonPage.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Grades from './pages/Grades.jsx';
import QuizPage from './pages/QuizPage.jsx';
import QuizResults from './pages/QuizResults.jsx';
import NotFound from './pages/NotFound.jsx';
import TaskPage from './pages/TaskPage.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import useAutoRefreshToken from './utils/useAutoRefreshToken.js';
import './App.css';

const AppContent = () => {
  useAutoRefreshToken();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-arabic" dir="rtl">
      <Header />
      <main className="min-h-screen pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/grades/:gradeSlug" element={<GradePage />} />
          <Route path="/lessons/:id" element={
            <ProtectedRoute>
              <LessonPage />
            </ProtectedRoute>
          } />
          <Route path="/quiz/:quizId" element={
            <ProtectedRoute>
              <QuizPage />
            </ProtectedRoute>
          } />
          <Route path="/task/:taskId" element={
            <ProtectedRoute>
              <TaskPage />
            </ProtectedRoute>
          } />
          <Route path="/quiz-results" element={
            <ProtectedRoute>
              <QuizResults />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;