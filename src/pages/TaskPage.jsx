import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTaskById, submitTaskAnswers } from '../api/tasks';
import { showToast } from '../utils/helpers';

// دالة تتحقق إذا كان النص رابط (http/https)
function isImageUrl(text) {
  if (!text) return false;
  return /^https?:\/\//i.test(text.trim());
}

// دالة لتحويل أي رابط Google Drive file/d/.../view إلى رابط مباشر للعرض
function getDisplayImageUrl(url) {
  if (!url) return '';
  const driveMatch = url.match(/^https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }
  return url;
}

const TaskPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [taskState, setTaskState] = useState('loading'); // loading, active, submitting, results
  const [taskResult, setTaskResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [startedAt, setStartedAt] = useState(null);

  // تحميل بيانات المهمة
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setIsLoading(true);
        const response = await getTaskById(taskId);
        if (response.data) {
          setTask(response.data);
          setQuestions(response.data.questions || []);
          setTaskState('active');
          setStartedAt(Date.now());
        }
      } catch (error) {
        showToast(error.response?.data?.message || 'حدث خطأ في تحميل المهمة', 'error');
        setTaskState('error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [taskId]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
  };

  const handleSubmitTask = async () => {
    setIsLoading(true);
    setTaskState('submitting');
    try {
      // تجهيز answers array بنفس ترتيب الأسئلة (قيمة فقط)
      const answersArray = questions.map((q, idx) => {
        if (q.type === 'اختر من متعدد') {
          return answers[idx] || '';
        } else if (q.type === 'صح وخطأ') {
          return answers[idx] === 'صح' ? true : answers[idx] === 'خطأ' ? false : '';
        } else {
          return answers[idx] || '';
        }
      });
      const payload = {
        answers: answersArray,
        startedAt: startedAt || Date.now(),
      };
      const response = await submitTaskAnswers(taskId, payload);
      setTaskResult(response.data);
      setTaskState('results');
    } catch (error) {
      showToast(error.response?.data?.message || 'حدث خطأ أثناء إرسال الإجابات', 'error');
      setTaskState('active');
    } finally {
      setIsLoading(false);
    }
  };

  if (taskState === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل المهمة...</p>
        </div>
      </div>
    );
  }

  if (taskState === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">حدث خطأ في تحميل المهمة</h2>
          <button onClick={() => navigate(-1)} className="bg-primary-600 text-white px-4 py-2 rounded-lg">العودة</button>
        </div>
      </div>
    );
  }

  if (taskState === 'results' && taskResult) {
    // تمرير result و answers من الريسبونس
    const resultData = taskResult.data?.result;
    const answersData = taskResult.data?.answers;
    return <TaskResults result={resultData} answers={answersData} onBack={() => navigate(-1)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{task?.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">{task?.description}</p>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">المادة: {task?.subject}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">عدد الأسئلة: {questions.length}</div>
        </div>

        <form onSubmit={e => { e.preventDefault(); handleSubmitTask(); }}>
          <div className="space-y-8">
            {questions.map((q, idx) => (
              <TaskQuestionCard
                key={q._id || idx}
                question={q}
                questionIndex={idx}
                userAnswer={answers[idx]}
                onAnswerChange={handleAnswerChange}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'جاري الإرسال...' : 'إرسال الإجابات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskQuestionCard = ({ question, questionIndex, userAnswer, onAnswerChange }) => {
  const [imgError, setImgError] = useState(false);
  const displayImageUrl = getDisplayImageUrl(question.questionText);

  const handleAnswerSelect = (answer) => {
    onAnswerChange(questionIndex, answer);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            السؤال {questionIndex + 1}
          </h2>
          <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
            {question.points} نقطة
          </span>
        </div>
        {isImageUrl(question.questionText) && !imgError ? (
          <div className="flex justify-center my-4">
            <img
              src={displayImageUrl}
              alt={`سؤال ${questionIndex + 1}`}
              className="max-w-full max-h-96 rounded-lg border border-gray-200 dark:border-gray-700 shadow"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {question.questionText}
          </p>
        )}
        {question.explanation && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {question.explanation}
          </p>
        )}
      </div>
      <div className="space-y-3">
        {question.type === 'اختر من متعدد' && question.options && (
          <>
            {question.options.map((option, idx) => (
              <label
                key={option._id || idx}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                  userAnswer === option._id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${questionIndex}`}
                  value={option._id}
                  checked={userAnswer === option._id}
                  onChange={() => handleAnswerSelect(option._id)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 ml-3 flex-shrink-0 ${
                  userAnswer === option._id
                    ? 'border-primary-500 bg-primary-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {userAnswer === option._id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
                <span className="text-gray-700 dark:text-gray-300 flex-1">
                  {option.text}
                </span>
              </label>
            ))}
          </>
        )}
        {question.type === 'صح وخطأ' && (
          <>
            <label
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                userAnswer === 'صح'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <input
                type="radio"
                name={`question-${questionIndex}`}
                value="صح"
                checked={userAnswer === 'صح'}
                onChange={() => handleAnswerSelect('صح')}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 ml-3 flex-shrink-0 ${
                userAnswer === 'صح'
                  ? 'border-green-500 bg-green-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {userAnswer === 'صح' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <span className="text-gray-700 dark:text-gray-300 flex-1">
                ✅ صح
              </span>
            </label>
            <label
              className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors duration-200 ${
                userAnswer === 'خطأ'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <input
                type="radio"
                name={`question-${questionIndex}`}
                value="خطأ"
                checked={userAnswer === 'خطأ'}
                onChange={() => handleAnswerSelect('خطأ')}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 ml-3 flex-shrink-0 ${
                userAnswer === 'خطأ'
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {userAnswer === 'خطأ' && (
                  <div className="w-full h-full rounded-full bg-white scale-50"></div>
                )}
              </div>
              <span className="text-gray-700 dark:text-gray-300 flex-1">
                ❌ خطأ
              </span>
            </label>
          </>
        )}
        {question.type === 'نص قصير' && (
          <textarea
            value={userAnswer || ''}
            onChange={e => handleAnswerSelect(e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
            rows="3"
          />
        )}
      </div>
    </div>
  );
};

const TaskResults = ({ result, answers, onBack }) => {
  // result: { score, ... } , answers: [{ ... }]
  // معالجة القيم بشكل آمن
  const percentage = typeof result?.score?.percentage === 'number' ? result.score.percentage : 0;
  const earnedPoints = typeof result?.score?.earnedPoints === 'number' ? result.score.earnedPoints : 0;
  const totalPoints = typeof result?.score?.totalPoints === 'number' ? result.score.totalPoints : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">تم إرسال المهمة!</h2>
          <div className="text-lg text-gray-700 dark:text-gray-300 mb-2">نتيجتك: <span className="font-bold text-primary-600">{percentage}%</span></div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">النقاط: {earnedPoints} / {totalPoints}</div>
          <button onClick={onBack} className="bg-primary-600 text-white px-4 py-2 rounded-lg">العودة</button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">الإجابات التفصيلية</h3>
          <div className="space-y-4">
            {answers?.map((answer, idx) => (
              <div key={idx} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-medium text-gray-900 dark:text-white">السؤال {answer.questionIndex}</h5>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${answer.isCorrect ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      {answer.isCorrect ? '✅ صحيح' : '❌ خطأ'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{answer.pointsEarned}/{answer.maxPoints} نقطة</span>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-3">{answer.questionText}</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">إجابتك:</span>
                    <p className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>{answer.userAnswer || 'لم يتم الإجابة'}</p>
                  </div>
                  {!answer.isCorrect && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">الإجابة الصحيحة:</span>
                      <p className="font-medium text-green-600">{answer.correctAnswer}</p>
                    </div>
                  )}
                </div>
                {answer.explanation && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    <span className="font-medium text-blue-800 dark:text-blue-200">التفسير: {answer.explanation}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPage;
