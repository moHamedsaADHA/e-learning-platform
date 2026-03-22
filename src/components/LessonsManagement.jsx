import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getLessons, createLesson, updateLesson, deleteLesson } from '../api/lessons.js';

const LessonsManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [formData, setFormData] = useState({
    grade: '',
    unitTitle: '',
    lessonTitle: '',
    videoUrl: ''
  });

  const grades = [
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي علمي',
    'الصف الثاني الثانوي ادبي',
    'الصف الثالث الثانوي علمي',
    'الصف الثالث الثانوي ادبي'
  ];

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await getLessons();
      // Handle the API response structure
      if (response && response.lessons) {
        setLessons(response.lessons);
      } else if (Array.isArray(response)) {
        setLessons(response);
      } else {
        setLessons([]);
      }
    } catch (error) {
      console.error('خطأ في جلب الدروس:', error);
      alert('فشل في جلب الدروس');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.grade || !formData.unitTitle || !formData.lessonTitle || !formData.videoUrl) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      const lessonData = {
        ...formData,
        createdBy: user.id
      };

      if (editingLesson) {
        await updateLesson(editingLesson._id, lessonData);
        alert('تم تحديث الدرس بنجاح');
      } else {
        await createLesson(lessonData);
        alert('تم إنشاء الدرس بنجاح');
      }

      setShowModal(false);
      setEditingLesson(null);
      setFormData({ grade: '', unitTitle: '', lessonTitle: '', videoUrl: '' });
      fetchLessons();
    } catch (error) {
      console.error('خطأ في حفظ الدرس:', error);
      alert(editingLesson ? 'فشل في تحديث الدرس' : 'فشل في إنشاء الدرس');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      grade: lesson.grade,
      unitTitle: lesson.unitTitle,
      lessonTitle: lesson.lessonTitle,
      videoUrl: lesson.videoUrl
    });
    setShowModal(true);
  };

  const handleDelete = async (lessonId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الدرس؟')) return;

    try {
      setLoading(true);
      await deleteLesson(lessonId);
      alert('تم حذف الدرس بنجاح');
      fetchLessons();
    } catch (error) {
      console.error('خطأ في حذف الدرس:', error);
      alert('فشل في حذف الدرس');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ grade: '', unitTitle: '', lessonTitle: '', videoUrl: '' });
    setEditingLesson(null);
    setShowModal(false);
  };

  if (loading && lessons.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جاري التحميل...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الدروس</h2>
          <p className="text-gray-600 dark:text-gray-400">إدارة دروس جميع الصفوف</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 space-x-reverse"
        >
          <span>➕</span>
          <span>إضافة درس جديد</span>
        </button>
      </div>

      {/* Lessons Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الصف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الوحدة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  عنوان الدرس
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {lessons.length > 0 ? (
                lessons.map((lesson) => (
                  <tr key={lesson._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {lesson.grade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {lesson.unitTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {lesson.lessonTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                      <button
                        onClick={() => handleEdit(lesson)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(lesson._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد دروس متاحة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingLesson ? 'تعديل الدرس' : 'إضافة درس جديد'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصف *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">اختر الصف</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  عنوان الوحدة *
                </label>
                <input
                  type="text"
                  value={formData.unitTitle}
                  onChange={(e) => setFormData({ ...formData, unitTitle: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: الجبر والهندسة"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  عنوان الدرس *
                </label>
                <input
                  type="text"
                  value={formData.lessonTitle}
                  onChange={(e) => setFormData({ ...formData, lessonTitle: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: المعادلات التربيعية"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  رابط الفيديو *
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : editingLesson ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonsManagement;