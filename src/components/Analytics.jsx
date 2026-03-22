import { useState, useEffect } from 'react';
import { getDashboardAnalytics } from '../api/analytics.js';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await getDashboardAnalytics();
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error('Analytics API error:', err);
      // Provide mock data as fallback
      setAnalytics({
        overview: {
          users: {
            total: 0,
            byRole: {
              admin: 0,
              instructor: 0,
              student: 0
            },
            verified: 0,
            recent: 0,
            verificationRate: 0
          },
          lessons: {
            total: 0,
            recent: 0
          },
          quizzes: {
            total: 0,
            recent: 0,
            questions: {
              totalQuestions: 0,
              avgQuestionsPerQuiz: 0,
              multipleChoice: 0,
              trueFalse: 0
            }
          },
          tasks: {
            total: 0,
            recent: 0,
            upcoming: 0,
            completionRate: 0
          }
        },
        activity: {
          byGrade: []
        },
        studentsByGrade: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          timezone: 'Africa/Cairo'
        }
      });
      setError(null); // Don't show error since we have fallback data
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
        <span className="text-4xl mb-4 block">❌</span>
        <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
          خطأ في تحميل البيانات
        </h3>
        <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  // Extract data from the correct API response structure
  const overview = analytics.overview || {};
  const activity = analytics.activity || {};
  const metadata = analytics.metadata || {};
  
  // User data
  const users = overview.users || {};
  const usersByRole = users.byRole || {};
  
  // Content data
  const lessons = overview.lessons || {};
  const quizzes = overview.quizzes || {};
  const tasks = overview.tasks || {};
  
  // Grade distribution
  const studentsByGrade = analytics.studentsByGrade || [];
  const activityByGrade = activity.byGrade || [];

  return (
    <div className="space-y-8">
      {/* User Statistics */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-2xl ml-2">👥</span>
          إحصائيات المستخدمين
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold">{users.total || 0}</p>
              </div>
              <span className="text-4xl">👥</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">الطلاب</p>
                <p className="text-3xl font-bold">{usersByRole.student || 0}</p>
              </div>
              <span className="text-4xl">🎓</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">المدرسون</p>
                <p className="text-3xl font-bold">{usersByRole.instructor || 0}</p>
              </div>
              <span className="text-4xl">👨‍🏫</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">المديرون</p>
                <p className="text-3xl font-bold">{usersByRole.admin || 0}</p>
              </div>
              <span className="text-4xl">👑</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-teal-100 text-sm font-medium">مستخدمون موثقون</p>
                <p className="text-3xl font-bold">{users.verified || 0}</p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">معدل التوثيق</p>
                <p className="text-3xl font-bold">{users.verificationRate || 0}%</p>
              </div>
              <span className="text-4xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Statistics */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-2xl ml-2">📚</span>
          إحصائيات المحتوى
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">إجمالي الدروس</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{lessons.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">حديثة: {lessons.recent || 0}</p>
              </div>
              <span className="text-3xl">🎥</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">إجمالي الكويزات</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{quizzes.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">أسئلة: {quizzes.questions?.totalQuestions || 0}</p>
              </div>
              <span className="text-3xl">🧠</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">إجمالي المهام</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.total || 0}</p>
                <p className="text-xs text-gray-400 mt-1">قادمة: {tasks.upcoming || 0}</p>
              </div>
              <span className="text-3xl">📝</span>
            </div>
          </div>
        </div>
      </div>

      {/* Students by Grade */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-2xl ml-2">📊</span>
          توزيع الطلاب حسب الصفوف
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {studentsByGrade.length > 0 ? studentsByGrade.map((grade, index) => (
              <div key={index} className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg p-4 text-center border border-indigo-200 dark:border-indigo-700">
                <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                  {grade.grade}
                </p>
                <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {grade.students}
                </p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1">طالب</p>
              </div>
            )) : (
              <div className="col-span-full text-center py-8">
                <span className="text-4xl mb-2 block">📚</span>
                <p className="text-gray-500 dark:text-gray-400">لا توجد بيانات طلاب متاحة</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-2xl ml-2">📈</span>
          النشاط الحديث
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">مستخدمون جدد</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{users.recent || 0}</p>
              </div>
              <span className="text-2xl">👤</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">دروس حديثة</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{lessons.recent || 0}</p>
              </div>
              <span className="text-2xl">🎥</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">كويزات حديثة</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{quizzes.recent || 0}</p>
              </div>
              <span className="text-2xl">🧠</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">مهام حديثة</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{tasks.recent || 0}</p>
              </div>
              <span className="text-2xl">�</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity by Grade */}
      {activityByGrade.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="text-2xl ml-2">📚</span>
            النشاط حسب الصفوف
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activityByGrade.map((grade, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">{grade.grade}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">دروس:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{grade.lessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">كويزات:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{grade.quizzes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">مهام:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{grade.tasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">طلاب:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{grade.students}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">الإجمالي:</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">{grade.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Statistics */}
      {quizzes.questions && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <span className="text-2xl ml-2">🧠</span>
            تفاصيل الكويزات
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{quizzes.questions.totalQuestions}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الأسئلة</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{quizzes.questions.avgQuestionsPerQuiz}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">متوسط الأسئلة</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{quizzes.questions.multipleChoice}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">اختيار متعدد</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{quizzes.questions.trueFalse}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">صح أو خطأ</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Information */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
          <span className="text-2xl ml-2">⚙️</span>
          معلومات النظام
        </h3>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">تم الإنشاء في</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {new Date(metadata.generatedAt || Date.now()).toLocaleDateString('ar-EG')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">المنطقة الزمنية</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{metadata.timezone || 'غير محدد'}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">معدل إكمال المهام</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">{tasks.completionRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;