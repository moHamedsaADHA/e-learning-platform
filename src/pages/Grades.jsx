import React, { useEffect, useState } from 'react';
import CourseCard from '../components/CourseCard.jsx';
import { publicApi } from '../api/publicApi.js';

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setLoading(true);
        // محاولة جلب البيانات من API
        const gradesData = await publicApi.getAllGrades();
        setGrades(gradesData || []);
      } catch (err) {
        console.log('API غير متاح، استخدام البيانات الافتراضية:', err);
        // في حالة فشل API، استخدم البيانات الافتراضية
        setGrades([
          { name: 'الصف الأول الثانوي', description: 'دروس شاملة للصف الأول الثانوي', lessonCount: 24 },
          { name: 'الصف الثاني الثانوي علمي', description: 'دروس الرياضيات للثاني العلمي', lessonCount: 32 },
          { name: 'الصف الثاني الثانوي ادبي', description: 'دروس الرياضيات للثاني الأدبي', lessonCount: 28 },
          { name: 'الصف الثالث الثانوي علمي', description: 'دروس الرياضيات للثالث العلمي', lessonCount: 40 },
          { name: 'الصف الثالث الثانوي ادبي', description: 'دروس الرياضيات للثالث الأدبي', lessonCount: 36 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">الكورسات المتاحة</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">اختر الصف الدراسي الخاص بك وابدأ رحلة التعلم</p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mt-4"></div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 ml-3"></div>
            <span className="text-gray-600 dark:text-gray-400">جاري التحميل...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">❌</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">حدث خطأ</h3>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {grades.map(grade => (
              <CourseCard
                key={grade.name || grade}
                grade={grade.name || grade}
                description={grade.description}
                lessonCount={grade.lessonCount || 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Grades;