import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getStudentCalendar, getStudentDayEvents } from '../api/schedule.js';
import { getMyQuizResults } from '../api/quizzes.js';
import { showToast } from '../utils/helpers.js';
import StudentTaskResults from '../components/StudentTaskResults.jsx';
import * as tasksApi from '../api/tasks.js';
import { getStudentOverallProgress } from '../api/student.js';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('info');
  const [calendarData, setCalendarData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [quizResults, setQuizResults] = useState([]);
  const [taskResults, setTaskResults] = useState({ results: [], statistics: {} });
  const [overallProgress, setOverallProgress] = useState(null);
  const [loadingOverall, setLoadingOverall] = useState(false);
  // جلب المستوى العام للطالب
  const fetchOverallProgress = async () => {
    try {
      setLoadingOverall(true);
      const response = await getStudentOverallProgress();
      if (response.success && response.data) {
        setOverallProgress(response.data);
      } else {
        setOverallProgress(null);
      }
    } catch (error) {
      setOverallProgress(null);
    } finally {
      setLoadingOverall(false);
    }
  };

  // بيانات وهمية للدرجات
  const studentGrades = [
    { subject: 'رياضيات - جبر', score: 85, total: 100, grade: 'جيد جدًا', color: 'text-blue-600' },
    { subject: 'رياضيات - هندسة', score: 92, total: 100, grade: 'ممتاز', color: 'text-green-600' },
    { subject: 'فيزياء', score: 78, total: 100, grade: 'جيد', color: 'text-yellow-600' },
    { subject: 'كيمياء', score: 88, total: 100, grade: 'جيد جدًا', color: 'text-blue-600' },
    { subject: 'لغة عربية', score: 95, total: 100, grade: 'ممتاز', color: 'text-green-600' }
  ];

  // جلب نتائج المهام من الباك إند (نفس منطق الكويزات)
  const fetchTaskResults = async () => {
    try {
      const response = await tasksApi.getMyTaskResults();
      if (response.success && response.data) {
        setTaskResults(response.data);
      } else {
        setTaskResults({ results: [], statistics: {} });
      }
    } catch (error) {
      setTaskResults({ results: [], statistics: {} });
      showToast('حدث خطأ في جلب نتائج المهام', 'error');
    }
  };
  // جلب بيانات التقويم من الباك إند
  const fetchCalendarData = async () => {
    try {
      setIsLoading(true);
      const response = await getStudentCalendar(selectedMonth, selectedYear);
      setCalendarData(response.data);
    } catch (error) {
      let msg = 'حدث خطأ في جلب بيانات التقويم';
      if (error?.response?.data?.message === 'Forbidden: insufficient permissions' || error?.message === 'Forbidden: insufficient permissions') {
        msg = 'ليس لديك صلاحية لعرض تقويم الطالب.';
      }
      showToast(msg, 'error');
      setCalendarData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // جلب نتائج الكويزات من الباك إند
  const fetchQuizResults = async () => {
    try {
      const response = await getMyQuizResults();
      console.log('Quiz Results Response:', response); // للتطوير
      if (response.success && response.data) {
        setQuizResults(response.data);
      }
    } catch (error) {
      console.error('خطأ في جلب نتائج الكويزات:', error);
      showToast('حدث خطأ في جلب نتائج الكويزات', 'error');
      // في حالة الخطأ، اعرض بيانات فارغة
      setQuizResults({ results: [], statistics: {} });
    }
  };

  // جلب البيانات عند تحميل المكون أو تغيير الشهر/السنة
  useEffect(() => {
    if (activeTab === 'schedule') {
      fetchCalendarData();
    } else if (activeTab === 'grades') {
      fetchQuizResults();
    } else if (activeTab === 'taskResults') {
      fetchTaskResults();
    }
    // جلب المستوى العام عند فتح الصفحة لأول مرة فقط
    if (!overallProgress && !loadingOverall) {
      fetchOverallProgress();
    }
  }, [activeTab, selectedMonth, selectedYear]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <ProfileInfo user={user} />;
      case 'grades':
        return <StudentGrades grades={studentGrades} quizResults={quizResults} />;
      case 'taskResults':
        return <StudentTaskResults taskResults={taskResults} />;
      case 'schedule':
        return (
          <StudentSchedule 
            calendarData={calendarData}
            isLoading={isLoading}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        );
      default:
        return <ProfileInfo user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">الملف الشخصي</h1>

        {/* نافذة المستوى العام بشكل شريط دائري جميل */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-primary-100 to-blue-100 dark:from-primary-900/40 dark:to-blue-900/40 rounded-xl shadow p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 w-full">
              <div className="relative flex items-center justify-center" style={{ width: 100, height: 100 }}>
                {/* شريط التقدم الدائري */}
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="#2563eb"
                    strokeWidth="10"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={
                      loadingOverall || !overallProgress
                        ? 2 * Math.PI * 42
                        : 2 * Math.PI * 42 * (1 - overallProgress.overallPercentage / 100)
                    }
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(.4,2,.6,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-bold text-primary-700 dark:text-primary-300">
                    {loadingOverall ? (
                      <span className="text-gray-500 dark:text-gray-300 text-sm">...</span>
                    ) : overallProgress ? (
                      <>{overallProgress.overallPercentage}<span className="text-base">%</span></>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-300 text-sm">--%</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">المستوى العام</div>
                </div>
              </div>
              <div className="flex-1">
                <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">مستواك العام</div>
                {loadingOverall ? (
                  <span className="text-gray-500 dark:text-gray-300 text-sm">جاري التحميل...</span>
                ) : overallProgress ? (
                  <div className="flex flex-col gap-1">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      إجمالي الأنشطة: <span className="font-bold">{overallProgress.totalActivities}</span>
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-400">
                      ✅ ناجح: <span className="font-bold">{overallProgress.passed}</span>
                    </div>
                    <div className="text-sm text-red-700 dark:text-red-400">
                      ❌ راسب: <span className="font-bold">{overallProgress.failed}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-300 text-sm">لا يوجد بيانات</span>
                )}
              </div>
            </div>
            <button
              onClick={fetchOverallProgress}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition mt-4 sm:mt-0"
              disabled={loadingOverall}
            >تحديث المستوى</button>
          </div>
        </div>

        {/* Dropdown للموبايل فقط */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 p-4 block sm:hidden">
          <select
            value={activeTab}
            onChange={e => setActiveTab(e.target.value)}
            className="w-full py-3 px-4 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow"
          >
            <option value="info">👤 معلومات الطالب</option>
            <option value="grades">📊 درجات الطالب</option>
            <option value="taskResults">📝 نتائج المهام</option>
            <option value="schedule">📅 تقويم الطالب</option>
          </select>
        </div>
        {/* أزرار أفقية لسطح المكتب والأجهزة المتوسطة فما فوق */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md mb-6 hidden sm:block">
          <nav className="flex space-x-1 space-x-reverse p-1">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse ${
                activeTab === 'info'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>👤</span>
              <span>معلومات الطالب</span>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse ${
                activeTab === 'grades'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>📊</span>
              <span>درجات الطالب</span>
            </button>
            <button
              onClick={() => setActiveTab('taskResults')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse ${
                activeTab === 'taskResults'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>📝</span>
              <span>نتائج المهام</span>
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center space-x-2 space-x-reverse ${
                activeTab === 'schedule'
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span>📅</span>
              <span>تقويم الطالب</span>
            </button>
          </nav>
        </div>

        <div className="animate-fadeIn">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

// مكون عرض معلومات الطالب
const ProfileInfo = ({ user }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
    <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 md:space-x-reverse">
      <div className="flex-shrink-0">
        <img
          src="/default_user.png"
          alt="صورة الطالب"
          className="w-32 h-32 rounded-full border-4 border-primary-200 dark:border-primary-800 object-cover"
        />
      </div>
      <div className="flex-1 text-center md:text-right">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {user?.name || 'اسم الطالب'}
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse">
            <span className="text-xl">📧</span>
            <span className="text-gray-600 dark:text-gray-300">
              {user?.email || 'البريد الإلكتروني'}
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse">
            <span className="text-xl">🎓</span>
            <span className="text-gray-600 dark:text-gray-300">
              {user?.grade || 'الصف الدراسي'}
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse">
            <span className="text-xl">�</span>
            <span className="text-gray-600 dark:text-gray-300">
              الدور: <span className={`font-medium px-2 py-1 rounded text-sm ${
                user?.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                user?.role === 'instructor' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              }`}>
                {user?.role === 'admin' ? 'مدير' : user?.role === 'instructor' ? 'مدرس' : 'طالب'}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse">
            <span className="text-xl">�🔑</span>
            <span className="text-gray-600 dark:text-gray-300">
              كود الطالب: <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm">{user?.code || '---'}</span>
            </span>
          </div>
          <div className="flex items-center justify-center md:justify-start space-x-2 space-x-reverse">
            <span className="text-xl">📅</span>
            <span className="text-gray-600 dark:text-gray-300">
              تاريخ التسجيل: {new Date().toLocaleDateString('ar')}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// مكون عرض درجات الطالب
const StudentGrades = ({ grades, quizResults }) => {
  // دالة لحساب التقدير بناءً على النسبة المئوية
  const getGradeInfo = (percentage) => {
    if (percentage >= 90) {
      return { grade: 'ممتاز', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900', emoji: '🏆' };
    } else if (percentage >= 80) {
      return { grade: 'جيد جداً', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900', emoji: '⭐' };
    } else if (percentage >= 70) {
      return { grade: 'جيد', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900', emoji: '👍' };
    } else if (percentage >= 60) {
      return { grade: 'مقبول', color: 'text-orange-600', bgColor: 'bg-orange-100 dark:bg-orange-900', emoji: '📈' };
    } else {
      return { grade: 'راسب', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900', emoji: '📚' };
    }
  };

  // دالة للحصول على لون الأداء
  const getPerformanceColor = (performance) => {
    switch(performance) {
      case 'ممتاز':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'جيد جداً':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'جيد':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'يحتاج تحسين':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* درجات الكويزات */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2 space-x-reverse">
          <span>🧠</span>
          <span>نتائج الكويزات</span>
        </h3>
        
        {quizResults && quizResults.results && quizResults.results.length > 0 ? (
          <div className="space-y-6">
            {/* إحصائيات سريعة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {quizResults.statistics?.totalQuizzes || 0}
                </div>
                <div className="text-sm text-blue-500 dark:text-blue-300">إجمالي الكويزات</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {quizResults.statistics?.averageScore || 0}%
                </div>
                <div className="text-sm text-green-500 dark:text-green-300">المتوسط العام</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {quizResults.statistics?.bestScore || 0}%
                </div>
                <div className="text-sm text-yellow-500 dark:text-yellow-300">أفضل نتيجة</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {quizResults.statistics?.totalTimeSpent?.display || '0:00'}
                </div>
                <div className="text-sm text-purple-500 dark:text-purple-300">إجمالي الوقت</div>
              </div>
            </div>

            {/* جدول النتائج المفصل */}
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">🧠 اسم الكويز</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📚 المادة</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">🔢 الدرجة</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📊 النسبة</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">🏅 التقدير</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📈 الأداء</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">⏱️ الوقت</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📅 التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {quizResults.results.map((result, index) => {
                    const gradeInfo = getGradeInfo(result.score.percentage);
                    const performanceClass = getPerformanceColor(result.performance);
                    
                    return (
                      <tr key={result.id || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="text-lg">{gradeInfo.emoji}</span>
                            <span>{result.quiz.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {result.quiz.subject}
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {result.score.earnedPoints} / {result.score.totalPoints}
                          </span>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {result.score.correctAnswers}/{result.score.totalQuestions} صحيح
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${gradeInfo.bgColor} ${gradeInfo.color}`}>
                              {result.score.percentage}
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-semibold px-3 py-1 rounded-full ${gradeInfo.color} ${gradeInfo.bgColor}`}>
                            {result.grade.description}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-medium px-3 py-1 rounded-full ${performanceClass}`}>
                            {result.performance}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <span className="text-sm">⏱️</span>
                            <span className="font-mono text-sm">{result.timeSpent.display}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {new Date(result.completedAt).toLocaleDateString('ar-EG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🧠</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد نتائج كويزات بعد
              </h4>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                ابدأ في حل الكويزات لترى نتائجك هنا
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-3 text-sm text-blue-600 dark:text-blue-400">
                💡 نصيحة: حل الكويزات يساعدك على تقييم مستواك وتحسين أدائك
              </div>
            </div>
          </div>
        )}
      </div>

     
    </div>
  );
};

// مكون عرض تقويم الطالب
const StudentSchedule = ({ 
  calendarData, 
  isLoading, 
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  onYearChange 
}) => {
  const months = [
    { value: 1, label: 'يناير' },
    { value: 2, label: 'فبراير' },
    { value: 3, label: 'مارس' },
    { value: 4, label: 'أبريل' },
    { value: 5, label: 'مايو' },
    { value: 6, label: 'يونيو' },
    { value: 7, label: 'يوليو' },
    { value: 8, label: 'أغسطس' },
    { value: 9, label: 'سبتمبر' },
    { value: 10, label: 'أكتوبر' },
    { value: 11, label: 'نوفمبر' },
    { value: 12, label: 'ديسمبر' }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return timeString || 'غير محدد';
  };

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'schedule': return '📚';
      case 'task': return '📝';
      case 'quiz': return '🧪';
      case 'lesson': return '🎥';
      default: return '📅';
    }
  };

  const getEventTypeName = (type) => {
    switch (type) {
      case 'schedule': return 'محاضرة';
      case 'task': return 'مهمة';
      case 'quiz': return 'اختبار';
      case 'lesson': return 'درس';
      default: return 'حدث';
    }
  };

  const getAllEvents = () => {
    const calendarArr = Array.isArray(calendarData?.calendar) ? calendarData.calendar : [];
    const allEvents = [];
    calendarArr.forEach(dayData => {
      const date = dayData.date;
      // إضافة الجداول الدراسية
      Array.isArray(dayData.schedules) && dayData.schedules.forEach(schedule => {
        allEvents.push({
          ...schedule,
          date,
          type: 'schedule',
          displayTitle: schedule.title || schedule.subject,
          displayTime: `${schedule.timeFrom} - ${schedule.timeTo}`
        });
      });
      // إضافة المهام
      Array.isArray(dayData.tasks) && dayData.tasks.forEach(task => {
        allEvents.push({
          ...task,
          date,
          type: 'task',
          displayTitle: task.title,
          displayTime: new Date(task.dueDate).toLocaleTimeString('ar', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        });
      });
      // إضافة الاختبارات
      Array.isArray(dayData.quizzes) && dayData.quizzes.forEach(quiz => {
        allEvents.push({
          ...quiz,
          date,
          type: 'quiz',
          displayTitle: quiz.title,
          displayTime: `${quiz.duration} دقيقة`
        });
      });
      // إضافة الدروس
      Array.isArray(dayData.lessons) && dayData.lessons.forEach(lesson => {
        allEvents.push({
          ...lesson,
          date,
          type: 'lesson',
          displayTitle: lesson.title,
          displayTime: new Date(lesson.createdAt).toLocaleTimeString('ar', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        });
      });
    });
    return allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2 space-x-reverse">
          <span>📅</span>
          <span>تقويم الطالب</span>
        </h3>
        
        {/* فلاتر الشهر والسنة */}
        <div className="flex gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[2024, 2025, 2026].map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* إحصائيات التقويم */}
      {calendarData?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {calendarData.stats.totalSchedules}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">محاضرات</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {calendarData.stats.totalTasks}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">مهام</div>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {calendarData.stats.totalQuizzes}
            </div>
            <div className="text-sm text-orange-700 dark:text-orange-300">اختبارات</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {calendarData.stats.totalLessons}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">دروس</div>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="mr-2 text-gray-600 dark:text-gray-400">جاري تحميل التقويم...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📆 التاريخ</th>
                <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📋 النوع</th>
                <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📚 العنوان</th>
                <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">🕐 الوقت</th>
              </tr>
            </thead>
            <tbody>
              {getAllEvents().length > 0 ? (
                getAllEvents().map((event, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                      {formatDate(event.date)}
                    </td>
                    <td className="py-4 px-4">
                      <span className="flex items-center space-x-2 space-x-reverse">
                        <span>{getEventTypeIcon(event.type)}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getEventTypeName(event.type)}
                        </span>
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                      {event.displayTitle}
                    </td>
                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                      {event.displayTime}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 px-4 text-center text-gray-500 dark:text-gray-400">
                    لا توجد أحداث في هذا الشهر
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Profile;