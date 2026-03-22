import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getSchedule, createSchedule, updateSchedule, deleteSchedule } from '../api/schedule.js';

const ScheduleManagement = () => {
  const { user } = useSelector(state => state.auth);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [formData, setFormData] = useState({
    day: '',
    subject: 'رياضيات',
    date: '',
    timeFrom: '',
    timeTo: '',
    grade: '',
    instructor: user?.id || ''
  });

  const grades = [
    'الصف الأول الثانوي',
    'الصف الثاني الثانوي علمي',
    'الصف الثاني الثانوي ادبي',
    'الصف الثالث الثانوي علمي',
    'الصف الثالث الثانوي ادبي'
  ];

  const days = [
    'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 
    'الخميس', 'الجمعة', 'السبت'
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await getSchedule();
      // Handle the API response structure
      if (response && response.schedules) {
        setSchedules(response.schedules);
      } else if (Array.isArray(response)) {
        setSchedules(response);
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error('خطأ في جلب الجداول:', error);
      alert('فشل في جلب الجداول');
    } finally {
      setLoading(false);
    }
  };

  // دالة لمعالجة أخطاء التحقق من صحة البيانات
  const handleValidationErrors = (error) => {
    console.log('Full error object:', error);
    console.log('Error response:', error.response);
    console.log('Error data:', error.response?.data);
    
    // التحقق من وجود أخطاء التحقق في البيانات
    const errorData = error.response?.data;
    
    // التحقق من وجود errors array في البيانات
    if (errorData && errorData.errors && Array.isArray(errorData.errors)) {
      const errors = {};
      errorData.errors.forEach(err => {
        errors[err.path] = err.msg;
      });
      setValidationErrors(errors);
      
      // إنشاء رسالة موحدة للأخطاء
      const errorMessages = errorData.errors.map(err => err.msg);
      setError(errorMessages.join('. '));
      return true;
    }
    
    // التحقق من وجود رسالة خطأ مباشرة
    if (errorData && errorData.message) {
      setError(errorData.message);
      return true;
    }
    
    return false;
  };

  // دالة لمسح الأخطاء
  const clearErrors = () => {
    setError(null);
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors(); // مسح الأخطاء السابقة
    
    if (!formData.day || !formData.subject || !formData.date || !formData.timeFrom || !formData.timeTo || !formData.grade) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من صحة التوقيت
    const timeFromMinutes = formData.timeFrom.split(':').reduce((h, m) => h * 60 + +m);
    const timeToMinutes = formData.timeTo.split(':').reduce((h, m) => h * 60 + +m);
    
    if (timeFromMinutes >= timeToMinutes) {
      setError('وقت البداية يجب أن يكون قبل وقت النهاية');
      return;
    }

    try {
      setLoading(true);
      const scheduleData = {
        ...formData,
        createdBy: user.id,
        instructor: user.id
      };

      if (editingSchedule) {
        await updateSchedule(editingSchedule._id, scheduleData);
        setError(null);
        alert('تم تحديث الجدول بنجاح');
      } else {
        await createSchedule(scheduleData);
        setError(null);
        alert('تم إنشاء الجدول بنجاح');
      }

      setShowModal(false);
      setEditingSchedule(null);
      setFormData({
        day: '',
        subject: 'رياضيات',
        date: '',
        timeFrom: '',
        timeTo: '',
        grade: '',
        instructor: user?.id || ''
      });
      fetchSchedules();
    } catch (error) {
      console.error('خطأ في حفظ الجدول:', error);
      console.error('Error response:', error.response);
      console.error('Error data:', error.response?.data);
      
      // معالجة أخطاء التحقق من صحة البيانات
      if (!handleValidationErrors(error)) {
        // إذا لم تكن أخطاء تحقق، اعرض رسالة خطأ عامة
        const errorMsg = error.response?.data?.message || error.message || 'خطأ غير معروف';
        setError(`${editingSchedule ? 'فشل في تحديث الجدول' : 'فشل في إنشاء الجدول'}: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule) => {
    clearErrors(); // مسح الأخطاء
    setEditingSchedule(schedule);
    const scheduleDate = new Date(schedule.date);
    setFormData({
      day: schedule.day,
      subject: schedule.subject,
      date: scheduleDate.toISOString().split('T')[0],
      timeFrom: schedule.timeFrom,
      timeTo: schedule.timeTo,
      grade: schedule.grade,
      instructor: schedule.instructor
    });
    setShowModal(true);
  };

  const handleOpenModal = () => {
    clearErrors(); // مسح الأخطاء
    setEditingSchedule(null);
    setFormData({
      day: '',
      subject: 'رياضيات',
      date: '',
      timeFrom: '',
      timeTo: '',
      grade: '',
      instructor: user?.id || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    clearErrors(); // مسح الأخطاء
    setShowModal(false);
    setEditingSchedule(null);
  };

  const handleDelete = async (scheduleId) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجدول؟')) return;

    try {
      setLoading(true);
      await deleteSchedule(scheduleId);
      alert('تم حذف الجدول بنجاح');
      fetchSchedules();
    } catch (error) {
      console.error('خطأ في حذف الجدول:', error);
      alert('فشل في حذف الجدول');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    handleCloseModal();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const groupSchedulesByGrade = () => {
    return schedules.reduce((acc, schedule) => {
      const grade = schedule.grade;
      if (!acc[grade]) {
        acc[grade] = [];
      }
      acc[grade].push(schedule);
      return acc;
    }, {});
  };

  if (loading && schedules.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="mr-3 text-gray-600">جاري التحميل...</span>
      </div>
    );
  }

  const groupedSchedules = groupSchedulesByGrade();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">إدارة الجدول الدراسي</h2>
          <p className="text-gray-600 dark:text-gray-400">إدارة جداول جميع الصفوف</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 space-x-reverse"
        >
          <span>➕</span>
          <span>إضافة حصة جديدة</span>
        </button>
      </div>

      {/* Schedules by Grade */}
      {Object.keys(groupedSchedules).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedSchedules).map(([grade, gradeSchedules]) => (
            <div key={grade} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="bg-purple-600 text-white px-6 py-3">
                <h3 className="text-lg font-semibold">{grade}</h3>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        اليوم
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        المادة
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        التوقيت
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {gradeSchedules
                      .sort((a, b) => new Date(a.date) - new Date(b.date))
                      .map((schedule) => (
                      <tr key={schedule._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {schedule.day}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {schedule.subject}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(schedule.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {schedule.timeFrom} - {schedule.timeTo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                          <button
                            onClick={() => handleEdit(schedule)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete(schedule._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <span className="text-4xl mb-4 block">📅</span>
          <p>لا توجد جداول متاحة</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {editingSchedule ? 'تعديل الحصة' : 'إضافة حصة جديدة'}
              </h3>
            </div>

            {/* عرض الأخطاء */}
            {error && (
              <div className="mx-6 mt-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-red-400 ml-2">❌</span>
                  <p className="text-sm text-red-800 dark:text-red-200 font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  اليوم *
                </label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">اختر اليوم</option>
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  المادة *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="مثال: رياضيات"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  التاريخ *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                    validationErrors.date 
                      ? 'border-red-500 dark:border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  required
                />
                {validationErrors.date && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <span className="ml-1">⚠️</span>
                    {validationErrors.date}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    من *
                  </label>
                  <input
                    type="time"
                    value={formData.timeFrom}
                    onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    إلى *
                  </label>
                  <input
                    type="time"
                    value={formData.timeTo}
                    onChange={(e) => setFormData({ ...formData, timeTo: e.target.value })}
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  الصف *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">اختر الصف</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
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
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? 'جاري الحفظ...' : editingSchedule ? 'تحديث' : 'إضافة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleManagement;