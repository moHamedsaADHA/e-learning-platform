import React from 'react';

const StudentTaskResults = ({ taskResults }) => {
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

  const stats = taskResults?.statistics || {};
  const results = taskResults?.results || [];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2 space-x-reverse">
          <span>📝</span>
          <span>نتائج المهام</span>
        </h3>
        {results.length > 0 ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalTasks || 0}</div>
                <div className="text-sm text-blue-500 dark:text-blue-300">إجمالي المهام</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.averageScore || 0}%</div>
                <div className="text-sm text-green-500 dark:text-green-300">المتوسط العام</div>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.bestScore || 0}%</div>
                <div className="text-sm text-yellow-500 dark:text-yellow-300">أفضل نتيجة</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalTimeSpent?.display || '0:00'}</div>
                <div className="text-sm text-purple-500 dark:text-purple-300">إجمالي الوقت</div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📝 اسم المهمة</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📚 المادة</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">🔢 الدرجة</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📊 النسبة</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">🏅 التقدير</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">⏱️ الوقت</th>
                    <th className="py-3 px-4 text-gray-900 dark:text-white font-semibold">📅 التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => {
                    const gradeInfo = getGradeInfo(result.score?.percentage || 0);
                    return (
                      <tr key={result.id || index} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                        <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <span className="text-lg">{gradeInfo.emoji}</span>
                            <span>{result.task?.title}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">{result.task?.subject}</td>
                        <td className="py-4 px-4">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {result.score?.earnedPoints} / {result.score?.totalPoints}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${gradeInfo.bgColor} ${gradeInfo.color}`}>
                              {result.score?.percentage}
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">%</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-semibold px-3 py-1 rounded-full ${gradeInfo.color} ${gradeInfo.bgColor}`}>
                            {result.grade?.description || gradeInfo.grade}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1 space-x-reverse">
                            <span className="text-sm">⏱️</span>
                            <span className="font-mono text-sm">{result.timeSpent?.display}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                          {result.completedAt ? new Date(result.completedAt).toLocaleDateString('ar-EG', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) : '--'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-yellow-100 to-blue-100 dark:from-yellow-900/50 dark:to-blue-900/50 rounded-2xl p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">📝</div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                لا توجد نتائج مهام بعد
              </h4>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                ابدأ في حل المهام لترى نتائجك هنا
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/50 rounded-lg p-3 text-sm text-blue-600 dark:text-blue-400">
                💡 نصيحة: حل المهام يساعدك على تقييم مستواك وتحسين أدائك
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTaskResults;
