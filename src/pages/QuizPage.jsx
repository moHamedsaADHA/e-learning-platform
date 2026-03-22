import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../utils/getCurrentUser.js';
import { useParams, useNavigate } from 'react-router-dom';
import { startQuiz, submitQuiz } from '../api/quizzes.js';
import { showToast } from '../utils/helpers.js';

// دالة تتحقق إذا كان النص رابط (http/https)
function isImageUrl(text) {
  if (!text) return false;
  return /^https?:\/\//i.test(text.trim());
}

// دالة لتحويل أي رابط Google Drive file/d/.../view إلى رابط مباشر للعرض
function getDisplayImageUrl(url) {
  if (!url) return url;
  const driveMatch = url.match(/^https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  return url;
}

const QuizPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizState, setQuizState] = useState('loading'); // loading, instructions, active, submitting, results
  const [quizResult, setQuizResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStartTime, setQuizStartTime] = useState(null);

  // تحميل بيانات الكويز
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setIsLoading(true);
        const response = await startQuiz(quizId);
        if (response.data) {
          setQuiz(response.data.quiz);
          setQuestions(response.data.questions);
          setTimeLeft(response.data.quiz.timeLimit * 60); // تحويل الدقائق إلى ثواني
          setQuizState('instructions');
        }
      } catch (error) {
        // إذا كان هناك previousResult في الريسبونس، اعرض الرسالة الحقيقية
        const prevResult = error.response?.data?.previousResult;
        const msg = error.response?.data?.message || error.message || 'حدث خطأ في تحميل الكويز';
        if (prevResult) {
          setQuizState('results');
          setQuizResult({ result: { score: prevResult.score, grade: prevResult.grade, quiz: { title: '' } }, answers: [], statistics: null });
          // اعرض الرسالة الحقيقية فقط
          showToast(msg, 'error');
        } else {
          showToast(msg, 'error');
          navigate('/grades');
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (quizId) {
      // السماح للطالب أو المعلم أو الأدمن بحل الكويز
      const user = getCurrentUser();
      if (!user) {
        showToast('يجب تسجيل الدخول أولاً', 'error');
        navigate('/login');
        return;
      }
      // لا تمنع أي دور من حل الكويز
      loadQuiz();
    }
  }, [quizId, navigate]);

  // عداد الوقت
  useEffect(() => {
    let timer;
    if (quizState === 'active' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitQuiz();
            return 0;
          }
          return prev - 1;

        // دالة تتحقق إذا كان النص رابط (http/https)
        function isImageUrl(text) {
          if (!text) return false;
          return /^https?:\/\//i.test(text.trim());
        }
        // دالة لتحويل أي رابط Google Drive file/d/.../view إلى رابط مباشر للعرض
        function getDisplayImageUrl(url) {
          if (!url) return url;
          const driveMatch = url.match(/^https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
          if (driveMatch) {
            const fileId = driveMatch[1];
            return `https://drive.google.com/uc?export=view&id=${fileId}`;
          }
          return url;
        }
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [quizState, timeLeft]);

  const startQuizHandler = () => {
    setQuizStartTime(new Date().toISOString());
    setQuizState('active');
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitQuiz = async () => {
    try {
      setQuizState('submitting');
      setIsLoading(true);

      // إعداد البيانات للإرسال بالتنسيق الذي يتوقعه الـ backend
      const answersArray = questions.map((question, index) => {
        const userAnswer = answers[index];
        if (question.type === 'اختر من متعدد' && Array.isArray(question.options)) {
          // اجلب كل القيم المسموحة (_id)
          const allowed = question.options.map(opt => typeof opt === 'object' && opt !== null ? opt._id : opt);
          // إذا كانت الإجابة من ضمن الخيارات، أرسلها، وإلا أرسل فارغ
          return allowed.includes(userAnswer) ? userAnswer : "";
        } else if (question.type === 'صح وخطأ') {
          return userAnswer === 'صح' || userAnswer === 'خطأ' ? userAnswer : "";
        } else {
          return userAnswer !== undefined && userAnswer !== null ? userAnswer : "";
        }
      });

      // تحقق أن جميع الأسئلة تم الإجابة عليها فعلياً (لا يوجد إجابة فارغة)
      const allAnswered = answersArray.every(ans => ans !== "" && ans !== undefined && ans !== null);
      if (!allAnswered) {
        showToast('يجب الإجابة على جميع الأسئلة قبل الإرسال', 'error');
        setQuizState('active');
        setIsLoading(false);
        return;
      }

      const submissionData = {
        answers: answersArray,
        startedAt: quizStartTime || new Date().toISOString()
      };

      // إرسال البيانات بالتنسيق الصحيح
      const response = await submitQuiz(quizId, submissionData);
      
      if (response.data) {
        setQuizResult(response.data);
        setQuizState('results');
        showToast('تم إرسال إجاباتك بنجاح!', 'success');
      }
    } catch (error) {
      console.error('خطأ في إرسال الإجابات:', error);
      showToast(error.response?.data?.message || 'حدث خطأ في إرسال الإجابات', 'error');
      setQuizState('active');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (isLoading && quizState === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">جاري تحميل الكويز...</p>
        </div>
      </div>
    );
  }

  // صفحة التعليمات
  if (quizState === 'instructions') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {quiz?.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {quiz?.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="ml-2">📋</span>
                  معلومات الكويز
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p><span className="font-medium">المادة:</span> {quiz?.subject}</p>
                  <p><span className="font-medium">عدد الأسئلة:</span> {quiz?.totalQuestions}</p>
                  <p><span className="font-medium">إجمالي النقاط:</span> {quiz?.totalPoints}</p>
                  <p><span className="font-medium">الوقت المحدد:</span> {quiz?.timeLimit} دقيقة</p>
                  <p><span className="font-medium">المعلم:</span> {quiz?.createdBy?.name}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="ml-2">📝</span>
                  تعليمات مهمة
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                  <li className="flex items-start">
                    <span className="text-primary-500 ml-2">•</span>
                    اقرأ كل سؤال بعناية قبل الإجابة
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 ml-2">•</span>
                    لديك {quiz?.timeLimit} دقيقة لإنهاء جميع الأسئلة
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 ml-2">•</span>
                    يمكنك التنقل بين الأسئلة والعودة لتعديل إجاباتك
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 ml-2">•</span>
                    تأكد من إجابة جميع الأسئلة قبل الإرسال
                  </li>
                  <li className="flex items-start">
                    <span className="text-primary-500 ml-2">•</span>
                    سيتم إرسال الكويز تلقائياً عند انتهاء الوقت
                  </li>
                </ul>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={startQuizHandler}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center mx-auto"
              >
                <span className="ml-2">🚀</span>
                ابدأ الكويز الآن
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizContent
      quiz={quiz}
      questions={questions}
      currentQuestionIndex={currentQuestionIndex}
      answers={answers}
      timeLeft={timeLeft}
      quizState={quizState}
      quizResult={quizResult}
      isLoading={isLoading}
      onAnswerChange={handleAnswerChange}
      onNextQuestion={nextQuestion}
      onPrevQuestion={prevQuestion}
      onGoToQuestion={goToQuestion}
      onSubmitQuiz={handleSubmitQuiz}
      getAnsweredCount={getAnsweredCount}
      formatTime={formatTime}
      navigate={navigate}
    />
  );
};

// مكون محتوى الكويز
const QuizContent = ({
  quiz,
  questions,
  currentQuestionIndex,
  answers,
  timeLeft,
  quizState,
  quizResult,
  isLoading,
  onAnswerChange,
  onNextQuestion,
  onPrevQuestion,
  onGoToQuestion,
  onSubmitQuiz,
  getAnsweredCount,
  formatTime,
  navigate
}) => {
  if (quizState === 'results') {
    return (
      <QuizResults 
        result={quizResult} 
        onBackToGrades={() => navigate('/grades')} 
      />
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = currentQuestionIndex === 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* شريط الحالة العلوي */}
      <div className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {quiz?.title}
              </h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {quiz?.subject}
              </span>
            </div>

            <div className="flex items-center space-x-6 space-x-reverse">
              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">الوقت المتبقي</div>
                <div className={`text-xl font-bold ${timeLeft <= 300 ? 'text-red-600' : 'text-primary-600'}`}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">تم الإجابة</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {getAnsweredCount()} / {questions.length}
                </div>
              </div>
            </div>
          </div>

          {/* شريط التقدم */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>السؤال {currentQuestionIndex + 1} من {questions.length}</span>
              <span>{Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}% مكتمل</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* قائمة الأسئلة الجانبية */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sticky top-32">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                الأسئلة
              </h3>
              <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => onGoToQuestion(index)}
                    className={`p-2 rounded text-sm font-medium transition-colors duration-200 ${
                      index === currentQuestionIndex
                        ? 'bg-primary-600 text-white'
                        : answers[index] !== undefined
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onSubmitQuiz}
                  disabled={isLoading}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {isLoading ? 'جاري الإرسال...' : 'إرسال الكويز'}
                </button>
              </div>
            </div>
          </div>

          {/* منطقة السؤال */}
          <div className="lg:col-span-3">
            {currentQuestion && (
              <QuestionCard
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                userAnswer={answers[currentQuestionIndex]}
                onAnswerChange={onAnswerChange}
              />
            )}

            {/* أزرار التنقل */}
            <div className="flex justify-between mt-6">
              <button
                onClick={onPrevQuestion}
                disabled={isFirstQuestion}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
              >
                <span className="ml-2">←</span>
                السؤال السابق
              </button>

              <button
                onClick={isLastQuestion ? onSubmitQuiz : onNextQuestion}
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors duration-200 flex items-center ${
                  isLastQuestion
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLastQuestion ? 'إرسال الكويز' : 'السؤال التالي'}
                {!isLastQuestion && <span className="mr-2">→</span>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// مكون السؤال
const QuestionCard = ({ question, questionIndex, userAnswer, onAnswerChange }) => {
  const handleAnswerSelect = (answer) => {
    let answerToStore = answer;
    if (question.type === 'اختر من متعدد' && typeof answer === 'object' && answer !== null) {
      answerToStore = answer._id;
    }
    console.log(
      `اختيار المستخدم للسؤال رقم ${questionIndex + 1} (${question.type}):`,
      answerToStore
    );
    onAnswerChange(questionIndex, answerToStore);
  };



  // دالة تتحقق إذا كان النص رابط (http/https)
  function isImageUrl(text) {
    if (!text) return false;
    return /^https?:\/\//i.test(text.trim());
  }
  // دالة لتحويل أي رابط Google Drive file/d/.../view إلى رابط مباشر للعرض
  function getDisplayImageUrl(url) {
    if (!url) return url;
    const driveMatch = url.match(/^https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
    if (driveMatch) {
      const fileId = driveMatch[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    return url;
  }

  const [imgError, setImgError] = React.useState(false);

  // استخراج رابط الصورة النهائي (يدعم Google Drive)
  const displayImageUrl = getDisplayImageUrl(question.questionText);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            السؤال {questionIndex + 1}
          </h2>
          <span className="bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full text-sm font-medium">
            {question.points} نقطة
          </span>
        </div>
        {/* عرض نص السؤال كصورة إذا كان لينك صورة أو Google Drive */}
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
            {question.options.map((option, index) => (
              <label
                key={option._id || index}
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
                  onChange={() => handleAnswerSelect(option)}
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
            onChange={(e) => handleAnswerSelect(e.target.value)}
            placeholder="اكتب إجابتك هنا..."
            className="w-full p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-primary-500 dark:bg-gray-700 dark:text-white resize-none"
            rows="3"
          />
        )}
      </div>
    </div>
  );
};

// مكون نتائج الكويز
const QuizResults = ({ result, onBackToGrades }) => {
  // لتتبع أخطاء تحميل الصور لكل سؤال
  const [imgErrors, setImgErrors] = React.useState({});

  // دالة لتحديث حالة الخطأ عند فشل تحميل صورة سؤال
  const handleImgError = (index) => {
    setImgErrors(prev => ({ ...prev, [index]: true }));
  };
  const getGradeColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getPerformanceEmoji = (percentage) => {
    if (percentage >= 90) return '🎉';
    if (percentage >= 80) return '👏';
    if (percentage >= 70) return '👍';
    if (percentage >= 60) return '📈';
    return '💪';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* نتيجة عامة */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">
              {getPerformanceEmoji(result.result.score.percentage)}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              نتيجة الكويز
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {result.result.quiz.title}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className={`text-4xl font-bold mb-2 ${getGradeColor(result.result.score.percentage)}`}>
                {result.result.score.percentage}%
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">النسبة المئوية</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {result.result.score.earnedPoints}/{result.result.score.totalPoints}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">النقاط</div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {result.result.score.correctAnswers}/{result.result.score.totalQuestions}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">الإجابات الصحيحة</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">التقدير</h3>
              <div className={`text-xl font-bold ${getGradeColor(result.result.score.percentage)}`}>
                {result.result.grade.letter} - {result.result.grade.description}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">الوقت المستغرق</h3>
              <div className="text-xl font-bold text-gray-900 dark:text-white">
                {result.result.timeSpent.display}
              </div>
            </div>
          </div>

          {result.result.motivationalMessage && (
            <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg text-center">
              <p className="text-primary-800 dark:text-primary-200 font-medium">
                {result.result.motivationalMessage}
              </p>
            </div>
          )}
        </div>

        {/* تفاصيل الإجابات */}
        {/* <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            تفاصيل الإجابات
          </h2>

          <div className="space-y-6">
            {result.answers.map((answer, index) => (
              <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    السؤال {answer.questionIndex}
                  </h3>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    {answer.isCorrect ? (
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <span className="ml-1">✅</span>
                        صحيح
                      </span>
                    ) : (
                      <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                        <span className="ml-1">❌</span>
                        خطأ
                      </span>
                    )}
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {answer.pointsEarned}/{answer.maxPoints} نقطة
                    </span>
                  </div>
                </div> */}

                {/* عرض نص السؤال كصورة إذا كان لينك صورة أو Google Drive، أو كنص إذا لم يكن كذلك */}
                {/* {isImageUrl(answer.questionText) && !(imgErrors[index]) ? (
                  <div className="flex flex-col items-center my-4">
                    <img
                      src={getDisplayImageUrl(answer.questionText)}
                      alt={`سؤال ${answer.questionIndex}`}
                      className="max-w-full max-h-96 rounded-lg border-2 border-primary-400 dark:border-primary-700 shadow mb-2"
                      loading="lazy"
                      onError={() => handleImgError(index)}
                    />
                  </div>
                ) : imgErrors[index] ? (
                  <div className="my-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-center border border-red-300 dark:border-red-700">
                    <span className="text-red-700 dark:text-red-200 font-medium">تعذر تحميل صورة السؤال، يرجى مراجعة الرابط.</span>
                  </div>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {answer.questionText}
                  </p>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">إجابتك:</span>
                    <p className={`font-medium ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {answer.userAnswer || 'لم يتم الإجابة'}
                    </p>
                  </div>
                  {!answer.isCorrect && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">الإجابة الصحيحة:</span>
                      <p className="font-medium text-green-600">
                        {answer.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>

                {answer.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                      التفسير: {answer.explanation}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div> */}

        {/* إحصائيات */}
        {/* {result.statistics && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              الإحصائيات
            </h2>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.statistics.totalQuestions}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">إجمالي الأسئلة</div>
              </div>

              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.statistics.correctAnswers}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">إجابات صحيحة</div>
              </div>

              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.statistics.incorrectAnswers}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">إجابات خاطئة</div>
              </div>

              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.statistics.accuracyRate}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">معدل الدقة</div>
              </div>
            </div>
          </div>
        )} */}

        {/* أزرار الإجراءات */}
        <div className="text-center space-y-4">
          <button
            onClick={onBackToGrades}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200 flex items-center mx-auto"
          >
            <span className="ml-2">📚</span>
            العودة للمواد
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;