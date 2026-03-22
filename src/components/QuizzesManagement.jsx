import React, { useState, useEffect } from 'react';
import { getQuizzes, createQuiz, updateQuiz, deleteQuiz } from '../api/quizzes.js';
import { gradeMapping } from '../utils/gradeMapping.js';

const QuizzesManagement = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    timeLimit: 30,
    totalMarks: 100,
    questions: []
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await getQuizzes();
      // Handle the API response structure
      if (response && response.data) {
        setQuizzes(response.data);
      } else if (Array.isArray(response)) {
        setQuizzes(response);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error('خطأ في جلب الكويزات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    try {
      // تجهيز الأسئلة والخيارات بالشكل المطلوب للباك اند
      const preparedQuestions = formData.questions.map(q => {
        let prepared = { ...q };
        if (q.type === 'اختر من متعدد') {
          prepared.options = q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === q.correctAnswer
          }));
          // لا ترسل correctAnswer مباشرة
          delete prepared.correctAnswer;
        } else if (q.type === 'صح وخطأ') {
          // correctAnswer كـ boolean فقط
          prepared.correctAnswer = q.correctAnswer === 0 ? true : false;
          prepared.options = [];
        }
        return prepared;
      });
      const dataToSend = {
        ...formData,
        questions: preparedQuestions
      };
      console.log('📤 البيانات المرسلة:', dataToSend);
      await createQuiz(dataToSend);
      setFormData({ title: '', description: '', subject: '', grade: '', timeLimit: 30, totalMarks: 100, questions: [] });
      setShowCreateForm(false);
      fetchQuizzes();
    } catch (error) {
      console.error('خطأ في إنشاء الكويز:', error);
    }
  };

  const handleUpdateQuiz = async (e) => {
    e.preventDefault();
    try {
      // تجهيز الأسئلة والخيارات بالشكل المطلوب للباك اند
      const preparedQuestions = formData.questions.map(q => {
        let prepared = { ...q };
        if (q.type === 'اختر من متعدد') {
          prepared.options = q.options.map((opt, idx) => ({
            text: opt,
            isCorrect: idx === q.correctAnswer
          }));
          delete prepared.correctAnswer;
        } else if (q.type === 'صح وخطأ') {
          prepared.correctAnswer = q.correctAnswer === 0 ? true : false;
          prepared.options = [];
        }
        return prepared;
      });
      const dataToSend = {
        ...formData,
        questions: preparedQuestions
      };
      console.log('📤 البيانات المرسلة:', dataToSend);
      await updateQuiz(editingQuiz._id, dataToSend);
      setEditingQuiz(null);
      setFormData({ title: '', description: '', subject: '', grade: '', timeLimit: 30, totalMarks: 100, questions: [] });
      fetchQuizzes();
    } catch (error) {
      console.error('خطأ في تحديث الكويز:', error);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الكويز؟')) {
      try {
        await deleteQuiz(quizId);
        fetchQuizzes();
      } catch (error) {
        console.error('خطأ في حذف الكويز:', error);
      }
    }
  };

  const startEditing = (quiz) => {
    setEditingQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      subject: quiz.subject || '',
      grade: quiz.grade,
      timeLimit: quiz.timeLimit || 30,
      totalMarks: quiz.totalMarks || 100,
      questions: (quiz.questions || []).map(q => {
        let correctIdx;
        let opts = [];
        if (q.type === 'اختر من متعدد') {
          opts = Array.isArray(q.options) ? q.options.map(opt => (typeof opt === 'object' && opt !== null && 'text' in opt ? opt.text : opt)) : [];
          correctIdx = Array.isArray(q.options) ? q.options.findIndex(opt => (typeof opt === 'object' && opt !== null && opt.isCorrect === true)) : 0;
        } else if (q.type === 'صح وخطأ') {
          opts = ['صح', 'خطأ'];
          correctIdx = q.correctAnswer === true ? 0 : 1;
        }
        return {
          ...q,
          options: opts,
          correctAnswer: correctIdx >= 0 ? correctIdx : 0
        };
      })
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', grade: '', timeLimit: 30, totalMarks: 100, questions: [] });
    setShowCreateForm(false);
    setEditingQuiz(null);
  };

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionText: '',
      type: 'اختر من متعدد',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      points: 5
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    // إذا تم تغيير النوع، عدل الخيارات تلقائياً
    if (field === 'type') {
      if (value === 'اختر من متعدد') {
        updatedQuestions[index].options = ['A', 'B', 'C', 'D'];
        updatedQuestions[index].correctAnswer = 0;
      } else if (value === 'صح وخطأ') {
        updatedQuestions[index].options = ['صح', 'خطأ'];
        updatedQuestions[index].correctAnswer = 0;
      }
    }
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const updateQuestionOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="mr-3 text-gray-600 dark:text-gray-400">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الكويزات</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse transition-colors duration-200"
        >
          <span>➕</span>
          <span>إضافة كويز جديد</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingQuiz ? 'تحرير الكويز' : 'إضافة كويز جديد'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={editingQuiz ? handleUpdateQuiz : handleCreateQuiz} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المادة
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عنوان الكويز
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الصف الدراسي
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">اختر الصف</option>
                  {Object.keys(gradeMapping).map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  الوقت المحدد (دقيقة)
                </label>
                <input
                  type="number"
                  value={formData.timeLimit}
                  onChange={(e) => setFormData({ ...formData, timeLimit: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="5"
                  max="180"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  إجمالي الدرجات
                </label>
                <input
                  type="number"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="10"
                  max="500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف الكويز
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Questions Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">الأسئلة</h4>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  ➕ إضافة سؤال
                </button>
              </div>

              {formData.questions.map((question, questionIndex) => (
                <div key={question.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="font-semibold text-gray-900 dark:text-white">السؤال {questionIndex + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeQuestion(questionIndex)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="space-y-3">

                    <input
                      type="text"
                      placeholder="نص السؤال (يمكنك وضع لينك صورة أو نص عادي)"
                      value={question.questionText}
                      onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />

                    {/* عرض صورة إذا كان نص السؤال لينك صورة */}
                    {/^https?:\/\/.*\.(png|jpg|jpeg|gif|webp)$/i.test(question.questionText.trim()) && (
                      <div className="my-2 flex justify-center">
                        <img src={question.questionText.trim()} alt="سؤال صورة" className="max-h-48 rounded border" />
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع السؤال</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      >
                        <option value="اختر من متعدد">اختر من متعدد</option>
                        <option value="صح وخطأ">صح وخطأ</option>
                      </select>
                    </div>

                    {question.type === 'اختر من متعدد' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {['A', 'B', 'C', 'D'].map((label, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                              className="text-purple-600"
                            />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{label}.</span>
                            <input
                              type="text"
                              placeholder={`الخيار ${label}`}
                              value={question.options[optionIndex]}
                              onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {question.type === 'صح وخطأ' && (
                      <div className="grid grid-cols-2 gap-2">
                        {['صح', 'خطأ'].map((label, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2 space-x-reverse">
                            <input
                              type="radio"
                              name={`correct-${questionIndex}`}
                              checked={question.correctAnswer === optionIndex}
                              onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                              className="text-purple-600"
                            />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <input
                      type="number"
                      placeholder="نقاط السؤال"
                      value={question.points}
                      onChange={(e) => updateQuestion(questionIndex, 'points', parseInt(e.target.value) || 1)}
                      className="w-24 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      min="1"
                      max="50"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {editingQuiz ? 'حفظ التغييرات' : 'إنشاء الكويز'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quizzes List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">قائمة الكويزات</h3>
        </div>

        {quizzes.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl mb-4 block">🧠</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">لا توجد كويزات</h3>
            <p className="text-gray-600 dark:text-gray-400">قم بإضافة كويز جديد للطلاب</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    العنوان
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الصف
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    عدد الأسئلة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الوقت المحدد
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الدرجات
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {quizzes.map((quiz) => (
                  <tr key={quiz.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {quiz.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {quiz.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {quiz.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {quiz.questions?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {quiz.timeLimit || 30} دقيقة
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {quiz.totalMarks || 100}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                      <button
                        onClick={() => startEditing(quiz)}
                        className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        ✏️ تحرير
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz._id || quiz.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        🗑️ حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizzesManagement;