import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/tasks.js';
import { gradeMapping } from '../utils/gradeMapping.js';

const TasksManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade: '',
    dueDate: '',
    points: 10,
    questions: []
  });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      // Handle the API response structure
      if (response && response.data) {
        setTasks(response.data);
      } else if (Array.isArray(response)) {
        setTasks(response);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('خطأ في جلب المهام:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setErrors([]);
    try {
      // تجهيز الأسئلة بالشكل المطلوب للباك اند
      const preparedQuestions = (formData.questions || []).map(q => {
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
      await createTask(dataToSend);
      setFormData({ title: '', description: '', subject: '', grade: '', dueDate: '', points: 10, questions: [] });
      setShowCreateForm(false);
      fetchTasks();
    } catch (error) {
      // استخراج الأخطاء من السيرفر إن وجدت
      let serverErrors = [];
      if (error.response && error.response.data && error.response.data.errors) {
        serverErrors = error.response.data.errors;
      } else if (error.message) {
        serverErrors = [{ field: '', message: error.message }];
      } else {
        serverErrors = [{ field: '', message: 'حدث خطأ غير متوقع' }];
      }
      setErrors(serverErrors);
      console.error('خطأ في إنشاء المهمة:', error);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      // تجهيز الأسئلة بالشكل المطلوب للباك اند
      const preparedQuestions = (formData.questions || []).map(q => {
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
      await updateTask(editingTask._id || editingTask.id, dataToSend);
      setEditingTask(null);
      setFormData({ title: '', description: '', subject: '', grade: '', dueDate: '', points: 10, questions: [] });
      fetchTasks();
    } catch (error) {
      console.error('خطأ في تحديث المهمة:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('هل أنت متأكد من حذف هذه المهمة؟')) {
      try {
        await deleteTask(taskId);
        fetchTasks();
      } catch (error) {
        console.error('خطأ في حذف المهمة:', error);
      }
    }
  };

  const startEditing = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      subject: task.subject || '',
      grade: task.grade,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      points: task.points || 10,
      questions: (task.questions || []).map(q => {
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
  // إدارة الأسئلة (إضافة/تعديل/حذف)
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      questionText: '',
      type: 'اختر من متعدد',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 0,
      points: 1
    };
    setFormData({
      ...formData,
      questions: [...(formData.questions || []), newQuestion]
    });
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
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

  const resetForm = () => {
    setFormData({ title: '', description: '', subject: '', grade: '', dueDate: '', points: 10 });
    setShowCreateForm(false);
    setEditingTask(null);
    setErrors([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600 dark:text-gray-400">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة المهام</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 space-x-reverse transition-colors duration-200"
        >
          <span>➕</span>
          <span>إضافة مهمة جديدة</span>
        </button>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingTask ? 'تحرير المهمة' : 'إضافة مهمة جديدة'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* عرض الأخطاء القادمة من السيرفر */}
          {errors.length > 0 && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded p-3">
              <ul className="list-disc pr-5 text-red-700 dark:text-red-200 text-sm">
                {errors.map((err, idx) => (
                  <li key={idx}>{err.message}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  عنوان المهمة
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  المادة
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  تاريخ التسليم
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  النقاط
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="1"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                وصف المهمة
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* إدارة الأسئلة */}
            <div className="mt-6">
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
              {(formData.questions || []).map((question, questionIndex) => (
                <div key={question.id || questionIndex} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 mb-4">
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
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نوع السؤال</label>
                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(questionIndex, 'type', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                              className="text-blue-600"
                            />
                            <span className="font-bold text-gray-700 dark:text-gray-300">{label}.</span>
                            <input
                              type="text"
                              placeholder={`الخيار ${label}`}
                              value={question.options[optionIndex]}
                              onChange={(e) => updateQuestionOption(questionIndex, optionIndex, e.target.value)}
                              className="flex-1 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
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
                              className="text-blue-600"
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
                      className="w-24 p-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                      min="1"
                      max="10"
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
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                {editingTask ? 'حفظ التغييرات' : 'إنشاء المهمة'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">قائمة المهام</h3>
        </div>

        {tasks.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl mb-4 block">📝</span>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">لا توجد مهام</h3>
            <p className="text-gray-600 dark:text-gray-400">قم بإضافة مهمة جديدة للطلاب</p>
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
                    تاريخ التسليم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    النقاط
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {task.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {task.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {task.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-EG') : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {task.points || 10}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                      <button
                        onClick={() => startEditing(task)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        ✏️ تحرير
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id || task.id)}
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

export default TasksManagement;