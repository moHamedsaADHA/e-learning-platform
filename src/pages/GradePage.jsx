import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import GradeNavbar from '../components/GradeNavbar.jsx';
import EducationalMaterialsByGrade from '../components/EducationalMaterialsByGrade.jsx';
import LessonCard from '../components/LessonCard.jsx';
import GradeProtectedRoute from '../components/GradeProtectedRoute.jsx';
import { fetchLessonsByGrade } from '../redux/slices/lessonsSlice.js';
import { fetchTasksByGrade } from '../redux/slices/tasksSlice.js';
import { fetchQuizzesByGrade } from '../redux/slices/quizzesSlice.js';
import { fetchScheduleByGrade } from '../redux/slices/scheduleSlice.js';
import { 
  reverseGradeMapping, 
  lessonsGradeMapping,
  tasksQuizzesGradeMapping,
  scheduleGradeMapping
} from '../utils/gradeMapping.js';
import { formatDate } from '../utils/helpers.js';

const GradePage = () => {
  const { gradeSlug } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lessons');
  const [lessonsDisplayMode, setLessonsDisplayMode] = useState('grid'); // grid | list | masonry
  const dispatch = useDispatch();
  
  const gradeName = reverseGradeMapping[gradeSlug];
  
  // Get the correct API parameters for each service
  const lessonsParam = gradeName ? lessonsGradeMapping[gradeName] : null;
  const tasksQuizzesParam = gradeName ? tasksQuizzesGradeMapping[gradeName] : null;
  const scheduleParam = gradeName ? scheduleGradeMapping[gradeName] : null;
  
  // Get data from Redux state using the correct parameters as keys
  const lessons = useSelector(state => state.lessons.byGrade[lessonsParam] || []);
  const tasks = useSelector(state => state.tasks.byGrade[tasksQuizzesParam] || []);
  const quizzes = useSelector(state => state.quizzes.byGrade[tasksQuizzesParam] || []);
  const schedule = useSelector(state => state.schedule.byGrade[scheduleParam] || []);
  const loading = useSelector(state => 
    state.lessons.loading || state.tasks.loading || state.quizzes.loading || state.schedule.loading
  );

  useEffect(() => {
    if (gradeName && lessonsParam && tasksQuizzesParam && scheduleParam) {
      dispatch(fetchLessonsByGrade(lessonsParam));
      dispatch(fetchTasksByGrade(tasksQuizzesParam));
      dispatch(fetchQuizzesByGrade(tasksQuizzesParam));
      dispatch(fetchScheduleByGrade(scheduleParam));
    }
  }, [dispatch, gradeName, lessonsParam, tasksQuizzesParam, scheduleParam]);

  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lessons':
        return (
          <div>
            <div className="flex justify-end mb-6 gap-2"></div>
            {/* عرض الدروس حسب النمط */}
            {lessons.length > 0 ? (
              <>
                {lessonsDisplayMode === 'grid' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {lessons.map(lesson => (
                      <LessonCard key={lesson.id} lesson={lesson} />
                    ))}
                  </div>
                )}
                {lessonsDisplayMode === 'list' && (
                  <div className="flex flex-col gap-4">
                    {lessons.map(lesson => (
                      <div key={lesson.id} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 flex items-center gap-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex-1">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{lesson.title}</h2>
                          <p className="text-gray-600 dark:text-gray-300 mb-2">{lesson.description}</p>
                          <span className="inline-block text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded px-2 py-1">{lesson.subject}</span>
                        </div>
                        <Link to={`/lesson/${lesson.id}`} className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition">عرض الدرس</Link>
                      </div>
                    ))}
                  </div>
                )}
                {lessonsDisplayMode === 'masonry' && (
                  <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {lessons.map(lesson => (
                      <div key={lesson.id} className="mb-6 break-inside-avoid bg-white dark:bg-gray-800 rounded-xl shadow p-5 border border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{lesson.title}</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">{lesson.description}</p>
                        <span className="inline-block text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded px-2 py-1">{lesson.subject}</span>
                        <div className="mt-3">
                          <Link to={`/lesson/${lesson.id}`} className="px-3 py-1 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition text-sm">عرض الدرس</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="empty-state">لا توجد دروس متاحة حالياً</p>
            )}
          </div>
        );
      case 'materials':
        return <EducationalMaterialsByGrade grade={gradeName} />;

      case 'schedule':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📅 الجدول الدراسي</h2>
              <p className="text-gray-600 dark:text-gray-400">مواعيد الحصص والدروس الأسبوعية</p>
            </div>

            {schedule.length > 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                  <h3 className="text-xl font-bold text-white">جدول {schedule[0]?.grade}</h3>
                </div>

                {/* Schedule Grid */}
                <div className="p-3 sm:p-6">
                  <div className="grid gap-3 sm:gap-4">
                    {schedule.map(item => (
                      <div key={item._id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col space-y-3">
                          {/* Main Info Row - Day, Date and Subject */}
                          <div className="flex items-start space-x-3 space-x-reverse">
                            <div className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full p-2 sm:p-3 flex-shrink-0">
                              <span className="text-lg sm:text-xl font-bold">{item.day}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg truncate">{item.subject}</h4>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                {new Date(item.date).toLocaleDateString('ar-EG', { 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Bottom Row - Time and Instructor (Responsive) */}
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse">
                            {/* Time */}
                            <div className="flex items-center justify-center sm:justify-start space-x-2 space-x-reverse bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700">
                              <span className="text-base sm:text-lg">🕐</span>
                              <div className="flex items-center space-x-1 space-x-reverse">
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">من</p>
                                  <p className="font-bold text-gray-900 dark:text-white text-sm">{item.timeFrom}</p>
                                </div>
                                <span className="text-gray-400 mx-1">→</span>
                                <div className="text-center">
                                  <p className="text-xs text-gray-500 dark:text-gray-400">إلى</p>
                                  <p className="font-bold text-gray-900 dark:text-white text-sm">{item.timeTo}</p>
                                </div>
                              </div>
                            </div>

                            {/* Instructor */}
                            {item.instructor && (
                              <div className="flex items-center justify-center sm:justify-start space-x-2 space-x-reverse bg-blue-50 dark:bg-blue-900/50 rounded-lg px-3 py-2 flex-shrink-0">
                                <span className="text-base sm:text-lg">👨‍🏫</span>
                                <div className="text-center sm:text-right">
                                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">المدرس</p>
                                  <p className="text-xs text-blue-500 dark:text-blue-300 truncate max-w-[150px] sm:max-w-none">{item.instructor.email}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 px-3 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-center sm:text-right">📊 إجمالي الحصص: {schedule.length}</span>
                    <span className="text-center sm:text-left">📅 آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="max-w-md mx-auto">
                  <span className="text-6xl mb-4 block">📅</span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    لا يوجد جدول دراسي متاح
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    سيتم إضافة الجدول الدراسي قريباً
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📝 الواجبات</h2>
              <p className="text-gray-600 dark:text-gray-400">مهام وواجبات الصف</p>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-6">
                {tasks[0]?.statistics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {tasks[0].statistics.gradeOverview.totalTasks}
                      </div>
                      <div className="text-sm text-blue-500 dark:text-blue-300">إجمالي المهام</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {tasks[0].statistics.gradeOverview.activeTasks}
                      </div>
                      <div className="text-sm text-green-500 dark:text-green-300">مهام نشطة</div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {tasks[0].statistics.gradeOverview.expiredTasks}
                      </div>
                      <div className="text-sm text-red-500 dark:text-red-300">منتهية الصلاحية</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {tasks[0].statistics.gradeOverview.urgentTasks}
                      </div>
                      <div className="text-sm text-orange-500 dark:text-orange-300">مهام عاجلة</div>
                    </div>
                  </div>
                )}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white">واجبات {tasks[0]?.grade}</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {tasks.map(task => (
                      <div key={task._id || task.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="font-bold text-lg text-gray-900 dark:text-white mb-1">{task.title}</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{task.description}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">المادة: {task.subject}</div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-center">
                          <button
                            onClick={() => navigate(`/task/${task._id || task.id}`)}
                            className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                          >
                            حل المهمة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {tasks[0]?.pagination && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>📊 صفحة {tasks[0].pagination.currentPage} من {tasks[0].pagination.totalPages}</span>
                        <span>📝 إجمالي المهام: {tasks[0].pagination.totalTasks}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="max-w-md mx-auto">
                  <span className="text-6xl mb-4 block">📝</span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    لا توجد واجبات متاحة
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    سيتم إضافة الواجبات قريباً
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      // تمت معالجة نافذة المواد التعليمية أعلاه

      case 'quizzes':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🧠 الكويزات</h2>
              <p className="text-gray-600 dark:text-gray-400">اختبارات وكويزات الصف</p>
            </div>

            {quizzes.length > 0 ? (
              <div className="space-y-6">
                {/* Statistics Cards */}
                {quizzes[0]?.statistics && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-purple-50 dark:bg-purple-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {quizzes[0].statistics.gradeOverview.totalQuizzes}
                      </div>
                      <div className="text-sm text-purple-500 dark:text-purple-300">إجمالي الكويزات</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {quizzes[0].statistics.gradeOverview.activeQuizzes}
                      </div>
                      <div className="text-sm text-green-500 dark:text-green-300">كويزات نشطة</div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {quizzes[0].statistics.gradeOverview.totalQuestions}
                      </div>
                      <div className="text-sm text-blue-500 dark:text-blue-300">إجمالي الأسئلة</div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/50 rounded-xl p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {quizzes[0].statistics.gradeOverview.avgTimeLimit}
                      </div>
                      <div className="text-sm text-orange-500 dark:text-orange-300">متوسط الوقت (د)</div>
                    </div>
                  </div>
                )}

                {/* Quizzes List */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
                    <h3 className="text-xl font-bold text-white">كويزات {quizzes[0]?.grade}</h3>
                  </div>

                  <div className="p-6 space-y-6">
                    {quizzes.map(quiz => (
                      <div key={quiz._id} className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-600">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                          {/* Quiz Info */}
                          <div className="flex-1">
                            <div className="flex items-start space-x-4 space-x-reverse mb-4">
                              <div className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full p-3 flex-shrink-0">
                                <span className="text-xl font-bold">🧠</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                  {quiz.title}
                                </h4>
                                {quiz.description && (
                                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-3">
                                    {quiz.description}
                                  </p>
                                )}
                                
                                {/* Subject */}
                                <div className="flex items-center space-x-2 space-x-reverse mb-3">
                                  <span className="bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                                    📚 {quiz.subject}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    quiz.isActive 
                                      ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' 
                                      : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                  }`}>
                                    {quiz.isActive ? '✅ نشط' : '❌ غير نشط'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quiz Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {quiz.totalQuestions}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">أسئلة</div>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {quiz.totalPoints}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">نقاط</div>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                  {quiz.timeLimit}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">دقيقة</div>
                              </div>
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center border border-gray-200 dark:border-gray-700">
                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                  {quiz.questions?.length || 0}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">أسئلة محملة</div>
                              </div>
                            </div>

                            {/* Questions Preview */}
                            {quiz.questions && quiz.questions.length > 0 && (
                              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                               
                                <div className="space-y-2">
                                 
                                
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-3 lg:ml-6">
                            <button 
                              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                quiz.isActive
                                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
                                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                              }`} 
                              disabled={!quiz.isActive}
                              onClick={() => quiz.isActive && handleStartQuiz(quiz._id)}
                            >
                              {quiz.isActive ? '🚀 ابدأ الكويز' : '🔒 غير متاح'}
                            </button>
                            
                            <div className="text-right text-xs text-gray-500 dark:text-gray-400 space-y-1">
                              
                              <div>📅 أُنشئ في: {new Date(quiz.createdAt).toLocaleDateString('ar-EG')}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Footer */}
                  {quizzes[0]?.pagination && (
                    <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>📊 صفحة {quizzes[0].pagination.currentPage} من {quizzes[0].pagination.totalPages}</span>
                        <span>🧠 إجمالي الكويزات: {quizzes[0].pagination.totalQuizzes}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                <div className="max-w-md mx-auto">
                  <span className="text-6xl mb-4 block">🧠</span>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    لا توجد كويزات متاحة
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    سيتم إضافة الكويزات قريباً
                  </p>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!gradeName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">الصف غير موجود</h1>
          <Link to="/grades" className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium">العودة للكورسات</Link>
        </div>
      </div>
    );
  }

  return (
    <GradeProtectedRoute requiredGradeSlug={gradeSlug}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex items-center space-x-2 space-x-reverse text-sm text-gray-500 dark:text-gray-400 mb-4">
              <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400">الرئيسية</Link>
              <span>/</span>
              <Link to="/grades" className="hover:text-primary-600 dark:hover:text-primary-400">الكورسات</Link>
              <span>/</span>
              <span className="text-gray-900 dark:text-white font-medium">{gradeName}</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">{gradeName}</h1>
              <Link 
                to="/grades" 
                className="inline-flex items-center px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors duration-200 font-medium"
              >
                ← العودة للكورسات
              </Link>
            </div>
          </div>

          <GradeNavbar activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-8">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 ml-3"></div>
                <span className="text-gray-600 dark:text-gray-400">جاري التحميل...</span>
              </div>
            ) : (
              renderTabContent()
            )}
          </div>
        </div>
      </div>
    </GradeProtectedRoute>
  );
};

export default GradePage;