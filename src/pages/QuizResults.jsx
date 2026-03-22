import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getMyQuizResults, getQuizResultDetails } from '../api/quizzes.js';
import { showToast } from '../utils/helpers.js';

const QuizResults = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true);
        const response = await getMyQuizResults();
        
        if (response.data) {
          setResults(response.data.results || []);
          setStatistics(response.data.statistics || null);
          setStudent(response.data.student || null);
        }
      } catch (error) {
        console.error('خطأ في تحميل النتائج:', error);
        showToast(error.response?.data?.message || 'حدث خطأ في تحميل النتائج', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, []);

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (percentage >= 80) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
    if (percentage >= 60) return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-50 dark:bg-red-900/20';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل النتائج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">نتائج الكويزات</h1>
          <Link
            to="/grades"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            العودة للمواد
          </Link>
        </div>

        {student && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              معلومات الطالب
            </h2>
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {student.name?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {student.name}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {student.grade}
                </p>
              </div>
            </div>
          </div>
        )}

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">إجمالي الكويزات</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics.totalQuizzes}
                  </p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">المعدل العام</p>
                  <p className={`text-2xl font-bold ${getGradeColor(statistics.averageScore)}`}>
                    {statistics.averageScore}%
                  </p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">أفضل نتيجة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.bestScore}%
                  </p>
                </div>
                <div className="text-3xl">🏆</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الوقت الإجمالي</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statistics.totalTimeSpent?.display}
                  </p>
                </div>
                <div className="text-3xl">⏰</div>
              </div>
            </div>
          </div>
        )}

        {results.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد نتائج كويزات
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              لم تقم بحل أي كويز حتى الآن
            </p>
            <Link
              to="/grades"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors duration-200"
            >
              تصفح المواد
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                تاريخ الكويزات
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الكويز
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      المادة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      النتيجة
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      التقدير
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الوقت
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      الإجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {result.quiz.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {result.quiz.totalQuestions} سؤال • {result.quiz.totalPoints} نقطة
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {result.quiz.subject}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`text-sm font-bold ${getGradeColor(result.score.percentage).split(' ')[0]}`}>
                            {result.score.percentage}%
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                            ({result.score.earnedPoints}/{result.score.totalPoints})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGradeColor(result.score.percentage)}`}>
                          {result.grade.letter}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {result.timeSpent.display}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(result.completedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedResult(result)}
                          className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                        >
                          عرض التفاصيل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {statistics?.gradeDistribution && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              توزيع التقديرات
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statistics.gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {count}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {grade}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedResult && (
        <QuizDetailModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
};

// مودال تفاصيل النتيجة
const QuizDetailModal = ({ result, onClose }) => {
  const [detailedResult, setDetailedResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setIsLoading(true);
        const response = await getQuizResultDetails(result.id);
        
        if (response.data) {
          setDetailedResult(response.data);
        }
      } catch (error) {
        console.error('خطأ في تحميل التفاصيل:', error);
        showToast('حدث خطأ في تحميل التفاصيل', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    if (result.id) {
      loadDetails();
    }
  }, [result.id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            تفاصيل النتيجة - {result.quiz.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">جاري تحميل التفاصيل...</p>
            </div>
          ) : detailedResult ? (
            <QuizDetailContent result={detailedResult} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">لا توجد تفاصيل متاحة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// مكون محتوى تفاصيل الكويز
const QuizDetailContent = ({ result }) => {
  return (
    <div className="space-y-6">
      {/* ملخص النتيجة */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-primary-600">
            {result.result.score.percentage}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">النسبة المئوية</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {result.result.score.earnedPoints}/{result.result.score.totalPoints}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">النقاط</div>
        </div>
        
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {result.result.timeSpent.display}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">الوقت المستغرق</div>
        </div>
      </div>

      {/* الإجابات التفصيلية */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          الإجابات التفصيلية
        </h4>
        
        <div className="space-y-4">
          {result.answers?.map((answer, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h5 className="font-medium text-gray-900 dark:text-white">
                  السؤال {answer.questionNumber}
                </h5>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    answer.isCorrect 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {answer.isCorrect ? '✅ صحيح' : '❌ خطأ'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {answer.pointsEarned}/{answer.maxPoints} نقطة
                  </span>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {answer.questionText}
              </p>
              
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">إجابتك:</span>
                  <p className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {answer.userAnswer || 'لم يتم الإجابة'}
                  </p>
                </div>
                
                {!answer.isCorrect && (
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">الإجابة الصحيحة:</span>
                    <p className="font-medium text-green-600">
                      {answer.correctAnswer}
                    </p>
                  </div>
                )}
              </div>
              
              {answer.explanation && (
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    التفسير: {answer.explanation}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizResults;